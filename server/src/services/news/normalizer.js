import { parseGdeltDate, parseRssDate } from '../../utils/date.js';

// GDELT titles sometimes end with " - Publisher"; strip it for cleaner cards.
function cleanTitle(raw = '') {
  let t = String(raw).trim();
  t = t.replace(/\s+-\s+[^-]{2,60}$/, '');
  return t.replace(/\s+/g, ' ').trim();
}

// Google News headlines are always suffixed with " - Publisher".
function publisherFromTitle(raw = '') {
  const m = /\s+-\s+([^-]{2,60})$/.exec(String(raw).trim());
  return m ? m[1].trim().toLowerCase() : '';
}

function hostnameOf(url = '') {
  if (!/^https?:\/\//i.test(url)) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function normalizeGdeltArticle(a = {}) {
  const url = a.url || a.url_mobile || '';
  const title = cleanTitle(a.title || '');
  if (!url || !title) return null;
  if (!/^https?:\/\//i.test(url)) return null;

  const source = hostnameOf(url) || String(a.domain || '').toLowerCase();
  if (!source) return null;

  const image = a.socialimage && /^https?:\/\//i.test(String(a.socialimage)) ? a.socialimage : '';

  return {
    url,
    title,
    source,
    publishedAt: parseGdeltDate(a.seendate),
    imageUrl: image,
    language: a.language || 'eng',
    sourceCountry: a.sourcecountry || '',
    provider: 'gdelt',
  };
}

/**
 * Normalize a Google News RSS item into the same shape as a GDELT article, so
 * everything downstream (dedupe, ranking, briefing, storage) is provider-blind.
 *
 * Google News aggregates real publishers, so attribution is preserved: the
 * `<source url="https://www.thehindu.com">The Hindu</source>` tag gives us the
 * publisher domain, with the headline suffix as a last resort.
 */
export function normalizeRssItem(item = {}) {
  const url = String(item.link || '').trim();
  const title = cleanTitle(item.title || '');
  if (!url || !title) return null;
  if (!/^https?:\/\//i.test(url)) return null;

  const source =
    hostnameOf(item.sourceUrl) ||
    String(item.sourceName || '').trim().toLowerCase() ||
    publisherFromTitle(item.title) ||
    'news.google.com';

  return {
    url,
    title,
    source,
    publishedAt: parseRssDate(item.pubDate),
    // Google News RSS carries no image, and the card falls back to a monogram.
    imageUrl: '',
    language: 'eng',
    sourceCountry: '',
    provider: 'rss',
  };
}
