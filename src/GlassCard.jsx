import React, { useEffect, useId, useRef, useState } from 'react';
import { DotText } from './DotText.jsx';

/*
  Glass card: the rigid 429×554 artwork card from the Stack section, shared with Work together.
  Every size inside is a multiple of --u (1u = 1px at 429px wide), so the card scales as a unit;
  the parent sets --card-w. Styles live in stack.css (.sp-card ...). <FilterDefs /> must be on the
  page once (the Stack section renders it).
  Props: variant ('speed' | 'context' | 'connections'), title [line1, line2], dots, unit,
  caption [line1, line2], index (entrance stagger), id (reveal panel id),
  reveal { groups: [{ label, items }], footer, openLabel }, actions (extra pills, shown
  side by side with the reveal toggle), revealOnHover (desktop: hovering opens the panel; the button pins it).
*/

/* ── shared filters (defined once) ── */
export const FilterDefs = () => (
  <svg className="sp-defs" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      <filter id="spCardNoise" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".54" numOctaves="3" seed="27" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.8" intercept="-.25" />
          <feFuncG type="linear" slope="1.8" intercept="-.25" />
          <feFuncB type="linear" slope="1.8" intercept="-.25" />
          <feFuncA type="table" tableValues="0 .52" />
        </feComponentTransfer>
      </filter>
      <filter id="spPanelNoise" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="13" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
  </svg>
);

export const Grain = () => (
  <svg className="sp-grain" viewBox="0 0 429 554" preserveAspectRatio="none" aria-hidden="true">
    <rect width="429" height="554" filter="url(#spCardNoise)" />
  </svg>
);

/* ── card 1 visual: gauge with radar sweep ── */
function Gauge() {
  const u = useId().replace(/[^a-zA-Z0-9_-]/g, ''); // unique SVG ids when several gauges share the page
  const ticks = Array.from({ length: 23 }, (_, i) => {
    const a = ((190 + i * 5) * Math.PI) / 180, outer = 142, inner = i % 5 === 0 ? 129 : 133;
    return { x1: 163 + Math.cos(a) * inner, y1: 163 + Math.sin(a) * inner, x2: 163 + Math.cos(a) * outer, y2: 163 + Math.sin(a) * outer, w: i % 5 === 0 ? 1.5 : 1 };
  });
  const wedge = 'M238 33.1A150 150 0 0 1 277.9 66.6L199.8 119.5A55 55 0 0 0 190.5 115.4Z';
  return (
    <svg className="sp-gauge" viewBox="0 0 326 326" aria-hidden="true">
      <defs>
        <linearGradient id={`gaugeArc${u}`} gradientUnits="userSpaceOnUse" x1="7" y1="136" x2="312" y2="109">
          <stop offset="0" stopColor="#ff9ab7" stopOpacity=".06" /><stop offset=".08" stopColor="#ff8caf" stopOpacity=".44" />
          <stop offset=".34" stopColor="#ff6796" stopOpacity=".94" /><stop offset=".58" stopColor="#ff6796" stopOpacity="1" />
          <stop offset=".82" stopColor="#ffe7ed" stopOpacity=".74" /><stop offset=".94" stopColor="#fff8fa" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gaugeShadow${u}`} gradientUnits="userSpaceOnUse" x1="11" y1="136" x2="308" y2="110">
          <stop offset="0" stopColor="#6e1639" stopOpacity=".04" /><stop offset=".09" stopColor="#6e1639" stopOpacity=".17" />
          <stop offset=".52" stopColor="#72163d" stopOpacity=".18" /><stop offset=".78" stopColor="#7b1a43" stopOpacity=".1" />
          <stop offset="1" stopColor="#7b1a43" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`radarBeam${u}`} gradientUnits="userSpaceOnUse" cx="163" cy="163" r="145">
          <stop offset=".3" stopColor="#650f35" stopOpacity="0" /><stop offset=".45" stopColor="#650f35" stopOpacity=".025" />
          <stop offset=".7" stopColor="#650f35" stopOpacity=".065" /><stop offset=".9" stopColor="#650f35" stopOpacity=".08" />
          <stop offset="1" stopColor="#650f35" stopOpacity=".05" />
        </radialGradient>
        <linearGradient id={`radarBeamEdge${u}`} gradientUnits="userSpaceOnUse" x1="238" y1="33" x2="190.5" y2="115.4">
          <stop offset="0" stopColor="#ffe7ef" stopOpacity=".19" /><stop offset=".48" stopColor="#ffd1df" stopOpacity=".11" />
          <stop offset=".82" stopColor="#ffc6d7" stopOpacity=".045" /><stop offset="1" stopColor="#ffc6d7" stopOpacity="0" />
        </linearGradient>
        <filter id={`radarSoft${u}`}><feGaussianBlur stdDeviation="1.35" /></filter>
        <filter id={`radarHalo${u}`}><feGaussianBlur stdDeviation="5.2" /></filter>
        <filter id={`gaugeBlur${u}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="11" /></filter>
      </defs>
      <path d="M11.34 136.26A154 154 0 0 1 307.71 110.33" fill="none" strokeWidth="3.2" strokeLinecap="round" stroke={`url(#gaugeShadow${u})`} />
      <path d="M6.91 135.48A158.5 158.5 0 0 1 311.94 108.79" fill="none" strokeWidth="2.2" strokeLinecap="round" stroke={`url(#gaugeArc${u})`} />
      <path d="M19.22 137.65A146 146 0 0 1 236 36.56" fill="none" strokeWidth="1.15" stroke="rgba(255,166,194,.31)" />
      <g className="sp-sweep">
        <path d={wedge} fill="#6a1238" opacity=".022" filter={`url(#radarHalo${u})`} />
        <path d={wedge} fill={`url(#radarBeam${u})`} filter={`url(#radarSoft${u})`} />
        <path d="M238 33.1L190.5 115.4" stroke={`url(#radarBeamEdge${u})`} strokeWidth="1.25" strokeLinecap="round" filter={`url(#radarSoft${u})`} />
      </g>
      <g>{ticks.map((t, i) => <line key={i} className="sp-tick" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.w} />)}</g>
      <ellipse cx="225" cy="166" rx="92" ry="76" fill="#fff" opacity=".055" filter={`url(#gaugeBlur${u})`} />
    </svg>
  );
}

/* ── card 2 visual: tile wall + glass window ── */
function ContextGlow() {
  return (
    <div className="sp-context-glow" aria-hidden="true">
      <svg className="sp-context-backdrop" viewBox="0 0 429 554" preserveAspectRatio="none">
        <defs>
          <filter id="tileSoft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.4" /></filter>
          <filter id="groutSoft" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="6.5" /></filter>
          <linearGradient id="tTLf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4b0ee" stopOpacity=".05" /><stop offset="1" stopColor="#c6bbff" stopOpacity=".18" /></linearGradient>
          <linearGradient id="tTCf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d5c2ff" stopOpacity=".22" /><stop offset=".35" stopColor="#e0bdff" stopOpacity=".26" /><stop offset=".7" stopColor="#f2a0ee" stopOpacity=".32" /><stop offset="1" stopColor="#ff96da" stopOpacity=".34" /></linearGradient>
          <linearGradient id="tTRf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe8da" stopOpacity=".56" /><stop offset=".5" stopColor="#f9c6d0" stopOpacity=".26" /><stop offset="1" stopColor="#eba4bf" stopOpacity=".08" /></linearGradient>
          <linearGradient id="tMLf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#cdb8ff" stopOpacity=".34" /><stop offset="1" stopColor="#a77fd6" stopOpacity=".12" /></linearGradient>
          <linearGradient id="tMCf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e7b6f0" stopOpacity=".26" /><stop offset="1" stopColor="#c7629f" stopOpacity=".2" /></linearGradient>
          <linearGradient id="tMRf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e858b8" stopOpacity=".52" /><stop offset=".5" stopColor="#e6459c" stopOpacity=".46" /><stop offset="1" stopColor="#de74ba" stopOpacity=".16" /></linearGradient>
          <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <linearGradient id="deepX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6e2440" /><stop offset=".35" stopColor="#e2826f" /><stop offset=".7" stopColor="#f0a6c4" /><stop offset="1" stopColor="#9fa6e8" /></linearGradient>
          <linearGradient id="deepMg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".35" stopColor="#fff" stopOpacity=".5" /><stop offset="1" stopColor="#fff" stopOpacity=".2" /></linearGradient>
          <mask id="deepM"><rect x="-24" y="384" width="480" height="170" fill="url(#deepMg)" /></mask>
        </defs>
        <g filter="url(#tileSoft)">
          <rect x="-24" y="22" width="106" height="149" rx="15" fill="url(#tTLf)" />
          <rect x="88" y="22" width="247" height="150" rx="15" fill="url(#tTCf)" />
          <rect x="88" y="22" width="247" height="46" rx="15" fill="url(#sheen)" />
          <rect x="346" y="22" width="111" height="147" rx="15" fill="url(#tTRf)" />
          <rect x="346" y="22" width="111" height="46" rx="15" fill="url(#sheen)" />
          <rect x="-24" y="177" width="108" height="174" rx="15" fill="url(#tMLf)" />
          <rect x="-24" y="177" width="108" height="52" rx="15" fill="url(#sheen)" />
          <rect x="88" y="177" width="247" height="174" rx="15" fill="url(#tMCf)" />
          <rect x="344" y="175" width="113" height="176" rx="15" fill="url(#tMRf)" />
        </g>
        <rect x="-24" y="384" width="480" height="170" fill="url(#deepX)" mask="url(#deepM)" filter="url(#tileSoft)" />
        <g filter="url(#groutSoft)" opacity=".55">
          <rect x="81" y="30" width="8" height="150" fill="#5a1f5e" />
          <rect x="338" y="30" width="8" height="322" fill="#6b1d58" />
          <rect x="0" y="167" width="429" height="12" fill="#5d2163" />
        </g>
        <ellipse cx="352" cy="86" rx="70" ry="54" fill="#ffd9e6" opacity=".22" filter="url(#groutSoft)" />
        <ellipse cx="75" cy="150" rx="41" ry="27" fill="#fff" opacity=".14" filter="url(#groutSoft)" />
        <ellipse cx="56" cy="215" rx="28" ry="31" fill="#8f5bd6" opacity=".25" filter="url(#groutSoft)" />
      </svg>
    </div>
  );
}

function ContextWindow() {
  return (
    <div className="sp-window" aria-hidden="true">
      <svg className="sp-window-grain" viewBox="0 0 252 166" preserveAspectRatio="none"><rect width="252" height="166" filter="url(#spPanelNoise)" /></svg>
      <div className="sp-window-lines"><span /><span /><span /></div>
    </div>
  );
}

/* ── card 3 visual: connections map (5 nodes = 5 live products) ── */
function ConnectionsMap() {
  const white = [
    [0.2, 'M0 5H128c27 0 36 7 39 26 2 16 9 22 24 22h106c16 0 23-8 25-25 2-16 10-23 31-23h76'],
    [0.3, 'M0 117h46c15 0 22 8 26 25 5 23 12 31 31 31h174c18 0 25-8 30-31 4-17 11-25 26-25h96'],
    [0.34, 'M0 173h87c15 0 22 7 27 25 4 15 11 22 28 22h140c17 0 25-7 29-22 5-18 12-25 28-25h90'],
    [0.16, 'M0 228h120c17 0 25-5 28-18 4-15 10-20 28-20h81c18 0 25 6 28 20 4 13 11 18 28 18h116'],
    [0.26, 'M0 5H429M0 61H429M0 117H429'],
    [0.09, 'M0 173H429'],
  ];
  const warm = [
    [0.52, 'M0 61h95c14 0 22-6 27-20 4-13 12-20 27-20h115c15 0 23 6 27 20 5 14 13 20 28 20h110'],
    [0.94, 'M0 117h88c15 0 22-8 25-25 4-24 12-31 31-31h129c20 0 27 7 31 31 3 17 10 25 26 25h99'],
  ];
  const nodes = [[45, 117, '#fff'], [133, 61, '#fff4a7'], [189, 61, '#fff1a4'], [319, 61, '#fff4a6'], [319, 117, '#fff2a0']];
  return (
    <svg className="sp-map" viewBox="0 0 429 238" preserveAspectRatio="none" aria-hidden="true">
      {white.map(([o, d], i) => <path key={i} d={d} fill="none" stroke="#fff" strokeWidth="1" opacity={o} />)}
      {warm.map(([o, d], i) => <path key={i} className="sp-flow" d={d} fill="none" stroke="#fff8dd" strokeWidth="1.15" opacity={o} />)}
      {nodes.map(([cx, cy, f], i) => <circle key={i} className="sp-node" cx={cx} cy={cy} r="6.5" fill={f} style={{ '--n': i }} />)}
    </svg>
  );
}

export function useTilt(card) {
  // 3D tilt + glare + depth toward the cursor (desktop only; off on touch and with reduced motion).
  // --tx / --ty (-1..1) ease toward the cursor each frame (lerp 0.15); the rect is cached on enter / resize / scroll,
  // never read in the loop. On leave the loop stops and CSS eases everything back to flat.
  useEffect(() => {
    const el = card.current;
    if (!el || !finePointer() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.add('has-tilt');
    let rect = null, raf = 0, on = false, x = 0, y = 0, gx = 0, gy = 0;
    const measure = () => { rect = el.getBoundingClientRect(); };
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    const frame = () => {
      x += (gx - x) * 0.15; y += (gy - y) * 0.15;
      el.style.setProperty('--tx', x.toFixed(4));
      el.style.setProperty('--ty', y.toFixed(4));
      raf = on ? requestAnimationFrame(frame) : 0;
    };
    const enter = (e) => {
      if (e.pointerType !== 'mouse') return;
      measure(); on = true;
      el.classList.add('is-tilting');
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const move = (e) => {
      if (!on || !rect) return;
      gx = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1);
      gy = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1);
      el.style.setProperty('--gx', `${((gx + 1) * 50).toFixed(2)}%`); // glare follows the cursor exactly
      el.style.setProperty('--gy', `${((gy + 1) * 50).toFixed(2)}%`);
    };
    const leave = () => {
      on = false; cancelAnimationFrame(raf); raf = 0; x = y = gx = gy = 0;
      el.classList.remove('is-tilting');
      el.style.setProperty('--tx', '0'); el.style.setProperty('--ty', '0');
    };
    const remeasure = () => { if (on) measure(); };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    window.addEventListener('resize', remeasure, { passive: true });
    window.addEventListener('scroll', remeasure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', remeasure); window.removeEventListener('scroll', remeasure);
    };
  }, []);

  // the button pins / unpins; unpinning also closes a hover-open panel
}

/* ── ocean visual: a glowing server stack with status dots and a thin rising line chart ── */
function ServerStack() {
  const rows = [10, 52, 94];
  return (
    <svg className="sp-server" viewBox="0 0 300 138" aria-hidden="true">
      {rows.map((y, i) => (
        <g key={y}>
          <rect x="8" y={y} width="196" height="34" rx="9" fill="rgba(210,245,255,.10)" stroke="rgba(210,245,255,.55)" strokeWidth="1.2" />
          <rect x="22" y={y + 14} width="74" height="6" rx="3" fill="rgba(210,245,255,.38)" />
          <circle cx="170" cy={y + 17} r="3.6" fill={i === 1 ? '#ffd88a' : '#9dffd6'} className="sp-led" style={{ '--n': i }} />
          <circle cx="184" cy={y + 17} r="3.6" fill="rgba(210,245,255,.45)" />
        </g>
      ))}
      <path d="M220 124 L240 108 L254 114 L270 86 L292 60" fill="none" stroke="#bff6ff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="sp-flow" />
      <circle cx="292" cy="60" r="3.4" fill="#e8fdff" />
    </svg>
  );
}

/* ── card ── */
// Only one card is open from hovering at a time: this holds the current one's "close" function.
let hoverOwner = null;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function GlassCard({ id, variant, title, dots, unit, caption, index = 0, reveal, actions, revealOnHover = false, corner = null }) {
  const [pinned, setPinned] = useState(false);   // opened with the button (stays open)
  const [hovered, setHovered] = useState(false); // opened by hovering (desktop, revealOnHover)
  const timer = useRef(0);
  const open = pinned || hovered;
  const radius = variant === 'context' ? 2.32 : 1.55;

  // stable across renders, so hoverOwner comparisons keep working
  const closeRef = useRef(null);
  if (!closeRef.current) closeRef.current = () => { clearTimeout(timer.current); setHovered(false); if (hoverOwner === closeRef.current) hoverOwner = null; };
  const closeHover = closeRef.current;
  const hoverIn = (e) => {
    if (!revealOnHover || e.pointerType !== 'mouse' || !finePointer()) return;
    clearTimeout(timer.current); // moving back in cancels a pending close
    timer.current = setTimeout(() => {
      if (hoverOwner && hoverOwner !== closeHover) hoverOwner();
      hoverOwner = closeHover;
      setHovered(true);
    }, 120); // hover intent
  };
  const hoverOut = (e) => {
    if (!revealOnHover || e.pointerType !== 'mouse') return;
    clearTimeout(timer.current);
    timer.current = setTimeout(closeHover, 200);
  };
  useEffect(() => () => { clearTimeout(timer.current); if (hoverOwner === closeHover) hoverOwner = null; }, []);

  const card = useRef(null);
  useTilt(card);

  // The front button pins / unpins; "Back" unpins and closes a hover flip too.
  // A keyboard activation (click with detail 0) moves focus to the face that just turned to the front.
  const kbd = useRef(false), frontBtn = useRef(null), backBtn = useRef(null), turned = useRef(false);
  const onToggle = (e) => {
    kbd.current = e.detail === 0;
    if (pinned) { setPinned(false); closeHover(); } else setPinned(true);
  };
  const onBack = (e) => { kbd.current = e.detail === 0; setPinned(false); closeHover(); };

  // Flip state lives in classes set here (React only renders the constant "sp-card", so it never wipes the
  // classes this file adds by hand). 3D (.is-3d: preserve-3d, backface-visibility, will-change) exists only
  // while flipping or flipped; at rest the card is exactly the flat card. The face turned away is
  // visibility: hidden once the turn has finished (transitionend, with a timeout fallback).
  const flipDone = useRef(0);
  useEffect(() => {
    const el = card.current, flipper = el?.querySelector('.sp-flipper');
    if (!el || !flipper) return;
    if (!turned.current && !open) return; // first render: nothing to do
    turned.current = true;
    clearTimeout(flipDone.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const after = (fn) => {
      let done = false;
      const end = (e) => { if (e && (e.target !== flipper || e.propertyName !== 'transform')) return; if (done) return; done = true; flipper.removeEventListener('transitionend', end); fn(); };
      flipper.addEventListener('transitionend', end);
      flipDone.current = setTimeout(() => end(), reduced ? 260 : 900);
    };
    if (open) {
      el.classList.remove('hide-front');
      el.classList.add('show-back');
      if (reduced) el.classList.add('is-flipped');
      else {
        el.classList.add('is-3d');
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-flipped'))); // 3D applies first
      }
      after(() => { if (el.classList.contains('is-flipped')) el.classList.add('hide-front'); });
    } else {
      el.classList.remove('hide-front', 'is-flipped');
      after(() => { if (!el.classList.contains('is-flipped')) el.classList.remove('is-3d', 'show-back'); });
    }
  }, [open]);
  useEffect(() => {
    if (kbd.current) { (open ? backBtn : frontBtn).current?.focus(); kbd.current = false; }
  }, [open]);
  useEffect(() => () => clearTimeout(flipDone.current), []);

  const toggle = (
    <button type="button" className="sp-learn-more" ref={frontBtn} aria-expanded={open} aria-controls={id} onClick={onToggle}>
      {reveal.openLabel || 'View stack'}
    </button>
  );
  return (
    <article
      ref={card}
      className="sp-card" style={{ '--entrance-delay': `${0.46 + index * 0.12}s` }}
      onPointerEnter={revealOnHover ? hoverIn : undefined} onPointerLeave={revealOnHover ? hoverOut : undefined}
    >
      <div className="sp-flipper">
        {/* FRONT: the card design */}
        <div className={`sp-face sp-front sp-card--${variant}`} aria-hidden={open} inert={open}>
          {variant === 'context' && <ContextGlow />}
          <Grain />
          <span className="sp-glare" aria-hidden="true" />
          <h3 className="sp-title">{title[0]}<br />{title[1]}</h3>
          {variant === 'speed' && <Gauge />}
          {variant === 'context' && <ContextWindow />}
          {variant === 'connections' && <ConnectionsMap />}
          {variant === 'ocean' && <ServerStack />}
          {corner && <span className="sp-corner">{corner}</span>}
          <p className={`sp-metric sp-metric--${variant}`}>
            <span className="sp-dot-number"><DotText text={dots} radius={radius} /></span>
            <span className="sp-unit">{unit}</span>
            <span className="sr-only">{dots} {unit}</span>
          </p>
          <p className="sp-caption">{caption[0]}<br />{caption[1]}</p>
          {actions ? <div className="sp-actions">{actions}{toggle}</div> : toggle}
        </div>

        {/* BACK: the same gradient, darkened, with the details */}
        <div className={`sp-face sp-back sp-card--${variant}`} id={id} aria-hidden={!open} inert={!open}>
          <span className="sp-back-shade" aria-hidden="true" />
          <Grain />
          <span className="sp-glare" aria-hidden="true" />
          <p className="sp-back-title">{(reveal.title || title).map((t, k) => <React.Fragment key={k}>{k > 0 && <br />}{t}</React.Fragment>)}</p>
          {reveal.content
            ? <div className="sp-stack sp-stack--free">{reveal.content}</div>
            : (
              <div className="sp-stack">
                {reveal.groups.map((g) => (
                  <div key={g.label}>
                    <span>{g.label}</span>
                    <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    {reveal.footer}
                  </div>
                ))}
              </div>
            )}
          <button type="button" className="sp-learn-more" ref={backBtn} onClick={onBack}>Back</button>
        </div>
      </div>
    </article>
  );
}

/* ── compact glass badge: rigid 429×200 design, no button and no flip; tilt and glare like the cards ── */
export function GlassBadge({ variant = 'graphite', glow = false, icon, title, sub, dots, unit, index = 0 }) {
  const card = useRef(null);
  useTilt(card);
  return (
    <article ref={card} className={`sp-card sp-card--badge${glow ? ' sp-card--glow' : ''}`} style={{ '--entrance-delay': `${0.46 + index * 0.12}s` }}>
      <div className="sp-flipper">
        <div className={`sp-face sp-front sp-card--${variant}`}>
          <Grain />
          <span className="sp-glare" aria-hidden="true" />
          <div className="sp-badge-body">
            <span className="sp-badge-icon" aria-hidden="true">{icon}</span>
            <div className="sp-badge-text">
              <h3 className="sp-badge-title">{title}</h3>
              <p className="sp-badge-sub">{sub}</p>
            </div>
            <p className="sp-badge-metric">
              <span className="sp-badge-dots" aria-hidden="true"><DotText text={dots} radius={1.55} /></span>
              {unit && <span className="sp-badge-unit" aria-hidden="true">{unit}</span>}
              <span className="sr-only">{unit ? `${unit} ${dots}` : dots}</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

// Plays the Stack entrance once when `ref` (the cards' container, starting with class sp-pending) scrolls into view.
export function useGlassEntrance(ref) {
  useEffect(() => {
    const el = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.remove('sp-pending'); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.classList.remove('sp-pending'); el.classList.add('sp-entrance');
      io.disconnect();
      const last = el.querySelector('.sp-card:last-child .sp-learn-more');
      const done = () => el.classList.remove('sp-entrance');
      last?.addEventListener('animationend', done, { once: true });
      setTimeout(done, 3200); // failsafe
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
