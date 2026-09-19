import { Router } from 'express';
import { listSaved, addSaved, removeSaved } from '../controllers/saved.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, listSaved);
router.post('/:articleId', requireAuth, addSaved);
router.delete('/:articleId', requireAuth, removeSaved);

export default router;
