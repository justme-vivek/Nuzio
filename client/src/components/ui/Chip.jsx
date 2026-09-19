import { Check } from 'lucide-react';

export default function Chip({ selected = false, disabled = false, icon = null, label, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`tap inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/15 text-ink shadow-glow-sm'
          : 'border-line bg-card2 text-muted hover:border-primary/40 hover:text-ink'
      } ${disabled && !selected ? 'opacity-40' : ''} ${className}`}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span>{label}</span>
      {selected && <Check size={14} className="text-accent" strokeWidth={3} />}
    </button>
  );
}
