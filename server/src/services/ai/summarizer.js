import { generateJSON } from './ai.service.js';
import { SUMMARY_SYSTEM, summaryUserPrompt } from '../../prompts/summary.prompt.js';
import { CATEGORY_IDS } from '../news/interests.js';

const schema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      index: { type: 'INTEGER' },
      summary: { type: 'STRING' },
      category: { type: 'STRING', enum: CATEGORY_IDS },
    },
    required: ['index', 'summary'],
  },
};

// Returns [{ article, summary, category }] in the same order as the input.
export async function summarizeStories(articles = []) {
  const contents = summaryUserPrompt(articles);
  const out = await generateJSON({ contents, schema, system: SUMMARY_SYSTEM, temperature: 0.4 });

  const map = new Map();
  if (Array.isArray(out)) {
    out.forEach((o) => {
      if (o && typeof o.index === 'number') {
        map.set(o.index, {
          summary: String(o.summary || '').trim(),
          category: String(o.category || ''),
        });
      }
    });
  }

  return articles.map((a, i) => ({
    article: a,
    summary: map.get(i + 1)?.summary || '',
    category: map.get(i + 1)?.category || a.categories?.[0] || '',
  }));
}
