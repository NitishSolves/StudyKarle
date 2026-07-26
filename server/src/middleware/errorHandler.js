const env = require('../config/env');
const logger = require('../utils/logger');

module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    logger.error('Unhandled error on ' + req.method + ' ' + req.originalUrl, err);
  }

  // If a response has already started (e.g. a PDF stream that failed
  // partway through), we can't send a fresh JSON body on top of it. Express
  // requires delegating to its default handler in this case, which just
  // closes the connection instead of throwing ERR_HTTP_HEADERS_SENT.
  if (res.headersSent) {
    return next(err);
  }

  const body = {
    success: false,
    message: isOperational ? err.message : 'Something went wrong. Please try again.'
  };

  if (err.details) {
    body.details = err.details;
  }

  if (!env.isProduction && !isOperational) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
};
