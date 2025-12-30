/**
 * Authentication Context
 * 
 * Provides global authentication state and operations
 * Replaces localStorage-based user management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { AuthService, type UserProfile } from '../utils/supabase/dataService';
import { onAuthStateChange } from '../utils/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthContextType {
  // State
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;

  // Actions
  signUp: (email: string, password: string, username: string, uuid: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  verifyRecoveryUUID: (uuid: string) => Promise<{ username: string; userId: string } | null>;
  resetPassword: (uuid: string, newPassword: string) => Promise<boolean>;
  updateProfile?: (updates: Partial<{ username: string }>) => Promise<void>;
  changePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount?: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load current user session on mount
   */
  useEffect(() => {
    // Subscribe first so we don't miss any realtime auth events during initial probe
    const unsub = onAuthStateChange(async ({ event, session }) => {
      try {
        // onAuthStateChange event received (silent)
        // event values: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // session contains user info; reload session and hydrate
          await loadSession();
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          // Supabase explicitly signaled sign-out: clear state (silent)
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      } catch (e) {
        // AuthContext auth-state handler error (silent)
      }
    });

    // Probe session after subscribing so onAuthStateChange events are observed
    void loadSession();

    return () => { try { unsub(); } catch { } };
  }, []);

  /**
   * Load session and user data
   */
  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      // probing Supabase session (silent)
      const currentSession = await AuthService.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        // session resolved - user present (silent)
        setUser(currentSession.user);

        // Load user profile (with debug)
        const userProfile = await AuthService.getUserProfile(currentSession.user.id);
        // user profile loaded (silent)
        setProfile(userProfile);

        // Populate and refresh progress cache so UI shows completed items immediately
        try {
          const mod = await import('../utils/progressSyncManager');
          const ProgressSync = mod.default || mod.ProgressSyncManager;
          const uid = currentSession.user.id;
          if (ProgressSync) {
            if (typeof ProgressSync.initUserProgress === 'function') {
              await ProgressSync.initUserProgress(uid);
            }
            // Ensure any queued local updates are processed and then re-load
            try {
              if (typeof ProgressSync.triggerQueueProcessingForUser === 'function') {
                await ProgressSync.triggerQueueProcessingForUser(uid);
              }
            } catch (_) { /* best-effort */ }
            try {
              if (typeof ProgressSync.loadProgressAsync === 'function') {
                await ProgressSync.loadProgressAsync(uid);
              }
            } catch (_) { /* best-effort */ }
          }
        } catch (e) {
          // progress hydration/refresh failed (silent)
        }
      } else {
        // session resolved - no active session (silent)
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up new user
   */
  const signUp = async (email: string, password: string, username: string, uuid: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user: newUser, session: newSession } = await AuthService.signUp(
        email,
        password,
        username,
        uuid
      );

      setUser(newUser);
      setSession(newSession);

      // Load profile
      if (newUser) {
        const userProfile = await AuthService.getUserProfile(newUser.id);
        setProfile(userProfile);
      }
      // Notify other subsystems (analytics) that a user has signed in
      try {
        window.dispatchEvent(new CustomEvent('sb:user-signed-in', { detail: { userId: newUser?.id } }));
      } catch (e) {
        /* ignore in non-browser environments */
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { user: signedInUser, session: newSession } = await AuthService.signIn(
        username,
        password
      );

      setUser(signedInUser);
      setSession(newSession);

      // Load profile
      if (signedInUser) {
        const userProfile = await AuthService.getUserProfile(signedInUser.id);
        setProfile(userProfile);
        // Populate and refresh progress cache and process any queued local updates
        try {
          const mod = await import('../utils/progressSyncManager');
          const ProgressSync = mod.default || mod.ProgressSyncManager;
          const uid = signedInUser.id;
          if (ProgressSync) {
            if (typeof ProgressSync.initUserProgress === 'function') {
              await ProgressSync.initUserProgress(uid);
            }
            try {
              if (typeof ProgressSync.triggerQueueProcessingForUser === 'function') {
                await ProgressSync.triggerQueueProcessingForUser(uid);
              }
            } catch (_) { /* best-effort */ }
            try {
              if (typeof ProgressSync.loadProgressAsync === 'function') {
                await ProgressSync.loadProgressAsync(uid);
              }
            } catch (_) { /* best-effort */ }
          }
        } catch (e) { /* ignore */ }
      }
      // Notify analytics that a user signed in
      try {
        window.dispatchEvent(new CustomEvent('sb:user-signed-in', { detail: { userId: signedInUser?.id } }));
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Best-effort: don't block client logout on network errors.
      await AuthService.signOut();

      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err instanceof Error ? err.message : 'Sign out failed');
      // Clear local state even if sign-out request failed.
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile (UI-facing wrapper). Currently supports username changes.
   */
  const updateProfile = async (updates: Partial<{ username: string }>) => {
    if (!session?.user || !session.user.id) throw new Error('Not authenticated');
    try {
      setLoading(true);
      setError(null);
      if (updates.username) {
        const { AuthService } = await import('../utils/supabase/dataService');
        // Update only the user_profiles table (no auth changes)
        await AuthService.updateUserProfile(session.user.id, { username: updates.username });
        // refresh local profile state from DB
        const fresh = await AuthService.getUserProfile(session.user.id);
        setProfile(fresh);
      }
    } catch (e: any) {
      console.error('updateProfile error:', e);
      setError(e?.message || 'Failed to update profile');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    await loadSession();
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Verify recovery UUID
   */
  const verifyRecoveryUUID = async (uuid: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AuthService.verifyRecoveryUUID(uuid);
      return result;
    } catch (err) {
      console.error('Verify recovery UUID error:', err);
      setError(err instanceof Error ? err.message : 'Verify recovery UUID failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (uuid: string, newPassword: string, username?: string) => {
    try {
      setLoading(true);
      setError(null);

      const success = await AuthService.resetPasswordWithUUID(uuid, newPassword, username);
      return success;
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err instanceof Error ? err.message : 'Reset password failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change password for signed-in user
   */
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!session?.user) throw new Error('Not authenticated');
    try {
      setLoading(true);
      setError(null);
      const { AuthService } = await import('../utils/supabase/dataService');
      await AuthService.changePassword(newPassword);
    } catch (e: any) {
      console.error('changePassword error:', e);
      setError(e?.message || 'Failed to change password');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete account wrapper
   */
  const deleteAccount = async () => {
    if (!session?.user) throw new Error('Not authenticated');
    const userId = session.user.id;
    const accessToken = (session as any)?.access_token || null;

    try {
      setLoading(true);
      setError(null);

      // 1) Signal analytics and other user-bound services to stop.
      try {
        window.dispatchEvent(new CustomEvent('sb:shutdown-analytics', { detail: { userId } }));
      } catch (e) {
        // Failed to dispatch analytics shutdown event (silent)
      }

      const { AuthService } = await import('../utils/supabase/dataService');

      // Record deleted user in `deleted_users` so admins can review/restore
      try {
        const archived = await AuthService.archiveDeletedUser(userId, {
          username: profile?.username,
          email: (profile as any)?.email || undefined,
          uuid: profile?.uuid,
          reason: 'User-initiated account closure',
          deletion_type: 'self',
        });
        if (!archived) {
          // archiveDeletedUser returned false — archival may have failed or been blocked by RLS (silent)
          try {
            // Notify user/admin surface via toast but continue with deletion flow
            toast.warn('Account deletion proceeded but archival to deleted_users failed. Admins may not see this deletion.');
          } catch (_) { }
        }
      } catch (err) {
        // Failed to archive deleted user (continuing) (silent)
      }

      // 2) Sign the user out locally first to remove client session state
      try {
        await AuthService.signOut();
      } catch (e) {
        // Sign out before deletion failed (continuing) (silent)
      }

      // 3) Attempt server-side admin deletion if configured (preferred)
      const adminUrl = (import.meta.env.VITE_ADMIN_API_URL as string) || '';
      if (adminUrl) {
        try {
          const url = `${adminUrl.replace(/\/$/, '')}/delete-user`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({ userId }),
          });

          if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Server delete failed: ${resp.status} ${text}`);
          }

          toast.success('Account deleted successfully');
        } catch (e: any) {
          console.error('Admin delete-user request failed:', e);
          // Fallback: try best-effort local deletion of profile
          try {
            await AuthService.deleteAccount(userId);
            toast.success('Account deleted (partial) — profile removed locally');
          } catch (inner) {
            console.error('Fallback profile deletion failed:', inner);
            toast.error(e?.message || 'Failed to delete account');
            throw e;
          }
        }
      } else {
        // No admin API configured: attempt best-effort deletion of profile then sign-out
        try {
          await AuthService.deleteAccount(userId);
          toast.success('Account deleted successfully');
        } catch (e: any) {
          console.error('deleteAccount (fallback) error:', e);
          toast.error(e?.message || 'Failed to delete account');
          throw e;
        }
      }

      // 4) Clear local state and redirect to landing page
      setUser(null);
      setProfile(null);
      setSession(null);
      try {
        window.location.href = '/';
      } catch (e) {
        // ignore redirect errors
      }
    } catch (e: any) {
      console.error('deleteAccount error:', e);
      setError(e?.message || 'Failed to delete account');
      toast.error(e?.message || 'Failed to delete account');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    refreshUser,
    clearError,
    verifyRecoveryUUID,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}