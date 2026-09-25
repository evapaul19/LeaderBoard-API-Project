// src/components/StatsCard.jsx
import React from 'react';
import './StatsCard.css';

/**
 * Reusable statistic card component.
 * Props:
 *   label – string label (e.g. "Total Employees")
 *   value – number or string to display
 *   icon – optional React element for an icon
 */
export default function StatsCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        {icon && <span className="stat-icon">{icon}</span>}
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
