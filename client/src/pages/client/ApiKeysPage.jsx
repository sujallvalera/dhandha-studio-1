import React, { useState, useEffect } from 'react';
import { getApiKeys, generateApiKey, rotateApiKey } from '../../services/api.js';

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState(null);

  const loadKeys = () => {
    setLoading(true);
    getApiKeys()
      .then((res) => setKeys(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadKeys, []);

  const handleGenerate = async () => {
    const label = prompt('Key label:') || 'Default';
    const res = await generateApiKey({ label });
    setNewKey(res.data);
    loadKeys();
  };

  const handleRotate = async (keyId) => {
    if (confirm('Rotate this key? The old key will be invalidated immediately.')) {
      const res = await rotateApiKey(keyId);
      setNewKey({ apiKey: res.data.newApiKey, keyId: res.data.newKeyId });
      loadKeys();
    }
  };

  return (
    <div className="page container">
      <h1 className="page-title">API Keys</h1>

      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={handleGenerate}>Generate New Key</button>
      </div>

      {newKey && (
        <div className="card" style={{ marginBottom: 16, borderColor: 'var(--color-success)' }}>
          <h3 style={{ color: 'var(--color-success)', fontSize: 14, marginBottom: 8 }}>New API Key Generated</h3>
          <code style={{ fontSize: 13, wordBreak: 'break-all', color: 'var(--color-text-primary)' }}>{newKey.apiKey}</code>
          <p style={{ fontSize: 12, color: 'var(--color-warning)', marginTop: 8 }}>⚠ Copy this key now. It will not be shown again in full.</p>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Label</th>
                <th>Rate Limit</th>
                <th>Usage</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.keyId}>
                  <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{k.apiKey}</td>
                  <td>{k.label}</td>
                  <td>{k.rateLimit}/min</td>
                  <td>{k.usageCount}{k.usageLimit ? `/${k.usageLimit}` : ''}</td>
                  <td style={{ fontSize: 13 }}>{k.createdAt?.split('T')[0] || '—'}</td>
                  <td><button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => handleRotate(k.keyId)}>Rotate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
