import { useState, useMemo } from 'react';
import './Notifications.css';

function Notifications({ bins }) {
  /* Generate notifications from bins with fillLevel > 80 */
  const initialNotifs = useMemo(() => {
    const alerts = [];
    bins.forEach((bin) => {
      if (bin.fillLevel > 80) {
        alerts.push({
          id: `${bin._id || bin.location}-critical`,
          type: 'critical',
          icon: '🔴',
          message: `${bin.location} bin is almost full (${bin.fillLevel}%)`,
          detail: 'Immediate collection required',
          time: bin.lastUpdated || new Date().toISOString(),
          read: false,
        });
      }
      if (bin.fillLevel > 60 && bin.fillLevel <= 80) {
        alerts.push({
          id: `${bin._id || bin.location}-warning`,
          type: 'warning',
          icon: '🟠',
          message: `${bin.location} bin is filling up (${bin.fillLevel}%)`,
          detail: 'Schedule collection soon',
          time: bin.lastUpdated || new Date().toISOString(),
          read: false,
        });
      }
    });
    // Sort newest first
    alerts.sort((a, b) => new Date(b.time) - new Date(a.time));
    return alerts;
  }, [bins]);

  const [notifications, setNotifications] = useState(initialNotifs);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="notif-page animate-fade-in">
      {/* Header bar */}
      <div className="notif-header">
        <div className="notif-header-left">
          <h2 className="notif-count">
            {unreadCount > 0
              ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </h2>
        </div>
        <div className="notif-header-right">
          <button className="notif-action-btn" onClick={markAllRead} disabled={unreadCount === 0}>
            ✅ Mark all read
          </button>
          <button className="notif-action-btn notif-clear-btn" onClick={clearAll} disabled={notifications.length === 0}>
            🗑️ Clear all
          </button>
        </div>
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="notif-empty panel">
          <span className="notif-empty-icon">🔔</span>
          <p>No notifications</p>
          <span className="notif-empty-sub">All bins are operating normally</span>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.read ? 'notif-read' : ''} notif-${n.type}`}
              onClick={() => toggleRead(n.id)}
            >
              <div className="notif-icon-col">
                <span className="notif-icon">{n.icon}</span>
                {!n.read && <span className="notif-unread-dot"></span>}
              </div>
              <div className="notif-content">
                <p className="notif-message">{n.message}</p>
                <p className="notif-detail">{n.detail}</p>
              </div>
              <div className="notif-meta">
                <span className="notif-time">
                  {new Date(n.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="notif-date">
                  {new Date(n.time).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;
