import React, { useState, useEffect } from 'react';

const MOCK_CLIENTS = [
  { clientId: 'cli_abc123', name: 'FastFashion Inc.', email: 'api@fastfashion.com', credits: 5000, plan: 'enterprise', totalJobs: 2340, createdAt: '2025-11-15' },
  { clientId: 'cli_def456', name: 'StyleHouse.io', email: 'dev@stylehouse.io', credits: 1200, plan: 'professional', totalJobs: 890, createdAt: '2025-12-02' },
  { clientId: 'cli_ghi789', name: 'BrandShoot Pro', email: 'hello@brandshoot.pro', credits: 340, plan: 'starter', totalJobs: 156, createdAt: '2026-01-18' },
  { clientId: 'cli_jkl012', name: 'MegaStore API', email: 'integration@megastore.in', credits: 8500, plan: 'enterprise', totalJobs: 5670, createdAt: '2025-08-20' },
];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/clients', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => setClients(res.data || []))
      .catch(() => setClients(MOCK_CLIENTS))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading clients...</div>;

  return (
    <div>
      <h1 className="page-title">API Clients</h1>
      <p className="page-desc">Enterprise B2B clients using the Dhandha Studio API.</p>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{clients.length}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {clients.reduce((s, c) => s + (c.credits || 0), 0).toLocaleString()}
          </div>
          <div className="stat-label">Total Credits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {clients.reduce((s, c) => s + (c.totalJobs || 0), 0).toLocaleString()}
          </div>
          <div className="stat-label">Total API Jobs</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Credits</th>
                <th>Jobs</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.clientId}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.clientId}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.name}</td>
                  <td>{c.email || '—'}</td>
                  <td>
                    <span className={`badge ${
                      c.plan === 'enterprise' ? 'badge-warning' :
                      c.plan === 'professional' ? 'badge-accent' : 'badge-success'
                    }`}>{c.plan || 'prepaid'}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{(c.credits || 0).toLocaleString()}</td>
                  <td>{(c.totalJobs || 0).toLocaleString()}</td>
                  <td style={{ fontSize: 13 }}>{c.createdAt?.split('T')[0] || c.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
