/* ============================================================
   XORA Scaling â€” interactions & animations
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Hero headline: word-by-word reveal ---------- */
  var h1 = document.getElementById('hero-h1');
  if (h1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Wrap each word (preserving the .accent span) in an animated span.
    var wrapWords = function (node, startDelay) {
      var delay = startDelay;
      node.childNodes.forEach(function () {}); // noop to keep lint calm
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === 3) { // text node
          var words = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          words.forEach(function (w) {
            if (w.trim() === '') { frag.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span');
            s.className = 'word';
            s.style.animationDelay = delay.toFixed(2) + 's';
            s.textContent = w;
            frag.appendChild(s);
            delay += 0.05;
          });
          node.replaceChild(frag, child);
        } else if (child.classList && child.classList.contains('accent')) {
          // animate the accent span as one unit
          child.classList.add('word');
          child.style.animationDelay = delay.toFixed(2) + 's';
          delay += 0.05;
        }
      });
      return delay;
    };
    wrapWords(h1, 0.15);
  }

  /* ---------- Scroll reveal ---------- */
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Stagger children of grids so a row arrives as a wave, not all at once.
     Only touches containers whose children are not already hand-delayed. */
  ['.results-cards', '.pain-grid', '.services-grid', '.faq-list', '.compare-grid', '.roi-stats']
    .forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (box) {
        var kids = box.children, i = 0;
        for (var k = 0; k < kids.length; k++) {
          var el = kids[k];
          if (/\bd[1-5]\b/.test(el.className)) continue;   // respect existing delays
          if (!el.classList.contains('reveal')) el.classList.add('reveal');
          if (i) el.style.setProperty('--rv-i', Math.min(i, 5));
          i++;
        }
      });
    });

  /* Count the big money figures up once, when they first come into view.
     Reads the number already in the markup, so nothing is hardcoded here. */
  function countUp(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^([^0-9-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var pre = m[1], post = m[3];
    var digits = m[2].replace(/,/g, '');
    var target = parseFloat(digits);
    if (!isFinite(target) || target === 0) return;
    var dp = (digits.split('.')[1] || '').length;
    var grouped = m[2].indexOf(',') !== -1;
    var t0 = null, DUR = 1100;
    function fmt(v) {
      var t = v.toFixed(dp);
      if (grouped) {
        var parts = t.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        t = parts.join('.');
      }
      return pre + t + post;
    }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      var e = 1 - Math.pow(1 - p, 4);            // ease out quart
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
    }
    el.textContent = fmt(0);
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll('.results-cards .v, .growth-bar .gtitle');
  if (counters.length && !REDUCED && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target); co.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { if (!el.classList.contains('in')) io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- FAQ accordion ---------- */
  var setOpen = function (item, open) {
    var a = item.querySelector('.faq-a');
    if (open) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    else { item.classList.remove('open'); a.style.maxHeight = '0px'; }
  };
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    // initialise: open item keeps its height
    if (item.classList.contains('open')) setOpen(item, true);
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close all
      document.querySelectorAll('.faq-item').forEach(function (i) { setOpen(i, false); });
      if (!isOpen) setOpen(item, true);
    });
  });

  /* ---------- ROI calculator (exact logic) ---------- */
  var TARGET_EMAIL_PERCENT = 30;
  var selectedMonths = 2;

  function formatCurrency(num) { return '$' + Math.round(num).toLocaleString('en-US'); }
  function getTimeframeLabel(months) {
    if (months === 2) return '60 Days';
    if (months === 3) return '90 Days';
    return months + ' Months';
  }
  function calculate() {
    var mr = parseFloat(document.getElementById('monthlyRevenue').value) || 0;
    var cur = parseFloat(document.getElementById('currentEmailPercent').value) || 0;
    var currentEmailRevenue = mr * (cur / 100);
    var potentialEmailRevenue = mr * (TARGET_EMAIL_PERCENT / 100);
    var additionalMonthly = potentialEmailRevenue - currentEmailRevenue;
    var additionalTotal = additionalMonthly * selectedMonths;
    document.getElementById('currentEmailRevenue').textContent = formatCurrency(currentEmailRevenue);
    document.getElementById('potentialEmailRevenue').textContent = formatCurrency(potentialEmailRevenue);
    document.getElementById('additionalMonthly').textContent = '+' + formatCurrency(additionalMonthly);
    document.getElementById('additionalTotal').textContent = '+' + formatCurrency(additionalTotal);
    document.getElementById('additionalTotalLabel').textContent = 'Additional Revenue (' + getTimeframeLabel(selectedMonths) + ')';
  }
  if (document.getElementById('monthlyRevenue')) {
    document.querySelectorAll('.roi-wrap input[type=number]').forEach(function (input) {
      input.addEventListener('input', calculate);
    });
    document.querySelectorAll('.roi-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.roi-tab').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        selectedMonths = parseInt(this.dataset.months, 10);
        calculate();
      });
    });
    calculate();
  }

  /* ---------- Email showcase (double scroller) ----------
     Hover/hold a card -> pause that row + scroll the email vertically.
     Leave/release -> resume the row and ease the card back to the top. */
  document.querySelectorAll('.email-row').forEach(function (row) {
    var pause = function () { row.classList.add('paused'); };
    var resume = function () {
      row.classList.remove('paused');
      row.querySelectorAll('.email-card').forEach(function (c) {
        if (c.scrollTop > 0) c.scrollTo({ top: 0, behavior: 'smooth' });
      });
    };
    // desktop
    row.addEventListener('mouseenter', pause);
    row.addEventListener('mouseleave', resume);
    // touch: pause while a finger is down on a card, resume shortly after release
    var touchTimer = null;
    row.addEventListener('touchstart', function () {
      if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
      pause();
    }, { passive: true });
    row.addEventListener('touchend', function () {
      if (touchTimer) clearTimeout(touchTimer);
      touchTimer = setTimeout(resume, 900);   // let momentum settle before resuming
    }, { passive: true });
  });

  /* ---------- Apple-style pinned profit reveal ---------- */
  (function () {
    var section = document.getElementById('profit-scroll');
    if (!section) return;
    if (REDUCED) return; // CSS fallback shows all lines stacked
    var lines = Array.prototype.slice.call(section.querySelectorAll('.ps-line'));
    var bar = section.querySelector('.ps-progress-bar');
    var n = lines.length;
    if (!n) return;
    var ticking = false;

    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight; // pinned scroll distance
      if (total <= 0) return;
      var scrolled = Math.min(Math.max(-rect.top, 0), total);
      var progress = scrolled / total;            // 0..1 across the whole section
      var p = progress * (n - 1);                 // fractional active line index
      for (var i = 0; i < n; i++) {
        var delta = i - p;                        // 0 = centered/active
        var ad = Math.abs(delta);
        var op = Math.max(0, 1 - ad / 0.62);      // fade neighbours out
        var ty = delta * 66;                      // next comes up from below, past exits up
        var sc = 1 - Math.min(0.1, ad * 0.1);     // slight scale for depth
        var bl = op <= 0 ? 12 : Math.min(12, ad * 9);
        var el = lines[i];
        el.style.opacity = op.toFixed(3);
        el.style.transform = 'translateY(' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
        el.style.filter = 'blur(' + bl.toFixed(1) + 'px)';
      }
      if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
    }

    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  })();
})();

/* ---------- Total Auto Repair video fallback ---------- */
(function () {
  'use strict';
  var figure = document.getElementById('total-auto-repair-testimonial');
  if (!figure) return;
  var video = figure.querySelector('video');
  var note = figure.querySelector('.testimonial-error');
  function showFallback() { note.hidden = false; }
  video.addEventListener('error', showFallback);
  video.querySelector('source').addEventListener('error', showFallback);
})();
