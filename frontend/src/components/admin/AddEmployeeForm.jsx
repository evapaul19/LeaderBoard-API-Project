import { useState } from 'react';
import { createEmployee } from '../../api/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

export default function AddEmployeeForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const isValid = name.trim() !== '' && email.trim() !== '';

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValid) return;

    setSubmitting(true);

    try {
      await createEmployee({
        name: name.trim(),
        email: email.trim(),
      });

      setToast({
        type: 'success',
        message: `${name.trim()} was added successfully.`,
      });

      setName('');
      setEmail('');
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
        <h2>Add Employee</h2>
        <p>Register a new employee in the system.</p>
      </div>

      <Card className="admin-form-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <label className="admin-form-field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Johnson"
            />
          </label>

          <label className="admin-form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@company.com"
            />
          </label>

          <Button type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Adding...' : 'Add Employee'}
          </Button>
        </form>
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