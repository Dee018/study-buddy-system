# Curriculum SQL Inserts

This file contains SQL INSERT statements to populate the Supabase PostgreSQL tables for the curriculum using the static data in `src/data`.

Notes:
- All inserted rows set `is_published = TRUE` for testing.
- Text arrays use `ARRAY[...]::text[]` and JSON fields use `jsonb` literals.
- `estimated_hours` and `estimated_minutes` are integers (rounded where original data used fractions).

Run these statements in the Supabase SQL editor or any Postgres client connected to your Supabase DB.

```sql
-- Curriculum Modules
INSERT INTO curriculum_modules (id, week_number, title, description, track, difficulty_level, estimated_hours, xp_reward, prerequisites, is_published, order_index) VALUES
('beginner-module-1', 1, 'Foundation Building - Introduction to Java and Development Environment', $$This foundational week establishes your programming journey by introducing Java's core concepts and setting up your development environment. You'll understand Java's position in the programming landscape, configure NetBeans for optimal development, and write your first Java programs.$$ , 'Beginner', 'Beginner', 4, 150, ARRAY[]::text[], TRUE, 1),
('beginner-module-2', 2, 'Control Flow Mastery - Operators and Decision Making', $$Master Java operators and control structures for decision making and repetitive tasks. Learn to create programs that respond intelligently to different inputs and conditions.$$ , 'Beginner', 'Beginner', 5, 150, ARRAY[]::text[], TRUE, 2),
('beginner-module-3', 3, 'Method Mastery - Modular Programming and Parameter Handling', $$Learn to create reusable code with methods, understand parameter passing, and apply proper scoping. Transform your programming from linear scripts into modular, maintainable components.$$ , 'Beginner', 'Beginner', 4, 150, ARRAY[]::text[], TRUE, 3),
('beginner-module-4', 4, 'Data Structure Foundations - Arrays and String Manipulation', $$Master array operations, multidimensional arrays, and comprehensive string manipulation techniques. Learn to work with collections of data and text processing.$$ , 'Beginner', 'Beginner', 4, 200, ARRAY[]::text[], TRUE, 4),
('learner-module-5', 5, 'Object-Oriented Programming Basics - Classes and Objects', $$Transition from procedural to object-oriented programming by mastering classes, objects, constructors, and encapsulation. Learn to design and implement real-world entities as software objects with attributes and behaviors.$$ , 'Learner', 'Learner', 5, 200, ARRAY[]::text[], TRUE, 5),
('learner-module-6', 6, 'Inheritance and Polymorphism - Advanced OOP Concepts', $$Master inheritance hierarchies, method overriding, and polymorphic behavior to create flexible and reusable code. Learn to design class relationships that model real-world scenarios effectively.$$ , 'Learner', 'Learner', 5, 200, ARRAY[]::text[], TRUE, 6),
('learner-module-7', 7, 'Interfaces and Abstract Classes - Designing Flexible Systems', $$Master the art of designing flexible, maintainable systems using interfaces and abstract classes. Learn to create contracts for behavior and implement multiple inheritance through interfaces.$$ , 'Learner', 'Learner', 5, 200, ARRAY[]::text[], TRUE, 7),
('learner-module-8', 8, 'Exception Handling and File I/O - Building Robust Applications', $$Master exception handling mechanisms to create resilient applications and implement robust file input/output operations. Learn to handle errors gracefully and work with files effectively.$$ , 'Learner', 'Learner', 5, 200, ARRAY[]::text[], TRUE, 8
;

-- Curriculum Lessons
INSERT INTO curriculum_lessons (id, module_id, title, content, order_index, estimated_minutes, xp_reward, is_published) VALUES
('beginner-lesson-1-1','beginner-module-1','What is Java? Understanding the Language', $$Learn about Java's history, applications, and architecture including JVM, JRE, and JDK. Concepts: Java history, applications, JVM architecture, JRE vs JDK, platform independence, OOP fundamentals. See lesson materials for examples and practice tasks.$$ , 1, 45, 0, TRUE),
('beginner-lesson-1-2','beginner-module-1','Development Environment Setup with NetBeans', $$Set up NetBeans IDE, create your first project, run the Hello World program, and explore IDE features (code completion, debugger, project explorer). Includes Hello World example and enhanced formatting demo.$$ , 2, 60, 0, TRUE),
('beginner-lesson-1-3','beginner-module-1','Basic Syntax and Program Structure', $$Understand class structure, main method, comments, statements, case sensitivity, and code examples demonstrating program structure and comments.$$ , 3, 50, 0, TRUE),
('beginner-lesson-1-4','beginner-module-1','Data Types and Variables', $$Learn primitive types, variable declaration and initialization, naming conventions, constants (final), and short examples demonstrating variables and constants.$$ , 4, 55, 0, TRUE),

('beginner-lesson-2-1','beginner-module-2','Java Operators and Precedence', $$Arithmetic, assignment, comparison, logical operators; operator precedence; demo examples and practice exercises.$$ , 1, 50, 0, TRUE),
('beginner-lesson-2-2','beginner-module-2','Conditional Statements - if, else, switch', $$Implement decision-making logic using if-else and switch; includes grading system and enhanced calculator examples.$$ , 2, 55, 0, TRUE),
('beginner-lesson-2-3','beginner-module-2','Loop Structures - for, while, do-while', $$Master loop structures, nested loops, break/continue, and pattern printing examples including a number guessing game.$$ , 3, 60, 0, TRUE),
('beginner-lesson-2-4','beginner-module-2','NetBeans Debugging Mastery', $$Debugging tools: breakpoints, step over/into/out, variables window, watches, call stack; guided debugging practice.$$ , 4, 40, 0, TRUE),

('beginner-lesson-3-1','beginner-module-3','Method Fundamentals and Structure', $$Method anatomy: access modifiers, return types, parameters, method calling; includes basic method examples and math utilities.$$ , 1, 55, 0, TRUE),
('beginner-lesson-3-2','beginner-module-3','Parameter Passing and Method Overloading', $$Pass-by-value, method signatures, overloading strategies, and practical examples demonstrating overload resolution.$$ , 2, 50, 0, TRUE),
('beginner-lesson-3-3','beginner-module-3','Variable Scope and Lifetime', $$Local vs instance vs static variables, scope rules, shadowing, and lifetime examples with 'this' usage.$$ , 3, 45, 0, TRUE),

('beginner-lesson-4-1','beginner-module-4','Array Fundamentals and Operations', $$Array declaration, initialization, traversal, basic algorithms (sum, min, max), and array examples.$$ , 1, 55, 0, TRUE),
('beginner-lesson-4-2','beginner-module-4','Multidimensional Arrays and Matrix Operations', $$2D arrays, matrix traversal, row/column sums, and matrix examples including addition/multiplication concepts.$$ , 2, 60, 0, TRUE),
('beginner-lesson-4-3','beginner-module-4','String Processing and Manipulation', $$String immutability, common String methods (charAt, substring, indexOf, split), StringBuilder usage and examples.$$ , 3, 50, 0, TRUE),

('learner-lesson-5-1','learner-module-5','Introduction to Object-Oriented Programming Paradigm', $$OOP fundamentals: classes vs procedural code, OOP principles (encapsulation, inheritance, polymorphism, abstraction), and initial design exercises.$$ , 1, 45, 0, TRUE),
('learner-lesson-5-2','learner-module-5','Defining Classes and Creating Objects', $$Class design, attributes, methods, object instantiation patterns, and small object examples (Product, Car).$$ , 2, 60, 0, TRUE),
('learner-lesson-5-3','learner-module-5','Encapsulation and Access Modifiers', $$Implement encapsulation using access modifiers and getter/setter methods.$$ , 3, 50, 0, TRUE),

('learner-lesson-6-1','learner-module-6','Understanding Inheritance in Java', $$Inheritance basics, IS-A relationships, extends/super keywords, and simple inheritance examples.$$ , 1, 60, 0, TRUE),
('learner-lesson-6-2','learner-module-6','Polymorphism and Method Overriding', $$Runtime polymorphism, method overriding with @Override, dynamic method dispatch, and polymorphic references examples.$$ , 2, 60, 0, TRUE),

('learner-lesson-7-1','learner-module-7','Introduction to Interfaces', $$Define and implement interfaces, multiple interface implementation, and Playable/Downloadable examples.$$ , 1, 60, 0, TRUE),
('learner-lesson-7-2','learner-module-7','Abstract Classes vs Interfaces', $$When to use abstract classes vs interfaces, template method patterns, and design guidance.$$ , 2, 60, 0, TRUE),

('learner-lesson-8-1','learner-module-8','Exception Handling Basics', $$try-catch-finally, checked vs unchecked exceptions, throw/throws, multiple catches, and best practices.$$ , 1, 60, 0, TRUE),
('learner-lesson-8-2','learner-module-8','File I/O Operations', $$Reading and writing files with Scanner/PrintWriter, try-with-resources, and file existence checks with examples.$$ , 2, 60, 0, TRUE)
('learner-lesson-6-3','learner-module-6','Abstract Classes and Methods', $$Implement abstract classes and enforce method implementation.$$ , 3, 50, 0, TRUE),
('learner-lesson-7-3','learner-module-7','Interface vs Abstract Classes', $$Choose between interfaces and abstract classes for different design scenarios.$$ , 3, 45, 0, TRUE),
('learner-lesson-8-3','learner-module-8','File I/O Operations', $$Read from and write to files using various I/O classes.$$ , 3, 65, 0, TRUE)
;

-- Curriculum Exercises
INSERT INTO curriculum_exercises (id, module_id, title, description, starter_code, solution_code, expected_output, test_cases, hints, difficulty, order_index, estimated_minutes, xp_reward, is_published) VALUES
('beginner-ex-1-1','beginner-module-1','Hello World Enhancement', $$Begin with the classic "Hello World" program and extend it to demonstrate NetBeans features.$$ , $$public class HelloWorld {
    public static void main(String[] args) {
        // Your code here
    }
}$$ , NULL, $$Welcome to Java Programming!
This is my first NetBeans project.
I'm ready to learn programming!$$ , '[]'::jsonb, '["Use System.out.println() to print each line","Remember that strings must be enclosed in double quotes","Each statement should end with a semicolon"]'::jsonb, 'Easy', 1, 30, 50, TRUE),
('beginner-ex-1-2','beginner-module-1','Variable Declaration and Initialization', $$Create a program that demonstrates various data types and variable usage.$$ , $$public class StudentInfo {
    public static void main(String[] args) {
        // Declare variables here

        // Display information
    }
}$$ , NULL, $$Student Name: Alex Johnson
Age: 19
GPA: 3.75
Enrolled: true
Grade: A$$ , '[]'::jsonb, '["String studentName = \"Your Name\";","Use concatenation with + to combine strings and variables","boolean values are lowercase: true or false"]'::jsonb, 'Easy', 2, 35, 75, TRUE),
('beginner-ex-1-3','beginner-module-1','NetBeans Debugging Introduction', $$Practice using NetBeans debugging capabilities by setting breakpoints and examining variables.$$ , $$public class DebugPractice {
    public static void main(String[] args) {
        int num1 = 10;
        int num2 = 20;
        int sum = num1 + num2;
        int product = num1 * num2;
        
        System.out.println("Sum: " + sum);
        System.out.println("Product: " + product);
    }
}$$ , NULL, $$Sum: 30
Product: 200$$ , '[]'::jsonb, '["Set a breakpoint at the line declaring num1","Watch how variables appear in the Variables window","Try changing a variable value during debugging"]'::jsonb, 'Medium', 3, 40, 100, TRUE),

('beginner-ex-2-1','beginner-module-2','Age Category Classifier', $$Create a program that classifies age into life stages using if-else statements.$$ , $$import java.util.Scanner;

public class AgeCategoryClassifier {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // implementation
        input.close();
    }
}$$ , NULL, $$Enter your age: 16
You are a Teen!$$ , '[]'::jsonb, '["Use if-else-if ladder for multiple categories","Remember to validate input before classification","Provide friendly messages for each category"]'::jsonb, 'Easy', 1, 30, 50, TRUE),
('beginner-ex-2-2','beginner-module-2','Simple Menu System', $$Build an interactive menu using switch statements.$$ , $$import java.util.Scanner;

public class MenuSystem {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        boolean running = true;
        // implementation
        input.close();
    }
}$$ , NULL, $$=== Main Menu ===
1. View Profile ...$$ , '[]'::jsonb, '["Use a while loop for menu repetition","Switch statement for choice handling","Don''t forget break statements in switch cases"]'::jsonb, 'Medium', 2, 40, 75, TRUE),
('beginner-ex-2-3','beginner-module-2','Sum of Numbers Calculator', $$Calculate the sum of numbers from 1 to N using loops.$$ , $$import java.util.Scanner;

public class SumCalculator {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // implementation
        input.close();
    }
}$$ , NULL, $$Enter a number: 10
Sum from 1 to 10: 55
Average: 5.5$$ , '[]'::jsonb, '["Initialize sum variable to 0 before loop","Use for loop from 1 to N","Average = sum / count"]'::jsonb, 'Easy', 3, 30, 50, TRUE),
('beginner-ex-2-4','beginner-module-2','Multiplication Table Generator', $$Generate multiplication tables using nested loops.$$ , $$import java.util.Scanner;

public class MultiplicationTable {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // implementation
        input.close();
    }
}$$ , NULL, $$    1   2   3   4   5 ...$$ , '[]'::jsonb, '["Use nested for loops","printf with %4d for column alignment","Outer loop for rows, inner loop for columns"]'::jsonb, 'Medium', 4, 45, 75, TRUE),

('beginner-ex-3-1','beginner-module-3','Temperature Converter Library', $$Create a utility library with methods for temperature conversions.$$ , $$public class TemperatureConverter {
    // Implement conversion methods here
    public static void main(String[] args) {
        // Test your methods here
    }
}$$ , NULL, $$=== Temperature Converter === ...$$ , '[]'::jsonb, '["Formula: F = C * 9/5 + 32","Formula: C = (F - 32) * 5/9","Formula: K = C + 273.15"]'::jsonb, 'Easy', 1, 35, 50, TRUE),
('beginner-ex-3-2','beginner-module-3','String Utility Methods', $$Create utility methods for string manipulation.$$ , $$public class StringUtilities {
    // Implement string manipulation methods
    public static void main(String[] args) {}
}$$ , NULL, $$=== String Utilities Demo === ...$$ , '[]'::jsonb, '["Use charAt() to access individual characters","Use length() for string length","StringBuilder helpful for string building"]'::jsonb, 'Medium', 2, 45, 75, TRUE),
('beginner-ex-3-3','beginner-module-3','Number Validator with Overloading', $$Create overloaded validation methods for different number ranges.$$ , $$public class NumberValidator {
    // Implement overloaded validation methods
    public static void main(String[] args) {}
}$$ , NULL, $$=== Number Validator === ...$$ , '[]'::jsonb, '["Each overload should have different parameter signature","Use descriptive names for parameters","Test boundary values"]'::jsonb, 'Medium', 3, 40, 75, TRUE),

('beginner-ex-4-1','beginner-module-4','Student Grade Tracker', $$Create a program to manage and analyze student grades using arrays.$$ , $$public class StudentGradeTracker {
    public static void main(String[] args) {
        String[] students = {"Alice", "Bob", "Charlie", "Diana", "Eve"};
        double[] grades = {85.5, 92.0, 78.5, 90.0, 88.5};
        // Implement grade analysis
    }
}$$ , NULL, $$=== Student Grade Report === ...$$ , '[]'::jsonb, '["Use parallel arrays (same index for related data)","Track index of max/min while finding them","Calculate average before comparing individual grades"]'::jsonb, 'Medium', 1, 50, 75, TRUE),
('beginner-ex-4-2','beginner-module-4','Text Analyzer', $$Build a text analysis tool using string methods.$$ , $$import java.util.Scanner;

public class TextAnalyzer {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        // Implement analysis
        input.close();
    }
}$$ , NULL, $$=== Text Analyzer === ...$$ , '[]'::jsonb, '["Use length() for total characters","split(\" \") for word count","Check each character with charAt()"]'::jsonb, 'Medium', 2, 45, 75, TRUE),
('beginner-ex-4-3','beginner-module-4','Matrix Calculator', $$Implement basic matrix operations using 2D arrays.$$ , $$public class MatrixCalculator {
    public static void main(String[] args) {
        int[][] matrix1 = { {1,2,3},{4,5,6},{7,8,9} };
        int[][] matrix2 = { {9,8,7},{6,5,4},{3,2,1} };
        // Implement matrix operations
    }
    public static void displayMatrix(int[][] matrix) {}
}$$ , NULL, $$=== Matrix Calculator === ...$$ , '[]'::jsonb, '["Nested loops for 2D array operations","Add corresponding elements: result[i][j] = m1[i][j] + m2[i][j]","Use printf for formatted output"]'::jsonb, 'Hard', 3, 60, 100, TRUE),

('learner-exercise-5-1','learner-module-5','Student Grade System', $$Create a Student class with proper encapsulation, constructors, and methods to manage student grades.$$ , $$public class Student {
    // Add your fields here
    public static void main(String[] args) {}
}$$ , NULL, $$Student ID: 101, Name: Alice
Grades: 85.0, 90.0, 88.0
Average: 87.67$$ , '[]'::jsonb, '["Use private access modifier for all fields","In setters, use if statements to validate grade range","Remember to use \"this\" keyword in constructors"]'::jsonb, 'Medium', 1, 50, 50, TRUE),
('learner-exercise-5-2','learner-module-5','Bank Account Management', $$Design a BankAccount class demonstrating encapsulation and business logic methods.$$ , $$public class BankAccount {
    // TODO: Add private fields
    public static void main(String[] args) {}
}$$ , NULL, $$Account: 12345, Holder: Alice, Balance: $1000.00$$ , '[]'::jsonb, '["Always validate amounts before modifying balance","Print appropriate messages for successful/failed transactions"]'::jsonb, 'Medium', 2, 60, 60, TRUE),

('learner-exercise-6-1','learner-module-6','Employee Hierarchy System', $$Create an inheritance hierarchy for different employee types and override calculatePay().$$ , $$class Employee {
    // TODO: Add fields and methods
}
public class Main { public static void main(String[] args) {} }$$ , NULL, $$Manager Alice - Pay: $8000.00
Developer Bob - Pay: $6500.00$$ , '[]'::jsonb, '["Use @Override annotation when overriding methods","Manager pay = baseSalary + bonus","Use polymorphic array: Employee[] employees"]'::jsonb, 'Medium', 1, 60, 60, TRUE),
('learner-exercise-6-2','learner-module-6','Shape Polymorphism', $$Implement a shape hierarchy demonstrating polymorphism and calculate total area.$$ , $$abstract class Shape { abstract double calculateArea(); }
public class Main { public static void main(String[] args) {} }$$ , NULL, $$Circle area: 78.54
Rectangle area: 24.00
Total area: 102.54$$ , '[]'::jsonb, '["Use Math.PI for circle calculations","Store shapes in Shape[] array for polymorphism","Loop through array calling calculateArea() on each"]'::jsonb, 'Medium', 2, 60, 65, TRUE),

('learner-exercise-7-1','learner-module-7','Payment Processing System', $$Create a payment system using interfaces for different payment methods.$$ , $$interface Payable { void processPayment(double amount); String getPaymentDetails(); }$$ , NULL, $$Processing credit card payment: $100.00$$ , '[]'::jsonb, '["All implementing classes must define both interface methods","Use polymorphic reference: Payable payment","Store different payment types in Payable array"]'::jsonb, 'Medium', 1, 60, 65, TRUE),
('learner-exercise-7-2','learner-module-7','Media Player with Interfaces', $$Build a media player system using multiple interfaces (Playable, Downloadable).$$ , $$interface Playable { void play(); void pause(); }$$ , NULL, $$Playing video...
Downloading video...
Playing audio...$$ , '[]'::jsonb, '["Video implements both: class Video implements Playable, Downloadable","Can use both reference types: Playable p = new Video()","Check instance type with instanceof before calling specific methods"]'::jsonb, 'Hard', 2, 80, 70, TRUE),

('learner-exercise-8-1','learner-module-8','Safe Calculator', $$Create a calculator that handles all possible exceptions gracefully (throws/catches as appropriate).$$ , $$public class Calculator {
    public double divide(double a, double b) throws ArithmeticException {
        // TODO: Implement with exception
        return 0;
    }
    public static void main(String[] args) {}
}$$ , NULL, $$Enter operation: divide
Enter numbers: 10 0
Error: Cannot divide by zero!$$ , '[]'::jsonb, '["Use throw new ArithmeticException(\"message\") to throw exception","Wrap user input code in try-catch","Use multiple catch blocks for different exception types"]'::jsonb, 'Medium', 1, 45, 60, TRUE),
('learner-exercise-8-2','learner-module-8','Student Data File Manager', $$Create a program that saves and loads student data from files using try-with-resources and proper exception handling.$$ , $$import java.io.*;
import java.util.Scanner;
class Student { /* fields and methods */ }$$ , NULL, $$Saved 3 students to file
Loaded 3 students from file
Student: 101, Alice, GPA: 3.8$$ , '[]'::jsonb, '["Use try-with-resources: try (PrintWriter writer = new PrintWriter(filename))","Write each field on separate line","Use hasNextLine() in while loop to read all data"]'::jsonb, 'Hard', 2, 90, 75, TRUE
;

-- Curriculum Projects
INSERT INTO curriculum_projects (id, module_id, title, description, starter_code, requirements, expected_features, validation_rules, order_index, estimated_hours, xp_reward, is_published) VALUES
('beginner-project-1','beginner-module-1','Personal Information Program', $$Create a comprehensive personal information program that demonstrates your understanding of Java basics and NetBeans functionality.$$ , $$public class PersonalInfo {
    public static void main(String[] args) {
        // Declare your variables here
        // Display formatted information
    }
}$$ , ARRAY['Declare at least 5 different variables using different data types','Include String, int, double, boolean, and char variables','Assign meaningful values to all variables','Display formatted output with labels','Include comments explaining your code','Use proper naming conventions (camelCase for variables)']::text[], ARRAY['Clear, professional output formatting','Proper use of all required data types','Meaningful variable names','Informative comments','Correct Java syntax throughout']::text[], '{}'::jsonb, 1, 1, 150, TRUE),

('beginner-project-2','beginner-module-2','Interactive Number Analysis Program', $$Create a comprehensive program that analyzes numbers using operators, conditionals, and loops (menu-driven).$$ , $$import java.util.Scanner;
public class NumberAnalyzer { public static void main(String[] args) { /* starter menu code */ } }$$ , ARRAY['Create a menu-driven program with at least 4 options','Check if number is prime','Calculate factorial','Generate Fibonacci sequence up to N terms','Find all factors of a number','Use switch for menu handling','Input validation and error handling']::text[], ARRAY['Working menu system with all 4 analysis options','Prime number checker using loop and conditionals','Factorial calculator with loop','Fibonacci sequence generator','Factor finder displaying all factors']::text[], '{}'::jsonb, 1, 2, 150, TRUE),

('beginner-project-3','beginner-module-3','Advanced Calculator with Method Organization', $$Build a comprehensive calculator application organized with methods, demonstrating modular programming principles.$$ , $$import java.util.Scanner; /* starter calculator methods and menu */$$ , ARRAY['Menu-driven calculator with 5 operation categories','Basic operations: add, subtract, multiply, divide, modulus','Advanced operations: power, sqrt, log','Geometric calculations: circle/rectangle/triangle area','Temperature conversions','Statistics: average/max/min']::text[], ARRAY['Complete implementation of all 5 operation categories','Method overloading','Comprehensive input validation','Error handling for edge cases']::text[], '{}'::jsonb, 1, 2, 150, TRUE),

('beginner-project-4','beginner-module-4','Comprehensive Student Grade Management System', $$Create a complete grade management system using arrays and strings, demonstrating data structure mastery.$$ , $$import java.util.Scanner; /* starter code with initializeSystem and menu skeleton */$$ , ARRAY['Store data for at least 8 students (names and grades)','Display records in formatted table','Calculate class statistics','Search for student by name (case-insensitive)','Sort students by grade','Generate individual reports','Count letter grade distribution']::text[], ARRAY['Complete data input and storage system','Formatted table display','Comprehensive statistics','Case-insensitive search functionality','Sorting implementation','Individual student report generation']::text[], '{}'::jsonb, 1, 2, 200, TRUE),

('learner-project-5','learner-module-5','Library Management System', $$Design and implement a comprehensive library management system demonstrating OOP basics including classes, objects, encapsulation, constructors, and object composition.$$ , $$/** Library Management System - Module 5 Assessment Project */$$ , ARRAY['Create a Book class with ISBN,title,author,category,availability','Create Member class with borrowed books array','Library class manages books and members','Implement borrowBook() and returnBook()','SearchBook() and displayAllBooks()/displayAllMembers()']::text[], ARRAY['Fully functional Book and Member classes','Library class managing collections','Constructor overloading','Input validation in setters','Working borrow and return system','Menu-driven interface']::text[], '{}'::jsonb, 1, 2, 200, TRUE),

('learner-project-6','learner-module-6','Vehicle Rental Management System', $$Design and implement a comprehensive vehicle rental system demonstrating inheritance, polymorphism, and abstract classes.$$ , $$/** Vehicle Rental Management System - Module 6 Assessment Project */$$ , ARRAY['Create abstract Vehicle base class','Implement at least 3 concrete vehicle types','Unique rental rate calculation per vehicle type','Implement RentalAgency class','Add rental and return functionality with date tracking']::text[], ARRAY['Abstract Vehicle class with proper abstraction','At least 3 concrete vehicle types','Polymorphic rental cost calculation','Rental agency with inventory management','Rental and return functionality']::text[], '{}'::jsonb, 1, 3, 200, TRUE),

('learner-project-7','learner-module-7','Notification System with Interfaces and Abstract Classes', $$Design and implement a comprehensive notification system demonstrating interfaces, abstract classes, default methods, and design patterns.$$ , $$/** Notification System - Module 7 Assessment Project */$$ , ARRAY['Create Notifiable, Trackable, Formattable interfaces','Abstract BaseNotification with common functionality','Implement Email/SMS/Push notifications','MessageFormatter strategy implementations','NotificationManager to handle multiple notifications']::text[], ARRAY['Complete interface definitions with default methods','Abstract class with template method pattern','Three concrete notification classes','Working retry logic','NotificationManager for handling multiple notifications']::text[], '{}'::jsonb, 1, 2, 200, TRUE),

('learner-project-8','learner-module-8','Student Record Management System', $$Create a comprehensive student record management system that demonstrates mastery of exception handling and file I/O. Save/load student data from files, handle errors gracefully, and provide menu-driven interface.$$ , $$/** Student Record Management System - Module 8 Assessment Project */$$ , ARRAY['Create at least 2 custom exception classes','Student class with name, ID, and grades','Menu system: Add/View/Search/Delete/Calculate/Save & Exit','Persist data to file and load on startup','Validate input and handle IO exceptions']::text[], ARRAY['Complete menu-driven interface','Custom exception classes','Load/save data using try-with-resources','Comprehensive exception handling','User-friendly error messages']::text[], '{}'::jsonb, 1, 2, 200, TRUE
;

-- End of inserts
```

If you want this file placed elsewhere or prefer the SQL split into separate files per table, tell me where and I will create them.

-- Advanced track: Modules 9-12 (Lessons, Exercises, Projects)

-- Curriculum Modules (Advanced)
INSERT INTO curriculum_modules (id, week_number, title, description, track, difficulty_level, estimated_hours, xp_reward, prerequisites, is_published, order_index) VALUES
('advanced-module-9', 9, 'Advanced OOP Concepts - Nested Classes, Enums, and Design Patterns', $$Explore sophisticated object-oriented programming techniques including nested classes, enumeration types, and foundational design patterns that form the backbone of enterprise Java applications.$$ , 'Advanced', 'Advanced', 5, 250, ARRAY[]::text[], TRUE, 9),
('advanced-module-10', 10, 'Collections Framework - Mastering Data Structures', $$Master the Java Collections Framework, understanding the hierarchy of interfaces and classes that provide sophisticated data structure implementations.$$ , 'Advanced', 'Advanced', 5, 300, ARRAY[]::text[], TRUE, 10),
('advanced-module-11', 11, 'Asynchronous Programming - Concurrent Task Management', $$Master asynchronous programming in Java using modern concurrency APIs. Learn to build responsive, non-blocking applications with CompletableFuture.$$ , 'Advanced', 'Advanced', 5, 300, ARRAY[]::text[], TRUE, 11),
('advanced-module-12', 12, 'Multithreading and Final Integration Project', $$Master concurrent programming with Java multithreading, implement thread synchronization, and synthesize all learned concepts into a comprehensive final project.$$ , 'Advanced', 'Advanced', 6, 300, ARRAY[]::text[], TRUE, 12
;

-- Curriculum Lessons (Advanced)
INSERT INTO curriculum_lessons (id, module_id, title, content, order_index, estimated_minutes, xp_reward, is_published) VALUES
('advanced-lesson-9-1','advanced-module-9','Nested and Inner Classes', $$Static nested classes, inner classes, local and anonymous classes; use cases and best practices for grouping and encapsulation.$$ , 1, 60, 0, TRUE),
('advanced-lesson-9-2','advanced-module-9','Enumeration Types with Behavior', $$Enums with constructors, methods, EnumSet/EnumMap, and constant-specific behavior for type-safe constants.$$ , 2, 45, 0, TRUE),
('advanced-lesson-9-3','advanced-module-9','Essential Design Patterns', $$Singleton, Factory, Observer, Strategy patterns: when to use them and example implementations.$$ , 3, 70, 0, TRUE),

('advanced-lesson-10-1','advanced-module-10','Collections Framework Architecture', $$Overview of Collection hierarchy, List/Set/Queue/Map, and design principles for choosing data structures.$$ , 1, 65, 0, TRUE),
('advanced-lesson-10-2','advanced-module-10','List Collections - ArrayList and LinkedList', $$ArrayList vs LinkedList internal structures, iteration techniques, and performance trade-offs.$$ , 2, 65, 0, TRUE),
('advanced-lesson-10-3','advanced-module-10','Set Collections - HashSet and TreeSet', $$Set behavior, hashCode/equals contract, TreeSet ordering and NavigableSet features.$$ , 3, 60, 0, TRUE),
('advanced-lesson-10-4','advanced-module-10','Map Collections - HashMap and TreeMap', $$Map interface, HashMap internals, TreeMap sorted keys, and iteration over entries.$$ , 4, 70, 0, TRUE),

('advanced-lesson-11-1','advanced-module-11','Synchronous vs Asynchronous Programming', $$Differences between sync and async, thread pools, blocking vs non-blocking, and when to apply async patterns.$$ , 1, 55, 0, TRUE),
('advanced-lesson-11-2','advanced-module-11','CompletableFuture Fundamentals', $$Creating and composing CompletableFutures, supplyAsync/runAsync, chaining and combining futures.$$ , 2, 70, 0, TRUE),
('advanced-lesson-11-3','advanced-module-11','Exception Handling in Async Code', $$Handling exceptions with exceptionally, handle, whenComplete; fallback and recovery strategies for async pipelines.$$ , 3, 60, 0, TRUE),

('advanced-lesson-12-1','advanced-module-12','Multithreading Fundamentals', $$Thread creation, lifecycle, priorities, daemon threads, and interruption handling.$$ , 1, 70, 0, TRUE),
('advanced-lesson-12-2','advanced-module-12','Synchronization and Thread Safety', $$Synchronized methods/blocks, intrinsic locks, volatile, and deadlock prevention techniques.$$ , 2, 75, 0, TRUE),
('advanced-lesson-12-3','advanced-module-12','Producer-Consumer Pattern', $$wait/notify mechanics, bounded buffers, and coordination patterns for producer-consumer problems.$$ , 3, 65, 0, TRUE),
('advanced-lesson-12-4','advanced-module-12','Final Project Integration', $$Planning and designing a comprehensive final project integrating architecture, testing, documentation, and performance tuning.$$ , 4, 90, 0, TRUE)
;

-- Curriculum Exercises (Advanced)
INSERT INTO curriculum_exercises (id, module_id, title, description, starter_code, solution_code, expected_output, test_cases, hints, difficulty, order_index, estimated_minutes, xp_reward, is_published) VALUES
('advanced-ex-9-1','advanced-module-9','Inner Class Implementation', $$Create a binary tree using an inner Node class with insert/search/traversal operations.$$ , $$public class BinaryTree { private Node root; private class Node { int data; Node left, right; Node(int data){ this.data = data;} } /* methods */ }$$ , NULL, $$Inorder Traversal: 20 30 40 50 60 70 80$$ , '[]'::jsonb, '["Use recursion for tree operations","Inner class can access outer class private members","Start from root for all operations"]'::jsonb, 'Medium', 1, 90, 100, TRUE),
('advanced-ex-9-2','advanced-module-9','Enum with Behavior', $$Implement a Planet enum with mass/radius and surface gravity/weight calculations.$$ , $$public enum Planet { MERCURY, VENUS, EARTH /* ... */ }$$ , NULL, $$Your weight on Earth: 175.0 lbs$$ , '[]'::jsonb, '["Gravity = G * mass / (radius * radius)","Weight = mass * surface gravity","Use scientific notation for large numbers"]'::jsonb, 'Medium', 2, 90, 120, TRUE),
('advanced-ex-9-3','advanced-module-9','Design Pattern Implementation', $$Implement thread-safe Singleton and a Factory for reports demonstrating both patterns working together.$$ , $$// Singleton and Factory starter code (see module)$$ , NULL, $$Singleton verified; Factory created PDF/HTML/CSV reports$$ , '[]'::jsonb, '["Use volatile for thread safety","Implement double-checked locking","Create separate classes for each report type"]'::jsonb, 'Hard', 3, 120, 150, TRUE),

('advanced-ex-10-1','advanced-module-10','Student Management System', $$Build a student system using ArrayList, HashMap, and TreeSet for ranking and lookup.$$ , $$import java.util.*; /* starter classes and collections */$$ , NULL, $$Rank 1: Bob Smith (GPA: 3.92)$$ , '[]'::jsonb, '["Use HashMap for O(1) lookup","TreeSet needs Comparator","Keep collections synchronized"]'::jsonb, 'Medium', 1, 90, 120, TRUE),
('advanced-ex-10-2','advanced-module-10','Word Frequency Counter', $$Analyze text and count word frequencies using HashMap and sorting for top N words.$$ , $$import java.util.*; /* starter code */$$ , NULL, $$"java" - 4 occurrences$$ , '[]'::jsonb, '["Use toLowerCase() for case-insensitive","Split text on whitespace","Sort by values, not keys"]'::jsonb, 'Medium', 2, 75, 100, TRUE),
('advanced-ex-10-3','advanced-module-10','Custom Generic Collection', $$Implement a generic MyArrayList<T> with add/get/remove/iterator and dynamic resizing.$$ , $$public class MyArrayList<T> implements Iterable<T> { /* starter */ }$$ , NULL, $$Array resized from 10 to 20; Iterator works correctly$$ , '[]'::jsonb, '["Resize when size equals capacity","Use System.arraycopy for efficiency","Create inner Iterator class"]'::jsonb, 'Hard', 3, 150, 150, TRUE),

('advanced-ex-11-1','advanced-module-11','Async Data Fetcher', $$Use CompletableFuture to fetch and combine data from multiple sources with timeouts and error handling.$$ , $$import java.util.concurrent.*; /* starter fetcher */$$ , NULL, $$Aggregated Results: Database/API/Cache$$ , '[]'::jsonb, '["Use CompletableFuture.allOf for coordination","Add timeout with completeOnTimeout","Handle exceptions with exceptionally"]'::jsonb, 'Medium', 1, 90, 120, TRUE),
('advanced-ex-11-2','advanced-module-11','Async File Processor', $$Process multiple files concurrently using CompletableFuture and aggregate results.$$ , $$import java.util.concurrent.*; /* starter */$$ , NULL, $$Processing 5 files concurrently... Completed 4/5$$ , '[]'::jsonb, '["Map filenames to CompletableFuture","Collect results after completion","Handle file not found errors"]'::jsonb, 'Hard', 2, 150, 150, TRUE),
('advanced-ex-11-3','advanced-module-11','Async Web Scraper', $$Simulate concurrent scraping of web pages with retry and rate limiting strategies.$$ , $$import java.util.concurrent.*; /* starter */$$ , NULL, $$Successfully scraped: 10/10 URLs$$ , '[]'::jsonb, '["Use custom executor for rate limiting","Chain fetchPage and extractData","Implement retry with recursion"]'::jsonb, 'Hard', 3, 150, 150, TRUE),

('advanced-ex-12-1','advanced-module-12','Multi-threaded Download Manager', $$Simulate concurrent downloads with progress tracking and interruption handling.$$ , $$class DownloadTask implements Runnable { /* starter */ }$$ , NULL, $$All downloads completed successfully$$ , '[]'::jsonb, '["Use Thread.sleep() for simulation","Calculate progress percentage","Handle InterruptedException"]'::jsonb, 'Medium', 1, 90, 100, TRUE),
('advanced-ex-12-2','advanced-module-12','Thread-Safe Bank System', $$Implement a thread-safe banking system with synchronized operations and deadlock prevention for transfers.$$ , $$class BankAccount { /* starter */ }$$ , NULL, $$Final Account Balances: Account A: $4,925.00 ...$$ , '[]'::jsonb, '["Use lock ordering for deadlock prevention","Synchronize on account objects","Simulate processing with sleep"]'::jsonb, 'Hard', 2, 150, 150, TRUE),
('advanced-ex-12-3','advanced-module-12','Producer-Consumer Queue', $$Implement SharedQueue with wait/notify and multiple producers/consumers for a bounded buffer system.$$ , $$class SharedQueue<T> { /* starter */ }$$ , NULL, $$Total produced: 150 items; Total consumed: 148 items$$ , '[]'::jsonb, '["Use while loops for conditions","Call notifyAll() after changes","Handle InterruptedException"]'::jsonb, 'Hard', 3, 150, 150, TRUE
;

-- Curriculum Projects (Advanced)
INSERT INTO curriculum_projects (id, module_id, title, description, starter_code, requirements, expected_features, validation_rules, order_index, estimated_hours, xp_reward, is_published) VALUES
('advanced-project-9','advanced-module-9','Event Management System with Design Patterns', $$Build a comprehensive event management system using nested classes, enums, and multiple design patterns.$$ , $$import java.util.*; /* starter event management system */$$ , ARRAY['Event class hierarchy using nested classes','EventType and EventStatus enums','Singleton EventManager','Factory for creating event types','Observer pattern for notifications']::text[], ARRAY['Working Singleton pattern','Factory for event creation','Observer pattern for notifications','Nested classes for organization','Comprehensive enum usage']::text[], '{}'::jsonb, 1, 3, 250, TRUE),

('advanced-project-10','advanced-module-10','Library Management System (Collections)', $$Build comprehensive library system using Collections Framework for inventory, lookup, and sorting.$$ , $$import java.util.*; /* starter library code */$$ , ARRAY['Book class with ISBN,title,author,availability','Member class with ID,name,borrowed books','Use ArrayList for inventory','Use HashMap for ISBN lookup','Use TreeSet for sorting']::text[], ARRAY['Multiple collection types used appropriately','Efficient lookups and sorting','Complete borrow/return system','Search functionality','Data persistence']::text[], '{}'::jsonb, 1, 4, 300, TRUE),

('advanced-project-11','advanced-module-11','Concurrent Data Processing Pipeline', $$Build comprehensive async data processing pipeline with ingestion, validation, processing, and aggregation stages using CompletableFuture and executors.$$ , $$import java.util.concurrent.*; /* starter pipeline code */$$ , ARRAY['Data ingestion from multiple sources','Async validation stage','Parallel processing stage','Aggregation stage','Error handling and retry logic']::text[], ARRAY['Multi-stage async pipeline','Parallel processing','Error handling with retry','Timeout management','Progress reporting']::text[], '{}'::jsonb, 1, 4, 300, TRUE),

('advanced-project-12','advanced-module-12','Task Management System - Final Integration Project', $$Create comprehensive task management system integrating OOP, collections, file I/O, exceptions, and multithreading.$$ , $$import java.util.*; /* starter final project code */$$ , ARRAY['Task class hierarchy with different types','Thread-safe TaskManager operations','Collections for storage','File I/O for persistence','Worker threads for execution']::text[], ARRAY['Complete task hierarchy','Thread-safe priority queue','Multiple worker threads','File persistence','Graceful shutdown']::text[], '{}'::jsonb, 1, 6, 300, TRUE
;

-- End of inserts (including Advanced)
```

If you want this file split into separate SQL files per table, or want different XP values/prerequisites, tell me and I'll update accordingly.
