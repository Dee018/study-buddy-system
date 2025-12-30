# className Quick Reference Card

## 🚀 The 4 Golden Rules

### 1. ❌ Never Pass className to cva Functions
```tsx
// WRONG ❌
className={cn(buttonVariants({ variant, size, className }))}

// CORRECT ✅
className={cn(buttonVariants({ variant, size }), className)}
```

### 2. ❌ Never Use Dynamic Tailwind Classes
```tsx
// WRONG ❌
className={`bg-[${color}] text-[${textColor}]`}

// CORRECT ✅
style={{ backgroundColor: color, color: textColor }}
```

### 3. ✅ Always Use cn() for Merging
```tsx
// WRONG ❌
className={`base ${condition ? "active" : ""} ${className}`}

// CORRECT ✅
className={cn("base", condition && "active", className)}
```

### 4. ✅ Handle Undefined Gracefully
```tsx
// WRONG ❌
className={`base ${maybeUndefined} other`}
// Results in: "base undefined other"

// CORRECT ✅
className={cn("base", maybeUndefined, "other")}
// cn() filters out undefined automatically
```

---

## 🎯 Common Patterns

### Component with Variants (cva)
```tsx
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { cn } from "./utils";

const variants = cva("base-class", {
  variants: {
    variant: { default: "...", primary: "..." },
    size: { sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "sm" },
});

function Component({ className, variant, size, ...props }) {
  return (
    <div
      className={cn(variants({ variant, size }), className)}
      //           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //           CORRECT: className separate from variants
      {...props}
    />
  );
}
```

### Simple Component (no cva)
```tsx
import { cn } from "./utils";

function Component({ className, ...props }) {
  return (
    <div
      className={cn(
        "base-class more-classes",
        className
      )}
      {...props}
    />
  );
}
```

### Conditional Classes
```tsx
<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class",
  variant === "primary" && "primary-class",
  className
)} />
```

### Dynamic Values
```tsx
// For truly dynamic values, use inline styles
<div
  className="static-classes"
  style={{
    backgroundColor: dynamicColor,
    color: dynamicTextColor,
    width: `${dynamicWidth}px`,
  }}
/>
```

---

## 🔍 Quick Validation

### Run These Commands:
```bash
# Check for className in cva
grep -rn "Variants({ .*, className })" components/

# Check for dynamic Tailwind classes
grep -rn 'className={\`.*\[.*\${' components/
```

**Expected:** No results ✅

---

## 🐛 Debugging "Unknown runtime error"

1. **Check browser console** - See full stack trace
2. **Find the component** - Error shows component name
3. **Look for these patterns:**
   - `variants({ ..., className })` ❌
   - `` className={`text-[${var}]`} `` ❌
   - `className={undefined}` ❌
4. **Apply the fixes from above** ✅
5. **Test with undefined props** ✅

---

## 📝 Component Template

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority@0.7.1";
import { cn } from "./utils";

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "classes",
        other: "classes",
      },
      size: {
        sm: "classes",
        lg: "classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

function Component({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof componentVariants>) {
  return (
    <div
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Component, componentVariants };
```

---

## ✅ Pre-Commit Checklist

- [ ] No `className` in cva function calls
- [ ] No dynamic Tailwind classes with template literals
- [ ] All className merging uses `cn()`
- [ ] Tested component with `undefined` className
- [ ] No console errors

---

## 🎯 cn() Utility Behavior

```tsx
import { cn } from "./utils";

cn("px-4 py-2", "bg-blue-500")
// → "px-4 py-2 bg-blue-500"

cn("base", true && "active")
// → "base active"

cn("base", false && "active")
// → "base"

cn("base", undefined, "other")
// → "base other" (undefined filtered out)

cn("px-4", "px-6")
// → "px-6" (last wins - Tailwind conflict resolution)

cn({ active: true, disabled: false })
// → "active"

cn(["base", "other"])
// → "base other"
```

---

## 🚨 Red Flags to Watch For

### In Code Reviews:
- `variants({ ..., className })` 🚨
- `` className={`...-[${var}]`} `` 🚨  
- `` `${base} ${className}` `` ⚠️
- `className={undefined}` ⚠️
- Direct object in className 🚨

### In Console:
- "Unknown runtime error" from clsx 🚨
- "className of undefined" 🚨
- Styling not applying ⚠️

---

## 📚 See Also

- Full Guide: `/CLSX_ERROR_FIXES_AND_PREVENTION_GUIDE.md`
- Validation: `/CLASSNAME_VALIDATION_CHECKLIST.md`
- Summary: `/COMPREHENSIVE_CLSX_FIX_SUMMARY.md`

---

**Print this and keep it handy! 📄**

Last Updated: November 8, 2025
