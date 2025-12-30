import { supabase } from './client';
import { rawSupabaseUrl, publicAnonKey } from './info';

// Narrowed payload shapes for progress to avoid wide `any`
export type ModuleDetailedProgressPayload = {
  completedLessons?: string[];
  completedExercises?: string[];
  projectCompleted?: boolean;
  exerciseCodes?: { [exerciseId: string]: string };
  projectCode?: string;
  lessonOrder?: string[];
  unlockedLessons?: string[];
  unlockedExercises?: string[];
  completed?: boolean;
};

export type UserProgressPayload = {
  moduleProgress?: { [moduleId: string]: number | ModuleDetailedProgressPayload };
  completedModules?: string[];
  assessments?: any[];
  dailyActivity?: { [date: string]: any };
  lastUpdated?: string;
  total_xp?: number;
  [k: string]: any;
};

function deepMergeProgress(a: UserProgressPayload | null | undefined, b: UserProgressPayload | null | undefined): UserProgressPayload {
  const left = a || { moduleProgress: {}, completedModules: [], assessments: [], dailyActivity: {} };
  const right = b || { moduleProgress: {}, completedModules: [], assessments: [], dailyActivity: {} };
  const out: UserProgressPayload = { ...left };
  out.lastUpdated = (right.lastUpdated as string) || (left.lastUpdated as string) || new Date().toISOString();
  out.dailyActivity = { ...(left.dailyActivity || {}), ...(right.dailyActivity || {}) };
  out.moduleProgress = { ...(left.moduleProgress || {}) };
  for (const [modId, val] of Object.entries(right.moduleProgress || {})) {
    const existing = out.moduleProgress![modId];
    if (!existing) { out.moduleProgress![modId] = val; continue; }
    const e = (typeof existing === 'number') ? {} as ModuleDetailedProgressPayload : (existing as ModuleDetailedProgressPayload);
    const n = (typeof val === 'number') ? {} as ModuleDetailedProgressPayload : (val as ModuleDetailedProgressPayload);
    out.moduleProgress![modId] = {
      completedLessons: Array.from(new Set([...(e.completedLessons || []), ...(n.completedLessons || [])])),
      completedExercises: Array.from(new Set([...(e.completedExercises || []), ...(n.completedExercises || [])])),
      projectCompleted: !!(e.projectCompleted || n.projectCompleted),
      exerciseCodes: { ...(e.exerciseCodes || {}), ...(n.exerciseCodes || {}) },
      projectCode: n.projectCode || e.projectCode,
      lessonOrder: n.lessonOrder || e.lessonOrder,
      unlockedLessons: Array.from(new Set([...(e.unlockedLessons || []), ...(n.unlockedLessons || [])])),
      unlockedExercises: Array.from(new Set([...(e.unlockedExercises || []), ...(n.unlockedExercises || [])]))
    } as ModuleDetailedProgressPayload;
  }
  out.completedModules = Array.from(new Set([...(left.completedModules || []), ...(right.completedModules || [])]));
  out.assessments = [...(left.assessments || []), ...(right.assessments || [])];
  return out;
}

/**
 * Safely upsert `user_progress` row for given `user_id`.
 * - Attempts `.upsert(..., { onConflict: ['user_id'] }).select().maybeSingle()`
 * - On 409/conflict falls back to `.update(...).eq('user_id', user_id).select().maybeSingle()`
 * - If `merge` is true, fetches server row and deep-merges JSON `progress` before persisting.
 */
export async function safeUpsertUserProgress(userId: string, progress: UserProgressPayload, opts?: { merge?: boolean; retries?: number; last_updated?: string }) {
  const merge = !!opts?.merge;
  const retries = typeof opts?.retries === 'number' ? opts.retries : 3;

  let toPersist: UserProgressPayload = progress || {};
  if (merge) {
    try {
      const existing = await supabase.from('user_progress').select('progress, last_updated').eq('user_id', userId).maybeSingle();
      console.debug('[safeUpsertUserProgress] fetched existing server row for merge', { userId, existing });
      const existingProgress = existing?.data?.progress ?? null;
      // server can store JSON string or object
      const parsedExisting = typeof existingProgress === 'string' ? JSON.parse(existingProgress as string) : (existingProgress as UserProgressPayload | null);
      toPersist = deepMergeProgress(parsedExisting, progress);
      if (opts?.last_updated) toPersist.lastUpdated = opts.last_updated;
      console.debug('[safeUpsertUserProgress] merged progress to persist', { userId, toPersist });
    } catch (e) {
      // ignore fetch errors and proceed to persist supplied progress
    }
  }

  const payload: { user_id: string; progress: UserProgressPayload; last_updated?: string } = { user_id: userId, progress: toPersist, last_updated: opts?.last_updated || new Date().toISOString() };

  let attempt = 0;
  let lastErr: any = null;
  while (attempt < retries) {
    attempt += 1;
    try {
      console.debug('[safeUpsertUserProgress] attempt', attempt, 'upserting for', userId, 'payloadPreview', { userId: payload.user_id, last_updated: payload.last_updated });
      const res = await supabase.from('user_progress').upsert(payload, { onConflict: ['user_id'] }).select().maybeSingle();
      if (res?.error) throw res.error;
      console.debug('[safeUpsertUserProgress] upsert success for', userId);
      return res?.data ?? null;
    } catch (err: any) {
      lastErr = err;
      const status = err?.status || err?.statusCode || err?.code;
      const msg = String(err?.message || err || '');
      console.warn('[safeUpsertUserProgress] upsert failed', { userId, attempt, status, message: msg });

      // Detect Postgres foreign-key violation (missing user_profiles row)
      // Postgres error code for FK violation is '23503'
      if (String(status) === '23503' || /violates foreign key constraint/i.test(msg)) {
        console.warn('[safeUpsertUserProgress] foreign-key violation detected for user:', userId);
        const fkErr: any = new Error('FK_MISSING_PROFILE');
        fkErr.code = 'FK_MISSING_PROFILE';
        fkErr.userId = userId;
        fkErr.original = err;
        throw fkErr;
      }

      // If server reports conflict/unique despite upsert, try explicit update fallback
      if (status === 409 || /unique|duplicate|conflict/i.test(msg)) {
        console.warn('[safeUpsertUserProgress] conflict detected, attempting update fallback for', userId);
        try {
          const upd = await supabase.from('user_progress').update({ progress: payload.progress, last_updated: payload.last_updated }).eq('user_id', userId).select().maybeSingle();
          if (upd?.error) throw upd.error;
          console.debug('[safeUpsertUserProgress] update fallback success for', userId, { updated: upd?.data });
          return upd?.data ?? null;
        } catch (uerr) {
          lastErr = uerr;
          console.warn('[safeUpsertUserProgress] update fallback failed', { userId, error: uerr });
          // if update failed due to retryable server error, allow retry loop
        }
      }

      // If server says there was no API key, try a manual fetch attaching the anon key
      if (/no api key found/i.test(msg) || /no `apikey` request header/i.test(msg)) {
        console.warn('[safeUpsertUserProgress] detected missing API key in Supabase response; attempting REST fallback with anon key');
        try {
          const url = `${rawSupabaseUrl.replace(/\/$/, '')}/rest/v1/user_progress?on_conflict=user_id&select=*`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: publicAnonKey || '',
              Authorization: `Bearer ${publicAnonKey || ''}`
            },
            body: JSON.stringify(payload)
          });

          const j = await resp.json().catch(() => null);
          if (!resp.ok) {
            // If conflict, try PATCH update
            if (resp.status === 409) {
              console.warn('[safeUpsertUserProgress] REST upsert returned 409, attempting REST PATCH update for', userId);
              const updUrl = `${rawSupabaseUrl.replace(/\/$/, '')}/rest/v1/user_progress?user_id=eq.${encodeURIComponent(userId)}&select=*`;
              const updResp = await fetch(updUrl, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  apikey: publicAnonKey || '',
                  Authorization: `Bearer ${publicAnonKey || ''}`
                },
                body: JSON.stringify({ progress: payload.progress, last_updated: payload.last_updated })
              });
              const uj = await updResp.json().catch(() => null);
              if (updResp.ok) return Array.isArray(uj) ? uj[0] : uj;
              throw new Error(`REST update failed: ${updResp.status}`);
            }
            throw new Error(`REST upsert failed: ${resp.status}`);
          }

          // PostgREST returns an array representation for insert/upsert; return first element when present
          if (Array.isArray(j)) return j[0] ?? null;
          return j ?? null;
        } catch (restErr) {
          lastErr = restErr;
          console.error('[safeUpsertUserProgress] REST fallback failed', { userId, error: restErr });
        }
      }

      // Retry only on retryable status codes (5xx) or network-like messages
      const isRetryable = (typeof status === 'number' && status >= 500) || /timeout|network|fetch|networkerror/i.test(msg);
      if (!isRetryable) break;

      const backoff = 200 * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }
  }

  throw lastErr || new Error('safeUpsertUserProgress failed');
}

export default safeUpsertUserProgress;
