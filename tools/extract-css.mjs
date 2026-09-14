// Lift the source's OWN design-system CSS out of the page head and drop the
// platform widgets' CSS. Element-at-a-time; nothing is matched across blocks.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const raw = fs.readFileSync(path.join(ROOT, 'audit', 'raw', 'index.html'), 'utf8');
const blocks = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);

const KEEP = [];
const DROPPED = [];

blocks.forEach((b, i) => {
  if (!b.trim()) { DROPPED.push({ i, bytes: b.length, why: 'empty' }); return; }
  if (/sgen-acc-btn|sg_ada-consent/.test(b) && b.length < 3000) { DROPPED.push({ i, bytes: b.length, why: 'platform accessibility/consent widget' }); return; }
  if (/#comp_[A-Za-z0-9]+\s*\{/.test(b)) { DROPPED.push({ i, bytes: b.length, why: 'platform per-component id rules' }); return; }
  KEEP.push({ i, bytes: b.length, css: b });
});

let css = KEEP.map((k) => '/* --- source block ' + k.i + ' (' + k.bytes + ' bytes) --- */\n' + k.css).join('\n\n');

// Rewrite any asset URL the design CSS points at, to the local store.
const imgInv = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit', 'image-inventory.json'), 'utf8'));
const byBase = new Map();
for (const im of imgInv.images) {
  const base = (im.src.split('/').pop() || '').replace(/\.(webp|jpe?g|png|gif|svg|ico|avif)$/i, '');
  if (base && !byBase.has(base)) byBase.set(base, im);
}
const GENERATED = new Set(['designer-frames','sunglasses','all-eyewear-flatlay','acetate-detail','polarized-detail',
  'kids-glasses','kids-frames-display','kids-flex-detail','contact-lenses-tile','fitting-bench','dry-eye-care',
  'retinal-check','sunglass-display','bg-dark','kids-eyewear']);

const urlsSeen = [];
css = css.replace(/url\((["']?)(https?:\/\/eyetrendsclearlake\.com|\/sites)\/([^)"']+)\1\)/gi, (m, q, host, rest) => {
  const file = rest.split('/').pop().split('?')[0];
  const base = file.replace(/\.(webp|jpe?g|png|gif|svg|ico|avif)$/i, '');
  urlsSeen.push(m);
  if (GENERATED.has(base)) return 'url(/assets/generated/' + base + '.webp)';
  const im = byBase.get(base);
  if (im && im.localFile) return 'url(/assets/img/' + base + path.extname(im.localFile) + ')';
  return 'url(/assets/img/' + file + ')';
});

// Strip rules that only exist to style the platform chrome we removed.
const PLATFORM_SEL = /(^|,)\s*[^,{}]*(sg_ada-consent|sgen-acc|sg-navbar|sgen-searchbar|mm-panel|mm-head|mm-card|mm-back|mm-close|mm-hamburger|sgbuilder-wrapper|sgb-component)[^,{}]*/g;
let strippedRules = 0;
css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
  if (!/sg_ada-consent|sgen-acc|sg-navbar|sgen-searchbar|\.mm-|sgbuilder-wrapper|sgb-component/.test(sel)) return m;
  const kept = sel.split(',').map((s) => s.trim()).filter((s) => s && !/sg_ada-consent|sgen-acc|sg-navbar|sgen-searchbar|\.mm-|sgbuilder-wrapper|sgb-component/.test(s));
  strippedRules++;
  return kept.length ? kept.join(',') + '{' + body + '}' : '';
});

fs.mkdirSync(path.join(ROOT, 'dist', 'styles'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'styles', 'base.css'), css);

console.log('base.css written  ' + css.length + ' bytes');
console.log('  blocks kept     ' + KEEP.map((k) => k.i + ':' + k.bytes).join(' '));
console.log('  blocks dropped  ' + (DROPPED.length ? DROPPED.map((d) => d.i + ':' + d.bytes + ' (' + d.why + ')').join('  ') : 'none'));
console.log('  asset urls      ' + urlsSeen.length + ' rewritten');
console.log('  platform rules  ' + strippedRules + ' selector-lists pruned');
