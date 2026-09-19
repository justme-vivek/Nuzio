import { Router } from 'express';
import {
  listNews,
  getCategories,
  getArticle,
  getStoryAudio,
} from '../controllers/news.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, listNews);
router.get('/categories', requireAuth, getCategories);
router.get('/:id', requireAuth, getArticle);
router.get('/:id/audio', requireAuth, getStoryAudio);

export default router;
