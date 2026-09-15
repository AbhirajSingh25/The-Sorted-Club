import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
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
  Sparkles,
  FolderKanban,
  Copy,
  Check,
  Compass,
  PieChart,
  Target,
  ListChecks,
  Share2,
  Edit3,
  Bookmark,
  CheckSquare
} from 'lucide-react';
import {
  fetchLeads,
  fetchCRMMetrics,
  updateLead,
  deleteLead,
  createLead,
  fetchLeadActivities,
  createLeadActivity,
  completeLeadFollowUp,
  convertLeadToClient,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import StatusBadge, { PriorityBadge, FollowUpBadge, QualificationScoreBadge } from './StatusBadge';
import NotificationCenter from './NotificationCenter';
import AdminNavbar from './AdminNavbar';
import {
  generateOutreachMessages,
  DISCOVERY_CALL_CHECKLIST_ITEMS,
  QUALIFICATION_CRITERIA
} from './outreachTemplates';

// 9-Stage Customer Acquisition Pipeline
const STAGES = [
  'NEW',
  'CONTACTED',
  'REPLIED',
  'DISCOVERY_CALL',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'FOLLOW_UP_REQUIRED'
];

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
  'Cold outreach',
  'Instagram',
  'WhatsApp',
  'LinkedIn',
  'Website',
  'Referral',
  'Google',
  'Other'
];

const FOLLOW_UP_FILTERS = [
  { id: 'ALL', label: 'All Follow-ups' },
  { id: 'TODAY', label: 'Due Today' },
  { id: 'OVERDUE', label: 'Overdue' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'NO_FOLLOWUP', label: 'No Follow-up' }
];

const TEMPLATE_OPTIONS = [
  'None / Custom',
  'Feast & Flora (Restaurant / Café)',
  'Apex Academy (Coaching / EdTech)',
  'Luxe & Glow (Salon / Spa)',
  'Prime Realty (Real Estate & Property)',
  'Aura Essentials (E-commerce / DTC Store)',
  'ProFix Services (Local Home Services & Plumbing)',
  'Craft & Vision (Creative Freelancers & Portfolio)',
  'Pulse Fitness (Gym & Studio Booking)',
  'Nexus AI (SaaS & Startup Launch)',
  'Elena Vance (Executive Brand & Speaker)'
];

export default function CRMView({
  onLogout,
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToAdmin,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToFinance,
  onNavigateToProjects,
  onBackToSite
}) {
  const [metrics, setMetrics] = useState({
    total_pipeline_value: 0,
    active_deals_count: 0,
    new_count: 0,
    contacted_count: 0,
    replied_count: 0,
    discovery_call_count: 0,
    proposal_count: 0,
    negotiation_count: 0,
    won_count: 0,
    won_value: 0,
    lost_count: 0,
    follow_up_required_count: 0,
    win_rate_percentage: 0,
    avg_deal_value: 0,
    followups_due_today: 0,
    followups_overdue: 0,
    breakdown_by_source: {},
    breakdown_by_service: {}
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
  const [drawerTab, setDrawerTab] = useState('intel'); // 'intel' | 'outreach' | 'scorecard' | 'checklist' | 'activities'
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [newActivityType, setNewActivityType] = useState('NOTE');
  const [newActivityText, setNewActivityText] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  // Edit Sales & Intelligence fields in drawer
  const [editEstimatedValue, setEditEstimatedValue] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editSource, setEditSource] = useState('Cold outreach');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editNextFollowUp, setEditNextFollowUp] = useState('');
  const [editDecisionMaker, setEditDecisionMaker] = useState('');
  const [editBudgetFit, setEditBudgetFit] = useState('');
  const [editTimeline, setEditTimeline] = useState('');
  const [editLostReason, setEditLostReason] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editQualificationNotes, setEditQualificationNotes] = useState('');
  const [editProblemNoticed, setEditProblemNoticed] = useState('');
  const [editRelevantTemplate, setEditRelevantTemplate] = useState('');

  // 6-Point Qualification Scorecard State in Drawer
  const [hasRealBusiness, setHasRealBusiness] = useState(false);
  const [hasClearNeed, setHasClearNeed] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);
  const [hasTimeline, setHasTimeline] = useState(false);
  const [isDecisionMaker, setIsDecisionMaker] = useState(false);
  const [respondsCommunication, setRespondsCommunication] = useState(false);

  // Discovery Checklist checked items map { [itemKey]: boolean }
  const [checkedDiscoveryItems, setCheckedDiscoveryItems] = useState({});

  // UI status states
  const [isSavingSalesDetails, setIsSavingSalesDetails] = useState(false);
  const [isCompletingFollowUp, setIsCompletingFollowUp] = useState(false);
  const [drawerSuccessMsg, setDrawerSuccessMsg] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Outreach channel filter inside drawer outreach tab
  const [outreachChannelFilter, setOutreachChannelFilter] = useState('all');

  // Delete modal state
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add Prospect Modal State
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [isCreatingProspect, setIsCreatingProspect] = useState(false);
  const [newProspectData, setNewProspectData] = useState({
    business_name: '',
    business_type: 'Restaurant / Café',
    name: '',
    email: '',
    phone: '',
    website: '',
    problem_noticed: '',
    relevant_template: 'Feast & Flora (Restaurant / Café)',
    service_interest: 'Website / Build',
    budget: '₹20,000 - ₹50,000',
    estimated_value: 34999,
    priority: 'HIGH',
    status: 'NEW',
    source: 'Cold outreach',
    notes: ''
  });

  // Source Analytics panel
  const [showBreakdowns, setShowBreakdowns] = useState(false);

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
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const paramLeadId = urlParams.get('selectedLead');
        if (paramLeadId) {
          const matched = leadsData.find(l => String(l.id) === paramLeadId);
          if (matched) {
            openLeadDrawer(matched);
          }
        }
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

  // Initial URL query params on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const initialStage = urlParams.get('stage');
      const initialFollowup = urlParams.get('followup');
      if (initialStage && STAGES.includes(initialStage.toUpperCase())) {
        setStageFilter(initialStage.toUpperCase());
      }
      if (initialFollowup && FOLLOW_UP_FILTERS.some(f => f.id === initialFollowup.toUpperCase())) {
        setFollowUpFilter(initialFollowup.toUpperCase());
      }
    } catch (e) {
      // safe
    }
  }, []);

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
    setEditSource(lead.source || 'Cold outreach');
    setEditAssignedTo(lead.assigned_to || '');
    setEditDecisionMaker(lead.decision_maker || '');
    setEditBudgetFit(lead.budget_fit || '');
    setEditTimeline(lead.timeline || '');
    setEditLostReason(lead.lost_reason || '');
    setEditNotes(lead.notes || '');
    setEditQualificationNotes(lead.qualification_notes || '');
    setEditProblemNoticed(lead.problem_noticed || '');
    setEditRelevantTemplate(lead.relevant_template || '');

    // Qualification flags
    setHasRealBusiness(Boolean(lead.has_real_business));
    setHasClearNeed(Boolean(lead.has_clear_need));
    setHasBudget(Boolean(lead.has_budget));
    setHasTimeline(Boolean(lead.has_timeline));
    setIsDecisionMaker(Boolean(lead.is_decision_maker));
    setRespondsCommunication(Boolean(lead.responds_communication));

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

  const closeLeadDrawer = () => {
    setSelectedLead(null);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('selectedLead')) {
        url.searchParams.delete('selectedLead');
        const cleanSearch = url.searchParams.toString();
        window.history.replaceState({}, '', url.pathname + (cleanSearch ? '?' + cleanSearch : ''));
      }
    } catch (e) {
      // safe fallback
    }
  };

  const openLeadDrawer = async (lead) => {
    if (!lead || typeof lead !== 'object') return;
    syncSelectedLead(lead);
    setDrawerSuccessMsg(null);
    setLoadingActivities(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('selectedLead', String(lead.id));
      window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString());
    } catch (e) {
      // safe fallback
    }
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
      const newClient = await convertLeadToClient(lead.id);
      await loadCRMData(false);
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...selectedLead, is_converted: true, client_id: newClient.id, client_code: newClient.client_code });
      }
      if (onNavigateToClients) {
        onNavigateToClients(newClient.id);
      }
    } catch (err) {
      alert(`Conversion failed: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Save sales parameters, intelligence & qualification scorecard
  const handleSaveLeadDetails = async (e, customPayload = null) => {
    if (e) e.preventDefault();
    if (!selectedLead) return;

    setIsSavingSalesDetails(true);
    setDrawerSuccessMsg(null);
    try {
      const payload = customPayload || {
        priority: editPriority,
        source: editSource,
        assigned_to: editAssignedTo.trim() || null,
        decision_maker: editDecisionMaker.trim() || null,
        budget_fit: editBudgetFit.trim() || null,
        timeline: editTimeline.trim() || null,
        estimated_value: editEstimatedValue !== '' ? parseFloat(editEstimatedValue) : null,
        next_follow_up_at: editNextFollowUp ? new Date(editNextFollowUp).toISOString() : null,
        lost_reason: selectedLead.status === 'LOST' ? (editLostReason.trim() || null) : null,
        notes: editNotes.trim() || null,
        qualification_notes: editQualificationNotes.trim() || null,
        problem_noticed: editProblemNoticed.trim() || null,
        relevant_template: editRelevantTemplate.trim() || null,
        has_real_business: hasRealBusiness,
        has_clear_need: hasClearNeed,
        has_budget: hasBudget,
        has_timeline: hasTimeline,
        is_decision_maker: isDecisionMaker,
        responds_communication: respondsCommunication
      };

      const updated = await updateLead(selectedLead.id, payload);
      setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
      syncSelectedLead(updated);

      const [newMetrics, actData] = await Promise.all([
        fetchCRMMetrics(),
        fetchLeadActivities(selectedLead.id)
      ]);
      setMetrics(newMetrics);
      setActivities(actData);

      setDrawerSuccessMsg('Lead intelligence and qualification saved.');
      setTimeout(() => setDrawerSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Failed to save details: ${err.message}`);
    } finally {
      setIsSavingSalesDetails(false);
    }
  };

  // Fast toggle scorecard flag & auto-sync
  const handleToggleScorecardFlag = async (field, currentValue, setter) => {
    const nextVal = !currentValue;
    setter(nextVal);
    if (!selectedLead) return;

    const payload = {
      has_real_business: field === 'has_real_business' ? nextVal : hasRealBusiness,
      has_clear_need: field === 'has_clear_need' ? nextVal : hasClearNeed,
      has_budget: field === 'has_budget' ? nextVal : hasBudget,
      has_timeline: field === 'has_timeline' ? nextVal : hasTimeline,
      is_decision_maker: field === 'is_decision_maker' ? nextVal : isDecisionMaker,
      responds_communication: field === 'responds_communication' ? nextVal : respondsCommunication
    };

    try {
      const updated = await updateLead(selectedLead.id, payload);
      setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
      setSelectedLead(updated);
    } catch (err) {
      console.error('Failed to auto-save scorecard:', err);
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
    } catch (err) {
      alert(`Failed to log activity: ${err.message}`);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteLeadConfirm = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLead(leadToDelete.id);
      setLeads(prev => prev.filter(l => l.id !== leadToDelete.id));
      if (selectedLead?.id === leadToDelete.id) {
        setSelectedLead(null);
      }
      setLeadToDelete(null);
      const newMetrics = await fetchCRMMetrics();
      setMetrics(newMetrics);
    } catch (err) {
      alert(`Failed to delete lead: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Add Prospect Submit
  const handleCreateProspect = async (e) => {
    e.preventDefault();
    if (!newProspectData.business_name.trim() || !newProspectData.name.trim()) {
      alert('Please provide Business Name and Contact Person.');
      return;
    }

    setIsCreatingProspect(true);
    try {
      const payload = {
        name: newProspectData.name.trim(),
        email: newProspectData.email.trim() || `outreach+${Date.now()}@thesortedclub.com`,
        phone: newProspectData.phone.trim() || 'Not Provided',
        business_name: newProspectData.business_name.trim(),
        business_type: newProspectData.business_type,
        service_interest: newProspectData.service_interest,
        budget: newProspectData.budget,
        problem: newProspectData.problem_noticed.trim() || 'Identified opportunity for high-converting website redesign.',
        status: newProspectData.status || 'NEW',
        priority: newProspectData.priority || 'HIGH',
        source: newProspectData.source || 'Cold outreach',
        website: newProspectData.website.trim() || null,
        problem_noticed: newProspectData.problem_noticed.trim() || null,
        relevant_template: newProspectData.relevant_template || null,
        estimated_value: newProspectData.estimated_value ? parseFloat(newProspectData.estimated_value) : 34999,
        notes: newProspectData.notes.trim() || null
      };

      const created = await createLead(payload);
      setShowAddProspectModal(false);
      // Reset form
      setNewProspectData({
        business_name: '',
        business_type: 'Restaurant / Café',
        name: '',
        email: '',
        phone: '',
        website: '',
        problem_noticed: '',
        relevant_template: 'Feast & Flora (Restaurant / Café)',
        service_interest: 'Website / Build',
        budget: '₹20,000 - ₹50,000',
        estimated_value: 34999,
        priority: 'HIGH',
        status: 'NEW',
        source: 'Cold outreach',
        notes: ''
      });

      await loadCRMData(false);
      openLeadDrawer(created);
    } catch (err) {
      alert(`Failed to create prospect: ${err.message}`);
    } finally {
      setIsCreatingProspect(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Dynamic Outreach Messages for Selected Lead
  const generatedOutreach = useMemo(() => {
    if (!selectedLead) return [];
    return generateOutreachMessages(selectedLead);
  }, [selectedLead]);

  const filteredOutreach = useMemo(() => {
    if (outreachChannelFilter === 'all') return generatedOutreach;
    return generatedOutreach.filter(m => m.id === outreachChannelFilter || m.channel.toLowerCase().includes(outreachChannelFilter));
  }, [generatedOutreach, outreachChannelFilter]);

  // Current Live Score Calculation
  const currentLiveScore = useMemo(() => {
    return (hasRealBusiness ? 1 : 0) +
      (hasClearNeed ? 1 : 0) +
      (hasBudget ? 1 : 0) +
      (hasTimeline ? 1 : 0) +
      (isDecisionMaker ? 1 : 0) +
      (respondsCommunication ? 1 : 0);
  }, [hasRealBusiness, hasClearNeed, hasBudget, hasTimeline, isDecisionMaker, respondsCommunication]);

  return (
    <div className="admin-app-root">
      <AdminNavbar
        activeTab="crm"
        badge="SALES & OUTREACH PIPELINE"
        onNavigateToCommandCenter={onNavigateToCommandCenter || onNavigateToAdmin}
        onNavigateToInquiries={onNavigateToInquiries || onNavigateToAdmin}
        onNavigateToCRM={onNavigateToCRM}
        onNavigateToClients={onNavigateToClients}
        onNavigateToFinance={onNavigateToFinance}
        onNavigateToProjects={onNavigateToProjects}
        onBackToSite={onBackToSite}
        onLogout={onLogout}
      />

      {/* Main CRM Content */}
      <main className="admin-main-content">
        {/* Page Head */}
        <div className="admin-page-head">
          <div>
            <div className="admin-breadcrumb">
              <span>CUSTOMER ACQUISITION</span> / <span>9-STAGE OUTREACH PIPELINE</span>
            </div>
            <h1>First Customer Outreach & Pipeline</h1>
            <p className="admin-page-desc">
              Structured workspace for cold discovery, multi-channel outreach, 6-point qualification, and deal closing.
            </p>
          </div>

          <div className="admin-head-actions">
            {/* Quick Add Prospect Action */}
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowAddProspectModal(true)}
              style={{ height: '38px', gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>+ Add Prospect</span>
            </button>

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
              type="button"
              className="btn-secondary"
              onClick={() => setShowBreakdowns(!showBreakdowns)}
              style={{ height: '38px' }}
            >
              <PieChart size={15} />
              <span>{showBreakdowns ? 'Hide Channels' : 'Channels'}</span>
            </button>

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
            <div className="crm-metric-sub">{metrics.active_deals_count} active prospects</div>
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
            <div className="crm-metric-sub">Needs action</div>
          </div>
        </div>

        {/* Lead Source & Service Breakdown Panel */}
        {showBreakdowns && (
          <div style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px', color: 'var(--ink)' }}>
                Prospects by Channel
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(metrics.breakdown_by_source || {}).map(([src, count]) => (
                  <div key={src} style={{ background: '#fff', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{src}:</span>
                    <span style={{ fontWeight: 700, color: '#0369a1' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '8px', color: 'var(--ink)' }}>
                Prospects by Service Interest
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(metrics.breakdown_by_service || {}).map(([srv, count]) => (
                  <div key={srv} style={{ background: '#fff', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{srv}:</span>
                    <span style={{ fontWeight: 700, color: '#15803d' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CRM Search & Filters Card */}
        <div className="admin-controls-card" style={{ borderRadius: '10px 10px 0 0' }}>
          <div className="admin-search-box">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search prospects, businesses, problem noticed, templates, notes..."
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
                <option value="ALL">All Stages (9)</option>
                {STAGES.map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
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
              <p>Loading customer acquisition pipeline...</p>
            </div>
          ) : viewMode === 'kanban' ? (
            /* KANBAN VIEW */
            <div className="crm-kanban-board" style={{ overflowX: 'auto', minHeight: '600px' }}>
              {STAGES.map((stage) => {
                const stageLeads = leads.filter(l => l.status === stage);
                const stageTotal = stageLeads.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

                return (
                  <div key={stage} className="crm-kanban-col" style={{ minWidth: '280px' }}>
                    <div className="crm-col-header">
                      <div className="crm-col-title-group">
                        <span className={`crm-col-dot stage-${stage.toLowerCase()}`} />
                        <span className="crm-col-name">{stage.replace(/_/g, ' ')}</span>
                        <span className="crm-col-count">{stageLeads.length}</span>
                      </div>
                      {stageTotal > 0 && (
                        <div className="crm-col-val">{formatCurrency(stageTotal)}</div>
                      )}
                    </div>

                    <div className="crm-col-cards">
                      {stageLeads.length === 0 ? (
                        <div className="crm-empty-col">No prospects in {stage.replace(/_/g, ' ')}</div>
                      ) : (
                        stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            onClick={() => openLeadDrawer(lead)}
                            className={`crm-card ${selectedLead?.id === lead.id ? 'active-card' : ''}`}
                          >
                            <div className="crm-card-head">
                              <span className="crm-card-biz">{lead.business_name}</span>
                              <PriorityBadge priority={lead.priority} size="small" />
                            </div>

                            <div className="crm-card-contact">{lead.name} • {lead.business_type}</div>

                            {/* Qualification Score Pill */}
                            <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <QualificationScoreBadge score={lead.qualification_score || 0} size="small" />
                              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: '#f1f5f9', color: '#475569' }}>
                                {lead.source || 'Outreach'}
                              </span>
                            </div>

                            {/* Problem Noticed snippet */}
                            {lead.problem_noticed && (
                              <div style={{ fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '4px 6px', borderRadius: '4px', margin: '4px 0', border: '1px solid #f1f5f9' }}>
                                🔍 {lead.problem_noticed.length > 55 ? `${lead.problem_noticed.slice(0, 55)}...` : lead.problem_noticed}
                              </div>
                            )}

                            {/* Relevant Blueprint */}
                            {lead.relevant_template && lead.relevant_template !== 'None / Custom' && (
                              <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: 600, margin: '2px 0' }}>
                                📐 {lead.relevant_template.split('(')[0]}
                              </div>
                            )}

                            <div className="crm-card-meta">
                              <span className="crm-card-service">{lead.service_interest}</span>
                              {lead.estimated_value !== null && lead.estimated_value !== undefined && lead.estimated_value > 0 ? (
                                <span className="crm-card-price">{formatCurrency(lead.estimated_value)}</span>
                              ) : (
                                <span className="crm-card-budget">{lead.budget}</span>
                              )}
                            </div>

                            {lead.next_follow_up_at && (
                              <div className="crm-card-followup">
                                <FollowUpBadge dateStr={lead.next_follow_up_at} />
                              </div>
                            )}

                            {/* Card Quick Stage Movement Controls */}
                            <div className="crm-card-footer" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="stage-step-btn"
                                disabled={STAGES.indexOf(lead.status) === 0}
                                onClick={() => handleMoveStageRelative(lead, -1)}
                                title="Move to previous stage"
                              >
                                <ChevronLeft size={14} />
                              </button>
                              <span className="crm-card-stage-label">{lead.status.replace(/_/g, ' ')}</span>
                              <button
                                type="button"
                                className="stage-step-btn"
                                disabled={STAGES.indexOf(lead.status) === STAGES.length - 1}
                                onClick={() => handleMoveStageRelative(lead, 1)}
                                title="Move to next stage"
                              >
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>COMPANY & CONTACT</th>
                    <th>STAGE</th>
                    <th>SCORE</th>
                    <th>SERVICE / BLUEPRINT</th>
                    <th>PRIORITY</th>
                    <th>EST. VALUE</th>
                    <th>NEXT FOLLOW-UP</th>
                    <th>SOURCE</th>
                    <th>CREATED</th>
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
                        <div className="lead-name-cell">
                          <strong>{lead.business_name}</strong>
                          <span className="lead-biz">{lead.name} • {lead.business_type}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={lead.status} />
                      </td>
                      <td>
                        <QualificationScoreBadge score={lead.qualification_score || 0} size="small" />
                      </td>
                      <td>
                        <span className="service-tag">{lead.service_interest}</span>
                        {lead.relevant_template && (
                          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                            {lead.relevant_template.split('(')[0]}
                          </div>
                        )}
                      </td>
                      <td>
                        <PriorityBadge priority={lead.priority} size="small" />
                      </td>
                      <td>
                        <strong style={{ font: '600 13px "Space Grotesk"' }}>
                          {lead.estimated_value ? formatCurrency(lead.estimated_value) : '—'}
                        </strong>
                      </td>
                      <td>
                        <FollowUpBadge dateStr={lead.next_follow_up_at} />
                      </td>
                      <td>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{lead.source}</span>
                      </td>
                      <td>
                        <span className="lead-date">{formatDate(lead.created_at)}</span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Open Prospect Workspace"
                            onClick={() => openLeadDrawer(lead)}
                          >
                            <ChevronRight size={16} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            title="Delete Lead"
                            onClick={() => setLeadToDelete(lead)}
                          >
                            <Trash2 size={14} />
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

      {/* =====================================================================
          LEAD DETAIL DRAWER (PROSPECT INTELLIGENCE & OUTREACH SUITE)
      ===================================================================== */}
      {selectedLead && (
        <div className="drawer-overlay" onClick={closeLeadDrawer}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Prospect Workspace"
            style={{ maxWidth: '780px' }}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <StatusBadge status={selectedLead.status} />
                  <PriorityBadge priority={selectedLead.priority} size="small" />
                  <QualificationScoreBadge score={selectedLead.qualification_score || currentLiveScore} size="small" />
                  {selectedLead.is_converted && (
                    <span className="client-converted-pill">
                      <UserCheck size={12} /> {selectedLead.client_code}
                    </span>
                  )}
                </div>
                <h2>{selectedLead.business_name}</h2>
                <div className="drawer-biz-name">
                  {selectedLead.name} • {selectedLead.business_type} • {selectedLead.email} • {selectedLead.phone}
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={closeLeadDrawer}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notification Banner */}
            {drawerSuccessMsg && (
              <div className="alert-banner success-banner" style={{ margin: '12px 24px 0' }}>
                <CheckCircle size={16} />
                <span>{drawerSuccessMsg}</span>
              </div>
            )}

            {/* 9-Stage Pipeline Stepper Bar */}
            <div className="crm-stage-stepper-bar" style={{ overflowX: 'auto', padding: '10px 24px' }}>
              <span className="section-subtitle" style={{ margin: 0 }}>STAGE:</span>
              <div className="stage-pill-list" style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                {STAGES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`stage-nav-pill ${selectedLead.status === s ? 'active' : ''}`}
                    onClick={() => handleStageChange(selectedLead.id, s)}
                    style={{ whiteSpace: 'nowrap', fontSize: '11px' }}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Navigation Tabs */}
            <div className="crm-drawer-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--line)', background: '#fafafa', padding: '0 24px' }}>
              <button
                type="button"
                className={`crm-drawer-tab-btn ${drawerTab === 'intel' ? 'active' : ''}`}
                onClick={() => setDrawerTab('intel')}
                style={{ padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: drawerTab === 'intel' ? 700 : 500, borderBottom: drawerTab === 'intel' ? '2px solid #10100f' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Compass size={14} />
                <span>Intel & Settings</span>
              </button>

              <button
                type="button"
                className={`crm-drawer-tab-btn ${drawerTab === 'outreach' ? 'active' : ''}`}
                onClick={() => setDrawerTab('outreach')}
                style={{ padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: drawerTab === 'outreach' ? 700 : 500, borderBottom: drawerTab === 'outreach' ? '2px solid #10100f' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Sparkles size={14} color="#7e22ce" />
                <span>Outreach Generator</span>
                <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>7</span>
              </button>

              <button
                type="button"
                className={`crm-drawer-tab-btn ${drawerTab === 'scorecard' ? 'active' : ''}`}
                onClick={() => setDrawerTab('scorecard')}
                style={{ padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: drawerTab === 'scorecard' ? 700 : 500, borderBottom: drawerTab === 'scorecard' ? '2px solid #10100f' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Target size={14} color="#0369a1" />
                <span>Scorecard</span>
                <span style={{ background: currentLiveScore >= 5 ? '#dcfce7' : currentLiveScore >= 3 ? '#fef3c7' : '#fee2e2', color: currentLiveScore >= 5 ? '#15803d' : currentLiveScore >= 3 ? '#b45309' : '#991b1b', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                  {currentLiveScore}/6
                </span>
              </button>

              <button
                type="button"
                className={`crm-drawer-tab-btn ${drawerTab === 'checklist' ? 'active' : ''}`}
                onClick={() => setDrawerTab('checklist')}
                style={{ padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: drawerTab === 'checklist' ? 700 : 500, borderBottom: drawerTab === 'checklist' ? '2px solid #10100f' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <ListChecks size={14} color="#15803d" />
                <span>Discovery Checklist</span>
              </button>

              <button
                type="button"
                className={`crm-drawer-tab-btn ${drawerTab === 'activities' ? 'active' : ''}`}
                onClick={() => setDrawerTab('activities')}
                style={{ padding: '12px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: drawerTab === 'activities' ? 700 : 500, borderBottom: drawerTab === 'activities' ? '2px solid #10100f' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <FileText size={14} />
                <span>Timeline ({activities.length})</span>
              </button>
            </div>

            {/* Drawer Body Content */}
            <div className="drawer-body" style={{ padding: '20px 24px' }}>
              {/* WON OPPORTUNITY CONVERSION PROMPT */}
              {selectedLead.status === 'WON' && (
                <div className="won-conversion-banner" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#15803d', display: 'block' }}>
                        🎉 Opportunity Won!
                      </strong>
                      <span style={{ fontSize: '12px', color: '#166534' }}>
                        {selectedLead.is_converted
                          ? `Active account created with client code ${selectedLead.client_code}.`
                          : 'Convert this won opportunity into an active client account with an automated onboarding checklist.'}
                      </span>
                    </div>
                    {selectedLead.is_converted || selectedLead.client_code ? (
                      <button
                        type="button"
                        onClick={() => onNavigateToClients && onNavigateToClients(selectedLead.client_id)}
                        className="btn-primary btn-sm"
                        style={{ background: '#15803d' }}
                      >
                        <ExternalLink size={13} />
                        <span>Client Workspace</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConvertLead(selectedLead)}
                        disabled={isConverting}
                        className="btn-primary btn-sm"
                        style={{ background: '#15803d' }}
                      >
                        {isConverting ? <Loader2 size={13} className="spinner" /> : <UserCheck size={13} />}
                        <span>Convert to Client</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 1: INTEL & SETTINGS */}
              {drawerTab === 'intel' && (
                <div className="space-y-4">
                  {/* Prospect Intelligence Card */}
                  <div className="drawer-section" style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Compass size={16} color="#0369a1" />
                      <label className="section-subtitle" style={{ margin: 0 }}>PROSPECT AUDIT & INTELLIGENCE</label>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>PROBLEM NOTICED ON CURRENT SITE / SOCIAL</label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Non-mobile friendly menu, slow load speed, no online reservations, outdated 2019 copyright"
                          value={editProblemNoticed}
                          onChange={(e) => setEditProblemNoticed(e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>RELEVANT TEMPLATE BLUEPRINT</label>
                        <select
                          value={editRelevantTemplate}
                          onChange={(e) => setEditRelevantTemplate(e.target.value)}
                          className="custom-select"
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
                        >
                          {TEMPLATE_OPTIONS.map(tpl => (
                            <option key={tpl} value={tpl}>{tpl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>WEBSITE / PROFILE URL</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={selectedLead.website || ''}
                            readOnly
                            style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px', background: '#f8fafc' }}
                          />
                          {selectedLead.website && (
                            <a
                              href={selectedLead.website.startsWith('http') ? selectedLead.website : `https://${selectedLead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary btn-sm"
                              style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>DECISION MAKER</label>
                        <input
                          type="text"
                          placeholder="e.g. Founder / Head of Growth"
                          value={editDecisionMaker}
                          onChange={(e) => setEditDecisionMaker(e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>PROJECT TIMELINE</label>
                        <input
                          type="text"
                          placeholder="e.g. Within 2 weeks"
                          value={editTimeline}
                          onChange={(e) => setEditTimeline(e.target.value)}
                          style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Quick Action Bar */}
                  <div className="drawer-section" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color="#b45309" />
                        <label className="section-subtitle" style={{ margin: 0 }}>FOLLOW-UP CADENCE PRESETS</label>
                      </div>
                      {selectedLead.next_follow_up_at && (
                        <FollowUpBadge dateStr={selectedLead.next_follow_up_at} />
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        disabled={isCompletingFollowUp}
                        onClick={async () => {
                          setIsCompletingFollowUp(true);
                          try {
                            const updated = await completeLeadFollowUp(selectedLead.id, {
                              notes: `Follow-up completed by ${adminUser}.`
                            });
                            setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
                            syncSelectedLead(updated);
                            setDrawerSuccessMsg('Follow-up marked complete and logged.');
                            const [newMetrics, actData] = await Promise.all([
                              fetchCRMMetrics(),
                              fetchLeadActivities(selectedLead.id)
                            ]);
                            setMetrics(newMetrics);
                            setActivities(actData);
                            setTimeout(() => setDrawerSuccessMsg(null), 3500);
                          } catch (err) {
                            alert(`Failed: ${err.message}`);
                          } finally {
                            setIsCompletingFollowUp(false);
                          }
                        }}
                        className="btn-primary btn-sm"
                        style={{ background: '#15803d' }}
                      >
                        <Check size={13} />
                        <span>Mark Follow-Up Complete</span>
                      </button>

                      <button
                        type="button"
                        disabled={isCompletingFollowUp}
                        onClick={async () => {
                          setIsCompletingFollowUp(true);
                          try {
                            const in3Days = new Date();
                            in3Days.setDate(in3Days.getDate() + 3);
                            in3Days.setHours(11, 0, 0, 0);
                            const updated = await completeLeadFollowUp(selectedLead.id, {
                              notes: `Scheduled follow-up in 3 days.`,
                              next_follow_up_at: in3Days.toISOString()
                            });
                            setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
                            syncSelectedLead(updated);
                            setDrawerSuccessMsg('Follow-up set for +3 days.');
                            const [newMetrics, actData] = await Promise.all([
                              fetchCRMMetrics(),
                              fetchLeadActivities(selectedLead.id)
                            ]);
                            setMetrics(newMetrics);
                            setActivities(actData);
                            setTimeout(() => setDrawerSuccessMsg(null), 3500);
                          } catch (err) {
                            alert(`Failed: ${err.message}`);
                          } finally {
                            setIsCompletingFollowUp(false);
                          }
                        }}
                        className="btn-secondary btn-sm"
                      >
                        +3d Follow-up
                      </button>

                      <button
                        type="button"
                        disabled={isCompletingFollowUp}
                        onClick={async () => {
                          setIsCompletingFollowUp(true);
                          try {
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            nextWeek.setHours(11, 0, 0, 0);
                            const updated = await completeLeadFollowUp(selectedLead.id, {
                              notes: `Scheduled follow-up in 7 days.`,
                              next_follow_up_at: nextWeek.toISOString()
                            });
                            setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
                            syncSelectedLead(updated);
                            setDrawerSuccessMsg('Follow-up set for next week (+7d).');
                            const [newMetrics, actData] = await Promise.all([
                              fetchCRMMetrics(),
                              fetchLeadActivities(selectedLead.id)
                            ]);
                            setMetrics(newMetrics);
                            setActivities(actData);
                            setTimeout(() => setDrawerSuccessMsg(null), 3500);
                          } catch (err) {
                            alert(`Failed: ${err.message}`);
                          } finally {
                            setIsCompletingFollowUp(false);
                          }
                        }}
                        className="btn-secondary btn-sm"
                      >
                        +7d Follow-up
                      </button>
                    </div>
                  </div>

                  {/* SALES PARAMETERS & EDIT FORM */}
                  <form onSubmit={handleSaveLeadDetails} className="drawer-section crm-sales-card">
                    <label className="section-subtitle">DEAL PARAMETERS & PIPELINE SETTINGS</label>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Estimated Deal Value (₹ INR)</label>
                        <input
                          type="number"
                          step="1000"
                          min="0"
                          placeholder="e.g. 34999"
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
                          placeholder="e.g. Founder / Sales Lead"
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
                          placeholder="e.g. Budget mismatch, built internally, ghosted after quote"
                          value={editLostReason}
                          onChange={(e) => setEditLostReason(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>Internal Deal Notes</label>
                      <textarea
                        rows={2}
                        placeholder="Key client requirements, stakeholders, objections, next steps..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingSalesDetails}
                      className="btn-primary"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      {isSavingSalesDetails ? 'Saving...' : 'Save Intel & Deal Parameters'}
                    </button>
                  </form>

                  {/* ORIGINAL BRIEF */}
                  <div className="drawer-section">
                    <label className="section-subtitle">ORIGINAL CLIENT BRIEF</label>
                    <div className="drawer-meta-grid">
                      <div className="meta-card">
                        <span className="meta-label">SERVICE</span>
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
                        <span className="meta-label">REGISTERED</span>
                        <strong className="meta-val">{formatDate(selectedLead.created_at)}</strong>
                      </div>
                    </div>

                    <div className="problem-full-box">
                      <div className="problem-header">
                        <strong>Problem / Brief Statement</strong>
                      </div>
                      <p className="problem-text">{selectedLead.problem}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OUTREACH GENERATOR */}
              {drawerTab === 'outreach' && (
                <div className="space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ font: '700 16px "Space Grotesk"', margin: 0 }}>Multi-Channel Outreach Generator</h3>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
                        Tailored messages with dynamic variables ({selectedLead.business_name}, {selectedLead.name}, blueprint demo link).
                      </p>
                    </div>

                    {/* Quick Direct Actions */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <a
                        href={`https://wa.me/${(selectedLead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(filteredOutreach[0]?.message || `Hi ${selectedLead.name}, reaching out from The Sorted Club regarding ${selectedLead.business_name}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary btn-sm"
                        style={{ color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                      >
                        <MessageSquare size={13} />
                        <span>Open WhatsApp</span>
                      </a>

                      <a
                        href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(filteredOutreach.find(m => m.subject)?.subject || `Quick question regarding ${selectedLead.business_name}`)}&body=${encodeURIComponent(filteredOutreach.find(m => m.subject)?.message || '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary btn-sm"
                        style={{ color: '#0369a1', borderColor: '#bae6fd', background: '#f0f9ff' }}
                      >
                        <Mail size={13} />
                        <span>Send Email</span>
                      </a>
                    </div>
                  </div>

                  {/* Channel Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    {[
                      { id: 'all', label: 'All Messages (7)' },
                      { id: 'instagram', label: 'Instagram DM' },
                      { id: 'whatsapp', label: 'WhatsApp' },
                      { id: 'email', label: 'Cold Email' },
                      { id: 'linkedin', label: 'LinkedIn' },
                      { id: 'followup_3d', label: '3-Day Follow-up' },
                      { id: 'followup_7d', label: '7-Day Follow-up' },
                      { id: 'proposal_followup', label: 'Proposal Follow-up' }
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setOutreachChannelFilter(c.id)}
                        className={`filter-pill ${outreachChannelFilter === c.id ? 'active' : ''}`}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {/* Outreach Message Cards */}
                  <div className="outreach-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredOutreach.map((tpl) => (
                      <div
                        key={tpl.id}
                        className="outreach-template-card"
                        style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#334155' }}>
                                {tpl.channel}
                              </span>
                              <strong style={{ fontSize: '14px', font: '700 14px "Space Grotesk"', color: 'var(--ink)' }}>
                                {tpl.title}
                              </strong>
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                              {tpl.purpose}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(tpl.subject ? `Subject: ${tpl.subject}\n\n${tpl.message}` : tpl.message, tpl.id)}
                            className="btn-primary btn-sm"
                            style={{ background: copiedKey === tpl.id ? '#15803d' : '#10100f', color: '#fff', minWidth: '100px' }}
                          >
                            {copiedKey === tpl.id ? (
                              <>
                                <Check size={13} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                        </div>

                        {tpl.subject && (
                          <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                            <strong style={{ color: '#475569' }}>Subject:</strong> {tpl.subject}
                          </div>
                        )}

                        <div style={{ position: 'relative' }}>
                          <textarea
                            rows={tpl.message.split('\n').length > 8 ? 9 : 6}
                            readOnly
                            value={tpl.message}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              background: '#fdfcf9',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '12.5px',
                              fontFamily: 'inherit',
                              lineHeight: 1.5,
                              color: 'var(--ink)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: QUALIFICATION SCORECARD */}
              {drawerTab === 'scorecard' && (
                <div className="space-y-4">
                  {/* Score Meter Header */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Target size={18} color="#0369a1" />
                          <h3 style={{ font: '700 16px "Space Grotesk"', margin: 0 }}>
                            6-Point Lead Qualification Scorecard
                          </h3>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0' }}>
                          Objective criteria to prioritize high-intent prospects and avoid chasing unqualified leads.
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <QualificationScoreBadge score={currentLiveScore} />
                        <span style={{ fontSize: '20px', fontWeight: 800, font: '800 22px "Space Grotesk"', color: 'var(--ink)' }}>
                          {currentLiveScore} / 6
                        </span>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', margin: '12px 0 8px' }}>
                      <div
                        style={{
                          width: `${(currentLiveScore / 6) * 100}%`,
                          height: '100%',
                          background: currentLiveScore >= 5 ? '#15803d' : currentLiveScore >= 3 ? '#b45309' : '#dc2626',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                      <span>Tier C: 0–2 (Cold / Low Intent)</span>
                      <span>Tier B: 3–4 (Qualified Prospect)</span>
                      <span>Tier A: 5–6 (High-Intent Hot Lead)</span>
                    </div>
                  </div>

                  {/* 6 Criteria Toggle Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                    {QUALIFICATION_CRITERIA.map((crit) => {
                      const flagState = crit.id === 'has_real_business' ? hasRealBusiness :
                        crit.id === 'has_clear_need' ? hasClearNeed :
                        crit.id === 'has_budget' ? hasBudget :
                        crit.id === 'has_timeline' ? hasTimeline :
                        crit.id === 'is_decision_maker' ? isDecisionMaker :
                        respondsCommunication;

                      const setter = crit.id === 'has_real_business' ? setHasRealBusiness :
                        crit.id === 'has_clear_need' ? setHasClearNeed :
                        crit.id === 'has_budget' ? setHasBudget :
                        crit.id === 'has_timeline' ? setHasTimeline :
                        crit.id === 'is_decision_maker' ? setIsDecisionMaker :
                        setRespondsCommunication;

                      return (
                        <div
                          key={crit.id}
                          onClick={() => handleToggleScorecardFlag(crit.id, flagState, setter)}
                          style={{
                            background: flagState ? '#f0fdf4' : '#fff',
                            border: `1px solid ${flagState ? '#bbf7d0' : 'var(--line)'}`,
                            borderRadius: '8px',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                border: `2px solid ${flagState ? '#15803d' : '#94a3b8'}`,
                                background: flagState ? '#15803d' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                marginTop: '2px',
                                flexShrink: 0
                              }}
                            >
                              {flagState && <Check size={14} />}
                            </div>

                            <div>
                              <strong style={{ fontSize: '13px', color: flagState ? '#15803d' : 'var(--ink)' }}>
                                {crit.title}
                              </strong>
                              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
                                {crit.description}
                              </p>
                            </div>
                          </div>

                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: flagState ? '#dcfce7' : '#f1f5f9', color: flagState ? '#15803d' : '#64748b', whiteSpace: 'nowrap' }}>
                            {flagState ? '+1 pt (Verified)' : '0 pt'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommendation Action Box */}
                  <div style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
                    <strong style={{ fontSize: '12px', color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>
                      Recommended Next Sales Step:
                    </strong>
                    <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                      {currentLiveScore >= 5
                        ? '🔥 Hot Lead: Immediate 15-min discovery call or proposal presentation walkthrough. Target closing within 7 days.'
                        : currentLiveScore >= 3
                        ? '⚡ Qualified Prospect: Send customized blueprint walkthrough and discovery questionnaire. Address budget or decision-maker clarity.'
                        : '❄️ Cold Prospect: Nurture with value-first teardown or blueprint demo. Do not spend hours drafting custom proposals until qualified.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: DISCOVERY CHECKLIST */}
              {drawerTab === 'checklist' && (
                <div className="space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ font: '700 16px "Space Grotesk"', margin: 0 }}>
                        15-Minute Discovery Call Playbook
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
                        Structured framework to diagnose problems, demonstrate authority, and secure agreement.
                      </p>
                    </div>

                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>
                      6 Structured Phases
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {DISCOVERY_CALL_CHECKLIST_ITEMS.map((phase) => (
                      <div
                        key={phase.phase}
                        style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '14px 16px' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong style={{ font: '700 13px "Space Grotesk"', color: 'var(--ink)' }}>
                            {phase.phase}. {phase.title}
                          </strong>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#f8fafc', color: '#64748b' }}>
                            {phase.items.length} checks
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {phase.items.map((item, idx) => {
                            const itemKey = `${phase.phase}_${idx}`;
                            const isChecked = Boolean(checkedDiscoveryItems[itemKey]);

                            return (
                              <label
                                key={itemKey}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  cursor: 'pointer',
                                  fontSize: '12.5px',
                                  color: isChecked ? '#15803d' : 'var(--ink)',
                                  textDecoration: isChecked ? 'line-through' : 'none'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => setCheckedDiscoveryItems(prev => ({ ...prev, [itemKey]: !isChecked }))}
                                  style={{ marginTop: '3px' }}
                                />
                                <span>{item}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: ACTIVITY TIMELINE & LOGGING */}
              {drawerTab === 'activities' && (
                <div className="space-y-4">
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
                      placeholder={`Log details of ${newActivityType.toLowerCase()} with ${selectedLead.name}...`}
                      value={newActivityText}
                      onChange={(e) => setNewActivityText(e.target.value)}
                      required
                    />

                    <button
                      type="submit"
                      disabled={isAddingActivity || !newActivityText.trim()}
                      className="btn-primary btn-sm"
                      style={{ alignSelf: 'flex-end' }}
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
                      <div className="activity-empty-state">No activities recorded yet.</div>
                    ) : (
                      activities.map((act) => (
                        <div key={act.id} className="activity-item">
                          <div className="act-left">
                            <span className={`act-icon-box act-type-${act.type.toLowerCase()}`}>
                              {act.type === 'CALL' && <PhoneCall size={12} />}
                              {act.type === 'EMAIL' && <Mail size={12} />}
                              {act.type === 'WHATSAPP' && <MessageSquare size={12} />}
                              {act.type === 'MEETING' && <Users size={12} />}
                              {act.type === 'STATUS_CHANGE' && <TrendingUp size={12} />}
                              {act.type === 'NOTE' && <FileText size={12} />}
                            </span>
                          </div>
                          <div className="act-body">
                            <div className="act-header">
                              <span className="act-type-badge">{act.type}</span>
                              <span className="act-author">{act.created_by || 'Admin'}</span>
                              <span className="act-date">{formatDate(act.created_at)}</span>
                            </div>
                            <p className="act-text">{act.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ADD NEW PROSPECT QUICK MODAL
      ===================================================================== */}
      {showAddProspectModal && (
        <div className="drawer-overlay" onClick={() => setShowAddProspectModal(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ font: '700 18px "Space Grotesk"', margin: 0 }}>Register New Outreach Prospect</h2>
                <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '2px 0 0' }}>
                  Add a discovery target to the 9-stage customer acquisition pipeline.
                </p>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowAddProspectModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProspect} className="space-y-4">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Business / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Copper Chimney Bistro"
                    value={newProspectData.business_name}
                    onChange={(e) => setNewProspectData({ ...newProspectData, business_name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Business Category</label>
                  <select
                    value={newProspectData.business_type}
                    onChange={(e) => setNewProspectData({ ...newProspectData, business_type: e.target.value })}
                    className="custom-select"
                  >
                    <option value="Restaurant / Café">Restaurants & Cafés</option>
                    <option value="Coaching / EdTech">Coaching Institutes & Tutors</option>
                    <option value="Salon / Spa">Salons & Spas</option>
                    <option value="Real Estate">Real Estate & Property</option>
                    <option value="E-commerce / DTC">E-commerce & Retail Brands</option>
                    <option value="Local Service">Local Home & Trade Services</option>
                    <option value="Freelancer / Personal Brand">Freelancers & Creators</option>
                    <option value="Healthcare / Clinic">Clinics & Doctors</option>
                    <option value="Other">Other Category</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newProspectData.name}
                    onChange={(e) => setNewProspectData({ ...newProspectData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@copperchimney.in"
                    value={newProspectData.email}
                    onChange={(e) => setNewProspectData({ ...newProspectData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newProspectData.phone}
                    onChange={(e) => setNewProspectData({ ...newProspectData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Website / Social Profile URL</label>
                  <input
                    type="text"
                    placeholder="e.g. instagram.com/copperchimney"
                    value={newProspectData.website}
                    onChange={(e) => setNewProspectData({ ...newProspectData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: 700 }}>Problem / Opportunity Noticed</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Currently uses a slow PDF menu on Google Drive, no online booking widget, poor mobile layout."
                  value={newProspectData.problem_noticed}
                  onChange={(e) => setNewProspectData({ ...newProspectData, problem_noticed: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Recommended Blueprint</label>
                  <select
                    value={newProspectData.relevant_template}
                    onChange={(e) => setNewProspectData({ ...newProspectData, relevant_template: e.target.value })}
                    className="custom-select"
                  >
                    {TEMPLATE_OPTIONS.map(tpl => (
                      <option key={tpl} value={tpl}>{tpl}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Acquisition Channel</label>
                  <select
                    value={newProspectData.source}
                    onChange={(e) => setNewProspectData({ ...newProspectData, source: e.target.value })}
                    className="custom-select"
                  >
                    {SOURCES.filter(s => s !== 'ALL').map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Estimated Deal Value (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="34999"
                    value={newProspectData.estimated_value}
                    onChange={(e) => setNewProspectData({ ...newProspectData, estimated_value: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700 }}>Initial Stage</label>
                  <select
                    value={newProspectData.status}
                    onChange={(e) => setNewProspectData({ ...newProspectData, status: e.target.value })}
                    className="custom-select"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddProspectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProspect}
                  className="btn-primary"
                >
                  {isCreatingProspect ? 'Adding Prospect...' : 'Create & Open Prospect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE LEAD MODAL */}
      {leadToDelete && (
        <div className="drawer-overlay" onClick={() => setLeadToDelete(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 10px' }}>Delete Lead</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px' }}>
              Are you sure you want to permanently delete lead for <strong>{leadToDelete.business_name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setLeadToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                disabled={isDeleting}
                onClick={handleDeleteLeadConfirm}
              >
                {isDeleting ? 'Deleting...' : 'Delete Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
