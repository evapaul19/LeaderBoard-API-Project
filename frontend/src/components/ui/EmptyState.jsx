export default function EmptyState({ icon: Icon, message, action }) {
  return (
    <div className="cr-empty">
      {Icon && <Icon size={28} strokeWidth={1.5} />}
      <p>{message}</p>
      {action}
    </div>
  );
}
