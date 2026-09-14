// Make the Aurora Glass palette derive from the client's MEASURED tokens.
//
// The first cut of the design hardcoded 157 colour literals beside a 128-token
// layer it barely referenced. That is the exact failure C13 exists to catch:
// a palette that is declared and then worked around. Here every alpha value is
// re-expressed as color-mix() over a token, so there is one source of colour
// and changing --c-2 actually restyles the site.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const FILES = ['system.css', 'components.css', 'chrome.css'].map((f) => path.join(ROOT, 'src', 'styles', f));

// rgb triple -> the token that IS that colour (from src/styles/tokens.css,
// which sr-tokens derived from the computed browser capture).
const TRIPLE = {
  '255,255,255': '--c-1',   // surface white
  '11,115,96':   '--c-2',   // brand teal
  '14,28,30':    '--c-3',   // deep ink
  '7,23,26':     '--c-3',   // near-black ink (same role)
  '15,34,38':    '--c-3',
  '12,40,44':    '--c-3',
  '10,32,36':    '--c-3',
  '0,0,0':       '--c-3',
  '220,239,234': '--c-4',
  '247,250,251': '--c-5',
  '23,38,43':    '--c-6',
  '234,246,242': '--c-7',
  '78,98,106':   '--c-8',
  '237,190,114': '--c-9',
  '246,206,134': '--c-9',   // gold light
  // design additions that have no measured equivalent keep their own token
  '22,179,147':  '--g-teal-lit',
  '224,164,76':  '--g-gold',
  '251,247,240': '--g-cream',
};

let totalSwapped = 0;
for (const file of FILES) {
  let css = fs.readFileSync(file, 'utf8');
  let swapped = 0;

  css = css.replace(/\brgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g, (m, r, g, b, a) => {
    const key = [r, g, b].join(',');
    const tok = TRIPLE[key];
    if (!tok) return m;
    const alpha = a === undefined ? 1 : parseFloat(a);
    swapped++;
    if (alpha >= 1) return 'var(' + tok + ')';
    const pct = Math.round(alpha * 1000) / 10;
    return 'color-mix(in srgb, var(' + tok + ') ' + pct + '%, transparent)';
  });

  fs.writeFileSync(file, css);
  totalSwapped += swapped;
  console.log('  ' + path.basename(file).padEnd(18) + swapped + ' colour values -> tokens');
}

// Report against C13's own arithmetic.
const body = FILES.map((f) => fs.readFileSync(f, 'utf8')).join('\n')
  + '\n' + fs.readFileSync(path.join(ROOT, 'src', 'styles', 'motion.css'), 'utf8')
  + '\n' + fs.readFileSync(path.join(ROOT, 'src', 'styles', 'layout.css'), 'utf8');
const clean = body.replace(/\/\*[\s\S]*?\*\//g, ' ');
const tokensCss = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8');
const declared = [...new Set((tokensCss.match(/--[a-zA-Z][\w-]*\s*:/g) || []).map((d) => d.replace(/\s*:$/, '')))];
const referenced = declared.filter((d) => clean.includes('var(' + d));
const literals = (clean.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/g) || []);

console.log('\ntotal swapped     ' + totalSwapped);
console.log('tokens referenced ' + referenced.length + ' / ' + declared.length);
console.log('colour literals   ' + literals.length);
console.log('C13 verdict       ' + (referenced.length > literals.length ? 'PASSES' : 'STILL FAILS'));
if (literals.length) {
  const counts = {};
  literals.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
  console.log('remaining         ' + Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => k + '×' + v).join('  '));
}
