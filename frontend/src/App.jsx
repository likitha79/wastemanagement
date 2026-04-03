import { useState, useEffect, useCallback } from 'react';
import API_BASE from './config/api';
import BinTable from './components/BinTable';
import FillChart from './components/FillChart';
import Tracking from './pages/Tracking';
import Notifications from './pages/Notifications';
import Rewards from './pages/Rewards';
import ReportIssue from './pages/ReportIssue';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const NAV_ITEMS_STUDENT = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tracking', label: 'Tracking', icon: '📍' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'rewards', label: 'Rewards', icon: '🏆' },
  { id: 'report', label: 'Report Issue', icon: '📋' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

const NAV_ITEMS_FACULTY = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tracking', label: 'Tracking', icon: '📍' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'rewards', label: 'Rewards', icon: '🏆' },
  { id: 'report', label: 'Report Issue', icon: '📋' },
  { id: 'admin', label: 'Admin', icon: '⚙️' },
];

function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'

  // Dashboard state
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchBins = useCallback(() => {
    setRefreshing(true);
    fetch(`${API_BASE}/api/bins`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch bins');
        return res.json();
      })
      .then((data) => {
        setBins(data);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    if (user) fetchBins();
  }, [user, fetchBins]);

  // Auth handlers
  const handleLogin = (userData) => {
    setUser(userData);
    setActiveNav('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAuthPage('login');
    setBins([]);
    setLoading(true);
  };

  // Not logged in — show Login or Register
  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    );
  }

  // Logged in — show dashboard
  const navItems = user.role === 'faculty' ? NAV_ITEMS_FACULTY : NAV_ITEMS_STUDENT;
  const totalBins = bins.length;
  const fullBins = bins.filter((b) => b.status === 'full').length;
  const halfBins = bins.filter((b) => b.status === 'half').length;
  const emptyBins = bins.filter((b) => b.status === 'empty').length;
  const alertBins = bins.filter((b) => b.fillLevel > 80);

  const recentBins = [...bins]
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 5);

  const PAGE_TITLES = {
    dashboard: 'Smart Waste Dashboard',
    tracking: 'Bin Tracking',
    notifications: 'Notifications',
    rewards: 'Rewards & Leaderboard',
    report: 'Report Issue',
    admin: 'Admin Panel',
  };

  const PAGE_SUBTITLES = {
    dashboard: 'Real-time bin monitoring & analytics',
    tracking: 'Locate and monitor all bins',
    notifications: 'Alerts for bin capacity',
    rewards: 'Earn points & climb the leaderboard',
    report: 'Help keep the campus clean',
    admin: 'Manage bins & system settings',
  };

  return (
    <div className={`app-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">♻️</span>
          {sidebarOpen && <span className="sidebar-title">SmartWaste</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div>
            <h1 className="page-title">{PAGE_TITLES[activeNav]}</h1>
            <p className="page-subtitle">{PAGE_SUBTITLES[activeNav]}</p>
          </div>
          <div className="top-bar-right">
            <span className="user-badge">
              {user.role === 'faculty' ? '👨‍🏫' : '🎓'} {user.name}
            </span>
            <button
              className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
              onClick={fetchBins}
              disabled={refreshing}
              title="Refresh data"
            >
              🔄
            </button>
            <button className="btn-signout" onClick={handleSignOut} title="Sign Out">
              🚪 Sign Out
            </button>
          </div>
        </header>

        {/* Alert Banner */}
        {alertBins.length > 0 && (
          <div className="alert-banner animate-slide-in">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Warning:</strong> {alertBins.length} bin{alertBins.length > 1 ? 's are' : ' is'} above 80% capacity!
              <span className="alert-locations">
                {alertBins.map((b) => b.location).join(', ')}
              </span>
            </div>
          </div>
        )}

        {loading && !refreshing ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard…</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>❌ {error}</p>
            <button className="btn-retry" onClick={fetchBins}>Retry</button>
          </div>
        ) : (
          <div className="dashboard-grid animate-fade-in">
            {activeNav === 'dashboard' && (
              <>
                {/* Stat Cards */}
                <section className="stat-cards">
                  <div className="stat-card stat-total">
                    <div className="stat-icon">🗑️</div>
                    <div className="stat-info">
                      <span className="stat-value">{totalBins}</span>
                      <span className="stat-label">Total Bins</span>
                    </div>
                  </div>
                  <div className="stat-card stat-empty">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <span className="stat-value">{emptyBins}</span>
                      <span className="stat-label">Empty</span>
                    </div>
                  </div>
                  <div className="stat-card stat-half">
                    <div className="stat-icon">🟡</div>
                    <div className="stat-info">
                      <span className="stat-value">{halfBins}</span>
                      <span className="stat-label">Half-filled</span>
                    </div>
                  </div>
                  <div className="stat-card stat-full">
                    <div className="stat-icon">🔴</div>
                    <div className="stat-info">
                      <span className="stat-value">{fullBins}</span>
                      <span className="stat-label">Full</span>
                    </div>
                  </div>
                </section>

                {/* Chart + Recent Activity */}
                <section className="middle-row">
                  <div className="panel chart-panel">
                    <h2 className="panel-title">Fill Levels</h2>
                    <FillChart bins={bins} />
                  </div>
                  <div className="panel activity-panel">
                    <h2 className="panel-title">Recent Activity</h2>
                    {recentBins.length === 0 ? (
                      <p className="no-activity">No recent activity</p>
                    ) : (
                      <ul className="activity-list">
                        {recentBins.map((bin) => (
                          <li key={bin._id} className="activity-item">
                            <div className={`activity-dot dot-${bin.status}`}></div>
                            <div className="activity-info">
                              <span className="activity-location">{bin.location}</span>
                              <span className="activity-detail">
                                {bin.fillLevel}% — {bin.status}
                              </span>
                            </div>
                            <span className="activity-time">
                              {new Date(bin.lastUpdated).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>

                {/* Bin Table */}
                <section className="panel table-panel">
                  <h2 className="panel-title">All Bins</h2>
                  <BinTable bins={bins} />
                </section>
              </>
            )}

            {activeNav === 'tracking' && <Tracking bins={bins} />}

            {activeNav === 'notifications' && <Notifications bins={bins} />}

            {activeNav === 'rewards' && <Rewards user={user} />}

            {activeNav === 'report' && <ReportIssue user={user} onReportSubmit={fetchBins} />}

            {activeNav === 'admin' && <AdminPanel bins={bins} onRefresh={fetchBins} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
