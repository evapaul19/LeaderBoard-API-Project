import { LayoutGrid, UserCheck, Trophy, Users, History } from 'lucide-react';

const ICONS = {
  overview: LayoutGrid,
  'access-requests': UserCheck,
  'record-achievement': Trophy,
  employees: Users,
  'activity-history': History,
};

export default function AdminLayout({ activeSection, onSectionChange, sections, children }) {
  return (
    <div className="admin-layout-premium">
      <aside className="admin-sidebar-premium">
        <div className="admin-sidebar-head">
          <div className="admin-sidebar-head-eyebrow">Internal</div>
          <div className="admin-sidebar-head-title">Command center</div>
        </div>
        <nav className="admin-sidebar-nav-premium" aria-label="Admin sections">
          {sections.map((section) => {
            const Icon = ICONS[section.id] || LayoutGrid;
            return (
              <button
                key={section.id}
                type="button"
                className={`admin-nav-item ${section.id === activeSection ? 'active' : ''}`}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon size={16} />
                <span>{section.label}</span>
                {section.badge > 0 && <span className="admin-nav-badge">{section.badge}</span>}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="admin-main-premium">{children}</div>
    </div>
  );
}
