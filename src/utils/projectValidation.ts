/**
 * Beginner-Friendly Project Validation System
 * 
 * A SUPPORTIVE LEARNING COMPANION 🌟
 * ===================================
 * This validation system is designed to encourage learning and celebrate progress,
 * not to block or frustrate students. It acts like a patient tutor who guides
 * rather than criticizes.
 * 
 * CORE PHILOSOPHY:
 * - Mistakes are part of learning
 * - Multiple approaches are valid
 * - Focus on concepts, not syntax perfection
 * - Celebrate what's correct before suggesting improvements
 * - Only block for critical compilation issues
 * 
 * VALIDATION APPROACH:
 * 1. Check for blockers (won't compile, missing main method)
 * 2. Detect what the student DID implement
 * 3. Provide gentle suggestions for missing concepts
 * 4. Allow submission at 80%+ conceptual completion
 * 
 * WHAT STUDENTS WILL LOVE:
 * - "You did great with..." messages
 * - Soft, colorful guidance (not red errors)
 * - Educational tips inline
 * - Progress percentage
 * - Encouragement and support
 */

export interface ValidationFeedback {
  completionPercentage: number;
  canSubmit: boolean;
  blockers: ValidationItem[];
  correctImplementations: ValidationItem[];
  suggestions: ValidationItem[];
  educationalTips: string[];
}

export interface ValidationItem {
  category: 'syntax' | 'concept' | 'feature' | 'style';
  message: string;
  explanation?: string;
  example?: string;
  severity: 'blocker' | 'suggestion' | 'tip';
}

/**
 * Main validation function - beginner-friendly approach
 */
export function validateProjectFriendly(
  code: string,
  starterCode: string,
  requirements: string[],
  expectedFeatures: string[],
  moduleId?: string,
  projectId?: string,
  solutionCode?: string
): ValidationFeedback {
  const blockers: ValidationItem[] = [];
  const correctImplementations: ValidationItem[] = [];
  const suggestions: ValidationItem[] = [];
  const educationalTips: string[] = [];

  // 1. Check for critical blockers only
  // If a canonical solution is provided, prefer code-based comparison before running deeper checks
  if (solutionCode && solutionCode.trim().length > 0) {
    // For beginner-project-3: allow similarity-based acceptance
    // (strip comments/whitespace/tokens and compare by Levenshtein)
    if (projectId === 'beginner-project-3') {
      const normalizeEol = (s: string) => (s || '').replace(/\r\n/g, '\n');
      const stripComments = (s: string) => normalizeEol(s).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      const stripWhitespace = (s: string) => stripComments(s).replace(/\s+/g, '');

      const userNorm = stripWhitespace(code || '');
      const canonNorm = stripWhitespace(solutionCode || '');

      // Simple Levenshtein implementation
      const levenshtein = (a: string, b: string) => {
        const alen = a.length;
        const blen = b.length;
        if (alen === 0) return blen;
        if (blen === 0) return alen;
        const v0 = new Array(blen + 1).fill(0).map((_, i) => i);
        let v1 = new Array(blen + 1).fill(0);
        for (let i = 0; i < alen; i++) {
          v1[0] = i + 1;
          for (let j = 0; j < blen; j++) {
            const cost = a[i] === b[j] ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
          }
          for (let k = 0; k <= blen; k++) v0[k] = v1[k];
        }
        return v1[blen];
      };

      const maxLen = Math.max(userNorm.length, canonNorm.length) || 1;
      const dist = levenshtein(userNorm, canonNorm);
      const similarity = 1 - dist / maxLen;

      const threshold = 0.90; // accept 90%+ similarity after stripping comments/whitespace

      if (similarity >= threshold) {
        return {
          completionPercentage: 100,
          canSubmit: true,
          blockers: [],
          correctImplementations: [{ category: 'feature', message: `Similar to canonical solution (${(similarity * 100).toFixed(1)}%)`, severity: 'tip' }],
          suggestions: [],
          educationalTips: ['✅ Submission is sufficiently similar to the canonical solution for beginner-project-3']
        };
      }

      // Not similar enough
      return {
        completionPercentage: 0,
        canSubmit: false,
        blockers: [{ category: 'syntax', severity: 'blocker', message: 'Submission is not similar enough to the canonical solution for beginner-project-3', explanation: `Similarity ${(similarity * 100).toFixed(1)}% < ${(threshold * 100).toFixed(0)}% threshold` }],
        correctImplementations: [],
        suggestions: [],
        educationalTips: ['🔍 Your submission differs from the expected solution. Consider aligning structure, method names, and key logic.']
      };
    }

    const normalizeCode = (s: string) => s.replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();
    const stripWhitespace = (s: string) => s.replace(/\s+/g, '');
    const userNormalized = normalizeCode(code);
    const canonicalNormalized = normalizeCode(solutionCode || '');
    const userNoSpace = stripWhitespace(userNormalized);
    const canonicalNoSpace = stripWhitespace(canonicalNormalized);

    if (userNormalized === canonicalNormalized || userNoSpace === canonicalNoSpace) {
      // Exact or whitespace-insensitive match — treat as full completion
      return {
        completionPercentage: 100,
        canSubmit: true,
        blockers: [],
        correctImplementations: [{ category: 'feature', message: 'Exact match with canonical solution', severity: 'tip' }],
        suggestions: [],
        educationalTips: ['✅ Matched canonical solution']
      };
    }

    // For specified projects allow tolerant similarity (whitespace/tokens/comments)
    if (projectId === 'beginner-project-2' || projectId === 'learner-project-5' || projectId === 'learner-project-6' || projectId === 'learner-project-7' || projectId === 'learner-project-8') {
      // Simple Levenshtein distance on whitespace-stripped strings
      const levenshtein = (a: string, b: string) => {
        const alen = a.length;
        const blen = b.length;
        if (alen === 0) return blen;
        if (blen === 0) return alen;
        const v0 = new Array(blen + 1).fill(0).map((_, i) => i);
        let v1 = new Array(blen + 1).fill(0);
        for (let i = 0; i < alen; i++) {
          v1[0] = i + 1;
          for (let j = 0; j < blen; j++) {
            const cost = a[i] === b[j] ? 0 : 1;
            v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
          }
          for (let k = 0; k <= blen; k++) v0[k] = v1[k];
        }
        return v1[blen];
      };

      const maxLen = Math.max(userNoSpace.length, canonicalNoSpace.length) || 1;
      const dist = levenshtein(userNoSpace, canonicalNoSpace);
      const similarity = 1 - dist / maxLen;

      // Use a stricter threshold for learner projects 6–8 (95%) as requested
      const threshold = (projectId === 'learner-project-6' || projectId === 'learner-project-7' || projectId === 'learner-project-8') ? 0.95 : 0.9;

      if (similarity >= threshold) {
        return {
          completionPercentage: 100,
          canSubmit: true,
          blockers: [],
          correctImplementations: [{ category: 'feature', message: `Similar to canonical solution (${(similarity * 100).toFixed(1)}%)`, severity: 'tip' }],
          suggestions: [],
          educationalTips: ['✅ Your submission is similar to the expected solution.']
        };
      }
    }
  }

  const criticalChecks = checkCriticalBlockers(code, starterCode);
  blockers.push(...criticalChecks);

  // If there are blockers, return early with supportive message
  if (blockers.length > 0) {
    return {
      completionPercentage: 0,
      canSubmit: false,
      blockers,
      correctImplementations: [],
      suggestions: [],
      educationalTips: getStarterTips()
    };
  }

  // 2. Detect what the student implemented correctly
  const implementations = detectCorrectImplementations(code);
  correctImplementations.push(...implementations);

  // 3. Check requirements in a flexible way
  const requirementResults = checkRequirementsFlexibly(code, requirements);
  correctImplementations.push(...requirementResults.correct);
  suggestions.push(...requirementResults.suggestions);

  // 4. Check expected features
  const featureResults = checkFeaturesFlexibly(code, expectedFeatures);
  correctImplementations.push(...featureResults.correct);
  suggestions.push(...featureResults.suggestions);

  // 5. Add educational tips based on what they're learning
  educationalTips.push(...generateEducationalTips(code, suggestions));

  // 6. Calculate completion percentage
  const totalItems = requirements.length + expectedFeatures.length;
  const completedItems = correctImplementations.filter(
    item => item.category === 'concept' || item.category === 'feature'
  ).length;
  const completionPercentage = totalItems > 0
    ? Math.round((completedItems / totalItems) * 100)
    : 100;

  // 7. Allow submission if 80% or more complete
  const canSubmit = completionPercentage >= 80;

  return {
    completionPercentage,
    canSubmit,
    blockers,
    correctImplementations,
    suggestions,
    educationalTips
  };
}

/**
 * Check only for critical compilation blockers
 */
function checkCriticalBlockers(code: string, starterCode: string): ValidationItem[] {
  const blockers: ValidationItem[] = [];

  // Check if code is empty
  if (!code.trim()) {
    blockers.push({
      category: 'syntax',
      severity: 'blocker',
      message: 'Your code editor is empty',
      explanation: 'Let\'s start coding! You can begin by writing a simple Java class.',
      example: 'public class MyProgram {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}'
    });
    return blockers;
  }

  // Check if code is unchanged from starter
  if (code.trim() === starterCode.trim()) {
    blockers.push({
      category: 'syntax',
      severity: 'blocker',
      message: 'Ready to start coding?',
      explanation: 'The starter code is still unchanged. Add your own implementation to complete the project!',
      example: 'Try declaring variables, adding logic, and creating output statements.'
    });
    return blockers;
  }

  // Check for main method (required for Java programs to run)
  const hasMainMethod = /public\s+static\s+void\s+main\s*\(/i.test(code);
  if (!hasMainMethod) {
    blockers.push({
      category: 'syntax',
      severity: 'blocker',
      message: 'Missing main method',
      explanation: 'Every Java program needs a main method to run. This is where your program starts!',
      example: 'public static void main(String[] args) {\n    // Your code goes here\n}'
    });
  }

  // Check for balanced braces (helps prevent compilation errors)
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;

  if (openBraces !== closeBraces) {
    const diff = Math.abs(openBraces - closeBraces);
    blockers.push({
      category: 'syntax',
      severity: 'blocker',
      message: 'Unmatched braces detected',
      explanation: `You have ${diff} unmatched brace${diff > 1 ? 's' : ''}. Every { needs a matching }.`,
      example: 'Tip: Many code editors show matching braces when you click on one!'
    });
  }

  // Check for balanced parentheses
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;

  if (openParens !== closeParens) {
    const diff = Math.abs(openParens - closeParens);
    blockers.push({
      category: 'syntax',
      severity: 'blocker',
      message: 'Unmatched parentheses detected',
      explanation: `You have ${diff} unmatched parenthes${diff > 1 ? 'es' : 'is'}. Every ( needs a matching ).`,
      example: 'Check your method calls and if statements!'
    });
  }

  return blockers;
}

/**
 * Detect what the student implemented correctly
 */
function detectCorrectImplementations(code: string): ValidationItem[] {
  const correct: ValidationItem[] = [];

  // Detect class declaration
  if (/class\s+\w+/.test(code)) {
    correct.push({
      category: 'syntax',
      severity: 'tip',
      message: '✨ Great! You created a Java class',
      explanation: 'Classes are the building blocks of Java programs.'
    });
  }

  // Detect variables (any data type)
  const variablePatterns = [
    /(?:int|double|float|long|short|byte)\s+\w+\s*=/g,
    /String\s+\w+\s*=/g,
    /(?:boolean|char)\s+\w+\s*=/g
  ];

  let totalVariables = 0;
  variablePatterns.forEach(pattern => {
    const matches = code.match(pattern);
    if (matches) totalVariables += matches.length;
  });

  if (totalVariables > 0) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: `✨ Excellent! You declared ${totalVariables} variable${totalVariables > 1 ? 's' : ''}`,
      explanation: 'Variables store data that your program can use and manipulate.'
    });
  }

  // Detect output statements
  const outputMatches = code.match(/System\.out\.print/g);
  if (outputMatches && outputMatches.length > 0) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: `✨ Nice work! You used ${outputMatches.length} output statement${outputMatches.length > 1 ? 's' : ''}`,
      explanation: 'System.out.print displays information to the user.'
    });
  }

  // Detect comments
  const commentMatches = (code.match(/\/\/.*/g) || []).length + (code.match(/\/\*[\s\S]*?\*\//g) || []).length;
  if (commentMatches >= 2) {
    correct.push({
      category: 'style',
      severity: 'tip',
      message: '✨ Awesome! You added comments to your code',
      explanation: 'Comments help others (and future you!) understand your code.'
    });
  }

  // Detect loops
  if (/for\s*\(/.test(code) || /while\s*\(/.test(code) || /do\s*{/.test(code)) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: '✨ Fantastic! You implemented a loop',
      explanation: 'Loops help you repeat actions without writing the same code multiple times.'
    });
  }

  // Detect conditionals
  if (/if\s*\(/.test(code) || /switch\s*\(/.test(code)) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: '✨ Great job! You used conditional logic',
      explanation: 'Conditionals let your program make decisions based on different situations.'
    });
  }

  // Detect arrays
  if (/\[\s*\]/.test(code) || /new\s+\w+\[/.test(code)) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: '✨ Well done! You worked with arrays',
      explanation: 'Arrays help you store multiple values in a single variable.'
    });
  }

  // Detect methods (beyond main)
  const methodMatches = code.match(/(?:public|private|protected)\s+(?:static\s+)?\w+\s+\w+\s*\([^)]*\)\s*{/g) || [];
  const nonMainMethods = methodMatches.filter(m => !m.includes('main'));
  if (nonMainMethods.length > 0) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: `✨ Impressive! You created ${nonMainMethods.length} custom method${nonMainMethods.length > 1 ? 's' : ''}`,
      explanation: 'Methods help organize your code into reusable pieces.'
    });
  }

  // Detect user input
  if (/Scanner/.test(code)) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: '✨ Excellent! You implemented user input',
      explanation: 'Scanner lets your program interact with users by accepting their input.'
    });
  }

  // Detect ArrayList or other collections
  if (/ArrayList|HashMap|HashSet/.test(code)) {
    correct.push({
      category: 'concept',
      severity: 'tip',
      message: '✨ Advanced work! You used Java collections',
      explanation: 'Collections like ArrayList provide flexible ways to store and manage data.'
    });
  }

  return correct;
}

/**
 * Check requirements flexibly - focus on concepts, not exact wording
 */
function checkRequirementsFlexibly(code: string, requirements: string[]): { correct: ValidationItem[], suggestions: ValidationItem[] } {
  const correct: ValidationItem[] = [];
  const suggestions: ValidationItem[] = [];

  requirements.forEach((requirement, index) => {
    const reqLower = requirement.toLowerCase();
    const result = checkSingleRequirement(code, requirement, reqLower);

    if (result.met) {
      correct.push({
        category: 'concept',
        severity: 'tip',
        message: `✅ Requirement ${index + 1}: ${requirement}`,
        explanation: 'This requirement is satisfied!'
      });
    } else {
      suggestions.push({
        category: 'concept',
        severity: 'suggestion',
        message: `💡 Consider adding: ${requirement}`,
        explanation: result.suggestion,
        example: result.example
      });
    }
  });

  return { correct, suggestions };
}

/**
 * Check a single requirement with flexible matching
 */
function checkSingleRequirement(code: string, requirement: string, reqLower: string): { met: boolean, suggestion: string, example?: string } {
  // Variable requirements - check for ANY variable declarations
  if (reqLower.includes('variable') || reqLower.includes('declare')) {
    const hasVariables = /(?:int|double|float|String|boolean|char|long|short|byte)\s+\w+\s*=/.test(code);
    return {
      met: hasVariables,
      suggestion: 'Try declaring variables to store data. Any variable name works!',
      example: 'int myNumber = 5;\nString myName = "Alex";'
    };
  }

  // Constant requirements
  if (reqLower.includes('constant') || reqLower.includes('final')) {
    const hasConstants = /final\s+(?:int|double|float|String|boolean)\s+[A-Z_]+\s*=/.test(code);
    return {
      met: hasConstants,
      suggestion: 'Constants use the "final" keyword and are typically named in UPPERCASE.',
      example: 'final double PI = 3.14159;'
    };
  }

  // Output requirements
  if (reqLower.includes('display') || reqLower.includes('output') || reqLower.includes('print')) {
    const hasOutput = /System\.out\.print/.test(code);
    return {
      met: hasOutput,
      suggestion: 'Add output statements to display information to the user.',
      example: 'System.out.println("Hello, World!");'
    };
  }

  // Loop requirements
  if (reqLower.includes('loop') || reqLower.includes('for') || reqLower.includes('while')) {
    const hasLoop = /for\s*\(/.test(code) || /while\s*\(/.test(code) || /do\s*{/.test(code);
    return {
      met: hasLoop,
      suggestion: 'Try adding a loop to repeat actions. You can use for, while, or do-while.',
      example: 'for (int i = 0; i < 5; i++) {\n    System.out.println("Count: " + i);\n}'
    };
  }

  // Conditional requirements
  if (reqLower.includes('if') || reqLower.includes('conditional') || reqLower.includes('decision')) {
    const hasConditional = /if\s*\(/.test(code);
    return {
      met: hasConditional,
      suggestion: 'Add an if statement to make decisions in your code.',
      example: 'if (age >= 18) {\n    System.out.println("Adult");\n}'
    };
  }

  // Array requirements
  if (reqLower.includes('array')) {
    const hasArray = /\[\s*\]/.test(code) || /new\s+\w+\[/.test(code);
    return {
      met: hasArray,
      suggestion: 'Create an array to store multiple values of the same type.',
      example: 'int[] numbers = {1, 2, 3, 4, 5};'
    };
  }

  // Method requirements
  if (reqLower.includes('method') && !reqLower.includes('main')) {
    const methodMatches = code.match(/(?:public|private|protected)\s+(?:static\s+)?\w+\s+\w+\s*\([^)]*\)\s*{/g) || [];
    const nonMainMethods = methodMatches.filter(m => !m.includes('main'));
    return {
      met: nonMainMethods.length > 0,
      suggestion: 'Create a custom method to organize your code into reusable pieces.',
      example: 'public static void greet(String name) {\n    System.out.println("Hello, " + name);\n}'
    };
  }

  // Class requirements
  if (reqLower.includes('class') && !reqLower.includes('main')) {
    const classMatches = code.match(/class\s+\w+/g) || [];
    return {
      met: classMatches.length >= 1,
      suggestion: 'Create a class to represent an object or concept.',
      example: 'public class Student {\n    private String name;\n    private int age;\n}'
    };
  }

  // Comment requirements
  if (reqLower.includes('comment')) {
    const commentCount = (code.match(/\/\/.*/g) || []).length + (code.match(/\/\*[\s\S]*?\*\//g) || []).length;
    return {
      met: commentCount >= 2,
      suggestion: 'Add comments to explain what your code does.',
      example: '// This variable stores the user\'s age\nint age = 25;'
    };
  }

  // Scanner/Input requirements
  if (reqLower.includes('scanner') || reqLower.includes('input') || reqLower.includes('user input')) {
    const hasScanner = /Scanner/.test(code);
    return {
      met: hasScanner,
      suggestion: 'Use Scanner to get input from the user.',
      example: 'Scanner input = new Scanner(System.in);\nString name = input.nextLine();'
    };
  }

  // Default: use flexible keyword matching (50% threshold)
  const keywords = extractKeywords(requirement);
  const matchedKeywords = keywords.filter(kw => code.toLowerCase().includes(kw.toLowerCase()));
  const matchPercentage = keywords.length > 0 ? (matchedKeywords.length / keywords.length) : 0;

  return {
    met: matchPercentage >= 0.5,
    suggestion: `We couldn't fully detect this requirement yet. Make sure your code demonstrates: ${requirement}`,
    example: undefined
  };
}

/**
 * Check expected features flexibly
 */
function checkFeaturesFlexibly(code: string, expectedFeatures: string[]): { correct: ValidationItem[], suggestions: ValidationItem[] } {
  const correct: ValidationItem[] = [];
  const suggestions: ValidationItem[] = [];

  expectedFeatures.forEach((feature, index) => {
    const featureLower = feature.toLowerCase();
    const result = checkSingleFeature(code, feature, featureLower);

    if (result.met) {
      correct.push({
        category: 'feature',
        severity: 'tip',
        message: `✅ Feature ${index + 1}: ${feature}`,
        explanation: 'This feature is implemented!'
      });
    } else {
      suggestions.push({
        category: 'feature',
        severity: 'suggestion',
        message: `💡 You might want to add: ${feature}`,
        explanation: result.suggestion,
        example: result.example
      });
    }
  });

  return { correct, suggestions };
}

/**
 * Check a single feature with flexible matching
 */
function checkSingleFeature(code: string, feature: string, featureLower: string): { met: boolean, suggestion: string, example?: string } {
  // Be very lenient - if they're attempting the concept, consider it met

  // Calculation/Math features
  if (featureLower.includes('calculate') || featureLower.includes('computation')) {
    const hasMath = /[+\-*\/]/.test(code);
    return {
      met: hasMath,
      suggestion: 'Try adding calculations using +, -, *, or / operators.',
      example: 'int sum = num1 + num2;'
    };
  }

  // Data storage features
  if (featureLower.includes('store') || featureLower.includes('save')) {
    const hasVariables = /(?:int|double|String|boolean)\s+\w+\s*=/.test(code);
    return {
      met: hasVariables,
      suggestion: 'Use variables to store data.',
      example: 'String username = "Alex";'
    };
  }

  // Display/Show features
  if (featureLower.includes('display') || featureLower.includes('show')) {
    const hasOutput = /System\.out\.print/.test(code);
    return {
      met: hasOutput,
      suggestion: 'Use System.out.println() to display results.',
      example: 'System.out.println("Result: " + result);'
    };
  }

  // Default: flexible keyword matching (40% threshold for features)
  const keywords = extractKeywords(feature);
  const matchedKeywords = keywords.filter(kw => code.toLowerCase().includes(kw.toLowerCase()));
  const matchPercentage = keywords.length > 0 ? (matchedKeywords.length / keywords.length) : 0;

  return {
    met: matchPercentage >= 0.4,
    suggestion: `Consider implementing: ${feature}`,
    example: undefined
  };
}

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'your', 'should', 'must', 'using'];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

/**
 * Generate educational tips based on what they're learning
 */
function generateEducationalTips(code: string, suggestions: ValidationItem[]): string[] {
  const tips: string[] = [];

  // Always include an encouraging message
  tips.push('💜 Remember: You\'re learning! Every line of code you write makes you better.');

  // Add specific tips based on what's missing
  if (suggestions.some(s => s.message.toLowerCase().includes('variable'))) {
    tips.push('📚 Variables are like labeled boxes that store information. Pick any name that makes sense to you!');
  }

  if (suggestions.some(s => s.message.toLowerCase().includes('output'))) {
    tips.push('💬 System.out.println() is how your program talks to the user. Try printing different messages!');
  }

  if (suggestions.some(s => s.message.toLowerCase().includes('loop'))) {
    tips.push('🔄 Loops save you from repeating code. Instead of writing the same thing 10 times, use a loop!');
  }

  // Keep it to 3-4 tips maximum
  return tips.slice(0, 4);
}

/**
 * Get starter tips for beginners
 */
function getStarterTips(): string[] {
  return [
    '💜 Every Java program starts with a main method. That\'s where your code begins running!',
    '📚 Take your time and experiment. Mistakes are how we learn.',
    '💡 Start small: declare a variable, print a message, then build from there.'
  ];
}

/**
 * Legacy function for backward compatibility - converts to new format
 */
export function validateProject(
  code: string,
  starterCode: string,
  requirements: string[],
  expectedFeatures: string[]
): { isValid: boolean; errors: any[] } {
  const feedback = validateProjectFriendly(code, starterCode, requirements, expectedFeatures);

  // Convert to old format for compatibility
  const errors = [
    ...feedback.blockers.map(b => ({
      type: 'syntax',
      message: b.message,
      detail: b.explanation
    })),
    ...feedback.suggestions.map(s => ({
      type: 'requirement',
      message: s.message,
      detail: s.explanation
    }))
  ];

  return {
    isValid: feedback.canSubmit && feedback.blockers.length === 0,
    errors: errors
  };
}

/**
 * Format validation feedback for display
 */
export function formatValidationFeedback(feedback: ValidationFeedback): string {
  let output = `\n📊 Project Completion: ${feedback.completionPercentage}%\n\n`;

  if (feedback.correctImplementations.length > 0) {
    output += '✅ What you did great:\n';
    feedback.correctImplementations.forEach(item => {
      output += `   ${item.message}\n`;
    });
    output += '\n';
  }

  if (feedback.suggestions.length > 0) {
    output += '💡 Suggestions to improve:\n';
    feedback.suggestions.forEach(item => {
      output += `   ${item.message}\n`;
    });
    output += '\n';
  }

  if (feedback.educationalTips.length > 0) {
    output += '📚 Learning Tips:\n';
    feedback.educationalTips.forEach(tip => {
      output += `   ${tip}\n`;
    });
  }

  return output;
}
