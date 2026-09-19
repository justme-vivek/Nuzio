import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import Preference from "../models/Preference.js";
import Subscription from "../models/Subscription.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { env, flags } from "../config/env.js";
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from "../middleware/auth.middleware.js";

const googleClient = new OAuth2Client();

export function publicUser(u) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    onboardingCompleted: u.onboardingCompleted,
  };
}

// POST /api/v1/auth/google { credential }  (Google Identity Services ID token)
export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) throw new ApiError(400, "Missing Google credential");
  if (!flags.googleConfigured()) {
    throw new ApiError(
      503,
      "GOOGLE_CLIENT_ID is not configured on the server (server/.env)",
    );
  }

  // A malformed/expired/audience-mismatched token must be a 401, not a 500.
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
  } catch (err) {
    console.warn(`[auth] Google token verification failed: ${err?.message}`);
    throw new ApiError(401, "Google sign-in failed. Please try again.");
  }

  const p = ticket.getPayload();
  if (!p?.sub || !p?.email)
    throw new ApiError(401, "Invalid Google credential");

  let user = await User.findOne({
    $or: [{ googleId: p.sub }, { email: p.email.toLowerCase() }],
  });

  if (!user) {
    user = await User.create({
      googleId: p.sub,
      name: p.name || "Listener",
      email: p.email.toLowerCase(),
      avatar: p.picture || "",
      lastLoginAt: new Date(),
    });
    await Preference.create({ user: user._id });
    await Subscription.create({ user: user._id });
  } else {
    user.lastLoginAt = new Date();
    if (!user.googleId) user.googleId = p.sub;
    if (p.picture && !user.avatar) user.avatar = p.picture;
    if (p.name && (!user.name || user.name === "Listener")) user.name = p.name;
    await user.save();
  }

  const token = signToken(user._id);
  setAuthCookie(res, token);
  res.json({ ok: true, user: publicUser(user), token });
});

// GET /api/v1/auth/me
export const me = asyncHandler(async (req, res) => {
  let pref = await Preference.findOne({ user: req.user._id });
  if (!pref) pref = await Preference.create({ user: req.user._id });
  res.json({ ok: true, user: publicUser(req.user), preferences: pref });
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});
