import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
  CheckCircle2,
  Layers,
  Smartphone,
  Laptop,
  HelpCircle,
  Shield,
  Zap,
  Code2,
  DollarSign,
  Palette,
  Globe,
  Sliders,
  Check,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { TEMPLATES } from './templatesData';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  TRANSITIONS
} from '../utils/motion';

export default function TemplateDetail({ slug, onNavigate, onOpenInquiry, onNavigateToAdmin }) {
  const template = TEMPLATES.find((t) => t.slug === slug) || TEMPLATES[0];
  const [devicePreviewMode, setDevicePreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update SEO Title & Meta tags
  useEffect(() => {
    document.title = `${template.name} (${template.badge}) — Website Template | The Sorted Club`;
    window.scrollTo(0, 0);
  }, [template]);

  // Find related templates
  const relatedTemplates = TEMPLATES.filter((t) => t.slug !== template.slug).slice(0, 3);

  return (
    <div className="template-detail-page">
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
          <button
            type="button"
            className="navlink-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/templates');
            }}
          >
            ← All Templates
          </button>
          <button
            type="button"
            className="navlink-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/pricing');
            }}
          >
            Pricing &amp; Packages
          </button>
          <motion.button
            type="button"
            className="navcta"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquiry({ template });
            }}
          >
            Build this Website <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Breadcrumb Row */}
      <div className="detail-breadcrumb-bar">
        <div className="detail-breadcrumb-inner">
          <button
            type="button"
            className="breadcrumb-back"
            onClick={() => onNavigate('/templates')}
          >
            <ArrowLeft size={14} /> Back to Catalogue
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-cat">{template.category}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{template.name}</span>
        </div>
      </div>

      {/* Main Detail Header */}
      <motion.header
        className="detail-header-section"
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.08, 0.05)}
      >
        <div className="detail-header-inner">
          <motion.div className="detail-header-meta" variants={fadeInUp}>
            <span className="concept-badge">{template.badge}</span>
            <span className="category-pill-tag">{template.category}</span>
            <span className="style-pill-tag">{template.designStyle} Style</span>
          </motion.div>

          <motion.h1 className="detail-main-title" variants={fadeInUp}>{template.name}</motion.h1>
          <motion.p className="detail-tagline" variants={fadeInUp}>{template.tagline}</motion.p>

          <motion.div className="detail-hero-stats" variants={fadeInUp}>
            <div className="stat-pill">
              <span className="stat-label">Starting Investment</span>
              <strong className="stat-val">{template.startingPrice} <small>({template.startingPriceUSD})</small></strong>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Delivery Timeline</span>
              <strong className="stat-val"><Clock size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />{template.turnaround}</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Performance</span>
              <strong className="stat-val"><Zap size={15} color="#22c55e" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />98+ PageSpeed Score</strong>
            </div>
          </motion.div>

          <motion.div className="detail-header-actions" variants={fadeInUp}>
            <motion.button
              type="button"
              className="primary large-btn"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onOpenInquiry({ template })}
            >
              Build a website like this <ArrowRight size={18} />
            </motion.button>
            <motion.button
              type="button"
              className="btn-live-demo-hero"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onNavigate(`/demo/${template.slug}`)}
            >
              <Sparkles size={16} /> Launch Interactive Live Demo
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* Interactive Device Viewport Presentation Canvas */}
      <motion.section
        className="detail-preview-showcase"
        aria-label="Template interactive mockup presentation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="preview-showcase-card">
          <div className="showcase-top-bar">
            <div className="device-switcher-tabs" role="group" aria-label="Switch preview device">
              <motion.button
                type="button"
                className={`device-tab ${devicePreviewMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setDevicePreviewMode('desktop')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Laptop size={16} /> Desktop View
              </motion.button>
              <motion.button
                type="button"
                className={`device-tab ${devicePreviewMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setDevicePreviewMode('mobile')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Smartphone size={16} /> Mobile View
              </motion.button>
            </div>

            <motion.button
              type="button"
              className="open-fullscreen-demo-btn"
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onNavigate(`/demo/${template.slug}`)}
            >
              <ExternalLink size={14} /> Fullscreen Interactive Demo
            </motion.button>
          </div>

          {/* Framed Device Container */}
          <div className={`showcase-viewport-frame mode-${devicePreviewMode}`}>
            {devicePreviewMode === 'desktop' ? (
              <div className="desktop-browser-frame">
                <div className="browser-header">
                  <div className="browser-dots">
                    <span className="dot dot-red" />
                    <span className="dot dot-yellow" />
                    <span className="dot dot-green" />
                  </div>
                  <div className="browser-url">
                    https://{template.slug}.sorted.club
                  </div>
                  <div className="browser-badge">Demo Concept</div>
                </div>

                <div
                  className="desktop-screen-content"
                  style={{
                    backgroundImage: `linear-gradient(rgba(16, 16, 15, 0.4), rgba(16, 16, 15, 0.4)), url(${template.heroImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                  }}
                >
                  <div className="mockup-watermark-overlay">
                    <motion.div
                      className="mockup-text-preview"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="preview-eyebrow">{template.category}</span>
                      <h2>{template.demoData?.heroHeading || template.name}</h2>
                      <p>{template.demoData?.heroSub || template.shortDesc}</p>
                      <motion.button
                        type="button"
                        className="mockup-cta-btn"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        transition={TRANSITIONS.buttonSpring}
                        onClick={() => onNavigate(`/demo/${template.slug}`)}
                      >
                        Launch Interactive Sandbox →
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mobile-phone-frame">
                <div className="phone-notch">
                  <div className="speaker" />
                  <div className="camera" />
                </div>
                <div
                  className="phone-screen-content"
                  style={{
                    backgroundImage: `linear-gradient(rgba(16, 16, 15, 0.5), rgba(16, 16, 15, 0.5)), url(${template.heroImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                  }}
                >
                  <motion.div
                    className="phone-screen-inner"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="phone-badge">{template.badge}</span>
                    <h3>{template.name}</h3>
                    <p>{template.shortDesc}</p>
                    <motion.button
                      type="button"
                      className="phone-demo-btn"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={TRANSITIONS.buttonSpring}
                      onClick={() => onNavigate(`/demo/${template.slug}`)}
                    >
                      Test Mobile Demo
                    </motion.button>
                  </motion.div>
                </div>
                <div className="phone-home-indicator" />
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Deep Dive Specification Architecture */}
      <section className="detail-specs-container">
        <div className="specs-layout-grid">
          {/* Left Column: Deep Breakdown */}
          <div className="specs-main-col">
            {/* 1. Suitable Business Types */}
            <motion.div
              className="spec-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="spec-card-head">
                <Globe size={20} className="spec-icon" />
                <h3>Recommended Business Types</h3>
              </div>
              <p className="spec-lead-text">{template.suitableFor}</p>
              <div className="suitable-tags-cloud">
                {template.suitableFor.split(',').map((item, idx) => (
                  <span key={idx} className="suitable-tag">
                    ✓ {item.trim()}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 2. Included Sections & Architecture */}
            <motion.div
              className="spec-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="spec-card-head">
                <Layers size={20} className="spec-icon" />
                <h3>Included Pages &amp; Sections Checklist</h3>
              </div>
              <p className="spec-lead-text">
                Every build includes the following core responsive modules, fully structured and styled for your brand:
              </p>
              <div className="sections-checklist-grid">
                {template.includedSections.map((section, idx) => (
                  <div key={idx} className="section-check-item">
                    <div className="check-number">0{idx + 1}</div>
                    <div className="check-details">
                      <strong>{section.split('—')[0]}</strong>
                      <span>{section}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 3. Core Features & Capabilities */}
            <motion.div
              className="spec-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="spec-card-head">
                <Zap size={20} className="spec-icon" />
                <h3>Key Features &amp; Technical Capabilities</h3>
              </div>
              <div className="features-checklist-grid">
                {template.mainFeatures.map((feat, idx) => (
                  <div key={idx} className="feature-check-item">
                    <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 4. Delivery Scope & Timeline */}
            <motion.div
              className="spec-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="spec-card-head">
                <Clock size={20} className="spec-icon" />
                <h3>Estimated Delivery Scope</h3>
              </div>
              <div className="scope-items-list">
                <div className="scope-item">
                  <strong>Turnaround Time:</strong> {template.turnaround}
                </div>
                <div className="scope-item">
                  <strong>Engineering Stack:</strong> {template.techStack}
                </div>
                <div className="scope-item">
                  <strong>Included Services:</strong> Custom UI styling, mobile optimization, SEO meta tags, Google Maps embed, WhatsApp chat hook, SSL deployment, 30 days post-launch warranty.
                </div>
              </div>
            </motion.div>

            {/* 5. Customization Options */}
            <motion.div
              className="spec-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="spec-card-head">
                <Palette size={20} className="spec-icon" />
                <h3>Customization &amp; Extension Add-ons</h3>
              </div>
              <p className="spec-lead-text">
                Need more than the baseline blueprint? We easily integrate:
              </p>
              <div className="customization-options-grid">
                {template.customizationOptions.map((opt, idx) => (
                  <div key={idx} className="custom-option-pill">
                    <Plus size={14} color="#68665e" />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sticky Request Card */}
          <aside className="specs-sidebar-col">
            <motion.div
              className="sticky-build-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <div className="sidebar-card-badge">Selected Blueprint</div>
              <h3 className="sidebar-template-name">{template.name}</h3>
              <p className="sidebar-category">{template.category} • {template.badge}</p>

              <div className="sidebar-pricing-box">
                <span className="sidebar-price-label">Starting Investment</span>
                <div className="sidebar-price-val">
                  {template.startingPrice}
                  <small> / {template.startingPriceUSD}</small>
                </div>
                <span className="sidebar-pricing-sub">One-time flat build investment</span>
              </div>

              <div className="sidebar-perks-list">
                <div>✓ 5 - 7 Business Day Launch</div>
                <div>✓ 100% Custom Brand Styling</div>
                <div>✓ Direct WhatsApp & CRM Lead Capture</div>
                <div>✓ Zero Agency Overhead</div>
              </div>

              <motion.button
                type="button"
                className="primary full-width-cta"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TRANSITIONS.buttonSpring}
                onClick={() => onOpenInquiry({ template })}
              >
                Build a website like this <ArrowRight size={16} />
              </motion.button>

              <motion.button
                type="button"
                className="btn-secondary full-width-cta"
                style={{ marginTop: '10px' }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={TRANSITIONS.buttonSpring}
                onClick={() => onNavigate(`/demo/${template.slug}`)}
              >
                <Sparkles size={15} /> Open Live Interactive Demo
              </motion.button>

              <div className="sidebar-wa-box">
                <span>Prefer a direct conversation?</span>
                <a
                  href={`https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27d%20like%20to%20build%20a%20website%20similar%20to%20the%20${encodeURIComponent(template.name)}%20concept.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wa-link"
                >
                  Chat on WhatsApp (+91 9643820888) →
                </a>
              </div>
            </motion.div>
          </aside>
        </div>
      </section>

      {/* Related Templates Carousel */}
      <motion.section
        className="related-templates-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <div className="related-inner">
          <motion.div className="section-head" style={{ marginBottom: '28px' }} variants={fadeInUp}>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>EXPLORE MORE BLUEPRINTS</p>
            <h2>Related website concepts</h2>
          </motion.div>

          <motion.div className="related-grid" variants={staggerContainer(0.08, 0.08)}>
            {relatedTemplates.map((rel) => (
              <motion.div
                key={rel.id}
                className="related-card"
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12)' }}
                transition={TRANSITIONS.cardSpring}
                onClick={() => onNavigate(`/templates/${rel.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate(`/templates/${rel.slug}`);
                  }
                }}
                data-cursor={`View ${rel.name}`}
              >
                <div
                  className="related-img"
                  style={{
                    backgroundImage: `url(${rel.heroImage})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                  }}
                >
                  <span className="related-concept-pill">{rel.badge}</span>
                </div>
                <div className="related-card-content">
                  <span className="related-cat">{rel.category}</span>
                  <h4>{rel.name}</h4>
                  <div className="related-price">{rel.startingPrice}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
        <p>Build. Grow. Automate. Hire.</p>
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
