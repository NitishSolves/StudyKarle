const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map(function (e) {
      return { field: e.param, message: e.msg };
    });
    return next(ApiError.badRequest('Validation failed', details));
  }
  next();
};
