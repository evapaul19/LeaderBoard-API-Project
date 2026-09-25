export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`card fade-in ${className}`} {...props}>
      {children}
    </div>
  );
}