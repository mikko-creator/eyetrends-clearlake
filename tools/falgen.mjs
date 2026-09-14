// Generate the site's replacement imagery with fal.ai FLUX.
// Zero dependencies (Node builtins only, B12).
//
// POLICY (B3 / fabrication:generated-proof):
//   Generated imagery may depict eyewear, lenses and optometric instruments as
//   OBJECT STUDIES. It may NOT stand in for a real person, a real premises or a
//   real clinical result. The doctor's portrait, the practice interiors and every
//   third-party trademark therefore keep their original photograph.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }
const OUT = process.argv[2] || 'dist/assets/generated';
const MODEL = 'https://fal.run/fal-ai/flux/dev';

const STYLE = 'editorial product photography, natural soft window light, shallow depth of field, '
  + 'muted deep-teal and warm gold accents, walnut wood and off-white surfaces, clean minimal composition, '
  + 'photorealistic, high detail, no text, no lettering, no logos, no watermarks, no brand names, no people';

const SLOTS = [
  { file: 'designer-frames',     w: 1024, h: 768,  p: 'a curated row of premium designer eyeglass frames standing on a walnut display shelf, acetate and thin titanium, tortoiseshell olive and crystal tones' },
  { file: 'sunglasses',          w: 1024, h: 768,  p: 'premium designer sunglasses arranged on a walnut display shelf, polarized lenses in bronze and green-grey, metal and acetate temples' },
  { file: 'all-eyewear-flatlay', w: 900,  h: 900,  p: 'an overhead flat-lay of eyeglass frames and sunglasses arranged in a neat grid on a warm off-white linen surface, varied acetate and metal styles' },
  { file: 'acetate-detail',      w: 1200, h: 908,  p: 'extreme close-up of a hand-finished acetate eyeglass frame in tortoiseshell and olive, showing the polished bevel, hinge and temple tip, on walnut' },
  { file: 'polarized-detail',    w: 1200, h: 908,  p: 'extreme close-up of two polarized sunglass lenses, one green-grey and one bronze tint, catching the light on a dark walnut surface' },
  { file: 'kids-glasses',        w: 900,  h: 1189, p: 'a vertical arrangement of colourful durable children eyeglass frames in teal coral and navy, bendable temples, on a soft off-white surface' },
  { file: 'kids-frames-display', w: 1600, h: 893,  p: 'a wide shelf of colourful children eyeglass frames neatly displayed in rows on pale wood, bright cheerful colours, optical shop shelving' },
  { file: 'kids-flex-detail',    w: 1200, h: 908,  p: 'close-up of a flexible children eyeglass frame with a springy bendable temple arm being gently flexed, showing the hinge detail, on a bright surface' },
  { file: 'contact-lenses-tile', w: 900,  h: 1189, p: 'a clear soft contact lens on a fingertip beside an open contact lens case and solution bottle, clean clinical still life on a pale surface' },
  { file: 'fitting-bench',       w: 1200, h: 908,  p: 'contact lens trial vials, a lens case, solution and a small mirror laid out on a walnut worktop, optometry fitting bench still life' },
  { file: 'dry-eye-care',        w: 900,  h: 1189, p: 'a folded warm compress cloth, a bottle of lubricating eye drops and a small ceramic dish arranged on a pale linen tray, calm dry eye care still life' },
  { file: 'retinal-check',       w: 900,  h: 1189, p: 'a condensing lens held in a gloved hand at the exam light of a slit lamp, glowing rim, dark clinical background, optometric instrument close-up' },
  { file: 'sunglass-display',    w: 1600, h: 893,  p: 'designer sunglasses lined up on a polished brass display rail against a warm neutral wall, boutique optical retail detail' },
  { file: 'bg-dark',             w: 1920, h: 1080, p: 'an abstract dark teal background texture with soft out-of-focus lens flare and a faint concentric optical lens pattern, deep shadow, very subtle, no subject' },
  { file: 'kids-eyewear',        w: 1024, h: 768,  p: 'a bright display of colourful childrens eyeglass frames arranged on a light wood shelf with a soft pastel background, playful optical shop detail' },
];

fs.mkdirSync(OUT, { recursive: true });
const manifest = [];
const failures = [];

for (const s of SLOTS) {
  const dest = path.join(OUT, s.file + '.jpg');
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log('skip (on disk) ' + s.file);
    manifest.push({ file: s.file, dest, bytes: fs.statSync(dest).size, reused: true });
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
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const j = await r.json();
    const img = j.images && j.images[0];
    if (!img || !img.url) throw new Error('no image in response');
    const bin = await fetch(img.url);
    if (!bin.ok) throw new Error('download HTTP ' + bin.status);
    const buf = Buffer.from(await bin.arrayBuffer());
    fs.writeFileSync(dest, buf);
    manifest.push({ file: s.file, dest, bytes: buf.length, w: img.width, h: img.height, seed: j.seed, prompt: body.prompt, model: 'fal-ai/flux/dev' });
    console.log('ok   ' + s.file.padEnd(22) + buf.length + ' bytes  ' + img.width + 'x' + img.height);
  } catch (e) {
    failures.push({ file: s.file, reason: String(e && e.message || e) });
    console.log('FAIL ' + s.file.padEnd(22) + String(e && e.message || e));
  }
}

fs.writeFileSync(path.join(OUT, '_generated-manifest.json'), JSON.stringify({
  schema: 'site-reforge/generated-images@1',
  generated: new Date().toISOString(),
  model: 'fal-ai/flux/dev',
  policy: 'Object studies only. No generated person, premises or clinical result. Trademarks and the doctor portrait keep their original photograph.',
  images: manifest, failures,
}, null, 2));
console.log('\ngenerated ' + manifest.length + ' / ' + SLOTS.length + '  failures ' + failures.length);
