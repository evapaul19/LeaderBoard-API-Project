export function aggregateByActivity(scores = []) {
  const map = new Map();

  scores.forEach((item) => {
    const name = item.activity;
    const points = Number(item.score || 0);
    const existing = map.get(name);
    if (existing) {
      existing.total += points;
      existing.count += 1;
    } else {
      map.set(name, { activity: name, total: points, count: 1 });
    }
  });

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function uniqueActivities(scores = []) {
  return [...new Set(scores.map((item) => item.activity).filter(Boolean))];
}
