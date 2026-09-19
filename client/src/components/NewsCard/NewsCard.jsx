import { Bookmark, BookmarkCheck, Headphones, Loader2, ExternalLink } from 'lucide-react';
import { useToggleSaved, useStoryAudio } from '../../hooks/useNews.js';
import { useAudioPlayer } from '../../hooks/useAudioPlayer.js';
import { useToast } from '../ui/Toast.jsx';
import { relativeTime } from '../../utils/time.js';
import { CATEGORY_LABELS } from '../../constants/onboarding.js';

export default function NewsCard({ article, saved = false }) {
  const toggleSaved = useToggleSaved();
  const storyAudio = useStoryAudio();
  const { playStory } = useAudioPlayer();
  const { toast } = useToast();

  const isSaved = Boolean(saved);
  const cat = article.categories?.[0];
  const catLabel = cat ? CATEGORY_LABELS[cat] || cat : null;

  const onToggleSave = () =>
    toggleSaved.mutate(
      { articleId: article.id, saved: isSaved },
      {
        onSuccess: () => toast(isSaved ? 'Removed from saved' : 'Story saved'),
        onError: () => toast('Could not update saved stories', 'error'),
      }
    );

  const onListen = () =>
    storyAudio.mutate(article.id, {
      onSuccess: (data) =>
        playStory({ audioFileId: data.audioFileId, title: article.title, subtitle: article.source }),
      onError: () => toast('Audio not available for this story', 'error'),
    });

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        {catLabel && (
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
            {catLabel}
          </span>
        )}
        <span className="text-[11px] text-muted">{relativeTime(article.publishedAt)}</span>
        <span className="truncate text-[11px] text-muted">· {article.source}</span>
      </div>

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1.5 block font-semibold leading-snug transition-colors hover:text-primary"
      >
        {article.title}
        <ExternalLink size={11} className="ml-1.5 inline text-muted" />
      </a>

      {(article.aiSummary || '') && <p className="mb-3 line-clamp-2 text-sm text-muted">{article.aiSummary}</p>}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onListen}
          disabled={storyAudio.isPending}
          className="tap flex items-center gap-1.5 rounded-full border border-line bg-card2 px-3 py-1.5 text-xs text-ink transition-colors hover:border-primary/50 disabled:opacity-50"
        >
          {storyAudio.isPending ? <Loader2 size={12} className="animate-spin" /> : <Headphones size={12} />}
          Listen
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          disabled={toggleSaved.isPending}
          className={`tap flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
            isSaved ? 'border-accent/40 bg-accent/10 text-accent' : 'border-line bg-card2 text-muted hover:text-ink'
          }`}
        >
          {isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
