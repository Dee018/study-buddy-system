/**
 * Preferences Context
 * 
 * Manages user preferences (theme, settings, UI customization)
 * Syncs preferences across devices via Supabase
 * Replaces themeUtils localStorage with database persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from './AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';

export interface UserPreferences {
  // Theme
  theme: Theme;

  // UI Preferences
  reducedMotion: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Learning Preferences
  autoAdvance: boolean;
  showHints: boolean;
  codeTheme: 'vs-dark' | 'vs-light' | 'monokai' | 'github';

  // Notifications
  emailNotifications: boolean;
  progressReminders: boolean;
  weeklyDigest: boolean;

  // Privacy
  profilePublic: boolean;
  showProgressToOthers: boolean;

  // Advanced
  developerMode: boolean;
  experimentalFeatures: boolean;
}

export interface PreferencesContextType {
  // State
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;

  // Theme Operations
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;

  // Preference Updates
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;

  // Utilities
  clearError: () => void;
  refreshPreferences: () => Promise<void>;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  reducedMotion: false,
  compactMode: false,
  fontSize: 'medium',
  autoAdvance: false,
  showHints: true,
  codeTheme: 'vs-dark',
  emailNotifications: true,
  progressReminders: true,
  weeklyDigest: true,
  profilePublic: false,
  showProgressToOthers: false,
  developerMode: false,
  experimentalFeatures: false,
};

// ============================================================================
// CONTEXT
// ============================================================================

const PreferencesContext = createContext<PreferencesContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();

  // Use a ref for `user` to avoid forcing callbacks to re-create on object identity changes.
  const userRef = React.useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user preferences from database
   */
  /**
   * Save preferences to database
   */
  const savePreferencesCallback = useCallback(async (newPreferences: UserPreferences) => {
    const currentUser = userRef.current;
    if (!currentUser?.id) {
      // For non-authenticated users, only apply theme locally
      applyTheme(newPreferences.theme);
      return;
    }

    try {
      // Preferred storage: `user_preferences` table. Try upsert there first.
      try {
        // Map our app preferences to the concrete columns in `user_preferences` table
        const payload: Record<string, any> = {
          user_id: currentUser.id,
          theme: newPreferences.theme,
          font_size: newPreferences.fontSize,
          code_editor_theme: newPreferences.codeTheme,
          email_notifications: !!newPreferences.emailNotifications,
          show_hints: !!newPreferences.showHints,
          auto_save_enabled: !!newPreferences.autoAdvance,
          // sound_effects_enabled is the inverse of reducedMotion where applicable
          sound_effects_enabled: !newPreferences.reducedMotion,
          updated_at: new Date().toISOString(),
        };

        const { data: upsertData, error: upsertErr } = await supabase
          .from('user_preferences')
          .upsert(payload, { onConflict: 'user_id' });

        if (!upsertErr) {
          // Successfully saved to user_preferences
          return;
        }

        // If upsertErr exists, continue to fallback strategies below (silent)
      } catch (e) {
        // table might not exist or permission denied — fall back (silent)
      }

      // Fallback: Read whole `user_profiles` row and update `profile_data.preferences` if available
      const { data: currentProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (selectError) {
        // Error selecting user_profiles row for preferences save (silent)
        // Don't throw here; fall back to applying theme locally and exit
        applyTheme(newPreferences.theme);
        return;
      }

      // If the DB row doesn't have a `profile_data` column (older schemas), skip DB save
      if (!currentProfile || !Object.prototype.hasOwnProperty.call(currentProfile, 'profile_data')) {
        // `profile_data` column missing; skipping DB save for preferences (silent)
        applyTheme(newPreferences.theme);
        return;
      }

      // Update profile_data with new preferences
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          profile_data: {
            ...(currentProfile?.profile_data || {}),
            preferences: newPreferences,
          },
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error saving preferences:', err);
      throw err;
    }

  }, []);

  const loadPreferences = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser?.id) {
      // Use default preferences for non-authenticated users
      applyTheme(DEFAULT_PREFERENCES.theme);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preferred: read from `user_preferences` table if present
      try {
        const { data: prefsRow, error: prefsErr } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!prefsErr && prefsRow) {
          // Map concrete columns back into our UserPreferences shape
          const savedPrefs: UserPreferences = {
            theme: (prefsRow.theme as Theme) || DEFAULT_PREFERENCES.theme,
            reducedMotion: prefsRow.sound_effects_enabled === undefined ? DEFAULT_PREFERENCES.reducedMotion : !prefsRow.sound_effects_enabled,
            compactMode: DEFAULT_PREFERENCES.compactMode,
            fontSize: (prefsRow.font_size as any) || DEFAULT_PREFERENCES.fontSize,
            autoAdvance: !!prefsRow.auto_save_enabled,
            showHints: prefsRow.show_hints === undefined ? DEFAULT_PREFERENCES.showHints : !!prefsRow.show_hints,
            codeTheme: (prefsRow.code_editor_theme as any) || DEFAULT_PREFERENCES.codeTheme,
            emailNotifications: prefsRow.email_notifications === undefined ? DEFAULT_PREFERENCES.emailNotifications : !!prefsRow.email_notifications,
            progressReminders: DEFAULT_PREFERENCES.progressReminders,
            weeklyDigest: DEFAULT_PREFERENCES.weeklyDigest,
            profilePublic: DEFAULT_PREFERENCES.profilePublic,
            showProgressToOthers: DEFAULT_PREFERENCES.showProgressToOthers,
            developerMode: DEFAULT_PREFERENCES.developerMode,
            experimentalFeatures: DEFAULT_PREFERENCES.experimentalFeatures,
          };

          setPreferences(savedPrefs);
          applyTheme(savedPrefs.theme);
          return;
        }
      } catch (e) {
        // user_preferences lookup failed, falling back to profile_data (silent)
      }

      // Fallback: Get user preferences from profile_data
      if (profile?.profile_data?.preferences) {
        const savedPrefs = {
          ...DEFAULT_PREFERENCES,
          ...profile.profile_data.preferences,
        };

        setPreferences(savedPrefs);
        applyTheme(savedPrefs.theme);
        return;
      }

      // No prefs stored in DB; use defaults and try to persist defaults to preferred table
      setPreferences(DEFAULT_PREFERENCES);
      applyTheme(DEFAULT_PREFERENCES.theme);

      // Try to persist defaults to user_preferences (best-effort)
      try {
        const payload = {
          user_id: currentUser.id,
          theme: DEFAULT_PREFERENCES.theme,
          font_size: DEFAULT_PREFERENCES.fontSize,
          code_editor_theme: DEFAULT_PREFERENCES.codeTheme,
          email_notifications: DEFAULT_PREFERENCES.emailNotifications,
          show_hints: DEFAULT_PREFERENCES.showHints,
          auto_save_enabled: DEFAULT_PREFERENCES.autoAdvance,
          sound_effects_enabled: !DEFAULT_PREFERENCES.reducedMotion,
          updated_at: new Date().toISOString(),
        };

        const { data: upsertData, error: upsertErr } = await supabase.from('user_preferences').upsert(payload, { onConflict: 'user_id' });

        if (upsertErr) {
          // Failed to persist default preferences to user_preferences (silent)
        }
      } catch (e) {
        // ignore — fallback will apply locally (silent)
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preferences');

      // Fall back to defaults
      setPreferences(DEFAULT_PREFERENCES);
      applyTheme(DEFAULT_PREFERENCES.theme);
    } finally {
      setLoading(false);
    }
  }, [profile, savePreferencesCallback]);

  /**
   * Load preferences on mount and user change
   */
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  /**
   * Save preferences to database
   */
  // Backwards-compatible named export used elsewhere
  const savePreferences = useCallback(async (newPreferences: UserPreferences) => {
    return savePreferencesCallback(newPreferences);
  }, [savePreferencesCallback]);


  /**
   * Apply theme to document
   */
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    if (theme === 'system') {
      // Use system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  };

  /**
   * Set theme
   */
  const setTheme = useCallback(async (theme: Theme) => {
    try {
      setLoading(true);
      setError(null);

      const newPreferences = { ...preferences, theme };

      setPreferences(newPreferences);
      applyTheme(theme);

      await savePreferences(newPreferences);
    } catch (err) {
      console.error('Error setting theme:', err);
      setError(err instanceof Error ? err.message : 'Failed to save theme');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [preferences, savePreferences]);

  /**
   * Toggle theme (light <-> dark)
   */
  const toggleTheme = useCallback(async () => {
    const currentTheme = preferences.theme;
    let newTheme: Theme;

    if (currentTheme === 'system') {
      // System -> Dark
      newTheme = 'dark';
    } else if (currentTheme === 'dark') {
      // Dark -> Light
      newTheme = 'light';
    } else {
      // Light -> System
      newTheme = 'system';
    }

    await setTheme(newTheme);
  }, [preferences.theme, setTheme]);

  /**
   * Update user preferences
   */
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      setError(null);

      const newPreferences = { ...preferences, ...updates };

      setPreferences(newPreferences);

      // Apply theme if it was updated
      if (updates.theme) {
        applyTheme(updates.theme);
      }

      await savePreferences(newPreferences);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [preferences, savePreferences]);

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      setPreferences(DEFAULT_PREFERENCES);
      applyTheme(DEFAULT_PREFERENCES.theme);

      if (userRef.current?.id) {
        await savePreferences(DEFAULT_PREFERENCES);
      }
    } catch (err) {
      console.error('Error resetting preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [savePreferences]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh preferences from database
   */
  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = () => {
        applyTheme('system');
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [preferences.theme]);

  const value: PreferencesContextType = {
    // State
    preferences,
    loading,
    error,

    // Theme Operations
    theme: preferences.theme,
    setTheme,
    toggleTheme,

    // Preference Updates
    updatePreferences,
    resetPreferences,

    // Utilities
    clearError,
    refreshPreferences,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access preferences context
 * Must be used within PreferencesProvider
 */
export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }

  return context;
}
