import { useEffect, useState } from 'react';
import { getAccessRequests, approveAccessRequest, rejectAccessRequest } from '../../api/api';
import { getInitials } from '../../utils/initials';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import Toast from '../ui/Toast';

export default function AccessRequestsPanel({ onCountChange }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAccessRequests('PENDING');
      setRequests(data);
      onCountChange?.(data.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(id, action) {
    setActingOn(id);
    try {
      if (action === 'approve') await approveAccessRequest(id);
      else await rejectAccessRequest(id);
      setToast({
        type: 'success',
        message: action === 'approve' ? 'Request approved. Employee created.' : 'Request rejected.',
      });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2 className="admin-title">Access requests</h2>
        <p className="admin-desc">{loading ? 'Loading queue…' : `${requests.length} pending`}</p>
      </div>

      {loading && <div className="center-loader"><Loader /></div>}
      {error && <EmptyState message={`Couldn't load requests: ${error}`} />}
      {!loading && !error && requests.length === 0 && (
        <EmptyState message="No pending access requests." />
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="access-req-list">
          {requests.map((request) => (
            <div key={request.id} className="access-req-card">
              <div className="access-req-avatar">{getInitials(request.name)}</div>
              <div className="access-req-info">
                <div className="access-req-name">{request.name}</div>
                <div className="access-req-email">{request.email}</div>
              </div>
              <div className="access-req-actions">
                <button
                  className="btn-reject"
                  disabled={actingOn === request.id}
                  onClick={() => handleDecision(request.id, 'reject')}
                >
                  {actingOn === request.id ? 'Working…' : 'Reject'}
                </button>
                <button
                  className="btn-approve"
                  disabled={actingOn === request.id}
                  onClick={() => handleDecision(request.id, 'approve')}
                >
                  {actingOn === request.id ? 'Working…' : 'Approve'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
