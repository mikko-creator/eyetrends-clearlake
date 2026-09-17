// Spacing and padding audit, run inside a sized same-origin iframe.
//
// The alignment audit (tools/audit-align.js) measures whether things LINE UP.
// This one measures whether the space around them is right, which is a
// different failure and the one that survives a clean alignment report:
//
//   · section vertical rhythm that breaks between neighbouring bands
//   · a container whose left and right insets differ
//   · cards of the same class padded differently on the same page
//   · content sitting hard against the edge of the box that holds it
//   · a large dead gap between two consecutive blocks
//   · the last child of a padded box adding its own bottom margin on top of
//     the box's padding, which doubles the space under it
//   · a padded-looking surface that computes to no padding at all
//
// It reports raw measurements as well as findings, because thresholds picked in
// advance are how an audit invents problems it then "fixes".
window.__srSpace = function () {
  var W = window.innerWidth;
  var out = [];
  var data = { sections: [], cards: {}, gaps: [] };
  function push(kind, sel, detail) { if (out.length < 240) out.push({ kind: kind, sel: sel, detail: String(detail) }); }
  function name(el) {
    if (!el) return '(none)';
    var c = (el.getAttribute && el.getAttribute('class') || '').trim().split(/\s+/).slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (c ? '.' + c : '');
  }
  var R = function (n) { return Math.round(n); };
  function cs(el) { return getComputedStyle(el); }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function visible(el) {
    var s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  var secs = [].slice.call(document.querySelectorAll('.rw-sec')).filter(visible);

  // --- 1 · section vertical rhythm -----------------------------------------
  // A full-bleed hero legitimately has no vertical padding, so sections with no
  // .container child are recorded but excluded from the rhythm comparison.
  secs.forEach(function (s) {
    var st = cs(s);
    var hasContainer = !!s.querySelector(':scope > .container');
    data.sections.push({
      sel: name(s), pt: R(num(st.paddingTop)), pb: R(num(st.paddingBottom)),
      mt: R(num(st.marginTop)), mb: R(num(st.marginBottom)),
      h: R(s.getBoundingClientRect().height), container: hasContainer,
    });
  });
  var padded = data.sections.filter(function (d) { return d.container; });
  function mode(list) {
    var m = {}; list.forEach(function (v) { m[v] = (m[v] || 0) + 1; });
    return +Object.keys(m).sort(function (a, b) { return m[b] - m[a] || b - a; })[0];
  }
  if (padded.length > 2) {
    var ptMode = mode(padded.map(function (d) { return d.pt; }));
    var pbMode = mode(padded.map(function (d) { return d.pb; }));
    padded.forEach(function (d) {
      if (Math.abs(d.pt - ptMode) > 10) push('section-pad-top', d.sel, d.pt + ' vs usual ' + ptMode);
      if (Math.abs(d.pb - pbMode) > 10) push('section-pad-bottom', d.sel, d.pb + ' vs usual ' + pbMode);
    });
  }

  // --- 2 · the seam between consecutive sections ---------------------------
  // A section that still carries the scroll-reveal's resting transform sits
  // 26px below where it will finally land, which shows up as a +26px gap above
  // it and a -26px overlap below. That is the animation mid-flight, not a
  // layout fault, and it produced six "findings" on /services/ at every
  // viewport. Measure from the UNTRANSFORMED box instead.
  function settledRect(el) {
    var r = el.getBoundingClientRect();
    var t = cs(el).transform;
    if (!t || t === 'none') return r;
    var m = /matrix\(([^)]+)\)/.exec(t);
    if (!m) return r;
    var parts = m[1].split(',').map(parseFloat);
    var dy = parts.length >= 6 ? parts[5] : 0;
    if (!dy) return r;
    return { top: r.top - dy, bottom: r.bottom - dy, left: r.left, right: r.right,
             width: r.width, height: r.height };
  }
  for (var i = 1; i < secs.length; i++) {
    var prev = settledRect(secs[i - 1]);
    var cur = settledRect(secs[i]);
    var gap = R(cur.top - prev.bottom);
    data.gaps.push({ a: name(secs[i - 1]), b: name(secs[i]), gap: gap });
    if (gap > 8) push('section-seam-gap', name(secs[i]), gap + 'px of dead space above it');
    if (gap < -8) push('section-overlap', name(secs[i]), gap + 'px overlapping the one above');
  }

  // --- 3 · container insets must be symmetric ------------------------------
  [].slice.call(document.querySelectorAll('.container, .container--full, .wrap')).filter(visible).forEach(function (c) {
    var s = cs(c);
    var l = num(s.paddingLeft), r = num(s.paddingRight);
    if (Math.abs(l - r) > 1) push('container-asymmetric', name(c), 'padding-left ' + R(l) + ' vs right ' + R(r));
  });

  // --- 4 · same-class boxes, different padding -----------------------------
  // Groups by the FIRST class only: that is the component, and two instances of
  // one component on one page should be padded the same.
  var groups = {};
  [].slice.call(document.querySelectorAll('main [class]')).slice(0, 3000).forEach(function (el) {
    if (!visible(el)) return;
    var first = (el.getAttribute('class') || '').trim().split(/\s+/)[0];
    if (!first || first.indexOf('__') === -1 && first.length < 5) return;
    var s = cs(el);
    var pad = [R(num(s.paddingTop)), R(num(s.paddingRight)), R(num(s.paddingBottom)), R(num(s.paddingLeft))].join('/');
    (groups[first] = groups[first] || []).push({ el: el, pad: pad });
  });
  Object.keys(groups).forEach(function (k) {
    var list = groups[k];
    if (list.length < 2) return;
    var seen = {};
    list.forEach(function (x) { seen[x.pad] = (seen[x.pad] || 0) + 1; });
    var variants = Object.keys(seen);
    if (variants.length > 1) {
      // ignore a single odd one out that is a deliberate modifier (--lg etc.)
      var mods = list.some(function (x) { return /--/.test(x.el.getAttribute('class') || ''); });
      if (!mods) push('card-pad-mismatch', '.' + k, list.length + ' instances, padding ' + variants.join('  |  '));
    }
    data.cards[k] = variants.join(' | ');
  });

  // --- 5 · content hard against the edge of a padded box -------------------
  [].slice.call(document.querySelectorAll('main p, main h2, main h3, main li, main span[class]'))
    .slice(0, 1500).forEach(function (el) {
      if (!visible(el)) return;
      var t = (el.textContent || '').trim();
      if (t.length < 10 || el.children.length) return;
      var box = el.parentElement;
      if (!box) return;
      var bs = cs(box);
      var bp = num(bs.paddingLeft);
      if (bp < 6) return;                       // parent isn't a padded surface
      var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
      var inset = er.left - (br.left + bp);
      if (inset < -2) push('escapes-padding', name(el), R(inset) + 'px outside ' + name(box) + ' content box');
    });

  // --- 6 · doubled bottom space inside a padded box ------------------------
  [].slice.call(document.querySelectorAll('main [class]')).slice(0, 2000).forEach(function (box) {
    if (!visible(box)) return;
    var bs = cs(box);
    var pb = num(bs.paddingBottom);
    if (pb < 10) return;
    var kids = [].slice.call(box.children).filter(visible);
    if (!kids.length) return;
    var last = kids[kids.length - 1];
    var mb = num(cs(last).marginBottom);
    if (mb > 8) push('double-bottom-space', name(box), 'padding-bottom ' + R(pb) + ' + last child margin-bottom ' + R(mb));
  });

  // --- 7 · a surface that looks padded but is not --------------------------
  var SURFACES = '.et-svc,.et-cat,.et-review,.dc-rel,.ha-cond,.ia-panel,.ia-link,.bw-toc,'
               + '.od-close__info,.ct-route,.dc-relhub,.ethc-why__row,.bw-team__member,.search-hit,.et-frame';
  [].slice.call(document.querySelectorAll(SURFACES)).filter(visible).forEach(function (el) {
    var s = cs(el);
    var p = num(s.paddingTop) + num(s.paddingRight) + num(s.paddingBottom) + num(s.paddingLeft);
    if (p !== 0 || (el.textContent || '').trim().length <= 20) return;
    // A card with no padding of its own is normal and usually correct: .et-frame
    // is edge-to-edge media plus a padded .et-frame__body, and an unpadded
    // surface reported that as a fault 72 times. What matters is not where the
    // padding is declared but whether TEXT ends up against the edge, so measure
    // the text instead of the box.
    var edge = null;
    var er0 = el.getBoundingClientRect();
    var leaves = [].slice.call(el.querySelectorAll('p, h1, h2, h3, h4, li, span, a'));
    for (var q = 0; q < leaves.length; q++) {
      var lf = leaves[q];
      if (lf.children.length || (lf.textContent || '').trim().length < 8) continue;
      if (!visible(lf)) continue;
      if (cs(lf).position === 'absolute') continue;     // a tag pinned over the art
      var lr = lf.getBoundingClientRect();
      var inset = Math.min(lr.left - er0.left, er0.right - lr.right);
      if (edge === null || inset < edge) edge = inset;
    }
    if (edge !== null && edge < 6) {
      push('surface-unpadded', name(el), 'text sits ' + R(edge) + 'px from the edge of the surface');
    }
  });

  // --- 8 · a big dead gap between consecutive blocks in one section --------
  secs.forEach(function (s) {
    var holder = s.querySelector(':scope > .container') || s;
    var kids = [].slice.call(holder.children).filter(visible);
    for (var j = 1; j < kids.length; j++) {
      var a = kids[j - 1].getBoundingClientRect(), b = kids[j].getBoundingClientRect();
      if (b.top < a.bottom) continue;          // side by side or overlapping
      var g = R(b.top - a.bottom);
      if (g > 120) push('dead-gap', name(s), g + 'px between ' + name(kids[j - 1]) + ' and ' + name(kids[j]));
    }
  });

  // --- 9 · slack piled at one end of a side-by-side row -------------------
  // A height difference between columns is NOT by itself a fault: a short
  // picture beside long copy is normal, and centring it distributes the
  // difference above and below so it reads as composition. What is a fault is
  // slack DUMPED at one end - all of it under the image, none above - which is
  // what top alignment does and what reads as a hole in the page.
  //
  // So measure where the empty space actually sits, not how unequal the columns
  // are. An earlier version flagged the raw delta and kept reporting rows that
  // had already been fixed by centring them.
  [].slice.call(document.querySelectorAll('.row')).filter(visible).forEach(function (row) {
    var kids = [].slice.call(row.children).filter(visible);
    if (kids.length < 2) return;
    var rects = kids.map(function (k) { return k.getBoundingClientRect(); });
    var sideBySide = rects.every(function (r) { return Math.abs(r.top - rects[0].top) < 24; })
      && rects.some(function (r) { return Math.abs(r.left - rects[0].left) > 40; });
    if (!sideBySide) return;
    var rowTop = Math.min.apply(null, rects.map(function (r) { return r.top; }));
    var rowBot = Math.max.apply(null, rects.map(function (r) { return r.bottom; }));
    kids.forEach(function (k) {
      var inner = [].slice.call(k.children).filter(visible);
      if (!inner.length) return;
      var top = Math.min.apply(null, inner.map(function (c) { return c.getBoundingClientRect().top; }));
      var bot = Math.max.apply(null, inner.map(function (c) { return c.getBoundingClientRect().bottom; }));
      var above = top - rowTop, below = rowBot - bot;
      data.gaps.push({ row: name(row), col: name(k), above: R(above), below: R(below) });
      var worst = Math.max(above, below), other = Math.min(above, below);
      if (worst > 100 && other < 24) {
        push('slack-at-one-end', name(row),
          R(worst) + 'px of empty space ' + (below > above ? 'below' : 'above') + ' ' + name(k)
          + ' (other end ' + R(other) + 'px)');
      }
    });
  });

  // --- 10 · trailing dead space inside a section ---------------------------
  secs.forEach(function (s) {
    var holder = s.querySelector(':scope > .container');
    if (!holder) return;
    var kids = [].slice.call(holder.children).filter(visible);
    if (!kids.length) return;
    var last = kids[kids.length - 1].getBoundingClientRect();
    var hr = holder.getBoundingClientRect();
    var trail = R(hr.bottom - last.bottom);
    if (trail > 40) push('trailing-space', name(s), trail + 'px below the last block, inside the container');
  });

  var counts = {};
  out.forEach(function (o) { counts[o.kind] = (counts[o.kind] || 0) + 1; });
  return { url: location.pathname, viewport: W, counts: counts, findings: out, data: data };
};
