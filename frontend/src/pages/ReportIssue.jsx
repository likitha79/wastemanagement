import { useState, useRef } from 'react';
import API_BASE from '../config/api';
import './ReportIssue.css';

const LOCATIONS = [
  'Canteen',
  'Library',
  'Hostel',
  'Lab',
  'Gym',
  'Cafeteria',
  'Auditorium',
  'Parking',
  'Garden',
  'Gate',
];

function ReportIssue({ user, onReportSubmit }) {
  const [location, setLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: finalLocation,
          issueType,
          description,
          userId: user?.id,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to submit');
      }
      setSubmitted(true);
      if (onReportSubmit) onReportSubmit();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReport = () => {
    setLocation('');
    setCustomLocation('');
    setIssueType('');
    setDescription('');
    setPhoto(null);
    setPhotoPreview(null);
    setSubmitted(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const finalLocation = location === 'Other' ? customLocation : location;

  if (submitted) {
    return (
      <div className="report-page animate-fade-in">
        <div className="report-success panel">
          <span className="success-icon">✅</span>
          <h2>Report Submitted!</h2>
          <p>Thank you for helping keep the campus clean.</p>
          <p className="success-detail">
            Our team has been notified and will address the issue at <strong>{finalLocation}</strong> shortly.
          </p>
          <button className="btn-new-report" onClick={handleNewReport}>
            📝 Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-page animate-fade-in">
      <div className="report-form-card panel">
        <h2 className="report-title">📋 Report a Waste Issue</h2>
        <p className="report-subtitle">Help us maintain a cleaner campus</p>

        <form onSubmit={handleSubmit} className="report-form">
          {/* Photo upload */}
          <div className="form-group">
            <label className="form-label">📷 Upload Photo</label>
            <div
              className={`photo-upload ${photoPreview ? 'has-photo' : ''}`}
              onClick={() => !photoPreview && fileRef.current?.click()}
            >
              {photoPreview ? (
                <div className="photo-preview-wrap">
                  <img src={photoPreview} alt="Issue" className="photo-preview" />
                  <button type="button" className="photo-remove" onClick={removePhoto}>
                    ✕
                  </button>
                </div>
              ) : (
                <div className="photo-placeholder">
                  <span className="upload-icon">📁</span>
                  <span>Click to upload a photo</span>
                  <span className="upload-hint">JPG, PNG up to 5MB</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Location dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="report-location">📍 Location</label>
            <select
              id="report-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="form-input form-select"
            >
              <option value="" disabled>Select a location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
              <option value="Other">Other (specify below)</option>
            </select>
            {location === 'Other' && (
              <input
                type="text"
                placeholder="Enter location…"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                required
                className="form-input"
                style={{ marginTop: 8 }}
              />
            )}
          </div>

          {/* Issue type */}
          <div className="form-group">
            <label className="form-label">⚠️ Issue Type</label>
            <div className="issue-type-group">
              <button
                type="button"
                className={`issue-type-btn ${issueType === 'full' ? 'active issue-full' : ''}`}
                onClick={() => setIssueType('full')}
              >
                🔴 Bin is Full
              </button>
              <button
                type="button"
                className={`issue-type-btn ${issueType === 'not-segregated' ? 'active issue-segregated' : ''}`}
                onClick={() => setIssueType('not-segregated')}
              >
                🟡 Waste Not Segregated
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="report-desc">📝 Description</label>
            <textarea
              id="report-desc"
              placeholder="Describe the issue…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="form-input form-textarea"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-submit-report"
            disabled={submitting || !finalLocation || !issueType || !description}
          >
            {submitting ? (
              <>
                <span className="btn-spinner"></span>
                Submitting…
              </>
            ) : (
              '🚀 Submit Report'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReportIssue;
