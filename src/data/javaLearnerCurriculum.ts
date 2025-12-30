/**
 * Comprehensive Java Programming Learner Track Curriculum
 * Modules 5-8: Advanced OOP and File Handling
 * Self-Paced Online Learning Module Using NetBeans IDE
 * 
 * This curriculum covers advanced object-oriented programming concepts,
 * inheritance, polymorphism, interfaces, abstract classes, exception handling,
 * and file I/O operations.
 */

import type { DetailedModule, DetailedLesson, Exercise, Project } from './javaBeginnerCurriculum';

// Module 5: Object-Oriented Programming Basics - Classes and Objects
export const module5: DetailedModule = {
  id: 'learner-module-5',
  week: 5,
  title: 'Object-Oriented Programming Basics - Classes and Objects',
  description: 'Transition from procedural to object-oriented programming by mastering classes, objects, constructors, and encapsulation. Learn to design and implement real-world entities as software objects with attributes and behaviors.',
  category: 'Learner',
  requiredLevel: 'Learner',
  estimatedHours: 5,
  objectives: [
    'Understand object-oriented programming paradigm and its advantages',
    'Design and implement classes with attributes and methods',
    'Create and manipulate objects effectively',
    'Master constructor overloading and object initialization',
    'Apply encapsulation principles with access modifiers',
    'Implement getter and setter methods following best practices'
  ],
  learningPhilosophy: 'This week marks a paradigm shift from procedural programming to object-oriented design. You\'ll learn to think in terms of objects, understanding how real-world entities can be modeled as software components with state and behavior.',
  theoreticalFoundation: [
    'Object-Oriented Programming (OOP) organizes code around objects rather than actions',
    'Classes serve as blueprints or templates for creating objects',
    'Objects are instances of classes, representing specific entities with their own state and behavior',
    'Encapsulation bundles data and methods within a single unit, hiding internal details',
    'The "this" keyword refers to the current object instance',
    'Constructors are special methods that initialize objects when created'
  ],
  lessons: [
    {
      id: 'learner-lesson-5-1',
      title: 'Introduction to Object-Oriented Programming Paradigm',
      description: 'Understand the shift from procedural to object-oriented programming and learn why OOP is fundamental to modern software development.',
      duration: '45 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Procedural vs Object-Oriented Programming',
        'OOP Principles: Encapsulation, Inheritance, Polymorphism, Abstraction',
        'Real-world modeling with objects'
      ],
      theoreticalFoundation: [
        'Procedural programming organizes code as a sequence of procedures, while OOP organizes it around objects',
        'Objects combine data and behavior into cohesive units',
        'OOP promotes code reusability, modularity, and maintainability'
      ],
      netBeansGuidance: [
        'Create a new Java project: File > New Project > Java Application',
        'Observe how NetBeans automatically creates a main class',
        'Use the Navigator window to view class structure'
      ],
      codeExamples: [
        {
          title: 'OOP Basic Example',
          description: 'Simple class demonstrating OOP concepts',
          code: 'class BankAccount {\n    private String accountNumber;\n    private double balance;\n    \n    public void deposit(double amount) {\n        this.balance += amount;\n    }\n}',
          explanation: 'In OOP, related data and operations are bundled together in a class.'
        }
      ],
      practiceExercises: [
        'Identify three real-world entities and list their attributes and behaviors',
        'Research examples of how OOP is used in popular software'
      ]
    },
    {
      id: 'learner-lesson-5-2',
      title: 'Defining Classes and Creating Objects',
      description: 'Learn to design classes as blueprints and instantiate objects with proper structure.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Class definition syntax',
        'Attributes and methods',
        'Object instantiation with new keyword'
      ],
      theoreticalFoundation: [
        'A class is a blueprint that defines the structure and behavior of objects',
        'Objects are instances of classes created using the "new" keyword'
      ],
      netBeansGuidance: [
        'Create a new Java Class: Right-click package > New > Java Class',
        'Use code completion (Ctrl+Space) to auto-generate method signatures'
      ],
      codeExamples: [
        {
          title: 'Creating Objects',
          description: 'How to create and use objects',
          code: 'Car car1 = new Car();\ncar1.brand = "Toyota";\ncar1.displayInfo();',
          explanation: 'Each object is an independent instance with its own attribute values.'
        }
      ],
      practiceExercises: [
        'Create a Product class with attributes and methods',
        'Create multiple objects and test functionality'
      ]
    }
  ],
  handsOnExercises: [
    {
      id: 'learner-exercise-5-1',
      title: 'Student Grade System',
      description: 'Create a Student class with proper encapsulation, constructors, and methods to manage student grades.',
      difficulty: 'Medium' as const,
      instructions: [
        'Create a Student class with private fields: studentId, name, grade1, grade2, grade3',
        'Implement a parameterized constructor to initialize all fields',
        'Add getter and setter methods with validation',
        'Create a calculateAverage() method that returns the average of three grades',
        'In main method, create 3 Student objects and display their information'
      ],
      starterCode: 'public class Student {\n    // Add your fields here\n    \n    public static void main(String[] args) {\n        // Create and test Student objects\n    }\n}',
      expectedOutput: 'Student ID: 101, Name: Alice\nGrades: 85.0, 90.0, 88.0\nAverage: 87.67',
      hints: [
        'Use private access modifier for all fields',
        'In setters, use if statements to validate grade range',
        'Remember to use "this" keyword in constructors'
      ],
      points: 50
    },
    {
      id: 'learner-exercise-5-2',
      title: 'Bank Account Management',
      description: 'Design a BankAccount class demonstrating encapsulation and business logic methods.',
      difficulty: 'Medium' as const,
      instructions: [
        'Create BankAccount class with: accountNumber, accountHolder, balance (all private)',
        'Create deposit() and withdraw() methods with validation',
        'Test with multiple accounts and transactions'
      ],
      starterCode: 'public class BankAccount {\n    // TODO: Add private fields\n    \n    public static void main(String[] args) {\n        // Test your BankAccount class\n    }\n}',
      expectedOutput: 'Account: 12345, Holder: Alice, Balance: $1000.00',
      hints: [
        'Always validate amounts before modifying balance',
        'Print appropriate messages for successful/failed transactions'
      ],
      points: 60
    }
  ],
  assessmentProject: {
    id: 'learner-project-5',
    title: 'Library Management System',
    description: 'Design and implement a comprehensive library management system demonstrating all OOP basics concepts.',
    objectives: [
      'Design multiple interacting classes with proper encapsulation',
      'Implement constructor overloading and initialization',
      'Apply getter/setter methods with validation',
      'Demonstrate object composition (HAS-A relationships)',
      'Create methods that accept and return objects',
      'Build a functional system with user interaction'
    ],
    requirements: [
      'Create Book, Member, and Library classes',
      'Implement proper encapsulation with validation',
      'Add constructor overloading',
      'Implement borrow and return functionality',
      'Create menu-driven interface',
      'Handle edge cases appropriately'
    ],
    starterCode: '',
    expectedFeatures: [
      'Fully functional Book and Member classes',
      'Library class managing collections',
      'Working borrow/return system',
      'Menu-driven interface',
      'Comprehensive error handling'
    ],
    estimatedTime: '120-180 minutes',
    difficulty: 'Medium',
    points: 200
  }
};

// Module 6: Inheritance and Polymorphism
export const module6: DetailedModule = {
  id: 'learner-module-6',
  week: 6,
  title: 'Inheritance and Polymorphism - Advanced OOP Concepts',
  description: 'Master inheritance hierarchies, method overriding, and polymorphic behavior to create flexible and reusable code.',
  category: 'Learner',
  requiredLevel: 'Learner',
  estimatedHours: 5,
  objectives: [
    'Understand and implement inheritance hierarchies',
    'Master extends and super keyword usage',
    'Implement method overriding and runtime polymorphism',
    'Create and use abstract classes',
    'Apply the Liskov Substitution Principle',
    'Design flexible class hierarchies'
  ],
  learningPhilosophy: 'Inheritance and polymorphism are cornerstones of OOP that enable code reuse and flexible design.',
  theoreticalFoundation: [
    'Inheritance allows classes to inherit properties from parent classes',
    'The IS-A relationship defines inheritance',
    'Polymorphism enables objects to take multiple forms',
    'Method overriding provides specific implementations',
    'The super keyword accesses parent class members',
    'Abstract classes define common behavior while enforcing subclass implementation'
  ],
  lessons: [
    {
      id: 'learner-lesson-6-1',
      title: 'Understanding Inheritance in Java',
      description: 'Master the concept of inheritance and learn how to create class hierarchies.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Inheritance basics and IS-A relationship',
        'extends keyword',
        'super keyword usage',
        'Method inheritance'
      ],
      theoreticalFoundation: [
        'Inheritance allows a class to acquire properties and methods of another class',
        'The IS-A test validates inheritance: Dog IS-A Animal, Car IS-A Vehicle',
        'Parent class (superclass) provides common functionality, child class (subclass) adds specifics'
      ],
      netBeansGuidance: [
        'Create parent and child classes in same package',
        'Use code completion to see inherited methods',
        'Navigate between parent and child with Ctrl+Click'
      ],
      codeExamples: [
        {
          title: 'Basic Inheritance',
          description: 'Simple inheritance example',
          code: 'class Animal {\n    String name;\n    void eat() {\n        System.out.println(name + " is eating");\n    }\n}\n\nclass Dog extends Animal {\n    void bark() {\n        System.out.println(name + " is barking");\n    }\n}',
          explanation: 'Dog inherits the name field and eat() method from Animal, and adds its own bark() method.'
        }
      ],
      practiceExercises: [
        'Create a Vehicle hierarchy with Car and Motorcycle subclasses',
        'Identify which methods should be in parent vs child classes'
      ]
    },
    {
      id: 'learner-lesson-6-2',
      title: 'Polymorphism and Method Overriding',
      description: 'Learn how polymorphism enables flexible and extensible code.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Runtime polymorphism',
        'Method overriding with @Override',
        'Dynamic method dispatch',
        'Polymorphic references'
      ],
      theoreticalFoundation: [
        'Polymorphism allows objects of different types to be treated uniformly',
        'Method overriding lets subclasses provide specific implementations',
        '@Override annotation ensures proper override syntax'
      ],
      netBeansGuidance: [
        'NetBeans shows override indicators in the margin',
        'Use @Override annotation for safety',
        'Alt+Insert can generate override methods'
      ],
      codeExamples: [
        {
          title: 'Polymorphism Example',
          description: 'Using polymorphic references',
          code: 'Animal animal1 = new Dog();\nAnimal animal2 = new Cat();\nanimal1.makeSound(); // Calls Dog\'s version\nanimal2.makeSound(); // Calls Cat\'s version',
          explanation: 'Parent type references can point to child objects, enabling flexible code.'
        }
      ],
      practiceExercises: [
        'Create a Shape hierarchy with polymorphic calculateArea() methods',
        'Test polymorphism with an array of different shapes'
      ]
    }
  ],
  handsOnExercises: [
    {
      id: 'learner-exercise-6-1',
      title: 'Employee Hierarchy System',
      description: 'Create an inheritance hierarchy for different employee types.',
      difficulty: 'Medium' as const,
      instructions: [
        'Create an Employee base class with: name, id, baseSalary',
        'Create Manager subclass that adds bonus field',
        'Create Developer subclass that adds programmingLanguage field',
        'Override calculatePay() in each subclass with different logic',
        'Test polymorphism by storing different employees in an array'
      ],
      starterCode: 'class Employee {\n    // TODO: Add fields and methods\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Create and test employees\n    }\n}',
      expectedOutput: 'Manager Alice - Pay: $8000.00\nDeveloper Bob - Pay: $6500.00',
      hints: [
        'Use @Override annotation when overriding methods',
        'Manager pay = baseSalary + bonus',
        'Use polymorphic array: Employee[] employees'
      ],
      points: 60
    },
    {
      id: 'learner-exercise-6-2',
      title: 'Shape Polymorphism',
      description: 'Implement a shape hierarchy demonstrating polymorphism.',
      difficulty: 'Medium' as const,
      instructions: [
        'Create abstract Shape class with abstract calculateArea() method',
        'Create Circle, Rectangle, and Triangle subclasses',
        'Each subclass implements calculateArea() differently',
        'Create an array of shapes and calculate total area'
      ],
      starterCode: 'abstract class Shape {\n    abstract double calculateArea();\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Test shapes\n    }\n}',
      expectedOutput: 'Circle area: 78.54\nRectangle area: 24.00\nTotal area: 102.54',
      hints: [
        'Use Math.PI for circle calculations',
        'Store shapes in Shape[] array for polymorphism',
        'Loop through array calling calculateArea() on each'
      ],
      points: 65
    }
  ],
  assessmentProject: {
    id: 'learner-project-6',
    title: 'Vehicle Rental Management System',
    description: 'Design a comprehensive vehicle rental system demonstrating inheritance and polymorphism.',
    objectives: [
      'Design multi-level inheritance hierarchy',
      'Implement abstract classes with template methods',
      'Apply polymorphism for flexible vehicle management',
      'Override methods with specific behavior',
      'Create rental management using OOP principles'
    ],
    requirements: [
      'Create abstract Vehicle base class',
      'Implement concrete vehicle types (Car, Motorcycle, Truck)',
      'Unique rental rate calculation per type',
      'RentalAgency class for inventory',
      'Rental and return functionality',
      'Polymorphic vehicle management'
    ],
    starterCode: '',
    expectedFeatures: [
      'Abstract Vehicle class',
      'Multiple concrete vehicle types',
      'Polymorphic rental calculations',
      'Complete rental management',
      'Professional documentation'
    ],
    estimatedTime: '3-4 hours',
    difficulty: 'Hard',
    points: 200
  }
};

// Module 7: Interfaces and Abstract Classes
export const module7: DetailedModule = {
  id: 'learner-module-7',
  week: 7,
  title: 'Interfaces and Abstract Classes - Designing Flexible Systems',
  description: 'Master interfaces and abstract classes to create flexible, maintainable systems with behavioral contracts.',
  category: 'Learner',
  requiredLevel: 'Learner',
  estimatedHours: 5,
  objectives: [
    'Design and implement interfaces for behavioral contracts',
    'Master multiple interface implementation',
    'Create and utilize abstract classes effectively',
    'Understand when to use interfaces vs abstract classes',
    'Apply interface segregation principle',
    'Implement default and static methods in interfaces'
  ],
  learningPhilosophy: 'This week focuses on advanced abstraction techniques for flexible, scalable software design.',
  theoreticalFoundation: [
    'Interfaces define contracts without implementation details',
    'Abstract classes provide partial implementation',
    'Multiple interface implementation enables polymorphic behavior',
    'Program to interfaces, not implementations',
    'Interface segregation: clients shouldn\'t depend on unused methods',
    'Default methods allow interface evolution',
    'Choose abstract classes for shared code; interfaces for common behavior'
  ],
  lessons: [
    {
      id: 'learner-lesson-7-1',
      title: 'Introduction to Interfaces',
      description: 'Learn to define and implement interfaces for creating behavioral contracts.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Interface definition and syntax',
        'Implementing interfaces',
        'Multiple interface implementation',
        'Interface constants'
      ],
      theoreticalFoundation: [
        'Interfaces define what a class must do, not how it does it',
        'All interface methods are implicitly public and abstract',
        'A class can implement multiple interfaces',
        'Interfaces enable loose coupling and high cohesion'
      ],
      netBeansGuidance: [
        'Create interface: Right-click package > New > Java Interface',
        'Implement interface: type "implements InterfaceName" after class name',
        'Alt+Insert shows "Implement all abstract methods" option'
      ],
      codeExamples: [
        {
          title: 'Interface Implementation',
          description: 'Basic interface usage',
          code: 'interface Flyable {\n    void fly();\n    void land();\n}\n\nclass Airplane implements Flyable {\n    public void fly() {\n        System.out.println("Airplane flying");\n    }\n    public void land() {\n        System.out.println("Airplane landing");\n    }\n}',
          explanation: 'Classes implementing an interface must provide implementations for all its methods.'
        }
      ],
      practiceExercises: [
        'Create a Playable interface for media items',
        'Implement it in Music and Video classes'
      ]
    },
    {
      id: 'learner-lesson-7-2',
      title: 'Abstract Classes vs Interfaces',
      description: 'Understand when to use abstract classes versus interfaces.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Abstract class features',
        'Choosing between abstract class and interface',
        'Combining abstract classes and interfaces',
        'Template method pattern'
      ],
      theoreticalFoundation: [
        'Abstract classes can have concrete methods; interfaces traditionally cannot',
        'A class can extend only one abstract class but implement multiple interfaces',
        'Use abstract classes for IS-A relationships with shared code',
        'Use interfaces for CAN-DO capabilities'
      ],
      netBeansGuidance: [
        'Abstract classes marked with different icon in Navigator',
        'Cannot instantiate abstract classes directly',
        'Must implement all abstract methods in concrete subclasses'
      ],
      codeExamples: [
        {
          title: 'Abstract Class Example',
          description: 'Using abstract classes for shared behavior',
          code: 'abstract class Payment {\n    protected double amount;\n    \n    public abstract void processPayment();\n    \n    public void printReceipt() {\n        System.out.println("Payment: $" + amount);\n    }\n}',
          explanation: 'Abstract classes can mix concrete and abstract methods, providing common functionality.'
        }
      ],
      practiceExercises: [
        'Create an abstract class with template method pattern',
        'Compare with interface-based design'
      ]
    }
  ],
  handsOnExercises: [
    {
      id: 'learner-exercise-7-1',
      title: 'Payment Processing System',
      description: 'Create a payment system using interfaces for different payment methods.',
      difficulty: 'Medium' as const,
      instructions: [
        'Create a Payable interface with processPayment() and getPaymentDetails() methods',
        'Implement CreditCard, PayPal, and BankTransfer classes',
        'Each class implements payment processing differently',
        'Create a PaymentProcessor that accepts any Payable object',
        'Test with different payment types'
      ],
      starterCode: 'interface Payable {\n    void processPayment(double amount);\n    String getPaymentDetails();\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Test payment system\n    }\n}',
      expectedOutput: 'Processing credit card payment: $100.00\nProcessing PayPal payment: $50.00',
      hints: [
        'All implementing classes must define both interface methods',
        'Use polymorphic reference: Payable payment',
        'Store different payment types in Payable array'
      ],
      points: 65
    },
    {
      id: 'learner-exercise-7-2',
      title: 'Media Player with Interfaces',
      description: 'Build a media player system using multiple interfaces.',
      difficulty: 'Hard' as const,
      instructions: [
        'Create Playable interface with play(), pause(), stop() methods',
        'Create Downloadable interface with download() method',
        'Create Video class implementing both interfaces',
        'Create Audio class implementing only Playable',
        'Test polymorphism with both interface types'
      ],
      starterCode: 'interface Playable {\n    void play();\n    void pause();\n}\n\ninterface Downloadable {\n    void download();\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        // Test media player\n    }\n}',
      expectedOutput: 'Playing video...\nDownloading video...\nPlaying audio...',
      hints: [
        'Video implements both: class Video implements Playable, Downloadable',
        'Can use both reference types: Playable p = new Video()',
        'Check instance type with instanceof before calling specific methods'
      ],
      points: 70
    }
  ],
  assessmentProject: {
    id: 'learner-project-7',
    title: 'Notification System with Interfaces and Abstract Classes',
    description: 'Design a comprehensive notification system demonstrating interfaces, abstract classes, and design patterns.',
    objectives: [
      'Design flexible system using interfaces and abstract classes',
      'Implement multiple notification channels',
      'Apply interface segregation principle',
      'Use template method pattern',
      'Demonstrate composition and polymorphism',
      'Implement Strategy pattern for message formatting'
    ],
    requirements: [
      'Create Notifiable, Trackable, and Formattable interfaces',
      'Create abstract BaseNotification class',
      'Implement Email, SMS, and Push notifications',
      'Create MessageFormatter strategies',
      'Implement NotificationManager',
      'Use default methods appropriately'
    ],
    starterCode: '',
    expectedFeatures: [
      'Complete interface definitions',
      'Abstract class with template method',
      'Three concrete notification types',
      'Working retry logic',
      'Strategy pattern implementation',
      'Comprehensive documentation'
    ],
    estimatedTime: '90-120 minutes',
    difficulty: 'Hard',
    points: 200
  }
};

// Module 8: Exception Handling and File I/O
export const module8: DetailedModule = {
  id: 'learner-module-8',
  week: 8,
  title: 'Exception Handling and File I/O - Building Robust Applications',
  description: 'Master exception handling and file operations to create resilient applications that handle errors gracefully.',
  category: 'Learner',
  requiredLevel: 'Learner',
  estimatedHours: 5,
  objectives: [
    'Master try-catch-finally exception handling',
    'Understand checked vs unchecked exceptions',
    'Create custom exception classes',
    'Implement robust file I/O operations',
    'Use try-with-resources for resource management',
    'Apply exception handling best practices'
  ],
  learningPhilosophy: 'Building bulletproof applications that handle errors gracefully and work reliably with external resources.',
  theoreticalFoundation: [
    'Exceptions represent abnormal conditions',
    'Java\'s exception hierarchy: checked vs unchecked',
    'Proper exception handling separates error-handling from business logic',
    'Try-catch-finally ensures resource cleanup',
    'Custom exceptions provide domain-specific error information',
    'File I/O requires comprehensive exception handling',
    'Try-with-resources prevents memory leaks'
  ],
  lessons: [
    {
      id: 'learner-lesson-8-1',
      title: 'Exception Handling Basics',
      description: 'Learn to handle errors gracefully using try-catch-finally blocks.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'Exception hierarchy',
        'try-catch-finally syntax',
        'Checked vs unchecked exceptions',
        'Multiple catch blocks',
        'throw and throws keywords'
      ],
      theoreticalFoundation: [
        'Exceptions are objects representing error conditions',
        'Checked exceptions must be handled or declared with throws',
        'Unchecked exceptions (RuntimeException) don\'t require explicit handling',
        'finally block always executes, ideal for cleanup',
        'catch blocks are checked in order from specific to general'
      ],
      netBeansGuidance: [
        'NetBeans highlights unhandled exceptions',
        'Alt+Enter shows quick fix to add try-catch or throws',
        'Use code template "try" + Tab for try-catch structure',
        'Warnings appear for empty catch blocks'
      ],
      codeExamples: [
        {
          title: 'Basic Exception Handling',
          description: 'Using try-catch to handle errors',
          code: 'try {\n    int result = 10 / 0; // ArithmeticException\n} catch (ArithmeticException e) {\n    System.out.println("Cannot divide by zero!");\n} finally {\n    System.out.println("Cleanup code runs always");\n}',
          explanation: 'The catch block handles the exception, preventing program crash. Finally executes regardless of exception.'
        }
      ],
      practiceExercises: [
        'Write code that handles array index out of bounds',
        'Create method that throws checked exception'
      ]
    },
    {
      id: 'learner-lesson-8-2',
      title: 'File I/O Operations',
      description: 'Learn to read from and write to files with proper exception handling.',
      duration: '60 minutes',
      difficulty: 'Intermediate' as const,
      concepts: [
        'File class and file operations',
        'Reading from files with Scanner',
        'Writing to files with PrintWriter',
        'try-with-resources syntax',
        'File paths and existence checking'
      ],
      theoreticalFoundation: [
        'File I/O operations can fail due to permissions, missing files, disk space',
        'Always use try-with-resources for automatic resource closing',
        'Scanner reads files line by line',
        'PrintWriter writes formatted text to files',
        'Check file existence before attempting to read'
      ],
      netBeansGuidance: [
        'Import java.io.* for file operations',
        'NetBeans shows import suggestions automatically',
        'Use project files for testing (right-click project > New > Other > Empty File)',
        'Output files appear in project directory'
      ],
      codeExamples: [
        {
          title: 'Reading from File',
          description: 'Using try-with-resources to read files',
          code: 'try (Scanner scanner = new Scanner(new File("data.txt"))) {\n    while (scanner.hasNextLine()) {\n        String line = scanner.nextLine();\n        System.out.println(line);\n    }\n} catch (FileNotFoundException e) {\n    System.out.println("File not found!");\n}',
          explanation: 'Try-with-resources automatically closes the Scanner, preventing resource leaks.'
        }
      ],
      practiceExercises: [
        'Write a program that counts lines in a text file',
        'Create a program that copies content from one file to another'
      ]
    }
  ],
  handsOnExercises: [
    {
      id: 'learner-exercise-8-1',
      title: 'Safe Calculator',
      description: 'Create a calculator that handles all possible exceptions gracefully.',
      difficulty: 'Medium' as const,
      instructions: [
        'Create a Calculator class with methods: add, subtract, multiply, divide',
        'Divide method should throw ArithmeticException for division by zero',
        'Add input validation and throw IllegalArgumentException for invalid inputs',
        'Create a menu-driven program that catches all exceptions',
        'Display user-friendly error messages for each exception type'
      ],
      starterCode: 'public class Calculator {\n    public double divide(double a, double b) throws ArithmeticException {\n        // TODO: Implement with exception\n    }\n    \n    public static void main(String[] args) {\n        // TODO: Test with exception handling\n    }\n}',
      expectedOutput: 'Enter operation: divide\nEnter numbers: 10 0\nError: Cannot divide by zero!',
      hints: [
        'Use throw new ArithmeticException("message") to throw exception',
        'Wrap user input code in try-catch',
        'Use multiple catch blocks for different exception types'
      ],
      points: 60
    },
    {
      id: 'learner-exercise-8-2',
      title: 'Student Data File Manager',
      description: 'Create a program that saves and loads student data from files.',
      difficulty: 'Hard' as const,
      instructions: [
        'Create Student class with: id, name, gpa',
        'Write saveToFile() method using PrintWriter',
        'Write loadFromFile() method using Scanner',
        'Use try-with-resources for all file operations',
        'Handle FileNotFoundException and IOException',
        'Test saving array of students and loading them back'
      ],
      starterCode: 'import java.io.*;\nimport java.util.Scanner;\n\nclass Student {\n    // TODO: Add fields and methods\n}\n\npublic class FileManager {\n    public static void saveToFile(Student[] students, String filename) {\n        // TODO: Implement\n    }\n    \n    public static void main(String[] args) {\n        // TODO: Test file operations\n    }\n}',
      expectedOutput: 'Saved 3 students to file\nLoaded 3 students from file\nStudent: 101, Alice, GPA: 3.8',
      hints: [
        'Use try-with-resources: try (PrintWriter writer = new PrintWriter(filename))',
        'Write each field on separate line',
        'Use hasNextLine() in while loop to read all data',
        'Create new Student objects when reading from file'
      ],
      points: 75
    }
  ],
  assessmentProject: {
    id: 'learner-project-8',
    title: 'Student Record Management System',
    description: 'Create a comprehensive student record system with exception handling and file I/O.',
    objectives: [
      'Implement custom exception classes',
      'Use try-with-resources for file operations',
      'Handle multiple exception types',
      'Create, read, update, and delete records',
      'Persist data to files',
      'Provide user-friendly error messages'
    ],
    requirements: [
      'Create custom exception classes',
      'Implement Student class with grades',
      'Menu system with CRUD operations',
      'Store data in text files',
      'Load data on startup',
      'Validate all input',
      'Use try-with-resources',
      'Handle all exceptions gracefully'
    ],
    starterCode: '',
    expectedFeatures: [
      'Complete menu-driven interface',
      'Custom exception classes',
      'Student class with calculations',
      'Full CRUD functionality',
      'File persistence with try-with-resources',
      'Comprehensive exception handling',
      'Input validation',
      'Proper resource management'
    ],
    estimatedTime: '120-150 minutes',
    difficulty: 'Hard',
    points: 200
  }
};

/**
 * Complete Learner Track - Modules 5-8
 * Each module represents approximately one week of study
 */
export const learnerTrack: DetailedModule[] = [
  module5, // Week 5: Object-Oriented Programming Basics
  module6, // Week 6: Inheritance and Polymorphism
  module7, // Week 7: Interfaces and Abstract Classes
  module8  // Week 8: Exception Handling and File I/O
];

/**
 * Get all modules (Beginner + Learner tracks)
 */
export function getAllModules(): DetailedModule[] {
  // This will be combined with beginner track in the main curriculum file
  return learnerTrack;
}

/**
 * Get module by ID
 */
export function getModuleById(moduleId: string): DetailedModule | undefined {
  return learnerTrack.find(m => m.id === moduleId);
}

/**
 * Get module by week number
 */
export function getModuleByWeek(week: number): DetailedModule | undefined {
  return learnerTrack.find(m => m.week === week);
}

/**
 * Check if user can access a module
 */
export function canAccessModule(moduleWeek: number, completedModules: string[]): boolean {
  if (moduleWeek <= 5) return true; // First learner module accessible after beginner track
  
  const previousModule = learnerTrack.find(m => m.week === moduleWeek - 1);
  if (!previousModule) return false;
  
  return completedModules.includes(previousModule.id);
}

/**
 * Get learner track statistics
 */
export function getLearnerTrackStats() {
  return {
    totalModules: learnerTrack.length,
    totalLessons: learnerTrack.reduce((sum, m) => sum + m.lessons.length, 0),
    totalExercises: learnerTrack.reduce((sum, m) => sum + (m.handsOnExercises?.length || 0), 0),
    totalProjects: learnerTrack.filter(m => m.assessmentProject).length,
    estimatedTotalHours: learnerTrack.reduce((sum, m) => sum + m.estimatedHours, 0)
  };
}

/**
 * Export types
 */
export type { DetailedModule, DetailedLesson, Exercise, Project };
