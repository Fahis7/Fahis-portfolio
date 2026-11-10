/*
  Shared scroll effects (homepage). One IntersectionObserver for enter-once reveals and one passive,
  rAF-throttled scroll loop for scroll-linked effects. Everything is transform / opacity / clip-path / filter.
  With prefers-reduced-motion nothing here runs and the "before" states never apply (they're scoped to
  html.fx-ready), so all content is simply visible.
*/
export const motionOK = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// phones and touch screens: no scroll-linked effects (they read layout every frame); reveals still run
const phoneLike = () => window.matchMedia('(max-width: 899px), (hover: none)').matches;

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

/* ── .rise reveals (enter-once) ──
   Reliable for every element: one observer (threshold 0, so even a thin or masked element counts), new .rise
   elements that mount later are picked up (MutationObserver), and a failsafe shows anything still hidden 1.5s
   after it entered the viewport, checked from real geometry. With reduced motion everything is revealed at once.
   The hidden "before" states must not change an element's geometry (opacity / transform only, never clip-path:
   Chrome's IntersectionObserver measures the element after its own clip-path, so a fully clipped element never
   intersects). */
export function watchReveals() {
  const reveal = (el) => el.classList.add('in');
  document.documentElement.classList.add('rv-live'); // tells the 1.2s failsafe in index.html that reveals are running
  if (!motionOK()) {
    document.querySelectorAll('.rise').forEach(reveal);
    const mo = new MutationObserver(() => document.querySelectorAll('.rise:not(.in)').forEach(reveal));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }
  const seen = new WeakSet();
  const rio = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { reveal(e.target); rio.unobserve(e.target); }
  }), { threshold: 0, rootMargin: '0px 0px -40px 0px' });
  const watch = (root = document) => root.querySelectorAll?.('.rise:not(.in)').forEach((el) => { if (!seen.has(el)) { seen.add(el); rio.observe(el); } });
  watch();
  const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    if (n.matches?.('.rise:not(.in)') && !seen.has(n)) { seen.add(n); rio.observe(n); }
    watch(n);
  })));
  mo.observe(document.body, { childList: true, subtree: true });
  // failsafe: still hidden ~1.2s after entering the viewport → show it (also covers the project and Stack reveals)
  const since = new Map();
  const show = (el) => {
    if (el.classList.contains('sp-pending')) el.classList.remove('sp-pending');
    else el.classList.add(el.classList.contains('fx-proj') ? 'fx-in' : 'in');
  };
  const timer = setInterval(() => {
    const now = performance.now(), vh = window.innerHeight;
    document.querySelectorAll('.rise:not(.in), .fx-proj:not(.fx-in), .sp-pending').forEach((el) => {
      const r = el.getBoundingClientRect();
      const inView = r.bottom > 0 && r.top < vh && r.width > 0;
      if (!inView) { since.delete(el); return; }
      if (!since.has(el)) since.set(el, now);
      else if (now - since.get(el) >= 800) { show(el); since.delete(el); }
    });
  }, 400);
  return () => { rio.disconnect(); mo.disconnect(); clearInterval(timer); };
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

  if (phoneLike()) return () => off.forEach((f) => f()); // phones: the scroll loop below stays off

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
