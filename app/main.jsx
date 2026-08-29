import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Bot, BriefcaseBusiness, Code2, Users } from 'lucide-react';
import './styles.css';

const pillars=[
 {icon:Code2,title:'Build',text:'Websites, apps and software that make your business work better.'},
 {icon:BriefcaseBusiness,title:'Grow',text:'Content, marketing and lead systems built around measurable growth.'},
 {icon:Bot,title:'Automate',text:'AI, WhatsApp and workflows that take repetitive work off your plate.'},
 {icon:Users,title:'Hire',text:'Smarter sourcing, screening and interviews, powered by HireSense AI.'}
];

function App(){return <main>
 <nav><div className="brand">THE SORTED <span>CLUB</span></div><div className="navlinks"><a href="#services">Services</a><a href="#about">Why Sorted</a><a className="navcta" href="#contact">Get Sorted <ArrowRight size={16}/></a></div></nav>
 <section className="hero"><div className="eyebrow">THE BUSINESS CLUB FOR WHAT'S NEXT</div><h1>Your business.<br/><em>Sorted.</em></h1><p>We build, grow, automate and hire for ambitious businesses. One team. One place. Fewer things left unsorted.</p><div className="actions"><a className="primary" href="#contact">Get Sorted <ArrowRight size={18}/></a><a className="secondary" href="#services">See what we do</a></div><div className="hero-note">Welcome to the club.</div></section>
 <section id="services" className="services"><div className="section-head"><span>01</span><div><p className="eyebrow">WHAT WE SORT</p><h2>Whatever your business needs,<br/>we'll get it sorted.</h2></div></div><div className="grid">{pillars.map(({icon:Icon,title,text})=><article key={title}><Icon size={24}/><h3>{title}</h3><p>{text}</p><a href="#contact">Explore <ArrowRight size={15}/></a></article>)}</div></section>
 <section id="about" className="manifesto"><p className="eyebrow">02 / THE IDEA</p><h2>You bring the problem.<br/><span>We get it sorted.</span></h2><p>Businesses shouldn't need five agencies, ten tools and a small miracle to get things done. The Sorted Club brings technology, growth and people together under one roof.</p></section>
 <section className="club"><div><p className="eyebrow">03 / MEMBERSHIP</p><h2>Join the club.</h2><p>Start with one problem. Stay for everything else we can sort.</p></div><a className="primary" href="#contact">Become a member <ArrowRight size={18}/></a></section>
 <section id="contact" className="contact"><p className="eyebrow">04 / GET STARTED</p><h2>What's not sorted yet?</h2><p>Tell us what you're trying to fix, build or grow. We'll figure out the next move.</p><a className="primary" href="mailto:hello@thesortedclub.com">hello@thesortedclub.com <ArrowRight size={18}/></a></section>
 <footer><div className="brand">THE SORTED CLUB</div><p>Build. Grow. Automate. Hire.</p><small>© 2026 The Sorted Club. Working brand identity.</small></footer>
 </main>}
createRoot(document.getElementById('root')).render(<App/>);
