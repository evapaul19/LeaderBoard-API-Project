import { useEffect, useState } from 'react';
import { getEmployees, recordScore } from '../../api/api';
import { ACTIVITIES } from '../../constants/activities';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import Toast from '../ui/Toast';

export default function RecordAchievementForm() {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeId, setEmployeeId] = useState('');
  const [activity, setActivity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => {
        setToast({
          type: 'error',
          message: err.message,
        });
      })
      .finally(() => setLoadingEmployees(false));
  }, []);

  const selectedActivity = ACTIVITIES.find(
    (a) => a.name === activity
  );

  const isValid = employeeId !== '' && activity !== '';

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValid) return;

    setSubmitting(true);

    try {
      await recordScore(Number(employeeId), activity);

      const employeeName = employees.find(
        (employee) => employee.employee_id === Number(employeeId)
      )?.name;

      setToast({
        type: 'success',
        message: `Recorded "${activity}" for ${employeeName}.`,
      });

      setEmployeeId('');
      setActivity('');
    } catch (err) {
      setToast({
        type: 'error',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Record Achievement</h2>
        <p>Log a completed activity for an employee.</p>
      </div>

      <Card className="admin-form-card">
        {loadingEmployees ? (
          <div className="center-loader">
            <Loader />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="admin-form">
            <label className="admin-form-field">
              <span>Employee</span>

              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">Select an employee</option>

                {employees.map((employee) => (
                  <option
                    key={employee.employee_id}
                    value={employee.employee_id}
                  >
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-field">
              <span>Activity</span>

              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              >
                <option value="">Select an activity</option>

                {ACTIVITIES.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedActivity && (
              <div className="admin-points-preview">
                <span>{selectedActivity.name}</span>

                <span className="admin-points-value">
                  +{selectedActivity.points.toLocaleString()} points
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isValid || submitting}
            >
              {submitting ? 'Recording...' : 'Record Achievement'}
            </Button>
          </form>
        )}
      </Card>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}