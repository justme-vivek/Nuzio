import app from './app.js';
import { env } from './config/env.js';
import connectDB, { dbConnected } from './config/db.js';
import { seedVoices } from './services/voice/voice.service.js';
import { startScheduler } from './services/scheduler/briefing.scheduler.js';
import { deleteAudioOlderThan } from './services/audio/storage.service.js';
import { warmArticleCache } from './services/news/news.service.js';

async function main() {
  const ok = await connectDB();

  if (ok && dbConnected()) {
    try {
      await seedVoices();
    } catch (err) {
      console.warn('[server] voice seeding skipped:', err.message);
    }
    startScheduler();

    // Prune audio files older than 7 days at startup (keeps M0 free tier healthy).
    deleteAudioOlderThan(7)
      .then((n) => n && console.log(`[audio] pruned ${n} old audio file(s)`))
      .catch(() => {});

    // Fill the article cache in the background so briefings still work when GDELT
    // is rate-limiting or unreachable (the resilient fallback serves these).
    warmArticleCache()
      .then((r) => r.warmed && console.log(`[news] article cache ready (${r.cached})`))
      .catch(() => {});
  }

  app.listen(env.port, () => {
    console.log(`[server] Nuzio API listening on http://localhost:${env.port}`);
    console.log(`[server] env=${env.nodeEnv} db=${ok ? 'connected' : 'unavailable (run MongoDB or set MONGODB_URI)'}`);
  });
}

main().catch((err) => {
  console.error('[server] fatal:', err);
  process.exit(1);
});
