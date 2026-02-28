/**
 * Admin Routes
 * --------------
 * All admin dashboard endpoints, protected by requireRole('admin').
 *
 * Base path: /admin
 */

import { Router } from 'express';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
  getStats,
  getAllUsers,
  getAllClients,
  getRefundRequests,
  approveRefund,
  rejectRefund,
  adjustCredits,
} from '../controllers/adminController.js';

const router = Router();

// All admin routes require 'admin' role
router.use(requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/clients', getAllClients);
router.get('/refunds', getRefundRequests);
router.post('/refunds/:id/approve', approveRefund);
router.post('/refunds/:id/reject', rejectRefund);
router.post('/credits/adjust', adjustCredits);

export default router;
