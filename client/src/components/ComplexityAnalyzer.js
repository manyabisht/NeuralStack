import React, { useState } from 'react';
import { analyzeComplexity } from '../api/claude';

const SAMPLE = `// Example: Binary Search
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`;

const EXAMPLES = [
  {
    label: 'Binary Search — O(log n)',
    code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
  },
  {
    label: 'Bubble Sort — O(n²)',
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length - i - 1; j++)
      if (arr[j] > arr[j+1])
        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
  return arr;
}`,
  },
  {
    label: 'Matrix Multiply — O(n³)',
    code: `function matMul(A, B, n) {
  const C = Array.from({length:n}, ()=>Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      for (let k = 0; k < n; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}`,
  },
  {
    label: 'Fibonacci DP — O(n)',
    code: `function fib(n) {
  const dp = [0, 1];
  for (let i = 2; i <= n; i++)
    dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}`,
  },
];

// Parse Claude's structured output into structured fields
function parseComplexityOutput(text) {
  const fields = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) fields[key.trim().toUpperCase()] = rest.join(':').trim();
  }
  return fields;
}

function complexityClass(o) {
  if (!o) return 'cx-ok';
  if (o.includes('log n') && !o.includes('n²')) return 'cx-good';
  if (o === 'O(1)' || o === 'O(n)') return 'cx-good';
  if (o.includes('²') || o.includes('³')) return 'cx-bad';
  return 'cx-ok';
}

export default function ComplexityAnalyzer() {
  const [code, setCode]       = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [raw, setRaw]         = useState('');
  const [parsed, setParsed]   = useState(null);
  const [error, setError]     = useState('');

  async function handleScan() {
    if (!code.trim()) return;
    setLoading(true); setError(''); setRaw(''); setParsed(null);
    try {
      const text = await analyzeComplexity(code);
      setRaw(text);
      setParsed(parseComplexityOutput(text));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function loadExample(ex) {
    setCode(ex.code);
    setRaw(''); setParsed(null); setError('');
  }

  return (
    <>
      {/* ── Example presets ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            className="btn btn-ghost"
            style={{ fontSize: 11 }}
            onClick={() => loadExample(ex)}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid2">
        {/* ── Code Input ── */}
        <div className="panel glow">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon icon-purple">✦</div>
              Code Complexity Scanner
            </div>
            <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
              {loading ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Scanning…</> : '⚡ Scan'}
            </button>
          </div>
          <div className="panel-body">
            <textarea
              className="code-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={{ minHeight: 260 }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* ── Complexity Report ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon icon-teal">✦</div>
              Complexity Report
            </div>
          </div>
          <div className="panel-body">
            {loading && (
              <div className="ai-thinking"><div className="spinner" />Computing complexity…</div>
            )}
            {error && (
              <div className="ai-response" style={{ color: 'var(--accent3)' }}>⚠ {error}</div>
            )}

            {!loading && !error && parsed && (
              <div className="fade-in">
                {/* Quick-glance cards */}
                <div className="grid2" style={{ marginBottom: 16, gap: 10 }}>
                  <div className="stat-card" style={{ padding: 14 }}>
                    <div className={`complexity ${complexityClass(parsed['TIME'])}`} style={{ fontSize: 16, justifyContent: 'center' }}>
                      {parsed['TIME'] || '—'}
                    </div>
                    <div className="stat-label" style={{ marginTop: 6 }}>Time Complexity</div>
                  </div>
                  <div className="stat-card" style={{ padding: 14 }}>
                    <div className={`complexity ${complexityClass(parsed['SPACE'])}`} style={{ fontSize: 16, justifyContent: 'center' }}>
                      {parsed['SPACE'] || '—'}
                    </div>
                    <div className="stat-label" style={{ marginTop: 6 }}>Space Complexity</div>
                  </div>
                </div>

                {parsed['LOOP DEPTH'] && (
                  <div className="compare-row">
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>Loop Depth</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                      {parsed['LOOP DEPTH']}
                    </span>
                  </div>
                )}

                {parsed['EXPLANATION'] && (
                  <div style={{ margin: '14px 0 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Explanation</div>
                    <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.7 }}>{parsed['EXPLANATION']}</div>
                  </div>
                )}

                {parsed['OPTIMIZATION'] && (
                  <div style={{ background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 700, marginBottom: 4 }}>💡 Optimization Tip</div>
                    <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{parsed['OPTIMIZATION']}</div>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && !parsed && (
              <div className="ai-response" style={{ minHeight: 260, fontSize: 12 }}>
                Paste code and click Scan to analyze time &amp; space complexity with Big-O notation.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Raw output collapsible ── */}
      {raw && (
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon icon-red">✦</div>
              Raw Claude Output
            </div>
          </div>
          <div className="panel-body">
            <div className="ai-response fade-in" style={{ fontSize: 12 }}>{raw}</div>
          </div>
        </div>
      )}
    </>
  );
}
