import { useEffect } from 'react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer.js';
import { useTodayBriefing } from '../../hooks/useBriefing.js';
import AudioPlayer from '../../components/AudioPlayer/AudioPlayer.jsx';
import { formatClock } from '../../utils/time.js';
import { CATEGORY_LABELS, greetingFor, storiesForDuration } from '../../constants/onboarding.js';

export default function BriefingCard({ briefing }) {
  const { playBriefing, mode, story, activeStoryIndex, currentTime, duration, ended } = useAudioPlayer();
  const audio = useAudioPlayer();

  // Autoplay after onboarding ("Start listening").
  useEffect(() => {
    if (sessionStorage.getItem('nuzio_autoplay') && briefing?.status === 'ready') {
      sessionStorage.removeItem('nuzio_autoplay');
      playBriefing(briefing, { storyIndex: 0, autoplay: true });
    }
  }, [briefing, playBriefing]);

  const inStoryMode = mode === 'story';
  const active =
    inStoryMode
      ? { title: story?.title, meta: story?.subtitle, tag: 'NOW PLAYING' }
      : activeStoryIndex >= 0 && briefing?.stories?.[activeStoryIndex]
        ? {
            title: briefing.stories[activeStoryIndex].title,
            meta: [briefing.stories[activeStoryIndex].category, briefing.stories[activeStoryIndex].source]
              .filter(Boolean)
              .join(' · '),
            tag: `STORY ${activeStoryIndex + 1} OF ${briefing.stories.length}`,
          }
        : { title: briefing?.title || 'Morning Brief', meta: 'Intro · Nuzio', tag: 'NOW PLAYING' };

  const prog = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="rounded-3xl border border-line bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
        <span className="flex items-center gap-1.5 text-primary">
          <span className={`h-1.5 w-1.5 rounded-full ${audio.playing ? 'animate-pulse bg-mint' : 'bg-muted'}`} />
          {active.tag}
        </span>
        <span className="text-muted">
          {formatClock(currentTime)} / {duration ? formatClock(duration) : '--:--'}
        </span>
      </div>

      <h2 className="line-clamp-2 text-lg font-bold leading-snug">{active.title}</h2>
      {active.meta && <p className="mt-1 truncate text-xs text-muted">{active.meta}</p>}

      <div className="mt-5">
        <AudioPlayer seed={briefing?.id || 'nuzio'} />
      </div>

      {!inStoryMode && briefing?.stories?.length ? (
        <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
            {ended ? 'Brief complete — replay?' : 'Jump to any story below'}
          </span>
          <button
            type="button"
            onClick={() => playBriefing(briefing, { storyIndex: 0, autoplay: true })}
            className="tap rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary"
          >
            {ended ? 'Replay' : 'Restart'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
