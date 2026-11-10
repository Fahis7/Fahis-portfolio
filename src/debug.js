/*
  Debug panel for real phones: open the site with ?debug=1 (e.g. /Fahis-portfolio/?debug=1).
  Loaded only then (a separate chunk, so normal visits pay nothing). Errors and resize events are collected from the
  very start by a small inline script in index.html (window.__dbg); this file draws the panel and adds live readings.
*/
const short = (s, n = 70) => (s && s.length > n ? `…${s.slice(-n)}` : s || '');

function styles(el) {
  if (!el) return 'missing';
  const c = getComputedStyle(el);
  const mask = c.maskImage || c.webkitMaskImage || 'none';
  return `display:${c.display} op:${c.opacity} vis:${c.visibility} tf:${c.transform} clip:${c.clipPath} mask:${mask}`;
}

export function startDebug() {
  const D = window.__dbg || (window.__dbg = { errors: [], resizes: 0 });

  // hero height changes (any change in the hero's height pushes the page)
  const changes = [];
  let lastH = -1, watching = false;
  const watchHero = () => { // the hero may not be rendered yet when this starts: retried on every refresh
    const hero = document.querySelector('.hero');
    if (watching || !hero) return;
    watching = true;
    new ResizeObserver(() => {
      const h = Math.round(hero.getBoundingClientRect().height * 10) / 10;
      if (lastH >= 0 && h !== lastH) changes.push({ t: performance.now(), from: lastH, to: h });
      lastH = h;
    }).observe(hero);
  };

  const box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText = [
    'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:2147483647', 'max-height:42vh', 'overflow:auto',
    'padding:6px 8px calc(6px + env(safe-area-inset-bottom, 0px))', 'background:rgba(0,0,0,0.86)', 'color:#d7ffd9',
    'font:10px/1.35 ui-monospace,Menlo,monospace', '-webkit-text-size-adjust:100%',
  ].join(';');
  const bar = document.createElement('div');
  bar.style.cssText = 'display:flex;gap:8px;margin-bottom:4px';
  const btn = (label, fn) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.onclick = fn;
    b.style.cssText = 'font:inherit;color:#000;background:#d7ffd9;border:0;border-radius:4px;padding:3px 8px';
    bar.appendChild(b);
    return b;
  };
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:0;white-space:pre-wrap;word-break:break-all';
  let open = true;
  btn('hide', (e) => { open = !open; pre.style.display = open ? '' : 'none'; e.target.textContent = open ? 'hide' : 'show'; });
  btn('copy', () => navigator.clipboard?.writeText(pre.textContent).catch(() => {}));
  box.append(bar, pre);
  document.body.appendChild(box);

  const render = () => {
    watchHero();
    const now = performance.now();
    while (changes.length && now - changes[0].t > 10000) changes.shift();
    const me = document.querySelector('.me'), img = me?.querySelector('.me-photo'), cv = me?.querySelector('.me-code');
    const r = me?.getBoundingClientRect();
    const vv = window.visualViewport;
    const ios = navigator.userAgent.match(/OS (\d+[_\d]*) like Mac/)?.[1]?.replace(/_/g, '.') || 'n/a';
    const state = me ? [...me.classList].filter((c) => c !== 'me').join(' ') || '(none)' : 'missing';
    const mq = (q) => (window.matchMedia(q).matches ? 'yes' : 'no');
    const html = document.documentElement;
    const lines = [
      `UA: ${navigator.userAgent}`,
      `iOS version: ${ios} · media: max-width 899px ${mq('(max-width: 899px)')} · max-width 599px ${mq('(max-width: 599px)')} · hover:none ${mq('(hover: none)')} · pointer:coarse ${mq('(pointer: coarse)')}`,
      `phone CSS applied: ${document.querySelector('.hero') ? getComputedStyle(document.querySelector('.hero')).display + ' / ' + getComputedStyle(document.querySelector('.hero')).flexDirection : 'no hero'} (flex / column = yes) · html: ${[...html.classList].join(' ') || '(none)'}`,
      `iOS: ${ios} · viewport ${innerWidth}x${innerHeight}${vv ? ` (visual ${Math.round(vv.width)}x${Math.round(vv.height)})` : ''} · dpr ${devicePixelRatio}`,
      `fonts: ${document.fonts?.status || 'n/a'} · resize events: ${D.resizes} · hero height changes (10s): ${changes.length}` +
        (changes.length ? ` · last ${changes[changes.length - 1].from}->${changes[changes.length - 1].to}` : '') + ` · hero h: ${lastH}`,
      `portrait state: ${state} · --p: ${me?.style.getPropertyValue('--p') || '0'}`,
      `img: ${short(img?.currentSrc || img?.src)} · complete:${img?.complete} · natural:${img?.naturalWidth}x${img?.naturalHeight}`,
      `card: ${r ? `${Math.round(r.width)}x${Math.round(r.height)} at y=${Math.round(r.top + scrollY)}` : 'missing'} · canvas: ${cv ? `${cv.width}x${cv.height}` : 'missing'}`,
      `  card   ${styles(me)}`,
      `  img    ${styles(img)}`,
      `  canvas ${styles(cv)}`,
      `errors (${D.errors.length}):`,
      ...D.errors.slice(-8).map((e) => `  ${e.msg} @ ${short(e.file, 50)}:${e.line}${e.col ? `:${e.col}` : ''}`),
    ];
    pre.textContent = lines.join('\n');
  };
  render();
  setInterval(render, 500);
}
