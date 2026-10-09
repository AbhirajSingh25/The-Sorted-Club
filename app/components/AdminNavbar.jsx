import React, { useState, useEffect } from 'react';
import {
  Layers,
  Inbox,
  Kanban,
  Users,
  DollarSign,
  FolderKanban,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Shield,
  ExternalLink
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import { clearAdminAuth, getAdminUsername } from '../api/client';

export default function AdminNavbar({
  activeTab = 'inquiries',
  badge = 'INQUIRIES',
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToFinance,
  onNavigateToProjects,
  onNavigateToSettings,
  onBackToSite,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const adminUser = getAdminUsername() || 'Admin';

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    {
      id: 'command-center',
      label: 'Command Center',
      icon: Layers,
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigateToCommandCenter && onNavigateToCommandCenter();
      }
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: Inbox,
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigateToInquiries && onNavigateToInquiries();
      }
    },
    {
      id: 'crm',
      label: 'Sales Pipeline',
      icon: Kanban,
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigateToCRM && onNavigateToCRM();
      }
    },
    {
      id: 'clients',
      label: 'Clients & Onboarding',
      icon: Users,
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigateToClients && onNavigateToClients();
      }
    },
    {
      id: 'finance',
      label: 'Commercial & Finance',
      icon: DollarSign,
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigateToFinance && onNavigateToFinance('overview');
      }
    },
    {
      id: 'projects',
      label: 'Projects & Delivery',
      icon: FolderKanban,
      onClick: () => {
        setMobileMenuOpen(false);
        onNavigateToProjects && onNavigateToProjects();
      }
    }
  ];

  const handleNotificationNavigate = (url) => {
    setMobileMenuOpen(false);
    if (!url) return;

    if (url.startsWith('/admin/command-center')) {
      onNavigateToCommandCenter && onNavigateToCommandCenter();
    } else if (url.startsWith('/admin/crm')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const stage = params.get('stage');
      const followup = params.get('followup');
      const selectedLead = params.get('selectedLead');
      onNavigateToCRM && onNavigateToCRM({ stage, followup, selectedLead });
    } else if (url.startsWith('/admin/finance')) {
      const tab = new URLSearchParams(url.split('?')[1] || '').get('tab') || 'overview';
      onNavigateToFinance && onNavigateToFinance(tab);
    } else if (url.startsWith('/admin/clients')) {
      const cid = new URLSearchParams(url.split('?')[1] || '').get('selectedClient');
      onNavigateToClients && onNavigateToClients(cid);
    } else if (url.startsWith('/admin/projects')) {
      const pid = new URLSearchParams(url.split('?')[1] || '').get('selectedProject');
      onNavigateToProjects && onNavigateToProjects(pid);
    } else if (url.startsWith('/admin')) {
      onNavigateToInquiries && onNavigateToInquiries();
    }
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    clearAdminAuth();
    if (onLogout) onLogout();
  };

  return (
    <>
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div
            className="brand"
            style={{ cursor: 'pointer' }}
            onClick={() => onNavigateToCommandCenter ? onNavigateToCommandCenter() : (onNavigateToInquiries && onNavigateToInquiries())}
          >
            THE SORTED <span>CLUB</span>
          </div>
          {badge && <span className="admin-badge">{badge}</span>}

          {/* Desktop Navigation Tabs */}
          <div className="admin-nav-tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`admin-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={item.onClick}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-nav-right">
          <NotificationCenter onNavigate={handleNotificationNavigate} />

          <button
            onClick={onBackToSite}
            className="admin-link-btn"
            title="Return to public site"
            type="button"
          >
            <ArrowLeft size={14} />
            <span>View Website</span>
          </button>

          <div
            className="admin-user-info"
            onClick={() => onNavigateToSettings ? onNavigateToSettings() : (window.location.href = '/admin/settings')}
            style={{ cursor: 'pointer' }}
            title="Account & Security Settings"
            role="button"
            tabIndex={0}
          >
            <span className="admin-user-dot" />
            <span>{adminUser}</span>
          </div>

          <button
            onClick={handleLogoutClick}
            className="admin-logout-btn"
            title="Log out of admin session"
            type="button"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>

          {/* Mobile Hamburger Button (visible on <= 1024px) */}
          <button
            type="button"
            className="admin-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close admin navigation' : 'Open admin navigation'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation (visible when opened on <= 1024px) */}
      {mobileMenuOpen && (
        <div
          className="admin-mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            className="admin-mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Admin Navigation Menu"
          >
            <div className="admin-drawer-head">
              <div className="admin-drawer-user">
                <div className="admin-drawer-avatar">
                  <Shield size={18} />
                </div>
                <div>
                  <strong className="admin-drawer-username">{adminUser}</strong>
                  <div className="admin-drawer-status">
                    <span className="admin-user-dot" />
                    <span>Administrator</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="admin-drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-drawer-body">
              <div className="admin-drawer-section-label">NAVIGATION SECTIONS</div>
              <nav className="admin-drawer-nav-list">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`admin-drawer-nav-item ${isActive ? 'active' : ''}`}
                      onClick={item.onClick}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="admin-drawer-nav-icon">
                        <Icon size={18} />
                      </div>
                      <span className="admin-drawer-nav-title">{item.label}</span>
                      {isActive && <span className="admin-drawer-nav-active-dot" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="admin-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBackToSite && onBackToSite();
                }}
                className="admin-drawer-footer-btn"
              >
                <ArrowLeft size={16} />
                <span>Return to Public Website</span>
                <ExternalLink size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />
              </button>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="admin-drawer-logout-btn"
              >
                <LogOut size={16} />
                <span>Log out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
