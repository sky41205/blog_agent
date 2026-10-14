const express = require('express');
const router = express.Router();
const { getMySQLStatus, connectMySQL, updateEnvMySQLConfig, getCurrentConfig, getPool } = require('../config/mysql');
const mysqlSyncService = require('../services/mysqlSync.service');

/**
 * GET /api/mysql/status
 * Check MySQL connection status and table row counts
 */
router.get('/status', async (req, res, next) => {
  try {
    const status = await getMySQLStatus();
    const config = getCurrentConfig();
    res.json({
      success: true,
      data: {
        ...status,
        config
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/mysql/blogs
 * Fetch blogs stored directly in MySQL table
 */
router.get('/blogs', async (req, res, next) => {
  try {
    const { status, category, search, limit = 50, offset = 0 } = req.query;
    const result = await mysqlSyncService.fetchBlogsFromMySQL({
      status,
      category,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
    res.json({
      success: true,
      source: 'MySQL Database',
      ...result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to fetch blogs from MySQL. Please check MySQL connection.'
    });
  }
});

/**
 * GET /api/mysql/topics
 * Fetch topics stored directly in MySQL table
 */
router.get('/topics', async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const topics = await mysqlSyncService.fetchTopicsFromMySQL({
      status,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
    res.json({
      success: true,
      source: 'MySQL Database',
      total: topics.length,
      topics
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Failed to fetch topics from MySQL.'
    });
  }
});

/**
 * GET /api/mysql/tables
 * List all MySQL tables, column types, and row counts
 */
router.get('/tables', async (req, res, next) => {
  try {
    const data = await mysqlSyncService.fetchTablesSchema();
    res.json({
      success: true,
      ...data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * GET /api/mysql/table-data/:tableName
 * View raw table rows
 */
router.get('/table-data/:tableName', async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const allowedTables = ['blogs', 'topics', 'blog_analytics', 'platform_settings'];
    if (!allowedTables.includes(tableName)) {
      return res.status(400).json({ success: false, message: 'Invalid table name requested' });
    }

    const pool = getPool();
    if (!pool) {
      return res.status(503).json({ success: false, message: 'MySQL is not connected' });
    }

    const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`, [Number(limit), Number(offset)]);
    const [count] = await pool.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);

    res.json({
      success: true,
      tableName,
      total: count[0]?.total || 0,
      limit: Number(limit),
      offset: Number(offset),
      rows
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mysql/sync-all
 * Trigger full sync from MongoDB to MySQL
 */
router.post('/sync-all', async (req, res, next) => {
  try {
    const summary = await mysqlSyncService.syncAllFromMongo();
    const status = await getMySQLStatus();
    res.json({
      success: true,
      message: 'Full synchronization to MySQL completed successfully',
      summary,
      status
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Sync to MySQL failed'
    });
  }
});

/**
 * POST /api/mysql/test-connection
 * Test connection with custom MySQL credentials
 */
router.post('/test-connection', async (req, res, next) => {
  try {
    const { host, port, user, password, database } = req.body;
    const testResult = await connectMySQL({
      host: host || 'localhost',
      port: port || 3306,
      user: user || 'root',
      password: password !== undefined ? password : '',
      database: database || 'autonomous_blogger'
    });

    if (testResult.success) {
      // Auto sync after successful connection
      try {
        await mysqlSyncService.syncAllFromMongo();
      } catch (e) {}

      res.json({
        success: true,
        message: 'MySQL Connection verified and database initialized successfully!',
        status: await getMySQLStatus()
      });
    } else {
      res.status(400).json({
        success: false,
        error: testResult.error,
        message: `Failed to connect to MySQL: ${testResult.error}`
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * POST /api/mysql/save-config
 * Save MySQL configuration into .env and reconnect
 */
router.post('/save-config', async (req, res, next) => {
  try {
    const { host, port, user, password, database } = req.body;
    updateEnvMySQLConfig({ host, port, user, password, database });

    const connectResult = await connectMySQL({ host, port, user, password, database });
    if (connectResult.success) {
      try {
        await mysqlSyncService.syncAllFromMongo();
      } catch (e) {}
    }

    res.json({
      success: connectResult.success,
      message: connectResult.success
        ? 'MySQL settings saved to .env and connected successfully!'
        : `Settings saved, but connection error: ${connectResult.error}`,
      status: await getMySQLStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mysql/query
 * Execute custom SQL query (SELECT / SHOW / DESCRIBE)
 */
router.post('/query', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Query string is required' });
    }

    const result = await mysqlSyncService.executeCustomQuery(query);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
