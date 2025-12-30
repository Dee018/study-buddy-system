# 🚀 Progress System Integration Guide

## Quick Start

This guide shows you how to integrate the new Supabase-based progress system into your components.

---

## Step 1: Add ProgressProvider to App

First, wrap your app with the ProgressProvider:

### Update `/AppProviders.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <ProgressProvider>  {/* Add ProgressProvider here */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ProgressProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
```

**Important:** ProgressProvider must be inside AuthProvider because it depends on the authenticated user.

---

## Step 2: Use Progress in Components

### Example: Update LearningHub

```typescript
import { useProgress } from '../contexts/ProgressContext';
import { XPService } from '../utils/supabase/dataService';
import { toast } from 'sonner@2.0.3';

function LearningHub() {
  const {
    userProgress,
    moduleProgress,
    totalXP,
    level,
    loading,
    error,
    startModule,
    completeLesson,
    completeExercise,
    currentStreak,
  } = useProgress();

  // Show loading state
  if (loading) {
    return <div>Loading progress...</div>;
  }

  // Show error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Handle lesson completion
  const handleLessonComplete = async (moduleId: string, lessonId: string) => {
    try {
      const xpEarned = XPService.LESSON_XP; // 50 XP
      const timeSpent = 5; // minutes (calculate based on actual time)

      await completeLesson(moduleId, lessonId, xpEarned, timeSpent);
      
      toast.success(`Lesson completed! +${xpEarned} XP`);
    } catch (err) {
      toast.error('Failed to save progress');
      console.error(err);
    }
  };

  // Handle exercise completion
  const handleExerciseComplete = async (
    moduleId: string,
    exerciseId: string,
    submittedCode: string
  ) => {
    try {
      const xpEarned = XPService.EXERCISE_XP; // 100 XP
      const timeSpent = 10; // minutes
      const attempts = 1; // track how many attempts

      await completeExercise(
        moduleId,
        exerciseId,
        submittedCode,
        xpEarned,
        timeSpent,
        attempts
      );
      
      toast.success(`Exercise completed! +${xpEarned} XP`);
    } catch (err) {
      toast.error('Failed to save solution');
      console.error(err);
    }
  };

  // Handle starting a module
  const handleStartModule = async (moduleId: string) => {
    try {
      await startModule(moduleId);
      toast.success('Module started!');
    } catch (err) {
      toast.error('Failed to start module');
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header with user stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Learning Hub</h1>
          <p className="text-muted-foreground">
            Level {level} • {totalXP} XP
          </p>
        </div>
        
        {/* Streak display */}
        {currentStreak && currentStreak.current_streak > 0 && (
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span>{currentStreak.current_streak} day streak!</span>
          </div>
        )}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(module => {
          const progress = moduleProgress[module.id];
          const isStarted = !!progress;
          const isCompleted = progress?.progress_percentage === 100;

          return (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {module.title}
                  {isCompleted && (
                    <Badge variant="success">Completed</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isStarted ? (
                  <>
                    <Progress value={progress.progress_percentage} className="mb-2" />
                    <div className="text-sm text-muted-foreground">
                      <p>Lessons: {progress.completed_lessons.length}</p>
                      <p>Exercises: {progress.exercises_completed.length}</p>
                      <p>Project: {progress.project_completed ? '✓' : '○'}</p>
                    </div>
                  </>
                ) : (
                  <Button onClick={() => handleStartModule(module.id)}>
                    Start Module
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

---

## Step 3: Display XP Progress

### Create XP Progress Component:

```typescript
import { useProgress } from '../contexts/ProgressContext';
import { XPService } from '../utils/supabase/dataService';
import { Progress } from './ui/progress';

function XPProgressBar() {
  const { totalXP, level } = useProgress();

  const progress = XPService.getProgressToNextLevel(totalXP, level);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Level {level}</span>
        <span>{progress.currentLevelXP} / {progress.nextLevelXP} XP</span>
      </div>
      <Progress value={progress.progressPercentage} />
      <p className="text-xs text-muted-foreground">
        {progress.nextLevelXP - progress.currentLevelXP} XP until Level {level + 1}
      </p>
    </div>
  );
}
```

---

## Step 4: Display Learning Streak

### Create Streak Component:

```typescript
import { useProgress } from '../contexts/ProgressContext';
import { Flame } from 'lucide-react';

function StreakDisplay() {
  const { currentStreak } = useProgress();

  if (!currentStreak || currentStreak.current_streak === 0) {
    return null;
  }

  const isLongStreak = currentStreak.current_streak >= 7;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      isLongStreak ? 'bg-orange-100 dark:bg-orange-950' : 'bg-muted'
    }`}>
      <Flame className={`w-5 h-5 ${
        isLongStreak ? 'text-orange-500' : 'text-muted-foreground'
      }`} />
      <div>
        <p className="font-medium">
          {currentStreak.current_streak} Day Streak! 🔥
        </p>
        <p className="text-xs text-muted-foreground">
          Best: {currentStreak.longest_streak} days
        </p>
      </div>
    </div>
  );
}
```

---

## Step 5: Display Daily Activity

### Create Activity Chart:

```typescript
import { useProgress } from '../contexts/ProgressContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

function ActivityChart() {
  const { dailyActivity } = useProgress();

  // Transform data for chart
  const chartData = dailyActivity.map(day => ({
    date: new Date(day.activity_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    xp: day.total_xp,
    lessons: day.lessons_completed,
    exercises: day.exercises_completed,
  })).reverse(); // Show oldest to newest

  return (
    <div className="space-y-4">
      <h3>Last 30 Days Activity</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="xp" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Activity summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">
            {dailyActivity.reduce((sum, day) => sum + day.lessons_completed, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Lessons</p>
        </div>
        <div>
          <p className="text-2xl font-bold">
            {dailyActivity.reduce((sum, day) => sum + day.exercises_completed, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Exercises</p>
        </div>
        <div>
          <p className="text-2xl font-bold">
            {dailyActivity.reduce((sum, day) => sum + day.total_xp, 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Update Profile Component

### Complete Profile Implementation:

```typescript
import { useProgress } from '../contexts/ProgressContext';
import { useAuth } from '../contexts/AuthContext';
import { XPService } from '../utils/supabase/dataService';

function Profile() {
  const { profile } = useAuth();
  const {
    userProgress,
    totalXP,
    level,
    currentStreak,
    dailyActivity,
    loading,
  } = useProgress();

  if (loading) return <LoadingSpinner />;

  const progress = XPService.getProgressToNextLevel(totalXP, level);

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{profile?.username}</h1>
          <p className="text-muted-foreground">Level {level} Learner</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-primary">{totalXP}</p>
          <p className="text-sm text-muted-foreground">Total XP</p>
        </div>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <XPProgressBar />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {userProgress?.completed_modules.length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold flex items-center gap-2">
              {currentStreak?.current_streak || 0}
              {(currentStreak?.current_streak || 0) > 0 && (
                <Flame className="w-6 h-6 text-orange-500" />
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Best: {currentStreak?.longest_streak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {Math.floor(
                dailyActivity.reduce((sum, day) => sum + day.study_time_minutes, 0) / 60
              )}h
            </p>
            <p className="text-sm text-muted-foreground">Total Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityChart />
        </CardContent>
      </Card>

      {/* Achievements/Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userProgress && userProgress.completed_modules.length > 0 && (
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
                <p className="text-sm font-medium">First Module</p>
              </div>
            )}
            {(currentStreak?.current_streak || 0) >= 7 && (
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Flame className="w-8 h-8 text-orange-500 mb-2" />
                <p className="text-sm font-medium">Week Streak</p>
              </div>
            )}
            {totalXP >= 1000 && (
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Star className="w-8 h-8 text-purple-500 mb-2" />
                <p className="text-sm font-medium">1000 XP</p>
              </div>
            )}
            {level >= 5 && (
              <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <Zap className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-sm font-medium">Level 5</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 7: Handle Time Tracking

### Create Time Tracker Hook:

```typescript
import { useState, useEffect, useRef } from 'react';

export function useTimeTracker() {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start tracking
  const start = () => {
    setStartTime(new Date());
    setElapsedSeconds(0);
    
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  // Stop tracking and return minutes
  const stop = (): number => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const minutes = Math.ceil(elapsedSeconds / 60);
    setStartTime(null);
    setElapsedSeconds(0);
    
    return minutes;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    start,
    stop,
    elapsedSeconds,
    isTracking: startTime !== null,
  };
}

// Usage in component:
function LessonView() {
  const { completeLesson } = useProgress();
  const timeTracker = useTimeTracker();

  useEffect(() => {
    // Start tracking when lesson opens
    timeTracker.start();

    return () => {
      // Stop tracking when lesson closes
      timeTracker.stop();
    };
  }, []);

  const handleComplete = async () => {
    const timeSpent = timeTracker.stop();
    
    await completeLesson(
      moduleId,
      lessonId,
      XPService.LESSON_XP,
      timeSpent
    );
  };

  return (
    <div>
      <p>Time: {Math.floor(timeTracker.elapsedSeconds / 60)}m {timeTracker.elapsedSeconds % 60}s</p>
      <Button onClick={handleComplete}>Complete Lesson</Button>
    </div>
  );
}
```

---

## Step 8: Error Handling

### Best Practices:

```typescript
function MyComponent() {
  const { completeExercise, error, clearError } = useProgress();

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async () => {
    try {
      await completeExercise(/* ... */);
      toast.success('Exercise completed!');
    } catch (err) {
      // Error already set in context
      // Toast will show via useEffect above
      console.error('Exercise completion failed:', err);
    }
  };

  return (
    <div>
      {/* Your component */}
    </div>
  );
}
```

---

## Step 9: Loading States

### Handle Loading:

```typescript
function ProgressOverview() {
  const { loading, userProgress, moduleProgress } = useProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Your content */}
    </div>
  );
}
```

---

## Step 10: Optimistic Updates

### For Better UX:

```typescript
function LessonCard({ lessonId, moduleId }: Props) {
  const { moduleProgress, completeLesson } = useProgress();
  const [isCompleting, setIsCompleting] = useState(false);
  const [optimisticCompleted, setOptimisticCompleted] = useState(false);

  const progress = moduleProgress[moduleId];
  const isCompleted = progress?.completed_lessons.includes(lessonId) || optimisticCompleted;

  const handleComplete = async () => {
    if (isCompleting || isCompleted) return;

    setIsCompleting(true);
    setOptimisticCompleted(true); // Optimistic update

    try {
      await completeLesson(moduleId, lessonId, XPService.LESSON_XP);
      toast.success('Lesson completed!');
    } catch (err) {
      setOptimisticCompleted(false); // Rollback on error
      toast.error('Failed to complete lesson');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <h3>{lesson.title}</h3>
        <Button
          onClick={handleComplete}
          disabled={isCompleting || isCompleted}
        >
          {isCompleting ? 'Saving...' : isCompleted ? 'Completed ✓' : 'Mark Complete'}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## Common Patterns

### 1. Check if Item is Completed:
```typescript
const { moduleProgress } = useProgress();

const isLessonCompleted = (moduleId: string, lessonId: string) => {
  return moduleProgress[moduleId]?.completed_lessons.includes(lessonId) || false;
};

const isExerciseCompleted = (moduleId: string, exerciseId: string) => {
  return moduleProgress[moduleId]?.exercises_completed.includes(exerciseId) || false;
};

const isProjectCompleted = (moduleId: string) => {
  return moduleProgress[moduleId]?.project_completed || false;
};
```

### 2. Calculate Module Completion:
```typescript
const getModuleCompletion = (moduleId: string, module: Module) => {
  const progress = moduleProgress[moduleId];
  
  if (!progress) return 0;
  
  const totalItems = 
    module.lessons.length + 
    module.exercises.length + 
    (module.project ? 1 : 0);
    
  const completedItems = 
    progress.completed_lessons.length +
    progress.exercises_completed.length +
    (progress.project_completed ? 1 : 0);
    
  return Math.floor((completedItems / totalItems) * 100);
};
```

### 3. Award Bonus XP:
```typescript
const { awardXP } = useProgress();

// Award bonus for completing all exercises in a module
const awardModuleCompletionBonus = async (moduleId: string) => {
  await awardXP(
    150, // amount
    'bonus', // source type
    moduleId, // source id
    'Completed all exercises in module!' // description
  );
  
  toast.success('Bonus XP awarded! +150 XP');
};
```

---

## Migration Checklist

- [ ] Add ProgressProvider to AppProviders
- [ ] Update LearningHub to use useProgress()
- [ ] Update Profile to use useProgress()
- [ ] Update ProgressTracker to use useProgress()
- [ ] Remove all ProgressManager imports
- [ ] Remove all XPSystem.calculateTotalPoints() calls
- [ ] Remove all localStorage.getItem('study_buddy_progress') calls
- [ ] Add time tracking for lessons/exercises
- [ ] Add error handling with toast notifications
- [ ] Test lesson completion flow
- [ ] Test exercise completion flow
- [ ] Test project completion flow
- [ ] Test streak tracking
- [ ] Test multi-device sync
- [ ] Delete /utils/progressManager.ts
- [ ] Delete /utils/xpSystem.ts
- [ ] Update all component tests

---

## Troubleshooting

### Issue: "useProgress must be used within a ProgressProvider"

**Solution:**
Make sure ProgressProvider is in your AppProviders and wraps all components that use useProgress().

---

### Issue: Progress not loading

**Solution:**
1. Check that user is authenticated: `const { user } = useAuth();`
2. Check browser console for errors
3. Verify Supabase tables exist
4. Check RLS policies allow SELECT

---

### Issue: Completions not saving

**Solution:**
1. Check network tab for failed requests
2. Verify RLS policies allow INSERT
3. Check that all required fields are provided
4. Look for unique constraint violations

---

### Issue: Real-time not updating

**Solution:**
1. Verify Supabase Realtime is enabled in dashboard
2. Check RLS policies allow SELECT on tables
3. Ensure subscription channel is active
4. Check browser console for WebSocket errors

---

## Summary

You now have everything you need to integrate the progress system:

✅ ProgressProvider setup  
✅ useProgress() hook usage  
✅ XP display components  
✅ Streak tracking  
✅ Activity charts  
✅ Time tracking  
✅ Error handling  
✅ Loading states  
✅ Optimistic updates  

**Next:** Update your components and test thoroughly!
