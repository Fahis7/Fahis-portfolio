import React, { useEffect, useRef } from 'react';
import MiniSite from './MiniSites.jsx';

/*
  Scanner belt: project cards drift left; at the orange scanner line
  each card dissolves into pixel particles and the code underneath is
  revealed on the left. One requestAnimationFrame loop drives the DOM
  transforms, the counter and the canvas, so everything stays in sync.
*/

const PALETTE = ['#FF4A12', '#FF5A1F', '#FF6B2C', '#FF8A3D', '#FFB06A', '#FFD9B5', '#FFF3E6'];
const CARD_TOP = 70; // px inside the belt

function hash(a, b, c) {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const mod = (n, m) => ((n % m) + m) % m;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function Belt({ projects }) {
  const beltRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRefs = useRef([]);
  const codeRefs = useRef([]);
  const nameRef = useRef(null);
  const pctRef = useRef(null);
  const scanRef = useRef(null);

  useEffect(() => {
    const belt = beltRef.current, canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cards = cardRefs.current, codes = codeRefs.current;
    const N = projects.length;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, BH = 0, cw = 0, ch = 0, gap = 0, Lx = 0, radius = 0, dpr = 1, span = 0, period = 0;
    let off = 0, vel = 0, hover = 0, hoverTarget = 0, dragging = false;
    let lastX = 0, lastT = 0, dragVel = 0, dragDist = 0, downCard = -1;
    let shown = 0, crossing = -1, raf = 0, last = performance.now(), visible = true;
    const sparks = [];

    const measure = () => {
      const r = cards[0].getBoundingClientRect();
      W = belt.clientWidth; BH = belt.clientHeight; cw = r.width; ch = r.height;
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      gap = window.innerWidth * (mobile ? 0.07 : 0.0475);
      radius = window.innerWidth * (mobile ? 0.035 : 0.016);
      Lx = W / 2; span = cw + gap; period = span * N;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(BH * dpr);
      canvas.style.width = W + 'px'; canvas.style.height = BH + 'px';
    };
    measure();
    off = W / 2 - 0.12 * cw; // first card already ~12% through the scanner on load

    const autoSpeed = () => (reduced ? 0 : -0.075 * window.innerWidth);
    const fmtPct = (p) => `${Math.round(p)}% decoded`;

    /* ── interaction ── */
    const onEnter = () => (hoverTarget = 1);
    const onLeave = () => (hoverTarget = 0);
    const onDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; dragDist = 0; dragVel = 0;
      lastX = e.clientX; lastT = performance.now();
      const card = e.target.closest('[data-card]');
      downCard = card ? Number(card.dataset.card) : -1;
      belt.setPointerCapture(e.pointerId);
      belt.classList.add('is-dragging');
    };
    const onMove = (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      off += dx; dragDist += Math.abs(dx);
      dragVel = (dx / Math.max(8, now - lastT)) * 1000 * 0.8 + dragVel * 0.2;
      lastX = e.clientX; lastT = now;
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false; vel = dragVel;
      belt.classList.remove('is-dragging');
      try { belt.releasePointerCapture(e.pointerId); } catch { /* already released */ }
      if (dragDist < 6 && downCard >= 0) {
        document.getElementById(`work-${projects[downCard].id}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    };
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { vel += -e.deltaX * 6; e.preventDefault(); }
    };
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { vel -= 900; e.preventDefault(); }
      if (e.key === 'ArrowRight') { vel += 900; e.preventDefault(); }
    };
    belt.addEventListener('pointerenter', onEnter);
    belt.addEventListener('pointerleave', onLeave);
    belt.addEventListener('pointerdown', onDown);
    belt.addEventListener('pointermove', onMove);
    belt.addEventListener('pointerup', onUp);
    belt.addEventListener('pointercancel', onUp);
    belt.addEventListener('wheel', onWheel, { passive: false });
    belt.addEventListener('keydown', onKey);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });
    io.observe(belt);

    /* ── canvas ── */
    function drawFx(x, i, t) {
      const top = CARD_TOP;
      // 1. haze
      const hw = Math.min(150, x + cw - Lx);
      if (hw > 0) {
        const g = ctx.createLinearGradient(Lx, 0, Lx + 150, 0);
        g.addColorStop(0, 'rgba(255,96,40,.42)'); g.addColorStop(1, 'rgba(255,96,40,0)');
        ctx.fillStyle = g; ctx.fillRect(Lx, top, hw, ch);
      }
      // 2. dithered particles fixed to the card surface
      const R = 0.3 * cw, CELL = 3, rows = Math.ceil(ch / CELL);
      const cut = Lx - x;
      const g0 = Math.max(0, Math.floor(cut / CELL)), g1 = Math.min(Math.ceil(cw / CELL), Math.ceil((cut + R) / CELL));
      const buckets = PALETTE.map(() => []);
      const tw = Math.floor(t * 9) + 97;
      for (let gx = g0; gx < g1; gx++) {
        const sx = x + gx * CELL, d = sx - Lx;
        if (d < 0) continue;
        const p = Math.pow(1 - d / R, 1.7);
        for (let row = -5; row < rows + 5; row++) {
          const inside = row >= 0 && row < rows;
          const fade = inside ? 1 : 1 - (row < 0 ? -row : row - rows + 1) / 6;
          const th = inside ? p * 0.92 : p * 0.16 * fade;
          if (hash(gx, row, i) >= th) continue;
          if (!reduced && hash(gx, row, tw) < 0.22) continue;
          const h2 = hash(row, gx, i + 31);
          const ci = d < 10 ? 4 + Math.floor(h2 * 3) : Math.floor(h2 * h2 * 7);
          const size = 1.1 + h2 * 1.7;
          const jx = reduced ? 0 : (hash(gx, row, i + 7) - 0.5) * 1.6, jy = reduced ? 0 : (hash(row, gx, i + 11) - 0.5) * 1.6;
          buckets[ci].push(sx + jx, top + row * CELL + jy, size);
        }
      }
      buckets.forEach((b, ci) => {
        if (!b.length) return;
        ctx.fillStyle = PALETTE[ci]; ctx.beginPath();
        for (let k = 0; k < b.length; k += 3) ctx.rect(b[k], b[k + 1], b[k + 2], b[k + 2]);
        ctx.fill();
      });
      // 3. spawn sparks
      if (!reduced) {
        for (let s = 0; s < 3; s++) {
          if (Math.random() > 0.7) continue;
          const life = 0.3 + Math.random() * 0.8;
          sparks.push({
            x: Lx + Math.random() * 30, y: top - 10 + Math.random() * (ch + 20),
            vx: -30 + Math.random() * 70 + vel * 0.6, vy: (Math.random() - 0.5) * 50,
            s: 0.8 + Math.random() * 1.8, c: PALETTE[Math.floor(Math.random() * 7)], life,
          });
        }
      }
    }

    function frame(now) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = now / 1000;

      hover += (hoverTarget - hover) * Math.min(1, dt * 4);
      if (!dragging) {
        const target = autoSpeed() * (1 - 0.65 * hover);
        vel += (target - vel) * (1 - Math.exp(-2.2 * dt));
        off += vel * dt;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, BH);

      let cross = -1, progress = 0;
      for (let i = 0; i < N; i++) {
        const x = mod(off + i * span + span, period) - span;
        const cut = clamp(Lx - x, 0, cw);
        const card = cards[i], code = codes[i];
        card.style.transform = code.style.transform = `translate3d(${x}px,0,0)`;
        if (cut > 0) {
          card.style.clipPath = `inset(0 0 0 ${cut}px round 0 ${radius}px ${radius}px 0)`;
          const m = `linear-gradient(90deg, transparent ${cut}px, #000 ${cut + 26}px)`;
          card.style.maskImage = m; card.style.webkitMaskImage = m;
          code.style.visibility = 'visible';
          code.style.clipPath = `inset(0 ${cw - cut}px 0 0)`;
        } else {
          card.style.clipPath = card.style.maskImage = card.style.webkitMaskImage = '';
          code.style.visibility = 'hidden';
        }
        card.style.visibility = cut >= cw ? 'hidden' : 'visible';
        if (cut > 0 && cut < cw) { cross = i; progress = cut / cw; drawFx(x, i, t); }
      }

      // sparks
      for (let k = sparks.length - 1; k >= 0; k--) {
        const s = sparks[k];
        s.life -= dt; if (s.life <= 0) { sparks.splice(k, 1); continue; }
        s.x += s.vx * dt; s.y += s.vy * dt;
        ctx.globalAlpha = Math.min(1, s.life * 2.2); ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, s.s, s.s);
      }
      ctx.globalAlpha = 1;

      // counter
      if (cross >= 0) {
        const target = progress * 100;
        if (cross !== crossing) {
          crossing = cross; shown = target;
          nameRef.current.textContent = projects[cross].title;
          scanRef.current?.setAttribute('aria-label', `Scanning ${projects[cross].title}`);
        }
        shown += (target - shown) * Math.min(1, dt * 14);
        pctRef.current.textContent = fmtPct(shown);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      window.removeEventListener('resize', onResize);
      belt.removeEventListener('pointerenter', onEnter); belt.removeEventListener('pointerleave', onLeave);
      belt.removeEventListener('pointerdown', onDown); belt.removeEventListener('pointermove', onMove);
      belt.removeEventListener('pointerup', onUp); belt.removeEventListener('pointercancel', onUp);
      belt.removeEventListener('wheel', onWheel); belt.removeEventListener('keydown', onKey);
    };
  }, [projects]);

  return (
    <>
      <div className="badge" aria-hidden="true">
        <span className="badge-label">Under the hood</span>
        <span className="badge-pill"><b ref={nameRef}>{projects[0].title}</b><i ref={pctRef}>0% decoded</i></span>
      </div>
      <div
        className="belt" ref={beltRef} tabIndex={0} role="region"
        aria-label="Project belt. Drag, or use the left and right arrow keys, to scrub. Select a card to jump to its case study."
      >
        <div className="codes" aria-hidden="true">
          {projects.map((p, i) => (
            <div className="code" key={p.id} ref={(el) => (codeRefs.current[i] = el)}>
              <pre className="code-src">{p.code}</pre>
              <pre className="code-meta">{p.meta.join('\n')}</pre>
            </div>
          ))}
        </div>
        <div className="cards">
          {projects.map((p, i) => (
            <div className="card" key={p.id} data-card={i} ref={(el) => (cardRefs.current[i] = el)} aria-label={`${p.title}: ${p.tagline}`}>
              <MiniSite site={p.site} />
            </div>
          ))}
        </div>
        <canvas className="fx" ref={canvasRef} aria-hidden="true" />
      </div>
      <div className="scan" ref={scanRef} aria-hidden="true"><b /><i /></div>
    </>
  );
}
