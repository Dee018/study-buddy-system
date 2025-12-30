# Progress Tracking — Quick Reference

**Fast lookup guide for developers**

---

## 🚀 Quick Start

### Import What You Need

```typescript
// For progress updates
import { ProgressSyncManager } from '../utils/progressSyncManager';

// For components (React hooks)
import { 
  useProgressSync, 
  useModuleProgress,
  useCompletionStats 
} from '../utils/useProgressSync';
```

---

## 📊 Common Operations

### Complete Items

```typescript
// Lesson
ProgressSyncManager.completeLesson(userId, moduleId, lessonId, xpEarned);

// Exercise (with code)
ProgressSyncManager.completeExercise(userId, moduleId, exerciseId, xpEarned, code);

// Project (with code)
ProgressSyncManager.completeProject(userId, moduleId, xpEarned, code);
```

### Check Completion

```typescript
// Specific item
const isComplete = ProgressSyncManager.isItemCompleted(
  userId, 
  moduleId, 
  itemId, 
  'lesson' // or 'exercise' or 'project'
);

// Module
const isModuleComplete = ProgressManager.isModuleCompleted(userId, moduleId);
```

### Get Progress Data

```typescript
// Full progress
const progress = ProgressManager.loadProgress(userId);

// Module progress
const moduleProgress = ProgressSyncManager.getModuleProgress(userId, moduleId);

// Statistics
const stats = ProgressSyncManager.getCompletionStats(userId);
// → { totalLessons, totalExercises, totalProjects, totalXP, ... }

// Snapshot
const snapshot = ProgressSyncManager.getProgressSnapshot(userId);
```

---

## ⚛️ React Hooks (Auto-Syncing)

### Basic Usage

```typescript
function MyComponent({ userId }) {
  // Auto-updates when progress changes!
  const { progress, refresh } = useProgressSync(userId);

  // Safe access (progress can be null initially)
  const completedModules = progress?.completedModules || [];

  return <div>Modules: {completedModules.length}</div>;
}
```

### Module-Specific

```typescript
const { moduleProgress, isCompleted } = useModuleProgress(userId, moduleId);

// moduleProgress = { completedLessons: [], completedExercises: [], projectCompleted: false }
// isCompleted = true/false
```

### Statistics

```typescript
const { stats } = useCompletionStats(userId);

// stats = {
//   totalLessons: 15,
//   totalExercises: 12,
//   totalProjects: 3,
//   totalModules: 4,
//   totalXP: 2500,
//   completionPercentage: 35
// }
```

### Item Completion

```typescript
const { isCompleted } = useItemCompletion(userId, moduleId, lessonId, 'lesson');

if (isCompleted) {
  // Show "Review" instead of "Start"
}
```

### Consistency Monitoring

```typescript
const { issues, hasIssues, fix } = useProgressConsistency(userId);

if (hasIssues) {
  console.log('Issues:', issues);
  await fix(); // Auto-fix them
}
```

---

## 🔍 Validation & Consistency

### Check for Issues

```typescript
const issues = ProgressSyncManager.verifyConsistency(userId);
// Returns array of issue descriptions
```

### Auto-Fix

```typescript
const result = ProgressSyncManager.fixInconsistencies(userId);
// result = { fixed: 3, issues: [...] }
```

### Force Refresh

```typescript
// Refresh specific component
const { refresh } = useProgressSync(userId);
refresh();

// Force sync all components
ProgressSyncManager.syncAll(userId);
```

---

## 📱 Visual States

### Status Indicators

```typescript
// Determine status
const status = getModuleStatus(moduleId);
// Returns: 'completed' | 'in-progress' | 'not-started'

// Show appropriate badge
{status === 'completed' && <Badge className="bg-green-500/10 text-green-500">Completed</Badge>}
{status === 'in-progress' && <Badge className="bg-yellow-500/10 text-yellow-500">In Progress</Badge>}
{status === 'not-started' && <Badge variant="outline">Not Started</Badge>}
```

### Icons

```typescript
import { CheckCircle, Circle, Lock } from 'lucide-react';

// Completed
<CheckCircle className="w-5 h-5 text-green-500" />

// Not completed
<Circle className="w-5 h-5 text-gray-400" />

// Locked
<Lock className="w-5 h-5 text-gray-400" />
```

### Progress Bars

```typescript
const progressPercentage = calculateProgress(moduleProgress, module);

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>{progressPercentage}% complete</span>
  </div>
  <Progress value={progressPercentage} className="h-2" />
</div>
```

---

## 🎯 Common Patterns

### Handle Lesson Completion

```typescript
function handleLessonComplete(lessonId: string, xp: number) {
  // Mark complete using sync manager
  ProgressSyncManager.completeLesson(userId, moduleId, lessonId, xp);
  
  // Award XP popup (handled by parent)
  if (onXPEarned) {
    onXPEarned(xp, `Completed Lesson`);
  }
  
  // Hook will auto-refresh UI!
}
```

### Handle Exercise Submission

```typescript
function handleExerciseSubmit(code: string, isCorrect: boolean) {
  if (!isCorrect) return; // Only mark complete if correct
  
  // Mark complete with code
  ProgressSyncManager.completeExercise(userId, moduleId, exerciseId, xp, code);
  
  // Set read-only state
  setIsReadOnly(true);
  
  // Award XP
  if (onXPEarned) {
    onXPEarned(xp, `Completed Exercise`);
  }
}
```

### Show Review State

```typescript
const { isCompleted } = useItemCompletion(userId, moduleId, exerciseId, 'exercise');
const storedCode = ProgressManager.getExerciseCode(userId, moduleId, exerciseId);

if (isCompleted) {
  return (
    <div className="border-2 border-green-500 rounded-xl p-4 bg-green-500/5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="font-medium text-green-500">Exercise Completed!</span>
      </div>
      <CodeEditor value={storedCode} readOnly />
      <Button onClick={onBack}>Return to Hub</Button>
    </div>
  );
}
```

### Module Completion Check

```typescript
useEffect(() => {
  // After any item completion, check module status
  const isComplete = ProgressManager.isModuleCompleted(userId, moduleId);
  
  if (isComplete && !moduleMarkedComplete) {
    // Module just completed!
    showCelebration();
    setModuleMarkedComplete(true);
  }
}, [progress]); // Runs when progress updates
```

---

## 🔧 Debugging

### Log Progress State

```typescript
const progress = ProgressManager.loadProgress(userId);
console.log('Progress:', progress);

const snapshot = ProgressSyncManager.getProgressSnapshot(userId);
console.log('Snapshot:', snapshot);
```

### Check Specific Module

```typescript
const moduleProgress = ProgressSyncManager.getModuleProgress(userId, moduleId);
console.log('Module Progress:', moduleProgress);
// → { completedLessons: [...], completedExercises: [...], projectCompleted: false }
```

### Monitor Events

```typescript
const { events, latestEvent } = useProgressEvents(userId);

useEffect(() => {
  console.log('Latest event:', latestEvent);
}, [latestEvent]);
```

### Validate Consistency

```typescript
// Check for issues
const issues = ProgressSyncManager.verifyConsistency(userId);
console.log('Issues found:', issues);

// Auto-fix
if (issues.length > 0) {
  const result = ProgressSyncManager.fixInconsistencies(userId);
  console.log('Fixed:', result.fixed);
}
```

---

## 🎨 Styling Guide

### Completed State (Light Mode)

```tsx
<div className="border-2 border-green-500/20 rounded-xl p-4 bg-green-500/5">
  <CheckCircle className="w-5 h-5 text-green-500" />
  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
    Completed
  </Badge>
</div>
```

### Completed State (Dark Mode Compatible)

```tsx
<div className="border-2 border-green-500/20 rounded-xl p-4 bg-green-500/5 dark:bg-green-500/10">
  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
  <Badge className="bg-green-500/10 text-green-500 border-green-500/20 dark:text-green-400">
    Completed
  </Badge>
</div>
```

### In Progress State

```tsx
<div className="border rounded-xl p-4">
  <Circle className="w-5 h-5 text-yellow-500" />
  <Progress value={progressPercentage} className="h-2" />
  <span className="text-sm text-yellow-500">{progressPercentage}% complete</span>
</div>
```

### Read-Only Code Editor

```tsx
<div className="border-2 border-green-500 rounded-xl overflow-hidden">
  {/* Green banner */}
  <div className="bg-green-500 text-white px-4 py-2 flex items-center gap-2">
    <CheckCircle className="w-5 h-5" />
    <span className="font-medium">Exercise Completed - Review Mode</span>
  </div>
  
  {/* Code editor */}
  <CodeEditor value={code} readOnly />
</div>
```

---

## ⚠️ Common Mistakes

### ❌ DON'T: Update progress directly

```typescript
// WRONG - Don't do this!
const progress = ProgressManager.loadProgress(userId);
progress.completedModules.push(moduleId);
ProgressManager.saveProgress(userId, progress);
```

### ✅ DO: Use ProgressSyncManager

```typescript
// CORRECT - Use sync manager
ProgressSyncManager.completeProject(userId, moduleId, xp, code);
// This handles everything: saving, events, validation
```

---

### ❌ DON'T: Assume progress is always loaded

```typescript
// WRONG - Can crash if progress is null
const count = progress.completedModules.length;
```

### ✅ DO: Handle null safely

```typescript
// CORRECT - Safe access
const count = progress?.completedModules?.length || 0;

// Or provide default
const safeProgress = progress || { completedModules: [], moduleProgress: {} };
```

---

### ❌ DON'T: Manually refresh components

```typescript
// WRONG - Don't do this!
const [progress, setProgress] = useState(null);

function handleComplete() {
  ProgressManager.completeLesson(...);
  
  // Manually reload
  const newProgress = ProgressManager.loadProgress(userId);
  setProgress(newProgress); // Unnecessary!
}
```

### ✅ DO: Use hooks for auto-refresh

```typescript
// CORRECT - Hook auto-updates
const { progress } = useProgressSync(userId);

function handleComplete() {
  ProgressSyncManager.completeLesson(...);
  // Component auto-refreshes via hook!
}
```

---

## 📋 Checklist for New Features

When adding progress-related features:

- [ ] Import `ProgressSyncManager` for updates
- [ ] Use `useProgressSync` hook for data
- [ ] Handle null progress gracefully
- [ ] Use visual state indicators
- [ ] Prevent duplicate XP awards
- [ ] Store submitted code
- [ ] Check module completion after updates
- [ ] Test in both light and dark mode
- [ ] Verify admin dashboard reflection
- [ ] Run consistency validation
- [ ] Test cross-tab synchronization

---

## 🔗 Related Files

- `/utils/progressSyncManager.ts` - Core sync system
- `/utils/useProgressSync.ts` - React hooks
- `/utils/progressManager.ts` - Storage layer
- `/components/AdminProgressViewer.tsx` - Admin progress viewer
- `/components/LearningHub.tsx` - Main learning interface
- `/components/ExerciseViewer.tsx` - Exercise interface
- `/components/ProjectViewer.tsx` - Project interface

---

**Need more details?** See `/PROGRESS_TRACKING_CONSISTENCY.md` for comprehensive documentation.
