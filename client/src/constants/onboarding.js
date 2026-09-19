export const PROFESSIONS = [
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'finance-trading', label: 'Finance & Trading', icon: '💼' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'consulting', label: 'Consulting', icon: '📊' },
  { id: 'marketing-media', label: 'Marketing & Media', icon: '📣' },
  { id: 'government-policy', label: 'Government & Policy', icon: '🏛️' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'founder-builder', label: 'Founder / Builder', icon: '🚀' },
];

export const INTERESTS = [
  { id: 'ai-tech', label: 'AI & Technology', icon: '🤖' },
  { id: 'financial-markets', label: 'Financial Markets', icon: '📈' },
  { id: 'indian-business', label: 'Indian Business', icon: '🇮🇳' },
  { id: 'global-politics', label: 'Global Politics', icon: '🌐' },
  { id: 'startups', label: 'Startups', icon: '🚀' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'health-medicine', label: 'Health & Medicine', icon: '🩺' },
  { id: 'climate-energy', label: 'Climate & Energy', icon: '🌱' },
  { id: 'sports', label: 'Sports', icon: '🏏' },
  { id: 'culture-arts', label: 'Culture & Arts', icon: '🎭' },
  { id: 'legal-policy', label: 'Legal & Policy', icon: '⚖️' },
];

export const MAX_INTERESTS = 7;

export const DURATIONS = [5, 10, 15];

export const STORY_COUNTS = { 5: 5, 10: 6, 15: 8 };

export function storiesForDuration(d) {
  if (STORY_COUNTS[d]) return STORY_COUNTS[d];
  return Math.max(3, Math.min(9, Math.round(d / 2)));
}

// 4:30 AM .. 9:30 AM in 30-min steps, rendered as 12h labels.
export const TIME_SLOTS = (() => {
  const slots = [];
  for (let m = 4 * 60 + 30; m <= 9 * 60 + 30; m += 30) {
    const h24 = Math.floor(m / 60);
    const mm = String(m % 60).padStart(2, '0');
    const ap = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    slots.push({ value: `${String(h24).padStart(2, '0')}:${mm}`, label: `${h12}:${mm}`, ap });
  }
  return slots;
})();

export const NOTIFICATION_TYPES = [
  {
    id: 'morningBrief',
    icon: '☀️',
    title: 'Morning brief ready',
    message: 'Your daily audio summary is waiting',
    badge: 'Daily',
  },
  {
    id: 'breakingStory',
    icon: '⚡',
    title: 'Breaking story',
    message: 'A major story just broke in your niches',
    badge: 'When it happens',
  },
  {
    id: 'weeklyDigest',
    icon: '📰',
    title: 'Weekly digest',
    message: 'The most-read stories from this week',
    badge: 'Sundays',
  },
];

export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatTime12(hhmm = '07:00') {
  const [h, m] = String(hhmm).split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

export function formatDuration(sec = 0) {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export const CATEGORY_LABELS = {
  technology: 'Technology',
  ai: 'AI & Tech',
  business: 'Business',
  finance: 'Markets',
  startups: 'Startups',
  politics: 'Politics',
  science: 'Science',
  health: 'Health',
  climate: 'Climate',
  sports: 'Sports',
  culture: 'Culture',
};
