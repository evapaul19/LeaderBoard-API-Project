import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { getLeaderboard } from '../../api/api';
import Avatar from '../ui/Avatar';
import EmployeeDrawer from '../EmployeeDrawer';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import { formatPoints } from '../../utils/format';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    getLeaderboard()
      .then(setEmployees)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) || employee.email.toLowerCase().includes(query)
    );
  }, [employees, search]);

  const maxScore = Math.max(1, ...employees.map((employee) => employee.cumulative_score));
  const selectedEmployee = employees.find((employee) => employee.employee_id === selectedId) || null;

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2 className="admin-title">Employees</h2>
        <p className="admin-desc">Roster with live ranks and scores from the leaderboard.</p>
      </div>

      <div className="lb-search-wrap" style={{ maxWidth: 380, marginBottom: 20 }}>
        <Search size={16} className="lb-search-icon" />
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search employees"
        />
      </div>

      {loading && <div className="center-loader"><Loader /></div>}
      {error && <EmptyState message={`Couldn't load employees: ${error}`} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState message="No employees match your search." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="cr-roster">
          {filtered.map((employee) => (
            <button
              type="button"
              key={employee.employee_id}
              className="emp-roster-row"
              onClick={() => setSelectedId(employee.employee_id)}
            >
              <span className={`lb-rank-pill r${employee.rank <= 3 ? employee.rank : ''}`}>
                {employee.rank}
              </span>
              <Avatar name={employee.name} />
              <div className="emp-roster-info">
                <div className="emp-roster-name">{employee.name}</div>
                <div className="emp-roster-email">{employee.email}</div>
              </div>
              <div className="emp-roster-score-wrap">
                <span className="emp-roster-score">{formatPoints(employee.cumulative_score)} pts</span>
                <div className="emp-roster-bar">
                  <div
                    className="emp-roster-bar-fill"
                    style={{ width: `${(employee.cumulative_score / maxScore) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <EmployeeDrawer
        employee={selectedEmployee}
        employeeId={selectedId}
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
