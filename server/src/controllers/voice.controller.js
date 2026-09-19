import Voice from '../models/Voice.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ensurePreview } from '../services/voice/voice.service.js';

// GET /api/v1/voices
export const listVoices = asyncHandler(async (req, res) => {
  const voices = await Voice.find({ active: true }).sort({ name: 1 });
  res.json({
    ok: true,
    voices: voices.map((v) => ({
      id: String(v._id),
      key: v.key,
      name: v.name,
      gender: v.gender,
      accent: v.accent,
      description: v.description,
      tag: v.tag,
      languages: v.languages,
      previews: v.previews ? Object.fromEntries(Object.entries(v.previews).map(([k, val]) => [k, String(val)])) : {},
    })),
  });
});

// GET /api/v1/voices/:id/preview?lang=en -> redirects to the audio stream
export const getVoicePreview = asyncHandler(async (req, res) => {
  const voice = await Voice.findById(req.params.id);
  if (!voice) throw new ApiError(404, 'Voice not found');

  const lang = req.query.lang === 'hi' ? 'hi' : 'en';
  const fileId = await ensurePreview(voice, lang);
  return res.redirect(302, `/api/v1/audio/${fileId}`);
});
