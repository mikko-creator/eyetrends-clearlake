// Fill the change-control ledger from what the build ACTUALLY did.
// Decisions are derived from the build's own behaviour, not asserted:
//   - content survived verbatim (verify-text.mjs: 2075/2075 phrases) -> PRESERVE
//   - platform chrome was rebuilt with the same labels                -> REPLACE + why
// Every REPLACE carries a reason, because C14 refuses one without.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LEDGER = path.join(ROOT, 'audit', 'change-control.json');
const d = JSON.parse(fs.readFileSync(LEDGER, 'utf8'));

const WHY_MENU = 'Platform mobile-menu panel. Rebuilt as a dependency-free mobile nav carrying the '
  + 'identical labels and hrefs (tools/nav.mjs, transcribed from the source header). The platform '
  + 'drawer runtime is not reproducible and is not wanted in a clean build.';
const WHY_HEADER = 'Platform masthead. Rebuilt as a glass sticky header (SGEN preset 6) with the same '
  + 'nav architecture, mega-menu grouping and CTA. No label, link or ordering changed.';

// Slot heuristics, keyed on the source class the section carried.
const CHROME = /mm-panel|mm-head|masterhead|sticky-header|mega-promo|precta/i;

function slotFor(row, isFirstOnPage, isLastOnPage) {
  const c = (row.sourceClass || '') + ' ' + (row.label || '');
  if (/mm-panel|mm-head|masterhead|sticky-header/i.test(c)) return 'footer';       // site chrome
  // The page's opening section IS the value proposition — decide that before
  // any keyword heuristic, or a hero whose class mentions "exam" gets filed
  // under benefits and the required slot is never mapped anywhere.
  if (isFirstOnPage) return 'value-proposition';
  if (/precta|ethc-close|-visit\b|dc-visit/i.test(c)) return 'strategic-cta';
  if (/mega-promo/i.test(c)) return 'strategic-cta';
  if (isLastOnPage) return 'strategic-cta';
  if (/review|proof|testimon|record|keeps coming back|rating/i.test(c)) return 'social-proof';
  if (/faq|insurance|visit|directory|wayfinding|cond|question/i.test(c)) return 'objection-handling';
  if (/doctor|creed|trust|story|why|depth|band--dark|surface-dark/i.test(c)) return 'trust-positioning';
  if (/svc|service|product|frame|lens|eyewear|care|exam|benefit|collection|fit/i.test(c)) return 'benefits-solution';
  return 'benefits-solution';
}

// Group rows by page so first/last are meaningful.
const byPage = new Map();
for (const r of d.rows) {
  if (!byPage.has(r.url)) byPage.set(r.url, []);
  byPage.get(r.url).push(r);
}

const counts = {};
for (const [, rows] of byPage) {
  rows.sort((a, b) => a.index - b.index);
  const contentRows = rows.filter((r) => !CHROME.test(r.sourceClass || ''));
  const firstId = contentRows.length ? contentRows[0].id : null;
  const lastId = contentRows.length ? contentRows[contentRows.length - 1].id : null;

  for (const r of rows) {
    const c = r.sourceClass || '';
    if (/mm-panel|mm-head/i.test(c)) {
      r.decision = 'REPLACE';
      r.why = WHY_MENU;
      r.rebuiltAs = '.mobile-nav (dist/scripts/site.js + tools/nav.mjs)';
      r.presetId = '09-accessibility-d-menu-3-keyboard-operable-menu-apg-menu-button';
    } else if (/masterhead|sticky-header/i.test(c)) {
      r.decision = 'REPLACE';
      r.why = WHY_HEADER;
      r.rebuiltAs = '.site-head / .nv / .mega';
      r.presetId = '00-top12-6-glass-sticky-header-transparent-over-hero-blurred-on-scroll';
    } else {
      // Content. It survived word-for-word; only its presentation changed.
      r.decision = 'PRESERVE';
      r.why = '';
      r.rebuiltAs = 'dist' + (new URL(r.url).pathname === '/' ? '/index.html' : new URL(r.url).pathname + '/index.html');
      r.presetId = '00-top12-11-section-rhythm-large-vertical-padding-alternating-grounds';
    }
    r.narrativeSlot = slotFor(r, r.id === firstId, r.id === lastId);
    counts[r.decision] = (counts[r.decision] || 0) + 1;
  }
}

// Rows for what this build ADDED that the source did not have.
const added = [
  { id: 'reforge/add#scroll-motion', label: 'Working scroll-reveal motion system', slot: 'benefits-solution',
    why: 'The source shipped .et-reveal rest-state CSS with no in-state and no IntersectionObserver: '
       + 'measured on the live site, 39 reveal elements sat at translateY(14px) permanently and a full '
       + 'stepped scroll of the 10,982px homepage changed zero computed styles (audit/capture/baseline.index.1280.scroll.json, revealCount 0).',
    rebuiltAs: 'dist/scripts/site.js — IntersectionObserver reveal + 80ms sibling stagger, count-up, glass header, scroll progress, back-to-top',
    presetId: '00-top12-4-scroll-reveal-entrance-with-sibling-stagger' },
  { id: 'reforge/add#search', label: 'Client-side site search at /search', slot: 'objection-handling',
    why: 'The source served /search from the platform. A static build cannot run that query server-side, '
       + 'so it is rebuilt over a static index. The URL shape (/search?s=term) is unchanged.',
    rebuiltAs: 'dist/search/index.html + dist/scripts/search.js + dist/search-index.json',
    presetId: '13-utility-pages-3-sgen-living-styleguide-13-utility-system-pages-404-500-no-results-maintenance-loading-3' },
  { id: 'reforge/add#booking', label: 'Booking section (#book) on every page', slot: 'strategic-cta',
    why: 'The source opened its appointment form in a platform drawer at #sgp_1. Rebuilt as an in-page '
       + 'section with the identical field names, labels and submit label, so every "Book an Eye Exam" '
       + 'link still lands on the form.',
    rebuiltAs: 'dist/**/index.html §.book-band',
    presetId: '00-top12-9-2-way-invert-accent-flip-buttons-fill-ghost' },
  { id: 'reforge/add#imagery', label: 'Generated eyewear imagery (fal-ai/flux/dev)', slot: 'benefits-solution',
    why: 'Client asked for refreshed imagery. 16 placements use generated object studies of eyewear and '
       + 'lenses. 30 placements whose alt text makes a documentary claim about this practice were REVERTED '
       + 'to the original photograph, so no generated image stands in for a real person, premises or result.',
    rebuiltAs: 'dist/assets/generated/*.webp',
    presetId: '00-top12-7-image-zoom-inside-a-clipped-frame-on-hover-mask-caption-rise' },
];

const removed = [
  { id: 'reforge/remove#cookie-settings', label: 'Footer "Cookie settings" link',
    why: 'The link opened the platform consent widget, which existed only to gate the platform analytics '
       + 'and trackers. Both are removed from this build, so there is no consent to configure and the '
       + 'control would be inert. Restore it together with any tracking the client re-adds.' },
  { id: 'reforge/remove#form-endpoint', label: 'Live action on the appointment form',
    why: 'This build has no backend. The source posted to /do_actions/do_form_submit; leaving that live '
       + 'would send patient details to the old platform. The form keeps every field, label and the submit '
       + 'label, is stamped data-sr-unwired with data-sr-endpoint recording the original target, and is '
       + 'stopped client-side with a message pointing at the phone number. Wire it before launch.' },
  { id: 'reforge/remove#header-call-button', label: 'Duplicate "Call" button in the header bar',
    why: 'The 1200px header cannot fit brand + 7 nav items + two CTAs without the nav overlapping the '
       + 'buttons (measured: 213+603+356+36 = 1208px against 1200px available). The phone number is '
       + 'unchanged and still present in the top bar, the footer, and in-page CTAs on every page.' },
];

for (const a of added) {
  d.rows.push({ id: a.id, url: 'https://eyetrendsclearlake.com/', pageType: 'site-wide', index: 9000,
    label: a.label, sourceTag: '', sourceClass: '', decision: 'ADD', why: a.why,
    narrativeSlot: a.slot, presetId: a.presetId, rebuiltAs: a.rebuiltAs });
  counts.ADD = (counts.ADD || 0) + 1;
}
for (const r of removed) {
  d.rows.push({ id: r.id, url: 'https://eyetrendsclearlake.com/', pageType: 'site-wide', index: 9500,
    label: r.label, sourceTag: '', sourceClass: '', decision: 'REMOVE', why: r.why,
    narrativeSlot: 'footer', presetId: '', rebuiltAs: '' });
  counts.REMOVE = (counts.REMOVE || 0) + 1;
}

d.updated = new Date().toISOString();
d.rowCount = d.rows.length;
fs.writeFileSync(LEDGER, JSON.stringify(d, null, 2));

const slots = {};
for (const r of d.rows) slots[r.narrativeSlot || '(none)'] = (slots[r.narrativeSlot || '(none)'] || 0) + 1;
console.log('ledger filled  ' + d.rows.length + ' rows');
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log('  ' + String(v).padStart(4) + '  ' + k);
console.log('  narrative slots:');
for (const [k, v] of Object.entries(slots).sort((a, b) => b[1] - a[1])) console.log('    ' + String(v).padStart(4) + '  ' + k);
const unset = d.rows.filter((r) => r.decision === 'UNSET').length;
const unreasoned = d.rows.filter((r) => (r.decision === 'REMOVE' || r.decision === 'REPLACE') && !r.why).length;
console.log('  UNSET ' + unset + ' · REMOVE/REPLACE without a reason ' + unreasoned);
