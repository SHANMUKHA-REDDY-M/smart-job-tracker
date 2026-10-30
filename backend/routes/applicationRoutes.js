import { Router } from 'express';
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication
} from '../controllers/applicationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);
router.route('/').get(listApplications).post(createApplication);
router.route('/:id').patch(updateApplication).delete(deleteApplication);

export default router;
