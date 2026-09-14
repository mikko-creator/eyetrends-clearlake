// The source served /search from the platform. A static build cannot run that
// query server-side — but it can ship the index and run it in the browser, so
// the site keeps the feature and the URL shape (/search?s=term) is unchanged.
import fs from 'node:fs';
import path from 'node:path';
import { readJSON, writeFile, ORIGIN } from './lib.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const content = readJSON(path.join(ROOT, 'audit', 'content-inventory.json'));
const seo = readJSON(path.join(ROOT, 'audit', 'seo-inventory.json'));
const seoByUrl = new Map(seo.pages.map((p) => [p.url, p]));

const docs = content.pages.map((p) => {
  const s = seoByUrl.get(p.url) || {};
  const route = p.url.replace(ORIGIN, '') || '/';
  return {
    u: route,
    t: s.title || (p.h1 || [])[0] || route,
    d: s.metaDescription || '',
    h: (p.headings || []).filter((x) => x.level <= 3).map((x) => x.text).join(' · '),
    b: (p.bodyText || '').replace(/\s+/g, ' ').trim(),
  };
});

writeFile(path.join(DIST, 'search-index.json'), JSON.stringify({ generated: new Date().toISOString(), docs }));

const bytes = fs.statSync(path.join(DIST, 'search-index.json')).size;
console.log('search index written  ' + docs.length + ' docs, ' + bytes + ' bytes');
