/**
 * Admin Controller
 * ------------------
 * Handles all admin dashboard endpoints.
 * Protected by requireRole('admin').
 *
 * Endpoints:
 *   GET  /admin/stats         — Platform analytics
 *   GET  /admin/users         — All users
 *   GET  /admin/clients       — All API clients
 *   GET  /admin/refunds       — Pending refund requests
 *   POST /admin/refunds/:id/approve
 *   POST /admin/refunds/:id/reject
 *   POST /admin/credits/adjust
 */

import { getDashboardStats } from '../services/analyticsService.js';
import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';

/**
 * GET /admin/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json({ status: 'ok', data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/users?limit=50&role=user
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const roleFilter = req.query.role;

    let query = db.collection('users').limit(limit);
    if (roleFilter) {
      query = query.where('role', '==', roleFilter);
    }

    const snapshot = await query.get();
    const users = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
      apiKey: undefined,  // Never expose API keys in admin list
    }));

    res.status(200).json({ status: 'ok', count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/clients
 */
export const getAllClients = async (req, res, next) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'client')
      .get();

    const clients = snapshot.docs.map((doc) => ({
      clientId: doc.id,
      name: doc.data().name || doc.data().clientId,
      email: doc.data().email || null,
      credits: doc.data().credits || 0,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    res.status(200).json({ status: 'ok', count: clients.length, data: clients });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/refunds
 */
export const getRefundRequests = async (req, res, next) => {
  try {
    const snapshot = await db.collection('refund_requests')
      .where('status', '==', 'pending')
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();

    const refunds = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || null,
    }));

    res.status(200).json({ status: 'ok', count: refunds.length, data: refunds });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/refunds/:id/approve
 */
export const approveRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const refundRef = db.collection('refund_requests').doc(id);
    const refundDoc = await refundRef.get();

    if (!refundDoc.exists) {
      const err = new Error('Refund request not found.');
      err.statusCode = 404;
      throw err;
    }

    const refundData = refundDoc.data();

    // Credit the user
    const userRef = db.collection('users').doc(refundData.user_id);
    await userRef.update({
      credits: admin.firestore.FieldValue.increment(refundData.credits_requested || 1),
    });

    // Update refund status
    await refundRef.update({
      status: 'approved',
      approved_by: req.user.userId,
      approved_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      status: 'ok',
      message: `Refund approved. ${refundData.credits_requested || 1} credit(s) returned to user ${refundData.user_id}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/refunds/:id/reject
 */
export const rejectRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const refundRef = db.collection('refund_requests').doc(id);
    const refundDoc = await refundRef.get();

    if (!refundDoc.exists) {
      const err = new Error('Refund request not found.');
      err.statusCode = 404;
      throw err;
    }

    await refundRef.update({
      status: 'rejected',
      rejection_reason: reason || 'No reason provided.',
      rejected_by: req.user.userId,
      rejected_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ status: 'ok', message: 'Refund request rejected.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/credits/adjust
 * Body: { userId, amount, reason }
 */
export const adjustCredits = async (req, res, next) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || amount == null) {
      const err = new Error('userId and amount are required.');
      err.statusCode = 400;
      throw err;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      const err = new Error('amount must be a number.');
      err.statusCode = 400;
      throw err;
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    await userRef.update({
      credits: admin.firestore.FieldValue.increment(numAmount),
    });

    // Log the adjustment
    await db.collection('credit_adjustments').add({
      userId,
      amount: numAmount,
      reason: reason || 'Admin adjustment',
      adjusted_by: req.user.userId,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const updatedDoc = await userRef.get();

    res.status(200).json({
      status: 'ok',
      message: `Credits adjusted by ${numAmount} for user ${userId}.`,
      newBalance: updatedDoc.data().credits,
    });
  } catch (error) {
    next(error);
  }
};

export default { getStats, getAllUsers, getAllClients, getRefundRequests, approveRefund, rejectRefund, adjustCredits };
