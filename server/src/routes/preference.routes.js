import { Router } from 'express';
import { getPreferences, patchPreferences } from '../controllers/preference.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, getPreferences);
router.patch('/', requireAuth, patchPreferences);

export default router;
