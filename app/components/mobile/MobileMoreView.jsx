import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  DollarSign,
  Layers,
  FileCode2,
  Globe,
  LogOut,
  Shield,
  ExternalLink,
  ChevronRight,
  Database,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { getAdminUsername, clearAdminAuth } from '../../api/client';

export default function MobileMoreView({
  onNavigateToClients,
  onNavigateToFinance,
  onNavigateToTemplates,
  onSwitchToDesktop,
  onBackToSite,
  onLogout
}) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const username = getAdminUsername() || 'Abhiraj';

  const handleLogout = () => {
    clearAdminAuth();
    if (onLogout) onLogout();
  };

  return (
    <div className="mobile-view-container mobile-more-container">
      {/* Profile Card */}
      <div className="mobile-profile-card">
        <div className="mobile-profile-avatar">
          <Shield size={24} />
        </div>
        <div className="mobile-profile-info">
          <h2 className="mobile-profile-name">{username}</h2>
          <div className="mobile-profile-badge">
            <span className="mobile-status-dot" />
            <span>Administrator · Founder Session</span>
          </div>
        </div>
      </div>

      {/* Primary Modules */}
      <div className="mobile-section-header">
        <h3 className="mobile-section-title">ADMIN MODULES</h3>
      </div>

      <div className="mobile-more-list">
        <motion.button
          type="button"
          className="mobile-more-item"
          onClick={onNavigateToClients}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-more-item-icon">
            <Users size={18} />
          </div>
          <div className="mobile-more-item-text">
            <strong>Clients & Onboarding</strong>
            <span>Active client accounts, onboarding tasks & portals</span>
          </div>
          <ChevronRight size={18} className="mobile-more-item-arrow" />
        </motion.button>

        <motion.button
          type="button"
          className="mobile-more-item"
          onClick={onNavigateToFinance}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-more-item-icon">
            <DollarSign size={18} />
          </div>
          <div className="mobile-more-item-text">
            <strong>Finance & Invoices</strong>
            <span>Proposals, signed contracts, payment verifications</span>
          </div>
          <ChevronRight size={18} className="mobile-more-item-arrow" />
        </motion.button>

        <motion.button
          type="button"
          className="mobile-more-item"
          onClick={onNavigateToTemplates}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-more-item-icon">
            <FileCode2 size={18} />
          </div>
          <div className="mobile-more-item-text">
            <strong>Templates & Blueprints</strong>
            <span>Catalog demos and live customer blueprints</span>
          </div>
          <ChevronRight size={18} className="mobile-more-item-arrow" />
        </motion.button>
      </div>

      {/* System & Switching */}
      <div className="mobile-section-header" style={{ marginTop: 24 }}>
        <h3 className="mobile-section-title">SYSTEM & APPLICATION</h3>
      </div>

      <div className="mobile-more-list">
        {onSwitchToDesktop && (
          <motion.button
            type="button"
            className="mobile-more-item"
            onClick={onSwitchToDesktop}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mobile-more-item-icon">
              <Layers size={18} />
            </div>
            <div className="mobile-more-item-text">
              <strong>Desktop Dashboard View</strong>
              <span>Switch to dense multi-column desktop tables</span>
            </div>
            <ChevronRight size={18} className="mobile-more-item-arrow" />
          </motion.button>
        )}

        <motion.button
          type="button"
          className="mobile-more-item"
          onClick={onBackToSite}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-more-item-icon">
            <Globe size={18} />
          </div>
          <div className="mobile-more-item-text">
            <strong>View Public Website</strong>
            <span>The Sorted Club homepage & services</span>
          </div>
          <ExternalLink size={16} className="mobile-more-item-arrow" />
        </motion.button>
      </div>

      {/* App Diagnostics */}
      <div className="mobile-diagnostics-card">
        <div className="mobile-diag-row">
          <div className="mobile-diag-label">
            <Smartphone size={14} /> PWA Mobile Engine
          </div>
          <span className="mobile-diag-val">Standalone Active</span>
        </div>
        <div className="mobile-diag-row">
          <div className="mobile-diag-label">
            <Database size={14} /> Database Provider
          </div>
          <span className="mobile-diag-val">Neon PostgreSQL</span>
        </div>
        <div className="mobile-diag-row">
          <div className="mobile-diag-label">
            <Sparkles size={14} /> Platform Build
          </div>
          <span className="mobile-diag-val">v2.4.0 (Production)</span>
        </div>
      </div>

      {/* Logout Action */}
      <div style={{ marginTop: 28 }}>
        <motion.button
          type="button"
          className="mobile-logout-btn"
          onClick={() => setShowLogoutConfirm(true)}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={16} />
          <span>Log Out of Admin</span>
        </motion.button>
      </div>

      {/* Logout Confirmation Bottom Sheet */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div
            className="mobile-modal-backdrop"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              className="mobile-modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-sheet-pill" />
              <h3 className="mobile-modal-title">Sign Out</h3>
              <p className="mobile-modal-desc">
                Are you sure you want to log out of your admin session on this device?
              </p>
              <div className="mobile-modal-buttons">
                <motion.button
                  type="button"
                  className="mobile-modal-danger-btn"
                  onClick={handleLogout}
                  whileTap={{ scale: 0.96 }}
                >
                  Log Out
                </motion.button>
                <motion.button
                  type="button"
                  className="mobile-modal-cancel-btn"
                  onClick={() => setShowLogoutConfirm(false)}
                  whileTap={{ scale: 0.96 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
