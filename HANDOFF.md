# Eye Trends Vision & Glasses Center — developer handoff

A static rebuild of `eyetrendsclearlake.com`. 44 pages, no framework, no build step
required to deploy, no runtime dependencies.

---

## Deploy it in two minutes

Everything in **`dist/`** is the website. Copy it to any static host — Netlify, Vercel,
Cloudflare Pages, S3 + CloudFront, or plain nginx/Apache. There is nothing to compile.

```bash
# look at it locally first
cd dist && python -m http.server 8781      # or: npx serve .
```

**Server config you should set:**

| what | why |
|---|---|
| Serve `dist/` as the web root | `/about/index.html` is reached as `/about/` |
| `Cache-Control: public, max-age=31536000, immutable` for `/assets/**` and `/styles/*.css?v=*` | stylesheet URLs carry a content hash, so they are safe to cache forever |
| `Cache-Control: no-cache` for `*.html` | so a new deploy is picked up immediately |
| Serve `404.html` on 404 if your host supports it | one is not currently generated — see *Known gaps* |
| HTTPS + HSTS | the source site runs on HTTPS and the SEO surface assumes it |

---

## What is in the box

```
dist/        the deployable website — 44 pages + every asset it references
src/         hand-authored sources: styles/ and scripts/
tools/       the build system and the five audits (Node 18+, zero dependencies)
assets/      image masters: supplied/, generated/, generated-rt/, img/
docs/        README, DEPLOY, BRAND-SYSTEM, CHANGE-LOG (every revision, with measurements)
audit/       the evidence: inventories, parity, verbatim-text, gate reports
facts/       client-facts.json — the ONLY place a claim may come from that is not on the live site
```

`HANDOFF-INVENTORY.json` at the root lists every file with a SHA-256 prefix for each
page and asset in `dist/`, so you can prove nothing changed in transit.

---

## Rebuilding

```bash
node tools/build.mjs          # regenerates dist/ from src/ + audit/ inventories
node tools/build-search.mjs   # writes dist/search-index.json  <-- REQUIRED, see below
node tools/verify.mjs         # refs, orphans, content recall
node tools/verify-text.mjs    # every source phrase, verbatim
```

**Both build steps are needed.** `build.mjs` does not write the search index;
`search.js` fetches `search-index.json` and site search is dead without it. Running
`build.mjs` alone leaves `verify.mjs` reporting one major, `dead-js-reference`.

This sequence was verified by extracting this archive into an empty directory and running
it there. The rebuild reproduces every one of the 231 files in `dist/` **byte for byte
identical** (SHA-256 per file), with one expected exception: `search-index.json` carries a
`generated` timestamp, so that field differs and nothing else does — same length, same 43
documents. `verify.mjs` and `verify-text.mjs` both pass in the clean room: 0 blockers,
0 majors, 0 orphans, 100.000% verbatim.

`audit/raw/` holds the crawled HTML of the original site and **is a build input**, not just
evidence — `build.mjs` extracts each page's sections from it. Do not delete it and expect a
rebuild to work.

`dist/` is **fully derived** — the build prunes anything nothing references, so never
hand-edit it. Change `src/styles/*.css`, `tools/nav.mjs` (navigation) or `tools/build.mjs`
and rebuild.

### The stylesheet order matters

`tokens.css` → `layout.css` → `system.css` → `components.css` → `chrome.css`

`system.css` loads **before** `components.css`, so a bare class in `system.css` loses a
specificity tie to the same bare class in `components.css`. This bit three separate rules
during development. When a rule in `system.css` looks correct but does nothing, scope it
with `.rw-sec` and it will win. The comments at each of those rules say so.

### Auditing

The five audits run in the browser against a served build. They are plain scripts that
define a global and return a report:

| file | what it measures |
|---|---|
| `tools/audit-page.js` | contrast, collapsed sections, overflow, broken images |
| `tools/audit-align.js` | content edges, stacking alignment, image ratios |
| `tools/audit-space.js` | section rhythm, padding, dead space in rows |
| `tools/audit-mobile.js` | tap targets, type size, over-delivered images, viewport |
| `tools/verify.mjs` | (Node) references, orphans, content recall |

Serve `dist/`, load a page, inject the script, call `window.__srAudit()` (or
`__srAlign`, `__srSpace`, `__srMobile`). Each returns `{counts, findings}`.

Each audit carries comments describing the false positives it used to produce and why the
check is written the way it is. Read those before "simplifying" one — most of them exist
because an earlier, simpler version reported a clean page that was not clean.

---

## Things that were done deliberately

**The appointment form is not wired to a backend.** It posts to `/appointment-request`,
a path this build does not serve, and is stamped `data-sr-unwired="1"`. The original
endpoint is recorded in `data-sr-endpoint` for reference. **This is the one thing you must
do before launch** — point it at your form handler and remove the stamp. It was left
disconnected on purpose: wiring it to the old platform would have sent patient names,
phone numbers, emails and insurance details to the CMS this rebuild exists to leave.

**Images are responsive.** 199 `<img>` tags carry a `srcset`, and the `sizes` attribute on
each is the **measured** rendered width of that image at 390/768/1024/1440, taken from the
built pages across all 44 routes — not a guess. If you change a layout width, re-measure
(`audit/image-widths.json`) or the browser will pick the wrong file.

**Text is verbatim.** Every phrase on the source site appears in this rebuild character
for character, with three declared exceptions, all listed in `tools/verify-text.mjs` under
`DECLARED_EDITS` with the client's own words as the reason. `node tools/verify-text.mjs`
proves it and fails if anything else drifts.

**Generated imagery is labelled.** Anything produced by an image model carries
`data-generated`. The client-supplied hero carries `data-supplied`. Dr. Hyder's portrait
carries `data-cutout` — it is his real photograph with the background removed, not a
generated likeness. No generated image is ever used where the alt text makes a claim about
the practice, its premises or its people.

---

## Known gaps

| gap | detail |
|---|---|
| **Form backend** | must be wired before launch — see above |
| **No `404.html`** | the build does not generate one; add a page and point your host at it |
| **No sitemap regeneration** | `dist/sitemap.xml` ships as crawled; regenerate if routes change |
| **`--ds-glass-blur`** | referenced by `layout.css`, never defined. A blur, not spacing — harmless, but it means that one backdrop-filter is inert |
| **2 parity minors** | one is 14 images with empty `alt` — the logo marquee's decorative duplicates, which are `aria-hidden` on purpose. The other is one `<h1>` where an em-dash became a colon at the client's request |
| **Gate is 26/28** | `C22` is pixel-parity with the ORIGINAL site, which a deliberate redesign must fail. `C28` is compose-from-presets, and this design layer is hand-authored. Both are recorded overrides in `HANDOFF-MANIFEST.json`, not unnoticed failures |

---

## Browser support

Modern evergreen browsers. The design layer uses `color-mix()`, `:has()`, `aspect-ratio`,
`backdrop-filter` and CSS nesting-free custom properties. No polyfills are included.
`prefers-reduced-motion` is honoured throughout — the logo marquee stops and becomes a
hand-scrollable row, and every scroll reveal is disabled.

---

## Contact points in the content

Phone, address and hours appear in the header, footer and several page bodies. They come
from the source site and are inventoried in `audit/content-inventory.json`. If they change,
grep `dist/` — they are plain text, not a template variable.
