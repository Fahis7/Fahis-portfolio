import React, { useEffect, useRef } from 'react';
import { DotWord } from './DotText.jsx';
import { FilterDefs, GlassCard, useGlassEntrance } from './GlassCard.jsx';
import Toolkit from './Toolkit.jsx';

/*
  Stack section: "Built for Production / Across the Stack".
  Three rigid glass cards designed at 429×554 and scaled as a unit:
  every size inside a card is a multiple of --u (1u = 1px at 429px wide),
  so the internal layout never changes - only how many cards share a row.
*/

export default function StackPerf({ cards, toolkit }) {
  const ref = useRef(null);
  useGlassEntrance(ref);
  // the background drift and the card loops pause while the section is off screen (CSS: .sp-stage[data-off])
  useEffect(() => {
    const el = ref.current;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-off', !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section sp-stage sp-pending" id="stack" ref={ref} aria-labelledby="sp-headline">
      <div className="sp-bg" aria-hidden="true" />
      <FilterDefs />
      <div className="sp-screen">
        <header className="sp-masthead">
          <div>
            <div className="section-label"><span>03</span>Stack</div>
            <h2 className="sp-headline" id="sp-headline">
              <span className="sp-line">Built for <DotWord text="Production" /></span>
              <span className="sp-line">Across the Stack</span>
            </h2>
          </div>
          <p className="sp-intro">
            Every layer is engineered for production: models and RAG pipelines,<br className="sp-break" /> multi-tenant databases with Row-Level Security, and interfaces<br className="sp-break" /> in English and Arabic, shipped with CI/CD.
          </p>
        </header>
        <div className="sp-cards" aria-label="Stack capabilities">
          {cards.map((c, i) => (
            <GlassCard key={c.key} id={`sp-stack-${c.key}`} variant={c.variant} title={c.title} dots={c.dots} unit={c.unit} caption={c.caption} index={i} reveal={{ groups: c.groups }} revealOnHover />
          ))}
        </div>
      </div>

      <Toolkit toolkit={toolkit} />
    </section>
  );
}
