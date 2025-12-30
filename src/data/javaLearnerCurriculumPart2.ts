/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                                                                            ║
 * ║     COMPREHENSIVE JAVA LEARNER TRACK – PART 2 (MODULES 7-8)              ║
 * ║     Based on NetBeans IDE Self-Paced Learning Module                     ║
 * ║                                                                            ║
 * ║     Focus: Advanced OOP and Robust Application Development                ║
 * ║     - Module 7: Interfaces and Abstract Classes                          ║
 * ║     - Module 8: Exception Handling and File I/O                          ║
 * ║                                                                            ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import { DetailedModule } from './comprehensiveBeginnerCurriculum';

// ============================================================================
// MODULE 7: Interfaces and Abstract Classes - Designing Flexible Systems
// ============================================================================

export const module7: DetailedModule = {
  id: 'learner-module-7',
  week: 7,
  title: 'Interfaces and Abstract Classes - Designing Flexible Systems',
  description: 'Master the art of designing flexible, maintainable systems using interfaces and abstract classes. Learn to create contracts for behavior, implement multiple inheritance through interfaces, and choose the right abstraction for your design needs.',

  category: 'Advanced',
  requiredLevel: 'Advanced',
  estimatedHours: 5,

  objectives: [
    'Design and implement interfaces for behavioral contracts',
    'Master multiple interface implementation and composition',
    'Create and utilize abstract classes effectively',
    'Understand when to use interfaces vs abstract classes',
    'Apply interface segregation and design principles',
    'Implement default and static methods in interfaces'
  ],

  learningPhilosophy: 'This week focuses on advanced abstraction techniques that enable flexible, scalable software design. You\'ll learn to separate "what" from "how" by defining contracts and creating pluggable architectures that are easy to extend and maintain.',

  theoreticalFoundation: [
    'Interfaces define contracts that specify what a class can do without dictating how it does it',
    'Abstract classes provide partial implementation and serve as templates for subclasses',
    'Multiple interface implementation enables polymorphic behavior without traditional multiple inheritance problems',
    'The "Program to an interface, not an implementation" principle promotes loose coupling',
    'Interface segregation principle: clients should not be forced to depend on methods they don\'t use',
    'Default methods (Java 8+) allow interfaces to evolve without breaking existing implementations',
    'Abstract classes are ideal when subclasses share common code; interfaces when unrelated classes need common behavior'
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
      starterCode: `// ===== Payable Interface =====
    interface Payable {
      // Method to process a payment of a certain amount
      void processPayment(double amount);

      // Method to get payment type/details
      String getPaymentDetails();
    }

    // ===== Credit Card Payment =====
    class CreditCardPayment implements Payable {

      // Implement the processPayment method
      public void processPayment(double amount) {
        // Hint: Use System.out.printf to display "Processing credit card payment: $amount"
        _______________________; 
      }

      // Implement the getPaymentDetails method
      public String getPaymentDetails() {
        // Hint: return the type of payment
        return _________________;
      }
    }

    // ===== PayPal Payment =====
    class PayPalPayment implements Payable {

      public void processPayment(double amount) {
        // Hint: Display "Processing PayPal payment: $amount"
        _______________________; 
      }

      public String getPaymentDetails() {
        // Hint: return "PayPal"
        return _________________;
      }
    }

    // ===== Main Program =====
    public class Main {
      public static void main(String[] args) {
        // Hint: Use Payable reference to store a CreditCardPayment object
        Payable payment1 = _______________________; 
        // Hint: Use Payable reference to store a PayPalPayment object
        Payable payment2 = _______________________; 

        // Hint: Call processPayment with appropriate amounts
        payment1.___________________;
        payment2.___________________;
      }
    }`,
      solutionCode: `// ===== Playable Interface =====
    interface Payable {
      void processPayment(double amount);
      String getPaymentDetails();
    }

    // ===== Credit Card Payment =====
    class CreditCardPayment implements Payable {
      public void processPayment(double amount) {
        System.out.printf("Processing credit card payment: $%.2f\n", amount);
      }
      public String getPaymentDetails() {
        return "Credit Card";
      }
    }

    // ===== PayPal Payment =====
    class PayPalPayment implements Payable {
      public void processPayment(double amount) {
        System.out.printf("Processing PayPal payment: $%.2f\n", amount);
      }
      public String getPaymentDetails() {
        return "PayPal";
      }
    }

    // ===== Main Program =====
    public class Main {
      public static void main(String[] args) {
        Payable payment1 = new CreditCardPayment();
        Payable payment2 = new PayPalPayment();

        payment1.processPayment(100.00);
        payment2.processPayment(50.00);
      }
    }`,
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
      expectedOutput: 'Playing video...\nDownloading video...\nPlaying audio...',
      description: 'Build a media player system using multiple interfaces.',
      difficulty: 'Hard' as const,
      instructions: [
        'Create Playable interface with play(), pause(), stop() methods',
        'Create Downloadable interface with download() method',
        'Create Video class implementing both interfaces',
        'Create Audio class implementing only Playable',
        'Test polymorphism with both interface types'
      ],
      starterCode: `// ===== Playable Interface =====
    interface Playable {
      // Hint: method to start playback
      void _________();
      // Hint: method to pause playback
      void _________();
    }

    // ===== Downloadable Interface =====
    interface Downloadable {
      // Hint: method to download content
      void _________();
    }

    // ===== Video Player =====
    class VideoPlayer implements Playable, Downloadable {
      // Implement play method
      public void play() {
        System.out.println("__________ video...");
      }

      // Implement pause method
      public void pause() {
        System.out.println("__________ video...");
      }

      // Implement download method
      public void download() {
        System.out.println("__________ video...");
      }
    }

    // ===== Audio Player =====
    class AudioPlayer implements Playable {
      public void play() {
        System.out.println("__________ audio...");
      }

      public void pause() {
        System.out.println("__________ audio...");
      }
    }

    // ===== Main Program =====
    public class Main {
      public static void main(String[] args) {
        // Hint: instantiate VideoPlayer as Playable
        Playable video = new ____________;
        // Hint: cast video to Downloadable
        Downloadable downloadableVideo = (__________) video;
        // Hint: instantiate AudioPlayer as Playable
        Playable audio = new ____________;

        // Call play for video
        video._________();
        // Call download for video
        downloadableVideo._________();
        // Call play for audio
        audio._________();
      }
    }`,
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
    description: 'Design and implement a comprehensive notification system that demonstrates mastery of interfaces, abstract classes, default methods, and design patterns.',
    objectives: [
      'Design flexible system using interfaces and abstract classes',
      'Implement multiple notification channels (Email, SMS, Push)',
      'Apply interface segregation principle',
      'Use template method pattern for notification processing',
      'Demonstrate composition and polymorphism',
      'Implement Strategy pattern for message formatting'
    ],
    requirements: [
      'Create Notifiable interface with send() method',
      'Create Trackable interface with getDeliveryStatus() method',
      'Create Formattable interface with format() method',
      'Create abstract class BaseNotification with common functionality',
      'Implement EmailNotification, SMSNotification, PushNotification classes',
      'Create MessageFormatter interface with HTML, Plain, and Rich formatters',
      'Implement NotificationManager to handle multiple notifications',
      'Use default methods for common notification behaviors',
      'Include priority handling (HIGH, MEDIUM, LOW)',
      'Add notification retry logic in abstract class',
      'Demonstrate polymorphism with notification arrays',
      'Include comprehensive comments explaining design decisions'
    ],
    starterCode: `/** Notification System - Module 7 Assessment Project */`,
    solutionCode: `/**
   * Notification System with Interfaces and Abstract Classes
   * Author: [Your Name]
   * Description: Implement Strategy pattern for message formatting
   */
  // ===== Interfaces =====
  interface Notifiable {
    void send();
    default void retry() {
      System.out.println("Retrying notification...");
    }
  }

  interface Trackable {
    String getDeliveryStatus();
  }

  interface Formattable {
    String format();
  }

  // ===== Abstract Base Notification =====
  abstract class BaseNotification implements Notifiable, Trackable, Formattable {
    protected String message;
    protected String recipient;
    protected String priority; // HIGH, MEDIUM, LOW

    public BaseNotification(String message, String recipient, String priority) {
      this.message = message;
      this.recipient = recipient;
      this.priority = priority;
    }

    public void send() {
      System.out.println("Sending to " + recipient + " with priority " + priority + ": " + format());
    }

    public String getDeliveryStatus() {
      return "Delivered to " + recipient;
    }

    public void retry() {
      System.out.println("Retrying delivery to " + recipient);
    }
  }

  // ===== Concrete Notifications =====
  class EmailNotification extends BaseNotification {
    public EmailNotification(String msg, String to, String priority) {
      super(msg, to, priority);
    }
    public String format() { return "[Email] " + message; }
  }

  class SMSNotification extends BaseNotification {
    public SMSNotification(String msg, String to, String priority) {
      super(msg, to, priority);
    }
    public String format() { return "[SMS] " + message; }
  }

  class PushNotification extends BaseNotification {
    public PushNotification(String msg, String to, String priority) {
      super(msg, to, priority);
    }
    public String format() { return "[Push] " + message; }
  }

  // ===== Message Formatter =====
  interface MessageFormatter {
    String formatMessage(String message);
  }

  class HTMLFormatter implements MessageFormatter {
    public String formatMessage(String message) { return "<html>" + message + "</html>"; }
  }

  class PlainFormatter implements MessageFormatter {
    public String formatMessage(String message) { return message; }
  }

  // ===== Notification Manager =====
  class NotificationManager {
    private BaseNotification[] notifications;

    public NotificationManager(BaseNotification[] notifications) {
      this.notifications = notifications;
    }

    public void sendAll() {
      for (BaseNotification n : notifications) {
        n.send();
        System.out.println(n.getDeliveryStatus());
      }
    }
  }

  // ===== Main Program =====
  public class Main {
    public static void main(String[] args) {
      BaseNotification[] notifs = {
        new EmailNotification("Meeting at 10AM", "alice@example.com", "HIGH"),
        new SMSNotification("Lunch break", "555-1234", "MEDIUM"),
        new PushNotification("New message!", "Bob's phone", "LOW")
      };

      NotificationManager manager = new NotificationManager(notifs);
      manager.sendAll();
    }
  }
  `,
    expectedFeatures: [
      'Complete interface definitions with default methods',
      'Abstract class with template method pattern',
      'Three concrete notification classes (Email, SMS, Push)',
      'Working retry logic in abstract class',
      'Message formatter implementations (Strategy pattern)',
      'NotificationManager for handling multiple notifications',
      'Polymorphic notification handling',
      'Priority system implementation',
      'Validation and error handling',
      'Status tracking and reporting',
      'Professional output formatting',
      'Comprehensive comments explaining design'
    ],
    estimatedTime: '90-120 minutes',
    difficulty: 'Hard',
    points: 200
  }
};

// ============================================================================
// MODULE 8: Exception Handling and File I/O - Building Robust Applications
// ============================================================================

export const module8: DetailedModule = {
  id: 'learner-module-8',
  week: 8,
  title: 'Exception Handling and File I/O - Building Robust Applications',
  description: 'Master exception handling mechanisms to create resilient applications and implement robust file input/output operations. Learn to handle errors gracefully, create custom exceptions, and work with files effectively.',

  category: 'Advanced',
  requiredLevel: 'Advanced',
  estimatedHours: 5,

  objectives: [
    'Master try-catch-finally exception handling mechanisms',
    'Understand checked vs unchecked exceptions',
    'Create custom exception classes for domain-specific errors',
    'Implement robust file reading and writing operations',
    'Use try-with-resources for automatic resource management',
    'Apply exception handling best practices in real applications'
  ],

  learningPhilosophy: 'This week focuses on building bulletproof applications that handle errors gracefully and work reliably with external resources. Exception handling transforms fragile programs into production-ready applications, while file I/O enables persistent data storage and retrieval.',

  theoreticalFoundation: [
    'Exceptions represent abnormal conditions that disrupt normal program flow',
    'Java\'s exception hierarchy divides into checked exceptions (compile-time) and unchecked exceptions (runtime)',
    'Proper exception handling separates error-handling code from business logic, improving readability',
    'The try-catch-finally mechanism ensures resources are cleaned up even when errors occur',
    'Custom exceptions provide domain-specific error information and improve code maintainability',
    'File I/O operations are inherently risky and require comprehensive exception handling',
    'Try-with-resources (introduced in Java 7) automatically closes resources, preventing memory leaks'
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
      starterCode: `// ===== Playable Interface =====
    interface Playable {
      void _________();   // Hint: starts playing
      void _________();   // Hint: pauses playing
    }

    // ===== Downloadable Interface =====
    interface Downloadable {
      void _________();   // Hint: downloads media
    }

    // ===== Video Player =====
    class VideoPlayer implements _________, _________ {

      public void _________() {
        System.out.println("__________ video...");
      }

      public void _________() {
        System.out.println("__________ video...");
      }

      public void _________() {
        System.out.println("__________ video...");
      }
    }

    // ===== Audio Player =====
    class AudioPlayer implements _________ {

      public void _________() {
        System.out.println("__________ audio...");
      }

      public void _________() {
        System.out.println("__________ audio...");
      }
    }

    // ===== Main Program =====
    public class Main {
      public static void main(String[] args) {

        // Create objects using interface references
        Playable video = new __________________();
        Downloadable downloadableVideo = (__________________) video;
        Playable audio = new __________________();

        // Call methods
        video.__________();                 // Hint: play video
        downloadableVideo.__________();     // Hint: download video
        audio.__________();                 // Hint: play audio
      }
    }`,
      solutionCode: `// ===== Playable Interface =====
  interface Playable {
    void play();
    void pause();
  }

  // ===== Downloadable Interface =====
  interface Downloadable {
    void download();
  }

  // ===== Video Player =====
  class VideoPlayer implements Playable, Downloadable {

    public void play() {
      System.out.println("Playing video...");
    }

    public void pause() {
      System.out.println("Pausing video...");
    }

    public void download() {
      System.out.println("Downloading video...");
    }
  }

  // ===== Audio Player =====
  class AudioPlayer implements Playable {

    public void play() {
      System.out.println("Playing audio...");
    }

    public void pause() {
      System.out.println("Pausing audio...");
    }
  }

  // ===== Main Program =====
  public class Main {
    public static void main(String[] args) {

      // Create objects using interface references
      Playable video = new VideoPlayer();
      Downloadable downloadableVideo = (Downloadable) video;
      Playable audio = new AudioPlayer();

      // Call methods
      video.play();                  // Playing video...
      downloadableVideo.download();  // Downloading video...
      audio.play();                  // Playing audio...
    }
  }
  `,
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
      starterCode: `import java.io.*;
    import java.util.Scanner;

    // ===== Student Class =====
    class Student {
      private int id;
      private String name;
      private double gpa;

      // Constructor
      public Student(_____ id, _____ name, _____ gpa) {
        // Constructors
      }

      // Convert object to file-friendly string
      public String toFileString() {
        return _______ + "," + _______ + "," + _______;
      }

      // Create Student object from a line in the file
      public static Student fromFileString(String line) {
        // HINT: Split the line using comma
        String[] parts = line.________(",");

        // HINT: Convert strings back to int and double
        return new Student(
            Integer._________(parts[0]),
            parts[1],
            Double._________(parts[2])
        );
      }

      public void display() {
        System.out.println("Student: " + ____ + ", " + _____ + ", GPA: " + _____);
      }
    }

    // ===== File Manager Class =====
    public class FileManager {

      public static void saveToFile(Student[] students, String filename) {

        try (PrintWriter writer = new PrintWriter(new ___________(filename))) {


          for (Student s : ________) {
            writer.println(s.____________());
          }

          System.out.println("Saved 3 students to file");

        } catch (_________ e) {
          System.out.println("File write error");
        }
      }

      public static Student[] loadFromFile(String filename) {
        Student[] students = new Student[___]; // HINT: number of students
        int index = 0;

        // HINT: Use Scanner to read from file
        try (Scanner file = new Scanner(new ___________(filename))) {

          // HINT: Loop while file has next line
          while (file._______________()) {
            students[index] =
                Student.________________(file.nextLine());
            index++;
          }

          System.out.println("Loaded 3 students from file");

        } catch (_________ e) {
          System.out.println("File read error");
        }

        return students;
      }

      public static void main(String[] args) {

        // Create sample students
        Student[] students = {
          new Student(101, "Alice", 3.8),
          new Student(102, "Bob", 3.5),
          new Student(103, "Charlie", 3.9)
        };

        String filename = "students.txt";

        // Save and load students
        saveToFile(_________, filename);
        Student[] loadedStudents = ____________(filename);

        // Display first loaded student
        loadedStudents[__]._________(); // prints Alice only (matches expected output)
      }
    }
    `,
      solutionCode: `import java.io.*;
  import java.util.Scanner;

  // Student class
  class Student {
    private int id;
    private String name;
    private double gpa;

    public Student(int id, String name, double gpa) {
      this.id = id;
      this.name = name;
      this.gpa = gpa;
    }

    public String toFileString() {
      return id + "," + name + "," + gpa;
    }

    public static Student fromFileString(String line) {
      String[] parts = line.split(",");
      return new Student(
          Integer.parseInt(parts[0]),
          parts[1],
          Double.parseDouble(parts[2])
      );
    }

    public void display() {
      System.out.println("Student: " + id + ", " + name + ", GPA: " + gpa);
    }
  }

  // File manager class
  public class FileManager {

    public static void saveToFile(Student[] students, String filename) {
      try (PrintWriter writer = new PrintWriter(new FileWriter(filename))) {
        for (Student s : students) {
          writer.println(s.toFileString());
        }
        System.out.println("Saved 3 students to file");
      } catch (IOException e) {
        System.out.println("File write error");
      }
    }

    public static Student[] loadFromFile(String filename) {
      Student[] students = new Student[3];
      int index = 0;

      try (Scanner file = new Scanner(new File(filename))) {
        while (file.hasNextLine()) {
          students[index] = Student.fromFileString(file.nextLine());
          index++;
        }
        System.out.println("Loaded 3 students from file");
      } catch (IOException e) {
        System.out.println("File read error");
      }

      return students;
    }

    public static void main(String[] args) {
      Student[] students = {
        new Student(101, "Alice", 3.8),
        new Student(102, "Bob", 3.5),
        new Student(103, "Charlie", 3.9)
      };

      String filename = "students.txt";

      saveToFile(students, filename);
      Student[] loadedStudents = loadFromFile(filename);

      loadedStudents[0].display(); // prints Alice only (matches expected output)
    }
  }
  `,
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
    description: 'Create a comprehensive student record management system that demonstrates mastery of exception handling and file I/O. The system should save and load student data from files, handle errors gracefully, and provide a menu-driven interface.',
    objectives: [
      'Implement custom exception classes for domain-specific errors',
      'Use try-with-resources for all file operations',
      'Handle multiple exception types appropriately',
      'Create, read, update, and delete student records',
      'Persist data to files and load on startup',
      'Provide user-friendly error messages and recovery options'
    ],
    requirements: [
      'Create at least 2 custom exception classes (InvalidStudentDataException, FileOperationException)',
      'Implement Student class with name, ID, and grades (3 subjects)',
      'Create menu system with options: Add Student, View All Students, Search Student, Delete Student, Calculate Class Average, Save & Exit',
      'Store student data in text file (students.txt) using a clear format',
      'Load existing data on program start',
      'Validate all user input and throw appropriate exceptions',
      'Use try-with-resources for all file operations',
      'Handle FileNotFoundException, IOException, and custom exceptions',
      'Display detailed error messages for all error conditions',
      'Calculate and display average grade for each student',
      'Calculate and display class average'
    ],
    starterCode: `import java.io.*;
  import java.util.*;

  /**
   * Beginner Student Management System
   * Description: Manage students, calculate averages, and save/load data from file
   */

  // ===== CUSTOM EXCEPTIONS =====
  class InvalidStudentDataException extends _________ {
    public InvalidStudentDataException(String message) {
      super(_________);
    }
  }

  class FileOperationException extends _________ {
    public FileOperationException(String message) {
      super(_________);
    }
  }

  // ===== STUDENT CLASS =====
  class Student {
    private int id;
    private String name;
    private double[] grades; // 3 subjects

    public Student(int id, String name, double[] grades)
        throws __________________________ {

      // HINT: Check for empty name OR grades not equal to 3
      if (__________.isEmpty() || grades._______ != 3) {
        throw new __________________________("Invalid student data.");
      }

      this.id = ___;
      this.name = ______;
      this.grades = _______;
    }

    public int getId() {
      return ___;
    }

    public double getAverage() {
      double sum = 0;

      // HINT: enhanced for-loop
      for (double g : ________) {
        sum += ___;
      }

      return sum / ________._______;
    }

    public String toFileString() {
      // HINT: comma-separated values
      return ___ + "," + ______ + "," +
           grades[0] + "," + grades[1] + "," + grades[2];
    }

    public String toString() {
      return "Student: " + ___ + ", " + ______ +
           ", Average: " +
           String.format("%.2f", ____________);
    }
  }

  // ===== MAIN SYSTEM =====
  public class StudentManager {

    private static ArrayList<Student> students =
        new ______________________<>();

    private static final String FILE_NAME = "__________";

    public static void main(String[] args) {
      Scanner input = new _________(System.in);

      // HINT: load data from file before menu
      _____________();

      boolean running = _____;

      while (_______) {
        System.out.println("\n=== Student Menu ===");
        System.out.println("1. Add Student");
        System.out.println("2. View All Students");
        System.out.println("3. Search Student");
        System.out.println("4. Delete Student");
        System.out.println("5. Calculate Class Average");
        System.out.println("6. Save & Exit");
        System.out.print("Choose option: ");

        int choice = input._________();
        input.nextLine();

        switch (_______) {
          case 1:
            ____________(input);
            break;
          case 2:
            ____________();
            break;
          case 3:
            ____________(input);
            break;
          case 4:
            ____________(input);
            break;
          case 5:
            ______________________();
            break;
          case 6:
            ____________();
            running = _____;
            break;
          default:
            System.out.println("Invalid choice.");
        }
      }

      input._________();
    }

    // ===== MENU METHODS =====
    private static void addStudent(Scanner input) {
      try {
        System.out.print("Enter ID: ");
        int id = input._________();
        input.nextLine();

        System.out.print("Enter name: ");
        String name = input._________();

        double[] grades = new double[___];
        for (int i = 0; i < ___; i++) {
          System.out.print("Enter grade " + (i + 1) + ": ");
          grades[i] = input._________();
        }

        students._____(new __________(id, name, grades));
        System.out.println("Student added successfully.");

      } catch (__________________________ e) {
        System.out.println("Error: " + e.getMessage());
      } catch (__________________________ e) {
        System.out.println("Invalid input.");
        input.nextLine();
      }
    }

    private static void viewStudents() {
      if (students._________()) {
        System.out.println("No students found.");
        return;
      }

      for (Student s : ________) {
        System.out.println(_____);
      }
    }

    private static void searchStudent(Scanner input) {
      System.out.print("Enter student ID: ");
      int id = input._________();

      for (Student s : students) {
        if (s._________() == ___) {
          System.out.println(s);
          return;
        }
      }

      System.out.println("Student not found.");
    }

    private static void deleteStudent(Scanner input) {
      System.out.print("Enter student ID to delete: ");
      int id = input._________();

      Iterator<Student> it = students._________();
      while (it._________()) {
        if (it.next()._________() == ___) {
          it._________();
          System.out.println("Student removed.");
          return;
        }
      }

      System.out.println("Student not found.");
    }

    private static void calculateClassAverage() {
      if (students._________()) {
        System.out.println("No students available.");
        return;
      }

      double sum = 0;
      for (Student s : students) {
        sum += s._________();
      }

      System.out.println("Class Average: " +
          String.format("%.2f", sum / students._________()));
    }

    // ===== FILE METHODS =====
    private static void saveToFile() {
      try (PrintWriter pw =
             new ____________(new ____________(FILE_NAME))) {

        for (Student s : students) {
          pw._________(s.____________());
        }

        System.out.println("Saved " + students._________() +
                   " students to file.");

      } catch (___________ e) {
        System.out.println("File saving error.");
      }
    }

    private static void loadFromFile() {
      File file = new _________(FILE_NAME);
      if (!file._________()) return;

      try (Scanner fileInput = new _________(file)) {
        while (fileInput._________()) {
          String[] parts =
              fileInput.nextLine()._________(",");

          int id = Integer._________(parts[0]);
          String name = parts[1];

          double[] grades = {
              Double._________(parts[2]),
              Double._________(parts[3]),
              Double._________(parts[4])
          };

          students._____(new __________(id, name, grades));
        }
      } catch (___________ e) {
        System.out.println("Error loading file.");
      }
    }
  }
  `,
    solutionCode: `import java.io.*;
  import java.util.*;

  /**
   * Beginner Student Management System
   * Author: [Your Name]
   * Description: Manage students, calculate averages, and save/load data from file
   */

  // ===== CUSTOM EXCEPTIONS =====
  class InvalidStudentDataException extends Exception {
    public InvalidStudentDataException(String message) {
      super(message);
    }
  }

  class FileOperationException extends Exception {
    public FileOperationException(String message) {
      super(message);
    }
  }

  // ===== STUDENT CLASS =====
  class Student {
    private int id;
    private String name;
    private double[] grades; // 3 subjects

    public Student(int id, String name, double[] grades) throws InvalidStudentDataException {
      if (name.isEmpty() || grades.length != 3) {
        throw new InvalidStudentDataException("Invalid student data.");
      }
      this.id = id;
      this.name = name;
      this.grades = grades;
    }

    public int getId() {
      return id;
    }

    public double getAverage() {
      double sum = 0;
      for (double g : grades) {
        sum += g;
      }
      return sum / grades.length;
    }

    public String toFileString() {
      return id + "," + name + "," + grades[0] + "," + grades[1] + "," + grades[2];
    }

    public String toString() {
      return "Student: " + id + ", " + name + ", Average: " + String.format("%.2f", getAverage());
    }
  }

  // ===== MAIN SYSTEM =====
  public class StudentManager {

    private static ArrayList<Student> students = new ArrayList<>();
    private static final String FILE_NAME = "students.txt";

    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);
      loadFromFile();

      boolean running = true;

      while (running) {
        System.out.println("\n=== Student Menu ===");
        System.out.println("1. Add Student");
        System.out.println("2. View All Students");
        System.out.println("3. Search Student");
        System.out.println("4. Delete Student");
        System.out.println("5. Calculate Class Average");
        System.out.println("6. Save & Exit");
        System.out.print("Choose option: ");

        int choice = input.nextInt();
        input.nextLine();

        switch (choice) {
          case 1:
            addStudent(input);
            break;

          case 2:
            viewStudents();
            break;

          case 3:
            searchStudent(input);
            break;

          case 4:
            deleteStudent(input);
            break;

          case 5:
            calculateClassAverage();
            break;

          case 6:
            saveToFile();
            running = false;
            break;

          default:
            System.out.println("Invalid choice.");
        }
      }

      input.close();
    }

    // ===== MENU METHODS =====
    private static void addStudent(Scanner input) {
      try {
        System.out.print("Enter ID: ");
        int id = input.nextInt();
        input.nextLine();

        System.out.print("Enter name: ");
        String name = input.nextLine();

        double[] grades = new double[3];
        for (int i = 0; i < 3; i++) {
          System.out.print("Enter grade " + (i + 1) + ": ");
          grades[i] = input.nextDouble();
        }

        students.add(new Student(id, name, grades));
        System.out.println("Student added successfully.");

      } catch (InvalidStudentDataException e) {
        System.out.println("Error: " + e.getMessage());
      } catch (InputMismatchException e) {
        System.out.println("Invalid input.");
        input.nextLine();
      }
    }

    private static void viewStudents() {
      if (students.isEmpty()) {
        System.out.println("No students found.");
        return;
      }

      for (Student s : students) {
        System.out.println(s);
      }
    }

    private static void searchStudent(Scanner input) {
      System.out.print("Enter student ID: ");
      int id = input.nextInt();

      for (Student s : students) {
        if (s.getId() == id) {
          System.out.println(s);
          return;
        }
      }
      System.out.println("Student not found.");
    }

    private static void deleteStudent(Scanner input) {
      System.out.print("Enter student ID to delete: ");
      int id = input.nextInt();

      Iterator<Student> it = students.iterator();
      while (it.hasNext()) {
        if (it.next().getId() == id) {
          it.remove();
          System.out.println("Student removed.");
          return;
        }
      }
      System.out.println("Student not found.");
    }

    private static void calculateClassAverage() {
      if (students.isEmpty()) {
        System.out.println("No students available.");
        return;
      }

      double sum = 0;
      for (Student s : students) {
        sum += s.getAverage();
      }
      System.out.println("Class Average: " + String.format("%.2f", sum / students.size()));
    }

    // ===== FILE METHODS =====
    private static void saveToFile() {
      try (PrintWriter pw = new PrintWriter(new FileWriter(FILE_NAME))) {
        for (Student s : students) {
          pw.println(s.toFileString());
        }
        System.out.println("Saved " + students.size() + " students to file.");
      } catch (IOException e) {
        System.out.println("File saving error.");
      }
    }

    private static void loadFromFile() {
      File file = new File(FILE_NAME);
      if (!file.exists()) return;

      try (Scanner fileInput = new Scanner(file)) {
        while (fileInput.hasNextLine()) {
          String[] parts = fileInput.nextLine().split(",");
          int id = Integer.parseInt(parts[0]);
          String name = parts[1];
          double[] grades = {
              Double.parseDouble(parts[2]),
              Double.parseDouble(parts[3]),
              Double.parseDouble(parts[4])
          };
          students.add(new Student(id, name, grades));
        }
      } catch (Exception e) {
        System.out.println("Error loading file.");
      }
    }
  }
  `,
    expectedFeatures: [
      'Complete menu-driven interface',
      'Two custom exception classes with proper constructors',
      'Student class with all required fields and methods',
      'Add student functionality with input validation',
      'View all students with formatted output',
      'Search student by ID or name',
      'Delete student by ID',
      'Calculate individual and class averages',
      'Load data from file on startup using try-with-resources',
      'Save data to file on exit using try-with-resources',
      'Comprehensive exception handling throughout',
      'User-friendly error messages',
      'Input validation for all user inputs',
      'Proper resource management (no resource leaks)'
    ],
    estimatedTime: '120-150 minutes',
    difficulty: 'Hard',
    points: 200
  }
};

// ============================================================================
// EXPORT MODULES
// ============================================================================

export const javaLearnerCurriculumPart2: DetailedModule[] = [
  module7,
  module8
];

export default javaLearnerCurriculumPart2;
