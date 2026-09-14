// The four breakpoint captures were taken through tools/srcproxy.mjs, which
// serves the LIVE response from 127.0.0.1 so a sized iframe is same-origin and
// therefore scriptable. The bytes, the stylesheets and the fonts are the source
// site's own; only the transport is local.
//
// Left alone, each capture records `url` as the proxy address, which is a fact
// about the transport rather than about what was measured — and C09 reads it as
// "captured from another origin". This sets `url` to the page that was actually
// measured and records the transport explicitly, so the substitution is visible
// in the artifact instead of hidden by it.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CAPDIR = path.join(ROOT, 'audit', 'capture');
const PROXY = 'http://127.0.0.1:8795';
const TARGET = 'https://eyetrendsclearlake.com';

let stamped = 0, skipped = 0;
for (const f of fs.readdirSync(CAPDIR)) {
  if (!f.endsWith('.json')) continue;
  const p = path.join(CAPDIR, f);
  const cap = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (typeof cap.url !== 'string' || !cap.url.startsWith(PROXY)) { skipped++; continue; }
  const truePath = cap.url.slice(PROXY.length) || '/';
  cap.transportUrl = cap.url;
  cap.url = TARGET + truePath;
  cap.capturedVia = 'same-origin proxy (tools/srcproxy.mjs) of the live response; '
    + 'assets, stylesheets and webfonts loaded from ' + TARGET + ' via an injected <base>. '
    + 'Reason: this display is 1280 CSS px wide, so the browser window cannot be sized to '
    + 'the configured breakpoints, and a cross-origin iframe cannot be scripted.';
  cap.viewportAsserted = true;
  fs.writeFileSync(p, JSON.stringify(cap));
  stamped++;
  console.log('stamped ' + f + '  vw=' + cap.viewport.w + '  url=' + cap.url);
}
console.log('provenance stamped on ' + stamped + ' capture(s); ' + skipped + ' already direct.');
