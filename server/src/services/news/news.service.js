import ArticleCache from "../../models/ArticleCache.js";
import { fetchGoogleNewsRss } from "./provider.js";
import { normalizeRssItem } from "./normalizer.js";
import {
  INTEREST_QUERIES,
  INTEREST_KEYWORDS,
  PROFESSION_KEYWORDS,
  CATEGORY_QUERIES,
  categorize,
} from "./interests.js";

const QUERY_TTL_MS = 10 * 60 * 1000;
const STAGGER_MS = 250;
const DEFAULT_QUERY = '"top news" OR "breaking news" OR "world news"';
const queryCache = new Map();
const inflight = new Map();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function buildCombinedQuery(queries = []) {
  const valid = queries.filter(Boolean);
  return valid.length
    ? valid.map((query) => `(${query})`).join(" OR ")
    : DEFAULT_QUERY;
}

export async function getRecentCachedArticles({ hours = 72, limit = 40 } = {}) {
  if (!hours || !limit) return [];
  return ArticleCache.find({
    lastSeenAt: { $gte: new Date(Date.now() - hours * 3600000) },
  })
    .sort({ publishedAt: -1 })
    .limit(Math.max(1, limit));
}

async function persistArticles(articles) {
  if (!articles.length) return [];
  const now = new Date();
  await ArticleCache.bulkWrite(
    articles.map((article) => ({
      updateOne: {
        filter: { url: article.url },
        update: {
          $set: { ...article, lastSeenAt: now },
          $setOnInsert: { fetchedAt: now },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
  const docs = await ArticleCache.find({
    url: { $in: articles.map((article) => article.url) },
  }).select("_id url");
  const byUrl = new Map(docs.map((doc) => [doc.url, doc._id]));
  return articles.map((article) => byUrl.get(article.url)).filter(Boolean);
}

async function loadDocs(ids = []) {
  const docs = await ArticleCache.find({ _id: { $in: ids } });
  const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
  return ids.map((id) => byId.get(String(id))).filter(Boolean);
}

async function fetchArticles(query, options = {}) {
  const { maxRecords = 75, language = "en", india = true } = options;
  const key = `${query}|${options.hoursWindow || 36}|${language}|${india}`;
  const hit = queryCache.get(key);
  if (hit && Date.now() - hit.fetchedAt < QUERY_TTL_MS) return hit.ids;
  if (inflight.has(key)) return inflight.get(key);
  const request = (async () => {
    try {
      const raw = await fetchGoogleNewsRss({ query, language, india });
      const articles = raw
        .map(normalizeRssItem)
        .filter(Boolean)
        .slice(0, maxRecords);
      const ids = await persistArticles(articles);
      if (ids.length) queryCache.set(key, { ids, fetchedAt: Date.now() });
      return ids;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, request);
  return request;
}

function dedupe(docs) {
  const seen = new Set();
  return docs.filter((doc) => {
    const key = String(doc.url || doc._id);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function score(article = {}) {
  const age =
    (Date.now() - new Date(article.publishedAt || Date.now()).getTime()) /
    3600000;
  const source = String(article.source || "").toLowerCase();
  const trusted = [
    "reuters",
    "bbc",
    "apnews",
    "theguardian",
    "nytimes",
    "washingtonpost",
    "hindustantimes",
    "timesofindia",
    "hindu",
    "indianexpress",
  ];
  return (
    Math.max(0, 1 - age / 72) *
    (trusted.some((name) => source.includes(name)) ? 1.1 : 1)
  );
}

function preferenceScore(article, prefs) {
  let result = score(article);
  const title = String(article.title || "").toLowerCase();
  for (const interest of prefs.interests || []) {
    if (INTEREST_KEYWORDS[interest]?.some((keyword) => title.includes(keyword)))
      result += 3;
  }
  if (
    PROFESSION_KEYWORDS[prefs.profession]?.some((keyword) =>
      title.includes(keyword),
    )
  )
    result += 2;
  if (prefs.locationEnabled && article.sourceCountry === "India") result += 1;
  return result;
}

function rank(docs, prefs, limit) {
  const articles = docs
    .map((doc) => {
      const article =
        typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
      return {
        ...article,
        categories: article.categories?.length
          ? article.categories
          : categorize(article.title),
      };
    })
    .sort((a, b) => preferenceScore(b, prefs) - preferenceScore(a, prefs));
  for (const maxPerCategory of [2, 3, Infinity]) {
    const counts = new Map();
    const selected = [];
    for (const article of articles) {
      const categories = article.categories?.length
        ? article.categories
        : ["general"];
      if (
        Number.isFinite(maxPerCategory) &&
        categories.some(
          (category) => (counts.get(category) || 0) >= maxPerCategory,
        )
      )
        continue;
      categories.forEach((category) =>
        counts.set(category, (counts.get(category) || 0) + 1),
      );
      selected.push(article);
      if (selected.length >= limit) break;
    }
    if (selected.length >= Math.min(limit, articles.length)) return selected;
  }
  return articles.slice(0, limit);
}

export async function getForInterests(prefs = {}, { limit = 18 } = {}) {
  const queries = (prefs.interests || [])
    .filter((interest) => INTEREST_QUERIES[interest])
    .map((interest) => INTEREST_QUERIES[interest]);
  let docs = [];
  if (queries.length) {
    try {
      docs = dedupe(
        await loadDocs(
          await fetchArticles(buildCombinedQuery(queries), { maxRecords: 100 }),
        ),
      );
    } catch (err) {
      console.warn(`[news] combined interest query failed: ${err.message}`);
    }
  }
  if (!docs.length && queries.length) {
    const ids = [];
    const failed = [];
    for (const query of queries.slice(0, 6)) {
      try {
        ids.push(...(await fetchArticles(query, { maxRecords: 60 })));
      } catch (err) {
        failed.push(query);
        console.warn(`[news] interest query failed (${query}): ${err.message}`);
      }
      await sleep(STAGGER_MS);
      if (new Set(ids.map(String)).size >= limit * 3) break;
    }
    for (const query of failed) {
      try {
        ids.push(...(await fetchArticles(query, { maxRecords: 60 })));
      } catch (err) {
        console.warn(
          `[news] interest query retry failed (${query}): ${err.message}`,
        );
      }
      await sleep(STAGGER_MS);
    }
    docs = dedupe(await loadDocs([...new Set(ids.map(String))]));
  }
  if (!docs.length) {
    try {
      docs = dedupe(
        await loadDocs(await fetchArticles(DEFAULT_QUERY, { maxRecords: 100 })),
      );
    } catch (err) {
      console.warn(`[news] broad query failed: ${err.message}`);
    }
  }
  if (!docs.length)
    docs = dedupe(await getRecentCachedArticles({ hours: 72, limit: 120 }));
  return { articles: rank(docs, prefs, limit) };
}

export async function warmArticleCache({ minArticles = 40 } = {}) {
  const cached = await ArticleCache.estimatedDocumentCount().catch(() => 0);
  if (cached >= minArticles) return { warmed: false, cached };
  try {
    const ids = await fetchArticles(DEFAULT_QUERY, { maxRecords: 120 });
    const warmed = await ArticleCache.countDocuments({ _id: { $in: ids } });
    return { warmed: warmed >= minArticles, cached: warmed };
  } catch (err) {
    console.warn(`[news] warmArticleCache failed: ${err.message}`);
    return { warmed: false, cached };
  }
}

export async function getByCategory(categoryId, { limit = 18 } = {}) {
  let docs = [];
  if (categoryId) {
    try {
      const query = CATEGORY_QUERIES[categoryId] || `"${categoryId}"`;
      docs = dedupe(await loadDocs(await fetchArticles(query)));
    } catch (err) {
      console.warn(
        `[news] RSS category fetch failed (${categoryId}): ${err.message}`,
      );
    }
  }
  if (!docs.length) {
    const cached = await getRecentCachedArticles({ hours: 72, limit: 90 });
    docs = cached.filter((doc) =>
      (doc.categories?.length
        ? doc.categories
        : categorize(doc.title)
      ).includes(categoryId),
    );
    if (!docs.length) docs = cached;
  }
  return dedupe(docs)
    .map((doc) => ({
      ...(doc.toObject?.() || doc),
      categories: doc.categories?.length
        ? doc.categories
        : categorize(doc.title),
    }))
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

async function searchCachedArticles(term, limit) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");
  return dedupe(
    await ArticleCache.find({ $or: [{ title: regex }, { source: regex }] })
      .sort({ publishedAt: -1 })
      .limit(Math.max(1, limit)),
  );
}

export async function searchNews(q, { limit = 24 } = {}) {
  const term = String(q || "").trim();
  if (!term) return [];
  let ids = [];
  for (const query of [`"${term.replace(/"/g, "")}"`, term]) {
    try {
      ids = await fetchArticles(query, { maxRecords: 75 });
    } catch (err) {
      console.warn(`[news] search failed (${query}): ${err.message}`);
    }
    if (ids.length) break;
  }
  const docs = dedupe(await loadDocs(ids));
  return (docs.length ? docs : await searchCachedArticles(term, limit)).slice(
    0,
    limit,
  );
}

export function toClientArticle(doc) {
  return {
    id: String(doc._id),
    title: doc.title,
    source: doc.source,
    url: doc.url,
    imageUrl: doc.imageUrl || "",
    publishedAt: doc.publishedAt,
    categories: doc.categories || categorize(doc.title),
    aiSummary: doc.aiSummary || "",
    hasAudio: Boolean(doc.audioFileId),
  };
}

const summarizing = new Set();
export function queueAiSummaries(docs, summarizeFn, max = 12) {
  if (typeof summarizeFn !== "function") return;
  const pending = docs
    .filter((doc) => !doc.aiSummary && !summarizing.has(String(doc._id)))
    .slice(0, max);
  if (!pending.length) return;
  pending.forEach((doc) => summarizing.add(String(doc._id)));
  summarizeFn(pending)
    .catch(() => {})
    .finally(() =>
      pending.forEach((doc) => summarizing.delete(String(doc._id))),
    );
}
