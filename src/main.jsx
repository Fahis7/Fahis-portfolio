import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {motion, AnimatePresence} from 'framer-motion';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const projects=[
 {num:'01',title:'PropAI OS',kicker:'REAL ESTATE / VISION AI',desc:'A multi-tenant SaaS operating system for Dubai property teams. Four role-based portals, async jobs, five-service Docker orchestration and AI features designed for real production workflows.',stack:['Django 5','React 19','PostgreSQL','Groq Vision','pgvector'],demo:'https://propai-os.up.railway.app',github:'https://github.com/Fahis7',accent:'violet',metrics:['4 portals','8 JWT roles','5 services']},
 {num:'02',title:'Zero Accounting',kicker:'ACCOUNTING / BUSINESS AUTOMATION',desc:'A modern accounting and business services experience built to make financial operations feel clear, credible and effortless — from service discovery to conversion.',stack:['Next.js','TypeScript','Tailwind CSS','Modern UI','Responsive UX'],demo:'https://zeroaccounting.ae/',github:'https://github.com/Fahis7',accent:'mint',metrics:['Live website','Service-led UX','Responsive build']},
 {num:'03',title:'Seek & Sync',kicker:'HR / AI RECRUITING',desc:'A live Abu Dhabi consultancy platform where CV intelligence, semantic matching and recruiter automation turn applicant uploads into actionable workflows.',stack:['React','Django','Claude Haiku','pgvector','Resend'],demo:'https://seek-and-sync.netlify.app/',github:'https://github.com/Fahis7',accent:'cyan',metrics:['AI CV parser','Semantic match','Auto alerts']},
 {num:'04',title:'Horologie',kicker:'LUXURY COMMERCE / ANALYTICS',desc:'A premium e-commerce engine for luxury timepieces combining strong authentication, optimized media delivery and live operational analytics.',stack:['Django','DRF','Firebase MFA','Cloudinary','PostgreSQL'],demo:'https://horologiee.vercel.app/',github:'https://github.com/Fahis7',accent:'amber',metrics:['Triple MFA','CDN media','Live analytics']}
];

const skills={
 '01 AI / LLM':['Groq Llama 4 Scout Vision','Claude AI (Anthropic Haiku)','OpenAI GPT-4','RAG Pipelines & pgvector','Hugging Face Transformers','LangChain & Prompt Engineering'],
 '02 Backend':['Python','Django 5','Django REST Framework','FastAPI','JWT / OAuth2','Celery + Redis','PostgreSQL / MongoDB / Supabase'],
 '03 Frontend':['React 19','Next.js 14','TypeScript','Tailwind CSS','Recharts / Chart.js','Redux / Context API'],
 '04 Cloud / DevOps':['AWS EC2 / RDS','Docker + Compose','Nginx + Gunicorn','Cloudflare','GitHub Actions','Railway / Render / Netlify']
};

const techs=[
 ['React','react','61DAFB'],['Python','python','3776AB'],['JavaScript','javascript','F7DF1E'],['TypeScript','typescript','3178C6'],['Node.js','nodedotjs','5FA04E'],['Django','django','44B78B'],['Tailwind','tailwindcss','06B6D4'],['PostgreSQL','postgresql','4169E1'],['Docker','docker','2496ED'],['AWS','amazonaws','FF9900'],['Git','git','F05032'],['OpenAI','openai','111111']
];

function useReveal(){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const ctx=gsap.context(()=>{gsap.fromTo(el,{y:60,opacity:0},{y:0,opacity:1,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}})},el);return()=>ctx.revert()},[]);return ref;
}
function Magnetic({children,className='',href,onClick,type='button',target}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el||window.matchMedia('(pointer:coarse)').matches)return;const move=e=>{const r=el.getBoundingClientRect();gsap.to(el,{x:(e.clientX-(r.left+r.width/2))*.12,y:(e.clientY-(r.top+r.height/2))*.12,duration:.3,ease:'power3.out'})};const leave=()=>gsap.to(el,{x:0,y:0,duration:.5,ease:'elastic.out(1,.5)'});el.addEventListener('mousemove',move);el.addEventListener('mouseleave',leave);return()=>{el.removeEventListener('mousemove',move);el.removeEventListener('mouseleave',leave)}},[]);
 if(onClick)return <button ref={ref} type={type} className={'magnetic '+className} onClick={onClick}>{children}</button>;
 return <a ref={ref} className={'magnetic '+className} href={href} target={target} rel={target==='_blank'?'noreferrer':undefined}>{children}</a>;
}
function Cursor(){
 const dot=useRef(null),ring=useRef(null);
 useEffect(()=>{if(window.matchMedia('(pointer:coarse)').matches)return;const d=dot.current,r=ring.current;const onMove=e=>{gsap.to(d,{x:e.clientX,y:e.clientY,duration:.1});gsap.to(r,{x:e.clientX,y:e.clientY,duration:.45,ease:'power3.out'});document.documentElement.style.setProperty('--mx',`${e.clientX}px`);document.documentElement.style.setProperty('--my',`${e.clientY}px`)};const hover=e=>r.classList.toggle('is-hover',Boolean(e.target.closest('a,button,.project-card,.float-tech')));window.addEventListener('mousemove',onMove);window.addEventListener('mouseover',hover);return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseover',hover)}},[]);
 return <><div className="cursor-dot" ref={dot}/><div className="cursor-ring" ref={ring}/></>;
}
function Noise(){return <div className="noise"/>;}
function ThemeToggle({theme,setTheme}){
 const isLight=theme==='light';
 return <Magnetic className="theme-toggle" onClick={()=>setTheme(isLight?'dark':'light')} aria-label="Toggle color theme"><span className="theme-icon">{isLight?'☀':'◐'}</span><span>{isLight?'Light':'Dark'}</span></Magnetic>;
}

function TechParticles(){
 const field=useRef(null);
 useEffect(()=>{
  const root=field.current; if(!root) return;
  const nodes=Array.from(root.querySelectorAll('.tech-particle'));
  nodes.forEach((el,i)=>{
   gsap.set(el,{xPercent:-50,yPercent:-50,rotation:gsap.utils.random(-16,16),scale:gsap.utils.random(.72,1.16),opacity:gsap.utils.random(.28,.72)});
   gsap.to(el,{x:gsap.utils.random(-170,170),y:gsap.utils.random(-110,110),duration:gsap.utils.random(7,13),repeat:-1,yoyo:true,ease:'sine.inOut',delay:-gsap.utils.random(0,8)})
   gsap.to(el,{rotate:gsap.utils.random(-10,10),duration:gsap.utils.random(4,8),repeat:-1,yoyo:true,ease:'sine.inOut',delay:-gsap.utils.random(0,5)})
  });
 },[]);
 return <div className="tech-particle-field" ref={field} aria-hidden="true">
  {techs.map(([name,slug,color],i)=><div className="tech-particle" key={name} style={{'--i':i,'--px':`${12+(i*17)%78}%`,'--py':`${16+(i*23)%66}%`}}>
   <span className="particle-glyph"><img src={`https://cdn.simpleicons.org/${slug}/${color}`} alt=""/></span><span className="mono">{name}</span>
  </div>)}
 </div>
}
function App(){
 const [menu,setMenu]=useState(false),[active,setActive]=useState(0),[theme,setTheme]=useState(()=>localStorage.getItem('fahis-theme')||'dark');
 const hero=useRef(null);
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('fahis-theme',theme);const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',theme==='light'?'#f6f5ef':'#07070a')},[theme]);
 useEffect(()=>{
   const lenis=new Lenis({autoRaf:false,lerp:.09,smoothWheel:true});let rafId;const raf=t=>{lenis.raf(t);ScrollTrigger.update();rafId=requestAnimationFrame(raf)};rafId=requestAnimationFrame(raf);
   const ctx=gsap.context(()=>{gsap.from('.hero-kicker',{y:28,opacity:0,duration:.8,delay:.15});gsap.from('.hero-title .line',{yPercent:115,opacity:0,duration:1.15,stagger:.08,ease:'power4.out',delay:.25});gsap.from('.hero-copy,.hero-actions,.hero-meta',{y:22,opacity:0,duration:.8,stagger:.08,ease:'power3.out',delay:.75});gsap.to('.orbit-a',{rotate:360,duration:30,repeat:-1,ease:'none'});gsap.to('.orbit-b',{rotate:-360,duration:46,repeat:-1,ease:'none'});gsap.to('.hero-sphere',{y:-22,rotate:6,duration:4.5,repeat:-1,yoyo:true,ease:'sine.inOut'});gsap.to('.hero-pulse',{scale:1.08,opacity:.68,duration:2.6,repeat:-1,yoyo:true,ease:'sine.inOut'});gsap.to('.hero-signal-card',{y:-120,rotate:-6,scrollTrigger:{trigger:hero.current,start:'top top',end:'bottom top',scrub:1}});gsap.to('.hero-title',{y:70,opacity:.18,scale:.94,scrollTrigger:{trigger:hero.current,start:'top top',end:'bottom top',scrub:1.1}});gsap.to('.hero-rail-progress',{scaleY:1,scrollTrigger:{trigger:hero.current,start:'top top',end:'bottom top',scrub:1,transformOrigin:'top center'}});gsap.utils.toArray('.section').forEach((section,i)=>{gsap.to(section,{backgroundPosition:`${50+i*5}% ${30+i*7}%`,scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:1}})});
 },hero);return()=>{ctx.revert();cancelAnimationFrame(rafId);lenis.destroy()}},[]);
 const revealAbout=useReveal(),revealSkills=useReveal(),revealProjects=useReveal(),revealExperience=useReveal(),revealContact=useReveal();
 const closeMenu=()=>setMenu(false);
 return <div className="app"><Cursor/><Noise/><div className="ambient"/>
  <header className={'nav '+(menu?'open':'')}><a href="#home" className="brand" onClick={closeMenu}>MF<span>®</span></a><nav>{['about','skills','projects','experience','contact'].map(x=><a key={x} href={'#'+x} onClick={closeMenu}>{x}</a>)}</nav><div className="nav-tools"><ThemeToggle theme={theme} setTheme={setTheme}/><Magnetic className="nav-cta" href="mailto:muhdfahis.aidev@gmail.com">Let’s talk ↗</Magnetic></div><button className="menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu" aria-expanded={menu}><span/><span/></button></header>
  {menu&&<div className="mobile-nav"><div className="mobile-nav-grid">{['about','skills','projects','experience','contact'].map((x,i)=><a key={x} href={'#'+x} onClick={closeMenu}><span>0{i+1}</span>{x}<b>↗</b></a>)}<ThemeToggle theme={theme} setTheme={setTheme}/></div></div>}
  <main>
   <section id="home" className="hero" ref={hero}><div className="gridline"/><div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/><div className="hero-glow"/><TechParticles/><div className="hero-signal-stage" aria-hidden="true"><div className="hero-signal-card back"><span className="mono">/build</span><b>99.9%</b><small>ship confidence</small></div><div className="hero-signal-card mid"><span className="mono">AI / SYSTEMS</span><div className="signal-lines"><i/><i/><i/><i/></div><small className="mono">RAG · VISION · PRODUCT</small></div><div className="hero-signal-card front"><div className="signal-top"><span className="pulse"/>LIVE BUILD</div><strong>MF<span>.</span></strong><div className="signal-track"><i/><b/><em/></div><small className="mono">FROM IDEA → PRODUCTION</small></div></div><div className="hero-rail-progress" aria-hidden="true"/>
    <div className="hero-content wrap"><div className="hero-kicker mono"><span className="pulse"/> AI ENGINEER / FULL STACK DEVELOPER <span>DXB — UAE</span></div>
     <div className="hero-label mono"><span>SELECTED WORK / SYSTEMS / AI</span><span>00 — INTRO</span></div>
     <h1 className="hero-title"><span className="line">MOHAMMED</span><span className="line accent-word">FAHIS<span className="year">AI · FS · 2026</span></span></h1>
     <div className="hero-bottom"><div><p className="hero-copy">I build intelligent products from blank screen to production — shipping SaaS, RAG systems and vision-AI workflows for real businesses.</p><div className="hero-meta mono"><span><i/> Available for ambitious builds</span><span>Dubai · Remote · Hybrid</span></div></div><div className="hero-actions"><Magnetic className="button solid" href="#projects">Explore work <span>↘</span></Magnetic><Magnetic className="button ghost" href="#contact">Start a conversation <span>↗</span></Magnetic></div></div>
    </div><div className="hero-bottom-rail wrap"><span className="mono">SCROLL TO EXPLORE <b>↓</b></span><span className="mono">AI × PRODUCT × ENGINEERING</span><span className="mono">01 / 06</span></div>
   </section>

   <section id="about" className="section about wrap" ref={revealAbout}><div className="section-head"><span className="eyebrow mono">01 — PROFILE</span><span className="head-note mono">THE PERSON BEHIND THE BUILD</span></div><div className="about-grid"><h2 className="display">A developer who <em>ships</em>,<br/>not just codes.</h2><div className="about-copy"><p>I’m an AI Engineer and Full Stack Developer based in Dubai. My work lives where product engineering meets applied AI: authentication, data architecture, model orchestration, deployment, and the last 10% that makes a product feel finished.</p><p>My flagship build is <strong>PropAI OS</strong> — a multi-tenant property platform with vision triage, RAG concierge and market pricing. Alongside it, I’ve shipped HR automation and luxury commerce products end-to-end.</p><p className="availability"><span/> Available for ambitious teams — Dubai / remote / hybrid.</p></div></div><div className="about-marquee"><span>FROM IDEA</span><b>→</b><span>ARCHITECTURE</span><b>→</b><span>AI SYSTEMS</span><b>→</b><span>PRODUCTION</span><b>→</b><span>REPEAT</span></div></section>

   <section id="skills" className="section skills-section skills-universe wrap" ref={revealSkills}>
    <div className="section-head"><span className="eyebrow mono">02 — TECH STACK</span><span className="head-note mono">INTELLIGENCE / BACKEND / FRONTEND / INFRASTRUCTURE</span></div>
    <div className="skills-universe-head"><div className="section-chip mono">TECHNICAL UNIVERSE / LIVE STACK</div>
      <div>
        <div className="display medium">I work across the <em>whole</em> stack.</div>
        <p className="skills-lead">A connected toolkit for turning ideas into intelligent products — from model orchestration and APIs to polished interfaces and production infrastructure.</p>
      </div>
      <div className="skills-status mono"><span className="status-pulse"/> SYSTEM ONLINE <b>04 DOMAINS</b></div>
    </div>
    <div className="stack-constellation">
      <div className="constellation-grid" aria-hidden="true"/>
      <div className="constellation-halo halo-a" aria-hidden="true"/><div className="constellation-halo halo-b" aria-hidden="true"/>
      <div className="constellation-center">
        <span className="center-kicker mono">MOHAMMED FAHIS</span><strong>FULL<br/><em>STACK</em></strong><small>AI · PRODUCT · SYSTEMS</small><div className="center-orbit"/>
      </div>
      {Object.keys(skills).map((group,i)=>{
        const key=['ai','backend','frontend','cloud'][i];
        const domain=group.split(' ').slice(1).join(' ');
        return <div className={`domain-cluster cluster-${key}`} key={group}>
          <div className="domain-core"><span className="domain-index mono">{group.split(' ')[0]}</span><b>{domain}</b><span className="domain-arrow">↗</span></div>
          <div className="domain-nodes">{skills[group].map((item,j)=><motion.span key={item} className="domain-node" initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.5}} transition={{delay:.06*j+.12*i,duration:.45}}>{item}</motion.span>)}</div>
        </div>
      })}
      <svg className="constellation-lines" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true"><path d="M500 325 C360 245 250 190 150 150"/><path d="M500 325 C640 245 750 190 850 150"/><path d="M500 325 C340 420 245 500 150 525"/><path d="M500 325 C660 420 760 500 850 525"/></svg>
    </div>
    <div className="stack-domains-grid">
      {Object.entries(skills).map(([group,items],i)=><motion.article className={`stack-domain-card domain-card-${i}`} key={group} whileHover={{y:-8, rotateX:1.5, rotateY:i%2? -1.5:1.5}} transition={{type:'spring',stiffness:220,damping:18}}>
        <div className="skill-card-particles" aria-hidden="true">{Array.from({length:14},(_,p)=><span key={p} style={{'--sx':`${8+(p*19+i*7)%84}%`,'--sy':`${10+(p*31+i*11)%78}%`,'--sd':`${(p%5)*.7}s`}}/>)}</div>
        <div className="skill-card-aura" aria-hidden="true"/>
        <div className="domain-card-top"><span className="mono">{group.split(' ')[0]}</span><small className="mono">{['INTELLIGENCE','SYSTEMS','EXPERIENCE','INFRA'][i]}</small></div>
        <h3>{group.slice(3)}</h3>
        <div className="domain-card-items">{items.map(item=><span key={item}>{item}</span>)}</div>
        <div className="domain-card-foot mono">{items.length} technologies <b>↗</b></div>
      </motion.article>)}
    </div>
   </section>

   <section id="projects" className="section projects-showcase wrap" ref={revealProjects}>
    <div className="section-head"><span className="eyebrow mono">03 — SELECTED WORK</span><span className="head-note mono">SYSTEMS I’VE BUILT END-TO-END</span></div>
    <div className="projects-intro"><div><div className="section-chip mono">LIVE / INTERACTIVE</div><h2 className="display medium">Four builds.<br/><em>One obsession.</em></h2></div><p>Real products with real constraints — AI workflows, polished interfaces, production infrastructure, and the details between them.</p></div>
    <div className="project-feature-wrap">
      <div className="project-feature-art" data-accent={projects[active].accent}>
        <div className="project-noise"/><div className="project-grid"/><div className="project-orbit orbit-1"/><div className="project-orbit orbit-2"/>
        <div className="project-art-label mono"><span>CASE STUDY</span><b>{projects[active].num} / 04</b></div>
        <div className="project-dashboard"><div className="dash-top mono"><span>LIVE SYSTEM</span><i/> <span>{projects[active].title}</span></div><div className="dash-bars"><span/><span/><span/><span/><span/></div><div className="dash-core"><strong>{projects[active].num}</strong><small>BUILD</small></div><div className="dash-footer mono"><span>AI</span><span>PRODUCT</span><span>INFRA</span></div></div>
        <div className="project-floating-tag mono">MOVE / HOVER / OPEN ↗</div>
      </div>
      <AnimatePresence mode="wait"><motion.div key={projects[active].title} className="project-feature-copy" initial={{opacity:0,x:36}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-24}} transition={{duration:.45,ease:[.22,1,.36,1]}}>
        <div className="project-feature-meta mono"><span>{projects[active].kicker}</span><span>{projects[active].num}</span></div>
        <h3>{projects[active].title}</h3><p>{projects[active].desc}</p>
        <div className="project-metrics">{projects[active].metrics.map(m=><div key={m}><strong>{m}</strong><span>DETAIL</span></div>)}</div>
        <div className="project-stack">{projects[active].stack.map(s=><span key={s}>{s}</span>)}</div>
        <div className="project-actions"><Magnetic className="button solid" href={projects[active].demo} target="_blank">Open live project <span>↗</span></Magnetic><Magnetic className="button ghost" href={projects[active].github} target="_blank">View GitHub <span>↗</span></Magnetic></div>
      </motion.div></AnimatePresence>
    </div>
    <div className="project-selector">{projects.map((p,i)=><button key={p.num} className={i===active?'is-active':''} onClick={()=>setActive(i)}><span className="mono">{p.num}</span><strong>{p.title}</strong><small>{p.kicker}</small><i>↗</i></button>)}</div>
   </section>

   <section id="experience" className="section experience experience-showcase wrap" ref={revealExperience}>
     <div className="section-head"><span className="eyebrow mono">04 — EXPERIENCE</span><span className="head-note mono">HOW I TURN IDEAS INTO SYSTEMS</span></div>
     <div className="experience-hero"><div><div className="section-chip mono">THE BUILDER'S PATH</div><h2 className="display medium">From first commit<br/>to <em>full ownership.</em></h2></div><p>I like being close to the whole product: translating messy requirements, designing the system underneath, shipping the interface, and staying around until it actually works.</p></div>
     <div className="experience-grid">
       <div className="experience-track"><div className="track-line"/><div className="experience-orbit"/></div>
       <div className="experience-list">
         {[['NOW / DUBAI','01','AI Engineer / Full Stack Developer','Built a multi-tenant property SaaS from system architecture to production. Designed vision-AI maintenance triage, a pgvector RAG assistant, smart pricing and four role-based portals.',['ARCHITECTURE','APPLIED AI','DEPLOYMENT']],['2025—26','02','Independent Product Builds','Shipped Seek & Sync with Claude CV parsing and recruiter automation, plus Horologie with triple-layer authentication, Cloudinary media delivery and live analytics.',['REACT','DJANGO','CLOUD']],['EARLIER','03','Backend / Cloud Engineering','Production e-commerce APIs on Django REST Framework, AWS EC2 with Nginx/Gunicorn/SSL, hybrid Supabase and Cloudinary architecture, and automated CI/CD workflows.',['DRF','AWS','CI/CD']]].map(([time,num,title,desc,tags],i)=><motion.article key={num} className="experience-card" whileHover={{y:-8}} transition={{duration:.35}}><div className="experience-card-top"><span className="time mono">{time}</span><span className="experience-num">{num}</span></div><div className="experience-card-body"><div className="experience-index mono">0{i+1}</div><h3>{title}</h3><p>{desc}</p><div className="micro-tags">{tags.map(t=><span key={t}>{t}</span>)}</div></div><div className="experience-card-glow"/></motion.article>)}
       </div>
     </div>
   </section>

   <section id="contact" className="section contact contact-immersive" ref={revealContact}><div className="contact-mesh" aria-hidden="true"/><div className="wrap contact-wrap"><div className="contact-topline"><div className="eyebrow mono">05 — CONTACT</div><span className="mono">SIGNAL OPEN / 24·7</span></div><div className="contact-grid-layout"><div><div className="contact-kicker mono">LET’S MAKE SOMETHING PEOPLE REMEMBER</div><h2 className="contact-title">Have a problem<br/>worth <em>building?</em></h2><p>Roles, products, AI architecture, collaborations — send me a signal. I’m currently available for on-site, hybrid or remote work in Dubai.</p></div><div className="contact-console"><div className="console-head mono"><span>OUTBOUND SIGNAL</span><span>ENCRYPTED / OPEN</span></div><div className="console-screen"><div className="console-dot"/><span className="mono">hello@fahis.dev</span><strong>READY<br/><em>WHEN YOU ARE.</em></strong><div className="console-wave"><i/><i/><i/><i/><i/><i/><i/><i/></div></div></div></div><div className="contact-actions"><Magnetic className="button giant" href="mailto:muhdfahis.aidev@gmail.com">muhdfahis.aidev@gmail.com <span>↗</span></Magnetic><div className="contact-grid"><a href="https://www.linkedin.com/in/mohammed-fahis-mt" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a><a href="https://github.com/Fahis7" target="_blank" rel="noreferrer">GitHub <span>↗</span></a><a href="https://wa.me/971542897949" target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a></div></div></div><div className="contact-footer wrap mono"><span>MF® — 2026</span><span>BUILT WITH INTENT</span><span>DXB / UAE</span></div></section>
  </main><footer className="footer wrap mono"><span>© 2026 Mohammed Fahis</span><span>FULL STACK / AI / PRODUCT ENGINEERING</span></footer>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
