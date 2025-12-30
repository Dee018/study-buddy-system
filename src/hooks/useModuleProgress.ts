/**
 * useModuleProgress Hook
 * 
 * Provides real-time, system-wide progress tracking for modules
 * Ensures consistency across all components (Learning Hub, Progress Tracker, Profile, Admin)
 * 
 * Key Features:
 * - Real-time progress synchronization
 * - Persistent module completion (never resets)
 * - Exercise/project code retrieval
 * - Completion state management
 * - Auto-refresh on progress updates
 */

import { useState, useEffect, useCallback } from 'react';
import { ProgressSyncManager } from '../utils/progressSyncManager';
import { ProgressManager } from '../utils/progressManager';
import { ModuleDetailedProgress } from '../data/javaCurriculum';

export interface ModuleProgressData {
  moduleId: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  completedLessons: string[];
  completedExercises: string[];
  projectCompleted: boolean;
  completionPercentage: number;
  totalLessons: number;
  totalExercises: number;
  hasProject: boolean;
}

export interface ExerciseSubmission {
  exerciseId: string;
  code: string;
  isCompleted: boolean;
  canEdit: boolean;
}

export interface ProjectSubmission {
  code: string;
  isCompleted: boolean;
  canEdit: boolean;
}

/**
 * Hook to track progress for a specific module
 */
export function useModuleProgress(userId: string | undefined, moduleId: string) {
  const [progressData, setProgressData] = useState<ModuleProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = useCallback(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const moduleProgress = ProgressSyncManager.getModuleProgress(userId, moduleId);
      const snapshot = ProgressSyncManager.getProgressSnapshot(userId);

      // Get module details for totals (search across all modules)
      const { allModules } = require('../data/comprehensiveBeginnerCurriculum');
      let module = allModules.find((m: any) => m.id === moduleId);

      // Handle ID format variations
      if (!module) {
        if (moduleId.startsWith('module-')) {
          const enhancedId = moduleId.replace('module-', 'beginner-module-');
          module = allModules.find((m: any) => m.id === enhancedId);
        } else if (moduleId.startsWith('beginner-module-')) {
          const standardId = moduleId.replace('beginner-module-', 'module-');
          module = allModules.find((m: any) => m.id === standardId);
        }
      }

      const totalLessons = module?.lessons?.length || 0;
      const totalExercises = module?.handsOnExercises?.length || 0;
      const hasProject = !!module?.assessmentProject;

      const detailedProgress: ModuleDetailedProgress = (moduleProgress && typeof moduleProgress === 'object')
        ? (moduleProgress as ModuleDetailedProgress)
        : { completedLessons: [], completedExercises: [], projectCompleted: false };

      const completedCount =
        (detailedProgress.completedLessons?.length || 0) +
        (detailedProgress.completedExercises?.length || 0) +
        (detailedProgress.projectCompleted ? 1 : 0);

      const totalCount = totalLessons + totalExercises + (hasProject ? 1 : 0);
      const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // Check if module is unlocked/completed using the snapshot + module progress
      const isUnlocked = Boolean((detailedProgress.unlockedLessons && detailedProgress.unlockedLessons.length) || (detailedProgress.unlockedExercises && detailedProgress.unlockedExercises.length));
      const isCompleted = (snapshot.completedModules || []).includes(moduleId) || false;

      setProgressData({
        moduleId,
        isCompleted,
        isUnlocked,
        completedLessons: detailedProgress.completedLessons || [],
        completedExercises: detailedProgress.completedExercises || [],
        projectCompleted: detailedProgress.projectCompleted || false,
        completionPercentage,
        totalLessons,
        totalExercises,
        hasProject
      });
    } catch (error) {
      console.error('Error loading module progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, moduleId]);

  // Subscribe to progress updates
  useEffect(() => {
    loadProgress();

    if (!userId) return;

    const unsubscribe = ProgressSyncManager.subscribe((event) => {
      // If the update is specific to this module, refresh only then. Otherwise refresh when it's a user/global update.
      if (event.userId === userId || event.userId === 'all') {
        if (event.moduleId) {
          if (event.moduleId === moduleId) loadProgress();
        } else {
          loadProgress();
        }
      }
    });

    return unsubscribe;
  }, [userId, loadProgress]);

  return {
    progressData,
    isLoading,
    refresh: loadProgress
  };
}

/**
 * Hook to get exercise submission data
 */
export function useExerciseSubmission(
  userId: string | undefined,
  moduleId: string,
  exerciseId: string
): ExerciseSubmission | null {
  const [submission, setSubmission] = useState<ExerciseSubmission | null>(null);

  const loadSubmission = useCallback(() => {
    if (!userId) return;

    try {
      const moduleProgress = ProgressSyncManager.getModuleProgress(userId, moduleId);
      const detailedForExercise: ModuleDetailedProgress = (moduleProgress && typeof moduleProgress === 'object')
        ? (moduleProgress as ModuleDetailedProgress)
        : { completedLessons: [], completedExercises: [], projectCompleted: false };
      const isCompleted = detailedForExercise.completedExercises?.includes(exerciseId) || false;
      const code = ProgressManager.getExerciseCode(userId, moduleId, exerciseId);

      setSubmission({
        exerciseId,
        code: code || '',
        isCompleted,
        canEdit: !isCompleted // Once completed, becomes read-only
      });
    } catch (error) {
      console.error('Error loading exercise submission:', error);
    }
  }, [userId, moduleId, exerciseId]);

  useEffect(() => {
    loadSubmission();

    if (!userId) return;

    const unsubscribe = ProgressSyncManager.subscribe((event) => {
      if ((event.userId === userId || event.userId === 'all') && event.type === 'progress-updated' && event.moduleId === moduleId) {
        loadSubmission();
      }
    });

    return unsubscribe;
  }, [userId, moduleId, exerciseId, loadSubmission]);

  return submission;
}

/**
 * Hook to get project submission data
 */
export function useProjectSubmission(
  userId: string | undefined,
  moduleId: string
): ProjectSubmission | null {
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);

  const loadSubmission = useCallback(() => {
    if (!userId) return;

    try {
      const moduleProgress = ProgressSyncManager.getModuleProgress(userId, moduleId);
      const detailedForProject: ModuleDetailedProgress = (moduleProgress && typeof moduleProgress === 'object')
        ? (moduleProgress as ModuleDetailedProgress)
        : { completedLessons: [], completedExercises: [], projectCompleted: false };
      const isCompleted = detailedForProject.projectCompleted || false;
      const code = ProgressManager.getProjectCode(userId, moduleId);

      setSubmission({
        code: code || '',
        isCompleted,
        canEdit: !isCompleted // Once completed, becomes read-only
      });
    } catch (error) {
      console.error('Error loading project submission:', error);
    }
  }, [userId, moduleId]);

  useEffect(() => {
    loadSubmission();

    if (!userId) return;

    const unsubscribe = ProgressSyncManager.subscribe((event) => {
      if ((event.userId === userId || event.userId === 'all') && event.type === 'progress-updated' && event.moduleId === moduleId) {
        loadSubmission();
      }
    });

    return unsubscribe;
  }, [userId, moduleId, loadSubmission]);

  return submission;
}

/**
 * Hook to track all modules progress (for dashboard views)
 */
export function useAllModulesProgress(userId: string | undefined) {
  const [allProgress, setAllProgress] = useState<ModuleProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllProgress = useCallback(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      const { allModules } = require('../data/comprehensiveBeginnerCurriculum');
      const snapshot = ProgressSyncManager.getProgressSnapshot(userId);

      const allData = allModules.map((module: any) => {
        const moduleProgress = ProgressSyncManager.getModuleProgress(userId, module.id);

        const detailedProgress: ModuleDetailedProgress = (moduleProgress && typeof moduleProgress === 'object')
          ? (moduleProgress as ModuleDetailedProgress)
          : { completedLessons: [], completedExercises: [], projectCompleted: false };

        const totalLessons = module.lessons?.length || 0;
        const totalExercises = module.handsOnExercises?.length || 0;
        const hasProject = !!module.assessmentProject;

        const completedCount =
          (detailedProgress.completedLessons?.length || 0) +
          (detailedProgress.completedExercises?.length || 0) +
          (detailedProgress.projectCompleted ? 1 : 0);

        const totalCount = totalLessons + totalExercises + (hasProject ? 1 : 0);
        const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const isUnlocked = Boolean((detailedProgress.unlockedLessons && detailedProgress.unlockedLessons.length) || (detailedProgress.unlockedExercises && detailedProgress.unlockedExercises.length));
        const isCompleted = (snapshot.completedModules || []).includes(module.id) || false;

        return {
          moduleId: module.id,
          isCompleted,
          isUnlocked,
          completedLessons: detailedProgress.completedLessons || [],
          completedExercises: detailedProgress.completedExercises || [],
          projectCompleted: detailedProgress.projectCompleted || false,
          completionPercentage,
          totalLessons,
          totalExercises,
          hasProject
        };
      });

      setAllProgress(allData);
    } catch (error) {
      console.error('Error loading all modules progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAllProgress();

    if (!userId) return;

    const unsubscribe = ProgressSyncManager.subscribe((event) => {
      if (event.userId !== userId && event.userId !== 'all') return;

      // If it's a module-scoped update, update only that module entry to avoid full re-renders
      if (event.moduleId) {
        try {
          const { allModules } = require('../data/comprehensiveBeginnerCurriculum');
          const moduleMeta = allModules.find((m: any) => m.id === event.moduleId);
          if (!moduleMeta) return;

          setAllProgress(prev => {
            if (!prev || prev.length === 0) return prev;
            const idx = prev.findIndex(p => p.moduleId === event.moduleId);
            if (idx === -1) return prev;

            const mp = ProgressSyncManager.getModuleProgress(userId, event.moduleId);
            const detailedProgress: ModuleDetailedProgress = (mp && typeof mp === 'object')
              ? (mp as ModuleDetailedProgress)
              : { completedLessons: [], completedExercises: [], projectCompleted: false };

            const totalLessons = moduleMeta.lessons?.length || 0;
            const totalExercises = moduleMeta.handsOnExercises?.length || 0;
            const hasProject = !!moduleMeta.assessmentProject;

            const completedCount =
              (detailedProgress.completedLessons?.length || 0) +
              (detailedProgress.completedExercises?.length || 0) +
              (detailedProgress.projectCompleted ? 1 : 0);

            const totalCount = totalLessons + totalExercises + (hasProject ? 1 : 0);
            const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            const isUnlocked = Boolean((detailedProgress.unlockedLessons && detailedProgress.unlockedLessons.length) || (detailedProgress.unlockedExercises && detailedProgress.unlockedExercises.length));

            const newEntry = {
              moduleId: event.moduleId,
              isCompleted: (ProgressSyncManager.getProgressSnapshot(userId).completedModules || []).includes(event.moduleId),
              isUnlocked,
              completedLessons: detailedProgress.completedLessons || [],
              completedExercises: detailedProgress.completedExercises || [],
              projectCompleted: detailedProgress.projectCompleted || false,
              completionPercentage,
              totalLessons,
              totalExercises,
              hasProject
            };

            // If nothing changed, keep previous array
            const prevEntry = prev[idx];
            const changed = JSON.stringify(prevEntry) !== JSON.stringify(newEntry);
            if (!changed) return prev;

            const copy = prev.slice();
            copy[idx] = newEntry;
            return copy;
          });
        } catch (e) { console.error('Error handling module-scoped progress update', e); }
      } else {
        loadAllProgress();
      }
    });

    return unsubscribe;
  }, [userId, loadAllProgress]);

  return {
    allProgress,
    isLoading,
    refresh: loadAllProgress
  };
}

/**
 * Hook to check if an item is completed (lesson, exercise, or project)
 */
export function useItemCompletion(
  userId: string | undefined,
  moduleId: string,
  itemId: string,
  itemType: 'lesson' | 'exercise' | 'project'
): boolean {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const checkCompletion = () => {
      const completed = ProgressSyncManager.isItemCompleted(userId, moduleId, itemId, itemType);
      setIsCompleted(completed);
    };

    checkCompletion();

    const unsubscribe = ProgressSyncManager.subscribe((event) => {
      if ((event.userId === userId || event.userId === 'all') && event.type === 'progress-updated' && event.moduleId === moduleId) {
        checkCompletion();
      }
    });

    return unsubscribe;
  }, [userId, moduleId, itemId, itemType]);

  return isCompleted;
}

/**
 * Hook to get completion statistics
 */
export function useCompletionStats(userId: string | undefined) {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalExercises: 0,
    totalProjects: 0,
    totalModules: 0,
    totalXP: 0,
    completionPercentage: 0
  });

  useEffect(() => {
    if (!userId) return;

    const updateStats = () => {
      const newStats = ProgressSyncManager.getCompletionStats(userId);
      setStats(newStats);
    };

    updateStats();

    const unsubscribe = ProgressSyncManager.subscribe((event) => {
      if (event.userId === userId || event.userId === 'all') {
        updateStats();
      }
    });

    return unsubscribe;
  }, [userId]);

  return stats;
}
