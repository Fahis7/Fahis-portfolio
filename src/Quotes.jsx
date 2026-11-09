import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/*
  About quote carousel. One quote at a time; all slides share one grid cell, so the
  box is always as tall as the longest quote and the page below never jumps.
  The progress bar's CSS animation (5 s) drives auto-advance: when it ends, the next
  slide shows. Pausing the bar (hover, keyboard focus inside, hidden tab) pauses the carousel.
  Reduced motion: no auto-advance and a crossfade instead of the slide. Styles in styles.css.
*/

const pad2 = (n) => String(n).padStart(2, '0');
const SLIDE_MS = 800;

// '*word*' → crimson accent
const Accent = ({ text }) => text.split('*').map((t, i) => (i % 2 ? <em key={i}>{t}</em> : t));

const ArrowIcon = ({ dir }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir < 0 ? <path d="M19 12H5M11 18l-6-6 6-6" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
  </svg>
);

export default function Quotes({ quotes }) {
  const n = quotes.length;
  const [cur, setCur] = useState(0);
  const [live, setLive] = useState('off');
  const root = useRef(null), bar = useRef(null), slides = useRef([]);
  const from = useRef(0), dir = useRef(1), timer = useRef(0);
  const paused = useRef({ hover: false, focus: false, hidden: false });
  const reduced = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const go = (delta, user) => {
    setLive(user ? 'polite' : 'off');
    dir.current = delta;
    setCur((c) => (c + delta + n) % n);
  };

  const setPaused = (key, v) => {
    paused.current[key] = v;
    const p = paused.current;
    root.current?.classList.toggle('is-paused', p.hover || p.focus || p.hidden);
  };

  const restartBar = () => {
    const el = bar.current;
    if (!el || reduced.current) return;
    el.classList.remove('is-running');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('is-running');
  };

  // Animate from the previous slide to the current one (runs before paint).
  useLayoutEffect(() => {
    const a = slides.current[from.current], b = slides.current[cur];
    if (a === b) { restartBar(); return; }
    clearTimeout(timer.current);
    slides.current.forEach((el, i) => { if (i !== from.current && i !== cur) el.style.cssText = ''; });
    if (reduced.current) {
      // crossfade: the outgoing slide stays visible while it fades out
      a.style.cssText = 'visibility: visible; opacity: 0; transform: none;';
      b.style.cssText = 'transform: none;';
    } else {
      const d = dir.current;
      b.style.transition = 'none';
      b.style.transform = `translateX(${d * 100}%)`;
      void b.offsetWidth;
      b.style.transition = '';
      b.style.transform = 'translateX(0)';
      a.style.cssText = `visibility: visible; opacity: 0.35; transform: translateX(${-d * 100}%);`;
    }
    timer.current = setTimeout(() => { a.style.cssText = ''; }, SLIDE_MS + 50);
    from.current = cur;
    restartBar();
  }, [cur]);

  useEffect(() => {
    const el = root.current;
    if (reduced.current) el.classList.add('is-static');

    const onVis = () => setPaused('hidden', document.hidden);
    const enter = (e) => e.pointerType === 'mouse' && setPaused('hover', true);
    const leave = (e) => e.pointerType === 'mouse' && setPaused('hover', false);
    const focusIn = (e) => setPaused('focus', e.target.matches(':focus-visible'));
    const focusOut = (e) => { if (!el.contains(e.relatedTarget)) setPaused('focus', false); };
    document.addEventListener('visibilitychange', onVis);
    el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
    el.addEventListener('focusin', focusIn); el.addEventListener('focusout', focusOut);
    onVis();
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener('visibilitychange', onVis);
      el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave);
      el.removeEventListener('focusin', focusIn); el.removeEventListener('focusout', focusOut);
    };
  }, []);

  // Touch / pen swipe on the quote; a tap (or a mostly vertical move) changes nothing.
  const start = useRef(null);
  const onDown = (e) => { if (e.pointerType !== 'mouse') start.current = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    const s = start.current; start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1, true);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1, true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1, true); }
  };

  return (
    <section ref={root} className="quote quotes rise" aria-roledescription="carousel" aria-label="Quotes from Mohammed Fahis" tabIndex={0} onKeyDown={onKey}>
      <p className="quotes-label">How I work</p>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 7H6a3 3 0 0 0-3 3v4h4v4l3-4v-7Zm11 0h-4a3 3 0 0 0-3 3v4h4v4l3-4v-7Z" /></svg>
      <div className="quotes-viewport" aria-live={live} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (start.current = null)}>
        {quotes.map((q, i) => (
          <figure key={i} ref={(el) => (slides.current[i] = el)} className={`quote-slide${i === cur ? ' is-current' : ''}`}
            role="group" aria-roledescription="slide" aria-label={`Quote ${i + 1} of ${n}`} aria-hidden={i !== cur}>
            <blockquote><p><Accent text={q.text} /></p></blockquote>
            <figcaption className="sr-only">{q.author}</figcaption>
          </figure>
        ))}
      </div>
      <div className="quotes-controls">
        <span className="quotes-count" aria-hidden="true">{pad2(cur + 1)} / {pad2(n)}</span>
        <span className="quotes-bar" aria-hidden="true"><i ref={bar} onAnimationEnd={() => go(1, false)} /></span>
        <div className="quotes-nav">
          <button type="button" className="quotes-btn" aria-label="Previous quote" onClick={() => go(-1, true)}><ArrowIcon dir={-1} /></button>
          <button type="button" className="quotes-btn" aria-label="Next quote" onClick={() => go(1, true)}><ArrowIcon dir={1} /></button>
        </div>
      </div>
    </section>
  );
}
