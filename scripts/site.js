/* Eye Trends — Aurora Glass behaviour layer.
   No dependencies, no tracking, no third-party calls.

   Effects here that the source site had none of:
     · blur-in scroll reveal with sibling stagger
     · pointer-tracked specular sheen across every glass surface
     · header that detaches into a floating pill on scroll
     · depth parallax on framed media
     · count-up statistics
     · scroll progress + back-to-top
   Everything degrades open: with reduced motion or no IntersectionObserver,
   content is shown, not hidden. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var docEl = document.documentElement;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ------------------------------------------------- 1 · BLUR-IN REVEAL --- */
  var revealItems = [].slice.call(document.querySelectorAll('.reveal'));

  if (revealItems.length) {
    if (reduce || !hasIO) {
      revealItems.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          io.unobserve(el);
          var parent = el.parentElement, idx = 0;
          if (parent) {
            var sibs = [].slice.call(parent.children).filter(function (c) {
              return c.classList && c.classList.contains('reveal');
            });
            idx = Math.max(0, sibs.indexOf(el));
          }
          el.style.transitionDelay = Math.min(idx, 6) * 90 + 'ms';
          el.classList.add('in-view');
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      revealItems.forEach(function (el) { io.observe(el); });

      // Fail open: never leave anything invisible if the observer misfires.
      var sweepIn = function (factor) {
        revealItems.forEach(function (el) {
          if (el.classList.contains('in-view')) return;
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * factor && r.bottom > -200) el.classList.add('in-view');
        });
      };
      setTimeout(function () { sweepIn(1); }, 120);
      window.addEventListener('load', function () { setTimeout(function () { sweepIn(1.2); }, 200); });
    }
  }

  /* ------------------------------------- 2 · SPECULAR SHEEN ON GLASS ------ */
  // One delegated pointer listener; each surface gets --mx/--my in its own box.
  var GLASS = '.glass, .et-card, .dc-pill, .dc-rel, .ha-cond, .et-svc, .mcard,'
            + '.ia-card, .bw-card, .ct-card, .search-hit, .book-form, .dc-faq__item';
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var el = e.target && e.target.closest ? e.target.closest(GLASS) : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }

  /* ------------------------------------------------ 3 · COUNT-UP STATS ---- */
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    if (isNaN(to)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (String(to).split('.')[1] || '').length;
    if (reduce) { el.textContent = to.toFixed(decimals) + suffix; return; }
    var dur = 1500, start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(decimals) + suffix;
      if (p < 1) raf(tick);
    }
    raf(tick);
  }
  var counters = [].slice.call(document.querySelectorAll('[data-to]'));
  if (counters.length) {
    if (!hasIO) counters.forEach(runCount);
    else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          cio.unobserve(e.target);
          runCount(e.target);
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* --------------------------------- 4 · PARALLAX ON FRAMED MEDIA -------- */
  var parallax = [];
  if (!reduce) {
    parallax = [].slice.call(document.querySelectorAll(
      '.dc-frame img, .ethc-hero__media img, .et-media img, .tib-hero__media img'
    ));
  }

  /* ------------------------------- 5 · HEADER / PROGRESS / BACK TO TOP --- */
  var head = document.getElementById('site-head');
  var progressBar = null;

  if (!reduce) {
    var prog = document.createElement('div');
    prog.className = 'rf-progress';
    prog.innerHTML = '<div class="bar"></div>';
    document.body.appendChild(prog);
    progressBar = prog.firstChild;
  }

  var toTop = document.createElement('button');
  toTop.className = 'rf-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.body.appendChild(toTop);

  var stuck = null, topVis = null, ticking = false;

  function frame() {
    var y = window.pageYOffset || docEl.scrollTop;

    if (head) {
      var s = y > 24;
      if (s !== stuck) {
        stuck = s;
        head.classList.toggle('is-stuck', s);
        head.classList.toggle('at-top', !s);
        document.body.classList.toggle('is-scrolled', s);
      }
    }
    if (progressBar) {
      var max = Math.max(1, docEl.scrollHeight - window.innerHeight);
      progressBar.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
    }
    var v = y > Math.max(700, window.innerHeight * 1.2);
    if (v !== topVis) { topVis = v; toTop.classList.toggle('is-visible', v); }

    // depth: media drifts slightly slower than the page
    for (var i = 0; i < parallax.length; i++) {
      var img = parallax[i];
      var r = img.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) continue;
      var mid = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      img.style.setProperty('--py', (-mid * 16).toFixed(2) + 'px');
      img.style.transform = 'translate3d(0,' + (-mid * 16).toFixed(2) + 'px,0) scale(1.06)';
    }
    ticking = false;
  }
  function onScroll() { if (ticking) return; ticking = true; raf(frame); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  frame();

  /* ------------------------------------------------------ 6 · MOBILE NAV -- */
  var burger = document.querySelector('.burger');
  var mob = document.getElementById('mobile-nav');
  if (burger && mob) {
    var setNav = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      mob.hidden = !open;
      document.body.classList.toggle('nav-open', open);
    };
    burger.addEventListener('click', function () { setNav(mob.hidden); });
    mob.addEventListener('click', function (e) { if (e.target.tagName === 'A') setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mob.hidden) { setNav(false); burger.focus(); }
    });
  }

  /* --------------------------------------------------- 7 · SEARCH PANEL --- */
  var sBtn = document.querySelector('.head-search');
  var sPanel = document.getElementById('site-search');
  if (sBtn && sPanel) {
    var sInput = sPanel.querySelector('input[name="s"]');
    var sClose = sPanel.querySelector('.search-panel__close');
    var openSearch = function (open) {
      sPanel.hidden = !open;
      sBtn.setAttribute('aria-expanded', String(open));
      if (open && sInput) sInput.focus();
    };
    sBtn.addEventListener('click', function () { openSearch(sPanel.hidden); });
    if (sClose) sClose.addEventListener('click', function () { openSearch(false); sBtn.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sPanel.hidden) { openSearch(false); sBtn.focus(); }
    });
  }

  /* ----------------------------------------------- 8 · MEGA MENU KEYBOARD - */
  [].slice.call(document.querySelectorAll('.nv-has-mega > .nv-link')).forEach(function (link) {
    var item = link.parentElement;
    link.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var first = item.querySelector('.mcol-head, .mcard');
        if (first) first.focus();
      }
    });
    item.addEventListener('focusin', function () { link.setAttribute('aria-expanded', 'true'); });
    item.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!item.contains(document.activeElement)) link.setAttribute('aria-expanded', 'false');
      }, 0);
    });
  });

  /* --------------------------------------------------- 9 · UNWIRED FORMS -- */
  // No backend here: a form must never post patient details somewhere wrong.
  [].slice.call(document.querySelectorAll('form[data-sr-unwired]')).forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('[data-sr-note]');
      if (note) {
        note.hidden = false;
        note.textContent = 'This form is not connected to a mail handler in this build. '
          + 'Call (281) 488-0066 to book, or wire the form to your endpoint before launch.';
      }
    });
  });
})();
