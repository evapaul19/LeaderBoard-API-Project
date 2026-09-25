export default function AdminLayout({ activeSection, onSectionChange, sections, children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Command Center</div>
        <nav className="admin-sidebar-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`admin-sidebar-link ${section.id === activeSection ? 'active' : ''}`}
              onClick={() => onSectionChange(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}