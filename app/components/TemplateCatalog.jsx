import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
  Laptop,
  Smartphone,
  Shield,
  Menu
} from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES, DESIGN_STYLES } from './templatesData';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  TRANSITIONS,
  accordionVariants
} from '../utils/motion';

export default function TemplateCatalog({ onNavigate, onOpenInquiry, onNavigateToAdmin }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Update SEO Page Title
  useEffect(() => {
    document.title = 'Website Templates & Examples | The Sorted Club Portfolio';
    window.scrollTo(0, 0);
  }, []);

  // Filter templates based on category, style, and search query
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === 'All Categories' || template.category === selectedCategory;

      const matchesStyle =
        selectedStyle === 'All Styles' || template.designStyle === selectedStyle;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        template.name.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.designStyle.toLowerCase().includes(query) ||
        template.suitableFor.toLowerCase().includes(query) ||
        template.shortDesc.toLowerCase().includes(query) ||
        template.mainFeatures.some((f) => f.toLowerCase().includes(query));

      return matchesCategory && matchesStyle && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedStyle]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedStyle('All Styles');
  };

  const faqs = [
    {
      q: 'How does building a website with The Sorted Club work?',
      a: 'Browse our blueprints or describe your specific requirements. When you click "Build a website like this", our team receives your brief. We refine the design system, customize the copy and features for your exact business, integrate your WhatsApp & payment tools, and deploy your production website within 5 to 7 business days.'
    },
    {
      q: 'Are these templates rigid or completely customizable?',
      a: 'Every blueprint is a starting foundation built on clean code (Vite, React, Vanilla CSS). We completely customize typography, color palettes, section layouts, photography, branding, integrations, and custom logic to match your unique brand identity.'
    },
    {
      q: 'Can you connect my existing domain, CRM, or WhatsApp?',
      a: 'Yes. We handle custom domain setup with SSL, integrate direct WhatsApp click-to-chat buttons, hook up contact forms to your CRM or email, and configure Google Analytics and SEO schema markup out of the box.'
    },
    {
      q: 'What if I need custom features not shown in the demo?',
      a: 'We are a full-stack engineering team. If you need dynamic booking systems, patient portals, custom calculators, multi-currency stores, or AI customer support bots, we can build and integrate them seamlessly into your build.'
    },
    {
      q: 'How are prices structured?',
      a: 'Our website builds start at transparent flat-rate investments (from ₹19,999 to ₹34,999 depending on scope), with zero hidden agency fees and complete code ownership upon handover.'
    }
  ];

  return (
    <div className="template-catalog-page">
      {/* Navigation */}
      <motion.nav
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
          aria-label="Toggle navigation menu"
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
            href="/templates"
            className="active-navlink"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
            }}
          >
            Templates & Examples
          </a>
          <a
            href="/pricing"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/pricing');
            }}
          >
            Pricing & Packages
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
            Free Consultation <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Header */}
      <motion.header
        className="catalog-hero"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.08, 0.05)}
      >
        <div className="catalog-hero-inner">
          <motion.div className="eyebrow" style={{ color: 'var(--muted)' }} variants={fadeInUp}>
            <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
            WEBSITE BLUEPRINTS & PORTFOLIO EXAMPLES
          </motion.div>

          <motion.h1 className="catalog-hero-title" variants={fadeInUp}>
            Browse Real Website Concepts.<br />
            <em>Pick your blueprint.</em>
          </motion.h1>

          <motion.p className="catalog-hero-subtitle" variants={fadeInUp}>
            Explore high-converting website designs engineered for modern businesses. Filter by your industry, test interactive demo flows, and request a tailored build for your brand.
          </motion.p>

          <motion.div className="catalog-disclaimer-pill" role="note" variants={fadeInUp}>
            <span className="disclaimer-badge">Demo Concepts</span>
            <span>All website examples shown are engineered sample blueprints created by The Sorted Club. Real custom builds are crafted to your exact brand specifications.</span>
          </motion.div>

          <motion.div
            style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
            variants={fadeInUp}
          >
            <motion.button
              type="button"
              className="primary"
              style={{ fontSize: '13px', height: '40px', padding: '0 20px', background: 'var(--acid)', color: '#10100f' }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onOpenInquiry({ service: 'Website / Build' })}
            >
              <Sparkles size={14} style={{ marginRight: '6px' }} /> Request a Free Website Consultation
            </motion.button>
            <motion.button
              type="button"
              className="secondary"
              style={{ fontSize: '13px', height: '40px', padding: '0 18px' }}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onNavigate('/pricing')}
            >
              View Pricing Packages (From ₹14,999) →
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Filter & Search Bar */}
      <motion.section
        className="catalog-controls-container"
        aria-label="Template filters"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="catalog-controls-card">
          {/* Search Row */}
          <div className="search-row">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by industry, design style, or feature (e.g. 'table booking', 'coaching', 'minimal')..."
                aria-label="Search templates"
                className="catalog-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search text"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Design Style Selector */}
            <div className="style-select-wrapper">
              <SlidersHorizontal size={16} className="style-icon" aria-hidden="true" />
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="catalog-style-select"
                aria-label="Filter by design style"
              >
                {DESIGN_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-pills-row" role="tablist" aria-label="Filter by business category">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === 'All Categories'
                  ? TEMPLATES.length
                  : TEMPLATES.filter((t) => t.category === cat).length;

              return (
                <motion.button
                  type="button"
                  key={cat}
                  role="tab"
                  aria-selected={isSelected}
                  className={`category-pill ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={TRANSITIONS.buttonSpring}
                >
                  <span>{cat}</span>
                  <span className="pill-count">{count}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Filter Status Bar */}
          <div className="filter-status-bar">
            <div className="result-count">
              Showing <strong>{filteredTemplates.length}</strong> {filteredTemplates.length === 1 ? 'concept' : 'concepts'}
              {selectedCategory !== 'All Categories' && <span> in <em>{selectedCategory}</em></span>}
              {selectedStyle !== 'All Styles' && <span> with <em>{selectedStyle}</em> style</span>}
              {searchQuery && <span> matching <em>"{searchQuery}"</em></span>}
            </div>

            {(selectedCategory !== 'All Categories' || selectedStyle !== 'All Styles' || searchQuery) && (
              <motion.button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <X size={14} /> Clear all filters
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Templates Grid */}
      <section className="catalog-grid-section" aria-label="Template catalogue grid">
        {filteredTemplates.length === 0 ? (
          <motion.div
            className="catalog-empty-state"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={TRANSITIONS.editorial}
          >
            <div className="empty-icon-circle">
              <Search size={32} />
            </div>
            <h3>No matching website blueprints found</h3>
            <p>
              We couldn't find any demo concepts matching your search filters. Try searching for a different keyword or reset your filters.
            </p>
            <motion.button
              type="button"
              className="primary"
              onClick={handleResetFilters}
              style={{ marginTop: '16px' }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Reset Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="templates-grid"
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.06, 0.05)}
          >
            {filteredTemplates.map((template) => {
              return (
                <motion.article
                  key={template.id}
                  className="template-card"
                  variants={fadeInUp}
                  whileHover={{ y: -6, boxShadow: '0 24px 48px -16px rgba(16, 16, 15, 0.16)' }}
                  transition={TRANSITIONS.cardSpring}
                  data-cursor={`Explore ${template.name}`}
                >
                  {/* Card Visual Preview Box */}
                  <div
                    className="template-preview-box"
                    onClick={() => onNavigate(`/templates/${template.slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onNavigate(`/templates/${template.slug}`);
                      }
                    }}
                    aria-label={`View details for ${template.name}`}
                  >
                    {/* Simulated Browser Bar */}
                    <div className="browser-chrome-bar">
                      <div className="chrome-dots">
                        <span className="dot dot-red" />
                        <span className="dot dot-yellow" />
                        <span className="dot dot-green" />
                      </div>
                      <div className="chrome-address">
                        https://demo.{template.slug}.sorted.club
                      </div>
                      <div className="chrome-icons">
                        <Laptop size={14} />
                      </div>
                    </div>

                    {/* Preview Image with Ambient Overlay */}
                    <motion.div
                      className="preview-image-canvas"
                      style={{
                        backgroundImage: `url(${template.heroImage})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                      }}
                      whileHover={{ scale: 1.035 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="preview-gradient-scrim">
                        <div className="preview-mockup-badge">
                          <span className="concept-pill">{template.badge}</span>
                          <span className="style-pill">{template.designStyle}</span>
                        </div>

                        {/* Floating Mobile Peek */}
                        <motion.div
                          className="mobile-peek-frame"
                          title="Mobile responsive layout included"
                          whileHover={{ y: -3, scale: 1.03 }}
                          transition={TRANSITIONS.buttonSpring}
                        >
                          <div className="mobile-peek-notch" />
                          <div className="mobile-peek-screen">
                            <Smartphone size={16} />
                            <span>Mobile Ready</span>
                          </div>
                        </motion.div>

                        <div className="preview-overlay-action">
                          <span className="preview-hover-cta">
                            Explore Template Details <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Card Body */}
                  <div className="template-card-content">
                    <div className="template-card-header">
                      <div className="template-meta-row">
                        <span className="template-category-tag">{template.category}</span>
                        <span className="template-turnaround-tag">
                          <Clock size={12} /> {template.turnaround}
                        </span>
                      </div>
                      <h2
                        className="template-title"
                        onClick={() => onNavigate(`/templates/${template.slug}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {template.name}
                      </h2>
                      <p className="template-suitable">
                        <strong>Ideal for:</strong> {template.suitableFor}
                      </p>
                    </div>

                    <p className="template-desc">{template.shortDesc}</p>

                    {/* Features List */}
                    <div className="template-features-preview">
                      <div className="features-label">Core Capabilities:</div>
                      <ul className="features-list">
                        {template.mainFeatures.slice(0, 3).map((feat, i) => (
                          <li key={i}>
                            <CheckCircle2 size={14} className="feat-check" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Footer with Pricing & Dual CTAs */}
                    <div className="template-card-footer">
                      <div className="pricing-box">
                        <span className="price-label">Starting Investment</span>
                        <div className="price-val">
                          {template.startingPrice}
                          <small className="price-usd"> / {template.startingPriceUSD}</small>
                        </div>
                      </div>

                      <div className="card-actions">
                        <motion.button
                          type="button"
                          className="btn-demo-view"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={TRANSITIONS.buttonSpring}
                          onClick={() => onNavigate(`/templates/${template.slug}`)}
                          title="Inspect details, sections and live interactive demo"
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          type="button"
                          className="btn-build-this"
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          transition={TRANSITIONS.buttonSpring}
                          onClick={() => onOpenInquiry({ template })}
                          title={`Request a website build based on ${template.name}`}
                        >
                          Build This <ArrowRight size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* How It Works Explainer */}
      <motion.section
        className="catalog-how-it-works"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.05)}
      >
        <div className="how-it-works-inner">
          <motion.div className="section-head" style={{ textAlign: 'center', marginBottom: '40px' }} variants={fadeInUp}>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>THE SORTED CLUB METHOD</p>
            <h2 style={{ fontSize: '32px', margin: '8px 0' }}>How to launch your custom website</h2>
            <p style={{ color: 'var(--muted)', maxWidth: '640px', margin: '0 auto' }}>
              From choosing your blueprint to receiving production keys in less than a week.
            </p>
          </motion.div>

          <motion.div className="steps-grid" variants={staggerContainer(0.08, 0.08)}>
            <motion.div className="step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="step-num">01</div>
              <h3>Select a Blueprint</h3>
              <p>
                Browse our demo concepts to find the layout, interactions, and aesthetic that matches your vision.
              </p>
            </motion.div>
            <motion.div className="step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="step-num">02</div>
              <h3>Tailored Customization</h3>
              <p>
                We inject your brand identity, refine copy, configure WhatsApp & payment gateways, and optimize for Google search.
              </p>
            </motion.div>
            <motion.div className="step-card" variants={fadeInUp} whileHover={{ y: -4 }}>
              <div className="step-num">03</div>
              <h3>Production Launch</h3>
              <p>
                We connect your domain with SSL, test lightning-fast performance across all mobile devices, and hand over the keys.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Accordion */}
      <motion.section
        className="catalog-faq-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <div className="faq-inner">
          <motion.div className="section-head" style={{ textAlign: 'center', marginBottom: '36px' }} variants={fadeInUp}>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>FREQUENTLY ASKED QUESTIONS</p>
            <h2 style={{ fontSize: '28px', margin: '8px 0' }}>Everything you need to know</h2>
          </motion.div>

          <div className="faq-accordion-list">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="faq-answer-pane"
                        variants={accordionVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                      >
                        <p>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Bottom CTA Banner */}
      <motion.section
        className="catalog-bottom-cta"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div className="bottom-cta-box" variants={fadeInUp}>
          <p className="eyebrow" style={{ color: '#84cc16' }}>READY TO GET SORTED?</p>
          <h2>Have a unique website requirement in mind?</h2>
          <p>
            Tell us about your project brief, custom features, or timeline. We'll outline a direct technical plan and fixed quote.
          </p>
          <div className="cta-buttons-row">
            <motion.button
              type="button"
              className="primary"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onOpenInquiry({ service: 'Website / Build' })}
              style={{ fontSize: '15px' }}
            >
              Request Free Consultation <ArrowRight size={18} />
            </motion.button>
            <motion.button
              type="button"
              className="secondary"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onNavigate('/pricing')}
              style={{ fontSize: '14px', height: '44px', padding: '0 20px', background: '#fff' }}
            >
              View Pricing Packages
            </motion.button>
            <motion.a
              href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27d%20like%20to%20discuss%20a%20website%20build."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              whileHover={{ scale: 1.02, x: 2 }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              WhatsApp Us (+91 9643820888) →
            </motion.a>
          </div>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer>
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
          </a> • <a href="https://wa.me/919643820888" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 9643820888</a>
        </p>
        <small>© 2026 The Sorted Club. All rights reserved. • Blueprints labeled Demo Concept.</small>
      </footer>
    </div>
  );
}
