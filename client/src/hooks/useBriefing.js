import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTodayBriefing, generateBriefing } from '../services/briefing.api.js';

export function useTodayBriefing() {
  return useQuery({
    queryKey: ['briefing', 'today'],
    queryFn: getTodayBriefing,
    // Poll while a brief is being generated (or planned but missing).
    refetchInterval: (query) => {
      const b = query?.state?.data?.briefing;
      return b && b.status === 'generating' ? 4000 : false;
    },
  });
}

export function useGenerateBriefing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ duration } = {}) => generateBriefing(duration),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['briefing'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
