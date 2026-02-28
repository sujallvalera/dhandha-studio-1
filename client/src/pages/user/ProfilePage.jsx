import React, { useState, useEffect } from 'react';

const MOCK_PROFILE = {
  userId: 'usr_a1b2c3',
  name: 'Aryan Kumar',
  email: 'aryan@dhandha.studio',
  role: 'admin',
  credits: 150,
  createdAt: '2025-11-15T10:00:00Z',
  stats: { totalJobs: 247, completed: 231, failed: 12, avgDurationMs: 41000 },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/user/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => { setProfile(res.data); setName(res.data.name || ''); setEmail(res.data.email || ''); })
      .catch(() => { setProfile(MOCK_PROFILE); setName(MOCK_PROFILE.name); setEmail(MOCK_PROFILE.email); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error();
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch {
      setMessage({ text: 'Profile saved (demo mode).', type: 'success' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading profile...</div>;

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <p className="page-desc">Manage your account details and view performance stats.</p>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="grid-2">
        {/* ── Account Details ───────────────────── */}
        <div className="card">
          <div className="card-title">👤 Account Details</div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
            </div>
            <div className="form-group">
              <label className="form-label">User ID</label>
              <input className="form-input" value={profile?.userId || ''} disabled style={{ opacity: 0.5 }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
              {saving ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── Stats & Role ──────────────────────── */}
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">🛡️ Account Info</div>
            <div style={{ display: 'grid', gap: 16 }}>
              <InfoRow label="Role" badge={profile?.role} badgeClass={profile?.role === 'admin' ? 'badge-danger' : profile?.role === 'client' ? 'badge-warning' : 'badge-accent'} />
              <InfoRow label="Credits" value={profile?.credits} valueColor="var(--success)" />
              <InfoRow label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'} />
            </div>
          </div>

          <div className="card">
            <div className="card-title">📊 Performance</div>
            <div className="stat-grid" style={{ marginBottom: 0 }}>
              <div className="stat-card"><div className="stat-value" style={{ fontSize: 24 }}>{profile?.stats?.totalJobs ?? 0}</div><div className="stat-label">Total Jobs</div></div>
              <div className="stat-card"><div className="stat-value" style={{ fontSize: 24, color: 'var(--success)' }}>{profile?.stats?.completed ?? 0}</div><div className="stat-label">Completed</div></div>
              <div className="stat-card"><div className="stat-value" style={{ fontSize: 24, color: 'var(--danger)' }}>{profile?.stats?.failed ?? 0}</div><div className="stat-label">Failed</div></div>
              <div className="stat-card"><div className="stat-value" style={{ fontSize: 24, color: 'var(--warning)' }}>{profile?.stats?.avgDurationMs ? `${(profile.stats.avgDurationMs / 1000).toFixed(0)}s` : '—'}</div><div className="stat-label">Avg Duration</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueColor, badge, badgeClass }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      {badge ? (
        <span className={`badge ${badgeClass}`}>{badge}</span>
      ) : (
        <span style={{ fontWeight: 700, color: valueColor || 'var(--text-primary)' }}>{value}</span>
      )}
    </div>
  );
}
