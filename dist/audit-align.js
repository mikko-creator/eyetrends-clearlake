// Spacing and alignment audit, run inside a sized same-origin iframe.
//
// Measures the things that make a page look "off" even when nothing is broken:
//   · text and media in the same section starting on different left edges
//   · section vertical padding that varies between neighbouring bands
//   · gaps between sibling blocks that are inconsistent within one section
//   · content that does not sit inside the container's content box
//   · images whose displayed aspect ratio differs from their intrinsic one
window.__srAlign = function () {
  var W = window.innerWidth;
  var out = [];
  function push(kind, sel, detail) { if (out.length < 300) out.push({ kind: kind, sel: sel, detail: String(detail) }); }
  function name(el) {
    if (!el) return '(none)';
    var c = (el.getAttribute && el.getAttribute('class') || '').trim().split(/\s+/).slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (c ? '.' + c : '');
  }
  var R = function (n) { return Math.round(n); };

  var secs = [].slice.call(document.querySelectorAll('.rw-sec'));

  // --- 1 · container content edges, per section -----------------------------
  // A section is only expected to share the page's content edge if it HAS a
  // content container. A deliberately full-bleed band - the sub-page hero uses
  // .container--full and no .container at all - starts at x=0 by design, and
  // falling back to the section element reported that as "content left 0 vs
  // page 161" on every viewport of /services/. Full-bleed sections are skipped
  // for the edge test; they are still measured by every other check here.
  var edges = [];
  secs.forEach(function (s) {
    var c = s.querySelector(':scope > .container');
    if (!c) return;                       // full-bleed by design
    var cr = c.getBoundingClientRect();
    var cs = getComputedStyle(c);
    var left = cr.left + parseFloat(cs.paddingLeft || 0);
    var right = cr.right - parseFloat(cs.paddingRight || 0);
    edges.push({ sec: s, left: left, right: right });
  });
  // every section should share the same content edges
  if (edges.length > 1) {
    var lefts = edges.map(function (e) { return R(e.left); });
    var mode = {}; lefts.forEach(function (l) { mode[l] = (mode[l] || 0) + 1; });
    var common = +Object.keys(mode).sort(function (a, b) { return mode[b] - mode[a]; })[0];
    edges.forEach(function (e) {
      if (Math.abs(e.left - common) > 2) {
        push('section-edge', name(e.sec), 'content left ' + R(e.left) + ' vs page ' + common);
      }
    });
  }

  // --- 2 · text vs media left edges inside one section ----------------------
  secs.forEach(function (s) {
    var media = [].slice.call(s.querySelectorAll('img, picture, .dc-frame, .et-media, [class*="__media"]'))
      .filter(function (m) { var r = m.getBoundingClientRect(); return r.width > 80 && r.height > 60; });
    var texts = [].slice.call(s.querySelectorAll('h1, h2, h3, p'))
      .filter(function (t) { var r = t.getBoundingClientRect(); return r.width > 60 && (t.textContent || '').trim().length > 12; });
    if (!media.length || !texts.length) return;
    // only compare things that are in the SAME column (overlapping vertically)
    // An image inside a padded card, or inside a centred strip, is MEANT to be
    // inset — comparing it to a section heading reports the card's own padding
    // as a misalignment. Only compare things that share an ancestor chain with
    // no horizontal padding and no auto-centring between them.
    function insetBetween(el, stop) {
      var n = el, guard = 0;
      while (n && n !== stop && guard++ < 12) {
        var cs = getComputedStyle(n);
        if (parseFloat(cs.paddingLeft || 0) > 4) return true;
        if (cs.marginLeft === 'auto' || cs.marginRight === 'auto') return true;
        var ml = parseFloat(cs.marginLeft || 0), mr2 = parseFloat(cs.marginRight || 0);
        if (ml > 4 && Math.abs(ml - mr2) < 2) return true;    // symmetric = centred
        if (cs.textAlign === 'center') return true;
        n = n.parentElement;
      }
      return false;
    }
    media.forEach(function (m) {
      var mr = m.getBoundingClientRect();
      if (insetBetween(m, s)) return;
      texts.forEach(function (t) {
        if (insetBetween(t, s)) return;
        var tr = t.getBoundingClientRect();
        var sameRow = !(tr.bottom < mr.top - 8 || tr.top > mr.bottom + 8);
        if (sameRow) return;                       // side-by-side columns are fine
        var d = Math.abs(tr.left - mr.left);
        if (d > 2 && d < 240) {
          push('stack-misalign', name(s), name(t) + ' left ' + R(tr.left) + ' vs ' + name(m) + ' left ' + R(mr.left) + ' (' + R(d) + 'px)');
        }
      });
    });
  });

  // --- 3 · section vertical padding consistency ----------------------------
  var pads = secs.map(function (s) {
    var cs = getComputedStyle(s);
    return { sec: s, t: parseFloat(cs.paddingTop || 0), b: parseFloat(cs.paddingBottom || 0) };
  });
  var tvals = {}; pads.forEach(function (p) { tvals[R(p.t)] = (tvals[R(p.t)] || 0) + 1; });
  var padMode = +Object.keys(tvals).sort(function (a, b) { return tvals[b] - tvals[a]; })[0];
  pads.forEach(function (p) {
    if (Math.abs(p.t - padMode) > 8 && p.t < padMode) {
      push('section-padding', name(p.sec), 'padding-top ' + R(p.t) + ' vs usual ' + padMode);
    }
  });

  // --- 4 · uneven sibling gaps within one row/grid --------------------------
  [].slice.call(document.querySelectorAll('.row, .mega-cols, .foot-grid, [class*="__grid"]')).forEach(function (row) {
    var kids = [].slice.call(row.children).filter(function (k) {
      var r = k.getBoundingClientRect(); return r.width > 40 && r.height > 20;
    });
    if (kids.length < 2) return;
    var rects = kids.map(function (k) { return k.getBoundingClientRect(); });
    // horizontal run?
    var horizontal = rects.every(function (r, i) { return i === 0 || Math.abs(r.top - rects[0].top) < 24; });
    if (!horizontal) return;
    var gaps = [];
    for (var i = 1; i < rects.length; i++) gaps.push(R(rects[i].left - rects[i - 1].right));
    var min = Math.min.apply(null, gaps), max = Math.max.apply(null, gaps);
    if (gaps.length > 1 && max - min > 6) {
      push('uneven-gap', name(row), 'gaps ' + gaps.join('/') + 'px');
    }
  });

  // --- 5 · content escaping the container ----------------------------------
  edges.forEach(function (e) {
    [].slice.call(e.sec.querySelectorAll('h1,h2,h3,p,ul,ol,.btn')).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width < 20) return;
      if (r.left < e.left - 3 || r.right > e.right + 3) {
        var full = getComputedStyle(el.parentElement).position === 'absolute';
        if (!full) push('escapes-container', name(el), R(r.left) + '..' + R(r.right) + ' vs ' + R(e.left) + '..' + R(e.right));
      }
    });
  });

  // --- 6 · images stretched off their intrinsic ratio -----------------------
  [].slice.call(document.images).forEach(function (i) {
    if (!i.naturalWidth || !i.naturalHeight) return;
    var r = i.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) return;
    var fit = getComputedStyle(i).objectFit;
    if (fit === 'cover' || fit === 'contain') return;   // cover/contain handle it
    var want = i.naturalWidth / i.naturalHeight, got = r.width / r.height;
    if (Math.abs(want - got) / want > 0.04) {
      push('image-stretched', name(i), got.toFixed(2) + ' vs intrinsic ' + want.toFixed(2));
    }
  });

  var counts = {};
  out.forEach(function (o) { counts[o.kind] = (counts[o.kind] || 0) + 1; });
  return { url: location.pathname, viewport: W, counts: counts, findings: out };
};
