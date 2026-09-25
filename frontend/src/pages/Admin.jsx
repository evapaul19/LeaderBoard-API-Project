import { useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import AccessRequestsPanel from '../components/admin/AccessRequestsPanel';
import RecordAchievementForm from '../components/admin/RecordAchievementForm';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'access-requests', label: 'Access Requests' },
  { id: 'record-achievement', label: 'Record Achievement' },
  { id: 'employees', label: 'Employees' },
  { id: 'activity-history', label: 'Activity History' },
];

export default function Admin() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection} sections={SECTIONS}>
      {activeSection === 'overview' && <AdminOverview onNavigate={setActiveSection} />}
      {activeSection === 'access-requests' && <AccessRequestsPanel />}
      {activeSection === 'record-achievement' && <RecordAchievementForm />}
      {(activeSection === 'employees' || activeSection === 'activity-history') && (
        <div className="admin-coming-soon"><p>This section will be available in a later phase.</p></div>
      )}
    </AdminLayout>
  );
}