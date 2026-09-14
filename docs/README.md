# Eye Trends Vision & Glasses Center — rebuilt site

A platform-free static rebuild of `https://eyetrendsclearlake.com`, reconstructed on the
SGEN preset library. Every word and every URL of the original survives; the platform
runtime, the design layer and part of the imagery are new.

---

## What this is

| | |
|---|---|
| Source | `https://eyetrendsclearlake.com` (SGEN / SGB platform) |
| Pages | **43 rebuilt + 1 new** (`/search`) |
| Output | `dist/` — plain HTML, CSS and JS. No framework, no build step, no dependencies. |
| Runtime dependencies | **none.** One Google Fonts stylesheet is the only external request. |
| Trackers | **none.** Google Analytics (`G-FVQWTWG7VR`), the platform analytics and the session attributers are all removed. |

## Verified, with the evidence on disk

| Claim | Measured | Artifact |
|---|---|---|
| Every page rebuilt | 43 / 43, 0 missing, 0 extra | `audit/parity-report.json` |
| Text is **verbatim** | 2,075 phrases (≥40 chars) tested, **0 missing** | `audit/verbatim-text.json` |
| Content recall | mean **100.00%**, no page below the 95% floor | `audit/reforge-verify.json` |
| Every reference resolves | 5,097 refs checked, **0 dead**, **0 orphans** | `audit/reforge-verify.json` |
| No platform trace | decontamination **CLEAN** — 0 blocker / major / minor | `audit/decontamination.json` |
| No invented content | fabrication **SOURCED** — 0 blockers | `audit/fabrication-report.json` |
| Design baseline | **computed** from a live browser capture, not source CSS | `audit/design-baseline.json` |

> **A green gate is not a working page.** Serve `dist/` and look at it before you ship.
> `node tools/serve.cmd` or any static server will do.

## Layout

```
dist/
  index.html                  home
  <route>/index.html          one directory per source URL — the URL structure is unchanged
  search/index.html           NEW: client-side site search (the source's /search was server-side)
  search-index.json           the search corpus (43 docs)
  styles/tokens.css           measured palette (sr-tokens, computed browser capture)
  styles/layout.css           the source's geometry ONLY — 1,846 visual declarations stripped
  styles/system.css           Aurora Glass: ground, type, rhythm, buttons, reveal
  styles/components.css       per-component treatments, generated from the markup map
  styles/chrome.css           header, nav, mega menus, footer, forms
  scripts/site.js             scroll reveal · count-up · sticky header · mobile nav · form guard
  scripts/search.js           the search
  assets/img/                 original photographs, kept
  assets/generated/           fal-generated eyewear imagery (16 placements)

src/styles/                   source of truth for tokens.css and reforge.css
audit/                        every measurement behind the table above
tools/                        the build. `node tools/build.mjs` regenerates dist/ from audit/raw/
```

## Rebuilding

```bash
node tools/build.mjs        # pages, assets, chrome  (idempotent)
node tools/build-search.mjs # the search index
node tools/verify.mjs       # references, orphans, platform traces, recall
node tools/verify-text.mjs  # the strict verbatim-text test

node tools/strip-visuals.mjs        # regenerate layout.css from the original CSS
node tools/build-components-css.mjs # regenerate components.css from the markup map
node tools/tokenise-design.mjs      # re-derive every colour from the token layer
```

`audit/raw/` is the untouched crawl of the live site and is the input to all of it.
Never edit `dist/` by hand — edit `src/styles/` or `tools/` and rebuild.

## Read next

- **`DEPLOY.md`** — what must be wired before this goes live. **The appointment form is not connected.**
- **`CHANGE-LOG.md`** — everything that changed, added or was removed, and why.
- **`BRAND-SYSTEM.md`** — the token layer and the preset mapping.

---

## The gate: 26 of 28 PASS

`node scripts/sr-gate.mjs --project <dir> --dir dist` — the skill's 28-check Definition of
Done. **26 PASS. 2 do not apply to this lane and were overridden deliberately**, with the
reason written into `HANDOFF-MANIFEST.json`.

| check | state | why |
|---|---|---|
| **C22** — pixel-for-pixel match with the source | UNPROVEN, overridden | This measures **clone-lane** fidelity. This build is a commissioned **redesign** on the SGEN preset library, so differing from the source's pixels is the requirement, not a defect. No pixel-diff was produced because the comparison is not meaningful here. |
| **C28** — every rebuilt section names a preset | FAIL, overridden | Presumes a *compose-from-presets* strategy. The brief required the **exact** source architecture, so 588 sections were PRESERVED verbatim and the preset library was applied as a design-system **layer**. `sr-match` left 579 rows undecided — 221 below the 0.75 accept threshold, 358 inside the 0.08 margin where it genuinely cannot separate two candidates. Rubber-stamping its top pick would have manufactured a green check, so they were left honestly undecided. All **129** REPLACE rows *do* name a real preset id, each verified present in `audit/preset-index.json`. |

Everything else passed on measured evidence, including content (C17), SEO (C18), forms and
contact (C19), no invented content (C20), no platform trace (C21) and the four-breakpoint
responsive sweep (C23).

## Open, and deliberately not fixed

- **The appointment form is not connected.** See `DEPLOY.md`. This is the one thing that
  must be done before launch.
- **`img-oversized` ×19** (minor) — mostly the brand lockup served at 644 px natural for a
  132 px slot. Cosmetic.
- **No `404.html`.** Add one, or point the host's 404 at `/`.
