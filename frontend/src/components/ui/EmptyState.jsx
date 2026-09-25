export default function EmptyState({ icon: Icon, message }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={32} strokeWidth={1.5} />}
      <p>{message}</p>
    </div>
  );
}