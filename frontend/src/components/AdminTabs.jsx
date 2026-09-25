// src/components/AdminTabs.jsx
import React from 'react';
import './AdminTabs.css';

/**
 * Simple horizontal tab navigation for Admin panel.
 * Props:
 *   tabs: array of { id: string, label: string }
 *   activeTab: string (id)
 *   onChange: (id) => void
 */
export default function AdminTabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="admin-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
