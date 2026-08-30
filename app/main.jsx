import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, Bot, BriefcaseBusiness, Code2, Users, Menu, X, Shield } from 'lucide-react';
import './styles.css';
import InquiryModal from './components/InquiryModal';
import AdminDashboard from './components/AdminDashboard';
import CRMView from './components/CRMView';
import ClientDashboard from './components/ClientDashboard';
import FinanceDashboard from './components/FinanceDashboard';
import PublicProposalView from './components/PublicProposalView';
import PublicContractView from './components/PublicContractView';
import PublicInvoiceView from './components/PublicInvoiceView';
import AdminLogin from './components/AdminLogin';
import { getAdminToken, verifyAdminSession } from './api/client';

const pillars = [
  {
    icon: Code2,
    title: 'Build',
    service: 'Website / Build',
    text: 'Websites, apps and software that make your business work better.'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Grow',
    service: 'Marketing / Growth',
    text: 'Content, marketing and lead systems built around measurable growth.'
  },
  {
    icon: Bot,
    title: 'Automate',
    service: 'AI / Automation',
    text: 'AI, WhatsApp and workflows that take repetitive work off your plate.'
  },
  {
    icon: Users,
    title: 'Hire',
    service: 'Hiring',
    text: 'Smarter sourcing, screening and interviews, powered by HireSense AI.'
  }
];

function LandingPage({ onOpenInquiry, onNavigateToAdmin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main>
      {/* Navigation */}
      <nav>
        <div className="brand" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>Why Sorted</a>
          <button
            className="navcta"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenInquiry();
            }}
          >
            Get Sorted <ArrowRight size={16} />
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
          <button className="primary" onClick={() => onOpenInquiry()}>
            Get Sorted <ArrowRight size={18} />
          </button>
          <a className="secondary" href="#services">
            See what we do <span>↓</span>
          </a>
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
          {pillars.map(({ icon: Icon, title, service, text }) => (
            <article key={title} className="service-card">
              <div className="card-top">
                <Icon size={24} />
                <span>0{pillars.findIndex(p => p.title === title) + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <button
                type="button"
                onClick={() => onOpenInquiry(service)}
                className="card-cta-link"
              >
                Explore <ArrowRight size={15} />
              </button>
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
          <small>Direct access. No sales fluff. Response in &lt; 24 hrs.</small>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="brand">THE SORTED CLUB</div>
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
        <p>Build. Grow. Automate. Hire.</p>
        <p style={{ textAlign: 'right' }}>hello@thesortedclub.com</p>
        <small>© 2026 The Sorted Club. All rights reserved.</small>
      </footer>
    </main>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
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
    if (getAdminToken()) {
      verifyAdminSession()
        .then(() => setIsAdminAuthenticated(true))
        .catch(() => {
          setIsAdminAuthenticated(false);
        });
    }
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenInquiry = (service = '') => {
    setSelectedService(service);
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

  // Route: /admin/crm and /admin
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onBackToSite={() => navigateTo('/')}
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
          onNavigateToInquiries={() => navigateTo('/admin')}
          onNavigateToCRM={() => navigateTo('/admin/crm')}
          onNavigateToClients={handleNavigateToClients}
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
          onNavigateToInquiries={() => navigateTo('/admin')}
          onNavigateToCRM={() => navigateTo('/admin/crm')}
          onNavigateToFinance={handleNavigateToFinance}
          onBackToSite={() => navigateTo('/')}
          initialSelectedClientId={selectedClientId}
        />
      );
    }

    if (currentPath === '/admin/crm' || currentPath.startsWith('/admin/crm')) {
      return (
        <CRMView
          onLogout={() => setIsAdminAuthenticated(false)}
          onNavigateToAdmin={() => navigateTo('/admin')}
          onNavigateToClients={handleNavigateToClients}
          onNavigateToFinance={handleNavigateToFinance}
          onBackToSite={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminDashboard
        onLogout={() => setIsAdminAuthenticated(false)}
        onNavigateToCRM={() => navigateTo('/admin/crm')}
        onNavigateToClients={handleNavigateToClients}
        onNavigateToFinance={handleNavigateToFinance}
        onBackToSite={() => navigateTo('/')}
      />
    );
  }

  // Default Route: Landing Page
  return (
    <>
      <LandingPage
        onOpenInquiry={handleOpenInquiry}
        onNavigateToAdmin={() => navigateTo('/admin')}
      />

      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialService={selectedService}
      />
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
