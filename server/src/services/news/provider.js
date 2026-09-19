// Google News RSS provider - the single news source for this build.
//
// Quotas / reliability notes:
// - Google News RSS is unofficial (no SLA), returns ~30-100 items per query.
// - We stay polite: a minimal per-request throttle is enforced inside fetchGoogleNewsRss.
// - We fetch ONE query per view (combined interest query, category query, or search
//   term). If you ever see empty results, retry the refresh - transient 5xx is retried.

import https from "node:https";

const SEARCH_BASE = "https://news.google.com/rss/search";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";

// Keep it polite. Google doesn't publish an official limit for the RSS endpoint.
const MIN_INTERVAL_MS = 1200;

const agent = new https.Agent({ keepAlive: false, maxSockets: 3 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let gate = Promise.resolve();
let lastRequestAt = 0;

function throttle() {
  gate = gate.then(async () => {
    const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  });
  return gate;
}

function httpsGet(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": UA,
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        agent,
      },
      (res) => {
        // Follow one redirect (Google occasionally redirects the feed endpoint).
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          resolve({
            status: res.statusCode,
            location: res.headers.location,
            body: "",
          });
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () =>
          resolve({
            status: res.statusCode || 0,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
        res.on("error", reject);
      },
    );
    req.setTimeout(timeoutMs, () =>
      req.destroy(new Error(`RSS request timed out after ${timeoutMs}ms`)),
    );
    req.on("error", reject);
  });
}

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#8217": "\u2019",
  "#8216": "\u2018",
  "#8220": "\u201c",
  "#8221": "\u201d",
  "#8211": "\u2013",
  "#8212": "\u2014",
};

function decodeEntities(s = "") {
  return String(s).replace(/&([^;]+);/g, (_, name) => ENTITIES[name] ?? "");
}

// Pull one tag's text out of an <item> block, unwrapping CDATA.
function tagText(block, tag) {
  const m = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i").exec(
    block,
  );
  if (!m) return "";
  return decodeEntities(
    m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"),
  ).trim();
}

// <source url="https://www.thehindu.com">The Hindu</source>
function sourceInfo(block) {
  const m = /<source[^>]*url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/i.exec(block);
  if (m)
    return {
      url: decodeEntities(m[1].trim()),
      name: decodeEntities(m[2]).trim(),
    };
  return { url: "", name: tagText(block, "source") };
}

export function parseRssItems(xml = "") {
  const blocks = String(xml).match(/<item>[\s\S]*?<\/item>/gi) || [];
  return blocks
    .map((block) => ({
      title: tagText(block, "title"),
      link: tagText(block, "link"),
      pubDate: tagText(block, "pubDate"),
      sourceUrl: sourceInfo(block).url,
      sourceName: sourceInfo(block).name,
    }))
    .filter((it) => it.title && it.link);
}

/**
 * Google News RSS treats parentheses as literal characters, so drop any that
 * survive from interest/category query building and trim to a length Google
 * accepts, cutting on an OR boundary so we never send a dangling operator.
 */
export function normalizeQueryForRss(query = "", maxLength = 280) {
  const s = String(query).replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  if (s.length <= maxLength) return s;

  const parts = s.split(/\s+OR\s+/i);
  const kept = [];
  let length = 0;
  for (const p of parts) {
    const next = length + p.length + 4;
    if (kept.length && next > maxLength) break;
    kept.push(p);
    length = next;
  }
  return (kept.length ? kept.join(" OR ") : s.slice(0, maxLength)).trim();
}
export async function fetchGoogleNewsRss({
  query,
  language = "en",
  india = true,
  timeoutMs = 15000,
  retries = 1,
} = {}) {
  const terms = normalizeQueryForRss(query);
  if (!terms) return [];

  const lang = language === "hi" ? "hi" : "en";
  const gl = india ? "IN" : "US";
  const hl = india ? `${lang}-IN` : `${lang}-US`;

  const params = new URLSearchParams({
    q: terms,
    hl,
    gl,
    ceid: `${gl}:${lang}`,
  });
  const url = `${SEARCH_BASE}?${params.toString()}`;

  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await throttle();
    try {
      let res = await httpsGet(url, timeoutMs);
      if (res.location) res = await httpsGet(res.location, timeoutMs);

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`RSS ${res.status}`);
        if (attempt < retries) {
          await sleep(1500 * (attempt + 1));
          continue;
        }
        throw lastErr;
      }
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`RSS ${res.status} for "${terms.slice(0, 80)}"`);
      }
      return parseRssItems(res.body);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) throw err;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr || new Error("RSS request failed");
}
