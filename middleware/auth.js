/**
 * ============================================================
 *  NAISHVI CELEBRATIONS — JWT Authentication Middleware
 * ============================================================
 *  Provides two middleware helpers:
 *    • authenticate  — verifies the Bearer token on every request
 *    • authorizeRole — restricts access to specific roles
 * ============================================================
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'naishvi-celebrations-secret-key-2024';

/**
 * authenticate
 * Extracts the JWT from the Authorization header, verifies it,
 * and attaches req.user = { id, email, role }.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * authorizeRole(...roles)
 * Returns middleware that only allows users whose role is in the
 * supplied list.  Must be used AFTER authenticate.
 *
 * Example: authorizeRole('admin')
 */
function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRole, JWT_SECRET };
