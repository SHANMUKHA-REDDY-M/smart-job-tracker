import { Router } from 'express';
import { deleteResume, getResume, saveResume } from '../controllers/resumeController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.route('/').get(getResume).put(saveResume).delete(deleteResume);

export default router;
