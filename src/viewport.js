/*
  Viewport resize that ignores the iPhone toolbar.
  iOS Safari fires `resize` whenever its address bar shows or hides, with only the height changing. Re-measuring on
  those makes the page jump, so on touch screens a resize only counts when the WIDTH changes (rotation, split view).
  Desktop (mouse) keeps reacting to every real size change, since its layout uses the viewport height too.
*/
const touchScreen = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

export function onViewportResize(fn) {
  let w = window.innerWidth, h = window.innerHeight;
  const handler = () => {
    const nw = window.innerWidth, nh = window.innerHeight;
    if (nw === w && (nh === h || touchScreen())) return; // nothing changed, or a height-only change on touch
    w = nw; h = nh;
    fn();
  };
  window.addEventListener('resize', handler, { passive: true });
  return () => window.removeEventListener('resize', handler);
}
