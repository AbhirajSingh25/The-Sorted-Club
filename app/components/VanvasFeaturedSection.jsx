import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Wallet
} from 'lucide-react';
import { TRANSITIONS, fadeInUp, staggerContainer } from '../utils/motion';

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
  heroImage: '/images/vanvas/vanvas-emblem.png',
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
  techStack: 'Next.js 16 (App Router), React, Tailwind CSS, FastAPI, PostgreSQL, OpenAI API, Groq AI, Leaflet, Capacitor',
  customizationOptions: [
    'Autonomous vector similarity recommendations (RAG)',
    'Real-time collaborative itinerary sync via WebSockets',
    'Native push notifications via Firebase / Capacitor Push',
    'Offline local storage sync with PWA service worker'
  ]
};

export default function VanvasFeaturedSection({ onOpenInquiry, onOpenCaseStudy }) {
  const [activeArtworkTab, setActiveArtworkTab] = useState('rishikesh');

  const artworks = [
    { id: 'rishikesh', name: 'Rishikesh', region: 'Uttarakhand', img: '/images/vanvas/rishikesh.webp', theme: 'River Ghats & Yoga' },
    { id: 'udaipur', name: 'Udaipur', region: 'Rajasthan', img: '/images/vanvas/udaipur.webp', theme: 'Lake Palaces & Rajput Heritage' },
    { id: 'jaipur', name: 'Jaipur', region: 'Rajasthan', img: '/images/vanvas/jaipur.webp', theme: 'Pink City & Astronomical Havens' },
    { id: 'varanasi', name: 'Varanasi', region: 'Uttar Pradesh', img: '/images/vanvas/varanasi.webp', theme: 'Ancient Ghats & Cosmic Devotion' },
    { id: 'spiti', name: 'Spiti Valley', region: 'Himachal', img: '/images/vanvas/spiti.webp', theme: 'High-Altitude Cold Desert Monasteries' },
    { id: 'goa', name: 'Goa Coast', region: 'Goa', img: '/images/vanvas/goa.webp', theme: 'Portuguese Heritage & Arabian Sea' }
  ];

  return (
    <motion.section
      className="vanvas-feature-section"
      id="vanvas"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer(0.08, 0.05)}
    >
      <div className="section-head" style={{ marginBottom: '32px' }}>
        <span>02</span>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="live-status-pill">
              <span className="live-ping" />
              LIVE SHIPPED PRODUCT • FLAGSHIP
            </span>
            PROVEN ENGINEERING CREDIBILITY
          </div>
          <h2 style={{ marginTop: '8px' }}>
            VANVAS — <i>by The Sorted Club</i>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '680px', marginTop: '10px', lineHeight: 1.55 }}>
            Our flagship AI-powered travel companion. Engineered from the ground up to solve fragmented trip planning with intelligent day-by-day itineraries, cultural artwork guides, and real-time travel logistics.
          </p>
        </div>
      </div>

      {/* Main VANVAS Showcase Card */}
      <motion.div
        className="vanvas-showcase-card"
        variants={fadeInUp}
        whileHover={{ y: -4 }}
        transition={TRANSITIONS.cardSpring}
      >
        {/* Top Product Bar */}
        <div className="vanvas-card-topbar">
          <div className="vanvas-brand-badge">
            <img
              src="/images/vanvas/vanvas-icon.png"
              alt="VANVAS icon"
              className="vanvas-icon-img"
            />
            <div>
              <strong className="vanvas-brand-name">VANVAS</strong>
              <span className="vanvas-by-tag">by The Sorted Club</span>
            </div>
          </div>

          <div className="vanvas-topbar-pills">
            <span className="vanvas-meta-pill">Next.js + FastAPI + PostgreSQL</span>
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
              Explore Live Product <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Card Body Grid */}
        <div className="vanvas-card-grid">
          {/* Left Column: Visual Asset Display */}
          <div className="vanvas-visual-col">
            <div className="vanvas-display-viewport">
              {/* Active Art Preview */}
              <div className="vanvas-main-preview">
                <img
                  src={artworks.find((a) => a.id === activeArtworkTab)?.img || '/images/vanvas/rishikesh.webp'}
                  alt={`VANVAS ${activeArtworkTab} artwork`}
                  className="vanvas-preview-img"
                  loading="lazy"
                />
                <div className="vanvas-preview-overlay">
                  <div className="vanvas-overlay-content">
                    <span className="vanvas-emblem-watermark">
                      <img src="/images/vanvas/vanvas-apple-touch.png" alt="VANVAS logo" />
                      <span>वनवास AI Companion</span>
                    </span>
                    <strong>{artworks.find((a) => a.id === activeArtworkTab)?.name}</strong>
                    <p>{artworks.find((a) => a.id === activeArtworkTab)?.theme}</p>
                  </div>
                  <span className="vanvas-region-badge">
                    <MapPin size={12} /> {artworks.find((a) => a.id === activeArtworkTab)?.region}
                  </span>
                </div>
              </div>

              {/* Artwork Switcher Strip */}
              <div className="vanvas-art-thumbnails-strip">
                <span className="strip-label">Cultural Artworks:</span>
                <div className="art-thumbnails-row">
                  {artworks.map((art) => (
                    <button
                      type="button"
                      key={art.id}
                      className={`art-thumb-btn ${art.id === activeArtworkTab ? 'active' : ''}`}
                      onClick={() => setActiveArtworkTab(art.id)}
                    >
                      <img src={art.img} alt={art.name} />
                      <span>{art.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Problem Solved, Real Features & Stack */}
          <div className="vanvas-details-col">
            <div className="vanvas-problem-box">
              <span className="vanvas-col-eyebrow">THE PROBLEM SOLVED</span>
              <h3>Scattered travel notes, messy WhatsApp groups &amp; generic itineraries.</h3>
              <p>
                Travelers waste hours switching between spreadsheets, map pins, and disjointed blog posts. VANVAS unifies the journey into an intelligent trip companion with conversational itinerary generation, budget tracking, and offline packing tools.
              </p>
            </div>

            {/* Implemented Features */}
            <div className="vanvas-features-list">
              <span className="vanvas-col-eyebrow">VERIFIED SHIPPED CAPABILITIES</span>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Sparkles size={16} /></div>
                <div>
                  <strong>AI-Powered Trip Generator</strong>
                  <span>Synthesizes pacing, day-by-day routes, and cultural context using LLMs.</span>
                </div>
              </div>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Wallet size={16} /></div>
                <div>
                  <strong>Real-Time Budget &amp; Expense Tracking</strong>
                  <span>Tracks multi-category spending, estimated splits, and currency conversion.</span>
                </div>
              </div>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Compass size={16} /></div>
                <div>
                  <strong>Cultural Destination Discovery</strong>
                  <span>Rich editorial guides with handcrafted regional artwork and map pins.</span>
                </div>
              </div>
              <div className="vanvas-feature-item">
                <div className="feat-icon"><Smartphone size={16} /></div>
                <div>
                  <strong>PWA &amp; Capacitor Mobile Native Shell</strong>
                  <span>Engineered for offline access, fast touch response, and mobile field use.</span>
                </div>
              </div>
            </div>

            {/* Verified Tech Stack Tags */}
            <div className="vanvas-stack-container">
              <span className="vanvas-col-eyebrow">VERIFIED TECH STACK</span>
              <div className="vanvas-tech-tags">
                <span className="tech-tag">Next.js 16 (App Router)</span>
                <span className="tech-tag">React 19</span>
                <span className="tech-tag">Tailwind CSS</span>
                <span className="tech-tag">FastAPI (Python)</span>
                <span className="tech-tag">PostgreSQL</span>
                <span className="tech-tag">OpenAI &amp; Groq AI</span>
                <span className="tech-tag">Leaflet Maps</span>
                <span className="tech-tag">Capacitor Native</span>
                <span className="tech-tag">Vercel Deploy</span>
              </div>
            </div>

            {/* Actions */}
            <div className="vanvas-card-cta-group">
              <a
                href="https://vanvasai.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="primary"
                style={{ fontSize: '13.5px', padding: '12px 22px' }}
              >
                Explore Live Product <ExternalLink size={15} />
              </a>

              <motion.button
                type="button"
                className="secondary"
                style={{ fontSize: '13.5px', padding: '12px 18px', border: '1px solid var(--line)' }}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenCaseStudy(VANVAS_CASE_STUDY_DATA)}
              >
                Case Study Breakdown →
              </motion.button>

              <motion.button
                type="button"
                className="card-cta-link"
                style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: 'auto', padding: 0 }}
                whileHover={{ x: 2 }}
                onClick={() =>
                  onOpenInquiry({
                    service: 'Website / Build — Custom Web App',
                    problem: 'I am interested in building a full-stack digital product similar in quality, speed, and architecture to VANVAS.'
                  })
                }
              >
                Build a Product Like This →
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
