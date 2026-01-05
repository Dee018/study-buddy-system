// Java Study Buddy - Main Application Component
import React, { useEffect, useCallback, useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Welcome } from './components/Welcome';
import { LearningHub } from './components/LearningHub';
import { Assessment } from './components/Assessment';
import { ProgressTracker } from './components/ProgressTracker';
import { Profile } from './components/Profile';
import { ChatAssistant } from './components/ChatAssistant';
import { XPPopup } from './components/XPPopup';
import { AdminPanel } from './components/AdminPanel';
import { ManageAccount } from './components/ManageAccount';
import { ReportIssue } from './components/ReportIssue';
import { About } from './components/About';
import { HelpCenter } from './components/HelpCenter';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfUse } from './components/TermsOfUse';
import { ContactUs } from './components/ContactUs';
import { BackToTop } from './components/BackToTop';
import {
  Target,
  LineChart,
  UserCheck,
  Bot,
  Info,
  HelpCircle,
  Flag,
  Mail
} from 'lucide-react';




// Context Providers
// Context providers are mounted at a higher level elsewhere; not used here

import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './components/ui/alert-dialog';
import { Toaster } from 'sonner';
import ResetPassword from './components/ResetPassword';
import Login from './components/Login';
// Note: sessionManager fallback removed to ensure Supabase is treated as authoritative
import { ProgressManager } from './utils/progressManager';
import { AutoSaveManager } from './utils/autoSaveManager';
import { AuthService } from './utils/supabase/dataService';
import ProgressSyncManager from './utils/progressSyncManager';
import { supabase } from './utils/supabase/client';
import { getNextAvailableModule, shouldLevelUp } from './data/javaCurriculum';
import { StudyBuddyLogo } from './components/StudyBuddyLogo';
import XPSystem from './utils/xpSystem';
import { LogOut, Sun, Moon, Shield, X, User, GraduationCap } from 'lucide-react';
import { useProgress } from './contexts/ProgressContext';

// Acknowledge imports used elsewhere or by side-effects to avoid linter unused warnings
void AutoSaveManager;
void getNextAvailableModule;

type Screen = 'welcome' | 'learning' | 'assessment' | 'progress' | 'profile' | 'chat' | 'admin' | 'report' | 'about' | 'help' | 'privacy' | 'terms' | 'contact';

interface UserData {
  id: string;
  username: string;
  level?: string;
  points?: number;
  isNewUser?: boolean;
}

export default function App() {
  // If the app is loaded at the dedicated reset path, render the reset page
  // directly. This keeps the implementation lightweight without adding a
  // router dependency. The ResetPassword component handles the token parsing
  // and password update flow.
  if (typeof window !== 'undefined') {
    const p = window.location.pathname;
    if (p === '/reset-password') return <ResetPassword />;
    if (p === '/login') return <Login />;
  }
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  // removed unused `isMobileMenuOpen` state (menu is controlled via `isNavMenuOpen`)
  const [isInAssessment, setIsInAssessment] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [showAdminHeader, setShowAdminHeader] = useState(false);
  const [navigationData, setNavigationData] = useState<any>(null);
  const [xpPopup, setXpPopup] = useState<{ show: boolean; points: number; title: string; uniqueKey?: string }>({
    show: false,
    points: 0,
    title: '',
    uniqueKey: undefined
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  // Callbacks that must run on every render (declared unconditionally to satisfy Rules of Hooks)
  const handleUserLevelUp = useCallback((newLevel: string) => {
    try {
      if (!userData || !newLevel) {
        console.error('Invalid data for level up');
        return;
      }
      const reward = XPSystem.getLevelUpReward(newLevel);
      if (!reward || typeof reward.amount !== 'number') {
        console.error('Invalid reward data');
        return;
      }
      // Do not mutate userData.points directly; ProgressContext is source of truth
      // Just show popup and refresh from context
      refreshUserPoints();
      setXpPopup({ show: true, points: reward.amount, title: reward.title });
    } catch (error) {
      console.error('Error handling level up:', error);
    }
  }, [userData, refreshUserPoints]);

  const handleXPEarned = useCallback((points: number, title: string) => {
    try {
      if (!userData) {
        console.error('No user data for XP earned');
        return;
      }
      if (typeof points !== 'number' || !isFinite(points)) {
        console.error('Invalid points value:', points);
        return;
      }
      // Do not mutate userData.points directly; refresh from ProgressContext instead
      refreshUserPoints();
      const timestamp = Date.now();
      const uniqueKey = `${userData.id}_${title.replace(/\s+/g, '_')}_${timestamp}`;
      setXpPopup({ show: true, points, title: title || 'XP Earned', uniqueKey });
    } catch (error) {
      console.error('Error handling XP earned:', error);
    }
  }, [userData, refreshUserPoints]);

  const refreshUserPoints = useCallback(() => {
    try {
      // Use progressContext as the source of truth for XP
      if (!progressContext) {
        console.debug('[App] refreshUserPoints: No progressContext available');
        return;
      }
      const actualPoints = Number(progressContext.totalXP || 0);
      if (typeof actualPoints !== 'number' || !isFinite(actualPoints)) {
        console.error('Invalid points from progressContext:', actualPoints);
        return;
      }
      console.debug('[App] refreshUserPoints: Updating to', actualPoints);
      setUserData(prevUserData => {
        if (!prevUserData) return prevUserData;
        return {
          ...prevUserData,
          points: actualPoints
        };
      });
    } catch (error) {
      console.error('Error refreshing user points:', error);
    }
  }, [progressContext]);

  // Sync progress context totals into top-level `userData` so legacy components
  // that read `userData.points` or `userData.level` show fresh values.
  try {
    // Guard import usage - only run when inside a React render
    // (useProgress will throw if used outside provider; wrap in try/catch)
    // We'll call this hook below inside the component body.
  } catch (e) {
    // ignore
  }

  // useProgress is only valid when App is rendered inside AppProviders (it is),
  // but guard to avoid fatal errors in tests.
  let progressContext: any = null;
  try {
    progressContext = useProgress();
  } catch (e) {
    progressContext = null;
  }

  // Map numeric level values (from XP calc / progress) to the string labels
  // used across the UI ('Beginner' | 'Learner' | 'Advanced'). This keeps
  // `userData.level` consistently a string so components like LearningHub
  // can perform string comparisons and render correctly.
  const mapLevelLabel = (lvl: any) => {
    if (typeof lvl === 'number') {
      switch (lvl) {
        case 1:
          return 'Beginner';
        case 2:
          return 'Learner';
        case 3:
          return 'Advanced';
        default:
          return String(lvl);
      }
    }
    return lvl || 'Beginner';
  };

  useEffect(() => {
    console.log('[App] 🔄 Progress sync effect check', {
      hasProgressContext: !!progressContext,
      totalXP: progressContext?.totalXP,
      level: progressContext?.level,
      hasUserData: !!userData
    });
    
    if (!progressContext) {
      console.warn('[App] Progress sync: No progressContext');
      return;
    }
    
    if (!userData) {
      console.warn('[App] Progress sync: No userData yet');
      return;
    }
    
    try {
      const newPoints = Number(progressContext.totalXP || 0);
      const newLevel = progressContext.level || 1;
      console.log('[App] Progress sync effect triggered', { 
        contextTotalXP: progressContext.totalXP, 
        newPoints, 
        newLevel,
        currentUserDataPoints: userData.points
      });
      setUserData(prev => {
        if (!prev) {
          console.warn('[App] Progress sync: No prev userData');
          return prev;
        }
        const mappedLevel = mapLevelLabel(newLevel) || (prev.level || 'Beginner');
        console.log('[App] Progress sync comparison', { 
          prevPoints: prev.points, 
          newPoints, 
          prevLevel: prev.level, 
          mappedLevel,
          shouldUpdate: (prev.points || 0) !== newPoints || prev.level !== mappedLevel
        });
        // Always update if values changed to ensure display stays in sync
        if ((prev.points || 0) === newPoints && prev.level === mappedLevel) {
          console.log('[App] Progress sync: Values unchanged, skipping update');
          return prev;
        }
        console.log('[App] ✅ Syncing progress to userData', { newPoints, mappedLevel });
        return {
          ...prev,
          points: newPoints,
          level: mappedLevel,
        };
      });
    } catch (e) {
      console.warn('Failed to sync progress into userData', e);
    }
  }, [progressContext, progressContext?.totalXP, progressContext?.level, userData?.id]);

  // Debug: Log whenever userData.points changes
  useEffect(() => {
    if (userData) {
      console.log('[App] 💾 userData.points changed:', {
        points: userData.points,
        level: userData.level,
        id: userData.id
      });
    }
  }, [userData?.points, userData?.level]);

  // Listen for immediate XP awards emitted by ProgressSyncManager to show
  // XP popups without a full page reload. Event detail: { userId, xp, sourceType, sourceId, title? }
  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const d = (ev as CustomEvent).detail || {};
        const points = Number(d.xp || d.points || 0) || 0;
        const title = d.title || (d.sourceType ? `+${points} XP` : 'XP Earned');
        const uid = d.userId;

        // Do not mutate userData.points; ProgressContext handles authoritative XP
        if (uid && userData && userData.id === uid) {
          refreshUserPoints();
        }

        const uniqueKey = `${uid || 'anon'}_${title.replace(/\s+/g, '_')}_${Date.now()}`;
        setXpPopup({ show: true, points, title, uniqueKey });
      } catch (e) { /* ignore */ }
    };

    window.addEventListener('xpAwarded', handler as EventListener);
    return () => window.removeEventListener('xpAwarded', handler as EventListener);
  }, [userData, refreshUserPoints]);

  // Close nav menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isNavMenuOpen && !target.closest('.nav-sidebar') && !target.closest('.hamburger-button')) {
        setIsNavMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isNavMenuOpen) {
        setIsNavMenuOpen(false);
      }
    };

    if (isNavMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isNavMenuOpen]);

  // Admin header scroll listener
  useEffect(() => {
    if (isAdmin) {
      const handleScroll = () => {
        setShowAdminHeader(window.scrollY > 100);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isAdmin]);

  // Initialize theme and check for existing session (bootstrap on mount)
  useEffect(() => {
    // Use an async IIFE so we can await inside the effect
    const bootstrap = async () => {
      try {
        // [Bootstrap] starting app bootstrap (silent)
        // Theme is managed by ThemeProvider; no manual DOM theme changes here.

        // Try to restore session from Supabase first so refresh works on reload.
        // On some loads, `getSession()` can briefly return null while the auth client
        // initializes; wait briefly for the INITIAL_SESSION/SIGNED_IN event before
        // treating the user as logged out.
        try {
          const getSessionWithWait = async (timeoutMs: number) => {
            return new Promise<any>((resolve) => {
              let settled = false;
              let sub: any = null;

              (async () => {
                try {
                  const first = await supabase.auth.getSession();
                  if (first?.data?.session?.user?.id) {
                    settled = true;
                    resolve(first.data.session);
                    return;
                  }
                } catch (err) {
                  console.error('Error fetching initial session:', err);
                }

                const timer = setTimeout(() => {
                  if (settled) return;
                  settled = true;
                  try { sub?.data?.subscription?.unsubscribe(); } catch { }
                  resolve(null);
                }, timeoutMs);

                sub = supabase.auth.onAuthStateChange((_event, session) => {
                  if (settled) return;
                  if (session?.user?.id) {
                    settled = true;
                    clearTimeout(timer);
                    try { sub?.data?.subscription?.unsubscribe(); } catch { }
                    resolve(session);
                  }
                });
              })();
            });
          };

          const session = await getSessionWithWait(1200);
          // [Bootstrap] supabase session (silent)
          if (!session || !session.user || !session.user.id) {
            // [Bootstrap] no active Supabase session; finishing bootstrap (silent)
            setIsBootstrapping(false);
            return;
          }
          const userId = session.user.id;

          // Use Supabase client to fetch `user_profiles` safely (only guaranteed columns)
          // Retry transient failures a few times before deciding to route to landing.
          let profileRow: any = null;
          let profileErr: any = null;
          const maxProfileProbe = 3;
          for (let attempt = 1; attempt <= maxProfileProbe; attempt++) {
            try {
              const res = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
              profileRow = res?.data ?? null;
              profileErr = res?.error ?? null;
              if (!profileErr) break; // success (even if row is null)
            } catch (e) {
              profileErr = e;
            }

            const retryable = profileErr && (profileErr.status === 0 || (profileErr.status >= 500) || /timeout|network|fetch/i.test(String(profileErr.message || profileErr)));
            if (!retryable) break;
            const backoff = 150 * Math.pow(2, attempt - 1);
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, backoff));
          }

          if (profileErr) {
            // Transient profile lookup failure — do not redirect to landing; continue and attempt to hydrate progress. (silent)
          } else if (profileRow) {
            // [Bootstrap] profile found for user (silent)
          } else {
            // No profile row (user exists in auth but no profile).
            // The DB should create `user_profiles` via trigger on `auth.users`.
            const recheckAttempts = 5;
            let rechecked = false;
            for (let r = 1; r <= recheckAttempts; r++) {
              try {
                // eslint-disable-next-line no-await-in-loop
                await new Promise((res) => setTimeout(res, 250 * r));
                const probe = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle();
                if (probe && !probe.error && probe.data) {
                  profileRow = probe.data;
                  rechecked = true;
                  // user_profiles appeared on recheck (silent)
                  break;
                }
              } catch {
                // ignore transient probe errors during recheck
              }
            }

            if (!rechecked) {
              console.error('[Bootstrap] authenticated session found but no user_profiles row after retries — this indicates a server-side/schema issue. Check DB trigger on auth.users', userId);
            }
          }

          // Hard stop: without `user_profiles`, many tables (including `user_progress`) will reject writes via FK.
          // Avoid spamming FK violations on refresh by skipping progress hydration/default initialization.
          if (!profileErr && !profileRow) {
            setIsBootstrapping(false);
            return;
          }

          // Hydrate progress via ProgressSyncManager (populates cache and notifies listeners)
          let progress: any = null;
          const maxProgressAttempts = 3;
          for (let attempt = 1; attempt <= maxProgressAttempts; attempt++) {
            try {
              // attempting progress hydration (silent)
              progress = await ProgressSyncManager.initUserProgress(userId);
              // initUserProgress result (silent)
              // Consider hydrated if there is any module progress or completed modules
              const hasProgress = (progress && progress.moduleProgress && Object.keys(progress.moduleProgress).length > 0) || ((progress && progress.completedModules) || []).length > 0;
              if (hasProgress) {
                // progress hydrated (silent)
                break;
              }
              // If not hydrated and not final attempt, optionally initialize defaults on final attempt
              if (attempt < maxProgressAttempts) {
                const backoff = 200 * Math.pow(2, attempt - 1);
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, backoff));
                continue;
              }

              // Final attempt produced no progress; initialize defaults and re-fetch once
              const COURSE_CONFIG: { id: string; lessons: string[]; exercises: string[] }[] = (window as any).__COURSE_CONFIG || [
                { id: 'module_1', lessons: [], exercises: [] }
              ];
              // no server progress found after retries; initializing default progress (silent)
              await ProgressSyncManager.initDefaultProgressForUser(userId, COURSE_CONFIG);
              progress = await ProgressSyncManager.initUserProgress(userId);
              break;
            } catch (e) {
              // progress hydration attempt failed (silent)
              if (attempt >= maxProgressAttempts) {
                console.error('[Bootstrap] progress hydration failed after retries for', userId);
              } else {
                const backoff = 200 * Math.pow(2, attempt - 1);
                // eslint-disable-next-line no-await-in-loop
                await new Promise((r) => setTimeout(r, backoff));
              }
            }
          }

          // Compute a safe level and points based on hydrated progress
          const userProgressForLocal = progress || { completedModules: [], total_xp: 0 } as any;
          console.log('[Bootstrap] Progress data loaded', { 
            hasProgress: !!progress,
            total_xp: userProgressForLocal.total_xp,
            completedModules: userProgressForLocal.completedModules?.length || 0
          });
          let currentLevel = 'Beginner';
          let tempLevel = currentLevel; let iterations = 0; const MAX_ITERATIONS = 3;
          let newLevel = shouldLevelUp(tempLevel, userProgressForLocal);
          while (newLevel && iterations < MAX_ITERATIONS) { tempLevel = newLevel; newLevel = shouldLevelUp(tempLevel, userProgressForLocal); iterations++; }
          currentLevel = tempLevel;

          // Use actual total_xp from progress data instead of calculated value
          const actualTotalXP = userProgressForLocal.total_xp ?? 0;
          console.log('[Bootstrap] Setting initial userData', { 
            actualTotalXP,
            currentLevel,
            userId 
          });

          setUserData({
            id: userId,
            username: (profileRow && (profileRow as any).username) || session.user.email || 'Learner',
            level: currentLevel,
            points: actualTotalXP,
            isNewUser: ((userProgressForLocal.completedModules || []).length === 0)
          });

          // Force a sync with progressContext after a short delay to ensure we get the latest value
          setTimeout(() => {
            if (progressContext && progressContext.totalXP !== undefined) {
              console.log('[Bootstrap] 🔄 Force syncing with progressContext', {
                bootstrapPoints: actualTotalXP,
                contextPoints: progressContext.totalXP,
                willUpdate: progressContext.totalXP !== actualTotalXP
              });
              if (progressContext.totalXP !== actualTotalXP) {
                setUserData(prev => prev ? { ...prev, points: progressContext.totalXP } : prev);
              }
            }
          }, 500);

          setIsAdmin(((profileRow as any)?.is_admin === true) || ((profileRow as any)?.role === 'admin') || false);
          // If a post-reload navigation state was saved, restore it now so the
          // user returns to the same screen/module they were on before reload.
          try {
            const raw = sessionStorage.getItem('sb_post_reload_nav');
            let _savedScroll: number | null = null;
            if (raw) {
              const obj = JSON.parse(raw);
              if (obj && obj.screen) {
                setNavigationData(obj.navigationData || null);
                setCurrentScreen(obj.screen as Screen);
                // capture saved scrollY (if provided) to restore after bootstrap
                if (typeof obj.scrollY === 'number' && isFinite(obj.scrollY)) {
                  _savedScroll = Math.max(0, Math.floor(obj.scrollY));
                }
                sessionStorage.removeItem('sb_post_reload_nav');
              } else {
                setCurrentScreen('learning');
              }
            } else {
              setCurrentScreen('learning');
            }

            // Restore scroll after the UI has been rendered. Use a short delay
            // so the DOM can paint and layout is stable.
            if (_savedScroll !== null) {
              try {
                setTimeout(() => {
                  try {
                    window.scrollTo({ top: _savedScroll as number, behavior: 'auto' });
                  } catch (e) {
                    // ignore
                  }
                }, 80);
              } catch (e) {
                // ignore
              }
            }
          } catch (e) {
            setCurrentScreen('learning');
          }
          // [Bootstrap] finished bootstrap for user (silent)
          setIsBootstrapping(false);
          return; // finished bootstrap
        } catch (err) {
          // If Supabase session retrieval failed, log and finish bootstrap without falling back
          // to local session storage. Supabase is the single source of truth for auth. (silent)
          setIsBootstrapping(false);
          return;
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  // Fail-safe: if bootstrap hangs for any reason, stop showing the loading screen after 12s
  useEffect(() => {
    if (!isBootstrapping) return;
    const t = setTimeout(() => {
      try {
        console.warn('[Bootstrap] bootstrap timeout reached; proceeding without full hydration');
        setIsBootstrapping(false);
      } catch (e) {
        // ignore
      }
    }, 12000);
    return () => clearTimeout(t);
  }, [isBootstrapping]);

  // Listen for global progress updates to refresh user points AND check level progression
  useEffect(() => {
    if (!userData?.id) return;

    const handleProgressUpdate = (event: CustomEvent) => {
      if (event.detail.userId === userData.id) {
        try {
          const detail: any = event.detail || {};
          if (detail.progress) {
            ProgressManager.importProgress(detail.userId, detail.progress);
          }

          refreshUserPoints();

          const userProgress = detail.progress || ProgressSyncManager.getCachedProgress?.(userData.id) || null;
          if (userProgress) {
            setUserData(prevUserData => {
              if (!prevUserData) return prevUserData;

              let currentLevel = prevUserData.level || 'Beginner';
              let iterations = 0;
              const MAX_ITERATIONS = 3;

              let newLevel = shouldLevelUp(currentLevel, userProgress);
              while (newLevel && iterations < MAX_ITERATIONS) {
                currentLevel = newLevel;
                newLevel = shouldLevelUp(currentLevel, userProgress);
                iterations++;
              }

              if (currentLevel !== prevUserData.level) {
                return {
                  ...prevUserData,
                  level: currentLevel
                };
              }

              return prevUserData;
            });
          }
        } catch (error) {
          console.error('Error checking level progression:', error);
        }
      }
    };

    window.addEventListener('progressUpdated', handleProgressUpdate as EventListener);

    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate as EventListener);
    };
  }, [userData?.id, refreshUserPoints]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <StudyBuddyLogo size="lg" variant="minimal" withBackground={false} />
          <p className="mt-4">Loading your progress…</p>
        </div>
      </div>
    );
  }

  // Use ThemeContext toggleTheme (from useTheme)
  // `toggleTheme` is imported above from useTheme

  const handleWelcomeComplete = (data: UserData) => {
    try {
      // Validate user data
      if (!data || !data.id || !data.username) {
        console.error('Invalid user data received');
        return;
      }

      // Do NOT initialize/overwrite local progress here.
      // Supabase (via ProgressSyncManager) is the authoritative source of truth.
      // The bootstrap/sign-in flows will hydrate progress into cache before rendering.

      setUserData(data);
      // Determine admin status from Supabase-backed profile flags (server truth)
      setIsAdmin(false);
      void (async () => {
        try {
          const res = await supabase
            .from('user_profiles')
            .select('is_admin, role')
            .eq('id', data.id)
            .maybeSingle();
          if (res?.data) {
            setIsAdmin(((res.data as any).is_admin === true) || ((res.data as any).role === 'admin') || false);
          }
        } catch {
          // ignore: admin flag is best-effort for UI; server-side RLS remains authoritative
        }
      })();
      setCurrentScreen('learning');
    } catch (error) {
      console.error('Error completing welcome:', error);
      // Show error to user
      alert('Failed to initialize account. Please try again.');
    }
  };





  const handleNavigation = (screen: string, data?: any) => {
    try {
      // Prevent navigation during assessment
      if (isInAssessment && screen !== 'assessment') {
        return;
      }
      if (!screen) {
        console.error('Invalid screen for navigation');
        return;
      }
      setCurrentScreen(screen as Screen);
      setNavigationData(data || null);
      // Always scroll to top when navigating to a new page
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error during navigation:', error);
    }
  };

  const handleAssessmentComplete = (result: any) => {
    try {
      // Validate result data
      if (!result || typeof result !== 'object') {
        console.error('Invalid assessment result');
        setIsInAssessment(false);
        setCurrentScreen('learning');
        return;
      }

      // Update user level based on assessment result
      if (userData && result.passed) {
        const newPoints = (userData.points || 0) + (result.earnedPoints || 0);
        if (isFinite(newPoints)) {
          setUserData({
            ...userData,
            level: result.newLevel || userData.level,
            points: newPoints
          });
        }
      }
      setIsInAssessment(false);
      setCurrentScreen('learning');
    } catch (error) {
      console.error('Error completing assessment:', error);
      setIsInAssessment(false);
      setCurrentScreen('learning');
    }
  };

  const handleAssessmentStart = () => {
    setIsInAssessment(true);
  };

  const handleAssessmentExit = () => {
    setIsInAssessment(false);
  };

  const handleLogout = async () => {
    try {
      if (userData) {
        try {
          await AuthService.signOut();
        } catch (e) {
          // AuthService.signOut failed, clearing local state anyway (silent)
        }
      }
      setUserData(null);
      setIsAdmin(false);
      setCurrentScreen('welcome');
      setIsNavMenuOpen(false);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear everything even if there's an error
      setUserData(null);
      setIsAdmin(false);
      setCurrentScreen('welcome');
      setIsNavMenuOpen(false);
    }
  };



  if (currentScreen === 'welcome') {
    return (
      <ErrorBoundary>
        <Welcome onComplete={handleWelcomeComplete} />
      </ErrorBoundary>
    );
  }

  // If user is admin, show only admin interface
  if (isAdmin && userData) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          {/* Admin Header */}
          <div className={`border-b bg-card/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${showAdminHeader ? 'translate-y-0' : '-translate-y-full'
            }`}>
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <StudyBuddyLogo size="lg" variant="minimal" withBackground={false} />
                  <div>
                    <h1 className="text-base">Study Buddy Admin</h1>
                    <p className="text-xs text-muted-foreground">Administrator Panel</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className="px-3 py-1 text-xs bg-primary/10 text-primary border-primary/30">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="flex items-center"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>

                  {/* Logout */}
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
                        <AlertDialogDescription>Are you sure you want to sign out? You will be returned to the welcome screen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-transparent text-red-600 hover:text-red-700 font-semibold dark:text-red-400 dark:hover:text-red-300">Sign out</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Content */}
          <div className="flex-1">
            <AdminPanel onNavigate={handleNavigation} onLogout={handleLogout} />
          </div>

          {/* Back to Top Button for Admin */}
          <BackToTop />
        </div>
      </ErrorBoundary>
    );
  }

  const resolvedXP = (typeof progressContext?.totalXP === 'number' && isFinite(progressContext.totalXP))
    ? progressContext.totalXP
    : (typeof userData?.points === 'number' && isFinite(userData.points) ? userData.points : 0);

  const compactResolvedXP = resolvedXP > 999 ? `${Math.floor(resolvedXP / 1000)}k` : resolvedXP.toLocaleString();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Gamified Navigation Header */}
        {userData && !isAdmin && (
          <div className="bg-card/80 backdrop-blur-lg border-b-2 border-primary/20 sticky top-0 z-40 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3">
              {/* Main navigation row */}
              <div className="flex items-center justify-between min-h-[2.5rem]">
                {/* Left section: Hamburger menu & Logo */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
                    className="relative hamburger-button"
                  >
                    <div className="flex flex-col space-y-1">
                      <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${isNavMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                      <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${isNavMenuOpen ? 'opacity-0' : ''}`}></div>
                      <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${isNavMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                    </div>
                  </Button>

                  <div className="flex items-center space-x-2">
                    <StudyBuddyLogo size="lg" variant="minimal" withBackground={false} />
                    <div className="hidden sm:block">
                      <h1 className="text-base whitespace-nowrap">Study Buddy</h1>
                    </div>
                  </div>
                </div>

                {/* Center section: Current page indicator */}
                <div className="flex-1 text-center px-2">
                  <Badge className="px-2 py-1 text-xs sm:text-sm max-w-full">
                    <span className="hidden sm:inline">
                      {currentScreen === 'learning' && '📚 Learning Hub'}
                      {currentScreen === 'assessment' && '🎯 Assessment'}
                      {currentScreen === 'progress' && '📊 Progress'}
                      {currentScreen === 'profile' && '👤 Profile'}
                      {currentScreen === 'chat' && '🤖 AI Assistant'}
                      {currentScreen === 'report' && '🚩 Report Issue'}
                      {currentScreen === 'about' && 'ℹ️ About'}
                      {currentScreen === 'help' && '❓ Help Center'}
                      {currentScreen === 'privacy' && '🔒 Privacy Policy'}
                      {currentScreen === 'terms' && '📜 Terms of Use'}
                      {currentScreen === 'contact' && '📧 Contact Us'}
                    </span>
                    <span className="sm:hidden">
                      {currentScreen === 'learning' && '📚'}
                      {currentScreen === 'assessment' && '🎯'}
                      {currentScreen === 'progress' && '📊'}
                      {currentScreen === 'profile' && '👤'}
                      {currentScreen === 'chat' && '🤖'}
                      {currentScreen === 'report' && '🚩'}
                      {currentScreen === 'about' && 'ℹ️'}
                      {currentScreen === 'help' && '❓'}
                      {currentScreen === 'privacy' && '🔒'}
                      {currentScreen === 'terms' && '📜'}
                      {currentScreen === 'contact' && '📧'}
                    </span>
                  </Badge>
                </div>

                {/* Right section: User Info and Actions */}
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <div className="hidden lg:flex items-center space-x-2">
                    <Badge className="px-2 py-1 text-xs whitespace-nowrap">
                      ✨ {resolvedXP.toLocaleString()}
                    </Badge>
                    <div className="relative">
                      <Badge className="px-2 py-1 text-xs bg-gradient-to-r from-primary to-primary/80 shadow-sm whitespace-nowrap">
                        {userData.level === 'Beginner' && '🌱'}
                        {userData.level === 'Learner' && '🚀'}
                        {userData.level === 'Advanced' && '👑'}
                        {userData.level || 'Beginner'}
                      </Badge>
                      {/* Decorative elements around level badge */}
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-accent/60 rounded-full animate-pulse delay-300"></div>
                    </div>
                  </div>
                  <div className="lg:hidden flex items-center space-x-1">
                    <Badge className="px-1.5 py-0.5 text-xs">
                      ✨ {compactResolvedXP}
                    </Badge>
                    <Badge className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-primary to-primary/80">
                      {userData.level === 'Beginner' && '🌱'}
                      {userData.level === 'Learner' && '🚀'}
                      {userData.level === 'Advanced' && '👑'}
                    </Badge>
                  </div>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="flex items-center"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>

                  {/* Logout */}
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
                        <AlertDialogDescription>Are you sure you want to sign out? You will be returned to the welcome screen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout} className="bg-transparent text-red-600 hover:text-red-700 font-semibold dark:text-red-400 dark:hover:text-red-300">Sign out</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Navigation Menu */}
        {userData && !isAdmin && (
          <>
            {/* Backdrop Overlay */}
            {isNavMenuOpen && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
                onClick={() => setIsNavMenuOpen(false)}
              />
            )}

            {/* Gamified Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] sm:max-w-[75vw] md:max-w-80 bg-card/95 backdrop-blur-xl border-r-2 border-primary/30 shadow-2xl z-50 transform transition-transform duration-300 ease-out nav-sidebar flex flex-col ${isNavMenuOpen ? 'translate-x-0' : '-translate-x-full'
              }`}>

              {/* Sidebar Header */}
              <div className="p-6 border-b flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <StudyBuddyLogo size="xl" variant="floating" animate={true} withBackground={true} />
                    <div>
                      <h2 className="text-base">Study Buddy</h2>
                      <p className="text-xs text-muted-foreground">Navigation Menu</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNavMenuOpen(false)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* User Info Section - Gamified */}
              <div className="p-4 border-b gradient-bg relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                <div className="relative z-10 flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 gradient-bg-gold rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/50">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm truncate text-white">{userData.username}</h3>
                    <p className="text-xs text-white/80">Welcome back, learner! 🎉</p>
                  </div>
                </div>
                <div className="relative z-10 flex items-center space-x-1.5">
                  <Badge className="px-2 py-0.5 text-xs flex-shrink-0 bg-white/90 text-primary border-white">
                    ✨ {resolvedXP.toLocaleString()}
                  </Badge>
                  <Badge className="px-2 py-0.5 text-xs gradient-bg-gold flex-shrink-0 border-2 border-white/50">
                    {userData.level === 'Beginner' && '🌱'}
                    {userData.level === 'Learner' && '🚀'}
                    {userData.level === 'Advanced' && '👑'}
                    {userData.level || 'Beginner'}
                  </Badge>
                </div>
              </div>

              {/* Navigation Items - Scrollable */}
              <div className="flex-1 overflow-y-scroll overscroll-contain nav-menu-scroll min-h-0">
                <div className="p-4 space-y-2 pb-24">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1">Main Menu</h4>

                    <Button
                      variant={currentScreen === 'learning' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (!isInAssessment || currentScreen === 'learning') {
                          setCurrentScreen('learning');
                          setIsNavMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="w-full justify-start space-x-3 h-11"
                      disabled={isInAssessment && currentScreen !== 'learning'}
                    >
                      <GraduationCap className="w-5 h-5" />
                      <span>Learning Hub</span>
                    </Button>

                    <Button
                      variant={currentScreen === 'assessment' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (!isInAssessment || currentScreen === 'assessment') {
                          handleNavigation('assessment');
                          setIsNavMenuOpen(false);
                        }
                      }}
                      className="w-full justify-start space-x-3 h-11"
                      disabled={isInAssessment && currentScreen !== 'assessment'}
                    >
                      <Target className="w-5 h-5" />
                      <span>Assessment</span>
                      {isInAssessment && currentScreen === 'assessment' && (
                        <Badge className="ml-auto text-xs">Active</Badge>
                      )}
                    </Button>

                    <Button
                      variant={currentScreen === 'progress' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (!isInAssessment || currentScreen === 'progress') {
                          setCurrentScreen('progress');
                          setIsNavMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="w-full justify-start space-x-3 h-11"
                      disabled={isInAssessment && currentScreen !== 'progress'}
                    >
                      <LineChart className="w-5 h-5" />
                      <span>Progress Tracker</span>
                    </Button>

                    <Button
                      variant={currentScreen === 'profile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (!isInAssessment || currentScreen === 'profile') {
                          setCurrentScreen('profile');
                          setIsNavMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="w-full justify-start space-x-3 h-11"
                      disabled={isInAssessment && currentScreen !== 'profile'}
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>Profile</span>
                    </Button>

                    <Button
                      variant={currentScreen === 'chat' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        handleNavigation('chat');
                        setIsNavMenuOpen(false);
                      }}
                      className="w-full justify-start space-x-3 h-11"
                    >
                      <Bot className="w-5 h-5" />
                      <span>AI Assistant</span>
                    </Button>
                  </div>

                  <div className="pt-4 space-y-1">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1">Support & Info</h4>

                    <Button
                      variant={currentScreen === 'about' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setCurrentScreen('about');
                        setIsNavMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full justify-start space-x-3 h-11"
                    >
                      <Info className="w-5 h-5" />
                      <span>About</span>
                    </Button>

                    <Button
                      variant={currentScreen === 'help' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setCurrentScreen('help');
                        setIsNavMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full justify-start space-x-3 h-11"
                    >
                      <HelpCircle className="w-5 h-5" />
                      <span>Help Center</span>
                    </Button>

                    <Button
                      variant={currentScreen === 'report' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (!isInAssessment || currentScreen === 'report') {
                          setCurrentScreen('report');
                          setIsNavMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="w-full justify-start space-x-3 h-11"
                      disabled={isInAssessment && currentScreen !== 'report'}
                    >
                      <Flag className="w-5 h-5" />
                      <span>Report Issue</span>
                    </Button>

                    <Button
                      variant={currentScreen === 'contact' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setCurrentScreen('contact');
                        setIsNavMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full justify-start space-x-3 h-11"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Contact Us</span>
                    </Button>
                  </div>

                  <div className="pt-4 space-y-1">
                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1">Settings</h4>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="w-full justify-start space-x-3 h-11"
                    >
                      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </Button>



                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start space-x-3 h-11 text-red-600 hover:bg-red-600/10 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-400/20 dark:hover:text-red-200"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Log Out</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Sign out?</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to sign out? You will be returned to the welcome screen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { handleLogout(); setIsNavMenuOpen(false); }} className="bg-transparent text-red-600 hover:text-red-700 font-semibold dark:text-red-400 dark:hover:text-red-300">Sign out</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {currentScreen === 'learning' && userData && !isAdmin && (
            <LearningHub
              onNavigate={handleNavigation}
              userLevel={userData.level || 'Beginner'}
              userPoints={(typeof progressContext?.totalXP === 'number' && isFinite(progressContext.totalXP)) ? progressContext.totalXP : (userData.points || 0)}
              username={userData.username}
              isNewUser={userData.isNewUser}
              userId={userData.id}
              onUserLevelUp={handleUserLevelUp}
              onXPEarned={handleXPEarned}
              onPointsRefresh={refreshUserPoints}
              navigationData={navigationData}
            />
          )}
          {currentScreen === 'assessment' && !isAdmin && (
            <Assessment
              onNavigate={handleNavigation}
              onComplete={handleAssessmentComplete}
              onStart={handleAssessmentStart}
              onExit={handleAssessmentExit}
              userLevel={userData?.level || 'Beginner'}
              userId={userData?.id}
              onXPEarned={handleXPEarned}
              onPointsRefresh={refreshUserPoints}
              data={navigationData}
            />
          )}
          {currentScreen === 'progress' && userData && !isAdmin && (
            <ProgressTracker
              onNavigate={handleNavigation}
              isNewUser={(() => {
                try {
                  // Check if user has any real progress
                  if (!userData || !userData.id) return true;
                  const cached = ProgressSyncManager.getCachedProgress?.(userData.id) || null;
                  if (!cached) return true;
                  const snap = ProgressSyncManager.getProgressSnapshot(userData.id);
                  const totalLessons = Object.values(snap.completedLessons || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
                  const totalExercises = Object.values(snap.completedExercises || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
                  const totalProjects = (snap.completedProjects || []).length;
                  const totalModules = (snap.completedModules || []).length;

                  // User is new only if they have NO progress at all
                  return totalLessons === 0 && totalExercises === 0 && totalProjects === 0 && totalModules === 0;
                } catch (error) {
                  console.error('Error checking if user is new:', error);
                  return false; // Assume user has some progress if check fails
                }
              })()}
            />
          )}
          {currentScreen === 'profile' && userData && !isAdmin && (
            <Profile
              onNavigate={handleNavigation}
              userData={userData}
              onUpdateUserData={setUserData}
            />
          )}
          {(currentScreen as any) === 'manage-account' && userData && !isAdmin && (
            <ManageAccount
              onBack={() => {
                setCurrentScreen('profile');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
          {currentScreen === 'chat' && !isAdmin && (
            <ChatAssistant
              onNavigate={handleNavigation}
              userId={userData?.id || 'guest'}
              userLevel={userData?.level || 'Beginner'}
              username={userData?.username || 'Student'}
            />
          )}
          {currentScreen === 'report' && userData && !isAdmin && (
            <ReportIssue
              onNavigate={handleNavigation}
              userData={userData}
            />
          )}
          {currentScreen === 'about' && userData && !isAdmin && (
            <About onNavigate={handleNavigation} />
          )}
          {currentScreen === 'help' && userData && !isAdmin && (
            <HelpCenter onNavigate={handleNavigation} />
          )}
          {currentScreen === 'privacy' && userData && !isAdmin && (
            <PrivacyPolicy onNavigate={handleNavigation} />
          )}
          {currentScreen === 'terms' && userData && !isAdmin && (
            <TermsOfUse onNavigate={handleNavigation} />
          )}
          {currentScreen === 'contact' && userData && !isAdmin && (
            <ContactUs onNavigate={handleNavigation} />
          )}

        </div>

        {/* XP Popup */}
        <XPPopup
          show={xpPopup.show}
          points={xpPopup.points}
          title={xpPopup.title}
          uniqueKey={xpPopup.uniqueKey}
          onComplete={() => setXpPopup({ show: false, points: 0, title: '', uniqueKey: undefined })}
        />

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
        {/* Back to Top Button */}
        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}