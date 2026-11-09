import React, { useEffect, useRef, useState } from 'react';
import { Labels, BASE } from './Showreel.jsx';

/* ───────────── phones and reduced motion: native swipe row ───────────── */

export default function Row({ projects }) {
  const row = useRef(null);
  const [count, setCount] = useState(1);
  const [near, setNear] = useState(false);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const nearIo = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setNear(true); nearIo.disconnect(); } }, { rootMargin: '100% 0px' });
    nearIo.observe(row.current);
    return () => nearIo.disconnect();
  }, []);

  useEffect(() => {
    const cards = [...row.current.querySelectorAll('.reel-card')];
    // which card is most visible -> counter; videos play only while >= 60% visible
    const ratios = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        ratios.set(e.target, e.intersectionRatio);
        const v = e.target.querySelector('video');
        if (v) {
          if (e.intersectionRatio >= 0.6) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); }
          else if (!v.paused) v.pause();
        }
      }
      let best = 0, bestR = -1;
      cards.forEach((c, i) => { const r = ratios.get(c) || 0; if (r > bestR) { bestR = r; best = i; } });
      setCount(best + 1);
    }, { root: row.current, threshold: [0, 0.25, 0.6, 0.9, 1] });
    cards.forEach((c) => io.observe(c));
    const pageIo = new IntersectionObserver((es) => {
      // leaving the screen pauses everything
      if (!es[0].isIntersecting) row.current?.querySelectorAll('video').forEach((v) => !v.paused && v.pause());
    });
    pageIo.observe(row.current);
    const onHide = () => { if (document.hidden) row.current?.querySelectorAll('video').forEach((v) => !v.paused && v.pause()); };
    document.addEventListener('visibilitychange', onHide);
    return () => { io.disconnect(); pageIo.disconnect(); document.removeEventListener('visibilitychange', onHide); };
  }, [near]); // re-observe once the videos exist, so an already-visible card starts playing

  return (
    <section id="showreel" className={`reel reel--row${near ? ' is-near' : ''}`} aria-labelledby="showreel-title">
      <Labels count={count} total={projects.length} hint="Swipe" />
      <ul className="reel-row" ref={row}>
        {projects.map((p) => (
          <li key={p.id} className="reel-card" style={{ '--a': p.reel.aspect }}>
            <a href={p.demo || p.github} target="_blank" rel="noreferrer" aria-label={p.demo ? `${p.title}: ${p.tagline}` : `${p.title} (code on GitHub): ${p.tagline}`}>
              {!reduced && p.reel.video && near
                ? <video muted playsInline loop preload="none" poster={BASE + p.reel.poster} data-src={BASE + p.reel.video} aria-hidden="true" />
                : <img src={near ? BASE + p.reel.poster : undefined} alt="" loading="lazy" decoding="async" />}
              <span className="reel-cap" aria-hidden="true">{p.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

