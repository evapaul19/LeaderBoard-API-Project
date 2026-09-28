import { formatDate, formatPoints } from '../utils/format';
import EmptyState from './ui/EmptyState';

export default function RecentActivity({ activities = [] }) {
  const latest = activities.slice(0, 8);

  return (
    <section className="activity-history-section" id="activity">
      <div className="section-heading">
        <h2 className="section-title">Recent recognition</h2>
      </div>
      {latest.length === 0 ? (
        <EmptyState message="No achievements have been recorded yet." />
      ) : (
        <div className="activity-history-feed">
          {latest.map((item, index) => (
            <div key={item.score_id} className={`history-item stagger-${Math.min(index, 8)}`}>
              <span className="history-dot" />
              <span className="history-emp-name">{item.employee_name}</span>
              <span className="history-activity">{item.activity}</span>
              <span className="history-pts">+{formatPoints(item.score)}</span>
              <span className="history-date">{formatDate(item.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
