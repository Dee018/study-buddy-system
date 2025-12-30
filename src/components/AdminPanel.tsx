import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Switch } from './ui/switch';
import { AlertDialog, AlertDialogTrigger, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from './ui/alert-dialog';
import { toast } from 'sonner';

import { StudyBuddyLogo } from './StudyBuddyLogo';
import { EditModule } from './EditModule';
import { AdminProgressViewer } from './AdminProgressViewer';
import { AdminProgressMonitor } from './AdminProgressMonitor';
import { scrollToTop } from '../utils/scrollUtils';
import { AdminDataServiceAsync } from '../utils/adminDataService';
import { CurriculumManager } from '../utils/curriculumManager';
import ContentManager from '../utils/contentManager';
import { IssueReportManager } from '../utils/issueReportManager';
import { IssueReportManagerAsync } from '../utils/issueReportManager';
import { ProgressManager } from '../utils/progressManager';
// ProgressSyncManager not used in this file
import { PasswordManager } from '../utils/passwordManager';
import { DeletedUsersManager, DeletedUsersManagerAsync } from '../utils/deletedUsersManager';
import type { DeletedUserAccount } from '../utils/deletedUsersManager';
import { ProgressManagerAsync } from '../utils/progressManager';
import { withRetries } from '../utils/supabase/withRetries';
import { supabase } from '../utils/supabase/client';
// BackToTop not used here
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

  LineChart,
  Line
} from 'recharts';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Download,
  Shield,
  Activity,
  Target,
  BarChart3,
  Monitor,
  User,
  CheckCircle,
  Filter,
  Eye,
  LogOut,
  Clock,
  Award,
  ListChecks,
  FileText,
  GraduationCap,
  Sparkles,
  Flag,
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  Trash2,
  Edit2,

  ArrowUpDown,
  Code,
  Zap,
  Trophy,
  Upload,
  RefreshCw
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate: (screen: string) => void;
  onLogout?: () => void;
}

export function AdminPanel({ onNavigate: _onNavigate, onLogout }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contentCategoryFilter, setContentCategoryFilter] = useState<'All' | 'Beginner' | 'Learner' | 'Advanced'>('All');
  const [contentSearchTerm, setContentSearchTerm] = useState('');
  const [moduleSortBy, setModuleSortBy] = useState<'default' | 'title' | 'updated' | 'lessons'>('default');

  // Delete user modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ userId: string; username: string; daysInactive?: number } | null>(null);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [userToPermanentlyDelete, setUserToPermanentlyDelete] = useState<{ userId: string; username: string } | null>(null);

  // Edit module state
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [modulePublishStates, setModulePublishStates] = useState<Record<string, boolean>>({});

  // Progress viewer state
  const [viewingUserProgress, setViewingUserProgress] = useState<{ userId: string; username: string } | null>(null);

  // Track active tab to preserve navigation state
  const [activeTab, setActiveTab] = useState('users');

  // Track scroll position for content tab
  const [contentScrollPosition, setContentScrollPosition] = useState(0);

  // Track curriculum refresh to reload modules after edits
  const [curriculumRefresh, setCurriculumRefresh] = useState(0);

  // Track scroll positions for all tabs
  const scrollPositionsRef = useRef<Record<string, number>>({});
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Real-time data states (initialize to safe defaults; load async)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalModules: 0,
    totalLessons: 0,
    avgCompletionRate: 0,
    avgScore: 0,
    totalXPEarned: 0
  });
  const [, setUserActivityData] = useState<Array<any>>([]);
  const [, setModulePerformanceData] = useState<Array<any>>([]);
  const [allUsers, setAllUsers] = useState<Array<any>>([]);
  const [allSessions, setAllSessions] = useState<Array<any>>([]);
  const [systemAlerts, setSystemAlerts] = useState<Array<any>>([]);
  const [allReports, setAllReports] = useState<Array<any>>([]);
  const [reportStats, setReportStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, byType: { bug: 0, feature: 0, help: 0, feedback: 0 }, byPriority: { high: 0, medium: 0, low: 0 } });
  const [reportTypeFilter, setReportTypeFilter] = useState<'all' | 'bug' | 'feature' | 'help' | 'feedback'>('all');
  const [reportStatusFilter, setReportStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved' | 'closed'>('all');

  // Deleted users states
  const [deletedUsers, setDeletedUsers] = useState<DeletedUserAccount[]>([]);
  const [deletedUserStats, setDeletedUserStats] = useState({ total: 0, selfDeleted: 0, adminDeleted: 0, last30Days: 0 });
  const [showAllDeletedUsers, setShowAllDeletedUsers] = useState(false);
  // Cache of user IDs that have passwords to avoid calling async checker during render
  const [passwordProtectedSet, setPasswordProtectedSet] = useState<Set<string>>(new Set());
  const [supabaseReachable, setSupabaseReachable] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debug: log modal state changes to help trace why modal doesn't appear
  useEffect(() => {
    // Debug logging removed: modal state changes handled silently
  }, [showDeleteModal, userToDelete]);

  // Initialize module publish states from ContentManager
  useEffect(() => {
    const modules = ContentManager.getAllModules();
    const publishStates: Record<string, boolean> = {};
    modules.forEach(module => {
      publishStates[module.id] = ContentManager.isPublished(module.id);
    });
    setModulePublishStates(publishStates);
  }, [curriculumRefresh]);

  // Listen for curriculum updates
  useEffect(() => {
    const handleCurriculumUpdate = () => {
      setCurriculumRefresh(prev => prev + 1);
    };

    const handleContentUpdate = () => {
      setCurriculumRefresh(prev => prev + 1);
    };

    window.addEventListener('curriculumUpdated', handleCurriculumUpdate);
    window.addEventListener('contentUpdated', handleContentUpdate);

    return () => {
      window.removeEventListener('curriculumUpdated', handleCurriculumUpdate);
      window.removeEventListener('contentUpdated', handleContentUpdate);
    };
  }, []);

  // Refresh data periodically (async-safe with retries and fallback defaults)
  useEffect(() => {
    let mounted = true;

    const refreshData = async () => {
      setIsRefreshing(true);
      try {
        const stats = await withRetries(() => AdminDataServiceAsync.getStatsAsync(), { retries: 2 });
        const userActivity = await withRetries(() => AdminDataServiceAsync.getUserActivityAsync(), { retries: 2 });
        const modulePerf = await withRetries(() => AdminDataServiceAsync.getModulePerformanceAsync(), { retries: 2 });
        const users = await withRetries(() => AdminDataServiceAsync.getAllUsersAsync(), { retries: 2 });
        const sessions = await withRetries(() => AdminDataServiceAsync.getAllSessionsAsync(), { retries: 2 });
        const alerts = await withRetries(() => AdminDataServiceAsync.getSystemAlertsAsync(), { retries: 2 }).catch(() => []);
        const reports = await withRetries(() => IssueReportManagerAsync.getAllReportsAsync(), { retries: 2 });
        const statsReports = await withRetries(() => IssueReportManagerAsync.getStatisticsAsync(), { retries: 2 });
        const deleted = await withRetries(() => DeletedUsersManagerAsync.getAllDeletedUsersAsync(), { retries: 2 });
        const deletedStats = await withRetries(() => DeletedUsersManagerAsync.getStatisticsAsync(), { retries: 2 });

        if (!mounted) return;

        setAdminStats(stats ?? {
          totalUsers: 0,
          activeUsers: 0,
          totalModules: 0,
          totalLessons: 0,
          avgCompletionRate: 0,
          avgScore: 0,
          totalXPEarned: 0
        });
        setUserActivityData(userActivity ?? []);
        setModulePerformanceData(modulePerf ?? []);
        setAllUsers(users ?? []);
        setAllSessions(sessions ?? []);
        setSystemAlerts(alerts ?? []);
        setAllReports(reports ?? []);
        setReportStats(statsReports ?? { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, byType: { bug: 0, feature: 0, help: 0, feedback: 0 }, byPriority: { high: 0, medium: 0, low: 0 } });
        setDeletedUsers(deleted ?? []);
        setDeletedUserStats(deletedStats ?? { total: 0, selfDeleted: 0, adminDeleted: 0, last30Days: 0 });
      } catch (err) {
        console.error('Error refreshing admin panel data:', err);
      } finally {
        setIsRefreshing(false);
      }
    };

    // Run initial load once immediately
    refreshData();

    // Refresh every 10 seconds (start a polling interval)
    const interval = setInterval(() => { void refreshData(); }, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Build a cache of which users have passwords to avoid invoking async checks during render
  useEffect(() => {
    let mounted = true;

    const fetchPasswordFlags = async () => {
      try {
        if (!supabaseReachable) return;
        const checks = await Promise.all(allUsers.map(async (u) => {
          try {
            const has = await PasswordManager.hasPassword(u.userId).catch((e) => {
              // If network-level failure, mark Supabase unreachable to avoid spamming
              if (e && (String(e).includes('Failed to fetch') || String(e).includes('NetworkError'))) {
                setSupabaseReachable(false);
              }
              return false;
            });
            return { id: u.userId, has };
          } catch { return { id: u.userId, has: false }; }
        }));

        if (!mounted) return;
        const setIds = new Set<string>();
        checks.forEach(c => { if (c.has) setIds.add(c.id); });
        setPasswordProtectedSet(setIds);
      } catch (e) {
        // ignore
      }
    };

    void fetchPasswordFlags();

    return () => { mounted = false; };
  }, [allUsers]);

  // Handle scroll position preservation when switching tabs
  useEffect(() => {
    // Only scroll to top on first load
    if (isFirstLoad) {
      scrollToTop();
      setIsFirstLoad(false);
      return;
    }

    // Save current scroll position when changing tabs
    const saveScrollPosition = () => {
      scrollPositionsRef.current[activeTab] = window.scrollY;
    };

    // Restore scroll position for the new active tab
    const restoreScrollPosition = () => {
      const savedPosition = scrollPositionsRef.current[activeTab];
      if (savedPosition !== undefined) {
        window.scrollTo({ top: savedPosition, behavior: 'smooth' });
      }
    };

    saveScrollPosition();
    // Use setTimeout to ensure DOM is updated before restoring scroll
    const timeoutId = setTimeout(restoreScrollPosition, 50);

    return () => clearTimeout(timeoutId);
  }, [activeTab, isFirstLoad]);

  // Helper functions
  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'Beginner': return 'secondary';
      case 'Learner': return 'default';
      case 'Expert': return 'destructive';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Extract device from user agent
  const getDeviceType = (userAgent: string): string => {
    if (!userAgent) return 'Desktop';
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
    return 'Desktop';
  };

  // Calculate session analytics (excluding admin)
  const sessionAnalytics = {
    totalActiveSessions: allSessions.filter(s => s.status === 'active').length,
    averageSessionDuration: allSessions.length > 0 ? '2.4 hours' : '0h',
    multipleLoginAttempts: 0,
    sessionSecurity: 'High',
    deviceDistribution: (() => {
      // Filter out admin sessions for device distribution
      const nonAdminSessions = allSessions.filter(s => s.userId !== 'YCW-158-KA-4678');
      const devices = nonAdminSessions.map(s => getDeviceType(s.userAgent));
      const desktop = devices.filter(d => d === 'Desktop').length;
      const mobile = devices.filter(d => d === 'Mobile').length;
      const tablet = devices.filter(d => d === 'Tablet').length;
      const total = devices.length || 1;
      return [
        { device: 'Desktop', count: desktop, percentage: Math.round((desktop / total) * 100) },
        { device: 'Mobile', count: mobile, percentage: Math.round((mobile / total) * 100) },
        { device: 'Tablet', count: tablet, percentage: Math.round((tablet / total) * 100) }
      ];
    })()
  };

  // Calculate enhanced analytics from ProgressManager
  const enhancedAnalytics = (() => {
    try {
      const aggregateData = ProgressManager.getAggregateAnalytics();
      const allUsersWithProgress = ProgressManager.getAllUsers();

      // Calculate module completion rates
      const moduleCompletionRates: { [moduleId: string]: { completed: number; inProgress: number; notStarted: number } } = {};
      const allModules = ContentManager.getAllModules().filter(m => ContentManager.isPublished(m.id));

      allModules.forEach(module => {
        moduleCompletionRates[module.id] = { completed: 0, inProgress: 0, notStarted: 0 };
      });

      allUsersWithProgress.forEach(({ progress }) => {
        allModules.forEach(module => {
          const moduleProgress = progress.moduleProgress?.[module.id];
          if (progress.completedModules?.includes(module.id) || moduleProgress === 100) {
            moduleCompletionRates[module.id].completed++;
          } else if (moduleProgress && typeof moduleProgress === 'number' && moduleProgress > 0) {
            moduleCompletionRates[module.id].inProgress++;
          } else if (moduleProgress && typeof moduleProgress === 'object') {
            moduleCompletionRates[module.id].inProgress++;
          } else {
            moduleCompletionRates[module.id].notStarted++;
          }
        });
      });

      // Calculate daily activity trends (last 30 days)
      const dailyTrends: { date: string; activeUsers: number; completions: number; totalXP: number }[] = [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

      for (let i = 0; i < 30; i++) {
        const date = new Date(thirtyDaysAgo);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        let activeUsers = 0;
        let completions = 0;
        let totalXP = 0;

        allUsersWithProgress.forEach(({ progress }) => {
          const dailyActivity = (progress as any).dailyActivity?.[dateStr];
          if (dailyActivity) {
            activeUsers++;
            completions += (dailyActivity.lessonsCompleted || 0) + (dailyActivity.exercisesCompleted || 0) + (dailyActivity.projectsCompleted || 0);
            totalXP += dailyActivity.totalXP || 0;
          }
        });

        dailyTrends.push({ date: dateStr, activeUsers, completions, totalXP });
      }

      // Calculate top performers
      const topPerformers = allUsersWithProgress
        .map(({ userId, progress }) => {
          const completedModules = progress.completedModules?.length || 0;
          const totalXP = Object.values((progress as any).dailyActivity || {}).reduce((sum: number, day: any) => sum + (day.totalXP || 0), 0);
          const avgScore = ProgressManager.getAverageAssessmentScore(userId);
          const currentStreak = ProgressManager.getCurrentStreak(userId);

          return { userId, completedModules, totalXP, avgScore, currentStreak };
        })
        .filter((u: any) => (u.totalXP || 0) > 0 || (u.completedModules || 0) > 0)
        .sort((a: any, b: any) => (b.totalXP || 0) - (a.totalXP || 0))
        .slice(0, 10);

      return {
        ...aggregateData,
        moduleCompletionRates,
        dailyTrends,
        topPerformers
      };
    } catch (error) {
      console.error('Error calculating enhanced analytics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalCompletedModules: 0,
        averageProgress: 0,
        totalXP: 0,
        averageAssessmentScore: 0,
        totalStudyTime: 0,
        moduleCompletionRates: {},
        dailyTrends: [],
        topPerformers: []
      };
    }
  })();

  // Filter functions - Optimized with useMemo for better performance
  const filteredUsers = useMemo(() =>
    allUsers.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [allUsers, searchTerm]
  );

  const filteredSessions = useMemo(() =>
    allSessions.filter(session => {
      const device = getDeviceType(session.userAgent);
      const deviceMatch = deviceFilter === 'all' || device.toLowerCase() === deviceFilter.toLowerCase();
      const statusMatch = statusFilter === 'all' || session.status.toLowerCase() === statusFilter.toLowerCase();
      return deviceMatch && statusMatch;
    }),
    [allSessions, deviceFilter, statusFilter]
  );

  const displayedUsers = useMemo(() =>
    showAllUsers ? filteredUsers : filteredUsers.slice(0, 10),
    [filteredUsers, showAllUsers]
  );

  const displayedSessions = useMemo(() =>
    showAllSessions ? filteredSessions : filteredSessions.slice(0, 10),
    [filteredSessions, showAllSessions]
  );

  // Handle module operations
  const handleEditModule = (module: any) => {
    // Get the module with any saved edits applied from ContentManager (single source of truth)
    const moduleWithEdits = ContentManager.getModule(module.id);

    if (!moduleWithEdits) {
      console.error('Module not found:', module.id);
      return;
    }

    // Transform module for EditModule component (map handsOnExercises to exercises)
    const transformedModule = {
      ...moduleWithEdits,
      exercises: (moduleWithEdits as any).handsOnExercises || [],
      project: (moduleWithEdits as any).assessmentProject
    };

    // Capture current scroll position before entering edit mode so we can restore it when returning
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    setContentScrollPosition(scrollPosition);

    // Ensure we're on content tab
    setActiveTab('content');

    setEditingModule(transformedModule);
  };

  const handleSaveModule = async (updatedModule: any) => {
    try {
      await withRetries(() => Promise.resolve(CurriculumManager.saveModule(updatedModule.id, updatedModule)), { attempts: 3, timeoutMs: 3000 });
      setCurriculumRefresh(prev => prev + 1);
      // Module saved successfully (debug logging removed)
      try { toast?.success?.('Module saved'); } catch { }
    } catch (err) {
      console.error('Error saving module:', err);
      try { toast?.error?.('Failed to save module'); } catch { }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    const module = ContentManager.getModule(moduleId);
    if (!module) {
      try { toast?.error?.('Module not found'); } catch { }
      return;
    }

    if (confirm(`Are you sure you want to delete "${module.title}"? This action will hide the module from the Learning Hub.`)) {
      try {
        await withRetries(() => Promise.resolve(ContentManager.deleteModule(moduleId)), { attempts: 3, timeoutMs: 3000 });
        try { toast?.success?.('Module deleted successfully', { description: 'The module has been removed from the curriculum' }); } catch { }
        setCurriculumRefresh(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting module:', error);
        try { toast?.error?.('Failed to delete module', { description: 'Please try again or contact support' }); } catch { }
      }
    }
  };

  const handleTogglePublish = async (moduleId: string) => {
    const currentState = modulePublishStates[moduleId] ?? true;
    const newState = !currentState;

    try {
      await withRetries(() => Promise.resolve(ContentManager.setPublishStatus(moduleId, newState)), { attempts: 3, timeoutMs: 3000 });
      setModulePublishStates(prev => ({ ...prev, [moduleId]: newState }));
      const module = ContentManager.getModule(moduleId);
      try {
        toast?.success?.(newState ? 'Module published' : 'Module unpublished', {
          description: newState ? `"${module?.title}" is now visible to students` : `"${module?.title}" is now hidden from students`
        });
      } catch { }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      try { toast?.error?.('Failed to update publish status', { description: 'Please try again' }); } catch { }
    }
  };

  // Export curriculum data as JSON file
  const handleExportCurriculum = () => {
    try {
      const contentData = ContentManager.exportContent();
      const blob = new Blob([contentData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `java-study-buddy-curriculum-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Curriculum exported successfully', {
        description: 'Your curriculum data has been downloaded'
      });
    } catch (error) {
      console.error('Error exporting curriculum:', error);
      toast.error('Failed to export curriculum', {
        description: 'Please try again'
      });
    }
  };

  // Import curriculum data from JSON file
  const handleImportCurriculum = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;

          // Confirm before importing
          if (confirm('Import curriculum data? This will replace your current curriculum edits.')) {
            (async () => {
              try {
                await withRetries(() => Promise.resolve(ContentManager.importContent(jsonData)), { attempts: 3, timeoutMs: 4000 });
                try { toast?.success?.('Curriculum imported successfully', { description: 'All curriculum data has been restored' }); } catch { }
                setCurriculumRefresh(prev => prev + 1);
              } catch (err) {
                console.error('Error importing curriculum:', err);
                try { toast?.error?.('Failed to import curriculum'); } catch { }
              }
            })();
          }
        } catch (error) {
          console.error('Error importing curriculum:', error);
          try { toast?.error?.('Failed to import curriculum', { description: 'Invalid file format or corrupted data' }); } catch { }
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  // Clear all curriculum edits
  const handleClearEdits = async () => {
    if (confirm('Are you sure you want to clear all curriculum edits? This will reset all modules to their default state.')) {
      try {
        await withRetries(() => Promise.resolve(ContentManager.clearAllEdits()), { attempts: 3, timeoutMs: 4000 });
        try { toast?.success?.('All edits cleared', { description: 'Curriculum has been reset to default' }); } catch { }
        setCurriculumRefresh(prev => prev + 1);
      } catch (error) {
        console.error('Error clearing edits:', error);
        try { toast?.error?.('Failed to clear edits', { description: 'Please try again' }); } catch { }
      }
    }
  };



  // Get all modules with edits applied, filtering out deleted modules - Optimized with useMemo
  // `curriculumRefresh` is read inside the memo to intentionally force recomputation
  const allModulesWithEdits = useMemo(() => {
    // Read the refresh signal to ensure the memo updates when curriculum changes
    const _signal = curriculumRefresh;
    void _signal; // no-op usage

    return ContentManager.getAllModules().filter(module => !(module as any).isDeleted);
  }, [curriculumRefresh]);

  // Filter modules by category and search - Optimized with useMemo
  const filteredModules = useMemo(() => {
    return allModulesWithEdits.filter(module => {
      // Filter by category
      if (contentCategoryFilter !== 'All' && module.category !== contentCategoryFilter) {
        return false;
      }
      // Filter by search term
      if (contentSearchTerm) {
        const searchLower = contentSearchTerm.toLowerCase();
        const titleMatch = module.title.toLowerCase().includes(searchLower);
        const descriptionMatch = module.description.toLowerCase().includes(searchLower);
        const lessonMatch = module.lessons.some(l =>
          l.title.toLowerCase().includes(searchLower) ||
          l.description.toLowerCase().includes(searchLower)
        );
        return titleMatch || descriptionMatch || lessonMatch;
      }
      return true;
    });
  }, [allModulesWithEdits, contentCategoryFilter, contentSearchTerm]);

  // Sort modules - Optimized with useMemo
  const sortedModules = useMemo(() => {
    const sorted = [...filteredModules];
    switch (moduleSortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'updated':
        return sorted.reverse(); // Most recently updated first
      case 'lessons':
        return sorted.sort((a, b) => b.lessons.length - a.lessons.length);
      default:
        return sorted;
    }
  }, [filteredModules, moduleSortBy]);

  // Legacy helper for backward compatibility (now uses optimized memoized value)
  const getAllModulesWithEdits = () => allModulesWithEdits;

  // User deletion handlers
  const handleDeleteUser = (userId: string, username: string, daysInactive?: number) => {
    // Prevent deleting admin account
    if (userId === 'YCW-158-KA-4678') {
      toast.error('Cannot delete admin account', {
        description: 'The system administrator account cannot be deleted'
      });
      return;
    }

    // debug logging removed: handleDeleteUser invoked

    // Open the delete confirmation modal
    setUserToDelete({ userId, username, daysInactive });
    setShowDeleteModal(true);
  };

  // Perform deletion and return success boolean. Does NOT close the modal.
  const performDeleteUser = async (userId: string, username?: string): Promise<boolean> => {
    try {
      // Get user data before deletion
      const userProgress = ProgressManager.loadProgress(userId);
      const totalXP = Object.values((userProgress as any).dailyActivity || {})
        .reduce((sum: number, day: any) => sum + (day.totalXP || 0), 0);

      // Get last activity from sessions
      const userSessions = allSessions.filter(s => s.userId === userId);
      const lastActivity = userSessions.length > 0
        ? userSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0].startTime
        : undefined;

      // Calculate inactive days
      const daysInactive = lastActivity
        ? DeletedUsersManager.calculateInactiveDays(lastActivity)
        : 0;

      // Attempt to delete via Supabase Edge Function (service-role logic runs server-side)
      try {
        setDeleteError(null);
        // Build headers: prefer an admin-secret header if provided at build-time,
        // otherwise forward the current session JWT in Authorization header.
        // Vite exposes client env as import.meta.env; use VITE_ADMIN_SECRET if configured
        // NOTE: Do NOT store Supabase service-role key in client env.
        // If an admin secret is provided at build time, it will be included here.
        const adminSecret = (import.meta as any).env?.VITE_ADMIN_SECRET;
        if (!adminSecret) {
          const msg = 'Missing admin secret (VITE_ADMIN_SECRET) in client build. Cannot call admin function.';
          setDeleteError(msg);
          try { toast.error('Failed to delete user', { description: msg }); } catch { }
          return false;
        }
        // Prepare headers (single declaration so we don't re-declare `headers`)
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        headers['x-admin-secret'] = String(adminSecret);

        // Include the public anon key as Authorization when available so the
        // Supabase functions gateway accepts the proxied request (dev proxy
        // and gateway often require a Bearer token). This only uses the
        // anon/public key, never a service-role key.
        const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANONKEY || '';
        if (anonKey) {
          headers['Authorization'] = `Bearer ${String(anonKey)}`;
          // anon Authorization header included (silent)
        }

        // Call the hosted Supabase Edge Function endpoint at the project's URL
        // The function is responsible for using the service role to remove the
        // Auth user and related DB rows; client must not attempt admin auth ops.
        // Use dev proxy during local development to avoid CORS issues.
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
        const functionUrl = (import.meta.env.DEV && typeof window !== 'undefined')
          ? '/functions/v1/admin-delete-user' // use soft-delete function in dev
          : `${supabaseUrl.replace(/\/$/, '')}/functions/v1/admin-delete-user`;

        // calling hosted delete function at functionUrl (silent)

        const resp = await fetch(functionUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId }),
        });

        let json: any = null;
        try {
          json = await resp.json();
        } catch (e) {
          // if body isn't JSON, leave json as null
        }

        if (!resp.ok) {
          const text = json || await resp.text().catch(() => null);
          console.error('Edge function failed:', text);
        } else {
          // Edge function returned success (silent)
        }

        if (!resp.ok) {
          const serverMsg = json?.step ? `${json.step}: ${json.error}` : (json?.error || json?.details || (await resp.text().catch(() => 'server error')));
          // surface server error to UI (keep modal open)
          setDeleteError(String(serverMsg));
          try { toast.error('Failed to delete user', { description: String(serverMsg) }); } catch { }
          throw new Error(`Function deletion failed (status ${resp.status}): ${serverMsg}`);
        }

        if (!json || json.ok !== true) {
          const serverMsg = json?.step ? `${json.step}: ${json.error}` : (json?.error || json?.details || 'deletion did not return ok');
          setDeleteError(String(serverMsg));
          try { toast.error('Failed to delete user', { description: String(serverMsg) }); } catch { }
          return false;
        }

        // Success — remove user from local UI only after confirmed ok:true (silent)
        setAllUsers(prev => (prev || []).filter(u => u.userId !== userId));

        // Refresh deleted-users view/stats
        try {
          const refreshedDeleted = await DeletedUsersManagerAsync.getAllDeletedUsersAsync();
          setDeletedUsers(refreshedDeleted);
          const refreshedDeletedStats = await DeletedUsersManagerAsync.getStatisticsAsync();
          setDeletedUserStats(refreshedDeletedStats);
        } catch (err) { console.error('Failed to refresh deleted users', err); }

        // Clear local progress/password state
        await ProgressManagerAsync.clearProgressAsync(userId);
        PasswordManager.clearPassword(userId);

        toast.success('User account deleted', {
          description: `${username ?? userId} has been removed`
        });

        setDeleteError(null);

        return true;
      } catch (err: any) {
        // Log and surface the function error to the UI
        // eslint-disable-next-line no-console
        console.error('[AdminPanel] function delete error:', err);
        const msg = err?.message ? String(err.message) : String(err);
        setDeleteError(msg || 'Failed to delete user');
        try { toast?.error?.('Failed to delete user'); } catch { }
        return false;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      try { toast?.error?.('Failed to delete user', { description: 'Please try again' }); } catch { }
      return false;
    }
  };

  // Confirm delete wrapper that accepts optional id and returns boolean
  const confirmDeleteUser = async (userId?: string): Promise<boolean> => {
    const id = userId ?? userToDelete?.userId;
    if (!id) return false;
    const username = userToDelete?.username;
    return await performDeleteUser(id, username);
  };

  const handlePermanentlyRemoveUser = (userId: string, username: string) => {
    // Open the permanent delete confirmation modal
    setUserToPermanentlyDelete({ userId, username });
    setShowPermanentDeleteModal(true);
  };

  const confirmPermanentlyRemoveUser = async () => {
    if (!userToPermanentlyDelete) return;

    const { userId, username } = userToPermanentlyDelete;
    // confirmPermanentlyRemoveUser invoked (debug logging removed)

    try {
      // Determine the Edge Function URL
      const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
      const functionUrl = (import.meta.env.DEV && typeof window !== 'undefined')
        ? '/functions/v1/admin-delete-user' // use local dev proxy to avoid CORS
        : `${supabaseUrl.replace(/\/$/, '')}/functions/v1/admin-delete-user`;

      // Prepare headers (include anon Authorization when available)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-admin-secret': (import.meta as any).env?.VITE_ADMIN_SECRET || '', // must match Edge Function
      };

      const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANONKEY || '';
      if (anonKey) {
        headers['Authorization'] = `Bearer ${String(anonKey)}`;
        // anon Authorization header included (silent)
      } else {
        // warn developer: missing anon key may cause a 401 "Missing authorization header"
        // Do not abort — the server may still accept x-admin-secret only, but surface a helpful toast.
        try { toast?.error?.('Missing anon key for functions gateway', { description: 'Set VITE_SUPABASE_ANON_KEY in .env and restart the dev server' }); } catch { /* swallow */ }
        // VITE_SUPABASE_ANON_KEY not set; function may reject request with 401 (silent)
      }

      // Payload for deletion
      const payload = {
        userId,
        reason: `Deleted by admin: ${username ?? userId}`,
        deletedBy: null, // safe default if needed
      };

      // calling hosted delete function at functionUrl (silent)

      // 1️⃣ Call Edge Function to remove auth user (server-side)
      let resp: Response;
      try {
        resp = await fetch(functionUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error('[AdminPanel] Auth delete call failed:', err);
        toast.error('Failed to call admin delete function', { description: 'Network or gateway error' });
        return;
      }

      // Parse response safely
      let respJson: any = null;
      try { respJson = await resp.json(); } catch { /* ignore non-json responses */ }

      // Determine outcome: deleted, already-missing, or error
      const status = resp.status;
      const serverError = respJson?.error || respJson?.message || null;

      // Read raw text as well for non-json error shapes
      let rawText: string | null = null;
      if (!resp.ok) {
        try { rawText = await resp.text(); } catch { rawText = null; }
      }

      const combinedError = String(serverError || rawText || '').trim();
      const looksLikeMissing = status === 404 || /not found|does not exist|user not found|not found for archive/i.test(combinedError);

      if (!resp.ok && !looksLikeMissing) {
        const errText = combinedError || 'server error';
        // Auth user deletion failed (silent)
        toast.error('Failed to delete auth user', { description: String(errText) });
        return;
      }

      const userWasDeleted = resp.ok;
      const userAlreadyMissing = looksLikeMissing;

      if (userWasDeleted) {
        // Auth user deleted by Edge Function (silent)
      } else if (userAlreadyMissing) {
        // Auth user already missing (silent)
      }

      // 2️⃣ Permanently remove from deleted_users table (client-side)
      try {
        await DeletedUsersManagerAsync.permanentlyRemoveAsync(userId);
      } catch (err) {
        console.error('[AdminPanel] Failed to remove from deleted_users table:', err);
        toast.error('Failed to remove deleted-user record', { description: 'Please try again or contact support' });
        return;
      }

      // 3️⃣ Notify admin with clear message
      if (userWasDeleted) {
        toast.success('User permanently removed', { description: `${username ?? userId} has been removed from Auth and deleted_users` });
      } else if (userAlreadyMissing) {
        toast.success('User record cleaned', { description: `${username ?? userId} was already removed from Auth; deleted_users entry removed` });
      }

      // 4️⃣ Refresh deleted users list and statistics
      try {
        setDeletedUsers(await DeletedUsersManagerAsync.getAllDeletedUsersAsync());
        setDeletedUserStats(await DeletedUsersManagerAsync.getStatisticsAsync());
      } catch (error) {
        console.error('[AdminPanel] Failed to refresh deleted users after permanent removal:', error);
      }

      // 5️⃣ Close modal and clear selection
      setShowPermanentDeleteModal(false);
      setUserToPermanentlyDelete(null);
    } catch (error) {
      console.error('[AdminPanel] Permanent delete failed:', error);
      toast.error('Failed to remove user', { description: 'Please try again' });
    }
  };




  // If viewing user progress, show both viewers in tabs
  if (viewingUserProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="monitor" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="monitor">Real-Time Monitor</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>
              <Button variant="outline" onClick={() => setViewingUserProgress(null)}>
                Back to Dashboard
              </Button>
            </div>

            <TabsContent value="monitor">
              <AdminProgressMonitor
                userId={viewingUserProgress.userId}
                username={viewingUserProgress.username}
                onClose={() => setViewingUserProgress(null)}
              />
            </TabsContent>

            <TabsContent value="detailed">
              <AdminProgressViewer
                userId={viewingUserProgress.userId}
                username={viewingUserProgress.username}
                onClose={() => setViewingUserProgress(null)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // If editing a module, show the EditModule component
  if (editingModule) {
    return (
      <EditModule
        module={editingModule}
        onBack={() => {
          setEditingModule(null);
          // Ensure we return to content tab
          setActiveTab('content');
          // Restore scroll position after component re-renders
          setTimeout(() => {
            window.scrollTo({
              top: contentScrollPosition,
              behavior: 'smooth'
            });
          }, 100);
        }}
        onSave={handleSaveModule}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative inline-block">
              <StudyBuddyLogo size="2xl" variant="minimal" animate={true} withBackground={false} />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor system performance and manage learning content</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1 flex items-center space-x-2 bg-primary/10 text-primary border-primary/30">
              <Shield className="w-4 h-4" />
              <span>Administrator</span>
            </Badge>
            {onLogout && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center text-red-600 hover:bg-red-600/10 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-400/20 dark:hover:text-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out?</AlertDialogTitle>
                    <AlertDialogDescription>Are you sure you want to sign out of the admin dashboard?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onLogout} className="bg-transparent text-red-600 hover:text-red-700 font-semibold dark:text-red-400 dark:hover:text-red-300">Sign out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Overview Cards removed per request */}

        {/* Security & Authentication Stats */}
        {/* Security & Account Protection Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg">Security & Protection Overview</h3>
                <p className="text-xs text-muted-foreground">Real-time account security metrics and password protection status</p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1.5 bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400">
              <Activity className="w-3 h-3 mr-1.5" />
              Live Monitoring
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Password Protected Accounts */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                    Active
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Password Protected</p>
                  <p className="text-3xl tabular-nums">
                    {allUsers.filter(user => passwordProtectedSet.has(user.userId)).length}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Secured Accounts</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-green-500/10">
                  <p className="text-xs text-muted-foreground">
                    Total accounts with password authentication enabled
                  </p>
                </div>
              </CardContent>
            </Card>



            {/* Total Users (replacing UUID Recovery) */}
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs">
                    Available
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Users</p>
                  <p className="text-3xl tabular-nums">{adminStats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Accounts</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-purple-500/10">
                  <p className="text-xs text-muted-foreground">
                    Total accounts (sourced from user_profiles)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Security Coverage */}
            <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500/10 to-green-500/10 rounded-xl border border-amber-500/20">
                    <BarChart3 className="w-6 h-6 text-amber-500" />
                  </div>
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                    Coverage
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Security Coverage</p>
                  <p className="text-3xl tabular-nums">
                    {(() => {
                      const passwordUsers = allUsers.filter(user => passwordProtectedSet.has(user.userId)).length;
                      const total = allUsers.length || 1;
                      return Math.round((passwordUsers / total) * 100);
                    })()}%
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                    <Shield className="w-3 h-3" />
                    <span>Protected</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-amber-500/10">
                  <Progress
                    value={(() => {
                      const passwordUsers = allUsers.filter(user => passwordProtectedSet.has(user.userId)).length;
                      const total = allUsers.length || 1;
                      return Math.round((passwordUsers / total) * 100);
                    })()}
                    className="h-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Percentage of accounts with active security
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-2/3 mx-auto grid-cols-4 gap-4">
            <TabsTrigger value="users" className="text-center">Users</TabsTrigger>
            <TabsTrigger value="content" className="text-center">Content</TabsTrigger>
            <TabsTrigger value="reports" className="text-center">
              <Flag className="w-4 h-4 mr-1 hidden sm:inline" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="system" className="text-center">System</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          {/* Student Progress Analytics removed per request */}

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and monitor activity</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Authentication</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUsers.map((user, idx) => {
                      // Determine if user is active based on last activity
                      const isActive = (() => {
                        try {
                          const lastActive = new Date(user.lastActive);
                          const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
                          return daysSince <= 7;
                        } catch {
                          return false;
                        }
                      })();

                      return (
                        <TableRow
                          key={user.userId ?? `user-${idx}-${user.username ?? ''}`}
                          className={!isActive ? 'bg-red-500/10 border-red-500/20' : ''}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-muted-foreground">UUID: {user.userId.substring(0, 8)}...</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getLevelBadgeVariant(user.level)}>
                              {user.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={passwordProtectedSet.has(user.userId) ? 'default' : 'secondary'}>
                                {passwordProtectedSet.has(user.userId) ? '🔐 Password + UUID' : '⚠️ Needs Password'}
                              </Badge>
                              {(() => {
                                const history = PasswordManager.getPasswordHistory(user.userId);
                                if (history) {
                                  const changeDate = new Date(history.timestamp);
                                  const changeTypeIcon = history.changeType === 'reset' ? '🔄' :
                                    history.changeType === 'changed' ? '🔧' : '✨';
                                  const changeTypeText = history.changeType === 'reset' ? 'Reset' :
                                    history.changeType === 'changed' ? 'Changed' : 'Created';
                                  return (
                                    <p className="text-xs text-muted-foreground">
                                      {changeTypeIcon} {changeTypeText}: {changeDate.toLocaleDateString()}
                                    </p>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.userId !== 'YCW-158-KA-4678' && (
                                <>
                                  {/* Progress button removed per request */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // debug: log button click
                                      // eslint-disable-next-line no-console
                                      // Delete button clicked for user (silent)
                                      // Calculate days inactive
                                      const userSessions = allSessions.filter(s => s.userId === user.userId);
                                      const lastActivity = userSessions.length > 0
                                        ? userSessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0].startTime
                                        : undefined;
                                      const daysInactive = lastActivity
                                        ? DeletedUsersManager.calculateInactiveDays(lastActivity)
                                        : 0;
                                      handleDeleteUser(user.userId, user.username, daysInactive);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                              {user.userId === 'YCW-158-KA-4678' && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {!showAllUsers && filteredUsers.length > 10 && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAllUsers(true);
                        scrollToTop();
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View All Users ({filteredUsers.length})
                    </Button>
                  </div>
                )}

                {showAllUsers && (
                  <div className="text-center mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAllUsers(false);
                        scrollToTop();
                      }}
                    >
                      Show Less
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Beginner</span>
                      <span>{allUsers.filter(u => u.level === 'Beginner').length} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Learner</span>
                      <span>{allUsers.filter(u => u.level === 'Learner').length} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advanced</span>
                      <span>{allUsers.filter(u => u.level === 'Advanced').length} users</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Active (7 days)</span>
                      <span className="text-green-500">{allUsers.filter(u => {
                        try {
                          const lastActive = new Date(u.lastActive);
                          const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
                          return daysSince <= 7;
                        } catch { return false; }
                      }).length} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inactive (30 days)</span>
                      <span className="text-yellow-500">{allUsers.filter(u => {
                        try {
                          const lastActive = new Date(u.lastActive);
                          const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
                          return daysSince > 7 && daysSince <= 30;
                        } catch { return false; }
                      }).length} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dormant (90+ days)</span>
                      <span className="text-red-500">{allUsers.filter(u => {
                        try {
                          const lastActive = new Date(u.lastActive);
                          const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
                          return daysSince > 30;
                        } catch { return false; }
                      }).length} users</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Statistics card removed per request */}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Session Management & Analytics</h2>
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Export Session Data
              </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Session Overview */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Active Sessions Overview</span>
                  </CardTitle>
                  <CardDescription>Real-time session monitoring and security metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="text-2xl text-green-500 mb-1">{sessionAnalytics.totalActiveSessions}</div>
                      <div className="text-sm text-muted-foreground">Active Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="text-2xl text-blue-500 mb-1">{sessionAnalytics.averageSessionDuration}</div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="text-2xl text-yellow-500 mb-1">{sessionAnalytics.multipleLoginAttempts}</div>
                      <div className="text-sm text-muted-foreground">Multi-Login Blocks</div>
                    </div>
                    <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="text-2xl text-purple-500 mb-1">{sessionAnalytics.sessionSecurity}</div>
                      <div className="text-sm text-muted-foreground">Security Level</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4">Device Distribution</h4>
                    <div className="space-y-3">
                      {sessionAnalytics.deviceDistribution.map((device) => (
                        <div key={device.device} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center space-x-2">
                              <Monitor className="w-4 h-4" />
                              <span>{device.device}</span>
                            </span>
                            <div className="flex items-center">
                              <span className="text-sm">{device.count} sessions</span>
                            </div>
                          </div>
                          <Progress value={device.percentage} />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Alerts */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span>System Alerts</span>
                  </CardTitle>
                  <CardDescription>Real-time system monitoring and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {systemAlerts.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {systemAlerts.map((alert) => {
                        const alertConfig = (() => {
                          switch (alert.type) {
                            case 'warning':
                              return {
                                bg: 'bg-yellow-500/10',
                                border: 'border-yellow-500/20',
                                icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                                textColor: 'text-yellow-500'
                              };
                            case 'success':
                              return {
                                bg: 'bg-green-500/10',
                                border: 'border-green-500/20',
                                icon: <CheckCircle className="w-4 h-4 text-green-500" />,
                                textColor: 'text-green-500'
                              };
                            case 'info':
                              return {
                                bg: 'bg-blue-500/10',
                                border: 'border-blue-500/20',
                                icon: <Activity className="w-4 h-4 text-blue-500" />,
                                textColor: 'text-blue-500'
                              };
                            default:
                              return {
                                bg: 'bg-muted/50',
                                border: 'border-muted',
                                icon: <AlertCircle className="w-4 h-4 text-muted-foreground" />,
                                textColor: 'text-muted-foreground'
                              };
                          }
                        })();

                        return (
                          <div key={alert.id} className={`p-3 ${alertConfig.bg} border ${alertConfig.border} rounded-lg`}>
                            <div className="flex items-center space-x-2 mb-1">
                              {alertConfig.icon}
                              <span className={`text-sm ${alertConfig.textColor}`}>
                                {alert.type === 'warning' && 'Warning'}
                                {alert.type === 'success' && 'Success'}
                                {alert.type === 'info' && 'Information'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                      <p className="text-sm">No alerts at this time</p>
                      <p className="text-xs mt-1">All systems operating normally</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Session Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Session Activity</CardTitle>
                <CardDescription>Detailed session logs and user activity tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => scrollToTop()}
                      >
                        Export CSV
                      </Button>
                      <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by device" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Devices</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="ended">Ended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Showing {displayedSessions.length} of {filteredSessions.length} sessions
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-5 gap-4 p-3 bg-muted text-sm border-b">
                      <div>User</div>
                      <div>Device</div>
                      <div>Login Time</div>
                      <div>Duration</div>
                      <div>Status</div>
                    </div>
                    {displayedSessions.length > 0 ? (
                      displayedSessions.map((session) => (
                        <div key={`${session.userId}-${session.deviceId}`} className="grid grid-cols-5 gap-4 p-3 border-b last:border-b-0 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{session.username}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Monitor className="w-4 h-4" />
                            <span>{getDeviceType(session.userAgent)}</span>
                          </div>
                          <div>{new Date(session.loginTime).toLocaleTimeString()}</div>
                          <div>{session.duration}</div>
                          <div>
                            <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>No active user sessions</p>
                      </div>
                    )}
                  </div>

                  {!showAllSessions && filteredSessions.length > 10 && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAllSessions(true);
                          scrollToTop();
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View All Sessions ({filteredSessions.length})
                      </Button>
                    </div>
                  )}

                  {showAllSessions && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAllSessions(false);
                          scrollToTop();
                        }}
                      >
                        Show Less
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Content Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Modules</span>
                    <span>{adminStats.totalModules}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Lessons</span>
                    <span>{adminStats.totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Projects</span>
                    <span>{adminStats.totalModules}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Content</span>
                    <span className="text-green-500">{adminStats.totalModules + adminStats.totalLessons} items</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Avg Completion Rate</span>
                    <span>{adminStats.avgCompletionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Project Score</span>
                    <span>{adminStats.avgScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total XP Earned</span>
                    <span className="text-green-500">{adminStats.totalXPEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Engagement</span>
                    <span className="text-green-500">{adminStats.activeUsers > 0 ? 'High' : 'Low'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Curriculum Content Browser */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5" />
                      <span>Curriculum Content</span>
                    </CardTitle>
                    <CardDescription>Manage all modules and lessons in the Java Study Buddy curriculum</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Admin Controls Toolbar */}
              <div className="px-6 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      {/* Add New Module button removed per request */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input
                          placeholder="Search modules..."
                          value={contentSearchTerm}
                          onChange={(e) => setContentSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={contentCategoryFilter} onValueChange={(value: any) => setContentCategoryFilter(value)}>
                        <SelectTrigger className="w-40">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Levels</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Learner">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={moduleSortBy} onValueChange={(value: any) => setModuleSortBy(value)}>
                        <SelectTrigger className="w-44">
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Default Order</SelectItem>
                          <SelectItem value="title">A-Z</SelectItem>
                          <SelectItem value="updated">Last Updated</SelectItem>
                          <SelectItem value="lessons">Most Lessons</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Export/Import Controls */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/30">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm">Curriculum Data Management</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportCurriculum}
                      >
                        <Download className="w-3 h-3 mr-1.5" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleImportCurriculum}
                      >
                        <Upload className="w-3 h-3 mr-1.5" />
                        Import
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearEdits}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <RefreshCw className="w-3 h-3 mr-1.5" />
                        Reset All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent>
                <div className="space-y-4">
                  {/* Module Statistics */}
                  <div className="space-y-4 mb-6">
                    {/* Total Curriculum Content - All Tracks Combined */}
                    <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-2 border-primary/30 shadow-lg">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-base">Total Curriculum Content</h4>
                          <p className="text-xs text-muted-foreground">Complete learning path across all levels</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="text-2xl text-primary mb-1">
                            {(() => {
                              // Total: 12 modules (3 tracks: Beginner 1-4, Learner 5-8, Advanced 9-12)
                              // All modules from CurriculumManager (includes all tracks)
                              const allModules = CurriculumManager.getAllModules();
                              return allModules.length;
                            })()}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Modules</div>
                          <div className="text-xs text-muted-foreground/60 mt-1">All Levels</div>
                        </div>
                        <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="text-2xl text-blue-500 mb-1">
                            {(() => {
                              // Total lessons from all curriculum modules
                              const allModules = CurriculumManager.getAllModules();
                              const totalLessons = allModules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                              return totalLessons;
                            })()}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Lessons</div>
                          <div className="text-xs text-muted-foreground/60 mt-1">Combined</div>
                        </div>
                        <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="text-2xl text-green-500 mb-1">
                            {(() => {
                              // Total hours from all curriculum modules
                              const allModules = CurriculumManager.getAllModules();
                              const totalHours = allModules.reduce((sum, m) => sum + (m.estimatedHours || 0), 0);
                              return totalHours;
                            })()}h
                          </div>
                          <div className="text-sm text-muted-foreground">Total Hours</div>
                          <div className="text-xs text-muted-foreground/60 mt-1">Full Course</div>
                        </div>
                      </div>
                    </div>

                    {/* Publishing Status Statistics */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 via-yellow-500/5 to-green-500/5 border-2 border-green-500/30">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h4 className="text-sm">Publishing Status</h4>
                          <p className="text-xs text-muted-foreground">Module visibility control</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="text-xl text-green-500 mb-1">
                            {(() => {
                              const allModules = getAllModulesWithEdits();
                              return allModules.filter(m => modulePublishStates[m.id] ?? true).length;
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">Published</div>
                        </div>
                        <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <div className="text-xl text-yellow-500 mb-1">
                            {(() => {
                              const allModules = getAllModulesWithEdits();
                              return allModules.filter(m => !(modulePublishStates[m.id] ?? true)).length;
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">Unpublished</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modules List */}
                  <Accordion type="single" collapsible className="space-y-4" key={curriculumRefresh}>
                    {sortedModules.map((module) => {
                      const isPublished = modulePublishStates[module.id] ?? true;

                      return (
                        <AccordionItem key={module.id} value={module.id} className="border-2 border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 via-accent/5 to-transparent shadow-md hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                          <div className="flex items-start justify-between gap-4 p-4">
                            <AccordionTrigger className="hover:no-underline flex-1 py-4 pl-4">
                              <div className="flex items-start space-x-4 text-left flex-1">
                                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10 rounded-lg flex flex-col items-center justify-center shadow-sm border border-primary/20 relative overflow-hidden group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  <Sparkles className="w-3 h-3 text-primary mb-1 relative z-10 drop-shadow-sm" />
                                  <span className="text-xs relative z-10 text-center leading-tight">Module {module.week}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start flex-wrap gap-x-2 gap-y-1 mb-1">
                                    <h4 className="break-words">{module.title}</h4>
                                    <Badge variant={
                                      module.category === 'Beginner' ? 'secondary' :
                                        module.category === 'Learner' ? 'default' :
                                          'destructive'
                                    }>
                                      {module.category}
                                    </Badge>
                                    {!isPublished && (
                                      <Badge variant="outline" className="text-muted-foreground">
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{module.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                    <span className="flex items-center space-x-1">
                                      <BookOpen className="w-3 h-3" />
                                      <span>{module.lessons.length} lessons</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{module.estimatedHours}h</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>

                            {/* Module Action Buttons - Outside the trigger */}
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditModule(module);
                                }}
                              >
                                <Edit2 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <div className="flex items-center space-x-2 px-2.5 h-8 border rounded-md bg-background">
                                <span className="text-xs">{isPublished ? 'Published' : 'Draft'}</span>
                                <Switch
                                  checked={isPublished}
                                  onCheckedChange={() => handleTogglePublish(module.id)}
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModule(module.id);
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <AccordionContent>
                            <div className="pt-4 pb-2 px-6 space-y-6">
                              {/* Lessons Section */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    <span>Lessons ({module.lessons?.length || 0})</span>
                                  </h5>
                                  <Button size="sm" variant="outline">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Lesson
                                  </Button>
                                </div>

                                {module.lessons && module.lessons.length > 0 ? (
                                  <div className="space-y-2">
                                    {module.lessons.map((lesson: any, idx: number) => (
                                      <Card key={lesson.id} className="no-hover-card bg-muted/30">
                                        <CardContent className="p-3">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
                                                <h6 className="text-sm">{lesson.title}</h6>
                                                <Badge variant="outline" className="text-xs">{lesson.difficulty}</Badge>
                                                {lesson.duration && (
                                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {lesson.duration}
                                                  </span>
                                                )}
                                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                                  <Zap className="w-3 h-3" />
                                                  {lesson.difficulty === 'Easy' ? 50 : lesson.difficulty === 'Intermediate' ? 75 : 100} XP
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground line-clamp-2">{lesson.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button size="sm" variant="ghost">
                                                <Edit2 className="w-3 h-3" />
                                              </Button>
                                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground text-sm">
                                    No lessons added yet
                                  </div>
                                )}
                              </div>

                              {/* Exercises Section */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="flex items-center gap-2">
                                    <Code className="w-4 h-4 text-accent" />
                                    <span>Practice Exercises ({(module as any).handsOnExercises?.length || 0})</span>
                                  </h5>
                                  <Button size="sm" variant="outline">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Exercise
                                  </Button>
                                </div>

                                {(module as any).handsOnExercises && (module as any).handsOnExercises.length > 0 ? (
                                  <div className="space-y-2">
                                    {(module as any).handsOnExercises.map((exercise: any, idx: number) => (
                                      <Card key={exercise.id} className="no-hover-card bg-accent/5">
                                        <CardContent className="p-3">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-muted-foreground">#{idx + 1}</span>
                                                <h6 className="text-sm">{exercise.title}</h6>
                                                <Badge variant="outline" className="text-xs">{exercise.difficulty}</Badge>
                                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                                  <Zap className="w-3 h-3" />
                                                  {exercise.points} XP
                                                </Badge>
                                              </div>
                                              <p className="text-xs text-muted-foreground line-clamp-2">{exercise.description}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Button size="sm" variant="ghost">
                                                <Edit2 className="w-3 h-3" />
                                              </Button>
                                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground text-sm">
                                    No practice exercises added yet
                                  </div>
                                )}
                              </div>

                              {/* Project Section */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-green-500" />
                                    <span>Module Project</span>
                                  </h5>
                                  {!(module as any).assessmentProject && (
                                    <Button size="sm" variant="outline">
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Project
                                    </Button>
                                  )}
                                </div>

                                {(module as any).assessmentProject ? (
                                  <Card className="no-hover-card bg-green-500/5 border-green-500/20">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h6 className="text-sm">{(module as any).assessmentProject.title}</h6>
                                            <Badge variant="outline" className="text-xs">{(module as any).assessmentProject.difficulty}</Badge>
                                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                              <Zap className="w-3 h-3" />
                                              {(module as any).assessmentProject.points} XP
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-muted-foreground mb-3">{(module as any).assessmentProject.description}</p>

                                          {(module as any).assessmentProject.objectives && (module as any).assessmentProject.objectives.length > 0 && (
                                            <div className="space-y-1">
                                              <span className="text-xs font-medium">Learning Objectives:</span>
                                              <ul className="text-xs text-muted-foreground space-y-0.5 ml-4">
                                                {(module as any).assessmentProject.objectives.map((obj: string, i: number) => (
                                                  <li key={i} className="list-disc">{obj}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Button size="sm" variant="ghost">
                                            <Edit2 className="w-3 h-3" />
                                          </Button>
                                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground text-sm">
                                    No module project added yet
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Reports Statistics */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/20 rounded-lg">
                      <Flag className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                      <p className="text-2xl">{reportStats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Open</p>
                      <p className="text-2xl">{reportStats.open}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-2xl">{reportStats.resolved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Flag className="w-5 h-5" />
                      <span>User Reports</span>
                    </CardTitle>
                    <CardDescription>Review and manage user-submitted issues and feedback</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={reportTypeFilter} onValueChange={(value: any) => setReportTypeFilter(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="bug">Bug Reports</SelectItem>
                        <SelectItem value="feature">Features</SelectItem>
                        <SelectItem value="help">Help</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={reportStatusFilter} onValueChange={(value: any) => setReportStatusFilter(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {allReports.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Flag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No reports submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allReports
                      .filter(report => {
                        const matchesType = reportTypeFilter === 'all' || report.type === reportTypeFilter;
                        const matchesStatus = reportStatusFilter === 'all' || report.status === reportStatusFilter;
                        return matchesType && matchesStatus;
                      })
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((report) => {
                        const getTypeIcon = () => {
                          switch (report.type) {
                            case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
                            case 'feature': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
                            case 'help': return <HelpCircle className="w-4 h-4 text-blue-500" />;
                            case 'feedback': return <MessageSquare className="w-4 h-4 text-purple-500" />;
                          }
                        };

                        const getTypeLabel = () => {
                          switch (report.type) {
                            case 'bug': return 'Bug Report';
                            case 'feature': return 'Feature Request';
                            case 'help': return 'Help Request';
                            case 'feedback': return 'Feedback';
                          }
                        };

                        const getTypeColor = () => {
                          switch (report.type) {
                            case 'bug': return 'border-red-500/30 bg-red-500/10';
                            case 'feature': return 'border-yellow-500/30 bg-yellow-500/10';
                            case 'help': return 'border-blue-500/30 bg-blue-500/10';
                            case 'feedback': return 'border-purple-500/30 bg-purple-500/10';
                          }
                        };

                        const getPriorityColor = () => {
                          switch (report.priority) {
                            case 'high': return 'text-red-500 border-red-500/50 bg-red-500/10';
                            case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
                            case 'low': return 'text-green-500 border-green-500/50 bg-green-500/10';
                          }
                        };

                        const getStatusColor = () => {
                          switch (report.status) {
                            case 'open': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
                            case 'in-progress': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
                            case 'resolved': return 'text-green-500 border-green-500/50 bg-green-500/10';
                            case 'closed': return 'text-gray-500 border-gray-500/50 bg-gray-500/10';
                          }
                        };

                        return (
                          <Accordion type="single" collapsible key={report.id}>
                            <AccordionItem value={report.id} className={`border-2 rounded-lg ${getTypeColor()}`}>
                              <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center space-x-3">
                                    {getTypeIcon()}
                                    <div className="text-left">
                                      <div className="flex items-center space-x-2">
                                        <h4 className="font-medium">{report.subject}</h4>
                                        <Badge variant="outline" className={getPriorityColor()}>
                                          {report.priority}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {report.username} • {new Date(report.timestamp).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {getTypeLabel()}
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4">
                                  <div className="bg-muted/50 p-4 rounded-lg">
                                    <h5 className="text-sm font-medium mb-2">Description</h5>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>
                                  </div>

                                  {report.screenshot && (
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                      <h5 className="text-sm font-medium mb-3 flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-primary" />
                                        <span>Attached Screenshot</span>
                                      </h5>
                                      <div className="border-2 border-border rounded-lg overflow-hidden bg-background">
                                        <img
                                          src={report.screenshot}
                                          alt="User submitted screenshot"
                                          className="w-full max-h-96 object-contain"
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Click image to view in full size in a new tab
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                          const newWindow = window.open();
                                          if (newWindow) {
                                            newWindow.document.write(`
                                              <html>
                                                <head>
                                                  <title>Screenshot - ${report.subject}</title>
                                                  <style>
                                                    body { margin: 0; padding: 20px; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                                    img { max-width: 100%; height: auto; }
                                                  </style>
                                                </head>
                                                <body>
                                                  <img src="${report.screenshot}" alt="Screenshot" />
                                                </body>
                                              </html>
                                            `);
                                          }
                                        }}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View Full Size
                                      </Button>
                                    </div>
                                  )}

                                  {report.adminNotes && (
                                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                                      <h5 className="text-sm font-medium mb-2 flex items-center space-x-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Admin Notes</span>
                                      </h5>
                                      <p className="text-sm text-muted-foreground">{report.adminNotes}</p>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-end pt-2 border-t space-x-2">
                                    {report.status === 'resolved' ? (
                                      <Badge variant="outline" className="text-green-600 border-green-600/50 bg-green-600/10">
                                        Resolved
                                      </Badge>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 hover:bg-green-600/10"
                                        onClick={async () => {
                                          try {
                                            await withRetries(() => IssueReportManagerAsync.updateReportStatusAsync(report.id, 'resolved'), { attempts: 2, timeoutMs: 2000 });
                                            const reportsRefreshed = await IssueReportManagerAsync.getAllReportsAsync();
                                            const statsRefreshed = await IssueReportManagerAsync.getStatisticsAsync();
                                            setAllReports(reportsRefreshed);
                                            setReportStats(statsRefreshed);
                                            try { toast?.success?.('Report marked resolved'); } catch { }
                                          } catch (err) {
                                            console.error('Failed to mark report resolved', err);
                                            try { toast?.error?.('Failed to mark report resolved'); } catch { }
                                          }
                                        }}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Resolved
                                      </Button>
                                    )}

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                      onClick={async () => {
                                        if (confirm('Are you sure you want to delete this report?')) {
                                          try {
                                            await withRetries(() => IssueReportManagerAsync.deleteReportAsync(report.id), { attempts: 2, timeoutMs: 2000 });
                                            const reportsRefreshed = await IssueReportManagerAsync.getAllReportsAsync();
                                            const statsRefreshed = await IssueReportManagerAsync.getStatisticsAsync();
                                            setAllReports(reportsRefreshed);
                                            setReportStats(statsRefreshed);
                                          } catch (err) {
                                            console.error('Failed to delete report', err);
                                            try { toast?.error?.('Failed to delete report'); } catch { }
                                          }
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deleted Users Tab */}
          <TabsContent value="deleted" className="space-y-6">
            {/* Deleted Users Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                      <Trash2 className="w-6 h-6 text-red-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Deleted</p>
                    <p className="text-3xl tabular-nums">{deletedUserStats.total}</p>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-orange-500/10 rounded-xl">
                      <User className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Self-Deleted</p>
                    <p className="text-3xl tabular-nums">{deletedUserStats.selfDeleted}</p>
                    <p className="text-xs text-muted-foreground">User initiated</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-purple-500/10 rounded-xl">
                      <Shield className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Admin Deleted</p>
                    <p className="text-3xl tabular-nums">{deletedUserStats.adminDeleted}</p>
                    <p className="text-xs text-muted-foreground">By administrator</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                      <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Last 30 Days</p>
                    <p className="text-3xl tabular-nums">{deletedUserStats.last30Days}</p>
                    <p className="text-xs text-muted-foreground">Recently deleted</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recently Deleted Accounts Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <span>Recently Deleted Accounts</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Accounts deleted in the last 30 days. Permanently removed after 365 days.
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    {deletedUsers.length} Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {deletedUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg mb-1">No Deleted Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no deleted user accounts to display
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Deleted By</TableHead>
                            <TableHead>Deleted At</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead>Days Inactive</TableHead>
                            <TableHead>Total XP</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(showAllDeletedUsers ? deletedUsers : deletedUsers.slice(0, 10)).map((user, idx) => (
                            <TableRow key={user.userId ?? `deleted-${idx}-${user.username ?? ''}`}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{user.username}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {user.userId}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.deletedBy === 'admin' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {user.deletedBy === 'admin' ? (
                                    <><Shield className="w-3 h-3 mr-1" />Admin</>
                                  ) : (
                                    <><User className="w-3 h-3 mr-1" />Self</>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(user.deletedAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {user.lastActivity
                                  ? new Date(user.lastActivity).toLocaleString()
                                  : 'Never'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={user.daysInactive && user.daysInactive >= 90 ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {user.daysInactive || 0} days
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {user.totalXP?.toLocaleString() || 0} XP
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePermanentlyRemoveUser(user.userId, user.username)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {deletedUsers.length > 10 && (
                      <div className="flex justify-center pt-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllDeletedUsers(!showAllDeletedUsers)}
                        >
                          {showAllDeletedUsers ? 'Show Less' : `Show All ${deletedUsers.length} Deleted Users`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span>System Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <p className="text-sm">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Server Status</span>
                    <Badge variant="default" className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Status</span>
                    <Badge variant="default" className="bg-green-500">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>API Response Time</span>
                    <span className="text-green-500">120ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>System Load</span>
                    <span className="text-yellow-500">Medium</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Usage</span>
                    <span>67% (2.1GB)</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>User Registration</h4>
                      <p className="text-sm text-muted-foreground">Allow new users to register</p>
                    </div>
                    <Badge variant="default">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Session Management</h4>
                      <p className="text-sm text-muted-foreground">One device per account policy</p>
                    </div>
                    <Badge variant="default">Enforced</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Academic Integrity</h4>
                      <p className="text-sm text-muted-foreground">Copy-paste prevention in assessments</p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Data Retention</h4>
                      <p className="text-sm text-muted-foreground">User data retention period</p>
                    </div>
                    <span className="text-sm">365 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Confirmation Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={(v) => { // debug: log open change
        // eslint-disable-next-line no-console
        // AlertDialog onOpenChange (delete) (silent)
        setShowDeleteModal(v);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete User Account</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Confirm deletion of this user account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">
                  ⚠️ Warning: Once this account is deleted, it cannot be recovered.
                </p>
                {userToDelete && userToDelete.daysInactive !== undefined && userToDelete.daysInactive >= 90 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    This user has been inactive for {userToDelete.daysInactive} days (90+ days).
                  </p>
                )}
              </div>

              {userToDelete && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Deleting account: <span className="text-primary">{userToDelete.username}</span></p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• User will be removed from active accounts</p>
                    <p>• All progress and session data will be cleared</p>
                    <p>• Account will be moved to Recently Deleted Accounts</p>
                    <p>• This action cannot be undone</p>
                  </div>
                </div>
              )}
              {deleteError && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  {deleteError}
                </div>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!userToDelete) return;
                setIsDeleting(true);
                // eslint-disable-next-line no-console
                // start delete for user (silent)
                const ok = await confirmDeleteUser();
                setIsDeleting(false);
                if (ok) {
                  // Close only after successful deletion
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                  // eslint-disable-next-line no-console
                  // delete succeeded for user (silent)
                } else {
                  // keep modal open and show error in console (toast handled in performDeleteUser)
                  // eslint-disable-next-line no-console
                  console.error('[AdminPanel] delete failed for', userToDelete.userId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete User Confirmation Modal */}
      <AlertDialog open={showPermanentDeleteModal} onOpenChange={(v) => { // debug: log open change
        // eslint-disable-next-line no-console
        // AlertDialog onOpenChange (permanent) (silent)
        setShowPermanentDeleteModal(v);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span>Permanent Deletion</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              Permanently remove all records for this account. This is irreversible.
            </AlertDialogDescription>
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-semibold text-foreground mb-2">
                  🚨 CRITICAL WARNING: This will PERMANENTLY erase all records!
                </p>
                <p className="text-xs text-muted-foreground">
                  This action is irreversible and cannot be undone under any circumstances.
                </p>
              </div>

              {userToPermanentlyDelete && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Permanently removing: <span className="text-destructive">{userToPermanentlyDelete.username}</span></p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• All user records will be completely erased</p>
                    <p>• No recovery will be possible</p>
                    <p>• This is the final deletion step</p>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPermanentDeleteModal(false);
              setUserToPermanentlyDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await confirmPermanentlyRemoveUser();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Permanently Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}