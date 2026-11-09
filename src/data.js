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
  // Drop a PDF at public/resume.pdf and set this to 'resume.pdf' to show a "Download CV" link.
  resume: null,
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mohammed-fahis-mt' },
    { label: 'GitHub', href: 'https://github.com/Fahis7' },
    { label: 'WhatsApp', href: 'https://wa.me/971542897949' },
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
    metrics: [
      { value: '4', label: 'screening lists' },
      { value: '3', label: 'Postgres roles (RLS)' },
      { value: 'EN · AR', label: 'full RTL support' },
    ],
    stack: ['Django 5.2', 'DRF', 'PostgreSQL 16 + RLS', 'Celery', 'Redis', 'Next.js 16', 'TypeScript', 'Tailwind v4', 'Framer Motion', 'GitHub Actions'],
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
    security: [
      'No CORS: the frontend proxies every API call through Next.js Route Handlers',
      'Access tokens held in memory only; refresh tokens in httpOnly cookies',
      'Migrations run only as the owner database role',
      'Platform-domain writes use a dedicated database role',
      'SSH password authentication disabled in production',
    ],
    testing: [
      'Integration suite against real PostgreSQL, not SQLite',
      'CI pipeline on GitHub Actions',
      'Concurrent threading tests for quota race conditions',
      'Query-count regression tests that block N+1 queries',
    ],
  },
  {
    id: 'zero',
    site: 'zero',
    num: '02',
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
    id: 'propai',
    site: 'propai',
    num: '03',
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
    dots: '3', unit: 'AI products',
    caption: ['AxisKYC, PropAI OS', '& Seek and Sync'],
    groups: [{ label: 'AI / LLM', items: ['Claude (Anthropic)', 'Groq Llama 4 Scout Vision', 'OpenAI GPT-4', 'RAG & pgvector', 'Hugging Face', 'LangChain & prompt engineering'] }],
  },
  {
    key: 'backend', variant: 'context',
    title: ['Backend & Data', 'Multi-tenant by Design'],
    dots: '3', unit: 'DB roles',
    caption: ['Postgres roles behind', 'Row-Level Security'],
    groups: [{ label: 'Backend & data', items: ['Python', 'Django 5 / DRF', 'FastAPI', 'PostgreSQL + RLS', 'Celery + Redis', 'JWT / OAuth2', 'MongoDB / Supabase'] }],
  },
  {
    key: 'ship', variant: 'connections',
    title: ['Frontend & Cloud', 'Shipped End-to-End'],
    dots: '4', unit: 'live',
    caption: ['Products live', 'in production'],
    groups: [
      { label: 'Frontend', items: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind v4', 'Framer Motion', 'i18n / RTL'] },
      { label: 'Cloud / DevOps', items: ['Docker + Compose', 'GitHub Actions', 'Nginx + Gunicorn', 'AWS EC2 / RDS', 'CentOS / Linux', 'Vercel / Railway'] },
    ],
  },
];

/*
  About quotes (sliding carousel). Wrap words in *asterisks* for the italic orange accent.
*/
export const quotes = [
  { text: 'I like being close to the whole product, from the *database role* to the last pixel.', author: 'Mohammed Fahis' },
  { text: 'Security isn’t a feature you add at the end. In AxisKYC it *starts at the database role*.', author: 'Mohammed Fahis' },
  { text: 'AI is only useful when it fits a *real workflow*: a compliance officer’s queue, a tenant’s broken tap, a recruiter’s inbox.', author: 'Mohammed Fahis' },
  { text: 'The *last 10%* is where a product starts to feel finished, so that’s where I spend the extra time.', author: 'Mohammed Fahis' },
  { text: 'If it isn’t tested against a *real database*, it isn’t tested.', author: 'Mohammed Fahis' },
  { text: 'Ship it, watch it, fix it. *Production* is where the real feedback lives.', author: 'Mohammed Fahis' },
];

export const marquee = ['Row-Level Security', 'RAG pipelines', 'Vision AI', 'KYC / AML screening', 'Multi-tenant SaaS', 'Celery workers', 'Arabic + RTL', 'pgvector search', 'CI/CD', 'PDF + QR certificates'];

// Tip: recruiters scan for company names + dates. Add `company` when you can.
export const experience = [
  { time: 'Now · Dubai', title: 'AI Engineer / Full Stack Developer', company: '', desc: 'Building AxisKYC, a multi-tenant KYC/AML compliance platform with Row-Level Security, sanctions screening and an Arabic/English UI, and PropAI OS, a property SaaS with vision-AI triage and a pgvector RAG assistant.' },
  { time: '2025–26', title: 'Independent product builds', company: '', desc: 'Shipped Seek & Sync with Claude CV parsing and recruiter automation, Horologie with triple-layer authentication and live analytics, and the Zero Accounting website.' },
  { time: 'Earlier', title: 'Backend / cloud engineering', company: '', desc: 'Production e-commerce APIs on Django REST Framework, AWS EC2 with Nginx/Gunicorn/SSL, hybrid Supabase and Cloudinary architecture, and automated CI/CD.' },
];
