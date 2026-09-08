import React, { useState, useEffect } from 'react';
import { fetchPublicProject } from '../api/client';

export default function PublicProjectView({ token }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No project token provided.');
      setLoading(false);
      return;
    }
    loadProject();
  }, [token]);

  async function loadProject() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicProject(token);
      setProject(data);
    } catch (err) {
      setError(err.message || 'Project not found or link has expired.');
    } finally {
      setLoading(false);
    }
  }

  function getHealthBadge(health) {
    switch (health) {
      case 'ON_TRACK':
        return { label: 'On Track', color: 'badge-emerald', icon: '●' };
      case 'AT_RISK':
        return { label: 'At Risk', color: 'badge-amber', icon: '▲' };
      case 'BLOCKED':
        return { label: 'Blocked / Waiting', color: 'badge-rose', icon: '■' };
      case 'OVERDUE':
        return { label: 'Attention Needed', color: 'badge-rose', icon: '!' };
      default:
        return { label: 'Active', color: 'badge-emerald', icon: '●' };
    }
  }

  function getMilestoneBadge(status) {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Completed', cls: 'ms-done' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', cls: 'ms-active' };
      case 'BLOCKED':
        return { label: 'Blocked', cls: 'ms-blocked' };
      default:
        return { label: 'Upcoming', cls: 'ms-upcoming' };
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 font-medium tracking-wide">Loading project delivery dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0E131F] border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Project Link Unavailable</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{error || 'This project link is invalid or may have expired.'}</p>
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

  const health = getHealthBadge(project.health);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-800/80 bg-[#0A0E1A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-amber-500/20">
              SC
            </span>
            <span className="font-extrabold text-lg text-white tracking-tight">THE SORTED CLUB</span>
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              BUILD SERVICE HUB
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Client:</span>
            <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              {project.client_business_name || project.client_name}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Project Header Banner */}
        <section className="bg-gradient-to-br from-[#0E131F] to-[#121829] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                  {project.project_code}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                  {project.service_type}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                  project.health === 'ON_TRACK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  project.health === 'AT_RISK' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span>{health.icon}</span>
                  <span>{health.label}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">{project.description}</p>
              )}
            </div>

            {/* Progress Gauge */}
            <div className="bg-[#0A0E1A]/90 border border-slate-800 p-5 rounded-2xl md:min-w-[240px] space-y-3 shadow-inner">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</span>
                <span className="text-2xl font-black text-amber-400">{project.progress_percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(project.progress_percentage, 4)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{project.completed_tasks_count} / {project.total_tasks_count} tasks completed</span>
                {project.target_date && (
                  <span>Target: {new Date(project.target_date).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Action Required: Waiting on Client Banner */}
        {project.waiting_for && (
          <section className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-amber-500/5">
            <span className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md">
              ⏳
            </span>
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Waiting on Your Input</h3>
              <p className="text-sm text-amber-100/90 leading-relaxed font-medium">{project.waiting_for}</p>
            </div>
          </section>
        )}

        {/* Action Required: Pending Approvals */}
        {project.pending_approvals && project.pending_approvals.length > 0 && (
          <section className="bg-[#101726] border border-cyan-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping"></span>
                <h2 className="text-lg font-bold text-white tracking-tight">Deliverable Approvals Waiting For You</h2>
              </div>
              <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
                {project.pending_approvals.length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.pending_approvals.map((appr, idx) => (
                <div
                  key={idx}
                  className="bg-[#0A0E1A] border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {appr.item_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(appr.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">
                    {appr.title}
                  </h3>
                  {appr.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{appr.description}</p>
                  )}
                  <a
                    href={`/project-review/${appr.public_token}`}
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-cyan-500/20"
                  >
                    Review & Approve Deliverable →
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Milestones Pipeline (2 cols on large) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>🗺️</span>
                  <span>Delivery Roadmap & Milestones</span>
                </h2>
                {project.current_milestone && (
                  <span className="text-xs text-slate-400">
                    Current stage: <strong className="text-amber-400">{project.current_milestone}</strong>
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((ms, idx) => {
                    const badge = getMilestoneBadge(ms.status);
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                          ms.status === 'COMPLETED'
                            ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
                            : ms.status === 'IN_PROGRESS'
                            ? 'bg-[#141C2E] border-amber-500/40 shadow-md shadow-amber-500/5'
                            : 'bg-[#0A0E1A] border-slate-800/60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                            ms.status === 'COMPLETED'
                              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : ms.status === 'IN_PROGRESS'
                              ? 'bg-amber-500 text-slate-950 animate-pulse'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ms.status === 'COMPLETED' ? '✓' : idx + 1}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-bold text-sm ${ms.status === 'COMPLETED' ? 'text-slate-200' : 'text-white'}`}>
                              {ms.title}
                            </h3>
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                ms.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : ms.status === 'IN_PROGRESS'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-slate-800 text-slate-500'
                              }`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          {ms.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">{ms.description}</p>
                          )}
                          {ms.completed_at && (
                            <p className="text-[10px] font-mono text-emerald-400/80">
                              Completed {new Date(ms.completed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500">Roadmap milestones will appear here shortly.</p>
                )}
              </div>
            </div>

            {/* Customer Updates & Log */}
            <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>📢</span>
                  <span>Project Activity & Progress Log</span>
                </h2>
                <span className="text-xs text-slate-500">Sorted Club Delivery Team</span>
              </div>

              <div className="space-y-4">
                {project.updates && project.updates.length > 0 ? (
                  project.updates.map((upd, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0A0E1A] border border-slate-800/80 rounded-2xl p-5 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {upd.category}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          {new Date(upd.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm">{upd.title}</h3>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{upd.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No public announcements yet. Our team will post updates as milestones advance.</p>
                )}
              </div>
            </div>
          </section>

          {/* Sidebar: Resources & Direct Contacts (1 col) */}
          <aside className="space-y-6">
            {/* Shared Links & Resources */}
            <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 border-b border-slate-800 pb-3">
                <span>📁</span>
                <span>Project Deliverables & Assets</span>
              </h2>

              <div className="space-y-3">
                {project.resources && project.resources.length > 0 ? (
                  project.resources.map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3.5 bg-[#0A0E1A] hover:bg-[#141C2E] border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {res.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {res.resource_type}
                        </span>
                      </div>
                      {res.notes && <p className="text-xs text-slate-400 line-clamp-1">{res.notes}</p>}
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">Deliverables and live links will appear here as they are published.</p>
                )}
              </div>
            </div>

            {/* Delivery Guarantee Card */}
            <div className="bg-gradient-to-br from-[#101726] to-[#0A0E1A] border border-amber-500/20 rounded-3xl p-6 space-y-3 text-center shadow-lg">
              <span className="text-3xl">🛡️</span>
              <h3 className="font-bold text-white text-sm">Sorted Club Delivery Standard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every BUILD project follows a strict 9-phase quality protocol. For urgent inquiries or scope adjustments, message your dedicated delivery lead.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0A0E1A] py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} The Sorted Club. All deliverables protected under official client agreement.</p>
          <p className="text-[11px] text-slate-600">Secure Tokenized Workspace. Passwords and internal operational notes are never stored or exposed online.</p>
        </div>
      </footer>
    </div>
  );
}
