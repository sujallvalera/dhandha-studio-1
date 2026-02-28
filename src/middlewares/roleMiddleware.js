/**
 * Role-Based Access Control Middleware
 * --------------------------------------
 * Factory function that returns Express middleware enforcing role checks.
 *
 * Usage:
 *   router.get('/admin/stats', requireRole('admin'), handler);
 *   router.get('/user/profile', requireRole('user', 'admin'), handler);
 *
 * Expects req.user.role to be set by authMiddleware.
 */

/**
 * @param  {...string} allowedRoles  One or more role strings (e.g. 'admin', 'user', 'client')
 * @returns {import('express').RequestHandler}
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Safety: authMiddleware must run before this
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    const userRole = req.user.role;

    if (!userRole) {
      return res.status(403).json({
        error: 'User has no assigned role.',
        code: 'ROLE_MISSING',
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}.`,
        code: 'ROLE_FORBIDDEN',
      });
    }

    next();
  };
};

export default requireRole;
