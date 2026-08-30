import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
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
  Copy,
  Check,
  CreditCard,
  QrCode,
  DollarSign,
  Info
} from 'lucide-react';
import { fetchPublicInvoice, submitPublicPaymentConfirmation } from '../api/client';
import { InvoiceStatusBadge } from './StatusBadge';

export default function PublicInvoiceView({ token, onBackToSite }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState('');

  // Payment Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK_TRANSFER');
  const [payReference, setPayReference] = useState('');
  const [payDate, setPayDate] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [token]);

  async function loadInvoice() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPublicInvoice(token);
      setInvoice(data);
      if (data.client_name && !payerName) {
        setPayerName(data.client_name);
      }
      if (data.client_email && !payerEmail) {
        setPayerEmail(data.client_email);
      }
      if (!payAmount) {
        setPayAmount(String(data.amount_due || data.total));
      }
    } catch (err) {
      setError(err.message || 'Unable to load invoice document. Please verify the URL link.');
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  async function handlePaymentConfirmSubmit(e) {
    e.preventDefault();
    if (!payerName.trim() || !payerEmail.trim()) {
      setConfirmError('Please provide your name and work email address.');
      return;
    }
    const numAmount = parseFloat(payAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setConfirmError('Please enter a valid payment amount.');
      return;
    }
    if (!payReference.trim()) {
      setConfirmError('Please provide your bank UTR, UPI transaction ID, or payment reference number.');
      return;
    }

    try {
      setSubmitting(true);
      setConfirmError('');
      const payload = {
        payer_name: payerName.trim(),
        payer_email: payerEmail.trim(),
        amount: numAmount,
        payment_method: payMethod,
        reference: payReference.trim(),
        payment_date: payDate ? new Date(payDate).toISOString() : new Date().toISOString(),
        notes: payNotes.trim() || undefined
      };

      await submitPublicPaymentConfirmation(token, payload);
      setShowConfirmModal(false);
      setConfirmSuccess(true);
      setInvoice(prev => prev ? { ...prev, has_pending_confirmation: true } : prev);
    } catch (err) {
      setConfirmError(err.message || 'Failed to submit payment verification.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="public-proposal-loading">
        <Loader2 className="spinner" size={40} style={{ color: '#10100f' }} />
        <p>Loading invoice document...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="public-proposal-error-container">
        <div className="public-proposal-error-card">
          <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <h2>Invoice Unavailable</h2>
          <p>{error || 'This invoice document could not be found or has been revoked.'}</p>
          {onBackToSite && (
            <button className="btn-primary" onClick={onBackToSite} style={{ marginTop: '20px' }}>
              Return to The Sorted Club
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'PAID';
  const isPartiallyPaid = invoice.status === 'PARTIALLY_PAID';
  const isCancelled = invoice.status === 'CANCELLED';
  const canMakePayment = !isPaid && !isCancelled;
  const pi = invoice.payment_instructions || {};

  return (
    <div className="public-proposal-wrapper">
      {/* Top Action Bar */}
      <header className="public-proposal-topbar no-print">
        <div className="proposal-topbar-inner">
          <div className="proposal-brand-badge">
            <span className="brand-dot" />
            THE SORTED CLUB • INVOICE
          </div>
          <div className="proposal-topbar-actions">
            <button className="btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              Print / PDF
            </button>
            {canMakePayment && (
              <button
                className="btn-primary btn-sm"
                onClick={() => {
                  setConfirmSuccess(false);
                  setShowConfirmModal(true);
                }}
              >
                <CreditCard size={15} />
                I've Made The Payment
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Document Canvas */}
      <main className="public-proposal-canvas">
        {/* Banner Alert if Paid */}
        {isPaid && (
          <div className="proposal-status-banner accepted-banner">
            <CheckCircle size={22} />
            <div>
              <strong>Invoice Paid in Full</strong>
              <p>
                This invoice has been settled in full. Thank you for partnering with The Sorted Club.
              </p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="proposal-status-banner rejected-banner">
            <AlertCircle size={22} />
            <div>
              <strong>Invoice Cancelled</strong>
              <p>This invoice has been cancelled and is no longer active.</p>
            </div>
          </div>
        )}

        {invoice.has_pending_confirmation && !isPaid && (
          <div className="proposal-status-banner" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
            <Clock size={22} />
            <div>
              <strong>Payment Verification Pending</strong>
              <p>
                We have received your payment submission. Our finance team is verifying the transaction and will update your receipt shortly.
              </p>
            </div>
          </div>
        )}

        {invoice.is_overdue && !isPaid && !isCancelled && (
          <div className="proposal-status-banner expired-banner">
            <Clock size={22} />
            <div>
              <strong>Payment Overdue</strong>
              <p>This invoice was due on {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please arrange payment at your earliest convenience.</p>
            </div>
          </div>
        )}

        {/* Document Header */}
        <div className="proposal-doc-header">
          <div className="proposal-doc-brand">
            <h1 className="doc-agency-title">THE SORTED CLUB</h1>
            <p className="doc-agency-tagline">Your business. Sorted.</p>
            <p className="doc-agency-contact">billing@thesortedclub.com • www.thesortedclub.com</p>
          </div>

          <div className="proposal-doc-meta">
            <div className="proposal-number-tag">{invoice.invoice_number}</div>
            <div className="meta-row">
              <span className="meta-label">Issue Date:</span>
              <span className="meta-val">
                {new Date(invoice.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {invoice.due_date && (
              <div className="meta-row">
                <span className="meta-label">Due Date:</span>
                <span className="meta-val" style={{ color: invoice.is_overdue ? '#dc2626' : 'inherit', fontWeight: invoice.is_overdue ? 700 : 500 }}>
                  {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
            <div className="meta-row">
              <span className="meta-label">Invoice Status:</span>
              <InvoiceStatusBadge status={invoice.status} isOverdue={invoice.is_overdue} />
            </div>
          </div>
        </div>

        {/* Client & Billing Info */}
        <div className="proposal-client-grid">
          <div className="client-info-card">
            <div className="section-eyebrow">BILLED TO</div>
            <h3 className="client-lead-name">{invoice.client_name}</h3>
            <div className="client-company-title">{invoice.client_business_name}</div>
            {invoice.client_email && (
              <div className="client-contact-item">
                <Mail size={14} />
                <span>{invoice.client_email}</span>
              </div>
            )}
            {invoice.client_phone && (
              <div className="client-contact-item">
                <Phone size={14} />
                <span>{invoice.client_phone}</span>
              </div>
            )}
          </div>

          <div className="project-summary-card">
            <div className="section-eyebrow">PAYMENT SUMMARY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Total Invoiced:</span>
                <strong style={{ fontSize: '14px' }}>${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Amount Paid:</span>
                <span style={{ color: '#15803d', fontWeight: 600, fontSize: '14px' }}>${invoice.amount_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Balance Due:</span>
                <strong style={{ fontSize: '18px', color: isPaid ? '#15803d' : '#dc2626' }}>
                  ${invoice.amount_due.toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="proposal-deliverables-section">
          <div className="section-eyebrow">ITEMS & DELIVERABLES</div>
          <table className="proposal-items-table">
            <thead>
              <tr>
                <th>Item / Description</th>
                <th className="text-center" style={{ width: '80px' }}>Qty</th>
                <th className="text-right" style={{ width: '130px' }}>Unit Rate</th>
                <th className="text-right" style={{ width: '130px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
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
                    Professional services as outlined in project agreement.
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
              <span className="total-val">${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="total-row discount-row">
                <span className="total-label">Discount:</span>
                <span className="total-val">-${invoice.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="total-row">
                <span className="total-label">Applicable Tax:</span>
                <span className="total-val">+${invoice.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="total-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
              <span className="total-label" style={{ fontWeight: 600 }}>Total Amount:</span>
              <span className="total-val" style={{ fontWeight: 600 }}>${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.amount_paid > 0 && (
              <div className="total-row" style={{ color: '#15803d' }}>
                <span className="total-label">Total Paid to Date:</span>
                <span className="total-val">-${invoice.amount_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="total-row grand-total-row">
              <span className="grand-label">Balance Due ({invoice.currency}):</span>
              <span className="grand-val">${invoice.amount_due.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Recorded Official Payments (if any) */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="proposal-deliverables-section" style={{ marginTop: '24px' }}>
            <div className="section-eyebrow">OFFICIAL PAYMENT RECEIPTS</div>
            <table className="proposal-items-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Payment Method</th>
                  <th>Transaction / Reference</th>
                  <th className="text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td><span className="badge badge-light">{p.payment_method}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{p.reference || '—'}</td>
                    <td className="text-right item-total-cell" style={{ color: '#15803d' }}>
                      ${p.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment Instructions Section */}
        {canMakePayment && (
          <div className="payment-instructions-card">
            <div className="section-eyebrow">HOW TO PAY</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--ink)' }}>
              Official Payment Instructions
            </h3>

            <div className="payment-options-grid">
              {/* UPI Card */}
              {pi.upi_id && (
                <div className="payment-instruction-box">
                  <div className="instruction-box-header">
                    <div className="inst-badge">OPTION 1</div>
                    <h4>Instant UPI Transfer</h4>
                  </div>
                  <p className="inst-desc">Pay instantly using any UPI app (Google Pay, PhonePe, Paytm, BHIM).</p>
                  
                  <div className="copy-field-box">
                    <div>
                      <small>UPI ID</small>
                      <div className="copy-field-val">{pi.upi_id}</div>
                    </div>
                    <button
                      type="button"
                      className="copy-field-btn"
                      onClick={() => handleCopy(pi.upi_id, 'upi')}
                      title="Copy UPI ID"
                    >
                      {copiedKey === 'upi' ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                      <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bank Transfer Card */}
              {pi.account_number && (
                <div className="payment-instruction-box">
                  <div className="instruction-box-header">
                    <div className="inst-badge">OPTION 2</div>
                    <h4>Direct Bank / Wire Transfer (NEFT / RTGS / IMPS)</h4>
                  </div>
                  <p className="inst-desc">Transfer directly to The Sorted Club corporate business account.</p>

                  <div className="bank-details-list">
                    <div className="copy-field-box">
                      <div>
                        <small>Account Beneficiary Name</small>
                        <div className="copy-field-val">{pi.account_name}</div>
                      </div>
                      <button
                        type="button"
                        className="copy-field-btn"
                        onClick={() => handleCopy(pi.account_name, 'acc_name')}
                      >
                        {copiedKey === 'acc_name' ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                        <span>{copiedKey === 'acc_name' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="copy-field-box">
                      <div>
                        <small>Bank Name</small>
                        <div className="copy-field-val">{pi.bank_name}</div>
                      </div>
                    </div>

                    <div className="copy-field-box">
                      <div>
                        <small>Account Number</small>
                        <div className="copy-field-val" style={{ letterSpacing: '1px', fontWeight: 600 }}>{pi.account_number}</div>
                      </div>
                      <button
                        type="button"
                        className="copy-field-btn"
                        onClick={() => handleCopy(pi.account_number, 'acc_num')}
                      >
                        {copiedKey === 'acc_num' ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                        <span>{copiedKey === 'acc_num' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="copy-field-box">
                      <div>
                        <small>IFSC Code</small>
                        <div className="copy-field-val" style={{ letterSpacing: '1px', fontWeight: 600 }}>{pi.ifsc}</div>
                      </div>
                      <button
                        type="button"
                        className="copy-field-btn"
                        onClick={() => handleCopy(pi.ifsc, 'ifsc')}
                      >
                        {copiedKey === 'ifsc' ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                        <span>{copiedKey === 'ifsc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {pi.branch && (
                      <div className="copy-field-box">
                        <div>
                          <small>Branch</small>
                          <div className="copy-field-val">{pi.branch}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Callout to submit payment confirmation */}
            <div className="payment-confirm-prompt">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={26} style={{ color: '#15803d', flexShrink: 0 }} />
                <div>
                  <strong>Already completed your transfer?</strong>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    Submit your transaction reference number so our finance team can verify and mark your invoice as paid.
                  </p>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  setConfirmSuccess(false);
                  setShowConfirmModal(true);
                }}
                style={{ flexShrink: 0 }}
              >
                <CheckCircle size={16} />
                I've Made The Payment
              </button>
            </div>
          </div>
        )}

        {/* Terms & Notes */}
        {invoice.notes && (
          <div className="proposal-terms-section">
            <div className="terms-block">
              <div className="section-eyebrow">NOTES & PAYMENT TERMS</div>
              <p className="terms-text">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Document Footer */}
        <footer className="proposal-doc-footer">
          <p>© {new Date().getFullYear()} The Sorted Club. Commercial Invoice.</p>
          <p>Confidential • Invoice Ref: {invoice.invoice_number}</p>
        </footer>
      </main>

      {/* Payment Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Submit Payment Verification</h3>
              <button className="btn-icon" onClick={() => setShowConfirmModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePaymentConfirmSubmit} className="modal-body">
              <p className="modal-instruction">
                Submit your transaction reference for Invoice <strong>{invoice.invoice_number}</strong>. Our team will verify and record your payment.
              </p>

              {confirmError && (
                <div className="form-error-alert" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} />
                  <span>{confirmError}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
                <div className="form-group">
                  <label>Work Email Address *</label>
                  <input
                    type="email"
                    required
                    value={payerEmail}
                    onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="e.g. alex@company.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount Paid ({invoice.currency}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="e.g. 5000.00"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    required
                  >
                    <option value="BANK_TRANSFER">Bank Wire / Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                    <option value="CARD">Card / Online</option>
                    <option value="CASH">Cash / Deposit</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Transaction ID / UTR / Reference Number *</label>
                <input
                  type="text"
                  required
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. UTR-9876543210 or UPI-12345678"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="e.g. Paid from HDFC corporate account"
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="spinner" size={16} /> : <CheckCircle size={16} />}
                  {submitting ? 'Submitting Verification...' : 'Submit Payment Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
