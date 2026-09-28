export function layoutConstellation(entries = []) {
  const width = 900;
  const height = 520;
  const cx = width / 2;
  const cy = height / 2 + 8;
  const count = entries.length;

  if (count === 0) return [];
  if (count === 1) return [{ ...entries[0], x: cx, y: cy }];

  const inner = entries.filter((entry) => entry.rank <= 3).slice(0, 3);
  const innerIds = new Set(inner.map((entry) => entry.employee_id));
  const outer = entries.filter((entry) => !innerIds.has(entry.employee_id));

  const place = (list, radius, offset = -Math.PI / 2) =>
    list.map((entry, index) => {
      const angle = offset + (Math.PI * 2 * index) / Math.max(list.length, 1);
      return {
        ...entry,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });

  if (outer.length === 0) return place(inner.length ? inner : entries, 158);
  return [...place(inner, 118), ...place(outer, 228, -Math.PI / 2 + 0.18)];
}

export function nodeRadius(score, maxScore) {
  const min = 16;
  const max = 42;
  if (!maxScore) return min;
  return min + ((Number(score) || 0) / maxScore) * (max - min);
}

export function sharedActivities(left = new Set(), right = new Set()) {
  return [...left].filter((activity) => right.has(activity));
}

export function activitiesByEmployee(activities = []) {
  const map = new Map();
  activities.forEach((item) => {
    if (!map.has(item.employee_id)) map.set(item.employee_id, new Set());
    if (item.activity) map.get(item.employee_id).add(item.activity);
  });
  return map;
}
