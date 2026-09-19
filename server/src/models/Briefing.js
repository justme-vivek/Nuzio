import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'ArticleCache' },
    title: { type: String, default: '' },
    source: { type: String, default: '' },
    url: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    summary: { type: String, default: '' },
    script: { type: String, default: '' },
    category: { type: String, default: '' },
    startSec: { type: Number, default: null },
  },
  { _id: false }
);

const briefingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    language: { type: String, default: 'en' },
    duration: { type: Number, default: 5 },
    voiceKey: { type: String, default: 'aria' },
    title: { type: String, default: 'Morning Brief' },
    greeting: { type: String, default: '' },
    closing: { type: String, default: '' },
    script: { type: String, default: '' },
    stories: { type: [storySchema], default: [] },
    audioFileId: { type: mongoose.Schema.Types.ObjectId },
    audioSizeBytes: { type: Number },
    audioDurationSec: { type: Number },
    wordCount: { type: Number },
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating', index: true },
    error: { type: String, default: '' },
    readyAt: { type: Date },
  },
  { timestamps: true }
);

briefingSchema.index({ user: 1, dateKey: 1, createdAt: -1 });

export default mongoose.model('Briefing', briefingSchema);
