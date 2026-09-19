// Text helpers for deduplication and time estimation.

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'for', 'to', 'with',
  'at', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'it',
  'its', 'this', 'that', 'these', 'those', 'over', 'after', 'before', 'amid',
  'amid', 'new', 'report', 'reports', 'say', 'says', 'said', 'will', 'may',
]);

export function normalizeTitle(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titleTokens(title = '') {
  return normalizeTitle(title)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function trigrams(str = '') {
  const s = normalizeTitle(str);
  const set = new Set();
  for (let i = 0; i < s.length - 2; i += 1) set.add(s.slice(i, i + 3));
  return set;
}

export function trigramSimilarity(a, b) {
  const A = trigrams(a);
  const B = trigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter += 1;
  return inter / Math.min(A.size, B.size);
}

export function jaccardTokens(a, b) {
  const A = new Set(titleTokens(a));
  const B = new Set(titleTokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  const union = new Set([...A, ...B]).size;
  return inter / union;
}

export function similarity(a, b) {
  return Math.max(trigramSimilarity(a, b), jaccardTokens(a, b));
}

export function normalizeForMatch(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ~150 spoken words per minute for a calm narrator.
export function estimateSecondsFromWords(words = 0) {
  return Math.max(30, Math.round((words / 150) * 60));
}

export function firstName(name = '') {
  return String(name || '').trim().split(/\s+/)[0] || 'Friend';
}
