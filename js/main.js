/* =============================================
   LENSWORKS PHOTOGRAPHY — MAIN JS
   ============================================= */

// --- Nav scroll effect ---
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('nav--scrolled', window.scrollY > 60);
}, { passive: true });

// --- Mobile hamburger menu ---
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu when a nav link is clicked
navLinks.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// --- Portfolio tab switching ---
const tabBtns = document.querySelectorAll('.tab-btn');
const grids   = document.querySelectorAll('.gallery-grid');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    grids.forEach(grid => {
      const show = grid.dataset.grid === target;
      grid.hidden = !show;
      if (show) staggerGrid(grid);
    });
  });
});

// --- GLightbox initialization ---
const lightbox = GLightbox({
  touchNavigation: true,
  loop: true,
  autoplayVideos: false,
  openEffect: 'fade',
  closeEffect: 'fade',
  cssEfects: {
    fade: { in: 'fadeIn', out: 'fadeOut' }
  }
});

// --- Intersection Observer for scroll animations ---
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// fade-up & fade-left/right (skip hero — uses keyframe animation)
document.querySelectorAll('.fade-up, .fade-left, .fade-right').forEach(el => {
  if (!el.closest('.hero')) scrollObserver.observe(el);
});

// --- Gallery stagger animation ---
function staggerGrid(grid) {
  const items = grid.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    item.classList.remove('visible');
    item.style.setProperty('--stagger', `${i * 0.055}s`);
  });
  // Small rAF so removing .visible has time to reset before re-adding
  requestAnimationFrame(() => {
    items.forEach(item => item.classList.add('visible'));
  });
}

const galleryObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      staggerGrid(entry.target);
      galleryObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.gallery-grid').forEach(g => galleryObserver.observe(g));

// --- Formspree AJAX form submission ---
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.innerHTML = '<p class="form-success">Thank you! I\'ll be in touch within 24 hours.</p>';
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
        showFormError(submitBtn, originalText, msg);
      }
    } catch {
      showFormError(submitBtn, originalText, 'Network error. Please DM on Instagram.');
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
    errEl.style.cssText = 'color:#e05555;font-size:0.875rem;margin-top:0.75rem;text-align:center;';
    btn.parentNode.insertBefore(errEl, btn.nextSibling);
  }
  errEl.textContent = message;
}
