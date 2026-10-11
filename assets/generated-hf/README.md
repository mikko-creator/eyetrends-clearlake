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
