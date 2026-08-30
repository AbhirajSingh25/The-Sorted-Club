import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  LogOut,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Trash2,
  CheckCircle,
  X,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Layers,
  AlertTriangle,
  Kanban,
  DollarSign
} from 'lucide-react';
import {
  fetchLeads,
  fetchLeadStats,
  updateLead,
  deleteLead,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import StatusBadge, { PriorityBadge, FollowUpBadge } from './StatusBadge';

const STATUS_LIST = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const SERVICE_LIST = [
  'ALL',
  'Website / Build',
  'Marketing / Growth',
  'AI / Automation',
  'Hiring',
  'Custom software',
  'Not sure yet'
];

export default function AdminDashboard({
  onLogout,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToFinance,
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

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  // Selected lead drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Custom in-app delete confirmation modal
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const adminUser = getAdminUsername() || 'Admin';

  const loadData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const [statsData, leadsData] = await Promise.all([
        fetchLeadStats(),
        fetchLeads({
          status: statusFilter,
          service_interest: serviceFilter,
          search: searchQuery
        })
      ]);
      setStats(statsData);
      setLeads(leadsData);

      // If selectedLead is open, update its reference from the fetched list
      if (selectedLead) {
        const updated = leadsData.find(l => l.id === selectedLead.id);
        if (updated) setSelectedLead(updated);
      }
    } catch (err) {
      if (err.status === 401) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(err.message || 'Failed to fetch pipeline data.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [statusFilter, serviceFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = async (leadId, newStatus) => {
    setIsUpdatingStatus(true);
    setActionSuccess(null);
    try {
      const updated = await updateLead(leadId, { status: newStatus });
      setLeads(prev => prev.map(l => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated);
      }
      // Refresh stats
      const newStats = await fetchLeadStats();
      setStats(newStats);
      setActionSuccess(`Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(leadToDelete.id);
      setLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
      if (selectedLead?.id === leadToDelete.id) {
        setSelectedLead(null);
      }
      const newStats = await fetchLeadStats();
      setStats(newStats);
      setLeadToDelete(null);
    } catch (err) {
      alert(`Failed to delete lead: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <div className="admin-app-root">
      {/* Top Admin Navbar */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="brand">THE SORTED <span>CLUB</span></div>
          <span className="admin-badge">ADMIN OS</span>

          <div className="admin-nav-tabs">
            <button
              type="button"
              className="admin-tab-btn active"
            >
              <Layers size={14} />
              <span>Inquiries</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToCRM && onNavigateToCRM()}
            >
              <Kanban size={14} />
              <span>Sales Pipeline</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToClients && onNavigateToClients()}
            >
              <Users size={14} />
              <span>Clients & Onboarding</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToFinance && onNavigateToFinance('overview')}
            >
              <DollarSign size={14} />
              <span>Commercial & Finance</span>
            </button>
          </div>
        </div>

        <div className="admin-nav-right">
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

      <main className="admin-main-content">
        {/* Header Section */}
        <div className="admin-page-head">
          <div>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>PIPELINE & CLIENT BRIEFINGS</p>
            <h1>Inquiry Dashboard</h1>
          </div>
          <div className="admin-head-actions">
            <button
              onClick={() => loadData(true)}
              className="admin-refresh-btn"
              disabled={loading}
              title="Refresh Pipeline"
              type="button"
            >
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div className="admin-stats-grid">
          <div
            className={`stat-card stat-card-clickable ${statusFilter === 'ALL' ? 'active-stat' : ''}`}
            onClick={() => setStatusFilter('ALL')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-label">TOTAL LEADS</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">All-time received</div>
          </div>

          <div
            className={`stat-card stat-card-clickable ${statusFilter === 'NEW' ? 'active-stat' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'NEW' ? 'ALL' : 'NEW')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-label" style={{ color: '#10100f' }}>NEW LEADS</div>
            <div className="stat-value" style={{ color: '#10100f' }}>{stats.new}</div>
            <div className="stat-sub">Needs initial outreach</div>
          </div>

          <div
            className={`stat-card stat-card-clickable ${statusFilter === 'CONTACTED' ? 'active-stat' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'CONTACTED' ? 'ALL' : 'CONTACTED')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-label" style={{ color: '#0369a1' }}>CONTACTED</div>
            <div className="stat-value" style={{ color: '#0369a1' }}>{stats.contacted}</div>
            <div className="stat-sub">Outreach initiated</div>
          </div>

          <div
            className={`stat-card stat-card-clickable ${statusFilter === 'QUALIFIED' ? 'active-stat' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'QUALIFIED' ? 'ALL' : 'QUALIFIED')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-label" style={{ color: '#b45309' }}>QUALIFIED</div>
            <div className="stat-value" style={{ color: '#b45309' }}>{stats.qualified}</div>
            <div className="stat-sub">Scope & fit confirmed</div>
          </div>

          <div
            className={`stat-card stat-card-clickable ${statusFilter === 'WON' ? 'active-stat' : ''}`}
            onClick={() => setStatusFilter(statusFilter === 'WON' ? 'ALL' : 'WON')}
            role="button"
            tabIndex={0}
          >
            <div className="stat-label" style={{ color: '#15803d' }}>WON / CLOSED</div>
            <div className="stat-value" style={{ color: '#15803d' }}>{stats.won}</div>
            <div className="stat-sub">Active club members</div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="admin-controls-card">
          <div className="admin-search-box">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, company, email, phone, brief details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search inquiries"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-filter-row">
            {/* Status Filter Pills */}
            <div className="status-filter-pills">
              <span className="filter-label">Status:</span>
              {STATUS_LIST.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                >
                  {st}
                  {st !== 'ALL' && stats[st.toLowerCase()] !== undefined && (
                    <span className="pill-count">{stats[st.toLowerCase()]}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Service Interest Dropdown */}
            <div className="service-filter-box">
              <span className="filter-label">Service:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="admin-select"
                aria-label="Filter by service"
              >
                {SERVICE_LIST.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv === 'ALL' ? 'All Services' : srv}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table Container */}
        <div className="admin-table-container">
          {error && (
            <div className="error-banner" style={{ margin: '20px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                type="button"
                className="admin-link-btn"
                style={{ marginLeft: 'auto', background: '#fff', color: 'var(--ink)' }}
                onClick={() => loadData(true)}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="admin-loading-state">
              <Loader2 size={32} className="spinner" />
              <p>Loading inquiries...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon-box">
                <Users size={32} color="#858279" />
              </div>
              <h3>No inquiries found</h3>
              <p>
                {searchQuery || statusFilter !== 'ALL' || serviceFilter !== 'ALL'
                  ? 'Try adjusting your search filters or clearing the search query.'
                  : 'New client inquiries submitted via the "Get Sorted" form will appear here.'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>STATUS</th>
                    <th>CONTACT & BUSINESS</th>
                    <th>SERVICE INTEREST</th>
                    <th>BUDGET</th>
                    <th>PROBLEM SUMMARY</th>
                    <th>SUBMITTED</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`lead-row ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedLead(lead);
                        }
                      }}
                    >
                      <td>
                        <StatusBadge status={lead.status} size="small" />
                      </td>
                      <td>
                        <div className="lead-name-cell">
                          <strong>{lead.name}</strong>
                          <span className="lead-biz">{lead.business_name}</span>
                          <span className="lead-email-sub">{lead.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="service-tag">{lead.service_interest}</span>
                        <div className="biz-type-sub">{lead.business_type}</div>
                      </td>
                      <td>
                        <span className="budget-tag">{lead.budget}</span>
                      </td>
                      <td>
                        <p className="problem-snippet" title={lead.problem}>
                          {lead.problem}
                        </p>
                      </td>
                      <td>
                        <span className="lead-date">{formatDate(lead.created_at)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            className="btn-icon"
                            title="View Full Brief"
                            aria-label={`View brief for ${lead.name}`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Slide-in Lead Detail Drawer */}
      {selectedLead && (
        <div className="drawer-overlay" onClick={() => setSelectedLead(null)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-lead-title"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="eyebrow" style={{ color: 'var(--muted)' }}>LEAD #{selectedLead.id}</div>
                <h2 id="drawer-lead-title">{selectedLead.name}</h2>
                <div className="drawer-biz-name">{selectedLead.business_name}</div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedLead(null)}
                aria-label="Close lead details"
              >
                <X size={20} />
              </button>
            </div>

            {actionSuccess && (
              <div className="success-banner" style={{ margin: '16px 24px 0' }}>
                <CheckCircle size={16} />
                <span>{actionSuccess}</span>
              </div>
            )}

            <div className="drawer-body">
              {/* Status Update Block */}
              <div className="drawer-section status-section">
                <label className="section-subtitle">CURRENT STATUS & PIPELINE STAGE</label>
                <div className="status-button-group">
                  {STATUS_LIST.filter(s => s !== 'ALL').map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(selectedLead.id, st)}
                      className={`status-select-btn ${selectedLead.status === st ? 'current' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Outreach Actions */}
              <div className="drawer-section">
                <label className="section-subtitle">DIRECT OUTREACH</label>
                <div className="outreach-grid">
                  <a
                    href={`mailto:${selectedLead.email}?subject=The%20Sorted%20Club%20—%20Your%20Inquiry%20(${encodeURIComponent(selectedLead.service_interest)})`}
                    className="outreach-btn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Mail size={16} />
                    <span>{selectedLead.email}</span>
                  </a>

                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="outreach-btn"
                  >
                    <Phone size={16} />
                    <span>{selectedLead.phone}</span>
                  </a>

                  {selectedLead.website ? (
                    <a
                      href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                      className="outreach-btn"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe size={16} />
                      <span>{selectedLead.website}</span>
                      <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                    </a>
                  ) : null}
                </div>
              </div>

              {/* Project Brief Details */}
              <div className="drawer-section">
                <label className="section-subtitle">PROJECT REQUIREMENTS & BRIEF</label>
                
                <div className="drawer-meta-grid">
                  <div className="meta-card">
                    <span className="meta-label">SERVICE NEEDED</span>
                    <strong className="meta-val">{selectedLead.service_interest}</strong>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">BUDGET ESTIMATE</span>
                    <strong className="meta-val">{selectedLead.budget}</strong>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">BUSINESS TYPE</span>
                    <strong className="meta-val">{selectedLead.business_type}</strong>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">RECEIVED DATE</span>
                    <strong className="meta-val">{formatDate(selectedLead.created_at)}</strong>
                  </div>
                </div>

                <div className="problem-full-box">
                  <div className="problem-header">
                    <strong>Problem Description</strong>
                  </div>
                  <p className="problem-text">{selectedLead.problem}</p>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <button
                type="button"
                onClick={() => setLeadToDelete(selectedLead)}
                className="btn-danger-outline"
              >
                <Trash2 size={16} />
                <span>Delete Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {leadToDelete && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 2000 }}
          onClick={() => { if (!isDeleting) setLeadToDelete(null); }}
        >
          <div
            className="modal-container"
            style={{ maxWidth: '440px', padding: '32px' }}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <h3 id="delete-lead-title" style={{ font: '700 22px "Space Grotesk", sans-serif', margin: '0 0 6px' }}>
                Delete Lead?
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                Are you sure you want to delete the lead for <strong>{leadToDelete.name}</strong> ({leadToDelete.business_name})? This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1, height: '44px' }}
                onClick={() => setLeadToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary"
                style={{ flex: 1, height: '44px', background: '#dc2626', borderColor: '#dc2626', cursor: 'pointer' }}
                onClick={confirmDeleteLead}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
