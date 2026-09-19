import rateLimit from 'express-rate-limit';

const json = (message) => ({ ok: false, error: message });

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many requests, please slow down'),
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many auth attempts, try again in a minute'),
});

export const generateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => String(req.user?._id || req.ip),
  message: json('Briefing generation limit reached, please wait a few minutes'),
});
