export type ProgressRecord = {
  lesson_id: string;
  module_id?: string;
  completed_at: string; // ISO timestamp
};

/**
 * calculateStreak
 * - Input: array of completion records with `completed_at` (ISO timestamp)
 * - Behavior: counts consecutive calendar days (UTC) ending at the most recent completion date.
 * - Returns: number of consecutive days (0 when no records).
 *
 * Uses UTC-day boundaries to avoid local/UTC mismatches.
 */
export function calculateStreak(records: ProgressRecord[] | null | undefined): number {
  if (!records || records.length === 0) return 0;

  const dateSet = new Set<string>();
  for (const r of records) {
    if (!r?.completed_at) continue;
    const d = new Date(r.completed_at);
    if (isNaN(d.getTime())) continue;
    const ymd = d.toISOString().slice(0, 10); // UTC date
    dateSet.add(ymd);
  }

  if (dateSet.size === 0) return 0;

  const dates = Array.from(dateSet).sort();

  let streak = 0;
  let expected = new Date(dates[dates.length - 1] + 'T00:00:00Z');

  for (let i = dates.length - 1; i >= 0; i--) {
    const cur = new Date(dates[i] + 'T00:00:00Z');
    const sameDay =
      cur.getUTCFullYear() === expected.getUTCFullYear() &&
      cur.getUTCMonth() === expected.getUTCMonth() &&
      cur.getUTCDate() === expected.getUTCDate();

    if (!sameDay) break;

    streak++;
    expected = new Date(expected.getTime() - 24 * 60 * 60 * 1000);
  }

  return streak;
}

export default calculateStreak;
