import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  DollarSign,
  User,
  Plus,
  Loader2,
  FolderKanban,
  CheckSquare,
  Send,
  Check
} from 'lucide-react';
import {
  fetchProject,
  fetchProjectTasks,
  updateProjectTask,
  createProjectTask,
  fetchProjectActivities,
  createProjectActivity
} from '../../api/client';
import { ProjectStatusBadge, ProjectHealthBadge } from '../StatusBadge';
import { formatMobileDate, formatINR } from '../../utils/responsive';

export default function MobileProjectDetail({ project, onClose, onProjectUpdated }) {
  const [currentProject, setCurrentProject] = useState(project);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Load tasks and activities
  useEffect(() => {
    if (!currentProject?.id) return;
    let isMounted = true;
    setLoadingTasks(true);

    Promise.all([
      fetchProjectTasks(currentProject.id).catch(() => []),
      fetchProjectActivities(currentProject.id).catch(() => [])
    ])
      .then(([tasksData, actsData]) => {
        if (isMounted) {
          setTasks(tasksData || []);
          setActivities(actsData || []);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingTasks(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentProject?.id]);

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    const isCompleted = nextStatus === 'COMPLETED';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, is_completed: isCompleted } : t))
    );

    try {
      await updateProjectTask(currentProject.id, task.id, {
        status: nextStatus,
        is_completed: isCompleted
      });
      showToast(isCompleted ? 'Task completed' : 'Task reopened');
    } catch (err) {
      alert(`Failed to update task: ${err.message}`);
      // Rollback
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || addingTask) return;

    setAddingTask(true);
    try {
      const created = await createProjectTask(currentProject.id, {
        title: newTaskTitle.trim(),
        status: 'TODO',
        priority: 'MEDIUM'
      });
      setTasks((prev) => [...prev, created]);
      setNewTaskTitle('');
      showToast('Task added');
    } catch (err) {
      alert(`Failed to add task: ${err.message}`);
    } finally {
      setAddingTask(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || addingNote) return;

    setAddingNote(true);
    try {
      const created = await createProjectActivity(currentProject.id, {
        activity_type: 'UPDATE',
        notes: newNote.trim()
      });
      setActivities((prev) => [created, ...prev]);
      setNewNote('');
      showToast('Note added');
    } catch (err) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  const progressPct = currentProject?.progress_percent ?? 0;

  return (
    <div className="mobile-sheet-backdrop" onClick={onClose}>
      <motion.div
        className="mobile-detail-bottom-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Project details"
      >
        {/* Pull Handle */}
        <div className="mobile-sheet-pill" />

        {/* Header */}
        <div className="mobile-detail-sheet-header">
          <span className="mobile-detail-topbar-title">Project Details</span>
          <button
            type="button"
            className="mobile-icon-btn"
            onClick={onClose}
            aria-label="Close project details"
          >
            <X size={20} />
          </button>
        </div>

        {statusMessage && (
          <motion.div
            className="mobile-toast-notification"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Check size={16} />
            <span>{statusMessage}</span>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="mobile-detail-scroll-area">
          {/* Project Hero Card */}
          <div className="mobile-card mobile-lead-hero-card">
            <div className="mobile-lead-hero-badges">
              <ProjectStatusBadge status={currentProject.status} />
              <ProjectHealthBadge health={currentProject.health} />
            </div>

            <h2 className="mobile-lead-name">{currentProject.name}</h2>

            {currentProject.client_name && (
              <div className="mobile-lead-person">
                <span>Client: </span>
                <strong>{currentProject.client_name}</strong>
              </div>
            )}

            {/* Visual Progress Bar */}
            <div className="mobile-project-progress-box">
              <div className="mobile-progress-label-row">
                <span>Project Progress</span>
                <strong>{progressPct}%</strong>
              </div>
              <div className="mobile-progress-bar-track">
                <div
                  className="mobile-progress-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                />
              </div>
            </div>
          </div>

          {/* PROJECT OVERVIEW & COMMERCIALS */}
          <div className="mobile-card">
            <div className="mobile-card-title">DELIVERY OVERVIEW</div>
            <div className="mobile-info-list">
              <div className="mobile-info-row">
                <span className="mobile-info-label">Service</span>
                <span className="mobile-info-val">{currentProject.service_type || 'Custom Build'}</span>
              </div>
              <div className="mobile-info-row">
                <span className="mobile-info-label">Deadline</span>
                <span className="mobile-info-val highlight">
                  {currentProject.target_completion_date
                    ? formatMobileDate(currentProject.target_completion_date)
                    : 'Open timeline'}
                </span>
              </div>
              <div className="mobile-info-row">
                <span className="mobile-info-label">Contract Value</span>
                <span className="mobile-info-val highlight">
                  {formatINR(currentProject.contract_value || 0)}
                </span>
              </div>
              {currentProject.waiting_for && (
                <div className="mobile-info-row">
                  <span className="mobile-info-label">Waiting On</span>
                  <span className="mobile-info-val" style={{ color: '#b45309' }}>
                    {currentProject.waiting_for}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TASKS CHECKLIST */}
          <div className="mobile-card">
            <div className="mobile-card-title">
              PROJECT TASKS ({tasks.filter((t) => t.status === 'COMPLETED' || t.is_completed).length}/{tasks.length})
            </div>

            {/* Quick Add Task Form */}
            <form onSubmit={handleAddTask} className="mobile-add-task-row">
              <input
                type="text"
                placeholder="Add next action item..."
                className="mobile-input"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <motion.button
                type="submit"
                className="mobile-primary-btn"
                disabled={!newTaskTitle.trim() || addingTask}
                whileTap={{ scale: 0.94 }}
              >
                {addingTask ? <Loader2 size={16} className="spinner" /> : <Plus size={16} />}
              </motion.button>
            </form>

            {/* Task List */}
            <div className="mobile-tasks-list">
              {loadingTasks ? (
                <div className="mobile-loading-center">
                  <Loader2 size={18} className="spinner" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="mobile-empty-hint">No tasks yet. Create your first task above.</div>
              ) : (
                tasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED' || task.is_completed;
                  return (
                    <motion.div
                      key={task.id}
                      className={`mobile-task-item ${isCompleted ? 'completed' : ''}`}
                      onClick={() => handleToggleTask(task)}
                      whileTap={{ scale: 0.98 }}
                      role="button"
                      tabIndex={0}
                    >
                      <motion.div
                        className="mobile-task-checkbox"
                        whileTap={{ scale: 1.15 }}
                        transition={{ duration: 0.12 }}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="checked-icon" />
                        ) : (
                          <Circle size={18} className="unchecked-icon" />
                        )}
                      </motion.div>
                      <span className="mobile-task-title">{task.title}</span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* NOTES & RECENT ACTIVITY */}
          <div className="mobile-card">
            <div className="mobile-card-title">NOTES & UPDATES</div>

            <form onSubmit={handleAddNote} className="mobile-add-note-form">
              <textarea
                className="mobile-textarea"
                placeholder="Log milestone update or delivery note..."
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="mobile-note-submit-row">
                <motion.button
                  type="submit"
                  className="mobile-primary-btn"
                  disabled={!newNote.trim() || addingNote}
                  whileTap={{ scale: 0.95 }}
                >
                  {addingNote ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Send size={14} /> Log Update
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mobile-timeline-list">
              {activities.length === 0 ? (
                <div className="mobile-empty-hint">No project activity logged yet.</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="mobile-timeline-item">
                    <div className="mobile-timeline-dot" />
                    <div className="mobile-timeline-content">
                      <div className="mobile-timeline-header">
                        <span className="mobile-timeline-type">{act.activity_type || 'UPDATE'}</span>
                        <span className="mobile-timeline-time">{formatMobileDate(act.created_at)}</span>
                      </div>
                      <p className="mobile-timeline-notes">{act.notes || act.summary || 'Update logged'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
