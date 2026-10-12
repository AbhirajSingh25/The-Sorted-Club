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
  Info
} from 'lucide-react';
import { TRANSITIONS } from '../utils/motion';

const PILLARS_CONFIG = [
  {
    id: 'build',
    name: 'BUILD',
    title: 'Website & Digital Products',
    icon: Code2,
    serviceKey: 'Website / Build',
    tiers: [
      {
        id: 'starter',
        name: 'Starter Website',
        priceINR: 14999,
        priceUSD: 400,
        turnaround: '5–7 Days',
        deliverables: ['3–5 Custom Responsive Pages', '1-Click WhatsApp Chat Button', 'Google Maps & Contact Form', 'On-Page SEO & SSL HTTPS', '30-Day Warranty'],
        desc: 'Clean, credible digital presence for fast launch & local authority.'
      },
      {
        id: 'business',
        name: 'Business Website',
        priceINR: 24999,
        priceUSD: 650,
        turnaround: '7–10 Days',
        popular: true,
        deliverables: ['5–8 Custom Responsive Pages', 'Dynamic Headless CMS for Articles', 'PageSpeed 90+ Optimization', 'Advanced SEO & XML Sitemap', 'CRM Inquiry Routing', '45-Day Warranty'],
        desc: 'Comprehensive multi-page hub designed to showcase depth, trust, and case studies.'
      },
      {
        id: 'leadgen',
        name: 'Lead-Gen Website',
        priceINR: 29999,
        priceUSD: 750,
        turnaround: '6–8 Days',
        deliverables: ['High-Converting Sales Funnel', 'Interactive Multi-Step Lead Quiz', 'Real-time CRM Sync & UTM Attribution', 'Instant Email & WhatsApp Alert', '30-Day Warranty'],
        desc: 'High-converting sales funnel engineered to turn traffic into qualified inquiries.'
      },
      {
        id: 'booking',
        name: 'Booking Website',
        priceINR: 34999,
        priceUSD: 890,
        turnaround: '8–12 Days',
        deliverables: ['Live Calendar Availability Sync', 'Slot Buffer Times & Scheduling Rules', 'Online Deposit / Prepayment Gateway', 'Automated Reminders & Confirmations', '45-Day Warranty'],
        desc: 'Automated scheduling and appointment engine that fills calendars without phone tag.'
      },
      {
        id: 'ecommerce',
        name: 'E-Commerce Website',
        priceINR: 39999,
        priceUSD: 990,
        turnaround: '10–14 Days',
        deliverables: ['Full Storefront (Up to 25 products)', 'Secure Payment Gateway (UPI, Cards)', 'Automated Receipt & Order Tracking', 'Discount Engine & Inventory Alerts', '60-Day Warranty'],
        desc: 'Blazing-fast online storefront built for seamless shopping, cart, and payments.'
      },
      {
        id: 'custom',
        name: 'Custom Web App',
        priceINR: 59999,
        priceUSD: 1500,
        turnaround: '2–4 Weeks',
        deliverables: ['Bespoke Portals (React, FastAPI, DB)', 'User Authentication & RBAC', 'Third-Party Webhooks & API Sync', 'Dedicated Squad Sprint Updates', '90-Day SLA Warranty'],
        desc: 'Full-stack software engineering for custom portals, dashboards, and internal systems.'
      }
    ],
    addons: [
      { id: 'whatsapp_ai', name: 'WhatsApp AI Instant Responder', priceINR: 4999, priceUSD: 130, desc: 'Automated 24/7 lead qualification & response bot connected to WhatsApp' },
      { id: 'seo_boost', name: 'Local SEO & Google Maps Domination Pack', priceINR: 4999, priceUSD: 130, desc: 'Targeted local schema, Google Business Profile audit & keyword ranking setup' },
      { id: 'fast_track', name: 'Priority Fast-Track Delivery (5-Day Sprint)', priceINR: 4999, priceUSD: 130, desc: 'Dedicated squad acceleration to launch within 5 business days' }
    ]
  },
  {
    id: 'grow',
    name: 'GROW',
    title: 'Revenue Marketing & SEO',
    icon: BriefcaseBusiness,
    serviceKey: 'Marketing / Growth',
    tiers: [
      {
        id: 'presence',
        name: 'Sorted Presence',
        priceINR: 9999,
        priceUSD: 270,
        isRecurring: true,
        turnaround: 'Monthly Retainer',
        deliverables: ['8 Branded Social Assets / Mo', 'Google Business Profile Optimization', 'On-Page SEO Monitoring', 'Monthly Review Call'],
        desc: 'Establish active brand credibility and local search dominance.'
      },
      {
        id: 'growth',
        name: 'Sorted Growth',
        priceINR: 19999,
        priceUSD: 540,
        isRecurring: true,
        popular: true,
        turnaround: 'Monthly Retainer',
        deliverables: ['16 Content Assets (8 Reels + 8 Posts)', 'Full Scripting & Video Editing', 'Meta / Google Ad Campaign Setup', 'CRM Lead Attribution & Tracking', 'Bi-weekly Strategy Reviews'],
        desc: 'Accelerate inbound pipeline with active content production and search acquisition.'
      },
      {
        id: 'scale',
        name: 'Sorted Scale',
        priceINR: 39999,
        priceUSD: 990,
        isRecurring: true,
        turnaround: 'Custom Sprint',
        deliverables: ['Omnichannel Engine (20+ Assets/Mo)', 'Dedicated Growth Squad Lead', 'Custom Landing Page Funnels & A/B Tests', 'B2B Outbound Pipeline Enrichment', 'Weekly Strategy & Live Dashboard'],
        desc: 'Full-service omnichannel growth team acting as your dedicated growth department.'
      }
    ],
    addons: [
      { id: 'funnel_cro', name: 'Conversion Rate Optimization (CRO) Sprint', priceINR: 4999, priceUSD: 130, desc: 'Deep landing page heatmap analysis, copy testing, and conversion tuning' },
      { id: 'ad_creatives', name: 'High-Velocity Ad Creatives Pack (5 Hook Variations)', priceINR: 3999, priceUSD: 100, desc: 'Direct-response ad creative variations designed for paid social campaigns' }
    ]
  },
  {
    id: 'automate',
    name: 'AUTOMATE',
    title: 'AI Agents & Workflows',
    icon: Bot,
    serviceKey: 'AI / Automation',
    tiers: [
      {
        id: 'starter_auto',
        name: 'Sorted Automate',
        priceINR: 24999,
        priceUSD: 650,
        turnaround: '5–7 Days',
        deliverables: ['3 Core Automated Workflow Integrations', 'Instant WhatsApp / Email Lead Auto-Responder', 'CRM Sync & Team Notification Triggers', '30-Day Post-Setup Support'],
        desc: 'Automate your primary lead intake, notifications, and customer response pipeline.'
      },
      {
        id: 'auto_pro',
        name: 'Automate Pro',
        priceINR: 49999,
        priceUSD: 1350,
        popular: true,
        turnaround: '10–14 Days',
        deliverables: ['Up to 8 Multi-Step Custom Workflows', 'Custom AI Agent on Company Knowledge Base', 'Automated Invoice & Follow-Up Engine', 'Team Training & Video Documentation', '60-Day Priority Optimization'],
        desc: 'Comprehensive business automation with intelligent AI agents and multi-tool sync.'
      },
      {
        id: 'auto_custom',
        name: 'Automate Enterprise',
        priceINR: 79999,
        priceUSD: 2000,
        turnaround: '2–4 Weeks',
        deliverables: ['Bespoke AI Pipelines & LLM Fine-Tuning', 'Proprietary ERP / Database Automations', 'Dedicated Automation Squad Lead', 'Enterprise Security & Compliance SLA'],
        desc: 'Bespoke AI pipelines, custom ERP integrations, and autonomous operational systems.'
      }
    ],
    addons: [
      { id: 'auto_maint', name: 'Monthly Automation Maintenance & Health Checks', priceINR: 4999, priceUSD: 130, desc: 'Ongoing workflow monitoring, API version updates, and prompt adjustments' }
    ]
  },
  {
    id: 'hire',
    name: 'HIRE',
    title: 'HireSense AI & Talent Operations',
    icon: Users,
    serviceKey: 'Hiring',
    tiers: [
      {
        id: 'placement',
        name: 'Sorted Placement',
        priceINR: 0,
        priceUSD: 0,
        isSuccessBased: true,
        turnaround: '7–10 Days to Shortlist',
        deliverables: ['Role Scorecard & Specification', 'HireSense AI Sourcing & Skills Benchmarking', 'Top 3–5 Pre-Screened Candidates Delivered', 'Interview Coordination & Offer Advisory', '90-Day Placement Replacement Guarantee'],
        desc: 'Pay only upon successful hire. Zero upfront cost or retainer risk.'
      },
      {
        id: 'dedicated_squad',
        name: 'Talent Sprint / Embedded Recruiter',
        priceINR: 29999,
        priceUSD: 750,
        turnaround: 'Monthly Sprint',
        deliverables: ['Dedicated Talent Partner for Your Company', 'Up to 3 Active Open Positions Handled Simultaneously', 'Full ATS Pipeline Management', 'Technical Screening & Work Sample Evaluation'],
        desc: 'High-velocity talent sourcing sprint for growing startups and agencies.'
      }
    ],
    addons: [
      { id: 'tech_screen', name: 'Senior Technical Architecture Screening Interview', priceINR: 4999, priceUSD: 130, desc: 'Deep-dive technical assessment conducted by a senior engineer before client interview' }
    ]
  }
];

export default function ProjectEstimator({ onOpenInquiry, initialPillar = 'build' }) {
  const [selectedPillarId, setSelectedPillarId] = useState(initialPillar);
  const [selectedTierId, setSelectedTierId] = useState('business');
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'

  const currentPillar = useMemo(() => {
    return PILLARS_CONFIG.find((p) => p.id === selectedPillarId) || PILLARS_CONFIG[0];
  }, [selectedPillarId]);

  // When pillar changes, pick first or popular tier
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

  // Calculation
  const calculation = useMemo(() => {
    const isUSD = currency === 'USD';
    const basePrice = isUSD ? currentTier.priceUSD : currentTier.priceINR;

    const addonsCost = selectedAddonIds.reduce((sum, addonId) => {
      const addon = (currentPillar.addons || []).find((a) => a.id === addonId);
      if (!addon) return sum;
      return sum + (isUSD ? addon.priceUSD : addon.priceINR);
    }, 0);

    const total = basePrice + addonsCost;

    const formattedBase = currentTier.isSuccessBased
      ? 'Pay on Success'
      : isUSD
      ? `$${basePrice.toLocaleString()}`
      : `₹${basePrice.toLocaleString()}`;

    const formattedTotal = currentTier.isSuccessBased
      ? 'Pay on Success (No Upfront)'
      : isUSD
      ? `$${total.toLocaleString()}`
      : `₹${total.toLocaleString()}`;

    return {
      total,
      formattedBase,
      formattedTotal,
      isRecurring: currentTier.isRecurring,
      isSuccessBased: currentTier.isSuccessBased
    };
  }, [currency, currentTier, currentPillar, selectedAddonIds]);

  const handleEnquireWithEstimate = () => {
    const activeAddons = (currentPillar.addons || [])
      .filter((a) => selectedAddonIds.includes(a.id))
      .map((a) => a.name);

    onOpenInquiry({
      service: currentPillar.serviceKey,
      problem: `I calculated an indicative estimate for the ${currentTier.name} package under ${currentPillar.name}.${activeAddons.length > 0 ? ` Desired add-ons: ${activeAddons.join(', ')}.` : ''} Indicative estimate: ${calculation.formattedTotal}${calculation.isRecurring ? '/mo' : ''}. Please review our scope and provide the final schedule.`,
      budget: calculation.isSuccessBased
        ? 'Pay on Success'
        : currency === 'USD'
        ? calculation.total < 2500 ? '< $2,500' : '$2,500 - $5,000'
        : calculation.total < 30000 ? '< ₹30,000' : '₹30,000 - ₹60,000'
    });
  };

  const whatsappMessage = encodeURIComponent(
    `Hi The Sorted Club, I used your Project Estimator for ${currentPillar.name} (${currentTier.name}). Indicative estimate: ${calculation.formattedTotal}. I would like to discuss our project brief.`
  );

  return (
    <div className="project-estimator-card" id="estimator">
      {/* Estimator Header */}
      <div className="estimator-topbar">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="var(--ink)" />
            INTERACTIVE PROJECT ESTIMATOR
          </div>
          <h3 className="estimator-title">
            Configure your scope.<br />
            <i>Instant indicative estimate.</i>
          </h3>
          <p className="estimator-sub">
            Choose your service pillar, package complexity, and optional requirements. No hidden agency surprises.
          </p>
        </div>

        {/* Currency Switcher */}
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
      </div>

      {/* Step 1: Select Pillar */}
      <div className="estimator-step-block">
        <label className="estimator-step-label">
          <span>STEP 01</span> / Select Service Pillar
        </label>
        <div className="estimator-pillars-grid">
          {PILLARS_CONFIG.map((pillar) => {
            const Icon = pillar.icon;
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
                  <strong>{pillar.name}</strong>
                  <span>{pillar.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Package Tier / Complexity */}
      <div className="estimator-step-block">
        <label className="estimator-step-label">
          <span>STEP 02</span> / Select Package Tier &amp; Scope
        </label>
        <div className="estimator-tiers-grid">
          {currentPillar.tiers.map((tier) => {
            const isSelected = tier.id === selectedTierId;
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
                    {tier.popular && <span className="popular-badge">Popular</span>}
                  </div>
                  <div className="tier-price-tag">
                    <strong>{priceStr}</strong>
                    {tier.isRecurring && <span>/mo</span>}
                  </div>
                </div>

                <p className="tier-desc">{tier.desc}</p>

                <div className="tier-turnaround">
                  <Clock size={12} /> {tier.turnaround}
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
                  <span>{isSelected ? 'Selected' : 'Select Tier'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Optional Requirements & Add-ons */}
      {currentPillar.addons && currentPillar.addons.length > 0 && (
        <div className="estimator-step-block">
          <label className="estimator-step-label">
            <span>STEP 03</span> / Optional Capabilities &amp; Add-ons
          </label>
          <div className="estimator-addons-list">
            {currentPillar.addons.map((addon) => {
              const isChecked = selectedAddonIds.includes(addon.id);
              const addonCost =
                currency === 'USD'
                  ? `+$${addon.priceUSD.toLocaleString()}`
                  : `+₹${addon.priceINR.toLocaleString()}`;

              return (
                <div
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
                >
                  <div className={`addon-checkbox ${isChecked ? 'checked' : ''}`}>
                    {isChecked ? <Check size={12} /> : <Plus size={12} />}
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

      {/* Calculation Summary Bar */}
      <div className="estimator-summary-panel">
        <div className="summary-col-left">
          <div className="summary-badge">
            <ShieldCheck size={14} /> INDICATIVE ESTIMATE
          </div>
          <div className="summary-total-display">
            <span className="total-label">Estimated Investment:</span>
            <div className="total-figure">
              <strong>{calculation.formattedTotal}</strong>
              {calculation.isRecurring && <span>/month</span>}
            </div>
          </div>
          <p className="summary-footnote">
            <Info size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Indicative estimate based on standard requirements. 50% deposit on start, 50% only upon staging sign-off.
          </p>
        </div>

        <div className="summary-col-right">
          <div className="summary-turnaround-box">
            <span>Estimated Turnaround:</span>
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
              style={{ width: '100%' }}
            >
              Lock In Estimate &amp; Enquire <ArrowRight size={16} />
            </motion.button>

            <a
              href={`https://wa.me/919643820888?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="estimator-whatsapp-link"
            >
              <MessageSquare size={14} /> WhatsApp this Estimate →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
