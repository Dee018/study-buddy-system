/**
 * Curriculum Context
 * 
 * Provides global curriculum and content management
 * Replaces static curriculum imports with Supabase backend
 * Implements intelligent caching to minimize database queries
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CurriculumService } from '../utils/supabase/dataService';
import type {
  Module as DBModule,
  Lesson as DBLesson,
  Exercise as DBExercise
} from '../utils/supabase/dataService';
import { useAuth } from './AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export interface CurriculumModule extends DBModule {
  lessons: DBLesson[];
  exercises: DBExercise[];
  lessonCount?: number;
  exerciseCount?: number;
  projectCount?: number;
}

export interface ContentCache {
  modules: Map<string, CurriculumModule>;
  lessons: Map<string, DBLesson>;
  exercises: Map<string, DBExercise>;
  allModules: CurriculumModule[] | null;
  lastFetch: Map<string, number>;
}

export interface CurriculumContextType {
  // State
  modules: CurriculumModule[];
  loading: boolean;
  error: string | null;
  cacheValid: boolean;

  // Module Operations
  getModule: (moduleId: string) => CurriculumModule | null;
  getModules: (publishedOnly?: boolean) => Promise<CurriculumModule[]>;
  refreshModules: () => Promise<void>;

  // Lesson Operations
  getLesson: (lessonId: string) => DBLesson | null;
  getLessonsForModule: (moduleId: string) => Promise<DBLesson[]>;

  // Exercise Operations
  getExercise: (exerciseId: string) => DBExercise | null;
  getExercisesForModule: (moduleId: string) => Promise<DBExercise[]>;

  // Admin Operations (if admin user)
  createModule: (module: Partial<DBModule>) => Promise<DBModule>;
  updateModule: (moduleId: string, updates: Partial<DBModule>) => Promise<DBModule>;
  deleteModule: (moduleId: string) => Promise<void>;

  createLesson: (lesson: Partial<DBLesson>) => Promise<DBLesson>;
  updateLesson: (lessonId: string, updates: Partial<DBLesson>) => Promise<DBLesson>;
  deleteLesson: (lessonId: string) => Promise<void>;

  createExercise: (exercise: Partial<DBExercise>) => Promise<DBExercise>;
  updateExercise: (exerciseId: string, updates: Partial<DBExercise>) => Promise<DBExercise>;
  deleteExercise: (exerciseId: string) => Promise<void>;

  // Cache Management
  invalidateCache: (type?: 'modules' | 'lessons' | 'exercises' | 'all') => void;
  clearCache: () => void;
  clearError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CurriculumContext = createContext<CurriculumContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const _MAX_CACHE_SIZE = 100; // Maximum items per cache type
void _MAX_CACHE_SIZE;

export function CurriculumProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const isAdmin = (profile as any)?.is_admin === true || profile?.role === 'admin';

  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cache state
  const [cache, setCache] = useState<ContentCache>({
    modules: new Map(),
    lessons: new Map(),
    exercises: new Map(),
    allModules: null,
    lastFetch: new Map(),
  });

  /**
   * Check if cache is valid for a given key
   */
  const isCacheValid = useCallback((key: string): boolean => {
    const lastFetch = cache.lastFetch.get(key);
    if (!lastFetch) return false;

    const now = Date.now();
    return (now - lastFetch) < CACHE_DURATION_MS;
  }, [cache.lastFetch]);

  /**
   * Update cache timestamp
   */
  const updateCacheTimestamp = useCallback((key: string) => {
    setCache(prev => {
      const newLastFetch = new Map(prev.lastFetch);
      newLastFetch.set(key, Date.now());
      return { ...prev, lastFetch: newLastFetch };
    });
  }, []);

  /**
   * Load all modules with caching
   */
  const loadModules = useCallback(async (publishedOnly: boolean = true) => {
    const cacheKey = `modules_${publishedOnly}`;

    // Return cached data if valid
    if (isCacheValid(cacheKey) && cache.allModules) {
      return cache.allModules;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch modules from database
      const dbModules = await CurriculumService.getModules(publishedOnly);

      // Fetch lessons and exercises for each module
      const enrichedModules = await Promise.all(
        dbModules.map(async (module) => {
          const lessons = await CurriculumService.getLessons(module.id, publishedOnly);
          const exercises = await CurriculumService.getExercises(module.id, publishedOnly);

          return {
            ...module,
            lessons,
            exercises,
            lessonCount: lessons.length,
            exerciseCount: exercises.length,
            projectCount: module.module_data?.hasProject ? 1 : 0,
          } as CurriculumModule;
        })
      );

      // Update cache
      setCache(prev => {
        const newModulesMap = new Map(prev.modules);
        const newLessonsMap = new Map(prev.lessons);
        const newExercisesMap = new Map(prev.exercises);

        enrichedModules.forEach(module => {
          newModulesMap.set(module.id, module);

          module.lessons.forEach(lesson => {
            newLessonsMap.set(lesson.id, lesson);
          });

          module.exercises.forEach(exercise => {
            newExercisesMap.set(exercise.id, exercise);
          });
        });

        return {
          ...prev,
          modules: newModulesMap,
          lessons: newLessonsMap,
          exercises: newExercisesMap,
          allModules: enrichedModules,
        };
      });

      updateCacheTimestamp(cacheKey);
      setModules(enrichedModules);

      return enrichedModules;
    } catch (err) {
      console.error('Error loading modules:', err);
      setError(err instanceof Error ? err.message : 'Failed to load curriculum');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, cache.allModules, updateCacheTimestamp]);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadModules(!isAdmin); // Load all modules if admin, published only if learner
  }, [isAdmin, loadModules]);

  /**
   * Get module from cache or fetch
   */
  const getModule = useCallback((moduleId: string): CurriculumModule | null => {
    return cache.modules.get(moduleId) || null;
  }, [cache.modules]);

  /**
   * Get all modules
   */
  const getModules = useCallback(async (publishedOnly: boolean = true): Promise<CurriculumModule[]> => {
    return await loadModules(publishedOnly);
  }, [loadModules]);

  // ==========================================================================
  // CACHE MANAGEMENT
  // ==========================================================================

  /**
   * Invalidate specific cache or all
   */
  const invalidateCache = useCallback((type: 'modules' | 'lessons' | 'exercises' | 'all' = 'all') => {
    setCache(prev => {
      const newLastFetch = new Map(prev.lastFetch);

      if (type === 'all') {
        newLastFetch.clear();
        return {
          modules: new Map(),
          lessons: new Map(),
          exercises: new Map(),
          allModules: null,
          lastFetch: newLastFetch,
        };
      }

      // Clear specific cache type
      const keysToRemove: string[] = [];
      newLastFetch.forEach((_, key) => {
        if (key.startsWith(type)) {
          keysToRemove.push(key);
        }
      });
      keysToRemove.forEach(key => newLastFetch.delete(key));

      return {
        ...prev,
        [type]: new Map(),
        lastFetch: newLastFetch,
        allModules: type === 'modules' ? null : prev.allModules,
      };
    });
  }, []);

  /**
   * Clear all cache
   */
  const clearCache = useCallback(() => {
    invalidateCache('all');
  }, [invalidateCache]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  /**
   * Refresh modules (force reload)
   */
  const refreshModules = useCallback(async () => {
    invalidateCache('modules');
    await loadModules(!isAdmin);
  }, [isAdmin, loadModules, invalidateCache]);


  /**
   * Get lesson from cache
   */
  const getLesson = useCallback((lessonId: string): DBLesson | null => {
    return cache.lessons.get(lessonId) || null;
  }, [cache.lessons]);

  /**
   * Get lessons for a module
   */
  const getLessonsForModule = useCallback(async (moduleId: string): Promise<DBLesson[]> => {
    const cacheKey = `lessons_${moduleId}`;

    // Check if module is already loaded with lessons
    const cachedModule = cache.modules.get(moduleId);
    if (cachedModule && cachedModule.lessons.length > 0 && isCacheValid(cacheKey)) {
      return cachedModule.lessons;
    }

    try {
      const lessons = await CurriculumService.getLessons(moduleId, !isAdmin);

      // Update cache
      setCache(prev => {
        const newLessonsMap = new Map(prev.lessons);
        lessons.forEach(lesson => {
          newLessonsMap.set(lesson.id, lesson);
        });

        const newModulesMap = new Map(prev.modules);
        const module = newModulesMap.get(moduleId);
        if (module) {
          newModulesMap.set(moduleId, { ...module, lessons });
        }

        return {
          ...prev,
          lessons: newLessonsMap,
          modules: newModulesMap,
        };
      });

      updateCacheTimestamp(cacheKey);
      return lessons;
    } catch (err) {
      console.error('Error loading lessons:', err);
      return [];
    }
  }, [cache.modules, isCacheValid, isAdmin, updateCacheTimestamp]);

  /**
   * Get exercise from cache
   */
  const getExercise = useCallback((exerciseId: string): DBExercise | null => {
    return cache.exercises.get(exerciseId) || null;
  }, [cache.exercises]);

  /**
   * Get exercises for a module
   */
  const getExercisesForModule = useCallback(async (moduleId: string): Promise<DBExercise[]> => {
    const cacheKey = `exercises_${moduleId}`;

    // Check if module is already loaded with exercises
    const cachedModule = cache.modules.get(moduleId);
    if (cachedModule && cachedModule.exercises.length > 0 && isCacheValid(cacheKey)) {
      return cachedModule.exercises;
    }

    try {
      const exercises = await CurriculumService.getExercises(moduleId, !isAdmin);

      // Update cache
      setCache(prev => {
        const newExercisesMap = new Map(prev.exercises);
        exercises.forEach(exercise => {
          newExercisesMap.set(exercise.id, exercise);
        });

        const newModulesMap = new Map(prev.modules);
        const module = newModulesMap.get(moduleId);
        if (module) {
          newModulesMap.set(moduleId, { ...module, exercises });
        }

        return {
          ...prev,
          exercises: newExercisesMap,
          modules: newModulesMap,
        };
      });

      updateCacheTimestamp(cacheKey);
      return exercises;
    } catch (err) {
      console.error('Error loading exercises:', err);
      return [];
    }
  }, [cache.modules, isCacheValid, isAdmin, updateCacheTimestamp]);

  // ============================================================================
  // ADMIN OPERATIONS - Module Management
  // ============================================================================

  /**
   * Create new module (admin only)
   */
  const createModule = useCallback(async (module: Partial<DBModule>): Promise<DBModule> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const newModule = await CurriculumService.upsertModule({
        ...module,
        created_by: user?.id,
      });

      // Invalidate modules cache
      invalidateCache('modules');
      await refreshModules();

      return newModule;
    } catch (err) {
      console.error('Error creating module:', err);
      throw err;
    }
  }, [isAdmin, user?.id, invalidateCache, refreshModules]);

  /**
   * Update module (admin only)
   */
  const updateModule = useCallback(async (moduleId: string, updates: Partial<DBModule>): Promise<DBModule> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const updatedModule = await CurriculumService.upsertModule({
        id: moduleId,
        ...updates,
      });

      // Invalidate modules cache
      invalidateCache('modules');
      await refreshModules();

      return updatedModule;
    } catch (err) {
      console.error('Error updating module:', err);
      throw err;
    }
  }, [isAdmin, invalidateCache, refreshModules]);

  /**
   * Delete module (admin only)
   */
  const deleteModule = useCallback(async (moduleId: string): Promise<void> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      await CurriculumService.deleteModule(moduleId);

      // Invalidate modules cache
      invalidateCache('modules');
      await refreshModules();
    } catch (err) {
      console.error('Error deleting module:', err);
      throw err;
    }
  }, [isAdmin, invalidateCache, refreshModules]);

  // ============================================================================
  // ADMIN OPERATIONS - Lesson Management
  // ============================================================================

  /**
   * Create new lesson (admin only)
   */
  const createLesson = useCallback(async (lesson: Partial<DBLesson>): Promise<DBLesson> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const newLesson = await CurriculumService.upsertLesson(lesson);

      // Invalidate lessons cache for this module
      if (lesson.module_id) {
        invalidateCache('lessons');
        await getLessonsForModule(lesson.module_id);
      }

      return newLesson;
    } catch (err) {
      console.error('Error creating lesson:', err);
      throw err;
    }
  }, [isAdmin, invalidateCache, getLessonsForModule]);

  /**
   * Update lesson (admin only)
   */
  const updateLesson = useCallback(async (lessonId: string, updates: Partial<DBLesson>): Promise<DBLesson> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const updatedLesson = await CurriculumService.upsertLesson({
        id: lessonId,
        ...updates,
      });

      // Invalidate lessons cache
      invalidateCache('lessons');
      if (updatedLesson.module_id) {
        await getLessonsForModule(updatedLesson.module_id);
      }

      return updatedLesson;
    } catch (err) {
      console.error('Error updating lesson:', err);
      throw err;
    }
  }, [isAdmin, invalidateCache, getLessonsForModule]);

  /**
   * Delete lesson (admin only)
   */
  const deleteLesson = useCallback(async (lessonId: string): Promise<void> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const lesson = cache.lessons.get(lessonId);

      // Note: Implement deleteLesson in CurriculumService
      // await CurriculumService.deleteLesson(lessonId);

      // Invalidate lessons cache
      invalidateCache('lessons');
      if (lesson?.module_id) {
        await getLessonsForModule(lesson.module_id);
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
      throw err;
    }
  }, [isAdmin, cache.lessons, invalidateCache, getLessonsForModule]);

  // ============================================================================
  // ADMIN OPERATIONS - Exercise Management
  // ============================================================================

  /**
   * Create new exercise (admin only)
   */
  const createExercise = useCallback(async (exercise: Partial<DBExercise>): Promise<DBExercise> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const newExercise = await CurriculumService.upsertExercise(exercise);

      // Invalidate exercises cache
      if (exercise.module_id) {
        invalidateCache('exercises');
        await getExercisesForModule(exercise.module_id);
      }

      return newExercise;
    } catch (err) {
      console.error('Error creating exercise:', err);
      throw err;
    }
  }, [isAdmin, invalidateCache, getExercisesForModule]);

  /**
   * Update exercise (admin only)
   */
  const updateExercise = useCallback(async (exerciseId: string, updates: Partial<DBExercise>): Promise<DBExercise> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const updatedExercise = await CurriculumService.upsertExercise({
        id: exerciseId,
        ...updates,
      });

      // Invalidate exercises cache
      invalidateCache('exercises');
      if (updatedExercise.module_id) {
        await getExercisesForModule(updatedExercise.module_id);
      }

      return updatedExercise;
    } catch (err) {
      console.error('Error updating exercise:', err);
      throw err;
    }
  }, [isAdmin, invalidateCache, getExercisesForModule]);

  /**
   * Delete exercise (admin only)
   */
  const deleteExercise = useCallback(async (exerciseId: string): Promise<void> => {
    if (!isAdmin) throw new Error('Admin access required');

    try {
      const exercise = cache.exercises.get(exerciseId);

      // Note: Implement deleteExercise in CurriculumService
      // await CurriculumService.deleteExercise(exerciseId);

      // Invalidate exercises cache
      invalidateCache('exercises');
      if (exercise?.module_id) {
        await getExercisesForModule(exercise.module_id);
      }
    } catch (err) {
      console.error('Error deleting exercise:', err);
      throw err;
    }
  }, [isAdmin, cache.exercises, invalidateCache, getExercisesForModule]);


  const value: CurriculumContextType = {
    // State
    modules,
    loading,
    error,
    cacheValid: cache.allModules !== null && isCacheValid('modules_true'),

    // Module Operations
    getModule,
    getModules,
    refreshModules,

    // Lesson Operations
    getLesson,
    getLessonsForModule,

    // Exercise Operations
    getExercise,
    getExercisesForModule,

    // Admin Operations
    createModule,
    updateModule,
    deleteModule,
    createLesson,
    updateLesson,
    deleteLesson,
    createExercise,
    updateExercise,
    deleteExercise,

    // Cache Management
    invalidateCache,
    clearCache,
    clearError,
  };

  return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access curriculum context
 * Must be used within CurriculumProvider
 */
export function useCurriculum() {
  const context = useContext(CurriculumContext);

  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }

  return context;
}
