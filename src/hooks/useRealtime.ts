/**
 * useRealtime Hook
 * 
 * Hook for subscribing to real-time Supabase updates
 */

import { useEffect, useRef } from 'react';
import { RealtimeService } from '../utils/supabase/dataService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Subscribe to user progress updates in real-time
 * 
 * @param callback - Function to call when progress updates
 * @param enabled - Whether the subscription is enabled
 * 
 * @example
 * useRealtimeProgress((payload) => {
 *   console.log('Progress updated:', payload.new);
 *   refreshProgress();
 * });
 */
export function useRealtimeProgress(
  callback: (payload: any) => void,
  enabled: boolean = true
) {
  const { user } = useAuth();
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!user || !enabled) return;

    // Subscribe to progress updates
    const unsubscribe = RealtimeService.subscribeToUserProgress(
      user.id,
      (payload) => callbackRef.current(payload)
    );

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [user, enabled]);
}

/**
 * Subscribe to module progress updates in real-time
 * 
 * @param callback - Function to call when module progress updates
 * @param enabled - Whether the subscription is enabled
 * 
 * @example
 * useRealtimeModuleProgress((payload) => {
 *   console.log('Module progress updated:', payload.new);
 *   refreshModuleProgress();
 * });
 */
export function useRealtimeModuleProgress(
  callback: (payload: any) => void,
  enabled: boolean = true
) {
  const { user } = useAuth();
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!user || !enabled) return;

    // Subscribe to module progress updates
    const unsubscribe = RealtimeService.subscribeToModuleProgress(
      user.id,
      (payload) => callbackRef.current(payload)
    );

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [user, enabled]);
}

/**
 * Cleanup all real-time subscriptions
 * Useful for cleanup on logout or unmount
 */
export function useCleanupRealtime() {
  useEffect(() => {
    return () => {
      RealtimeService.cleanupAll();
    };
  }, []);
}
