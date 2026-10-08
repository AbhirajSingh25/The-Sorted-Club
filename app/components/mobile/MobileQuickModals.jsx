import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Rocket,
  CheckSquare,
  FileEdit,
  DollarSign,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  createLead,
  createProject,
  createProjectTask,
  createLeadActivity,
  createInvoice,
  fetchLeads,
  fetchProjects,
  fetchClients
} from '../../api/client';

export default function MobileQuickModals({
  isOpen,
  onClose,
  activeModal,
  setActiveModal,
  onActionComplete
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [leadForm, setLeadForm] = useState({
    business_name: '',
    name: '',
    email: '',
    phone: '',
    service_interest: 'Website / Build',
    budget: '₹25k–₹50k',
    message: ''
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    client_id: '',
    service_type: 'Website / Build',
    contract_value: '',
    target_completion_date: ''
  });

  const [taskForm, setTaskForm] = useState({
    project_id: '',
    title: '',
    priority: 'MEDIUM'
  });

  const [noteForm, setNoteForm] = useState({
    lead_id: '',
    notes: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    amount_due: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: 'Initial milestone invoice'
  });

  // Supporting selector data
  const [leadsList, setLeadsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [clientsList, setClientsList] = useState([]);

  useEffect(() => {
    if (!isOpen && !activeModal) return;

    setError(null);
    setSuccess(null);

    // Fetch supporting dropdown lists if needed
    if (activeModal === 'task' || activeModal === 'project') {
      fetchProjects({ status: 'IN_PROGRESS' })
        .then((data) => setProjectsList(data || []))
        .catch(() => {});
      fetchClients()
        .then((data) => {
          setClientsList(data || []);
          if (data && data[0] && !projectForm.client_id) {
            setProjectForm((prev) => ({ ...prev, client_id: data[0].id }));
          }
        })
        .catch(() => {});
    }

    if (activeModal === 'note') {
      fetchLeads()
        .then((data) => {
          setLeadsList(data || []);
          if (data && data[0] && !noteForm.lead_id) {
            setNoteForm((prev) => ({ ...prev, lead_id: data[0].id }));
          }
        })
        .catch(() => {});
    }

    if (activeModal === 'invoice') {
      fetchClients()
        .then((data) => {
          setClientsList(data || []);
          if (data && data[0] && !invoiceForm.client_id) {
            setInvoiceForm((prev) => ({ ...prev, client_id: data[0].id }));
          }
        })
        .catch(() => {});
    }
  }, [activeModal, isOpen]);

  const handleCloseAll = () => {
    setError(null);
    setSuccess(null);
    setActiveModal(null);
    onClose();
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!leadForm.business_name && !leadForm.name) {
      setError('Please provide a business name or contact name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createLead({
        ...leadForm,
        source: 'Mobile Admin'
      });
      setSuccess('Lead created successfully!');
      setTimeout(() => {
        handleCloseAll();
        if (onActionComplete) onActionComplete('lead');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create lead.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setError('Please provide a project name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createProject({
        ...projectForm,
        client_id: projectForm.client_id ? Number(projectForm.client_id) : null,
        contract_value: projectForm.contract_value ? Number(projectForm.contract_value) : 0
      });
      setSuccess('Project created successfully!');
      setTimeout(() => {
        handleCloseAll();
        if (onActionComplete) onActionComplete('project');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.project_id) {
      setError('Please choose a project and enter a task title.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createProjectTask(taskForm.project_id, {
        title: taskForm.title.trim(),
        priority: taskForm.priority
      });
      setSuccess('Task created!');
      setTimeout(() => {
        handleCloseAll();
        if (onActionComplete) onActionComplete('task');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteForm.notes.trim() || !noteForm.lead_id) {
      setError('Please select a lead and enter note text.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createLeadActivity(noteForm.lead_id, {
        activity_type: 'NOTE',
        notes: noteForm.notes.trim()
      });
      setSuccess('Note added!');
      setTimeout(() => {
        handleCloseAll();
        if (onActionComplete) onActionComplete('note');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to log note.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.client_id || !invoiceForm.amount_due) {
      setError('Please select a client and specify the amount.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createInvoice({
        client_id: Number(invoiceForm.client_id),
        invoice_number: invoiceForm.invoice_number,
        amount_due: Number(invoiceForm.amount_due),
        due_date: invoiceForm.due_date,
        notes: invoiceForm.notes,
        status: 'ISSUED'
      });
      setSuccess('Invoice created!');
      setTimeout(() => {
        handleCloseAll();
        if (onActionComplete) onActionComplete('invoice');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create invoice.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !activeModal) return null;

  return (
    <div className="mobile-modal-backdrop" onClick={handleCloseAll}>
      {/* 1. Quick Action Menu Sheet (when no specific modal active) */}
      {!activeModal && (
        <div
          className="mobile-modal-sheet"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-sheet-pill" />
          <div className="mobile-sheet-header">
            <h3 className="mobile-sheet-title">Quick Actions</h3>
            <button
              type="button"
              className="mobile-icon-btn"
              onClick={handleCloseAll}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mobile-quick-actions-grid">
            <button
              type="button"
              className="mobile-quick-tile"
              onClick={() => setActiveModal('lead')}
            >
              <div className="mobile-quick-tile-icon" style={{ background: '#d8ff55', color: '#10100f' }}>
                <Plus size={20} />
              </div>
              <span className="mobile-quick-tile-label">New Lead</span>
            </button>

            <button
              type="button"
              className="mobile-quick-tile"
              onClick={() => setActiveModal('project')}
            >
              <div className="mobile-quick-tile-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <Rocket size={20} />
              </div>
              <span className="mobile-quick-tile-label">New Project</span>
            </button>

            <button
              type="button"
              className="mobile-quick-tile"
              onClick={() => setActiveModal('task')}
            >
              <div className="mobile-quick-tile-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <CheckSquare size={20} />
              </div>
              <span className="mobile-quick-tile-label">New Task</span>
            </button>

            <button
              type="button"
              className="mobile-quick-tile"
              onClick={() => setActiveModal('note')}
            >
              <div className="mobile-quick-tile-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <FileEdit size={20} />
              </div>
              <span className="mobile-quick-tile-label">Add Note</span>
            </button>

            <button
              type="button"
              className="mobile-quick-tile"
              onClick={() => setActiveModal('invoice')}
            >
              <div className="mobile-quick-tile-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <DollarSign size={20} />
              </div>
              <span className="mobile-quick-tile-label">Create Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Specific Action Modals */}
      {activeModal && (
        <div
          className="mobile-modal-sheet"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-sheet-pill" />
          <div className="mobile-sheet-header">
            <h3 className="mobile-sheet-title">
              {activeModal === 'lead' && '➕ New Lead'}
              {activeModal === 'project' && '🚀 New Project'}
              {activeModal === 'task' && '📋 New Task'}
              {activeModal === 'note' && '📝 Add Activity Note'}
              {activeModal === 'invoice' && '🧾 Create Invoice'}
            </h3>
            <button
              type="button"
              className="mobile-icon-btn"
              onClick={handleCloseAll}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mobile-error-box" style={{ marginBottom: 12 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mobile-toast-notification" style={{ position: 'static', marginBottom: 12 }}>
              <Check size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* Lead Modal Form */}
          {activeModal === 'lead' && (
            <form onSubmit={handleCreateLead} className="mobile-modal-form">
              <div className="mobile-form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. The Café House"
                  value={leadForm.business_name}
                  onChange={(e) => setLeadForm({ ...leadForm, business_name: e.target.value })}
                  className="mobile-input"
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="mobile-input"
                />
              </div>

              <div className="mobile-form-row">
                <div className="mobile-form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="mobile-input"
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="mobile-input"
                  />
                </div>
              </div>

              <div className="mobile-form-row">
                <div className="mobile-form-group">
                  <label>Service Interest</label>
                  <select
                    value={leadForm.service_interest}
                    onChange={(e) => setLeadForm({ ...leadForm, service_interest: e.target.value })}
                    className="mobile-input"
                  >
                    <option value="Website / Build">Website / Build</option>
                    <option value="Marketing / Growth">Marketing / Growth</option>
                    <option value="AI / Automation">AI / Automation</option>
                    <option value="Hiring">Hiring</option>
                    <option value="Custom software">Custom software</option>
                  </select>
                </div>
                <div className="mobile-form-group">
                  <label>Budget</label>
                  <input
                    type="text"
                    placeholder="₹25k–₹50k"
                    value={leadForm.budget}
                    onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })}
                    className="mobile-input"
                  />
                </div>
              </div>

              <div className="mobile-form-group">
                <label>Requirements Note</label>
                <textarea
                  placeholder="Key project needs or context..."
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  className="mobile-textarea"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="mobile-primary-btn"
                style={{ width: '100%', height: 48, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="spinner" /> : 'Save Lead'}
              </button>
            </form>
          )}

          {/* Project Modal Form */}
          {activeModal === 'project' && (
            <form onSubmit={handleCreateProject} className="mobile-modal-form">
              <div className="mobile-form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. The Café House - Website Redesign"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="mobile-input"
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label>Client</label>
                <select
                  value={projectForm.client_id}
                  onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
                  className="mobile-input"
                >
                  <option value="">-- Select Client or Unassigned --</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name || c.contact_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mobile-form-row">
                <div className="mobile-form-group">
                  <label>Service Type</label>
                  <select
                    value={projectForm.service_type}
                    onChange={(e) => setProjectForm({ ...projectForm, service_type: e.target.value })}
                    className="mobile-input"
                  >
                    <option value="Website / Build">Website / Build</option>
                    <option value="Marketing / Growth">Marketing / Growth</option>
                    <option value="AI / Automation">AI / Automation</option>
                    <option value="Hiring">Hiring</option>
                  </select>
                </div>
                <div className="mobile-form-group">
                  <label>Value (₹)</label>
                  <input
                    type="number"
                    placeholder="39999"
                    value={projectForm.contract_value}
                    onChange={(e) => setProjectForm({ ...projectForm, contract_value: e.target.value })}
                    className="mobile-input"
                  />
                </div>
              </div>

              <div className="mobile-form-group">
                <label>Target Completion Date</label>
                <input
                  type="date"
                  value={projectForm.target_completion_date}
                  onChange={(e) => setProjectForm({ ...projectForm, target_completion_date: e.target.value })}
                  className="mobile-input"
                />
              </div>

              <button
                type="submit"
                className="mobile-primary-btn"
                style={{ width: '100%', height: 48, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="spinner" /> : 'Launch Project'}
              </button>
            </form>
          )}

          {/* Task Modal Form */}
          {activeModal === 'task' && (
            <form onSubmit={handleCreateTask} className="mobile-modal-form">
              <div className="mobile-form-group">
                <label>Target Project</label>
                <select
                  value={taskForm.project_id}
                  onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                  className="mobile-input"
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mobile-form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Finalize payment gateway test"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="mobile-input"
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label>Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="mobile-input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <button
                type="submit"
                className="mobile-primary-btn"
                style={{ width: '100%', height: 48, marginTop: 8 }}
                disabled={loading || !taskForm.project_id}
              >
                {loading ? <Loader2 size={18} className="spinner" /> : 'Create Task'}
              </button>
            </form>
          )}

          {/* Add Note Modal Form */}
          {activeModal === 'note' && (
            <form onSubmit={handleCreateNote} className="mobile-modal-form">
              <div className="mobile-form-group">
                <label>Select Lead</label>
                <select
                  value={noteForm.lead_id}
                  onChange={(e) => setNoteForm({ ...noteForm, lead_id: e.target.value })}
                  className="mobile-input"
                  required
                >
                  <option value="">-- Choose Lead --</option>
                  {leadsList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.business_name || l.name} ({l.service_interest || 'Lead'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mobile-form-group">
                <label>Note / Activity Summary</label>
                <textarea
                  placeholder="Details of call, discussion, or client requirements..."
                  value={noteForm.notes}
                  onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                  className="mobile-textarea"
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                className="mobile-primary-btn"
                style={{ width: '100%', height: 48, marginTop: 8 }}
                disabled={loading || !noteForm.lead_id}
              >
                {loading ? <Loader2 size={18} className="spinner" /> : 'Save Note'}
              </button>
            </form>
          )}

          {/* Create Invoice Modal Form */}
          {activeModal === 'invoice' && (
            <form onSubmit={handleCreateInvoice} className="mobile-modal-form">
              <div className="mobile-form-group">
                <label>Client</label>
                <select
                  value={invoiceForm.client_id}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
                  className="mobile-input"
                  required
                >
                  <option value="">-- Select Client --</option>
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name || c.contact_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mobile-form-row">
                <div className="mobile-form-group">
                  <label>Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceForm.invoice_number}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })}
                    className="mobile-input"
                    required
                  />
                </div>
                <div className="mobile-form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="39999"
                    value={invoiceForm.amount_due}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount_due: e.target.value })}
                    className="mobile-input"
                    required
                  />
                </div>
              </div>

              <div className="mobile-form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  className="mobile-input"
                  required
                />
              </div>

              <div className="mobile-form-group">
                <label>Description / Notes</label>
                <input
                  type="text"
                  placeholder="Website Design & Build Phase 1"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="mobile-input"
                />
              </div>

              <button
                type="submit"
                className="mobile-primary-btn"
                style={{ width: '100%', height: 48, marginTop: 8 }}
                disabled={loading || !invoiceForm.client_id}
              >
                {loading ? <Loader2 size={18} className="spinner" /> : 'Issue Invoice'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
