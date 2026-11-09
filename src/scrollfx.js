/*
  Shared scroll effects (homepage). One IntersectionObserver for enter-once reveals and one passive,
  rAF-throttled scroll loop for scroll-linked effects. Everything is transform / opacity / clip-path / filter.
  With prefers-reduced-motion nothing here runs and the "before" states never apply (they're scoped to
  html.fx-ready), so all content is simply visible.
*/
export const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── scroll loop: subscribers get (scrollY, dy, dt); returning true asks for another frame (to ease out) ── */
const subs = new Set();
let raf = 0, lastY = 0, lastT = 0, listening = false;
const tick = (t) => {
  raf = 0;
  const y = window.scrollY, dt = lastT ? Math.max(1, t - lastT) : 16, dy = y - lastY;
  lastY = y; lastT = t;
  let again = false;
  subs.forEach((fn) => { if (fn(y, dy, dt)) again = true; });
  if (again) raf = requestAnimationFrame(tick);
  else lastT = 0;
};
const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
export function onScrollFrame(fn) {
  subs.add(fn);
  if (!listening) {
    listening = true; lastY = window.scrollY;
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick, { passive: true });
  }
  kick();
  return () => subs.delete(fn);
}

/* ── enter-once reveals ── */
const once = new Map();
let io = null;
export function onEnter(el, fn) {
  if (!io) {
    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const cb = once.get(e.target); once.delete(e.target); io.unobserve(e.target); cb?.(e.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  }
  once.set(el, fn); io.observe(el);
}

/* ── the homepage effects ── */
export function initScrollFx() {
  if (!motionOK()) return () => {};
  const html = document.documentElement;
  html.classList.add('fx-ready');
  const off = [];

  // LED words and project titles light up dot by dot, left to right (per-circle delay over ~0.5s)
  document.querySelectorAll('.dot-word svg, .dot-title svg').forEach((svg) => {
    const cs = [...svg.querySelectorAll('circle')];
    const max = Math.max(1, ...cs.map((c) => +c.getAttribute('cx')));
    cs.forEach((c) => c.style.setProperty('--dl', `${((+c.getAttribute('cx') / max) * 0.5).toFixed(3)}s`));
  });

  // projects: preview scanned in, text staggered in (CSS keyed on .fx-proj / .fx-in)
  document.querySelectorAll('.project').forEach((p) => { p.classList.add('fx-proj'); onEnter(p, () => p.classList.add('fx-in')); });

  // preview parallax: the screenshot moves slower than the page (only previews on screen are updated)
  const visible = new Set();
  const pio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  document.querySelectorAll('.project .preview').forEach((pv) => pio.observe(pv));
  off.push(() => pio.disconnect());
  off.push(onScrollFrame(() => {
    const vh = window.innerHeight;
    visible.forEach((pv) => {
      const r = pv.getBoundingClientRect();
      const py = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / vh - 0.5) * 2));
      pv.style.setProperty('--py', py.toFixed(3));
    });
  }));

  // marquees: speed up and skew slightly with scroll velocity, then ease back
  const marquees = [...document.querySelectorAll('.marquee')];
  let boost = 0, skew = 0;
  off.push(onScrollFrame((y, dy, dt) => {
    const v = (dy / dt) * 1000; // px/s
    boost += (Math.min(3, Math.abs(v) / 900) - boost) * 0.15;
    skew += (Math.max(-6, Math.min(6, -v / 450)) - skew) * 0.15;
    marquees.forEach((m) => {
      m.style.transform = Math.abs(skew) > 0.05 ? `skewX(${skew.toFixed(2)}deg)` : '';
      m.querySelector('.marquee-track')?.getAnimations().forEach((a) => { a.playbackRate = 1 + boost; });
    });
    return boost > 0.01 || Math.abs(skew) > 0.05;
  }));

  return () => off.forEach((f) => f());
}
