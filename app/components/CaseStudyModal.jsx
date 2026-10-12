import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowRight,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { modalBackdropVariants, modalContainerVariants, TRANSITIONS } from '../utils/motion';

export default function CaseStudyModal({
  isOpen,
  onClose,
  template,
  onNavigate,
  onOpenInquiry
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!template) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop case-study-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="modal-container case-study-modal-container"
            variants={modalContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close Button */}
            <motion.button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close case study details"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={TRANSITIONS.buttonSpring}
            >
              <X size={20} />
            </motion.button>

            {/* Modal Top Metadata */}
            <div className="case-study-topbar">
              <div className="case-study-tags">
                <span className="case-study-badge">{template.badge || 'Demo Concept'}</span>
                <span className="case-study-cat">{template.category}</span>
                <span className="case-study-style">{template.designStyle} Style</span>
              </div>
              <h2 id="case-study-title" className="case-study-title">
                {template.name}
              </h2>
              <p className="case-study-tagline">{template.tagline}</p>
            </div>

            {/* Visual Browser Preview Banner */}
            <div className="case-study-preview-window">
              <div className="preview-window-chrome">
                <div className="chrome-dots">
                  <span className="dot red" />
                  <span className="dot amber" />
                  <span className="dot green" />
                </div>
                <div className="chrome-url-bar">
                  <span>thesortedclub.com/blueprints/{template.slug}</span>
                </div>
                <div className="chrome-turnaround">
                  <Clock size={12} /> {template.turnaround}
                </div>
              </div>

              <div className="preview-window-canvas">
                <img
                  src={template.heroImage}
                  alt={`${template.name} website blueprint showcase`}
                  loading="lazy"
                />
                <div className="preview-canvas-overlay">
                  <div className="preview-overlay-info">
                    <strong>Production-Ready Architecture</strong>
                    <span>Designed for sub-second mobile loads &amp; instant conversions</span>
                  </div>
                  <button
                    type="button"
                    className="preview-live-btn"
                    onClick={() => {
                      onClose();
                      onNavigate(`/demo/${template.slug}`);
                    }}
                  >
                    Open Live Interactive Demo <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Structured Case Study Sections */}
            <div className="case-study-grid">
              {/* Left Column: Problem & Delivery */}
              <div className="case-study-col">
                <div className="case-study-block">
                  <div className="block-label">
                    <span>01</span> / THE BUSINESS PROBLEM &amp; GOAL
                  </div>
                  <h4 className="block-heading">Challenges Solved</h4>
                  <p className="block-text">
                    {template.shortDesc}
                  </p>
                  <div className="block-target-box">
                    <strong>Engineered For:</strong>
                    <span>{template.suitableFor}</span>
                  </div>
                </div>

                <div className="case-study-block">
                  <div className="block-label">
                    <span>02</span> / WHAT THE SORTED CLUB DELIVERS
                  </div>
                  <h4 className="block-heading">Core Capabilities &amp; Scope</h4>
                  <ul className="case-study-features-list">
                    {template.mainFeatures.map((feat, idx) => (
                      <li key={idx}>
                        <Check size={14} className="feature-check" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Specifications & Commercial Terms */}
              <div className="case-study-col">
                <div className="case-study-block highlight-block">
                  <div className="block-label">
                    <span>03</span> / PRODUCTION SPECIFICATIONS
                  </div>
                  <div className="spec-row">
                    <span>Turnaround Time:</span>
                    <strong>{template.turnaround}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Starting Investment:</span>
                    <strong>{template.startingPrice} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '12px' }}>({template.startingPriceUSD})</span></strong>
                  </div>
                  <div className="spec-row">
                    <span>Tech Architecture:</span>
                    <span className="spec-tech">{template.techStack}</span>
                  </div>
                  <div className="spec-row">
                    <span>Code Ownership:</span>
                    <strong>100% Client Ownership (No Lock-in)</strong>
                  </div>
                </div>

                {template.includedSections && (
                  <div className="case-study-block">
                    <div className="block-label">
                      <span>04</span> / INCLUDED ARCHITECTURAL SECTIONS
                    </div>
                    <ul className="sections-list">
                      {template.includedSections.map((sec, idx) => (
                        <li key={idx}>
                          <span>•</span> {sec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="case-study-foot">
              <div className="foot-note">
                <ShieldCheck size={14} /> 50% upfront, 50% on launch. 30–60 day warranty included.
              </div>

              <div className="foot-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    onClose();
                    onNavigate(`/demo/${template.slug}`);
                  }}
                >
                  <Laptop size={14} style={{ marginRight: '6px' }} />
                  Interactive Demo
                </button>

                <motion.button
                  type="button"
                  className="primary"
                  onClick={() => {
                    onClose();
                    onOpenInquiry({ template });
                  }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={TRANSITIONS.buttonSpring}
                >
                  Build a Website Like This <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
