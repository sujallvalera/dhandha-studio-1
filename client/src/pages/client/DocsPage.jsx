import React from 'react';

export default function DocsPage() {
  return (
    <div className="page container">
      <h1 className="page-title">API Documentation</h1>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Authentication</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>All API requests require a Bearer token in the Authorization header:</p>
        <pre style={codeStyle}>{`Authorization: Bearer ds_live_<your_api_key>
X-Client-ID: <your_client_id>`}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>POST /generate</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>Submit a photoshoot generation job. Returns immediately with a job ID for polling.</p>
        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--color-text-muted)' }}>Request Body</h3>
        <pre style={codeStyle}>{`{
  "image_b64": "data:image/jpeg;base64,...",
  "config": {
    "category": "men",
    "resolution": "2K",
    "aspectRatio": "1:1",
    "pose": "standing",
    "modelEthnicity": "indian",
    "ecommerceMode": "amazon",
    "background": {
      "type": "studio",
      "option": "solid"
    },
    "colorFilter": "normal",
    "variantShot": "front",
    "watermark": true
  },
  "instruction": "Professional studio photography with soft lighting"
}`}</pre>
        <h3 style={{ fontSize: 14, marginTop: 16, marginBottom: 8, color: 'var(--color-text-muted)' }}>Response (202 Accepted)</h3>
        <pre style={codeStyle}>{`{
  "status": "queued",
  "job_id": "uuid-here",
  "pipelineStage": "intake",
  "credits_remaining": 49,
  "eta_seconds": 60,
  "check_status": "/status/uuid-here"
}`}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>GET /status/:job_id</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 12 }}>Poll for job status. Pipeline stages: intake → analysis → instruction → compilation → generation → completed.</p>
        <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--color-text-muted)' }}>Response (Completed)</h3>
        <pre style={codeStyle}>{`{
  "job_id": "uuid-here",
  "status": "completed",
  "pipelineStage": "completed",
  "url": "https://cloudinary.com/...",
  "metadata": {
    "width": 2048,
    "height": 2048,
    "durationMs": 45000,
    "kieJobId": "kie-job-uuid"
  },
  "dimensions": {
    "width": 2048,
    "height": 2048,
    "aspectRatio": "1:1",
    "resolution": "2K"
  }
}`}</pre>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Pipeline Architecture</h2>
        <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 2 }}>
          <div>1. <span className="badge badge-info">intake</span> — Config validation, credit deduction</div>
          <div>2. <span className="badge badge-info">analysis</span> — Gemini image analysis (always runs)</div>
          <div>3. <span className="badge badge-info">instruction</span> — Gemini instruction refinement (conditional)</div>
          <div>4. <span className="badge badge-info">compilation</span> — Master prompt assembly</div>
          <div>5. <span className="badge badge-info">generation</span> — KIE API image generation</div>
          <div>6. <span className="badge badge-success">completed</span> — Output stored on Cloudinary</div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Supported Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, color: 'var(--color-text-secondary)', fontSize: 14 }}>
          <div><strong>Categories:</strong> Men, Women, Kids, Footwear, Jewellery, Bags, Home Textiles</div>
          <div><strong>Resolutions:</strong> 2K (2048px), 4K (4096px)</div>
          <div><strong>Aspect Ratios:</strong> 1:1, 4:5, 3:4, 9:16, 16:9, Custom</div>
          <div><strong>Poses:</strong> Standing, Sitting, Walking, Over Neck, Aesthetic, Twirl, Closeup</div>
          <div><strong>Ethnicities:</strong> Indian, Headless, Ghost (3D), International, African, Asian</div>
          <div><strong>Ecommerce:</strong> Amazon, Flipkart, Myntra, Meesho (auto-compliance)</div>
          <div><strong>Backgrounds:</strong> Studio (solid/textured), AI Outdoor, AI Indoor</div>
          <div><strong>Filters:</strong> Normal, Black, Clarendon, Juno, Valencia, Tokyo, Sepia, Nordic</div>
        </div>
      </div>
    </div>
  );
}

const codeStyle = {
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  padding: 16,
  fontSize: 13,
  overflowX: 'auto',
  color: 'var(--color-text-primary)',
  lineHeight: 1.6,
};
