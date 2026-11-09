// ─────────────────────────────────────────────────────────────
//  All portfolio content lives here. Edit this file to update
//  text, projects, skills or links - no need to touch the components.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Mohammed Fahis',
  short: 'Fahis',
  role: 'AI Engineer / Full Stack Developer',
  location: 'Dubai, UAE',
  timezone: 'Asia/Dubai',
  email: 'muhdfahis.aidev@gmail.com',
  // CV in public/: every View CV / Download CV link is built from this (with BASE_URL).
  resume: 'Mohammed_Fahis_CV.pdf',
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammed-fahis-mt' },
    { label: 'GitHub', href: 'https://github.com/Fahis7' },
    { label: 'WhatsApp', href: 'https://wa.me/971542894979' },
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
    desc: 'A multi-tenant compliance platform for compliance officers and audit firms in the UAE: automated PEP, sanctions, UAE Local List and adverse-media screening, an MLRO review workflow, verifiable KYC certificates and a full training LMS, in English and Arabic.',
    badge: 'NEW',
    highlights: [
      'Automated PEP, sanctions, UAE Local List and adverse-media screening with risk bands',
      'Row-Level Security isolation across tenants, with 3 Postgres roles',
      'Verifiable PDF certificates, MLRO review queue and full Arabic / English RTL',
    ],
    metrics: [
      { value: '4', label: 'screening lists' },
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
      "PEP", "SANCTIONS",
      "UAE_LOCAL", "ADVERSE_MEDIA",
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
        { t: 'Screening engine', d: 'Automated PEP, Sanctions, UAE Local List and Adverse Media screening via the Sanctions.io API, with real-time risk scoring and configurable low / medium / high bands.' },
        { t: 'Multi-tenant by design', d: 'Row-Level Security isolates every tenant at the database level. Three Postgres roles: owner (migrations), app (tenant runtime), platform (super-admin).' },
        { t: 'MLRO review queue', d: 'Compliance officers confirm or dismiss each PEP, sanctions, adverse-media and UAE-list match, with a full audit trail.' },
        { t: 'Verifiable KYC certificates', d: 'PDF certificates with QR verification, officer attestation, dynamic screening results and a public verification endpoint.' },
        { t: 'Training & compliance LMS', d: 'Course authoring, timed auto-graded quizzes, certificates, assignment lifecycle, Excel training register and analytics on completion and scores.' },
        { t: 'Quotas & subscriptions', d: 'Free tier, bonus credits and monthly rollover, with race-condition-safe quota reservation using database-level locking.' },
        { t: 'Individuals & entities', d: 'Company profiles with ownership links: screening a company auto-screens every linked director and owner. Document management built in.' },
        { t: 'AML audit module', d: 'Compliance audit logging plus document upload and download for audit evidence.' },
        { t: 'English & Arabic', d: 'Every UI component, error message and PDF certificate in both languages, with true RTL layout.' },
        { t: 'Role-based portals', d: 'Simplified broker-agent view, full admin dashboard with stats, and cross-tenant platform management for super-admins.' },
      ],
      panels: [
        { kicker: 'SECURITY', title: 'Locked down by default.', dark: true, items: [
          'No CORS: the frontend proxies every API call through Next.js Route Handlers',
          'Access tokens held in memory only; refresh tokens in httpOnly cookies',
          'Migrations run only as the owner database role',
          'Platform-domain writes use a dedicated database role',
          'SSH password authentication disabled in production',
        ] },
        { kicker: 'TESTING', title: 'Tested like it matters.', items: [
          'Integration suite against real PostgreSQL, not SQLite',
          'CI pipeline on GitHub Actions',
          'Concurrent threading tests for quota race conditions',
          'Query-count regression tests that block N+1 queries',
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
    desc: 'An operations platform for a business that buys, repairs and resells used phones and laptops. It follows each device through intake, grading, repair, quality control and listing, and sells it on several marketplaces at once without ever selling the same unit twice. AI helps with grading, listings and management questions, while a human always makes the final call.',
    highlights: [
      'Oversell-safe sync across 3 marketplaces: idempotent webhooks, first order wins, automatic delisting',
      'AI photo grading and a plain-English ops assistant, with a human making the final decision',
      'Smart IMEI intake (TAC model lookup + Luhn check) and multi-currency margins',
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
        { t: 'Repair pipeline board', d: 'Every device moves across a board from intake to sale, with time-in-stage alerts when work stalls.' },
        { t: 'QC gate', d: 'Device-specific checklists that must pass before a unit can be listed.' },
        { t: 'Oversell-safe marketplace sync', d: 'One unit, several marketplaces: the first order wins, late orders get a 409 and the unit is delisted everywhere.' },
        { t: 'AI photo grading', d: 'Suggested grades from device photos; low-confidence results can’t be applied.' },
        { t: 'AI ops assistant', d: 'Answers management questions only from pre-computed data, with clickable device IDs.' },
        { t: 'AI listing generator', d: 'Listings written from verified device facts, with output validation and a safe fallback.' },
        { t: 'Smart intake', d: 'IMEI and TAC model lookup, Luhn check, autocomplete and live duplicate detection.' },
        { t: 'Multi-currency costs', d: 'Costs in AED, INR, USD, GBP and EUR, margins in EUR, with the exchange rate saved per device.' },
        { t: 'Executive dashboard', d: 'Revenue and profit trends, devices in vs out, KPI sparklines and profit per marketplace.' },
        { t: 'Safe CSV export', d: 'Exports protected against formula injection, plus a light and dark theme.' },
      ],
      panels: [
        { kicker: 'ENGINEERING', title: 'Built to be trusted.', dark: true, items: [
          'Clean layered architecture with business rules as pure, tested functions',
          '150+ automated tests and GitHub Actions CI: type-check, tests and build on every push',
          'AI evaluated like production code, which caught and fixed a real "lowest profit" bug before release',
          'AI safety: server-side key, prompt-injection protection, strict output validation, rate limiting, timeouts and fallbacks',
          'A PostgreSQL schema with database-level oversell protection included',
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
    tagline: 'Auditing & accounting firm in Dubai and Abu Dhabi',
    role: 'Live business website',
    desc: 'The live website for a Dubai and Abu Dhabi auditing and accounting firm, built to make six services (bookkeeping, VAT consulting, auditing, ICV certification, payroll and business consultancy) clear, credible and easy to enquire about.',
    highlights: ['Service-led structure across six services, guiding visitors to an enquiry', 'Typed Next.js + Tailwind CSS codebase', 'Mobile-first, responsive layouts across every page'],
    metrics: [
      { value: 'Live', label: 'business website' },
      { value: 'Next.js', label: '+ TypeScript' },
      { value: 'Mobile', label: 'first, responsive' },
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    demo: 'https://zeroaccounting.ae/',
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/zero.webp', video: 'showreel/zero.mp4', aspect: 1600 / 900 },
    meta: ['# live: zeroaccounting.ae', '# domain: audit / accounting', '# build: next.js'],
    code: `// Zero Accounting: business services site
export const stack = {
  framework: "Next.js",
  language:  "TypeScript",
  styling:   "Tailwind CSS",
  layout:    "mobile-first",
};

export default function Page() {
  return (
    <main>
      <Hero />
      <Services />
      <Enquiry />
    </main>
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
    desc: 'A live recruitment platform where CV intelligence, semantic matching and recruiter automation turn applicant uploads into actionable workflows.',
    highlights: ['CV parsing with Claude Haiku turns uploads into structured candidate profiles', 'Semantic candidate ↔ job matching with pgvector embeddings', 'Automated recruiter alerts via Resend'],
    metrics: [
      { value: 'AI', label: 'CV parser' },
      { value: 'Vector', label: 'semantic matching' },
      { value: 'Auto', label: 'recruiter alerts' },
    ],
    stack: ['React', 'Django', 'Claude Haiku', 'pgvector', 'Resend'],
    demo: 'https://seek-and-sync.netlify.app/',
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/seek.webp', video: 'showreel/seek.mp4', aspect: 1600 / 900 },
    meta: ['# live: seek-and-sync.netlify.app', '# domain: hr / recruiting', '# ai: claude haiku'],
    code: `# Seek & Sync: AI recruiting platform
class Stack:
    backend  = "Django"
    frontend = "React"
    llm      = "Claude Haiku"
    search   = "pgvector"
    email    = "Resend"

def ingest(cv_file):
    profile = claude.parse(cv_file)
    profile.vector = embed(profile)
    return profile.save()

def match(job, k=20):
    return pgvector.nearest(job.vector, k)

def on_new_match(match):
    resend.notify(match.recruiter)`,
  },
  {
    id: 'horologie',
    site: 'horologie',
    num: '05',
    title: 'Horologie',
    kicker: 'LUXURY COMMERCE / ANALYTICS',
    tagline: 'Premium e-commerce engine for timepieces',
    role: 'API, auth & analytics',
    desc: 'A premium e-commerce engine for luxury timepieces combining strong authentication, optimised media delivery and live operational analytics.',
    highlights: ['Three-layer authentication with Firebase MFA', 'Cloudinary CDN pipeline for high-resolution product media', 'Live operational analytics dashboard'],
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
    desc: 'A multi-tenant SaaS for Dubai property teams. Four role-based portals, async jobs, five-service Docker orchestration and AI features designed for real production workflows.',
    highlights: ['Vision-AI maintenance triage powered by Groq Vision', 'RAG concierge over property data using pgvector', 'Smart market pricing and four role-based portals with 8 JWT roles'],
    metrics: [
      { value: '4', label: 'role-based portals' },
      { value: '8', label: 'JWT roles' },
      { value: '5', label: 'Docker services' },
    ],
    stack: ['Django 5', 'React 19', 'PostgreSQL', 'Groq Vision', 'pgvector', 'Docker'],
    demo: null,
    github: 'https://github.com/Fahis7',
    reel: { poster: 'showreel/propai.webp', video: null, aspect: 1600 / 1019 },
    meta: ['# status: redeploying', '# domain: real estate', '# ai: vision + rag'],
    code: `# PropAI OS: multi-tenant property SaaS
class Stack:
    backend  = "Django 5 + DRF"
    frontend = "React 19"
    database = "PostgreSQL + pgvector"
    vision   = "Groq Llama 4 Scout Vision"
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

export const skills = [
  { key: 'ai', title: 'AI / LLM', items: ['Claude (Anthropic)', 'Groq Llama 4 Scout Vision', 'OpenAI GPT-4', 'RAG & pgvector', 'Hugging Face', 'LangChain & prompt engineering'] },
  { key: 'backend', title: 'Backend', items: ['Python', 'Django 5 / DRF', 'FastAPI', 'PostgreSQL + RLS', 'Celery + Redis', 'JWT / OAuth2', 'MongoDB / Supabase'] },
  { key: 'frontend', title: 'Frontend', items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Framer Motion', 'i18n / RTL'] },
  { key: 'cloud', title: 'Cloud / DevOps', items: ['Docker + Compose', 'GitHub Actions CI/CD', 'Nginx + Gunicorn', 'AWS EC2 / RDS', 'CentOS / Linux', 'Railway / Vercel / Netlify'] },
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
export const toolkit = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { label: 'AI / LLM', items: ['Claude API (Haiku, Vision)', 'Groq Llama 4 Vision', 'Llama 3.3 70B', 'OpenAI GPT-4', 'Hugging Face Transformers', 'RAG pipelines', 'pgvector embeddings', 'Vector search', 'Document OCR (Tesseract, MRZ)', 'CV parsing / NLP', 'Prompt engineering', 'AI evaluation'] },
  { label: 'Backend', items: ['Django 5', 'Django REST Framework', 'FastAPI', 'REST API design', 'Webhooks', 'Celery', 'Redis queues', 'ReportLab PDF', 'openpyxl Excel'] },
  { label: 'Frontend', items: ['React 19', 'Next.js 16 (App Router)', 'Tailwind CSS', 'SWR', 'Context API', 'Framer Motion', 'Arabic RTL / i18n'] },
  { label: 'Data', items: ['PostgreSQL (RLS, multi-tenant)', 'Supabase', 'Redis'] },
  { label: 'Auth & Security', items: ['JWT', 'OAuth2', 'Firebase Auth / MFA', 'RBAC', 'Row-Level Security'] },
  { label: 'Cloud & DevOps', items: ['Docker', 'Docker Compose', 'GitHub Actions CI/CD', 'AWS EC2 / RDS', 'DigitalOcean', 'Railway', 'Vercel', 'Netlify', 'Nginx', 'Gunicorn', 'Certbot SSL', 'systemd', 'Cloudinary', 'Cloudflare R2', 'Sentry'] },
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
      'AI features in production (LLMs, vision, RAG)',
      'Multi-tenant SaaS and Row-Level Security',
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
      'AI features where they add value',
      'Deployment and CI/CD',
      'Hand-over and documentation',
    ] },
  },
];

/*
  About quotes (sliding carousel). Wrap words in *asterisks* for the crimson accent.
*/
export const quotes = [
  { text: 'Security is a *design decision*, not a final check. In AxisKYC it starts at the database role.', author: 'Mohammed Fahis' },
  { text: 'The model suggests. *A human decides.* That’s how AI belongs in serious software.', author: 'Mohammed Fahis' },
  { text: 'If it isn’t tested against a *real database*, it isn’t tested.', author: 'Mohammed Fahis' },
  { text: 'A feature isn’t done when it works. It’s done when it *survives production*.', author: 'Mohammed Fahis' },
  { text: 'Owning the whole product means *owning the bugs* too.', author: 'Mohammed Fahis' },
  { text: 'The *last 10%* is where software starts to feel finished, so that’s where I stay.', author: 'Mohammed Fahis' },
]

export const marquee = ['Row-Level Security', 'RAG pipelines', 'Vision AI', 'KYC / AML screening', 'Multi-tenant SaaS', 'Celery workers', 'Arabic + RTL', 'pgvector search', 'CI/CD', 'PDF + QR certificates'];

// Tip: recruiters scan for company names + dates. Add `company` when you can.
export const experience = [
  {
    time: '2026 to present', current: true, link: '#work-axiskyc', year: 'NOW', name: 'AM Audit', short: 'Lead Engineer · AM Audit',
    tech: ['Django', 'PostgreSQL RLS', 'Next.js 16', 'React 19', 'TypeScript', 'Celery', 'Redis', 'Claude AI'],
    title: 'AI Full Stack Developer / Lead Engineer', company: 'AM Audit, Abdulla Al Mulla Auditing & Accounting',
    desc: 'Sole engineer behind AxisKYC, a live multi-tenant AML/KYC compliance SaaS for UAE compliance firms: PostgreSQL RLS, three database roles, sanctions / PEP / adverse-media screening, Claude Vision document OCR and four role-based portals.',
  },
  {
    time: 'May to Jun 2026', link: '#work-propai', year: '2026', name: 'PropAI OS', short: 'Full Stack AI Developer · PropAI OS',
    tech: ['Django 5', 'React 19', 'Groq Llama 4', 'pgvector', 'Celery', 'Docker'],
    title: 'Full Stack AI Developer', company: 'PropAI OS, Zero Accounting, Dubai',
    desc: 'Vision-AI maintenance triage, a smart rent pricing engine on live Dubai market data, and a pgvector RAG concierge in a multi-tenant SaaS with four portals and eight JWT roles.',
  },
  {
    time: 'Feb to Apr 2026', link: '#work-seek', year: '2026', name: 'Seek & Sync', short: 'Frontend & AI Integration · Seek & Sync',
    tech: ['Next.js 14', 'TypeScript', 'Claude Haiku', 'Supabase', 'pgvector'],
    title: 'Frontend Developer & AI Integration', company: 'Seek & Sync HR Consultancy, Abu Dhabi',
    desc: 'Shipped a live HR consultancy platform with Claude Haiku CV parsing, vector matching on Supabase and automated recruiter alerts.',
  },
  {
    time: 'Apr 2025 to Jan 2026', year: '2025', name: 'Bridgeon', short: 'Full Stack Intern · Bridgeon',
    tech: ['Django', 'DRF', 'React', 'AWS EC2', 'Nginx', 'GitHub Actions'],
    title: 'Full Stack Developer Intern', company: 'Bridgeon Solutions LLP, Kerala, India',
    desc: 'Production e-commerce backend in Django REST Framework with JWT, Google OAuth and Firebase auth, deployed on AWS EC2 with Nginx, Gunicorn, SSL and GitHub Actions CI/CD.',
  },
];

// Credential cards under the experience role cards (icon: 'cap' | 'spark'; accent = crimson icon tile).
export const credentials = [
  { key: 'education', icon: 'cap', label: 'Education', date: '2022–2025', title: 'Bachelor’s in Computer Application', sub: 'Calicut University', year: '2022', name: 'Education', short: 'Education · Calicut University' },
  { key: 'programme', icon: 'spark', label: 'Programme', date: '2025', title: 'One Million Prompters', sub: 'Dubai Future Foundation · Selected participant', accent: true, year: '2025', name: 'Programme', short: 'Programme · Dubai Future Foundation' },
];

