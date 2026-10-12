import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  Server,
  Database,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import { TRANSITIONS } from '../utils/motion';

// Recognizable technology SVGs with accessible titles and official brand hues
const TECH_CATEGORIES = [
  {
    id: 'frontend',
    category: 'Frontend & Experience',
    icon: Code2,
    desc: 'Performant, sub-second web frontends engineered with modern component architectures, fluid micro-interactions, and 90+ PageSpeed scores.',
    items: [
      {
        name: 'React',
        role: 'Component Architecture',
        color: '#61dafb',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#61dafb" strokeWidth="1.5">
            <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(0 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(120 12 12)" />
            <circle cx="12" cy="12" r="1.8" fill="#61dafb" />
          </svg>
        )
      },
      {
        name: 'Next.js',
        role: 'Full-Stack SSR & App Router',
        color: '#000000',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#10100f">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.4 16.5l-6-8.2V16H10V8h1.6l6 8.3v.2z" />
          </svg>
        )
      },
      {
        name: 'Vite',
        role: 'Next-Gen Build Engine',
        color: '#646cff',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M21.5 3.5l-9.8 17.7c-.3.5-.9.5-1.2 0L.7 3.5c-.4-.7.1-1.5.9-1.5h19c.8 0 1.3.8.9 1.5z" fill="#646cff" opacity="0.3" />
            <path d="M12.5 1.5l-8 15 7.5-1 6-14h-5.5z" fill="#bd34fe" />
            <path d="M12 15.5l-3 6.5 11-17h-6l-2 10.5z" fill="#ffbd14" />
          </svg>
        )
      },
      {
        name: 'TypeScript',
        role: 'Type-Safe Engineering',
        color: '#3178c6',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22">
            <rect width="24" height="24" rx="4" fill="#3178c6" />
            <text x="4" y="17" fill="#ffffff" fontSize="11" fontWeight="700" fontFamily="sans-serif">TS</text>
          </svg>
        )
      },
      {
        name: 'Motion / React',
        role: 'Physics & Orchestrated Motion',
        color: '#ff0055',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M4 4h16v8H12L4 4z" fill="#ff0055" />
            <path d="M4 12h8l8 8H4v-8z" fill="#ff0055" opacity="0.8" />
          </svg>
        )
      },
      {
        name: 'Vanilla CSS & HTML5',
        role: 'Zero-Bloat Semantic Styling',
        color: '#e34f26',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#e34f26">
            <path d="M3 2l1.6 18.2L12 22l7.4-1.8L21 2H3zm14.8 6.5h-8l.2 2.5h7.6l-.6 6.3-5 1.4-5-1.4-.3-3.6h2.5l.2 1.8 2.6.7 2.6-.7.3-3.1H7.2L6.5 5.5h11.7l-.4 3z" />
          </svg>
        )
      }
    ]
  },
  {
    id: 'backend',
    category: 'Backend & APIs',
    icon: Server,
    desc: 'Resilient asynchronous APIs, relational schemas, secure auth, and webhook sync engines built for high throughput.',
    items: [
      {
        name: 'Python',
        role: 'Core Backend & AI Pipelines',
        color: '#3776ab',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <path d="M11.9 2c-3.1 0-4.9 1.4-4.9 3.8v2.4h5v.8H5.6C3.2 9 2 10.7 2 13.9c0 3.3 1.3 4.9 4.3 4.9h2.3v-2.3c0-2 1.6-3.7 3.7-3.7h4.8v-.9c0-2.4-1.8-3.8-5-3.8H9.3V5.8c0-2.1 1.7-3.8 3.8-3.8h2.3c0-2.4-1.8-3.8-3.5-3.8z" fill="#3776ab" />
            <circle cx="9.5" cy="4.5" r="1" fill="#fff" />
            <circle cx="14.5" cy="19.5" r="1" fill="#fff" />
          </svg>
        )
      },
      {
        name: 'FastAPI',
        role: 'High-Performance Async APIs',
        color: '#059669',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <circle cx="12" cy="12" r="10" fill="#009688" />
            <path d="M13 4l-6 9h5l-2 7 8-10h-5l2-6z" fill="#ffffff" />
          </svg>
        )
      },
      {
        name: 'Node.js',
        role: 'Event-Driven Microservices',
        color: '#339933',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#339933">
            <path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2zm0 2.4L5.1 8.5v7.1L12 19.6l6.9-4v-7.1L12 4.4z" />
          </svg>
        )
      },
      {
        name: 'REST & Webhooks',
        role: 'Bi-directional Real-Time Sync',
        color: '#10100f',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#10100f" strokeWidth="2">
            <path d="M4 17l6-6-6-6M12 19h8" />
          </svg>
        )
      }
    ]
  },
  {
    id: 'data',
    category: 'Data & Infrastructure',
    icon: Database,
    desc: 'Battle-tested relational databases, automated GitHub Actions CI/CD pipelines, and high-availability edge deployments.',
    items: [
      {
        name: 'PostgreSQL',
        role: 'Primary Relational Database',
        color: '#336791',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#336791">
            <path d="M12 2C6.5 2 2 6.5 2 12c0 4.8 3.5 8.8 8.1 9.8v-6.9h-2.5v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6v1.9h2.8l-.4 2.9h-2.4V22c5-.5 9-4.7 9-10 0-5.5-4.5-10-10-10z" />
          </svg>
        )
      },
      {
        name: 'SQLite',
        role: 'Fast Embedded Persistence',
        color: '#003b57',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#003b57">
            <ellipse cx="12" cy="6" rx="9" ry="3" />
            <path d="M3 6v6c0 1.7 4 3 9 3s9-1.3 9-3V6M3 12v6c0 1.7 4 3 9 3s9-1.3 9-3v-6" fill="none" stroke="#003b57" strokeWidth="2" />
          </svg>
        )
      },
      {
        name: 'Git & GitHub Actions',
        role: 'Version Control & Automated CI/CD',
        color: '#24292e',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#10100f">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.34.7-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.8-1.34-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.84 1.2 1.84 1.2 1.08 1.8 2.82 1.3 3.5.9.1-.8.43-1.3.77-1.6-2.67-.3-5.47-1.3-5.47-6 0-1.3.47-2.4 1.24-3.2-.12-.3-.54-1.6.12-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.66 1.6.24 2.9.12 3.2.77.8 1.24 1.9 1.24 3.2 0 4.6-2.8 5.6-5.5 5.9.44.4.84 1.1.84 2.2v3.3c0 .3.2.7.8.6C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        )
      },
      {
        name: 'Vercel & Cloud Edge',
        role: 'Global Edge Network Deployment',
        color: '#000000',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#10100f">
            <path d="M12 2L2 20h20L12 2z" />
          </svg>
        )
      }
    ]
  },
  {
    id: 'ai',
    category: 'AI & Automation',
    icon: Cpu,
    desc: 'Autonomous LLM agents, domain RAG pipelines, WhatsApp webhook automations, and CRM sync bots.',
    items: [
      {
        name: 'OpenAI API',
        role: 'GPT-4o & Text Embeddings',
        color: '#10a37f',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#10a37f">
            <path d="M22.3 9.4a5.7 5.7 0 00-.5-4.5 5.8 5.8 0 00-5.8-2.8 5.7 5.7 0 00-4.3 1.9A5.7 5.7 0 004 5.8a5.8 5.8 0 00-2.3 5.4 5.7 5.7 0 001.9 4.3 5.8 5.8 0 002.8 5.8 5.7 5.7 0 007.7 1.8 5.7 5.7 0 004.3-1.9 5.8 5.8 0 005.8-2.8 5.7 5.7 0 002.3-5.4 5.7 5.7 0 00-1.9-4.3zM12 14.8a2.8 2.8 0 112.8-2.8 2.8 2.8 0 01-2.8 2.8z" />
          </svg>
        )
      },
      {
        name: 'Groq AI',
        role: 'Ultra-Low Latency Inference',
        color: '#f55036',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#f55036" strokeWidth="2" />
            <path d="M8 12h8M12 8v8" stroke="#f55036" strokeWidth="2" />
          </svg>
        )
      },
      {
        name: 'RAG & Vector Retrieval',
        role: 'Domain Context Knowledge Engines',
        color: '#8b5cf6',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
          </svg>
        )
      },
      {
        name: 'WhatsApp & CRM Sync',
        role: 'Autonomous Lead Routing & Alerts',
        color: '#15803d',
        svg: (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#15803d" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        )
      }
    ]
  }
];

export default function TechStackSection({ onOpenInquiry }) {
  const [activeCategory, setActiveCategory] = useState('frontend');
  const currentCat = TECH_CATEGORIES.find((c) => c.id === activeCategory) || TECH_CATEGORIES[0];

  return (
    <section className="tech-stack-section" id="tech">
      <div className="section-head" style={{ marginBottom: '32px' }}>
        <span>04</span>
        <div>
          <p className="eyebrow">TECHNICAL ARSENAL &amp; CAPABILITIES</p>
          <h2>
            Engineered with modern,<br />
            <i>battle-tested tools.</i>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', marginTop: '10px', lineHeight: 1.55 }}>
            No fragile drag-and-drop page builders or black-box dependencies. Every product we ship runs on clean, open-source architectures with 100% full source code ownership upon launch.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="tech-category-tabs" role="tablist" aria-label="Technology categories">
        {TECH_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              key={cat.id}
              className={`tech-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Icon size={16} />
              <span>{cat.category}</span>
              <span className="tech-count-badge">{cat.items.length}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Panel with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCat.id}
          className="tech-active-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={TRANSITIONS.editorial}
        >
          <div className="tech-cat-header">
            <div>
              <h3 className="tech-cat-title">{currentCat.category}</h3>
              <p className="tech-cat-desc">{currentCat.desc}</p>
            </div>
            <span className="tech-ownership-badge">✓ 100% Client Code Ownership</span>
          </div>

          <div className="tech-items-grid">
            {currentCat.items.map((tech) => (
              <div
                key={tech.name}
                className="tech-item-tile"
              >
                <div className="tech-icon-box">
                  {tech.svg}
                </div>
                <div className="tech-info-box">
                  <strong className="tech-name">{tech.name}</strong>
                  <span className="tech-role">{tech.role}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Guarantees Strip */}
      <div className="tech-guarantee-strip">
        <div className="guarantee-cell">
          <CheckCircle2 size={16} color="#15803d" />
          <span>Zero proprietary page-builder lock-in (WordPress, Wix, Webflow plugins)</span>
        </div>
        <div className="guarantee-cell">
          <CheckCircle2 size={16} color="#15803d" />
          <span>90+ PageSpeed target &amp; clean semantic HTML5 / CSS3</span>
        </div>
        <div className="guarantee-cell">
          <CheckCircle2 size={16} color="#15803d" />
          <span>Full source repository handover with Git version history</span>
        </div>
      </div>
    </section>
  );
}
