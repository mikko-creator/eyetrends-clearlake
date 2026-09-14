// Decorative art for the glassmorphic redesign — fal.ai FLUX.
//
// These are ABSTRACT by design, which matters twice over:
//   1. Glass needs something luminous behind it or the frosting reads as grey.
//   2. An abstract field makes no documentary claim about this practice, so it
//      cannot fall foul of B3 the way a generated "photo of the office" would.
//      No person, no premises, no clinical result — light, glass and optics.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const OUT = process.argv[2] || 'assets/generated';
const MODEL = 'https://fal.run/fal-ai/flux/dev';

const STYLE = 'abstract, non-representational, no people, no faces, no text, no lettering, no logos, '
  + 'no watermark, clean, high detail, smooth gradients, cinematic lighting, premium editorial art direction';

const SLOTS = [
  { file: 'aurora-hero', w: 1920, h: 1080,
    p: 'a soft flowing aurora gradient mesh in deep teal, mint green and warm gold on an off-white field, '
     + 'silky blurred colour bands, luminous, airy, very subtle film grain' },
  { file: 'aurora-dark', w: 1920, h: 1080,
    p: 'a dark aurora gradient field in near-black teal with emerald and amber light ribbons, deep shadow, '
     + 'glowing volumetric haze, rich and moody' },
  { file: 'lens-macro', w: 1600, h: 1200,
    p: 'extreme macro of the polished edge of an optical lens, caustic light refraction, thin rainbow fringe, '
     + 'shallow depth of field on a dark teal background' },
  { file: 'bokeh-teal', w: 1600, h: 1000,
    p: 'out-of-focus circular bokeh lights in teal, mint and warm gold on a dark field, soft glowing orbs, '
     + 'lens blur, dreamy' },
  { file: 'glass-panes', w: 1600, h: 1200,
    p: 'abstract frosted glass panes floating and overlapping at soft angles, translucent, pale mint and gold '
     + 'light passing through, gentle shadows, minimalist composition' },
  { file: 'optic-rings', w: 1400, h: 1400,
    p: 'concentric thin rings and arcs like an optical lens diagram, fine line work, teal and gold on cream, '
     + 'geometric, precise, generous negative space' },
  { file: 'light-prism', w: 1600, h: 1000,
    p: 'a single beam of white light dispersing through a prism into a soft spectrum, on a deep near-black '
     + 'teal background, elegant and restrained' },
  { file: 'mesh-warm', w: 1600, h: 1000,
    p: 'a warm gradient mesh in cream, soft gold and pale sand, gently flowing colour fields, very soft, '
     + 'no hard edges, luxurious and calm' },
  { file: 'caustics', w: 1600, h: 1000,
    p: 'water caustic light patterns rippling across a pale surface, teal and gold tinted, delicate wavering '
     + 'lines of focused light, serene' },
  { file: 'grid-glow', w: 1920, h: 1080,
    p: 'a faint technical grid of thin lines fading into darkness with a soft teal glow blooming from one '
     + 'corner, minimal, futuristic, mostly empty space' },
];

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
const failures = [];

for (const s of SLOTS) {
  const dest = path.join(OUT, s.file + '.jpg');
  const webp = path.join(OUT, s.file + '.webp');
  if (fs.existsSync(webp) && fs.statSync(webp).size > 5000) {
    console.log('skip (webp on disk) ' + s.file);
    manifest.push({ file: s.file, reused: true });
    continue;
  }
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log('skip (jpg on disk) ' + s.file);
    manifest.push({ file: s.file, reused: true });
    continue;
  }
  const body = {
    prompt: s.p + ', ' + STYLE,
    image_size: { width: s.w, height: s.h },
    num_inference_steps: 30,
    guidance_scale: 3.5,
    num_images: 1,
    enable_safety_checker: true,
    output_format: 'jpeg',
  };
  try {
    const r = await fetch(MODEL, {
      method: 'POST',
      headers: { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 160));
    const j = await r.json();
    const img = j.images && j.images[0];
    if (!img || !img.url) throw new Error('no image in response');
    const bin = await fetch(img.url);
    const buf = Buffer.from(await bin.arrayBuffer());
    fs.writeFileSync(dest, buf);
    manifest.push({ file: s.file, bytes: buf.length, w: img.width, h: img.height, seed: j.seed, prompt: body.prompt, model: 'fal-ai/flux/dev' });
    console.log('ok   ' + s.file.padEnd(14) + buf.length + ' bytes  ' + img.width + 'x' + img.height);
  } catch (e) {
    failures.push({ file: s.file, reason: String(e && e.message || e) });
    console.log('FAIL ' + s.file.padEnd(14) + String(e && e.message || e));
  }
}

fs.writeFileSync(path.join(OUT, '_decor-manifest.json'), JSON.stringify({
  schema: 'site-reforge/generated-decor@1',
  generated: new Date().toISOString(),
  model: 'fal-ai/flux/dev',
  policy: 'Abstract decorative art only — light, glass and optics. No person, premises or clinical result, '
        + 'so no image here can be read as documentary evidence about this practice.',
  images: manifest, failures,
}, null, 2));
console.log('\ndecor generated ' + manifest.length + ' / ' + SLOTS.length + '  failures ' + failures.length);
