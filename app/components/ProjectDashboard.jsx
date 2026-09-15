import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  FolderKanban,
  Search,
  RefreshCw,
  LogOut,
  Plus,
  ArrowLeft,
  Calendar,
  Layers,
  Kanban,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  ExternalLink,
  Link as LinkIcon,
  MessageSquare,
  Send,
  Trash2,
  Edit3,
  Filter,
  Check,
  Copy,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  User,
  Tag,
  Flag,
  ListTodo,
  Mail,
  Compass,
  CheckCheck,
  Flame,
  Award
} from 'lucide-react';
import {
  fetchProjects,
  fetchProjectStats,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  fetchProjectActivities,
  createProjectActivity,
  createProjectResource,
  deleteProjectResource,
  fetchProjectBrief,
  updateProjectBrief,
  createProjectMilestone,
  updateProjectMilestone,
  deleteProjectMilestone,
  createProjectApproval,
  deleteProjectApproval,
  createProjectUpdate,
  deleteProjectUpdate,
  updateProjectHandover,
  completeProject,
  fetchClients,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import {
  ProjectStatusBadge,
  PriorityBadge,
  TaskStatusBadge,
  ResourceTypeBadge
} from './StatusBadge';
import EmailComposerModal from './EmailComposerModal';
import NotificationCenter from './NotificationCenter';
import AdminNavbar from './AdminNavbar';

const SERVICE_TYPES = [
  { value: 'ALL', label: 'All Services' },
  { value: 'WEBSITE', label: 'Website / Build' },
  { value: 'LANDING_PAGE', label: 'Landing Page' },
  { value: 'ECOMMERCE', label: 'E-Commerce Store' },
  { value: 'WEB_APP', label: 'Web Application' },
  { value: 'SOFTWARE', label: 'Custom Software' },
  { value: 'AI_AUTOMATION', label: 'AI & Automation' },
  { value: 'MARKETING', label: 'Marketing & Growth' },
  { value: 'RECRUITMENT', label: 'Recruitment & Hiring' },
  { value: 'CUSTOM', label: 'Custom Service' }
];

const PROJECT_STATUSES = [
  'ALL',
  'PLANNED',
  'IN_PROGRESS',
  'WAITING_FOR_CLIENT',
  'BLOCKED',
  'IN_REVIEW',
  'COMPLETED',
  'CANCELLED'
];

export default function ProjectDashboard({
  onLogout,
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToFinance,
  onBackToSite,
  initialSelectedProjectId = null
}) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total_projects: 0,
    planned: 0,
    in_progress: 0,
    waiting_for_client: 0,
    blocked: 0,
    in_review: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    due_this_week: 0,
    high_priority: 0,
    active_build_projects: 0,
    build_projects_due_this_week: 0,
    build_projects_overdue: 0,
    completed_this_month: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [copiedLinkType, setCopiedLinkType] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [assignedFilter, setAssignedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Client Selection for Project Creation
  const [clients, setClients] = useState([]);

  // Selected Project Detail Drawer
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState('overview'); // overview, brief, milestones, tasks, approvals, updates, handover, resources, activities

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState('kickoff');

  // Sub-forms state
  const [newProjectForm, setNewProjectForm] = useState({
    client_id: '',
    name: '',
    description: '',
    service_type: 'WEBSITE',
    priority: 'MEDIUM',
    template_type: 'WEBSITE',
    target_date: '',
    assigned_to: ''
  });

  const [waitingReasonDraft, setWaitingReasonDraft] = useState('');

  // Brief state
  const [briefDraft, setBriefDraft] = useState(null);
  const [savingBrief, setSavingBrief] = useState(false);

  // New Milestone Form
  const [newMilestoneForm, setNewMilestoneForm] = useState({
    title: '',
    description: '',
    status: 'UPCOMING',
    target_date: ''
  });
  const [showNewMilestoneModal, setShowNewMilestoneModal] = useState(false);

  // New Task Form
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigned_to: '',
    due_date: ''
  });
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New Approval Form
  const [newApprovalForm, setNewApprovalForm] = useState({
    title: '',
    item_type: 'DESIGN',
    description: '',
    preview_url: '',
    asset_urls_text: ''
  });
  const [showNewApprovalModal, setShowNewApprovalModal] = useState(false);

  // New Update Form
  const [newUpdateForm, setNewUpdateForm] = useState({
    title: '',
    message: '',
    category: 'PROGRESS',
    customer_visible: true
  });
  const [showNewUpdateModal, setShowNewUpdateModal] = useState(false);

  // New Resource Form
  const [newResourceForm, setNewResourceForm] = useState({
    title: '',
    url: '',
    resource_type: 'DOCUMENT',
    notes: ''
  });
  const [showNewResourceModal, setShowNewResourceModal] = useState(false);

  const adminUser = getAdminUsername();

  useEffect(() => {
    loadData();
    loadClients();
  }, [statusFilter, serviceFilter, priorityFilter, healthFilter, assignedFilter, searchQuery, sortBy]);

  useEffect(() => {
    if (initialSelectedProjectId && projects.length > 0) {
      const match = projects.find(p => String(p.id) === String(initialSelectedProjectId));
      if (match) {
        handleOpenProjectDrawer(match.id);
      }
    }
  }, [initialSelectedProjectId, projects]);

  async function loadData(quiet = false) {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [projData, statsData] = await Promise.all([
        fetchProjects({
          status: statusFilter,
          service_type: serviceFilter,
          priority: priorityFilter,
          health: healthFilter,
          assigned_to: assignedFilter,
          search: searchQuery,
          sort_by: sortBy
        }),
        fetchProjectStats()
      ]);
      setProjects(projData || []);
      setStats(statsData || stats);
    } catch (err) {
      setError(err.message || 'Failed to load project delivery data');
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const data = await fetchClients();
      setClients(data || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  }

  async function handleOpenProjectDrawer(projectId) {
    try {
      const proj = await fetchProject(projectId);
      setSelectedProject(proj);
      setWaitingReasonDraft(proj.waiting_for || '');
      setBriefDraft(proj.brief ? { ...proj.brief } : null);
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    }
  }

  function handleCloseProjectDrawer() {
    setSelectedProject(null);
  }

  function showBannerSuccess(msg) {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    if (!newProjectForm.client_id) {
      setError('Please select a client.');
      return;
    }
    if (!newProjectForm.name.trim()) {
      setError('Project name is required.');
      return;
    }

    try {
      const payload = {
        client_id: parseInt(newProjectForm.client_id, 10),
        name: newProjectForm.name.trim(),
        description: newProjectForm.description.trim() || null,
        service_type: newProjectForm.service_type,
        priority: newProjectForm.priority,
        template_type: newProjectForm.template_type || newProjectForm.service_type,
        target_date: newProjectForm.target_date || null,
        assigned_to: newProjectForm.assigned_to.trim() || null
      };

      const created = await createProject(payload);
      setShowCreateModal(false);
      setNewProjectForm({
        client_id: '',
        name: '',
        description: '',
        service_type: 'WEBSITE',
        priority: 'MEDIUM',
        template_type: 'WEBSITE',
        target_date: '',
        assigned_to: ''
      });
      showBannerSuccess(`🎉 Project ${created.project_code} created with delivery sequence.`);
      await loadData(true);
      handleOpenProjectDrawer(created.id);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    }
  }

  async function handleStatusChange(newStatus) {
    if (!selectedProject) return;
    try {
      const updated = await updateProject(selectedProject.id, { status: newStatus });
      setSelectedProject(updated);
      showBannerSuccess(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  }

  async function handleSaveWaitingReason() {
    if (!selectedProject) return;
    try {
      const updated = await updateProject(selectedProject.id, {
        waiting_for: waitingReasonDraft.trim() || null,
        status: waitingReasonDraft.trim() ? 'WAITING_FOR_CLIENT' : selectedProject.status
      });
      setSelectedProject(updated);
      setShowWaitingModal(false);
      showBannerSuccess('Waiting reason saved & synced to customer portal.');
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Failed to update waiting reason.');
    }
  }

  async function handleSaveBrief() {
    if (!selectedProject || !briefDraft) return;
    setSavingBrief(true);
    try {
      const updated = await updateProjectBrief(selectedProject.id, briefDraft);
      setBriefDraft(updated);
      setSelectedProject({ ...selectedProject, brief: updated });
      showBannerSuccess('Project brief & Discovery specifications saved.');
    } catch (err) {
      setError(err.message || 'Failed to save brief.');
    } finally {
      setSavingBrief(false);
    }
  }

  function handleToggleDiscoveryChecklist(itemKey) {
    if (!briefDraft || !briefDraft.discovery_checklist) return;
    const updatedList = briefDraft.discovery_checklist.map(item => {
      if (item.key === itemKey) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    setBriefDraft({ ...briefDraft, discovery_checklist: updatedList });
  }

  function handleDiscoveryNoteChange(itemKey, notes) {
    if (!briefDraft || !briefDraft.discovery_checklist) return;
    const updatedList = briefDraft.discovery_checklist.map(item => {
      if (item.key === itemKey) {
        return { ...item, notes };
      }
      return item;
    });
    setBriefDraft({ ...briefDraft, discovery_checklist: updatedList });
  }

  async function handleToggleMilestoneStatus(milestone) {
    const nextStatus =
      milestone.status === 'UPCOMING' ? 'IN_PROGRESS' :
      milestone.status === 'IN_PROGRESS' ? 'COMPLETED' :
      milestone.status === 'COMPLETED' ? 'UPCOMING' : 'IN_PROGRESS';

    try {
      await updateProjectMilestone(selectedProject.id, milestone.id, { status: nextStatus });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess(`Milestone '${milestone.title}' marked ${nextStatus.replace(/_/g, ' ')}`);
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Failed to update milestone.');
    }
  }

  async function handleCreateMilestone(e) {
    e.preventDefault();
    if (!newMilestoneForm.title.trim()) return;
    try {
      await createProjectMilestone(selectedProject.id, {
        title: newMilestoneForm.title.trim(),
        description: newMilestoneForm.description.trim() || null,
        status: newMilestoneForm.status,
        target_date: newMilestoneForm.target_date || null,
        order_index: (selectedProject.milestones || []).length
      });
      setShowNewMilestoneModal(false);
      setNewMilestoneForm({ title: '', description: '', status: 'UPCOMING', target_date: '' });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Milestone added.');
    } catch (err) {
      setError(err.message || 'Failed to add milestone.');
    }
  }

  async function handleDeleteMilestone(milestoneId) {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await deleteProjectMilestone(selectedProject.id, milestoneId);
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Milestone removed.');
    } catch (err) {
      setError(err.message || 'Failed to delete milestone.');
    }
  }

  async function handleToggleTaskStatus(task) {
    const nextStatus =
      task.status === 'TODO' ? 'IN_PROGRESS' :
      task.status === 'IN_PROGRESS' ? 'DONE' :
      task.status === 'DONE' ? 'TODO' : 'IN_PROGRESS';

    try {
      await updateProjectTask(selectedProject.id, task.id, { status: nextStatus });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Failed to toggle task.');
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    try {
      await createProjectTask(selectedProject.id, {
        title: newTaskForm.title.trim(),
        description: newTaskForm.description.trim() || null,
        priority: newTaskForm.priority,
        assigned_to: newTaskForm.assigned_to.trim() || null,
        due_date: newTaskForm.due_date || null
      });
      setShowNewTaskModal(false);
      setNewTaskForm({ title: '', description: '', priority: 'MEDIUM', assigned_to: '', due_date: '' });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Task created.');
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    }
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteProjectTask(selectedProject.id, taskId);
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Task deleted.');
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Failed to delete task.');
    }
  }

  async function handleCreateApproval(e) {
    e.preventDefault();
    if (!newApprovalForm.title.trim()) return;

    let assetUrls = [];
    if (newApprovalForm.asset_urls_text.trim()) {
      assetUrls = newApprovalForm.asset_urls_text
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.startsWith('http://') || u.startsWith('https://'));
    }

    try {
      await createProjectApproval(selectedProject.id, {
        title: newApprovalForm.title.trim(),
        item_type: newApprovalForm.item_type,
        description: newApprovalForm.description.trim() || null,
        preview_url: newApprovalForm.preview_url.trim() || null,
        asset_urls: assetUrls
      });
      setShowNewApprovalModal(false);
      setNewApprovalForm({ title: '', item_type: 'DESIGN', description: '', preview_url: '', asset_urls_text: '' });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Client approval link created.');
    } catch (err) {
      setError(err.message || 'Failed to create approval.');
    }
  }

  async function handleDeleteApproval(approvalId) {
    if (!window.confirm('Delete this approval request?')) return;
    try {
      await deleteProjectApproval(selectedProject.id, approvalId);
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Approval request removed.');
    } catch (err) {
      setError(err.message || 'Failed to delete approval.');
    }
  }

  async function handleCreateUpdate(e) {
    e.preventDefault();
    if (!newUpdateForm.title.trim() || !newUpdateForm.message.trim()) return;
    try {
      await createProjectUpdate(selectedProject.id, {
        title: newUpdateForm.title.trim(),
        message: newUpdateForm.message.trim(),
        category: newUpdateForm.category,
        customer_visible: newUpdateForm.customer_visible
      });
      setShowNewUpdateModal(false);
      setNewUpdateForm({ title: '', message: '', category: 'PROGRESS', customer_visible: true });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Update published.');
    } catch (err) {
      setError(err.message || 'Failed to publish update.');
    }
  }

  async function handleDeleteUpdate(updateId) {
    if (!window.confirm('Delete this update?')) return;
    try {
      await deleteProjectUpdate(selectedProject.id, updateId);
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Update deleted.');
    } catch (err) {
      setError(err.message || 'Failed to delete update.');
    }
  }

  async function handleToggleHandoverItem(itemKey) {
    if (!selectedProject || !selectedProject.handover_checklist) return;
    const updatedList = selectedProject.handover_checklist.map(item => {
      if (item.key === itemKey) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    try {
      const updated = await updateProjectHandover(selectedProject.id, {
        handover_checklist: updatedList
      });
      setSelectedProject(updated);
    } catch (err) {
      setError(err.message || 'Failed to update handover checklist.');
    }
  }

  async function handleSaveHandoverNotes(notes) {
    try {
      const updated = await updateProjectHandover(selectedProject.id, {
        handover_notes: notes
      });
      setSelectedProject(updated);
      showBannerSuccess('Handover notes saved.');
    } catch (err) {
      setError(err.message || 'Failed to save handover notes.');
    }
  }

  async function handleTriggerProjectCompletion() {
    if (!selectedProject) return;
    if (!window.confirm('Mark this project as COMPLETED? All tasks and handover verification must be finished.')) return;
    try {
      const completed = await completeProject(selectedProject.id);
      setSelectedProject(completed);
      showBannerSuccess(`🎉 Project ${completed.project_code} successfully delivered & marked COMPLETED!`);
      await loadData(true);
    } catch (err) {
      setError(err.message || 'Cannot complete project. Verify all tasks and handover items.');
    }
  }

  async function handleCreateResource(e) {
    e.preventDefault();
    if (!newResourceForm.title.trim() || !newResourceForm.url.trim()) return;
    try {
      await createProjectResource(selectedProject.id, {
        title: newResourceForm.title.trim(),
        url: newResourceForm.url.trim(),
        resource_type: newResourceForm.resource_type,
        notes: newResourceForm.notes.trim() || null
      });
      setShowNewResourceModal(false);
      setNewResourceForm({ title: '', url: '', resource_type: 'DOCUMENT', notes: '' });
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Resource attached.');
    } catch (err) {
      setError(err.message || 'Failed to add resource.');
    }
  }

  async function handleDeleteResource(resourceId) {
    if (!window.confirm('Delete this resource link?')) return;
    try {
      await deleteProjectResource(selectedProject.id, resourceId);
      const ref = await fetchProject(selectedProject.id);
      setSelectedProject(ref);
      showBannerSuccess('Resource removed.');
    } catch (err) {
      setError(err.message || 'Failed to delete resource.');
    }
  }

  function handleCopyLink(type, token) {
    const origin = window.location.origin;
    const url = type === 'project'
      ? `${origin}/project/${token}`
      : `${origin}/project-review/${token}`;

    navigator.clipboard.writeText(url);
    setCopiedLinkType(type);
    showBannerSuccess(`📋 Copied ${type === 'project' ? 'Customer Portal' : 'Review'} Link!`);
    setTimeout(() => setCopiedLinkType(null), 3000);
  }

  function formatDate(d) {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '—';
    }
  }

  // Email Templates for Client Communication
  const emailTemplates = useMemo(() => {
    if (!selectedProject) return {};
    const origin = window.location.origin;
    const projectUrl = `${origin}/project/${selectedProject.public_token}`;
    const clientName = selectedProject.client_name || 'Client';
    const bizName = selectedProject.client_business_name || 'Company';

    return {
      kickoff: {
        subject: `Kickoff: ${selectedProject.name} [${selectedProject.project_code}]`,
        body: `Hi ${clientName},\n\nWe are thrilled to officially begin work on ${selectedProject.name}!\n\nOur team has initialized your dedicated workspace. You can track real-time delivery progress, milestone dates, and review deliverables at your private link below:\n\n${projectUrl}\n\nOur discovery phase is already underway. We will reach out shortly for any asset inputs.\n\nWarm regards,\nThe Sorted Club Delivery Team`
      },
      design_review: {
        subject: `Deliverable Ready for Review: ${selectedProject.name}`,
        body: `Hi ${clientName},\n\nWe have completed the latest design deliverables for ${selectedProject.name}.\n\nPlease review and submit your official sign-off or requested adjustments here:\n\n${projectUrl}\n\nLet us know if you have any questions!\n\nBest regards,\nThe Sorted Club Team`
      },
      revision_round: {
        subject: `Revision Update: ${selectedProject.name}`,
        body: `Hi ${clientName},\n\nOur engineering and design team has implemented the requested adjustments for ${selectedProject.name}.\n\nYou can review the latest updates live at:\n\n${projectUrl}\n\nLooking forward to your feedback!\n\nBest,\nThe Sorted Club Team`
      },
      final_approval: {
        subject: `Final Review & Launch Sign-off: ${selectedProject.name}`,
        body: `Hi ${clientName},\n\n${selectedProject.name} is complete and fully verified across desktop, mobile, and functional QA.\n\nPlease review the final build and submit launch authorization:\n\n${projectUrl}\n\nOnce approved, our team will proceed directly with production DNS and domain deployment.\n\nBest regards,\nThe Sorted Club Team`
      },
      launch: {
        subject: `🚀 ${selectedProject.name} is Live on Production!`,
        body: `Hi ${clientName},\n\nWe are delighted to announce that ${selectedProject.name} is officially live!\n\nAll DNS records, SSL certificates, lead routing, and analytics have been verified.\n\nAccess your live system and handover checklist here:\n\n${projectUrl}\n\nCongratulations on the launch!\n\nThe Sorted Club Team`
      },
      handover: {
        subject: `Handover & Access Delivery: ${selectedProject.name}`,
        body: `Hi ${clientName},\n\nAll project milestones for ${selectedProject.name} are completed.\n\nSecurity notice: All administrative credentials and ownership transfers have been transferred via our secure password manager.\n\nYou can view complete project documentation and signoff here:\n\n${projectUrl}\n\nThank you for partnering with The Sorted Club!\n\nWarm regards,\nThe Sorted Club Team`
      }
    };
  }, [selectedProject]);

  return (
    <div className="admin-app-root">
      <AdminNavbar
        activeTab="projects"
        badge="BUILD DELIVERY ENGINE"
        onNavigateToCommandCenter={onNavigateToCommandCenter}
        onNavigateToInquiries={onNavigateToInquiries}
        onNavigateToCRM={onNavigateToCRM}
        onNavigateToClients={onNavigateToClients}
        onNavigateToFinance={onNavigateToFinance}
        onNavigateToProjects={() => {}}
        onBackToSite={onBackToSite}
        onLogout={onLogout}
      />

      {/* Main Container */}
      <main className="admin-main-content">
        {/* Banner Messages */}
        {actionSuccess && (
          <div className="alert-banner success-banner" style={{ margin: '0 0 16px', borderRadius: '8px' }}>
            <CheckCircle size={18} />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="alert-banner error-banner" style={{ margin: '0 0 16px', borderRadius: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Page Head */}
        <div className="admin-page-head">
          <div>
            <div className="admin-breadcrumb">
              <span>ADMINISTRATION</span> / <span>SERVICE DELIVERY</span>
            </div>
            <h1>Build Delivery & Execution Engine</h1>
            <p className="admin-page-desc">
              Manage client projects, milestones, 36-task delivery sequences, client sign-offs, and handover protocols.
            </p>
          </div>

          <div className="admin-head-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              <span>New Build Project</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => loadData()}
            >
              <RefreshCw size={16} className={loading ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="crm-metrics-grid">
          <div className="crm-metric-card highlight-metric">
            <div className="crm-metric-label">ACTIVE BUILD ENGAGEMENTS</div>
            <div className="crm-metric-val">{stats.active_build_projects || stats.in_progress}</div>
            <div className="crm-metric-sub">In active execution</div>
          </div>

          <div
            className={`crm-metric-card ${statusFilter === 'IN_PROGRESS' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          >
            <div className="crm-metric-label" style={{ color: '#0369a1' }}>IN DEVELOPMENT & QA</div>
            <div className="crm-metric-val" style={{ color: '#0369a1' }}>{stats.in_progress}</div>
            <div className="crm-metric-sub">Active sprints</div>
          </div>

          <div
            className={`crm-metric-card ${statusFilter === 'WAITING_FOR_CLIENT' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === 'WAITING_FOR_CLIENT' ? 'ALL' : 'WAITING_FOR_CLIENT')}
          >
            <div className="crm-metric-label" style={{ color: '#c2410c' }}>WAITING ON CLIENT</div>
            <div className="crm-metric-val" style={{ color: '#c2410c' }}>{stats.waiting_for_client}</div>
            <div className="crm-metric-sub">Pending feedback / inputs</div>
          </div>

          <div
            className={`crm-metric-card ${healthFilter === 'OVERDUE' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setHealthFilter(healthFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          >
            <div className="crm-metric-label" style={{ color: '#dc2626' }}>ATTENTION / OVERDUE</div>
            <div className="crm-metric-val" style={{ color: '#dc2626' }}>{stats.overdue}</div>
            <div className="crm-metric-sub">Past target delivery date</div>
          </div>

          <div
            className={`crm-metric-card ${statusFilter === 'COMPLETED' ? 'active-metric' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          >
            <div className="crm-metric-label" style={{ color: '#15803d' }}>COMPLETED THIS MONTH</div>
            <div className="crm-metric-val" style={{ color: '#15803d' }}>{stats.completed_this_month || stats.completed}</div>
            <div className="crm-metric-sub">Handover verified</div>
          </div>
        </div>

        {/* Controls Card */}
        <div className="admin-controls-card">
          <div className="admin-search-box">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by project code (SC-PROJ-...), name, client company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
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
            {/* Status Filter Pills */}
            <div className="status-filter-pills">
              {PROJECT_STATUSES.map(st => (
                <button
                  key={st}
                  type="button"
                  className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'ALL' ? 'All Statuses' : st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Service Filter */}
            <div className="service-filter-box">
              <span className="filter-label">Service:</span>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="admin-select"
              >
                {SERVICE_TYPES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="service-filter-box">
              <span className="filter-label">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Health Filter */}
            <div className="service-filter-box">
              <span className="filter-label">Health:</span>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Health</option>
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="BLOCKED">Blocked</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="service-filter-box" style={{ marginLeft: 'auto' }}>
              <span className="filter-label">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="target_date">Target Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>CODE</th>
                  <th>PROJECT & CLIENT</th>
                  <th>SERVICE TYPE</th>
                  <th style={{ width: '120px' }}>STATUS</th>
                  <th style={{ width: '100px' }}>HEALTH</th>
                  <th style={{ width: '160px' }}>PROGRESS</th>
                  <th>TARGET DATE</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="admin-loading-state">
                      <Loader2 className="spinner" size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                      <p>Loading projects...</p>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="admin-empty-state">
                      <div className="empty-icon-box">
                        <FolderKanban size={28} color="var(--muted)" />
                      </div>
                      <h3>No projects found</h3>
                      <p>No project engagements match the selected filters.</p>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ marginTop: '16px' }}
                        onClick={() => setShowCreateModal(true)}
                      >
                        <Plus size={14} />
                        <span>Create Project</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  projects.map(proj => (
                    <tr
                      key={proj.id}
                      className="lead-row"
                      onClick={() => handleOpenProjectDrawer(proj.id)}
                    >
                      <td>
                        <span className="client-code-tag">{proj.project_code}</span>
                      </td>
                      <td>
                        <div className="lead-name-cell">
                          <strong>{proj.name}</strong>
                          <span className="lead-biz">{proj.client_business_name || proj.client_name || `Client #${proj.client_id}`}</span>
                          {proj.waiting_for && proj.status === 'WAITING_FOR_CLIENT' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff7ed', border: '1px solid #ffedd5', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#c2410c', marginTop: '4px', width: 'fit-content' }}>
                              <AlertTriangle size={10} /> Waiting: {proj.waiting_for}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="service-tag">{proj.service_type.replace(/_/g, ' ')}</span>
                      </td>
                      <td>
                        <ProjectStatusBadge status={proj.status} size="small" />
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            background:
                              proj.health === 'ON_TRACK' ? '#f0fdf4' :
                              proj.health === 'AT_RISK' ? '#fffbeb' :
                              proj.health === 'BLOCKED' ? '#fff1f2' : '#fef2f2',
                            color:
                              proj.health === 'ON_TRACK' ? '#15803d' :
                              proj.health === 'AT_RISK' ? '#b45309' :
                              proj.health === 'BLOCKED' ? '#be123c' : '#b91c1c',
                            border: `1px solid ${
                              proj.health === 'ON_TRACK' ? '#bbf7d0' :
                              proj.health === 'AT_RISK' ? '#fde68a' :
                              proj.health === 'BLOCKED' ? '#fecdd3' : '#fecaca'
                            }`
                          }}
                        >
                          {proj.health.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="client-progress-cell">
                          <div className="progress-bar-track">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${proj.progress_percentage}%`,
                                backgroundColor: proj.progress_percentage === 100 ? '#15803d' : '#0369a1'
                              }}
                            />
                          </div>
                          <div className="progress-label-row">
                            <span className="progress-pct">{proj.progress_percentage}%</span>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                              {proj.completed_tasks_count}/{proj.total_tasks_count} tasks
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="lead-date" style={{ color: proj.is_overdue ? '#dc2626' : undefined, fontWeight: proj.is_overdue ? 700 : 400 }}>
                          {formatDate(proj.target_date)}
                        </div>
                        {proj.is_overdue && (
                          <span style={{ fontSize: '9px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                            OVERDUE
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            title="Copy Public Project Link"
                            onClick={() => handleCopyLink('project', proj.public_token)}
                          >
                            <LinkIcon size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            title="View Project Workspace"
                            onClick={() => handleOpenProjectDrawer(proj.id)}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* =====================================================================
          PROJECT DETAIL DRAWER
      ===================================================================== */}
      {selectedProject && (
        <div className="drawer-overlay" onClick={handleCloseProjectDrawer}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Project Workspace"
            style={{ maxWidth: '880px' }}
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="client-code-tag">{selectedProject.project_code}</span>
                  <ProjectStatusBadge status={selectedProject.status} size="small" />
                  <PriorityBadge priority={selectedProject.priority} size="small" />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: selectedProject.health === 'ON_TRACK' ? '#f0fdf4' : '#fffbeb',
                      color: selectedProject.health === 'ON_TRACK' ? '#15803d' : '#b45309',
                      border: '1px solid currentColor'
                    }}
                  >
                    {selectedProject.health.replace(/_/g, ' ')}
                  </span>
                </div>
                <h2>{selectedProject.name}</h2>
                <div className="drawer-biz-name">
                  Client: <strong>{selectedProject.client_business_name || selectedProject.client_name}</strong> • Pillar:{' '}
                  <strong>{selectedProject.service_type}</strong>
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={handleCloseProjectDrawer}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Waiting State Banner */}
            {selectedProject.status === 'WAITING_FOR_CLIENT' && (
              <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={20} color="#c2410c" />
                  <div>
                    <strong style={{ display: 'block', fontSize: '12px', color: '#c2410c', textTransform: 'uppercase' }}>
                      Waiting on Client
                    </strong>
                    <span style={{ fontSize: '13px', color: '#9a3412' }}>
                      {selectedProject.waiting_for || 'Client inputs needed to proceed.'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setShowWaitingModal(true)}
                >
                  Edit Reason
                </button>
              </div>
            )}

            {/* Quick Status Bar */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--line)', background: '#faf8f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="section-subtitle" style={{ margin: 0 }}>STAGE:</span>
                {['PLANNED', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'IN_REVIEW', 'COMPLETED'].map(st => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill ${selectedProject.status === st ? 'active' : ''}`}
                    style={{ fontSize: '10px', padding: '3px 8px' }}
                    onClick={() => handleStatusChange(st)}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => handleCopyLink('project', selectedProject.public_token)}
                >
                  <LinkIcon size={12} />
                  <span>Copy Customer Portal Link</span>
                </button>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => setShowEmailComposer(true)}
                >
                  <Mail size={12} />
                  <span>Compose Client Email</span>
                </button>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="crm-drawer-tabs" style={{ padding: '0 24px', borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('overview')}
              >
                <FolderKanban size={14} />
                <span>Overview</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'brief' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('brief')}
              >
                <Compass size={14} />
                <span>Brief & Discovery</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'milestones' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('milestones')}
              >
                <Layers size={14} />
                <span>Milestones ({selectedProject.milestones ? selectedProject.milestones.length : 0})</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('tasks')}
              >
                <ListTodo size={14} />
                <span>Tasks ({selectedProject.tasks ? selectedProject.tasks.length : 0})</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'approvals' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('approvals')}
              >
                <CheckCheck size={14} />
                <span>Client Approvals ({selectedProject.approvals ? selectedProject.approvals.length : 0})</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'updates' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('updates')}
              >
                <Flame size={14} />
                <span>Announcements ({selectedProject.updates ? selectedProject.updates.length : 0})</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'handover' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('handover')}
              >
                <Award size={14} />
                <span>Handover & Sign-off</span>
              </button>
              <button
                type="button"
                className={`crm-drawer-tab ${activeDrawerTab === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveDrawerTab('resources')}
              >
                <LinkIcon size={14} />
                <span>Links & Assets</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="drawer-body">
              {/* TAB 1: OVERVIEW */}
              {activeDrawerTab === 'overview' && (
                <div className="drawer-section space-y-6">
                  {/* Commercial Links Connection */}
                  <div style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
                    <label className="section-subtitle" style={{ margin: '0 0 10px' }}>LINKED COMMERCIAL RECORDS</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', fontWeight: 600 }}>PROPOSAL</span>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                          {selectedProject.proposal_number || 'No Proposal Linked'}
                        </strong>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', fontWeight: 600 }}>CONTRACT</span>
                        <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                          {selectedProject.contract_number || 'No Contract Linked'}
                        </strong>
                      </div>
                      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', fontWeight: 600 }}>INVOICE & PAYMENT</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                            {selectedProject.invoice_number || '—'}
                          </strong>
                          {selectedProject.invoice_payment_status && (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#f0fdf4', color: '#15803d' }}>
                              {selectedProject.invoice_payment_status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Portal Share Box */}
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Live Customer Project Hub URL</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Secured with URL-safe random token</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/project/${selectedProject.public_token}`}
                        style={{ flex: 1, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#334155' }}
                      />
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => handleCopyLink('project', selectedProject.public_token)}
                      >
                        <Copy size={13} />
                        <span>Copy URL</span>
                      </button>
                      <a
                        href={`/project/${selectedProject.public_token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary btn-sm"
                      >
                        <ExternalLink size={13} />
                        <span>Preview</span>
                      </a>
                    </div>
                  </div>

                  {/* Execution Progress Summary */}
                  <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Execution Progress ({selectedProject.progress_percentage}%)</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        {selectedProject.completed_tasks_count} / {selectedProject.total_tasks_count} tasks completed
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${selectedProject.progress_percentage}%`,
                          background: '#15803d',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BRIEF & DISCOVERY */}
              {activeDrawerTab === 'brief' && briefDraft && (
                <div className="drawer-section space-y-6">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <label className="section-subtitle" style={{ margin: 0 }}>DISCOVERY SPECIFICATIONS</label>
                      <h3 style={{ font: '700 16px "Space Grotesk"', margin: '2px 0 0' }}>Build Project Brief</h3>
                    </div>
                    <button
                      type="button"
                      disabled={savingBrief}
                      className="btn-primary btn-sm"
                      onClick={handleSaveBrief}
                    >
                      {savingBrief ? <Loader2 size={13} className="spinner" /> : <Check size={13} />}
                      <span>Save Specifications</span>
                    </button>
                  </div>

                  {/* 12-Point Interactive Discovery Checklist */}
                  <div style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
                    <strong style={{ fontSize: '13px', display: 'block', marginBottom: '12px', color: 'var(--ink)' }}>
                      12-Point Build Discovery Checklist
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '10px' }}>
                      {(briefDraft.discovery_checklist || []).map(item => (
                        <div
                          key={item.key}
                          style={{
                            padding: '10px 12px',
                            background: item.completed ? '#f0fdf4' : '#fff',
                            border: `1px solid ${item.completed ? '#bbf7d0' : 'var(--line)'}`,
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: item.completed ? '#15803d' : 'var(--ink)' }}>
                            <input
                              type="checkbox"
                              checked={!!item.completed}
                              onChange={() => handleToggleDiscoveryChecklist(item.key)}
                            />
                            <span>{item.title}</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Add scope note..."
                            value={item.notes || ''}
                            onChange={(e) => handleDiscoveryNoteChange(item.key, e.target.value)}
                            style={{ width: '100%', fontSize: '11px', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Structured Brief Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px' }}>
                    <div>
                      <label className="filter-label">Primary Business Goal</label>
                      <input
                        type="text"
                        value={briefDraft.primary_business_goal || ''}
                        onChange={(e) => setBriefDraft({ ...briefDraft, primary_business_goal: e.target.value })}
                        className="admin-select"
                        style={{ width: '100%' }}
                        placeholder="e.g. Inbound Enterprise Demos"
                      />
                    </div>
                    <div>
                      <label className="filter-label">Website Domain / Target URL</label>
                      <input
                        type="text"
                        value={briefDraft.website_domain || ''}
                        onChange={(e) => setBriefDraft({ ...briefDraft, website_domain: e.target.value })}
                        className="admin-select"
                        style={{ width: '100%' }}
                        placeholder="e.g. company.com"
                      />
                    </div>
                    <div>
                      <label className="filter-label">Brand Guidelines / Figma URL</label>
                      <input
                        type="text"
                        value={briefDraft.brand_guidelines_url || ''}
                        onChange={(e) => setBriefDraft({ ...briefDraft, brand_guidelines_url: e.target.value })}
                        className="admin-select"
                        style={{ width: '100%' }}
                        placeholder="https://figma.com/..."
                      />
                    </div>
                    <div>
                      <label className="filter-label">CMS / Tech Stack Requirement</label>
                      <input
                        type="text"
                        value={briefDraft.cms_requirement || ''}
                        onChange={(e) => setBriefDraft({ ...briefDraft, cms_requirement: e.target.value })}
                        className="admin-select"
                        style={{ width: '100%' }}
                        placeholder="e.g. Custom React + Headless CMS"
                      />
                    </div>
                    <div>
                      <label className="filter-label">Required Integrations & Analytics</label>
                      <input
                        type="text"
                        value={briefDraft.integrations_needed || ''}
                        onChange={(e) => setBriefDraft({ ...briefDraft, integrations_needed: e.target.value })}
                        className="admin-select"
                        style={{ width: '100%' }}
                        placeholder="e.g. HubSpot, Stripe, Segment, Google Analytics 4"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MILESTONES */}
              {activeDrawerTab === 'milestones' && (
                <div className="drawer-section space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="section-subtitle" style={{ margin: 0 }}>DELIVERY ROADMAP</label>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setShowNewMilestoneModal(true)}
                    >
                      <Plus size={13} />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(selectedProject.milestones || []).map((ms, idx) => (
                      <div
                        key={ms.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: ms.status === 'COMPLETED' ? '#f0fdf4' : ms.status === 'IN_PROGRESS' ? '#f8fafc' : '#fff',
                          border: `1px solid ${ms.status === 'COMPLETED' ? '#bbf7d0' : ms.status === 'IN_PROGRESS' ? '#38bdf8' : 'var(--line)'}`,
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ font: '700 12px "Space Grotesk"', color: 'var(--muted)', width: '20px' }}>
                            #{idx + 1}
                          </span>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{ms.title}</strong>
                            {ms.description && <p style={{ fontSize: '11px', color: 'var(--muted)', margin: '2px 0 0' }}>{ms.description}</p>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleMilestoneStatus(ms)}
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              background:
                                ms.status === 'COMPLETED' ? '#15803d' :
                                ms.status === 'IN_PROGRESS' ? '#0369a1' : '#f1f5f9',
                              color:
                                ms.status === 'COMPLETED' || ms.status === 'IN_PROGRESS' ? '#fff' : '#475569',
                              border: 'none'
                            }}
                          >
                            {ms.status.replace(/_/g, ' ')}
                          </button>
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            onClick={() => handleDeleteMilestone(ms.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TASKS */}
              {activeDrawerTab === 'tasks' && (
                <div className="drawer-section space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="section-subtitle" style={{ margin: 0 }}>EXECUTION CHECKLIST ({selectedProject.tasks ? selectedProject.tasks.length : 0})</label>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => setShowNewTaskModal(true)}
                    >
                      <Plus size={13} />
                      <span>Add Task</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(selectedProject.tasks || []).map((t, idx) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: t.status === 'DONE' ? '#f8fafc' : '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(t)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {t.status === 'DONE' ? (
                              <CheckCircle size={18} color="#15803d" />
                            ) : (
                              <Square size={18} color="#94a3b8" />
                            )}
                          </button>
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: t.status === 'DONE' ? 'var(--muted)' : 'var(--ink)', textDecoration: t.status === 'DONE' ? 'line-through' : 'none' }}>
                              {t.title}
                            </span>
                            {t.description && (
                              <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>{t.description}</p>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PriorityBadge priority={t.priority} size="small" />
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            onClick={() => handleDeleteTask(t.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: APPROVALS */}
              {activeDrawerTab === 'approvals' && (
                <div className="drawer-section space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="section-subtitle" style={{ margin: 0 }}>CLIENT SIGN-OFFS & REVIEW LINKS</label>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => setShowNewApprovalModal(true)}
                    >
                      <Plus size={13} />
                      <span>Request Approval</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(selectedProject.approvals || []).map(appr => (
                      <div
                        key={appr.id}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: '8px',
                          padding: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                              {appr.item_type}
                            </span>
                            <strong style={{ fontSize: '14px', display: 'block', marginTop: '4px', color: 'var(--ink)' }}>
                              {appr.title}
                            </strong>
                            {appr.description && <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0' }}>{appr.description}</p>}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => handleCopyLink('approval', appr.public_token)}
                            >
                              <Copy size={12} />
                              <span>Copy Review Link</span>
                            </button>
                            <button
                              type="button"
                              className="btn-icon text-danger"
                              onClick={() => handleDeleteApproval(appr.id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            Status: <strong style={{ color: appr.status === 'APPROVED' ? '#15803d' : appr.status === 'CHANGES_REQUESTED' ? '#c2410c' : '#0369a1' }}>{appr.status.replace(/_/g, ' ')}</strong>
                          </span>
                          {appr.decision_name && (
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              Decided by: {appr.decision_name}
                            </span>
                          )}
                        </div>
                        {appr.decision_comment && (
                          <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', color: '#334155', fontStyle: 'italic' }}>
                            "{appr.decision_comment}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: UPDATES */}
              {activeDrawerTab === 'updates' && (
                <div className="drawer-section space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="section-subtitle" style={{ margin: 0 }}>CUSTOMER FEED & ANNOUNCEMENTS</label>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => setShowNewUpdateModal(true)}
                    >
                      <Plus size={13} />
                      <span>Post Announcement</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(selectedProject.updates || []).map(upd => (
                      <div
                        key={upd.id}
                        style={{
                          background: '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: '8px',
                          padding: '14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309' }}>
                              {upd.category}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              {upd.customer_visible ? 'Visible to Customer' : 'Internal Only'}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            onClick={() => handleDeleteUpdate(upd.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <strong style={{ fontSize: '14px', display: 'block', margin: '6px 0 4px', color: 'var(--ink)' }}>
                          {upd.title}
                        </strong>
                        <p style={{ fontSize: '12px', color: '#334155', whiteSpace: 'pre-wrap', margin: 0 }}>
                          {upd.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: HANDOVER */}
              {activeDrawerTab === 'handover' && (
                <div className="drawer-section space-y-6">
                  <div>
                    <label className="section-subtitle" style={{ margin: 0 }}>HANDOVER VERIFICATION PROTOCOL</label>
                    <h3 style={{ font: '700 16px "Space Grotesk"', margin: '2px 0 0' }}>11-Point Build Handover Protocol</h3>
                  </div>

                  <div style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px' }}>
                    <div className="space-y-2">
                      {(selectedProject.handover_checklist || []).map(item => (
                        <label
                          key={item.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            background: item.completed ? '#f0fdf4' : '#fff',
                            border: `1px solid ${item.completed ? '#bbf7d0' : 'var(--line)'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: item.completed ? '#15803d' : 'var(--ink)'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={!!item.completed}
                            onChange={() => handleToggleHandoverItem(item.key)}
                          />
                          <span>{item.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Credentials Transfer Guidance */}
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px' }}>
                    <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                      Security Compliance Notice
                    </strong>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                      Passwords and secrets are never stored in plaintext. Credentials are transferred securely through an encrypted password manager or direct client invitation.
                    </p>
                  </div>

                  {/* Strict Project Completion Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '16px' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block' }}>Official Project Completion</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                        Requires all tasks marked DONE and 100% handover items checked.
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={selectedProject.status === 'COMPLETED'}
                      className="btn-primary"
                      style={{ background: selectedProject.status === 'COMPLETED' ? '#94a3b8' : '#15803d', borderColor: selectedProject.status === 'COMPLETED' ? '#94a3b8' : '#15803d' }}
                      onClick={handleTriggerProjectCompletion}
                    >
                      <Award size={14} />
                      <span>{selectedProject.status === 'COMPLETED' ? 'Project Completed' : 'Complete & Deliver Project'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 8: RESOURCES */}
              {activeDrawerTab === 'resources' && (
                <div className="drawer-section space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="section-subtitle" style={{ margin: 0 }}>ATTACHED ASSETS & LINKS</label>
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={() => setShowNewResourceModal(true)}
                    >
                      <Plus size={13} />
                      <span>Add Resource</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(selectedProject.resources || []).map(r => (
                      <div
                        key={r.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: '#fff',
                          border: '1px solid var(--line)',
                          borderRadius: '8px'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{r.title}</strong>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: '11px', color: '#0369a1', display: 'block', marginTop: '2px' }}
                          >
                            {r.url} ↗
                          </a>
                        </div>
                        <button
                          type="button"
                          className="btn-icon text-danger"
                          onClick={() => handleDeleteResource(r.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="drawer-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '540px', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ font: '700 18px "Space Grotesk"', margin: 0 }}>New Build Project</h2>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="filter-label">Client Account *</label>
                <select
                  required
                  value={newProjectForm.client_id}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, client_id: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Select a Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.client_code} — {c.business_name || c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="filter-label">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flagship Web Platform"
                  value={newProjectForm.name}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="filter-label">Service Type</label>
                  <select
                    value={newProjectForm.service_type}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, service_type: e.target.value, template_type: e.target.value })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    {SERVICE_TYPES.filter(s => s.value !== 'ALL').map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="filter-label">Task Template</label>
                  <select
                    value={newProjectForm.template_type}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, template_type: e.target.value })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="WEBSITE">Website (36 Phased Tasks)</option>
                    <option value="LANDING_PAGE">Landing Page (12 Tasks)</option>
                    <option value="ECOMMERCE">E-Commerce (14 Tasks)</option>
                    <option value="SOFTWARE">Custom Software (13 Tasks)</option>
                    <option value="AI_AUTOMATION">AI Automation (11 Tasks)</option>
                    <option value="MARKETING">Marketing (8 Tasks)</option>
                    <option value="RECRUITMENT">Recruitment (9 Tasks)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="filter-label">Priority</label>
                  <select
                    value={newProjectForm.priority}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, priority: e.target.value })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="filter-label">Target Delivery Date</label>
                  <input
                    type="date"
                    value={newProjectForm.target_date}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, target_date: e.target.value })}
                    className="admin-select"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label className="filter-label">Project Scope / Summary</label>
                <textarea
                  rows={3}
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  placeholder="Key deliverables, business targets, specific requirements..."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create & Seed Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAITING ON CLIENT REASON MODAL */}
      {showWaitingModal && (
        <div className="drawer-overlay" onClick={() => setShowWaitingModal(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 12px' }}>Waiting on Client Input</h3>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '12px' }}>
              This note is displayed directly on the customer's portal banner.
            </p>
            <textarea
              rows={3}
              value={waitingReasonDraft}
              onChange={(e) => setWaitingReasonDraft(e.target.value)}
              placeholder="e.g. Waiting for DNS credentials and Stripe API keys."
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowWaitingModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSaveWaitingReason}
              >
                Save & Update Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL COMPOSER MODAL */}
      {showEmailComposer && selectedProject && (
        <div className="drawer-overlay" onClick={() => setShowEmailComposer(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ font: '700 18px "Space Grotesk"', margin: 0 }}>Client Email Composer</h2>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowEmailComposer(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="filter-label">Select Pre-crafted Template</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.keys(emailTemplates).map(tKey => (
                    <button
                      key={tKey}
                      type="button"
                      className={`filter-pill ${selectedEmailTemplate === tKey ? 'active' : ''}`}
                      onClick={() => setSelectedEmailTemplate(tKey)}
                    >
                      {tKey.replace(/_/g, ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="filter-label">Subject</label>
                <input
                  type="text"
                  readOnly
                  value={emailTemplates[selectedEmailTemplate]?.subject || ''}
                  style={{ width: '100%', padding: '8px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label className="filter-label">Message Body</label>
                <textarea
                  rows={8}
                  readOnly
                  value={emailTemplates[selectedEmailTemplate]?.body || ''}
                  style={{ width: '100%', padding: '10px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEmailComposer(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const text = `Subject: ${emailTemplates[selectedEmailTemplate]?.subject}\n\n${emailTemplates[selectedEmailTemplate]?.body}`;
                    navigator.clipboard.writeText(text);
                    showBannerSuccess('📋 Email copied to clipboard!');
                    setShowEmailComposer(false);
                  }}
                >
                  <Copy size={13} />
                  <span>Copy to Clipboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW MILESTONE MODAL */}
      {showNewMilestoneModal && (
        <div className="drawer-overlay" onClick={() => setShowNewMilestoneModal(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 12px' }}>Add Roadmap Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="filter-label">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Walkthrough Sign-off"
                  value={newMilestoneForm.title}
                  onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="filter-label">Description</label>
                <input
                  type="text"
                  placeholder="Deliverable details..."
                  value={newMilestoneForm.description}
                  onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNewMilestoneModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Add Milestone</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="drawer-overlay" onClick={() => setShowNewTaskModal(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 12px' }}>Add Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="filter-label">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Configure DNS CNAME records"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="filter-label">Priority</label>
                <select
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNewTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW APPROVAL MODAL */}
      {showNewApprovalModal && (
        <div className="drawer-overlay" onClick={() => setShowNewApprovalModal(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 12px' }}>Request Client Sign-off</h3>
            <form onSubmit={handleCreateApproval} className="space-y-3">
              <div>
                <label className="filter-label">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Homepage & Navigation Design Signoff"
                  value={newApprovalForm.title}
                  onChange={(e) => setNewApprovalForm({ ...newApprovalForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="filter-label">Item Type</label>
                <select
                  value={newApprovalForm.item_type}
                  onChange={(e) => setNewApprovalForm({ ...newApprovalForm, item_type: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="DESIGN">Design</option>
                  <option value="CONTENT">Content & Copy</option>
                  <option value="FINAL_WEBSITE">Final Website / Software</option>
                  <option value="OTHER">Other Deliverable</option>
                </select>
              </div>
              <div>
                <label className="filter-label">Preview URL</label>
                <input
                  type="url"
                  placeholder="https://figma.com/... or staging link"
                  value={newApprovalForm.preview_url}
                  onChange={(e) => setNewApprovalForm({ ...newApprovalForm, preview_url: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNewApprovalModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Generate Review Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW UPDATE MODAL */}
      {showNewUpdateModal && (
        <div className="drawer-overlay" onClick={() => setShowNewUpdateModal(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 12px' }}>Post Announcement</h3>
            <form onSubmit={handleCreateUpdate} className="space-y-3">
              <div>
                <label className="filter-label">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend development sprint complete"
                  value={newUpdateForm.title}
                  onChange={(e) => setNewUpdateForm({ ...newUpdateForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="filter-label">Category</label>
                <select
                  value={newUpdateForm.category}
                  onChange={(e) => setNewUpdateForm({ ...newUpdateForm, category: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="PROGRESS">Progress</option>
                  <option value="MILESTONE">Milestone</option>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="ACTION_REQUIRED">Action Required</option>
                </select>
              </div>
              <div>
                <label className="filter-label">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={newUpdateForm.message}
                  onChange={(e) => setNewUpdateForm({ ...newUpdateForm, message: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newUpdateForm.customer_visible}
                  onChange={(e) => setNewUpdateForm({ ...newUpdateForm, customer_visible: e.target.checked })}
                />
                <span>Visible to customer on portal</span>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNewUpdateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Publish Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW RESOURCE MODAL */}
      {showNewResourceModal && (
        <div className="drawer-overlay" onClick={() => setShowNewResourceModal(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '20px' }}>
            <h3 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 12px' }}>Attach Link / Resource</h3>
            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="filter-label">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Figma Design System"
                  value={newResourceForm.title}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="filter-label">URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newResourceForm.url}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, url: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>
              <div>
                <label className="filter-label">Type</label>
                <select
                  value={newResourceForm.resource_type}
                  onChange={(e) => setNewResourceForm({ ...newResourceForm, resource_type: e.target.value })}
                  className="admin-select"
                  style={{ width: '100%' }}
                >
                  <option value="DOCUMENT">Document</option>
                  <option value="DESIGN">Design</option>
                  <option value="REPOSITORY">Repository</option>
                  <option value="STAGING_URL">Staging URL</option>
                  <option value="PRODUCTION_URL">Production URL</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowNewResourceModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Attach Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
