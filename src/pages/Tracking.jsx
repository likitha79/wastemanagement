import { useState, useMemo } from 'react';
import BinDetails from '../components/BinDetails';
import './Tracking.css';

/* Placeholder coordinates for demo locations */
const LOCATION_COORDS = {
  Canteen:   { x: 35, y: 28 },
  Library:   { x: 68, y: 22 },
  Hostel:    { x: 25, y: 55 },
  Lab:       { x: 72, y: 58 },
  Gym:       { x: 50, y: 75 },
  Gate:      { x: 15, y: 80 },
  Cafeteria: { x: 55, y: 40 },
  Auditorium:{ x: 42, y: 60 },
  Parking:   { x: 82, y: 42 },
  Garden:    { x: 30, y: 42 },
};

function getCoords(location) {
  return LOCATION_COORDS[location] || {
    x: 20 + Math.abs(hashCode(location) % 60),
    y: 20 + Math.abs(hashCode(location) % 60),
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const STATUS_COLORS = { empty: '#4caf50', half: '#ff9800', full: '#f44336' };

function Tracking({ bins }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBin, setSelectedBin] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  const filtered = useMemo(() => {
    return bins.filter((b) => {
      const matchesFilter = filter === 'all' || b.status === filter;
      const matchesSearch = b.location.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [bins, filter, search]);

  return (
    <div className="tracking-page animate-fade-in">
      {/* Toolbar */}
      <div className="tracking-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['all', 'empty', 'half', 'full'].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''} filter-${f}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Map view"
          >
            🗺️
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            📋
          </button>
        </div>
      </div>

      {/* Content area */}
      {viewMode === 'map' ? (
        <div className="map-container panel">
          <div className="map-placeholder">
            {/* Grid lines for visual map effect */}
            <svg className="map-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[20, 40, 60, 80].map((v) => (
                <g key={v}>
                  <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(0,0,0,.06)" strokeWidth="0.3" />
                  <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(0,0,0,.06)" strokeWidth="0.3" />
                </g>
              ))}
            </svg>

            {/* Road-like paths */}
            <svg className="map-roads" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M10 50 Q30 45 50 50 Q70 55 90 50" stroke="rgba(0,0,0,.08)" strokeWidth="1.5" fill="none" />
              <path d="M50 10 Q45 30 50 50 Q55 70 50 90" stroke="rgba(0,0,0,.08)" strokeWidth="1.5" fill="none" />
            </svg>

            {/* Map label */}
            <div className="map-label">📍 Campus Map</div>

            {/* Bin markers */}
            {filtered.map((bin) => {
              const pos = getCoords(bin.location);
              return (
                <button
                  key={bin._id}
                  className={`map-marker marker-${bin.status}`}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={() => setSelectedBin(bin)}
                  title={`${bin.location} — ${bin.fillLevel}%`}
                >
                  <span className="marker-pin">📍</span>
                  <span className="marker-tooltip">
                    <strong>{bin.location}</strong>
                    <span>{bin.fillLevel}%</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bin-cards-grid">
          {filtered.length === 0 ? (
            <p className="no-results">No bins match your search.</p>
          ) : (
            filtered.map((bin) => (
              <div
                key={bin._id}
                className="bin-card"
                onClick={() => setSelectedBin(bin)}
              >
                <div className="bin-card-header">
                  <span className="bin-card-location">{bin.location}</span>
                  <span
                    className="bin-card-status"
                    style={{ background: STATUS_COLORS[bin.status] }}
                  >
                    {bin.status}
                  </span>
                </div>

                {/* Fill level bar */}
                <div className="fill-bar-wrapper">
                  <div
                    className="fill-bar"
                    style={{
                      width: `${bin.fillLevel}%`,
                      background: STATUS_COLORS[bin.status],
                    }}
                  ></div>
                </div>
                <span className="fill-label">{bin.fillLevel}% full</span>

                <div className="bin-card-footer">
                  <span className="bin-card-time">
                    Updated: {new Date(bin.lastUpdated).toLocaleString()}
                  </span>
                  <span className="bin-card-action">View →</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bin Details Modal */}
      {selectedBin && (
        <BinDetails bin={selectedBin} onClose={() => setSelectedBin(null)} />
      )}
    </div>
  );
}

export default Tracking;
