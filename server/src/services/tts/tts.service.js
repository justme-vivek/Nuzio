// TTS via msedge-tts (Microsoft Edge Read Aloud neural voices).
// Free, no API key, returns MP3 natively (24 kHz, 48 kbps, mono). Server-side only.

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const TTS_FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;

// 48 kbps CBR mono MP3 -> exact byte-to-time math for story timestamps.
export const MP3_BYTES_PER_SEC = 6000;

export function bytesToSec(bytes = 0) {
  return bytes / MP3_BYTES_PER_SEC;
}

// Narrator persona -> provider voice per language.
export const VOICE_MAP = {
  aria: { en: 'en-GB-SoniaNeural', hi: 'hi-IN-SwaraNeural' },
  kai: { en: 'en-US-AndrewNeural', hi: 'hi-IN-MadhurNeural' },
  meera: { en: 'en-IN-NeerjaNeural', hi: 'hi-IN-SwaraNeural' },
};

export function providerVoiceFor(voiceKey = 'aria', language = 'en') {
  const v = VOICE_MAP[voiceKey] || VOICE_MAP.aria;
  return v[language] || v.en;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function toError(err) {
  if (err instanceof Error) return err;
  const e = new Error(String(err?.message || err || 'TTS failed'));
  if (err && typeof err === 'object') e.cause = err;
  return e;
}

/**
 * Synthesize text to an MP3 buffer with one automatic retry.
 * Uses msedge-tts v2 API: setMetadata() opens the socket, toStream() returns
 * { audioStream, metadataStream }, and close() releases the connection.
 * @returns {Promise<{ audio: Buffer }>}
 */
export async function synthesize({ text, voice, rate = '+0%', pitch = '+0Hz', timeoutMs = 120000, retries = 1 }) {
  let lastErr = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(voice, TTS_FORMAT);
      const { audioStream } = tts.toStream(String(text), { rate, pitch });

      const chunks = [];
      await new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(
          () => finish(reject, new Error(`TTS timed out after ${timeoutMs}ms`)),
          timeoutMs
        );
        function finish(fn, arg) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          fn(arg);
        }
        audioStream.on('data', (d) => chunks.push(d));
        // turn.end -> push(null) -> 'end'; 'close' is the fallback for older paths.
        audioStream.on('end', () => finish(resolve));
        audioStream.on('error', (e) => finish(reject, e));
        audioStream.on('close', () => finish(resolve));
      });

      const audio = Buffer.concat(chunks);
      if (!audio.length) throw new Error('TTS returned empty audio');
      return { audio };
    } catch (err) {
      lastErr = toError(err);
      if (attempt < retries) await sleep(800);
    } finally {
      try {
        tts.close();
      } catch {
        /* ignore */
      }
    }
  }

  throw lastErr || new Error('TTS failed');
}
