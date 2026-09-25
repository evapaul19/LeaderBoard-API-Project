// Display-only mirror of the backend's ACTIVITY_POINTS (src/constants.py).
// The backend remains the sole source of truth for actual score assignment.
// This list exists only to inform the UI, never to calculate or submit a score.

export const ACTIVITIES = [
  { name: 'Interview Panel', points: 500 },
  { name: 'OSS PR merged', points: 500 },
  { name: 'Blog Post', points: 1000 },
  { name: 'Blog crosses 5,000 views in first 30 days', points: 1000 },
  { name: 'Internal knowledge session', points: 1000 },
  { name: 'External Community Event (Speaker)', points: 2000 },
  { name: 'KubeCon or other Major Event (Speaker)', points: 5000 },
  { name: 'Referral', points: 5000 },
];