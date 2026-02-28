/**
 * API Key Service
 * ----------------
 * Manages API key lifecycle for the platform:
 *   - Key generation (crypto-strong UUIDs)
 *   - Key rotation (generate new, invalidate old)
 *   - Key metadata management
 */

import { randomUUID, randomBytes } from 'crypto';
import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';

/**
 * Generate a new API key with a prefix for identification.
 * Format: ds_live_<32-char-hex>
 *
 * @returns {string}
 */
const generateKey = () => {
  const prefix = 'ds_live_';
  const random = randomBytes(24).toString('hex');
  return `${prefix}${random}`;
};

/**
 * Create a new API key for a user/client.
 *
 * @param {object} params
 * @param {string} params.userId      Firestore user ID
 * @param {string} [params.label]     Human-readable label
 * @param {number} [params.rateLimit] Requests per minute (default: 60)
 * @param {number} [params.usageLimit] Total requests allowed (0 = unlimited)
 * @returns {Promise<{ apiKey: string, keyId: string, createdAt: string }>}
 */
export const createApiKey = async ({ userId, label = 'Default', rateLimit = 60, usageLimit = 0 }) => {
  const apiKey = generateKey();
  const keyId = randomUUID();

  const keyDoc = {
    keyId,
    apiKey,
    userId,
    label,
    rateLimit,
    usageLimit,
    usageCount: 0,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUsedAt: null,
    rotatedFrom: null,
  };

  // Store key in api_keys collection
  await db.collection('api_keys').doc(keyId).set(keyDoc);

  // Also update the user's apiKey field for backward compatibility
  await db.collection('users').doc(userId).update({ apiKey });

  return {
    apiKey,
    keyId,
    label,
    rateLimit,
    usageLimit,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Rotate an API key — generate new key, invalidate old one.
 *
 * @param {string} keyId   The key document ID to rotate
 * @param {string} userId  Owner's user ID (for verification)
 * @returns {Promise<{ newApiKey: string, newKeyId: string, oldKeyId: string }>}
 */
export const rotateApiKey = async (keyId, userId) => {
  const keyRef = db.collection('api_keys').doc(keyId);
  const keyDoc = await keyRef.get();

  if (!keyDoc.exists) {
    const err = new Error('API key not found.');
    err.statusCode = 404;
    throw err;
  }

  const keyData = keyDoc.data();

  if (keyData.userId !== userId) {
    const err = new Error('Unauthorized: key does not belong to this user.');
    err.statusCode = 403;
    throw err;
  }

  // Deactivate old key
  await keyRef.update({
    isActive: false,
    deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
    deactivationReason: 'rotated',
  });

  // Create new key
  const newKey = await createApiKey({
    userId,
    label: `${keyData.label} (rotated)`,
    rateLimit: keyData.rateLimit,
    usageLimit: keyData.usageLimit,
  });

  // Link new key to old key
  await db.collection('api_keys').doc(newKey.keyId).update({
    rotatedFrom: keyId,
  });

  return {
    newApiKey: newKey.apiKey,
    newKeyId: newKey.keyId,
    oldKeyId: keyId,
  };
};

/**
 * Get all API keys for a user.
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
export const getKeysForUser = async (userId) => {
  const snapshot = await db.collection('api_keys')
    .where('userId', '==', userId)
    .where('isActive', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      keyId: data.keyId,
      apiKey: maskKey(data.apiKey),
      label: data.label,
      rateLimit: data.rateLimit,
      usageLimit: data.usageLimit,
      usageCount: data.usageCount,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      lastUsedAt: data.lastUsedAt?.toDate?.()?.toISOString() || null,
    };
  });
};

/**
 * Mask an API key for display — show first 12 and last 4 chars.
 * @param {string} key
 * @returns {string}
 */
const maskKey = (key) => {
  if (!key || key.length < 20) return '****';
  return `${key.substring(0, 12)}${'*'.repeat(key.length - 16)}${key.substring(key.length - 4)}`;
};

/**
 * Record an API key usage event.
 * @param {string} apiKey
 * @returns {Promise<void>}
 */
export const recordKeyUsage = async (apiKey) => {
  const snapshot = await db.collection('api_keys')
    .where('apiKey', '==', apiKey)
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    await docRef.update({
      usageCount: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
};

export default { createApiKey, rotateApiKey, getKeysForUser, recordKeyUsage };
