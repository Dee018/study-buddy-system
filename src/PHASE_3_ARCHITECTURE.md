# 🏗️ Phase 3: Progress System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    JAVA STUDY BUDDY - PROGRESS SYSTEM            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         REACT COMPONENTS                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ LearningHub  │  │   Profile    │  │  Progress    │         │
│  │              │  │              │  │   Tracker    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                            ▼                                     │
│         ┌─────────────────────────────────────┐                 │
│         │      useProgress() Hook             │                 │
│         └─────────────────────────────────────┘                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROGRESS CONTEXT                            │
│                                                                  │
│  State:                                                         │
│  • userProgress         (overall progress)                      │
│  • moduleProgress       (per-module details)                    │
│  • dailyActivity        (last 30 days)                          │
│  • currentStreak        (streak info)                           │
│  • totalXP             (experience points)                      │
│  • level               (current level)                          │
│                                                                  │
│  Actions:                                                       │
│  • startModule()                                                │
│  • completeLesson()                                             │
│  • completeExercise()                                           │
│  • completeProject()                                            │
│  • awardXP()                                                    │
│  • updateStreak()                                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ ProgressService  │  │    XPService     │  │  Realtime    │ │
│  │                  │  │                  │  │   Service    │ │
│  │ • getUserProgress│  │ • awardXP()      │  │ • subscribe  │ │
│  │ • startModule    │  │ • calculateLevel │  │ • unsubscribe│ │
│  │ • completeLesson │  │ • getProgress    │  │ • channels   │ │
│  │ • completeExercise│ │ • transactions   │  │             │ │
│  │ • completeProject│  │ • leveling       │  │             │ │
│  │ • updateStreak   │  │                  │  │             │ │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘ │
└───────────┼──────────────────────┼─────────────────────┼────────┘
            │                      │                     │
            └──────────────────────┼─────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Database Operations:                                    │  │
│  │  • supabase.from('user_progress').select()             │  │
│  │  • supabase.from('module_progress').insert()           │  │
│  │  • supabase.from('lesson_completions').insert()        │  │
│  │  • supabase.from('xp_transactions').insert()           │  │
│  │                                                          │  │
│  │  Real-time Subscriptions:                               │  │
│  │  • supabase.channel('progress').subscribe()            │  │
│  │  • Automatic state updates on database changes          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE BACKEND                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                   │  │
│  │                                                          │  │
│  │  Tables:                                                 │  │
│  │  ├─ user_progress      (overall progress & XP)          │  │
│  │  ├─ module_progress    (per-module completion)          │  │
│  │  ├─ lesson_completions (lesson records)                 │  │
│  │  ├─ exercise_completions (exercise submissions)         │  │
│  │  ├─ project_completions (project submissions)           │  │
│  │  ├─ xp_transactions    (XP history log)                 │  │
│  │  ├─ daily_activity     (daily metrics)                  │  │
│  │  └─ learning_streaks   (streak tracking)                │  │
│  │                                                          │  │
│  │  Features:                                               │  │
│  │  • Row Level Security (RLS)                             │  │
│  │  • Real-time Change Detection                           │  │
│  │  • Automatic Triggers                                   │  │
│  │  • Indexed Queries                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Lesson Completion Flow

```
User clicks "Complete Lesson"
    │
    ▼
Component calls completeLesson(moduleId, lessonId, xpEarned, timeSpent)
    │
    ▼
ProgressContext.completeLesson()
    │
    ├──► ProgressService.completeLesson()
    │        │
    │        ├──► Check if already completed (lesson_completions table)
    │        │
    │        ├──► Insert lesson completion record
    │        │
    │        ├──► Update module_progress.completed_lessons[]
    │        │
    │        └──► Update daily_activity table
    │
    ├──► XPService.awardXP()
    │        │
    │        ├──► Insert xp_transaction record
    │        │
    │        ├──► Update user_progress.total_xp
    │        │
    │        └──► Check for level up → Award bonus XP
    │
    └──► ProgressService.updateStreak()
             │
             ├──► Get current learning_streak
             │
             ├──► Calculate days since last activity
             │
             ├──► Update streak (increment or reset)
             │
             └──► Check for streak milestones → Award bonus XP
                  
    ▼
Real-time subscription fires
    │
    ▼
ProgressContext state updates automatically
    │
    ▼
Component re-renders with new progress
    │
    ▼
UI shows updated XP, level, and completion status
```

---

### XP and Level Up Flow

```
XPService.awardXP(userId, amount, sourceType, sourceId, description)
    │
    ▼
Insert into xp_transactions table
    {
      user_id: userId,
      amount: 100,
      source_type: 'exercise',
      source_id: 'ex-1-1',
      description: 'Completed Hello World exercise',
      created_at: now
    }
    │
    ▼
Get current user_progress
    {
      total_xp: 950,
      level: 1
    }
    │
    ▼
Calculate new totals
    new_total_xp = 950 + 100 = 1050
    new_level = calculateLevel(1050) = 2  // Level up!
    │
    ▼
Update user_progress table
    {
      total_xp: 1050,
      level: 2
    }
    │
    ▼
Detect level increase (2 > 1)
    │
    ▼
Award level-up bonus (recursive call)
    awardXP(userId, 500, 'bonus', null, 'Level Up! Reached Level 2')
    │
    ▼
Insert bonus XP transaction
    {
      user_id: userId,
      amount: 500,
      source_type: 'bonus',
      description: 'Level Up! Reached Level 2',
      created_at: now
    }
    │
    ▼
Update user_progress again
    {
      total_xp: 1550,
      level: 2
    }
    │
    ▼
Real-time subscription fires → UI updates
    │
    ▼
Show "Level Up!" animation and toast
```

---

### Learning Streak Flow

```
User completes any activity (lesson/exercise/project)
    │
    ▼
ProgressContext calls updateStreak()
    │
    ▼
ProgressService.updateLearningStreak(userId)
    │
    ▼
Get current learning_streaks record
    {
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: '2025-12-20'
    }
    │
    ▼
Get today's date: '2025-12-21'
    │
    ▼
Calculate days difference
    last = 2025-12-20
    today = 2025-12-21
    diff = 1 day
    │
    ▼
Apply streak logic:
    
    IF diff === 0:
        // Same day - no change
        return current_streak
        
    ELSE IF diff === 1:
        // Consecutive day - increment
        new_streak = current_streak + 1 = 6
        new_longest = max(6, 10) = 10
        
    ELSE:
        // Streak broken - reset
        new_streak = 1
        new_longest = longest_streak (unchanged)
    │
    ▼
Update learning_streaks table
    {
      current_streak: 6,
      longest_streak: 10,
      last_activity_date: '2025-12-21'
    }
    │
    ▼
Check for streak milestones
    IF new_streak % 7 === 0:
        // Award bonus for week streak
        bonusXP = 50 * (new_streak / 7)
        awardXP(userId, bonusXP, 'streak', null, `${new_streak} day streak!`)
    │
    ▼
Real-time subscription fires → UI updates
    │
    ▼
Display streak badge with flame icon
```

---

## Real-Time Synchronization Architecture

```
┌─────────────┐                    ┌─────────────┐
│  Device 1   │                    │  Device 2   │
│  (Desktop)  │                    │  (Mobile)   │
└──────┬──────┘                    └──────┬──────┘
       │                                  │
       │                                  │
       │  Complete Lesson                │
       │  ────────────►                  │
       │                                  │
       ▼                                  │
┌──────────────────────────────────────────────────┐
│         ProgressContext (Device 1)               │
│                                                  │
│  completeLesson() ──► ProgressService           │
│                           │                      │
│                           ▼                      │
│                    INSERT INTO                   │
│                  lesson_completions              │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│              SUPABASE DATABASE                   │
│                                                  │
│  lesson_completions                              │
│  ├─ new row inserted                            │
│  └─ trigger: update module_progress             │
│                                                  │
│  module_progress                                 │
│  └─ completed_lessons array updated             │
│                                                  │
│  Real-time Change Detection                      │
│  └─ Broadcast to all subscribed clients         │
└──────────────────────┬───────────────────────────┘
                       │
                       ├──────────────┬─────────────┐
                       ▼              ▼             ▼
                  ┌─────────┐    ┌─────────┐   ┌─────────┐
                  │Device 1 │    │Device 2 │   │Device N │
                  │         │    │         │   │         │
                  │ Update  │    │ Update  │   │ Update  │
                  │ State   │    │ State   │   │ State   │
                  └────┬────┘    └────┬────┘   └────┬────┘
                       │              │             │
                       ▼              ▼             ▼
                  Re-render      Re-render     Re-render
                  with new       with new      with new
                  progress       progress      progress
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRESS CONTEXT STATE                        │
└─────────────────────────────────────────────────────────────────┘

Initial State (on login):
    loading: true
    userProgress: null
    moduleProgress: {}
    dailyActivity: []
    currentStreak: null
    totalXP: 0
    level: 1

    ▼

loadAllProgressData() called:
    │
    ├──► ProgressService.getUserProgress(userId)
    │    └──► Updates: userProgress, totalXP, level
    │
    ├──► ProgressService.getUserModuleProgress(userId)
    │    └──► Updates: moduleProgress
    │
    ├──► ProgressService.getDailyActivity(userId, 30)
    │    └──► Updates: dailyActivity
    │
    └──► ProgressService.getLearningStreak(userId)
         └──► Updates: currentStreak

    ▼

Loaded State:
    loading: false
    userProgress: { id, user_id, total_xp: 1550, level: 2, ... }
    moduleProgress: {
      'module-1': { progress_percentage: 75, completed_lessons: [...], ... },
      'module-2': { progress_percentage: 20, completed_lessons: [...], ... }
    }
    dailyActivity: [ {...}, {...}, ... ]  // Last 30 days
    currentStreak: { current_streak: 6, longest_streak: 10, ... }
    totalXP: 1550
    level: 2

    ▼

Real-time Updates (automatic):
    
    When user_progress changes:
        setUserProgress(newData)
        setTotalXP(newData.total_xp)
        setLevel(newData.level)
    
    When module_progress changes:
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: newModuleData
        }))

    ▼

Optimistic Updates (immediate UI feedback):
    
    On completeLesson():
        1. Call service (async)
        2. Update local state immediately (optimistic)
        3. Real-time subscription confirms (or rolls back on error)
```

---

## Database Schema Relationships

```
┌─────────────────────┐
│   auth.users        │  (Supabase Auth)
│   ─────────────────│
│   id (PK)          │
└──────────┬──────────┘
           │ 1
           │
           │ 1
┌──────────▼──────────┐
│  user_profiles      │
│  ──────────────────│
│  id (PK, FK)       │
│  uuid              │
│  username          │
│  role              │
└──────────┬──────────┘
           │ 1
           │
           ├─────────────────────────────────────┐
           │                                     │
           │ 1                                   │ 1
┌──────────▼──────────┐              ┌──────────▼──────────┐
│  user_progress      │              │  learning_streaks   │
│  ──────────────────│              │  ──────────────────│
│  id (PK)           │              │  id (PK)           │
│  user_id (FK)      │              │  user_id (FK)      │
│  total_xp          │              │  current_streak    │
│  level             │              │  longest_streak    │
│  completed_modules │              │  last_activity_date│
└──────────┬──────────┘              └────────────────────┘
           │ 1
           │
           │ *
┌──────────▼──────────┐
│  module_progress    │
│  ──────────────────│
│  id (PK)           │
│  user_id (FK)      │
│  module_id         │
│  progress_%        │
│  completed_lessons │
│  exercises_completed│
│  project_completed │
└──────────┬──────────┘
           │
           ├──────────────────┬─────────────────┐
           │ *                │ *               │ *
┌──────────▼──────────┐ ┌─────▼──────────┐ ┌──▼──────────────┐
│ lesson_completions  │ │exercise_       │ │project_         │
│ ───────────────────│ │completions     │ │completions      │
│ id (PK)            │ │────────────────│ │─────────────────│
│ user_id (FK)       │ │id (PK)         │ │id (PK)          │
│ lesson_id          │ │user_id (FK)    │ │user_id (FK)     │
│ module_id          │ │exercise_id     │ │project_id       │
│ xp_earned          │ │module_id       │ │module_id        │
│ time_spent_minutes │ │submitted_code  │ │submitted_code   │
│ completed_at       │ │xp_earned       │ │score            │
└────────────────────┘ │attempts_count  │ │xp_earned        │
                       │completed_at    │ │completed_at     │
                       └────────────────┘ └─────────────────┘

           ┌────────────────────────────────┐
           │ 1                              │
           │                                │ *
┌──────────▼──────────┐          ┌─────────▼────────┐
│  xp_transactions    │          │ daily_activity   │
│  ──────────────────│          │ ─────────────────│
│  id (PK)           │          │ id (PK)          │
│  user_id (FK)      │          │ user_id (FK)     │
│  amount            │          │ activity_date    │
│  source_type       │          │ lessons_completed│
│  source_id         │          │ exercises_...    │
│  description       │          │ projects_...     │
│  created_at        │          │ total_xp         │
└────────────────────┘          │ study_time_minutes│
                                └──────────────────┘
```

---

## XP Leveling System

```
Level Progression Formula:
    XP_for_level_N = 1000 * (1.5 ^ (N - 1))

Level Table:
    Level 1:  0 - 1,000 XP      (1,000 XP needed)
    Level 2:  1,000 - 2,500 XP  (1,500 XP needed)
    Level 3:  2,500 - 4,750 XP  (2,250 XP needed)
    Level 4:  4,750 - 8,125 XP  (3,375 XP needed)
    Level 5:  8,125 - 13,188 XP (5,063 XP needed)
    Level 6:  13,188 - 20,781 XP (7,593 XP needed)
    Level 7:  20,781 - 32,172 XP (11,391 XP needed)
    Level 8:  32,172 - 49,258 XP (17,086 XP needed)
    Level 9:  49,258 - 74,887 XP (25,629 XP needed)
    Level 10: 74,887 - 113,331 XP (38,444 XP needed)

XP Sources:
    Lesson:     50 XP
    Exercise:   100 XP
    Project:    200 XP
    Module:     150 XP (bonus)
    Assessment: 300 XP
    Level Up:   500 XP (bonus)
    Streak:     50-350 XP (milestone based)

Example Progression:
    Complete 10 lessons:   10 × 50  = 500 XP
    Complete 5 exercises:  5 × 100  = 500 XP
    Total:                           = 1,000 XP
    → Level Up to Level 2!
    → Bonus:                         + 500 XP
    → New Total:                     = 1,500 XP
```

---

## Performance Optimizations

### 1. Indexed Queries
```sql
-- All queries use indexed columns
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_module_progress_user_id ON module_progress(user_id);
CREATE INDEX idx_module_progress_module_id ON module_progress(module_id);
CREATE INDEX idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
```

### 2. Batch Operations
```typescript
// Instead of individual queries
for (const lesson of lessons) {
  await completeLesson(lesson.id);  // ❌ N queries
}

// Use batch operations
await Promise.all(
  lessons.map(lesson => completeLesson(lesson.id))  // ✅ Parallel
);
```

### 3. Real-Time Throttling
```typescript
// Debounce real-time updates
const debouncedUpdate = debounce((payload) => {
  setUserProgress(payload.new);
}, 100);
```

### 4. Optimistic Updates
```typescript
// Update UI immediately, confirm later
setModuleProgress(prev => ({ ...prev, [moduleId]: optimisticValue }));
await saveToDatabase();  // Confirm in background
```

---

## Security Model

### Row Level Security (RLS)

```sql
-- Users can only see/update their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only create their own completions
CREATE POLICY "Users can create own completions"
  ON lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- XP transactions are read-only for users
CREATE POLICY "Users can view own XP history"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Summary

**Phase 3 Architecture provides:**

✅ **Scalable** - Database-backed with proper indexing  
✅ **Real-Time** - Instant multi-device synchronization  
✅ **Secure** - Row Level Security policies  
✅ **Type-Safe** - Full TypeScript coverage  
✅ **Maintainable** - Clean separation of concerns  
✅ **Testable** - Service layer abstraction  
✅ **Performant** - Optimized queries and caching  
✅ **Extensible** - Easy to add new features  

**Ready for production deployment! 🚀**
