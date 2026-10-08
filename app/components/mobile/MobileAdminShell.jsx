import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Inbox,
  FolderKanban,
  Grid,
  Plus,
  Shield,
  Layers,
  Sparkles,
  DollarSign,
  Users
} from 'lucide-react';
import MobileAdminHome from './MobileAdminHome';
import MobileLeadsView from './MobileLeadsView';
import MobileProjectsView from './MobileProjectsView';
import MobileMoreView from './MobileMoreView';
import MobileQuickModals from './MobileQuickModals';
import NotificationCenter from '../NotificationCenter';
import { getAdminUsername, fetchLeadStats } from '../../api/client';

export default function MobileAdminShell({
  initialTab = 'home',
  initialSelectedLeadId = null,
  initialSelectedProjectId = null,
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
  const [activeTab, setActiveTab] = useState(initialTab); // 'home' | 'leads' | 'projects' | 'more'
  const [selectedLeadId, setSelectedLeadId] = useState(initialSelectedLeadId);
  const [selectedProjectId, setSelectedProjectId] = useState(initialSelectedProjectId);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [activeQuickModal, setActiveQuickModal] = useState(null);
  const [newLeadsCount, setNewLeadsCount] = useState(0);

  const username = getAdminUsername() || 'Abhiraj';

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

  const handleNotificationNavigate = (url) => {
    if (!url) return;
    if (url.startsWith('/admin/crm')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const leadId = params.get('selectedLead');
      if (leadId) setSelectedLeadId(leadId);
      setActiveTab('leads');
    } else if (url.startsWith('/admin/projects')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const projId = params.get('selectedProject');
      if (projId) setSelectedProjectId(projId);
      setActiveTab('projects');
    } else if (url.startsWith('/admin/finance')) {
      if (onNavigateToFinance) onNavigateToFinance();
    } else if (url.startsWith('/admin/clients')) {
      if (onNavigateToClients) onNavigateToClients();
    } else {
      setActiveTab('home');
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Overview';
      case 'leads':
        return 'Leads Pipeline';
      case 'projects':
        return 'Active Projects';
      case 'more':
        return 'More & Settings';
      default:
        return 'Admin';
    }
  };

  return (
    <div className="mobile-admin-shell-layout">
      {/* 1. COMPACT TOP HEADER */}
      <header className="mobile-top-header">
        {/* Left: Brand / SC Logo */}
        <div
          className="mobile-header-brand"
          onClick={() => setActiveTab('home')}
          role="button"
          tabIndex={0}
        >
          <div className="mobile-brand-icon">
            <span>SC</span>
            <span className="mobile-brand-dot" />
          </div>
          <span className="mobile-brand-text">SORTED <strong>CLUB</strong></span>
        </div>

        {/* Center: Page Title */}
        <div className="mobile-header-title">{getPageTitle()}</div>

        {/* Right: Notifications & Profile Avatar */}
        <div className="mobile-header-actions">
          <NotificationCenter onNavigate={handleNotificationNavigate} />
          <div
            className="mobile-avatar-badge"
            onClick={() => setActiveTab('more')}
            role="button"
            tabIndex={0}
            title={`Logged in as ${username}`}
          >
            <Shield size={14} />
            <span className="mobile-avatar-online-dot" />
          </div>
        </div>
      </header>

      {/* 2. SCROLLABLE MAIN VIEWPORT */}
      <main className="mobile-viewport-content">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MobileAdminHome
                onNavigateToLeads={() => setActiveTab('leads')}
                onNavigateToProjects={() => setActiveTab('projects')}
                onNavigateToFinance={onNavigateToFinance}
                onNavigateToClients={onNavigateToClients}
                onOpenLeadDetail={(id) => {
                  setSelectedLeadId(id);
                  setActiveTab('leads');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'leads' && (
            <motion.div
              key="leads"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MobileLeadsView
                initialSelectedLeadId={selectedLeadId}
                onOpenNewLeadModal={() => {
                  setActiveQuickModal('lead');
                  setQuickMenuOpen(true);
                }}
                onConvertToClient={(client) => {
                  if (onNavigateToClients) onNavigateToClients(client?.id);
                }}
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MobileMoreView
                onNavigateToClients={onNavigateToClients}
                onNavigateToFinance={onNavigateToFinance}
                onNavigateToTemplates={onNavigateToTemplates}
                onSwitchToDesktop={onSwitchToDesktop}
                onBackToSite={onBackToSite}
                onLogout={onLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. FLOATING ACTION BUTTON (+) */}
      <motion.button
        type="button"
        className="mobile-fab-btn"
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveQuickModal(null);
          setQuickMenuOpen(true);
        }}
        aria-label="Quick Action Menu"
      >
        <Plus size={24} />
      </motion.button>

      {/* 4. FIXED BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={20} className="mobile-nav-icon" />
          <span className="mobile-nav-label">Home</span>
          {activeTab === 'home' && <span className="mobile-nav-indicator" />}
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <div style={{ position: 'relative' }}>
            <Inbox size={20} className="mobile-nav-icon" />
            {newLeadsCount > 0 && <span className="mobile-tab-badge">{newLeadsCount}</span>}
          </div>
          <span className="mobile-nav-label">Leads</span>
          {activeTab === 'leads' && <span className="mobile-nav-indicator" />}
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <FolderKanban size={20} className="mobile-nav-icon" />
          <span className="mobile-nav-label">Projects</span>
          {activeTab === 'projects' && <span className="mobile-nav-indicator" />}
        </button>

        <button
          type="button"
          className={`mobile-nav-tab ${activeTab === 'more' ? 'active' : ''}`}
          onClick={() => setActiveTab('more')}
        >
          <Grid size={20} className="mobile-nav-icon" />
          <span className="mobile-nav-label">More</span>
          {activeTab === 'more' && <span className="mobile-nav-indicator" />}
        </button>
      </nav>

      {/* 5. QUICK ACTIONS MODAL DIALOGS */}
      <MobileQuickModals
        isOpen={quickMenuOpen}
        onClose={() => setQuickMenuOpen(false)}
        activeModal={activeQuickModal}
        setActiveModal={setActiveQuickModal}
        onActionComplete={(type) => {
          if (type === 'lead') setActiveTab('leads');
          if (type === 'project' || type === 'task') setActiveTab('projects');
        }}
      />
    </div>
  );
}
