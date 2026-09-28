export default function Loader({ size = 'md' }) {
  return (
    <div
      className={`loader-ring ${size === 'sm' ? 'loader-ring-sm' : ''}`}
      role="status"
      aria-label="Loading"
    />
  );
}
