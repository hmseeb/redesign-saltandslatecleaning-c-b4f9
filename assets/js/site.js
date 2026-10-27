/* ==========================================================================
   Salt & Slate Cleaning Company — site behaviour
   Progressive enhancement only: every page works with JS disabled.
   ========================================================================== */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. Mobile navigation drawer
     ---------------------------------------------------------------------- */
  function initDrawer() {
    var burger = document.querySelector('[data-burger]');
    var drawer = document.querySelector('[data-drawer]');
    if (!burger || !drawer) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.setAttribute('data-open', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    // Collapsible groups inside the drawer
    drawer.querySelectorAll('[data-drawer-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.closest('[data-drawer-group]');
        if (!group) return;
        var open = group.getAttribute('data-open') === 'true';
        group.setAttribute('data-open', open ? 'false' : 'true');
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1000) setOpen(false);
    });
  }

  /* ----------------------------------------------------------------------
     2. Desktop dropdown menus (hover + keyboard/click accessible)
     ---------------------------------------------------------------------- */
  function initMenus() {
    var items = document.querySelectorAll('[data-menu]');
    if (!items.length) return;

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.setAttribute('data-open', 'false');
        var t = item.querySelector('[data-menu-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (item) {
      var toggle = item.querySelector('[data-menu-toggle]');
      var timer;

      if (toggle) {
        toggle.addEventListener('click', function (e) {
          e.preventDefault();
          var open = item.getAttribute('data-open') === 'true';
          closeAll(item);
          item.setAttribute('data-open', open ? 'false' : 'true');
          toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
      }

      item.addEventListener('mouseenter', function () {
        if (window.innerWidth < 1000) return;
        clearTimeout(timer);
        closeAll(item);
        item.setAttribute('data-open', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
      });

      item.addEventListener('mouseleave', function () {
        if (window.innerWidth < 1000) return;
        timer = setTimeout(function () {
          item.setAttribute('data-open', 'false');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }, 120);
      });
    });

    document.addEventListener('click', function (e) {
      var inside = false;
      items.forEach(function (item) { if (item.contains(e.target)) inside = true; });
      if (!inside) closeAll(null);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll(null);
    });
  }

  /* ----------------------------------------------------------------------
     3. Forms — LeadrVision submission + confirmation handling
     ---------------------------------------------------------------------- */
  var SUCCESS_TEXT = 'Thanks, your message was sent. A Salt & Slate team member will follow up shortly.';

  // The status box normally sits next to the form (inside .form-card), not
  // inside it, so look inside the form first and then walk up to the nearest
  // ancestor that contains one before giving up.
  function findStatusBox(form) {
    var box = form.querySelector('[data-form-status]');
    if (box) return box;
    var node = form.parentElement;
    while (node) {
      box = node.querySelector('[data-form-status]');
      if (box) return box;
      node = node.parentElement;
    }
    return null;
  }

  function showStatus(form, message, isError) {
    var box = findStatusBox(form);
    if (!box) return;
    box.classList.toggle('form-status--error', !!isError);
    var text = box.querySelector('[data-form-status-text]');
    if (text) {
      text.textContent = message;
    } else {
      box.textContent = message;
    }
    var icon = box.querySelector('.form-status__icon');
    if (icon) icon.textContent = isError ? '!' : '✓';
    box.setAttribute('data-show', 'true');
    box.setAttribute('role', 'status');
  }

  function initForms() {
    var submitted = false;
    try {
      submitted = new URLSearchParams(window.location.search).get('submitted') === '1';
    } catch (err) {
      submitted = window.location.search.indexOf('submitted=1') > -1;
    }

    var forms = document.querySelectorAll('[data-leadr-form]');

    forms.forEach(function (form) {
      // Stamp the current page url so the visitor is returned to the right place.
      var pageField = form.querySelector('input[name="_page"]');
      if (pageField) pageField.value = window.location.href;

      if (submitted) {
        showStatus(form, SUCCESS_TEXT, false);
      }

      form.addEventListener('submit', function (e) {
        if (!form.checkValidity()) return; // let the browser report problems

        // Keep _page fresh at submit time.
        if (pageField) pageField.value = window.location.href;

        // Enhance with fetch for an inline confirmation. Falls back to a
        // normal POST if fetch is unavailable.
        if (typeof window.fetch !== 'function') return;

        e.preventDefault();

        var btn = form.querySelector('[data-submit]');
        var originalLabel = btn ? btn.textContent : '';
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Sending…';
        }

        var payload = {};
        new FormData(form).forEach(function (value, key) {
          if (payload[key] !== undefined) {
            payload[key] = payload[key] + ', ' + value;
          } else {
            payload[key] = value;
          }
        });
        payload._page = window.location.href;

        fetch(form.getAttribute('action'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            return res.json().catch(function () { return { ok: res.ok }; });
          })
          .then(function (data) {
            if (data && data.ok) {
              showStatus(form, SUCCESS_TEXT, false);
              form.reset();
              if (pageField) pageField.value = window.location.href;
              var box = findStatusBox(form);
              if (box && box.scrollIntoView) {
                box.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            } else {
              throw new Error('Submission rejected');
            }
          })
          .catch(function () {
            // Last resort: hand the submission back to the browser.
            showStatus(
              form,
              'We could not send that just now. Please try again, or text us at (385) 333-7737.',
              true
            );
          })
          .then(function () {
            if (btn) {
              btn.disabled = false;
              btn.textContent = originalLabel;
            }
          });
      });
    });

    // Scroll a standalone confirmation (non-form pages) into view.
    if (submitted) {
      var first = document.querySelector('[data-form-status][data-show="true"]');
      if (first && first.scrollIntoView) {
        setTimeout(function () {
          first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 180);
      }
    }
  }

  /* ----------------------------------------------------------------------
     4. Prefill the "Service needed" select from ?service= or page context
     ---------------------------------------------------------------------- */
  function initServicePrefill() {
    var selects = document.querySelectorAll('select[name="Service needed"]');
    if (!selects.length) return;

    var wanted = null;
    try {
      wanted = new URLSearchParams(window.location.search).get('service');
    } catch (err) { /* ignore */ }
    if (!wanted) {
      var meta = document.querySelector('meta[name="ss:service"]');
      if (meta) wanted = meta.getAttribute('content');
    }
    if (!wanted) return;

    selects.forEach(function (select) {
      var match = Array.prototype.filter.call(select.options, function (o) {
        return o.value.toLowerCase() === String(wanted).toLowerCase();
      })[0];
      if (match) select.value = match.value;
    });
  }

  /* ----------------------------------------------------------------------
     5. Reveal-on-scroll (subtle, opt-in via data-reveal)
     ---------------------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    targets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity .6s cubic-bezier(.22,.61,.36,1), transform .6s cubic-bezier(.22,.61,.36,1)';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     6. Footer year
     ---------------------------------------------------------------------- */
  function initYear() {
    var nodes = document.querySelectorAll('[data-year]');
    if (!nodes.length) return;
    var y = String(new Date().getFullYear());
    nodes.forEach(function (n) { n.textContent = y; });
  }

  /* ---------------------------------------------------------------------- */
  function boot() {
    initDrawer();
    initMenus();
    initForms();
    initServicePrefill();
    initReveal();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
