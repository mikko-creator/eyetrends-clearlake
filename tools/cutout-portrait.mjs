// Background removal for the Dr. Hyder portrait.
//
// B3 NOTE — this is NOT image generation. The input is the client's own
// photograph of a real person, harvested from the live site. Background removal
// is a TRANSFORMATION of that genuine asset: the face, the person and the claim
// are unchanged, only the backdrop is cut away. Nothing is invented, so this
// does not fall under the generated-imagery rule and the output is NOT stamped
// data-generated. It carries data-cutout instead, so provenance stays honest and
// the fabrication gate can tell the two apart.
//
// A generative model must never be pointed at a real person's face here: that
// would invent detail on a documentary subject, which B3 forbids outright.
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.FAL_KEY;
if (!KEY) { console.error('FAL_KEY not set'); process.exit(1); }

const SRC = process.argv[2] || 'assets/source/5904c4d2-dr-hyder-portrait.webp';
const DEST = process.argv[3] || 'assets/img/dr-hyder-cutout.png';
const MODEL = 'https://fal.run/fal-ai/birefnet/v2';

function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: (b.readUIntLE(24, 3) & 0xffffff) + 1, h: (b.readUIntLE(27, 3) & 0xffffff) + 1 };
  if (t === 'VP8L') { const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24];
    return { w: ((b0 | (b1 << 8)) & 0x3fff) + 1, h: (((b1 >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10)) & 0x3fff) + 1 }; }
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  return null;
}
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const srcBytes = fs.readFileSync(SRC);
const srcDim = webpSize(SRC);
console.log('input  ' + SRC + '  ' + srcBytes.length + ' bytes  ' + (srcDim ? srcDim.w + 'x' + srcDim.h : '?'));

const dataUri = 'data:image/webp;base64,' + srcBytes.toString('base64');

const r = await fetch(MODEL, {
  method: 'POST',
  headers: { Authorization: 'Key ' + KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    image_url: dataUri,
    model: 'General Use (Heavy)',
    operating_resolution: '2048x2048',
    output_format: 'png',
    refine_foreground: true,
  }),
});
if (!r.ok) { console.error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 400)); process.exit(1); }
const j = await r.json();
const img = j.image || (j.images && j.images[0]);
if (!img || !img.url) { console.error('no image in response: ' + JSON.stringify(j).slice(0, 300)); process.exit(1); }

const out = Buffer.from(await (await fetch(img.url)).arrayBuffer());
fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.writeFileSync(DEST, out);
const dim = pngSize(out) || { w: img.width, h: img.height };
console.log('output ' + DEST + '  ' + out.length + ' bytes  ' + dim.w + 'x' + dim.h);

fs.writeFileSync('assets/img/_cutout-manifest.json', JSON.stringify({
  schema: 'site-reforge/cutout@1',
  generated: new Date().toISOString(),
  operation: 'background-removal',
  isGeneratedImagery: false,
  note: 'Transformation of the client\'s own photograph of a real person. Not generated. '
      + 'The subject is unchanged; only the backdrop is removed.',
  model: 'fal-ai/birefnet/v2',
  input: { file: SRC, bytes: srcBytes.length, w: srcDim && srcDim.w, h: srcDim && srcDim.h,
           origin: 'https://eyetrendsclearlake.com/sites/sgen_eyetrendsclearlake_com/uploads/2026/08/dr-hyder-portrait.webp' },
  output: { file: DEST, bytes: out.length, w: dim.w, h: dim.h },
}, null, 2));
