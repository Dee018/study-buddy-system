const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function extractIdsFromText(text) {
  // Require at least one trailing digit to avoid partial matches like 'beginner-module-'
  const regex = /['\"]((?:beginner|learner|advanced)-[a-z0-9-]*\d(?:-[0-9]+)*)['\"]/g;
  const s = new Set();
  let m;
  while ((m = regex.exec(text)) !== null) {
    s.add(m[1]);
  }
  return s;
}

// Collect from src/data
const dataDir = path.resolve(__dirname, '..', 'src', 'data');
const files = walk(dataDir).filter(f => f.endsWith('.ts') || f.endsWith('.md'));
const idsFromSrc = new Set();
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const id of extractIdsFromText(txt)) idsFromSrc.add(id);
}

// Collect from docs/curriculum-inserts.md
const docsPath = path.resolve(__dirname, '..', 'docs', 'curriculum-inserts.md');
let idsFromDocs = new Set();
if (fs.existsSync(docsPath)) {
  const txt = fs.readFileSync(docsPath, 'utf8');
  idsFromDocs = extractIdsFromText(txt);
} else {
  console.error('docs/curriculum-inserts.md not found');
  process.exit(2);
}

function setDiff(a, b) {
  const res = [];
  for (const x of a) if (!b.has(x)) res.push(x);
  return res.sort();
}

const inSrcNotDocs = setDiff(idsFromSrc, idsFromDocs);
const inDocsNotSrc = setDiff(idsFromDocs, idsFromSrc);

const report = [];
report.push('Verification report - ' + new Date().toISOString());
report.push('Total unique IDs in src/data: ' + idsFromSrc.size);
report.push('Total unique IDs in docs: ' + idsFromDocs.size);
report.push('IDs in src/data but NOT in docs (' + inSrcNotDocs.length + '):');
report.push(...inSrcNotDocs);
report.push('');
report.push('IDs in docs but NOT in src/data (' + inDocsNotSrc.length + '):');
report.push(...inDocsNotSrc);

fs.writeFileSync(path.resolve(__dirname, 'verification-report.txt'), report.join('\n'));
console.log(report.slice(0, 30).join('\n'));
console.log('\nFull report written to scripts/verification-report.txt');
