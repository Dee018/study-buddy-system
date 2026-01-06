import { supabase } from './supabase/client';
import safeUpsertUserProgress from './supabase/safeProgressUpsert';
import prepareLessonCompletionsForInsert from './supabase/lessonCompletionsUpsert';

// Small UUID v4 helper used when inserting rows that require explicit ids
function generateUUIDv4() {
  try {
    if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') return (crypto as any).randomUUID();
  } catch { /* ignore */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


export type ModuleDetailedProgress = {
  completedLessons: string[];
  completedExercises: string[];
  projectCompleted: boolean;
  exerciseCodes?: { [exerciseId: string]: string };
  projectCode?: string;
  lessonOrder?: string[];
  unlockedLessons?: string[];
  unlockedExercises?: string[];
  completed?: boolean;
};

export type UserProgress = {
  lastUpdated?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string;
  dailyActivity?: { [date: string]: any };
  // Module progress may be a numeric percentage (legacy) or detailed object
  moduleProgress: { [moduleId: string]: number | ModuleDetailedProgress };
  completedModules: string[];
  total_xp?: number;
  lessons_completed?: number;
  exercises_completed?: number;
  projects_completed?: number;
  assessments?: any[];
  level?: number;
};

export type ProgressEvent = {
  type: 'local-update' | 'saved' | 'failed' | 'progress-updated';
  userId: string | 'all';
  moduleId?: string;
  progress?: UserProgress;
  error?: string;
  timestamp?: string;
  xp?: number;
};

export type ProgressEventType = ProgressEvent['type'];

export type ProgressSnapshot = {
  userId: string;
  timestamp: string;
  completedModules: string[];
  completedLessons: { [moduleId: string]: string[] };
  completedExercises: { [moduleId: string]: string[] };
  completedProjects: string[];
  totalXP: number;
  assessmentResults: number;
  currentStreak: number;
};

type PendingEntry = { progress: UserProgress; attempts: number; lastError?: any };

export class ProgressSyncManager {
  private static uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  private static isUUID(v?: string | null): boolean {
    if (!v || typeof v !== 'string') return false;
    return this.uuidRegex.test(v);
  }
  private static cache: Map<string, UserProgress> = new Map();
  private static pending: Map<string, PendingEntry> = new Map();
  private static queue: string[] = [];
  private static processing = false;
  private static listeners: Set<(e: ProgressEvent) => void> = new Set();

  // Typed declaration for the runtime-assigned persistCompletions property
  static persistCompletions: (userId: string, progress: UserProgress) => Promise<void>;

  static subscribe(cb: (e: ProgressEvent) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private static notify(evt: ProgressEvent) {
    try {
      evt.timestamp = evt.timestamp || new Date().toISOString();
      for (const l of this.listeners) {
        try { l(evt); } catch (e) { console.error('ProgressSyncManager listener error', e); }
      }
      try { window.dispatchEvent(new CustomEvent('progressUpdated', { detail: evt })); } catch { }
    } catch (err) { console.error('ProgressSyncManager.notify error', err); }
  }

  private static mergeProgress(a?: UserProgress | null, b?: UserProgress | null): UserProgress {
    const left: UserProgress = a || { moduleProgress: {}, completedModules: [], assessments: [], dailyActivity: {} } as UserProgress;
    const right: UserProgress = b || { moduleProgress: {}, completedModules: [], assessments: [], dailyActivity: {} } as UserProgress;
    const out: UserProgress = { ...left };
    out.lastUpdated = right.lastUpdated || left.lastUpdated || new Date().toISOString();
    out.dailyActivity = { ...(left.dailyActivity || {}), ...(right.dailyActivity || {}) };
    out.moduleProgress = { ...(left.moduleProgress || {}) };
    for (const [modId, val] of Object.entries(right.moduleProgress || {})) {
      const existing = out.moduleProgress[modId];
      if (!existing) { out.moduleProgress[modId] = val as ModuleDetailedProgress; continue; }
      const e = existing as ModuleDetailedProgress;
      const n = val as ModuleDetailedProgress;
      out.moduleProgress[modId] = {
        completedLessons: Array.from(new Set([...(e.completedLessons || []), ...(n.completedLessons || [])])),
        completedExercises: Array.from(new Set([...(e.completedExercises || []), ...(n.completedExercises || [])])),
        projectCompleted: !!(e.projectCompleted || n.projectCompleted),
        exerciseCodes: { ...(e.exerciseCodes || {}), ...(n.exerciseCodes || {}) },
        // Inside recordAssessment, after pushing the assessment
        lessonOrder: n.lessonOrder || e.lessonOrder,
        unlockedLessons: Array.from(new Set([...(e.unlockedLessons || []), ...(n.unlockedLessons || [])])),
        unlockedExercises: Array.from(new Set([...(e.unlockedExercises || []), ...(n.unlockedExercises || [])]))
      };
    }
    out.completedModules = Array.from(new Set([...(left.completedModules || []), ...(right.completedModules || [])]));
    out.assessments = [...(left.assessments || []), ...(right.assessments || [])];
    return out;
  }

  private static enqueue(userId: string, progress: UserProgress) {
    const existing = this.pending.get(userId);
    if (existing) {
      existing.progress = this.mergeProgress(existing.progress, progress);
      existing.attempts = 0;
      // coalesced - no noisy logging
      return;
    }
    this.pending.set(userId, { progress, attempts: 0 });
    this.queue.push(userId);
    // enqueued - no noisy logging
    void this.processQueue();
  }

  private static async processQueue() {
    if (this.processing) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const userId = this.queue.shift()!;
        const entry = this.pending.get(userId);
        if (!entry) continue;
        try {
          // Pre-check: ensure user_profiles row exists to avoid FK violations (23503)
          try {
            const probe = await supabase.from('user_profiles').select('id').eq('id', userId).maybeSingle();
            if (!probe || probe.error || !probe.data) {
              // profile missing - requeue with backoff if attempts remain
              entry.attempts = (entry.attempts || 0) + 1;
              if (entry.attempts < 5) {
                const delay = 300 * Math.pow(2, entry.attempts);
                await new Promise(r => setTimeout(r, delay));
                this.queue.push(userId);
              }
              throw Object.assign(new Error('PROFILE_MISSING'), { code: 'PROFILE_MISSING', userId });
            }
          } catch (probeErr) {
            // If probe had a retryable/network error, requeue similarly
            const isRetryable = this.isRetryableError(probeErr);
            entry.attempts = (entry.attempts || 0) + 1;
            if (isRetryable && entry.attempts < 5) {
              const delay = 300 * Math.pow(2, entry.attempts);
              await new Promise(r => setTimeout(r, delay));
              this.queue.push(userId);
              continue;
            }
            throw probeErr;
          }

          await this.upsertProgress(userId, entry.progress);
          this.pending.delete(userId);
          this.cache.set(userId, entry.progress);
          this.notify({ type: 'saved', userId, progress: entry.progress, timestamp: new Date().toISOString() });
        } catch (err) {
          entry.attempts += 1;
          if (this.isRetryableError(err) && entry.attempts < 5) {
            const delay = 300 * Math.pow(2, entry.attempts);
            await new Promise(r => setTimeout(r, delay));
            this.queue.push(userId);
          } else {
            // Persist failed after retries: keep cache so UI shows latest local state,
            // delete pending entry and emit a failed event plus module-scoped updates
            this.pending.delete(userId);
            this.cache.set(userId, entry.progress);
            this.notify({ type: 'failed', userId, error: String(err), timestamp: new Date().toISOString() });
            try {
              for (const moduleId of Object.keys(entry.progress.moduleProgress || {})) {
                this.notify({ type: 'progress-updated', userId, moduleId, progress: entry.progress, timestamp: new Date().toISOString() });
              }
            } catch (e) { /* ignore */ }
          }
        }
      }
    } finally { this.processing = false; }
  }

  private static nowISO() { return new Date().toISOString(); }
  private static isRetryableError(err: any) {
    if (!err) return true;
    const status = err?.status || err?.statusCode || err?.code;
    if (typeof status === 'number' && status >= 500) return true;
    return /timeout|network|fetch|networkerror/.test(String(err).toLowerCase());
  }

  // Clear cache for a specific user to force fresh database fetch
  static clearCache(userId?: string) {
    if (userId) {
      this.cache.delete(userId);
      console.log('[ProgressSyncManager] Cache cleared for user:', userId);
    } else {
      this.cache.clear();
      console.log('[ProgressSyncManager] Cache cleared for all users');
    }
  }

  // Normalize module progress value which may be a legacy numeric percentage or
  // the detailed object shape. This returns a safe `ModuleDetailedProgress` object
  // that callers can mutate and persist back into `moduleProgress`.
  private static normalizeModuleProgress(raw?: number | ModuleDetailedProgress | null): ModuleDetailedProgress {
    if (!raw || typeof raw === 'number') {
      return {
        completedLessons: [],
        completedExercises: [],
        projectCompleted: false,
        exerciseCodes: {},
        projectCode: undefined,
        lessonOrder: [],
        unlockedLessons: [],
        unlockedExercises: [],
        completed: false
      } as ModuleDetailedProgress;
    }
    return raw as ModuleDetailedProgress;
  }

  private static async upsertProgress(userId: string, progress: UserProgress): Promise<any> {
    this.recomputeAggregates(progress);
    progress.lastUpdated = this.nowISO();

    // Use centralized safe upsert helper which handles 409 fallback and optional merging
    const res = await safeUpsertUserProgress(userId, progress, { merge: false, retries: 4, last_updated: progress.lastUpdated });

    // After persisting the canonical JSON progress, also persist per-item completion rows
    // so that lesson_completions, exercise_completions, project_completions and module_progress
    // tables are populated (these tables are used for analytics, RLS triggers and reporting).
    try {
      await this.persistCompletions(userId, progress);
    } catch (err) {
      // Surface detailed error so processQueue may retry and logs show full context
      console.error('[ProgressSyncManager] persistCompletions failed for', userId, String(err?.message || err), { err });
      throw err;
    }

    return res;
  }

  private static recomputeAggregates(progress?: UserProgress | null) {
    if (!progress) return;
    let lessons = 0, exercises = 0, projects = 0;
    for (const raw of Object.values(progress.moduleProgress || {})) {
      const mod = this.normalizeModuleProgress(raw as any);
      lessons += (mod.completedLessons || []).length;
      exercises += (mod.completedExercises || []).length;
      if (mod.projectCompleted) projects += 1;
    }
    // Update completion counts
    progress.lessons_completed = lessons;
    progress.exercises_completed = exercises;
    progress.projects_completed = projects;
    // DO NOT recompute total_xp from dailyActivity - preserve database value
    // total_xp is managed by the server and should not be calculated client-side
  }



  // Ensure the cache is populated from server and notify subscribers (used on sign-in)
  static async loadProgressAsync(userId: string, opts?: { retries?: number; backoffMs?: number }): Promise<UserProgress> {
    // Return cached immediately if available
    if (this.cache.has(userId)) return this.cache.get(userId)!;

    const retries = typeof opts?.retries === 'number' ? opts.retries : 2;
    const baseBackoff = typeof opts?.backoffMs === 'number' ? opts.backoffMs : 150;

    let attempt = 0;
    let serverProgress: UserProgress | null = null;
    let lastError: any = null;

    while (attempt <= retries) {
      attempt += 1;
      console.debug(`[ProgressSync] loadProgressAsync attempt ${attempt}/${retries + 1} for user`, userId);
      try {
        // Select both JSON progress column AND top-level columns like total_xp, level
        const { data, error } = await supabase
          .from('user_progress')
          .select('user_id, progress, updated_at, total_xp, current_level, modules_completed, lessons_completed, exercises_completed, projects_completed')
          .eq('user_id', userId)
          .maybeSingle();

        console.debug('[ProgressSync] supabase query executed for user_progress.maybeSingle', { userId, query: { table: 'user_progress', select: 'user_id, progress, updated_at, total_xp, current_level, ...', filter: `user_id=eq.${userId}` } });
        console.debug('[ProgressSync] supabase response', { data, error });

        if (error) {
          lastError = error;
          const shouldRetry = this.isRetryableError(error) && attempt <= retries;
          // ProgressLoad attempt GET error (silent)
          if (shouldRetry) {
            const wait = baseBackoff * Math.pow(2, attempt - 1);
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
          break;
        }

        if (data) {
          // server row raw (silent)
          try {
            const row: any = data;
            let p: UserProgress | null = null;
            if (row.progress) {
              p = typeof row.progress === 'string' ? JSON.parse(row.progress) : row.progress;
            } else {
              // Only use guaranteed columns from the row; do not reference columns that may not exist.
              p = {
                lastUpdated: row.updated_at || new Date().toISOString(),
                moduleProgress: {},
                completedModules: [],
                assessments: [],
                dailyActivity: {},
              } as UserProgress;
            }

            p.dailyActivity = p.dailyActivity || {};
            // Ensure moduleProgress and other aggregates exist to avoid undefined access
            p.moduleProgress = p.moduleProgress || {};
            p.completedModules = p.completedModules || [];
            p.assessments = p.assessments || [];
            
            // Use top-level columns from database as authoritative source
            // These are the actual values stored in separate columns, not inside the JSON
            p.total_xp = row.total_xp ?? p.total_xp ?? 0;
            p.level = row.current_level ?? p.level ?? p.current_level ?? 1;
            p.lessons_completed = row.lessons_completed ?? p.lessons_completed ?? 0;
            p.exercises_completed = row.exercises_completed ?? p.exercises_completed ?? 0;
            p.projects_completed = row.projects_completed ?? p.projects_completed ?? 0;
            
            console.log('[ProgressSync] ✅ Applied top-level columns', {
              userId,
              total_xp: p.total_xp,
              level: p.level,
              source: 'database columns'
            });
            
            for (const [k, v] of Object.entries(p.dailyActivity || {})) {
              if (v && typeof v === 'object' && !('date' in (v as any))) (v as any).date = k;
            }

            serverProgress = p;
            console.debug('[ProgressSync] parsed server progress', { userId, serverProgress });
          } catch (parseErr) {
            lastError = parseErr;
            console.error('[ProgressSync] failed to parse server progress for user', userId, parseErr);
          }
        }

        break;
      } catch (err) {
        lastError = err;
        const shouldRetry = this.isRetryableError(err) && attempt <= retries;
        // ProgressLoad attempt exception (silent)
        if (shouldRetry) {
          const wait = baseBackoff * Math.pow(2, attempt - 1);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }
        break;
      }
    }

    if (!serverProgress && lastError) {
      // server GET failed, falling back to local cache for user (silent)
    }

    // Do NOT merge local cache into server progress: Supabase is authoritative.
    // Ensure we always return a usable progress object (never null) so callers
    // can safely read `.moduleProgress` and `.completedModules` without checks.
    const merged: UserProgress = serverProgress || { moduleProgress: {}, completedModules: [], assessments: [], dailyActivity: {} } as UserProgress;

    console.debug('[ProgressSync] final merged progress (server-priority)', { userId, merged });

    // Recompute aggregates and cache + notify listeners
    try { this.recomputeAggregates(merged); } catch (e) { /* no-op */ }
    this.cache.set(userId, merged);
    // cached merged progress for user
    console.debug('[ProgressSync] cached progress set for user', userId);
    this.notify({ type: 'local-update', userId, progress: merged, timestamp: new Date().toISOString() });
    try {
      for (const moduleId of Object.keys(merged.moduleProgress || {})) {
        this.notify({ type: 'progress-updated', userId, moduleId, progress: merged, timestamp: new Date().toISOString() });
      }
    } catch (e) { /* ignore notify errors */ }

    // returning merged progress
    console.debug('[ProgressSync] loadProgressAsync returning for user', userId);
    return merged;
  }

  // Ensure the cache is populated from server and notify subscribers (used on sign-in)
  static async initUserProgress(userId: string): Promise<UserProgress> {
    try {
      // initUserProgress start (silent)
      const p = await this.loadProgressAsync(userId);
      // Notify subscribers that we loaded progress from server
      // initUserProgress loaded (silent)
      this.notify({ type: 'saved', userId, progress: p, timestamp: new Date().toISOString() });

      // Also emit module-scoped updates so hooks that filter by moduleId refresh immediately
      try {
        for (const moduleId of Object.keys(p.moduleProgress || {})) {
          this.notify({ type: 'progress-updated', userId, moduleId, progress: p, timestamp: new Date().toISOString() });
        }
      } catch (e) { /* ignore notify errors */ }

      // Ensure per-item completion rows are present for the hydrated server progress.
      // This makes lesson_completions, exercise_completions and project_completions
      // reflect the authoritative `user_progress.progress` JSON.
      try {
        // best-effort: persistCompletions will check for existing rows and avoid duplicates
        await (this as any).persistCompletions(userId, p);
      } catch (e) {
        console.warn('[ProgressSync] persistCompletions on init failed (non-fatal)', { userId, err: e });
      }

      // Do NOT merge guest/local cache into the authoritative server progress.
      // Keep server-provided progress as the single source of truth.
      console.debug('[ProgressSync] initUserProgress complete (server authoritative)', { userId });
      return p;
    } catch (e) {
      const fallback = { moduleProgress: {}, completedModules: [], assessments: [] } as UserProgress;
      this.cache.set(userId, fallback);
      this.notify({ type: 'saved', userId, progress: fallback, timestamp: new Date().toISOString() });
      try {
        for (const moduleId of Object.keys(fallback.moduleProgress || {})) {
          this.notify({ type: 'progress-updated', userId, moduleId, progress: fallback, timestamp: new Date().toISOString() });
        }
      } catch (e) { /* ignore */ }

      // If server load failed, do not merge local guest cache: keep fallback empty progress.
      console.warn('[ProgressSync] initUserProgress failed to load server progress, returning empty fallback for user', userId);
      return fallback;
    }
  }

  // Initialize default progress for a new user based on a course configuration
  static async initDefaultProgressForUser(
    userId: string,
    courseConfig: { id: string; lessons: string[]; exercises: string[] }[]
  ): Promise<UserProgress> {
    const progress: UserProgress = {
      lastUpdated: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: undefined,
      dailyActivity: {},
      moduleProgress: {},
      completedModules: [],
      total_xp: 0,
      lessons_completed: 0,
      exercises_completed: 0,
      projects_completed: 0,
      assessments: []
    } as UserProgress;

    for (const mod of courseConfig || []) {
      progress.moduleProgress[mod.id] = {
        completedLessons: [],
        completedExercises: [],
        projectCompleted: false,
        lessonOrder: Array.isArray(mod.lessons) ? mod.lessons.slice() : [],
        unlockedLessons: Array.isArray(mod.lessons) && mod.lessons.length ? [mod.lessons[0]] : [],
        unlockedExercises: []
      } as ModuleDetailedProgress;
    }

    // Persist via existing save helper (will recompute aggregates and enqueue upsert)
    await this.saveProgressAsync(userId, progress);
    return progress;
  }

  // ---------------------
  // CORE: COMPLETION + UNLOCK LOGIC
  // ---------------------
  static async completeLesson(userId: string, moduleId: string, lessonId: string, xpEarned?: number): Promise<UserProgress> {
    const p = await this.loadProgressAsync(userId);
    const raw = p.moduleProgress[moduleId];
    const mod = this.normalizeModuleProgress(raw as any);
    if (!Array.isArray(mod.completedLessons)) mod.completedLessons = [];
    const wasCompleted = mod.completedLessons.includes(lessonId);

    if (!wasCompleted) {
      mod.completedLessons.push(lessonId);
    }

    const prevUnlocked = Array.from(new Set([...(mod.unlockedLessons || [])]));
    mod.unlockedLessons = this.unlockNextItem(lessonId, mod.lessonOrder, mod.unlockedLessons);
    const newlyUnlocked = (mod.unlockedLessons || []).find(x => !prevUnlocked.includes(x)) || null;

    p.moduleProgress[moduleId] = mod;

    // Determine XP to award: prefer explicit xpEarned param, otherwise read from curriculum
    try {
      if (typeof xpEarned !== 'number') {
        const r: any = await supabase.from('lessons').select('xp_reward').eq('id', lessonId).maybeSingle();
        if (!r?.error && r?.data && typeof r.data.xp_reward !== 'undefined') xpEarned = Number(r.data.xp_reward) || 0;
      }
    } catch (e) {
      // fallback to default if DB read fails
      xpEarned = typeof xpEarned === 'number' ? xpEarned : 50;
    }
    // sanitize xp
    if (!Number.isFinite(xpEarned as number) || (xpEarned as number) < 0) xpEarned = 0;

    const today = new Date().toISOString().slice(0, 10);
    p.dailyActivity = p.dailyActivity || {};
    p.dailyActivity[today] = p.dailyActivity[today] || {
      date: today,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      projectsCompleted: 0,
      assessmentsCompleted: 0,
      totalXP: 0,
      studyTimeMinutes: 0
    };

    // Only count lessons/XP when this is a new completion (avoid double-counting)
    if (!wasCompleted) {
      p.dailyActivity[today].lessonsCompleted += 1;
      p.dailyActivity[today].totalXP += xpEarned as number;
      p.lastActivityDate = today;
    }

    // Recompute streaks based on dailyActivity (ensures multiple completes same day don't inflate streak)
    this.recomputeStreaks(p);

    this.recomputeAggregates(p);
    await this.saveProgressAsync(userId, p);
    this.notify({ type: 'progress-updated', userId, moduleId, progress: p, timestamp: new Date().toISOString() });

    // Emit an xpAwarded event so UI can immediately show XP popups without
    // waiting for a full page reload or server realtime update.
    try {
      const detail = { userId, xp: xpEarned as number, sourceType: 'lesson', sourceId: lessonId, moduleId };
      try { window.dispatchEvent(new CustomEvent('xpAwarded', { detail })); } catch { /* ignore */ }
    } catch (e) { /* ignore */ }

    // Do not reload the page here. Instead, best-effort flush the queue so
    // per-item rows are persisted server-side before user navigates away.
    try {
      if (typeof window !== 'undefined' && !wasCompleted) {
        try { await this.triggerQueueProcessingForUser(userId); } catch (qErr) { console.warn('[completeLesson] triggerQueueProcessingForUser failed', qErr); }
      }
    } catch (e) { /* ignore */ }

    // concise logging: only when a completion happened or a next item unlocked
    if (!wasCompleted || newlyUnlocked) {
      const nextMsg = newlyUnlocked ? `, next unlocked: ${newlyUnlocked}` : '';
      // completion recorded (no debug logging)
    }

    return p;
  }

  static async completeExercise(userId: string, moduleId: string, exerciseId: string, xpEarned?: number, submittedCode?: string): Promise<UserProgress> {
    const p = await this.loadProgressAsync(userId);
    const raw = p.moduleProgress[moduleId];
    const mod = this.normalizeModuleProgress(raw as any);
    if (!Array.isArray(mod.completedExercises)) mod.completedExercises = [];
    const wasCompleted = mod.completedExercises.includes(exerciseId);
    if (!wasCompleted) mod.completedExercises.push(exerciseId);

    // unlock next exercise: prefer an explicit `exerciseOrder`, otherwise fall back to `lessonOrder`
    const exerciseOrder = (mod as any).exerciseOrder || mod.lessonOrder || [];
    const prevUnlocked = Array.from(new Set([...(mod.unlockedExercises || [])]));
    mod.unlockedExercises = this.unlockNextItem(exerciseId, exerciseOrder, mod.unlockedExercises);
    const newlyUnlocked = (mod.unlockedExercises || []).find(x => !prevUnlocked.includes(x)) || null;

    p.moduleProgress[moduleId] = mod;

    // Persist submitted code (compatibility): store per-exercise code if provided
    try {
      if (submittedCode) {
        mod.exerciseCodes = mod.exerciseCodes || {};
        mod.exerciseCodes[exerciseId] = submittedCode;
      }
    } catch (e) {
      // non-fatal: continue without failing the completion
      console.warn('[ProgressSyncManager] failed to persist submittedCode in-memory', e);
    }

    const today = new Date().toISOString().slice(0, 10);
    p.dailyActivity = p.dailyActivity || {};
    p.dailyActivity[today] = p.dailyActivity[today] || {
      date: today,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      projectsCompleted: 0,
      assessmentsCompleted: 0,
      totalXP: 0,
      studyTimeMinutes: 0
    };
    // If xpEarned not provided or invalid, attempt to fetch from curriculum_exercises
    try {
      if (!Number.isFinite(xpEarned) || xpEarned == null) {
        const r: any = await supabase.from('exercises').select('xp_reward').eq('id', exerciseId).maybeSingle();
        if (!r?.error && r?.data && typeof r.data.xp_reward !== 'undefined') xpEarned = Number(r.data.xp_reward) || 0;
      }
    } catch (e) {
      xpEarned = xpEarned || 100;
    }
    if (!Number.isFinite(xpEarned) || xpEarned < 0) xpEarned = 0;
    // Only award exercise counts/xp when this is a new completion
    if (!wasCompleted) {
      p.dailyActivity[today].exercisesCompleted += 1;
      p.dailyActivity[today].totalXP += xpEarned as number;
    }
    p.lastActivityDate = today;

    this.recomputeAggregates(p);
    await this.saveProgressAsync(userId, p);
    this.notify({ type: 'progress-updated', userId, moduleId, progress: p, timestamp: new Date().toISOString() });

    // Emit xpAwarded so UI can show immediate feedback
    try {
      const detail = { userId, xp: xpEarned as number, sourceType: 'exercise', sourceId: exerciseId, moduleId };
      try { window.dispatchEvent(new CustomEvent('xpAwarded', { detail })); } catch { /* ignore */ }
    } catch (e) { /* ignore */ }

    try {
      if (typeof window !== 'undefined' && !wasCompleted) {
        // Best-effort: ensure queued persistence runs so per-item rows are written server-side.
        try {
          await this.triggerQueueProcessingForUser(userId);
        } catch (qErr) {
          console.warn('[completeExercise] triggerQueueProcessingForUser failed', qErr);
        }
      }
    } catch (e) { /* ignore */ }

    if (!wasCompleted || newlyUnlocked) {
      const nextMsg = newlyUnlocked ? `, next unlocked: ${newlyUnlocked}` : '';
      // exercise completion recorded (no debug logging)
    }

    return p;
  }



  static async completeProject(userId: string, moduleId: string, xpEarned?: number, submittedCode?: string): Promise<UserProgress> {
    const p = await this.loadProgressAsync(userId);
    const raw = p.moduleProgress[moduleId];
    const mod = this.normalizeModuleProgress(raw as any);

    const wasCompleted = !!mod.projectCompleted;
    if (!wasCompleted) mod.projectCompleted = true;
    p.moduleProgress[moduleId] = mod;

    const today = new Date().toISOString().slice(0, 10);
    p.dailyActivity = p.dailyActivity || {};
    p.dailyActivity[today] = p.dailyActivity[today] || { date: today, lessonsCompleted: 0, exercisesCompleted: 0, projectsCompleted: 0, assessmentsCompleted: 0, totalXP: 0, studyTimeMinutes: 0 };
    // attempt to fetch project xp if not provided
    try {
      if (!Number.isFinite(xpEarned) || xpEarned == null) {
        // Try runtime `projects` table first (select only `xp_reward`),
        // fall back to `curriculum_projects` if runtime table missing or returns no rows.
        try {
          const r: any = await supabase.from('projects').select('xp_reward').eq('id', `${moduleId}-project`).maybeSingle();
          if (!r?.error && r?.data && typeof r.data.xp_reward !== 'undefined') {
            xpEarned = Number(r.data.xp_reward) || 0;
          }
        } catch (e) { /* ignore and fallback below */ }

        if (!Number.isFinite(xpEarned) || xpEarned == null) {
          try {
            const rc: any = await supabase.from('curriculum_projects').select('xp_reward').eq('id', `${moduleId}-project`).maybeSingle();
            if (!rc?.error && rc?.data && typeof rc.data.xp_reward !== 'undefined') xpEarned = Number(rc.data.xp_reward) || 0;
          } catch (e) { /* ignore */ }
        }
      }
    } catch (e) {
      xpEarned = xpEarned || 200;
    }
    if (!Number.isFinite(xpEarned) || xpEarned < 0) xpEarned = 0;
    // Only award project counts/xp when this is a new completion
    if (!wasCompleted) {
      p.dailyActivity[today].projectsCompleted += 1;
      p.dailyActivity[today].totalXP += xpEarned as number;
    }
    p.lastActivityDate = today;

    this.recomputeAggregates(p);
    await this.saveProgressAsync(userId, p);

    // Persist submitted project code (compatibility): store project code if provided
    try {
      if (submittedCode) {
        mod.projectCode = submittedCode;
        // also ensure it's present on the persisted moduleProgress before save
        p.moduleProgress[moduleId] = mod;
        await this.saveProgressAsync(userId, p);
      }
    } catch (e) {
      console.warn('[ProgressSyncManager] failed to persist project code in-memory', e);
    }

    // project completion recorded (no debug logging)

    // Emit xpAwarded for project completions so UI can show popup immediately
    try {
      const detail = { userId, xp: xpEarned as number, sourceType: 'project', sourceId: `${moduleId}-project`, moduleId };
      try { window.dispatchEvent(new CustomEvent('xpAwarded', { detail })); } catch { /* ignore */ }
    } catch (e) { /* ignore */ }

    try {
      if (typeof window !== 'undefined' && !wasCompleted) {
        try { await this.triggerQueueProcessingForUser(userId); } catch (qErr) { console.warn('[completeProject] triggerQueueProcessingForUser failed', qErr); }
      }
    } catch (e) { /* ignore */ }

    return p;
  }

  static async recordAssessment(userId: string, assessmentId: string, moduleId: string, score: number, maxScore: number, topics: { [topic: string]: number } = {}, studyTimeMinutes = 0): Promise<UserProgress> {
    const p = await this.loadProgressAsync(userId);
    p.assessments = p.assessments || [];
    const completedAt = new Date().toISOString();
    p.assessments.push({ assessmentId, moduleId, score, maxScore, topics, completedAt });

    const xpEarned = maxScore > 0 ? Math.floor((score / maxScore) * 300) : 0;
    const today = new Date().toISOString().slice(0, 10);
    p.dailyActivity = p.dailyActivity || {};
    p.dailyActivity[today] = p.dailyActivity[today] || { date: today, lessonsCompleted: 0, exercisesCompleted: 0, projectsCompleted: 0, assessmentsCompleted: 0, totalXP: 0, studyTimeMinutes: 0 };
    p.dailyActivity[today].assessmentsCompleted += 1;
    p.dailyActivity[today].totalXP += xpEarned;
    p.dailyActivity[today].studyTimeMinutes += studyTimeMinutes;
    p.lastActivityDate = today;

    const raw = p.moduleProgress[moduleId];
    const mod = this.normalizeModuleProgress(raw as any);

    // inside recordAssessment, after pushing the assessment
    const lastLesson = mod.completedLessons[mod.completedLessons.length - 1];
    const lessonOrder = mod.lessonOrder || [];
    mod.unlockedLessons = this.unlockNextItem(lastLesson, lessonOrder, mod.unlockedLessons);

    const lastEx = mod.completedExercises[mod.completedExercises.length - 1];
    const exOrder = (mod as any).exerciseOrder || lessonOrder;
    mod.unlockedExercises = this.unlockNextItem(lastEx, exOrder, mod.unlockedExercises);


    // Auto-project if all lessons/exercises done
    const allLessonsDone = mod.lessonOrder?.every(l => mod.completedLessons.includes(l));
    const allExercisesDone = mod.lessonOrder?.every(e => mod.completedExercises.includes(e));
    if (allLessonsDone && allExercisesDone && !mod.projectCompleted) mod.projectCompleted = true;

    p.moduleProgress[moduleId] = mod;
    this.recomputeAggregates(p);
    this.recomputeStreaks(p);
    await this.saveProgressAsync(userId, p);
    this.notify({ type: 'progress-updated', userId, moduleId, progress: p, timestamp: new Date().toISOString() });

    // Persist an assessment_attempts row to Supabase so server analytics and
    // reporting capture each attempt. Best-effort: failures are logged but
    // won't block the local progress update.
    (async () => {
      try {
        const percentage = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0;

        // Try to atomically update any open attempt row matching this user+assessment
        try {
          const updatePayload = {
            score: percentage,
            correct_answers: Math.round(score),
            total_questions: Math.round(maxScore),
            time_taken_minutes: Number(studyTimeMinutes) || 0,
            passed: percentage >= 70,
            answers: topics || {},
            completed_at: new Date().toISOString()
          };

          const { data: updatedRows, error: updateErr } = await supabase
            .from('assessment_attempts')
            .update(updatePayload)
            .match({ user_id: userId, assessment_id: assessmentId })
            .is('completed_at', null)
            .select('id')
            .limit(1);

          if (updateErr) {
            // Log and continue to attempt insert
            console.warn('[persistAssessmentAttempt] update attempt returned error; will try insert', { userId, assessmentId, moduleId, updateErr });
          } else if (Array.isArray(updatedRows) && updatedRows.length > 0) {
            // Successfully updated existing open attempt
            return;
          }
        } catch (e) {
          // ignore and fall back to insert
          console.warn('[persistAssessmentAttempt] update check failed, falling back to insert', e);
        }

        // Count existing attempts to compute attempt_number
        let attemptNumber = 1;
        try {
          const { data: existing, error: existingErr } = await supabase
            .from('assessment_attempts')
            .select('id')
            .eq('user_id', userId)
            .eq('assessment_id', assessmentId);
          if (!existingErr && Array.isArray(existing)) attemptNumber = existing.length + 1;
        } catch (e) {
          // ignore and default to 1
        }

        const payload: any = {
          user_id: userId,
          module_id: moduleId,
          assessment_id: assessmentId,
          assessment_type: 'quiz',
          score: percentage,
          correct_answers: Math.round(score),
          total_questions: Math.round(maxScore),
          time_taken_minutes: Number(studyTimeMinutes) || 0,
          passed: percentage >= 70,
          attempt_number: attemptNumber,
          answers: topics || {},
          completed_at: new Date().toISOString()
        };

        const { error: insertErr, status } = await supabase.from('assessment_attempts').insert(payload);
        if (insertErr) {
          const msg = String((insertErr as any)?.message || insertErr || '');
          const isUniqueViolation = /duplicate key|unique constraint|already exists/i.test(msg) || (status === 409);
          if (isUniqueViolation) {
            console.warn('[persistAssessmentAttempt] unique conflict (ignored)', { userId, assessmentId, moduleId, insertErr });
          } else if (status === 403 || status === 400) {
            try {
              const { data: verify, error: verifyErr } = await supabase.from('assessment_attempts').select('id').eq('user_id', userId).eq('assessment_id', assessmentId).limit(1);
              if (!verifyErr && Array.isArray(verify) && verify.length > 0) {
                console.warn('[persistAssessmentAttempt] insert returned 403/400 but row exists; treating as success', { userId, assessmentId, moduleId });
              } else {
                console.error('[persistAssessmentAttempt] insert failed and row not found', { userId, assessmentId, moduleId, insertErr });
              }
            } catch (ve) {
              console.error('[persistAssessmentAttempt] verification after insert error failed', { userId, assessmentId, moduleId, ve, insertErr });
            }
          } else {
            console.error('[persistAssessmentAttempt] insert failed', { userId, assessmentId, moduleId, insertErr });
          }
        }
      } catch (e) {
        console.warn('[persistAssessmentAttempt] unexpected error', e);
      }
    })();

    return p;
  }

  /**
   * Create a placeholder assessment_attempts row marking the start of an attempt.
   * Returns the inserted row id (UUID) when successful, otherwise null.
   */
  static async beginAssessmentAttempt(userId: string, assessmentId: string, moduleId: string, totalQuestions = 0, assessmentType = 'quiz'): Promise<string | null> {
    try {
      // Compute attempt_number
      let attemptNumber = 1;
      try {
        const { data: existing } = await supabase.from('assessment_attempts').select('id').eq('user_id', userId).eq('assessment_id', assessmentId);
        if (Array.isArray(existing)) attemptNumber = existing.length + 1;
      } catch { /* ignore */ }

      const payload: any = {
        user_id: userId,
        module_id: moduleId,
        assessment_id: assessmentId,
        assessment_type: assessmentType,
        score: 0,
        correct_answers: 0,
        total_questions: Math.round(totalQuestions) || 0,
        time_taken_minutes: 0,
        passed: false,
        attempt_number: attemptNumber,
        answers: {},
        completed_at: null
      };

      const { data, error } = await supabase.from('assessment_attempts').insert(payload).select('id').limit(1);
      if (error) {
        console.warn('[beginAssessmentAttempt] insert returned error', { userId, assessmentId, moduleId, error });
        return null;
      }
      if (Array.isArray(data) && data.length > 0) return data[0].id as string;
      return null;
    } catch (e) {
      console.warn('[beginAssessmentAttempt] unexpected error', e);
      return null;
    }
  }

  private static recomputeStreaks(progress: UserProgress) {
    try {
      const dates = Object.keys(progress.dailyActivity || {}).sort();
      let current = 0, longest = progress.longestStreak || 0;
      if (dates.length === 0) {
        progress.currentStreak = 0;
        progress.longestStreak = Math.max(longest, progress.longestStreak || 0);
        return;
      }

      // Count consecutive calendar days with at least one lesson, ending at the most recent activity date
      const lastDateStr = dates[dates.length - 1];
      let expected = new Date(lastDateStr + 'T00:00:00Z');

      for (let i = dates.length - 1; i >= 0; i--) {
        const d = dates[i];
        const has = progress.dailyActivity![d] && ((progress.dailyActivity![d].lessonsCompleted || 0) >= 1);
        if (!has) break;

        const curDate = new Date(d + 'T00:00:00Z');
        // If curDate matches expected day => continue streak, otherwise a gap exists -> stop
        const sameDay = curDate.getUTCFullYear() === expected.getUTCFullYear() && curDate.getUTCMonth() === expected.getUTCMonth() && curDate.getUTCDate() === expected.getUTCDate();
        if (!sameDay) break;

        current++;
        // move expected to previous day
        expected = new Date(expected.getTime() - 24 * 60 * 60 * 1000);
        if (current > longest) longest = current;
      }

      progress.currentStreak = current;
      progress.longestStreak = Math.max(longest, progress.longestStreak || 0);
    } catch (e) { console.warn('recomputeStreaks', e); }
  }

  // Add this inside ProgressSyncManager class:

  /**
   * Deprecated compatibility adapter: return module progress from cache.
   * Prefer `getCachedProgress` and direct access to `moduleProgress`.
   * @deprecated Use `getCachedProgress(userId)` then read `.moduleProgress[moduleId]`.
   */
  static getModuleProgress(userId: string, moduleId: string): ModuleDetailedProgress | null {
    const p = this.cache.get(userId) || null;
    if (!p || !p.moduleProgress) return null;
    return (p.moduleProgress[moduleId] as ModuleDetailedProgress) || null;
  }

  /**
   * Deprecated compatibility adapter: check cached progress for an item.
   * itemType is expected to be 'lesson' | 'exercise' | 'project' (or similar strings).
   * @deprecated Read from `getCachedProgress(userId)` instead.
   */
  static isItemCompleted(userId: string, moduleId: string, itemId: string, itemType: string): boolean {
    const mod = this.getModuleProgress(userId, moduleId);
    if (!mod) return false;
    if (itemType === 'lesson') return Array.isArray(mod.completedLessons) && mod.completedLessons.includes(itemId);
    if (itemType === 'exercise') return Array.isArray(mod.completedExercises) && mod.completedExercises.includes(itemId);
    if (itemType === 'project') return !!mod.projectCompleted && itemId === 'project';
    // Fallback: attempt to match against any completion arrays
    return (Array.isArray(mod.completedLessons) && mod.completedLessons.includes(itemId)) || (Array.isArray(mod.completedExercises) && mod.completedExercises.includes(itemId));
  }

  /**
   * Deprecated compatibility adapter: upsert module progress via ProgressService.
   * Delegates to ProgressService.upsertModuleProgress when available.
   * @deprecated Use ProgressService.upsertModuleProgress directly.
   */
  static async upsertModuleProgress(userId: string, moduleId: string, payload: Partial<any>): Promise<any> {
    try {
      // Defer to ProgressService if present to avoid duplicating DB logic
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const svc = require('./supabase/dataService').ProgressService;
      if (svc && typeof svc.upsertModuleProgress === 'function') return await svc.upsertModuleProgress(userId, moduleId, payload);
    } catch (e) {
      // ignore and fallthrough to a no-op rejection
    }
    throw new Error('upsertModuleProgress not available');
  }

  // Returns a snapshot of progress for UI/hooks
  static getProgressSnapshot(userId: string) {
    const p = this.cache.get(userId) || ({ moduleProgress: {}, completedModules: [] } as UserProgress);
    const totalXP = Object.values(p.dailyActivity || {}).reduce((s: number, d: any) => s + (d?.totalXP || 0), 0);

    const completedLessons: { [moduleId: string]: string[] } = {};
    const completedExercises: { [moduleId: string]: string[] } = {};
    const completedProjects: string[] = [];

    for (const [modId, rawMp] of Object.entries(p.moduleProgress || {})) {
      const mp = this.normalizeModuleProgress(rawMp as any);
      if (mp.completedLessons?.length) completedLessons[modId] = mp.completedLessons;
      if (mp.completedExercises?.length) completedExercises[modId] = mp.completedExercises;
      if (mp.projectCompleted) completedProjects.push(modId);
    }

    return {
      userId,
      timestamp: new Date().toISOString(),
      completedModules: p.completedModules || [],
      completedLessons,
      completedExercises,
      completedProjects,
      totalXP,
      assessmentResults: (p.assessments || []).length,
      currentStreak: p.currentStreak || 0,
    };
  }

  /**
   * Verify consistency adapter (deprecated).
   * Returns an array of found issue descriptions. Thin adapter: delegates to a runtime-injected
   * implementation if present, otherwise returns an empty array.
   * @deprecated Use the newer consistency tooling if available.
   */
  static verifyConsistency(userId: string): string[] {
    try {
      const fn = (this as any)._verifyConsistency;
      if (typeof fn === 'function') return fn(userId);
    } catch { }
    return [];
  }

  /**
   * Fix inconsistencies adapter (deprecated).
   * Returns an object with `fixed` count and remaining `issues`.
   * Delegates to runtime-injected implementation if present; otherwise performs a safe no-op.
   * @deprecated Use the newer consistency tooling if available.
   */
  static fixInconsistencies(userId: string): { fixed: number; issues: string[] } {
    try {
      const fn = (this as any)._fixInconsistencies;
      if (typeof fn === 'function') return fn(userId);
    } catch { }
    return { fixed: 0, issues: [] };
  }

  // Returns the cached full progress object if available.
  // Synchronous by design: allows UI code to read hydrated server state
  // without falling back to localStorage-based progress.
  static getCachedProgress(userId: string): UserProgress | null {
    return this.cache.get(userId) || null;
  }

  // Returns completion stats for UI
  static getCompletionStats(userId: string) {
    const snap = this.getProgressSnapshot(userId);
    const totalLessons = Object.values(snap.completedLessons).reduce((s, arr) => s + (arr?.length || 0), 0);
    const totalExercises = Object.values(snap.completedExercises).reduce((s, arr) => s + (arr?.length || 0), 0);
    const totalProjects = snap.completedProjects.length;
    const totalModules = snap.completedModules.length;
    const estimatedTotalItems = 12 * (5 + 5 + 1); // adjust to your course
    const completedItems = totalLessons + totalExercises + totalProjects;
    const completionPercentage = Math.round((completedItems / estimatedTotalItems) * 100);

    return {
      totalLessons,
      totalExercises,
      totalProjects,
      totalModules,
      totalXP: snap.totalXP,
      completionPercentage: Math.min(completionPercentage, 100),
    };
  }


  static async saveProgressAsync(userId: string, progress: UserProgress) {
    progress.lastUpdated = this.nowISO();
    this.recomputeAggregates(progress);
    this.cache.set(userId, progress);
    this.notify({ type: 'local-update', userId, progress, timestamp: new Date().toISOString() });
    this.enqueue(userId, progress);
  }

  // Public helper to trigger processing of queued entries for a specific user
  static async triggerQueueProcessingForUser(userId: string) {
    try {
      if (!userId) return;
      if (this.pending.has(userId) && !this.queue.includes(userId)) this.queue.push(userId);
      // Kick off queue processing (processQueue is internal but accessible here)
      await this.processQueue();
    } catch (e) {
      console.warn('[ProgressSync] triggerQueueProcessingForUser error', e);
    }
  }

  // Helper functions inside ProgressSyncManager
  private static unlockNextItem(
    completedId: string,
    order: string[] = [],
    unlocked: string[] = []
  ): string[] {
    if (!order.length) return unlocked; // nothing to unlock
    const idx = order.indexOf(completedId);
    if (idx < 0) return unlocked; // completedId not in order
    if (idx + 1 >= order.length) return unlocked; // last item, nothing to unlock
    const nextId = order[idx + 1];
    return Array.from(new Set([...(unlocked || []), nextId]));
  }


}

export default ProgressSyncManager;

// Persist per-item completion rows and module_progress entries.
// Throws on any non-retryable failure so upstream retry/backoff logic can act.
// Implemented as a property on ProgressSyncManager so it can access private statics if needed.
ProgressSyncManager['persistCompletions'] = async function (userId: string, progress: UserProgress) {
  // Verify current authenticated user matches the userId we're writing for.
  try {
    const authResp: any = await (supabase.auth.getUser ? supabase.auth.getUser() : supabase.auth.getSession());
    const authUser = authResp?.data?.user || authResp?.user || null;
    if (authUser && authUser.id && authUser.id !== userId) {
      console.warn('[persistCompletions] auth uid mismatch, will write using auth uid to satisfy RLS', { expected: userId, actual: authUser.id });
      userId = authUser.id;
    }
  } catch (e) {
    console.warn('[persistCompletions] warning: failed to fetch auth user', e);
  }

  console.debug('[persistCompletions] beginning persistence', { userId, modules: Object.keys(progress.moduleProgress || {}).length });

  const now = progress.lastUpdated || new Date().toISOString();

  // Defensive: ensure moduleProgress exists so callers that pass partial progress
  // don't cause `Cannot read properties of undefined` during iteration.
  progress.moduleProgress = progress.moduleProgress || {};

  for (const [moduleId, rawMod] of Object.entries(progress.moduleProgress || {})) {
    try {
      console.debug('[persistCompletions] processing module start', { userId, moduleId });
      const mod = this.normalizeModuleProgress(rawMod as any);
      // Ensure we persist the normalized form back into canonical progress map
      progress.moduleProgress![moduleId] = mod as any;
      // LESSONS
      const lessons = Array.isArray(mod.completedLessons) ? Array.from(new Set(mod.completedLessons)) : [];
      if (lessons.length) {
        console.debug('[persistCompletions] checking lesson_completions for', { userId, moduleId, lessons });
        const { data: existing, error: existingErr } = await supabase
          .from('lesson_completions')
          .select('lesson_id')
          .eq('user_id', userId)
          .eq('module_id', moduleId)
          .in('lesson_id', lessons);
        if (existingErr) throw existingErr;
        const existingIds = new Set(((existing || []) as any[]).map((r) => r.lesson_id));
        const toInsertIds = lessons.filter((id) => !existingIds.has(id));
        if (toInsertIds.length) {
          const ids = Array.from(new Set(toInsertIds));
          const { data: titles } = await supabase.from('lessons').select('id,title,xp_reward').in('id', ids as string[]);
          const titleMap: Record<string, string> = {};
          const titleMapXp: Record<string, number> = {};
          (titles || []).forEach((t: any) => { titleMap[t.id] = t.title; titleMapXp[t.id] = Number.isFinite(Number(t.xp_reward)) ? Number(t.xp_reward) : 0; });
          // Build payload matching lesson_completions columns. Do NOT include `id` or
          // `created_at` so the DB can use defaults. Validate required fields and
          // provide sensible defaults for missing titles.
          // Sanitize and normalize payload entries with sensible defaults. Do not
          // include `id` or `created_at` so DB defaults are used.
          const rawPayload = ids.map((lessonId) => ({
            user_id: userId,
            module_id: moduleId,
            lesson_id: typeof lessonId === 'string' ? lessonId.trim() : (lessonId == null ? '' : String(lessonId)),
            lesson_title: titleMap[lessonId] || (typeof lessonId === 'string' ? lessonId : (lessonId == null ? 'Untitled Lesson' : String(lessonId))),
            xp_earned: titleMapXp[lessonId] || 0,
            time_spent_minutes: 0,
            completed_at: now
          }));

          const invalidEntries: Array<{ idx: number; entry: any; missing: string[] }> = [];
          const payload = rawPayload.filter((p, idx) => {
            const missing: string[] = [];
            // Normalize and enforce types/defaults
            p.user_id = String(p.user_id || userId || '');
            p.module_id = String(p.module_id || moduleId || '');
            p.lesson_id = typeof p.lesson_id === 'string' ? p.lesson_id.trim() : (p.lesson_id == null ? '' : String(p.lesson_id));
            if (!p.lesson_title) p.lesson_title = 'Untitled Lesson';
            p.xp_earned = Number.isFinite(Number(p.xp_earned)) ? Number(p.xp_earned) : 0;
            p.time_spent_minutes = Number.isFinite(Number(p.time_spent_minutes)) ? Number(p.time_spent_minutes) : 0;
            p.completed_at = p.completed_at || now;

            // Validate required fields: user_id, module_id, lesson_id
            if (!p.lesson_id) missing.push('lesson_id');
            if (!p.user_id) missing.push('user_id');
            if (!p.module_id) missing.push('module_id');

            if (missing.length) {
              invalidEntries.push({ idx, entry: p, missing });
              return false;
            }

            // Keep only allowed columns
            Object.keys(p).forEach((k) => {
              if (!['user_id', 'module_id', 'lesson_id', 'lesson_title', 'xp_earned', 'time_spent_minutes', 'completed_at'].includes(k)) delete p[k];
            });
            return true;
          });

          if (invalidEntries.length) {
            console.warn('[persistCompletions] some lesson payload entries were invalid and will be skipped', { userId, moduleId, invalidEntries });
          }

          if (!payload.length) {
            console.warn('[persistCompletions] no valid lesson_completions payload to upsert after sanitization', { userId, moduleId, attemptedPayloadCount: rawPayload.length });
            continue;
          }
          try {
            try {
              console.debug('[persistCompletions] upserting lesson_completions payload preview', { userId, moduleId, payloadPreview: payload.map(p => ({ user_id: p.user_id, module_id: p.module_id, lesson_id: p.lesson_id })) });
            } catch { /* ignore preview errors */ }
            // Use upsert with onConflict matching the table unique constraint to
            // atomically insert or update rows. Do NOT provide `id`/`created_at`
            // so the DB can populate defaults.
            const { data: insertData, error: insertErr, status, statusText } = await supabase
              .from('lesson_completions')
              .upsert(payload, { onConflict: 'user_id,module_id,lesson_id' });

            if (insertErr) {
              // Detect duplicate/unique-violation and treat as non-fatal (concurrent insert)
              const msg = String(insertErr?.message || insertErr || '');
              const isUniqueViolation = (insertErr as any)?.code === '23505' || /duplicate key|unique constraint|already exists/i.test(msg) || status === 409;
              if (isUniqueViolation) {
                console.warn('[persistCompletions] lesson_completions upsert conflict (ignored)', { userId, moduleId, payloadPreview: payload.map(p => ({ lesson_id: p.lesson_id })), insertErr, status, statusText });
              } else if (status === 403 || status === 400) {
                // RLS or bad request — re-check whether rows already exist and, if so,
                // treat the upsert as effectively successful to avoid noisy errors.
                try {
                  const { data: verify, error: verifyErr } = await supabase.from('lesson_completions').select('lesson_id').eq('user_id', userId).eq('module_id', moduleId).in('lesson_id', payload.map(p => p.lesson_id));
                  if (!verifyErr && Array.isArray(verify) && verify.length >= payload.length) {
                    console.warn('[persistCompletions] lesson_completions upsert returned 403/400 but rows exist; treating as success', { userId, moduleId, found: verify.length, attempted: payload.length });
                  } else {
                    console.error('[persistCompletions] lesson_completions upsert failed (403/400) and rows not confirmed', { userId, moduleId, payloadPreview: payload.map(p => ({ lesson_id: p.lesson_id })), insertErr, status, statusText, invalidEntries });
                    throw insertErr;
                  }
                } catch (ve) {
                  console.error('[persistCompletions] lesson_completions verify after 403/400 failed', { userId, moduleId, err: ve, insertErr });
                  throw insertErr;
                }
              } else {
                // Include any validation diagnostics if present, then throw
                console.error('[persistCompletions] lesson_completions upsert failed', { userId, moduleId, payloadPreview: payload.map(p => ({ lesson_id: p.lesson_id })), insertErr, status, statusText, invalidEntries });
                throw insertErr;
              }
            }
            console.debug('[persistCompletions] lesson_completions upserted', { userId, moduleId, inserted: Array.isArray(insertData) ? insertData.length : 0 });
          } catch (e) {
            console.error('[persistCompletions] exception during lesson_completions upsert', { userId, moduleId, payload, err: e });
            throw e;
          }
        }
      }

      // EXERCISES
      const exercises = Array.isArray(mod.completedExercises) ? mod.completedExercises : [];
      if (exercises.length) {
        console.debug('[persistCompletions] checking exercise_completions for', { userId, moduleId, exercises });
        const { data: existingEx, error: existingExErr } = await supabase
          .from('exercise_completions')
          .select('exercise_id')
          .eq('user_id', userId)
          .eq('module_id', moduleId)
          .in('exercise_id', exercises);
        if (existingExErr) throw existingExErr;
        const existingExIds = new Set(((existingEx || []) as any[]).map((r) => r.exercise_id));
        const toInsertEx = exercises.filter((id) => !existingExIds.has(id));
        if (toInsertEx.length) {
          const { data: exRows } = await supabase.from('exercises').select('id,title,xp_reward').in('id', toInsertEx as string[]);
          const titleMapEx: Record<string, string> = {};
          const titleMapExXp: Record<string, number> = {};
          (exRows || []).forEach((t: any) => { titleMapEx[t.id] = t.title; titleMapExXp[t.id] = Number.isFinite(Number(t.xp_reward)) ? Number(t.xp_reward) : 0; });
          // Build exercise payload and insert
          const payloadEx = toInsertEx.map((id) => ({
            user_id: userId,
            module_id: moduleId,
            exercise_id: id,
            exercise_title: titleMapEx[id] || id,
            submitted_code: '',
            is_correct: false,
            attempts: 1,
            hints_used: 0,
            time_spent_minutes: 0,
            xp_earned: titleMapExXp[id] || 0,
            completed_at: now
          }));
          const { error: insertErr } = await supabase.from('exercise_completions').insert(payloadEx);
          if (insertErr) {
            // similar handling for exercise_completions: if 403/400, verify existence
            const status = (insertErr as any)?.status || (insertErr as any)?.statusCode || null;
            if (status === 403 || status === 400) {
              try {
                const { data: verifyEx, error: verifyExErr } = await supabase.from('exercise_completions').select('exercise_id').eq('user_id', userId).eq('module_id', moduleId).in('exercise_id', toInsertEx);
                if (!verifyExErr && Array.isArray(verifyEx) && verifyEx.length >= toInsertEx.length) {
                  console.warn('[persistCompletions] exercise_completions insert returned 403/400 but rows exist; treating as success', { userId, moduleId, found: verifyEx.length, attempted: toInsertEx.length });
                } else {
                  console.error('[persistCompletions] exercise_completions insert failed (403/400) and rows not confirmed', { userId, moduleId, insertErr });
                  throw insertErr;
                }
              } catch (ve) {
                console.error('[persistCompletions] exercise_completions verify after 403/400 failed', { userId, moduleId, err: ve, insertErr });
                throw insertErr;
              }
            } else {
              throw insertErr;
            }
          }
        }
      }

      // PROJECT
      if (mod.projectCompleted) {
        console.debug('[persistCompletions] checking project_completions for', { userId, moduleId });
        const { data: existingProj, error: existingProjErr } = await supabase
          .from('project_completions')
          .select('project_id')
          .eq('user_id', userId)
          .eq('module_id', moduleId)
          .limit(1);
        if (existingProjErr) throw existingProjErr;
        const hasProj = (existingProj || []).length > 0;
        if (!hasProj) {
          // Try to locate the curriculum project row. Some schemas may not expose
          // `module_id` — if the initial query fails (400) fall back to looking
          // up by the conventional id `${moduleId}-project`.
          let proj: any = null;
          try {
            const r1: any = await supabase.from('projects').select('id,title,xp_reward').eq('module_id', moduleId).limit(1);
            if (!r1.error && Array.isArray(r1.data) && r1.data.length > 0) {
              proj = r1.data[0];
            } else {
              const r2: any = await supabase.from('projects').select('id,title,xp_reward').eq('id', `${moduleId}-project`).limit(1);
              if (!r2.error && Array.isArray(r2.data) && r2.data.length > 0) proj = r2.data[0];
            }
          } catch (e) {
            try {
              const r3: any = await supabase.from('projects').select('id,title,points,xp_reward').eq('id', `${moduleId}-project`).limit(1);
              if (!r3.error && Array.isArray(r3.data) && r3.data.length > 0) proj = r3.data[0];
            } catch { /* ignore */ }
          }
          const projXp = proj ? (Number.isFinite(Number(proj.xp_reward)) ? Number(proj.xp_reward) : (Number.isFinite(Number(proj.points)) ? Number(proj.points) : 0)) : 0;
          const payload = {
            user_id: userId,
            module_id: moduleId,
            project_id: proj?.id || `${moduleId}-project`,
            project_title: proj?.title || `${moduleId} project`,
            submitted_code: (mod && (mod as any).projectCode) ? (mod as any).projectCode : '',
            validation_results: {},
            completion_percentage: 100,
            is_passing: true,
            attempts: 1,
            time_spent_minutes: 0,
            xp_earned: projXp,
            completed_at: now
          };
          const { error: insertErr } = await supabase.from('project_completions').insert(payload);
          if (insertErr) {
            const msg = String((insertErr as any)?.message || insertErr || '');
            const status = (insertErr as any)?.status || (insertErr as any)?.statusCode || null;
            const isUniqueViolation = (insertErr as any)?.code === '23505' || /duplicate key|unique constraint|already exists/i.test(msg) || status === 409;
            if (isUniqueViolation) {
              console.warn('[persistCompletions] project_completions insert conflict (ignored)', { userId, moduleId, project_id: payload.project_id, insertErr, status });
            } else if (status === 403 || status === 400) {
              try {
                const { data: verifyProj, error: verifyProjErr } = await supabase.from('project_completions').select('project_id').eq('user_id', userId).eq('module_id', moduleId).eq('project_id', payload.project_id).limit(1);
                if (!verifyProjErr && Array.isArray(verifyProj) && verifyProj.length > 0) {
                  console.warn('[persistCompletions] project_completions insert returned 403/400 but row exists; treating as success', { userId, moduleId, found: verifyProj.length });
                } else {
                  console.error('[persistCompletions] project_completions insert failed (403/400) and row not confirmed', { userId, moduleId, insertErr });
                  throw insertErr;
                }
              } catch (ve) {
                console.error('[persistCompletions] project_completions verify after 403/400 failed', { userId, moduleId, err: ve, insertErr });
                throw insertErr;
              }
            } else {
              throw insertErr;
            }
          }
        }
      }

      // MODULE_PROGRESS upsert/update
      try {
        // Resolve module title using either `modules` or `curriculum_modules` tables
        let moduleTitle = moduleId;
        try {
          const r1: any = await supabase.from('modules').select('id,title').eq('id', moduleId).limit(1).maybeSingle();
          if (!r1.error && r1.data) moduleTitle = r1.data.title || moduleId;
        } catch (e) {
          try {
            const r2: any = await supabase.from('modules').select('id,title').eq('id', moduleId).limit(1).maybeSingle();
            if (!r2.error && r2.data) moduleTitle = r2.data.title || moduleId;
          } catch { /* ignore */ }
        }
        // compute xp_earned for module by summing persisted completion rows where available
        let moduleXp = 0;
        try {
          // Sum xp from lesson_completions and exercise_completions and project_completions for this user/module
          // Use no-space aliasing to avoid REST encoding issues; accept either 's' or 'sum' keys.
          // Fetch lesson_completions rows and sum client-side to avoid PostgREST aggregate 400s under RLS
          try {
            const rows: any = await supabase.from('lesson_completions').select('xp_earned').eq('user_id', userId).eq('module_id', moduleId);
            if (!rows.error && rows.data && Array.isArray(rows.data)) {
              moduleXp += rows.data.reduce((s: number, r: any) => s + (Number(r?.xp_earned) || 0), 0);
            } else if (rows && rows.error) {
              console.warn('[persistCompletions] lesson_completions fetch error', { userId, moduleId, error: rows.error, status: rows.status, details: rows });
            }
          } catch (e) {
            console.warn('[persistCompletions] lesson_completions fetch failed', { userId, moduleId, error: e });
          }

          // Fetch exercise_completions rows and sum client-side
          try {
            const rowsEx: any = await supabase.from('exercise_completions').select('xp_earned').eq('user_id', userId).eq('module_id', moduleId);
            if (!rowsEx.error && rowsEx.data && Array.isArray(rowsEx.data)) {
              moduleXp += rowsEx.data.reduce((s: number, r: any) => s + (Number(r?.xp_earned) || 0), 0);
            } else if (rowsEx && rowsEx.error) {
              console.warn('[persistCompletions] exercise_completions fetch error', { userId, moduleId, error: rowsEx.error, status: rowsEx.status, details: rowsEx });
            }
          } catch (e) {
            console.warn('[persistCompletions] exercise_completions fetch failed', { userId, moduleId, error: e });
          }

          // Fetch project_completions rows and sum client-side
          try {
            const rowsP: any = await supabase.from('project_completions').select('xp_earned').eq('user_id', userId).eq('module_id', moduleId);
            if (!rowsP.error && rowsP.data && Array.isArray(rowsP.data)) {
              moduleXp += rowsP.data.reduce((s: number, r: any) => s + (Number(r?.xp_earned) || 0), 0);
            } else if (rowsP && rowsP.error) {
              console.warn('[persistCompletions] project_completions fetch error', { userId, moduleId, error: rowsP.error, status: rowsP.status, details: rowsP });
            }
          } catch (e) {
            console.warn('[persistCompletions] project_completions fetch failed', { userId, moduleId, error: e });
          }
        } catch (e) { /* ignore aggregation failures - fallback below */ }

        const totalItems = ((mod.lessonOrder && mod.lessonOrder.length) || 0) + ((mod.completedExercises && mod.completedExercises.length) || 0) + (mod.projectCompleted ? 1 : 0);
        const payload = {
          user_id: userId,
          module_id: moduleId,
          module_title: moduleTitle,
          completion_percentage: ((mod.completedLessons || []).length + (mod.completedExercises || []).length + (mod.projectCompleted ? 1 : 0)) / Math.max(totalItems, 1) * 100,
          lessons_completed: (mod.completedLessons || []).length,
          exercises_completed: (mod.completedExercises || []).length,
          projects_completed: mod.projectCompleted ? 1 : 0,
          total_items: Math.max(totalItems, 1),
          xp_earned: Math.max(0, Math.round(moduleXp)),
          is_locked: false,
          is_completed: !!mod.projectCompleted,
          started_at: null,
          completed_at: mod.projectCompleted ? now : null
        } as any;

        const { error: upsertErr } = await supabase.from('module_progress').upsert(payload, { onConflict: ['user_id', 'module_id'] });
        if (upsertErr) throw upsertErr;
      } catch (mErr) {
        console.warn('[persistCompletions] module_progress upsert failed', { userId, moduleId, error: mErr });
      }

    } catch (err) {
      const e: any = new Error('PERSIST_COMPLETIONS_FAILED');
      e.userId = userId;
      e.moduleId = moduleId;
      e.original = err;
      throw e;
    }
  }
};
