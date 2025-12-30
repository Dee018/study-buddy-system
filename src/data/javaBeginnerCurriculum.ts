// Comprehensive Beginner Track Java Curriculum
// Based on NetBeans IDE Self-Paced Learning Module

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  instructions: string[];
  starterCode: string;
  solutionCode?: string;
  expectedOutput?: string;
  hints: string[];
  points: number;
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
  moduleId?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  starterCode: string;
  solutionCode?: string;
  expectedFeatures: string[];
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
}

export interface DetailedLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Intermediate' | 'Expert';
  completed?: boolean;
  locked?: boolean;
  concepts: string[];
  theoreticalFoundation: string[];
  netBeansGuidance: string[];
  codeExamples: {
    title: string;
    description: string;
    code: string;
    explanation: string;
  }[];
  practiceExercises: string[];
}

export interface DetailedModule {
  id: string;
  week: number;
  title: string;
  description: string;
  objectives: string[];
  category: 'Beginner' | 'Learner' | 'Advanced';
  requiredLevel: 'Beginner' | 'Learner' | 'Advanced';
  estimatedHours: number;
  completed?: boolean;
  locked?: boolean;

  // Comprehensive content sections
  learningPhilosophy: string;
  theoreticalFoundation: string[];
  netBeansSetup?: string[];

  lessons: DetailedLesson[];
  handsOnExercises: Exercise[];
  assessmentProject: Project;
}

// Module 1: Foundation Building
export const module1: DetailedModule = {
  id: 'beginner-module-1',
  week: 1,
  title: 'Foundation Building - Introduction to Java and Development Environment',
  description: 'This foundational week establishes your programming journey by introducing Java\'s core concepts and setting up your development environment. You\'ll understand Java\'s position in the programming landscape, configure NetBeans for optimal development, and write your first Java programs.',
  category: 'Beginner',
  requiredLevel: 'Beginner',
  estimatedHours: 4,

  objectives: [
    'Understand Java\'s position in the programming landscape',
    'Configure NetBeans IDE for Java development',
    'Write and execute your first Java programs',
    'Master basic syntax, data types, and variables',
    'Utilize NetBeans features for code completion and debugging'
  ],

  learningPhilosophy: 'This week combines academic rigor with conversational accessibility, ensuring that complex programming concepts are presented in an approachable manner. Each lesson builds systematically upon previous knowledge, creating a solid foundation for advanced topics.',

  theoreticalFoundation: [
    'Java programming represents a gateway into modern software development, combining powerful capabilities with beginner-friendly syntax.',
    'Developed by Sun Microsystems (now Oracle) in the mid-1990s, Java was designed with simplicity and portability in mind.',
    'The "write once, run anywhere" principle means Java programs can execute on any device with a Java Virtual Machine (JVM).',
    'Understanding Java architecture: JDK (Java Development Kit), JRE (Java Runtime Environment), and JVM (Java Virtual Machine).',
    'NetBeans IDE provides an intuitive interface that simplifies development while exposing professional-grade tools.'
  ],

  netBeansSetup: [
    'Download NetBeans from the official Apache NetBeans website',
    'Select the version that includes Java SE support',
    'During installation, NetBeans will detect your system\'s JDK or guide you through installing one',
    'Familiarize yourself with the interface: Project Explorer (left), Editor (center), Output window (bottom)',
    'Learn to create your first Java project: File > New Project > Java Application'
  ],

  lessons: [
    {
      id: 'beginner-lesson-1-1',
      title: 'What is Java? Understanding the Language',
      description: 'Learn about Java\'s history, applications, and architecture including JVM, JRE, and JDK. Understand why Java is one of the most popular programming languages.',
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
      description: 'Set up your Java development environment with NetBeans IDE, understand the interface, and create your first project.',
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
          description: 'The traditional first program that displays a message to the console.',
          code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to Java Programming!");
    }
}`,
          explanation: 'This program demonstrates the basic structure of a Java application with a main method that serves as the entry point. The System.out.println() method outputs text to the console.'
        },
        {
          title: 'Enhanced Hello World',
          description: 'Extended version with multiple output statements and formatting.',
          code: `public class WelcomeMessage {
    public static void main(String[] args) {
        System.out.println("╔════════════════════════════════╗");
        System.out.println("║   Welcome to Java Programming  ║");
        System.out.println("║     Your Journey Begins Here   ║");
        System.out.println("╚════════════════════════════════╝");
        
        System.out.println("\\nLet's start coding!");
    }
}`,
          explanation: 'This demonstrates formatting techniques and escape sequences (\\n for new line) to create visually appealing console output.'
        }
      ],
      practiceExercises: [
        'Create a new Java project in NetBeans',
        'Write and run a Hello World program',
        'Modify the program to display your name and favorite quote',
        'Experiment with NetBeans code formatting (Alt+Shift+F)'
      ]
    },
    {
      id: 'beginner-lesson-1-3',
      title: 'Basic Syntax and Program Structure',
      description: 'Understand Java program structure, comments, statements, and basic syntax rules that form the foundation of Java programming.',
      duration: '50 minutes',
      difficulty: 'Easy',
      concepts: [
        'Class structure and naming',
        'Main method anatomy',
        'Comment types (single-line, multi-line, Javadoc)',
        'Statement syntax',
        'Case sensitivity rules',
        'Code blocks and indentation'
      ],
      theoreticalFoundation: [
        'Java programs are organized into classes, which are blueprints for objects',
        'The main method signature (public static void main(String[] args)) is the program entry point',
        'Comments document code without affecting execution',
        'Statements are individual instructions ending with semicolons',
        'Java is case-sensitive: "Variable" and "variable" are different identifiers',
        'Proper indentation improves readability though it doesn\'t affect compilation'
      ],
      netBeansGuidance: [
        'NetBeans highlights syntax with color coding: keywords (blue), strings (green), comments (gray)',
        'Use code folding to collapse/expand code blocks',
        'NetBeans auto-completes class and method structures',
        'Error indicators (red squiggly lines) show syntax problems',
        'Use Format (Alt+Shift+F) for automatic code organization'
      ],
      codeExamples: [
        {
          title: 'Complete Program Structure',
          description: 'Demonstrates proper class structure with various comment types.',
          code: `/**
 * This is a Javadoc comment describing the class
 * It can span multiple lines
 */
public class ProgramStructure {
    // This is a single-line comment
    
    /*
     * This is a multi-line comment
     * Useful for longer explanations
     */
    public static void main(String[] args) {
        // Program statements go here
        System.out.println("Understanding program structure");
        System.out.println("Case sensitivity: Java != java");
        
        // Multiple statements execute sequentially
        System.out.println("Statement 1");
        System.out.println("Statement 2");
    }
}`,
          explanation: 'This example shows the three types of comments in Java and demonstrates proper program structure with the main method.'
        }
      ],
      practiceExercises: [
        'Create a program with all three comment types',
        'Write a program with at least 5 println statements',
        'Practice using NetBeans auto-format feature',
        'Intentionally create a syntax error and observe NetBeans indicators'
      ]
    },
    {
      id: 'beginner-lesson-1-4',
      title: 'Data Types and Variables',
      description: 'Learn about primitive data types, variable declaration, initialization, naming conventions, and constants in Java.',
      duration: '55 minutes',
      difficulty: 'Easy',
      concepts: [
        'Primitive data types (int, double, boolean, char)',
        'Variable declaration syntax',
        'Variable initialization',
        'Naming conventions (camelCase)',
        'Constants with final keyword',
        'Type conversion basics'
      ],
      theoreticalFoundation: [
        'Variables are named storage locations for data',
        'Primitive types are built into Java: int (integers), double (decimals), boolean (true/false), char (single characters)',
        'Reference types (like String) store addresses to objects rather than the data itself',
        'Java is strongly typed: variables must be declared with specific types',
        'Naming conventions: variables use camelCase (myVariable), constants use UPPER_CASE',
        'The final keyword creates constants that cannot be reassigned'
      ],
      netBeansGuidance: [
        'Type a variable name and press Ctrl+Space to see suggestions',
        'NetBeans warns about unused variables with yellow indicators',
        'Use right-click > Refactor > Rename to safely rename variables',
        'Hover over variable names to see their types and values during debugging',
        'Code completion suggests appropriate data types'
      ],
      codeExamples: [
        {
          title: 'Variable Declaration and Initialization',
          description: 'Demonstrates various data types and variable operations.',
          code: `public class VariablesDemo {
    public static void main(String[] args) {
        // Integer variables
        int age = 25;
        int quantity = 100;
        
        // Floating-point variables
        double price = 29.99;
        double temperature = 98.6;
        
        // Boolean variables
        boolean isStudent = true;
        boolean hasLicense = false;
        
        // Character variable
        char grade = 'A';
        char initial = 'J';
        
        // String (reference type)
        String name = "Alice Johnson";
        String course = "Java Programming";
        
        // Display variables
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Grade: " + grade);
        System.out.println("Is Student: " + isStudent);
        System.out.println("Price: $" + price);
    }
}`,
          explanation: 'This program demonstrates declaration and initialization of various primitive types and String variables, then displays them using concatenation.'
        },
        {
          title: 'Constants and Final Variables',
          description: 'Shows how to create and use constants in Java.',
          code: `public class ConstantsExample {
    public static void main(String[] args) {
        // Constants (cannot be changed)
        final double PI = 3.14159;
        final int MAX_STUDENTS = 30;
        final String SCHOOL_NAME = "Java Academy";
        
        // Using constants in calculations
        double radius = 5.0;
        double area = PI * radius * radius;
        double circumference = 2 * PI * radius;
        
        System.out.println("School: " + SCHOOL_NAME);
        System.out.println("Max Students: " + MAX_STUDENTS);
        System.out.println("Circle Area: " + area);
        System.out.println("Circle Circumference: " + circumference);
        
        // Attempting to change a constant would cause an error:
        // PI = 3.14; // This would not compile!
    }
}`,
          explanation: 'Constants are declared with the final keyword and conventionally use UPPER_CASE naming. They provide clarity and prevent accidental modifications.'
        }
      ],
      practiceExercises: [
        'Create variables of each primitive type and display them',
        'Write a program that stores and displays student information',
        'Practice variable naming using proper camelCase convention',
        'Create constants for common values like tax rates or maximum limits'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'beginner-ex-1-1',
      title: 'Hello World Enhancement',
      description: 'Begin with the classic "Hello World" program and extend it to demonstrate NetBeans features.',
      difficulty: 'Easy',
      instructions: [
        'Create a new Java class called HelloWorld',
        'Modify the main method to print multiple lines of output',
        'Use NetBeans syntax highlighting to observe different color codes',
        'Use the Format Code feature (Alt+Shift+F) to organize your code structure',
        'Add comments explaining each System.out.println() statement'
      ],
      starterCode: `public class HelloWorld {
    public static void main(String[] args) {
        // Your code here
        
    }
}`,
      expectedOutput: `Welcome to Java Programming!
This is my first NetBeans project.
I'm ready to learn programming!`,
      hints: [
        'Use System.out.println() to print each line',
        'Remember that strings must be enclosed in double quotes',
        'Each statement should end with a semicolon'
      ],
      points: 50
    },
    {
      id: 'beginner-ex-1-2',
      title: 'Variable Declaration and Initialization',
      description: 'Create a program that demonstrates various data types and variable usage.',
      difficulty: 'Easy',
      instructions: [
        'Create a class called StudentInfo',
        'Declare variables for student name (String), age (int), GPA (double), enrollment status (boolean), and grade (char)',
        'Assign appropriate values to each variable',
        'Display all information using System.out.println()',
        'Use NetBeans variable refactoring features to rename a variable'
      ],
      starterCode: `public class StudentInfo {
    public static void main(String[] args) {
        // Declare variables here
        
        
        // Display information
        
    }
}`,
      expectedOutput: `Student Name: Alex Johnson
Age: 19
GPA: 3.75
Enrolled: true
Grade: A`,
      hints: [
        'String studentName = "Your Name";',
        'Use concatenation with + to combine strings and variables',
        'boolean values are lowercase: true or false'
      ],
      points: 75
    },
    {
      id: 'beginner-ex-1-3',
      title: 'NetBeans Debugging Introduction',
      description: 'Practice using NetBeans debugging capabilities by setting breakpoints and examining variables.',
      difficulty: 'Medium',
      instructions: [
        'Create a program with multiple variables and calculations',
        'Set breakpoints by clicking in the left margin next to line numbers',
        'Run the program in debug mode (Debug > Debug Main Project)',
        'Examine variable values in the Variables window when execution pauses',
        'Use Step Over (F8) to execute line by line'
      ],
      starterCode: `public class DebugPractice {
    public static void main(String[] args) {
        int num1 = 10;
        int num2 = 20;
        int sum = num1 + num2;
        int product = num1 * num2;
        
        System.out.println("Sum: " + sum);
        System.out.println("Product: " + product);
    }
}`,
      expectedOutput: `Sum: 30
Product: 200`,
      hints: [
        'Set a breakpoint at the line declaring num1',
        'Watch how variables appear in the Variables window as they are declared',
        'Try changing a variable value during debugging'
      ],
      points: 100
    }
  ],

  assessmentProject: {
    id: 'beginner-project-1',
    title: 'Personal Information Program',
    description: 'Create a comprehensive personal information program that demonstrates your understanding of Java basics and NetBeans functionality.',
    objectives: [
      'Demonstrate understanding of Java syntax and structure',
      'Show proficiency with various data types',
      'Create well-formatted, readable output',
      'Apply NetBeans features for code organization'
    ],
    requirements: [
      'Declare at least 5 different variables using different data types',
      'Include String, int, double, boolean, and char variables',
      'Assign meaningful values to all variables',
      'Display formatted output with labels',
      'Include comments explaining your code',
      'Use proper naming conventions (camelCase for variables)'
    ],
    starterCode: `public class PersonalInfo {
    public static void main(String[] args) {
        // Declare your variables here
        
        
        // Display formatted information
        System.out.println("=== Personal Information ===");
        
        
    }
}`,
    expectedFeatures: [
      'Clear, professional output formatting',
      'Proper use of all required data types',
      'Meaningful variable names',
      'Informative comments',
      'Correct Java syntax throughout'
    ],
    estimatedTime: '30-45 minutes',
    difficulty: 'Easy',
    points: 150
  }
};

// Module 2: Control Flow Mastery
export const module2: DetailedModule = {
  id: 'beginner-module-2',
  week: 2,
  title: 'Control Flow Mastery - Operators and Decision Making',
  description: 'Master Java operators and control structures for decision making and repetitive tasks. Learn to create programs that respond intelligently to different inputs and conditions.',
  category: 'Beginner',
  requiredLevel: 'Beginner',
  estimatedHours: 4.5,

  objectives: [
    'Master Java operators (arithmetic, comparison, logical)',
    'Implement conditional statements (if-else, switch)',
    'Create effective loop structures (for, while, do-while)',
    'Apply NetBeans debugging tools for tracking program flow',
    'Develop programs with intelligent decision-making capabilities'
  ],

  learningPhilosophy: 'This week transforms programs from simple sequential execution into intelligent, responsive applications through control flow structures.',

  theoreticalFoundation: [
    'Operators are the building blocks of program logic, enabling calculations, comparisons, and control flow',
    'Conditional statements allow programs to make decisions based on specific conditions',
    'Loops eliminate code duplication by repeating operations until conditions are met',
    'Understanding operator precedence prevents logic errors',
    'NetBeans debugging capabilities transform error-finding into systematic investigation'
  ],

  lessons: [
    {
      id: 'beginner-lesson-2-1',
      title: 'Java Operators and Precedence',
      description: 'Master arithmetic, assignment, comparison, and logical operators. Understand operator precedence and how to use compound operations.',
      duration: '50 minutes',
      difficulty: 'Easy',
      concepts: [
        'Arithmetic operators (+, -, *, /, %)',
        'Assignment operators (=, +=, -=, *=, /=)',
        'Comparison operators (==, !=, <, >, <=, >=)',
        'Logical operators (&&, ||, !)',
        'Increment/decrement operators (++, --)',
        'Operator precedence rules'
      ],
      theoreticalFoundation: [
        'Arithmetic operators perform mathematical calculations with predictable precedence',
        'Compound assignment operators combine assignment with arithmetic operations',
        'Comparison operators evaluate relationships and return boolean results',
        'Logical operators combine boolean expressions for complex decision-making',
        'Understanding short-circuit evaluation optimizes performance and prevents errors'
      ],
      netBeansGuidance: [
        'NetBeans highlights operators with distinctive colors',
        'Use the Variables window during debugging to see operation results',
        'Hover over expressions to see their evaluated values',
        'NetBeans warns about potential precedence issues'
      ],
      codeExamples: [
        {
          title: 'Arithmetic Operators Demo',
          description: 'Demonstrates all basic arithmetic operations.',
          code: `public class ArithmeticDemo {
    public static void main(String[] args) {
        int a = 10;
        int b = 3;
        
        System.out.println("=== Arithmetic Operations ===");
        System.out.println("Addition: " + a + " + " + b + " = " + (a + b));
        System.out.println("Subtraction: " + a + " - " + b + " = " + (a - b));
        System.out.println("Multiplication: " + a + " * " + b + " = " + (a * b));
        System.out.println("Division: " + a + " / " + b + " = " + (a / b));
        System.out.println("Modulus: " + a + " % " + b + " = " + (a % b));
        
        // Increment and decrement
        System.out.println("\\n=== Increment/Decrement ===");
        int count = 5;
        System.out.println("Original count: " + count);
        System.out.println("Post-increment: " + count++); // Displays 5, then increments
        System.out.println("After post-increment: " + count);
        System.out.println("Pre-increment: " + ++count); // Increments first, then displays
    }
}`,
          explanation: 'This program demonstrates all arithmetic operators and shows the difference between pre-increment and post-increment operators.'
        },
        {
          title: 'Comparison and Logical Operators',
          description: 'Shows how comparison and logical operators work together.',
          code: `public class LogicalDemo {
    public static void main(String[] args) {
        int score = 85;
        boolean hasPermission = true;
        
        System.out.println("=== Comparison Operators ===");
        System.out.println("score > 80: " + (score > 80));
        System.out.println("score >= 90: " + (score >= 90));
        System.out.println("score == 85: " + (score == 85));
        System.out.println("score != 100: " + (score != 100));
        
        System.out.println("\\n=== Logical Operators ===");
        System.out.println("Score > 80 AND has permission: " + (score > 80 && hasPermission));
        System.out.println("Score < 60 OR has permission: " + (score < 60 || hasPermission));
        System.out.println("NOT has permission: " + (!hasPermission));
        
        // Complex logical expression
        boolean canEnroll = score >= 70 && hasPermission;
        System.out.println("\\nCan enroll in course: " + canEnroll);
    }
}`,
          explanation: 'This demonstrates comparison operators that return boolean values and logical operators that combine multiple conditions.'
        }
      ],
      practiceExercises: [
        'Create a program that calculates various arithmetic operations',
        'Write expressions using all comparison operators',
        'Practice combining conditions with logical operators',
        'Debug a program using breakpoints to observe operator evaluation'
      ]
    },
    {
      id: 'beginner-lesson-2-2',
      title: 'Conditional Statements - if, else, switch',
      description: 'Learn to implement decision-making logic using if-else statements and switch expressions.',
      duration: '55 minutes',
      difficulty: 'Easy',
      concepts: [
        'if statements',
        'if-else structures',
        'if-else-if ladders',
        'Nested if statements',
        'switch statements',
        'Ternary operator'
      ],
      theoreticalFoundation: [
        'Conditional statements transform programs into intelligent applications',
        'if statements evaluate boolean expressions and execute code blocks based on results',
        'if-else provides alternative execution paths',
        'switch statements excel when comparing one variable against multiple constant values',
        'Proper indentation and structure make conditionals readable and maintainable'
      ],
      netBeansGuidance: [
        'Type "if" and press Tab for automatic structure generation',
        'NetBeans highlights matching braces',
        'Code folding helps visualize conditional structure',
        'Use debugging to step through conditional branches'
      ],
      codeExamples: [
        {
          title: 'Grade Classification System',
          description: 'Complete grading system using if-else-if ladder.',
          code: `import java.util.Scanner;

public class GradeClassifier {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        
        System.out.println("=== Student Grade Classification ===");
        System.out.print("Enter student name: ");
        String name = input.nextLine();
        
        System.out.print("Enter numerical grade (0-100): ");
        double grade = input.nextDouble();
        
        // Validate grade range
        if (grade < 0 || grade > 100) {
            System.out.println("Error: Grade must be between 0 and 100!");
            return;
        }
        
        // Determine letter grade
        char letterGrade;
        String classification;
        
        if (grade >= 97) {
            letterGrade = 'A';
            classification = "Excellent";
        } else if (grade >= 93) {
            letterGrade = 'A';
            classification = "Excellent";
        } else if (grade >= 90) {
            letterGrade = 'A';
            classification = "Very Good";
        } else if (grade >= 87) {
            letterGrade = 'B';
            classification = "Good";
        } else if (grade >= 80) {
            letterGrade = 'B';
            classification = "Satisfactory";
        } else if (grade >= 70) {
            letterGrade = 'C';
            classification = "Average";
        } else if (grade >= 60) {
            letterGrade = 'D';
            classification = "Below Average";
        } else {
            letterGrade = 'F';
            classification = "Failing";
        }
        
        // Display results
        System.out.println("\\n=== Grade Report ===");
        System.out.println("Student: " + name);
        System.out.printf("Numerical Grade: %.1f%n", grade);
        System.out.println("Letter Grade: " + letterGrade);
        System.out.println("Classification: " + classification);
        
        input.close();
    }
}`,
          explanation: 'This comprehensive program demonstrates if-else-if ladders, input validation, and formatted output.'
        },
        {
          title: 'Enhanced Calculator with Switch',
          description: 'Calculator using switch statement for operation selection.',
          code: `import java.util.Scanner;

public class EnhancedCalculator {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        
        System.out.println("=== Enhanced Calculator ===");
        System.out.print("Enter first number: ");
        double num1 = input.nextDouble();
        
        System.out.print("Enter operator (+, -, *, /, %): ");
        char operator = input.next().charAt(0);
        
        System.out.print("Enter second number: ");
        double num2 = input.nextDouble();
        
        double result = 0;
        boolean validOperation = true;
        
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 != 0) {
                    result = num1 / num2;
                } else {
                    System.out.println("Error: Division by zero!");
                    validOperation = false;
                }
                break;
            case '%':
                if (num2 != 0) {
                    result = num1 % num2;
                } else {
                    System.out.println("Error: Modulo by zero!");
                    validOperation = false;
                }
                break;
            default:
                System.out.println("Error: Invalid operator!");
                validOperation = false;
        }
        
        if (validOperation) {
            System.out.printf("%.2f %c %.2f = %.2f%n", num1, operator, num2, result);
        }
        
        input.close();
    }
}`,
          explanation: 'This calculator demonstrates switch statements for multiple operation handling and includes comprehensive error checking.'
        }
      ],
      practiceExercises: [
        'Create a menu system using switch statements',
        'Write a program that categorizes ages into life stages',
        'Implement a number comparison program',
        'Debug conditional logic using NetBeans breakpoints'
      ]
    },
    {
      id: 'beginner-lesson-2-3',
      title: 'Loop Structures - for, while, do-while',
      description: 'Master loop structures for repetitive tasks, including for loops, while loops, and do-while loops.',
      duration: '60 minutes',
      difficulty: 'Easy',
      concepts: [
        'for loop structure and syntax',
        'while loop usage',
        'do-while loop applications',
        'Loop control statements (break, continue)',
        'Nested loops',
        'Infinite loop prevention'
      ],
      theoreticalFoundation: [
        'Loops eliminate code duplication by repeating operations',
        'for loops excel when the number of iterations is known',
        'while loops continue until a condition becomes false',
        'do-while loops guarantee at least one execution',
        'break exits loops immediately, continue skips to next iteration',
        'Nested loops enable processing of multi-dimensional data'
      ],
      netBeansGuidance: [
        'Type "for" and press Tab for automatic loop structure',
        'Use code folding to manage nested loop complexity',
        'Set breakpoints inside loops to examine each iteration',
        'Watch window shows variable changes across iterations'
      ],
      codeExamples: [
        {
          title: 'Number Guessing Game',
          description: 'Interactive game demonstrating while loops and conditionals.',
          code: `import java.util.Scanner;
import java.util.Random;

public class NumberGuessingGame {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        Random random = new Random();
        
        System.out.println("=== Number Guessing Game ===");
        System.out.println("I'm thinking of a number between 1 and 100.");
        
        int secretNumber = random.nextInt(100) + 1;
        int attempts = 0;
        int maxAttempts = 7;
        boolean hasWon = false;
        
        while (attempts < maxAttempts && !hasWon) {
            attempts++;
            System.out.printf("\\nAttempt %d of %d: ", attempts, maxAttempts);
            int guess = input.nextInt();
            
            if (guess == secretNumber) {
                hasWon = true;
                System.out.println("🎉 Congratulations! You guessed it!");
                System.out.printf("You found the number in %d attempts!%n", attempts);
            } else if (guess < secretNumber) {
                System.out.println("Too low! Try a higher number.");
                int difference = secretNumber - guess;
                if (difference <= 5) {
                    System.out.println("You're very close!");
                }
            } else {
                System.out.println("Too high! Try a lower number.");
                int difference = guess - secretNumber;
                if (difference <= 5) {
                    System.out.println("You're very close!");
                }
            }
            
            if (!hasWon && attempts < maxAttempts) {
                System.out.printf("You have %d attempts remaining.%n", maxAttempts - attempts);
            }
        }
        
        if (!hasWon) {
            System.out.printf("\\nGame Over! The number was %d.%n", secretNumber);
        }
        
        input.close();
    }
}`,
          explanation: 'This engaging game demonstrates while loops, conditional logic, and user interaction with feedback based on proximity to the answer.'
        },
        {
          title: 'Pattern Printing with Nested Loops',
          description: 'Demonstrates nested loops for creating patterns.',
          code: `public class PatternPrinting {
    public static void main(String[] args) {
        System.out.println("=== Pattern Printing Examples ===\\n");
        
        // Pattern 1: Right Triangle
        System.out.println("Pattern 1: Right Triangle");
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        
        // Pattern 2: Inverted Triangle
        System.out.println("\\nPattern 2: Inverted Triangle");
        for (int i = 5; i >= 1; i--) {
            for (int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        
        // Pattern 3: Number Pyramid
        System.out.println("\\nPattern 3: Number Pyramid");
        for (int i = 1; i <= 5; i++) {
            // Print spaces
            for (int j = 5; j > i; j--) {
                System.out.print("  ");
            }
            // Print numbers
            for (int j = 1; j <= i; j++) {
                System.out.print(j + " ");
            }
            System.out.println();
        }
        
        // Pattern 4: Multiplication Table
        System.out.println("\\nPattern 4: Multiplication Table (5x5)");
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= 5; j++) {
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
    }
}`,
          explanation: 'This program showcases nested loops for creating various patterns, an excellent way to understand loop mechanics and iteration control.'
        }
      ],
      practiceExercises: [
        'Create a program that prints numbers 1-100',
        'Write a factorial calculator using loops',
        'Implement a program that finds prime numbers',
        'Create various patterns using nested loops'
      ]
    },
    {
      id: 'beginner-lesson-2-4',
      title: 'NetBeans Debugging Mastery',
      description: 'Master NetBeans debugging tools including breakpoints, step execution, and variable inspection.',
      duration: '40 minutes',
      difficulty: 'Easy',
      concepts: [
        'Setting and managing breakpoints',
        'Step Over, Step Into, Step Out',
        'Variables window inspection',
        'Watches for expressions',
        'Call stack navigation',
        'Conditional breakpoints'
      ],
      theoreticalFoundation: [
        'Debugging transforms error-finding from guesswork into systematic investigation',
        'Breakpoints pause execution at specific lines for inspection',
        'Step commands control execution flow line by line',
        'Variables window shows current state of all variables',
        'Watches monitor specific expressions throughout execution',
        'Call stack shows the sequence of method calls'
      ],
      netBeansGuidance: [
        'Set breakpoint: Click in left margin next to line number',
        'Run in debug mode: Debug > Debug Main Project (Ctrl+F5)',
        'Step Over (F8): Execute current line, move to next',
        'Step Into (F7): Enter method calls for detailed examination',
        'Step Out (Ctrl+F7): Complete current method and return',
        'Variables window: Automatically shows all accessible variables',
        'Add watch: Right-click in Variables window > New Watch'
      ],
      codeExamples: [],
      practiceExercises: [
        'Debug the calculator program using breakpoints',
        'Use Step Into to examine method execution',
        'Create watches for complex expressions',
        'Practice with conditional breakpoints'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'beginner-ex-2-1',
      title: 'Age Category Classifier',
      description: 'Create a program that classifies age into life stages using if-else statements.',
      difficulty: 'Easy',
      instructions: [
        'Prompt user to enter their age',
        'Use if-else-if statements to classify into categories',
        'Categories: Child (0-12), Teen (13-19), Adult (20-64), Senior (65+)',
        'Display the category with a personalized message',
        'Include input validation for negative ages'
      ],
      starterCode: `import java.util.Scanner;

    public class AgeCategoryClassifier {

      // ===== HINT SECTION =====
      /*
       * HINTS:
       * 1. Ask the user to enter their age using Scanner.
       * 2. Use an if–else if–else statement to classify the age.
       * 3. Consider these age ranges:
       *    - Below 0 → Invalid
       *    - 0 to 12 → Child
       *    - 13 to 19 → Teen
       *    - 20 to 64 → Adult
       *    - 65 and above → Senior
       * 4. Display the appropriate message based on the age category.
       */

      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // TODO: Prompt the user for their age
        System.out.print("Enter your age: ");
        int age = input.nextInt();

        // TODO: Determine the age category
        String category = "";

        // Hint: Start by checking for invalid (negative) age
        if (age < 0) {
          // TODO: Assign an invalid age message
        } 
        // Hint: Check if the age belongs to a child
        else if (age <= 12) {
          // TODO: Assign "Child"
        } 
        // Hint: Check if the age belongs to a teen
        else if (age <= 19) {
          // TODO: Assign "Teen"
        } 
        // Hint: Check if the age belongs to an adult
        else if (age <= 64) {
          // TODO: Assign "Adult"
        } 
        // Hint: Otherwise, the person is a senior
        else {
          // TODO: Assign "Senior"
        }

        // TODO: Display the result properly
        // Hint: Invalid ages should show a different message

        input.close();
        }
      }`,
      solutionCode: `import java.util.Scanner;

    public class AgeCategoryClassifier {
      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // Get user input
        System.out.print("Enter your age: ");
        int age = input.nextInt();

        // Classify age
        String category;
        if (age < 0) {
          category = "Invalid age! Age cannot be negative.";
        } else if (age <= 12) {
          category = "Child";
        } else if (age <= 19) {
          category = "Teen";
        } else if (age <= 64) {
          category = "Adult";
        } else {
          category = "Senior";
        }

        // Display result
        if (age >= 0) {
          System.out.println("You are classified as a(n) " + category + ".");
        } else {
          System.out.println(category); // Display invalid age message
        }

        input.close();
      }
    }
    `,
      hints: [
        'Use if-else-if ladder for multiple categories',
        'Remember to validate input before classification',
        'Provide friendly messages for each category'
      ],
      expectedOutput: `Enter your age: 16
    You are classified as a(n) Teen.`,
      points: 50
    },
    {
      id: 'beginner-ex-2-2',
      title: 'Simple Menu System',
      description: 'Build an interactive menu using switch statements.',
      difficulty: 'Medium',
      instructions: [
        'Display a menu with 5 options',
        'Use switch statement to handle user choice',
        'Each option should display a relevant message',
        'Include a default case for invalid input',
        'Add a loop to allow multiple operations'
      ],
      starterCode: `import java.util.Scanner;

    public class MenuProgram {

      // ===== HINT SECTION =====
      /*
       * HINTS:
       * 1. Use Scanner to get user input for menu choices.
       * 2. Display a menu with 5 options:
       *    1. View Profile
       *    2. Check Grades
       *    3. Enroll Subject
       *    4. View Schedule
       *    5. Exit
       * 3. Use a loop to keep showing the menu until the user chooses to exit.
       * 4. Use a switch statement to handle each menu option.
       *    - Default case should handle invalid inputs.
       * 5. Remember to close the Scanner when exiting.
       */

      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int choice;

        // TODO: Loop to display the menu repeatedly
        while (true) {

          // TODO: Display menu options
          System.out.println("\n=== MENU ===");
          System.out.println("1. View Profile");
          System.out.println("2. Check Grades");
          System.out.println("3. Enroll Subject");
          System.out.println("4. View Schedule");
          System.out.println("5. Exit");

          // Hint: Ask the user to enter their choice
          System.out.print("Enter your choice: ");
          choice = input.nextInt();

          // TODO: Use switch statement to handle choices
          switch (choice) {
            case 1:
              // Hint: Display a message for View Profile
              break;

            case 2:
              // Hint: Display a message for Check Grades
              break;

            case 3:
              // Hint: Display a message for Enroll Subject
              break;

            case 4:
              // Hint: Display a message for View Schedule
              break;

            case 5:
              // Hint: Display exit message and terminate loop
              input.close();
              return;

            default:
              // Hint: Display an invalid choice message
          }
        }
      }
    }`,
      solutionCode: `import java.util.Scanner;

    public class MenuProgram {
      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int choice;

        // Loop to allow multiple operations
        while (true) {

          // Display menu
          System.out.println("\n=== MENU ===");
          System.out.println("1. View Profile");
          System.out.println("2. Check Grades");
          System.out.println("3. Enroll Subject");
          System.out.println("4. View Schedule");
          System.out.println("5. Exit");
          System.out.print("Enter your choice: ");

          choice = input.nextInt();

          // Switch statement to handle choice
          switch (choice) {
            case 1:
              System.out.println("You selected: View Profile");
              break;

            case 2:
              System.out.println("You selected: Check Grades");
              break;

            case 3:
              System.out.println("You selected: Enroll Subject");
              break;

            case 4:
              System.out.println("You selected: View Schedule");
              break;

            case 5:
              System.out.println("Exiting program. Goodbye!");
              input.close();
              return; // exits the program

            default:
              System.out.println("Invalid choice. Please try again.");
          }
        }
      }
    }
    `,
      hints: [
        'Use a while loop for menu repetition',
        'Switch statement for choice handling',
        'Don\'t forget break statements in switch cases'
      ],
      expectedOutput: `=== Main Menu ===
1. View Profile
2. Check Balance
3. Update Settings
4. Help
5. Exit

Enter your choice: 2
Your current balance is $1,250.00

Continue? (y/n): n
Thank you!`,
      points: 75
    },
    {
      id: 'beginner-ex-2-3',
      title: 'Sum of Numbers Calculator',
      description: 'Calculate the sum of numbers from 1 to N using loops.',
      difficulty: 'Easy',
      instructions: [
        'Prompt user for a number N',
        'Use a for loop to calculate sum of 1 to N',
        'Display the result',
        'Add bonus: calculate the average as well',
        'Handle edge cases (negative numbers, zero)'
      ],
      starterCode: `import java.util.Scanner;

    public class SumCalculator {

      // ===== HINT SECTION =====
      /*
       * HINTS:
       * 1. Use Scanner to get input from the user.
       * 2. Ask the user to enter a positive number (n > 0).
       * 3. Check if the input is valid:
       *    - If n <= 0, display an invalid input message.
       * 4. Initialize a sum variable to 0.
       * 5. Use a for loop to add all numbers from 1 to n.
       * 6. Calculate the average by dividing the sum by n (cast to double for accuracy).
       * 7. Display both the sum and the average.
       * 8. Remember to close the Scanner at the end.
       */

      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // TODO: Ask the user for a number
        System.out.print("Enter a number: ");
        int n = input.nextInt();

        // TODO: Check if the number is valid
        if (n <= 0) {
          // Hint: Display a message for invalid input
        } else {
          // TODO: Initialize sum variable
          int sum = 0;

          // TODO: Use a for loop to sum numbers from 1 to n
          for (int i = 1; i <= n; i++) {
            // Hint: Add i to sum
          }

          // TODO: Calculate average
          double average = 0; // Hint: sum divided by n (cast to double)

          // TODO: Display sum and average
          // Hint: Use System.out.println
        }

        // TODO: Close the Scanner
        input.close();
      }
    }
    `,

      hints: [
        'Initialize sum variable to 0 before loop',
        'Use for loop from 1 to N',
        'Average = sum / count'
      ],
      expectedOutput: `Enter a number: 10
    Sum from 1 to 10 is: 55
    Average is: 5.5`,
      solutionCode: `import java.util.Scanner;

    public class SumCalculator {
      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // Ask the user for a number
        System.out.print("Enter a number: ");
        int n = input.nextInt();

        // Check if the number is valid
        if (n <= 0) {
          System.out.println("Invalid input. Please enter a number greater than 0.");
        } else {

          // Initialize sum variable
          int sum = 0;

          // Use a for loop to add numbers from 1 to n
          for (int i = 1; i <= n; i++) {
            sum = sum + i;
          }

          // Calculate the average
          double average = sum / (double) n;

          // Display the results
          System.out.println("Sum from 1 to " + n + " is: " + sum);
          System.out.println("Average is: " + average);
        }

        // Close the scanner
        input.close();
      }
    }
    `,
      points: 50
    },
    {
      id: 'beginner-ex-2-4',
      title: 'Multiplication Table Generator',
      description: 'Generate multiplication tables using nested loops.',
      difficulty: 'Medium',
      instructions: [
        'Prompt user for table size (e.g., 10 for 10x10)',
        'Use nested loops to generate the table',
        'Format output for readability (aligned columns)',
        'Add row and column headers',
        'Use printf for formatting'
      ],
      starterCode: `import java.util.Scanner;

    public class SimpleMultiplicationTable {

      // ===== HINT SECTION =====
      /*
       * HINTS:
       * 1. Use Scanner to get input from the user for the size of the table.
       * 2. Use nested for loops to generate the multiplication table:
       *    - Outer loop (i): represents each row, from 1 to size
       *    - Inner loop (j): represents each column in a row, from 1 to size
       *    - Multiply i * j to get each cell's value
       *    - Print each value followed by a space
       * 3. After completing a row (inner loop), print a newline to move to the next row.
       * 4. Close the Scanner at the end.
       * 
       * EXTRA TIPS:
       * - Make sure the loops start at 1, not 0, to get correct multiplication.
       * - Think of the table as a grid: outer loop = rows, inner loop = columns.
       * - Use System.out.print inside inner loop, System.out.println after inner loop.
       */

      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // TODO: Ask the user for table size
        System.out.print("Enter table size: ");
        int size = input.nextInt();

        // ===== MULTIPLICATION TABLE LOOP =====
        for (int i = 1; i <= size; i++) {       // Hint: outer loop iterates over rows
          for (int j = 1; j <= size; j++) {   // Hint: inner loop iterates over columns
            // TODO: Print the product of i and j
            System.out.print(i * j + " ");  // Hint: multiply i * j
          }
          // TODO: Move to the next row after inner loop
          System.out.println();               // Hint: prints a newline
        }

        // TODO: Close the scanner
        input.close();
      }
    }`,
      solutionCode: `import java.util.Scanner;

    public class SimpleMultiplicationTable {
      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        
        // Ask for the size of the table
        System.out.print("Enter table size: ");
        int size = input.nextInt();
        
        // Print the multiplication table
        for (int i = 1; i <= size; i++) {
          for (int j = 1; j <= size; j++) {
            System.out.print(i * j + " ");
          }
          System.out.println(); // Move to next row
        }
        
        input.close();
      }
    }
    `,
      expectedOutput: `    1   2   3   4   5
1   1   2   3   4   5
2   2   4   6   8  10
3   3   6   9  12  15
4   4   8  12  16  20
5   5  10  15  20  25`,
      hints: [
        'Use nested for loops',
        'printf with %4d for column alignment',
        'Outer loop for rows, inner loop for columns'
      ],
      points: 75
    }
  ],

  assessmentProject: {
    id: 'beginner-project-2',
    title: 'Simple Student Life Helper',
    description: 'Create a comprehensive program that analyzes numbers using operators, conditionals, and loops.',
    objectives: [
      'Implement complex conditional logic',
      'Use loops effectively for number processing',
      'Apply operators in meaningful calculations',
      'Create an interactive user experience',
      'Demonstrate debugging skills'
    ],
    requirements: [
      'Create a menu-driven program with at least 4 options',
      'Option 1: Check if number is prime',
      'Option 2: Calculate factorial',
      'Option 3: Generate Fibonacci sequence up to N terms',
      'Option 4: Find all factors of a number',
      'Use switch statement for menu handling',
      'Use appropriate loops for each operation',
      'Include input validation and error handling',
      'Format output professionally',
      'Add comments explaining logic'
    ],
    starterCode: `import java.util.Scanner;

  /**
   * Simple Student Life Helper - Beginner Version
   */
  public class StudentLifeHelperSimple {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // ===== TITLE =====
      System.out.println("╔════════════════════════════════════╗");
      System.out.println("║       Student Life Helper         ║");
      System.out.println("╚════════════════════════════════════╝");

      // ===== GET USER INFO =====
      System.out.print("Enter your name: ");
      // Variable to store user name: name

      System.out.print("Enter your age: ");
      // Variable to store user age: age

      // ===== AGE-BASED GREETING =====
      // if-else Structure Examples:
      // Hi Alice! You're a young learner!       (age <= 12)
      // Hey Bob! Enjoy your teen years!         (13 <= age <= 19)
      // Hello Carol! Keep learning as an adult! (20 <= age <= 64)
      // Greetings Dave! Learning is lifelong!  (age >= 65)

      // ===== MENU LOOP =====
      boolean running = true;
      while (running) {
        System.out.println("\n=== MENU ===");
        System.out.println("1. Log your study points");
        System.out.println("2. Check your energy");
        System.out.println("3. Exit");
        System.out.print("Choose an option: ");
        // Variable for menu choice: choice

        // ===== SWITCH CASE MENU =====
        switch (choice) {
          case 1:
            System.out.print("How many points did you earn today? ");
            // Variable for points earned: points

            // SOUT Example:
            // Great! You earned 10 points today.
            System.out.println("Great! You earned " + points + " points today.");
            break;

          case 2:
            // Age-based energy examples:
            // "You have lots of energy to learn and play!"  (age <= 12)
            // "Teen energy: study and have fun!"           (13 <= age <= 19)
            // "Adult energy: steady and focused!"          (20 <= age <= 64)
            // "Golden years energy: wise and experienced!" (age >= 65)
            // Don't forget to add break

          case 3:
            System.out.println("Goodbye, " + name + "! Keep learning!");
            running = false;
            break;

          default:
            // SOUT Example:
            // Invalid choice. Pick 1-3.
        }
      }

      // Close Scanner
      input.close();
    }
  }`,
    solutionCode: `import java.util.Scanner;

  /**
   * Simple Student Life Helper - Beginner Version
   * Author: [Your Name]
   * Description: Interactive program for age-based greeting and study points
   */
  public class StudentLifeHelperSimple {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // Decorative title
      System.out.println("╔════════════════════════════════════╗");
      System.out.println("║       Student Life Helper         ║");
      System.out.println("╚════════════════════════════════════╝");

      System.out.print("Enter your name: ");
      String name = input.nextLine();

      System.out.print("Enter your age: ");
      int age = input.nextInt();

      // Simple age-based greeting
      if (age <= 12) {
        System.out.println("Hi " + name + "! You're a young learner!");
      } else if (age <= 19) {
        System.out.println("Hey " + name + "! Enjoy your teen years!");
      } else if (age <= 64) {
        System.out.println("Hello " + name + "! Keep learning as an adult!");
      } else {
        System.out.println("Greetings " + name + "! Learning is lifelong!");
      }

      // Menu loop
      boolean running = true;
      while (running) {
        System.out.println("\n=== MENU ===");
        System.out.println("1. Log your study points");
        System.out.println("2. Check your energy");
        System.out.println("3. Exit");
        System.out.print("Choose an option: ");
        int choice = input.nextInt();

        switch (choice) {
          case 1:
            System.out.print("How many points did you earn today? ");
            int points = input.nextInt();
            System.out.println("Great! You earned " + points + " points today.");
            break;
          case 2:
            if (age <= 12) {
              System.out.println("You have lots of energy to learn and play!");
            } else if (age <= 19) {
              System.out.println("Teen energy: study and have fun!");
            } else if (age <= 64) {
              System.out.println("Adult energy: steady and focused!");
            } else {
              System.out.println("Golden years energy: wise and experienced!");
            }
            break;
          case 3:
            System.out.println("Goodbye, " + name + "! Keep learning!");
            running = false;
            break;
          default:
            System.out.println("Invalid choice. Pick 1-3.");
        }
      }

      input.close();
    }
  }
  `,
    expectedFeatures: [
      'Working menu system with all 4 analysis options',
      'Prime number checker using loop and conditionals',
      'Factorial calculator with loop',
      'Fibonacci sequence generator',
      'Factor finder displaying all factors',
      'Input validation for each operation',
      'Professional output formatting',
      'Comprehensive comments'
    ],
    estimatedTime: '60-90 minutes',
    difficulty: 'Medium',
    points: 150
  }
};

// Helper functions for modules 1 and 2
export const getBeginnerModuleById = (id: string): DetailedModule | undefined => {
  const modules = [module1, module2];
  return modules.find(module => module.id === id);
};

export const getExerciseById = (exerciseId: string): { module: DetailedModule; exercise: Exercise } | undefined => {
  const modules = [module1, module2];
  for (const module of modules) {
    const exercise = module.handsOnExercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      return { module, exercise };
    }
  }
  return undefined;
};

export const getProjectByModuleId = (moduleId: string): Project | undefined => {
  const module = getBeginnerModuleById(moduleId);
  return module?.assessmentProject;
};