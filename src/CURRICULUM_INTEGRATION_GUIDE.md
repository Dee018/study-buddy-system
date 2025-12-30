# 🎓 Curriculum System Integration Guide

## Quick Start

This guide shows you how to integrate the new Supabase-based curriculum system into your components.

---

## Step 1: Add CurriculumProvider to App

First, wrap your app with the CurriculumProvider:

### Update `/App.tsx` or create `/AppProviders.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { CurriculumProvider } from './contexts/CurriculumContext';
import { ThemeProvider } from './contexts/ThemeContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CurriculumProvider>  {/* Add CurriculumProvider here */}
        <ProgressProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ProgressProvider>
      </CurriculumProvider>
    </AuthProvider>
  );
}
```

**Provider Order:**
1. AuthProvider (first - provides user context)
2. CurriculumProvider (after auth - needs user for admin check)
3. ProgressProvider (after curriculum - may need module info)
4. ThemeProvider (last - visual only)

---

## Step 2: Migrate EnhancedLearningModule

### Before (Static Import):

```typescript
import { comprehensiveBeginnerTrack } from '../data/comprehensiveBeginnerCurriculum';

function EnhancedLearningModule() {
  const modules = comprehensiveBeginnerTrack;
  
  return (
    <div>
      {modules.map(module => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
```

### After (Curriculum Context):

```typescript
import { useCurriculum } from '../contexts/CurriculumContext';
import { useProgress } from '../contexts/ProgressContext';

function EnhancedLearningModule() {
  const {
    modules,
    loading,
    error,
    getModule,
  } = useCurriculum();

  const { moduleProgress } = useProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <h3 className="font-semibold text-destructive mb-2">Error Loading Curriculum</h3>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {modules.map(module => {
        const progress = moduleProgress[module.id];
        
        return (
          <ModuleCard
            key={module.id}
            module={module}
            progress={progress}
            onClick={() => handleModuleClick(module.id)}
          />
        );
      })}
    </div>
  );
}
```

---

## Step 3: Update LessonView

### Before (Static Curriculum):

```typescript
import { comprehensiveBeginnerTrack } from '../data/comprehensiveBeginnerCurriculum';

function LessonView({ moduleId, lessonId }: Props) {
  const module = comprehensiveBeginnerTrack.find(m => m.id === moduleId);
  const lesson = module?.lessons?.find(l => l.id === lessonId);

  if (!lesson) return <NotFound />;

  return (
    <div>
      <h1>{lesson.title}</h1>
      <div>{lesson.content}</div>
    </div>
  );
}
```

### After (Curriculum Context):

```typescript
import { useCurriculum } from '../contexts/CurriculumContext';
import { useProgress } from '../contexts/ProgressContext';
import { XPService } from '../utils/supabase/dataService';
import { toast } from 'sonner@2.0.3';

function LessonView({ lessonId }: Props) {
  const { getLesson, modules } = useCurriculum();
  const { completeLesson, moduleProgress } = useProgress();
  const [completing, setCompleting] = useState(false);

  const lesson = getLesson(lessonId);

  // Get module to which this lesson belongs
  const module = modules.find(m => 
    m.lessons.some(l => l.id === lessonId)
  );

  if (!lesson || !module) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Lesson Not Found</h3>
        <p className="text-muted-foreground">This lesson may have been removed.</p>
      </div>
    );
  }

  // Check if already completed
  const progress = moduleProgress[module.id];
  const isCompleted = progress?.completed_lessons?.includes(lessonId) || false;

  const handleComplete = async () => {
    if (completing || isCompleted) return;

    setCompleting(true);
    try {
      await completeLesson(
        module.id,
        lessonId,
        lesson.xp_reward || XPService.LESSON_XP,
        calculateTimeSpent() // Implement time tracking
      );

      toast.success(`Lesson completed! +${lesson.xp_reward || XPService.LESSON_XP} XP`);
    } catch (error) {
      toast.error('Failed to save progress');
      console.error(error);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-muted-foreground mb-2">
          {module.title} • Lesson {lesson.order_index + 1}
        </div>
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{lesson.estimated_minutes || 15} minutes</span>
          <span>•</span>
          <span>{lesson.xp_reward || XPService.LESSON_XP} XP</span>
          {isCompleted && (
            <>
              <span>•</span>
              <Badge variant="success">Completed</Badge>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          <div 
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigateToPreviousLesson()}>
          ← Previous Lesson
        </Button>
        
        {!isCompleted ? (
          <Button onClick={handleComplete} disabled={completing}>
            {completing ? 'Saving...' : `Complete Lesson (+${lesson.xp_reward || XPService.LESSON_XP} XP)`}
          </Button>
        ) : (
          <Button onClick={() => navigateToNextLesson()}>
            Next Lesson →
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## Step 4: Update ExerciseViewer

### Before (Static Data):

```typescript
function ExerciseViewer({ moduleId, exerciseId }: Props) {
  const module = comprehensiveBeginnerTrack.find(m => m.id === moduleId);
  const exercise = module?.exercises?.find(e => e.id === exerciseId);

  return <ExerciseContent exercise={exercise} />;
}
```

### After (Curriculum Context):

```typescript
import { useCurriculum } from '../contexts/CurriculumContext';
import { useProgress } from '../contexts/ProgressContext';
import { XPService } from '../utils/supabase/dataService';
import { toast } from 'sonner@2.0.3';

function ExerciseViewer({ exerciseId }: Props) {
  const { getExercise, modules } = useCurriculum();
  const { completeExercise, moduleProgress } = useProgress();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const exercise = getExercise(exerciseId);
  
  // Find module
  const module = modules.find(m => 
    m.exercises.some(e => e.id === exerciseId)
  );

  useEffect(() => {
    if (exercise?.starter_code) {
      setCode(exercise.starter_code);
    }
  }, [exercise]);

  if (!exercise || !module) {
    return <NotFound />;
  }

  // Check if completed
  const progress = moduleProgress[module.id];
  const isCompleted = progress?.exercises_completed?.includes(exerciseId) || false;

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      // Run tests (implement your test runner)
      const results = await runTests(code, exercise.test_cases);
      setTestResults(results);

      if (results.allPassed && !isCompleted) {
        // Award XP for first-time completion
        await completeExercise(
          module.id,
          exerciseId,
          code,
          exercise.xp_reward || XPService.EXERCISE_XP,
          calculateTimeSpent(),
          1 // attempts count
        );

        toast.success(`Exercise completed! +${exercise.xp_reward || XPService.EXERCISE_XP} XP`);
      } else if (!results.allPassed) {
        toast.error(`${results.failedCount} test(s) failed. Keep trying!`);
      }
    } catch (error) {
      toast.error('Failed to run tests');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset code to starter template?')) {
      setCode(exercise.starter_code || '');
      setTestResults(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{exercise.title}</h2>
            <p className="text-sm text-muted-foreground">
              {module.title} • Exercise {exercise.order_index + 1}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && <Badge variant="success">Completed</Badge>}
            <Badge variant="outline">{exercise.difficulty || 'Medium'}</Badge>
            <span className="text-sm font-medium">
              {exercise.xp_reward || XPService.EXERCISE_XP} XP
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
        {/* Left: Instructions */}
        <div className="space-y-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{exercise.description}</p>
            </CardContent>
          </Card>

          {exercise.hints && exercise.hints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hints</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {exercise.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.results.map((result, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded mb-2 ${
                      result.passed ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Test {i + 1}</span>
                      {result.passed ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    {!result.passed && result.error && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Code Editor */}
        <div className="flex flex-col">
          <CodeEditor
            value={code}
            onChange={setCode}
            language="java"
            className="flex-1"
            readOnly={isCompleted}
          />

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleSubmit}
              disabled={submitting || isCompleted}
              className="flex-1"
            >
              {submitting ? 'Running Tests...' : isCompleted ? 'Completed ✓' : 'Run Tests'}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={submitting || isCompleted}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Update ProjectViewer

### After (Curriculum Context):

```typescript
import { useCurriculum } from '../contexts/CurriculumContext';
import { useProgress } from '../contexts/ProgressContext';
import { XPService } from '../utils/supabase/dataService';

function ProjectViewer({ moduleId }: Props) {
  const { getModule } = useCurriculum();
  const { completeProject, moduleProgress } = useProgress();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const module = getModule(moduleId);
  const project = module?.module_data?.project; // Project stored in module_data

  if (!module || !project) {
    return <NotFound />;
  }

  const progress = moduleProgress[moduleId];
  const isCompleted = progress?.project_completed || false;

  const handleSubmit = async () => {
    if (submitting || isCompleted) return;

    setSubmitting(true);
    try {
      // Validate and score project (implement your scoring logic)
      const score = await scoreProject(code, project.requirements);

      await completeProject(
        moduleId,
        project.id,
        code,
        score,
        XPService.PROJECT_XP,
        calculateTimeSpent()
      );

      toast.success(`Project submitted! Score: ${score}% • +${XPService.PROJECT_XP} XP`);
    } catch (error) {
      toast.error('Failed to submit project');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-muted-foreground">{project.description}</p>
        {isCompleted && <Badge variant="success" className="mt-2">Completed</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {project.requirements.map((req, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Code Editor */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-4">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="java"
                height="500px"
                readOnly={isCompleted}
              />
              <Button
                onClick={handleSubmit}
                disabled={submitting || isCompleted}
                className="w-full mt-4"
              >
                {submitting ? 'Submitting...' : isCompleted ? 'Completed ✓' : `Submit Project (+${XPService.PROJECT_XP} XP)`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Admin Content Management

### Create Module (Admin)

```typescript
import { useCurriculum } from '../contexts/CurriculumContext';
import { useAuth } from '../contexts/AuthContext';

function AdminModuleCreate() {
  const { createModule } = useCurriculum();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    week_number: 1,
    title: '',
    description: '',
    difficulty: 'Beginner',
    estimated_hours: 8,
    learning_objectives: [],
    is_published: false,
  });

  if (profile?.role !== 'admin') {
    return <div>Admin access required</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createModule(formData);
      toast.success('Module created successfully!');
      router.push('/admin/curriculum');
    } catch (error) {
      toast.error('Failed to create module');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <Label>Week Number</Label>
        <Input
          type="number"
          value={formData.week_number}
          onChange={e => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
          required
        />
      </div>

      <div>
        <Label>Title</Label>
        <Input
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Introduction to Java"
          required
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label>Difficulty</Label>
        <Select
          value={formData.difficulty}
          onValueChange={value => setFormData({ ...formData, difficulty: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={formData.is_published}
          onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
        />
        <Label htmlFor="published">Publish immediately</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Create Module</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### Edit Module (Admin)

```typescript
function AdminModuleEdit({ moduleId }: { moduleId: string }) {
  const { getModule, updateModule } = useCurriculum();
  const module = getModule(moduleId);
  const [formData, setFormData] = useState(module);

  useEffect(() => {
    if (module) {
      setFormData(module);
    }
  }, [module]);

  if (!module) return <NotFound />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateModule(moduleId, formData);
      toast.success('Module updated successfully!');
    } catch (error) {
      toast.error('Failed to update module');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Same fields as create, but with existing data */}
      <Button type="submit">Save Changes</Button>
    </form>
  );
}
```

---

## Step 7: Handle Loading States

### Skeleton Loaders

```typescript
function ModuleListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EnhancedLearningModule() {
  const { modules, loading } = useCurriculum();

  if (loading) {
    return <ModuleListSkeleton />;
  }

  return (
    <div className="space-y-4">
      {modules.map(module => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
```

---

## Step 8: Error Handling

### Error Boundaries

```typescript
import { useEffect } from 'react';
import { useCurriculum } from '../contexts/CurriculumContext';

function CurriculumErrorHandler({ children }: { children: React.ReactNode }) {
  const { error, clearError } = useCurriculum();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return <>{children}</>;
}

// Wrap your curriculum components
<CurriculumErrorHandler>
  <EnhancedLearningModule />
</CurriculumErrorHandler>
```

---

## Migration Checklist

### Remove Static Imports:
- [ ] Remove `import { javaCurriculum }` 
- [ ] Remove `import { comprehensiveBeginnerTrack }`
- [ ] Remove `import { enhancedJavaCurriculum }`
- [ ] Remove all `/data/*.ts` curriculum imports

### Add Context:
- [ ] Add CurriculumProvider to app
- [ ] Import `useCurriculum` in components
- [ ] Import `useProgress` where needed
- [ ] Import `XPService` for XP values

### Update Components:
- [ ] EnhancedLearningModule → use `modules` from context
- [ ] LessonView → use `getLesson(lessonId)`
- [ ] ExerciseViewer → use `getExercise(exerciseId)`
- [ ] ProjectViewer → use `getModule(moduleId)`
- [ ] Admin pages → use admin CRUD methods

### Add Features:
- [ ] Loading states with skeletons
- [ ] Error handling with toasts
- [ ] Completion tracking
- [ ] XP awards on completion
- [ ] Progress synchronization

### Test:
- [ ] Modules load correctly
- [ ] Lessons display properly
- [ ] Exercises work
- [ ] Projects submit
- [ ] Admin can create/edit/delete
- [ ] Cache works (fast subsequent loads)

---

## Common Patterns

### Pattern 1: Get and Display Module

```typescript
const { getModule } = useCurriculum();
const module = getModule(moduleId);

if (!module) return <NotFound />;

return <ModuleDisplay module={module} />;
```

### Pattern 2: Get Lesson with Completion Status

```typescript
const { getLesson } = useCurriculum();
const { moduleProgress } = useProgress();

const lesson = getLesson(lessonId);
const module = modules.find(m => m.lessons.some(l => l.id === lessonId));
const isCompleted = moduleProgress[module?.id]?.completed_lessons?.includes(lessonId);
```

### Pattern 3: Admin CRUD with Toast Feedback

```typescript
const { createLesson } = useCurriculum();

try {
  await createLesson(lessonData);
  toast.success('Lesson created!');
} catch (error) {
  toast.error('Failed to create lesson');
  console.error(error);
}
```

---

## Summary

You now have everything you need to integrate the curriculum system:

✅ CurriculumProvider setup  
✅ useCurriculum() hook usage  
✅ Module/Lesson/Exercise loading  
✅ Admin content management  
✅ Loading states  
✅ Error handling  
✅ Cache optimization  

**Next:** Update your components, remove static imports, and enjoy dynamic content management!
