import mongoose from 'mongoose';

// Billing is intentionally out of scope for this build: this model only
// records the plan state shown in the UI (always "free" for now).
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan: { type: String, enum: ['free', 'pro', 'pro_annual'], default: 'free' },
    status: { type: String, default: 'active' },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Subscription', subscriptionSchema);
