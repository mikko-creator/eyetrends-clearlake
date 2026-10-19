/* Eye Trends — Aurora Glass behaviour layer.
   No dependencies, no tracking, no third-party calls.

   Effects here that the source site had none of:
     · blur-in scroll reveal with sibling stagger
     · pointer-tracked specular sheen across every glass surface
     · header that detaches into a floating pill on scroll
     · depth parallax on framed media
     · count-up statistics
     · scroll progress + back-to-top
   Revision 28 (the UXCam mobile UX guide) added: Back closes the phone menu,
   the menu's sub-pages on demand, the appointment form's messages and kept
   draft, and the phone action bar's hide-while-redundant.
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
  // Revision 28: on a phone the button floats over the page's own column (the
  // gutter is 16px), where it covered the tap targets that scrolled under it: a
  // select's arrow, an FAQ's +, the form's button. So on a phone it shows only
  // while the page is being scrolled back up, the moment someone is heading for
  // the top, and goes 1.5s after the scrolling stops or turns down. Wider
  // screens keep it as it was.
  var phone = window.matchMedia ? window.matchMedia('(max-width: 700px)') : null;
  var lastY = window.pageYOffset || docEl.scrollTop, upUntil = 0, upTimer = 0;

  function frame() {
    var y = window.pageYOffset || docEl.scrollTop;
    if (phone && phone.matches) {
      var now = Date.now();
      if (y < lastY - 2) { upUntil = now + 1500; clearTimeout(upTimer); upTimer = setTimeout(onScroll, 1550); }
      else if (y > lastY + 2) upUntil = 0;
    }
    lastY = y;

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
    if (phone && phone.matches) v = v && Date.now() < upUntil && !(bar && bar.classList.contains('is-hidden'));
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

  /* ------------------------------------------- 6 · OVERLAYS AND BACK ----- */
  // Revision 28 (the UXCam guide, "Respect the back button": users expect the
  // system Back, a button or a swipe, to work). The phone menu and the search
  // panel add one history entry while open, so Back closes whichever is open
  // and leaves the page where it was; before, Back left the page. Closing one
  // any other way (its button, Escape) takes the entry back off, and following a
  // link in the menu, or searching, first takes it off and then goes, so the
  // history holds no step that does nothing. Opening one while the other is open
  // hands over the same entry.
  var overlayEntry = false, afterPop = null, overlayClosers = [];
  var holdOverlay = function () {
    if (!overlayEntry && window.history && history.pushState) { history.pushState({ etOverlay: 1 }, ''); overlayEntry = true; }
  };
  var leaveOverlay = function (then) {
    if (overlayEntry) { overlayEntry = false; afterPop = then || null; history.back(); }
    else if (then) then();
  };
  window.addEventListener('popstate', function () {
    overlayEntry = false;
    overlayClosers.forEach(function (close) { close(); });
    if (afterPop) { var go = afterPop; afterPop = null; go(); }
  });

  /* ------------------------------------------------------ 6a · MOBILE NAV -- */
  // The header stays over the open menu, where its button reads Close; the
  // menu's first link starts under it (--head-b, chrome.css §6).
  var burger = document.querySelector('.burger');
  var mob = document.getElementById('mobile-nav');
  var setNav = null;
  if (burger && mob) {
    setNav = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open && head) mob.style.setProperty('--head-b', Math.round(head.getBoundingClientRect().bottom) + 'px');
      mob.hidden = !open;
      document.body.classList.toggle('nav-open', open);
    };
    overlayClosers.push(function () { if (!mob.hidden) setNav(false); });
    var openNav = function () {
      if (showSearch && sPanel && !sPanel.hidden) showSearch(false);
      setNav(true);
      holdOverlay();
    };
    var closeNav = function (then) { setNav(false); leaveOverlay(then); };
    burger.addEventListener('click', function () { if (mob.hidden) openNav(); else closeNav(); });
    mob.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      // a place on this page (the booking form): the menu's history entry
      // becomes that place's, and the page goes there (after a Back, the
      // browser's own scroll restoring would undo a jump made at once)
      var target = a.hash && a.pathname === location.pathname ? document.getElementById(a.hash.slice(1)) : null;
      if (target) {
        e.preventDefault();
        setNav(false);
        if (overlayEntry) { overlayEntry = false; history.replaceState(null, '', a.hash); }
        else history.pushState(null, '', a.hash);
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      if (overlayEntry) { e.preventDefault(); var href = a.href; closeNav(function () { location.assign(href); }); }
      else setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mob.hidden) { closeNav(); burger.focus(); }
    });
    // Services and Eyewear show their sub-pages on demand (the guide: navigation
    // built for a large monitor does not translate to a phone)
    [].slice.call(mob.querySelectorAll('.mob-more')).forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') !== 'true';
        btn.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
      });
    });
  }

  /* --------------------------------------------------- 7 · SEARCH PANEL --- */
  var sBtn = document.querySelector('.head-search');
  var sPanel = document.getElementById('site-search');
  var showSearch = null;
  if (sBtn && sPanel) {
    var sInput = sPanel.querySelector('input[name="s"]');
    var sClose = sPanel.querySelector('.search-panel__close');
    var sForm = sPanel.querySelector('form');
    showSearch = function (open) {
      sPanel.hidden = !open;
      sBtn.setAttribute('aria-expanded', String(open));
      if (open && sInput) sInput.focus();
    };
    overlayClosers.push(function () { if (!sPanel.hidden) showSearch(false); });
    var openSearch = function () {
      if (setNav && mob && !mob.hidden) setNav(false);
      showSearch(true);
      holdOverlay();
    };
    var closeSearch = function (then) { showSearch(false); leaveOverlay(then); };
    sBtn.addEventListener('click', function () { if (sPanel.hidden) openSearch(); else closeSearch(); });
    if (sClose) sClose.addEventListener('click', function () { closeSearch(); sBtn.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sPanel.hidden) { closeSearch(); sBtn.focus(); }
    });
    // searching leaves the panel's history entry first, then goes
    if (sForm) sForm.addEventListener('submit', function (e) {
      if (!overlayEntry) return;
      e.preventDefault();
      closeSearch(function () { sForm.submit(); });
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

  /* ---------------------------------------------- 8b · MEGA MENU AIM ----- */
  // chrome.css opens a mega panel on :hover and lets a closing one linger (section 4). What CSS cannot see is
  // direction. The straight line from "Services" down to its right-hand columns crosses the "Eyewear" link, and
  // :hover alone hands the menu to Eyewear. A shallow path from "Eyewear" to its far-right card runs along
  // "Insurance", and the menu closes on the way. A mouse that enters another nav link while moving DOWN, just
  // after leaving an open menu, is aiming at that menu's panel. So the open item is held (.is-held), and a
  // crossed mega item is kept shut (.is-shut), for as long as the crossing lasts. It ends when the pointer
  // reaches the held item, turns straight down onto a nav link, moves along the nav, or pauses for 350ms. A
  // move along the nav switches menus as before. Mouse only: touch and keyboard are untouched.
  var megaItems = [].slice.call(document.querySelectorAll('.nv-has-mega'));
  // The strip is the link's own ::before, so a click on it would follow the link. A click below the link's
  // box landed on the strip: let it do nothing, as it did before the strip existed. Keyboard clicks carry
  // no position (clientY 0) and pass.
  megaItems.forEach(function (item) {
    var link = item.querySelector('.nv-link');
    if (link) link.addEventListener('click', function (e) {
      if (e.clientY > link.getBoundingClientRect().bottom) e.preventDefault();
    });
  });
  if (megaItems.length > 1 && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var trail = [];                       // recent mouse positions, the last 200ms
    var held = null, shut = null, holdTimer = 0;
    var lastLeft = null, lastLeftAt = 0;  // the mega item the mouse last left, and when
    var release = function () {
      if (held) held.classList.remove('is-held');
      if (shut) shut.classList.remove('is-shut');
      held = shut = null;
      clearTimeout(holdTimer);
    };
    var span = function (ms) {            // the pointer's travel over the last `ms` of the trail
      var b = trail[trail.length - 1], a = b;
      for (var i = trail.length - 1; i >= 0 && b.t - trail[i].t <= ms; i--) a = trail[i];
      return { dx: b.x - a.x, dy: b.y - a.y };
    };
    var lastPx = function (px) {          // the pointer's travel over its last `px` of movement
      var b = trail[trail.length - 1], a = b;
      for (var i = trail.length - 2; i >= 0; i--) { a = trail[i]; if (Math.abs(b.x - a.x) + Math.abs(b.y - a.y) >= px) break; }
      return { dx: b.x - a.x, dy: b.y - a.y };
    };
    // Two windows.
    // - The long one says "still descending overall". It holds the shallowest Services paths at 1920 (about
    //   1 in 8) even at 120 px/s, where 80ms of travel rounds to no descent at all.
    // - The short one, the last 8px of movement, catches a turn straight down at once. A 200ms window is too
    //   slow: the pointer is already off the link when it notices (measured: 4 of 16 such turns ended in the
    //   other menu). A 50ms window is too jumpy: at 120 px/s it can hold two whole-pixel points 0px across and
    //   1px down, a "turn" in the middle of a graze (2 of 192 runs).
    var movingDown = function () {        // over 200ms: down, at least 1 in 16 of the sideways travel
      if (trail.length < 2) return false;
      var d = span(200);
      return d.dy > 0 && d.dy >= Math.abs(d.dx) * 0.0625;
    };
    var turnedDown = function () {        // over the last 8px: steeper than 45 degrees
      var d = lastPx(8);
      return d.dy > 0 && d.dy > Math.abs(d.dx);
    };
    var renew = function () { clearTimeout(holdTimer); holdTimer = setTimeout(release, 350); };
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      trail.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      // 200ms of travel: on a slow, shallow path (120 px/s, falling 1 in 8) a shorter window holds about
      // 1px of descent, which whole-pixel positions can round to none
      while (trail.length > 2 && e.timeStamp - trail[0].t > 200) trail.shift();
      if (!held) return;
      // While held, the hold lasts as long as the crossing does: over the links and down through the band. A
      // slow pointer (120 px/s) takes about half a second to cross a link, longer than any fixed hold. Each of
      // these is a choice and ends it:
      // - a turn straight down onto the link under the pointer;
      // - a move along the nav, with no descent;
      // - a pause of 350ms.
      if (movingDown() && !turnedDown()) renew(); else release();
    }, { passive: true });
    megaItems.forEach(function (item) {
      item.addEventListener('pointerleave', function (e) {
        if (e.pointerType !== 'mouse') return;
        // only a menu that was open counts: an item merely crossed while shut never was
        if (item === shut || item.classList.contains('is-shut')) return;
        lastLeft = item; lastLeftAt = e.timeStamp;
      });
    });
    // Entering ANY nav link right after leaving an open menu, moving down: the other mega link (whose own
    // menu is kept shut), or one without a menu that a shallow path to a corner card runs along ("Insurance").
    [].slice.call(document.querySelectorAll('.nv-item')).forEach(function (item) {
      item.addEventListener('pointerenter', function (e) {
        if (e.pointerType !== 'mouse') return;
        if (item === held) { release(); return; }    // reached the held item's strip or panel
        if (held || !movingDown()) return;
        // The menu was left a moment ago, so its panel is still up. Don't read the panel to find that out:
        // by now CSS may already have cancelled it for a newly hovered mega item (section 4, rule 3). 150ms
        // covers the 2px gap between the links, and rules out a pointer that left upward and came back.
        if (!lastLeft || lastLeft === item || e.timeStamp - lastLeftAt > 150) return;
        held = lastLeft;
        held.classList.add('is-held');
        if (item.classList.contains('nv-has-mega')) { shut = item; shut.classList.add('is-shut'); }
        renew();
      });
    });
  }

  /* ------------------------------------------- 9 · THE APPOINTMENT FORM --- */
  // Revision 28, the UXCam guide:
  // · "Every error message should tell users what went wrong, why it happened
  //   (if useful), and what to do next." The form is novalidate and checked
  //   nothing: an empty form went straight to the note below. Now a missing
  //   name or phone, a number too short to call or an email that cannot be one
  //   gets a message under its field saying what to do, the field is marked
  //   (aria-invalid, aria-describedby) and the first one takes the focus.
  //   Messages go as soon as the field is right.
  // · "Forms that reject valid input ... phone number fields that reject
  //   international formats": any number with 7 digits or more passes, in any
  //   format.
  // · "Save state generously so users can resume": what is typed is kept for
  //   the tab (sessionStorage) and put back when the page is opened again, on
  //   any page, since every page has the same form. It stays on the device and
  //   goes when the tab is closed. When the form is wired, clear it
  //   (sessionStorage.removeItem(DRAFT)) once a request is sent.
  // No backend here: a form must never post patient details somewhere wrong.
  var DRAFT = 'et-appointment-draft';
  var MSG = {
    name: 'Please enter your name, so we know who the appointment is for.',
    phone: 'Please enter a phone number, so we can call you back to set a time.',
    phoneShort: 'This number looks too short: please enter it with the area code, for example (281) 555-0142.',
    email: 'This email address looks incomplete: it should look like name@example.com. It is optional, so you can also leave it empty.'
  };
  [].slice.call(document.querySelectorAll('form[data-sr-unwired]')).forEach(function (form) {
    var fields = [].slice.call(form.querySelectorAll('input[name], select[name], textarea[name]')).filter(function (f) {
      return !f.closest('.hp') && f.type !== 'hidden';
    });
    var store = null;
    try { store = window.sessionStorage; store.setItem(DRAFT + '-t', '1'); store.removeItem(DRAFT + '-t'); } catch (err) { store = null; }
    if (store) {
      try {
        var saved = JSON.parse(store.getItem(DRAFT) || 'null');
        if (saved) fields.forEach(function (f) { if (typeof saved[f.name] === 'string' && saved[f.name] !== '') f.value = saved[f.name]; });
      } catch (err) { /* a damaged draft is ignored */ }
      var save = function () {
        var o = {};
        fields.forEach(function (f) { o[f.name] = f.value; });
        try { store.setItem(DRAFT, JSON.stringify(o)); } catch (err) { /* storage full or blocked */ }
      };
      form.addEventListener('input', save);
      form.addEventListener('change', save);
    }

    var problem = function (f) {
      var v = (f.value || '').trim();
      if (f.name === 'name') return v ? '' : MSG.name;
      if (f.name === 'phone') {
        if (!v) return MSG.phone;
        return v.replace(/\D/g, '').length >= 7 ? '' : MSG.phoneShort;
      }
      if (f.name === 'email') return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : MSG.email;
      return '';
    };
    var show = function (f, msg) {
      var id = f.id + '-err';
      var p = document.getElementById(id);
      if (msg) {
        if (!p) { p = document.createElement('p'); p.className = 'fld-err'; p.id = id; f.parentNode.appendChild(p); }
        p.textContent = msg;
        f.setAttribute('aria-invalid', 'true');
        f.setAttribute('aria-describedby', id);
      } else {
        if (p) p.parentNode.removeChild(p);
        f.removeAttribute('aria-invalid');
        f.removeAttribute('aria-describedby');
      }
    };
    // once a field has been flagged, its message follows what is typed
    form.addEventListener('input', function (e) {
      var f = e.target;
      if (f && f.getAttribute && f.getAttribute('aria-invalid') === 'true') show(f, problem(f));
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (f) {
        var msg = problem(f);
        show(f, msg);
        if (msg && !first) first = f;
      });
      var note = form.querySelector('[data-sr-note]');
      if (first) {
        if (note) note.hidden = true;
        first.focus();
        return;
      }
      if (note) {
        note.hidden = false;
        note.textContent = 'This form is not connected to a mail handler in this build. '
          + 'Call (281) 488-0066 to book, or wire the form to your endpoint before launch.';
      }
    });
  });

  /* ----------------------------------------------- 10 · PHONE ACTION BAR -- */
  // Revision 28 (chrome.css §15, tools/build.mjs actBarHTML): Call and Book at
  // the bottom of a phone screen, where a thumb reaches. The guide also asks for
  // one primary action per screen, so the bar steps aside while half or more of
  // one of the page's own primary buttons is on screen under the header, or the
  // booking form has faded in: the screen has one primary button, not two. It
  // also steps aside while a field has the keyboard up, and while search is
  // open. Without IntersectionObserver it stays.
  var bar = document.querySelector('.act-bar');
  if (bar) {
    var inView = [], typing = false, settled = !hasIO;
    var sync = function () {
      var searching = sPanel && !sPanel.hidden;
      bar.classList.toggle('is-hidden', !settled || inView.length > 0 || typing || !!searching);
      onScroll();                                          // back-to-top follows the bar on a phone
    };
    if (!hasIO) bar.classList.add('is-live');
    // A page opens with its hero still sliding in (the reveal, section 1): a
    // hero button that ends near the bar's band starts lower, outside it, so the
    // bar showed and then left by itself (review). The bar waits, out of sight,
    // until the reveal has settled, then slides in if the screen has no primary
    // button of its own. Without the script it simply stays.
    if (hasIO) {
      bar.classList.add('is-hidden');
      setTimeout(function () {
        settled = true;
        bar.classList.add('is-live');
        raf(sync);
      }, reduce ? 0 : 1100);
    }
    if (hasIO) {
      // the page's primary buttons, booking or not: a screen shows one primary
      // action. Secondary ways to book (a ghost button, an arrow link) leave the
      // bar where it is: its Book is then still the screen's only primary
      var sameActions = [].slice.call(document.querySelectorAll('main .btn-primary'));
      var formBand = document.querySelector('#book .book-form');
      var mark = function (el, on) {
        var at = inView.indexOf(el);
        if (on && at < 0) inView.push(el);
        if (!on && at >= 0) inView.splice(at, 1);
      };
      // half of a button on screen under the header is enough: one that opens
      // in the bar's own band (the emergency page's Call) must not load covered
      // and then trade places with the bar at the first touch (review)
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { mark(en.target, en.isIntersecting && en.intersectionRatio >= 0.5); });
        sync();
      }, { rootMargin: '-66px 0px 0px 0px', threshold: [0, 0.5, 1] });   // the floating header ends at 66px
      sameActions.forEach(function (a) { bio.observe(a); });
      // the form counts from the moment it fades in, with the reveal's own
      // settings (section 1): measured, the bar stepped aside some 60px of
      // scrolling before the form showed, leaving no Book button on screen
      if (formBand) {
        var fio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { mark(en.target, en.isIntersecting && en.intersectionRatio >= 0.08); });
          sync();
        }, { rootMargin: '0px 0px -8% 0px', threshold: [0, 0.08] });
        fio.observe(formBand);
      }
    }
    document.addEventListener('focusin', function (e) {
      if (e.target && e.target.matches && e.target.matches('input, select, textarea')) { typing = true; sync(); }
    });
    document.addEventListener('focusout', function () {
      setTimeout(function () {
        var a = document.activeElement;
        typing = !!(a && a.matches && a.matches('input, select, textarea'));
        sync();
      }, 0);
    });
    if (sBtn) sBtn.addEventListener('click', function () { setTimeout(sync, 0); });
    if (sPanel) sPanel.addEventListener('click', function () { setTimeout(sync, 0); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setTimeout(sync, 0); });
    window.addEventListener('popstate', function () { setTimeout(sync, 0); });
  }
})();
