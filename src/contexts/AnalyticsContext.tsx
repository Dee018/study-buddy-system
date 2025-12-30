/**
 * Analytics Context
 * 
 * Tracks user behavior, learning patterns, and engagement metrics
 * Records events to Supabase for analytics and insights
 * Replaces analyticsEngine localStorage with database persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// Analytics network calls suppressed to prevent side-effectful session
// reconciliation during local development and to avoid interfering with app
// state. supabase/checkSupabaseConnection are intentionally not imported.
import { useAuth } from './AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export type EventType =
  | 'page_view'
  | 'lesson_start'
  | 'lesson_complete'
  | 'exercise_start'
  | 'exercise_submit'
  | 'exercise_complete'
  | 'project_start'
  | 'project_submit'
  | 'assessment_start'
  | 'assessment_complete'
  | 'module_start'
  | 'module_complete'
  | 'search'
  | 'help_request'
  | 'code_run'
  | 'hint_viewed'
  | 'certificate_earned'
  | 'streak_milestone'
  | 'level_up'
  | 'custom';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  session_id: string;
  event_type: EventType;
  event_category?: string;
  event_data?: Record<string, any>;
  created_at: string;
}

export interface SessionAnalytics {
  session_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  page_views: number;
  events_count: number;
  lessons_viewed: number;
  exercises_attempted: number;
  session_data?: Record<string, any>;
}

export interface LearningPattern {
  user_id: string;
  pattern_type: string;
  pattern_data: {
    preferred_time_of_day?: string;
    average_session_duration?: number;
    most_active_day?: string;
    learning_style?: string;
    strengths?: string[];
    areas_for_improvement?: string[];
  };
  confidence_score: number;
  detected_at: string;
}

export interface AnalyticsContextType {
  // State
  currentSession: SessionAnalytics | null;
  loading: boolean;
  error: string | null;

  // Event Tracking
  trackEvent: (
    eventType: EventType,
    eventName: string,
    eventData?: Record<string, any>
  ) => Promise<void>;
  trackPageView: (pageUrl: string) => Promise<void>;

  // Session Management
  startSession: () => Promise<string>;
  endSession: () => Promise<void>;
  updateSessionDuration: () => Promise<void>;

  // Analytics Queries
  getUserEvents: (days?: number) => Promise<AnalyticsEvent[]>;
  getSessionHistory: (limit?: number) => Promise<SessionAnalytics[]>;
  getLearningPatterns: () => Promise<LearningPattern[]>;

  // Insights
  getTimeSpentByModule: () => Promise<Record<string, number>>;
  getMostActiveTimeOfDay: () => Promise<string>;
  getWeeklyActivity: () => Promise<Record<string, number>>;

  // Utilities
  clearError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  const [currentSession, setCurrentSession] = useState<SessionAnalytics | null>(null);
  const [loading, _setLoading] = useState(false);
  void _setLoading;
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const SESSION_STORAGE_KEY = 'sb_analytics_session_id';
  const initializedRef = React.useRef(false);
  const stoppedRef = React.useRef(false);
  const inactivityTimerRef = React.useRef<number | null>(null);
  const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes

  /**
   * Generate session ID
   */
  const generateSessionId = (): string => {
    // Prefer secure UUIDv4 when available, fallback to Math.random-based UUID
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        // Per RFC4122 v4: set version and clock_seq_hi_and_reserved
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const toHex = (b: number) => b.toString(16).padStart(2, '0');
        return (
          toHex(bytes[0]) + toHex(bytes[1]) + toHex(bytes[2]) + toHex(bytes[3]) + '-' +
          toHex(bytes[4]) + toHex(bytes[5]) + '-' +
          toHex(bytes[6]) + toHex(bytes[7]) + '-' +
          toHex(bytes[8]) + toHex(bytes[9]) + '-' +
          toHex(bytes[10]) + toHex(bytes[11]) + toHex(bytes[12]) + toHex(bytes[13]) + toHex(bytes[14]) + toHex(bytes[15])
        );
      }
    } catch (e) {
      // ignore and fallback
    }

    // Fallback UUIDv4 (less secure)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  /**
   * Get device info
   */
  const getDeviceInfo = () => {
    return {
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      platform: navigator.platform,
    };
  };

  /**
   * Normalize page URL for analytics: replace localhost with production domain.
   */
  const getAnalyticsPageUrl = () => {
    if (typeof window === 'undefined') return '';
    try {
      const url = new URL(window.location.href);
      if (url.hostname === 'localhost') {
        url.hostname = 'your-production-domain.com';
        url.protocol = 'https:';
        url.port = '';
      }
      return url.toString();
    } catch (e) {
      return window.location.href || '';
    }
  };

  /**
   * Start analytics session
   */
  const startSession = useCallback(async (): Promise<string> => {
    // Suppressed: do not perform any network or server-side session work.
    // Return a generated session id for local tagging only.
    return generateSessionId();
  }, [user?.id, profile?.id]);

  /**
   * End analytics session
   */
  const endSession = useCallback(async () => {
    // Disabled: do not perform network writes on endSession in this environment.
    setCurrentSession(null);
    return;
  }, [currentSession, user?.id, sessionStartTime]);

  /**
   * Shutdown analytics: end any active session, clear timers, and prevent further RPCs
   */
  const shutdown = useCallback(async (): Promise<void> => {
    try {
      stoppedRef.current = true;
      // remove sessionStorage id so startSession won't reuse it
      try { sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch { }
      if (currentSession) {
        await endSession();
      }
    } catch (err) {
      // Analytics shutdown failed (silent)
    } finally {
      setCurrentSession(null);
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
  }, [currentSession, endSession]);

  /**
   * Update session duration periodically
   */
  const updateSessionDuration = useCallback(async () => {
    // Disabled: no-op in local/dev to avoid server writes.
    return;
  }, [currentSession, user?.id, sessionStartTime]);

  /**
   * Start session on mount
   */
  useEffect(() => {
    // Analytics disabled: do not start sessions or perform unload updates.
    return undefined;
  }, [user?.id, startSession, endSession]);

  // Listen for explicit sign-in events (dispatched by AuthContext) to ensure session created immediately
  useEffect(() => {
    // Analytics disabled: do not react to sign-in or shutdown events.
    return undefined;
  }, [startSession, user?.id]);

  /**
   * Update session duration every 30 seconds
   */
  useEffect(() => {
    // Disabled: do not schedule periodic updates.
    return undefined;
  }, [currentSession, user?.id, updateSessionDuration]);

  // Inactivity handling (reset timer on user activity)
  useEffect(() => {
    // Disabled: inactivity handling suppressed to prevent unintended session
    // termination and side effects during local dev.
    return undefined;
  }, [currentSession, endSession]);

  /**
   * Track analytics event
   */
  const trackEvent = useCallback(async (
    eventType: EventType,
    eventName: string,
    eventData?: Record<string, any>
  ) => {
    // Analytics is intentionally inert in this environment: do not perform
    // server updates or mutate shared session state. Log the event for
    // debugging only.
    try {
      // eslint-disable-next-line no-console
      console.debug('[Analytics] tracking suppressed:', { eventType, eventName, eventData });
    } catch (e) {
      // ignore logging errors
    }
  }, [currentSession, user?.id, profile?.id, startSession]);


  /**
   * Track page view
   */
  const trackPageView = useCallback(async (pageUrl?: string) => {
    const url = getAnalyticsPageUrl();
    await trackEvent('page_view', 'Page View', { page_url: url });
  }, [trackEvent]);


  /**
   * Get user events
   */
  const getUserEvents = useCallback(async (days: number = 30): Promise<AnalyticsEvent[]> => {
    // Temporarily skip querying analytics_events to avoid DB errors during
    // local development. Return empty array so callers receive a valid shape.
    return [];
  }, [user?.id]);


  /**
   * Get session history
   */
  const getSessionHistory = useCallback(async (limit: number = 50): Promise<SessionAnalytics[]> => {
    // Disabled: do not query analytics_sessions from client. Return empty list.
    return [];
  }, [user?.id]);


  /**
   * Get learning patterns
   */
  const getLearningPatterns = useCallback(async (): Promise<LearningPattern[]> => {
    // Disabled: no network reads for learning patterns in this environment.
    return [];
  }, [user?.id]);

  /**
   * Get time spent by module
   */
  const getTimeSpentByModule = useCallback(async (): Promise<Record<string, number>> => {
    if (!user?.id) return {};

    try {
      const events = await getUserEvents(90); // Last 90 days

      const timeByModule: Record<string, number> = {};

      events.forEach(event => {
        if (event.event_data?.module_id && event.event_data?.time_spent) {
          const moduleId = event.event_data.module_id;
          timeByModule[moduleId] = (timeByModule[moduleId] || 0) + event.event_data.time_spent;
        }
      });

      return timeByModule;
    } catch (err) {
      console.error('Error calculating time spent:', err);
      return {};
    }
  }, [getUserEvents, user?.id]);

  /**
   * Get most active time of day
   */
  const getMostActiveTimeOfDay = useCallback(async (): Promise<string> => {
    if (!user?.id) return 'Not enough data';

    try {
      const events = await getUserEvents(30);

      const hourCounts: Record<number, number> = {};

      events.forEach(event => {
        const hour = new Date(event.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const mostActiveHour = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (!mostActiveHour) return 'Not enough data';

      const hour = parseInt(mostActiveHour);
      if (hour < 12) return 'Morning (6am-12pm)';
      if (hour < 17) return 'Afternoon (12pm-5pm)';
      if (hour < 21) return 'Evening (5pm-9pm)';
      return 'Night (9pm-6am)';
    } catch (err) {
      console.error('Error calculating active time:', err);
      return 'Not enough data';
    }
  }, [getUserEvents, user?.id]);

  /**
   * Get weekly activity
   */
  const getWeeklyActivity = useCallback(async (): Promise<Record<string, number>> => {
    if (!user?.id) return {};

    try {
      const sessions = await getSessionHistory(100);

      const dayActivity: Record<string, number> = {
        Sunday: 0,
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
      };

      sessions.forEach(session => {
        const dayName = new Date(session.started_at).toLocaleDateString('en-US', { weekday: 'long' });
        dayActivity[dayName] = (dayActivity[dayName] || 0) + 1;
      });

      return dayActivity;
    } catch (err) {
      console.error('Error calculating weekly activity:', err);
      return {};
    }
  }, [getSessionHistory, user?.id]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AnalyticsContextType = {
    // State
    currentSession,
    loading,
    error,

    // Event Tracking
    trackEvent,
    trackPageView,

    // Session Management
    startSession,
    endSession,
    updateSessionDuration,

    // Analytics Queries
    getUserEvents,
    getSessionHistory,
    getLearningPatterns,

    // Insights
    getTimeSpentByModule,
    getMostActiveTimeOfDay,
    getWeeklyActivity,

    // Utilities
    clearError,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access analytics context
 * Must be used within AnalyticsProvider
 */
export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }

  return context;
}
