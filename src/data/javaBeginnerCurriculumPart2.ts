// Comprehensive Beginner Track Java Curriculum - Part 2 (Modules 3 & 4)
// Based on NetBeans IDE Self-Paced Learning Module

import { DetailedModule } from './javaBeginnerCurriculum';

// Module 3: Method Mastery
export const module3: DetailedModule = {
  id: 'beginner-module-3',
  week: 3,
  title: 'Method Mastery - Modular Programming and Parameter Handling',
  description: 'Learn to create reusable code with methods, understand parameter passing, and apply proper scoping. Transform your programming from linear scripts into modular, maintainable components.',
  category: 'Beginner',
  requiredLevel: 'Beginner',
  estimatedHours: 3.5,

  objectives: [
    'Create and use methods effectively',
    'Understand parameter passing mechanisms',
    'Apply variable scope and return values properly',
    'Implement method overloading',
    'Use NetBeans refactoring features'
  ],

  learningPhilosophy: 'Methods represent the cornerstone of effective programming, enabling you to break complex problems into manageable, reusable components.',

  theoreticalFoundation: [
    'Methods are specialized tools in a programmer\'s toolkit - each designed for a specific purpose',
    'Modular approach makes programs easier to understand, maintain, and promotes code reuse',
    'Method signatures (name + parameters) must be unique within a class',
    'Java employs pass-by-value for all parameter passing',
    'Variable scope determines where variables can be accessed'
  ],

  lessons: [
    {
      id: 'beginner-lesson-3-1',
      title: 'Method Fundamentals and Structure',
      description: 'Learn method anatomy including access modifiers, return types, parameters, and method body structure.',
      duration: '55 minutes',
      difficulty: 'Easy',
      concepts: [
        'Method declaration syntax',
        'Access modifiers (public, private)',
        'Return types (void and specific types)',
        'Method naming conventions (camelCase)',
        'Method body and code blocks',
        'Method calling and invocation'
      ],
      theoreticalFoundation: [
        'Method components: access modifier + return type + name + parameters + body',
        'Access modifiers control visibility: public (accessible everywhere), private (class only)',
        'Return types specify what data the method provides back',
        'void indicates no return value',
        'Method names should describe what the method does',
        'Method body contains executable statements'
      ],
      netBeansGuidance: [
        'Type method signature and NetBeans suggests completion',
        'Use Code > Insert Code for method generation',
        'Navigator window displays all methods in current class',
        'Right-click method name > Find Usages to see where it\'s called',
        'Use Go To > Go To Declaration to jump to method definition'
      ],
      codeExamples: [
        {
          title: 'Basic Method Examples',
          description: 'Demonstrates various method types and structures.',
          code: `public class MethodBasics {
    // Method with no parameters, no return value
    public static void greetUser() {
        System.out.println("Welcome to Java Methods!");
        System.out.println("Methods make code reusable and organized.");
    }
    
    // Method with parameters, no return value
    public static void greetPersonally(String name) {
        System.out.println("Hello, " + name + "!");
        System.out.println("Welcome to method programming.");
    }
    
    // Method with parameters and return value
    public static int addNumbers(int a, int b) {
        int sum = a + b;
        return sum;
    }
    
    // Method with return value, no parameters
    public static String getMessage() {
        return "This is a message from a method!";
    }
    
    public static void main(String[] args) {
        // Calling methods
        greetUser();
        
        greetPersonally("Alice");
        greetPersonally("Bob");
        
        int result = addNumbers(10, 20);
        System.out.println("Sum: " + result);
        
        String message = getMessage();
        System.out.println(message);
    }
}`,
          explanation: 'This program demonstrates four types of methods: void with no parameters, void with parameters, return value with parameters, and return value without parameters.'
        },
        {
          title: 'Mathematical Utility Methods',
          description: 'Collection of reusable mathematical methods.',
          code: `public class MathUtilities {
    // Calculate circle area
    public static double calculateCircleArea(double radius) {
        if (radius <= 0) {
            System.out.println("Error: Radius must be positive!");
            return -1;
        }
        return Math.PI * radius * radius;
    }
    
    // Calculate rectangle area
    public static double calculateRectangleArea(double length, double width) {
        if (length <= 0 || width <= 0) {
            System.out.println("Error: Dimensions must be positive!");
            return -1;
        }
        return length * width;
    }
    
    // Calculate triangle area
    public static double calculateTriangleArea(double base, double height) {
        if (base <= 0 || height <= 0) {
            System.out.println("Error: Base and height must be positive!");
            return -1;
        }
        return 0.5 * base * height;
    }
    
    // Check if number is even
    public static boolean isEven(int number) {
        return number % 2 == 0;
    }
    
    // Find maximum of two numbers
    public static int findMax(int a, int b) {
        return (a > b) ? a : b;
    }
    
    public static void main(String[] args) {
        System.out.println("=== Mathematical Utilities ===\\n");
        
        double circleArea = calculateCircleArea(5.0);
        System.out.printf("Circle area (radius 5): %.2f%n", circleArea);
        
        double rectArea = calculateRectangleArea(4.0, 6.0);
        System.out.printf("Rectangle area (4x6): %.2f%n", rectArea);
        
        double triArea = calculateTriangleArea(8.0, 5.0);
        System.out.printf("Triangle area (base 8, height 5): %.2f%n", triArea);
        
        System.out.println("\\nIs 10 even? " + isEven(10));
        System.out.println("Is 7 even? " + isEven(7));
        
        System.out.println("\\nMax of 15 and 23: " + findMax(15, 23));
    }
}`,
          explanation: 'This utility class demonstrates methods with parameter validation, return values, and reusable mathematical operations.'
        }
      ],
      practiceExercises: [
        'Create methods for basic arithmetic operations',
        'Write a method that converts Celsius to Fahrenheit',
        'Implement a method that validates user input',
        'Practice using NetBeans Navigator to view methods'
      ]
    },
    {
      id: 'beginner-lesson-3-2',
      title: 'Parameter Passing and Method Overloading',
      description: 'Master parameter passing by value and method overloading for flexible method design.',
      duration: '50 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'Pass-by-value mechanism',
        'Method signatures',
        'Method overloading concept',
        'Overloading with different parameter counts',
        'Overloading with different parameter types',
        'Choosing appropriate overloads'
      ],
      theoreticalFoundation: [
        'Java passes all parameters by value (copies)',
        'For primitives, the value itself is copied',
        'For objects, the reference is copied (both point to same object)',
        'Method overloading allows multiple methods with same name but different parameters',
        'Overloaded methods must differ in parameter count or types',
        'Return type alone cannot differentiate overloaded methods'
      ],
      netBeansGuidance: [
        'Code completion shows all overloaded versions',
        'Hover over method name to see available overloads',
        'NetBeans highlights which overload matches your arguments',
        'Use Refactor > Introduce Parameter to add parameters',
        'Navigator window groups overloaded methods together'
      ],
      codeExamples: [
        {
          title: 'Method Overloading Examples',
          description: 'Demonstrates various overloading scenarios.',
          code: `public class OverloadingDemo {
    // Overloaded findMax methods
    
    // Two integers
    public static int findMax(int a, int b) {
        System.out.println("Called: findMax(int, int)");
        return (a > b) ? a : b;
    }
    
    // Three integers
    public static int findMax(int a, int b, int c) {
        System.out.println("Called: findMax(int, int, int)");
        return findMax(findMax(a, b), c);
    }
    
    // Two doubles
    public static double findMax(double a, double b) {
        System.out.println("Called: findMax(double, double)");
        return (a > b) ? a : b;
    }
    
    // Three doubles
    public static double findMax(double a, double b, double c) {
        System.out.println("Called: findMax(double, double, double)");
        return findMax(findMax(a, b), c);
    }
    
    // Overloaded display methods
    
    // Display integer
    public static void display(int value) {
        System.out.println("Integer value: " + value);
    }
    
    // Display double
    public static void display(double value) {
        System.out.println("Double value: " + value);
    }
    
    // Display string
    public static void display(String value) {
        System.out.println("String value: " + value);
    }
    
    // Display array
    public static void display(int[] array) {
        System.out.print("Array values: ");
        for (int val : array) {
            System.out.print(val + " ");
        }
        System.out.println();
    }
    
    public static void main(String[] args) {
        System.out.println("=== Method Overloading Demo ===\\n");
        
        // Testing findMax overloads
        System.out.println("Finding maximum values:");
        int maxInt2 = findMax(10, 20);
        System.out.println("Result: " + maxInt2);
        
        int maxInt3 = findMax(15, 8, 23);
        System.out.println("Result: " + maxInt3);
        
        double maxDouble2 = findMax(15.5, 20.3);
        System.out.println("Result: " + maxDouble2);
        
        // Testing display overloads
        System.out.println("\\nTesting display methods:");
        display(42);
        display(3.14159);
        display("Hello, Methods!");
        display(new int[]{1, 2, 3, 4, 5});
    }
}`,
          explanation: 'This comprehensive example shows how method overloading provides flexibility in handling different data types and parameter counts while maintaining intuitive method names.'
        }
      ],
      practiceExercises: [
        'Create overloaded methods for calculating area of different shapes',
        'Implement overloaded print methods for different data types',
        'Write temperature conversion methods with multiple overloads',
        'Practice identifying which overload will be called'
      ]
    },
    {
      id: 'beginner-lesson-3-3',
      title: 'Variable Scope and Lifetime',
      description: 'Master variable scope rules, understand local vs instance vs class variables, and manage variable lifetime.',
      duration: '45 minutes',
      difficulty: 'Intermediate',
      concepts: [
        'Local variables in methods',
        'Instance variables (class level)',
        'Class variables (static)',
        'Scope rules and accessibility',
        'Variable lifetime and memory',
        'Variable shadowing'
      ],
      theoreticalFoundation: [
        'Scope determines where variables can be accessed',
        'Local variables exist only during method execution',
        'Instance variables persist for object lifetime',
        'Class (static) variables exist for entire program duration',
        'Variables are accessible only within their declaring scope',
        'Shadowing occurs when local variables hide instance variables with same name'
      ],
      netBeansGuidance: [
        'NetBeans color-codes different variable types',
        'Hover over variables to see their scope',
        'Warning indicators for unused local variables',
        'Use "this" keyword to differentiate shadowed variables',
        'Variables window in debugger shows scope-based organization'
      ],
      codeExamples: [
        {
          title: 'Variable Scope Demonstration',
          description: 'Shows different variable scopes and their accessibility.',
          code: `public class ScopeDemo {
    // Class (static) variable - accessible to all instances
    public static int classCounter = 0;
    
    // Instance variable - unique to each object
    private String instanceName;
    private int instanceValue;
    
    // Constructor
    public ScopeDemo(String name, int value) {
        this.instanceName = name;  // 'this' differentiates instance from parameter
        this.instanceValue = value;
        classCounter++;  // Increment shared counter
    }
    
    public void demonstrateScope() {
        // Local variable - exists only in this method
        int localVariable = 100;
        
        System.out.println("=== Variable Scope Demo ===");
        System.out.println("Instance name: " + instanceName);
        System.out.println("Instance value: " + instanceValue);
        System.out.println("Local variable: " + localVariable);
        System.out.println("Class counter: " + classCounter);
        
        // localVariable is accessible here
        if (instanceValue > 50) {
            // Block-level local variable
            int blockVariable = 200;
            System.out.println("Block variable: " + blockVariable);
            // blockVariable only accessible within this if block
        }
        // blockVariable is NOT accessible here
    }
    
    public void demonstrateShadowing() {
        // Local variable shadows instance variable
        int instanceValue = 999;  // Different from instance variable
        
        System.out.println("\\n=== Shadowing Demo ===");
        System.out.println("Local instanceValue: " + instanceValue);  // 999
        System.out.println("Instance instanceValue: " + this.instanceValue);  // original value
    }
    
    public static void main(String[] args) {
        ScopeDemo obj1 = new ScopeDemo("Object1", 75);
        ScopeDemo obj2 = new ScopeDemo("Object2", 45);
        
        obj1.demonstrateScope();
        obj1.demonstrateShadowing();
        
        System.out.println("\\nTotal objects created: " + ScopeDemo.classCounter);
    }
}`,
          explanation: 'This example demonstrates the three types of variables in Java and shows how scope affects accessibility. The "this" keyword helps differentiate between local and instance variables.'
        }
      ],
      practiceExercises: [
        'Create a class with all three variable types',
        'Practice using "this" keyword to resolve shadowing',
        'Debug a program to observe variable lifetimes',
        'Identify scope-related errors in sample code'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'beginner-ex-3-1',
      title: 'Temperature Converter Library',
      description: 'Create a utility library with methods for temperature conversions.',
      difficulty: 'Easy',
      instructions: [
        'Create a class called TemperatureConverter',
        'Implement method celsiusToFahrenheit(double celsius)',
        'Implement method fahrenheitToCelsius(double fahrenheit)',
        'Implement method celsiusToKelvin(double celsius)',
        'Implement method kelvinToCelsius(double kelvin)',
        'Add input validation for each method',
        'Test all methods in main'
      ],
      starterCode: `public class TemperatureConverter {

      // ===== METHODS =====

      // Convert Celsius to Fahrenheit
      public static double celsiusToFahrenheit(double celsius) {
        // TODO: Fill in the formula for Celsius → Fahrenheit
        return ____; // Hint: Fahrenheit = Celsius * 9/5 + 32
      }

      // Convert Fahrenheit to Celsius
      public static double fahrenheitToCelsius(double fahrenheit) {
        // TODO: Fill in the formula for Fahrenheit → Celsius
        return ____; // Hint: Celsius = (Fahrenheit - 32) * 5/9
      }

      // Convert Celsius to Kelvin
      public static double celsiusToKelvin(double celsius) {
        // TODO: Fill in the formula for Celsius → Kelvin
        return ____; // Hint: Kelvin = Celsius + 273.15
      }

      // Convert Kelvin to Celsius
      public static double kelvinToCelsius(double kelvin) {
        if (kelvin < 0) {
          System.out.println("Invalid input: Kelvin cannot be negative.");
          return 0;
        }
        // TODO: Fill in the formula for Kelvin → Celsius
        return ____; // Hint: Celsius = Kelvin - 273.15
      }

      public static void main(String[] args) {
        System.out.println("=== Temperature Converter ===\\n");

        // ===== TEST CASES =====
        // TODO: Fill in the method calls with proper input
        System.out.println("25.0°C = " + ____ + "°F"); // Hint: call celsiusToFahrenheit(25.0)
        System.out.println("77.0°F = " + ____ + "°C"); // Hint: call fahrenheitToCelsius(77.0)
        System.out.println("25.0°C = " + ____ + "K");  // Hint: call celsiusToKelvin(25.0)
        System.out.println("298.15K = " + ____ + "°C"); // Hint: call kelvinToCelsius(298.15)
      }
    }`,
      expectedOutput: `=== Temperature Converter ===

25.0°C = 77.0°F
77.0°F = 25.0°C
25.0°C = 298.15K
298.15K = 25.0°C`,
      hints: [
        'Formula: F = C * 9/5 + 32',
        'Formula: C = (F - 32) * 5/9',
        'Formula: K = C + 273.15',
        'Validate that Kelvin is not negative'
      ],
      points: 50,
      solutionCode: `public class TemperatureConverter {

      // Convert Celsius to Fahrenheit
      public static double celsiusToFahrenheit(double celsius) {
        return celsius * 9 / 5 + 32;
      }

      // Convert Fahrenheit to Celsius
      public static double fahrenheitToCelsius(double fahrenheit) {
        return (fahrenheit - 32) * 5 / 9;
      }

      // Convert Celsius to Kelvin
      public static double celsiusToKelvin(double celsius) {
        return celsius + 273.15;
      }

      // Convert Kelvin to Celsius
      public static double kelvinToCelsius(double kelvin) {
        if (kelvin < 0) {
          System.out.println("Invalid input: Kelvin cannot be negative.");
          return 0;
        }
        return kelvin - 273.15;
      }

      public static void main(String[] args) {
        // Test your methods here
        System.out.println("=== Temperature Converter ===\\n");

        System.out.println("25.0°C = " + celsiusToFahrenheit(25.0) + "°F");
        System.out.println("77.0°F = " + fahrenheitToCelsius(77.0) + "°C");
        System.out.println("25.0°C = " + celsiusToKelvin(25.0) + "K");
        System.out.println("298.15K = " + kelvinToCelsius(298.15) + "°C");
      }
    }
    `
    },
    {
      id: 'beginner-ex-3-2',
      title: 'String Utility Methods',
      description: 'Create utility methods for string manipulation.',
      difficulty: 'Medium',
      instructions: [
        'Create class StringUtilities',
        'Method capitalizeFirstLetter(String input) - returns string with first letter capitalized',
        'Method reverseString(String input) - returns reversed string',
        'Method countVowels(String input) - returns count of vowels',
        'Method isPalindrome(String input) - checks if string is palindrome',
        'Handle null and empty strings appropriately'
      ],
      starterCode: `import java.util.Scanner;
public class StringUtilitiesDemo {

    // Convert string to uppercase
    public static String toUpper(String input) {
        // return value
    }

    // Convert string to lowercase
    public static String toLower(String input) {
        // return value
    }

    // Compare two strings for equality (case-sensitive)
    public static boolean areEqual(String str1, String str2) {
        // return value
    }

    // Get the length of the string
    public static int getLength(String input) {
        // return value
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        boolean running = true;
        while (running) {
            System.out.println("=== MENU ===");
            // 1. Convert to UPPERCASE
            // 2. Convert to lowercase
            // 3. Check if two strings are equal
            // 4. Find string length
            // 5. Exit
            System.out.print("Choose an option: ");
    	    // input for choice

            switch (choice) {
                case 1:
                    System.out.print("Enter a string: ");
                    String upper = input.nextLine();
                    // Print "UPPERCASE: " + method
                    break;
                case 2:
                    System.out.print("Enter a string: ");
                    String lower = input.nextLine();
                    // Print "lowercase: " + method
                    break;
                case 3:
                    System.out.print("Enter first string: ");
                    String s1 = input.nextLine();
                    System.out.print("Enter second string: ");
                    String s2 = input.nextLine();
                    // Print "Are equal?" + method
                    break;
                case 4:
                    System.out.print("Enter a string: ");
                    String str = input.nextLine();
                    System.out.println("Length: " + ______ );
                    break;
                case 5:
                    System.out.println("Goodbye!");
                    ______ = ______ ;
                    break;
                default:
                    // Print Invalid choice! Please pick 1-5.
            }
        }

        input.close();
    }
}`,
      solutionCode: `import java.util.Scanner;
public class StringUtilitiesDemo {

    // Convert string to uppercase
    public static String toUpper(String input) {
        return input.toUpperCase();
    }

    // Convert string to lowercase
    public static String toLower(String input) {
        return input.toLowerCase();
    }

    // Compare two strings for equality (case-sensitive)
    public static boolean areEqual(String str1, String str2) {
        return str1.equals(str2);
    }

    // Get the length of the string
    public static int getLength(String input) {
        return input.length();
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        boolean running = true;
        while (running) {
            System.out.println("=== MENU ===");
            System.out.println("1. Convert to UPPERCASE");
            System.out.println("2. Convert to lowercase");
            System.out.println("3. Check if two strings are equal");
            System.out.println("4. Find string length");
            System.out.println("5. Exit");
            System.out.print("Choose an option: ");
            int choice = input.nextInt();
            input.nextLine(); // consume newline

            switch (choice) {
                case 1:
                    System.out.print("Enter a string: ");
                    String upper = input.nextLine();
                    System.out.println("UPPERCASE: " + toUpper(upper) + "\n");
                    break;
                case 2:
                    System.out.print("Enter a string: ");
                    String lower = input.nextLine();
                    System.out.println("lowercase: " + toLower(lower) + "\n");
                    break;
                case 3:
                    System.out.print("Enter first string: ");
                    String s1 = input.nextLine();
                    System.out.print("Enter second string: ");
                    String s2 = input.nextLine();
                    System.out.println("Are equal? " + areEqual(s1, s2) + "\n");
                    break;
                case 4:
                    System.out.print("Enter a string: ");
                    String str = input.nextLine();
                    System.out.println("Length: " + getLength(str) + "\n");
                    break;
                case 5:
                    System.out.println("Goodbye!");
                    running = false;
                    break;
                default:
                    System.out.println("Invalid choice! Please pick 1-5.\n");
            }
        }

        input.close();
    }
}
`,
      hints: [
        'Use charAt() to access individual characters',
        'Use length() for string length',
        'StringBuilder helpful for string building',
        'Consider case sensitivity for palindrome check'
      ],
      expectedOutput: `  === String Utilities Demo ===
    1. Convert to UPPERCASE
    2. Convert to lowercase
    3. Check if two strings are equal
    4. Find string length
    5. Exit
    Choose an option: (n)`,
      points: 75
    },
    {
      id: 'beginner-ex-3-3',
      title: 'Simple Number Checker',
      description: 'Create overloaded validation methods for different number ranges.',
      difficulty: 'Medium',
      instructions: [
        'Create class NumberValidator',
        'Overload isInRange() for int and double types',
        'Version 1: isInRange(int value, int min, int max)',
        'Version 2: isInRange(double value, double min, double max)',
        'Add another overload that just checks if value is positive',
        'Return boolean indicating if value is in valid range'
      ],
      starterCode: `import java.util.Scanner;
    public class SimpleNumberChecker {

      // ===== METHODS =====
      //This method checks if the number is positive
      // Output: true if positive, false otherwise
      ________ ________ ________ isPositive(int number) {
        // Use > 0 to check positivity
      }

      ________ ________ ________ isInRange(int number) {
        // Use >= and <=
      }

      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.println("=== Simple Number Checker ===");
        System.out.print("Enter a number: ");
        // Variable for storing the number: num

        // ===== POSITIVE CHECK =====
        // SOUT Example if number = 5:
        // Your number is positive!
        // Else Your number is not positive!


        // ===== RANGE CHECK =====
        if (__________) {
          System.out.println("Your number is in the range 1-10!");
        } else {
          // SOUT Example if number = 15:
          // Print Your number is NOT in the range 1-10!
        }

        input.close();

      }
    }`,
      hints: [
        'Methods used:',
        ' - isPositive(num)  -> returns true if num > 0',
        ' - isInRange(num)   -> returns true if num >= 1 and <= 10',
        'Variables:',
        ' - num : stores the user input',
        'SOUT statements give feedback to the user'
      ],
      expectedOutput: `=== Simple Number Checker ===
    Enter a number: 5
    Your number is positive!
    Your number is in the range 1-10!`,
      solutionCode: `import java.util.Scanner;
    public class SimpleNumberChecker {

      // Check if number is positive
      public static boolean isPositive(int number) {
        return number > 0;
      }

      // Check if number is between 1 and 10
      public static boolean isInRange(int number) {
        return number >= 1 && number <= 10;
      }

      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.println("=== Simple Number Checker ===");

        System.out.print("Enter a number: ");
        int num = input.nextInt();

        // Check if positive
        if (isPositive(num)) {
          System.out.println("Your number is positive!");
        } else {
          System.out.println("Your number is not positive!");
        }

        // Check if in range 1-10
        if (isInRange(num)) {
          System.out.println("Your number is in the range 1-10!");
        } else {
          System.out.println("Your number is NOT in the range 1-10!");
        }

        input.close();
      }
    }
    `,
      points: 75
    }
  ],

  assessmentProject: {
    id: 'beginner-project-3',
    title: 'Advanced Calculator with Method Organization',
    description: 'Build a comprehensive calculator application organized with methods, demonstrating modular programming principles.',
    objectives: [
      'Design and implement well-organized methods',
      'Apply method overloading effectively',
      'Create reusable utility methods',
      'Implement proper parameter validation',
      'Demonstrate code organization best practices'
    ],
    requirements: [
      'Create menu-driven calculator with 5 operation categories',
      'Basic operations: add, subtract, multiply, divide, modulus',
      'Advanced operations: power, square root, logarithm',
      'Geometric calculations: circle area, rectangle area, triangle area',
      'Temperature conversions: Celsius/Fahrenheit/Kelvin',
      'Statistics: average, maximum, minimum of multiple numbers',
      'Each category should have its own method',
      'Use method overloading where appropriate',
      'Include comprehensive error handling',
      'Professional formatting and documentation'
    ],
    starterCode: `import java.util.Scanner;

  /**
   * Advanced Calculator - Module 3 Assessment
   * Author: [Your Name]
   * Description: Menu-driven calculator demonstrating method mastery
   */
  public class AdvancedCalculator {
    private static Scanner input = new Scanner(System.in);

    // ===== BASIC OPERATIONS =====

    // This method uses double to add two numbers
    // Parameters: a (first number), b (second number)
    // Return: sum of a and b

    // This method uses double to minus two numbers
    // Parameters: a (first number), b (second number)
    // Return: difference of a and b

    // This method uses double to multiply two numbers
    // Parameters: a (first number), b (second number)
    // Return: product of a and b

    // Hint: This method divides two numbers
    // Special case: division by zero is not allowed
    public static double divide(double a, double b) {
      if (b == 0) {
        // SOUT Example:
        // Error: Cannot divide by zero!
        System.out.println("Error: Cannot divide by zero!");
        return 0;
      }
      return a / b;
    }

    // ===== TEMPERATURE CONVERSIONS =====
    // Uses double to convert Celsius to Fahrenheit
    // returns return (c * 9 / 5) + 32;

    // Uses double to convert Fahrenheit to Celsius
    // returns (f - 32) * 5 / 9;
    // Hint: Converts Fahrenheit to Celsius


    // ===== MENU DISPLAY =====
    // Displays the main menu options
    public static void displayMenu() {
      System.out.println("\n=== Beginner Calculator ===");
      // Display 1. Basic Operations
      // Display 2. Temperature Conversion
      // Display 3. Exit
      System.out.print("Enter choice: ");
    }

    public static void main(String[] args) {


      System.out.println("╔════════════════════════════════╗");
      System.out.println("║      Advanced Calculator                 ║");
      System.out.println("╚════════════════════════════════╝");

      boolean running = true;

      // ===== MAIN MENU LOOP =====
      while (running) {
        displayMenu();

        int choice = input.nextInt();

        // ===== MENU SELECTION =====
        switch (choice) {

          case 1:
            // Calls method for +, -, *, /
            break;

          case 2:
            // Calls method for temperature conversion
            break;

          case 3:
            // Display Thank you for using Beginner Calculator!
            break;

          default:
            // Display Invalid choice! Please select 1-3.
            System.out.println("Invalid choice! Please select 1-3.");
        }
      }

      input.close();
    }

    // ===== HANDLER METHODS =====
    private static void handleBasicOperations() {

      System.out.print("Enter first number: ");
      // Variable name: double a

      System.out.print("Enter second number: ");
      // Variable name: double b

      System.out.println("Addition: " + add(a, b));
      System.out.println("Subtraction: " + subtract(a, b));
      System.out.println("Multiplication: " + multiply(a, b));
      System.out.println("Division: " + divide(a, b));
    }

    private static void handleTemperatureConversion() {

      System.out.print("Enter temperature: ");
      // Variable name: double temp

      System.out.println("Celsius to Fahrenheit: " + celsiusToFahrenheit(temp));
      System.out.println("Fahrenheit to Celsius: " + fahrenheitToCelsius(temp));
    }
  }
  `,
    solutionCode: `import java.util.Scanner;

  /**
   * Advanced Calculator - Module 3 Assessment
   * Author: [Your Name]
   * Description: Menu-driven calculator demonstrating basic methods
   */
  public class AdvancedCalculator {
    private static Scanner input = new Scanner(System.in);

    // ===== BASIC OPERATIONS =====
    public static double add(double a, double b) {
      return a + b;
    }

    public static double subtract(double a, double b) {
      return a - b;
    }

    public static double multiply(double a, double b) {
      return a * b;
    }

    public static double divide(double a, double b) {
      if (b == 0) {
        System.out.println("Error: Cannot divide by zero!");
        return 0;
      }
      return a / b;
    }

    // ===== TEMPERATURE CONVERSIONS =====
    public static double celsiusToFahrenheit(double c) {
      return (c * 9 / 5) + 32;
    }

    public static double fahrenheitToCelsius(double f) {
      return (f - 32) * 5 / 9;
    }

    // ===== MENU DISPLAY =====
    public static void displayMenu() {
      System.out.println("\n=== Beginner Calculator ===");
      System.out.println("1. Basic Operations");
      System.out.println("2. Temperature Conversion");
      System.out.println("3. Exit");
      System.out.print("Enter choice: ");
    }

    public static void main(String[] args) {
      System.out.println("╔════════════════════════════════╗");
      System.out.println("║      Advanced Calculator                 ║");
      System.out.println("╚════════════════════════════════╝");

      boolean running = true;

      while (running) {
        displayMenu();
        int choice = input.nextInt();

        switch (choice) {
          case 1:
            handleBasicOperations();
            break;
          case 2:
            handleTemperatureConversion();
            break;
          case 3:
            running = false;
            System.out.println("Thank you for using Beginner Calculator!");
            break;
          default:
            System.out.println("Invalid choice! Please select 1-3.");
        }
      }

      input.close();
    }

    // ===== HANDLER METHODS =====
    private static void handleBasicOperations() {
      System.out.print("Enter first number: ");
      double a = input.nextDouble();

      System.out.print("Enter second number: ");
      double b = input.nextDouble();

      System.out.println("Addition: " + add(a, b));
      System.out.println("Subtraction: " + subtract(a, b));
      System.out.println("Multiplication: " + multiply(a, b));
      System.out.println("Division: " + divide(a, b));
    }

    private static void handleTemperatureConversion() {
      System.out.print("Enter temperature: ");
      double temp = input.nextDouble();

      System.out.println("Celsius to Fahrenheit: " + celsiusToFahrenheit(temp));
      System.out.println("Fahrenheit to Celsius: " + fahrenheitToCelsius(temp));
    }
  }
  `,
    expectedFeatures: [
      'Complete implementation of all 5 operation categories',
      'Method overloading for operations that work with different types',
      'Comprehensive input validation',
      'Error handling for edge cases (division by zero, negative square roots)',
      'Helper methods for input collection',
      'Professional output formatting',
      'Well-documented code with comments',
      'Organized method structure'
    ],
    estimatedTime: '90-120 minutes',
    difficulty: 'Hard',
    points: 150
  }
};


// Module 4: Arrays and String Manipulation
export const module4: DetailedModule = {
  id: 'beginner-module-4',
  week: 4,
  title: 'Data Structure Foundations - Arrays and String Manipulation',
  description: 'Master array operations, multidimensional arrays, and comprehensive string manipulation techniques. Learn to work with collections of data and text processing.',
  category: 'Learner',
  requiredLevel: 'Learner',
  estimatedHours: 4,

  objectives: [
    'Work with arrays and multidimensional arrays',
    'Perform comprehensive string operations',
    'Implement array algorithms (searching, sorting)',
    'Apply string processing techniques',
    'Use NetBeans array debugging and visualization'
  ],

  learningPhilosophy: 'Arrays and strings are fundamental data structures. Mastering them provides the foundation for understanding more complex data structures and algorithms.',

  theoreticalFoundation: [
    'Arrays store multiple values of the same type under a single variable name',
    'Array indices start at 0 and extend to length - 1 (zero-based indexing)',
    'Strings in Java are immutable objects representing sequences of characters',
    'StringBuilder provides efficient string construction',
    'Understanding these structures is crucial for data processing and algorithm implementation'
  ],

  lessons: [
    {
      id: 'beginner-lesson-4-1',
      title: 'Array Fundamentals and Operations',
      description: 'Learn array declaration, initialization, traversal, and basic operations.',
      duration: '55 minutes',
      difficulty: 'Easy',
      concepts: [
        'Array declaration syntax',
        'Array initialization methods',
        'Array indexing and access',
        'Array length property',
        'Array traversal with loops',
        'Common array operations'
      ],
      theoreticalFoundation: [
        'Arrays are objects in Java',
        'Fixed size once created',
        'Efficient random access using indices',
        'Zero-based indexing: first element at index 0',
        'Out-of-bounds access causes ArrayIndexOutOfBoundsException',
        'Enhanced for loop simplifies array traversal'
      ],
      netBeansGuidance: [
        'Variables window displays array contents during debugging',
        'Hover over array variable to see length and type',
        'Use Array Visualizer for graphical representation',
        'Breakpoints in loops help examine each iteration',
        'Code completion suggests array methods and properties'
      ],
      codeExamples: [
        {
          title: 'Array Basics',
          description: 'Demonstrates array declaration, initialization, and access.',
          code: `public class ArrayBasics {
    public static void main(String[] args) {
        System.out.println("=== Array Fundamentals ===\\n");
        
        // Array declaration and initialization - Method 1
        int[] numbers = new int[5];  // Creates array of size 5
        numbers[0] = 10;
        numbers[1] = 20;
        numbers[2] = 30;
        numbers[3] = 40;
        numbers[4] = 50;
        
        // Array declaration and initialization - Method 2 (literal)
        String[] names = {"Alice", "Bob", "Charlie", "Diana", "Eve"};
        
        // Array declaration and initialization - Method 3
        double[] prices = new double[]{9.99, 19.99, 29.99, 39.99};
        
        // Accessing array elements
        System.out.println("First number: " + numbers[0]);
        System.out.println("Last number: " + numbers[numbers.length - 1]);
        System.out.println("Array length: " + numbers.length);
        
        // Traversing array with regular for loop
        System.out.println("\\nNumbers array (for loop):");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Index " + i + ": " + numbers[i]);
        }
        
        // Traversing array with enhanced for loop
        System.out.println("\\nNames array (enhanced for loop):");
        for (String name : names) {
            System.out.println(name);
        }
        
        // Modifying array elements
        System.out.println("\\nModifying array:");
        numbers[2] = 100;  // Change third element
        System.out.println("New value at index 2: " + numbers[2]);
    }
}`,
          explanation: 'This program demonstrates three methods of array initialization, accessing elements, and two ways to traverse arrays.'
        },
        {
          title: 'Array Operations and Algorithms',
          description: 'Common array operations including search, sum, average, min, max.',
          code: `public class ArrayOperations {
    public static void main(String[] args) {
        int[] scores = {85, 92, 78, 90, 88, 76, 95, 89};
        
        System.out.println("=== Array Operations ===\\n");
        
        // Display array
        System.out.print("Scores: ");
        for (int score : scores) {
            System.out.print(score + " ");
        }
        System.out.println();
        
        // Calculate sum
        int sum = 0;
        for (int score : scores) {
            sum += score;
        }
        System.out.println("\\nSum: " + sum);
        
        // Calculate average
        double average = (double) sum / scores.length;
        System.out.printf("Average: %.2f%n", average);
        
        // Find maximum
        int max = scores[0];
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] > max) {
                max = scores[i];
            }
        }
        System.out.println("Maximum score: " + max);
        
        // Find minimum
        int min = scores[0];
        for (int i = 1; i < scores.length; i++) {
            if (scores[i] < min) {
                min = scores[i];
            }
        }
        System.out.println("Minimum score: " + min);
        
        // Count scores above average
        int aboveAverage = 0;
        for (int score : scores) {
            if (score > average) {
                aboveAverage++;
            }
        }
        System.out.println("\\nScores above average: " + aboveAverage);
        
        // Linear search
        int searchValue = 90;
        int foundIndex = -1;
        for (int i = 0; i < scores.length; i++) {
            if (scores[i] == searchValue) {
                foundIndex = i;
                break;
            }
        }
        
        if (foundIndex != -1) {
            System.out.println("Found " + searchValue + " at index " + foundIndex);
        } else {
            System.out.println(searchValue + " not found");
        }
    }
}`,
          explanation: 'This program demonstrates essential array operations: sum, average, finding maximum/minimum, counting elements meeting criteria, and linear search.'
        }
      ],
      practiceExercises: [
        'Create an array of test scores and calculate statistics',
        'Implement a program that reverses an array',
        'Write code to find duplicate values in an array',
        'Practice with NetBeans array debugger'
      ]
    },
    {
      id: 'beginner-lesson-4-2',
      title: 'Multidimensional Arrays and Matrix Operations',
      description: 'Work with 2D arrays and implement matrix operations.',
      duration: '60 minutes',
      difficulty: 'Intermediate',
      concepts: [
        '2D array declaration and initialization',
        'Accessing 2D array elements',
        'Nested loops for 2D array traversal',
        'Matrix operations (addition, multiplication)',
        'Jagged arrays',
        'Practical applications'
      ],
      theoreticalFoundation: [
        '2D arrays represent tabular data (rows and columns)',
        'Declared as: type[][] arrayName',
        'Accessed with two indices: array[row][column]',
        'Java implements as arrays of arrays',
        'Nested loops process 2D arrays',
        'Jagged arrays allow rows of different lengths'
      ],
      netBeansGuidance: [
        'Variables window shows 2D array structure',
        'Expand array nodes to see individual rows',
        'Watch window helpful for tracking indices',
        'Breakpoints in nested loops show iteration patterns',
        'Array visualizer displays matrix form'
      ],
      codeExamples: [
        {
          title: '2D Array Fundamentals',
          description: 'Demonstrates 2D array creation and manipulation.',
          code: `public class TwoDArrayDemo {
    public static void main(String[] args) {
        System.out.println("=== 2D Array Fundamentals ===\\n");
        
        // Declaration and initialization - Method 1
        int[][] matrix1 = new int[3][4];  // 3 rows, 4 columns
        
        // Declaration and initialization - Method 2 (literal)
        int[][] matrix2 = {
            {1, 2, 3, 4},
            {5, 6, 7, 8},
            {9, 10, 11, 12}
        };
        
        // Accessing elements
        System.out.println("Element at [0][0]: " + matrix2[0][0]);  // 1
        System.out.println("Element at [1][2]: " + matrix2[1][2]);  // 7
        System.out.println("Element at [2][3]: " + matrix2[2][3]);  // 12
        
        // Dimensions
        System.out.println("\\nRows: " + matrix2.length);
        System.out.println("Columns: " + matrix2[0].length);
        
        // Traversing with nested loops
        System.out.println("\\nMatrix display:");
        for (int i = 0; i < matrix2.length; i++) {
            for (int j = 0; j < matrix2[i].length; j++) {
                System.out.printf("%4d", matrix2[i][j]);
            }
            System.out.println();
        }
        
        // Calculate sum of all elements
        int sum = 0;
        for (int i = 0; i < matrix2.length; i++) {
            for (int j = 0; j < matrix2[i].length; j++) {
                sum += matrix2[i][j];
            }
        }
        System.out.println("\\nSum of all elements: " + sum);
        
        // Sum of each row
        System.out.println("\\nRow sums:");
        for (int i = 0; i < matrix2.length; i++) {
            int rowSum = 0;
            for (int j = 0; j < matrix2[i].length; j++) {
                rowSum += matrix2[i][j];
            }
            System.out.println("Row " + i + ": " + rowSum);
        }
    }
}`,
          explanation: 'This program introduces 2D arrays with declaration, initialization, access, and traversal using nested loops.'
        }
      ],
      practiceExercises: [
        'Create a 2D array for storing student grades',
        'Implement matrix addition',
        'Write code to find the maximum value in a 2D array',
        'Create a simple tic-tac-toe board using 2D array'
      ]
    },
    {
      id: 'beginner-lesson-4-3',
      title: 'String Processing and Manipulation',
      description: 'Master String class methods and text manipulation techniques.',
      duration: '50 minutes',
      difficulty: 'Easy',
      concepts: [
        'String immutability',
        'String methods (charAt, substring, indexOf)',
        'String comparison (equals, equalsIgnoreCase, compareTo)',
        'String modification (toUpperCase, toLowerCase, trim)',
        'String formatting',
        'StringBuilder for efficient construction'
      ],
      theoreticalFoundation: [
        'Strings are immutable in Java',
        'String operations create new string objects',
        'Use == for reference comparison, equals() for content',
        'charAt() accesses individual characters',
        'substring() extracts portions of strings',
        'StringBuilder provides mutable string operations'
      ],
      netBeansGuidance: [
        'Code completion shows available String methods',
        'Hover over strings to see content and length',
        'Debugger displays string content in Variables window',
        'Watch expressions useful for string manipulations',
        'NetBeans highlights string literals in green'
      ],
      codeExamples: [
        {
          title: 'String Methods Comprehensive Demo',
          description: 'Demonstrates essential String class methods.',
          code: `public class StringMethodsDemo {
    public static void main(String[] args) {
        System.out.println("=== String Methods Demo ===\\n");
        
        String text = "  Java Programming  ";
        String text2 = "java programming";
        
        // Length
        System.out.println("Original: '" + text + "'");
        System.out.println("Length: " + text.length());
        
        // Trimming
        String trimmed = text.trim();
        System.out.println("Trimmed: '" + trimmed + "'");
        System.out.println("Trimmed length: " + trimmed.length());
        
        // Case conversion
        System.out.println("\\nCase Conversion:");
        System.out.println("Uppercase: " + trimmed.toUpperCase());
        System.out.println("Lowercase: " + trimmed.toLowerCase());
        
        // Character access
        System.out.println("\\nCharacter Access:");
        System.out.println("First character: " + trimmed.charAt(0));
        System.out.println("Last character: " + trimmed.charAt(trimmed.length() - 1));
        
        // Substring
        System.out.println("\\nSubstring Operations:");
        System.out.println("Substring(0, 4): " + trimmed.substring(0, 4));  // "Java"
        System.out.println("Substring(5): " + trimmed.substring(5));  // "Programming"
        
        // Index operations
        System.out.println("\\nIndex Operations:");
        System.out.println("Index of 'P': " + trimmed.indexOf('P'));
        System.out.println("Index of 'gram': " + trimmed.indexOf("gram"));
        System.out.println("Last index of 'a': " + trimmed.lastIndexOf('a'));
        
        // Contains check
        System.out.println("\\nContains Check:");
        System.out.println("Contains 'Java': " + trimmed.contains("Java"));
        System.out.println("Contains 'Python': " + trimmed.contains("Python"));
        
        // String comparison
        System.out.println("\\nString Comparison:");
        System.out.println("equals (case-sensitive): " + trimmed.equals(text2));
        System.out.println("equalsIgnoreCase: " + trimmed.equalsIgnoreCase(text2));
        
        // Replace
        System.out.println("\\nReplace Operations:");
        System.out.println("Replace 'Java' with 'Python': " + trimmed.replace("Java", "Python"));
        System.out.println("Replace 'a' with '@': " + trimmed.replace('a', '@'));
        
        // Split
        System.out.println("\\nSplit Operation:");
        String sentence = "Java is fun and powerful";
        String[] words = sentence.split(" ");
        System.out.println("Words in sentence:");
        for (String word : words) {
            System.out.println("  - " + word);
        }
    }
}`,
          explanation: 'Comprehensive demonstration of essential String methods for text processing and manipulation.'
        },
        {
          title: 'StringBuilder for Efficient String Building',
          description: 'Shows efficient string construction with StringBuilder.',
          code: `public class StringBuilderDemo {
    public static void main(String[] args) {
        System.out.println("=== StringBuilder Demo ===\\n");
        
        // Creating StringBuilder
        StringBuilder sb = new StringBuilder("Hello");
        
        System.out.println("Initial: " + sb);
        System.out.println("Length: " + sb.length());
        System.out.println("Capacity: " + sb.capacity());
        
        // Append
        sb.append(" World");
        sb.append("!");
        System.out.println("\\nAfter append: " + sb);
        
        // Insert
        sb.insert(6, "Java ");
        System.out.println("After insert: " + sb);
        
        // Delete
        sb.delete(11, 17);  // Remove "World"
        System.out.println("After delete: " + sb);
        
        // Reverse
        StringBuilder reversed = new StringBuilder("Java");
        reversed.reverse();
        System.out.println("\\nReversed 'Java': " + reversed);
        
        // Building complex string efficiently
        System.out.println("\\n=== Efficient String Building ===");
        StringBuilder report = new StringBuilder();
        report.append("Student Report\\n");
        report.append("==============\\n");
        report.append("Name: Alice Johnson\\n");
        report.append("Grade: A\\n");
        report.append("Score: 95\\n");
        
        String finalReport = report.toString();
        System.out.println(finalReport);
        
        // Comparing efficiency (conceptual)
        System.out.println("StringBuilder is efficient for:");
        System.out.println("- Loops with string concatenation");
        System.out.println("- Building large strings");
        System.out.println("- Frequent modifications");
    }
}`,
          explanation: 'StringBuilder provides efficient string construction through its mutable nature, avoiding creation of multiple String objects.'
        }
      ],
      practiceExercises: [
        'Create a program that counts vowels and consonants',
        'Implement a palindrome checker',
        'Write a program that reverses words in a sentence',
        'Build a text formatter using StringBuilder'
      ]
    }
  ],

  handsOnExercises: [
    {
      id: 'beginner-ex-4-1',
      title: 'Simple Array Practice',
      description: 'Create a program to manage and analyze set of numbers using arrays.',
      difficulty: 'Medium',
      instructions: [
        'Create arrays for getting 5 numbers',
        'Implement method to calculate the total',
      ],
      starterCode: `public class SimpleArrayExample {
      public static void main(String[] args) {

        int[] numbers = {5, 10, 15, 20, 25};

        System.out.println("=== Favorite Numbers ===\n");

        int total = 0;

        // ===== LOOP THROUGH ARRAY =====
        // Hint: Use a loop to access each element in the array
        // numbers.length gives the total number of elements
          System.out.println("Number " + (i + 1) + ": " + numbers[i]);

        // Display "\nTotal: " + total
      }
    }`,
      expectedOutput: `=== Favorite Numbers ===

    Number 1: 5
    Number 2: 10
    Number 3: 15
    Number 4: 20
    Number 5: 25

    Total: 75`,
      solutionCode: `public class SimpleArrayExample {
      public static void main(String[] args) {

        int[] numbers = {5, 10, 15, 20, 25};

        System.out.println("=== Favorite Numbers ===\n");

        int total = 0;

        for (int i = 0; i < numbers.length; i++) {
          System.out.println("Number " + (i + 1) + ": " + numbers[i]);
          total += numbers[i];
        }

        System.out.println("\nTotal: " + total);
      }
    }`,
      hints: [
        'Use an array to store multiple values of the same type',
        'Use a for loop to go through each element in the array',
        'Use the .length property to control how many times the loop runs'

      ],
      points: 75
    },
    {
      id: 'beginner-ex-4-2',
      title: 'Text Analyzer',
      description: 'Build a text analysis tool using string methods.',
      difficulty: 'Medium',
      instructions: [
        'Prompt user for a sentence or paragraph',
        'Count total characters (including spaces)',
        'Count characters (excluding spaces)',
        'Count words',
        'Count vowels and consonants',
        'Display all statistics'
      ],
      starterCode: `import java.util.Scanner;
    public class TextAnalyzer {
      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.println("=== Text Analyzer ===");
        System.out.print("Enter text: ");

        String text = input.__________();

        // ===== VARIABLES =====
        int totalChars = text.__________;
        int noSpaceChars = 0;
        int wordCount = 0;
        int vowels = 0;
        int consonants = 0;

        String vowelLetters = "__________"; // All lowercase + uppercase vowels


        // ===== LOOP THROUGH CHARACTERS =====
        for (int i = 0; i < text.__________; i++) { // Loop through each character
          // Fill in: get character at index i
          char ch = text.__________;

          // Fill in: count non-space characters
          if (ch != '________') { 
            noSpaceChars = noSpaceChars ______ 1; // Increment by 1
          }

          // Fill in: check if character is a letter
          if (Character.__________(ch)) { 
            // Fill in: check if character is a vowel
            if (vowelLetters.__________(ch) != -1) { 
              vowels = vowels ______ 1; // increment vowels
            } else {
              consonants = consonants ______ 1; // Increment consonants
            }
          }
        }

        // ===== COUNT WORDS =====
        if (!text.__________().__________()) { Trim and check if empty
          // Fill in: split text into words
          String[] words = text.__________("\\s+");
          wordCount = words.__________; // Number of elements
        }

        // ===== DISPLAY RESULTS =====
        System.out.println("\nTotal characters: " + totalChars);
        System.out.println("Characters (no spaces): " + noSpaceChars);
        System.out.println("Word count: " + wordCount);
        System.out.println("Vowels: " + vowels);
        System.out.println("Consonants: " + consonants);

        input.__________();
      }
    }`,
      hints: [
        'Use length() for total characters',
        'split(\" \") for word count',
        'Check each character with charAt()',
        'String vowels = \"aeiouAEIOU\" for checking'
      ],
      expectedOutput: `=== Text Analyzer ===
    Enter text: Java programming is fun

    Total characters: 24
    Characters (no spaces): 20
    Word count: 4
    Vowels: 7
    Consonants: 13`,
      solutionCode: `import java.util.Scanner;

    public class TextAnalyzer {
      public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        System.out.println("=== Text Analyzer ===");
        System.out.print("Enter text: ");
        String text = input.nextLine();

        int totalChars = text.length();
        int noSpaceChars = 0;
        int wordCount = 0;
        int vowels = 0;
        int consonants = 0;

        String vowelLetters = "aeiouAEIOU";

        // Count characters, vowels, consonants, and non-space characters
        for (int i = 0; i < text.length(); i++) {
          char ch = text.charAt(i);

          if (ch != ' ') {
            noSpaceChars++;
          }

          if (Character.isLetter(ch)) {
            if (vowelLetters.indexOf(ch) != -1) {
              vowels++;
            } else {
              consonants++;
            }
          }
        }

        // Count words
        if (!text.trim().isEmpty()) {
          String[] words = text.trim().split("\\s+");
          wordCount = words.length;
        }

        System.out.println("\nTotal characters: " + totalChars);
        System.out.println("Characters (no spaces): " + noSpaceChars);
        System.out.println("Word count: " + wordCount);
        System.out.println("Vowels: " + vowels);
        System.out.println("Consonants: " + consonants);

        input.close();
      }
    }`,
      points: 75
    },
    {
      id: 'beginner-ex-4-3',
      title: 'Matrix Calculator',
      description: 'Implement basic matrix operations using 2D arrays.',
      difficulty: 'Hard',
      instructions: [
        'Create two 3x3 matrices',
        'Implement matrix addition',
        'Implement matrix subtraction',
        'Display matrices in formatted grid',
        'Handle matrix operations properly'
      ],
      starterCode: `public class MatrixCalculator {
      public static void main(String[] args) {

        // ===== MATRIX DECLARATION =====
        // Fill in: create a 3x3 matrix
        int[][] matrix1 = {
          {__, __, __},
          {__, __, __},
          {__, __, __}
        };

        int[][] matrix2 = {
          {__, __, __},
          {__, __, __},
          {__, __, __}
        };


        // ===== DISPLAY MATRICES =====
        System.out.println("Matrix 1:");
        displayMatrix(__________); // Hint: pass the first matrix

        System.out.println("\nMatrix 2:");
        displayMatrix(__________); // Hint: pass the second matrix

        // ===== ADDITION =====
        int[][] sum = new int[3][3]; // Blank: matrix to store addition
        for (int i = 0; i < ________; i++) { // Hint: number of rows
          for (int j = 0; j < ________; j++) { // Hint: number of columns
            // Fill in: add corresponding elements
            sum[i][j] = matrix1[i][j] ________ matrix2[i][j]; 
          }
        }
        System.out.println("\nSum of matrices:");
        displayMatrix(__________); // Hint: pass the sum matrix

        // ===== SUBTRACTION =====
        int[][] diff = new int[3][3];
        for (int i = 0; i < ________; i++) {
          for (int j = 0; j < ________; j++) {
            // Fill in: subtract corresponding elements
            diff[i][j] = matrix1[i][j] ________ matrix2[i][j]; 
          }
        }
        System.out.println("\nDifference of matrices:");
        displayMatrix(__________); // Pass the difference matrix
      }

      // ===== HELPER METHOD TO DISPLAY MATRIX =====
      public static void displayMatrix(int[][] matrix) {
        for (int i = 0; i < matrix.__________; i++) {
          for (int j = 0; j < matrix[i].__________; j++) {
            System.out.printf("%__d", matrix[__][__]); // Use i, j for indices
          }
          System.out.println(); // move to next row
        }
      }
    }`,
      hints: [
        'Nested loops for 2D array operations',
        'Add corresponding elements: result[i][j] = m1[i][j] + m2[i][j]',
        'Use printf for formatted output',
        'Check matrix dimensions before operations'
      ],
      expectedOutput: `=== Matrix Calculator ===

Matrix 1:
  1  2  3
  4  5  6
  7  8  9

Matrix 2:
  9  8  7
  6  5  4
  3  2  1

Addition Result:
 10 10 10
 10 10 10
 10 10 10

Subtraction Result:
 -8 -6 -4
 -2  0  2
  4  6  8`,
      points: 100,
      solutionCode: `public class MatrixCalculator {
    public static void main(String[] args) {
      int[][] matrix1 = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
      };

      int[][] matrix2 = {
        {9, 8, 7},
        {6, 5, 4},
        {3, 2, 1}
      };

      System.out.println("Matrix 1:");
      displayMatrix(matrix1);

      System.out.println("\nMatrix 2:");
      displayMatrix(matrix2);

      // Addition
      int[][] sum = new int[3][3];
      for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
          sum[i][j] = matrix1[i][j] + matrix2[i][j];
        }
      }
      System.out.println("\nSum of matrices:");
      displayMatrix(sum);

      // Subtraction
      int[][] diff = new int[3][3];
      for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
          diff[i][j] = matrix1[i][j] - matrix2[i][j];
        }
      }
      System.out.println("\nDifference of matrices:");
      displayMatrix(diff);
    }

    // Helper method to display matrix
    public static void displayMatrix(int[][] matrix) {
      for (int i = 0; i < matrix.length; i++) {
        for (int j = 0; j < matrix[i].length; j++) {
          System.out.printf("%3d", matrix[i][j]);
        }
        System.out.println();
      }
    }
  }`
    }
  ],

  assessmentProject: {
    id: 'beginner-project-4',
    title: 'Comprehensive Student Grade Management System',
    description: 'Create a complete grade management system using arrays and strings, demonstrating data structure mastery.',
    objectives: [
      'Demonstrate array operations proficiency',
      'Apply string manipulation techniques',
      'Implement searching and sorting algorithms',
      'Create professional formatted output',
      'Handle data validation and error cases'
    ],
    requirements: [
      'Store data for at least 8 students (names and grades)',
      'Display all student records in formatted table',
      'Calculate and display class statistics (average, highest, lowest)',
      'Search for student by name (case-insensitive)',
      'Sort students by grade (descending order)',
      'Generate individual student reports',
      'Count letter grade distribution (A, B, C, D, F)',
      'Identify students needing support (grade < 70)',
      'Professional menu system with multiple options',
      'Input validation and error handling'
    ],
    starterCode: `/**
   * Grade Management System
   * Author: [Your Name]
   * Description: Simple program to manage student grades, calculate average, and display basic stats
   */
  import java.util.Scanner;

  public class GradeManagementSystem {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // ===== SET UP STUDENT DATA =====
      int numStudents = __; // Hint: fixed number of students
      String[] studentNames = new String[________]; // Hint: array for names
      double[] studentGrades = new double[________]; // Hint: array for grades

      // ===== INPUT STUDENT NAMES AND GRADES =====
      for (int i = 0; i < ________; i++) { // Loop through students
        System.out.print("Enter name for student " + (i + 1) + ": ");
        studentNames[__] = input.________(); // Hint: read full line

        System.out.print("Enter grade for " + studentNames[i] + ": ");
        studentGrades[__] = input.________(); // Hint: read double
        input.________(); // Hint: clear buffer
      }

      // ===== DISPLAY STUDENT GRADES =====
      System.out.println("\n=== Student Grades ===");
      System.out.printf("%-10s %10s %10s\n", "Name", "Grade", "Letter");
      for (int i = 0; i < ________; i++) {
        System.out.printf("%-10s %10.2f %10s\n",
          studentNames[__],
          studentGrades[__],
          getLetterGrade(studentGrades[__])
        );
      }

      // ===== CALCULATE CLASS STATISTICS =====
      double sum = 0;
      double highest = studentGrades[__];
      double lowest = studentGrades[__];
      String highName = studentNames[__];
      String lowName = studentNames[__];

      for (int i = 0; i < ________; i++) {
        sum = sum ______ studentGrades[__]; // Hint: add each grade

        if (studentGrades[i] > highest) {
          highest = studentGrades[i];
          highName = studentNames[__];
        }
        if (studentGrades[i] < lowest) {
          lowest = studentGrades[i];
          lowName = studentNames[__];
        }
      }

      double average = sum ______ numStudents; // Hint: calculate average

      System.out.println("\n=== Class Statistics ===");
      System.out.printf("Class Average: %.2f\n", ______); // Hint: use average
      System.out.printf("Highest Grade: %s (%.2f)\n", ______, ______); // highName, highest
      System.out.printf("Lowest Grade: %s (%.2f)\n", ______, ______); // lowName, lowest

      input.________(); // Hint: close scanner
    }

    // ===== METHOD TO CONVERT NUMERIC GRADE TO LETTER =====
    private static String getLetterGrade(double grade) {
      if (grade >= 90) return "A";
      else if (grade >= 80) return "B";
      else if (grade >= 70) return "C";
      else if (grade >= 60) return "D";
      else return "F";
    }
    }`,
    solutionCode: `import java.util.Scanner;

  /**
   * Grade Management System
   * Author: [Your Name]
   * Description: Simple program to manage student grades, calculate average, and display basic stats
   */
  public class GradeManagementSystem {
    public static void main(String[] args) {
      Scanner input = new Scanner(System.in);

      // Set up student data
      int numStudents = 5; // Beginner-friendly: fixed 5 students
      String[] studentNames = new String[numStudents];
      double[] studentGrades = new double[numStudents];

      // Input student names and grades
      for (int i = 0; i < numStudents; i++) {
        System.out.print("Enter name for student " + (i + 1) + ": ");
        studentNames[i] = input.nextLine();

        System.out.print("Enter grade for " + studentNames[i] + ": ");
        studentGrades[i] = input.nextDouble();
        input.nextLine(); // clear buffer
      }

      // Display all student grades
      System.out.println("\n=== Student Grades ===");
      System.out.printf("%-10s %10s %10s\n", "Name", "Grade", "Letter");
      for (int i = 0; i < numStudents; i++) {
        System.out.printf("%-10s %10.2f %10s\n", studentNames[i], studentGrades[i], getLetterGrade(studentGrades[i]));
      }

      // Calculate class statistics
      double sum = 0;
      double highest = studentGrades[0];
      double lowest = studentGrades[0];
      String highName = studentNames[0];
      String lowName = studentNames[0];

      for (int i = 0; i < numStudents; i++) {
        sum += studentGrades[i];

        if (studentGrades[i] > highest) {
          highest = studentGrades[i];
          highName = studentNames[i];
        }
        if (studentGrades[i] < lowest) {
          lowest = studentGrades[i];
          lowName = studentNames[i];
        }
      }

      double average = sum / numStudents;

      System.out.println("\n=== Class Statistics ===");
      System.out.printf("Class Average: %.2f\n", average);
      System.out.printf("Highest Grade: %s (%.2f)\n", highName, highest);
      System.out.printf("Lowest Grade: %s (%.2f)\n", lowName, lowest);

      input.close();
    }

    // Simple method to convert numeric grade to letter
    private static String getLetterGrade(double grade) {
      if (grade >= 90) return "A";
      else if (grade >= 80) return "B";
      else if (grade >= 70) return "C";
      else if (grade >= 60) return "D";
      else return "F";
    }
  }`,
    expectedFeatures: [
      'Complete data input and storage system',
      'Formatted table display of all students',
      'Comprehensive statistics (average, max, min, grade distribution)',
      'Case-insensitive search functionality',
      'Sorting implementation (bubble sort or similar)',
      'Individual student report generation',
      'Letter grade classification',
      'Identification of at-risk students',
      'Robust error handling',
      'Professional formatting throughout'
    ],
    estimatedTime: '120-180 minutes',
    difficulty: 'Hard',
    points: 200
  }
};
