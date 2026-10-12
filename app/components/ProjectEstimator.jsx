import React, { useState, useMemo } from 'react';
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
    setExpandedTierId(null);
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

    onOpenInquiry({
      service: currentPillar.serviceKey,
      scope: currentTier.name,
      addons: addonNames,
      currency,
      estimatedPrice: calculation.formattedTotal,
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
    `Hi The Sorted Club, I configured an estimate for ${currentPillar.name} (${currentTier.name}). Estimated investment: ${calculation.formattedTotal}${calculation.isRecurring ? '/mo' : ''}. I'd like to confirm the sprint start date.`
  );

  return (
    <div className="project-estimator-card" id="estimator">
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

      {/* Step Indicator Strip */}
      <div className="estimator-progress-strip">
        <div className="progress-step-pill active">
          <span className="step-num-circle">01</span>
          <span className="step-label-text">Discipline</span>
          <strong className="step-val-text">{currentPillar.name}</strong>
        </div>
        <div className="progress-divider">→</div>
        <div className="progress-step-pill active">
          <span className="step-num-circle">02</span>
          <span className="step-label-text">Scope</span>
          <strong className="step-val-text">{currentTier.name}</strong>
        </div>
        <div className="progress-divider">→</div>
        <div className="progress-step-pill active">
          <span className="step-num-circle">03</span>
          <span className="step-label-text">Add-ons</span>
          <strong className="step-val-text">{activeAddonsList.length} selected</strong>
        </div>
        <div className="progress-divider">→</div>
        <div className="progress-step-pill highlight">
          <span className="step-num-circle">04</span>
          <span className="step-label-text">Estimate</span>
          <strong className="step-val-text">{calculation.formattedTotal}</strong>
        </div>
      </div>

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
              <button
                type="button"
                key={pillar.id}
                className={`estimator-pillar-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handlePillarChange(pillar.id)}
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
              </button>
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
            Compare options quickly. Balanced 2–3 column desktop layout.
          </span>
        </div>

        {/* Tiers Grid - 3 columns for 3+ items, 2 columns for 2 items */}
        <div className={`estimator-tiers-grid ${currentPillar.tiers.length === 2 ? 'two-col' : 'three-col'}`}>
          {currentPillar.tiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            const isExpanded = expandedTierId === tier.id;
            const priceStr = tier.isSuccessBased
              ? 'Pay on Success'
              : currency === 'USD'
              ? `$${tier.priceUSD.toLocaleString()}`
              : `₹${tier.priceINR.toLocaleString()}`;

            return (
              <div
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
                  {(isExpanded ? tier.deliverables : tier.deliverables.slice(0, 3)).map((item, idx) => (
                    <li key={idx}>
                      <Check size={13} className="check-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
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
              </div>
            );
          })}
        </div>
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
                <div
                  key={addon.id}
                  className={`estimator-addon-card ${isChecked ? 'active' : ''}`}
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 04: REVIEW YOUR ESTIMATE & ACTIONS */}
      <div className="estimator-summary-panel">
        <div className="summary-col-left">
          <div className="summary-badge">
            <ShieldCheck size={13} /> STEP 04 • FINANCIAL SUMMARY
          </div>

          {/* Semantic Breakdown Rows - No concatenated labels! */}
          <div className="estimator-breakdown-details">
            <div className="summary-field-row">
              <span className="field-label">Discipline</span>
              <strong className="field-value">{currentPillar.name} — {currentPillar.title}</strong>
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
                  : 'None selected (+₹0)'}
              </span>
            </div>

            <div className="summary-field-row">
              <span className="field-label">Indicative Turnaround</span>
              <span className="field-value">{currentTier.turnaround}</span>
            </div>

            <div className="summary-field-row">
              <span className="field-label">Payment Terms</span>
              <span className="field-value">50% deposit to start, 50% on live staging sign-off</span>
            </div>
          </div>

          {/* Prominent Total Display */}
          <div className="summary-total-display">
            <span className="total-label">Estimated Investment:</span>
            <div className="total-figure">
              <strong>{calculation.formattedTotal}</strong>
              {calculation.isRecurring && <span>/month</span>}
            </div>
          </div>

          <p className="summary-footnote">
            <Info size={12} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
            Indicative scope estimate. 100% full source code ownership upon launch.
            {currency === 'USD' && ` • ${USD_INR_EXCHANGE_NOTE}`}
          </p>
        </div>

        {/* Right Action Column */}
        <div className="summary-col-right">
          <div className="summary-turnaround-box">
            <span>Sprint Timeline:</span>
            <strong>{currentTier.turnaround}</strong>
          </div>

          <div className="summary-action-cluster">
            <button
              type="button"
              className="primary"
              onClick={handleEnquireWithEstimate}
              style={{ width: '100%', fontSize: '14px', padding: '14px 20px', background: 'var(--acid)', color: 'var(--ink)', border: 'none', fontWeight: 700 }}
            >
              Lock In Scope &amp; Start Project <ArrowRight size={16} />
            </button>

            <a
              href={`https://wa.me/919643820888?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="estimator-whatsapp-link"
            >
              <MessageSquare size={14} /> WhatsApp This Estimate →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
