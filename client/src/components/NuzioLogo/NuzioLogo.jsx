const BAR_CONFIGS = [
  { h: 0.45, delay: 0 },
  { h: 1, delay: 0.15 },
  { h: 0.65, delay: 0.3 },
  { h: 0.85, delay: 0.1 },
  { h: 0.4, delay: 0.25 },
];

const SIZES = {
  sm: { bar: 12, gap: 2.5, text: 'text-sm' },
  md: { bar: 16, gap: 4, text: 'text-lg' },
  lg: { bar: 24, gap: 5, text: 'text-2xl' },
};

export default function NuzioLogo({ size = 'md', showWordmark = true, animated = false, className = '' }) {
  const s = SIZES[size] || SIZES.md;
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-full items-center" style={{ gap: s.gap }}>
        {BAR_CONFIGS.map((b, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full bg-primary ${animated ? 'animate-eq' : ''}`}
            style={{ height: `${Math.round(s.bar * b.h)}px`, animationDelay: `${b.delay}s` }}
          />
        ))}
      </div>
      {showWordmark && (
        <span className={`font-bold tracking-tight ${s.text}`}>
          Nuzio <span className="text-primary">AI</span>
        </span>
      )}
    </div>
  );
}
