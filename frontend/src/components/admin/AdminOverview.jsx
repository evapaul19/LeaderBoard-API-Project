import { useEffect, useState } from 'react';
import { ChevronRight, UserCheck, Trophy } from 'lucide-react';
import { getAccessRequests, getActivities, getStats } from '../../api/api';
import StatsBar from '../StatsBar';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import { formatDate, formatPoints } from '../../utils/format';

export default function AdminOverview({ onNavigate, pendingCount = 0 }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, activityData] = await Promise.all([getStats(), getActivities()]);
        setStats(statsData);
        setRecent(Array.isArray(activityData) ? activityData.slice(0, 8) : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="admin-overview">
      <div className="admin-header">
        <h2 className="admin-title">Overview</h2>
        <p className="admin-desc">Operations snapshot from live employee, score, and access-request data.</p>
      </div>

      <div className="admin-quick-grid">
        <button type="button" className="admin-quick-card" onClick={() => onNavigate('access-requests')}>
          <div className="admin-quick-icon"><UserCheck size={20} color="var(--accent)" /></div>
          <div className="admin-quick-info">
            <div className="admin-quick-title">Access requests</div>
            <div className="admin-quick-desc">
              {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
            </div>
          </div>
          <ChevronRight size={18} className="admin-quick-arrow" />
        </button>
        <button type="button" className="admin-quick-card" onClick={() => onNavigate('record-achievement')}>
          <div className="admin-quick-icon"><Trophy size={20} color="var(--accent)" /></div>
          <div className="admin-quick-info">
            <div className="admin-quick-title">Record achievement</div>
            <div className="admin-quick-desc">Award points to an employee</div>
          </div>
          <ChevronRight size={18} className="admin-quick-arrow" />
        </button>
      </div>

      {loading && <div className="center-loader"><Loader /></div>}
      {error && <EmptyState message={`Couldn't load overview: ${error}`} />}
      {!loading && !error && <StatsBar stats={stats} onJump={(id) => onNavigate(id === 'activity' ? 'activity-history' : 'employees')} />}

      {!loading && !error && (
        <div className="admin-recent-activity" style={{ marginTop: 32 }}>
          <h3 className="drawer-section-title">Recent activity</h3>
          {recent.length === 0 ? (
            <EmptyState message="No activity recorded yet." />
          ) : (
            <div className="admin-feed">
              {recent.map((item) => (
                <div key={item.score_id} className="admin-feed-item">
                  <span className="admin-feed-dot" />
                  <span className="admin-feed-name">{item.employee_name}</span>
                  <span className="admin-feed-activity">{item.activity}</span>
                  <span className="admin-feed-pts">+{formatPoints(item.score)}</span>
                  <span className="admin-feed-date">{formatDate(item.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
