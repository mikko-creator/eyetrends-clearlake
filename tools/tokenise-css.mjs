// Rewrite the reforge design layer so every colour resolves through the token
// layer sr-tokens emitted from the COMPUTED baseline, instead of sitting beside
// it as a literal. C13 exists because a build can declare a palette and then
// hardcode every colour next to it; this makes the palette load-bearing.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src', 'styles', 'reforge.css');
const seed = fs.existsSync(SRC) ? SRC : path.join(ROOT, 'dist', 'styles', 'reforge.css');
let css = fs.readFileSync(seed, 'utf8');

// Tokens emitted from the computed capture (src/styles/tokens.css).
const TOKEN = {
  '#ffffff': '--c-1', '#fff': '--c-1',
  '#0b7360': '--c-2',
  '#0e1c1e': '--c-3',
  '#dcefea': '--c-4',
  '#f7fafb': '--c-5',
  '#17262b': '--c-6',
  '#edf5f3': '--c-7',
  '#4e626a': '--c-8',
  '#edbe72': '--c-9',
};
// rgb triples of the same tokens, for the alpha forms.
const RGB_TO_TOKEN = {
  '255,255,255': '--c-1',
  '11,115,96': '--c-2',
  '14,28,30': '--c-3',
  '247,250,251': '--c-5',
  '23,38,43': '--c-6',
  '237,245,243': '--c-7',
  '224,164,76': null,   // brand gold: not in the computed top-9, stays a literal
  '20,165,140': null,   // accent-2
  '0,0,0': null,
};

let swapped = 0;

// 1. bare hex -> var(--c-N)
css = css.replace(/#[0-9a-fA-F]{3,8}\b/g, (m) => {
  const k = m.toLowerCase();
  const t = TOKEN[k];
  if (!t) return m;
  swapped++;
  return 'var(' + t + ')';
});

// 2. rgba(r,g,b,a) -> color-mix over the token, so alpha survives tokenisation
css = css.replace(/\brgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g, (m, r, g, b, a) => {
  const key = [r, g, b].join(',');
  const t = RGB_TO_TOKEN[key];
  if (!t) return m;
  const alpha = a === undefined ? 1 : parseFloat(a);
  swapped++;
  if (alpha >= 1) return 'var(' + t + ')';
  const pct = Math.round(alpha * 1000) / 10;
  return 'color-mix(in srgb, var(' + t + ') ' + pct + '%, transparent)';
});

// 3. font stacks -> the emitted type tokens
css = css.replace(/var\(--ds-font-body,\s*Inter, system-ui, sans-serif\)/g, 'var(--font-body)');
css = css.replace(/var\(--ds-font-display,\s*'Space Grotesk', system-ui, sans-serif\)/g, 'var(--font-display)');
css = css.replace(/var\(--ds-font-display,\s*'Space Grotesk', sans-serif\)/g, 'var(--font-display)');

fs.mkdirSync(path.dirname(SRC), { recursive: true });
fs.writeFileSync(SRC, css);

const check = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
const literals = (check.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/g) || []);
const tokensCss = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8');
const declared = [...new Set((tokensCss.match(/--[a-zA-Z][\w-]*\s*:/g) || []).map((d) => d.replace(/\s*:$/, '')))];
const referenced = declared.filter((d) => check.includes('var(' + d));

console.log('tokenised src/styles/reforge.css');
console.log('  values swapped to tokens   ' + swapped);
console.log('  tokens referenced          ' + referenced.length + ' / ' + declared.length);
console.log('  colour literals remaining  ' + literals.length);
if (literals.length) console.log('    ' + [...new Set(literals)].join('  '));
