import { useSaved, useToggleSaved } from '../../hooks/useNews.js';
import { useAudioPlayer } from '../../hooks/useAudioPlayer.js';
import { CATEGORY_LABELS } from '../../constants/onboarding.js';

export default function HomeStoryRow({ story, globalIndex, briefing }) {
  const { data: savedItems = [] } = useSaved();
  const toggleSaved = useToggleSaved();
  const audio = useAudioPlayer();

  const isActive = audio.mode === 'briefing' && audio.activeStoryIndex === globalIndex;
  const canJump = typeof story.startSec === 'number';
  const isSaved = story.articleId ? savedItems.some((s) => String(s.articleId) === String(story.articleId)) : false;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
        isActive ? 'border-primary/50 bg-primary/5' : 'border-line bg-card'
      }`}
    >
      <span className={`mt-0.5 font-mono text-xs ${isActive ? 'text-primary' : 'text-muted'}`}>
        {String(globalIndex + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <span className="mb-1 inline-block rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
          {story.category ? CATEGORY_LABELS[story.category] || story.category : 'News'} · {story.source}
        </span>
        <p className={`text-sm font-medium leading-snug ${isActive ? 'text-primary' : ''}`}>{story.title}</p>
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 inline-block text-[11px] text-muted hover:text-ink"
        >
          Open source →
        </a>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {story.articleId && (
          <button
            type="button"
            onClick={() => toggleSaved.mutate({ articleId: String(story.articleId), saved: isSaved })}
            className={`tap rounded-full border px-2.5 py-1.5 text-[11px] transition-colors ${
              isSaved ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-card2 text-muted hover:text-ink'
            }`}
          >
            {isSaved ? '★' : '☆'}
          </button>
        )}
        <button
          type="button"
          disabled={!canJump || !briefing}
          onClick={() => audio.playBriefing(briefing, { storyIndex: globalIndex, autoplay: true })}
          className="tap flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card2 text-[11px] text-ink transition-colors hover:border-primary/50 disabled:opacity-30"
          title={canJump ? 'Play this story' : 'Jump unavailable'}
        >
          {isActive && audio.playing ? '❚❚' : '▶'}
        </button>
      </div>
    </div>
  );
}
