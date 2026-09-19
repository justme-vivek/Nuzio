import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['morning_brief', 'breaking_story', 'weekly_digest'],
      default: 'morning_brief',
    },
    title: { type: String, default: '' },
    message: { type: String, default: '' },
    briefingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Briefing' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
