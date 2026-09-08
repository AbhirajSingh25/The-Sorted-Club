import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { TEMPLATES } from './templatesData';

export default function TemplateDetail({ slug, onNavigate, onOpenInquiry, onNavigateToAdmin }) {
  const template = TEMPLATES.find((t) => t.slug === slug) || TEMPLATES[0];
  const [devicePreviewMode, setDevicePreviewMode] = useState('desktop'); // 'desktop' | 'mobile'

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
      <nav>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          THE SORTED <span>CLUB</span>
        </div>

        <div className="navlinks">
          <button
            type="button"
            className="navlink-btn"
            onClick={() => onNavigate('/templates')}
          >
            ← All Templates
          </button>
          <button
            type="button"
            className="navlink-btn"
            onClick={() => onNavigate('/pricing')}
          >
            Pricing &amp; Packages
          </button>
          <button
            type="button"
            className="navcta"
            onClick={() => onOpenInquiry({ template })}
          >
            Build this Website <ArrowRight size={16} />
          </button>
        </div>
      </nav>

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
      <header className="detail-header-section">
        <div className="detail-header-inner">
          <div className="detail-header-meta">
            <span className="concept-badge">{template.badge}</span>
            <span className="category-pill-tag">{template.category}</span>
            <span className="style-pill-tag">{template.designStyle} Style</span>
          </div>

          <h1 className="detail-main-title">{template.name}</h1>
          <p className="detail-tagline">{template.tagline}</p>

          <div className="detail-hero-stats">
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
          </div>

          <div className="detail-header-actions">
            <button
              type="button"
              className="primary large-btn"
              onClick={() => onOpenInquiry({ template })}
            >
              Build a website like this <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn-live-demo-hero"
              onClick={() => onNavigate(`/demo/${template.slug}`)}
            >
              <Sparkles size={16} /> Launch Interactive Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Device Viewport Presentation Canvas */}
      <section className="detail-preview-showcase" aria-label="Template interactive mockup presentation">
        <div className="preview-showcase-card">
          <div className="showcase-top-bar">
            <div className="device-switcher-tabs" role="group" aria-label="Switch preview device">
              <button
                type="button"
                className={`device-tab ${devicePreviewMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setDevicePreviewMode('desktop')}
              >
                <Laptop size={16} /> Desktop View
              </button>
              <button
                type="button"
                className={`device-tab ${devicePreviewMode === 'mobile' ? 'active' : ''}`}
                onClick={() => setDevicePreviewMode('mobile')}
              >
                <Smartphone size={16} /> Mobile View
              </button>
            </div>

            <button
              type="button"
              className="open-fullscreen-demo-btn"
              onClick={() => onNavigate(`/demo/${template.slug}`)}
            >
              <ExternalLink size={14} /> Fullscreen Interactive Demo
            </button>
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
                    <div className="mockup-text-preview">
                      <span className="preview-eyebrow">{template.category}</span>
                      <h2>{template.demoData?.heroHeading || template.name}</h2>
                      <p>{template.demoData?.heroSub || template.shortDesc}</p>
                      <button
                        type="button"
                        className="mockup-cta-btn"
                        onClick={() => onNavigate(`/demo/${template.slug}`)}
                      >
                        Launch Interactive Sandbox →
                      </button>
                    </div>
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
                  <div className="phone-screen-inner">
                    <span className="phone-badge">{template.badge}</span>
                    <h3>{template.name}</h3>
                    <p>{template.shortDesc}</p>
                    <button
                      type="button"
                      className="phone-demo-btn"
                      onClick={() => onNavigate(`/demo/${template.slug}`)}
                    >
                      Test Mobile Demo
                    </button>
                  </div>
                </div>
                <div className="phone-home-indicator" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Deep Dive Specification Architecture */}
      <section className="detail-specs-container">
        <div className="specs-layout-grid">
          {/* Left Column: Deep Breakdown */}
          <div className="specs-main-col">
            {/* 1. Suitable Business Types */}
            <div className="spec-card">
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
            </div>

            {/* 2. Included Sections & Architecture */}
            <div className="spec-card">
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
            </div>

            {/* 3. Core Features & Capabilities */}
            <div className="spec-card">
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
            </div>

            {/* 4. Delivery Scope & Timeline */}
            <div className="spec-card">
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
            </div>

            {/* 5. Customization Options */}
            <div className="spec-card">
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
            </div>
          </div>

          {/* Right Column: Sticky Request Card */}
          <aside className="specs-sidebar-col">
            <div className="sticky-build-card">
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

              <button
                type="button"
                className="primary full-width-cta"
                onClick={() => onOpenInquiry({ template })}
              >
                Build a website like this <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="btn-secondary full-width-cta"
                style={{ marginTop: '10px' }}
                onClick={() => onNavigate(`/demo/${template.slug}`)}
              >
                <Sparkles size={15} /> Open Live Interactive Demo
              </button>

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
            </div>
          </aside>
        </div>
      </section>

      {/* Related Templates Carousel */}
      <section className="related-templates-section">
        <div className="related-inner">
          <div className="section-head" style={{ marginBottom: '28px' }}>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>EXPLORE MORE BLUEPRINTS</p>
            <h2>Related website concepts</h2>
          </div>

          <div className="related-grid">
            {relatedTemplates.map((rel) => (
              <div
                key={rel.id}
                className="related-card"
                onClick={() => onNavigate(`/templates/${rel.slug}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate(`/templates/${rel.slug}`);
                  }
                }}
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
              </div>
            ))}
          </div>
        </div>
      </section>

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
