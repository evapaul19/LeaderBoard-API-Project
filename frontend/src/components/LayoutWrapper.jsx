// src/components/LayoutWrapper.jsx
import React from 'react';
import './LayoutWrapper.css';

/**
 * LayoutWrapper provides a centered container with max width and responsive padding.
 * It ensures the application uses the full available width without large empty gaps.
 */
export default function LayoutWrapper({ children }) {
  return <div className="layout-wrapper">{children}</div>;
}
