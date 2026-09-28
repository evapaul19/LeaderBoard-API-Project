import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-premium ${type}`} role="status">
      <span className={`toast-dot ${type}`} />
      <span className="toast-msg">{message}</span>
      <button className="toast-close-btn" onClick={onClose} aria-label="Dismiss notification">
        <X size={14} />
      </button>
    </div>
  );
}
