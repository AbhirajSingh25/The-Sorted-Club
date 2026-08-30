import React, { useState } from 'react';
import { Lock, User, KeyRound, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { loginAdmin } from '../api/client';

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginAdmin(username.trim(), password.trim());
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card" role="region" aria-labelledby="admin-portal-heading">
        <button
          type="button"
          onClick={onBackToSite}
          className="admin-back-btn"
          aria-label="Back to public website"
        >
          <ArrowLeft size={16} /> Back to website
        </button>

        <div className="admin-login-header">
          <div className="admin-lock-icon" aria-hidden="true">
            <Lock size={24} />
          </div>
          <div className="brand">THE SORTED <span>CLUB</span></div>
          <h2 id="admin-portal-heading">Admin Portal</h2>
          <p>Sign in to manage incoming business inquiries and pipeline.</p>
        </div>

        {error && (
          <div className="error-banner" role="alert" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" aria-hidden="true" />
              <input
                id="admin-username"
                type="text"
                autoComplete="username"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-wrapper">
              <KeyRound size={16} className="input-icon" aria-hidden="true" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="primary"
            style={{ width: '100%', marginTop: '10px', height: '48px', cursor: 'pointer' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spinner" aria-hidden="true" /> Authenticating...
              </>
            ) : (
              <>
                Access Dashboard <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <small>Credentials are configured via backend environment variables.</small>
        </div>
      </div>
    </div>
  );
}
