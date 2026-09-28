import { aggregateByActivity } from '../utils/aggregateScores';
import { formatPoints } from '../utils/format';

export default function ScoreComposition({ scores = [] }) {
  const aggregated = aggregateByActivity(scores);
  if (aggregated.length === 0) return null;
  const max = Math.max(...aggregated.map((item) => item.total));
  const total = aggregated.reduce((sum, item) => sum + item.total, 0);

  return (
    <div>
      <div className="score-comp-summary">
        <div className="score-comp-summary-item">
          <span className="score-comp-summary-val">{aggregated.length}</span>
          <span className="score-comp-summary-lbl">Types</span>
        </div>
        <div className="score-comp-summary-item">
          <span className="score-comp-summary-val">{scores.length}</span>
          <span className="score-comp-summary-lbl">Events</span>
        </div>
        <div className="score-comp-summary-item">
          <span className="score-comp-summary-val">{formatPoints(total)}</span>
          <span className="score-comp-summary-lbl">From history</span>
        </div>
      </div>
      {aggregated.map((item) => (
        <div key={item.activity} className="comp-item-enhanced">
          <div className="comp-row-info">
            <span className="comp-activity-name">{item.activity}</span>
            <span className="comp-count-tag">{item.count}×</span>
            <span className="comp-points-val">+{formatPoints(item.total)}</span>
          </div>
          <div className="comp-bar-track">
            <div className="comp-bar-fill" style={{ width: `${(item.total / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
