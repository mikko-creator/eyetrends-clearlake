// sitemap.xml and robots.txt for the built site.
//
// Neither existed. The dist root held only index.html and search-index.json,
// and /sitemap.xml returned a live 404 after publishing — which is what caught
// it, since HANDOFF.md had claimed a sitemap shipped.
//
// Two things this gets right that a naive generator would not:
//
//  1. The <loc> entries use the PRODUCTION origin, not wherever the files
//     happen to be served from. The canonical tags already point there, and a
//     sitemap that disagreed with them would be worse than none.
//  2. Routes are read off dist/ itself, so the sitemap cannot drift from what
//     was actually built.
//
// The preview's robots.txt is NOT written here — tools/build-pages.mjs replaces
// it with a blanket Disallow, because a public copy of a client's site must not
// be indexed alongside the real one.
import fs from 'node:fs';
import path from 'node:path';
import { ORIGIN } from './lib.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

function routes(dir = DIST, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...routes(abs, base + '/' + e.name));
    else if (e.name === 'index.html') out.push(base === '' ? '/' : base + '/');
  }
  return out;
}

const all = routes().sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

// /search/ is a UI surface with no content of its own — it renders results from
// search-index.json at runtime, so there is nothing for a crawler to index.
const EXCLUDE = new Set(['/search/']);
const listed = all.filter((r) => !EXCLUDE.has(r));

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + listed.map((r) => '  <url><loc>' + ORIGIN + r + '</loc></url>').join('\n')
  + '\n</urlset>\n';
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml);

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  '# The search page renders results client-side and has no content of its own.',
  'Disallow: /search/',
  '',
  'Sitemap: ' + ORIGIN + '/sitemap.xml',
  '',
].join('\n');
fs.writeFileSync(path.join(DIST, 'robots.txt'), robots);

console.log('sitemap + robots written');
console.log('  origin          ' + ORIGIN);
console.log('  routes found    ' + all.length);
console.log('  listed          ' + listed.length + '  (excluded: ' + [...EXCLUDE].join(', ') + ')');
console.log('  sitemap.xml     ' + xml.length + ' bytes');
console.log('  robots.txt      ' + robots.length + ' bytes');
