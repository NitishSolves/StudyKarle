const knex = require('knex');
const knexConfig = require('../../knexfile');
const env = require('./env');

const config = knexConfig[env.nodeEnv] || knexConfig.development;
const db = knex(config);

db.raw('select 1')
  .then(function () {
    console.log('[db] PostgreSQL connection established');
  })
  .catch(function (err) {
    console.error('[db] Failed to connect to PostgreSQL:', err.message);
  });

module.exports = db;
