import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Bot, BriefcaseBusiness, Code2, Users, Menu, X, Shield, Sparkles } from 'lucide-react';
import './styles.css';
import CustomCursor from './components/CustomCursor';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  heroLineReveal,
  staggerContainer,
  TRANSITIONS,
  routeVariants
} from './utils/motion';
import InquiryModal from './components/InquiryModal';
import AdminDashboard from './components/AdminDashboard';
import CRMView from './components/CRMView';
import ClientDashboard from './components/ClientDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import PublicProposalView from './components/PublicProposalView';
import PublicContractView from './components/PublicContractView';
import PublicInvoiceView from './components/PublicInvoiceView';
import PublicProjectView from './components/PublicProjectView';
import PublicApprovalView from './components/PublicApprovalView';
import ProjectDashboard from './components/ProjectDashboard';
import CommandCenterView from './components/CommandCenterView';
import ServicesPages from './components/ServicesPages';
import TemplateCatalog from './components/TemplateCatalog';
import TemplateDetail from './components/TemplateDetail';
import TemplateLiveDemo from './components/TemplateLiveDemo';
import PricingPage from './components/PricingPage';
import DiscoveryQuestionnaire from './components/DiscoveryQuestionnaire';
import AdminLogin from './components/AdminLogin';
import MobileAdminShell from './components/mobile/MobileAdminShell';
import { useIsMobile } from './utils/responsive';
import { getAdminToken, verifyAdminSession, clearAdminAuth } from './api/client';

const pillars = [
  {
    slug: 'build',
    icon: Code2,
    title: 'Build',
    service: 'Website / Build',
    text: 'Websites, apps and software that make your business work better.'
  },
  {
    slug: 'grow',
    icon: BriefcaseBusiness,
    title: 'Grow',
    service: 'Marketing / Growth',
    text: 'Content, marketing and lead systems built around measurable growth.'
  },
  {
    slug: 'automate',
    icon: Bot,
    title: 'Automate',
    service: 'AI / Automation',
    text: 'AI, WhatsApp and workflows that take repetitive work off your plate.'
  },
  {
    slug: 'hire',
    icon: Users,
    title: 'Hire',
    service: 'Hiring',
    text: 'Smarter sourcing, screening and interviews, powered by HireSense AI.'
  }
];

function LandingPage({ onOpenInquiry, onNavigate, onNavigateToAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={TRANSITIONS.editorial}
      >
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          THE SORTED <span>CLUB</span>
        </div>

        <button
          className="menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navlinks ${mobileMenuOpen ? 'open' : ''}`}>
          <a
            href="/services"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/services');
            }}
          >
            Services
          </a>
          <a
            href="/templates"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/templates');
            }}
          >
            Templates &amp; Portfolio
          </a>
          <a
            href="/pricing"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              onNavigate('/pricing');
            }}
          >
            Pricing &amp; Packages
          </a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>
            Why Sorted
          </a>
          <motion.button
            className="navcta"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquiry({ service: 'Website / Build' });
            }}
          >
            Get in Touch <ArrowRight size={16} />
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="hero">
        <motion.div
          className="hero-orbit orbit-one"
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="hero-orbit orbit-two"
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="eyebrow"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          THE BUSINESS CLUB FOR WHAT'S NEXT
          <motion.span
            className="live-dot"
            animate={{ scale: [1, 1.35, 1], opacity: [1, 0.65, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        >
          Your business.<br />
          <em>Sorted.</em>
        </motion.h1>

        <motion.p
          className="hero-copy"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
        >
          We build, grow, automate and hire for ambitious businesses. One team. One place. Fewer things left unsorted.
        </motion.p>

        <motion.div
          className="actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.36 }}
        >
          <motion.button
            className="primary"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onOpenInquiry({ service: 'Website / Build' })}
          >
            Free Website Consultation <ArrowRight size={18} />
          </motion.button>
          <motion.button
            className="secondary"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onNavigate('/pricing')}
          >
            View Website Pricing (From ₹14,999) <ArrowRight size={14} />
          </motion.button>
          <motion.button
            className="secondary"
            style={{ background: 'transparent', borderColor: 'var(--line)' }}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onNavigate('/templates')}
          >
            Browse Blueprints →
          </motion.button>
        </motion.div>

        <motion.div
          className="hero-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.48 }}
        >
          <div className="hero-note">Welcome to the club.</div>
          <div style={{ color: 'var(--muted)' }}>EST. 2026 — GLOBAL OPERATING COLLECTIVE</div>
        </motion.div>
      </section>

      {/* Marquee Ticker */}
      <div className="ticker">
        <div>
          <span>BUILD</span> • <span>GROW</span> • <span>AUTOMATE</span> • <span>HIRE</span> • <span>CUSTOM SOFTWARE</span> • <span>REVENUE SYSTEMS</span> • <span>AI WORKFLOWS</span> • <span>HIRESENSE</span> • <span>BUILD</span> • <span>GROW</span> • <span>AUTOMATE</span> • <span>HIRE</span>
        </div>
      </div>

      {/* Services Section */}
      <motion.section
        id="services"
        className="services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={staggerContainer(0.08, 0.05)}
      >
        <motion.div className="section-head" variants={fadeInUp}>
          <span>01</span>
          <div>
            <p className="eyebrow">WHAT WE SORT</p>
            <h2>
              Whatever your business needs,<br />
              <i>we'll get it sorted.</i>
            </h2>
          </div>
        </motion.div>

        <motion.div className="grid" variants={staggerContainer(0.08, 0.08)}>
          {pillars.map(({ icon: Icon, title, service, text, slug }) => (
            <motion.article
              key={title}
              className="service-card"
              variants={fadeInUp}
              whileHover={{ y: -6, backgroundColor: '#eeece4' }}
              transition={TRANSITIONS.cardSpring}
              data-cursor={`Explore ${title}`}
            >
              <div className="card-top">
                <Icon size={24} />
                <span>0{pillars.findIndex((p) => p.title === title) + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                <motion.button
                  type="button"
                  onClick={() => onNavigate(`/services/${slug}`)}
                  className="card-cta-link"
                  whileHover={{ x: 3 }}
                  transition={TRANSITIONS.buttonSpring}
                >
                  Explore {title} <ArrowRight size={15} />
                </motion.button>
                {slug === 'build' && (
                  <motion.button
                    type="button"
                    onClick={() => onNavigate('/templates')}
                    className="card-cta-link"
                    style={{ color: 'var(--muted)', fontSize: '13px' }}
                    whileHover={{ x: 3 }}
                    transition={TRANSITIONS.buttonSpring}
                  >
                    View Blueprints →
                  </motion.button>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      {/* About / Manifesto Section */}
      <motion.section
        id="about"
        className="manifesto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.08)}
      >
        <motion.div className="manifesto-label" variants={fadeInUp}>
          <p className="eyebrow">02 / THE IDEA</p>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <h2>
            You bring the problem.<br />
            <span>We get it sorted.</span>
          </h2>
          <p className="manifesto-copy">
            Businesses shouldn't need five agencies, ten tools and a small miracle to get things done. The Sorted Club brings technology, growth and people together under one roof.
          </p>
          <motion.div className="manifesto-points" variants={staggerContainer(0.06, 0.1)}>
            {['Single Point of Accountability', 'Battle-tested Engineering', 'Rapid Turnaround', 'Transparent Pricing'].map((pt) => (
              <motion.div
                key={pt}
                variants={fadeInUp}
                whileHover={{ scale: 1.04, borderColor: '#555' }}
                transition={TRANSITIONS.buttonSpring}
              >
                ✓ {pt}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Membership Section */}
      <motion.section
        className="club"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.05)}
      >
        <motion.div className="club-copy" variants={fadeInUp}>
          <p className="eyebrow">03 / MEMBERSHIP</p>
          <h2>Join the club.</h2>
          <p>Start with one problem. Stay for everything else we can sort.</p>
          <div style={{ marginTop: '24px' }}>
            <motion.button
              className="primary"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => onOpenInquiry()}
            >
              Become a member <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="club-card"
          initial={{ opacity: 0, rotate: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, rotate: 2, scale: 1 }}
          viewport={{ once: true }}
          transition={TRANSITIONS.cardSpring}
          whileHover={{ rotate: 0, scale: 1.02, y: -4 }}
          data-cursor="Member Pass"
        >
          <div>
            <div className="club-mark">SORTED<span>*</span></div>
            <div className="club-card-title">MEMBER PASS</div>
          </div>
          <div className="club-card-line" />
          <p>ONE DIRECT BRIEF LINE • DEDICATED SQUAD • UNLIMITED SCALE</p>
          <strong>THE SORTED CLUB 2026</strong>
        </motion.div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        className="contact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer(0.1, 0.05)}
      >
        <motion.div variants={fadeInUp}>
          <p className="eyebrow">04 / GET STARTED</p>
          <h2>What's not sorted yet?</h2>
          <p>Tell us what you're trying to fix, build or grow. We'll figure out the next move.</p>
        </motion.div>

        <motion.div className="contact-actions" variants={fadeInUp}>
          <motion.button
            className="primary dark"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onOpenInquiry()}
            style={{ fontSize: '15px' }}
          >
            Tell us what needs sorting <ArrowRight size={18} />
          </motion.button>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px' }}>
            <motion.a
              href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20your%20BUILD%20services."
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, textDecoration: 'none' }}
              whileHover={{ x: 2 }}
            >
              WhatsApp: +91 9643820888 →
            </motion.a>
            <motion.a
              href="mailto:thesortedclub@gmail.com"
              style={{ fontSize: '13px', color: 'var(--ink)', textDecoration: 'none' }}
              whileHover={{ opacity: 0.7 }}
            >
              thesortedclub@gmail.com
            </motion.a>
          </div>
          <small>Direct access. No sales fluff. Response in &lt; 24 hrs.</small>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
          THE SORTED CLUB
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            onClick={onNavigateToAdmin}
            className="footer-admin-link"
            title="Admin Portal"
          >
            <Shield size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Admin Portal
          </button>
        </div>
        <p>
          Build. Grow. Automate. Hire. •{' '}
          <a
            href="/templates"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/templates');
            }}
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Templates &amp; Portfolio
          </a> •{' '}
          <a
            href="/pricing"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/pricing');
            }}
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Services &amp; Pricing
          </a> •{' '}
          <a
            href="/discovery"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/discovery');
            }}
            style={{ textDecoration: 'underline', color: 'inherit' }}
          >
            Discovery Brief
          </a>
        </p>
        <p style={{ textAlign: 'right' }}>
          <a href="mailto:thesortedclub@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
            thesortedclub@gmail.com
          </a> • <a href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20your%20BUILD%20services." target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>+91 9643820888</a>
        </p>
        <small>© 2026 The Sorted Club. All rights reserved. • Blueprints labeled Demo Concept.</small>
      </motion.footer>
    </main>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(Boolean(getAdminToken()));
  const [forceDesktop, setForceDesktop] = useState(false);
  const isMobile = useIsMobile(768);

  // Synchronize route changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Check admin session if token exists
  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      verifyAdminSession()
        .then(() => setIsAdminAuthenticated(true))
        .catch(() => {
          clearAdminAuth();
          setIsAdminAuthenticated(false);
        });
    } else {
      setIsAdminAuthenticated(false);
    }
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCRM = (stageOrOptions, maybeFollowup) => {
    let url = '/admin/crm';
    if (typeof stageOrOptions === 'string') {
      const params = new URLSearchParams();
      params.set('stage', stageOrOptions);
      if (maybeFollowup) params.set('followup', maybeFollowup);
      url += `?${params.toString()}`;
    } else if (stageOrOptions && typeof stageOrOptions === 'object') {
      const params = new URLSearchParams();
      if (stageOrOptions.stage) params.set('stage', stageOrOptions.stage);
      if (stageOrOptions.followup) params.set('followup', stageOrOptions.followup);
      if (stageOrOptions.selectedLead || stageOrOptions.leadId) {
        params.set('selectedLead', stageOrOptions.selectedLead || stageOrOptions.leadId);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleNavigateToClients = (clientIdOrOptions) => {
    let url = '/admin/clients';
    if (typeof clientIdOrOptions === 'string' || typeof clientIdOrOptions === 'number') {
      url += `?selectedClient=${clientIdOrOptions}`;
    } else if (clientIdOrOptions && typeof clientIdOrOptions === 'object') {
      const params = new URLSearchParams();
      if (clientIdOrOptions.selectedClient || clientIdOrOptions.clientId) {
        params.set('selectedClient', clientIdOrOptions.selectedClient || clientIdOrOptions.clientId);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleNavigateToFinance = (tabOrOptions) => {
    let url = '/admin/finance';
    if (typeof tabOrOptions === 'string') {
      url += `?tab=${tabOrOptions}`;
    } else if (tabOrOptions && typeof tabOrOptions === 'object') {
      const params = new URLSearchParams();
      if (tabOrOptions.tab) params.set('tab', tabOrOptions.tab);
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleNavigateToProjects = (projectIdOrClient, maybeProjectId) => {
    let url = '/admin/projects';
    if (maybeProjectId) {
      url += `?selectedProject=${maybeProjectId}`;
    } else if (typeof projectIdOrClient === 'string' || typeof projectIdOrClient === 'number') {
      url += `?selectedProject=${projectIdOrClient}`;
    } else if (projectIdOrClient && typeof projectIdOrClient === 'object') {
      const params = new URLSearchParams();
      if (projectIdOrClient.selectedProject || projectIdOrClient.projectId) {
        params.set('selectedProject', projectIdOrClient.selectedProject || projectIdOrClient.projectId);
      }
      if (projectIdOrClient.health) {
        params.set('health', projectIdOrClient.health);
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }
    navigateTo(url);
  };

  const handleOpenInquiry = (serviceOrOpts = '') => {
    if (typeof serviceOrOpts === 'object' && serviceOrOpts !== null) {
      if (serviceOrOpts.template) {
        setSelectedTemplate(serviceOrOpts.template);
        setSelectedService('Website / Build');
      } else if (serviceOrOpts.service) {
        setSelectedService(serviceOrOpts.service);
        setSelectedTemplate(null);
      }
    } else if (typeof serviceOrOpts === 'string') {
      setSelectedService(serviceOrOpts);
      setSelectedTemplate(null);
    }
    setInquiryModalOpen(true);
  };

  const renderCurrentView = () => {
    // Route: Public Tokenized Proposal View /proposal/{token}
    if (currentPath.startsWith('/proposal/')) {
      const token = currentPath.replace('/proposal/', '').split('?')[0];
      return (
        <PublicProposalView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Contract View /contract/{token}
    if (currentPath.startsWith('/contract/')) {
      const token = currentPath.replace('/contract/', '').split('?')[0];
      return (
        <PublicContractView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Invoice View /invoice/{token}
    if (currentPath.startsWith('/invoice/')) {
      const token = currentPath.replace('/invoice/', '').split('?')[0];
      return (
        <PublicInvoiceView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Customer Project View /project/{token}
    if (currentPath.startsWith('/project/')) {
      const token = currentPath.replace('/project/', '').split('?')[0];
      return (
        <PublicProjectView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Public Tokenized Deliverable Approval /project-review/{token}
    if (currentPath.startsWith('/project-review/')) {
      const token = currentPath.replace('/project-review/', '').split('?')[0];
      return (
        <PublicApprovalView
          token={token}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: /admin/crm, /admin/clients, /admin/finance, /admin/projects, and /admin
    if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
      if (!isAdminAuthenticated) {
        return (
          <AdminLogin
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      // Dedicated Mobile-First Admin Experience on mobile devices
      if (isMobile && !forceDesktop) {
        let initialTab = 'home';
        let selLeadId = null;
        let selProjId = null;

        const urlParams = new URLSearchParams(window.location.search);

        if (currentPath === '/admin/crm' || currentPath.startsWith('/admin/crm')) {
          initialTab = 'leads';
          selLeadId = urlParams.get('selectedLead') || null;
        } else if (currentPath === '/admin/projects' || currentPath.startsWith('/admin/projects')) {
          initialTab = 'projects';
          selProjId = urlParams.get('selectedProject') || null;
        } else if (
          currentPath === '/admin/clients' ||
          currentPath.startsWith('/admin/clients') ||
          currentPath === '/admin/finance' ||
          currentPath.startsWith('/admin/finance') ||
          currentPath === '/admin/more'
        ) {
          initialTab = 'more';
        }

        return (
          <MobileAdminShell
            initialTab={initialTab}
            initialSelectedLeadId={selLeadId}
            initialSelectedProjectId={selProjId}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToProjects={handleNavigateToProjects}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToTemplates={() => navigateTo('/templates')}
            onSwitchToDesktop={() => setForceDesktop(true)}
            onBackToSite={() => navigateTo('/')}
            onLogout={() => setIsAdminAuthenticated(false)}
          />
        );
      }

      if (currentPath === '/admin/projects' || currentPath.startsWith('/admin/projects')) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSelectedProject = urlParams.get('selectedProject');
        const selectedProjId = (rawSelectedProject && /^\d+$/.test(rawSelectedProject)) ? rawSelectedProject : null;

        return (
          <ProjectDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onBackToSite={() => navigateTo('/')}
            initialSelectedProjectId={selectedProjId}
          />
        );
      }

      if (
        currentPath === '/admin/finance' ||
        currentPath.startsWith('/admin/finance') ||
        currentPath === '/admin/proposals' ||
        currentPath === '/admin/contracts' ||
        currentPath === '/admin/invoices' ||
        currentPath === '/admin/verifications'
      ) {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const validTabs = ['overview', 'proposals', 'contracts', 'invoices', 'verifications'];
        let defaultTab = 'overview';
        if (typeof tabParam === 'string' && validTabs.includes(tabParam.toLowerCase())) {
          defaultTab = tabParam.toLowerCase();
        } else if (currentPath.includes('proposals')) {
          defaultTab = 'proposals';
        } else if (currentPath.includes('contracts')) {
          defaultTab = 'contracts';
        } else if (currentPath.includes('invoices')) {
          defaultTab = 'invoices';
        } else if (currentPath.includes('verifications')) {
          defaultTab = 'verifications';
        }

        return (
          <FinanceDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
            initialTab={defaultTab}
          />
        );
      }

      if (currentPath === '/admin/clients' || currentPath.startsWith('/admin/clients')) {
        const urlParams = new URLSearchParams(window.location.search);
        const rawSelectedClient = urlParams.get('selectedClient');
        const selectedClientId = (rawSelectedClient && /^\d+$/.test(rawSelectedClient)) ? rawSelectedClient : null;

        return (
          <ClientDashboard
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
            initialSelectedClientId={selectedClientId}
          />
        );
      }

      if (currentPath === '/admin/crm' || currentPath.startsWith('/admin/crm')) {
        return (
          <CRMView
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToAdmin={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      if (currentPath === '/admin/command-center' || currentPath.startsWith('/admin/command-center')) {
        return (
          <CommandCenterView
            onLogout={() => setIsAdminAuthenticated(false)}
            onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
            onNavigateToInquiries={() => navigateTo('/admin')}
            onNavigateToCRM={handleNavigateToCRM}
            onNavigateToClients={handleNavigateToClients}
            onNavigateToFinance={handleNavigateToFinance}
            onNavigateToProjects={handleNavigateToProjects}
            onBackToSite={() => navigateTo('/')}
          />
        );
      }

      return (
        <AdminDashboard
          onLogout={() => setIsAdminAuthenticated(false)}
          onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
          onNavigateToInquiries={() => navigateTo('/admin')}
          onNavigateToCRM={handleNavigateToCRM}
          onNavigateToClients={handleNavigateToClients}
          onNavigateToFinance={handleNavigateToFinance}
          onNavigateToProjects={handleNavigateToProjects}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Fullscreen Interactive Template Live Demo (/demo/:slug)
    if (currentPath.startsWith('/demo/')) {
      const slug = currentPath.replace('/demo/', '').split('?')[0];
      return (
        <TemplateLiveDemo
          slug={slug}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
        />
      );
    }

    // Route: Individual Template Detail Page (/templates/:slug)
    if (currentPath.startsWith('/templates/') && currentPath !== '/templates') {
      const slug = currentPath.replace('/templates/', '').split('?')[0];
      return (
        <TemplateDetail
          slug={slug}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onNavigateToAdmin={() => navigateTo('/admin')}
        />
      );
    }

    // Route: Website Templates Catalogue Gallery (/templates or /portfolio)
    if (
      currentPath === '/templates' ||
      currentPath.startsWith('/templates') ||
      currentPath === '/portfolio' ||
      currentPath.startsWith('/portfolio')
    ) {
      return (
        <TemplateCatalog
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onNavigateToAdmin={() => navigateTo('/admin')}
        />
      );
    }

    // Route: Website Packages & Pricing Matrix (/pricing)
    if (currentPath === '/pricing' || currentPath.startsWith('/pricing/')) {
      return (
        <PricingPage
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Route: Interactive Client Discovery Questionnaire (/discovery)
    if (currentPath === '/discovery' || currentPath.startsWith('/discovery/')) {
      return (
        <DiscoveryQuestionnaire
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
        />
      );
    }

    // Route: Direct Outreach Landing (/build) & Productized Services Pages (/services, /services/build, ...)
    if (currentPath === '/build' || currentPath.startsWith('/build/') || currentPath === '/services' || currentPath.startsWith('/services/')) {
      const effectivePath = currentPath === '/build' || currentPath.startsWith('/build/') ? '/services/build' : currentPath;
      return (
        <ServicesPages
          currentPath={effectivePath}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    // Default Route: Landing Page
    return (
      <LandingPage
        onOpenInquiry={handleOpenInquiry}
        onNavigate={navigateTo}
        onNavigateToAdmin={() => navigateTo('/admin')}
      />
    );
  };

  const isMobileAdminRoute =
    isMobile &&
    !forceDesktop &&
    (currentPath === '/admin' || currentPath.startsWith('/admin'));

  return (
    <>
      <CustomCursor />
      {isMobileAdminRoute ? (
        renderCurrentView()
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            variants={routeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      )}

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialService={selectedService || 'Website / Build'}
        initialTemplate={selectedTemplate}
      />
    </>
  );
}

// Register PWA Service Worker safely (Never cache admin dynamic API)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(<App />);
