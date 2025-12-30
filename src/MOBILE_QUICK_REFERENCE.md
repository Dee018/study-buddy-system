# Mobile Responsiveness - Quick Reference Guide

Quick reference for implementing mobile-responsive features in Java Study Buddy.

---

## 🎯 Common Patterns

### Responsive Padding
```tsx
// Single value responsive
className="p-4 sm:p-6 lg:p-8"

// Horizontal responsive
className="px-4 sm:px-6 lg:px-8"

// Vertical responsive
className="py-4 sm:py-6 lg:py-8"
```

### Responsive Grids
```tsx
// 1 column → 2 columns → 3 columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// 1 column → 2 columns → 3 columns → 4 columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"

// Always 2 columns with responsive gap
className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
```

### Responsive Text
```tsx
// Headings
className="text-xl sm:text-2xl lg:text-3xl"
className="text-lg sm:text-xl lg:text-2xl"
className="text-base sm:text-lg lg:text-xl"

// Body text
className="text-sm sm:text-base"
className="text-xs sm:text-sm"
```

### Responsive Flexbox
```tsx
// Stack on mobile, row on desktop
className="flex flex-col lg:flex-row gap-4"

// Center on mobile, left on desktop
className="items-center lg:items-start"

// Wrap on smaller screens
className="flex flex-wrap gap-4"
```

---

## 🔧 Utility Hooks

### Device Detection
```tsx
import { useIsMobile, useIsTablet, useIsTouchDevice } from '../utils/responsiveUtils';

function MyComponent() {
  const isMobile = useIsMobile();        // < 768px
  const isTablet = useIsTablet();        // 768-1024px
  const isTouchDevice = useIsTouchDevice(); // Has touch capability
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### Platform Detection
```tsx
import { useIsIOS, useIsAndroid } from '../utils/responsiveUtils';

function MyComponent() {
  const isIOS = useIsIOS();
  const isAndroid = useIsAndroid();
  
  return (
    <div className={isIOS ? 'ios-styles' : 'android-styles'}>
      {/* Platform-specific content */}
    </div>
  );
}
```

### Window Size
```tsx
import { useWindowSize } from '../utils/responsiveUtils';

function MyComponent() {
  const { width, height } = useWindowSize();
  
  return <div>Window: {width}x{height}</div>;
}
```

---

## 📱 Mobile Components

### Conditional Rendering
```tsx
import { MobileOnly, DesktopOnly, TabletOnly } from './ui/mobile-detector';

function MyComponent() {
  return (
    <>
      <MobileOnly>
        <MobileNavigation />
      </MobileOnly>
      
      <DesktopOnly>
        <DesktopNavigation />
      </DesktopOnly>
      
      <TabletOnly>
        <TabletNavigation />
      </TabletOnly>
    </>
  );
}
```

### Responsive Render
```tsx
import { ResponsiveRender } from './ui/mobile-detector';

function MyComponent() {
  return (
    <ResponsiveRender
      mobile={<MobileView />}
      tablet={<TabletView />}
      desktop={<DesktopView />}
      fallback={<DefaultView />}
    />
  );
}
```

### Breakpoint Component
```tsx
import { Breakpoint } from './ui/mobile-detector';

function MyComponent() {
  return (
    <>
      <Breakpoint show={['mobile', 'tablet']}>
        <p>Only on mobile and tablet</p>
      </Breakpoint>
      
      <Breakpoint hide={['mobile']}>
        <p>Hidden on mobile</p>
      </Breakpoint>
    </>
  );
}
```

---

## 🎨 Mobile Layout Components

### MobileContainer
```tsx
import { MobileContainer } from './MobileLayout';

<MobileContainer>
  {/* Responsive padding: px-4 sm:px-6 lg:px-8 */}
  <YourContent />
</MobileContainer>
```

### MobileGrid
```tsx
import { MobileGrid } from './MobileLayout';

<MobileGrid 
  cols={{ mobile: 1, tablet: 2, desktop: 3 }}
  gap="md"
>
  <Card />
  <Card />
  <Card />
</MobileGrid>
```

### MobileCard
```tsx
import { MobileCard } from './MobileLayout';

<MobileCard padding="md">
  {/* Responsive padding: p-4 sm:p-5 lg:p-6 */}
  <CardContent />
</MobileCard>
```

### MobileStack
```tsx
import { MobileStack } from './MobileLayout';

<MobileStack spacing="md" direction="vertical">
  <Item1 />
  <Item2 />
  <Item3 />
</MobileStack>
```

---

## 🎯 Touch-Friendly Elements

### Minimum Button Size
```tsx
// ✅ Good - Touch friendly (44px minimum)
<Button className="min-h-[44px] px-4">
  Click Me
</Button>

// ❌ Bad - Too small for touch
<Button className="h-8 px-2">
  Click Me
</Button>
```

### Touch Target Wrapper
```tsx
import { MobileTouchTarget } from './MobileLayout';

<MobileTouchTarget>
  <Button size="sm">Small Button</Button>
</MobileTouchTarget>
```

### Icon Buttons
```tsx
// Ensure adequate size
<Button 
  size="icon" 
  className="min-w-[44px] min-h-[44px]"
>
  <Icon className="w-5 h-5" />
</Button>
```

---

## 📊 Common Layouts

### Dashboard Stats Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>
```

### Two-Column Content
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <LeftContent />
  <RightContent />
</div>
```

### Module Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
  {modules.map(module => (
    <ModuleCard key={module.id} module={module} />
  ))}
</div>
```

### Sidebar Layout
```tsx
<div className="flex flex-col lg:flex-row gap-6">
  <aside className="lg:w-64">
    <Sidebar />
  </aside>
  <main className="flex-1">
    <Content />
  </main>
</div>
```

---

## 📝 Form Responsiveness

### Responsive Form
```tsx
<form className="space-y-4 sm:space-y-5">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Input placeholder="First Name" />
    <Input placeholder="Last Name" />
  </div>
  
  <Input 
    placeholder="Email" 
    className="text-base" // Prevents zoom on iOS
  />
  
  <Button className="w-full sm:w-auto min-h-[44px]">
    Submit
  </Button>
</form>
```

### Prevent iOS Zoom
```tsx
// Set minimum 16px font size to prevent zoom
<Input 
  className="text-base" // 16px
  style={{ fontSize: '16px' }}
/>
```

---

## 🎬 Mobile Animations

### Disable Animations on Touch Devices
```tsx
import { useSupportsHover } from '../utils/responsiveUtils';

function MyComponent() {
  const supportsHover = useSupportsHover();
  
  return (
    <div className={supportsHover ? 'hover:scale-105 transition' : ''}>
      {/* Content */}
    </div>
  );
}
```

### Conditional Animation Classes
```css
/* Only animate on hover-capable devices */
@media (hover: hover) {
  .game-card {
    transition: transform 0.3s;
  }
  
  .game-card:hover {
    transform: translateY(-8px);
  }
}
```

---

## 📱 Mobile-Specific CSS Classes

### Available Classes
```tsx
// Grid
className="mobile-grid-1"          // Single column on mobile

// Padding
className="mobile-padding-sm"      // Reduced padding (1rem)

// Text
className="mobile-text-sm"         // Smaller text (0.875rem)

// Spacing
className="mobile-gap-4"           // Consistent gap (1rem)

// Visibility
className="mobile-hidden"          // Hidden on mobile

// Scroll
className="mobile-scroll"          // Scrollable with momentum

// Width
className="mobile-full"            // Full width

// Safe Areas
className="mobile-safe-bottom"     // Safe area bottom padding
className="mobile-safe-top"        // Safe area top padding
```

---

## 🔍 Debugging Mobile Issues

### Check Viewport
```tsx
import { useWindowSize } from '../utils/responsiveUtils';

function DebugInfo() {
  const { width, height } = useWindowSize();
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs">
      {width}x{height}
    </div>
  );
}
```

### Device Detection Debug
```tsx
import { useIsMobile, useIsTablet, useIsTouchDevice } from '../utils/responsiveUtils';

function DeviceDebug() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isTouch = useIsTouchDevice();
  
  return (
    <div className="fixed top-4 right-4 bg-primary text-white p-2 text-xs">
      Mobile: {isMobile ? '✓' : '✗'}<br />
      Tablet: {isTablet ? '✓' : '✗'}<br />
      Touch: {isTouch ? '✓' : '✗'}
    </div>
  );
}
```

---

## ⚡ Performance Tips

### Debounce Resize Events
```tsx
import { useDebouncedResize } from '../utils/responsiveUtils';

function MyComponent() {
  useDebouncedResize(() => {
    console.log('Window resized');
  }, 250);
  
  return <div>Content</div>;
}
```

### Reduce Motion
```tsx
import { usePrefersReducedMotion } from '../utils/responsiveUtils';

function MyComponent() {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div className={prefersReducedMotion ? '' : 'animate-bounce'}>
      {/* Content */}
    </div>
  );
}
```

---

## 🎨 Responsive Spacing

### Margin
```tsx
// Top margin
className="mt-4 sm:mt-6 lg:mt-8"

// Bottom margin
className="mb-4 sm:mb-6 lg:mb-8"

// Horizontal margin
className="mx-4 sm:mx-6 lg:mx-8"
```

### Gap
```tsx
// Flex gap
className="gap-3 sm:gap-4 lg:gap-6"

// Grid gap
className="gap-4 sm:gap-5 lg:gap-6"

// Vertical gap
className="gap-y-3 sm:gap-y-4 lg:gap-y-6"
```

---

## 📦 Helper Functions

### Get Grid Classes
```tsx
import { getMobileGridClasses } from '../utils/responsiveUtils';

const gridClass = getMobileGridClasses(3);
// Returns: "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

<div className={gridClass}>
  <Card />
  <Card />
  <Card />
</div>
```

### Get Card Padding
```tsx
import { getMobileCardPadding } from '../utils/responsiveUtils';

const paddingClass = getMobileCardPadding('md');
// Returns: "p-4 sm:p-5 lg:p-6"

<Card className={paddingClass}>
  <Content />
</Card>
```

### Get Text Classes
```tsx
import { getMobileTextClasses } from '../utils/responsiveUtils';

const textClass = getMobileTextClasses('heading');
// Returns: "text-lg sm:text-xl lg:text-2xl"

<h2 className={textClass}>Heading</h2>
```

### Get Button Size
```tsx
import { getMobileButtonSize } from '../utils/responsiveUtils';

const buttonClass = getMobileButtonSize('md');
// Returns: "min-h-[44px] px-4"

<Button className={buttonClass}>Click Me</Button>
```

---

## 🎯 Testing Checklist

### Quick Test Points
```
✓ Buttons minimum 44px height on mobile
✓ Text readable without zoom (min 14px)
✓ Grids stack to 1 column on mobile
✓ Forms have adequate spacing
✓ Modals fit within screen
✓ Scroll areas work smoothly
✓ Safe areas respected on iOS
✓ Address bar handled on Android
✓ Touch targets adequate spacing
✓ No horizontal scroll
```

---

## 🚀 Common Fixes

### Fix: Text too small on mobile
```tsx
// Before
<p className="text-sm">Text</p>

// After
<p className="text-sm sm:text-base">Text</p>
```

### Fix: Button too small for touch
```tsx
// Before
<Button className="h-8">Click</Button>

// After
<Button className="min-h-[44px]">Click</Button>
```

### Fix: Grid not stacking on mobile
```tsx
// Before
<div className="grid grid-cols-3 gap-4">

// After
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Fix: Too much padding on mobile
```tsx
// Before
<div className="p-8">

// After
<div className="p-4 sm:p-6 lg:p-8">
```

### Fix: Horizontal scroll on mobile
```tsx
// Add to container
className="overflow-x-hidden max-w-full"

// Or wrap table
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

---

## 📚 Resources

### Import Paths
```tsx
// Hooks
import { useIsMobile, useIsTablet, useIsTouchDevice } from '../utils/responsiveUtils';

// Components
import { MobileOnly, DesktopOnly, ResponsiveRender } from './ui/mobile-detector';
import { MobileContainer, MobileGrid, MobileCard } from './MobileLayout';

// Utilities
import { getMobileGridClasses, getMobileCardPadding } from '../utils/responsiveUtils';
```

### Key Files
- **CSS**: `/styles/globals.css`
- **Hooks**: `/utils/responsiveUtils.ts`
- **Components**: `/components/MobileLayout.tsx`
- **Detectors**: `/components/ui/mobile-detector.tsx`

---

## 💡 Pro Tips

1. **Always test on real devices** - Emulators don't always match real device behavior
2. **Start mobile-first** - Design for mobile, then enhance for desktop
3. **Use responsive prefixes** - sm:, md:, lg:, xl: for different breakpoints
4. **Touch targets** - 44px minimum for all interactive elements
5. **Input font sizes** - Minimum 16px on iOS to prevent zoom
6. **Safe areas** - Use mobile-safe-bottom/top for notched devices
7. **Performance** - Test on slower devices and 3G connections
8. **Orientation** - Test both portrait and landscape
9. **Gestures** - Support common mobile gestures (swipe, tap, scroll)
10. **Accessibility** - Ensure keyboard navigation works on mobile too

---

**Last Updated**: December 2, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
