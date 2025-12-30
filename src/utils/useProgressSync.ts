/**
 * useProgressSync Hook
 * React hook for automatic progress synchronization across components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProgressSyncManager, ProgressEvent, ProgressSnapshot } from './progressSyncManager';
import { ProgressManager } from './progressManager';
import { UserProgress, ModuleDetailedProgress } from '../data/javaCurriculum';

/**
 * Hook for syncing with user's overall progress
 */
export function useProgressSync(userId: string) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    // Initial load
    const loadedProgress = ProgressManager.loadProgress(userId);
    setProgress(loadedProgress);
    setIsLoading(false);

    // Subscribe to progress updates
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      if (event.userId === userId || event.userId === 'all') {
        const updatedProgress = ProgressManager.loadProgress(userId);
        setProgress(updatedProgress);
        setLastUpdate(event.timestamp);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const refresh = useCallback(() => {
    if (userId) {
      const updatedProgress = ProgressManager.loadProgress(userId);
      setProgress(updatedProgress);
      setLastUpdate(new Date().toISOString());
    }
  }, [userId]);

  return {
    progress,
    isLoading,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for syncing with module-specific progress
 */
export function useModuleProgress(userId: string, moduleId: string) {
  const [moduleProgress, setModuleProgress] = useState<ModuleDetailedProgress>({
    completedLessons: [],
    completedExercises: [],
    projectCompleted: false
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!userId || !moduleId) return;

    // Initial load
    const loadModule = () => {
      const progress = ProgressSyncManager.getModuleProgress(userId, moduleId);
      setModuleProgress(progress);
      
      const completed = ProgressManager.isModuleCompleted(userId, moduleId);
      setIsCompleted(completed);
    };

    loadModule();

    // Subscribe to progress updates for this module
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      if ((event.userId === userId || event.userId === 'all') && 
          (!event.moduleId || event.moduleId === moduleId)) {
        loadModule();
        setLastUpdate(event.timestamp);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, moduleId]);

  const refresh = useCallback(() => {
    if (userId && moduleId) {
      const progress = ProgressSyncManager.getModuleProgress(userId, moduleId);
      setModuleProgress(progress);
      
      const completed = ProgressManager.isModuleCompleted(userId, moduleId);
      setIsCompleted(completed);
      setLastUpdate(new Date().toISOString());
    }
  }, [userId, moduleId]);

  return {
    moduleProgress,
    isCompleted,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for tracking specific item completion status
 */
export function useItemCompletion(
  userId: string,
  moduleId: string,
  itemId: string,
  itemType: 'lesson' | 'exercise' | 'project'
) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!userId || !moduleId || !itemId) return;

    // Initial check
    const checkCompletion = () => {
      const completed = ProgressSyncManager.isItemCompleted(userId, moduleId, itemId, itemType);
      setIsCompleted(completed);
    };

    checkCompletion();

    // Subscribe to completion events
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      if ((event.userId === userId || event.userId === 'all') &&
          (!event.moduleId || event.moduleId === moduleId)) {
        checkCompletion();
        setLastUpdate(event.timestamp);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, moduleId, itemId, itemType]);

  const refresh = useCallback(() => {
    if (userId && moduleId && itemId) {
      const completed = ProgressSyncManager.isItemCompleted(userId, moduleId, itemId, itemType);
      setIsCompleted(completed);
      setLastUpdate(new Date().toISOString());
    }
  }, [userId, moduleId, itemId, itemType]);

  return {
    isCompleted,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for completion statistics
 */
export function useCompletionStats(userId: string) {
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalExercises: 0,
    totalProjects: 0,
    totalModules: 0,
    totalXP: 0,
    completionPercentage: 0
  });
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!userId) return;

    // Initial load
    const loadStats = () => {
      const completionStats = ProgressSyncManager.getCompletionStats(userId);
      setStats(completionStats);
    };

    loadStats();

    // Subscribe to any progress update
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      if (event.userId === userId || event.userId === 'all') {
        loadStats();
        setLastUpdate(event.timestamp);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const refresh = useCallback(() => {
    if (userId) {
      const completionStats = ProgressSyncManager.getCompletionStats(userId);
      setStats(completionStats);
      setLastUpdate(new Date().toISOString());
    }
  }, [userId]);

  return {
    stats,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for progress snapshot
 */
export function useProgressSnapshot(userId: string) {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!userId) return;

    // Initial load
    const loadSnapshot = () => {
      const progressSnapshot = ProgressSyncManager.getProgressSnapshot(userId);
      setSnapshot(progressSnapshot);
    };

    loadSnapshot();

    // Subscribe to progress updates
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      if (event.userId === userId || event.userId === 'all') {
        loadSnapshot();
        setLastUpdate(event.timestamp);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  const refresh = useCallback(() => {
    if (userId) {
      const progressSnapshot = ProgressSyncManager.getProgressSnapshot(userId);
      setSnapshot(progressSnapshot);
      setLastUpdate(new Date().toISOString());
    }
  }, [userId]);

  return {
    snapshot,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for progress consistency monitoring
 */
export function useProgressConsistency(userId: string) {
  const [issues, setIssues] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Initial check
    const checkConsistency = () => {
      const foundIssues = ProgressSyncManager.verifyConsistency(userId);
      setIssues(foundIssues);
    };

    checkConsistency();

    // Check every 30 seconds
    checkIntervalRef.current = setInterval(checkConsistency, 30000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [userId]);

  const fix = useCallback(async () => {
    if (!userId) return { fixed: 0, issues: [] };

    setIsChecking(true);
    const result = ProgressSyncManager.fixInconsistencies(userId);
    setIssues(result.issues);
    setIsChecking(false);

    return result;
  }, [userId]);

  const check = useCallback(() => {
    if (!userId) return;

    const foundIssues = ProgressSyncManager.verifyConsistency(userId);
    setIssues(foundIssues);
  }, [userId]);

  return {
    issues,
    isChecking,
    hasIssues: issues.length > 0,
    fix,
    check
  };
}

/**
 * Hook for real-time XP tracking
 */
export function useXPTracking(userId: string) {
  const [totalXP, setTotalXP] = useState(0);
  const [recentXP, setRecentXP] = useState<{ amount: number; timestamp: string }[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (!userId) return;

    // Initial load
    const loadXP = () => {
      const snapshot = ProgressSyncManager.getProgressSnapshot(userId);
      setTotalXP(snapshot.totalXP);
    };

    loadXP();

    // Subscribe to XP-earning events
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      if (event.userId === userId && event.xp) {
        // Update recent XP
        setRecentXP(prev => [
          ...prev.slice(-4), // Keep last 4
          { amount: event.xp!, timestamp: event.timestamp }
        ]);
        
        // Reload total
        loadXP();
        setLastUpdate(event.timestamp);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return {
    totalXP,
    recentXP,
    lastUpdate
  };
}

/**
 * Hook for listening to specific progress events
 */
export function useProgressEvents(
  userId: string,
  eventTypes?: ProgressEventType[]
) {
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<ProgressEvent | null>(null);

  useEffect(() => {
    const unsubscribe = ProgressSyncManager.subscribe((event: ProgressEvent) => {
      // Filter by user
      if (event.userId !== userId && event.userId !== 'all') return;

      // Filter by event type if specified
      if (eventTypes && !eventTypes.includes(event.type)) return;

      setLatestEvent(event);
      setEvents(prev => [...prev.slice(-9), event]); // Keep last 10
    });

    return () => {
      unsubscribe();
    };
  }, [userId, eventTypes]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLatestEvent(null);
  }, []);

  return {
    events,
    latestEvent,
    clearEvents
  };
}
