// The full pipeline: preferences -> news -> AI summary -> briefing script ->
// TTS (per-segment MP3, concatenated) -> MongoDB GridFS -> Briefing record.
// Story timestamps are exact: each segment's start = cumulativeBytes / 6000.

import Briefing from '../../models/Briefing.js';
import Preference from '../../models/Preference.js';
import User from '../../models/User.js';
import Notification from '../../models/Notification.js';
import { getForInterests } from '../news/news.service.js';
import { summarizeStories } from '../ai/summarizer.js';
import { generateBriefingScript } from '../ai/briefingGenerator.js';
import { synthesize, providerVoiceFor, bytesToSec } from '../tts/tts.service.js';
import { uploadAudio } from '../audio/storage.service.js';
import { shapeBriefing } from './briefing.helpers.js';
import { toDateKey, formatTime12 } from '../../utils/date.js';
import { estimateSecondsFromWords, firstName } from '../../utils/text.js';
import { ApiError } from '../../utils/ApiError.js';

const STORIES_FOR_DURATION = { 5: 4, 10: 6, 15: 8 };
const inflight = new Map();

export function storiesForDuration(d = 5) {
  if (STORIES_FOR_DURATION[d]) return STORIES_FOR_DURATION[d];
  return Math.max(3, Math.min(9, Math.round(d / 2)));
}

export async function getTodayBriefing(userId, tz = 'Asia/Kolkata') {
  const dateKey = toDateKey(new Date(), tz);
  return Briefing.findOne({ user: userId, dateKey }).sort({ createdAt: -1 });
}

export async function generateBriefingForUser(userId, { duration } = {}) {
  const key = String(userId);
  if (inflight.has(key)) return inflight.get(key);
  const p = _generate(userId, duration).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

async function _generate(userId, durationOverride) {
  const pref = await Preference.findOne({ user: userId });
  const user = await User.findById(userId);
  if (!pref || !user) throw new ApiError(404, 'User or preferences not found');

  const tz = pref.timezone || 'Asia/Kolkata';
  const dateKey = toDateKey(new Date(), tz);
  const duration = Number(durationOverride) || pref.briefingDuration || 5;
  const wants = storiesForDuration(duration);

  const existingReady = await Briefing.findOne({ user: userId, dateKey, status: 'ready', duration });
  if (existingReady) return existingReady;

  let briefing = await Briefing.findOneAndUpdate(
    { user: userId, dateKey, status: 'generating' },
    { $set: { duration, voiceKey: pref.voiceKey, language: pref.language } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  try {
    const { articles } = await getForInterests(pref, { limit: Math.max(wants * 2, 12) });
    if (!articles.length) {
      throw new ApiError(503, "We couldn't find enough stories matching your interests right now. Please try again in a bit.");
    }
    const selected = articles.slice(0, wants);

    const summarized = await summarizeStories(selected);
    const scriptPack = await generateBriefingScript({
      name: firstName(user.name),
      stories: summarized.map((s) => ({ title: s.article.title, source: s.article.source, summary: s.summary })),
      duration,
    });

    const fullScript = [scriptPack.greeting, ...scriptPack.stories.map((s) => s.script), scriptPack.closing]
      .filter(Boolean)
      .join('\n\n');
    const wordCount = fullScript.split(/\s+/).filter(Boolean).length;

    const voice = providerVoiceFor(pref.voiceKey, pref.language);

    // --- TTS: one MP3 segment per part; concat = single briefing file ---
    const segments = [
      { text: scriptPack.greeting, storyIndex: -1 },
      ...scriptPack.stories.map((s, i) => ({ text: s.script, storyIndex: i })),
      { text: scriptPack.closing, storyIndex: -1 },
    ].filter((s) => s.text);

    const buffers = [];
    const starts = new Array(scriptPack.stories.length).fill(null);
    let cumulative = 0;

    for (const seg of segments) {
      if (seg.storyIndex >= 0) {
        starts[seg.storyIndex] = Math.round(bytesToSec(cumulative) * 100) / 100;
      }
      try {
        const { audio: segAudio } = await synthesize({ text: seg.text, voice });
        buffers.push(segAudio);
        cumulative += segAudio.length;
      } catch (err) {
        const label = seg.storyIndex >= 0 ? `story ${seg.storyIndex + 1}` : seg.text.slice(0, 24);
        console.warn(`[briefing] TTS segment failed (${label}): ${err.message}`);
      }
    }

    if (!cumulative) throw new ApiError(502, 'Audio generation failed completely, please retry');

    const audio = Buffer.concat(buffers);
    const audioFileId = await uploadAudio(audio, `brief-${userId}-${dateKey}.mp3`, {
      kind: 'briefing',
      userId: String(userId),
      dateKey,
    });
    const audioDurationSec = Math.round(bytesToSec(audio.length));

    briefing.stories = summarized.map((s, i) => ({
      articleId: s.article._id,
      title: scriptPack.stories[i]?.headline || s.article.title,
      source: s.article.source,
      url: s.article.url,
      imageUrl: s.article.imageUrl || '',
      summary: s.summary,
      script: scriptPack.stories[i]?.script || s.summary,
      category: s.category,
      startSec: starts[i],
    }));
    briefing.title = scriptPack.title;
    briefing.greeting = scriptPack.greeting;
    briefing.closing = scriptPack.closing;
    briefing.script = fullScript;
    briefing.wordCount = wordCount;
    briefing.audioFileId = audioFileId;
    briefing.audioSizeBytes = audio.length;
    briefing.audioDurationSec = audioDurationSec || estimateSecondsFromWords(wordCount);
    briefing.duration = duration;
    briefing.voiceKey = pref.voiceKey;
    briefing.language = pref.language;
    briefing.status = 'ready';
    briefing.readyAt = new Date();
    briefing.error = '';
    await briefing.save();

    await Notification.create({
      user: userId,
      type: 'morning_brief',
      title: 'Your morning brief is ready',
      message: `${briefing.stories.length} stories · Voice: ${pref.voiceKey} · ${formatTime12(pref.briefingTime)}`,
      briefingId: briefing._id,
    });

    return briefing;
  } catch (err) {
    briefing.status = 'failed';
    briefing.error = err.message || 'Briefing generation failed';
    await briefing.save().catch(() => {});
    throw err;
  }
}

export { shapeBriefing };
