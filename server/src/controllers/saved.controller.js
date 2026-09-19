import { z } from 'zod';
import SavedStory from '../models/SavedStory.js';
import ArticleCache from '../models/ArticleCache.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid article id');

// GET /api/v1/saved
export const listSaved = asyncHandler(async (req, res) => {
  const items = await SavedStory.find({ user: req.user._id }).sort({ savedAt: -1 });
  res.json({
    ok: true,
    saved: items.map((s) => ({
      id: String(s._id),
      articleId: String(s.articleId),
      title: s.title,
      source: s.source,
      url: s.url,
      imageUrl: s.imageUrl,
      summary: s.summary,
      category: s.category,
      savedAt: s.savedAt,
    })),
  });
});

// POST /api/v1/saved/:articleId
export const addSaved = asyncHandler(async (req, res) => {
  const parsed = idSchema.safeParse(req.params.articleId);
  if (!parsed.success) throw new ApiError(400, 'Invalid article id');

  const article = await ArticleCache.findById(parsed.data);
  if (!article) throw new ApiError(404, 'Article not found (it may have expired from the cache)');

  const saved = await SavedStory.findOneAndUpdate(
    { user: req.user._id, articleId: article._id },
    {
      $setOnInsert: {
        user: req.user._id,
        articleId: article._id,
        title: article.title,
        source: article.source,
        url: article.url,
        imageUrl: article.imageUrl,
        summary: article.aiSummary || '',
        category: article.categories?.[0] || '',
        savedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  );

  res.json({ ok: true, saved: { id: String(saved._id), articleId: String(article._id) } });
});

// DELETE /api/v1/saved/:articleId
export const removeSaved = asyncHandler(async (req, res) => {
  const parsed = idSchema.safeParse(req.params.articleId);
  if (!parsed.success) throw new ApiError(400, 'Invalid article id');
  await SavedStory.deleteOne({ user: req.user._id, articleId: parsed.data });
  res.json({ ok: true });
});
