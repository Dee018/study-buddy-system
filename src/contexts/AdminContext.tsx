/**
 * Admin Context
 * 
 * Provides global admin operations and state management
 * Handles user management, content moderation, analytics, and issue reporting
 * Implements real-time updates for admin dashboard
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AdminService } from '../utils/supabase/dataService';
import type {
  UserProfile,
  DeletedUser,
  IssueReport,
  Module,
  Lesson,
  Exercise
} from '../utils/supabase/dataService';
import { useAuth } from './AuthContext';
import { useCurriculum } from './CurriculumContext';
import { supabase } from '../utils/supabase/client';
// Realtime channel type not required here

// ============================================================================
// TYPES
// ============================================================================

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalXP: number;
  totalCompletions: number;
  totalModules: number;
  totalLessons: number;
  totalExercises: number;
  issuesOpen: number;
  issuesResolved: number;
}

export interface UserActivity {
  userId: string;
  username: string;
  lastLogin: string;
  totalXP: number;
  level: number;
  completedModules: number;
  lastActivity: string;
  isActive: boolean;
}

export interface ContentStats {
  publishedModules: number;
  draftModules: number;
  totalLessons: number;
  totalExercises: number;
  averageLessonsPerModule: number;
  averageExercisesPerModule: number;
}

export interface AdminContextType {
  // State
  users: UserProfile[];
  deletedUsers: DeletedUser[];
  issueReports: IssueReport[];
  analytics: SystemAnalytics | null;
  contentStats: ContentStats | null;
  loading: boolean;
  error: string | null;

  // User Management
  getAllUsers: () => Promise<UserProfile[]>;
  getDormantUsers: () => Promise<UserProfile[]>;
  deleteUser: (userId: string, reason?: string) => Promise<void>;
  restoreUser: (deletedUserId: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'learner' | 'admin') => Promise<void>;

  // Content Moderation
  getUnpublishedContent: () => Promise<{
    modules: Module[];
    lessons: Lesson[];
    exercises: Exercise[];
  }>;
  publishContent: (type: 'module' | 'lesson' | 'exercise', id: string) => Promise<void>;
  unpublishContent: (type: 'module' | 'lesson' | 'exercise', id: string) => Promise<void>;

  // Issue Management
  getIssueReports: (status?: string) => Promise<IssueReport[]>;
  createIssueReport: (
    issueType: string,
    title: string,
    description: string,
    priority?: string
  ) => Promise<IssueReport>;
  updateIssueStatus: (
    issueId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ) => Promise<void>;
  assignIssue: (issueId: string, assignedTo: string) => Promise<void>;

  // Analytics
  refreshAnalytics: () => Promise<void>;
  getContentStats: () => Promise<ContentStats>;
  getUserActivity: (days?: number) => Promise<UserActivity[]>;
  exportData: (type: 'users' | 'progress' | 'issues' | 'all') => Promise<void>;

  // Real-time Updates
  subscribeToIssues: () => () => void;
  subscribeToUsers: () => () => void;

  // Utilities
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AdminContext = createContext<AdminContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const { refreshModules } = useCurriculum();
  const isAdmin = (profile as any)?.is_admin === true || profile?.role === 'admin';

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([]);
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // realtime channels tracking not required by consumers; avoid unused-vars

  // Helper to attempt primary table then fallback to curriculum_ prefixed table
  const tableFallback = useCallback(async (primary: string, alt: string, fn: (table: string) => Promise<any>) => {
    try {
      const res = await fn(primary);
      if (!res || !res.error) return res;
      const msg = String(res.error?.message || res.error || '');
      if (/not found|does not exist|404|could not find the table/i.test(msg) || (res.error?.status === 404)) {
        const res2 = await fn(alt);
        return res2;
      }
      return res;
    } catch (e) {
      try {
        const res2 = await fn(alt);
        return res2;
      } catch (e2) {
        return { error: e2 };
      }
    }
  }, []);
  /**
   * Check admin access
   */
  const checkAdminAccess = useCallback(() => {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
  }, [isAdmin]);

  /**
   * Load initial admin data
   */
  useEffect(() => {
    if (!isAdmin || !user?.id) return;

    loadInitialData();

    const unsubIssues = subscribeToIssues();
    const unsubUsers = subscribeToUsers();

    return () => {
      try { unsubIssues(); } catch (_) { }
      try { unsubUsers(); } catch (_) { }
    };
  }, [isAdmin, user?.id, loadInitialData, subscribeToIssues, subscribeToUsers]);

  /**
   * Load all initial admin data
   */
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadUsers(),
        loadDeletedUsers(),
        loadIssueReports(),
        loadAnalytics(),
        loadContentStats(),
      ]);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadDeletedUsers, loadIssueReports, loadAnalytics, loadContentStats]);

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  /**
   * Load all users
   */
  const loadUsers = useCallback(async () => {
    try {
      const allUsers = await AdminService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }, []);

  /**
   * Get all users
   */
  const getAllUsers = useCallback(async (): Promise<UserProfile[]> => {
    checkAdminAccess();

    try {
      const allUsers = await AdminService.getAllUsers();
      setUsers(allUsers);
      return allUsers;
    } catch (err) {
      console.error('Error getting users:', err);
      throw err;
    }
  }, [checkAdminAccess]);

  /**
   * Get dormant users (90+ days inactive)
   */
  const getDormantUsers = useCallback(async (): Promise<UserProfile[]> => {
    checkAdminAccess();

    try {
      return await AdminService.getDormantUsers();
    } catch (err) {
      console.error('Error getting dormant users:', err);
      throw err;
    }
  }, [checkAdminAccess]);

  /**
   * Delete user account
   */
  const deleteUser = useCallback(async (userId: string, _reason?: string) => {
    checkAdminAccess();

    if (!user?.id) throw new Error('Admin user not found');

    try {
      setLoading(true);
      setError(null);

      await AdminService.deleteUser(userId, user.id, 'admin');

      // Refresh users list
      await loadUsers();
      await loadDeletedUsers();

    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, user?.id, loadUsers, loadDeletedUsers]);

  /**
   * Restore deleted user
   */
  const restoreUser = useCallback(async (deletedUserId: string) => {
    checkAdminAccess();

    try {
      setLoading(true);
      setError(null);

      // Get deleted user data from the view
      const { data: deletedUser, error: fetchError } = await supabase
        .from('deleted_users_view')
        .select('*')
        .eq('id', deletedUserId)
        .maybeSingle();

      if (fetchError || !deletedUser) {
        throw new Error('Deleted user not found');
      }

      // The view exposes `deletedBy` (admin UUID) when an admin performed the deletion.
      // If `deletedBy` is null, treat as self-deletion and do not allow restore via admin UI.
      const canRestore = !!(deletedUser.deletedBy);
      if (!canRestore) {
        throw new Error('This user cannot be restored');
      }

      // Restore user profile
      const { error: restoreError } = await supabase
        .from('user_profiles')
        .insert({
          id: deletedUser.user_id,
          uuid: deletedUser.uuid,
          username: deletedUser.username,
          email: deletedUser.email,
          role: 'learner',
          is_active: true,
          profile_data: null,
        });

      if (restoreError) throw restoreError;

      // Remove from deleted_users
      await supabase
        .from('deleted_users')
        .delete()
        .eq('id', deletedUserId);

      // Refresh lists
      await loadUsers();
      await loadDeletedUsers();

    } catch (err) {
      console.error('Error restoring user:', err);
      setError(err instanceof Error ? err.message : 'Failed to restore user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, loadUsers, loadDeletedUsers]);

  /**
   * Update user role
   */
  const updateUserRole = useCallback(async (userId: string, role: 'learner' | 'admin') => {
    checkAdminAccess();

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      // Refresh users
      await loadUsers();

    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, loadUsers]);

  /**
   * Load deleted users
   */
  const loadDeletedUsers = useCallback(async () => {
    try {
      const deleted = await AdminService.getDeletedUsers();
      setDeletedUsers(deleted);
    } catch (err) {
      console.error('Error loading deleted users:', err);
    }
  }, []);

  // ============================================================================
  // CONTENT MODERATION
  // ============================================================================

  /**
   * Get all unpublished content
   */
  const getUnpublishedContent = useCallback(async () => {
    checkAdminAccess();

    try {
      // Get all content (including unpublished) with table fallbacks
      const modRes = await tableFallback('modules', 'curriculum_modules', (t) =>
        supabase.from(t).select('*').eq('is_published', false)
      );
      const unpublishedModules = modRes.data;

      const lessonRes = await tableFallback('lessons', 'curriculum_lessons', (t) =>
        supabase.from(t).select('*').eq('is_published', false)
      );
      const unpublishedLessons = lessonRes.data;

      const exRes = await tableFallback('exercises', 'curriculum_exercises', (t) =>
        supabase.from(t).select('*').eq('is_published', false)
      );
      const unpublishedExercises = exRes.data;

      return {
        modules: unpublishedModules || [],
        lessons: unpublishedLessons || [],
        exercises: unpublishedExercises || [],
      };
    } catch (err) {
      console.error('Error getting unpublished content:', err);
      throw err;
    }
  }, [checkAdminAccess]);

  /**
   * Publish content
   */
  const publishContent = useCallback(async (
    type: 'module' | 'lesson' | 'exercise',
    id: string
  ) => {
    checkAdminAccess();

    try {
      setLoading(true);
      setError(null);

      const table = type === 'module' ? 'modules' : type === 'lesson' ? 'lessons' : 'exercises';

      const tPrimary = table;
      const tAlt = table === 'modules' ? 'curriculum_modules' : table === 'lessons' ? 'curriculum_lessons' : 'curriculum_exercises';
      const upRes = await tableFallback(tPrimary, tAlt, (t) =>
        supabase.from(t).update({ is_published: true }).eq('id', id)
      );
      if (upRes.error) throw upRes.error;

      // Refresh curriculum if needed
      if (type === 'module') {
        await refreshModules();
      }

    } catch (err) {
      console.error('Error publishing content:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, refreshModules]);

  /**
   * Unpublish content
   */
  const unpublishContent = useCallback(async (
    type: 'module' | 'lesson' | 'exercise',
    id: string
  ) => {
    checkAdminAccess();

    try {
      setLoading(true);
      setError(null);

      const table = type === 'module' ? 'modules' : type === 'lesson' ? 'lessons' : 'exercises';

      const tPrimary2 = table;
      const tAlt2 = table === 'modules' ? 'curriculum_modules' : table === 'lessons' ? 'curriculum_lessons' : 'curriculum_exercises';
      const unRes = await tableFallback(tPrimary2, tAlt2, (t) =>
        supabase.from(t).update({ is_published: false }).eq('id', id)
      );
      if (unRes.error) throw unRes.error;

      // Refresh curriculum
      if (type === 'module') {
        await refreshModules();
      }

    } catch (err) {
      console.error('Error unpublishing content:', err);
      setError(err instanceof Error ? err.message : 'Failed to unpublish content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, refreshModules]);

  // ============================================================================
  // ISSUE MANAGEMENT
  // ============================================================================

  /**
   * Load issue reports
   */
  const loadIssueReports = useCallback(async () => {
    try {
      const reports = await AdminService.getIssueReports();
      setIssueReports(reports);
    } catch (err) {
      console.error('Error loading issue reports:', err);
    }
  }, []);

  /**
   * Get issue reports
   */
  const getIssueReports = useCallback(async (status?: string): Promise<IssueReport[]> => {
    checkAdminAccess();

    try {
      const reports = await AdminService.getIssueReports(status);
      setIssueReports(reports);
      return reports;
    } catch (err) {
      console.error('Error getting issue reports:', err);
      throw err;
    }
  }, [checkAdminAccess]);

  /**
   * Create issue report
   */
  const createIssueReport = useCallback(async (
    issueType: string,
    title: string,
    description: string,
    priority: string = 'medium'
  ): Promise<IssueReport> => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);

      const report = await AdminService.createIssueReport(
        user.id,
        issueType,
        title,
        description,
        priority
      );

      // Refresh issue reports
      await loadIssueReports();

      return report;
    } catch (err) {
      console.error('Error creating issue report:', err);
      setError(err instanceof Error ? err.message : 'Failed to create issue report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadIssueReports]);

  /**
   * Update issue status
   */
  const updateIssueStatus = useCallback(async (
    issueId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ) => {
    checkAdminAccess();

    try {
      setLoading(true);
      setError(null);

      const updates: any = { status };

      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user?.id;
      }

      await AdminService.updateIssueReport(issueId, updates);

      // Refresh issue reports
      await loadIssueReports();

    } catch (err) {
      console.error('Error updating issue status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update issue status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, user?.id, loadIssueReports]);

  /**
   * Assign issue to admin
   */
  const assignIssue = useCallback(async (issueId: string, assignedTo: string) => {
    checkAdminAccess();

    try {
      setLoading(true);
      setError(null);

      await AdminService.updateIssueReport(issueId, {
        metadata: { assigned_to: assignedTo },
        status: 'in_progress',
      });

      // Refresh issue reports
      await loadIssueReports();

    } catch (err) {
      console.error('Error assigning issue:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign issue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkAdminAccess, loadIssueReports]);

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Load system analytics
   */
  const loadAnalytics = useCallback(async () => {
    try {
      const stats = await AdminService.getSystemAnalytics();

      // Get additional stats
      const tmRes = await tableFallback('modules', 'curriculum_modules', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true })
      );
      const totalModules = tmRes.count || 0;

      const tlRes = await tableFallback('lessons', 'curriculum_lessons', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true })
      );
      const totalLessons = tlRes.count || 0;

      const teRes = await tableFallback('exercises', 'curriculum_exercises', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true })
      );
      const totalExercises = teRes.count || 0;

      const { count: issuesOpen } = await supabase
        .from('issue_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      const { count: issuesResolved } = await supabase
        .from('issue_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved');

      setAnalytics({
        ...stats,
        totalModules: totalModules || 0,
        totalLessons: totalLessons || 0,
        totalExercises: totalExercises || 0,
        issuesOpen: issuesOpen || 0,
        issuesResolved: issuesResolved || 0,
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  }, []);

  /**
   * Refresh analytics
   */
  const refreshAnalytics = useCallback(async () => {
    checkAdminAccess();
    await loadAnalytics();
  }, [checkAdminAccess, loadAnalytics]);

  /**
   * Load content statistics
   */
  const loadContentStats = useCallback(async () => {
    try {
      const pubRes = await tableFallback('modules', 'curriculum_modules', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true }).eq('is_published', true)
      );
      const publishedModules = pubRes.count || 0;

      const draftRes = await tableFallback('modules', 'curriculum_modules', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true }).eq('is_published', false)
      );
      const draftModules = draftRes.count || 0;

      const totLRes = await tableFallback('lessons', 'curriculum_lessons', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true })
      );
      const totalLessons = totLRes.count || 0;

      const totERes = await tableFallback('exercises', 'curriculum_exercises', (t) =>
        supabase.from(t).select('*', { count: 'exact', head: true })
      );
      const totalExercises = totERes.count || 0;

      const totalModules = (publishedModules || 0) + (draftModules || 0);

      setContentStats({
        publishedModules: publishedModules || 0,
        draftModules: draftModules || 0,
        totalLessons: totalLessons || 0,
        totalExercises: totalExercises || 0,
        averageLessonsPerModule: totalModules > 0 ? Math.round((totalLessons || 0) / totalModules) : 0,
        averageExercisesPerModule: totalModules > 0 ? Math.round((totalExercises || 0) / totalModules) : 0,
      });
    } catch (err) {
      console.error('Error loading content stats:', err);
    }
  }, []);

  /**
   * Get content statistics
   */
  const getContentStats = useCallback(async (): Promise<ContentStats> => {
    checkAdminAccess();
    await loadContentStats();
    return contentStats || {
      publishedModules: 0,
      draftModules: 0,
      totalLessons: 0,
      totalExercises: 0,
      averageLessonsPerModule: 0,
      averageExercisesPerModule: 0,
    };
  }, [checkAdminAccess, contentStats, loadContentStats]);

  /**
   * Get user activity
   */
  const getUserActivity = useCallback(async (days: number = 30): Promise<UserActivity[]> => {
    checkAdminAccess();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Get user profiles with progress
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select(`
          id,
          username,
          last_login,
          is_active
        `)
        .order('last_login', { ascending: false });

      if (!profiles) return [];

      // Get progress for each user
      const activities: UserActivity[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('total_xp, level, completed_modules')
            .eq('user_id', profile.id)
            .maybeSingle();

          return {
            userId: profile.id,
            username: profile.username,
            lastLogin: profile.last_login,
            totalXP: progress?.total_xp || 0,
            level: progress?.level || 1,
            completedModules: progress?.completed_modules?.length || 0,
            lastActivity: profile.last_login,
            isActive: profile.is_active,
          };
        })
      );

      return activities;
    } catch (err) {
      console.error('Error getting user activity:', err);
      return [];
    }
  }, [checkAdminAccess]);

  /**
   * Export data
   */
  const exportData = useCallback(async (type: 'users' | 'progress' | 'issues' | 'all') => {
    checkAdminAccess();

    try {
      let exportData: any = {};

      if (type === 'users' || type === 'all') {
        exportData.users = users;
        exportData.deletedUsers = deletedUsers;
      }

      if (type === 'progress' || type === 'all') {
        const { data: allProgress } = await supabase
          .from('user_progress')
          .select('*');
        exportData.progress = allProgress;
      }

      if (type === 'issues' || type === 'all') {
        exportData.issues = issueReports;
      }

      if (type === 'all') {
        exportData.analytics = analytics;
        exportData.contentStats = contentStats;
      }

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin-export-${type}-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  }, [checkAdminAccess, users, deletedUsers, issueReports, analytics, contentStats]);

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  /**
   * Subscribe to issue report updates
   */
  const subscribeToIssues = useCallback(() => {
    if (!isAdmin) return () => { };

    const channel = supabase
      .channel('admin_issues')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_reports',
        },
        (payload) => {
          // Issue report updated (silent)
          loadIssueReports();
        }
      )
      .subscribe();

    // not tracking channels list to avoid unused state

    return () => {
      channel.unsubscribe();
    };
  }, [isAdmin, loadIssueReports]);

  /**
   * Subscribe to user updates
   */
  const subscribeToUsers = useCallback(() => {
    if (!isAdmin) return () => { };

    const channel = supabase
      .channel('admin_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profiles',
        },
        (payload) => {
          // User profile updated (silent)
          loadUsers();
        }
      )
      .subscribe();

    // not tracking channels list to avoid unused state

    return () => {
      channel.unsubscribe();
    };
  }, [isAdmin, loadUsers]);

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh all admin data
   */
  const refreshAll = useCallback(async () => {
    checkAdminAccess();
    await loadInitialData();
  }, [checkAdminAccess, loadInitialData]);

  const value: AdminContextType = {
    // State
    users,
    deletedUsers,
    issueReports,
    analytics,
    contentStats,
    loading,
    error,

    // User Management
    getAllUsers,
    getDormantUsers,
    deleteUser,
    restoreUser,
    updateUserRole,

    // Content Moderation
    getUnpublishedContent,
    publishContent,
    unpublishContent,

    // Issue Management
    getIssueReports,
    createIssueReport,
    updateIssueStatus,
    assignIssue,

    // Analytics
    refreshAnalytics,
    getContentStats,
    getUserActivity,
    exportData,

    // Real-time Updates
    subscribeToIssues,
    subscribeToUsers,

    // Utilities
    clearError,
    refreshAll,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access admin context
 * Must be used within AdminProvider
 */
export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }

  return context;
}
