import React, { useState, useEffect } from 'react';
import { getClientJobs } from '../../services/api.js';

export default function AssetsPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = filter ? `status=${filter}&limit=50` : 'limit=50';
    getClientJobs(params)
      .then((res) => setJobs(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const getStatusBadge = (s) => {
    const map = { completed: 'badge-success', failed: 'badge-danger' };
    return map[s] || 'badge-info';
  };

  return (
    <div className="page container">
      <h1 className="page-title">Generated Assets</h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['', 'completed', 'failed', 'generation'].map((f) => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="card"><p>No assets found.</p></div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>Job ID</th><th>Category</th><th>Status</th><th>Resolution</th><th>Created</th><th>Output</th></tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.jobId}>
                  <td style={{ fontSize: 12 }}>{j.jobId?.substring(0, 8)}...</td>
                  <td>{j.category || '—'}</td>
                  <td><span className={`badge ${getStatusBadge(j.status)}`}>{j.status}</span></td>
                  <td>{j.resolution || '—'}</td>
                  <td style={{ fontSize: 13 }}>{j.createdAt?.split('T')[0] || '—'}</td>
                  <td>{j.outputUrl ? <a href={j.outputUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '4px 10px', fontSize: 12 }}>Download</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
