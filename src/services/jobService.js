/**
 * Job Service
 * ------------
 * CRUD operations for Firestore `jobs` collection.
 *
 * Extended job schema for the KIE-centric pipeline:
 *   rawConfig, normalizedConfig, imageAnalysis, userInstruction,
 *   refinedInstruction, finalInstruction, finalPrompt, kieJobId,
 *   aspectRatio, resolution, pipelineStage, outputUrl
 *
 * Pipeline lifecycle:
 *   intake → analysis → instruction → compilation → generation → completed | failed
 */

import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';
import { PIPELINE_STAGES } from '../constants/pipelineStages.js';

/**
 * Create a new job document with the extended schema.
 *
 * @param {object} jobData
 * @returns {Promise<object>}
 */
export const createJob = async (jobData) => {
  const job = {
    job_id: jobData.job_id,
    type: jobData.type || 'generation',
    user_id: jobData.user_id,
    pipelineStage: PIPELINE_STAGES.INTAKE,

    // Raw and normalized config
    rawConfig: jobData.rawConfig || {},
    normalizedConfig: jobData.normalizedConfig || null,

    // Image analysis (populated in Step 2)
    imageAnalysis: null,

    // Instructions (populated in Step 3)
    userInstruction: jobData.userInstruction || null,
    refinedInstruction: null,
    finalInstruction: null,

    // Prompt (populated in Step 4)
    finalPrompt: null,

    // KIE (populated in Step 5)
    kieJobId: null,

    // Dimensions
    aspectRatio: jobData.aspectRatio || null,
    resolution: jobData.resolution || null,

    // I/O URLs
    input_image_url: jobData.input_image_url || null,
    outputUrl: null,

    // Legacy compat
    status: 'queued',
    output_url: null,

    // Metadata
    metadata: {},
    ruleOverrides: [],
    complianceGuidelines: [],

    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection('jobs').doc(job.job_id).set(job);
  return job;
};

/**
 * Update the pipeline stage of a job.
 *
 * @param {string} jobId
 * @param {string} stage   One of PIPELINE_STAGES values
 * @param {object} [additionalData]  Extra fields to merge
 * @returns {Promise<void>}
 */
export const updatePipelineStage = async (jobId, stage, additionalData = {}) => {
  const updates = {
    pipelineStage: stage,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
    ...additionalData,
  };

  // Sync legacy status field
  if (stage === PIPELINE_STAGES.COMPLETED) {
    updates.status = 'completed';
  } else if (stage === PIPELINE_STAGES.FAILED) {
    updates.status = 'failed';
  } else {
    updates.status = 'processing';
  }

  await db.collection('jobs').doc(jobId).update(updates);
};

/**
 * Partial update of an existing job.
 *
 * @param {string} jobId
 * @param {object} updates  Fields to merge
 * @returns {Promise<void>}
 */
export const updateJob = async (jobId, updates) => {
  updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('jobs').doc(jobId).update(updates);
};

/**
 * Fetch a single job by ID.
 *
 * @param {string} jobId
 * @returns {Promise<object|null>}
 */
export const getJob = async (jobId) => {
  const doc = await db.collection('jobs').doc(jobId).get();
  if (!doc.exists) return null;
  return doc.data();
};

/**
 * Get paginated jobs for a user.
 *
 * @param {string} userId
 * @param {object} [options]
 * @param {number} [options.limit=20]
 * @param {string} [options.startAfter]  Job ID to start after (cursor)
 * @returns {Promise<object[]>}
 */
export const getJobsByUser = async (userId, options = {}) => {
  let query = db.collection('jobs')
    .where('user_id', '==', userId)
    .orderBy('created_at', 'desc')
    .limit(options.limit || 20);

  if (options.startAfter) {
    const startDoc = await db.collection('jobs').doc(options.startAfter).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data());
};

/**
 * Get jobs for a client (B2B API consumer).
 *
 * @param {string} clientId
 * @param {object} [options]
 * @param {number} [options.limit=50]
 * @param {string} [options.status]
 * @returns {Promise<object[]>}
 */
export const getJobsByClient = async (clientId, options = {}) => {
  let query = db.collection('jobs')
    .where('user_id', '==', clientId)
    .orderBy('created_at', 'desc')
    .limit(options.limit || 50);

  if (options.status) {
    query = query.where('pipelineStage', '==', options.status);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data());
};

/**
 * Get job statistics (counts by pipeline stage).
 *
 * @param {object} [filters]
 * @param {string} [filters.userId]
 * @returns {Promise<object>}
 */
export const getJobStats = async (filters = {}) => {
  let query = db.collection('jobs');

  if (filters.userId) {
    query = query.where('user_id', '==', filters.userId);
  }

  const snapshot = await query.get();

  const stats = {
    total: snapshot.size,
    byStage: {},
  };

  snapshot.forEach((doc) => {
    const stage = doc.data().pipelineStage || 'unknown';
    stats.byStage[stage] = (stats.byStage[stage] || 0) + 1;
  });

  return stats;
};

export default { createJob, updateJob, updatePipelineStage, getJob, getJobsByUser, getJobsByClient, getJobStats };
