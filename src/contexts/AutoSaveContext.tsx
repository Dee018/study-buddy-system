/**
 * AutoSave Context
 * 
 * Manages automatic saving of user work (code, exercises, projects)
 * Syncs across devices via Supabase real-time
 * Replaces autoSaveManager localStorage with database persistence
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabase/client';
import { supabaseCall } from '../utils/supabase/withRetries';
import { useAuth } from './AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutoSaveData {
  id: string;
  user_id: string;
  module_id: string;
  item_type: 'exercise' | 'project' | 'assessment' | 'scratch';
  item_id: string; // exercise_id, project_id, or 'scratch_pad'
  saved_code: string; // Code or text content
  metadata?: {
    language?: string;
    cursor_position?: number;
    scroll_position?: number;
    last_test_results?: any;
  };
  created_at: string;
  updated_at: string;
}

export interface AutoSaveContextType {
  // State
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;

  // Auto-Save Operations
  saveContent: (
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    content: string,
    metadata?: Record<string, any>,
    moduleId?: string
  ) => Promise<void>;

  loadSavedContent: (
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    moduleId?: string
  ) => Promise<AutoSaveData | null>;

  deleteSavedContent: (
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    moduleId?: string
  ) => Promise<void>;

  getAllSavedContent: () => Promise<AutoSaveData[]>;

  // Auto-Save Configuration
  enableAutoSave: (
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    content: string,
    interval?: number,
    moduleId?: string
  ) => () => void;

  // Utilities
  clearError: () => void;
  forceSave: () => Promise<void>;
  // Restore helpers
  shouldPromptRestoreFor: (contentType: 'exercise' | 'project' | 'assessment' | 'scratch', contentId: string) => boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AutoSaveContext = createContext<AutoSaveContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

const DEFAULT_AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export function AutoSaveProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Tab-scoped session id created at app startup by AppProviders
  const TAB_SESSION_KEY = 'current_session_id';
  const tabSessionId = (typeof window !== 'undefined' && sessionStorage.getItem(TAB_SESSION_KEY)) || null;

  // Helper: ensure restore prompts only fire once per tab/session.
  // Uses a sessionStorage sentinel keyed by tabSessionId + content key.
  // Always return false to guarantee restore UI never appears.
  const shouldPromptRestoreFor = useCallback((_: 'exercise' | 'project' | 'assessment' | 'scratch', __: string) => {
    return false;
  }, []);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentContentRef = useRef<{
    contentType: string;
    contentId: string;
    content: string;
    metadata?: Record<string, any>;
    moduleId?: string;
  } | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);
  // Pending saves queue (keyed by `${moduleId}:${contentType}:${contentId}`)
  const pendingSavesRef = useRef<Map<string, { contentType: string; contentId: string; content: string; metadata?: Record<string, any>; moduleId?: string; attempts: number }>>(new Map());
  const pendingFlushTimerRef = useRef<number | null>(null);
  // Throttle map to avoid repeating identical load errors in console
  const loadErrorTimestampsRef = useRef<Record<string, number>>({});
  // Global cooldown to avoid hammering Supabase when network/CORS failures occur
  const globalFailureTsRef = useRef<number | null>(null);

  const schedulePendingFlush = useCallback(() => {
    if (pendingFlushTimerRef.current != null) return;
    pendingFlushTimerRef.current = window.setInterval(async () => {
      if (pendingSavesRef.current.size === 0) {
        if (pendingFlushTimerRef.current != null) {
          clearInterval(pendingFlushTimerRef.current);
          pendingFlushTimerRef.current = null;
        }
        return;
      }

      for (const [key, entry] of Array.from(pendingSavesRef.current.entries())) {
        try {
          await supabaseCall(() => supabase.from('auto_save_data').upsert({
            user_id: user?.id,
            module_id: entry.moduleId || '',
            item_type: entry.contentType,
            item_id: entry.contentId,
            saved_code: entry.content,
            metadata: entry.metadata,
            updated_at: new Date().toISOString()
          }, { onConflict: ['user_id', 'module_id', 'item_type', 'item_id'] }).select(), {
            retries: 2,
            timeoutMs: 6000
          });

          pendingSavesRef.current.delete(key);
        } catch (err) {
          entry.attempts = (entry.attempts || 0) + 1;
          // Give up after several attempts
          if (entry.attempts > 5) {
            // Dropping pending autosave after repeated failures (silent)
            pendingSavesRef.current.delete(key);
          }
        }
      }
    }, 5000);
  }, [user?.id]);

  // ------------------
  // Robust loader with retries and env checks
  // ------------------
  // Disabled loader: do not perform any reads, network calls, or retries.
  // Always return null to prevent any restore behavior.
  async function loadContent(
    _contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    _contentId: string,
    _moduleId: string | undefined,
    _userId: string
  ): Promise<AutoSaveData | null> {
    return null;
  }

  /**
   * Save content to database
   */
  const saveContent = useCallback(async (
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    content: string,
    metadata?: Record<string, any>,
    moduleId?: string
  ) => {
    if (!user?.id) {
      // User not authenticated, cannot save content (silent)
      return;
    }

    try {
      setSaveStatus('saving');
      setError(null);

      // Attempt to persist with supabaseCall (retries + timeout)
      try {
        await supabaseCall(() => supabase.from('auto_save_data').upsert({
          user_id: user.id,
          module_id: moduleId || '',
          item_type: contentType,
          item_id: contentId,
          saved_code: content,
          metadata,
          updated_at: new Date().toISOString()
        }, { onConflict: ['user_id', 'module_id', 'item_type', 'item_id'] }).select(), {
          retries: 3,
          initialDelayMs: 300,
          timeoutMs: 8000
        });

        setSaveStatus('saved');
        setLastSaved(new Date());

        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        // Queue pending save for background retries
        const key = `${moduleId || ''}:${contentType}:${contentId}`;
        pendingSavesRef.current.set(key, { contentType, contentId, content, metadata, moduleId, attempts: 1 });
        schedulePendingFlush();

        setError(err instanceof Error ? err.message : 'Failed to save content, queued for retry');
        setSaveStatus('error');
        // Auto-save queued due to error (silent)
      }
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save content');
      setSaveStatus('error');
    }
  }, [user?.id, schedulePendingFlush]);

  /**
   * Load saved content
   */
  const loadSavedContent = useCallback(async (
    _contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    _contentId: string,
    _moduleId?: string
  ): Promise<AutoSaveData | null> => {
    // No reads allowed: always return null.
    return null;
  }, []);

  // When a user signs in, aggressively remove any leftover local drafts so
  // they won't trigger restore UI in other parts of the app.
  useEffect(() => {
    if (!user?.id) return;
    try {
      const prefixes = [
        'study_buddy_autosave_',
        'unsaved_work_',
        'study_buddy_unsaved_',
        'auto_save_',
        'study_buddy_progress',
        'study_buddy_temp_',
        'sb_autosave_',
        'exerciseDraft_'
      ];

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
        const lower = key.toLowerCase();
        if (prefixes.some(p => lower.startsWith(p))) {
          try { localStorage.removeItem(key); } catch { /* ignore */ }
        }
      }

      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (!key) continue;
        const lower = key.toLowerCase();
        if (prefixes.some(p => lower.startsWith(p))) {
          try { sessionStorage.removeItem(key); } catch { /* ignore */ }
        }
      }
    } catch (e) {
      // ignore
    }
  }, [user?.id]);

  /**
   * Delete saved content
   */
  const deleteSavedContent = useCallback(async (
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    moduleId?: string
  ) => {
    // No-op: deletes are disabled to prevent any network calls from autosave
    // context. If deletion is required, perform via server-admin workflows.
    return;
  }, [user?.id]);

  /**
   * Get all saved content for user
   */
  const getAllSavedContent = useCallback(async (): Promise<AutoSaveData[]> => {
    // No reads allowed from autosave context; return empty list.
    return [];
  }, [user?.id]);

  /**
   * Enable auto-save with debouncing
   */
  const enableAutoSave = useCallback((
    contentType: 'exercise' | 'project' | 'assessment' | 'scratch',
    contentId: string,
    content: string,
    interval: number = DEFAULT_AUTO_SAVE_INTERVAL,
    moduleId?: string
  ): (() => void) => {
    // Store current content in ref
    currentContentRef.current = {
      contentType,
      contentId,
      content,
      moduleId,
    };

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(() => {
      if (currentContentRef.current) {
        saveContent(
          currentContentRef.current.contentType as any,
          currentContentRef.current.contentId,
          currentContentRef.current.content,
          currentContentRef.current.metadata,
          currentContentRef.current.moduleId
        );
      }
    }, interval);

    // Return cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [saveContent]);

  /**
   * Force save immediately
   */
  const forceSave = useCallback(async () => {
    if (currentContentRef.current) {
      await saveContent(
        currentContentRef.current.contentType as any,
        currentContentRef.current.contentId,
        currentContentRef.current.content,
        currentContentRef.current.metadata,
        currentContentRef.current.moduleId
      );
      // Also attempt to flush pending saves immediately
      if (pendingSavesRef.current.size > 0) {
        for (const [key, entry] of Array.from(pendingSavesRef.current.entries())) {
          try {
            await supabaseCall(() => supabase.from('auto_save_data').upsert({
              user_id: user?.id,
              module_id: entry.moduleId || '',
              item_type: entry.contentType,
              item_id: entry.contentId,
              saved_code: entry.content,
              metadata: entry.metadata,
              updated_at: new Date().toISOString()
            }, { onConflict: ['user_id', 'module_id', 'item_type', 'item_id'] }).select(), {
              retries: 2,
              timeoutMs: 6000
            });
            pendingSavesRef.current.delete(key);
          } catch (err) {
            // leave in queue for scheduled retry
          }
        }
      }
    }
  }, [saveContent, user?.id]);

  /**
   * Subscribe to real-time updates for multi-device sync
   */
  useEffect(() => {
    // Real-time autosave subscription disabled to prevent any network reads
    // or background syncs that might re-introduce restore behavior.
    return undefined;
  }, [user?.id]);

  /**
   * Auto-save on page unload
   */
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentContentRef.current && user?.id) {
        // Force synchronous save on page unload
        await forceSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [forceSave, user?.id]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AutoSaveContextType = {
    // State
    saveStatus,
    lastSaved,
    error,

    // Auto-Save Operations
    saveContent,
    loadSavedContent,
    deleteSavedContent,
    getAllSavedContent,

    // Auto-Save Configuration
    enableAutoSave,

    // Utilities
    clearError,
    forceSave,
    // Restore helpers
    shouldPromptRestoreFor,
  };

  return <AutoSaveContext.Provider value={value}>{children}</AutoSaveContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access auto-save context
 * Must be used within AutoSaveProvider
 */
export function useAutoSave() {
  const context = useContext(AutoSaveContext);

  if (!context) {
    throw new Error('useAutoSave must be used within an AutoSaveProvider');
  }

  return context;
}
