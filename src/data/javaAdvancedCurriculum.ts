// Advanced Track Java Curriculum - Part 1: Modules 9 & 10
// Comprehensive Java Curriculum for Advanced-Level Learners
// Includes: Lessons, Hands-on Exercises, Assessment Projects

import type { DetailedModule, DetailedLesson, Exercise, Project } from './javaBeginnerCurriculum';

// Module 9: Advanced OOP Concepts
export const module9: DetailedModule = {
  id: 'advanced-module-9',
  week: 9,
  title: 'Advanced OOP Concepts - Nested Classes, Enums, and Design Patterns',
  description: 'Explore sophisticated object-oriented programming techniques including nested classes, enumeration types, and foundational design patterns that form the backbone of enterprise Java applications.',
  category: 'Advanced',
  requiredLevel: 'Advanced',
  estimatedHours: 4.5,

  objectives: [
    'Master nested and inner class architectures',
    'Implement type-safe enumerations with behavior',
    'Apply fundamental design patterns (Singleton, Factory, Observer, Strategy)',
    'Understand lambda expressions and functional interfaces',
    'Design scalable and maintainable object-oriented systems'
  ],

  learningPhilosophy: 'This module elevates your understanding of object-oriented design by introducing advanced techniques used in professional software development. Each concept builds toward creating flexible, maintainable, and elegant solutions to complex programming challenges.',

  theoreticalFoundation: [
    'Nested classes provide logical grouping and encapsulation of helper classes within their context',
    'Inner classes have access to the outer class\'s members, enabling sophisticated object relationships',
    'Enumerations create type-safe constants with associated behavior and state',
    'Design patterns are proven solutions to recurring design problems in software engineering',
    'Lambda expressions enable functional programming paradigms within Java\'s object-oriented framework',
    'Understanding when to apply advanced OOP techniques separates competent programmers from experts'
  ],

  lessons: [
    {
      id: 'advanced-lesson-9-1',
      title: 'Nested and Inner Classes',
      description: 'Master static nested classes, non-static inner classes, local classes, and anonymous classes for creating sophisticated object relationships.',
      duration: '60 minutes',
      difficulty: 'Expert',
      concepts: [
        'Static nested classes',
        'Non-static inner classes',
        'Local classes within methods',
        'Anonymous classes',
        'Access modifiers with nested classes',
        'Use cases and best practices'
      ],
      theoreticalFoundation: [
        'Static nested classes are top-level classes nested within another class for packaging convenience',
        'Inner classes maintain a reference to their enclosing instance, accessing private members',
        'Local classes are defined within method blocks, useful for limited-scope implementations',
        'Anonymous classes provide concise implementations of interfaces or abstract classes',
        'Nested classes improve encapsulation by hiding implementation details',
        'Understanding nested class types helps choose the right tool for each design scenario'
      ],
      netBeansGuidance: [
        'NetBeans displays nested class hierarchy in the Navigator window',
        'Use Ctrl+Click to navigate between outer and inner class references',
        'Code completion suggests nested class constructors with proper syntax',
        'Refactor > Move Class helps reorganize nested class structures',
        'Debugger shows separate instances for inner and outer classes'
      ],
      codeExamples: [
        {
          title: 'Static Nested Class Example',
          description: 'Demonstrates static nested classes for logical grouping.',
          code: `public class University {
    private static String universityName = "Tech University";
    
    // Static nested class
    public static class Department {
        private String departmentName;
        private int facultyCount;
        
        public Department(String name, int count) {
            this.departmentName = name;
            this.facultyCount = count;
        }
        
        public void displayInfo() {
            // Can access static members of outer class
            System.out.println("University: " + universityName);
            System.out.println("Department: " + departmentName);
            System.out.println("Faculty Count: " + facultyCount);
        }
    }
    
    public static void main(String[] args) {
        // Creating static nested class instance
        University.Department csDept = new University.Department("Computer Science", 25);
        csDept.displayInfo();
    }
}`,
          explanation: 'Static nested classes are independent of outer class instances and can only access static members of the outer class. They are useful for logical grouping and packaging convenience.'
        }
      ],
      practiceExercises: [
        'Create a LinkedList implementation using inner Node class',
        'Design an event system using anonymous classes for listeners',
        'Implement a Builder pattern using static nested class',
        'Create a local class for sorting with custom comparison logic'
      ]
    },
    {
      id: 'advanced-lesson-9-2',
      title: 'Enumeration Types with Behavior',
      description: 'Master enum types for creating type-safe constants with associated state, behavior, and advanced features.',
      duration: '45 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'Enum declaration and usage',
        'Enum constructors and fields',
        'Enum methods and behavior',
        'EnumSet and EnumMap',
        'Enum with abstract methods',
        'Enum best practices'
      ],
      theoreticalFoundation: [
        'Enums provide type-safe alternatives to integer or string constants',
        'Each enum constant is a singleton instance of the enum type',
        'Enums can have constructors, fields, and methods like regular classes',
        'Enum constants can override methods for constant-specific behavior',
        'EnumSet and EnumMap provide specialized, high-performance collections',
        'Enums improve code clarity and prevent invalid constant values'
      ],
      netBeansGuidance: [
        'Create new enum: New > Java Class > Class Kind: Enum',
        'NetBeans provides code completion for enum constants',
        'Use Source > Generate to add enum methods',
        'Navigator window shows all enum constants and members',
        'Refactoring safely updates enum constant references'
      ],
      codeExamples: [],
      practiceExercises: [
        'Create a Planet enum with mass, radius, and gravity calculations',
        'Design a Size enum (S, M, L, XL) with abbreviations and descriptions',
        'Implement a TrafficLight enum with duration and next state logic',
        'Build a GameDifficulty enum with score multipliers and settings'
      ]
    },
    {
      id: 'advanced-lesson-9-3',
      title: 'Essential Design Patterns',
      description: 'Learn and implement fundamental design patterns including Singleton, Factory, Observer, and Strategy patterns.',
      duration: '70 minutes',
      difficulty: 'Expert',
      concepts: [
        'Singleton pattern for single instances',
        'Factory pattern for object creation',
        'Observer pattern for event notification',
        'Strategy pattern for algorithm selection',
        'When to apply each pattern',
        'Pattern trade-offs and considerations'
      ],
      theoreticalFoundation: [
        'Design patterns are reusable solutions to common software design problems',
        'Singleton ensures a class has only one instance with global access',
        'Factory pattern abstracts object creation, promoting loose coupling',
        'Observer pattern defines one-to-many dependencies for event notification',
        'Strategy pattern encapsulates algorithms, making them interchangeable',
        'Patterns improve code maintainability, flexibility, and communication among developers'
      ],
      netBeansGuidance: [
        'Use package structure to organize pattern implementations',
        'NetBeans class diagrams visualize pattern relationships',
        'Code templates can be created for common patterns',
        'Refactoring tools help apply patterns to existing code',
        'UML plugins can document pattern structures'
      ],
      codeExamples: [],
      practiceExercises: [
        'Implement Singleton database connection manager',
        'Create Factory pattern for shape creation',
        'Build Observer pattern for stock price updates',
        'Design Strategy pattern for payment processing'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'advanced-ex-9-1',
      title: 'Inner Class Implementation',
      description: 'Create a binary tree using inner Node class',
      difficulty: 'Medium',
      instructions: [
        'Create BinaryTree class with inner Node class',
        'Implement insert, search, and traversal methods',
        'Use inner class to access tree structure',
        'Test with various data sets'
      ],
      starterCode: `public class BinaryTree {
    private Node root;
    
    // Inner Node class
    private class Node {
        int data;
        Node left, right;
        
        Node(int data) {
            this.data = data;
        }
    }
    
    public void insert(int value) {
        // Implement insertion logic
    }
    
    public boolean search(int value) {
        // Implement search logic
        return false;
    }
    
    public void inorderTraversal() {
        // Implement traversal
    }
}`,
      expectedOutput: `=== Binary Tree Test ===

Inserting: 50, 30, 70, 20, 40, 60, 80

Inorder Traversal: 20 30 40 50 60 70 80

Search Results:
Search for 40: Found
Search for 100: Not Found

Tree structure demonstrates inner class accessing tree nodes.`,
      hints: [
        'Inner class can access outer class private members',
        'Use recursion for tree operations',
        'Start from root for all operations'
      ],
      points: 100
    },
    {
      id: 'advanced-ex-9-2',
      title: 'Enum with Behavior',
      description: 'Create comprehensive Planet enum with calculations',
      difficulty: 'Medium',
      instructions: [
        'Define Planet enum with mass and radius',
        'Add gravitational constant field',
        'Implement surface gravity calculation',
        'Add weight on planet calculation method',
        'Test with all planets'
      ],
      starterCode: `public enum Planet {
    MERCURY, VENUS, EARTH, MARS, JUPITER, SATURN, URANUS, NEPTUNE;
    
    // Universal gravitational constant
    private static final double G = 6.67300E-11;
    
    private final double mass;
    private final double radius;
    
    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }
    
    public double surfaceGravity() {
        // Calculate and return surface gravity
        return 0.0;
    }
    
    public double surfaceWeight(double otherMass) {
        // Calculate weight on this planet
        return 0.0;
    }
}`,
      expectedOutput: `=== Planetary Weight Calculator ===

Your weight on Earth: 175.0 lbs

Your weight on different planets:
Mercury: 66.3 lbs (Surface Gravity: 3.70 m/s²)
Venus: 158.4 lbs (Surface Gravity: 8.87 m/s²)
Earth: 175.0 lbs (Surface Gravity: 9.81 m/s²)
Mars: 66.5 lbs (Surface Gravity: 3.71 m/s²)
Jupiter: 441.0 lbs (Surface Gravity: 24.79 m/s²)
Saturn: 186.9 lbs (Surface Gravity: 10.44 m/s²)
Uranus: 158.1 lbs (Surface Gravity: 8.87 m/s²)
Neptune: 197.8 lbs (Surface Gravity: 11.15 m/s²)`,
      hints: [
        'Gravity = G * mass / (radius * radius)',
        'Weight = mass * surface gravity',
        'Use scientific notation for large numbers'
      ],
      points: 120
    },
    {
      id: 'advanced-ex-9-3',
      title: 'Design Pattern Implementation',
      description: 'Implement Singleton and Factory patterns',
      difficulty: 'Hard',
      instructions: [
        'Create thread-safe Singleton configuration manager',
        'Implement Factory for creating different report types',
        'Use enums for report types',
        'Demonstrate both patterns working together',
        'Include comprehensive testing'
      ],
      starterCode: `// Singleton Configuration Manager
class ConfigurationManager {
    private static volatile ConfigurationManager instance;
    
    private ConfigurationManager() {
        // Private constructor
    }
    
    public static ConfigurationManager getInstance() {
        // Implement double-checked locking
        return null;
    }
}

// Factory Pattern for Reports
enum ReportType {
    PDF, HTML, CSV
}

interface Report {
    void generate();
}

class ReportFactory {
    public static Report createReport(ReportType type) {
        // Implement factory logic
        return null;
    }
}`,
      expectedOutput: `=== Design Pattern Demonstration ===

--- Singleton Pattern Test ---
Creating ConfigurationManager instance 1: ConfigurationManager@1a2b3c
Creating ConfigurationManager instance 2: ConfigurationManager@1a2b3c
✓ Singleton verified: Both references point to same instance

--- Factory Pattern Test ---
Creating PDF Report...
Generating PDF Report: Sales_Q1_2024.pdf

Creating HTML Report...
Generating HTML Report: Sales_Q1_2024.html

Creating CSV Report...
Generating CSV Report: Sales_Q1_2024.csv

✓ Factory Pattern successfully created 3 different report types`,
      hints: [
        'Use volatile for thread safety',
        'Implement double-checked locking',
        'Create separate classes for each report type'
      ],
      points: 150
    }
  ],

  assessmentProject: {
    id: 'advanced-project-9',
    title: 'Event Management System with Design Patterns',
    description: 'Build a comprehensive event management system using nested classes, enums, and multiple design patterns.',
    objectives: [
      'Apply nested classes for complex data structures',
      'Use enums for type-safe constants',
      'Implement Singleton, Factory, and Observer patterns',
      'Create maintainable, extensible architecture'
    ],
    requirements: [
      'Event class hierarchy using nested classes',
      'EventType and EventStatus enums',
      'Singleton EventManager',
      'Factory for creating different event types',
      'Observer pattern for event notifications',
      'Comprehensive testing',
      'Professional documentation'
    ],
    starterCode: `import java.util.*;

// Main Event Management System
public class EventManagementSystem {
    public static void main(String[] args) {
        // Initialize system components
    }
}

// Singleton Event Manager
class EventManager {
    private static volatile EventManager instance;
    
    private EventManager() {}
    
    public static EventManager getInstance() {
        return null; // Implement
    }
}

// Event class with nested classes
class Event {
    private String id;
    private String name;
    private EventType type;
    private EventStatus status;
    
    // Nested class for event details
    static class EventDetails {
        // Implement
    }
}

// Enums
enum EventType {
    CONFERENCE, WORKSHOP, SEMINAR, WEBINAR
}

enum EventStatus {
    SCHEDULED, ONGOING, COMPLETED, CANCELLED
}`,
    expectedFeatures: [
      'Working Singleton pattern',
      'Factory for event creation',
      'Observer pattern for notifications',
      'Nested classes for organization',
      'Comprehensive enum usage',
      'Full CRUD operations',
      'Error handling',
      'Documentation'
    ],
    estimatedTime: '3-4 hours',
    difficulty: 'Hard',
    points: 250
  }
};

// Module 10: Collections Framework
export const module10: DetailedModule = {
  id: 'advanced-module-10',
  week: 10,
  title: 'Collections Framework - Mastering Data Structures',
  description: 'Master the Java Collections Framework, understanding the hierarchy of interfaces and classes that provide sophisticated data structure implementations.',
  category: 'Advanced',
  requiredLevel: 'Advanced',
  estimatedHours: 5,

  objectives: [
    'Master the Collections Framework hierarchy and interfaces',
    'Implement and manipulate List, Set, and Map collections',
    'Apply generics for type-safe collection programming',
    'Utilize iterators and enhanced iteration techniques',
    'Implement custom comparators and sorting strategies',
    'Understand performance characteristics of different collections'
  ],

  learningPhilosophy: 'This module transforms your understanding of data structures from theoretical concepts to practical, production-ready implementations. The Collections Framework represents decades of computer science research distilled into elegant, reusable APIs.',

  theoreticalFoundation: [
    'The Collections Framework provides a unified architecture for representing and manipulating collections',
    'Understanding the Collection hierarchy: Collection → List/Set/Queue → specific implementations',
    'Map interface stands separately, representing key-value associations',
    'Generics ensure compile-time type safety',
    'Each collection type offers different performance characteristics',
    'The framework emphasizes programming to interfaces'
  ],

  lessons: [
    {
      id: 'advanced-lesson-10-1',
      title: 'Collections Framework Architecture',
      description: 'Understand the complete architecture of the Collections Framework, including interfaces, abstract classes, and concrete implementations.',
      duration: '65 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'Collection interface hierarchy',
        'List, Set, Queue interfaces',
        'Map interface and implementations',
        'Abstract collection classes',
        'Choosing the right collection',
        'Collections Framework design patterns'
      ],
      theoreticalFoundation: [
        'Collection interface defines fundamental operations',
        'List maintains insertion order and allows duplicates',
        'Set guarantees uniqueness',
        'Queue provides FIFO ordering',
        'Map associates keys with values',
        'Abstract classes provide skeletal implementations'
      ],
      netBeansGuidance: [
        'NetBeans provides excellent autocomplete for collection methods',
        'Use Ctrl+Space after typing a collection variable',
        'Import optimization automatically adds java.util imports',
        'Debugger visualizes collection contents'
      ],
      codeExamples: [],
      practiceExercises: [
        'Analyze scenarios and select appropriate collections',
        'Convert between different collection types',
        'Measure performance differences',
        'Implement system using multiple collection types'
      ]
    },
    {
      id: 'advanced-lesson-10-2',
      title: 'List Collections - ArrayList and LinkedList',
      description: 'Master List implementations including ArrayList and LinkedList with their internal workings and performance characteristics.',
      duration: '65 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'ArrayList internal structure',
        'LinkedList doubly-linked implementation',
        'Performance comparison',
        'List iteration techniques',
        'SubList views',
        'List algorithms'
      ],
      theoreticalFoundation: [
        'ArrayList uses dynamic array internally',
        'LinkedList uses doubly-linked nodes',
        'ArrayList provides O(1) random access',
        'LinkedList excels at insertions/deletions',
        'List interface provides index-based operations',
        'SubList creates backed views'
      ],
      netBeansGuidance: [
        'Type suggestions for List implementations',
        'Debugger shows ArrayList capacity',
        'Performance profiler compares implementations'
      ],
      codeExamples: [],
      practiceExercises: [
        'Implement custom ArrayList',
        'Create music playlist using LinkedList',
        'Compare performance for different operations',
        'Build undo/redo system'
      ]
    },
    {
      id: 'advanced-lesson-10-3',
      title: 'Set Collections - HashSet and TreeSet',
      description: 'Master Set implementations for ensuring uniqueness with HashSet and TreeSet.',
      duration: '60 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'Set interface uniqueness',
        'HashSet hash-based implementation',
        'TreeSet sorted collections',
        'Equals and hashCode contract',
        'NavigableSet operations',
        'Set operations'
      ],
      theoreticalFoundation: [
        'Sets guarantee element uniqueness',
        'HashSet provides O(1) operations',
        'TreeSet maintains sorted order',
        'Proper hashCode implementation required',
        'TreeSet requires Comparable',
        'NavigableSet adds navigation methods'
      ],
      netBeansGuidance: [
        'Warnings for missing hashCode',
        'Code generation for equals/hashCode',
        'Debugger shows hash buckets'
      ],
      codeExamples: [],
      practiceExercises: [
        'Implement duplicate detector',
        'Create leaderboard system',
        'Build spell checker',
        'Perform set operations'
      ]
    },
    {
      id: 'advanced-lesson-10-4',
      title: 'Map Collections - HashMap and TreeMap',
      description: 'Master Map implementations for key-value associations.',
      duration: '70 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'Map interface',
        'HashMap hash-based storage',
        'TreeMap sorted keys',
        'Map operations',
        'Entry set views',
        'Map iteration'
      ],
      theoreticalFoundation: [
        'Maps associate unique keys with values',
        'HashMap provides O(1) performance',
        'TreeMap maintains sorted keys',
        'No duplicate keys allowed',
        'EntrySet for iteration',
        'KeySet and values views'
      ],
      netBeansGuidance: [
        'Type suggestions for Map',
        'Code completion for Map methods',
        'Debugger shows map entries'
      ],
      codeExamples: [],
      practiceExercises: [
        'Build phone directory',
        'Create configuration manager',
        'Implement word frequency analyzer',
        'Build time-series analyzer'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'advanced-ex-10-1',
      title: 'Student Management System',
      description: 'Build system using multiple collection types',
      difficulty: 'Medium',
      instructions: [
        'Use ArrayList for student list',
        'Use HashMap for student ID lookup',
        'Use TreeSet for grade ranking',
        'Implement add, remove, search operations',
        'Create reporting functionality'
      ],
      starterCode: `import java.util.*;

class Student {
    private String id;
    private String name;
    private double gpa;
    
    public Student(String id, String name, double gpa) {
        this.id = id;
        this.name = name;
        this.gpa = gpa;
    }
    
    // Add getters
}

public class StudentManagementSystem {
    private ArrayList<Student> studentList;
    private HashMap<String, Student> studentMap;
    private TreeSet<Student> rankingSet;
    
    public void addStudent(Student student) {
        // Implement
    }
    
    public Student findStudent(String id) {
        // Implement
        return null;
    }
}`,
      expectedOutput: `=== Student Management System ===

--- Adding Students ---
✓ Added: S001 - Alice Johnson (GPA: 3.85)
✓ Added: S002 - Bob Smith (GPA: 3.92)
✓ Added: S003 - Carol White (GPA: 3.67)
✓ Added: S004 - David Lee (GPA: 3.78)

--- Student Lookup Test ---
Looking up S002...
Found: Bob Smith, GPA: 3.92

--- Grade Rankings (TreeSet - Sorted by GPA) ---
Rank 1: Bob Smith (GPA: 3.92)
Rank 2: Alice Johnson (GPA: 3.85)
Rank 3: David Lee (GPA: 3.78)
Rank 4: Carol White (GPA: 3.67)

Total Students: 4
Collections synchronized successfully.`,
      hints: [
        'Use HashMap for O(1) lookup',
        'TreeSet needs Comparator',
        'Keep collections synchronized'
      ],
      points: 120
    },
    {
      id: 'advanced-ex-10-2',
      title: 'Word Frequency Counter',
      description: 'Analyze text and count word frequencies',
      difficulty: 'Medium',
      instructions: [
        'Read text input',
        'Use HashMap to count frequencies',
        'Sort by frequency using TreeMap',
        'Display top N most common words',
        'Handle case-insensitive counting'
      ],
      starterCode: `import java.util.*;

public class WordFrequencyCounter {
    private HashMap<String, Integer> wordCounts;
    
    public void processText(String text) {
        // Implement word counting
    }
    
    public void displayTopWords(int n) {
        // Display top N words
    }
    
    public static void main(String[] args) {
        // Test with sample text
    }
}`,
      expectedOutput: `=== Word Frequency Counter ===

Processing text: "Java is powerful. Java is versatile. Java is everywhere. Programming in Java is fun."

--- Word Frequency Results ---
Total unique words: 7
Total word count: 14

--- Top 5 Most Frequent Words ---
1. "java" - 4 occurrences
2. "is" - 4 occurrences
3. "programming" - 1 occurrence
4. "in" - 1 occurrence
5. "fun" - 1 occurrence

✓ Case-insensitive counting applied
✓ HashMap used for efficient frequency tracking`,
      hints: [
        'Use toLowerCase() for case-insensitive',
        'Split text on whitespace',
        'Sort by values, not keys'
      ],
      points: 100
    },
    {
      id: 'advanced-ex-10-3',
      title: 'Custom Generic Collection',
      description: 'Implement custom generic ArrayList',
      difficulty: 'Hard',
      instructions: [
        'Create generic MyArrayList<T> class',
        'Implement add, get, remove, size methods',
        'Handle dynamic resizing',
        'Implement Iterator interface',
        'Add comprehensive error checking'
      ],
      starterCode: `import java.util.Iterator;

public class MyArrayList<T> implements Iterable<T> {
    private Object[] elements;
    private int size;
    private static final int DEFAULT_CAPACITY = 10;
    
    public MyArrayList() {
        elements = new Object[DEFAULT_CAPACITY];
        size = 0;
    }
    
    public void add(T element) {
        // Implement with auto-resize
    }
    
    public T get(int index) {
        // Implement with bounds checking
        return null;
    }
    
    public Iterator<T> iterator() {
        // Implement iterator
        return null;
    }
}`,
      expectedOutput: `=== Custom Generic ArrayList Test ===

--- Testing with String Type ---
Initial capacity: 10
Adding elements: Apple, Banana, Cherry, Date, Elderberry

Size: 5
Element at index 2: Cherry

--- Testing Auto-Resize ---
Adding 8 more elements to trigger resize...
Array resized from 10 to 20
Size after resize: 13

--- Testing Iterator ---
Iterating through all elements:
Apple, Banana, Cherry, Date, Elderberry, Fig, Grape, Honeydew, Kiwi, Lemon, Mango, Nectarine, Orange

--- Testing with Integer Type ---
Adding: 10, 20, 30, 40, 50
Sum using iterator: 150

✓ Generic implementation working correctly
✓ Dynamic resizing functional
✓ Iterator pattern implemented successfully`,
      hints: [
        'Resize when size equals capacity',
        'Use System.arraycopy for efficiency',
        'Create inner Iterator class'
      ],
      points: 150
    }
  ],

  assessmentProject: {
    id: 'advanced-project-10',
    title: 'Library Management System',
    description: 'Build comprehensive library system using Collections Framework.',
    objectives: [
      'Utilize multiple collection types appropriately',
      'Implement efficient search and sorting',
      'Apply generics throughout',
      'Create professional user interface'
    ],
    requirements: [
      'Book class with ISBN, title, author, availability',
      'Member class with ID, name, borrowed books',
      'Use ArrayList for book inventory',
      'Use HashMap for ISBN lookup',
      'Use TreeSet for author/title sorting',
      'Use HashMap for member management',
      'Implement borrow/return functionality',
      'Search by multiple criteria',
      'Generate reports',
      'File persistence'
    ],
    starterCode: `import java.util.*;

class Book implements Comparable<Book> {
    private String isbn;
    private String title;
    private String author;
    private boolean available;
    
    // Implement constructor and methods
    
    public int compareTo(Book other) {
        // Compare by title
        return 0;
    }
}

class Member {
    private String memberId;
    private String name;
    private ArrayList<Book> borrowedBooks;
    
    // Implement
}

public class LibraryManagementSystem {
    private ArrayList<Book> inventory;
    private HashMap<String, Book> isbnLookup;
    private HashMap<String, Member> members;
    private TreeSet<Book> sortedByTitle;
    
    public void addBook(Book book) {
        // Implement
    }
    
    public boolean borrowBook(String memberId, String isbn) {
        // Implement
        return false;
    }
    
    public boolean returnBook(String memberId, String isbn) {
        // Implement
        return false;
    }
    
    public static void main(String[] args) {
        // Create menu-driven interface
    }
}`,
    expectedFeatures: [
      'Multiple collection types used appropriately',
      'Efficient lookups and sorting',
      'Complete borrow/return system',
      'Search functionality',
      'Report generation',
      'Error handling',
      'Data persistence',
      'Professional menu interface'
    ],
    estimatedTime: '4-5 hours',
    difficulty: 'Hard',
    points: 300
  }
};

// Advanced track modules (Part 1)
export const advancedTrack: DetailedModule[] = [module9, module10];

/**
 * Get all advanced modules (Part 1)
 */
export function getAllModules(): DetailedModule[] {
  return advancedTrack;
}

/**
 * Get module by ID
 */
export function getModuleById(moduleId: string): DetailedModule | undefined {
  return advancedTrack.find(m => m.id === moduleId);
}

/**
 * Get module by week number
 */
export function getModuleByWeek(week: number): DetailedModule | undefined {
  return advancedTrack.find(m => m.week === week);
}

/**
 * Check if user can access a module in the advanced track
 */
export function canAccessModule(moduleWeek: number, completedModules: string[]): boolean {
  if (moduleWeek <= 9) return true; // allow access to first advanced module
  const previousModule = advancedTrack.find(m => m.week === moduleWeek - 1);
  if (!previousModule) return false;
  return completedModules.includes(previousModule.id);
}

export function getAdvancedTrackStats() {
  return {
    totalModules: advancedTrack.length,
    totalLessons: advancedTrack.reduce((sum, m) => sum + (m.lessons?.length || 0), 0),
    totalExercises: advancedTrack.reduce((sum, m) => sum + (m.handsOnExercises?.length || 0), 0),
    totalProjects: advancedTrack.filter(m => m.assessmentProject).length,
    estimatedTotalHours: advancedTrack.reduce((sum, m) => sum + (m.estimatedHours || 0), 0)
  };
}

export type { DetailedModule, DetailedLesson, Exercise, Project };

export default advancedTrack;