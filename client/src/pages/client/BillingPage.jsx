import React, { useState, useEffect } from 'react';
import { getClientBilling } from '../../services/api.js';

export default function BillingPage() {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientBilling()
      .then((res) => setBilling(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page container">
      <h1 className="page-title">Billing</h1>

      {loading ? (
        <p>Loading...</p>
      ) : billing && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--color-success)' }}>{billing.creditsRemaining}</div>
              <div className="stat-label">Credits Remaining</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{billing.creditsUsed}</div>
              <div className="stat-label">Credits Used</div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 18, marginBottom: 16 }}>Billing Details</h2>
            <div style={{ display: 'grid', gap: 12, color: 'var(--color-text-secondary)' }}>
              <div>Plan: <span className="badge badge-info">{billing.plan}</span></div>
              <div>Billing Email: <strong>{billing.billingEmail || 'Not set'}</strong></div>
              <div>Credit Cost: <strong>1 credit per generation</strong></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
