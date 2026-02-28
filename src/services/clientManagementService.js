/**
 * Client Management Service
 * ---------------------------
 * Manages enterprise API client (B2B) accounts.
 *
 * Features:
 *   - Client CRUD
 *   - Batch job tracking
 *   - Asset monitoring
 *   - Usage history & credit consumption
 */

import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';

/**
 * Get a client's dashboard data — account info, usage, and recent jobs.
 *
 * @param {string} clientId  The client's user ID
 * @returns {Promise<object>}
 */
export const getClientDashboard = async (clientId) => {
  // Get client profile
  const clientDoc = await db.collection('users').doc(clientId).get();
  if (!clientDoc.exists) {
    const err = new Error('Client not found.');
    err.statusCode = 404;
    throw err;
  }

  const clientData = clientDoc.data();

  // Get recent jobs
  const jobsSnapshot = await db.collection('jobs')
    .where('user_id', '==', clientId)
    .orderBy('created_at', 'desc')
    .limit(50)
    .get();

  const jobs = jobsSnapshot.docs.map((doc) => doc.data());

  // Calculate usage stats
  const stats = calculateUsageStats(jobs);

  return {
    profile: {
      clientId: clientDoc.id,
      name: clientData.name || clientData.clientId,
      email: clientData.email || null,
      role: clientData.role,
      credits: clientData.credits || 0,
      createdAt: clientData.createdAt?.toDate?.()?.toISOString() || null,
    },
    usage: stats,
    recentJobs: jobs.slice(0, 20).map(formatJobForClient),
  };
};

/**
 * Get usage analytics for a client.
 *
 * @param {string} clientId
 * @param {object} [options]
 * @param {number} [options.days=30]  Number of days to analyze
 * @returns {Promise<object>}
 */
export const getClientAnalytics = async (clientId, options = {}) => {
  const days = options.days || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const jobsSnapshot = await db.collection('jobs')
    .where('user_id', '==', clientId)
    .where('created_at', '>=', admin.firestore.Timestamp.fromDate(startDate))
    .get();

  const jobs = jobsSnapshot.docs.map((doc) => doc.data());
  const stats = calculateUsageStats(jobs);

  // Group by day for chart data
  const dailyBreakdown = {};
  for (const job of jobs) {
    const date = job.created_at?.toDate?.()?.toISOString()?.split('T')[0] || 'unknown';
    if (!dailyBreakdown[date]) {
      dailyBreakdown[date] = { total: 0, completed: 0, failed: 0 };
    }
    dailyBreakdown[date].total++;
    if (job.pipelineStage === 'completed') dailyBreakdown[date].completed++;
    if (job.pipelineStage === 'failed') dailyBreakdown[date].failed++;
  }

  return {
    period: { days, startDate: startDate.toISOString() },
    ...stats,
    dailyBreakdown,
  };
};

/**
 * Get billing information for a client.
 *
 * @param {string} clientId
 * @returns {Promise<object>}
 */
export const getClientBilling = async (clientId) => {
  const clientDoc = await db.collection('users').doc(clientId).get();
  if (!clientDoc.exists) {
    const err = new Error('Client not found.');
    err.statusCode = 404;
    throw err;
  }

  const clientData = clientDoc.data();

  // Get total jobs for credit consumption calculation
  const totalJobsSnapshot = await db.collection('jobs')
    .where('user_id', '==', clientId)
    .count()
    .get();

  return {
    creditsRemaining: clientData.credits || 0,
    creditsUsed: totalJobsSnapshot.data().count,
    plan: clientData.plan || 'prepaid',
    billingEmail: clientData.billingEmail || clientData.email || null,
  };
};

/**
 * Get batch jobs for a client.
 *
 * @param {string} clientId
 * @param {object} [options]
 * @param {number} [options.limit=50]
 * @param {string} [options.status]  Filter by pipelineStage
 * @returns {Promise<object[]>}
 */
export const getClientBatchJobs = async (clientId, options = {}) => {
  let query = db.collection('jobs')
    .where('user_id', '==', clientId)
    .orderBy('created_at', 'desc')
    .limit(options.limit || 50);

  if (options.status) {
    query = query.where('pipelineStage', '==', options.status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => formatJobForClient(doc.data()));
};

/**
 * Calculate usage stats from a job list.
 * @param {object[]} jobs
 * @returns {object}
 */
const calculateUsageStats = (jobs) => {
  let completed = 0;
  let failed = 0;
  let totalLatencyMs = 0;
  let latencyCount = 0;

  for (const job of jobs) {
    if (job.pipelineStage === 'completed') {
      completed++;
      if (job.metadata?.durationMs) {
        totalLatencyMs += job.metadata.durationMs;
        latencyCount++;
      }
    }
    if (job.pipelineStage === 'failed') failed++;
  }

  return {
    totalRequests: jobs.length,
    successfulRequests: completed,
    failedRequests: failed,
    successRate: jobs.length > 0 ? Math.round((completed / jobs.length) * 100) : 0,
    avgLatencyMs: latencyCount > 0 ? Math.round(totalLatencyMs / latencyCount) : 0,
    requestsPerDay: jobs.length > 0 ? Math.round(jobs.length / 30) : 0,
  };
};

/**
 * Format a job document for client-facing display.
 * @param {object} job
 * @returns {object}
 */
const formatJobForClient = (job) => ({
  jobId: job.job_id,
  status: job.pipelineStage || job.status,
  category: job.normalizedConfig?.category || null,
  outputUrl: job.outputUrl || job.output_url || null,
  createdAt: job.created_at?.toDate?.()?.toISOString() || null,
  resolution: job.resolution || null,
  aspectRatio: job.aspectRatio || null,
});

export default { getClientDashboard, getClientAnalytics, getClientBilling, getClientBatchJobs };
