import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { publicUser } from './auth.controller.js';

// GET /api/v1/users/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ ok: true, user: publicUser(req.user) });
});

// PATCH /api/v1/users/me  { name?, avatar?, onboardingCompleted? }
export const patchMe = asyncHandler(async (req, res) => {
  const { name, avatar, onboardingCompleted } = req.body || {};

  if (typeof name === 'string' && name.trim()) req.user.name = name.trim().slice(0, 60);
  if (typeof avatar === 'string' && avatar.length < 2048) req.user.avatar = avatar;
  if (onboardingCompleted === true) req.user.onboardingCompleted = true;

  await req.user.save();
  res.json({ ok: true, user: publicUser(req.user) });
});

// GET /api/v1/users/onboarding-status
export const onboardingStatus = asyncHandler(async (req, res) => {
  res.json({ ok: true, onboardingCompleted: req.user.onboardingCompleted });
});

export { ApiError };
