import { Router } from 'express';
import { listVoices, getVoicePreview } from '../controllers/voice.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, listVoices);
router.get('/:id/preview', requireAuth, getVoicePreview);

export default router;
