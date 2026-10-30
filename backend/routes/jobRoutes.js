import { Router } from 'express';
import {
  createJob,
  deleteJob,
  listJobs,
  updateJob
} from '../controllers/jobController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.route('/').get(listJobs).post(createJob);
router.route('/:id').patch(updateJob).delete(deleteJob);

export default router;

