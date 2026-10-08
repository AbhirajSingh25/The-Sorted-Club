import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Inbox,
  FolderKanban,
  Clock,
  DollarSign,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  fetchCommandCenterMetrics,
  getAdminUsername
} from '../../api/client';
import { formatINR, formatMobileDate } from '../../utils/responsive';

export default function MobileAdminHome({
  onNavigateToLeads,
  onNavigateToProjects,
  onNavigateToFinance,
  onNavigateToClients,
  onOpenLeadDetail
}) {
  const [metrics, setMetrics] = useState({
    new_leads_count: 0,
    followups_due_today_count: 0,
    followups_overdue_count: 0,
    proposals_awaiting_count: 0,
    payments_awaiting_verification_count: 0,
    outstanding_invoice_amount: 0,
    active_projects_count: 0,
    projects_at_risk_count: 0,
    attention_items: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const username = getAdminUsername() || 'Abhiraj';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${username}`;
    if (hour < 17) return `Good afternoon, ${username}`;
    return `Good evening, ${username}`;
  };

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const data = await fetchCommandCenterMetrics();
      if (data) setMetrics(data);
    } catch (err) {
      setError(err.message || 'Unable to load command dashboard.');
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleActionClick = (item) => {
    const url = item.action_url || '';
    if (url.startsWith('/admin/crm')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const leadId = params.get('selectedLead');
      if (leadId && onOpenLeadDetail) {
        onOpenLeadDetail(leadId);
      } else if (onNavigateToLeads) {
        onNavigateToLeads();
      }
    } else if (url.startsWith('/admin/projects')) {
      if (onNavigateToProjects) onNavigateToProjects();
    } else if (url.startsWith('/admin/finance')) {
      if (onNavigateToFinance) onNavigateToFinance();
    } else if (url.startsWith('/admin/clients')) {
      if (onNavigateToClients) onNavigateToClients();
    } else if (onNavigateToLeads) {
      onNavigateToLeads();
    }
  };

  const totalFollowups = (metrics.followups_due_today_count || 0) + (metrics.followups_overdue_count || 0);

  return (
    <div className="mobile-view-container mobile-home-container">
      {/* Top Welcome Header */}
      <div className="mobile-home-greeting-card">
        <div className="mobile-greeting-row">
          <div>
            <h1 className="mobile-greeting-title">{getGreeting()}</h1>
            <p className="mobile-greeting-sub">Here's what needs your attention today.</p>
          </div>
          <motion.button
            type="button"
            className={`mobile-refresh-btn ${refreshing ? 'spinning' : ''}`}
            whileTap={{ scale: 0.94 }}
            onClick={handleRefresh}
            title="Refresh"
            aria-label="Refresh metrics"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>

        {/* 4 Compact Metric Cards (2x2 Grid) */}
        <div className="mobile-metrics-grid">
          {/* Card 1: New Leads */}
          <motion.div
            className="mobile-metric-card"
            onClick={onNavigateToLeads}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
          >
            <div className="mobile-metric-card-head">
              <span className="mobile-metric-card-label">New Leads</span>
              <Inbox size={15} className="mobile-metric-icon" />
            </div>
            {loading ? (
              <div className="mobile-skeleton-metric" />
            ) : (
              <div className="mobile-metric-card-val">
                {metrics.new_leads_count || 0}
              </div>
            )}
            <div className="mobile-metric-card-hint">
              {loading ? (
                <div className="mobile-skeleton-hint" />
              ) : metrics.new_leads_count > 0 ? (
                <span style={{ color: '#15803d', fontWeight: 600 }}>Needs first contact</span>
              ) : (
                'Up to date'
              )}
            </div>
          </motion.div>

          {/* Card 2: Active Projects */}
          <motion.div
            className="mobile-metric-card"
            onClick={onNavigateToProjects}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
          >
            <div className="mobile-metric-card-head">
              <span className="mobile-metric-card-label">Active Projects</span>
              <FolderKanban size={15} className="mobile-metric-icon" />
            </div>
            {loading ? (
              <div className="mobile-skeleton-metric" />
            ) : (
              <div className="mobile-metric-card-val">
                {metrics.active_projects_count || 0}
              </div>
            )}
            <div className="mobile-metric-card-hint">
              {loading ? (
                <div className="mobile-skeleton-hint" />
              ) : metrics.projects_at_risk_count > 0 ? (
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{metrics.projects_at_risk_count} at risk</span>
              ) : (
                'In delivery'
              )}
            </div>
          </motion.div>

          {/* Card 3: Follow-ups */}
          <motion.div
            className="mobile-metric-card"
            onClick={onNavigateToLeads}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
          >
            <div className="mobile-metric-card-head">
              <span className="mobile-metric-card-label">Follow-ups</span>
              <Clock size={15} className="mobile-metric-icon" />
            </div>
            {loading ? (
              <div className="mobile-skeleton-metric" />
            ) : (
              <div className="mobile-metric-card-val">
                {totalFollowups}
              </div>
            )}
            <div className="mobile-metric-card-hint">
              {loading ? (
                <div className="mobile-skeleton-hint" />
              ) : metrics.followups_overdue_count > 0 ? (
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{metrics.followups_overdue_count} overdue</span>
              ) : (
                'Scheduled'
              )}
            </div>
          </motion.div>

          {/* Card 4: Outstanding / Revenue */}
          <motion.div
            className="mobile-metric-card"
            onClick={onNavigateToFinance}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
          >
            <div className="mobile-metric-card-head">
              <span className="mobile-metric-card-label">Outstanding</span>
              <DollarSign size={15} className="mobile-metric-icon" />
            </div>
            {loading ? (
              <div className="mobile-skeleton-metric" />
            ) : (
              <div className="mobile-metric-card-val font-compact">
                {formatINR(metrics.outstanding_invoice_amount || 0)}
              </div>
            )}
            <div className="mobile-metric-card-hint">
              {loading ? (
                <div className="mobile-skeleton-hint" />
              ) : metrics.payments_awaiting_verification_count > 0 ? (
                <span style={{ color: '#15803d', fontWeight: 600 }}>{metrics.payments_awaiting_verification_count} claim to verify</span>
              ) : (
                'Pending invoices'
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* "NEEDS ATTENTION" CURATED SECTION */}
      <div className="mobile-section-header">
        <h2 className="mobile-section-title">Needs Attention</h2>
        <span className="mobile-section-badge">
          {metrics.attention_items ? metrics.attention_items.length : 0} items
        </span>
      </div>

      <div className="mobile-attention-list">
        {loading ? (
          <div className="mobile-skeleton-list">
            <div className="mobile-skeleton-card" />
            <div className="mobile-skeleton-card" />
          </div>
        ) : error ? (
          <div className="mobile-error-box">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : !metrics.attention_items || metrics.attention_items.length === 0 ? (
          <motion.div
            className="mobile-attention-clear-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-clear-icon">
              <CheckCircle2 size={28} color="#15803d" />
            </div>
            <div className="mobile-clear-title">All caught up!</div>
            <p className="mobile-clear-desc">
              No overdue follow-ups, pending payment verifications, or blocked projects right now.
            </p>
          </motion.div>
        ) : (
          metrics.attention_items.map((item, idx) => {
            const isUrgent = item.priority === 'URGENT' || item.type === 'PENDING_PAYMENT';
            return (
              <motion.div
                key={item.id || idx}
                className={`mobile-attention-card ${isUrgent ? 'urgent' : ''}`}
                onClick={() => handleActionClick(item)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                role="button"
                tabIndex={0}
              >
                <div className="mobile-attention-head">
                  <span className="mobile-attention-type">
                    {item.type ? item.type.replace('_', ' ') : 'ACTION REQUIRED'}
                  </span>
                  {item.timestamp && (
                    <span className="mobile-attention-time">{formatMobileDate(item.timestamp)}</span>
                  )}
                </div>

                <h3 className="mobile-attention-title">{item.title}</h3>
                <p className="mobile-attention-sub">{item.subtitle}</p>

                <div className="mobile-attention-action-row">
                  <span className="mobile-attention-btn-text">
                    {item.action_label || 'View Details'}
                  </span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* QUICK OPERATIONAL SHORTCUTS */}
      <div className="mobile-section-header" style={{ marginTop: 24 }}>
        <h2 className="mobile-section-title">Operations</h2>
      </div>

      <div className="mobile-ops-shortcuts-list">
        <motion.button
          type="button"
          className="mobile-ops-row"
          onClick={onNavigateToLeads}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-ops-icon">
            <Inbox size={18} />
          </div>
          <div className="mobile-ops-text">
            <strong>Sales Pipeline & CRM</strong>
            <span>Review inquiries, status stages and follow-up reminders</span>
          </div>
          <ChevronRight size={18} className="mobile-ops-arrow" />
        </motion.button>

        <motion.button
          type="button"
          className="mobile-ops-row"
          onClick={onNavigateToProjects}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-ops-icon">
            <FolderKanban size={18} />
          </div>
          <div className="mobile-ops-text">
            <strong>Project Deliverables</strong>
            <span>Active client builds, tasks, milestones & deadlines</span>
          </div>
          <ChevronRight size={18} className="mobile-ops-arrow" />
        </motion.button>

        <motion.button
          type="button"
          className="mobile-ops-row"
          onClick={onNavigateToFinance}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mobile-ops-icon">
            <DollarSign size={18} />
          </div>
          <div className="mobile-ops-text">
            <strong>Invoices & Commercials</strong>
            <span>Pending proposals, client contracts & payment verifications</span>
          </div>
          <ChevronRight size={18} className="mobile-ops-arrow" />
        </motion.button>
      </div>
    </div>
  );
}
