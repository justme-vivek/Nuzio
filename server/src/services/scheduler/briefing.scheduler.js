// Daily automation: every 5 minutes, find users whose local time matches
// their chosen briefing time and generate the morning brief for them.

import cron from 'node-cron';
import Preference from '../../models/Preference.js';
import Briefing from '../../models/Briefing.js';
import { generateBriefingForUser } from '../briefing/briefing.service.js';
import { toLocalHHMM, toDateKey } from '../../utils/date.js';

let running = false;
const MAX_PER_RUN = 4;

export function startScheduler() {
  cron.schedule('*/5 * * * *', () => {
    runDueBriefings().catch((e) => console.error('[scheduler] run failed:', e.message));
  });
  console.log('[scheduler] morning-brief scheduler started (every 5 min)');
}

function timeSlotMatches(nowHHMM, targetHHMM) {
  const [nh, nm] = nowHHMM.split(':').map(Number);
  const [th, tm] = String(targetHHMM || '07:00').split(':').map(Number);
  const nowM = nh * 60 + nm;
  const targetM = th * 60 + tm;
  const diff = Math.abs(nowM - targetM);
  return diff <= 2 || diff >= 1438;
}

export async function runDueBriefings() {
  if (running) return;
  running = true;
  let generated = 0;
  try {
    const prefs = await Preference.find({ 'notifications.morningBrief': true }).populate('user');

    for (const pref of prefs) {
      if (generated >= MAX_PER_RUN) break;
      const user = pref.user;
      if (!user || !user.onboardingCompleted) continue;

      const tz = pref.timezone || 'Asia/Kolkata';
      const nowHHMM = toLocalHHMM(new Date(), tz);
      if (!timeSlotMatches(nowHHMM, pref.briefingTime)) continue;

      const dateKey = toDateKey(new Date(), tz);
      const existing = await Briefing.findOne({ user: user._id, dateKey, status: 'ready' });
      if (existing) continue;

      try {
        await generateBriefingForUser(user._id, {});
        generated += 1;
        console.log(`[scheduler] briefing ready for ${user.email || user._id}`);
      } catch (err) {
        console.error(`[scheduler] briefing failed for ${user.email || user._id}: ${err.message}`);
      }
    }

    if (generated) console.log(`[scheduler] generated ${generated} briefing(s) this run`);
  } finally {
    running = false;
  }
}
