// Runtime for the homepage showreel band (loaded lazily, together with the ribbon and three.js).
// Page scroll (native, passive, rAF-throttled) -> progress p (0..1) -> ribbon.setScrollProgress(p).
import { mountRibbon, cardsFromProjects } from './work/ribbon.js';

const themeNow = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

export function attachBand({ section, sticky, stage, list, bar, hint, projects, base, setCount, setReady, debug }) {
  const t0 = performance.now();
  let p = 0, raf = 0;
  const pin = () => section.offsetHeight - sticky.offsetHeight;

  const reel = mountRibbon(stage, {
    mode: 'scroll',
    theme: themeNow(),
    cards: cardsFromProjects(projects, base),
    list,
    listHeading: 'h3',
    // ?debug&caption=0 / &refl=0: the same test switches as work.html
    debug: debug ? { noCaption: /[?&]caption=0/.test(location.search), noRefl: /[?&]refl=0/.test(location.search) } : null,
    onReady: () => { setReady(true); if (debug) window.__band.readyMs = performance.now() - t0; },
    onCentre: (i) => i >= 0 && setCount(i + 1),
    // keyboard focus on a card link scrolls the page so that card is centred
    onFocusCard: (i, q) => window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY + q * pin(), behavior: 'instant' }),
  });

  const update = () => {
    raf = 0;
    const len = pin();
    p = len > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / len)) : 0;
    bar.style.transform = `scaleX(${p})`;
    hint.classList.toggle('is-gone', p > 0.05);
    reel.setScrollProgress(p);
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();

  // theme toggle (or an OS theme change) -> ribbon, with no reload and no new textures
  const mo = new MutationObserver(() => reel.setTheme(themeNow()));
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (debug) Object.defineProperties(window.__band = window.__band || {}, { state: { value: reel.state }, p: { get: () => p }, pin: { get: pin } });

  return () => {
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    cancelAnimationFrame(raf);
    mo.disconnect();
    reel.destroy();
  };
}
