import React from 'react';

const NAV_ITEMS = [
  { id: 'reviewer',   label: 'AI Code Reviewer' },
  { id: 'dsa',        label: 'DSA Visualizer' },
  { id: 'complexity', label: 'Complexity Analyzer' },
  { id: 'finetune',   label: 'Model Fine-tuning' },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-badge">NeuralStack</div>
        <div className="logo-sub">AI Engineer Toolkit</div>
      </div>

      <nav>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <div className="nav-dot" />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        Claude API Connected
        <br />
        <span style={{ fontSize: '10px', marginTop: 4, display: 'block' }}>
          Full-Stack AI Intern Demo
        </span>
      </div>
    </aside>
  );
}
