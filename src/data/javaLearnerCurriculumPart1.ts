/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                            ║
 * ║     COMPREHENSIVE JAVA LEARNER TRACK – PART 1 (MODULES 5-6)              ║
 * ║     Based on NetBeans IDE Self-Paced Learning Module                     ║
 * ║                                                                            ║
 * ║     Focus: Object-Oriented Programming Fundamentals                       ║
 * ║     - Module 5: OOP Basics - Classes and Objects                         ║
 * ║     - Module 6: Inheritance and Polymorphism                             ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { DetailedModule } from './comprehensiveBeginnerCurriculum';

// ============================================================================
// MODULE 5: Object-Oriented Programming Basics - Classes and Objects
// ============================================================================

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

  learningPhilosophy: 'This week marks a paradigm shift from procedural programming to object-oriented design. You\'ll learn to think in terms of objects, understanding how real-world entities can be modeled as software components with state and behavior. The emphasis is on practical design patterns and industry-standard practices.',

  theoreticalFoundation: [
    'Object-Oriented Programming (OOP) organizes code around objects rather than actions, and data rather than logic.',
    'Classes serve as blueprints or templates for creating objects, defining their structure and behavior.',
    'Objects are instances of classes, representing specific entities with their own state (attributes) and behavior (methods).',
    'Encapsulation bundles data and methods that operate on that data within a single unit, hiding internal implementation details.',
    'The "this" keyword refers to the current object instance, resolving naming conflicts and improving code clarity.',
    'Constructors are special methods that initialize objects when they are created, ensuring objects start in a valid state.'
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
      starterCode: `import java.util.Arrays;
    public class Student {
      // ===== FIELDS =====
      private int ____;          // student ID
      private String ____;       // student name
      private double[] ____;     // array of grades

      // ===== CONSTRUCTOR =====
      public Student(int ____, String ____, double[] ____) {
        this.id = ____;
        this.name = ____;
        this.grades = ____;
      }

      // ===== GETTERS =====
      public int getId() {
        return ____;
      }

      public String getName() {
        return ____;
      }

      public double[] getGrades() {
        return ____;
      }

      // ===== METHODS =====
      public double getAverage() {
        double sum = 0;
        for (double grade : ____) {
          sum += ____;
        }
        return ____ / grades.length;
      }

      public void displayInfo() {
        System.out.println("Student ID: " + ____ + ", Name: " + ____);
        System.out.println("Grades: " + Arrays.toString(____));
        System.out.printf("Average: %.2f\n", ____);
      }

      // ===== MAIN METHOD FOR TESTING =====
      public static void main(String[] args) {
        double[] aliceGrades = {85.0, 90.0, 88.0};
        Student alice = new Student(____, "____", ____);

        alice.displayInfo();
      }
    }`,
      solutionCode: `import java.util.Arrays;
  public class Student {
    // ===== FIELDS =====
    private int id;
    private String name;
    private double[] grades;

    // ===== CONSTRUCTOR =====
    public Student(int id, String name, double[] grades) {
      this.id = id;
      this.name = name;
      this.grades = grades; // store the array reference
    }

    // ===== GETTERS =====
    public int getId() {
      return id;
    }

    public String getName() {
      return name;
    }

    public double[] getGrades() {
      return grades;
    }

    // ===== METHODS =====
    public double getAverage() {
      double sum = 0;
      for (double grade : grades) {
        sum += grade;
      }
      return sum / grades.length;
    }

    public void displayInfo() {
      System.out.println("Student ID: " + id + ", Name: " + name);
      System.out.println("Grades: " + Arrays.toString(grades));
      System.out.printf("Average: %.2f\n", getAverage());
    }

    // ===== MAIN METHOD FOR TESTING =====
    public static void main(String[] args) {
      double[] aliceGrades = {85.0, 90.0, 88.0};
      Student alice = new Student(101, "Alice", aliceGrades);

      alice.displayInfo();
    }
  }`,
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
      starterCode: `public class BankAccount {
      // ===== PRIVATE FIELDS =====
      // int account number
      // String account holder's name
      // double account balance

      // ===== CONSTRUCTOR =====
      public BankAccount(int ____, String ____, double ____) {
        this.accountNumber = ____;
        this.holderName = ____;
        this.balance = ____;
      }

      // ===== GETTERS =====
      public int getAccountNumber() {
        return ____;
      }

      public String getHolderName() {
        return ____;
      }

      public double getBalance() {
        return ____;
      }

      // ===== BUSINESS METHODS =====
      public void deposit(double amount) {
        if (amount > 0) {
          ____ += ____;  // add deposited amount to balance
        } else {
          System.out.println("Cannot deposit a negative amount.");
        }
      }

      public void withdraw(double amount) {
        if (amount > 0 && amount <= ____) {
          ____ -= ____; // subtract withdrawn amount from balance
        } else {
          System.out.println("Invalid withdrawal amount.");
        }
      }

      public void displayAccountInfo() {
        System.out.printf("Account: %d, Holder: %s, Balance: $%.2f\n",
            ____, ____, ____);
      }

        // ===== MAIN METHOD =====
        public static void main(String[] args) {
        // Create a BankAccount object
        BankAccount aliceAccount = new BankAccount(____, "____", ____);

        // Display account info
        aliceAccount.displayAccountInfo();
        }
      }`,
      solutionCode: `public class BankAccount {
      // ===== PRIVATE FIELDS =====
      private int accountNumber;
      private String holderName;
      private double balance;

      // ===== CONSTRUCTOR =====
      public BankAccount(int accountNumber, String holderName, double balance) {
        this.accountNumber = accountNumber;
        this.holderName = holderName;
        this.balance = balance;
      }

      // ===== GETTERS =====
      public int getAccountNumber() {
        return accountNumber;
      }

      public String getHolderName() {
        return holderName;
      }

      public double getBalance() {
        return balance;
      }

      // ===== BUSINESS METHODS =====
      public void deposit(double amount) {
        if (amount > 0) {
          balance += amount;
        } else {
          System.out.println("Cannot deposit a negative amount.");
        }
      }

      public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
          balance -= amount;
        } else {
          System.out.println("Invalid withdrawal amount.");
        }
      }

      public void displayAccountInfo() {
        System.out.printf("Account: %d, Holder: %s, Balance: $%.2f\n",
            accountNumber, holderName, balance);
      }

      // ===== MAIN METHOD =====
      public static void main(String[] args) {
        // Create a BankAccount object
        BankAccount aliceAccount = new BankAccount(12345, "Alice", 1000.0);

        // Display account info
        aliceAccount.displayAccountInfo();
      }
    }`,
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
    description: 'Design and implement a comprehensive library management system demonstrating all OOP basics concepts including classes, objects, encapsulation, constructors, and object composition.',
    objectives: [
      'Design multiple interacting classes with proper encapsulation',
      'Implement constructor overloading and initialization',
      'Apply getter/setter methods with validation',
      'Demonstrate object composition (HAS-A relationships)',
      'Create methods that accept and return objects',
      'Build a functional system with user interaction'
    ],
    requirements: [
      'Create a Book class with: ISBN, title, author, category, availability status',
      'Create a Member class with: memberId, name, email, phone, borrowed books array',
      'Create a Library class that manages books and members',
      'Implement proper encapsulation (private fields, public methods)',
      'Add constructor overloading where appropriate',
      'Include validation in setter methods',
      'Implement borrowBook() method (Book object becomes unavailable)',
      'Implement returnBook() method (Book becomes available again)',
      'Add searchBook() method (by title or author)',
      'Implement displayAllBooks() and displayAllMembers() methods',
      'Create a menu-driven main program for user interaction',
      'Add comprehensive comments explaining your design',
      'Handle edge cases (book not available, member not found, etc.)'
    ],
    starterCode: `import java.util.Scanner;

  /**
   * Library Program
   * Author: [Your Name]
   * Description: Simple program to manage books and members
   */
  public class SimpleLibrary {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // ===== Sample Data =====
      Book book1 = new Book("____");   // Book title
      Book book2 = new Book("____");
      Member member1 = new Member("____");  // Member name
      Member member2 = new Member("____");

      boolean running = true;
      while (running) {
        System.out.println("=== Library Menu ===");
        System.out.println("1. Show Books");
        System.out.println("2. Borrow Book");
        System.out.println("3. Return Book");
        System.out.println("4. Exit");
        System.out.print("Choice: ");
        int choice = input.nextInt();
        input.nextLine(); // clear buffer

        switch (choice) {
          case 1:
            // Display books
            book1.____();
            book2.____();
            break;

          case 2:
            System.out.print("Member name: ");
            String name = input.nextLine();
            System.out.print("Book title: ");
            String title = input.nextLine();

            if (title.equals(book1.____) && book1.____) {
              book1.____();
              System.out.println(name + " borrowed " + book1.____);
            } else if (title.equals(book2.____) && book2.____) {
              book2.____();
              System.out.println(name + " borrowed " + book2.____);
            } else {
              System.out.println("Book unavailable!");
            }
            break;

          case 3:
            System.out.print("Book title to return: ");
            String returnTitle = input.nextLine();

            if (returnTitle.equals(book1.____)) {
              book1.____();
              System.out.println("Returned " + book1.____);
            } else if (returnTitle.equals(book2.____)) {
              book2.____();
              System.out.println("Returned " + book2.____);
            } else {
              System.out.println("Book not found!");
            }
            break;

          case 4:
            running = false;
            System.out.println("Goodbye!");
            break;

          default:
            System.out.println("Invalid choice!");
        }
      }

      input.close();
    }
  }

  // ===== Book Class =====
  class Book {
    String ____;      // Book title
    boolean ____ = true; // Available status

    Book(String title) { this.____ = ____; }

    void borrow() { ____ = false; }
    void returnBook() { ____ = true; }

    void display() { System.out.println(____ + " | Available: " + ____); }
  }

  // ===== Member Class =====
  class Member {
    String ____;      // Member name
    Member(String name) { this.____ = ____; }
  }
  `,
    solutionCode: `import java.util.Scanner;

  /**
   * Library Program
   * Author: [Your Name]
   * Description: Simple program to manage books and members
   */
  public class SimpleLibrary {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // ===== Sample Data =====
      Book book1 = new Book("Harry Potter");
      Book book2 = new Book("The Hobbit");
      Member member1 = new Member("Alice");
      Member member2 = new Member("Bob");

      boolean running = true;
      while (running) {
        System.out.println("\n=== Library Menu ===");
        System.out.println("1. Show Books");
        System.out.println("2. Borrow Book");
        System.out.println("3. Return Book");
        System.out.println("4. Exit");
        System.out.print("Choice: ");
        int choice = input.nextInt();
        input.nextLine(); // clear buffer

        switch (choice) {
          case 1:
            // Display books
            book1.display();
            book2.display();
            break;

          case 2:
            System.out.print("Member name: ");
            String name = input.nextLine();
            System.out.print("Book title: ");
            String title = input.nextLine();

            if (title.equals(book1.title) && book1.available) {
              book1.borrow();
              System.out.println(name + " borrowed " + book1.title);
            } else if (title.equals(book2.title) && book2.available) {
              book2.borrow();
              System.out.println(name + " borrowed " + book2.title);
            } else {
              System.out.println("Book unavailable!");
            }
            break;

          case 3:
            System.out.print("Book title to return: ");
            String returnTitle = input.nextLine();

            if (returnTitle.equals(book1.title)) {
              book1.returnBook();
              System.out.println("Returned " + book1.title);
            } else if (returnTitle.equals(book2.title)) {
              book2.returnBook();
              System.out.println("Returned " + book2.title);
            } else {
              System.out.println("Book not found!");
            }
            break;

          case 4:
            running = false;
            System.out.println("Goodbye!");
            break;

          default:
            System.out.println("Invalid choice!");
        }
      }

      input.close();
    }
  }

  // ===== Book Class =====
  class Book {
    String title;      // Book title
    boolean available = true; // Available status

    Book(String title) { this.title = title; }

    void borrow() { available = false; }
    void returnBook() { available = true; }

    void display() { System.out.println(title + " | Available: " + available); }
  }

  // ===== Member Class =====
  class Member {
    String name;      // Member name
    Member(String name) { this.name = name; }
  }
  `,
    expectedFeatures: [
      'Fully functional Book class with encapsulation',
      'Fully functional Member class with book borrowing capability',
      'Library class managing collections of books and members',
      'Constructor overloading in at least one class',
      'Input validation in all setter methods',
      'Working borrow and return system',
      'Search functionality for books',
      'Menu-driven interface for all operations',
      'Proper error handling',
      'Clear, professional console output',
      'Comprehensive comments explaining design decisions',
      'Demonstration of object composition and interaction'
    ],
    estimatedTime: '120-180 minutes',
    difficulty: 'Medium',
    points: 200
  }
};

// ============================================================================
// MODULE 6: Inheritance and Polymorphism - Advanced OOP Concepts
// ============================================================================

export const module6: DetailedModule = {
  id: 'learner-module-6',
  week: 6,
  title: 'Inheritance and Polymorphism - Advanced OOP Concepts',
  description: 'Master inheritance hierarchies, method overriding, and polymorphic behavior to create flexible and reusable code. Learn to design class relationships that model real-world scenarios effectively.',

  category: 'Learner',
  requiredLevel: 'Learner',
  estimatedHours: 5,

  objectives: [
    'Understand and implement inheritance hierarchies',
    'Master the extends keyword and super keyword usage',
    'Implement method overriding and understand runtime polymorphism',
    'Create and use abstract classes and methods',
    'Apply the Liskov Substitution Principle',
    'Design flexible class hierarchies using inheritance'
  ],

  learningPhilosophy: 'Inheritance and polymorphism are cornerstones of object-oriented programming that enable code reuse and flexible design. This module emphasizes practical application through real-world examples, demonstrating how inheritance models IS-A relationships and how polymorphism allows objects to take multiple forms.',

  theoreticalFoundation: [
    'Inheritance allows classes to inherit properties and behaviors from parent classes, promoting code reuse.',
    'The IS-A relationship defines inheritance: a Dog IS-A Animal, a Car IS-A Vehicle.',
    'Polymorphism enables objects of different classes to be treated as objects of a common superclass.',
    'Method overriding allows subclasses to provide specific implementations of inherited methods.',
    'The super keyword accesses parent class constructors, methods, and fields.',
    'Abstract classes define common behavior while enforcing implementation in subclasses.',
    'Runtime polymorphism (dynamic method dispatch) determines which method to execute at runtime.',
    'The Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of subclasses without breaking the application.'
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
      starterCode: `// ===== Base Employee Class =====
    class Employee {
      // Use protected fields to allow access in subclasses
      // String name
      // Double pay

      // Constructor
      public Employee(String name, double pay) {
        // Assign constructor parameters to fields
      }

      // Method to display info
      public void display() {
        System.out.println(name + " - Pay: $" + String.format("%.2f", pay));
      }
    }

    // ===== Manager Class =====
    class Manager extends Employee {

      public Manager(String name, double pay) {
        // Constructor should call super(name, pay)
      }


      @Override
      public void display() {
        System.out.println("Manager " + name + " - Pay: $" + String.format("%.2f", pay));
      }
    }

    // ===== Developer Class =====
    class Developer extends Employee {
      public Developer(String name, double pay) {
        // Call the parent constructor
      }

      @Override
      public void display() {
        System.out.println("Developer " + name + " - Pay: $" + String.format("%.2f", pay));
      }
    }

    // ===== Main Class =====
    public class Main {
      public static void main(String[] args) {
        // Hint: Create one Manager and one Developer object
        Manager m = new Manager("Alice", 8000);
        Developer d = new Developer("Bob", 6500);

        // Hint: Call display() for each object
        m.display();
        d.display();
      }
    }`,
      solutionCode: `// ===== Base Employee Class =====
  class Employee {
    protected String name;
    protected double pay;

    // Constructor
    public Employee(String name, double pay) {
      this.name = name;
      this.pay = pay;
    }

    // Method to display info
    public void display() {
      System.out.println(name + " - Pay: $" + String.format("%.2f", pay));
    }
  }

  // ===== Manager Class =====
  class Manager extends Employee {
    public Manager(String name, double pay) {
      super(name, pay);
    }

    @Override
    public void display() {
      System.out.println("Manager " + name + " - Pay: $" + String.format("%.2f", pay));
    }
  }

  // ===== Developer Class =====
  class Developer extends Employee {
    public Developer(String name, double pay) {
      super(name, pay);
    }

    @Override
    public void display() {
      System.out.println("Developer " + name + " - Pay: $" + String.format("%.2f", pay));
    }
  }

  // ===== Main Class =====
  public class Main {
    public static void main(String[] args) {
      Manager m = new Manager("Alice", 8000);
      Developer d = new Developer("Bob", 6500);

      m.display();
      d.display();
    }
  }`,
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
      starterCode: `// ===== Abstract Shape Class =====
    abstract class Shape {
      // Abstract method for calculateArea()
      abstract double calculateArea();

    }

    // ===== Circle Class =====
    class Circle extends Shape {
      private double radius;

      public Circle(double radius) {
        // Constructor to initialize radius
        this.radius = radius;
      }

      @Override
      double calculateArea() {
        // Return area formula Math.PI * r^2
        return Math.PI * radius * radius;
      }
    }

    // ===== Rectangle Class =====
    class Rectangle extends Shape {
      private double width;
      private double height;

      public Rectangle(double width, double height) {
        // Constructor to initialize width and height
        this.width = width;
        this.height = height;
      }

      @Override
      double calculateArea() {
        // Return area formula width * height
        return width * height;
      }
    }

    // ===== Main Class =====
    public class Main {
      public static void main(String[] args) {
        // Use polymorphism Shape reference can point to any subclass
        Shape circle = new Circle(5);          // radius = 5
        Shape rectangle = new Rectangle(4, 6); // width = 4, height = 6

        double totalArea = circle.calculateArea() + rectangle.calculateArea(); // Hint: Calculate total area

        System.out.printf("Circle area: %.2f\n", circle.calculateArea());
        System.out.printf("Rectangle area: %.2f\n", rectangle.calculateArea());
        System.out.printf("Total area: %.2f\n", totalArea);
      }
    }`,
      solutionCode: `// ===== Abstract Shape Class =====
abstract class Shape {
    abstract double calculateArea();
}

// ===== Circle Class =====
class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    double calculateArea() {
        return Math.PI * radius * radius;
    }
}

// ===== Rectangle Class =====
class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    double calculateArea() {
        return width * height;
    }
}

// ===== Main Class =====
public class Main {
    public static void main(String[] args) {
        Shape circle = new Circle(5);       // radius = 5
        Shape rectangle = new Rectangle(4, 6); // width = 4, height = 6

        double totalArea = circle.calculateArea() + rectangle.calculateArea();

        System.out.printf("Circle area: %.2f\n", circle.calculateArea());
        System.out.printf("Rectangle area: %.2f\n", rectangle.calculateArea());
        System.out.printf("Total area: %.2f\n", totalArea);
    }
}`,
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
    description: 'Design and implement a comprehensive vehicle rental system that demonstrates mastery of inheritance, polymorphism, and abstract classes.',
    objectives: [
      'Design a multi-level inheritance hierarchy',
      'Implement abstract classes with template methods',
      'Apply polymorphism for flexible vehicle management',
      'Override methods with specific behavior for each vehicle type',
      'Create a rental management system using OOP principles'
    ],
    requirements: [
      'Create an abstract Vehicle base class with common properties and methods',
      'Implement at least 3 concrete vehicle types (Car, Motorcycle, Truck)',
      'Each vehicle type should have unique rental rate calculation',
      'Implement a RentalAgency class to manage vehicle inventory',
      'Add rental and return functionality with date tracking',
      'Calculate rental costs based on vehicle type and duration',
      'Display available vehicles and rental history',
      'Use polymorphic arrays to manage different vehicle types',
      'Include proper encapsulation and access modifiers',
      'Add comprehensive documentation and comments'
    ],
    starterCode: `/**
 * Vehicle Rental System
 * Author: [Your Name]
 * Description: Simple program to manage vehicle rentals, calculate rental costs, and display available vehicles
 */
import java.util.Scanner;

// ===== Base Vehicle Class =====
abstract class Vehicle {
    private String name;
    private boolean rented;

    // Hint: Constructor to set the vehicle name
    public Vehicle(String name) {
        _____________________  // Fill in: store name
    }

    // Hint: Getter for name
    public String getName() {
        return ____________________; // Fill in
    }

    // Hint: Check if rented
    public boolean isRented() {
        return ____________________; // Fill in
    }

    // Hint: Rent the vehicle
    public void rent() {
        _____________________; // Fill in
    }

    // Hint: Return the vehicle
    public void returned() {
        _____________________; // Fill in
    }

    // Hint: Abstract method to calculate rental cost for given days
    public abstract double cost(int days);
}

// ===== Concrete Vehicle Classes =====
class Car extends Vehicle {
    public Car(String name) {
        _____________________; // Hint: Call parent constructor
    }

    // Hint: Cost is $50 per day
    public double cost(int days) {
        return ____________________; // Fill in
    }
}

class Motorcycle extends Vehicle {
    public Motorcycle(String name) {
        _____________________; // Hint: Call parent constructor
    }

    // Hint: Cost is $30 per day
    public double cost(int days) {
        return ____________________; // Fill in
    }
}

class Truck extends Vehicle {
    public Truck(String name) {
        _____________________; // Hint: Call parent constructor
    }

    // Hint: Cost is $80 per day
    public double cost(int days) {
        return ____________________; // Fill in
    }
}

// ===== Main Program =====
public class VehicleRental {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // Hint: Create an array of different vehicles
        Vehicle[] vehicles = {
            _____________________, // Car example
            _____________________, // Motorcycle example
            _____________________  // Truck example
        };

        while (true) {
            System.out.println("\n1. Show Vehicles  2. Rent  3. Return  4. Exit");
            System.out.print("Choice: ");
            int choice = input.nextInt();

            switch(choice) {
                case 1:
                    // Hint: Loop through array and show name + rented status
                    for (int i = 0; i < vehicles.length; i++) {
                        System.out.println((i+1) + ". " + ___________________ + 
                            (___________________ ? " (Rented)" : "")); // Fill in
                    }
                    break;

                case 2:
                    System.out.print("Vehicle # to rent: "); 
                    int r = input.nextInt()-1;
                    System.out.print("Days: "); 
                    int d = input.nextInt();
                    // Hint: Check availability and calculate cost
                    if (!___________________) {
                        _____________________; // Rent it
                        System.out.println("Total: $" + _____________________); // Cost
                    } else System.out.println("Already rented!");
                    break;

                case 3:
                    System.out.print("Vehicle # to return: "); 
                    int ret = input.nextInt()-1;
                    // Hint: Check if rented, then return
                    if (___________________) {
                        _____________________; // Return vehicle
                        System.out.println("Returned!");
                    } else System.out.println("Not rented!");
                    break;

                case 4:
                    input.close();
                    return;

                default:
                    System.out.println("Invalid choice!");
            }
        }
    }
}`,
    solutionCode: `import java.util.Scanner;

  // ===== Base Vehicle Class =====
  abstract class Vehicle {
    private String name;
    private boolean rented;

    // Constructor
    public Vehicle(String name) {
      this.name = name;  // store name
    }

    // Getter for name
    public String getName() {
      return name;
    }

    // Check if rented
    public boolean isRented() {
      return rented;
    }

    // Rent the vehicle
    public void rent() {
      rented = true;
    }

    // Return the vehicle
    public void returned() {
      rented = false;
    }

    // Abstract method to calculate rental cost
    public abstract double cost(int days);
  }

  // ===== Concrete Vehicle Classes =====
  class Car extends Vehicle {
    public Car(String name) {
      super(name); // Call parent constructor
    }

    // Cost is $50 per day
    public double cost(int days) {
      return days * 50;
    }
  }

  class Motorcycle extends Vehicle {
    public Motorcycle(String name) {
      super(name);
    }

    // Cost is $30 per day
    public double cost(int days) {
      return days * 30;
    }
  }

  class Truck extends Vehicle {
    public Truck(String name) {
      super(name);
    }

    // Cost is $80 per day
    public double cost(int days) {
      return days * 80;
    }
  }

  // ===== Main Program =====
  public class VehicleRental {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // Array of vehicles
      Vehicle[] vehicles = {
        new Car("Car A"),
        new Motorcycle("Bike X"),
        new Truck("Truck 1")
      };

      while (true) {
        System.out.println("\n1. Show Vehicles  2. Rent  3. Return  4. Exit");
        System.out.print("Choice: ");
        int choice = input.nextInt();

        switch(choice) {
          case 1:
            // Show vehicle list with status
            for (int i = 0; i < vehicles.length; i++) {
              System.out.println((i+1) + ". " + vehicles[i].getName() +
                (vehicles[i].isRented() ? " (Rented)" : ""));
            }
            break;

          case 2:
            System.out.print("Vehicle # to rent: ");
            int r = input.nextInt() - 1;
            System.out.print("Days: ");
            int d = input.nextInt();
            // Rent if available
            if (!vehicles[r].isRented()) {
              vehicles[r].rent();
              System.out.println("Total: $" + vehicles[r].cost(d));
            } else System.out.println("Already rented!");
            break;

          case 3:
            System.out.print("Vehicle # to return: ");
            int ret = input.nextInt() - 1;
            // Return if rented
            if (vehicles[ret].isRented()) {
              vehicles[ret].returned();
              System.out.println("Returned!");
            } else System.out.println("Not rented!");
            break;

          case 4:
            input.close();
            return;

          default:
            System.out.println("Invalid choice!");
        }
      }
    }
  }`,
    expectedFeatures: [
      'Abstract Vehicle class with proper abstraction',
      'At least 3 concrete vehicle types with unique behavior',
      'Polymorphic rental cost calculation',
      'Rental agency with inventory management',
      'Rental and return functionality',
      'Rental history tracking',
      'Revenue calculation',
      'Professional output formatting',
      'Comprehensive error handling',
      'Well-documented code with comments'
    ],
    estimatedTime: '3-4 hours',
    difficulty: 'Hard',
    points: 200
  }
};

// ============================================================================
// EXPORT MODULES
// ============================================================================

export const javaLearnerCurriculumPart1: DetailedModule[] = [
  module5,
  module6
];

export default javaLearnerCurriculumPart1;
