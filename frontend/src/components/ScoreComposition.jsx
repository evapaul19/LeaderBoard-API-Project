export default function ScoreComposition({ scores }) {
  // Aggregate by activity, in case the same activity was recorded more than once
  const aggregated = [];
  scores.forEach((s) => {
    const existing = aggregated.find((a) => a.activity === s.activity);
    if (existing) {
      existing.total += s.score;
    } else {
      aggregated.push({ activity: s.activity, total: s.score });
    }
  });
  aggregated.sort((a, b) => b.total - a.total);

  const max = Math.max(...aggregated.map((a) => a.total));

  return (
    <div className="score-composition">
      {aggregated.map((item) => (
        <div key={item.activity} className="composition-row">
          <span className="composition-label">{item.activity}</span>
          <div className="composition-bar-track">
            <div
              className="composition-bar-fill"
              style={{ width: `${(item.total / max) * 100}%` }}
            />
          </div>
          <span className="composition-value">{item.total.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}