import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  Send,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  TRANSITIONS
} from '../utils/motion';
import { submitLead } from '../api/client';

const BUSINESS_TYPES = [
  'Restaurant / Café / Hospitality',
  'Coaching / Education / Academy',
  'Salon / Spa / Wellness / Clinic',
  'Real Estate / Property Development',
  'E-Commerce / Retail Brand',
  'Local Service / Contractor',
  'Professional Services / Consulting / Law',
  'Tech Startup / SaaS / Digital Product',
  'Personal Brand / Portfolio / Creator',
  'Other'
];

const AVAILABLE_PAGES = [
  'Home / Overview',
  'About Us / Founder Story',
  'Services / Offerings Deep-Dive',
  'Pricing & Commercial Packages',
  'Case Studies / Portfolio Gallery',
  'Blog / News / Articles Index',
  'Contact Us & Location (Google Maps)',
  'E-Commerce Shop & Product Catalog',
  'Appointment / Slot Booking Page',
  'Client Reviews / Testimonials Page'
];

const AVAILABLE_FEATURES = [
  'Direct WhatsApp 1-Click Chat CTA',
  'Instant Lead Capture Form (Email & CRM Alert)',
  'Online Calendar / Slot Booking Engine',
  'Payment Gateway (Razorpay / Stripe / UPI)',
  'Shopping Cart & Checkout Flow',
  'Dynamic CMS for Blogs & Articles',
  'Google Analytics 4 & Meta Conversion Tracking',
  'User Login / Client Portal Area',
  'Multi-Language Support'
];

const BUDGET_TIERS = [
  { id: 'starter', label: 'Starter Website (₹14,999 / $400)', value: '₹14,999' },
  { id: 'business', label: 'Business Website (₹24,999 / $650)', value: '₹24,999' },
  { id: 'leadgen', label: 'Lead-Gen Funnel (₹29,999 / $750)', value: '₹29,999' },
  { id: 'booking', label: 'Booking Website (₹34,999 / $890)', value: '₹34,999' },
  { id: 'ecommerce', label: 'E-Commerce Storefront (₹39,999 / $990)', value: '₹39,999' },
  { id: 'custom', label: 'Custom Architecture (From ₹59,999 / $1,500+)', value: 'Custom Scope' },
  { id: 'flexible', label: 'Flexible / Need Expert Recommendation', value: 'Flexible / Open' }
];

const LAUNCH_TIMELINES = [
  'ASAP (Within 5 to 7 days)',
  'Within 2 to 3 weeks',
  'Within 1 month',
  'Flexible / Planning stage'
];

export default function DiscoveryQuestionnaire({
  onNavigate = () => {},
  onOpenInquiry = () => {}
}) {
  const [formData, setFormData] = useState({
    business_name: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    business_type: '',
    custom_business_type: '',
    selected_pages: ['Home / Overview', 'About Us / Founder Story', 'Services / Offerings Deep-Dive', 'Contact Us & Location (Google Maps)'],
    selected_features: ['Direct WhatsApp 1-Click Chat CTA', 'Instant Lead Capture Form (Email & CRM Alert)'],
    target_audience: '',
    reference_websites: '',
    budget: '₹24,999',
    timeline: 'Within 2 to 3 weeks',
    additional_notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePageToggle = (pageName) => {
    setFormData((prev) => {
      const exists = prev.selected_pages.includes(pageName);
      return {
        ...prev,
        selected_pages: exists
          ? prev.selected_pages.filter((p) => p !== pageName)
          : [...prev.selected_pages, pageName]
      };
    });
  };

  const handleFeatureToggle = (featureName) => {
    setFormData((prev) => {
      const exists = prev.selected_features.includes(featureName);
      return {
        ...prev,
        selected_features: exists
          ? prev.selected_features.filter((f) => f !== featureName)
          : [...prev.selected_features, featureName]
      };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.business_name.trim()) errors.business_name = 'Business name is required.';
    if (!formData.name.trim()) errors.name = 'Contact person name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone / WhatsApp number is required.';
    } else if (formData.phone.trim().length < 8) {
      errors.phone = 'Please provide a valid contact number.';
    }
    if (!formData.business_type) {
      errors.business_type = 'Please select a business category.';
    }
    if (formData.selected_pages.length === 0) {
      errors.selected_pages = 'Please select at least one required page.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!validateForm()) {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveBusinessType =
        formData.business_type === 'Other' && formData.custom_business_type.trim()
          ? `Other (${formData.custom_business_type.trim()})`
          : formData.business_type;

      // Construct rich brief summary
      const problemBrief = [
        `DISCOVERY BRIEF SUBMISSION:`,
        `• Target Audience: ${formData.target_audience.trim() || 'Not specified'}`,
        `• Current Presence: ${formData.website.trim() || 'None / New Venture'}`,
        `• Selected Pages (${formData.selected_pages.length}): ${formData.selected_pages.join(', ')}`,
        `• Required Features: ${formData.selected_features.join(', ')}`,
        `• Design / Reference Websites: ${formData.reference_websites.trim() || 'None referenced'}`,
        `• Preferred Launch: ${formData.timeline}`,
        formData.additional_notes.trim() ? `• Client Notes: ${formData.additional_notes.trim()}` : ''
      ]
        .filter(Boolean)
        .join('\n');

      const qualificationNotes = `Pages: [${formData.selected_pages.join(', ')}] | Features: [${formData.selected_features.join(', ')}] | Timeline: ${formData.timeline}`;

      const leadPayload = {
        name: formData.name.trim(),
        business_name: formData.business_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        website: formData.website.trim() || undefined,
        business_type: effectiveBusinessType,
        service_interest: 'Website / Build',
        problem: problemBrief,
        budget: formData.budget,
        source: 'Website Discovery Questionnaire',
        qualification_notes: qualificationNotes,
        timeline: formData.timeline
      };

      await submitLead(leadPayload);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit discovery questionnaire. Please try again.');
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="discovery-page-root">
        <nav>
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
            THE SORTED <span>CLUB</span>
          </div>
        </nav>

        <motion.main
          style={{ maxWidth: '720px', margin: '60px auto 100px', padding: '0 24px', textAlign: 'center' }}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            style={{ background: '#fff', border: '2px solid var(--line)', borderRadius: '16px', padding: '48px 32px', boxShadow: '0 12px 40px rgba(0,0,0,0.04)' }}
            variants={scaleIn}
          >
            <motion.div
              style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <CheckCircle2 size={36} color="#15803d" />
            </motion.div>

            <motion.span className="client-code-tag" style={{ background: 'var(--acid)', color: '#10100f', marginBottom: '12px', display: 'inline-block' }} variants={fadeInUp}>
              DISCOVERY BRIEF RECEIVED
            </motion.span>

            <motion.h1 style={{ font: '700 32px "Space Grotesk"', margin: '0 0 12px', color: 'var(--ink)' }} variants={fadeInUp}>
              We've Got Your Brief Sorted!
            </motion.h1>

            <motion.p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6, margin: '0 auto 28px', maxWidth: '540px' }} variants={fadeInUp}>
              Thank you, <strong>{formData.name}</strong>. Our digital architecture squad is reviewing your requirements for <strong>{formData.business_name}</strong>. We will formulate a tailored blueprint and proposal within <strong>24 business hours</strong>.
            </motion.p>

            <motion.div style={{ background: '#faf9f5', border: '1px solid var(--line)', borderRadius: '10px', padding: '20px', textAlign: 'left', margin: '0 0 32px' }} variants={fadeInUp}>
              <label className="section-subtitle" style={{ fontSize: '11px', marginBottom: '8px' }}>WHAT HAPPENS NEXT</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--ink)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ font: '700 12px "Space Grotesk"', background: '#10100f', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                  <span>Technical review of your required pages ({formData.selected_pages.length}) and integrations.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ font: '700 12px "Space Grotesk"', background: '#10100f', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                  <span>We issue a tokenized online commercial proposal at <strong>{formData.email}</strong>.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ font: '700 12px "Space Grotesk"', background: '#10100f', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                  <span>Kickoff sprint lock-in with 50% milestone terms.</span>
                </div>
              </div>
            </motion.div>

            <motion.div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }} variants={fadeInUp}>
              <motion.button
                type="button"
                className="primary"
                onClick={() => onNavigate('/templates')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={TRANSITIONS.buttonSpring}
              >
                Browse Design Blueprints <ArrowRight size={14} />
              </motion.button>
              <motion.button
                type="button"
                className="secondary"
                onClick={() => onNavigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={14} /> Back to Homepage
              </motion.button>
            </motion.div>

            <motion.div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--muted)' }} variants={fadeInUp}>
              Need immediate assistance?{' '}
              <a
                href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%20just%20submitted%20a%20discovery%20brief."
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#15803d', fontWeight: 600, textDecoration: 'none' }}
              >
                Chat directly on WhatsApp →
              </a>
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="discovery-page-root">
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
            className="nav-sublink"
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
            className="nav-sublink active"
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
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquiry({ service: 'Website / Build' });
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
          >
            Get in Touch <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Header */}
      <motion.section
        className="hero"
        style={{ padding: '60px 20px 30px' }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          className="hero-orbit orbit-one"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
        />
        <motion.div className="eyebrow" variants={fadeInUp}>
          CLIENT INTAKE &amp; TECHNICAL DISCOVERY
          <span className="live-dot" />
        </motion.div>
        <motion.h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)' }} variants={fadeInUp}>
          Tell us about your project.<br />
          <em>We'll get it sorted.</em>
        </motion.h1>
        <motion.p className="hero-copy" style={{ maxWidth: '620px' }} variants={fadeInUp}>
          Complete this quick 9-question discovery intake questionnaire. We'll analyze your specifications and prepare a fixed-price proposal within 24 hours.
        </motion.p>
      </motion.section>

      {/* Questionnaire Form Container */}
      <main style={{ maxWidth: '860px', margin: '0 auto 100px', padding: '0 20px' }}>
        {errorMessage && (
          <motion.div
            className="form-error-banner"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} color="#dc2626" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="discovery-form-card"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* SECTION 1: BUSINESS PROFILE & CONTACT */}
          <motion.div
            className="discovery-section"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="discovery-section-header">
              <span className="discovery-step-num">01</span>
              <div>
                <h3 className="discovery-section-title">Business &amp; Contact Information</h3>
                <p className="discovery-section-desc">Who are we building for and how do we reach you?</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginTop: '16px' }}>
              <div className="field">
                <label>Company / Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Legal Advisory"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className={fieldErrors.business_name ? 'error' : ''}
                />
                {fieldErrors.business_name && <small className="error-text">{fieldErrors.business_name}</small>}
              </div>

              <div className="field">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={fieldErrors.name ? 'error' : ''}
                />
                {fieldErrors.name && <small className="error-text">{fieldErrors.name}</small>}
              </div>

              <div className="field">
                <label>Direct Email Address *</label>
                <input
                  type="email"
                  placeholder="sarah@apexlegal.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={fieldErrors.email ? 'error' : ''}
                />
                {fieldErrors.email && <small className="error-text">{fieldErrors.email}</small>}
              </div>

              <div className="field">
                <label>WhatsApp / Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={fieldErrors.phone ? 'error' : ''}
                />
                {fieldErrors.phone && <small className="error-text">{fieldErrors.phone}</small>}
              </div>
            </div>

            {/* Business Category Selection */}
            <div className="field" style={{ marginTop: '18px' }}>
              <label>Business Industry / Vertical *</label>
              <div className="business-type-chips">
                {BUSINESS_TYPES.map((bt) => {
                  const isSelected = formData.business_type === bt;
                  return (
                    <motion.button
                      key={bt}
                      type="button"
                      className={`chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, business_type: bt })}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={TRANSITIONS.buttonSpring}
                    >
                      {isSelected && <Check size={12} style={{ marginRight: '4px' }} />}
                      {bt}
                    </motion.button>
                  );
                })}
              </div>
              {fieldErrors.business_type && <small className="error-text">{fieldErrors.business_type}</small>}

              {formData.business_type === 'Other' && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Specify your business industry..."
                    value={formData.custom_business_type}
                    onChange={(e) => setFormData({ ...formData, custom_business_type: e.target.value })}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* SECTION 2: CURRENT PRESENCE & TARGET AUDIENCE */}
          <motion.div
            className="discovery-section"
            style={{ marginTop: '36px' }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="discovery-section-header">
              <span className="discovery-step-num">02</span>
              <div>
                <h3 className="discovery-section-title">Current Presence &amp; Ideal Audience</h3>
                <p className="discovery-section-desc">What exists today and who are you looking to attract?</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginTop: '16px' }}>
              <div className="field">
                <label>Current Website or Main Social URL</label>
                <input
                  type="text"
                  placeholder="https://yourcurrentsite.com or @instagram"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
                <small className="help-text">Leave blank if starting fresh.</small>
              </div>

              <div className="field">
                <label>Primary Target Audience / ICP</label>
                <input
                  type="text"
                  placeholder="e.g. Local homeowners, B2B founders, fitness clients"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                />
              </div>
            </div>
          </motion.div>

          {/* SECTION 3: PAGES & SCOPE */}
          <motion.div
            className="discovery-section"
            style={{ marginTop: '36px' }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="discovery-section-header">
              <span className="discovery-step-num">03</span>
              <div>
                <h3 className="discovery-section-title">Required Pages &amp; Structure</h3>
                <p className="discovery-section-desc">Select the pages you need included on your new site.</p>
              </div>
            </div>

            <div className="checkbox-grid" style={{ marginTop: '16px' }}>
              {AVAILABLE_PAGES.map((page) => {
                const isChecked = formData.selected_pages.includes(page);
                return (
                  <motion.div
                    key={page}
                    className={`checkbox-card ${isChecked ? 'checked' : ''}`}
                    onClick={() => handlePageToggle(page)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <div className="checkbox-indicator">
                      {isChecked && <Check size={12} color="#10100f" />}
                    </div>
                    <span>{page}</span>
                  </motion.div>
                );
              })}
            </div>
            {fieldErrors.selected_pages && <small className="error-text">{fieldErrors.selected_pages}</small>}
          </motion.div>

          {/* SECTION 4: REQUIRED FEATURES */}
          <motion.div
            className="discovery-section"
            style={{ marginTop: '36px' }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="discovery-section-header">
              <span className="discovery-step-num">04</span>
              <div>
                <h3 className="discovery-section-title">Required Interactive Features</h3>
                <p className="discovery-section-desc">What interactive capabilities do you need built?</p>
              </div>
            </div>

            <div className="checkbox-grid" style={{ marginTop: '16px' }}>
              {AVAILABLE_FEATURES.map((feat) => {
                const isChecked = formData.selected_features.includes(feat);
                return (
                  <motion.div
                    key={feat}
                    className={`checkbox-card ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleFeatureToggle(feat)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <div className="checkbox-indicator">
                      {isChecked && <Check size={12} color="#10100f" />}
                    </div>
                    <span>{feat}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* SECTION 5: INSPIRATIONS & REFERENCE SITES */}
          <motion.div
            className="discovery-section"
            style={{ marginTop: '36px' }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="discovery-section-header">
              <span className="discovery-step-num">05</span>
              <div>
                <h3 className="discovery-section-title">Reference Websites &amp; Design Inspirations</h3>
                <p className="discovery-section-desc">Share 1 to 3 website links or Sorted Club template blueprint names you admire.</p>
              </div>
            </div>

            <div className="field" style={{ marginTop: '16px' }}>
              <textarea
                rows={2}
                placeholder="e.g. Apex Studio template, stripe.com for clean aesthetics, or competitor URL..."
                value={formData.reference_websites}
                onChange={(e) => setFormData({ ...formData, reference_websites: e.target.value })}
              />
            </div>
          </motion.div>

          {/* SECTION 6: BUDGET & TIMELINE */}
          <motion.div
            className="discovery-section"
            style={{ marginTop: '36px' }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            <div className="discovery-section-header">
              <span className="discovery-step-num">06</span>
              <div>
                <h3 className="discovery-section-title">Budget Allocation &amp; Target Launch</h3>
                <p className="discovery-section-desc">Help us align the optimal engineering tier to your budget.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginTop: '16px' }}>
              <div className="field">
                <label>Allocated Budget Tier</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                >
                  {BUDGET_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Preferred Launch Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                >
                  {LAUNCH_TIMELINES.map((tl) => (
                    <option key={tl} value={tl}>
                      {tl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field" style={{ marginTop: '16px' }}>
              <label>Additional Notes / Specific Requirements</label>
              <textarea
                rows={3}
                placeholder="Any special integrations, brand colors, or questions for our squad?"
                value={formData.additional_notes}
                onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              />
            </div>
          </motion.div>

          {/* SUBMIT BUTTON */}
          <div style={{ marginTop: '40px', borderTop: '1px solid var(--line)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              🔒 Information is kept strictly confidential. 24h proposal turnaround SLA.
            </div>

            <motion.button
              type="submit"
              className="primary"
              disabled={isSubmitting}
              style={{ background: 'var(--acid)', color: '#10100f', height: '46px', padding: '0 28px', fontSize: '14px' }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
            >
              {isSubmitting ? (
                'Submitting Discovery Brief...'
              ) : (
                <>
                  Submit Discovery Brief <Send size={15} style={{ marginLeft: '6px' }} />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </main>

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
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/admin')}>Admin Access</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            © 2026 The Sorted Club. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
