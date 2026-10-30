import { Router } from 'express';
import { discoverJobs } from '../controllers/discoveryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.get('/jobs', discoverJobs);

export default router;
