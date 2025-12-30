/**
 * Java Code Simulator
 * Simulates basic Java code execution for beginner programs
 * Supports variable declarations, arithmetic operations, and print statements
 */

export interface SimulationResult {
  output: string;
  error?: string;
}

/**
 * Simulates Java code execution and returns the console output
 * @param code The Java source code to simulate
 * @returns The simulated console output
 */
export function simulateJavaCode(code: string): SimulationResult {
  try {
    // Create a variable context to store values
    const variables: Record<string, any> = {};
    
    // Helper function to evaluate an expression with variables
    const evaluateExpression = (expr: string): any => {
      expr = expr.trim();
      
      // Handle parentheses - evaluate inner expressions first
      while (expr.includes('(')) {
        const innerMatch = expr.match(/\(([^()]+)\)/);
        if (innerMatch) {
          const innerResult = evaluateExpression(innerMatch[1]);
          expr = expr.replace(innerMatch[0], String(innerResult));
        } else {
          break;
        }
      }
      
      // String literal
      if ((expr.startsWith('"') && expr.endsWith('"')) || 
          (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1);
      }
      
      // Single variable
      if (variables[expr] !== undefined) {
        return variables[expr];
      }
      
      // Number literal
      if (!isNaN(Number(expr))) {
        return Number(expr);
      }
      
      // Handle concatenation/addition with +
      if (expr.includes('+')) {
        const parts = expr.split('+').map(p => p.trim());
        let hasString = false;
        let result: any = '';
        
        // First pass: check if any part is a string
        for (const part of parts) {
          const val = evaluateExpression(part);
          if (typeof val === 'string') {
            hasString = true;
            break;
          }
        }
        
        // If any part is string, do string concatenation
        if (hasString) {
          for (const part of parts) {
            result += String(evaluateExpression(part));
          }
          return result;
        } else {
          // Otherwise, do numeric addition
          result = 0;
          for (const part of parts) {
            const val = evaluateExpression(part);
            result += Number(val);
          }
          return result;
        }
      }
      
      // Handle subtraction
      if (expr.includes('-') && !expr.startsWith('-')) {
        const parts = expr.split('-').map(p => p.trim());
        let result = evaluateExpression(parts[0]);
        for (let i = 1; i < parts.length; i++) {
          result = Number(result) - Number(evaluateExpression(parts[i]));
        }
        return result;
      }
      
      // Handle multiplication
      if (expr.includes('*')) {
        const parts = expr.split('*').map(p => p.trim());
        let result = 1;
        for (const part of parts) {
          result *= Number(evaluateExpression(part));
        }
        return result;
      }
      
      // Handle division
      if (expr.includes('/')) {
        const parts = expr.split('/').map(p => p.trim());
        let result = evaluateExpression(parts[0]);
        for (let i = 1; i < parts.length; i++) {
          const divisor = Number(evaluateExpression(parts[i]));
          // Prevent division by zero
          if (divisor === 0) {
            throw new Error('Division by zero');
          }
          result = Number(result) / divisor;
        }
        return result;
      }
      
      // Handle modulo
      if (expr.includes('%')) {
        const parts = expr.split('%').map(p => p.trim());
        let result = evaluateExpression(parts[0]);
        for (let i = 1; i < parts.length; i++) {
          const divisor = Number(evaluateExpression(parts[i]));
          // Prevent modulo by zero
          if (divisor === 0) {
            throw new Error('Modulo by zero');
          }
          result = Number(result) % divisor;
        }
        return result;
      }
      
      // Fallback: return as-is
      return expr;
    };
    
    // Extract variable declarations and assignments
    const varPattern = /(?:String|int|double|float|long|boolean|char)\s+(\w+)\s*=\s*([^;]+);/gi;
    let match;
    
    while ((match = varPattern.exec(code)) !== null) {
      const varName = match[1];
      const valueExpr = match[2].trim();
      
      // Evaluate the expression to get the actual value
      const value = evaluateExpression(valueExpr);
      variables[varName] = value;
    }
    
    // Extract all System.out.println and System.out.print statements
    const printPattern = /System\.out\.print(?:ln)?\s*\(([^)]+)\)/gi;
    const printStatements: Array<{statement: string, isPrintln: boolean}> = [];
    
    while ((match = printPattern.exec(code)) !== null) {
      printStatements.push({
        statement: match[1],
        isPrintln: match[0].toLowerCase().includes('println')
      });
    }
    
    if (printStatements.length === 0) {
      return { output: '' };
    }
    
    let output = '';
    
    // Process each print statement
    printStatements.forEach(({statement, isPrintln}) => {
      const result = evaluateExpression(statement);
      
      // Add to output
      if (isPrintln) {
        output += String(result) + '\n';
      } else {
        output += String(result);
      }
    });
    
    return { output: output.trim() };
  } catch (error) {
    console.error('Error simulating Java code:', error);
    return { 
      output: '', 
      error: 'Error simulating code execution'
    };
  }
}

/**
 * Validates Java code output against expected output
 * @param code The Java source code
 * @param expectedOutput The expected console output
 * @returns Validation result with match percentage
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
      feedback: '❌ Your output doesn\'t match the expected result. Make sure your variables and print statements are correct.'
    };
  }
}
