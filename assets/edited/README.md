# assets/edited/ — AI-edited photographs

Files here are **real photographs edited by an image model**. That makes them different from
`assets/generated/` (wholly generated stand-ins) and `assets/supplied/` (client photographs,
resized only). In the built pages they carry `data-edited="<model>"`.

## dr-hyder-portrait-hf*.webp — Dr. Jerry Hyder's portrait

| | |
|---|---|
| requested | operator, 2026-10-07: *"Use higgsfield ai to improve this photo of Dr. Jerry Hyder … Increase resolution of his photo and perhaps use a better background, a clear eye clinic background. Make it very professional looking suited for a high-end service"* |
| source | `assets/source/5904c4d2-dr-hyder-portrait.webp`, 511x560, the largest copy the source site published |
| model | Higgsfield `marketing-studio/image/sunburst` (Marketing Studio 2.5 Sunburst), `resolution 4k`, `aspect_ratio 1:1`, `quality high`, `enhance_prompt false`, request `89b1a1f5-dd90-44fe-a508-1071a825be59`, 2026-10-07 |
| reference | the source centred on a 560x560 canvas, with side margins made from a blurred stretch of the photo itself (the model has no 511:560 ratio, and 1:1 is the nearest) |
| what changed | the background: his optical replaced by a generated, softly out-of-focus clinic interior. Resolution: 2880x2880 out. |
| what was kept | the man: face, glasses, expression, hair, shirt, hands and ring, pose, size and position |
| crop | the 2880 output back to the source's exact framing: x 123, y 0, 2628x2880 (`dr-hyder-portrait-hf-master.webp`, q92) |
| renditions | 480, 720, 960, 1280, 1600 and 1920 wide (the 1920 is the unsuffixed file). Heights are rounded from 2880/2628 so every file keeps the 511:560 ratio within 0.025%. `cwebp -crop 123 0 2628 2880 -resize W H -q 82 -m 6 -sharp_yuv -metadata none` |
| used by | every page that showed his source portrait (`tools/build.mjs`, `PORTRAIT_SWAP`), and since revision 16 the home quote section ("In Dr. Hyder's words") as its photo panel (`QUOTE_PHOTO_SIZES`), where it replaced the background-removed cut-out |

**Fidelity check (he is a real person).** The output was aligned to the original on the man
himself, using SIFT matches inside the original's area and a RANSAC similarity transform. The
transform came out at scale 1.001, rotation 0.06° and shift under 1 px, so the framing is
unchanged. The regions were then compared at the original's own resolution:

| region | SSIM | NCC |
|---|---|---|
| face | 0.874 | 0.949 |
| glasses | 0.825 | 0.865 |
| hands | 0.915 | 0.992 |

The controls, run on the original against itself:

| control | face SSIM |
|---|---|
| identity | 1.000 |
| blurred and re-encoded at JPEG q35 | 0.849 |
| shifted 6 px | 0.249 |
| mirrored face | 0.265 |

Five other renders were rejected:
- Sunburst's sibling Flare, at face SSIM 0.833.
- Qwen Image 3 edit, at 0.813. It also reframed him to scale 0.82.
- Grok Image 2.0, at 0.796.
- Two versions that kept his own office, at 0.788 and 0.872. The 0.872 one changed his hands (0.271).

The sharp vertical crease between his brows is in the original photograph too. It is not an artifact.

## dr-hyder-wide-hf*.webp — the same portrait at 16:9, for the home page's doctor section

| | |
|---|---|
| requested | operator, 2026-10-07: *"make the image you edited a full width background image of that section? It looks weird in it's frame"* |
| why a new file | the 511:560 portrait cannot cover a ~1.6:1 section without cropping him to a strip under the text |
| sketch | the approved 2880x2880 Sunburst render placed at the LEFT of a 5120x2880 canvas (he lands at 28% of the width, over the left column), the right 2240 px a blurred stretch of the render's own right edge |
| renders | three jobs, 4k, 16:9, quality high, 2026-10-07: Sunburst `d806f0cb-0061-4b06-a8fa-94bddbd92b31`; Sunburst + the original photo as a second, identity-only reference `3be0eda1-8cd8-4b49-ad7a-7e7e5562d425`; Flare `8a9057bc-52cf-41c4-8ee0-5d0fa89b2c67` (used for the room) |
| why a composite | re-rendering him a second time cost likeness: face SSIM against the original 0.834–0.844 (the approved render scores 0.882 by the same method) |
| composite | the APPROVED render warped onto the Flare render (SIFT + RANSAC on the man: scale 0.748, rotation 0.01°), then stitched along the least-colour-difference vertical seam inside x 1840–2130, to the right of him in the shelf column. A 16 px feather: left of the seam, approved pixels (him and the near room); right of it, Flare's extension. The seam is invisible at full size, and the room is softly out of focus there |
| fidelity of the shipped file | face SSIM **0.905** / NCC 0.961, glasses 0.857, hands 0.917, against the original photo (aligned at scale 1.003) |
| files | `dr-hyder-wide-hf-master.webp` (3840x2160, q90) and renditions 960, 1280, 1600, 1920, 2560 and 3840 (the unsuffixed file), q80. Only the home page uses them, through `<picture>` at 1025px and up (`tools/build.mjs`, `PORTRAIT_SWAP.wide`) |

## kids-eyewear-wide-hf*.webp and kids-eyewear-crop-hf*.webp — the home page's kids section

| | |
|---|---|
| requested | operator, 2026-10-07: *"redesign this section, enhance the image resolution and make it full width too"* (home, "The eye doctor your kids will grow up with") |
| source | `assets/source/aef3df2e-kids-eyewear.webp`, 1024x768, the largest copy the source site published. It is a studio still life of three children's frames (lilac with teal arms, grey, yellow) on a pale yellow wall and a mint tabletop. It looks AI-made itself, down to the pseudo-text printed on the teal arm |
| sketch | `prep-kids.py` v2: the source scaled x2.01 so the frames span 62-95% of a 5120x2880 canvas, horizon at 52%. Its own wall and tabletop are stretched across the rest, then blurred. v1 (frames at 46-95%, x3) made the frames so large that a height-scaled cover slid them under the text card; it was not used |
| renders | Higgsfield, 4k, 16:9, quality high, 2026-10-07. v2 Sunburst `34e928cc-8369-4783-855c-aee34d29bbdf` (**used**), v2 Flare `8d10d878-b0d8-4f05-9093-9556c609510f` (a small mark on the teal arm). v1 Sunburst `af342317-3824-4bea-b93f-ec462b175bc6` and v1 Flare `966ff05b-3d5a-47aa-8482-a59ea4f77892` were not used |
| what changed | 3840x2160 instead of 1024x768. The same three frames, plain, with the pseudo-text gone. The set is extended to 16:9 with the frames grouped on the right |
| desktop files | `kids-eyewear-wide-hf-master.webp` (q90), and 960, 1280, 1600, 1920, 2560 and 3840 (the unsuffixed file) at q82. The frames' box in the image, measured: x 0.622-0.949, y 0.447-0.617 |
| small-screen files | `kids-eyewear-crop-hf*`: a 4:3 crop of the same render at x 2046, y 477, 1794x1346, centred on the frames (they fill 70% of its width). Served at 480, 720, 960, 1280 and 1794 (the unsuffixed file) through `<picture>` below 1200px |
| alt | The source alt here, "A child in durable, colorful kids' eyeglass frames at Eye Trends", describes a child the photo never showed. It is replaced with what the image shows, in the wording `/services/back-to-school-eye-exams/` already used. Only the home section's slot changes; the other 12 usages keep the source photo |

The doctor's background is generated. It is **not** the Eye Trends office, so no caption may say it is.
One alt did ("in his Clear Lake optometry practice") and is rewritten in `tools/build.mjs`
(`PORTRAIT_SWAP`). The output PNG carried no C2PA or other provenance chunks, so the WebP
re-encode lost none. The provenance lives in the `data-edited` attribute and in this file.
