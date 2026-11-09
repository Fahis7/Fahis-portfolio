import React, { useEffect, useMemo, useRef, useState } from 'react';

/*
  Stack section — "Built for Production / Across the Stack".
  Three rigid glass cards designed at 429×554 and scaled as a unit:
  every size inside a card is a multiple of --u (1u = 1px at 429px wide),
  so the internal layout never changes — only how many cards share a row.
*/

/* ── LED dot-matrix type ── */
const GLYPHS = {
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['010', '110', '010', '010', '010', '010', '111'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['0', '0', '0', '0', '0', '0', '1'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  r: ['00000', '00000', '10110', '11001', '10000', '10000', '10000'],
  o: ['00000', '00000', '01110', '10001', '10001', '10001', '01110'],
  d: ['00001', '00001', '01111', '10001', '10001', '10001', '01111'],
  u: ['00000', '00000', '10001', '10001', '10001', '10011', '01101'],
  c: ['00000', '00000', '01110', '10000', '10000', '10001', '01110'],
  t: ['010', '010', '111', '010', '010', '010', '001'],
  i: ['1', '0', '1', '1', '1', '1', '1'],
  n: ['00000', '00000', '11110', '10001', '10001', '10001', '10001'],
};

function DotText({ text, pitchX = 5, radius = 1.55, className = 'dot-svg' }) {
  const { circles, width } = useMemo(() => {
    const out = [];
    let x = 0;
    for (const ch of String(text)) {
      const g = GLYPHS[ch];
      if (!g) { x += 3 * pitchX; continue; }
      const cols = g[0].length;
      g.forEach((row, y) => [...row].forEach((bit, col) => {
        if (bit === '1') out.push([x + col * pitchX + 1.55, y * 4 + 1.55]);
      }));
      x += (cols + 1) * pitchX;
    }
    return { circles: out, width: x };
  }, [text, pitchX]);
  return (
    <svg className={className} viewBox={`0 0 ${width} 28`} fill="currentColor" aria-hidden="true" style={{ '--vbw': width }}>
      {circles.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={radius} />)}
    </svg>
  );
}

/* ── shared filters (defined once) ── */
const FilterDefs = () => (
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

const Grain = () => (
  <svg className="sp-grain" viewBox="0 0 429 554" preserveAspectRatio="none" aria-hidden="true">
    <rect width="429" height="554" filter="url(#spCardNoise)" />
  </svg>
);

/* ── card 1 visual: gauge with radar sweep ── */
function Gauge() {
  const ticks = Array.from({ length: 23 }, (_, i) => {
    const a = ((190 + i * 5) * Math.PI) / 180, outer = 142, inner = i % 5 === 0 ? 129 : 133;
    return { x1: 163 + Math.cos(a) * inner, y1: 163 + Math.sin(a) * inner, x2: 163 + Math.cos(a) * outer, y2: 163 + Math.sin(a) * outer, w: i % 5 === 0 ? 1.5 : 1 };
  });
  const wedge = 'M238 33.1A150 150 0 0 1 277.9 66.6L199.8 119.5A55 55 0 0 0 190.5 115.4Z';
  return (
    <svg className="sp-gauge" viewBox="0 0 326 326" aria-hidden="true">
      <defs>
        <linearGradient id="gaugeArc" gradientUnits="userSpaceOnUse" x1="7" y1="136" x2="312" y2="109">
          <stop offset="0" stopColor="#ff9ab7" stopOpacity=".06" /><stop offset=".08" stopColor="#ff8caf" stopOpacity=".44" />
          <stop offset=".34" stopColor="#ff6796" stopOpacity=".94" /><stop offset=".58" stopColor="#ff6796" stopOpacity="1" />
          <stop offset=".82" stopColor="#ffe7ed" stopOpacity=".74" /><stop offset=".94" stopColor="#fff8fa" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gaugeShadow" gradientUnits="userSpaceOnUse" x1="11" y1="136" x2="308" y2="110">
          <stop offset="0" stopColor="#6e1639" stopOpacity=".04" /><stop offset=".09" stopColor="#6e1639" stopOpacity=".17" />
          <stop offset=".52" stopColor="#72163d" stopOpacity=".18" /><stop offset=".78" stopColor="#7b1a43" stopOpacity=".1" />
          <stop offset="1" stopColor="#7b1a43" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="radarBeam" gradientUnits="userSpaceOnUse" cx="163" cy="163" r="145">
          <stop offset=".3" stopColor="#650f35" stopOpacity="0" /><stop offset=".45" stopColor="#650f35" stopOpacity=".025" />
          <stop offset=".7" stopColor="#650f35" stopOpacity=".065" /><stop offset=".9" stopColor="#650f35" stopOpacity=".08" />
          <stop offset="1" stopColor="#650f35" stopOpacity=".05" />
        </radialGradient>
        <linearGradient id="radarBeamEdge" gradientUnits="userSpaceOnUse" x1="238" y1="33" x2="190.5" y2="115.4">
          <stop offset="0" stopColor="#ffe7ef" stopOpacity=".19" /><stop offset=".48" stopColor="#ffd1df" stopOpacity=".11" />
          <stop offset=".82" stopColor="#ffc6d7" stopOpacity=".045" /><stop offset="1" stopColor="#ffc6d7" stopOpacity="0" />
        </linearGradient>
        <filter id="radarSoft"><feGaussianBlur stdDeviation="1.35" /></filter>
        <filter id="radarHalo"><feGaussianBlur stdDeviation="5.2" /></filter>
        <filter id="gaugeBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="11" /></filter>
      </defs>
      <path d="M11.34 136.26A154 154 0 0 1 307.71 110.33" fill="none" strokeWidth="3.2" strokeLinecap="round" stroke="url(#gaugeShadow)" />
      <path d="M6.91 135.48A158.5 158.5 0 0 1 311.94 108.79" fill="none" strokeWidth="2.2" strokeLinecap="round" stroke="url(#gaugeArc)" />
      <path d="M19.22 137.65A146 146 0 0 1 236 36.56" fill="none" strokeWidth="1.15" stroke="rgba(255,166,194,.31)" />
      <g className="sp-sweep">
        <path d={wedge} fill="#6a1238" opacity=".022" filter="url(#radarHalo)" />
        <path d={wedge} fill="url(#radarBeam)" filter="url(#radarSoft)" />
        <path d="M238 33.1L190.5 115.4" stroke="url(#radarBeamEdge)" strokeWidth="1.25" strokeLinecap="round" filter="url(#radarSoft)" />
      </g>
      <g>{ticks.map((t, i) => <line key={i} className="sp-tick" x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.w} />)}</g>
      <ellipse cx="225" cy="166" rx="92" ry="76" fill="#fff" opacity=".055" filter="url(#gaugeBlur)" />
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

/* ── card ── */
function Card({ c, index }) {
  const [open, setOpen] = useState(false);
  const panelId = `sp-stack-${c.key}`;
  const radius = c.variant === 'context' ? 2.32 : 1.55;
  return (
    <article className={`sp-card sp-card--${c.variant} ${open ? 'is-open' : ''}`} style={{ '--entrance-delay': `${0.46 + index * 0.12}s` }}>
      {c.variant === 'context' && <ContextGlow />}
      <Grain />
      <h3 className="sp-title">{c.title[0]}<br />{c.title[1]}</h3>
      {c.variant === 'speed' && <Gauge />}
      {c.variant === 'context' && <ContextWindow />}
      {c.variant === 'connections' && <ConnectionsMap />}
      <p className={`sp-metric sp-metric--${c.variant}`}>
        <span className="sp-dot-number"><DotText text={c.dots} radius={radius} /></span>
        <span className="sp-unit">{c.unit}</span>
        <span className="sr-only">{c.dots} {c.unit}</span>
      </p>
      <p className="sp-caption">{c.caption[0]}<br />{c.caption[1]}</p>

      <div className="sp-stack" id={panelId} aria-hidden={!open} inert={!open}>
        {c.groups.map((g) => (
          <div key={g.label}>
            <span>{g.label}</span>
            <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
          </div>
        ))}
      </div>

      <button type="button" className="sp-learn-more" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'View stack'}
      </button>
    </article>
  );
}

export default function StackPerf({ cards }) {
  const ref = useRef(null);
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
  }, []);

  return (
    <section className="sp-stage sp-pending" id="stack" ref={ref} aria-labelledby="sp-headline">
      <div className="sp-bg" aria-hidden="true" />
      <FilterDefs />
      <header className="sp-masthead">
        <div>
          <div className="section-label"><span>04</span>Stack</div>
          <h2 className="sp-headline" id="sp-headline">
            <span className="sp-line">Built for <span className="sp-dot-word" aria-label="Production"><DotText text="Production" pitchX={4} radius={1.8} /></span></span>
            <span className="sp-line">Across the Stack</span>
          </h2>
        </div>
        <p className="sp-intro">
          Every layer is engineered for production — models and RAG pipelines,<br className="sp-break" /> multi-tenant databases with Row-Level Security, and interfaces<br className="sp-break" /> in English and Arabic, shipped with CI/CD.
        </p>
      </header>
      <div className="sp-cards" aria-label="Stack capabilities">
        {cards.map((c, i) => <Card c={c} index={i} key={c.key} />)}
      </div>
    </section>
  );
}
