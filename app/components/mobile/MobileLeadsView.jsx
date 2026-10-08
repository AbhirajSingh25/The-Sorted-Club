import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Filter,
  RefreshCw,
  Plus,
  Phone,
  MessageSquare,
  ChevronRight,
  Loader2,
  AlertCircle,
  Tag,
  DollarSign,
  User
} from 'lucide-react';
import { fetchLeads, updateLead } from '../../api/client';
import StatusBadge, { PriorityBadge, FollowUpBadge } from '../StatusBadge';
import MobileLeadDetail from './MobileLeadDetail';
import { formatMobileDate } from '../../utils/responsive';

const FILTER_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'CONTACTED', label: 'Contacted' },
  { id: 'QUALIFIED', label: 'Qualified' },
  { id: 'WON', label: 'Won' }
];

export default function MobileLeadsView({
  initialSelectedLeadId = null,
  onOpenNewLeadModal,
  onConvertToClient
}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedLead, setSelectedLead] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeads = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const data = await fetchLeads({
        status: activeTab === 'ALL' ? '' : activeTab,
        search: searchQuery
      });
      setLeads(data || []);

      // If initialSelectedLeadId was passed and not selected yet, find and set it
      if (initialSelectedLeadId && !selectedLead) {
        const found = (data || []).find((l) => String(l.id) === String(initialSelectedLeadId));
        if (found) setSelectedLead(found);
      }
    } catch (err) {
      setError(err.message || 'Failed to load leads.');
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeads(true);
  }, [activeTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeads(false);
  };

  const handleLeadUpdated = (updatedLead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    if (selectedLead?.id === updatedLead.id) {
      setSelectedLead(updatedLead);
    }
  };

  return (
    <div className="mobile-view-container">
      {/* Search and Segmented Filter Bar */}
      <div className="mobile-leads-header-section">
        <div className="mobile-search-bar-wrap">
          <div className="mobile-search-input-box">
            <Search size={16} className="mobile-search-icon" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search leads by name, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="mobile-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            className={`mobile-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh Leads"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Segmented Filter Pills */}
        <div className="mobile-segmented-scroll">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`mobile-segment-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Leads List Body */}
      <div className="mobile-leads-list">
        {loading ? (
          <div className="mobile-loading-center">
            <Loader2 size={24} className="spinner" />
            <span>Loading pipeline...</span>
          </div>
        ) : error ? (
          <div className="mobile-error-box">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button type="button" className="mobile-secondary-btn" onClick={() => loadLeads(true)}>
              Retry
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="mobile-empty-state">
            <div className="mobile-empty-icon">📭</div>
            <div className="mobile-empty-title">No leads found</div>
            <p className="mobile-empty-desc">
              {searchQuery
                ? `No leads matched "${searchQuery}".`
                : activeTab !== 'ALL'
                ? `No leads currently in the "${activeTab}" stage.`
                : 'No leads have been received yet.'}
            </p>
            {onOpenNewLeadModal && (
              <button
                type="button"
                className="mobile-primary-btn"
                onClick={onOpenNewLeadModal}
                style={{ marginTop: 12 }}
              >
                <Plus size={16} /> Add First Lead
              </button>
            )}
          </div>
        ) : (
          leads.map((lead) => {
            const isNew = lead.status === 'NEW';
            return (
              <motion.div
                key={lead.id}
                className={`mobile-lead-card ${isNew ? 'is-new' : ''}`}
                onClick={() => setSelectedLead(lead)}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.12 }}
                role="button"
                tabIndex={0}
              >
                {/* Card Top Row: Business Name & Status */}
                <div className="mobile-lead-card-head">
                  <h3 className="mobile-lead-card-title">
                    {lead.business_name || lead.name || 'Unnamed Lead'}
                  </h3>
                  <StatusBadge status={lead.status} />
                </div>

                {/* Contact person & Service */}
                <div className="mobile-lead-card-sub">
                  {lead.name && (
                    <span className="mobile-card-person">
                      <User size={13} /> {lead.name}
                    </span>
                  )}
                  <span className="mobile-card-service">
                    <Tag size={13} /> {lead.service_interest || 'Website / Build'}
                  </span>
                </div>

                {/* Bottom Meta & Action */}
                <div className="mobile-lead-card-footer">
                  <div className="mobile-card-meta-left">
                    {lead.budget ? (
                      <span className="mobile-card-budget">{lead.budget}</span>
                    ) : (
                      <span className="mobile-card-time">{formatMobileDate(lead.created_at)}</span>
                    )}
                    {lead.budget && (
                      <span className="mobile-card-time">· {formatMobileDate(lead.created_at)}</span>
                    )}
                  </div>

                  <div className="mobile-card-action-btn">
                    <span>View</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Lead Detail Slide-over */}
      <AnimatePresence>
        {selectedLead && (
          <MobileLeadDetail
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onLeadUpdated={handleLeadUpdated}
            onConvertToClient={onConvertToClient}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
