import React, { useState, useEffect } from 'react';
import {
  Inbox,
  DollarSign,
  FileText,
  FileCheck,
  CreditCard,
  Plus,
  Search,
  RefreshCw,
  LogOut,
  ChevronRight,
  X,
  ExternalLink,
  Copy,
  Check,
  Send,
  Trash2,
  Copy as DuplicateIcon,
  AlertCircle,
  CheckCircle,
  Calendar,
  Layers,
  Users,
  Kanban,
  UserCheck,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Building,
  Mail,
  Phone,
  Shield,
  Clock,
  ArrowUpRight,
  FolderKanban
} from 'lucide-react';
import {
  fetchFinanceStats,
  fetchProposals,
  fetchProposal,
  createProposal,
  updateProposal,
  deleteProposal,
  sendProposal,
  acceptProposalAdmin,
  duplicateProposal,
  fetchContracts,
  fetchContract,
  createContractFromProposal,
  updateContract,
  sendContract,
  acceptContract,
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  createInvoiceFromProposal,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  recordInvoicePayment,
  fetchInvoicePayments,
  fetchPaymentConfirmations,
  confirmPaymentVerification,
  rejectPaymentVerification,
  fetchClients,
  clearAdminAuth,
  getAdminUsername
} from '../api/client';
import StatusBadge, {
  ProposalStatusBadge,
  ContractStatusBadge,
  InvoiceStatusBadge,
  PaymentConfirmationStatusBadge
} from './StatusBadge';
import EmailComposerModal from './EmailComposerModal';
import NotificationCenter from './NotificationCenter';

export function formatMoney(amount, currency = 'INR') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  const isUSD = (currency || '').toUpperCase() === 'USD';
  if (isUSD) {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const formatCurrency = formatMoney;


export default function FinanceDashboard({
  onLogout,
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToProjects,
  onBackToSite,
  initialTab = 'overview'
}) {
  // Navigation Sub-tab: 'overview' | 'proposals' | 'contracts' | 'invoices' | 'verifications'
  const [activeTab, setActiveTab] = useState(() => {
    const validTabs = ['overview', 'proposals', 'contracts', 'invoices', 'verifications'];
    if (initialTab && typeof initialTab === 'string' && validTabs.includes(initialTab.toLowerCase())) {
      return initialTab.toLowerCase();
    }
    return 'overview';
  });

  // Global Data State
  const [stats, setStats] = useState(null);
  const [clientsList, setClientsList] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Proposals State
  const [proposals, setProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [proposalStatusFilter, setProposalStatusFilter] = useState('ALL');
  const [proposalClientFilter, setProposalClientFilter] = useState('ALL');
  const [proposalSortBy, setProposalSortBy] = useState('created_desc');
  const [proposalSearch, setProposalSearch] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showProposalBuilder, setShowProposalBuilder] = useState(false);
  const [proposalFormData, setProposalFormData] = useState(getInitialProposalForm());

  // Contracts State
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [contractStatusFilter, setContractStatusFilter] = useState('ALL');
  const [contractClientFilter, setContractClientFilter] = useState('ALL');
  const [contractSearch, setContractSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState(null);

  // Invoices State
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('ALL');
  const [invoiceClientFilter, setInvoiceClientFilter] = useState('ALL');
  const [invoiceSortBy, setInvoiceSortBy] = useState('created_desc');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceBuilder, setShowInvoiceBuilder] = useState(false);
  const [invoiceFormData, setInvoiceFormData] = useState(getInitialInvoiceForm());

  // Payment Verifications State
  const [confirmationsList, setConfirmationsList] = useState([]);
  const [loadingConfirmations, setLoadingConfirmations] = useState(false);
  const [confirmationStatusFilter, setConfirmationStatusFilter] = useState('ALL');
  const [confirmationSearch, setConfirmationSearch] = useState('');
  const [showConfirmVerificationModal, setShowConfirmVerificationModal] = useState(false);
  const [confirmingConfirmation, setConfirmingConfirmation] = useState(null);
  const [showRejectVerificationModal, setShowRejectVerificationModal] = useState(false);
  const [rejectingConfirmation, setRejectingConfirmation] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [verifyingAction, setVerifyingAction] = useState(false);

  // Email Composer Modal State
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [emailComposerType, setEmailComposerType] = useState('proposal_sent');
  const [emailComposerData, setEmailComposerData] = useState({});

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Copy Feedback
  const [copiedToken, setCopiedToken] = useState('');

  const adminUser = getAdminUsername() || 'Admin';

  function getInitialProposalForm() {
    return {
      client_id: '',
      title: '',
      description: '',
      currency: 'INR',
      discount: 0,
      tax: 0,
      valid_until: '',
      notes: 'Includes comprehensive QA, documentation, and 30-day post-launch support.',
      terms: 'Standard terms: 50% advance upon project kickoff, 50% upon milestone completion.',
      items: [
        { name: 'Core Deliverable Scope', description: 'Architecture, engineering, and milestone deployment', quantity: 1, unit_price: 25000 }
      ]
    };
  }

  function getInitialInvoiceForm() {
    return {
      client_id: '',
      proposal_id: null,
      currency: 'INR',
      discount: 0,
      tax: 0,
      due_date: '',
      notes: 'Payment due within 15 days of invoice date via Bank Transfer or UPI.',
      items: [
        { name: 'Service Milestone Phase 1', description: 'Phase 1 deliverable sign-off and deployment', quantity: 1, unit_price: 25000 }
      ]
    };
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }

  // Handle Tab Switch & Safe URL Sync
  const handleTabChange = (newTab) => {
    const validTabs = ['overview', 'proposals', 'contracts', 'invoices'];
    const clean = typeof newTab === 'string' && validTabs.includes(newTab.toLowerCase()) ? newTab.toLowerCase() : 'overview';
    setActiveTab(clean);
    window.history.replaceState({}, '', clean === 'overview' ? '/admin/finance' : `/admin/finance?tab=${clean}`);
  };

  // Sync tab with initial props/query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const validTabs = ['overview', 'proposals', 'contracts', 'invoices'];
    if (tabParam && validTabs.includes(tabParam.toLowerCase())) {
      setActiveTab(tabParam.toLowerCase());
    } else if (initialTab && typeof initialTab === 'string' && validTabs.includes(initialTab.toLowerCase())) {
      setActiveTab(initialTab.toLowerCase());
    }
  }, [initialTab]);

  // Load clients and global stats
  const loadGlobalData = async () => {
    setLoadingStats(true);
    try {
      const [statsData, clientsData, confData] = await Promise.all([
        fetchFinanceStats(),
        fetchClients({ status: 'ALL' }),
        fetchPaymentConfirmations({ status: 'ALL' }).catch(() => [])
      ]);
      setStats(statsData);
      setClientsList(clientsData);
      setConfirmationsList(confData);
    } catch (err) {
      if (err.status === 401) {
        clearAdminAuth();
        onLogout();
        return;
      }
      console.error('Failed to load global finance data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load Proposals
  const loadProposals = async () => {
    setLoadingProposals(true);
    try {
      const data = await fetchProposals({
        status: proposalStatusFilter,
        client_id: proposalClientFilter !== 'ALL' ? proposalClientFilter : undefined,
        search: proposalSearch,
        sort_by: proposalSortBy
      });
      setProposals(data);
      if (selectedProposal) {
        const updated = data.find(p => p.id === selectedProposal.id);
        if (updated) setSelectedProposal(updated);
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoadingProposals(false);
    }
  };

  // Load Contracts
  const loadContracts = async () => {
    setLoadingContracts(true);
    try {
      const data = await fetchContracts({
        status: contractStatusFilter,
        client_id: contractClientFilter !== 'ALL' ? contractClientFilter : undefined,
        search: contractSearch
      });
      setContracts(data);
      if (selectedContract) {
        const updated = data.find(c => c.id === selectedContract.id);
        if (updated) setSelectedContract(updated);
      }
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Load Invoices
  const loadInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const data = await fetchInvoices({
        status: invoiceStatusFilter,
        client_id: invoiceClientFilter !== 'ALL' ? invoiceClientFilter : undefined,
        search: invoiceSearch,
        sort_by: invoiceSortBy
      });
      setInvoices(data);
      if (selectedInvoice) {
        const updated = data.find(i => i.id === selectedInvoice.id);
        if (updated) setSelectedInvoice(updated);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  // Load Payment Confirmations
  const loadConfirmations = async () => {
    setLoadingConfirmations(true);
    try {
      const data = await fetchPaymentConfirmations({
        status: confirmationStatusFilter !== 'ALL' ? confirmationStatusFilter : undefined
      });
      setConfirmationsList(data);
    } catch (err) {
      console.error('Failed to load payment confirmations:', err);
    } finally {
      setLoadingConfirmations(false);
    }
  };

  // On mount and tab change
  useEffect(() => {
    loadGlobalData();
  }, []);

  useEffect(() => {
    if (activeTab === 'proposals') {
      loadProposals();
    } else if (activeTab === 'contracts') {
      loadContracts();
    } else if (activeTab === 'invoices') {
      loadInvoices();
    } else if (activeTab === 'verifications') {
      loadConfirmations();
    } else {
      loadGlobalData();
    }
  }, [
    activeTab,
    proposalStatusFilter,
    proposalClientFilter,
    proposalSortBy,
    contractStatusFilter,
    contractClientFilter,
    invoiceStatusFilter,
    invoiceClientFilter,
    invoiceSortBy,
    confirmationStatusFilter
  ]);

  // Debounced search filters
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'proposals') loadProposals();
    }, 280);
    return () => clearTimeout(timer);
  }, [proposalSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'contracts') loadContracts();
    }, 280);
    return () => clearTimeout(timer);
  }, [contractSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'invoices') loadInvoices();
    }, 280);
    return () => clearTimeout(timer);
  }, [invoiceSearch]);

  const refreshData = () => {
    loadGlobalData();
    if (activeTab === 'proposals') loadProposals();
    else if (activeTab === 'contracts') loadContracts();
    else if (activeTab === 'invoices') loadInvoices();
    else if (activeTab === 'verifications') loadConfirmations();
  };

  // Copy public proposal link helper
  const handleCopyLink = (token) => {
    const url = `${window.location.origin}/proposal/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      showToast('Public proposal approval link copied to clipboard.');
      setTimeout(() => setCopiedToken(''), 3000);
    });
  };

  const handleCopyContractLink = (token) => {
    const url = `${window.location.origin}/contract/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      showToast('Public contract agreement link copied to clipboard.');
      setTimeout(() => setCopiedToken(''), 3000);
    });
  };

  const handleCopyInvoiceLink = (token) => {
    const url = `${window.location.origin}/invoice/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      showToast('Public invoice payment link copied to clipboard.');
      setTimeout(() => setCopiedToken(''), 3000);
    });
  };

  const handleOpenEmailComposer = (type, data) => {
    setEmailComposerType(type);
    setEmailComposerData(data);
    setEmailComposerOpen(true);
  };

  const handleConfirmVerification = async (conf) => {
    setVerifyingAction(true);
    try {
      await confirmPaymentVerification(conf.id);
      showToast(`Payment of $${conf.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} verified & confirmed!`);
      setShowConfirmVerificationModal(false);
      setConfirmingConfirmation(null);
      loadConfirmations();
      loadGlobalData();
      if (activeTab === 'invoices') loadInvoices();
    } catch (err) {
      alert(err.message || 'Failed to verify payment confirmation.');
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleRejectVerification = async (e) => {
    if (e) e.preventDefault();
    if (!rejectingConfirmation) return;
    setVerifyingAction(true);
    try {
      await rejectPaymentVerification(rejectingConfirmation.id, rejectReason.trim());
      showToast(`Payment verification for ${rejectingConfirmation.invoice_number || 'Invoice'} rejected.`);
      setShowRejectVerificationModal(false);
      setRejectingConfirmation(null);
      setRejectReason('');
      loadConfirmations();
      loadGlobalData();
    } catch (err) {
      alert(err.message || 'Failed to reject payment confirmation.');
    } finally {
      setVerifyingAction(false);
    }
  };

  // Proposal Builder helpers
  const handleAddProposalItem = () => {
    setProposalFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const handleUpdateProposalItem = (index, field, value) => {
    setProposalFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleRemoveProposalItem = (index) => {
    setProposalFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveProposal = async (e) => {
    e.preventDefault();
    if (!proposalFormData.client_id || !proposalFormData.title) {
      alert('Please select a client and enter a proposal title.');
      return;
    }
    try {
      const payload = {
        client_id: Number(proposalFormData.client_id),
        title: proposalFormData.title,
        description: proposalFormData.description || null,
        currency: proposalFormData.currency,
        discount: parseFloat(proposalFormData.discount || 0),
        tax: parseFloat(proposalFormData.tax || 0),
        valid_until: proposalFormData.valid_until ? new Date(proposalFormData.valid_until).toISOString() : null,
        notes: proposalFormData.notes || null,
        terms: proposalFormData.terms || null,
        items: proposalFormData.items.map((it, idx) => ({
          name: it.name || `Deliverable ${idx + 1}`,
          description: it.description || null,
          quantity: parseFloat(it.quantity || 1),
          unit_price: parseFloat(it.unit_price || 0),
          order_index: idx
        }))
      };
      await createProposal(payload);
      setShowProposalBuilder(false);
      showToast('Commercial Proposal created successfully.');
      loadProposals();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to create proposal: ${err.message}`);
    }
  };

  // Send Proposal
  const handleSendProposal = async (proposalId) => {
    try {
      await sendProposal(proposalId);
      showToast('Proposal marked as SENT to client.');
      loadProposals();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to send proposal: ${err.message}`);
    }
  };

  // Accept Proposal
  const handleAcceptProposal = async (proposalId) => {
    try {
      await acceptProposalAdmin(proposalId);
      showToast('Proposal marked as ACCEPTED.');
      loadProposals();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to accept proposal: ${err.message}`);
    }
  };

  // Duplicate Proposal
  const handleDuplicateProposal = async (proposalId) => {
    try {
      await duplicateProposal(proposalId);
      showToast('Proposal duplicated as a new DRAFT.');
      loadProposals();
    } catch (err) {
      alert(`Failed to duplicate proposal: ${err.message}`);
    }
  };

  // Delete Proposal
  const handleDeleteProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to delete this proposal?')) return;
    try {
      await deleteProposal(proposalId);
      showToast('Proposal deleted.');
      setSelectedProposal(null);
      loadProposals();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to delete proposal: ${err.message}`);
    }
  };

  // Convert Proposal to Contract
  const handleGenerateContract = async (proposalId) => {
    try {
      const contract = await createContractFromProposal(proposalId);
      showToast(`Contract ${contract.contract_number} generated successfully.`);
      handleTabChange('contracts');
      setSelectedContract(contract);
    } catch (err) {
      alert(`Failed to generate contract: ${err.message}`);
    }
  };

  // Convert Proposal to Invoice
  const handleConvertProposalToInvoice = async (proposalId) => {
    try {
      const invoice = await createInvoiceFromProposal(proposalId);
      showToast(`Invoice ${invoice.invoice_number} created from proposal.`);
      handleTabChange('invoices');
      setSelectedInvoice(invoice);
    } catch (err) {
      alert(`Failed to convert to invoice: ${err.message}`);
    }
  };

  // Invoice Builder helpers
  const handleAddInvoiceItem = () => {
    setInvoiceFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const handleUpdateInvoiceItem = (index, field, value) => {
    setInvoiceFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleRemoveInvoiceItem = (index) => {
    setInvoiceFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceFormData.client_id) {
      alert('Please select a client.');
      return;
    }
    try {
      const payload = {
        client_id: Number(invoiceFormData.client_id),
        proposal_id: invoiceFormData.proposal_id ? Number(invoiceFormData.proposal_id) : null,
        currency: invoiceFormData.currency,
        discount: parseFloat(invoiceFormData.discount || 0),
        tax: parseFloat(invoiceFormData.tax || 0),
        due_date: invoiceFormData.due_date ? new Date(invoiceFormData.due_date).toISOString() : null,
        notes: invoiceFormData.notes || null,
        items: invoiceFormData.items.map((it, idx) => ({
          name: it.name || `Milestone ${idx + 1}`,
          description: it.description || null,
          quantity: parseFloat(it.quantity || 1),
          unit_price: parseFloat(it.unit_price || 0),
          order_index: idx
        }))
      };
      await createInvoice(payload);
      setShowInvoiceBuilder(false);
      showToast('Client invoice created successfully.');
      loadInvoices();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to create invoice: ${err.message}`);
    }
  };

  // Send Invoice
  const handleSendInvoice = async (invoiceId) => {
    try {
      await sendInvoice(invoiceId);
      showToast('Invoice marked as SENT to client.');
      loadInvoices();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to send invoice: ${err.message}`);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(invoiceId);
      showToast('Invoice deleted.');
      setSelectedInvoice(null);
      loadInvoices();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to delete invoice: ${err.message}`);
    }
  };

  // Record Payment
  const handleOpenPaymentModal = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentAmount(invoice.amount_due ? String(invoice.amount_due) : String(invoice.total));
    setPaymentMethod('BANK_TRANSFER');
    setPaymentRef('');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentInvoice || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    setRecordingPayment(true);
    try {
      await recordInvoicePayment(paymentInvoice.id, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        reference: paymentRef.trim() || null,
        notes: paymentNotes.trim() || null
      });
      setShowPaymentModal(false);
      showToast('Payment recorded successfully.');
      loadInvoices();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to record payment: ${err.message}`);
    } finally {
      setRecordingPayment(false);
    }
  };

  // Contract actions
  const handleSendContract = async (contractId) => {
    try {
      await sendContract(contractId);
      showToast('Contract marked as SENT.');
      loadContracts();
    } catch (err) {
      alert(`Failed to send contract: ${err.message}`);
    }
  };

  const handleAcceptContract = async (contractId) => {
    try {
      await acceptContract(contractId);
      showToast('Contract marked as SIGNED / ACCEPTED.');
      loadContracts();
      loadGlobalData();
    } catch (err) {
      alert(`Failed to sign contract: ${err.message}`);
    }
  };

  // Calculated draft totals preview
  const calculateDraftTotals = (form) => {
    const subtotal = form.items.reduce((sum, it) => sum + (parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0)), 0);
    const disc = parseFloat(form.discount || 0);
    const tax = parseFloat(form.tax || 0);
    const total = Math.max(0, subtotal - disc + tax);
    return { subtotal, total };
  };

  return (
    <div className="admin-app-root">
      {/* Top Admin Navbar with Tab Switcher */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="brand">THE SORTED <span>CLUB</span></div>
          <span className="admin-badge">COMMERCIAL & FINANCE</span>

          {/* Navigation Switcher with 6 Tabs */}
          <div className="admin-nav-tabs">
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => (onNavigateToCommandCenter ? onNavigateToCommandCenter() : onNavigateToInquiries && onNavigateToInquiries())}
            >
              <Layers size={14} />
              <span>Command Center</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToInquiries && onNavigateToInquiries()}
            >
              <Inbox size={14} />
              <span>Inquiries</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToCRM && onNavigateToCRM()}
            >
              <Kanban size={14} />
              <span>Sales Pipeline</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToClients && onNavigateToClients()}
            >
              <Users size={14} />
              <span>Clients & Onboarding</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn active"
            >
              <DollarSign size={14} />
              <span>Commercial & Finance</span>
            </button>
            <button
              type="button"
              className="admin-tab-btn"
              onClick={() => onNavigateToProjects && onNavigateToProjects()}
            >
              <FolderKanban size={14} />
              <span>Projects & Delivery</span>
            </button>
          </div>
        </div>

        <div className="admin-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NotificationCenter
            onNavigate={(url) => {
              if (url.startsWith('/admin/crm')) {
                onNavigateToCRM && onNavigateToCRM();
              } else if (url.startsWith('/admin/finance')) {
                const tab = new URLSearchParams(url.split('?')[1] || '').get('tab');
                if (tab) setActiveTab(tab);
              } else if (url.startsWith('/admin/clients')) {
                const cid = new URLSearchParams(url.split('?')[1] || '').get('selectedClient');
                onNavigateToClients && onNavigateToClients(cid);
              } else if (url.startsWith('/admin/projects')) {
                const pid = new URLSearchParams(url.split('?')[1] || '').get('selectedProject');
                onNavigateToProjects && onNavigateToProjects(pid);
              } else if (url.startsWith('/admin')) {
                onNavigateToInquiries && onNavigateToInquiries();
              }
            }}
          />
          <button
            onClick={onBackToSite}
            className="admin-link-btn"
            title="Return to public site"
            type="button"
          >
            <ArrowLeft size={16} /> View Website
          </button>
          <div className="admin-user-info">
            <span className="admin-user-dot" />
            <span>{adminUser}</span>
          </div>
          <button
            onClick={() => {
              clearAdminAuth();
              onLogout();
            }}
            className="admin-logout-btn"
            title="Log out of admin session"
            type="button"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main-content">
        {/* Toast Banner */}
        {toastMessage && (
          <div className="admin-toast-banner" style={{ background: '#10100f', color: '#fff', padding: '10px 18px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle size={16} color="var(--acid)" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Head */}
        <div className="admin-page-head">
          <div>
            <p className="eyebrow" style={{ color: 'var(--muted)' }}>FINANCIAL OPERATIONS & REVENUE ENGINE</p>
            <h1>Commercial & Finance</h1>
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '4px 0 0' }}>
              Manage proposals, contracts, invoices and payments.
            </p>
          </div>
          <div className="admin-head-actions">
            <button
              onClick={refreshData}
              className="admin-refresh-btn"
              disabled={loadingStats || loadingProposals || loadingContracts || loadingInvoices}
              title="Refresh Data"
              type="button"
            >
              <RefreshCw size={16} className={(loadingStats || loadingProposals || loadingContracts || loadingInvoices) ? 'spinner' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <TrendingUp size={14} />
              <span>Overview & Metrics</span>
            </button>
            <button
              type="button"
              className={`view-btn ${activeTab === 'proposals' ? 'active' : ''}`}
              onClick={() => handleTabChange('proposals')}
            >
              <FileText size={14} />
              <span>Proposals {stats ? `(${stats.proposals_pending_count + stats.proposals_accepted_count})` : ''}</span>
            </button>
            <button
              type="button"
              className={`view-btn ${activeTab === 'contracts' ? 'active' : ''}`}
              onClick={() => handleTabChange('contracts')}
            >
              <FileCheck size={14} />
              <span>Contracts</span>
            </button>
            <button
              type="button"
              className={`view-btn ${activeTab === 'invoices' ? 'active' : ''}`}
              onClick={() => handleTabChange('invoices')}
            >
              <Receipt size={14} />
              <span>Invoices & Payments</span>
            </button>
            <button
              type="button"
              className={`view-btn ${activeTab === 'verifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('verifications')}
            >
              <Shield size={14} />
              <span>
                Payment Verifications
                {confirmationsList.filter(c => c.status === 'PENDING_VERIFICATION').length > 0 && (
                  <span style={{ marginLeft: '6px', background: '#dc2626', color: '#fff', padding: '1px 7px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
                    {confirmationsList.filter(c => c.status === 'PENDING_VERIFICATION').length}
                  </span>
                )}
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {activeTab === 'proposals' && (
              <button
                type="button"
                className="navcta primary"
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                onClick={() => {
                  setProposalFormData(getInitialProposalForm());
                  setShowProposalBuilder(true);
                }}
              >
                <Plus size={15} />
                <span>Create Proposal</span>
              </button>
            )}
            {activeTab === 'invoices' && (
              <button
                type="button"
                className="navcta primary"
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
                onClick={() => {
                  setInvoiceFormData(getInitialInvoiceForm());
                  setShowInvoiceBuilder(true);
                }}
              >
                <Plus size={15} />
                <span>Create Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: OVERVIEW & METRICS
        ------------------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div>
            {/* 6 Real Financial Metric Cards */}
            <div className="crm-metrics-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              <div className="crm-metric-card highlight-metric">
                <div className="crm-metric-label">TOTAL INVOICED</div>
                <div className="crm-metric-val">
                  {stats ? formatMoney(stats.total_invoiced_amount, stats.currency) : '₹0.00'}
                </div>
                <div className="crm-metric-sub">
                  {stats ? `${stats.invoices_paid_count + stats.invoices_overdue_count + (stats.invoices_partially_paid_count || 0)} invoices issued` : 'All issued bills'}
                </div>
              </div>

              <div className="crm-metric-card">
                <div className="crm-metric-label" style={{ color: '#15803d' }}>COLLECTED REVENUE</div>
                <div className="crm-metric-val" style={{ color: '#15803d' }}>
                  {stats ? formatMoney(stats.total_paid_amount, stats.currency) : '₹0.00'}
                </div>
                <div className="crm-metric-sub">Realized cash flow</div>
              </div>

              <div className="crm-metric-card">
                <div className="crm-metric-label" style={{ color: '#0369a1' }}>OUTSTANDING BALANCE</div>
                <div className="crm-metric-val" style={{ color: '#0369a1' }}>
                  {stats ? formatMoney(stats.total_outstanding_amount, stats.currency) : '₹0.00'}
                </div>
                <div className="crm-metric-sub">Awaiting settlement</div>
              </div>

              <div className={`crm-metric-card ${stats?.total_overdue_amount > 0 ? 'overdue-alert' : ''}`}>
                <div className="crm-metric-label" style={{ color: '#dc2626' }}>OVERDUE AMOUNT</div>
                <div className="crm-metric-val" style={{ color: '#dc2626' }}>
                  {stats ? formatMoney(stats.total_overdue_amount, stats.currency) : '₹0.00'}
                </div>
                <div className="crm-metric-sub">
                  {stats ? `${stats.invoices_overdue_count} overdue invoices` : 'Past due date'}
                </div>
              </div>

              <div className="crm-metric-card">
                <div className="crm-metric-label">ACTIVE PROPOSALS</div>
                <div className="crm-metric-val">
                  {stats ? stats.proposals_pending_count : 0}
                </div>
                <div className="crm-metric-sub">
                  {stats ? `Pipeline: ${formatMoney(stats.proposals_pending_value, stats.currency)}` : 'In negotiation'}
                </div>
              </div>

              <div className="crm-metric-card">
                <div className="crm-metric-label">PROPOSAL WIN RATE</div>
                <div className="crm-metric-val">
                  {stats ? `${Math.round(stats.proposals_win_rate)}%` : '0%'}
                </div>
                <div className="crm-metric-sub">
                  {stats ? `${stats.proposals_accepted_count} accepted / ${stats.proposals_accepted_count + stats.proposals_rejected_count} decided` : 'Conversion speed'}
                </div>
              </div>
            </div>

            {/* Quick Actions Launchpad */}
            <div style={{ marginTop: '28px' }}>
              <p className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '12px' }}>COMMERCIAL ACCELERATORS</p>
              <div className="finance-launchpad-grid">
                <div
                  className="launchpad-card"
                  onClick={() => {
                    setProposalFormData(getInitialProposalForm());
                    setShowProposalBuilder(true);
                  }}
                >
                  <div className="launchpad-icon-wrap" style={{ background: '#f4f1e9', color: '#10100f' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4>BUILD COMMERCIAL PROPOSAL</h4>
                    <p>Scope line items, rates, and generate tokenized online approval links.</p>
                  </div>
                  <ChevronRight size={18} className="launchpad-arrow" />
                </div>

                <div
                  className="launchpad-card"
                  onClick={() => {
                    setInvoiceFormData(getInitialInvoiceForm());
                    setShowInvoiceBuilder(true);
                  }}
                >
                  <div className="launchpad-icon-wrap" style={{ background: '#f0fdf4', color: '#15803d' }}>
                    <Receipt size={22} />
                  </div>
                  <div>
                    <h4>ISSUE CLIENT INVOICE</h4>
                    <p>Bill milestone deliverables, manage due dates, and track partial payments.</p>
                  </div>
                  <ChevronRight size={18} className="launchpad-arrow" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: PROPOSALS
        ------------------------------------------------------------- */}
        {activeTab === 'proposals' && (
          <div>
            {/* Filter Bar */}
            <div className="admin-controls-card">
              <div className="admin-search-box">
                <Search size={18} className="search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search proposals by number (SC-P-...), title, description..."
                  value={proposalSearch}
                  onChange={(e) => setProposalSearch(e.target.value)}
                  aria-label="Search proposals"
                />
                {proposalSearch && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setProposalSearch('')}
                    aria-label="Clear search"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="crm-filter-bar">
                {/* Status Filter */}
                <div className="filter-select-group">
                  <span className="filter-label">Status:</span>
                  <select
                    value={proposalStatusFilter}
                    onChange={(e) => setProposalStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="VIEWED">Viewed</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>

                {/* Client Filter */}
                <div className="filter-select-group">
                  <span className="filter-label">Client:</span>
                  <select
                    value={proposalClientFilter}
                    onChange={(e) => setProposalClientFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Clients</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="filter-select-group" style={{ marginLeft: 'auto' }}>
                  <span className="filter-label">Sort:</span>
                  <select
                    value={proposalSortBy}
                    onChange={(e) => setProposalSortBy(e.target.value)}
                    className="admin-select"
                  >
                    <option value="created_desc">Newest First</option>
                    <option value="created_asc">Oldest First</option>
                    <option value="total_desc">Highest Value</option>
                    <option value="total_asc">Lowest Value</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Proposals Table */}
            <div className="admin-table-container">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>PROPOSAL NUMBER</th>
                      <th>CLIENT</th>
                      <th>TITLE</th>
                      <th>STATUS</th>
                      <th>TOTAL</th>
                      <th>VALID UNTIL</th>
                      <th>CREATED</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProposals ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                          <Loader2 size={24} className="spinner" style={{ margin: '0 auto' }} />
                        </td>
                      </tr>
                    ) : proposals.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <div className="admin-empty-state">
                            <div className="empty-icon-box">
                              <FileText size={24} color="var(--muted)" />
                            </div>
                            <h3>No proposals found</h3>
                            <p>Create your first commercial proposal to send tokenized approval documents to clients.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      proposals.map(p => (
                        <tr
                          key={p.id}
                          className={`lead-row ${selectedProposal?.id === p.id ? 'selected' : ''}`}
                          onClick={() => setSelectedProposal(p)}
                        >
                          <td>
                            <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '3px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                              {p.proposal_number}
                            </span>
                          </td>
                          <td>
                            <div className="lead-name-cell">
                              <strong>{p.client ? p.client.business_name : `Client #${p.client_id}`}</strong>
                              <span className="lead-email-sub">{p.client?.name}</span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--ink)' }}>{p.title}</strong>
                          </td>
                          <td>
                            <ProposalStatusBadge status={p.status} />
                          </td>
                          <td>
                            <strong style={{ font: '700 13px "Space Grotesk", monospace' }}>
                              {formatMoney(p.total, p.currency)}
                            </strong>
                          </td>
                          <td>
                            <span className="lead-date">
                              {p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-IN') : 'Open'}
                            </span>
                          </td>
                          <td>
                            <span className="lead-date">
                              {new Date(p.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="btn-icon"
                                title="Copy public approval link"
                                onClick={() => handleCopyLink(p.secure_token)}
                              >
                                {copiedToken === p.secure_token ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                title="Duplicate proposal as draft"
                                onClick={() => handleDuplicateProposal(p.id)}
                              >
                                <DuplicateIcon size={16} />
                              </button>
                              <button
                                type="button"
                                className="btn-icon"
                                title="Delete proposal"
                                onClick={() => handleDeleteProposal(p.id)}
                              >
                                <Trash2 size={16} />
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
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: CONTRACTS
        ------------------------------------------------------------- */}
        {activeTab === 'contracts' && (
          <div>
            {/* Filter Bar */}
            <div className="admin-controls-card">
              <div className="admin-search-box">
                <Search size={18} className="search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search contracts by number (SC-C-...), title..."
                  value={contractSearch}
                  onChange={(e) => setContractSearch(e.target.value)}
                  aria-label="Search contracts"
                />
                {contractSearch && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setContractSearch('')}
                    aria-label="Clear search"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="crm-filter-bar">
                <div className="filter-select-group">
                  <span className="filter-label">Status:</span>
                  <select
                    value={contractStatusFilter}
                    onChange={(e) => setContractStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Contract Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="ACCEPTED">Signed / Accepted</option>
                    <option value="REJECTED">Declined</option>
                  </select>
                </div>

                <div className="filter-select-group">
                  <span className="filter-label">Client:</span>
                  <select
                    value={contractClientFilter}
                    onChange={(e) => setContractClientFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Clients</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contracts Table */}
            <div className="admin-table-container">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>CONTRACT NUMBER</th>
                      <th>AGREEMENT TITLE</th>
                      <th>CLIENT</th>
                      <th>STATUS</th>
                      <th>CREATED</th>
                      <th>ACCEPTED / SIGNED</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingContracts ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                          <Loader2 size={24} className="spinner" style={{ margin: '0 auto' }} />
                        </td>
                      </tr>
                    ) : contracts.length === 0 ? (
                      <tr>
                        <td colSpan="7">
                          <div className="admin-empty-state">
                            <div className="empty-icon-box">
                              <FileCheck size={24} color="var(--muted)" />
                            </div>
                            <h3>No contracts generated</h3>
                            <p>Generate Master Services Agreements automatically from accepted client proposals.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      contracts.map(c => (
                        <tr
                          key={c.id}
                          className={`lead-row ${selectedContract?.id === c.id ? 'selected' : ''}`}
                          onClick={() => setSelectedContract(c)}
                        >
                          <td>
                            <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '3px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                              {c.contract_number}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--ink)' }}>{c.title}</strong>
                          </td>
                          <td>
                            <div className="lead-name-cell">
                              <strong>{c.client ? c.client.business_name : `Client #${c.client_id}`}</strong>
                              <span className="lead-email-sub">{c.client?.name}</span>
                            </div>
                          </td>
                          <td>
                            <ContractStatusBadge status={c.status} />
                          </td>
                          <td>
                            <span className="lead-date">
                              {new Date(c.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </td>
                          <td>
                            <span className="lead-date">
                              {c.accepted_at ? new Date(c.accepted_at).toLocaleDateString('en-IN') : '—'}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                              {c.status === 'DRAFT' && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  title="Send to client"
                                  onClick={() => handleSendContract(c.id)}
                                >
                                  <Send size={16} />
                                </button>
                              )}
                              {c.status === 'SENT' && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  title="Mark Signed"
                                  onClick={() => handleAcceptContract(c.id)}
                                >
                                  <Check size={16} color="#15803d" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: INVOICES & PAYMENTS
        ------------------------------------------------------------- */}
        {activeTab === 'invoices' && (
          <div>
            {/* Filter Bar */}
            <div className="admin-controls-card">
              <div className="admin-search-box">
                <Search size={18} className="search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search invoices by number (SC-INV-...), notes..."
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  aria-label="Search invoices"
                />
                {invoiceSearch && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setInvoiceSearch('')}
                    aria-label="Clear search"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="crm-filter-bar">
                <div className="filter-select-group">
                  <span className="filter-label">Status:</span>
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Invoice Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PARTIALLY_PAID">Partially Paid</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="filter-select-group">
                  <span className="filter-label">Client:</span>
                  <select
                    value={invoiceClientFilter}
                    onChange={(e) => setInvoiceClientFilter(e.target.value)}
                    className="admin-select"
                  >
                    <option value="ALL">All Clients</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-group" style={{ marginLeft: 'auto' }}>
                  <span className="filter-label">Sort:</span>
                  <select
                    value={invoiceSortBy}
                    onChange={(e) => setInvoiceSortBy(e.target.value)}
                    className="admin-select"
                  >
                    <option value="created_desc">Newest First</option>
                    <option value="created_asc">Oldest First</option>
                    <option value="due_asc">Due Date (Earliest)</option>
                    <option value="total_desc">Highest Total</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="admin-table-container">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>INVOICE NUMBER</th>
                      <th>CLIENT</th>
                      <th>TOTAL</th>
                      <th>PAID</th>
                      <th>BALANCE DUE</th>
                      <th>STATUS</th>
                      <th>DUE DATE</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingInvoices ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                          <Loader2 size={24} className="spinner" style={{ margin: '0 auto' }} />
                        </td>
                      </tr>
                    ) : invoices.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <div className="admin-empty-state">
                            <div className="empty-icon-box">
                              <Receipt size={24} color="var(--muted)" />
                            </div>
                            <h3>No invoices issued</h3>
                            <p>Issue invoices for milestone deliverables or convert accepted proposals directly.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      invoices.map(inv => (
                        <tr
                          key={inv.id}
                          className={`lead-row ${selectedInvoice?.id === inv.id ? 'selected' : ''}`}
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          <td>
                            <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '3px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                              {inv.invoice_number}
                            </span>
                          </td>
                          <td>
                            <div className="lead-name-cell">
                              <strong>{inv.client ? inv.client.business_name : `Client #${inv.client_id}`}</strong>
                              <span className="lead-email-sub">{inv.client?.name}</span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ font: '700 13px "Space Grotesk", monospace' }}>
                              {formatMoney(inv.total, inv.currency)}
                            </strong>
                          </td>
                          <td>
                            <span style={{ color: '#15803d', fontWeight: 600, font: '600 13px monospace' }}>
                              {formatMoney(inv.amount_paid, inv.currency)}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: inv.amount_due > 0 ? '#dc2626' : '#68665e', fontWeight: 700, font: '700 13px monospace' }}>
                              {formatMoney(inv.amount_due, inv.currency)}
                            </span>
                          </td>
                          <td>
                            <InvoiceStatusBadge status={inv.status} />
                          </td>
                          <td>
                            <span className="lead-date">
                              {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'Upon receipt'}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                              {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  className="btn-icon"
                                  title="Record payment"
                                  onClick={() => handleOpenPaymentModal(inv)}
                                >
                                  <CreditCard size={16} color="#15803d" />
                                </button>
                              )}
                              <button
                                type="button"
                                className="btn-icon"
                                title="Delete invoice"
                                onClick={() => handleDeleteInvoice(inv.id)}
                              >
                                <Trash2 size={16} />
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
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 5: PAYMENT VERIFICATIONS
        ------------------------------------------------------------- */}
        {activeTab === 'verifications' && (
          <div>
            <div className="crm-table-card">
              {/* Filters Bar */}
              <div className="crm-filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="view-mode-toggle" style={{ margin: 0 }}>
                    <button
                      type="button"
                      className={`view-btn ${confirmationStatusFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setConfirmationStatusFilter('ALL')}
                    >
                      All ({confirmationsList.length})
                    </button>
                    <button
                      type="button"
                      className={`view-btn ${confirmationStatusFilter === 'PENDING_VERIFICATION' ? 'active' : ''}`}
                      onClick={() => setConfirmationStatusFilter('PENDING_VERIFICATION')}
                    >
                      Pending Review ({confirmationsList.filter(c => c.status === 'PENDING_VERIFICATION').length})
                    </button>
                    <button
                      type="button"
                      className={`view-btn ${confirmationStatusFilter === 'CONFIRMED' ? 'active' : ''}`}
                      onClick={() => setConfirmationStatusFilter('CONFIRMED')}
                    >
                      Confirmed ({confirmationsList.filter(c => c.status === 'CONFIRMED').length})
                    </button>
                    <button
                      type="button"
                      className={`view-btn ${confirmationStatusFilter === 'REJECTED' ? 'active' : ''}`}
                      onClick={() => setConfirmationStatusFilter('REJECTED')}
                    >
                      Rejected ({confirmationsList.filter(c => c.status === 'REJECTED').length})
                    </button>
                  </div>
                </div>

                <div className="crm-search-box" style={{ width: '260px' }}>
                  <Search size={14} className="crm-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by client, ref, or payer..."
                    value={confirmationSearch}
                    onChange={(e) => setConfirmationSearch(e.target.value)}
                    className="crm-search-input"
                  />
                  {confirmationSearch && (
                    <button type="button" onClick={() => setConfirmationSearch('')} className="crm-search-clear">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th style={{ width: '130px' }}>Submitted Date</th>
                      <th>Client / Business</th>
                      <th style={{ width: '120px' }}>Invoice</th>
                      <th style={{ width: '120px' }}>Claimed Amount</th>
                      <th style={{ width: '120px' }}>Method</th>
                      <th>Transaction / UTR Reference</th>
                      <th>Submitted By</th>
                      <th style={{ width: '150px' }}>Status</th>
                      <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingConfirmations ? (
                      <tr>
                        <td colSpan="9" className="crm-empty-state">
                          <Loader2 className="spinner" size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                          <p>Loading payment confirmations...</p>
                        </td>
                      </tr>
                    ) : confirmationsList.filter(c => {
                        if (!confirmationSearch.trim()) return true;
                        const term = confirmationSearch.toLowerCase();
                        return (
                          (c.client_business_name && c.client_business_name.toLowerCase().includes(term)) ||
                          (c.client_name && c.client_name.toLowerCase().includes(term)) ||
                          (c.invoice_number && c.invoice_number.toLowerCase().includes(term)) ||
                          (c.reference && c.reference.toLowerCase().includes(term)) ||
                          (c.payer_name && c.payer_name.toLowerCase().includes(term)) ||
                          (c.payer_email && c.payer_email.toLowerCase().includes(term))
                        );
                      }).length === 0 ? (
                      <tr>
                        <td colSpan="9" className="crm-empty-state">
                          <Shield size={32} style={{ color: 'var(--muted)', margin: '0 auto 8px', display: 'block' }} />
                          <h3>No payment confirmations found</h3>
                          <p>Customer submissions from public invoice payment pages will appear here for review.</p>
                        </td>
                      </tr>
                    ) : (
                      confirmationsList
                        .filter(c => {
                          if (!confirmationSearch.trim()) return true;
                          const term = confirmationSearch.toLowerCase();
                          return (
                            (c.client_business_name && c.client_business_name.toLowerCase().includes(term)) ||
                            (c.client_name && c.client_name.toLowerCase().includes(term)) ||
                            (c.invoice_number && c.invoice_number.toLowerCase().includes(term)) ||
                            (c.reference && c.reference.toLowerCase().includes(term)) ||
                            (c.payer_name && c.payer_name.toLowerCase().includes(term)) ||
                            (c.payer_email && c.payer_email.toLowerCase().includes(term))
                          );
                        })
                        .map(conf => (
                          <tr key={conf.id} className="lead-row">
                            <td>
                              <span className="lead-date">
                                {new Date(conf.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                {new Date(conf.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td>
                              <div className="lead-name-cell">
                                <strong>{conf.client_business_name || conf.client_name || `Client #${conf.client_id}`}</strong>
                                {conf.client_name && <span className="lead-email-sub">{conf.client_name}</span>}
                              </div>
                            </td>
                            <td>
                              <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '3px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                                {conf.invoice_number || `INV #${conf.invoice_id}`}
                              </span>
                            </td>
                            <td>
                              <strong style={{ font: '700 13px "Space Grotesk", monospace', color: '#15803d' }}>
                                ${conf.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </strong>
                            </td>
                            <td>
                              <span className="badge badge-light" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                {conf.payment_method}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>
                                {conf.reference}
                              </div>
                              {conf.notes && (
                                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', fontStyle: 'italic' }}>
                                  "{conf.notes}"
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{conf.payer_name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{conf.payer_email}</div>
                            </td>
                            <td>
                              <PaymentConfirmationStatusBadge status={conf.status} />
                              {conf.status === 'REJECTED' && conf.rejection_reason && (
                                <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '3px' }}>
                                  Reason: {conf.rejection_reason}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="row-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                                {conf.status === 'PENDING_VERIFICATION' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-primary btn-sm"
                                      style={{ fontSize: '11px', padding: '4px 10px', height: '28px', background: '#15803d', borderColor: '#15803d' }}
                                      title="Verify and confirm payment"
                                      onClick={() => {
                                        setConfirmingConfirmation(conf);
                                        setShowConfirmVerificationModal(true);
                                      }}
                                    >
                                      <CheckCircle size={13} />
                                      <span>Confirm</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-outline-danger btn-sm"
                                      style={{ fontSize: '11px', padding: '4px 8px', height: '28px' }}
                                      title="Reject payment confirmation"
                                      onClick={() => {
                                        setRejectingConfirmation(conf);
                                        setRejectReason('');
                                        setShowRejectVerificationModal(true);
                                      }}
                                    >
                                      <X size={13} />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  className="btn-icon"
                                  title="Open Email Composer"
                                  onClick={() => handleOpenEmailComposer('payment_confirmed', {
                                    client_name: conf.payer_name || conf.client_name,
                                    client_business_name: conf.client_business_name,
                                    client_email: conf.payer_email,
                                    confirmation: conf
                                  })}
                                >
                                  <Mail size={15} />
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
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          PROPOSAL DETAIL DRAWER
      ------------------------------------------------------------- */}
      {selectedProposal && (
        <div className="drawer-overlay" onClick={() => setSelectedProposal(null)}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '2px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                    {selectedProposal.proposal_number}
                  </span>
                  <ProposalStatusBadge status={selectedProposal.status} size="small" />
                </div>
                <h2>{selectedProposal.title}</h2>
                <div className="drawer-biz-name">
                  Client: {selectedProposal.client?.business_name || `Account #${selectedProposal.client_id}`}
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedProposal(null)}
                aria-label="Close proposal drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Financial Snapshot */}
              <div className="drawer-section">
                <span className="section-subtitle">FINANCIAL SNAPSHOT</span>
                <div className="info-kv-grid">
                  <div className="kv-item">
                    <span className="kv-label">Subtotal</span>
                    <span className="kv-val">{formatMoney(selectedProposal.subtotal, selectedProposal.currency)}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Discount</span>
                    <span className="kv-val">{formatMoney(selectedProposal.discount, selectedProposal.currency)}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Tax / GST</span>
                    <span className="kv-val">{formatMoney(selectedProposal.tax, selectedProposal.currency)}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Grand Total</span>
                    <span className="kv-val" style={{ color: '#15803d', fontWeight: 700 }}>
                      {formatMoney(selectedProposal.total, selectedProposal.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="drawer-section">
                <span className="section-subtitle">COMMERCIAL ACTIONS</span>
                <div className="outreach-grid">
                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => handleCopyLink(selectedProposal.secure_token)}
                  >
                    {copiedToken === selectedProposal.secure_token ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                    <span>Copy Tokenized Public Approval Link</span>
                  </button>

                  <a
                    href={`/proposal/${selectedProposal.secure_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="outreach-btn"
                  >
                    <ExternalLink size={16} />
                    <span>Open Public Proposal Document</span>
                  </a>

                  {selectedProposal.status === 'DRAFT' && (
                    <button
                      type="button"
                      className="outreach-btn"
                      onClick={() => handleSendProposal(selectedProposal.id)}
                    >
                      <Send size={16} color="#0369a1" />
                      <span>Mark Proposal as SENT to Client</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => handleOpenEmailComposer('proposal_sent', {
                      client_name: selectedProposal.client?.name,
                      client_business_name: selectedProposal.client?.business_name,
                      client_email: selectedProposal.client?.email,
                      proposal: selectedProposal
                    })}
                  >
                    <Mail size={16} />
                    <span>Compose Proposal Email</span>
                  </button>

                  {selectedProposal.status !== 'ACCEPTED' && (
                    <button
                      type="button"
                      className="outreach-btn"
                      onClick={() => handleAcceptProposal(selectedProposal.id)}
                    >
                      <CheckCircle size={16} color="#15803d" />
                      <span>Admin Manual Accept Proposal</span>
                    </button>
                  )}

                  {selectedProposal.status === 'ACCEPTED' && (
                    <>
                      <button
                        type="button"
                        className="outreach-btn"
                        style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                        onClick={() => handleGenerateContract(selectedProposal.id)}
                      >
                        <FileCheck size={16} />
                        <span>Generate Contract Agreement</span>
                      </button>

                      <button
                        type="button"
                        className="outreach-btn"
                        style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                        onClick={() => handleConvertProposalToInvoice(selectedProposal.id)}
                      >
                        <Receipt size={16} />
                        <span>Convert to Official Invoice</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Line Items Breakdown */}
              <div className="drawer-section">
                <span className="section-subtitle">DELIVERABLES BREAKDOWN</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedProposal.items && selectedProposal.items.map((it, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>{it.name}</strong>
                        {it.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>{it.description}</p>}
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                          Qty: {it.quantity} × {formatMoney(it.unit_price, selectedProposal.currency)}
                        </div>
                      </div>
                      <strong style={{ font: '700 13px monospace', color: 'var(--ink)' }}>
                        {formatMoney(it.total, selectedProposal.currency)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Terms */}
              {(selectedProposal.notes || selectedProposal.terms) && (
                <div className="drawer-section">
                  <span className="section-subtitle">TERMS & SPECIAL CONDITIONS</span>
                  <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#4a4842', lineHeight: 1.5 }}>
                    {selectedProposal.notes && <p style={{ margin: '0 0 8px' }}><strong>Notes:</strong> {selectedProposal.notes}</p>}
                    {selectedProposal.terms && <p style={{ margin: 0 }}><strong>Terms:</strong> {selectedProposal.terms}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                onClick={() => handleDeleteProposal(selectedProposal.id)}
                className="btn-danger-outline"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="btn-secondary"
                style={{ marginLeft: 'auto' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CONTRACT DETAIL DRAWER
      ------------------------------------------------------------- */}
      {selectedContract && (
        <div className="drawer-overlay" onClick={() => setSelectedContract(null)}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '2px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                    {selectedContract.contract_number}
                  </span>
                  <ContractStatusBadge status={selectedContract.status} size="small" />
                </div>
                <h2>{selectedContract.title}</h2>
                <div className="drawer-biz-name">
                  Client: {selectedContract.client?.business_name || `Account #${selectedContract.client_id}`}
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedContract(null)}
                aria-label="Close contract drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Quick Actions */}
              <div className="drawer-section">
                <span className="section-subtitle">CONTRACT WORKFLOW</span>
                <div className="outreach-grid">
                  {selectedContract.status === 'DRAFT' && (
                    <button
                      type="button"
                      className="outreach-btn"
                      onClick={() => handleSendContract(selectedContract.id)}
                    >
                      <Send size={16} color="#0369a1" />
                      <span>Mark Contract as SENT to Client</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => handleCopyContractLink(selectedContract.secure_token)}
                  >
                    {copiedToken === selectedContract.secure_token ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                    <span>Copy Public Agreement Link</span>
                  </button>

                  <a
                    href={`/contract/${selectedContract.secure_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="outreach-btn"
                  >
                    <ExternalLink size={16} />
                    <span>Open Public Agreement Document</span>
                  </a>

                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => handleOpenEmailComposer('contract_ready', {
                      client_name: selectedContract.client?.name,
                      client_business_name: selectedContract.client?.business_name,
                      client_email: selectedContract.client?.email,
                      contract: selectedContract
                    })}
                  >
                    <Mail size={16} />
                    <span>Compose Contract Email</span>
                  </button>

                  {selectedContract.status !== 'ACCEPTED' && (
                    <button
                      type="button"
                      className="outreach-btn"
                      style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                      onClick={() => handleAcceptContract(selectedContract.id)}
                    >
                      <CheckCircle size={16} />
                      <span>Mark Contract as SIGNED / ACCEPTED</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Document Text */}
              <div className="drawer-section">
                <span className="section-subtitle">AGREEMENT CONTENT</span>
                <div className="contract-document-preview">
                  <pre className="contract-preformatted-text">{selectedContract.content}</pre>
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                onClick={() => setSelectedContract(null)}
                className="btn-secondary"
                style={{ marginLeft: 'auto' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          INVOICE DETAIL DRAWER
      ------------------------------------------------------------- */}
      {selectedInvoice && (
        <div className="drawer-overlay" onClick={() => setSelectedInvoice(null)}>
          <div
            className="drawer-panel crm-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="client-code-tag" style={{ background: '#10100f', color: '#fff', padding: '2px 8px', borderRadius: '4px', font: '700 11px monospace' }}>
                    {selectedInvoice.invoice_number}
                  </span>
                  <InvoiceStatusBadge status={selectedInvoice.status} size="small" />
                </div>
                <h2>Invoice #{selectedInvoice.invoice_number}</h2>
                <div className="drawer-biz-name">
                  Client: {selectedInvoice.client?.business_name || `Account #${selectedInvoice.client_id}`}
                </div>
              </div>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close invoice drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Overdue Alert */}
              {selectedInvoice.status === 'OVERDUE' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 14px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <AlertCircle size={18} />
                  <span>Invoice is overdue. Due date was {new Date(selectedInvoice.due_date).toLocaleDateString('en-IN')}.</span>
                </div>
              )}

              {/* Financial Snapshot */}
              <div className="drawer-section">
                <span className="section-subtitle">BILLING SUMMARY</span>
                <div className="info-kv-grid">
                  <div className="kv-item">
                    <span className="kv-label">Total Invoiced</span>
                    <span className="kv-val">{formatMoney(selectedInvoice.total, selectedInvoice.currency)}</span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Amount Paid</span>
                    <span className="kv-val" style={{ color: '#15803d', fontWeight: 700 }}>
                      {formatMoney(selectedInvoice.amount_paid, selectedInvoice.currency)}
                    </span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Remaining Balance</span>
                    <span className="kv-val" style={{ color: selectedInvoice.amount_due > 0 ? '#dc2626' : '#15803d', fontWeight: 700 }}>
                      {formatMoney(selectedInvoice.amount_due, selectedInvoice.currency)}
                    </span>
                  </div>
                  <div className="kv-item">
                    <span className="kv-label">Due Date</span>
                    <span className="kv-val">
                      {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString('en-IN') : 'Upon receipt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="drawer-section">
                <span className="section-subtitle">ACTIONS</span>
                <div className="outreach-grid">
                  {selectedInvoice.status !== 'PAID' && selectedInvoice.status !== 'CANCELLED' && (
                    <button
                      type="button"
                      className="outreach-btn"
                      style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}
                      onClick={() => handleOpenPaymentModal(selectedInvoice)}
                    >
                      <CreditCard size={16} />
                      <span>Record Payment Transaction</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => handleCopyInvoiceLink(selectedInvoice.secure_token)}
                  >
                    {copiedToken === selectedInvoice.secure_token ? <Check size={16} color="#15803d" /> : <Copy size={16} />}
                    <span>Copy Public Invoice Link</span>
                  </button>

                  <a
                    href={`/invoice/${selectedInvoice.secure_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="outreach-btn"
                  >
                    <ExternalLink size={16} />
                    <span>Open Public Invoice & Payment Page</span>
                  </a>

                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => handleOpenEmailComposer('invoice_sent', {
                      client_name: selectedInvoice.client?.name,
                      client_business_name: selectedInvoice.client?.business_name,
                      client_email: selectedInvoice.client?.email,
                      invoice: selectedInvoice
                    })}
                  >
                    <Mail size={16} />
                    <span>Compose Invoice Email</span>
                  </button>

                  {selectedInvoice.status === 'DRAFT' && (
                    <button
                      type="button"
                      className="outreach-btn"
                      onClick={() => handleSendInvoice(selectedInvoice.id)}
                    >
                      <Send size={16} color="#0369a1" />
                      <span>Mark Invoice as SENT to Client</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div className="drawer-section">
                <span className="section-subtitle">BILLED ITEMS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedInvoice.items && selectedInvoice.items.map((it, idx) => (
                    <div key={idx} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ color: 'var(--ink)', fontSize: '13px' }}>{it.name}</strong>
                        {it.description && <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>{it.description}</p>}
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                          Qty: {it.quantity} × {formatMoney(it.unit_price, selectedInvoice.currency)}
                        </div>
                      </div>
                      <strong style={{ font: '700 13px monospace', color: 'var(--ink)' }}>
                        {formatMoney(it.total, selectedInvoice.currency)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="drawer-section">
                  <span className="section-subtitle">RECORDED TRANSACTIONS</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedInvoice.payments.map(p => (
                      <div key={p.id} style={{ background: '#fdfcf9', border: '1px solid var(--line)', borderRadius: '8px', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#15803d' }}>
                            {formatMoney(p.amount, selectedInvoice.currency)} ({p.payment_method})
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {new Date(p.paid_at).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        {p.reference && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Ref: {p.reference}</div>}
                        {p.notes && <div style={{ fontSize: '12px', color: '#4a4842', marginTop: '4px' }}>{p.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                className="btn-danger-outline"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="btn-secondary"
                style={{ marginLeft: 'auto' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PROPOSAL BUILDER MODAL
      ------------------------------------------------------------- */}
      {showProposalBuilder && (
        <div className="modal-overlay" onClick={() => setShowProposalBuilder(false)}>
          <div
            className="modal-card modal-card-xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <h3>Create Commercial Proposal</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowProposalBuilder(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProposal} style={{ padding: '20px' }}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.2 }}>
                  <label>Client Account *</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={proposalFormData.client_id}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, client_id: e.target.value })}
                    required
                  >
                    <option value="">Select Client...</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1.8 }}>
                  <label>Proposal Title *</label>
                  <input
                    type="text"
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    placeholder="e.g. Full-Stack Web App & AI Automation System"
                    value={proposalFormData.title}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, title: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Currency</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={proposalFormData.currency}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, currency: e.target.value })}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Valid Until Date</label>
                  <input
                    type="date"
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={proposalFormData.valid_until}
                    onChange={(e) => setProposalFormData({ ...proposalFormData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label>Executive Scope Summary</label>
                <textarea
                  rows={2}
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="Overview of business problems solved, deliverables, and architecture."
                  value={proposalFormData.description}
                  onChange={(e) => setProposalFormData({ ...proposalFormData, description: e.target.value })}
                />
              </div>

              {/* Dynamic Line Items */}
              <div className="builder-line-items-section">
                <div className="builder-section-head">
                  <span style={{ font: '700 12px "Space Grotesk"', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Deliverable Items & Pricing
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={handleAddProposalItem}
                  >
                    <Plus size={13} /> Add Deliverable
                  </button>
                </div>

                <div className="line-items-editor-table">
                  {proposalFormData.items.map((it, idx) => (
                    <div key={idx} className="line-item-editor-row">
                      <div className="item-inputs-grid">
                        <input
                          type="text"
                          className="admin-select"
                          placeholder="Deliverable Name (e.g. Backend API Engine)"
                          value={it.name}
                          onChange={(e) => handleUpdateProposalItem(idx, 'name', e.target.value)}
                          required
                        />
                        <div className="qty-price-row">
                          <input
                            type="number"
                            className="admin-select"
                            placeholder="Qty"
                            style={{ width: '65px' }}
                            value={it.quantity}
                            onChange={(e) => handleUpdateProposalItem(idx, 'quantity', e.target.value)}
                            min="1"
                            step="any"
                            required
                          />
                          <input
                            type="number"
                            className="admin-select"
                            placeholder="Rate"
                            style={{ width: '110px' }}
                            value={it.unit_price}
                            onChange={(e) => handleUpdateProposalItem(idx, 'unit_price', e.target.value)}
                            min="0"
                            step="any"
                            required
                          />
                          <span style={{ font: '700 12px monospace', minWidth: '80px', textAlign: 'right' }}>
                            {formatMoney((it.quantity || 0) * (it.unit_price || 0), proposalFormData.currency)}
                          </span>
                          {proposalFormData.items.length > 1 && (
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleRemoveProposalItem(idx)}
                              title="Remove item"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        type="text"
                        className="admin-select"
                        style={{ width: '100%', marginTop: '6px', fontSize: '12px' }}
                        placeholder="Detailed deliverables description (optional)..."
                        value={it.description}
                        onChange={(e) => handleUpdateProposalItem(idx, 'description', e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                {/* Subtotal / Discount / Tax Calculations */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '14px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Discount:</span>
                    <input
                      type="number"
                      className="admin-select"
                      style={{ width: '90px' }}
                      value={proposalFormData.discount}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, discount: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Tax / GST:</span>
                    <input
                      type="number"
                      className="admin-select"
                      style={{ width: '90px' }}
                      value={proposalFormData.tax}
                      onChange={(e) => setProposalFormData({ ...proposalFormData, tax: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Subtotal: {formatMoney(calculateDraftTotals(proposalFormData).subtotal, proposalFormData.currency)}
                    </div>
                    <div style={{ font: '700 16px "Space Grotesk", monospace', color: 'var(--ink)' }}>
                      Total: {formatMoney(calculateDraftTotals(proposalFormData).total, proposalFormData.currency)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Commercial Terms & Payment Milestones</label>
                <textarea
                  rows={2}
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  value={proposalFormData.terms}
                  onChange={(e) => setProposalFormData({ ...proposalFormData, terms: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowProposalBuilder(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="navcta primary"
                  style={{ padding: '10px 20px', borderRadius: '8px' }}
                >
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          INVOICE BUILDER MODAL
      ------------------------------------------------------------- */}
      {showInvoiceBuilder && (
        <div className="modal-overlay" onClick={() => setShowInvoiceBuilder(false)}>
          <div
            className="modal-card modal-card-xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <h3>Issue Client Invoice</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowInvoiceBuilder(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} style={{ padding: '20px' }}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Client Account *</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={invoiceFormData.client_id}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, client_id: e.target.value })}
                    required
                  >
                    <option value="">Select Client...</option>
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name} ({c.client_code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input
                    type="date"
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={invoiceFormData.due_date}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 0.8 }}>
                  <label>Currency</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%', padding: '10px' }}
                    value={invoiceFormData.currency}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, currency: e.target.value })}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Items */}
              <div className="builder-line-items-section">
                <div className="builder-section-head">
                  <span style={{ font: '700 12px "Space Grotesk"', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Milestone Billed Items
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                    onClick={handleAddInvoiceItem}
                  >
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                <div className="line-items-editor-table">
                  {invoiceFormData.items.map((it, idx) => (
                    <div key={idx} className="line-item-editor-row">
                      <div className="item-inputs-grid">
                        <input
                          type="text"
                          className="admin-select"
                          placeholder="Item Name (e.g. Sprint 1 Deliverable)"
                          value={it.name}
                          onChange={(e) => handleUpdateInvoiceItem(idx, 'name', e.target.value)}
                          required
                        />
                        <div className="qty-price-row">
                          <input
                            type="number"
                            className="admin-select"
                            placeholder="Qty"
                            style={{ width: '65px' }}
                            value={it.quantity}
                            onChange={(e) => handleUpdateInvoiceItem(idx, 'quantity', e.target.value)}
                            min="1"
                            step="any"
                            required
                          />
                          <input
                            type="number"
                            className="admin-select"
                            placeholder="Rate"
                            style={{ width: '110px' }}
                            value={it.unit_price}
                            onChange={(e) => handleUpdateInvoiceItem(idx, 'unit_price', e.target.value)}
                            min="0"
                            step="any"
                            required
                          />
                          <span style={{ font: '700 12px monospace', minWidth: '80px', textAlign: 'right' }}>
                            {formatMoney((it.quantity || 0) * (it.unit_price || 0), invoiceFormData.currency)}
                          </span>
                          {invoiceFormData.items.length > 1 && (
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleRemoveInvoiceItem(idx)}
                              title="Remove item"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal / Discount / Tax */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '14px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Discount:</span>
                    <input
                      type="number"
                      className="admin-select"
                      style={{ width: '90px' }}
                      value={invoiceFormData.discount}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, discount: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Tax / GST:</span>
                    <input
                      type="number"
                      className="admin-select"
                      style={{ width: '90px' }}
                      value={invoiceFormData.tax}
                      onChange={(e) => setInvoiceFormData({ ...invoiceFormData, tax: e.target.value })}
                      min="0"
                    />
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                      Subtotal: {formatMoney(calculateDraftTotals(invoiceFormData).subtotal, invoiceFormData.currency)}
                    </div>
                    <div style={{ font: '700 16px "Space Grotesk", monospace', color: 'var(--ink)' }}>
                      Invoice Total: {formatMoney(calculateDraftTotals(invoiceFormData).total, invoiceFormData.currency)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Payment Instructions / Notes</label>
                <textarea
                  rows={2}
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowInvoiceBuilder(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="navcta primary"
                  style={{ padding: '10px 20px', borderRadius: '8px' }}
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          RECORD PAYMENT MODAL
      ------------------------------------------------------------- */}
      {showPaymentModal && paymentInvoice && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '95%' }}
          >
            <div className="modal-header">
              <h3>Record Invoice Payment</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ padding: '20px' }}>
              <div className="payment-due-callout">
                <span>Remaining Balance Due:</span>
                <strong>{formatMoney(paymentInvoice.amount_due, paymentInvoice.currency)}</strong>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Payment Amount Received *</label>
                <input
                  type="number"
                  className="admin-select"
                  style={{ width: '100%', padding: '10px', fontSize: '15px', fontWeight: 600 }}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  step="any"
                  min="1"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Payment Method *</label>
                <select
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label>Transaction / UTR Reference ID</label>
                <input
                  type="text"
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. UTR1284901928"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Payment Notes (optional)</label>
                <textarea
                  rows={2}
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. Received via HDFC corporate account."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="navcta primary"
                  style={{ padding: '10px 20px', borderRadius: '8px' }}
                  disabled={recordingPayment}
                >
                  {recordingPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          CONFIRM PAYMENT VERIFICATION MODAL
      ------------------------------------------------------------- */}
      {showConfirmVerificationModal && confirmingConfirmation && (
        <div className="modal-overlay" onClick={() => setShowConfirmVerificationModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '520px', width: '95%' }}
          >
            <div className="modal-header">
              <h3>Confirm Payment Verification</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowConfirmVerificationModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Client:</span>
                  <strong>{confirmingConfirmation.client_business_name || confirmingConfirmation.client_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Invoice:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{confirmingConfirmation.invoice_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Claimed Amount:</span>
                  <strong style={{ fontSize: '16px', color: '#15803d' }}>
                    ${confirmingConfirmation.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Payment Method:</span>
                  <span>{confirmingConfirmation.payment_method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Transaction / UTR:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{confirmingConfirmation.reference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Submitted By:</span>
                  <span>{confirmingConfirmation.payer_name} ({confirmingConfirmation.payer_email})</span>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#4a4842', lineHeight: 1.5, margin: '0 0 20px' }}>
                Confirming will create an official payment record, update the invoice balance, mark the client onboarding initial payment item as completed, and log the verification in the client activity timeline.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowConfirmVerificationModal(false)}
                  disabled={verifyingAction}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="navcta primary"
                  style={{ padding: '10px 20px', borderRadius: '8px', background: '#15803d', borderColor: '#15803d' }}
                  disabled={verifyingAction}
                  onClick={() => handleConfirmVerification(confirmingConfirmation)}
                >
                  {verifyingAction ? 'Verifying...' : 'Confirm & Record Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          REJECT PAYMENT VERIFICATION MODAL
      ------------------------------------------------------------- */}
      {showRejectVerificationModal && rejectingConfirmation && (
        <div className="modal-overlay" onClick={() => setShowRejectVerificationModal(false)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '95%' }}
          >
            <div className="modal-header">
              <h3>Reject Payment Verification</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setShowRejectVerificationModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectVerification} style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: '#4a4842', lineHeight: 1.5, margin: '0 0 16px' }}>
                Reject payment claim of <strong>${rejectingConfirmation.amount}</strong> for Invoice <strong>{rejectingConfirmation.invoice_number}</strong> (Ref: {rejectingConfirmation.reference}).
              </p>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Rejection Reason / Note *</label>
                <textarea
                  rows={3}
                  className="admin-select"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="e.g. Transaction reference not found in bank statement, or incorrect amount paid."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowRejectVerificationModal(false)}
                  disabled={verifyingAction}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  style={{ padding: '10px 20px', borderRadius: '8px', background: '#dc2626', color: '#fff', border: 'none' }}
                  disabled={verifyingAction}
                >
                  {verifyingAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          EMAIL COMPOSER MODAL
      ------------------------------------------------------------- */}
      <EmailComposerModal
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        templateType={emailComposerType}
        data={emailComposerData}
      />
    </div>
  );
}
