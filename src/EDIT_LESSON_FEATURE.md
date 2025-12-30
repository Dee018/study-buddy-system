# Edit Lesson Feature Documentation

## Overview
The Edit Lesson feature provides a comprehensive interface for administrators to modify lesson content directly from the Edit Module page in the Admin Dashboard.

## User Flow

```
Admin Dashboard → Content Tab → Module Card → Edit Module → Lessons Section → Edit Button → Edit Lesson Dialog
```

## Feature Components

### 1. **Edit Button (Lessons Section)**

#### Location
- **Path**: Admin Dashboard → Content Tab → Edit Module Page → Lessons Section
- **Position**: Right side of each lesson card, next to the Delete button

#### Interactive States

| State | Behavior | Visual Feedback |
|-------|----------|-----------------|
| **Default** | Button is visible and ready to click | Ghost variant button with Edit2 icon |
| **Hover** | Mouse enters button area | • Background: Purple tint (`bg-primary/10`)<br>• Text color: Primary purple<br>• Icon rotates 12 degrees<br>• Smooth transition (200ms) |
| **Active/Click** | Button is being pressed | • Scales down to 95% (`scale-95`)<br>• Triggers dialog open |
| **Focus** | Keyboard navigation focus | Standard focus ring |

#### Code Reference
```tsx
<Button 
  variant="ghost" 
  size="sm"
  onClick={() => handleEditLesson(lesson, index)}
  className="hover:bg-primary/10 hover:text-primary active:scale-95 transition-all duration-200 group"
>
  <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
</Button>
```

---

### 2. **Edit Lesson Dialog**

#### Dialog Structure

```
┌─────────────────────────────────────────────────────┐
│  [Icon] Edit Lesson                                  │
│  Customize lesson content, difficulty, and reward   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📄 BASIC INFORMATION                                │
│  ─────────────────────────────────────────────      │
│  Lesson Title                                        │
│  [Input field]                                       │
│  A clear, descriptive title for the lesson          │
│                                                      │
│  Description                                         │
│  [Textarea field - 4 rows]                          │
│  Brief overview of lesson objectives and content    │
│                                                      │
│  ✨ LESSON SETTINGS                                  │
│  ─────────────────────────────────────────────      │
│  Difficulty Level    │  Estimated Duration          │
│  [Select dropdown]   │  [Input field]               │
│                                                      │
│  Experience Points (XP)                              │
│  [Number input]                                      │
│                                                      │
├─────────────────────────────────────────────────────┤
│                         [Cancel] [Save Changes] →   │
└─────────────────────────────────────────────────────┘
```

#### Dialog Properties
- **Max Width**: 600px
- **Max Height**: 85vh (viewport height)
- **Overflow**: Scrollable content area
- **Backdrop**: Semi-transparent overlay with blur effect

#### Form Fields

##### A. Lesson Title
- **Type**: Text Input
- **Placeholder**: "e.g., Introduction to Variables"
- **Validation**: Required field
- **Help Text**: "A clear, descriptive title for the lesson"

##### B. Description
- **Type**: Textarea
- **Rows**: 4
- **Placeholder**: "Describe what students will learn in this lesson..."
- **Help Text**: "Brief overview of lesson objectives and content"

##### C. Difficulty Level
- **Type**: Select Dropdown
- **Options**:
  - 🟢 Beginner
  - 🟡 Intermediate (stored as "Learner")
  - 🔴 Advanced
- **Visual**: Color-coded dots next to each option
- **Help Text**: "Determines lesson complexity"

##### D. Estimated Duration
- **Type**: Text Input
- **Placeholder**: "e.g., 30 min"
- **Format**: Flexible (accepts "30 min", "1 hour", "45 minutes", etc.)
- **Help Text**: "Expected completion time"

##### E. Experience Points (XP)
- **Type**: Number Input
- **Min Value**: 0
- **Step**: 10
- **Placeholder**: "e.g., 100"
- **Help Text**: "Reward points for completing this lesson"

---

### 3. **Dialog Actions**

#### Save Changes Button
- **Visual Design**:
  - Gradient background: `from-primary to-primary/80`
  - Icon: Save icon with 4px size
  - Shadow: Large shadow with hover enhancement
- **Interactions**:
  - **Default**: Purple gradient with shadow
  - **Hover**: Deeper gradient, larger shadow, smooth transition
  - **Active**: Scales down to 95%
  - **Click**: Saves lesson data and closes dialog

#### Cancel Button
- **Visual Design**: Outline variant
- **Interactions**:
  - **Click**: Closes dialog without saving
  - **Hover**: Standard outline hover state

---

## Expected Behaviors

### Opening the Dialog
1. Admin clicks the Edit button on a lesson card
2. System captures current lesson data
3. Dialog slides in from center with fade-in animation
4. Form fields populate with existing lesson data
5. Focus automatically moves to the first input field

### Editing Lesson Data
1. Admin modifies any field in the form
2. Changes are tracked in real-time in component state
3. All fields are immediately editable
4. Help text provides context for each field

### Saving Changes
1. Admin clicks "Save Changes" button
2. System validates form data (basic validation)
3. Updated lesson data replaces old data in module
4. Dialog closes with fade-out animation
5. Lesson card updates to show new information
6. Module's "hasChanges" flag is set to true
7. "Save Changes" button at page bottom becomes active

### Canceling Edit
1. Admin clicks "Cancel" or clicks outside dialog
2. Dialog closes without saving changes
3. All modifications are discarded
4. Lesson data remains unchanged

---

## Integration Points

### State Management
```typescript
// Dialog state
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
const [editingLessonIndex, setEditingLessonIndex] = useState<number | null>(null);
```

### Key Functions
```typescript
// Opens dialog with lesson data
handleEditLesson(lesson: Lesson, index: number)

// Saves edited lesson to module
handleSaveEditedLesson()

// Updates lesson state in real-time
setEditingLesson({ ...editingLesson!, field: newValue })
```

### Data Flow
```
User Input → editingLesson state → handleSaveEditedLesson() → 
editedModule.lessons[index] → CurriculumManager (on module save) → 
localStorage → ContentManager → User Dashboard
```

---

## Design System Compliance

### Colors
- **Primary Purple**: Used for buttons, icons, and accents
- **Gradient**: `from-primary/20 to-accent/20` for dialog header icon
- **Difficulty Indicators**:
  - Green (#22c55e) - Beginner
  - Yellow (#eab308) - Intermediate
  - Red (#ef4444) - Advanced

### Typography
- **Dialog Title**: 2xl size, default weight
- **Section Headers**: Small, uppercase, tracking-wide, muted
- **Labels**: Small size, default weight
- **Help Text**: Extra small, muted foreground

### Spacing
- **Dialog Content**: 6-unit vertical spacing between sections
- **Form Fields**: 4-unit vertical spacing
- **Grid Layout**: 2-column grid with 4-unit gap

### Animations
- **Dialog**: Smooth fade-in/out with scale
- **Button Hover**: 200ms transition
- **Button Active**: Scale down with 200ms easing
- **Icon Rotation**: 12-degree rotation on hover

---

## Technical Implementation

### Component Structure
```
EditModule
├── Module Information Card
├── Lessons Section Card
│   ├── Lesson Cards (draggable)
│   │   ├── Lesson Content
│   │   └── Action Buttons
│   │       ├── Edit Button ← INTERACTIVE
│   │       └── Delete Button
│   └── Empty State
└── Edit Lesson Dialog ← MODAL
    ├── Dialog Header
    ├── Basic Information Section
    ├── Lesson Settings Section
    └── Dialog Footer
        ├── Cancel Button
        └── Save Changes Button
```

### Accessibility Features
- **Keyboard Navigation**: Full tab order support
- **ARIA Labels**: Proper labeling for screen readers
- **Focus Management**: Auto-focus on dialog open
- **Escape Key**: Closes dialog
- **Click Outside**: Closes dialog (optional)

### Responsive Design
- **Desktop**: Full 600px width dialog
- **Tablet**: Responsive padding and margins
- **Mobile**: Full-width with safe margins

---

## Testing Checklist

### Visual Testing
- [ ] Edit button displays correct icon
- [ ] Hover state shows purple tint and icon rotation
- [ ] Active state scales button down
- [ ] Dialog opens with smooth animation
- [ ] Form fields are properly aligned
- [ ] Difficulty dropdown shows colored dots
- [ ] Buttons have correct styling

### Functional Testing
- [ ] Clicking Edit opens dialog with correct lesson data
- [ ] Form fields are pre-populated correctly
- [ ] All fields are editable
- [ ] Difficulty dropdown works correctly
- [ ] Number input accepts only numbers
- [ ] Save button updates lesson data
- [ ] Cancel button discards changes
- [ ] Dialog closes after save
- [ ] Module shows "unsaved changes" indicator

### Integration Testing
- [ ] Saved lesson data persists in module
- [ ] Module save persists lesson changes
- [ ] Changes sync to ContentManager
- [ ] User dashboard reflects updated lesson data
- [ ] Multiple edits work correctly
- [ ] Drag-and-drop still works after edit

---

## Future Enhancements

### Potential Additions
1. **Rich Text Editor**: For detailed lesson descriptions
2. **Content Sections**: Add lesson content, exercises, and projects
3. **Attachments**: Upload files, images, or resources
4. **Prerequisites**: Link dependent lessons
5. **Tags**: Categorize lessons by topic
6. **Preview**: View lesson as students would see it
7. **Duplicate**: Create a copy of existing lesson
8. **History**: Track and revert lesson changes
9. **Validation**: Enhanced form validation with error messages
10. **Autosave**: Periodic saving of changes

---

## Example Usage

### Scenario: Editing "Introduction to Variables" Lesson

1. **Initial State**
   - Title: "Introduction to Variables"
   - Description: "Learn about Java variables"
   - Difficulty: Beginner
   - Duration: "30 min"
   - Points: 100

2. **Admin Actions**
   - Clicks Edit button
   - Changes description to: "Master the fundamentals of Java variables, data types, and variable declaration syntax"
   - Updates difficulty to: Intermediate
   - Increases duration to: "45 min"
   - Increases points to: 150

3. **Result**
   - Dialog saves and closes
   - Lesson card updates immediately
   - Module shows unsaved changes indicator
   - Admin clicks module "Save Changes"
   - Data persists to localStorage
   - ContentManager syncs changes
   - Students see updated lesson information

---

## Error Handling

### Edge Cases
1. **Null/Undefined Lesson**: Dialog doesn't open
2. **Invalid Index**: Error logged, dialog doesn't open
3. **Empty Fields**: Allows saving (no strict validation currently)
4. **Special Characters**: Accepted in all text fields
5. **Large Numbers**: No upper limit on XP points
6. **Dialog Re-open**: Clears previous state correctly

---

## Performance Considerations

- **State Updates**: Minimal re-renders using focused state
- **Dialog Rendering**: Only renders when open
- **Form Fields**: Controlled components with efficient updates
- **Lesson List**: Maintains drag-and-drop performance
- **Save Operation**: Synchronous localStorage write

---

## Conclusion

The Edit Lesson feature provides a robust, user-friendly interface for lesson management that:
- ✅ Follows the Brilliant.org-inspired design system
- ✅ Provides clear visual feedback for all interactions
- ✅ Maintains data integrity throughout the editing process
- ✅ Integrates seamlessly with existing curriculum management
- ✅ Offers an intuitive user experience for administrators
