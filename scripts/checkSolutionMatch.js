const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'javaLearnerCurriculumPart2.ts');
const targetId = 'learner-exercise-7-1';

const submitted = `// ===== Payable Interface =====
interface Payable {
    void processPayment(double amount);
    String getPaymentDetails();
}

// ===== Credit Card Payment =====
class CreditCardPayment implements Payable {
    public void processPayment(double amount) {
        System.out.printf("Processing credit card payment: $%.2f\\n", amount);
    }
    public String getPaymentDetails() {
        return "Credit Card";
    }
}

// ===== PayPal Payment =====
class PayPalPayment implements Payable {
    public void processPayment(double amount) {
        System.out.printf("Processing PayPal payment: $%.2f\\n", amount);
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
}
`;

function readFile(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch (e) { console.error('Failed to read file', e); process.exit(1); }
}

function extractSolution(src, id) {
  // find the block for the exercise id
  const idIdx = src.indexOf("id: '" + id + "'");
  if (idIdx === -1) return null;
  const after = src.slice(idIdx, idIdx + 4000);
  const solMatch = after.match(/solutionCode:\s*`([\s\S]*?)`/);
  if (solMatch) return solMatch[1];
  // fallback: search forward (in case object is larger)
  const rest = src.slice(idIdx);
  const solMatch2 = rest.match(/solutionCode:\s*`([\s\S]*?)`/);
  return solMatch2 ? solMatch2[1] : null;
}

function removeComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}
function normalizeCode(s) {
  return removeComments(s).replace(/\r\n/g, '\n').replace(/\s+$/gm, '').trim();
}
function stripWhitespace(s) {
  return removeComments(s).replace(/\s+/g, '');
}

function levenshtein(a, b) {
  const al = a.length, bl = b.length;
  if (al === 0) return bl; if (bl === 0) return al;
  const v0 = []; for (let i = 0; i <= bl; i++) v0[i] = i;
  let v1 = new Array(bl + 1);
  for (let i = 0; i < al; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < bl; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let k = 0; k <= bl; k++) v0[k] = v1[k];
  }
  return v1[bl];
}

const src = readFile(filePath);
const canonical = extractSolution(src, targetId);
if (!canonical) {
  console.log('No solutionCode found for', targetId);
  process.exit(2);
}

const userNorm = normalizeCode(submitted);
const canonNorm = normalizeCode(canonical);
const userNoSpace = stripWhitespace(userNorm).toLowerCase();
const canonNoSpace = stripWhitespace(canonNorm).toLowerCase();

console.log('--- Comparison Results for', targetId, '---');
console.log('Canonical length:', canonical.length, 'Submitted length:', submitted.length);
console.log('Normalized exact equality:', userNorm === canonNorm);
console.log('Whitespace-stripped equality:', userNoSpace === canonNoSpace);

const maxLen = Math.max(userNoSpace.length, canonNoSpace.length) || 1;
const dist = levenshtein(userNoSpace, canonNoSpace);
const similarity = 1 - dist / maxLen;
console.log('Levenshtein distance:', dist);
console.log('Similarity (0-1):', similarity.toFixed(4));

if (userNorm === canonNorm || userNoSpace === canonNoSpace || similarity >= 0.9) {
  console.log('MATCH: submission should be accepted by validator (per current rules)');
} else {
  console.log('NO MATCH: submission would be rejected by validator');
}

// print first 400 chars of canonical and submitted normalized strings for inspection
console.log('\n--- Canonical normalized (first 400 chars) ---');
console.log(canonNorm.slice(0, 400));
console.log('\n--- Submitted normalized (first 400 chars) ---');
console.log(userNorm.slice(0, 400));

process.exit(0);
