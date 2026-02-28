import React, { useState, useEffect } from 'react';
import { getClientAnalytics } from '../../services/api.js';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getClientAnalytics(days)
      .then((res) => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="page container">
      <h1 className="page-title">Usage Analytics</h1>

      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {[7, 14, 30, 90].map((d) => (
          <button key={d} className={`btn ${days === d ? 'btn-primary' : 'btn-outline'}`} onClick={() => setDays(d)}>{d} days</button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : analytics && (
        <>
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-value">{analytics.totalRequests}</div><div className="stat-label">Total Requests</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{analytics.successfulRequests}</div><div className="stat-label">Successful</div></div>
            <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-danger)' }}>{analytics.failedRequests}</div><div className="stat-label">Failed</div></div>
            <div className="stat-card"><div className="stat-value">{analytics.successRate}%</div><div className="stat-label">Success Rate</div></div>
            <div className="stat-card"><div className="stat-value">{analytics.avgLatencyMs}ms</div><div className="stat-label">Avg Latency</div></div>
            <div className="stat-card"><div className="stat-value">{analytics.requestsPerDay}</div><div className="stat-label">Requests/Day</div></div>
          </div>

          {analytics.dailyBreakdown && (
            <div className="card">
              <h2 style={{ fontSize: 16, marginBottom: 12 }}>Daily Breakdown</h2>
              <table className="table">
                <thead><tr><th>Date</th><th>Total</th><th>Completed</th><th>Failed</th></tr></thead>
                <tbody>
                  {Object.entries(analytics.dailyBreakdown).sort().reverse().slice(0, 14).map(([date, data]) => (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{data.total}</td>
                      <td style={{ color: 'var(--color-success)' }}>{data.completed}</td>
                      <td style={{ color: 'var(--color-danger)' }}>{data.failed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
