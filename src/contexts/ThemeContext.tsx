/**
 * Theme Context
 * 
 * Provides global theme state and operations
 * Replaces localStorage-based theme management
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from './AuthContext';

// ============================================================================
// TYPES
// ============================================================================

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  loading: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark
  const [loading, setLoading] = useState(true);

  /**
   * Load theme on mount and when user changes
   */
  const loadTheme = useCallback(async () => {
    try {
      setLoading(true);

      if (user) {
        // Load from Supabase user_preferences
        const { data, error } = await supabase
          .from('user_preferences')
          .select('theme')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.theme) {
          setThemeState(data.theme as Theme);
        } else {
          // No preference saved, use system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setThemeState(prefersDark ? 'dark' : 'light');
        }
      } else {
        // Not logged in, use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
      }
    } catch (err) {
      console.error('Error loading theme:', err);
      // Default to dark on error
      setThemeState('dark');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  /**
   * Apply theme to document
   */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /**
   * Load theme from Supabase or system preference
   */


  /**
   * Apply theme to document root
   */
  const applyTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  /**
   * Save theme to Supabase
   */
  const saveTheme = async (newTheme: Theme) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          theme: newTheme,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: ['user_id']
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error saving theme:', error);
      }

      if (error) {
        console.error('Error saving theme:', error);
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  };

  /**
   * Toggle theme
   */
  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    await saveTheme(newTheme);
  };

  /**
   * Set specific theme
   */
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await saveTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    loading,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
