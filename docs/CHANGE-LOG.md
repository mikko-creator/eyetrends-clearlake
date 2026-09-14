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
