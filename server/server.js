const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');


const server = app.listen(env.port, function () {
  logger.info('StudyKarle API running on port ' + env.port + ' [' + env.nodeEnv + ']');
});

process.on('unhandledRejection', function (err) {
  logger.error('Unhandled promise rejection', err);
  server.close(function () {
    process.exit(1);
  });
});

process.on('SIGTERM', function () {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(function () {
    process.exit(0);
  });
});
