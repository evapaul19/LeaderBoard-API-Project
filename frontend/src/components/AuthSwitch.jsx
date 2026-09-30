/**
 * In-card navigation between the sign-in and sign-up screens.
 *
 * Replaces Clerk's own cross-component footer link, which expects a full URL
 * or path and therefore resolves to Clerk's hosted account portal. Keeping the
 * switch in our own markup guarantees both directions stay inside the app.
 */
export default function AuthSwitch({ target, action, onClick }) {
  return (
    <div className="signin-switch">
      <span className="signin-switch-text">{target}</span>
      <button type="button" className="signin-switch-link" onClick={onClick}>
        {action}
      </button>
    </div>
  );
}
