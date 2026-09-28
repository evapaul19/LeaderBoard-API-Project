export default function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function DashboardSkeleton() {
  return (
    <div className="cr-skeleton-stack" aria-busy="true" aria-label="Loading dashboard">
      <div className="stats-bar-grid">
        <div className="skeleton admin-skeleton-stat" />
        <div className="skeleton admin-skeleton-stat" />
        <div className="skeleton admin-skeleton-stat" />
      </div>
      <div className="skeleton" style={{ height: 280, borderRadius: 12 }} />
      <div className="skeleton" style={{ height: 360, borderRadius: 12 }} />
    </div>
  );
}
