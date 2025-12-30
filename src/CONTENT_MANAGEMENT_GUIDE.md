# Study Buddy Content Management System
## Single Source of Truth Architecture

### Overview
The Study Buddy system implements a **Single Source of Truth** architecture for all learning content. This ensures that the Admin Dashboard and Student Interface always display identical, synchronized content.

---

## Architecture Components

### 1. ContentManager (`/utils/contentManager.ts`)
**The Central Content Hub**

The ContentManager is the single source of truth for all curriculum content including:
- **Modules**: Containers for learning units (e.g., "Week 1: Java Fundamentals")
- **Lessons**: Educational content and reading materials  
- **Exercises**: Hands-on practice problems
- **Projects**: Larger assessment assignments

**Key Features:**
- ✅ Centralized content storage
- ✅ Real-time synchronization between admin and user views
- ✅ Edit tracking and versioning
- ✅ Publish/Draft status management
- ✅ Event-based update notifications

**Core Methods:**
```typescript
// Module Management
ContentManager.getAllModules()        // Get all modules with edits applied
ContentManager.getModule(id)          // Get single module
ContentManager.saveModule(id, data)   // Save module edits
ContentManager.deleteModule(id)       // Mark module as deleted

// Lesson Management
ContentManager.getLessonsByModule(moduleId)
ContentManager.saveLesson(moduleId, lessonId, data)
ContentManager.addLesson(moduleId, lesson)
ContentManager.deleteLesson(moduleId, lessonId)

// Exercise Management
ContentManager.getExercisesByModule(moduleId)
ContentManager.saveExercise(moduleId, exerciseId, data)
ContentManager.addExercise(moduleId, exercise)
ContentManager.deleteExercise(moduleId, exerciseId)

// Project Management
ContentManager.getProjectByModule(moduleId)
ContentManager.saveProject(moduleId, projectId, data)
ContentManager.setModuleProject(moduleId, project)
ContentManager.deleteProject(moduleId)

// Publish Status
ContentManager.isPublished(contentId)
ContentManager.setPublishStatus(contentId, isPublished)
```

---

### 2. Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT MANAGER                          │
│                 (Single Source of Truth)                    │
│                                                             │
│  • Loads base curriculum from /data                        │
│  • Applies admin edits from localStorage                    │
│  • Manages publish status                                  │
│  • Dispatches 'contentUpdated' events                     │
└─────────────────┬─────────────────────┬──────────────────┘
                  │                     │
                  ▼                     ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │   ADMIN DASHBOARD    │  │  STUDENT INTERFACE   │
    │   (AdminPanel.tsx)   │  │  (LearningHub.tsx)   │
    │                      │  │                      │
    │  • View all content  │  │  • View published    │
    │  • Edit modules      │  │    content only      │
    │  • Edit lessons      │  │  • Track progress    │
    │  • Edit exercises    │  │  • Complete lessons  │
    │  • Edit projects     │  │  • Submit exercises  │
    │  • Publish/Draft     │  │  • Work on projects  │
    └──────────────────────┘  └──────────────────────┘
```

---

## Bidirectional Synchronization

### How It Works:

1. **Admin Makes Edit**
   ```typescript
   // Admin edits a lesson in AdminPanel
   ContentManager.saveLesson(moduleId, lessonId, updates);
   ```

2. **ContentManager Updates Storage**
   ```typescript
   // Saves to localStorage
   // Dispatches 'contentUpdated' event
   window.dispatchEvent(new CustomEvent('contentUpdated', {...}));
   ```

3. **Both Views Auto-Update**
   ```typescript
   // AdminPanel.tsx
   useEffect(() => {
     window.addEventListener('contentUpdated', handleUpdate);
   }, []);

   // LearningHub.tsx
   useEffect(() => {
     window.addEventListener('contentUpdated', loadModules);
   }, []);
   ```

4. **Students See Changes Immediately**
   - No page refresh required
   - Content updates in real-time
   - Progress preserved

---

## Content Lifecycle

### 1. Creating New Content

**From Admin Dashboard:**
```typescript
// Create new lesson
const newLesson = {
  id: 'lesson-new-1',
  title: 'Understanding Variables',
  description: 'Learn about Java variables',
  difficulty: 'Beginner',
  duration: '15 min',
  // ... other properties
};

ContentManager.addLesson('beginner-module-1', newLesson);
```

### 2. Editing Existing Content

**Admin Dashboard → Content Tab:**
1. Navigate to "Content" tab
2. Find module in the list
3. Click "Edit" button
4. Modify properties (title, description, etc.)
5. Changes save automatically
6. Students see updates immediately

### 3. Publishing Content

**Draft vs Published:**
- **Draft**: Only visible in Admin Dashboard
- **Published**: Visible to all students

```typescript
// Set content as draft (hide from students)
ContentManager.setPublishStatus('module-id', false);

// Publish content (make visible to students)
ContentManager.setPublishStatus('module-id', true);
```

### 4. Deleting Content

**Soft Delete (Recommended):**
```typescript
// Marks as deleted without removing data
ContentManager.deleteModule('module-id');
```

**Hard Delete (Advanced):**
```typescript
// Completely remove from storage
ContentManager.clearContentEdits('module', 'module-id');
```

---

## Admin Dashboard Usage

### Accessing Content Management

1. **Login as Admin**
   - UUID: `YCW-158-KA-4678`
   - Username: `UserAdministrator123`
   - Password: `Admin123`

2. **Navigate to Content Tab**
   - Click "Content" in the top navigation
   - View all modules across all tracks

3. **Manage Modules**
   - **Search**: Use search bar to find specific modules
   - **Filter**: Filter by level (Beginner/Intermediate/Advanced)
   - **Sort**: Sort by title, last updated, or number of lessons

### Managing Module Content

**Expanding a Module:**
- Click on any module to expand
- View all lessons, exercises, and projects
- See content statistics

**Editing Components:**

**Lessons:**
- View all lessons in the module
- Edit individual lesson properties
- Add new lessons
- Delete lessons
- Reorder lessons (drag & drop)

**Exercises:**
- View practice exercises
- Edit exercise content and difficulty
- Adjust XP rewards
- Add/remove exercises

**Projects:**
- View assessment project
- Edit project requirements
- Update objectives
- Modify difficulty and XP

---

## Student Interface Integration

### What Students See

**Published Content Only:**
- Students only see modules/lessons marked as "Published"
- Draft content is hidden from student view
- Changes to published content appear immediately

**Real-Time Updates:**
```typescript
// Student is viewing Module 1 Lesson 2
// Admin edits Lesson 2 description
// Student's view updates automatically (no refresh needed)
```

**Progress Preservation:**
- Student progress is never lost during content updates
- Completed lessons remain completed
- XP and achievements are preserved

---

## Data Storage

### LocalStorage Structure

**Key:** `study_buddy_content_v2`

**Structure:**
```json
{
  "modules": {
    "module-id": { /* module edits */ }
  },
  "lessons": {
    "lesson-id": { /* lesson edits */ }
  },
  "exercises": {
    "exercise-id": { /* exercise edits */ }
  },
  "projects": {
    "project-id": { /* project edits */ }
  },
  "publishStatus": {
    "content-id": true/false
  }
}
```

### Base Curriculum Files

**Location:** `/data/`

- `comprehensiveBeginnerCurriculum.ts` - Weeks 1-4 (Beginner Track)
- `javaCurriculum.ts` - Weeks 5-12 (Intermediate/Advanced)
- `javaBeginnerCurriculum.ts` - Detailed lesson content
- `javaBeginnerCurriculumPart2.ts` - Additional lesson content

**Note:** Base files are NOT modified. All edits are stored separately and merged at runtime.

---

## Best Practices

### 1. Content Updates

✅ **DO:**
- Test changes in draft mode first
- Publish content during low-traffic periods
- Keep module structure consistent
- Maintain difficulty progression

❌ **DON'T:**
- Delete content students are actively working on
- Change module IDs (breaks progress tracking)
- Remove prerequisites without updating dependencies

### 2. Version Control

**Before Major Changes:**
```typescript
// Export current content for backup
const backup = ContentManager.exportContent();
localStorage.setItem('content_backup_2024', backup);
```

**Restore if Needed:**
```typescript
const backup = localStorage.getItem('content_backup_2024');
// Manually restore through Admin interface
```

### 3. Testing Changes

1. Make edit in Admin Dashboard
2. Keep Admin Dashboard open
3. Open Student Interface in new tab (as test user)
4. Verify change appears correctly
5. Test functionality (complete lesson, submit exercise, etc.)
6. Verify progress tracking still works

---

## Troubleshooting

### Issue: Changes Not Appearing for Students

**Possible Causes:**
1. Content is in Draft mode (not published)
2. Browser cache needs refresh
3. Student needs to reload page

**Solution:**
```typescript
// Verify publish status
ContentManager.isPublished('content-id'); // Should return true

// Manually trigger update
window.dispatchEvent(new CustomEvent('contentUpdated', {
  detail: { type: 'module', contentId: 'module-id' }
}));
```

### Issue: Content Changes Lost

**Recovery:**
```typescript
// Check if edits are stored
const edits = localStorage.getItem('study_buddy_content_v2');
console.log(JSON.parse(edits));

// Restore from backup if available
const backup = localStorage.getItem('content_backup_2024');
if (backup) {
  localStorage.setItem('study_buddy_content_v2', backup);
  window.location.reload();
}
```

### Issue: Student Progress Broken

**Diagnosis:**
```typescript
// Check user progress
const progress = localStorage.getItem('study_buddy_progress_[userId]');
console.log(JSON.parse(progress));

// Verify module IDs match
const modules = ContentManager.getAllModules();
modules.forEach(m => console.log(m.id));
```

---

## API Reference

### ContentManager Events

**Event: `contentUpdated`**
```typescript
// Listen for updates
window.addEventListener('contentUpdated', (event) => {
  const { type, contentId, moduleId, timestamp } = event.detail;
  // type: 'module' | 'lesson' | 'exercise' | 'project'
  // contentId: ID of updated content
  // moduleId: Parent module ID (if applicable)
  // timestamp: Time of update
});
```

**Event: `curriculumUpdated`**
```typescript
// Legacy event (still supported)
window.addEventListener('curriculumUpdated', (event) => {
  const { moduleId, updatedModule } = event.detail;
});
```

---

## Migration Guide

### Upgrading from CurriculumManager to ContentManager

**Before:**
```typescript
import { CurriculumManager } from '../utils/curriculumManager';
const modules = CurriculumManager.getAllModules();
```

**After:**
```typescript
import ContentManager from '../utils/contentManager';
const modules = ContentManager.getAllModules();
```

**Benefits:**
- Full lesson/exercise/project management
- Publish status control
- Better event system
- More granular edits

---

## Future Enhancements

### Planned Features:
- [ ] Content versioning history
- [ ] Collaborative editing (multi-admin)
- [ ] Content analytics (which lessons are most difficult)
- [ ] A/B testing for different lesson formats
- [ ] Import/Export curriculum packages
- [ ] Content templates
- [ ] Automated content quality checks

---

## Support

For technical issues or questions about the content management system:

1. Check this documentation
2. Review error logs in browser console
3. Verify localStorage state
4. Check event listeners are properly attached
5. Ensure ContentManager is imported correctly

---

## Summary

The Study Buddy Content Management System provides a robust, synchronized content platform where:

✅ **Admins** can edit, publish, and manage all learning content
✅ **Students** always see the latest published content
✅ **Changes** sync automatically without page refreshes
✅ **Progress** is preserved across content updates
✅ **Data** is stored locally with event-driven updates

This architecture ensures that the Admin Dashboard and Student Interface are always perfectly synchronized, providing a seamless learning experience while giving administrators full control over the curriculum.
