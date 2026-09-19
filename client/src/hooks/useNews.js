import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNewsFeed,
  searchNews,
  getCategories,
  getStoryAudio,
  getSaved,
  saveStory,
  removeSavedStory,
  getVoices,
} from '../services/news.api.js';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: Infinity });
}

export function useNewsFeed({ category = '', q = '', enabled = true }) {
  return useQuery({
    queryKey: ['news', category, q],
    queryFn: () => (q ? searchNews(q) : getNewsFeed({ category, limit: 18 })),
    enabled,
    staleTime: 60_000,
  });
}

export function useVoices() {
  return useQuery({ queryKey: ['voices'], queryFn: getVoices, staleTime: 5 * 60_000 });
}

export function useSaved() {
  return useQuery({ queryKey: ['saved'], queryFn: getSaved });
}

export function useToggleSaved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ articleId, saved }) => {
      if (saved) return removeSavedStory(articleId);
      return saveStory(articleId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved'] }),
  });
}

export function useStoryAudio() {
  return useMutation({ mutationFn: (articleId) => getStoryAudio(articleId) });
}
