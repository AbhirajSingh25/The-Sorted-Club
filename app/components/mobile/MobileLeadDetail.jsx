import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Tag,
  DollarSign,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  updateLead,
  fetchLeadActivities,
  createLeadActivity,
  convertLeadToClient
} from '../../api/client';
import StatusBadge, { PriorityBadge, FollowUpBadge } from '../StatusBadge';
import { formatMobileDate } from '../../utils/responsive';

export default function MobileLeadDetail({
  lead,
  onClose,
  onLeadUpdated,
  onConvertToClient
}) {
  const [currentLead, setCurrentLead] = useState(lead);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showFollowUpPicker, setShowFollowUpPicker] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Lock underlying dashboard scrolling when detail sheet is open, and restore previous scroll on close
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const viewportEl = document.querySelector('.mobile-viewport-content');
    const prevViewportScroll = viewportEl ? viewportEl.scrollTop : 0;
    const prevWindowScroll = window.scrollY || document.documentElement.scrollTop;

    document.body.classList.add('mobile-sheet-open');

    return () => {
      document.body.classList.remove('mobile-sheet-open');
      if (viewportEl) {
        viewportEl.scrollTop = prevViewportScroll;
      }
      window.scrollTo(0, prevWindowScroll);
    };
  }, []);

  // Close sheet on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load activities
  useEffect(() => {
    if (!currentLead?.id) return;
    let isMounted = true;
    setLoadingActivities(true);

    fetchLeadActivities(currentLead.id)
      .then((data) => {
        if (isMounted) setActivities(data || []);
      })
      .catch((err) => console.error('Failed to load lead activities:', err))
      .finally(() => {
        if (isMounted) setLoadingActivities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentLead?.id]);

  if (!currentLead) return null;

  const rawPhone = currentLead.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const waMessage = encodeURIComponent(
    `Hi ${currentLead.name || ''}, this is Abhiraj from The Sorted Club. I noticed your interest in our ${currentLead.service_interest || 'services'}. Let's discuss how we can get this sorted for ${currentLead.business_name || 'your business'}!`
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateLead(currentLead.id, { status: newStatus });
      setCurrentLead(updated);
      if (onLeadUpdated) onLeadUpdated(updated);
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!followUpDate) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await updateLead(currentLead.id, {
        next_follow_up_at: new Date(followUpDate).toISOString(),
        status: currentLead.status === 'NEW' ? 'CONTACTED' : currentLead.status
      });
      setCurrentLead(updated);
      if (onLeadUpdated) onLeadUpdated(updated);
      setShowFollowUpPicker(false);
      showToast('Follow-up scheduled');
    } catch (err) {
      alert(`Failed to schedule follow-up: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      const activity = await createLeadActivity(currentLead.id, {
        activity_type: 'NOTE',
        notes: newNote.trim()
      });
      setActivities((prev) => [activity, ...prev]);
      setNewNote('');
      showToast('Note logged');
    } catch (err) {
      alert(`Failed to log note: ${err.message}`);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleConvertClient = async () => {
    if (!window.confirm(`Convert ${currentLead.business_name || currentLead.name} into an active client?`)) {
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const result = await convertLeadToClient(currentLead.id);
      showToast('Lead converted to Client!');
      if (onConvertToClient) onConvertToClient(result);
    } catch (err) {
      alert(`Failed to convert client: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const sheetContent = (
    <motion.div
      className="mobile-sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.div
        className="mobile-detail-bottom-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Lead details"
      >
        {/* Pull Handle */}
        <div className="mobile-sheet-pill-wrap">
          <div className="mobile-sheet-pill" />
        </div>

        {/* Header Bar */}
        <div className="mobile-detail-sheet-header">
          <span className="mobile-detail-topbar-title">Lead Details</span>
          <button
            type="button"
            className="mobile-icon-btn"
            onClick={onClose}
            aria-label="Close lead details"
          >
            <X size={20} />
          </button>
        </div>

        {statusMessage && (
          <motion.div
            className="mobile-toast-notification"
            style={{ margin: '8px 16px 0 16px', flexShrink: 0 }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Check size={16} />
            <span>{statusMessage}</span>
          </motion.div>
        )}

        {/* Scrollable Sheet Body */}
        <div className="mobile-detail-scroll-area">
          {/* Lead Hero Card */}
          <div className="mobile-card mobile-lead-hero-card">
            <div className="mobile-lead-hero-badges">
              <StatusBadge status={currentLead.status} />
              {currentLead.priority && currentLead.priority !== 'MEDIUM' && (
                <PriorityBadge priority={currentLead.priority} />
              )}
              {currentLead.next_follow_up_at && (
                <FollowUpBadge nextFollowUpAt={currentLead.next_follow_up_at} />
              )}
            </div>

            <h2 className="mobile-lead-name">
              {currentLead.business_name || currentLead.name || 'Unnamed Prospect'}
            </h2>

            {currentLead.business_name && currentLead.name && (
              <div className="mobile-lead-person">
                <span>Contact: </span>
                <strong>{currentLead.name}</strong>
              </div>
            )}

            <div className="mobile-lead-meta-row">
              <span className="mobile-meta-item">
                <Tag size={13} /> {currentLead.service_interest || 'General Inquiry'}
              </span>
              {currentLead.budget && (
                <span className="mobile-meta-item highlight">
                  <DollarSign size={13} /> {currentLead.budget}
                </span>
              )}
            </div>
          </div>

          {/* PRIMARY TOUCH-FRIENDLY ACTION BUTTONS (>= 48px) */}
          <div className="mobile-lead-touch-actions">
            {currentLead.phone ? (
              <motion.a
                href={`tel:${cleanPhone}`}
                className="mobile-touch-btn mobile-call-btn"
                whileTap={{ scale: 0.96 }}
                title="Call Prospect"
              >
                <Phone size={18} />
                <span>Call</span>
              </motion.a>
            ) : (
              <button className="mobile-touch-btn disabled" disabled>
                <Phone size={18} />
                <span>No Phone</span>
              </button>
            )}

            {currentLead.phone ? (
              <motion.a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-touch-btn mobile-whatsapp-btn"
                whileTap={{ scale: 0.96 }}
                title="WhatsApp Prospect"
              >
                <MessageSquare size={18} />
                <span>WhatsApp</span>
              </motion.a>
            ) : null}

            {currentLead.email ? (
              <motion.a
                href={`mailto:${currentLead.email}?subject=The%20Sorted%20Club%20Inquiry%20-%20${encodeURIComponent(currentLead.business_name || '')}`}
                className="mobile-touch-btn mobile-email-btn"
                whileTap={{ scale: 0.96 }}
                title="Email Prospect"
              >
                <Mail size={18} />
                <span>Email</span>
              </motion.a>
            ) : null}
          </div>

          {/* SECONDARY PIPELINE ACTIONS */}
          <div className="mobile-card mobile-secondary-actions-card">
            <div className="mobile-card-title">PIPELINE ACTIONS</div>
            <div className="mobile-pipeline-buttons-grid">
              {currentLead.status !== 'CONTACTED' && (
                <motion.button
                  type="button"
                  className="mobile-action-pill"
                  onClick={() => handleStatusUpdate('CONTACTED')}
                  disabled={isUpdatingStatus}
                  whileTap={{ scale: 0.96 }}
                >
                  <CheckCircle2 size={15} /> Mark Contacted
                </motion.button>
              )}

              {currentLead.status !== 'QUALIFIED' && (
                <motion.button
                  type="button"
                  className="mobile-action-pill highlight"
                  onClick={() => handleStatusUpdate('QUALIFIED')}
                  disabled={isUpdatingStatus}
                  whileTap={{ scale: 0.96 }}
                >
                  <Sparkles size={15} /> Qualify Lead
                </motion.button>
              )}

              <motion.button
                type="button"
                className="mobile-action-pill"
                onClick={() => setShowFollowUpPicker(!showFollowUpPicker)}
                disabled={isUpdatingStatus}
                whileTap={{ scale: 0.96 }}
              >
                <Clock size={15} /> Schedule Follow-up
              </motion.button>

              {currentLead.status !== 'WON' && (
                <motion.button
                  type="button"
                  className="mobile-action-pill success"
                  onClick={handleConvertClient}
                  disabled={isUpdatingStatus}
                  whileTap={{ scale: 0.96 }}
                >
                  <ShieldCheck size={15} /> Convert to Client
                </motion.button>
              )}
            </div>

            {/* Follow-up Picker */}
            {showFollowUpPicker && (
              <div className="mobile-followup-box">
                <label htmlFor="mobile-followup-input">Select Follow-up Date & Time:</label>
                <div className="mobile-followup-row">
                  <input
                    id="mobile-followup-input"
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mobile-input"
                  />
                  <button
                    type="button"
                    className="mobile-primary-btn"
                    onClick={handleScheduleFollowUp}
                    disabled={!followUpDate || isUpdatingStatus}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CONTACT & BUSINESS DETAILS */}
          <div className="mobile-card">
            <div className="mobile-card-title">CONTACT INFORMATION</div>
            <div className="mobile-info-list">
              <div className="mobile-info-row">
                <span className="mobile-info-label">Contact Name</span>
                <span className="mobile-info-val">{currentLead.name || '—'}</span>
              </div>
              <div className="mobile-info-row">
                <span className="mobile-info-label">Email</span>
                <span className="mobile-info-val">
                  {currentLead.email ? (
                    <a href={`mailto:${currentLead.email}`} className="mobile-link">
                      {currentLead.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="mobile-info-row">
                <span className="mobile-info-label">Phone</span>
                <span className="mobile-info-val">
                  {currentLead.phone ? (
                    <a href={`tel:${cleanPhone}`} className="mobile-link">
                      {currentLead.phone}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              {currentLead.website && (
                <div className="mobile-info-row">
                  <span className="mobile-info-label">Website</span>
                  <span className="mobile-info-val">
                    <a
                      href={
                        currentLead.website.startsWith('http')
                          ? currentLead.website
                          : `https://${currentLead.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-link"
                    >
                      {currentLead.website} <ExternalLink size={12} style={{ display: 'inline' }} />
                    </a>
                  </span>
                </div>
              )}
              <div className="mobile-info-row">
                <span className="mobile-info-label">Received</span>
                <span className="mobile-info-val">{formatMobileDate(currentLead.created_at)}</span>
              </div>
            </div>
          </div>

          {/* PROJECT REQUIREMENTS */}
          <div className="mobile-card">
            <div className="mobile-card-title">PROJECT SPECIFICATIONS</div>
            <div className="mobile-info-list">
              <div className="mobile-info-row">
                <span className="mobile-info-label">Service</span>
                <span className="mobile-info-val">{currentLead.service_interest || 'General'}</span>
              </div>
              <div className="mobile-info-row">
                <span className="mobile-info-label">Budget</span>
                <span className="mobile-info-val highlight">{currentLead.budget || 'Not specified'}</span>
              </div>
              <div className="mobile-info-row">
                <span className="mobile-info-label">Timeline</span>
                <span className="mobile-info-val">{currentLead.timeline || 'Flexible'}</span>
              </div>
              {currentLead.source && (
                <div className="mobile-info-row">
                  <span className="mobile-info-label">Source</span>
                  <span className="mobile-info-val">{currentLead.source}</span>
                </div>
              )}
            </div>

            {currentLead.message && (
              <div className="mobile-notes-box">
                <div className="mobile-notes-label">Original Inquiry Message:</div>
                <p className="mobile-notes-content">{currentLead.message}</p>
              </div>
            )}
          </div>

          {/* ACTIVITY & NOTES */}
          <div className="mobile-card">
            <div className="mobile-card-title">ACTIVITY & NOTES</div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="mobile-add-note-form">
              <textarea
                className="mobile-textarea"
                placeholder="Add an internal note or call summary..."
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="mobile-note-submit-row">
                <motion.button
                  type="submit"
                  className="mobile-primary-btn"
                  disabled={!newNote.trim() || submittingNote}
                  whileTap={{ scale: 0.95 }}
                >
                  {submittingNote ? (
                    <Loader2 size={16} className="spinner" />
                  ) : (
                    <>
                      <Send size={14} /> Log Note
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Timeline */}
            <div className="mobile-timeline-list">
              {loadingActivities ? (
                <div className="mobile-loading-center">
                  <Loader2 size={20} className="spinner" />
                </div>
              ) : activities.length === 0 ? (
                <div className="mobile-empty-hint">No activity logged yet. Add your first note above.</div>
              ) : (
                activities.map((act) => (
                  <div key={act.id} className="mobile-timeline-item">
                    <div className="mobile-timeline-dot" />
                    <div className="mobile-timeline-content">
                      <div className="mobile-timeline-header">
                        <span className="mobile-timeline-type">{act.activity_type || 'NOTE'}</span>
                        <span className="mobile-timeline-time">{formatMobileDate(act.created_at)}</span>
                      </div>
                      <p className="mobile-timeline-notes">{act.notes || act.summary || 'Logged action'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(sheetContent, document.body);
}
