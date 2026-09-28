import { useClerk } from '@clerk/clerk-react';

export default function Nav({ activeSection, onSectionChange, isAdmin, user }) {
  const { signOut } = useClerk();

  return (
    <header className="app-nav">
      <div className="app-nav-brand">
        <span className="app-nav-tag">Achievement arena</span>
      </div>

      <nav className="app-nav-tabs" aria-label="Main navigation">
        <button
          className={`app-nav-tab ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => onSectionChange('dashboard')}
        >
          Arena
        </button>
        {isAdmin && (
          <button
            className={`app-nav-tab ${activeSection === 'admin' ? 'active' : ''}`}
            onClick={() => onSectionChange('admin')}
          >
            Command
          </button>
        )}
      </nav>

      <div className="app-nav-user">
        <div className="user-status-pill">
          <span className="user-status-dot" title="Active session" />
          <span className="user-email" title={user?.email || ''}>
            {user?.name || user?.email || 'Authenticated'}
          </span>
          <span className="user-role-badge">{isAdmin ? 'ADMIN' : 'MEMBER'}</span>
        </div>
        <button className="sign-out-btn" onClick={() => signOut()} title="Sign out">
          Sign out
        </button>
      </div>
    </header>
  );
}
