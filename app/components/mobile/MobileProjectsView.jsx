import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  RefreshCw,
  FolderKanban,
  User,
  Tag,
  ChevronRight,
  AlertCircle,
  Plus
} from 'lucide-react';
import { fetchProjects } from '../../api/client';
import { ProjectStatusBadge } from '../StatusBadge';
import MobileProjectDetail from './MobileProjectDetail';
import { formatMobileDate, formatINR } from '../../utils/responsive';

const PROJECT_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'IN_PROGRESS', label: 'Active' },
  { id: 'IN_REVIEW', label: 'Review' },
  { id: 'COMPLETED', label: 'Done' }
];

export default function MobileProjectsView({ initialSelectedProjectId = null, onOpenNewProjectModal }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects({
        status: activeTab === 'ALL' ? '' : activeTab,
        search: searchQuery
      });
      setProjects(data || []);

      if (initialSelectedProjectId && !selectedProject) {
        const found = (data || []).find((p) => String(p.id) === String(initialSelectedProjectId));
        if (found) setSelectedProject(found);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects(true);
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects(false);
  };

  const handleProjectUpdated = (updatedProj) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
    if (selectedProject?.id === updatedProj.id) {
      setSelectedProject(updatedProj);
    }
  };

  return (
    <div className="mobile-view-container">
      {/* Header Search & Tabs */}
      <div className="mobile-leads-header-section">
        <div className="mobile-search-bar-wrap">
          <div className="mobile-search-input-box">
            <Search size={16} className="mobile-search-icon" />
            <input
              type="text"
              className="mobile-search-input"
              placeholder="Search projects by name, client..."
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
          <motion.button
            type="button"
            className={`mobile-refresh-btn ${refreshing ? 'spinning' : ''}`}
            whileTap={{ scale: 0.94 }}
            onClick={handleRefresh}
            title="Refresh Projects"
            aria-label="Refresh projects"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>

        {/* Status Pills */}
        <div className="mobile-segmented-scroll">
          {PROJECT_TABS.map((tab) => (
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

      {/* Projects List */}
      <div className="mobile-leads-list">
        {loading ? (
          <div className="mobile-skeleton-list">
            <div className="mobile-skeleton-lead-card" />
            <div className="mobile-skeleton-lead-card" />
          </div>
        ) : error ? (
          <div className="mobile-error-box">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button type="button" className="mobile-secondary-btn" onClick={() => loadProjects(true)}>
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            className="mobile-empty-state"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mobile-empty-icon">📁</div>
            <div className="mobile-empty-title">No projects found</div>
            <p className="mobile-empty-desc">
              {searchQuery
                ? `No projects matched "${searchQuery}".`
                : 'No active delivery projects currently in this view.'}
            </p>
            {onOpenNewProjectModal && (
              <button
                type="button"
                className="mobile-primary-btn"
                onClick={onOpenNewProjectModal}
                style={{ marginTop: 12 }}
              >
                <Plus size={16} /> Create First Project
              </button>
            )}
          </motion.div>
        ) : (
          projects.map((proj, idx) => {
            const progress = proj.progress_percent || 0;
            return (
              <motion.div
                key={proj.id}
                className="mobile-lead-card"
                onClick={() => setSelectedProject(proj)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.2) }}
                role="button"
                tabIndex={0}
              >
                <div className="mobile-lead-card-head">
                  <h3 className="mobile-lead-card-title">{proj.name}</h3>
                  <ProjectStatusBadge status={proj.status} />
                </div>

                <div className="mobile-lead-card-sub">
                  {proj.client_name && (
                    <span className="mobile-card-person">
                      <User size={13} /> {proj.client_name}
                    </span>
                  )}
                  <span className="mobile-card-service">
                    <Tag size={13} /> {proj.service_type || 'Website Build'}
                  </span>
                </div>

                {/* Progress Bar in Card */}
                <div className="mobile-card-progress-bar-wrap">
                  <div className="mobile-card-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="mobile-lead-card-footer">
                  <div className="mobile-card-meta-left">
                    <span className="mobile-card-progress-pct">{progress}%</span>
                    <span className="mobile-card-time">
                      · {proj.target_completion_date ? `Due ${formatMobileDate(proj.target_completion_date).split('·')[0]}` : 'Open'}
                    </span>
                    {proj.contract_value ? (
                      <span className="mobile-card-budget">· {formatINR(proj.contract_value)}</span>
                    ) : null}
                  </div>

                  <div className="mobile-card-action-btn">
                    <span>Open</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Project Detail View Slide-over */}
      <AnimatePresence>
        {selectedProject && (
          <MobileProjectDetail
            key={selectedProject.id}
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onProjectUpdated={handleProjectUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
