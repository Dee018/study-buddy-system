/**
 * Enhanced Java Code Simulator
 * Supports loops, conditionals, arrays, methods, and more advanced Java features
 */

export interface SimulationResult {
  output: string;
  error?: string;
  executionSteps?: ExecutionStep[];
}

export interface ExecutionStep {
  line: number;
  code: string;
  variables: Record<string, any>;
  output?: string;
}

export class EnhancedJavaSimulator {
  private variables: Map<string, any> = new Map();
  private arrays: Map<string, any[]> = new Map();
  private output: string[] = [];
  private executionSteps: ExecutionStep[] = [];
  private stepByStepMode: boolean = false;

  constructor(stepByStepMode: boolean = false) {
    this.stepByStepMode = stepByStepMode;
  }

  /**
   * Simulate Java code execution
   */
  simulate(code: string): SimulationResult {
    try {
      this.reset();

      // Remove comments
      code = this.removeComments(code);

      // Extract and process method main
      const mainMethod = this.extractMainMethod(code);
      if (!mainMethod) {
        return { output: '', error: 'No main method found' };
      }

      // Execute main method body
      this.executeBlock(mainMethod);

      return {
        output: this.output.join(''),
        executionSteps: this.stepByStepMode ? this.executionSteps : undefined
      };
    } catch (error: any) {
      console.error('Simulation error:', error);
      return {
        output: this.output.join(''),
        error: error.message || 'Error simulating code execution'
      };
    }
  }

  /**
   * Reset simulator state
   */
  private reset(): void {
    this.variables.clear();
    this.arrays.clear();
    this.output = [];
    this.executionSteps = [];
  }

  /**
   * Remove comments from code
   */
  private removeComments(code: string): string {
    // Remove single-line comments
    code = code.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    code = code.replace(/\/\*[\s\S]*?\*\//g, '');
    return code;
  }

  /**
   * Extract main method body
   */
  private extractMainMethod(code: string): string | null {
    const mainPattern = /public\s+static\s+void\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/;
    const match = code.match(mainPattern);

    if (match) {
      return match[1];
    }

    // If no formal main method, try to execute the whole code
    return code;
  }

  /**
   * Execute a block of code
   */
  private executeBlock(code: string): void {
    const lines = this.splitIntoStatements(code);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === '{' || line === '}') continue;

      try {
        this.executeLine(line, i + 1);
      } catch (error: any) {
        throw new Error(`Line ${i + 1}: ${error.message}`);
      }
    }
  }

  /**
   * Split code into statements (handling braces for loops/conditionals)
   */
  private splitIntoStatements(code: string): string[] {
    const statements: string[] = [];
    let currentStatement = '';
    let braceCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const prevChar = i > 0 ? code[i - 1] : '';

      // Handle strings
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }

      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;

        // Split on semicolon if not inside braces
        if (char === ';' && braceCount === 0) {
          currentStatement += char;
          statements.push(currentStatement.trim());
          currentStatement = '';
          continue;
        }
      }

      currentStatement += char;
    }

    // Add remaining statement if any
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    return statements;
  }

  /**
   * Execute a single line/statement
   */
  private executeLine(line: string, lineNumber: number): void {
    // Variable declaration
    if (this.isVariableDeclaration(line)) {
      this.executeVariableDeclaration(line);
    }
    // Array declaration
    else if (this.isArrayDeclaration(line)) {
      this.executeArrayDeclaration(line);
    }
    // Print statement
    else if (line.includes('System.out.print')) {
      this.executePrint(line);
    }
    // For loop
    else if (line.startsWith('for')) {
      this.executeForLoop(line);
    }
    // While loop
    else if (line.startsWith('while')) {
      this.executeWhileLoop(line);
    }
    // If statement
    else if (line.startsWith('if')) {
      this.executeIfStatement(line);
    }
    // Assignment
    else if (line.includes('=') && !line.includes('==')) {
      this.executeAssignment(line);
    }
    // Increment/Decrement
    else if (line.match(/(\w+)(\+\+|--)/)) {
      this.executeIncrementDecrement(line);
    }

    // Record step if in step-by-step mode
    if (this.stepByStepMode) {
      this.executionSteps.push({
        line: lineNumber,
        code: line,
        variables: Object.fromEntries(this.variables)
      });
    }
  }

  /**
   * Check if line is variable declaration
   */
  private isVariableDeclaration(line: string): boolean {
    return /^\s*(int|double|float|long|boolean|char|String)\s+\w+\s*=/.test(line);
  }

  /**
   * Check if line is array declaration
   */
  private isArrayDeclaration(line: string): boolean {
    return /^\s*(int|double|float|long|boolean|char|String)\[\]\s+\w+/.test(line);
  }

  /**
   * Execute variable declaration
   */
  private executeVariableDeclaration(line: string): void {
    const match = line.match(/^\s*(int|double|float|long|boolean|char|String)\s+(\w+)\s*=\s*([^;]+);?/);
    if (!match) return;

    const [, , varName, valueExpr] = match;
    const value = this.evaluateExpression(valueExpr.trim());
    this.variables.set(varName, value);
  }

  /**
   * Execute array declaration
   */
  private executeArrayDeclaration(line: string): void {
    // int[] arr = new int[5];
    const newArrayMatch = line.match(/^\s*(int|double|String)\[\]\s+(\w+)\s*=\s*new\s+\1\[(\d+)\];?/);
    if (newArrayMatch) {
      const [, type, arrayName, size] = newArrayMatch;
      const arraySize = parseInt(size);
      const defaultValue = type === 'String' ? '' : 0;
      this.arrays.set(arrayName, Array(arraySize).fill(defaultValue));
      return;
    }

    // int[] arr = {1, 2, 3};
    const literalMatch = line.match(/^\s*(int|double|String)\[\]\s+(\w+)\s*=\s*\{([^}]+)\};?/);
    if (literalMatch) {
      const [, , arrayName, elements] = literalMatch;
      const values = elements.split(',').map(e => this.evaluateExpression(e.trim()));
      this.arrays.set(arrayName, values);
    }
  }

  /**
   * Execute print statement
   */
  private executePrint(line: string): void {
    const printMatch = line.match(/System\.out\.print(ln)?\s*\(([^)]+)\)/);
    if (!printMatch) return;

    const [, ln, content] = printMatch;
    const value = this.evaluateExpression(content.trim());

    if (ln) {
      this.output.push(String(value) + '\n');
    } else {
      this.output.push(String(value));
    }
  }

  /**
   * Execute for loop
   */
  private executeForLoop(line: string): void {
    // for (int i = 0; i < 10; i++) { ... }
    const match = line.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*([^;]+);\s*([^;]+);\s*([^)]+)\)\s*\{([\s\S]*?)\}/);
    if (!match) return;

    const [, varName, initValue, condition, increment, body] = match;

    // Initialize loop variable
    this.variables.set(varName, this.evaluateExpression(initValue.trim()));

    // Execute loop
    const maxIterations = 10000; // Prevent infinite loops
    let iterations = 0;

    while (this.evaluateCondition(condition.trim()) && iterations < maxIterations) {
      this.executeBlock(body);

      // Execute increment
      this.executeIncrementDecrement(increment.trim());

      iterations++;
    }

    if (iterations >= maxIterations) {
      throw new Error('Loop exceeded maximum iterations (possible infinite loop)');
    }
  }

  /**
   * Execute while loop
   */
  private executeWhileLoop(line: string): void {
    const match = line.match(/while\s*\(([^)]+)\)\s*\{([\s\S]*?)\}/);
    if (!match) return;

    const [, condition, body] = match;

    const maxIterations = 10000;
    let iterations = 0;

    while (this.evaluateCondition(condition.trim()) && iterations < maxIterations) {
      this.executeBlock(body);
      iterations++;
    }

    if (iterations >= maxIterations) {
      throw new Error('Loop exceeded maximum iterations (possible infinite loop)');
    }
  }

  /**
   * Execute if statement
   */
  private executeIfStatement(line: string): void {
    // if (condition) { ... } else { ... }
    const match = line.match(/if\s*\(([^)]+)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?/);
    if (!match) return;

    const [, condition, ifBody, elseBody] = match;

    if (this.evaluateCondition(condition.trim())) {
      this.executeBlock(ifBody);
    } else if (elseBody) {
      this.executeBlock(elseBody);
    }
  }

  /**
   * Execute assignment
   */
  private executeAssignment(line: string): void {
    // Handle array assignment: arr[0] = 5;
    const arrayMatch = line.match(/(\w+)\[([^\]]+)\]\s*=\s*([^;]+);?/);
    if (arrayMatch) {
      const [, arrayName, indexExpr, valueExpr] = arrayMatch;
      const index = this.evaluateExpression(indexExpr.trim());
      const value = this.evaluateExpression(valueExpr.trim());

      if (this.arrays.has(arrayName)) {
        const arr = this.arrays.get(arrayName)!;
        arr[Number(index)] = value;
      }
      return;
    }

    // Regular assignment: x = 5;
    const match = line.match(/(\w+)\s*=\s*([^;]+);?/);
    if (!match) return;

    const [, varName, valueExpr] = match;
    const value = this.evaluateExpression(valueExpr.trim());
    this.variables.set(varName, value);
  }

  /**
   * Execute increment/decrement
   */
  private executeIncrementDecrement(line: string): void {
    const match = line.match(/(\w+)(\+\+|--)/);
    if (!match) return;

    const [, varName, operator] = match;
    const currentValue = this.variables.get(varName) || 0;

    if (operator === '++') {
      this.variables.set(varName, Number(currentValue) + 1);
    } else {
      this.variables.set(varName, Number(currentValue) - 1);
    }
  }

  /**
   * Evaluate an expression
   */
  private evaluateExpression(expr: string): any {
    expr = expr.trim();

    // String literal
    if ((expr.startsWith('"') && expr.endsWith('"')) ||
      (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    // Boolean literal
    if (expr === 'true') return true;
    if (expr === 'false') return false;

    // Array access: arr[0]
    const arrayAccessMatch = expr.match(/(\w+)\[([^\]]+)\]/);
    if (arrayAccessMatch) {
      const [, arrayName, indexExpr] = arrayAccessMatch;
      const index = this.evaluateExpression(indexExpr);
      if (this.arrays.has(arrayName)) {
        return this.arrays.get(arrayName)![Number(index)];
      }
    }

    // Array length: arr.length
    if (expr.includes('.length')) {
      const arrayName = expr.split('.')[0];
      if (this.arrays.has(arrayName)) {
        return this.arrays.get(arrayName)!.length;
      }
    }

    // Variable
    if (this.variables.has(expr)) {
      return this.variables.get(expr);
    }

    // Number literal
    if (!isNaN(Number(expr))) {
      return Number(expr);
    }

    // Operators
    if (expr.includes('+')) {
      return this.evaluateBinaryOp(expr, '+', (a, b) => {
        if (typeof a === 'string' || typeof b === 'string') {
          return String(a) + String(b);
        }
        return Number(a) + Number(b);
      });
    }

    if (expr.includes('-') && !expr.startsWith('-')) {
      return this.evaluateBinaryOp(expr, '-', (a, b) => Number(a) - Number(b));
    }

    if (expr.includes('*')) {
      return this.evaluateBinaryOp(expr, '*', (a, b) => Number(a) * Number(b));
    }

    if (expr.includes('/')) {
      return this.evaluateBinaryOp(expr, '/', (a, b) => {
        if (Number(b) === 0) throw new Error('Division by zero');
        return Number(a) / Number(b);
      });
    }

    if (expr.includes('%')) {
      return this.evaluateBinaryOp(expr, '%', (a, b) => Number(a) % Number(b));
    }

    return expr;
  }

  /**
   * Evaluate binary operation
   */
  private evaluateBinaryOp(expr: string, operator: string, operation: (a: any, b: any) => any): any {
    const parts = expr.split(operator);
    if (parts.length < 2) return expr;

    let result = this.evaluateExpression(parts[0].trim());
    for (let i = 1; i < parts.length; i++) {
      const operand = this.evaluateExpression(parts[i].trim());
      result = operation(result, operand);
    }

    return result;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: string): boolean {
    condition = condition.trim();

    // Comparison operators
    if (condition.includes('<=')) {
      const [left, right] = condition.split('<=');
      return Number(this.evaluateExpression(left.trim())) <= Number(this.evaluateExpression(right.trim()));
    }

    if (condition.includes('>=')) {
      const [left, right] = condition.split('>=');
      return Number(this.evaluateExpression(left.trim())) >= Number(this.evaluateExpression(right.trim()));
    }

    if (condition.includes('==')) {
      const [left, right] = condition.split('==');
      return this.evaluateExpression(left.trim()) == this.evaluateExpression(right.trim());
    }

    if (condition.includes('!=')) {
      const [left, right] = condition.split('!=');
      return this.evaluateExpression(left.trim()) != this.evaluateExpression(right.trim());
    }

    if (condition.includes('<') && !condition.includes('<=')) {
      const [left, right] = condition.split('<');
      return Number(this.evaluateExpression(left.trim())) < Number(this.evaluateExpression(right.trim()));
    }

    if (condition.includes('>') && !condition.includes('>=')) {
      const [left, right] = condition.split('>');
      return Number(this.evaluateExpression(left.trim())) > Number(this.evaluateExpression(right.trim()));
    }

    // Boolean variable or literal
    const value = this.evaluateExpression(condition);
    return Boolean(value);
  }
}

/**
 * Convenience function for backward compatibility
 */
export function simulateJavaCode(code: string): SimulationResult {
  const simulator = new EnhancedJavaSimulator();
  return simulator.simulate(code);
}

/**
 * Simulate with step-by-step execution
 */
export function simulateJavaCodeStepByStep(code: string): SimulationResult {
  const simulator = new EnhancedJavaSimulator(true);
  return simulator.simulate(code);
}

/**
 * Validate Java code against expected output
 */
export function validateJavaCode(code: string, expectedOutput: string): {
  isCorrect: boolean;
  actualOutput: string;
  matchPercentage: number;
  feedback: string;
} {
  const simulation = simulateJavaCode(code);
  const actualOutput = simulation.output;
  const expected = expectedOutput.trim();
  const actual = actualOutput.trim();

  // Exact match
  if (expected === actual) {
    return {
      isCorrect: true,
      actualOutput,
      matchPercentage: 100,
      feedback: '✅ Perfect! Your code produces the exact expected output!'
    };
  }

  // Normalize and compare
  const normalizeOutput = (str: string) => {
    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  const normalizedExpected = normalizeOutput(expected);
  const normalizedActual = normalizeOutput(actual);

  if (normalizedExpected === normalizedActual) {
    return {
      isCorrect: true,
      actualOutput,
      matchPercentage: 100,
      feedback: '✅ Excellent work! Your solution produces the correct output!'
    };
  }

  // Partial match
  const expectedLines = normalizedExpected.split('\n');
  const actualLines = normalizedActual.split('\n');
  let matchedLines = 0;

  expectedLines.forEach(expectedLine => {
    if (actualLines.some(actualLine =>
      actualLine.toLowerCase() === expectedLine.toLowerCase()
    )) {
      matchedLines++;
    }
  });

  const matchPercentage = expectedLines.length > 0
    ? (matchedLines / expectedLines.length) * 100
    : 0;

  if (matchPercentage >= 80) {
    return {
      isCorrect: true,
      actualOutput,
      matchPercentage,
      feedback: '✅ Great job! Your output matches the expected result!'
    };
  } else if (matchPercentage >= 50) {
    return {
      isCorrect: false,
      actualOutput,
      matchPercentage,
      feedback: '⚠️ Your output is partially correct. Compare your output with the expected output carefully.'
    };
  } else {
    return {
      isCorrect: false,
      actualOutput,
      matchPercentage,
      feedback: simulation.error || '❌ Your output doesn\'t match the expected result. Make sure your code logic is correct.'
    };
  }
}
