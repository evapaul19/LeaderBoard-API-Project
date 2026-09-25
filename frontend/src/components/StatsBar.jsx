import { Users, Star, Activity } from 'lucide-react';
import Card from './ui/Card';

export default function StatsBar({ stats }) {
  const items = [
    { label: 'Total Employees', value: stats.total_employees, icon: Users },
    { label: 'Total Points Awarded', value: stats.total_points_awarded, icon: Star },
    { label: 'Activities Completed', value: stats.total_activities_completed, icon: Activity },
  ];

  return (
    <div className="stats-grid">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="stat-card">
          <Icon size={22} color="var(--accent)" />
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </Card>
      ))}
    </div>
  );
}