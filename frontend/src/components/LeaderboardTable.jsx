import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Avatar from './ui/Avatar';
import { formatPoints } from '../utils/format';
import EmptyState from './ui/EmptyState';

export default function LeaderboardTable({ entries, onSelectEmployee, selectedEmployeeId = null }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rank');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const next = entries.filter((entry) => {
      if (!query) return true;
      return (
        entry.name.toLowerCase().includes(query) ||
        entry.email.toLowerCase().includes(query)
      );
    });

    return [...next].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'score') return b.cumulative_score - a.cumulative_score;
      return a.rank - b.rank;
    });
  }, [entries, search, sort]);

  const maxScore = Math.max(1, ...entries.map((entry) => Number(entry.cumulative_score) || 0));

  return (
    <section className="leaderboard-card" id="leaderboard">
      <div className="leaderboard-toolbar-enhanced">
        <div className="lb-search-wrap">
          <Search size={16} className="lb-search-icon" />
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search leaderboard"
          />
        </div>
        <div className="lb-sort-group" role="group" aria-label="Sort leaderboard">
          {[
            { id: 'rank', label: 'Rank' },
            { id: 'score', label: 'Score' },
            { id: 'name', label: 'Name' },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              className={`lb-sort-btn ${sort === option.id ? 'active' : ''}`}
              onClick={() => setSort(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="lb-result-count">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No employees match that search." />
      ) : (
        <ol className="cr-rank-list">
          {filtered.map((employee, index) => {
            const width = `${(Number(employee.cumulative_score) / maxScore) * 100}%`;
            const isSelected = selectedEmployeeId === employee.employee_id;
            
            return (
              <li key={employee.employee_id}>
                <button
                  type="button"
                  className={`cr-rank-row anim-fade-slide-up stagger-${Math.min(index, 8)}${employee.rank <= 3 ? ' is-top' : ''}${isSelected ? ' selected' : ''}`}
                  onClick={() => onSelectEmployee(employee.employee_id)}
                  aria-pressed={isSelected}
                >
                  <span className={`lb-rank-pill r${employee.rank <= 3 ? employee.rank : ''}`}>
                    {employee.rank}
                  </span>
                  <Avatar name={employee.name} highlighted={employee.rank === 1} />
                  <span className="cr-rank-identity">
                    <span className="lb-name">{employee.name}</span>
                    <span className="lb-email">{employee.email}</span>
                  </span>
                  <span className="cr-rank-score">
                    <span className="lb-score-val">{formatPoints(employee.cumulative_score)}</span>
                    <span className="lb-score-bar-track">
                      <span className="lb-score-bar-fill" style={{ width }} />
                    </span>
                  </span>
                  <span className="action-arrow">Profile</span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}