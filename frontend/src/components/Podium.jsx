import Card from './ui/Card';
import Badge from './ui/Badge';

const PODIUM_CONFIG = [
  { badgeVariant: 'silver', label: '2nd', order: 1 },
  { badgeVariant: 'gold', label: '1st', order: 2 },
  { badgeVariant: 'bronze', label: '3rd', order: 3 },
];

export default function Podium({ entries }) {
  const topThree = entries.slice(0, 3);
  if (topThree.length === 0) return null;

  // Reorder for visual podium arrangement: 2nd, 1st, 3rd
  const arranged = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="podium">
      {arranged.map((employee) => {
        const originalIndex = topThree.indexOf(employee);
        const config = PODIUM_CONFIG[originalIndex];
        return (
          <Card
            key={employee.employee_id}
            className={`podium-card podium-${config.badgeVariant}`}
            style={{ order: config.order }}
          >
            <Badge variant={config.badgeVariant}>{config.label}</Badge>
            <div className="podium-name">{employee.name}</div>
            <div className="podium-score">{employee.cumulative_score} pts</div>
          </Card>
        );
      })}
    </div>
  );
}