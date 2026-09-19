import Voice from '../../models/Voice.js';
import { synthesize } from '../tts/tts.service.js';
import { uploadAudio, getAudioFileInfo } from '../audio/storage.service.js';

export const SEED_VOICES = [
  {
    key: 'aria',
    name: 'Aria',
    gender: 'Female',
    accent: 'British',
    description: 'Soft-narrated · Warm',
    tag: 'EN',
    languages: ['en'],
    providerVoiceId: 'en-GB-SoniaNeural',
    hindiVoiceId: 'hi-IN-SwaraNeural',
    active: true,
  },
  {
    key: 'kai',
    name: 'Kai',
    gender: 'Male',
    accent: 'American',
    description: 'Crisp · Focused',
    tag: 'EN',
    languages: ['en'],
    providerVoiceId: 'en-US-AndrewNeural',
    hindiVoiceId: 'hi-IN-MadhurNeural',
    active: true,
  },
  {
    key: 'meera',
    name: 'Meera',
    gender: 'Female',
    accent: 'Indian',
    description: 'Bright · Calm',
    tag: 'EN·हि',
    languages: ['en', 'hi'],
    providerVoiceId: 'en-IN-NeerjaNeural',
    hindiVoiceId: 'hi-IN-SwaraNeural',
    active: true,
  },
];

export async function seedVoices() {
  for (const v of SEED_VOICES) {
    await Voice.updateOne({ key: v.key }, { $set: v }, { upsert: true });
  }
  console.log('[voices] seeded narrator voices');
}

const previewTexts = {
  en: (n) => `Hi, I'm ${n}. Every morning I'll walk you through the stories that matter most to your world — clear, quick and on the go.`,
  hi: (n) => `नमस्ते, मैं ${n} हूँ। हर सुबह मैं आपकी दुनिया की सबसे ज़रूरी खबरें संक्षेप में सुनाऊँगी — आसान भाषा में।`,
};

export async function ensurePreview(voiceDoc, language = 'en') {
  const lang = voiceDoc.languages.includes(language) ? language : voiceDoc.languages[0];
  const existing = voiceDoc.previews?.[lang];
  if (existing) {
    const info = await getAudioFileInfo(existing).catch(() => null);
    if (info) return existing;
  }

  const providerVoice = lang === 'hi' ? voiceDoc.hindiVoiceId || voiceDoc.providerVoiceId : voiceDoc.providerVoiceId;
  const text = previewTexts[lang] ? previewTexts[lang](voiceDoc.name) : previewTexts.en(voiceDoc.name);
  const { audio } = await synthesize({ text, voice: providerVoice });
  const fileId = await uploadAudio(audio, `preview-${voiceDoc.key}-${lang}.mp3`, {
    kind: 'voice_preview',
    voiceKey: voiceDoc.key,
    lang,
  });
  await Voice.updateOne({ key: voiceDoc.key }, { $set: { [`previews.${lang}`]: fileId } });
  return fileId;
}
