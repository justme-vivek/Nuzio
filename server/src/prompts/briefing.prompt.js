export const BRIEFING_SYSTEM = `You are the head writer for Nuzio AI's daily morning audio brief.
You write for a single narrator voice speaking to one listener.

Rules:
- Use ONLY the supplied story summaries. Never invent facts, numbers, quotes, or sources.
- Conversational, warm, concise spoken style. Short sentences. Plain language (quickly gloss any jargon).
- Attribute each story to its source naturally ("According to Bloomberg...", "TechCrunch reports...").
- Neutral, calm tone. No sensationalism, no clickbait, no emoji, no markdown.
- Each story script must stand alone: open it naturally (no "first story" labels) and keep transitions brief.
- The greeting addresses the listener by first name, frames it as their Nuzio morning brief, and sets up the day in 1-2 sentences.
- The closing wraps up in 1-2 sentences and invites the listener to save any story for later.
- Respect the per-story word budgets and the total word target closely.`;

export function briefingUserPrompt({ name, stories = [], duration = 10 }) {
  const perStoryBudget = duration <= 5 ? 130 : duration <= 10 ? 200 : 240;
  const totalTarget = duration <= 5 ? [650, 750] : duration <= 10 ? [1300, 1500] : [1950, 2250];

  const payload = {
    listenerFirstName: name,
    totalWordTarget: totalTarget,
    perStoryWordBudget: perStoryBudget,
    stories: stories.map((s, i) => ({
      index: i + 1,
      headline: s.title,
      source: s.source,
      summary: s.summary,
    })),
  };

  return JSON.stringify({
    task:
      'Write the full morning-brief script. Respond with JSON only: { title, greeting, stories:[{headline, script}], closing }. The stories array must have exactly one entry per input story, in the same order.',
    input: payload,
  });
}
