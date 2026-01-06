import { useCallback, useEffect, useState, useRef } from 'react';
import { ProgressSyncManager } from '../utils/progressSyncManager';
import { supabase } from '../utils/supabase/client';
import calculateStreak, { ProgressRecord } from '../utils/calculateStreak';

export type UseUserStreakOptions = {
  // when true, subscribe to Supabase realtime/postgres_changes for `user_progress`
  subscribe?: boolean;
};

/**
 * useUserStreak
 * - Fetches confirmed `user_progress` rows for `userId` from Supabase (source-of-truth)
 * - Computes streak using `calculateStreak`
 * - Optionally subscribes to realtime `user_progress` changes for this user so multiple clients update automatically
 */
export function useUserStreak(userId?: string | null, opts?: UseUserStreakOptions) {
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const channelRef = useRef<any>(null);

  const fetchAndCompute = useCallback(async () => {
    if (!userId) {
      setStreak(0);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from<ProgressRecord>('lesson_completions')
        .select('lesson_id, module_id, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (error) {
        console.error('[useUserStreak] supabase fetch error', error);
        return;
      }

      const records = (data || []) as ProgressRecord[];
      const newStreak = calculateStreak(records);

      const last = records.length ? records[records.length - 1] : null;

      setStreak(newStreak);
    } catch (err) {
      console.error('[useUserStreak] unexpected error', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchAndCompute();
  }, [fetchAndCompute]);

  // Subscribe to Postgres changes for `user_progress` for this user.
  useEffect(() => {
    if (!opts?.subscribe || !userId) return;

    try {
      // Supabase JS v2 realtime: postgres_changes on table
      const channel = supabase.channel(`lesson-completions-${userId}`);

      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lesson_completions', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          try {
            // Always re-fetch DB for authoritative state
            void fetchAndCompute();
          } catch (e) { /* ignore */ }
        }
      );

      // subscribe() in Supabase v2 returns the channel (not a Promise)
      channel.subscribe();
      channelRef.current = channel;

      return () => {
        try {
          const toRemove = channelRef.current ?? channel;
          if (toRemove) {
            supabase.removeChannel(toRemove);
          }
          channelRef.current = null;
        } catch (e) { /* ignore */ }
      };
    } catch (e) {
      // realtime setup failed; swallow silently to avoid debug logging
    }
  }, [opts?.subscribe, userId, fetchAndCompute]);

  // Subscribe to ProgressSyncManager for progress updates instead of global window events
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = ProgressSyncManager.subscribe((evt: any) => {
      try {
        if (evt && evt.userId === userId) {
          void fetchAndCompute();
        }
      } catch (e) { /* ignore */ }
    });

    return () => {
      try { if (typeof unsubscribe === 'function') unsubscribe(); } catch { }
    };
  }, [userId, fetchAndCompute]);

  return { streak, loading, reload: fetchAndCompute } as const;
}

export default useUserStreak;
