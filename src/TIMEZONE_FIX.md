# Timezone Fix - Local Timezone Support

## Problem
The system was using UTC time (via `toISOString()`) for all date operations, which caused activities to be recorded on the wrong calendar day for users in different timezones. For example:
- A user in PST (UTC-8) completing a lesson at 11 PM local time would have it recorded as the next day in UTC (7 AM the next day)
- This made the Weekly Progress card show incorrect dates and activity counts

## Solution
Converted all date handling from UTC to local timezone throughout the system.

## Changes Made

### 1. `/utils/progressManager.ts`

#### Added Helper Method
```typescript
// Convert a Date object to YYYY-MM-DD format (using local timezone)
private static dateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

#### Updated `getTodayDate()`
- Changed from: `today.toISOString().split('T')[0]` (UTC)
- Changed to: Manual construction using local date components
- Now returns date in user's local timezone

#### Updated All Date Operations
- `updateStreak()`: Now uses `dateToString()` for yesterday calculation
- `getWeeklyActivity()`: Both current week and last 7 days modes now use local dates
- `getPerformanceTrend()`: Assessment date comparisons now use local timezone
- All date string generation now uses `dateToString()` helper

### 2. `/components/LearningHub.tsx`

#### Updated `getWeeklyProgressData()`
- Changed from: `today.toISOString().split('T')[0]`
- Changed to: Manual construction from local date components
- Date comparisons now properly parse and compare in local timezone
- Future date detection now works correctly with local time

#### Updated `getWeekTotals()`
- Date filtering now uses local timezone for accurate past/future detection
- Properly parses activity dates as local dates (not UTC)
- Ensures accurate weekly statistics

## Benefits

1. **Accurate Activity Recording**: Activities are now recorded on the correct calendar day for the user's timezone
2. **Correct Weekly Progress Display**: The Weekly Progress card shows activities on the actual days they were completed locally
3. **Proper Future Date Detection**: Days that haven't occurred yet in the user's timezone correctly show "—"
4. **Global Compatibility**: Works correctly for users in any timezone worldwide
5. **Data Consistency**: All dates are stored and compared consistently in local timezone

## Technical Details

### Date Format
- All dates stored as: `YYYY-MM-DD` (e.g., "2025-10-13")
- Generated from local timezone components, not UTC

### Date Comparisons
- Parse dates as local dates using: `new Date(year, month - 1, day)`
- Compare Date objects directly (not strings) for accuracy

### Backward Compatibility
- Existing data remains compatible
- Date format hasn't changed, only the timezone used for generation

## Testing Recommendations

Test the following scenarios:
1. Complete activities late at night (11 PM) - should record on current day
2. Complete activities early morning (1 AM) - should record on current day
3. View Weekly Progress card - should show correct "Today" marker
4. Activities on Monday-Sunday should align with user's calendar week
5. Future days should show "—" correctly based on local date

## Files Modified
- `/utils/progressManager.ts` - Core date handling utilities
- `/components/LearningHub.tsx` - Weekly progress display logic

All date operations now use local timezone for accurate, user-friendly date tracking.
