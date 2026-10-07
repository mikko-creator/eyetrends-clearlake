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

The background is generated. It is **not** the Eye Trends office, so no caption may say it is.
One alt did ("in his Clear Lake optometry practice") and is rewritten in `tools/build.mjs`
(`PORTRAIT_SWAP`). The output PNG carried no C2PA or other provenance chunks, so the WebP
re-encode lost none. The provenance lives in the `data-edited` attribute and in this file.
