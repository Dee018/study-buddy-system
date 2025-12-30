// Lesson interface
export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Intermediate' | 'Expert';
  completed?: boolean;
  locked?: boolean;
  concepts: string[];
  practiceExercises?: string[];
}

export interface Module {
  id: string;
  week: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
  handsOnActivities: string[];
  assessment: string;
  estimatedHours: number;
  completed?: boolean;
  locked?: boolean;
  category: 'Beginner' | 'Learner' | 'Advanced';
  requiredLevel: 'Beginner' | 'Learner' | 'Advanced';
}

export const javaCurriculum: Module[] = [
  {
    id: 'beginner-module-1',
    week: 1,
    title: 'Introduction to Java and Programming Fundamentals',
    description: 'Learn the basics of Java programming, set up your development environment, and write your first Java programs.',
    category: 'Beginner',
    requiredLevel: 'Beginner',
    objectives: [
      'Understand what Java is and its role in software development',
      'Set up development environment',
      'Learn basic syntax and data types',
      'Write first Java programs'
    ],
    lessons: [
      {
        id: 'beginner-lesson-1-1',
        title: 'What is Java?',
        description: 'Learn about Java\'s history, uses, and how it compares to other programming languages.',
        duration: '45 minutes',
        difficulty: 'Easy',
        concepts: ['Java history', 'Java applications', 'JVM, JRE, and JDK', 'Platform independence']
      },
      {
        id: 'beginner-lesson-1-2',
        title: 'Development Environment Setup',
        description: 'Set up your Java development environment with IDE and necessary tools.',
        duration: '60 minutes',
        difficulty: 'Easy',
        concepts: ['IDE installation', 'JDK setup', 'Hello World program', 'Compiler usage']
      },
      {
        id: 'beginner-lesson-1-3',
        title: 'Basic Syntax and Structure',
        description: 'Understand Java program structure, comments, and basic syntax rules.',
        duration: '50 minutes',
        difficulty: 'Easy',
        concepts: ['Class structure', 'Main method', 'Comments', 'Statements', 'Case sensitivity']
      },
      {
        id: 'beginner-lesson-1-4',
        title: 'Data Types and Variables',
        description: 'Learn about primitive data types, variable declaration, and naming conventions.',
        duration: '55 minutes',
        difficulty: 'Easy',
        concepts: ['Primitive types', 'Variable declaration', 'Initialization', 'Naming conventions', 'Constants']
      }
    ],
    handsOnActivities: [
      'Set up development environment',
      'Write "Hello World" program',
      'Create variables of different types',
      'Practice with IDE features'
    ],
    assessment: 'Quiz on basic concepts and simple coding exercises',
    estimatedHours: 4
  },
  {
    id: 'beginner-module-2',
    week: 2,
    title: 'Operators and Control Flow',
    description: 'Master Java operators and implement control structures for decision making and loops.',
    category: 'Beginner',
    requiredLevel: 'Beginner',
    objectives: [
      'Understand Java operators',
      'Implement control structures',
      'Create loops for repetitive tasks',
      'Understand program flow control'
    ],
    lessons: [
      {
        id: 'beginner-lesson-2-1',
        title: 'Operators',
        description: 'Learn about arithmetic, assignment, comparison, and logical operators in Java.',
        duration: '50 minutes',
        difficulty: 'Easy',
        concepts: ['Arithmetic operators', 'Assignment operators', 'Comparison operators', 'Logical operators', 'Operator precedence']
      },
      {
        id: 'beginner-lesson-2-2',
        title: 'Conditional Statements',
        description: 'Implement decision-making using if-else statements and switch cases.',
        duration: '55 minutes',
        difficulty: 'Easy',
        concepts: ['if-else statements', 'Nested if statements', 'switch statement', 'Ternary operator', 'Boolean logic']
      },
      {
        id: 'beginner-lesson-2-3',
        title: 'Loops',
        description: 'Master for, while, and do-while loops for repetitive operations.',
        duration: '60 minutes',
        difficulty: 'Easy',
        concepts: ['for loops', 'while loops', 'do-while loops', 'Enhanced for loops', 'Loop control (break, continue)']
      },
      {
        id: 'beginner-lesson-2-4',
        title: 'Error Handling Basics',
        description: 'Learn to identify and debug common programming errors.',
        duration: '40 minutes',
        difficulty: 'Easy',
        concepts: ['Syntax errors', 'Runtime errors', 'Logic errors', 'Debugging techniques', 'IDE debugging tools']
      }
    ],
    handsOnActivities: [
      'Calculator program using operators',
      'Grade classification system using conditionals',
      'Number guessing game using loops',
      'Pattern printing exercises'
    ],
    assessment: 'Programming assignment: Simple interactive programs and peer code review exercise',
    estimatedHours: 4.5
  },
  {
    id: 'beginner-module-3',
    week: 3,
    title: 'Methods and Parameter Passing',
    description: 'Learn to create reusable code with methods, understand parameter passing, and apply proper scoping.',
    category: 'Beginner',
    requiredLevel: 'Beginner',
    objectives: [
      'Create and use methods',
      'Understand parameter passing',
      'Apply scope and return values',
      'Implement method overloading'
    ],
    lessons: [
      {
        id: 'beginner-lesson-3-1',
        title: 'Method Fundamentals',
        description: 'Learn how to define and call methods with return types and parameters.',
        duration: '55 minutes',
        difficulty: 'Easy',
        concepts: ['Method declaration', 'Return types', 'Parameters', 'Method calling', 'void vs non-void methods']
      },
      {
        id: 'beginner-lesson-3-2',
        title: 'Parameter Passing',
        description: 'Understand how Java passes parameters by value and method overloading.',
        duration: '50 minutes',
        difficulty: 'Intermediate',
        concepts: ['Pass-by-value', 'Method signatures', 'Method overloading', 'Parameter types', 'Variable arguments']
      },
      {
        id: 'beginner-lesson-3-3',
        title: 'Scope and Lifetime',
        description: 'Master variable scope, method scope, and memory management.',
        duration: '45 minutes',
        difficulty: 'Intermediate',
        concepts: ['Local variables', 'Instance variables', 'Class variables', 'Scope rules', 'Variable lifetime']
      }
    ],
    handsOnActivities: [
      'Create utility methods library',
      'Calculator with method decomposition',
      'Text processing methods',
      'Mathematical function implementations'
    ],
    assessment: 'Method-based programming assignment and practical implementation',
    estimatedHours: 3.5
  },
  {
    id: 'beginner-module-4',
    week: 4,
    title: 'Arrays and String Manipulation',
    description: 'Master array operations, multidimensional arrays, and comprehensive string manipulation techniques.',
    category: 'Learner',
    requiredLevel: 'Learner',
    objectives: [
      'Work with arrays and multidimensional arrays',
      'Perform string operations',
      'Implement array algorithms',
      'Apply string processing techniques'
    ],
    lessons: [
      {
        id: 'beginner-lesson-4-1',
        title: 'Array Fundamentals',
        description: 'Learn array declaration, initialization, and basic operations.',
        duration: '55 minutes',
        difficulty: 'Easy',
        concepts: ['Array declaration', 'Array initialization', 'Array indexing', 'Array length', 'Array traversal']
      },
      {
        id: 'beginner-lesson-4-2',
        title: 'Multidimensional Arrays',
        description: 'Work with 2D arrays and matrix operations.',
        duration: '60 minutes',
        difficulty: 'Intermediate',
        concepts: ['2D array declaration', 'Matrix operations', 'Nested loops', 'Jagged arrays', 'Array of arrays']
      },
      {
        id: 'beginner-lesson-4-3',
        title: 'String Methods and Processing',
        description: 'Master String class methods and text manipulation.',
        duration: '50 minutes',
        difficulty: 'Easy',
        concepts: ['String methods', 'String comparison', 'Substring operations', 'String formatting', 'StringBuilder']
      }
    ],
    handsOnActivities: [
      'Student grade tracker with arrays',
      'Matrix calculator implementation',
      'Text analyzer using string methods',
      'Array sorting and searching exercises'
    ],
    assessment: 'Array and string manipulation programming project',
    estimatedHours: 4
  },
  {
    id: 'learner-module-5',
    week: 5,
    title: 'Object-Oriented Programming Basics',
    description: 'Introduction to classes, objects, constructors, and the fundamental principles of OOP.',
    category: 'Advanced',
    requiredLevel: 'Advanced',
    objectives: [
      'Understand classes and objects',
      'Implement constructors',
      'Apply encapsulation principles',
      'Create object interactions'
    ],
    lessons: [
      {
        id: 'learner-lesson-5-1',
        title: 'Classes and Objects',
        description: 'Learn to define classes and create objects with attributes and behaviors.',
        duration: '60 minutes',
        difficulty: 'Intermediate',
        concepts: ['Class definition', 'Object creation', 'Instance variables', 'Instance methods', 'this keyword']
      },
      {
        id: 'learner-lesson-5-2',
        title: 'Constructors and Initialization',
        description: 'Master constructor overloading and object initialization.',
        duration: '55 minutes',
        difficulty: 'Intermediate',
        concepts: ['Default constructor', 'Parameterized constructor', 'Constructor overloading', 'Constructor chaining', 'Initialization blocks']
      },
      {
        id: 'learner-lesson-5-3',
        title: 'Encapsulation and Access Modifiers',
        description: 'Implement encapsulation using access modifiers and getter/setter methods.',
        duration: '50 minutes',
        difficulty: 'Intermediate',
        concepts: ['private, public, protected', 'Getter and setter methods', 'Data hiding', 'Access control', 'Package visibility']
      }
    ],
    handsOnActivities: [
      'Student management system with classes',
      'Bank account simulation',
      'Library book tracking system',
      'Employee payroll calculator'
    ],
    assessment: 'OOP design and implementation project',
    estimatedHours: 4
  },
  {
    id: 'learner-module-6',
    week: 6,
    title: 'Inheritance and Polymorphism',
    description: 'Master inheritance hierarchies, method overriding, and polymorphic behavior in Java.',
    category: 'Learner',
    requiredLevel: 'Learner',
    objectives: [
      'Implement inheritance hierarchies',
      'Apply method overriding',
      'Understand polymorphism',
      'Use super keyword effectively'
    ],
    lessons: [
      {
        id: 'learner-lesson-6-1',
        title: 'Inheritance Fundamentals',
        description: 'Learn class inheritance, super keyword, and IS-A relationships.',
        duration: '60 minutes',
        difficulty: 'Intermediate',
        concepts: ['extends keyword', 'super keyword', 'IS-A relationship', 'Constructor inheritance', 'Method inheritance']
      },
      {
        id: 'learner-lesson-6-2',
        title: 'Method Overriding',
        description: 'Master method overriding and runtime polymorphism.',
        duration: '55 minutes',
        difficulty: 'Intermediate',
        concepts: ['@Override annotation', 'Method overriding rules', 'Runtime polymorphism', 'Dynamic method dispatch', 'Covariant return types']
      },
      {
        id: 'learner-lesson-6-3',
        title: 'Abstract Classes and Methods',
        description: 'Implement abstract classes and enforce method implementation.',
        duration: '50 minutes',
        difficulty: 'Expert',
        concepts: ['abstract keyword', 'Abstract classes', 'Abstract methods', 'Template method pattern', 'Concrete implementations']
      }
    ],
    handsOnActivities: [
      'Vehicle hierarchy with different types',
      'Shape calculator with polymorphism',
      'Employee management with inheritance',
      'Game character system design'
    ],
    assessment: 'Inheritance and polymorphism comprehensive project',
    estimatedHours: 4
  },
  {
    id: 'learner-module-7',
    week: 7,
    title: 'Interfaces and Abstract Classes',
    description: 'Design flexible systems using interfaces, multiple inheritance concepts, and abstract class patterns.',
    category: 'Learner',
    requiredLevel: 'Learner',
    objectives: [
      'Design and implement interfaces',
      'Understand multiple inheritance',
      'Apply interface segregation',
      'Combine interfaces with abstract classes'
    ],
    lessons: [
      {
        id: 'learner-lesson-7-1',
        title: 'Interface Design',
        description: 'Learn interface declaration, implementation, and design principles.',
        duration: '55 minutes',
        difficulty: 'Intermediate',
        concepts: ['interface keyword', 'implements keyword', 'Interface methods', 'Default methods', 'Static methods in interfaces']
      },
      {
        id: 'learner-lesson-7-2',
        title: 'Multiple Interface Implementation',
        description: 'Implement multiple interfaces and resolve method conflicts.',
        duration: '60 minutes',
        difficulty: 'Expert',
        concepts: ['Multiple interface implementation', 'Method name conflicts', 'Diamond problem resolution', 'Interface inheritance', 'Marker interfaces']
      },
      {
        id: 'learner-lesson-7-3',
        title: 'Interface vs Abstract Classes',
        description: 'Choose between interfaces and abstract classes for different design scenarios.',
        duration: '45 minutes',
        difficulty: 'Expert',
        concepts: ['When to use interfaces', 'When to use abstract classes', 'Design flexibility', 'Code reusability', 'API design']
      }
    ],
    handsOnActivities: [
      'Payment system with multiple interfaces',
      'Plugin architecture design',
      'Database connection abstraction',
      'UI component framework design'
    ],
    assessment: 'Interface-based system design and implementation',
    estimatedHours: 4
  },
  {
    id: 'learner-module-8',
    week: 8,
    title: 'Exception Handling and File I/O',
    description: 'Master exception handling mechanisms and implement robust file input/output operations.',
    category: 'Learner',
    requiredLevel: 'Learner',
    objectives: [
      'Handle exceptions effectively',
      'Create custom exceptions',
      'Perform file I/O operations',
      'Implement robust error handling'
    ],
    lessons: [
      {
        id: 'learner-lesson-8-1',
        title: 'Exception Handling Fundamentals',
        description: 'Learn try-catch blocks, exception types, and error recovery.',
        duration: '60 minutes',
        difficulty: 'Intermediate',
        concepts: ['try-catch blocks', 'Exception hierarchy', 'Checked vs unchecked exceptions', 'finally block', 'throw and throws']
      },
      {
        id: 'learner-lesson-8-2',
        title: 'Custom Exceptions',
        description: 'Create custom exception classes and exception chaining.',
        duration: '50 minutes',
        difficulty: 'Expert',
        concepts: ['Custom exception classes', 'Exception chaining', 'Best practices', 'Exception propagation', 'Resource management']
      },
      {
        id: 'learner-lesson-8-3',
        title: 'File I/O Operations',
        description: 'Read from and write to files using various I/O classes.',
        duration: '65 minutes',
        difficulty: 'Intermediate',
        concepts: ['File class', 'FileReader and FileWriter', 'BufferedReader and BufferedWriter', 'try-with-resources', 'File paths and directories']
      }
    ],
    handsOnActivities: [
      'Log file analyzer with exception handling',
      'Configuration file manager',
      'Data backup and recovery system',
      'Text file processing utilities'
    ],
    assessment: 'Exception handling and file I/O comprehensive assignment',
    estimatedHours: 4.5
  },
  {
    id: 'advanced-module-9',
    week: 9,
    title: 'Advanced OOP Concepts',
    description: 'Explore advanced object-oriented concepts including nested classes, enums, and design patterns.',
    category: 'Advanced',
    requiredLevel: 'Advanced',
    objectives: [
      'Master nested and inner classes',
      'Implement enum types',
      'Apply basic design patterns',
      'Understand advanced OOP concepts'
    ],
    lessons: [
      {
        id: 'advanced-lesson-9-1',
        title: 'Nested and Inner Classes',
        description: 'Learn about static nested classes, inner classes, and anonymous classes.',
        duration: '60 minutes',
        difficulty: 'Expert',
        concepts: ['Static nested classes', 'Non-static inner classes', 'Local classes', 'Anonymous classes', 'Lambda expressions intro']
      },
      {
        id: 'advanced-lesson-9-2',
        title: 'Enums and Constants',
        description: 'Implement enum types for type-safe constants and behavior.',
        duration: '45 minutes',
        difficulty: 'Intermediate',
        concepts: ['enum declaration', 'Enum methods', 'Enum constructors', 'EnumSet and EnumMap', 'Enum best practices']
      },
      {
        id: 'advanced-lesson-9-3',
        title: 'Basic Design Patterns',
        description: 'Introduction to common design patterns like Singleton and Factory.',
        duration: '70 minutes',
        difficulty: 'Expert',
        concepts: ['Singleton pattern', 'Factory pattern', 'Observer pattern', 'Strategy pattern', 'Pattern implementation']
      }
    ],
    handsOnActivities: [
      'Event handling system with inner classes',
      'Configuration manager with enums',
      'Logger implementation using Singleton',
      'Shape factory with Factory pattern'
    ],
    assessment: 'Advanced OOP concepts and design patterns project',
    estimatedHours: 4.5
  },
  {
    id: 'advanced-module-10',
    week: 10,
    title: 'Collections Framework',
    description: 'Master Java Collections Framework including List, Set, Map interfaces and their implementations.',
    category: 'Advanced',
    requiredLevel: 'Advanced',
    objectives: [
      'Master Collections Framework',
      'Choose appropriate collection types',
      'Implement custom collections',
      'Apply generic programming'
    ],
    lessons: [
      {
        id: 'advanced-lesson-10-1',
        title: 'List and Set Collections',
        description: 'Master ArrayList, LinkedList, HashSet, and TreeSet implementations.',
        duration: '65 minutes',
        difficulty: 'Intermediate',
        concepts: ['ArrayList vs LinkedList', 'HashSet vs TreeSet', 'Collection methods', 'Iteration techniques', 'Performance considerations']
      },
      {
        id: 'advanced-lesson-10-2',
        title: 'Iterator and Enhanced For Loop',
        description: 'Use iterators for safe collection traversal and modification.',
        duration: '45 minutes',
        difficulty: 'Intermediate',
        concepts: ['Iterator interface', 'ListIterator', 'Enhanced for loop', 'ConcurrentModificationException', 'Safe iteration practices']
      },
      {
        id: 'advanced-lesson-10-3',
        title: 'Maps and Generics',
        description: 'Master HashMap, TreeMap usage and implement type-safe collections with generics.',
        duration: '65 minutes',
        difficulty: 'Intermediate',
        concepts: ['HashMap vs TreeMap', 'Key-value operations', 'Generic types', 'Type safety', 'Wildcard generics']
      },
      {
        id: 'advanced-lesson-10-4',
        title: 'Collections Algorithms',
        description: 'Use Collections class for sorting, searching, and other algorithms.',
        duration: '55 minutes',
        difficulty: 'Expert',
        concepts: ['Collections.sort()', 'Collections.binarySearch()', 'Comparable interface', 'Comparator interface', 'Custom sorting']
      }
    ],
    handsOnActivities: [
      'Build student database with ArrayList and HashMap',
      'Practice sorting and searching using Collections',
      'Set operations and uniqueness',
      'Generic collection implementations'
    ],
    assessment: 'Collections-based comprehensive assignment',
    estimatedHours: 5
  },
  {
    id: 'advanced-module-11',
    week: 11,
    title: 'Asynchronous Programming',
    description: 'Understand asynchronous programming concepts and implement concurrent tasks in Java.',
    category: 'Advanced',
    requiredLevel: 'Advanced',
    objectives: [
      'Understand asynchronous programming in Java',
      'Apply concurrency concepts',
      'Work with CompletableFuture',
      'Handle asynchronous task coordination'
    ],
    lessons: [
      {
        id: 'advanced-lesson-11-1',
        title: 'Concurrency Basics',
        description: 'Learn the difference between synchronous and asynchronous programming.',
        duration: '55 minutes',
        difficulty: 'Expert',
        concepts: ['Synchronous vs asynchronous', 'Concurrency vs parallelism', 'Executor framework', 'Thread pools', 'Future interface']
      },
      {
        id: 'advanced-lesson-11-2',
        title: 'CompletableFuture',
        description: 'Master asynchronous programming using CompletableFuture.',
        duration: '70 minutes',
        difficulty: 'Expert',
        concepts: ['CompletableFuture creation', 'Async methods', 'Chaining operations', 'Exception handling', 'Combining futures']
      },
      {
        id: 'advanced-lesson-11-3',
        title: 'Async Task Coordination',
        description: 'Coordinate multiple asynchronous tasks and handle results.',
        duration: '60 minutes',
        difficulty: 'Expert',
        concepts: ['Task composition', 'allOf() and anyOf()', 'Timeout handling', 'Callback patterns', 'Error propagation']
      }
    ],
    handsOnActivities: [
      'Implement callback-based tasks',
      'Build async tasks with CompletableFuture',
      'Task coordination exercises',
      'Async web service simulation'
    ],
    assessment: 'Asynchronous programming comprehensive assignment',
    estimatedHours: 4
  },
  {
    id: 'advanced-module-12',
    week: 12,
    title: 'Multithreading and Final Project',
    description: 'Master multithreading concepts, implement synchronization, and integrate all learned concepts.',
    category: 'Advanced',
    requiredLevel: 'Advanced',
    objectives: [
      'Master multithreading concepts',
      'Implement synchronization in Java',
      'Apply all learned concepts in an integrated project',
      'Demonstrate comprehensive Java programming skills'
    ],
    lessons: [
      {
        id: 'advanced-lesson-12-1',
        title: 'Multithreading Basics',
        description: 'Learn Thread class, Runnable interface, and thread lifecycle.',
        duration: '70 minutes',
        difficulty: 'Expert',
        concepts: ['Thread class', 'Runnable interface', 'Thread states', 'Thread creation', 'Thread lifecycle']
      },
      {
        id: 'advanced-lesson-12-2',
        title: 'Synchronization',
        description: 'Implement thread synchronization to prevent race conditions.',
        duration: '75 minutes',
        difficulty: 'Expert',
        concepts: ['synchronized keyword', 'Synchronized methods', 'Synchronized blocks', 'Locks', 'Deadlock prevention']
      },
      {
        id: 'advanced-lesson-12-3',
        title: 'Advanced Threading Concepts',
        description: 'Master producer-consumer pattern and thread communication.',
        duration: '65 minutes',
        difficulty: 'Expert',
        concepts: ['wait() and notify()', 'Producer-consumer pattern', 'Thread communication', 'Atomic operations', 'Concurrent collections']
      },
      {
        id: 'advanced-lesson-12-4',
        title: 'Final Project Integration',
        description: 'Apply all course concepts in a comprehensive final project.',
        duration: '90 minutes',
        difficulty: 'Expert',
        concepts: ['Project planning', 'System design', 'Integration testing', 'Code review', 'Documentation']
      }
    ],
    handsOnActivities: [
      'Create multithreaded applications (bank system, producer-consumer)',
      'Synchronization exercises',
      'Develop and present final project',
      'Code review and optimization'
    ],
    assessment: 'Final project presentation and multithreading programming tasks',
    estimatedHours: 6
  }
];

// Helper functions for curriculum management
export const getModuleById = (id: string): Module | undefined => {
  return javaCurriculum.find(module => module.id === id);
};

export const getLessonById = (lessonId: string): { module: Module; lesson: Lesson } | undefined => {
  for (const module of javaCurriculum) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) {
      return { module, lesson };
    }
  }
  return undefined;
};

export const getNextLesson = (currentLessonId: string): { module: Module; lesson: Lesson } | undefined => {
  for (let i = 0; i < javaCurriculum.length; i++) {
    const module = javaCurriculum[i];
    const lessonIndex = module.lessons.findIndex(l => l.id === currentLessonId);

    if (lessonIndex !== -1) {
      // Check if there's a next lesson in the same module
      if (lessonIndex < module.lessons.length - 1) {
        return { module, lesson: module.lessons[lessonIndex + 1] };
      }
      // Check if there's a next module
      if (i < javaCurriculum.length - 1) {
        const nextModule = javaCurriculum[i + 1];
        if (nextModule.lessons.length > 0) {
          return { module: nextModule, lesson: nextModule.lessons[0] };
        }
      }
    }
  }
  return undefined;
};

export const getModuleProgress = (module: Module, userProgress?: UserProgress): number => {
  try {
    if (!module) return 0;

    // If caller provided a user progress object, prefer a detailed per-module calculation
    if (userProgress && userProgress.moduleProgress) {
      const moduleProg = userProgress.moduleProgress[module.id];

      // If detailed progress object present, compute using lessons/exercises/projects
      if (moduleProg && typeof moduleProg === 'object') {
        const completedLessons = Array.isArray((moduleProg as any).completedLessons) ? (moduleProg as any).completedLessons.length : 0;
        const totalLessons = Array.isArray(module.lessons) ? module.lessons.length : 0;

        const completedExercises = Array.isArray((moduleProg as any).completedExercises) ? (moduleProg as any).completedExercises.length : 0;
        const totalExercises = Array.isArray((module as any).handsOnExercises) ? (module as any).handsOnExercises.length : 0;

        const completedProject = (moduleProg as any).projectCompleted ? 1 : 0;
        const totalProject = (module as any).assessmentProject ? 1 : 0;

        const totalItems = totalLessons + totalExercises + totalProject;
        const completedItems = completedLessons + completedExercises + completedProject;

        if (totalItems === 0) return 0;
        const calculated = (completedItems / totalItems) * 100;
        return isFinite(calculated) ? Math.round(calculated) : 0;
      }
    }

    // Fallback: legacy behavior - calculate by lessons only
    if (!module.lessons || module.lessons.length === 0) return 0;
    const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
    const calculated = (completedLessons / module.lessons.length) * 100;
    return isFinite(calculated) ? Math.round(calculated) : 0;
  } catch (error) {
    console.error('Error calculating module progress:', error);
    return 0;
  }
};

export const getTotalProgress = (): number => {
  try {
    const totalLessons = javaCurriculum.reduce((total, module) => total + module.lessons.length, 0);
    if (totalLessons === 0) return 0;

    const completedLessons = javaCurriculum.reduce((total, module) => {
      return total + module.lessons.filter(lesson => lesson.completed).length;
    }, 0);

    const calculated = (completedLessons / totalLessons) * 100;
    return isFinite(calculated) ? Math.round(calculated) : 0;
  } catch (error) {
    console.error('Error calculating total progress:', error);
    return 0;
  }
};

// Progress tracking interface
export interface ModuleDetailedProgress {
  completedLessons: string[];
  completedExercises: string[];
  projectCompleted: boolean;
  exerciseCodes?: { [exerciseId: string]: string }; // Store submitted code for each exercise
  projectCode?: string; // Store submitted project code for review
  completed?: boolean; // Marks module as officially completed (prevents resetting)
  // Compatibility fields used across the codebase (may be present in some records)
  unlockedLessons?: string[];
  unlockedExercises?: string[];
  exercises?: any[];
  projects?: any[];
  completedProjects?: string[];
}

export interface UserProgress {
  completedModules: string[];
  currentModule?: string;
  moduleProgress: { [moduleId: string]: number | ModuleDetailedProgress };
  lastActiveModule?: string;
}

// getUnlockedModules can be called in two ways:
// 1) getUnlockedModules(userLevel: string, userProgress: UserProgress)
// 2) getUnlockedModules(curriculum: Record<string, Module>, progress: any)
// The function is defensive and will never throw if modules are missing.
import { allModules } from './comprehensiveBeginnerCurriculum';

export const getUnlockedModules = (arg1: any, arg2: any = { completedModules: [], moduleProgress: {} }): Module[] => {
  let modulesSource: Module[] = [];
  let userLevel: string = 'Beginner';
  let userProgress: UserProgress = { completedModules: [], moduleProgress: {} };

  // Detect invocation style
  if (typeof arg1 === 'string') {
    userLevel = arg1;
    userProgress = arg2 || userProgress;
    // Prefer the consolidated `allModules` (modules 1-8) so hidden advanced modules are excluded
    modulesSource = Array.isArray(allModules) ? allModules : (Array.isArray(javaCurriculum) ? javaCurriculum : []);
  } else if (arg1 && typeof arg1 === 'object') {
    // Treat arg1 as curriculum mapping (id -> Module)
    const curriculumMap = arg1 as Record<string, Module>;
    modulesSource = Object.values(curriculumMap || {}).filter(Boolean) as Module[];
    // progress may carry level or use default
    userProgress = (arg2 as any) || userProgress;
    userLevel = (userProgress && (userProgress.level || userProgress.userLevel)) || 'Beginner';
  } else {
    // Fallback: use global curriculum
    modulesSource = Array.isArray(javaCurriculum) ? javaCurriculum : [];
    userProgress = arg2 || userProgress;
  }

  return modulesSource.map(module => {
    // Check if user level allows access to this category
    const levelCanAccess = (() => {
      switch (userLevel) {
        case 'Beginner':
          return module.requiredLevel === 'Beginner';
        case 'Learner':
          return module.requiredLevel === 'Beginner' || module.requiredLevel === 'Learner';
        case 'Advanced':
          return true; // Advanced can access all modules
        default:
          return module.requiredLevel === 'Beginner';
      }
    })();

    // If user level doesn't allow access, module is locked
    if (!levelCanAccess) {
      return {
        ...module,
        locked: true
      };
    }

    // For modules within user's level, check sequential progression
    const modulesInSameCategory = (modulesSource || []).filter(m => m && m.category === module.category);
    const moduleIndexInCategory = modulesInSameCategory.findIndex(m => m.id === module.id);

    // First module in each category is always unlocked for users who can access that category
    // Defensive: if the module is not found in its category (index -1), treat it as first.
    if (moduleIndexInCategory <= 0) {
      return {
        ...module,
        locked: false
      };
    }

    // For subsequent modules, check if previous module is completed
    const previousModule = modulesInSameCategory[moduleIndexInCategory - 1];

    // Defensive guard: if previousModule is unexpectedly undefined, unlock to avoid runtime errors
    if (!previousModule) {
      return {
        ...module,
        locked: false
      };
    }

    // Check if previous module is completed OR has 100% progress
    const isPreviousInCompletedList = (userProgress.completedModules || []).includes(previousModule.id);

    // Check if previous module has 100% progress
    const moduleProgressMap = userProgress.moduleProgress || {};
    let previousModuleProgress = moduleProgressMap[previousModule.id];

    // Also check with beginner-module prefix for beginner modules
    if (!previousModuleProgress && previousModule.id && previousModule.id.startsWith && previousModule.id.startsWith('module-')) {
      const enhancedId = previousModule.id.replace('module-', 'beginner-module-');
      previousModuleProgress = moduleProgressMap[enhancedId];
    }

    let isPreviousModuleFullyComplete = false;
    if (typeof previousModuleProgress === 'number') {
      isPreviousModuleFullyComplete = previousModuleProgress >= 100;
    } else if (previousModuleProgress && typeof previousModuleProgress === 'object') {
      // For object-based progress, rely on the completedModules array
      // The ProgressManager will auto-add to completedModules when all items are done
      // So we don't need to calculate here - just trust the completedModules list
      isPreviousModuleFullyComplete = false;
    }

    const previousModuleCompleted = isPreviousInCompletedList || isPreviousModuleFullyComplete;

    return {
      ...module,
      locked: !previousModuleCompleted
    };
  });
};

export const getModulesByCategory = (userLevel: string, userProgress: UserProgress = { completedModules: [], moduleProgress: {} }): { [key: string]: Module[] } => {
  const unlockedModules = getUnlockedModules(userLevel, userProgress);

  return {
    'Beginner': unlockedModules.filter(module => module.category === 'Beginner'),
    'Learner': unlockedModules.filter(module => module.category === 'Learner'),
    'Advanced': unlockedModules.filter(module => module.category === 'Advanced')
  };
};

// Helper function to get the next available module for a user
export const getNextAvailableModule = (userLevel: string, userProgress: UserProgress): Module | null => {
  const unlockedModules = getUnlockedModules(userLevel, userProgress);

  // Find the first unlocked module that's not completed
  const nextModule = unlockedModules.find(module =>
    !module.locked &&
    !userProgress.completedModules.includes(module.id)
  );

  return nextModule || null;
};

// Helper function to check if user should level up based on 100% module completion
export const shouldLevelUp = (userLevel: string, userProgress: UserProgress = { completedModules: [], moduleProgress: {} as any }): string | null => {
  // Get modules for current level
  const currentCategoryModules = javaCurriculum.filter(module => {
    if (userLevel === 'Beginner') return module.category === 'Beginner';
    if (userLevel === 'Learner') return module.category === 'Learner';
    if (userLevel === 'Advanced') return false; // Advanced is max level
    return false;
  });

  // For Beginners: Check if all 4 Beginner modules are 100% complete
  // For Learners: Check if all 4 Learner modules are 100% complete
  const allCurrentCompleted = currentCategoryModules.every(module => {
    // Check if module is in completed modules list
    const isInCompletedList = userProgress.completedModules.includes(module.id);

    // Also check for beginner-module- prefix variant
    const enhancedModuleId = module.id.startsWith('module-')
      ? module.id.replace('module-', 'beginner-module-')
      : module.id;
    const isEnhancedCompleted = userProgress.completedModules.includes(enhancedModuleId);

    // Check module progress (lessons, exercises, projects)
    const moduleProgress = userProgress.moduleProgress[module.id] || userProgress.moduleProgress[enhancedModuleId];

    // moduleProgress may be a legacy numeric percentage; only treat as detailed when it's an object
    let is100PercentComplete = false;
    if (moduleProgress && typeof moduleProgress === 'object') {
      const completedLessons = (moduleProgress as any).completedLessons?.length || 0;
      const completedExercises = (moduleProgress as any).completedExercises?.length || 0;
      const completedProjects = (moduleProgress as any).completedProjects?.length || 0;

      const totalLessons = module.lessons?.length || 0;
      is100PercentComplete = totalLessons > 0 && completedLessons >= totalLessons;

      if ((moduleProgress as any).exercises || (moduleProgress as any).projects) {
        const totalExercises = (moduleProgress as any).exercises?.length || 0;
        const totalProjects = (moduleProgress as any).projects?.length || 0;
        is100PercentComplete =
          completedLessons >= totalLessons &&
          (totalExercises === 0 || completedExercises >= totalExercises) &&
          (totalProjects === 0 || completedProjects >= totalProjects);
      }
    }

    return isInCompletedList || isEnhancedCompleted || is100PercentComplete;
  });

  // Level up if all modules in current category are 100% complete
  if (allCurrentCompleted && currentCategoryModules.length > 0) {
    if (userLevel === 'Beginner') return 'Learner';
    if (userLevel === 'Learner') return 'Advanced';
  }

  return null;
};

// Helper function to calculate overall progress based on lessons, exercises, and projects
export const calculateDetailedProgress = (userProgress: UserProgress, comprehensiveBeginnerTrack: any[]): {
  percentage: number;
  completedItems: number;
  totalItems: number;
  breakdown: {
    lessons: { completed: number; total: number };
    exercises: { completed: number; total: number };
    projects: { completed: number; total: number };
  };
} => {
  let totalLessons = 0;
  let totalExercises = 0;
  let totalProjects = 0;
  let completedLessons = 0;
  let completedExercises = 0;
  let completedProjects = 0;

  // Count items from comprehensive beginner track
  const beginnerModules = Array.isArray(comprehensiveBeginnerTrack) ? comprehensiveBeginnerTrack : [];
  const moduleProgressMap = (userProgress && userProgress.moduleProgress) || {};

  beginnerModules.forEach((module: any, idx: number) => {
    if (!module) {
      // optional warning for missing entries
      // eslint-disable-next-line no-console
      console.warn(`calculateDetailedProgress: missing beginner module at index ${idx}`);
      return;
    }

    const moduleId = module.id;
    const moduleProgress = moduleProgressMap[moduleId];

    // Count lessons
    if (Array.isArray(module.lessons)) {
      totalLessons += module.lessons.length;
      if (typeof moduleProgress === 'object' && Array.isArray(moduleProgress.completedLessons)) {
        completedLessons += moduleProgress.completedLessons.length;
      }
    }

    // Count exercises (comprehensive beginner track uses handsOnExercises)
    if (Array.isArray(module.handsOnExercises)) {
      totalExercises += module.handsOnExercises.length;
      if (typeof moduleProgress === 'object' && Array.isArray(moduleProgress.completedExercises)) {
        completedExercises += moduleProgress.completedExercises.length;
      }
    }

    // Count projects (comprehensive beginner track uses assessmentProject)
    if (module.assessmentProject) {
      totalProjects += 1;
      if (typeof moduleProgress === 'object' && moduleProgress.projectCompleted) {
        completedProjects += 1;
      }
    }
  });

  // Count items from main curriculum (module lessons only for now)
  const mainModules = Array.isArray(javaCurriculum) ? javaCurriculum : [];
  mainModules.forEach((module: Module, idx: number) => {
    if (!module) {
      // eslint-disable-next-line no-console
      console.warn(`calculateDetailedProgress: missing main curriculum module at index ${idx}`);
      return;
    }
    const moduleId = module.id;
    const moduleProgress = moduleProgressMap[moduleId];

    // Count lessons
    if (Array.isArray(module.lessons)) {
      totalLessons += module.lessons.length;
      if (typeof moduleProgress === 'object' && Array.isArray(moduleProgress.completedLessons)) {
        completedLessons += moduleProgress.completedLessons.length;
      }
    }
  });

  const totalItems = totalLessons + totalExercises + totalProjects;
  const completedItems = completedLessons + completedExercises + completedProjects;

  // Prevent division by zero and ensure valid percentage
  let percentage = 0;
  if (totalItems > 0) {
    const calculated = (completedItems / totalItems) * 100;
    percentage = isFinite(calculated) ? Math.round(calculated) : 0;
  }

  return {
    percentage,
    completedItems,
    totalItems,
    breakdown: {
      lessons: { completed: completedLessons, total: totalLessons },
      exercises: { completed: completedExercises, total: totalExercises },
      projects: { completed: completedProjects, total: totalProjects }
    }
  };
};

// Helper function to calculate overall progress (legacy - based on module completion)
// Note: total visible modules reduced to 8 (e.g. Beginner 4 + Learner 4)
export const calculateOverallProgress = (userProgress: UserProgress): number => {
  try {
    // Total modules: 8 visible modules
    const totalModules = 8;
    if (totalModules === 0) return 0;

    const completed = userProgress.completedModules?.length || 0;
    const calculated = (completed / totalModules) * 100;
    return isFinite(calculated) ? Math.round(calculated) : 0;
  } catch (error) {
    console.error('Error calculating overall progress:', error);
    return 0;
  }
};

// Helper function to calculate separate curriculum progress
export const calculateCurriculumBreakdown = (userProgress: UserProgress): {
  beginnerCompleted: number;
  beginnerTotal: number;
  learnerCompleted: number;
  learnerTotal: number;
  advancedCompleted: number;
  advancedTotal: number;
  beginnerPercentage: number;
  learnerPercentage: number;
  advancedPercentage: number;
} => {
  // Count completed modules from beginner curriculum (beginner-module-1 to 4)
  const beginnerCompleted = userProgress.completedModules.filter(
    moduleId => moduleId.startsWith('beginner-module-')
  ).length;

  // Count completed modules from learner curriculum (module-5 to 8)
  const learnerCompleted = userProgress.completedModules.filter(
    moduleId => {
      const match = moduleId.match(/^module-(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return num >= 5 && num <= 8;
      }
      return false;
    }
  ).length;

  // Count completed modules from advanced curriculum (module-9 to 12)
  const advancedCompleted = userProgress.completedModules.filter(
    moduleId => {
      const match = moduleId.match(/^module-(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return num >= 9 && num <= 12;
      }
      return false;
    }
  ).length;

  const beginnerTotal = 4; // Beginner track modules (beginner-module-1 to 4)
  const learnerTotal = 4; // Learner track modules (module-5 to 8)
  const advancedTotal = 0; // Advanced track modules not visible (reduced to 8 total modules)

  // Calculate percentages with division by zero protection
  const calculatePercentage = (completed: number, total: number): number => {
    if (total === 0) return 0;
    const calculated = (completed / total) * 100;
    return isFinite(calculated) ? Math.round(calculated) : 0;
  };

  return {
    beginnerCompleted,
    beginnerTotal,
    learnerCompleted,
    learnerTotal,
    advancedCompleted,
    advancedTotal,
    beginnerPercentage: calculatePercentage(beginnerCompleted, beginnerTotal),
    learnerPercentage: calculatePercentage(learnerCompleted, learnerTotal),
    advancedPercentage: calculatePercentage(advancedCompleted, advancedTotal)
  };
};