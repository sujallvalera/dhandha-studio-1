/**
 * Client Controller
 * -------------------
 * Handles enterprise API client (B2B) dashboard endpoints.
 * Protected by requireRole('client', 'admin').
 *
 * Endpoints:
 *   GET  /client/keys           — List API keys
 *   POST /client/keys           — Generate new API key
 *   POST /client/keys/:id/rotate — Rotate an API key
 *   GET  /client/analytics      — Usage analytics
 *   GET  /client/billing        — Billing information
 *   GET  /client/jobs           — Batch job listing
 */

import { getKeysForUser, createApiKey, rotateApiKey } from '../services/apiKeyService.js';
import { getClientAnalytics, getClientBilling, getClientBatchJobs } from '../services/clientManagementService.js';

/**
 * GET /client/keys
 */
export const getApiKeys = async (req, res, next) => {
  try {
    const keys = await getKeysForUser(req.user.userId);
    res.status(200).json({ status: 'ok', count: keys.length, data: keys });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /client/keys
 * Body: { label, rateLimit, usageLimit }
 */
export const generateNewApiKey = async (req, res, next) => {
  try {
    const { label, rateLimit, usageLimit } = req.body;

    const result = await createApiKey({
      userId: req.user.userId,
      label: label || 'Default',
      rateLimit: parseInt(rateLimit, 10) || 60,
      usageLimit: parseInt(usageLimit, 10) || 0,
    });

    res.status(201).json({
      status: 'ok',
      message: 'API key generated. Store it securely — it will not be shown again in full.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /client/keys/:id/rotate
 */
export const rotateKey = async (req, res, next) => {
  try {
    const { id: keyId } = req.params;
    const result = await rotateApiKey(keyId, req.user.userId);

    res.status(200).json({
      status: 'ok',
      message: 'API key rotated. The old key is now invalid.',
      data: {
        newApiKey: result.newApiKey,
        newKeyId: result.newKeyId,
        oldKeyId: result.oldKeyId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /client/analytics?days=30
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const analytics = await getClientAnalytics(req.user.userId, { days });
    res.status(200).json({ status: 'ok', data: analytics });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /client/billing
 */
export const getBilling = async (req, res, next) => {
  try {
    const billing = await getClientBilling(req.user.userId);
    res.status(200).json({ status: 'ok', data: billing });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /client/jobs?limit=50&status=completed
 */
export const getBatchJobs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const status = req.query.status || null;

    const jobs = await getClientBatchJobs(req.user.userId, { limit, status });
    res.status(200).json({ status: 'ok', count: jobs.length, data: jobs });
  } catch (error) {
    next(error);
  }
};

export default { getApiKeys, generateNewApiKey, rotateKey, getAnalytics, getBilling, getBatchJobs };
