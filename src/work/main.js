// work.html: the full-screen showreel. The engine lives in ribbon.js.
import '@fontsource-variable/inter-tight/wght.css';
import './work.css';
import { projects } from '../data.js';
import { mountRibbon, cardsFromProjects } from './ribbon.js';

const params = new URLSearchParams(location.search);
const debug = params.has('debug') ? { noRefl: params.get('refl') === '0', noCaption: params.get('caption') === '0' } : null;

/* ── theme: the homepage's system (same key, same pre-paint script in work.html) ── */
const THEME_KEY = 'fahis-theme';
const THEME_COLOR = { light: '#ececeb', dark: '#000000' };
const root = document.documentElement;
const themeNow = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
const readSaved = () => {
  try { const t = localStorage.getItem(THEME_KEY); return t === 'light' || t === 'dark' ? t : null; } catch { return null; }
};
const ICON = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>',
};
const button = document.getElementById('theme');
const paintButton = (t) => {
  const dark = t === 'dark';
  button.innerHTML = dark ? ICON.sun : ICON.moon; // icon only; the aria-label names the action
  button.setAttribute('aria-pressed', String(dark));
  button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
};

const reel = mountRibbon(document.getElementById('stage'), {
  mode: 'free',
  theme: themeNow(),
  cards: cardsFromProjects(projects, import.meta.env.BASE_URL),
  list: document.getElementById('list'),
  debug,
  onReady: () => document.body.classList.add('ready'),
});

// Instant switch: page colours via CSS variables, the ribbon via setTheme (no reload, no texture rebuild).
function applyTheme(t) {
  root.setAttribute('data-theme', t);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[t]);
  reel.setTheme(t);
  paintButton(t);
}
paintButton(themeNow());
button.addEventListener('click', () => {
  const next = themeNow() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked: choice lasts for this page only */ }
  applyTheme(next);
});
// No saved choice: follow live OS changes. A choice made on the homepage in another tab carries over too.
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { if (!readSaved()) applyTheme(e.matches ? 'dark' : 'light'); });
addEventListener('storage', (e) => { if (e.key === THEME_KEY && (e.newValue === 'light' || e.newValue === 'dark')) applyTheme(e.newValue); });

addEventListener('pagehide', () => reel.destroy());
addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

// Test hook, only with ?debug in the URL. ?debug&refl=0 skips the reflection pass;
// ?debug&caption=0 leaves the caption text out (for contrast measurements).
if (debug) window.__reel = reel.state;
