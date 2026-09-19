import { api } from './api.js';

export async function getCategories() {
  const { data } = await api.get('/news/categories');
  return data.categories;
}

export async function getNewsFeed({ category = '', q = '', limit = 18 } = {}) {
  const { data } = await api.get('/news', { params: { category, q, limit } });
  return data.articles || [];
}

export async function searchNews(q) {
  const { data } = await api.get('/search', { params: { q } });
  return data.articles || [];
}

export async function getStoryAudio(articleId) {
  const { data } = await api.get(`/news/${articleId}/audio`, { timeout: 120_000 });
  return data; // { audioFileId, summary, durationSec }
}

export async function getVoices() {
  const { data } = await api.get('/voices');
  return data.voices || [];
}

export async function getSaved() {
  const { data } = await api.get('/saved');
  return data.saved || [];
}

export async function saveStory(articleId) {
  const { data } = await api.post(`/saved/${articleId}`);
  return data;
}

export async function removeSavedStory(articleId) {
  const { data } = await api.delete(`/saved/${articleId}`);
  return data;
}
