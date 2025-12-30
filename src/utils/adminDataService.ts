import { ProgressManager } from './progressManager';
import { supabase } from './supabase/client';
import { supabaseCall } from './supabase/withRetries';
import { javaCurriculum, getModuleById } from '../data/javaCurriculum';
import { accountInfoManager } from './accountInfoManager';

export interface AdminUserData {
  userId: string;
  username: string;
  level: string;
  points: number;
  completedModules: number;
  currentModule: string;
  lastActive: string;
  joinDate: string;
  totalXP: number;
  avgScore: number;
}

export interface AdminSessionData {
  userId: string;
  username: string;
  deviceId: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  duration: string;
  status: 'active' | 'idle';
}

export interface AdminModulePerformance {
  moduleId: string;
  moduleName: string;
  totalUsers: number;
  completedUsers: number;
  inProgressUsers: number;
  avgProgress: number;
  avgScore: number;
  difficulty: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalModules: number;
  totalLessons: number;
  avgCompletionRate: number;
  avgScore: number;
  totalXPEarned: number;
}

export interface AdminUserActivity {
  month: string;
  newUsers: number;
  activeUsers: number;
  completions: number;
}

export class AdminDataService {
  // Get all users from localStorage
  // SUPABASE TODO: Query from users table with joined progress data
  static getAllUsers(): AdminUserData[] {
    try {
      if (typeof window === 'undefined') return [];

      // DISABLED FOR SUPABASE MIGRATION
      // const users: AdminUserData[] = [];
      // const progressKey = 'study_buddy_progress';
      // const progressData = localStorage.getItem(progressKey);

      // if (!progressData) return [];

      // const allProgress: { [userId: string]: EnhancedUserProgress & { lastUpdated?: string } } = JSON.parse(progressData);

      // for (const [userId, userProgress] of Object.entries(allProgress)) {
      //   // Skip admin user
      //   if (userId === 'YCW-158-KA-4678') continue;
      //   
      //   // Get username from UserIdAssignmentService (primary source)
      //   let username = 'Unknown User';
      //   
      //   // Try to get from UserIdAssignmentService first
      //   const userMapping = UserIdAssignmentService.getUserMapping(userId);
      //   if (userMapping && userMapping.username) {
      //     username = userMapping.username;
      //   } else {
      //     // Fallback: Try to get from active session
      //     const activeSession = localStorage.getItem('active_session');
      //     if (activeSession) {
      //       const session = JSON.parse(activeSession);
      //       if (session.userId === userId) {
      //         username = session.username;
      //       }
      //     }
      //   }
      //   
      //   // Calculate level based on 100% module completion using the same logic as the app
      //   const completedModulesCount = userProgress.completedModules?.length || 0;
      //   let level = 'Beginner';
      //   
      //   // Use the same shouldLevelUp logic to determine user's actual level
      //   let currentLevel = 'Beginner';
      //   let iterations = 0;
      //   const MAX_ITERATIONS = 3; // Max 3 levels
      //   
      //   let newLevel = shouldLevelUp(currentLevel, userProgress);
      //   while (newLevel && iterations < MAX_ITERATIONS) {
      //     currentLevel = newLevel;
      //     newLevel = shouldLevelUp(currentLevel, userProgress);
      //     iterations++;
      //   }
      //   level = currentLevel;
      //   
      //   // Calculate total XP from daily activity
      //   let totalXP = completedModulesCount * 150; // Base XP for modules
      //   if (userProgress.dailyActivity) {
      //     totalXP += Object.values(userProgress.dailyActivity).reduce((sum, day) => sum + day.totalXP, 0);
      //   }
      //   
      //   // Calculate points
      //   const points = totalXP;
      //   
      //   // Get current module
      //   const currentModuleName = userProgress.currentModule 
      //     ? getModuleById(userProgress.currentModule)?.title || 'None'
      //     : 'None';
      //   
      //   // Get last active date
      //   const lastActive = userProgress.lastUpdated 
      //     ? new Date(userProgress.lastUpdated).toLocaleDateString()
      //     : 'Unknown';
      //   
      //   // Estimate join date (we don't track this, so use first activity date)
      //   let joinDate = 'Unknown';
      //   if (userProgress.dailyActivity) {
      //     const dates = Object.keys(userProgress.dailyActivity).sort();
      //     if (dates.length > 0) {
      //       joinDate = new Date(dates[0]).toLocaleDateString();
      //     }
      //   }
      //   
      //   // Calculate average score (mock for now, would need assessment data)
      //   const avgScore = 70 + Math.floor(Math.random() * 25); // 70-95
      //   
      //   users.push({
      //     userId,
      //     username,
      //     level,
      //     points,
      //     completedModules: completedModulesCount,
      //     currentModule: currentModuleName,
      //     lastActive,
      //     joinDate,
      //     totalXP,
      //     avgScore
      //   });
      // }

      return [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Get all active sessions
  static getAllSessions(): AdminSessionData[] {
    // Local session tracking has been removed. Admin session lists must be
    // sourced from the server-side `user_sessions` table or Supabase analytics.
    // For now, return an explicit empty list to avoid any local fallbacks.
    return [];
  }

  // Get module performance statistics
  // SUPABASE TODO: Query from user_progress table with module analytics
  static getModulePerformance(): AdminModulePerformance[] {
    try {
      const users = this.getAllUsers();
      const totalUsers = users.length;

      if (totalUsers === 0) {
        // Return mock data if no users
        return javaCurriculum.slice(0, 5).map(module => ({
          moduleId: module.id,
          moduleName: module.title,
          totalUsers: 0,
          completedUsers: 0,
          inProgressUsers: 0,
          avgProgress: 0,
          avgScore: 0,
          difficulty: module.category
        }));
      }

      // DISABLED FOR SUPABASE MIGRATION
      // // Get progress data
      // const progressKey = 'study_buddy_progress';
      // const progressData = localStorage.getItem(progressKey);
      // if (!progressData) return [];

      // const allProgress: { [userId: string]: EnhancedUserProgress } = JSON.parse(progressData);

      // return javaCurriculum.map(module => {
      //   let completedUsers = 0;
      //   let inProgressUsers = 0;
      //   let totalProgress = 0;

      //   for (const userProgress of Object.values(allProgress)) {
      //     // Skip admin
      //     const userId = Object.keys(allProgress).find(key => allProgress[key] === userProgress);
      //     if (userId === 'YCW-158-KA-4678') continue;

      //     if (userProgress.completedModules?.includes(module.id)) {
      //       completedUsers++;
      //       totalProgress += 100;
      //     } else if (userProgress.moduleProgress?.[module.id]) {
      //       inProgressUsers++;
      //       const progress = userProgress.moduleProgress[module.id];
      //       if (typeof progress === 'number') {
      //         totalProgress += progress;
      //       } else if (progress && typeof progress === 'object') {
      //         // Calculate progress from detailed progress
      //         const lessons = (progress.completedLessons?.length || 0);
      //         const exercises = (progress.completedExercises?.length || 0);
      //         const project = progress.projectCompleted ? 1 : 0;
      //         const total = module.lessons.length + 5 + 1; // lessons + exercises + project
      //         const completed = lessons + exercises + project;
      //         // Prevent division by zero
      //         if (total > 0) {
      //           const calculated = (completed / total) * 100;
      //           totalProgress += isFinite(calculated) ? Math.min(100, calculated) : 0;
      //         }
      //       }
      //     }
      //   }

      //   const usersEngaged = completedUsers + inProgressUsers;
      //   // Prevent division by zero
      //   let avgProgress = 0;
      //   if (usersEngaged > 0) {
      //     const calculated = totalProgress / usersEngaged;
      //     avgProgress = isFinite(calculated) ? Math.round(calculated) : 0;
      //   }

      //   return {
      //     moduleId: module.id,
      //     moduleName: module.title,
      //     totalUsers: totalUsers,
      //     completedUsers,
      //     inProgressUsers,
      //     avgProgress,
      //     avgScore: 70 + Math.floor(Math.random() * 25), // Mock score
      //     difficulty: module.category
      //   };
      // });

      return javaCurriculum.slice(0, 5).map(module => ({
        moduleId: module.id,
        moduleName: module.title,
        totalUsers: 0,
        completedUsers: 0,
        inProgressUsers: 0,
        avgProgress: 0,
        avgScore: 0,
        difficulty: module.category
      }));
    } catch (error) {
      console.error('Error getting module performance:', error);
      return [];
    }
  }

  // Get overall statistics
  static getStats(): AdminStats {
    try {
      const users = this.getAllUsers();
      const sessions = this.getAllSessions();

      const totalUsers = users.length;
      const activeUsers = sessions.filter(s => s.status === 'active').length;

      const totalModules = javaCurriculum.length;
      const totalLessons = javaCurriculum.reduce((sum, module) => sum + module.lessons.length, 0);

      // Calculate average completion rate - prevent division by zero
      const totalCompletions = users.reduce((sum, user) => sum + user.completedModules, 0);
      let avgCompletionRate = 0;
      if (totalUsers > 0 && totalModules > 0) {
        const denominator = totalUsers * totalModules;
        const calculated = (totalCompletions / denominator) * 100;
        avgCompletionRate = isFinite(calculated) ? Math.round(calculated) : 0;
      }

      // Calculate average score - prevent division by zero
      let avgScore = 0;
      if (totalUsers > 0) {
        const totalScore = users.reduce((sum, user) => sum + user.avgScore, 0);
        const calculated = totalScore / totalUsers;
        avgScore = isFinite(calculated) ? Math.round(calculated) : 0;
      }

      // Calculate total XP earned
      const totalXPEarned = users.reduce((sum, user) => sum + user.totalXP, 0);

      return {
        totalUsers,
        activeUsers,
        totalModules,
        totalLessons,
        avgCompletionRate,
        avgScore,
        totalXPEarned
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalModules: javaCurriculum.length,
        totalLessons: javaCurriculum.reduce((sum, module) => sum + module.lessons.length, 0),
        avgCompletionRate: 0,
        avgScore: 0,
        totalXPEarned: 0
      };
    }
  }

  // Get user activity data (for charts)
  // SUPABASE TODO: Query from analytics table with date ranges
  static getUserActivity(): AdminUserActivity[] {
    try {
      // DISABLED FOR SUPABASE MIGRATION
      // const progressKey = 'study_buddy_progress';
      // const progressData = localStorage.getItem(progressKey);

      // if (!progressData) {
      // Return empty data for last 5 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
      return months.map(month => ({
        month,
        newUsers: 0,
        activeUsers: 0,
        completions: 0
      }));
      // }

      // const allProgress: { [userId: string]: EnhancedUserProgress & { lastUpdated?: string } } = JSON.parse(progressData);

      // // Get last 5 months
      // const now = new Date();
      // const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // const months: AdminUserActivity[] = [];

      // for (let i = 4; i >= 0; i--) {
      //   const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      //   const monthName = monthNames[date.getMonth()];

      //   let newUsers = 0;
      //   let activeUsers = 0;
      //   let completions = 0;

      //   for (const [userId, userProgress] of Object.entries(allProgress)) {
      //     // Skip admin
      //     if (userId === 'YCW-158-KA-4678') continue;

      //     // Check if user was active this month
      //     if (userProgress.lastUpdated) {
      //       const lastUpdate = new Date(userProgress.lastUpdated);
      //       if (lastUpdate.getMonth() === date.getMonth() && 
      //           lastUpdate.getFullYear() === date.getFullYear()) {
      //         activeUsers++;
      //       }
      //     }

      //     // Check for new users (approximation based on daily activity)
      //     if (userProgress.dailyActivity) {
      //       const dates = Object.keys(userProgress.dailyActivity);
      //       const firstDate = dates.sort()[0];
      //       if (firstDate) {
      //         const joinDate = new Date(firstDate);
      //         if (joinDate.getMonth() === date.getMonth() && 
      //             joinDate.getFullYear() === date.getFullYear()) {
      //           newUsers++;
      //         }
      //       }
      //     }

      //     // Count completions in this month
      //     completions += userProgress.completedModules?.length || 0;
      //   }

      //   months.push({
      //     month: monthName,
      //     newUsers,
      //     activeUsers,
      //     completions: Math.floor(completions / 5) // Distribute across months
      //   });
      // }

      return [];
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  // Get assessment results (placeholder - would need real assessment tracking)
  static getAssessmentResults() {
    const users = this.getAllUsers();

    return users.map(user => ({
      userId: user.userId,
      username: user.username,
      assessmentsPassed: Math.floor(user.completedModules * 0.8),
      assessmentsFailed: Math.floor(user.completedModules * 0.2),
      avgScore: user.avgScore,
      lastAssessment: user.lastActive
    }));
  }

  // Get system alerts
  static getSystemAlerts() {
    const users = this.getAllUsers();
    const sessions = this.getAllSessions();
    const alerts: Array<{ id: string, type: string, message: string, time: string }> = [];

    // Check for inactive users
    const inactiveCount = users.filter(user => {
      try {
        const lastActive = new Date(user.lastActive);
        // Check if valid date
        if (isNaN(lastActive.getTime())) return false;
        const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return isFinite(daysSince) && daysSince > 7;
      } catch (error) {
        return false;
      }
    }).length;

    if (inactiveCount > 0) {
      alerts.push({
        id: 'alert-inactive-users',
        type: 'warning',
        message: `${inactiveCount} users inactive for over 7 days`,
        time: 'Just now'
      });
    }

    // Check for struggling students
    const strugglingCount = users.filter(user => user.avgScore < 60).length;
    if (strugglingCount > 0) {
      alerts.push({
        id: 'alert-struggling-students',
        type: 'warning',
        message: `${strugglingCount} students with average score below 60%`,
        time: '5 minutes ago'
      });
    }

    // System health
    if (sessions.length > 0) {
      alerts.push({
        id: 'alert-system-health',
        type: 'success',
        message: `System running smoothly - ${sessions.length} active sessions`,
        time: '10 minutes ago'
      });
    }

    return alerts;
  }
}

// Async wrappers to ease migration to Supabase-backed calls
export namespace AdminDataServiceAsync {
  export async function getAllUsersAsync(): Promise<AdminUserData[]> {
    try {
      // Try to fetch user profiles from Supabase
      const profiles = await supabaseCall(() => supabase.from('user_profiles').select('id, username, created_at, level'), { retries: 2, timeoutMs: 4000 }).catch(() => null) as any[] | null;

      // Get progress records from ProgressManager (async) as the canonical source for analytics
      const progressUsers = await ProgressManager.getAllUsersAsync();
      // Also fetch any explicit `current_level` values stored on the `user_progress` table
      // so we can prefer that authoritative level when presenting user profiles.
      const progressLevelRows = await supabaseCall(() => supabase.from('user_progress').select('user_id, current_level'), { retries: 1, timeoutMs: 3000 }).catch(() => null) as any[] | null;
      const progressLevelMap: Record<string, string> = {};
      if (Array.isArray(progressLevelRows)) {
        progressLevelRows.forEach(r => {
          if (r && r.user_id) progressLevelMap[r.user_id] = r.current_level || '';
        });
      }

      // Map progress-backed users first
      const usersFromProgress: AdminUserData[] = await Promise.all(progressUsers.map(async (u) => {
        let profile = profiles?.find(p => p.id === u.userId) || null;
        if (!profile) {
          // Try to enrich from accountInfoManager as a fallback
          const acct = await accountInfoManager.getAccountInfoAsync(u.userId).catch(() => null);
          if (acct) profile = { id: acct.userCode, username: acct.username, created_at: acct.accountCreated } as any;
        }

        const completedModules = u.progress?.completedModules?.length || 0;
        const totalXP = u.progress && u.progress.dailyActivity ? Object.values((u.progress as any).dailyActivity).reduce((sum: number, day: any) => sum + (day.totalXP || 0), 0) : 0;
        const avgScore = await ProgressManager.getAverageAssessmentScoreAsync(u.userId).catch(() => 0);
        const currentModule = u.progress?.currentModule ? getModuleById(u.progress.currentModule)?.title || 'Unknown' : 'None';
        const lastActive = u.lastUpdated ? new Date(u.lastUpdated).toLocaleDateString() : 'Unknown';

        // Prefer explicit current_level from user_progress table when available,
        // otherwise fall back to legacy completed-modules logic.
        let level = (progressLevelMap[u.userId] && progressLevelMap[u.userId].trim())
          ? progressLevelMap[u.userId]
          : (completedModules > 8 ? 'Advanced' : completedModules > 3 ? 'Learner' : 'Beginner');

        // Determine join date from earliest dailyActivity key
        let joinDate = 'Unknown';
        try {
          const days = u.progress?.dailyActivity ? Object.keys((u.progress as any).dailyActivity).sort() : [];
          if (days.length > 0) joinDate = new Date(days[0]).toLocaleDateString();
        } catch (_) { }

        return {
          userId: u.userId,
          username: profile?.username || (u as any).username || 'Unknown',
          // Prefer level stored on the user_profiles row, then user_progress.current_level,
          // then fall back to completed-modules heuristic.
          level: (profile?.level && String(profile.level).trim()) ? String(profile.level) : level,
          points: totalXP,
          completedModules,
          currentModule,
          lastActive,
          joinDate,
          totalXP,
          avgScore
        } as AdminUserData;
      }));

      // If there are profiles without progress, include them so newly created accounts appear
      try {
        const progressIds = new Set(progressUsers.map(pu => pu.userId));
        if (profiles && Array.isArray(profiles) && profiles.length > 0) {
          for (const p of profiles) {
            if (!progressIds.has(p.id)) {
              usersFromProgress.push({
                userId: p.id,
                username: p.username || 'Unknown',
                level: (p.level && String(p.level).trim()) ? String(p.level) : ((progressLevelMap[p.id] && progressLevelMap[p.id].trim()) ? progressLevelMap[p.id] : 'Beginner'),
                points: 0,
                completedModules: 0,
                currentModule: 'None',
                lastActive: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Unknown',
                joinDate: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Unknown',
                totalXP: 0,
                avgScore: 0
              });
            }
          }
        }
      } catch (e) {
        // Non-fatal enrichment failure — proceed with progress-backed users (silent)
      }

      return usersFromProgress;
    } catch (err) {
      console.error('AdminDataServiceAsync.getAllUsersAsync failed:', err);
      return [];
    }
  }

  export async function getAllSessionsAsync(): Promise<AdminSessionData[]> {
    try {
      // Try Supabase sessions table first
      const rows = await supabaseCall(() => supabase.from('user_sessions').select('user_id, username, device_id, login_time, last_activity, ip_address, user_agent'), { retries: 2, timeoutMs: 4000 }).catch(() => null) as any[] | null;
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows.map(r => ({
          userId: r.user_id,
          username: r.username,
          deviceId: r.device_id,
          loginTime: r.login_time ? new Date(r.login_time) : new Date(),
          lastActivity: r.last_activity ? new Date(r.last_activity) : new Date(),
          ipAddress: r.ip_address || 'unknown',
          userAgent: r.user_agent || 'unknown',
          duration: (() => {
            try {
              const now = Date.now();
              const login = r.login_time ? new Date(r.login_time).getTime() : now;
              const ms = now - login;
              const hours = Math.floor(ms / (1000 * 60 * 60));
              const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
              return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            } catch (_) { return '0m'; }
          })(),
          status: (() => {
            try {
              const now = Date.now();
              const last = r.last_activity ? new Date(r.last_activity).getTime() : now;
              return (now - last) < 5 * 60 * 1000 ? 'active' : 'idle';
            } catch (_) { return 'idle'; }
          })()
        }));
      }

      // Local session fallback removed — admin session lists must be sourced
      // from server-side analytics. Return empty array to avoid silent fallbacks.
      return [];
    } catch (err) {
      console.error('AdminDataServiceAsync.getAllSessionsAsync failed:', err);
      return [];
    }
  }

  export async function getModulePerformanceAsync(): Promise<AdminModulePerformance[]> {
    try {
      const users = await ProgressManager.getAllUsersAsync();
      const totalUsers = users.length;

      if (totalUsers === 0) {
        return javaCurriculum.slice(0, 5).map(module => ({
          moduleId: module.id,
          moduleName: module.title,
          totalUsers: 0,
          completedUsers: 0,
          inProgressUsers: 0,
          avgProgress: 0,
          avgScore: 0,
          difficulty: module.category
        }));
      }

      return javaCurriculum.map(module => {
        let completedUsers = 0;
        let inProgressUsers = 0;
        let totalProgress = 0;

        for (const user of users) {
          if (user.progress?.completedModules?.includes(module.id)) {
            completedUsers++;
            totalProgress += 100;
          } else if (user.progress?.moduleProgress?.[module.id]) {
            inProgressUsers++;
            const prog = user.progress.moduleProgress[module.id];
            if (typeof prog === 'number') {
              totalProgress += prog;
            } else if (prog && typeof prog === 'object') {
              // approximate progress
              const lessonsDone = (prog.completedLessons?.length || 0);
              const exercisesDone = (prog.completedExercises?.length || 0);
              const projectDone = prog.projectCompleted ? 1 : 0;
              const total = module.lessons.length + 5 + 1;
              if (total > 0) {
                const calc = (lessonsDone + exercisesDone + projectDone) / total * 100;
                totalProgress += isFinite(calc) ? Math.min(100, Math.round(calc)) : 0;
              }
            }
          }
        }

        const usersEngaged = completedUsers + inProgressUsers;
        const avgProgress = usersEngaged > 0 ? Math.round(totalProgress / usersEngaged) : 0;

        return {
          moduleId: module.id,
          moduleName: module.title,
          totalUsers,
          completedUsers,
          inProgressUsers,
          avgProgress,
          avgScore: 0,
          difficulty: module.category
        };
      });
    } catch (err) {
      console.error('AdminDataServiceAsync.getModulePerformanceAsync failed:', err);
      return [];
    }
  }

  export async function getStatsAsync(): Promise<AdminStats> {
    try {
      const agg = await ProgressManager.getAggregateAnalyticsAsync().catch(() => null);
      // Prefer aggregate analytics when available, but ensure `totalUsers`
      // reflects the authoritative number of accounts in `user_profiles`.
      // Query the `user_profiles` table directly for an accurate count and
      // then merge with aggregated progress-based metrics when present.
      const profiles = await supabaseCall(() => supabase.from('user_profiles').select('id'), { retries: 1, timeoutMs: 3000 }).catch(() => null) as any[] | null;
      const profileCount = Array.isArray(profiles) ? profiles.length : null;

      if (agg) {
        return {
          totalUsers: profileCount ?? agg.totalUsers,
          activeUsers: agg.activeUsers,
          totalModules: javaCurriculum.length,
          totalLessons: javaCurriculum.reduce((s, m) => s + m.lessons.length, 0),
          avgCompletionRate: Math.round(agg.averageProgress || 0),
          avgScore: Math.round(agg.averageAssessmentScore || 0),
          totalXPEarned: agg.totalXP || 0
        };
      }

      // If no aggregated progress metrics are available, still return a
      // stats object using the authoritative `user_profiles` count when possible.
      if (profileCount !== null) {
        return {
          totalUsers: profileCount,
          activeUsers: 0,
          totalModules: javaCurriculum.length,
          totalLessons: javaCurriculum.reduce((s, m) => s + m.lessons.length, 0),
          avgCompletionRate: 0,
          avgScore: 0,
          totalXPEarned: 0
        };
      }

      // Fallback to synchronous calculation
      return AdminDataService.getStats();
    } catch (err) {
      console.error('AdminDataServiceAsync.getStatsAsync failed:', err);
      return AdminDataService.getStats();
    }
  }

  export async function getUserActivityAsync(): Promise<AdminUserActivity[]> {
    try {
      // Compute last 5 months activity from canonical tables: user_profiles (new users)
      // and user_progress (activity + completions). This avoids relying on a separate
      // analytics materialized view/table which may not exist in some environments.
      const now = new Date();
      const months: AdminUserActivity[] = [];

      for (let i = 4; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

        // Format short month label like 'Jan'
        const monthLabel = start.toLocaleString('default', { month: 'short' });

        // Query new users created in that month
        const newUsersRes = await supabaseCall(() => supabase
          .from('user_profiles')
          .select('id')
          .gte('account_created_at', start.toISOString())
          .lt('account_created_at', end.toISOString()), { retries: 1, timeoutMs: 3000 }).catch(() => null) as any[] | null;

        const newUsers = Array.isArray(newUsersRes) ? newUsersRes.length : 0;

        // Query active users by checking user_progress.updated_at or last_activity_date within the month
        const activeRes = await supabaseCall(() => supabase
          .from('user_progress')
          .select('user_id')
          .gte('updated_at', start.toISOString())
          .lt('updated_at', end.toISOString()), { retries: 1, timeoutMs: 3000 }).catch(() => null) as any[] | null;

        const activeUsers = Array.isArray(activeRes) ? new Set(activeRes.map((r: any) => r.user_id)).size : 0;

        // Query completions: sum modules_completed for rows updated in the month
        const completionsRes = await supabaseCall(() => supabase
          .from('user_progress')
          .select('modules_completed')
          .gte('updated_at', start.toISOString())
          .lt('updated_at', end.toISOString()), { retries: 1, timeoutMs: 3000 }).catch(() => null) as any[] | null;

        let completions = 0;
        if (Array.isArray(completionsRes)) {
          for (const row of completionsRes) {
            const v = Number(row?.modules_completed || 0);
            if (Number.isFinite(v)) completions += v;
          }
        }

        months.push({ month: monthLabel, newUsers, activeUsers, completions });
      }

      return months;
    } catch (err) {
      console.error('AdminDataServiceAsync.getUserActivityAsync failed:', err);
      return AdminDataService.getUserActivity();
    }
  }

  export async function getAssessmentResultsAsync() {
    try {
      // Leverage ProgressManager sync accessor after ensuring cache fetch
      await ProgressManager.fetchAllProgressFromServer().catch(() => null);
      return AdminDataService.getAssessmentResults();
    } catch (err) {
      console.error('AdminDataServiceAsync.getAssessmentResultsAsync failed:', err);
      return AdminDataService.getAssessmentResults();
    }
  }

  export async function getSystemAlertsAsync() {
    try {
      const users = await getAllUsersAsync();
      const sessions = await getAllSessionsAsync();
      const alerts: Array<{ id: string, type: string, message: string, time: string }> = [];

      const inactiveCount = users.filter(user => {
        try {
          const lastActive = new Date(user.lastActive);
          if (isNaN(lastActive.getTime())) return false;
          const daysSince = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
          return isFinite(daysSince) && daysSince > 7;
        } catch (e) { return false; }
      }).length;

      if (inactiveCount > 0) {
        alerts.push({ id: 'alert-inactive-users', type: 'warning', message: `${inactiveCount} users inactive for over 7 days`, time: 'Just now' });
      }

      const strugglingCount = users.filter(u => u.avgScore < 60).length;
      if (strugglingCount > 0) {
        alerts.push({ id: 'alert-struggling-students', type: 'warning', message: `${strugglingCount} students with average score below 60%`, time: '5 minutes ago' });
      }

      if (sessions.length > 0) {
        alerts.push({ id: 'alert-system-health', type: 'success', message: `System running smoothly - ${sessions.length} active sessions`, time: '10 minutes ago' });
      }

      return alerts;
    } catch (err) {
      console.error('AdminDataServiceAsync.getSystemAlertsAsync failed:', err);
      return AdminDataService.getSystemAlerts();
    }
  }
}