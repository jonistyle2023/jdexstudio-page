import { siteConfig, validCalendarUrl, validEmail } from './site-config.js';

const menu = document.querySelector('.mobile-menu');
const summary = menu?.querySelector('summary');
menu?.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.closest('a')) menu.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.open) {
    menu.open = false;
    summary?.focus();
  }
});
document.addEventListener('click', (event) => {
  if (event.target instanceof Node && menu?.open && !menu.contains(event.target)) menu.open = false;
});
window.matchMedia('(min-width: 801px)').addEventListener('change', (event) => {
  if (event.matches && menu) menu.open = false;
});

const calendarUrl = validCalendarUrl(siteConfig.calendarUrl);
if (calendarUrl) {
  document.querySelectorAll('[data-booking], [data-calendar-link]').forEach((link) => {
    link.href = calendarUrl;
    link.hidden = false;
  });
  document.querySelector('[data-booking-pending]')?.setAttribute('hidden', '');
  document.querySelector('[data-calendar-help]')?.removeAttribute('hidden');
}

const email = validEmail(siteConfig.email);
if (email) {
  const link = document.querySelector('[data-email-link]');
  if (link) {
    link.textContent = email;
    link.href = `mailto:${email}`;
    link.hidden = false;
  }
  document.querySelector('[data-email-pending]')?.setAttribute('hidden', '');
}

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

const partnerMarquee = document.querySelector('.partner-marquee');
const partnerToggle = document.querySelector('[data-partner-toggle]');
partnerToggle?.addEventListener('click', () => {
  const paused = partnerToggle.getAttribute('aria-pressed') !== 'true';
  partnerToggle.setAttribute('aria-pressed', String(paused));
  partnerToggle.setAttribute('aria-label', paused ? 'Reanudar carrusel de partners' : 'Pausar carrusel de partners');
  partnerToggle.querySelector('span').textContent = paused ? 'Reanudar' : 'Pausar';
  partnerMarquee?.classList.toggle('is-paused', paused);
});

// Pause the only continuous animation outside the viewport and background tabs.
if (partnerMarquee && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    partnerMarquee.classList.toggle('is-visible', entry.isIntersecting);
  }, { threshold: 0.05 });
  observer.observe(partnerMarquee);
} else {
  partnerMarquee?.classList.add('is-visible');
}
function syncPageVisibility() {
  document.documentElement.classList.toggle('is-background', document.hidden);
}
document.addEventListener('visibilitychange', syncPageVisibility);
syncPageVisibility();

const heroVisual = document.querySelector('.hero-visual');
const flowToggle = document.querySelector('[data-flow-toggle]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (heroVisual && flowToggle) {
  const syncFlowMotion = () => {
    heroVisual.classList.toggle('is-playing', !reducedMotion.matches && document.documentElement.dataset.motion !== 'off');
  };
  flowToggle.hidden = false;
  flowToggle.addEventListener('click', () => {
    const paused = flowToggle.getAttribute('aria-pressed') !== 'true';
    flowToggle.setAttribute('aria-pressed', String(paused));
    flowToggle.setAttribute('aria-label', `${paused ? 'Reanudar' : 'Pausar'} animación del flujo de automatización`);
    flowToggle.querySelector('span').textContent = paused ? 'Reanudar flujo' : 'Pausar flujo';
    heroVisual.classList.toggle('is-paused', paused);
  });
  reducedMotion.addEventListener('change', syncFlowMotion);
  syncFlowMotion();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroVisual.classList.toggle('is-visible', entry.isIntersecting && entry.intersectionRatio >= 0.25);
    }, { threshold: [0, 0.25] }).observe(heroVisual);
  } else {
    heroVisual.classList.add('is-visible');
  }
}
