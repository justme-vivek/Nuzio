export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-2xl border border-line bg-card shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
