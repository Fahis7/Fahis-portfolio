import React from 'react';

/*
  Mini websites drawn in HTML/CSS. Every size inside uses cqw
  (1cqw = 1% of the card width), so a card renders identically
  at any size — on the scanner belt, in the project list, anywhere.
  These are stylised sketches of each product, not screenshots.
*/

const Menu = ({ items, current }) => (
  <div className="ms-menu">
    {items.map((m) => <span key={m} className={m === current ? 'is-current' : ''}>{m}</span>)}
  </div>
);

// Deterministic pseudo-QR pattern
const qrCells = Array.from({ length: 81 }, (_, i) => {
  const r = Math.floor(i / 9), c = i % 9;
  const finder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
  if (finder) return !(r % 3 === 1 && c % 3 === 1) || (r === 1 && c === 1) || (r === 1 && c === 7) || (r === 7 && c === 1);
  return ((i * 2654435761) >>> 0) % 7 < 3;
});

function AxisKYC() {
  const rows = [
    ['PEP', 'Clear', 'ok'],
    ['Sanctions', '1 match · review', 'warn'],
    ['UAE Local List', 'Clear', 'ok'],
    ['Adverse media', 'Clear', 'ok'],
  ];
  return (
    <div className="ms ms-axis">
      <div className="ms-nav">
        <div className="ms-logo">
          <svg viewBox="0 0 40 46" aria-hidden="true"><path d="M20 2 37 9v13c0 11-7.5 18.5-17 22C10.5 40.5 3 33 3 22V9Z" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="round" /><path d="m12 23 6 6 11-12" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          AxisKYC
        </div>
        <Menu items={['SCREENING', 'CERTIFICATES', 'TRAINING']} current="SCREENING" />
        <div className="ms-lang"><b>EN</b><span>عربي</span></div>
      </div>
      <div className="ms-axis-copy">
        <span className="ms-kicker">KYC / AML COMPLIANCE</span>
        <h3>Screening, review and certificates — <em>built for the UAE.</em></h3>
        <div className="ms-axis-cert">
          <div className="ms-qr">{qrCells.map((on, i) => <i key={i} className={on ? 'on' : ''} />)}</div>
          <div><b>KYC Certificate</b><span>QR-verified · officer attested</span></div>
        </div>
      </div>
      <div className="ms-axis-panel">
        <div className="ms-panel-head"><span>Screening result</span><b>Entity</b></div>
        <div className="ms-subject">Sample Trading LLC<small>+ 3 linked directors auto-screened</small></div>
        {rows.map(([k, v, s]) => <div className="ms-row" key={k}><span>{k}</span><b className={s}>{v}</b></div>)}
        <div className="ms-risk"><span>Risk band</span><div className="ms-bands"><i /><i className="on" /><i /></div><b>MEDIUM</b></div>
        <div className="ms-actions"><span>Dismiss</span><span className="primary">Confirm match</span></div>
      </div>
    </div>
  );
}

function PropAI() {
  return (
    <div className="ms ms-prop">
      <div className="ms-nav">
        <div className="ms-logo"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 19 20 6l15 13v15H5Z" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinejoin="round" /><circle cx="20" cy="24" r="4.5" fill="currentColor" /></svg>PropAI OS</div>
        <Menu items={['PORTALS', 'MAINTENANCE', 'PRICING']} current="MAINTENANCE" />
      </div>
      <div className="ms-prop-copy">
        <span className="ms-kicker">MULTI-TENANT PROPERTY SAAS</span>
        <h3>The operating system for <em>property teams.</em></h3>
        <div className="ms-chips"><span>4 portals</span><span>8 roles</span><span>5 services</span></div>
      </div>
      <div className="ms-prop-ticket">
        <div className="ms-photo"><i /><i /><i /></div>
        <div className="ms-ticket-body">
          <span className="ms-kicker">MAINTENANCE TICKET</span>
          <b>Photo uploaded</b>
          <div className="ms-triage"><span>Vision triage</span><b>Classified &amp; routed</b></div>
        </div>
      </div>
      <div className="ms-prop-chat">
        <span className="ms-kicker">RAG CONCIERGE</span>
        <p>Answers grounded in the building’s own documents.</p>
      </div>
    </div>
  );
}

function Seek() {
  const bars = [92, 78, 64];
  return (
    <div className="ms ms-seek">
      <div className="ms-nav">
        <div className="ms-logo"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="17" cy="17" r="11" fill="none" stroke="currentColor" strokeWidth="3.4" /><path d="m25 25 10 10" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" /></svg>Seek &amp; Sync</div>
        <Menu items={['JOBS', 'CANDIDATES', 'CONTACT']} current="CANDIDATES" />
      </div>
      <div className="ms-seek-copy">
        <span className="ms-kicker">AI RECRUITING · ABU DHABI</span>
        <h3>CV intelligence &amp; <em>semantic matching.</em></h3>
        <div className="ms-upload"><span>⇪</span>Drop a CV — parsed into a structured profile</div>
      </div>
      <div className="ms-seek-list">
        <div className="ms-panel-head"><span>Matches for this role</span><b>pgvector</b></div>
        {bars.map((w, i) => (
          <div className="ms-cand" key={i}>
            <div className="ms-avatar" style={{ '--h': 180 + i * 25 }} />
            <div className="ms-cand-lines"><i style={{ width: `${60 - i * 8}%` }} /><i style={{ width: `${42 - i * 5}%` }} /></div>
            <div className="ms-match"><i style={{ width: `${w}%` }} /></div>
          </div>
        ))}
        <div className="ms-alert">● Recruiter alerted by email</div>
      </div>
    </div>
  );
}

function Horologie() {
  return (
    <div className="ms ms-horo">
      <div className="ms-nav">
        <div className="ms-logo serif">Horologie</div>
        <Menu items={['COLLECTION', 'ATELIER', 'ACCOUNT']} current="COLLECTION" />
      </div>
      <div className="ms-dial" aria-hidden="true">
        <div className="ms-dial-face"><i className="h" /><i className="m" /><i className="s" /><b /></div>
      </div>
      <div className="ms-horo-copy">
        <span className="ms-kicker">LUXURY TIMEPIECES</span>
        <h3>Crafted to last. <em>Secured to match.</em></h3>
      </div>
      <div className="ms-horo-spec">
        <div><span>Authentication</span><b>3-layer MFA</b></div>
        <div><span>Media</span><b>Cloudinary CDN</b></div>
        <div><span>Analytics</span><b>Live</b></div>
      </div>
    </div>
  );
}

function Zero() {
  return (
    <div className="ms ms-zero">
      <div className="ms-nav">
        <div className="ms-logo"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="5" /></svg>Zero</div>
        <Menu items={['SERVICES', 'ABOUT', 'CONTACT']} current="SERVICES" />
      </div>
      <div className="ms-zero-copy">
        <span className="ms-kicker">ACCOUNTING &amp; BUSINESS SERVICES</span>
        <h3>Financial services, <em>made clear.</em></h3>
        <span className="ms-btn">Get in touch →</span>
      </div>
      <div className="ms-zero-cards">
        {['Services', 'About us', 'Enquire'].map((t, i) => (
          <div key={t} className="ms-zero-card"><span>0{i + 1}</span><b>{t}</b><i>↗</i></div>
        ))}
      </div>
    </div>
  );
}

const SITES = { axiskyc: AxisKYC, propai: PropAI, seek: Seek, horologie: Horologie, zero: Zero };

export default function MiniSite({ site }) {
  const C = SITES[site] || Zero;
  return <C />;
}
