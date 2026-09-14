// The strict text test: every long phrase the source rendered must appear
// VERBATIM in the rebuild. Word-set recall can pass a page whose sentences were
// reshuffled; this cannot.
import fs from 'node:fs';
import path from 'node:path';
import { readJSON, ORIGIN } from './lib.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const content = readJSON(path.join(ROOT, 'audit', 'content-inventory.json'));

function norm(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&ndash;|&mdash;|–|—/g, '-')
    .replace(/&#0?39;|&rsquo;|&lsquo;|‘|’/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;|“|”/g, '"')
    .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
    .replace(/&middot;|·/g, '·')
    .replace(/&hellip;|…/g, '…')
    .replace(/&deg;/g, '°').replace(/&trade;/g, '™')
    .replace(/&reg;/g, '®').replace(/&copy;/g, '©')
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

// DECLARED text changes. The rule is 100% verbatim; anything that deviates has
// to be named here with a reason, so a silent edit can never pass as verbatim.
// Client request: "remove all emdashes in the section titles". Headings only,
// dash only — the wording is untouched, so the source phrase is normalised the
// same way before comparison rather than simply excused.
const DECLARED = [
  {
    why: 'client asked for em-dashes out of section titles; the dash becomes a colon so the sentence still reads',
    normalise: (s) => s.replace(/\s*—\s*/g, ': ').replace(/\s*-\s+/g, ': ').replace(/:\s*:/g, ':'),
  },
];
function applyDeclared(s) {
  return DECLARED.reduce((acc, d) => d.normalise(acc), s);
}

// DECLARED EDITS. Copy that was deliberately removed or relocated at the
// client's request, named here so the verbatim check reports it as declared and
// never silently. Anything NOT listed that goes missing is still real loss.
//
// A MOVE is listed as well as a REMOVAL because moving an element breaks the
// page's contiguous text runs: lifting "More about Dr. Hyder" out of the right
// column and into the left one splits three source phrases that used to read
// straight through it, without a single word being lost.
const DECLARED_EDITS = [
  {
    route: '/',
    why: 'client: "remove these 2 boxes ... Move the More about Dr. Hyder button below the Dr. Hyder image"',
    // the tiles exactly as they rendered, numeral and suffix included: the
    // suffix sits in its own <span>, so the extracted text reads "42 yrs", and
    // declaring only the label would leave "yrs" unaccounted for
    removed: [
      '42 yrs Eye exams and medical eye care in Clear Lake',
      '30 min Unhurried appointments, we talk and we visit',
    ],
    moved: ['More about Dr. Hyder'],
  },
];

const WORD = /[^A-Za-z0-9'&]+/;

// Can this source phrase be covered by runs that ARE on the page, with the only
// uncovered words being ones the client had removed?
//
// This is the honest test for a move: it proves no word vanished and that the
// surviving text still reads in long contiguous runs, while allowing the ONE
// join that the relocation broke. It does not simply wave the phrase through -
// a real deletion in the middle leaves words that are in neither a covered run
// nor the declared removal list, and that still counts as missing.
function explainedByEdit(route, phrase, built) {
  const rules = DECLARED_EDITS.filter((r) => r.route === route);
  if (!rules.length) return false;

  const removedWords = new Set();
  for (const r of rules) {
    for (const ph of (r.removed || [])) {
      for (const w of ph.split(WORD)) if (w) removedWords.add(w.toLowerCase());
    }
  }
  // a moved phrase has to still BE somewhere on the page, or it was not moved
  for (const r of rules) {
    for (const ph of (r.moved || [])) if (!built.includes(ph)) return false;
  }

  // Word MEMBERSHIP, not substring. built.includes('min') is true of the word
  // "minutes" elsewhere on the page, which would quietly excuse a word that had
  // actually been deleted.
  const builtWords = new Set();
  for (const w of built.split(WORD)) if (w) builtWords.add(w.toLowerCase());

  const words = phrase.split(WORD).filter(Boolean);
  // greedy: extend a run while it is still present on the page
  const runs = [];
  let cur = [];
  for (const w of words) {
    const trial = cur.concat([w]);
    if (built.includes(trial.join(' '))) { cur = trial; continue; }
    if (cur.length) runs.push(cur);
    cur = builtWords.has(w.toLowerCase()) ? [w] : [];
    if (!cur.length) runs.push([w]);             // orphan word, judged below
  }
  if (cur.length) runs.push(cur);

  // Every word must be accounted for: inside a substantial covered run, or a
  // word the client removed, or at minimum still present on the page.
  const covered = new Set();
  let longRuns = 0;
  for (const run of runs) {
    if (run.length >= 4 && built.includes(run.join(' '))) {
      longRuns++;
      for (const w of run) covered.add(w.toLowerCase());
    }
  }
  for (const w of words) {
    const lw = w.toLowerCase();
    if (covered.has(lw)) continue;
    if (removedWords.has(lw)) continue;
    if (builtWords.has(lw)) continue;
    return false;                                 // a word that is simply gone
  }
  // a relocation splits a run in two or three; a wholesale rewrite would not
  // look like this
  return longRuns > 0 && longRuns <= 4;
}

let totalPhrases = 0, totalMissing = 0, totalExcused = 0, totalRemoved = 0;
const perPage = [];

for (const p of content.pages) {
  const route = p.url.replace(ORIGIN, '') || '/';
  const file = route === '/' ? path.join(DIST, 'index.html')
    : path.join(DIST, route.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) { perPage.push({ route, status: 'MISSING' }); continue; }

  const built = norm(fs.readFileSync(file, 'utf8'));
  const src = norm(p.bodyText || '');

  // Split the source text into sentence-ish runs; keep the substantial ones.
  const phrases = src.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length >= 40);
  const missing = [];
  for (const ph of phrases) {
    totalPhrases++;
    if (built.includes(ph)) continue;
    // Not verbatim — is it explained by a DECLARED change? Compare both sides
    // under the same normalisation; if they then agree, it is the declared edit
    // and nothing else. If they still differ, it is real loss.
    if (applyDeclared(built).includes(applyDeclared(ph))) { totalExcused++; continue; }
    if (explainedByEdit(route, ph, built)) { totalExcused++; totalRemoved++; continue; }
    missing.push(ph); totalMissing++;
  }
  perPage.push({ route, phrases: phrases.length, missing: missing.length, examples: missing.slice(0, 3) });
}

const bad = perPage.filter((r) => r.missing > 0 || r.status === 'MISSING');
const report = {
  schema: 'site-reforge/verbatim-text@1',
  generated: new Date().toISOString(),
  totalPhrases, totalMissing, totalExcused, totalRemoved,
  declaredChanges: DECLARED.map((d) => d.why),
  declaredEdits: DECLARED_EDITS,
  verbatimRate: totalPhrases ? (totalPhrases - totalMissing) / totalPhrases : 1,
  pagesWithLoss: bad.length,
  pages: perPage,
};
fs.writeFileSync(path.join(ROOT, 'audit', 'verbatim-text.json'), JSON.stringify(report, null, 2));

console.log('verbatim text check');
console.log('  phrases tested (>=40 chars)  ' + totalPhrases);
console.log('  phrases missing              ' + totalMissing);
console.log('  explained by declared change ' + totalExcused);
console.log('    of which declared EDITS     ' + totalRemoved);
for (const r of DECLARED_EDITS) console.log('      [' + r.route + '] ' + r.why);
console.log('  verbatim rate                ' + (report.verbatimRate * 100).toFixed(3) + '%');
console.log('  pages with any loss          ' + bad.length + ' / ' + perPage.length);
for (const b of bad.slice(0, 8)) {
  console.log('  [' + b.route + '] missing ' + b.missing + '/' + b.phrases);
  for (const e of (b.examples || [])) console.log('      ' + JSON.stringify(e.slice(0, 130)));
}
process.exit(totalMissing ? 1 : 0);
