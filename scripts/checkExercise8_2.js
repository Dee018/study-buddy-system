const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'javaLearnerCurriculumPart2.ts');
const targetId = 'learner-exercise-8-2';

const submitted = `import java.io.*;
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
if (userNorm === canonNorm || userNo === canonNo || sim >= 0.98) console.log('MATCH — submission should be accepted by exercise validator'); else console.log('NO MATCH — will be graded by fallback checks');

process.exit(0);
