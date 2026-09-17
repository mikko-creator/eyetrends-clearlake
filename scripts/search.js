/* Client-side site search over /search-index.json.
   The source served /search from its platform; a static host cannot, so the
   query runs in the browser and the URL shape (/search?s=term) is unchanged. */
(function () {
  'use strict';
  var input = document.getElementById('s');
  var status = document.getElementById('search-status');
  var list = document.getElementById('search-results');
  if (!input || !list) return;

  var DOCS = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function terms(q) {
    return (q.toLowerCase().match(/[a-z0-9']{2,}/g) || []).slice(0, 8);
  }

  function score(doc, ts) {
    var t = doc.t.toLowerCase(), d = doc.d.toLowerCase(), h = doc.h.toLowerCase(), b = doc.b.toLowerCase();
    var s = 0, matchedAll = true;
    for (var i = 0; i < ts.length; i++) {
      var term = ts[i], hit = 0;
      if (t.indexOf(term) > -1) { s += 12; hit = 1; }
      if (h.indexOf(term) > -1) { s += 5; hit = 1; }
      if (d.indexOf(term) > -1) { s += 4; hit = 1; }
      var n = b.split(term).length - 1;
      if (n) { s += Math.min(n, 8); hit = 1; }
      if (!hit) matchedAll = false;
    }
    return matchedAll ? s : 0;
  }

  function snippet(doc, ts) {
    var b = doc.b, lower = b.toLowerCase(), at = -1;
    for (var i = 0; i < ts.length && at < 0; i++) at = lower.indexOf(ts[i]);
    if (at < 0) return esc(b.slice(0, 190)) + (b.length > 190 ? '…' : '');
    var start = Math.max(0, at - 80);
    var text = (start ? '…' : '') + b.slice(start, start + 220) + (b.length > start + 220 ? '…' : '');
    var out = esc(text);
    for (var k = 0; k < ts.length; k++) {
      out = out.replace(new RegExp('(' + ts[k].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    }
    return out;
  }

  function render(q) {
    var ts = terms(q);
    list.innerHTML = '';
    if (!DOCS) { status.textContent = 'Loading the index…'; return; }
    if (!ts.length) { status.textContent = 'Type a search term above.'; return; }
    var hits = DOCS.map(function (d) { return { d: d, s: score(d, ts) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 25);
    status.textContent = hits.length
      ? hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for “' + q + '”'
      : 'No results for “' + q + '”. Try a broader term, or call (281) 488-0066.';
    hits.forEach(function (x) {
      var li = document.createElement('li');
      li.className = 'search-hit';
      li.innerHTML = '<a class="search-hit__t" href="' + x.d.u + '">' + esc(x.d.t) + '</a>'
        + '<p class="search-hit__u">' + esc(x.d.u) + '</p>'
        + '<p class="search-hit__s">' + snippet(x.d, ts) + '</p>';
      list.appendChild(li);
    });
  }

  var q = new URLSearchParams(location.search).get('s') || '';
  input.value = q;

  fetch('/eyetrends-clearlake/search-index.json')
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (j) { DOCS = j.docs; render(input.value); })
    .catch(function (e) {
      status.textContent = 'The search index could not be loaded (' + e.message + '). Call (281) 488-0066 and we will point you to the right page.';
    });

  var t = null;
  input.addEventListener('input', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      render(input.value);
      var url = input.value ? '/search/?s=' + encodeURIComponent(input.value) : '/eyetrends-clearlake/search/';
      history.replaceState(null, '', url);
    }, 140);
  });
})();
