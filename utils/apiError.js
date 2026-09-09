class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request', errors = null) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized access') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden: Insufficient privileges') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Conflict: Resource state conflict or double booking') {
    return new ApiError(409, msg);
  }

  static unprocessable(msg = 'Unprocessable Entity', errors = null) {
    return new ApiError(422, msg, errors);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;
