// Hover styles only where there is a hover (revision 28).
//
// The UXCam mobile UX guide the operator gave as the reference: "Hover states don't
// exist on mobile." On a touch screen a tap leaves :hover on whatever was tapped
// until the next tap somewhere else, so a card lifts, a link slides 4px or a button
// turns gradient and stays that way, a response from something that did nothing.
// Measured before: 316 :hover selectors across the five stylesheets, none limited to
// devices that hover.
//
// gateHover() rewrites a stylesheet so every selector that needs :hover sits inside
// @media (hover: hover). Selectors without :hover are left where they were. A rule
// whose selector list mixes the two is split in place: the plain selectors keep the
// rule, and the hover selectors get a copy of its block in the media query right
// after it. Order and specificity are unchanged, so wherever (hover: hover) matches
// (any mouse or trackpad), the cascade is the one the stylesheet had.
// A :hover that only appears inside :not() is a "not hovered" state, which a touch
// screen is always in: such a selector is left ungated.
// At-rules: conditional groups (@media, @supports, @layer, @container) are walked
// and their rules gated inside them (a nested @media); every other block
// (@keyframes, @font-face ...) is copied as it was. Comments and strings are copied.

const GROUP = /^@(media|supports|layer|container|document)\b/i;

function skipString(s, i) {            // s[i] is the quote; returns the index after the closing quote
  const q = s[i];
  for (i++; i < s.length; i++) {
    if (s[i] === '\\') { i++; continue; }
    if (s[i] === q) return i + 1;
  }
  return i;
}
function skipComment(s, i) {           // s[i..i+1] is "/*"
  const e = s.indexOf('*/', i + 2);
  return e < 0 ? s.length : e + 2;
}
// index of the brace that closes the block opening at s[open] ("{")
function matchBrace(s, open) {
  let d = 0;
  for (let i = open; i < s.length;) {
    const c = s[i];
    if (c === '"' || c === "'") { i = skipString(s, i); continue; }
    if (c === '/' && s[i + 1] === '*') { i = skipComment(s, i); continue; }
    if (c === '{') d++;
    else if (c === '}') { d--; if (d === 0) return i; }
    i++;
  }
  throw new Error('hover-gate: unbalanced braces');
}
// split a selector list at top-level commas
function splitSelectors(sel) {
  const out = []; let d = 0, start = 0;
  for (let i = 0; i < sel.length;) {
    const c = sel[i];
    if (c === '"' || c === "'") { i = skipString(sel, i); continue; }
    if (c === '(' || c === '[') d++;
    else if (c === ')' || c === ']') d--;
    else if (c === ',' && d === 0) { out.push(sel.slice(start, i)); start = i + 1; }
    i++;
  }
  out.push(sel.slice(start));
  return out.map((x) => x.trim()).filter(Boolean);
}
// does the selector need :hover (outside any :not(...))?
function needsHover(sel) {
  let s = sel.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');   // attribute values are not selectors
  for (;;) {                             // remove :not(...) groups, innermost content included
    const k = s.search(/:not\(/i);
    if (k < 0) break;
    let d = 0, j = k + 4;
    for (; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')') { d--; if (d === 0) break; } }
    s = s.slice(0, k) + s.slice(j + 1);
  }
  return /:hover\b/i.test(s);
}

export function gateHover(css, stats = { rules: 0, split: 0, selectors: 0 }) {
  let out = '';
  let i = 0;
  const n = css.length;
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') { const e = skipComment(css, i); out += css.slice(i, e); i = e; continue; }
    if (/\s/.test(c) || c === '}') { out += c; i++; continue; }
    // a statement: read its prelude up to "{" or ";"
    let j = i;
    for (; j < n;) {
      const d = css[j];
      if (d === '"' || d === "'") { j = skipString(css, j); continue; }
      if (d === '/' && css[j + 1] === '*') { j = skipComment(css, j); continue; }
      if (d === '{' || d === ';') break;
      j++;
    }
    if (j >= n) { out += css.slice(i); break; }
    if (css[j] === ';') { out += css.slice(i, j + 1); i = j + 1; continue; }   // @import, @charset ...
    const close = matchBrace(css, j);
    const prelude = css.slice(i, j);
    const p = prelude.trim();
    if (p.startsWith('@')) {
      if (GROUP.test(p)) out += prelude + '{' + gateHover(css.slice(j + 1, close), stats) + '}';
      else out += css.slice(i, close + 1);
    } else {
      const sels = splitSelectors(p);
      const hov = sels.filter(needsHover);
      const block = css.slice(j, close + 1);
      if (!hov.length) out += css.slice(i, close + 1);
      else {
        stats.rules++; stats.selectors += hov.length;
        const plain = sels.filter((s) => !needsHover(s));
        if (plain.length) { stats.split++; out += plain.join(',\n') + ' ' + block; }
        out += '@media (hover: hover){' + hov.join(',\n') + ' ' + block + '}';
      }
    }
    i = close + 1;
  }
  return out;
}
