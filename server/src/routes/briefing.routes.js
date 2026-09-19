import { Router } from 'express';
import { getToday, generate, listBriefings, getBriefing } from '../controllers/briefing.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { generateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.get('/today', requireAuth, getToday);
router.post('/generate', requireAuth, generateLimiter, generate);
router.get('/', requireAuth, listBriefings);
router.get('/:id', requireAuth, getBriefing);

export default router;
