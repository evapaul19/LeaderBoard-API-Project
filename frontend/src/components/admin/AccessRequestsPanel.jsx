import { useEffect, useState } from 'react';
import { getAccessRequests, approveAccessRequest, rejectAccessRequest } from '../../api/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import EmptyState from '../ui/EmptyState';
import Toast from '../ui/Toast';

export default function AccessRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [actingOn, setActingOn] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getAccessRequests('PENDING');
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDecision(id, action) {
    setActingOn(id);
    try {
      if (action === 'approve') await approveAccessRequest(id);
      else await rejectAccessRequest(id);
      setToast({ type: 'success', message: `Request ${action === 'approve' ? 'approved' : 'rejected'}.` });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Access Requests</h2>
        <p>{requests.length} pending</p>
      </div>

      {loading && <div className="center-loader"><Loader /></div>}
      {error && <EmptyState message={`Couldn't load requests: ${error}`} />}

      {!loading && !error && requests.length === 0 && (
        <EmptyState message="No pending access requests." />
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="access-requests-list">
          {requests.map((req) => (
            <Card key={req.id} className="access-request-row">
              <div>
                <div className="access-request-name">{req.name}</div>
                <div className="access-request-email">{req.email}</div>
              </div>
              <div className="access-request-actions">
                <Button
                  variant="secondary"
                  disabled={actingOn === req.id}
                  onClick={() => handleDecision(req.id, 'reject')}
                >
                  Reject
                </Button>
                <Button
                  disabled={actingOn === req.id}
                  onClick={() => handleDecision(req.id, 'approve')}
                >
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}