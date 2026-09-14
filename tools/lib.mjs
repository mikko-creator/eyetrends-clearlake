// Shared helpers for the Eye Trends reforge build. Node builtins only (B12).
import fs from 'node:fs';
import path from 'node:path';

export const ORIGIN = 'https://eyetrendsclearlake.com';

/** Slice a balanced element subtree starting at `start` (which must be at a `<tag`). */
export function sliceBalanced(s, start, tag) {
  // NB: built from a string, so every backslash would need doubling — use
  // explicit character alternatives instead and keep the pattern escape-free.
  const tok = new RegExp('<' + tag + '(?=[ \t\r\n>/])|</' + tag + '[ \t\r\n]*>', 'gi');
  tok.lastIndex = start;
  let depth = 0, t;
  while ((t = tok.exec(s))) {
    if (t[0][1] === '/') { depth--; if (depth === 0) return s.slice(start, t.index + t[0].length); }
    else depth++;
    if (depth > 200) break;
  }
  return null;
}

/** Every TOP-LEVEL .rw-sec block inside <main>, in document order. */
export function extractSections(html) {
  const i = html.indexOf('<main');
  const j = html.indexOf('</main>');
  if (i < 0 || j < 0) return [];
  const main = html.slice(i, j);
  const out = [];
  const re = /<div class="(rw-sec[^"]*)"/g;
  let m;
  while ((m = re.exec(main))) {
    const block = sliceBalanced(main, m.index, 'div');
    if (!block) continue;
    out.push({ cls: m[1], html: block });
    re.lastIndex = m.index + block.length; // never descend into a nested rw-sec
  }
  return out;
}

export function region(html, tag, id) {
  const re = new RegExp('<' + tag + '[^>]*id="' + id + '"', 'i');
  const m = re.exec(html);
  if (!m) return null;
  return sliceBalanced(html, m.index, tag);
}

/** live URL -> site-root path ( '/' stays '/' ) */
export function toRootPath(href) {
  if (!href) return href;
  let h = href.trim();
  if (h.startsWith(ORIGIN)) h = h.slice(ORIGIN.length) || '/';
  return h;
}

/** site-root path -> the file this build writes for it */
export function routeToFile(p) {
  let r = p.replace(/^https?:\/\/[^/]+/, '');
  r = r.split('#')[0].split('?')[0];
  r = r.replace(/\/+$/, '');
  if (r === '' || r === '/') return 'index.html';
  return r.replace(/^\//, '') + '/index.html';
}

export function attrOf(tagHtml, name) {
  const m = new RegExp(name + '="([^"]*)"', 'i').exec(tagHtml);
  return m ? m[1] : '';
}

export function readJSON(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
export function writeFile(p, s) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); }
export function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
