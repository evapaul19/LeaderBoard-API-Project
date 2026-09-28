import { useClerk, useUser } from '@clerk/clerk-react';
import { Clock, XCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function WaitingPage({ status, me, error }) {
  const { signOut } = useClerk();
  const { user } = useUser();
  const isRejected = status === 'REJECTED';

  return (
    <div className="waiting-page-premium">
      <div className="waiting-card-premium">
        {isRejected ? <XCircle size={32} color="var(--error)" /> : <Clock size={32} color="var(--accent)" />}
        <h2 className="waiting-title">{isRejected ? 'Access Not Approved' : 'Awaiting Approval'}</h2>
        <div className="waiting-user-box">{me?.name || user?.fullName} · {me?.email || user?.primaryEmailAddress?.emailAddress}</div>
        {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
        {!error && (
          <p className="waiting-desc">
            {isRejected
              ? 'Your request for access to this application was not approved.'
              : "Your access request is pending review by an administrator. You'll be able to enter once approved."}
          </p>
        )}
        <Button variant="secondary" onClick={() => signOut()}>Sign Out</Button>
      </div>
    </div>
  );
}