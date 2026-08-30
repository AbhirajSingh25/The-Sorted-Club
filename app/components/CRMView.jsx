import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Layers,
  AlertTriangle,
  Kanban,
  Table as TableIcon,
  DollarSign,
  TrendingUp,
  Clock,
  MessageSquare,
  PhoneCall,
  FileText,
  UserCheck,
  Send,
  PlusCircle,
  Tag,
  Shield,
  Briefcase,
  Sparkles
} from 'lucide-react';
import {
  fetchLeads,
  fetchCRMMetrics,
  updateLead,
  deleteLead,
  fetchLeadActivities,
  createLeadActivity,
  convertLeadToClient,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import StatusBadge, { PriorityBadge, FollowUpBadge } from './StatusBadge';

const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
const SERVICES = [
  'ALL',
  'Website / Build',
  'Marketing / Growth',
  'AI / Automation',
  'Hiring',
  'Custom software',
  'Not sure yet'
];
const PRIORITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const SOURCES = [
  'ALL',
  'Website',
  'Referral',
  'WhatsApp',
  'Instagram',
  'LinkedIn',
  'Google',
  'Cold outreach',
  'Other'
];
const FOLLOW_UP_FILTERS = [
  { id: 'ALL', label: 'All Follow-ups' },
  { id: 'TODAY', label: 'Due Today' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'NO_FOLLOWUP', label: 'No Follow-up' }
];

export default function CRMView({
  onLogout,
  onNavigateToAdmin,
  onNavigateToClients,
  onNavigateToFinance,
  onBackToSite
}) {
  const [metrics, setMetrics] = useState({
    total_pipeline_value: 0,
    active_deals_count: 0,
    new_count: 0,
    contacted_count: 0,
    qualified_count: 0,
    proposal_count: 0,
    negotiation_count: 0,
    won_count: 0,
    won_value: 0,
    lost_count: 0,
    win_rate_percentage: 0,
    avg_deal_value: 0,
    followups_due_today: 0,
    followups_overdue: 0
  });

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Mode: 'kanban' or 'table'
  const [viewMode, setViewMode] = useState('kanban');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [followUpFilter, setFollowUpFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Selected Lead Drawer State
  const [selectedLead, setSelectedLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newActivityType, setNewActivityType] = useState('NOTE');
  const [newActivityText, setNewActivityText] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Edit Sales fields in drawer
  const [editEstimatedValue, setEditEstimatedValue] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editSource, setEditSource] = useState('Website');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editNextFollowUp, setEditNextFollowUp] = useState('');
  const [editLostReason, setEditLostReason] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingSalesDetails, setIsSavingSalesDetails] = useState(false);
  const [drawerSuccessMsg, setDrawerSuccessMsg] = useState(null);

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const adminUser = getAdminUsername() || 'Admin';

  const loadCRMData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    try {
      const [metricsData, leadsData] = await Promise.all([
        fetchCRMMetrics(),
        fetchLeads({
          status: stageFilter,
          service_interest: serviceFilter,
          priority: priorityFilter,
          source: sourceFilter,
          follow_up_filter: followUpFilter,
          search: searchQuery,
          sort_by: sortBy
        })
      ]);
      setMetrics(metricsData);
      setLeads(leadsData);

      if (selectedLead) {
        const updated = leadsData.find(l => l.id === selectedLead.id);
        if (updated) syncSelectedLead(updated);
      }
    } catch (err) {
      if (err.status === 401) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(err.message || 'Failed to fetch CRM sales data.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadCRMData(true);
  }, [stageFilter, serviceFilter, priorityFilter, sourceFilter, followUpFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCRMData(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const syncSelectedLead = (lead) => {
    setSelectedLead(lead);
    setEditEstimatedValue(lead.estimated_value !== null && lead.estimated_value !== undefined ? String(lead.estimated_value) : '');
    setEditPriority(lead.priority || 'MEDIUM');
    setEditSource(lead.source || 'Website');
    setEditAssignedTo(lead.assigned_to || '');
    setEditLostReason(lead.lost_reason || '');
    setEditNotes(lead.notes || '');

    // Format next_follow_up_at for datetime-local input
    if (lead.next_follow_up_at) {
      try {
        const d = new Date(lead.next_follow_up_at);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setEditNextFollowUp(formatted);
      } catch (e) {
        setEditNextFollowUp('');
      }
    } else {
      setEditNextFollowUp('');
    }
  };

  const openLeadDrawer = async (lead) => {
    syncSelectedLead(lead);
    setDrawerSuccessMsg(null);
    setLoadingActivities(true);
    try {
      const actData = await fetchLeadActivities(lead.id);
      setActivities(actData);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleStageChange = async (leadId, newStage) => {
    try {
      const updated = await updateLead(leadId, { status: newStage });
      setLeads(prev => prev.map(l => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) {
        syncSelectedLead(updated);
        const actData = await fetchLeadActivities(leadId);
        setActivities(actData);
      }
      const newMetrics = await fetchCRMMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      alert(`Failed to move stage: ${err.message}`);
    }
  };

  const handleMoveStageRelative = (lead, direction) => {
    const currentIndex = STAGES.indexOf(lead.status);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      handleStageChange(lead.id, STAGES[nextIndex]);
    }
  };

  const handleConvertLead = async (lead) => {
    if (!lead || lead.status !== 'WON') return;
    setIsConverting(true);
    try {
      const client = await convertLeadToClient(lead.id);
      const updated = {
        ...lead,
        is_converted: true,
        client_id: client.id,
        client_code: client.client_code,
        converted_at: client.created_at
      };
      setLeads(prev => prev.map(l => (l.id === lead.id ? updated : l)));
      if (selectedLead?.id === lead.id) {
        syncSelectedLead(updated);
        const actData = await fetchLeadActivities(lead.id);
        setActivities(actData);
      }
      setDrawerSuccessMsg(`Successfully converted to Client ${client.client_code}!`);
    } catch (err) {
      alert(`Conversion failed: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleSaveSalesDetails = async (e) => {
    if (e) e.preventDefault();
    if (!selectedLead) return;

    setIsSavingSalesDetails(true);
    setDrawerSuccessMsg(null);
    try {
      const payload = {
        priority: editPriority,
        source: editSource,
        assigned_to: editAssignedTo.trim() || null,
        estimated_value: editEstimatedValue ? parseFloat(editEstimatedValue) : null,
        next_follow_up_at: editNextFollowUp ? new Date(editNextFollowUp).toISOString() : null,
        lost_reason: editLostReason.trim() || null,
        notes: editNotes.trim() || null
      };

      const updated = await updateLead(selectedLead.id, payload);
      setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
      syncSelectedLead(updated);

      const newMetrics = await fetchCRMMetrics();
      setMetrics(newMetrics);

      setDrawerSuccessMsg('Sales details saved successfully.');
      setTimeout(() => setDrawerSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Failed to save details: ${err.message}`);
    } finally {
      setIsSavingSalesDetails(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedLead || !newActivityText.trim()) return;

    setIsAddingActivity(true);
    try {
      const newAct = await createLeadActivity(selectedLead.id, {
        type: newActivityType,
        text: newActivityText.trim(),
        created_by: adminUser
      });
      setActivities(prev => [newAct, ...prev]);
      setNewActivityText('');

      const updatedLead = await fetchLeads({ search: selectedLead.email });
      if (updatedLead && updatedLead.length > 0) {
        const refreshed = updatedLead.find(l => l.id === selectedLead.id);
        if (refreshed) syncSelectedLead(refreshed);
      }
    } catch (err) {
      alert(`Failed to add activity: ${err.message}`);
    } finally {
      setIsAddingActivity(false);
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
      const newMetrics = await fetchCRMMetrics();
      setMetrics(newMetrics);
      setLeadToDelete(null);
    } catch (err) {
      alert(`Failed to delete lead: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CALL':
        return <PhoneCall size={14} color="#0369a1" />;
      case 'EMAIL':
        return <Mail size={14} color="#7e22ce" />;
      case 'WHATSAPP':
        return <MessageSquare size={14} color="#15803d" />;
      case 'MEETING':
        return <Calendar size={14} color="#b45309" />;
      case 'STATUS_CHANGE':
        return <TrendingUp size={14} color="#10100f" />;
      default:
        return <FileText size={14} color="#68665e" />;
    }
  };

  return (
    <div className="admin-app-root">
      {/* Top Admin Navbar with Tab Switcher */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="brand">THE SORTED <span>CLUB</span></div>
          <span className="admin-badge">SALES CRM</span>

          {/* Navigation Switcher */}
          <div className="admin-nav-tabs">
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
            >
              <Layers size={14} />
              <span>Inquiries</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn active"
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
        {/* Head Section */}
        <div className="admin-page-head">
          <div>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>SALES ENGINE & REVENUE PIPELINE</p>
            <h1>Sales Pipeline CRM</h1>
          </div>
          <div className="admin-head-actions">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
              >
                <Kanban size={15} />
                <span>Kanban</span>
              </button>
              <button
                type="button"
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="List Table View"
              >
                <TableIcon size={15} />
                <span>Table</span>
              </button>
            </div>

            <button
              onClick={() => loadCRMData(true)}
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

        {/* CRM Sales Metrics Bar */}
        <div className="crm-metrics-grid">
          <div className="crm-metric-card highlight-metric">
            <div className="crm-metric-label">PIPELINE VALUE</div>
            <div className="crm-metric-val">{formatCurrency(metrics.total_pipeline_value)}</div>
            <div className="crm-metric-sub">{metrics.active_deals_count} active opportunities</div>
          </div>

          <div className="crm-metric-card">
            <div className="crm-metric-label">WON DEALS</div>
            <div className="crm-metric-val" style={{ color: '#15803d' }}>
              {formatCurrency(metrics.won_value)}
            </div>
            <div className="crm-metric-sub">{metrics.won_count} closed won</div>
          </div>

          <div className="crm-metric-card">
            <div className="crm-metric-label">WIN RATE</div>
            <div className="crm-metric-val">{metrics.win_rate_percentage}%</div>
            <div className="crm-metric-sub">Won vs Lost ratio</div>
          </div>

          <div className="crm-metric-card">
            <div className="crm-metric-label">AVG DEAL SIZE</div>
            <div className="crm-metric-val">{formatCurrency(metrics.avg_deal_value)}</div>
            <div className="crm-metric-sub">Average closed deal</div>
          </div>

          <div
            className={`crm-metric-card ${followUpFilter === 'TODAY' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setFollowUpFilter(followUpFilter === 'TODAY' ? 'ALL' : 'TODAY')}
          >
            <div className="crm-metric-label" style={{ color: '#b45309' }}>DUE TODAY</div>
            <div className="crm-metric-val" style={{ color: '#b45309' }}>
              {metrics.followups_due_today}
            </div>
            <div className="crm-metric-sub">Follow-ups today</div>
          </div>

          <div
            className={`crm-metric-card ${followUpFilter === 'OVERDUE' ? 'active-metric' : ''} ${metrics.followups_overdue > 0 ? 'overdue-alert' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setFollowUpFilter(followUpFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          >
            <div className="crm-metric-label" style={{ color: '#dc2626' }}>OVERDUE</div>
            <div className="crm-metric-val" style={{ color: '#dc2626' }}>
              {metrics.followups_overdue}
            </div>
            <div className="crm-metric-sub">Needs attention</div>
          </div>
        </div>

        {/* CRM Search & Filters Card */}
        <div className="admin-controls-card" style={{ borderRadius: '10px 10px 0 0' }}>
          <div className="admin-search-box">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search leads, companies, notes, assignments, sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search pipeline"
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

          <div className="crm-filter-bar">
            {/* Stage Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Stages</option>
                {STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Service Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Service:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="admin-select"
              >
                {SERVICES.map(srv => (
                  <option key={srv} value={srv}>{srv === 'ALL' ? 'All Services' : srv}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="admin-select"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p === 'ALL' ? 'All Priorities' : p}</option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="admin-select"
              >
                {SOURCES.map(src => (
                  <option key={src} value={src}>{src === 'ALL' ? 'All Sources' : src}</option>
                ))}
              </select>
            </div>

            {/* Follow-up Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Follow-up:</span>
              <select
                value={followUpFilter}
                onChange={(e) => setFollowUpFilter(e.target.value)}
                className="admin-select"
              >
                {FOLLOW_UP_FILTERS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Sort by */}
            <div className="filter-select-group" style={{ marginLeft: 'auto' }}>
              <span className="filter-label">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-select"
              >
                <option value="newest">Newest First</option>
                <option value="value_desc">Estimated Value (High → Low)</option>
                <option value="follow_up_asc">Next Follow-up (Earliest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Container (Kanban or Table) */}
        <div className="crm-content-container">
          {error && (
            <div className="error-banner" style={{ margin: '20px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                type="button"
                className="admin-link-btn"
                style={{ marginLeft: 'auto', background: '#fff', color: 'var(--ink)' }}
                onClick={() => loadCRMData(true)}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="admin-loading-state">
              <Loader2 size={32} className="spinner" />
              <p>Loading sales pipeline...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon-box">
                <Users size={32} color="#858279" />
              </div>
              <h3>No CRM deals found</h3>
              <p>Try adjusting your search criteria or clearing filters.</p>
            </div>
          ) : viewMode === 'kanban' ? (
            /* KANBAN BOARD VIEW */
            <div className="kanban-board-wrapper">
              <div className="kanban-columns-grid">
                {STAGES.map((stg) => {
                  const stageLeads = leads.filter(l => (l.status || 'NEW').toUpperCase() === stg);
                  const stageTotalVal = stageLeads.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

                  return (
                    <div key={stg} className="kanban-column">
                      <div className="kanban-column-header">
                        <div className="kanban-col-title">
                          <StatusBadge status={stg} size="small" />
                          <span className="kanban-count">{stageLeads.length}</span>
                        </div>
                        {stageTotalVal > 0 && (
                          <span className="kanban-val-tag">{formatCurrency(stageTotalVal)}</span>
                        )}
                      </div>

                      <div className="kanban-cards-list">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className={`kanban-card ${selectedLead?.id === lead.id ? 'active-card' : ''}`}
                            onClick={() => openLeadDrawer(lead)}
                            tabIndex={0}
                            role="button"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') openLeadDrawer(lead);
                            }}
                          >
                            <div className="kanban-card-top">
                              <span className="kanban-biz-name">{lead.business_name}</span>
                              <PriorityBadge priority={lead.priority} size="small" />
                            </div>

                            <div className="kanban-contact-name">{lead.name}</div>
                            <div className="kanban-service-tag">{lead.service_interest}</div>

                            <div className="kanban-card-mid">
                              <div className="kanban-deal-val">
                                {lead.estimated_value ? formatCurrency(lead.estimated_value) : lead.budget}
                              </div>
                              <span className="kanban-source-pill">{lead.source || 'Website'}</span>
                            </div>

                            {lead.next_follow_up_at && (
                              <div className="kanban-followup-row">
                                <FollowUpBadge dateStr={lead.next_follow_up_at} />
                              </div>
                            )}

                            {lead.assigned_to && (
                              <div className="kanban-assigned-tag">
                                <UserCheck size={12} />
                                <span>{lead.assigned_to}</span>
                              </div>
                            )}

                            {/* Client Conversion Link on WON Deals */}
                            {lead.status === 'WON' && (
                              <div className="kanban-conversion-row" onClick={(e) => e.stopPropagation()}>
                                {lead.is_converted || lead.client_code ? (
                                  <button
                                    type="button"
                                    onClick={() => onNavigateToClients && onNavigateToClients(lead.client_id)}
                                    className="kanban-client-link-btn"
                                  >
                                    <Shield size={11} /> {lead.client_code || 'Client Account'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleConvertLead(lead)}
                                    disabled={isConverting}
                                    className="kanban-convert-btn"
                                  >
                                    <Sparkles size={11} /> Convert to Client
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Quick Stage Controls on Card */}
                            <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="stage-nav-btn"
                                disabled={STAGES.indexOf(lead.status) === 0}
                                onClick={() => handleMoveStageRelative(lead, -1)}
                                title="Move to previous stage"
                                aria-label="Move left"
                              >
                                <ChevronLeft size={14} />
                              </button>

                              <span className="stage-step-info">
                                {STAGES.indexOf(lead.status) + 1}/{STAGES.length}
                              </span>

                              <button
                                type="button"
                                className="stage-nav-btn"
                                disabled={STAGES.indexOf(lead.status) === STAGES.length - 1}
                                onClick={() => handleMoveStageRelative(lead, 1)}
                                title="Move to next stage"
                                aria-label="Move right"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* LIST TABLE VIEW */
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>STAGE</th>
                    <th>PRIORITY</th>
                    <th>COMPANY & CONTACT</th>
                    <th>SERVICE</th>
                    <th>EST. VALUE</th>
                    <th>SOURCE</th>
                    <th>ASSIGNED</th>
                    <th>CLIENT STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => openLeadDrawer(lead)}
                      className={`lead-row ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                    >
                      <td>
                        <StatusBadge status={lead.status} size="small" />
                      </td>
                      <td>
                        <PriorityBadge priority={lead.priority} size="small" />
                      </td>
                      <td>
                        <div className="lead-name-cell">
                          <strong>{lead.business_name}</strong>
                          <span className="lead-biz">{lead.name}</span>
                          <span className="lead-email-sub">{lead.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="service-tag">{lead.service_interest}</span>
                      </td>
                      <td>
                        <strong>{lead.estimated_value ? formatCurrency(lead.estimated_value) : lead.budget}</strong>
                      </td>
                      <td>
                        <span className="budget-tag">{lead.source || 'Website'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: lead.assigned_to ? 'var(--ink)' : 'var(--muted)' }}>
                          {lead.assigned_to || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        {lead.status === 'WON' ? (
                          lead.is_converted || lead.client_code ? (
                            <span className="client-code-tag" style={{ fontSize: '10px' }}>
                              {lead.client_code}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConvertLead(lead);
                              }}
                              className="kanban-convert-btn"
                            >
                              Convert
                            </button>
                          )
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openLeadDrawer(lead)}
                          className="btn-icon"
                          title="Open CRM Drawer"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CRM LEAD DETAIL & ACTIVITY DRAWER */}
      {selectedLead && (
        <div className="drawer-overlay" onClick={() => setSelectedLead(null)}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>DEAL #{selectedLead.id}</span>
                  <PriorityBadge priority={selectedLead.priority} size="small" />
                  {selectedLead.client_code && (
                    <span className="client-code-tag">{selectedLead.client_code}</span>
                  )}
                </div>
                <h2>{selectedLead.business_name}</h2>
                <div className="drawer-biz-name">{selectedLead.name}</div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedLead(null)}
                aria-label="Close deal details"
              >
                <X size={20} />
              </button>
            </div>

            {drawerSuccessMsg && (
              <div className="success-banner" style={{ margin: '16px 24px 0' }}>
                <CheckCircle size={16} />
                <span>{drawerSuccessMsg}</span>
              </div>
            )}

            <div className="drawer-body">
              {/* STAGE ADVANCEMENT BUTTONS */}
              <div className="drawer-section">
                <label className="section-subtitle">SALES PIPELINE STAGE</label>
                <div className="crm-stage-stepper">
                  {STAGES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStageChange(selectedLead.id, st)}
                      className={`crm-stage-btn ${selectedLead.status === st ? 'active' : ''}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLIENT CONVERSION ACTION FOR WON DEALS */}
              {selectedLead.status === 'WON' && (
                <div className="drawer-section crm-conversion-box">
                  <div className="conversion-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#15803d" />
                      <strong>
                        {selectedLead.is_converted || selectedLead.client_code
                          ? `Official Client: ${selectedLead.client_code}`
                          : 'Deal Closed Won • Ready for Client Onboarding'}
                      </strong>
                    </div>
                    {selectedLead.is_converted || selectedLead.client_code ? (
                      <button
                        type="button"
                        onClick={() => onNavigateToClients && onNavigateToClients(selectedLead.client_id)}
                        className="primary"
                        style={{ height: '36px', fontSize: '12px', padding: '0 14px' }}
                      >
                        <ExternalLink size={14} style={{ marginRight: '6px' }} /> View Client & Checklist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConvertLead(selectedLead)}
                        disabled={isConverting}
                        className="primary"
                        style={{ height: '36px', fontSize: '12px', padding: '0 14px', background: '#15803d', borderColor: '#15803d' }}
                      >
                        {isConverting ? (
                          <>
                            <Loader2 size={14} className="spinner" /> Converting...
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} style={{ marginRight: '6px' }} /> Convert to Client
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* QUICK DIRECT OUTREACH */}
              <div className="drawer-section">
                <label className="section-subtitle">DIRECT OUTREACH & SHORTCUTS</label>
                <div className="crm-outreach-row">
                  <a
                    href={`mailto:${selectedLead.email}?subject=The%20Sorted%20Club%20—%20${encodeURIComponent(selectedLead.service_interest)}`}
                    className="outreach-btn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </a>

                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="outreach-btn"
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedLead.name)},%20reaching%20out%20from%20The%20Sorted%20Club.`}
                    className="outreach-btn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquare size={16} color="#15803d" />
                    <span>WhatsApp</span>
                  </a>

                  {selectedLead.website && (
                    <a
                      href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                      className="outreach-btn"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe size={16} />
                      <span>Web</span>
                    </a>
                  )}
                </div>
              </div>

              {/* SALES METRICS & EDIT FORM */}
              <form onSubmit={handleSaveSalesDetails} className="drawer-section crm-sales-card">
                <label className="section-subtitle">DEAL PARAMETERS & FOLLOW-UP</label>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Estimated Deal Value ($ USD)</label>
                    <input
                      type="number"
                      step="100"
                      min="0"
                      placeholder="e.g. 15000"
                      value={editEstimatedValue}
                      onChange={(e) => setEditEstimatedValue(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="custom-select"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Lead Source</label>
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value)}
                      className="custom-select"
                    >
                      {SOURCES.filter(s => s !== 'ALL').map(src => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned To</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Next Follow-Up Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editNextFollowUp}
                    onChange={(e) => setEditNextFollowUp(e.target.value)}
                  />
                </div>

                {selectedLead.status === 'LOST' && (
                  <div className="form-group">
                    <label>Lost Reason / Feedback</label>
                    <input
                      type="text"
                      placeholder="e.g. Budget mismatch, built internally, competitor"
                      value={editLostReason}
                      onChange={(e) => setEditLostReason(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Internal Deal Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Key client requirements, stakeholders, decision timelines..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingSalesDetails}
                  className="primary"
                  style={{ height: '40px', fontSize: '13px', alignSelf: 'flex-start' }}
                >
                  {isSavingSalesDetails ? 'Saving...' : 'Save Deal Parameters'}
                </button>
              </form>

              {/* PROJECT BRIEF & REQUIREMENTS */}
              <div className="drawer-section">
                <label className="section-subtitle">ORIGINAL CLIENT BRIEF</label>
                <div className="drawer-meta-grid">
                  <div className="meta-card">
                    <span className="meta-label">SERVICE NEEDED</span>
                    <strong className="meta-val">{selectedLead.service_interest}</strong>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">CLIENT BUDGET</span>
                    <strong className="meta-val">{selectedLead.budget}</strong>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">INDUSTRY</span>
                    <strong className="meta-val">{selectedLead.business_type}</strong>
                  </div>
                  <div className="meta-card">
                    <span className="meta-label">RECEIVED</span>
                    <strong className="meta-val">{formatDate(selectedLead.created_at)}</strong>
                  </div>
                </div>

                <div className="problem-full-box">
                  <div className="problem-header">
                    <strong>Problem Statement</strong>
                  </div>
                  <p className="problem-text">{selectedLead.problem}</p>
                </div>
              </div>

              {/* ACTIVITY TIMELINE & NOTES FEED */}
              <div className="drawer-section">
                <label className="section-subtitle">ACTIVITY TIMELINE & NOTES</label>

                {/* Add Activity Input Box */}
                <form onSubmit={handleAddActivity} className="add-activity-box">
                  <div className="activity-type-pill-selector">
                    {['NOTE', 'CALL', 'EMAIL', 'WHATSAPP', 'MEETING'].map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setNewActivityType(t)}
                        className={`act-type-pill ${newActivityType === t ? 'active' : ''}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder={`Add a ${newActivityType.toLowerCase()} note...`}
                    value={newActivityText}
                    onChange={(e) => setNewActivityText(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    disabled={isAddingActivity || !newActivityText.trim()}
                    className="primary"
                    style={{ height: '36px', fontSize: '12px', padding: '0 16px', alignSelf: 'flex-end' }}
                  >
                    {isAddingActivity ? 'Recording...' : 'Log Activity'}
                  </button>
                </form>

                {/* Activity Feed */}
                <div className="activity-timeline-feed">
                  {loadingActivities ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <Loader2 size={20} className="spinner" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="empty-activity-state">
                      <p>No activity logged yet. Add a note or call update above.</p>
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="timeline-item">
                        <div className="timeline-icon-box">
                          {getActivityIcon(act.type)}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <span className="timeline-type">{act.type}</span>
                            <span className="timeline-author">by {act.created_by || 'Admin'}</span>
                            <span className="timeline-time">{formatDate(act.created_at)}</span>
                          </div>
                          <p className="timeline-text">{act.text}</p>
                        </div>
                      </div>
                    ))
                  )}
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
              <h3 style={{ font: '700 22px "Space Grotesk", sans-serif', margin: '0 0 6px' }}>
                Delete Lead?
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>
                Are you sure you want to delete the deal for <strong>{leadToDelete.business_name}</strong>? All associated CRM activities will also be removed.
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
