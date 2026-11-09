import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { DotText, DotWord, DotTitle, GLYPHS } from './DotText.jsx';
import { GlassCard, Grain, useGlassEntrance, useTilt } from './GlassCard.jsx';
import { initScrollFx, onScrollFrame, motionOK } from './scrollfx.js';
import { profile, projects, heroStats, stackCards, toolkit, marquee, experience, credentials, quotes, offers, realShot } from './data.js';

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
    <div className="preview-wrap">
      <Preview p={p} rise={false} />
      <span className="scanfx" aria-hidden="true" />
      <a className="preview-caption" href={l.href} target="_blank" rel="noreferrer">{l.label} <Arrow size={12} /></a>
    </div>
  );
}

function CopyEmail({ label = 'Copy email', className = 'copy' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = MAILTO; }
  };
  return <button type="button" className={className} onClick={copy} aria-live="polite">{copied ? 'Copied ✓' : label}</button>;
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

/* ── hero line 2: a typing tagline whose plain words AND LED word change ──
   hold → the LED word un-prints right → left, the plain words delete → type the next plain words → the LED word
   prints left → right (each new column glows orange) → the full stop. Starts after the preloader and the hero
   entrance; pauses while the hero is off screen, the tab is hidden or the pointer is on the headline.
   Reduced motion: the static "Everything underneath." (the h1's aria-label carries the text either way). */
const TAGLINES = [
  ['Everything', 'underneath'], ['Zero', 'handoffs'], ['Idea to', 'production'],
  ['Secure by', 'default'], ['AI that', 'ships'], ['Built to', 'last'],
];
// LED word as dots tagged with their column, plus the x where each column ends (for a growing viewBox)
function ledColumns(word) {
  const dots = [], colEnd = []; let x = 0;
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) { x += 12; continue; }
    for (let c = 0; c < g[0].length; c++) {
      const col = colEnd.length;
      g.forEach((row, y) => { if (row[c] === '1') dots.push([x + c * 4 + 1.55, y * 4 + 1.55, col]); });
      colEnd.push(x + c * 4 + 4);
    }
    x += (g[0].length + 1) * 4;
  }
  return { dots, colEnd, width: x };
}
function LedWord({ led, cols }) {
  if (!cols) return null;
  const w = cols >= led.colEnd.length ? led.width : led.colEnd[cols - 1];
  return (
    <span className="dot-word hl2-led">
      <svg viewBox={`0 0 ${w} 28`} fill="currentColor" aria-hidden="true">
        {led.dots.filter((d) => d[2] < cols).map(([cx, cy, col]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.8" data-c={col} />)}
      </svg>
    </span>
  );
}

function HeroTagline() {
  const leds = useMemo(() => TAGLINES.map(([, w]) => ledColumns(w)), []);
  const reduced = useMemo(() => reducedMotion(), []);
  const [st, setSt] = useState({ i: 0, plain: TAGLINES[0][0], cols: leds[0].colEnd.length, stop: true, caret: 'led', busy: false, live: false, print: false });
  const [box, setBox] = useState({ minW: 0, wrap: false });
  const root = useRef(null), measure = useRef(null);

  // min-width from the widest full line; wrap the LED word onto its own line if that doesn't fit (phones)
  useEffect(() => {
    const m = measure.current, el = root.current;
    if (!m || !el) return undefined;
    const fit = () => {
      const w = (sel) => Math.max(...[...m.querySelectorAll(sel)].map((n) => n.getBoundingClientRect().width));
      // space for line 2: the h1's own width (a block in a fixed-fraction column, so independent of our min-width)
      const avail = el.closest('h1')?.clientWidth || Infinity;
      const line = w('.hl2-m-line');
      const wrap = line > avail + 1;
      setBox({ wrap, minW: Math.ceil(wrap ? Math.max(w('.hl2-m-plain'), w('.hl2-m-led')) : line) });
    };
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit, { passive: true });
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;
    let alive = true, offscreen = false, hover = false;
    const paused = () => document.hidden || offscreen || hover;
    // waits that only count down while not paused, so everything resumes where it left off
    const sleep = (ms) => new Promise((res) => {
      let left = ms, last = performance.now();
      const step = () => {
        if (!alive) return;
        const now = performance.now();
        if (!paused()) left -= now - last;
        last = now;
        if (left <= 0) res(); else setTimeout(step, Math.min(left, 40));
      };
      setTimeout(step, Math.min(ms, 40));
    });
    const h1 = root.current.closest('h1');
    const io = new IntersectionObserver(([e]) => { offscreen = !e.isIntersecting; });
    io.observe(h1);
    const enter = () => { hover = true; }, leave = () => { hover = false; };
    h1.addEventListener('pointerenter', enter); h1.addEventListener('pointerleave', leave);
    const set = (patch) => alive && setSt((s) => ({ ...s, ...patch }));

    (async () => {
      // after the preloader (if any) and the hero entrance
      while (alive && document.documentElement.classList.contains('is-preloading')) await sleep(100);
      await Promise.all((h1.getAnimations?.() || []).map((a) => a.finished.catch(() => {})));
      let i = 0;
      set({ live: true });
      while (alive) {
        set({ busy: false, caret: 'led' });
        await sleep(i === 0 ? 3500 : 2600);
        set({ busy: true, stop: false, print: false });
        for (let c = leds[i].colEnd.length; c >= 0 && alive; c--) { set({ cols: c }); await sleep(18); }
        set({ caret: 'plain' });
        for (let k = TAGLINES[i][0].length; k >= 0 && alive; k--) { set({ plain: TAGLINES[i][0].slice(0, k) }); await sleep(28); }
        await sleep(250);
        i = (i + 1) % TAGLINES.length;
        set({ i });
        const word = TAGLINES[i][0];
        for (let k = 1; k <= word.length && alive; k++) { set({ plain: word.slice(0, k) }); await sleep(55 + (Math.random() * 30 - 15)); }
        set({ caret: 'led', print: true }); // only dots printed from now on get the orange glow
        for (let c = 1; c <= leds[i].colEnd.length && alive; c++) { set({ cols: c }); await sleep(30); }
        set({ stop: true });
      }
    })();
    return () => {
      alive = false; io.disconnect();
      h1.removeEventListener('pointerenter', enter); h1.removeEventListener('pointerleave', leave);
    };
  }, [reduced, leds]);

  const caret = <span className={`hl2-caret${st.busy ? '' : ' is-blink'}`} />;
  const showCaret = !reduced && st.live;
  return (
    <span ref={root} className={`hl2${box.wrap ? ' hl2--wrap' : ''}${st.print ? ' is-printing' : ''}`} style={box.minW ? { minWidth: box.minW } : undefined} aria-hidden="true">
      <span className="hl2-plain">{st.plain}{showCaret && st.caret === 'plain' && caret}</span>
      {!box.wrap && ' '}
      <span className="hl2-ledpart">
        <LedWord led={leds[st.i]} cols={st.cols} />
        {st.stop && '.'}
        {showCaret && st.caret === 'led' && caret}
      </span>
      {/* hidden copies of every full line, measured for the min-width */}
      <span className="hl2-measure" ref={measure}>
        {TAGLINES.map(([plain], k) => (
          <span key={plain} className="hl2-m-line">
            <span className="hl2-m-plain">{plain}</span>{' '}
            <span className="hl2-m-led"><LedWord led={leds[k]} cols={leds[k].colEnd.length} />.</span>
          </span>
        ))}
      </span>
    </span>
  );
}

/* hero proof strip: LED numbers that count up once, after the preloader / hero entrance (instant with reduced motion) */
const fmtStat = (n, suffix = '') => `${Math.round(n).toLocaleString('en-US')}${suffix}`;
function HeroProof() {
  const ref = useRef(null);
  const [t, setT] = useState(() => (reducedMotion() ? 1 : 0)); // 0..1 progress of the count
  useEffect(() => {
    if (reducedMotion()) return undefined;
    let alive = true, raf = 0;
    (async () => {
      while (alive && document.documentElement.classList.contains('is-preloading')) await new Promise((r) => setTimeout(r, 100));
      await Promise.all((ref.current?.getAnimations?.() || []).map((a) => a.finished.catch(() => {})));
      const start = performance.now(), dur = 1100;
      const step = (now) => {
        if (!alive) return;
        const k = Math.min(1, (now - start) / dur);
        setT(1 - (1 - k) ** 3); // ease out
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    })();
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, []);
  return (
    <ul className="hero-proof" ref={ref}>
      {heroStats.map((st) => (
        <li key={st.label}>
          <span className="hero-proof-num" aria-hidden="true"><DotText text={fmtStat(st.value * t, t >= 1 ? st.suffix : '')} pitchX={4} radius={1.8} /></span>
          <span className="hero-proof-label">{st.label}</span>
          <span className="sr-only">{fmtStat(st.value, st.suffix)} {st.label}</span>
        </li>
      ))}
    </ul>
  );
}

function Stage() {
  return (
    <section className="stage" id="top" aria-label="Introduction">
      <TopNav />

      <div className="hero">
        <div className="hero-main">
          <p className="eyebrow"><span className="eyebrow-name">Mohammed Fahis · </span>AI Engineer · Dubai</p>
          <h1 className="hero-title t-head" aria-label="One engineer. Everything underneath.">One engineer.<br /><HeroTagline /></h1>
          <p className="hero-intro t-copy">I'm Fahis, an AI and full-stack engineer in Dubai. I was the sole engineer behind AxisKYC, a live compliance platform that has screened 1,000+ profiles for UAE firms, and I like owning products like that from start to finish.</p>
          <div className="hero-ctas">
            <a href="#work" className="pill pill-hot pill-lg">Explore the work</a>
            <CvLink className="pill pill-ghost pill-lg hero-cv">View CV</CvLink>
            <CvDownload className="hero-link hero-dl">Download ↓</CvDownload>
          </div>
        </div>
        <div className="hero-aside">
          <Portrait
            photo={import.meta.env.BASE_URL + 'me/fahis-bw.webp'}
            cutout={import.meta.env.BASE_URL + 'me/fahis-cutout.webp'}
            alt="Mohammed Fahis" />
          <p className="hero-status"><span className="ft-pulse" aria-hidden="true" />Available now · Dubai <DubaiClock /> GST</p>
        </div>
        <HeroProof />
      </div>

      {/* desktop: an invisible full-stage layer (the belt keeps its 45% geometry); phones: the belt follows the hero */}
      <div className="belt-zone">
        <Belt projects={projects} />
        <p className="belt-hint" aria-hidden="true">Drag to scrub · click a card for its case study</p>
      </div>
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
      <div className="project-text">
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

// One Experience card: the reveal (.rise) sits on the <li> and the tilt on the inner card, because the
// reveal animation's fill would otherwise lock the card's transform and opacity. Active state is a data
// attribute (React never rewrites the classes the tilt hook adds).
function XpCard({ idx, active, cardRef, className = '', delay, year, children }) {
  const card = useRef(null);
  useTilt(card);
  return (
    <li className="xp-item rise" style={{ '--d': delay }}>
      <article className={`xp-card ${className}`} data-active={active} data-idx={idx} ref={(el) => { card.current = el; cardRef(el); }}>
        <span className="xp-glare" aria-hidden="true" />
        <span className="xp-year-m" aria-hidden="true"><DotText text={year} pitchX={4} radius={1.8} /></span>
        {children}
      </article>
    </li>
  );
}

// Experience: a sticky left column (heading, a live LED year for the card in view, an index) and the role and
// credential cards scrolling on the right along a spine whose orange fill follows the scroll.
function Experience() {
  const items = [...experience, ...credentials];
  const list = useRef(null), cards = useRef([]);
  const [active, setActive] = useState(0);
  const [years, setYears] = useState({ cur: items[0].year, prev: null, n: 0 });

  // spine fill (passive, rAF-throttled); reduced motion: full
  useEffect(() => {
    const el = list.current;
    if (reducedMotion()) { el.style.setProperty('--xp', '1'); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--xp', Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height)).toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // the card crossing the middle of the screen is the active one
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.idx)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    cards.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  // live year: the old dots fade out while the new fade in (keyed, so each switch replays)
  useEffect(() => {
    setYears((y) => (y.cur === items[active].year ? y : { cur: items[active].year, prev: y.cur, n: y.n + 1 }));
  }, [active]);

  const goTo = (i) => cards.current[i]?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  const ref = (i) => (el) => { cards.current[i] = el; };

  return (
    <section className="section section--fill experience" id="experience">
      <div className="xp-grid">
        <div className="xp-head">
          <div className="rise">
            <div className="section-label"><span>04</span>Experience</div>
            <h2 className="big t-head">From first commit to full <DotWord text="ownership." /></h2>
            <p className="xp-intro t-copy">Four roles, from backend internship to sole engineer of a live compliance SaaS.</p>
          </div>
          <div className="xp-viewing" aria-hidden="true">
            <div className="xp-year">
              {years.prev && <span key={`p${years.n}`} className="xp-year-dots is-out"><DotText text={years.prev} pitchX={4} radius={1.8} /></span>}
              <span key={`c${years.n}`} className={`xp-year-dots${years.n ? ' is-in' : ''}`}><DotText text={years.cur} pitchX={4} radius={1.8} /></span>
            </div>
            <p className="xp-viewing-line">{items[active].short}</p>
          </div>
          <ol className="xp-index" aria-label="Experience">
            {items.map((x, i) => (
              <li key={x.name}>
                <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => goTo(i)}>
                  {i < experience.length ? `${String(i + 1).padStart(2, '0')} ${x.name}` : x.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="xp-list" ref={list}>
          <span className="xp-spine" aria-hidden="true"><i /></span>
          <ol className="xp-cards">
            {experience.map((x, i) => (
              <XpCard key={x.title} idx={i} active={i === active} cardRef={ref(i)} delay={`${i * 0.08}s`} year={x.year}>
                <div className="xp-top">
                  <span className="xp-date">{x.time}</span>
                  {x.current && <span className="xp-now"><DotText text="NOW" pitchX={4} radius={1.8} /><span className="sr-only">Current role</span></span>}
                </div>
                <h3 className="xp-title">{x.title}</h3>
                {x.company && <p className="xp-company">{x.company}</p>}
                <p className="xp-desc t-copy">{x.desc}</p>
                {x.tech && <ul className="chips small" aria-label="Tech">{x.tech.map((t) => <li key={t}>{t}</li>)}</ul>}
                {x.link && <a className="xp-link" href={x.link}>View project ↘</a>}
              </XpCard>
            ))}
          </ol>
          <ul className="xp-creds">
            {credentials.map((c, j) => {
              const i = experience.length + j;
              return (
                <XpCard key={c.key} idx={i} active={i === active} cardRef={ref(i)} delay={`${i * 0.08}s`} year={c.year} className={`xp-cred${c.accent ? ' xp-cred--accent' : ''}`}>
                  <div className="xp-top">
                    <span className="xp-icon" aria-hidden="true">{CRED_ICONS[c.icon]}</span>
                    <span className="xp-date">{c.date}</span>
                  </div>
                  <p className="xp-cred-label">{c.label}</p>
                  <h3 className="xp-cred-title">{c.title}</h3>
                  <p className="xp-cred-sub">{c.sub}</p>
                </XpCard>
              );
            })}
          </ul>
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
const LIGHT_CARDS = '.preview, .sp-card, .panel, .tk-tile, .xp-card';
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

/* ── footer: always dark (artwork, like the toolkit panel), a glowing orange top edge like the hero scanner ── */
const BUILT = new Date(__BUILD_DATE__).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' });
const dubaiTime = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Dubai' }).format(new Date());

function DubaiClock() {
  const [t, setT] = useState(dubaiTime);
  useEffect(() => { const id = setInterval(() => setT(dubaiTime()), 30000); return () => clearInterval(id); }, []);
  return <time>{t}</time>;
}

function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'instant' : 'smooth' });
  return (
    <footer className="ft">
      <Grain />
      <div className="ft-cols">
        <div className="ft-col">
          <p className="ft-status"><span className="ft-pulse" aria-hidden="true" />Available now</p>
          <p className="ft-meta">Dubai, UAE · <DubaiClock /> GST</p>
          <a href={MAILTO} className="btn btn-light ft-cta">Start a chat</a>
        </div>
        <nav className="ft-col" aria-label="Footer">
          <p className="ft-label">Navigate</p>
          <ul className="ft-links">
            <li><a href="#work">Work</a></li><li><a href="#showreel">Showreel</a></li><li><a href="#about">About</a></li>
            <li><a href="#stack">Stack</a></li><li><a href="#experience">Experience</a></li><li><CvLink>CV</CvLink></li>
          </ul>
        </nav>
        <div className="ft-col">
          <p className="ft-label">Connect</p>
          <ul className="ft-links">
            {profile.socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label} ↗</a></li>)}
            <li className="ft-email"><a href={MAILTO}>{profile.email}</a><CopyEmail label="Copy" className="ft-copy" /></li>
          </ul>
        </div>
        <div className="ft-col">
          <p className="ft-label">Built with</p>
          <p className="ft-built">React · Three.js · GLSL · Vite</p>
          <p className="ft-meta">Last updated {BUILT}</p>
        </div>
      </div>
      <div className="ft-bar">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Designed &amp; engineered by Fahis</span>
        <button type="button" className="ft-top" onClick={toTop}>Back to top ↑</button>
      </div>
    </footer>
  );
}

/* Work progress: a small fixed indicator at the left edge while the Work section is on screen (desktop,
   motion allowed): "01 / 06", a vertical orange progress line and the project numbers (click to jump). */
function WorkProgress() {
  const root = useRef(null), bar = useRef(null), count = useRef(null), btns = useRef([]);
  const N = projects.length, pad = (v) => String(v).padStart(2, '0');
  useEffect(() => {
    if (!motionOK()) return undefined;
    const work = document.getElementById('work');
    const items = projects.map((p) => document.getElementById(`work-${p.id}`));
    let on = false, last = -1;
    return onScrollFrame(() => {
      const vh = window.innerHeight, r = work.getBoundingClientRect();
      const inView = r.top < vh * 0.5 && r.bottom > vh * 0.5;
      if (inView !== on) { on = inView; root.current.classList.toggle('is-on', on); }
      if (!on) return false;
      bar.current.style.transform = `scaleY(${Math.min(1, Math.max(0, (vh * 0.5 - r.top) / r.height)).toFixed(4)})`;
      let a = 0;
      items.forEach((el, i) => { if (el && el.getBoundingClientRect().top < vh * 0.5) a = i; });
      if (a !== last) {
        last = a;
        count.current.textContent = `${pad(a + 1)} / ${pad(N)}`;
        btns.current.forEach((b, i) => (i === a ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
      }
      return false;
    });
  }, [N]);
  const jump = (id) => document.getElementById(`work-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <nav className="wp" ref={root} aria-label="Projects">
      <span className="wp-count" ref={count}>01 / {pad(N)}</span>
      <div className="wp-rail">
        <span className="wp-line" aria-hidden="true"><i ref={bar} /></span>
        <ol>
          {projects.map((p, i) => (
            <li key={p.id}><button type="button" ref={(el) => (btns.current[i] = el)} onClick={() => jump(p.id)} aria-label={`${p.num} ${p.title}`}>{p.num}</button></li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

function BottomNav() {
  const [show, setShow] = useState(false);
  // shown after the hero, hidden whenever the footer is on screen, so it never covers it
  useEffect(() => {
    let footerInView = false;
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.7 && !footerInView);
    const ft = document.querySelector('footer.ft');
    const io = new IntersectionObserver(([e]) => { footerInView = e.isIntersecting; onScroll(); });
    if (ft) io.observe(ft);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
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
  useEffect(() => initScrollFx(), []); // shared scroll effects (after every section has rendered)
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
      <WorkProgress />
      <CvViewer />
      <CursorLight />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
