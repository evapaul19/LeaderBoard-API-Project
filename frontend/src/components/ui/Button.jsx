export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const mapped =
    variant === 'primary'
      ? 'workstation-submit-premium'
      : variant === 'danger'
        ? 'btn-reject'
        : 'emp-picker-change';

  return (
    <button className={`${mapped} ${className}`} {...props}>
      {children}
    </button>
  );
}
