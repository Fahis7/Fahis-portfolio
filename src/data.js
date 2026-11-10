// ─────────────────────────────────────────────────────────────
//  All portfolio content lives here. Edit this file to update
//  text, projects, skills or links - no need to touch the components.
// ─────────────────────────────────────────────────────────────

// WhatsApp: the number in one place; every WhatsApp link opens a chat with this message already typed.
const WHATSAPP_NUMBER = '971542894979';
const WHATSAPP_MESSAGE = 'Hi Fahis, I found your portfolio and I’d like to talk about an opportunity. Are you available for a quick chat?';
export const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const profile = {
  name: 'Mohammed Fahis',
  short: 'Fahis',
  role: 'AI Full Stack Developer / Lead Engineer',
  languages: 'English (fluent) · Malayalam (fluent)',
  location: 'Dubai, UAE',
  timezone: 'Asia/Dubai',
  email: 'muhdfahis.aidev@gmail.com',
  // CV in public/: every View CV / Download CV link is built from this (with BASE_URL).
  resume: 'Mohammed_Fahis_CV.pdf',
  // bump when the CV changes: added as ?v= to every CV link and page image so browsers and GitHub Pages fetch the new file
  // (also update the plain <noscript> CV link in index.html, which can't read this file)
  cvVersion: '2026-11',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammed-fahis-mt' },
    { label: 'GitHub', href: 'https://github.com/Fahis7' },
    { label: 'WhatsApp', href: whatsappHref },
  ],
};

/*
  Projects: order here = order on the scanner belt and on the page.
  site:   drawn mini-website (MiniSites.jsx), used only when there is no live capture (see realShot)
  code:   what the scanner "prints" when the card dissolves (keep lines ≤ 50 chars)
  meta:   three short comment lines shown top-right of the code
  demo:   live URL, or null when offline (the site then links to `github` instead)
  reel:   showreel media (public/showreel/): poster, video (or null), aspect = media width / height.
          The poster doubles as the real screenshot on the belt, the case-study preview and the contact trail.
*/

// The real screenshot for a project, or null. A project only shows its poster as a screenshot when it was
// captured live (reel.video is set); otherwise the drawn MiniSite stands in.
export const realShot = (p) => (p.reel?.video ? import.meta.env.BASE_URL + p.reel.poster : null);

export const projects = [
  {
    id: 'axiskyc',
    site: 'axiskyc',
    num: '01',
    title: 'AxisKYC',
    kicker: 'REGTECH / FINTECH',
    tagline: 'AI-powered KYC / AML compliance platform',
    role: 'Architecture → production',
    desc: 'Built for UAE firms: sanctions, PEP and adverse-media screening, MLRO review, verifiable certificates and a training LMS.',
    badge: 'NEW',
    highlights: [
      '5 sanctions lists, PEP and adverse-media screening',
      'Row-Level Security across tenants, 3 Postgres roles',
      'Verifiable PDF certificates, full Arabic / English RTL',
    ],
    metrics: [
      { value: '5', label: 'sanctions lists' },
      { value: '3', label: 'Postgres roles (RLS)' },
      { value: 'EN · AR', label: 'full RTL support' },
      { value: 'Real PG', label: 'integration tests in CI' },
    ],
    stack: [
      'Django 5.2', 'DRF', 'PostgreSQL 16 + RLS', 'Celery', 'Redis', 'Next.js 16', 'TypeScript', 'Tailwind v4', 'Framer Motion', 'GitHub Actions',
      'Gunicorn', 'CentOS', 'Sanctions.io API', 'Row-Level Security', 'Next.js Route Handlers', 'httpOnly cookies',
      'PDF + QR certificates', 'English + Arabic RTL', 'Real PostgreSQL tests', 'N+1 query guards',
    ],
    demo: 'https://axiskyc.ae',
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/axiskyc.webp', video: 'showreel/axiskyc.mp4', aspect: 1600 / 900 },
    meta: ['# live: axiskyc.ae', '# domain: regtech / fintech', '# tenants: isolated by RLS'],
    code: `# AxisKYC: KYC / AML compliance platform
class Stack:
    backend  = "Django 5.2 + DRF"
    database = "PostgreSQL 16 + Row-Level Sec."
    workers  = "Celery + Redis x3"
    frontend = "Next.js 16 + TypeScript"
    deploy   = "Gunicorn · GitHub Actions"

DB_ROLES = ("owner", "app", "platform")

def screen(subject):
    hits = sanctions_io.search(subject, [
      "OFAC", "UN", "EU", "UK_HMT",
      "UAE_LOCAL", "PEP", "ADVERSE_MEDIA",
    ])
    band = risk_band(hits)  # low/med/high
    return mlro_queue.push(subject, band)

def issue_certificate(profile):
    pdf = render(profile, qr=verify_url)
    return attest(pdf, officer)

LOCALES = ("en", "ar")  # full RTL
# tokens: in-memory · refresh: httpOnly
# CORS: none - proxied via Next.js`,
    caseStudy: {
      features: [
        { t: 'Screening engine', d: 'Five sanctions lists via Sanctions.io (OFAC, UN, EU, UK HMT, UAE Local), plus PEP and adverse media.' },
        { t: '6-factor risk scoring', d: 'Six weighted factors, UAE Central Bank aligned, into low / medium / high bands.' },
        { t: 'Document reading in 4 to 7 s', d: 'Passport and Emirates ID OCR via Claude Vision, with Tesseract and MRZ checks: 9 fields.' },
        { t: 'Multi-tenant by design', d: '33 tables, tenants isolated by Row-Level Security, three Postgres roles.' },
        { t: 'MLRO review queue', d: 'Officers confirm or dismiss every match, with a full audit trail.' },
        { t: 'Verifiable KYC certificates', d: 'QR-verified PDFs with officer attestation and a public verify page.' },
        { t: 'Training & compliance LMS', d: 'Courses, auto-graded quizzes, certificates and an Excel training register.' },
        { t: 'Quotas & subscriptions', d: 'Free tier, bonus credits and rollover, with race-safe quota locking.' },
        { t: 'Individuals & entities', d: 'Screening a company auto-screens every linked director and owner.' },
        { t: 'AML audit module', d: 'Audit logging, plus upload and download of audit evidence.' },
        { t: 'English & Arabic', d: 'Every screen, error and PDF in both languages, with true RTL.' },
        { t: 'Role-based portals', d: 'Broker view, admin dashboard and super-admin platform control.' },
      ],
      panels: [
        { kicker: 'SECURITY', title: 'Locked down by default.', dark: true, items: [
          'Pre-launch security audit: 16 findings, all fixed',
          'No CORS: every API call proxied via Next.js',
          'Access tokens in memory, refresh in httpOnly cookies',
          'Migrations run only as the owner role',
          'Platform writes use their own database role',
          'SSH password login off in production',
        ] },
        { kicker: 'TESTING', title: 'Tested like it matters.', items: [
          'Integration tests on real PostgreSQL, not SQLite',
          'CI on GitHub Actions',
          'Threading tests for quota race conditions',
          'Query-count tests that block N+1 queries',
        ] },
      ],
    },
  },
  {
    id: 'refurbops',
    num: '02',
    title: 'RefurbOps',
    kicker: 'RECOMMERCE / AI OPS',
    tagline: 'AI-powered operations for refurbished electronics',
    role: 'Live platform',
    desc: 'Tracks used phones and laptops from intake to sale, and sells each unit on several marketplaces without overselling.',
    highlights: [
      'Oversell-safe sync across 3 marketplaces',
      'AI photo grading; a human makes the call',
      'IMEI intake with TAC lookup and Luhn check',
    ],
    metrics: [
      { value: '3', label: 'marketplaces synced' },
      { value: '150+', label: 'automated tests' },
      { value: '6', label: 'pipeline stages' },
    ],
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Claude API', 'Vitest', 'Vercel', 'GitHub Actions'],
    demo: 'https://refurbops.vercel.app/',
    github: 'https://github.com/Fahis7/RefurbOps',
    reel: { poster: 'showreel/refurbops.webp', video: 'showreel/refurbops.mp4', aspect: 1600 / 900 },
    meta: ['# live: refurbops.vercel.app', '# domain: refurb electronics ops', '# ai: claude, vision + text'],
    code: `// RefurbOps: refurb electronics ops platform
export const stack = {
  app:   "Next.js 16 + React 19",
  lang:  "TypeScript",
  ai:    "Claude API, vision + text",
  tests: "Vitest, 150+ tests",
  ci:    "GitHub Actions + Vercel",
};

const PIPELINE = ["Received", "Grading",
  "Repair", "QC", "Listed", "Sold"];

export function onOrder(order: Order) {
  if (seen(order.id)) return ok();  // idempotent
  if (unit.sold) return reject(409); // first wins
  markSold(unit);
  delistEverywhere(unit);
}

export const grade = (photos: Photo[]) =>
  vision.suggest(photos)   // human confirms
    .then(rejectLowConfidence);`,
    caseStudy: {
      features: [
        { t: 'Repair pipeline board', d: 'Intake to sale on one board, with alerts when work stalls.' },
        { t: 'QC gate', d: 'Device checklists must pass before a unit is listed.' },
        { t: 'Oversell-safe marketplace sync', d: 'First order wins; late orders get a 409 and the unit delists everywhere.' },
        { t: 'AI photo grading', d: 'Suggested grades from photos; low-confidence results are blocked.' },
        { t: 'AI ops assistant', d: 'Answers from pre-computed data only.' },
        { t: 'AI listing generator', d: 'Listings from verified device facts, with a safe fallback.' },
        { t: 'Smart intake', d: 'IMEI and TAC lookup, Luhn check and duplicate detection.' },
        { t: 'Multi-currency costs', d: 'Costs in five currencies, margins in EUR at the saved rate.' },
        { t: 'Executive dashboard', d: 'Revenue, profit, stock flow and profit per marketplace.' },
        { t: 'Safe CSV export', d: 'Formula-injection-safe exports, plus light and dark themes.' },
      ],
      panels: [
        { kicker: 'ENGINEERING', title: 'Built to be trusted.', dark: true, items: [
          'Layered architecture; business rules are pure, tested functions',
          '150+ tests, with CI on every push',
          'AI evaluated like code: caught a real "lowest profit" bug pre-release',
          'AI safety: server-side key, injection guards, validation, rate limits',
          'Postgres schema with database-level oversell protection',
        ] },
      ],
    },
  },
  {
    id: 'zero',
    site: 'zero',
    num: '03',
    title: 'Zero Accounting',
    kicker: 'ACCOUNTING / AUDIT · UAE',
    tagline: 'Bilingual corporate website for an Abu Dhabi tax agency',
    role: 'Live business website',
    desc: 'Live bilingual English/Arabic site for an FTA-approved tax firm in Abu Dhabi, built with React and Vite.',
    highlights: ['English and Arabic, full RTL (react-i18next)', 'SVG preloader, 3D tilt cards, split-text reveals', 'Mobile-first, Lenis smooth scroll, on Vercel'],
    metrics: [
      { value: 'Live', label: 'business website' },
      { value: 'EN · AR', label: 'bilingual, RTL' },
      { value: 'Mobile', label: 'first, responsive' },
    ],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Lenis', 'react-i18next', 'Vercel'],
    demo: 'https://zeroaccounting.ae/',
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/zero.webp', video: 'showreel/zero.mp4', aspect: 1600 / 900 },
    meta: ['# live: zeroaccounting.ae', '# domain: audit / accounting', '# build: react + vite'],
    code: `// Zero Accounting: bilingual corporate site
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const stack = {
  build:  "React + Vite",
  i18n:   "react-i18next (EN / AR)",
  motion: "Framer Motion + Lenis",
  deploy: "Vercel",
};

i18n.use(initReactI18next).init({ lng: "en" });
i18n.on("languageChanged", (lng) => {
  document.dir = lng === "ar" ? "rtl" : "ltr";
});

export default function App() {
  return (
    <Preloader>
      <Hero /><Services /><Enquiry />
    </Preloader>
  );
}`,
  },
  {
    id: 'seek',
    site: 'seek',
    num: '04',
    title: 'Seek & Sync',
    kicker: 'HR / AI RECRUITING',
    tagline: 'AI recruiting for an Abu Dhabi consultancy',
    role: 'Live platform',
    desc: 'Turns uploaded CVs into matched, ready-to-act candidates.',
    highlights: ['Claude Haiku parses CVs into profiles', 'Semantic job matching on Supabase pgvector', 'AI-written alerts for new matches'],
    metrics: [
      { value: 'AI', label: 'CV parser' },
      { value: 'Vector', label: 'semantic matching' },
      { value: 'Auto', label: 'recruiter alerts' },
    ],
    stack: ['Next.js 14', 'TypeScript', 'Tailwind', 'Claude Haiku', 'Supabase', 'pgvector', 'Netlify'],
    demo: 'https://seek-and-sync.netlify.app/',
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/seek.webp', video: 'showreel/seek.mp4', aspect: 1600 / 900 },
    meta: ['# live: seek-and-sync.netlify.app', '# domain: hr / recruiting', '# ai: claude haiku'],
    code: `// Seek & Sync: AI recruiting platform
export const stack = {
  app:    "Next.js 14 + TypeScript",
  ui:     "Tailwind",
  llm:    "Claude Haiku",
  data:   "Supabase + pgvector",
  deploy: "Netlify",
};

export async function ingest(cv: File) {
  const profile = await claude.parse(cv);
  const embedding = await embed(profile);
  return supabase.from("candidates")
    .insert({ ...profile, embedding });
}

export const match = (job: Job) =>
  supabase.rpc("match_candidates", {
    query: job.embedding, k: 20,
  });`,
  },
  {
    id: 'horologie',
    site: 'horologie',
    num: '05',
    title: 'Horologie',
    kicker: 'LUXURY COMMERCE / ANALYTICS',
    tagline: 'Premium e-commerce engine for timepieces',
    role: 'API, auth & analytics',
    desc: 'Strong authentication, fast media delivery and live analytics.',
    highlights: ['Three-layer authentication with Firebase MFA', 'Cloudinary CDN for high-res product media', 'Live operational analytics dashboard'],
    metrics: [
      { value: '3-layer', label: 'MFA auth' },
      { value: 'CDN', label: 'media delivery' },
      { value: 'Live', label: 'ops analytics' },
    ],
    stack: ['Django', 'DRF', 'Firebase MFA', 'Cloudinary', 'PostgreSQL'],
    demo: 'https://horologiee.vercel.app/',
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/horologie.webp', video: 'showreel/horologie.mp4', aspect: 1600 / 900 },
    meta: ['# live: horologiee.vercel.app', '# domain: luxury commerce', '# auth: 3-layer mfa'],
    code: `# Horologie: luxury watch commerce
class Stack:
    api   = "Django + DRF"
    auth  = "Firebase MFA · 3 layers"
    media = "Cloudinary CDN"
    db    = "PostgreSQL"

@require_mfa(layers=3)
def checkout(cart, user):
    ...

def product_media(watch):
    return cloudinary.url(
        watch.image,
        format="auto", quality="auto",
    )

analytics.live(dashboard="ops")`,
  },
  {
    id: 'propai',
    site: 'propai',
    num: '06',
    title: 'PropAI OS',
    kicker: 'REAL ESTATE / VISION AI',
    tagline: 'Operating system for Dubai property teams',
    role: 'Architecture → production · demo offline',
    desc: 'Multi-tenant property SaaS: four role-based portals, async jobs and five Docker services.',
    highlights: ['Vision-AI maintenance triage with Groq Llama 4 Vision', 'RAG concierge on pgvector and Llama 3.3 70B', 'Smart market pricing and 8 JWT roles'],
    metrics: [
      { value: '4', label: 'role-based portals' },
      { value: '8', label: 'JWT roles' },
      { value: '5', label: 'Docker services' },
    ],
    stack: ['Django 5', 'React 19', 'PostgreSQL', 'Groq Llama 4 Vision', 'Llama 3.3 70B', 'pgvector', 'Celery', 'Redis', 'Docker', 'Railway'],
    demo: null,
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/propai.webp', video: null, aspect: 1600 / 1019 },
    meta: ['# status: redeploying', '# domain: real estate', '# ai: vision + rag'],
    code: `# PropAI OS: multi-tenant property SaaS
class Stack:
    backend  = "Django 5 + DRF"
    frontend = "React 19"
    database = "PostgreSQL + pgvector"
    vision   = "Groq Llama 4 Vision"
    rag_llm  = "Llama 3.3 70B"
    workers  = "Celery + Redis"
    infra    = "Docker Compose · 5 services"

PORTALS   = 4   # role-based
JWT_ROLES = 8

def triage(ticket):
    label = vision.classify(ticket.photo)
    return route(ticket, label)

def concierge(question):
    docs = pgvector.similar(embed(question))
    return llm.answer(question, docs)

def price(unit):
    return market_model.estimate(unit)`,
  },
];

/*
  Hero proof strip. Builds and Live are counted from \`projects\` (live = has a demo URL), so they stay true.
  The other two are AxisKYC figures from the CV: 1,000+ profiles screened in production, 1,255 regression tests.
*/
export const heroStats = [
  { value: projects.length, label: 'Builds' },
  { value: projects.filter((p) => p.demo).length, label: 'Live' },
  { value: 1000, suffix: '+', label: 'Profiles screened' },
  { value: 1255, label: 'Tests passing' },
];

// Stack section cards: every number here is a real count from the projects above.
export const stackCards = [
  {
    key: 'ai', variant: 'speed',
    title: ['AI / LLM', 'Applied in Production'],
    dots: '4', unit: 'AI products',
    caption: ['AxisKYC, RefurbOps,', 'PropAI OS & Seek and Sync'],
    groups: [{ label: 'AI / LLM', items: ['Claude API (Haiku, Vision)', 'Groq Llama 4 Vision', 'OpenAI GPT-4', 'RAG pipelines', 'pgvector embeddings', 'Document OCR (Tesseract, MRZ)', 'Prompt engineering'] }],
  },
  {
    key: 'backend', variant: 'context',
    title: ['Backend & Data', 'Multi-tenant by Design'],
    dots: '3', unit: 'DB roles',
    caption: ['Postgres roles behind', 'Row-Level Security'],
    groups: [{ label: 'Backend & data', items: ['Python', 'Django 5', 'Django REST Framework', 'FastAPI', 'PostgreSQL (RLS, multi-tenant)', 'Celery', 'Redis queues'] }],
  },
  {
    key: 'ship', variant: 'connections',
    title: ['Frontend & Cloud', 'Shipped End-to-End'],
    dots: '5', unit: 'live',
    caption: ['Products live', 'in production'],
    groups: [
      { label: 'Frontend', items: ['React 19', 'Next.js 16 (App Router)', 'Tailwind CSS', 'SWR', 'Framer Motion', 'Arabic RTL / i18n'] },
      { label: 'Cloud / DevOps', items: ['Docker', 'GitHub Actions CI/CD', 'AWS EC2 / RDS', 'Vercel', 'Nginx', 'Cloudflare R2'] },
    ],
  },
];

/*
  Full toolkit (Stack section, under the glass cards). Every skill from the CV, by group.
  `wide` spans the full grid width with crimson-outlined chips.
*/
// The tab the toolkit panel opens on, by group key (the label lowercased, e.g. 'AI / LLM' → 'ai_llm').
export const toolkitDefaultTab = 'ai_llm';

export const toolkit = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { label: 'AI / LLM', items: ['Claude API (Haiku, Vision)', 'Groq Llama 4 Vision', 'Llama 3.3 70B', 'OpenAI GPT-4', 'Hugging Face Transformers', 'RAG pipelines', 'pgvector embeddings', 'Vector search', 'Document OCR (Tesseract, MRZ)', 'CV parsing / NLP', 'Prompt engineering', 'AI evaluation', 'Claude Code (AI-assisted development)'] },
  { label: 'Backend', items: ['Django 5', 'Django REST Framework', 'FastAPI', 'REST API design', 'Webhooks', 'Celery', 'Redis queues', 'ReportLab PDF', 'openpyxl Excel'] },
  { label: 'Frontend', items: ['React 19', 'Next.js 16 (App Router)', 'Vite', 'Tailwind CSS', 'SWR', 'Context API', 'Framer Motion', 'Lenis', 'Arabic RTL / i18n'] },
  { label: 'Data', items: ['PostgreSQL (RLS, multi-tenant)', 'Supabase', 'Redis'] },
  { label: 'Auth & Security', items: ['JWT', 'OAuth2', 'Firebase Auth / MFA', 'RBAC', 'Row-Level Security'] },
  { label: 'Cloud & DevOps', items: ['Docker', 'Docker Compose', 'Microservices', 'GitHub Actions CI/CD', 'AWS EC2 / RDS', 'DigitalOcean', 'Railway', 'Vercel', 'Netlify', 'Nginx', 'Gunicorn', 'Certbot SSL', 'systemd', 'Cloudinary', 'Cloudflare R2', 'DO Spaces', 'Sentry'] },
  { label: 'Testing', items: ['Vitest', 'Integration tests on real PostgreSQL', 'Regression suites'] },
  { label: 'Domains', wide: true, items: ['AML / KYC compliance', 'Sanctions & PEP screening', 'Multi-tenant SaaS', 'E-commerce', 'Recommerce operations'] },
];

/*
  Work together: two glass cards (same component as the Stack cards).
*/
export const offers = [
  {
    key: 'role', variant: 'speed',
    title: ['Full-time role', 'AI & Full-stack Engineer'],
    dots: 'NOW', unit: 'available',
    caption: ['Dubai on-site,', 'hybrid or remote'],
    reveal: { label: 'What I bring', cv: true, linkedin: true, items: [
      'Production AI: LLMs, vision, RAG',
      'Multi-tenant SaaS with RLS',
      'Django / DRF + Next.js / React',
      'CI/CD, Docker and testing',
      'English and Arabic (RTL) interfaces',
    ] },
  },
  {
    key: 'build', variant: 'connections',
    title: ['Project build', 'Fixed Scope, End to End'],
    dots: '6', unit: 'builds shipped',
    caption: ['Architecture, build,', 'deploy and hand-over'],
    reveal: { label: 'What you get', items: [
      'Discovery and system design',
      'Full-stack build with tests',
      'AI where it adds value',
      'Deployment and CI/CD',
      'Hand-over and docs',
    ] },
  },
];

/*
  About quotes (sliding carousel). Wrap words in *asterisks* for the crimson accent.
*/
export const quotes = [
  { text: 'Security is a *design decision*, not a final check.', author: 'Mohammed Fahis' },
  { text: 'The model suggests. *A human decides.*', author: 'Mohammed Fahis' },
  { text: 'If it isn’t tested against a *real database*, it isn’t tested.', author: 'Mohammed Fahis' },
  { text: 'A feature isn’t done when it works. It’s done when it *survives production*.', author: 'Mohammed Fahis' },
  { text: 'Owning the whole product means *owning the bugs* too.', author: 'Mohammed Fahis' },
  { text: 'The *last 10%* is where software feels finished. That’s where I stay.', author: 'Mohammed Fahis' },
]

export const marquee = ['Row-Level Security', 'RAG pipelines', 'Vision AI', 'KYC / AML screening', 'Multi-tenant SaaS', 'Celery workers', 'Arabic + RTL', 'pgvector search', 'CI/CD', 'PDF + QR certificates'];

// Tip: recruiters scan for company names + dates. Add `company` when you can.
export const experience = [
  {
    time: '2026 to present', current: true, link: '#work-axiskyc', year: 'NOW', name: 'AM Audit', short: 'Lead Engineer · AM Audit',
    tech: ['Django', 'PostgreSQL RLS', 'Next.js 16', 'Claude AI', 'React 19', 'TypeScript', 'Tailwind', 'Celery', 'Redis', 'Tesseract', 'Docker', 'GitHub Actions'],
    title: 'AI Full Stack Developer / Lead Engineer', company: 'AM Audit, Abdulla Al Mulla Auditing & Accounting',
    desc: 'Sole engineer of AxisKYC, a live multi-tenant AML/KYC SaaS for UAE compliance firms.',
  },
  {
    time: 'Nov 2026', link: '#work-refurbops', year: '2026', name: 'RefurbOps', short: 'AI Full Stack Developer · RefurbOps',
    tech: ['Next.js 16', 'TypeScript', 'Claude API (vision)', 'Vitest', 'React 19', 'GitHub Actions', 'Vercel'],
    title: 'AI Full Stack Developer', company: 'RefurbOps, Independent product, Dubai',
    desc: 'AI photo grading, a plain-English ops assistant and oversell-safe marketplace sync, with 150+ tests.',
  },
  {
    time: 'Jun 2026', link: '#work-zero', year: '2026', name: 'Zero Accounting', short: 'Frontend Developer · Zero Accounting',
    tech: ['React', 'Vite', 'react-i18next', 'Framer Motion', 'Tailwind CSS', 'Lenis', 'Vercel'],
    title: 'Frontend Developer', company: 'Zero Accounting, Abu Dhabi',
    desc: 'Bilingual English/Arabic site for an FTA-approved tax agency, mobile-first, on Vercel.',
  },
  {
    time: 'May to Jun 2026', link: '#work-propai', year: '2026', name: 'PropAI OS', short: 'Full Stack AI Developer · PropAI OS',
    tech: ['Django 5', 'Groq Llama 4 Vision', 'Llama 3.3 70B', 'pgvector', 'React 19', 'Celery', 'Redis', 'Docker', 'Railway'],
    title: 'Full Stack AI Developer', company: 'PropAI OS, Zero Accounting, Abu Dhabi',
    desc: 'Vision-AI triage, smart rent pricing and a RAG concierge in a four-portal SaaS.',
  },
  {
    time: 'Feb to Apr 2026', link: '#work-seek', year: '2026', name: 'Seek & Sync', short: 'Frontend & AI Integration · Seek & Sync',
    tech: ['Next.js 14', 'Claude Haiku', 'Supabase', 'pgvector', 'TypeScript', 'Tailwind', 'Netlify'],
    title: 'Frontend Developer & AI Integration', company: 'Seek & Sync HR Consultancy, Abu Dhabi',
    desc: 'Live HR platform with Claude Haiku CV parsing, vector matching and recruiter alerts.',
  },
  {
    time: '2025', link: '#work-horologie', year: '2025', name: 'Horologie', short: 'Full Stack Developer · Horologie',
    tech: ['Django REST Framework', 'React', 'Firebase MFA', 'Cloudinary', 'JWT', 'Google OAuth', 'PostgreSQL'],
    title: 'Full Stack Developer', company: 'Horologie, Enterprise e-commerce',
    desc: 'E-commerce built from scratch: JWT, Google OAuth, Firebase MFA and a real-time analytics dashboard.',
  },
]

// Credential cards under the experience role cards (icon: 'cap' | 'spark' | 'code'; accent = crimson icon tile; date optional).
export const credentials = [
  { key: 'education', icon: 'cap', label: 'Education', date: '2022–2025', title: 'Bachelor’s in Computer Application', sub: 'Calicut University', year: '2022', name: 'Education', short: 'Education · Calicut University' },
  { key: 'bridgeon', icon: 'code', label: 'Internship', date: 'Apr 2025 – Jan 2026', title: 'Full Stack Developer Intern', sub: 'Bridgeon Solutions LLP · Kerala, India', year: '2025', name: 'Bridgeon', short: 'Full Stack Intern · Bridgeon' },
  { key: 'programme', icon: 'spark', label: 'Programme', date: '2025', title: 'One Million Prompters · Dubai', sub: 'Dubai Future Foundation · Selected participant', accent: true, year: '2025', name: 'Programme', short: 'Programme · Dubai Future Foundation' },
  { key: 'python', icon: 'code', label: 'Certification', title: 'Python Fullstack Developer', sub: 'Django · DRF · React', year: 'CERT', name: 'Certification', short: 'Certification · Python Fullstack Developer' },
]

