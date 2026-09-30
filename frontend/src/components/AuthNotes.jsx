/**
 * Compact explanation of what happens to an account after sign-up.
 *
 * The wording mirrors the access rules resolved by the backend (/access/me):
 * configured addresses are approved automatically, everyone else falls into
 * the access-request workflow. Nothing here changes that logic, it just sets
 * the expectation on the screen.
 */
export default function AuthNotes() {
  return (
    <ul className="auth-note">
      <li className="auth-note-row">
        <span className="auth-note-dot ok" aria-hidden="true" />
        <span className="auth-note-label">CloudRaft addresses</span>
        <span className="auth-note-value">approved automatically</span>
      </li>
      <li className="auth-note-row">
        <span className="auth-note-dot admin" aria-hidden="true" />
        <span className="auth-note-label">Team leads</span>
        <span className="auth-note-value">admin access</span>
      </li>
      <li className="auth-note-row">
        <span className="auth-note-dot pending" aria-hidden="true" />
        <span className="auth-note-label">Everyone else</span>
        <span className="auth-note-value">admin reviews request</span>
      </li>
    </ul>
  );
}
