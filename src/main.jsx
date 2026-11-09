import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts
import '@fontsource/inter/latin-300.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles.css';
import './stack.css';
import './portrait.css';

import Belt from './Belt.jsx';
import StackPerf from './StackPerf.jsx';
import MiniSite from './MiniSites.jsx';
import Portrait from './Portrait.jsx';
import Showreel from './Showreel.jsx';
import Quotes from './Quotes.jsx';
import { DotText, DotWord, DotTitle } from './DotText.jsx';
import { GlassCard, GlassBadge, useGlassEntrance } from './GlassCard.jsx';
import { profile, projects, stackCards, toolkit, marquee, experience, credentials, quotes, offers, realShot } from './data.js';

const BASE = import.meta.env.BASE_URL;
const MAILTO = `mailto:${profile.email}`;
const CV_URL = BASE + profile.resume;
const CV_FILE = 'Mohammed_Fahis_CV.pdf';
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
const THEME_COLOR = { light: '#ececeb', dark: '#0b0d10' };
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

/* ── preview videos: one plays at a time, page-wide ──
   Desktop: load + play on hover / keyboard focus. Touch: autoplay while >= 60% visible.
   Off with reduced motion or Save-Data (the still poster stays). Paused when the tab is hidden. */
let playingPreview = null;
const videoAllowed = () => !reducedMotion() && !navigator.connection?.saveData;
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.hidden && playingPreview) playingPreview.stop(); });
}

function usePreviewVideo(link, video, enabled) {
  useEffect(() => {
    const a = link.current, v = video.current;
    if (!enabled || !a || !v) return;
    if (!videoAllowed()) { a.classList.add('no-video'); return; } // keep the still; hide the cue
    let active = false, hideTimer = 0;
    const show = () => { if (active) { v.classList.add('is-on'); a.classList.add('is-playing'); } };
    const ctrl = {
      start() {
        clearTimeout(hideTimer);
        active = true;
        if (!v.getAttribute('src')) { v.src = v.dataset.src; v.load(); }
        // fade in on the first real frame (no black flash)
        if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(show);
        else v.addEventListener('playing', show, { once: true });
        v.play().catch(() => {});
      },
      stop() {
        active = false;
        if (playingPreview === ctrl) playingPreview = null;
        v.classList.remove('is-on'); a.classList.remove('is-playing');
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => { if (!active) { v.pause(); try { v.currentTime = 0; } catch { /* not loaded yet */ } } }, 300);
      },
    };
    const play = () => { if (playingPreview && playingPreview !== ctrl) playingPreview.stop(); playingPreview = ctrl; ctrl.start(); };
    const stop = () => { if (active) ctrl.stop(); };

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      a.addEventListener('pointerenter', play); a.addEventListener('pointerleave', stop);
      a.addEventListener('focus', play); a.addEventListener('blur', stop);
      return () => {
        stop(); clearTimeout(hideTimer);
        a.removeEventListener('pointerenter', play); a.removeEventListener('pointerleave', stop);
        a.removeEventListener('focus', play); a.removeEventListener('blur', stop);
      };
    }
    const io = new IntersectionObserver(([e]) => (e.intersectionRatio >= 0.6 ? play() : stop()), { threshold: [0, 0.6] });
    io.observe(a);
    return () => { io.disconnect(); stop(); clearTimeout(hideTimer); };
  }, [enabled]);
}

function Preview({ p, className = '', d, rise = true }) {
  const l = previewLink(p);
  const link = useRef(null), video = useRef(null);
  const shot = realShot(p), hasVideo = Boolean(shot && p.reel.video);
  usePreviewVideo(link, video, hasVideo);
  return (
    <a ref={link} className={`preview ${className} ${rise ? 'rise' : ''}`} style={d ? { '--d': d } : undefined} href={l.href} target="_blank" rel="noreferrer" aria-label={l.aria}>
      <Shot p={p} />
      {hasVideo && <>
        <video ref={video} className="shot-video" muted playsInline loop preload="none" poster={shot} data-src={BASE + p.reel.video} aria-hidden="true" tabIndex={-1} />
        <span className="preview-cue" aria-hidden="true">▶ Live preview</span>
      </>}
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

// Real screenshot for live projects (realShot in data.js), otherwise the drawn mini-site.
const Shot = ({ p }) => (realShot(p)
  ? <img className="shot" src={realShot(p)} alt={`Screenshot of ${p.title}`} width={1600} height={Math.round(1600 / p.reel.aspect)} loading="lazy" decoding="async" />
  : <MiniSite site={p.site} />);

/* ── CV: a full-screen in-page viewer showing the CV rendered as an image (public/cv, npm run cv:render).
   Every "View CV" is a real link to the PDF (works without JS); with JS it opens the viewer.
   Opening sets #cv (Back closes it); loading the page with #cv opens it. ── */
const CV_IMG_1X = `${BASE}cv/cv-page-1@1x.webp`, CV_IMG_2X = `${BASE}cv/cv-page-1.webp`;
let openCvViewer = null;

function CvLink({ className, children = 'View CV' }) {
  const onClick = (e) => {
    if (!openCvViewer) return;
    e.preventDefault();
    openCvViewer(e.currentTarget);
  };
  return <a href={CV_URL} target="_blank" rel="noreferrer" className={className} onClick={onClick}>{children}</a>;
}
const CvDownload = ({ className, children = 'Download CV ↓', ...rest }) => <a href={CV_URL} download={CV_FILE} className={className} {...rest}>{children}</a>;

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);

function CvViewer() {
  const dialog = useRef(null), closeBtn = useRef(null), opener = useRef(null);
  const pushed = useRef(false), fromHistory = useRef(false);
  const [shown, setShown] = useState(false); // fetch the image only on first open
  useEffect(() => {
    const d = dialog.current, root = document.documentElement;
    const open = (from, viaHash = false) => {
      if (d.open) return;
      opener.current = from || null;
      setShown(true);
      d.showModal();
      root.classList.add('cv-lock'); // lock page scroll behind the viewer
      closeBtn.current?.focus();
      if (!viaHash && location.hash !== '#cv') { history.pushState(null, '', '#cv'); pushed.current = true; }
    };
    openCvViewer = open;
    const onClose = () => {
      root.classList.remove('cv-lock');
      if (!fromHistory.current) {
        if (pushed.current) history.back(); // undo our #cv entry
        else if (location.hash === '#cv') history.replaceState(null, '', location.pathname + location.search);
      }
      pushed.current = false; fromHistory.current = false;
      opener.current?.focus?.();
    };
    // Back button (or any hash change away from #cv) closes it; arriving at #cv opens it
    const onHash = () => {
      if (location.hash === '#cv') open(null, true);
      else if (d.open) { fromHistory.current = true; d.close(); }
    };
    d.addEventListener('close', onClose);
    window.addEventListener('popstate', onHash);
    window.addEventListener('hashchange', onHash);
    if (location.hash === '#cv') open(null, true);
    return () => {
      openCvViewer = null;
      d.removeEventListener('close', onClose);
      window.removeEventListener('popstate', onHash);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);
  const close = () => dialog.current.close();
  // backdrop click: anywhere that isn't the bar or the sheet
  const onClick = (e) => { if (e.target === e.currentTarget || e.target.classList.contains('cv-stage')) close(); };
  return (
    <dialog ref={dialog} className="cv-viewer" aria-labelledby="cv-title" onClick={onClick}>
      <div className="cv-bar">
        <p id="cv-title">Mohammed Fahis · CV</p>
        <div className="cv-actions">
          <CvDownload className="pill pill-ghost cv-btn" aria-label="Download PDF"><DownloadIcon /><span className="cv-label">Download PDF</span></CvDownload>
          <a className="pill pill-ghost cv-btn" href={CV_URL} target="_blank" rel="noreferrer" aria-label="Open PDF in a new tab"><Arrow size={13} /><span className="cv-label">Open PDF</span></a>
          <button type="button" className="cv-close" ref={closeBtn} onClick={close} aria-label="Close CV">×</button>
        </div>
      </div>
      <div className="cv-stage">
        {shown && <img className="cv-sheet" src={CV_IMG_1X} srcSet={`${CV_IMG_1X} 1x, ${CV_IMG_2X} 2x`} width="827" height="1170" alt="CV of Mohammed Fahis, one page" decoding="async" />}
        <a className="sr-only" href={CV_URL}>Read the CV as a PDF</a>
      </div>
    </dialog>
  );
}

/* ───────────── sections ───────────── */

/* Fixed top nav: transparent at the very top, a glass bar once scrolled (.is-scrolled, one passive rAF-throttled
   listener). The link of the section in view is marked aria-current and a crimson underline slides to it. */
const NAV_LINKS = [['work', 'Work'], ['about', 'About'], ['stack', 'Stack'], ['experience', 'Experience'], ['showreel', 'Showreel']];

function TopNav() {
  const bar = useRef(null), links = useRef({}), ink = useRef(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let raf = 0;
    const update = () => { raf = 0; bar.current.classList.toggle('is-scrolled', window.scrollY >= 8); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, []);

  // the section crossing a line ~45% down the viewport is the active one; none in the hero or contact
  useEffect(() => {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      const hit = NAV_LINKS.find(([id]) => seen.get(id));
      setActive(hit ? hit[0] : null);
    }, { rootMargin: '-45% 0px -54% 0px' });
    NAV_LINKS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // slide the underline under the active link (and re-measure on resize)
  useEffect(() => {
    const place = () => {
      const a = active && links.current[active], el = ink.current;
      if (!el) return;
      if (!a) { el.style.opacity = '0'; return; }
      el.style.opacity = '1';
      el.style.transform = `translateX(${a.offsetLeft}px)`;
      el.style.width = `${a.offsetWidth}px`;
    };
    place();
    window.addEventListener('resize', place, { passive: true });
    return () => window.removeEventListener('resize', place);
  }, [active]);

  return (
    <header className="nav" ref={bar}>
      <a href="#top" className="logo" aria-label={`${profile.name}, home`}><Mark /><span>Fahis</span></a>
      <nav className="nav-links" aria-label="Primary">
        {NAV_LINKS.map(([id, label]) => (
          <a key={id} href={`#${id}`} ref={(el) => (links.current[id] = el)} aria-current={active === id ? 'true' : undefined}>{label}</a>
        ))}
        <span className="nav-ink" ref={ink} aria-hidden="true" />
      </nav>
      <div className="nav-right">
        <ThemeToggle />
        <CvLink className="nav-plain">CV</CvLink>
        <a href={profile.socials[1].href} target="_blank" rel="noreferrer" className="nav-plain">GitHub</a>
        <a href={profile.socials[0].href} target="_blank" rel="noreferrer" className="pill pill-ghost">LinkedIn</a>
        <a href="#contact" className="pill pill-hot">Let’s talk</a>
      </div>
    </header>
  );
}

function Stage() {
  return (
    <section className="stage" id="top" aria-label="Introduction">
      <TopNav />

      <div className="hero">
        <div className="hero-left">
          <Portrait
            photo={import.meta.env.BASE_URL + 'me/fahis-bw.webp'}
            cutout={import.meta.env.BASE_URL + 'me/fahis-cutout.webp'}
            alt="Mohammed Fahis" />
          <div>
            <p className="eyebrow"><span className="eyebrow-name">Mohammed Fahis · </span>AI Engineer · Dubai</p>
            <h1 className="hero-title t-head" aria-label="One engineer. Everything underneath.">One engineer.<br />Everything <DotWord text="underneath." /></h1>
          </div>
        </div>
        <div className="hero-side">
          <p className="t-copy">I'm Fahis, an AI and full-stack engineer in Dubai. I was the sole engineer behind AxisKYC, a live compliance platform that has screened 1,000+ profiles for UAE firms, and I like owning products like that from start to finish.</p>
          <div className="hero-ctas">
            <a href="#work" className="pill pill-hot pill-lg">Explore the work</a>
            <CvLink className="pill pill-ghost pill-lg hero-cv">View CV</CvLink>
            <CvDownload className="hero-link hero-dl">Download ↓</CvDownload>
          </div>
        </div>
      </div>

      <Belt projects={projects} />
      <p className="belt-hint" aria-hidden="true">Drag to scrub · click a card for its case study</p>
    </section>
  );
}

// Scrolling strip of mono labels with ✦ separators (decorative: aria-hidden; give screen readers a list next to it).
// Short lists are repeated so one half of the track always outruns wide screens; speed (s per pass of `items`) stays the same.
function Marquee({ items, direction = 'left', speed = 40, className = '' }) {
  const reps = Math.ceil(20 / items.length);
  const half = Array.from({ length: reps }, () => items).flat();
  return (
    <div className={`marquee ${className}`} aria-hidden="true" style={{ '--marquee-speed': `${speed * reps}s` }}>
      <div className={`marquee-track${direction === 'right' ? ' is-reverse' : ''}`}>
        {[...half, ...half].map((m, i) => <span key={i} className="marquee-item"><span className="marquee-text">{m}</span><i>✦</i></span>)}
      </div>
    </div>
  );
}

/* Full case study for any project with `caseStudy` in data.js: metrics strip, features grid,
   one or two panels (e.g. Security / Testing, or Engineering) and the stack marquee. */
function CaseStudy({ p }) {
  const { features, panels } = p.caseStudy;
  return (
    <>
      <div className="metrics rise" style={{ '--d': '.1s', '--n': p.metrics.length }}>
        {p.metrics.map((m) => <div key={m.label}><strong>{m.value}</strong><span>{m.label}</span></div>)}
      </div>

      <h3 className="sub t-sub rise">What it does</h3>
      <ol className="features">
        {features.map((f, i) => (
          <li key={f.t} className="rise" style={{ '--d': `${(i % 2) * 0.08}s` }}>
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
            <div><h4 className="t-sub">{f.t}</h4><p className="t-copy">{f.d}</p></div>
          </li>
        ))}
      </ol>

      <div className={`two-col${panels.length === 1 ? ' two-col--single' : ''}`}>
        {panels.map((pn, i) => (
          <div key={pn.kicker} className={`panel${pn.dark ? ' panel-dark' : ''} rise`} style={i ? { '--d': `${i * 0.1}s` } : undefined}>
            <p className="kicker">{pn.kicker}</p>
            <h3 className="t-sub">{pn.title}</h3>
            <ul className="ticks">{pn.items.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        ))}
      </div>

      <ul className="sr-only" aria-label={`${p.title} tech stack`}>{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
      <Marquee items={p.stack} direction="right" speed={50} className="marquee--bleed rise" />
    </>
  );
}

// Height-animated disclosure. Closed = `hidden` (still in the DOM); 0.5 s height animation, instant with reduced motion.
function Collapse({ id, open, label, children }) {
  const ref = useRef(null), mounted = useRef(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!mounted.current) { mounted.current = true; return; }
    const instant = reducedMotion();
    const finish = (fn) => {
      const end = (e) => { if (e && e.target !== el) return; el.removeEventListener('transitionend', end); fn(); };
      el.addEventListener('transitionend', end);
      return end;
    };
    if (open) {
      el.hidden = false;
      if (!instant) {
        const h = el.scrollHeight;
        el.style.height = '0px';
        void el.offsetHeight;
        el.style.height = `${h}px`;
        finish(() => { el.style.height = ''; });
      }
      // bring the top of the case study into view if it opened below the fold
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.8) window.scrollBy({ top: top - window.innerHeight * 0.35, behavior: instant ? 'auto' : 'smooth' });
    } else if (instant) {
      el.hidden = true;
    } else {
      el.style.height = `${el.scrollHeight}px`;
      void el.offsetHeight;
      el.style.height = '0px';
      finish(() => { el.hidden = true; el.style.height = ''; });
    }
  }, [open]);
  return <div id={id} ref={ref} className="case" role="region" aria-label={label} hidden>{children}</div>;
}

function Project({ p, i, after }) {
  return (
    <article className={`project ${i % 2 ? 'flip' : ''}`} id={`work-${p.id}`}>
      <div className="project-text rise">
        <p className="kicker">
          <span className="mono">{p.num}</span> {p.kicker}
          {!p.demo && <span className="kicker-status"> · DEMO OFFLINE</span>}
          {p.badge && <span className="kicker-tag">{p.badge}</span>}
        </p>
        <DotTitle text={p.title} />
        <p className="lede">{p.tagline}</p>
        <p>{p.desc}</p>
        <ul className="ticks">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
        <ul className="chips small">{p.stack.slice(0, 6).map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="btn-row">
          {p.demo && <Button href={p.demo} external>Open live <Arrow /></Button>}
          <Button href={p.github} variant="secondary" external>GitHub</Button>
        </div>
        {after}
      </div>
      <ProjectPreview p={p} />
    </article>
  );
}

// A project entry with its full case study folded underneath (AxisKYC).
function ProjectWithCase({ p, i }) {
  const [open, setOpen] = useState(false);
  const id = `case-${p.id}`;
  const toggle = (
    <button type="button" className="case-toggle" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
      {open ? 'Close case study ↑' : 'Read the full case study ↓'}
    </button>
  );
  return (
    <div className="project-group">
      <Project p={p} i={i} after={toggle} />
      <Collapse id={id} open={open} label={`${p.title} case study`}><CaseStudy p={p} /></Collapse>
    </div>
  );
}

function Work() {
  return (
    <section className="section more" id="work">
      <div className="more-head">
        <div className="section-label rise"><span>01</span>Work</div>
        <h2 className="big t-head rise" style={{ '--d': '.1s' }}>Six builds, five <DotWord text="live." /></h2>
        <a className="hero-link showreel-link rise" style={{ '--d': '.2s' }} href={`${BASE}work.html`}>Open the full showreel <Arrow size={12} /></a>
      </div>
      <div className="projects">
        {projects.map((p, i) => (p.caseStudy ? <ProjectWithCase key={p.id} p={p} i={i} /> : <Project key={p.id} p={p} i={i} />))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section about" id="about">
      <div className="section-label rise"><span>02</span>About</div>
      <div className="about-grid">
        <h2 className="big t-head rise" style={{ '--d': '.1s' }}>Build the system underneath,<br />ship the <DotWord text="interface" /> on top.</h2>
        <div className="about-body">
          <div className="about-copy t-copy rise" style={{ '--d': '.2s' }}>
            <p>My work lives where product engineering meets applied AI: authentication, data architecture, model orchestration, deployment, and the last 10% that makes a product feel finished.</p>
            <p>My newest build is <strong>AxisKYC</strong>, a multi-tenant KYC/AML platform with database-level tenant isolation, sanctions screening and a fully bilingual Arabic/English interface. Before it, I shipped property, recruiting, commerce and business-services products end-to-end.</p>
            <p>Open to full-time roles and freelance builds: Dubai on-site, hybrid or remote.</p>
          </div>
          <div className="btn-row rise" style={{ '--d': '.3s' }}>
            <Button href={MAILTO}>Start a chat</Button>
            <Button href="#work" variant="secondary">View projects</Button>
          </div>
        </div>
      </div>
      <Quotes quotes={quotes} />
    </section>
  );
}

// Line icons for the credential cards (inline SVG, currentColor).
const CRED_ICONS = {
  cap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 9.5 12 4.5 2 9.5l10 5 10-5Z" /><path d="M6 11.5v5c3.5 2.4 8.5 2.4 12 0v-5" /><path d="M22 9.5v5" />
    </svg>
  ),
  spark: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M12 3c.7 4.6 3.4 7.3 8 8-4.6.7-7.3 3.4-8 8-.7-4.6-3.4-7.3-8-8 4.6-.7 7.3-3.4 8-8Z" />
    </svg>
  ),
};

// Experience: the Stack masthead pattern, then the roles as glass cards (flip on hover for the details, like
// Stack) and the credentials as compact glass badges. The cards are artwork: the same in both themes.
function XpBack({ x }) {
  return (
    <>
      <p className="xp-b-company">{x.company}</p>
      <p className="xp-b-desc">{x.desc}</p>
      {x.tech && <ul className="xp-b-chips" aria-label="Tech">{x.tech.map((t) => <li key={t}>{t}</li>)}</ul>}
      {x.link && <a className="sp-stack-link" href={x.link}>View project ↘</a>}
    </>
  );
}

function Experience() {
  const glass = useRef(null);
  useGlassEntrance(glass);
  return (
    <section className="section section--fill experience" id="experience">
      <header className="sp-masthead xp-masthead rise">
        <div>
          <div className="section-label"><span>04</span>Experience</div>
          <h2 className="big t-head">From first commit to full <DotWord text="ownership." /></h2>
        </div>
        <p className="xp-intro t-copy">Four roles, from backend internship to sole engineer of a live compliance SaaS.</p>
      </header>
      <div className="xp-glass sp-pending" ref={glass}>
        <div className="xpg-row">
          {experience.map((x, i) => (
            <GlassCard
              key={x.title} id={`xp-role-${i}`} index={i} revealOnHover
              variant={x.card.variant} title={x.card.title} dots={x.card.dots} unit={x.card.unit} caption={x.card.caption}
              corner={x.current && <span className="sp-now" role="img" aria-label="Current role"><DotText text="NOW" pitchX={4} radius={1.8} /></span>}
              reveal={{ openLabel: 'View role', title: [x.title], content: <XpBack x={x} /> }}
            />
          ))}
        </div>
        <p className="xpg-swipe" aria-hidden="true">Swipe →</p>
        <div className="xpg-creds">
          {credentials.map((c, i) => (
            <GlassBadge
              key={c.key} index={experience.length + i} variant="graphite" glow={c.accent}
              icon={CRED_ICONS[c.icon]} title={c.title} sub={c.sub} dots={c.dots} unit={c.unit}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkTogether() {
  const grid = useRef(null);
  useGlassEntrance(grid);
  return (
    <section className="section section--fill together">
      <div className="together-head">
        <div className="section-label rise"><span>05</span>Work together</div>
        <h2 className="big t-head rise" style={{ '--d': '.1s' }}>Two ways to work <DotWord text="together." /></h2>
      </div>
      <div className="together-grid sp-pending" ref={grid}>
        {offers.map((o, i) => (
          <GlassCard
            key={o.key} id={`offer-${o.key}`} variant={o.variant} title={o.title} dots={o.dots} unit={o.unit} caption={o.caption} index={i}
            actions={<a className="sp-learn-more" href={MAILTO}>Start a chat</a>}
            reveal={{
              openLabel: 'Details',
              groups: [{ label: o.reveal.label, items: o.reveal.items }],
              footer: (o.reveal.cv || o.reveal.linkedin) && (
                <div className="sp-stack-links">
                  {o.reveal.cv && <CvDownload className="sp-stack-link" />}
                  {o.reveal.linkedin && <a className="sp-stack-link" href={profile.socials[0].href} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
                </div>
              ),
            }}
          />
        ))}
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
      const shot = realShot(p);
      tile.className = shot ? 'trail trail-shot' : `trail trail-${p.site}`;
      if (shot) tile.style.backgroundImage = `url("${shot}")`;
      const cap = shot ? tile.appendChild(document.createElement('div')) : tile;
      if (shot) cap.className = 'trail-cap';
      cap.append(Object.assign(document.createElement('span'), { textContent: p.num }), Object.assign(document.createElement('b'), { textContent: p.title }));
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
    <section className="section section--fill partner" id="contact" ref={boxRef}>
      <p className="kicker rise">06 · CONTACT</p>
      <h2 className="partner-title rise" style={{ '--d': '.1s' }} aria-label="Let’s build something.">Let’s build <span className="nowrap"><DotWord text="something" />.</span></h2>
      <p className="partner-sub rise" style={{ '--d': '.2s' }}>Roles, products, AI architecture, compliance tech: send me a message.</p>
      <a href={MAILTO} className="btn btn-primary btn-avatar rise" style={{ '--d': '.3s' }}>
        <span className="avatar" aria-hidden="true">MF</span>Start a chat with Fahis
      </a>
      <div className="partner-email rise" style={{ '--d': '.4s' }}>
        <span>{profile.email}</span><CopyEmail />
      </div>
      <p className="partner-cv rise" style={{ '--d': '.45s' }}><CvLink /> <span aria-hidden="true">·</span> <CvDownload>Download CV</CvDownload></p>
    </section>
  );
}

/* Cursor light: a soft orange spotlight that follows the pointer, plus a local highlight on the card under it.
   Fine pointers only, off with reduced motion. One passive, rAF-throttled pointermove listener writes CSS variables. */
const LIGHT_CARDS = '.preview, .sp-card, .panel, .tk-tile';
const LIGHT_STRONG = '.reel, .panel-dark, .tk-term';
function CursorLight() {
  const ref = useRef(null);
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!fine.matches || reducedMotion()) return;
    const root = document.documentElement, light = ref.current;
    root.classList.add('has-light');
    let x = 0, y = 0, target = null, raf = 0;
    const frame = () => {
      raf = 0;
      light.style.setProperty('--mx', `${x}px`);
      light.style.setProperty('--my', `${y}px`);
      const strong = root.getAttribute('data-theme') === 'dark' || !!target?.closest?.(LIGHT_STRONG);
      light.classList.toggle('is-strong', strong);
      light.classList.add('is-on');
      const card = target?.closest?.(LIGHT_CARDS);
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--lx', `${x - r.left}px`);
        card.style.setProperty('--ly', `${y - r.top}px`);
      }
    };
    const move = (e) => { x = e.clientX; y = e.clientY; target = e.target; if (!raf) raf = requestAnimationFrame(frame); };
    const out = () => light.classList.remove('is-on');
    window.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', out, { passive: true });
    window.addEventListener('blur', out);
    return () => {
      cancelAnimationFrame(raf); root.classList.remove('has-light');
      window.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', out); window.removeEventListener('blur', out);
    };
  }, []);
  return <div className="cursor-light" ref={ref} aria-hidden="true" />;
}

function Footer() {
  return (
    <>
      <footer className="section footer">
        <Button href={MAILTO}>Start a chat</Button>
        <div className="footer-cols">
          <Arrow size={20} />
          <div><a href="#work">Work</a><a href="#about">About</a><a href="#stack">Stack</a><a href="#experience">Experience</a><CvLink>CV</CvLink></div>
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
        <Marquee items={marquee} />
        <Work />
        <Showreel projects={projects} />
        <About />
        <StackPerf cards={stackCards} toolkit={toolkit} />
        <Experience />
        <WorkTogether />
        <Partner />
      </main>
      <Footer />
      <BottomNav />
      <CvViewer />
      <CursorLight />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
