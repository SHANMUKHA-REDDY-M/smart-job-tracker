import { Router } from 'express';
import { chat } from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, chat);

export default router;
