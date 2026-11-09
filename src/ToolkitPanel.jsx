import React, { useRef, useState } from 'react';
import {
  siPython, siTypescript, siJavascript, siPostgresql, siAnthropic, siHuggingface, siDjango, siFastapi, siCelery, siRedis,
  siReact, siNextdotjs, siTailwindcss, siSwr, siFramer, siSupabase, siFirebase, siJsonwebtokens, siDocker, siGithubactions,
  siDigitalocean, siRailway, siVercel, siNetlify, siNginx, siGunicorn, siLetsencrypt, siCloudinary, siCloudflare, siSentry, siVitest,
} from 'simple-icons'; // CC0; only these icons end up in this chunk
import { ToolkitView } from './Toolkit.jsx';

// Lazy chunk: tab behaviour + logos. Keys are the exact item names in data.js `toolkit`.
// No simple-icons match (monogram instead): SQL, OpenAI, AWS, Groq / Llama, and the generic skills.
const ICONS = {
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

export default function ToolkitPanel({ toolkit }) {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  // Arrow keys / Home / End move focus between tabs; Enter, Space or a click selects.
  const onKeyDown = (e) => {
    const list = tabs.current.filter(Boolean), i = list.indexOf(document.activeElement);
    if (i < 0) return;
    const next = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: list.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    list[(next + list.length) % list.length].focus();
  };
  return <ToolkitView toolkit={toolkit} active={active} onSelect={setActive} onKeyDown={onKeyDown} tabRefs={tabs} icons={ICONS} />;
}
