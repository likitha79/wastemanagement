import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import './BinDetails.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const STATUS_COLORS = { empty: '#4caf50', half: '#ff9800', full: '#f44336' };
const STATUS_LABELS = { empty: 'Empty', half: 'Half-filled', full: 'Full' };

/* Generate mock historical data for demo */
function generateHistory(currentLevel) {
  const hours = ['6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', 'Now'];
  const data = hours.map((_, i) => {
    if (i === hours.length - 1) return currentLevel;
    const base = Math.max(5, currentLevel - (hours.length - 1 - i) * 10 + Math.floor(Math.random() * 15));
    return Math.min(100, Math.max(0, base));
  });
  return { labels: hours, values: data };
}

function BinDetails({ bin, onClose, onMarkEmpty }) {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [markedEmpty, setMarkedEmpty] = useState(false);

  if (!bin) return null;

  const fillColor = STATUS_COLORS[bin.status] || '#999';
  const history = generateHistory(bin.fillLevel);

  const chartData = {
    labels: history.labels,
    datasets: [
      {
        label: 'Fill Level',
        data: history.values,
        borderColor: fillColor,
        backgroundColor: fillColor + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: fillColor,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,.04)' } },
      x: { grid: { display: false } },
    },
  };

  const handleMarkEmpty = () => {
    setMarkedEmpty(true);
    if (onMarkEmpty) onMarkEmpty(bin._id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="modal-header" style={{ borderColor: fillColor }}>
          <span className="modal-icon">🗑️</span>
          <div>
            <h2 className="modal-title">{bin.location}</h2>
            <p className="modal-subtitle">Bin Details &amp; History</p>
          </div>
        </div>

        <div className="modal-body modal-body-col">
          {/* Top row: Gauge + Info */}
          <div className="detail-top-row">
            {/* Gauge */}
            <div className="gauge-container">
              <div className="gauge-bg">
                <div
                  className="gauge-fill"
                  style={{
                    height: markedEmpty ? '0%' : `${bin.fillLevel}%`,
                    background: markedEmpty ? '#4caf50' : fillColor,
                  }}
                ></div>
              </div>
              <span className="gauge-label">
                {markedEmpty ? '0%' : `${bin.fillLevel}%`}
              </span>
            </div>

            {/* Detail rows */}
            <div className="detail-rows">
              <div className="detail-row">
                <span className="detail-key">Status</span>
                <span className="detail-value">
                  <span
                    className="detail-badge"
                    style={{ background: markedEmpty ? '#4caf50' : fillColor }}
                  >
                    {markedEmpty ? 'Empty' : STATUS_LABELS[bin.status]}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Fill Level</span>
                <span className="detail-value">
                  {markedEmpty ? '0%' : `${bin.fillLevel}%`}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Location</span>
                <span className="detail-value">{bin.location}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Last Updated</span>
                <span className="detail-value">
                  {markedEmpty ? 'Just now' : new Date(bin.lastUpdated).toLocaleString()}
                </span>
              </div>
              {bin._id && (
                <div className="detail-row">
                  <span className="detail-key">Bin ID</span>
                  <span className="detail-value detail-id">{bin._id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Historical chart */}
          <div className="detail-chart-section">
            <h3 className="detail-section-title">📈 Fill Level History (Today)</h3>
            <div className="detail-chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button
              className={`btn-mark-empty ${markedEmpty ? 'btn-disabled' : ''}`}
              onClick={handleMarkEmpty}
              disabled={markedEmpty}
            >
              {markedEmpty ? '✅ Marked as Emptied' : '🧹 Mark as Emptied'}
            </button>

            <div className="notify-toggle">
              <span className="notify-label">
                🔔 Notifications for this bin
              </span>
              <button
                className={`toggle-switch ${notifyEnabled ? 'toggle-on' : ''}`}
                onClick={() => setNotifyEnabled(!notifyEnabled)}
                role="switch"
                aria-checked={notifyEnabled}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BinDetails;
