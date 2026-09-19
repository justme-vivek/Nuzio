import { Router } from 'express';
import { getMe, patchMe, onboardingStatus } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, patchMe);
router.get('/onboarding-status', requireAuth, onboardingStatus);

export default router;
