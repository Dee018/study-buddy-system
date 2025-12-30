# Runtime Execution Mode - Quick Reference

## 🎯 TL;DR

The Java Study Buddy now executes Java code **exactly like a real IDE**, not as static text parsing.

## ✅ What Changed

| Before | After |
|--------|-------|
| All `System.out.print()` rendered | Only executed lines print |
| All `if/else` branches rendered | Only ONE branch executes |
| Scanner ignored | Scanner HALTS execution |
| Static parsing | Runtime execution with instruction pointer |

## 🔒 5 Core Rules (Always True)

1. **Runtime Only** - Print statements only output when executed
2. **Instruction Pointer** - Code runs line-by-line in order
3. **Scanner Barrier** - Execution HALTS at `input.nextInt()` etc.
4. **Exclusive Branches** - Only ONE `if/else if/else` branch runs
5. **Output = Side Effect** - If line not executed → no output

## 📝 Creating Scanner Exercises

```typescript
{
  id: 'my-exercise',
  title: 'Age Checker',
  testInputs: [16], // ← Add test inputs for auto-grader
  expectedOutput: `Enter your age: 16
You are a Teen!` // ← Include input echo
}
```

## 🎨 UI Indicator

When Scanner detected, badge automatically appears:

```
🟢 Runtime Execution Mode
This program runs exactly like a real Java IDE console.
```

## ✅ Example Verification

**Code:**
```java
if (age <= 19) {
    System.out.println("Teen");
} else {
    System.out.println("Adult");
}
```

**Input:** `age = 16`

**Output:**
```
Teen
```

**NOT:**
```
Teen
Adult
```

## 🚫 What You Can't Do Anymore

- ❌ Pre-scan for print statements
- ❌ Execute all branches
- ❌ Skip Scanner input
- ❌ Parse code as text

## 📂 Key Files

- **Simulator:** `/utils/enhancedJavaSimulator.ts`
- **UI:** `/components/ExerciseViewer.tsx`
- **Docs:** `/RUNTIME_EXECUTION_MODE_COMPLETE.md`

## 🔍 Debug Checklist

If output doesn't match expected:

1. ✅ Check if Scanner detected (badge shows?)
2. ✅ Verify `testInputs` array matches Scanner calls
3. ✅ Ensure expected output includes input echo
4. ✅ Check only ONE conditional branch should execute
5. ✅ Verify output is from executed lines only

## 🎯 Quick Test

**Test Code:**
```java
Scanner input = new Scanner(System.in);
System.out.print("Enter number: ");
int n = input.nextInt();
if (n > 10) {
    System.out.println("Big");
} else {
    System.out.println("Small");
}
```

**Test Input:** `[15]`

**Expected Output:**
```
Enter number: 15
Big
```

**Verification:**
- ✅ Prompt appears first
- ✅ Input echoed (15)
- ✅ Only "Big" prints (not both)

---

**Status:** ✅ Production Ready  
**Last Updated:** December 16, 2025
