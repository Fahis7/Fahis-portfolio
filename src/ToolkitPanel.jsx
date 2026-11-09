import React, { useEffect, useRef, useState } from 'react';
import {
  siPython, siTypescript, siJavascript, siPostgresql, siAnthropic, siHuggingface, siDjango, siFastapi, siCelery, siRedis,
  siReact, siNextdotjs, siTailwindcss, siSwr, siFramer, siSupabase, siFirebase, siJsonwebtokens, siDocker, siGithubactions,
  siDigitalocean, siRailway, siVercel, siNetlify, siNginx, siGunicorn, siLetsencrypt, siCloudinary, siCloudflare, siSentry, siVitest,
} from 'simple-icons'; // CC0; only these icons end up in this chunk
import { ToolkitView } from './Toolkit.jsx';

// Lazy chunk: tab behaviour, logos and the cursor logo trail. Keys are the exact item names in data.js `toolkit`.
const BRANDS = {
  'Python': siPython, 'TypeScript': siTypescript, 'JavaScript': siJavascript,
  'Claude API (Haiku, Vision)': siAnthropic, 'Hugging Face Transformers': siHuggingface,
  'Django 5': siDjango, 'Django REST Framework': siDjango, 'FastAPI': siFastapi, 'Celery': siCelery, 'Redis queues': siRedis,
  'React 19': siReact, 'Next.js 16 (App Router)': siNextdotjs, 'Tailwind CSS': siTailwindcss, 'SWR': siSwr, 'Framer Motion': siFramer,
  'PostgreSQL (RLS, multi-tenant)': siPostgresql, 'Supabase': siSupabase, 'Redis': siRedis,
  'JWT': siJsonwebtokens, 'Firebase Auth / MFA': siFirebase,
  'Docker': siDocker, 'Docker Compose': siDocker, 'GitHub Actions CI/CD': siGithubactions, 'DigitalOcean': siDigitalocean,
  'Railway': siRailway, 'Vercel': siVercel, 'Netlify': siNetlify, 'Nginx': siNginx, 'Gunicorn': siGunicorn,
  'Certbot SSL': siLetsencrypt, 'Cloudinary': siCloudinary, 'Cloudflare R2': siCloudflare, 'Sentry': siSentry,
  'Vitest': siVitest, 'Integration tests on real PostgreSQL': siPostgresql,
};

// Generic line icons (one consistent 24px, 1.7 stroke set) for tools with no brand logo.
const L = {
  database: ['M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z', 'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  chip: ['M7 7h10v10H7Z', 'M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3'],
  chat: ['M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z'],
  layers: ['M12 3 2 8l10 5 10-5-10-5Z', 'M2 13l10 5 10-5'],
  chart: ['M4 4v16h16', 'M8 15l4-5 3 3 5-6'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'M21 21l-4.3-4.3'],
  scan: ['M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3', 'M8 10h8M8 14h5'],
  file: ['M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z', 'M14 3v5h5', 'M9 13h6M9 17h4'],
  prompt: ['M4 17l6-5-6-5', 'M12 19h8'],
  check: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M8 12l3 3 5-6'],
  braces: ['M8 3c-2 0-3 1-3 3v3c0 1.5-1 2-2 3 1 1 2 1.5 2 3v3c0 2 1 3 3 3', 'M16 3c2 0 3 1 3 3v3c0 1.5 1 2 2 3-1 1-2 1.5-2 3v3c0 2-1 3-3 3'],
  link: ['M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1', 'M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1'],
  table: ['M4 4h16v16H4Z', 'M4 10h16M4 15h16M10 4v16'],
  nodes: ['M6 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M8.6 10.6l6.8-3.6M8.6 13.4l6.8 3.6'],
  key: ['M8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 11h9M18 11v3M21 11v2'],
  users: ['M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M3 20c0-3 2.7-5 6-5s6 2 6 5', 'M16 5a3 3 0 0 1 0 6M18 15c2 .6 3 2.3 3 5'],
  shield: ['M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6Z', 'M9 11h6M9 14.5h6'],
  server: ['M4 4h16v6H4Z', 'M4 14h16v6H4Z', 'M7.5 7h.01M7.5 17h.01'],
  gear: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1'],
  globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9Z'],
  repeat: ['M17 2l3 3-3 3', 'M4 11V9a4 4 0 0 1 4-4h12', 'M7 22l-3-3 3-3', 'M20 13v2a4 4 0 0 1-4 4H4'],
};
const GENERIC = {
  'SQL': L.database, 'Groq Llama 4 Vision': L.eye, 'Llama 3.3 70B': L.chip, 'OpenAI GPT-4': L.chat,
  'RAG pipelines': L.layers, 'pgvector embeddings': L.chart, 'Vector search': L.search, 'Document OCR (Tesseract, MRZ)': L.scan,
  'CV parsing / NLP': L.file, 'Prompt engineering': L.prompt, 'AI evaluation': L.check,
  'Arabic RTL / i18n': L.globe, 'REST API design': L.braces, 'Webhooks': L.link, 'ReportLab PDF': L.file, 'openpyxl Excel': L.table, 'Context API': L.nodes,
  'OAuth2': L.key, 'RBAC': L.users, 'Row-Level Security': L.shield, 'AWS EC2 / RDS': L.server, 'systemd': L.gear,
  'Regression suites': L.repeat,
};
const ICONS = { ...Object.fromEntries(Object.entries(GENERIC).map(([k, line]) => [k, { line }])), ...BRANDS };

// Trail colour: the brand colour, or white when it's too dark to see on the dark panel (relative luminance < 0.05).
const trailColor = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.05 ? '#fff' : `#${hex}`;
};

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
// trail tiles: brand logos in their brand colour (very dark ones in white); line icons in the site's orange
const brandSvg = (icon) => `<svg viewBox="0 0 24 24" fill="${trailColor(icon.hex)}" aria-hidden="true"><path d="${icon.path}"/></svg>`;
const lineSvg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="#ff7a3c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((d) => `<path d="${d}"/>`).join('')}</svg>`;

export default function ToolkitPanel({ toolkit }) {
  const [active, setActive] = useState(0);
  const tabs = useRef([]), term = useRef(null), trail = useRef(null);

  // Cursor logo trail (like the contact trail), desktop only, off with reduced motion and on touch.
  // A varied mix of every tool: two shuffled decks (the active tab's tools, and all the others), each
  // reshuffled after a full pass; about half the spawns come from each. One tile per 80ms, 14 alive at most.
  useEffect(() => {
    const box = term.current, layer = trail.current;
    if (!box || !layer) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const groups = toolkit.filter((g) => !g.wide);
    const entry = (name) => (BRANDS[name] ? { svg: brandSvg(BRANDS[name]) } : GENERIC[name] ? { svg: lineSvg(GENERIC[name]) } : null);
    const deck = (names) => {
      const items = names.map((n) => ({ n, e: entry(n) })).filter((x) => x.e);
      let order = [], k = 0;
      return { size: items.length, next() { if (k >= order.length) { order = shuffle(items); k = 0; } return order[k++]; } };
    };
    const mine = deck(groups[active].items);
    const rest = deck(groups.filter((_, i) => i !== active).flatMap((g) => g.items));
    let lastSpawn = 0, lastSvg = '';
    const pick = () => {
      const d = mine.size && (!rest.size || Math.random() < 0.5) ? mine : rest;
      let x = d.next();
      if (x.e.svg === lastSvg && d.size > 1) x = d.next(); // avoid the same logo twice in a row (Docker, Docker Compose)
      lastSvg = x.e.svg;
      return x.e.svg;
    };
    const onMove = (e) => {
      const now = performance.now();
      if (now - lastSpawn < 80) return;
      lastSpawn = now;
      const r = box.getBoundingClientRect();
      const tile = document.createElement('div');
      tile.className = 'tk-trail-tile';
      tile.style.left = `${e.clientX - r.left}px`;
      tile.style.top = `${e.clientY - r.top}px`;
      tile.style.setProperty('--rot', `${Math.random() * 20 - 10}deg`);
      tile.innerHTML = pick();
      layer.appendChild(tile);
      while (layer.childElementCount > 14) layer.firstElementChild.remove();
      setTimeout(() => tile.remove(), 1000);
    };
    if (!mine.size && !rest.size) return;
    box.addEventListener('pointermove', onMove, { passive: true });
    return () => box.removeEventListener('pointermove', onMove);
  }, [active, toolkit]);

  // Arrow keys / Home / End move focus between tabs; Enter, Space or a click selects.
  const onKeyDown = (e) => {
    const list = tabs.current.filter(Boolean), i = list.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    list[(next + list.length) % list.length].focus();
  };
  return <ToolkitView toolkit={toolkit} active={active} onSelect={setActive} onKeyDown={onKeyDown} tabRefs={tabs} icons={ICONS} termRef={term} trailRef={trail} />;
}
