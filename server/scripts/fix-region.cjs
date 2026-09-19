const fs = require('fs');
const path = 'src/services/news/news.service.js';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const replacement = [
  "  }",
  "",
  "  return withCategories.slice(0, limit);",
  "}",
  "",
  "// Personalized candidate pool for the daily briefing.",
  "//",
  "// Resilience ladder (never returns empty while any real story is available):",
  "//   1. ONE combined RSS query across all interests (quoted phrases + OR, no parens)",
  "//   2. per-interest RSS queries, retried once (only if #1 was empty)",
  "//   3. a broad live query                          (only if #2 was empty)",
  "//   4. real stories from our MongoDB cache (72h)  (if the RSS endpoint is down)",
  "export async function getForInterests(prefs = {}, { limit = 18 } = {}) {",
  "  const interestIds = (prefs.interests || []).filter((i) => INTEREST_QUERIES[i]);",
  "  const queries = interestIds.map((i) => INTEREST_QUERIES[i]);",
  "  let docs = [];",
  "",
  "  // 1. Combined single-request pass.",
  "  if (queries.length) {",
  "    const combined = queries.join(' OR ');",
  "    try {",
  "      const ids = await fetchArticles(combined, { hoursWindow: 36, maxRecords: 100 });",
  "      docs = dedupeArticles(await loadDocs(ids));",
  "    } catch (err) {",
  "      console.warn(`[news] combined interest query failed: ${err.message}`);",
  "    }",
  "  }",
  "",
  "  // 2. Per-interest queries when the combined pass came back empty.",
  "  if (!docs.length && queries.length) {",
  "    const ids = [];",
  "    const failed = [];",
  "    for (const q of queries.slice(0, 6)) {",
  "      try {",
  "        ids.push(...(await fetchArticles(q, { hoursWindow: 36, maxRecords: 60 })));",
  "      } catch (err) {",
  "        console.warn(`[news] interest query failed (${q}): ${err.message}`);",
  "        failed.push(q);",
  "      }",
  "      await sleep(STAGGER_MS);",
  "      if (new Set(ids.map(String)).size >= limit * 3) break;",
  "    }",
  "    // One retry pass for queries that errored.",
  "    for (const q of failed) {",
  "      try {",
  "        ids.push(...(await fetchArticles(q, { hoursWindow: 36, maxRecords: 60 })));",
  "      } catch (err) {",
  "        console.warn(`[news] interest query retry failed (${q}): ${err.message}`);",
  "      }",
  "      await sleep(STAGGER_MS);",
  "      if (new Set(ids.map(String)).size >= limit * 3) break;",
  "    }",
  "    docs = dedupeArticles(await loadDocs([...new Set(ids.map(String))]));",
  "  }",
  "",
  "  // 3. Broad live query (also covers the \"no interests chosen\" case).",
  "  if (!docs.length) {",
  "    console.warn('[news] interest queries produced nothing - trying the broad live query');",
  "    try {",
  "      const ids = await fetchArticles(DEFAULT_QUERY, { hoursWindow: 48, maxRecords: 100 });",
  "      docs = dedupeArticles(await loadDocs(ids));",
  "    } catch (err) {",
  "      console.warn(`[news] broad query failed: ${err.message}`);",
  "    }",
  "  }",
  "",
  "  // 4. Our own cache of real, previously fetched stories.",
  "  if (!docs.length) {",
  "    docs = dedupeArticles(await getRecentCachedArticles({ hours: 72, limit: 120 }));",
  "    if (docs.length) {",
  "      console.warn(`[news] no live source available - serving ${docs.length} previously cached story(ies)`);",
  "    }",
  "  }",
  "",
  "  return { articles: rankAndDiversify(docs, prefs, limit) };",
  "}",
  "",
  "/**",
  " * Seed MongoDB with real stories so the offline fallback is never cold.",
].join('\n');

// Replace region: 0-based [154..212] inclusive (lines 155..213)
const start = 154;
const end = 212;
if (start < 0 || end >= lines.length) {
  console.error('region out of range', start, end, lines.length);
  process.exit(1);
}
const before = lines.slice(0, start);
const after = lines.slice(end + 1);
const out = before.concat(replacement, after);
fs.writeFileSync(path, out.join('\n'), 'utf8');
console.log('rewrote lines ' + (start + 1) + '..' + (end + 1) + ' -> ' + out.length + ' total lines');
