# 🏗️ Phase 4: Curriculum System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│            JAVA STUDY BUDDY - CURRICULUM SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT COMPONENTS                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Learning     │  │  LessonView  │  │  Exercise    │         │
│  │ Hub          │  │              │  │  Viewer      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│                            ▼                                     │
│         ┌─────────────────────────────────────┐                 │
│         │    useCurriculum() Hook             │                 │
│         └─────────────────────────────────────┘                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CURRICULUM CONTEXT                            │
│                                                                  │
│  State:                                                         │
│  • modules            (all loaded modules)                      │
│  • loading            (async state)                             │
│  • error              (error messages)                          │
│                                                                  │
│  Cache: (5-minute TTL)                                          │
│  • modules: Map<id, Module>                                     │
│  • lessons: Map<id, Lesson>                                     │
│  • exercises: Map<id, Exercise>                                 │
│  • lastFetch: Map<key, timestamp>                               │
│                                                                  │
│  Operations:                                                    │
│  • getModule()        • createModule() [admin]                  │
│  • getModules()       • updateModule() [admin]                  │
│  • getLesson()        • deleteModule() [admin]                  │
│  • getExercise()      • createLesson() [admin]                  │
│  • refreshModules()   • createExercise() [admin]                │
│  • invalidateCache()  • etc...                                  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CURRICULUM SERVICE                             │
│                                                                  │
│  Module Operations:                                             │
│  • getModules(publishedOnly?)                                   │
│  • getModule(moduleId)                                          │
│  • upsertModule(module)                                         │
│  • deleteModule(moduleId)                                       │
│                                                                  │
│  Lesson Operations:                                             │
│  • getLessons(moduleId, publishedOnly?)                         │
│  • getLesson(lessonId)                                          │
│  • upsertLesson(lesson)                                         │
│  • deleteLesson(lessonId)                                       │
│                                                                  │
│  Exercise Operations:                                           │
│  • getExercises(moduleId, publishedOnly?)                       │
│  • getExercise(exerciseId)                                      │
│  • upsertExercise(exercise)                                     │
│  • deleteExercise(exerciseId)                                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE CLIENT                             │
│                                                                  │
│  Database Operations:                                           │
│  • supabase.from('modules').select()                           │
│  • supabase.from('lessons').select()                           │
│  • supabase.from('exercises').select()                         │
│  • supabase.from('modules').upsert()                           │
│  • supabase.from('modules').delete()                           │
│                                                                  │
│  Future: Real-time Subscriptions                                │
│  • supabase.channel('curriculum').subscribe()                  │
│  • Live content updates for admin changes                       │
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
│  │  ├─ modules                                             │  │
│  │  │   ├─ id (PK)                                         │  │
│  │  │   ├─ week_number                                     │  │
│  │  │   ├─ title                                           │  │
│  │  │   ├─ description                                     │  │
│  │  │   ├─ difficulty                                      │  │
│  │  │   ├─ learning_objectives (array)                     │  │
│  │  │   ├─ is_published                                    │  │
│  │  │   └─ module_data (JSONB)                             │  │
│  │  │                                                       │  │
│  │  ├─ lessons                                             │  │
│  │  │   ├─ id (PK)                                         │  │
│  │  │   ├─ module_id (FK → modules.id)                    │  │
│  │  │   ├─ order_index                                     │  │
│  │  │   ├─ title                                           │  │
│  │  │   ├─ content (text/HTML)                             │  │
│  │  │   ├─ xp_reward                                       │  │
│  │  │   ├─ is_published                                    │  │
│  │  │   └─ lesson_data (JSONB)                             │  │
│  │  │                                                       │  │
│  │  └─ exercises                                           │  │
│  │      ├─ id (PK)                                         │  │
│  │      ├─ module_id (FK → modules.id)                    │  │
│  │      ├─ order_index                                     │  │
│  │      ├─ title                                           │  │
│  │      ├─ description                                     │  │
│  │      ├─ starter_code                                    │  │
│  │      ├─ solution_code                                   │  │
│  │      ├─ test_cases (JSONB array)                        │  │
│  │      ├─ hints (array)                                   │  │
│  │      ├─ xp_reward                                       │  │
│  │      ├─ difficulty                                      │  │
│  │      ├─ is_published                                    │  │
│  │      └─ exercise_data (JSONB)                           │  │
│  │                                                          │  │
│  │  Future: Supabase Storage                               │  │
│  │  └─ curriculum-assets/                                  │  │
│  │      ├─ images/                                         │  │
│  │      ├─ videos/                                         │  │
│  │      └─ attachments/                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Content Loading Flow (With Cache)

```
User navigates to Learning Hub
    │
    ▼
Component calls useCurriculum()
    │
    ▼
CurriculumContext.getModules()
    │
    ▼
Check cache validity
    │
    ├─────► Cache VALID (< 5 min old)
    │           │
    │           └─► Return modules from cache
    │               (0ms - instant)
    │                   │
    │                   ▼
    │              Component renders
    │
    └─────► Cache INVALID (> 5 min old OR empty)
                │
                ▼
            CurriculumService.getModules()
                │
                ├─► Query modules table
                │       │
                │       └─► ORDER BY week_number
                │           WHERE is_published = true
                │
                ├─► For each module:
                │       │
                │       ├─► Query lessons table
                │       │       │
                │       │       └─► WHERE module_id = ?
                │       │           ORDER BY order_index
                │       │
                │       └─► Query exercises table
                │               │
                │               └─► WHERE module_id = ?
                │                   ORDER BY order_index
                │
                ▼
            Enrich data (add counts, metadata)
                {
                  ...module,
                  lessons: [...],
                  exercises: [...],
                  lessonCount: 5,
                  exerciseCount: 10
                }
                │
                ▼
            Store in cache with timestamp
                cache.modules.set(module.id, enrichedModule)
                cache.lastFetch.set('modules_true', Date.now())
                │
                ▼
            Return enriched modules
                │
                ▼
            Component renders with data
```

---

### Admin Content Creation Flow

```
Admin opens "Create Module" form
    │
    ▼
Fills in module details
    title: "Advanced Data Structures"
    week_number: 9
    difficulty: "Advanced"
    description: "..."
    learning_objectives: [...]
    is_published: true
    │
    ▼
Clicks "Create Module"
    │
    ▼
Component calls createModule(moduleData)
    │
    ▼
CurriculumContext.createModule()
    │
    ├─► Check if user is admin
    │       if (!isAdmin) throw error
    │
    ├─► CurriculumService.upsertModule()
    │       │
    │       └─► INSERT INTO modules
    │           VALUES (...)
    │           RETURNING *
    │               │
    │               └─► New module created in database
    │
    ├─► invalidateCache('modules')
    │       │
    │       └─► Clear modules cache
    │           cache.modules.clear()
    │           cache.lastFetch.delete('modules_*')
    │
    └─► refreshModules()
            │
            └─► Fetch fresh data from database
                    │
                    └─► Update context state
                            │
                            ▼
                        All components re-render
                        with new module in list
                            │
                            ▼
                        Toast: "Module created successfully!"
                            │
                            ▼
                        Navigate to module edit page
```

---

### Lesson Viewing Flow

```
User clicks on "Lesson 1: Introduction to Variables"
    │
    ▼
Navigate to /lesson/:lessonId
    │
    ▼
LessonView component renders
    │
    ├─► useCurriculum()
    │       │
    │       └─► getLesson(lessonId)
    │           │
    │           ├─► Check cache.lessons.get(lessonId)
    │           │       │
    │           │       └─► Found in cache (instant)
    │           │           return cached lesson
    │           │
    │           └─► If not in cache
    │               (shouldn't happen if module loaded)
    │               fetch from database
    │
    └─► useProgress()
            │
            └─► Check if lesson completed
                moduleProgress[moduleId].completed_lessons.includes(lessonId)
    
    ▼
Display lesson content
    {
      title: "Introduction to Variables",
      content: "<h2>What are variables?</h2>...",
      xp_reward: 50,
      estimated_minutes: 15
    }
    │
    ▼
User reads lesson
    │
    ▼
User clicks "Complete Lesson"
    │
    ▼
Call completeLesson() from ProgressContext
    │
    ├─► Insert into lesson_completions table
    ├─► Update module_progress.completed_lessons
    ├─► Award XP (+50)
    └─► Update learning streak
    
    ▼
UI updates with completion badge
Toast: "Lesson completed! +50 XP"
Navigate to next lesson
```

---

## Cache Architecture

### Cache Structure

```typescript
ContentCache {
  // Module cache (by ID)
  modules: Map {
    'module-1' => {
      id: 'module-1',
      title: 'Introduction to Java',
      lessons: [...],
      exercises: [...],
      lessonCount: 5,
      exerciseCount: 8,
      ...
    },
    'module-2' => { ... },
    ...
  },

  // Lesson cache (by ID)
  lessons: Map {
    'lesson-1-1' => {
      id: 'lesson-1-1',
      module_id: 'module-1',
      title: 'What is Java?',
      content: '...',
      xp_reward: 50,
      ...
    },
    'lesson-1-2' => { ... },
    ...
  },

  // Exercise cache (by ID)
  exercises: Map {
    'exercise-1-1' => {
      id: 'exercise-1-1',
      module_id: 'module-1',
      title: 'Hello World',
      starter_code: '...',
      test_cases: [...],
      xp_reward: 100,
      ...
    },
    ...
  },

  // All modules array (for list views)
  allModules: [
    { module-1 }, { module-2 }, ...
  ],

  // Cache timestamps
  lastFetch: Map {
    'modules_true' => 1703184000000,    // Published modules fetched
    'modules_false' => 1703184000000,   // All modules fetched (admin)
    'lessons_module-1' => 1703184000000, // Lessons for module-1
    'exercises_module-1' => 1703184000000, // Exercises for module-1
    ...
  }
}
```

### Cache Invalidation Rules

```typescript
// When module is created/updated/deleted
invalidateCache('modules')
    ↓
Clear all module-related caches:
    - cache.modules.clear()
    - cache.allModules = null
    - Remove all 'modules_*' from lastFetch

// When lesson is created/updated/deleted
invalidateCache('lessons')
    ↓
Clear lesson caches:
    - cache.lessons.clear()
    - Remove all 'lessons_*' from lastFetch
    - Keep modules cache (lessons embedded in modules)

// When exercise is created/updated/deleted
invalidateCache('exercises')
    ↓
Clear exercise caches:
    - cache.exercises.clear()
    - Remove all 'exercises_*' from lastFetch
    - Keep modules cache (exercises embedded in modules)

// Manual refresh or "Clear All"
invalidateCache('all')
    ↓
Clear everything:
    - cache.modules.clear()
    - cache.lessons.clear()
    - cache.exercises.clear()
    - cache.allModules = null
    - cache.lastFetch.clear()
```

---

## Database Schema

### Modules Table

```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  estimated_hours INTEGER,
  prerequisites TEXT[], -- Array of module IDs
  learning_objectives TEXT[],
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id),
  module_data JSONB -- Flexible data storage
);

-- Indexes
CREATE INDEX idx_modules_week ON modules(week_number);
CREATE INDEX idx_modules_published ON modules(is_published);
```

### Lessons Table

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML or Markdown
  lesson_type TEXT, -- 'lecture', 'reading', 'video', etc.
  estimated_minutes INTEGER,
  xp_reward INTEGER DEFAULT 50,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  lesson_data JSONB
);

-- Indexes
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, order_index);
CREATE INDEX idx_lessons_published ON lessons(is_published);
```

### Exercises Table

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB, -- Array of test case objects
  hints TEXT[],
  xp_reward INTEGER DEFAULT 100,
  difficulty TEXT, -- 'Easy', 'Medium', 'Hard'
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  exercise_data JSONB
);

-- Indexes
CREATE INDEX idx_exercises_module ON exercises(module_id);
CREATE INDEX idx_exercises_order ON exercises(module_id, order_index);
CREATE INDEX idx_exercises_published ON exercises(is_published);
```

---

## Performance Optimizations

### 1. Batch Loading

```typescript
// Instead of multiple queries
for (const module of modules) {
  const lessons = await getLessons(module.id);  // N queries ❌
}

// Use parallel loading
const enrichedModules = await Promise.all(
  modules.map(async (module) => ({
    ...module,
    lessons: await getLessons(module.id),      // Parallel ✅
    exercises: await getExercises(module.id),
  }))
);
```

### 2. Smart Cache Checking

```typescript
// Before fetching, check cache
const cacheKey = `modules_${publishedOnly}`;
if (isCacheValid(cacheKey) && cache.allModules) {
  return cache.allModules; // Instant return
}

// Only fetch if cache expired
const modules = await fetchFromDatabase();
```

### 3. Selective Invalidation

```typescript
// Don't invalidate everything
// ❌ invalidateCache('all')

// Invalidate only what changed
// ✅ invalidateCache('lessons')
// Keep modules and exercises cached
```

### 4. Embedded Data Reduction

```typescript
// Store lessons/exercises with module
// Avoid separate queries when displaying module
const module = getModule(moduleId);
// ✅ module.lessons already loaded
// ✅ module.exercises already loaded
```

---

## Security Model

### Row Level Security (RLS)

```sql
-- Learners can only see published content
CREATE POLICY "Learners see published modules"
  ON modules FOR SELECT
  USING (
    is_published = true 
    OR 
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Learners see published lessons"
  ON lessons FOR SELECT
  USING (
    is_published = true
    OR
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

-- Admins can create/update/delete
CREATE POLICY "Admins manage modules"
  ON modules FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins manage lessons"
  ON lessons FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'admin'
    )
  );
```

---

## Admin vs Learner Views

### Learner View

```typescript
const { modules } = useCurriculum();
// Only published modules
// modules.filter(m => m.is_published === true)

const module = getModule(moduleId);
// null if unpublished and user is not admin

const lessons = module.lessons;
// Only published lessons
```

### Admin View

```typescript
const { modules } = useCurriculum();
// ALL modules (published + unpublished)

const module = getModule(moduleId);
// Returns module even if unpublished

const { createModule, updateModule, deleteModule } = useCurriculum();
// Full CRUD access
```

---

## Future Enhancements

### 1. Real-Time Content Updates

```typescript
// Subscribe to curriculum changes
useEffect(() => {
  const unsubscribe = RealtimeService.subscribeToCurriculumChanges((payload) => {
    if (payload.new) {
      invalidateCache('all');
      refreshModules();
    }
  });

  return unsubscribe;
}, []);
```

### 2. Content Versioning

```sql
CREATE TABLE module_versions (
  id UUID PRIMARY KEY,
  module_id UUID REFERENCES modules(id),
  version INTEGER NOT NULL,
  content JSONB,
  created_by UUID,
  created_at TIMESTAMP
);
```

### 3. Media Storage

```typescript
// Upload images to Supabase Storage
const uploadImage = async (file: File, moduleId: string) => {
  const { data, error } = await supabase.storage
    .from('curriculum-assets')
    .upload(`modules/${moduleId}/images/${file.name}`, file);

  return data.publicUrl;
};

// Reference in lesson content
const content = `
  <img src="${imageUrl}" alt="Diagram" />
`;
```

### 4. Content Search

```typescript
const searchContent = async (query: string) => {
  const { data } = await supabase
    .from('lessons')
    .select('*')
    .textSearch('content', query);

  return data;
};
```

---

## Summary

**Phase 4 Architecture provides:**

✅ **Dynamic Content** - All curriculum from database  
✅ **Intelligent Caching** - 5-minute TTL with smart invalidation  
✅ **Admin Management** - Full CRUD operations  
✅ **Performance** - Optimized queries and parallel loading  
✅ **Security** - RLS policies for learner/admin separation  
✅ **Scalable** - Handles thousands of modules/lessons/exercises  
✅ **Type-Safe** - Full TypeScript coverage  
✅ **Extensible** - Easy to add new content types  

**Ready for production deployment! 🚀**

---

**Last Updated:** December 21, 2025  
**Phase:** 4 Complete  
**Status:** Production-Ready Curriculum System
