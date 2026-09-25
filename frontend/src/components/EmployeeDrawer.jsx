import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getEmployeeScores } from '../api/api';
import Loader from './ui/Loader';
import EmptyState from './ui/EmptyState';
import ScoreComposition from './ScoreComposition';

export default function EmployeeDrawer({ employee, employeeId, isOpen, onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayEmployee, setDisplayEmployee] = useState(null);

  // Keep showing the last-loaded employee during the close animation,
  // instead of the content disappearing abruptly before the drawer slides out.
  useEffect(() => {
    if (employee) setDisplayEmployee(employee);
  }, [employee]);

  useEffect(() => {
    if (!isOpen || !employeeId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEmployeeScores(employeeId)
      .then((data) => {
        if (!cancelled) setScores(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [employeeId, isOpen]);

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        {displayEmployee && (
          <>
            <button className="drawer-close" onClick={onClose} aria-label="Close panel">
              <X size={20} />
            </button>

            <div className="drawer-header">
              <div className="drawer-name">{displayEmployee.name}</div>
              <div className="drawer-email">{displayEmployee.email}</div>
              <div className="drawer-total">{displayEmployee.cumulative_score.toLocaleString()}</div>
              <div className="drawer-total-label">Total Points</div>
            </div>

            <div className="drawer-body">
              {loading && (
                <div className="center-loader">
                  <Loader />
                </div>
              )}

              {error && <EmptyState message={`Couldn't load activity history: ${error}`} />}

              {!loading && !error && scores.length === 0 && (
                <EmptyState message="No activity recorded yet." />
              )}

              {!loading && !error && scores.length > 0 && (
                <>
                  <h3 className="drawer-section-title">Score Composition</h3>
                  <ScoreComposition scores={scores} />

                  <h3 className="drawer-section-title">Recent Achievements</h3>
                  <div className="drawer-history">
                    {scores.map((s) => (
                      <div key={s.score_id} className="drawer-history-row">
                        <span className="drawer-history-activity">{s.activity}</span>
                        <span className="drawer-history-meta">
                          {new Date(s.created_at).toLocaleDateString()} · +{s.score.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}