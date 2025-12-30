import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase/client';
import { useProgress } from '../contexts/ProgressContext';
import { asDetailedModuleProgress } from '../utils/moduleProgressCompat';
import { useCertificates } from '../contexts/CertificateContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { toast } from 'sonner@2.0.3';
import {
  Trophy,
  Target,
  Calendar,
  Award,
  BookOpen,
  Code,
  Flame,
  User,
  ArrowLeft,
  Shield,
  Settings,
  Zap,
  Download,
  Activity,
  BarChart3,
  Check,
  RefreshCw
} from 'lucide-react';
import UserStreak from './UserStreak';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileProps {
  onNavigate: (screen: string) => void;
  userData?: any;
  onUpdateUserData?: any;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { profile } = useAuth();
  const {
    userProgress,
    moduleProgress,
    currentStreak,
    dailyActivity,
    loading: _progressLoading
  } = useProgress();
  void _progressLoading;

  const {
    certificates,
    downloadCertificate,
    loading: certificatesLoading,
  } = useCertificates();

  const {
    getUserEvents,
    getMostActiveTimeOfDay,
    getWeeklyActivity,
    getTimeSpentByModule,
  } = useAnalytics();

  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dailyActivityCountServer, setDailyActivityCountServer] = useState<number | null>(null);
  const [serverRecentActivity, setServerRecentActivity] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [achievementsCatalog, setAchievementsCatalog] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  /**
   * Load analytics data
   */
  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const [events, activeTime, weeklyActivity, timeByModule] = await Promise.all([
        getUserEvents(30),
        getMostActiveTimeOfDay(),
        getWeeklyActivity(),
        getTimeSpentByModule(),
      ]);

      setAnalyticsData({
        totalEvents: events.length,
        activeTime,
        weeklyActivity,
        timeByModule,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [getUserEvents, getMostActiveTimeOfDay, getWeeklyActivity, getTimeSpentByModule]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, loadAnalytics]);

  // Fetch authoritative lesson completions count from Supabase
  useEffect(() => {
    let mounted = true;

    async function fetchLessonCount() {
      if (!profile?.id) {
        setLessonsDone(0);
        return;
      }

      try {
        const res = await supabase
          .from('lesson_completions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        if (!mounted) return;
        setLessonsDone(res.count ?? 0);
      } catch (err) {
        // Failed to fetch lesson completions count (silent)
        if (mounted) setLessonsDone(0);
      }
    }

    void fetchLessonCount();

    // Also compute dailyActivityCount from completion tables (server-backed)
    async function fetchDailyActivityFromCompletions() {
      if (!profile?.id) {
        setDailyActivityCountServer(0);
        setServerRecentActivity([]);
        return;
      }

      try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        const cutoffIso = cutoff.toISOString();

        const [lessonsRes, exercisesRes, projectsRes] = await Promise.all([
          supabase
            .from('lesson_completions')
            .select('completed_at,lesson_title,xp_earned,module_id')
            .eq('user_id', profile.id)
            .gte('completed_at', cutoffIso)
            .order('completed_at', { ascending: false })
            .limit(500),
          supabase
            .from('exercise_completions')
            .select('completed_at,exercise_title,xp_earned,module_id')
            .eq('user_id', profile.id)
            .gte('completed_at', cutoffIso)
            .order('completed_at', { ascending: false })
            .limit(500),
          supabase
            .from('project_completions')
            .select('completed_at,project_title,xp_earned,module_id')
            .eq('user_id', profile.id)
            .gte('completed_at', cutoffIso)
            .order('completed_at', { ascending: false })
            .limit(500),
        ]);

        const rows: any[] = [];
        if (!lessonsRes.error && Array.isArray((lessonsRes as any).data)) rows.push(...(lessonsRes as any).data.map((r: any) => ({ type: 'lesson', activity_at: r.completed_at, title: r.lesson_title, points: r.xp_earned || 0, module_id: r.module_id })));
        if (!exercisesRes.error && Array.isArray((exercisesRes as any).data)) rows.push(...(exercisesRes as any).data.map((r: any) => ({ type: 'exercise', activity_at: r.completed_at, title: r.exercise_title, points: r.xp_earned || 0, module_id: r.module_id })));
        if (!projectsRes.error && Array.isArray((projectsRes as any).data)) rows.push(...(projectsRes as any).data.map((r: any) => ({ type: 'project', activity_at: r.completed_at, title: r.project_title, points: r.xp_earned || 0, module_id: r.module_id })));

        // compute distinct days with activity
        const daySet = new Set<string>();
        rows.forEach(r => {
          try {
            if (!r.activity_at) return;
            const d = new Date(r.activity_at);
            if (isNaN(d.getTime())) return;
            daySet.add(d.toISOString().slice(0, 10));
          } catch (e) { /* ignore */ }
        });

        // build recent activity feed (most recent 10 across tables)
        rows.sort((a, b) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime());

        setDailyActivityCountServer(daySet.size);
        setServerRecentActivity(rows.slice(0, 10));
      } catch (e) {
        setDailyActivityCountServer(0);
        setServerRecentActivity([]);
      }
    }

    void fetchDailyActivityFromCompletions();

    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail;
        if (!detail) return;
        if (detail.userId && detail.userId === profile.id) {
          void fetchLessonCount();
        }
      } catch (e) { /* ignore */ }
    };

    window.addEventListener('progressUpdated', handler as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('progressUpdated', handler as EventListener);
    };
  }, [profile?.id]);

  // Fetch user achievements (earned badges)
  useEffect(() => {
    let mounted = true;
    async function fetchBadges() {
      if (!profile?.id) {
        setEarnedBadges([]);
        return;
      }
      setBadgesLoading(true);
      try {
        const res = await supabase
          .from('user_achievements')
          .select('achievement_id, achievement_name, achievement_description, achievement_icon, xp_reward, earned_at')
          .eq('user_id', profile.id)
          .order('earned_at', { ascending: false })
          .limit(200);

        if (!mounted) return;
        if (!res.error && Array.isArray((res as any).data)) {
          setEarnedBadges((res as any).data as any[]);
        } else {
          setEarnedBadges([]);
        }
      } catch (e) {
        setEarnedBadges([]);
      } finally {
        if (mounted) setBadgesLoading(false);
      }
    }

    void fetchBadges();

    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail;
        if (!detail) return;
        if (detail.userId && detail.userId === profile.id) {
          void fetchBadges();
        }
      } catch (e) { /* ignore */ }
    };

    window.addEventListener('progressUpdated', handler as EventListener);
    return () => {
      mounted = false;
      window.removeEventListener('progressUpdated', handler as EventListener);
    };
  }, [profile?.id]);

  // Fetch achievements catalog (available badges)
  useEffect(() => {
    let mounted = true;
    async function fetchCatalog() {
      setAchievementsLoading(true);
      try {
        const res = await supabase
          .from('achievements')
          .select('id,name,description,icon,xp_reward,category')
          .order('created_at', { ascending: true });

        if (!mounted) return;
        if (!res.error && Array.isArray((res as any).data)) {
          setAchievementsCatalog((res as any).data as any[]);
        } else {
          setAchievementsCatalog([]);
        }
      } catch (e) {
        setAchievementsCatalog([]);
      } finally {
        if (mounted) setAchievementsLoading(false);
      }
    }

    void fetchCatalog();
    return () => { mounted = false; };
  }, []);

  // Compute upcoming badges as catalog minus earned
  const upcomingBadges = useMemo(() => {
    if (!achievementsCatalog || achievementsCatalog.length === 0) return [];
    const normalize = (s: any) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const earnedIds = new Set(earnedBadges.map(b => normalize(b.achievement_id)));
    const earnedNames = new Set(earnedBadges.map(b => normalize(b.achievement_name)));
    return achievementsCatalog.filter(a => {
      const aid = normalize(a.id);
      const aname = normalize(a.name || a.description || '');
      return !earnedIds.has(aid) && !earnedNames.has(aname);
    });
  }, [achievementsCatalog, earnedBadges]);

  // No inline body background — rely on global CSS variables for light/dark backgrounds.

  /**
   * Handle certificate download
   */
  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      await downloadCertificate(certificateId);
      toast.success('Certificate downloaded');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  /**
   * Get user initials
   */
  const getUserInitials = (username: string): string => {
    if (!username) return 'U';
    const words = username.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  };

  /**
   * Calculate XP to next level
   */
  const calculateXPToNextLevel = (level: number): number => {
    const baseXP = 100;
    const multiplier = 1.5;
    return Math.floor(baseXP * Math.pow(multiplier, level));
  };

  /**
   * Calculate progress percentage to next level
   */
  const calculateLevelProgress = (): number => {
    if (!userProgress) return 0;

    const currentLevelXP = calculateXPToNextLevel(userProgress.level - 1);
    const nextLevelXP = calculateXPToNextLevel(userProgress.level);
    const xpInCurrentLevel = userProgress.total_xp - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;

    return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100));
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const totalCompletedModules = (userProgress as any)?.completed_modules?.length || (userProgress as any)?.completedModules?.length || 0;
  const levelProgress = calculateLevelProgress();
  const xpToNextLevel = calculateXPToNextLevel(userProgress?.level || 1);
  const [lessonsDone, setLessonsDone] = useState<number>(0);

  return (
    <div className="min-h-screen bg-background p-6 text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => onNavigate('learning')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </div>
          <Button onClick={() => onNavigate('manage-account')}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Account
          </Button>
        </div>

        {/* Profile Header (centered hero) */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-[var(--primary)] via-[var(--primary-light)] to-[var(--accent)] rounded-full flex items-center justify-center shadow-lg">
              <div className="w-20 h-20 bg-[var(--background-solid)] rounded-full flex items-center justify-center">
                <div className="text-3xl font-bold text-[var(--primary-foreground)]">
                  {getUserInitials(profile.username)}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center border-4 border-[var(--background-solid)] shadow-lg">
              <User className="w-4 h-4 text-[var(--primary-foreground)]" />
            </div>
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
              <Trophy className="w-3 h-3 text-white" />
            </div>
          </div>

          <h1 className="text-3xl mb-2 font-extrabold">{profile.username}</h1>
          <p className="text-muted-foreground mb-4">{(profile as any)?.bio || 'Java Programming Enthusiast'}</p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <Badge className={`px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)]`}>{/* level label */}
              {userProgress?.level || 'Beginner'} Developer
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </Badge>
          </div>

          {/* Security Notice */}
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-[var(--secondary)] border border-[var(--border)] rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--primary)]">Security Notice</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Only one device can be logged in per session. Logging in from another device will automatically sign you out from this one.
              </p>
              <div className="mt-2 pt-2 border-t border-[var(--border)]">
                <p className="text-xs text-muted-foreground">Password created: {new Date(profile.created_at).toLocaleDateString()} at {new Date(profile.created_at).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Removed duplicate Manage Account button (header now handles navigation) */}
        </div>

        {/* Top stat cards (visual only) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] dark:ring-[var(--ring)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="text-4xl font-bold text-yellow-400 mb-1">{userProgress?.total_xp || 0}</div>
              <p className="text-sm text-muted-foreground">Total XP Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] dark:ring-[var(--ring)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mb-3">
                <Trophy className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-1">{earnedBadges.length || 0}</div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] dark:ring-[var(--ring)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mb-3">
                <Flame className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="mb-1">
                <UserStreak userId={profile.id} showHeader={false} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] dark:ring-[var(--ring)]">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-[var(--primary)]/20 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-1">{lessonsDone}</div>
              <p className="text-sm text-muted-foreground">Lessons Done</p>
            </CardContent>
          </Card>
        </div>

        {/* My Achievements (single view) */}
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earned Badges */}
            <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] dark:ring-[var(--ring)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Earned Badges
                </CardTitle>
                <CardDescription>Your collection of achievement badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* First Steps (example earned badge) */}
                  {badgesLoading && <div className="text-sm text-muted-foreground">Loading badges...</div>}
                  {!badgesLoading && earnedBadges.length === 0 && (
                    <div className="text-sm text-muted-foreground">No badges earned yet</div>
                  )}

                  {!badgesLoading && earnedBadges.map((b) => (
                    <div key={b.achievement_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center text-2xl">{b.achievement_icon || '🏆'}</div>
                        <div>
                          <div className="font-semibold">{b.achievement_name}</div>
                          <div className="text-sm text-muted-foreground">{b.achievement_description}</div>
                          <div className="text-xs text-muted-foreground">Earned {new Date(b.earned_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{b.xp_reward ? `${b.xp_reward} XP` : 'Badge'}</Badge>
                    </div>
                  ))}

                  {/* You can add other earned badges here using the same pattern */}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Badges */}
            <Card className="bg-[var(--card)] text-[var(--card-foreground)] rounded-xl shadow-2xl ring-1 ring-[var(--border)] dark:ring-[var(--ring)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Upcoming Badges
                </CardTitle>
                <CardDescription>Badges you can earn next</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievementsLoading && <div className="text-sm text-muted-foreground">Loading available badges...</div>}
                  {!achievementsLoading && upcomingBadges.length === 0 && (
                    <div className="text-sm text-muted-foreground">No upcoming badges</div>
                  )}

                  {!achievementsLoading && upcomingBadges.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-4 border rounded-lg opacity-90">
                      <div>
                        <div className="font-semibold">{a.name}</div>
                        <div className="text-sm text-muted-foreground">{a.description}</div>
                        <div className="text-xs text-muted-foreground">Category: {a.category || 'General'}</div>
                      </div>
                      <Badge variant="outline">{a.xp_reward ? `${a.xp_reward} XP` : 'Badge'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
