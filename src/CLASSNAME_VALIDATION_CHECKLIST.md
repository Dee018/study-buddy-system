# className Validation Checklist

## Quick Validation Commands

Run these searches to identify potential className issues:

### 1. Check for className passed to cva functions
```bash
# Search pattern: variants({ ..., className })
grep -rn "Variants({ .*, className })" components/
```

**Expected:** No results  
**If found:** Separate className from variant generation

---

### 2. Check for dynamic Tailwind classes
```bash
# Search for template literals with Tailwind arbitrary values
grep -rn 'className={\`.*\[.*\${' components/
```

**Expected:** No results in Tailwind class contexts  
**If found:** Convert to inline styles or conditional logic

---

### 3. Check for undefined className handling
```bash
# Look for direct string concatenation without cn()
grep -rn 'className={\`[^}]*\${[^}]*}\`}' components/
```

**Review each case:** Ensure values can't be undefined

---

## Manual Review Checklist

### For Each Component with className:

#### Basic Checks:
- [ ] Does component import `cn` from utils?
- [ ] Is className prop optional (`className?`)?
- [ ] Are all className values strings or valid conditionals?
- [ ] Is cn() used for merging classes?

#### For cva-based Components:
- [ ] Is cva imported correctly?
- [ ] Are only variant props passed to cva function?
- [ ] Is className merged AFTER variant generation?
- [ ] Pattern: `cn(variants({ variant, size }), className)` ✅
- [ ] NOT: `cn(variants({ variant, size, className }))` ❌

#### For Dynamic Classes:
- [ ] Are dynamic colors using inline styles? ✅
- [ ] Are template literals avoided in Tailwind classes? ✅
- [ ] Are conditionals properly structured? `condition && "class"` ✅

---

## Component Testing Protocol

Test each modified component with:

```tsx
// Test 1: Undefined className
<Component />

// Test 2: Custom className
<Component className="custom-class" />

// Test 3: Multiple classes
<Component className="class1 class2 class3" />

// Test 4: Conditional className
<Component className={isActive ? "active" : "inactive"} />

// Test 5: With variants (if applicable)
<Component variant="primary" size="lg" className="custom" />
```

**Expected Result:** No console errors, all classes applied correctly

---

## Common Patterns Reference

### ✅ CORRECT

```tsx
// Pattern 1: Simple className merging
<div className={cn("base-class", className)} />

// Pattern 2: With cva variants
<div className={cn(variants({ variant, size }), className)} />

// Pattern 3: Conditional classes
<div className={cn(
  "base",
  isActive && "active",
  isDisabled && "disabled",
  className
)} />

// Pattern 4: Dynamic styles
<div
  className="base-class"
  style={{ backgroundColor: dynamicColor }}
/>
```

### ❌ INCORRECT

```tsx
// Pattern 1: className in cva (WRONG)
<div className={cn(variants({ variant, size, className }))} />

// Pattern 2: Dynamic Tailwind classes (WRONG)
<div className={`bg-[${color}] text-[${textColor}]`} />

// Pattern 3: Undefined concatenation (RISKY)
<div className={`base ${maybeUndefined} other`} />

// Pattern 4: Direct object/array (WRONG)
<div className={{ active: true }} />
<div className={["class1", "class2"]} /> // Use cn() instead
```

---

## Error Debugging Guide

### If you see "Unknown runtime error" from clsx:

1. **Open Browser DevTools Console**
   - Look for full error stack trace
   - Identify the component name

2. **Check the Component**
   - Search for className usage
   - Look for template literals: `` className={`...`} ``
   - Check cva function calls

3. **Common Fixes**
   - Remove className from cva parameters
   - Convert dynamic Tailwind classes to inline styles
   - Add conditional checks for undefined values
   - Wrap in cn() utility

4. **Test the Fix**
   - Reload application
   - Check console for errors
   - Test component with various props

---

## Pre-Commit Checklist

Before committing changes involving className:

- [ ] Ran grep searches (no issues found)
- [ ] Tested component with undefined className
- [ ] Tested component with custom className
- [ ] Verified no console errors
- [ ] Checked dark mode compatibility
- [ ] Reviewed template literals for dynamic values

---

## Quick Reference: cn() vs Template Literals

### When to use cn():
- ✅ Merging multiple class strings
- ✅ Conditional classes
- ✅ Component prop className
- ✅ Combining base classes with variants

### When to use template literals:
- ✅ String concatenation (non-className)
- ✅ Data attributes with values
- ❌ NEVER for dynamic Tailwind classes

### When to use inline styles:
- ✅ Dynamic colors
- ✅ Calculated dimensions
- ✅ Animation values from JS
- ✅ User-configurable styles

---

## Component Audit Frequency

- **New components:** Validate before first commit
- **Modified components:** Validate after className changes
- **Full audit:** Monthly or before major releases
- **After dependency updates:** Especially cva, clsx, tailwind

---

## Tools & Extensions (Recommended)

### VS Code Extensions:
1. **Tailwind CSS IntelliSense** - Autocomplete and validation
2. **Error Lens** - Inline error display
3. **ESLint** - Catch potential issues

### Browser Extensions:
1. **React DevTools** - Component inspection
2. **Console Ninja** - Enhanced console logging

---

## Contact & Support

If issues persist:
1. Check `/CLSX_ERROR_FIXES_AND_PREVENTION_GUIDE.md`
2. Review component against templates
3. Test in isolation
4. Check browser console for details

---

**Quick Check Status:**

Run this to verify current status:
```bash
echo "=== Checking for cva className issues ==="
grep -rn "Variants({ .*, className })" components/ || echo "✅ No issues found"

echo ""
echo "=== Checking for dynamic Tailwind classes ==="
grep -rn 'className={\`.*\[.*\${' components/ || echo "✅ No issues found"

echo ""
echo "✅ All checks complete"
```

---

**Last Updated:** November 8, 2025  
**Status:** ✅ Validation Tools Ready
