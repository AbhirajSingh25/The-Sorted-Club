import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  Trash2,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Briefcase,
  UserCheck,
  FileCheck,
  MessageSquare,
  ShieldAlert,
  Loader2,
  CheckCircle
} from 'lucide-react';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../api/client';

export default function NotificationCenter({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const containerRef = useRef(null);

  const loadNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchNotifications({ unread_only: unreadOnly, limit: 40 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    loadNotifications(true);
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [unreadOnly]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const deletedItem = notifications.find(n => n.id === id);
      if (deletedItem && !deletedItem.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      handleMarkAsRead(item.id);
    }
    if (item.action_url && onNavigate) {
      setIsOpen(false);
      onNavigate(item.action_url);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'NEW_INQUIRY':
        return <MessageSquare size={14} color="#0284c7" />;
      case 'PROPOSAL_ACCEPTED':
        return <FileCheck size={14} color="#15803d" />;
      case 'PAYMENT_CONFIRMATION_SUBMITTED':
        return <DollarSign size={14} color="#b45309" />;
      case 'PAYMENT_VERIFIED':
        return <DollarSign size={14} color="#15803d" />;
      case 'PAYMENT_REJECTED':
        return <DollarSign size={14} color="#dc2626" />;
      case 'CUSTOMER_REQUESTED_CHANGES':
        return <AlertCircle size={14} color="#ea580c" />;
      case 'CUSTOMER_APPROVAL_RECEIVED':
        return <Check size={14} color="#15803d" />;
      case 'PROJECT_BLOCKED':
        return <ShieldAlert size={14} color="#dc2626" />;
      case 'PROJECT_OVERDUE':
        return <Clock size={14} color="#dc2626" />;
      case 'PROJECT_COMPLETED':
        return <Briefcase size={14} color="#15803d" />;
      case 'ONBOARDING_COMPLETED':
        return <UserCheck size={14} color="#0284c7" />;
      default:
        return <TrendingUp size={14} color="#64748b" />;
    }
  };

  return (
    <div className="notif-center-wrapper" ref={containerRef} style={{ position: 'relative' }}>
      {/* Bell Button with Badge */}
      <button
        type="button"
        className={`notif-bell-btn ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications(false);
        }}
        aria-label="Notifications"
        title="Admin Notifications"
        style={{
          background: isOpen ? '#292823' : 'transparent',
          border: '1px solid #3d3b34',
          borderRadius: '999px',
          padding: '6px 12px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          color: '#e5e3dc',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <Bell size={15} color="#e5e3dc" style={{ display: 'block', flexShrink: 0 }} />
        {unreadCount > 0 ? (
          <span
            style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '10px',
              padding: '1px 6px',
              minWidth: '16px',
              textAlign: 'center',
              lineHeight: '14px',
              display: 'inline-block'
            }}
          >
            {unreadCount}
          </span>
        ) : null}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="notif-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 'min(380px, calc(100vw - 24px))',
            maxWidth: 'calc(100vw - 24px)',
            maxHeight: '520px',
            background: '#ffffff',
            border: '1px solid var(--line)',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '14px', color: 'var(--ink)', fontFamily: 'Space Grotesk, sans-serif' }}>
                Operational Alerts
              </strong>
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={isMarkingAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '11px',
                    color: '#0284c7',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CheckCheck size={13} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setUnreadOnly(false)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: !unreadOnly ? '#0f172a' : '#f1f5f9',
                color: !unreadOnly ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              All Alerts
            </button>
            <button
              type="button"
              onClick={() => setUnreadOnly(true)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: unreadOnly ? '#0f172a' : '#f1f5f9',
                color: unreadOnly ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div style={{ overflowY: 'auto', flex: 1, maxHeight: '380px' }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={20} className="spinner" />
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>
                  {unreadOnly ? 'No unread notifications' : 'No notifications recorded yet'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    background: item.is_read ? '#ffffff' : '#f0f9ff',
                    cursor: item.action_url ? 'pointer' : 'default',
                    display: 'flex',
                    gap: '12px',
                    transition: 'background 0.15s ease'
                  }}
                  className="notif-item-hover"
                >
                  <div style={{ paddingTop: '2px' }}>
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {getEventIcon(item.type)}
                    </span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </strong>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '6px' }}>
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 6px 0', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {item.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {item.action_url && (
                        <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          View record <ExternalLink size={10} />
                        </span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                        {!item.is_read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            title="Mark as read"
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          title="Delete notification"
                          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
