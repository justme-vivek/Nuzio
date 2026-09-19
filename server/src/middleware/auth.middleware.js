// JWT (httpOnly cookie) session middleware. Google Identity Services issues
// the ID token; we verify it server-side and mint our own session cookie.

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function signToken(uid) {
  return jwt.sign({ uid: String(uid) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function setAuthCookie(res, token) {
  res.cookie("nuzio_token", token, {
    httpOnly: true,
    sameSite: env.isProd ? "none" : "lax",
    secure: env.isProd,
    maxAge: 7 * 24 * 3600 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie("nuzio_token", {
    path: "/",
    sameSite: env.isProd ? "none" : "lax",
    secure: env.isProd,
  });
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const bearer = String(req.headers.authorization || "").replace(
    /^Bearer\s+/i,
    "",
  );
  const queryToken = typeof req.query.token === "string" ? req.query.token : "";
  const token = req.cookies?.nuzio_token || bearer || queryToken;
  if (!token) throw new ApiError(401, "Not authenticated");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, "Session expired, please sign in again");
  }

  const user = await User.findById(payload.uid);
  if (!user) throw new ApiError(401, "Account not found");
  req.user = user;
  next();
});
