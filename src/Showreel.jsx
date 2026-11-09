import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import '@fontsource-variable/inter-tight/wght.css';
import './showreel.css';
import { computeLayout } from './work/sheet.js';

/*
  Homepage showreel band.
  Desktop: a sticky, scroll-driven WebGL ribbon. Page scroll (native, never hijacked) is
  turned into progress p (0..1) across the pinned stretch; the ribbon moves through one
  full pass of the cards. The runtime (showreelBand.js + ribbon.js + three.js) is lazy-loaded.
  Phones and reduced motion: a native scroll-snap row of poster cards, no WebGL, no pinning.
*/

export const BASE = import.meta.env.BASE_URL;
const WORK = `${BASE}work.html`;
const pad2 = (n) => String(n).padStart(2, '0');
const rowQuery = () => window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
const DEBUG = new URLSearchParams(location.search).has('debug');

export function Labels({ count, total, hint, children }) {
  return (
    <>
      <h2 id="showreel-title" className="reel-label reel-tl">Showreel</h2>
      <p className="reel-label reel-tr" aria-hidden="true">{pad2(count)} / {pad2(total)}</p>
      <p className="reel-label reel-bl" aria-hidden="true">{hint}</p>
      <a className="reel-label reel-br" href={WORK}>Open full showreel ↗</a>
      {children}
    </>
  );
}

/* ───────────── desktop: sticky WebGL band ───────────── */

function Band({ projects }) {
  const section = useRef(null), sticky = useRef(null), stage = useRef(null), list = useRef(null);
  const bar = useRef(null), hint = useRef(null);
  const [count, setCount] = useState(1);
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);

  // Pin length from the ribbon's loop length at this size (pure maths, no three.js needed).
  useEffect(() => {
    const el = sticky.current;
    const aspects = projects.map((p) => p.reel.aspect);
    const size = () => {
      const { L1 } = computeLayout(el.clientWidth, el.clientHeight, aspects);
      section.current.style.setProperty('--pin-l', `${(L1 / 1.8).toFixed(1)}px`);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    return () => ro.disconnect();
  }, [projects]);

  // Once the band is within one viewport, lazy-load its runtime (scroll -> progress, the
  // WebGL ribbon and three.js) in one go. Until then this component is only markup.
  useEffect(() => {
    let alive = true, detach = null;
    const io = new IntersectionObserver(async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      setNear(true);
      if (DEBUG) window.__band = { nearAt: performance.now() };
      const { attachBand } = await import('./showreelBand.js');
      if (DEBUG) window.__band.chunkAt = performance.now();
      if (!alive) return;
      detach = attachBand({
        section: section.current, sticky: sticky.current, stage: stage.current, list: list.current,
        bar: bar.current, hint: hint.current, projects, base: BASE, setCount, setReady, debug: DEBUG,
      });
    }, { rootMargin: '100% 0px' });
    io.observe(section.current);
    return () => { alive = false; io.disconnect(); detach?.(); };
  }, [projects]);

  return (
    <section id="showreel" ref={section} className={`reel reel--band${near ? ' is-near' : ''}${ready ? ' is-ready' : ''}`} aria-labelledby="showreel-title">
      {/* two sticky layers over the same 100svh: canvas below the dark edge gradients, labels above them */}
      <div className="reel-sticky" ref={sticky}>
        <div className="reel-stage" ref={stage} />
      </div>
      <div className="reel-ui">
        <Labels count={count} total={projects.length} hint={<span ref={hint} className="reel-hint">Scroll to play</span>}>
          <div className="reel-loader" aria-hidden="true"><i /><i /><i /></div>
          <div className="reel-progress" aria-hidden="true"><i ref={bar} /></div>
          <div className="reel-list" ref={list} />
        </Labels>
      </div>
    </section>
  );
}

const Row = lazy(() => import('./ShowreelRow.jsx'));

/* ───────────── switch between the two by viewport / motion preference ───────────── */

export default function Showreel({ projects }) {
  const [rowMode, setRowMode] = useState(() => rowQuery().matches);
  useEffect(() => {
    const q = rowQuery();
    const on = () => setRowMode(q.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  // the row is only for phones and reduced motion, so it lives in its own small chunk
  return rowMode
    ? <Suspense fallback={<section id="showreel" className="reel reel--row" aria-labelledby="showreel-title"><h2 id="showreel-title" className="reel-label reel-tl">Showreel</h2></section>}><Row projects={projects} /></Suspense>
    : <Band projects={projects} />;
}
