// Tiny POST collector: the browser hands measurements straight to disk.
// Chrome blocks repeated automatic downloads from one page, which silently
// leaves a stale file behind — that is how a 114 KB sweep arrived as the
// 81-byte remains of an earlier failed run. Node builtins only.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.argv[2] || 'audit/collected');
const PORT = Number(process.argv[3] || 8790);
fs.mkdirSync(OUT, { recursive: true });

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405); return res.end('POST only'); }

  const name = (req.url || '/blob').replace(/^\//, '').replace(/[^A-Za-z0-9._-]/g, '_') || 'blob';
  const chunks = [];
  let bytes = 0;
  req.on('data', (c) => {
    bytes += c.length;
    if (bytes > 200 * 1024 * 1024) { req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    const buf = Buffer.concat(chunks);
    const file = path.join(OUT, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    console.log('recv ' + String(buf.length).padStart(9) + '  ' + name);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok ' + buf.length);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('collector on http://127.0.0.1:' + PORT + '  ->  ' + OUT);
});
