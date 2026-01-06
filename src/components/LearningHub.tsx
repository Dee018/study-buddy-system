import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
// Removed unused Tabs and ScrollArea imports
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { javaCurriculum, getUnlockedModules, getModuleProgress, getModulesByCategory, getNextAvailableModule, shouldLevelUp, calculateDetailedProgress, Module, Lesson } from '../data/javaCurriculum';
import { allModules as allCurriculumModules, DetailedModule, Exercise, Project, DetailedLesson } from '../data/comprehensiveBeginnerCurriculum';
import { CurriculumManager } from '../utils/curriculumManager';
import ContentManager from '../utils/contentManager';
import { ProgressManager, DailyActivity } from '../utils/progressManager';
import { ProgressSyncManager } from '../utils/progressSyncManager';
import { useProgressSync, useCompletionStats } from '../utils/useProgressSync';
import { useProgress } from '../contexts/ProgressContext';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import { EnhancedLearningModule } from './EnhancedLearningModule';
import { LessonView } from './LessonView';
import { ExerciseViewer } from './ExerciseViewer';
import { ProjectViewer } from './ProjectViewer';
import { Footer } from './Footer';
import { validateProjectFriendly } from '../utils/projectValidation';
import { scrollToTop } from '../utils/scrollUtils';
import XPSystem from '../utils/xpSystem';
import { asDetailedModuleProgress } from '../utils/moduleProgressCompat';
import {
  BookOpen,
  Code,
  Play,
  CheckCircle,
  Lock,
  Star,
  Zap,
  Brain,
  Trophy,
  ArrowRight,
  Lightbulb,
  Target,
  Calendar,
  ArrowLeft,
  Flame,
  Sparkles
} from 'lucide-react';

interface LearningHubProps {
  onNavigate: (screen: string, data?: any) => void;
  userLevel: string;
  userPoints?: number;
  username?: string;
  isNewUser?: boolean;
  userId: string;
  onUserLevelUp?: (newLevel: string) => void;
  onXPEarned?: (points: number, title: string) => void;
  onPointsRefresh?: () => void;
  navigationData?: any;
}

export function LearningHub({ onNavigate, userLevel, userPoints = 0, username = '', isNewUser: propIsNewUser, userId, onUserLevelUp, onXPEarned, onPointsRefresh, navigationData }: LearningHubProps) {
  // Get XP from ProgressContext (single source of truth from user_progress table)
  const progressContext = useProgress();
  const actualUserPoints = (typeof progressContext?.totalXP === 'number' && isFinite(progressContext.totalXP))
    ? progressContext.totalXP
    : (typeof userPoints === 'number' && isFinite(userPoints) ? userPoints : 0);

  // Debug: Log XP values
  useEffect(() => {
    console.log('[LearningHub] XP values:', {
      contextTotalXP: progressContext?.totalXP,
      propUserPoints: userPoints,
      actualUserPoints,
      userId
    });
  }, [progressContext?.totalXP, userPoints, actualUserPoints, userId]);

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedEnhancedModule, setSelectedEnhancedModule] = useState<DetailedModule | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeDetailedLesson, setActiveDetailedLesson] = useState<DetailedLesson | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectSubmissions, setProjectSubmissions] = useState<{ [key: string]: { state: 'not-submitted' | 'submitted-with-errors' | 'submitted-successfully', lastCode: string, validationErrors?: any[] } }>({});
  const [isNewUser, setIsNewUser] = useState(false);
  const [showLessonQuiz, setShowLessonQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [_currentQuizAnswer, _setCurrentQuizAnswer] = useState<string>('');
  const [quizFeedback, setQuizFeedback] = useState<string>('');
  const [_showExpandedProgress, _setShowExpandedProgress] = useState(false);
  const [_showExpandedQuest, _setShowExpandedQuest] = useState(false);
  const [lastActiveTab, setLastActiveTab] = useState<'lessons' | 'exercises' | 'project'>('lessons');
  const LOCAL_STORAGE_KEY = 'sb_openAccordionItems_v1';

  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return ['Beginner']; // Default to Beginner track open
  });

  // Persist accordion changes (helper)
  const persistOpenAccordion = (vals: string[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vals));
    } catch (e) {
      // ignore
    }
  };

  // Use progress sync hook for automatic updates
  const { progress: userProgress, lastUpdate: _progressLastUpdate, refresh: refreshProgress, isLoading: progressIsLoading } = useProgressSync(userId);
  const [isRefreshingProgress, setIsRefreshingProgress] = useState(false);

  const triggerRefreshProgress = useCallback(() => {
    try {
      setIsRefreshingProgress(true);
      refreshProgress();
    } finally {
      setTimeout(() => setIsRefreshingProgress(false), 600);
    }
  }, [refreshProgress]);
  const { stats: _completionStats } = useCompletionStats(userId);

  const [showLevelUpNotification, setShowLevelUpNotification] = useState(false);
  const [newLevelAchieved, setNewLevelAchieved] = useState('');
  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [beginnerModules, setBeginnerModules] = useState<DetailedModule[]>([]);
  const [contentRefresh, setContentRefresh] = useState(0);

  // Intentionally reference unused prefixed variables to silence lint
  void _currentQuizAnswer;
  void _setCurrentQuizAnswer;
  void _showExpandedProgress;
  void _setShowExpandedProgress;
  void _showExpandedQuest;
  void _setShowExpandedQuest;
  void _progressLastUpdate;
  void _completionStats;
  void contentRefresh;

  // Ref to track quiz completion timeout for cleanup
  const quizTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Removed problematic useEffect that was calling onPointsRefresh on every progress update
  // This was causing infinite loop: progress update -> refresh points -> update userData -> re-render -> repeat
  // Points are now only refreshed after specific user actions (lesson/exercise/project completion)

  // Load modules from ContentManager and listen for updates
  const loadModules = useCallback(() => {
    const allModules = ContentManager.getAllModules();

    // Filter for published modules only, not deleted, and matching Beginner or Learner category
    const studentModules = allModules.filter(m =>
      (m.category === 'Beginner' || m.category === 'Learner') &&
      m.week >= 1 && m.week <= 8 &&
      ContentManager.isPublished(m.id) &&
      !(m as any).isDeleted
    );

    setBeginnerModules(studentModules);
  }, []);

  const handleContentUpdate = useCallback(() => {
    loadModules();
    setContentRefresh(prev => prev + 1);
  }, [loadModules]);

  useEffect(() => {
    loadModules();

    window.addEventListener('contentUpdated', handleContentUpdate);
    window.addEventListener('curriculumUpdated', handleContentUpdate);

    return () => {
      window.removeEventListener('contentUpdated', handleContentUpdate);
      window.removeEventListener('curriculumUpdated', handleContentUpdate);
    };
  }, [handleContentUpdate, loadModules]);

  // Handler to update accordion state and persist it
  const handleAccordionChange = (vals: string[]) => {
    setOpenAccordionItems(vals);
    persistOpenAccordion(vals);
  };

  // Reload progress when navigation data changes (returning from exercise/project)
  useEffect(() => {
    if (navigationData?.returnToModule) {
      triggerRefreshProgress();

      // Also reload weekly activity (using current week mode)
      const activity = ProgressManager.getWeeklyActivity(userId, true);
      setWeeklyActivity(activity);
    }
  }, [navigationData, userId, triggerRefreshProgress]);

  // Listen for global progress updates
  useEffect(() => {
    if (!userId) return;
    // Track last known completed modules to avoid showing popups on initial load
    const lastKnownCompletedRef = { current: ProgressManager.loadProgress(userId).completedModules || [] } as { current: string[] };

    const handleProgressUpdate = (event: CustomEvent) => {
      if (event.detail.userId === userId) {
        const newProgress = ProgressManager.loadProgress(userId);

        // Compare against last known completed modules (not the possibly-stale `userProgress` prop)
        const previouslyCompleted = lastKnownCompletedRef.current || [];
        const newlyCompleted = (newProgress.completedModules || []).filter(
          moduleId => !previouslyCompleted.includes(moduleId)
        );

        // Show XP rewards for newly completed modules (only those completed since last seen)
        if (newlyCompleted.length > 0) {
          newlyCompleted.forEach(moduleId => {
            const module = CurriculumManager.getAllModules().find(m => m.id === moduleId);
            const moduleTitle = module?.title || moduleId;
            const reward = XPSystem.getModuleReward(moduleTitle);

            setTimeout(() => {
              if (onXPEarned) onXPEarned(reward.amount, reward.title);
            }, 300);
          });

          const newLevel = shouldLevelUp(userLevel, newProgress);
          if (newLevel && onUserLevelUp) onUserLevelUp(newLevel);

          if (onPointsRefresh) setTimeout(() => onPointsRefresh(), 500);
        }

        // Update lastKnown to the latest so we don't re-show the same popups
        lastKnownCompletedRef.current = newProgress.completedModules || [];

        // Refresh progress from the sync hook and weekly activity
        triggerRefreshProgress();
        const activity = ProgressManager.getWeeklyActivity(userId, true);
        setWeeklyActivity(activity);
      }
    };

    window.addEventListener('progressUpdated', handleProgressUpdate as EventListener);

    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate as EventListener);
    };
  }, [userId, userProgress, userLevel, onXPEarned, onUserLevelUp, onPointsRefresh, triggerRefreshProgress]);

  // Load weekly activity data (using current calendar week)
  useEffect(() => {
    if (!userId) return;

    const loadWeeklyData = () => {
      const activity = ProgressManager.getWeeklyActivity(userId, true); // Use current week mode
      setWeeklyActivity(activity);
    };

    loadWeeklyData();

    // Refresh weekly data every minute to keep it current
    const refreshInterval = setInterval(loadWeeklyData, 60000);

    return () => clearInterval(refreshInterval);
  }, [userId]);

  // Track study time - update every minute while user is on Learning Hub
  useEffect(() => {
    if (!userId) return;

    // Track initial minute
    ProgressManager.updateStudyTime(userId, 1);

    // Set up interval to track time every minute
    const studyTimeInterval = setInterval(() => {
      ProgressManager.updateStudyTime(userId, 1);
    }, 60000); // Every 60 seconds

    return () => {
      clearInterval(studyTimeInterval);
    };
  }, [userId]);

  // Handle navigation data to return to specific module
  useEffect(() => {
    // Accept either `returnToModule` (legacy) or `moduleId` (current) and restore
    const targetModuleId = navigationData?.returnToModule || navigationData?.moduleId;
    if (targetModuleId) {
      const moduleToOpen = ContentManager.getAllModules().find(m => m.id === targetModuleId);
      if (moduleToOpen) {
        setSelectedEnhancedModule(moduleToOpen);

        // Restore active item if provided (lesson/exercise/project)
        try {
          const tab = navigationData?.activeTab as 'lessons' | 'exercises' | 'project' | undefined;
          if (tab) setLastActiveTab(tab);

          if (navigationData?.activeLessonId) {
            const lesson = (moduleToOpen as any).lessons?.find((l: any) => l.id === navigationData.activeLessonId);
            if (lesson) setActiveDetailedLesson(lesson as any);
          } else if (navigationData?.activeDetailedLessonId) {
            const lesson = (moduleToOpen as any).lessons?.find((l: any) => l.id === navigationData.activeDetailedLessonId);
            if (lesson) setActiveDetailedLesson(lesson as any);
          } else if (navigationData?.activeExerciseId) {
            const ex = (moduleToOpen as any).handsOnExercises?.find((e: any) => e.id === navigationData.activeExerciseId);
            if (ex) setActiveExercise(ex as any);
          } else if (navigationData?.activeProjectId) {
            const proj = (moduleToOpen as any).assessmentProject;
            if (proj && proj.id === navigationData.activeProjectId) setActiveProject(proj as any);
          }
        } catch (e) {
          // ignore any restore errors
        }

        // Clear navigation data in parent so we don't repeatedly re-open
        if (onNavigate) {
          setTimeout(() => onNavigate('learning', null), 100);
        }
      }
    }
  }, [navigationData, onNavigate]);

  // Function to load module with lesson completion state
  const loadModuleWithProgress = (module: Module): Module => {
    const raw = safeUserProgress?.moduleProgress?.[module.id] ?? null;

    // If no detailed progress or legacy numeric, return module as-is
    if (!raw || typeof raw === 'number') return module;

    // Normalize to detailed progress shape
    // Import helper locally to avoid circular import at top-level
    // (moduleProgressCompat is lightweight)
    const detailed = asDetailedModuleProgress(raw);

    const lessonsWithProgress = module.lessons.map(lesson => {
      const isCompleted = Array.isArray(detailed.completedLessons) ? detailed.completedLessons.includes(lesson.id) : Array.isArray((raw as any)?.completed_lessons) ? (raw as any).completed_lessons.includes(lesson.id) : false;
      return { ...lesson, completed: isCompleted };
    });

    return { ...module, lessons: lessonsWithProgress };
  };

  // Get unlocked modules based on user level and progress
  // Provide default progress if null
  const safeUserProgress = userProgress || { completedModules: [], moduleProgress: {} };
  const _unlockedModules = getUnlockedModules(userLevel, safeUserProgress);

  // Build modulesByCategory from ContentManager.getAllModules() to ensure we use the
  // consolidated visible curriculum (modules 1-8) and avoid mixing different data sources.
  const allVisibleModules = ContentManager.getAllModules().filter(m => m.week >= 1 && m.week <= 8 && ContentManager.isPublished(m.id) && !(m as any).isDeleted);
  const modulesByCategory: { [key: string]: any[] } = {
    'Beginner': allVisibleModules.filter(m => m.category === 'Beginner'),
    'Learner': allVisibleModules.filter(m => m.category === 'Learner'),
    'Advanced': allVisibleModules.filter(m => m.category === 'Advanced')
  };

  // Temporary debug logging to help diagnose click/lock issues for modules 7 & 8
  useEffect(() => {
    try {
      // Log the progress snapshot used by LearningHub
      // eslint-disable-next-line no-console
      console.log('DEBUG LearningHub safeUserProgress:', safeUserProgress);
      const mod78 = allVisibleModules.filter(m => m.week === 7 || m.week === 8).map(m => ({ id: m.id, week: m.week, requiredLevel: m.requiredLevel }));
      // eslint-disable-next-line no-console
      console.log('DEBUG LearningHub Modules 7/8:', mod78);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('DEBUG LearningHub logging failed', e);
    }
  }, [safeUserProgress, allVisibleModules, contentRefresh]);

  // Auto-expand newly-unlocked tracks when previous track becomes fully completed
  const prevBeginnerCompleteRef = useRef(false);
  const prevLearnerCompleteRef = useRef(false);

  useEffect(() => {
    try {
      const beginnerMods = modulesByCategory['Beginner'] || [];
      const learnerMods = modulesByCategory['Learner'] || [];

      const allBeginnerCompleted = beginnerMods.length > 0 && beginnerMods.every((mod: any) => {
        const progress = getNumericProgress(mod.id);
        const altId = mod.id.startsWith('module-') ? mod.id.replace('module-', 'beginner-module-') : mod.id;
        return (safeUserProgress?.completedModules || []).includes(mod.id) || (safeUserProgress?.completedModules || []).includes(altId) || progress === 100;
      });

      const allLearnerCompleted = learnerMods.length > 0 && learnerMods.every((mod: any) => {
        const progress = getNumericProgress(mod.id);
        const altId = mod.id.startsWith('module-') ? mod.id.replace('module-', 'learner-module-') : mod.id;
        return (safeUserProgress?.completedModules || []).includes(mod.id) || (safeUserProgress?.completedModules || []).includes(altId) || progress === 100;
      });

      // If beginner just became complete, auto-open Learner track (but allow manual collapse)
      if (allBeginnerCompleted && !openAccordionItems.includes('Learner') && !prevBeginnerCompleteRef.current) {
        const next = Array.from(new Set([...openAccordionItems, 'Learner']));
        setOpenAccordionItems(next);
        persistOpenAccordion(next);
      }

      // If learner just became complete, auto-open Advanced track
      if (allLearnerCompleted && !openAccordionItems.includes('Advanced') && !prevLearnerCompleteRef.current) {
        const next = Array.from(new Set([...openAccordionItems, 'Advanced']));
        setOpenAccordionItems(next);
        persistOpenAccordion(next);
      }

      prevBeginnerCompleteRef.current = allBeginnerCompleted;
      prevLearnerCompleteRef.current = allLearnerCompleted;
    } catch (e) {
      // ignore
    }
  }, [safeUserProgress, modulesByCategory, openAccordionItems]);
  void _unlockedModules;

  // Compute detailed progress for the visible curriculum (prevents double-counting
  // when the comprehensive beginner track and the main curriculum overlap).
  const computeVisibleDetailedProgress = (progress: any, visibleModules: any[]) => {
    let totalLessons = 0;
    let totalExercises = 0;
    let totalProjects = 0;
    let completedLessons = 0;
    let completedExercises = 0;
    let completedProjects = 0;

    visibleModules.forEach(mod => {
      const modProgress = progress?.moduleProgress?.[mod.id] ?? null;

      const lessonsCount = Array.isArray(mod.lessons) ? mod.lessons.length : 0;
      const exercisesCount = Array.isArray(mod.handsOnExercises) ? mod.handsOnExercises.length : 0;
      const projectsCount = mod.assessmentProject ? 1 : 0;

      totalLessons += lessonsCount;
      totalExercises += exercisesCount;
      totalProjects += projectsCount;

      // If module is in completedModules, count all items as completed
      const completedModulesArr = progress?.completedModules || [];
      const altId = mod.id.startsWith('module-') ? mod.id.replace('module-', 'beginner-module-') : mod.id.startsWith('beginner-module-') ? mod.id.replace('beginner-module-', 'module-') : mod.id;
      if (completedModulesArr.includes(mod.id) || completedModulesArr.includes(altId)) {
        completedLessons += lessonsCount;
        completedExercises += exercisesCount;
        completedProjects += projectsCount;
        return;
      }

      // If detailed progress object exists, count completed items
      if (modProgress && typeof modProgress === 'object') {
        completedLessons += (Array.isArray(modProgress.completedLessons) ? modProgress.completedLessons.length : 0);
        completedExercises += (Array.isArray(modProgress.completedExercises) ? modProgress.completedExercises.length : 0);
        completedProjects += (modProgress.projectCompleted ? 1 : 0);
      } else if (typeof modProgress === 'number' && modProgress === 100) {
        completedLessons += lessonsCount;
        completedExercises += exercisesCount;
        completedProjects += projectsCount;
      }
    });

    const totalItems = totalLessons + totalExercises + totalProjects;
    const completedItems = completedLessons + completedExercises + completedProjects;
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      percentage,
      completedItems,
      totalItems,
      breakdown: {
        lessons: { completed: completedLessons, total: totalLessons },
        exercises: { completed: completedExercises, total: totalExercises },
        projects: { completed: completedProjects, total: totalProjects }
      }
    };
  };

  // Check if user is new (has no progress)
  useEffect(() => {
    // Use prop value if provided, otherwise check if user is new based on level and points from ProgressContext
    const isNew = propIsNewUser !== undefined ? propIsNewUser : (userLevel === 'Beginner' && actualUserPoints === 0);
    setIsNewUser(isNew);
  }, [userLevel, actualUserPoints, propIsNewUser]);

  // Check if user can access a module based on their level and progress
  const _canAccessModule = (module: Module) => {
    return !module.locked;
  };
  void _canAccessModule;

  // Helper to get numeric progress from module progress (handles both number and object formats)
  const getNumericProgress = (moduleId: string): number => {
    // CRITICAL FIX: Check if module is in completedModules array first
    // If yes, always return 100 to ensure completed modules retain their 100% progress
    // Use optional chaining and safe defaults so missing progress objects won't throw
    if ((safeUserProgress?.completedModules?.includes(moduleId)) ?? false) {
      // If there's a detailed moduleProgress object for this module, prefer
      // computing the percentage from detailed items (lessons/exercises/project)
      // to avoid showing 100% when the completedModules flag may be stale.
      const rawProg = safeUserProgress?.moduleProgress?.[moduleId] ?? null;
      if (rawProg && typeof rawProg === 'object') {
        const allModules = ContentManager.getAllModules();
        let detailedModule = allModules.find(m => m.id === moduleId);
        if (!detailedModule && moduleId.startsWith('module-')) {
          const enhancedId = moduleId.replace('module-', 'beginner-module-');
          detailedModule = allModules.find(m => m.id === enhancedId);
        }
        if (detailedModule) {
          const lessonsCount = Array.isArray(detailedModule.lessons) ? detailedModule.lessons.length : 0;
          const exercisesCount = Array.isArray(detailedModule.handsOnExercises) ? detailedModule.handsOnExercises.length : 0;
          const projectsCount = detailedModule.assessmentProject ? 1 : 0;

          const totalItems = lessonsCount + exercisesCount + projectsCount;

          const completedLessonsCount = Array.isArray((rawProg as any)?.completedLessons) ? (rawProg as any).completedLessons.length : 0;
          const completedExercisesCount = Array.isArray((rawProg as any)?.completedExercises) ? (rawProg as any).completedExercises.length : 0;
          const completedProjectsCount = (rawProg as any)?.projectCompleted ? 1 : 0;

          const completedItems = completedLessonsCount + completedExercisesCount + completedProjectsCount;
          if (totalItems > 0) {
            const percentage = (completedItems / totalItems) * 100;
            return isFinite(percentage) ? Math.round(percentage) : 0;
          }
        }
      }

      return 100;
    }

    // Also check with alternative ID formats (beginner-module-X)
    if (moduleId.startsWith('module-')) {
      const enhancedId = moduleId.replace('module-', 'beginner-module-');
      if ((safeUserProgress?.completedModules?.includes(enhancedId)) ?? false) {
        return 100;
      }
    } else if (moduleId.startsWith('beginner-module-')) {
      const standardId = moduleId.replace('beginner-module-', 'module-');
      if ((safeUserProgress?.completedModules?.includes(standardId)) ?? false) {
        return 100;
      }
    }

    // Safely read module progress using optional chaining; default to null when missing
    let progress: any = safeUserProgress?.moduleProgress?.[moduleId] ?? null;

    // If not found, attempt a generic alternate id mapping (module- <-> beginner-module-)
    if (!progress) {
      const altId = moduleId.startsWith('module-') ? moduleId.replace('module-', 'beginner-module-') : moduleId.replace('beginner-module-', 'module-');
      progress = safeUserProgress?.moduleProgress?.[altId] ?? null;
    }

    if (typeof progress === 'number') {
      return progress;
    } else if (progress && typeof progress === 'object') {
      // Calculate progress from detailed progress object
      // Try to find in all curriculum modules
      const allModules = ContentManager.getAllModules();
      let detailedModule = allModules.find(m => m.id === moduleId);

      // If not found, try with the beginner-module or learner-module prefix
      if (!detailedModule && moduleId.startsWith('module-')) {
        const enhancedId = moduleId.replace('module-', 'beginner-module-');
        detailedModule = allModules.find(m => m.id === enhancedId);
      }
      if (!detailedModule && moduleId.startsWith('module-')) {
        const learnerId = moduleId.replace('module-', 'learner-module-');
        detailedModule = allModules.find(m => m.id === learnerId);
      }

      if (detailedModule) {
        const lessonsCount = Array.isArray(detailedModule.lessons) ? detailedModule.lessons.length : 0;
        const exercisesCount = Array.isArray(detailedModule.handsOnExercises) ? detailedModule.handsOnExercises.length : 0;
        const projectsCount = detailedModule.assessmentProject ? 1 : 0;

        const totalItems = lessonsCount + exercisesCount + projectsCount;

        const completedLessonsCount = Array.isArray(progress?.completedLessons) ? progress.completedLessons.length : 0;
        const completedExercisesCount = Array.isArray(progress?.completedExercises) ? progress.completedExercises.length : 0;
        const completedProjectsCount = progress?.projectCompleted ? 1 : 0;

        const completedItems = completedLessonsCount + completedExercisesCount + completedProjectsCount;

        // Prevent division by zero
        if (totalItems === 0) return 0;
        const percentage = (completedItems / totalItems) * 100;
        return isFinite(percentage) ? Math.round(percentage) : 0;
      }
    }
    return 0;
  };

  // Handle module completion
  const handleModuleComplete = (moduleId: string) => {
    ProgressManager.completeModule(userId, moduleId);
    triggerRefreshProgress();

    // Reload progress to get the updated state
    const updatedProgress = ProgressManager.loadProgress(userId);

    // Check if user should level up
    const newLevel = shouldLevelUp(userLevel, updatedProgress);
    if (newLevel && onUserLevelUp) {
      setNewLevelAchieved(newLevel);
      setShowLevelUpNotification(true);
      onUserLevelUp(newLevel);
    }

    // Get module title
    const module = allCurriculumModules.find(m => m.id === moduleId);
    const moduleTitle = module?.title || moduleId;

    // Show completion popup and notify parent
    const reward = XPSystem.getModuleReward(moduleTitle);

    // Notify parent to update points
    if (onXPEarned) {
      onXPEarned(reward.amount, reward.title);
    }

    // Refresh points from storage
    if (onPointsRefresh) {
      setTimeout(() => onPointsRefresh(), 500);
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleCompleteLesson = () => {
    if (activeLesson && selectedModule) {
      // Show lesson quiz before completion
      const quiz = generateLessonQuiz(activeLesson);
      setQuizQuestions(quiz);
      setShowLessonQuiz(true);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (quizTimeoutRef.current) {
        clearTimeout(quizTimeoutRef.current);
      }
    };
  }, []);

  const generateLessonQuiz = (lesson: Lesson) => {
    // Generate a simple quiz based on lesson content
    const quizzes = {
      'beginner': [
        {
          question: `What is the main concept covered in "${lesson.title}"?`,
          options: lesson.concepts,
          correct: 0,
          explanation: `The primary focus of this lesson is ${lesson.concepts[0]}.`
        }
      ],
      'intermediate': [
        {
          question: `Which programming principle is most important in "${lesson.title}"?`,
          options: lesson.concepts,
          correct: 0,
          explanation: `This lesson emphasizes ${lesson.concepts[0]} as a key programming principle.`
        }
      ],
      'advanced': [
        {
          question: `How would you apply the concepts from "${lesson.title}" in a real project?`,
          options: lesson.concepts,
          correct: 0,
          explanation: `The concepts from this lesson are best applied through ${lesson.concepts[0]}.`
        }
      ]
    };

    return quizzes[lesson.difficulty.toLowerCase()] || quizzes['easy'];
  };

  const handleQuizSubmit = async (answer: string) => {
    const currentQuestion = quizQuestions[0];
    if (!currentQuestion) return;
    const answerNum = parseInt(answer, 10);
    const isCorrect = !isNaN(answerNum) && answerNum === currentQuestion.correct;

    setQuizFeedback(isCorrect ? 'Correct! Well done!' : `Incorrect. ${currentQuestion.explanation}`);

    // Clear any existing timeout
    if (quizTimeoutRef.current) {
      clearTimeout(quizTimeoutRef.current);
    }

    quizTimeoutRef.current = setTimeout(async () => {
      setShowLessonQuiz(false);
      setQuizFeedback('');

      if (activeLesson && selectedModule) {
        // Calculate XP
        const reward = XPSystem.getLessonReward(activeLesson.title);
        const bonusXP = isCorrect ? 25 : 0;
        const totalXP = reward.amount + bonusXP;

        // Save navigation state so after an optional reload the app can restore
        try {
          sessionStorage.setItem('sb_post_reload_nav', JSON.stringify({ screen: 'learning', navigationData: { moduleId: selectedModule.id, activeLessonId: activeLesson.id, activeTab: 'lessons' } }));
        } catch (e) { /* ignore */ }

        // Mark lesson as completed and award XP via ProgressContext so server
        // `xp_transactions` and `user_progress.total_xp` are updated. Fall back
        // to ProgressSyncManager if the context call fails.
        try {
          await progressContext.completeLesson(selectedModule.id, activeLesson.id, totalXP);
        } catch (e) {
          console.warn('handleQuizSubmit: progressContext.completeLesson failed', e);
          // Fallback to local sync manager to at least record progress locally
          void ProgressSyncManager.completeLesson(userId, selectedModule.id, activeLesson.id, totalXP);
        }
        // Progress will auto-refresh via the sync hook
        triggerRefreshProgress();

        // Update the selected module state with completed lesson
        const updatedModule = {
          ...selectedModule,
          lessons: selectedModule.lessons.map(l =>
            l.id === activeLesson.id ? { ...l, completed: true } : l
          )
        };
        setSelectedModule(updatedModule);

        // Calculate module progress
        const completedLessons = updatedModule.lessons.filter(l => l.completed).length;
        const moduleProgress = updatedModule.lessons.length > 0 ? Math.round((completedLessons / updatedModule.lessons.length) * 100) : 0;

        // Check if all lessons are complete (module done)
        if (moduleProgress === 100) {
          handleModuleComplete(selectedModule.id);
        }

        // Show XP popup
        const xpTitle = `${reward.title}${bonusXP > 0 ? ' (+Quiz Bonus!)' : ''}`;
        if (onXPEarned) {
          onXPEarned(totalXP, xpTitle);
        }

        // Refresh points from storage
        if (onPointsRefresh) {
          setTimeout(() => onPointsRefresh(), 500);
        }

        setActiveLesson(null);
      }
    }, 2000);
  };

  const handleTakeAssessment = (moduleId: string) => {
    onNavigate('assessment', { moduleId });
  };

  const handleStartExercise = (exercise: Exercise) => {
    // Track that we're coming from the exercises tab
    setLastActiveTab('exercises');
    // Show ExerciseViewer component
    setActiveExercise(exercise);
    scrollToTop();
  };

  const handleStartProject = (project: Project) => {
    // Track that we're coming from the project tab
    setLastActiveTab('project');
    // Show ProjectViewer component
    setActiveProject(project);
    scrollToTop();
  };

  const handleExerciseComplete = async (code: string, isCorrect: boolean) => {
    if (!activeExercise || !userId || !selectedEnhancedModule || !isCorrect) return;

    // Save navigation state so after an optional reload the app can restore
    try {
      sessionStorage.setItem('sb_post_reload_nav', JSON.stringify({ screen: 'learning', navigationData: { moduleId: selectedEnhancedModule.id, activeExerciseId: activeExercise.id, activeTab: 'exercises' } }));
    } catch (e) { /* ignore */ }

    // Mark exercise as completed and award XP via ProgressContext so server
    // `xp_transactions` and `user_progress.total_xp` are updated.
    try {
      await progressContext.completeExercise(selectedEnhancedModule.id, activeExercise.id, code, activeExercise.points || 50);
    } catch (e) {
      console.warn('handleExerciseComplete: progressContext.completeExercise failed', e);
      // Fallback: still call sync manager so local state updates
      void ProgressSyncManager.completeExercise(userId, selectedEnhancedModule.id, activeExercise.id, activeExercise.points || 50, code);
    }

    // Fire immediate UI hook for popup (App also listens for xpAwarded)
    const xp = activeExercise.points || 50;
    if (onXPEarned) onXPEarned(xp, `Completed ${activeExercise.title}`);

    // Progress will auto-refresh via the sync hook
    triggerRefreshProgress();

    if (onPointsRefresh) {
      setTimeout(() => onPointsRefresh(), 500);
    }

    // Check if all exercises are completed and auto-navigate to project
    const safeProgress = userProgress || { completedModules: [], moduleProgress: {} };
    const moduleProgress = safeProgress?.moduleProgress?.[selectedEnhancedModule.id] ?? null;
    if (typeof moduleProgress === 'object') {
      const completedExercises = moduleProgress.completedExercises?.length || 0;
      const totalExercises = selectedEnhancedModule.handsOnExercises?.length || 0;

      if (completedExercises >= totalExercises && totalExercises > 0) {
        // All exercises completed - auto-navigate to project after a brief delay
        setTimeout(() => {
          setActiveExercise(null);
          setLastActiveTab('project'); // This will auto-open the project tab
          scrollToTop();
        }, 1500);
        return;
      }
    }

    // Go back to module view (practice tab)
    setTimeout(() => {
      setActiveExercise(null);
      setLastActiveTab('exercises'); // Return to practice tab
      scrollToTop();
    }, 1000);
  };

  const handleProjectSubmit = async (code: string) => {
    if (!activeProject || !userId || !selectedEnhancedModule) return;

    const projectKey = `${selectedEnhancedModule.id}_${activeProject.id}`;
    const previousSubmission = projectSubmissions[projectKey];

    // Parent trusts that `ProjectViewer` performed validation and only calls
    // this handler when the submission passed client-side validation.
    const isFirstSuccessfulSubmission = previousSubmission?.state !== 'submitted-successfully';

    // Store successful submission state
    setProjectSubmissions(prev => ({
      ...prev,
      [projectKey]: {
        state: 'submitted-successfully',
        lastCode: code,
        validationErrors: []
      }
    }));

    // Only award XP on first successful submission
    if (isFirstSuccessfulSubmission) {
      // Save navigation state so after an optional reload the app can restore
      try {
        sessionStorage.setItem('sb_post_reload_nav', JSON.stringify({ screen: 'learning', navigationData: { moduleId: selectedEnhancedModule.id, activeProjectId: activeProject.id, activeTab: 'project' } }));
      } catch (e) { /* ignore */ }

      // Mark project as completed and award XP via ProgressContext so server
      // `xp_transactions` and `user_progress.total_xp` are updated.
      try {
        await progressContext.completeProject(selectedEnhancedModule.id, activeProject.id, code, 0, activeProject.points || 100);
      } catch (e) {
        console.warn('handleProjectSubmit: progressContext.completeProject failed', e);
        void ProgressSyncManager.completeProject(userId, selectedEnhancedModule.id, activeProject.points || 100, code);
      }

      // Fire immediate UI hook for popup
      const xp = activeProject.points || 100;
      if (onXPEarned) onXPEarned(xp, `Completed ${activeProject.title}`);

      // Progress will auto-refresh via the sync hook
      triggerRefreshProgress();

      if (onPointsRefresh) {
        setTimeout(() => onPointsRefresh(), 500);
      }
    }

    // Go back to module view with success state
    setTimeout(() => {
      setActiveProject(null);
      scrollToTop();
    }, 1500);
  };

  // Helper function to get day name from date string
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };
  void getDayName;

  // Helper function to get today's day of week (0 = Sunday, 6 = Saturday)
  const getTodayDayOfWeek = (): number => {
    return new Date().getDay();
  };
  void getTodayDayOfWeek;

  // Helper function to format weekly data for display - shows current week (Monday to Sunday)
  const getWeeklyProgressData = () => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    // Get today's date in local timezone (YYYY-MM-DD)
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    // Map weeklyActivity directly to day names (it's already in Monday-Sunday order from ProgressManager)
    return dayNames.map((dayName, index) => {
      // Get activity data for this day from the weeklyActivity state
      const activityForDay = weeklyActivity[index];

      if (!activityForDay) {
        // Fallback for missing data
        return {
          day: dayName,
          progress: 0,
          isToday: false,
          isFuture: false,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          projectsCompleted: 0,
          totalActivities: 0
        };
      }

      // Check if this is today
      const isToday = activityForDay.date === todayString;

      // Check if this date is in the future (should show as no activity)
      // Parse the activity date properly in local timezone
      const [actYear, actMonth, actDay] = activityForDay.date.split('-').map(Number);
      const activityDate = new Date(actYear, actMonth - 1, actDay);
      const monthNum = parseInt(month, 10);
      const dayNum = parseInt(day, 10);
      const todayDate = new Date(year, (isNaN(monthNum) ? 1 : monthNum) - 1, isNaN(dayNum) ? 1 : dayNum);
      const isFuture = activityDate > todayDate;

      const totalActivities = !isFuture
        ? (activityForDay.lessonsCompleted + activityForDay.exercisesCompleted + activityForDay.projectsCompleted)
        : 0;

      // Calculate progress percentage (max 5 activities = 100%)
      const progress = isFuture ? 0 : Math.min((totalActivities / 5) * 100, 100);

      return {
        day: dayName,
        progress,
        isToday,
        isFuture,
        lessonsCompleted: activityForDay.lessonsCompleted || 0,
        exercisesCompleted: activityForDay.exercisesCompleted || 0,
        projectsCompleted: activityForDay.projectsCompleted || 0,
        totalActivities
      };
    });
  };

  // Calculate week totals from real data (only count past days, not future)
  const getWeekTotals = () => {
    const today = new Date();
    // Get today's date in local timezone
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const todayDate = new Date(year, month, day);

    // Only sum activities from days that are not in the future
    const pastActivities = weeklyActivity.filter(activity => {
      const [actYear, actMonth, actDay] = activity.date.split('-').map(Number);
      const activityDate = new Date(actYear, actMonth - 1, actDay);
      return activityDate <= todayDate;
    });

    const totalLessons = pastActivities.reduce((sum, day) => sum + (day.lessonsCompleted || 0), 0);
    const totalExercises = pastActivities.reduce((sum, day) => sum + (day.exercisesCompleted || 0), 0);
    const totalProjects = pastActivities.reduce((sum, day) => sum + (day.projectsCompleted || 0), 0);
    const totalMinutes = pastActivities.reduce((sum, day) => sum + (day.studyTimeMinutes || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return {
      totalLessons,
      totalExercises,
      totalProjects,
      totalActivities: totalLessons + totalExercises + totalProjects,
      totalHours
    };
  };

  // Check if user can proceed to next lesson (must complete previous ones)
  const canAccessLesson = (lesson: Lesson, moduleIndex: number, lessonIndex: number) => {
    if (lessonIndex === 0) return true; // First lesson is always accessible

    const selectedModuleLessons = selectedModule?.lessons || [];
    // Check if previous lesson is completed
    return selectedModuleLessons[lessonIndex - 1]?.completed || false;
  };

  // Helper function to check if an enhanced module is accessible (sequential unlocking)
  const canAccessEnhancedModule = (module: DetailedModule): boolean => {
    const moduleIndex = allCurriculumModules.findIndex(m => m.id === module.id);

    // First module is always accessible
    if (moduleIndex === 0) return true;

    // Check if previous module is completed
    const previousModule = allCurriculumModules[moduleIndex - 1];
    if (!previousModule) return false;

    const previousProgress = safeUserProgress?.moduleProgress?.[previousModule.id] ?? null;
    if (!previousProgress) return false;

    // Check if previous module has all content completed
    if (typeof previousProgress === 'object') {
      const totalLessons = previousModule.lessons?.length || 0;
      const totalExercises = previousModule.handsOnExercises?.length || 0;
      const hasProject = previousModule.assessmentProject !== undefined;

      const completedLessons = previousProgress.completedLessons?.length || 0;
      const completedExercises = previousProgress.completedExercises?.length || 0;
      const projectCompleted = previousProgress.projectCompleted || false;

      // All lessons and exercises must be completed, plus project if it exists
      return completedLessons === totalLessons &&
        completedExercises === totalExercises &&
        (!hasProject || projectCompleted);
    }

    return false;
  };
  void canAccessEnhancedModule;

  // Helper function to get real-time progress for an enhanced module
  const getEnhancedModuleProgress = (module: DetailedModule): number => {
    // CRITICAL FIX: Check if module is in completedModules array first
    // If yes, always return 100 to ensure completed modules retain their 100% progress
    if ((safeUserProgress?.completedModules || []).includes(module.id)) {
      return 100;
    }

    const moduleProgress = safeUserProgress?.moduleProgress?.[module.id] ?? null;

    if (!moduleProgress) return 0;

    if (typeof moduleProgress === 'object') {
      const totalLessons = module.lessons?.length || 0;
      const totalExercises = module.handsOnExercises?.length || 0;
      const hasProject = module.assessmentProject !== undefined;

      const completedLessons = moduleProgress.completedLessons?.length || 0;
      const completedExercises = moduleProgress.completedExercises?.length || 0;
      const projectCompleted = moduleProgress.projectCompleted ? 1 : 0;

      const totalItems = totalLessons + totalExercises + (hasProject ? 1 : 0);
      const completedItems = completedLessons + completedExercises + projectCompleted;

      // Division by zero protection - already handled but double-check
      if (totalItems === 0) return 0;
      const percentage = (completedItems / totalItems) * 100;
      return isFinite(percentage) ? Math.round(percentage) : 0;
    }

    return typeof moduleProgress === 'number' ? moduleProgress : 0;
  };
  void getEnhancedModuleProgress;

  // Exercise Viewer
  if (activeExercise) {
    const evProps: any = {
      exercise: (activeExercise as any),
      onBack: () => { setActiveExercise(null); scrollToTop(); },
      onComplete: handleExerciseComplete,
      userId,
      moduleId: selectedEnhancedModule?.id,
      progressIsLoading,
      isRefreshingProgress,
    };

    return (
      <ExerciseViewer {...(evProps as any)} />
    );
  }

  // Project Viewer
  if (activeProject) {
    const projectKey = `${selectedEnhancedModule?.id}_${activeProject.id}`;
    const submissionData = projectSubmissions[projectKey];

    // Check if project is completed in progress
    const moduleProgress = safeUserProgress?.moduleProgress?.[selectedEnhancedModule?.id || ''] ?? null;
    const isProjectCompleted = moduleProgress && typeof moduleProgress === 'object'
      ? moduleProgress.projectCompleted
      : false;

    return (
      <ProjectViewer
        project={activeProject}
        userId={userId}
        moduleId={selectedEnhancedModule?.id}
        submissionState={submissionData?.state || 'not-submitted'}
        lastSubmittedCode={submissionData?.lastCode || ''}
        isCompleted={isProjectCompleted || false}
        progressIsLoading={progressIsLoading}
        isRefreshingProgress={isRefreshingProgress}
        onBack={() => {
          setActiveProject(null);
          scrollToTop();
        }}
        onSubmit={handleProjectSubmit}
      />
    );
  }

  // Detailed Lesson View (from Enhanced Module)
  if (activeDetailedLesson && selectedEnhancedModule) {
    const moduleProgress = safeUserProgress?.moduleProgress?.[selectedEnhancedModule.id];
    const isCompleted = moduleProgress && typeof moduleProgress === 'object'
      ? moduleProgress.completedLessons?.includes(activeDetailedLesson.id)
      : false;

    return (
      <LessonView
        lesson={activeDetailedLesson}
        moduleTitle={selectedEnhancedModule.title}
        onBack={() => {
          setActiveDetailedLesson(null);
          scrollToTop();
        }}
        progressIsLoading={progressIsLoading}
        isRefreshingProgress={isRefreshingProgress}
        onComplete={async () => {
          // Calculate XP based on difficulty
          const xpEarned = activeDetailedLesson.difficulty === 'Easy' ? 50 :
            activeDetailedLesson.difficulty === 'Intermediate' ? 75 : 100;

          // Save navigation state so after an optional reload the app can restore
          try {
            sessionStorage.setItem('sb_post_reload_nav', JSON.stringify({ screen: 'learning', navigationData: { moduleId: selectedEnhancedModule.id, activeLessonId: activeDetailedLesson.id, activeTab: 'lessons' } }));
          } catch (e) { /* ignore */ }

          // Mark lesson as completed with XP using ProgressSyncManager
          try {
            await progressContext.completeLesson(selectedEnhancedModule.id, activeDetailedLesson.id, xpEarned);
          } catch (e) {
            console.warn('lesson completion fallback: progressContext.completeLesson failed', e);
            void ProgressSyncManager.completeLesson(userId, selectedEnhancedModule.id, activeDetailedLesson.id, xpEarned);
          }
          // Progress will auto-refresh via the sync hook
          triggerRefreshProgress();

          // Trigger parent XP popup
          if (onXPEarned) {
            onXPEarned(xpEarned, `Lesson Completed: ${activeDetailedLesson.title}`);
          }

          // Refresh user points in parent
          if (onPointsRefresh) {
            onPointsRefresh();
          }

          // Reload progress to check completion status
          const latestProgress = ProgressManager.loadProgress(userId);

          // Check if all lessons are completed and auto-navigate to exercises
          const moduleProgress = latestProgress?.moduleProgress?.[selectedEnhancedModule.id];
          if (typeof moduleProgress === 'object') {
            const completedLessons = moduleProgress.completedLessons?.length || 0;
            const totalLessons = selectedEnhancedModule.lessons.length;

            if (completedLessons >= totalLessons && selectedEnhancedModule.handsOnExercises && selectedEnhancedModule.handsOnExercises.length > 0) {
              // All lessons completed - auto-navigate to exercises after a brief delay
              setTimeout(() => {
                setActiveDetailedLesson(null);
                setLastActiveTab('exercises'); // This will auto-open the exercises tab
                scrollToTop();
              }, 1500);
              return;
            }
          }

          // Go back to module view (lessons tab) after a short delay
          setTimeout(() => {
            setActiveDetailedLesson(null);
            setLastActiveTab('lessons'); // Return to lessons tab
            scrollToTop();
          }, 2000);
        }}
        isCompleted={isCompleted}
      />
    );
  }

  // Enhanced module view for beginner track
  if (selectedEnhancedModule) {
    // Check if we have an active tab preference from navigation data, otherwise use lastActiveTab
    const preferredTab = (navigationData?.activeTab as 'lessons' | 'exercises' | 'project' | undefined) || lastActiveTab;

    return (
      <EnhancedLearningModule
        module={selectedEnhancedModule}
        onBack={() => {
          setSelectedEnhancedModule(null);
          setLastActiveTab('lessons'); // Reset to lessons when leaving module
          scrollToTop();
        }}
        onStartExercise={handleStartExercise}
        onStartProject={handleStartProject}
        onStartLesson={(detailedLesson) => {
          setLastActiveTab('lessons'); // Track that we're on lessons tab
          setActiveDetailedLesson(detailedLesson);
          scrollToTop();
        }}
        userProgress={(() => {
          const progress = safeUserProgress?.moduleProgress?.[selectedEnhancedModule.id] ?? null;
          if (progress && typeof progress === 'object') {
            return {
              completedLessons: progress.completedLessons || [],
              completedExercises: progress.completedExercises || [],
              projectCompleted: progress.projectCompleted || false
            };
          }
          return {
            completedLessons: [],
            completedExercises: [],
            projectCompleted: false
          };
        })()}
        initialTab={preferredTab}
        progressIsLoading={progressIsLoading}
        isRefreshingProgress={isRefreshingProgress}
      />
    );
  }

  if (activeLesson) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Lesson Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl">{activeLesson.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary">{activeLesson.duration}</Badge>
                <Badge variant="outline" className={
                  activeLesson.difficulty === 'Easy' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                    activeLesson.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                      'bg-red-500/10 text-red-600 border-red-500/20'
                }>
                  {activeLesson.difficulty}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">AI Assistant Active</span>
              </div>
              <Button variant="ghost" onClick={() => setActiveLesson(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Modules
              </Button>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Introduction */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <CardTitle>Introduction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="leading-relaxed text-lg">
                    Welcome to the {activeLesson.title} lesson! In this interactive session, you'll learn the fundamental concepts
                    and practical applications that will enhance your Java programming skills.
                  </p>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h4 className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span>Learning Objectives</span>
                    </h4>
                    <ul className="text-sm space-y-1 ml-6 list-disc">
                      <li>Understand the core concepts and syntax</li>
                      <li>Practice with hands-on coding examples</li>
                      <li>Apply knowledge through interactive exercises</li>
                      <li>Master best practices and common patterns</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <CardTitle>Lesson Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <p className="leading-relaxed">{activeLesson.description}</p>
                  </div>

                  {/* Key Concepts Section */}
                  <div className="space-y-3">
                    <h4 className="text-lg border-b pb-2">Key Concepts</h4>
                    <div className="grid gap-3">
                      {activeLesson.concepts.map((concept, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-primary font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{concept}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Click to explore this concept in detail
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practical Example */}
                  <div className="space-y-3">
                    <h4 className="text-lg border-b pb-2">Practical Example</h4>
                    <div className="bg-muted rounded-lg overflow-hidden">
                      <div className="bg-muted-foreground/10 px-4 py-2 border-b">
                        <span className="text-sm text-muted-foreground">Java Code Example</span>
                      </div>
                      <div className="p-4 font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre">
                          {activeLesson.id.includes('1-1') ?
                            `// What is Java? - Basic Program Structure
public class JavaIntroduction {
    public static void main(String[] args) {
        System.out.println("Welcome to Java Programming!");
        System.out.println("Java runs on the JVM (Java Virtual Machine)");
    }
}` :
                            activeLesson.id.includes('1-2') ?
                              `// Development Environment Setup
public class SetupExample {
    public static void main(String[] args) {
        System.out.println("Java Development Kit (JDK) installed!");
        System.out.println("IDE ready for programming!");
    }
}` :
                              activeLesson.id.includes('1-3') ?
                                `// Basic Syntax and Structure
public class BasicSyntax {
    // This is a single-line comment
    /* This is a 
       multi-line comment */
    public static void main(String[] args) {
        System.out.println("Understanding Java syntax!");
    }
}` :
                                activeLesson.id.includes('1-4') ?
                                  `// Data Types and Variables
public class DataTypesExample {
    public static void main(String[] args) {
        int age = 25;           // Integer
        double price = 99.99;   // Double
        String name = "Java";   // String
        boolean isActive = true; // Boolean
        
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
    }
}` :
                                  `// Example for: ${activeLesson.title}
public class Example {
    public static void main(String[] args) {
        System.out.println("Learning: ${activeLesson.title}");
        // Practice the concepts here
    }
}`}
                        </pre>
                      </div>
                    </div>

                    {/* Code Explanation */}
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
                      <h5 className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-primary dark:text-primary">Understanding the Code</span>
                      </h5>
                      <p className="text-sm leading-relaxed text-primary dark:text-primary mb-3">
                        This example demonstrates the key concepts covered in this lesson. Try modifying the code to practice what you've learned.
                      </p>
                      <div className="text-xs text-primary dark:text-primary">
                        <strong>Practice Tips:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Read through each line carefully</li>
                          <li>Try changing values and see what happens</li>
                          <li>Practice typing the code yourself</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Practice with NetBeans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span>Interactive Practice - NetBeans IDE</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/20 rounded-lg flex items-center justify-center">
                      <Code className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg mb-2">NetBeans IDE Environment</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Practice the concepts you've learned with our integrated NetBeans code editor.
                        Write, compile, and run Java code in a professional development environment.
                      </p>
                      <div className="bg-muted rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">NetBeans IDE</span>
                          <Badge variant="outline" className="text-xs">Professional</Badge>
                        </div>
                        <div className="bg-background rounded border p-3 text-xs font-mono text-left">
                          <div className="text-muted-foreground mb-1">// Practice Exercise: Create a simple Java program</div>
                          <div className="text-blue-600 dark:text-blue-400">public class</div>
                          <div className="ml-4 text-green-600 dark:text-green-400">MyFirstProgram</div>
                          <div className="text-blue-600 dark:text-blue-400"> {'{'}</div>
                          <div className="ml-4 text-purple-600 dark:text-purple-400">// Your code here</div>
                          <div className="text-blue-600 dark:text-blue-400">{'}'}</div>
                        </div>
                      </div>
                      <Button onClick={() => alert('NetBeans IDE integration would open here in a real implementation')}>
                        <Play className="w-4 h-4 mr-2" />
                        Open NetBeans Practice Environment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* AI Assistant */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span>AI Study Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm">
                      💡 <strong>Tip:</strong> Try to understand the logic behind each code example before moving on.
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm">
                      🤔 <strong>Did you know?</strong> Java is platform-independent because of the Java Virtual Machine (JVM).
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3">
                    <p className="text-sm">
                      🚀 <strong>Challenge:</strong> Try modifying the code examples to see different outputs!
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Ask AI a Question
                  </Button>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Reading Progress</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Practice Exercises</span>
                      <span>2/3</span>
                    </div>
                    <Progress value={67} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Code Understanding</span>
                      <span>90%</span>
                    </div>
                    <Progress value={90} />
                  </div>
                  <Button onClick={handleCompleteLesson} className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Lesson (+{activeLesson.difficulty === 'Easy' ? 50 : activeLesson.difficulty === 'Intermediate' ? 75 : 100} XP)
                  </Button>
                </CardContent>
              </Card>

              {/* Learning Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span>Study Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <p>Take notes while reading the explanations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <p>Practice typing the code examples yourself</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <p>Ask questions if something isn't clear</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Lesson Quiz Modal */}
        {showLessonQuiz && quizQuestions.length > 0 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Quick Knowledge Check</CardTitle>
                </div>
                <CardDescription>
                  Test your understanding of this lesson before moving on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">{quizQuestions[0].question}</h3>
                  <div className="space-y-2">
                    {quizQuestions[0].options.map((option: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start p-4 h-auto text-left"
                        onClick={() => handleQuizSubmit(index.toString())}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center mr-3">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {quizFeedback && (
                  <div className={`p-4 rounded-lg ${quizFeedback.includes('Correct')
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted border'
                    }`}>
                    <p className="text-sm">{quizFeedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {(progressIsLoading || isRefreshingProgress) && (
            <div className="mb-4 flex items-center text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Syncing progress...
            </div>
          )}
          {/* Module Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl">Module {selectedModule.week}: {selectedModule.title}</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{selectedModule.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {selectedModule.estimatedHours} hours
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">{getModuleProgress(selectedModule, safeUserProgress)}% Complete</Badge>
                <Badge variant="secondary" className="text-xs sm:text-sm">{selectedModule.lessons.length} lessons</Badge>
              </div>
            </div>
            <Button variant="ghost" onClick={() => {
              setSelectedModule(null);
              scrollToTop();
            }} className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Learning Hub</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Lessons List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Interactive Lessons</span>
                  </CardTitle>
                  <CardDescription>
                    Complete lessons in order to unlock the next ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedModule.lessons.map((lesson, index) => {
                      const canAccess = canAccessLesson(lesson, 0, index);
                      const isLocked = !canAccess;

                      return (
                        <div key={lesson.id} className={`flex items-center justify-between p-4 border rounded-lg transition-all ${isLocked ? 'opacity-50 bg-muted/30' : 'hover:bg-muted/50 hover:border-primary/50 cursor-pointer hover:shadow-md'
                          }`}
                          onClick={() => {
                            if (canAccess && !progressIsLoading && !isRefreshingProgress) {
                              handleStartLesson(lesson);
                              scrollToTop();
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lesson.completed
                              ? 'bg-primary text-primary-foreground'
                              : isLocked
                                ? 'bg-muted'
                                : 'bg-muted'
                              }`}>
                              {lesson.completed ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <span className="text-sm">{index + 1}</span>
                              )}
                            </div>
                            <div>
                              <h4 className={isLocked ? 'text-muted-foreground' : ''}>{lesson.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground flex-wrap">
                                <span>{lesson.duration}</span>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs" style={{
                                  backgroundColor: lesson.difficulty === 'Easy' ? 'rgb(34 197 94 / 0.1)' :
                                    lesson.difficulty === 'Intermediate' ? 'rgb(234 179 8 / 0.1)' :
                                      'rgb(239 68 68 / 0.1)',
                                  color: lesson.difficulty === 'Easy' ? 'rgb(34 197 94)' :
                                    lesson.difficulty === 'Intermediate' ? 'rgb(234 179 8)' :
                                      'rgb(239 68 68)',
                                  borderColor: lesson.difficulty === 'Easy' ? 'rgb(34 197 94 / 0.2)' :
                                    lesson.difficulty === 'Intermediate' ? 'rgb(234 179 8 / 0.2)' :
                                      'rgb(239 68 68 / 0.2)'
                                }}>
                                  {lesson.difficulty}
                                </Badge>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {lesson.difficulty === 'Easy' ? 50 : lesson.difficulty === 'Intermediate' ? 75 : 100} XP
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant={lesson.completed ? "outline" : "default"}
                            size="sm"
                            onClick={() => {
                              if (canAccess && !progressIsLoading && !isRefreshingProgress) {
                                handleStartLesson(lesson);
                                scrollToTop();
                              }
                            }}
                            disabled={isLocked || progressIsLoading || isRefreshingProgress}
                            className={!isLocked ? 'hover:scale-105 transition-transform' : ''}
                          >
                            {lesson.completed ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Review
                              </>
                            ) : isLocked ? (
                              <>
                                <Lock className="w-4 h-4 mr-1" />
                                Locked
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Start Lesson
                              </>
                            )}
                          </Button>
                        </div>
                      );
                    })}

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Module Progress & Assessment */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span>Module Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getModuleProgress(selectedModule, safeUserProgress)}%</div>
                    <Progress value={getModuleProgress(selectedModule, safeUserProgress)} className="mb-2" />
                    <p className="text-sm text-muted-foreground">Module completion</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl">{selectedModule.lessons.filter(l => l.completed).length}</div>
                      <p className="text-sm text-muted-foreground">Lessons Done</p>
                    </div>
                    <div>
                      <div className="text-xl">{selectedModule.estimatedHours}</div>
                      <p className="text-sm text-muted-foreground">Est. Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Learning Objectives</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedModule.objectives.map((objective, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Assessment</CardTitle>
                  <CardDescription>
                    Test your understanding and earn experience points
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-center">{selectedModule.assessment}</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleTakeAssessment(selectedModule.id)}
                    disabled={getModuleProgress(selectedModule, safeUserProgress) < 100}
                  >
                    {getModuleProgress(selectedModule, safeUserProgress) < 100 ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Complete Module First (100%)
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Take Assessment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Centered Welcome Banner */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          {isNewUser ? (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 max-w-md w-full">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 mb-2 sm:mb-3">
                  <StudyBuddyLogo size="2xl" variant="minimal" withBackground={false} />
                  <h2 className="text-base sm:text-lg">Welcome{username ? `, ${username}` : ''}!</h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Ready to start your Java journey?</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/15 via-accent/10 to-primary/5 max-w-md w-full">
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 mb-2 sm:mb-3">
                  <StudyBuddyLogo size="2xl" variant="minimal" animate={true} withBackground={false} />
                  <h2 className="text-base sm:text-lg">Welcome back{username ? `, ${username}` : ''}!</h2>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Continue your learning adventure</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2">Learning Hub</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Interactive Java Programming Adventures</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                Current Level: {userLevel}
              </Badge>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">

              </div>
            </div>
          </div>
        </div>

        {/* Learning Path - Categorized and Compressed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span>Your Learning Journey</span>
            </h2>
            {(() => {
              // Compute lesson totals from visible modules (weeks 1-8)
              const totalLessons = allVisibleModules.reduce((sum, m) => sum + ((m.lessons && m.lessons.length) || 0), 0);
              const completedLessons = allVisibleModules.reduce((sum, m) => {
                const prog = safeUserProgress?.moduleProgress?.[m.id];
                // If detailed object, count completedLessons
                if (prog && typeof prog === 'object') return sum + (prog.completedLessons?.length || 0);
                // If module is marked completed in completedModules or numeric 100, count all lessons
                const completedModulesArr = safeUserProgress?.completedModules || [];
                const altBeginnerId = m.id.startsWith('module-') ? m.id.replace('module-', 'beginner-module-') : m.id;
                if (completedModulesArr.includes(m.id) || completedModulesArr.includes(altBeginnerId)) return sum + ((m.lessons && m.lessons.length) || 0);
                if (typeof prog === 'number' && prog === 100) return sum + ((m.lessons && m.lessons.length) || 0);
                return sum;
              }, 0);

              return (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:space-x-3">
                  <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/30">
                    {completedLessons} / {totalLessons} lessons completed
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-accent/10 text-accent border-accent/30">
                    Level: {userLevel}
                  </Badge>
                </div>
              );
            })()}
          </div>

          {/* Progression Overview - Collapsed by default */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {userLevel === 'Beginner' && '🌱'}
                    {userLevel === 'Learner' && '🚀'}
                    {userLevel === 'Advanced' && '👑'}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="font-medium">{userLevel}</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📈</div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="font-medium">{computeVisibleDetailedProgress(safeUserProgress, allVisibleModules).percentage}%</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🎯</div>
                  <p className="text-sm text-muted-foreground">Next Module</p>
                  <p className="font-medium text-xs">
                    {(() => {
                      const nextModule = getNextAvailableModule(userLevel, safeUserProgress);
                      return nextModule ? `Module ${nextModule.week}` : 'All Done!';
                    })()}
                  </p>
                </div>
              </div>

              {/* Curriculum Breakdown */}

            </CardContent>
          </Card>

          {/* Module Categories with Collapsible Accordion */}
          <Accordion
            type="multiple"
            value={openAccordionItems}
            onValueChange={setOpenAccordionItems}
            className="space-y-4"
          >
            {Object.entries(modulesByCategory).map(([category, modules]) => {
              if (modules.length === 0) return null;

              const categoryIcon = category === 'Beginner' ? '🌱' : category === 'Learner' ? '🚀' : '👑';
              const categoryColor = category === 'Beginner' ? 'text-purple-600 dark:text-purple-400' :
                category === 'Learner' ? 'text-primary dark:text-primary' :
                  'text-accent dark:text-accent';

              // Track visibility based on completion
              // Beginner Track: Always visible
              // Learner Track: Only show when all Beginner modules are 100% complete
              // Advanced Track: Only show when all Learner modules are 100% complete
              let shouldShowTrack = false;

              if (category === 'Beginner') {
                // Beginner track is always visible
                shouldShowTrack = true;
              } else if (category === 'Learner') {
                // Show Learner track only if all Beginner modules are completed
                const beginnerModules = modulesByCategory['Beginner'] || [];
                const allBeginnerCompleted = beginnerModules.every((mod) => {
                  const progress = getNumericProgress(mod.id);
                  const enhancedModuleId = mod.id.startsWith('module-')
                    ? mod.id.replace('module-', 'beginner-module-')
                    : mod.id;
                  return safeUserProgress.completedModules.includes(mod.id) ||
                    safeUserProgress.completedModules.includes(enhancedModuleId) ||
                    progress === 100;
                });
                shouldShowTrack = allBeginnerCompleted;
              } else if (category === 'Advanced') {
                // Show Advanced track only if all Learner modules are completed
                const learnerModules = modulesByCategory['Learner'] || [];
                const allLearnerCompleted = learnerModules.every((mod) => {
                  const progress = getNumericProgress(mod.id);
                  return safeUserProgress.completedModules.includes(mod.id) || progress === 100;
                });
                shouldShowTrack = allLearnerCompleted;
              }

              // Don't render the track at all if user doesn't have access
              if (!shouldShowTrack) return null;

              const shouldShowModules = true;
              const displayModules = modules;
              void displayModules;

              // Calculate track progress
              const completedModulesInTrack = modules.filter(mod => {
                const progress = getNumericProgress(mod.id);
                const enhancedModuleId = mod.id.startsWith('module-')
                  ? mod.id.replace('module-', 'beginner-module-')
                  : mod.id;
                return safeUserProgress.completedModules.includes(mod.id) ||
                  safeUserProgress.completedModules.includes(enhancedModuleId) ||
                  progress === 100;
              }).length;

              return (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-2 border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 via-accent/5 to-transparent shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300"
                >
                  <AccordionTrigger className="hover:no-underline px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{categoryIcon}</div>
                        <h3 className={`text-xl ${categoryColor}`}>{category} Track</h3>
                        <Badge variant="outline" className="text-xs">
                          {completedModulesInTrack}/{modules.length} completed
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mr-2">
                        <Badge variant="secondary" className="text-xs">
                          {modules.length} modules
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {/* Show modules grid for all tracks */}
                    {shouldShowModules && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5 mt-4">
                        {modules.map((module, moduleIndex) => {
                          // Implement sequential module locking
                          // Module 1 is always accessible
                          // Module 2+ requires previous module to be completed
                          let canAccess = true;
                          if (moduleIndex > 0) {
                            const prevModule = modules[moduleIndex - 1];
                            const prevEnhancedModuleId = prevModule.id.startsWith('module-')
                              ? prevModule.id.replace('module-', 'beginner-module-')
                              : prevModule.id;
                            const prevProgress = getNumericProgress(prevModule.id);
                            const isPrevCompleted = safeUserProgress.completedModules.includes(prevModule.id) ||
                              safeUserProgress.completedModules.includes(prevEnhancedModuleId) ||
                              prevProgress === 100;
                            canAccess = isPrevCompleted;
                          }

                          const progress = getNumericProgress(module.id);

                          // Check if module is completed (check both regular and beginner-module IDs)
                          const enhancedModuleId = module.id.startsWith('module-')
                            ? module.id.replace('module-', 'beginner-module-')
                            : module.id;
                          const isCompleted = safeUserProgress.completedModules.includes(module.id) ||
                            safeUserProgress.completedModules.includes(enhancedModuleId) ||
                            progress === 100;

                          const isCurrentModule = safeUserProgress.currentModule === module.id ||
                            safeUserProgress.currentModule === enhancedModuleId;

                          // Find what's blocking this module if it's locked
                          let blockingReason = '';
                          if (!canAccess) {
                            if (module.requiredLevel !== userLevel) {
                              if (module.requiredLevel === 'Learner' && userLevel === 'Beginner') {
                                blockingReason = 'Complete all Beginner modules first';
                              } else if (module.requiredLevel === 'Advanced' && userLevel !== 'Advanced') {
                                blockingReason = 'Complete all Learner modules first';
                              } else {
                                blockingReason = `Requires ${module.requiredLevel} level`;
                              }
                            } else {
                              // Find previous module in same category
                              const modulesInCategory = javaCurriculum.filter(m => m.category === module.category);
                              const moduleIndex = modulesInCategory.findIndex(m => m.id === module.id);
                              if (moduleIndex > 0) {
                                const prevModule = modulesInCategory[moduleIndex - 1];
                                blockingReason = `Complete "${prevModule.title}" first`;
                              }
                            }
                          }

                          return (
                            <TooltipProvider key={module.id}>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger asChild>
                                  <Card
                                    className={`group compact-module ${canAccess ? 'unlocked-module' : 'locked-module'} relative border-2 shadow-md ${canAccess
                                      ? 'cursor-pointer hover:shadow-lg hover:border-primary/50 hover:scale-[1.02] transition-all duration-300 border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent'
                                      : 'opacity-50 cursor-not-allowed bg-muted/50 border-muted-foreground/20'
                                      } ${isCurrentModule ? 'border-primary/50 bg-primary/5' : ''} ${isCompleted ? 'border-primary/30 bg-primary/5 dark:bg-primary/10' : ''}`}
                                    onClick={() => {
                                      if (canAccess) {
                                        // Debug: log module click details
                                        try {
                                          // eslint-disable-next-line no-console
                                          console.log('DEBUG module click', { id: module.id, week: module.week, category: module.category, isCompleted, canAccess, completedModules: (safeUserProgress?.completedModules || []).slice(0, 50) });
                                        } catch (e) { /* ignore */ }
                                        // For any module in weeks 1-8, prefer the enhanced/detailed view when available
                                        if (module.week >= 1 && module.week <= 8) {
                                          const enhancedModule = allCurriculumModules.find(m => m.week === module.week);
                                          if (enhancedModule) {
                                            setSelectedEnhancedModule(enhancedModule);
                                          } else {
                                            setSelectedModule(loadModuleWithProgress(module));
                                          }
                                        } else {
                                          setSelectedModule(loadModuleWithProgress(module));
                                        }
                                        scrollToTop();
                                      }
                                    }}
                                  >
                                    <CardHeader className="pb-3 pt-4 px-5">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                                          {isCompleted ? (
                                            <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                          ) : canAccess ? (
                                            isCurrentModule ? (
                                              <Flame className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            ) : (
                                              <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            )
                                          ) : (
                                            <span className="text-base opacity-60 mt-0.5 flex-shrink-0">🔒</span>
                                          )}
                                          <div className="min-w-0 flex-1">
                                            <CardTitle className="text-sm leading-tight line-clamp-2">
                                              Module {module.week}: {module.title}
                                              {isCurrentModule && (
                                                <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                                              )}
                                              {isCompleted && (
                                                <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">Completed</Badge>
                                              )}
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-1 line-clamp-2">
                                              {module.description}
                                            </CardDescription>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-2.5">
                                          <Badge variant="outline" className="text-xs h-5 px-1.5">
                                            {module.estimatedHours}h
                                          </Badge>
                                          <Badge
                                            variant="secondary"
                                            className={`text-xs h-5 px-1.5 ${category === 'Beginner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                              category === 'Learner' ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary' :
                                                'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent'
                                              }`}
                                          >
                                            {category}
                                          </Badge>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="pt-3 pb-5 px-5 space-y-3.5">
                                      <div className="space-y-2.5">
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-muted-foreground font-medium">Progress</span>
                                          <span className="font-semibold text-foreground">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-muted/80 dark:bg-muted/60 rounded-full h-3 overflow-hidden border-2 border-border/40 dark:border-border/30 shadow-inner">
                                          <div
                                            className="h-full bg-gradient-to-r from-primary via-primary-light to-accent dark:from-primary dark:via-accent dark:to-primary-light rounded-full transition-all duration-700 ease-out shadow-lg relative"
                                            style={{
                                              width: `${Math.max(progress, progress > 0 ? 3 : 0)}%`,
                                              boxShadow: progress > 0
                                                ? '0 0 8px rgba(122, 66, 244, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.4)'
                                                : 'none'
                                            }}
                                          >
                                            {progress > 0 && (
                                              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 dark:via-white/10 dark:to-white/20 rounded-full" />
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between text-xs pt-1">
                                        <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                          <BookOpen className="w-3.5 h-3.5" />
                                          <span>{module.lessons.length} lessons</span>
                                        </span>
                                        {canAccess ? (
                                          <span className="text-primary font-semibold flex items-center gap-1">
                                            <span>{isCompleted ? 'Review' : 'Explore'}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                          </span>
                                        ) : (
                                          <div className="flex items-center gap-1 text-muted-foreground opacity-70 font-medium">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>Locked</span>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </TooltipTrigger>
                                {!canAccess && blockingReason && (
                                  <TooltipContent
                                    side="top"
                                    className="bg-card border-2 border-primary/30 text-card-foreground px-4 py-2.5 max-w-xs shadow-lg"
                                  >
                                    <div className="flex items-start gap-2">
                                      <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="font-medium text-sm mb-1">🔒 Module Locked</p>
                                        <p className="text-xs text-muted-foreground">{blockingReason}</p>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Learning Dashboard - Quest Progress and Weekly Progress (below Beginner Track) */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Quest Progress */}
            <Card className="no-hover-card border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Quest Progress</CardTitle>
                </div>
                <CardDescription>Module Progress Overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {allVisibleModules.slice(0, 8).map((module, index) => {
                  const progress = getNumericProgress(module.id);

                  // Use the visible modules list for locking/progression checks
                  const modulesList = allVisibleModules;
                  const isPreviousModuleComplete = index === 0 ? true : getNumericProgress(modulesList[index - 1].id) === 100;
                  const isLocked = !isPreviousModuleComplete;

                  return (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                          ) : progress === 100 ? (
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          ) : progress > 0 ? (
                            <Play className="w-4 h-4 text-accent flex-shrink-0" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className={`truncate text-xs ${isLocked ? 'text-muted-foreground/50' : ''}`}>
                            {module.title}
                          </span>
                        </div>
                        <span className={`text-xs ml-2 flex-shrink-0 ${isLocked ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                          {isLocked ? 'Locked' : `${progress}%`}
                        </span>
                      </div>
                      <Progress value={isLocked ? 0 : progress} className="h-4 shadow-lg border border-primary/20" showValue={false} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="no-hover-card border-primary/20 bg-gradient-to-br from-accent/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Weekly Progress</CardTitle>
                </div>
                <CardDescription>Your learning activity this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getWeeklyProgressData().map((dayData) => {
                  return (
                    <div key={dayData.day} className="flex items-center justify-between py-1">
                      <span className={`text-sm ${dayData.isToday ? 'text-primary font-medium' : dayData.isFuture ? 'text-muted-foreground' : ''}`}>
                        {dayData.day} {dayData.isToday && '(Today)'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {dayData.isFuture
                          ? '—'
                          : dayData.totalActivities > 0
                            ? `${dayData.lessonsCompleted} lesson${dayData.lessonsCompleted !== 1 ? 's' : ''}${dayData.exercisesCompleted > 0 ? ` • ${dayData.exercisesCompleted} exercise${dayData.exercisesCompleted !== 1 ? 's' : ''}` : ''}${dayData.projectsCompleted > 0 ? ` • ${dayData.projectsCompleted} project${dayData.projectsCompleted !== 1 ? 's' : ''}` : ''}`
                            : 'No activity'}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-3 mt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">This Week</span>
                    <span className="text-sm text-muted-foreground">{getWeekTotals().totalActivities > 0 ? `${getWeekTotals().totalActivities} activities` : '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Up Notification */}
          {showLevelUpNotification && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-full max-w-md mx-4 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="text-6xl animate-bounce">
                    {newLevelAchieved === 'Learner' && '🚀'}
                    {newLevelAchieved === 'Advanced' && '👑'}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl flex items-center justify-center space-x-2">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <span>Level Up!</span>
                      <Sparkles className="w-6 h-6 text-primary" />
                    </h3>
                    <p className="text-muted-foreground">
                      Congratulations! You've advanced to
                    </p>
                    <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-primary to-accent">
                      {newLevelAchieved} Level
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    New modules are now unlocked for you to explore!
                  </div>
                  <Button
                    onClick={() => setShowLevelUpNotification(false)}
                    className="w-full"
                  >
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}