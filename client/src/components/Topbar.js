import React from 'react';

export default function Topbar({ title, sub }) {
  return (
    <header className="topbar">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-sub">{sub}</div>
      </div>
      <div className="badges">
        <span className="badge badge-purple">MERN Stack</span>
        <span className="badge badge-teal">AI / ML</span>
        <span className="badge badge-red">DSA</span>
      </div>
    </header>
  );
}
