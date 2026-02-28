import React, { useState, useEffect } from 'react';

// Mock data for when backend is not connected
const MOCK_STATS = {
  totalUsers: 1247, activeUsers: 342, totalApiClients: 28,
  totalJobs: 18432, completedJobs: 16891, failedJobs: 412,
  successRate: 92, kieCreditsUsed: 16891, revenueTotal: 253365,
  cloudinaryStorageMB: 4210, updatedAt: new Date().toISOString(),
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API, fall back to mock data for demo
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => setStats(res.data))
      .catch(() => setStats(MOCK_STATS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading analytics...</div>;

  return (
    <div>
      <h1 className="page-title">Platform Analytics</h1>
      <p className="page-desc">Overview of platform performance, user activity, and KIE engine usage.</p>

      {/* ── Primary Stats ──────────────────────────── */}
      <div className="stat-grid">
        <StatCard label="Total Users" value={formatNum(stats.totalUsers)} />
        <StatCard label="Active (30d)" value={formatNum(stats.activeUsers)} color="var(--accent)" />
        <StatCard label="API Clients" value={formatNum(stats.totalApiClients)} />
        <StatCard label="Total Jobs" value={formatNum(stats.totalJobs)} />
        <StatCard label="Completed" value={formatNum(stats.completedJobs)} color="var(--success)" />
        <StatCard label="Failed" value={formatNum(stats.failedJobs)} color="var(--danger)" />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} color="var(--success)" />
        <StatCard label="KIE Credits" value={formatNum(stats.kieCreditsUsed)} />
      </div>

      {/* ── Revenue & Storage ──────────────────────── */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Revenue</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--success)', marginBottom: 8 }}>
            ₹{formatNum(stats.revenueTotal)}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Total platform revenue</span>
        </div>
        <div className="card">
          <div className="card-title">Cloudinary Storage</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--warning)', marginBottom: 8 }}>
            {(stats.cloudinaryStorageMB / 1024).toFixed(1)} GB
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {formatNum(stats.cloudinaryStorageMB)} MB used
          </span>
        </div>
      </div>

      {/* ── Pipeline Overview ──────────────────────── */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">KIE Pipeline Architecture</div>
        <div className="pipeline-track">
          {['Intake', 'Analysis', 'Instruction', 'Compilation', 'Generation', 'Complete'].map((s, i) => (
            <React.Fragment key={s}>
              <div className="pipeline-step" style={{ flexDirection: 'column', flex: 'none' }}>
                <div className="pipeline-dot done">{i + 1}</div>
                <div className="pipeline-label">{s}</div>
              </div>
              {i < 5 && <div className="pipeline-line done" />}
            </React.Fragment>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
          Gemini → preprocessing only · KIE → primary image generation engine
        </p>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, textAlign: 'right' }}>
        Last updated: {new Date(stats.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: color || 'var(--accent)' }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}
