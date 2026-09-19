import { useCallback, useMemo, useRef } from 'react';

// Deterministic pseudo-random heights so a briefing's waveform looks stable.
function seededRandom(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) | 0;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Waveform({ seed = 'nuzio', progress = 0, bars = 44, onSeek, height = 44, className = '' }) {
  const ref = useRef(null);

  const heights = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: bars }, (_, i) => {
      const envelope = 0.55 + 0.45 * Math.sin((i / bars) * Math.PI);
      return 0.2 + 0.8 * envelope * (0.4 + 0.6 * rand());
    });
  }, [seed, bars]);

  const handle = useCallback(
    (clientX) => {
      if (!onSeek || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(f);
    },
    [onSeek]
  );

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handle(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) handle(e.clientX);
      }}
      className={`flex cursor-pointer items-center gap-[3px] ${onSeek ? '' : 'pointer-events-none'} ${className}`}
      style={{ height }}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`min-w-[2px] flex-1 rounded-full transition-colors duration-150 ${
            i / bars <= progress ? 'bg-primary' : 'bg-ink/15'
          }`}
          style={{ height: `${Math.round(h * height)}px`, maxWidth: 5 }}
        />
      ))}
    </div>
  );
}
