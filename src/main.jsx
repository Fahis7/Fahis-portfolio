import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/newsreader/latin-400-italic.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles.css';
import './stack.css';
import './portrait.css';

import Belt from './Belt.jsx';
import StackPerf from './StackPerf.jsx';
import MiniSite from './MiniSites.jsx';
import Portrait from './Portrait.jsx';
import { profile, projects, stackCards, marquee, experience } from './data.js';

const BASE = import.meta.env.BASE_URL;
const MAILTO = `mailto:${profile.email}`;
const featured = projects[0];
const others = projects.slice(1);
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ───────────── hooks ───────────── */

// Viktor-style fade-in-up: every .rise element animates once when it scrolls into view (staggered by --d).
function useRiseOnScroll() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rise').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ───────────── small parts ───────────── */

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
);

const Mark = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor" />
    <path d="M8 22V10l5 7 5-7v12M22 22V10h4" fill="none" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function Button({ href, children, variant = 'primary', external, className = '', ...rest }) {
  return (
    <a href={href} className={`btn btn-${variant} ${className}`} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} {...rest}>
      {children}
    </a>
  );
}

/* ── theme (the initial value is set by the inline script in index.html) ── */
const THEME_KEY = 'fahis-theme';
const THEME_COLOR = { light: '#eef0f2', dark: '#0b0d10' };
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');
const readSaved = () => {
  try { const t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : null; } catch { return null; }
};
const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

let switchTimer;
function applyTheme(theme) {
  const root = document.documentElement;
  if (root.getAttribute('data-theme') === theme) return;
  root.classList.add('theme-switching');
  root.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  clearTimeout(switchTimer);
  switchTimer = setTimeout(() => root.classList.remove('theme-switching'), 350);
}

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  // No saved choice → follow live OS changes.
  useEffect(() => {
    const mq = darkQuery();
    const onChange = (e) => {
      if (readSaved()) return;
      const next = e.matches ? 'dark' : 'light';
      applyTheme(next); setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark = theme === 'dark';
  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    applyTheme(next); setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked: choice lasts for this page only */ }
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

const shortUrl = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Case-study preview: links to the live site, or to GitHub when `demo` is null.
const previewLink = (p) => (p.demo
  ? { href: p.demo, label: shortUrl(p.demo), aria: `Open ${p.title} live` }
  : { href: p.github, label: 'Code on GitHub', aria: `View ${p.title} code on GitHub` });

function Preview({ p, className = '', d, rise = true }) {
  const l = previewLink(p);
  return (
    <a className={`preview ${className} ${rise ? 'rise' : ''}`} style={d ? { '--d': d } : undefined} href={l.href} target="_blank" rel="noreferrer" aria-label={l.aria}>
      <Shot p={p} />
      <span className="preview-url">{l.label} <Arrow size={12} /></span>
    </a>
  );
}

// More builds: on touch screens the chip sits under the preview (see .preview-caption).
function ProjectPreview({ p }) {
  const l = previewLink(p);
  return (
    <div className="preview-wrap rise" style={{ '--d': '.15s' }}>
      <Preview p={p} rise={false} />
      <a className="preview-caption" href={l.href} target="_blank" rel="noreferrer">{l.label} <Arrow size={12} /></a>
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = MAILTO; }
  };
  return <button type="button" className="copy" onClick={copy} aria-live="polite">{copied ? 'Copied ✓' : 'Copy email'}</button>;
}

// Shows a real screenshot when `image` is set in data.js, otherwise the drawn mini-site.
const Shot = ({ p }) => (p.image
  ? <img className="shot" src={BASE + p.image} alt={`Screenshot of ${p.title}`} loading="lazy" decoding="async" />
  : <MiniSite site={p.site} />);

/* ───────────── sections ───────────── */

function Stage() {
  return (
    <section className="stage" id="top" aria-label="Introduction">
      <header className="nav">
        <a href="#top" className="logo" aria-label={`${profile.name}, home`}><Mark /><span>Fahis</span></a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#work">Work</a><a href="#about">About</a><a href="#stack">Stack</a><a href="#experience">Experience</a><a href={`${BASE}work.html`}>Showreel</a>
        </nav>
        <div className="nav-right">
          <ThemeToggle />
          <a href={profile.socials[1].href} target="_blank" rel="noreferrer" className="nav-plain">GitHub</a>
          <a href={profile.socials[0].href} target="_blank" rel="noreferrer" className="pill pill-ghost">LinkedIn</a>
          <a href="#contact" className="pill pill-hot">Let’s talk</a>
        </div>
      </header>

      <div className="hero">
        <div className="hero-left">
          <Portrait
            photo={import.meta.env.BASE_URL + 'me/fahis-bw.webp'}
            cutout={import.meta.env.BASE_URL + 'me/fahis-cutout.webp'}
            alt="Mohammed Fahis" />
          <div>
            <p className="eyebrow">Mohammed Fahis · AI Engineer · Dubai</p>
            <h1 className="hero-title">Built for people.<br /><em>Engineered underneath.</em></h1>
          </div>
        </div>
        <div className="hero-side">
          <p>I design and ship AI-powered products end-to-end (compliance platforms, property SaaS, recruiting tools) and the secure, multi-tenant systems running underneath them.</p>
          <div className="hero-ctas">
            <a href="#work" className="pill pill-hot pill-lg">Explore the work</a>
            {featured.demo && <a href={featured.demo} target="_blank" rel="noreferrer" className="hero-link">Live: {shortUrl(featured.demo)} <Arrow size={12} /></a>}
          </div>
        </div>
      </div>

      <Belt projects={projects} />
      <p className="belt-hint" aria-hidden="true">Drag to scrub · click a card for its case study</p>
    </section>
  );
}

function Marquee() {
  const items = [...marquee, ...marquee];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((m, i) => <span key={i} className={i % 2 ? 'serif' : ''}>{m}<i>✦</i></span>)}
      </div>
    </div>
  );
}

function Featured() {
  const p = featured;
  return (
    <section className="featured wrap" id="work">
      <div className="section-label rise"><span>01</span>Featured work</div>
      <div className="featured-head" id={`work-${p.id}`}>
        <div className="rise" style={{ '--d': '.1s' }}>
          <p className="kicker">{p.kicker} · NEW</p>
          <h2 className="big">{p.title}<br /><em>{p.tagline}.</em></h2>
        </div>
        <div className="featured-intro rise" style={{ '--d': '.2s' }}>
          <p>{p.desc}</p>
          <div className="btn-row">
            {p.demo && <Button href={p.demo} external>Visit {shortUrl(p.demo)} <Arrow /></Button>}
            <Button href={p.github} variant="secondary" external>GitHub</Button>
          </div>
        </div>
      </div>

      <Preview p={p} className="preview-xl" d=".3s" />

      <div className="metrics rise" style={{ '--d': '.1s' }}>
        {p.metrics.map((m) => <div key={m.label}><strong>{m.value}</strong><span>{m.label}</span></div>)}
        <div><strong>Real PG</strong><span>integration tests in CI</span></div>
      </div>

      <h3 className="sub rise">What it does</h3>
      <ol className="features">
        {p.features.map((f, i) => (
          <li key={f.t} className="rise" style={{ '--d': `${(i % 2) * 0.08}s` }}>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <div><h4>{f.t}</h4><p>{f.d}</p></div>
          </li>
        ))}
      </ol>

      <div className="two-col">
        <div className="panel panel-dark rise">
          <p className="kicker">SECURITY</p>
          <h3>Locked down by <em>default.</em></h3>
          <ul className="ticks">{p.security.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
        <div className="panel rise" style={{ '--d': '.1s' }}>
          <p className="kicker">TESTING</p>
          <h3>Tested like it <em>matters.</em></h3>
          <ul className="ticks">{p.testing.map((s) => <li key={s}>{s}</li>)}</ul>
        </div>
      </div>

      <ul className="chips rise" aria-label="AxisKYC tech stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
    </section>
  );
}

function Project({ p, i }) {
  return (
    <article className={`project ${i % 2 ? 'flip' : ''}`} id={`work-${p.id}`}>
      <div className="project-text rise">
        <p className="kicker"><span className="mono">{p.num}</span> {p.kicker}{!p.demo && <span className="kicker-status"> · DEMO OFFLINE</span>}</p>
        <h3 className="serif-title">{p.title}</h3>
        <p className="lede">{p.tagline}</p>
        <p>{p.desc}</p>
        <ul className="ticks">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
        <ul className="chips small">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="btn-row">
          {p.demo && <Button href={p.demo} external>Open live <Arrow /></Button>}
          <Button href={p.github} variant="secondary" external>GitHub</Button>
        </div>
      </div>
      <ProjectPreview p={p} />
    </article>
  );
}

function MoreWork() {
  return (
    <section className="more wrap">
      <div className="more-head">
        <div className="section-label rise"><span>02</span>More builds</div>
        <h2 className="big rise" style={{ '--d': '.1s' }}>Four more <em>builds.</em></h2>
        <a className="hero-link showreel-link rise" style={{ '--d': '.2s' }} href={`${BASE}work.html`}>Enter the showreel <Arrow size={12} /></a>
      </div>
      <div className="projects">{others.map((p, i) => <Project key={p.id} p={p} i={i} />)}</div>
    </section>
  );
}

function About() {
  return (
    <section className="about" id="about">
      <div className="narrow">
        <div className="section-label center rise"><span>03</span>About</div>
        <p className="about-name rise" style={{ '--d': '.1s' }}>Mohammed Fahis</p>
        <p className="mono-tag rise" style={{ '--d': '.15s' }}>AI engineer & full-stack developer, Dubai</p>
        <h2 className="big rise" style={{ '--d': '.2s' }}>Build the system <em>underneath,</em><br />ship the <em>interface</em> on top.</h2>
        <div className="about-copy rise" style={{ '--d': '.3s' }}>
          <p>My work lives where product engineering meets applied AI: authentication, data architecture, model orchestration, deployment, and the last 10% that makes a product feel finished.</p>
          <p>My newest build is <strong>AxisKYC</strong>, a multi-tenant KYC/AML platform with database-level tenant isolation, sanctions screening and a fully bilingual Arabic/English interface. Before it, I shipped property, recruiting, commerce and business-services products end-to-end.</p>
          <p>Open to full-time roles and freelance builds: Dubai on-site, hybrid or remote.</p>
        </div>
        <div className="btn-row center rise" style={{ '--d': '.4s' }}>
          <Button href={MAILTO}>Start a chat</Button>
          <Button href="#work" variant="secondary">View projects</Button>
        </div>
      </div>
      <blockquote className="quote narrow">
        <svg className="rise" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 7H6a3 3 0 0 0-3 3v4h4v4l3-4v-7Zm11 0h-4a3 3 0 0 0-3 3v4h4v4l3-4v-7Z" /></svg>
        <p className="rise" style={{ '--d': '.1s' }}>I like being close to the whole product, from the <em>database role</em> to the last pixel.</p>
        <footer className="rise" style={{ '--d': '.2s' }}>Mohammed Fahis</footer>
      </blockquote>
    </section>
  );
}

function Experience() {
  return (
    <section className="experience wrap" id="experience">
      <div className="section-label rise"><span>05</span>Experience</div>
      <h2 className="big rise" style={{ '--d': '.1s' }}>From first commit to <em>full ownership.</em></h2>
      <ol className="timeline">
        {experience.map((x, i) => (
          <li key={x.title} className="rise" style={{ '--d': `${0.15 + i * 0.08}s` }}>
            <span className="mono">{x.time}</span>
            <div>
              <h3>{x.title}</h3>
              {x.company && <p className="company">{x.company}</p>}
              <p>{x.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WorkTogether() {
  return (
    <section className="together wrap">
      <div className="together-head">
        <div className="section-label rise"><span>06</span>Work together</div>
        <h2 className="big rise" style={{ '--d': '.1s' }}>Two ways to <em>work together.</em></h2>
      </div>
      <div className="together-grid">
        <div className="offer offer-dark rise" style={{ '--d': '.1s' }}>
          <h3>Full-time role</h3>
          <p>Join your team as an AI / full-stack engineer.<br />Dubai on-site, hybrid or remote.</p>
          <div className="offer-big">Available now<span>Dubai · Hybrid · Remote</span></div>
          <div className="btn-row">
            <Button href={MAILTO} variant="light">Start a chat</Button>
            <Button href={profile.socials[0].href} variant="ghost-dark" external>LinkedIn</Button>
          </div>
        </div>
        <div className="offer rise" style={{ '--d': '.2s' }}>
          <h3>Project build</h3>
          <p>Fixed scope, end to end.<br />Architecture, build, deploy, hand-over.</p>
          <div className="offer-big">Idea → production<span>SaaS · AI · compliance</span></div>
          <div className="btn-row"><Button href={MAILTO} variant="tertiary">Start a chat</Button></div>
        </div>
      </div>
    </section>
  );
}

function Partner() {
  const boxRef = useRef(null);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || reducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;
    let lastSpawn = 0, n = 0;
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastSpawn < 80) return;
      lastSpawn = now;
      const r = box.getBoundingClientRect();
      const p = projects[n++ % projects.length];
      const tile = document.createElement('div');
      tile.className = `trail trail-${p.site}`;
      tile.innerHTML = `<span>${p.num}</span><b>${p.title}</b>`;
      tile.style.left = `${e.clientX - r.left}px`;
      tile.style.top = `${e.clientY - r.top}px`;
      tile.style.setProperty('--rot', `${Math.random() * 20 - 10}deg`);
      box.appendChild(tile);
      setTimeout(() => tile.remove(), 1000);
    };
    box.addEventListener('mousemove', onMove);
    return () => box.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <section className="partner-wrap" id="contact">
      <div className="partner" ref={boxRef}>
        <p className="kicker rise">07 · CONTACT</p>
        <h2 className="partner-title rise" style={{ '--d': '.1s' }}>Let’s build <em>something.</em></h2>
        <p className="partner-sub rise" style={{ '--d': '.2s' }}>Roles, products, AI architecture, compliance tech: send me a message.</p>
        <a href={MAILTO} className="btn btn-primary btn-avatar rise" style={{ '--d': '.3s' }}>
          <span className="avatar" aria-hidden="true">MF</span>Start a chat with Fahis
        </a>
        <div className="partner-email rise" style={{ '--d': '.4s' }}>
          <span>{profile.email}</span><CopyEmail />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <>
      <footer className="footer wrap">
        <Button href={MAILTO}>Start a chat</Button>
        <div className="footer-cols">
          <Arrow size={20} />
          <div><a href="#work">Work</a><a href="#about">About</a><a href="#stack">Stack</a><a href="#experience">Experience</a></div>
          <div>{profile.socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>)}</div>
        </div>
      </footer>
      <div className="copyright wrap"><span>© {new Date().getFullYear()} {profile.name}</span><span>{profile.location}</span></div>
    </>
  );
}

function BottomNav() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 260;
      setShow(window.scrollY > window.innerHeight * 0.7 && !nearEnd);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className={`bottom-nav ${show ? 'show' : ''}`} aria-hidden={!show}>
      <a href="#top" className="bn-mark" tabIndex={show ? 0 : -1} aria-label="Back to top">F</a>
      <a href={MAILTO} className="btn btn-primary btn-sm" tabIndex={show ? 0 : -1}>Start a chat</a>
    </div>
  );
}

function App() {
  useRiseOnScroll();
  return (
    <>
      <a className="skip-link" href="#work">Skip to work</a>
      <main>
        <Stage />
        <Marquee />
        <Featured />
        <MoreWork />
        <About />
        <StackPerf cards={stackCards} />
        <Experience />
        <WorkTogether />
        <Partner />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
