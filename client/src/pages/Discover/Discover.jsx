import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useCategories, useNewsFeed } from '../../hooks/useNews.js';
import NewsCard from '../../components/NewsCard/NewsCard.jsx';
import Chip from '../../components/ui/Chip.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

export default function Discover() {
  const { data: categories = [] } = useCategories();
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQ(input.trim()), 450);
    return () => clearTimeout(t);
  }, [input]);

  const { data: articles = [], isLoading, isFetching } = useNewsFeed({ category, q });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Discover <span className="serif-accent text-primary">stories</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Search topics, sources and the world’s news.</p>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-3">
        <Search size={16} className="text-muted" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search stories, sources, topics…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Chip label="All" selected={!category} onClick={() => setCategory('')} />
        {categories.map((c) => (
          <Chip key={c.id} label={c.label} selected={category === c.id} onClick={() => setCategory(c.id)} />
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-card" />
          ))}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div className="rounded-2xl border border-line bg-card p-6 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 text-sm text-muted">
            {q ? `No current stories found for “${q}”.` : 'No stories in this category yet — try another one.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>

      {isFetching && !isLoading && (
        <div className="flex justify-center py-2">
          <Spinner size={18} />
        </div>
      )}
    </div>
  );
}
