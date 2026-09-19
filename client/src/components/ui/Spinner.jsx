export default function Spinner({ size = 24, className = '' }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-block animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`}
    />
  );
}
