import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Printer,
  FileText,
  Building,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  Calendar
} from 'lucide-react';
import { fetchPublicProposal, acceptPublicProposal, rejectPublicProposal } from '../api/client';
import { ProposalStatusBadge } from './StatusBadge';

export default function PublicProposalView({ token, onBackToSite }) {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Acceptance Modal State
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [authorizedConsent, setAuthorizedConsent] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadProposal();
  }, [token]);

  async function loadProposal() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicProposal(token);
      setProposal(data);
      if (data.client_name && !signerName) {
        setSignerName(data.client_name);
      }
      if (data.client_email && !signerEmail) {
        setSignerEmail(data.client_email);
      }
    } catch (err) {
      setError(err.message || 'Unable to load proposal document. Please verify the URL link.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptSubmit(e) {
    e.preventDefault();
    if (!signerName.trim() || !signerEmail.trim()) {
      setAcceptError('Please provide your name and work email address.');
      return;
    }
    if (!authorizedConsent) {
      setAcceptError('Please confirm authorization to approve this proposal.');
      return;
    }

    try {
      setAccepting(true);
      setAcceptError('');
      const updated = await acceptPublicProposal(token, {
        accepted_by_name: signerName.trim(),
        accepted_by_email: signerEmail.trim()
      });
      setProposal(updated);
      setShowAcceptModal(false);
    } catch (err) {
      setAcceptError(err.message || 'Failed to confirm proposal approval.');
    } finally {
      setAccepting(false);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    try {
      setRejecting(true);
      const updated = await rejectPublicProposal(token, {
        reason: rejectReason.trim()
      });
      setProposal(updated);
      setShowRejectModal(false);
    } catch (err) {
      alert(err.message || 'Failed to decline proposal.');
    } finally {
      setRejecting(false);
    }
  }

  if (loading) {
    return (
      <div className="public-proposal-loading">
        <Loader2 className="spinner" size={40} style={{ color: '#10100f' }} />
        <p>Loading proposal document...</p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="public-proposal-error-container">
        <div className="public-proposal-error-card">
          <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <h2>Proposal Unavailable</h2>
          <p>{error || 'This proposal document could not be found or has been revoked.'}</p>
          {onBackToSite && (
            <button className="btn-primary" onClick={onBackToSite} style={{ marginTop: '20px' }}>
              Return to The Sorted Club
            </button>
          )}
        </div>
      </div>
    );
  }

  const isAccepted = proposal.status === 'ACCEPTED';
  const isRejected = proposal.status === 'REJECTED';
  const isExpired = proposal.is_expired || proposal.status === 'EXPIRED';
  const canTakeAction = !isAccepted && !isRejected && !isExpired;

  return (
    <div className="public-proposal-wrapper">
      {/* Top Action Bar */}
      <header className="public-proposal-topbar no-print">
        <div className="proposal-topbar-inner">
          <div className="proposal-brand-badge">
            <span className="brand-dot" />
            THE SORTED CLUB
          </div>
          <div className="proposal-topbar-actions">
            <button className="btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              Print / PDF
            </button>
            {canTakeAction && (
              <>
                <button
                  className="btn-outline-danger btn-sm"
                  onClick={() => setShowRejectModal(true)}
                >
                  Decline
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => setShowAcceptModal(true)}
                >
                  <CheckCircle size={15} />
                  Approve Proposal
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Canvas */}
      <main className="public-proposal-canvas">
        {/* Banner Alert if Accepted, Declined, or Expired */}
        {isAccepted && (
          <div className="proposal-status-banner accepted-banner">
            <CheckCircle size={24} />
            <div>
              <strong style={{ fontSize: '16px' }}>Proposal accepted.</strong>
              <p style={{ marginTop: '4px', fontSize: '14px', fontWeight: 600, color: '#15803d' }}>
                Welcome to The Sorted Club.
              </p>
              <p style={{ marginTop: '2px', fontSize: '13px' }}>
                We'll now prepare your agreement and payment details. (Confirmed by {proposal.accepted_by_name || 'Client'}{proposal.accepted_at ? ` on ${new Date(proposal.accepted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}).
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="proposal-status-banner rejected-banner">
            <XCircle size={24} />
            <div>
              <strong style={{ fontSize: '16px' }}>This proposal has been declined.</strong>
              <p style={{ marginTop: '2px', fontSize: '13px' }}>
                This proposal is marked as declined. Please contact The Sorted Club if you would like an updated proposal.
              </p>
            </div>
          </div>
        )}

        {isExpired && !isAccepted && (
          <div className="proposal-status-banner expired-banner">
            <Clock size={24} />
            <div>
              <strong style={{ fontSize: '16px' }}>This proposal is no longer available.</strong>
              <p style={{ marginTop: '2px', fontSize: '13px' }}>
                The validity date for this proposal has lapsed. Please reach out to The Sorted Club for a refreshed quote.
              </p>
            </div>
          </div>
        )}

        {/* Document Header */}
        <div className="proposal-doc-header">
          <div className="proposal-doc-brand">
            <h1 className="doc-agency-title">THE SORTED CLUB</h1>
            <p className="doc-agency-tagline">Your business. Sorted.</p>
            <p className="doc-agency-contact">hello@thesortedclub.com • www.thesortedclub.com</p>
          </div>

          <div className="proposal-doc-meta">
            <div className="proposal-number-tag">{proposal.proposal_number}</div>
            <div className="meta-row">
              <span className="meta-label">Issue Date:</span>
              <span className="meta-val">
                {new Date(proposal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {proposal.valid_until && (
              <div className="meta-row">
                <span className="meta-label">Valid Until:</span>
                <span className="meta-val">
                  {new Date(proposal.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
            <div className="meta-row">
              <span className="meta-label">Status:</span>
              <ProposalStatusBadge status={proposal.status} />
            </div>
          </div>
        </div>

        {/* Client & Project Overview */}
        <div className="proposal-client-grid">
          <div className="client-info-card">
            <div className="section-eyebrow">PREPARED FOR</div>
            <h3 className="client-lead-name">{proposal.client_name}</h3>
            <div className="client-company-title">{proposal.client_business_name}</div>
            {proposal.client_email && (
              <div className="client-contact-item">
                <Mail size={14} />
                <span>{proposal.client_email}</span>
              </div>
            )}
            {proposal.client_phone && (
              <div className="client-contact-item">
                <Phone size={14} />
                <span>{proposal.client_phone}</span>
              </div>
            )}
          </div>

          <div className="project-summary-card">
            <div className="section-eyebrow">PROJECT SUMMARY & OBJECTIVE</div>
            <h2 className="proposal-project-title">{proposal.title}</h2>
            {proposal.description && (
              <p className="proposal-project-desc">{proposal.description}</p>
            )}
          </div>
        </div>

        {/* Deliverables & Line Items Table */}
        <div className="proposal-deliverables-section">
          <div className="section-eyebrow">SCOPE & DELIVERABLES</div>
          <table className="proposal-items-table">
            <thead>
              <tr>
                <th>Deliverable / Item</th>
                <th className="text-center" style={{ width: '80px' }}>Qty</th>
                <th className="text-right" style={{ width: '130px' }}>Unit Rate</th>
                <th className="text-right" style={{ width: '130px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.items && proposal.items.length > 0 ? (
                proposal.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td>
                      <div className="item-name">{item.name}</div>
                      {item.description && <div className="item-desc">{item.description}</div>}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right item-total-cell">
                      ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-items-cell">
                    Scope items defined in project agreement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="proposal-totals-container">
          <div className="proposal-totals-box">
            <div className="total-row">
              <span className="total-label">Subtotal:</span>
              <span className="total-val">${proposal.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {proposal.discount > 0 && (
              <div className="total-row discount-row">
                <span className="total-label">Special Discount:</span>
                <span className="total-val">-${proposal.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {proposal.tax > 0 && (
              <div className="total-row">
                <span className="total-label">Applicable Tax:</span>
                <span className="total-val">+${proposal.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="total-row grand-total-row">
              <span className="grand-label">Total Investment ({proposal.currency}):</span>
              <span className="grand-val">${proposal.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {(proposal.notes || proposal.terms) && (
          <div className="proposal-terms-section">
            {proposal.notes && (
              <div className="terms-block">
                <div className="section-eyebrow">PAYMENT TERMS & NOTES</div>
                <p className="terms-text">{proposal.notes}</p>
              </div>
            )}
            {proposal.terms && (
              <div className="terms-block">
                <div className="section-eyebrow">TERMS & CONDITIONS</div>
                <p className="terms-text">{proposal.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Acceptance Callout Box */}
        <div className="proposal-approval-box">
          <div className="approval-box-content">
            <ShieldCheck size={28} style={{ color: '#15803d', flexShrink: 0 }} />
            <div>
              <h4>Ready to get started?</h4>
              <p>
                {isAccepted
                  ? 'This proposal has been accepted. Our team is preparing your agreement and onboarding details.'
                  : 'Approving this proposal confirms your agreement with the scope, pricing, and deliverables. We will immediately initiate project preparation.'}
              </p>
            </div>
          </div>
          {canTakeAction && (
            <button className="btn-primary btn-lg" onClick={() => setShowAcceptModal(true)}>
              <CheckCircle size={18} />
              Accept Proposal
            </button>
          )}
        </div>

        {/* Document Footer */}
        <footer className="proposal-doc-footer">
          <p>© {new Date().getFullYear()} The Sorted Club. Commercial in confidence.</p>
          <p>For questions or updates, email hello@thesortedclub.com</p>
        </footer>
      </main>

      {/* Acceptance Modal */}
      {showAcceptModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Accept Proposal {proposal.proposal_number}</h3>
              <button className="btn-icon" onClick={() => setShowAcceptModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAcceptSubmit} className="modal-body">
              {/* Proposal Summary in Modal */}
              <div className="modal-proposal-summary-box" style={{ background: 'var(--paper-2)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Project:</span>
                  <strong style={{ fontSize: '13px' }}>{proposal.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Client:</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{proposal.client_business_name} ({proposal.client_name})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Total Investment:</span>
                  <strong style={{ fontSize: '15px', color: '#15803d' }}>
                    ${proposal.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {proposal.currency}
                  </strong>
                </div>
              </div>

              <p className="modal-instruction" style={{ fontSize: '13px', marginBottom: '16px' }}>
                Please provide your contact details to record acceptance for <strong>{proposal.client_business_name}</strong>.
              </p>

              {acceptError && (
                <div className="form-error-alert" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{acceptError}</span>
                </div>
              )}

              <div className="form-group">
                <label>Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                />
              </div>

              <div className="form-group">
                <label>Work Email Address *</label>
                <input
                  type="email"
                  required
                  value={signerEmail}
                  onChange={(e) => setSignerEmail(e.target.value)}
                  placeholder="e.g. alex@company.com"
                />
              </div>

              <label className="checkbox-label" style={{ marginTop: '14px', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={authorizedConsent}
                  onChange={(e) => setAuthorizedConsent(e.target.checked)}
                  required
                  style={{ marginTop: '3px' }}
                />
                <span style={{ fontSize: '13px', lineHeight: 1.4, color: 'var(--ink)' }}>
                  I confirm that I agree to the proposal scope, deliverables, and total investment of <strong>${proposal.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {proposal.currency}</strong>, and authorize The Sorted Club to prepare the agreement and project kickoff.
                </span>
              </label>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAcceptModal(false)}
                  disabled={accepting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={accepting}
                >
                  {accepting ? <Loader2 className="spinner" size={16} /> : <CheckCircle size={16} />}
                  {accepting ? 'Accepting Proposal...' : 'Accept Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Decline Proposal</h3>
              <button className="btn-icon" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRejectSubmit} className="modal-body">
              <p className="modal-instruction">
                Let us know if you'd like adjustments to the scope, deliverables, or timeline.
              </p>

              <div className="form-group">
                <label>Feedback or Reason (Optional)</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. We need to adjust module scope or postpone kickoff..."
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejecting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-outline-danger"
                  disabled={rejecting}
                >
                  {rejecting ? 'Processing...' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
