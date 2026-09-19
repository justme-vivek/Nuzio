import { z } from 'zod';
import Preference from '../models/Preference.js';
import Briefing from '../models/Briefing.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import {
  getTodayBriefing,
  generateBriefingForUser,
  storiesForDuration,
} from '../services/briefing/briefing.service.js';
import { shapeBriefing } from '../services/briefing/briefing.helpers.js';

const generateSchema = z.object({
  duration: z.coerce.number().int().min(3).max(15).optional(),
});

// GET /api/v1/briefings/today
export const getToday = asyncHandler(async (req, res) => {
  const pref = (await Preference.findOne({ user: req.user._id })) || { timezone: 'Asia/Kolkata' };
  const briefing = await getTodayBriefing(req.user._id, pref.timezone);

  if (!briefing) return res.json({ ok: true, briefing: null, storiesPlanned: storiesForDuration(pref.briefingDuration || 5) });

  res.json({ ok: true, briefing: shapeBriefing(briefing) });
});

// POST /api/v1/briefings/generate  { duration? }
export const generate = asyncHandler(async (req, res) => {
  const parsed = generateSchema.safeParse(req.body || {});
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid duration');

  const briefing = await generateBriefingForUser(req.user._id, { duration: parsed.data.duration });
  res.json({ ok: true, briefing: shapeBriefing(briefing) });
});

// GET /api/v1/briefings
export const listBriefings = asyncHandler(async (req, res) => {
  const briefings = await Briefing.find({ user: req.user._id, status: 'ready' })
    .sort({ createdAt: -1 })
    .limit(30);
  res.json({ ok: true, briefings: briefings.map(shapeBriefing) });
});

// GET /api/v1/briefings/:id
export const getBriefing = asyncHandler(async (req, res) => {
  const briefing = await Briefing.findOne({ _id: req.params.id, user: req.user._id });
  if (!briefing) throw new ApiError(404, 'Briefing not found');
  res.json({ ok: true, briefing: shapeBriefing(briefing) });
});
