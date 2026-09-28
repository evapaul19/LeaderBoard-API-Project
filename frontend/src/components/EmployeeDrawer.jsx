import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getEmployeeScores } from '../api/api';
import Loader from './ui/Loader';
import EmptyState from './ui/EmptyState';
import ScoreComposition from './ScoreComposition';
import Avatar from './ui/Avatar';
import { formatDate, formatPoints } from '../utils/format';

export default function EmployeeDrawer({ employee, employeeId, isOpen, onClose }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayEmployee, setDisplayEmployee] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (employee) setDisplayEmployee(employee);
  }, [employee]);

  useEffect(() => {
    if (!isOpen || !employeeId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getEmployeeScores(employeeId)
      .then((data) => {
        if (!cancelled) setScores(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const totalScore =
    displayEmployee?.cumulative_score ??
    scores.reduce((sum, item) => sum + Number(item.score || 0), 0);

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        {displayEmployee && (
          <>
            <div className="drawer-header-premium">
              <span className="drawer-rank-badge">
                {displayEmployee.rank ? `Rank ${displayEmployee.rank}` : 'Employee profile'}
              </span>
              <button className="drawer-close-btn" onClick={onClose} aria-label="Close employee panel">
                <X size={16} />
              </button>
            </div>

            <div className="drawer-profile-premium">
              <Avatar name={displayEmployee.name} size="lg" highlighted />
              <div className="drawer-name-premium">{displayEmployee.name}</div>
              <div className="drawer-email-premium">{displayEmployee.email}</div>
              <div className="drawer-score-premium">
                <div className="drawer-score-num">{formatPoints(totalScore)}</div>
                <div className="drawer-score-tag">Total points</div>
              </div>
            </div>

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
                <section className="drawer-section-block">
                  <div className="drawer-section-label">Score composition</div>
                  <ScoreComposition scores={scores} />
                </section>
                <section className="drawer-section-block">
                  <div className="drawer-section-label">Achievement timeline</div>
                  {scores.map((score) => (
                    <button
                      type="button"
                      key={score.score_id}
                      className="timeline-item"
                      onClick={() => setOpenId((current) => (current === score.score_id ? null : score.score_id))}
                    >
                      <span className="timeline-icon-dot" />
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        <span className="timeline-activity-name">{score.activity}</span>
                        <div className="timeline-date-small">{formatDate(score.created_at)}</div>
                        {openId === score.score_id && (
                          <div className="timeline-date-small">
                            Recorded event · +{formatPoints(score.score)} points
                          </div>
                        )}
                      </span>
                      <span className="timeline-pts">+{formatPoints(score.score)}</span>
                    </button>
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </aside>
    </>
  );
}
