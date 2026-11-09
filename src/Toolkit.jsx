import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { DotText } from './DotText.jsx';
import { Grain } from './GlassCard.jsx';

/*
  Full toolkit: one dark terminal-style panel (artwork, the same in both themes).
  Every group's tabpanel is always in the DOM (inactive ones are `hidden`), so every tool is in the page.
  This file renders the panel (the shell shows monograms); ToolkitPanel.jsx, a lazy chunk loaded when the
  section is within one viewport, adds the tab behaviour and the simple-icons logos.
*/

export const groupKey = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const monogram = (name) => name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);

// Brand logos are filled simple-icons paths ({ path }); generic tools use line icons ({ line: [d, ...] }).
function Logo({ name, icons }) {
  const icon = icons?.[name];
  if (icon?.path) return <svg className="tk-logo" viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} /></svg>;
  if (icon?.line) {
    return (
      <svg className="tk-logo tk-logo--line" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {icon.line.map((d) => <path key={d} d={d} />)}
      </svg>
    );
  }
  return <span className="tk-mono" aria-hidden="true">{monogram(name)}</span>;
}

export function ToolkitView({ toolkit, active = 0, onSelect, onKeyDown, tabRefs, icons = null, termRef, trailRef }) {
  const groups = toolkit.filter((g) => !g.wide);
  const domains = toolkit.find((g) => g.wide);
  const total = toolkit.reduce((n, g) => n + g.items.length, 0);
  return (
    <div className="tk-term" ref={termRef}>
      <Grain />
      <div className="tk-trail" ref={trailRef} aria-hidden="true" />
      <div className="tk-bar">
        <span className="tk-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="tk-path">~/fahis/toolkit</span>
        <span className="tk-total" role="img" aria-label={`${total} tools`}>
          <span className="tk-led" aria-hidden="true"><DotText text={String(total)} pitchX={4} radius={1.8} /></span>
          <span aria-hidden="true">tools</span>
        </span>
      </div>
      <div className="tk-body">
        <div className="tk-tabs" role="tablist" aria-orientation="vertical" aria-label="Toolkit groups" onKeyDown={onKeyDown}>
          {groups.map((g, i) => {
            const k = groupKey(g.label);
            return (
              <button
                key={k} type="button" role="tab" id={`tk-tab-${k}`} className="tk-tab"
                aria-selected={i === active} aria-controls={`tk-panel-${k}`} tabIndex={i === active ? 0 : -1}
                onClick={() => onSelect?.(i)} ref={tabRefs ? (el) => (tabRefs.current[i] = el) : undefined}
              >
                <span>{g.label}</span><span className="tk-n">{g.items.length}</span>
              </button>
            );
          })}
        </div>
        <div className="tk-panels">
          {groups.map((g, i) => {
            const k = groupKey(g.label);
            return (
              <div key={k} role="tabpanel" id={`tk-panel-${k}`} aria-labelledby={`tk-tab-${k}`} className="tk-panel" hidden={i !== active}>
                <p className="tk-path-line">toolkit.{k} → {g.items.length} items</p>
                <ul className="tk-tiles">
                  {g.items.map((it, j) => <li key={it} className="tk-tile" style={{ '--i': j }}><Logo name={it} icons={icons} /><span>{it}</span></li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      {domains && (
        <div className="tk-domains">
          <span className="tk-dlabel">{domains.label}</span>
          <ul>{domains.items.map((it) => <li key={it}>{it}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

const Panel = lazy(() => import('./ToolkitPanel.jsx'));

// Shell until the section is within one viewport; then the lazy panel (tabs + logos) takes over.
export default function Toolkit({ toolkit }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '100% 0px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const shell = <ToolkitView toolkit={toolkit} />;
  return (
    <div className="toolkit rise" ref={ref}>
      {near ? <Suspense fallback={shell}><Panel toolkit={toolkit} /></Suspense> : shell}
    </div>
  );
}
