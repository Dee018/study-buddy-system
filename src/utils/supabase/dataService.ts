/**
 * Supabase Data Service
 * 
 * Centralized service for all Supabase database operations
 * Provides type-safe methods for CRUD operations and real-time subscriptions
 */

import { supabase } from './client';
import safeUpsertUserProgress from './safeProgressUpsert';
import ProgressSyncManager from '../progressSyncManager';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserProfile {
  id: string;
  uuid: string;
  username: string;
  email: string; // Generated internally as username@studybuddy.local
  role: 'learner' | 'admin';
  created_at: string;
  last_login: string;
  is_active: boolean;
  profile_data?: Record<string, any>;
}

export interface UserProgress {
  id: string;
  user_id: string;
  completed_modules: string[];
  current_module?: string;
  last_active_module?: string;
  total_xp: number;
  level: number;
  updated_at: string;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  progress_percentage: number;
  completed_lessons: string[];
  exercises_completed: string[];
  project_completed: boolean;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface Module {
  id: string;
  week_number: number;
  title: string;
  description?: string;
  difficulty?: string;
  estimated_hours?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  module_data?: Record<string, any>;
}

export interface Lesson {
  id: string;
  module_id: string;
  order_index: number;
  title: string;
  content: string;
  lesson_type?: string;
  estimated_minutes?: number;
  xp_reward: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  lesson_data?: Record<string, any>;
}

export interface Exercise {
  id: string;
  module_id: string;
  order_index: number;
  title: string;
  description?: string;
  starter_code?: string;
  solution_code?: string;
  test_cases?: any[];
  hints?: string[];
  xp_reward: number;
  difficulty?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  exercise_data?: Record<string, any>;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  lessons_completed: number;
  exercises_completed: number;
  projects_completed: number;
  assessments_completed: number;
  total_xp: number;
  study_time_minutes: number;
  created_at: string;
}

export interface DeletedUser {
  id: string;
  user_id: string;
  uuid: string;
  username: string;
  email: string;
  deletion_type: 'self' | 'admin';
  // The DB view exposes both snake_case and camelCase projections in different environments.
  // Keep both shapes optional to remain compatible with either variant.
  deleted_at?: string;
  deletedAt?: string;
  deleted_by?: string;
  deletedBy?: string;
  user_data?: Record<string, any>;
  can_restore: boolean;
}

export interface IssueReport {
  id: string;
  user_id: string;
  issue_type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  metadata?: Record<string, any>;
}

export interface LessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  module_id: string;
  xp_earned: number;
  time_spent_minutes?: number;
  created_at: string;
}

// Admin API base (contact API). Default to localhost:4001 for local dev when VITE_ADMIN_API_URL is not set
const ADMIN_API_BASE = (import.meta.env.VITE_ADMIN_API_URL as string) || 'http://localhost:4001';

export interface ExerciseCompletion {
  id: string;
  user_id: string;
  exercise_id: string;
  module_id: string;
  submitted_code: string;
  xp_earned: number;
  time_spent_minutes?: number;
  // FIXED: renamed attempts_count to attempts to match Supabase schema
  attempts: number;
  created_at: string;
}

export interface ProjectCompletion {
  id: string;
  user_id: string;
  project_id: string;
  module_id: string;
  submitted_code: string;
  score: number;
  xp_earned: number;
  time_spent_minutes?: number;
  created_at: string;
}

export interface LearningStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source_type: 'lesson' | 'exercise' | 'project' | 'assessment' | 'streak' | 'bonus';
  source_id?: string;
  description?: string;
  created_at: string;
}

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================
// ============================================================================
// AUTHENTICATION SERVICE (Clean, RLS/FK-safe)
// ============================================================================

export class AuthService {
  /**
   * Generate internal email from username
   */
  private static generateInternalEmail(username: string): string {
    const domain = (import.meta.env.VITE_INTERNAL_EMAIL_DOMAIN as string) || 'example.com';
    return `${username.toLowerCase()}@${domain}`;
  }

  /**
   * Sign up a new user with username + password
   * Returns Supabase user and session
   */
  // New signature: signUp(email, password, username, uuid)
  // Backwards-compatible: if first arg looks like a username and no email provided,
  // callers passing (username, password, uuid) will still work (deprecated path).
  static async signUp(a: string, b: string, c: string, d?: string) {
    let email: string;
    let username: string;
    let password: string;
    let uuid: string | undefined;

    // detect older call signature: (username, password, uuid)
    if (typeof d === 'undefined' && /^[a-zA-Z0-9_]+$/.test(a) && c && b) {
      // legacy: a=username, b=password, c=uuid
      username = a;
      password = b;
      uuid = c;
      email = this.generateInternalEmail(username);
    } else {
      // new: a=email, b=password, c=username, d=uuid
      email = a;
      password = b;
      username = c;
      uuid = d;
    }

    // Create Supabase Auth user
    // IMPORTANT: Store username + recovery UUID in auth.user metadata so the DB trigger
    // on `auth.users` can create a complete `user_profiles` row server-side.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          uuid,
        },
      },
    });
    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Ensure the client has an active session for this new user so RLS checks
    // (auth.uid() = user_id) permit immediate browser writes. Sign in now
    // using the generated internal email and the provided password.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in after signUp failed:', signInError);
      throw signInError;
    }

    console.debug('[AuthService.signUp] signUp completed, signed in user', (signInData.user || authData.user)?.id);

    // Wait briefly for server-side profile creation (trigger on auth.users).
    // Without a `user_profiles` row, progress writes will fail due to FK constraints.
    const waitForProfile = async (userId: string, timeoutMs = 2500) => {
      const start = Date.now();
      let delay = 120;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const probe = await supabase.from('user_profiles').select('id').eq('id', userId).maybeSingle();
          if (probe && !probe.error && probe.data?.id) return true;
        } catch {
          // ignore and continue retrying until timeout
        }
        if (Date.now() - start > timeoutMs) return false;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(600, Math.floor(delay * 1.5));
      }
    };

    const userId = (signInData.user || authData.user)?.id;
    if (userId) {
      const ok = await waitForProfile(userId);
      if (!ok) {
        throw new Error(
          'Account provisioning incomplete: Supabase Auth user exists but no user_profiles row was created. ' +
          'This is a server-side schema/trigger issue (auth.users → user_profiles).'
        );
      }

      // Ensure the server-created `user_profiles` row matches the exact values
      // the user provided at signup. Some DB triggers fall back to deriving the
      // username from the email local-part when metadata is missing; fix that
      // here (best-effort) by upserting the canonical username/email for this
      // user id. Handle unique constraint failures gracefully.
      try {
        const { data: existingProfile, error: fetchErr } = await supabase
          .from('user_profiles')
          .select('id, username, email')
          .eq('id', userId)
          .maybeSingle();

        if (!fetchErr && existingProfile) {
          // Only attempt to fix when values differ
          if ((existingProfile.username || '') !== (username || '') || (existingProfile.email || '') !== (email || '')) {
            const { data: upserted, error: upsertErr } = await supabase
              .from('user_profiles')
              .upsert([{ id: userId, username, email, uuid }], { onConflict: 'id' })
              .select()
              .maybeSingle();

            if (upsertErr) {
              // Likely a unique-constraint conflict (username/email already taken) or other DB error.
              const detail = (upsertErr as any)?.details || '';
              const message = (upsertErr as any)?.message || String(upsertErr);
              console.warn('[AuthService.signUp] could not enforce requested username/email on user_profiles', upsertErr);

              // If this is a unique-constraint violation, surface a friendly error
              // so the UI can inform the user to choose a different username/email.
              const code = (upsertErr as any)?.code || (upsertErr as any)?.status;
              if (String(code) === '23505' || /duplicate key value violates unique constraint/i.test(message) || /Key \(/i.test(detail)) {
                if (/username/i.test(detail) || /user_profiles_username_key/i.test(message) || /Key \(username\)/i.test(detail)) {
                  throw new Error('Username already taken');
                }
                if (/email/i.test(detail) || /user_profiles_email_lower_unique_idx/i.test(message) || /Key \(email\)/i.test(detail)) {
                  throw new Error('Email already registered');
                }
                throw new Error('Unique constraint violation while creating user profile');
              }
            } else {
              console.debug('[AuthService.signUp] enforced requested username/email on user_profiles', { userId, username, email });
            }
          }
        }
      } catch (e) {
        console.warn('[AuthService.signUp] error verifying/updating user_profiles', e);
      }

      // Insert a canonical mapping row into `user_accounts` linking our username to the
      // Supabase auth user id. This must happen after a successful auth.signUp.
      try {
        const payload = { user_code: username, user_id: userId };
        // Use upsert with onConflict to avoid duplicate-key 409 conflicts when
        // a mapping already exists (e.g. created by a trigger or concurrent write).
        const { data: uaData, error: uaError, status: uaStatus } = await supabase
          .from('user_accounts')
          .upsert(payload, { onConflict: 'user_code' })
          .select()
          .maybeSingle();

        if (uaError) {
          // Log PostgREST error details for debugging. Do not block signup on this.
          console.warn('[AuthService.signUp] user_accounts upsert returned error', { payload, uaStatus, uaError });
        } else {
          console.debug('[AuthService.signUp] user_accounts upsert success', { payload, uaData });
        }
      } catch (e) {
        console.warn('[AuthService.signUp] user_accounts upsert failed (non-fatal)', { userId, username, error: e });
      }

      // Create initial progress row using the safe upsert helper (handles conflicts and retries)
      console.debug('[AuthService.signUp] creating initial progress for user', userId);
      const progressRow = await safeUpsertUserProgress(userId, { completedModules: [], total_xp: 0, level: 1 }, { merge: false, retries: 4 });
      console.debug('[AuthService.signUp] progress upsert result for user', userId, { progressRow });
    }

    return { user: signInData.user || authData.user, session: signInData.session || authData.session };
  }

  /**
   * Sign in existing user
   */
  static async signIn(username: string, password: string) {
    const unameRaw = (username || '').trim();
    const uname = unameRaw.toLowerCase();

    // Try to resolve a real user email from `user_profiles` first (case-insensitive).
    // Use ilike to avoid mismatches caused by username casing.
    let email: string | null = null;
    try {
      const probe = await supabase.from('user_profiles').select('email').ilike('username', uname).maybeSingle();
      if (probe && !probe.error && probe.data && (probe.data as any).email) {
        email = (probe.data as any).email;
      }
    } catch (e) {
      // ignore and continue to other fallbacks
    }

    // If profile lookup didn't return an email, try the `user_accounts` mapping
    // which links canonical user_code -> user_id. This covers cases where the
    // profile exists but the username column differs or email was not set.
    if (!email) {
      try {
        const map = await supabase.from('user_accounts').select('user_id').ilike('user_code', uname).maybeSingle();
        if (map && !map.error && map.data && (map.data as any).user_id) {
          const userId = (map.data as any).user_id;
          const prof = await supabase.from('user_profiles').select('email').eq('id', userId).maybeSingle();
          if (prof && !prof.error && prof.data && (prof.data as any).email) {
            email = (prof.data as any).email;
          }
        }
      } catch (e) {
        // ignore and fallback
      }
    }

    // Fallback to legacy internal-email generation when no explicit email exists
    if (!email) email = this.generateInternalEmail(uname);

    // Log the email being used for sign-in to aid debugging of invalid-credentials
    console.debug('[AuthService.signIn] attempting signIn for username:', username, 'email:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.debug('[AuthService.signIn] signInWithPassword response', { data, error });
    if (error) {
      console.error('[AuthService.signIn] signIn failed', { email, username, message: error.message || error, status: (error as any)?.status });
      throw error;
    }

    // Update last login timestamp (best-effort): only PATCH if the column exists.
    if (data.user) {
      const payload: Record<string, any> = { last_login: new Date().toISOString() };
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === undefined || v === null) delete payload[k];
      });

      if (Object.keys(payload).length > 0) {
        // Quick probe: attempt to select the `last_login` column to detect schema mismatch.
        let canPatch = true;
        try {
          const probe = await supabase
            .from('user_profiles')
            .select('last_login')
            .eq('id', data.user.id)
            .limit(1);
          if (probe.error) {
            // Conservatively skip patching if any probe error occurs (likely missing column)
            canPatch = false;
            console.warn('[ProfilePatch] probe error detecting last_login column, skipping patch:', probe.error?.message || probe.error);
          }
        } catch (e: any) {
          canPatch = false;
          console.warn('[ProfilePatch] probe exception detecting last_login column, skipping patch:', e?.message || e);
        }

        if (!canPatch) {
          // skip updating last_login to avoid 400s when column missing
          console.warn('[ProfilePatch] skipping last_login update: probe indicates column absent or probe failed');
        } else {
          const maxAttempts = 3;
          let attempt = 0;
          while (attempt < maxAttempts) {
            attempt += 1;
            try {
              const { error } = await supabase
                .from('user_profiles')
                .update(payload)
                .eq('id', data.user.id);
              if (error) throw error;
              break;
            } catch (e: any) {
              const isLast = attempt >= maxAttempts;
              console.warn(
                `[ProfilePatch] attempt ${attempt}/${maxAttempts} failed for user ${data.user.id}`,
                isLast ? 'final' : 'retrying',
                e?.message || e
              );
              if (isLast) break;
              const backoff = 100 * Math.pow(2, attempt - 1);
              await new Promise((res) => setTimeout(res, backoff));
            }
          }
        }
      }
    }

    // Ensure a minimal user_profiles row exists for this auth user so subsequent
    // NOTE: The DB must guarantee `user_profiles` existence (trigger on auth.users).
    // Client will NOT attempt to create or repair `user_profiles`. We simply hydrate progress.
    if (data.user) {
      const userId = data.user.id;
      try {
        await ProgressSyncManager.initUserProgress(userId);
        await ProgressSyncManager.triggerQueueProcessingForUser(userId);
      } catch (e) {
        console.warn('[AuthService.signIn] progress hydration/queue flush failed', e);
      }
    }

    return data;
  }

  /**
   * Verify a recovery UUID exists and return basic mapping info
   */
  static async verifyRecoveryUUID(uuid: string): Promise<{ username: string; userId: string } | null> {
    try {
      const { data: profile, error } = await supabase.from('user_profiles').select('id, username').eq('uuid', uuid).maybeSingle();
      if (error || !profile) return null;
      return { username: (profile as any).username, userId: (profile as any).id };
    } catch (e) {
      return null;
    }
  }

  /**
   * Resolve a UUID to full profile (id, username, email, uuid)
   * Note: this lookup is UUID-only (does not accept username or email)
   */
  static async getProfileByUuid(uuid: string): Promise<{ id: string; username: string; email?: string; uuid?: string } | null> {
    try {
      const { data, error } = await supabase.from('user_profiles').select('id, username, email, uuid').eq('uuid', uuid).maybeSingle();
      if (error || !data) return null;
      return { id: (data as any).id, username: (data as any).username, email: (data as any).email, uuid: (data as any).uuid };
    } catch (e) {
      return null;
    }
  }

  /**
   * Send a password reset email via Supabase for the given email if it matches the username.
   * Returns { ok: true } when Supabase accepted the reset request.
   */
  static async sendPasswordResetByEmail(email: string, username: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const uname = (username || '').trim().toLowerCase();
      const probe = await supabase.from('user_profiles').select('id, username, email').eq('email', email).maybeSingle();
      if (!probe || probe.error) return { ok: false, error: probe?.error?.message || 'Account lookup failed' };
      const profile = probe.data as any;
      if (!profile || (profile.username || '').toLowerCase() !== uname) {
        return { ok: false, error: 'Email and username do not match' };
      }

      // Build the redirect URL for the password reset link. Prefer explicit
      // `VITE_PASSWORD_RESET_REDIRECT` env var; fall back to current origin when
      // running in the browser. Append `/reset-password` so the user lands on
      // our dedicated reset page when they click the email link.
      const baseRedirect = (import.meta.env.VITE_PASSWORD_RESET_REDIRECT as string) || (typeof window !== 'undefined' ? window.location.origin : undefined);
      const redirectTo = baseRedirect ? `${baseRedirect.replace(/\/$/, '')}/reset-password` : undefined;
      // supabase-js v2 provides resetPasswordForEmail; if not available this may throw.
      // We call it to instruct Supabase to email the user a password reset link.
      // @ts-ignore
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return { ok: false, error: error.message || String(error) };
      return { ok: true };
    } catch (e: any) {
      console.error('[AuthService.sendPasswordResetByEmail] error', e);
      return { ok: false, error: e?.message || String(e) };
    }
  }

  /**
   * Reset password using recovery UUID
   */
  static async resetPasswordWithUUID(uuid: string, newPassword: string, username?: string): Promise<boolean> {
    try {
      // POST to server-side recovery endpoint which uses the service role to update the auth user
      // allow caller to optionally include username in the body by overloading the uuid parameter
      // If caller passed a string like 'username||uuid' we won't parse that here; higher-level code should pass username separately.
      const body: any = { uuid, newPassword };
      if (username) body.username = username;

      const resp = await fetch(ADMIN_API_BASE + '/api/recovery/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Recovery reset failed: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      return !!data?.ok;
    } catch (e) {
      console.error('[resetPasswordWithUUID] error', e);
      return false;
    }
  }

  /**
   * Verify username + uuid and request a short-lived recovery token from server
   */
  static async verifyRecoveryCredentials(username: string, uuid: string): Promise<{ ok: boolean; token?: string; error?: string }> {
    try {
      const resp = await fetch(ADMIN_API_BASE + '/api/recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, uuid })
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) return { ok: false, error: data?.error || `Server ${resp.status}` };
      return { ok: true, token: data?.token };
    } catch (err) {
      console.error('[verifyRecoveryCredentials] error', err);
      return { ok: false, error: 'Network error' };
    }
  }

  /**
   * Request a short-lived Supabase session token for username+uuid pair
   */
  static async recoveryLogin(username: string, uuid: string): Promise<{ ok: boolean; access_token?: string; expires_in?: number; error?: string }> {
    try {
      const resp = await fetch(ADMIN_API_BASE + '/api/recovery/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, uuid })
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) return { ok: false, error: data?.error || `Server ${resp.status}` };
      return { ok: true, access_token: data?.access_token, expires_in: data?.expires_in };
    } catch (err) {
      console.error('[recoveryLogin] error', err);
      return { ok: false, error: 'Network error' };
    }
  }

  /**
   * Change password using a recovery token issued by `verifyRecoveryCredentials`.
   */
  static async changePasswordWithToken(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const resp = await fetch(ADMIN_API_BASE + '/api/recovery/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) return { ok: false, error: data?.error || `Server ${resp.status}` };
      return { ok: true };
    } catch (err) {
      console.error('[changePasswordWithToken] error', err);
      return { ok: false, error: 'Network error' };
    }
  }

  /**
   * Change the current signed-in user's password.
   */
  static async changePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword } as any);
      if (error) throw error;
    } catch (e) {
      console.error('[AuthService.changePassword] error', e);
      throw e;
    }
  }

  /**
   * Best-effort account deletion: delete user_profiles row and sign the user out.
   * Note: full removal from `auth.users` requires a service role/admin operation.
   */
  static async deleteAccount(userId: string): Promise<void> {
    try {
      // Delete the user_profiles row - DB should cascade or rely on RLS triggers
      const { error } = await supabase.from('user_profiles').delete().eq('id', userId);
      if (error) {
        console.warn('[AuthService.deleteAccount] failed to delete user_profiles row', error);
      }

      // Sign out local session
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore sign-out errors
      }
    } catch (e) {
      console.error('[AuthService.deleteAccount] error', e);
      throw e;
    }
  }

  /**
   * Archive deleted user information into `deleted_users` table.
   * Called when a user performs self-deletion so admins can review/restore.
   */
  static async archiveDeletedUser(userId: string, opts: { username?: string; email?: string; uuid?: string; reason?: string; deletion_type?: 'self' | 'admin' } = {}): Promise<boolean> {
    // Returns true when archival succeeded (either via direct DB insert or admin fallback), false otherwise
    try {
      const payload: any = {
        user_id: userId,
        username: opts.username || null,
        email: opts.email || null,
        uuid: opts.uuid || null,
        deletion_type: opts.deletion_type || (opts.deletion_type === 'admin' ? 'admin' : 'self'),
        reason: opts.reason || 'User-initiated account closure',
        deleted_at: new Date().toISOString(),
      };

      // First attempt: write using current Supabase client/session
      const { error } = await supabase.from('deleted_users').insert(payload);
      if (!error) return true;
      console.warn('[AuthService.archiveDeletedUser] insert returned error', error);

      // If the error indicates a missing column (schema mismatch), try a safer payload
      try {
        const msg = String((error as any)?.message || '');
        if (/deletion_type/i.test(msg) || /could not find the 'deletion_type'/i.test(msg) || (error as any)?.code === 'PGRST204') {
          const safePayload = { ...payload } as any;
          delete safePayload.deletion_type;
          const { error: e2 } = await supabase.from('deleted_users').insert(safePayload);
          if (!e2) return true;
          console.warn('[AuthService.archiveDeletedUser] retry without deletion_type failed', e2);
        }
      } catch (e) {
        console.warn('[AuthService.archiveDeletedUser] safe-payload retry failed', e);
      }

      // If direct insert failed (likely due to RLS), attempt admin-service fallback if configured
      const adminUrl = (import.meta.env.VITE_ADMIN_API_URL as string) || '';
      if (adminUrl) {
        try {
          const url = `${adminUrl.replace(/\/$/, '')}/archive-deleted-user`;
          // Try to obtain a current access token to forward for auth validation
          let token: string | null = null;
          try {
            const sess = await supabase.auth.getSession();
            // sess.data.session may be undefined in some supabase versions
            token = (sess as any)?.data?.session?.access_token || (sess as any)?.session?.access_token || null;
          } catch (e) {
            // ignore - we'll still try the request without a token
            token = null;
          }

          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });

          if (resp.ok) return true;
          const text = await resp.text().catch(() => '');
          console.warn('[AuthService.archiveDeletedUser] admin fallback failed', resp.status, text);
        } catch (e) {
          console.warn('[AuthService.archiveDeletedUser] admin fallback request failed', e);
        }
      }

      return false;
    } catch (e) {
      console.warn('[AuthService.archiveDeletedUser] failed', e);
      return false;
    }
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    // In the browser we prefer a local sign-out (clears cached session) to avoid
    // noisy network failures like: POST /auth/v1/logout?scope=global (Fetch failed).
    // If you need a global revoke, do it server-side or add an explicit admin action.
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' } as any);
      if (error) {
        // Fallback to legacy API (or different supabase-js versions)
        const legacy = await supabase.auth.signOut();
        if (legacy.error) throw legacy.error;
      }
    } catch (e) {
      // Best-effort: never block UI logout on network issues.
      console.warn('[AuthService.signOut] best-effort signOut failed; local state should still be cleared by callers', e);
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  }

  /**
   * Check whether a username already exists in `user_profiles`.
   * Uses a case-insensitive check by lowercasing the input; usernames are
   * stored lower-case by the DB trigger on auth.users.
   */
  static async usernameExists(username: string): Promise<boolean> {
    if (!username) return false;
    const uname = username.toLowerCase();
    try {
      const { data, error } = await supabase.from('user_profiles').select('id').eq('username', uname).maybeSingle();
      if (error) {
        console.warn('[AuthService.usernameExists] probe failed, assuming available', { username, error });
        return false;
      }
      return !!(data && (data as any).id);
    } catch (e) {
      console.warn('[AuthService.usernameExists] exception, assuming available', { username, e });
      return false;
    }
  }

  /**
   * Check whether an email already exists in `user_profiles`.
   * Case-insensitive check using lowercasing the input.
   */
  static async emailExists(email: string): Promise<boolean> {
    if (!email) return false;
    const e = email.toLowerCase();
    try {
      const { data, error } = await supabase.from('user_profiles').select('id').eq('email', e).maybeSingle();
      if (error) {
        console.warn('[AuthService.emailExists] probe failed, assuming available', { email, error });
        return false;
      }
      return !!(data && (data as any).id);
    } catch (ex) {
      console.warn('[AuthService.emailExists] exception, assuming available', { email, ex });
      return false;
    }
  }

  /**
   * Update a user's username.
   * - Ensures the new username is available (case-insensitive)
   * - Updates Supabase Auth user metadata/email and the user_profiles row
   * - Upserts the `user_accounts` mapping row
   */
  static async updateUsername(userId: string, newUsername: string): Promise<void> {
    const uname = (newUsername || '').trim().toLowerCase();
    if (!uname) throw new Error('Invalid username');

    // Load existing profile to get current email/username
    const { data: currentProfile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('id, email, username')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr) {
      console.error('[AuthService.updateUsername] failed to load current profile', profileErr);
      throw profileErr;
    }
    if (!currentProfile || !(currentProfile as any).id) {
      throw new Error('User profile not found');
    }

    // Check availability excluding current user
    const { data: conflict, error: probeErr } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', uname)
      .neq('id', userId)
      .maybeSingle();

    if (probeErr) {
      console.warn('[AuthService.updateUsername] availability probe failed', probeErr);
      throw probeErr;
    }
    if (conflict && (conflict as any).id) {
      throw new Error('Username already taken');
    }

    const newEmail = this.generateInternalEmail(uname);

    // Attempt to update the auth user's email via an admin/service endpoint, if configured.
    // This avoids requiring the client to re-authenticate and uses a secure service-role key.
    const adminApi = (import.meta.env.VITE_ADMIN_API_URL as string) || ''; // set in deployment to point to your admin function
    if (adminApi) {
      try {
        // include current session access token to prove caller identity
        const session = await supabase.auth.getSession();
        const token = (session as any)?.data?.session?.access_token || '';

        const resp = await fetch(`${adminApi.replace(/\/$/, '')}/update-auth-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, email: newEmail, username: uname }),
        });
        if (!resp.ok) {
          const body = await resp.text();
          console.error('[AuthService.updateUsername] admin API returned error', resp.status, body);
          throw new Error('Admin API failed to update auth user');
        }
      } catch (e) {
        console.error('[AuthService.updateUsername] admin API call failed', e);
        throw e;
      }
    } else {
      // Fallback to client-side auth update (may require re-auth and can fail due to email restrictions)
      try {
        const { error: authErr } = await supabase.auth.updateUser({ email: newEmail, data: { username: uname } } as any);
        if (authErr) {
          console.error('[AuthService.updateUsername] supabase.auth.updateUser error', authErr);
          throw authErr;
        }
      } catch (e) {
        throw e;
      }
    }

    // Now update the user_profiles row. If this fails, attempt to rollback auth change.
    try {
      const { error: upErr } = await supabase
        .from('user_profiles')
        .update({ username: uname, email: newEmail })
        .eq('id', userId);
      if (upErr) {
        console.error('[AuthService.updateUsername] failed updating user_profiles', upErr);
        // attempt rollback of auth change
        try {
          await supabase.auth.updateUser({ email: (currentProfile as any).email, data: { username: (currentProfile as any).username } } as any);
        } catch (rbErr) {
          console.error('[AuthService.updateUsername] rollback of auth update failed', rbErr);
        }
        throw upErr;
      }

      // Best-effort: upsert mapping in user_accounts if present in schema
      try {
        const payload = { user_code: uname, user_id: userId };
        await supabase.from('user_accounts').upsert(payload, { onConflict: 'user_code' });
      } catch (e) {
        console.warn('[AuthService.updateUsername] user_accounts upsert non-fatal error', e);
      }
    } catch (e) {
      throw e;
    }
  }

  /**
   * Update fields on the user_profiles table only.
   * This method does NOT touch Supabase Auth. It will throw on DB errors.
   */
  static async updateUserProfile(userId: string, updates: Partial<{ username: string }>): Promise<void> {
    if (!userId) throw new Error('Missing userId');
    if (!updates || Object.keys(updates).length === 0) return;

    // Only allow specific keys - enforce shape here
    const payload: Record<string, any> = {};
    if (typeof updates.username === 'string') payload.username = updates.username.trim().toLowerCase();

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', userId);

      if (error) {
        console.error('[AuthService.updateUserProfile] failed updating user_profiles', error);
        throw error;
      }
    } catch (e) {
      throw e;
    }
  }

  // Username availability is determined by Supabase Auth at signup.
  // Do not perform separate server-side username probes to avoid split-of-truth.

  // Username existence checks should rely on Supabase Auth responses during signUp.
  // Legacy server-side probes were removed to avoid split-of-truth between auth and local tables.

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[AuthService.getUserProfile] error querying user_profiles', { userId, error });
      throw error;
    }

    if (!data) {
      // Treat missing profile as a schema/DB responsibility error — do not attempt client-side repair.
      const msg = `Missing user_profiles row for user ${userId}. This is a schema/server-side issue.`;
      console.error('[AuthService.getUserProfile] ', msg);
      throw new Error(msg);
    }

    if (data && !(data as any).role) (data as any).role = 'learner';
    return data;
  }
}


// ============================================================================
// PROGRESS SERVICE
// ============================================================================

export class ProgressService {
  /**
   * Get user progress
   */
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('[ProgressService] 🔍 getUserProgress raw data from DB:', {
        userId,
        hasData: !!data,
        total_xp: data?.total_xp,
        current_level: data?.current_level,
        rawData: data
      });

      if (error) {
        throw error;
      }

      if (!data) {
        // No progress found - create initial progress
        console.log('[ProgressService] No progress found, initializing...');
        return await this.initializeUserProgress(userId);
      }

      console.log('[ProgressService] ✅ Returning progress with total_xp:', (data as any).total_xp);
      return data as any;
    } catch (error) {
      console.error('Get user progress error:', error);
      throw error;
    }
  }

  /**
   * Initialize user progress
   */
  static async initializeUserProgress(userId: string): Promise<UserProgress> {
    try {
      return await safeUpsertUserProgress(userId, { completedModules: [], total_xp: 0, level: 1 }, { merge: false, retries: 3 });
    } catch (error) {
      console.error('Initialize user progress error:', error);
      throw error;
    }
  }

  /**
   * Update user progress
   */
  static async updateUserProgress(
    userId: string,
    updates: Partial<UserProgress>
  ): Promise<UserProgress> {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Update user progress error:', error);
      throw error;
    }
  }

  /**
   * Get module progress for a user
   */
  static async getUserModuleProgress(userId: string): Promise<ModuleProgress[]> {
    try {
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user module progress error:', error);
      return [];
    }
  }

  /**
   * Get specific module progress
   */
  static async getModuleProgress(
    userId: string,
    moduleId: string
  ): Promise<ModuleProgress | null> {
    try {
      const { data, error } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return data as any;
    } catch (error) {
      console.error('Get module progress error:', error);
      return null;
    }
  }

  /**
   * Start a new module
   */
  static async startModule(userId: string, moduleId: string): Promise<ModuleProgress> {
    try {
      // Check if module progress already exists
      const existing = await this.getModuleProgress(userId, moduleId);
      if (existing) return existing;

      // Create new module progress
      const { data, error } = await supabase
        .from('module_progress')
        .insert({
          user_id: userId,
          module_id: moduleId,
          progress_percentage: 0,
          lessons_completed: 0,
          exercises_completed: 0,
          projects_completed: 0,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Start module error:', error);
      throw error;
    }
  }

  /**
   * Update module progress
   */
  static async updateModuleProgress(
    userId: string,
    moduleId: string,
    updates: Partial<ModuleProgress>
  ): Promise<ModuleProgress> {
    try {
      const { data, error } = await supabase
        .from('module_progress')
        .update(updates)
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Update module progress error:', error);
      throw error;
    }
  }

  /**
   * Upsert module progress (create or update)
   * Backwards-compatible adapter used by migration and other callers.
   */
  static async upsertModuleProgress(
    userId: string,
    moduleId: string,
    payload: Partial<ModuleProgress>
  ): Promise<ModuleProgress | null> {
    try {
      const toUpsert = Object.assign({}, payload, { user_id: userId, module_id: moduleId });
      const { data, error } = await supabase
        .from('module_progress')
        .upsert(toUpsert, { onConflict: ['user_id', 'module_id'] })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Upsert module progress error:', error);
      return null;
    }
  }

  /**
   * Complete a module
   */
  static async completeModule(userId: string, moduleId: string): Promise<void> {
    try {
      // Update module progress
      await supabase
        .from('module_progress')
        .update({
          progress_percentage: 100,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      // Add to completed modules in user progress
      const userProgress = await this.getUserProgress(userId);
      if (userProgress) {
        const completedModules = [...(userProgress.completed_modules || [])];
        if (!completedModules.includes(moduleId)) {
          completedModules.push(moduleId);

          await supabase
            .from('user_progress')
            .update({ completed_modules: completedModules })
            .eq('user_id', userId);
        }
      }

      // Determine next module in sequence and set it as current_module
      const getNextModuleId = (id: string): string | null => {
        if (!id) return null;
        const m = id.match(/^(.*?)(\d+)$/);
        if (!m) return null;
        const prefix = m[1];
        const num = parseInt(m[2], 10);
        if (!isFinite(num)) return null;
        if (num >= 8) return null; // no next module after 8
        return `${prefix}${num + 1}`;
      };

      const nextModuleId = getNextModuleId(moduleId);
      if (nextModuleId) {
        // Update user's current_module and last_active_module
        await supabase
          .from('user_progress')
          .update({ current_module: nextModuleId, last_active_module: nextModuleId })
          .eq('user_id', userId);

        // Ensure a module_progress row exists for the next module (unlock it)
        try {
          await this.upsertModuleProgress(userId, nextModuleId, {
            user_id: userId,
            module_id: nextModuleId,
            progress_percentage: 0,
            started_at: new Date().toISOString()
          });
        } catch (e) {
          // Non-fatal: if upsert fails, log and continue
          console.warn('Failed to upsert next module progress', { userId, nextModuleId, error: e });
        }
      } else {
        // No next module (completed final module) — clear current_module
        await supabase
          .from('user_progress')
          .update({ current_module: null })
          .eq('user_id', userId);
      }
    } catch (error) {
      console.error('Complete module error:', error);
      throw error;
    }
  }

  /**
   * Complete a lesson
   */
  static async completeLesson(
    userId: string,
    moduleId: string,
    lessonId: string,
    xpEarned: number,
    timeSpent?: number
  ): Promise<LessonCompletion> {
    try {
      // Check if lesson already completed
      const { data: existing } = await supabase
        .from('lesson_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (existing) return existing;

      // Create lesson completion
      const { data, error } = await supabase
        .from('lesson_completions')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          module_id: moduleId,
          xp_earned: xpEarned,
          time_spent_minutes: timeSpent,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Update module progress
      const moduleProgress = await this.getModuleProgress(userId, moduleId);
      if (moduleProgress) {
        // module_progress stores integer counters for completed items
        const current = Number(moduleProgress.lessons_completed || 0);
        await this.updateModuleProgress(userId, moduleId, {
          lessons_completed: current + 1,
        });
      }

      // Update daily activity
      await this.updateDailyActivity(userId, { lessons_completed: 1, total_xp: xpEarned, study_time_minutes: timeSpent || 0 });

      return data;
    } catch (error) {
      console.error('Complete lesson error:', error);
      throw error;
    }
  }

  /**
   * Complete an exercise
   */
  static async completeExercise(
    userId: string,
    moduleId: string,
    exerciseId: string,
    submittedCode: string,
    xpEarned: number,
    timeSpent?: number,
    attempts: number = 1
  ): Promise<ExerciseCompletion> {
    try {
      // Check if exercise already completed
      const { data: existing } = await supabase
        .from('exercise_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .maybeSingle();

      if (existing) return existing;

      // Create exercise completion
      // Lookup exercise title and include it in the completion payload.
      // This ensures `exercise_title` is recorded for better UI/history.
      let exerciseTitle: string | null = null;
      try {
        const { data: exRow } = await supabase
          .from('exercises')
          .select('title')
          .eq('id', exerciseId)
          .maybeSingle();
        if (exRow && (exRow as any).title) exerciseTitle = (exRow as any).title;
      } catch (e) {
        // ignore lookup failures; proceed without title
      }

      const { data, error } = await supabase
        .from('exercise_completions')
        .insert({
          user_id: userId,
          exercise_id: exerciseId,
          module_id: moduleId,
          submitted_code: submittedCode,
          xp_earned: xpEarned,
          time_spent_minutes: timeSpent,
          attempts: attempts,
          exercise_title: exerciseTitle,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Update module progress
      const moduleProgress = await this.getModuleProgress(userId, moduleId);
      if (moduleProgress) {
        // module_progress stores integer counters for completed items
        const current = Number(moduleProgress.exercises_completed || 0);
        await this.updateModuleProgress(userId, moduleId, {
          exercises_completed: current + 1,
        });
      }

      // Update daily activity
      await this.updateDailyActivity(userId, { exercises_completed: 1, total_xp: xpEarned, study_time_minutes: timeSpent || 0 });

      return data;
    } catch (error) {
      console.error('Complete exercise error:', error);
      throw error;
    }
  }

  /**
   * Complete a project
   */
  static async completeProject(
    userId: string,
    moduleId: string,
    projectId: string,
    submittedCode: string,
    score: number,
    xpEarned: number,
    timeSpent?: number
  ): Promise<ProjectCompletion> {
    try {
      // Check if project already completed
      const { data: existing } = await supabase
        .from('project_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('project_id', projectId)
        .maybeSingle();

      if (existing) return existing;

      // Create project completion
      const { data, error } = await supabase
        .from('project_completions')
        .insert({
          user_id: userId,
          project_id: projectId,
          module_id: moduleId,
          submitted_code: submittedCode,
          score,
          xp_earned: xpEarned,
          time_spent_minutes: timeSpent,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // Update module progress: increment projects_completed counter
      const moduleProgress = await this.getModuleProgress(userId, moduleId);
      if (moduleProgress) {
        const current = Number(moduleProgress.projects_completed || moduleProgress.projectsCompleted || 0);
        await this.updateModuleProgress(userId, moduleId, {
          projects_completed: current + 1,
        });
      }

      // Update daily activity
      await this.updateDailyActivity(userId, { projects_completed: 1, total_xp: xpEarned, study_time_minutes: timeSpent || 0 });

      return data;
    } catch (error) {
      console.error('Complete project error:', error);
      throw error;
    }
  }

  /**
   * Get daily activity
   */
  static async getDailyActivity(userId: string, days: number = 30): Promise<DailyActivity[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('activity_date', cutoffDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get daily activity error:', error);
      return [];
    }
  }

  /**
   * Update daily activity
   */
  static async updateDailyActivity(
    userId: string,
    activity: {
      lessons_completed?: number;
      exercises_completed?: number;
      projects_completed?: number;
      assessments_completed?: number;
      total_xp?: number;
      study_time_minutes?: number;
    }
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get or create today's activity
      const { data: existing } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .maybeSingle();

      if (existing) {
        // Update existing activity (use schema column names)
        await supabase
          .from('daily_activity')
          .update({
            lessons_completed: (existing.lessons_completed || 0) + (activity.lessons_completed || 0),
            exercises_completed: (existing.exercises_completed || 0) + (activity.exercises_completed || 0),
            projects_completed: (existing.projects_completed || 0) + (activity.projects_completed || 0),
            assessments_taken: (existing.assessments_taken || existing.assessments_completed || 0) + (activity.assessments_completed || 0),
            xp_earned: (existing.xp_earned || existing.total_xp || 0) + (activity.total_xp || 0),
            time_spent_minutes: (existing.time_spent_minutes || existing.study_time_minutes || 0) + (activity.study_time_minutes || 0),
          })
          .eq('user_id', userId)
          .eq('activity_date', today);
      } else {
        // Create new activity (use schema column names)
        await supabase
          .from('daily_activity')
          .insert({
            user_id: userId,
            activity_date: today,
            lessons_completed: activity.lessons_completed || 0,
            exercises_completed: activity.exercises_completed || 0,
            projects_completed: activity.projects_completed || 0,
            assessments_taken: activity.assessments_completed || 0,
            xp_earned: activity.total_xp || 0,
            time_spent_minutes: activity.study_time_minutes || 0,
          });
      }
    } catch (error) {
      console.error('Update daily activity error:', error);
    }
  }

  /**
   * Get learning streak
   */
  static async getLearningStreak(userId: string): Promise<LearningStreak | null> {
    try {
      const { data, error } = await supabase
        .from('learning_streaks')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return await this.initializeStreak(userId);
      return data as any;
    } catch (error) {
      console.error('Get learning streak error:', error);
      return null;
    }
  }

  /**
   * Initialize learning streak
   */
  static async initializeStreak(userId: string): Promise<LearningStreak> {
    try {
      const { data, error } = await supabase
        .from('learning_streaks')
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Initialize streak error:', error);
      throw error;
    }
  }

  /**
   * Update learning streak
   */
  static async updateLearningStreak(userId: string): Promise<LearningStreak> {
    try {
      const streak = await this.getLearningStreak(userId);
      if (!streak) {
        return await this.initializeStreak(userId);
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivityDate = new Date(streak.last_activity_date);
      const todayDate = new Date(today);

      // Calculate days difference
      const daysDiff = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = streak.current_streak;
      let newLongestStreak = streak.longest_streak;

      if (daysDiff === 0) {
        // Same day - no change
        return streak;
      } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
        if (newStreak > newLongestStreak) {
          newLongestStreak = newStreak;
        }
      } else {
        // Streak broken - reset to 1
        newStreak = 1;
      }

      // Update streak
      const { data, error } = await supabase
        .from('learning_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
        })
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Update learning streak error:', error);
      throw error;
    }
  }
}

// ============================================================================
// CURRICULUM SERVICE
// ============================================================================

export class CurriculumService {
  /**
   * Get all modules
   */
  static async getModules(publishedOnly: boolean = true): Promise<Module[]> {
    const primaryTable = 'modules';
    const altTable = 'curriculum_modules';

    const makeQuery = (table: string) => {
      let q: any = supabase.from(table).select('*').order('week_number', { ascending: true });
      if (publishedOnly) q = q.eq('is_published', true);
      return q;
    };

    // Try primary table first, fallback to alternative if table missing
    let res: any = await makeQuery(primaryTable);
    if (res.error) {
      const msg = String(res.error?.message || res.error || '');
      // Match several possible Supabase/Postgres messages that indicate the table is missing
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (res.error?.status === 404)) {
        // try alternative table
        res = await makeQuery(altTable);
      }
    }

    if (res.error) {
      console.error('Get modules error:', res.error?.message || res.error, res.error);
      return [];
    }

    return res.data || [];
  }

  /**
   * Get module by ID
   */
  static async getModule(moduleId: string): Promise<Module | null> {
    const primaryTable = 'modules';
    const altTable = 'curriculum_modules';

    const q1 = await supabase.from(primaryTable).select('*').eq('id', moduleId).maybeSingle();
    if (!q1.error) return q1.data as any;

    const msg = String(q1.error?.message || q1.error || '');
    if (/not found|does not exist|404/i.test(msg) || (q1.error?.status === 404)) {
      const q2 = await supabase.from(altTable).select('*').eq('id', moduleId).maybeSingle();
      if (!q2.error) return q2.data as any;
      console.error('Get module error (alt):', q2.error);
      return null;
    }

    console.error('Get module error:', q1.error);
    return null;
  }

  /**
   * Create or update module (admin only)
   */
  static async upsertModule(module: Partial<Module>): Promise<Module> {
    const primaryTable = 'curriculum_modules';
    const altTable = 'modules';

    try {
      const { data, error } = await supabase.from(primaryTable).upsert(module).select().maybeSingle();
      if (!error) return data as any;

      const msg = String(error?.message || error || '');
      if (/not found|does not exist|404/i.test(msg) || (error?.status === 404)) {
        const r2 = await supabase.from(altTable).upsert(module).select().maybeSingle();
        if (r2.error) throw r2.error;
        return r2.data as any;
      }

      throw error;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete module (admin only)
   */
  static async deleteModule(moduleId: string) {
    const primaryTable = 'modules';
    const altTable = 'curriculum_modules';

    let res = await supabase.from(primaryTable).delete().eq('id', moduleId);
    if (res.error) {
      const msg = String(res.error?.message || res.error || '');
      if (/not found|does not exist|404/i.test(msg) || (res.error?.status === 404)) {
        res = await supabase.from(altTable).delete().eq('id', moduleId);
      }
    }

    if (res.error) throw res.error;
  }

  /**
   * Get lessons for a module
   */
  static async getLessons(moduleId: string, publishedOnly: boolean = true): Promise<Lesson[]> {
    const primaryTable = 'lessons';
    const altTable = 'curriculum_lessons';

    const makeQuery = (table: string) => {
      let q: any = supabase.from(table).select('*').eq('module_id', moduleId).order('order_index', { ascending: true });
      if (publishedOnly) q = q.eq('is_published', true);
      return q;
    };

    let res: any = await makeQuery(primaryTable);
    if (res.error) {
      const msg = String(res.error?.message || res.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (res.error?.status === 404)) {
        res = await makeQuery(altTable);
      }
    }

    if (res.error) {
      console.error('Get lessons error:', res.error);
      return [];
    }

    return res.data || [];
  }

  /**
   * Get exercises for a module
   */
  static async getExercises(moduleId: string, publishedOnly: boolean = true): Promise<Exercise[]> {
    const primaryTable = 'exercises';
    const altTable = 'curriculum_exercises';

    const makeQuery = (table: string) => {
      let q: any = supabase.from(table).select('*').eq('module_id', moduleId).order('order_index', { ascending: true });
      if (publishedOnly) q = q.eq('is_published', true);
      return q;
    };

    let res: any = await makeQuery(primaryTable);
    if (res.error) {
      const msg = String(res.error?.message || res.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (res.error?.status === 404)) {
        res = await makeQuery(altTable);
      }
    }

    if (res.error) {
      console.error('Get exercises error:', res.error);
      return [];
    }

    return res.data || [];
  }

  /**
   * Upsert lesson (admin only)
   */
  static async upsertLesson(lesson: Partial<Lesson>): Promise<Lesson> {
    const { data, error } = await supabase
      .from('curriculum_lessons')
      .upsert(lesson)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as any;
  }

  /**
   * Delete lesson (admin only)
   */
  static async deleteLesson(lessonId: string) {
    let res: any = await supabase.from('curriculum_lessons').delete().eq('id', lessonId);
    if (res.error) {
      const msg = String(res.error?.message || res.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (res.error?.status === 404)) {
        res = await supabase.from('curriculum_lessons').delete().eq('id', lessonId);
      }
    }
    if (res.error) throw res.error;
  }

  /**
   * Upsert exercise (admin only)
   */
  static async upsertExercise(exercise: Partial<Exercise>): Promise<Exercise> {
    let r: any = await supabase.from('curriculum_exercises').upsert(exercise).select().maybeSingle();
    if (r.error) {
      const msg = String(r.error?.message || r.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (r.error?.status === 404)) {
        r = await supabase.from('curriculum_exercises').upsert(exercise).select().maybeSingle();
      }
    }
    if (r.error) throw r.error;
    return r.data as any;
  }

  /**
   * Delete exercise (admin only)
   */
  static async deleteExercise(exerciseId: string) {
    let res: any = await supabase.from('curriculum_exercises').delete().eq('id', exerciseId);
    if (res.error) {
      const msg = String(res.error?.message || res.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (res.error?.status === 404)) {
        res = await supabase.from('curriculum_exercises').delete().eq('id', exerciseId);
      }
    }
    if (res.error) throw res.error;
  }

  /**
   * Get lesson by ID
   */
  static async getLesson(lessonId: string): Promise<Lesson | null> {
    let r: any = await supabase.from('curriculum_lessons').select('*').eq('id', lessonId).maybeSingle();
    if (r.error) {
      const msg = String(r.error?.message || r.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (r.error?.status === 404)) {
        r = await supabase.from('curriculum_lessons').select('*').eq('id', lessonId).maybeSingle();
      }
    }
    if (r.error) {
      console.error('Get lesson error:', r.error);
      return null;
    }
    return r.data as any;
  }

  /**
   * Get exercise by ID
   */
  static async getExercise(exerciseId: string): Promise<Exercise | null> {
    let r: any = await supabase.from('curriculum_exercises').select('*').eq('id', exerciseId).maybeSingle();
    if (r.error) {
      const msg = String(r.error?.message || r.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (r.error?.status === 404)) {
        r = await supabase.from('curriculum_exercises').select('*').eq('id', exerciseId).maybeSingle();
      }
    }
    if (r.error) {
      console.error('Get exercise error:', r.error);
      return null;
    }
    return r.data as any;
  }
}

// ============================================================================
// ADMIN SERVICE
// ============================================================================

export class AdminService {
  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get all users error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get dormant users (90+ days inactive)
   */
  static async getDormantUsers(): Promise<UserProfile[]> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .lt('last_login', ninetyDaysAgo.toISOString());

    if (error) {
      console.error('Get dormant users error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get deleted users
   */
  static async getDeletedUsers(): Promise<DeletedUser[]> {
    // Read from the view to ensure admins see a curated, permissioned representation
    const { data, error } = await supabase
      .from('deleted_users_view')
      .select('*')
      .order('deletedAt', { ascending: false });

    console.debug('[DataService.getDeletedUsers] response', { data, error });
    if (error) {
      console.error('Get deleted users error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(userId: string, deletedBy: string, deletionType: 'self' | 'admin') {
    // Get user data first
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userData) {
      // Archive to deleted_users using canonical snake_case columns defined in schema
      // Map fields conservatively to avoid referencing non-existent columns like `user_data` or `can_restore`.
      // Pull a few summary fields where available.
      const { data: progressRow } = await supabase.from('user_progress').select('modules_completed, total_xp').eq('user_id', userId).maybeSingle();
      const modules_completed = progressRow?.modules_completed ?? 0;
      const total_xp = progressRow?.total_xp ?? 0;

      await supabase
        .from('deleted_users')
        .insert({
          user_id: userData.id,
          uuid: userData.uuid,
          username: userData.username,
          email: userData.email,
          deletion_reason: deletionType === 'admin' ? 'admin_deleted' : 'self_deleted',
          total_xp: total_xp,
          level: userData.level || null,
          modules_completed: modules_completed,
          certificates_earned: 0,
          deleted_by: deletionType === 'admin' ? deletedBy : null,
          deleted_at: new Date().toISOString()
        });
    }

    // Delete from user_profiles (cascade will handle related data)
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }

  /**
   * Get issue reports
   */
  static async getIssueReports(status?: string): Promise<IssueReport[]> {
    let query = supabase
      .from('issue_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get issue reports error:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Create issue report
   */
  static async createIssueReport(
    userId: string,
    issueType: string,
    title: string,
    description: string,
    priority: string = 'medium'
  ) {
    const { data, error } = await supabase
      .from('issue_reports')
      .insert({
        user_id: userId,
        issue_type: issueType,
        title,
        description,
        priority,
        status: 'open',
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as any;
  }

  /**
   * Update issue report
   */
  static async updateIssueReport(issueId: string, updates: Partial<IssueReport>) {
    const { data, error } = await supabase
      .from('issue_reports')
      .update(updates)
      .eq('id', issueId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as any;
  }

  /**
   * Get system analytics
   */
  static async getSystemAnalytics() {
    // Total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString());

    // Total XP across all users
    const { data: xpData } = await supabase
      .from('user_progress')
      .select('total_xp');

    const totalXP = xpData?.reduce((sum, user) => sum + (user.total_xp || 0), 0) || 0;

    // Completion rates
    const { count: totalCompletions } = await supabase
      .from('lesson_completions')
      .select('*', { count: 'exact', head: true });

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalXP,
      totalCompletions: totalCompletions || 0,
    };
  }
}

// ============================================================================
// REALTIME SERVICE
// ============================================================================

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to user progress updates
   */
  static subscribeToUserProgress(userId: string, callback: (payload: any) => void): () => void {
    const channelName = `user_progress:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_progress',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Subscribe to module progress updates
   */
  static subscribeToModuleProgress(userId: string, callback: (payload: any) => void): () => void {
    const channelName = `module_progress:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_progress',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      channel.unsubscribe();
      this.channels.delete(channelName);
    };
  }

  /**
   * Cleanup all subscriptions
   */
  static cleanupAll() {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

// ============================================================================
// XP SERVICE
// ============================================================================

export class XPService {
  // XP Level Configuration
  private static readonly BASE_XP_PER_LEVEL = 1000;
  private static readonly XP_MULTIPLIER = 1.5;

  // Base XP values
  static readonly LESSON_XP = 50;
  static readonly EXERCISE_XP = 100;
  static readonly PROJECT_XP = 200;
  static readonly MODULE_XP = 150;
  static readonly ASSESSMENT_XP = 300;
  static readonly LEVELUP_XP = 500;

  /**
   * Award XP to user
   */
  static async awardXP(
    userId: string,
    amount: number,
    sourceType: 'lesson' | 'exercise' | 'project' | 'assessment' | 'streak' | 'bonus',
    sourceId?: string,
    description?: string
  ): Promise<void> {
    try {
      // Create XP transaction
      await supabase
        .from('xp_transactions')
        .insert({
          user_id: userId,
          amount,
          source: sourceType,
          source_id: sourceId,
          description,
        });

      // Update user's total XP
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .maybeSingle();

      if (userProgress) {
        const newTotalXP = (userProgress.total_xp || 0) + amount;
        const newLevel = this.calculateLevel(newTotalXP);

        // previous level may be stored in `current_level` (string) or `level` (legacy)
        const prevLevelNum = Number(userProgress.current_level ?? (userProgress as any).level) || 1;

        await supabase
          .from('user_progress')
          .update({
            total_xp: newTotalXP,
            current_level: String(newLevel),
          })
          .eq('user_id', userId);

        // Award bonus XP for level up
        if (newLevel > prevLevelNum) {
          await this.awardXP(
            userId,
            this.LEVELUP_XP,
            'bonus',
            undefined,
            `Level Up! Reached Level ${newLevel}`
          );
        }
      }
    } catch (error) {
      console.error('Award XP error:', error);
      throw error;
    }
  }

  /**
   * Calculate level from total XP
   */
  static calculateLevel(totalXP: number): number {
    let level = 1;
    let xpNeeded = 0;

    while (xpNeeded <= totalXP) {
      const levelXP = Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.XP_MULTIPLIER, level - 1));
      xpNeeded += levelXP;

      if (xpNeeded <= totalXP) {
        level++;
      }
    }

    return level;
  }

  /**
   * Calculate XP needed for next level
   */
  static calculateXPForNextLevel(currentLevel: number): number {
    return Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.XP_MULTIPLIER, currentLevel));
  }

  /**
   * Calculate XP needed to reach a specific level
   */
  static calculateTotalXPForLevel(targetLevel: number): number {
    let totalXP = 0;

    for (let level = 1; level < targetLevel; level++) {
      totalXP += Math.floor(this.BASE_XP_PER_LEVEL * Math.pow(this.XP_MULTIPLIER, level - 1));
    }

    return totalXP;
  }

  /**
   * Get XP transactions for user
   */
  static async getXPTransactions(
    userId: string,
    limit: number = 50
  ): Promise<XPTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get XP transactions error:', error);
      return [];
    }
  }

  /**
   * Get progress to next level
   */
  static getProgressToNextLevel(totalXP: number, currentLevel: number): {
    currentLevelXP: number;
    nextLevelXP: number;
    progressPercentage: number;
  } {
    const currentLevelTotalXP = this.calculateTotalXPForLevel(currentLevel);
    const nextLevelTotalXP = this.calculateTotalXPForLevel(currentLevel + 1);

    const currentLevelXP = totalXP - currentLevelTotalXP;
    const xpNeededForNext = nextLevelTotalXP - currentLevelTotalXP;

    const progressPercentage = Math.min(100, Math.floor((currentLevelXP / xpNeededForNext) * 100));

    return {
      currentLevelXP,
      nextLevelXP: xpNeededForNext,
      progressPercentage,
    };
  }
}