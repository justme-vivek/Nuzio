import { SkipBack, SkipForward, Play, Pause, Gauge, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer.js';
import Waveform from '../Waveform/Waveform.jsx';
import { formatClock } from '../../utils/time.js';

export default function AudioPlayer({ seed = 'nuzio' }) {
  const {
    playing,
    loading,
    currentTime,
    duration,
    speed,
    cycleSpeed,
    seekFraction,
    toggle,
    nextStory,
    prevStory,
    briefing,
  } = useAudioPlayer();

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="w-full">
      <Waveform seed={seed} progress={progress} onSeek={seekFraction} height={40} className="mb-1" />

      <div className="mb-3 flex items-center justify-between font-mono text-[11px] text-muted">
        <span>{formatClock(currentTime)}</span>
        <span>{duration ? `-${formatClock(duration - currentTime)}` : '--:--'}</span>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={prevStory}
          disabled={!briefing}
          className="tap flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card2 text-ink transition-colors hover:border-primary/50 disabled:opacity-40"
          title="Previous story"
        >
          <SkipBack size={17} />
        </button>

        <button
          type="button"
          onClick={toggle}
          disabled={!briefing}
          className="tap flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary2 text-white shadow-glow transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={26} className="animate-spin" />
          ) : playing ? (
            <Pause size={26} fill="currentColor" />
          ) : (
            <Play size={26} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={nextStory}
          disabled={!briefing}
          className="tap flex h-10 w-10 items-center justify-center rounded-full border border-line bg-card2 text-ink transition-colors hover:border-primary/50 disabled:opacity-40"
          title="Next story"
        >
          <SkipForward size={17} />
        </button>

        <button
          type="button"
          onClick={cycleSpeed}
          className="tap absolute right-0 flex h-9 items-center gap-1 rounded-full border border-line bg-card2 px-3 font-mono text-xs text-ink transition-colors hover:border-primary/50"
          title="Playback speed"
        >
          <Gauge size={13} />
          {speed}x
        </button>
      </div>
    </div>
  );
}
