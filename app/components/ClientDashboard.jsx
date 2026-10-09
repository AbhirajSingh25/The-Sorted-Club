import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Users,
  Search,
  RefreshCw,
  LogOut,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  X,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Layers,
  Kanban,
  UserCheck,
  CheckSquare,
  Square,
  FileText,
  PhoneCall,
  MessageSquare,
  Send,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Clock,
  Sparkles,
  DollarSign,
  Receipt,
  FileCheck,
  Link as LinkIcon,
  FolderKanban,
  Plus
} from 'lucide-react';
import {
  fetchClients,
  fetchClientStats,
  fetchClient,
  updateClient,
  fetchClientOnboarding,
  updateClientOnboarding,
  fetchClientActivities,
  createClientActivity,
  fetchProjects,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import StatusBadge, {
  ClientStatusBadge,
  OnboardingStatusBadge,
  ProjectStatusBadge
} from './StatusBadge';
import NotificationCenter from './NotificationCenter';
import AdminNavbar from './AdminNavbar';

const CLIENT_STATUSES = ['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];
const ONBOARDING_STATUSES = ['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'COMPLETED'];

// Phase display names
const PHASE_LABELS = {
  BRAND_STRATEGY: 'Phase 1 • Strategy, Vision & Briefing',
  ACCESS_ASSETS: 'Phase 2 • Assets & Access Handover',
  ALIGNMENT_SETUP: 'Phase 3 • Alignment & Project Setup'
};

export default function ClientDashboard({
  onLogout,
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToCRM,
  onNavigateToFinance,
  onNavigateToProjects,
  onBackToSite,
  initialSelectedClientId = null,
  hideNavbar = false,
  onBack = null
}) {
  const [stats, setStats] = useState({
    total_clients: 0,
    active_clients: 0,
    onboarding_in_progress: 0,
    waiting_for_client: 0,
    completed_clients: 0
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [onboardingFilter, setOnboardingFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Selected Client Drawer State
  const [selectedClient, setSelectedClient] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [loadingOnboarding, setLoadingOnboarding] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [clientProjects, setClientProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Drawer Account Edit State
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState(null);

  // Drawer Activity State
  const [newActivityType, setNewActivityType] = useState('NOTE');
  const [newActivityText, setNewActivityText] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  // Item Notes Expansion
  const [activeItemNoteId, setActiveItemNoteId] = useState(null);
  const [itemNotesDraft, setItemNotesDraft] = useState({});

  const adminUser = getAdminUsername() || 'Admin';

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const [statsData, clientsData] = await Promise.all([
        fetchClientStats(),
        fetchClients({
          status: statusFilter,
          onboarding_status: onboardingFilter,
          assigned_to: assignedFilter,
          search: searchQuery,
          sort_by: sortBy
        })
      ]);
      setStats(statsData);
      setClients(clientsData);

      if (selectedClient) {
        const updated = clientsData.find(c => c.id === selectedClient.id);
        if (updated) syncSelectedClient(updated);
      } else if (initialSelectedClientId) {
        const found = clientsData.find(c => c.id === Number(initialSelectedClientId));
        if (found) openClientDrawer(found);
      }
    } catch (err) {
      if (err.status === 401) {
        clearAdminAuth();
        onLogout();
        return;
      }
      setError(err.message || 'Failed to load client data.');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [statusFilter, onboardingFilter, assignedFilter, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const syncSelectedClient = (client) => {
    setSelectedClient(client);
    setEditStatus(client.status || 'ACTIVE');
    setEditAssignedTo(client.assigned_to || '');
    setEditNotes(client.notes || '');
  };

  const handleCloseClientDrawer = () => {
    setSelectedClient(null);
    window.history.replaceState({}, '', '/admin/clients');
  };

  const openClientDrawer = async (client) => {
    if (!client) return;
    syncSelectedClient(client);
    if (client.id) {
      window.history.replaceState({}, '', `/admin/clients?selectedClient=${client.id}`);
    }
    setAccountSuccessMsg(null);
    setLoadingOnboarding(true);
    setLoadingActivities(true);
    setLoadingProjects(true);

    try {
      const [obData, actData, projData] = await Promise.all([
        fetchClientOnboarding(client.id),
        fetchClientActivities(client.id),
        fetchProjects({ client_id: client.id })
      ]);
      setOnboardingData(obData);
      setActivities(actData);
      setClientProjects(projData);

      // Initialize item note drafts
      const notesMap = {};
      obData.items.forEach(it => {
        notesMap[it.id] = it.notes || '';
      });
      setItemNotesDraft(notesMap);
    } catch (err) {
      console.error('Failed to load client details:', err);
    } finally {
      setLoadingOnboarding(false);
      setLoadingActivities(false);
      setLoadingProjects(false);
    }
  };

  const handleSaveAccount = async (e) => {
    if (e) e.preventDefault();
    if (!selectedClient) return;

    setIsSavingAccount(true);
    setAccountSuccessMsg(null);
    try {
      const updated = await updateClient(selectedClient.id, {
        status: editStatus,
        assigned_to: editAssignedTo.trim() || null,
        notes: editNotes.trim() || null
      });
      setClients(prev => prev.map(c => (c.id === selectedClient.id ? updated : c)));
      syncSelectedClient(updated);

      const newStats = await fetchClientStats();
      setStats(newStats);

      // Refresh activity timeline
      const actData = await fetchClientActivities(selectedClient.id);
      setActivities(actData);

      setAccountSuccessMsg('Account details saved successfully.');
      setTimeout(() => setAccountSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Failed to save account details: ${err.message}`);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleToggleChecklistItem = async (item) => {
    if (!selectedClient || !onboardingData) return;

    const newCompleted = !item.completed;
    const currentNotes = itemNotesDraft[item.id] || item.notes || '';

    // Optimistic UI update
    const updatedItems = onboardingData.items.map(it => {
      if (it.id === item.id) {
        return {
          ...it,
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        };
      }
      return it;
    });

    const completedCount = updatedItems.filter(it => it.completed).length;
    const progressPct = Math.round((completedCount / updatedItems.length) * 100);

    setOnboardingData(prev => ({
      ...prev,
      items: updatedItems,
      completed_items: completedCount,
      progress_percentage: progressPct
    }));

    try {
      const resp = await updateClientOnboarding(selectedClient.id, {
        items: [
          {
            item_id: item.id,
            completed: newCompleted,
            notes: currentNotes.trim() || null
          }
        ]
      });
      setOnboardingData(resp);

      // Update clients table progress
      setClients(prev =>
        prev.map(c =>
          c.id === selectedClient.id
            ? { ...c, onboarding_status: resp.onboarding_status, onboarding_progress: resp.progress_percentage }
            : c
        )
      );

      // Refresh stats & activities
      const [newStats, actData] = await Promise.all([
        fetchClientStats(),
        fetchClientActivities(selectedClient.id)
      ]);
      setStats(newStats);
      setActivities(actData);
    } catch (err) {
      alert(`Failed to update checklist item: ${err.message}`);
      // Re-fetch to rollback optimistic state
      const obData = await fetchClientOnboarding(selectedClient.id);
      setOnboardingData(obData);
    }
  };

  const handleSaveItemNote = async (item) => {
    if (!selectedClient) return;
    const draftNote = (itemNotesDraft[item.id] || '').trim();

    try {
      const resp = await updateClientOnboarding(selectedClient.id, {
        items: [
          {
            item_id: item.id,
            completed: item.completed,
            notes: draftNote || null
          }
        ]
      });
      setOnboardingData(resp);
      setActiveItemNoteId(null);
    } catch (err) {
      alert(`Failed to save note: ${err.message}`);
    }
  };

  const handleOnboardingStatusChange = async (newStatus) => {
    if (!selectedClient) return;
    try {
      const resp = await updateClientOnboarding(selectedClient.id, {
        onboarding_status: newStatus,
        items: []
      });
      setOnboardingData(resp);

      setClients(prev =>
        prev.map(c =>
          c.id === selectedClient.id ? { ...c, onboarding_status: resp.onboarding_status } : c
        )
      );

      const [newStats, actData] = await Promise.all([
        fetchClientStats(),
        fetchClientActivities(selectedClient.id)
      ]);
      setStats(newStats);
      setActivities(actData);
    } catch (err) {
      alert(`Failed to change onboarding status: ${err.message}`);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedClient || !newActivityText.trim()) return;

    setIsAddingActivity(true);
    try {
      const newAct = await createClientActivity(selectedClient.id, {
        type: newActivityType,
        text: newActivityText.trim(),
        created_by: adminUser
      });
      setActivities(prev => [newAct, ...prev]);
      setNewActivityText('');
    } catch (err) {
      alert(`Failed to add activity: ${err.message}`);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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
        return <ShieldCheck size={14} color="#10100f" />;
      default:
        return <FileText size={14} color="#68665e" />;
    }
  };

  return (
    <div className="admin-app-root">
      {!hideNavbar && (
        <AdminNavbar
          activeTab="clients"
          badge="CLIENT HUB"
          onNavigateToCommandCenter={onNavigateToCommandCenter}
          onNavigateToInquiries={onNavigateToInquiries}
          onNavigateToCRM={onNavigateToCRM}
          onNavigateToClients={() => {}}
          onNavigateToFinance={onNavigateToFinance}
          onNavigateToProjects={onNavigateToProjects}
          onBackToSite={onBackToSite}
          onLogout={onLogout}
        />
      )}

      <main className="admin-main-content">
        {/* Head Section */}
        <div className="admin-page-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <p className="eyebrow" style={{ color: 'var(--muted)', margin: 0 }}>CLIENT SUCCESS & RELATIONSHIP MANAGEMENT</p>
              <h1 style={{ margin: 0 }}>Client Onboarding & Accounts</h1>
            </div>
          </div>
          <div className="admin-head-actions">
            <button
              onClick={() => loadData(true)}
              className="admin-refresh-btn"
              disabled={loading}
              title="Refresh Client Roster"
              type="button"
            >
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Client Metrics Grid */}
        <div className="crm-metrics-grid">
          <div className="crm-metric-card highlight-metric">
            <div className="crm-metric-label">TOTAL CLIENTS</div>
            <div className="crm-metric-val">{stats.total_clients}</div>
            <div className="crm-metric-sub">Accounts created</div>
          </div>

          <div
            className={`crm-metric-card ${statusFilter === 'ACTIVE' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
          >
            <div className="crm-metric-label" style={{ color: '#15803d' }}>ACTIVE CLIENTS</div>
            <div className="crm-metric-val" style={{ color: '#15803d' }}>{stats.active_clients}</div>
            <div className="crm-metric-sub">In active engagement</div>
          </div>

          <div
            className={`crm-metric-card ${onboardingFilter === 'IN_PROGRESS' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setOnboardingFilter(onboardingFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          >
            <div className="crm-metric-label" style={{ color: '#0369a1' }}>ONBOARDING IN PROGRESS</div>
            <div className="crm-metric-val" style={{ color: '#0369a1' }}>{stats.onboarding_in_progress}</div>
            <div className="crm-metric-sub">Active checklists</div>
          </div>

          <div
            className={`crm-metric-card ${onboardingFilter === 'WAITING_FOR_CLIENT' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setOnboardingFilter(onboardingFilter === 'WAITING_FOR_CLIENT' ? 'ALL' : 'WAITING_FOR_CLIENT')}
          >
            <div className="crm-metric-label" style={{ color: '#c2410c' }}>WAITING ON CLIENT</div>
            <div className="crm-metric-val" style={{ color: '#c2410c' }}>{stats.waiting_for_client}</div>
            <div className="crm-metric-sub">Pending client assets</div>
          </div>

          <div
            className={`crm-metric-card ${onboardingFilter === 'COMPLETED' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setOnboardingFilter(onboardingFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          >
            <div className="crm-metric-label" style={{ color: '#15803d' }}>FULLY ONBOARDED</div>
            <div className="crm-metric-val" style={{ color: '#15803d' }}>{stats.completed_clients}</div>
            <div className="crm-metric-sub">100% checklist done</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="admin-controls-card" style={{ borderRadius: '10px 10px 0 0' }}>
          <div className="admin-search-box">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by client code (SC-...), company, contact, email, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search clients"
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
            {/* Status Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                {CLIENT_STATUSES.map(st => (
                  <option key={st} value={st}>{st === 'ALL' ? 'All Account Statuses' : st}</option>
                ))}
              </select>
            </div>

            {/* Onboarding Filter */}
            <div className="filter-select-group">
              <span className="filter-label">Onboarding:</span>
              <select
                value={onboardingFilter}
                onChange={(e) => setOnboardingFilter(e.target.value)}
                className="admin-select"
              >
                {ONBOARDING_STATUSES.map(ob => (
                  <option key={ob} value={ob}>{ob === 'ALL' ? 'All Onboarding Stages' : ob.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Assigned to filter */}
            <div className="filter-select-group">
              <span className="filter-label">Assigned:</span>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Team Members</option>
                <option value="UNASSIGNED">Unassigned</option>
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
                <option value="oldest">Oldest First</option>
                <option value="code_asc">Client Code (A → Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client Content Container */}
        <div className="crm-content-container">
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
              <p>Loading client accounts...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon-box">
                <Users size={32} color="#858279" />
              </div>
              <h3>No client accounts found</h3>
              <p>
                Convert a <strong>WON</strong> opportunity from the Sales Pipeline CRM to create your first client account.
              </p>
              <button
                type="button"
                onClick={onNavigateToCRM}
                className="primary"
                style={{ marginTop: '14px', height: '38px', fontSize: '13px' }}
              >
                <Kanban size={14} style={{ marginRight: '6px' }} /> Go to Sales Pipeline
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CLIENT CODE</th>
                    <th>COMPANY & CONTACT</th>
                    <th>ACCOUNT STATUS</th>
                    <th>ONBOARDING PROGRESS</th>
                    <th>INDUSTRY</th>
                    <th>ASSIGNED TO</th>
                    <th>CREATED</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openClientDrawer(c)}
                      className={`lead-row ${selectedClient?.id === c.id ? 'selected' : ''}`}
                    >
                      <td>
                        <span className="client-code-tag">{c.client_code}</span>
                      </td>
                      <td>
                        <div className="lead-name-cell">
                          <strong>{c.business_name}</strong>
                          <span className="lead-biz">{c.name}</span>
                          <span className="lead-email-sub">{c.email}</span>
                        </div>
                      </td>
                      <td>
                        <ClientStatusBadge status={c.status} size="small" />
                      </td>
                      <td>
                        <div className="client-progress-cell">
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${c.onboarding_progress || 0}%`,
                                backgroundColor:
                                  (c.onboarding_progress || 0) === 100
                                    ? '#15803d'
                                    : (c.onboarding_progress || 0) > 0
                                    ? '#0369a1'
                                    : '#99968d'
                              }}
                            />
                          </div>
                          <div className="progress-label-row">
                            <span className="progress-pct">{c.onboarding_progress || 0}%</span>
                            <OnboardingStatusBadge status={c.onboarding_status} size="small" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="service-tag">{c.business_type}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: c.assigned_to ? 'var(--ink)' : 'var(--muted)' }}>
                          {c.assigned_to || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatDate(c.created_at)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openClientDrawer(c)}
                          className="admin-link-btn"
                          style={{
                            background: '#f4f1e9',
                            color: 'var(--ink)',
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '4px'
                          }}
                        >
                          Manage <ChevronRight size={14} />
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

      {/* CLIENT DETAIL & ONBOARDING DRAWER */}
      {selectedClient && (
        <div className="drawer-overlay" onClick={handleCloseClientDrawer}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="client-code-tag">{selectedClient.client_code}</span>
                  <ClientStatusBadge status={selectedClient.status} size="small" />
                </div>
                <h2>{selectedClient.business_name}</h2>
                <div className="drawer-biz-name">{selectedClient.name} • {selectedClient.business_type}</div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={handleCloseClientDrawer}
                aria-label="Close client view"
              >
                <X size={20} />
              </button>
            </div>

            {accountSuccessMsg && (
              <div className="success-banner" style={{ margin: '16px 24px 0' }}>
                <CheckCircle size={16} />
                <span>{accountSuccessMsg}</span>
              </div>
            )}

            <div className="drawer-body">
              {/* DIRECT OUTREACH SHORTCUTS */}
              <div className="drawer-section">
                <label className="section-subtitle">COMMUNICATION SHORTCUTS</label>
                <div className="crm-outreach-row">
                  <a
                    href={`mailto:${selectedClient.email}?subject=The%20Sorted%20Club%20—%20Client%20Account%20${selectedClient.client_code}`}
                    className="outreach-btn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Mail size={16} />
                    <span>Email</span>
                  </a>

                  <a
                    href={`tel:${selectedClient.phone}`}
                    className="outreach-btn"
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedClient.name)},%20reaching%20out%20regarding%20your%20account%20at%20The%20Sorted%20Club.`}
                    className="outreach-btn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageSquare size={16} color="#15803d" />
                    <span>WhatsApp</span>
                  </a>

                  {selectedClient.website && (
                    <a
                      href={selectedClient.website.startsWith('http') ? selectedClient.website : `https://${selectedClient.website}`}
                      className="outreach-btn"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe size={16} />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>

              {/* COMMERCIAL & BILLING SECTION */}
              <div className="drawer-section" style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <label className="section-subtitle" style={{ margin: 0 }}>COMMERCIAL & BILLING</label>
                    <h3 style={{ font: '700 16px "Space Grotesk", sans-serif', margin: '4px 0 0' }}>Financial Pipeline</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => onNavigateToFinance ? onNavigateToFinance('proposals') : null}
                    >
                      <FileText size={13} />
                      + Proposal
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => onNavigateToFinance ? onNavigateToFinance('invoices') : null}
                    >
                      <Receipt size={13} />
                      + Invoice
                    </button>
                  </div>
                </div>

                <div className="info-kv-grid" style={{ marginTop: '8px' }}>
                  <div className="kv-item">
                    <span className="kv-label">Account Reference:</span>
                    <span className="client-code-tag">{selectedClient.client_code}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Commercial Stage:</span>
                    <span className="kv-val font-bold" style={{ color: '#15803d' }}>
                      Active Commercial Account
                    </span>
                  </div>
                </div>
              </div>

              {/* 10-STEP ONBOARDING CHECKLIST ENGINE */}
              <div className="drawer-section onboarding-engine-card">
                <div className="onboarding-engine-head">
                  <div>
                    <label className="section-subtitle" style={{ margin: 0 }}>CLIENT ONBOARDING ENGINE</label>
                    <h3 style={{ font: '700 18px "Space Grotesk", sans-serif', margin: '4px 0 0' }}>
                      Checklist Progress
                    </h3>
                  </div>

                  <div className="onboarding-status-selector">
                    <select
                      value={onboardingData?.onboarding_status || selectedClient.onboarding_status}
                      onChange={(e) => handleOnboardingStatusChange(e.target.value)}
                      className="admin-select"
                      style={{ fontSize: '11px', height: '32px' }}
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_CLIENT">Waiting on Client</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                {onboardingData && (
                  <div className="onboarding-hero-progress">
                    <div className="progress-info-row">
                      <span className="progress-step-count">
                        <strong>{onboardingData.completed_items}</strong> of {onboardingData.total_items} Completed
                      </span>
                      <span className="progress-percentage-hero">
                        {onboardingData.progress_percentage}%
                      </span>
                    </div>

                    <div className="progress-bar-track large">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${onboardingData.progress_percentage}%`,
                          backgroundColor:
                            onboardingData.progress_percentage === 100
                              ? '#15803d'
                              : onboardingData.progress_percentage > 0
                              ? '#0369a1'
                              : '#99968d'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Grouped Checklist */}
                {loadingOnboarding ? (
                  <div style={{ padding: '30px', textAlign: 'center' }}>
                    <Loader2 size={24} className="spinner" />
                    <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}>Loading checklist...</p>
                  </div>
                ) : onboardingData?.items ? (
                  <div className="onboarding-categories-container">
                    {['LEGAL_FINANCE', 'ACCESS_ASSETS', 'ALIGNMENT_SETUP'].map((catKey) => {
                      const catItems = onboardingData.items.filter(it => it.category === catKey);
                      if (catItems.length === 0) return null;

                      return (
                        <div key={catKey} className="onboarding-category-block">
                          <h4 className="onboarding-category-title">{CATEGORY_TITLES[catKey]}</h4>

                          <div className="onboarding-checklist-list">
                            {catItems.map((item) => (
                              <div
                                key={item.id}
                                className={`checklist-item-row ${item.completed ? 'completed-item' : ''}`}
                              >
                                <div
                                  className="checklist-checkbox-btn"
                                  onClick={() => handleToggleChecklistItem(item)}
                                  role="checkbox"
                                  aria-checked={item.completed}
                                  tabIndex={0}
                                >
                                  {item.completed ? (
                                    <CheckSquare size={18} color="#15803d" />
                                  ) : (
                                    <Square size={18} color="#99968d" />
                                  )}
                                </div>

                                <div className="checklist-item-content">
                                  <div className="checklist-item-header">
                                    <span className="checklist-item-title">{item.title}</span>
                                    {item.completed_at && (
                                      <span className="checklist-item-date">
                                        Completed {formatDate(item.completed_at)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Item Note View / Expand */}
                                  {activeItemNoteId === item.id ? (
                                    <div className="item-note-edit-box">
                                      <input
                                        type="text"
                                        placeholder="Add reference, DocuSign link, or upload note..."
                                        value={itemNotesDraft[item.id] || ''}
                                        onChange={(e) =>
                                          setItemNotesDraft({ ...itemNotesDraft, [item.id]: e.target.value })
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveItemNote(item);
                                        }}
                                      />
                                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                        <button
                                          type="button"
                                          className="admin-tab-btn active"
                                          onClick={() => handleSaveItemNote(item)}
                                          style={{ padding: '3px 8px', fontSize: '10px' }}
                                        >
                                          Save Note
                                        </button>
                                        <button
                                          type="button"
                                          className="admin-tab-btn"
                                          onClick={() => setActiveItemNoteId(null)}
                                          style={{ padding: '3px 8px', fontSize: '10px' }}
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="item-note-display-row">
                                      {item.notes ? (
                                        <span
                                          className="item-note-text"
                                          onClick={() => setActiveItemNoteId(item.id)}
                                          title="Click to edit note"
                                        >
                                          Note: {item.notes}
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          className="add-item-note-link"
                                          onClick={() => setActiveItemNoteId(item.id)}
                                        >
                                          + Add note / reference
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {/* Onboarding Complete Action Banner */}
                {(onboardingData?.onboarding_status === 'COMPLETED' || onboardingData?.progress_percentage === 100) && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px 18px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={20} color="#15803d" />
                      <div>
                        <strong style={{ fontSize: '13px', color: '#15803d', display: 'block' }}>
                          Onboarding Complete
                        </strong>
                        <span style={{ fontSize: '12px', color: '#166534' }}>
                          All activation requirements fulfilled. Ready to launch project delivery.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      style={{ background: '#15803d', borderColor: '#15803d', fontSize: '12px' }}
                      onClick={() => onNavigateToProjects && onNavigateToProjects(selectedClient.id)}
                    >
                      <Plus size={13} />
                      <span>Create Project from Onboarding</span>
                    </button>
                  </div>
                )}
              </div>

              {/* CLIENT PROJECTS & SERVICE DELIVERABLES */}
              <div className="drawer-section" style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <label className="section-subtitle" style={{ margin: 0 }}>SERVICE DELIVERY</label>
                    <h3 style={{ font: '700 16px "Space Grotesk", sans-serif', margin: '4px 0 0' }}>
                      Active & Completed Projects ({clientProjects.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => onNavigateToProjects && onNavigateToProjects(selectedClient.id)}
                  >
                    <Plus size={13} />
                    <span>Create Project</span>
                  </button>
                </div>

                {loadingProjects ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <Loader2 size={20} className="spinner" />
                    <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>Loading projects...</p>
                  </div>
                ) : clientProjects.length === 0 ? (
                  <div className="crm-empty-state" style={{ padding: '20px', background: '#faf8f2', borderRadius: '6px' }}>
                    <p style={{ fontSize: '13px', margin: 0 }}>No delivery projects created for this client yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {clientProjects.map(proj => (
                      <div
                        key={proj.id}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: '6px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '2px 6px', borderRadius: '3px', font: '700 10px monospace' }}>
                              {proj.project_code}
                            </span>
                            <ProjectStatusBadge status={proj.status} size="small" />
                          </div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{proj.name}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                            <span>{proj.progress_percentage}% Done ({proj.completed_tasks_count}/{proj.total_tasks_count} tasks)</span>
                            {proj.target_date && (
                              <span style={{ color: proj.is_overdue ? '#dc2626' : undefined, fontWeight: proj.is_overdue ? 700 : 400 }}>
                                Due: {new Date(proj.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                          onClick={() => onNavigateToProjects && onNavigateToProjects(selectedClient.id, proj.id)}
                        >
                          View Project <ChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACCOUNT PARAMETERS & ASSIGNMENT */}
              <form onSubmit={handleSaveAccount} className="drawer-section crm-sales-card">
                <label className="section-subtitle">ACCOUNT STATUS & TEAM ASSIGNMENT</label>

                <div className="form-row">
                  <div className="form-group">
                    <label>Account Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="custom-select"
                    >
                      <option value="ACTIVE">Active Engagement</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Project Completed</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assigned Account Lead</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={editAssignedTo}
                      onChange={(e) => setEditAssignedTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Internal Client Notes (Admin Only)</label>
                  <textarea
                    rows={2}
                    placeholder="Key account nuances, stakeholder preferences, SLA commitments..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingAccount}
                  className="primary"
                  style={{ height: '38px', fontSize: '12px', alignSelf: 'flex-start' }}
                >
                  {isSavingAccount ? 'Saving Account...' : 'Save Account Settings'}
                </button>
              </form>

              {/* ORIGINAL CRM LEAD LINK */}
              <div className="drawer-section">
                <label className="section-subtitle">ORIGINAL CRM CONVERSION RECORD</label>
                <div className="linked-lead-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LinkIcon size={14} color="var(--ink)" />
                    <strong>Originated from CRM Deal #{selectedClient.lead_id}</strong>
                    <span className="kanban-source-pill" style={{ marginLeft: 'auto' }}>
                      Source: {selectedClient.source}
                    </span>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '12px', margin: '6px 0 0' }}>
                    Acquired via {selectedClient.source}. Preserved permanently with full inquiry brief and historic negotiation activities.
                  </p>
                </div>
              </div>

              {/* ACTIVITY & AUDIT TIMELINE */}
              <div className="drawer-section">
                <label className="section-subtitle">ACCOUNT ACTIVITY TIMELINE</label>

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
                    placeholder={`Log a client ${newActivityType.toLowerCase()} update...`}
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
                onClick={handleCloseClientDrawer}
                className="btn-secondary"
                style={{ marginLeft: 'auto' }}
              >
                Close Account View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
