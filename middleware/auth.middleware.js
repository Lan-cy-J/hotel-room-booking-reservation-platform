const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * Authentication Middleware
 * Extracts Bearer token from Authorization header and verifies user
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Authentication required. Missing or malformed Bearer token.'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(ApiError.unauthorized('Authentication token missing.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_cia3_hotel_platform_2026');
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(ApiError.unauthorized('User corresponding to this token no longer exists.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    return next(ApiError.unauthorized('Authentication failed'));
  }
};

module.exports = {
  authenticateJWT
};
