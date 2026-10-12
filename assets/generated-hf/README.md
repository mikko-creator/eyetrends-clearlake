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

## svc-*.webp — one photograph per service page (revision 25)

| | |
|---|---|
| requested | operator, 2026-10-12: *"for the services page, can you make sure that each specific services page show's a hero image that represents or related to that speific service"* |
| what it replaces | no service page had one. The 21 framed heroes (`.dc-hero`) showed `exam-room` (16 pages), `storefront` (3) or `kids-eyewear` (2). The five photo cards (`.ha-hero`) showed this folder's `inner-hero-hf` gallery, which `/services/` keeps. Many of the alts named what the photo did not show (*"An Eye Trends exam room in Clear Lake, set up for a dilated cataract evaluation"*) |
| models | Higgsfield Marketing Studio 2.5 `marketing-studio/image/flare` and `…/sunburst`, text only, `resolution 4k`, `quality high`, `enhance_prompt false`, all on 2026-10-12. Each prompt was rendered once on each model; the table names the one used |
| what they show | the instruments, lenses and objects of each service. **No people, no hands, no faces**, as with every generated image on the site, so that none can pass for the practice's doctor, its staff or a patient. **No writing**: every prompt asked for no text, letters, numbers, logos, labels or signage. **None is the practice's room or equipment** |
| shapes | the 21 framed heroes are 16:9 (3840 x 2160), with the subject compact in the middle. Measured on all 21 pages, the frame runs from 0.79:1 (1025 px) to 3.97:1 (2560 px), so cover keeps only the middle 44% of the width and 45% of the height in every case; a badge covers the lower left. The five photo cards are 21:9 (3840 x 1648) and evenly lit, because text runs over the whole card; their recognisable detail sits in the middle, where phones get a square crop |
| checked | each pair of renders by an independent reviewer: an overview plus at least four full-size crops of each (dials, screens, packaging, books, charts). Then each render chosen, by a second reviewer scanning it in a grid of full-size crops to find a disqualifying flaw (a person, writing, a warped or duplicated part). Six were re-rendered with a second prompt and three edited after that (below) |

**Prompts.** Each prompt is the page's subject (in the table), a blank line, then one of two shared paragraphs, verbatim.

Framed heroes (16:9): *"Photorealistic editorial still-life photograph for the website of an upscale optometry practice. Calm,
premium mood: deep teal and warm oak tones with soft brushed-brass accents, soft natural light from the upper left,
gentle shadows, shot on a full-frame camera with an 85mm lens, shallow depth of field. Composition: the subject is
compact and sits in the centre of the frame, filling roughly the middle third of the width and of the height; softly
blurred surroundings on every side, so the picture can be cropped to a square or to a wide strip; the lower left
quarter of the frame is plain, calm background with nothing important in it. Natural colour, crisp fine detail on
the subject, very high resolution. No people, no hands, no faces, no text, no letters, no numbers, no logos, no
brand names, no labels, no signage, no watermarks."*

Photo cards (21:9): *"Wide cinematic photograph, seen straight on at eye level, photorealistic interior photography of
an upscale optometry practice, full-frame camera, 35mm lens, gentle depth of field. Low-key, even lighting: the
brightness is spread evenly from the left edge to the right edge, with no single bright spot, no window and no
blown-out highlights, because text will be placed over the whole image. Deep teal walls and shadows, warm golden
highlights, walnut and light oak, slim brushed-brass details. The clearest, most recognisable detail sits in the
central third of the frame. Natural colour, fine detail, very high resolution. No people, no hands, no faces, no
text, no letters, no numbers, no logos, no brand names, no signage, no screens showing writing."*

| page | frame | render used | request | sha256 | the other render (not used) | subject (the prompt before the shared style) |
|---|---|---|---|---|---|---|
| `/services/adult-eye-exams/` | 16:9 | Flare (second prompt) | `2825e8d9-0f08-41b4-b64a-c8f889b5cf73` | `a0fec8ef920aeff0…` | `03715324-f63f-40f3-9b01-ea82a0df4bfb` | A modern phoropter, the refraction instrument an optometrist swings in front of a patient: a symmetrical matte black and silver device with one round eyepiece window on each side and plain dials marked only with fine tick lines, mounted on its articulated arm, seen from the patient side at a slight angle. Behind it, far out of focus, an empty exam room: a black exam chair with nobody in it, a plain teal wall and the soft glow of a vision chart screen so blurred that no characters can be made out. No people, figures, busts or sculptures anywhere in the room. |
| `/services/back-to-school-eye-exams/` | 16:9 | Flare | `5069ea74-a6f7-4f9a-b34d-48596cfc9f81` | `14449be22d170f18…` | `84d51165-2c84-4a38-ba99-ff9d5065b781` | A child's pair of eyeglasses with a bright teal frame, folded and resting on top of a small stack of new school notebooks with plain covers, beside a closed pencil case, a few coloured pencils and a red apple, on a light oak desk. Behind, softly out of focus, a small school backpack hanging on a chair. |
| `/services/cataract-co-management/` | 16:9 | Flare | `4c856637-376c-49f8-a6cf-b1c71eea979d` | `9bfef4177ba7c438…` | `0c343173-6ade-402a-b37e-4bce776fdef6` | Macro photograph of a single clear intraocular lens implant, the artificial lens placed in the eye during cataract surgery: a small round clear acrylic optic about the size of a lentil with two thin, curved C-shaped haptic arms, resting on a dark teal glass surface with a soft reflection and a delicate highlight on the optic. Behind it, far out of focus, a calm exam room. |
| `/services/childrens-contact-lenses/` | 16:9 | Sunburst | `ad99d30a-1033-47d5-86e6-17029450bdcf` | `c6bbbe6cfc70adcc…` | `4816a4e1-87dd-436e-a373-ee01d0b1e9cf` | A small, cheerful contact lens case with one coral and one teal screw cap, the teal side open with a single clear soft contact lens resting in the solution, next to a small round tabletop mirror with a playful yellow frame and a short plain unlabeled bottle of lens solution, on a light oak bathroom counter in bright, soft morning light. |
| `/services/diabetic-eye-exams/` | 16:9 | Flare | `106457e7-c590-49e8-8320-048ef841d913` | `8f069049717cff6e…` | `8f518fda-3fca-42e5-a700-62cb87adc6b9` | A retinal fundus camera, a compact white medical imaging instrument with a chin rest, a forehead bar and a large round lens, on a white table; beside it a monitor shows one full-screen colour photograph of a healthy human retina: an orange-red background, a bright pale yellow optic disc and fine branching red blood vessels, with no text, numbers or interface on the screen. Dim, calm exam room. |
| `/services/dry-eye-treatment/` | 16:9 | Sunburst | `a73c84a7-6e24-46e8-9d5a-602ef2b5d735` | `368b2a613c5cdb96…` | `86297698-62e0-46ab-bf6e-537e13813abb` | A small white eye drop bottle with its cap off lying on a glossy teal ceramic tray beside a soft, padded heated eye mask in pale grey fabric; a few clear droplets on the tray catch the light like tiny lenses. Soft daylight, calm and soothing. |
| `/services/flashes-floaters/` | 16:9 | Sunburst | `7a993783-2c70-4114-a576-f78d3ae75460` | `da11aa5079436251…` | `224e1fd6-83da-4b25-84be-2ea78362ac9a` | A handheld condensing lens used by eye doctors to look at the retina: a thick, round, highly polished glass lens in a black metal ring, standing upright on a dark walnut surface and catching bright rim highlights. Behind it, softly out of focus, a monitor glows with the warm orange image of a retina. |
| `/services/foreign-body-removal/` | 16:9 | Flare, mirrored (second prompt) | `f855238f-447e-47e4-97c8-92a8b75740da` | `044094b1684e483e…` | `cf7ba653-4896-4e2f-9098-fc4bb7864b1d` | A small stainless steel tray on a trolley holding a few sterile supplies laid out neatly with space between them: one clear sealed pouch containing two cotton-tipped applicators lying side by side, a single small plastic vial of sterile saline, a folded white gauze pad and a small round magnifier; all packaging plain, without any printing. Behind the tray, softly out of focus, a slit lamp microscope casting its thin, bright vertical beam of light, in an empty teal room. |
| `/services/gas-permeable-contacts/` | 16:9 | Flare (second prompt) | `05d782c0-88a9-45c8-9a2f-78269c1ff189` | `314431ccb5f8bc97…` | `c3eb737e-75e5-4007-aee8-784b9b692367` | A pair of rigid gas-permeable contact lenses, small, firm and perfectly round with a faint pale blue tint, resting concave side up inside an open flat contact lens case whose two screw lids lie beside it, on a light grey marble surface with a soft daylight reflection; a short plain unlabeled bottle of lens solution stands softly out of focus behind. |
| `/services/glaucoma-management/` | 16:9 | Sunburst | `459c0563-fdd9-40a0-bbd1-a525f8ead9a9` | `08a4819c3cddad24…` | `09c60ee6-25f7-4334-8d2b-f19382241213` | The inside of a visual field analyzer used in glaucoma testing, seen from the patient's point of view: a smooth, white hemispherical bowl filling the frame, evenly and softly lit, with a tiny amber fixation light at its exact centre and a few faint pinpoints of light scattered across the bowl; the curved edge of the chin rest just visible at the bottom, soft and out of focus. |
| `/services/lasik-co-management/` | 16:9 | Flare, retouched | `a6c28bb9-a891-47a0-a97e-3c85b8f09928` | `cab62744f69dafa6…` | `36b4c170-e9c7-42ba-ad5a-41a75f4947ef` | A monitor in a dim exam room displays a colourful corneal topography map: a round map of the cornea in smooth concentric bands of deep blue, green, yellow, orange and red, with no text, numbers or scale anywhere on the screen. In the foreground, out of focus, a pair of everyday eyeglasses folded and set down on a light oak desk. |
| `/services/macular-degeneration/` | 16:9 | Sunburst | `a37177dc-2d79-489e-899e-8d4ecb8408cb` | `0a98f49877f7aae1…` | `306dd13e-4c47-4374-aafd-b0a4bf290a63` | An Amsler grid card, the test for macular degeneration: a square white card printed with an even grid of fine black lines and a single small black dot at its centre, standing on a small walnut easel on a desk beside a round brass handheld magnifier and a pair of reading glasses, in warm, soft light. |
| `/services/multifocal-contacts/` | 16:9 | Sunburst | `88464180-c528-4fd9-a87c-3de3d11dc93b` | `6cc271d8c09c4c8a…` | `ad8e866a-8737-423f-a19d-fdff569b6c03` | Macro photograph of a single soft multifocal contact lens resting on a glossy surface; under raking light its optical zones show as faint concentric rings. In the softly blurred background, an open book on a table and, further away, a bright window: near and far. |
| `/services/myopia-management/` | 16:9 | Flare | `e7ff947e-650b-42fd-a41d-f1fa7a7f89d5` | `0ed52dc37e4a57cd…` | `f398df9a-f75e-4557-9868-22e6948ea511` | A child's pair of eyeglasses with round lenses in a soft teal frame resting on a light oak windowsill beside a small closed storybook and a little potted plant; through the window, softly out of focus, a bright green park and a playground in daylight. |
| `/services/pediatric-eye-exams/` | 16:9 | Sunburst, retouched | `63d8c483-03e4-4c7f-92a7-e42f4315aec6` | `a9ebc812f3ef5642…` | `0c66339e-7f79-4b11-b31d-33e464420871` | A friendly corner of a children's eye exam room: a plush teddy bear sitting on a small child-sized booster seat in front of a vision chart made only of simple picture symbols in black on white (a house, an apple, a circle and a square), no letters; soft, cheerful light, teal and light oak. |
| `/services/pink-eye-conjunctivitis/` | 16:9 | Sunburst | `73845a99-af27-440c-a07d-a70ad13dcdeb` | `1ded3cea18306f55…` | `e03370d2-0efe-431e-a555-e4cda7022e76` | A neat, clean care tray on a white bathroom counter: a small plain eye drop bottle, a box of soft tissues with one tissue pulled up, a folded fresh white washcloth and a plain pump bottle of hand sanitizer, all unlabeled; soft bright daylight, calm and hygienic. |
| `/services/red-eye-treatment/` | 16:9 | Flare | `76f225ee-d0a5-4bec-9f8b-45cd7dcab708` | `f75a869b2b593720…` | `f9db08ad-2657-4c70-9f9f-e2d110194024` | Close-up of a slit lamp microscope, the instrument an eye doctor uses to examine a red eye: its binocular eyepieces and illumination arm, with a thin vertical blade of warm white light falling across the chin rest, in a dim teal exam room; the light and the polished metal are crisp, everything around them soft. |
| `/services/same-day-contacts/` | 16:9 | Flare | `befcdcb4-b74e-4180-a2b4-d5842f6d84db` | `3097561062104ff4…` | `54a55a8e-eb5a-4598-b27c-a2efce5e413b` | An open drawer in a contact lens fitting cabinet, packed with neat rows of small trial contact lens blister packs standing on their edges, plain and without any printing; in front, one pack lies opened with its clear soft lens visible in the liquid. Warm oak and teal, soft light. |
| `/services/senior-eye-exams/` | 16:9 | Flare (second prompt) | `78cb895b-144f-499c-9599-b465de10748f` | `01aa55efb9026b22…` | `01791225-4778-4709-8acf-f0dfc9ea0fc6` | A pair of classic reading glasses with thin round gold wire frames lying neatly folded on an open hardback book, seen from slightly above: exactly two temples, both folded flat behind the lenses and crossing once, each ending in a small tortoiseshell tip; the book pages are plain blank cream paper. Beside the book, a cup of tea on a saucer, on a round walnut side table by a window in warm late-afternoon light. |
| `/services/specialty-contacts/` | 16:9 | Flare (second prompt) | `8287a78e-55ab-40dc-b1a8-554e4b75530f` | `d6c028f20db7c6b6…` | `8c3b1636-0dca-4a6c-94f8-2fcb9759893a` | Macro photograph on a glossy dark teal surface: a large scleral contact lens, a clear dome-shaped lens about the size of a small coin, sits on the tip of a small white silicone insertion plunger, filled with clear saline that catches the light; beside it, for scale, lies an ordinary soft contact lens, visibly much smaller, and an open white contact lens case with two round wells. Crisp detail on the lens rims, soft light. |
| `/services/toric-contacts/` | 16:9 | Flare | `fc5b49be-8081-41a7-af5c-ff638e463ae0` | `7046673218698f4d…` | `c9224296-3570-4877-8542-ee0344a6120c` | Macro photograph of a single soft toric contact lens resting on a glossy surface, with tiny engraved orientation marks visible near its lower edge; in the background, out-of-focus streaks of light stretched in one direction, like the blur that astigmatism causes. |
| `/services/childrens-eye-care/` | 21:9 | Flare | `7888cd10-9649-4123-915d-2df4eb17d708` | `7e0d900909acf26f…` | `c51d1f5a-beb3-4c83-8b84-667869c99b8d` | A playful children's eyewear and eye care corner: low light-oak shelves of small, colourful kids' eyeglass frames, a child-sized table with two tiny stools in the middle of the frame, a vision chart of simple picture symbols (shapes only, no letters) on a teal wall and a few soft toys on the shelves. |
| `/services/comprehensive-eye-exams/` | 21:9 | Flare | `ec190b22-d081-4170-82fb-b131c2e71771` | `1d381a827f5596a0…` | `448d5001-086a-453c-9634-adc6902bfdaa` | A modern eye examination lane at dusk: a cushioned exam chair in the middle of the frame with the phoropter swung in front of it on its arm, a slit lamp microscope on a small stand beside it, and at the far end a dim vision chart screen too blurred to read. |
| `/services/contact-lens-exams/` | 21:9 | Flare | `477d6fb2-d41e-4cc9-bfa7-50ebb8731a62` | `70a896eba3dee77d…` | `9b596965-6e62-4662-b759-54c3f7eaa867` | A contact lens fitting bar: a long walnut counter running across the frame with neat trays of small plain contact lens trial packs, lens cases, a plain solution bottle and a round mirror on a stand in the middle, and a slit lamp microscope at one end. |
| `/services/emergency-eye-care/` | 21:9 | Flare (second prompt) | `24cb91c2-2097-4990-8611-fd38862c5ee2` | `2b42793d71999249…` | `32abc84c-e1cc-4bde-b317-0e83cec0d922` | An eye exam room kept ready for an urgent eye problem in the evening. Just left of the middle of the frame, a slit lamp microscope is switched on, its small warm beam the only light source, beside a cushioned exam chair; on the slit lamp table a folded gauze pad and a small clear plastic eye shield. The right half of the frame is calm and dark: closed walnut cabinetry and a deep teal wall, with no metal, no glass, no bright or reflective objects and no lamps. |
| `/services/medical-eye-care/` | 21:9 | Flare | `aa432812-91e0-4ec4-85d3-f518a53477a3` | `1734da8e165b354e…` | `516f7cc6-4207-4286-8864-20ab5640af81` | A diagnostic imaging room: an OCT scanner and a retinal camera side by side on white tables in the middle of the frame, each with a monitor showing a colourful image of the retina with no writing or numbers, and a cushioned stool in front of them. |

The sha256 is of the PNG converted. For three pages that is an edited copy (below); the raw renders are
`b97a4b44b63484d4…` (`lasik-co-management`), `ca0fd423ed4e1523…` (`pediatric-eye-exams`) and `38b3c3f49cf8bd5b…`
(`foreign-body-removal`).

**Re-rendered with a second prompt** (the first prompt's two renders, not used):

| page | why | first renders |
|---|---|---|
| `gas-permeable-contacts` | the first prompt put a small lens on a plunger: the same picture as the scleral lens on `specialty-contacts`. The second shows rigid lenses in an open case | `67ded861-b5dd-47a4-a1be-e1b320b0d287`, `e450533d-3270-4ee5-9040-3f7d750b3bf9` |
| `senior-eye-exams` | in both, the reading glasses had a third temple arm | `cb42466b-58e5-418c-96ee-8cedb1bccf92`, `b4c91a20-4abf-448e-aebf-603dbc3f5e46` |
| `specialty-contacts` | the scleral lens on its plunger read as a glass dish, with nothing to show its size; the second adds a soft lens and a case | `2ef3921e-5da1-444a-92e6-df50765926bf`, `3d4e2ce8-fcb2-4440-8d6b-8f341f671b19` |
| `emergency-eye-care` | a bright steel trolley sat on the right, under the card's paragraph and links: the gold "Book an Appointment" link measured 4.47:1 at its worst pixel at 1920 on one render and 4.32 at 2560 on the other. The second keeps the right half dark; the link now measures 6.2:1 and up | `532f9069-30f0-42e9-ad3d-e674733e0ef2`, `550a8465-75c7-4472-8107-c4ef8e2d124f` |
| `adult-eye-exams` | the render chosen had a blurred shape behind the exam chair that read as the back of a seated person's head; the other had garbled numerals around its dials. The second asks for an empty room and tick-only dials | `b16fe578-b3be-4028-9329-f79e232683f1`, `05669fde-4b4c-44e5-bab4-7bc23de095fc` |
| `foreign-body-removal` | one render had pseudo-printing on the sterile pouches, the other a pouch of melted swabs with extra heads. The second asks for fewer items, with space between them | `4cc4ea4b-a405-4571-b99a-e9ffb0faf76d`, `c73c3907-dd51-47c4-8f19-a4e40613c70a` |

**Edited after rendering:**
- `lasik-co-management`: a white, scratch-like streak on the rim of the corneal map (about 170 x 60 px at full
  size) was removed. The pixels that departed from a median-smoothed copy were masked, only inside the disc, and
  filled from their neighbours (2,463 pixels).
- `pediatric-eye-exams`: the teddy bear's stool had a fifth leg, a back leg on both sides of its front left leg. The
  inner one was covered with the rug beside it: a 38 x 76 px patch from 52 px to its right, blended in over 6 px.
- `foreign-body-removal`: mirrored left to right. The page's badge covers the lower left of the photograph, where
  the swab pouch sat; mirrored, the pouch and the bottle sit to the right of it. The render holds no writing and no
  people, so mirroring changes nothing else.
- `diabetic-eye-exams` is unedited but anchored at 60% (`object-position`): the retina photograph on its monitor
  reaches x 0.77 of the render, past the middle 44% a tall frame keeps.

**Found and left as they are.** At full size a few renders carry marks that no reviewer could resolve at hero
size: faint pseudo-engraving on the inside of glasses' temples (`myopia-management`, `macular-degeneration`,
`senior-eye-exams`), defocused gilt squiggles on book spines (`childrens-eye-care`, under the card's scrim), tiny
garbled badges on instrument bezels (`comprehensive-eye-exams`, `medical-eye-care`, under the scrim), a tiny emblem shaped like a
standing figure on the phoropter of `comprehensive-eye-exams` (about 5 x 9 px on the page, under the scrim). The
`red-eye-treatment` slit lamp's beam runs straight down through opaque parts: a stylised light path that an eye-care
professional may notice; the other render had garbled numerals on its dial. These are 5–35 px at 3840 px wide, so 1–4 px on the
page.

| file | what |
|---|---|
| `svc-<page>-hf-master.webp` | the render, `cwebp -q 92 -m 6 -sharp_yuv -metadata none` (not shipped) |
| `svc-<page>-hf.webp` (2560), `-1920`, `-1600`, `-1280`, `-960`, `-720`, `-480` | the 21 framed heroes, `cwebp -q 80 -m 6 -sharp_yuv -metadata none -resize W 0`. 2560 is the largest shipped: the frame needs about 2000 device pixels at most (1025 px on a 2x screen) |
| `svc-<page>-hf.webp` (3840), `-2560`, `-1920`, `-1600`, `-1280`, `-960` | the five photo cards from 821 px, `-q 90`: at `-q 80` the dark teal walls showed blocks when brightened |
| `svc-<page>-crop-hf.webp` (1648), `-1280`, `-960`, `-720`, `-480` | the cards' square crop up to 820 px, `-q 90`, `-crop X 0 1648 1648`: X = 1096 (the centre), or 640 for `emergency-eye-care`, whose slit lamp sits left of centre |

Used by the 26 service pages through `tools/build.mjs` (`SVC_HERO`, `reshapeServiceHero`); no CSS changed. The
`sizes` of the framed photos are measured painted widths (every 8 px from 320 to 2560 on all 21 pages); the cards
use `INNER_HERO`'s, measured on the same box.
