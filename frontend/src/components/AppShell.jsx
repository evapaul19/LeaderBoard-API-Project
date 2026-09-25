import { useState } from 'react';
import Nav from './Nav';
import Dashboard from '../pages/Dashboard';
import Admin from '../pages/Admin';

export default function AppShell({ role, user }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const isAdmin = role === 'admin';

  return (
    <div className="app-shell">
      <Nav 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        isAdmin={isAdmin} 
        user={user} 
      />
      <main>
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'admin' && (
          isAdmin ? (
            <Admin />
          ) : (
            <div className="admin-container">
              <div className="waiting-card" style={{ margin: '60px auto' }}>
                <span className="waiting-badge waiting-badge-rejected">403 · PRIVILEGE REQUIRED</span>
                <h2 className="waiting-title">Access Restricted</h2>
                <p className="waiting-desc">
                  Administrative control functions require verified admin credentials. Your current authenticated role is <strong>{role || 'member'}</strong>.
                </p>
                <button 
                  className="btn-approve" 
                  onClick={() => setActiveSection('dashboard')}
                  style={{ marginTop: '12px' }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}