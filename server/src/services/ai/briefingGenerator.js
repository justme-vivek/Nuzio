import { generateJSON } from './ai.service.js';
import { BRIEFING_SYSTEM, briefingUserPrompt } from '../../prompts/briefing.prompt.js';

const schema = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    greeting: { type: 'STRING' },
    stories: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          headline: { type: 'STRING' },
          script: { type: 'STRING' },
        },
        required: ['headline', 'script'],
      },
    },
    closing: { type: 'STRING' },
  },
  required: ['title', 'greeting', 'stories', 'closing'],
};

export async function generateBriefingScript({ name, stories = [], duration = 10 }) {
  const contents = briefingUserPrompt({ name, stories, duration });
  const out = await generateJSON({ contents, schema, system: BRIEFING_SYSTEM, temperature: 0.8 });

  const items = Array.isArray(out.stories) ? out.stories : [];

  return {
    title: String(out.title || 'Morning Brief').trim() || 'Morning Brief',
    greeting: String(out.greeting || '').trim() || `Good morning, ${name}. Here is your Nuzio brief.`,
    stories: stories.map((s, i) => ({
      headline: String(items[i]?.headline || s.title || '').trim(),
      script: String(items[i]?.script || s.summary || '').trim(),
    })),
    closing: String(out.closing || '').trim() || "That's your brief for today. Save any story you'd like to revisit.",
  };
}
