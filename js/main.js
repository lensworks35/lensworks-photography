/* ==========================================================================
   LENSWORKS PHOTOGRAPHY — Nocturne interactions

   You will RARELY need to edit this file. It only handles behavior:
     1. Making the top nav bar shrink/blur once you scroll
     2. Opening/closing the mobile burger menu
     3. Fading sections in as they scroll into view
     4. The pop-up photo viewer (GLightbox)
     5. The Portraits/Events tab switch in the Archive
     6. The sideways-sliding photo strip (section 03)
     7. Sending the contact form + its success/error messages
        ← the one place you might edit: the message wording is in the
          "Formspree AJAX" block near the bottom
     8. Keeping the © year in the footer current automatically

   Each numbered block below is independent — a mistake in one doesn't
   break the others. After editing, bump "?v=5" on the main.js line at the
   bottom of index.html so browsers load your new version.
   ========================================================================== */
(() => {
  'use strict';

  // True if the visitor's device asks for less animation (accessibility)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // True on phone-sized screens (must match the 860px breakpoint in the CSS)
  const isMobile = () => window.matchMedia('(max-width: 860px)').matches;

  /* ---------- 1. Nav scrolled state ----------
     Adds the "is-scrolled" class after 60px of scrolling; the CSS uses it
     to shrink the bar and add the blurred background. */
  const nav = document.getElementById('site-nav');
  const onNavScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ---------- 2. Mobile menu ----------
     Burger button opens/closes the full-screen menu. Escape key closes it,
     and tapping any menu link closes it too. */
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

  /* ---------- 3. Scroll reveals ----------
     Anything in index.html with a data-reveal attribute starts invisible
     and fades in when it scrolls into view (data-delay staggers timing). */
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

  /* ---------- 4. GLightbox ----------
     Turns every element with class="glightbox" into a click-to-open
     full-screen photo viewer. Settings reference: glightbox docs. */
  if (window.GLightbox) {
    GLightbox({
      touchNavigation: true,
      loop: true,
      autoplayVideos: false,
      openEffect: 'fade',
      closeEffect: 'fade'
    });
  }

  /* ---------- 5. Archive category toggle ----------
     The Portraits / Events buttons: shows the matching gallery grid and
     hides the other, with a small staggered fade-in for the tiles. */
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

  /* ---------- 6. Scroll engine: horizontal strip (section 03) ----------
     On desktop: as the visitor scrolls down through the tall .hscroll
     section, this slides the photo strip sideways and fills the progress
     bar. On phones the strip is a normal swipe gallery, so this is skipped.
     To make the ride longer/shorter, change "height: 340vh" in the CSS. */
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

  /* ---------- 7. Formspree AJAX (contact form) ----------
     Sends the inquiry to Formspree without leaving the page. The visitor-
     facing wording (the "Thank you..." success message and the error
     messages) is in the quoted strings below — edit those freely. */
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

  /* ---------- 8. Footer year ----------
     Auto-fills the © year so you never have to update it by hand. */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
