import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res) {
  res.status(404).json({ ok: false, error: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err instanceof ApiError ? err.status : err.status || 500;
  if (err?.name === 'ValidationError') status = 400;
  if (err?.type === 'entity.parse.failed') status = 400;
  if (err?.code === 11000) status = 409; // duplicate key

  const message =
    err instanceof ApiError || status < 500
      ? err.message
      : 'Internal server error';

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err);
  }

  res.status(status).json({ ok: false, error: message, details: err?.details || undefined });
}
