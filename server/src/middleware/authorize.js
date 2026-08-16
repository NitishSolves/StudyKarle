const ApiError = require('../utils/ApiError');

module.exports = function authorize() {
  const allowedRoles = Array.prototype.slice.call(arguments);

  return function (req, res, next) {
    if (!req.user) {
      return next(ApiError.unauthorized('You must be logged in'));
    }
    if (allowedRoles.length > 0 && allowedRoles.indexOf(req.user.role) === -1) {
      return next(ApiError.forbidden('You are not authorized to access this resource'));
    }
    next();
  };
};
