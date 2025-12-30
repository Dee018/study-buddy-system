import React from 'react';
import useUserStreak from '../hooks/useUserStreak';

type Props = {
  userId?: string | null;
  subscribe?: boolean; // enable realtime subscription across clients
  showHeader?: boolean; // when false, render compact number+label for stat cards
};

/**
 * UserStreak
 * - Displays user's current consecutive-day streak (UTC-day logic)
 * - Uses `useUserStreak` to always fetch authoritative data from Supabase
 */
export const UserStreak: React.FC<Props> = ({ userId, subscribe = true, showHeader = true }) => {
  const { streak, loading } = useUserStreak(userId, { subscribe });

  if (!showHeader) {
    return (
      <div>
        <div className="text-4xl font-bold text-orange-600 mb-1">{loading ? 'Loading…' : `${streak}`}</div>
        <p className="text-sm text-muted-foreground">{streak === 1 ? 'day' : 'days'}</p>
      </div>
    );
  }

  return (
    <div aria-live="polite" style={{ padding: 10 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>
        {loading ? 'Loading…' : `${streak} day${streak === 1 ? '' : 's'}`}
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>Current Streak</div>
    </div>
  );
};

export default UserStreak;
