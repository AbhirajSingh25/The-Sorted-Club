import React from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Award,
  Briefcase,
  Code2,
  ExternalLink,
  MessageSquare,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { TRANSITIONS, fadeInUp, staggerContainer } from '../utils/motion';

export default function FounderSection({ onOpenInquiry }) {
  return (
    <motion.section
      className="founder-profile-section"
      id="founder"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer(0.08, 0.05)}
    >
      <div className="section-head" style={{ marginBottom: '36px' }}>
        <span>07</span>
        <div>
          <p className="eyebrow">BEHIND THE CLUB • ACCOUNTABILITY &amp; LEADERSHIP</p>
          <h2>
            The person behind<br />
            <i>the work.</i>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', marginTop: '10px', lineHeight: 1.55 }}>
            The Sorted Club operates on direct accountability. No junior account managers or layers of agency bureaucracy. You work directly with the founder and technical squad who architect and write your code.
          </p>
        </div>
      </div>

      <div className="founder-card-layout">
        {/* Left Column / Mobile Header: Adjacent Horizontal Layout on Phone */}
        <motion.div
          className="founder-portrait-col"
          variants={fadeInUp}
        >
          <div className="founder-header-flex">
            <div className="founder-image-wrapper">
              <img
                src="/images/founder-abhiraj.jpg"
                alt="Abhiraj Singh Sengar — Founder & Principal Engineer of The Sorted Club"
                className="founder-portrait-img"
                loading="lazy"
              />
              <div className="founder-image-tag">
                <span className="live-dot" style={{ background: '#15803d' }} />
                <span>Available for Technical Discovery</span>
              </div>
            </div>

            <div className="founder-info-beside">
              <div className="founder-nameplate">
                <span className="founder-eyebrow-tag">DIRECT LEADERSHIP</span>
                <h3>Abhiraj Singh Sengar</h3>
                <span className="founder-role-title">Founder &amp; Principal Engineer</span>
                <p className="founder-bio-sub">
                  Full-Stack Software Engineer • AI/ML Systems Architect
                </p>
              </div>

              {/* Verified Contact Lines */}
              <div className="founder-channels-box">
                <a
                  href="https://wa.me/919643820888?text=Hi%20Abhiraj%2C%20I%20reviewed%20The%20Sorted%20Club%20and%20would%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-channel-link"
                >
                  <MessageSquare size={13} color="#15803d" />
                  <span>WhatsApp: +91 9643820888</span>
                </a>
                <a
                  href="mailto:thesortedclub@gmail.com"
                  className="founder-channel-link"
                >
                  <Mail size={13} />
                  <span>thesortedclub@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Founder Manifesto, Verified Credentials & Shipped Work */}
        <motion.div
          className="founder-narrative-col"
          variants={fadeInUp}
        >
          {/* Founder Note */}
          <div className="founder-manifesto-box">
            <span className="founder-block-label">WHY THE SORTED CLUB EXISTS</span>
            <blockquote className="founder-quote">
              "Most ambitious businesses are stuck between two extremes: traditional digital agencies that take months and charge for layers of account managers, or cheap marketplaces with zero engineering standards.
              <br /><br />
              We built The Sorted Club to offer a third way: direct engineering sprints, clean modular code, transparent fixed milestones, and 100% intellectual property ownership from day one."
            </blockquote>
          </div>

          {/* Verified Academic & Credential Timeline */}
          <div className="founder-credentials-section">
            <span className="founder-block-label">VERIFIED CREDENTIALS &amp; BACKGROUND</span>

            <div className="credentials-grid">
              {/* Education */}
              <div className="credential-tile">
                <div className="credential-icon">
                  <GraduationCap size={18} />
                </div>
                <div className="credential-content">
                  <strong>Galgotias University</strong>
                  <span className="credential-degree">B.Tech in Computer Science &amp; Engineering</span>
                  <span className="credential-spec">Specialization in Artificial Intelligence &amp; Machine Learning (CGPA: 7.6)</span>
                  <span className="credential-dates">2021 – 2025 • Greater Noida</span>
                </div>
              </div>

              {/* Oracle Certification */}
              <div className="credential-tile">
                <div className="credential-icon">
                  <Award size={18} />
                </div>
                <div className="credential-content">
                  <strong>Oracle Certified Professional</strong>
                  <span className="credential-degree">Oracle Certified Foundations Associate – Java</span>
                  <span className="credential-spec">Object-Oriented Architecture, JVM Optimization &amp; Backend Reliability</span>
                  <span className="credential-dates">Official Industry Credential</span>
                </div>
              </div>

              {/* Experience */}
              <div className="credential-tile">
                <div className="credential-icon">
                  <Briefcase size={18} />
                </div>
                <div className="credential-content">
                  <strong>Software Developer Experience</strong>
                  <span className="credential-degree">iWebs Technology &amp; Codules Technologies</span>
                  <span className="credential-spec">REST APIs, Java / Spring Boot, Python FastAPI, PostgreSQL &amp; React Integration</span>
                  <span className="credential-dates">Software Developer Intern • Production Systems Delivery</span>
                </div>
              </div>

              {/* Shipped Systems */}
              <div className="credential-tile">
                <div className="credential-icon">
                  <Code2 size={18} />
                </div>
                <div className="credential-content">
                  <strong>Key Shipped Platforms</strong>
                  <span className="credential-degree">VANVAS &amp; HireSense AI</span>
                  <span className="credential-spec">Full-stack web applications featuring LLM integrations, spatial UI &amp; automated workflows</span>
                  <span className="credential-dates">Active Production Architectures</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="founder-action-row">
            <motion.button
              type="button"
              className="primary"
              onClick={() => onOpenInquiry({ service: 'Website / Build' })}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              style={{ fontSize: '14px', padding: '13px 24px' }}
            >
              Start a Conversation with the Founder <ArrowRight size={16} />
            </motion.button>

            <a
              href="https://vanvasai.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary"
              style={{ fontSize: '13px', padding: '12px 18px', border: '1px solid var(--line)', textDecoration: 'none' }}
            >
              Inspect Live Product: VANVAS ↗
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
