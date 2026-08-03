(function () {
  'use strict';

  // ---- queue + flush (count.js loads async and may be ad-blocked) ----
  var queue = [];
  var pollTimer = null;
  var pollStart = 0;

  function flushQueue() {
    while (queue.length) {
      var item = queue.shift();
      try { window.goatcounter.count(item); } catch (e) {}
    }
  }

  function startPolling() {
    if (pollTimer) return;
    pollStart = Date.now();
    pollTimer = setInterval(function () {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        flushQueue();
        clearInterval(pollTimer);
        pollTimer = null;
      } else if (Date.now() - pollStart > 10000) {
        clearInterval(pollTimer);
        pollTimer = null;
        queue.length = 0;
      }
    }, 200);
  }

  function track(path, title) {
    try {
      queue.push({ path: path, title: title, event: true });
      startPolling();
    } catch (e) {}
  }

  function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // ---- 1. referral code ----
  try {
    var r = new URLSearchParams(location.search).get('r');
    if (r) {
      var clean = r.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32);
      if (clean) track('ref-' + clean, 'Referral: ' + clean);
    }
  } catch (e) {}

  // ---- 2. scroll depth ----
  try {
    var scrollFired = { 25: false, 50: false, 75: false, 100: false };
    var ticking = false;
    function checkScroll() {
      ticking = false;
      try {
        var doc = document.documentElement;
        var scrollTop = window.scrollY || doc.scrollTop;
        var max = doc.scrollHeight - doc.clientHeight;
        var pct = max > 0 ? (scrollTop / max) * 100 : 100;
        [25, 50, 75, 100].forEach(function (t) {
          if (!scrollFired[t] && pct >= t) {
            scrollFired[t] = true;
            track('scroll-' + t, 'Scroll ' + t + '%');
          }
        });
      } catch (e) {}
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(checkScroll); }
    }, { passive: true });
  } catch (e) {}

  // ---- 3. section reached ----
  try {
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            observer.unobserve(entry.target);
            track('section-' + entry.target.id, 'Section: ' + entry.target.id);
          }
        });
      }, { threshold: 0.4 });
      ['experience', 'projects', 'contact'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }
  } catch (e) {}

  // ---- 4. engaged time ----
  try {
    var engagedSeconds = 0;
    var engagedFired = { 10: false, 30: false, 60: false };
    setInterval(function () {
      try {
        if (document.visibilityState === 'visible') {
          engagedSeconds++;
          [10, 30, 60].forEach(function (t) {
            if (!engagedFired[t] && engagedSeconds >= t) {
              engagedFired[t] = true;
              track('engaged-' + t + 's', 'Engaged ' + t + 's');
            }
          });
        }
      } catch (e) {}
    }, 1000);
  } catch (e) {}

  // ---- 6. outbound link slug ----
  function outboundPath(link) {
    var host = link.hostname.replace(/^www\./, '');
    var path = link.pathname || '';
    if (host === 'github.com') {
      var parts = path.split('/').filter(Boolean);
      return 'out-github-' + slugify(parts[1] || parts[0] || '');
    }
    if (host.indexOf('steampowered.com') !== -1) return 'out-steam';
    if (host === 'itch.io' || host.indexOf('.itch.io') !== -1) return 'out-itch';
    if (host.indexOf('linkedin.com') !== -1) return 'out-linkedin';
    if (host.indexOf('artstation.com') !== -1) return 'out-artstation';
    if (host.indexOf('globalgamejam.org') !== -1) return 'out-ggj';
    if (host.indexOf('drive.google.com') !== -1) return 'out-drive';
    if (host.indexOf('ioi.dk') !== -1) return 'out-ioi';
    return 'out-' + slugify(host);
  }

  // ---- 5, 6, 8. clicks: cv download, outbound, email, carousel ----
  var carouselFired = false;
  document.addEventListener('click', function (e) {
    try {
      var target = e.target;
      var link = target.closest ? target.closest('a') : null;
      if (link) {
        var href = link.getAttribute('href') || '';
        if (href.indexOf('documents/oguzhanesgiyusuforesume.pdf') !== -1) {
          track('cv-download', 'CV Download');
        } else if (href.indexOf('mailto:') === 0) {
          track('email-click', 'Email Click');
        } else if (link.hostname && link.hostname !== location.hostname) {
          track(outboundPath(link), 'Outbound: ' + link.hostname);
        }
      }
      if (!carouselFired && target.closest &&
          target.closest('.carousel__nav--prev, .carousel__nav--next, .carousel__dot')) {
        carouselFired = true;
        track('carousel-interact', 'Carousel Interact');
      }
    } catch (e) {}
  }, true);

  // ---- 7. video play (window blur heuristic, cross-origin iframes) ----
  try {
    window.addEventListener('blur', function () {
      try {
        var active = document.activeElement;
        if (active && active.tagName === 'IFRAME' && active.closest && active.closest('.video')) {
          if (!active.dataset.analyticsTracked) {
            active.dataset.analyticsTracked = '1';
            var title = active.getAttribute('title') || 'video';
            track('video-play-' + slugify(title), 'Video Play: ' + title);
          }
        }
      } catch (e) {}
    });
  } catch (e) {}

})();
