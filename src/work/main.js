// work.html: the full-screen showreel. The engine lives in ribbon.js.
import '@fontsource-variable/inter-tight/wght.css';
import './work.css';
import { projects } from '../data.js';
import { mountRibbon, cardsFromProjects } from './ribbon.js';

const params = new URLSearchParams(location.search);
const debug = params.has('debug') ? { noRefl: params.get('refl') === '0', noCaption: params.get('caption') === '0' } : null;

const reel = mountRibbon(document.getElementById('stage'), {
  mode: 'free',
  theme: 'dark',
  cards: cardsFromProjects(projects, import.meta.env.BASE_URL),
  list: document.getElementById('list'),
  debug,
  onReady: () => document.body.classList.add('ready'),
});

addEventListener('pagehide', () => reel.destroy());
addEventListener('pageshow', (e) => { if (e.persisted) location.reload(); });

// Test hook, only with ?debug in the URL. ?debug&refl=0 skips the reflection pass;
// ?debug&caption=0 leaves the caption text out (for contrast measurements).
if (debug) window.__reel = reel.state;
