// Same-origin proxy for the LIVE source site.
//
// Why: the design baseline must be measured at each configured breakpoint, and
// this display is 1280 CSS px wide, so the browser window cannot be sized to
// 1440 (or reliably to 390/768/1024 — resize_window reports success and leaves
// innerWidth untouched). A sized IFRAME gives a real viewport at any width, but
// the same-origin policy forbids scripting into a cross-origin frame.
//
// Serving the live response from 127.0.0.1 makes the frame same-origin and
// therefore scriptable. The bytes are the live site's own, fetched at capture
// time; a <base> tag is injected so every stylesheet, font and image still
// loads from the real origin, which is what makes the computed style real.
//
// Politeness: each path is fetched ONCE and cached for the run, so sweeping
// four widths costs one request per page, not four.
import http from 'node:http';

const ORIGIN = 'https://eyetrendsclearlake.com';
const PORT = Number(process.argv[2] || 8795);
// The contact in the User-Agent is configurable, not hardcoded. A polite
// crawler should identify itself, but a personal address does not belong in a
// public repository.
const CONTACT = process.env.SITE_REFORGE_CONTACT || '';
const UA = 'site-reforge/1.8.0 (design-baseline capture'
  + (CONTACT ? '; contact: ' + CONTACT : '') + ')';
const cache = new Map();

const server = http.createServer(async (req, res) => {
  const p = (req.url || '/').split('?')[0];
  try {
    if (!cache.has(p)) {
      const r = await fetch(ORIGIN + p, { headers: { 'User-Agent': UA } });
      if (!r.ok) { res.writeHead(r.status); return res.end('upstream ' + r.status); }
      let html = await r.text();
      // <base> so relative assets resolve to the real origin, not to localhost.
      html = html.replace(/<head([^>]*)>/i, '<head$1><base href="' + ORIGIN + '/">');
      cache.set(p, html);
      console.log('fetched ' + p + '  ' + html.length + ' bytes');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
    res.end(cache.get(p));
  } catch (e) {
    res.writeHead(502);
    res.end('proxy error: ' + (e && e.message));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('source proxy on http://127.0.0.1:' + PORT + '  ->  ' + ORIGIN);
});
