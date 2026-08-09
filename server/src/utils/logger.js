function timestamp() {
  return new Date().toISOString();
}

module.exports = {
  info: function (message) {
    console.log('[' + timestamp() + '] [INFO] ' + message);
  },
  warn: function (message) {
    console.warn('[' + timestamp() + '] [WARN] ' + message);
  },
  error: function (message, err) {
    console.error('[' + timestamp() + '] [ERROR] ' + message);
    if (err && err.stack) {
      console.error(err.stack);
    }
  }
};
