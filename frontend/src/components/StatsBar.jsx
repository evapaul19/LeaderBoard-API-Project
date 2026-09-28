import { Activity, Star, Users } from 'lucide-react';
import useCountUp from '../hooks/useCountUp';
import { formatPoints } from '../utils/format';

function StatCard({ label, value, meta, accent, onClick, icon: Icon }) {
  const count = useCountUp(value);

  return (
    <button type="button" className={`stat-card-enhanced ${accent ? 'accent-card' : ''}`} onClick={onClick}>
      <div className="stat-icon-wrap">
        <span className="stat-label-mono">{label}</span>
        <Icon size={16} className="stat-icon" />
      </div>
      <div className={`stat-value-xl ${accent ? 'accent' : ''}`}>
        {label === 'Points awarded' ? formatPoints(count) : count}
      </div>
      {meta && <div className="stat-meta-row">{meta}</div>}
    </button>
  );
}

export default function StatsBar({ stats, onJump }) {
  if (!stats) return null;

  return (
    <div className="stats-bar-grid">
      <StatCard
        label="Employees"
        value={stats.total_employees}
        meta="On the leaderboard"
        icon={Users}
        onClick={() => onJump?.('leaderboard')}
      />
      <StatCard
        label="Points awarded"
        value={stats.total_points_awarded}
        meta="Cumulative recognized impact"
        accent
        icon={Star}
        onClick={() => onJump?.('leaderboard')}
      />
      <StatCard
        label="Achievements"
        value={stats.total_activities_completed}
        meta="Recorded activity events"
        icon={Activity}
        onClick={() => onJump?.('activity')}
      />
    </div>
  );
}
