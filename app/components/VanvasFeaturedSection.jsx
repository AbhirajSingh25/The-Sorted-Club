import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExternalLink,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Smartphone,
  Globe,
  Database,
  Calendar,
  Wallet,
  Laptop
} from 'lucide-react';
import { TRANSITIONS } from '../utils/motion';

export const VANVAS_CASE_STUDY_DATA = {
  id: 'vanvas-flagship',
  slug: 'vanvas',
  name: 'VANVAS — by The Sorted Club',
  badge: 'Live Shipped Product',
  liveUrl: 'https://vanvasai.vercel.app/',
  category: 'AI Travel Companion & Operating System',
  designStyle: 'Devanagari Editorial / Ambient Earth',
  suitableFor: 'Independent explorers, slow travelers, cultural backpackers, and group road-trippers across India.',
  shortDesc: 'AI-powered travel companion that replaces scattered travel notes, fragmented research, and disjointed group chats with an intelligent trip planner, curated destination discovery, real-time budgeting, and collaborative checklists.',
  tagline: 'Intelligent expedition planning, cultural discovery artworks, and offline-ready travel utility.',
  turnaround: 'Shipped & Live in Production',
  heroImage: '/images/vanvas/home_desktop.jpg',
  accentColor: '#15803d',
  secondaryColor: '#f5f2eb',
  mainFeatures: [
    'AI-Powered Trip Planner & Context-Aware Day-by-Day Itineraries',
    'Curated Destination Discovery with Handcrafted Cultural Artworks',
    'Real-Time Travel Budget Tracker with Currency & Expense Splits',
    'Collaborative Packing Checklists with Categorized Gear Presets',
    'Interactive Leaflet Expedition Maps with Density View Switcher',
    'Offline-Ready Progressive Web App & Native Android/iOS Shell (Capacitor)'
  ],
  includedSections: [
    'Expedition Command Center with live weather & altitude alerts',
    'AI Itinerary Generator with prompt customization & time blocks',
    'Destination Directory across Western Himalayas, Rajasthan, Goa, and Kerala',
    'Shared Packing List with item assignments & completion counters',
    'Budget & Expense Splitter with category breakdown charts',
    'FastAPI REST backend with PostgreSQL relational trip schema'
  ],
  techStack: 'Next.js 16 (App Router), React 19, Tailwind CSS, FastAPI, PostgreSQL, OpenAI API, Groq AI, Leaflet, Capacitor',
  customizationOptions: [
    'Autonomous vector similarity recommendations (RAG)',
    'Real-time collaborative itinerary sync via WebSockets',
    'Native push notifications via Firebase / Capacitor Push',
    'Offline local storage sync with PWA service worker'
  ]
};

// Genuine application screens captured directly from deployed production application
const APP_SCREENS = [
  {
    id: 'command',
    label: 'Command Center',
    title: 'Expedition Command Center',
    sub: 'Live weather, search bar, mode switcher & expedition routes',
    img: '/images/vanvas/home_desktop.jpg',
    url: 'vanvasai.vercel.app/'
  },
  {
    id: 'planner',
    label: 'AI Trip Planner',
    title: 'Context-Aware AI Itinerary Generator',
    sub: 'Day-by-day pacing, route timing & custom time blocks',
    img: '/images/vanvas/plan_desktop.jpg',
    url: 'vanvasai.vercel.app/plan'
  },
  {
    id: 'explore',
    label: 'Destination Explorer',
    title: 'Curated Sanctuaries & Heritage Guides',
    sub: 'Altitude, elevation, local stays & cultural checkpoints',
    img: '/images/vanvas/explore_manali_desktop.jpg',
    url: 'vanvasai.vercel.app/explore/manali'
  },
  {
    id: 'stays',
    label: 'Stays & Accommodations',
    title: 'Verified Stays & Booking Integration',
    sub: 'Budget splits, amenity filters & mountain homestays',
    img: '/images/vanvas/munnar_stay_detail.jpg',
    url: 'vanvasai.vercel.app/explore/munnar'
  },
  {
    id: 'mobile',
    label: 'Mobile PWA Shell',
    title: 'Field-Tested PWA & Capacitor Native Shell',
    sub: 'Offline-ready mobile journal designed for high-altitude expeditions',
    img: '/images/vanvas/tungnath_mobile_view.jpg',
    url: 'vanvasai.vercel.app/explore/tungnath'
  }
];

// Cultural artworks as secondary supporting assets
const SUPPORTING_ARTWORKS = [
  { name: 'Rishikesh', region: 'Uttarakhand', img: '/images/vanvas/rishikesh.webp' },
  { name: 'Udaipur', region: 'Rajasthan', img: '/images/vanvas/udaipur.webp' },
  { name: 'Spiti Valley', region: 'Himachal', img: '/images/vanvas/spiti.webp' },
  { name: 'Goa Coast', region: 'Goa', img: '/images/vanvas/goa.webp' }
];

export default function VanvasFeaturedSection({ onOpenInquiry, onOpenCaseStudy }) {
  const [activeScreenId, setActiveScreenId] = useState('command');
  const currentScreen = APP_SCREENS.find((s) => s.id === activeScreenId) || APP_SCREENS[0];

  return (
    <section className="vanvas-feature-section" id="vanvas">
      <div className="section-head" style={{ marginBottom: '32px' }}>
        <span>02</span>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-status-pill">
              <span className="live-ping" />
              FLAGSHIP SHIPPED PRODUCT
            </span>
            PROVEN ENGINEERING &amp; DESIGN
          </div>
          <h2 style={{ marginTop: '8px' }}>
            VANVAS — <i>by The Sorted Club</i>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '680px', marginTop: '10px', lineHeight: 1.55 }}>
            Our flagship AI travel operating system. Engineered from concept to production to solve fragmented trip planning with intelligent day-by-day itineraries, cultural discovery guides, and real-time travel logistics.
          </p>
        </div>
      </div>

      {/* Main VANVAS Editorial Showcase Card */}
      <div className="vanvas-showcase-card">
        {/* Top Product Bar */}
        <div className="vanvas-card-topbar">
          <div className="vanvas-brand-badge">
            <img
              src="/images/vanvas/vanvas-icon.png"
              alt="VANVAS Emblem"
              className="vanvas-icon-img"
              width="28"
              height="28"
            />
            <div>
              <strong className="vanvas-brand-name">VANVAS</strong>
              <span className="vanvas-by-tag">by The Sorted Club</span>
            </div>
          </div>

          <div className="vanvas-topbar-pills">
            <span className="vanvas-meta-pill">Next.js 16 + FastAPI + PostgreSQL</span>
            <span className="vanvas-meta-pill status-live">● Live in Production</span>
          </div>

          <div className="vanvas-action-links">
            <a
              href="https://vanvasai.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="vanvas-live-link"
              title="Open deployed VANVAS web application in new tab"
            >
              Explore Live Product <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* 2-Column Balanced Editorial Grid */}
        <div className="vanvas-card-grid">
          {/* Left Column: Authentic Application UI Showcase */}
          <div className="vanvas-visual-col">
            {/* Screen Selector Tabs */}
            <div className="vanvas-screen-nav" role="tablist" aria-label="Application screens">
              {APP_SCREENS.map((screen) => (
                <button
                  type="button"
                  role="tab"
                  key={screen.id}
                  aria-selected={screen.id === activeScreenId}
                  className={`screen-nav-tab ${screen.id === activeScreenId ? 'active' : ''}`}
                  onClick={() => setActiveScreenId(screen.id)}
                >
                  {screen.label}
                </button>
              ))}
            </div>

            {/* Application Window Frame */}
            <div className="vanvas-app-window">
              <div className="app-window-bar">
                <div className="browser-dots">
                  <span className="dot-red" />
                  <span className="dot-amber" />
                  <span className="dot-green" />
                </div>
                <div className="app-window-url" title={`https://${currentScreen.url}`}>
                  https://{currentScreen.url}
                </div>
                <div className="app-window-tag">
                  {currentScreen.id === 'mobile' ? (
                    <><Smartphone size={12} /> Mobile PWA Shell</>
                  ) : (
                    <><Laptop size={12} /> Live App Screen</>
                  )}
                </div>
              </div>

              {/* Genuine Captured Screen Image */}
              <div className="app-screen-viewport">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScreen.id}
                    className="app-screen-frame"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={TRANSITIONS.editorial}
                  >
                    <img
                      src={currentScreen.img}
                      alt={`VANVAS ${currentScreen.title} — Real Application Interface`}
                      className={`app-screen-img ${currentScreen.id === 'mobile' ? 'mobile-screen-fit' : ''}`}
                      loading="lazy"
                    />
                    <div className="app-screen-caption">
                      <strong>{currentScreen.title}</strong>
                      <span>{currentScreen.sub}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column: Problem Solved, Shipped Capabilities & Actions */}
          <div className="vanvas-details-col">
            <div className="vanvas-problem-box">
              <span className="vanvas-col-eyebrow">THE PROBLEM SOLVED</span>
              <h3>Scattered notes, messy WhatsApp groups &amp; generic itineraries.</h3>
              <p>
                Travelers waste hours juggling disconnected spreadsheets, map pins, and outdated blogs. VANVAS unifies the entire expedition journey into a single intelligent companion with conversational itinerary generation, budget tracking, and offline packing tools.
              </p>
            </div>

            {/* Verified Shipped Capabilities */}
            <div className="vanvas-features-list">
              <span className="vanvas-col-eyebrow">VERIFIED SHIPPED CAPABILITIES</span>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Sparkles size={16} /></div>
                <div>
                  <strong>AI Itinerary &amp; Route Synthesis</strong>
                  <span>Synthesizes day-by-day pacing, elevation timing, and cultural context using LLMs.</span>
                </div>
              </div>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Wallet size={16} /></div>
                <div>
                  <strong>Multi-Category Budget &amp; Expense Splits</strong>
                  <span>Tracks multi-category spending, estimated splits, and currency conversion.</span>
                </div>
              </div>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Compass size={16} /></div>
                <div>
                  <strong>Cultural Destination Discovery</strong>
                  <span>Editorial guides across Himalayas, Rajasthan, and Goa with verified routes and map pins.</span>
                </div>
              </div>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Smartphone size={16} /></div>
                <div>
                  <strong>Offline PWA &amp; Capacitor Mobile Shell</strong>
                  <span>Engineered for offline access, fast touch response, and field use on mountain trails.</span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="vanvas-stack-container">
              <span className="vanvas-col-eyebrow">VERIFIED TECH STACK</span>
              <p className="vanvas-stack-line">
                Next.js 16 (App Router) • React 19 • Tailwind CSS • FastAPI (Python) • PostgreSQL • Leaflet Maps • Capacitor Native • Vercel Edge
              </p>
            </div>

            {/* Action Buttons using Global Button System */}
            <div className="vanvas-card-cta-group">
              <a
                href="https://vanvasai.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="primary"
                style={{ fontSize: '13.5px', padding: '12px 22px' }}
              >
                Explore Live Product <ExternalLink size={14} />
              </a>

              <button
                type="button"
                className="secondary"
                style={{ fontSize: '13.5px', padding: '12px 20px' }}
                onClick={() => onOpenCaseStudy(VANVAS_CASE_STUDY_DATA)}
              >
                Case Study Breakdown →
              </button>

              <button
                type="button"
                className="card-cta-link"
                style={{ fontSize: '13px', color: 'var(--ink)', padding: '8px 12px', border: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                onClick={() =>
                  onOpenInquiry({
                    service: 'Website / Build — Custom Web App',
                    problem: 'I am interested in building a full-stack digital product similar in design and engineering quality to VANVAS.'
                  })
                }
              >
                Build a Product Like This →
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Supporting Artwork Strip */}
        <div className="vanvas-art-strip-wrapper">
          <div className="art-strip-header">
            <span className="art-strip-title">Handcrafted Cultural Artwork Identity</span>
            <span className="art-strip-sub">Supporting editorial visual identity created for Indian sanctuaries</span>
          </div>
          <div className="vanvas-art-grid">
            {SUPPORTING_ARTWORKS.map((art) => (
              <div key={art.name} className="art-item-card">
                <img src={art.img} alt={`${art.name} cultural artwork`} loading="lazy" />
                <div className="art-item-info">
                  <strong>{art.name}</strong>
                  <span>{art.region}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
