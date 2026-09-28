import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { getInitials } from '../utils/initials';
import { formatPoints } from '../utils/format';
import {
  activitiesByEmployee,
  layoutConstellation,
  nodeRadius,
  sharedActivities,
} from '../utils/constellation';
import { uniqueActivities } from '../utils/aggregateScores';
import EmptyState from './ui/EmptyState';

export default function ContributionConstellation({
  entries = [],
  activities = [],
  onSelectEmployee,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const [filter, setFilter] = useState(null);

  const activityTypes = useMemo(() => uniqueActivities(activities), [activities]);
  const byEmployee = useMemo(() => activitiesByEmployee(activities), [activities]);

  const visibleEntries = useMemo(() => {
    if (!filter) return entries;
    return entries.filter((entry) => byEmployee.get(entry.employee_id)?.has(filter));
  }, [entries, filter, byEmployee]);

  const nodes = useMemo(() => layoutConstellation(visibleEntries), [visibleEntries]);
  const maxScore = Math.max(1, ...entries.map((entry) => Number(entry.cumulative_score) || 0));
  const hovered = nodes.find((node) => node.employee_id === hoveredId) || null;

  const links = useMemo(() => {
    if (!hovered) return [];
    const left = byEmployee.get(hovered.employee_id) || new Set();
    return nodes
      .filter((node) => node.employee_id !== hovered.employee_id)
      .map((node) => {
        const shared = sharedActivities(left, byEmployee.get(node.employee_id) || new Set());
        return shared.length ? { node, shared } : null;
      })
      .filter(Boolean);
  }, [hovered, nodes, byEmployee]);

  if (entries.length === 0) {
    return (
      <section className="constellation-section">
        <EmptyState message="The constellation appears once employees are on the leaderboard." />
      </section>
    );
  }

  return (
    <section className="constellation-section" id="constellation">
      <div className="constellation-card">
        <div className="constellation-header">
          <div className="constellation-title-block">
            <span className="constellation-eyebrow">Signature view</span>
            <h2 className="constellation-title">Contribution constellation</h2>
            <p className="constellation-subtitle">
              Node size is total points. Hover a person to see who shares the same achievement types.
            </p>
          </div>
          <div className="constellation-legend">
            <div className="constellation-legend-item">
              <span className="constellation-legend-dot" style={{ background: 'var(--accent)' }} />
              Larger node = more points
            </div>
            <div className="constellation-legend-item">
              <span className="constellation-legend-dot" style={{ background: 'var(--text-muted)' }} />
              Lines appear on hover from real activity overlap
            </div>
          </div>
        </div>

        {activityTypes.length > 0 && (
          <div className="cr-filter-row" role="tablist" aria-label="Filter by achievement type">
            <button
              type="button"
              className={`cr-chip ${filter === null ? 'is-active' : ''}`}
              onClick={() => setFilter(null)}
            >
              All types
            </button>
            {activityTypes.map((activity) => (
              <button
                type="button"
                key={activity}
                className={`cr-chip ${filter === activity ? 'is-active' : ''}`}
                onClick={() => setFilter((current) => (current === activity ? null : activity))}
              >
                {activity}
              </button>
            ))}
          </div>
        )}

        <div className="constellation-canvas">
          {visibleEntries.length === 0 ? (
            <EmptyState message="No one has recorded this achievement type yet." />
          ) : (
            <svg viewBox="0 0 900 520" role="img" aria-label="Employee contribution constellation">
              {links.map(({ node }) => (
                <line
                  key={`${hovered.employee_id}-${node.employee_id}`}
                  x1={hovered.x}
                  y1={hovered.y}
                  x2={node.x}
                  y2={node.y}
                  className="cr-constellation-link"
                />
              ))}
              {nodes.map((node) => {
                const radius = nodeRadius(node.cumulative_score, maxScore);
                const active = hoveredId === node.employee_id;
                return (
                  <g
                    key={node.employee_id}
                    className="cr-constellation-node"
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.name}, rank ${node.rank}, ${formatPoints(node.cumulative_score)} points`}
                    onMouseEnter={() => setHoveredId(node.employee_id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(node.employee_id)}
                    onBlur={() => setHoveredId(null)}
                    onClick={() => onSelectEmployee(node.employee_id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelectEmployee(node.employee_id);
                      }
                    }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + 6}
                      className={`cr-constellation-halo ${node.rank <= 3 ? 'is-top' : ''} ${active ? 'is-active' : ''}`}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      className={`cr-constellation-core ${node.rank === 1 ? 'is-first' : ''}`}
                    />
                    <text x={node.x} y={node.y + 1} className="cr-constellation-initials">
                      {getInitials(node.name)}
                    </text>
                    <text x={node.x} y={node.y + radius + 16} className="cr-constellation-label">
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {hovered && (
            <div
              className="constellation-tooltip"
              style={{ left: `${(hovered.x / 900) * 100}%`, top: `${(hovered.y / 520) * 100}%` }}
            >
              <div className="constellation-tooltip-name">{hovered.name}</div>
              <div className="constellation-tooltip-pts">
                Rank {hovered.rank} · {formatPoints(hovered.cumulative_score)} pts
              </div>
              <div className="constellation-tooltip-count">
                {(byEmployee.get(hovered.employee_id)?.size || 0)} achievement type
                {(byEmployee.get(hovered.employee_id)?.size || 0) === 1 ? '' : 's'}
                {links.length > 0 ? ` · ${links.length} shared overlap${links.length === 1 ? '' : 's'}` : ''}
              </div>
            </div>
          )}
        </div>

        <p className="cr-constellation-hint">
          <Info size={14} />
          Click a node to open the employee profile. Empty nodes still appear if they are on the leaderboard with zero points.
        </p>
      </div>
    </section>
  );
}
