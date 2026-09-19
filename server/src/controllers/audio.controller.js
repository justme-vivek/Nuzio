import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { getAudioFileInfo, openAudioStream, parseRange } from '../services/audio/storage.service.js';

// GET /api/v1/audio/:fileId - streams MP3 out of MongoDB GridFS with
// HTTP Range support so the player can seek instantly.
export const streamAudio = asyncHandler(async (req, res) => {
  const info = await getAudioFileInfo(req.params.fileId);
  if (!info) throw new ApiError(404, 'Audio not found');

  const total = info.length;
  const range = parseRange(req.headers.range, total);
  const baseHeaders = {
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=86400',
  };

  if (range) {
    const stream = await openAudioStream(info._id, { start: range.start, end: range.end + 1 });
    res.status(206);
    res.set({
      ...baseHeaders,
      'Content-Range': `bytes ${range.start}-${range.end}/${total}`,
      'Content-Length': String(range.end - range.start + 1),
    });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } else {
    const stream = await openAudioStream(info._id, {});
    res.status(200);
    res.set({ ...baseHeaders, 'Content-Length': String(total) });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  }
});
