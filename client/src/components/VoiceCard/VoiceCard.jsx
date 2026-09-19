import { Play, Pause, Loader2, CheckCircle2 } from 'lucide-react';

const GRADIENTS = {
  aria: 'from-[#7C5CFC] to-[#4F46E5]',
  kai: 'from-[#2DD4BF] to-[#0E7490]',
  meera: 'from-[#F472B6] to-[#7C5CFC]',
};

export default function VoiceCard({ voice, selected = false, previewLoading = false, previewPlaying = false, onSelect, onPreview }) {
  const initial = voice.name?.[0] || 'N';
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`tap flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 ${
        selected ? 'border-primary bg-primary/10 shadow-glow-sm' : 'border-line bg-card hover:border-primary/40'
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-white ${
          GRADIENTS[voice.key] || GRADIENTS.aria
        }`}
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{voice.name}</span>
          <span className="rounded-full border border-line px-1.5 py-px font-mono text-[10px] text-muted">
            {voice.tag || 'EN'}
          </span>
        </div>
        <p className="truncate text-xs text-muted">
          {voice.description} · {voice.accent}
        </p>
      </div>

      <span
        role="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          onPreview?.(voice);
        }}
        className={`tap flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
          previewPlaying ? 'border-primary bg-primary text-white' : 'border-line bg-card2 text-ink hover:border-primary/50'
        }`}
      >
        {previewLoading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : previewPlaying ? (
          <Pause size={15} />
        ) : (
          <Play size={15} className="ml-0.5" />
        )}
      </span>

      {selected && <CheckCircle2 size={18} className="shrink-0 text-accent" />}
    </button>
  );
}
