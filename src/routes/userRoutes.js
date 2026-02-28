/**
 * User Routes
 * -------------
 * User dashboard endpoints.
 * Accessible by 'user' and 'admin' roles.
 *
 * Base path: /user
 */

import { Router } from 'express';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
  getProfile,
  updateProfile,
  getHistory,
  getCredits,
  requestRefund,
} from '../controllers/userController.js';

const router = Router();

// User routes accessible by users and admins
router.use(requireRole('user', 'admin'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/history', getHistory);
router.get('/credits', getCredits);
router.post('/refund', requestRefund);

export default router;
