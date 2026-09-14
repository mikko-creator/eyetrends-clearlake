// Eye Trends — REFORGE build.
// Preserves the source's text and architecture exactly; replaces the platform
// runtime, the imagery and the design layer. Node builtins only (B12).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { extractSections, sliceBalanced, routeToFile, readJSON, writeFile, ORIGIN } from './lib.mjs';
import * as NAV from './nav.mjs';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const RAW = path.join(ROOT, 'audit', 'raw');

const seo = readJSON(path.join(ROOT, 'audit', 'seo-inventory.json'));
const content = readJSON(path.join(ROOT, 'audit', 'content-inventory.json'));
const imgInv = readJSON(path.join(ROOT, 'audit', 'image-inventory.json'));

const seoByUrl = new Map(seo.pages.map((p) => [p.url, p]));
const contentByUrl = new Map(content.pages.map((p) => [p.url, p]));

// ---------------------------------------------------------------- image map
// Generated (fal) slots — object studies only. See tools/falgen.mjs for policy.
const GENERATED = new Set(['designer-frames', 'sunglasses', 'all-eyewear-flatlay', 'acetate-detail',
  'polarized-detail', 'kids-glasses', 'kids-frames-display', 'kids-flex-detail', 'contact-lenses-tile',
  'fitting-bench', 'dry-eye-care', 'retinal-check', 'sunglass-display', 'bg-dark', 'kids-eyewear']);

// Intrinsic size of each generated file, read from the bytes we wrote.
function webpSize(file) {
  try {
    const b = fs.readFileSync(file);
    // VP8L / VP8X / VP8  — handle the three WebP chunk kinds
    const fourcc = b.slice(12, 16).toString('ascii');
    if (fourcc === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (fourcc === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (fourcc === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  } catch (e) { /* fall through */ }
  return null;
}

const keptCopies = new Map(); // basename -> dist path
// Stylesheet URLs carry a short content hash. Without one, a rebuild that
// changes only CSS is invisible to any browser that already has the file: the
// URL is unchanged, so the cached copy is reused. That is not hypothetical -
// a revision-5 audit measured 89 contrast failures against a stylesheet that
// had already been fixed on disk, because the page was still running the old
// one. The hash also makes the shipped files safely far-future cacheable.
// Hashes the SOURCE stylesheet, not the copy in dist: pages are rendered before
// the styles are copied, so reading from dist would hash the previous build's
// file (or throw on a clean tree). The copy is byte-identical, so the hash is
// still the hash of what ships.
function cssHref(name) {
  const f = path.join(ROOT, 'src', 'styles', name);
  if (!fs.existsSync(f)) throw new Error('stylesheet missing: src/styles/' + name);
  const h = crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex').slice(0, 10);
  return '/styles/' + name + '?v=' + h;
}

const imageMap = new Map();   // source basename -> { href, w, h, generated }
const imageFailures = [];

// Generated masters live OUTSIDE dist/ (assets/generated/) and are copied in.
// dist/ is fully derived: the prune at the end of this build deletes whatever
// nothing references, and must never be able to destroy a build input.
const GEN_SRC = path.join(ROOT, 'assets', 'generated');
const GEN_DIST = path.join(DIST, 'assets', 'generated');
fs.mkdirSync(GEN_DIST, { recursive: true });
if (fs.existsSync(GEN_SRC)) {
  for (const f of fs.readdirSync(GEN_SRC)) {
    if (!f.endsWith('.webp')) continue;
    fs.copyFileSync(path.join(GEN_SRC, f), path.join(GEN_DIST, f));
  }
}
// Generated slots were produced at one size only, so they had no srcset to
// offer and a phone pulled a 1200px file to paint a 335px tile. These are
// straight downscales of those same files - no new generation - and give the
// generated imagery the same responsive treatment as the photography.
const GEN_RT = path.join(ROOT, 'assets', 'generated-rt');
const genRenditions = new Map();
if (fs.existsSync(GEN_RT)) {
  for (const f of fs.readdirSync(GEN_RT)) {
    const m = /^(.+)-(\d+)\.webp$/.exec(f);
    if (!m) continue;
    fs.copyFileSync(path.join(GEN_RT, f), path.join(GEN_DIST, f));
    const list = genRenditions.get(m[1]) || [];
    list.push({ w: Number(m[2]), href: '/assets/generated/' + f });
    genRenditions.set(m[1], list);
  }
  for (const list of genRenditions.values()) list.sort((a, b) => a.w - b.w);
} else {
  imageFailures.push({ base: '(all)', reason: 'assets/generated master directory missing — run tools/falgen.mjs' });
}

// ---------------------------------------------------------- responsive images
// The crawl downloaded every size variant the source site published - 39 of the
// 42 images have between three and five - and the first build shipped only the
// largest to everybody. A phone was downloading a 1600px photograph to paint it
// 337px wide.
//
// Two inputs make an honest srcset. The VARIANTS come from the image inventory.
// The `sizes` attribute comes from audit/image-widths.json, which is the
// measured rendered width of each image at 390/768/1024/1440, taken from the
// built pages across all 44 routes - not a guess at the layout. Where an image
// was never measured it gets no srcset at all, because a wrong `sizes` makes
// the browser pick a worse file than no srcset would.
const variantsByBase = new Map();
for (const im of imgInv.images) {
  const base = (im.src.split('/').pop() || '').replace(/\.(webp|jpe?g|png|gif|svg|ico|avif)$/i, '');
  if (!base || !im.localFile) continue;
  const w = im.intrinsicWidth || 0;
  if (!w) continue;
  const abs = path.join(ROOT, im.localFile);
  if (!fs.existsSync(abs)) continue;
  const list = variantsByBase.get(base) || [];
  if (list.some((v) => v.w === w)) continue;          // same width twice
  list.push({ w, h: im.intrinsicHeight || 0, src: abs, ext: path.extname(im.localFile) || '.webp' });
  variantsByBase.set(base, list);
}
for (const list of variantsByBase.values()) list.sort((a, b) => a.w - b.w);

const measuredWidths = (() => {
  const f = path.join(ROOT, 'audit', 'image-widths.json');
  if (!fs.existsSync(f)) {
    imageFailures.push({ base: '(all)', reason: 'audit/image-widths.json missing — no srcset will be emitted' });
    return {};
  }
  return JSON.parse(fs.readFileSync(f, 'utf8'));
})();

// Breakpoint -> media query ceiling. The widths are what was measured AT that
// viewport, so each bucket must cover up to the next one.
const SIZE_STOPS = [[390, 480], [768, 820], [1024, 1200]];
function sizesAttr(base) {
  const m = measuredWidths[base];
  if (!m) return null;
  const parts = [];
  for (const [vp, ceiling] of SIZE_STOPS) {
    const w = m[vp] || m[String(vp)];
    if (!w) return null;
    parts.push('(max-width: ' + ceiling + 'px) ' + Math.ceil(w) + 'px');
  }
  const wide = m[1440] || m['1440'];
  if (!wide) return null;
  parts.push(Math.ceil(wide) + 'px');
  return parts.join(', ');
}

// Pass 1 — the ORIGINAL photograph for every slot, largest variant we have.
// Generated slots keep theirs too: an alt that makes a documentary claim about
// this practice must be served by a real photo (see DOCUMENTARY below).
for (const im of imgInv.images) {
  const base = (im.src.split('/').pop() || '').replace(/\.(webp|jpe?g|png|gif|svg|ico|avif)$/i, '');
  if (!base) continue;
  const prev = imageMap.get(base);
  const w = im.intrinsicWidth || 0;
  if (prev && prev.w >= w) continue;
  if (!im.localFile) { imageFailures.push({ base, reason: 'no local file (download failed)' }); continue; }
  const src = path.join(ROOT, im.localFile);
  if (!fs.existsSync(src)) { imageFailures.push({ base, reason: 'local file missing: ' + im.localFile }); continue; }
  const ext = path.extname(im.localFile) || '.webp';
  keptCopies.set(base, { src, dest: path.join(DIST, 'assets', 'img', base + ext) });
  imageMap.set(base, { href: '/assets/img/' + base + ext, w: im.intrinsicWidth, h: im.intrinsicHeight, generated: false });
}

// Pass 2 — overlay the generated file where one exists, keeping the original
// reachable as .originalHref for any usage that must not be generated.
for (const base of GENERATED) {
  const f = path.join(DIST, 'assets', 'generated', base + '.webp');
  if (!fs.existsSync(f)) { imageFailures.push({ base, reason: 'generated file missing' }); continue; }
  const orig = imageMap.get(base);
  if (!orig) { imageFailures.push({ base, reason: 'generated slot has no source original' }); continue; }
  const d = webpSize(f) || { w: orig.w, h: orig.h };
  imageMap.set(base, {
    href: '/assets/generated/' + base + '.webp', w: d.w, h: d.h, generated: true,
    originalHref: orig.href, originalW: orig.w, originalH: orig.h,
  });
}
for (const { src, dest } of keptCopies.values()) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// Every variant a srcset can reference. The LARGEST is skipped: it is already
// shipped under its plain name as the src fallback, and copying it twice would
// put a second megabyte in the handoff for nothing.
let variantsCopied = 0, variantBytes = 0;
for (const [base, list] of variantsByBase) {
  if (list.length < 2) continue;
  if (!sizesAttr(base)) continue;                     // never referenced, never shipped
  const largest = list[list.length - 1].w;
  for (const v of list) {
    if (v.w === largest) continue;
    const dest = path.join(DIST, 'assets', 'img', base + '-' + v.w + v.ext);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(v.src, dest);
    variantsCopied++;
    variantBytes += fs.statSync(dest).size;
  }
}

// Two assets are authored outside the crawl inventory and so are not in
// keptCopies: the client-supplied hero (resized, not generated) and the
// background-removed portrait (a transformation of the client's own photo).
// Both are copied in explicitly, and a missing one is a hard failure rather
// than a silently broken <img> (B4).
for (const rel of ['assets/supplied/hero-eyewear.webp',
                   'assets/supplied/hero-eyewear-1280.webp',
                   'assets/img/dr-hyder-cutout.png',
                   'assets/img/dr-hyder-cutout-256.png',
                   'assets/img/dr-hyder-cutout-384.png',
                   // The header logo is authored in the chrome template, so it
                   // never passes through rewriteImages and never got a srcset.
                   // It is on all 44 pages and was shipping a 988px file for a
                   // 190px box (5.2x) and a 644px lockup for a 139px box (4.6x).
                   // These renditions are downscales of the client's own logo -
                   // no generative step.
                   'assets/supplied/eye-trends-vision-and-glasses-center-200.webp',
                   'assets/supplied/eye-trends-vision-and-glasses-center-400.webp',
                   'assets/supplied/eye-trends-mobile-lockup-150.webp',
                   'assets/supplied/eye-trends-mobile-lockup-300.webp']) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) throw new Error('required asset missing: ' + rel);
  const dest = path.join(DIST, 'assets', 'img', path.basename(rel));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// ------------------------------------------------------------- html rewrites
// An alt that names this practice, its premises, its people or a clinical
// result is a DOCUMENTARY claim. A generated image cannot honour it (B3 /
// fabrication:generated-proof), so that usage keeps the real photograph and
// the alt text is left exactly as the source wrote it.
const DOCUMENTARY = /\b(team|staff|portrait|headshot|testimonial|client|patient|before|after|result|premises|store|clinic|office)\b/i;
const PRACTICE = /Eye Trends|in Clear Lake|our (office|optical|practice|exam)/i;

// The cut-out portrait. Dimensions are read from the PNG header at build time
// rather than typed, because a typed pair drifts: the previous build declared
// 511x639 for a 511x560 image and reserved the wrong box for it.
// Read from the file: the header declared width="988" height="200" for an
// image that is actually 988x176, which reserves the wrong box and shifts the
// header as it loads.
const BRAND_LOGO = (() => {
  const f = path.join(DIST, 'assets', 'img', 'eye-trends-vision-and-glasses-center.webp');
  const d = fs.existsSync(f) ? webpSize(f) : null;
  return d || { w: 988, h: 176 };
})();

const PORTRAIT = (() => {
  const f = path.join(ROOT, 'assets', 'img', 'dr-hyder-cutout.png');
  const b = fs.readFileSync(f);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error('portrait cutout is not a PNG');
  return { file: f, w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
})();

// The homepage hero slot. exam-room.webp is 1024x576 and visibly pixelated
// full-bleed, and no larger copy exists in the crawl. The client SUPPLIED the
// replacement: a photograph of eyeglass frames under teal and red studio light
// (assets/supplied/hero-eyewear-source.jpg, 6000x4000). It is resized here to
// 2560w and 1280w. Resizing only — no generative step — so it is NOT stamped
// data-generated; it carries data-supplied="client" instead.
//
// B3 still governs the CAPTION. The source alt called this slot "an unhurried
// Eye Trends exam room in Clear Lake". The new photograph is neither their room
// nor a room at all, so the alt is rewritten to describe what is actually shown
// and to claim nothing about the premises.
//
// Dimensions are READ from the files, never typed: a typed pair drifts, and a
// wrong width/height ships a wrong aspect-ratio box.
const HERO_SWAP = (() => {
  const big = webpSize(path.join(ROOT, 'assets', 'supplied', 'hero-eyewear.webp'));
  const small = webpSize(path.join(ROOT, 'assets', 'supplied', 'hero-eyewear-1280.webp'));
  if (!big || !small) throw new Error('supplied hero images missing or unreadable');
  return {
    from: 'exam-room',
    to: '/assets/img/hero-eyewear.webp',
    toSmall: '/assets/img/hero-eyewear-1280.webp',
    w: big.w, h: big.h, smallW: small.w,
    oldAlt: 'An unhurried Eye Trends exam room in Clear Lake',
    newAlt: 'A pair of designer eyeglass frames resting on a lit surface under teal and red studio light',
  };
})();

function rewriteImages(html, stats) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcM = /\ssrc="([^"]*)"/i.exec(tag);
    if (!srcM) return tag;
    const base = (srcM[1].split('?')[0].split('/').pop() || '').replace(/\.(webp|jpe?g|png|gif|svg|ico|avif)$/i, '');

    // Hero only: the swap applies to the one usage inside .ethc-hero__media.
    if (base === HERO_SWAP.from && /ethc-hero|et-media-img/.test(tag) && stats.heroSwapped === 0) {
      stats.heroSwapped++;
      let out = tag
        .replace(/\ssrcset="[^"]*"/gi, '').replace(/\ssizes="[^"]*"/gi, '')
        .replace(/\ssrc="[^"]*"/i, ' src="' + HERO_SWAP.to + '"')
        .replace(/\swidth="[^"]*"/gi, '').replace(/\sheight="[^"]*"/gi, '')
        .replace(/\salt="[^"]*"/i, ' alt="' + HERO_SWAP.newAlt + '"')
        .replace(/<img\b/i, '<img data-supplied="client" width="' + HERO_SWAP.w + '" height="' + HERO_SWAP.h + '"'
          + ' srcset="' + HERO_SWAP.toSmall + ' ' + HERO_SWAP.smallW + 'w, ' + HERO_SWAP.to + ' ' + HERO_SWAP.w + 'w"'
          + ' sizes="100vw"');
      if (!/\sfetchpriority=/i.test(out)) out = out.replace(/<img\b/i, '<img fetchpriority="high"');
      out = out.replace(/\sloading="lazy"/i, ' loading="eager"');
      stats.imgMapped++;
      return out;
    }

    let rec = imageMap.get(base);
    if (!rec) { stats.imgUnmapped.push(srcM[1]); return tag; }

    if (rec.generated) {
      const alt = (/\salt="([^"]*)"/i.exec(tag) || [])[1] || '';
      const cls = (/\sclass="([^"]*)"/i.exec(tag) || [])[1] || '';
      const probe = rec.href + ' ' + alt + ' ' + cls;
      if (DOCUMENTARY.test(probe) || PRACTICE.test(alt)) {
        stats.generatedRevertedToOriginal.push({ base, alt: alt.slice(0, 110) });
        rec = { href: rec.originalHref, w: rec.originalW, h: rec.originalH, generated: false };
      } else {
        stats.generatedKept++;
      }
    }

    let out = tag
      .replace(/\ssrcset="[^"]*"/gi, '')   // one file per slot now — a stale srcset would 404
      .replace(/\ssizes="[^"]*"/gi, '')
      .replace(/\ssrc="[^"]*"/i, ' src="' + rec.href + '"');
    if (rec.w && rec.h) {
      out = out.replace(/\swidth="[^"]*"/gi, '').replace(/\sheight="[^"]*"/gi, '');
      out = out.replace(/<img\b/i, '<img width="' + rec.w + '" height="' + rec.h + '"');
    }
    if (!/\sloading=/i.test(out)) out = out.replace(/<img\b/i, '<img loading="lazy"');
    if (!/\sdecoding=/i.test(out)) out = out.replace(/<img\b/i, '<img decoding="async"');
    if (rec.generated) out = out.replace(/<img\b/i, '<img data-generated="fal-ai/flux/dev"');

    // srcset, but only where all three conditions hold: more than one variant
    // exists, the image was actually measured, and nothing has already put a
    // srcset on this tag (the hero carries its own, pointing at the supplied
    // photograph). A generated slot has a single rendition and is skipped.
    // a generated slot uses its own downscales
    const genRt = rec.generated ? genRenditions.get(base) : null;
    const genSz = genRt ? sizesAttr(base) : null;
    if (genRt && genRt.length && genSz && !/\ssrcset=/i.test(out)) {
      const set = genRt.map((v) => v.href + ' ' + v.w + 'w')
        .concat([rec.href + ' ' + rec.w + 'w']).join(', ');
      out = out.replace(/<img\b/i, '<img srcset="' + set + '" sizes="' + genSz + '"');
      stats.srcsetAdded++;
    }

    const variants = variantsByBase.get(base);
    const sz = sizesAttr(base);
    if (variants && variants.length > 1 && sz && !rec.generated && !/\ssrcset=/i.test(out)) {
      const largest = variants[variants.length - 1];
      const set = variants.map((v) => (v.w === largest.w
        ? rec.href
        : '/assets/img/' + base + '-' + v.w + v.ext) + ' ' + v.w + 'w').join(', ');
      out = out.replace(/<img\b/i, '<img srcset="' + set + '" sizes="' + sz + '"');
      stats.srcsetAdded++;
    }
    stats.imgMapped++;
    return out;
  });
}

/** Any reference to the platform's upload tree -> this build's asset store.
 *  Used for og:image, twitter:image and JSON-LD, which the source writes as
 *  absolute URLs. The ORIGIN is kept (og:image must be absolute); only the
 *  path changes, because /sites/... does not exist in this build. */
function rewriteAssetUrls(text, stats) {
  return text.replace(/(https?:\/\/eyetrendsclearlake\.com)?\/sites\/[A-Za-z0-9_]+\/uploads\/[^"'\s\\)]+/gi, (m) => {
    const abs = m.startsWith('http');
    const file = m.split('?')[0].split('/').pop();
    const base = file.replace(/\.(webp|jpe?g|png|gif|svg|ico|avif)$/i, '');
    const rec = imageMap.get(base);
    if (!rec) { stats.assetUrlUnmapped.push(m); return m; }
    stats.assetUrlsRewritten++;
    return (abs ? ORIGIN : '') + rec.href;
  });
}

function rewriteLinks(html, stats) {
  let out = html.replace(/\b(href|action|data-link)="([^"]*)"/gi, (m, attr, val) => {
    let v = val;
    if (v.startsWith(ORIGIN)) v = v.slice(ORIGIN.length) || '/';
    if (v === '#sgp_1') v = '#book';
    if (v !== val) stats.linksRewritten++;
    return attr + '="' + v + '"';
  });
  // the booking anchor the source used for its drawer
  out = out.replace(/\bdata-sgp="1"/g, '');
  return out;
}

function stripPlatform(html, stats) {
  let out = html;
  const before = out.length;
  // element-at-a-time, never a span across unrelated markup (SKILL.md standing default)
  out = out.replace(/\sdata-component-id="[^"]*"/gi, '');
  out = out.replace(/\sdata-mega_menu="[^"]*"/gi, '');
  out = out.replace(/\sdata-type="page"/gi, '');
  out = out.replace(/\sid="comp_[A-Za-z0-9]+"/gi, '');
  out = out.replace(/\sid="sgp_\d+"/gi, ' id="book"');
  out = out.replace(/\bclass="sgb-component[^"]*"/gi, (m) => {
    const kept = m.slice(7, -1).split(/\s+/).filter((c) => c && !/^sgb-component/.test(c));
    return kept.length ? 'class="' + kept.join(' ') + '"' : '';
  });
  stats.platformBytesRemoved += before - out.length;
  return out;
}

function neutraliseForms(html, stats) {
  return html.replace(/<form\b[^>]*>/gi, (tag) => {
    const act = /\saction="([^"]*)"/i.exec(tag);
    if (!act) return tag;
    const original = act[1];
    if (/\/search$/.test(original)) {
      stats.formsNeutralised.push({ action: original, kind: 'search' });
      return tag.replace(/\saction="[^"]*"/i, ' action="/search/"').replace(/<form\b/i, '<form data-sr-endpoint="' + original + '"');
    }
    stats.formsNeutralised.push({ action: original, kind: 'submit' });
    return tag
      .replace(/\saction="[^"]*"/i, ' action="#"')
      .replace(/\smethod="[^"]*"/i, '')
      .replace(/<form\b/i, '<form data-sr-unwired="1" data-sr-endpoint="' + original + '"');
  });
}

// The designer-house logos, rebuilt as an infinite marquee (client request:
// "remove the logos from the pills, I want them floating and scrolling in an
// infinite carousel loop").
//
// The loop is built HERE rather than cloned by script at runtime, so it works
// with JavaScript off and so the copy count is a build-time fact the CSS can be
// written against instead of guessed at.
//
// MARQUEE_COPIES is 3, not 2, and that is load-bearing. One set of seven logos
// measures roughly 1200px; a two-copy track would run out of content before the
// translate wrapped and show a blank gap at the right edge on a wide viewport.
// With N copies the track travels exactly one period (100%/N) per cycle, and
// the content still ahead of the viewport is (N-1) periods -- 2400px at N=3,
// which covers the widest container this site has.
//
// Only the FIRST copy keeps its alt text. The rest are decoration: a screen
// reader should hear the seven brands once, not twenty-one, so the repeats are
// aria-hidden with empty alts.
const MARQUEE_COPIES = 3;

function marqueeHouses(html, stats) {
  let out = '', cursor = 0;
  const open = /<div class="ethc-houses"[^>]*>/gi;
  let m;
  while ((m = open.exec(html))) {
    const whole = sliceBalanced(html, m.index, 'div');
    if (!whole) continue;                        // unbalanced: leave it alone
    const inner = whole.slice(m[0].length, whole.length - '</div>'.length);

    // Balanced slicing per item, NOT a lazy regex. This block ships in two
    // shapes: the homepage uses <span class="ethc-house"><img ...></span>, and
    // /products/designer-frames/ uses a dot marker plus the brand NAME as text,
    // <span class="ethc-house"><span class="ethc-house__mk"></span>Ray-Ban</span>.
    // A /<span class="ethc-house">[\s\S]*?<\/span>/ match stops at that inner
    // </span> and silently truncates the item, taking the brand name with it.
    const items = [];
    const its = /<span class="ethc-house"[^>]*>/gi;
    its.lastIndex = 0;
    let im;
    while ((im = its.exec(inner))) {
      const it = sliceBalanced(inner, im.index, 'span');
      if (!it) continue;
      items.push(it);
      its.lastIndex = im.index + it.length;      // skip past nested matches
    }
    if (!items.length) continue;
    // Only the LOGO variant becomes a marquee. This block ships in two shapes,
    // and /products/designer-frames/ carries the brand NAMES as text rather
    // than wordmark images. Repeating a set of images costs nothing -- the alts
    // are emptied on the repeats -- but repeating TEXT duplicates readable
    // words, and it broke a contiguous source phrase that the verbatim check
    // reads as loss (99.952%). The client asked to take the LOGOS out of their
    // pills; a list with no logos in it is not what was being pointed at, so it
    // keeps the pill row it already had.
    if (!items.some((it) => it.indexOf('<img') !== -1)) continue;

    // Only the first copy is read out. The repeats are decoration: a screen
    // reader should hear the brands once, not once per copy.
    const decorative = items.map((it) => it
      .replace(/^<span class="ethc-house"/i, '<span class="ethc-house" aria-hidden="true"')
      .replace(/\salt="[^"]*"/i, ' alt=""')).join('');
    let track = items.join('');
    for (let i = 1; i < MARQUEE_COPIES; i++) track += decorative;

    stats.marqueesBuilt++;
    stats.marqueeLogos += items.length;
    out += html.slice(cursor, m.index)
      + '<div class="ethc-houses ethc-marquee" style="--ethc-copies:' + MARQUEE_COPIES + '">'
      + '<div class="ethc-marquee__track">' + track + '</div>'
      + '</div>';
    cursor = m.index + whole.length;
    open.lastIndex = cursor;
  }
  return out + html.slice(cursor);
}

// The homepage doctor section, reshaped at the client's request:
//   "remove these 2 boxes and remove unnecessary space. Move the More about
//    Dr. Hyder button below the Dr. Hyder image"
//
// DECLARED CONTENT REMOVAL. This is the one operation in this build that takes
// visible copy off the page, so it is named here, counted in the build report,
// and listed in tools/verify-text.mjs so the verbatim check reports it as a
// declared change rather than silently passing over it. The two stat tiles read
// "42yrs / Eye exams and medical eye care in Clear Lake" and "30min / Unhurried
// appointments, we talk and we visit".
//
// Scope is the homepage only, deliberately. Seven other pages also carry an
// .et-doctor__stats block, but with DIFFERENT figures ("1984 - the year the
// doors opened", "1 Doctor who follows every kind of your family's care", and
// so on). The client pointed at one pair of boxes on one page; the others are
// left alone.
//
// The link is MOVED, not rewritten: the same <a> element is lifted out of the
// right column and re-inserted after the left column's role line, under the
// portrait.
// The exact labels the client asked to remove. Listed once here and repeated in
// tools/verify-text.mjs DECLARED_REMOVALS, so the build and the verbatim check
// are talking about the same two tiles.
const DOCTOR_STATS_REMOVED = [
  'Eye exams and medical eye care in Clear Lake',
  'Unhurried appointments, we talk and we visit',
];

function reshapeDoctor(html, stats) {
  // locate the section by class token, not by a substring: "et-doctor" is a
  // prefix of "et-doctor__media", and matching that would slice the wrong block
  let secStart = -1;
  const secRe = /<div class="([^"]*)"/gi;
  let sm;
  while ((sm = secRe.exec(html))) {
    const tokens = sm[1].split(/\s+/);
    if (tokens.indexOf('et-doctor') !== -1 && tokens.indexOf('rw-sec') !== -1) { secStart = sm.index; break; }
  }
  if (secStart < 0) return html;
  const section = sliceBalanced(html, secStart, 'div');
  if (!section) return html;
  let body = section;

  // 1 - the two stat tiles, matched BY CONTENT rather than by class.
  //     Seven other pages carry an .et-doctor__stats block with different
  //     figures; a class-only match removed all eight. Requiring both of the
  //     labels the client pointed at ties this to exactly the pair in the
  //     screenshot and cannot take a different page's stats with it.
  const st = /<div class="et-doctor__stats">/i.exec(body);
  if (st) {
    const block = sliceBalanced(body, st.index, 'div');
    const text = block ? block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const isTheOne = DOCTOR_STATS_REMOVED.every((ph) => text.indexOf(ph) !== -1);
    if (block && isTheOne) {
      stats.doctorStatsRemoved.push(text);
      body = body.slice(0, st.index) + body.slice(st.index + block.length);
    }
  }

  // 2 - collect both .et-doctor__role paragraphs: the plain one under the
  //     portrait, and the one in the right column that carries the link
  const roles = [];
  const rr = /<p class="et-doctor__role"[^>]*>/gi;
  let rm;
  while ((rm = rr.exec(body))) {
    const para = sliceBalanced(body, rm.index, 'p');
    if (!para) continue;
    roles.push({ index: rm.index, html: para, hasLink: para.indexOf('et-golink') !== -1 });
    rr.lastIndex = rm.index + para.length;
  }
  const linkRole = roles.filter((r) => r.hasLink)[0];
  const plainRoles = roles.filter((r) => !r.hasLink);
  const plainRole = plainRoles.length ? plainRoles[plainRoles.length - 1] : null;

  // Only move it if the plain role really does come first, i.e. the link is
  // still in the right column. If a future build already has it in place this
  // does nothing rather than shuffling it again.
  if (linkRole && plainRole && plainRole.index < linkRole.index) {
    const moved = linkRole.html
      .replace(/<p class="et-doctor__role"[^>]*>/i, '<p class="et-doctor__role et-doctor__more">');
    body = body.slice(0, linkRole.index) + body.slice(linkRole.index + linkRole.html.length);
    const at = plainRole.index + plainRole.html.length;   // before linkRole, so unshifted
    body = body.slice(0, at) + moved + body.slice(at);
    stats.doctorLinkMoved++;
  }

  return html.slice(0, secStart) + body + html.slice(secStart + section.length);
}

// --------------------------------------------------------------- nav + chrome
function navHTML(current) {
  const isCur = (h) => (h === current || (h !== '/' && current.startsWith(h + '/')));
  const items = NAV.PRIMARY.map((it) => {
    const cur = isCur(it.href) ? ' aria-current="page"' : '';
    if (!it.mega) return `<li class="nv-item"><a class="nv-link" href="${it.href}"${cur}>${it.label}</a></li>`;
    const panel = it.mega === 'services'
      ? `<div class="mega" data-mega="services"><div class="mega-inner">
        <aside class="mega-promo mega-promo--teal">
          <p class="eyebrow">${NAV.PROMO_SERVICES.eyebrow}</p>
          <h3>${NAV.PROMO_SERVICES.h}</h3>
          <p>${NAV.PROMO_SERVICES.p}</p>
          <a class="btn btn-onDark" href="#book">${NAV.PROMO_SERVICES.cta}</a>
        </aside>
        <div class="mega-cols">${NAV.SERVICE_COLUMNS.map((c) => `<div class="mcol">
          <a class="mcol-head" href="${c.head.href}">${c.head.label}</a>
          ${c.links.map((l) => `<a class="mlink" href="${l.href}">${l.label}</a>`).join('')}
        </div>`).join('')}</div></div></div>`
      : `<div class="mega" data-mega="eyewear"><div class="mega-inner">
        <aside class="mega-promo mega-promo--warm">
          <p class="eyebrow">${NAV.PROMO_EYEWEAR.eyebrow}</p>
          <h3>${NAV.PROMO_EYEWEAR.h}</h3>
          <p>${NAV.PROMO_EYEWEAR.p}</p>
          <a class="btn btn-onWarm" href="#book">${NAV.PROMO_EYEWEAR.cta}</a>
        </aside>
        <div class="mega-cards">${NAV.EYEWEAR_CARDS.map((c) => `<a class="mcard" href="${c.href}">
          <span class="mcard-t">${c.label}</span><span class="mcard-d">${c.blurb}</span></a>`).join('')}</div>
      </div></div>`;
    return `<li class="nv-item nv-has-mega"><a class="nv-link" href="${it.href}"${cur} aria-expanded="false" aria-haspopup="true">${it.label}<span class="nv-caret" aria-hidden="true"></span></a>${panel}</li>`;
  }).join('');
  return items;
}

function headerHTML(current) {
  return `<a class="skip-link" href="#main">Skip to content</a>
<div class="topbar">
  <div class="wrap topbar-in">
    <p class="topbar-note">${NAV.TOPBAR.note}</p>
    <p class="topbar-hours">${NAV.TOPBAR.hours}</p>
    <a class="topbar-call" href="${NAV.TOPBAR.phoneHref}">${NAV.TOPBAR.phoneLabel}</a>
  </div>
</div>
<header class="site-head at-top" id="site-head">
  <div class="wrap head-in">
    <a class="brand" href="/">
      <picture>
        <source media="(max-width: 600px)"
          srcset="/assets/img/eye-trends-mobile-lockup-150.webp 150w, /assets/img/eye-trends-mobile-lockup-300.webp 300w, /assets/img/eye-trends-mobile-lockup.webp 644w"
          sizes="139px">
        <img src="${NAV.BRAND.logo}" alt="${NAV.BRAND.logoAlt}"
          srcset="/assets/img/eye-trends-vision-and-glasses-center-200.webp 200w, /assets/img/eye-trends-vision-and-glasses-center-400.webp 400w, /assets/img/eye-trends-vision-and-glasses-center.webp 988w"
          sizes="190px"
          width="${BRAND_LOGO.w}" height="${BRAND_LOGO.h}" decoding="async" fetchpriority="high">
      </picture>
    </a>
    <nav class="nv" aria-label="Primary"><ul class="nv-list">${navHTML(current)}</ul></nav>
    <div class="head-ctas">
      <button class="head-search" type="button" aria-label="Search this site" aria-expanded="false" aria-controls="site-search">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      </button>
      <a class="btn btn-primary" href="#book">Book an Eye Exam</a>
    </div>
    <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span><span></span></button>
  </div>
</header>
<div class="search-panel" id="site-search" hidden>
  <div class="wrap search-panel-in">
    <h2 class="search-panel__h">Search</h2>
    <form class="search-panel__form" role="search" action="/search/" method="get">
      <label class="sr-only" for="site-search-input">Search this site</label>
      <input id="site-search-input" name="s" type="search" placeholder="Search pages and posts&hellip;" autocomplete="off">
      <button class="btn btn-primary" type="submit">Search</button>
    </form>
    <button class="search-panel__close" type="button" aria-label="Close search">&times;</button>
  </div>
</div>
<div class="mobile-nav" id="mobile-nav" hidden>
  <div class="wrap mobile-in">
    ${NAV.PRIMARY.map((it) => `<a class="mob-link" href="${it.href}">${it.label}</a>`).join('')}
    <div class="mob-group"><p class="mob-h">Eye Care Services</p>
      ${NAV.SERVICE_COLUMNS.map((c) => `<a class="mob-sub" href="${c.head.href}">${c.head.label}</a>` + c.links.map((l) => `<a class="mob-sub" href="${l.href}">${l.label}</a>`).join('')).join('')}
    </div>
    <div class="mob-group"><p class="mob-h">Eyewear</p>
      ${NAV.EYEWEAR_CARDS.map((c) => `<a class="mob-sub" href="${c.href}">${c.label}</a>`).join('')}
    </div>
    <a class="btn btn-primary mob-cta" href="#book">Book an Eye Exam</a>
  </div>
</div>`;
}

function bookingFormHTML() {
  // Field names, labels and the submit label are the source's own.
  return `<section class="book-band" id="book">
  <div class="wrap book-grid">
    <div class="book-copy reveal">
      <p class="eyebrow">${NAV.FOOTER_PRECTA.eyebrow}</p>
      <h2 class="h2">${NAV.FOOTER_PRECTA.h}</h2>
      <p class="lede">${NAV.FOOTER_PRECTA.p}</p>
      <a class="btn btn-ghost" href="${NAV.TOPBAR.phoneHref}">${NAV.FOOTER_PRECTA.phoneLabel}</a>
      <p class="book-meta">${NAV.FOOTER_PRECTA.meta}</p>
    </div>
    <form class="book-form reveal" data-sr-unwired="1" data-sr-endpoint="/do_actions/do_form_submit" action="/appointment-request" method="post" novalidate>
      <div class="fld"><label for="f_name">Your name *</label><input id="f_name" name="name" type="text" required></div>
      <div class="fld"><label for="f_phone">Phone *</label><input id="f_phone" name="phone" type="tel" required></div>
      <div class="fld"><label for="f_email">Email</label><input id="f_email" name="email" type="email"></div>
      <div class="fld"><label for="f_daytime">Preferred day &amp; time</label><input id="f_daytime" name="daytime" type="text"></div>
      <div class="fld"><label for="f_patient">New or returning patient</label><select id="f_patient" name="patient"><option>New patient</option><option>Returning patient</option></select></div>
      <div class="fld"><label for="f_reason">Reason for visit</label><select id="f_reason" name="reason"><option>Comprehensive eye exam</option><option>Contact lens exam</option><option>Medical / urgent eye care</option><option>Eyewear &amp; frames</option></select></div>
      <div class="fld"><label for="f_insurance">Insurance carrier (optional)</label><input id="f_insurance" name="insurance" type="text"></div>
      <div class="fld fld--full"><label for="f_notes">Notes (optional)</label><textarea id="f_notes" name="notes" rows="3"></textarea></div>
      <div class="hp" aria-hidden="true"><label for="f_hp">Leave this field empty</label><input id="f_hp" name="hp" type="text" tabindex="-1" autocomplete="off"><label for="f_hpc">Leave this box unchecked</label><input id="f_hpc" name="hpc" type="checkbox" tabindex="-1"></div>
      <button class="btn btn-primary" type="submit">Request an Appointment</button>
      <p class="form-note" role="status" data-sr-note hidden></p>
    </form>
  </div>
</section>`;
}

function footerHTML() {
  const f = NAV.FOOTER_VISIT;
  return `<footer class="site-foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <p class="foot-name">${NAV.FOOTER_BRAND.name}</p>
      <p class="foot-blurb">${NAV.FOOTER_BRAND.blurb}</p>
    </div>
    ${NAV.FOOTER_COLUMNS.map((c) => `<div class="foot-col"><p class="foot-h">${c.head}</p>${c.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}</div>`).join('')}
    <div class="foot-col foot-visit">
      <p class="foot-h">${f.head}</p>
      <p class="foot-addr">${f.address1}<br>${f.address2}</p>
      <p class="foot-hours">${f.hours}</p>
      <a class="foot-phone" href="${f.phoneHref}">${f.phoneLabel}</a>
      ${f.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}
    </div>
  </div>
  <div class="wrap foot-legal">
    <p>${NAV.FOOTER_LEGAL.copyright}</p>
    <nav aria-label="Legal">${NAV.FOOTER_LEGAL.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}</nav>
  </div>
</footer>`;
}

// --------------------------------------------------------------------- build
const stats = { pages: 0, sections: 0, imgMapped: 0, imgUnmapped: [], linksRewritten: 0,
  platformBytesRemoved: 0, formsNeutralised: [], missingRaw: [],
  assetUrlsRewritten: 0, assetUrlUnmapped: [],
  generatedKept: 0, generatedRevertedToOriginal: [], headingDashesRemoved: [],
  heroSwapped: 0, portraitAdded: 0, marqueesBuilt: 0, marqueeLogos: 0,
  doctorStatsRemoved: [], doctorLinkMoved: 0, srcsetAdded: 0 };

const pageRecords = [];

for (const p of seo.pages) {
  const c = contentByUrl.get(p.url);
  if (!c) { stats.missingRaw.push(p.url); continue; }
  const rawFile = path.join(RAW, c.savedAs);
  if (!fs.existsSync(rawFile)) { stats.missingRaw.push(p.url); continue; }
  const html = fs.readFileSync(rawFile, 'utf8');
  const secs = extractSections(html);
  stats.sections += secs.length;

  let body = secs.map((s) => s.html).join('\n');
  body = stripPlatform(body, stats);
  body = rewriteImages(body, stats);
  body = rewriteLinks(body, stats);
  body = neutraliseForms(body, stats);
  body = marqueeHouses(body, stats);
  body = reshapeDoctor(body, stats);
  // the design layer's reveal hook, applied to the source's own reveal targets
  body = body.replace(/\bet-reveal\b/g, 'et-reveal reveal');

  // ADDITION (client request): the "In Dr. Hyder's words" pull-quote carried no
  // image in the source. His portrait is a REAL photograph of a real person -
  // never generated. The background was cut away from that same photograph
  // (tools/cutout-portrait.mjs); removing a backdrop transforms the asset, it
  // does not invent one, so the documentary caption still holds.
  //
  // The client asked for it BESIDE the quote rather than above it, so the block
  // is rebuilt as two columns: the portrait figure, then the block's original
  // children wrapped untouched in .ethc-stance__body. The children are MOVED,
  // never rewritten - the text has to stay verbatim.
  //
  // The whole block is spliced by index. An earlier pass used body.replace() on
  // just the opening tag while returning a complete element, which left the
  // original children sitting after the new block and shipped the quote twice.
  {
    const m = /<div class="([^"]*ethc-stance[^"]*)"([^>]*)>/i.exec(body);
    const whole = m ? sliceBalanced(body, m.index, 'div') : null;
    if (m && whole) {
      const inner = whole.slice(m[0].length, whole.length - '</div>'.length);
      // The source centres this block with an inline style on the eyebrow. A
      // side-by-side layout reads left-ranged, so that one inline declaration is
      // dropped here - markup only, not a word of text touched.
      const inner2 = inner.replace(/\s*style="justify-content:center"/i, '');
      const rebuilt = '<div class="' + m[1] + ' ethc-stance--split"' + m[2] + '>'
        + '<figure class="ethc-stance__portrait">'
        + '<img src="/assets/img/dr-hyder-cutout.png" width="' + PORTRAIT.w + '" height="' + PORTRAIT.h + '"'
      + ' srcset="/assets/img/dr-hyder-cutout-256.png 256w, /assets/img/dr-hyder-cutout-384.png 384w,'
      + ' /assets/img/dr-hyder-cutout.png ' + PORTRAIT.w + 'w"'
      + ' sizes="(max-width: 480px) 179px, (max-width: 820px) 238px, (max-width: 1200px) 256px, 300px"'
        + ' loading="lazy" decoding="async" data-cutout="fal-ai/birefnet/v2"'
        + ' alt="Dr. Jerry Hyder, OD, therapeutic optometrist at Eye Trends in Clear Lake">'
        + '</figure>'
        + '<div class="ethc-stance__body">' + inner2 + '</div>'
        + '</div>';
      body = body.slice(0, m.index) + rebuilt + body.slice(m.index + whole.length);
      stats.portraitAdded++;
    }
  }

  // DECLARED TEXT CHANGE (client: "remove all emdashes in the section titles").
  // Headings only, and only the dash itself — no wording is altered. One heading
  // site-wide carries one: an em-dash joining a title to its explanatory clause,
  // which becomes a colon so the sentence still reads. Recorded in the build
  // report and allowed for by tools/verify-text.mjs, which otherwise demands
  // 100% verbatim text.
  body = body.replace(/<(h1|h2|h3|h4)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (m, tag, attrs, inner) => {
    if (!/—|&mdash;/.test(inner)) return m;
    const fixed = inner
      .replace(/\s*(?:—|&mdash;)\s*/g, ': ')
      .replace(/[ \t]+/g, ' ')
      .replace(/:\s*:/g, ':');
    stats.headingDashesRemoved.push({
      from: inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 130),
      to: fixed.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 130),
    });
    return '<' + tag + attrs + '>' + fixed + '</' + tag + '>';
  });

  const route = p.url.replace(ORIGIN, '') || '/';
  const file = routeToFile(route);
  const depth = file.split('/').length - 1;

  // og:image, twitter:image and JSON-LD all carry absolute upload-tree URLs
  // that do not exist in this build — repoint them at the new asset store.
  const jsonLd = (p.jsonLd || [])
    .map((b) => rewriteAssetUrls(typeof b === 'string' ? b : JSON.stringify(b), stats))
    .map((b) => `<script type="application/ld+json">${b}</script>`).join('\n');
  const og = Object.fromEntries(Object.entries(p.openGraph || {}).map(([k, v]) => [k, rewriteAssetUrls(String(v), stats)]));
  const tw = Object.fromEntries(Object.entries(p.twitter || {}).map(([k, v]) => [k, rewriteAssetUrls(String(v), stats)]));

  const doc = `<!doctype html>
<html lang="${p.lang || 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title || ''}</title>
${p.metaDescription ? `<meta name="description" content="${p.metaDescription.replace(/"/g, '&quot;')}">` : ''}
${p.metaRobots ? `<meta name="robots" content="${p.metaRobots}">` : ''}
<link rel="canonical" href="${p.canonical || p.url}">
<link rel="icon" href="/assets/img/apple-touch-icon.webp">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="${cssHref('tokens.css')}">
<link rel="stylesheet" href="${cssHref('layout.css')}">
<link rel="stylesheet" href="${cssHref('system.css')}">
<link rel="stylesheet" href="${cssHref('components.css')}">
<link rel="stylesheet" href="${cssHref('chrome.css')}">
${Object.entries(og).map(([k, v]) => `<meta property="${k}" content="${String(v).replace(/"/g, '&quot;')}">`).join('\n')}
${Object.entries(tw).map(([k, v]) => `<meta name="${k}" content="${String(v).replace(/"/g, '&quot;')}">`).join('\n')}
${jsonLd}
</head>
<body class="pg${route === '/' ? ' pg-home' : ''}" data-route="${route}">
${headerHTML(route)}
<main id="main" class="site-content">
${body}
${bookingFormHTML()}
</main>
${footerHTML()}
<script src="/scripts/site.js" defer></script>
</body>
</html>`;

  writeFile(path.join(DIST, file), doc);
  pageRecords.push({ url: p.url, route, file, sections: secs.length, bytes: doc.length, title: p.title });
  stats.pages++;
}

// ------------------------------------------------------- authored stylesheets
// src/styles is the source of truth; dist/styles is derived.
// Load order is the design:
//   tokens.css     — the client's measured palette (sr-tokens, computed capture)
//   layout.css     — the source's geometry ONLY, visuals stripped out
//   system.css     — the Aurora Glass language: ground, type, rhythm, buttons
//   components.css — per-component treatments, generated from the markup map
//   chrome.css     — header, nav, footer, forms
// base.css and reforge.css are gone: shipping the source's component CSS is what
// made the first attempt a reskin of the original rather than a redesign.
// motion.css is deliberately NOT shipped: its 11 keyframes are all platform
// widget animations (sg-spinner, sgb-progress-stripes ...) for components this
// build removed. It stays in src/ as the motion harvest record.
{
  const S = path.join(ROOT, 'src', 'styles');
  for (const f of ['tokens.css', 'layout.css', 'system.css', 'components.css', 'chrome.css']) {
    const from = path.join(S, f);
    if (!fs.existsSync(from)) { imageFailures.push({ base: f, reason: 'src/styles/' + f + ' missing' }); continue; }
    fs.mkdirSync(path.join(DIST, 'styles'), { recursive: true });
    fs.copyFileSync(from, path.join(DIST, 'styles', f));
  }
}

// src/scripts is likewise the source of truth for the behaviour layer.
{
  const SJ = path.join(ROOT, 'src', 'scripts');
  fs.mkdirSync(path.join(DIST, 'scripts'), { recursive: true });
  for (const f of ['site.js', 'search.js']) {
    const from = path.join(SJ, f);
    if (!fs.existsSync(from)) { imageFailures.push({ base: f, reason: 'src/scripts/' + f + ' missing' }); continue; }
    fs.copyFileSync(from, path.join(DIST, 'scripts', f));
  }
}

// ------------------------------------------------------------ /search page
// The source served this from the platform. Rebuilt client-side over a static
// index so the feature and the URL shape (/search?s=term) both survive.
{
  const body = `<section class="rw-sec et-band et-band--paper">
  <div class="container">
    <div class="row row--head"><div class="col col--measure">
      <p class="et-eyebrow">Search</p>
      <h1 class="et-h1">Search this site</h1>
      <form class="search-form" role="search" action="/search/" method="get">
        <label class="sr-only" for="s">Search pages and posts&hellip;</label>
        <input id="s" name="s" type="search" placeholder="Search pages and posts&hellip;" autocomplete="off">
        <button class="btn btn-primary" type="submit">Search</button>
      </form>
      <p class="search-status" id="search-status" role="status">Loading the index&hellip;</p>
    </div></div>
    <div class="row"><div class="col col--measure">
      <ol class="search-results" id="search-results"></ol>
    </div></div>
  </div>
</section>`;
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Search | Eye Trends Vision &amp; Glasses Center</title>
<meta name="description" content="Search eye care services, eyewear and practice information at Eye Trends Vision &amp; Glasses Center in Clear Lake.">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${ORIGIN}/search">
<link rel="icon" href="/assets/img/apple-touch-icon.webp">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap">
<link rel="stylesheet" href="${cssHref('tokens.css')}">
<link rel="stylesheet" href="${cssHref('layout.css')}">
<link rel="stylesheet" href="${cssHref('system.css')}">
<link rel="stylesheet" href="${cssHref('components.css')}">
<link rel="stylesheet" href="${cssHref('chrome.css')}">
</head>
<body class="pg pg-search" data-route="/search">
${headerHTML('/search')}
<main id="main" class="site-content">
${body}
${bookingFormHTML()}
</main>
${footerHTML()}
<script src="/scripts/site.js" defer></script>
<script src="/scripts/search.js" defer></script>
</body>
</html>`;
  writeFile(path.join(DIST, 'search', 'index.html'), doc);
}

// ----------------------------------------------------------------- pruning
// Both an original AND a generated file get staged for every generated slot,
// because the documentary test is per-usage and is only known once the pages
// are written. Whichever ends up referenced by nothing is dead weight — drop
// it, and say which and why rather than shipping bytes nobody asked for.
function walkDist(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkDist(p, out); else out.push(p);
  }
  return out;
}
const distFiles = walkDist(DIST);
const refBlob = distFiles
  .filter((f) => f.endsWith('.html') || f.endsWith('.css'))
  .map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const pruned = [];
for (const f of distFiles) {
  if (!/[\\/]assets[\\/]/.test(f)) continue;
  if (f.endsWith('_generated-manifest.json')) continue;
  const relHref = '/' + f.slice(DIST.length + 1).split(path.sep).join('/');
  if (refBlob.includes(relHref)) continue;
  pruned.push({ file: relHref, bytes: fs.statSync(f).size });
  fs.unlinkSync(f);
}

// ------------------------------------------------------------------- reports
fs.mkdirSync(path.join(ROOT, 'audit'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'audit', 'build-report.json'), JSON.stringify({
  schema: 'site-reforge/reforge-build@1',
  generated: new Date().toISOString(),
  dist: DIST,
  pages: stats.pages,
  sections: stats.sections,
  imagesMapped: stats.imgMapped,
  imagesUnmapped: [...new Set(stats.imgUnmapped)],
  imageFailures,
  linksRewritten: stats.linksRewritten,
  assetUrlsRewritten: stats.assetUrlsRewritten,
  assetUrlsUnmapped: [...new Set(stats.assetUrlUnmapped)],
  platformBytesRemoved: stats.platformBytesRemoved,
  formsNeutralised: stats.formsNeutralised.length,
  formEndpoints: [...new Set(stats.formsNeutralised.map((f) => f.action))],
  missingRaw: stats.missingRaw,
  records: pageRecords,
}, null, 2));

console.log('reforge build complete');
console.log('  pages              ' + stats.pages + ' / ' + seo.pages.length);
console.log('  sections           ' + stats.sections);
console.log('  images mapped      ' + stats.imgMapped + '  (unmapped ' + new Set(stats.imgUnmapped).size + ')');
console.log('  generated kept     ' + stats.generatedKept);
console.log('  reverted to photo  ' + stats.generatedRevertedToOriginal.length + '  (documentary alt)');
console.log('  links rewritten    ' + stats.linksRewritten);
console.log('  asset urls fixed   ' + stats.assetUrlsRewritten + '  (unmapped ' + new Set(stats.assetUrlUnmapped).size + ')');
console.log('  platform bytes out ' + stats.platformBytesRemoved);
console.log('  forms neutralised  ' + stats.formsNeutralised.length);
console.log('  hero image swapped ' + stats.heroSwapped + '  (client-supplied photo, resized; dimensions read from file, alt rewritten)');
console.log('  portrait added     ' + stats.portraitAdded);
console.log('  srcset added       ' + stats.srcsetAdded + '  (' + variantsCopied + ' variant files, '
  + (variantBytes / 1024).toFixed(0) + ' KB)');
console.log('  doctor stats out   ' + stats.doctorStatsRemoved.length + '  (declared removal)');
console.log('  doctor link moved  ' + stats.doctorLinkMoved);
console.log('  logo marquees      ' + stats.marqueesBuilt + '  (' + stats.marqueeLogos + ' logos, x' + MARQUEE_COPIES + ' copies)');
console.log('  heading dashes out ' + stats.headingDashesRemoved.length);
console.log('  pruned unreferenced ' + pruned.length + ' file(s), ' + pruned.reduce((a,x)=>a+x.bytes,0) + ' bytes');
if (imageFailures.length) console.log('  IMAGE FAILURES     ' + imageFailures.length);
if (stats.missingRaw.length) console.log('  MISSING RAW        ' + stats.missingRaw.join(', '));
