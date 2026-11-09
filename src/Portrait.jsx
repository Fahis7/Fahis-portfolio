import React, { useEffect, useRef, useState } from 'react';

/*
  Decode portrait.
  Shown decoded by default: the photo rebuilt from characters of code with a
  soft x-ray glow. Hover (or keyboard focus, a tap, Enter / Space) sweeps the
  orange scanner back to reveal the real black-and-white photo.
  On load it starts as the photo and sweeps once to decoded, so the effect is seen.
  One CSS variable, --p (0 = photo, 1 = decoded), drives the photo clip, the code
  clip and the scanner position. Styles live in portrait.css.
*/

const CODE = "const fahis = { role: 'AI engineer', city: 'Dubai', stack: ['django','react','postgres','pgvector'], ships: true }; ";

function drawCode(canvas, img) {
  const r = canvas.getBoundingClientRect();
  if (!r.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  const ctx = canvas.getContext('2d');
  const cellW = 3.3 * dpr, cellH = 4.6 * dpr;
  const cols = Math.floor(canvas.width / cellW), rows = Math.floor(canvas.height / cellH);

  // low-res sample for the characters
  const s = document.createElement('canvas'); s.width = cols; s.height = rows;
  const sx = s.getContext('2d'); sx.drawImage(img, 0, 0, cols, rows);
  const px = sx.getImageData(0, 0, cols, rows).data;
  const lum = (d, i) => (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;

  // normalise brightness inside the cut-out so the face reads clearly
  let lo = 1, hi = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 100) { const l = lum(px, i); lo = Math.min(lo, l); hi = Math.max(hi, l); }
  const norm = (l) => Math.min(1, Math.max(0, (l - lo) / (hi - lo + 1e-3)));

  ctx.fillStyle = '#0f1115';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // x-ray glow underlay: the cut-out's own shading, tinted orange, softened
  const g = document.createElement('canvas'); g.width = canvas.width; g.height = canvas.height;
  const gx = g.getContext('2d'); gx.drawImage(img, 0, 0, g.width, g.height);
  const gd = gx.getImageData(0, 0, g.width, g.height), d = gd.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = norm(lum(d, i));
    d[i] = 255; d[i + 1] = 70 + n * 150; d[i + 2] = 20 + n * 110; d[i + 3] = d[i + 3] * (0.08 + Math.pow(n, 1.6) * 0.5);
  }
  gx.putImageData(gd, 0, 0);
  ctx.save(); ctx.filter = `blur(${1.2 * dpr}px)`; ctx.drawImage(g, 0, 0); ctx.restore();

  // characters
  ctx.font = `500 ${4.5 * dpr}px "IBM Plex Mono", ui-monospace, monospace`;
  ctx.textBaseline = 'top';
  let k = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = (y * cols + x) * 4, a = px[i + 3] / 255, ch = CODE[k++ % CODE.length];
    if (a < 0.4) {
      if ((x * 7 + y * 13) % 29 === 0) { ctx.fillStyle = 'rgba(255,90,31,.12)'; ctx.fillText('·', x * cellW, y * cellH); }
      continue;
    }
    const n = norm(lum(px, i)), v = 0.14 + Math.pow(n, 1.15) * 0.86;
    ctx.fillStyle = n > 0.72 ? `rgba(255,240,230,${v})` : `rgba(255,${100 + n * 120},${40 + n * 90},${v})`;
    ctx.fillText(ch, x * cellW, y * cellH);
  }
}

export default function Portrait({ photo, cutout, alt }) {
  const wrap = useRef(null), canvas = useRef(null);
  const drawn = useRef(null); // resolves once the code layer has been drawn
  if (!drawn.current) { let r; drawn.current = new Promise((res) => (r = res)); drawn.current.resolve = r; }
  const [hint] = useState(() => (window.matchMedia('(hover: hover) and (pointer: fine)').matches ? 'Hover me' : 'Tap me'));

  // Draw the code layer once the cut-out and the mono font are ready; redraw on resize.
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.decoding = 'async';
    img.src = cutout;
    const draw = () => alive && img.complete && img.naturalWidth && drawCode(canvas.current, img);
    Promise.all([
      new Promise((res) => { img.onload = res; img.onerror = res; }),
      document.fonts?.load('500 9px "IBM Plex Mono"').catch(() => {}),
    ]).then(() => { draw(); drawn.current.resolve(); });
    let t;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(draw, 120); });
    ro.observe(canvas.current);
    return () => { alive = false; ro.disconnect(); clearTimeout(t); };
  }, [cutout]);

  // Animate --p toward 0 (photo) or 1 (decoded).
  useEffect(() => {
    const el = wrap.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let p = 0, target = 0, raf = 0, last = 0, touched = false, alive = true;
    const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const tick = (t) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t;
      const dir = Math.sign(target - p);
      p += (dir * dt) / (target ? 0.9 : 0.7); // 0.9 s to decode, 0.7 s back
      if ((dir > 0 && p >= target) || (dir < 0 && p <= target)) p = target;
      el.style.setProperty('--p', ease(p).toFixed(4));
      if (p !== target) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
    };
    const go = (v, user = true) => {
      if (user) touched = true;
      target = v;
      el.setAttribute('aria-pressed', v ? 'false' : 'true'); // pressed = photo revealed
      el.classList.toggle('is-photo', !v);
      if (reduced) { p = v; el.style.setProperty('--p', String(v)); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const enter = (e) => e.pointerType !== 'touch' && go(0);
    const leave = (e) => e.pointerType !== 'touch' && go(1);
    const up = (e) => e.pointerType === 'touch' && go(target ? 0 : 1);
    const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(target ? 0 : 1); } };
    const focus = () => go(0), blur = () => go(1);

    // Intro: start as the photo, then sweep once to decoded when the code layer is drawn
    // and ~0.6 s after the hero entrance ends. Reduced motion: decoded straight away.
    el.classList.add('is-photo');
    if (reduced) go(1, false);
    else {
      const entrance = Promise.all((el.getAnimations?.() || []).map((a) => a.finished.catch(() => {})));
      Promise.all([drawn.current, entrance])
        .then(() => new Promise((r) => setTimeout(r, 600)))
        .then(() => { if (alive && !touched) go(1, false); });
    }
    el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
    el.addEventListener('pointerup', up); el.addEventListener('keydown', key);
    el.addEventListener('focus', focus); el.addEventListener('blur', blur);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerup', up); el.removeEventListener('keydown', key);
      el.removeEventListener('focus', focus); el.removeEventListener('blur', blur);
    };
  }, []);

  return (
    <figure className="me" ref={wrap} tabIndex={0} role="button" aria-pressed="true" aria-label={`${alt}. Hover, tap or press Enter to reveal photo`}>
      <canvas className="me-code" ref={canvas} aria-hidden="true" />
      <img className="me-photo" src={photo} alt="" draggable="false" />
      <i className="me-scan" aria-hidden="true" />
      <span className="me-tag" aria-hidden="true"><i className="me-dot" />{hint}</span>
    </figure>
  );
}
