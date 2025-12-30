# Edit Module Page - Visual Flow Diagrams

## Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EDIT MODULE PAGE                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📍 Breadcrumb: Dashboard > Content > Edit Module                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  Edit Module                                  [🌐 Published]        │
│  │  Customize module content, lessons, exercises, and projects         │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [📚 Content] [⚡ Activities] [🏆 Assessment] [⚙️ Settings]      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  [ACTIVE TAB CONTENT - SCROLLABLE AREA]                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 💾 Bottom Action Bar (Sticky)                                   │   │
│  │ [← Back to Dashboard]    [⚠️ Unsaved Changes]  [💾 Save All] │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tab 1: Content Tab Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  CONTENT TAB                                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📝 MODULE INFORMATION                                               │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Module Title: [___________________________]         │          │
│  │  Description:  [                            ]         │          │
│  │                [                            ]         │          │
│  │  Difficulty:   [Beginner ▼]  Est. Hours: [4 ]       │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  📚 LESSONS (3)                              [+ Add Lesson] ←─┐     │
│  ┌──────────────────────────────────────────────────────┐    │     │
│  │  ⋮⋮ Lesson 1: Introduction to Java                   │    │     │
│  │     Beginner • 30 min • 100 XP                        │    │     │
│  │     Learn Java basics and setup...                    │    │     │
│  │                           [👁️ Preview] [✏️ Edit] [🗑️ Delete] │  │
│  └──────────────────────────────────────────────────────┘    │     │
│  ┌──────────────────────────────────────────────────────┐    │     │
│  │  ⋮⋮ Lesson 2: Variables and Data Types               │    │     │
│  │     Beginner • 45 min • 150 XP                        │    │     │
│  │     Master variable declaration...                    │    │     │
│  │                           [👁️ Preview] [✏️ Edit] [🗑️ Delete] │  │
│  └──────────────────────────────────────────────────────┘    │     │
│  ┌──────────────────────────────────────────────────────┐    │     │
│  │  ⋮⋮ Lesson 3: Control Flow Statements                │    │     │
│  │     Intermediate • 60 min • 200 XP                    │    │     │
│  │     Learn if statements and loops...                  │    │     │
│  │                           [👁️ Preview] [✏️ Edit] [🗑️ Delete] │  │
│  └──────────────────────────────────────────────────────┘    │     │
│                                                               │     │
└───────────────────────────────────────────────────────────────┴─────┘
                                                                 │
                              Clicking "Add Lesson" opens ──────┘
                                                                 │
                                                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ✏️ EDIT LESSON DIALOG                                     [✕]      │
├─────────────────────────────────────────────────────────────────────┤
│  📄 BASIC INFORMATION                                                │
│  ─────────────────────────────────────────────────                  │
│  Lesson Title*                                                       │
│  [e.g., Introduction to Variables_______________________]           │
│  A clear, descriptive title for the lesson                          │
│                                                                      │
│  Description*                                                        │
│  [Describe what students will learn...                ]             │
│  [                                                     ]             │
│  [                                                     ]             │
│  Brief overview of lesson objectives and content                    │
│                                                                      │
│  ✨ LESSON SETTINGS                                                  │
│  ─────────────────────────────────────────────────                  │
│  Difficulty Level          Estimated Duration                       │
│  [🟢 Beginner    ▼]        [30 min_________]                       │
│  Determines complexity     Expected completion time                 │
│                                                                      │
│  Experience Points (XP)                                              │
│  [100________]                                                       │
│  Reward points for completing this lesson                           │
│                                                                      │
│                                      [Cancel]  [💾 Save Lesson]     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tab 2: Activities Tab Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  ACTIVITIES TAB                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  💻 HANDS-ON EXERCISES (2)                   [+ Add Exercise] ←─┐   │
│  ┌──────────────────────────────────────────────────────┐      │   │
│  │  ⋮⋮ Exercise 1: Hello World Program                  │      │   │
│  │     Easy • 3 steps • 50 XP                            │      │   │
│  │     Write your first Java program                     │      │   │
│  │                           [👁️ Preview] [✏️ Edit] [🗑️ Delete]    │
│  └──────────────────────────────────────────────────────┘      │   │
│  ┌──────────────────────────────────────────────────────┐      │   │
│  │  ⋮⋮ Exercise 2: Variable Declaration Practice        │      │   │
│  │     Medium • 5 steps • 100 XP                         │      │   │
│  │     Practice declaring different data types           │      │   │
│  │                           [👁️ Preview] [✏️ Edit] [🗑️ Delete]    │
│  └──────────────────────────────────────────────────────┘      │   │
│                                                                 │   │
└─────────────────────────────────────────────────────────────────┴───┘
                                                                  │
                           Clicking "Add Exercise" opens ────────┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  💻 EDIT EXERCISE DIALOG                                   [✕]      │
├─────────────────────────────────────────────────────────────────────┤
│  📄 BASIC INFORMATION                                                │
│  ─────────────────────────────────────────────────                  │
│  Exercise Title*                                                     │
│  [e.g., Create a Simple Calculator_____________________]            │
│                                                                      │
│  Description*                                                        │
│  [What should students accomplish...                  ]             │
│  [                                                     ]             │
│                                                                      │
│  ✨ EXERCISE SETTINGS                                                │
│  ─────────────────────────────────────────────────                  │
│  Difficulty        XP Reward                                         │
│  [Easy       ▼]    [50______]                                       │
│                                                                      │
│  💻 STARTER CODE                                                     │
│  ─────────────────────────────────────────────────                  │
│  Starter Code                                                        │
│  ┌──────────────────────────────────────────────┐                  │
│  │ // Write your code here                      │                  │
│  │ public class Calculator {                    │                  │
│  │     public static void main(String[] args) { │                  │
│  │         // TODO: Implement calculator         │                  │
│  │     }                                         │                  │
│  │ }                                             │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│                                    [Cancel]  [💾 Save Exercise]     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tab 3: Assessment Tab Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  ASSESSMENT TAB                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🏆 ASSESSMENT PROJECT  [✅ Configured]                              │
│     Final project to assess module completion                       │
│                       [👁️ Preview] [✏️ Edit] [🗑️ Delete] ←──────┐   │
│                                                                 │   │
│  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  Student Management System          [Medium Difficulty]  │  │   │
│  │  Build a complete Java application to manage students    │  │   │
│  │                                                           │  │   │
│  │  ─────────────────────────────────────────────────────   │  │   │
│  │                                                           │  │   │
│  │  Objectives                Requirements                  │  │   │
│  │  ✅ Master OOP concepts   🎯 Complete all lessons        │  │   │
│  │  ✅ Database integration  🎯 Pass all exercises          │  │   │
│  │  ✅ Error handling        🎯 Understand Java basics      │  │   │
│  │                                                           │  │   │
│  │  ─────────────────────────────────────────────────────   │  │   │
│  │                                                           │  │   │
│  │  ⏱️ 2 hours   💎 500 XP   📦 5 Features                  │  │   │
│  └──────────────────────────────────────────────────────────┘  │   │
│                                                                 │   │
└─────────────────────────────────────────────────────────────────┴───┘
                                                                  │
                           Clicking "Edit" opens ────────────────┘
                                                                  │
                                                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  🏆 EDIT ASSESSMENT PROJECT DIALOG                         [✕]      │
├─────────────────────────────────────────────────────────────────────┤
│  📄 PROJECT INFORMATION                                              │
│  ─────────────────────────────────────────────────                  │
│  Project Title*                                                      │
│  [Build a Student Management System____________________]            │
│                                                                      │
│  Description*                                                        │
│  [Describe the project requirements...                ]             │
│  [                                                     ]             │
│  [                                                     ]             │
│  [                                                     ]             │
│                                                                      │
│  ✨ PROJECT SETTINGS                                                 │
│  ─────────────────────────────────────────────────                  │
│  Difficulty        Estimated Time                                    │
│  [Medium     ▼]    [2 hours_____]                                   │
│                                                                      │
│  XP Reward                                                           │
│  [500_______]                                                        │
│                                                                      │
│  💻 STARTER CODE                                                     │
│  ─────────────────────────────────────────────────                  │
│  ┌──────────────────────────────────────────────┐                  │
│  │ // Project starter code                      │                  │
│  │ public class StudentManagementSystem {       │                  │
│  │     // TODO: Implement the system            │                  │
│  │ }                                             │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                      │
│                                     [Cancel]  [💾 Save Project]     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tab 4: Settings Tab Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  SETTINGS TAB                                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🌐 PUBLICATION                                                      │
│  ─────────────────────────────────────────────────                  │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Publish Module                              [ON/OFF]│          │
│  │  Make this module visible to students                │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  🔒 ACCESS CONTROL                                                   │
│  ─────────────────────────────────────────────────                  │
│  Prerequisites                                                       │
│  Modules that must be completed before accessing this one           │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  No prerequisites configured                         │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  📄 METADATA                                                         │
│  ─────────────────────────────────────────────────                  │
│  Tags                                                                │
│  [e.g., java, beginner, programming__________] (Disabled)           │
│  Coming soon: Add tags to help students find this module            │
│                                                                      │
│  ⚠️ DANGER ZONE                                                      │
│  ─────────────────────────────────────────────────                  │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Reset Module                                        │          │
│  │  Clear all student progress for this module          │          │
│  │  [Reset Progress] (Disabled)                         │          │
│  │  ─────────────────────────────────────────────────   │          │
│  │  Delete Module                                        │          │
│  │  Permanently delete this module and all its content  │          │
│  │  [🗑️ Delete Module] (Disabled)                      │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Delete Confirmation Flow

```
User clicks [🗑️ Delete] on any item
             │
             ▼
┌─────────────────────────────────────────────────┐
│  ⚠️ CONFIRM DELETION DIALOG                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  Are you sure you want to delete                │
│  "Introduction to Variables"?                    │
│                                                  │
│  This action cannot be undone.                   │
│                                                  │
│                    [Cancel]  [🗑️ Delete]        │
└─────────────────────────────────────────────────┘
             │                    │
             │                    ▼
             │            Item deleted
             │                    │
             │                    ▼
             │          Toast notification shown
             │          "Lesson deleted successfully"
             │                    │
             │                    ▼
             │            hasChanges = true
             │                    │
             ▼                    ▼
        No changes           List updates
```

---

## Save Flow

```
User makes changes in any tab
             │
             ▼
   hasChanges = true
             │
             ▼
Bottom bar shows: [⚠️ Unsaved Changes] [💾 Save All Changes (enabled)]
             │
             ▼
User clicks [💾 Save All Changes]
             │
             ▼
    isSaving = true
             │
             ▼
Button shows: [⏳ Saving...]
             │
             ▼
Save to CurriculumManager (localStorage)
             │
             ▼
Trigger ContentManager sync
             │
             ▼
Show success toast: "Module saved successfully"
             │
             ▼
Wait 500ms
             │
             ▼
Navigate back to Dashboard → Content Tab
             │
             ▼
Dashboard auto-refreshes with new data
```

---

## Drag and Drop Visual Flow

```
Initial State:
┌──────────────────┐
│ ⋮⋮ Lesson 1      │
└──────────────────┘
┌──────────────────┐
│ ⋮⋮ Lesson 2      │
└──────────────────┘
┌──────────────────┐
│ ⋮⋮ Lesson 3      │
└──────────────────┘

User starts dragging Lesson 1:
┌──────────────────┐  ← Cursor: grabbing
│ ⋮⋮ Lesson 1      │
└──────────────────┘
┌──────────────────┐
│ ⋮⋮ Lesson 2      │
└──────────────────┘
┌──────────────────┐
│ ⋮⋮ Lesson 3      │
└──────────────────┘

Dragging over Lesson 3:
┌──────────────────┐
│ ⋮⋮ Lesson 2      │
└──────────────────┘
╔══════════════════╗  ← Purple border, scale up
║ ⋮⋮ Lesson 3      ║
╚══════════════════╝
    ↑ Drop target

Drop completed:
┌──────────────────┐
│ ⋮⋮ Lesson 2      │
└──────────────────┘
┌──────────────────┐
│ ⋮⋮ Lesson 3      │
└──────────────────┘
┌──────────────────┐  ← Moved to bottom
│ ⋮⋮ Lesson 1      │
└──────────────────┘
```

---

## Button State Transitions

### Edit Button States

```
Default State:
[✏️ Edit]
  │
  ▼ Mouse enters
Hover State:
[✏️ Edit]  ← Purple tint, icon rotates 12°, smooth 200ms
  │
  ▼ Mouse pressed
Active State:
[✏️ Edit]  ← Scales to 95%, deeper shadow
  │
  ▼ Click completes
Dialog Opens
```

### Delete Button States

```
Default State:
[🗑️ Delete]
  │
  ▼ Mouse enters
Hover State:
[🗑️ Delete]  ← Red tint background, text stays red
  │
  ▼ Mouse pressed
Active State:
[🗑️ Delete]  ← Scales to 95%
  │
  ▼ Click completes
Confirmation Dialog Opens
```

### Save Button States

```
Default State (no changes):
[💾 Save All Changes]  ← Disabled, opacity 50%
  │
  ▼ Changes made
Enabled State:
[💾 Save All Changes]  ← Purple gradient, shadow
  │
  ▼ Mouse enters
Hover State:
[💾 Save All Changes]  ← Deeper gradient, larger shadow
  │
  ▼ Click
Loading State:
[⏳ Saving...]  ← Spinner animation
  │
  ▼ Save completes
Success → Navigate back
```

---

## Empty State Visuals

### No Lessons

```
┌───────────────────────────────────────────┐
│                                            │
│           📚                               │
│     (12x12 icon, muted)                   │
│                                            │
│      No lessons yet                        │
│                                            │
│   [+ Add Your First Lesson]                │
│                                            │
└───────────────────────────────────────────┘
```

### No Exercises

```
┌───────────────────────────────────────────┐
│                                            │
│           💻                               │
│     (12x12 icon, muted)                   │
│                                            │
│     No exercises yet                       │
│                                            │
│   [+ Add Your First Exercise]              │
│                                            │
└───────────────────────────────────────────┘
```

### No Project

```
┌───────────────────────────────────────────┐
│                                            │
│           🏆                               │
│     (12x12 icon, muted)                   │
│                                            │
│  No assessment project configured          │
│  Create a final project to assess          │
│       student learning                     │
│                                            │
│   [+ Create Assessment Project]            │
│                                            │
└───────────────────────────────────────────┘
```

---

## Toast Notification Positions

```
Screen:
┌─────────────────────────────────────────────┐
│  Edit Module Page                           │
│                                             │
│                                   ┌─────────┴──┐
│  [Content]                        │ 🎉 Success │
│                                   │ Module     │
│  Module info...                   │ saved!     │
│                                   └────────────┘
│  Lessons...                     ↑
│                          Toast appears here
│                          (top-right corner)
│                          - Slides in
│                          - Auto-dismisses
│                          - Can be closed
│
└─────────────────────────────────────────────┘
```

---

## Navigation Breadcrumb Flow

```
Dashboard
    │
    └─→ Content Tab
            │
            └─→ Module List
                    │
                    └─→ [Edit Button]
                            │
                            └─→ Edit Module Page
                                    │
                                    ├─→ Content Tab
                                    ├─→ Activities Tab
                                    ├─→ Assessment Tab
                                    └─→ Settings Tab
                                            │
                                            └─→ [Save/Back]
                                                    │
                                                    └─→ Dashboard → Content Tab
```

Each level is clickable in the breadcrumb:
```
Dashboard > Content > Edit Module
   ↓           ↓          ↓
 Click     Click      Current
 returns   returns    location
 to main   to list
```

---

## Responsive Behavior

### Desktop (1200px+)
```
┌────────────────────────────────────────┐
│  Full width cards (max-w-7xl)          │
│  4-column tab list                      │
│  Side-by-side form fields               │
│  Bottom bar spans full width            │
└────────────────────────────────────────┘
```

### Tablet (768px - 1199px)
```
┌──────────────────────────────┐
│  Constrained width cards      │
│  4-column tab list            │
│  Stacked form fields          │
│  Bottom bar responsive        │
└──────────────────────────────┘
```

### Mobile (< 768px)
```
┌─────────────────┐
│  Full width     │
│  Scrolling tabs │
│  Stacked fields │
│  Stacked buttons│
└─────────────────┘
```

---

## Summary Visual Map

```
EDIT MODULE PAGE STRUCTURE
    │
    ├─── Header (Breadcrumb + Title + Status Badge)
    │
    ├─── Tab Navigation (4 tabs)
    │    │
    │    ├─── CONTENT
    │    │    ├─── Module Information Form
    │    │    └─── Lessons List
    │    │         ├─── Add Button → Dialog
    │    │         └─── Each Lesson
    │    │              ├─── Drag Handle
    │    │              ├─── Preview Button → Toast
    │    │              ├─── Edit Button → Dialog
    │    │              └─── Delete Button → Confirmation
    │    │
    │    ├─── ACTIVITIES
    │    │    └─── Exercises List
    │    │         ├─── Add Button → Dialog
    │    │         └─── Each Exercise
    │    │              ├─── Drag Handle
    │    │              ├─── Preview Button → Toast
    │    │              ├─── Edit Button → Dialog
    │    │              └─── Delete Button → Confirmation
    │    │
    │    ├─── ASSESSMENT
    │    │    └─── Project Card
    │    │         ├─── Create Button → Dialog (if none)
    │    │         ├─── Preview Button → Toast (if exists)
    │    │         ├─── Edit Button → Dialog (if exists)
    │    │         └─── Delete Button → Confirmation (if exists)
    │    │
    │    └─── SETTINGS
    │         ├─── Publication Toggle
    │         ├─── Prerequisites (coming soon)
    │         ├─── Tags (coming soon)
    │         └─── Danger Zone (disabled)
    │
    └─── Bottom Sticky Bar
         ├─── Back Button → Dashboard
         ├─── Unsaved Changes Badge (conditional)
         └─── Save Button → Save & Navigate
```

---

This visual guide complements the comprehensive interaction guide and shows exactly how all elements are structured and connected! 🎨
