import { useEffect, useState } from 'react';
import { getAccessRequests } from '../api/api';
import AdminLayout from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import AccessRequestsPanel from '../components/admin/AccessRequestsPanel';
import RecordAchievementForm from '../components/admin/RecordAchievementForm';
import EmployeeManagement from '../components/admin/EmployeeManagement';
import ActivityHistory from '../components/admin/ActivityHistory';

export default function Admin() {
  const [activeSection, setActiveSection] = useState('overview');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    getAccessRequests('PENDING')
      .then((requests) => setPendingCount(requests.length))
      .catch(() => {});
  }, [activeSection]);

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'access-requests', label: 'Access Requests', badge: pendingCount },
    { id: 'record-achievement', label: 'Record Achievement' },
    { id: 'employees', label: 'Employees' },
    { id: 'activity-history', label: 'Activity History' },
  ];

  return (
    <AdminLayout activeSection={activeSection} onSectionChange={setActiveSection} sections={sections}>
      {activeSection === 'overview' && (
        <AdminOverview onNavigate={setActiveSection} pendingCount={pendingCount} />
      )}
      {activeSection === 'access-requests' && <AccessRequestsPanel onCountChange={setPendingCount} />}
      {activeSection === 'record-achievement' && <RecordAchievementForm />}
      {activeSection === 'employees' && <EmployeeManagement />}
      {activeSection === 'activity-history' && <ActivityHistory />}
    </AdminLayout>
  );
}
