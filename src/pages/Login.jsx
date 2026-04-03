import { useState } from 'react';
import API_BASE from '../config/api';
import './Login.css';

function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left panel — branding */}
        <div className="login-brand">
          <div className="brand-content">
            <svg className="bin-icon" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="30" width="70" height="80" rx="6" fill="#ffffff" fillOpacity="0.25" stroke="#fff" strokeWidth="3"/>
              <rect x="10" y="20" width="80" height="14" rx="4" fill="#fff" fillOpacity="0.35" stroke="#fff" strokeWidth="3"/>
              <rect x="42" y="10" width="16" height="14" rx="3" fill="none" stroke="#fff" strokeWidth="3"/>
              <line x1="35" y1="50" x2="35" y2="95" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <line x1="50" y1="50" x2="50" y2="95" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <line x1="65" y1="50" x2="65" y2="95" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="75" cy="90" r="16" fill="#2e7d32" stroke="#fff" strokeWidth="2"/>
              <path d="M69 87 L75 81 L81 87" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M81 93 L75 99 L69 93" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="75" y1="81" x2="75" y2="93" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h1 className="brand-title">Smart Waste Management</h1>
            <p className="brand-subtitle">Monitor. Optimize. Sustain.</p>
          </div>
          <div className="brand-decoration">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="login-form-panel">
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="3"/>
                  <polyline points="2,4 12,13 22,4"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="3"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="role">Role</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-select"
                >
                  <option value="student">🎓 Student</option>
                  <option value="faculty">👨‍🏫 Faculty</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button type="button" className="link-btn" onClick={onSwitchToRegister}>
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
