import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  FileCheck,
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
  Calendar,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { fetchPublicContract, acceptPublicContract } from '../api/client';
import { ContractStatusBadge } from './StatusBadge';

export default function PublicContractView({ token, onBackToSite }) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Acceptance Modal State
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [authorizedConsent, setAuthorizedConsent] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    loadContract();
  }, [token]);

  async function loadContract() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicContract(token);
      setContract(data);
      if (data.client_name && !signerName) {
        setSignerName(data.client_name);
      }
      if (data.client_email && !signerEmail) {
        setSignerEmail(data.client_email);
      }
    } catch (err) {
      setError(err.message || 'Unable to load contract agreement. Please verify the URL link.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptSubmit(e) {
    e.preventDefault();
    if (!signerName.trim() || !signerEmail.trim()) {
      setAcceptError('Please provide your full name and work email address.');
      return;
    }
    if (!authorizedConsent) {
      setAcceptError('Please confirm agreement to the terms outlined in this document.');
      return;
    }

    try {
      setAccepting(true);
      setAcceptError('');
      const updated = await acceptPublicContract(token, {
        accepted_by_name: signerName.trim(),
        accepted_by_email: signerEmail.trim()
      });
      setContract(updated);
      setShowAcceptModal(false);
    } catch (err) {
      setAcceptError(err.message || 'Failed to record contract acknowledgement.');
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="public-proposal-loading">
        <Loader2 className="spinner" size={40} style={{ color: '#10100f' }} />
        <p>Loading agreement document...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="public-proposal-error-container">
        <div className="public-proposal-error-card">
          <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <h2>Agreement Unavailable</h2>
          <p>{error || 'This contract document could not be found or has been revoked.'}</p>
          {onBackToSite && (
            <button className="btn-primary" onClick={onBackToSite} style={{ marginTop: '20px' }}>
              Return to The Sorted Club
            </button>
          )}
        </div>
      </div>
    );
  }

  const isAccepted = contract.status === 'ACCEPTED';
  const canAccept = !isAccepted;

  return (
    <div className="public-proposal-wrapper">
      {/* Top Action Bar */}
      <header className="public-proposal-topbar no-print">
        <div className="proposal-topbar-inner">
          <div className="proposal-brand-badge">
            <span className="brand-dot" />
            THE SORTED CLUB • SERVICE AGREEMENT
          </div>
          <div className="proposal-topbar-actions">
            <button className="btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              Print / PDF
            </button>
            {canAccept && (
              <button
                className="btn-primary btn-sm"
                onClick={() => setShowAcceptModal(true)}
              >
                <CheckCircle size={15} />
                Acknowledge & Accept Agreement
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Canvas */}
      <main className="public-proposal-canvas">
        {/* Banner Alert if Accepted */}
        {isAccepted && (
          <div className="proposal-status-banner accepted-banner">
            <CheckCircle size={22} />
            <div>
              <strong>Agreement Formally Acknowledged & Accepted</strong>
              <p>
                Confirmed by <strong>{contract.accepted_by_name || contract.client_name}</strong> on{' '}
                {contract.accepted_at ? new Date(contract.accepted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'recently'}.
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
            <div className="proposal-number-tag">{contract.contract_number}</div>
            <div className="meta-row">
              <span className="meta-label">Date Issued:</span>
              <span className="meta-val">
                {new Date(contract.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Agreement Status:</span>
              <ContractStatusBadge status={contract.status} />
            </div>
          </div>
        </div>

        {/* Parties Card */}
        <div className="proposal-client-grid">
          <div className="client-info-card">
            <div className="section-eyebrow">CLIENT / PARTY B</div>
            <h3 className="client-lead-name">{contract.client_name}</h3>
            <div className="client-company-title">{contract.client_business_name}</div>
            {contract.client_email && (
              <div className="client-contact-item">
                <Mail size={14} />
                <span>{contract.client_email}</span>
              </div>
            )}
            {contract.client_phone && (
              <div className="client-contact-item">
                <Phone size={14} />
                <span>{contract.client_phone}</span>
              </div>
            )}
          </div>

          <div className="project-summary-card">
            <div className="section-eyebrow">DOCUMENT CLASSIFICATION</div>
            <h2 className="proposal-project-title">{contract.title}</h2>
            <p className="proposal-project-desc" style={{ marginTop: '8px' }}>
              Master Services & Deliverable Agreement between The Sorted Club and {contract.client_business_name}.
            </p>
          </div>
        </div>

        {/* Contract Content Body */}
        <div className="contract-body-container">
          <div className="section-eyebrow">TERMS OF AGREEMENT</div>
          <div className="contract-preformatted-content">
            {contract.content}
          </div>
        </div>

        {/* Signoff / Acceptance Callout Box */}
        <div className="proposal-approval-box">
          <div className="approval-box-content">
            <ShieldCheck size={28} style={{ color: '#15803d', flexShrink: 0 }} />
            <div>
              <h4>Agreement & Operational Acknowledgement</h4>
              <p>
                {isAccepted
                  ? `This agreement was acknowledged and confirmed online by ${contract.accepted_by_name || 'Client'}.`
                  : 'Review the terms above. Acknowledging this agreement confirms your authorization to proceed under the outlined scope and compensation terms.'}
              </p>
            </div>
          </div>
          {canAccept && (
            <button className="btn-primary btn-lg" onClick={() => setShowAcceptModal(true)}>
              <CheckCircle size={18} />
              Acknowledge & Accept Terms
            </button>
          )}
        </div>

        {/* Document Footer */}
        <footer className="proposal-doc-footer">
          <p>© {new Date().getFullYear()} The Sorted Club. Master Services Agreement.</p>
          <p>Confidential • Document Reference: {contract.contract_number}</p>
        </footer>
      </main>

      {/* Acceptance Modal */}
      {showAcceptModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Acknowledge Agreement {contract.contract_number}</h3>
              <button className="btn-icon" onClick={() => setShowAcceptModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAcceptSubmit} className="modal-body">
              <p className="modal-instruction">
                Please enter your details to record mutual agreement for <strong>{contract.client_business_name}</strong>.
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
                  I confirm that I am authorized to represent <strong>{contract.client_business_name}</strong> and hereby acknowledge and accept the terms and deliverables set forth in Agreement <strong>{contract.contract_number}</strong>.
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
                  {accepting ? 'Recording Acknowledgement...' : 'Confirm & Accept Agreement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
