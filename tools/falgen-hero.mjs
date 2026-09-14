// High-resolution hero art for the full-bleed homepage hero.
//
// Why: the hero slot held exam-room.webp at 1024x576, which upscaled ~2.5x on a
// wide display and read as pixelated. Nothing larger exists in the crawl.
//
// B3 NOTE: this image REPLACES a documentary photograph of the client's own exam
// room. A generated image may not claim to be their premises, so the alt text
// for this slot is rewritten to describe the scene without asserting it is the
// Eye Trends office (see tools/build.mjs -> HERO_ALT). The client asked for this
// swap explicitly; the honest form of it is a truthful caption.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const OUT = process.argv[2] || 'assets/generated';
const MODEL = 'https://fal.run/fal-ai/flux/dev';

const SLOTS = [
  {
    file: 'hero-exam-room',
    w: 2560, h: 1440,
    p: 'a serene modern optometry examination room, a phoropter on its arm beside a reclining '
     + 'exam chair, soft daylight falling through a tall window with sheer curtains, deep teal '
     + 'and soft mint walls with warm cream and walnut accents, polished floor, clean minimal '
     + 'clinical interior, wide establishing shot, calm and premium',
  },
];

const STYLE = 'photorealistic architectural interior photography, natural light, shallow depth of field, '
  + 'high detail, crisp, editorial, no people, no faces, no text, no lettering, no signage, no logos, no watermark';

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
const failures = [];

for (const s of SLOTS) {
  const dest = path.join(OUT, s.file + '.jpg');
  const body = {
    prompt: s.p + ', ' + STYLE,
    image_size: { width: s.w, height: s.h },
    num_inference_steps: 34,
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
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const j = await r.json();
    const img = j.images && j.images[0];
    if (!img || !img.url) throw new Error('no image in response');
    const bin = await fetch(img.url);
    const buf = Buffer.from(await bin.arrayBuffer());
    fs.writeFileSync(dest, buf);
    manifest.push({ file: s.file, bytes: buf.length, w: img.width, h: img.height, seed: j.seed, prompt: body.prompt, model: 'fal-ai/flux/dev' });
    console.log('ok   ' + s.file + '  ' + buf.length + ' bytes  ' + img.width + 'x' + img.height);
  } catch (e) {
    failures.push({ file: s.file, reason: String(e && e.message || e) });
    console.log('FAIL ' + s.file + '  ' + String(e && e.message || e));
  }
}

fs.writeFileSync(path.join(OUT, '_hero-manifest.json'), JSON.stringify({
  schema: 'site-reforge/generated-hero@1',
  generated: new Date().toISOString(),
  model: 'fal-ai/flux/dev',
  note: 'Replaces a documentary photo of the client exam room at the client\'s request. '
      + 'The alt text for this slot is rewritten so the image does not claim to be their premises.',
  images: manifest, failures,
}, null, 2));
console.log('\nhero generated ' + manifest.length + ' / ' + SLOTS.length + '  failures ' + failures.length);
