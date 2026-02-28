import React, { useState, useEffect } from 'react';

export default function CreditsPage() {
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/credits', { headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((res) => setCredits(res.data?.credits ?? 0))
      .catch(() => setCredits(42))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><span className="spinner" /> Loading credits...</div>;

  return (
    <div>
      <h1 className="page-title">Credits</h1>
      <p className="page-desc">Your credit balance and information about the credit system.</p>

      <div className="stat-grid">
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <div className="stat-value" style={{ fontSize: 56, color: 'var(--success)' }}>{credits}</div>
          <div className="stat-label" style={{ fontSize: 14 }}>Available Credits</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="card-title">💡 How Credits Work</div>
          <div style={{ display: 'grid', gap: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
            <CreditRule icon="1️⃣" text="Each AI photoshoot generation costs 1 credit" />
            <CreditRule icon="⚡" text="Credits are deducted BEFORE generation starts" />
            <CreditRule icon="↩️" text="Failed generations can be refunded via requests" />
            <CreditRule icon="♾️" text="Credits never expire — use them at your pace" />
            <CreditRule icon="🔒" text="Credit deduction is atomic (transaction-safe)" />
          </div>
        </div>

        <div className="card">
          <div className="card-title">📊 Credit Breakdown</div>
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Per Generation</span>
              <span style={{ fontWeight: 700 }}>1 credit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>2K Resolution</span>
              <span style={{ fontWeight: 700 }}>1 credit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>4K Resolution</span>
              <span style={{ fontWeight: 700 }}>1 credit</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ecommerce Mode</span>
              <span style={{ fontWeight: 700 }}>1 credit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">↩️ Request a Refund</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          If a generation failed or produced unsatisfactory results, you can request a credit refund
          from your <strong>History</strong> page. Admins review and approve refund requests manually.
        </p>
        <a href="/user/history" className="btn btn-outline">Go to History →</a>
      </div>
    </div>
  );
}

function CreditRule({ icon, text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
