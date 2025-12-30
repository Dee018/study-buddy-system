const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'javaLearnerCurriculumPart2.ts');
const targetId = 'learner-project-8';

const submitted = `import java.io.*;
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
            System.out.println("\\n=== Student Menu ===");
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
`;

function readFile(p) { try { return fs.readFileSync(p, 'utf8'); } catch (e) { console.error(e); process.exit(1); } }
function extractSolution(src, id) {
  const idx = src.indexOf("id: '" + id + "'");
  if (idx === -1) return null;
  const rest = src.slice(idx);
  const m = rest.match(/solutionCode:\s*`([\s\S]*?)`/);
  return m ? m[1] : null;
}
function removeComments(s) { return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); }
function normalizeCode(s) { return removeComments(s).replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim(); }
function stripWhitespace(s) { return removeComments(s).replace(/\s+/g, ''); }
function levenshtein(a, b) { const al = a.length, bl = b.length; if (al === 0) return bl; if (bl === 0) return al; const v0 = []; for (let i = 0; i <= bl; i++) v0[i] = i; let v1 = new Array(bl + 1); for (let i = 0; i < al; i++) { v1[0] = i + 1; for (let j = 0; j < bl; j++) { const cost = a[i] === b[j] ? 0 : 1; v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost); } for (let k = 0; k <= bl; k++) v0[k] = v1[k]; } return v1[bl]; }

const src = readFile(filePath);
const canonical = extractSolution(src, targetId);
if (!canonical) { console.log('No canonical solution found for', targetId); process.exit(2); }

const userNorm = normalizeCode(submitted);
const canonNorm = normalizeCode(canonical);
const userNo = stripWhitespace(userNorm).toLowerCase();
const canonNo = stripWhitespace(canonNorm).toLowerCase();

console.log('Normalized exact equality:', userNorm === canonNorm);
console.log('Whitespace-stripped equality:', userNo === canonNo);
const maxLen = Math.max(userNo.length, canonNo.length) || 1;
const dist = levenshtein(userNo, canonNo);
const sim = 1 - dist / maxLen;
console.log('Levenshtein distance:', dist, 'Similarity:', sim.toFixed(4));
if (userNorm === canonNorm || userNo === canonNo || sim >= 1.0) console.log('MATCH — submission should be accepted by project validator'); else console.log('NO MATCH — will be rejected by strict validator');

process.exit(0);
