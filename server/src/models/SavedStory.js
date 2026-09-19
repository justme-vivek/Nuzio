import mongoose from 'mongoose';

const savedStorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ArticleCache', required: true },
    title: { type: String, default: '' },
    source: { type: String, default: '' },
    url: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    summary: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  { timestamps: true }
);

savedStorySchema.index({ user: 1, articleId: 1 }, { unique: true });

export default mongoose.model('SavedStory', savedStorySchema);
