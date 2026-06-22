import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect routes — requires a valid Bearer token
 */
export const protect = async (req, res, next) => {
  try {
    // 1. Extract token
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authenticated. Please log in.');
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);

    // 3. Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'The user belonging to this token no longer exists.');
    }

    // 4. Check if user is banned
    if (user.is_banned) {
      return errorResponse(res, 403, 'Your account has been suspended. Contact support.');
    }

    // 5. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Your session has expired. Please log in again.');
    }
    next(error);
  }
};

/**
 * Restrict routes to specific roles
 * Usage: restrictTo('admin', 'founder')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        'You do not have permission to perform this action.'
      );
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token present, but does not block
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);
      if (user && !user.is_banned) {
        req.user = user;
      }
    }
  } catch (_) {
    // Silently ignore invalid tokens in optional auth
  }
  next();
};
