// All MP3s (briefings, voice previews, story clips) live in MongoDB GridFS.
// MongoDB stores both the app data AND the audio - no external object storage.

import mongoose from 'mongoose';
import { getAudioBucket } from '../../config/db.js';

function toObjectId(v) {
  try {
    return new mongoose.Types.ObjectId(String(v));
  } catch {
    return null;
  }
}

export async function uploadAudio(buffer, filename, metadata = {}) {
  const bucket = getAudioBucket();
  return new Promise((resolve, reject) => {
    const up = bucket.openUploadStream(filename, { metadata });
    up.on('finish', () => resolve(up.id));
    up.on('error', reject);
    up.end(buffer);
  });
}

export async function getAudioFileInfo(fileId) {
  const _id = toObjectId(fileId);
  if (!_id) return null;
  const bucket = getAudioBucket();
  const files = await bucket.find({ _id }).limit(1).toArray();
  return files[0] || null;
}

export async function openAudioStream(fileId, { start = 0, end } = {}) {
  const _id = toObjectId(fileId);
  if (!_id) throw new Error('Invalid audio id');
  const bucket = getAudioBucket();
  const opts = {};
  if (start > 0) opts.start = start;
  if (typeof end === 'number' && Number.isFinite(end)) opts.end = end;
  return bucket.openDownloadStream(_id, opts);
}

export async function deleteAudio(fileId) {
  const _id = toObjectId(fileId);
  if (!_id) return;
  try {
    await getAudioBucket().delete(_id);
  } catch {
    // already gone
  }
}

// Keeps the free M0 tier (512 MB) healthy: prune audio older than N days.
export async function deleteAudioOlderThan(days = 7) {
  const bucket = getAudioBucket();
  const cutoff = new Date(Date.now() - days * 86400000);
  const files = await bucket.find({ uploadDate: { $lt: cutoff } }).project({ _id: 1 }).toArray();
  for (const f of files) {
    try {
      await bucket.delete(f._id);
    } catch {
      // ignore
    }
  }
  return files.length;
}

export function parseRange(header, total) {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
  if (!m) return null;
  const rawStart = m[1] === '' ? null : parseInt(m[1], 10);
  const rawEnd = m[2] === '' ? null : parseInt(m[2], 10);

  let start;
  let end;
  if (rawStart === null && rawEnd !== null) {
    start = Math.max(0, total - rawEnd); // "bytes=-N" suffix range
    end = total - 1;
  } else if (rawStart !== null && rawEnd === null) {
    start = rawStart;
    end = total - 1;
  } else if (rawStart !== null && rawEnd !== null) {
    start = rawStart;
    end = rawEnd;
  } else {
    return null;
  }

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) return null;
  end = Math.min(end, total - 1);
  return { start, end };
}
