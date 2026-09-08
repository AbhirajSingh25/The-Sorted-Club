import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Bot, BriefcaseBusiness, Code2, Users, Menu, X, Shield, Sparkles } from 'lucide-react';
import './styles.css';
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
      <nav>
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
          <button
            className="navcta"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquiry({ service: 'Website / Build' });
            }}
          >
            Free Consultation <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />

        <div className="eyebrow">
          THE BUSINESS CLUB FOR WHAT'S NEXT
          <span className="live-dot" />
        </div>

        <h1>
          Your business.<br />
          <em>Sorted.</em>
        </h1>

        <p className="hero-copy">
          We build, grow, automate and hire for ambitious businesses. One team. One place. Fewer things left unsorted.
        </p>

        <div className="actions">
          <button className="primary" onClick={() => onOpenInquiry({ service: 'Website / Build' })}>
            Free Website Consultation <ArrowRight size={18} />
          </button>
          <button className="secondary" onClick={() => onNavigate('/pricing')}>
            View Website Pricing (From ₹14,999) <ArrowRight size={14} />
          </button>
          <button
            className="secondary"
            style={{ background: 'transparent', borderColor: 'var(--line)' }}
            onClick={() => onNavigate('/templates')}
          >
            Browse Blueprints →
          </button>
        </div>

        <div className="hero-bottom">
          <div className="hero-note">Welcome to the club.</div>
          <div style={{ color: 'var(--muted)' }}>EST. 2026 — GLOBAL OPERATING COLLECTIVE</div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="ticker">
        <div>
          <span>BUILD</span> • <span>GROW</span> • <span>AUTOMATE</span> • <span>HIRE</span> • <span>CUSTOM SOFTWARE</span> • <span>REVENUE SYSTEMS</span> • <span>AI WORKFLOWS</span> • <span>HIRESENSE</span> • <span>BUILD</span> • <span>GROW</span> • <span>AUTOMATE</span> • <span>HIRE</span>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="section-head">
          <span>01</span>
          <div>
            <p className="eyebrow">WHAT WE SORT</p>
            <h2>
              Whatever your business needs,<br />
              <i>we'll get it sorted.</i>
            </h2>
          </div>
        </div>

        <div className="grid">
          {pillars.map(({ icon: Icon, title, service, text, slug }) => (
            <article key={title} className="service-card">
              <div className="card-top">
                <Icon size={24} />
                <span>0{pillars.findIndex((p) => p.title === title) + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate(`/services/${slug}`)}
                  className="card-cta-link"
                >
                  Explore {title} <ArrowRight size={15} />
                </button>
                {slug === 'build' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/templates')}
                    className="card-cta-link"
                    style={{ color: 'var(--muted)', fontSize: '13px' }}
                  >
                    View Blueprints →
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About / Manifesto Section */}
      <section id="about" className="manifesto">
        <div className="manifesto-label">
          <p className="eyebrow">02 / THE IDEA</p>
        </div>
        <div>
          <h2>
            You bring the problem.<br />
            <span>We get it sorted.</span>
          </h2>
          <p className="manifesto-copy">
            Businesses shouldn't need five agencies, ten tools and a small miracle to get things done. The Sorted Club brings technology, growth and people together under one roof.
          </p>
          <div className="manifesto-points">
            <div>✓ Single Point of Accountability</div>
            <div>✓ Battle-tested Engineering</div>
            <div>✓ Rapid Turnaround</div>
            <div>✓ Transparent Pricing</div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="club">
        <div className="club-copy">
          <p className="eyebrow">03 / MEMBERSHIP</p>
          <h2>Join the club.</h2>
          <p>Start with one problem. Stay for everything else we can sort.</p>
          <div style={{ marginTop: '24px' }}>
            <button className="primary" onClick={() => onOpenInquiry()}>
              Become a member <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="club-card">
          <div>
            <div className="club-mark">SORTED<span>*</span></div>
            <div className="club-card-title">MEMBER PASS</div>
          </div>
          <div className="club-card-line" />
          <p>ONE DIRECT BRIEF LINE • DEDICATED SQUAD • UNLIMITED SCALE</p>
          <strong>THE SORTED CLUB 2026</strong>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div>
          <p className="eyebrow">04 / GET STARTED</p>
          <h2>What's not sorted yet?</h2>
          <p>Tell us what you're trying to fix, build or grow. We'll figure out the next move.</p>
        </div>

        <div className="contact-actions">
          <button
            className="primary dark"
            onClick={() => onOpenInquiry()}
            style={{ fontSize: '15px' }}
          >
            Tell us what needs sorting <ArrowRight size={18} />
          </button>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px' }}>
            <a
              href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20your%20BUILD%20services."
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, textDecoration: 'none' }}
            >
              WhatsApp: +91 9643820888 →
            </a>
            <a
              href="mailto:thesortedclub@gmail.com"
              style={{ fontSize: '13px', color: 'var(--ink)', textDecoration: 'none' }}
            >
              thesortedclub@gmail.com
            </a>
          </div>
          <small>Direct access. No sales fluff. Response in &lt; 24 hrs.</small>
        </div>
      </section>

      {/* Footer */}
      <footer>
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
      </footer>
    </main>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(Boolean(getAdminToken()));

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

  const handleNavigateToCRM = (filters) => {
    const params = new URLSearchParams();
    if (filters) {
      if (typeof filters === 'string') {
        params.append('stage', filters);
      } else if (typeof filters === 'object') {
        if (filters.stage) params.append('stage', filters.stage);
        if (filters.followup) params.append('followup', filters.followup);
        if (filters.selectedLead) params.append('selectedLead', String(filters.selectedLead));
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    navigateTo(`/admin/crm${query}`);
  };

  const handleNavigateToFinance = (tabParam) => {
    const validTabs = ['overview', 'proposals', 'contracts', 'invoices', 'verifications'];
    let cleanTab = '';
    if (typeof tabParam === 'string' && validTabs.includes(tabParam.trim().toLowerCase())) {
      cleanTab = tabParam.trim().toLowerCase();
    }
    const targetUrl = cleanTab && cleanTab !== 'overview' ? `/admin/finance?tab=${cleanTab}` : '/admin/finance';
    navigateTo(targetUrl);
  };

  const handleNavigateToClients = (clientOrId) => {
    let clientId = null;
    if (typeof clientOrId === 'number') {
      clientId = String(clientOrId);
    } else if (typeof clientOrId === 'string' && /^\d+$/.test(clientOrId.trim())) {
      clientId = clientOrId.trim();
    } else if (clientOrId && typeof clientOrId === 'object' && clientOrId.id !== undefined && clientOrId.id !== null) {
      clientId = String(clientOrId.id);
    }
    const targetUrl = clientId ? `/admin/clients?selectedClient=${clientId}` : '/admin/clients';
    navigateTo(targetUrl);
  };

  const handleNavigateToProjects = (clientIdOrObj, projectId) => {
    const params = new URLSearchParams();
    if (typeof clientIdOrObj === 'object' && clientIdOrObj !== null && !Array.isArray(clientIdOrObj)) {
      if (clientIdOrObj.health) params.append('health', clientIdOrObj.health);
      if (clientIdOrObj.status) params.append('status', clientIdOrObj.status);
      if (clientIdOrObj.selectedProject) params.append('selectedProject', String(clientIdOrObj.selectedProject));
      if (clientIdOrObj.client) params.append('client', String(clientIdOrObj.client));
    } else {
      if (projectId) {
        params.append('selectedProject', String(projectId));
      }
      if (clientIdOrObj) {
        const cId = typeof clientIdOrObj === 'object' ? clientIdOrObj.id : clientIdOrObj;
        if (cId) params.append('client', String(cId));
      }
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    navigateTo(`/admin/projects${query}`);
  };

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

    if (currentPath === '/admin/projects' || currentPath.startsWith('/admin/projects')) {
      const urlParams = new URLSearchParams(window.location.search);
      const rawSelectedProject = urlParams.get('selectedProject');
      const selectedProjId = (rawSelectedProject && /^\d+$/.test(rawSelectedProject)) ? rawSelectedProject : null;

      return (
        <ProjectDashboard
          onLogout={() => setIsAdminAuthenticated(false)}
          onNavigateToCommandCenter={() => navigateTo('/admin/command-center')}
          onNavigateToInquiries={() => navigateTo('/admin')}
          onNavigateToCRM={() => navigateTo('/admin/crm')}
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
          onNavigateToCRM={() => navigateTo('/admin/crm')}
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
          onNavigateToCRM={() => navigateTo('/admin/crm')}
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
      <>
        <TemplateLiveDemo
          slug={slug}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
        />
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          initialService="Website / Build"
          initialTemplate={selectedTemplate}
        />
      </>
    );
  }

  // Route: Individual Template Detail Page (/templates/:slug)
  if (currentPath.startsWith('/templates/') && currentPath !== '/templates') {
    const slug = currentPath.replace('/templates/', '').split('?')[0];
    return (
      <>
        <TemplateDetail
          slug={slug}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onNavigateToAdmin={() => navigateTo('/admin')}
        />
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          initialService="Website / Build"
          initialTemplate={selectedTemplate}
        />
      </>
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
      <>
        <TemplateCatalog
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onNavigateToAdmin={() => navigateTo('/admin')}
        />
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          initialService="Website / Build"
          initialTemplate={selectedTemplate}
        />
      </>
    );
  }

  // Route: Website Packages & Pricing Matrix (/pricing)
  if (currentPath === '/pricing' || currentPath.startsWith('/pricing/')) {
    return (
      <>
        <PricingPage
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onBackToSite={() => navigateTo('/')}
        />
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          initialService={selectedService || 'Website / Build'}
          initialTemplate={selectedTemplate}
        />
      </>
    );
  }

  // Route: Interactive Client Discovery Questionnaire (/discovery)
  if (currentPath === '/discovery' || currentPath.startsWith('/discovery/')) {
    return (
      <>
        <DiscoveryQuestionnaire
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
        />
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          initialService={selectedService || 'Website / Build'}
          initialTemplate={selectedTemplate}
        />
      </>
    );
  }

  // Route: Direct Outreach Landing (/build) & Productized Services Pages (/services, /services/build, ...)
  if (currentPath === '/build' || currentPath.startsWith('/build/') || currentPath === '/services' || currentPath.startsWith('/services/')) {
    const effectivePath = currentPath === '/build' || currentPath.startsWith('/build/') ? '/services/build' : currentPath;
    return (
      <>
        <ServicesPages
          currentPath={effectivePath}
          onNavigate={navigateTo}
          onOpenInquiry={handleOpenInquiry}
          onBackToSite={() => navigateTo('/')}
        />
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          initialService={selectedService || 'Website / Build'}
          initialTemplate={selectedTemplate}
        />
      </>
    );
  }

  // Default Route: Landing Page
  return (
    <>
      <LandingPage
        onOpenInquiry={handleOpenInquiry}
        onNavigate={navigateTo}
        onNavigateToAdmin={() => navigateTo('/admin')}
      />

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialService={selectedService}
        initialTemplate={selectedTemplate}
      />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
