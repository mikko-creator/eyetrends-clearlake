// Mobile audit, run inside a sized same-origin iframe.
//
// Desktop-clean is not mobile-clean. This measures the things that only go
// wrong on a phone, and it measures them rather than assuming a breakpoint is
// enough:
//
//   · tap targets below the 44px floor, and targets too close together
//   · body text below 16px, and form inputs below 16px (which makes iOS zoom
//     the page on focus, a real and very visible bug)
//   · a viewport meta that blocks pinch-zoom
//   · images delivered far larger than they are displayed
//   · text that cannot wrap and forces the page wide
//   · the sticky header eating the viewport
//
// It also returns the rendered width of every image, which is what the build
// needs in order to emit an honest `sizes` attribute instead of a guess.
window.__srMobile = function () {
  var W = window.innerWidth;
  var out = [];
  var images = [];
  function push(kind, sel, detail) { if (out.length < 260) out.push({ kind: kind, sel: sel, detail: String(detail) }); }
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
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    var r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    // Parked off-screen is hidden. The appointment form's honeypot lives in a
    // 1px box at left:-9999px with overflow:hidden; its two inputs are still
    // 46x46 inside that clip, so a rect-only test reported them as visible
    // 13.3px controls on every page - and "fixing" them would have meant
    // styling a spam trap that no human can reach.
    if (r.right < 0 || r.bottom < 0) return false;
    if (r.left > document.documentElement.clientWidth) return false;
    // clipped to nothing by an ancestor
    var n = el.parentElement, guard = 0;
    while (n && guard++ < 6) {
      var ns = cs(n);
      if (ns.overflow !== 'visible') {
        var nr = n.getBoundingClientRect();
        if (nr.width <= 2 || nr.height <= 2) return false;
        if (nr.right < 0 || nr.bottom < 0) return false;
      }
      n = n.parentElement;
    }
    return true;
  }

  // --- 1 · viewport meta ----------------------------------------------------
  var vp = document.querySelector('meta[name="viewport"]');
  if (!vp) push('viewport-missing', 'head', 'no viewport meta');
  else {
    var c = (vp.getAttribute('content') || '');
    if (/user-scalable\s*=\s*no/i.test(c)) push('viewport-no-zoom', 'head', c);
    if (/maximum-scale\s*=\s*1(\.0)?\b/i.test(c)) push('viewport-max-scale', 'head', c);
    if (!/width\s*=\s*device-width/i.test(c)) push('viewport-no-device-width', 'head', c);
  }

  // --- 2 · tap targets ------------------------------------------------------
  // Anything a finger is meant to hit. 44px is the accessibility floor; the
  // rect is measured, not the declared padding, because a link inside flowing
  // prose is a different case and is excluded below.
  var hits = [].slice.call(document.querySelectorAll('a[href], button, [role="button"], input, select, textarea, summary, label'));
  var targets = [];
  hits.forEach(function (el) {
    if (!visible(el)) return;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // an inline link inside a paragraph is read, not tapped as a control
    var inProse = el.tagName === 'A' && el.parentElement
      && /^(P|LI|SPAN)$/.test(el.parentElement.tagName)
      && cs(el).display.indexOf('inline') === 0;
    // A <label> sitting above its field is TEXT, not a finger target: the field
    // underneath is what gets tapped, and the label only forwards focus. All 96
    // "small tap target" findings on a phone were field labels like "Your name",
    // which is the form working correctly. A label that WRAPS its own control -
    // the checkbox and radio pattern - is a real target and still counts.
    var isFieldLabel = el.tagName === 'LABEL'
      && !el.querySelector('input, select, textarea');
    targets.push({ el: el, r: r, inProse: inProse, label: isFieldLabel });
    if (!inProse && !isFieldLabel && (r.height < 44 || r.width < 24)) {
      push('tap-target-small', name(el), R(r.width) + 'x' + R(r.height) + '  "' + (el.textContent || '').trim().slice(0, 22) + '"');
    }
  });
  // two controls closer than 8px are hard to hit apart
  for (var i = 0; i < targets.length && i < 400; i++) {
    for (var j = i + 1; j < targets.length && j < 400; j++) {
      var a = targets[i], b = targets[j];
      if (a.inProse || b.inProse) continue;
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      // A label is MEANT to sit tight against the control it names; 132 of the
      // 139 crowding findings were a label and its own input. Only flag a pair
      // when neither is a label.
      if (a.label || b.label) continue;
      var dx = Math.max(0, Math.max(a.r.left - b.r.right, b.r.left - a.r.right));
      var dy = Math.max(0, Math.max(a.r.top - b.r.bottom, b.r.top - a.r.bottom));
      if (dx === 0 && dy === 0) continue;                  // overlapping/nested
      var gap = Math.max(dx, dy);
      if (gap > 0 && gap < 8 && (dx === 0 || dy === 0)) {
        push('tap-targets-crowded', name(a.el), R(gap) + 'px from ' + name(b.el));
      }
    }
  }

  // --- 3 · type size --------------------------------------------------------
  // Only PROSE is judged here. A pill, an eyebrow, a stat caption and a tag are
  // meant to be small - they are labels, not reading matter - and flagging them
  // produced 81 findings a phone user would never experience as a problem. The
  // test is a run of real sentence-length text.
  var LABELISH = /pill|eyebrow|tag|chip|kicker|micro|badge|stat__l|subhead|caption|__cap|suf|meta/i;
  [].slice.call(document.querySelectorAll('main p, main li, main td'))
    .slice(0, 900).forEach(function (el) {
      if (!visible(el) || el.children.length) return;
      var t = (el.textContent || '').trim();
      if (t.length < 60) return;
      if (LABELISH.test(el.getAttribute('class') || '')) return;
      var fs = num(cs(el).fontSize);
      if (fs < 14) push('body-text-small', name(el), fs.toFixed(1) + 'px  "' + t.slice(0, 24) + '"');
    });
  // iOS zooms the whole page when a focused input is under 16px
  [].slice.call(document.querySelectorAll('input, select, textarea')).forEach(function (el) {
    if (!visible(el)) return;
    var fs = num(cs(el).fontSize);
    if (fs < 16) push('input-font-zooms-ios', name(el), fs.toFixed(1) + 'px (needs >= 16)');
  });

  // --- 4 · over-delivered images -------------------------------------------
  [].slice.call(document.images).forEach(function (im) {
    var r = im.getBoundingClientRect();
    if (r.width < 2) return;
    var src = (im.currentSrc || im.src || '').split('?')[0];
    images.push({
      src: src.replace(location.origin, ''),
      cssWidth: R(r.width), cssHeight: R(r.height),
      natural: im.naturalWidth + 'x' + im.naturalHeight,
      hasSrcset: !!im.getAttribute('srcset'),
      lazy: im.getAttribute('loading') === 'lazy',
    });
    if (!im.naturalWidth) return;
    // at DPR 2 a phone wants about twice the CSS width; more than 2.5x that is
    // bytes nobody sees
    var over = im.naturalWidth / Math.max(1, r.width);
    if (over > 2.6 && r.width > 40) {
      push('image-oversized', name(im), im.naturalWidth + 'px source for a ' + R(r.width) + 'px box (' + over.toFixed(1) + 'x)');
    }
  });

  // --- 5 · things that cannot wrap -----------------------------------------
  [].slice.call(document.querySelectorAll('main *')).slice(0, 2000).forEach(function (el) {
    if (el.children.length || !visible(el)) return;
    var t = (el.textContent || '').trim();
    if (t.length < 12) return;
    var s = cs(el);
    if (s.whiteSpace === 'nowrap' || s.whiteSpace === 'pre') {
      var r = el.getBoundingClientRect();
      if (r.width > W * 0.92) push('nowrap-too-wide', name(el), R(r.width) + 'px of ' + W + ', white-space:' + s.whiteSpace);
    }
  });

  // --- 6 · sticky chrome vs the viewport -----------------------------------
  var stuck = [].slice.call(document.querySelectorAll('header, .site-head, [class*="sticky"]')).filter(function (el) {
    var p = cs(el).position; return (p === 'fixed' || p === 'sticky') && visible(el);
  });
  var stuckH = 0;
  stuck.forEach(function (el) { stuckH += el.getBoundingClientRect().height; });
  if (stuckH > window.innerHeight * 0.25) {
    push('sticky-eats-viewport', 'header', R(stuckH) + 'px of ' + window.innerHeight + 'px viewport');
  }

  var counts = {};
  out.forEach(function (o) { counts[o.kind] = (counts[o.kind] || 0) + 1; });
  return { url: location.pathname, viewport: W, counts: counts, findings: out, images: images };
};
