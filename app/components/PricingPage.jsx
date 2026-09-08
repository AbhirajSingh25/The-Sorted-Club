import React, { useState } from 'react';
import {
  Check,
  X,
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

export default function PricingPage({
  onNavigate = () => {},
  onOpenInquiry = () => {},
  onBackToSite = () => {}
}) {
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

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
      <nav>
        <div
          className="brand"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('/')}
        >
          THE SORTED <span>CLUB</span>
        </div>

        <div className="navlinks">
          <button
            type="button"
            className="nav-sublink"
            onClick={() => onNavigate('/services')}
          >
            Services
          </button>
          <button
            type="button"
            className="nav-sublink"
            onClick={() => onNavigate('/templates')}
          >
            Templates &amp; Portfolio
          </button>
          <button
            type="button"
            className="nav-sublink active"
            onClick={() => onNavigate('/pricing')}
          >
            Pricing
          </button>
          <button
            type="button"
            className="nav-sublink"
            onClick={() => onNavigate('/discovery')}
          >
            Discovery Brief
          </button>
          <button
            className="navcta"
            onClick={() => onOpenInquiry({ service: 'Website / Build' })}
          >
            Free Consultation <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" style={{ padding: '70px 20px 40px' }}>
        <div className="hero-orbit orbit-one" />
        <div className="eyebrow">
          TRANSPARENT COMMERCIAL PACKAGES — ZERO HIDDEN FEES
          <span className="live-dot" />
        </div>
        <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 64px)' }}>
          Transparent website pricing.<br />
          <em>Built to scale.</em>
        </h1>
        <p className="hero-copy" style={{ maxWidth: '640px' }}>
          Fixed-price packages engineered for speed, conversion, and zero vendor lock-in. 50% upfront, 50% on live sign-off.
        </p>

        {/* Currency Toggle & Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '24px 0 12px', flexWrap: 'wrap' }}>
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

          <button
            type="button"
            className="secondary"
            style={{ fontSize: '13px', height: '36px', padding: '0 16px' }}
            onClick={() => onNavigate('/discovery')}
          >
            <FileText size={14} style={{ marginRight: '6px' }} /> Fill Discovery Questionnaire
          </button>
        </div>
      </section>

      {/* Free Website Consultation Banner */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 40px', padding: '0 20px' }}>
        <div className="consultation-banner-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div className="consultation-pulse-icon">
              <Sparkles size={20} color="var(--ink)" />
            </div>
            <div>
              <h3 style={{ font: '700 18px "Space Grotesk"', margin: 0, color: 'var(--ink)' }}>
                Not sure which package is right for your business?
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
                Get a free 20-minute technical consultation. We'll recommend the ideal blueprint, pages, and timeline.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="primary"
            style={{ background: 'var(--acid)', color: '#10100f', height: '42px', padding: '0 20px', fontSize: '13px', whiteSpace: 'nowrap' }}
            onClick={() => onOpenInquiry({ service: 'Website / Build' })}
          >
            Request Free Consultation <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Filter Tabs */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 30px', padding: '0 20px' }}>
        <div className="pricing-filter-tabs">
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All 6 Packages
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveFilter('standard')}
          >
            Starter &amp; Business
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'transactional' ? 'active' : ''}`}
            onClick={() => setActiveFilter('transactional')}
          >
            Lead-Gen, Storefront &amp; Booking
          </button>
          <button
            type="button"
            className={`filter-pill ${activeFilter === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveFilter('custom')}
          >
            Custom Architecture
          </button>
        </div>
      </section>

      {/* 6 Packages Grid */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 70px', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredPackages.map((pkg) => {
            const priceDisplay = currency === 'INR' ? pkg.priceINR : pkg.priceUSD;

            return (
              <div
                key={pkg.id}
                className={`pricing-card-box ${pkg.popular ? 'highlighted' : ''}`}
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
                  <button
                    type="button"
                    className="primary"
                    style={{
                      width: '100%',
                      height: '44px',
                      fontSize: '13px',
                      background: pkg.popular ? 'var(--acid)' : '#10100f',
                      color: pkg.popular ? '#10100f' : '#fff'
                    }}
                    onClick={() => onOpenInquiry({ service: `Website / Build — ${pkg.name}` })}
                  >
                    Select {pkg.name} <ArrowRight size={14} />
                  </button>

                  {pkg.recommendedTemplate && (
                    <button
                      type="button"
                      className="card-cta-link"
                      style={{ width: '100%', textAlign: 'center', marginTop: '10px', fontSize: '12px', color: 'var(--muted)', display: 'block' }}
                      onClick={() => onNavigate(`/templates/${pkg.recommendedTemplate}`)}
                    >
                      View Blueprint Example →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Feature Comparison Table */}
      <section style={{ maxWidth: '1180px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <label className="section-subtitle">FULL SPECIFICATION</label>
          <h2 style={{ font: '700 32px "Space Grotesk"', margin: '4px 0 0' }}>
            Feature Comparison Matrix
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '6px auto 0', maxWidth: '560px' }}>
            Compare specifications, delivery timelines, and technical capabilities side-by-side.
          </p>
        </div>

        <div className="comparison-table-wrapper">
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
        </div>
      </section>

      {/* Discovery Intake Flow Callout */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div className="discovery-callout-card">
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
              <button
                type="button"
                className="primary"
                style={{ background: 'var(--acid)', color: '#10100f', height: '42px', padding: '0 20px', fontSize: '13px' }}
                onClick={() => onNavigate('/discovery')}
              >
                Start Discovery Questionnaire <ArrowRight size={14} />
              </button>
              <button
                type="button"
                className="secondary"
                style={{ background: 'transparent', color: '#fff', borderColor: '#403e39', height: '42px', padding: '0 20px', fontSize: '13px' }}
                onClick={() => onOpenInquiry({ service: 'Website / Build' })}
              >
                Request Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQs Accordion */}
      <section style={{ maxWidth: '840px', margin: '0 auto 80px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <label className="section-subtitle">COMMERCIAL POLICIES</label>
          <h2 style={{ font: '700 28px "Space Grotesk"', margin: '4px 0 0' }}>
            Frequently Asked Pricing Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PRICING_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
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
                {isOpen && (
                  <div style={{ padding: '0 20px 16px', fontSize: '13px', color: '#55534c', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

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
