import calculateStreak, { ProgressRecord } from '../calculateStreak';

describe('calculateStreak', () => {
  test('returns 0 for empty or null records', () => {
    expect(calculateStreak([])).toBe(0);
    expect(calculateStreak(null)).toBe(0);
    expect(calculateStreak(undefined)).toBe(0);
  });

  test('counts a single day even with multiple completions same day', () => {
    const recs: ProgressRecord[] = [
      { lesson_id: 'l1', completed_at: '2025-12-24T02:00:00Z' },
      { lesson_id: 'l2', completed_at: '2025-12-24T18:00:00Z' }
    ];
    expect(calculateStreak(recs)).toBe(1);
  });

  test('counts consecutive days correctly', () => {
    const recs: ProgressRecord[] = [
      { lesson_id: 'l1', completed_at: '2025-12-22T10:00:00Z' },
      { lesson_id: 'l2', completed_at: '2025-12-23T11:00:00Z' },
      { lesson_id: 'l3', completed_at: '2025-12-24T09:00:00Z' }
    ];
    expect(calculateStreak(recs)).toBe(3);
  });

  test('streak breaks on gap', () => {
    const recs: ProgressRecord[] = [
      { lesson_id: 'l1', completed_at: '2025-12-20T10:00:00Z' },
      { lesson_id: 'l2', completed_at: '2025-12-22T11:00:00Z' },
      { lesson_id: 'l3', completed_at: '2025-12-23T09:00:00Z' }
    ];
    // Dates present: 2025-12-20, 2025-12-22, 2025-12-23
    // Most recent streak ends at 2025-12-23 and includes 22 & 23 => 2
    expect(calculateStreak(recs)).toBe(2);
  });
});
