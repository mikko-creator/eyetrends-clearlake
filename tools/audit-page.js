// Visual-integrity audit, run inside a sized same-origin iframe.
// Master copy — tools/run-audit copies this into dist/ for the run and removes
// it afterwards, so a build's prune step cannot lose it.
//
// Catches what a from-scratch restyle actually breaks: collapsed sections,
// horizontal overflow, surfaces that lost their background, invisible text,
// broken images.
//
// The colour handling earned four corrections, all kept here — each one was a
// batch of false failures this tool reported before it was right:
//   1. parse color(srgb r g b / a) as well as rgb()/rgba(). color-mix() computes
//      to that form, so a parser that only knew rgba() reported all 328 glass
//      surfaces as "no background" when they were correct.
//   2. average gradient backdrops (else every element on a dark gradient band
//      read as 1.02:1 against an assumed light page — 252 false failures)
//   3. an element's own background counts only if it FILLS its box, so a
//      button's gradient is a backdrop but a 2px underline gradient is not
//   4. otherwise the backdrop is the ancestor chain, not the element itself
//   5. an element inside an opaque tile is backed by the TILE, not by a scrim
//      behind it, so the ancestor walk runs before the scrim fallback
//   6. a PHOTOGRAPH can back text without being any ancestor's background: an
//      absolutely positioned image layer painted over the ancestor's own fill.
//      .et-cat is exactly that - a light glass tile with a photo at inset 0 -
//      so the ancestor walk reported light glass while the caption was really
//      dark-on-dark at 1.02:1, and this tool called it a pass. When a photo
//      layer covers the text, the photo wins; and because its pixels are
//      unknown, the ratio is computed against BOTH a white and a black photo
//      and the worse of the two is what gets reported.
window.__srAudit = function () {
  var W = window.innerWidth;
  var out = [];
  function push(kind, sel, detail) { if (out.length < 220) out.push({ kind: kind, sel: sel, detail: String(detail) }); }
  function name(el) {
    if (!el) return '(none)';
    var c = (el.getAttribute && el.getAttribute('class') || '').trim().split(/\s+/).slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (c ? '.' + c : '');
  }
  // Handles rgb(), rgba(), and color(srgb r g b / a) — the last is what
  // color-mix() resolves to in Chrome, with channels in the 0..1 range.
  function rgb(s) {
    var str = String(s);
    var m = str.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/);
    if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
    var c = str.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/i);
    if (c) return { r: +c[1] * 255, g: +c[2] * 255, b: +c[3] * 255, a: c[4] === undefined ? 1 : +c[4] };
    return null;
  }
  function lum(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function gradientAvg(bgImage) {
    var stops = String(bgImage).match(/rgba?\([^)]*\)|color\(srgb[^)]*\)/g);
    if (!stops || !stops.length) return null;
    var acc = { r: 0, g: 0, b: 0, n: 0 };
    for (var i = 0; i < stops.length; i++) {
      var c = rgb(stops[i]);
      if (!c || c.a < 0.25) continue;
      acc.r += c.r; acc.g += c.g; acc.b += c.b; acc.n++;
    }
    return acc.n ? { r: acc.r / acc.n, g: acc.g / acc.n, b: acc.b / acc.n, a: 1 } : null;
  }
  function paintsArea(cs) {
    var size = String(cs.backgroundSize || '');
    if (/(^|\s)0(px|%)?(\s|$)/.test(size)) return false;
    var parts = size.split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var v = parseFloat(parts[i]);
      if (!isNaN(v) && v <= 4 && /px$/.test(parts[i])) return false;
    }
    return true;
  }
  // Text over a full-bleed photo sits on the SCRIM, not on any element's
  // background. Reading the ancestor chain gave 24 findings at ~1.05:1 for hero
  // copy that is in fact white-on-dark. Parse the scrim gradient, interpolate
  // its alpha at this element's horizontal position, and composite over a
  // worst-case WHITE photo — if it passes there it passes over any image.
  function scrimBackdrop(el) {
    var sec = el.closest ? el.closest('.rw-sec, section, header') : null;
    if (!sec) return null;
    var media = sec.querySelector('[class*="__media"], .et-media, .dc-frame');
    if (!media) return null;
    var mcs = getComputedStyle(media);
    if (mcs.position !== 'absolute' && mcs.position !== 'fixed') return null;
    var scrim = getComputedStyle(media, '::before');
    var bg = scrim && scrim.backgroundImage;
    if (!bg || bg === 'none') return null;
    var first = bg.split(/,(?![^(]*\))/)[0] + bg.slice(bg.indexOf('('));
    var stopRe = /(rgba?\([^)]*\)|color\(srgb[^)]*\))\s*([\d.]+)%/g;
    var stops = [], m2;
    while ((m2 = stopRe.exec(bg))) {
      var c = rgb(m2[1]);
      if (c) stops.push({ a: c.a, pos: parseFloat(m2[2]) });
    }
    if (stops.length < 2) return null;
    var mr = media.getBoundingClientRect();
    var r = el.getBoundingClientRect();
    if (!mr.width) return null;
    var x = ((r.left + r.width / 2) - mr.left) / mr.width * 100;
    var a = stops[stops.length - 1].a;
    for (var i = 1; i < stops.length; i++) {
      if (x <= stops[i].pos) {
        var t = (x - stops[i - 1].pos) / Math.max(0.001, stops[i].pos - stops[i - 1].pos);
        a = stops[i - 1].a + t * (stops[i].a - stops[i - 1].a);
        break;
      }
    }
    var INK = { r: 14, g: 28, b: 30 };
    return { r: a * INK.r + (1 - a) * 255, g: a * INK.g + (1 - a) * 255, b: a * INK.b + (1 - a) * 255, a: 1, scrim: true };
  }

  // CORRECTION 6 - the photo layer. Returns the covering image element and the
  // host it sits in, or null. "Covering" is measured, not assumed: the layer
  // has to be out of flow AND its rect has to contain the text's rect.
  function photoLayer(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    var n = el.parentElement, guard = 0;
    while (n && n !== document.body && guard++ < 8) {
      var cand = n.querySelectorAll('img, video, [class*="__scene"], [class*="__media"]');
      for (var i = 0; i < cand.length; i++) {
        var im = cand[i];
        if (im === el || im.contains(el)) continue;
        var cs = getComputedStyle(im);
        if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
        if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
        var ir = im.getBoundingClientRect();
        if (ir.width < 40 || ir.height < 40) continue;
        if (ir.left <= r.left + 1 && ir.right >= r.right - 1 &&
            ir.top <= r.top + 1 && ir.bottom >= r.bottom - 1) return { layer: im, host: n };
      }
      n = n.parentElement;
    }
    return null;
  }

  // The gradient guarding that photo, if there is one. Looks at dedicated scrim
  // elements and at the layer's own ::before (the hero puts it there). Returns
  // the alpha covering this element, interpolated along the gradient's axis.
  // Everything painted between the photograph and the text, composited in
  // paint order. Two earlier versions of this were wrong in ways that produced
  // confident, wrong numbers:
  //
  //   a) they scanned the whole background-image string for colour stops, so an
  //      element with TWO gradients (the sub-page hero scrim has a horizontal
  //      ramp and a bottom lift) had the stops of both merged into one list and
  //      interpolated as if they were one gradient. That reported a=0.32 for a
  //      spot where the real coverage is 0.90.
  //   b) they returned a bare alpha and the caller composited it as dark ink.
  //      A layer has a COLOUR: .tib-hero__chip is 58% WHITE glass, and treating
  //      it as 58% ink turned a light backdrop into a dark one and reported
  //      dark-on-light text as 1.23:1.
  //
  // So: collect the layers with their real colours, bottom-first, and let the
  // caller composite them over a white and a black photograph.
  function splitLayers(bgImage) {
    var out = [], depth = 0, cur = '';
    var str = String(bgImage);
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map(function (x) { return x.trim(); }).filter(function (x) { return /gradient\(/.test(x); });
  }

  // One gradient, sampled where this element sits. Returns {r,g,b,a} or null.
  function sampleGradient(grad, box, el) {
    var vertical = /to top|to bottom/.test(grad);
    var toTop = /to top/.test(grad);
    var stopRe = /(rgba?\([^)]*\)|color\(srgb[^)]*\))\s*(?:([\d.]+)%)?/g;
    var stops = [], m, seen = 0;
    while ((m = stopRe.exec(grad))) {
      var c = rgb(m[1]);
      if (!c) continue;
      stops.push({ c: c, pos: m[2] === undefined ? null : parseFloat(m[2]) });
      seen++;
    }
    if (stops.length < 2) return stops.length === 1 ? stops[0].c : null;
    // fill in any implicit positions with even spacing
    if (stops[0].pos === null) stops[0].pos = 0;
    if (stops[stops.length - 1].pos === null) stops[stops.length - 1].pos = 100;
    for (var i2 = 1; i2 < stops.length - 1; i2++) {
      if (stops[i2].pos === null) stops[i2].pos = i2 / (stops.length - 1) * 100;
    }
    var br = box.getBoundingClientRect();
    var er = el.getBoundingClientRect();
    var pos;
    if (vertical) {
      if (!br.height) return null;
      pos = ((er.top + er.height / 2) - br.top) / br.height * 100;
      if (toTop) pos = 100 - pos;
    } else {
      if (!br.width) return null;
      pos = ((er.left + er.width / 2) - br.left) / br.width * 100;
    }
    if (pos <= stops[0].pos) return stops[0].c;
    for (var j = 1; j < stops.length; j++) {
      if (pos <= stops[j].pos) {
        var t = (pos - stops[j - 1].pos) / Math.max(0.001, stops[j].pos - stops[j - 1].pos);
        var A = stops[j - 1].c, B = stops[j].c;
        return { r: A.r + t * (B.r - A.r), g: A.g + t * (B.g - A.g),
                 b: A.b + t * (B.b - A.b), a: A.a + t * (B.a - A.a) };
      }
    }
    return stops[stops.length - 1].c;
  }

  // Does this box cover the element's box?
  function covers(box, el) {
    var nr = box.getBoundingClientRect(), er = el.getBoundingClientRect();
    return nr.left <= er.left + 1 && nr.right >= er.right - 1 &&
           nr.top <= er.top + 1 && nr.bottom >= er.bottom - 1;
  }

  // Every paint from one element (its background-color, then its gradients
  // bottom-first, then its ::before/::after), appended to `acc`.
  function paintsOf(node, cs, el, acc) {
    var c = rgb(cs.backgroundColor);
    if (c && c.a > 0.001) acc.push(c);
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && paintsArea(cs)) {
      var ls = splitLayers(cs.backgroundImage);
      for (var i = ls.length - 1; i >= 0; i--) {      // last listed paints lowest
        var g = sampleGradient(ls[i], node, el);
        if (g && g.a > 0.001) acc.push(g);
      }
    }
  }

  function layersOverPhoto(host, layer, el) {
    var acc = [];
    // dedicated scrim elements inside the host paint straight onto the photo
    var kids = host.querySelectorAll('[class*="scrim"], [class*="overlay"], [class*="veil"], [class*="tint"]');
    for (var i = 0; i < kids.length; i++) {
      var k = kids[i];
      if (k.contains(el)) continue;
      var kcs = getComputedStyle(k);
      if (kcs.position !== 'absolute' && kcs.position !== 'fixed') continue;
      if (!covers(k, el)) continue;
      paintsOf(k, kcs, el, acc);
    }
    var pseudo = getComputedStyle(layer, '::before');
    if (pseudo && pseudo.content !== 'none') paintsOf(layer, pseudo, el, acc);

    // then the chain from the host down to the element: outermost paints first
    var chain = [], n = el, guard = 0;
    while (n && guard++ < 10) { chain.push(n); if (n === host) break; n = n.parentElement; }
    chain.reverse();
    for (var j = 0; j < chain.length; j++) {
      var node = chain[j];
      if (node === host) continue;                    // host is behind the photo
      if (!covers(node, el)) continue;
      var ncs = getComputedStyle(node);
      paintsOf(node, ncs, el, acc);
      for (var q = 0; q < 2; q++) {
        var pc = getComputedStyle(node, q ? '::after' : '::before');
        if (pc && pc.content !== 'none') paintsOf(node, pc, el, acc);
      }
    }
    return acc;
  }

  function compositeOver(base, layers) {
    var c = { r: base.r, g: base.g, b: base.b };
    for (var i = 0; i < layers.length; i++) {
      var L = layers[i], a = Math.max(0, Math.min(1, L.a));
      c = { r: a * L.r + (1 - a) * c.r, g: a * L.g + (1 - a) * c.g, b: a * L.b + (1 - a) * c.b };
    }
    return { r: c.r, g: c.g, b: c.b, a: 1 };
  }

  // Order matters: an element sitting inside an opaque tile is backed by the
  // TILE, not by the scrim behind it. Checking the scrim first reported a stat
  // label on a 62%-dark glass tile as 1.51:1 against the photo. Scrim is the
  // fallback for text with no real backdrop of its own.
  function effectiveBg(el) {
    // If this element sits in a section whose media is full-bleed, the ancestor
    // walk must STOP at that section — beyond it lies body's opaque paper, which
    // would be reported as the backdrop for text that is actually over a photo.
    // CORRECTION 6 first: a photograph covering this element beats anything an
    // ancestor paints, because the photo is painted over that ancestor.
    var photo = photoLayer(el);
    if (photo) {
      var stack = layersOverPhoto(photo.host, photo.layer, el);
      // The photograph's pixels are unknown, so composite the real layer stack
      // over a white and a black photograph and let the caller take the worse.
      var cover = 0;
      for (var li = 0; li < stack.length; li++) cover = 1 - (1 - cover) * (1 - Math.max(0, Math.min(1, stack[li].a)));
      return {
        photo: true, alpha: cover,
        over255: compositeOver({ r: 255, g: 255, b: 255 }, stack),
        over0:   compositeOver({ r: 0, g: 0, b: 0 }, stack),
      };
    }

    var scrim = scrimBackdrop(el);
    var boundary = scrim ? el.closest('.rw-sec, section, header') : null;

    var own = getComputedStyle(el);
    var ownC = rgb(own.backgroundColor);
    if (ownC && ownC.a > 0.3) return ownC;
    if (own.backgroundImage && own.backgroundImage !== 'none' && paintsArea(own)) {
      var og = gradientAvg(own.backgroundImage);
      if (og) return og;
    }
    var n = el.parentElement;
    while (n && n !== document.documentElement) {
      if (boundary && n === boundary) return scrim;
      var cs = getComputedStyle(n);
      var c = rgb(cs.backgroundColor);
      if (c && c.a > 0.3) return c;
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && paintsArea(cs)) {
        var g = gradientAvg(cs.backgroundImage);
        if (g) return g;
      }
      n = n.parentElement;
    }
    if (scrim) return scrim;
    return { r: 242, g: 247, b: 246, a: 1 };
  }

  if (document.documentElement.scrollWidth > W + 1) {
    push('h-overflow', '(document)', document.documentElement.scrollWidth + ' > ' + W);
  }

  [].slice.call(document.querySelectorAll('.rw-sec')).forEach(function (s) {
    var r = s.getBoundingClientRect();
    if (r.height < 40 && (s.textContent || '').trim().length > 30) {
      push('collapsed-section', name(s), Math.round(r.height) + 'px tall but has text');
    }
  });

  // CORRECTION 7 - an element wider than the viewport is only a problem if the
  // page can actually scroll to it. The hero image carries a reveal zoom
  // (transform: scale(1.048)), which getBoundingClientRect() includes, inside a
  // parent with overflow:hidden; it was reported at 789px vs 768 on three
  // viewports while document.scrollWidth stayed at 751. Clipped is not wide.
  function clippedByAncestor(el) {
    var n = el.parentElement, guard = 0;
    while (n && n !== document.documentElement && guard++ < 12) {
      var cs = getComputedStyle(n);
      if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') {
        var nr = n.getBoundingClientRect();
        if (nr.width <= W + 2) return true;
      }
      n = n.parentElement;
    }
    return false;
  }
  var docOverflows = document.documentElement.scrollWidth > W + 1;
  [].slice.call(document.querySelectorAll('main *')).slice(0, 2500).forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width > W + 2 && r.height > 0 && getComputedStyle(el).position !== 'fixed') {
      if (!docOverflows && clippedByAncestor(el)) return;
      push('too-wide', name(el), Math.round(r.width) + 'px vs ' + W);
    }
  });

  [].slice.call(document.querySelectorAll('main p, main h1, main h2, main h3, main li, main span, main a'))
    .slice(0, 1200).forEach(function (el) {
      var t = (el.textContent || '').trim();
      if (t.length < 6 || el.children.length) return;
      var r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      var cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.opacity === '0') return;
      if (/rgba\(0, 0, 0, 0\)|transparent/.test(cs.webkitTextFillColor || '') || cs.color === 'rgba(0, 0, 0, 0)') return;
      var fg = rgb(cs.color);
      if (!fg) return;
      var bg = effectiveBg(el);
      var ratio, note = '';
      if (bg.photo) {
        // worst case over an unknown photograph: whichever extreme is worse
        var L1p = lum(fg) + 0.05;
        var rW = (function (c) { var L = lum(c) + 0.05; return L1p > L ? L1p / L : L / L1p; })(bg.over255);
        var rB = (function (c) { var L = lum(c) + 0.05; return L1p > L ? L1p / L : L / L1p; })(bg.over0);
        ratio = Math.min(rW, rB);
        note = '  over photo, scrim a=' + bg.alpha.toFixed(2);
      } else {
        var L1 = lum(fg) + 0.05, L2 = lum(bg) + 0.05;
        ratio = L1 > L2 ? L1 / L2 : L2 / L1;
      }
      if (ratio < 3) push('low-contrast', name(el), ratio.toFixed(2) + ':1  "' + t.slice(0, 26) + '"' + note);
    });

  var GLASS = '.et-svc,.et-cat,.et-review,.dc-rel,.ha-cond,.ia-panel,.ia-link,.bw-toc,'
            + '.od-close__info,.ct-route,.dc-relhub,.ethc-why__row,.bw-team__member,.search-hit';
  [].slice.call(document.querySelectorAll(GLASS)).forEach(function (el) {
    var cs = getComputedStyle(el);
    var c = rgb(cs.backgroundColor);
    if ((!c || c.a < 0.05) && cs.backgroundImage === 'none') push('unstyled-surface', name(el), 'bg=' + cs.backgroundColor);
  });

  [].slice.call(document.images).forEach(function (i) {
    if (i.complete && i.naturalWidth === 0) push('broken-image', name(i), i.getAttribute('src') || '?');
    var r = i.getBoundingClientRect();
    if (r.width < 2 && r.height < 2 && i.loading !== 'lazy') push('zero-size-image', name(i), i.getAttribute('src') || '?');
  });

  var counts = {};
  out.forEach(function (o) { counts[o.kind] = (counts[o.kind] || 0) + 1; });
  return { url: location.pathname, viewport: W, counts: counts, findings: out };
};
