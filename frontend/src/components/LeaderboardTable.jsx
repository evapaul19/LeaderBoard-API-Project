import Card from './ui/Card';
import Badge from './ui/Badge';

export default function LeaderboardTable({ entries, onSelectEmployee }) {
  return (
    <Card className="leaderboard-card">
      <h2>Full Leaderboard</h2>
      <div className="leaderboard-list">
        {entries.map((employee) => (
          <button
            key={employee.employee_id}
            className="leaderboard-row"
            onClick={() => onSelectEmployee(employee.employee_id)}
          >
            <Badge variant="default">#{employee.rank}</Badge>
            <span className="leaderboard-name">{employee.name}</span>
            <span className="leaderboard-score">{employee.cumulative_score} pts</span>
          </button>
        ))}
      </div>
    </Card>
  );
}