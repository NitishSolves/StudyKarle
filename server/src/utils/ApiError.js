function ApiError(statusCode, message, details) {
  Error.call(this, message);
  this.name = 'ApiError';
  this.statusCode = statusCode;
  this.message = message;
  this.details = details || null;
  this.isOperational = true;
  Error.captureStackTrace(this, ApiError);
}

ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;

ApiError.badRequest = function (message, details) {
  return new ApiError(400, message || 'Bad request', details);
};
ApiError.unauthorized = function (message) {
  return new ApiError(401, message || 'Unauthorized');
};
ApiError.forbidden = function (message) {
  return new ApiError(403, message || 'Forbidden');
};
ApiError.notFound = function (message) {
  return new ApiError(404, message || 'Resource not found');
};
ApiError.conflict = function (message) {
  return new ApiError(409, message || 'Conflict');
};
ApiError.internal = function (message) {
  return new ApiError(500, message || 'Internal server error');
};

module.exports = ApiError;
