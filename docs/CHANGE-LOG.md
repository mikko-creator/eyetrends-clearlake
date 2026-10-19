# Change log

Everything this rebuild changed, added or removed. The machine-readable ledger is
`audit/change-control.json` — 724 rows: **588 PRESERVE · 129 REPLACE · 4 ADD · 3 REMOVE**.

---

## Unchanged, and measured to be unchanged

- **All 43 URLs.** Same paths, same structure, same depth. 0 pages missing, 0 extra.
- **All text.** 2,075 phrases of 40+ characters tested verbatim against the source:
  **0 missing** (`audit/verbatim-text.json`). Word-level recall is 100.00% on every page.
- **All alt text.** Not one `alt` attribute was reworded — see *Imagery* below for why that
  constrained the image work.
- **Navigation architecture.** 7 primary items, the 5-column Services mega menu, the
  4-card Eyewear menu, both promo panels, and the full footer — transcribed label-for-label
  and href-for-href in `tools/nav.mjs`.
- **SEO surface.** Titles, meta descriptions, canonicals, robots directives, Open Graph,
  Twitter cards and JSON-LD all carried across. `og:image`, `twitter:image` and the JSON-LD
  `logo` / `image` fields had their paths repointed at the new asset store (131 URLs), since
  `/sites/sgen_eyetrendsclearlake_com/uploads/…` does not exist in this build.

## REPLACE — rebuilt, same content

| what | why |
|---|---|
| **Masthead** (43 rows) | Platform header rebuilt as a glass sticky header (SGEN preset 6). Same nav architecture, same mega-menu grouping, same CTA. No label, link or ordering changed. |
| **Mobile menu panels** (86 rows) | Platform drawer runtime replaced with a dependency-free mobile nav carrying identical labels and hrefs. |
| **The whole design layer** | `reforge.css` — the SGEN preset library applied over the client's own brand tokens. See `BRAND-SYSTEM.md`. |

## ADD — new in this build

| what | why |
|---|---|
| **Working scroll motion** | The source shipped reveal CSS whose end state was never applied: 39 elements sat at `translateY(14px)` permanently and a full-page scroll produced **zero** computed-style changes. Now an IntersectionObserver reveal with an 80 ms sibling stagger, plus count-up stats, a glass sticky header, a scroll-progress bar and a back-to-top control. All honour `prefers-reduced-motion` and fail open. |
| **`/search`** | The source served search from the platform. Rebuilt client-side over a 43-document static index. **The URL shape `/search?s=term` is unchanged**, so existing links keep working. |
| **Booking section `#book`** | The source opened its form in a platform drawer at `#sgp_1`. Rebuilt as an in-page section with the identical field names, labels and submit label; every "Book an Eye Exam" link now resolves to `#book`. **Not connected — see `DEPLOY.md`.** |
| **Accessibility** | Skip link, visible focus rings, `aria-current` on the active nav item, keyboard-navigable mega menus, reduced-motion support. |

## REMOVE — and exactly why

| what | why |
|---|---|
| **Live form action** | This build has no backend. The source posted to `/do_actions/do_form_submit`; leaving it live would send patient names, phones and insurance details to the old platform. Every field, label and the submit label are kept; the form is stamped `data-sr-unwired` with `data-sr-endpoint` recording the original target, and is stopped client-side with a message pointing at the phone number. **Wire it before launch.** |
| **Footer "Cookie settings"** | Opened the platform consent widget, which existed only to gate the platform analytics and trackers. Both are removed, so the control would be inert. Restore it together with any tracking you re-add. |
| **Duplicate header "Call" button** | The 1200 px header cannot fit brand + 7 nav items + two CTAs: measured at 213 + 603 + 356 + 36 = 1208 px against 1200 px available, and the nav overlapped the buttons. The number is unchanged and still in the top bar, the footer, and in-page CTAs on every page. |
| **All third-party tracking** | Google Analytics `G-FVQWTWG7VR`, platform analytics, session attributers, phone-tap tracking. A clone that keeps these reports your visitors into the previous operator's accounts. |
| **Platform runtime** | 16 platform scripts, the SGB builder wrappers, `#comp_*` ids, the search modal runtime, the ADA consent widget. Decontamination scan: **0 traces**. |

## Imagery — 16 generated, 30 reverted

Generated with **fal-ai/flux/dev** (`tools/falgen.mjs`, prompts and seeds recorded in
`dist/assets/generated/_generated-manifest.json`), converted to WebP at q0.82 — 450 KB–1 MB
JPEGs became **22–97 KB** WebP.

**46 placements were candidates. 16 use a generated image. 30 kept the original photograph.**

The rule: *an AI-generated image may not stand in for a real person, a real premises, or a
real clinical result.* 30 placements carried alt text making exactly that claim — *"Designer
eyeglass frames on display at Eye Trends in Clear Lake"*, *"A child being fitted for glasses
at Eye Trends in Clear Lake"*. Because the brief was to keep the text **exact**, the honest
resolution was to keep the alt and revert the image, not to keep the image and soften the
alt. The build applies this per usage, automatically
(`tools/build.mjs` → `DOCUMENTARY` / `PRACTICE`), so the same file can be generated on a page
that describes it generically and original on a page that claims it.

Never generated at all: **Dr. Hyder's portrait** (a real person) and the eight designer
brand logos (Ray-Ban, Tom Ford, Persol, Oliver Peoples, Maui Jim, Lindberg, Costa) —
third-party trademarks.

The fabrication gate reports **SOURCED**, 0 blockers, across 232 checked claims.

## Known false positives in the automated reports

Recorded here so nobody re-investigates them:

- **`sr-parity` "Phone number missing from rebuild" ×13.** The missing string is
  `"281) 488-0066 515"` — the phone number run into the street address across a text-node
  boundary by the extractor. All 13 pages carry `(281) 488-0066` **and** `tel:+12814880066`;
  verified directly.
- **`sr-parity` "1 source H2 section absent" ×43.** The absent H2 is `search`, the platform
  search modal's heading. Search itself is rebuilt at `/search`.
- **`sr-parity` "Form has no action" ×43.** The deliberate neutralisation above.

## Responsive QA — what the sweep changed

16 sweeps (4 pages × 390/768/1024/1440). First run: **0 blocker, 128 major, 173 minor**.
After the fixes below: **0 blocker, 0 major, 77 minor**.

| finding | fix |
|---|---|
| `tap-target-small` ×128 at 390/768 | 46 px minimum hit area on every component link, the brand, the search and burger buttons. **46, not 44** — at dpr 1.5 a 44 px rule renders as 43.9 and the sweep floors rather than rounds. Inline prose links keep their layout and gain a hit area through `padding-block` with negative `margin-block`, which grows an inline box's hit rect without touching line spacing. |
| `label-missing` ×32 | The spam-honeypot inputs had no accessible name. Labelled, still `aria-hidden` and inert. |
| `font-too-small` ×204 → 36 | Eyebrows and column heads were 11–11.5 px; raised to 12 px, plus the named sub-12 px classes from `base.css`. A blanket `max(1em,12px)` floor was written and then **reverted** — it would have overridden every deliberate size in `base.css` and flattened the type scale. |
| `img-oversized` ×19 (minor, open) | Mostly the brand lockup served at 644 px natural for a 132 px slot. Cosmetic; left for the team. |

### Two findings are false positives, verified rather than assumed

- **`text-clipped` ×22.** The three `.et-wash` sections report `scrollHeight > clientHeight`
  under `overflow:hidden`. That is the decorative ambient-glow pseudo-element being clipped,
  which is the point of it. Measured directly at 390 px: **every section returns
  `textOverflowPx = 0`** — no text is cut anywhere, and the document does not scroll
  horizontally (372 px content in a 390 px viewport).
- **`tap-target-small` on `#f_hp` / `#f_hpc`.** Bot-trap fields, off-screen, `aria-hidden`,
  `pointer-events:none`. Never a user target.

---

# Revision 2 — the actual redesign

Revision 1 shipped the source's `base.css` whole and layered changes on top. The client's
verdict was correct: *"I don't think there were any redesign that happened here, it looks
just like the actual live site."* It was a reskin.

## What changed

| | revision 1 | revision 2 |
|---|---|---|
| source CSS | `base.css` shipped whole (184 KB) | stripped to `layout.css` — geometry only, **1,846 visual declarations removed** |
| visual language | the original's, with adjustments | **100% new** — `system.css` + `components.css` + `chrome.css` |
| ground | flat paper | fixed **aurora gradient mesh**, drifting 34s, grain overlay |
| surfaces | opaque cards | **frosted glass** — 22px backdrop blur, bright rim, inset highlight, pointer-tracked specular sheen |
| header | sticky bar | **detaches into a floating glass pill** on scroll; top bar slides away |
| reveal | fade + 24px rise | **blur-in** — 10px blur + 26px rise + scale, 90ms stagger |
| imagery | 15 product studies | **+10 abstract decorative pieces** (aurora, caustics, lens macro, prism, glass panes) |
| palette | literals beside a token layer | every colour **derived from the measured tokens** via `color-mix()` |

## Unchanged, and re-verified after the rebuild

- **2,075 phrases, 100.000% verbatim.** Not one word altered.
- **All 43 URLs**, same structure. 0 missing, 0 extra.
- Parity **0 blockers / 0 majors / 0 minors**; fabrication **SOURCED**; decontamination **CLEAN**.
- Visual audit: **0 defects** across 8 pages × 4 viewports.

## New imagery

Ten abstract pieces generated with fal-ai/flux/dev, converted to WebP (338 KB for all ten):
`aurora-hero`, `aurora-dark`, `lens-macro`, `bokeh-teal`, `glass-panes`, `optic-rings`,
`light-prism`, `mesh-warm`, `caustics`, `grid-glow`.

These are deliberately **abstract** — light, glass and optics, no person, premises or
clinical result. That keeps them clear of the documentary-claim problem entirely, which is
why the generated/original split from revision 1 still stands unchanged for photography.

---

# Revision 3 — spacing, dashes, full-width hero

## 1 · Em-dashes out of section titles

Two things were producing them, and both are gone:

- **The decorative rule.** Every eyebrow carried a 40 × 2 px gold bar via `::before`, so
  each section title read as *"— CLEAR LAKE EYE DOCTOR SINCE 1984"*. Removed; the eyebrow
  now carries its weight through colour, tracking and case alone.
- **One literal em-dash**, in the `/services/myopia-management/` H1 — the only one in any
  heading site-wide. It becomes a colon so the sentence still reads:
  *"Myopia management in Clear Lake**:** help your child see clearly now…"*

That is a **declared text change** — the only one in the build. It is recorded in
`tools/verify-text.mjs` as a named exception with its reason, so the verbatim check
normalises both sides the same way rather than simply excusing the difference. Everything
else is still word-for-word. `sr-parity` reports it as one `h1-changed` minor, which is the
honest outcome.

## 2 · Spacing and alignment

**The real bug: a 9 px horizontal jump on every section, on scroll.** `.reveal` applied
`scale(.985)`. A section that is itself a reveal target was therefore drawn at 98.5% width,
so its content edge sat 9 px inward until it revealed and then snapped into place. Measured
on `/services/`: content-left `161, 170, 170, 170, 170, 170, 161…` before reveal and a
uniform `161` after, across five sections. **Scaling a full-width block moves its edges** —
the reveal now translates and fades only.

**One alignment rule.** `layout.css` auto-centred a handful of blocks (`.et-sec-head` ×6,
`.et-lede`, `.bw-team`, `.ethc-stance__q`), leaving headings flush-left with the block
beneath them inset — 70 px on `/our-doctor/`. Those now share the container's content edge,
and `.col--measure` keeps its measure as a `max-width` rather than a centring device.

Result: `stack-misalign` **27 → 0**. The only remaining `section-edge` finding is the
full-bleed hero, which is intentional.

## 3 · Full-width hero

The media is lifted out of the two-column grid and becomes the section's background:
full-bleed, `object-fit: cover`, `min-height: clamp(560px, 82vh, 860px)`. The copy sits over
a scrim in the normal content column, so it still aligns with every other section. Stats
become dark-glass tiles; the proof badge anchors to the bottom-right of the section.

Three things had to be fixed to get there, each found by measurement:

1. `.container` was positioned, which made it the media's containing block — the image
   stopped at the 1180 px column instead of going full-bleed — **and** created a stacking
   context that painted the image over the scrim. The container stays static; the copy is
   raised instead.
2. `layout.css` capped the media at `max-height: 440px` and `min(72vh)`, so it covered only
   the top half of the hero.
3. The scrim had to live on the media, not the section. As a section `::before` it never
   painted over the image — forced to solid red it was still invisible.

**The scrim ramp is calculated, not eyeballed.** Compositing it over a worst-case *white*
photo, the copy zone (x 7 %–38 %) must clear 4.5:1 for body text. The first ramp fell to
**3.85:1** at x = 38 %; the shipped ramp holds **7.67:1** there and still clears completely
by 92 % so the room is visible.

## Re-verified after all of it

- Text **100.000% verbatim**, 2,075 phrases, with the one declared heading change accounted for.
- All 43 URLs, 0 missing, 0 extra. Fabrication **SOURCED**, decontamination **CLEAN**.
- Visual audit **0 defects** across 9 pages × 4 viewports; alignment audit **0** stack misalignments.

---

# Revision 4 — five targeted fixes

| # | reported | cause found by measurement | fix |
|---|---|---|---|
| 1 | hero image pixelated | `exam-room.webp` is **1024×576**; full-bleed at 1440+ it upscaled ~1.4× and no larger copy exists in the crawl | new fal image at **2048×1440** (55 KB WebP). Now **downscales at 0.69×** |
| 2 | service cards different sizes | the `.row--svc` grid stretched each `.col` to 381 px but the card inside kept its content height — **353 px on two of six** | cards fill their cell (`height:100%`, flex column, `margin-top:auto` on the footer). All six now **381 px, delta 0** |
| 3 | "unhurried medical depth" alignment all over the place | `layout.css` sets `.rw-sec .row--split-media { align-items:center }` at specificity (0,2,0) — the image column sat at y=3583 while the text column began at y=3425, **158 px out of step** | matched that specificity with `align-items:start`. Both split rows now **delta 0** |
| 4 | text on "designer houses" images unreadable | `.ethc-house` was a **white pill** in the original; the component map told me to keep it bare, so dark brand wordmarks ended up on the aurora with nothing behind them. Logo heights also ranged **31–73 px** | pill restored as light glass; every logo normalised to **26 px** in a **56 px** tile |
| 5 | Dr. Hyder image missing | **it was never there** — the source pull-quote has zero images. Not a regression; an addition | his real portrait added as a centred circular avatar above the quote (a real photograph, never generated, so it keeps a documentary caption) |

## The hero swap is a generated image replacing a documentary one

`exam-room.webp` was a photograph of the client's actual exam room, captioned *"An unhurried
Eye Trends exam room in Clear Lake."* Its replacement is generated, so **it may not keep that
caption** — a generated image cannot claim to be their premises (B3). The alt is now:

> *"An optometry examination room with a phoropter beside the exam chair"*

True of the image, and claims nothing about the practice. If a high-resolution photo of the
real room becomes available, drop it into the slot and restore the original caption.

## Two bugs in my own tooling, fixed

- **Literal backspace bytes (0x08) in `tools/build.mjs`.** A `\b` written through a Python
  patch became the control character, not the regex escape — so `/<div class="([^"]*\bethc-stance\b[^"]*)"/`
  could never match and the portrait silently failed to inject. Four of them across the file.
  Same class of bug that broke the section extractor in revision 1.
- **Hero dimensions were hardcoded.** A 2560-wide request came back **2048×1440**; the build
  now reads width and height from the file's bytes rather than trusting the request.

## Re-verified

Visual audit **CLEAN** and alignment audit **0 stack-misalignments** across 9 pages × 4
viewports. Text **100.000% verbatim**. Parity 0 blockers / 0 majors / 1 minor (the declared
em-dash heading). Fabrication **SOURCED**, decontamination **CLEAN**, gate **26/28**.

---

# Revision 5

Two requests, plus the supplied hero. The first request turned out to be aimed at a different
element than revision 4 treated, and chasing it properly uncovered three further defects that
the audit had been reporting as clean.

## 1 · "The texts on the images are still not readable"

Revision 4 treated the **brand logos** under *Designer houses we carry*. That was the wrong
element. Sampling the pixels of all seven wordmarks settles it:

| file | size | transparent | avg luminance | verdict |
|---|---|---|---|---|
| ray-ban | 193×96 | 79% | 0 | pure black ink |
| oliver-peoples | 460×96 | 74% | 0 | pure black ink |
| lindberg | 600×52 | 87% | 0 | pure black ink |
| persol | 162×96 | 69% | 0 | pure black ink |
| tom-ford | 510×78 | 54% | 0 | pure black ink |
| maui-jim | 191×96 | 81% | 0 | pure black ink |
| costa | 514×96 | 53% | 0 | pure black ink |

Black ink on an 82% white pill was already legible. The unreadable text is the **category
tiles below them** — the ones that genuinely have text *on images*.

Each tile stacks a photograph (`.et-cat__scene`), a scrim (`.et-cat__scrim`) and a caption
(`.et-cat__body`). `strip-visuals.mjs` had removed the scrim's gradient as an appearance
declaration and **nothing re-authored it**, so the scrim painted nothing and dark ink sat on
dark photographs. Measured on the homepage before the fix:

| tile | text | photograph under the caption | contrast |
|---|---|---|---|
| Contact Lenses | `#17262b` | `rgb(8,43,30)` | **1.02 : 1** |
| Sunglasses | `#17262b` | `rgb(64,35,19)` | **1.09 : 1** |
| Frames | `#17262b` | `rgb(126,75,41)` | **2.17 : 1** |
| Kids' Eyewear | `#17262b` | `rgb(235,199,150)` | 9.75 : 1 — passed only by luck of a pale photo |

**32 tiles across the build were in this state.** The scrim now carries a real bottom-up ramp,
the caption is on-dark, and `.et-cat__body` gets a self-sizing plate so a caption that wraps to
three lines is covered as well as a one-line one. After:

| tile | vs the actual photo | vs a hypothetical pure-white photo |
|---|---|---|
| Frames | 14.67 : 1 | 11.12 : 1 |
| Sunglasses | 15.53 : 1 | 11.12 : 1 |
| Kids' Eyewear | 12.18 : 1 | 11.12 : 1 |
| Contact Lenses | 15.54 : 1 | 11.12 : 1 |

## 2 · Dr. Hyder — background removed, bigger, beside the text

- **Background removed** by `tools/cutout-portrait.mjs`, which runs fal's BiRefNet over *the
  client's own photograph*. This is a **transformation, not a generation**: the subject is
  unchanged and only the backdrop is cut away, so the documentary caption still holds and the
  image is stamped `data-cutout`, never `data-generated`. A generative model must never be
  pointed at a real person's face — that would invent detail on a documentary subject (B3).
  Verified on the output: all four corners at alpha 0, 71.4% transparent, 0.7% soft edge,
  subject bounding box 239×510 inside a 511×560 canvas.
- **Bigger** — from a `clamp(84px, 9vw, 108px)` circular avatar to a `clamp(190px, 25vw, 300px)`
  portrait. Measured: **300×570** at 1440px, **256×486** at 1024px.
- **Beside the text** — `.ethc-stance--split` is a two-column grid (`299.988px 704.005px` at
  1440px). The builder now wraps the block's original children in `.ethc-stance__body`; they are
  **moved, never rewritten**. Below 860px it stacks, which is what that width wants.

A typed dimension pair was also wrong here: the markup declared `height="639"` for an image that
is **511×560**. Dimensions are now read from the PNG header at build time.

## 3 · The hero is now a client-supplied photograph

The client supplied `pexels-silviu-din-1620549-4039400.jpg` (6000×4000) to replace the generated
exam room. It is **resized only** — no generative step — to 2560w (112,974 B) and 1280w
(32,388 B), served through `srcset`, and stamped `data-supplied="client"`.

B3 still governs the caption. The source alt called this slot *"An unhurried Eye Trends exam
room in Clear Lake."* The new photograph is neither their room nor a room at all, so the alt is:

> *"A pair of designer eyeglass frames resting on a lit surface under teal and red studio light"*

*Note for the client: the frames in this photograph carry a faint maker's marking on the temple
arm. It is sub-pixel at hero scale, but it is another brand's product, which is worth knowing
before this goes to print.*

## Three defects found while verifying the above

**a · Category tiles collapsed to 1px wide at mobile.** `chrome.css` carried a tap-target rule,
`.rw-sec a[class]:not(.btn) { display:inline-flex; min-height:46px }`. That is right for an
inline text link and wrong for a **card-shaped anchor**: making a card inline-flex shrink-wraps
it to its content, and when that content is absolutely positioned, to nothing. Measured at
390px: `.et-cat` rendered **1px wide inside a 337px column**, on **17 tiles across 8 pages**. The
rule is now scoped to anchors that are actually text links.

**b · A second rule doing the same thing.** `.tib-wayfinding a` in `system.css` — but
`.tib-wayfinding` is a **section** class, so the descendant selector hit every anchor in the
band. A census found 28 `.et-cat` cards, 2 `.tib-creed__pillar` cards, 1 `.btn` and a single
`.et-golink` inside it: the rule styled four cards and a button for the sake of one link that
already carries `.et-golink` and is matched by name. Removed, along with the equally redundant
`.od-close__links a`.

**c · Three more scrims that were never re-authored.** The same defect as `.et-cat__scrim`:

- `.ha-hero__scrim` — the sub-page hero. Element present, `inset:0`, `z-index:1`, no background.
- `.et-frame__tag` and `.tib-creed__cap` — a tag and a caption laid **directly on a photograph**
  with nothing behind them at all, measured at 1.35:1 and 1.11:1. Gradients cannot help chips
  that small; each now carries its own plate, which holds 8.9:1 over a white photograph.

Giving `.ha-hero__scrim` a real dark ramp then required its copy to come with it — the band
carries no `.surface-dark` class, so the heading was inheriting light-surface ink and sat
dark-on-dark at 1.18:1.

## Cache busting, because a fix you cannot see is not a fix

Mid-revision an audit reported **89 contrast failures against a stylesheet that had already been
corrected on disk** — the browser still held the old file, because the URL had not changed.
Stylesheet links now carry a content hash (`/styles/system.css?v=fa2e8ee83c`), which makes a CSS
change visible immediately and lets the shipped files be cached far-future.

## A specificity trap, three times

`system.css` loads **before** `components.css`, so a bare class in `system.css` **loses the tie**
to the same bare class in `components.css`. It bit `.ha-hero__sub` (beaten by `.site-content p`
at (0,1,1)), `.ha-hero__eyebrow` and `.ethc-hero__badge`. Each of those rules is now scoped with
`.rw-sec` and carries a comment saying why, because the bare form looks correct and silently
does nothing.

## Three more corrections to the audit tool — it had been passing this

The audit reported the homepage CLEAN while four captions sat at 1.02:1. Three separate causes,
all now fixed in `tools/audit-page.js` and `tools/audit-align.js`:

6. **A photograph can back text without being any ancestor's background.** `.et-cat` is a light
   glass tile with a photo at `inset:0` painted over it, so the ancestor walk cheerfully reported
   light glass. When a photo layer covers the text the photo wins, and because its pixels are
   unknown the ratio is computed against **both a white and a black photograph**, worse one
   reported.
7. **Clipped is not too-wide.** The hero image carries a reveal zoom (`scale(1.048)`), which
   `getBoundingClientRect()` includes, inside a parent with `overflow:hidden`. It was reported at
   789px vs 768 on three viewports while `document.scrollWidth` stayed at 751.
8. **Layers have colours, and multi-layer gradients are separate gradients.** An earlier pass
   scanned the whole `background-image` string for stops, merging the hero scrim's two gradients
   into one list and interpolating nonsense (a=0.32 where the real coverage is 0.90). It also
   returned a bare alpha that the caller composited as dark ink — but `.tib-hero__chip` is 58%
   **white** glass, and treating it as 58% ink turned a light backdrop dark and reported
   dark-on-light text as 1.23:1. The tool now composites the real layer stack, colour and all.

`audit-align.js` also stopped comparing deliberately full-bleed sections (`.container--full`,
no `.container`) against the page's normal content edge, which was reporting *"content left 0 vs
page 161"* on `/services/` at every viewport.

## Re-verified

| check | result |
|---|---|
| Visual audit | **0 findings**, 12 pages × 4 viewports (48 runs) |
| Alignment audit | **0 findings**, same 48 runs |
| Broken images | **0** |
| Horizontal overflow | **0 runs** |
| Collapsed cards | **0** |
| Text | **100.000% verbatim** — 2,075 phrases, 0 missing |
| Refs | 5,144 checked, 0 blockers, 0 majors, 0 orphans |
| Fabrication | **SOURCED** — 234 claims, 0 blocker/major |
| Decontamination | **CLEAN** — 0 platform traces |

The contrast count over the course of this revision: **89 → 56 → 36 → 32 → 2 → 0**.

---

# Revision 6 — the designer-house logos as an infinite marquee

> *"for this section, remove the logos from the pills, I want them floating and scrolling in an
> infinite carousel loop"*

## What shipped

The white pill is gone — `background:none`, `border:0`, `box-shadow:none`, `padding:0`, measured
as `rgba(0,0,0,0)` at all four breakpoints. The seven wordmarks now float on the band and scroll
continuously right-to-left, with the row's ends masked so logos fade in and out rather than
popping at a hard edge.

**The loop is built at build time, not cloned by script.** `tools/build.mjs` emits the repeated
track directly, so it works with JavaScript disabled and the copy count is a fact the CSS can be
written against instead of guessed at.

## Why three copies, and why margins instead of `gap`

**Three copies, not two.** One set of seven logos measures roughly 1,030–1,550px depending on
viewport. A two-copy track runs out of content before the translate wraps and shows a blank gap
at the right edge on a wide screen. With N copies the track travels exactly one period
(`100%/N`) per cycle and there is still `(N−1)` periods of content ahead of the viewport.
Measured content ahead of the right edge: **1,715px at 390 · 1,395px at 768 · 1,446px at 1024 ·
1,998px at 1440** — no blank at any width.

**Spacing is `margin-inline-end` on each item, not flex `gap`.** This is the difference between
a seamless loop and one that visibly hitches. With a `gap`, a track of *c* copies × *n* items is
`c×set + (c×n − 1)` gaps wide — one gap short of a whole number of periods — so `translateX(-100%/c)`
lands half a gap off and the wrap jumps every cycle. As a margin, each item carries its own
trailing space and the track is exactly `c × period`.

Measured, with the animation frozen, the distance from each copy to the next against the travel
distance the animation actually uses:

| viewport | track | period (track ÷ 3) | copy 1→2 | copy 2→3 | drift |
|---|---|---|---|---|---|
| 390 | 3077.01px | 1025.67px | 1025.67px | 1025.67px | **0.000** |
| 768 | 3127.57px | 1042.52px | 1042.52px | 1042.52px | **0.000** |
| 1024 | 3558.40px | 1186.13px | 1186.13px | 1186.13px | **0.000** |
| 1440 | 4646.53px | 1548.84px | 1548.84px | 1548.84px | **0.000** |

Zero drift at every breakpoint, so the wrap is invisible.

Motion confirmed running, not merely declared: the track advanced **33.88px in 700ms** — 48.4px/s,
which is one 1548.84px period per 32s exactly as specified.

## Readability without the pill

The pill was revision 4's answer to a readability complaint that turned out to be about a
different element entirely (see revision 5). With it gone, the only thing carrying the logos is
the band behind them. All seven wordmarks are pure black ink on transparent, and the band is
`rgb(247,250,251)`; held at `opacity:.66` the effective ink is `rgb(84,85,85)`, which measures
**7.13:1** against the band — well clear of the 3:1 floor for non-text. Hovering lifts them to
`.9` and pauses the scroll, because a row that never stops is hard to read a single logo in.

`prefers-reduced-motion: reduce` stops the animation outright and makes the row
horizontally scrollable by hand instead — verified present and correctly parsed in the shipped
stylesheet. Perpetual motion is precisely what that setting exists for.

## Only the logo row became a marquee

This block ships in **two shapes**. The homepage carries wordmark images; `/products/designer-frames/`
carries the brand *names as text* (`Barton Perreira · Oliver Peoples · Lindberg · Ray-Ban ·
Maui Jim`) with a dot marker and no logos at all.

Repeating images costs nothing — the repeats get empty alts. Repeating **text** duplicates
readable words, and it broke a contiguous source phrase: the verbatim check dropped to
**99.952%**, one phrase missing on that page. Since the client asked to take the *logos* out of
their *pills*, and that list has no logos in it, it keeps the pill row it already had. Verbatim
is back to **100.000%**.

## Two bugs found and fixed on the way

- **A lazy regex ate the brand names.** `/<span class="ethc-house">[\s\S]*?<\/span>/` stops at the
  first `</span>` — which, in the text variant, is the closing tag of the inner dot marker. Every
  item was truncated and the brand name went with it. Item extraction now uses the balanced
  slicer from `lib.mjs`.
- **A `\b` arrived as byte 0x08 again.** Third time in this project: `/<img\b/i` written through a
  patch became `/<img\x08/i`, which matches nothing, so the guard rejected every block and zero
  marquees were built. Replaced with a plain `indexOf('<img')` — no escape, nothing to mangle.
- **A dropped rule put a pill through the right edge.** Restoring `.ethc-house` without also
  restoring `.ethc-houses` let `layout.css`'s `repeat(3,1fr)` grid take over at narrow widths, and
  a text pill cannot shrink below its content: the "Lindberg" pill measured 34px past the right
  edge at 390px and gave that page a horizontal scrollbar. The wrapping flex row is back.

## A note on the two parity minors

`alt-missing — 14 image(s) without alt` on `index.html` is **exactly** the seven logos × two
decorative copies. Those repeats carry `aria-hidden="true"` and `alt=""` on purpose: a screen
reader should hear the seven brands once, not twenty-one. An empty alt on a decorative image is
the correct markup; the parity tool counts it as missing. The second minor is the previously
declared em-dash heading.

## Re-verified

| check | result |
|---|---|
| Visual audit | **0 findings**, 12 pages × 4 viewports (48 runs) |
| Alignment audit | **0 findings**, same 48 runs |
| Broken images | **0** |
| Horizontal overflow | **0 runs** |
| Loop drift | **0.000px** at all four breakpoints |
| Logo contrast vs band | **7.13:1** |
| Text | **100.000% verbatim** — 2,075 phrases, 0 missing |
| Refs | 5,158 checked, 0 blockers, 0 majors, 0 orphans |
| Fabrication | **SOURCED** — 234 claims, 0 blocker/major |
| Decontamination | **CLEAN** |
| Gate | 26/28 (C22 and C28 do not apply to this lane) |

---

# Revision 7 — the homepage doctor section

> *"remove these 2 boxes and remove unnecessary space. Move the More about Dr. Hyder button
> below the Dr. Hyder image"*

## This is the first deliberate content removal in the build

Everything up to here preserved every word on the page. This revision takes two stat tiles off
the homepage at the client's request, so it is named rather than quietly done:

| removed | text |
|---|---|
| tile 1 | **42 yrs** — Eye exams and medical eye care in Clear Lake |
| tile 2 | **30 min** — Unhurried appointments, we talk and we visit |

It is recorded in three places so it cannot pass as an accident: the build counts it
(`doctor stats out 1 (declared removal)`), `tools/build.mjs` carries the reason at the code that
does it, and `tools/verify-text.mjs` lists it under `DECLARED_EDITS` with the client's words.

## Removal is matched by CONTENT, not by class

Seven other pages also carry an `.et-doctor__stats` block — with **different figures**
("1984, the year the doors opened", "1 Doctor who follows every kind of your family's care",
"Exams and eye care for the same Clear Lake community"). A class-only match removed **all eight**
on the first run. The removal now requires both of the labels the client pointed at, so it can
only ever take the pair in the screenshot.

Verified after the fix: homepage `.et-doctor__stats` = **0**, every other page still **1**.

## The link moved, it was not rewritten

The same `<a>` element is lifted out of the right column and re-inserted after the left column's
role line, under the portrait. Measured at all four breakpoints: `moreBelowImage: true`,
`moreBelowRole: true`.

At 1440px the section is two columns and the link sits under the portrait in the left one. At
1024px and below the row collapses to a single column, so the order down the page is portrait →
name → role → link → copy, which puts the link under the image there too.

## Space actually recovered

The tiles carried `margin-top` *and* `padding-top` of `--ds-space-lg` of their own, so removing
them takes that with them. The row is also now centre-aligned rather than top-aligned: with the
stats gone the right column is much shorter than the left, and top-alignment left the tall empty
area the client was pointing at.

Measured by reconstructing the previous markup in the page and comparing:

| viewport | section before | section after | saved | page height saved |
|---|---|---|---|---|
| 390 | 1560px | 1221px | **−339px** | −340px |
| 768 | 1411px | 1200px | **−211px** | −212px |
| 1024 | 1450px | 1238px | **−212px** | −211px |
| 1440 | 1217px | 949px | **−268px** | −268px |

## How a declared removal is proved rather than waved through

A removal is easy to declare and easy to abuse — "it was declared" must not become a way to hide
real loss. `verify-text.mjs` now proves it instead:

1. Every phrase the client asked to remove is listed exactly as it **rendered**, numeral and
   suffix included. The suffix sits in its own `<span>`, so the extracted text reads `42 yrs`;
   declaring only the label left `yrs` unaccounted for and the check correctly refused it.
2. A relocation is declared too, because **moving an element breaks contiguous text runs**.
   Lifting "More about Dr. Hyder" split three source phrases that used to read straight through
   it, without one word being lost.
3. For each such phrase the checker walks the words, greedily extending runs that are still on
   the page, and then requires **every** word to be either inside a substantial surviving run, or
   on the declared-removed list, or still present elsewhere. A real deletion in the middle leaves
   words in none of those three buckets and still counts as missing.
4. Word **membership**, not substring. `built.includes('min')` is true of the word "minutes"
   elsewhere on the page, which would have quietly excused a word that was genuinely gone.

Result: **100.000% verbatim**, 3 phrases explained by the declared edit, 0 missing.

## A selector that matched nothing

`.rw-sec .et-doctor .row--split-media` was written first and did nothing at all: `.et-doctor`
sits **on** the `.rw-sec` element, so a descendant combinator between them can never match. The
computed `align-items` stayed `start` and the fix looked applied while doing nothing. Corrected
to the compound `.rw-sec.et-doctor`, and confirmed as `center` by measurement rather than by
reading the file.

## Re-verified

| check | result |
|---|---|
| Visual audit | **0 findings**, 12 pages × 4 viewports (48 runs) |
| Alignment audit | **0 findings**, same 48 runs |
| Broken images / horizontal overflow | 0 / 0 |
| Text | **100.000% verbatim** — 2,075 phrases, 0 missing, 3 declared |
| Refs | 5,158 checked, 0 blockers, 0 majors, 0 orphans |
| Content recall | 99.99% mean — the declared removal, 0 pages below 95% |
| Parity | 0 blockers / 0 majors / 2 minors, both pre-existing and explained |
| Fabrication | **SOURCED** — 234 claims, 0 blocker/major |
| Decontamination | **CLEAN** |
| Gate | 26/28 (C22 and C28 do not apply to this lane) |

---

# Revision 8 — spacing and padding

> *"fix spaces and padding errors"*

No screenshot this time, and the alignment audit was reporting **0 findings**, so the first job
was to find out what the tools were missing. A new audit, `tools/audit-space.js`, measures the
things `audit-align.js` does not: section rhythm, container symmetry, per-component padding,
content against an edge, doubled bottom space, dead gaps, and where slack sits in a row.

## What was actually fine

Worth stating, because it narrowed the search:

- **Section rhythm** — 107px top and bottom on eleven of the twelve homepage bands, 104 on the
  twelfth. Every seam between consecutive sections measured **0px**.
- **Container insets** — symmetric everywhere; not one left/right mismatch.
- **Design tokens** — every `--ds-space-*` that `layout.css` references is defined, so no padding
  was silently collapsing to zero. (One token, `--ds-glass-blur`, is used but never defined — it
  is a blur, not spacing, and is noted here rather than fixed blind.)
- **Component padding** — no two instances of the same component were padded differently.

## What was wrong: slack piled at one end of a row

The fault was inside the side-by-side rows. A tall text column next to a short media column, top
aligned, dumps every pixel of the difference **under the picture**. Measured at 1440px across
fourteen pages, **22 rows** were like this:

| page | columns | slack |
|---|---|---|
| /patient-forms/ | 955 vs 360 | **595px** |
| /services/childrens-eye-care/ | 1033 vs 520 | 513px |
| /insurance/ | 844 vs 376 | 467px |
| /products/ | 1107 vs 658 | 449px |
| … | … | down to 199px |

Every media column now owns the full row height and centres its contents, so whatever difference
remains is split above and below instead of collecting in one hole.

**Result: 22 → 3.** The three that remain are text-beside-text columns on
`/eye-doctor-clear-lake/` and `/products/` (279px, 193px, 106px), where one column simply has
more copy than the other. That is ordinary editorial variance and top alignment is correct for
it, so it is left alone rather than papered over.

## The fix I tried, shipped, and then took back out

Filling the media to the column height is the better answer on paper — tops *and* bottoms line
up and the slack goes to zero — and on `/patient-forms/` and `/insurance/` it looked excellent.
I had it working and then removed it, because **the same class holds a different photograph on
every page**. `.tib-hero__media` is a 1200×1586 portrait of the frame wall on
`/products/designer-frames/` and a 1600×772 wide shot of the storefront on `/eye-health/` and
`/reviews/`. Filling by class squeezed that storefront into a 533×797 box — a **3.1× tightening**
that cut straight through the fascia, so the practice's own sign read *"EYE ⊙ TREN"*.

Telling those apart needs each image's intrinsic size, which a stylesheet does not have.
Removing dead space is not worth slicing the client's signage in half, so nothing is resized by
class. Verified by A/B, running every page with and without this revision's rules: **no image's
rendered geometry changed** except seven sub-pixel rounding differences and two wrappers on
`/insurance/` and `/patient-forms/` that grew to fill their column — and those two are built to
do exactly that, holding an absolutely positioned `object-fit: cover` image whose whole job is to
fill whatever box it is given.

## Two bugs in my own work along the way

- **`height: 100%` against an auto height.** The first version of the fill collapsed the media to
  nothing and emptied the right-hand column on `/patient-forms/` and `/insurance/` — caught on a
  screenshot, not by a number. The row is top-aligned, so the column was only as tall as its
  contents; `align-self: stretch` on the column is what makes any height percentage resolvable.
- **An audit that kept reporting rows it had already fixed.** The first version flagged the raw
  height difference between columns. But a height difference is not a fault — a short picture
  beside long copy is normal, and centring it distributes the difference deliberately. The check
  now measures *where the empty space sits*, and only reports slack pushed to one end with
  nothing at the other.

One more false positive was removed: `surface-unpadded` fired **72 times** on `.et-frame`, which
is edge-to-edge media plus a padded `.et-frame__body`. A card with no padding of its own is
normal; what matters is whether TEXT ends up against the edge, so the check measures the text
inset instead of the box.

## Re-verified

| check | result |
|---|---|
| Spacing audit | **3 findings**, down from 22 — all text-beside-text, explained above |
| Visual audit | **0 findings**, 14 pages × 4 viewports (56 runs) |
| Alignment audit | **0 findings**, same 56 runs |
| Broken images / horizontal overflow | 0 / 0 |
| Image geometry vs before | unchanged except two fill-by-design wrappers |
| Text | **100.000% verbatim** — 0 missing, 3 declared |
| Refs | 5,158 checked, 0 blockers, 0 majors, 0 orphans |
| Parity | 0 blockers / 0 majors / 2 pre-existing minors |
| Fabrication | **SOURCED** · Decontamination **CLEAN** |
| Gate | 26/28 (C22 and C28 do not apply to this lane) |

---

# Revision 9 — mobile optimisation and the complete handoff

> *"optimize mobile then prepare a zip folder with complete assets so I can hand this off
> properly with my team"*

A new audit, `tools/audit-mobile.js`, measures what only breaks on a phone: tap targets and
the gaps between them, type size, form-control size, the viewport meta, unwrappable text,
sticky chrome, and images delivered larger than they are drawn.

## The finding that mattered

**39 of the 42 images already had smaller renditions on disk** — the crawl downloaded every
size variant the source site published — and exactly **1 of 259 `<img>` tags used them**.
Phones were pulling full desktop photographs to paint them a third of the width.

Fixing it properly needed two inputs, and the second is the one that makes it honest:

1. **The variants**, from the image inventory.
2. **A measured `sizes` attribute.** The rendered width of every image was measured at
   390/768/1024/1440 across **all 44 routes** and written to `audit/image-widths.json`. The
   `sizes` on each tag is that measurement, not a guess at the layout. Where an image was
   never measured it gets no `srcset` at all, because a wrong `sizes` makes the browser pick
   a *worse* file than no `srcset` would.

Three groups of images had no small rendition to offer and were downscaled from their own
masters — no generative step anywhere:

| what | why it needed one |
|---|---|
| the header logo (both lockups) | on all 44 pages, shipping 988px for a 190px box (5.2×) and 644px for a 139px box (4.6×) |
| the 12 generated slots | produced at one size only, so a phone pulled 1200px for a 335px tile |
| Dr. Hyder's cut-out portrait | 153 KB PNG drawn at 179px on a phone |

**Result, measured across all 44 routes at 390px:**

| | image payload |
|---|---|
| every image at full size | **16.80 MB** |
| what a phone now downloads | **5.78 MB** |
| saved | **11.02 MB — 65.6%** |

Average per page: **391 KB → 134 KB**.

The header logo also declared `width="988" height="200"` for a file that is 988×**176**, so
it reserved the wrong box and shifted the header as it loaded. Dimensions are now read from
the file.

## Everything else on mobile was already right

Two small things were fixed: adjacent pills and go-links measured 7–8px apart in three
containers (`.bw-team__contact`, `.od-close__links`, `.ha-ins`), just under the 8px a finger
needs, so those gaps are now 12px.

**Mobile is now clean: 0 findings at 360, 390, 414 and 768px across 16 pages.**

## Three false positives I removed rather than "fixed"

The first run reported 1,299 small tap targets, 781 crowded pairs and 490 small-text
findings. Almost all of it was the audit being wrong, and each one would have caused real
damage if I had acted on it:

- **96 "small tap targets" were field labels.** A `<label>` above its input is text; the
  input underneath is what gets tapped. Padding them to 44px would have wrecked every form.
- **132 of 139 "crowded" pairs were a label and its own input**, which are meant to sit
  together.
- **81 "small text" findings were pills, eyebrows and stat captions** — labels, not reading
  matter, and deliberately small.

And one that looked like a serious bug: **24 form inputs at 13.3px**, which on iOS makes the
page zoom on focus. They turned out to be the appointment form's **honeypot**, which
`chrome.css` parks at `left:-9999px` inside a 1px box with `overflow:hidden`. No human can
reach it. My `visible()` test only looked at display, visibility, opacity and rect size, so
it counted an off-screen element as on-screen. "Fixing" it would have meant styling a spam
trap into visibility. The audit now treats off-screen and clipped-to-nothing as hidden.

Also corrected: two routes in my own sweep list, `/contact/` and `/appointments/`, **do not
exist** — every sweep had been auditing a 404 page for them. The route list is now generated
from `dist/` (`audit/routes.json`, 44 real routes).

## The handoff archive

`sr-package.mjs` is the skill's canonical packager and still produces the manifest, the gate
verdict and the recorded override — but it collects only `src`, `dist`, `assets`, `docs`,
`facts`, `presets` and `audit`. It does **not** ship `tools/`, which is the entire build
system: the builder, the five audits, the image pipeline and the verifiers. A team receiving
that zip can deploy `dist/` but cannot regenerate it.

`tools/package-handoff.mjs` writes the complete archive: everything the canonical packager
ships **plus** `tools/`, plus a root **`HANDOFF.md`** covering deploy steps and server
config, how to rebuild, what each audit measures, the stylesheet order trap, what was done
deliberately, and an explicit **Known gaps** table — the unwired form first among them.

It also writes `HANDOFF-INVENTORY.json` with a SHA-256 prefix for every file in `dist/`, so
the team can prove nothing changed in transit.

## Re-verified

| check | result |
|---|---|
| Mobile audit | **0 findings** at 360/390/414/768 — 16 pages |
| Visual audit | **0 findings**, 16 pages × 6 viewports (96 runs) |
| Alignment audit | **0 findings**, same 96 runs |
| Spacing audit | 3 findings, all text-beside-text, unchanged and explained in revision 8 |
| Broken images / horizontal overflow | 0 / 0 |
| Mobile image payload | **16.80 MB → 5.78 MB (−65.6%)** |
| Text | **100.000% verbatim** — 0 missing, 3 declared |
| Refs | 6,273 checked, 0 blockers, 0 majors, **0 orphans** |
| Parity | 0 blockers / 0 majors / 2 pre-existing minors |
| Fabrication **SOURCED** · Decontamination **CLEAN** | |
| Gate | 26/28 (C22 and C28 do not apply to this lane) |

---

# Revision 10 — the hero proof row on a phone

> *"optimize mobile view for this"*

The three hero stats sat in a wrapping flex row. Correct on a wide screen, wrong on a
narrow one: each wrapped onto its own line at its own content width, a ragged left edge
that reads as broken rather than designed. Under 640px they are now three equal columns
(`system.css` section 22). Commit `0f9f9e8` carries the full measurements.

| viewport | hero height | stats |
|---|---|---|
| 360 | 1204 → **956** (−248) | three equal columns, one row, 0 clipped |
| 390 | 1153 → **906** (−247) | three equal columns, one row, 0 clipped |
| 414 | 1124 → **879** (−245) | three equal columns, one row, 0 clipped |
| 768, 1440 | unchanged | the rule is scoped under 640px |

The selector needed the compound form: `.ethc-hero` sits on the `.rw-sec` element itself,
so `.rw-sec .ethc-hero` matches nothing (the same trap as `.et-doctor` in revision 8).

`tools/audit-space.js` now measures seams from the untransformed box. A section still
carrying the scroll reveal's resting `translateY(26px)` read as a +26px gap above it and a
−26px overlap below, which produced six phantom findings on `/services/` at every viewport.

---

# Revision 11 — the check in the hero badge

> *"the check here is not centered"*

The check mark in the home hero's "42 years, one doctor" badge sat in the top-left corner
of its ring: **7.5px left of and 6.9px above centre**, at every desktop width.

The ring rule asks for `display: grid; place-items: center`, but `layout.css` sets
`display: block` on every `span` inside `.ethc-hero__badge` at specificity (0,1,1), which
outranks the bare `.ethc-hero__ring` at (0,1,0). The ring is a span, so it rendered as a
block and the centring never applied. The rule is now `.rw-sec .ethc-hero__ring` (0,2,0),
the `.rw-sec` scoping described under *The stylesheet order matters* in `HANDOFF.md`. Any
new rule for a span inside that badge needs the same scoping.

## Re-verified

| check | result |
|---|---|
| Check centre vs ring centre | **dx 0, dy −0.4px** at 1280×585, 1600×662, 1440×900, 1024×768 and 920×700 (was −7.5, −6.9). The 0.4px is the icon's own path, drawn half a unit high |
| Positive control | translating the icon by (5px, 3px) moved the reading by exactly that |
| The rest of the badge | badge, ring, title and subtitle boxes unchanged; the badge is still hidden at 900px and below |
| Scope | 187 of 233 `dist/` files byte-identical; the 44 pages differ only in the `system.css?v=` hash, `search-index.json` only in its timestamp |
| Refs / text | 6,273 refs: 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | measured again on the published page after the Pages build: dx 0, dy −0.4 |

---

# Revision 12 — Dr. Hyder's portrait, edited with Higgsfield

> *"Use higgsfield ai to improve this photo of Dr. Jerry Hyder … Increase resolution of his
> photo and perhaps use a better background, a clear eye clinic background. Make it very
> professional looking suited for a high-end service"*

The largest copy of his portrait that the source site published is 511×560. The layout paints it
up to 927px wide, so it was soft wherever it was large. It appears 39 times on 38 pages.

## How it was made

Higgsfield Marketing Studio 2.5 Sunburst produced it at 4K, 1:1, from the 511×560 original
centred on a square canvas. The 2880×2880 output was cropped back to the original's exact
framing (2628×2880) and is served at six widths, 480 to 1920. Six renders across four models
were compared. The full record is in `assets/edited/README.md`, and the build step is
`PORTRAIT_SWAP` in `tools/build.mjs`.

## He is a real person, so the edit was checked against the original

The render was aligned to the original on the man himself, using SIFT matches and a RANSAC
similarity transform: scale 1.001, shift under 1px. Each region was then compared at the
original's own resolution:

| region | SSIM | NCC | for scale |
|---|---|---|---|
| face | **0.874** | 0.949 | the original against a blurred, re-encoded copy of itself scores 0.849; a mirrored face scores 0.265 |
| glasses | 0.825 | 0.865 | |
| hands and ring | **0.915** | 0.992 | |

The other five renders were rejected:
- Flare scored 0.833 on the face.
- Qwen Image 3 scored 0.813 and reframed him.
- Grok Image 2.0 scored 0.796.
- Two versions that kept his own office scored 0.788, and 0.872 with his hands changed.

The sharp crease between his brows is in the original photograph too.

## What the new background changes, and what it does not

The room is **generated**. It is not the Eye Trends office. Every usage carries `data-edited`.
One alt described the room, "in his Clear Lake optometry practice", and is rewritten to "Dr.
Jerry Hyder, OD, Clear Lake optometrist since 1984". The other 38 name him, where he practises
or his record, and the edit changes none of that.

## The badges on the portrait were already broken

Measuring the new photograph against every badge printed on it showed four badge families, on
35 pages, that were wrong before this revision:

| badge | pages | before | after |
|---|---|---|---|
| `.tib-creed__badge` | 4 product pages | a full-width bar across the top of the frame, **over his face**; the "42" in dark ink on the dark plate, 1.4:1 | a chip in the corner; light numeral; 5.2–10.4:1 |
| `.ia-portrait__badge` | insurance, patient forms | the same full-width bar over his face, 42–94% of it | a chip in the corner; 5.9–13.2:1 |
| `.et-doctor__badge` | 8 pages | no plate; white text on the bare photo, 3.1:1 (worst pixel 1.7) | dark glass; 4.9–8.0:1 |
| `.dc-doctor__badge` | 21 service pages | no plate; the "42" fell to 1.8:1 on the new photo | dark glass; 4.8–7.3:1 |

The "after" figures are mean contrast across 390, 768, 1024 and 1440 px. The worst pixel of
every reading is 4.65:1 or better.

Causes:
- **The full-width bars.** The generated glass block in `components.css` sets `position:relative`
  and beats `layout.css`'s `absolute`.
- **The missing plates.** The `et-doctor` and `dc-doctor` rules read the undefined
  `--ds-glass-blur`.
- **The dark numeral.** It comes from `.site-content b`.

On a phone the frame becomes a short landscape crop with his face under the top-right corner:
80% of it was covered at 320px. Below 640px the badges now sit at the bottom corner. Below 360px
the product badge is hidden, because nothing fits between his chin and the name caption, and
each product page states "since 1984" / "42 years" 3 to 5 times in its text. See `system.css` §23.

## Re-verified

| check | result |
|---|---|
| Every placement | 27 measured (8 routes × 390/1024/1440), 0 broken. The browser now picks the 480 / 960 / 720 file, where it used to stretch the 511px one up to 927px |
| Layout | Untransformed boxes are identical before and after. The services frame's scroll zoom (×1.059) was ruled out with a same-build control |
| Badge text contrast | 44 readings, 390–1440, text measured against what is actually behind it: worst pixel **4.65:1 or better** |
| Badges over his face | 66 readings (6 routes × 11 widths, 320–1440): **0%**. A chip forced onto the face as a control read 67.7% |
| Scope | 191 files byte-identical. 38 pages changed only inside the portrait `<img>`. `system.css` +61 / −0 lines (§23). 3 old portrait files pruned, 6 added |
| Refs / text | 6,390 refs: 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | After the Pages build (`f39c882`), the home page, `/our-doctor/`, `system.css` and a portrait file are byte-identical to the build. 10 placements load. Badges cover 0% of his face at 360/390/1440 on 4 routes |

---

# Revision 13 — the home doctor section: his photograph as the background

> *"make the image you edited a full width background image of that section? It looks weird
> in it's frame"*

The section "The unhurried medical depth of a real eye doctor" on the home page now uses the
photograph as a full-bleed background, edge to edge. He stands on the left, and the text sits on
the right over a gradient in the band's dark `--c-3`. The "42 years" chip, his name, role and link
moved under the text, so nothing covers him. Below 1025px the section stacks as before, and the
photo becomes a full-width band without the frame. The seven other pages that use this component
are unchanged.

**A 16:9 version was needed.** The portrait is 511:560, so covering a ~1.6:1 band would crop him to
a strip under the text. Higgsfield extended the room to 16:9 around the approved render (Flare,
4k). Re-rendering him a second time cost likeness (face SSIM 0.834–0.844), so the approved pixels
were stitched back over him along a least-difference seam in the shelf column. The shipped file
scores face SSIM 0.905 against the original. Record: `assets/edited/README.md`.

**How it is built:**
- `tools/build.mjs` wraps the home page's portrait in a `<picture>`: the 16:9 files at 1025px and
  up, the portrait files below.
- `system.css` §24 dissolves the frame (`display:contents`). It pulls `.et-doctor__portrait` out
  to the section's edges with full-bleed offsets, and places his face at 27% of the width.
- Two traps were met on the way:
  - The first attempt copied `layout.css`'s `body.is-homepage` selectors. They never match: the
    home `<body>` is `class="pg pg-home"`. §24 is scoped by `.rw-p-home` instead.
  - With `sizes="100vw"`, the cover crop painted the image 1742–1968px wide from a 1280–1600 file,
    1.2–1.4x upscaled. The desktop source now declares `(max-width: 1960px) 1960px, 100vw`.

## Re-verified

| check | result |
|---|---|
| Layout | Full-bleed at 1025, 1280, 1440, 1920 and 2560. A frameless full-width band at 1024, 768 and 390 |
| File chosen | Desktop at 1x gets the 2560 file and 1.5–2x gets the 3840: 0.68–1.02x of the painted size, so no upscaling |
| His face | 0% covered by any text element, at 9 widths from 320 to 2560. A box placed on the face as a control read 100% |
| Text over the photo | Mean contrast at 1025–2560: heading 9.9–10.2:1, paragraph 10.6–11.0:1, eyebrow 10.8–13.1:1, name 7.3–7.5:1, role 6.8–7.2:1, link 11.2–12.0:1, pills 7.2–9.1:1, chip 13–14:1. These were re-measured in revision 14 with the corrected probe. The first pass gave the link 6.1–11.5:1, because its colour transition was still fading the text when the probe captured it. A control painting the paragraph's own text colour behind it read 1:1. The gradient-filled "eye doctor" cannot be measured this way and is the site's existing accent |
| Scope | Only `index.html` (the `<picture>`) and `system.css` (+85 / −0, §24) changed; 6 files added; 234 identical |
| Refs / text | 6,396 refs: 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |

---

# Revision 14 — the home kids section: a full-bleed still life, the text on glass

> *"redesign this section, enhance the image resolution and make it full width too"*

"The eye doctor your kids will grow up with" was a text column beside a framed 1024x768 photo.
It is now a full-bleed still life: three children's frames on a pastel set. The text sits in a
frosted-glass card on the calm left of the photo, and the glasses stay clear on the right. Below
1200px the section stacks: the text on the band's cream, then the photo as a full-width band.

**The image.** The source photo is 1024x768 and looks AI-made itself; its teal arm carried
pseudo-text. Higgsfield re-rendered it at 3840x2160 (Sunburst, 4k, 16:9) from a layout sketch:
the source photo on the right, and its own wall and tabletop stretched left. The render keeps the
three frames and removes the lettering. A first attempt placed the frames large (46–95% of the
width). When the photo filled a section taller than 16:9, cover scaling slid them under the card.
The used version groups them smaller, at 62–95%. Below 1200px a `<picture>` source serves a 4:3
crop of the same render, centred on the frames (they fill 70% of its width). Record:
`assets/edited/README.md`.

**The alt.** The source alt here, "A child in durable, colorful kids' eyeglass frames at Eye
Trends", describes a child the photo never showed. It now says what the image shows, in the
wording `/services/back-to-school-eye-exams/` already used. Only this slot changed. The home page
uses the same base again for the kids card in the optical section (the generated stand-in), and
that card is untouched. The other 11 pages are untouched too.

**The geometry that keeps the glasses clear** (`system.css` §25):
- The photo is anchored right (`object-position: 100%`), so the frames' left edge always sits
  0.676 section-heights in from the right edge.
- The section is held near 16:9: the row's min-height is 56.25vw minus its 64px top and bottom
  padding.
- The card is capped at `clamp(480px, 40vw, 600px)`.
- Between 1025 and 1199px the section stacks, because two columns that narrow cannot keep the
  frames clear.

## Re-verified

| check | result |
|---|---|
| Glasses vs the card | Clear at 1200, 1280, 1366, 1440, 1600, 1920 and 2560, with gaps of 114–255px; the frames are 100% inside the section. A card stretched across the section as a control reported the overlap |
| Stacked layouts | At 1100, 1024, 768 and 390 the card sits above the band, and the frames fill about 70% of the band's width, 100% visible |
| Text on the card | Mean contrast at 1200, 1440, 1920 and 390: heading 13.3–13.7:1, paragraph 5.9–6.0:1, eyebrow 5.9–6.1:1, the three points 9.8–10.1:1, the button 15.1–15.5:1. A control painting the paragraph's own colour behind it read 1:1. "grow up with" is gradient text and is not measurable this way |
| The probe itself | Four faults were found and fixed before these numbers were trusted: a smooth scroll still moving at capture time; colour transitions fading the "hidden" text (one button read 7.1, 5.5 and 2.4:1 across three widths, and 15.45:1 once fixed); a white-box control that cannot fail on dark text; and a driver `close()` that could hang |
| Files | Desktop 960–3840 (7–57 KB), with the 2560 file loaded at 1x. Crop 480–1794 (5–34 KB) |
| Scope | `index.html` changed in one contiguous span inside this section's media block (`<picture>`, image, alt). `system.css` +79 / −0 (§25). 11 files added; 240 identical |
| Refs / text | 6,402 refs: 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |

# Revision 15 — the designer-house logos, no longer cut by a frame

> *"some of the logos here are being cutoff by a pill shaped frame. Make sure the logos display
> fully"*

Every logo in the "Designer houses we carry" marquee now shows in full, with no frame around it.

**The cause.** Each logo is an `<img class="ethc-house__logo">`, and `components.css` lists
`.ethc-house__logo` among its media frames (`audit/redesign-brief.json` filed it under
`mediaFrames`). Those rules give a photograph its rim: a 32px radius, a 1px border, the glass
shadow and `overflow: hidden`. Revision 6 removed the pill from the `.ethc-house` wrapper, but the
image inside kept the photo rim. On a logo 24–32px tall the 32px radius collapses to a full pill,
and with `overflow: hidden` it trims the image itself; the border and shadow drew the faint
outline. Ink cut off, measured at 390, 768, 1024, 1280, 1440 and 1920:

| logo | ink cut by the frame |
|---|---|
| Persol | 7.3–7.7% |
| Lindberg | 4.8–5.1%: the L, and the glasses mark after the G |
| Oliver Peoples | 3.2–3.4%: the edge of the O |
| Maui Jim | 1.9–2.0% |
| Tom Ford | 1.0–1.1% |
| Ray-Ban | 0.7–0.8% |
| Costa | 0.6–0.7% |

**The fix.** `system.css` (section c, beside the marquee rules) sets `border: 0;
border-radius: 0; box-shadow: none` on `.rw-sec .ethc-house__logo`, which outranks the generated
bare class. `components.css` is not edited. It is generated and then post-processed by the colour
and spacing tokenisers, so the generator alone, run in a scratch copy, did not reproduce it
(colours and sizes came back as literals). The brief is left as it is, and the override holds if
the file is ever regenerated.

**The widths.** The logo box is as tall as before (24–32px), but the image used to sit inside a
1px border and now fills the box, so each logo is 2px taller and 7–9% wider (Lindberg 348 → 369px
at 1440). Their `sizes` come from `audit/image-widths.json`, so those seven entries were
re-measured in the built page at 390, 768, 1024 and 1440. The longer row is still a seamless loop:
- copy-to-copy drift is 0.000px from 390 to 2560 (a 10px flex gap injected as a control read
  3.333px);
- 1,464–2,122px of logos are still ahead of the band's right edge when it wraps;
- the track travels one period per 32s, about 50px/s at desktop (it was 47.6).

## Re-verified

| check | result |
|---|---|
| The frame | On all 21 copies at 390, 768, 1024, 1280, 1440 and 1920: border 0, radius 0, no shadow (was 1px, 32px and the glass shadow) |
| Ink | 0% of any logo clipped at any of the six widths (was 0.6–7.7%). Each image is redrawn at 4x its painted size and every inked pixel is tested against the box's clip. Every logo sits inside the band vertically |
| Screenshot test | The marquee as served against the same marquee with every logo's rim forced off: 0 pixels differ at all six widths (was 220–595) |
| Controls | A 12px radius with `overflow: hidden`, injected on the fixed build, reads 103–198 differing pixels and 0.2–7.7% clipped ink, so both tests can fail. The first control, a radius alone, was blind: that candidate also set `overflow: visible`, and current Chrome does not clip an `<img>` with `overflow: visible` to its radius. The shipped fix leaves `overflow` alone, and the control now forces both |
| Reduced motion | The stopped, hand-scrollable row at 390 and 1440: no rim, 0 clipped, 0 pixels differ |
| `sizes` | The 28 new widths (7 logos at 4 viewports) match the built page exactly |
| Scope | `system.css` +12 / −0. `index.html` differs only in the `sizes` of the 21 logo images, the other 43 pages only in the `system.css?v=` hash, and `search-index.json` only in its timestamp. 253 files before and after |
| Refs / text | 6,402 refs: 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | After the Pages build (`546764b`), the home page, `system.css`, the search index and `/products/designer-frames/` are byte-identical to the build. The probe on the live page at 390–1920: no rim, 0 clipped, 0 pixels differ; its control still read 198 |

# Revision 16 — the home quote section: his photograph, and the quote set with accents

> *"let's redesign this section too, I want to use the same enhanced photo of dr. jerry hyder in
> the first section we revised. And then put some flare in the text not just plain text in here
> that's too boring"*

"In Dr. Hyder's words" was a 511px background-removed cut-out of his source photo, its right
edge cutting through his arm, beside the quote in plain 17px body text.

**The photograph.** It now uses the approved edited portrait from revision 12: the existing
renditions, `data-edited`, no new image.
- **Desktop (1025px and up):** a panel on the right 45% of the section, full height, cropped on
  his face. Its left edge is masked into the band, so the band's own gradients show through. The
  doctor section above shows a wide shot with him on the left; this is a closer one on the right.
- **Phones and tablets:** a full-width band above the quote, its bottom masked into the band.
- **Where it sits:** a direct child of the section, not of the quote block. The block's blur-in
  reveal applies a transform and a filter, and either would make the block the photo's
  containing block mid-animation.
- **Removed:** the old cut-out rules (`system.css` section d). The three cut-out PNGs drop out of
  `dist/`.

**The type** (`system.css` §26):
- the quote in the display face, Space Grotesk 500, at 25–40px;
- an oversized opening mark: the display face's own “ at 120–176px in a teal-to-gold gradient,
  drawn by `::before`, so it is not text;
- "relationship" in gold Instrument Serif italic, the one new face. Only the home page requests
  it; every other page's font request is unchanged;
- gold-to-teal underlines under "30 unhurried minutes," and "42 years.", which draw in after the
  block reveals and stop short of the comma and the full stop;
- "big-box counter." held on one line (it broke at the hyphen on phones);
- the name under a 48px gradient rule.

**The words are unchanged.** Four phrases are wrapped in spans. Each span boundary sits on an
existing space or after the phrase's own punctuation, because `verify-text.mjs` reads every tag as
a space: "42 years</span>." would read "42 years .". The build asserts that each phrase occurs
once and that the tag-stripped text is identical, and stops otherwise.

**How it was designed.** Three rounds were prototyped in the browser on the old build, before any
source edit:
- The first mark was Instrument Serif's. It rendered small and split into a teal comma and a gold
  comma, because a block-level gradient spans the whole line. The display face's bolder “ with
  `width: fit-content` fixed both.
- A colour gradient over the photo's edge was replaced by a mask, because no flat colour matches
  the band's gradients.

## Re-verified

| check | result |
|---|---|
| Layout, desktop | At 1025, 1280, 1440, 1920 and 2560 the panel is 45% of the section, its full height (inside the section's 1px border) and flush right. The text column ends 44–79px before it and is centred vertically to the pixel. The section's padding is unchanged (106.56px at 1440) |
| Layout, phones | At 360, 390, 768 and 1024 the band sits at the section top at full width, and the text starts 18–34px below it |
| His face | Inside the panel, and clear of the mask's fade and of every text box, at all nine widths |
| Image | 1.06–1.39 file pixels per painted pixel at 1x (720w at 1440, 480w at 390), and 1.17 and 1.28 at 2x (1600w at 1440, 960w at 390). `sizes` names the painted width, because cover paints 546–1145px wide on desktop |
| Fonts | Space Grotesk for the quote and the mark. Instrument Serif italic is loaded for "relationship" |
| Contrast | Quote 11.3–11.8:1 mean and 7.6–8.6:1 worst. Underlined phrases 11.7–16.3:1 mean. Eyebrow 11.4–14.3:1. Name 11.5–15.0:1. "relationship" is gradient text, measured at its darker stop: 6.3–7.2:1 mean, 4.7–7.0:1 worst. A control painting the quote's own colour behind it read 1.23:1 |
| The probe itself | Two faults were fixed before these numbers were trusted. The name read 2.22:1 because its element box held the gold rule beside it; the backdrop is now captured from the text's own box. The panel also seemed to move 13px during the reveal, but it was the section moving as content above settled; measured against its section, the panel holds still |
| Reveal | The photo fades in (0 → 1) and settles from 106% scale without moving. Under reduced motion it is shown at once, and the underlines are drawn |
| Text | `verify-text`: **100.000% verbatim**. The quote's text in the DOM is identical |
| Scope | `index.html` changed in four places: the font request; the section tag and its new figure; the quote block's class and its removed figure; and the four spans. `system.css` +160 / −69, `tools/build.mjs` +85 / −43. The other 43 pages differ only in the `system.css?v=` hash, and three cut-out PNGs are removed. 6,405 refs: 0 blockers, 0 majors, 0 orphans |
| Live preview | After the Pages build (`0669c50`), the home page, `system.css`, two portrait files, the search index and `/our-doctor/` are byte-identical to the build, and the cut-out returns 404. The check on the live page at 1440 and 390 read the same layout, image, fonts and contrast, and its control read 1.23:1 |

**Found while checking, and left as it is.** Below 1200px, `scrollWidth` reports the page 8px
wider than the window. The cause is the full-bleed photo bands of revisions 13 and 14
(`calc(50% - 50vw)`): `100vw` includes a classic scrollbar.
- **Pre-existing:** the old build measures the same.
- **Not visible:** `body { overflow-x: hidden }` gives the window no horizontal scrollbar, and a
  real sideways wheel gesture does not move the page.
- **Control:** with that rule removed, a 15px scrollbar appears and the same gesture scrolls 8px.
- **Remaining effect:** only a script's `scrollTo` can shift it.

This is recorded in HANDOFF's known gaps.

# Revision 17 — the doctor section on seven more pages: his photograph as the background

> *"apply the full-width doctor photo to the other 7 pages"*

The home page's doctor section (revision 13) also runs on `/products/` and six `/services/` pages:
`/services/` itself, children's eye care, comprehensive eye exams, contact lens exams, emergency
eye care and medical eye care. These are the other uses of the component.

**The markup.** These pages build the component differently. They use `.row--split`, with the text
column first and the framed photo second; the home page has the photo first. The 16:9 photo has
him on the left, and a real person's photograph is not mirrored, so CSS moves the text to the right
column. The DOM order, and so the reading order, is unchanged.
- **The wrap moved:** `tools/build.mjs` used to add the `<picture>` with the 16:9 source in a
  home-only branch of `rewriteImages`. It is now added by `reshapeDoctor`, which sees the whole
  section, so every doctor section gets it. The home page's markup is byte-identical to before. A
  doctor section without the edited portrait stops the build.
- **Taller sections:** these sections hold more text, so cover paints the photo up to 2347px wide
  (measured). Their `<source>` declares `(max-width: 2360px) 2360px, 100vw`, and the home page keeps
  its own value. At 1.25x the old value would have picked the 2560 file for a 2925px paint; the new
  one picks the 3840.

**The layout** (`system.css` §24, where each shared rule names both markups):
- The text takes the right column at the home page's ratio, 1fr 1.05fr.
- The three stat tiles share one row. Stacked, they made the section 1583px tall at 1440, so cover
  drew him about 1.6 times the home page's size. In a row the section is 1077–1322px, against the
  home page's 972–1107px.
- The tiles get a darker tint behind them and 16px side padding.
- At 1025–1099px the photo sits at 30% instead of 27%, because his arm reached 9–17px under the
  first paragraph. The cost is up to 16px of his outer sleeve at the window's left edge at 1025.
- On phones the photo band comes first, as on the home page.

## Re-verified

| check | result |
|---|---|
| Scope | 250 files before and after. On the seven pages only the doctor section changed, and inside it only the `<picture>` wrap: the `<img>` keeps everything but its `sizes`, which becomes `100vw`. The home page is byte-identical apart from the `system.css?v=` hash. `system.css` +85 / −22, `tools/build.mjs` +35 / −9 |
| Layout, desktop | On the seven pages at 1025, 1050, 1075, 1099, 1100, 1280, 1440, 1920 and 2560, the photo covers the section edge to edge. His face is in view and touches no text, chip, tile or badge, and his figure reaches into no text box. Sections are 1077–1322px tall |
| Layout, phones | At 390, 768 and 1024 the photo band comes first at full width, and his face is clear of the badge and the text |
| Image | At least 1.0 file pixel per painted pixel at 1x on desktop (the 2560 file); 1.23–1.25 on phones; 1.31–1.39 at 1.25x |
| Contrast | At 1025, 1440 and 1920 on all seven pages, every text element is at least 6.07:1 mean, with a worst pixel of 4.93–5.64:1. The stat labels were the weakest at first: worst 3.58:1 at 1025, where a light patch of the photo showed through the 7%-white glass, now fixed by the darker tint. On the old framed layout they measured 4.43–4.56:1 mean and 4.10–4.15:1 worst. A control painting the first paragraph's own colour behind it read 1.00:1 |
| The probe itself | The figure model began as one rectangle, which flagged the eyebrow at 1025 where only his head is. It is now two boxes: his head, then his shoulders and arms. The overlap it still found under the paragraph was real, and the 30% position fixed it |
| Refs / text | 6,447 refs: 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | After the Pages build (`0a9fa26`), the home page, the seven pages, `system.css` and the wide photo are byte-identical to the build. The check on the live medical eye care, products and services pages at 1025, 1440 and 390 read the same. Contrast at 1440 was 6.16:1 mean and 5.64:1 worst, and the control read 1.00:1 |

# Revision 18 — wide screens: the layout grows with the window

> *"I want you to run spacing and padding fixes. I want the elements of the whole site to be
> responsive to all screen sizes. The problem is when it is viewed in a wider screen size, the
> elements are too compressed that it leaves a huge space/gap on the sides and in correlation to
> other elements."*

**Measured before.** On every page the content was 1100px wide whatever the window. That left this
much empty margin per side:

| window | margin per side |
|---|---|
| 1440 | 163px |
| 1920 | 403px |
| 2560 | 723px |

Nothing else grew either: type, gaps and section padding were all capped at their desktop values.

**The change** (`system.css` §27, one `min-width: 1441px` block, so the design as tuned at 1280–1440
cannot change). Above 1440 each value grows in a straight line from its 1440 value to a target at
2560, and stops there:

| value | 1440 → 2560 |
|---|---|
| container | 1180 → 1920px. Content is 1100px at 1440 (77% of the window), 1393 at 1920 (73%), 1783 at 2560 (70%) |
| side padding | 40 → 68px |
| section padding | 108–110 → 160px |
| grid gaps | 30 → 46px |
| `--ds-space` scale | ×1.33 |
| body text | 17 → 19.5px |
| other type | about ×1.15 |

Margins per side are now 256px at 1920 and 381px at 2560.

Along the way:
- **Tokens shadowed inside sections.** `layout.css` re-declares its spacing tokens and a 1200px
  `--ds-container-max` on EVERY section, so the `:root` values never reached inside one. They are
  declared again at section level. That also put the service pages' hero copy back in line with
  the sections below it: it had started 401px from the left at 1920 while the content below
  started at 256.
- **Reading measure.** The columns grow faster than the type (about ×1.6 against ×1.15). Without
  caps, 124 sections ran past 75 characters a line at 2560, up to 166, and 99 of them only because
  of this change. The caps are in `em`:
  - 35em for running text and FAQ answers;
  - 34em for ledes and 33em for `dc-lead`;
  - 30em for the large quotes.

  The probe measures each section's widest paragraph, as its characters divided by its lines.
  At 2560 that is now at most 74 in running text, 73 in ledes and 61 in quotes.

  Plain paragraphs get their cap at zero specificity, and where a cap already existed the new one
  is the smaller of the two, so nothing became wider.
- **Fixed layout boxes.** Three boxes that `layout.css` fixes in px keep the share of the container
  they had at 1440:
  - the "what we stand on" rows (`.bw-manifesto`);
  - the bio card (`.od-bio`);
  - the story timeline (`.bw-timeline`).
- **Wide components.** The designer-house logos, the home kids section's glass card (its frames
  stay clear, see below) and the home quote section's height grow with the window too.
- **Images.** `sizes` gains `(max-width: 1440px)` and `(max-width: 1920px)` buckets, from painted
  widths measured at 1920 and 2560 on all 44 pages (`audit/image-widths.json`, `sizesAttr` in
  `tools/build.mjs`). Up to 1440 the attribute selects exactly as before.

## Re-verified

| check | result |
|---|---|
| 1440 and below unchanged | All 44 pages at 1440, 1280 and 390 lay out identically to the old build, comparing every element's box (to 0.25px) and font size. A control that adds 1px of padding to the first visible `<h2>` in `<main>` is caught on every page and width it was run on (`/` and `/services/` at 1440 and 390). Twice before that the control was blind, for one reason: it nudged the page's first `<h2>`, which sits in the hidden search panel. Changing the nudge from a margin to padding, on a guess that the margin was collapsing, changed nothing; moving it to a visible heading fixed it. No source was edited or rebuilt between this run and the commit |
| Alignment | On all 44 pages at 1920 and 2560, and 12 of them at 1600, no section starts off the container's content edge. The service-page heroes used to |
| Line length | On all 44 pages at 1920 and 2560, and 12 of them at 1600, no section runs past 75 characters a line. Without the caps 124 did at 2560 and 32 at 1920 |
| Photo sections | The 8 doctor sections at 1920 and 2560 cover edge to edge, with his face and figure clear of the text and density at least 1. The quote section: panel 45%, face clear, density 1.1, quote contrast 7.8:1 worst. The kids section at 1600–2560: frames clear of the wider card by 155–377px, while a card stretched across the section reads as an overlap |
| Scope | 250 files before and after. 38 pages changed, and only in `<img>` `sizes` (204 tags, 43 images), each keeping its old values up to 1440. `search-index.json` differs only in its `generated` field. `system.css` is the old file plus §27 (+149 lines). `tools/build.mjs` +12 / −1. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | After the Pages build (`cc5cdce`), six files are byte-identical. The live home, medical eye care and our-doctor pages measure 1393px of content at 1920 and 1783px at 2560 (margins 256 and 381), with none misaligned and none over 75 characters. At 1440 and 390 they lay out identically to the old build |

**Found, not changed** (HANDOFF, known gaps):
- Eight photos are painted wider than their largest file, measured on 1× screens. Five are already
  stretched at 1440: three by 1.4–1.6×, one by 1.24× and one by 1.12×.
- 17 of 39 images have a 1440 `sizes` value smaller than the width they paint at 1440. The 390–1024
  values were not re-checked.
- 30 sections on 20 pages already ran past 75 characters a line at 1440, the longest at 134.

**Corrected after publishing.** The first version of this entry, pushed in `7c8fb5c`, had four
errors:
- it said 27 sections were over 75 at 1440 (that count skipped 3 sections it could not pair with
  a 2560 reading);
- it said the 1600 checks covered all pages (they covered 12);
- it blamed the first blind control on margin collapse;
- it gave the reading caps as estimated character counts, not measured ones.

Each figure above was then checked against the saved probe output.


# Revision 19 — the mega menus: a hover on the eyewear cards, and a way in that holds

> *"fix the hover effects in the eyewear megamenu"*

**Measured before.** A real pointer was driven through Chrome's DevTools protocol, so `:hover` was the browser's own.
The probes and their saved output are in `.tmp/session-cc24e987/menu/`.
- **The four eyewear cards had no hover at all.** `:hover` matched on each, and no property changed: background,
  border, shadow, transform and text colour all stayed the same. A control that injects a hover background is
  caught on every card.
  - Their lift and border lived in `reforge.css`, which the build no longer ships (`build.mjs`: "base.css and
    reforge.css are gone"). Nothing replaced them.
  - The Services menu's links do react: they turn teal and slide 4px.
- **The way into a panel crossed a dead band.** It was 26px with the header at rest and 19px with it stuck: the
  header's padding under the link, then the panel's 10px margin. In it, neither the item nor its panel is hovered,
  so the panel began to fade as soon as the pointer entered it.
  - Straight down at 1280x585, it dipped to 0–50% opacity. At about 40–50 px/s it closed.
  - Across a matrix of 612 paths (each trigger to every item, at 120, 450 and 900 px/s, at 1280, 1440 and 1920,
    with the header at rest and stuck), the old build closed the menu on 64 paths, opened the other menu on 42,
    and dipped below 90% on about 300.
- **Switching menus could re-open the old one.** Moving from Eyewear to Services and down into its panel landed on
  the closing Eyewear panel, which sits on top because it comes later in the page, and re-opened it. This
  happened on 33 of 72 runs in the old build.

**The change.** One block is inserted in `chrome.css` section 4 and one section in `site.js` (8b). Nothing is
removed.
1. **A strip under each mega link.** It is invisible, starts 2px below the link and reaches 48px down into the
   panel, 180px to each side.
   - It appears with the hover and stays until the panel has finished closing.
   - It starts 2px down because at the exact edge, hit-testing gave it the last pixel row of the earlier nav links
     (a click on the bottom row of "About Us" opened /services).
   - The panel paints over its lower part.
   - A click on the strip does nothing (`site.js`), as a click in that band did before.
   - Under reduced motion it goes with the panel at 200ms.
2. **Closing waits 200ms, then fades with a slow start** (ease-in). Opening keeps the site's quick ease.
3. **Switching to the other mega item removes the old panel and its strip at once.** `transition: none` cancels the
   running fade.
4. **Menu aim** (`site.js` 8b, mouse only). CSS cannot tell these paths from choosing another link:
   - the straight line from "Services" down to its right-hand columns crosses the "Eyewear" link;
   - a shallow path from "Eyewear" to its far-right card runs along "Insurance".

   A first version, CSS only, handed up to 19 such paths per screen size to the wrong menu, where the old build had
   reached Services.
   - **When it holds.** The pointer enters another nav link within 150ms of leaving an open menu, moving down (at
     least 1 in 16 of its sideways travel, measured over the last 200ms). The script then holds the open menu
     (`.is-held`) and keeps a crossed mega item shut (`.is-shut`).
   - **Turns.** A turn straight down is read over the last 8px of movement, so it registers while the pointer is
     still on the link it wants. This was found after the first publish: with only the 200ms window, 4 of 16 fast
     "drift onto the other link, then go down" paths opened the menu that had been left. A 50ms window was too
     jumpy: at 120 px/s it could hold two whole-pixel points 0px across and 1px down, and in 2 of 192 runs it read
     a slow graze as a turn.
   - **While it holds.** The hold runs for as long as the crossing does, over the links and down through the band.
     It is renewed on every move while the path still descends (over 200ms) and has not turned straight down (over
     its last 8px).
   - **When it ends.** On reaching the held menu, a turn straight down, a move along the nav, or a pause of 350ms.
     A plain move along the nav switches at once, as before.
   - **Two traps found in testing.**
     - The script must not read a panel to tell whether a menu is open: by the time it runs, CSS rule 3 has already
       cancelled that panel.
     - A link that was crossed while shut must never count as the menu that was left.
5. **The cards get a hover**, for the pointer and for keyboard focus alike. It is the site's own card hover
   (`--glass-bg-2`, a 45% teal edge), scaled down for a menu:
   - a brighter glass tile and a teal ring drawn as an inset shadow;
   - a soft drop shadow and a 3px lift, the lift removed under reduced motion;
   - the title in the nav's hover teal.

   Three details came from the checks:
   - **Contrast.** A first version washed the tile with 8% teal, which darkened it: the teal title fell to
     3.7–4.3:1. The brighter tile raises contrast instead.
   - **Bottom edge.** A 3px strip under a hovered card keeps the pointer on it. Without it, the lift pulled the
     card out from under a pointer on its bottom edge, flipping `:hover` 226 times on one sweep.
   - **Ring.** The ring is a shadow, so a resting card keeps its exact box.

   This is lighter than the page cards' 6px lift, large shadow and white sheen. Inside a menu the big shadow would
   spill past the panel's edge, and the sheen would wash out the small text under the pointer.

## Re-verified

Three independent checkers worked from their own probes, each with controls, against the first version. They found
the five defects described above, all fixed. Their probes were then re-run on this build. The numbers below are for
the final build, with the 8px turn window.

| check | result |
|---|---|
| Path matrix (612 paths, as above) | 606 clean, where the old build had 236: 204 of 204 at 1280 and at 1440, and 198 of 204 at 1920. None is worse than in the old build, and none ends in the other menu (old: 42). The 6 left at 1920 failed in the old build too. They are the shallowest Services targets, mostly at 120 px/s: 4 dim to 46–75% but stay open, and 2 close (Contact Lens Exams at 120 px/s, header at rest and stuck). At that speed the outcome varies from run to run: an in-page log of one such failure showed 352ms with no pointer event from the test driver, which the script read, as designed, as a pause |
| Choosing paths | Moving along the nav onto the other mega link with a downward drift, then straight down, at 2 speeds, with and without a pause, both directions, at 1280 and 1920: 16 of 16 open the intended menu. The old build got 1 of 8 wrong at 1280, and the first publish 4 of 16 |
| Services' right-hand columns, repeated | 8 targets × 3 speeds × header at rest and stuck × 2 runs (96 per size). At 1440, Services opens cleanly in 96 of 96; the old build managed 3 clean, 52 dipped, 19 ending in Eyewear and 22 with both closed. At 1920, Services opens in 90 (84 clean, 6 dipped), 4 close, and 2 end in Eyewear; the old build ended in Eyewear 37 times and closed 29. Both are the slowest, shallowest path (Emergency Eye Care at 120 px/s), the one whose logged failure showed a 352ms gap in the test driver's pointer events |
| Switching | Eyewear to Services and down, and the reverse, at 2 speeds, 3 sizes, header at rest and stuck (72 runs): none ends in the wrong menu. The old panel is gone the frame the new link is reached. The old build ended wrong in 33 |
| Card hover and keyboard focus | All 4 cards, at 1280, 1440 and 1920, by pointer and by keyboard (ArrowDown, then Tab): the brighter tile, the 45% teal ring, the 3px lift and the teal title. Keyboard focus adds a 3px outline at a 16px radius. Tabbing away closes the panel after 583ms, and Shift+Tab re-opens it |
| Contrast, measured on rendered pixels | Hovered or focused, at 1280 and 1920: titles 5.27–5.42:1 (5.27 at the worst pixel); descriptions 5.85–6.01:1 (4.72–5.23 at the worst pixel). The first version's titles read 3.73–4.25:1. A title painted in its own background colour reads 1.00:1 |
| Card bottom edge | A sweep along a card's bottom edge changes the hovered card twice (card, gap, card), as in the old build. The first version changed it 226 times. A slow drift along each card's bottom 1–4px rows keeps it hovered for 40 of 40 moves with 0 toggles; the first version toggled 25–35 times |
| Hit-testing | `elementFromPoint` grids over the header and the 60px below it: 9 widths from 1041 to 2560, header at rest and stuck, menus closed, open and just left (90 states).<br>• The bottom rows of the brand, all 7 nav links, search and Book behave as in the old build in every state.<br>• With a strip live, a real click on the last pixel row of About Us, Services or Insurance follows that link, as in the old build. A copy with the strip at the link's edge sends it to /services or /products, so the check can fail.<br>• With menus closed, the only differences come from where the page's scroll came to rest on that load (591 against 600; every box matches) |
| Leaving | Pointer away or up through the header: the panel reads closed after 546–596ms, where the old build took 335–384ms. The strip goes in the same frame, and nothing re-hovers |
| Reduced motion | The panel and the strip both close at 198ms, with no frame of a strip without its panel, so the vanished panel no longer re-opens. Hovered cards keep the tile with no lift |
| Narrow and mobile | At 1041px the strips stay inside the window (232–693 and 335–796 of 1026), and the page width does not change with a menu open. At 1040 and 390 there are no strips, and the burger menu opens and closes with Escape |
| Rest state | 98 elements (top bar, header, both panels) at 1280 and 1920, closed and open: 0 box and 0 paint differences from the old build. The cards gain `position: relative`, and transitions change. The open panel's pixels are identical but for 117–124 pixels, each within 4 of 765 colour units, on the hovered link's underline row |
| Scope | 250 files. 47 differ: the 44 pages only in their `chrome.css?v=` hash, `search-index.json` only in `generated`, `chrome.css` (+95 / −0) and `site.js` (+98 / −0). `src/` changes only in those two files. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | gh-pages `3dd048f`, from `1ca58e8`: 6 files byte-identical to the build. On the live site:<br>• **Choosing paths:** all 16 open the intended menu. The first publish (`c5c1cbc`) got 4 wrong, which is how the turn bug was found.<br>• **Path sample:** every target at 450 px/s, header at rest and stuck, at 1280 and 1920 (136 paths). 134 clean and 2 dip; none close or end in the wrong menu. The old build, on the same paths: 48 clean, 12 closed, 12 in the wrong menu.<br>• **Switching, header clicks and close time** (571–585ms) as on the local build |

**Trade-offs, measured** (HANDOFF, known gaps):
- After the pointer leaves, a panel takes about 0.55–0.6s to close (it was 0.34–0.40s).
- Leaving Eyewear sideways onto "Insurance" and then moving straight down onto the page within about half a second
  re-opens the panel. The old build did the same within 0.25s.
- With a menu open, a pointer that crosses another nav link while heading down keeps the open menu. To switch,
  move along the nav, turn straight down onto the link, or pause on it for 350ms.

**Found, not changed:**
- Escape does not close an open mega menu while focus is inside it, in either build.
- The global focus outline (#16B393) is about 2:1 against the light glass.
- At rest, the "Designer Frames" description is 4.46:1 on the glass panel (4.39 at its worst pixel). Hovering now
  raises it.
- At 1041px the header's nav row runs into the Book button.
- `scripts/site.js` has no `?v=` cache-buster, unlike the stylesheets, so a returning visitor can run the old
  script until their cache expires. The new CSS degrades without it.

---

# Revision 20 — internal page heroes: shorter, spread across the width, and a new photograph

> *"the hero section for internal pages need to be fixed, because in wide screen it looks awkward with a heavy text
> on the left and huge vacant realty space on the right. Generate a high resolution image too via higgsfield that we
> can use for internal page hero sections. make those sections shorter too and evenly spread out the text to balance
> the look"* (with a capture of `/services/medical-eye-care/` at about 1830px wide)

**Measured before.** The 43 internal pages open with one of six kinds of first section. Every page was measured at
1280x585, 1440x900, 1920x1080 and 2560x1440. The probes and their saved output are in `.tmp/session-cc24e987/hero/`.
- **The photo card** (`.ha-hero`: `/services/` and five service pages, the one in the capture).
  - The copy was capped at 44rem at the left of a full-bleed card. At 1920 it filled 37% of the card, with 945px of
    photograph to its right; at 2560, 28%, with 1460px.
  - The section was 988–1114px tall at 1280 and 1116–1330px at 1920.
  - Its four photographs are 1024px files, one 1600px, painted 1903px wide at 1920 and 2543px at 2560.
- **The framed-photo hero** (`.dc-hero`, 21 service pages).
  - The heading ran 4–9 lines in a half-width column, the photo floated beside it, and the three proof tiles wrapped
    one or two to a row: 1303–1730px tall at 1280–1440.
  - The badge on the photo (`.dc-chip`) had no surface: `layout.css` gives it no background, and its blur reads the
    undefined `--ds-glass-blur`, so its text sat straight on the photo.
- **The visit page** (`.ct-hero`): the copy in the left 45%, nothing to its right.
- **The four legal and statement pages:** the heading and lede in the left half of a plain band.
- **The other kinds** already pair their copy with a photo on the other side: the product pages, insurance and
  forms, and the doctor page.
- **Every internal page started its first section 95–160px below the header**, the site's section padding.

**The change** (`system.css` §28; `tools/build.mjs` `INNER_HERO` and `splitInnerHeroCopy`; `assets/generated-hf/`).
1. **One heading size for every internal hero**, about 26% below the site-wide h1. The home hero keeps its own.

   | window | 390 | 1280 | 1440 | 1920 | 2560 |
   |---|---|---|---|---|---|
   | before | 36 | 65.3 | 68 | 73.1 | 80 |
   | after | 36 | 44.8 | 50.4 | 55.4 | 62 |

2. **Every internal page's first section starts closer to the header**: 36–52px, up to 64px at 2560. The photo card
   starts 20–32px down.
3. **The photo card, from 1025px, has two blocks side by side, centred on each other.** The eyebrow and heading are
   on the left; the paragraph and the two calls to action are on the right.
   - `tools/build.mjs` wraps each block (`.ha-hero__lead`, `.ha-hero__side`). It stops if the copy is anything but
     eyebrow, heading, paragraph and calls to action, or if its tag-stripped text changes.
   - The wrappers came from the review. With the four children as separate grid items on shared rows, the heading
     column ended 168–224px above the buttons at 1025.
   - From 1025 to 1366px the paragraph block gets the wider column, since it is the taller block there.
4. **A new photograph for the six cards**, generated with Higgsfield (below). The scrim is even across the card from
   861px. The old one ran from 90% dark down to 18% because the right of the card was empty, and text now sits on both
   halves.
5. **The framed-photo hero, from 1025px:**
   - The heading runs across the top, set with `text-wrap: pretty`.
   - The paragraph(s) and buttons share the row below with the photo, which stretches to their height (240px at
     least).
   - The three proof tiles take one full-width row.
   - Above 1440 the copy column is the paragraph's own measure (35em), and the photo takes the rest. Before, the
     paragraph's 37rem cap left a 386px empty band before the photo at 2560.
   - The copy column's own boxes step aside (`display: contents`), so the markup is unchanged.
6. **Three fixes inside that hero, at every width:**
   - The photo badge gets the glass tiles' surface.
   - The proof tiles' small labels move from `--g-fg-faint` (3.04–3.11:1, in the old build too) to the secondary text
     colour (6.04–6.25:1).
   - `/services/adult-eye-exams/` gets a gap between its two paragraphs, which touched.
7. **The visit page, from 1025px:** the three facts stand as glass tiles in a right-hand column. Above 1440 the copy
   column is 36em, so the tiles start one gap after it.
8. **The legal and statement pages, from 1025px:** the eyebrow and heading on the left, the lede and effective date on
   the right. The heading pair is centred on the lede without a wrapper: the lede spans the pair's two rows, which
   share its extra height. `/search/` keeps its own layout.
9. **The product pages' photo badge** (`.tib-hero__chip`, six pages) is back where `layout.css` placed it, at the
   photo's foot. The generated glass block in `components.css` set `position: relative` at the same weight and loads
   later, so since the first build it sat at the top of the photo with 21px cut off by the frame, the same trap as the
   §23 badges.
10. **Below 1025px the stacked layouts are unchanged** apart from:
    - items 1, 2, 6 and 9;
    - the photo card's bottom spacing;
    - the new photograph.

**The photograph.** Made with Higgsfield Marketing Studio 2.5 Flare, text only, 21:9 at 4k: 3840x1648.
- **What it shows:** an eyewear gallery in low evening light: backlit oak shelving with rows of frames, teal walls,
  walnut drawers, a fitting table and two stools.
- **The rejected render:** the same prompt on Sunburst was as sharp, but busier, with an armchair and plants in the
  foreground under the heading.
- **Files:** the 21:9 frame at six widths, 960–3840, from 821px. Up to 820px, the square centre at five widths,
  480–1648, through `<picture>`, because a phone's card is taller than it is wide.
- **`sizes`:** each value is the largest painted width in its bucket under cover. It was measured on all six pages at
  every 4px from 320 to 2560, at three window heights, in phone and desktop-window modes.
- **It is a generated room, not the practice.**
  - All six source alts described the practice or a patient, so the alt now describes only what is shown (B3).
    `tools/build.mjs` stops if that alt ever matches the documentary or practice patterns.
  - It is stamped `data-generated`.
  - The first build's rule for generated images was "object studies only". This one is the operator's request, and
    follows the precedent of the generated room behind Dr. Hyder's portrait (revision 12).
- **Provenance, prompt, request ids and encoding:** `assets/generated-hf/README.md`.

## Re-verified

| check | result |
|---|---|
| Section height, 43 pages | **Photo cards:** 988–1114 → 409–481px at 1280x585, 1116–1330 → 495–596 at 1920, 1238–1504 → 531–596 at 2560 (−53 to −60%). **Framed photo:** 1303–1677 → 726–903 at 1280, 1243–1724 → 842–988 at 1920, 1379–1677 → 920–1082 at 2560 (−29 to −52%). **Visit page:** 914 → 516, 917 → 628, 1027 → 703. **Legal pages:** 441–565 → 294–349 at 1280, 576–646 → 366–433 at 1920. **The other 11:** −11 to −26%. Phones: −0 to −7%. The home page is unchanged |
| The photo cards' buttons at 1280x585 | All six above the fold: cards end at 475–547px, buttons at 427–505. The old build: 919–1044 |
| Balance of the photo card's two blocks | Height difference 3–72px at 1280 and 9–59 at 1366; at 1100, 58–127. Before the wrappers, the right column ran 168–224px past the heading at 1025 |
| Contrast, on rendered pixels | **Photo cards**, six pages at nine widths from 390 to 2560 (324 measurements), worst pixel: eyebrow 4.64:1, heading 5.91, gold highlight 3.8 (large text), paragraph 5.85, call link 7.84.<br>• At 861–1024, before the scrim was moved there, the highlight measured 2.55 and the paragraph 4.48; the old build's own photo measured 2.21 there.<br>• **Elsewhere**, worst pixel: framed-photo badge 9.16, product badge 13.5, visit-page tiles 14.2, legal ledes 4.98.<br>• **Control:** each element's own colour painted behind it collapses to 1:1 |
| Image selection | A fresh browser per case. From 600px up the file is never magnified (0.74–0.99x); at 1025 on a 1x screen it is the 1280 file. 3x phones magnify the 1648px crop up to 1.7x (its source limit), under a 74–90% scrim |
| Stacked layouts below 1025px | The old build with §28 injected matches the new build element for element inside the first section on all 43 pages at 390, 600, 768, 820, 900 and 1024: 258 of 258 identical (boxes, font sizes, opacity), so the copy wrappers move nothing. No horizontal overflow and no tap target smaller. The site's scroll parallax was neutralised in both: it scales framed photos that come within 100px of the window, and the shorter heroes bring them into range. Control: 1px on the hero's h1 is caught on every page |
| Keyboard and labels | Tab order through the first section identical on 5 pages at 1920 and 390, every stop visible, on top and showing its focus ring (control: a hidden link is caught). Image alts: only the six photo-card alts changed, all stamped `data-generated`. Headings: unchanged, one h1 on every page |
| Below the hero | Every element after the first section, measured from its bottom edge, against the old build: 263 of 264 page-sizes identical (44 pages × 1280x585, 1440x900, 1920x1080, 2560x1440, 390x844, 768x1024). The 264th is the home page's 8px overflow at 768, the same in both builds. Control: 1px on a visible h2 below the hero shifts 117–297 elements |
| Scope | 44 pages identical to the old build after folding the stylesheet hash, the six `<picture>` swaps and the six copy splits; `search-index.json` differs only by its timestamp; 11 new image files, none removed. Control: a one-character change is caught. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Live preview | gh-pages `78ac2c2`, built from `acf9769`. 8 files byte-identical to the build: four pages, `system.css` and three of the new images. On the live site:<br>• **Fold:** at 1280x585 the cards end at 475–547px and the buttons at 427–505.<br>• **Heights:** four pages at 1920 equal the local build.<br>• **Images:** the file each width and DPR loads is the same as locally.<br>• **Contrast:** six pages' heroes at 1280 and 1920 (46 measurements), worst pixel: eyebrow 5.24, heading 6.62, highlight 4.5, paragraphs 5.78 and up, proof labels 6.08, badges 9.64 and up. Nothing fails but the known gradient button |
| Independent review (first pass) | Four refuters on the first build.<br>• **Build and provenance:** ready. The build reproduces byte for byte from a clean copy, twice. All 11 images are byte-exact encodes of the logged render. Every §28 rule matches only its intended pages, and the home page is pixel-identical. It found stale `sizes` above 1024, the README's crop breakpoint and four comment slips.<br>• **Desktop:** publishable, every first section shorter (172 of 172). It reported:<br>&nbsp;&nbsp;– the legal pages still left-heavy;<br>&nbsp;&nbsp;– the heading column ending above the buttons at 1025–1366;<br>&nbsp;&nbsp;– a band before the visit page's tiles at 2240–2560;<br>&nbsp;&nbsp;– two-line headings leaving the top right empty;<br>&nbsp;&nbsp;– the photo's 300px floor overrunning short copy;<br>&nbsp;&nbsp;– the clipped product badge.<br>• All are fixed above. The other two did not finish: the session was interrupted. A second pass of three refuters on the final build was interrupted twice the same way. Its checks were run directly instead: the stacked-layout, keyboard, label and contrast rows above |

**Trade-offs, measured:**
- Between 1366 and 1367 the photo cards change height by up to 39px. The paragraph's wider column stops there:
  carried on to 1440 it made the cards taller there (up to 473px against 454).
- On the framed-photo pages at 1280x585 the buttons are still below the fold (611–766px, from 839–1213). Their
  headings run 2–3 lines across the full width, and the paragraphs are long.

**Found, not changed:**
- **Without JavaScript the reveal content is invisible.** `.reveal` is opacity 0 until `site.js` adds `.in-view`, so with scripts off, or before they run, the hero text on these pages is invisible in both builds. One side effect of this revision: from 1025px the framed-photo hero's copy (`display: contents`) now shows without the script, and no longer fades in with it.
- **The gradient "Book an Eye Exam" button** (`.btn-primary`, 226 on the site) puts white text on teal → bright teal
  → gold. Behind its label it measures 3.08:1 on average and 2.66 at the 95th percentile, the same in the old build.
- **The doctor page** (`/our-doctor/`) still leaves an empty area below the portrait at 1920–2560, smaller than before.
- **More hero lines start with a spaced hyphen** ("- designer frames"), a side effect of the new measures: 12 lines
  against 3, counted on the 43 pages at 1025, 1280, 1440, 1920 and 2560. The text's spaced hyphens are verbatim.

---

# Revision 21 — the eyewear pages: full-width close-ups, and the designer houses

> *"for hero images of inner pages under EYEWEAR, I want to revise all the heroes. I want hero images that are high
> resolution and close-up photos of designer brands. Use higgsfield to generate high quality photos and make sure the
> hero background images are full width … And then after updating the hero images on these internal pages, focus on
> the designer frames page and make sure to add a lot of designer frames and designer eyewears across the page, I
> want big brands featured in there with corresponding kick ass photo"* (with a capture of
> `/products/designer-frames/` at about 1890px wide)

**Measured before.** The probes and their saved output are in `.tmp/session-cc24e987/eyewear/`. The pages under
Eyewear are the hub `/products/` and the four in its menu. Each opened with the photo in a frame on the left and the
copy on the right:
- **The four product pages** (`.tib-hero`): the source's 1200x1586 portrait photos (a frame wall, a sunglass wall,
  a kids' wall, a contact-lens room) in a frame set at 5:6 and capped at 600px tall: 513x421 at 1280, 509x600 at
  1440, then wider than tall, 654x600 at 1920 and 847x600 at 2560.
- **The hub** (`.et-hero`): `hero-boutique`, a 1024px file, painted 501–835px wide.

**The change** (`system.css` §29; `tools/build.mjs` `EW_HERO`, `EW_HOUSES`, `EW_CARDS`, `EW_LOOKS`,
`reshapeEyewear`; `assets/generated-hf/ew-*`).
1. **The five heroes are dark, full-width close-ups.** The build adds `.ew-hero` and `.surface-dark` to the first
   section and swaps its photo for a generated 16:9 close-up through `<picture>`; `.surface-dark` gives the text,
   pills, call link and badge the site's existing dark variants.
   - **From 1200px** the photo is the section's background: full width, its box 16:9 tall and capped at the
     section's height, the eyewear at 57–96% of the window and the copy on the left. The copy column grows from 520px
     to 760px and ends at 45–51% of the window. A scrim in the page's own dark (`--ew-ink`, sampled from each photo's
     left 45%) sits under the text, and where the section is taller than the box (1200–1440) the box's foot fades
     into that dark.
   - **Below 1200px** the photo is a full-width band above the text: a 16:10 crop around the eyewear, 2:1 from 768px.
     The badge straddles the band's foot instead of covering the eyewear, and on the hub the eyebrow follows the band
     (`layout.css` had ordered it above).
   - The site's scroll parallax is overridden for these photos, since a background must not drift or grow.
   - `/eye-health/` and `/reviews/` use the same `.tib-hero` component and are unchanged.
2. **`/products/designer-frames/` gains a section of designer houses** after the hero, "Designer houses we carry":
   - Eight cards, four across from 821px and two below: Ray-Ban, Oliver Peoples, Lindberg, Persol, Tom Ford, Barton
     Perreira, Maui Jim and Costa, the source's own lists (the home page's seven logos and this page's five names).
   - Each card is a generated photograph in that house's design language, the house's own wordmark from the source's
     logo files made white (Barton Perreira, with no logo file, set in type), and one line on the house's style.
     The wordmarks' width-to-height ratios run from 1.7 to 11.5, so their heights scale by (2 / ratio)^0.35, between
     one height and one visual area, with a soft shadow for the thin ones.
   - Under the cards: *"Photographs are styled to each house's look, not product shots from the houses
     themselves."*
   - The copy is new and claims nothing the source does not: the eyebrow is the home page's heading, and the heading
     and lede restate the source's sentences ("These are the houses you will find on the wall", "measured to your
     face", "fitted and adjusted in house after your eye exam", the sunglasses page's polarized lenses).
3. **The two material cards** ("Acetate", "Titanium & rimless") swap the first build's fal studies (1200px) for
   generated close-ups (1600px). The third card, a photograph of the practice's wall, stays.
4. **The three looks** ("The Classics", "Bold Statement", "Featherlight") each get a photograph: above the text on a
   phone, beside it from 821px with the middle one's photo on the left and the title at display size.
5. **No source word changes.** The build stops if adding the look photographs changes the page's tag-stripped text,
   or if any count is off (5 heroes, 8 houses, 2 cards, 3 looks).

**The photographs.** 23 renders and 5 extensions, all Higgsfield Marketing Studio 2.5 at 4k, 2026-10-12.
- **The heroes:** each rendered at 21:9 on Flare and Sunburst; four Flare renders and one Sunburst were chosen. At
  1200–1440 the section is only 1.36–1.59 times wider than tall, and a cover-fitted 21:9 photo there put the frames'
  left temple under the paragraph at 1280 in a first build. So each chosen render was extended to 16:9 by Flare from a
  layout sketch, with its eyewear smaller and further right. The extension redraws the eyewear faithfully: aligned on
  it, scale within 0.3%, rotation under 0.1°, shift 1.7–8.1px. Pasting the approved render back left a visible block
  on one image, so the extensions are used as they came.
- **The houses** (3:4), **cards and looks** (4:3): Sunburst, text only.
- **No logos, no lettering, no real product.** Every prompt excluded them. The 18 renders used and the 5 extensions
  were checked zoomed in (hinges and temples at 3–4x). The hub render carried invented lettering inside a temple and
  was retouched before its extension; nothing else was legible.
- **Encoding:** heroes `-q 90` (at `-q 80` their dark gradients showed faint 16px blocks), the rest `-q 80`.
- **Provenance, every prompt, request ids, hashes and crops:** `assets/generated-hf/README.md`.
- **No longer used on the site:** the source's sunglass-wall, kids'-wall and contact-lens portrait photos (they were
  only in those heroes) and the first build's acetate study. The build's prune drops them from `dist/`; they stay in
  `assets/`. The frame-wall photo still serves `/eye-health/`, and `hero-boutique` five service pages.

## Re-verified

| check | result |
|---|---|
| Hero geometry, 5 pages × 1200–2560 | Copy column ends at 44.6–50.6% of the window; the photo box is the full section width at every width; the section is 1.36–1.59 times wider than tall at 1200–1440, where the box's foot leaves 86–193px of plain dark, and 1.89–2.56 at 1920–2560, where the box is the section |
| First screen, old → new | **1280x585:** hero 823–874 → 836–887px; the heading ends at 410–457 (was 379–426), above the fold; the first button at 733–852 (was 702–822), below it in both. **1440x900:** heading 437–544, button 820–880, both above the fold. **1920x1080:** hero 875–962 → 918–1005. **2560:** 942–1006 → 993–1120. **390 phones:** 11–16px shorter. The photo's box: about 510x420 → 1265x720 at 1280, 654x600 → 1905x1005 at 1920 |
| Contrast, on rendered pixels | **Heroes**, 5 pages at 7 sizes from 390 to 2560 (371 measurements), worst pixel: paragraphs and notes 8.0:1, call link 8.63, points 9.97, hub pills 12.38, badge 13.5, eyebrow 14.18, heading 15.34. Only the known gradient button is below 4.5 (2.61, as on unchanged pages). **Designer houses**, 5 sizes (65): fine print 5.14, card notes on photographs 5.54 and up. **Control:** each element's own colour painted behind it collapses to 1:1 |
| `sizes` against painted width | Every 8px from 320 to 2560 on `/products/designer-frames/` and every 24px on `/products/`, in a desktop window and in phone emulation to 1366: no image is ever declared narrower than it paints (heroes and bands 100vw; houses, looks and cards from the measured widths in `EW_SIZES`) |
| Links and reveals | Every link in the five heroes is on top at its centre at 1280x585 and 390. Scrolling each designer-house card to the centre reveals 8 of 8 at both sizes |
| Scope | 39 pages differ from the old build only in the stylesheet hash. On the five eyewear pages everything outside `<main>` is identical, and inside it only the hero changed, plus, on `/products/designer-frames/`, the added section, the two card images (that section is otherwise identical) and the looks. `system.css` only gains §29; all 56 of its selectors name a revision 21 class (control: the same check flags all 47 of §28's), and those classes appear only on the five pages. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |
| Build | Reproducible: two builds hash identically (all of `dist/` but the search index's timestamp) |
| Alts | Each of the 18 new alts was read against its image; one named a five-barrel hinge the render does not clearly show, and was corrected |
| Secrets | The staged diff and all 235 new or changed binary files scanned for the Higgsfield key, whole and in parts, and for key-shaped tokens: none. Controls: every check fires on planted copies |
| Live preview | gh-pages `c28145e`, built from `aadf9e9`; after the review fix, gh-pages `384f759` from `0466fed` (5 files byte-identical again: three eyewear pages, the home page and `system.css`; the live wordmarks measure as locally). For `c28145e`, 12 files byte-identical to the build: the five pages, `/eye-health/`, `system.css` and five of the new images. On the live site:<br>• **Images:** the hero never magnifies its file at 390@3x, 768@2x, 1100–1920@1x, 1440@2x or 2560 (0.75–1.00); house cards 0.72–0.95, looks 0.68–0.89.<br>• **Contrast:** the five heroes at 1280 and 1920 (106 measurements), worst pixel 8.0:1 and up; only the known gradient button is lower (2.61).<br>• **Links and reveals:** every hero link on top at 1280x585 and 390 on the hub and the designer-frames page; all 8 house cards reveal on scroll |
| Independent review | Three refuters on the published build (`wf_17cdb2af-054`), each re-running its own evidence: copy and claims against the source, edge widths (1024–2048 and two phones), and the code. No high findings; the brands, every new string's source support, 14 of the figures above, the regexes, the parallax override, stacking and the badge's right edge all held.<br>• **Acted on:** the widest wordmarks were too thin at equal area (Lindberg 11px tall at 821–1024): heights now scale by (2 / ratio)^0.35 (at 821–1024: Lindberg 13–15px, held to the card's width at 821; Tom Ford 19, Oliver Peoples 21), with a soft shadow, which also lifts the thin Maui Jim script off its photograph. Three comment and wording slips corrected: the photo box is 56.25vw tall (8px more than 16:9 of the section beside a scrollbar), the badge sits at the foot of the photo's box (123–224px above the section's foot at 1200–1440), and the old frame was wider than tall from 1920.<br>• **Left as found:** in a desktop window with a classic scrollbar, the badge sits 7.5px left of the text edge below 1200px (0 on phones); Barton Perreira's name is set in type because the source has no logo file for it; the house photographs are styled after each house's signature look under its real wordmark (see below) |

**Trade-offs, measured:**
- On desktop the heading sits 31–58px lower at 1280–1920, and 122px at 2560: the photo wants more room above the copy
  (72–120px). At 1280x585 it still ends above the fold.
- At 1200–1440 the bottom 86–193px of the hero is plain dark under the photo's faded foot, the price of keeping the
  eyewear clear of the text without scaling the photo to the section's height.
- The heroes are 16–146px taller at 2560.

**Found, not changed:**
- **The third material card's `sizes`.** The slot's measured values in `audit/image-widths.json` fall short of the
  painted width between 401 and 600px (by up to 120px) and at 1024. The two new cards carry their own; the practice's
  wall photograph keeps the old ones, as does the same slot on other pages.
- **Brands' rules.** The house cards show real wordmarks beside generated photographs that are, on purpose, styled
  after each house's best-known look (a bold black trapezoid acetate for Ray-Ban, Havana acetate with green lenses
  for Persol, mirrored polarized wraps for Maui Jim and Costa). They are nobody's product, and a line under the
  cards says so, but each reads as a lookalike of its house. The practice should confirm the houses it carries and
  their rules for showing their marks, or swap in official retailer imagery (`NOTICE.md`).
- **The gradient button** (`.btn-primary`), as before.

---

# Revision 22 — the About page hero: his photograph, full width

> *"update the about us page hero, I want the improved version of Dr. Hyder's photo utilized and made full width"*

**Measured before.** "About Us" is `/our-doctor/`. Its hero (`.od-hero`, the `.bw-founder` layout) already showed
the edited portrait (revision 12, `data-edited`), but framed beside the copy: copy on the left, the photo in a
rounded 4:5 frame on the right, 440x360 at 1280 and 561x560 at 1920, with an empty band under it at 1920–2560. On a
phone it was a rounded 16:10 card between the heading and the paragraph. The image was marked
`fetchpriority="high"` and `loading="lazy"` at once.

**The change** (`system.css` §30; `tools/build.mjs` `reshapeAboutHero`, `ABOUT_HERO`).
1. **From 1025px the photograph is the section's full-width background**, served through `<picture>`: the 16:9
   version of the same edited photograph that the doctor sections use (`dr-hyder-wide-hf*`: him in the left third,
   his likeness the checked one, face SSIM 0.905 against the original; no new image was made). The copy moves to
   the right column, as in the doctor sections: the photo has him on the left, and a real person's photograph is
   not mirrored. cover is anchored at 27% so he stays in the left column.
2. **A dark gradient behind the copy**, clear of him: measured at 1025–2560, his face sits at 19–34% of the width,
   his elbow reaches 39–48% and the copy starts at 50.6–51.6%. The gradient is clear to 36% and 86% dark by 49%. A
   first draft reached 84% only at 56%, and its gold eyebrow measured 4.19:1 at 2560 against the bright frame wall.
3. **The copy turns light there only:** white heading with "for 42 years" in the site's light gold, light
   paragraph, quote and signature, and the ghost button's dark variant.
4. **Below 1025px** the light band and the order stay (eyebrow, heading, photo, paragraph), and the portrait
   becomes a full-width band with no frame: 4:3 on phones, 2:1 from 768px, his face in the upper third. Its `sizes`
   is now 100vw.
5. **The image loads eagerly**: it is the page's first image.
6. **No word changes.** The build stops if the hero has no edited portrait, and checks it ran once.

## Re-verified

| check | result |
|---|---|
| First screen, old → new | **1280x585:** hero 904 → 917px, heading ends at 332 → 362 (above the fold), first button 799 → 829 (below it in both). **1440x900:** heading 349 → 384, button 816 → 851, both above the fold. **1920:** hero 1032 → 1068. **2560:** 1160 in both. **390:** hero 1184 → 1255, the band 354x221 → 390x293. The photograph: a 440x360 frame → the whole 1265x917 section at 1280, 561x560 → 1905x1068 at 1920 |
| Clearance | The copy starts 34px right of his elbow at 1025, 78px at 1100, 113 at 1280, 228 at 1920, 293 at 2560 |
| Contrast, on rendered pixels | 9 sizes from 390 to 2560 (81 measurements), worst pixel: heading 11.46:1, eyebrow 6.95, "for 42 years" 6.86 (large text), paragraph 8.07, quote 10.32, signature 7.6; on the light band below 1025, 5.67 and up. Only the known gradient button is lower (2.64, as everywhere). Control: each element's own colour behind it collapses to 1–1.5 |
| `sizes` against painted width | Every 8px from 1025 to 2560: the 16:9 file paints up to 1766px at 1025–1199 (cover scales it to the section's height), 1685 at 1200–1440, 1905 at 1441–1920, then 99.4vw; declared 1770, 1910, then 100vw, never short. Below 1025 the portrait paints 100vw |
| Image selection | Never magnified: 390@3x the portrait's 1280 file (0.91), 768@2x its 1600 (0.96), 1025 and 1280@1x the 1920 wide file (0.92, 0.85), 1440@2x the 3840 (0.88), 1920 and 2560@1x (0.99) |
| Links | Both hero buttons on top at their centres at 1025, 1280x585, 1920 and 390 |
| Scope | 43 pages differ from revision 21 only in the stylesheet hash; on `/our-doctor/` everything outside `<main>` and every other section is byte-identical, and the hero's text is identical, its markup differing only in the class, the `<picture>`/`<source>`, and the image's `sizes` and `loading`. `system.css` only gains §30, whose 24 selectors all name `.od-hero--wide`, a class on this one page. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** · build reproducible (two builds hash identically) |
| Live preview | gh-pages `fd8584e`, built from `9da8b7b`. `/our-doctor/`, the home page, `system.css` and two of the photo files byte-identical to the build. On the live page: contrast at 1280, 1920 and 390 (27 measurements), worst 5.67:1 apart from the known button; both hero links on top at 1280x585 and 390; the same files load as locally (390@3x the portrait's 1280, 1280 and 1920@1x the wide 1920) |

**Trade-offs, measured:** on desktop the heading sits 30–54px lower (the section now has 64–112px of padding
around the copy, for the photograph); on a phone the band is 72px taller than the old card. At 1025 the
gradient's edge reaches his outstretched elbow; his face stays clear at every width.

---

# Revision 23 — the About page timeline: room inside and between the cards

> *"the text in the box are too squeezed in, fix the spacing and padding"* (with a capture of the "How this
> practice started" timeline on `/our-doctor/`)

**Measured before.** The timeline (`.bw-timeline`, only on `/our-doctor/`) was a list in the source: `layout.css`
keeps its geometry, rows with vertical padding only and a 44px left gutter for a rail and dots that are not drawn.
`components.css` then gave each row a glass card's surface but kept its zero side padding, and its list-row hover
set the left padding to 8px. At 390, 1280 and 1920: text 1px from the card's left and right edges, 0px between
cards, 8–9px between title and paragraph, the cards 44px in from the section heading, and on hover the text moved
to 8px.

**The change** (`system.css` §31, CSS only): the unused gutter goes, so the cards line up with the heading; the
cards stand 12–20px apart; each gets 20–32px of padding top and bottom and 20–40px at the sides, held on hover;
10–14px under each title.

## Re-verified

| check | result |
|---|---|
| Spacing, 7 widths from 360 to 2560 | Text inset from the card edges: 21px on phones and at 768, 28 at 1040, 34 at 1280, 41 at 1920 and 2560 (left and right; 21–33 top and bottom). Gaps 12, 15, 18 and 20px. Title to paragraph 10–14px. Cards level with the heading (0px). With `:hover` forced, the left padding stays the same. The same probe on the old build reads 1px, 0px gaps, 8–9px, 44px and 8px on hover |
| Contrast | Paragraphs 5.86:1 and up, titles 14.7, eyebrow 5.98, heading 13.4, at 390, 1280 and 1920 |
| Scope | All 44 pages' HTML identical apart from the stylesheet hash; `system.css` gains §31 only (4 selectors, each naming `.bw-timeline`). Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** |

**Found, not changed:** the year labels ("1984", "42 years" ...) are gradient text, teal to deep teal to gold,
which the contrast probe cannot measure. Computed from the gradient's colours against the card (not measured on
pixels), they run from about 2.1:1 at the gold end to 5.5:1 at the deep teal, so their lighter parts fall under the
3:1 that large text needs. That is the site's gradient-text style, unchanged here.

---

# Revision 24 — the About page's "Who I am": the doctor sections' design

> *"make this section the same format and design as the enhanced Dr. Hyder full width sections we did before"*
> (with a capture of "Who I am, in plain terms" on `/our-doctor/`)

**Measured before.** The section (`.od-biosec`, the fourth on `/our-doctor/`) was a light band: the heading block,
then a glass card holding the edited portrait in a 340px frame on the left (340x419 at 1280, 340x421 at 1920, a
316x198 crop at 390) and his name, role, two paragraphs and two contact links on the right. The links sat 14px in
from the text: each starts with an empty 6px `.dot` that is never drawn, and its 8px gap.

**The change** (`system.css` §32; `tools/build.mjs` `reshapeAboutBio` and `ABOUT_BIO`, sharing
`widePortraitPicture` with the hero's step).
1. **The doctor sections' dark surface:** `.surface-dark` in place of the light `.et-band--warm` and its
   `.et-band--seam`, a white haze over the top 120px that would have shown on the dark band.
2. **From 1025px his 16:9 photograph covers the whole section**, through `<picture>`: the same `dr-hyder-wide-hf*`
   files as the doctor sections and the About hero; no new image was made. cover is anchored at 27%, so he stays
   on the left, and every line of text is in the right column over the About hero's gradient (clear to 36%, 86%
   by 49%). The columns and gap are the hero's: at 1280 the text starts at 652px, as on the home page's doctor
   section.
3. **The card goes** at every width (`display: contents`), and with it its glass highlight, which would otherwise
   spread over the whole section.
4. **Below 1025px:** the heading first, then the portrait as a full-width band (4:3 on phones, 2:1 from 768px,
   his face in the upper third), then his name and the text. The section is dark at every width, as the doctor
   sections are.
5. **The contact links line up with the text** (the undrawn dot is hidden), white, gold on hover.
6. **The paragraphs keep a reading measure below 1025px:** 35em, the site's running-text cap, which they already
   had from 1441px. At 1024 they went from 929px (about 115 characters a line) to 595px; the card's column had
   held them to 560px. At 1025–1440 the right column is narrower than 35em, so nothing changes there.
7. **No word changes.** The build stops if the section has no edited portrait, and checks it ran once.

## Re-verified

| check | result |
|---|---|
| Section, old → new | **1280:** 879 → 828px tall; the photo 340x419 → the whole 1265x826 section. **1920:** 970 → 1023; 340x421 → 1905x1021. **1024:** 833 → 1300; 340x446 → a 1024x512 band, the text now under it. **820:** 986 → 1155. **390:** 1224 → 1227; the photo 316x198 → 390x293 |
| Clearance | The text starts 59px right of his elbows at 1025, 79 at 1100, 133 at 1280, 160 at 1440, 228 at 1920 and 293 at 2560 (the text at 50.6–51.6% of the width, his face at 20–33%) |
| Contrast, on rendered pixels | 6 sizes from 390 to 2560 (54 measurements), worst pixel: eyebrow 10.62:1, heading 10.49, lede 10.49, name 11.63, role 7.09, paragraphs 7.9, contact links 10.51. Control: each element's own colour behind it collapses to 1–1.5 |
| `sizes` against painted width | Every 8px from 1025 to 2560: the 16:9 file paints up to 1567px at 1025–1199 (cover scales it to the section's height), 1579 at 1200–1440, 1905 at 1441–1920, then 99.4vw; declared 1600, 1910, then 100vw, never short. Below 1025 the portrait paints 100vw, declared 100vw |
| Image selection | 390@3x the portrait's 1280 file (0.91), 768@2x its 1600 (0.96), 1025 and 1280@1x the wide 1600 (0.97, 0.92), 1440@2x the 3840 (0.82), 1920 and 2560@1x (0.99). **1024@2x: 1.07**, the portrait's largest file (1920) stretched; the About hero and the home page's doctor section measure the same 1.07 there (HANDOFF, known gaps) |
| Links | Both contact links on top at their centres after a real scroll, at 1025x768, 1280x585, 1920x1080 and 390; white, and gold with `:hover` forced |
| Bleed | Below 1025 the band runs 7.5px past each side of an 820 or 1024 window with a scrollbar; the section clips it, and the page stays the window's width (8px wider with the section's `overflow: hidden` lifted, the control) |
| Scope | 43 pages differ from revision 23 only in the stylesheet hash. On `/our-doctor/` everything before and after the section is byte-identical, the section's text is identical, and its markup differs only in the class list, the `<picture>`/`<source>`, and the image's `sizes`. `system.css` only gains §32, whose 18 selectors all name `.od-biosec--wide`, on one element of one page. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** · build reproducible (two builds identical apart from the search index's build time) |
| Live preview | gh-pages `f32e810`, built from `6e42c18`. `/our-doctor/`, the home page, `system.css` and two of the photo files byte-identical to the build. On the live page: contrast at 1280x585, 1920 and 390 (27 measurements), worst pixel 7.09:1; both contact links on top at 1280x585 and 390; the same files load as locally (390@3x the portrait's 1280, 1280@1x the wide 1600, 1920@1x the wide 1920) |

**Trade-offs, measured:** the same photograph now appears twice on `/our-doctor/`, in the hero and here, since
the request was for this section to match those. On tablets the section is taller (1024: 833 → 1300px): the text
now runs under a full-width band instead of beside a 340px frame.

**Found, not changed:** the 16:9 photograph's left edge holds an out-of-focus grey pillar, 2.47% of its width
(measured: a sharp edge at x 95 of 3840). It is part of the approved image. The 27% crop hides it up to about 1376px
and again at 1440–1456. Elsewhere a strip of it shows at the window's left edge: 2–8px at 1392–1424, 15–23px at
1472–1680, 42 at 1800, then from about 1820, where the section is wider than 16:9 and nothing is cropped
sideways, 47 at 1920 and 63 at 2560. These widths are computed from the measured painted size, not counted on
pixels. The doctor sections and the About hero use the same file, so they show it wherever their crop is as small.
Cropping those 95px out of the wide file would remove it everywhere.

---

# Revision 25 — a photograph of its own service on every service page

> *"for the services page, can you make sure that each specific services page show's a hero image that represents
> or related to that speific service"*

**Measured before.** None of the 26 service pages had one. The 21 framed heroes (`.dc-hero`) showed one of three
source photographs: the exam room (`exam-room`, 1024 x 576) on 16 pages, the storefront on 3 (adult exams, pink eye,
senior exams) and the kids' frames still life on 2 (children's contact lenses, pediatric exams). The five photo cards
(`.ha-hero`: children's eye care, comprehensive exams, contact lens exams, emergency care, medical care) showed
revision 20's generated eyewear gallery. Many alts named what the photograph did not show: *"An Eye Trends exam room
in Clear Lake, set up for a dilated cataract evaluation"*, over the same exam room as fifteen other pages.

**The change** (`tools/build.mjs` `SVC_HERO` and `reshapeServiceHero`; no CSS changed).
1. **26 new photographs, one per page,** generated with Higgsfield Marketing Studio 2.5. Each shows the
   instruments, lenses or objects of its service: a phoropter for adult exams, an intraocular lens for cataract
   care, a retinal camera beside a retina photograph for diabetic exams, a visual field analyzer for glaucoma, an
   Amsler grid for macular degeneration, a corneal map for LASIK, a large scleral lens beside an ordinary one for
   specialty lenses, a teddy bear facing a picture chart for pediatric exams, and so on (the full list, prompts and
   requests are in `assets/generated-hf/README.md`).
2. **No people, hands or faces.** As with every generated image on the site, none can pass for Dr. Hyder, the
   staff or a patient. No writing either, and none is the practice's room or equipment.
3. **Shaped for each hero.** The framed photo is cover-cropped from 0.79:1 to 3.97:1 (measured on all 21 pages), so
   those are 16:9 with the subject compact in the middle. The cards carry text over the whole image, so those are
   21:9, evenly lit, with a square crop for phones.
4. **The alts describe the photographs** and claim nothing about the practice; the build stops if one does. Each was checked against its image by the reviewers.
5. `/services/` keeps revision 20's gallery: it is not one service.

## How the 26 were chosen

Each prompt was rendered on both Marketing Studio models (52 renders). One reviewer per page inspected both
renders at full size, in an overview and full-size crops, and chose one. A second reviewer then scanned the chosen
render in a grid of full-size crops, looking for a person, writing, or a warped or duplicated part.
- **Six were re-rendered with a tighter prompt:**
  - **Adult exams:** a blurred shape behind the exam chair read as the back of a seated person's head.
  - **Foreign-body removal:** pseudo-printing on the sterile pouches, and in the other render, swabs with extra heads.
  - **Senior exams:** the reading glasses had three arms.
  - **Specialty lenses:** the scleral lens read as a glass dish, with nothing to show its size.
  - **Gas-permeable lenses:** the first prompt gave the same picture as the scleral lens.
  - **Emergency care:** a bright steel trolley under the card's links. The gold "Book an Appointment" link fell to
    4.47:1 at its worst pixel at 1920 (8.89 over the old gallery); the re-render keeps the right half dark.
- **Three were edited:**
  - **LASIK:** a scratch-like streak on the corneal map was filled from its surroundings.
  - **Pediatric exams:** the teddy bear's stool had a fifth leg, now covered with the rug beside it.
  - **Foreign-body removal:** the tray was mirrored, so the swabs sit beside the badge instead of under it.
- **One is re-anchored:** diabetic exams at 60%, so tall frames keep the retina photograph.

## Re-verified

| check | result |
|---|---|
| Every page | 26 of 26 service pages show their own photograph, stamped `data-generated`; the build checks 21 framed + 5 cards, and `/services/` still shows the gallery |
| Contrast, on rendered pixels | The photo cards' text over the new photographs, 5 pages at 10 widths from 390 to 2560 (250 measurements): worst pixel 5.16:1 for the eyebrow, 5.37 the paragraph, 6.21 the links, 5.59 the heading and 4.35 its highlighted words (large text, 3:1). The badges on the framed photos: 8.91 and up (126 measurements on all 21 pages, then 42 and 12 more on the 9 whose photograph changed after that). Only the known gradient button is lower (2.62, as everywhere). Control: each element's own colour behind it collapses to 1:1 |
| `sizes` against painted width | The framed photos: every 8 px from 320 to 2560 on all 21 pages, in a desktop window and in phone emulation, 396 px at most up to 360, then 462, 540, 675, 711, 960 (768–1099), 825, 725, 715 and 38.8vw. The declared values are never short. The cards keep the gallery's measured values (the same box) |
| Image selection | No framed photo is magnified (390@3x the 1600 file at 0.81; 1024@2x the 1920 at 1.00; 1280@1x the 960; 2560@2x the 2560 at 0.78). The cards as before: 1280 and 1920@1x 0.99; the square crop at 390@3x 1.61, the known limit of a 1648 px crop, under a 74–90% scrim |
| Scope | No CSS changed, so every other page is byte-identical. On the 26 service pages everything outside the hero is byte-identical, the hero's text is identical, and only its `<img>` (and on the cards its `<source>`) changed. `dist` gains the 202 shipped renditions; the 26 masters stay in `assets/generated-hf/`. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** · build reproducible (two builds identical apart from the search index's build time) |
| Live preview | gh-pages `03b0ffa`, built from `78204fc`. Ten files byte-identical to the build: three service pages, `/services/`, the home page and five of the new photographs. On the live pages: contrast at 390, 1280x585, 1920 and 2560 on emergency care and pink eye (56 measurements, worst pixel 5.0:1 apart from the known button); the same files load as locally |

**Found, not changed:** the framed hero's badge sits over the photograph's lower left. Measured on all 21 pages,
it covers 6–27% of the frame on desktop and 3–14% from 600 to 1024px. On phones up to 414px it spans the frame
over its lower half: 16–47% of the frame, and up to 67% at 320. It did the same over the old exam room. Each subject
is centred, and the badge still covers part of some, such as the foreign-body tray's gauze and magnifier. Moving the
badge below the photograph would show every picture whole (HANDOFF, known gaps).

---

# Revision 26 — phones: alignment, spacing and padding

> *"I need you to optimize the mobile. There are a lot of alignment, spacing and padding issues in mobile"*

**Measured before.** All 44 pages were captured at 390px in phone emulation (539 tiles of 1100px) and measured at
360, 390 and 414 for:
- text that misses the 18px gutter;
- card padding under 16px, or lopsided;
- a card mixing centred and left-aligned text;
- a stack of same-kind boxes at different widths;
- text blocks touching.

The probe flagged 292 / 106 / 208 / 152 / 948 of these (touching blocks include label/value pairs that touch by
design); no page scrolled sideways. Eight reviewers then read the captures, a group of pages each, and traced every
fault to its rule. The faults had two kinds of cause.

1. **Decorations that were never drawn, at every width.** `layout.css` keeps the source's geometry and strips its
   visuals (revision 2), and some properties that are not visual went with them: `list-style: none`, the `content`
   of a `::before` bullet, SVG fills, and small backgrounds no other file replaced. A script compared every
   decoration rule in the source pages' CSS with the built pages: 67 were not rendered at 1280. On a phone they
   showed as browser bullets 3–8px from the screen edge with the text 28px in, a solid black disc for the map's pin
   on 21 pages, empty white ovals in front of pill labels, icons floating 10–17px in from their text, review
   initials with no circle, and long reviews with no "See more" to say they open.
2. **Phone layout.** Stacks of buttons, tiles and chips each at its own width; the related-care cards' icon,
   title and link centred over left-aligned text (the phone tap-target rule set `align-items: center` on the whole
   card); a split row's eyebrow, heading and paragraphs run together as one paragraph below 1025px on seven pages;
   prose link underlines drawn 14px under the text, through the next line; 60px of padding on every band.

**The change** (`system.css` §33; `chrome.css` §12 and a new §13; no markup, text or image changed).

At every width (these change the desktop too):
1. **Lists** (`.dc-steps` and four kinds like it, `.od-facts`, `.ia-bring`): teal dots centred on the first line
   (±1.6px, measured), the browser's disc gone. The legal pages' table of contents loses its discs.
2. **The map** in the visit card: the source's teal pin and rings and soft roads.
3. **Dots:** the pill dot (an empty 34x20 oval) is a 7px dot; the topic chips', the designer houses', the home
   page's plans' and address's dots are drawn.
4. **Icon tiles** (§11's tile) for the insurance and patient-forms icons, the service heroes' caption chip, the
   guide and eyewear heroes' badge, and the home page's comparison arrows.
5. **Reviews:** initials in a teal circle; long reviews say "See more"; every quote is the quote colour (a short
   review's `<p>` was grey, a long one's `<span>` was not).
6. **Rules that met:** FAQ answers are text inside their card (`components.css` gave each a glass panel of its
   own, its text on the panel's left edge); the cataract page's dark band loses a grey-white 92x120px block in its
   corner (a light seam haze that took the dark edge's geometry); the legal pages' "On this page" label loses a
   glass chip; "Leave a review" loses the browser's grey button skin; bold text in a dark band takes the band's
   text colour (the practice name in "Read enough?" was dark ink on 5 pages); the service pages' second section
   puts its eyebrow under its icon, on the heading's edge (it sat 57px right of it on phones, 81px on desktop).
7. **Spacing:** a list followed by a paragraph gets 24px (it had 0); the parent-hub card no longer touches the
   related cards; two pages' visit lists lose a 40px indent and the underlines the other 19 pages' rows do not
   have; the About hero's quote gets its gold bar.
8. **Card hierarchy, in the cards fixed here:** the related-care and service cards (a mono eyebrow, display
   titles, teal links), the stat numbers of the service pages' stat band and of the doctor sections' tiles (the
   gradient the site's other stat numbers have; `components.css`'s list missed these two), the eyewear and guide
   cards (`.et-frame`: a mono label, a display title, a teal link on the text edge), the hero photos' caption
   chips (a display line over a small one), and the dark bands' NAP and "Who I am" links (gold, as the doctor
   sections' links are; they were plain white text).

Phones (below 641px unless noted):
9. **Below 1025px:** the seven split rows (five service pages, `/services/` and `/products/`) keep their eyebrow, heading and paragraphs as blocks, in the wrapped rows'
   order (eyebrow and heading, photo, text). `layout.css` flattens the text column with `display: contents` so a
   wrapper's children can be ordered around the photo; these columns have no wrapper.
10. **Rhythm and type:** 48px section padding (60); page headings 29–34px (36), so long ones lose a line or two.
11. **One width for a stack:** the buttons of a cluster, the service heroes' proof tiles, the credential and
    feature chips (the brand cloud and topic chips keep wrapping); the home page's plans wrap as chips.
12. **Alignment:** the related-care cards left-aligned (`chrome.css` §12 no longer centres them); the hub card's
    text on the cards' edge; the photo hero edge to edge, flush under the header, its text on the gutter; the call
    links on the copy's edge; "01" beside its icon (below 561px); the photo caption chip inside the frame; the
    legal table of contents on its label's edge.
13. **Spacing:** FAQ answers use the card's width; plain lists in prose sit inside the gutter with 10px between
    items (one page's inline 40px indent is overridden); photos no longer touch the text or each other; the doctor
    sections open with the portrait and put the stats 24px under the chips, full width; icon cards put the icon
    above the text; callout labels sit on their own line; the reviews footer, the About page's closing links and
    signature are columns; NAP rows are even, the phone row with its divider; legal paragraphs 20px apart, 48px
    before a heading; the empty search results row is gone; "Getting here" stands apart from the card above.
14. **The footer:** the practice across the top, then the three link columns and the visit block two by two (one
    column on a 56px pitch ran 1.4 screens); the legal links without an extra row gap.
15. **Search:** the field and its button share a row.

Up to 1200px:
16. **Links in running text.** `layout.css` keeps the source's tap rule (below 1201px every `.et-golink` and
    `tel:` link is a 44px inline-flex box; `chrome.css` §12 makes it 46px below 835px). In a paragraph that box
    made its line 17–18px taller and put the underline 12–14px under the text. Now such a link is inline, its hit
    area from padding that does not move the prose, and prose underlines are a real 2px underline under the
    glyphs, the same colour, gold on hover.

## How it was checked

Five reviewers compared the before and after captures page by page (44 pages), and a refuter re-measured each of
their medium and high findings on the live builds. They found what this revision had broken, and each was fixed:
- **The eye-doctor page's reviews footer (high):** a flex trick meant to hide the " · " between two links
  squeezed both links to 57px, one word a line.
- **The home page's plans:** in two columns, "Blue Cross Blue Shield" wrapped and its row grew.
- **The footer:** "two by two" first left Practice alone beside an empty cell.
- **The legal pages:** the 20px paragraph spacing took the last paragraph's 0 with it.
- **The red-eye page's list:** 10px item margins on top of the list's own 14px gap.

They also found older faults on phones, fixed in the same pass: the photo hero's pale strips, the macular page's
indented list, the doctor-band stat numbers at body size, the uneven dark-band NAP, the hub card's 6px jog,
"Getting here", the About links.

## Re-verified

| check | result |
|---|---|
| Fix checks | 20 numeric checks of the fixes, every instance on all 44 pages. **360, 390 and 414: 1,000 instances at each, all pass.** Among them: 57 list items with the dot centred on the first line (±1.6px), 69 related cards with every child on the inner edge (±1px), 110 prose links underlined under the text, 21 paragraphs with a link in running text a whole number of lines tall, 40 button clusters at one width, 79 chip and tile stacks at one width, 86 FAQ answers on their question's edge, 126 bands with 48px padding. **768 and 1024:** every check that applies passes (881). **1280:** the all-width checks pass (874). Before this revision, at 1024, 11 paragraphs had a stretched line and 32 links an underline 12–14px low |
| Layout probe, 360/390/414 | text off the gutter 292 → 178, card padding 106 → 93, mixed alignment in a card 208 → 24, ragged stacks 152 → 13, touching blocks 948 → 900. No page scrolls sideways, before or after. What remains was looked at: text inside pills measured against the page gutter, label and value pairs that touch by design, inline links counted as stacks, and the off-screen skip link (all 132 "edge" hits) |
| Page length at 390 | every page is shorter, none longer: 44 pages together 569,800 → 519,457px (8.8% less), from 5.9% on the visit page to 22.2% on the search page |
| Decorations | of the 67 source decorations the built pages did not render at 1280, 34 render now. The other 33 are left out on purpose: the eyebrow bars (removed on request) and the bars before the table-of-contents label, callout labels and the About kicker; the washes and accent bars of the hero and dark bands, which the redesign replaced; the About timeline's rail (revision 23); the table of contents' numbers; and 22 hairlines, frame borders and plates the redesign does its own way (among them the category cards' ring around their arrow) |
| Desktop | every element's box and computed style compared with revision 25 at 1280 and 1920 on all 44 pages, the two builds loaded one after the other in one tab: every difference is one of the all-width changes above (40 pages have at least one element whose box changed). Run with the two builds in two tabs at once, the diff also showed a container's margin as 0 in the background tab on 17-18 pages; its box was identical, and the sequential run shows nothing there |
| Headings | 29px at 360, 30.8 at 390, 32.7 at 414, 34 at 640, 36 from 641 (h1 on 7 page types). The toric page's hero heading went from 7 lines to 5 at 390 |
| The photo caption chip | 61px tall (81–109). Covers 11–25% of the frame at 360–414 (16–47%), 19–46% at 320 (29–67%), 2–9% at 600–1024 (3–14%), 5–13% at 1280–1920 (8–21%), measured on all 21 pages |
| Visual review | five reviewers and four refuters (above). 12 findings went to a refuter and all were real on the build the reviewers saw; three were already fixed when their refuter measured. The build that shipped fixes them, apart from a low remainder of one: the eye-doctor page's two review links now wrap as one line of text |
| Scope | No markup, text or image changed: the 44 HTML pages differ from revision 25 only in the stylesheet hash, `search-index.json` only in its build time, and only `system.css` and `chrome.css` changed. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** · build reproducible (two builds identical apart from the search index's build time, 559 of 560 files) |
| Live preview | gh-pages `035596a`, built from `21402f3`. Ten files byte-identical to the build: both changed stylesheets and eight pages (home, `/services/`, adult exams, `/products/`, the About page, reviews, terms, the visit page); the stylesheets differ from `dist` only by the preview's `/eyetrends-clearlake/` prefix. On the live pages at 390 the fix checks pass on five pages (113 instances) |

**Left as they were, on purpose:**
- **Text the source styled that is still body text.** Only the cards fixed here got their hierarchy back. The
  doctor's name and role in the doctor sections, NAP names, hero sub-paragraphs, the category cards' "Designer /
  Frames", collection titles, review names, the About hero's "Our doctor" kicker and its quote are still plain 17px
  text (64 checks at 390). They read as plain, not broken; restyling them changes the desktop (HANDOFF,
  known gaps).
- **"Leave a review" does nothing.** It is a `<button>` with no handler, in the source too. It now looks like the
  links beside it (HANDOFF).
- The About page's "Who I am" links were white by design in revision 24; they are gold now, as the doctor
  sections' links are, after both reviewers of that page read them as paragraph text.
- Smaller things the reviewers saw and that stay: the contact-lens page's closing button has 76px under it; go-links
  whose label wraps keep their arrow at the far right; one card's link reads just "Dry", as in the source.

---

# Revision 27 — phones: the reference build's padding and sizing

> *"I'm still not happy with how elements presents itself in mobile. Perhaps you can refer to this build
> https://mikko-creator.github.io/thehighway90-redesign/ and use the exact padding and sizing from that reference build
> and apply it to eye trends mobile."*

**What was taken.** The reference's phone sizes, read from its stylesheets (its `@media (max-width: 700px)` block and
the base rules it keeps there) and measured on its pages at 390px. Each value went to the element here that does the
same job. What moved is size and space: type sizes, line heights, padding, margins, gaps, minimum heights and corner
radii. Fonts, weights, letter-spacing, colours, the glass and every word stay this site's. It applies up to 700px, the
reference's own breakpoint. Wider screens are unchanged (measured, below).

**The change.** `system.css` gets a new §34 and `chrome.css` a new §14. §33's phone rules for the same things were
removed. No markup, text or image changed. Values are at 390px; "before" is revision 26, measured.

| Role | Here | The reference's value (at 390) | Before |
|---|---|---|---|
| Page gutter | `.container`, `.wrap` | `clamp(16px, 4vw, 44px)` (16) | 18 |
| Section padding | bands, booking band | 60 / 60 | 48 / 48 |
| Running text | body | `clamp(1rem, .96rem + .2vw, 1.0875rem)` on 1.65 (16.14) | 17 |
| Home heading | `.ethc-hero__h` | 2.6rem on .96 (41.6), .3em under | 36 on 1.06 |
| Page headings | 6 hero kinds, `.et-h1` | `clamp(1.9rem, 1.1rem + 4.4vw, …)` (34.76) | 30.8 on 1.08 |
| Section headings | `.et-h2`, booking `.h2` | `clamp(1.75rem, 1.2rem + 3.2vw, …)` on .98 (31.68), .5em under | 27 on 1.06 |
| Legal headings | `.bw-legal h2` | 1.7rem on .98 (27.2), .5em under | 27, 24px under |
| Sub-headings | `.et-h3`, numbered rows | `clamp(1.25rem, 1.05rem + .8vw, …)` on 1.04 (20) | 19 |
| Card titles | 10 kinds | 1.25rem on 1.04 (20), balanced | 18.5 on 1.25 |
| Eyebrows | `.et-eyebrow` | .8rem (12.8), 10px over a heading, 12px in a hero | 11.5, 18px (42 in a hero) |
| Section heads | `.row--head`, `.et-sec-head` | label, heading and intro 10px apart; 22px to what follows | 18 / 11 / 28–32 |
| Intros | `.et-lede`, `.dc-lead` | 1rem on 1.65 | 17 |
| Hero intros | 7 kinds | `clamp(1.02rem, .95rem + .35vw, 1.22rem)` on 1.5 (16.57); 12px under the heading, 18px between the blocks under it; the proof row 18px plus 14px | 17 on 1.65; 24 / 28 / 40 |
| Buttons | `.btn` | .95rem on 1, padded .92em 1.45em, at least 52px; rows 14px down and 16px across; in a hero they fill their row, elsewhere they are as wide as their label | 16.5px, 46px; every button full width |
| Pill links | `a.et-pill` | the small button: 44px, .7em 1.15em, .82rem | 46px, 13.5px |
| Links with an arrow | go-links, call links | .92rem, .45em to the arrow; the 44px tap area is padding that moves nothing | 15px in a 46px box |
| Chips | 8 kinds | .76rem, padded .75em at the sides, 22.9px tall; rows wrap 8px apart | 13.5px, 44px tall, some stacks one column |
| Info cards | 11 kinds | padded 22, 32px corners, 10px between parts (their own margins removed) | 18–20, 24px corners, 6–24px plus margins |
| Panels | `.ia-panel`, `.dc-visit`, `.od-close__info` | padded 22 / 20, 32px corners, 12px between parts | 18–24 |
| Reviews | `.et-review` | padded 26 / 24 / 24, 32px corners, 14px; the quote 1.02rem on 1.6 | 22, 24px corners |
| Photo cards | `.et-frame` | 32px corners; the text padded 20 / 22 / 24, 10px between parts | 24px corners, 24 all round |
| Photos in the column | 5 kinds | 32px corners | 0 |
| Tiles | hero proof, stats | padded 10 / 14, 14px corners, 4px between a 1.5rem figure and its .75rem label, 10px apart | 20 / 22, 16px, 30px figures |
| FAQ | `.dc-faq__item` | 14px apart, 22px corners; the question padded 20 / 22 at `clamp(1.02rem, .98rem + .3vw, 1.2rem)` on 1.3 with 18px to a 34px +/-; the answer 0 / 22 / 22 | 12 apart, 24px, 17.5px, 46px +/- |
| Form | `.book-form`, `.fld` | padded 18, 16px between fields, labels .86rem 6px over the field, fields at least 50px, padded 12 / 16, 14px corners | 26, 18px, 10px corners |
| Search field | `.search-form` | a 56px pill, padded 0 20, 1.1rem | 54px, 10px corners |
| Top strip | `.topbar` | 36px, .74rem | 68px |
| Header | `.site-head` | 8px above and below a 58px bar, 10px between its parts, the logo 132 wide, search 44; scrolled, the floating bar 6px from the top on the gutters, its contents 14px / 6px in | 79px, logo 139, gap 18 |
| Menu | `.mobile-nav` | 40px from the header to the first link; links `clamp(1.5rem, 1.1rem + 2vw, …)` on 1.05 (25.4), 10px above and below, 4px apart; groups 28px down, heads .95rem, links on a 40px pitch | 22px links, a 46–47px pitch |
| Footer | `.site-foot` | columns 26 / 18 apart, heads .95rem on 1 with 8px under, links in the running text's size on a 40px pitch; the legal row 36px under them, 22px inside its rule, 28px from the bottom, .88rem, links 18px apart and 40px tall | 14px links on a 46px pitch, 11.5px heads, gaps 36 / 20 |

**Where the reference's value met this site.**
- **Labels that wrap.** The reference sets eyebrows, chips and arrow links on a line of 1, and its labels never wrap.
  Many here do ("GAS-PERMEABLE CONTACT LENSES IN CLEAR LAKE"), and on 1 their two lines nearly touched. Eyebrows and
  arrow links are on 1.3. Chips are on 1.25 with .2344em above and below, so a one-line chip is still 22.9px tall.
- **Page headings on 1, not .96.** They run to four to seven lines here; on .96 a parenthesis or a descender met the
  next line's ascenders (1px of ink overlap on the pink-eye heading).
- **Growth past phones.** The reference's heading formulas keep growing into its own desktop sizes, and this site's
  sizes from 701px are smaller (a 36px page heading, a 27px section heading). So each formula stops at its 430px
  value, the widest phone. From 360 to 430px every size is the reference's, and up to 700px they hold. At 701px the
  home heading steps from 41.6 to 36px and section headings from 33 to 27px; page headings move by half a pixel.
- **Tap areas.** Arrow links keep a 44px tap area as padding that moves nothing, as prose links already did, so their
  spacing is the reference's. The footer's, the menu's and the legal row's links take the reference's 40px. Stacked
  arrow links (the About page's closing links, the services page's routes) are a list with a link per 40px or more,
  so their tap areas cannot overlap.
- **Layout kept from revision 26:** the service heroes' proof tiles in one column, the home hero's tiles in three
  columns, and the footer in two columns. "Eye Care Services" and "Visit" now take the width: at .95rem the services
  head is wider than half the row, and the visit block is the reference's contact and hours.
- **The header.** Search sits beside the menu button, both circles (44 and 46px), as in the reference. The open menu
  starts under the header, whose menu button stays visible as its close button (the menu used to cover it).
  Scrolled, the menu fills the screen under the floating bar, as the reference's does.
- **Search** puts its button under the field: beside it, the field's placeholder was cut short (on the search page
  and in the header's search panel).
- **What full-width buttons had hidden.** The visit page's two closing button rows carry the source's inline
  `justify-content: center`; with buttons at their own width they sat centred under left-aligned text. They now
  start on the text's edge.

## How it was checked

Six reviewers read the 390px captures of all 44 pages (130 contact sheets), with the reference's captures beside
them. They reported 91 findings. A refuter per reviewer re-measured each of the 39 medium and high ones on the build
the reviewers saw: 36 confirmed and 3 refuted (a logo marquee caught mid-scroll, a capture that ended early, a
heading that was right as it was). Of the 36:
- **31 are fixed:**
  - two-line eyebrows, chips and arrow links whose lines nearly touched (18);
  - the photo-card heroes of five service pages (and `/services/`): their buttons sit in the hero's second block, so
    they stayed label-width and their spacing stayed revision 26's (5);
  - notes under card grids that lost their top margin with the head rows' (3);
  - the visit page's centred buttons (2);
  - the About page's closing links, 4px apart, where a tap on one landed on the next (1);
  - the search placeholder (1);
  - a 42px hole in the guide hero (1).
- **4 stay:** long headings take more lines at the reference's size, and compound words break at their hyphens
  (HANDOFF, known gaps).
- **1 stays:** the home hero's text fades over the light right side of its photo. It did in revision 26 too, and it
  is a colour change, not a size.

The refuters also found faults the reviewers had missed, and each is fixed:
- the photo heroes' spacing;
- two-line stat labels;
- the header's search panel;
- the routes list, which a first fix would have run together.

## Re-verified

| check | result |
|---|---|
| Conformance | Every instance of 41 roles on all 44 pages against the reference's formula for the width: **5,335 of 5,335 at 360, 390 and 414**. The same check fails 5,050 of them on revision 26 at 390, so it can fire |
| Fix checks | Revision 26's 20 checks with revision 27's expectations, plus chip rows (21): **1,011 instances at each of 360, 390 and 414, all pass** |
| Taps | The centre of every line of every link, button and field on all 44 pages hits that element: **2,233–2,280 points at 360, 390 and 414, none taken by a neighbour**. On the reviewed build it caught the About page's closing links |
| The findings | Re-measured on the build that ships: wrapped eyebrows on a 16.6px pitch (12.8), photo hero buttons 358px wide (200), heading to intro 12px and intro to buttons 18px (24 / 40), notes 22px under their cards (0–8), the visit page's buttons on the text edge (79–83px in), the About links on a 40px pitch (19), the search placeholder fits (216px in 316), the guide hero's label 18px under its intro (42), photos in the gutter with square corners 0 (6) |
| Layout probe, 360/390/414 | Text off the gutter 178 → 178, mixed alignment in a card 24 → 27, ragged stacks 13 → 41, card padding 93 → 402, touching blocks 900 → 843. No page scrolls sideways (the 132 "edge" hits are the off-screen skip link, as before). The rises are the reference's own values: tiles padded 14px and caption chips 12px, against the probe's 16px threshold (349 hits; 29 more are badges whose centred text sits 1px closer at 360), and chip rows that wrap at their own widths where revision 26 stacked them in one column (27). The FAQ cards' 66 are gone. The 3 new mixed-alignment hits are a chip or a list item that happens to sit centred in its card |
| Page length at 390 | 44 pages together 519,457 → 488,589px (5.9% shorter), from 9.3% shorter (reviews) to 1.6% longer (search, whose button now sits under the field) |
| Desktop | Every element's box and computed style compared with revision 26 at 768, 1280 and 1920 on all 44 pages, one tab, the builds loaded one after the other: **no box and no property changed** (59 background-image URLs differ only by the two local servers' ports) |
| Scope | No markup, text or image changed: the 44 HTML pages differ from revision 26 only in the stylesheet hash, `search-index.json` only in its build time, and only `system.css` and `chrome.css` changed. Refs 0 blockers, 0 majors, 0 orphans · **100.000% verbatim** · two builds of the same source identical apart from the search index's build time |
| Live preview | gh-pages `72fc25b`, built from `2114895`. Ten files byte-identical to the build: both changed stylesheets and eight pages (home, `/services/`, dry eye, `/products/`, the About page, reviews, the visit page, search); the stylesheets differ from `dist` only by the preview's `/eyetrends-clearlake/` prefix. On the live pages at 390 the conformance check passes on five pages (831 instances) and the tap test on three (179 points) |

**Left as they were, on purpose:**
- **Long headings at the reference's size.** At 34.76px some hero headings take 4–7 lines at 390 (myopia 7, cataract
  6), and "co-management", "follow-up" and "Same-day" break at their hyphens. Text and markup are unchanged, so only
  a smaller size, a build step that keeps such words together, or shorter headings would change that.
- **The doctor sections' caption and eyebrow** sit 24px apart, the reference's column gap. One reviewer read them
  as close; the other refuter called the gap right.
- **Wide phones and small tablets** (431–700px) hold the 430px sizes, so a heading steps down at 701px.

---

# Revision 28 — phones: the UXCam mobile UX guide, applied

> *"I'm still not happy with the mobile view of this. Can you use this blog as reference? Review all the contents of
> this blog and apply what you learn in fixing the mobile view for eyetrends https://uxcam.com/blog/mobile-ux/"*

**The reference.** "Mobile UX Design: A Complete Guide for 2026" (UXCam; updated 22 April 2026), read in full: about
2,500 words and five figures. Its parts are what mobile UX is; why it matters; eight differences from desktop; ten
principles; the mistakes it sees most often; and how to check with data. Each rule that applies to a phone website
became a measurement. All 44 pages were measured before anything changed, at 390x664 (an iPhone in Safari) and
360x640 (a small Android). The changes apply up to 700px wide, the phone breakpoint since revision 27. Wider screens
are unchanged (measured, below), apart from two fixes for phones on their side.

**The change.**
- `system.css` §35, `chrome.css` §15 and edits to §14.
- `src/scripts/site.js` sections 5, 6, 7, 9 and 10.
- `tools/build.mjs`: the phone menu, the action bar, the form's attributes, "Leave a review", `data-long` and
  `data-solo`, the script hashes, and the phone logo's `<source>` up to 700px.
- A new `tools/hover-gate.mjs`.
- No word of the practice's changed.

| The guide says | Measured before | What changed |
|---|---|---|
| "Primary actions should fall in the bottom two-thirds of the screen where thumbs reach easily"; bottom navigation beats top | 34 of 44 pages had no booking or call button on the first screen at 390 (40 at 360). The only call link on a phone was the top strip's, in the corner a thumb reaches worst | An **action bar** at the bottom of the phone screen: **Call** (a secondary pill) and **Book an Eye Exam** (the primary button). It steps aside while half of one of the page's own primary buttons is on screen, while the booking form shows, while a field has the keyboard up, and while search or the menu is open. At load it waits out the hero's 0.7s reveal before deciding |
| "Critical content must fit above the fold" | The top strip and header took 111px of a 664px screen. Page headings ran to 7 lines | The top strip is gone on phones (its call link is the bar's Call), so content starts at 75px. The 20 page headings over 80 characters are 30px (34.76): 5 lines at most from 360px |
| "One primary action per screen. Secondary actions clearly secondary" | No screen held two primary buttons | Still none with the bar. In the service heroes, the three facts under the Book and Call buttons are a plain list instead of glass tiles shaped like those buttons |
| Tap targets "at least 44pt ... 48dp" | 1,299 of the links, buttons and fields were under 48px at 390 (985 under 44; 1,255 at 360). Footer, legal and menu links were 40px, search 44, the menu button 46, the hero call links 32 (their padding past the link's line took no taps) | Every link, button and field that stands alone has a 48px tap area. Links inside running text keep a hit area the height of their own line. With 14px of padding, a link on one line took taps meant for the link above: a third of "Seniors" opened "macular degeneration" |
| "Tiny text: below 14pt is hard to read" | 1,353 pieces of text in 39 kinds at 11.5–13.76px. The faint grey was 3.05:1 | No text under 14px. Spaced capitals wrap no more than before: eyebrows and mono labels at `.14em` (`.2em`), stat labels at `.05em` (`.1em`). The faint grey is #5A7279 on phones (4.9:1), and "yrs" is solid instead of gradient |
| Mega menus "usually don't translate to mobile"; "no third-level navigation"; "hamburger menus ... hurt discoverability" | The menu listed all 38 links: 2.8 screens at 390, 5.3 on its side | The seven main links and Book; Services and Eyewear show their pages behind a chevron button. One screen at 390, 1.8 on its side. The menu button says **Menu** (Close while open). The current page and its section are teal |
| "Respect the back button" | Back with the menu or search open left the page | Back closes the menu or the search panel, which share one history entry. Closing either by its button leaves no extra step. A menu link or a search goes, and one Back returns |
| "Unfamiliar affordances create friction"; dead clicks, "taps on elements that aren't interactive" | 336 pill-shaped things were not links. "Leave a review" was a button that did nothing | Chips that are not links are lists, each with its dot, tick or icon, in the running text's colour: feature tags, ticked points, insurance plans, the home hero's services, the designer frames page's houses. Links that look like chips stay buttons. Kept, because they read as labels: badges and captions printed on photos, reviewer initials, the home logo strip. "Leave a review" opens the practice's Google reviews (the source's own link on three pages) |
| "Hover states don't exist on mobile" | 312 hover selectors, none limited to devices that hover. A tap left 63 of 75 sampled elements in their hover look | `tools/hover-gate.mjs` puts every hover style behind `@media (hover: hover)` as the build writes the stylesheets. Taps leave 0 of 75 changed. With a mouse, hover is unchanged (below) |
| "Use appropriate keyboards ... Offer autofill"; errors that say "what went wrong ... and what to do next"; never reject valid input; "Save state generously" | No autofill hints, and no messages: an empty form went straight to the not-connected note | **Autofill hints:** name, phone and email carry them, with a Next key.<br>**Messages:** a missing name or phone, a number under 7 digits or an incomplete email gets a message under its field saying what to do, and the first problem takes the focus. Any format with 7 or more digits passes (+44 20 7946 0958 does).<br>**Saved progress:** what is typed is kept for the tab and put back on any page |
| Portrait first, landscape "a special case" | On its side, the top strip and header took 122–144px (up to 35% of the screen). From 701 to 1040px the open menu covered the header, close button included | **On short screens on their side:** no top strip, and no bar on phones under 700px wide.<br>**Open menu:** the header stays over it at every width the menu button shows.<br>**601–700px wide** (phones on their side) get the phone logo; the desktop one was squeezed to an unreadable 4px tagline |

**Already right, left alone:**
- no pop-ups or permission prompts;
- pull-to-refresh works (`overscroll-behavior` is `auto`);
- no page scrolls sideways;
- no field rejects valid input;
- fields are 16px or more, so iOS does not zoom on focus;
- the main content appears at 2.35–2.6s on a mid-range phone over slow 4G (live preview).

**Not done, and why:**
- **Offline caching.** A caching service worker could serve old pages while the preview changes, and the phone number
  and address are in every page's HTML.
- **Analytics or session replay.** The site ships no tracking, by design.

Both are the practice's call.

**What the review changed.** Four reviewers read the 390px captures of all 44 pages (133 contact sheets plus the
first and a mid-page screen of each) against the guide, and checked their findings on the served build. They reported
36 findings, 12 of them medium or high. A refuter per group re-measured each medium or high one on the same build:
- three groups: 7 confirmed and 1 refuted (the hero facts, which the refuter read as stat cards);
- the fourth group's refuter was interrupted, so I re-measured its 4 findings myself, each with a control.

Fixed, with the evidence before and after:
- **Back-to-top** (high, three reviewers) sat over the open menu's Book button and over the form's fields and the
  FAQ toggles, and took their taps. On a phone it now shows only while the page is scrolled back up (and 1.5s
  after), never while the bar steps aside, and never over the menu.
- **The bar at load** covered a hero's primary button that opened in its band (the emergency page's Call), or
  showed and then left as the hero slid in: 5 of 8 pages flashed. Now 0 of 44 at 390 and at 360 (below).
- **Neighbouring links** in running text took each other's taps: 6 links on the visit page. Now 0.
- **Too faint:** "Read on Google" and the search panel's close (3.11 and 3.12:1), and "yrs" (2.85:1). Now 4.96 and
  4.98:1, with "yrs" in solid teal.
- **Search:** Back left the page, and its close button was 31x34px. Now Back closes it, and the button is 48x48.
- **Look-alikes:** the designer frames page's houses were five white pills that did nothing; they are a list now.
- **Wrapping and spacing:** stat labels wrapped more at 14px (34 against 28 at 390); with `.05em`, 30.
- **Lists and badges:** the lists that were chips, in the links' teal, looked like links. The home page's arrow
  badge looked like a button. Arrows on wrapped card labels sat up to 94px from their text.
- **Small phones on their side:** the bar made the header and bar 140px of a 360px screen.

**Left as they were, offered:**
- **The phone logo's faint box.** All four reviewers noticed it: the practice's lockup file carries a 33% white
  fill, which shows as a pale rectangle in the header. It predates this revision. Fixing it means re-exporting the
  logo.
- **Content and markup from the source:**
  - sibling pages draw the same step list with different bullets;
  - two pages use different icons for the same link;
  - "Reorder Contacts Online" links to the booking form;
  - "Read the guide" puts its arrow before the text;
  - the visit card's address is not a link;
  - opening hours can break inside a time ("6:30 / PM").
- **The gradient button.** Its white label measures about 2.7–3.1:1 site-wide (since revision 20). The bar now shows
  one on most phone screens. A darker gradient would change the brand's button everywhere.
- **Long section headings.** At the reference build's size, compound words still break at their hyphens.

## How it was checked

| check | result |
|---|---|
| The guide's probe: all 44 pages at 390x664, 360x640 and 412x780 | **Text under 14px:** 0 (1,353 at 390 before).<br>**Form fields under 16px:** 0.<br>**Tap targets under 48px:** 0 of 2,183 (before, 1,299 of the links, buttons and fields at 390, form labels left out both times).<br>**Taps a neighbour takes:** 0, both at each target's centre and on a 5x3 grid over each target's own words (the review's method; 6 links on the visit page on the reviewed build).<br>**Screens with two primary buttons:** 0 at all three sizes (a button counts once half of it is on screen under the header, the bar's own rule).<br>**Look-alikes:** only the kinds kept on purpose (82: reviewer initials, the map's place tag, the photos' caption badges, the doctor badge).<br>**Also:** no page scrolls sideways; pull-to-refresh is on.<br>**Controls:** each check has an element that it catches (11px text, a 20px link, a pill span, a 13px field, two primaries side by side) |
| First screen | The header ends at 75px (top strip and header: 111). After load, every page shows the bar or at least half of its own primary button: 44 of 44 at 390 and at 360. The bar never shows and then leaves at load: 0 of 44 at both sizes (5 of 8 sampled pages did on the reviewed build) |
| Behaviour, with real touch taps; revision 27 as the control | **Menu:** 12/12 at 390, 360 and 844x390. The control fails the label, the Close name and the length, then cannot continue.<br>**Search:** 10/10 at 390 and 360. Control: a 31x34 close button, and Back leaves the page.<br>**Form:** 14/14. Control: 4/14, the four checks that pass when there is no message at all.<br>**Back-to-top:** 7/7 at 390 and 360. The control fails 5.<br>**Hover:** a tap leaves 0 of 75 sampled elements in a hover look (63 of 75 on revision 27) |
| Text and contrast | **Two-line eyebrows:** 14 of 355 at 390 and 28 at 360, as on revision 27.<br>**Two-line stat labels:** 30 of 93 at 390 (28).<br>**Contrast:** "Read on Google" 4.96:1 (3.10), the search close 4.98 (3.12), "yrs" in solid teal 5.50, each measured against the pixels behind it. A control that paints the text's colour behind it reads 1.00 |
| Menu and landscape | **Menu:** one screen at 390 and 360 (2.8), 1.6–1.8 on its side (4.8–5.3).<br>**Back:** closes it.<br>**Header on its side:** 75–79px (111–144) |
| Desktop | **Style diff:** every element's box and computed style against revision 27 at 768, 1280 and 1920 on all 44 pages (1280 again on the final build, after two last phone-only fixes). No box changed size or place. One property differs: "Leave a review"'s `text-align` (a link now, a button before), pixel-identical at 1280.<br>**Mouse hover:** forced on 641 elements, identical to revision 27 (617 change on hover in both builds). The 7 elements that do not pair up are the page's last one (back-to-top) set against the new bar's hidden button.<br>**Touch:** forcing hover changes 0 elements (610 on revision 27) |
| The hover gate | 11 unit cases. All 312 hover selectors of the five stylesheets end up inside `(hover: hover)`, none outside, and their count is unchanged |
| Revision 27's role conformance | At 390 it fails only the roles this revision changed: long page headings, eyebrows, chips and their rows, pill links, the hero facts, tile labels, search, footer and legal links. Every other role still matches the reference build |
| Scope | **Pages:** the 44 equal revision 27's byte for byte once this revision's markup is folded back (the menu, the bar, the form's attributes, `data-long`, `data-solo`, "Leave a review", the logo's `<source>`, the hashes). A one-word control is caught.<br>**Files:** 510 of 560 identical (all images and fonts).<br>**Verification:** 0 blockers, 0 majors, 0 orphans; 100.000% verbatim.<br>**Reproducible:** two builds of the same source are identical apart from the search index's build time |
