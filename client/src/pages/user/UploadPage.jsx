import React, { useState, useRef } from 'react';

const CATEGORIES = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids_boys', label: 'Kids — Boys' },
  { value: 'kids_girls', label: 'Kids — Girls' },
  { value: 'footwear_men', label: 'Footwear (Men)' },
  { value: 'footwear_women', label: 'Footwear (Women)' },
  { value: 'jewellery', label: 'Jewellery' },
  { value: 'bags', label: 'Bags' },
  { value: 'towel', label: 'Towels' },
  { value: 'bedsheet', label: 'Bedsheets' },
  { value: 'curtains', label: 'Curtains' },
  { value: 'duvets', label: 'Duvets' },
];

const POSES = ['standing', 'sitting', 'walking', 'over_neck', 'aesthetic', 'twirl', 'closeup'];
const ETHNICITIES = ['indian', 'headless', 'ghost_model_3d', 'international', 'african', 'asian'];
const ECOMM_MODES = ['amazon', 'flipkart', 'myntra', 'meesho'];
const ASPECTS = ['1:1', '4:5', '3:4', '9:16', '16:9'];
const BACKGROUNDS = [
  { type: 'studio', option: 'solid' },
  { type: 'studio', option: 'textured' },
  { type: 'ai_outdoor', option: null },
  { type: 'ai_indoor', option: null },
];
const FILTERS = ['normal', 'black', 'clarendon', 'juno', 'valencia', 'tokyo', 'sepia', 'nordic'];
const FRAMES = ['front_back_same', 'bubble_closeup_2', 'bubble_closeup_3', 'collage_3', 'border_style_1', 'border_style_2', 'border_style_3'];
const THEMES = ['diwali', 'holi', 'eid', 'christmas', 'navratri', 'ganesh_chaturthi', 'independence_day', 'republic_day', 'onam', 'pongal'];

const PIPELINE = ['intake', 'analysis', 'instruction', 'compilation', 'generation', 'completed'];

export default function UploadPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageB64, setImageB64] = useState('');
  const fileRef = useRef(null);

  // Config state
  const [category, setCategory] = useState('men');
  const [resolution, setResolution] = useState('2K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [pose, setPose] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [ecommerce, setEcommerce] = useState('');
  const [background, setBackground] = useState('');
  const [colorFilter, setColorFilter] = useState('normal');
  const [frameType, setFrameType] = useState('');
  const [festivalTheme, setFestival] = useState('');
  const [variantShot, setVariant] = useState('front');
  const [instruction, setInstruction] = useState('');
  const [watermark, setWatermark] = useState(true);

  // Job state
  const [status, setStatus] = useState(null);
  const [stage, setStage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImageB64(reader.result); setImagePreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageB64) return;

    setLoading(true);
    setError('');
    setResult(null);
    setStage('intake');
    setStatus('Submitting job...');

    try {
      const config = {
        category, resolution, aspectRatio,
        ...(pose && { pose }),
        ...(ethnicity && { modelEthnicity: ethnicity }),
        ...(ecommerce && { ecommerceMode: ecommerce }),
        ...(background && { background: JSON.parse(background) }),
        colorFilter,
        ...(frameType && { frameType }),
        ...(festivalTheme && { festivalTheme }),
        variantShot,
        watermark,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}`,
        },
        body: JSON.stringify({ image_b64: imageB64, config, instruction: instruction || undefined }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setStatus(`Job ${data.job_id} queued`);
      setStage('intake');

      // Poll
      const jobId = data.job_id;
      let poll;
      do {
        await sleep(3000);
        const pollRes = await fetch(`/api/status/${jobId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('ds_api_key') || ''}` },
        });
        poll = await pollRes.json();
        setStage(poll.pipelineStage || poll.status);
        setStatus(`Pipeline: ${poll.pipelineStage || poll.status}`);
      } while (poll.status !== 'completed' && poll.status !== 'failed' && poll.pipelineStage !== 'completed' && poll.pipelineStage !== 'failed');

      if (poll.pipelineStage === 'completed' || poll.status === 'completed') {
        setResult(poll);
        setStatus('Generation complete!');
      } else {
        throw new Error(poll.error || 'Generation failed');
      }
    } catch (err) {
      setError(err.message);
      setStatus(null);
      setStage('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">AI Photoshoot</h1>
      <p className="page-desc">Upload a product image and configure your photoshoot settings. The KIE pipeline handles the rest.</p>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          {/* ── LEFT: Image Upload ──────────────────── */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">📷 Product Image</div>
              <div
                className={`upload-zone ${imagePreview ? 'has-image' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                ) : (
                  <>
                    <div className="upload-icon">📸</div>
                    <div className="upload-text">Click to upload product image</div>
                    <div className="upload-hint">JPEG, PNG, WebP — max 50 MB</div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
              </div>
            </div>

            {/* Pipeline Progress */}
            {stage && (
              <div className="card">
                <div className="card-title">⚡ Pipeline Progress</div>
                <div className="pipeline-track">
                  {PIPELINE.map((s, i) => {
                    const stageIdx = PIPELINE.indexOf(stage);
                    const isDone = stageIdx >= 0 ? i < stageIdx : false;
                    const isActive = s === stage && stage !== 'completed' && stage !== 'failed';
                    const isFinal = s === 'completed' && (stage === 'completed');
                    return (
                      <React.Fragment key={s}>
                        <div className="pipeline-step" style={{ flexDirection: 'column', flex: 'none' }}>
                          <div className={`pipeline-dot ${isDone || isFinal ? 'done' : ''} ${isActive ? 'active' : ''} ${stage === 'failed' && i === stageIdx ? 'failed' : ''}`}>
                            {isDone || isFinal ? '✓' : i + 1}
                          </div>
                          <div className="pipeline-label">{s}</div>
                        </div>
                        {i < PIPELINE.length - 1 && <div className={`pipeline-line ${isDone ? 'done' : ''}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
                {status && <p style={{ fontSize: 13, color: 'var(--accent)', marginTop: 12 }}>{status}</p>}
                {error && <p style={{ fontSize: 13, color: 'var(--danger)', marginTop: 8 }}>{error}</p>}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="card" style={{ marginTop: 20 }}>
                <div className="card-title">🖼️ Generated Output</div>
                {result.url && <img src={result.url} alt="Result" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }} />}
                {result.metadata && (
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {result.metadata.width}×{result.metadata.height} · {result.metadata.durationMs}ms
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Configuration ────────────────── */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">⚙️ Configuration</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <FormSelect label="Category" value={category} onChange={setCategory} options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} />
                <div className="grid-2" style={{ gap: 14 }}>
                  <FormSelect label="Resolution" value={resolution} onChange={setResolution} options={[{ value: '2K', label: '2K (2048px)' }, { value: '4K', label: '4K (4096px)' }]} />
                  <FormSelect label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={ASPECTS.map((a) => ({ value: a, label: a }))} />
                </div>
                <div className="grid-2" style={{ gap: 14 }}>
                  <FormSelect label="Pose" value={pose} onChange={setPose} options={[{ value: '', label: '— None —' }, ...POSES.map((p) => ({ value: p, label: p.replace(/_/g, ' ') }))]} />
                  <FormSelect label="Model Ethnicity" value={ethnicity} onChange={setEthnicity} options={[{ value: '', label: '— None —' }, ...ETHNICITIES.map((e) => ({ value: e, label: e.replace(/_/g, ' ') }))]} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">🎨 Visual Settings</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <FormSelect label="Background" value={background} onChange={setBackground} options={[{ value: '', label: '— Default —' }, ...BACKGROUNDS.map((b) => ({ value: JSON.stringify(b), label: `${b.type} ${b.option ? `(${b.option})` : ''}` }))]} />
                <FormSelect label="Color Filter" value={colorFilter} onChange={setColorFilter} options={FILTERS.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))} />
                <div className="grid-2" style={{ gap: 14 }}>
                  <FormSelect label="Frame Type" value={frameType} onChange={setFrameType} options={[{ value: '', label: '— None —' }, ...FRAMES.map((f) => ({ value: f, label: f.replace(/_/g, ' ') }))]} />
                  <FormSelect label="Festival Theme" value={festivalTheme} onChange={setFestival} options={[{ value: '', label: '— None —' }, ...THEMES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ') }))]} />
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">🏬 Ecommerce & Variants</div>
              <div style={{ display: 'grid', gap: 14 }}>
                <FormSelect label="Ecommerce Mode" value={ecommerce} onChange={setEcommerce} options={[{ value: '', label: '— None —' }, ...ECOMM_MODES.map((m) => ({ value: m, label: m.charAt(0).toUpperCase() + m.slice(1) }))]} />
                <FormSelect label="Variant Shot" value={variantShot} onChange={setVariant} options={[{ value: 'front', label: 'Front' }, { value: 'back', label: 'Back' }, { value: 'side', label: 'Side' }, { value: 'detail', label: 'Detail' }]} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} id="wm" style={{ width: 18, height: 18 }} />
                  <label htmlFor="wm" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Apply Dhandha Studio watermark</label>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">💬 Custom Instruction</div>
              <textarea
                className="form-textarea"
                rows={4}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Optional: Describe your desired photoshoot style, lighting, mood..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading || !imageB64} style={{ width: '100%', padding: '14px 24px', fontSize: 16 }}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating...</>
              ) : (
                <>📸 Generate Photoshoot</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
