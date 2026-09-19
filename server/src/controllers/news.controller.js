import ArticleCache from '../models/ArticleCache.js';
import Preference from '../models/Preference.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  getByCategory,
  searchNews,
  toClientArticle,
  queueAiSummaries,
} from '../services/news/news.service.js';
import { CATEGORIES } from '../services/news/interests.js';
import { summarizeStories } from '../services/ai/summarizer.js';
import { synthesize, providerVoiceFor } from '../services/tts/tts.service.js';
import { uploadAudio, getAudioFileInfo, openAudioStream } from '../services/audio/storage.service.js';
import { relativeTime } from '../utils/date.js';

// GET /api/v1/news?category=&q=&limit=
export const listNews = asyncHandler(async (req, res) => {
  const limit = Math.min(48, Number(req.query.limit) || 18);
  const category = String(req.query.category || '').trim();
  const q = String(req.query.q || '').trim();

  let docs;
  if (q) {
    docs = await searchNews(q, { limit });
  } else if (category) {
    docs = await getByCategory(category, { limit });
  } else {
    docs = await getByCategory('', { limit });
  }

  // Richen cards in the background (AI summaries cached on the article docs).
  if (!q) queueAiSummaries(docs, (pending) => summarizeStories(pending).then((out) => {
    return Promise.all(
      out.map((o) =>
        ArticleCache.updateOne(
          { _id: o.article._id },
          { $set: { aiSummary: o.summary, categories: o.article.categories?.length ? o.article.categories : [o.category].filter(Boolean) } }
        ).then(() => o)
      )
    );
  }));

  res.json({
    ok: true,
    articles: docs.map(toClientArticle),
    relative: (docs[0] && relativeTime(docs[0].publishedAt)) || '',
  });
});

// GET /api/v1/news/categories
export const getCategories = asyncHandler(async (req, res) => {
  res.json({ ok: true, categories: CATEGORIES });
});

// GET /api/v1/news/:id
export const getArticle = asyncHandler(async (req, res) => {
  const doc = await ArticleCache.findById(req.params.id);
  if (!doc) throw new ApiError(404, 'Article not found');
  res.json({ ok: true, article: toClientArticle(doc) });
});

// GET /api/v1/search?q=
export const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ ok: true, articles: [] });
  const docs = await searchNews(q, { limit: 24 });
  res.json({ ok: true, articles: docs.map(toClientArticle) });
});

// GET /api/v1/news/:id/audio - 30-second AI summary clip, cached per article.
export const getStoryAudio = asyncHandler(async (req, res) => {
  const doc = await ArticleCache.findById(req.params.id);
  if (!doc) throw new ApiError(404, 'Article not found');

  if (doc.audioFileId) {
    const info = await getAudioFileInfo(doc.audioFileId).catch(() => null);
    if (info) {
      return res.json({
        ok: true,
        audioFileId: String(doc.audioFileId),
        summary: doc.aiSummary || '',
        durationSec: doc.audioDurationSec || 0,
      });
    }
  }

  const pref = await Preference.findOne({ user: req.user._id });

  const [summarized] = await summarizeStories([doc]);
  const summary = summarized.summary || doc.title;
  const voice = providerVoiceFor(pref?.voiceKey || 'aria', pref?.language || 'en');
  const { audio } = await synthesize({ text: summary, voice });

  const fileId = await uploadAudio(audio, `story-${doc._id}.mp3`, {
    kind: 'story_clip',
    articleId: String(doc._id),
  });

  const estSec = Math.round((summary.split(/\s+/).length / 150) * 60);
  await ArticleCache.updateOne(
    { _id: doc._id },
    { $set: { audioFileId: fileId, aiSummary: summary, audioDurationSec: estSec } }
  );

  res.json({ ok: true, audioFileId: String(fileId), summary, durationSec: estSec });
});

export { openAudioStream };
