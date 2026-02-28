/**
 * Client Routes
 * ---------------
 * Enterprise API client (B2B) dashboard endpoints.
 * Accessible by 'client' and 'admin' roles.
 *
 * Base path: /client
 */

import { Router } from 'express';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
  getApiKeys,
  generateNewApiKey,
  rotateKey,
  getAnalytics,
  getBilling,
  getBatchJobs,
} from '../controllers/clientController.js';

const router = Router();

// Client routes accessible by clients and admins
router.use(requireRole('client', 'admin'));

router.get('/keys', getApiKeys);
router.post('/keys', generateNewApiKey);
router.post('/keys/:id/rotate', rotateKey);
router.get('/analytics', getAnalytics);
router.get('/billing', getBilling);
router.get('/jobs', getBatchJobs);

export default router;
