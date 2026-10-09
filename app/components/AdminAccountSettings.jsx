import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  KeyRound,
  User,
  Bell,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Mail,
  Database,
  RefreshCw,
  Send,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  Info,
  ArrowLeft
} from 'lucide-react';
import {
  getAdminUsername,
  changeAdminUsername,
  changeAdminPassword,
  fetchAdminSettings,
  fetchVapidPublicKey,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  testPushNotification
} from '../api/client';
import AdminNavbar from './AdminNavbar';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminAccountSettings({
  onBack,
  onLogout,
  onNavigateToCommandCenter,
  onNavigateToInquiries,
  onNavigateToCRM,
  onNavigateToClients,
  onNavigateToFinance,
  onNavigateToProjects,
  onBackToSite,
  isMobile = false
}) {
  const [currentUsername, setCurrentUsername] = useState(getAdminUsername() || 'admin');
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Username form state
  const [newUsername, setNewUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [userSuccess, setUserSuccess] = useState(null);
  const [userError, setUserError] = useState(null);

  // Password form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSubmitting, setPassSubmitting] = useState(false);
  const [passSuccess, setPassSuccess] = useState(null);
  const [passError, setPassError] = useState(null);

  // Web Push state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pushSubmitting, setPushSubmitting] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState(null);
  const [pushErrorMsg, setPushErrorMsg] = useState(null);
  const [testingPush, setTestingPush] = useState(false);

  // Load operational settings
  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await fetchAdminSettings();
      if (data) {
        setSettings(data);
        if (data.username) setCurrentUsername(data.username);
      }
    } catch (err) {
      console.log('Settings load note:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Check Web Push support & active device subscription
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setPushSupported(true);
      setPushPermission(Notification.permission);

      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(Boolean(sub));
        });
      }).catch(() => {});
    } else {
      setPushSupported(false);
    }
  }, []);

  // Handle Username Change
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setUserError(null);
    setUserSuccess(null);

    if (!newUsername.trim()) {
      setUserError('Please enter a new username or email identifier.');
      return;
    }
    if (!userPassword) {
      setUserError('Current password is required to change your login ID.');
      return;
    }

    setUserSubmitting(true);
    try {
      const res = await changeAdminUsername({
        current_password: userPassword,
        new_username: newUsername.trim()
      });
      setUserSuccess(res.message || 'Username updated successfully.');
      setCurrentUsername(newUsername.trim());
      setNewUsername('');
      setUserPassword('');
      loadSettings();
    } catch (err) {
      setUserError(err.message || 'Failed to update username.');
    } finally {
      setUserSubmitting(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!currentPass) {
      setPassError('Current password is required.');
      return;
    }
    if (!newPass || newPass.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New password and confirmation do not match.');
      return;
    }
    if (newPass === currentPass) {
      setPassError('New password must be different from current password.');
      return;
    }

    setPassSubmitting(true);
    try {
      const res = await changeAdminPassword({
        current_password: currentPass,
        new_password: newPass,
        confirm_password: confirmPass
      });
      setPassSuccess(res.message || 'Password changed successfully.');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassSubmitting(false);
    }
  };

  // Enable Web Push on this device
  const handleEnablePush = async () => {
    setPushErrorMsg(null);
    setPushStatusMsg(null);
    setPushSubmitting(true);

    try {
      if (!pushSupported) {
        throw new Error('Web Push is not supported by this browser. On iPhone, please add the site to your Home Screen via Safari.');
      }

      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        throw new Error('Notification permission was not granted. Please enable notifications in your browser/iOS settings.');
      }

      // Fetch VAPID public key
      const vapidRes = await fetchVapidPublicKey();
      if (!vapidRes || !vapidRes.configured || !vapidRes.public_key) {
        throw new Error('Push notification server keys (VAPID) are not configured on the backend yet.');
      }

      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        const convertedKey = urlBase64ToUint8Array(vapidRes.public_key);
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      }

      const subJson = subscription.toJSON();
      await subscribeToPushNotifications({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subJson.keys?.p256dh || '',
          auth: subJson.keys?.auth || ''
        },
        user_agent: navigator.userAgent
      });

      setIsSubscribed(true);
      setPushStatusMsg('Push notifications successfully enabled on this device! You will now receive instant alerts for new inquiries.');
      loadSettings();
    } catch (err) {
      setPushErrorMsg(err.message || 'Failed to enable push notifications.');
    } finally {
      setPushSubmitting(false);
    }
  };

  // Disable Web Push on this device
  const handleDisablePush = async () => {
    setPushErrorMsg(null);
    setPushStatusMsg(null);
    setPushSubmitting(true);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeFromPushNotifications(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      setPushStatusMsg('Push notifications disabled for this device.');
      loadSettings();
    } catch (err) {
      setPushErrorMsg(err.message || 'Failed to disable push notifications.');
    } finally {
      setPushSubmitting(false);
    }
  };

  // Trigger test Web Push
  const handleTestPush = async () => {
    setPushErrorMsg(null);
    setPushStatusMsg(null);
    setTestingPush(true);

    try {
      const res = await testPushNotification();
      if (res && res.sent_count > 0) {
        setPushStatusMsg(`Test push notification delivered to ${res.sent_count} active device(s)!`);
      } else if (res && res.status === 'SKIPPED') {
        setPushStatusMsg(`Push test status: ${res.error || 'Server skipped push (check VAPID setup).'}`);
      } else {
        setPushStatusMsg('Test push executed.');
      }
    } catch (err) {
      setPushErrorMsg(err.message || 'Failed to send test push notification.');
    } finally {
      setTestingPush(false);
    }
  };

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);

  return (
    <div className="admin-page-layout">
      {!isMobile && (
        <AdminNavbar
          activeTab="settings"
          badge="SETTINGS"
          onNavigateToCommandCenter={onNavigateToCommandCenter}
          onNavigateToInquiries={onNavigateToInquiries}
          onNavigateToCRM={onNavigateToCRM}
          onNavigateToClients={onNavigateToClients}
          onNavigateToFinance={onNavigateToFinance}
          onNavigateToProjects={onNavigateToProjects}
          onBackToSite={onBackToSite}
          onLogout={onLogout}
        />
      )}

      <main className="admin-main-content" style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '16px' : '32px 24px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="mobile-back-btn"
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h1 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: '#0f172a' }}>
                Admin Account &amp; Settings
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
              Manage login credentials, iPhone push notifications, and operational parameters.
            </p>
          </div>
          <motion.button
            type="button"
            className="mobile-refresh-btn"
            onClick={loadSettings}
            whileTap={{ scale: 0.94 }}
            title="Refresh Status"
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <RefreshCw size={16} className={loadingSettings ? 'spinning' : ''} />
          </motion.button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
          {/* 1. CHANGE LOGIN IDENTIFIER */}
          <div className="admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Change Login ID</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Current: <strong>{currentUsername}</strong></span>
              </div>
            </div>

            {userSuccess && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 12px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>{userSuccess}</span>
              </div>
            )}

            {userError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={16} color="#dc2626" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleUsernameSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  New Username / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. founder@thesortedclub.com"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Current Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Verify your current password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={userSubmitting}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', background: '#0f172a', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {userSubmitting ? 'Updating...' : 'Update Login Identifier'}
              </motion.button>
            </form>
          </div>

          {/* 2. CHANGE PASSWORD */}
          <div className="admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Change Password</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Hashed with PBKDF2-SHA256</span>
              </div>
            </div>

            {passSuccess && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 12px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={16} color="#dc2626" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '14px', boxSizing: 'border-box' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  New Password (min 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="Enter new strong password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    style={{ width: '100%', padding: '9px 36px 9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '14px', boxSizing: 'border-box' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '14px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={passSubmitting}
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', background: '#0f172a', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {passSubmitting ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>
          </div>

          {/* 3. WEB PUSH & IPHONE NOTIFICATIONS */}
          <div className="admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: isMobile ? '1' : '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Web Push &amp; Device Notifications</h2>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Instant lock-screen alerts for new inquiries and key events</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSubscribed ? '#15803d' : '#94a3b8' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: isSubscribed ? '#15803d' : '#64748b' }}>
                  {isSubscribed ? 'Active on This Device' : 'Not Subscribed'}
                </span>
              </div>
            </div>

            {isIOS && !isStandalone && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', padding: '12px 14px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 10 }}>
                <Smartphone size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>iPhone iOS 16.4+ Requirement:</strong> To receive push notifications on iPhone, tap Safari's <strong>Share</strong> button (box with up arrow) and select <strong>Add to Home Screen</strong>, then open the app from your home screen.
                </div>
              </div>
            )}

            {pushStatusMsg && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '10px 12px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span>{pushStatusMsg}</span>
              </div>
            )}

            {pushErrorMsg && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 12px', borderRadius: 8, fontSize: '13px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                <AlertCircle size={16} color="#dc2626" />
                <span>{pushErrorMsg}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Browser Support</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: pushSupported ? '#15803d' : '#dc2626', marginTop: 2 }}>
                  {pushSupported ? 'Supported' : 'Not Supported'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Permission State</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: pushPermission === 'granted' ? '#15803d' : '#64748b', textTransform: 'capitalize', marginTop: 2 }}>
                  {pushPermission}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>VAPID Server Setup</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: settings?.push_configured ? '#15803d' : '#b45309', marginTop: 2 }}>
                  {settings?.push_configured ? 'Configured' : 'Missing Keys'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {!isSubscribed ? (
                <motion.button
                  type="button"
                  onClick={handleEnablePush}
                  disabled={pushSubmitting}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: '#15803d', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Bell size={15} />
                  <span>{pushSubmitting ? 'Enabling...' : 'Enable Push on This Device'}</span>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleDisablePush}
                  disabled={pushSubmitting}
                  whileTap={{ scale: 0.98 }}
                  style={{ background: '#f1f5f9', color: '#dc2626', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <X size={15} />
                  <span>Disable on This Device</span>
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={handleTestPush}
                disabled={testingPush}
                whileTap={{ scale: 0.98 }}
                style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Send size={15} />
                <span>{testingPush ? 'Sending Test...' : 'Send Test Notification'}</span>
              </motion.button>
            </div>
          </div>

          {/* 4. SYSTEM & APPLICATION DIAGNOSTICS */}
          <div className="admin-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', gridColumn: isMobile ? '1' : '1 / -1' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px 0', color: '#0f172a' }}>
              Operational Health &amp; Infrastructure
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <Database size={14} /> Database
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: settings?.db_connected ? '#15803d' : '#dc2626', marginTop: 4 }}>
                  {settings?.db_connected ? 'Connected (Neon PG)' : 'Disconnected'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <Mail size={14} /> Email Dispatch
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: settings?.email_enabled ? '#15803d' : '#64748b', marginTop: 4 }}>
                  {settings?.email_enabled ? 'Active (Gmail SMTP)' : 'Disabled'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <Smartphone size={14} /> Push Devices
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  {settings?.active_push_subscriptions_count || 0} registered
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <Sparkles size={14} /> Platform Build
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  {settings?.app_version || 'v2.4.0'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
