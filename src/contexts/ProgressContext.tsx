/**
 * Progress Context
 * 
 * Provides global progress tracking state and operations
 * Replaces localStorage-based progress management with Supabase backend
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProgressService, XPService } from '../utils/supabase/dataService';
import ContentManager from '../utils/contentManager';
import { useAuth } from './AuthContext';
import type {
  UserProgress,
  ModuleProgress,
  DailyActivity,
  LearningStreak
} from '../utils/supabase/dataService';
import { supabase } from '../utils/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressContextType {
  // State
  userProgress: UserProgress | null;
  moduleProgress: Record<string, ModuleProgress>;
  dailyActivity: DailyActivity[];
  currentStreak: LearningStreak | null;
  totalXP: number;
  level: number;
  loading: boolean;
  error: string | null;

  // Actions - Module Progress
  startModule: (moduleId: string) => Promise<void>;
  updateModuleProgress: (moduleId: string, percentage: number) => Promise<void>;
  completeModule: (moduleId: string) => Promise<void>;

  // Actions - Lesson Completion
  completeLesson: (moduleId: string, lessonId: string, xpEarned: number, timeSpent?: number) => Promise<void>;

  // Actions - Exercise Completion
  completeExercise: (moduleId: string, exerciseId: string, submittedCode: string, xpEarned: number, timeSpent?: number, attempts?: number) => Promise<void>;

  // Actions - Project Completion
  completeProject: (moduleId: string, projectId: string, submittedCode: string, score: number, xpEarned: number, timeSpent?: number) => Promise<void>;

  // Actions - XP System
  awardXP: (amount: number, sourceType: 'lesson' | 'exercise' | 'project' | 'assessment' | 'streak' | 'bonus', sourceId?: string, description?: string) => Promise<void>;

  // Actions - Streak Management
  updateStreak: () => Promise<void>;

  // Actions - Data Refresh
  refreshProgress: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ProgressContext = createContext<ProgressContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Build a complete `UserProgress` object for a new user by enumerating all
 * modules and merging with any existing hydrated progress row returned from
 * Supabase. Ensures every module has a `ModuleProgress` entry so callers can
 * safely index `moduleProgress[moduleId]`.
 */
function initializeUserProgress(allModules: any[] = [], hydratedProgress?: any) {
  const base = (hydratedProgress && typeof hydratedProgress === 'object') ? { ...hydratedProgress } : {} as any;
  base.moduleProgress = base.moduleProgress || {};
  base.completedModules = base.completedModules || [];
  base.dailyActivity = base.dailyActivity || {};
  base.total_xp = base.total_xp ?? 0;
  base.level = base.level ?? base.current_level ?? 1;

  for (const m of (allModules || [])) {
    const moduleId = (m && (m.id || m.module_id)) || (typeof m === 'string' ? m : null);
    if (!moduleId) continue;

    if (!base.moduleProgress[moduleId]) {
      const lessonOrder = Array.isArray(m.lessons) ? m.lessons.map((l: any) => (typeof l === 'string' ? l : (l.id || l))) : [];
      base.moduleProgress[moduleId] = {
        completedLessons: [],
        completedExercises: [],
        projectCompleted: false,
        exerciseCodes: {},
        lessonOrder,
        unlockedLessons: lessonOrder.length ? [lessonOrder[0]] : [],
        unlockedExercises: [],
      };
    } else {
      const mp = base.moduleProgress[moduleId];
      mp.completedLessons = Array.isArray(mp.completedLessons) ? mp.completedLessons : [];
      mp.completedExercises = Array.isArray(mp.completedExercises) ? mp.completedExercises : [];
      mp.unlockedLessons = Array.isArray(mp.unlockedLessons) ? mp.unlockedLessons : [];
      mp.unlockedExercises = Array.isArray(mp.unlockedExercises) ? mp.unlockedExercises : [];
      mp.lessonOrder = Array.isArray(mp.lessonOrder) ? mp.lessonOrder : (Array.isArray(m.lessons) ? m.lessons.map((l: any) => (typeof l === 'string' ? l : (l.id || l))) : []);
    }
  }

  return base;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [currentStreak, setCurrentStreak] = useState<LearningStreak | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // used only for effect governing; mark as used to silence linter for now
  void profile;
  void realtimeChannel;

  /**
   * Load all progress data from Supabase
   */
  const loadAllProgressData = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      console.debug('[ProgressContext] loadAllProgressData start', { userId: user.id });

      // Ensure any local autosave keys are cleared before hydration (preserve auth keys)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const PREFIX = 'study_buddy_autosave_';
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(PREFIX)) {
              localStorage.removeItem(key);
            }
          }
          console.debug('[ProgressContext] cleared autosave local keys before hydration');
        }
      } catch (e) {
        console.warn('[ProgressContext] autosave cleanup failed', e);
      }

      // Load user progress via ProgressService (authoritative and schema-aware)
      try {
        console.debug('[ProgressContext] requesting ProgressService.getUserProgress', { userId: user.id });
        let progressRow = await ProgressService.getUserProgress(user.id);
        console.debug('[ProgressContext] ProgressService.getUserProgress response', { userId: user.id, progressRow });

        // Check if we need to recalculate XP from transactions (auto-fix corrupted data)
        try {
          const { XPService } = await import('../utils/supabase/dataService');
          const transactions = await XPService.getXPTransactions(user.id, 1000); // Get all transactions
          const calculatedXP = transactions.reduce((sum, tx: any) => sum + (tx.amount || 0), 0);
          const dbXP = (progressRow as any)?.total_xp || 0;
          
          if (calculatedXP !== dbXP && calculatedXP > 0) {
            console.warn('[ProgressContext] 🔧 XP mismatch detected! DB shows', dbXP, 'but transactions sum to', calculatedXP, '- recalculating...');
            await XPService.recalculateUserXP(user.id);
            // Reload progress after fix
            const fixedProgressRow = await ProgressService.getUserProgress(user.id);
            console.log('[ProgressContext] ✅ XP fixed! Reloaded progress with corrected total_xp:', (fixedProgressRow as any)?.total_xp);
            if (fixedProgressRow) {
              progressRow = fixedProgressRow;
            }
          }
        } catch (recalcErr) {
          console.warn('[ProgressContext] XP recalculation check failed (non-fatal)', recalcErr);
        }

        let parsed: any = null;
        if (progressRow) {
          // If the service returns a `progress` JSON column, prefer that; otherwise map available columns.
          if ((progressRow as any).progress) {
            parsed = typeof (progressRow as any).progress === 'string' ? JSON.parse((progressRow as any).progress) : (progressRow as any).progress;
            // Prefer authoritative top-level columns from the row when available
            parsed.total_xp = (progressRow as any).total_xp ?? parsed.total_xp ?? 0;
            parsed.level = (progressRow as any).level ?? parsed.level ?? (progressRow as any).current_level ?? 1;
            parsed.updated_at = parsed.updated_at ?? (progressRow as any).updated_at;
            // Map server-side columns into the progress object so client logic
            // (which expects `completedModules`, `moduleProgress`, `currentModule`)
            // can use the authoritative values stored on the row.
            // Accept both snake_case (DB) and camelCase (legacy) column names
            parsed.completedModules = (progressRow as any).completed_modules ?? (progressRow as any).modules_completed ?? parsed.completedModules ?? [];
            parsed.moduleProgress = (progressRow as any).module_progress ?? (progressRow as any).moduleProgress ?? parsed.moduleProgress ?? {};
            parsed.currentModule = (progressRow as any).current_module ?? (progressRow as any).currentModule ?? parsed.currentModule ?? null;
            parsed.lastActiveModule = (progressRow as any).last_active_module ?? (progressRow as any).lastActiveModule ?? parsed.lastActiveModule ?? null;
          } else {
            parsed = {
              moduleProgress: {},
              completedModules: [],
              dailyActivity: {},
              total_xp: (progressRow as any).total_xp ?? (progressRow as any).total_xp ?? 0,
              level: (progressRow as any).level ?? (progressRow as any).current_level ?? 1,
              updated_at: (progressRow as any).updated_at || new Date().toISOString()
            } as any;
          }

          // Update React state immediately
          console.log('[ProgressContext] 🔍 About to set state from progressRow', {
            parsed_total_xp: parsed.total_xp,
            progressRow_total_xp: (progressRow as any).total_xp,
            final_value: parsed.total_xp ?? 0,
            userId: user.id
          });
          setUserProgress(parsed as any);
          setModuleProgress(parsed.moduleProgress || {});
          setDailyActivity(parsed.dailyActivity ? Object.values(parsed.dailyActivity) : []);
          setTotalXP(parsed.total_xp ?? 0);
          setLevel(parsed.level ?? 1);
          setCurrentStreak(parsed.currentStreak ?? null);

          console.log('[ProgressContext] ✅ Progress hydrated - totalXP set to:', parsed.total_xp ?? 0, parsed);
        } else {
          // No server row returned — initialize via service and build a module-scoped
          // progress object using the canonical course modules list so UI can safely
          // index into `moduleProgress[moduleId]` without direct null checks.
          console.warn('[ProgressContext] no progressRow returned; initializing default progress for user', user.id);
          const init = await ProgressService.initializeUserProgress(user.id);
          console.debug('[ProgressContext] initializeUserProgress result', { init });
          // Build user progress merged with any hydrated/init row and full module list
          const allModules = ContentManager.getAllModules();
          const userProgress = initializeUserProgress(allModules, init as any);
          setUserProgress(userProgress as any);
          setModuleProgress(userProgress.moduleProgress || {});
          setDailyActivity(userProgress.dailyActivity ? Object.values(userProgress.dailyActivity) : []);
          setTotalXP(userProgress.total_xp ?? 0);
          setLevel(userProgress.level ?? 1);
          console.log('Progress hydrated (initialized)', userProgress);
        }
      } catch (err) {
        // Improve error logging for debugging
        try {
          console.error('[ProgressContext] failed to load progress from Supabase:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        } catch (e) {
          console.error('[ProgressContext] failed to load progress from Supabase (non-serializable error)', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      }

    } catch (err) {
      console.error('Error loading progress data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      console.debug('[ProgressContext] loadAllProgressData finished', { userId: user?.id });
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Load all progress data when user logs in
   * and set up realtime subscription inline to avoid stale closures
   */
  useEffect(() => {
    if (user?.id) {
      loadAllProgressData();

      const channel = supabase
        .channel(`progress:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_progress',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Progress updated (silent)
            console.log('[ProgressContext] 🔔 Realtime update received:', {
              event: payload.eventType,
              total_xp: (payload.new as any)?.total_xp,
              payload: payload.new
            });
            if (payload.new) {
              setUserProgress(payload.new as any);
              setTotalXP((payload.new as any).total_xp);
              setLevel((payload.new as any).level);
              console.log('[ProgressContext] ✅ Realtime: totalXP updated to:', (payload.new as any).total_xp);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'module_progress',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Module progress updated (silent)
            if (payload.new) {
              const newModuleProgress = payload.new as any;
              setModuleProgress(prev => ({
                ...prev,
                [newModuleProgress.module_id]: newModuleProgress,
              }));
            }
          }
        )
        .subscribe();

      setRealtimeChannel(channel);

      return () => {
        try {
          channel.unsubscribe();
        } catch (e) {
          // ignore
        }
      };
    } else {
      // Clear progress when user logs out
      clearProgressData();
    }
  }, [user?.id, loadAllProgressData]);

  // Listen for in-app progress updates emitted by `ProgressSyncManager` or
  // other parts of the app and trigger a debounced reload of authoritative
  // progress data without reloading the page.
  useEffect(() => {
    if (!user?.id) return;
    let debounceTimer: number | null = null;
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail || {};
        const uid = detail.userId;
        const type = detail.type;
        if (!uid || uid !== user.id) return;
        // Only react to relevant progress events
        if (!['saved', 'progress-updated', 'local-update'].includes(type)) return;
        if (debounceTimer) window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
          void loadAllProgressData();
        }, 300) as unknown as number;
      } catch (e) { /* ignore */ }
    };

    window.addEventListener('progressUpdated', handler as EventListener);
    return () => {
      window.removeEventListener('progressUpdated', handler as EventListener);
      if (debounceTimer) window.clearTimeout(debounceTimer);
    };
  }, [user?.id, loadAllProgressData]);

  // setupRealtimeSubscription was inlined in the main effect to avoid stale-closure

  /**
   * Clear all progress data (on logout)
   */
  const clearProgressData = () => {
    setUserProgress(null);
    setModuleProgress({});
    setDailyActivity([]);
    setCurrentStreak(null);
    setTotalXP(0);
    setLevel(1);
  };

  /**
   * Start a new module
   */
  const startModule = async (moduleId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      const newModuleProgress = await ProgressService.startModule(user.id, moduleId);

      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: newModuleProgress,
      }));

      // Update current module in user progress
      await ProgressService.updateUserProgress(user.id, {
        current_module: moduleId,
        last_active_module: moduleId,
      });

    } catch (err) {
      console.error('Error starting module:', err);
      setError(err instanceof Error ? err.message : 'Failed to start module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update module progress percentage
   */
  const updateModuleProgress = async (moduleId: string, percentage: number) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      await ProgressService.updateModuleProgress(user.id, moduleId, {
        progress_percentage: percentage,
      });

      // Optimistic update
      setModuleProgress(prev => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          progress_percentage: percentage,
          updated_at: new Date().toISOString(),
        },
      }));

    } catch (err) {
      console.error('Error updating module progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      throw err;
    }
  };

  /**
   * Complete a module
   */
  const completeModule = async (moduleId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      await ProgressService.completeModule(user.id, moduleId);

      // Refresh progress to get updated XP and level
      await refreshProgress();

    } catch (err) {
      console.error('Error completing module:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete module');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete a lesson
   */
  const completeLesson = async (
    moduleId: string,
    lessonId: string,
    xpEarned: number,
    timeSpent?: number
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      await ProgressService.completeLesson(user.id, moduleId, lessonId, xpEarned, timeSpent);

      // Award XP
      await awardXP(xpEarned, 'lesson', lessonId, `Completed lesson: ${lessonId}`);

      // Update streak
      await updateStreak();

      // Refresh module progress
      const updatedModuleProgress = await ProgressService.getModuleProgress(user.id, moduleId);
      if (updatedModuleProgress) {
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: updatedModuleProgress,
        }));
      }

    } catch (err) {
      console.error('Error completing lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete lesson');
      throw err;
    }
  };

  /**
   * Complete an exercise
   */
  const completeExercise = async (
    moduleId: string,
    exerciseId: string,
    submittedCode: string,
    xpEarned: number,
    timeSpent?: number,
    attempts: number = 1
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      await ProgressService.completeExercise(
        user.id,
        moduleId,
        exerciseId,
        submittedCode,
        xpEarned,
        timeSpent,
        attempts
      );

      // Award XP
      await awardXP(xpEarned, 'exercise', exerciseId, `Completed exercise: ${exerciseId}`);

      // Update streak
      await updateStreak();

      // Refresh module progress
      const updatedModuleProgress = await ProgressService.getModuleProgress(user.id, moduleId);
      if (updatedModuleProgress) {
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: updatedModuleProgress,
        }));
      }

    } catch (err) {
      console.error('Error completing exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete exercise');
      throw err;
    }
  };

  /**
   * Complete a project
   */
  const completeProject = async (
    moduleId: string,
    projectId: string,
    submittedCode: string,
    score: number,
    xpEarned: number,
    timeSpent?: number
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      await ProgressService.completeProject(
        user.id,
        moduleId,
        projectId,
        submittedCode,
        score,
        xpEarned,
        timeSpent
      );

      // Award XP
      await awardXP(xpEarned, 'project', projectId, `Completed project: ${projectId}`);

      // Update streak
      await updateStreak();

      // Refresh module progress
      const updatedModuleProgress = await ProgressService.getModuleProgress(user.id, moduleId);
      if (updatedModuleProgress) {
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: updatedModuleProgress,
        }));
      }

    } catch (err) {
      console.error('Error completing project:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete project');
      throw err;
    }
  };

  /**
   * Award XP to user
   */
  const awardXP = async (
    amount: number,
    sourceType: 'lesson' | 'exercise' | 'project' | 'assessment' | 'streak' | 'bonus',
    sourceId?: string,
    description?: string
  ) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setError(null);

      await XPService.awardXP(user.id, amount, sourceType, sourceId, description);

      // Optimistic update
      setTotalXP(prev => prev + amount);

      // Check for level up
      const newLevel = XPService.calculateLevel(totalXP + amount);
      if (newLevel > level) {
        setLevel(newLevel);
      }

    } catch (err) {
      console.error('Error awarding XP:', err);
      setError(err instanceof Error ? err.message : 'Failed to award XP');
      throw err;
    }
  };

  /**
   * Update learning streak
   */
  const updateStreak = async () => {
    if (!user?.id) return;

    try {
      const streak = await ProgressService.updateLearningStreak(user.id);
      setCurrentStreak(streak);

      // Award bonus XP for streak milestones
      if (streak.current_streak % 7 === 0 && streak.current_streak > 0) {
        const bonusXP = 50 * (streak.current_streak / 7);
        await awardXP(bonusXP, 'streak', undefined, `${streak.current_streak} day streak!`);
      }

    } catch (err) {
      console.error('Error updating streak:', err);
    }
  };

  /**
   * Refresh all progress data
   */
  const refreshProgress = async () => {
    await loadAllProgressData();
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  const value: ProgressContextType = {
    // State
    userProgress,
    moduleProgress,
    dailyActivity,
    currentStreak,
    totalXP,
    level,
    loading,
    error,

    // Actions
    startModule,
    updateModuleProgress,
    completeModule,
    completeLesson,
    completeExercise,
    completeProject,
    awardXP,
    updateStreak,
    refreshProgress,
    clearError,
  };
  
  // Log whenever totalXP changes
  React.useEffect(() => {
    console.log('[ProgressContext] 📊 totalXP state changed:', totalXP);
  }, [totalXP]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access progress context
 * Must be used within ProgressProvider
 */
export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }

  return context;
}
