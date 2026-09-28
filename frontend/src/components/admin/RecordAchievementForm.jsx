import { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Search, Trophy } from 'lucide-react';
import { getEmployees, recordScore } from '../../api/api';
import { ACTIVITIES } from '../../constants/activities';
import { getInitials } from '../../utils/initials';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import { formatPoints } from '../../utils/format';

export default function RecordAchievementForm() {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase();
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) || employee.email.toLowerCase().includes(query)
    );
  }, [employees, search]);

  const totalPoints = selectedActivities.reduce((sum, name) => {
    const activity = ACTIVITIES.find((item) => item.name === name);
    return sum + (activity?.points || 0);
  }, 0);

  function toggleActivity(name) {
    setSelectedActivities((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  }

  async function handleSubmit() {
    if (!selectedEmployee || selectedActivities.length === 0) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const results = await Promise.allSettled(
        selectedActivities.map((name) => recordScore(selectedEmployee.employee_id, name))
      );
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length > 0) throw new Error(`${failed.length} achievement(s) could not be recorded.`);
      setSuccess({ name: selectedEmployee.name, points: totalPoints, count: selectedActivities.length });
      setStep(5);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSuccess(null);
    setSelectedEmployee(null);
    setSelectedActivities([]);
    setErrorMsg(null);
    setSearch('');
    setStep(1);
  }

  if (loadingEmployees) {
    return (
      <div className="center-loader">
        <Loader />
      </div>
    );
  }

  if (loadError) {
    return <EmptyState message={`Couldn't load employees: ${loadError}`} />;
  }

  if (success) {
    return (
      <div className="workstation-premium">
        <div className="success-overlay">
          <div className="success-icon-ring"><CheckCircle2 size={36} /></div>
          <div className="success-title">Achievement recorded</div>
          <div className="success-subtitle">
            {success.name} · {success.count} {success.count === 1 ? 'event' : 'events'}
          </div>
          <div className="success-pts-badge">+{formatPoints(success.points)}</div>
          <button className="workstation-submit-premium" style={{ maxWidth: 240 }} onClick={resetForm}>
            Record another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workstation-premium">
      <div className="workstation-header-premium">
        <div className="workstation-header-left">
          <span className="workstation-eyebrow">Awarding workflow</span>
          <h2 className="workstation-title">Record achievement</h2>
          <p className="workstation-desc">
            Who receives it, what they did, and the points the backend will assign.
          </p>
        </div>
        <div className="workstation-icon-badge"><Trophy size={22} /></div>
      </div>

      <div className="step-progress-bar">
        {[
          { n: 1, label: 'Employee' },
          { n: 2, label: 'Achievement' },
          { n: 3, label: 'Review' },
          { n: 4, label: 'Confirm' },
        ].map((item, index, list) => (
          <div className="step-node" key={item.n}>
            <div className={`step-circle ${step > item.n ? 'done' : step === item.n ? 'active' : ''}`}>
              {step > item.n ? <Check size={14} /> : `0${item.n}`}
            </div>
            <span className={`step-label ${step >= item.n ? 'active' : ''}`}>{item.label}</span>
            {index < list.length - 1 && <div className={`step-connector ${step > item.n ? 'done' : ''}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="workstation-form">
          <div className="leaderboard-search" style={{ maxWidth: '100%' }}>
            <Search size={16} className="leaderboard-search-icon" />
            <input
              placeholder="Search employee..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>
          <div className="emp-select-list">
            {filteredEmployees.length === 0 ? (
              <EmptyState message="No employees found." />
            ) : (
              filteredEmployees.map((employee) => (
                <button
                  type="button"
                  key={employee.employee_id}
                  className="emp-select-item"
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setStep(2);
                  }}
                >
                  <strong>{employee.name}</strong>
                  <span>{employee.email}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="workstation-form">
          <div className="emp-picker-selected" onClick={() => setStep(1)}>
            <div className="emp-picker-avatar">{getInitials(selectedEmployee.name)}</div>
            <div className="emp-picker-info">
              <div className="emp-picker-name">{selectedEmployee.name}</div>
              <div className="emp-picker-email">{selectedEmployee.email}</div>
            </div>
            <span className="emp-picker-change">Change</span>
          </div>
          <div className="activity-grid">
            {ACTIVITIES.map((activity) => {
              const selected = selectedActivities.includes(activity.name);
              return (
                <button
                  type="button"
                  key={activity.name}
                  className={`activity-card ${selected ? 'selected' : ''}`}
                  onClick={() => toggleActivity(activity.name)}
                >
                  <div className="activity-check-box">{selected && <Check size={13} />}</div>
                  <div className="activity-card-info">
                    <div className="activity-card-name">{activity.name}</div>
                    <div className="activity-card-pts">+{formatPoints(activity.points)}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="workstation-submit-premium"
            disabled={selectedActivities.length === 0}
            onClick={() => setStep(3)}
          >
            Review points
          </button>
        </div>
      )}

      {(step === 3 || step === 4) && (
        <div className="preview-pane">
          <span className="preview-pane-title">{step === 3 ? 'Point preview' : 'Confirm award'}</span>
          <div className="preview-row">
            <span>Employee</span>
            <span className="preview-val">{selectedEmployee.name}</span>
          </div>
          {selectedActivities.map((name) => {
            const activity = ACTIVITIES.find((item) => item.name === name);
            return (
              <div className="preview-row" key={name}>
                <span>{name}</span>
                <span className="preview-val">+{formatPoints(activity?.points)}</span>
              </div>
            );
          })}
          <div className="preview-total-row">
            <span className="preview-total-label">Backend will assign</span>
            <span className="preview-total-val">+{formatPoints(totalPoints)}</span>
          </div>
          {errorMsg && <div style={{ color: 'var(--error)', fontSize: '0.88rem' }}>{errorMsg}</div>}
          <div className="cr-filter-row">
            <button type="button" className="emp-picker-change" onClick={() => setStep(step === 4 ? 3 : 2)}>
              Back
            </button>
            {step === 3 ? (
              <button type="button" className="workstation-submit-premium" onClick={() => setStep(4)}>
                Confirm
              </button>
            ) : (
              <button
                type="button"
                className="workstation-submit-premium"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Recording…' : 'Award now'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
