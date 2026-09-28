import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ACTIVITIES } from '../constants/activities';

export default function ScoringInfo({ isOpen, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    function onClick(e) { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" ref={panelRef}>
        <div className="modal-header">
          <span className="modal-title">How Scoring Works</span>
          <button className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="rules-list">
          {ACTIVITIES.map((a) => (
            <div key={a.name} className="rule-row">
              <span className="rule-activity">{a.name}</span>
              <span className="rule-points">+{a.points.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}