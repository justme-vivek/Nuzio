import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// GET /api/v1/notifications
export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  const unread = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({
    ok: true,
    unread,
    notifications: items.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.title,
      message: n.message,
      briefingId: n.briefingId ? String(n.briefingId) : null,
      read: n.read,
      createdAt: n.createdAt,
    })),
  });
});

// PATCH /api/v1/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } },
    { new: true }
  );
  if (!n) throw new ApiError(404, 'Notification not found');
  res.json({ ok: true });
});

// PATCH /api/v1/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});
