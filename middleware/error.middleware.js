const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  // If headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle custom ApiError instances
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return ApiResponse.error(res, 'Mongoose Validation Error', 400, messages);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    return ApiResponse.error(
      res,
      `Duplicate value entered for '${field}': "${value}". Must be unique.`,
      409
    );
  }

  // Handle Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      `Invalid resource identifier (ObjectId): '${err.value}' for field '${err.path}'`,
      400
    );
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Authentication token has expired', 401);
  }

  // Unhandled / Unexpected Server Errors
  console.error('[Unhandled Server Error]', err);
  const isDev = process.env.NODE_ENV === 'development';
  return ApiResponse.error(
    res,
    isDev ? err.message : 'Internal Server Error',
    500,
    isDev ? err.stack : null
  );
}

module.exports = errorMiddleware;
