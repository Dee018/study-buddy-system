const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'javaLearnerCurriculumPart2.ts');
const targetId = 'learner-exercise-8-1';

const submitted = `// ===== Playable Interface =====
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
if (userNorm === canonNorm || userNo === canonNo || sim >= 0.9) console.log('MATCH — submission should be accepted by exercise validator'); else console.log('NO MATCH — will be graded by fallback checks');

process.exit(0);
