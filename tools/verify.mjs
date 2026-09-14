// Static gate over dist/: every reference resolves, no orphans, no platform
// traces, content survived. Reads files — asserts nothing it did not measure.
import fs from 'node:fs';
import path from 'node:path';
import { readJSON, ORIGIN } from './lib.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const all = walk(DIST);
const htmlFiles = all.filter((f) => f.endsWith('.html'));
const rel = (f) => f.slice(DIST.length + 1).split(path.sep).join('/');

const findings = [];
const referenced = new Set();
let refsChecked = 0;

function resolveRef(url, fromFile) {
  if (!url) return null;
  const u = url.trim();
  if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(u)) return null;
  const clean = u.split('#')[0].split('?')[0];
  if (!clean) return null;
  let target;
  if (clean.startsWith('/')) target = path.join(DIST, clean);
  else target = path.resolve(path.dirname(fromFile), clean);
  return target;
}

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');

  // --- every local reference resolves to a file on disk -------------------
  // srcset is included: a <picture> source is a reference like any other, and
  // a checker blind to it reports both false orphans and missed dead links.
  const refs = [];
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/gi)) refs.push(m[1]);
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const cand of m[1].split(',')) refs.push(cand.trim().split(/\s+/)[0]);
  }
  for (const u of refs) {
    const t = resolveRef(u, f);
    if (!t) continue;
    refsChecked++;
    let target = t;
    if (!fs.existsSync(target) && fs.existsSync(target + '/index.html')) target = target + '/index.html';
    else if (!fs.existsSync(target) && !path.extname(target)) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) {
      findings.push({ sev: 'blocker', code: 'dead-reference', file: rel(f), detail: u });
    } else {
      referenced.add(path.resolve(target));
    }
  }

  // --- platform traces ----------------------------------------------------
  for (const [pat, code] of [
    [/sgb-component/g, 'platform:sgb'],
    [/\bcomp_[a-z0-9]{10,}/gi, 'platform:component-id'],
    [/sgen_[a-z_]+/gi, 'platform:upload-tree'],
    [/wp-content|elementor-widget|__NEXT_DATA__|sqs-block/gi, 'platform:other-cms'],
    [/<meta[^>]+name="generator"/gi, 'platform:generator-meta'],
    [/googletagmanager|gtag\(|G-[A-Z0-9]{8,}/g, 'tracker:analytics'],
  ]) {
    const hits = html.match(pat);
    if (hits) findings.push({ sev: 'blocker', code, file: rel(f), detail: hits.slice(0, 3).join(', '), count: hits.length });
  }

  // --- a live form must not post to an endpoint this build cannot serve ---
  for (const m of html.matchAll(/<form\b[^>]*>/gi)) {
    const act = /\saction="([^"]*)"/i.exec(m[0]);
    if (!act) continue;
    const a = act[1];
    if (a !== '#' && !a.startsWith('/search') && !a.startsWith('/appointment-request') && !/data-sr-unwired/.test(m[0])) {
      findings.push({ sev: 'blocker', code: 'live-form', file: rel(f), detail: a });
    }
  }

  // --- one H1, and it is not empty ---------------------------------------
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length !== 1) findings.push({ sev: 'major', code: 'h1-count', file: rel(f), detail: String(h1s.length) });

  // --- every img has alt --------------------------------------------------
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="/i.test(m[0])) findings.push({ sev: 'major', code: 'img-no-alt', file: rel(f), detail: (/src="([^"]*)"/.exec(m[0]) || [])[1] || '?' });
  }
}

// --- CSS url() references resolve too -------------------------------------
// The skill's own scar: a relative url() resolved against /styles/ instead of
// the asset store, and only the orphan count noticed.
const CSS_URL = /url\(\s*['"]?([^)'"]+?)['"]?\s*\)/gi;
for (const cssFile of all.filter((x) => x.endsWith('.css'))) {
  // Blank out data: URIs first — they embed their own url(#id) filter refs,
  // and matching inside one reports a fragment reference as a dead file.
  const css = fs.readFileSync(cssFile, 'utf8').replace(/url\(\s*['"]?data:[^)]*\)/gi, 'url(data:)');
  for (const m of css.matchAll(CSS_URL)) {
    if (/^(%23|#)/.test(m[1])) continue;   // SVG fragment reference, not a file
    const t = resolveRef(m[1], cssFile);
    if (!t) continue;
    refsChecked++;
    if (!fs.existsSync(t)) findings.push({ sev: 'blocker', code: 'dead-css-reference', file: rel(cssFile), detail: m[1] });
    else referenced.add(path.resolve(t));
  }
}

// --- references made from JS (fetch of the search index, etc.) -------------
// A file reached only by fetch() is still referenced; a checker that reads
// markup alone would call it an orphan and invite someone to delete it.
for (const jsFile of all.filter((x) => x.endsWith('.js'))) {
  const js = fs.readFileSync(jsFile, 'utf8');
  for (const m of js.matchAll(/['"](\/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]{2,5})['"]/g)) {
    const t = resolveRef(m[1], jsFile);
    if (!t) continue;
    refsChecked++;
    if (!fs.existsSync(t)) findings.push({ sev: 'major', code: 'dead-js-reference', file: rel(jsFile), detail: m[1] });
    else referenced.add(path.resolve(t));
  }
}

// --- orphans: a shipped asset nothing points at ---------------------------
const assetFiles = all.filter((f) => !f.endsWith('.html') && !f.endsWith('_generated-manifest.json'));
const orphans = assetFiles.filter((f) => !referenced.has(path.resolve(f)));

// --- content survival: source text vs rebuilt text ------------------------
const content = readJSON(path.join(ROOT, 'audit', 'content-inventory.json'));
function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&ndash;/g, '-').replace(/&mdash;/g, '-')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ').trim();
}
function words(s) { return new Set(textOf(s).toLowerCase().match(/[a-z0-9']{3,}/g) || []); }

const recall = [];
for (const p of content.pages) {
  const route = p.url.replace(ORIGIN, '') || '/';
  const file = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) { recall.push({ route, status: 'MISSING PAGE', pct: 0 }); continue; }
  const built = fs.readFileSync(file, 'utf8');
  const srcWords = words(p.bodyText || '');
  const outWords = words(built);
  if (!srcWords.size) { recall.push({ route, status: 'no source words', pct: 1 }); continue; }
  let hit = 0;
  const missing = [];
  for (const w of srcWords) { if (outWords.has(w)) hit++; else missing.push(w); }
  recall.push({ route, pct: hit / srcWords.size, srcWords: srcWords.size, missing: missing.slice(0, 12) });
}
const worst = recall.slice().sort((a, b) => a.pct - b.pct).slice(0, 6);
const floor = 0.95;
const belowFloor = recall.filter((r) => r.pct < floor);

// SOURCE-PLATFORM TRACES.
//
// The skill's sr-decontaminate scans for WordPress, Elementor, Divi, WPBakery
// and friends. This site did not run on any of them - it ran on SGEN/SGB - so
// that gate reported CLEAN over a build that still carried the platform's own
// form class. dist/styles/layout.css held 16 occurrences of `sgsc--myform` in
// four dead rule blocks that no shipped page used: strip-visuals.mjs keeps
// layout declarations, and those selectors are layout.
//
// A gate that does not know the platform it is looking for is not a gate, so
// the patterns for THIS source are checked here, where they belong.
const PLATFORM_TRACE = [
  { id: 'sgsc-class', re: /\.sgsc[-_a-z0-9]*/gi },
  { id: 'sgen-class', re: /\.sgen[-_a-z0-9]*/gi },
  { id: 'sgb-class', re: /\.sgb[-_a-z0-9]*/gi },
  { id: 'sg-widget-class', re: /\.sg-(?:drawer|navbar|modal|toast)\b/gi },
  { id: 'sgen-upload-path', re: /\/sites\/sgen_[a-z0-9_]+\//gi },
  { id: 'do-actions-endpoint', re: /\/do_actions\/do_form_submit/gi },
];
{
  let traceCount = 0;
  for (const f of all) {
    const rel2 = rel(f);
    let txt;
    try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    for (const p2 of PLATFORM_TRACE) {
      const hits = txt.match(p2.re);
      if (!hits) continue;
      // the appointment form records its ORIGINAL endpoint in data-sr-endpoint
      // on purpose, as provenance; that is a deliberate, inert string
      if (p2.id === 'do-actions-endpoint' && /data-sr-endpoint/.test(txt)) continue;
      traceCount += hits.length;
      findings.push({
        sev: 'major', code: 'platform-trace', file: rel2,
        detail: p2.id + ' x' + hits.length + '  e.g. ' + hits[0],
      });
    }
  }
  console.log('  platform traces  ' + traceCount + '  (SGEN/SGB patterns, outside audit/)');
}

const report = {
  schema: 'site-reforge/reforge-verify@1',
  generated: new Date().toISOString(),
  pages: htmlFiles.length,
  refsChecked,
  assets: assetFiles.length,
  orphans: orphans.map(rel),
  findings,
  contentRecall: {
    floor,
    mean: recall.reduce((a, r) => a + r.pct, 0) / recall.length,
    belowFloor: belowFloor.map((r) => ({ route: r.route, pct: +r.pct.toFixed(4), missing: r.missing })),
    worst: worst.map((r) => ({ route: r.route, pct: +r.pct.toFixed(4) })),
  },
};
fs.writeFileSync(path.join(ROOT, 'audit', 'reforge-verify.json'), JSON.stringify(report, null, 2));

const blockers = findings.filter((f) => f.sev === 'blocker');
const majors = findings.filter((f) => f.sev === 'major');
console.log('reforge verify');
console.log('  pages            ' + htmlFiles.length);
console.log('  refs checked     ' + refsChecked);
console.log('  assets shipped   ' + assetFiles.length + '  (orphans ' + orphans.length + ')');
console.log('  blockers         ' + blockers.length);
console.log('  majors           ' + majors.length);
console.log('  content recall   mean ' + (report.contentRecall.mean * 100).toFixed(2) + '%  below ' + (floor * 100) + '%: ' + belowFloor.length);
const byCode = {};
for (const f of findings) byCode[f.code] = (byCode[f.code] || 0) + 1;
for (const [c, n] of Object.entries(byCode).sort((a, b) => b[1] - a[1])) console.log('    ' + String(n).padStart(4) + '  ' + c);
for (const f of blockers.slice(0, 10)) console.log('  [BLOCKER] ' + f.file + '  ' + f.code + '  ' + f.detail);
for (const r of belowFloor.slice(0, 6)) console.log('  [RECALL]  ' + r.route + '  ' + (r.pct * 100).toFixed(1) + '%  missing e.g. ' + r.missing.slice(0, 8).join(', '));
if (orphans.length) console.log('  orphan assets: ' + orphans.slice(0, 8).map(rel).join(', '));
process.exit(blockers.length || belowFloor.length ? 1 : 0);
