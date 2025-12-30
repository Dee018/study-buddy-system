/**
 * App Providers Wrapper
 * 
 * Wraps the entire application with all context providers
 * Ensures proper provider hierarchy and initialization
 */

import React, { ReactNode, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import { CertificateProvider } from './contexts/CertificateContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AutoSaveProvider } from './contexts/AutoSaveContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wraps children with all application context providers
 * 
 * Provider hierarchy (outer to inner):
 * 1. NotificationProvider - No dependencies
 * 2. AuthProvider - Needs notifications
 * 3. ThemeProvider - Needs auth for user preferences
 * 4. ProgressProvider - Needs auth for user data
 * 5. CurriculumProvider - No user-specific dependencies
 */
export function AppProviders({ children }: AppProvidersProps) {
  // Synchronous cleanup executed at module/runtime when AppProviders is evaluated.
  // This runs before any React render/state hooks and removes only known
  // autosave/unsaved-work keys while preserving auth/session storage.
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const prefixes = [
        'study_buddy_autosave_',
        'unsaved_work_',
        'study_buddy_unsaved_',
        'auto_save_',
        'study_buddy_progress',
        'study_buddy_temp_',
        'sb_autosave_'
      ];

      const preservedSubstrings = ['supabase_auth', 'supabase-session', 'auth', 'session', 'access_token'];

      const removed: string[] = [];

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        const lower = key.toLowerCase();
        // Skip keys that look like auth/session tokens
        if (preservedSubstrings.some(s => lower.includes(s))) continue;
        if (prefixes.some(p => lower.startsWith(p))) {
          try { localStorage.removeItem(key); removed.push(key); } catch { /* ignore */ }
        }
      }

      // sessionStorage cleanup
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        const lower = key.toLowerCase();
        if (preservedSubstrings.some(s => lower.includes(s))) continue;
        if (prefixes.some(p => lower.startsWith(p))) {
          try { sessionStorage.removeItem(key); removed.push(key); } catch { /* ignore */ }
        }
      }

      if (removed.length > 0 && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[AppProviders] removed leftover autosave/session keys', removed);
      }
    }
  } catch (e) {
    // Failure to inspect storage should not block app startup
    if (process.env.NODE_ENV !== 'production') console.warn('[AppProviders] synchronous storage cleanup failed', e);
  }
  // Ensure a stable, tab-scoped UUID session id exists for analytics and other
  // ephemeral session-scoped needs. We prefer a proper UUID to avoid inserting
  // non-UUID session ids into DB UUID columns.
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const CURRENT_SESSION_KEY = 'current_session_id';
      const has = sessionStorage.getItem(CURRENT_SESSION_KEY);
      if (!has) {
        const uuidv4 = (): string => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        };
        try { sessionStorage.setItem(CURRENT_SESSION_KEY, uuidv4()); } catch { /* ignore */ }
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') console.warn('[AppProviders] session id init failed', e);
  }

  return (
    <NotificationProvider>
      <AuthProvider>
        <AutoSaveProvider>
          <PreferencesProvider>
            <ThemeProvider>
              <ProgressProvider>
                <CertificateProvider>
                  <AnalyticsProvider>
                    <CurriculumProvider>
                      {children}
                    </CurriculumProvider>
                  </AnalyticsProvider>
                </CertificateProvider>
              </ProgressProvider>
            </ThemeProvider>
          </PreferencesProvider>
        </AutoSaveProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
