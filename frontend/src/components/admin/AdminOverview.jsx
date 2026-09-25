import { useEffect, useState } from 'react';
import { UserCheck, Trophy } from 'lucide-react';
import { getStats, getActivities } from '../../api/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';

export default function AdminOverview({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, activitiesData] = await Promise.all([
          getStats(),
          getActivities(),
        ]);

        setStats(statsData);
        setRecentActivity(activitiesData.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="admin-overview">
      <div className="admin-overview-header">
        <h2>Overview</h2>
        <p>
          Manage employees and record achievements across the organization.
        </p>
      </div>

      <div className="admin-quick-actions">
        <Card className="admin-quick-action">
          <UserCheck size={20} color="var(--accent)" />

          <div>
            <div className="admin-quick-action-title">
              Access Requests
            </div>

            <div className="admin-quick-action-desc">
              Review pending sign-ups
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => onNavigate('access-requests')}
          >
            Review
          </Button>
        </Card>

        <Card className="admin-quick-action">
          <Trophy size={20} color="var(--accent)" />

          <div>
            <div className="admin-quick-action-title">
              Record Achievement
            </div>

            <div className="admin-quick-action-desc">
              Log an activity for an employee
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => onNavigate('record-achievement')}
          >
            Record Achievement
          </Button>
        </Card>
      </div>

      {loading && (
        <div className="center-loader">
          <Loader />
        </div>
      )}

      {error && (
        <EmptyState
          message={`Couldn't load overview data: ${error}`}
        />
      )}

      {!loading && !error && stats && (
        <div className="admin-stats-row">
          <div className="admin-stat">
            <div className="admin-stat-value">
              {stats.total_employees}
            </div>
            <div className="admin-stat-label">
              Employees
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-stat-value">
              {stats.total_points_awarded.toLocaleString()}
            </div>
            <div className="admin-stat-label">
              Points Awarded
            </div>
          </div>

          <div className="admin-stat">
            <div className="admin-stat-value">
              {stats.total_activities_completed}
            </div>
            <div className="admin-stat-label">
              Activities
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="admin-recent-activity">
          <h3 className="drawer-section-title">
            Recent Activity
          </h3>

          {recentActivity.length === 0 ? (
            <EmptyState message="No activity recorded yet." />
          ) : (
            <div className="admin-activity-list">
              {recentActivity.map((activity) => (
                <div
                  key={activity.score_id}
                  className="admin-activity-row"
                >
                  <span className="admin-activity-name">
                    {activity.employee_name}
                  </span>

                  <span className="admin-activity-detail">
                    {activity.activity}
                  </span>

                  <span className="admin-activity-score">
                    +{activity.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}