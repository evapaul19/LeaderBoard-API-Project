import { getInitials } from '../utils/initials';
import { formatPoints } from '../utils/format';

const SLOTS = [
  { rank: 2, className: 'rank-2', step: 'step-2', label: '02' },
  { rank: 1, className: 'rank-1', step: 'step-1', label: '01' },
  { rank: 3, className: 'rank-3', step: 'step-3', label: '03' },
];

export default function Podium({ entries, onSelectEmployee, selectedEmployeeId = null }) {
  const topThree = entries.slice(0, 3);
  if (topThree.length === 0) return null;

  return (
    <section className="podium-section" id="podium">
      <div className="section-heading">
        <h2 className="section-title">The arena</h2>
      </div>
      <div className="podium-stage">
        {SLOTS.map((slot, index) => {
          const employee = topThree.find((entry) => entry.rank === slot.rank) || topThree[slot.rank - 1];
          if (!employee) return <div key={slot.rank} />;
          const isFirst = slot.rank === 1;
          const isSelected = selectedEmployeeId === employee.employee_id;
          
          return (
            <button
              type="button"
              key={employee.employee_id}
              className={`podium-slot ${slot.className} anim-fade-slide-up stagger-${index}${isSelected ? ' selected' : ''}`}
              onClick={() => onSelectEmployee(employee.employee_id)}
              aria-pressed={isSelected}
            >
              <div className="podium-card-inner">
                <span className={`podium-rank-indicator rank-ind-${slot.rank}`}>{slot.label}</span>
                <div className="podium-avatar-wrap">
                  <div className={isFirst ? 'podium-avatar-xl' : 'podium-avatar-md'}>
                    {getInitials(employee.name)}
                  </div>
                  <span className="podium-rank-num">{slot.rank}</span>
                </div>
                <div className="podium-emp-name">{employee.name}</div>
                <div className="podium-emp-score">{formatPoints(employee.cumulative_score)}</div>
                <div className="podium-emp-meta">points</div>
                <span className="podium-open-hint">Open profile</span>
              </div>
              <div className={`podium-step-base ${slot.step}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}