# Edit Module Page - Button Quick Reference Card

## 🎯 Quick Action Guide

This is your at-a-glance reference for all interactive buttons in the Edit Module page.

---

## 📚 CONTENT TAB

### Module Information Section
```
┌─────────────────────────────────────────┐
│ 📝 MODULE INFORMATION                   │
│ ─────────────────────────────────────── │
│ [Form fields - no action buttons]       │
│ Changes tracked automatically            │
└─────────────────────────────────────────┘
```

### Lessons Section
```
┌─────────────────────────────────────────────────────┐
│ 📚 LESSONS (3)                [+ Add Lesson]        │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ ⋮⋮ Lesson Title                                      │
│    Description...           [👁️] [✏️] [🗑️]          │
└─────────────────────────────────────────────────────┘

BUTTON ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add Lesson]      → Opens create lesson dialog
[⋮⋮] Drag Handle    → Click & drag to reorder lessons
[👁️ Preview]        → Shows preview (toast notification)
[✏️ Edit]           → Opens edit lesson dialog
[🗑️ Delete]         → Opens delete confirmation dialog
```

---

## ⚡ ACTIVITIES TAB

### Exercises Section
```
┌─────────────────────────────────────────────────────┐
│ 💻 HANDS-ON EXERCISES (2)     [+ Add Exercise]      │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ ⋮⋮ Exercise Title                                    │
│    Description...           [👁️] [✏️] [🗑️]          │
└─────────────────────────────────────────────────────┘

BUTTON ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Add Exercise]    → Opens create exercise dialog
[⋮⋮] Drag Handle    → Click & drag to reorder exercises
[👁️ Preview]        → Shows preview (toast notification)
[✏️ Edit]           → Opens edit exercise dialog
[🗑️ Delete]         → Opens delete confirmation dialog
```

---

## 🏆 ASSESSMENT TAB

### Project Section (No Project)
```
┌─────────────────────────────────────────────────────┐
│ 🏆 ASSESSMENT PROJECT                                │
│ ─────────────────────────────────────────────────── │
│                                                      │
│          🏆                                          │
│   No assessment project configured                   │
│                                                      │
│        [+ Create Assessment Project]                 │
└─────────────────────────────────────────────────────┘

BUTTON ACTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+ Create Assessment Project] → Opens create project dialog
```

### Project Section (With Project)
```
┌─────────────────────────────────────────────────────┐
│ 🏆 ASSESSMENT PROJECT  [✅ Configured]              │
│              [👁️ Preview] [✏️ Edit] [🗑️ Delete]      │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ Project Title    [Medium]                            │
│ Project description...                               │
│                                                      │
│ Objectives | Requirements | Features                │
└─────────────────────────────────────────────────────┘

BUTTON ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[👁️ Preview]        → Shows preview (toast notification)
[✏️ Edit]           → Opens edit project dialog
[🗑️ Delete]         → Opens delete confirmation dialog
```

---

## ⚙️ SETTINGS TAB

### All Settings
```
┌─────────────────────────────────────────────────────┐
│ ⚙️ MODULE SETTINGS                                   │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ 🌐 PUBLICATION                                       │
│    Publish Module              [○─────○] Toggle     │
│                                                      │
│ 🔒 ACCESS CONTROL                                    │
│    Prerequisites (coming soon)                       │
│                                                      │
│ 📄 METADATA                                          │
│    Tags (coming soon)                                │
│                                                      │
│ ⚠️ DANGER ZONE                                       │
│    [Reset Progress] (disabled)                       │
│    [🗑️ Delete Module] (disabled)                    │
└─────────────────────────────────────────────────────┘

BUTTON ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Publish Toggle]    → Switches between Published/Draft
[Reset Progress]    → (Future) Clear student progress
[🗑️ Delete Module]  → (Future) Delete entire module
```

---

## 🔽 BOTTOM ACTION BAR (Sticky)

```
┌─────────────────────────────────────────────────────┐
│ [← Back to Dashboard]  [⚠️ Unsaved]  [💾 Save All] │
└─────────────────────────────────────────────────────┘

BUTTON ACTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[← Back to Dashboard] → Returns to Admin Dashboard → Content
[💾 Save All Changes]  → Saves module + syncs + navigates back

STATES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Disabled (gray):   No changes to save
Enabled (purple):  Changes pending, ready to save
Loading (spinner): Currently saving...
```

---

## 📋 DIALOG BUTTONS

### Edit Lesson Dialog
```
┌─────────────────────────────────────────┐
│ ✏️ EDIT LESSON                     [✕]  │
│ ─────────────────────────────────────── │
│ [Form fields...]                         │
│                                          │
│                  [Cancel] [💾 Save]     │
└─────────────────────────────────────────┘

[Cancel]      → Closes dialog, discards changes
[💾 Save]     → Saves lesson, closes dialog, shows toast
[✕] Close     → Same as Cancel
```

### Edit Exercise Dialog
```
┌─────────────────────────────────────────┐
│ 💻 EDIT EXERCISE                   [✕]  │
│ ─────────────────────────────────────── │
│ [Form fields...]                         │
│                                          │
│                  [Cancel] [💾 Save]     │
└─────────────────────────────────────────┘

[Cancel]      → Closes dialog, discards changes
[💾 Save]     → Saves exercise, closes dialog, shows toast
[✕] Close     → Same as Cancel
```

### Edit Project Dialog
```
┌─────────────────────────────────────────┐
│ 🏆 EDIT PROJECT                    [✕]  │
│ ─────────────────────────────────────── │
│ [Form fields...]                         │
│                                          │
│                  [Cancel] [💾 Save]     │
└─────────────────────────────────────────┘

[Cancel]      → Closes dialog, discards changes
[💾 Save]     → Saves project, closes dialog, shows toast
[✕] Close     → Same as Cancel
```

### Delete Confirmation Dialog
```
┌─────────────────────────────────────────┐
│ ⚠️ CONFIRM DELETION                     │
│ ─────────────────────────────────────── │
│ Are you sure you want to delete         │
│ "Lesson Name"?                           │
│                                          │
│ This action cannot be undone.            │
│                                          │
│                  [Cancel] [🗑️ Delete]   │
└─────────────────────────────────────────┘

[Cancel]      → Closes dialog, no changes
[🗑️ Delete]   → Deletes item, shows toast, closes dialog
```

---

## 🎨 BUTTON STATE VISUAL GUIDE

### Primary Action Buttons (Add/Create/Save)

```
DEFAULT STATE:
┌─────────────────┐
│ + Add Lesson    │  ← Purple gradient
└─────────────────┘

HOVER STATE:
┌─────────────────┐
│ + Add Lesson    │  ← Deeper gradient + larger shadow
└─────────────────┘

ACTIVE STATE:
┌───────────────┐
│ + Add Lesson  │  ← Scaled to 95%
└───────────────┘

DISABLED STATE:
┌─────────────────┐
│ + Add Lesson    │  ← 50% opacity + not-allowed cursor
└─────────────────┘

LOADING STATE:
┌─────────────────┐
│ ⏳ Saving...    │  ← Spinner animation
└─────────────────┘
```

### Edit Button

```
DEFAULT:        HOVER:          ACTIVE:
┌─────┐        ┌─────┐         ┌────┐
│ ✏️  │        │ ✏️↻ │         │ ✏️ │
└─────┘        └─────┘         └────┘
              Purple tint      Scaled
              Icon rotates     down
```

### Delete Button

```
DEFAULT:        HOVER:          ACTIVE:
┌─────┐        ┌─────┐         ┌────┐
│ 🗑️  │        │ 🗑️  │         │ 🗑️ │
└─────┘        └─────┘         └────┘
              Red tint         Scaled
              Red bg           down
```

### Preview Button

```
DEFAULT:        HOVER:          ACTIVE:
┌─────┐        ┌─────┐         ┌────┐
│     │        │ 👁️  │         │ 👁️ │
└─────┘        └─────┘         └────┘
Invisible     Fades in        Scaled
opacity-0     Blue tint        down
```

---

## 🎯 KEYBOARD SHORTCUTS

```
TAB               → Navigate between fields/buttons
SHIFT + TAB       → Navigate backwards
ENTER             → Submit form (in dialogs)
ESCAPE            → Close active dialog
SPACE             → Toggle switches
CLICK + DRAG      → Reorder items
```

---

## 🔔 TOAST NOTIFICATIONS

### Success Toast
```
┌──────────────────────────┐
│ ✅ Module saved          │
│ All changes saved        │
└──────────────────────────┘
Duration: 3 seconds
Color: Green
Position: Top-right
```

### Info Toast
```
┌──────────────────────────┐
│ ℹ️ Creating new lesson   │
│ Fill in the details      │
└──────────────────────────┘
Duration: 3 seconds
Color: Blue
Position: Top-right
```

### Error Toast
```
┌──────────────────────────┐
│ ❌ Failed to save        │
│ Please try again         │
└──────────────────────────┘
Duration: 3 seconds
Color: Red
Position: Top-right
```

---

## 🗺️ NAVIGATION MAP

```
Dashboard → Content Tab → Module List → [Edit] →
    │
    └─→ Edit Module Page
            │
            ├─→ [Content Tab]
            │       ├─→ [Add Lesson] → Dialog
            │       ├─→ [Edit Lesson] → Dialog
            │       └─→ [Delete Lesson] → Confirmation
            │
            ├─→ [Activities Tab]
            │       ├─→ [Add Exercise] → Dialog
            │       ├─→ [Edit Exercise] → Dialog
            │       └─→ [Delete Exercise] → Confirmation
            │
            ├─→ [Assessment Tab]
            │       ├─→ [Create Project] → Dialog
            │       ├─→ [Edit Project] → Dialog
            │       └─→ [Delete Project] → Confirmation
            │
            ├─→ [Settings Tab]
            │       └─→ [Publish Toggle] → State change
            │
            └─→ [Save All] → Dashboard
```

---

## ⚡ QUICK TIPS

### Creating Content
1. Choose appropriate tab (Content/Activities/Assessment)
2. Click the "+ Add" button
3. Fill in the form fields
4. Click "Save" button
5. Toast confirms success

### Editing Content
1. Hover over the item card
2. Click the "Edit" (✏️) button
3. Modify the fields
4. Click "Save" button
5. Toast confirms update

### Deleting Content
1. Hover over the item card
2. Click the "Delete" (🗑️) button
3. Read the confirmation message
4. Click "Delete" to confirm
5. Toast confirms deletion

### Saving Module
1. Make any changes
2. See "Unsaved Changes" badge appear
3. Click "Save All Changes" button
4. Wait for "Saving..." state
5. Automatically returns to dashboard

### Reordering Items
1. Click and hold the drag handle (⋮⋮)
2. Drag item to new position
3. Release to drop
4. Order updates automatically

---

## 📊 BUTTON COUNT SUMMARY

| Section | Buttons per Item | Total Dynamic |
|---------|------------------|---------------|
| Lessons | 4 (Drag, Preview, Edit, Delete) | 4 × N lessons |
| Exercises | 4 (Drag, Preview, Edit, Delete) | 4 × N exercises |
| Project | 3 (Preview, Edit, Delete) | 3 (if exists) |

| Fixed Buttons | Count |
|---------------|-------|
| Add Lesson | 1 |
| Add Exercise | 1 |
| Create Project | 1 |
| Save All Changes | 1 |
| Back to Dashboard | 1 |
| Publish Toggle | 1 |
| Dialog buttons | 10 (2 × 5 dialogs) |

**Total Fixed**: 16 buttons  
**Total Dynamic**: 4N + 4M + 3 (where N = lessons, M = exercises)

---

## 🎨 COLOR CODING

```
PURPLE:    Primary actions, edit buttons, hovers
RED:       Delete buttons, destructive actions, danger zone
BLUE:      Preview buttons, info messages
GREEN:     Success states, checkmarks, beginner difficulty
YELLOW:    Intermediate difficulty, unsaved changes
ORANGE:    Advanced difficulty (red-ish)
GRAY:      Disabled states, muted text
```

---

## ✨ ANIMATION TIMING

```
All Transitions: 200ms ease-out
Hover Effects:   Instant (no delay)
Active States:   During click
Dialog Open:     Fade + scale in
Dialog Close:    Fade + scale out
Toast Appear:    Slide from right
Toast Dismiss:   Fade out
Drag Feedback:   Instant
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (> 1200px)
- Full width cards
- Side-by-side buttons
- 4-column tab list
- Expanded dialogs

### Tablet (768px - 1199px)
- Constrained cards
- Wrapped buttons
- 4-column tabs (scrollable)
- Responsive dialogs

### Mobile (< 768px)
- Full width cards
- Stacked buttons
- Scrolling tabs
- Full-screen dialogs

---

## 🏁 QUICK REFERENCE SUMMARY

### What You Need to Know
1. **4 Tabs**: Content, Activities, Assessment, Settings
2. **3 Dialog Types**: Lesson, Exercise, Project
3. **1 Confirmation**: Delete warning
4. **3 Toast Types**: Success, Info, Error
5. **2 Main Actions**: Edit existing, Create new
6. **1 Save Button**: Saves everything at once

### Common Actions
- **Add**: Use the "+ Add" buttons
- **Edit**: Click the ✏️ icon
- **Delete**: Click the 🗑️ icon
- **Preview**: Click the 👁️ icon
- **Reorder**: Drag the ⋮⋮ handle
- **Save**: Click "Save All Changes"
- **Cancel**: Use "Cancel" or "Back"

### State Indicators
- **Purple Badge**: Published module
- **Gray Badge**: Draft module
- **Yellow Badge**: Unsaved changes
- **Green Badge**: Configured project
- **Loading**: Spinner animation

---

**Print this page for quick reference while editing modules!** 📄
