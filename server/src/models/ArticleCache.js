import mongoose from 'mongoose';

// MongoDB is the app's article cache (not the source of news - GDELT is).
// Docs expire after 7 days; the scheduler also prunes orphaned audio files.
const articleCacheSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    source: { type: String, default: '' },
    provider: { type: String, default: 'gdelt' },
    publishedAt: { type: Date, default: Date.now, index: true },
    imageUrl: { type: String, default: '' },
    language: { type: String, default: 'eng' },
    sourceCountry: { type: String, default: '' },
    categories: { type: [String], default: [] },
    aiSummary: { type: String, default: '' },
    audioFileId: { type: mongoose.Schema.Types.ObjectId },
    audioDurationSec: { type: Number },
    fetchedAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

articleCacheSchema.index({ lastSeenAt: 1 }, { expires: '7d' });

export default mongoose.model('ArticleCache', articleCacheSchema);
