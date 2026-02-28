import React from 'react';

const PIPELINE_STAGES = ['intake', 'analysis', 'instruction', 'compilation', 'generation', 'completed'];

const FEATURES = [
  { name: 'Categories', count: 12, examples: 'Men, Women, Kids, Footwear, Jewellery, Bags, Home Textiles' },
  { name: 'Resolutions', count: 2, examples: '2K (2048px), 4K (4096px)' },
  { name: 'Aspect Ratios', count: 6, examples: '1:1, 4:5, 3:4, 9:16, 16:9, Custom' },
  { name: 'Poses', count: 8, examples: 'Standing, Sitting, Walking, Over Neck, Aesthetic, Twirl, Closeup' },
  { name: 'Model Ethnicity', count: 6, examples: 'Indian, Headless, Ghost (3D), International, African, Asian' },
  { name: 'Frames', count: 7, examples: 'Front+Back, 2/3 Bubble Closeup, 3-Collage, 3 Border Styles' },
  { name: 'Backgrounds', count: 3, examples: 'Studio (solid/textured), AI Outdoor, AI Indoor' },
  { name: 'Color Filters', count: 8, examples: 'Normal, Black, Clarendon, Juno, Valencia, Tokyo, Sepia, Nordic' },
  { name: 'Festival Themes', count: 10, examples: 'Diwali, Holi, Eid, Christmas, Independence Day, etc.' },
  { name: 'Ecommerce Modes', count: 4, examples: 'Amazon, Flipkart, Myntra, Meesho (auto-compliance)' },
  { name: 'Text Overlay', count: '∞', examples: 'Custom text, 8 fonts, 6 bubble styles' },
  { name: 'Branding', count: 3, examples: 'Logo placement, Watermark, Platform branding' },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="page-title">Platform Settings</h1>
      <p className="page-desc">Configuration details for the KIE-centric pipeline and supported features.</p>

      {/* ── Engine Configuration ────────────────────── */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">🔧 KIE Engine</div>
          <div style={{ display: 'grid', gap: 14 }}>
            <ConfigRow label="KIE API URL" value="Configured via .env" />
            <ConfigRow label="KIE Timeout" value="120,000ms" />
            <ConfigRow label="Architecture" badge="KIE-Centric" badgeClass="badge-success" />
            <ConfigRow label="Gemini Role" badge="Preprocessing Only" badgeClass="badge-warning" />
          </div>
        </div>
        <div className="card">
          <div className="card-title">🛡️ Security</div>
          <div style={{ display: 'grid', gap: 14 }}>
            <ConfigRow label="Authentication" value="API Key (Bearer)" />
            <ConfigRow label="RBAC" badge="3 Roles" badgeClass="badge-accent" />
            <ConfigRow label="Rate Limit" value="10 req/sec/IP" />
            <ConfigRow label="Headers" value="Helmet (CSP + HSTS)" />
          </div>
        </div>
      </div>

      {/* ── Pipeline Stages ─────────────────────────── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">⚡ Pipeline Stages</div>
        <div className="pipeline-track" style={{ padding: '8px 0' }}>
          {PIPELINE_STAGES.map((stage, i) => (
            <React.Fragment key={stage}>
              <div className="pipeline-step" style={{ flexDirection: 'column', flex: 'none' }}>
                <div className="pipeline-dot done">{i + 1}</div>
                <div className="pipeline-label">{stage}</div>
              </div>
              {i < PIPELINE_STAGES.length - 1 && <div className="pipeline-line done" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Supported Features ──────────────────────── */}
      <div className="card">
        <div className="card-title">🎨 Supported Features ({FEATURES.length})</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Feature</th><th>Options</th><th>Examples</th></tr>
            </thead>
            <tbody>
              {FEATURES.map((f) => (
                <tr key={f.name}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</td>
                  <td><span className="badge badge-accent">{f.count}</span></td>
                  <td style={{ fontSize: 13 }}>{f.examples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, badge, badgeClass }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      {badge ? (
        <span className={`badge ${badgeClass}`}>{badge}</span>
      ) : (
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
      )}
    </div>
  );
}
