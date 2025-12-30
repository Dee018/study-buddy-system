# Visual State Consistency Guide

## 🎨 Purpose

This guide ensures **consistent visual representation** of progress states across the entire Java Study Buddy system, including:
- Learning Hub
- Profile Page  
- Assessment Screen
- Admin Dashboard

---

## 🌈 Color System

### Progress States Color Palette

| State | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| **Completed** | `text-green-600` `border-green-500/30` `bg-green-500/5` | `dark:text-green-400` `dark:border-green-500/30` `dark:bg-green-500/5` | Lessons, exercises, projects, modules that are 100% done |
| **In Progress** | `text-blue-600` `border-blue-500/30` `bg-blue-500/5` | `dark:text-blue-400` `dark:border-blue-500/30` `dark:bg-blue-500/5` | Items started but not completed |
| **Locked** | `text-gray-400` `border-gray-300` `bg-gray-50` | `dark:text-gray-500` `dark:border-gray-700` `dark:bg-gray-800` | Items not yet accessible |
| **Available** | `text-foreground` `border-border` `bg-background` | `dark:text-foreground` `dark:border-border` `dark:bg-background` | Items ready to start |
| **Warning/Issue** | `text-orange-600` `border-orange-500/30` `bg-orange-500/5` | `dark:text-orange-400` `dark:border-orange-500/30` `dark:bg-orange-500/5` | Consistency issues, warnings |

---

## 🎯 Icon System

### Icons by State

```tsx
import { 
  CheckCircle,    // ✅ Completed
  PlayCircle,     // 🔄 In Progress
  Circle,         // ⚪ Not Started
  Lock,           // 🔒 Locked
  AlertTriangle,  // ⚠️ Warning
  Clock,          // 🕒 Pending
  Award,          // 🏆 Achievement
  Zap             // ⚡ XP/Points
} from 'lucide-react';
```

### Icon Implementation Examples

#### Completed State
```tsx
<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
```

#### In Progress State
```tsx
<PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
```

#### Locked State
```tsx
<Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
```

---

## 📋 Badge System

### Badge Variants by State

#### Completed Badge
```tsx
<Badge 
  variant="outline" 
  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
>
  Completed
</Badge>
```

#### In Progress Badge
```tsx
<Badge 
  variant="outline" 
  className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
>
  In Progress
</Badge>
```

#### Locked Badge
```tsx
<Badge 
  variant="outline" 
  className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30"
>
  Locked
</Badge>
```

#### Read-Only Badge (for completed exercises)
```tsx
<Badge 
  variant="outline" 
  className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
>
  ✓ Submitted • Read-Only
</Badge>
```

---

## 📦 Card States

### Completed Card
```tsx
<Card className="border-green-500/30 bg-green-500/5">
  <CardContent className="pt-4">
    <div className="flex items-center gap-2 mb-2">
      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      <h3 className="font-semibold">Item Title</h3>
      <Badge 
        variant="outline" 
        className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
      >
        Completed
      </Badge>
    </div>
    {/* Card content */}
  </CardContent>
</Card>
```

### In Progress Card
```tsx
<Card className="border-blue-500/30 bg-blue-500/5">
  <CardContent className="pt-4">
    <div className="flex items-center gap-2 mb-2">
      <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      <h3 className="font-semibold">Item Title</h3>
      <Badge 
        variant="outline" 
        className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
      >
        In Progress
      </Badge>
    </div>
    {/* Card content */}
  </CardContent>
</Card>
```

### Locked Card
```tsx
<Card className="opacity-60 cursor-not-allowed">
  <CardContent className="pt-4">
    <div className="flex items-center gap-2 mb-2">
      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      <h3 className="font-semibold text-gray-500 dark:text-gray-400">Item Title</h3>
      <Badge 
        variant="outline" 
        className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30"
      >
        Locked
      </Badge>
    </div>
    <p className="text-sm text-muted-foreground">
      Complete previous items to unlock
    </p>
  </CardContent>
</Card>
```

---

## 🎨 Progress Bars

### Standard Progress Bar
```tsx
<Progress 
  value={completionPercentage} 
  className="h-2"
/>
```

### Completed Progress (100%)
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Module Progress</span>
    <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
      100% Complete
    </span>
  </div>
  <Progress 
    value={100} 
    className="h-2 bg-green-100 dark:bg-green-900/20"
  />
</div>
```

### In-Progress Bar (with XP indicator)
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Module Progress</span>
    <span className="text-sm text-muted-foreground">
      {completedItems}/{totalItems} • {xpEarned} XP
    </span>
  </div>
  <Progress 
    value={percentage} 
    className="h-2"
  />
</div>
```

---

## 🔘 Button States

### Primary Action (Available)
```tsx
<Button className="rounded-xl">
  Start Lesson
</Button>
```

### Completed Action
```tsx
<Button 
  className="rounded-xl bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
>
  <CheckCircle className="w-4 h-4 mr-2" />
  Completed
</Button>
```

### Resume Action
```tsx
<Button 
  variant="outline" 
  className="rounded-xl border-blue-500/50 text-blue-600 dark:text-blue-400"
>
  <PlayCircle className="w-4 h-4 mr-2" />
  Resume
</Button>
```

### Locked Action
```tsx
<Button 
  disabled 
  className="rounded-xl opacity-50 cursor-not-allowed"
>
  <Lock className="w-4 h-4 mr-2" />
  Locked
</Button>
```

### Review Completed Work
```tsx
<Button 
  variant="outline" 
  className="rounded-xl border-green-500/50"
>
  <Eye className="w-4 h-4 mr-2" />
  Review
</Button>
```

---

## 📊 Module Card States

### Module Card Template

```tsx
interface ModuleCardProps {
  module: Module;
  completionPercentage: number;
  isCompleted: boolean;
  isInProgress: boolean;
  isLocked: boolean;
}

function ModuleCard({ module, completionPercentage, isCompleted, isInProgress, isLocked }: ModuleCardProps) {
  const getBorderClass = () => {
    if (isCompleted) return "border-green-500/30 bg-green-500/5";
    if (isInProgress) return "border-blue-500/30 bg-blue-500/5";
    if (isLocked) return "opacity-60 cursor-not-allowed";
    return "";
  };

  const getIcon = () => {
    if (isCompleted) return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
    if (isInProgress) return <PlayCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
    if (isLocked) return <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />;
    return <Circle className="w-6 h-6 text-muted-foreground" />;
  };

  const getBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
          ✓ Completed
        </Badge>
      );
    }
    if (isInProgress) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
          In Progress
        </Badge>
      );
    }
    if (isLocked) {
      return (
        <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30">
          🔒 Locked
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className={`transition-all ${getBorderClass()}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </div>
          </div>
          {getBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={completionPercentage} className="mb-4" />
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Lessons</p>
            <p className="font-medium">{module.completedLessons}/{module.totalLessons}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Exercises</p>
            <p className="font-medium">{module.completedExercises}/{module.totalExercises}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Project</p>
            <p className="font-medium">{module.projectCompleted ? '✓' : '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎭 Animation & Transitions

### Smooth State Transitions
```tsx
// Add to cards/buttons for smooth state changes
className="transition-all duration-300 ease-in-out"
```

### Completion Animation
```tsx
// When item completes, add this animation
className="animate-pulse"

// Or use motion for more control
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {/* Completed content */}
</motion.div>
```

### Loading State
```tsx
<RefreshCw className="w-4 h-4 animate-spin" />
```

---

## 📱 Responsive Behavior

### Mobile Considerations

```tsx
// Stack items vertically on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Adjust icon sizes
<CheckCircle className="w-4 h-4 md:w-5 md:h-5" />

// Responsive text
<h3 className="text-sm md:text-base lg:text-lg">Title</h3>
```

---

## 🌗 Dark Mode Testing Checklist

- [ ] Completed state is visible and green in dark mode
- [ ] In-progress state is visible and blue in dark mode
- [ ] Locked state is visible and gray in dark mode
- [ ] Text has sufficient contrast (WCAG AA: 4.5:1 minimum)
- [ ] Borders are visible against dark background
- [ ] Badges are legible
- [ ] Progress bars are visible
- [ ] Icons stand out appropriately
- [ ] Hover states work in dark mode
- [ ] Focus states are visible

---

## ✅ Implementation Checklist

When adding a new progress-tracked component:

- [ ] Use consistent color classes for states
- [ ] Use appropriate icons from lucide-react
- [ ] Add dark mode variants
- [ ] Use Badge component for status
- [ ] Add Progress bar for completion tracking
- [ ] Include smooth transitions
- [ ] Test in both light and dark modes
- [ ] Ensure WCAG accessibility compliance
- [ ] Match existing spacing (gap-2, gap-4, etc.)
- [ ] Use consistent border radius (rounded-xl for buttons)
- [ ] Add proper hover/focus states

---

## 🎨 Example: Complete Implementation

### Lesson Item with All States

```tsx
import { CheckCircle, PlayCircle, Lock, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface LessonItemProps {
  lesson: Lesson;
  isCompleted: boolean;
  isInProgress: boolean;
  isLocked: boolean;
  onStart: () => void;
  onReview: () => void;
}

function LessonItem({ 
  lesson, 
  isCompleted, 
  isInProgress, 
  isLocked, 
  onStart, 
  onReview 
}: LessonItemProps) {
  // Determine state classes
  const getStateClasses = () => {
    if (isCompleted) return {
      card: "border-green-500/30 bg-green-500/5",
      icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
      badge: (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
          ✓ Completed
        </Badge>
      ),
      button: (
        <Button 
          variant="outline" 
          className="rounded-xl border-green-500/50"
          onClick={onReview}
        >
          <Eye className="w-4 h-4 mr-2" />
          Review
        </Button>
      )
    };

    if (isInProgress) return {
      card: "border-blue-500/30 bg-blue-500/5",
      icon: <PlayCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      badge: (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
          In Progress
        </Badge>
      ),
      button: (
        <Button 
          variant="outline" 
          className="rounded-xl border-blue-500/50"
          onClick={onStart}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Resume
        </Button>
      )
    };

    if (isLocked) return {
      card: "opacity-60 cursor-not-allowed",
      icon: <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />,
      badge: (
        <Badge className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30">
          🔒 Locked
        </Badge>
      ),
      button: (
        <Button 
          disabled 
          className="rounded-xl opacity-50 cursor-not-allowed"
        >
          <Lock className="w-4 h-4 mr-2" />
          Locked
        </Button>
      )
    };

    // Available to start
    return {
      card: "",
      icon: null,
      badge: null,
      button: (
        <Button 
          className="rounded-xl"
          onClick={onStart}
        >
          Start Lesson
        </Button>
      )
    };
  };

  const state = getStateClasses();

  return (
    <Card className={`transition-all duration-300 ${state.card}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {state.icon}
            <div>
              <h4 className="font-semibold">{lesson.title}</h4>
              <p className="text-sm text-muted-foreground">{lesson.duration} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.badge}
            {state.button}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Summary

### Key Principles

1. **Consistency**: Same colors, icons, and styles across all components
2. **Clarity**: Visual state should be immediately obvious
3. **Accessibility**: WCAG compliant contrast ratios
4. **Responsiveness**: Works on all screen sizes
5. **Dark Mode**: Fully supported with proper color variants
6. **Smooth Transitions**: No jarring state changes

### Quick Reference

| Need | Use |
|------|-----|
| Completed visual | Green checkmark + green styling |
| In-progress visual | Blue play icon + blue styling |
| Locked visual | Gray lock icon + reduced opacity |
| Buttons | `rounded-xl` for consistency |
| State changes | `transition-all duration-300` |
| Dark mode | Always add `dark:` variants |
| Icons | lucide-react library |
| Badges | Custom colored Badge component |

---

**Maintained by**: Development Team  
**Last Updated**: System-Wide Progress Tracking Implementation  
**Version**: 1.0
