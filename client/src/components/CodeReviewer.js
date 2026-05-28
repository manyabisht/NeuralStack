import React, { useState } from 'react';
import { reviewCode } from '../api/claude';

const SAMPLE_CODE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;

const MODES = ['review', 'optimize', 'explain'];

export default function CodeReviewer() {
  const [code, setCode]         = useState(SAMPLE_CODE);
  const [lang, setLang]         = useState('javascript');
  const [mode, setMode]         = useState('review');
  const [loading, setLoading]   = useState(false);
  const [output, setOutput]     = useState('Click "Analyze" to get AI-powered code review, optimization suggestions, and detailed explanations from Claude.');
  const [stats, setStats]       = useState({ score: '--', complexity: '--', issues: '--' });
  const [timeline, setTimeline] = useState([]);
  const [error, setError]       = useState('');

  async function handleAnalyze() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const res = await reviewCode(code, lang, mode);
      setOutput(res);

      if (mode === 'review') {
        const scoreM  = res.match(/SCORE[:\s]+(\d+)/i);
        const cxM     = res.match(/COMPLEXITY[:\s]+(O\([^)]+\))/i);
        const issueM  = res.match(/ISSUES[:\s]+(\d+)/i);

        setStats({
          score:      scoreM  ? scoreM[1]  : '--',
          complexity: cxM     ? cxM[1]     : '--',
          issues:     issueM  ? issueM[1]  : '--',
        });

        const lines = res
          .split('\n')
          .filter(l => /^[-•*]/.test(l.trim()))
          .slice(0, 4)
          .map(l => l.replace(/^[-•*]\s*/, ''));
        setTimeline(lines);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const dotColors = ['var(--accent3)', '#ffa500', 'var(--accent)', 'var(--accent2)'];

  return (
    <>
      <div className="grid2">
        {/* ── Code Input ── */}
        <div className="panel glow">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon icon-purple">✦</div>
              Code Input
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
              </select>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={loading}
              >
                <span>⚡</span>
                {loading ? 'Analyzing…' : 'Analyze'}
              </button>
            </div>
          </div>
          <div className="panel-body">
            <textarea
              className="code-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="// Paste your code here…"
              spellCheck={false}
            />
          </div>
        </div>

        {/* ── AI Analysis ── */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-icon icon-teal">✦</div>
              AI Analysis
            </div>
            <div className="tabs">
              {MODES.map(m => (
                <div
                  key={m}
                  className={`tab${mode === m ? ' active' : ''}`}
                  onClick={() => setMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </div>
              ))}
            </div>
          </div>
          <div className="panel-body">
            {loading && (
              <div className="ai-thinking">
                <div className="spinner" />
                Claude is analyzing your code…
              </div>
            )}
            {error && (
              <div className="ai-response" style={{ color: 'var(--accent3)' }}>
                ⚠ {error}
              </div>
            )}
            {!loading && !error && (
              <div className="ai-response fade-in">{output}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid3">
        <div className="stat-card">
          <div className="stat-val">{stats.score}{stats.score !== '--' ? '/100' : ''}</div>
          <div className="stat-label">Code Quality Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ fontSize: stats.complexity !== '--' ? 18 : 26 }}>
            {stats.complexity}
          </div>
          <div className="stat-label">Time Complexity</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{stats.issues}</div>
          <div className="stat-label">Issues Found</div>
        </div>
      </div>

      {/* ── Improvement Timeline ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-icon icon-red">✦</div>
            Improvement Timeline
          </div>
        </div>
        <div className="panel-body">
          <div className="timeline">
            {timeline.length > 0
              ? timeline.map((item, i) => (
                  <div className="tl-item" key={i}>
                    <div className="tl-dot" style={{ background: dotColors[i % dotColors.length] }} />
                    <div className="tl-text">{item}</div>
                  </div>
                ))
              : (
                <div className="tl-item">
                  <div className="tl-dot" style={{ background: 'var(--muted)' }} />
                  <div className="tl-text">Submit code above to see improvement suggestions</div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
}
