import { z } from 'zod';
import Preference from '../models/Preference.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

const patchSchema = z
  .object({
    language: z.enum(['en', 'hi']).optional(),
    locationEnabled: z.boolean().optional(),
    profession: z.string().max(40).optional(),
    interests: z.array(z.string().max(40)).max(7).optional(),
    voiceKey: z.string().max(20).optional(),
    briefingDuration: z.coerce.number().int().min(3).max(15).optional(),
    briefingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24h)').optional(),
    timezone: z.string().max(64).optional(),
    theme: z.enum(['dark', 'light']).optional(),
    notifications: z
      .object({
        morningBrief: z.boolean().optional(),
        breakingStory: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
      })
      .optional(),
    audio: z
      .object({
        autoAdvance: z.boolean().optional(),
        playbackSpeed: z.number().min(0.5).max(2.5).optional(),
        offlineMode: z.boolean().optional(),
      })
      .optional(),
  })
  .strict();

// GET /api/v1/preferences
export const getPreferences = asyncHandler(async (req, res) => {
  let pref = await Preference.findOne({ user: req.user._id });
  if (!pref) pref = await Preference.create({ user: req.user._id });
  res.json({ ok: true, preferences: pref });
});

// PATCH /api/v1/preferences
export const patchPreferences = asyncHandler(async (req, res) => {
  const parsed = patchSchema.safeParse(req.body || {});
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid preferences');
  }

  let pref = await Preference.findOne({ user: req.user._id });
  if (!pref) pref = await Preference.create({ user: req.user._id });

  const data = parsed.data;
  for (const key of ['language', 'locationEnabled', 'profession', 'interests', 'voiceKey', 'briefingDuration', 'briefingTime', 'timezone', 'theme']) {
    if (data[key] !== undefined) pref[key] = data[key];
  }
  if (data.notifications) {
    pref.notifications = { ...pref.notifications.toObject?.() ?? pref.notifications, ...data.notifications };
  }
  if (data.audio) {
    pref.audio = { ...pref.audio.toObject?.() ?? pref.audio, ...data.audio };
  }

  await pref.save();
  res.json({ ok: true, preferences: pref });
});
