import mongoose from 'mongoose';

// Narrator personas. "providerVoiceId" is the Edge TTS (Microsoft neural) voice
// used for English; "hindiVoiceId" is used when the briefing language is Hindi.
// previews.<lang> holds the GridFS file id of the generated 10-second sample.
const voiceSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, default: 'Female' },
    accent: { type: String, default: '' },
    description: { type: String, default: '' },
    tag: { type: String, default: 'EN' },
    languages: { type: [String], default: ['en'] },
    providerVoiceId: { type: String, required: true },
    hindiVoiceId: { type: String, default: '' },
    active: { type: Boolean, default: true },
    previews: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('Voice', voiceSchema);
