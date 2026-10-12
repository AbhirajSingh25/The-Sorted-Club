import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  Users,
  Menu,
  X,
  Shield,
  Sparkles,
  Check,
  Clock,
  Laptop,
  ExternalLink,
  ShieldCheck,
  Layers
} from 'lucide-react';
import './styles.css';
import CustomCursor from './components/CustomCursor';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  heroLineReveal,
  staggerContainer,
  TRANSITIONS,
  routeVariants
} from './utils/motion';
import InquiryModal from './components/InquiryModal';
import CaseStudyModal from './components/CaseStudyModal';
import AdminDashboard from './components/AdminDashboard';
import CRMView from './components/CRMView';
import ClientDashboard from './components/ClientDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import PublicProposalView from './components/PublicProposalView';
import PublicContractView from './components/PublicContractView';
import PublicInvoiceView from './components/PublicInvoiceView';
import PublicProjectView from './components/PublicProjectView';
import PublicApprovalView from './components/PublicApprovalView';
import ProjectDashboard from './components/ProjectDashboard';
import CommandCenterView from './components/CommandCenterView';
import ServicesPages from './components/ServicesPages';
import TemplateCatalog from './components/TemplateCatalog';
import TemplateDetail from './components/TemplateDetail';
import TemplateLiveDemo from './components/TemplateLiveDemo';
import { TEMPLATES } from './components/templatesData';
import PricingPage from './components/PricingPage';
import DiscoveryQuestionnaire from './components/DiscoveryQuestionnaire';
import AdminLogin from './components/AdminLogin';
import AdminAccountSettings from './components/AdminAccountSettings';
import MobileAdminShell from './components/mobile/MobileAdminShell';
import ProjectEstimator from './components/ProjectEstimator';
import VanvasFeaturedSection, { VANVAS_CASE_STUDY_DATA } from './components/VanvasFeaturedSection';
import TechStackSection from './components/TechStackSection';
import FounderSection from './components/FounderSection';
import { useIsMobile } from './utils/responsive';
import { getAdminToken, verifyAdminSession, clearAdminAuth } from './api/client';

const pillars = [
  {
    slug: 'build',
    icon: Code2,
    title: 'Build',
    service: 'Website / Build',
    text: 'Websites, apps and software that make your business work better.',
    whoFor: 'Businesses needing high-converting web presences or custom software.',
    deliverables: ['Custom Responsive Web Presences', 'Direct WhatsApp Lead Capture', 'Speed (90+ PageSpeed) & Schema SEO', '100% Client Code & Asset Ownership'],
    priceTag: 'From ₹14,999 ($400)'
  },
  {
    slug: 'grow',
    icon: BriefcaseBusiness,
    title: 'Grow',
    service: 'Marketing / Growth',
    text: 'Content, marketing and lead systems built around measurable growth.',
    whoFor: 'Brands wanting consistent qualified leads, search rank, and high-converting video.',
    deliverables: ['Short-Form Video Production & Scripts', 'Google Maps & Local SEO Domination', 'Meta & Google Ad Campaign Tracking', 'Bi-weekly Strategy Reviews'],
    priceTag: 'From ₹9,999/mo ($270)'
  },
  {
    slug: 'automate',
    icon: Bot,
    title: 'Automate',
    service: 'AI / Automation',
    text: 'AI, WhatsApp and workflows that take repetitive work off your plate.',
    whoFor: 'Founders and teams drowning in manual follow-ups, forms, and disconnected tools.',
    deliverables: ['Instant WhatsApp & Email AI Responders', 'CRM Lead Sync & Stage Assignment', 'Automated Invoicing & Calendar Booking', '30–60 Day Priority Support'],
    priceTag: 'From ₹24,999 ($650)'
  },
  {
    slug: 'hire',
    icon: Users,
    title: 'Hire',
    service: 'Hiring',
    text: 'Smarter sourcing, screening and interviews, powered by HireSense AI.',
    whoFor: 'Growing companies needing qualified engineers, marketers, and operations staff.',
    deliverables: ['Role Scorecard & Technical Sourcing', 'HireSense AI Skill Benchmarking', 'Top 3–5 Pre-Vetted Candidates in 7–10 Days', '90-Day Replacement Guarantee'],
    priceTag: 'Pay on Success'
  }
];

function LandingPage({ onOpenInquiry, onNavigate, onNavigateToAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [caseStudyTemplate, setCaseStudyTemplate] = useState(null);

  const featuredBlueprints = TEMPLATES.filter((t) =>
    ['sanctuary-retreat', 'saffron-and-sage', 'flowgrid-ai'].includes(t.slug)
  );

  const handleScrollToHash = (e, hash) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState({}, '', hash);
    } else {
      onNavigate(`/${hash}`);
    }
  };

  return (
    <main>
      {/* Navigation */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={TRANSITIONS.editorial}
      >
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          THE SORTED <span>CLUB</span>
        </div>

        <button
          className="menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navlinks ${mobileMenuOpen ? 'open' : ''}`}>
          <a
            href="/services"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/services');
            }}
          >
            Services
          </a>
          <a
            href="#work"
            onClick={(e) => handleScrollToHash(e, '#work')}
          >
            Work
          </a>
          <a
            href="#tech"
            onClick={(e) => handleScrollToHash(e, '#tech')}
          >
            Approach
          </a>
          <a
            href="/pricing"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/pricing');
            }}
          >
            Pricing
          </a>
          <a
            href="#founder"
            onClick={(e) => handleScrollToHash(e, '#founder')}
          >
            About
          </a>
          <motion.button
            className="navcta"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquiry({ service: 'Website / Build' });
            }}
          >
            Get in Touch <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="hero">
        <motion.div
          className="hero-orbit orbit-one"
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="hero-orbit orbit-two"
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          THE BUSINESS CLUB FOR WHAT'S NEXT
          <motion.span
            className="live-dot"
            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        >
          Your business.<br />
          <em>Sorted.</em>
        </motion.h1>

        <motion.p
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
        >
          We build, grow, automate and hire for ambitious businesses. One squad. One roof. Zero things left unsorted.
        </motion.p>

        <motion.div
          className="actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.36 }}
        >
          <motion.button
            className="primary"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={(e) => handleScrollToHash(e, '#estimator')}
          >
            Start a Project <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.48 }}
        >
          <div className="hero-note">Welcome to the club.</div>
          <div style={{ color: 'var(--muted)' }}>EST. 2026 — GLOBAL OPERATING COLLECTIVE</div>
        </motion.div>
      </section>

      {/* Marquee Ticker */}
      <div className="ticker">
        <div>
          <span>BUILD</span> • <span>GROW</span> • <span>AUTOMATE</span> • <span>HIRE</span> • <span>CUSTOM SOFTWARE</span> • <span>REVENUE SYSTEMS</span> • <span>AI WORKFLOWS</span> • <span>HIRESENSE</span> • <span>BUILD</span> • <span>GROW</span> • <span>AUTOMATE</span> • <span>HIRE</span>
        </div>
      </div>

      {/* Section 01: Services Section */}
      <motion.section
        id="services"
        className="services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span>01</span>
          <div>
            <p className="eyebrow">WHAT WE SORT</p>
            <h2>
              Whatever your business needs,<br />
              <i>we'll get it sorted.</i>
            </h2>
          </div>
        </motion.div>

        <motion.div className="grid" variants={staggerContainer(0.08, 0.08)}>
          {pillars.map(({ icon: Icon, title, service, text, whoFor, deliverables, priceTag, slug }) => (
            <motion.article
              key={title}
              className="service-card"
              variants={fadeInUp}
              whileHover={{ y: -6, backgroundColor: '#eeece4' }}
              transition={TRANSITIONS.cardSpring}
              data-cursor={`Explore ${title}`}
            >
              <div className="card-top">
                <Icon size={24} />
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--ink)', fontWeight: 700 }}>{priceTag}</span>
                  <span>0{pillars.findIndex((p) => p.title === title) + 1}</span>
                </span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>

              <div style={{ marginTop: '14px', fontSize: '11px', color: '#55534c' }}>
                <strong style={{ color: 'var(--ink)' }}>For: </strong>{whoFor}
              </div>

              <div className="tags" style={{ marginTop: '14px', marginBottom: '18px' }}>
                {deliverables.map((d, i) => (
                  <span key={i}>✓ {d}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                <motion.button
                  type="button"
                  onClick={() => onOpenInquiry({ service })}
                  className="card-cta-link"
                  style={{ color: 'var(--ink)', fontWeight: 700, padding: 0 }}
                  whileHover={{ x: 2 }}
                  transition={TRANSITIONS.buttonSpring}
                >
                  Enquire for {title} <ArrowRight size={14} />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => onNavigate(`/services/${slug}`)}
                  className="card-cta-link"
                  style={{ color: 'var(--muted)', fontSize: '12px', padding: 0, marginLeft: 'auto' }}
                  whileHover={{ x: 2 }}
                  transition={TRANSITIONS.buttonSpring}
                >
                  Details →
                </motion.button>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      {/* Portfolio: Section 02 (VANVAS) & Section 03 (Blueprints) */}
      <div id="work">
        <VanvasFeaturedSection
          onOpenInquiry={onOpenInquiry}
          onOpenCaseStudy={(cs) => setCaseStudyTemplate(cs)}
        />

      {/* Section 03: Selected Blueprints & Work */}
      <motion.section
        className="home-portfolio"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span>03</span>
          <div>
            <p className="eyebrow">SELECTED BLUEPRINTS &amp; ARCHITECTURES</p>
            <h2>
              Live concepts,<br />
              <i>engineered results.</i>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', marginTop: '12px', lineHeight: 1.5 }}>
              Production architectures engineered for speed, conversions, and direct client management. Every concept includes 100% full source code ownership upon launch.
            </p>
          </div>
        </motion.div>

        <motion.div className="home-portfolio-grid" variants={staggerContainer(0.08, 0.08)}>
          {featuredBlueprints.map((template) => (
            <motion.article
              key={template.id}
              className="home-portfolio-card"
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              transition={TRANSITIONS.cardSpring}
              data-cursor={`View ${template.name}`}
            >
              {/* Browser bar */}
              <div className="portfolio-browser-bar">
                <div className="browser-dots">
                  <span className="dot-red" />
                  <span className="dot-amber" />
                  <span className="dot-green" />
                </div>
                <span className="browser-url-pill">thesortedclub.com/blueprints/{template.slug}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)' }}>
                  {template.turnaround}
                </span>
              </div>

              {/* Canvas */}
              <div
                className="portfolio-card-canvas"
                onClick={() => setCaseStudyTemplate(template)}
                style={{ cursor: 'pointer' }}
              >
                <img src={template.heroImage} alt={`${template.name} preview`} loading="lazy" />
                <div className="canvas-badge-strip">
                  <span className="badge-concept">{template.badge}</span>
                  <span className="badge-turnaround">{template.category}</span>
                </div>
              </div>

              {/* Body */}
              <div className="portfolio-card-body">
                <div className="portfolio-card-meta">{template.designStyle} Style</div>
                <h3 className="portfolio-card-title">{template.name}</h3>

                <div className="portfolio-problem-box">
                  <strong>Challenge Solved: </strong>
                  {template.shortDesc}
                </div>

                <ul className="portfolio-scope-bullets">
                  {template.mainFeatures.slice(0, 3).map((feat, idx) => (
                    <li key={idx}>
                      <Check size={13} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="portfolio-card-actions">
                  <button
                    type="button"
                    className="btn-demo"
                    onClick={() => onNavigate(`/demo/${template.slug}`)}
                  >
                    <Laptop size={13} /> Live Demo ↗
                  </button>
                  <button
                    type="button"
                    className="btn-demo"
                    onClick={() => setCaseStudyTemplate(template)}
                  >
                    Case Breakdown
                  </button>
                  <button
                    type="button"
                    className="btn-build"
                    onClick={() => onOpenInquiry({ template })}
                  >
                    Build This →
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Explore All Blueprints CTA */}
        <motion.div
          style={{ textAlign: 'center', marginTop: '48px' }}
          variants={fadeInUp}
        >
          <motion.button
            type="button"
            className="secondary"
            onClick={() => onNavigate('/templates')}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            style={{ fontSize: '14px', padding: '14px 28px' }}
          >
            Browse All 11 Industry Blueprints &amp; Live Demos <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </motion.section>
      </div>

      {/* Section 04: Technology & Capabilities */}
      <TechStackSection onOpenInquiry={onOpenInquiry} />

      {/* Section 05: Interactive Project Cost Estimator */}
      <ProjectEstimator onOpenInquiry={onOpenInquiry} />

      {/* Section 06: The Operating Protocol & Guarantees */}
      <motion.section
        id="protocol"
        className="process-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span>06</span>
          <div>
            <p className="eyebrow">THE OPERATING PROTOCOL</p>
            <h2>
              How it gets sorted.<br />
              <i>Direct sprints. Zero agency fluff.</i>
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', marginTop: '12px', lineHeight: 1.5 }}>
              No 40-page agency decks. No bloated retainers. A battle-tested engineering sprint with a dedicated squad from day one.
            </p>
          </div>
        </motion.div>

        <motion.div className="process-grid" variants={staggerContainer(0.08, 0.08)}>
          {[
            {
              step: '01',
              title: 'Discovery & Fixed Scope',
              desc: 'You bring the problem. We map specifications, agree on fixed pricing, and confirm the delivery date with zero ambiguity.',
              tag: 'Fixed Turnaround'
            },
            {
              step: '02',
              title: 'Rapid Engineering Sprint',
              desc: 'Built on clean, modular code (React, Vite, Vanilla CSS). Zero proprietary page builder lock-in. Engineered for PageSpeed 90+.',
              tag: 'Modern Architecture'
            },
            {
              step: '03',
              title: 'Private Staging Sandbox',
              desc: 'Test your build privately on staging servers across desktop, tablet, and mobile. Two structured review rounds included.',
              tag: 'Client Staging Sign-Off'
            },
            {
              step: '04',
              title: 'Handover & Warranty',
              desc: 'Live production DNS switch, SSL certificate, 100% source code and domain handover, plus 30 to 90 days technical warranty.',
              tag: '100% Code Ownership'
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="process-step-card"
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              transition={TRANSITIONS.cardSpring}
            >
              <div className="step-num">STEP {item.step}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="step-deliverable-tag">✓ {item.tag}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Commercial Guarantees Strip */}
        <motion.div className="process-guarantees-grid" variants={staggerContainer(0.06, 0.08)}>
          {[
            {
              title: '50/50 Milestone Payments',
              desc: 'Pay 50% deposit to start. The remaining 50% balance is due only after you approve the live staging preview.'
            },
            {
              title: '100% Client Code Ownership',
              desc: 'No platform lock-in. Full intellectual property, repository, and asset ownership transferred upon completion.'
            },
            {
              title: 'Staging Sandbox Before DNS',
              desc: 'You test everything privately on our staging domain before anything goes live to the public.'
            },
            {
              title: 'Direct WhatsApp Squad Line',
              desc: 'Communicate directly with the technical squad building your project — no junior account managers or ticket queues.'
            }
          ].map((g, i) => (
            <motion.div
              key={i}
              className="guarantee-item"
              variants={fadeInUp}
              whileHover={{ y: -2 }}
            >
              <div className="guarantee-icon">
                <Check size={16} />
              </div>
              <div>
                <strong>{g.title}</strong>
                <span>{g.desc}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Section 07: Behind The Club — Founder Profile */}
      <FounderSection onOpenInquiry={onOpenInquiry} />

      {/* Section 08: About / Manifesto Section */}
      <motion.section
        id="about"
        className="manifesto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.08)}
      >
        <motion.div className="manifesto-label" variants={fadeInUp}>
          <p className="eyebrow">08 / THE IDEA</p>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <h2>
            You bring the problem.<br />
            <span>We get it sorted.</span>
          </h2>
          <p className="manifesto-copy">
            Businesses shouldn't need five agencies, ten tools and a small miracle to get things done. The Sorted Club brings technology, growth and people together under one roof.
          </p>
          <motion.div className="manifesto-points" variants={staggerContainer(0.06, 0.1)}>
            {['Single Point of Accountability', 'Battle-tested Engineering', 'Rapid Turnaround', 'Transparent Pricing'].map((pt) => (
              <motion.div
                key={pt}
                variants={fadeInUp}
                whileHover={{ scale: 1.04, borderColor: '#555' }}
                transition={TRANSITIONS.buttonSpring}
              >
                ✓ {pt}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Section 09: Membership Section */}
      <motion.section
        className="club"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.05)}
      >
        <motion.div className="club-copy" variants={fadeInUp}>
          <p className="eyebrow">09 / MEMBERSHIP</p>
          <h2>Join the club.</h2>
          <p>Start with one problem. Stay for everything else we can sort.</p>
          <div style={{ marginTop: '24px' }}>
            <motion.button
              className="primary"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onOpenInquiry()}
            >
              Become a member <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="club-card"
          initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, rotate: 2, scale: 1 }}
          viewport={{ once: true }}
          transition={TRANSITIONS.cardSpring}
          whileHover={{ rotate: 0, scale: 1.02, y: -4 }}
          data-cursor="Member Pass"
        >
          <div>
            <div className="club-mark">SORTED<span>*</span></div>
            <div className="club-card-title">MEMBER PASS</div>
          </div>
          <div className="club-card-line" />
          <p>ONE DIRECT BRIEF LINE • DEDICATED SQUAD • UNLIMITED SCALE</p>
          <strong>THE SORTED CLUB 2026</strong>
        </motion.div>
      </motion.section>

      {/* Section 10: Contact Section */}
      <motion.section
        id="contact"
        className="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.05)}
      >
        <motion.div variants={fadeInUp}>
          <p className="eyebrow">10 / GET STARTED</p>
          <h2>What's not sorted yet?</h2>
          <p>Tell us what you're trying to fix, build or grow. We'll figure out the next move.</p>
        </motion.div>

        <motion.div className="contact-actions" variants={fadeInUp}>
          <motion.button
            className="primary dark"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onOpenInquiry()}
            style={{ fontSize: '15px' }}
          >
            Tell us what needs sorting <ArrowRight size={18} />
          </motion.button>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px' }}>
            <motion.a
              href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20your%20BUILD%20services."
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, textDecoration: 'none' }}
              whileHover={{ x: 2 }}
            >
              WhatsApp: +91 9643820888 →
            </motion.a>
            <motion.a
              href="mailto:thesortedclub@gmail.com"
              style={{ fontSize: '13px', color: 'var(--ink)', textDecoration: 'none' }}
              whileHover={{ opacity: 0.7 }}
            >
              thesortedclub@gmail.com
            </motion.a>
          </div>
          <small>Direct access. No sales fluff. Response in &lt; 24 hrs.</small>
        </motion.div>
      </motion.section>

      {/* Case Study Modal */}
      <CaseStudyModal
        isOpen={Boolean(caseStudyTemplate)}
        onClose={() => setCaseStudyTemplate(null)}
        template={caseStudyTemplate}
        onNavigate={onNavigate}
        onOpenInquiry={onOpenInquiry}
      />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          THE SORTED CLUB
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onNavigateToAdmin}
            className="footer-admin-link"
            title="Admin Portal"
          >
            <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Admin Portal
          </button>
        </div>
        <p>
          Build. Grow. Automate. Hire. •{' '}
          <a
            href="/templates"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/templates');
            }}
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Templates &amp; Portfolio
          </a> •{' '}
          <a
            href="/pricing"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/pricing');
            }}
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Services &amp; Pricing
          </a> •{' '}
          <a
            href="/discovery"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/discovery');
            }}
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Discovery Brief
          </a>
        </p>
        <p style={{ textAlign: 'right' }}>
          <a href="mailto:thesortedclub@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
            thesortedclub@gmail.com
          </a> • <a href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20your%20BUILD%20services." target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 9643820888</a>
        </p>
        <small>© 2026 The Sorted Club. All rights reserved. • Blueprints labeled Demo Concept.</small>
      </motion.footer>
    </main>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [inquiryInitialData, setInquiryInitialData] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(Boolean(getAdminToken()));
  const [forceDesktop, setForceDesktop] = useState(false);
  const isMobile = useIsMobile(768);

  // Synchronize route changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Register service worker for PWA & push notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration note:', err);
      });
    }
  }, []);

  // Check admin session if token exists
  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      verifyAdminSession()
        .then(() => setIsAdminAuthenticated(true))
        .catch(() => {
          clearAdminAuth();
          setIsAdminAuthenticated(false);
        });
    } else {
      setIsAdminAuthenticated(false);
    }
  }, []);

  // Handle hash scrolling on path or hash change
  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => {
        const el = document.querySelector(window.location.hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [currentPath]);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    const targetRoute = path.split('#')[0] || '/';
    setCurrentPath(targetRoute);
    if (path.includes('#')) {
      const hash = path.substring(path.indexOf('#'));
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCRM = (stageOrOptions, maybeFollowup) => {
    let url = '/admin/crm';
    if (typeof stageOrOptions === 'string') {
      const params = new URLSearchParams();
      params.set('stage', stageOrOptions);
      if (maybeFollowup) params.set('followup', maybeFollowup);
      url += `?${params.toString()}`;
    } else if (stageOrOptions && typeof stageOrOptions === 'object') {
      const params = new URLSearchParams();
      if (stageOrOptions.stage) params.set('stage', stageOrOptions.stage);
      if (stageOrOptions.followup) params.set('followup', stageOrOptions.followup);
      if (stageOrOptions.selectedLead || stageOrOptions.leadId) {
        params.set('selectedLead', stageOrOptions.selectedLead || stageOrOptions.leadId);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleNavigateToClients = (clientIdOrOptions) => {
    let url = '/admin/clients';
    if (typeof clientIdOrOptions === 'string' || typeof clientIdOrOptions === 'number') {
      url += `?selectedClient=${clientIdOrOptions}`;
    } else if (clientIdOrOptions && typeof clientIdOrOptions === 'object') {
      const params = new URLSearchParams();
      if (clientIdOrOptions.selectedClient || clientIdOrOptions.clientId) {
        params.set('selectedClient', clientIdOrOptions.selectedClient || clientIdOrOptions.clientId);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleNavigateToFinance = (tabOrOptions) => {
    let url = '/admin/finance';
    if (typeof tabOrOptions === 'string') {
      url += `?tab=${tabOrOptions}`;
    } else if (tabOrOptions && typeof tabOrOptions === 'object') {
      const params = new URLSearchParams();
      if (tabOrOptions.tab) params.set('tab', tabOrOptions.tab);
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleNavigateToProjects = (projectIdOrClient, maybeProjectId) => {
    let url = '/admin/projects';
    if (maybeProjectId) {
      url += `?selectedProject=${maybeProjectId}`;
    } else if (typeof projectIdOrClient === 'string' || typeof projectIdOrClient === 'number') {
      url += `?selectedProject=${projectIdOrClient}`;
    } else if (projectIdOrClient && typeof projectIdOrClient === 'object') {
      const params = new URLSearchParams();
      if (projectIdOrClient.selectedProject || projectIdOrClient.projectId) {
        params.set('selectedProject', projectIdOrClient.selectedProject || projectIdOrClient.projectId);
      }
      if (projectIdOrClient.health) {
        params.set('health', projectIdOrClient.health);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleOpenInquiry = (serviceOrOpts = '') => {
    if (typeof serviceOrOpts === 'object' && serviceOrOpts !== null) {
      if (serviceOrOpts.template) {
        setSelectedTemplate(serviceOrOpts.template);
        setSelectedService(serviceOrOpts.service || 'Website / Build');
      } else if (serviceOrOpts.service) {
        setSelectedService(serviceOrOpts.service);
        setSelectedTemplate(null);
      }
      setInquiryInitialData({
        budget: serviceOrOpts.budget,
        problem: serviceOrOpts.problem
      });
    } else if (typeof serviceOrOpts === 'string') {
      setSelectedService(serviceOrOpts);
      setSelectedTemplate(null);
      setInquiryInitialData(null);
    }
    setInquiryModalOpen(true);
  };

  const renderCurrentView = () => {
    // Route: Public Tokenized Proposal View /proposal/{token}
    if (currentPath.startsWith('/proposal/')) {
      const token = currentPath.replace('/proposal/', '').split('?')[0];
      return (
        <PublicProposalView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Contract View /contract/{token}
    if (currentPath.startsWith('/contract/')) {
      const token = currentPath.replace('/contract/', '').split('?')[0];
      return (
        <PublicContractView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Invoice View /invoice/{token}
    if (currentPath.startsWith('/invoice/')) {
      const token = currentPath.replace('/invoice/', '').split('?')[0];
      return (
        <PublicInvoiceView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Customer Project View /project/{token}
    if (currentPath.startsWith('/project/')) {
      const token = currentPath.replace('/project/', '').split('?')[0];
      return (
        <PublicProjectView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Deliverable Approval /project-review/{token}
    if (currentPath.startsWith('/project-review/')) {
      const token = currentPath.replace('/project-review/', '').split('?')[0];
      return (
        <PublicApprovalView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: /admin/crm, /admin/clients, /admin/finance, /admin/projects, and /admin
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      if (!isAdminAuthenticated) {
        return (
          <AdminLogin
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      // Dedicated Mobile-First Admin Experience on mobile devices
      if (isMobile && !forceDesktop) {
        let initialTab = 'home';
        let selLeadId = null;
        let selProjId = null;
        let selClientId = null;
        let selFinanceTab = 'overview';

        const urlParams = new URLSearchParams(window.location.search);

        if (currentPath === '/admin/crm' || currentPath.startsWith('/admin/crm')) {
          initialTab = 'leads';
          selLeadId = urlParams.get('selectedLead') || null;
        } else if (currentPath === '/admin/projects' || currentPath.startsWith('/admin/projects')) {
          initialTab = 'projects';
          selProjId = urlParams.get('selectedProject') || null;
        } else if (currentPath === '/admin/clients' || currentPath.startsWith('/admin/clients')) {
          initialTab = 'clients';
          selClientId = urlParams.get('selectedClient') || null;
        } else if (
          currentPath === '/admin/finance' ||
          currentPath.startsWith('/admin/finance') ||
          currentPath === '/admin/proposals' ||
          currentPath === '/admin/contracts' ||
          currentPath === '/admin/invoices' ||
          currentPath === '/admin/verifications'
        ) {
          initialTab = 'finance';
          selFinanceTab = urlParams.get('tab') || (currentPath.includes('proposals') ? 'proposals' : currentPath.includes('contracts') ? 'contracts' : currentPath.includes('invoices') ? 'invoices' : currentPath.includes('verifications') ? 'verifications' : 'overview');
        } else if (currentPath === '/admin/settings' || currentPath.startsWith('/admin/settings')) {
          initialTab = 'settings';
        } else if (currentPath === '/admin/more') {
          initialTab = 'more';
        }

        return (
          <MobileAdminShell
            initialTab={initialTab}
            initialSelectedLeadId={selLeadId}
            initialSelectedProjectId={selProjId}
            initialSelectedClientId={selClientId}
            initialFinanceTab={selFinanceTab}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToProjects={handleNavigateToProjects}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToTemplates={() => navigateTo('/templates')}
            onSwitchToDesktop={() => setForceDesktop(true)}
            onBackToSite={() => navigateTo('/')}
            onLogout={() => setIsAdminAuthenticated(false)}
          />
        );
      }

      if (currentPath === '/admin/settings' || currentPath.startsWith('/admin/settings')) {
        return (
          <AdminAccountSettings
            onBack={() => navigateTo('/admin')}
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      if (currentPath === '/admin/projects' || currentPath.startsWith('/admin/projects')) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSelectedProject = urlParams.get('selectedProject');
        const selectedProjId = (rawSelectedProject && /^\d+$/.test(rawSelectedProject)) ? rawSelectedProject : null;

        return (
          <ProjectDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onBackToSite={() => navigateTo('/')}
            initialSelectedProjectId={selectedProjId}
          />
        );
      }

      if (
        currentPath === '/admin/finance' ||
        currentPath.startsWith('/admin/finance') ||
        currentPath === '/admin/proposals' ||
        currentPath === '/admin/contracts' ||
        currentPath === '/admin/invoices' ||
        currentPath === '/admin/verifications'
      ) {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const validTabs = ['overview', 'proposals', 'contracts', 'invoices', 'verifications'];
        let defaultTab = 'overview';
        if (typeof tabParam === 'string' && validTabs.includes(tabParam.toLowerCase())) {
          defaultTab = tabParam.toLowerCase();
        } else if (currentPath.includes('proposals')) {
          defaultTab = 'proposals';
        } else if (currentPath.includes('contracts')) {
          defaultTab = 'contracts';
        } else if (currentPath.includes('invoices')) {
          defaultTab = 'invoices';
        } else if (currentPath.includes('verifications')) {
          defaultTab = 'verifications';
        }

        return (
          <FinanceDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
            initialTab={defaultTab}
          />
        );
      }

      if (currentPath === '/admin/clients' || currentPath.startsWith('/admin/clients')) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSelectedClient = urlParams.get('selectedClient');
        const selectedClientId = (rawSelectedClient && /^\d+$/.test(rawSelectedClient)) ? rawSelectedClient : null;

        return (
          <ClientDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
            initialSelectedClientId={selectedClientId}
          />
        );
      }

      if (currentPath === '/admin/crm' || currentPath.startsWith('/admin/crm')) {
        return (
          <CRMView
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToAdmin={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      if (currentPath === '/admin/command-center' || currentPath.startsWith('/admin/command-center')) {
        return (
          <CommandCenterView
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      return (
        <AdminDashboard
          onLogout={() => setIsAdminAuthenticated(false)}
          onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
          onNavigateToInquiries={() => navigateTo('/admin')}
          onNavigateToCRM={handleNavigateToCRM}
          onNavigateToClients={handleNavigateToClients}
          onNavigateToFinance={handleNavigateToFinance}
          onNavigateToProjects={handleNavigateToProjects}
          onNavigateToSettings={() => navigateTo('/admin/settings')}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Fullscreen Interactive Template Live Demo (/demo/:slug)
    if (currentPath.startsWith('/demo/')) {
      const slug = currentPath.replace('/demo/', '').split('?')[0];
      return (
        <TemplateLiveDemo
          slug={slug}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
        />
      );
    }

    // Route: Individual Template Detail Page (/templates/:slug)
    if (currentPath.startsWith('/templates/') && currentPath !== '/templates') {
      const slug = currentPath.replace('/templates/', '').split('?')[0];
      return (
        <TemplateDetail
          slug={slug}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onNavigateToAdmin={() => navigateTo('/admin')}
        />
      );
    }

    // Route: Website Templates Catalogue Gallery (/templates or /portfolio)
    if (
      currentPath === '/templates' ||
      currentPath.startsWith('/templates') ||
      currentPath === '/portfolio' ||
      currentPath.startsWith('/portfolio')
    ) {
      return (
        <TemplateCatalog
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onNavigateToAdmin={() => navigateTo('/admin')}
        />
      );
    }

    // Route: Website Packages & Pricing Matrix (/pricing)
    if (currentPath === '/pricing' || currentPath.startsWith('/pricing/')) {
      return (
        <PricingPage
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Interactive Client Discovery Questionnaire (/discovery)
    if (currentPath === '/discovery' || currentPath.startsWith('/discovery/')) {
      return (
        <DiscoveryQuestionnaire
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
        />
      );
    }

    // Route: Direct Outreach Landing (/build) & Productized Services Pages (/services, /services/build, ...)
    if (currentPath === '/build' || currentPath.startsWith('/build/') || currentPath === '/services' || currentPath.startsWith('/services/')) {
      const effectivePath = currentPath === '/build' || currentPath.startsWith('/build/') ? '/services/build' : currentPath;
      return (
        <ServicesPages
          currentPath={effectivePath}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Default Route: Landing Page
    return (
      <LandingPage
        onOpenInquiry={handleOpenInquiry}
        onNavigate={navigateTo}
        onNavigateToAdmin={() => navigateTo('/admin')}
      />
    );
  };

  const isMobileAdminRoute =
    isMobile &&
    !forceDesktop &&
    (currentPath === '/admin' || currentPath.startsWith('/admin'));

  return (
    <>
      <CustomCursor />
      {isMobileAdminRoute ? (
        renderCurrentView()
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            variants={routeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      )}

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialService={selectedService || 'Website / Build'}
        initialTemplate={selectedTemplate}
        initialData={inquiryInitialData}
      />
    </>
  );
}

// Register PWA Service Worker safely (Never cache admin dynamic API)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(<App />);
