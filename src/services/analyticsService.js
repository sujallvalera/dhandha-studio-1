/**
 * Analytics Service
 * ------------------
 * Provides non-realtime analytics for the admin dashboard.
 *
 * All analytics are read from Firestore using aggregated queries.
 * Write operations increment counters during job lifecycle events.
 */

import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';

const STATS_DOC = 'platform_stats';
const STATS_COLLECTION = 'analytics';

/**
 * Get aggregated platform statistics for admin dashboard.
 *
 * @returns {Promise<object>}
 */
export const getDashboardStats = async () => {
  // Fetch platform stats document
  const statsRef = db.collection(STATS_COLLECTION).doc(STATS_DOC);
  const statsDoc = await statsRef.get();
  const stats = statsDoc.exists ? statsDoc.data() : {};

  // Fetch user counts
  const usersSnapshot = await db.collection('users').count().get();
  const totalUsers = usersSnapshot.data().count;

  // Fetch active users (users with at least 1 job in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeJobsSnapshot = await db.collection('jobs')
    .where('created_at', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
    .select('user_id')
    .get();

  const activeUserIds = new Set();
  activeJobsSnapshot.forEach((doc) => activeUserIds.add(doc.data().user_id));

  // Fetch API client count
  const clientsSnapshot = await db.collection('users')
    .where('role', '==', 'client')
    .count()
    .get();
  const totalApiClients = clientsSnapshot.data().count;

  // Fetch job stats
  const totalJobsSnapshot = await db.collection('jobs').count().get();
  const completedJobsSnapshot = await db.collection('jobs')
    .where('pipelineStage', '==', 'completed')
    .count()
    .get();
  const failedJobsSnapshot = await db.collection('jobs')
    .where('pipelineStage', '==', 'failed')
    .count()
    .get();

  return {
    totalUsers,
    activeUsers: activeUserIds.size,
    totalApiClients,
    totalJobs: totalJobsSnapshot.data().count,
    completedJobs: completedJobsSnapshot.data().count,
    failedJobs: failedJobsSnapshot.data().count,
    successRate: totalJobsSnapshot.data().count > 0
      ? Math.round((completedJobsSnapshot.data().count / totalJobsSnapshot.data().count) * 100)
      : 0,
    kieCreditsUsed: stats.kieCreditsUsed || 0,
    revenueTotal: stats.revenueTotal || 0,
    cloudinaryStorageMB: stats.cloudinaryStorageMB || 0,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Increment a platform statistic counter.
 *
 * @param {string} field   Field name in the stats document
 * @param {number} [amount=1]  Amount to increment
 * @returns {Promise<void>}
 */
export const incrementStat = async (field, amount = 1) => {
  const statsRef = db.collection(STATS_COLLECTION).doc(STATS_DOC);
  await statsRef.set(
    { [field]: admin.firestore.FieldValue.increment(amount) },
    { merge: true }
  );
};

/**
 * Record a generation event for analytics.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.jobId
 * @param {string} params.status    'completed' | 'failed'
 * @param {number} params.durationMs
 * @param {string} params.category
 * @returns {Promise<void>}
 */
export const recordGenerationEvent = async ({ userId, jobId, status, durationMs, category }) => {
  const event = {
    userId,
    jobId,
    status,
    durationMs,
    category,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection(STATS_COLLECTION).doc('events').collection('generations').add(event);

  // Update counters
  if (status === 'completed') {
    await incrementStat('totalCompletedGenerations');
    await incrementStat('kieCreditsUsed');
  } else if (status === 'failed') {
    await incrementStat('totalFailedGenerations');
  }
};

/**
 * Get generation statistics for a specific user.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserStats = async (userId) => {
  const jobsSnapshot = await db.collection('jobs')
    .where('user_id', '==', userId)
    .get();

  let completed = 0;
  let failed = 0;
  let totalDuration = 0;

  jobsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.pipelineStage === 'completed') completed++;
    if (data.pipelineStage === 'failed') failed++;
    if (data.metadata?.durationMs) totalDuration += data.metadata.durationMs;
  });

  return {
    totalJobs: jobsSnapshot.size,
    completed,
    failed,
    avgDurationMs: completed > 0 ? Math.round(totalDuration / completed) : 0,
  };
};

export default { getDashboardStats, incrementStat, recordGenerationEvent, getUserStats };
