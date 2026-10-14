const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB, getDBStatus } = require('./config/db');
const { connectMySQL, getMySQLStatus } = require('./config/mysql');
const { DEFAULT_PORT } = require('./config/constants');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const mysqlSyncService = require('./services/mysqlSync.service');

// Routes
const authRoutes = require('./routes/auth.routes');
const topicRoutes = require('./routes/topic.routes');
const blogRoutes = require('./routes/blog.routes');
const mlRoutes = require('./routes/ml.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const settingsRoutes = require('./routes/settings.routes');
const webhookRoutes = require('./routes/webhook.routes');
const mysqlRoutes = require('./routes/mysql.routes');
const gcpRoutes = require('./routes/gcp.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const v1ApiRoutes = require('./routes/v1Api.routes');

// Autonomous Cron Engine
const autonomousWorkflow = require('./services/autonomousWorkflow');

const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'x-api-key',
    'X-Blogger-API-Key',
    'x-blogger-api-key',
    'X-Blogger-Signature',
    'x-blogger-signature',
    'X-Autonomous-Blogger-Signature'
  ],
  exposedHeaders: [
    'X-Subscription-Plan',
    'x-subscription-plan',
    'X-Subscription-Requests-Limit',
    'x-subscription-requests-limit',
    'X-Subscription-Requests-Remaining',
    'x-subscription-requests-remaining',
    'X-Subscription-Generations-Remaining',
    'x-subscription-generations-remaining',
    'X-Subscription-Period-End',
    'x-subscription-period-end'
  ]
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static serving for Live Website Demo and Uploads
app.use('/live-site', express.static(path.join(__dirname, '../live-website-demo')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check endpoint (accessible via /health and /api/health)
app.get(['/health', '/api/health'], async (req, res) => {
  const mysqlStat = await getMySQLStatus();
  res.json({
    status: 'healthy',
    service: 'Autonomous Blogger Backend API',
    version: '1.0.0',
    database: getDBStatus(),
    mysql: mysqlStat,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', apiLimiter, topicRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/public', webhookRoutes);
app.use('/api/mysql', mysqlRoutes);
app.use('/api/gcp', gcpRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/v1', v1ApiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server & Initialize Services
const startServer = async () => {
  console.log('====================================================');
  console.log('STARTING AUTONOMOUS BLOGGER BACKEND SERVER');
  console.log('====================================================');

  await connectDB();
  await connectMySQL();

  // Try initial sync if MySQL is connected
  try {
    const mySqlStatus = await getMySQLStatus();
    if (mySqlStatus.isConnected) {
      console.log('[MySQL] Running initial data synchronization...');
      await mysqlSyncService.syncAllFromMongo();
    }
  } catch (err) {
    console.warn('[MySQL Sync Note]', err.message);
  }

  // Ingest and synchronize ITLC Foundation Hub resources
  try {
    const itlcSyncService = require('./services/itlcSyncService');
    await itlcSyncService.syncITLCData();
  } catch (itlcErr) {
    console.warn('[ITLC Ingestion Note]', itlcErr.message);
  }

  // Initialize daily cron scheduler
  autonomousWorkflow.initScheduler();

  app.listen(PORT, () => {
    console.log(`[Backend API] Server successfully listening on http://localhost:${PORT}`);
    console.log(`[Backend API] Health Check: http://localhost:${PORT}/health`);
    console.log(`[Backend API] MySQL API: http://localhost:${PORT}/api/mysql/status`);
    console.log(`[Backend API] Public Blog Feed: http://localhost:${PORT}/api/public/blogs`);
  });
};

startServer();

module.exports = app;
