import React, { useState, useRef, useCallback, useEffect } from 'react';
import { explainAlgorithm } from '../api/claude';

const ALGO_DETAILS = {
  bubble:    { best:'O(n)', avg:'O(n²)',      worst:'O(n²)',      space:'O(1)',      stable:'Yes', inplace:'Yes', cx:'cx-bad', cxLabel:'O(n²)' },
  insertion: { best:'O(n)', avg:'O(n²)',      worst:'O(n²)',      space:'O(1)',      stable:'Yes', inplace:'Yes', cx:'cx-bad', cxLabel:'O(n²)' },
  selection: { best:'O(n²)',avg:'O(n²)',      worst:'O(n²)',      space:'O(1)',      stable:'No',  inplace:'Yes', cx:'cx-bad', cxLabel:'O(n²)' },
  merge:     { best:'O(n log n)',avg:'O(n log n)',worst:'O(n log n)',space:'O(n)',   stable:'Yes', inplace:'No',  cx:'cx-ok',  cxLabel:'O(n log n)' },
  quick:     { best:'O(n log n)',avg:'O(n log n)',worst:'O(n²)',   space:'O(log n)', stable:'No',  inplace:'Yes', cx:'cx-ok',  cxLabel:'O(n log n)' },
};

function genArray(n = 22) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 130) + 10);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function DSAVisualizer() {
  const [arr, setArr]           = useState(genArray);
  const [algo, setAlgo]         = useState('bubble');
  const [speed, setSpeed]       = useState(300);
  const [sorting, setSorting]   = useState(false);
  const [comparing, setComparing]   = useState([]);
  const [sorted, setSorted]         = useState([]);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps]           = useState(0);
  const [accesses, setAccesses]     = useState(0);
  const [aiText, setAiText]         = useState('Select an algorithm and click "Get AI Explanation".');
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState('');

  // Use refs so sort coroutines always read latest speed
  const speedRef  = useRef(speed);
  const stopRef   = useRef(false);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const reset = useCallback((newAlgo) => {
    stopRef.current = true;
    setTimeout(() => {
      stopRef.current = false;
      const a = genArray();
      setArr(a);
      setComparing([]);
      setSorted([]);
      setComparisons(0);
      setSwaps(0);
      setAccesses(0);
      setSorting(false);
    }, 50);
  }, []);

  function handleAlgoChange(e) {
    setAlgo(e.target.value);
    reset();
  }

  // ── Sort dispatchers ───────────────────────────────────────────────────────
  async function startSort() {
    if (sorting) return;
    stopRef.current = false;
    setSorting(true);
    setComparisons(0); setSwaps(0); setAccesses(0);
    setSorted([]); setComparing([]);

    const a = [...arr];
    const ctx = { comparisons: 0, swaps: 0, accesses: 0 };

    const tick = async (comp, sw) => {
      if (stopRef.current) throw new Error('stopped');
      setComparing(comp);
      setArr([...a]);
      ctx.comparisons += (comp.length > 0 ? 1 : 0);
      ctx.swaps       += sw;
      ctx.accesses    += comp.length;
      setComparisons(ctx.comparisons);
      setSwaps(ctx.swaps);
      setAccesses(ctx.accesses);
      await sleep(speedRef.current);
    };

    try {
      if (algo === 'bubble')    await bubbleSort(a, tick);
      if (algo === 'insertion') await insertionSort(a, tick);
      if (algo === 'selection') await selectionSort(a, tick);
      if (algo === 'merge')     await mergeSort(a, 0, a.length - 1, tick);
      if (algo === 'quick')     await quickSort(a, 0, a.length - 1, tick);

      setArr([...a]);
      setComparing([]);
      setSorted([...Array(a.length).keys()]);
    } catch (_) {
      // stopped mid-sort — no-op
    } finally {
      setSorting(false);
    }
  }

  // ── Algorithm implementations ──────────────────────────────────────────────
  async function bubbleSort(a, tick) {
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        await tick([j, j + 1], 0);
        if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; await tick([j, j + 1], 1); }
      }
    }
  }

  async function insertionSort(a, tick) {
    for (let i = 1; i < a.length; i++) {
      let key = a[i], j = i - 1;
      while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j]; j--;
        await tick([j + 1, i], 1);
      }
      a[j + 1] = key;
    }
  }

  async function selectionSort(a, tick) {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) {
        await tick([j, min], 0);
        if (a[j] < a[min]) min = j;
      }
      if (min !== i) { [a[i], a[min]] = [a[min], a[i]]; await tick([i, min], 1); }
    }
  }

  async function mergeSort(a, l, r, tick) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    await mergeSort(a, l, m, tick);
    await mergeSort(a, m + 1, r, tick);
    const left = a.slice(l, m + 1), right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      await tick([k, l + i, m + 1 + j], 0);
      a[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    }
    while (i < left.length) { a[k++] = left[i++]; await tick([k - 1], 0); }
    while (j < right.length) { a[k++] = right[j++]; await tick([k - 1], 0); }
  }

  async function quickSort(a, lo, hi, tick) {
    if (lo >= hi) return;
    const pivot = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) {
      await tick([j, hi], 0);
      if (a[j] <= pivot) { [a[i], a[j]] = [a[j], a[i]]; await tick([i, j], 1); i++; }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    await quickSort(a, lo, i - 1, tick);
    await quickSort(a, i + 1, hi, tick);
  }

  // ── AI explanation ─────────────────────────────────────────────────────────
  async function handleExplain() {
    setAiLoading(true); setAiError(''); setAiText('');
    try {
      const text = await explainAlgorithm(algo + ' sort');
      setAiText(text);
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const d    = ALGO_DETAILS[algo];
  const maxV = Math.max(...arr, 1);
  const CANVAS_H = 160; // px

  return (
    <>
      {/* ── Visualizer panel ── */}
      <div className="panel glow">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-icon icon-purple">✦</div>
            Algorithm Visualizer
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={algo} onChange={handleAlgoChange} disabled={sorting}>
              <option value="bubble">Bubble Sort</option>
              <option value="insertion">Insertion Sort</option>
              <option value="selection">Selection Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="quick">Quick Sort</option>
            </select>
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} disabled={sorting}>
              <option value={600}>Slow</option>
              <option value={300}>Normal</option>
              <option value={80}>Fast</option>
              <option value={20}>Blazing</option>
            </select>
            <button className="btn btn-ghost" onClick={() => reset(algo)} disabled={sorting}>⟳ New</button>
            <button className="btn btn-primary" onClick={startSort} disabled={sorting}>
              {sorting ? <><div className="spinner" style={{ borderTopColor: '#fff' }} /> Sorting…</> : '▶ Visualize'}
            </button>
          </div>
        </div>

        <div className="panel-body">
          {/* Bars */}
          <div className="viz-canvas" style={{ height: CANVAS_H + 30 }}>
            {arr.map((v, i) => {
              let bg = '#2e2e42';
              if (sorted.includes(i))    bg = 'var(--accent2)';
              else if (comparing.includes(i)) bg = 'var(--accent)';
              return (
                <div
                  key={i}
                  className="bar"
                  style={{ height: Math.max(6, Math.round((v / maxV) * CANVAS_H)), background: bg }}
                >
                  {arr.length <= 28 && (
                    <span className="bar-val">{v}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <div className="metrics">
              <div className="metric">Comparisons: <strong>{comparisons}</strong></div>
              <div className="metric">Swaps: <strong>{swaps}</strong></div>
              <div className="metric">Array Accesses: <strong>{accesses}</strong></div>
            </div>
            <div className={`complexity ${d.cx}`}>{d.cxLabel}</div>
          </div>
        </div>
      </div>

      {/* ── Details + AI ── */}
      <div className="grid2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><div className="panel-icon icon-teal">✦</div>Algorithm Details</div>
          </div>
          <div className="panel-body">
            {[
              ['Best Case',      d.best,    d.best.includes('log') ? 'cx-ok' : (d.best === 'O(n)' ? 'cx-good' : 'cx-bad')],
              ['Average Case',   d.avg,     d.cx],
              ['Worst Case',     d.worst,   d.worst.includes('²') ? 'cx-bad' : 'cx-ok'],
              ['Space Complexity', d.space, d.space === 'O(1)' ? 'cx-good' : 'cx-ok'],
            ].map(([label, val, cls]) => (
              <div className="compare-row" key={label}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span className={`complexity ${cls}`}>{val}</span>
              </div>
            ))}
            <div className="compare-row">
              <span style={{ color: 'var(--muted)' }}>Stable</span>
              <span style={{ color: d.stable === 'Yes' ? 'var(--accent2)' : 'var(--accent3)', fontWeight: 600, fontSize: 13 }}>{d.stable}</span>
            </div>
            <div className="compare-row">
              <span style={{ color: 'var(--muted)' }}>In-Place</span>
              <span style={{ color: d.inplace === 'Yes' ? 'var(--accent2)' : 'var(--accent3)', fontWeight: 600, fontSize: 13 }}>{d.inplace}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><div className="panel-icon icon-red">✦</div>AI Explanation</div>
          </div>
          <div className="panel-body">
            {aiLoading && <div className="ai-thinking"><div className="spinner" />Asking Claude…</div>}
            {aiError   && <div className="ai-response" style={{ color: 'var(--accent3)' }}>⚠ {aiError}</div>}
            {!aiLoading && !aiError && (
              <div className="ai-response fade-in" style={{ minHeight: 80, fontSize: 12 }}>{aiText}</div>
            )}
            <button className="btn btn-teal" style={{ marginTop: 12, fontSize: 12 }} onClick={handleExplain} disabled={aiLoading}>
              ✦ Get AI Explanation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
