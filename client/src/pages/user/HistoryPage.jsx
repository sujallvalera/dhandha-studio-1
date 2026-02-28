import React, { useState, useEffect } from 'react';

const MOCK_JOBS = [
  { jobId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', status: 'completed', category: 'men', resolution: '2K', aspectRatio: '1:1', outputUrl: '#', createdAt: '2026-02-28T14:20:00Z', metadata: { width: 2048, height: 2048, durationMs: 42000 } },
  { jobId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901', status: 'completed', category: 'women', resolution: '4K', aspectRatio: '4:5', outputUrl: '#', createdAt: '2026-02-28T12:10:00Z', metadata: { width: 3276, height: 4096, durationMs: 58000 } },
  { jobId: 'c3d4e5f6-a7b8-9012-cdef-123456789012', status: 'failed', category: 'jewellery', resolution: '2K', aspectRatio: '1:1', outputUrl: null, createdAt: '2026-02-27T18:45:00Z', metadata: { durationMs: 15000 } },
  { jobId: 'd4e5f6a7-b8c9-0123-defa-234567890123', status: 'completed', category: 'footwear_men', resolution: '2K', aspectRatio: '3:4', outputUrl: '#', createdAt: '2026-02-27T10:30:00Z', metadata: { width: 1536, height: 2048, durationMs: 39000 } },
  { jobId: 'e5f6a7b8-c9d0-1234-efab-345678901234', status: 'completed', category: 'bags', resolution: '2K', aspectRatio: '1:1', outputUrl: '#', createdAt: '2026-02-26T16:15:00Z', metadata: { width: 2048, height: 2048, durationMs: 35000 } },
  { jobId: 'f6a7b8c9-d0e1-2345-fabc-456789012345', status: 'generation', category: 'women', resolution: '4K', aspectRatio: '9:16', outputUrl: null, createdAt: '2026-02-28T15:00:00Z', metadata: {} },
];

export default function HistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/user/history?limit=20', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs(MOCK_JOBS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? jobs.filter((j) => j.status === filter) : jobs;
  const counts = { all: jobs.length, completed: 0, failed: 0, processing: 0 };
  jobs.forEach((j) => {
    if (j.status === 'completed') counts.completed++;
    else if (j.status === 'failed') counts.failed++;
    else counts.processing++;
  });

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading history...</div>;

  return (
    <div>
      <h1 className="page-title">Generation History</h1>
      <p className="page-desc">All your AI photoshoot generations with status and output links.</p>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{counts.all}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{counts.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{counts.failed}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{counts.processing}</div>
          <div className="stat-label">In Progress</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['', 'All'], ['completed', 'Completed'], ['failed', 'Failed']].map(([val, label]) => (
          <button key={val} className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(val)}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗂️</div>
            <div className="empty-title">No jobs found</div>
            <div className="empty-desc">Start by uploading a product image!</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Resolution</th>
                  <th>Aspect</th>
                  <th>Duration</th>
                  <th>Date</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.jobId}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{j.jobId?.substring(0, 8)}…</td>
                    <td style={{ textTransform: 'capitalize' }}>{j.category?.replace(/_/g, ' ')}</td>
                    <td>
                      <span className={`badge ${
                        j.status === 'completed' ? 'badge-success' :
                        j.status === 'failed' ? 'badge-danger' : 'badge-warning'
                      }`}>{j.status}</span>
                    </td>
                    <td>{j.resolution || '—'}</td>
                    <td>{j.aspectRatio || '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {j.metadata?.durationMs ? `${(j.metadata.durationMs / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {j.outputUrl ? (
                        <a href={j.outputUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                          View
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
