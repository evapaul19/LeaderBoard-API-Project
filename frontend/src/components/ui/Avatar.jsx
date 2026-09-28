import { getInitials } from '../../utils/initials';

export default function Avatar({ name, size = 'md', highlighted = false }) {
  return (
    <span className={`cr-avatar cr-avatar-${size} ${highlighted ? 'is-accent' : ''}`}>
      {getInitials(name)}
    </span>
  );
}
