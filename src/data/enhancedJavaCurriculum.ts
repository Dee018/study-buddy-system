// Enhanced Java Curriculum with Detailed Beginner Track Content
// Integrates comprehensive lesson plans with existing curriculum structure

import { Module, Lesson } from './javaCurriculum';

// Extended interfaces for detailed content
export interface CodeExample {
  title: string;
  description: string;
  code: string;
  explanation: string;
}

export interface DetailedLesson extends Lesson {
  theoreticalFoundation?: string[];
  netBeansGuidance?: string[];
  codeExamples?: CodeExample[];
  practiceExercises?: string[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  starterCode: string;
  expectedOutput?: string;
  hints: string[];
  points: number;
  moduleId: string;
  testInputs?: any[]; // For Scanner-based exercises - inputs to inject during auto-grading

  // ENHANCED: Support for flexible validation
  requiresInput?: boolean;
  testCases?: {
    inputs: any[];
    description: string;
    expectedOutputPattern?: string | RegExp;
    expectedOutputContains?: string[];
    shouldNotContain?: string[];
    expectedCategory?: string;
    categoryKeywords?: string[];
    testType?: 'exact' | 'contains' | 'category' | 'logic';
  }[];
  inputPrompts?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  starterCode: string;
  expectedFeatures: string[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  moduleId: string;
}

export interface EnhancedModule extends Module {
  learningPhilosophy?: string;
  theoreticalFoundation?: string[];
  netBeansSetup?: string[];
  detailedLessons?: DetailedLesson[];
  handsOnExercises?: Exercise[];
  assessmentProject?: Project;
}

// Detailed content for Module 1
export const module1DetailedLessons: DetailedLesson[] = [
  {
    id: 'beginner-lesson-1-1',
    title: 'What is Java? Understanding the Language',
    description: 'Learn about Java\'s history, applications, and architecture including JVM, JRE, and JDK.',
    duration: '45 minutes',
    difficulty: 'Easy',
    concepts: [
      'Java history and evolution',
      'Java applications in real world',
      'JVM (Java Virtual Machine) architecture',
      'JRE vs JDK differences',
      'Platform independence concept',
      'Object-oriented nature of Java'
    ],
    theoreticalFoundation: [
      'Java was created by James Gosling at Sun Microsystems in 1995',
      'Originally designed for interactive television but evolved for internet programming',
      'Java powers billions of devices from mobile phones to enterprise servers',
      'The JVM acts as an abstraction layer between Java code and hardware',
      'Write once, run anywhere (WORA) makes Java highly portable'
    ],
    netBeansGuidance: [
      'Launch NetBeans and observe the welcome screen',
      'Navigate through the menu system to understand available options',
      'Explore the Help > About section to verify JDK installation',
      'Familiarize yourself with the toolbar icons',
      'Check the Output window for system messages'
    ],
    codeExamples: [],
    practiceExercises: [
      'Research three major applications built with Java',
      'Write a paragraph explaining the JVM concept in your own words',
      'Identify which JDK version is installed on your system'
    ]
  },
  {
    id: 'beginner-lesson-1-2',
    title: 'Development Environment Setup with NetBeans',
    description: 'Set up your Java development environment with NetBeans IDE and create your first project.',
    duration: '60 minutes',
    difficulty: 'Easy',
    concepts: [
      'NetBeans IDE installation',
      'JDK configuration',
      'Project creation workflow',
      'Understanding the IDE interface',
      'Compiler basics',
      'Running Java programs'
    ],
    theoreticalFoundation: [
      'Integrated Development Environments (IDEs) streamline the development process',
      'NetBeans provides intelligent code completion, debugging tools, and project management',
      'The compiler (javac) transforms human-readable code into bytecode',
      'Bytecode is platform-independent and executed by the JVM',
      'NetBeans automatically handles compilation and execution processes'
    ],
    netBeansGuidance: [
      'Create your first project: File > New Project > Java Application',
      'Name your project meaningfully (e.g., "Week1Exercises")',
      'Observe the automatically generated project structure',
      'Notice the default package and Main class',
      'Use Ctrl+Space for code completion features',
      'Run programs using F6 or the Run button'
    ],
    codeExamples: [
      {
        title: 'Hello World Program',
        description: 'The traditional first program.',
        code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java Programming!");
    }
}`,
        explanation: 'Basic structure with main method as entry point.'
      }
    ]
  }
];

// Module 1 Exercises
export const module1Exercises: Exercise[] = [
  {
    id: 'beginner-ex-1-1',
    title: 'Personal Information Display',
    description: 'Create a program that displays your personal information using various data types.',
    difficulty: 'Easy',
    moduleId: 'beginner-module-1',
    instructions: [
      'Create a new class called PersonalInfo',
      'Declare variables for: name (String), age (int), height (double), isStudent (boolean), grade (char)',
      'Initialize all variables with your personal information',
      'Display all information in a formatted output',
      'Use at least one constant (e.g., SCHOOL_NAME)'
    ],
    starterCode: `public class PersonalInfo {
    public static void main(String[] args) {
        // Declare and initialize variables here
        
        
        // Display information here
        
    }
}`,
    expectedOutput: `Name: John Doe
Age: 20
Height: 5.9 feet
Student Status: true
Grade: A
School: Java Programming Academy`,
    hints: [
      'Use String for text data',
      'Remember to use double for decimal numbers',
      'Constants should be declared with final keyword'
    ],
    points: 50
  },
  {
    id: 'beginner-ex-1-2',
    title: 'Simple Calculator Variables',
    description: 'Practice variable declarations and basic arithmetic.',
    difficulty: 'Easy',
    moduleId: 'beginner-module-1',
    instructions: [
      'Create a class named CalculatorVariables',
      'Declare two integer variables: num1 and num2',
      'Calculate and store: sum, difference, product, quotient',
      'Display all results with labels'
    ],
    starterCode: `public class CalculatorVariables {
    public static void main(String[] args) {
        // Declare and calculate
        
    }
}`,
    hints: ['Initialize sum to 0', 'Use descriptive names'],
    points: 50
  },
  {
    id: 'beginner-ex-1-3',
    title: 'Temperature Converter Setup',
    description: 'Create variables for temperature conversion.',
    difficulty: 'Medium',
    moduleId: 'beginner-module-1',
    instructions: [
      'Create class TemperatureConverter',
      'Declare constant for conversion formula',
      'Implement: Fahrenheit = Celsius * 9/5 + 32',
      'Display both temperatures'
    ],
    starterCode: `public class TemperatureConverter {
    public static void main(String[] args) {
        // Implement conversion
        
    }
}`,
    expectedOutput: `Temperature in Celsius: 25.0
Temperature in Fahrenheit: 77.0`,
    hints: ['Use final for constants', 'Use double for temperatures'],
    points: 75
  }
];

// Module 1 Assessment Project
export const module1Project: Project = {
  id: 'beginner-project-1',
  title: 'Student Information System - Foundation',
  description: 'Comprehensive program demonstrating understanding of variables, data types, and basic Java syntax.',
  moduleId: 'beginner-module-1',
  objectives: [
    'Demonstrate proper variable declaration',
    'Use multiple data types appropriately',
    'Apply naming conventions correctly',
    'Create readable, well-commented code'
  ],
  requirements: [
    'Create class StudentInfoSystem',
    'Declare at least 8 variables using different data types',
    'Include at least 2 constants',
    'Display information professionally',
    'Include comprehensive comments'
  ],
  starterCode: `/**
 * Student Information System - Module 1 Assessment
 * Author: [Your Name]
 */
public class StudentInfoSystem {
    public static void main(String[] args) {
        // Implement student information system
        
    }
}`,
  expectedFeatures: [
    'Professional header with decorative borders',
    'Use of all required data types',
    'At least 2 constants',
    'Properly formatted output',
    'Comprehensive comments'
  ],
  estimatedTime: '45-60 minutes',
  difficulty: 'Medium',
  points: 150
};

// Module 2 Exercises
export const module2Exercises: Exercise[] = [
  {
    id: 'beginner-ex-2-1',
    title: 'Age Category Classifier',
    description: 'Classify age into life stages using if-else statements.',
    difficulty: 'Easy',
    moduleId: 'beginner-module-2',
    instructions: [
      'Prompt user for age',
      'Classify: Child (0-12), Teen (13-19), Adult (20-64), Senior (65+)',
      'Display category with message',
      'Include input validation'
    ],
    starterCode: `import java.util.Scanner;

public class AgeCategoryClassifier {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement classifier
        
        input.close();
    }
}`,
    hints: ['Use if-else-if ladder', 'Validate input first'],
    points: 50
  },
  {
    id: 'beginner-ex-2-2',
    title: 'Simple Menu System',
    description: 'Build interactive menu using switch statements.',
    difficulty: 'Medium',
    moduleId: 'beginner-module-2',
    instructions: [
      'Display menu with 5 options',
      'Use switch for choice handling',
      'Add loop for multiple operations',
      'Include default case'
    ],
    starterCode: `import java.util.Scanner;

public class MenuSystem {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement menu
        
        input.close();
    }
}`,
    hints: ['Use while loop', 'Don\'t forget break statements'],
    points: 75
  },
  {
    id: 'beginner-ex-2-3',
    title: 'Sum Calculator',
    description: 'Calculate sum of numbers 1 to N using loops.',
    difficulty: 'Easy',
    moduleId: 'beginner-module-2',
    instructions: [
      'Prompt for number N',
      'Use for loop to calculate sum',
      'Display result and average',
      'Handle edge cases'
    ],
    starterCode: `import java.util.Scanner;

public class SumCalculator {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement calculator
        
        input.close();
    }
}`,
    hints: ['Initialize sum to 0', 'Average = sum / count'],
    points: 50
  },
  {
    id: 'beginner-ex-2-4',
    title: 'Multiplication Table Generator',
    description: 'Generate multiplication tables using nested loops.',
    difficulty: 'Medium',
    moduleId: 'beginner-module-2',
    instructions: [
      'Prompt for table size',
      'Use nested loops',
      'Format output with printf',
      'Add row and column headers'
    ],
    starterCode: `import java.util.Scanner;

public class MultiplicationTable {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement table generator
        
        input.close();
    }
}`,
    hints: ['Nested for loops', 'Use %4d for alignment'],
    points: 75
  }
];

// Module 2 Assessment Project
export const module2Project: Project = {
  id: 'beginner-project-2',
  title: 'Interactive Number Analysis Program',
  description: 'Comprehensive program analyzing numbers using operators, conditionals, and loops.',
  moduleId: 'beginner-module-2',
  objectives: [
    'Implement complex conditional logic',
    'Use loops effectively',
    'Apply operators meaningfully',
    'Create interactive experience'
  ],
  requirements: [
    'Menu-driven program with 4+ options',
    'Option 1: Check if number is prime',
    'Option 2: Calculate factorial',
    'Option 3: Generate Fibonacci sequence',
    'Option 4: Find all factors',
    'Use switch for menu handling',
    'Include input validation'
  ],
  starterCode: `import java.util.Scanner;

/**
 * Number Analysis Program - Module 2 Assessment
 * Author: [Your Name]
 */
public class NumberAnalyzer {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement analyzer
        
        input.close();
    }
}`,
  expectedFeatures: [
    'Working menu with all options',
    'Prime number checker',
    'Factorial calculator',
    'Fibonacci generator',
    'Factor finder',
    'Input validation',
    'Professional formatting'
  ],
  estimatedTime: '60-90 minutes',
  difficulty: 'Medium',
  points: 150
};

// Module 3 & 4 Exercises (Similar structure)
export const module3Exercises: Exercise[] = [
  {
    id: 'beginner-ex-3-1',
    title: 'Temperature Converter Library',
    description: 'Create utility library with temperature conversion methods.',
    difficulty: 'Easy',
    moduleId: 'beginner-module-3',
    instructions: [
      'Create TemperatureConverter class',
      'Implement celsiusToFahrenheit method',
      'Implement fahrenheitToCelsius method',
      'Add input validation'
    ],
    starterCode: `public class TemperatureConverter {
    // Implement methods
    
    public static void main(String[] args) {
        // Test methods
    }
}`,
    hints: ['F = C * 9/5 + 32', 'Use static methods'],
    points: 50
  },
  {
    id: 'beginner-ex-3-2',
    title: 'String Utility Methods',
    description: 'Create utility methods for string manipulation.',
    difficulty: 'Medium',
    moduleId: 'beginner-module-3',
    instructions: [
      'Method to capitalize first letter',
      'Method to reverse string',
      'Method to count vowels',
      'Method to check palindrome'
    ],
    starterCode: `public class StringUtilities {
    // Implement methods
    
    public static void main(String[] args) {
        // Test methods
    }
}`,
    hints: ['Use charAt() and length()', 'StringBuilder for building'],
    points: 75
  }
];

export const module4Exercises: Exercise[] = [
  {
    id: 'beginner-ex-4-1',
    title: 'Student Grade Tracker',
    description: 'Manage student grades using arrays.',
    difficulty: 'Medium',
    moduleId: 'beginner-module-4',
    instructions: [
      'Create arrays for names and grades',
      'Calculate class average',
      'Find highest and lowest grades',
      'Count students above/below average'
    ],
    starterCode: `public class StudentGradeTracker {
    public static void main(String[] args) {
        String[] students = {"Alice", "Bob", "Charlie", "Diana", "Eve"};
        double[] grades = {85.5, 92.0, 78.5, 90.0, 88.5};
        
        // Implement tracker
    }
}`,
    hints: ['Parallel arrays', 'Track index for max/min'],
    points: 75
  },
  {
    id: 'beginner-ex-4-2',
    title: 'Text Analyzer',
    description: 'Build text analysis tool using string methods.',
    difficulty: 'Medium',
    moduleId: 'beginner-module-4',
    instructions: [
      'Count total characters',
      'Count words',
      'Count vowels and consonants',
      'Display all statistics'
    ],
    starterCode: `import java.util.Scanner;

public class TextAnalyzer {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement analyzer
        
        input.close();
    }
}`,
    hints: ['split(" ") for words', 'charAt() for characters'],
    points: 75
  }
];

// Export all exercises and projects by module
export const exercisesByModule = {
  'beginner-module-1': module1Exercises,
  'beginner-module-2': module2Exercises,
  'beginner-module-3': module3Exercises,
  'beginner-module-4': module4Exercises
};

export const projectsByModule = {
  'beginner-module-1': module1Project,
  'beginner-module-2': module2Project,
  'beginner-module-3': {
    id: 'beginner-project-3',
    title: 'Advanced Calculator with Methods',
    description: 'Comprehensive calculator with method organization.',
    moduleId: 'beginner-module-3',
    objectives: ['Method design', 'Overloading', 'Reusability'],
    requirements: ['5 operation categories', 'Method overloading', 'Error handling'],
    starterCode: '// Starter code for project 3',
    expectedFeatures: ['Complete implementation', 'Professional formatting'],
    estimatedTime: '90-120 minutes',
    difficulty: 'Hard' as const,
    points: 150
  },
  'module-4': {
    id: 'beginner-project-4',
    title: 'Student Grade Management System',
    description: 'Complete grade management using arrays and strings.',
    moduleId: 'beginner-module-4',
    objectives: ['Array operations', 'String manipulation', 'Searching/sorting'],
    requirements: ['Store 8+ students', 'Statistics', 'Search', 'Sort', 'Reports'],
    starterCode: '// Starter code for project 4',
    expectedFeatures: ['Data management', 'Analysis features', 'Professional UI'],
    estimatedTime: '120-180 minutes',
    difficulty: 'Hard' as const,
    points: 200
  }
};

// Helper functions
export function getExercisesByModule(moduleId: string): Exercise[] {
  return exercisesByModule[moduleId as keyof typeof exercisesByModule] || [];
}

export function getProjectByModule(moduleId: string): Project | undefined {
  return projectsByModule[moduleId as keyof typeof projectsByModule];
}

export function getAllExercises(): Exercise[] {
  return [
    ...module1Exercises,
    ...module2Exercises,
    ...module3Exercises,
    ...module4Exercises
  ];
}

export function getExerciseById(exerciseId: string): Exercise | undefined {
  const allExercises = getAllExercises();
  return allExercises.find(ex => ex.id === exerciseId);
}