import { normalizeForMatch } from '../../utils/text.js';

// Story timestamps come from per-segment MP3 byte offsets (48 kbps CBR),
// computed during generation in briefing.service.js. Kept here: the JSON
// shape exposed to the client.

export function shapeBriefing(b) {
  return {
    id: String(b._id),
    dateKey: b.dateKey,
    language: b.language,
    duration: b.duration,
    voiceKey: b.voiceKey,
    title: b.title,
    greeting: b.greeting,
    closing: b.closing,
    script: b.script,
    status: b.status,
    error: b.error || '',
    wordCount: b.wordCount || 0,
    audioFileId: b.audioFileId ? String(b.audioFileId) : null,
    audioSizeBytes: b.audioSizeBytes || 0,
    audioDurationSec: b.audioDurationSec || 0,
    stories: (b.stories || []).map((s, i) => ({
      index: i + 1,
      articleId: s.articleId ? String(s.articleId) : null,
      title: s.title,
      source: s.source,
      url: s.url,
      imageUrl: s.imageUrl || '',
      summary: s.summary,
      category: s.category || '',
      startSec: typeof s.startSec === 'number' ? s.startSec : null,
    })),
    readyAt: b.readyAt,
    createdAt: b.createdAt,
  };
}
