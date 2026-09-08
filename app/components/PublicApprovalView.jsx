import React, { useState, useEffect } from 'react';
import { fetchPublicApproval, submitPublicApprovalDecision } from '../api/client';

export default function PublicApprovalView({ token }) {
  const [approval, setApproval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [comment, setComment] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No approval token provided in URL.');
      setLoading(false);
      return;
    }
    loadApproval();
  }, [token]);

  async function loadApproval() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicApproval(token);
      setApproval(data);
      if (data.client_name) setCustomerName(data.client_name);
    } catch (err) {
      setError(err.message || 'Deliverable review not found or link has expired.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(decisionType) {
    setError(null);
    if (!customerName.trim()) {
      setError('Please enter your full name for official verification.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (decisionType === 'REQUEST_CHANGES' && !comment.trim()) {
      setError('Please provide specific feedback and revision notes so our engineers can adjust the deliverable.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await submitPublicApprovalDecision(token, {
        decision: decisionType,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        comment: comment.trim() || null
      });
      setApproval(updated);
      setSuccessMessage(
        decisionType === 'APPROVE'
          ? '🎉 Deliverable successfully approved! Our engineering team has been notified to proceed.'
          : '📝 Revision request submitted. Our team will review your notes and release an updated build.'
      );
    } catch (err) {
      setError(err.message || 'Failed to submit review decision. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium tracking-wide">Loading official deliverable review...</p>
        </div>
      </div>
    );
  }

  if (error && !approval) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0E131F] border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Review Link Unavailable</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error || 'This approval link is invalid or expired.'}</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  const isPending = approval.status === 'PENDING';
  const isApproved = approval.status === 'APPROVED';
  const isChangesRequested = approval.status === 'CHANGES_REQUESTED';

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-800/80 bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-cyan-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/20">
              SC
            </span>
            <span className="font-extrabold text-lg text-white tracking-tight">THE SORTED CLUB</span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              DELIVERABLE SIGN-OFF
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
              {approval.project_code}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-emerald-300 text-sm font-medium flex items-center gap-3 shadow-lg shadow-emerald-500/5 animate-fade-in">
            <span className="text-xl flex-shrink-0">✓</span>
            <p>{successMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 text-rose-300 text-sm font-medium flex items-center gap-3 shadow-lg shadow-rose-500/5 animate-fade-in">
            <span className="text-xl flex-shrink-0">!</span>
            <p>{error}</p>
          </div>
        )}

        {/* Main Document Box */}
        <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          {/* Header Metadata */}
          <div className="space-y-3 border-b border-slate-800 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                {approval.item_type} REVIEW
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  isApproved
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : isChangesRequested
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}
              >
                {isApproved ? '✓ APPROVED' : isChangesRequested ? '✎ REVISIONS REQUESTED' : '⏳ AWAITING REVIEW'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{approval.title}</h1>
            <p className="text-xs text-slate-400">
              Project: <strong className="text-slate-200">{approval.project_name}</strong> • Client:{' '}
              <strong className="text-slate-200">{approval.client_business_name || approval.client_name}</strong>
            </p>
          </div>

          {/* Description */}
          {approval.description && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deliverable Scope & Notes</h2>
              <div className="bg-[#0A0E1A] border border-slate-800 rounded-2xl p-5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {approval.description}
              </div>
            </div>
          )}

          {/* Live Preview Button / Link */}
          {approval.preview_url && (
            <div className="bg-gradient-to-r from-[#101726] to-[#0A0E1A] border border-cyan-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-cyan-500/5">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-white text-base">Interactive Deliverable Preview</h3>
                <p className="text-xs text-slate-400 font-mono break-all">{approval.preview_url}</p>
              </div>
              <a
                href={approval.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/20 flex-shrink-0 flex items-center gap-2"
              >
                <span>Open Live Preview</span>
                <span>↗</span>
              </a>
            </div>
          )}

          {/* Asset URLs */}
          {approval.asset_urls && approval.asset_urls.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated Deliverable Files</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {approval.asset_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0A0E1A] hover:bg-slate-900 border border-slate-800 rounded-xl text-xs text-cyan-400 truncate flex items-center justify-between group transition-all"
                  >
                    <span className="truncate">{url}</span>
                    <span className="text-slate-500 group-hover:text-cyan-300 ml-2">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Decision Section */}
          <div className="border-t border-slate-800 pt-8 space-y-6">
            {isPending ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white tracking-tight">Submit Your Official Sign-off</h3>
                  <p className="text-xs text-slate-400">
                    Approving confirms this stage meets requirements and signals the team to begin the next milestone.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Your Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Work Email *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. elena@company.com"
                      className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Optional or Required Feedback */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    {showRevisionForm ? 'Revision & Adjustment Notes (Required) *' : 'Approval Comments / Notes (Optional)'}
                  </label>
                  <textarea
                    rows={showRevisionForm ? 4 : 2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      showRevisionForm
                        ? 'Please list the specific changes or fixes needed before final approval...'
                        : 'Any notes for the delivery team...'
                    }
                    className="w-full bg-[#0A0E1A] border border-slate-700 focus:border-cyan-500 rounded-xl p-4 text-sm text-white focus:outline-none transition-all resize-y"
                  ></textarea>
                </div>

                {/* Decision Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('APPROVE')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>✓ Approve Deliverable</span>
                  </button>

                  {!showRevisionForm ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setShowRevisionForm(true)}
                      className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm rounded-xl transition-all border border-slate-700"
                    >
                      Request Revisions...
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleDecision('REQUEST_CHANGES')}
                      className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                      Submit Revision Request
                    </button>
                  )}
                </div>
              </div>
            ) : isApproved ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <span>✓</span>
                  <span>Approved by {approval.decision_name}</span>
                </div>
                {approval.decision_at && (
                  <p className="text-xs text-emerald-400/80 font-mono">
                    Signed off on {new Date(approval.decision_at).toLocaleString()}
                  </p>
                )}
                {approval.decision_comment && (
                  <p className="text-xs text-slate-300 bg-[#0A0E1A] p-4 rounded-xl border border-emerald-500/20 italic">
                    "{approval.decision_comment}"
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
                  <span>✎</span>
                  <span>Revisions Requested by {approval.decision_name}</span>
                </div>
                {approval.decision_at && (
                  <p className="text-xs text-amber-400/80 font-mono">
                    Submitted on {new Date(approval.decision_at).toLocaleString()}
                  </p>
                )}
                {approval.decision_comment && (
                  <p className="text-xs text-slate-300 bg-[#0A0E1A] p-4 rounded-xl border border-amber-500/20 whitespace-pre-wrap">
                    "{approval.decision_comment}"
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 bg-[#0A0E1A] py-8 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} The Sorted Club. Official client approval ledger.</p>
      </footer>
    </div>
  );
}
