import { api } from './api.js';

export async function getTodayBriefing() {
  const { data } = await api.get('/briefings/today');
  return data; // { briefing | null, storiesPlanned }
}

export async function generateBriefing(duration) {
  const { data } = await api.post('/briefings/generate', duration ? { duration } : {}, {
    timeout: 300_000,
  });
  return data.briefing;
}

export async function getBriefing(id) {
  const { data } = await api.get(`/briefings/${id}`);
  return data.briefing;
}
