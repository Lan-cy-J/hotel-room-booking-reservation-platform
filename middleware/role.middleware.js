const ApiError = require('../utils/apiError');
const { USER_ROLES } = require('../utils/constants');

/**
 * Role-Based Access Control Middleware
 * @param  {...string} allowedRoles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access forbidden: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

/**
 * Hotel Scoping Middleware for Staff
 * Ensures staff can only access resources belonging to their assigned hotelId
 */
const scopeHotelStaff = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('User authentication required'));
  }

  // Admin bypasses hotel-scoping
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  // If role is staff, ensure they belong to a hotel and check target hotelId
  if (req.user.role === USER_ROLES.STAFF) {
    if (!req.user.hotelId) {
      return next(ApiError.forbidden('Staff member is not assigned to any hotel'));
    }

    const targetHotelId =
      req.params.hotelId ||
      req.body.hotelId ||
      req.query.hotelId;

    if (targetHotelId && targetHotelId.toString() !== req.user.hotelId.toString()) {
      return next(
        ApiError.forbidden('Staff access denied: You can only access and manage your assigned hotel')
      );
    }
  }

  next();
};

module.exports = {
  authorizeRoles,
  scopeHotelStaff
};
