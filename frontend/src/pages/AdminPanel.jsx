import { useState } from 'react';
import API_BASE from '../config/api';
import './AdminPanel.css';

function AdminPanel({ bins, onRefresh }) {
  const [formData, setFormData] = useState({ location: '', fillLevel: 0, status: 'empty' });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const API = `${API_BASE}/api/bins`;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const resetForm = () => {
    setFormData({ location: '', fillLevel: 0, status: 'empty' });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location.trim()) {
      showMessage('error', 'Location is required');
      return;
    }
    if (formData.fillLevel < 0 || formData.fillLevel > 100) {
      showMessage('error', 'Fill level must be between 0 and 100');
      return;
    }

    setLoading(true);

    try {
      const url = editId ? `${API}/${editId}` : API;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Request failed');
      }

      showMessage('success', editId ? 'Bin updated successfully!' : 'Bin added successfully!');
      resetForm();
      onRefresh();
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bin) => {
    setEditId(bin._id);
    setFormData({
      location: bin.location,
      fillLevel: bin.fillLevel,
      status: bin.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bin?')) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Delete failed');
      }

      showMessage('success', 'Bin deleted successfully!');
      onRefresh();
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'full') return '#f44336';
    if (status === 'half') return '#ff9800';
    return '#4caf50';
  };

  return (
    <div className="admin-page animate-fade-in">
      {/* Message toast */}
      {message.text && (
        <div className={`admin-toast admin-toast-${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Add / Edit Form */}
      <div className="panel admin-form-panel">
        <h2 className="panel-title">
          {editId ? '✏️ Edit Bin' : '➕ Add New Bin'}
        </h2>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-grid">
            <div className="admin-field">
              <label htmlFor="admin-location">Location</label>
              <input
                id="admin-location"
                type="text"
                placeholder="e.g. Canteen, Library"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-fill">Fill Level (%)</label>
              <input
                id="admin-fill"
                type="number"
                min="0"
                max="100"
                value={formData.fillLevel}
                onChange={(e) => setFormData({ ...formData, fillLevel: Number(e.target.value) })}
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-status">Status</label>
              <select
                id="admin-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="empty">🟢 Empty</option>
                <option value="half">🟡 Half</option>
                <option value="full">🔴 Full</option>
              </select>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
              {loading ? '⏳ Saving…' : editId ? '💾 Update Bin' : '➕ Add Bin'}
            </button>
            {editId && (
              <button type="button" className="admin-btn admin-btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bins management table */}
      <div className="panel admin-table-panel">
        <h2 className="panel-title">🗑️ Manage Bins ({bins.length})</h2>

        {bins.length === 0 ? (
          <p className="admin-empty">No bins found. Add one above!</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Fill Level</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((bin) => (
                  <tr key={bin._id}>
                    <td className="admin-td-location">{bin.location}</td>
                    <td>
                      <div className="admin-fill-bar">
                        <div
                          className="admin-fill-inner"
                          style={{
                            width: `${bin.fillLevel}%`,
                            background: getStatusColor(bin.status),
                          }}
                        />
                        <span className="admin-fill-text">{bin.fillLevel}%</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: getStatusColor(bin.status) }}
                      >
                        {bin.status}
                      </span>
                    </td>
                    <td className="admin-td-time">
                      {new Date(bin.lastUpdated).toLocaleString()}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-btn-icon admin-btn-edit"
                          onClick={() => handleEdit(bin)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="admin-btn-icon admin-btn-delete"
                          onClick={() => handleDelete(bin._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
