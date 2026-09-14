import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  X,
  Menu,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Calendar,
  Layers,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { WEBSITE_PACKAGES, PRICING_COMPARISON_FEATURES, PRICING_FAQS } from './pricingData';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  TRANSITIONS,
  accordionVariants
} from '../utils/motion';

export default function PricingPage({
  onNavigate = () => {},
  onOpenInquiry = () => {},
  onBackToSite = () => {}
}) {
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const filteredPackages = WEBSITE_PACKAGES.filter((pkg) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'standard') return ['starter', 'business'].includes(pkg.id);
    if (activeFilter === 'transactional') return ['leadgen', 'ecommerce', 'booking'].includes(pkg.id);
    if (activeFilter === 'custom') return pkg.id === 'custom';
    return true;
  });

  return (
    <div className="pricing-page-root">
      {/* Public Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={TRANSITIONS.editorial}
      >
        <div
          className="brand"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('/')}
        >
          THE SORTED <span>CLUB</span>
        </div>

        <button
          className="menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navlinks ${mobileMenuOpen ? 'open' : ''}`}>
          <motion.button
            type="button"
            className="nav-sublink"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/services');
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Services
          </motion.button>
          <motion.button
            type="button"
            className="nav-sublink"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/templates');
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Templates &amp; Portfolio
          </motion.button>
          <motion.button
            type="button"
            className="nav-sublink active"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/pricing');
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Pricing
          </motion.button>
          <motion.button
            type="button"
            className="nav-sublink"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/discovery');
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Discovery Brief
          </motion.button>
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

      {/* Hero Section */}
      <motion.section
        className="hero"
        style={{ padding: '70px 20px 40px' }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div
          className="hero-orbit orbit-one"
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div className="eyebrow" variants={fadeInUp}>
          TRANSPARENT COMMERCIAL PACKAGES — ZERO HIDDEN FEES
          <motion.span
            className="live-dot"
            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
        <motion.h1 style={{ fontSize: 'clamp(34px, 5.5vw, 64px)' }} variants={fadeInUp}>
          Transparent website pricing.<br />
          <em>Built to scale.</em>
        </motion.h1>
        <motion.p className="hero-copy" style={{ maxWidth: '640px' }} variants={fadeInUp}>
          Fixed-price packages engineered for speed, conversion, and zero vendor lock-in. 50% upfront, 50% on live sign-off.
        </motion.p>

        {/* Currency Toggle & Action Bar */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '24px 0 12px', flexWrap: 'wrap' }}
          variants={fadeInUp}
        >
          <div className="currency-toggle-container">
            <button
              type="button"
              className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
              onClick={() => setCurrency('INR')}
            >
              INR (₹)
            </button>
            <button
              type="button"
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
            >
              USD ($)
            </button>
          </div>

          <motion.button
            type="button"
            className="secondary"
            style={{ fontSize: '13px', height: '36px', padding: '0 16px' }}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onNavigate('/discovery')}
          >
            <FileText size={14} style={{ marginRight: '6px' }} /> Fill Discovery Questionnaire
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Free Website Consultation Banner */}
      <motion.section
        style={{ maxWidth: '1180px', margin: '0 auto 40px', padding: '0 20px' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="consultation-banner-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <motion.div
              className="consultation-pulse-icon"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles size={20} color="var(--ink)" />
            </motion.div>
            <div>
              <h3 style={{ font: '700 18px "Space Grotesk"', margin: 0, color: 'var(--ink)' }}>
                Not sure which package is right for your business?
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                Get a free 20-minute technical consultation. We'll recommend the ideal blueprint, pages, and timeline.
              </p>
            </div>
          </div>
          <motion.button
            type="button"
            className="primary"
            style={{ background: 'var(--acid)', color: '#10100f', height: '42px', padding: '0 20px', fontSize: '13px', whiteSpace: 'nowrap' }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onOpenInquiry({ service: 'Website / Build' })}
          >
            Request Free Consultation <ArrowRight size={14} />
          </motion.button>
        </div>
      </motion.section>

      {/* Filter Tabs */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 30px', padding: '0 20px' }}>
        <div className="pricing-filter-tabs">
          <motion.button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            All 6 Packages
          </motion.button>
          <motion.button
            type="button"
            className={`filter-pill ${activeFilter === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveFilter('standard')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Starter &amp; Business
          </motion.button>
          <motion.button
            type="button"
            className={`filter-pill ${activeFilter === 'transactional' ? 'active' : ''}`}
            onClick={() => setActiveFilter('transactional')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Lead-Gen, Storefront &amp; Booking
          </motion.button>
          <motion.button
            type="button"
            className={`filter-pill ${activeFilter === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveFilter('custom')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Custom Architecture
          </motion.button>
        </div>
      </section>

      {/* 6 Packages Grid */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 70px', padding: '0 20px' }}>
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.06, 0.05)}
        >
          {filteredPackages.map((pkg) => {
            const priceDisplay = currency === 'INR' ? pkg.priceINR : pkg.priceUSD;

            return (
              <motion.div
                key={pkg.id}
                className={`pricing-card-box ${pkg.popular ? 'highlighted' : ''}`}
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: '0 24px 48px -12px rgba(16, 16, 15, 0.14)' }}
                transition={TRANSITIONS.cardSpring}
              >
                {pkg.badge && (
                  <span className={`pricing-card-badge ${pkg.popular ? 'popular' : ''}`}>
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <h3 style={{ font: '700 22px "Space Grotesk"', margin: '0 0 6px', color: 'var(--ink)' }}>
                    {pkg.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', minHeight: '38px', margin: '0 0 16px', lineHeight: 1.4 }}>
                    {pkg.tagline}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ font: '700 34px "Space Grotesk"', color: 'var(--ink)' }}>
                      {priceDisplay}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {pkg.id === 'custom' ? '' : 'fixed price'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                    <Clock size={13} /> {pkg.deliveryTime} Turnaround
                  </div>

                  {/* Suitable For */}
                  <div style={{ background: '#faf9f5', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px 14px', marginBottom: '18px' }}>
                    <label className="section-subtitle" style={{ fontSize: '10px', marginBottom: '4px' }}>SUITABLE BUSINESSES</label>
                    <p style={{ fontSize: '12px', color: 'var(--ink)', margin: 0, lineHeight: 1.45 }}>
                      {pkg.suitableFor}
                    </p>
                  </div>

                  {/* Included Pages */}
                  <div style={{ marginBottom: '18px' }}>
                    <label className="section-subtitle" style={{ fontSize: '10px', marginBottom: '8px' }}>
                      INCLUDED PAGES ({pkg.includedPages.length})
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pkg.includedPages.map((page, pIdx) => (
                        <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--ink)' }}>
                          <Check size={13} color="#15803d" />
                          <span>{page}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginBottom: '18px' }}>
                    <label className="section-subtitle" style={{ fontSize: '10px', marginBottom: '8px' }}>KEY CAPABILITIES</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--ink)' }}>
                          <CheckCircle2 size={14} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Not Included Transparent Callout */}
                  <div style={{ borderTop: '1px dashed var(--line)', paddingTop: '14px', marginBottom: '18px' }}>
                    <label className="section-subtitle" style={{ fontSize: '10px', color: '#991b1b', marginBottom: '6px' }}>NOT INCLUDED</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {pkg.notIncluded.map((item, nIdx) => (
                        <div key={nIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '11px', color: '#78716c' }}>
                          <span style={{ color: '#dc2626', fontWeight: 700 }}>✕</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms & Revision Limits */}
                  <div style={{ fontSize: '11px', color: 'var(--muted)', background: '#fff', border: '1px solid var(--line)', borderRadius: '6px', padding: '10px 12px', marginBottom: '20px' }}>
                    <div><strong>Revisions:</strong> {pkg.revisionLimit}</div>
                    <div style={{ marginTop: '4px' }}><strong>Terms:</strong> {pkg.paymentTerms}</div>
                  </div>
                </div>

                <div>
                  <motion.button
                    type="button"
                    className="primary"
                    style={{
                      width: '100%',
                      height: '44px',
                      fontSize: '13px',
                      background: pkg.popular ? 'var(--acid)' : '#10100f',
                      color: pkg.popular ? '#10100f' : '#fff'
                    }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={TRANSITIONS.buttonSpring}
                    onClick={() => onOpenInquiry({ service: `Website / Build — ${pkg.name}` })}
                  >
                    Select {pkg.name} <ArrowRight size={14} />
                  </motion.button>

                  {pkg.recommendedTemplate && (
                    <motion.button
                      type="button"
                      className="card-cta-link"
                      style={{ width: '100%', textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--muted)', display: 'block' }}
                      whileHover={{ x: 3 }}
                      onClick={() => onNavigate(`/templates/${pkg.recommendedTemplate}`)}
                    >
                      View Blueprint Example →
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Detailed Feature Comparison Table */}
      <motion.section
        style={{ maxWidth: '1180px', margin: '0 auto 80px', padding: '0 20px' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div style={{ textAlign: 'center', marginBottom: '36px' }} variants={fadeInUp}>
          <label className="section-subtitle">FULL SPECIFICATION</label>
          <h2 style={{ font: '700 32px "Space Grotesk"', margin: '4px 0 0' }}>
            Feature Comparison Matrix
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '6px auto 0', maxWidth: '560px' }}>
            Compare specifications, delivery timelines, and technical capabilities side-by-side.
          </p>
        </motion.div>

        <motion.div className="comparison-table-wrapper" variants={fadeInUp}>
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Feature Area</th>
                <th>Starter</th>
                <th>Business</th>
                <th>Lead-Gen</th>
                <th>E-Commerce</th>
                <th>Booking</th>
                <th>Custom</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_COMPARISON_FEATURES.map((cat, cIdx) => (
                <React.Fragment key={cIdx}>
                  <tr className="category-header-row">
                    <td colSpan={7}>{cat.category}</td>
                  </tr>
                  {cat.features.map((feat, fIdx) => (
                    <tr key={fIdx}>
                      <td className="feature-name-cell">{feat.name}</td>
                      <td>{feat.starter}</td>
                      <td><strong>{feat.business}</strong></td>
                      <td>{feat.leadgen}</td>
                      <td>{feat.ecommerce}</td>
                      <td>{feat.booking}</td>
                      <td>{feat.custom}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.section>

      {/* Discovery Intake Flow Callout */}
      <motion.section
        style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 20px' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div className="discovery-callout-card" variants={fadeInUp}>
          <div style={{ maxWidth: '580px' }}>
            <span className="client-code-tag" style={{ background: 'var(--acid)', color: '#10100f', marginBottom: '12px', display: 'inline-block' }}>
              STEP 1: DISCOVERY QUESTIONNAIRE
            </span>
            <h2 style={{ font: '700 30px "Space Grotesk"', margin: '0 0 10px', color: '#fff' }}>
              Have specific website requirements?
            </h2>
            <p style={{ color: '#a09f98', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px' }}>
              Fill out our simple 9-question discovery intake questionnaire. We'll analyze your business model, recommend the optimal blueprint, and generate a tailored proposal within 24 hours.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button
                type="button"
                className="primary"
                style={{ background: 'var(--acid)', color: '#10100f', height: '42px', padding: '0 20px', fontSize: '13px' }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TRANSITIONS.buttonSpring}
                onClick={() => onNavigate('/discovery')}
              >
                Start Discovery Questionnaire <ArrowRight size={14} />
              </motion.button>
              <motion.button
                type="button"
                className="secondary"
                style={{ background: 'transparent', color: '#fff', borderColor: '#403e39', height: '42px', padding: '0 20px', fontSize: '13px' }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={TRANSITIONS.buttonSpring}
                onClick={() => onOpenInquiry({ service: 'Website / Build' })}
              >
                Request Free Consultation
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Pricing FAQs Accordion */}
      <motion.section
        style={{ maxWidth: '840px', margin: '0 auto 80px', padding: '0 20px' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div style={{ textAlign: 'center', marginBottom: '32px' }} variants={fadeInUp}>
          <label className="section-subtitle">COMMERCIAL POLICIES</label>
          <h2 style={{ font: '700 28px "Space Grotesk"', margin: '4px 0 0' }}>
            Frequently Asked Pricing Questions
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRICING_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                style={{
                  background: '#fff',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'var(--ink)'
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      variants={accordionVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      style={{ padding: '0 20px 16px', fontSize: '13px', color: '#55534c', lineHeight: 1.6 }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '40px 24px', background: '#faf8f2', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
            THE SORTED <span>CLUB</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/services/build')}>Build</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/templates')}>Templates</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/pricing')}>Pricing</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/discovery')}>Discovery Brief</span>
            <a href="mailto:thesortedclub@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>thesortedclub@gmail.com</a>
            <a href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20a%20website%20consultation." target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontWeight: 600, textDecoration: 'none' }}>WhatsApp: +91 9643820888</a>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/admin')}>Admin Access</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            © 2026 The Sorted Club. All rights reserved. • Standard 50/50 Milestone Terms.
          </div>
        </div>
      </footer>
    </div>
  );
}
