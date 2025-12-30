# Streak System - Quick Reference Guide

## ⚡ Quick Summary

**New Rule**: Streaks ONLY count days with at least **1 lesson completed**.

## 🎯 What Counts

### ✅ Counts for Streak
- Completing any lesson (any module, any track)
- Multiple lessons in one day = 1 day streak
- Lessons completed at any time of day

### ❌ Does NOT Count for Streak  
- Exercises only
- Projects only
- Assessments only
- Logging in without completing a lesson
- Viewing content without completing

## 💻 Developer Usage

### Get Current Streak
```typescript
import { ProgressManager } from '../utils/progressManager';

// Always use this method (calculates based on lessons)
const streak = ProgressManager.getCurrentStreak(userId);
// Returns: number of consecutive days with ≥1 lesson
```

### Get Longest Streak
```typescript
// Always use this method (calculates based on lessons)
const longestStreak = ProgressManager.getLongestStreak(userId);
// Returns: best ever consecutive day streak with ≥1 lesson per day
```

### Check Today's Progress
```typescript
const todayActivity = ProgressManager.getDailyActivity(userId, todayDate);
const hasLesson = todayActivity && todayActivity.lessonsCompleted >= 1;
// Use this to show if user has completed their lesson today
```

## 📊 Display Examples

### Profile Page
```typescript
// Current streak
<div>🔥 {ProgressManager.getCurrentStreak(userId)} days</div>

// Longest streak  
<div>🏆 Best: {ProgressManager.getLongestStreak(userId)} days</div>
```

### Progress Tracker
```typescript
const currentStreak = ProgressManager.getCurrentStreak(userId);
const longestStreak = ProgressManager.getLongestStreak(userId);

<Card>
  <CardTitle>Current Streak</CardTitle>
  <div className="text-2xl">{currentStreak} days</div>
</Card>
```

### Streak Validation
```typescript
// Check if user qualifies for streak badge
const longestStreak = ProgressManager.getLongestStreak(userId);
if (longestStreak >= 7) {
  // Award "Streak Master" badge
  awardBadge('streak-master');
}
```

## 🔄 Real-Time Updates

### When Lesson is Completed
The system automatically:
1. ✅ Updates daily activity counter
2. ✅ Recalculates current streak  
3. ✅ Updates longest streak if needed
4. ✅ Dispatches progress update event

### Components Listen for Updates
```typescript
useEffect(() => {
  const handleProgressUpdate = (event: CustomEvent) => {
    if (event.detail.userId === userId) {
      // Refresh streak display
      const newStreak = ProgressManager.getCurrentStreak(userId);
      setCurrentStreak(newStreak);
    }
  };
  
  window.addEventListener('progressUpdated', handleProgressUpdate);
  return () => window.removeEventListener('progressUpdated', handleProgressUpdate);
}, [userId]);
```

## 🚫 Common Mistakes

### ❌ DON'T Do This
```typescript
// Don't access progress.currentStreak directly
const progress = ProgressManager.loadProgress(userId);
const streak = progress.currentStreak; // WRONG - may be stale/cached
```

### ✅ DO This Instead
```typescript
// Always use the getter method
const streak = ProgressManager.getCurrentStreak(userId); // RIGHT - calculates dynamically
```

## 📱 User-Facing Messages

### Streak Active
```typescript
if (currentStreak > 0) {
  return `🔥 ${currentStreak}-day streak! Keep learning to maintain it.`;
}
```

### No Streak
```typescript
if (currentStreak === 0) {
  return `Complete a lesson today to start your streak! 📚`;
}
```

### Streak Warning (Optional Feature)
```typescript
const todayActivity = ProgressManager.getDailyActivity(userId, todayDate);
if (currentStreak > 0 && (!todayActivity || todayActivity.lessonsCompleted === 0)) {
  return `⚠️ Complete a lesson today to maintain your ${currentStreak}-day streak!`;
}
```

## 🎖️ Badge Requirements

### Streak Master
- **Requirement**: 7-day consecutive lesson streak
- **Code**: `longestStreak >= 7`

### Future Badges (Suggestions)
- **Dedicated Learner**: 14-day streak
- **Learning Legend**: 30-day streak  
- **Unstoppable**: 50-day streak

## 📈 Analytics

### Track Streak Metrics
```typescript
// Average streak length
const allUsers = getAllUsers();
const avgStreak = allUsers.reduce((sum, user) => {
  return sum + ProgressManager.getCurrentStreak(user.id);
}, 0) / allUsers.length;

// Users with active streaks
const activeStreaks = allUsers.filter(user => {
  return ProgressManager.getCurrentStreak(user.id) > 0;
}).length;
```

## 🐛 Debugging

### Check Streak Calculation
```typescript
// Get user's lesson history
const userId = 'ABC-123-DEF-4567';
const allActivity = ProgressManager.getAllDailyActivity(userId);

// Filter to lesson days only
const lessonDays = allActivity.filter(day => day.lessonsCompleted >= 1);

console.log('Lesson days:', lessonDays.map(d => ({
  date: d.date,
  lessons: d.lessonsCompleted
})));

// Current streak
console.log('Current streak:', ProgressManager.getCurrentStreak(userId));

// Longest streak
console.log('Longest streak:', ProgressManager.getLongestStreak(userId));
```

### Verify Streak Logic
```typescript
// Check if today counts
const today = new Date().toISOString().split('T')[0];
const todayActivity = ProgressManager.getDailyActivity(userId, today);
console.log('Today lesson count:', todayActivity?.lessonsCompleted || 0);
console.log('Qualifies for streak:', (todayActivity?.lessonsCompleted || 0) >= 1);
```

## ⚙️ Configuration

### Minimum Lessons Required
Currently hardcoded to `1` lesson per day. To change:

```typescript
// In progressManager.ts - updateStreak() method
const MIN_LESSONS_FOR_STREAK = 1; // Change this value

const hasCompletedLesson = todayActivity && 
  todayActivity.lessonsCompleted >= MIN_LESSONS_FOR_STREAK;
```

## 📝 Testing Checklist

When testing streak functionality:

- [ ] New user completes first lesson → Streak = 1
- [ ] User completes lesson on consecutive day → Streak increments
- [ ] User completes only exercise → Streak unchanged
- [ ] User skips a day → Streak resets to 0
- [ ] User completes multiple lessons same day → Counts as 1 day
- [ ] Current day with no lesson yet → Doesn't break yesterday's streak
- [ ] Longest streak tracks correctly across breaks
- [ ] Profile displays correct streak values
- [ ] Progress tracker shows accurate stats
- [ ] Badges award at correct thresholds

## 🔗 Related Files

- `/utils/progressManager.ts` - Core streak logic
- `/components/Profile.tsx` - Displays streak stats
- `/components/ProgressTracker.tsx` - Detailed streak analytics
- `/components/LearningHub.tsx` - Weekly progress tracking
- `/STREAK_SYSTEM_UPDATE.md` - Full documentation

## 💡 Pro Tips

1. **Always use the getter methods** - They calculate dynamically from lesson data
2. **Don't cache streak values** - They're lightweight to calculate
3. **Check lesson completion** - Use `lessonsCompleted >= 1` pattern
4. **Real-time updates** - Listen for 'progressUpdated' event
5. **User motivation** - Show streak prominently to encourage consistency

## 🎯 Success Metrics

Track these to measure streak system effectiveness:
- % of users with active streaks
- Average streak length
- Longest user streak  
- Streak retention rate (7-day, 14-day, 30-day)
- Correlation between streaks and completion rates

---

**Remember**: The goal is to encourage **consistent learning**, not gaming the system. Requiring lessons ensures genuine engagement! 🎓
