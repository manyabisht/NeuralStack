import React, { useState } from 'react';
import { generateFineTuneData } from '../api/claude';

const DOMAIN_PRESETS = [
  'Customer support chatbot for e-commerce',
  'Medical symptom triage assistant',
  'Code debugging helper',
  'Legal document summarizer',
  'SQL query generator',
  'Interview question coach',
];

const FORMAT_INFO = {
  jsonl: {
    label: 'JSONL — OpenAI / Anthropic',
    description: 'Standard chat format used by OpenAI fine-tuning and Anthropic. Each line is a JSON object with a "messages" array.',
    example: '{"messages":[{"role":"system","content":"…"},{"role":"user","content":"…"},{"role":"assistant","content":"…"}]}',
  },
  alpaca: {
    label: 'Alpaca Format',
    description: 'Used by LLaMA-based models. Simple instruction/input/output triplets.',
    example: '{"instruction":"…","input":"…","output":"…"}',
  },
  sharegpt: {
    label: 'ShareGPT Format',
    description: 'Used by Vicuna, FastChat, and many open-source models.',
    example: '{"conversations":[{"from":"human","value":"…"},{"from":"gpt","value":"…"}]}',
  },
};

export default function FineTuningStudio() {
  const [domain, setDomain]     = useState('Customer support chatbot for e-commerce');
  const [count, setCount]       = useState('5');
  const [format, setFormat]     = useState('jsonl');
  const [loading, setLoading]   = useState(false);
  const [output, setOutput]     = useState('');
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);

  async function handleGenerate() {
    if (!domain.trim()) return;
    setLoading(true); setError(''); setOutput('');
    try {
      const text = await generateFineTuneData(domain, count, format);
      setOutput(text);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!output) return;
    const ext   = format === 'jsonl' ? 'jsonl' : 'json';
    const blob  = new Blob([output], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `training_data_${domain.slice(0, 20).replace(/\s/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lineCount = output ? output.split('\n').filter(l => l.trim()).length : 0;

  return (
    <div className="grid2">
      {/* ── Config Panel ── */}
      <div className="panel glow">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-icon icon-purple">✦</div>
            Training Data Builder
          </div>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Generating…</>
              : '⚡ Generate'}
          </button>
        </div>
        <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Domain */}
          <div>
            <label className="form-label">Domain / Use Case</label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              style={{ width: '100%' }}
              placeholder="Describe your model's purpose…"
            />
          </div>

          {/* Domain presets */}
          <div>
            <label className="form-label">Quick Presets</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DOMAIN_PRESETS.map(p => (
                <button
                  key={p}
                  className="btn btn-ghost"
                  style={{ fontSize: 10, padding: '4px 8px' }}
                  onClick={() => setDomain(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="form-label">Number of Examples</label>
            <select value={count} onChange={e => setCount(e.target.value)} style={{ width: '100%' }}>
              <option value="3">3 examples (quick test)</option>
              <option value="5">5 examples</option>
              <option value="8">8 examples</option>
              <option value="10">10 examples</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="form-label">Output Format</label>
            <select value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%' }}>
              {Object.entries(FORMAT_INFO).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Format info card */}
          {FORMAT_INFO[format] && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>
                {FORMAT_INFO[format].label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 }}>
                {FORMAT_INFO[format].description}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#888', background: 'var(--bg4)', padding: '6px 10px', borderRadius: 5, wordBreak: 'break-all' }}>
                {FORMAT_INFO[format].example}
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, marginBottom: 6 }}>Fine-tuning Tips</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.8 }}>
              • Use 50–1000 high-quality examples<br />
              • Balance positive/negative cases<br />
              • Include edge cases &amp; corner cases<br />
              • Keep instruction format consistent
            </div>
          </div>
        </div>
      </div>

      {/* ── Output Panel ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-icon icon-teal">✦</div>
            Generated Training Data
            {lineCount > 0 && (
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
                {lineCount} example{lineCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {output && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={handleCopy}>
                {copied ? '✓ Copied!' : '⎘ Copy'}
              </button>
              <button className="btn btn-teal" style={{ fontSize: 11 }} onClick={handleDownload}>
                ↓ Download
              </button>
            </div>
          )}
        </div>
        <div className="panel-body">
          {loading && (
            <div className="ai-thinking"><div className="spinner" />Generating training data with Claude…</div>
          )}
          {error && (
            <div className="ai-response" style={{ color: 'var(--accent3)' }}>⚠ {error}</div>
          )}
          {!loading && !error && output && (
            <div className="ai-response fade-in" style={{ minHeight: 380, fontSize: 11 }}>{output}</div>
          )}
          {!loading && !error && !output && (
            <div className="ai-response" style={{ minHeight: 380, fontSize: 12 }}>
              Configure parameters and click Generate to create fine-tuning training data for your model.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
