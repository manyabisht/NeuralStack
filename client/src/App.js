import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CodeReviewer from './components/CodeReviewer';
import DSAVisualizer from './components/DSAVisualizer';
import ComplexityAnalyzer from './components/ComplexityAnalyzer';
import FineTuningStudio from './components/FineTuningStudio';

const TABS = {
  reviewer:   { title: 'AI Code Reviewer',       sub: 'Powered by Claude · Real-time analysis' },
  dsa:        { title: 'DSA Visualizer',          sub: 'Interactive algorithm visualization' },
  complexity: { title: 'Complexity Analyzer',     sub: 'Big-O notation & performance analysis' },
  finetune:   { title: 'Model Fine-tuning Studio',sub: 'Generate training data with Claude' },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('reviewer');

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main">
        <Topbar
          title={TABS[activeTab].title}
          sub={TABS[activeTab].sub}
        />
        <div className="tab-content">
          {activeTab === 'reviewer'   && <CodeReviewer />}
          {activeTab === 'dsa'        && <DSAVisualizer />}
          {activeTab === 'complexity' && <ComplexityAnalyzer />}
          {activeTab === 'finetune'   && <FineTuningStudio />}
        </div>
      </div>
    </div>
  );
}
