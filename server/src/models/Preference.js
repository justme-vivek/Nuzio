import mongoose from 'mongoose';

const preferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    locationEnabled: { type: Boolean, default: false },
    profession: { type: String, default: '' },
    interests: { type: [String], default: [] },
    voiceKey: { type: String, default: 'aria' },
    briefingDuration: { type: Number, default: 5, min: 3, max: 15 },
    briefingTime: { type: String, default: '07:00' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    notifications: {
      morningBrief: { type: Boolean, default: true },
      breakingStory: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
    audio: {
      autoAdvance: { type: Boolean, default: true },
      playbackSpeed: { type: Number, default: 1 },
      offlineMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Preference', preferenceSchema);
