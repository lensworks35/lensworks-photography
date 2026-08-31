/* ==========================================================================
   LENSWORKS PHOTOGRAPHY — Nocturne interactions
   ========================================================================== */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 860px)').matches;

  /* ---------- Nav scrolled state ---------- */
  const nav = document.getElementById('site-nav');
  const onNavScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Scroll reveals ---------- */
  const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
  const showAll = () => reveals.forEach(el => el.classList.add('is-in'));
  if (!prefersReduced && 'IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const el = en.target;
          el.style.setProperty('--rd', (parseFloat(el.dataset.delay) || 0) + 'ms');
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
    // Safety net: never leave content hidden if the observer misfires
    setTimeout(showAll, 3500);
  } else {
    showAll();
  }

  /* ---------- GLightbox ---------- */
  if (window.GLightbox) {
    GLightbox({
      touchNavigation: true,
      loop: true,
      autoplayVideos: false,
      openEffect: 'fade',
      closeEffect: 'fade'
    });
  }

  /* ---------- Archive category toggle ---------- */
  const catBtns = Array.from(document.querySelectorAll('.cat-btn'));
  const grids = Array.from(document.querySelectorAll('[data-gallery-grid]'));
  const setCat = (name) => {
    catBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === name)));
    grids.forEach(g => {
      const on = g.dataset.galleryGrid === name;
      g.hidden = !on;
      if (!on) return;
      const tiles = g.querySelectorAll('.tile');
      tiles.forEach((t, i) => {
        t.classList.add('is-out');
        t.style.setProperty('--d', (40 + i * 45) + 'ms');
      });
      // Double rAF so the hidden state paints before the staggered entrance
      requestAnimationFrame(() => requestAnimationFrame(() => {
        tiles.forEach(t => t.classList.remove('is-out'));
      }));
    });
  };
  catBtns.forEach(b => b.addEventListener('click', () => setCat(b.dataset.cat)));

  /* ---------- Scroll engine: horizontal strip ---------- */
  const hsec = document.querySelector('.hscroll');
  const htrack = document.getElementById('hs-track');
  const hfill = document.getElementById('hs-progress');

  let ticking = false;
  const update = () => {
    ticking = false;
    if (prefersReduced) return;
    const vh = innerHeight;
    const mobile = isMobile();

    if (hsec && htrack && !mobile) {
      const total = hsec.offsetHeight - vh;
      const r = hsec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / total));
      const maxX = htrack.scrollWidth - innerWidth;
      htrack.style.transform = `translate3d(${(-p * maxX).toFixed(1)}px,0,0)`;
      if (hfill) hfill.style.transform = `scaleX(${p})`;
    } else if (htrack) {
      // Mobile uses native horizontal scroll
      htrack.style.transform = '';
    }
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- Formspree AJAX ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.innerHTML = '<p class="form-success">Thank you — your inquiry is on its way. I’ll be in touch within 24 hours.</p>';
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = (data && data.errors && data.errors.map(er => er.message).join(', ')) || 'Something went wrong.';
          showFormError(submitBtn, originalText, msg);
        }
      } catch {
        showFormError(submitBtn, originalText, 'Network error — please DM @lensworks.photo on Instagram.');
      }
    });
  }

  function showFormError(btn, originalText, message) {
    btn.textContent = originalText;
    btn.disabled = false;
    let errEl = document.getElementById('form-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.id = 'form-error';
      errEl.className = 'form-error';
      form.appendChild(errEl);
    }
    errEl.textContent = message;
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
