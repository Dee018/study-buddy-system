import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StudyBuddyLogo } from './StudyBuddyLogo';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ProgressManager } from '../utils/progressManager';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProgressSyncManager from '../utils/progressSyncManager';
import { supabase } from '../utils/supabase/client';
import { calculateDetailedProgress } from '../data/javaCurriculum';
import ContentManager from '../utils/contentManager';
import { asDetailedModuleProgress } from '../utils/moduleProgressCompat';
import { allModules as allCurriculumModules } from '../data/comprehensiveBeginnerCurriculum';
import XPSystem from '../utils/xpSystem';
import { CacheManager } from '../utils/cacheManager';
import { useIsMobile } from '../utils/responsiveUtils';
import {
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Calendar,
  Trophy,
  Activity as ActivityIcon,
  Lightbulb,
  Brain,
  Flame,
  Award,
  CheckCircle2,
  Zap,
  TrendingDown,
  Sparkles,
  Timer
} from 'lucide-react';
import { useIsTablet } from '../utils/responsiveUtils';

interface ProgressTrackerProps {
  onNavigate: (screen: string) => void;
  isNewUser?: boolean;
}

export function ProgressTracker({ onNavigate, isNewUser = false }: ProgressTrackerProps) {
  const [userId, setUserId] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Force re-render on progress updates

  // Real-time data states
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [totalAssessments, setTotalAssessments] = useState(0);
  const [topicMasteryData, setTopicMasteryData] = useState<any[]>([]);
  const [topicSummary, setTopicSummary] = useState({
    mastered: 0,
    learning: 0,
    needsPractice: 0,
    total: 6
  });
  const [studyTimeData, setStudyTimeData] = useState<any[]>([]);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    weekActive: 0,
    monthActive: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [serverFetchDebug, setServerFetchDebug] = useState<{ lessons: number; exercises: number; projects: number; lastFetched?: string | null; error?: string | null }>({ lessons: 0, exercises: 0, projects: 0, lastFetched: null, error: null });

  // Enhanced analytics states
  const [learningPattern, setLearningPattern] = useState<any>(null);
  const [_detailedMetrics, setDetailedMetrics] = useState<any>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<any>(null);
  // Mark intentionally-unused detailed metrics state as used to silence lint
  void _detailedMetrics;

  // Responsive hooks
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  void isTablet;
  // detailed metrics state declared above; avoid duplicate declaration here

  const { user } = useAuth();
  const { isDark } = useTheme();

  // Immediate server-backed fetch for recent completions to ensure cross-session completions surface
  useEffect(() => {
    if (!user || !user.id) return;
    (async () => {
      try {
        const uid = user.id;
        const serverActs: any[] = [];

        // Include server-side title/xp/time columns when available for richer UI
        const { data: lessons } = await supabase
          .from('lesson_completions')
          .select('lesson_id,module_id,lesson_title,xp_earned,time_spent_minutes,created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(10);
        if (Array.isArray(lessons)) {
          for (const r of lessons) {
            const lesson = allCurriculumModules.flatMap(m => m.lessons || []).find((l: any) => l.id === r.lesson_id);
            const title = r.lesson_title || (lesson ? `Finished "${lesson.title}" lesson` : 'Finished a lesson');
            serverActs.push({ type: 'lesson', title, subtitle: new Date((r as any).created_at).toLocaleString(), points: (r as any).xp_earned || 50, time: (r as any).created_at, durationMinutes: (r as any).time_spent_minutes || 0, icon: 'bookOpen', color: 'blue' });
          }
        }

        const { data: exercises } = await supabase
          .from('exercise_completions')
          .select('exercise_id,module_id,exercise_title,xp_earned,time_spent_minutes,created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(10);
        if (Array.isArray(exercises)) {
          for (const r of exercises) {
            const ex = allCurriculumModules.flatMap(m => m.handsOnExercises || []).find((e: any) => e.id === r.exercise_id);
            const title = r.exercise_title || (ex ? `Completed exercise: ${ex.title}` : 'Completed exercise');
            serverActs.push({ type: 'exercise', title, subtitle: new Date((r as any).created_at).toLocaleString(), points: (r as any).xp_earned || 100, time: (r as any).created_at, durationMinutes: (r as any).time_spent_minutes || 0, icon: 'bookOpen', color: 'emerald' });
          }
        }

        const { data: projects } = await supabase
          .from('project_completions')
          .select('project_id,module_id,project_title,xp_earned,time_spent_minutes,created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(10);
        if (Array.isArray(projects)) {
          for (const r of projects) {
            const proj = allCurriculumModules.flatMap(m => m.assessmentProject ? [m.assessmentProject] : []).find((p: any) => p && p.id === r.project_id);
            const title = r.project_title || (proj ? `Finished project: ${proj.title}` : 'Finished project');
            serverActs.push({ type: 'project', title, subtitle: new Date((r as any).created_at).toLocaleString(), points: (r as any).xp_earned || 200, time: (r as any).created_at, durationMinutes: (r as any).time_spent_minutes || 0, icon: 'award', color: 'amber' });
          }
        }

        // Diagnostic: set server fetch debug info and local counts
        try {
          const local = ProgressSyncManager.getCachedProgress(uid) || ProgressManager.loadProgress(uid) as any;
          const moduleCount = Object.keys(local.moduleProgress || {}).length;
          const dailyCount = local.dailyActivity ? Object.keys(local.dailyActivity).length : 0;
          const lessonsAgg = (local as any).lessons_completed || 0;
          setServerFetchDebug({
            lessons: Array.isArray(lessons) ? lessons.length : 0,
            exercises: Array.isArray(exercises) ? exercises.length : 0,
            projects: Array.isArray(projects) ? projects.length : 0,
            lastFetched: new Date().toISOString(),
            error: null
          });
          console.log('[RecentActivity diag] serverCounts:', { lessons: Array.isArray(lessons) ? lessons.length : 0, exercises: Array.isArray(exercises) ? exercises.length : 0, projects: Array.isArray(projects) ? projects.length : 0, moduleCount, dailyCount, lessonsAgg });
        } catch (diagErr) {
          setServerFetchDebug(prev => ({ ...prev, error: String(diagErr), lastFetched: new Date().toISOString() }));
          console.log('[RecentActivity diag] unable to read local progress', diagErr);
        }

        if (serverActs.length > 0) {
          serverActs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
          setRecentActivity(serverActs.slice(0, 50));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [user?.id]);

  // Load all real data with caching
  const loadAllRealData = useCallback((uid: string) => {
    // Use cached data if available (5 minute TTL)
    const cacheKey = `progress_data_${uid}`;
    const cached = CacheManager.get<any>(cacheKey);

    if (cached) {
      // Use cached data
      setPerformanceData(cached.performanceData || []);
      setWeeklyActivityData(cached.weeklyActivityData || []);
      setCurrentStreak(cached.currentStreak || 0);
      setAverageScore(cached.averageScore || 0);
      setTotalAssessments(cached.totalAssessments || 0);
      setTopicMasteryData(cached.topicMasteryData || []);
      setTopicSummary(cached.topicSummary || { mastered: 0, learning: 0, needsPractice: 0, total: 6 });
      setStudyTimeData(cached.studyTimeData || []);
      setStreakData(cached.streakData || { currentStreak: 0, longestStreak: 0, weekActive: 0, monthActive: 0 });
      setRecentActivity(cached.recentActivity || []);
      setLearningPattern(cached.learningPattern || null);
      setDetailedMetrics(cached.detailedMetrics || null);
      setPredictiveInsights(cached.predictiveInsights || null);
    }

    // Load fresh data
    loadPerformanceTrend(uid);
    loadWeeklyActivity(uid);
    loadStreakData(uid);
    loadAssessmentStats(uid);
    loadTopicMastery(uid);
    loadStudyTimeDistribution(uid);
    loadStreakStatistics(uid);
    loadRecentActivityFeed(uid);
    loadEnhancedAnalytics(uid);
    // Intentionally using an empty dependency array because the loader calls
    // internal stable callbacks defined further below. Keeping this empty
    // prevents temporal-dead-zone issues during render.
  }, []);

  // Load user session and initialize real-time data
  useEffect(() => {
    if (user && user.id) {
      setUserId(user.id);
      loadAllRealData(user.id);
    }
  }, [user?.id, loadAllRealData]);

  // Listen for progress updates from other components
  // NOTE: global progress updates are handled by a single listener below

  // Load weekly activity data - ONLY SHOW REAL DATA, NO FUTURE DAYS
  const loadWeeklyActivity = useCallback((uid: string) => {
    const weeklyData = ProgressManager.getWeeklyActivity(uid);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const chartData = dayNames.map((dayName, index) => {
      // Find the activity for this day
      const dayActivity = weeklyData.find(activity => {
        const activityDate = new Date(activity.date);
        const dayOfWeek = activityDate.getDay();
        // Convert to Monday-first indexing
        const mondayFirstIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return mondayFirstIndex === index;
      });

      // Check if this day is in the past or today
      const dayDate = dayActivity ? new Date(dayActivity.date) : null;
      const isPastOrToday = dayDate && dayDate <= today;

      const completed = (dayActivity && isPastOrToday)
        ? dayActivity.lessonsCompleted + dayActivity.exercisesCompleted + dayActivity.projectsCompleted
        : 0;

      return {
        day: dayName,
        completed: completed,
        isPastOrToday: isPastOrToday || false // Flag for styling
      };
    });

    // Filter to only show days that are past or today with data
    const filteredData = chartData.filter(d => d.isPastOrToday && d.completed > 0);

    setWeeklyActivityData(filteredData.length > 0 ? filteredData : chartData.slice(0, 1)); // Show at least one day
  }, []);

  // Load performance trend (last 5 assessments)
  const loadPerformanceTrend = useCallback((uid: string) => {
    const trend = ProgressManager.getPerformanceTrend(uid, 5);

    // Format dates to show month and day
    const formattedData = trend.map(item => {
      const date = new Date(item.date);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${monthNames[date.getMonth()]} ${date.getDate()}`;

      return {
        ...item,
        displayDate: formattedDate
      };
    });

    setPerformanceData(formattedData);
  }, []);

  // Load streak data
  const loadStreakData = useCallback((uid: string) => {
    const current = ProgressManager.getCurrentStreak(uid);
    setCurrentStreak(current);
  }, []);

  // Load assessment statistics
  const loadAssessmentStats = useCallback((uid: string) => {
    const allActivity = ProgressManager.getAllDailyActivity(uid);
    const assessments = allActivity.reduce((sum, day) => sum + (day.assessmentsCompleted || 0), 0);
    const avgScore = ProgressManager.getAverageAssessmentScore(uid);

    setTotalAssessments(assessments);
    setAverageScore(avgScore);
  }, []);

  // Load topic mastery data based on user's actual progress
  const loadTopicMastery = useCallback((uid: string) => {
    try {
      const progress = ProgressManager.loadProgress(uid);

      // Define core Java topics aligned with curriculum
      const topics = [
        { name: 'Variables', key: 'variables', modules: ['beginner-module-1'] },
        { name: 'Data Types', key: 'dataTypes', modules: ['beginner-module-1', 'beginner-module-4'] },
        { name: 'Control Fl.', key: 'controlFlow', modules: ['beginner-module-2'] },
        { name: 'Methods', key: 'methods', modules: ['beginner-module-3'] },
        { name: 'Classes', key: 'classes', modules: ['beginner-module-1', 'beginner-module-3'] },
        { name: 'Inheritance', key: 'inheritance', modules: ['beginner-module-3', 'beginner-module-4'] }
      ];

      const topicScores = topics.map(topic => {
        // Calculate proficiency based on completed lessons/exercises in related modules
        let totalItems = 0;
        let completedItems = 0;

        topic.modules.forEach(moduleId => {
          const moduleProgress = progress.moduleProgress[moduleId];
          const detailed = asDetailedModuleProgress(moduleProgress);
          const module = allCurriculumModules.find(m => m.id === moduleId) as any;
          if (module) {
            // Count lessons
            totalItems += (module.lessons || []).length;
            completedItems += (detailed.completedLessons || []).length;

            // Count exercises (curriculum may use different field names)
            const exercisesList = module.handsOnExercises || module.exercises || module.handsOnActivities || [];
            totalItems += exercisesList.length;
            completedItems += (detailed.completedExercises || []).length;
          }
        });

        // Calculate percentage (0-100 scale for radar chart) - prevent division by zero
        let percentage = 0;
        if (totalItems > 0) {
          const calculated = (completedItems / totalItems) * 100;
          percentage = isFinite(calculated) ? Math.round(calculated) : 0;
        }

        return {
          topic: topic.name,
          proficiency: percentage,
          fullMark: 100
        };
      });

      setTopicMasteryData(topicScores);

      // Calculate summary statistics
      const mastered = topicScores.filter(t => t.proficiency >= 80).length;
      const learning = topicScores.filter(t => t.proficiency >= 50 && t.proficiency < 80).length;
      const needsPractice = topicScores.filter(t => t.proficiency < 50).length;

      setTopicSummary({
        mastered,
        learning,
        needsPractice,
        total: topics.length
      });

    } catch (error) {
      console.error('Error loading topic mastery:', error);
      setTopicMasteryData([]);
    }
  }, []);

  // Load study time distribution
  const loadStudyTimeDistribution = useCallback((uid: string) => {
    try {
      const progress = ProgressManager.loadProgress(uid);
      const allActivity = ProgressManager.getAllDailyActivity(uid);

      // Mark variables as used for lint purposes in complex calculations
      void progress;
      void allActivity;

      // Calculate totals
      let totalLessons = 0;
      let totalExercises = 0;
      let totalProjects = 0;
      let totalAssessments = 0;

      allActivity.forEach(day => {
        totalLessons += day.lessonsCompleted || 0;
        totalExercises += day.exercisesCompleted || 0;
        totalProjects += day.projectsCompleted || 0;
        totalAssessments += day.assessmentsCompleted || 0;
      });

      const total = totalLessons + totalExercises + totalProjects + totalAssessments;

      if (total > 0) {
        const distribution = [
          {
            name: 'Lessons',
            value: totalLessons,
            percentage: Math.round((totalLessons / total) * 100)
          },
          {
            name: 'Practice',
            value: totalExercises,
            percentage: Math.round((totalExercises / total) * 100)
          },
          {
            name: 'Assessments',
            value: totalAssessments,
            percentage: Math.round((totalAssessments / total) * 100)
          },
          {
            name: 'Review',
            value: totalProjects,
            percentage: Math.round((totalProjects / total) * 100)
          }
        ];

        setStudyTimeData(distribution);
      } else {
        setStudyTimeData([
          { name: 'Lessons', value: 0, percentage: 0 },
          { name: 'Practice', value: 0, percentage: 0 },
          { name: 'Assessments', value: 0, percentage: 0 },
          { name: 'Review', value: 0, percentage: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error loading study time distribution:', error);
      setStudyTimeData([]);
    }
  }, []);

  // Load streak statistics
  const loadStreakStatistics = useCallback((uid: string) => {
    try {
      const current = ProgressManager.getCurrentStreak(uid);
      const longest = ProgressManager.getLongestStreak(uid);

      // Calculate week and month activity
      const weeklyData = ProgressManager.getWeeklyActivity(uid);
      const allActivity = ProgressManager.getAllDailyActivity(uid);

      // ensure these are considered used by linter in complex derived calculations
      void weeklyData;
      void allActivity;

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);

      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);

      const weekActive = allActivity.filter((day: any) => {
        const dayDate = new Date((day as any).date || (day as any).activity_at || (day as any).activityAt);
        return dayDate >= weekAgo && ((day as any).lessonsCompleted > 0 || (day as any).exercisesCompleted > 0 || (day as any).projectsCompleted > 0);
      }).length;

      const monthActive = allActivity.filter((day: any) => {
        const dayDate = new Date((day as any).date || (day as any).activity_at || (day as any).activityAt);
        return dayDate >= monthAgo && ((day as any).lessonsCompleted > 0 || (day as any).exercisesCompleted > 0 || (day as any).projectsCompleted > 0);
      }).length;

      setStreakData({
        currentStreak: current,
        longestStreak: longest,
        weekActive,
        monthActive
      });
    } catch (error) {
      console.error('Error loading streak statistics:', error);
    }
  }, []);

  // Load recent activity feed from Supabase only
  const loadRecentActivityFeed = useCallback(async (uid: string) => {
    try {
      const serverActs: any[] = [];

      // Lessons
      const { data: lessons, error: lessonErr } = await supabase
        .from('lesson_completions')
        .select('lesson_id,module_id,lesson_title,xp_earned,time_spent_minutes,completed_at,created_at')
        .eq('user_id', uid)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (!lessonErr && Array.isArray(lessons)) {
        lessons.forEach((r: any) => {
          serverActs.push({
            type: 'lesson',
            title: r.lesson_title || `Finished a lesson`,
            subtitle: r.module_id || '',
            points: typeof r.xp_earned === 'number' ? r.xp_earned : 0,
            activity_at: r.completed_at || r.created_at,
            durationMinutes: r.time_spent_minutes || 0,
            icon: 'bookOpen',
            color: 'blue'
          });
        });
      }

      // Exercises
      const { data: exercises, error: exErr } = await supabase
        .from('exercise_completions')
        .select('exercise_id,module_id,exercise_title,xp_earned,time_spent_minutes,completed_at,created_at')
        .eq('user_id', uid)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (!exErr && Array.isArray(exercises)) {
        exercises.forEach((r: any) => {
          serverActs.push({
            type: 'exercise',
            title: r.exercise_title || `Completed exercise`,
            subtitle: r.module_id || '',
            points: typeof r.xp_earned === 'number' ? r.xp_earned : 0,
            activity_at: r.completed_at || r.created_at,
            durationMinutes: r.time_spent_minutes || 0,
            icon: 'bookOpen',
            color: 'emerald'
          });
        });
      }

      // Projects
      const { data: projects, error: projErr } = await supabase
        .from('project_completions')
        .select('project_id,module_id,project_title,xp_earned,time_spent_minutes,completed_at,created_at')
        .eq('user_id', uid)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (!projErr && Array.isArray(projects)) {
        projects.forEach((r: any) => {
          serverActs.push({
            type: 'project',
            title: r.project_title || `Finished project`,
            subtitle: r.module_id || '',
            points: typeof r.xp_earned === 'number' ? r.xp_earned : 0,
            activity_at: r.completed_at || r.created_at,
            durationMinutes: r.time_spent_minutes || 0,
            icon: 'award',
            color: 'amber'
          });
        });
      }

      // Sort by activity_at descending and limit
      serverActs.sort((a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime());
      setRecentActivity(serverActs.slice(0, 50));

      // Update debug state
      setServerFetchDebug({
        lessons: Array.isArray(lessons) ? lessons.length : 0,
        exercises: Array.isArray(exercises) ? exercises.length : 0,
        projects: Array.isArray(projects) ? projects.length : 0,
        lastFetched: new Date().toISOString(),
        error: (lessonErr || exErr || projErr) ? String(lessonErr || exErr || projErr) : null
      });
    } catch (error) {
      console.error('Error loading recent activity from server:', error);
      setRecentActivity([]);
      setServerFetchDebug(prev => ({ ...prev, error: String(error), lastFetched: new Date().toISOString() }));
    }
  }, []);

  // Load enhanced analytics - BASED ON REAL USER DATA ONLY
  const loadEnhancedAnalytics = useCallback((uid: string) => {
    try {
      const progress = ProgressManager.loadProgress(uid);
      const allActivity = ProgressManager.getAllDailyActivity(uid);

      // Calculate real learning patterns from actual activity
      if (allActivity.length > 0) {
        // Find peak study hours from actual timestamps
        const hourCounts = new Array(24).fill(0);
        allActivity.forEach((day: any) => {
          const hour = new Date((day as any).date || (day as any).activity_at || (day as any).activityAt).getHours();
          hourCounts[hour] += ((day as any).lessonsCompleted || 0) + ((day as any).exercisesCompleted || 0);
        });
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

        // Calculate average session from real data
        const totalSessions = allActivity.filter((d: any) => (d as any).lessonsCompleted > 0 || (d as any).exercisesCompleted > 0).length;
        const avgItems = totalSessions > 0 ?
          allActivity.reduce((sum: number, d: any) => sum + ((d as any).lessonsCompleted || 0) + ((d as any).exercisesCompleted || 0), 0) / totalSessions : 0;

        const realPatterns = {
          peakStudyHour: peakHour,
          averageSessionDuration: Math.round(avgItems * 15), // Estimate 15 min per item
          totalSessions: totalSessions,
          weeklyGoalCompletion: streakData.weekActive >= 4 ? 80 : (streakData.weekActive / 7) * 100
        };

        setLearningPattern(realPatterns);
      } else {
        setLearningPattern(null); // No data yet
      }

      // Calculate real detailed metrics locally (avoid relying on outer scoped detailedProgress)
      const totalLessons = allActivity.reduce((sum, d) => sum + (d.lessonsCompleted || 0), 0);
      const totalExercises = allActivity.reduce((sum, d) => sum + (d.exercisesCompleted || 0), 0);
      const totalProjects = allActivity.reduce((sum, d) => sum + (d.projectsCompleted || 0), 0);
      const totalAssessments = allActivity.reduce((sum, d) => sum + (d.assessmentsCompleted || 0), 0);
      // mark used for lint
      void totalAssessments;

      const rawProgress = calculateDetailedProgress(progress, allCurriculumModules);
      const localDetailedProgress = {
        overallPercentage: rawProgress.percentage,
        totalLessons: rawProgress.breakdown.lessons.total,
        totalExercises: rawProgress.breakdown.exercises.total
      };

      const realMetrics = {
        totalStudyTime: Math.round((totalLessons * 15 + totalExercises * 20 + totalProjects * 60) / 60), // hours
        averageDaily: allActivity.length > 0 ? Math.round((totalLessons + totalExercises + totalProjects) / allActivity.length * 10) / 10 : 0,
        completionRate: localDetailedProgress.overallPercentage || 0,
        strengthArea: topicMasteryData.length > 0 ? topicMasteryData.reduce((max, topic) => topic.proficiency > max.proficiency ? topic : max, topicMasteryData[0])?.topic : 'N/A'
      };

      setDetailedMetrics(realMetrics);

      // Only show predictive insights if we have enough real data
      if (totalLessons + totalExercises >= 10) {
        const avgScore = ProgressManager.getAverageAssessmentScore(uid);
        // mark used for lint
        void avgScore;
        const completionRate = localDetailedProgress.overallPercentage || 0;

        // Inline estimated completion calculation (avoid separate helper closure)
        let estimatedDate = null;
        if (completionRate > 0 && completionRate < 100 && allActivity.length >= 7) {
          const recentActivity = allActivity.slice(-14);
          const progressGained = recentActivity.reduce((sum, d) => sum + (d.lessonsCompleted || 0) + (d.exercisesCompleted || 0), 0);
          const avgDailyProgress = progressGained / recentActivity.length;
          if (avgDailyProgress > 0) {
            const remainingPercentage = 100 - completionRate;
            const totalItems = (localDetailedProgress.totalLessons || 0) + (localDetailedProgress.totalExercises || 0);
            const remainingItems = Math.round((remainingPercentage / 100) * totalItems);
            const daysNeeded = Math.ceil(remainingItems / avgDailyProgress);
            const ed = new Date();
            ed.setDate(ed.getDate() + daysNeeded);
            estimatedDate = ed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          }
        }

        const realInsights = {
          estimatedCompletionDate: estimatedDate,
          recommendedStudyTime: streakData.weekActive >= 3 ? 45 : 60,
          strengths: topicMasteryData.filter(t => t.proficiency >= 80).map(t => t.topic),
          areasToImprove: topicMasteryData.filter(t => t.proficiency < 60).map(t => t.topic)
        };

        setPredictiveInsights(realInsights);
      } else {
        setPredictiveInsights(null);
      }
    } catch (error) {
      console.error('Error loading enhanced analytics:', error);
      setLearningPattern(null);
      setDetailedMetrics(null);
      setPredictiveInsights(null);
    }
  }, [topicMasteryData, streakData.weekActive]);

  // Helper function to estimate completion based on actual pace
  const calculateEstimatedCompletion = (currentPercentage: number, activity: any[]) => {
    if (activity.length < 7) return null; // Need at least a week of data

    // Calculate average progress per day from last 2 weeks
    const recentActivity = activity.slice(-14);
    const progressGained = recentActivity.reduce((sum, d) =>
      sum + (d.lessonsCompleted || 0) + (d.exercisesCompleted || 0), 0);
    const avgDailyProgress = progressGained / recentActivity.length;

    if (avgDailyProgress === 0) return null;

    // Estimate remaining items
    const remainingPercentage = 100 - currentPercentage;
    const totalItems = (detailedProgress.totalLessons || 0) + (detailedProgress.totalExercises || 0);
    const remainingItems = Math.round((remainingPercentage / 100) * totalItems);
    const daysNeeded = Math.ceil(remainingItems / avgDailyProgress);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

    return estimatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // mark helper as used to avoid lint noise until it's wired into UI
  void calculateEstimatedCompletion;

  // Refresh data every minute to stay in sync
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      loadAllRealData(userId);
    }, 60000);

    return () => clearInterval(interval);
  }, [userId, loadAllRealData]);

  // Listen for global progress updates via ProgressSyncManager
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = ProgressSyncManager.subscribe((evt: any) => {
      try {
        if (evt && evt.userId === userId) {
          loadAllRealData(userId);
          setRefreshTrigger(prev => prev + 1);
        }
      } catch (e) { /* ignore */ }
    });

    return () => {
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch { }
    };
  }, [userId, loadAllRealData]);

  // Reference refreshTrigger so updates trigger re-render and avoid unused-var lint
  useEffect(() => {
    // no-op: refreshTrigger is intentionally read to cause re-render when bumped
  }, [refreshTrigger]);

  // Show welcome message for new users
  if (isNewUser) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mt-20">
            <div className="relative inline-block">
              <StudyBuddyLogo size="4xl" variant="minimal" className="mx-auto" animate={true} withBackground={false} />
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl">Welcome to Your Progress Journey! 🚀</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Start learning and completing lessons to unlock your personalized progress insights and analytics.
                Your journey to Java mastery begins here!
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => onNavigate('learning')} size="lg" className="px-8">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
              <Button onClick={() => onNavigate('chat')} variant="outline" size="lg" className="px-8">
                <Brain className="w-5 h-5 mr-2" />
                Get AI Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get authenticated user and progress data from Supabase-backed auth
  const { user: authUser } = useAuth();
  if (!authUser || !authUser.id) return null;

  const progress = ProgressSyncManager.getCachedProgress(authUser.id) || ProgressManager.loadProgress(authUser.id);
  const totalPoints = XPSystem.calculateTotalPoints(authUser.id);

  // Compute detailed progress based only on visible modules (weeks 1-8)
  const visibleModules = ContentManager.getAllModules().filter((m: any) => m.week >= 1 && m.week <= 8 && ContentManager.isPublished(m.id) && !(m as any).isDeleted);

  let totalLessons = 0;
  let totalLessonsCompleted = 0;
  let totalExercises = 0;
  let totalExercisesCompleted = 0;
  let totalProjects = 0;
  let totalProjectsCompleted = 0;

  const completedModulesArr = (progress?.completedModules) || [];

  visibleModules.forEach((m: any) => {
    const lessonsCount = (m.lessons && m.lessons.length) || 0;
    const exercisesCount = (m.handsOnExercises && m.handsOnExercises.length) || 0;
    const hasProject = m.assessmentProject ? 1 : 0;

    totalLessons += lessonsCount;
    totalExercises += exercisesCount;
    totalProjects += hasProject;

    const moduleProg = progress?.moduleProgress?.[m.id];
    const altBeginnerId = m.id.startsWith('module-') ? m.id.replace('module-', 'beginner-module-') : m.id;

    if (completedModulesArr.includes(m.id) || completedModulesArr.includes(altBeginnerId) || (typeof moduleProg === 'number' && moduleProg === 100)) {
      totalLessonsCompleted += lessonsCount;
      totalExercisesCompleted += exercisesCount;
      totalProjectsCompleted += hasProject;
    } else if (moduleProg && typeof moduleProg === 'object') {
      totalLessonsCompleted += (moduleProg.completedLessons?.length) || 0;
      totalExercisesCompleted += (moduleProg.completedExercises?.length) || 0;
      totalProjectsCompleted += moduleProg.projectCompleted ? 1 : 0;
    }
  });

  const itemsCompleted = totalLessonsCompleted + totalExercisesCompleted + totalProjectsCompleted;
  const itemsTotal = totalLessons + totalExercises + totalProjects;
  const overallPercentage = itemsTotal === 0 ? 0 : Math.round((itemsCompleted / itemsTotal) * 100);

  const detailedProgress = {
    overallPercentage,
    totalLessons,
    totalLessonsCompleted,
    totalExercises,
    totalExercisesCompleted,
    totalProjects,
    totalProjectsCompleted
  };

  // Helper to format activity timestamps
  const formatActivityTime = (time: any) => {
    try {
      if (!time) return 'Recently';
      const d = new Date(time);
      if (isNaN(d.getTime())) return String(time);
      return d.toLocaleString();
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <StudyBuddyLogo size={isMobile ? "xl" : "2xl"} variant="minimal" withBackground={false} />
            <div>
              <h1 className="text-xl md:text-2xl">Proficiency Tracker</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">Track your learning progress and performance analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3 w-full md:w-auto">
            <Button variant="outline" onClick={() => onNavigate('learning')} size={isMobile ? "sm" : "default"} className="flex-1 md:flex-initial">
              Continue Learning
            </Button>
          </div>
        </div>

        {/* Overall Learning Progress removed per UI request */}

        {/* Stats Cards removed per request */}

        {/* Tabs Section */}
        <Tabs defaultValue="performance" className="space-y-3 md:space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-card/50 dark:bg-card/30 p-1 rounded-xl border border-primary/20 gap-1">
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs md:text-sm"
            >
              {isMobile ? "Perf." : "Performance"}
            </TabsTrigger>
            <TabsTrigger
              value="topic"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs md:text-sm"
            >
              {isMobile ? "Topics" : "Topic Mastery"}
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs md:text-sm"
            >
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg text-xs md:text-sm"
            >
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Performance Trend Chart */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <TrendingUp className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Performance Trend</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">Your assessment scores over time</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {performanceData.length > 0 ? (
                    <div className="w-full" style={{ height: '320px' }}>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" className="dark:!stroke-[rgba(168,85,247,0.15)]" />
                          <XAxis
                            dataKey="displayDate"
                            stroke="#9ca3af"
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            className="dark:!stroke-[rgba(196,181,253,0.3)] dark:[&_text]:!fill-[rgba(196,181,253,0.6)]"
                          />
                          <YAxis
                            stroke="#9ca3af"
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            domain={[0, 100]}
                            className="dark:!stroke-[rgba(196,181,253,0.3)] dark:[&_text]:!fill-[rgba(196,181,253,0.6)]"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              color: '#1f2937'
                            }}
                            wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-[rgba(45,27,78,0.95)] dark:[&_.recharts-default-tooltip]:!bg-[rgba(45,27,78,0.95)] dark:[&_.recharts-default-tooltip]:!border-[rgba(168,85,247,0.3)] dark:[&_.recharts-tooltip-item]:!text-[rgba(243,232,255,1)]"
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#7c3aed"
                            strokeWidth={2.5}
                            dot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
                            name="Score %"
                            className="dark:!stroke-[rgba(196,181,253,1)] dark:[&_.recharts-dot]:!fill-[rgba(196,181,253,1)]"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[320px] flex items-center justify-center text-gray-400 dark:text-purple-200/60">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-gray-500 dark:text-purple-200/70">No assessment data yet</p>
                        <p className="text-sm text-gray-400 dark:text-purple-200/50">Complete assessments to see your performance trend</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weekly Learning Activity Chart */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <ActivityIcon className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Weekly Learning Activity</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">
                    Your actual learning activity this week
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-3 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-purple-600 dark:bg-purple-400"></div>
                      <span className="text-gray-600 dark:text-purple-200/80">Completed Activities</span>
                    </div>
                  </div>
                  <div className="w-full" style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" className="dark:!stroke-[rgba(168,85,247,0.15)]" />
                        <XAxis
                          dataKey="day"
                          stroke="#9ca3af"
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          axisLine={{ stroke: '#d1d5db' }}
                          className="dark:!stroke-[rgba(196,181,253,0.3)] dark:[&_text]:!fill-[rgba(196,181,253,0.6)] dark:[&_line]:!stroke-[rgba(168,85,247,0.2)]"
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 12, fill: '#9ca3af' }}
                          axisLine={{ stroke: '#d1d5db' }}
                          label={{
                            value: 'Items Completed',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: '#9ca3af', fontSize: 12 }
                          }}
                          className="dark:!stroke-[rgba(196,181,253,0.3)] dark:[&_text]:!fill-[rgba(196,181,253,0.6)] dark:[&_line]:!stroke-[rgba(168,85,247,0.2)] dark:[&_text.recharts-label]:!fill-[rgba(196,181,253,0.6)]"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            color: '#1f2937'
                          }}
                          wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-[rgba(45,27,78,0.95)] dark:[&_.recharts-default-tooltip]:!bg-[rgba(45,27,78,0.95)] dark:[&_.recharts-default-tooltip]:!border-[rgba(168,85,247,0.3)] dark:[&_.recharts-tooltip-item]:!text-[rgba(243,232,255,1)]"
                        />
                        <Bar
                          dataKey="completed"
                          fill="#7c3aed"
                          name="Items Completed"
                          radius={[8, 8, 0, 0]}
                          className="dark:!fill-[rgba(192,132,252,0.85)]"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-purple-500/15 flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-purple-200/60">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Based on your actual completed activities</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Topic Mastery Tab */}
          <TabsContent value="topic" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Detailed Topic Analysis - Takes 2 columns */}
              <Card className="lg:col-span-2 bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Target className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Detailed Topic Analysis</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">
                    Your proficiency breakdown by Java concepts
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {topicMasteryData.length > 0 ? (
                    <>
                      {/* Radar Chart */}
                      <div className="flex justify-center mb-6">
                        <div className="w-full" style={{ height: '280px' }}>
                          <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={topicMasteryData}>
                              <PolarGrid stroke="#d1d5db" className="dark:!stroke-[rgba(168,85,247,0.2)]" />
                              <PolarAngleAxis
                                dataKey="topic"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                stroke="#9ca3af"
                                className="dark:[&_text]:!fill-[rgba(196,181,253,0.8)] dark:!stroke-[rgba(168,85,247,0.3)]"
                              />
                              <PolarRadiusAxis
                                angle={90}
                                domain={[0, 100]}
                                tick={{ fill: '#9ca3af', fontSize: 10 }}
                                stroke="#d1d5db"
                                className="dark:[&_text]:!fill-[rgba(196,181,253,0.6)] dark:!stroke-[rgba(168,85,247,0.2)]"
                              />
                              <Radar
                                name="Proficiency"
                                dataKey="proficiency"
                                stroke="#7c3aed"
                                fill="#7c3aed"
                                fillOpacity={0.25}
                                strokeWidth={2}
                                className="dark:!stroke-[rgba(196,181,253,1)] dark:!fill-[rgba(196,181,253,0.3)]"
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Topic Progress Bars */}
                      <div className="space-y-3">
                        {topicMasteryData.map((topic, index) => {
                          const colors = [
                            { dot: 'bg-emerald-500 dark:bg-emerald-400', bar: 'bg-emerald-500 dark:bg-emerald-500' },
                            { dot: 'bg-emerald-500 dark:bg-emerald-400', bar: 'bg-emerald-500 dark:bg-emerald-500' },
                            { dot: 'bg-amber-500 dark:bg-amber-400', bar: 'bg-amber-500 dark:bg-amber-500' },
                            { dot: 'bg-amber-500 dark:bg-amber-400', bar: 'bg-amber-500 dark:bg-amber-500' },
                            { dot: 'bg-blue-500 dark:bg-blue-400', bar: 'bg-blue-500 dark:bg-blue-500' },
                            { dot: 'bg-purple-500 dark:bg-purple-400', bar: 'bg-purple-500 dark:bg-purple-500' }
                          ];
                          const color = colors[index] || colors[0];

                          return (
                            <div key={topic.topic} className="flex items-center gap-3">
                              <div className="flex items-center gap-2 w-32">
                                <div className={`w-2 h-2 rounded-full ${color.dot}`}></div>
                                <span className="text-sm text-gray-700 dark:text-purple-100">{topic.topic}</span>
                              </div>
                              <div className="flex-1 relative">
                                <div className="w-full bg-gray-200 dark:bg-purple-900/30 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className={`h-full ${color.bar} rounded-full transition-all duration-500`}
                                    style={{ width: `${topic.proficiency}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-12 text-right">
                                <span className="text-sm font-semibold text-white bg-purple-600 dark:text-purple-100 dark:bg-purple-800/60 px-2 py-0.5 rounded-full">
                                  {topic.proficiency}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-gray-400 dark:text-purple-200/60">
                      <div className="text-center">
                        <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-gray-500 dark:text-purple-200/70">No topic data yet</p>
                        <p className="text-sm text-gray-400 dark:text-purple-200/50">Complete lessons to see your topic mastery</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Topic Summary - Takes 1 column */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-900 dark:text-white">Topic Summary</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">
                    Quick overview of your performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {/* Mastered Topics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-purple-100">Mastered Topics</span>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {topicSummary.mastered}/{topicSummary.total}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-purple-900/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 dark:bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${(topicSummary.mastered / topicSummary.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Learning Topics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-purple-100">Learning Topics</span>
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        {topicSummary.learning}/{topicSummary.total}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-purple-900/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 dark:bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(topicSummary.learning / topicSummary.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Needs Practice */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-purple-100">Needs Practice</span>
                      <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                        {topicSummary.needsPractice}/{topicSummary.total}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 dark:bg-purple-900/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-rose-500 dark:bg-rose-500 rounded-full transition-all duration-500"
                          style={{ width: `${(topicSummary.needsPractice / topicSummary.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* View All Topics Button */}
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-purple-100 hover:bg-gray-50 dark:hover:bg-purple-500/20"
                      onClick={() => onNavigate('learning')}
                    >
                      View All Topics
                    </Button>
                  </div>

                  {/* Additional Learning Stats */}
                  <div className="pt-4 border-t border-gray-200 dark:border-purple-500/15 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-purple-200/60">Total Progress</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-purple-200">
                        {(() => {
                          const denominator = topicSummary.total * 100;
                          if (denominator === 0) return '0%';
                          const value = ((topicSummary.mastered * 100 + topicSummary.learning * 50) / denominator) * 100;
                          return `${Math.round(isFinite(value) ? value : 0)}%`;
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-purple-200/60">Topics Completed</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-purple-200">
                        {topicSummary.mastered}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-purple-200/60">In Progress</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-purple-200">
                        {topicSummary.learning}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Study Time Distribution */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Clock className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Study Time Distribution</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">
                    How you spend your learning time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {studyTimeData.length > 0 && studyTimeData.some(d => d.value > 0) ? (
                    <div className="flex items-center justify-center">
                      <div className="w-full" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={studyTimeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: any) => {
                                const percentage = (props as any).percentage;
                                const name = (props as any).name;
                                return percentage > 0 ? `${name} ${percentage}%` : '';
                              }}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {studyTimeData.map((entry, index) => {
                                const colors = ['#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
                                const darkColors = ['#a78bfa', '#c4b5fd', '#8b5cf6', '#7c3aed'];
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={isDark ? darkColors[index % darkColors.length] : colors[index % colors.length]}
                                  />
                                );
                              })}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                color: '#1f2937'
                              }}
                              wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:!bg-[rgba(45,27,78,0.95)] dark:[&_.recharts-default-tooltip]:!bg-[rgba(45,27,78,0.95)] dark:[&_.recharts-default-tooltip]:!border-[rgba(168,85,247,0.3)] dark:[&_.recharts-tooltip-item]:!text-[rgba(243,232,255,1)]"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 dark:text-purple-200/60">
                      <div className="text-center">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-gray-500 dark:text-purple-200/70">No activity data yet</p>
                        <p className="text-sm text-gray-400 dark:text-purple-200/50">Start learning to see your time distribution</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Streak */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                    <Calendar className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>Learning Streak</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">
                    Your consistency in learning
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-6">
                  {/* Current Streak Display */}
                  <div className="flex flex-col items-center justify-center py-6">
                    <Flame className="w-16 h-16 text-orange-500 dark:text-orange-400 mb-3" />
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
                      {streakData.currentStreak}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-purple-200/70">
                      Current streak (days)
                    </div>
                  </div>

                  {/* Streak Statistics */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-purple-500/15">
                      <span className="text-sm text-gray-700 dark:text-purple-100">Longest streak</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {streakData.longestStreak} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-purple-500/15">
                      <span className="text-sm text-gray-700 dark:text-purple-100">This week</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {streakData.weekActive}/7 days active
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700 dark:text-purple-100">This month</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {streakData.monthActive}/30 days active
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar for Month */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 dark:bg-purple-900/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 dark:bg-purple-400 rounded-full transition-all duration-500"
                        style={{ width: `${(streakData.monthActive / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
              <CardHeader className="pb-3 flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                </div>
                <div>
                  <Button size="sm" onClick={async () => {
                    try {
                      const uid = authUser?.id;
                      if (!uid) return;
                      await loadRecentActivityFeed(uid);
                    } catch (err) { /* ignore */ }
                  }}>Refresh</Button>
                </div>
              </CardHeader>
              <CardDescription className="text-gray-500 dark:text-purple-200/70 ml-3">
                Your latest learning achievements
              </CardDescription>
              <CardContent className="pt-0">
                {recentActivity.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {recentActivity.map((activity, index) => {
                      const iconMap: any = {
                        checkCircle: CheckCircle2,
                        bookOpen: BookOpen,
                        award: Award
                      };
                      const Icon = iconMap[activity.icon] || CheckCircle2;

                      const colorMap: any = {
                        emerald: 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
                        blue: 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
                        amber: 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                      };
                      const colorClass = colorMap[activity.color] || colorMap.emerald;

                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-purple-500/15 hover:bg-gray-50 dark:hover:bg-purple-500/5 transition-colors"
                        >
                          <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                            <Icon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activity.title}</div>
                                <div className="text-xs text-gray-500 dark:text-purple-200/60 mt-1 truncate">{activity.subtitle}</div>
                              </div>
                              <div className="ml-3 text-xs text-gray-400 dark:text-purple-200/60 text-right">
                                {formatActivityTime(activity.activity_at || activity.time)}
                              </div>
                            </div>

                            {activity.durationMinutes ? (
                              <div className="text-xs text-muted-foreground mt-2">{activity.durationMinutes}m • {activity.points || 0} XP</div>
                            ) : activity.points ? (
                              <div className="text-xs text-muted-foreground mt-2">+{activity.points} XP</div>
                            ) : null}
                          </div>

                          <div className="flex-shrink-0 flex flex-col items-end gap-2">
                            {activity.points ? (
                              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 border-0">
                                +{activity.points}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200 border-0">
                                {activity.badge || 'Badge'}
                              </Badge>
                            )}
                            <span className="text-[11px] text-gray-500 dark:text-purple-200/60">{activity.type ? activity.type.toUpperCase() : ''}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-purple-200/60">
                    <div className="text-center">
                      <ActivityIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-gray-500 dark:text-purple-200/70">No recent activity</p>
                      <p className="text-sm text-gray-400 dark:text-purple-200/50">Start learning to see your achievements</p>
                      {/* Debug summary to help diagnose missing activities */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        {(() => {
                          try {
                            const authUserId = (user && (user as any).id) || null;
                            if (!authUserId) return <span>Not signed in</span>;
                            const snap: any = ProgressSyncManager.getCachedProgress(authUserId) || ProgressManager.loadProgress(authUserId);
                            const moduleCount = Object.keys(snap.moduleProgress || {}).length;
                            const dailyCount = snap.dailyActivity ? Object.keys(snap.dailyActivity).length : 0;
                            const lessonsAgg = snap.lessons_completed || snap.lessonsCompleted || 0;
                            const exercisesAgg = snap.exercises_completed || snap.exercisesCompleted || 0;
                            const projectsAgg = snap.projects_completed || snap.projectsCompleted || 0;
                            return (
                              <div className="space-y-1">
                                <div>moduleProgress entries: <strong className="text-gray-700 dark:text-white">{moduleCount}</strong></div>
                                <div>dailyActivity days: <strong className="text-gray-700 dark:text-white">{dailyCount}</strong></div>
                                <div>aggregates: <strong className="text-gray-700 dark:text-white">{lessonsAgg} lessons, {exercisesAgg} exercises, {projectsAgg} projects</strong></div>
                                <div className="pt-2 border-t border-gray-100 dark:border-purple-500/10">
                                  <div className="text-[11px] text-gray-600 dark:text-purple-200/70">Server fetch:</div>
                                  <div className="text-[12px] text-gray-700 dark:text-white">lessons: {serverFetchDebug.lessons} • exercises: {serverFetchDebug.exercises} • projects: {serverFetchDebug.projects}</div>
                                  <div className="text-[11px] text-gray-500 dark:text-purple-200/60">last fetched: {serverFetchDebug.lastFetched || 'never'}</div>
                                  {serverFetchDebug.error && <div className="text-xs text-rose-400">Error: {serverFetchDebug.error}</div>}
                                </div>
                              </div>
                            );
                          } catch (e) {
                            return <span>Debug unavailable</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {/* Learning Patterns Card */}
              {learningPattern && (
                <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-base md:text-lg">
                      <Brain className="w-5 h-5 text-gray-700 dark:text-white" />
                      <span>Learning Patterns</span>
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-purple-200/70 text-xs md:text-sm">
                      Personalized insights based on your study behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                      {/* Peak Study Hour */}
                      <div className="text-center p-3 md:p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <Timer className="w-6 h-6 md:w-8 md:h-8 mx-auto text-primary mb-2" />
                        <div className="text-lg md:text-2xl text-gray-900 dark:text-white mb-1">
                          {learningPattern.peakStudyHour}:00
                        </div>
                        <div className="text-xs text-gray-500 dark:text-purple-200/60">
                          Peak Hour
                        </div>
                      </div>

                      {/* Average Session */}
                      <div className="text-center p-3 md:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Clock className="w-6 h-6 md:w-8 md:h-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-lg md:text-2xl text-gray-900 dark:text-white mb-1">
                          {learningPattern.averageSessionDuration}m
                        </div>
                        <div className="text-xs text-gray-500 dark:text-purple-200/60">
                          Avg Session
                        </div>
                      </div>

                      {/* Productivity */}
                      <div className="text-center p-3 md:p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Zap className="w-6 h-6 md:w-8 md:h-8 mx-auto text-green-500 mb-2" />
                        <div className="text-lg md:text-2xl text-gray-900 dark:text-white mb-1">
                          {learningPattern.productivityScore}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-purple-200/60">
                          Productivity
                        </div>
                      </div>

                      {/* Consistency */}
                      <div className="text-center p-3 md:p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Flame className="w-6 h-6 md:w-8 md:h-8 mx-auto text-orange-500 mb-2" />
                        <div className="text-lg md:text-2xl text-gray-900 dark:text-white mb-1">
                          {learningPattern.consistencyScore}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-purple-200/60">
                          Consistency
                        </div>
                      </div>
                    </div>

                    {/* Preferred Days */}
                    {learningPattern.preferredDays && learningPattern.preferredDays.length > 0 && (
                      <div className="p-3 md:p-4 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-sm text-gray-900 dark:text-white">
                            Most Active Days
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {learningPattern.preferredDays.map((day: string) => (
                            <Badge key={day} variant="secondary" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* AI-Powered Insights */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-base md:text-lg">
                    <Sparkles className="w-5 h-5 text-gray-700 dark:text-white" />
                    <span>AI Insights</span>
                  </CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70 text-xs md:text-sm">
                    Smart recommendations based on your progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 md:space-y-4">
                  {/* Strength Insight */}
                  <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Strong Performance
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-purple-100">
                          You're excelling in {topicMasteryData.filter(t => t.proficiency >= 80).length > 0
                            ? topicMasteryData.filter(t => t.proficiency >= 80).map(t => t.topic).join(', ')
                            : 'foundational concepts'}. Keep up the great work with consistent practice!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Improvement Area */}
                  {topicMasteryData.filter(t => t.proficiency < 50).length > 0 && (
                    <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Focus Area
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-purple-100">
                            Spend more time on {topicMasteryData.filter(t => t.proficiency < 50).map(t => t.topic).join(', ')}
                            to strengthen your foundation. We recommend 30 minutes daily practice.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Streak Motivation */}
                  {streakData.currentStreak > 0 && (
                    <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-500/20 bg-orange-50 dark:bg-orange-500/10">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            Streak Milestone
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-purple-100">
                            You're on a {streakData.currentStreak}-day streak!
                            {streakData.currentStreak >= 7
                              ? " Amazing consistency! You're building strong learning habits."
                              : " Keep it going to build momentum and retain knowledge better."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Study Pattern */}
                  <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Study Pattern Analysis
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-purple-100">
                          {studyTimeData.length > 0 && studyTimeData[0]?.percentage > 40
                            ? "You're spending good time on lessons. Balance it with more practice exercises to reinforce concepts."
                            : "Try to maintain a balanced study approach with lessons, practice, and assessments for optimal learning."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Recommended Next Steps
                        </h4>
                        <ul className="text-sm text-gray-600 dark:text-purple-100 space-y-1 mt-2 list-disc list-inside">
                          <li>Complete {detailedProgress.totalLessons - detailedProgress.totalLessonsCompleted} remaining lessons</li>
                          <li>Practice {detailedProgress.totalExercises - detailedProgress.totalExercisesCompleted} more exercises</li>
                          <li>Maintain your daily learning streak</li>
                          {averageScore < 80 && <li>Review topics where you scored below 80%</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 dark:text-white">Performance Summary</CardTitle>
                  <CardDescription className="text-gray-500 dark:text-purple-200/70">
                    Your overall progress metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-purple-500/10 border border-gray-200 dark:border-purple-500/15">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {detailedProgress.overallPercentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-purple-200/60">
                        Overall Progress
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-purple-500/10 border border-gray-200 dark:border-purple-500/15">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {averageScore}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-purple-200/60">
                        Avg Score
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-purple-500/10 border border-gray-200 dark:border-purple-500/15">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {totalAssessments}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-purple-200/60">
                        Assessments
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-purple-500/10 border border-gray-200 dark:border-purple-500/15">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {streakData.currentStreak}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-purple-200/60">
                        Day Streak
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Insights */}
              {predictiveInsights && (
                <Card className="bg-white dark:bg-[#2D1B4E]/80 border-gray-200 dark:border-purple-500/20 shadow-sm dark:shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white text-base md:text-lg">
                      <TrendingUp className="w-5 h-5 text-gray-700 dark:text-white" />
                      <span>Predictive Insights</span>
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-purple-200/70 text-xs md:text-sm">
                      AI-powered predictions and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3 md:space-y-4">
                    {/* Estimated Completion */}
                    <div className="p-3 md:p-4 rounded-lg border border-primary/20 bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h4 className="text-sm text-gray-900 dark:text-white">
                          Estimated Completion
                        </h4>
                      </div>
                      <p className="text-xl md:text-2xl text-gray-900 dark:text-white mb-1">
                        {new Date(predictiveInsights.estimatedCompletionDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-purple-100">
                        At your current pace, you'll complete the curriculum by this date
                      </p>
                    </div>

                    {/* Recommended Daily Time */}
                    <div className="p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-sm text-gray-900 dark:text-white">
                          Recommended Daily Study
                        </h4>
                      </div>
                      <p className="text-xl md:text-2xl text-gray-900 dark:text-white mb-1">
                        {predictiveInsights.recommendedStudyTime} minutes
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-purple-100">
                        Optimal study time based on your learning pattern
                      </p>
                    </div>

                    {/* Strengths */}
                    {predictiveInsights.strengths && predictiveInsights.strengths.length > 0 && (
                      <div className="p-3 md:p-4 rounded-lg border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="text-sm text-gray-900 dark:text-white">
                            Your Strengths
                          </h4>
                        </div>
                        <ul className="text-xs md:text-sm text-gray-600 dark:text-purple-100 space-y-1">
                          {predictiveInsights.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk Areas */}
                    {predictiveInsights.riskAreas && predictiveInsights.riskAreas.length > 0 && (
                      <div className="p-3 md:p-4 rounded-lg border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <h4 className="text-sm text-gray-900 dark:text-white">
                            Areas for Improvement
                          </h4>
                        </div>
                        <ul className="text-xs md:text-sm text-gray-600 dark:text-purple-100 space-y-1">
                          {predictiveInsights.riskAreas.map((area: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggestions */}
                    {predictiveInsights.suggestions && predictiveInsights.suggestions.length > 0 && (
                      <div className="p-3 md:p-4 rounded-lg border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="text-sm text-gray-900 dark:text-white">
                            Smart Suggestions
                          </h4>
                        </div>
                        <ul className="text-xs md:text-sm text-gray-600 dark:text-purple-100 space-y-2">
                          {predictiveInsights.suggestions.map((suggestion: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-600 dark:text-purple-400">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
}
