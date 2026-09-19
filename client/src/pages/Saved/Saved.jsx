import { useSaved } from '../../hooks/useNews.js';
import NewsCard from '../../components/NewsCard/NewsCard.jsx';

export default function Saved() {
  const { data: saved = [], isLoading } = useSaved();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Saved <span className="serif-accent text-primary">stories</span>
        </h1>
        <p className="mt-1 text-sm text-muted">{saved.length ? `${saved.length} story${saved.length > 1 ? 'ies' : ''} for later` : 'Your reading & listening list'}</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-card" />
          ))}
        </div>
      )}

      {!isLoading && saved.length === 0 && (
        <div className="rounded-2xl border border-line bg-card p-6 text-center">
          <p className="text-2xl">🔖</p>
          <p className="mt-2 text-sm text-muted">Nothing saved yet. Tap ☆ on any story to keep it here.</p>
        </div>
      )}

      <div className="space-y-3">
        {saved.map((s) => (
          <NewsCard
            key={s.id}
            article={{
              id: s.articleId,
              title: s.title,
              source: s.source,
              url: s.url,
              imageUrl: s.imageUrl,
              publishedAt: s.savedAt,
              categories: s.category ? [s.category] : [],
              aiSummary: s.summary,
            }}
            saved
          />
        ))}
      </div>
    </div>
  );
}
