import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Inbox,
  FolderKanban,
  Grid,
  Plus,
  Shield
} from 'lucide-react';
import MobileAdminHome from './MobileAdminHome';
import MobileLeadsView from './MobileLeadsView';
import MobileProjectsView from './MobileProjectsView';
import MobileMoreView from './MobileMoreView';
import MobileQuickModals from './MobileQuickModals';
import MobileSplashScreen from './MobileSplashScreen';
import NotificationCenter from '../NotificationCenter';
import ClientDashboard from '../ClientDashboard';
import FinanceDashboard from '../FinanceDashboard';
import AdminAccountSettings from '../AdminAccountSettings';
import { getAdminUsername, fetchLeadStats } from '../../api/client';

export default function MobileAdminShell({
  initialTab = 'home',
  initialSelectedLeadId = null,
  initialSelectedProjectId = null,
  initialSelectedClientId = null,
  initialFinanceTab = 'overview',
  onNavigateToCommandCenter,
  onNavigateToCRM,
  onNavigateToProjects,
  onNavigateToFinance,
  onNavigateToClients,
  onNavigateToTemplates,
  onSwitchToDesktop,
  onBackToSite,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'home' | 'leads' | 'projects' | 'more' | 'clients' | 'finance' | 'settings'
  const [selectedLeadId, setSelectedLeadId] = useState(initialSelectedLeadId);
  const [selectedProjectId, setSelectedProjectId] = useState(initialSelectedProjectId);
  const [selectedClientId, setSelectedClientId] = useState(initialSelectedClientId);
  const [financeSubTab, setFinanceSubTab] = useState(initialFinanceTab);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [activeQuickModal, setActiveQuickModal] = useState(null);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  // Splash screen state (shown once per session)
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('tsc_mobile_splash_shown') !== 'true';
    } catch (e) {
      return false;
    }
  });

  const username = getAdminUsername() || 'Founder';

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetchLeadStats()
      .then((data) => {
        if (data?.new) setNewLeadsCount(data.new);
      })
      .catch(() => {});
  }, [activeTab]);

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('tsc_mobile_splash_shown', 'true');
    } catch (e) {}
    setShowSplash(false);
  };

  const handleNotificationNavigate = (url) => {
    if (!url) return;
    if (url.startsWith('/admin/crm')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const leadId = params.get('selectedLead');
      if (leadId) setSelectedLeadId(leadId);
      handleTabChange('leads');
    } else if (url.startsWith('/admin/projects')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const projId = params.get('selectedProject');
      if (projId) setSelectedProjectId(projId);
      handleTabChange('projects');
    } else if (url.startsWith('/admin/finance')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const tab = params.get('tab') || 'overview';
      setFinanceSubTab(tab);
      handleTabChange('finance');
    } else if (url.startsWith('/admin/clients')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const cId = params.get('selectedClient');
      if (cId) setSelectedClientId(cId);
      handleTabChange('clients');
    } else if (url.startsWith('/admin/settings')) {
      handleTabChange('settings');
    } else {
      handleTabChange('home');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Home';
      case 'leads':
        return 'Leads';
      case 'projects':
        return 'Projects';
      case 'clients':
        return 'Clients & Onboarding';
      case 'finance':
        return 'Finance & Invoices';
      case 'settings':
        return 'Account & Settings';
      case 'more':
        return 'More';
      default:
        return 'Admin';
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      if (newTab === 'home') {
        window.history.replaceState({}, '', '/admin');
      } else if (newTab === 'leads') {
        window.history.replaceState({}, '', '/admin/crm');
      } else if (newTab === 'projects') {
        window.history.replaceState({}, '', '/admin/projects');
      } else if (newTab === 'clients') {
        window.history.replaceState({}, '', '/admin/clients');
      } else if (newTab === 'finance') {
        window.history.replaceState({}, '', '/admin/finance');
      } else if (newTab === 'settings') {
        window.history.replaceState({}, '', '/admin/settings');
      } else if (newTab === 'more') {
        window.history.replaceState({}, '', '/admin/more');
      }
    }
  };

  const handleOpenClients = (clientIdOrOpts) => {
    if (typeof clientIdOrOpts === 'string' || typeof clientIdOrOpts === 'number') {
      setSelectedClientId(clientIdOrOpts);
    } else if (clientIdOrOpts && typeof clientIdOrOpts === 'object') {
      setSelectedClientId(clientIdOrOpts.selectedClient || clientIdOrOpts.clientId || null);
    }
    handleTabChange('clients');
  };

  const handleOpenFinance = (tabOrOpts) => {
    if (typeof tabOrOpts === 'string') {
      setFinanceSubTab(tabOrOpts);
    } else if (tabOrOpts && typeof tabOrOpts === 'object') {
      setFinanceSubTab(tabOrOpts.tab || 'overview');
    }
    handleTabChange('finance');
  };

  const isMoreFamilyActive = activeTab === 'more' || activeTab === 'clients' || activeTab === 'finance' || activeTab === 'settings';

  return (
    <div className="mobile-admin-shell-layout">
      {/* Session Splash Screen (First Launch Only) */}
      <AnimatePresence>
        {showSplash && (
          <MobileSplashScreen onComplete={handleSplashComplete} />
        )}
      </AnimatePresence>

      {/* 1. TOP APP HEADER (Fixed / Sticky at Top) */}
      <header className="mobile-top-header">
        {/* Left: Original THE SORTED CLUB brand wordmark */}
        <div
          className="mobile-header-brand"
          onClick={() => handleTabChange('home')}
          role="button"
          tabIndex={0}
          aria-label="Return to Overview"
        >
          <span className="mobile-brand-text">THE SORTED <span>CLUB</span></span>
        </div>

        {/* Center: Current Section / Page Title */}
        <h1 className="mobile-header-title">{getPageTitle()}</h1>

        {/* Right: Notifications & Profile Action */}
        <div className="mobile-header-actions">
          <NotificationCenter onNavigate={handleNotificationNavigate} />
          <div
            className="mobile-avatar-badge"
            onClick={() => handleTabChange('settings')}
            role="button"
            tabIndex={0}
            title={`Logged in as ${username} — Account & Settings`}
            aria-label="Account details and settings"
          >
            <Shield size={14} />
            <span className="mobile-avatar-online-dot" />
          </div>
        </div>
      </header>

      {/* 2. SCROLLABLE MAIN PAGE CONTAINER */}
      <main className="mobile-viewport-content">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <MobileAdminHome
                onNavigateToLeads={() => handleTabChange('leads')}
                onNavigateToProjects={() => handleTabChange('projects')}
                onNavigateToFinance={handleOpenFinance}
                onNavigateToClients={handleOpenClients}
                onOpenLeadDetail={(id) => {
                  setSelectedLeadId(id);
                  handleTabChange('leads');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div
              key="leads"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <MobileLeadsView
                initialSelectedLeadId={selectedLeadId}
                onOpenNewLeadModal={() => {
                  setActiveQuickModal('lead');
                  setQuickMenuOpen(true);
                }}
                onConvertToClient={(client) => {
                  handleOpenClients(client?.id);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <MobileProjectsView
                initialSelectedProjectId={selectedProjectId}
                onOpenNewProjectModal={() => {
                  setActiveQuickModal('project');
                  setQuickMenuOpen(true);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'more' && (
            <motion.div
              key="more"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <MobileMoreView
                onNavigateToClients={handleOpenClients}
                onNavigateToFinance={handleOpenFinance}
                onNavigateToTemplates={onNavigateToTemplates}
                onNavigateToSettings={() => handleTabChange('settings')}
                onSwitchToDesktop={onSwitchToDesktop}
                onBackToSite={onBackToSite}
                onLogout={onLogout}
              />
            </motion.div>
          )}

          {activeTab === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <ClientDashboard
                hideNavbar={true}
                onBack={() => handleTabChange('more')}
                initialSelectedClientId={selectedClientId}
                onLogout={onLogout}
                onNavigateToCommandCenter={onNavigateToCommandCenter}
                onNavigateToInquiries={() => handleTabChange('home')}
                onNavigateToCRM={() => handleTabChange('leads')}
                onNavigateToFinance={handleOpenFinance}
                onNavigateToProjects={() => handleTabChange('projects')}
                onBackToSite={onBackToSite}
              />
            </motion.div>
          )}

          {activeTab === 'finance' && (
            <motion.div
              key="finance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <FinanceDashboard
                hideNavbar={true}
                onBack={() => handleTabChange('more')}
                initialTab={financeSubTab || 'overview'}
                onLogout={onLogout}
                onNavigateToCommandCenter={onNavigateToCommandCenter}
                onNavigateToInquiries={() => handleTabChange('home')}
                onNavigateToCRM={() => handleTabChange('leads')}
                onNavigateToClients={handleOpenClients}
                onNavigateToProjects={() => handleTabChange('projects')}
                onBackToSite={onBackToSite}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminAccountSettings
                isMobile={true}
                onBack={() => handleTabChange('more')}
                onLogout={onLogout}
                onNavigateToCommandCenter={onNavigateToCommandCenter}
                onNavigateToInquiries={() => handleTabChange('home')}
                onNavigateToCRM={() => handleTabChange('leads')}
                onNavigateToClients={handleOpenClients}
                onNavigateToFinance={handleOpenFinance}
                onNavigateToProjects={() => handleTabChange('projects')}
                onBackToSite={onBackToSite}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. FLOATING ACTION BUTTON (+) */}
      <motion.button
        type="button"
        className={`mobile-fab-btn ${quickMenuOpen ? 'open' : ''}`}
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          setActiveQuickModal(null);
          setQuickMenuOpen(!quickMenuOpen);
        }}
        aria-label="Quick Actions Menu"
      >
        <motion.div
          animate={{ rotate: quickMenuOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={24} />
        </motion.div>
      </motion.button>

      {/* 4. PRIMARY FIXED / IN-FLOW BOTTOM NAVIGATION BAR (GRID ROW 3) */}
      <div
        className="mobile-bottom-tabs"
        role="navigation"
        aria-label="Admin sections"
      >
        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => handleTabChange('home')}
          aria-selected={activeTab === 'home'}
          role="tab"
        >
          <div className="mobile-nav-icon-wrap">
            <Home size={20} className="mobile-nav-icon" />
          </div>
          <span className="mobile-nav-label">Home</span>
          {activeTab === 'home' && (
            <motion.span
              layoutId="mobile-nav-indicator"
              className="mobile-nav-indicator"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => handleTabChange('leads')}
          aria-selected={activeTab === 'leads'}
          role="tab"
        >
          <div className="mobile-nav-icon-wrap" style={{ position: 'relative' }}>
            <Inbox size={20} className="mobile-nav-icon" />
            {newLeadsCount > 0 && <span className="mobile-tab-badge">{newLeadsCount}</span>}
          </div>
          <span className="mobile-nav-label">Leads</span>
          {activeTab === 'leads' && (
            <motion.span
              layoutId="mobile-nav-indicator"
              className="mobile-nav-indicator"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => handleTabChange('projects')}
          aria-selected={activeTab === 'projects'}
          role="tab"
        >
          <div className="mobile-nav-icon-wrap">
            <FolderKanban size={20} className="mobile-nav-icon" />
          </div>
          <span className="mobile-nav-label">Projects</span>
          {activeTab === 'projects' && (
            <motion.span
              layoutId="mobile-nav-indicator"
              className="mobile-nav-indicator"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${isMoreFamilyActive ? 'active' : ''}`}
          onClick={() => handleTabChange('more')}
          aria-selected={isMoreFamilyActive}
          role="tab"
        >
          <div className="mobile-nav-icon-wrap">
            <Grid size={20} className="mobile-nav-icon" />
          </div>
          <span className="mobile-nav-label">More</span>
          {isMoreFamilyActive && (
            <motion.span
              layoutId="mobile-nav-indicator"
              className="mobile-nav-indicator"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>
      </div>

      {/* 5. QUICK ACTIONS BOTTOM SHEET MODAL */}
      <MobileQuickModals
        isOpen={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        activeModal={activeQuickModal}
        setActiveModal={setActiveQuickModal}
        onActionComplete={(type) => {
          if (type === 'lead') handleTabChange('leads');
          if (type === 'project' || type === 'task') handleTabChange('projects');
        }}
      />
    </div>
  );
}
