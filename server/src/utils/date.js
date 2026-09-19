// Time helpers. Nuzio stores a per-user timezone and works with the user's
// local calendar day ("dateKey") so the scheduler can deliver at local time.

export function toDateKey(date = new Date(), tz = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date); // YYYY-MM-DD
}

export function toLocalHHMM(date = new Date(), tz = 'Asia/Kolkata') {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date); // "07:05"
}

export function toLocalDateLabel(date = new Date(), tz = 'Asia/Kolkata') {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value || '';
  return { weekday: get('weekday').toUpperCase(), day: get('day'), month: get('month').toUpperCase() };
}

export function formatTime12(hhmm = '07:00') {
  const [h, m] = String(hhmm).split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

export function gdeltStamp(date) {
  // GDELT startdatetime/enddatetime format: YYYYMMDDHHMMSS (UTC)
  return date.toISOString().replace(/[-:]/g, '').replace('T', '').slice(0, 14);
}

export function parseGdeltDate(seen) {
  // "20260918T083000Z" -> Date
  if (!seen) return new Date();
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(String(seen));
  if (!m) return new Date();
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

export function parseRssDate(value) {
  // RSS pubDate is RFC-822, e.g. "Fri, 18 Sep 2026 08:30:00 GMT".
  if (!value) return new Date();
  const t = Date.parse(String(value).trim());
  if (Number.isNaN(t)) return new Date();
  const now = Date.now();
  // Broken feeds occasionally publish far-future dates; clamp them so a bad
  // timestamp can't outrank every real story during sorting.
  if (t > now + 3600000) return new Date(now);
  return new Date(t);
}

export function relativeTime(date, now = new Date()) {
  const diff = Math.max(0, now - new Date(date));
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
