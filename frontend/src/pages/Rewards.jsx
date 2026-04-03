import { useState, useEffect } from 'react';
import API_BASE from '../config/api';
import './Rewards.css';

const RANK_BADGES = ['🏆', '🥈', '🥉'];

const BADGES = [
  { id: 'first',   icon: '⭐', title: 'First Report',          desc: 'Submit your first report', threshold: (u) => u.reportsCount >= 1 },
  { id: 'eco',     icon: '🌱', title: 'Eco Warrior',           desc: 'Report 10+ waste issues',  threshold: (u) => u.reportsCount >= 10 },
  { id: 'champ',   icon: '🏅', title: 'Cleanliness Champion',  desc: 'Top 3 on leaderboard',     threshold: (u) => u.rank <= 3 },
  { id: 'scout',   icon: '🔍', title: 'Bin Scout',             desc: 'Earn 100+ points',         threshold: (u) => u.points >= 100 },
  { id: 'streak',  icon: '🔥', title: 'Active Contributor',    desc: 'Earn 500+ points',         threshold: (u) => u.points >= 500 },
  { id: 'green',   icon: '♻️', title: 'Zero Waste Hero',       desc: 'Submit 50+ reports',       threshold: (u) => u.reportsCount >= 50 },
];

function Rewards({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/api/leaderboard`),
          fetch(`${API_BASE}/api/user/${user.id}`),
        ]);
        const lbData = await lbRes.json();
        const userData = await userRes.json();

        setLeaderboard(lbData);

        // Find user's rank
        const rank = lbData.findIndex((u) => u._id === user.id) + 1;
        setCurrentUser({ ...userData, rank: rank || lbData.length + 1 });
      } catch (err) {
        console.error('Failed to fetch rewards data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="rewards-page animate-fade-in" style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner"></div>
        <p>Loading rewards…</p>
      </div>
    );
  }

  const userPoints = currentUser?.points || 0;
  const userRank = currentUser?.rank || '-';
  const userReports = currentUser?.reportsCount || 0;

  // Evaluate badges for current user
  const evaluatedBadges = BADGES.map((b) => ({
    ...b,
    earned: b.threshold({ points: userPoints, reportsCount: userReports, rank: userRank }),
  }));

  return (
    <div className="rewards-page animate-fade-in">
      {/* User Points Card */}
      <div className="points-card">
        <div className="points-icon">🌟</div>
        <div className="points-info">
          <span className="points-value">{userPoints}</span>
          <span className="points-label">Your Green Points</span>
        </div>
        <div className="points-stats">
          <div className="points-rank">
            <span className="points-rank-num">#{userRank}</span>
            <span className="points-rank-label">Rank</span>
          </div>
          <div className="points-rank">
            <span className="points-rank-num">{userReports}</span>
            <span className="points-rank-label">Reports</span>
          </div>
        </div>
      </div>

      {/* How to earn points */}
      <section className="rewards-section">
        <h2 className="section-title">💡 How to Earn Points</h2>
        <div className="earn-grid">
          <div className="earn-card">
            <span className="earn-icon">🔑</span>
            <span className="earn-text">Daily Login</span>
            <span className="earn-pts">+10 pts</span>
          </div>
          <div className="earn-card">
            <span className="earn-icon">📋</span>
            <span className="earn-text">Submit Report</span>
            <span className="earn-pts">+25 pts</span>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="rewards-section">
        <h2 className="section-title">🏅 Your Badges ({evaluatedBadges.filter(b => b.earned).length}/{evaluatedBadges.length})</h2>
        <div className="badges-grid">
          {evaluatedBadges.map((b) => (
            <div key={b.id} className={`badge-card ${b.earned ? '' : 'badge-locked'}`}>
              <span className="badge-icon">{b.icon}</span>
              <span className="badge-title">{b.title}</span>
              <span className="badge-desc">{b.desc}</span>
              {b.earned ? (
                <span className="badge-earned-label">✅ Earned</span>
              ) : (
                <span className="badge-lock-label">🔒 Locked</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="rewards-section">
        <h2 className="section-title">🏆 Campus Leaderboard</h2>
        <div className="leaderboard panel">
          {leaderboard.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 30, color: '#999' }}>No users yet</p>
          ) : (
            leaderboard.map((u, idx) => (
              <div
                key={u._id}
                className={`lb-row ${idx < 3 ? 'lb-top' : ''} ${u._id === user.id ? 'lb-current' : ''}`}
              >
                <span className="lb-rank">
                  {idx < 3 ? RANK_BADGES[idx] : `#${idx + 1}`}
                </span>
                <div className="lb-user-info">
                  <span className="lb-name">
                    {u.name}
                    {u._id === user.id && <span className="lb-you-tag">YOU</span>}
                  </span>
                  <span className="lb-role">{u.role}</span>
                </div>
                <span className="lb-points">{(u.points || 0).toLocaleString()} pts</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Rewards;
