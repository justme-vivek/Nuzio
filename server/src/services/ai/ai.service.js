import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

let client = null;

function getClient() {
  if (!env.aiApiKey) {
    throw new ApiError(
      503,
      'AI is not configured. Put your Gemini API key from aistudio.google.com into server/.env as AI_API_KEY.'
    );
  }
  if (!client) client = new GoogleGenAI({ apiKey: env.aiApiKey });
  return client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripFences(text = '') {
  const t = text.trim();
  if (t.startsWith('```')) {
    return t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return t;
}

function isRetryable(err) {
  const status = err?.status || err?.code;
  if (status === 429 || status === 500 || status === 503) return true;
  return /\b(429|500|503)\b/.test(String(err?.message || ''));
}

// Structured JSON generation with model fallback + limited retries.
// Models come from env (defaults are evergreen aliases: gemini-flash-latest then
// gemini-flash-lite-latest) so a retired model version never breaks the pipeline.
export async function generateJSON({ contents, schema, system, temperature = 0.7 }) {
  const models = [env.aiModel, env.aiFallbackModel].filter(Boolean);
  let lastErr = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const ai = getClient();
        const res = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: system,
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature,
          },
        });
        const text = String(res.text || '').trim();
        if (!text) throw new Error('Empty AI response');
        return JSON.parse(stripFences(text));
      } catch (err) {
        lastErr = err;
        if (err instanceof ApiError) throw err;
        if (!isRetryable(err)) break; // try the next model instead
        await sleep(1500 * (attempt + 1));
      }
    }
  }

  throw new ApiError(502, `AI generation failed: ${lastErr?.message || 'unknown error'}`);
}

export function aiConfigured() {
  return Boolean(env.aiApiKey);
}
