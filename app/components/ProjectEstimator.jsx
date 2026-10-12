import React, { useState, useMemo, useEffect } from 'react';
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
  CheckCircle2,
  Layers,
  Sliders,
  DollarSign
} from 'lucide-react';
import { PILLARS_CONFIG, USD_INR_EXCHANGE_NOTE } from './pricingData';
import { TRANSITIONS } from '../utils/motion';

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
  const [activeStepTab, setActiveStepTab] = useState('B'); // Mobile step focus indicator

  const currentPillar = useMemo(() => {
    return PILLARS_CONFIG.find((p) => p.id === selectedPillarId) || PILLARS_CONFIG[0];
  }, [selectedPillarId]);

  // When pillar changes, switch to default popular tier and reset add-ons
  const handlePillarChange = (pillarId) => {
    setSelectedPillarId(pillarId);
    const pillar = PILLARS_CONFIG.find((p) => p.id === pillarId) || PILLARS_CONFIG[0];
    const defaultTier = pillar.tiers.find((t) => t.popular) || pillar.tiers[0];
    setSelectedTierId(defaultTier.id);
    setSelectedAddonIds([]);
  };

  const currentTier = useMemo(() => {
    return currentPillar.tiers.find((t) => t.id === selectedTierId) || currentPillar.tiers[0];
  }, [currentPillar, selectedTierId]);

  const toggleAddon = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  // Calculation logic with safe fallbacks
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
      ? 'Pay on Success (No Upfront)'
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
      : `${calculation.formattedTotal}${calculation.isRecurring ? '/mo' : ''} [Base: ${calculation.formattedBase}${addonsCostString()}]`;

    function addonsCostString() {
      if (calculation.addonsCost > 0) {
        return ` + Add-ons: ${calculation.formattedAddons}`;
      }
      return '';
    }

    onOpenInquiry({
      service: currentPillar.serviceKey,
      scope: currentTier.name,
      addons: addonNames,
      currency,
      estimatedPrice: calculation.formattedTotal,
      problem: `[Project Estimator Configuration]
Service: ${currentPillar.title} (${currentPillar.name})
Selected Scope: ${currentTier.name} (${currentTier.scopeLabel || 'Custom'})
Turnaround: ${currentTier.turnaround}
${addonNames.length > 0 ? `Selected Add-ons (${addonNames.length}): ${addonNames.join(', ')}\n` : 'No optional add-ons selected.\n'}Estimated Investment: ${pricingSummary}
Currency: ${currency}

Please review this configuration and provide our formal statement of work and kickoff timeline.`,
      budget: calculation.isSuccessBased
        ? 'Pay on Success'
        : currency === 'USD'
        ? calculation.total < 1000
          ? '< $2,500'
          : calculation.total < 2500
          ? '$2,500 - $5,000'
          : '$5,000 - $10,000'
        : calculation.total < 30000
        ? '< ₹30,000'
        : calculation.total < 60000
        ? '₹30,000 - ₹60,000'
        : '₹60,000+'
    });
  };

  const whatsappMessage = encodeURIComponent(
    `Hi The Sorted Club, I configured a project estimate on your homepage for ${currentPillar.name} (${currentTier.name}). Estimated investment: ${calculation.formattedTotal}${calculation.isRecurring ? '/mo' : ''}. I would like to review our scope and confirm delivery dates.`
  );

  return (
    <div className="project-estimator-card" id="estimator">
      {/* Top Header & Context */}
      <div className="estimator-topbar">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={14} color="var(--ink)" />
            INTERACTIVE PROJECT ESTIMATOR • REAL-TIME CONFIGURATOR
          </div>
          <h3 className="estimator-title">
            Configure your project scope.<br />
            <i>Instant commercial transparency.</i>
          </h3>
          <p className="estimator-sub">
            Select your discipline, tailor scope complexity, and add modular capabilities. Zero hidden fees. 50% upfront, 50% upon live staging sign-off.
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

      {/* Progress Indicator Strip */}
      <div className="estimator-progress-strip">
        <div className="progress-step-pill active">
          <span className="step-num-circle">A</span>
          <span className="step-label-text">Discipline</span>
          <strong className="step-val-text">{currentPillar.name}</strong>
        </div>
        <div className="progress-divider">→</div>
        <div className="progress-step-pill active">
          <span className="step-num-circle">B</span>
          <span className="step-label-text">Scope</span>
          <strong className="step-val-text">{currentTier.name}</strong>
        </div>
        <div className="progress-divider">→</div>
        <div className="progress-step-pill active">
          <span className="step-num-circle">C</span>
          <span className="step-label-text">Add-ons</span>
          <strong className="step-val-text">{activeAddonsList.length} selected</strong>
        </div>
        <div className="progress-divider">→</div>
        <div className="progress-step-pill highlight">
          <span className="step-num-circle">D</span>
          <span className="step-label-text">Estimate</span>
          <strong className="step-val-text">{calculation.formattedTotal}</strong>
        </div>
      </div>

      {/* STEP A: WHAT ARE YOU BUILDING? */}
      <div className="estimator-step-block">
        <div className="step-header-row">
          <label className="estimator-step-label">
            <span>STEP A</span> / What are you building?
          </label>
          <span className="step-hint-text">Choose your core service discipline</span>
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
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={TRANSITIONS.buttonSpring}
              >
                <div className="pillar-btn-icon">
                  <Icon size={20} />
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

      {/* STEP B: CONFIGURE THE SCOPE */}
      <div className="estimator-step-block">
        <div className="step-header-row">
          <label className="estimator-step-label">
            <span>STEP B</span> / Configure Scope &amp; Complexity for <strong>{currentPillar.name}</strong>
          </label>
          <span className="step-hint-text">
            {currentPillar.id === 'build'
              ? 'Select by page count, funnel complexity or application architecture'
              : 'Select your operational volume & deliverables tier'}
          </span>
        </div>

        {/* For Website BUILD Projects: Quick Page-Count / Package Quick Filter */}
        {currentPillar.id === 'build' && (
          <div className="estimator-scope-quick-strip">
            <span className="scope-quick-label">Quick Scope Selector:</span>
            <div className="scope-pills-row">
              {currentPillar.tiers.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`scope-pill-btn ${t.id === selectedTierId ? 'active' : ''}`}
                  onClick={() => setSelectedTierId(t.id)}
                >
                  <span className="pill-name">{t.name}</span>
                  <span className="pill-pages">({t.scopeLabel})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tiers Grid */}
        <div className="estimator-tiers-grid">
          {currentPillar.tiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            const priceStr = tier.isSuccessBased
              ? 'Pay on Success'
              : currency === 'USD'
              ? `$${tier.priceUSD.toLocaleString()}`
              : `₹${tier.priceINR.toLocaleString()}`;

            return (
              <motion.div
                key={tier.id}
                className={`estimator-tier-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedTierId(tier.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTierId(tier.id);
                  }
                }}
                whileHover={{ y: -3 }}
                transition={TRANSITIONS.cardSpring}
              >
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
                  {tier.deliverables.map((item, idx) => (
                    <li key={idx}>
                      <Check size={13} className="check-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="tier-select-indicator">
                  <div className={`radio-dot ${isSelected ? 'active' : ''}`} />
                  <span>{isSelected ? '✓ Scope Selected' : 'Choose Scope'}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* STEP C: OPTIONAL FEATURES & ADD-ONS */}
      {currentPillar.addons && currentPillar.addons.length > 0 && (
        <div className="estimator-step-block">
          <div className="step-header-row">
            <label className="estimator-step-label">
              <span>STEP C</span> / Optional Add-on Capabilities
            </label>
            <span className="step-hint-text">Selectable acceleration &amp; specialized modules</span>
          </div>

          <div className="estimator-addons-list">
            {currentPillar.addons.map((addon) => {
              const isChecked = selectedAddonIds.includes(addon.id);
              const addonCost =
                currency === 'USD'
                  ? `+$${addon.priceUSD.toLocaleString()}`
                  : `+₹${addon.priceINR.toLocaleString()}`;

              return (
                <motion.div
                  key={addon.id}
                  className={`estimator-addon-item ${isChecked ? 'active' : ''}`}
                  onClick={() => toggleAddon(addon.id)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleAddon(addon.id);
                    }
                  }}
                  whileHover={{ x: 2 }}
                  transition={TRANSITIONS.buttonSpring}
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

      {/* STEP D & E: LIVE ESTIMATE BREAKDOWN & PRIMARY CTA */}
      <div className="estimator-summary-panel">
        <div className="summary-col-left">
          <div className="summary-badge">
            <ShieldCheck size={14} /> STEP D • LIVE ESTIMATE BREAKDOWN
          </div>

          {/* Breakdown Rows */}
          <div className="estimator-breakdown-details">
            <div className="breakdown-line">
              <span className="line-label">Selected Discipline:</span>
              <strong className="line-val">{currentPillar.name} — {currentPillar.title}</strong>
            </div>
            <div className="breakdown-line">
              <span className="line-label">Selected Scope ({currentTier.scopeLabel}):</span>
              <strong className="line-val">{currentTier.name} ({calculation.formattedBase})</strong>
            </div>
            <div className="breakdown-line">
              <span className="line-label">Modular Add-ons ({activeAddonsList.length}):</span>
              <span className="line-val">
                {activeAddonsList.length > 0
                  ? `${activeAddonsList.map((a) => a.name).join(', ')} (${calculation.formattedAddons})`
                  : 'None selected (+₹0)'}
              </span>
            </div>
          </div>

          {/* Animated Total Display */}
          <div className="summary-total-display">
            <span className="total-label">Estimated Investment:</span>
            <div className="total-figure">
              <strong>{calculation.formattedTotal}</strong>
              {calculation.isRecurring && <span>/month</span>}
            </div>
          </div>

          <p className="summary-footnote">
            <Info size={13} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
            Indicative estimate based on selected scope. 50% deposit on start, 50% only upon live staging sign-off.
            {currency === 'USD' && ` • ${USD_INR_EXCHANGE_NOTE}`}
          </p>
        </div>

        {/* STEP E: CTA & Contact Actions */}
        <div className="summary-col-right">
          <div className="summary-turnaround-box">
            <span>Guaranteed Sprint Window:</span>
            <strong>{currentTier.turnaround}</strong>
          </div>

          <div className="summary-action-cluster">
            <motion.button
              type="button"
              className="primary"
              onClick={handleEnquireWithEstimate}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={TRANSITIONS.buttonSpring}
              style={{ width: '100%', fontSize: '14.5px', padding: '14px 20px' }}
            >
              Lock In Scope &amp; Start Project <ArrowRight size={17} />
            </motion.button>

            <a
              href={`https://wa.me/919643820888?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="estimator-whatsapp-link"
            >
              <MessageSquare size={15} /> WhatsApp This Estimate →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
