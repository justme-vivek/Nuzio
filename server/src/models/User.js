import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // No path-level `sparse` here: Mongoose would implicitly create a second
    // index. The single unique+sparse index is declared below.
    googleId: { type: String },
    name: { type: String, default: '' },
    email: { type: String, lowercase: true, trim: true, index: true },
    avatar: { type: String, default: '' },
    onboardingCompleted: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', userSchema);
