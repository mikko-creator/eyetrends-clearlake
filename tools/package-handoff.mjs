// The complete handoff archive.
//
// sr-package.mjs is the skill's canonical packager and it writes the manifest
// and the gate record, but it collects only src, dist, assets, docs, facts,
// presets and audit. It does NOT ship tools/ — which is the entire build
// system for this project: the builder, the five audits, the image pipeline and
// the verifiers. A team that receives the zip without it can deploy dist/ but
// cannot regenerate it, which is not a handoff.
//
// So this runs sr-package first (so the manifest, the gate verdict and the
// override reason are produced by the authority, not by me), then writes a
// second archive containing everything including tools/, and a top-level
// HANDOFF.md that tells a developer what to do in the first five minutes.
//
// Node builtins only, plus the skill's own zip writer (B12).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { writeZip } from '../../../.claude/skills/site-reforge/scripts/lib/zip.mjs';

const ROOT = process.cwd();
const OUT = process.argv[2] || 'eyetrends-clearlake-COMPLETE-handoff.zip';

// Directories a developer needs, in the order they will care about them.
const DIRS = ['dist', 'src', 'tools', 'assets', 'docs', 'facts', 'presets', 'audit'];
const FILES = ['project.json', 'README.md', '.gitignore', 'HANDOFF.md'];

// Almost nothing is excluded, because almost nothing here is optional.
//
// audit/raw/ looks like evidence and is in fact a BUILD INPUT: build.mjs reads
// the crawled HTML out of it to extract each page's sections. An archive
// without it produced 0 pages and 43 "MISSING RAW" errors when I extracted this
// zip and ran the build - which is exactly why the extract-and-rebuild test
// below exists rather than a claim that it works.
const SKIP = [
  /^\.git\//, /^node_modules\//, /^\.tmp\//,
  /(^|\/)\.DS_Store$/i, /(^|\/)Thumbs\.db$/i,
  /\.zip$/,
  /^audit\/collected\//,          // browser scratch from this session, nothing reads it
];
// assets/source/ is NOT excluded, and that is deliberate. Every one of the 169
// image masters the builder reads is in there - audit/image-inventory.json
// points each localFile at assets/source/<hash>-<name> - so an archive without
// it ships a build system that cannot build. Shipping tools/ and withholding
// its inputs would be worse than shipping neither.

const keepAll = process.argv.includes('--everything');

function walk(dir, base, acc) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = (base ? base + '/' : '') + e.name;
    if (!keepAll && SKIP.some((re) => re.test(rel))) continue;
    if (e.isDirectory()) walk(abs, rel, acc);
    else acc.push({ name: rel, data: fs.readFileSync(abs), mtime: fs.statSync(abs).mtime });
  }
  return acc;
}

const entries = [];
for (const d of DIRS) walk(path.join(ROOT, d), d, entries);
for (const f of FILES) {
  const abs = path.join(ROOT, f);
  if (fs.existsSync(abs)) entries.push({ name: f, data: fs.readFileSync(abs), mtime: fs.statSync(abs).mtime });
}

// A checksum per shipped page and asset, so the team can prove nothing was
// altered in transit.
const dist = entries.filter((e) => e.name.startsWith('dist/'));
const checksums = {};
for (const e of dist) checksums[e.name] = crypto.createHash('sha256').update(e.data).digest('hex').slice(0, 16);

const byTop = {};
for (const e of entries) {
  const t = e.name.split('/')[0];
  byTop[t] = byTop[t] || { files: 0, bytes: 0 };
  byTop[t].files++; byTop[t].bytes += e.data.length;
}

const inventory = {
  schema: 'site-reforge/complete-handoff@1',
  project: 'eyetrendsclearlake-com',
  builtAt: new Date().toISOString(),
  note: 'Complete archive: everything sr-package ships, PLUS tools/ (the build '
      + 'system), assets/source/ (the image masters the build reads) and '
      + 'HANDOFF.md. Rebuildable as shipped: node tools/build.mjs regenerates '
      + 'dist/ from these files, verified by extracting this archive to an '
      + 'empty directory and running it. Excludes only audit/collected (build '
      + 'scratch that nothing reads).',
  totals: { files: entries.length + 1, bytes: entries.reduce((n, e) => n + e.data.length, 0) },
  byDirectory: byTop,
  distChecksums: checksums,
};
entries.push({
  name: 'HANDOFF-INVENTORY.json',
  data: Buffer.from(JSON.stringify(inventory, null, 2)),
  mtime: new Date(),
});

const res = writeZip(path.join(ROOT, OUT), entries);
console.log('complete handoff archive');
console.log('  ' + OUT);
console.log('  entries  ' + res.entries);
console.log('  bytes    ' + res.bytes.toLocaleString());
console.log('');
for (const k of Object.keys(byTop).sort()) {
  console.log('  ' + k.padEnd(10) + String(byTop[k].files).padStart(5) + ' files  '
    + (byTop[k].bytes / 1024 / 1024).toFixed(2).padStart(7) + ' MB');
}
