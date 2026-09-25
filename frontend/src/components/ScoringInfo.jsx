import { useEffect, useRef, useState } from 'react';
import { Info, X } from 'lucide-react';
import { ACTIVITIES } from '../constants/activities';

export default function ScoringInfo() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="scoring-info">
      <button
        className="scoring-info-trigger"
        onClick={() => setOpen(true)}
      >
        <Info size={14} />
        How scoring works
      </button>

      {open && (
        <div className="scoring-info-overlay">
          <div className="scoring-info-panel" ref={panelRef}>
            <button
              className="drawer-close scoring-info-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h3>How Scoring Works</h3>

            <div className="scoring-info-list">
              {ACTIVITIES.map((activity) => (
                <div
                  key={activity.name}
                  className="scoring-info-row"
                >
                  <span>{activity.name}</span>
                  <span className="scoring-info-points">
                    {activity.points.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}