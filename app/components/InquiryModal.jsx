import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  Building2,
  Globe,
  Mail,
  Phone,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Layers,
  Tag
} from 'lucide-react';
import { submitLead } from '../api/client';

const SERVICE_OPTIONS = [
  'Website / Build',
  'Marketing / Growth',
  'AI / Automation',
  'Hiring',
  'Custom software',
  'Not sure yet'
];

const BUSINESS_TYPES = [
  'Restaurants and Cafés',
  'Coaching Institutes',
  'Salons and Spas',
  'Real Estate',
  'E-commerce & Retail',
  'Local Business & Services',
  'Freelancers and Personal Brands',
  'Booking Websites',
  'Startup Landing Pages',
  'Portfolio Websites',
  'Agency & Consulting',
  'Healthcare & Wellness',
  'Other'
];

const BUDGET_RANGES = [
  '< $2,500',
  '$2,500 - $5,000',
  '$5,000 - $15,000',
  '$15,000 - $50,000',
  '$50,000+'
];

export default function InquiryModal({ isOpen, onClose, initialService = '', initialTemplate = null }) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);

  const getInitialBusinessType = (tmpl) => {
    if (!tmpl) return 'Agency & Consulting';
    if (BUSINESS_TYPES.includes(tmpl.category)) return tmpl.category;
    if (tmpl.category === 'E-commerce') return 'E-commerce & Retail';
    if (tmpl.category === 'Local Service Businesses') return 'Local Business & Services';
    return 'Agency & Consulting';
  };

  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    email: '',
    phone: '',
    website: '',
    business_type: getInitialBusinessType(initialTemplate),
    service_interest: initialService || 'Website / Build',
    problem: initialTemplate
      ? `I would like to build a website based on the ${initialTemplate.name} demo concept (${initialTemplate.category}). Required features: ${initialTemplate.mainFeatures ? initialTemplate.mainFeatures.slice(0, 3).join(', ') : 'Modern responsive website'}.`
      : '',
    budget: initialTemplate?.budgetRange || '$2,500 - $5,000',
    consent: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedLead, setSubmittedLead] = useState(null);

  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

  // Sync when initialTemplate or initialService changes on open
  useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      setFormData((prev) => ({
        ...prev,
        service_interest: 'Website / Build',
        business_type: getInitialBusinessType(initialTemplate),
        problem: `I would like to build a website based on the ${initialTemplate.name} demo concept (${initialTemplate.category}). Required features: ${initialTemplate.mainFeatures ? initialTemplate.mainFeatures.slice(0, 3).join(', ') : 'Modern responsive website'}.`,
        budget: initialTemplate.budgetRange || prev.budget
      }));
    } else if (initialService && SERVICE_OPTIONS.includes(initialService)) {
      setFormData((prev) => ({ ...prev, service_interest: initialService }));
    }
  }, [initialTemplate, initialService]);

  // Lock body scroll and focus on name input on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  const validatePhone = (raw) => {
    const clean = (raw || '').trim();
    if (!clean) return 'Please enter your phone or WhatsApp number.';
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length < 7) {
      return 'Phone number is too short (at least 7 digits required).';
    }
    if (digitsOnly.length > 15) {
      return 'Phone number is too long (maximum 15 digits).';
    }
    // 10 digits Indian mobile format check
    if (digitsOnly.length === 10 && !'6789'.includes(digitsOnly[0])) {
      return '10-digit Indian mobile numbers must start with 6, 7, 8, or 9.';
    }
    // 11 digits starting with 0
    if (digitsOnly.length === 11 && digitsOnly.startsWith('0') && !'6789'.includes(digitsOnly[1])) {
      return '11-digit numbers starting with 0 must be followed by 6, 7, 8, or 9.';
    }
    // 12 digits starting with 91
    if (digitsOnly.length === 12 && digitsOnly.startsWith('91') && !'6789'.includes(digitsOnly[2])) {
      return 'Indian numbers with 91 prefix must have a 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    return null;
  };

  const validateEmail = (raw) => {
    const clean = (raw || '').trim();
    if (!clean) return 'Please enter your work email.';
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(clean) || clean.includes('..') || clean.endsWith('.')) {
      return 'Please enter a valid email address (e.g. alex@acmestudio.com).';
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters).';
    }

    if (!formData.business_name.trim() || formData.business_name.trim().length < 2) {
      newErrors.business_name = 'Please enter your company or business name.';
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    if (!formData.business_type.trim()) {
      newErrors.business_type = 'Please select your business category.';
    }

    if (!formData.service_interest.trim()) {
      newErrors.service_interest = 'Please select what needs sorting.';
    }

    if (!formData.problem.trim()) {
      newErrors.problem = 'Please tell us briefly about your project brief or requirements.';
    } else if (formData.problem.trim().length < 10) {
      newErrors.problem = 'Please provide a little more detail (at least 10 characters).';
    }

    if (!formData.budget.trim()) {
      newErrors.budget = 'Please select an estimated budget range.';
    }

    if (!formData.consent) {
      newErrors.consent = 'Please confirm consent to be contacted regarding this brief.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    if (!validate()) {
      if (modalRef.current) {
        modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get('utm_source');
      const utmMedium = searchParams.get('utm_medium');
      const utmCampaign = searchParams.get('utm_campaign');
      const utmContent = searchParams.get('utm_content');
      const refParam = searchParams.get('ref') || searchParams.get('referrer');

      let calculatedSource = 'Website';
      if (selectedTemplate) {
        calculatedSource = `Website - Template: ${selectedTemplate.name} (${selectedTemplate.badge || 'Demo Concept'})`;
      } else if (refParam) {
        calculatedSource = `Referral (${refParam})`;
      } else if (utmSource) {
        calculatedSource = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
      }

      const payload = {
        name: formData.name.trim(),
        business_name: formData.business_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        website: formData.website.trim() || null,
        business_type: formData.business_type.trim(),
        service_interest: formData.service_interest.trim(),
        problem: formData.problem.trim(),
        budget: formData.budget.trim(),
        source: calculatedSource,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        utm_content: utmContent || null,
        referral_source: refParam || null,
        consent: formData.consent
      };

      const result = await submitLead(payload);
      setSubmittedLead(result);
      setIsSuccess(true);
      setErrors({});
      if (modalRef.current) {
        modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...err.fieldErrors }));
      }
      setSubmitError(
        err.message ||
          'Failed to submit inquiry. Your entered data has been preserved. Please try again.'
      );
      if (modalRef.current) {
        modalRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setSubmittedLead(null);
    setSubmitError(null);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      business_name: '',
      email: '',
      phone: '',
      website: '',
      business_type: 'Agency & Consulting',
      service_interest: initialService || 'Website / Build',
      problem: '',
      budget: '$5,000 - $15,000',
      consent: true
    });
    setErrors({});
    onClose();
  };

  const handleStartAnother = () => {
    setIsSuccess(false);
    setSubmittedLead(null);
    setSubmitError(null);
    setSelectedTemplate(null);
    setFormData({
      name: '',
      business_name: '',
      email: '',
      phone: '',
      website: '',
      business_type: 'Agency & Consulting',
      service_interest: 'Website / Build',
      problem: '',
      budget: '$5,000 - $15,000',
      consent: true
    });
    setErrors({});
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div className="modal-container" ref={modalRef}>
        <button
          className="modal-close-btn"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close inquiry modal"
          type="button"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="inquiry-success-view">
            <div className="success-badge-icon">
              <Sparkles size={32} color="#10100f" />
            </div>

            <p className="eyebrow" style={{ color: '#68665e', marginTop: '16px' }}>
              CONFIRMED INQUIRY #{submittedLead?.id || '2026'}
            </p>

            <h2 id="inquiry-modal-title" className="success-heading">
              You're in.<br />
              <em>We'll get this sorted.</em>
            </h2>

            <div className="success-tagline">
              Welcome to The Sorted Club.
            </div>

            <p className="success-copy">
              We've received the brief for <strong>{submittedLead?.business_name || formData.business_name}</strong> regarding <strong>{submittedLead?.service_interest || formData.service_interest}</strong>. Our engineering team will review the requirements and reach out via <strong>{submittedLead?.email || formData.email}</strong> or WhatsApp within 24 hours.
            </p>

            <div className="success-summary-box">
              <div className="summary-item">
                <span>Contact Person</span>
                <strong>{submittedLead?.name || formData.name}</strong>
              </div>
              <div className="summary-item">
                <span>Email / WhatsApp</span>
                <strong>{submittedLead?.email || formData.email}</strong>
              </div>
              {selectedTemplate && (
                <div className="summary-item summary-item-blueprint full-width">
                  <span>Selected Blueprint</span>
                  <div className="summary-blueprint-header">
                    <strong className="blueprint-name">{selectedTemplate.name}</strong>
                    <span className="summary-item-badge">{selectedTemplate.badge || 'Demo Concept'}</span>
                  </div>
                  <div className="summary-blueprint-meta">
                    <span>{selectedTemplate.category}</span>
                    <span>•</span>
                    <span>Starting {selectedTemplate.startingPrice}</span>
                    <span>•</span>
                    <span>{selectedTemplate.turnaround}</span>
                  </div>
                </div>
              )}
              <div className="summary-item">
                <span>Service Focus</span>
                <strong>{submittedLead?.service_interest || formData.service_interest}</strong>
              </div>
              <div className="summary-item">
                <span>Budget Estimate</span>
                <strong>{submittedLead?.budget || formData.budget}</strong>
              </div>
            </div>

            <div className="success-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="primary"
                style={{ width: '100%', cursor: 'pointer', height: '48px' }}
                onClick={handleResetAndClose}
              >
                Back to The Sorted Club <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', height: '42px', fontSize: '13px' }}
                onClick={handleStartAnother}
              >
                <RotateCcw size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Submit Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          <div className="inquiry-form-view">
            <div className="inquiry-header">
              <div className="eyebrow">GET SORTED / BUSINESS BRIEF</div>
              <h2 id="inquiry-modal-title">
                {selectedTemplate ? (
                  <>Build a website like<br /><em>{selectedTemplate.name}</em></>
                ) : (
                  <>Tell us what needs<br /><em>sorting.</em></>
                )}
              </h2>
              <p>One direct team. Clear turnaround. Zero agency runaround.</p>
            </div>

            {/* Selected Template Banner */}
            {selectedTemplate && (
              <div className="selected-template-banner" role="region" aria-label="Selected website template details">
                <div className="template-banner-content">
                  <div className="template-banner-tags">
                    <span className="template-badge-pill">Selected Blueprint</span>
                    <span className="template-concept-tag">{selectedTemplate.badge || 'Demo Concept'}</span>
                  </div>
                  <h4 className="template-banner-title">{selectedTemplate.name}</h4>
                  <div className="template-banner-sub">
                    <span>{selectedTemplate.category}</span>
                    <span>•</span>
                    <span>Starting {selectedTemplate.startingPrice}</span>
                    <span>•</span>
                    <span>{selectedTemplate.turnaround}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="clear-template-btn"
                  onClick={() => setSelectedTemplate(null)}
                  title="Remove template selection"
                  aria-label="Remove template selection"
                >
                  <X size={14} /> Clear
                </button>
              </div>
            )}

            {submitError && (
              <div className="error-banner" role="alert" style={{ marginBottom: '18px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="inquiry-form">
              {/* Row 1: Name & Business Name */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inquiry-name">
                    Full Name <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" aria-hidden="true" />
                    <input
                      ref={nameInputRef}
                      id="inquiry-name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      className={errors.name ? 'has-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'inquiry-name-error' : undefined}
                    />
                  </div>
                  {errors.name && (
                    <span id="inquiry-name-error" className="field-error" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="inquiry-business">
                    Company / Business Name <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="input-wrapper">
                    <Building2 size={16} className="input-icon" aria-hidden="true" />
                    <input
                      id="inquiry-business"
                      type="text"
                      autoComplete="organization"
                      placeholder="e.g. Saffron Bistro / Acme Studio"
                      value={formData.business_name}
                      onChange={(e) => {
                        setFormData({ ...formData, business_name: e.target.value });
                        if (errors.business_name) setErrors({ ...errors, business_name: null });
                      }}
                      className={errors.business_name ? 'has-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(errors.business_name)}
                      aria-describedby={errors.business_name ? 'inquiry-business-error' : undefined}
                    />
                  </div>
                  {errors.business_name && (
                    <span id="inquiry-business-error" className="field-error" role="alert">
                      {errors.business_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inquiry-email">
                    Work Email <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" aria-hidden="true" />
                    <input
                      id="inquiry-email"
                      type="email"
                      autoComplete="email"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      className={errors.email ? 'has-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'inquiry-email-error' : undefined}
                    />
                  </div>
                  {errors.email && (
                    <span id="inquiry-email-error" className="field-error" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="inquiry-phone">
                    Phone / WhatsApp <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" aria-hidden="true" />
                    <input
                      id="inquiry-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210 or 9876543210"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      className={errors.phone ? 'has-error' : ''}
                      aria-required="true"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'inquiry-phone-error' : 'inquiry-phone-hint'}
                    />
                  </div>
                  {errors.phone ? (
                    <span id="inquiry-phone-error" className="field-error" role="alert">
                      {errors.phone}
                    </span>
                  ) : (
                    <span id="inquiry-phone-hint" className="field-hint">
                      Indian (+91 / 10 digits) or international with country code
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Website & Business Category */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="inquiry-website">
                    Existing Website URL <span className="opt">(optional)</span>
                  </label>
                  <div className="input-wrapper">
                    <Globe size={16} className="input-icon" aria-hidden="true" />
                    <input
                      id="inquiry-website"
                      type="url"
                      autoComplete="url"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="inquiry-business-type">
                    Business Category <span className="req" aria-hidden="true">*</span>
                    <span className="sr-only">(required)</span>
                  </label>
                  <select
                    id="inquiry-business-type"
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    className="custom-select"
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service Interest Selector (Hidden or condensed if template selected) */}
              <div className="form-group full-width">
                <label id="service-interest-label">
                  What do you need sorted? <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <div className="service-pills-grid" role="radiogroup" aria-labelledby="service-interest-label">
                  {SERVICE_OPTIONS.map((service) => {
                    const isSelected = formData.service_interest === service;
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        key={service}
                        className={`service-pill-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setFormData({ ...formData, service_interest: service });
                          if (errors.service_interest) setErrors({ ...errors, service_interest: null });
                        }}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
                {errors.service_interest && (
                  <span className="field-error" role="alert">{errors.service_interest}</span>
                )}
              </div>

              {/* Problem / Features Brief */}
              <div className="form-group full-width">
                <label htmlFor="inquiry-problem">
                  Describe your requirements &amp; required features <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <textarea
                  id="inquiry-problem"
                  rows={3}
                  placeholder="What are you trying to build? Mention any specific features (e.g. table booking, payment gateway, custom colors, CRM webhook)..."
                  value={formData.problem}
                  onChange={(e) => {
                    setFormData({ ...formData, problem: e.target.value });
                    if (errors.problem) setErrors({ ...errors, problem: null });
                  }}
                  className={errors.problem ? 'has-error' : ''}
                  aria-required="true"
                  aria-invalid={Boolean(errors.problem)}
                  aria-describedby={errors.problem ? 'inquiry-problem-error' : undefined}
                />
                {errors.problem && (
                  <span id="inquiry-problem-error" className="field-error" role="alert">
                    {errors.problem}
                  </span>
                )}
              </div>

              {/* Budget Range */}
              <div className="form-group full-width">
                <label id="budget-label">
                  Approximate Budget <span className="req" aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <div className="budget-pills-grid" role="radiogroup" aria-labelledby="budget-label">
                  {BUDGET_RANGES.map((range) => {
                    const isSelected = formData.budget === range;
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        key={range}
                        className={`budget-pill-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, budget: range })}
                      >
                        {range}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="form-group consent-group">
                <label className="checkbox-label" htmlFor="inquiry-consent">
                  <input
                    id="inquiry-consent"
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => {
                      setFormData({ ...formData, consent: e.target.checked });
                      if (errors.consent) setErrors({ ...errors, consent: null });
                    }}
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? 'inquiry-consent-error' : undefined}
                  />
                  <span>
                    I consent to be contacted by The Sorted Club regarding this business inquiry.
                  </span>
                </label>
                {errors.consent && (
                  <span id="inquiry-consent-error" className="field-error" role="alert">
                    {errors.consent}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary form-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spinner" aria-hidden="true" />
                      Submitting your brief...
                    </>
                  ) : (
                    <>
                      {selectedTemplate ? 'Submit Website Request' : 'Submit Inquiry'} <ArrowRight size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
