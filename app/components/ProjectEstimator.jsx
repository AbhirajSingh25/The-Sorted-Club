import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  BriefcaseBusiness,
  Bot,
  Users,
  Check,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  MessageSquare,
  Info,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PILLARS_CONFIG, USD_INR_EXCHANGE_NOTE } from './pricingData';
import { TRANSITIONS } from '../utils/motion';
import { useCarouselPagination } from '../utils/useCarouselPagination';
import { useIsMobile } from '../utils/responsive';
import SignaturePerimeterOutline from './SignaturePerimeterOutline';

const ICON_MAP = {
  Code2,
  BriefcaseBusiness,
  Bot,
  Users
};

export default function ProjectEstimator({ onOpenInquiry, initialPillar = 'build', initialTier = null }) {
  const [selectedPillarId, setSelectedPillarId] = useState(initialPillar);
  const [selectedTierId, setSelectedTierId] = useState(initialTier || 'business');
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [expandedTierId, setExpandedTierId] = useState(null);
  const [isEstimatorInView, setIsEstimatorInView] = useState(false);
  const isMobile = useIsMobile(768);

  const summaryRef = useRef(null);
  const estimatorCardRef = useRef(null);
  const tiersContainerRef = useRef(null);
  const tierCardRefs = useRef({});

  const currentPillar = useMemo(() => {
    return PILLARS_CONFIG.find((p) => p.id === selectedPillarId) || PILLARS_CONFIG[0];
  }, [selectedPillarId]);

  const { activeDotIndex, scrollToIndex } = useCarouselPagination(
    tiersContainerRef,
    currentPillar.tiers.length
  );

  useEffect(() => {
    if (!estimatorCardRef.current) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsEstimatorInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsEstimatorInView(entry.isIntersecting);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(estimatorCardRef.current);
    return () => observer.disconnect();
  }, []);

  // When pillar changes, switch to default popular tier and reset add-ons
  const handlePillarChange = (pillarId) => {
    setSelectedPillarId(pillarId);
    const pillar = PILLARS_CONFIG.find((p) => p.id === pillarId) || PILLARS_CONFIG[0];
    const defaultTier = pillar.tiers.find((t) => t.popular) || pillar.tiers[0];
    setSelectedTierId(defaultTier.id);
    setSelectedAddonIds([]);
    setExpandedTierId(null);
    if (tiersContainerRef.current) {
      tiersContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const currentTier = useMemo(() => {
    return currentPillar.tiers.find((t) => t.id === selectedTierId) || currentPillar.tiers[0];
  }, [currentPillar, selectedTierId]);

  const toggleAddon = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Calculation logic with safe commercial defaults
  const calculation = useMemo(() => {
    const isUSD = currency === 'USD';
    const basePrice = isUSD ? (currentTier?.priceUSD ?? 0) : (currentTier?.priceINR ?? 0);

    const addonsCost = selectedAddonIds.reduce((sum, addonId) => {
      const addon = (currentPillar.addons || []).find((a) => a.id === addonId);
      if (!addon) return sum;
      return sum + (isUSD ? (addon.priceUSD ?? 0) : (addon.priceINR ?? 0));
    }, 0);

    const total = basePrice + addonsCost;

    const formattedBase = currentTier?.isSuccessBased
      ? 'Pay on Success'
      : isUSD
      ? `$${basePrice.toLocaleString()}`
      : `₹${basePrice.toLocaleString()}`;

    const formattedAddons = isUSD
      ? `$${addonsCost.toLocaleString()}`
      : `₹${addonsCost.toLocaleString()}`;

    const formattedTotal = currentTier?.isSuccessBased
      ? 'Pay on Success'
      : isUSD
      ? `$${total.toLocaleString()}`
      : `₹${total.toLocaleString()}`;

    return {
      basePrice,
      addonsCost,
      total,
      formattedBase,
      formattedAddons,
      formattedTotal,
      isRecurring: Boolean(currentTier?.isRecurring),
      isSuccessBased: Boolean(currentTier?.isSuccessBased)
    };
  }, [currency, currentTier, currentPillar, selectedAddonIds]);

  const activeAddonsList = useMemo(() => {
    return (currentPillar.addons || []).filter((a) => selectedAddonIds.includes(a.id));
  }, [currentPillar, selectedAddonIds]);

  // Primary CTA: Pass full configuration into enquiry form
  const handleEnquireWithEstimate = () => {
    const addonNames = activeAddonsList.map((a) => a.name);
    const scopeSummary = `${currentPillar.name} — ${currentTier.name} (${currentTier.scopeLabel || ''})`;
    const pricingSummary = calculation.isSuccessBased
      ? 'Success-Based (Zero Upfront)'
      : `${calculation.formattedTotal}${calculation.isRecurring ? '/mo' : ''} [Base: ${calculation.formattedBase}${calculation.addonsCost > 0 ? ` + Add-ons: ${calculation.formattedAddons}` : ''}]`;

    const totalINRNum = currentTier.isSuccessBased
      ? 0
      : (currentTier.priceINR ?? 0) +
        selectedAddonIds.reduce((sum, id) => sum + ((currentPillar.addons || []).find((x) => x.id === id)?.priceINR ?? 0), 0);

    const totalUSDNum = currentTier.isSuccessBased
      ? 0
      : (currentTier.priceUSD ?? 0) +
        selectedAddonIds.reduce((sum, id) => sum + ((currentPillar.addons || []).find((x) => x.id === id)?.priceUSD ?? 0), 0);

    const dualPriceINR = currentTier.isSuccessBased ? 'Pay on Success' : `₹${totalINRNum.toLocaleString()}`;
    const dualPriceUSD = currentTier.isSuccessBased ? 'Pay on Success' : `$${totalUSDNum.toLocaleString()}`;

    onOpenInquiry({
      service: currentPillar.serviceKey,
      package: currentTier.name,
      scope: currentTier.name,
      pillar: currentPillar.name,
      addons: addonNames,
      currency,
      estimatedPrice: calculation.formattedTotal,
      priceINR: dualPriceINR,
      priceUSD: dualPriceUSD,
      total: calculation.total,
      totalINR: totalINRNum,
      totalUSD: totalUSDNum,
      problem: `[Project Estimator Configuration]
Service: ${currentPillar.name} (${currentPillar.title})
Selected Scope: ${currentTier.name} [${currentTier.scopeLabel || 'Custom'}]
Turnaround: ${currentTier.turnaround}
${addonNames.length > 0 ? `Selected Add-ons (${addonNames.length}): ${addonNames.join(', ')}\n` : 'No optional add-ons selected.\n'}Estimated Investment: ${pricingSummary}
Payment Terms: 50% deposit to start, 50% upon live staging approval
Currency: ${currency}

Please review this configuration and provide our formal statement of work and kickoff timeline.`,
      budget: calculation.isSuccessBased
        ? 'Pay on Success'
        : `${calculation.formattedTotal} (${currency})`
    });
  };

  const scrollToSummary = () => {
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hi The Sorted Club, I configured an estimate for ${currentPillar.name} (${currentTier.name}). Estimated investment: ${calculation.formattedTotal}${calculation.isRecurring ? '/mo' : ''}. I'd like to confirm the sprint start date.`
  );

  return (
    <div className="project-estimator-card" id="estimator" ref={estimatorCardRef}>
      {/* Top Header & Context */}
      <div className="estimator-topbar">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="var(--ink)" />
            INTERACTIVE PROJECT ESTIMATOR
          </div>
          <h3 className="estimator-title">
            Configure your project scope.<br />
            <i>Instant commercial transparency.</i>
          </h3>
          <p className="estimator-sub">
            Choose your discipline, select package complexity, and add modular capabilities. Transparent milestone pricing: 50% upfront, 50% only upon live staging sign-off.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="estimator-currency-wrapper">
          <div className="currency-switch-pill" role="radiogroup" aria-label="Select currency">
            <button
              type="button"
              className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
              onClick={() => setCurrency('INR')}
              aria-checked={currency === 'INR'}
              role="radio"
            >
              ₹ INR
            </button>
            <button
              type="button"
              className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
              aria-checked={currency === 'USD'}
              role="radio"
            >
              $ USD
            </button>
          </div>
          <span className="estimator-rate-note">
            {currency === 'USD' ? 'Cross-border rate' : 'Domestic commercial rate'}
          </span>
        </div>
      </div>

      {/* Compact Progress Header for Mobile Viewports */}
      <div className="estimator-mobile-summary-pill" aria-live="polite">
        <div className="mobile-step-indicator">
          <span className="mobile-step-badge">ESTIMATOR CONFIG</span>
          <span className="mobile-step-val">{currentPillar.name} • {currentTier.name}</span>
        </div>
        <div className="mobile-step-price">
          <strong>{calculation.formattedTotal}</strong>
          {calculation.isRecurring && <span>/mo</span>}
        </div>
      </div>

      {/* Step Indicator Strip */}
      <div className="estimator-progress-strip" role="region" aria-label="Estimator progress steps">
        <div className="progress-step-pill active">
          <span className="step-num-circle">01</span>
          <span className="step-label-text">Discipline</span>
          <strong className="step-val-text">{currentPillar.name}</strong>
        </div>
        <div className="progress-divider" aria-hidden="true">→</div>
        <div className="progress-step-pill active">
          <span className="step-num-circle">02</span>
          <span className="step-label-text">Scope</span>
          <strong className="step-val-text">{currentTier.name}</strong>
        </div>
        <div className="progress-divider" aria-hidden="true">→</div>
        <div className="progress-step-pill active">
          <span className="step-num-circle">03</span>
          <span className="step-label-text">Add-ons</span>
          <strong className="step-val-text">{activeAddonsList.length} selected</strong>
        </div>
        <div className="progress-divider" aria-hidden="true">→</div>
        <div className="progress-step-pill highlight">
          <span className="step-num-circle">04</span>
          <span className="step-label-text">Estimate</span>
          <strong className="step-val-text">{calculation.formattedTotal}</strong>
        </div>
      </div>

      {/* Responsive Two-Column Layout Container */}
      <div className="estimator-main-layout">
        {/* Left Column: Interactive Configuration Steps 1, 2, 3 */}
        <div className="estimator-config-col">
          {/* STEP 01: CHOOSE A DISCIPLINE */}
          <div className="estimator-step-block">
            <div className="step-header-row">
              <label className="estimator-step-label">
                <span>STEP 01</span> / Choose a Discipline
              </label>
              <span className="step-hint-text">Select your core engagement stream</span>
            </div>

            <div className="estimator-pillars-grid">
              {PILLARS_CONFIG.map((pillar) => {
                const Icon = ICON_MAP[pillar.iconKey] || Code2;
                const isSelected = pillar.id === selectedPillarId;
                return (
                  <motion.button
                    type="button"
                    key={pillar.id}
                    className={`estimator-pillar-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePillarChange(pillar.id)}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={TRANSITIONS.buttonSpring}
                  >
                    <div className="pillar-btn-icon">
                      <Icon size={18} />
                    </div>
                    <div className="pillar-btn-info">
                      <div className="pillar-header-wrap">
                        <strong>{pillar.name}</strong>
                        {isSelected && <span className="pillar-active-tag">Active</span>}
                      </div>
                      <span>{pillar.title}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* STEP 02: SELECT A SCOPE */}
          <div className="estimator-step-block">
            <div className="step-header-row">
              <label className="estimator-step-label">
                <span>STEP 02</span> / Select Scope Complexity for <strong>{currentPillar.name}</strong>
              </label>
              <span className="step-hint-text">
                Choose the package complexity that matches your deliverables
              </span>
            </div>

            {/* Tiers Grid / Horizontal Carousel */}
            <div
              ref={tiersContainerRef}
              className={`estimator-tiers-grid ${currentPillar.tiers.length === 2 ? 'two-col' : 'three-col'}`}
            >
              {currentPillar.tiers.map((tier, idx) => {
                const isSelected = tier.id === selectedTierId;
                const isFocused = isMobile ? activeDotIndex === idx : isSelected;
                const isExpanded = expandedTierId === tier.id;
                const priceStr = tier.isSuccessBased
                  ? 'Pay on Success'
                  : currency === 'USD'
                  ? `$${tier.priceUSD.toLocaleString()}`
                  : `₹${tier.priceINR.toLocaleString()}`;

                return (
                  <motion.div
                    key={tier.id}
                    ref={(el) => {
                      if (el) tierCardRefs.current[tier.id] = el;
                    }}
                    className={`estimator-tier-card ${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                    onClick={() => setSelectedTierId(tier.id)}
                    role="button"
                    tabIndex={0}
                    whileHover={{ y: -3 }}
                    transition={TRANSITIONS.cardSpring}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedTierId(tier.id);
                      }
                    }}
                  >
                    <SignaturePerimeterOutline
                      isFocused={isFocused}
                      isSelected={isSelected}
                      borderRadius={10}
                    />

                    <div className="tier-card-head">
                      <div className="tier-title-wrap">
                        <h4>{tier.name}</h4>
                        {tier.popular && <span className="popular-badge">Most Popular</span>}
                        {tier.scopeBadge && !tier.popular && (
                          <span className="tier-scope-badge">{tier.scopeBadge}</span>
                        )}
                      </div>
                      <div className="tier-price-tag">
                        <strong>{priceStr}</strong>
                        {tier.isRecurring && <span>/mo</span>}
                      </div>
                    </div>

                    <div className="tier-scope-indicator">
                      <Sliders size={12} />
                      <span>Scope: <strong>{tier.scopeLabel}</strong></span>
                    </div>

                    <p className="tier-desc">{tier.desc}</p>

                    <div className="tier-turnaround">
                      <Clock size={12} /> Turnaround: {tier.turnaround}
                    </div>

                    <ul className="tier-deliverables-list">
                      {tier.deliverables.slice(0, 3).map((item, idx) => (
                        <li key={idx}>
                          <Check size={13} className="check-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                      <AnimatePresence>
                        {isExpanded &&
                          tier.deliverables.slice(3).map((item, idx) => (
                            <motion.li
                              key={`more-${idx}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Check size={13} className="check-icon" />
                              <span>{item}</span>
                            </motion.li>
                          ))}
                      </AnimatePresence>
                    </ul>

                    {tier.deliverables.length > 3 && (
                      <button
                        type="button"
                        className="tier-expand-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTierId(isExpanded ? null : tier.id);
                        }}
                      >
                        {isExpanded ? (
                          <>Fewer details <ChevronUp size={12} /></>
                        ) : (
                          <>+{tier.deliverables.length - 3} more specs <ChevronDown size={12} /></>
                        )}
                      </button>
                    )}

                    <div className="tier-select-indicator">
                      <div className={`radio-dot ${isSelected ? 'active' : ''}`} />
                      <span>{isSelected ? '✓ Selected' : 'Choose Option'}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Carousel Pagination Indicators on Mobile */}
            {currentPillar.tiers.length > 1 && (
              <div className="estimator-carousel-indicators" aria-label="Package Carousel Controls">
                <span className="carousel-swipe-hint">
                  Swipe to browse packages →
                </span>
                <div className="carousel-dots-list">
                  {currentPillar.tiers.map((t, idx) => {
                    const isActive = activeDotIndex === idx;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`carousel-dot-btn ${isActive ? 'active' : ''}`}
                        onClick={() => scrollToIndex(idx)}
                        aria-label={`View ${t.name} package`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 03: ADD OPTIONAL CAPABILITIES */}
          {currentPillar.addons && currentPillar.addons.length > 0 && (
            <div className="estimator-step-block">
              <div className="step-header-row">
                <label className="estimator-step-label">
                  <span>STEP 03</span> / Add Optional Capabilities
                </label>
                <span className="step-hint-text">Selectable acceleration &amp; specialized modules</span>
              </div>

              <div className="estimator-addons-grid">
                {currentPillar.addons.map((addon) => {
                  const isChecked = selectedAddonIds.includes(addon.id);
                  const addonCost =
                    currency === 'USD'
                      ? `+$${addon.priceUSD.toLocaleString()}`
                      : `+₹${addon.priceINR.toLocaleString()}`;

                  return (
                    <motion.div
                      key={addon.id}
                      className={`estimator-addon-card ${isChecked ? 'active' : ''}`}
                      onClick={() => toggleAddon(addon.id)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      transition={TRANSITIONS.buttonSpring}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleAddon(addon.id);
                        }
                      }}
                    >
                      <div className={`addon-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked ? <Check size={13} /> : <Plus size={13} />}
                      </div>
                      <div className="addon-info">
                        <div className="addon-title-row">
                          <strong>{addon.name}</strong>
                          <span className="addon-price">{addonCost}</span>
                        </div>
                        <p className="addon-desc">{addon.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Commercial Summary & Actions */}
        <div className="estimator-summary-col" ref={summaryRef}>
          {/* STEP 04: REVIEW YOUR ESTIMATE & ACTIONS */}
          <div className="estimator-summary-panel">
            {/* Panel Header */}
            <div className="summary-header">
              <div className="summary-header-meta">
                <div className="summary-badge">
                  <ShieldCheck size={13} /> STEP 04 • LIVE ESTIMATE
                </div>
                <h4 className="summary-heading">Commercial Scope &amp; Investment</h4>
              </div>

              <div className="summary-price-hero">
                <span className="summary-price-label">Estimated Total:</span>
                <div className="summary-price-amount">
                  <motion.strong
                    key={calculation.formattedTotal}
                    initial={{ opacity: 0.5, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {calculation.formattedTotal}
                  </motion.strong>
                  {calculation.isRecurring && <span>/month</span>}
                </div>
              </div>
            </div>

            {/* Breakdown Content */}
            <div className="summary-body-grid">
              <div className="summary-col-left">
                <div className="estimator-breakdown-details">
                  <div className="summary-field-row">
                    <span className="field-label">Discipline</span>
                    <strong className="field-value">{currentPillar.name}</strong>
                  </div>

                  <div className="summary-field-row">
                    <span className="field-label">Selected Scope</span>
                    <strong className="field-value">{currentTier.name} ({currentTier.scopeLabel})</strong>
                  </div>

                  <div className="summary-field-row">
                    <span className="field-label">Base Price</span>
                    <span className="field-value">{calculation.formattedBase}</span>
                  </div>

                  <div className="summary-field-row">
                    <span className="field-label">Add-ons ({activeAddonsList.length})</span>
                    <span className="field-value">
                      {activeAddonsList.length > 0
                        ? `${activeAddonsList.map((a) => a.name).join(', ')} (${calculation.formattedAddons})`
                        : 'None (+₹0)'}
                    </span>
                  </div>

                  <div className="summary-field-row">
                    <span className="field-label">Sprint Timeline</span>
                    <strong className="field-value">{currentTier.turnaround}</strong>
                  </div>

                  <div className="summary-field-row">
                    <span className="field-label">Payment Terms</span>
                    <span className="field-value">50% upfront, 50% on live sign-off</span>
                  </div>
                </div>

                <p className="summary-footnote">
                  <Info size={12} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                  Fixed milestone pricing. 100% source code ownership upon launch.
                  {currency === 'USD' && ` • ${USD_INR_EXCHANGE_NOTE}`}
                </p>
              </div>

              <div className="summary-col-right">
                <div className="summary-turnaround-box">
                  <div className="turnaround-detail">
                    <span>Sprint Timeline:</span>
                    <strong>{currentTier.turnaround}</strong>
                  </div>
                  <div className="turnaround-tag">Dedicated Squad Sprint</div>
                </div>

                <div className="summary-action-cluster">
                  <motion.button
                    type="button"
                    className="summary-cta-btn"
                    onClick={handleEnquireWithEstimate}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={TRANSITIONS.buttonSpring}
                  >
                    Lock In Scope &amp; Start Project <ArrowRight size={16} />
                  </motion.button>

                  <a
                    href={`https://wa.me/919643820888?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="estimator-whatsapp-link"
                  >
                    <MessageSquare size={14} /> WhatsApp This Estimate →
                  </a>

                  <span className="summary-guarantee-note">
                    ✓ Direct kickoff with lead engineer • Zero agency fluff
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Summary Bar for Mobile */}
      <div className={`estimator-mobile-bottom-bar ${isEstimatorInView ? 'visible' : ''}`} role="region" aria-label="Live estimate total">
        <div className="bottom-bar-pricing">
          <span className="bottom-bar-label">Current Estimate</span>
          <strong className="bottom-bar-total">
            {calculation.formattedTotal}{calculation.isRecurring ? '/mo' : ''}
          </strong>
        </div>
        <button
          type="button"
          className="bottom-bar-action-btn"
          onClick={scrollToSummary}
        >
          Review &amp; Lock In <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
