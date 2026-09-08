import React, { useState, useEffect } from 'react';
import {
  Layers,
  Inbox,
  Kanban,
  Users,
  DollarSign,
  FolderKanban,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Clock,
  Zap,
  AlertOctagon,
  AlertTriangle,
  CheckSquare,
  Activity,
  ArrowUpRight,
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';
import {
  fetchLeadStats,
  fetchCommandCenterMetrics,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import NotificationCenter from './NotificationCenter';

export default function CommandCenterView({
  onLogout,
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToFinance,
  onNavigateToProjects,
  onBackToSite
}) {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    won: 0,
    lost: 0
  });

  const [commandCenter, setCommandCenter] = useState({
    new_leads_count: 0,
    followups_due_today_count: 0,
    followups_overdue_count: 0,
    proposals_awaiting_count: 0,
    payments_awaiting_verification_count: 0,
    outstanding_invoice_amount: 0,
    active_projects_count: 0,
    projects_at_risk_count: 0,
    client_approvals_waiting_count: 0,
    unread_notifications_count: 0,
    attention_items: [],
    recent_activities: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminUser = getAdminUsername() || 'Admin';

  const loadData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const [statsData, ccData] = await Promise.all([
        fetchLeadStats().catch(() => ({ total: 0 })),
        fetchCommandCenterMetrics().catch(() => null)
      ]);
      if (statsData) setStats(statsData);
      if (ccData) setCommandCenter(ccData);
    } catch (err) {
      if (err.status === 401) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(err.message || 'Failed to fetch command center metrics.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleAttentionAction = (item) => {
    const url = item.action_url;
    if (!url) return;

    if (url.startsWith('/admin/crm')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const stage = params.get('stage');
      const followup = params.get('followup');
      const selectedLead = params.get('selectedLead');
      onNavigateToCRM && onNavigateToCRM({ stage, followup, selectedLead });
    } else if (url.startsWith('/admin/finance')) {
      const tab = new URLSearchParams(url.split('?')[1] || '').get('tab') || 'overview';
      onNavigateToFinance && onNavigateToFinance(tab);
    } else if (url.startsWith('/admin/projects')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const selectedProject = params.get('selectedProject');
      const health = params.get('health');
      onNavigateToProjects && onNavigateToProjects({ selectedProject, health });
    } else if (url.startsWith('/admin/clients')) {
      const cid = new URLSearchParams(url.split('?')[1] || '').get('selectedClient');
      onNavigateToClients && onNavigateToClients(cid);
    } else if (url.startsWith('/admin')) {
      onNavigateToInquiries && onNavigateToInquiries();
    }
  };

  return (
    <div className="admin-app-root">
      {/* Top Admin Navbar with 6 Tabs */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="brand">THE SORTED <span>CLUB</span></div>
          <span className="admin-badge">COMMAND CENTER</span>

          <div className="admin-nav-tabs">
            {/* 1. Command Center */}
            <button
              type="button"
              className="admin-tab-btn active"
            >
              <Layers size={14} />
              <span>Command Center</span>
            </button>

            {/* 2. Inquiries */}
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToInquiries && onNavigateToInquiries()}
            >
              <Inbox size={14} />
              <span>Inquiries</span>
            </button>

            {/* 3. Sales Pipeline */}
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToCRM && onNavigateToCRM()}
            >
              <Kanban size={14} />
              <span>Sales Pipeline</span>
            </button>

            {/* 4. Clients & Onboarding */}
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToClients && onNavigateToClients()}
            >
              <Users size={14} />
              <span>Clients & Onboarding</span>
            </button>

            {/* 5. Commercial & Finance */}
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToFinance && onNavigateToFinance('overview')}
            >
              <DollarSign size={14} />
              <span>Commercial & Finance</span>
            </button>

            {/* 6. Projects & Delivery */}
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToProjects && onNavigateToProjects()}
            >
              <FolderKanban size={14} />
              <span>Projects & Delivery</span>
            </button>
          </div>
        </div>

        <div className="admin-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NotificationCenter
            onNavigate={(url) => {
              if (url.startsWith('/admin/command-center')) {
                onNavigateToCommandCenter && onNavigateToCommandCenter();
              } else if (url.startsWith('/admin/crm')) {
                onNavigateToCRM && onNavigateToCRM();
              } else if (url.startsWith('/admin/finance')) {
                const tab = new URLSearchParams(url.split('?')[1] || '').get('tab');
                onNavigateToFinance && onNavigateToFinance(tab || 'overview');
              } else if (url.startsWith('/admin/clients')) {
                const cid = new URLSearchParams(url.split('?')[1] || '').get('selectedClient');
                onNavigateToClients && onNavigateToClients(cid);
              } else if (url.startsWith('/admin/projects')) {
                const pid = new URLSearchParams(url.split('?')[1] || '').get('selectedProject');
                onNavigateToProjects && onNavigateToProjects(pid);
              } else if (url.startsWith('/admin')) {
                onNavigateToInquiries && onNavigateToInquiries();
              }
            }}
          />
          <button
            onClick={onBackToSite}
            className="admin-link-btn"
            title="Return to public site"
            type="button"
          >
            <ArrowLeft size={16} /> View Website
          </button>
          <div className="admin-user-info">
            <span className="admin-user-dot" />
            <span>{adminUser}</span>
          </div>
          <button
            onClick={() => {
              clearAdminAuth();
              onLogout();
            }}
            className="admin-logout-btn"
            title="Log out of admin session"
            type="button"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content: Dedicated Operational Cockpit */}
      <main className="admin-main-content">
        {/* Header Section */}
        <div className="admin-page-head" style={{ marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <p className="eyebrow" style={{ color: 'var(--muted)', margin: 0 }}>BUSINESS OPERATING SYSTEM</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#dcfce7', color: '#15803d', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} /> LIVE ENGINE
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Operational Cockpit
            </h1>
          </div>
          <div className="admin-head-actions" style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="admin-link-btn"
              style={{ background: '#0f172a', color: '#ffffff', border: '1px solid #0f172a', padding: '8px 16px', fontWeight: 600 }}
              onClick={() => onNavigateToInquiries && onNavigateToInquiries()}
            >
              <Inbox size={15} />
              <span>Open Inquiry Dashboard</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => loadData(true)}
              className="admin-refresh-btn"
              disabled={loading}
              title="Refresh Operating Metrics"
              type="button"
            >
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* 10 Operational Cockpit Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {/* 1. New Inquiries */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToInquiries && onNavigateToInquiries()}
            style={{ cursor: 'pointer', borderLeft: '4px solid #0284c7' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', letterSpacing: '0.5px' }}>NEW INQUIRIES</span>
              <ArrowUpRight size={14} color="#0369a1" />
            </div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{commandCenter.new_leads_count}</div>
            <div className="stat-sub">Needs initial qualification</div>
          </div>

          {/* 2. Follow-ups Due Today */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToCRM && onNavigateToCRM({ followup: 'TODAY' })}
            style={{ cursor: 'pointer', borderLeft: '4px solid #b45309' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', letterSpacing: '0.5px' }}>FOLLOW-UPS TODAY</span>
              <Clock size={14} color="#b45309" />
            </div>
            <div className="stat-value" style={{ color: '#b45309' }}>{commandCenter.followups_due_today_count}</div>
            <div className="stat-sub">Scheduled for founder action</div>
          </div>

          {/* 3. Overdue Follow-ups */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToCRM && onNavigateToCRM({ followup: 'OVERDUE' })}
            style={{ cursor: 'pointer', borderLeft: '4px solid #dc2626', background: commandCenter.followups_overdue_count > 0 ? '#fef2f2' : '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', letterSpacing: '0.5px' }}>OVERDUE FOLLOW-UPS</span>
              <AlertOctagon size={14} color="#dc2626" />
            </div>
            <div className="stat-value" style={{ color: '#dc2626' }}>{commandCenter.followups_overdue_count}</div>
            <div className="stat-sub">Requires urgent outreach</div>
          </div>

          {/* 4. Proposals Awaiting Action */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToFinance && onNavigateToFinance('proposals')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #7c3aed' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.5px' }}>PROPOSALS ACTIVE</span>
              <FileText size={14} color="#7c3aed" />
            </div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{commandCenter.proposals_awaiting_count}</div>
            <div className="stat-sub">Draft & Sent proposals</div>
          </div>

          {/* 5. Payments Awaiting Verification */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToFinance && onNavigateToFinance('verifications')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #ea580c', background: commandCenter.payments_awaiting_verification_count > 0 ? '#fff7ed' : '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', letterSpacing: '0.5px' }}>VERIFY CLAIMS</span>
              <ShieldAlert size={14} color="#ea580c" />
            </div>
            <div className="stat-value" style={{ color: '#ea580c' }}>{commandCenter.payments_awaiting_verification_count}</div>
            <div className="stat-sub">Payment verification queue</div>
          </div>

          {/* 6. Outstanding Invoices Amount */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToFinance && onNavigateToFinance('invoices')}
            style={{ cursor: 'pointer', borderLeft: '4px solid #16a34a' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', letterSpacing: '0.5px' }}>UNCOLLECTED DUE</span>
              <DollarSign size={14} color="#16a34a" />
            </div>
            <div className="stat-value" style={{ color: '#16a34a', fontSize: '24px' }}>
              ${(commandCenter.outstanding_invoice_amount || 0).toLocaleString()}
            </div>
            <div className="stat-sub">Pending client settlement</div>
          </div>

          {/* 7. Active Client Projects */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToProjects && onNavigateToProjects()}
            style={{ cursor: 'pointer', borderLeft: '4px solid #2563eb' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', letterSpacing: '0.5px' }}>ACTIVE PROJECTS</span>
              <FolderKanban size={14} color="#2563eb" />
            </div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{commandCenter.active_projects_count}</div>
            <div className="stat-sub">Live delivery engagements</div>
          </div>

          {/* 8. Projects At Risk */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToProjects && onNavigateToProjects({ health: 'AT_RISK' })}
            style={{ cursor: 'pointer', borderLeft: '4px solid #e11d48', background: commandCenter.projects_at_risk_count > 0 ? '#fff1f2' : '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48', letterSpacing: '0.5px' }}>AT RISK / BLOCKED</span>
              <AlertTriangle size={14} color="#e11d48" />
            </div>
            <div className="stat-value" style={{ color: '#e11d48' }}>{commandCenter.projects_at_risk_count}</div>
            <div className="stat-sub">Builds needing intervention</div>
          </div>

          {/* 9. Client Approvals Waiting */}
          <div
            className="stat-card stat-card-clickable"
            onClick={() => onNavigateToProjects && onNavigateToProjects()}
            style={{ cursor: 'pointer', borderLeft: '4px solid #0891b2' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0891b2', letterSpacing: '0.5px' }}>CLIENT APPROVALS</span>
              <CheckSquare size={14} color="#0891b2" />
            </div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{commandCenter.client_approvals_waiting_count}</div>
            <div className="stat-sub">Milestone reviews pending</div>
          </div>

          {/* 10. Unread System Alerts */}
          <div
            className="stat-card"
            style={{ borderLeft: '4px solid #64748b' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>SYSTEM ALERTS</span>
              <Activity size={14} color="#64748b" />
            </div>
            <div className="stat-value" style={{ color: '#0f172a' }}>{commandCenter.unread_notifications_count}</div>
            <div className="stat-sub">Unread event alerts</div>
          </div>
        </div>

        {/* Priority Attention Queue */}
        {commandCenter.attention_items && commandCenter.attention_items.length > 0 && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '28px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#eab308" />
                  What Needs Attention Today
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  High-priority actionable items requiring immediate founder decision or customer outreach.
                </p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px' }}>
                {commandCenter.attention_items.length} Action Items
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              {commandCenter.attention_items.map((item) => {
                const isUrgent = item.priority === 'URGENT';
                const isHigh = item.priority === 'HIGH';
                const badgeBg = isUrgent ? '#fee2e2' : isHigh ? '#fef3c7' : '#f1f5f9';
                const badgeColor = isUrgent ? '#dc2626' : isHigh ? '#b45309' : '#475569';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: '#f8fafc',
                      border: `1px solid ${isUrgent ? '#fca5a5' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: badgeBg, color: badgeColor }}>
                          {item.priority}
                        </span>
                        {item.timestamp && (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {formatDate(item.timestamp)}
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                        {item.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAttentionAction(item)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>{item.action_label}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Operations Modules Grid */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0', color: '#0f172a' }}>
            Core Operations Modules
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {/* Module 1: Inquiries Intake */}
            <div
              onClick={() => onNavigateToInquiries && onNavigateToInquiries()}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
              className="stat-card-clickable"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Inbox size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Inquiry Dashboard</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{stats.total} total leads</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Review incoming client leads, qualification notes & direct outreach shortcuts.
              </p>
            </div>

            {/* Module 2: Sales CRM */}
            <div
              onClick={() => onNavigateToCRM && onNavigateToCRM()}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
              className="stat-card-clickable"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Kanban size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Sales Pipeline</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Kanban CRM workflow</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Manage deal stages from New to Closed Won with follow-up scheduling.
              </p>
            </div>

            {/* Module 3: Clients & Onboarding */}
            <div
              onClick={() => onNavigateToClients && onNavigateToClients()}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
              className="stat-card-clickable"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Clients & Onboarding</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Client relationship hub</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Convert won leads into accounts with onboarding checklists and access notes.
              </p>
            </div>

            {/* Module 4: Commercial & Finance */}
            <div
              onClick={() => onNavigateToFinance && onNavigateToFinance('overview')}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
              className="stat-card-clickable"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Commercial & Finance</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Proposals & Invoices</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Generate quotes, issue milestone invoices, and verify incoming payment claims.
              </p>
            </div>

            {/* Module 5: Projects & Delivery */}
            <div
              onClick={() => onNavigateToProjects && onNavigateToProjects()}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s' }}
              className="stat-card-clickable"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderKanban size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Projects & Delivery</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Milestones & Approvals</span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                Track software builds, client feedback rounds, and live staging deployments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
