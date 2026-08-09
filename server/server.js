const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const driveSyncService = require('./src/services/driveSyncService');


const server = app.listen(env.port, function () {
  logger.info('StudyKarle API running on port ' + env.port + ' [' + env.nodeEnv + ']');

  // Google Drive is the single source of truth: mirror it on boot and on a
  // periodic interval (when configured). Failures are logged, never fatal.
  let syncScheduler = null;
  if (env.driveSync.onStart || env.driveSync.intervalMs > 0) {
    syncScheduler = driveSyncService.startScheduledSync({
      initialDelayMs: 5000,
      intervalMs: env.driveSync.intervalMs,
    });
  }

  function shutdown() {
    if (syncScheduler && syncScheduler.stop) {
      try {
        syncScheduler.stop();
      } catch (err) {
        logger.error('Failed to stop drive sync scheduler', err);
      }
    }
  }

  process.once('SIGINT', function () {
    logger.info('SIGINT received, shutting down gracefully');
    shutdown();
    server.close(function () {
      process.exit(0);
    });
  });
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
