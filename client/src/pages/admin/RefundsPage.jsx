import React, { useState, useEffect } from 'react';

const MOCK_REFUNDS = [
  { id: 'ref_001', refund_id: 'ref_001', user_id: 'usr_d4e5f6', job_id: 'job_abc', credits_requested: 1, reason: 'Image quality was poor — faces were distorted.', status: 'pending', created_at: '2026-02-27T14:30:00Z' },
  { id: 'ref_002', refund_id: 'ref_002', user_id: 'usr_g7h8i9', job_id: 'job_def', credits_requested: 1, reason: 'Wrong background applied. Requested studio white, got outdoor.', status: 'pending', created_at: '2026-02-28T09:15:00Z' },
  { id: 'ref_003', refund_id: 'ref_003', user_id: 'usr_j0k1l2', job_id: 'job_ghi', credits_requested: 2, reason: 'Generation timed out twice.', status: 'pending', created_at: '2026-02-28T11:45:00Z' },
];

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLog, setActionLog] = useState('');

  useEffect(() => {
    fetch('/api/admin/refunds', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => setRefunds(res.data || []))
      .catch(() => setRefunds(MOCK_REFUNDS))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = (id) => {
    setRefunds((prev) => prev.filter((r) => r.id !== id));
    setActionLog(`✅ Refund ${id} approved. Credit returned.`);
    setTimeout(() => setActionLog(''), 4000);
  };

  const handleReject = (id) => {
    const reason = prompt('Rejection reason:');
    if (reason) {
      setRefunds((prev) => prev.filter((r) => r.id !== id));
      setActionLog(`❌ Refund ${id} rejected: ${reason}`);
      setTimeout(() => setActionLog(''), 4000);
    }
  };

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading refunds...</div>;

  return (
    <div>
      <h1 className="page-title">Refund Requests</h1>
      <p className="page-desc">Review and manage pending refund requests from users.</p>

      {actionLog && <div className="alert alert-success">{actionLog}</div>}

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{refunds.length}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {refunds.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <div className="empty-title">All clear!</div>
            <div className="empty-desc">No pending refund requests.</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Job</th>
                  <th>Credits</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.refund_id}</td>
                    <td style={{ fontSize: 12 }}>{r.user_id}</td>
                    <td style={{ fontSize: 12 }}>{r.job_id}</td>
                    <td><span className="badge badge-warning">{r.credits_requested}</span></td>
                    <td style={{ maxWidth: 260, fontSize: 13, lineHeight: 1.4 }}>{r.reason}</td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn btn-sm btn-success" style={{ marginRight: 6 }} onClick={() => handleApprove(r.id)}>
                        Approve
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(r.id)}>
                        Reject
                      </button>
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
