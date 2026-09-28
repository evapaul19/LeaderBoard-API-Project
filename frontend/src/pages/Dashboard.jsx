import { useEffect, useState } from 'react';
import { Frown } from 'lucide-react';
import { getActivities, getLeaderboard, getStats } from '../api/api';
import Hero from '../components/Hero';
import StatsBar from '../components/StatsBar';
import Podium from '../components/Podium';
import LeaderboardTable from '../components/LeaderboardTable';
import EmployeeDrawer from '../components/EmployeeDrawer';
import ContributionConstellation from '../components/ContributionConstellation';
import RecentActivity from '../components/RecentActivity';
import EmptyState from '../components/ui/EmptyState';
import { DashboardSkeleton } from '../components/ui/Skeleton';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, lbData, activityData] = await Promise.all([
          getStats(),
          getLeaderboard(),
          getActivities(),
        ]);
        setStats(statsData);
        setLeaderboard(lbData);
        setActivities(Array.isArray(activityData) ? activityData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const selectedEmployee = leaderboard.find((entry) => entry.employee_id === selectedId) || null;

  function jumpTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="dashboard-container cr-arena">
      <Hero employeeCount={stats?.total_employees || leaderboard.length} onExplore={() => jumpTo('podium')} />

      {loading && <DashboardSkeleton />}
      {error && <EmptyState icon={Frown} message={`Couldn't load the dashboard: ${error}`} />}

      {!loading && !error && (
        <>
          <StatsBar stats={stats} onJump={jumpTo} />
          {leaderboard.length === 0 ? (
            <EmptyState message="No employees yet — approve an access request to get started." />
          ) : (
            <>
              <Podium entries={leaderboard} onSelectEmployee={setSelectedId} />
              <ContributionConstellation
                entries={leaderboard}
                activities={activities}
                onSelectEmployee={setSelectedId}
              />
              <LeaderboardTable entries={leaderboard} onSelectEmployee={setSelectedId} />
              <RecentActivity activities={activities} />
            </>
          )}
        </>
      )}

      <EmployeeDrawer
        employee={selectedEmployee}
        employeeId={selectedId}
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
