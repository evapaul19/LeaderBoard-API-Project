import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { getActivities } from '../../api/api';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import { formatDateTime, formatPoints } from '../../utils/format';
import { uniqueActivities } from '../../utils/aggregateScores';

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getActivities()
      .then(setActivities)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => uniqueActivities(activities), [activities]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return activities.filter((item) => {
      const matchesQuery =
        !query ||
        item.employee_name.toLowerCase().includes(query) ||
        item.activity.toLowerCase().includes(query);
      const matchesType = !filter || item.activity === filter;
      return matchesQuery && matchesType;
    });
  }, [activities, search, filter]);

  return (
    <div className="admin-section activity-history-section">
      <div className="admin-header">
        <h2 className="admin-title">Activity history</h2>
        <p className="admin-desc">Every recorded achievement, in time order from the API.</p>
      </div>

      <div className="history-search-bar">
        <Search size={16} className="history-search-icon" />
        <input
          placeholder="Search by employee or activity..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search activity history"
        />
      </div>

      {types.length > 0 && (
        <div className="cr-filter-row">
          <button type="button" className={`cr-chip ${filter === null ? 'is-active' : ''}`} onClick={() => setFilter(null)}>
            All
          </button>
          {types.map((type) => (
            <button
              type="button"
              key={type}
              className={`cr-chip ${filter === type ? 'is-active' : ''}`}
              onClick={() => setFilter((current) => (current === type ? null : type))}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="center-loader"><Loader /></div>}
      {error && <EmptyState message={`Couldn't load history: ${error}`} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState message="No matching activity records." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="activity-history-feed">
          {filtered.map((item, index) => (
            <button
              type="button"
              key={item.score_id}
              className={`history-item stagger-${Math.min(index, 8)}`}
              onClick={() => setOpenId((current) => (current === item.score_id ? null : item.score_id))}
            >
              <span className="history-dot" />
              <span className="history-emp-name">{item.employee_name}</span>
              <span className="history-activity">
                {item.activity}
                {openId === item.score_id && (
                  <span className="timeline-date-small"> Recorded {formatDateTime(item.created_at)}</span>
                )}
              </span>
              <span className="history-pts">+{formatPoints(item.score)}</span>
              <span className="history-date">{formatDateTime(item.created_at)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
