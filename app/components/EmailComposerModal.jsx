import React, { useState, useEffect } from 'react';
import {
  Mail,
  Copy,
  Check,
  ExternalLink,
  X,
  FileText,
  FileCheck,
  Receipt,
  DollarSign,
  Send
} from 'lucide-react';

export default function EmailComposerModal({
  isOpen,
  onClose,
  templateType = 'proposal_sent', // 'proposal_sent' | 'proposal_accepted' | 'contract_ready' | 'invoice_sent' | 'payment_confirmed'
  data = {} // { client, proposal, contract, invoice, confirmation, token }
}) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [selectedType, setSelectedType] = useState(templateType);

  useEffect(() => {
    if (templateType) {
      setSelectedType(templateType);
    }
  }, [templateType]);

  useEffect(() => {
    generateTemplate(selectedType);
  }, [selectedType, data]);

  function generateTemplate(type) {
    const origin = window.location.origin;
    const clientName = data.client_name || data.client?.name || 'Client';
    const businessName = data.client_business_name || data.client?.business_name || 'your company';
    const clientEmail = data.client_email || data.client?.email || '';
    setRecipientEmail(clientEmail);

    if (type === 'proposal_sent') {
      const propNum = data.proposal?.proposal_number || data.proposal_number || 'SC-P-2026-0001';
      const propTitle = data.proposal?.title || data.title || 'Project Scope';
      const token = data.proposal?.secure_token || data.secure_token || '';
      const link = `${origin}/proposal/${token}`;

      setSubject(`The Sorted Club — Proposal for ${propTitle} (${propNum})`);
      setBody(`Hi ${clientName},

Thank you for exploring our partnership with The Sorted Club.

We have prepared your official project proposal for "${propTitle}".

You can view the full scope of deliverables, line-item pricing, and terms using your secure online document link below:

🔗 Review & Accept Proposal:
${link}

Once you review and approve the proposal online, our team will immediately prepare your formal agreement and kickoff details.

If you have any questions or would like adjustments to the scope, please reply directly to this email.

Best regards,

The Sorted Club Team
hello@thesortedclub.com
www.thesortedclub.com`);
    } else if (type === 'proposal_accepted') {
      const propNum = data.proposal?.proposal_number || data.proposal_number || 'SC-P-2026-0001';
      const propTitle = data.proposal?.title || data.title || 'Project Scope';

      setSubject(`Proposal Accepted — Next Steps for ${businessName}`);
      setBody(`Hi ${clientName},

Thank you for approving Proposal ${propNum} ("${propTitle}").

Welcome to The Sorted Club! We are excited to collaborate with ${businessName}.

We are currently preparing your Master Services Agreement and invoice schedule. You will receive your secure agreement link and payment details shortly.

If you have any questions in the meantime, feel free to reach out.

Best regards,

The Sorted Club Operations
hello@thesortedclub.com`);
    } else if (type === 'contract_ready') {
      const contractNum = data.contract?.contract_number || data.contract_number || 'SC-C-2026-0001';
      const contractTitle = data.contract?.title || data.title || 'Master Services Agreement';
      const token = data.contract?.secure_token || data.secure_token || '';
      const link = `${origin}/contract/${token}`;

      setSubject(`The Sorted Club — Service Agreement Ready (${contractNum})`);
      setBody(`Hi ${clientName},

Your Master Services Agreement for "${contractTitle}" is now ready for your review and acknowledgement.

🔗 Review & Acknowledge Agreement:
${link}

You can review all terms, scope, and deliverables at the link above, as well as print or save a PDF copy for your records.

Please acknowledge the terms online so we can finalize your project onboarding.

Best regards,

The Sorted Club Legal & Operations
hello@thesortedclub.com`);
    } else if (type === 'invoice_sent') {
      const invNum = data.invoice?.invoice_number || data.invoice_number || 'SC-INV-2026-0001';
      const total = data.invoice?.total || data.total || 0;
      const currency = data.invoice?.currency || 'USD';
      const token = data.invoice?.secure_token || data.secure_token || '';
      const link = `${origin}/invoice/${token}`;

      setSubject(`The Sorted Club — Invoice ${invNum} (${currency} ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })})`);
      setBody(`Hi ${clientName},

Please find your official invoice ${invNum} from The Sorted Club.

Invoice Details:
- Invoice Number: ${invNum}
- Total Amount: ${currency} ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
- Document Link: ${link}

🔗 View Invoice & Payment Instructions:
${link}

The invoice link includes direct payment instructions for instant UPI transfer and Bank Wire / NEFT. Once your transfer is complete, you can submit your transaction reference number directly on the page for instant verification.

Thank you for your business.

Best regards,

The Sorted Club Billing Team
billing@thesortedclub.com`);
    } else if (type === 'payment_confirmed') {
      const invNum = data.invoice?.invoice_number || data.confirmation?.invoice_number || 'Invoice';
      const amount = data.confirmation?.amount || data.amount || 0;
      const ref = data.confirmation?.reference || 'Direct Transfer';

      setSubject(`Payment Confirmed — The Sorted Club (${invNum})`);
      setBody(`Hi ${clientName},

We have received and verified your payment of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Ref: ${ref}) for ${invNum}.

Your invoice status has been updated in our system, and your onboarding is moving forward.

Thank you for your prompt payment!

Best regards,

The Sorted Club Finance Team
billing@thesortedclub.com`);
    }
  }

  const handleCopySubject = () => {
    navigator.clipboard.writeText(subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(body);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleOpenMailto = () => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    window.open(mailtoUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '680px', width: '100%' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} />
            <h3 style={{ margin: 0 }}>Email Template Composer</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Template Selector Tabs */}
          <div className="email-template-tabs" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <button
              type="button"
              className={`view-btn ${selectedType === 'proposal_sent' ? 'active' : ''}`}
              onClick={() => setSelectedType('proposal_sent')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Proposal Sent
            </button>
            <button
              type="button"
              className={`view-btn ${selectedType === 'proposal_accepted' ? 'active' : ''}`}
              onClick={() => setSelectedType('proposal_accepted')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Proposal Accepted
            </button>
            <button
              type="button"
              className={`view-btn ${selectedType === 'contract_ready' ? 'active' : ''}`}
              onClick={() => setSelectedType('contract_ready')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Contract Ready
            </button>
            <button
              type="button"
              className={`view-btn ${selectedType === 'invoice_sent' ? 'active' : ''}`}
              onClick={() => setSelectedType('invoice_sent')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Invoice Sent
            </button>
            <button
              type="button"
              className={`view-btn ${selectedType === 'payment_confirmed' ? 'active' : ''}`}
              onClick={() => setSelectedType('payment_confirmed')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Payment Confirmed
            </button>
          </div>

          {/* Recipient */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>To (Recipient Email):</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="client@example.com"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Subject with copy button */}
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Subject Line:</label>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleCopySubject}
                style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
              >
                {copiedSubject ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                {copiedSubject ? 'Copied' : 'Copy Subject'}
              </button>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ fontSize: '13px', fontWeight: 600 }}
            />
          </div>

          {/* Body with copy button */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>Email Body:</label>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleCopyBody}
                style={{ fontSize: '11px', padding: '2px 8px', height: '24px' }}
              >
                {copiedBody ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                {copiedBody ? 'Copied' : 'Copy Body'}
              </button>
            </div>
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.5 }}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
                  setCopiedBody(true);
                  setTimeout(() => setCopiedBody(false), 2000);
                }}
              >
                <Copy size={15} />
                Copy Full Email
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleOpenMailto}
              >
                <Send size={15} />
                Open in Email Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
