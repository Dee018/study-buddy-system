# Runtime Execution Mode - Visual Flow Diagram

## 🎯 Execution Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     JAVA CODE INPUT                             │
│  import java.util.Scanner;                                      │
│  Scanner input = new Scanner(System.in);                        │
│  System.out.print("Enter age: ");                               │
│  int age = input.nextInt();                                     │
│  if (age <= 19) { System.out.println("Teen"); }                 │
│  else { System.out.println("Adult"); }                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SCANNER DETECTION                             │
│                                                                 │
│  ✓ Patterns Matched:                                           │
│    • import java.util.Scanner                                  │
│    • new Scanner(System.in)                                    │
│    • input.nextInt()                                           │
│                                                                 │
│  → isInteractiveMode = TRUE                                    │
│  → Runtime Execution Mode ACTIVATED                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│               RUNTIME EXECUTION ENGINE                          │
│                                                                 │
│  Instruction Pointer: currentLineIndex = 0                     │
│  Output Buffer: output = []                                    │
│  Variables: variables = {}                                     │
│  Test Inputs: testInputs = [16]                                │
│  Input Index: inputIndex = 0                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                LINE-BY-LINE EXECUTION                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
        ┌──────────────────────────────────────┐
        │  Line 1: Scanner Declaration          │
        │  currentLineIndex = 0                 │
        │                                       │
        │  Action: Create Scanner object        │
        │  Output: (none)                       │
        │  Variables: { }                       │
        └──────────────────────────────────────┘
                            ↓
                            ↓
        ┌──────────────────────────────────────┐
        │  Line 2: System.out.print()          │
        │  currentLineIndex = 1                 │
        │                                       │
        │  Action: ✅ EXECUTE PRINT             │
        │  Output: ["Enter age: "]             │
        │  Variables: { }                       │
        └──────────────────────────────────────┘
                            ↓
                            ↓
        ┌──────────────────────────────────────┐
        │  Line 3: int age = input.nextInt()   │
        │  currentLineIndex = 2                 │
        │                                       │
        │  🛑 SCANNER BARRIER DETECTED!         │
        │                                       │
        │  Action:                              │
        │   1. HALT EXECUTION                   │
        │   2. Inject testInputs[0] = 16        │
        │   3. Echo to output: "16\n"           │
        │   4. Set age = 16                     │
        │   5. RESUME EXECUTION                 │
        │                                       │
        │  Output: ["Enter age: ", "16\n"]     │
        │  Variables: { age: 16 }               │
        └──────────────────────────────────────┘
                            ↓
                            ↓
        ┌──────────────────────────────────────┐
        │  Line 4: if (age <= 19)              │
        │  currentLineIndex = 3                 │
        │                                       │
        │  Condition: 16 <= 19                  │
        │  Result: ✅ TRUE                      │
        │                                       │
        │  Action: EXECUTE IF BLOCK             │
        └──────────────────────────────────────┘
                            ↓
                            ↓
        ┌──────────────────────────────────────┐
        │  Line 5: System.out.println("Teen")  │
        │  currentLineIndex = 4                 │
        │                                       │
        │  Action: ✅ EXECUTE PRINT             │
        │  Output: ["Enter age: ", "16\n",     │
        │           "Teen\n"]                   │
        │                                       │
        │  🔄 RETURN FROM IF BLOCK              │
        │  → Skip ALL remaining branches        │
        └──────────────────────────────────────┘
                            ↓
                            ↓
        ┌──────────────────────────────────────┐
        │  Line 6: else { ... }                │
        │  currentLineIndex = 5                 │
        │                                       │
        │  ❌ SKIPPED (if block already exec)   │
        │  Action: NO EXECUTION                 │
        │  Output: ["Enter age: ", "16\n",     │
        │           "Teen\n"]                   │
        └──────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FINAL OUTPUT                                 │
│                                                                 │
│  output.join('') =                                             │
│  "Enter age: 16\nTeen\n"                                       │
│                                                                 │
│  Formatted:                                                    │
│  ┌───────────────────────────────────────┐                    │
│  │ Enter age: 16                          │                    │
│  │ Teen                                   │                    │
│  └───────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   VALIDATION                                    │
│                                                                 │
│  Expected Output: "Enter age: 16\nTeen\n"                      │
│  Actual Output:   "Enter age: 16\nTeen\n"                      │
│                                                                 │
│  ✅ EXACT MATCH                                                 │
│  → isCorrect = true                                            │
│  → feedback = "Perfect! Your code produces the exact output!"  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Critical Execution Points

### 1. Scanner Barrier (Line 3)

```
BEFORE Scanner Call:
┌──────────────────────────┐
│ Instruction Pointer: 2   │
│ Output: ["Enter age: "]  │
│ Variables: {}            │
│ Status: RUNNING          │
└──────────────────────────┘

SCANNER DETECTED - HALT!
┌──────────────────────────┐
│ Status: 🛑 BLOCKED        │
│ Waiting for input...     │
│                          │
│ testInputs[0] = 16       │
│ → Inject value           │
│ → Echo to output         │
└──────────────────────────┘

AFTER Input Received:
┌──────────────────────────┐
│ Instruction Pointer: 2   │
│ Output: ["Enter age: ",  │
│         "16\n"]          │
│ Variables: {age: 16}     │
│ Status: ▶️ RESUMED        │
└──────────────────────────┘
```

### 2. Exclusive Conditional Execution (Line 4-6)

```
IF BRANCH (age <= 19):
┌──────────────────────────────────────┐
│ Condition: 16 <= 19                  │
│ Result: ✅ TRUE                       │
│ Action: EXECUTE BLOCK                 │
│                                      │
│ ┌──────────────────────────────────┐│
│ │ System.out.println("Teen");      ││
│ │ → Output: "Teen\n"               ││
│ └──────────────────────────────────┘│
│                                      │
│ 🔄 RETURN IMMEDIATELY                │
│ → Skip ALL remaining branches        │
└──────────────────────────────────────┘
                ↓
                ↓ (early return)
                ↓
┌──────────────────────────────────────┐
│ ELSE BRANCH:                         │
│                                      │
│ ❌ NOT REACHED                        │
│ ❌ NOT EVALUATED                      │
│ ❌ NO EXECUTION                       │
│ ❌ NO OUTPUT                          │
│                                      │
│ Result: SKIPPED ENTIRELY             │
└──────────────────────────────────────┘
```

---

## 🎨 State Transitions

```
┌─────────────┐
│   START     │
│             │
│ Variables:  │
│   (empty)   │
│ Output: []  │
└─────────────┘
       ↓
       ↓ Line 1: Scanner declaration
       ↓
┌─────────────┐
│  SCANNER    │
│  CREATED    │
│             │
│ Variables:  │
│   (empty)   │
│ Output: []  │
└─────────────┘
       ↓
       ↓ Line 2: Print prompt
       ↓
┌─────────────────────────┐
│  PROMPT DISPLAYED       │
│                         │
│ Variables:              │
│   (empty)               │
│ Output: ["Enter age: "] │
└─────────────────────────┘
       ↓
       ↓ Line 3: Scanner input
       ↓
┌─────────────────────────┐
│  🛑 BLOCKED ON INPUT    │
│                         │
│ Waiting for:            │
│   testInputs[0]         │
│                         │
│ Status: HALTED          │
└─────────────────────────┘
       ↓
       ↓ Input received: 16
       ↓
┌─────────────────────────────┐
│  INPUT RECEIVED & ECHOED    │
│                             │
│ Variables:                  │
│   { age: 16 }               │
│ Output: ["Enter age: ",     │
│          "16\n"]            │
│                             │
│ Status: ▶️ RESUMED          │
└─────────────────────────────┘
       ↓
       ↓ Line 4: Evaluate if
       ↓
┌─────────────────────────────┐
│  CONDITION EVALUATED        │
│                             │
│ if (age <= 19)              │
│ → 16 <= 19 = TRUE           │
│                             │
│ Decision: EXECUTE IF BLOCK  │
└─────────────────────────────┘
       ↓
       ↓ Line 5: Execute if body
       ↓
┌─────────────────────────────┐
│  IF BLOCK EXECUTED          │
│                             │
│ Variables:                  │
│   { age: 16 }               │
│ Output: ["Enter age: ",     │
│          "16\n",            │
│          "Teen\n"]          │
│                             │
│ Action: RETURN (skip else)  │
└─────────────────────────────┘
       ↓
       ↓ Skip else branch
       ↓
┌─────────────────────────────┐
│  EXECUTION COMPLETE         │
│                             │
│ Final Output:               │
│   "Enter age: 16\nTeen\n"   │
│                             │
│ Status: ✅ SUCCESS           │
└─────────────────────────────┘
```

---

## 🚫 What Does NOT Happen (Anti-Patterns)

### ❌ WRONG: Static Parsing
```
┌─────────────────────────────────────┐
│  ❌ Pre-scan all print statements    │
│                                     │
│  Found:                             │
│    System.out.print("Enter age: ")  │
│    System.out.println("Teen");      │
│    System.out.println("Adult");     │ ← NOT EXECUTED!
│                                     │
│  Output ALL found statements:       │
│    Enter age:                       │
│    Teen                             │
│    Adult                            │ ← INCORRECT!
│                                     │
│  Result: ❌ WRONG BEHAVIOR           │
└─────────────────────────────────────┘
```

### ❌ WRONG: Multiple Branch Execution
```
┌─────────────────────────────────────┐
│  ❌ Execute all branches             │
│                                     │
│  if (age <= 19) {                   │
│    print("Teen")   ✓ Executed       │
│  }                                  │
│  else {                             │
│    print("Adult")  ✓ Executed?      │ ← WRONG!
│  }                                  │
│                                     │
│  Output:                            │
│    Teen                             │
│    Adult                            │ ← INCORRECT!
│                                     │
│  Result: ❌ BOTH BRANCHES EXECUTED   │
└─────────────────────────────────────┘
```

### ✅ CORRECT: Exclusive Execution
```
┌─────────────────────────────────────┐
│  ✅ Execute only matching branch     │
│                                     │
│  if (age <= 19) {                   │
│    print("Teen")   ✓ Executed       │
│    RETURN          ← Exit function  │
│  }                                  │
│  else {                             │
│    print("Adult")  ✗ Skipped        │ ← Correct!
│  }                                  │
│                                     │
│  Output:                            │
│    Teen                             │ ← Only this!
│                                     │
│  Result: ✅ ONLY ONE BRANCH EXECUTED │
└─────────────────────────────────────┘
```

---

## 📊 Comparison: Before vs After

### BEFORE Runtime Execution Mode

```
┌─────────────────────────────────────┐
│  Student Code:                      │
│  if (age <= 19) {                   │
│    System.out.println("Teen");      │
│  } else {                           │
│    System.out.println("Adult");     │
│  }                                  │
├─────────────────────────────────────┤
│  System Output:                     │
│  Teen                               │
│  Adult                              │ ← BOTH printed!
│                                     │
│  Status: ❌ INCORRECT                │
│  Issue: Static parsing              │
└─────────────────────────────────────┘
```

### AFTER Runtime Execution Mode

```
┌─────────────────────────────────────┐
│  Student Code:                      │
│  if (age <= 19) {                   │
│    System.out.println("Teen");      │
│  } else {                           │
│    System.out.println("Adult");     │
│  }                                  │
├─────────────────────────────────────┤
│  System Output:                     │
│  Teen                               │ ← Only Teen!
│                                     │
│  Status: ✅ CORRECT                  │
│  Issue: Runtime execution           │
└─────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

1. **Instruction Pointer** - Tracks current execution position
2. **Scanner Barrier** - Execution halts until input received
3. **Exclusive Branches** - Only ONE conditional branch executes
4. **Runtime Output** - Generated ONLY by executed statements
5. **Early Returns** - Prevent multiple branch execution

**Result:** Execution matches NetBeans IDE behavior exactly. ✅

---

**Last Updated:** December 16, 2025  
**Status:** Production Ready  
**Visual Guide Version:** 1.0
