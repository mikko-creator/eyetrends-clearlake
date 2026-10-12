# assets/generated-hf/ — images generated with Higgsfield for this rebuild

Files here are **wholly generated**: no photograph went in. That makes them different from
`assets/edited/` (real photographs edited by an image model), `assets/generated/` (the first
build's fal.ai object studies) and `assets/supplied/` (client photographs, resized only). In the
built pages they carry `data-generated="<model>"`.

## inner-hero-hf*.webp, inner-hero-crop-hf*.webp — the photo-card hero on six /services/ pages

| | |
|---|---|
| requested | operator, 2026-10-09: *"the hero section for internal pages need to be fixed, because in wide screen it looks awkward with a heavy text on the left and huge vacant realty space on the right. Generate a high resolution image too via higgsfield that we can use for internal page hero sections. make those sections shorter too and evenly spread out the text to balance the look"* |
| what it replaces | the four source photos the six `.ha-hero` cards showed: `hero-boutique` (1024 px wide), `exam-room` (1024), `kids-eyewear` (1024) and `optical-showroom-wide` (1600). The card is full-bleed, so they painted 1903 px wide at a 1920 window and 2543 px at 2560 |
| model | Higgsfield `marketing-studio/image/flare` (Marketing Studio 2.5 Flare), text only, `resolution 4k`, `aspect_ratio 21:9`, `quality high`, `enhance_prompt false`, request `96423ff0-21c6-41a3-a710-20a026f9a157`, 2026-10-09 |
| output | 3840 x 1648 PNG (sha256 `ae4e2c64e26bbfd8…`) |
| also rendered | the same prompt on Marketing Studio 2.5 Sunburst, request `a5be55a6-4d9b-4856-97b0-16e19afe0353`: equally sharp, but busier (an armchair, plants and a display case in the foreground under the heading) |
| why this one | the text now runs across the whole card, so the image has to work as a backdrop everywhere: Flare's render is even from edge to edge (one continuous shelf wall, the brightness spread evenly, the foreground softly out of focus) |

**Prompt** (verbatim):

> Wide cinematic photograph of the interior of an upscale, modern optometry practice and eyewear gallery in the early evening, seen straight on at eye level. A long wall of backlit light-oak shelving runs across the entire width of the frame, holding neat rows of designer eyeglass frames and sunglasses, each shelf edge glowing with a soft warm strip light. Deep teal painted walls and dark walnut cabinetry below the shelves, slim brushed-brass details, a low walnut fitting table with two upholstered stools in the middle distance, and a polished floor that quietly reflects the light.
>
> Low-key lighting: the room is calm, dim and moody, with warm golden highlights on the shelves and deep teal shadows everywhere else. The brightness is spread evenly from the left edge to the right edge, with no single bright spot, no window and no blown-out highlights, because text will be placed over the whole image. Gentle depth of field: the shelves and frames in the middle distance are crisp and detailed, the nearest foreground falls softly out of focus.
>
> Photorealistic architectural interior photography, full-frame camera, 35mm lens, natural colour, fine detail, very high resolution. No people, no text, no signage, no logos, no brand names, no price tags, no mirrors.

**It is not the Eye Trends office.** It is a generated room. The six source alts all described
the practice ("The Eye Trends optical practice interior in Clear Lake", "An Eye Trends exam room
in Clear Lake, …", "A child being fitted for glasses at Eye Trends in Clear Lake"), so the alt is
rewritten to describe only what is shown: *"An eyewear gallery in low evening light: rows of
eyeglass frames on backlit oak shelves above walnut drawers, with a fitting table and two
stools"*. `tools/build.mjs` stops if that alt ever matches the documentary or practice patterns.
The first build's policy for generated images was "object studies only, no premises". This image
is an explicit operator request, and follows the precedent of the generated room behind Dr.
Hyder's edited portrait (revision 12). If the practice would rather show its own rooms, a wide
photograph of the optical can replace it in the same slot.

| file | what |
|---|---|
| `inner-hero-hf-master.webp` | the full render, `cwebp -q 92 -m 6 -sharp_yuv -metadata none` (not shipped) |
| `inner-hero-hf.webp` (3840), `-2560`, `-1920`, `-1600`, `-1280`, `-960` | the 21:9 frame, from 821 px. `cwebp -q 80 -m 6 -sharp_yuv -metadata none -resize W 0` |
| `inner-hero-crop-hf.webp` (1648), `-1280`, `-960`, `-720`, `-480` | the square centre, x 1096–2744 (the shelves, the table and both stools), up to 820 px: on phones the card is taller than it is wide (up to about 630–650 px), where cover would paint the 21:9 frame over 2000 px wide to show its middle. `cwebp … -crop 1096 0 1648 1648 -resize W W` |

Used by `/services/` and five service pages (childrens-eye-care, comprehensive-eye-exams,
contact-lens-exams, emergency-eye-care, medical-eye-care), through `<picture>`
(`tools/build.mjs`, `INNER_HERO`). The `sizes` values name the painted width under
`object-fit: cover`, measured on all six pages. The layout around it is `system.css` §28.

## ew-*.webp — the eyewear pages (revision 21)

| | |
|---|---|
| requested | operator, 2026-10-12: *"for hero images of inner pages under EYEWEAR, I want to revise all the heroes. I want hero images that are high resolution and close-up photos of designer brands. Use higgsfield to generate high quality photos and make sure the hero background images are full width … And then after updating the hero images on these internal pages, focus on the designer frames page and make sure to add a lot of designer frames and designer eyewears across the page, I want big brands featured in there with corresponding kick ass photo"* |
| where | the heroes of `/products/` and the four pages in its menu (designer frames, sunglasses, kids' eyewear, contact lenses); on `/products/designer-frames/` a new section of eight designer houses, the two material cards of "Three ways a frame earns its place", and a photograph for each of the three looks |
| models | Higgsfield Marketing Studio 2.5: `marketing-studio/image/flare` and `…/sunburst`, text only unless noted, `resolution 4k`, `quality high`, `enhance_prompt false`, all on 2026-10-12 |
| what they show | eyewear on surfaces, no people. **No brand's markings and no real product**: every prompt asked for no logos, lettering, brand names or markings, and the renders used were checked zoomed in for invented lettering (below). The house cards' photographs are, on purpose, styled after each house's best-known look (a bold black trapezoid acetate for Ray-Ban, Havana acetate with green lenses for Persol, mirrored polarized wraps for Maui Jim and Costa) and sit beside the house's real wordmark, so they read as that house's style while being nobody's product; the page says so under the cards (see **The brands** below). They are not the Eye Trends optical either, and the alts say only what is shown; `tools/build.mjs` stops if one matches the documentary or practice patterns |

### The five heroes

Each hero was rendered twice at 21:9 (3840 x 1648), once on each model, with the eyewear in the right half
and the left half dark for the text. The one used:

| page | render | request | sha256 |
|---|---|---|---|
| `/products/designer-frames/` | Flare | `5e371fe7-1b5f-4570-8813-881494e71941` | `90365c796bdae5e3…` |
| `/products/sunglasses/` | Flare | `e03f37b9-5ccf-4533-87de-d70a08ad9c00` | `1ef189686eea008f…` |
| `/products/kids-eyewear/` | Flare | `b1f82f75-4a07-44af-85b0-d6b8ca4e1ecc` | `d7d902b11bbe7ca1…` |
| `/products/contact-lenses/` | Sunburst | `d0d17b43-e8ac-4653-9576-f0f89e6b5c4c` | `a916d2df73f2bd45…` |
| `/products/` | Flare, retouched (below) | `87be79a5-9c68-445c-ba27-ef197cb10f03` | `ffc799587574a821…` |

Not used: the other model's render of each (requests `b49d450a-1cdb-45cd-80d9-4955aad7ec42`,
`2b57e825-f80b-480a-8728-3a0e1a227a52`, `81fe5c4c-eeb3-4be9-8eb5-0a791f6e1659`,
`f6c7eb04-37eb-4407-8125-11074e6d61bb`, `3dd024aa-9cc5-4a3b-b37f-db12c9010211`).

**Why they are 16:9 and not 21:9.** The hero's copy column ends at 45–51% of the window. At 1200–1440 px the
section is only 1.36–1.59 times wider than tall (measured on the five pages), and a 21:9 photograph
cover-fitted there is scaled to the section's height: in a first build at 1280 x 585 the frames' left
temple ran under the ends of the paragraph's lines and their lower half sat below the window. So each render
was extended to 16:9 with its eyewear smaller and further right:

1. A layout sketch (3840 x 2160): the approved render scaled by f = 0.744–0.892 and placed so its eyewear
   spans x 0.57–0.96 of the canvas, centred on the height; outside it, the render's own edge pixels
   stretched outwards and blurred (48 px), as a hint that the backdrop and surface continue.
2. Flare, 16:9, 4k, with the sketch as its one reference image. Prompt (verbatim apart from the two
   bracketed parts): *"Extend this product photograph into a wider 16:9 frame. Keep [the eyewear] in the
   sharp area exactly as it is in the reference: the same object, the same size, the same position and
   angle, the same materials, lighting, highlights and reflections. Do not redraw, move or resize it.
   Replace the blurred area around it with a seamless, photorealistic continuation of the same scene:
   [the backdrop and the surface]. The whole left half of the frame stays calm, dark and empty, with no
   objects, because text will be placed over it. Consistent lighting and colour across the whole frame,
   the same camera and lens, photorealistic luxury eyewear product photography, very high resolution,
   natural colour, fine detail. No logos, no lettering, no text, no brand names or markings anywhere, no
   people, no hands, no extra eyewear or other objects."*
3. The extension kept the layout: aligned on the eyewear with SIFT, it differs from the placed render by
   scale 0.9990–1.0027, rotation under 0.1° and a shift of 1.7–8.1 px. It does redraw the eyewear (mean
   difference 8.7–14.5 levels per channel on the eyewear), faithfully: the same hinges, rivets and
   tortoiseshell pattern, slightly crisper. Pasting the approved render back was tried and dropped: on the
   designer-frames image the render's own table fell into shadow on its left while the extension lit it,
   and the pasted rectangle showed as a dark block. So the extension is used as it came, and its eyewear
   was checked for lettering again.

| page | extension | request | sha256 |
|---|---|---|---|
| `/products/designer-frames/` | Flare 16:9 | `39253aa4-917c-4b1b-a161-d4ea6a2b1fcb` | `8e3800ee32f1f446…` |
| `/products/sunglasses/` | Flare 16:9 | `758fc8a7-33f2-45da-b405-eeb85674f0e0` | `7db975476e9e1599…` |
| `/products/kids-eyewear/` | Flare 16:9 | `40a9487f-ccef-4b52-aa4f-ef482b549e16` | `f6ef3dd37fa7fc57…` |
| `/products/contact-lenses/` | Flare 16:9 | `9fd73011-aabf-4fcb-a570-e8e1d1455ad0` | `45310a15119a9ae3…` |
| `/products/` | Flare 16:9 | `4b82fb06-e381-4d09-b694-04623a90f094` | `ec9f3efbfe120ceb…` |

The hero prompts, before the shared lines below: designer frames, *"A single pair of luxury designer
eyeglasses in rich amber tortoiseshell acetate with fine gold metal temples, resting half-open at a slight
three-quarter angle on a dark polished walnut surface, close up. Dramatic low-key studio lighting: a soft
warm key light from the right sculpting the curves of the acetate, a thin teal rim light along the top of
the frame, a deep teal-black background."*; sunglasses, *"A pair of luxury designer sunglasses with a slim
gold metal frame and warm brown gradient lenses, resting folded on dark polished stone, close up. Low
golden-hour sunlight from the right glints across the lenses and the gold, long soft shadows, a deep
charcoal-teal background."*; kids' eyewear, *"Two pairs of small children's eyeglasses in glossy bright
acetate, one cherry red and one sunny yellow, one resting on the other, close up on a smooth deep-teal
surface. Bright, playful but premium studio light from the right with crisp reflections on the acetate, a
deep teal background."*; contact lenses, *"A single clear soft contact lens resting on a glossy dark surface
beside its open lens case, with a few tiny water droplets catching the light, extreme macro close up. Cool
teal and soft white studio light from the right, the lens edge glowing, a deep teal-black background."*;
the hub, *"An elegant arrangement of three designer eyewear pieces layered on dark polished walnut, close
up: a pair of amber tortoiseshell acetate eyeglasses, a pair of glossy black acetate eyeglasses, and a pair
of gold metal sunglasses with green lenses. Dramatic warm low-key studio light from the right, a deep
teal-black background."* Each was followed by the layout line, *"Wide cinematic composition: the eyewear
sits in the right half of the frame, filling about a third of the height, sharply in focus; the whole left
half of the frame is calm, dark, empty backdrop with a soft gradient and no objects, because text will be
placed over it."*, and the shared line under **The designer houses** below.

**Lettering check and the one retouch.** The 18 renders used and the 5 extensions were inspected zoomed in
(the eyewear at 0.6–1x, hinges and temples at 3–4x); the five unused alternates were only seen on contact
sheets. The hub's 21:9 render carried invented lettering on the inside of the black
frame's temple; two small boxes there (x 2240–2525, y 655–735 and x 2780–2870, y 732–760) were blurred
(radius 6, feathered 6, sha256 of the result `d7e04991b9740f31…`), and that retouched render is the one the
hub's sketch was made from. Its extension is clean at those places. Elsewhere only engraved rivets, screw
heads and reflections, nothing legible.

| file | what |
|---|---|
| `ew-hero-<page>-hf-master.webp` | the 16:9 extension, `cwebp -q 92 -m 6 -sharp_yuv -metadata none` (not shipped) |
| `ew-hero-<page>-hf.webp` (3840), `-2560`, `-1920`, `-1600`, `-1280` | the hero from 1200 px. `-q 90` (the dark gradients showed faint 16 px blocks at `-q 80`), `-resize W 0` |
| `ew-hero-<page>-band-hf.webp`, `-1600`, `-1280`, `-960`, `-720`, `-480` | the band above the text below 1200 px: a 16:10 crop around the eyewear, x 1840–3840, y 455–1705 (2000 x 1250); for the hub, whose three-frame stack is taller, x 1472–3840, y 295–1775 (2368 x 1480). `-q 90 -crop …` |

`<page>` is `designer-frames`, `sunglasses`, `kids-eyewear`, `contact-lenses` or `eyewear` (the hub).

### The designer houses, the material cards and the looks

All Sunburst, text only. The houses are 3:4 (2480 x 3312), the cards and looks 4:3 (3312 x 2480). Every
prompt ends with the same line: *"Photorealistic luxury eyewear product photography, shot with a macro lens
on a medium-format camera, crisp detail on the hinges, rivets, acetate grain and lens edges, natural
colour, very high resolution. No logos, no lettering, no text, no brand names or markings anywhere on the
frames, lenses or background, no people, no hands, no faces."*

| file | request | sha256 | prompt (before the shared line) |
|---|---|---|---|
| `ew-brand-ray-ban-hf*` | `37d33086-8aca-485a-8fe1-8f9ea0deebcb` | `acb62d23786277c8…` | A pair of classic bold black acetate eyeglasses with a strong trapezoid shape and small silver rivets on the front corners, resting open on raw dark concrete, close up. Hard directional spotlight from the upper right, crisp highlights on the polished acetate, deep shadows, a near-black background. |
| `ew-brand-oliver-peoples-hf*` | `707d3537-4e7c-45f1-8174-858a215d8abf` | `1abfb515955ec1ce…` | A vintage-inspired round eyeglass frame in honey-blonde tortoiseshell acetate with thin gold wire temples and a delicate engraved gold bridge, resting on cream linen next to the edge of a dark walnut table, close up. Soft warm window light from the left, a muted warm background. |
| `ew-brand-lindberg-hf*` | `d67efb08-0e6f-499b-837a-55f95fda284f` | `54e24109e01eab51…` | A rimless titanium eyeglass frame with ultra-thin wire temples and lenses that float with no rim, resting open on smooth pale grey stone, close up. Crisp cool daylight from above, the thin titanium catching a fine line of light, minimal and clean, a soft pale grey background. |
| `ew-brand-persol-hf*` | `271e7a9e-0d4f-49d5-ab3c-84a5d216e701` | `3fa38a721a08d07f…` | A pair of sculpted Italian-style sunglasses in deep Havana tortoiseshell acetate with crystal green lenses, resting on a warm terracotta stone ledge, close up. Strong Mediterranean afternoon sunlight from the right, the lenses casting green light onto the stone, a warm ochre background. |
| `ew-brand-tom-ford-hf*` | `88dcd5ae-03d7-4495-97df-fcb3711d2c6a` | `c9f6ddf3ddc41150…` | A pair of bold glamorous black acetate eyeglasses with thick sculpted temples and small gold metal accents at the hinges, resting on black marble with fine gold veins, close up. Dramatic low-key light, glossy highlights, a deep black background. |
| `ew-brand-barton-perreira-hf*` | `dc5c058e-1bd3-4458-ad05-32803f44ba3c` | `158019a1514ebf0f…` | A pair of luxury hand-finished eyeglasses in deep emerald green acetate with brushed gold titanium temples, resting on dark green velvet, close up. Rich jewel-tone light from the side, the acetate glowing translucent green at its edges, a dark background. |
| `ew-brand-maui-jim-hf*` | `3f64f9cc-9853-43f9-8c36-d97d6c3a8541` | `6cd8f2b9d633fd5c…` | A pair of polarized wrap sunglasses with vivid blue mirror lenses and a matte black frame, resting on dark volcanic rock beside clear turquoise tropical water, close up. Bright high sun, sparkling reflections in the lenses, vivid colour. |
| `ew-brand-costa-hf*` | `d4ed599a-3199-409b-8846-5348cf553e99` | `d6a66699459fc7e4…` | A pair of rugged polarized sport sunglasses with green mirror lenses and a matte grey frame, resting on a weathered teak boat deck with a few drops of sea spray, close up. Bright sunlight glittering on blue ocean water in the soft-focus background. |
| `ew-card-acetate-hf*` | `153f4bdb-0370-4cf0-9135-77c5755f023e` | `8bcd93016477f73c…` | Macro close-up of a hand-polished tortoiseshell acetate eyeglass frame showing the deep layered grain of the acetate, a polished bevel and a five-barrel metal hinge, resting on dark walnut. Warm side light, shallow depth of field, a dark warm background. |
| `ew-card-titanium-hf*` | `d7b5e1d1-9f9a-4dc5-ac72-50c781e63614` | `68c1d30c6aaa1df5…` | Macro close-up of a semi-rimless titanium eyeglass frame in matte gunmetal, showing the thin brow bar, the fine nylon line holding the lens and a slim titanium temple, resting on pale grey stone. Cool soft light, shallow depth of field, a pale background. |
| `ew-look-classics-hf*` | `fc425592-74fc-427b-82b7-b387ba967940` | `d5a1d0bb3ac3bd86…` | Two quiet classic eyeglass frames side by side, close up: a slim black acetate frame and a thin round gold metal frame, resting on warm oatmeal linen. Soft natural window light, calm and timeless, a warm neutral background. |
| `ew-look-bold-hf*` | `78d9a0e0-aa0f-4b18-8104-bd78c29aad22` | `e43e3d660af3c80d…` | A bold oversized acetate eyeglass frame in a deep cobalt blue with thick sculpted rims, close up, resting on a smooth sand-coloured surface. Strong graphic studio light and a crisp shadow, saturated colour, a warm sand background. |
| `ew-look-featherlight-hf*` | `b7218359-2f9b-4d1d-a9b7-007b9610bb1a` | `662d64111c83eb7f…` | An ultra-light rimless titanium eyeglass frame with thin rose-gold temples, resting on a sheet of white handmade paper with a single soft white feather beside it, close up. Airy, bright, soft daylight, a pale warm background. |

Files: the houses at 1240 (the plain name), 960, 720, 540 and 360 px wide; the cards and looks at 1600
(plain), 1200, 800 and 400. `cwebp -q 80 -m 6 -sharp_yuv -metadata none -resize W 0`. No masters are kept
for these thirteen: they are shown at most 900 px wide, and the 1240/1600 files are the archive.

**The brands.** Each house card pairs a photograph in that house's design language with the house's own
wordmark: the logo files the source's home page already shows (`ray-ban`, `oliver-peoples`, `lindberg`,
`persol`, `tom-ford`, `maui-jim`, `costa` in `assets/img/`), made white on the page; Barton Perreira has no
logo file in the crawl, so its name is set in type. The photographs are **not** those houses' products, and
the page says so under the cards: *"Photographs are styled to each house's look, not product shots from the
houses themselves."* The eight houses are the source's own lists (the home page's seven logos under
"Designer houses we carry", and this page's five names). The practice should confirm the houses it carries
today; where a house supplies official imagery for retailers, that can replace a generated card in the same
slot.
