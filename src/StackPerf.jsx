import React, { useRef } from 'react';
import { DotText } from './DotText.jsx';
import { FilterDefs, GlassCard, useGlassEntrance } from './GlassCard.jsx';

/*
  Stack section: "Built for Production / Across the Stack".
  Three rigid glass cards designed at 429×554 and scaled as a unit:
  every size inside a card is a multiple of --u (1u = 1px at 429px wide),
  so the internal layout never changes - only how many cards share a row.
*/

export default function StackPerf({ cards, toolkit }) {
  const ref = useRef(null);
  useGlassEntrance(ref);

  return (
    <section className="section sp-stage sp-pending" id="stack" ref={ref} aria-labelledby="sp-headline">
      <div className="sp-bg" aria-hidden="true" />
      <FilterDefs />
      <div className="sp-screen">
        <header className="sp-masthead">
          <div>
            <div className="section-label"><span>03</span>Stack</div>
            <h2 className="sp-headline" id="sp-headline">
              <span className="sp-line">Built for <span className="sp-dot-word" aria-label="Production"><DotText text="Production" pitchX={4} radius={1.8} /></span></span>
              <span className="sp-line">Across the Stack</span>
            </h2>
          </div>
          <p className="sp-intro">
            Every layer is engineered for production: models and RAG pipelines,<br className="sp-break" /> multi-tenant databases with Row-Level Security, and interfaces<br className="sp-break" /> in English and Arabic, shipped with CI/CD.
          </p>
        </header>
        <div className="sp-cards" aria-label="Stack capabilities">
          {cards.map((c, i) => (
            <GlassCard key={c.key} id={`sp-stack-${c.key}`} variant={c.variant} title={c.title} dots={c.dots} unit={c.unit} caption={c.caption} index={i} reveal={{ groups: c.groups }} />
          ))}
        </div>
      </div>

      <div className="toolkit">
        <div className="toolkit-head rise">
          <span className="toolkit-label">Full toolkit</span>
          <span className="toolkit-count">{toolkit.reduce((n, g) => n + g.items.length, 0)} tools</span>
        </div>
        <div className="toolkit-grid">
          {toolkit.map((g, i) => (
            <div key={g.label} className={`tk-group rise${g.wide ? ' tk-group--wide' : ''}`} style={{ '--d': `${(i % 3) * 0.06}s` }}>
              <h3 className="tk-name">{g.label}</h3>
              <ul className="chips small">{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
