# Java Learner Curriculum - Figma Layout Specification

**Complete Visual Structure for Figma Design**

This document provides the complete, detailed content for creating a Figma layout of the Java Learner Curriculum split into two parts.

---

## 🎨 Design System Specifications

### Typography
- **Headers**: JetBrains Mono Bold, 24-32px
- **Subheaders**: JetBrains Mono SemiBold, 18-20px
- **Body Text**: Roboto Mono Regular, 14-16px
- **Code**: JetBrains Mono, 12-14px
- **Line Height**: 1.5-1.6

### Colors
- **Primary Purple**: #7C3AED (main accent)
- **Dark Background**: #1E1E1E
- **Card Background**: #2D2D2D
- **Text Primary**: #FFFFFF
- **Text Secondary**: #A0A0A0
- **Border**: #3D3D3D

### Spacing
- **Module Cards**: 40px vertical spacing
- **Section Padding**: 24px
- **Item Spacing**: 16px
- **Card Border Radius**: 12px

---

# PART 1: MODULES 5-6

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║     COMPREHENSIVE JAVA LEARNER TRACK – PART 1 (MODULES 5-6)              ║
║     Based on NetBeans IDE Self-Paced Learning Module                     ║
║                                                                            ║
║     Focus: Object-Oriented Programming Fundamentals                       ║
║     • Module 5: OOP Basics - Classes and Objects                         ║
║     • Module 6: Inheritance and Polymorphism                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## MODULE 5: Object-Oriented Programming Basics - Classes and Objects

### 📋 Module Overview Card

**Module ID**: learner-module-5  
**Week**: 5  
**Category**: Learner  
**Required Level**: Learner  
**Estimated Hours**: 5 hours  

**Description**:
Transition from procedural to object-oriented programming by mastering classes, objects, constructors, and encapsulation. Learn to design and implement real-world entities as software objects with attributes and behaviors.

---

### 🎯 Module Objectives (Display as checklist)

- [ ] Understand object-oriented programming paradigm and its advantages
- [ ] Design and implement classes with attributes and methods
- [ ] Create and manipulate objects effectively
- [ ] Master constructor overloading and object initialization
- [ ] Apply encapsulation principles with access modifiers
- [ ] Implement getter and setter methods following best practices

---

### 📚 LESSONS SECTION

#### Lesson 5.1: Introduction to Classes and Objects
**Duration**: 60 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Object-oriented paradigm vs procedural programming
- Class definition and structure
- Object instantiation with new keyword
- Instance variables (attributes/fields)
- Instance methods (behaviors)
- The "this" keyword and its uses

**What You'll Learn**:
```
• How to define a class with fields and methods
• Creating objects using the new keyword
• Understanding the difference between class and object
• Using instance variables to represent object state
• Writing instance methods to define object behavior
• Applying the "this" keyword to resolve naming conflicts
```

**Code Example Topics**:
1. Student Class - Basic Structure
2. Using the Student Class
3. BankAccount Class - Real-World Example

**Practice Tasks**:
- Create a Book class with title, author, ISBN, and price attributes
- Add methods to apply discount and display book information
- Create a Car class with make, model, year, and mileage
- Implement methods to drive (increase mileage) and service the car

---

#### Lesson 5.2: Constructors and Object Initialization
**Duration**: 65 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Constructor purpose and syntax
- Default (no-argument) constructor
- Parameterized constructors
- Constructor overloading
- Constructor chaining with this()
- Initialization blocks

**What You'll Learn**:
```
• How constructors initialize objects when created
• Difference between default and parameterized constructors
• Using constructor overloading for flexible object creation
• Chaining constructors with this() to reduce code duplication
• Understanding initialization order in Java
• Best practices for constructor design
```

**Code Example Topics**:
1. Student Class with Multiple Constructors
2. Constructor Chaining Example
3. Testing Constructor Overloading

**Practice Tasks**:
- Create a Rectangle class with multiple constructors
- Implement constructor chaining in a Product class
- Create a Date class with various constructor options
- Design a Course class with appropriate constructors

---

#### Lesson 5.3: Encapsulation and Access Modifiers
**Duration**: 70 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Encapsulation principles and benefits
- Access modifiers: private, public, protected, default
- Getter methods (accessors)
- Setter methods (mutators)
- Data validation in setters
- Read-only and write-only properties

**What You'll Learn**:
```
• Why encapsulation is fundamental to OOP
• Using private fields to hide internal state
• Creating public getter and setter methods
• Implementing validation logic in setters
• Designing read-only properties (getter only)
• Understanding access modifier scope and visibility
```

**Code Example Topics**:
1. Fully Encapsulated Student Class
2. BankAccount with Security
3. Testing Encapsulation

**Practice Tasks**:
- Create a fully encapsulated Person class with validation
- Implement a Product class with price validation in setter
- Design a Car class with odometer that can only increase
- Create a Grade class that validates grade ranges

---

#### Lesson 5.4: Object Interaction and Composition
**Duration**: 65 minutes | **Difficulty**: Expert

**Key Concepts**:
- Object references and memory model
- Objects as method parameters
- Objects as return values
- Object composition (HAS-A relationship)
- Aggregation vs composition
- Building complex systems with multiple classes

**What You'll Learn**:
```
• How objects interact by calling each other's methods
• Understanding object references vs primitive types
• Implementing composition (HAS-A relationships)
• Passing objects as method parameters
• Returning objects from methods
• Building complex systems from simpler objects
```

**Code Example Topics**:
1. Address Class (for composition)
2. Person with Composition (HAS-A Address)
3. University System with Multiple Compositions
4. Testing Object Interactions

**Practice Tasks**:
- Create a Library system with Book, Member, and Loan classes
- Design a School system with Teacher, Student, and Classroom classes
- Implement a Shopping Cart with Product and CartItem classes
- Build a Hospital system with Patient, Doctor, and Appointment classes

---

### 💻 HANDS-ON EXERCISES SECTION

#### Exercise 5.1: Create a Complete Person Class
**Difficulty**: Easy | **Points**: 75

**Task Description**:
Design and implement a fully functional Person class with proper encapsulation.

**Step-by-Step Instructions**:
1. Create a Person class with private fields: firstName, lastName, age, email
2. Implement a constructor that initializes all fields
3. Create getter and setter methods for all fields
4. Add validation in setters (age must be positive, email must contain @)
5. Implement a getFullName() method that returns first and last name combined
6. Create a displayInfo() method that prints all person information
7. Test the class by creating multiple Person objects

**Expected Output**:
```
=== Person Information ===
Name: John Doe
Age: 30
Email: john@email.com

=== Person Information ===
Name: Jane Smith
Age: 25
Email: jane@email.com
```

**Hints**:
- Use private access modifier for all fields
- Validate age > 0 in setter
- Check if email contains "@" before setting
- Use this keyword to reference instance variables

---

#### Exercise 5.2: Rectangle Class with Constructors
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Create a Rectangle class demonstrating constructor overloading.

**Step-by-Step Instructions**:
1. Create a Rectangle class with private fields: length and width
2. Implement a default constructor that sets both to 1.0
3. Implement a constructor that takes one parameter (square)
4. Implement a constructor that takes two parameters (length and width)
5. Use constructor chaining with this()
6. Add methods: calculateArea(), calculatePerimeter(), isSquare()
7. Add a displayInfo() method
8. Validate that dimensions are positive in constructors

**Expected Output**:
```
Rectangle 1 (Default):
Length: 1.0, Width: 1.0
Area: 1.0
Perimeter: 4.0
Is Square: true

Rectangle 2 (Square):
Length: 5.0, Width: 5.0
Area: 25.0
Perimeter: 20.0
Is Square: true

Rectangle 3 (Rectangle):
Length: 4.0, Width: 6.0
Area: 24.0
Perimeter: 20.0
Is Square: false
```

---

#### Exercise 5.3: Bank Account with Encapsulation
**Difficulty**: Medium | **Points**: 125

**Task Description**:
Create a secure BankAccount class with proper encapsulation and validation.

**Step-by-Step Instructions**:
1. Create a BankAccount class with private fields: accountNumber, accountHolder, balance
2. Implement a constructor (balance starts at 0)
3. Make accountNumber and accountHolder read-only (no setters)
4. Create deposit(amount) method with validation
5. Create withdraw(amount) method with validation (check sufficient funds)
6. Create getBalance() method
7. Add transfer(BankAccount recipient, double amount) method
8. Implement displayAccountInfo() method
9. Test with multiple accounts and transactions

**Expected Output**:
```
Account created: ACC001 - John Doe
Deposited: $1000.00
New balance: $1000.00

Withdrawn: $200.00
New balance: $800.00

Transfer successful!
Transferred $300.00 to Jane Smith

=== Account Information ===
Account Number: ACC001
Account Holder: John Doe
Balance: $500.00
```

---

#### Exercise 5.4: Student Course Enrollment System
**Difficulty**: Hard | **Points**: 150

**Task Description**:
Build a system with Student and Course classes demonstrating object composition.

**Step-by-Step Instructions**:
1. Create a Course class with: courseCode, courseName, credits, instructor
2. Create a Student class with: studentId, name, major, array of enrolled courses
3. Implement constructors for both classes
4. Add enrollInCourse(Course) method to Student
5. Add dropCourse(String courseCode) method to Student
6. Implement getTotalCredits() method
7. Add displayInfo() methods to both classes
8. Test by creating students and enrolling them in courses
9. Limit students to maximum 5 courses

**Expected Output**:
```
Alice Cooper enrolled in: Introduction to Programming
Alice Cooper enrolled in: Data Structures
Alice Cooper enrolled in: Calculus I

=== Student Information ===
Student ID: S001
Name: Alice Cooper
Major: Computer Science
Enrolled Courses: 3
Total Credits: 11

Course List:
1. CS101: Introduction to Programming (3 credits) - Dr. Smith
2. CS102: Data Structures (4 credits) - Dr. Johnson
3. MATH201: Calculus I (4 credits) - Dr. Williams
```

---

### 🎯 ASSESSMENT PROJECT

#### Project 5: Library Management System
**Difficulty**: Medium | **Time**: 120-180 minutes | **Points**: 200

**Project Description**:
Design and implement a comprehensive library management system demonstrating all OOP basics concepts including classes, objects, encapsulation, constructors, and object composition.

**Project Objectives**:
- Design multiple interacting classes with proper encapsulation
- Implement constructor overloading and initialization
- Apply getter/setter methods with validation
- Demonstrate object composition (HAS-A relationships)
- Create methods that accept and return objects
- Build a functional system with user interaction

**Requirements Checklist**:
```
Core Classes:
□ Create a Book class with: ISBN, title, author, category, availability status
□ Create a Member class with: memberId, name, email, phone, borrowed books array
□ Create a Library class that manages books and members

Implementation Features:
□ Implement proper encapsulation (private fields, public methods)
□ Add constructor overloading where appropriate
□ Include validation in setter methods
□ Implement borrowBook() method (Book object becomes unavailable)
□ Implement returnBook() method (Book becomes available again)
□ Add searchBook() method (by title or author)
□ Implement displayAllBooks() and displayAllMembers() methods
□ Create a menu-driven main program for user interaction
□ Add comprehensive comments explaining your design
□ Handle edge cases (book not available, member not found, etc.)
```

**Menu System Requirements**:
```
╔════════════════════════════════════════╗
║   Library Management System           ║
╚════════════════════════════════════════╝

=== Main Menu ===
1. Add New Book
2. Add New Member
3. Borrow Book
4. Return Book
5. Display All Books
6. Display All Members
7. Search Book
8. Exit

Enter your choice: _
```

**Expected Features**:
- ✓ Fully functional Book class with encapsulation
- ✓ Fully functional Member class with book borrowing capability
- ✓ Library class managing collections of books and members
- ✓ Constructor overloading in at least one class
- ✓ Input validation in all setter methods
- ✓ Working borrow and return system
- ✓ Search functionality for books
- ✓ Menu-driven interface for all operations
- ✓ Proper error handling (book not available, member not found, etc.)
- ✓ Clear, professional console output
- ✓ Comprehensive comments explaining design decisions
- ✓ Demonstration of object composition and interaction

---

## MODULE 6: Inheritance and Polymorphism - Advanced OOP Concepts

### 📋 Module Overview Card

**Module ID**: learner-module-6  
**Week**: 6  
**Category**: Learner  
**Required Level**: Learner  
**Estimated Hours**: 5 hours  

**Description**:
Master inheritance hierarchies, method overriding, and polymorphic behavior to create flexible and reusable code. Learn to design class relationships that model real-world scenarios effectively.

---

### 🎯 Module Objectives (Display as checklist)

- [ ] Understand and implement inheritance hierarchies
- [ ] Master the extends keyword and super keyword usage
- [ ] Implement method overriding and understand runtime polymorphism
- [ ] Create and use abstract classes and methods
- [ ] Apply the Liskov Substitution Principle
- [ ] Design flexible class hierarchies using inheritance

---

### 📚 LESSONS SECTION

#### Lesson 6.1: Inheritance Fundamentals
**Duration**: 60 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- extends keyword syntax
- IS-A relationship modeling
- Parent class (superclass) and child class (subclass)
- Constructor chaining with super()
- Method inheritance
- Field inheritance and visibility

**What You'll Learn**:
```
• How to create inheritance relationships between classes
• Using the extends keyword to inherit from a parent class
• Understanding the IS-A relationship in OOP
• Calling parent constructors with super()
• Inheriting methods and fields from parent class
• Single inheritance limitation in Java
```

**Code Example Topics**:
1. Basic Inheritance Example (Vehicle → Car)
2. Multi-Level Inheritance (Animal → Mammal → Dog)

**Practice Tasks**:
- Create a hierarchy: Person → Student → GraduateStudent
- Implement Employee → Manager → Director hierarchy
- Design Shape → Rectangle → Square inheritance
- Build BankAccount → SavingsAccount → PremiumSavingsAccount

---

#### Lesson 6.2: Method Overriding and Runtime Polymorphism
**Duration**: 65 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- @Override annotation
- Method overriding rules
- Runtime polymorphism (dynamic method dispatch)
- super keyword for calling parent methods
- Covariant return types
- Method signature matching

**What You'll Learn**:
```
• How to override parent class methods in subclasses
• Using @Override annotation for compile-time safety
• Understanding runtime polymorphism (dynamic dispatch)
• Calling overridden parent methods with super.method()
• Rules for method overriding in Java
• Polymorphic behavior and its benefits
```

**Code Example Topics**:
1. Method Overriding Example (Animal sounds)
2. Super Keyword Usage
3. Practical Polymorphism - Payment System

**Practice Tasks**:
- Override toString() method in custom classes
- Create a Shape hierarchy with overridden calculateArea() methods
- Implement a notification system with different message types
- Design a transportation system with polymorphic fare calculation

---

#### Lesson 6.3: Abstract Classes and Methods
**Duration**: 70 minutes | **Difficulty**: Expert

**Key Concepts**:
- abstract keyword for classes and methods
- Abstract class characteristics
- Abstract vs concrete methods
- Template Method pattern
- Cannot instantiate abstract classes
- Abstract class constructors

**What You'll Learn**:
```
• Creating abstract classes as templates for subclasses
• Defining abstract methods (no implementation)
• Mixing abstract and concrete methods in abstract classes
• Using abstract classes to enforce implementation contracts
• Implementing the Template Method design pattern
• When to use abstract classes vs interfaces
```

**Code Example Topics**:
1. Abstract Class Fundamentals (Shape example)
2. Template Method Pattern (DataProcessor)
3. Advanced Abstract Class - Game Framework

**Practice Tasks**:
- Create an abstract Document class with concrete save() and abstract format() methods
- Design an abstract Vehicle class with calculateFuelEfficiency() as abstract
- Implement an abstract Report class using Template Method pattern
- Build an abstract DatabaseConnection with abstract connect() and query() methods

---

#### Lesson 6.4: Advanced Inheritance Concepts
**Duration**: 55 minutes | **Difficulty**: Expert

**Key Concepts**:
- Object class and its methods
- final keyword with inheritance
- Upcasting and downcasting
- instanceof operator
- Liskov Substitution Principle
- Composition vs Inheritance

**What You'll Learn**:
```
• Understanding the Object class hierarchy
• Overriding toString(), equals(), and hashCode()
• Using the final keyword to prevent inheritance
• Safe type casting with instanceof operator
• Applying the Liskov Substitution Principle
• Deciding between composition and inheritance
```

**Code Example Topics**:
1. Object Class Methods (Student example)
2. Type Casting and instanceof
3. Final Keyword and LSP

**Practice Tasks**:
- Override toString(), equals(), and hashCode() for a custom class
- Practice safe downcasting with instanceof in a polymorphic array
- Identify and fix LSP violations in class hierarchies
- Use final keyword appropriately in a security-sensitive class

---

### 💻 HANDS-ON EXERCISES SECTION

#### Exercise 6.1: Employee Management System
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Create an inheritance hierarchy for different employee types with specialized behavior.

**Step-by-Step Instructions**:
1. Create an Employee base class with name, id, and baseSalary
2. Implement calculateSalary() and displayInfo() methods
3. Create Manager subclass that adds department and bonus
4. Create Developer subclass that adds programmingLanguage and project count
5. Create Intern subclass with fixed stipend
6. Override calculateSalary() in each subclass with specific rules
7. Create a test program that demonstrates polymorphism

**Expected Output**:
```
=== Employee Management System ===

Manager: John Smith (M001)
Department: Engineering
Base Salary: $80000.00
Bonus: $15000.00
Total Salary: $95000.00

Developer: Alice Johnson (D001)
Programming Language: Java
Projects Completed: 5
Base Salary: $70000.00
Project Bonus: $5000.00
Total Salary: $75000.00

Intern: Bob Lee (I001)
Stipend: $2000.00
Total Compensation: $2000.00

=== Payroll Summary ===
Total Employees: 3
Total Payroll: $172000.00
```

---

#### Exercise 6.2: Shape Calculator with Abstract Class
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Design an abstract Shape class and implement various concrete shapes.

**Step-by-Step Instructions**:
1. Create abstract Shape class with color and filled properties
2. Add abstract methods: calculateArea(), calculatePerimeter()
3. Implement concrete classes: Circle, Rectangle, Triangle
4. Add a toString() method to Shape class
5. Create a ShapeCalculator class to process multiple shapes
6. Calculate total area and perimeter of all shapes
7. Sort shapes by area (bonus challenge)

**Expected Output**:
```
=== Shape Calculator ===

Circle (Red, Filled)
Radius: 5.00
Area: 78.54
Perimeter: 31.42

Rectangle (Blue, Not Filled)
Length: 4.00, Width: 6.00
Area: 24.00
Perimeter: 20.00

Triangle (Green, Filled)
Sides: 3.00, 4.00, 5.00
Area: 6.00
Perimeter: 12.00

=== Summary ===
Total Shapes: 3
Total Area: 108.54
Total Perimeter: 63.42
```

---

#### Exercise 6.3: Banking System with Polymorphism
**Difficulty**: Hard | **Points**: 150

**Task Description**:
Create a banking system demonstrating inheritance and polymorphism.

**Step-by-Step Instructions**:
1. Create BankAccount base class with accountNumber, balance, owner
2. Implement deposit(), withdraw(), and calculateInterest() methods
3. Create SavingsAccount with interest rate and minimum balance
4. Create CheckingAccount with overdraft limit
5. Create BusinessAccount with transaction fee
6. Override withdraw() in each subclass with specific rules
7. Implement proper error handling and validation
8. Create Bank class to manage multiple accounts

**Expected Output**:
```
╔════════════════════════════════════╗
║   Banking System Demonstration     ║
╚════════════════════════════════════╝

=== Savings Account Test ===
Account Number: SAV001
Owner: Alice Johnson
Balance: $5000.00
Deposited $500.00. New balance: $5500.00
Withdrew $200.00. New balance: $5300.00
Cannot withdraw! Minimum balance of $100.00 must be maintained.
Interest earned: $132.50 (2.50%)
Interest applied. New balance: $5432.50

=== Checking Account Test ===
Account Number: CHK001
Owner: Bob Smith
Balance: $1000.00
Withdrew $500.00. New balance: $500.00
Withdrew $800.00 with overdraft. Fee: $35.00. Balance: $-335.00

=== Business Account Test ===
Account Number: BUS001
Owner: TechCorp Inc
Balance: $10000.00
Deposited $2000.00. Balance: $12000.00 (Free transaction 1/50)
Withdrew $500.00. Balance: $11500.00 (Free transaction 2/50)

=== Polymorphic Account Processing ===
Total balance across all accounts: $16597.50
```

---

### 🎯 ASSESSMENT PROJECT

#### Project 6: Vehicle Rental Management System
**Difficulty**: Hard | **Time**: 3-4 hours | **Points**: 200

**Project Description**:
Design and implement a comprehensive vehicle rental system that demonstrates mastery of inheritance, polymorphism, and abstract classes.

**Project Objectives**:
- Design a multi-level inheritance hierarchy
- Implement abstract classes with template methods
- Apply polymorphism for flexible vehicle management
- Override methods with specific behavior for each vehicle type
- Create a rental management system using OOP principles

**Requirements Checklist**:
```
Core Classes:
□ Create an abstract Vehicle base class with common properties and methods
□ Implement at least 3 concrete vehicle types (Car, Motorcycle, Truck)
□ Each vehicle type should have unique rental rate calculation
□ Implement a RentalAgency class to manage vehicle inventory

Implementation Features:
□ Add rental and return functionality with date tracking
□ Calculate rental costs based on vehicle type and duration
□ Display available vehicles and rental history
□ Use polymorphic arrays to manage different vehicle types
□ Include proper encapsulation and access modifiers
□ Add comprehensive documentation and comments

Abstract Methods:
□ calculateRentalCost(int days) - abstract
□ getVehicleType() - abstract
□ displaySpecifications() - abstract

Concrete Methods:
□ displayBasicInfo() - shows common vehicle information
□ rent() - marks vehicle as rented
□ returnVehicle() - marks vehicle as available
```

**Expected Features**:
- ✓ Abstract Vehicle class with proper abstraction
- ✓ At least 3 concrete vehicle types with unique behavior
- ✓ Polymorphic rental cost calculation
- ✓ Rental agency with inventory management
- ✓ Rental and return functionality
- ✓ Rental history tracking
- ✓ Revenue calculation
- ✓ Professional output formatting
- ✓ Comprehensive error handling
- ✓ Well-documented code with comments

**Sample Interaction**:
```
╔════════════════════════════════════════╗
║  Vehicle Rental Management System      ║
╚════════════════════════════════════════╝

=== Available Vehicles ===
1. CAR-001: Toyota Camry 2023 - $50/day
2. MOTO-001: Harley Davidson Sport - $35/day
3. TRUCK-001: Ford F-150 - $80/day

Rent vehicle ID: CAR-001
Customer name: John Doe
Rental days: 3

✓ Rental successful!
Vehicle: Toyota Camry 2023
Customer: John Doe
Duration: 3 days
Total Cost: $150.00

=== Rental History ===
1. CAR-001 | John Doe | 3 days | $150.00 | Active

Total Revenue: $150.00
```

---

# PART 2: MODULES 7-8

```
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║     COMPREHENSIVE JAVA LEARNER TRACK – PART 2 (MODULES 7-8)              ║
║     Based on NetBeans IDE Self-Paced Learning Module                     ║
║                                                                            ║
║     Focus: Advanced OOP and Robust Application Development                ║
║     • Module 7: Interfaces and Abstract Classes                          ║
║     • Module 8: Exception Handling and File I/O                          ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## MODULE 7: Interfaces and Abstract Classes - Designing Flexible Systems

### 📋 Module Overview Card

**Module ID**: learner-module-7  
**Week**: 7  
**Category**: Learner  
**Required Level**: Learner  
**Estimated Hours**: 5 hours  

**Description**:
Master the art of designing flexible, maintainable systems using interfaces and abstract classes. Learn to create contracts for behavior, implement multiple inheritance through interfaces, and choose the right abstraction for your design needs.

---

### 🎯 Module Objectives (Display as checklist)

- [ ] Design and implement interfaces for behavioral contracts
- [ ] Master multiple interface implementation and composition
- [ ] Create and utilize abstract classes effectively
- [ ] Understand when to use interfaces vs abstract classes
- [ ] Apply interface segregation and design principles
- [ ] Implement default and static methods in interfaces

---

### 📚 LESSONS SECTION

#### Lesson 7.1: Interface Fundamentals and Design
**Duration**: 55 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Interface declaration and syntax
- implements keyword
- Interface methods (abstract by default)
- Multiple interface implementation
- Interface constants (public static final)
- Interface as a contract

**What You'll Learn**:
```
• Defining interfaces to establish contracts
• Implementing interfaces in multiple classes
• Using interface references for polymorphism
• Creating interface constants
• Implementing multiple interfaces in a single class
• Understanding the role of interfaces in Java architecture
```

**Code Example Topics**:
1. Basic Interface Definition and Implementation (Drawable)
2. Multiple Interface Implementation (Duck: Flyable, Swimmable, Eatable)

**Practice Tasks**:
- Create a Payable interface and implement it in Employee and Invoice classes
- Design a Sortable interface with compare method and implement it for custom objects
- Create multiple interfaces (Printable, Scannable, Faxable) and implement them in a MultiFunctionPrinter class
- Practice using interface references for polymorphism

---

#### Lesson 7.2: Default and Static Methods in Interfaces
**Duration**: 60 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Default methods in interfaces
- Static methods in interfaces
- Interface evolution without breaking existing code
- Method resolution with multiple inheritance
- Overriding default methods
- Functional interfaces introduction

**What You'll Learn**:
```
• Adding default methods to interfaces (Java 8+)
• Creating static utility methods in interfaces
• Evolving interfaces without breaking existing implementations
• Resolving conflicts when implementing multiple interfaces
• Overriding default methods in implementing classes
• Understanding functional interfaces
```

**Code Example Topics**:
1. Default Methods for Interface Evolution (Vehicle example)
2. Multiple Inheritance with Default Methods (HybridMachine)

**Practice Tasks**:
- Create an interface with default methods and implement it in multiple classes
- Add a default method to an existing interface and verify existing implementations still work
- Implement two interfaces with conflicting default methods and resolve the conflict
- Create utility static methods in an interface for common operations

---

#### Lesson 7.3: Abstract Classes - Templates and Partial Implementation
**Duration**: 65 minutes | **Difficulty**: Expert

**Key Concepts**:
- Abstract class declaration
- Abstract methods
- Concrete methods in abstract classes
- Abstract class constructors
- Template method pattern
- Abstract classes vs interfaces
- When to use each abstraction type

**What You'll Learn**:
```
• Creating abstract classes as templates for subclasses
• Mixing abstract and concrete methods
• Using abstract class constructors
• Implementing the Template Method design pattern
• Deciding when to use abstract classes vs interfaces
• Maintaining state in abstract classes
```

**Code Example Topics**:
1. Abstract Class with Template Method Pattern (DataProcessor)
2. Abstract Class with State and Constructors (BankAccount)
3. Abstract Classes vs Interfaces - Decision Guide

**Practice Tasks**:
- Create an abstract Animal class with abstract and concrete methods
- Implement the template method pattern for a multi-step algorithm
- Design a class hierarchy using abstract classes with shared state
- Compare interface and abstract class solutions for the same problem

---

#### Lesson 7.4: Advanced Interface Patterns and Design Principles
**Duration**: 70 minutes | **Difficulty**: Expert

**Key Concepts**:
- Marker interfaces
- Functional interfaces
- Interface segregation principle
- Composition over inheritance
- Interface adapters
- Strategy pattern with interfaces
- Dependency inversion principle

**What You'll Learn**:
```
• Understanding marker interfaces (Serializable, Cloneable)
• Creating functional interfaces for lambda expressions
• Applying the Interface Segregation Principle
• Favoring composition over inheritance
• Implementing the Strategy design pattern
• Using interfaces for loose coupling (Dependency Inversion)
```

**Code Example Topics**:
1. Interface Segregation Principle (Worker interfaces)
2. Strategy Pattern with Interfaces (SortingStrategy)
3. Composition Over Inheritance with Interfaces (Duck with behaviors)

**Practice Tasks**:
- Refactor a class hierarchy to use interface segregation
- Implement the Strategy pattern for a payment processing system
- Create a composition-based design for vehicles with various capabilities
- Design a plugin architecture using interfaces

---

### 💻 HANDS-ON EXERCISES SECTION

#### Exercise 7.1: Shape Drawing System with Interfaces
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Create a drawing system using interfaces for different shape types and drawing capabilities.

**Step-by-Step Instructions**:
1. Create a Drawable interface with draw() and erase() methods
2. Create a Resizable interface with resize(double factor) method
3. Create a Rotatable interface with rotate(double degrees) method
4. Implement Circle class that implements Drawable and Resizable
5. Implement Rectangle class that implements all three interfaces
6. Implement Triangle class that implements Drawable and Rotatable
7. Create a DrawingApp class to demonstrate polymorphism
8. Use interface references to store and manipulate shapes

**Expected Output**:
```
Drawing circle with radius: 5.0
Circle resized by factor 1.5. New radius: 7.5
Erasing circle

Drawing rectangle: 10.0 x 20.0
Rectangle resized by factor 0.8
Rectangle rotated by 45.0 degrees
Erasing rectangle
```

---

#### Exercise 7.2: Payment Processing with Default Methods
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Build a payment processing system using interfaces with default methods.

**Step-by-Step Instructions**:
1. Create a PaymentMethod interface with processPayment(double amount) abstract method
2. Add a default method printReceipt(double amount) to the interface
3. Add a static method validateAmount(double amount) to check if amount is positive
4. Implement CreditCard class that uses the default printReceipt()
5. Implement Bitcoin class that overrides printReceipt() with custom format
6. Implement BankTransfer class
7. Create a PaymentProcessor class to handle different payment methods
8. Demonstrate all payment methods and receipt printing

**Expected Output**:
```
Processing $100.00 via Credit Card
=== Payment Receipt ===
Amount: $100.00
Payment Method: Credit Card
Status: SUCCESS

Processing $50.00 via Bitcoin
=== CRYPTOCURRENCY RECEIPT ===
Amount: 50.00 BTC
Payment Method: Bitcoin
Block Confirmation: PENDING
Status: SUCCESS
```

---

#### Exercise 7.3: Employee Management with Abstract Classes
**Difficulty**: Hard | **Points**: 150

**Task Description**:
Create an employee management system using abstract classes and the template method pattern.

**Step-by-Step Instructions**:
1. Create abstract class Employee with fields: name, employeeId, baseSalary
2. Add abstract methods: calculateBonus(), getEmployeeType()
3. Add concrete method displayInfo() that shows all employee information
4. Implement template method generatePayroll() that calculates total pay
5. Create FullTimeEmployee subclass with health benefits
6. Create PartTimeEmployee subclass with hourly rate
7. Create Manager subclass that extends FullTimeEmployee
8. Demonstrate polymorphism with Employee array

**Expected Output**:
```
=== Employee Payroll ===
Name: Alice Johnson
ID: FT001
Type: Full-Time Employee
Base Salary: $60000.00
Bonus: $5000.00
Total Pay: $65000.00

Name: Bob Smith
ID: PT001
Type: Part-Time Employee
Hours: 20 per week
Hourly Rate: $25.00
Total Pay: $26000.00
```

---

#### Exercise 7.4: Strategy Pattern Implementation
**Difficulty**: Hard | **Points**: 150

**Task Description**:
Implement the Strategy pattern for a text compression system.

**Step-by-Step Instructions**:
1. Create CompressionStrategy interface with compress() and decompress() methods
2. Implement ZipCompression strategy
3. Implement RLECompression (Run-Length Encoding) strategy
4. Implement NoCompression strategy
5. Create FileCompressor class that uses a compression strategy
6. Allow strategy to be changed at runtime
7. Demonstrate compressing the same text with different strategies
8. Show timing information for each strategy

**Expected Output**:
```
Using: Zip Compression
Original: AAABBBCCCCDDDD (14 chars)
Compressed: ZIP[AAABBBCCCCDDDD] (19 chars)
Time: 0.5ms

Using: RLE Compression
Original: AAABBBCCCCDDDD (14 chars)
Compressed: A3B3C4D4 (8 chars)
Time: 0.3ms

Using: No Compression
Original: AAABBBCCCCDDDD (14 chars)
Compressed: AAABBBCCCCDDDD (14 chars)
Time: 0.1ms
```

---

### 🎯 ASSESSMENT PROJECT

#### Project 7: Notification System with Interfaces and Abstract Classes
**Difficulty**: Hard | **Time**: 90-120 minutes | **Points**: 200

**Project Description**:
Design and implement a comprehensive notification system that demonstrates mastery of interfaces, abstract classes, default methods, and design patterns.

**Project Objectives**:
- Design flexible system using interfaces and abstract classes
- Implement multiple notification channels (Email, SMS, Push)
- Apply interface segregation principle
- Use template method pattern for notification processing
- Demonstrate composition and polymorphism
- Implement Strategy pattern for message formatting

**Requirements Checklist**:
```
Interfaces:
□ Create Notifiable interface with send() method
□ Create Trackable interface with getDeliveryStatus() method
□ Create Formattable interface with format() method
□ Add default method for recipient validation

Abstract Class:
□ Create abstract class BaseNotification with common functionality
□ Implement template method process() that defines workflow
□ Add retry logic in abstract class
□ Provide hook methods for subclasses

Concrete Classes:
□ Implement EmailNotification with subject field
□ Implement SMSNotification with 160 character limit
□ Implement PushNotification with app name

Additional Features:
□ Create MessageFormatter interface with HTML, Plain, and Rich formatters
□ Implement NotificationManager to handle multiple notifications
□ Include priority handling (HIGH, MEDIUM, LOW)
□ Add notification retry logic in abstract class
□ Demonstrate polymorphism with notification arrays
□ Include comprehensive comments explaining design decisions
```

**Expected Features**:
- ✓ Complete interface definitions with default methods
- ✓ Abstract class with template method pattern
- ✓ Three concrete notification classes (Email, SMS, Push)
- ✓ Working retry logic in abstract class
- ✓ Message formatter implementations (Strategy pattern)
- ✓ NotificationManager for handling multiple notifications
- ✓ Polymorphic notification handling
- ✓ Priority system implementation
- ✓ Validation and error handling
- ✓ Status tracking and reporting
- ✓ Professional output formatting
- ✓ Comprehensive comments explaining design

**Sample Interaction**:
```
=== Processing EMAIL ===
Sending email to: john@example.com
Subject: Welcome!
Body: Hello and welcome to our service!
SUCCESS: Notification sent to john@example.com

=== Processing SMS ===
Sending SMS to: +1234567890
Message: Your verification code is 123456
SUCCESS: Notification sent to +1234567890

=== Processing PUSH ===
Sending push notification
App: MyApp
User: user123
Message: You have a new message!
SUCCESS: Notification sent to user123

========== NOTIFICATION STATUSES ==========
ID: N001
Type: EMAIL
Priority: HIGH
Status: DELIVERED
Attempts: 1
---
ID: N002
Type: SMS
Priority: MEDIUM
Status: DELIVERED
Attempts: 1
---
ID: N003
Type: PUSH
Priority: LOW
Status: DELIVERED
Attempts: 1
```

---

## MODULE 8: Exception Handling and File I/O - Building Robust Applications

### 📋 Module Overview Card

**Module ID**: learner-module-8  
**Week**: 8  
**Category**: Learner  
**Required Level**: Learner  
**Estimated Hours**: 5 hours  

**Description**:
Master exception handling mechanisms to create resilient applications and implement robust file input/output operations. Learn to handle errors gracefully, create custom exceptions, and work with files effectively.

---

### 🎯 Module Objectives (Display as checklist)

- [ ] Master try-catch-finally exception handling mechanisms
- [ ] Understand checked vs unchecked exceptions
- [ ] Create custom exception classes for domain-specific errors
- [ ] Implement robust file reading and writing operations
- [ ] Use try-with-resources for automatic resource management
- [ ] Apply exception handling best practices in real applications

---

### 📚 LESSONS SECTION

#### Lesson 8.1: Exception Handling Fundamentals
**Duration**: 60 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Exception hierarchy (Throwable, Error, Exception)
- try-catch blocks
- Multiple catch blocks
- finally block execution
- Checked vs unchecked exceptions
- Exception propagation

**What You'll Learn**:
```
• Understanding Java's exception hierarchy
• Using try-catch blocks to handle exceptions
• Handling multiple exception types with multiple catch blocks
• Using finally block for cleanup operations
• Difference between checked and unchecked exceptions
• How exceptions propagate through the call stack
```

**Code Example Topics**:
1. Basic Exception Handling (division by zero, array index, null pointer)
2. Multiple Catch Blocks and Finally (calculator example)
3. Exception Propagation (method call chain)

**Practice Tasks**:
- Write a program that handles user input errors gracefully
- Create a method that demonstrates exception propagation
- Practice using multiple catch blocks with different exception types
- Debug a program using NetBeans to observe exception flow

---

#### Lesson 8.2: Checked Exceptions and Throws Declaration
**Duration**: 55 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Checked exceptions (IOException, SQLException)
- Unchecked exceptions (RuntimeException subclasses)
- throws keyword for exception declaration
- throw keyword for explicit exception throwing
- Exception handling vs exception declaration
- When to catch vs when to propagate

**What You'll Learn**:
```
• Difference between checked and unchecked exceptions
• Using throws keyword to declare exceptions
• Using throw keyword to throw exceptions explicitly
• When to handle vs when to declare exceptions
• IOException and other checked exceptions
• Design decisions for exception handling
```

**Code Example Topics**:
1. Checked vs Unchecked Exceptions (FileReader example)
2. Throwing Exceptions (age validation, bank account)

**Practice Tasks**:
- Create a method that validates email format and throws appropriate exceptions
- Write a password validator that throws exceptions for weak passwords
- Implement input validation with throws declarations
- Practice deciding when to catch vs when to declare exceptions

---

#### Lesson 8.3: Custom Exception Classes
**Duration**: 50 minutes | **Difficulty**: Expert

**Key Concepts**:
- Creating custom exception classes
- Extending Exception vs RuntimeException
- Exception constructors
- Exception chaining with cause
- Custom exception best practices
- Domain-specific error handling

**What You'll Learn**:
```
• Creating custom exception classes for specific errors
• Extending Exception for checked exceptions
• Extending RuntimeException for unchecked exceptions
• Adding custom fields and methods to exceptions
• Exception chaining to preserve root causes
• Naming and design conventions for custom exceptions
```

**Code Example Topics**:
1. Custom Exception Classes (InvalidEmailException, InsufficientFundsException, AccountException)

**Practice Tasks**:
- Create custom exceptions for a library management system
- Implement exception hierarchy for an e-commerce application
- Practice exception chaining with database operations
- Design custom exceptions with meaningful properties

---

#### Lesson 8.4: File I/O Fundamentals
**Duration**: 65 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- File class for file manipulation
- FileReader and FileWriter
- BufferedReader and BufferedWriter
- Character streams vs byte streams
- Closing resources properly
- File paths and directories

**What You'll Learn**:
```
• Using File class for file system operations
• Reading text files with FileReader and BufferedReader
• Writing text files with FileWriter and BufferedWriter
• Understanding character vs byte streams
• Proper resource cleanup with finally blocks
• Working with file paths and directories
```

**Code Example Topics**:
1. Basic File Writing (FileWriter, BufferedWriter, appending)
2. Basic File Reading (character by character, line by line, entire file)
3. File Class and File Operations (file info, directory operations)

**Practice Tasks**:
- Write a program that creates and writes to a text file
- Read a file and count the number of words and lines
- Create a file copy program
- Implement a program that lists all files in a directory

---

#### Lesson 8.5: Try-With-Resources and Best Practices
**Duration**: 55 minutes | **Difficulty**: Intermediate

**Key Concepts**:
- Try-with-resources syntax
- AutoCloseable interface
- Multiple resources in try-with-resources
- Exception handling best practices
- Resource leak prevention
- When to use try-with-resources

**What You'll Learn**:
```
• Using try-with-resources for automatic resource cleanup
• Understanding the AutoCloseable interface
• Managing multiple resources in try-with-resources
• Preventing resource leaks
• Best practices for exception handling
• Modern Java I/O patterns
```

**Code Example Topics**:
1. Try-With-Resources Basics (traditional vs modern approach)
2. Complete File Processing Example (StudentGradeProcessor)

**Practice Tasks**:
- Convert existing file I/O code to use try-with-resources
- Create a log file analyzer with proper exception handling
- Build a CSV parser with comprehensive error handling
- Implement a text file backup utility

---

### 💻 HANDS-ON EXERCISES SECTION

#### Exercise 8.1: Division Calculator with Exception Handling
**Difficulty**: Easy | **Points**: 75

**Task Description**:
Create a calculator that handles division by zero and invalid input gracefully.

**Step-by-Step Instructions**:
1. Prompt user for two numbers
2. Perform division operation
3. Handle ArithmeticException for division by zero
4. Handle NumberFormatException for invalid input
5. Display appropriate error messages
6. Allow user to retry after errors

**Expected Output**:
```
=== Safe Division Calculator ===
Enter first number: 10
Enter second number: 2
Result: 10.0 / 2.0 = 5.0

Calculate again? (yes/no): yes
Enter first number: 10
Enter second number: 0
Error: Cannot divide by zero!

Calculate again? (yes/no): no
Thank you for using the calculator!
```

---

#### Exercise 8.2: Custom Exception for Age Validation
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Create a custom exception class and use it to validate age input.

**Step-by-Step Instructions**:
1. Create InvalidAgeException custom exception class
2. Extend Exception class (checked exception)
3. Add constructors: default, with message, with message and age value
4. Create validateAge() method that throws InvalidAgeException
5. Validate: age must be between 0 and 150
6. Test with various age inputs

**Expected Output**:
```
=== Age Validation System ===

Testing age 25: ✓ Valid
Testing age -5: ✗ Invalid Age: Age cannot be negative
Testing age 200: ✗ Invalid Age: Age 200 is unrealistic
Testing age 150: ✓ Valid
```

---

#### Exercise 8.3: Text File Writer
**Difficulty**: Easy | **Points**: 75

**Task Description**:
Create a program that writes user input to a text file using BufferedWriter.

**Step-by-Step Instructions**:
1. Prompt user for filename
2. Ask user to enter multiple lines of text
3. User types "DONE" to finish input
4. Write all lines to the file using BufferedWriter
5. Use try-with-resources for automatic resource management
6. Display confirmation message with number of lines written

**Expected Output**:
```
=== Text File Writer ===

Enter filename: mytext.txt
Enter text (type DONE to finish):
> Hello, this is my text file.
> This is line 2.
> This is line 3.
> DONE

✓ Successfully wrote 3 lines to mytext.txt
```

---

#### Exercise 8.4: File Reader and Line Counter
**Difficulty**: Medium | **Points**: 100

**Task Description**:
Read a text file and count lines, words, and characters.

**Step-by-Step Instructions**:
1. Prompt user for filename
2. Read the file using BufferedReader
3. Count total lines, words, and characters
4. Display statistics
5. Handle FileNotFoundException if file doesn't exist
6. Use try-with-resources

**Expected Output**:
```
=== File Statistics Analyzer ===

Enter filename: mytext.txt

File Statistics:
  Lines: 3
  Words: 12
  Characters: 67

✓ Analysis complete
```

---

#### Exercise 8.5: Simple File Copy Program
**Difficulty**: Medium | **Points**: 125

**Task Description**:
Create a program that copies content from one file to another.

**Step-by-Step Instructions**:
1. Prompt for source filename
2. Prompt for destination filename
3. Read from source file line by line
4. Write to destination file
5. Use try-with-resources for both reader and writer
6. Handle exceptions appropriately
7. Display success message with number of lines copied

**Expected Output**:
```
=== File Copy Program ===

Enter source filename: original.txt
Enter destination filename: copy.txt

Copying file...
✓ Successfully copied 15 lines from original.txt to copy.txt
```

---

### 🎯 ASSESSMENT PROJECT

#### Project 8: Student Record Management System
**Difficulty**: Hard | **Time**: 120-150 minutes | **Points**: 200

**Project Description**:
Create a comprehensive student record management system that demonstrates mastery of exception handling and file I/O. The system should save and load student data from files, handle errors gracefully, and provide a menu-driven interface.

**Project Objectives**:
- Implement custom exception classes for domain-specific errors
- Use try-with-resources for all file operations
- Handle multiple exception types appropriately
- Create, read, update, and delete student records
- Persist data to files and load on startup
- Provide user-friendly error messages and recovery options

**Requirements Checklist**:
```
Custom Exceptions:
□ Create InvalidStudentDataException (checked exception)
□ Create FileOperationException (checked exception)
□ Add constructors: no-arg, with message, with message and cause

Student Class:
□ Implement Student class with name, ID, and grades (3 subjects)
□ Add calculateAverage() method
□ Implement toString() for file format (CSV-like)
□ Create static parseStudent(String line) for reading from file

Menu System:
□ Add Student (with input validation)
□ View All Students (formatted display)
□ Search Student (by ID or name)
□ Delete Student (by ID)
□ Calculate Class Average
□ Save & Exit

File Operations:
□ Store student data in text file (students.txt)
□ Load existing data on program start using try-with-resources
□ Save data to file on exit using try-with-resources
□ Handle FileNotFoundException gracefully
□ Handle IOException with detailed messages

Validation:
□ Validate all user input
□ Throw InvalidStudentDataException for invalid data
□ Validate student ID format
□ Validate grade ranges (0-100)
□ Handle duplicate student IDs

Error Handling:
□ Comprehensive try-catch blocks throughout
□ User-friendly error messages
□ Recovery options after errors
□ Proper resource management (no leaks)
```

**Menu System Design**:
```
╔════════════════════════════════════════╗
║  Student Record Management System     ║
╚════════════════════════════════════════╝

=== Main Menu ===
1. Add Student
2. View All Students
3. Search Student
4. Delete Student
5. Calculate Class Average
6. Save & Exit

Enter your choice: _
```

**Expected Features**:
- ✓ Complete menu-driven interface
- ✓ Two custom exception classes with proper constructors
- ✓ Student class with all required fields and methods
- ✓ Add student functionality with input validation
- ✓ View all students with formatted output
- ✓ Search student by ID or name
- ✓ Delete student by ID
- ✓ Calculate individual and class averages
- ✓ Load data from file on startup using try-with-resources
- ✓ Save data to file on exit using try-with-resources
- ✓ Comprehensive exception handling throughout
- ✓ User-friendly error messages
- ✓ Input validation for all user inputs
- ✓ Proper resource management (no resource leaks)

**Sample Interaction**:
```
╔════════════════════════════════════════╗
║  Student Record Management System     ║
╚════════════════════════════════════════╝

Loading student data...
✓ Loaded 5 students from students.txt

=== Main Menu ===
1. Add Student
2. View All Students
3. Search Student
4. Delete Student
5. Calculate Class Average
6. Save & Exit

Enter your choice: 2

=== All Students ===
ID: S001 | Name: Alice Johnson    | Average: 88.33
ID: S002 | Name: Bob Smith        | Average: 92.67
ID: S003 | Name: Carol White      | Average: 85.00
ID: S004 | Name: David Brown      | Average: 91.33
ID: S005 | Name: Eve Davis        | Average: 95.67

Total Students: 5

=== Main Menu ===
1. Add Student
2. View All Students
3. Search Student
4. Delete Student
5. Calculate Class Average
6. Save & Exit

Enter your choice: 5

=== Class Average ===
Class Average: 90.60
Total Students: 5

=== Main Menu ===
1. Add Student
2. View All Students
3. Search Student
4. Delete Student
5. Calculate Class Average
6. Save & Exit

Enter your choice: 6

Saving student data...
✓ Saved 5 students to students.txt

Thank you for using Student Record Management System!
```

---

## 🎨 Figma Layout Guidelines

### Frame Organization

**Frame 1: javaLearnerCurriculumPart1.ts**
- Width: 1920px (desktop) or 1440px
- Height: Auto (scroll)
- Background: #1E1E1E

**Frame 2: javaLearnerCurriculumPart2.ts**
- Same dimensions as Frame 1
- Consistent styling

### Module Card Design

Each module should be displayed as a card with:
- **Border**: 2px solid #7C3AED
- **Border Radius**: 12px
- **Padding**: 32px
- **Margin Bottom**: 48px
- **Background**: #2D2D2D

### Section Headers

- **Lessons**: 📚 emoji + "LESSONS SECTION" in purple
- **Exercises**: 💻 emoji + "HANDS-ON EXERCISES SECTION" in purple
- **Projects**: 🎯 emoji + "ASSESSMENT PROJECT" in purple

### Visual Hierarchy

1. **Module Title**: 32px, Bold, Purple
2. **Section Headers**: 24px, SemiBold, Purple
3. **Lesson/Exercise Titles**: 20px, SemiBold, White
4. **Body Text**: 16px, Regular, Light Gray
5. **Code Blocks**: 14px, Mono, Dark background with syntax highlighting

### Spacing System

- **Module to Module**: 64px
- **Section to Section**: 40px
- **Item to Item**: 24px
- **Text Line Height**: 1.6

---

## Summary

This specification provides the **complete detailed content** for creating a Figma layout showing:

**Part 1 (Modules 5-6)**:
- Module 5: 4 lessons, 4 exercises, 1 assessment project
- Module 6: 4 lessons, 3 exercises, 1 assessment project

**Part 2 (Modules 7-8)**:
- Module 7: 4 lessons, 4 exercises, 1 assessment project
- Module 8: 5 lessons, 5 exercises, 1 assessment project

Each module includes **full details** of:
✓ All lesson topics and subtopics
✓ Complete exercise instructions with expected outputs
✓ Full assessment project requirements
✓ Learning objectives and outcomes
✓ Practice activities and tasks

This document can be used by a designer to create the exact Figma layout you've requested.
