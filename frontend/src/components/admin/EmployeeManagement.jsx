
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { getEmployees } from '../../api/api';
import Card from '../ui/Card';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const query = search.toLowerCase();

    return (
      employee.name.toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Employees</h2>
        <p>View and search employees and their current scores.</p>
      </div>

      <div className="employee-search">
        <Search size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
        />
      </div>

      {loading && (
        <div className="center-loader">
          <Loader />
        </div>
      )}

      {error && (
        <EmptyState
          message={`Couldn't load employees: ${error}`}
        />
      )}

      {!loading && !error && filteredEmployees.length === 0 && (
        <EmptyState message="No employees match your search." />
      )}

      {!loading && !error && filteredEmployees.length > 0 && (
        <Card className="employee-management-card">
          <div className="employee-list">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.employee_id}
                className="employee-management-row"
              >
                <div className="employee-management-info">
                  <div className="employee-management-name">
                    {employee.name}
                  </div>
                  <div className="employee-management-email">
                    {employee.email}
                  </div>
                </div>

                <div className="employee-management-score">
                  {employee.cumulative_score.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}