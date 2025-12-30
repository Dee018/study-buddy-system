# Project Validation System - Developer Guide

## Quick Start

### Understanding the System
The Project Validation System validates Java projects through 4 layers:
1. **Syntax** - Code structure (braces, semicolons, etc.)
2. **Runtime** - Potential runtime errors (imports, null checks, etc.)
3. **Requirements** - Project-specific requirements
4. **Features** - Expected functionality

### Core Files
```
/utils/projectValidation.ts         - Validation engine
/components/ProjectViewer.tsx       - UI with validation
```

---

## Adding New Validation Rules

### 1. Add a Syntax Rule

**Location:** `/utils/projectValidation.ts` → `validateSyntax()`

**Example:** Check for missing return statements
```typescript
function validateSyntax(code: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // ... existing checks ...
  
  // NEW: Check for methods missing return statements
  const methodsWithReturnType = code.match(/(?:public|private)\s+(?!void)\w+\s+\w+\s*\([^)]*\)/g);
  if (methodsWithReturnType) {
    methodsWithReturnType.forEach(method => {
      const methodBody = extractMethodBody(code, method);
      if (methodBody && !/return\s+/.test(methodBody)) {
        errors.push({
          type: 'syntax',
          message: 'Missing return statement',
          detail: `Method ${method} must return a value.`
        });
      }
    });
  }
  
  return errors;
}
```

---

### 2. Add a Runtime Check

**Location:** `/utils/projectValidation.ts` → `detectRuntimeErrors()`

**Example:** Check for integer overflow
```typescript
function detectRuntimeErrors(code: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // ... existing checks ...
  
  // NEW: Check for potential integer overflow
  const largeNumbers = code.match(/int\s+\w+\s*=\s*(\d{10,})/g);
  if (largeNumbers && largeNumbers.length > 0) {
    errors.push({
      type: 'runtime',
      message: 'Potential integer overflow',
      detail: 'Large number literal exceeds int range. Consider using long instead.'
    });
  }
  
  return errors;
}
```

---

### 3. Add a Requirement Pattern

**Location:** `/utils/projectValidation.ts` → `validateRequirements()`

**Example:** Validate constructor requirement
```typescript
function validateRequirements(code: string, requirements: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  requirements.forEach((requirement, index) => {
    const requirementLower = requirement.toLowerCase();
    
    // ... existing patterns ...
    
    // NEW: Constructor requirements
    if (requirementLower.includes('constructor')) {
      const className = extractClassName(requirement);
      if (className) {
        const hasConstructor = new RegExp(
          `(?:public|private)\\s+${className}\\s*\\(`,
          'i'
        ).test(code);
        
        if (!hasConstructor) {
          errors.push({
            type: 'requirement',
            message: `Requirement ${index + 1} not met: ${requirement}`,
            detail: `Constructor for class ${className} not found.`
          });
        }
      }
    }
  });

  return errors;
}
```

---

### 4. Add a Feature Detection

**Location:** `/utils/projectValidation.ts` → `validateExpectedFeatures()`

**Example:** Validate file reading feature
```typescript
function validateExpectedFeatures(code: string, expectedFeatures: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  expectedFeatures.forEach((feature, index) => {
    const featureLower = feature.toLowerCase();
    
    // ... existing patterns ...
    
    // NEW: File reading feature
    if (featureLower.includes('read') && featureLower.includes('file')) {
      const hasFileReader = /FileReader|BufferedReader|Scanner.*new.*File/.test(code);
      const hasTryCatch = /try\s*{/.test(code) && /catch\s*\(/.test(code);
      
      const isMet = hasFileReader && hasTryCatch;
      if (!isMet) {
        errors.push({
          type: 'feature',
          message: `Feature ${index + 1} not implemented: ${feature}`,
          detail: 'File reading requires FileReader/BufferedReader and try-catch for exception handling.'
        });
      }
    }
  });

  return errors;
}
```

---

## Modifying Validation Thresholds

### Adjustable Constants

**Location:** `/utils/projectValidation.ts` → `performBasicChecks()`

```typescript
// Current defaults
const MIN_MEANINGFUL_LINES = 10;  // Minimum code lines
const MAX_SUSPICIOUS_LINES = 3;    // Max lines without semicolons

// Adjust as needed
const MIN_MEANINGFUL_LINES = 15;  // More strict
const MAX_SUSPICIOUS_LINES = 5;   // More lenient
```

### Keyword Match Thresholds

**Location:** `/utils/projectValidation.ts` → `validateRequirements()` and `validateExpectedFeatures()`

```typescript
// Current defaults
const requiredMatchPercentage = 0.5;  // 50% of keywords
const featureMatchPercentage = 0.4;   // 40% of keywords

// Adjust matching strictness
isMet = matchedTerms.length >= Math.ceil(keyTerms.length * 0.7);  // 70% required
```

---

## Customizing Error Messages

### Error Message Template

```typescript
errors.push({
  type: 'syntax' | 'runtime' | 'requirement' | 'feature',
  message: 'Brief description of error',  // Shows in error title
  detail: 'Detailed explanation with fix'  // Shows in error detail
});
```

### Best Practices for Error Messages

1. **Be Specific**
   ```typescript
   // ❌ Bad
   detail: 'Something is wrong with your code.'
   
   // ✅ Good
   detail: 'Class "StudentInfo" not found. Create a class with this exact name.'
   ```

2. **Provide Solutions**
   ```typescript
   // ❌ Bad
   detail: 'Missing import.'
   
   // ✅ Good
   detail: 'You are using Scanner but haven\'t imported it. Add: import java.util.Scanner;'
   ```

3. **Include Context**
   ```typescript
   // ❌ Bad
   detail: 'Need more variables.'
   
   // ✅ Good
   detail: 'Found 5 variable(s), but 8 required. Add 3 more variables with different data types.'
   ```

---

## Adding Helper Functions

### Pattern Extractors

```typescript
// Extract numbers from text
function extractNumber(text: string): number | null {
  const match = text.match(/(\d+)\+?/);
  return match ? parseInt(match[1]) : null;
}

// Extract class name
function extractClassName(text: string): string | null {
  const match = text.match(/class\s+([A-Z]\w+)/i);
  return match ? match[1] : null;
}

// NEW: Extract method signature
function extractMethodSignature(text: string): string | null {
  const match = text.match(/(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\([^)]*\)/);
  return match ? match[1] : null;
}
```

---

## UI Customization

### Adding New Error Type

**1. Define Type**
```typescript
// In projectValidation.ts
export interface ValidationError {
  type: 'syntax' | 'runtime' | 'requirement' | 'feature' | 'style';  // Added 'style'
  message: string;
  detail?: string;
}
```

**2. Add to Error Display**
```typescript
// In ProjectViewer.tsx
{(['syntax', 'runtime', 'requirement', 'feature', 'style'] as const).map(errorType => {
  // ... existing code ...
  
  const getTypeInfo = () => {
    switch (errorType) {
      // ... existing cases ...
      case 'style':
        return { title: 'Style Issues', icon: '🎨', description: 'Code style improvements needed' };
    }
  };
})}
```

---

### Customizing Submit Button Text

**Location:** `/components/ProjectViewer.tsx` → Submit Section

```typescript
<Button 
  size="lg" 
  onClick={handleSubmit} 
  disabled={isSubmitting || (showValidation && validationErrors.length > 0)}
>
  {isSubmitting ? (
    <>
      <Spinner />
      Checking Code...  {/* Custom text */}
    </>
  ) : showValidation && validationErrors.length > 0 ? (
    <>
      <XCircle className="w-4 h-4 mr-2" />
      Resolve Issues  {/* Custom text */}
    </>
  ) : (
    <>
      <Play className="w-4 h-4 mr-2" />
      Submit My Project  {/* Custom text */}
    </>
  )}
</Button>
```

---

### Changing Error Card Colors

**Location:** `/components/ProjectViewer.tsx` → Error Display

```typescript
const getTypeColor = (type: string) => {
  switch (type) {
    case 'syntax':
      return 'border-orange-500/50';  // Orange for syntax
    case 'runtime':
      return 'border-red-500/50';     // Red for runtime
    case 'requirement':
      return 'border-yellow-500/50';  // Yellow for requirements
    case 'feature':
      return 'border-blue-500/50';    // Blue for features
    default:
      return 'border-destructive/50';
  }
};

<Card className={getTypeColor(errorType)}>
  {/* Error content */}
</Card>
```

---

## Performance Optimization

### Caching Validation Results

```typescript
// In ProjectViewer.tsx
const validationCache = useRef<Map<string, ValidationResult>>(new Map());

const getCachedValidation = (code: string) => {
  const cacheKey = code.slice(0, 100); // Use first 100 chars as key
  if (validationCache.current.has(cacheKey)) {
    return validationCache.current.get(cacheKey)!;
  }
  
  const result = validateProject(code, starterCode, requirements, features);
  validationCache.current.set(cacheKey, result);
  return result;
};
```

### Debouncing Real-Time Validation

```typescript
import { debounce } from 'lodash';

// In ProjectViewer.tsx
const debouncedValidation = useMemo(
  () => debounce((code: string) => {
    const validation = validateProject(code, starterCode, requirements, features);
    setValidationErrors(validation.errors);
  }, 300),
  [starterCode, requirements, features]
);

useEffect(() => {
  if (showValidation && userCode.trim()) {
    debouncedValidation(userCode);
  }
}, [userCode, showValidation, debouncedValidation]);
```

---

## Testing Your Changes

### Unit Test Template

```typescript
// In projectValidation.test.ts
import { validateProject } from '../utils/projectValidation';

describe('Project Validation', () => {
  describe('Syntax Validation', () => {
    it('should detect missing return statement', () => {
      const code = `
        public class Test {
          public int getValue() {
            // Missing return
          }
        }
      `;
      
      const result = validateProject(code, '', [], []);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'syntax',
          message: expect.stringContaining('return')
        })
      );
    });
  });
});
```

### Manual Testing Checklist

```markdown
## Test New Validation Rule

- [ ] Create test code that should fail
- [ ] Verify error is detected
- [ ] Check error message is clear
- [ ] Create test code that should pass
- [ ] Verify no false positive
- [ ] Test edge cases
- [ ] Document the new rule
```

---

## Debugging Tips

### Enable Validation Logging

```typescript
// In projectValidation.ts
export function validateProject(
  code: string,
  starterCode: string,
  requirements: string[],
  expectedFeatures: string[]
): ValidationResult {
  const errors: ValidationError[] = [];

  console.log('🔍 Starting validation...');
  console.log('📝 Code length:', code.length);
  console.log('📋 Requirements:', requirements.length);
  console.log('⭐ Features:', expectedFeatures.length);

  const basicChecks = performBasicChecks(code, starterCode);
  console.log('✅ Basic checks:', basicChecks.length, 'errors');
  errors.push(...basicChecks);

  // ... rest of validation ...

  console.log('🎯 Total errors:', errors.length);
  return { isValid: errors.length === 0, errors };
}
```

### Inspect Validation in Browser

```typescript
// In ProjectViewer.tsx
const handleSubmit = () => {
  const validation = validateProject(/* ... */);
  
  // Debug output
  console.group('🔍 Validation Results');
  console.log('Valid:', validation.isValid);
  console.log('Errors:', validation.errors);
  console.table(validation.errors);
  console.groupEnd();
  
  setValidationErrors(validation.errors);
  // ... rest of code ...
};
```

---

## Common Patterns

### Checking for Specific Java Constructs

```typescript
// Has try-catch block
const hasTryCatch = /try\s*{/.test(code) && /catch\s*\(/.test(code);

// Has for loop
const hasForLoop = /for\s*\(/.test(code);

// Has while loop
const hasWhileLoop = /while\s*\(/.test(code);

// Has switch statement
const hasSwitch = /switch\s*\(/.test(code);

// Has array declaration
const hasArray = /\[\s*\]/.test(code) || /new\s+\w+\[/.test(code);

// Has ArrayList
const hasArrayList = /ArrayList\s*</.test(code) || /new\s+ArrayList/.test(code);

// Has method with specific name
const hasMethod = (methodName: string) => 
  new RegExp(`\\w+\\s+${methodName}\\s*\\(`).test(code);

// Has import statement
const hasImport = (className: string) =>
  new RegExp(`import\\s+[\\w.]+\\.${className}`).test(code);
```

### Extracting Code Sections

```typescript
// Remove comments
const codeWithoutComments = code
  .replace(/\/\/.*$/gm, '')
  .replace(/\/\*[\s\S]*?\*\//g, '');

// Remove string literals
const codeWithoutStrings = code
  .replace(/"(?:\\.|[^"\\])*"/g, '');

// Get method body
function extractMethodBody(code: string, methodName: string): string | null {
  const methodRegex = new RegExp(
    `\\w+\\s+${methodName}\\s*\\([^)]*\\)\\s*{([\\s\\S]*?)^\\s*}`,
    'm'
  );
  const match = code.match(methodRegex);
  return match ? match[1] : null;
}

// Count occurrences
const countOccurrences = (code: string, pattern: RegExp): number => {
  const matches = code.match(pattern);
  return matches ? matches.length : 0;
};
```

---

## Best Practices

### 1. Make Errors Actionable
Every error should tell the student exactly what to do:
```typescript
// ✅ Good
detail: 'Add: import java.util.Scanner; at the top of your file'

// ❌ Bad
detail: 'Missing import'
```

### 2. Avoid False Positives
Better to miss an error than incorrectly flag correct code:
```typescript
// Use multiple conditions
const isMet = hasRequiredPattern && hasAlternativePattern;

// Check for common valid alternatives
if (!standardApproach && !alternativeApproach && !libraryMethod) {
  errors.push({...});
}
```

### 3. Keep Regex Patterns Simple
Complex regex is hard to maintain:
```typescript
// ✅ Good - Simple and clear
const hasForLoop = /for\s*\(/.test(code);

// ❌ Bad - Too complex
const hasForLoop = /(?:for)\s*\(\s*(?:int|long|double|float)\s+\w+\s*=\s*\d+\s*;\s*\w+\s*[<>]=?\s*\d+\s*;\s*\w+\s*(?:\+\+|--|\+=\s*\d+)\s*\)/.test(code);
```

### 4. Provide Context
Include relevant information in error details:
```typescript
errors.push({
  type: 'requirement',
  message: `Requirement ${index + 1} not met: ${requirement}`,
  detail: `Found ${actualCount}, but ${requiredCount} required.`
});
```

### 5. Test Edge Cases
Always test unusual but valid code:
```typescript
// Test with:
// - Nested structures
// - Alternative syntax
// - Extra whitespace
// - Comments in unusual places
// - Multiple valid approaches
```

---

## Integration with Other Systems

### ProgressManager Integration

```typescript
// Save validation results with submission
const handleSubmit = () => {
  const validation = validateProject(/* ... */);
  
  if (validation.isValid) {
    ProgressManager.recordProjectCompletion(
      userId,
      moduleId,
      projectId,
      userCode,
      {
        validationPassed: true,
        errorCount: 0,
        validationTimestamp: Date.now()
      }
    );
  }
};
```

### Analytics Integration

```typescript
// Track validation metrics
const trackValidationMetrics = (validation: ValidationResult) => {
  analytics.track('project_validation', {
    isValid: validation.isValid,
    errorCount: validation.errors.length,
    errorTypes: validation.errors.map(e => e.type),
    syntaxErrors: validation.errors.filter(e => e.type === 'syntax').length,
    runtimeErrors: validation.errors.filter(e => e.type === 'runtime').length,
    requirementErrors: validation.errors.filter(e => e.type === 'requirement').length,
    featureErrors: validation.errors.filter(e => e.type === 'feature').length
  });
};
```

---

## Version History

### v1.0.0 - Initial Release
- Multi-layer validation system
- Syntax, runtime, requirement, and feature validation
- Comprehensive error messages
- Real-time validation updates
- Icon alignment improvements

### Future Versions
- v1.1.0 - Code quality metrics
- v1.2.0 - Style guide validation
- v1.3.0 - AI-powered validation
- v2.0.0 - Partial credit system

---

## FAQ for Developers

**Q: How do I disable validation for testing?**
```typescript
// In ProjectViewer.tsx
const ENABLE_VALIDATION = false; // Set to false

const handleSubmit = () => {
  if (ENABLE_VALIDATION) {
    const validation = validateProject(/* ... */);
    // ... validation logic
  } else {
    onSubmit(userCode);
  }
};
```

**Q: How do I add a new error type?**
1. Update `ValidationError` interface type union
2. Add case in `getTypeInfo()` function
3. Add validation logic in appropriate function
4. Update documentation

**Q: How do I make validation less strict?**
Adjust thresholds and reduce pattern matching requirements:
```typescript
const MIN_MEANINGFUL_LINES = 5;  // Was 10
const KEYWORD_MATCH_THRESHOLD = 0.3;  // Was 0.5
```

**Q: Can I use AI for validation?**
Yes! You can integrate AI services:
```typescript
const aiValidation = await openai.analyze(code, requirements);
```

**Q: How do I handle multi-file projects?**
Extend the validation to accept multiple code strings:
```typescript
function validateMultiFileProject(
  files: { name: string; code: string }[],
  requirements: string[],
  expectedFeatures: string[]
): ValidationResult {
  // Combine files or validate separately
}
```

---

## Support & Contributing

### Getting Help
- Check existing validation patterns in code
- Review test cases for examples
- Consult documentation files

### Contributing
1. Write clear error messages
2. Add comprehensive tests
3. Update documentation
4. Consider edge cases
5. Test with real student code

---

## Quick Command Reference

```bash
# Run validation tests
npm test projectValidation

# Type check
npx tsc --noEmit

# Lint validation code
npx eslint utils/projectValidation.ts

# Format code
npx prettier --write utils/projectValidation.ts
```

---

**Happy Developing! 🚀**

For questions or issues with the validation system, refer to:
- `PROJECT_VALIDATION_SYSTEM.md` - Technical details
- `PROJECT_VALIDATION_TEST_GUIDE.md` - Testing procedures
- `PROJECT_VALIDATION_USER_GUIDE.md` - User perspective
