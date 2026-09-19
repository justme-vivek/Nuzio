import { Router } from 'express';
import { googleAuth, me, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/google', authLimiter, googleAuth);
router.get('/me', requireAuth, me);
router.post('/logout', logout);

export default router;
