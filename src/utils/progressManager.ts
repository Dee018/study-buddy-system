import { UserProgress, ModuleDetailedProgress } from '../data/javaCurriculum';
import { allModules } from '../data/comprehensiveBeginnerCurriculum';
import { supabase } from './supabase/client';
import { supabaseCall } from './supabase/withRetries';
import safeUpsertUserProgress from './supabase/safeProgressUpsert';
import { ProgressSyncManager } from './progressSyncManager';

async function getAuthUserId(): Promise<string | null> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.user?.id ?? null;
}


function isUUID(v: string | null | undefined): boolean {
  if (!v || typeof v !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export interface DailyActivity {
  date: string; // ISO date string (YYYY-MM-DD)
  lessonsCompleted: number;
  exercisesCompleted: number;
  projectsCompleted: number;
  assessmentsCompleted: number;
  totalXP: number;
  studyTimeMinutes: number;
  studyTimeLessons: number;
  studyTimeExercises: number;
  studyTimeProjects: number;
  studyTimeAssessments: number;
}

// Top-level async helpers for Supabase-backed operations
export const ProgressManagerAsync = {
  async clearProgressAsync(userId: string): Promise<void> {
    try {
      await supabaseCall(() => supabase.from('user_progress').delete().eq('user_id', userId), { retries: 2, timeoutMs: 6000 });
    } catch (err) {
      console.warn('Failed to delete progress row from Supabase:', err);
      // Failed to delete progress row from Supabase (silent)
    }

    try {
      // Clear in-memory cache and notify listeners
      ProgressManager.progressCache.delete(userId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId, progress: { completedModules: [], moduleProgress: {}, currentModule: undefined, lastActiveModule: undefined } } }));
      }
    } catch (err) {
      console.error('Error clearing progress cache:', err);
    }
  }
};

export interface AssessmentResult {
  assessmentId: string;
  moduleId: string;
  score: number;
  maxScore: number;
  completedAt: string;
  topics: { [topic: string]: number }; // Topic scores
}

export interface TopicMastery {
  topic: string;
  attempts: number;
  totalScore: number;
  averageScore: number;
  lastAttemptDate: string;
}

export interface EnhancedUserProgress extends UserProgress {
  dailyActivity?: { [date: string]: DailyActivity };
  assessmentResults?: AssessmentResult[];
  topicMastery?: { [topic: string]: TopicMastery };
  currentStreak?: number;
  longestStreak?: number;
  lastActivityDate?: string;
  lastUpdated?: string;
}

export class ProgressManager {
  private static readonly PROGRESS_KEY = 'study_buddy_progress';
  // In-memory cache for user progress to keep synchronous API behavior
  static progressCache: Map<string, UserProgress & { lastUpdated?: string }> = new Map();

  // Pending saves queue for retries when Supabase is unavailable
  private static pendingSaves: Map<string, { progress: UserProgress; attempts: number }> = new Map();
  private static pendingFlushTimer: number | null = null;

  private static schedulePendingFlush() {
    if (this.pendingFlushTimer != null) return;
    this.pendingFlushTimer = window.setInterval(() => {
      if (this.pendingSaves.size === 0) {
        if (this.pendingFlushTimer != null) {
          clearInterval(this.pendingFlushTimer);
          this.pendingFlushTimer = null;
        }
        return;
      }

      for (const [userId, entry] of Array.from(this.pendingSaves.entries())) {
        // Try to persist again
        if (!isUUID(userId)) {
          console.warn('ProgressManager: skipping Supabase upsert for non-UUID userId', userId);
          // ProgressManager: skipping Supabase upsert for non-UUID userId (silent)
          this.pendingSaves.delete(userId);
          continue;
        }

        // Ensure the client is authenticated as the same user before attempting RLS-protected writes
        (async () => {
          try {
            const authUserId = await getAuthUserId();
            if (!authUserId || authUserId !== userId) {
              // Still not authenticated as this user — keep queued for later
              return;
            }

            await safeUpsertUserProgress(userId, entry.progress, { merge: false, retries: 3, last_updated: new Date().toISOString() });

            this.pendingSaves.delete(userId);
          } catch (err) {
            entry.attempts += 1;
            if (entry.attempts > 5) {
              console.warn('Giving up on saving progress for', userId, err);
              // Giving up on saving progress for user (silent)
              this.pendingSaves.delete(userId);
            }
          }
        })();
      }
    }, 5000);
  }

  // Get today's date in YYYY-MM-DD format (using local timezone)
  private static getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convert a Date object to YYYY-MM-DD format (using local timezone)
  private static dateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Save user progress to localStorage
  // SUPABASE TODO: Replace with Supabase database insert/update
  static saveProgress(userId: string, progress: UserProgress): void {
    try {
      if (typeof window === 'undefined') return; // Prevent SSR issues
      // Prepare cached record with lastUpdated
      const cached = {
        ...progress,
        lastUpdated: new Date().toISOString()
      } as UserProgress & { lastUpdated?: string };

      // Always write to in-memory cache under the provided userId for immediate UI
      this.progressCache.set(userId, cached);
      window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId, progress: cached } }));

      // Note: If callers need to seed the in-memory cache without causing
      // the global `progressUpdated` event (to avoid feedback loops), use
      // `importProgress` below which performs a silent cache update.

      // Background persistence: always prefer the authenticated Supabase user id
      (async () => {
        try {
          // If caller passed a non-UUID id, we'll still write to cache, but
          // persistence must use the canonical auth id when available.
          const authUserId = await getAuthUserId();
          const writeId = (authUserId && isUUID(authUserId)) ? authUserId : (isUUID(userId) ? userId : null);

          if (!writeId) {
            // Can't persist without a UUID — queue under the original key for later
            const existing = this.pendingSaves.get(userId);
            this.pendingSaves.set(userId, { progress: cached, attempts: existing ? existing.attempts + 1 : 1 });
            this.schedulePendingFlush();
            console.warn('ProgressManager: no canonical UUID available, queued for retry', userId);
            // No canonical UUID available, queued for retry (silent)
            return;
          }

          // If canonical id differs, reflect cached progress under canonical id
          if (writeId !== userId) {
            this.progressCache.set(writeId, { ...cached });
            window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId: writeId, progress: this.progressCache.get(writeId) } }));
          }

          // Attempt upsert. Only treat network/timeout-like failures as retryable.
          try {
            await safeUpsertUserProgress(writeId, cached, { merge: false, retries: 3, last_updated: cached.lastUpdated });
          } catch (err) {
            // Normalize error and inspect for retryable conditions
            const normalized = (err && (err instanceof Error ? err : new Error(String(err)))) as Error & { status?: number; code?: string; original?: any };

            const status = (normalized as any).status || (normalized.original && normalized.original.status);
            const code = (normalized as any).code || (normalized.original && normalized.original.code);

            // Treat FK_MISSING_PROFILE as retryable (will succeed after profile creation)
            const isRetryable = (code === 'FK_MISSING_PROFILE') || !status || (typeof status === 'number' && status >= 500 && status < 600) || /timed out|timeout|NetworkError/i.test(normalized.message || '');

            if (isRetryable) {
              const existing = this.pendingSaves.get(writeId) || this.pendingSaves.get(userId);
              const key = writeId;
              this.pendingSaves.set(key, { progress: cached, attempts: existing ? existing.attempts + 1 : 1 });
              this.schedulePendingFlush();
              console.warn('ProgressManager: transient error persisting progress, queued for retry:', normalized.message || normalized);
              // Transient error persisting progress, queued for retry (silent)
            } else {
              // Non-retryable (RLS, validation) — log for debugging but do not queue
              console.error('ProgressManager: non-retryable error persisting progress:', normalized.message || normalized);
            }
          }
        } catch (outerErr) {
          // Unexpected error obtaining auth or scheduling; queue under original id
          const existing = this.pendingSaves.get(userId);
          this.pendingSaves.set(userId, { progress: cached, attempts: existing ? existing.attempts + 1 : 1 });
          this.schedulePendingFlush();
          // Unexpected error obtaining auth or scheduling; queue under original id (silent)
        }
      })();
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  // Import progress into in-memory cache without emitting events or persisting.
  // Use this when hydrating from server to avoid re-triggering listeners.
  static importProgress(userId: string, progress: UserProgress & { lastUpdated?: string }) {
    try {
      if (typeof window === 'undefined') return;
      const cached = {
        ...progress,
        lastUpdated: progress.lastUpdated || new Date().toISOString()
      } as UserProgress & { lastUpdated?: string };
      this.progressCache.set(userId, cached);
    } catch (err) {
      console.error('ProgressManager.importProgress error:', err);
    }
  }

  // Load user progress from localStorage
  // SUPABASE TODO: Replace with Supabase database query
  static loadProgress(userId: string): UserProgress {
    try {
      if (typeof window === 'undefined') {
        // Return default progress for SSR
        return {
          completedModules: [],
          moduleProgress: {},
          currentModule: undefined,
          lastActiveModule: undefined
        };
      }

      // Prefer server-hydrated cached progress (Supabase authoritative)
      const serverCached = ProgressSyncManager.getCachedProgress(userId);
      if (serverCached) {
        return serverCached as unknown as UserProgress;
      }

      // Return from in-memory cache if available
      const cached = this.progressCache.get(userId);
      if (cached) {
        const { lastUpdated, ...progress } = cached as any;
        void lastUpdated;
        return progress as UserProgress;
      }

      // Kick off background fetch from Supabase to populate cache
      (async () => {
        try {
          const row = await supabaseCall(() => supabase.from('user_progress').select('progress, last_updated').eq('user_id', userId).maybeSingle(), {
            retries: 2,
            timeoutMs: 6000
          }) as any | null;

          if (row && row.progress) {
            const p = { ...(row.progress as UserProgress), lastUpdated: row.last_updated } as UserProgress & { lastUpdated?: string };
            this.progressCache.set(userId, p);
            window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId, progress: p } }));
          }
        } catch (err) {
          // Ignored - background fetch should not break UI
        }
      })();

      // Return default progress for new users
      return {
        completedModules: [],
        moduleProgress: {},
        currentModule: undefined,
        lastActiveModule: undefined
      };
    }





    catch (error) {
      console.error('Error loading progress:', error);
      return {
        completedModules: [],
        moduleProgress: {},
        currentModule: undefined,
        lastActiveModule: undefined
      };
    }
  }

  // Get all progress data
  // SUPABASE TODO: Replace with Supabase database query
  private static getAllProgress(): { [userId: string]: UserProgress & { lastUpdated?: string } } {
    try {
      if (typeof window === 'undefined') return {};
      const result: { [userId: string]: UserProgress & { lastUpdated?: string } } = {};
      for (const [userId, progress] of this.progressCache.entries()) {
        result[userId] = progress;
      }
      return result;
    } catch (error) {
      console.error('Error reading progress cache:', error);
      return {};
    }
  }

  /**
   * Fetch all progress rows from Supabase and populate cache (async)
   */
  static async fetchAllProgressFromServer(): Promise<void> {
    try {
      const rows = await supabaseCall(() => supabase.from('user_progress').select('user_id, progress, last_updated'), {
        retries: 2,
        timeoutMs: 8000
      }) as any[] | null;

      if (rows && Array.isArray(rows)) {
        rows.forEach(r => {
          const p = { ...(r.progress as UserProgress), lastUpdated: r.last_updated } as UserProgress & { lastUpdated?: string };
          this.progressCache.set(r.user_id, p);
        });
        // Optionally emit an event indicating full refresh
        window.dispatchEvent(new CustomEvent('progressCacheRefreshed'));
      }
    } catch (err) {
      console.warn('Failed to fetch all progress from Supabase:', err);
      // Failed to fetch all progress from Supabase (silent)
    }
  }

  // Mark a module as completed
  static completeModule(userId: string, moduleId: string): UserProgress {
    const currentProgress = this.loadProgress(userId);

    // Add to completed modules if not already there
    if (!currentProgress.completedModules.includes(moduleId)) {
      currentProgress.completedModules.push(moduleId);
    }

    // IMPORTANT: DO NOT replace the detailed progress object with a number
    // Keep the detailed progress (completedLessons, completedExercises, projectCompleted)
    // so users can review their completed work
    const existingProgress = currentProgress.moduleProgress[moduleId];
    if (typeof existingProgress === 'object') {
      // Already has detailed progress - keep it and just mark completion
      const detailedProgress = existingProgress as ModuleDetailedProgress;
      detailedProgress.completed = true; // Add completion marker
      currentProgress.moduleProgress[moduleId] = detailedProgress;
    } else {
      // Old format or no progress - set to 100 for backwards compatibility
      currentProgress.moduleProgress[moduleId] = 100;
    }

    // Clear current module since it's completed
    if (currentProgress.currentModule === moduleId) {
      currentProgress.currentModule = undefined;
    }

    // Update last active module
    currentProgress.lastActiveModule = moduleId;

    this.saveProgress(userId, currentProgress);
    return currentProgress;
  }

  // Update module progress
  static updateModuleProgress(userId: string, moduleId: string, progress: number | { completedLessons?: string[], completedExercises?: string[], projectCompleted?: boolean }): UserProgress {
    const currentProgress = this.loadProgress(userId);

    // Handle both number (old format) and object (new format) progress
    if (typeof progress === 'number') {
      currentProgress.moduleProgress[moduleId] = Math.min(100, Math.max(0, progress));
    } else {
      // New format for detailed progress tracking
      const existingProgress = typeof currentProgress.moduleProgress[moduleId] === 'object'
        ? currentProgress.moduleProgress[moduleId] as ModuleDetailedProgress
        : { completedLessons: [], completedExercises: [], projectCompleted: false };

      currentProgress.moduleProgress[moduleId] = {
        ...existingProgress,
        ...progress
      };
    }

    // Set as current module if not completed
    const progressValue = typeof currentProgress.moduleProgress[moduleId] === 'number'
      ? currentProgress.moduleProgress[moduleId]
      : 0;

    if (typeof progressValue === 'number' && progressValue < 100) {
      currentProgress.currentModule = moduleId;
    } else if (typeof currentProgress.moduleProgress[moduleId] === 'object') {
      // For object-based progress, don't auto-complete
      currentProgress.currentModule = moduleId;
    } else {
      // Mark as completed if 100%
      return this.completeModule(userId, moduleId);
    }

    // Update last active module
    currentProgress.lastActiveModule = moduleId;

    this.saveProgress(userId, currentProgress);
    return currentProgress;
  }

  // Complete an exercise in a module
  static completeExercise(userId: string, moduleId: string, exerciseId: string, xpEarned: number = 100, submittedCode?: string): UserProgress {
    const currentProgress = this.loadProgress(userId);
    const moduleProgress = typeof currentProgress.moduleProgress[moduleId] === 'object'
      ? currentProgress.moduleProgress[moduleId] as ModuleDetailedProgress
      : { completedLessons: [], completedExercises: [], projectCompleted: false };

    if (!moduleProgress.completedExercises) {
      moduleProgress.completedExercises = [];
    }

    if (!moduleProgress.completedExercises.includes(exerciseId)) {
      moduleProgress.completedExercises.push(exerciseId);
      // Record daily activity (estimate 10-15 minutes per exercise)
      this.recordActivity(userId, 'exercise', xpEarned, 12);
    }

    // Store the submitted code for review
    if (submittedCode) {
      if (!moduleProgress.exerciseCodes) {
        moduleProgress.exerciseCodes = {};
      }
      moduleProgress.exerciseCodes[exerciseId] = submittedCode;
    }

    const updatedProgress = this.updateModuleProgress(userId, moduleId, moduleProgress);

    // Check if module is now fully complete and auto-complete if so
    return this.checkAndAutoCompleteModule(userId, moduleId, updatedProgress);
  }

  // Get stored exercise code for review
  static getExerciseCode(userId: string, moduleId: string, exerciseId: string): string | null {
    const currentProgress = this.loadProgress(userId);
    const moduleProgress = currentProgress.moduleProgress[moduleId];

    if (typeof moduleProgress === 'object') {
      const detailedProgress = moduleProgress as ModuleDetailedProgress;
      return detailedProgress.exerciseCodes?.[exerciseId] || null;
    }

    return null;
  }

  // Get stored project code for review
  static getProjectCode(userId: string, moduleId: string): string | null {
    const currentProgress = this.loadProgress(userId);
    const moduleProgress = currentProgress.moduleProgress[moduleId];

    if (typeof moduleProgress === 'object') {
      const detailedProgress = moduleProgress as ModuleDetailedProgress;
      return detailedProgress.projectCode || null;
    }

    return null;
  }

  // Check if a module is fully completed (all lessons, exercises, and project done)
  static isModuleCompleted(userId: string, moduleId: string): boolean {
    const currentProgress = this.loadProgress(userId);

    // Check if module is in the completed modules array
    if (currentProgress.completedModules.includes(moduleId)) {
      return true;
    }

    // Check the detailed progress
    const moduleProgress = currentProgress.moduleProgress[moduleId];
    if (!moduleProgress || typeof moduleProgress !== 'object') {
      return false;
    }

    const detailedProgress = moduleProgress as ModuleDetailedProgress;

    // Try to find the module in the consolidated modules list (modules 1-8)
    let module = allModules.find(m => m.id === moduleId);

    // If not found with exact ID, try alternative ID formats
    if (!module) {
      if (moduleId.startsWith('module-')) {
        const enhancedId = moduleId.replace('module-', 'beginner-module-');
        module = allModules.find(m => m.id === enhancedId);
      } else if (moduleId.startsWith('beginner-module-')) {
        const standardId = moduleId.replace('beginner-module-', 'module-');
        module = allModules.find(m => m.id === standardId);
      }
    }

    if (!module) {
      return false;
    }

    // Check if all items in the module are complete
    const totalLessons = module.lessons.length;
    const totalExercises = module.handsOnExercises?.length || 0;
    const hasProject = module.assessmentProject ? 1 : 0;

    const completedLessons = detailedProgress.completedLessons?.length || 0;
    const completedExercises = detailedProgress.completedExercises?.length || 0;
    const completedProject = detailedProgress.projectCompleted ? 1 : 0;

    // Module is complete if all lessons, exercises, and project (if any) are done
    return (
      completedLessons >= totalLessons &&
      completedExercises >= totalExercises &&
      completedProject >= hasProject
    );
  }

  // Complete a project in a module
  static completeProject(userId: string, moduleId: string, xpEarned: number = 200, submittedCode?: string): UserProgress {
    const currentProgress = this.loadProgress(userId);
    const moduleProgress = typeof currentProgress.moduleProgress[moduleId] === 'object'
      ? currentProgress.moduleProgress[moduleId] as ModuleDetailedProgress
      : { completedLessons: [], completedExercises: [], projectCompleted: false };

    if (!moduleProgress.projectCompleted) {
      moduleProgress.projectCompleted = true;
      // Record daily activity (estimate 30-45 minutes per project)
      this.recordActivity(userId, 'project', xpEarned, 35);
    }

    // Store the submitted code for review
    if (submittedCode) {
      moduleProgress.projectCode = submittedCode;
    }

    const updatedProgress = this.updateModuleProgress(userId, moduleId, moduleProgress);

    // Check if module is now fully complete and auto-complete if so
    return this.checkAndAutoCompleteModule(userId, moduleId, updatedProgress);
  }

  // Complete a lesson in a module
  static completeLesson(userId: string, moduleId: string, lessonId: string, xpEarned: number = 50): UserProgress {
    const currentProgress = this.loadProgress(userId);
    const moduleProgress = typeof currentProgress.moduleProgress[moduleId] === 'object'
      ? currentProgress.moduleProgress[moduleId] as ModuleDetailedProgress
      : { completedLessons: [], completedExercises: [], projectCompleted: false };

    if (!moduleProgress.completedLessons) {
      moduleProgress.completedLessons = [];
    }

    if (!moduleProgress.completedLessons.includes(lessonId)) {
      moduleProgress.completedLessons.push(lessonId);
      // Record daily activity (estimate 8-12 minutes per lesson)
      this.recordActivity(userId, 'lesson', xpEarned, 10);
    }

    const updatedProgress = this.updateModuleProgress(userId, moduleId, moduleProgress);
    // Also forward to ProgressSyncManager to ensure unlocking + atomic upsert happens
    void ProgressSyncManager.completeLesson(userId, moduleId, lessonId, xpEarned).catch(err => console.warn('ProgressManager: forward to ProgressSyncManager failed', err));

    // Check if module is now fully complete and auto-complete if so
    return this.checkAndAutoCompleteModule(userId, moduleId, updatedProgress);
  }

  // Check if module is fully complete and auto-complete it
  private static checkAndAutoCompleteModule(userId: string, moduleId: string, currentProgress: UserProgress): UserProgress {
    const moduleProgress = currentProgress.moduleProgress[moduleId];

    // Only check for object-based progress
    if (!moduleProgress || typeof moduleProgress !== 'object') {
      return currentProgress;
    }

    const detailedProgress = moduleProgress as ModuleDetailedProgress;

    // Try to find the module in the consolidated modules list (modules 1-8)
    let module = allModules.find(m => m.id === moduleId);

    // If not found with exact ID, try alternative ID formats
    if (!module) {
      // Try with beginner-module prefix
      if (moduleId.startsWith('module-')) {
        const enhancedId = moduleId.replace('module-', 'beginner-module-');
        module = allModules.find(m => m.id === enhancedId);
      } else if (moduleId.startsWith('beginner-module-')) {
        const standardId = moduleId.replace('beginner-module-', 'module-');
        module = allModules.find(m => m.id === standardId);
      }
    }

    if (module) {
      // Check if all items in the module are complete
      const totalLessons = module.lessons.length;
      const totalExercises = module.handsOnExercises?.length || 0;
      const hasProject = module.assessmentProject ? 1 : 0;

      const completedLessons = detailedProgress.completedLessons?.length || 0;
      const completedExercises = detailedProgress.completedExercises?.length || 0;
      const completedProject = detailedProgress.projectCompleted ? 1 : 0;

      // Module is complete if all lessons, exercises, and project (if any) are done
      const isFullyComplete =
        completedLessons >= totalLessons &&
        completedExercises >= totalExercises &&
        completedProject >= hasProject;

      if (isFullyComplete && !currentProgress.completedModules.includes(moduleId)) {
        // Auto-complete the module
        return this.completeModule(userId, moduleId);
      }
    }

    return currentProgress;
  }

  // Get user's current/recommended module
  static getCurrentModule(userId: string): string | null {
    const progress = this.loadProgress(userId);
    return progress.currentModule || progress.lastActiveModule || null;
  }

  // Clear all progress for a user (for testing/reset purposes)
  static clearProgress(userId: string): void {
    try {
      const allProgress = this.getAllProgress();
      delete allProgress[userId];
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }



  // Export progress for backup
  static exportProgress(userId: string): string {
    const progress = this.loadProgress(userId);
    return JSON.stringify(progress, null, 2);
  }

  // Import progress from backup (stringified JSON). Keeps name distinct
  // from the runtime `importProgress` used to silently seed cache.
  static importProgressFromBackup(userId: string, progressData: string): boolean {
    try {
      const progress = JSON.parse(progressData) as UserProgress;
      this.saveProgress(userId, progress);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }

  // Track daily activity
  private static recordActivity(
    userId: string,
    type: 'lesson' | 'exercise' | 'project' | 'assessment',
    xpEarned: number,
    studyTimeMinutes: number = 0
  ): void {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      const today = this.getTodayDate();

      if (!progress.dailyActivity) {
        progress.dailyActivity = {};
      }

      if (!progress.dailyActivity[today]) {
        progress.dailyActivity[today] = {
          date: today,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          projectsCompleted: 0,
          assessmentsCompleted: 0,
          totalXP: 0,
          studyTimeMinutes: 0,
          studyTimeLessons: 0,
          studyTimeExercises: 0,
          studyTimeProjects: 0,
          studyTimeAssessments: 0
        };
      }

      const todayActivity = progress.dailyActivity[today];

      if (type === 'lesson') {
        todayActivity.lessonsCompleted++;
        todayActivity.studyTimeLessons += studyTimeMinutes;
      } else if (type === 'exercise') {
        todayActivity.exercisesCompleted++;
        todayActivity.studyTimeExercises += studyTimeMinutes;
      } else if (type === 'project') {
        todayActivity.projectsCompleted++;
        todayActivity.studyTimeProjects += studyTimeMinutes;
      } else if (type === 'assessment') {
        todayActivity.assessmentsCompleted++;
        todayActivity.studyTimeAssessments += studyTimeMinutes;
      }

      todayActivity.totalXP += xpEarned;
      todayActivity.studyTimeMinutes += studyTimeMinutes;

      // Update streak
      progress.lastActivityDate = today;
      this.updateStreak(progress);

      // Persist progress: update cache for immediate UI, but prefer the
      // authenticated Supabase user id for the persistent upsert so RLS
      // (auth.uid() = user_id) allows the write. We perform an async
      // background task to avoid blocking the UI.
      this.saveProgress(userId, progress);

      (async () => {
        try {
          const authUserId = await getAuthUserId();
          const writeId = (authUserId && isUUID(authUserId)) ? authUserId : userId;

          // If the canonical id differs from the current display id, ensure
          // the cache is updated under the canonical id so reads reflect the
          // persisted state after login.
          if (writeId !== userId) {
            const cachedForWrite = { ...(progress as UserProgress), lastUpdated: new Date().toISOString() } as UserProgress & { lastUpdated?: string };
            this.progressCache.set(writeId, cachedForWrite);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId: writeId, progress: cachedForWrite } }));
            }
          }

          // Use saveProgress so queuing/retry logic is centralized.
          this.saveProgress(writeId, progress as UserProgress);
        } catch (err) {
          const existing = this.pendingSaves.get(userId);
          this.pendingSaves.set(userId, { progress: progress as UserProgress, attempts: existing ? existing.attempts + 1 : 1 });
          this.schedulePendingFlush();
          console.warn('Failed to persist activity to Supabase, queued for retry:', err);
        }
      })();
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  }

  // Update learning streak - ONLY counts if at least one lesson is completed on that day
  private static updateStreak(progress: EnhancedUserProgress): void {
    try {
      const today = this.getTodayDate();

      // Check if user completed at least one lesson today
      const todayActivity = progress.dailyActivity?.[today];
      const hasCompletedLesson = todayActivity && todayActivity.lessonsCompleted >= 1;

      if (!hasCompletedLesson) {
        // No lesson completed today, don't update streak
        // Streak will be recalculated when getCurrentStreak is called
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = this.dateToString(yesterday);

      // Check if user completed at least one lesson yesterday
      const yesterdayActivity = progress.dailyActivity?.[yesterdayStr];
      const hasCompletedLessonYesterday = yesterdayActivity && yesterdayActivity.lessonsCompleted >= 1;

      if (!progress.currentStreak) {
        progress.currentStreak = 1;
        progress.longestStreak = 1;
      } else if (progress.lastActivityDate === today) {
        // Same day, don't change streak
        return;
      } else if (progress.lastActivityDate === yesterdayStr && hasCompletedLessonYesterday) {
        // Consecutive day with lesson completion
        progress.currentStreak++;
        if (progress.currentStreak > (progress.longestStreak || 0)) {
          progress.longestStreak = progress.currentStreak;
        }
      } else {
        // Streak broken or yesterday had no lesson
        progress.currentStreak = 1;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }

  // Get daily activity for a specific date
  static getDailyActivity(userId: string, date: string): DailyActivity | null {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      return progress.dailyActivity?.[date] || null;
    } catch (error) {
      console.error('Error getting daily activity:', error);
      return null;
    }
  }

  // Get weekly activity (last 7 days from today, only past days)
  static getWeeklyActivity(userId: string, useCurrentWeek: boolean = false): DailyActivity[] {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      const today = new Date();
      const weeklyData: DailyActivity[] = [];

      if (useCurrentWeek) {
        // Get current calendar week (Monday to Sunday)
        const todayDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(today);
        const daysSinceMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Adjust for Sunday being 0
        startOfWeek.setDate(today.getDate() - daysSinceMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        // Get data for all 7 days of the current week (Monday through Sunday)
        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(startOfWeek);
          currentDate.setDate(startOfWeek.getDate() + i);
          const dateString = this.dateToString(currentDate);

          const activity = progress.dailyActivity?.[dateString] || {
            date: dateString,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            projectsCompleted: 0,
            assessmentsCompleted: 0,
            totalXP: 0,
            studyTimeMinutes: 0,
            studyTimeLessons: 0,
            studyTimeExercises: 0,
            studyTimeProjects: 0,
            studyTimeAssessments: 0
          };

          weeklyData.push(activity);
        }
      } else {
        // Get the last 7 days (original behavior)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = this.dateToString(date);

          const activity = progress.dailyActivity?.[dateString] || {
            date: dateString,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            projectsCompleted: 0,
            assessmentsCompleted: 0,
            totalXP: 0,
            studyTimeMinutes: 0,
            studyTimeLessons: 0,
            studyTimeExercises: 0,
            studyTimeProjects: 0,
            studyTimeAssessments: 0
          };

          weeklyData.push(activity);
        }
      }

      return weeklyData;
    } catch (error) {
      console.error('Error getting weekly activity:', error);
      return [];
    }
  }

  // Get all daily activity
  static getAllDailyActivity(userId: string): DailyActivity[] {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      if (!progress.dailyActivity) return [];

      return Object.values(progress.dailyActivity).sort((a, b) =>
        a.date.localeCompare(b.date)
      );
    } catch (error) {
      console.error('Error getting all daily activity:', error);
      return [];
    }
  }

  // Update study time for today
  static updateStudyTime(userId: string, minutesToAdd: number = 1): void {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      const today = this.getTodayDate();

      if (!progress.dailyActivity) {
        progress.dailyActivity = {};
      }

      if (!progress.dailyActivity[today]) {
        progress.dailyActivity[today] = {
          date: today,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          projectsCompleted: 0,
          assessmentsCompleted: 0,
          totalXP: 0,
          studyTimeMinutes: 0,
          studyTimeLessons: 0,
          studyTimeExercises: 0,
          studyTimeProjects: 0,
          studyTimeAssessments: 0
        };
      }

      progress.dailyActivity[today].studyTimeMinutes += minutesToAdd;
      this.saveProgress(userId, progress);
    } catch (error) {
      console.error('Error updating study time:', error);
    }
  }

  // Record assessment result
  static recordAssessment(
    userId: string,
    assessmentId: string,
    moduleId: string,
    score: number,
    maxScore: number,
    topics: { [topic: string]: number } = {},
    studyTimeMinutes: number = 0
  ): void {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      const today = new Date().toISOString();

      // Initialize assessment results if needed
      if (!progress.assessmentResults) {
        progress.assessmentResults = [];
      }

      // Add assessment result
      progress.assessmentResults.push({
        assessmentId,
        moduleId,
        score,
        maxScore,
        completedAt: today,
        topics
      });

      // Update topic mastery
      if (!progress.topicMastery) {
        progress.topicMastery = {};
      }

      Object.entries(topics).forEach(([topic, topicScore]) => {
        if (!progress.topicMastery![topic]) {
          progress.topicMastery![topic] = {
            topic,
            attempts: 0,
            totalScore: 0,
            averageScore: 0,
            lastAttemptDate: today
          };
        }

        const mastery = progress.topicMastery![topic];
        mastery.attempts++;
        mastery.totalScore += topicScore;
        // Prevent division by zero and ensure valid number
        if (mastery.attempts > 0) {
          const avg = mastery.totalScore / mastery.attempts;
          mastery.averageScore = isFinite(avg) ? Math.round(avg) : 0;
        } else {
          mastery.averageScore = 0;
        }
        mastery.lastAttemptDate = today;
      });

      // Record activity - prevent division by zero
      const xpEarned = maxScore > 0 ? Math.floor((score / maxScore) * 300) : 0; // Up to 300 XP for perfect score
      this.recordActivity(userId, 'assessment', isFinite(xpEarned) ? xpEarned : 0, studyTimeMinutes);

      this.saveProgress(userId, progress);
    } catch (error) {
      console.error('Error recording assessment:', error);
    }
  }

  // Get current streak - ONLY counts days with at least one lesson completed
  static getCurrentStreak(userId: string): number {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      if (!progress.dailyActivity) return 0;

      const dates = Object.keys(progress.dailyActivity || {}).sort();
      if (dates.length === 0) return 0;

      // Start from the latest activity date and count consecutive previous days
      let streak = 0;
      let longest = 0; // unused here but keep numeric flow
      let expected = new Date(dates[dates.length - 1] + 'T00:00:00Z');

      for (let i = dates.length - 1; i >= 0; i--) {
        const d = dates[i];
        const dayActivity = progress.dailyActivity![d];
        const has = dayActivity && ((dayActivity.lessonsCompleted || 0) >= 1);
        if (!has) break;

        const curDate = new Date(d + 'T00:00:00Z');
        const sameDay = curDate.getUTCFullYear() === expected.getUTCFullYear() && curDate.getUTCMonth() === expected.getUTCMonth() && curDate.getUTCDate() === expected.getUTCDate();
        if (!sameDay) break;

        streak++;
        expected = new Date(expected.getTime() - 24 * 60 * 60 * 1000);
      }

      return streak;
    } catch (error) {
      console.error('Error getting current streak:', error);
      return 0;
    }
  }

  // Get longest streak - ONLY counts days with at least one lesson completed
  static getLongestStreak(userId: string): number {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      if (!progress.dailyActivity) return 0;
      // Get all dates with activity, sorted chronologically
      const dates = Object.keys(progress.dailyActivity).sort();
      if (dates.length === 0) return 0;

      let maxStreak = 0;
      let currentStreak = 0;
      let previousDate: Date | null = null;

      for (const dateStr of dates) {
        const activity = progress.dailyActivity[dateStr];

        // Only count days with at least one lesson completed
        if (activity && activity.lessonsCompleted >= 1) {
          const currentDate = new Date(dateStr + 'T00:00:00Z');

          if (previousDate === null) {
            // First day with lesson
            currentStreak = 1;
          } else {
            // Check if this is consecutive to previous day
            const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

            if (dayDiff === 1) {
              // Consecutive day
              currentStreak++;
            } else {
              // Gap in streak, start new streak
              currentStreak = 1;
            }
          }

          // Update max streak if current is higher
          maxStreak = Math.max(maxStreak, currentStreak);
          previousDate = currentDate;
        }
      }

      return maxStreak;
    } catch (error) {
      console.error('Error getting longest streak:', error);
      return 0;
    }
  }

  // Get all assessment results
  static getAssessmentResults(userId: string): AssessmentResult[] {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      return progress.assessmentResults || [];
    } catch (error) {
      console.error('Error getting assessment results:', error);
      return [];
    }
  }

  // Get average assessment score
  static getAverageAssessmentScore(userId: string): number {
    try {
      const results = this.getAssessmentResults(userId);
      if (results.length === 0) return 0;

      const totalPercentage = results.reduce((sum, result) => {
        // Prevent division by zero
        if (!result.maxScore || result.maxScore === 0) return sum;
        const percentage = (result.score / result.maxScore) * 100;
        // Ensure valid number
        return sum + (isFinite(percentage) ? percentage : 0);
      }, 0);

      // Prevent division by zero
      if (results.length === 0) return 0;
      const average = totalPercentage / results.length;
      return isFinite(average) ? Math.round(average) : 0;
    } catch (error) {
      console.error('Error getting average score:', error);
      return 0;
    }
  }

  // Get topic mastery data
  static getTopicMastery(userId: string): { [topic: string]: TopicMastery } {
    try {
      const progress = this.loadProgress(userId) as EnhancedUserProgress;
      return progress.topicMastery || {};
    } catch (error) {
      console.error('Error getting topic mastery:', error);
      return {};
    }
  }

  // Get performance trend (weekly averages over time)
  static getPerformanceTrend(userId: string, weeks: number = 5): any[] {
    try {
      const allActivity = this.getAllDailyActivity(userId);
      if (allActivity.length === 0) return [];

      const trend: any[] = [];
      const today = new Date();

      for (let i = weeks - 1; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - ((i + 1) * 7));
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() - (i * 7));

        const weekStartStr = this.dateToString(weekStart);
        const weekEndStr = this.dateToString(weekEnd);

        const weekActivity = allActivity.filter(activity =>
          activity.date >= weekStartStr && activity.date <= weekEndStr
        );

        const totalLessons = weekActivity.reduce((sum, day) => sum + day.lessonsCompleted, 0);
        const totalExercises = weekActivity.reduce((sum, day) => sum + day.exercisesCompleted, 0);
        const totalAssessments = weekActivity.reduce((sum, day) => sum + (day.assessmentsCompleted || 0), 0);
        const totalXP = weekActivity.reduce((sum, day) => sum + day.totalXP, 0);

        // Calculate average score from assessments in this week
        const assessments = this.getAssessmentResults(userId).filter(result => {
          // Extract date from ISO timestamp and convert to local date string for comparison
          const resultDateTime = new Date(result.completedAt);
          const resultDate = this.dateToString(resultDateTime);
          return resultDate >= weekStartStr && resultDate <= weekEndStr;
        });

        const avgScore = assessments.length > 0
          ? Math.round(assessments.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / assessments.length)
          : 0;

        trend.push({
          date: `Week ${weeks - i}`,
          score: avgScore,
          assessments: totalAssessments,
          lessons: totalLessons,
          exercises: totalExercises,
          xp: totalXP
        });
      }

      return trend;
    } catch (error) {
      console.error('Error getting performance trend:', error);
      return [];
    }
  }

  // Get study time distribution
  static getStudyTimeDistribution(userId: string): any[] {
    try {
      const allActivity = this.getAllDailyActivity(userId);

      const totalLessons = allActivity.reduce((sum, day) => sum + (day.studyTimeLessons || 0), 0);
      const totalExercises = allActivity.reduce((sum, day) => sum + (day.studyTimeExercises || 0), 0);
      const totalProjects = allActivity.reduce((sum, day) => sum + (day.studyTimeProjects || 0), 0);
      const totalAssessments = allActivity.reduce((sum, day) => sum + (day.studyTimeAssessments || 0), 0);

      const total = totalLessons + totalExercises + totalProjects + totalAssessments;

      if (total === 0) {
        return [
          { name: 'Lessons', value: 0, color: '#8b5fbf' },
          { name: 'Exercises', value: 0, color: '#a777d9' },
          { name: 'Projects', value: 0, color: '#c9a8f5' },
          { name: 'Assessments', value: 0, color: '#6d44a8' }
        ];
      }

      return [
        { name: 'Lessons', value: Math.round((totalLessons / total) * 100), color: '#8b5fbf' },
        { name: 'Exercises', value: Math.round((totalExercises / total) * 100), color: '#a777d9' },
        { name: 'Projects', value: Math.round((totalProjects / total) * 100), color: '#c9a8f5' },
        { name: 'Assessments', value: Math.round((totalAssessments / total) * 100), color: '#6d44a8' }
      ];
    } catch (error) {
      console.error('Error getting study time distribution:', error);
      return [];
    }
  }

  // Get all users with progress data (for admin analytics)
  static getAllUsers(): Array<{ userId: string; progress: EnhancedUserProgress; lastUpdated?: string }> {
    try {
      const allProgress = this.getAllProgress();
      return Object.entries(allProgress).map(([userId, progress]) => ({
        userId,
        progress: progress as EnhancedUserProgress,
        lastUpdated: progress.lastUpdated
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  // Get aggregate analytics across all users
  static getAggregateAnalytics(): {
    totalUsers: number;
    activeUsers: number;
    totalCompletedModules: number;
    averageProgress: number;
    totalXP: number;
    averageAssessmentScore: number;
    totalStudyTime: number;
  } {
    try {
      const users = this.getAllUsers();

      if (users.length === 0) {
        return {
          totalUsers: 0,
          activeUsers: 0,
          totalCompletedModules: 0,
          averageProgress: 0,
          totalXP: 0,
          averageAssessmentScore: 0,
          totalStudyTime: 0
        };
      }

      let totalCompletedModules = 0;
      let totalProgress = 0;
      let totalXP = 0;
      let totalAssessmentScores = 0;
      let totalAssessments = 0;
      let totalStudyTime = 0;
      let activeUsers = 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoStr = this.dateToString(sevenDaysAgo);

      users.forEach(({ progress }) => {
        // Count completed modules
        totalCompletedModules += progress.completedModules?.length || 0;

        // Calculate average progress
        const moduleProgressValues = Object.values(progress.moduleProgress || {});
        if (moduleProgressValues.length > 0) {
          const userProgress = moduleProgressValues.reduce<number>((sum, p) => {
            // p may be a legacy numeric percentage or an object; only add numeric values
            return sum + (typeof p === 'number' ? p : 0);
          }, 0) / moduleProgressValues.length;
          totalProgress += userProgress;
        }

        // Sum total XP
        if (progress.dailyActivity) {
          const dailyXP = Object.values(progress.dailyActivity).reduce((sum, day) => sum + (day.totalXP || 0), 0);
          totalXP += dailyXP;
        }

        // Calculate assessment scores
        const assessments = progress.assessmentResults || [];
        assessments.forEach(result => {
          if (result.maxScore > 0) {
            totalAssessmentScores += (result.score / result.maxScore) * 100;
            totalAssessments++;
          }
        });

        // Sum study time
        if (progress.dailyActivity) {
          const studyTime = Object.values(progress.dailyActivity).reduce((sum, day) => sum + (day.studyTimeMinutes || 0), 0);
          totalStudyTime += studyTime;
        }

        // Check if user is active (activity in last 7 days)
        if (progress.lastActivityDate && progress.lastActivityDate >= sevenDaysAgoStr) {
          activeUsers++;
        }
      });

      return {
        totalUsers: users.length,
        activeUsers,
        totalCompletedModules,
        averageProgress: users.length > 0 ? totalProgress / users.length : 0,
        totalXP,
        averageAssessmentScore: totalAssessments > 0 ? totalAssessmentScores / totalAssessments : 0,
        totalStudyTime
      };
    } catch (error) {
      console.error('Error calculating aggregate analytics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCompletedModules: 0,
        averageProgress: 0,
        totalXP: 0,
        averageAssessmentScore: 0,
        totalStudyTime: 0
      };
    }
  }

  // Async wrappers for migration to real backend
  static async getAllUsersAsync(): Promise<Array<{ userId: string; progress: EnhancedUserProgress; lastUpdated?: string }>> {
    try {
      await this.fetchAllProgressFromServer();
    } catch (err) {
      // ignore - return cache if server fetch fails
    }
    return this.getAllUsers();
  }

  static async getAverageAssessmentScoreAsync(userId: string): Promise<number> {
    try {
      await this.fetchAllProgressFromServer();
    } catch (err) {
      // ignore
    }
    return this.getAverageAssessmentScore(userId);
  }

  static async getCurrentStreakAsync(userId: string): Promise<number> {
    try {
      await this.fetchAllProgressFromServer();
    } catch (err) {
      // ignore
    }
    return this.getCurrentStreak(userId);
  }

  static async getAggregateAnalyticsAsync(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCompletedModules: number;
    averageProgress: number;
    totalXP: number;
    averageAssessmentScore: number;
    totalStudyTime: number;
  }> {
    try {
      await this.fetchAllProgressFromServer();
    } catch (err) {
      // ignore
    }
    return this.getAggregateAnalytics();
  }

  // Apply progress coming from the new ProgressSyncManager so legacy consumers stay in sync
  static applyExternalProgress(userId: string, progress: UserProgress & { lastUpdated?: string }) {
    try {
      const cached = { ...(progress as any) } as UserProgress & { lastUpdated?: string };
      this.progressCache.set(userId, cached);
      try { window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { userId, progress: cached } })); } catch { }
    } catch (e) {
      console.error('ProgressManager.applyExternalProgress error', e);
    }
  }
}

// Keep the legacy ProgressManager cache in sync with the newer ProgressSyncManager
try {
  ProgressSyncManager.subscribe((evt: any) => {
    if (!evt || !evt.userId || evt.userId === 'all') return;
    if (evt.progress) {
      ProgressManager.applyExternalProgress(evt.userId, evt.progress as any);
    }
  });
} catch (e) {
  console.warn('Failed to subscribe ProgressManager to ProgressSyncManager events', e);
}