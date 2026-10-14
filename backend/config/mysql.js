const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool = null;
let currentConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'autonomous_blogger',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

let connectionState = {
  isConnected: false,
  lastError: null,
  version: null,
  database: currentConfig.database,
  host: currentConfig.host,
  port: currentConfig.port,
  user: currentConfig.user,
  lastCheckedAt: null
};

/**
 * Initialize MySQL Connection Pool and auto-create database and tables
 */
async function connectMySQL(customConfig = null) {
  if (customConfig) {
    currentConfig = {
      ...currentConfig,
      ...customConfig,
      port: parseInt(customConfig.port || '3306', 10)
    };
  }

  // End existing pool if open
  if (pool) {
    try {
      await pool.end();
    } catch (e) {}
    pool = null;
  }

  try {
    console.log(`[MySQL] Connecting to MySQL at ${currentConfig.host}:${currentConfig.port} as user "${currentConfig.user}"...`);

    // First connect without specifying database to ensure database exists
    const adminConn = await mysql.createConnection({
      host: currentConfig.host,
      port: currentConfig.port,
      user: currentConfig.user,
      password: currentConfig.password,
      connectTimeout: 5000
    });

    // Create database if not exists
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${currentConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    
    // Get MySQL version
    const [verRows] = await adminConn.query('SELECT VERSION() AS version;');
    connectionState.version = verRows[0]?.version || '8.0';
    await adminConn.end();

    // Now create pool connected to the target database
    pool = mysql.createPool({
      host: currentConfig.host,
      port: currentConfig.port,
      user: currentConfig.user,
      password: currentConfig.password,
      database: currentConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });

    // Test connection from pool
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    connectionState.isConnected = true;
    connectionState.lastError = null;
    connectionState.database = currentConfig.database;
    connectionState.host = currentConfig.host;
    connectionState.port = currentConfig.port;
    connectionState.user = currentConfig.user;
    connectionState.lastCheckedAt = new Date().toISOString();

    console.log(`[MySQL] Successfully connected to MySQL database "${currentConfig.database}" (v${connectionState.version})`);

    // Ensure all tables are created
    await createTables();

    return { success: true, message: 'MySQL Connected successfully' };
  } catch (err) {
    connectionState.isConnected = false;
    connectionState.lastError = err.message;
    connectionState.lastCheckedAt = new Date().toISOString();
    console.warn(`[MySQL Warning] Could not connect to MySQL: ${err.message}`);
    console.warn(`[MySQL Warning] Backend will continue running with MongoDB. You can configure MySQL credentials in the settings or .env`);
    return { success: false, error: err.message };
  }
}

/**
 * Create all necessary tables in MySQL if they do not exist
 */
async function createTables() {
  if (!pool) return;

  const createBlogsTableSQL = `
    CREATE TABLE IF NOT EXISTS blogs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mongo_id VARCHAR(64) UNIQUE,
      title VARCHAR(500) NOT NULL,
      slug VARCHAR(500) UNIQUE NOT NULL,
      excerpt TEXT,
      content_markdown LONGTEXT NOT NULL,
      content_html LONGTEXT,
      category VARCHAR(100) DEFAULT 'Artificial Intelligence',
      tags JSON,
      topic_id VARCHAR(64),
      topic_title VARCHAR(500),
      author VARCHAR(200) DEFAULT 'AI Autonomous Editor',
      status VARCHAR(50) DEFAULT 'DRAFT',
      brand_voice_used VARCHAR(100) DEFAULT 'Humanized Educational',
      
      -- Featured Image
      featured_image_url TEXT,
      featured_image_alt TEXT,
      featured_image_prompt TEXT,
      
      -- SEO Fields
      seo_score INT DEFAULT 85,
      meta_title VARCHAR(500),
      meta_description TEXT,
      primary_keyword VARCHAR(200),
      secondary_keywords JSON,
      canonical_url VARCHAR(500),
      schema_markup JSON,
      
      -- Quality & Performance Metrics
      quality_score INT DEFAULT 85,
      readability_score INT DEFAULT 72,
      reading_grade_level VARCHAR(50) DEFAULT 'Standard',
      duplicate_similarity_score FLOAT DEFAULT 0.0,
      is_duplicate_risk TINYINT(1) DEFAULT 0,
      predicted_views INT DEFAULT 3500,
      engagement_probability FLOAT DEFAULT 0.78,
      performance_score INT DEFAULT 82,
      estimated_reading_time_mins INT DEFAULT 6,
      
      -- Research & Links
      source_citations JSON,
      recommended_internal_links JSON,
      
      -- Sync & Publication
      live_synced TINYINT(1) DEFAULT 0,
      remote_post_id VARCHAR(100),
      scheduled_publish_time DATETIME NULL,
      published_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_status (status),
      INDEX idx_category (category),
      INDEX idx_created (created_at),
      INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createTopicsTableSQL = `
    CREATE TABLE IF NOT EXISTS topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mongo_id VARCHAR(64) UNIQUE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      keywords JSON,
      category VARCHAR(100) DEFAULT 'Artificial Intelligence',
      website_niche VARCHAR(100) DEFAULT 'Technology & AI',
      
      -- Scores
      trend_score FLOAT DEFAULT 75.0,
      relevance_score FLOAT DEFAULT 0.85,
      seo_opportunity FLOAT DEFAULT 80.0,
      predicted_performance FLOAT DEFAULT 78.0,
      topic_priority_score FLOAT DEFAULT 82.0,
      
      -- Search metrics
      search_volume INT DEFAULT 5000,
      search_growth_pct FLOAT DEFAULT 35.0,
      news_frequency INT DEFAULT 12,
      keyword_competition FLOAT DEFAULT 0.40,
      reasoning TEXT,
      cluster_name VARCHAR(100) DEFAULT 'General Tech',
      status VARCHAR(50) DEFAULT 'discovered',
      
      discovered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      INDEX idx_topic_status (status),
      INDEX idx_priority (topic_priority_score)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createAnalyticsTableSQL = `
    CREATE TABLE IF NOT EXISTS blog_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mongo_id VARCHAR(64) UNIQUE,
      blog_id VARCHAR(64),
      blog_title VARCHAR(500),
      views INT DEFAULT 0,
      unique_visitors INT DEFAULT 0,
      avg_time_on_page_secs INT DEFAULT 0,
      scroll_depth_pct FLOAT DEFAULT 0.0,
      bounce_rate_pct FLOAT DEFAULT 0.0,
      social_shares INT DEFAULT 0,
      ctr_pct FLOAT DEFAULT 0.0,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      INDEX idx_analytics_blog (blog_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const createSettingsTableSQL = `
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value LONGTEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    const conn = await pool.getConnection();
    await conn.query(createBlogsTableSQL);
    await conn.query(createTopicsTableSQL);
    await conn.query(createAnalyticsTableSQL);
    await conn.query(createSettingsTableSQL);
    conn.release();
    console.log('[MySQL] Database tables verified & initialized (blogs, topics, blog_analytics, platform_settings)');
  } catch (err) {
    console.error('[MySQL] Error creating tables:', err.message);
  }
}

/**
 * Get current MySQL status and table statistics
 */
async function getMySQLStatus() {
  if (!pool || !connectionState.isConnected) {
    return {
      ...connectionState,
      isConnected: false,
      tables: { blogs: 0, topics: 0, blog_analytics: 0, platform_settings: 0 }
    };
  }

  try {
    const conn = await pool.getConnection();
    const [blogsCount] = await conn.query('SELECT COUNT(*) as cnt FROM blogs');
    const [topicsCount] = await conn.query('SELECT COUNT(*) as cnt FROM topics');
    const [analyticsCount] = await conn.query('SELECT COUNT(*) as cnt FROM blog_analytics');
    const [settingsCount] = await conn.query('SELECT COUNT(*) as cnt FROM platform_settings');
    conn.release();

    return {
      ...connectionState,
      isConnected: true,
      lastCheckedAt: new Date().toISOString(),
      tables: {
        blogs: blogsCount[0]?.cnt || 0,
        topics: topicsCount[0]?.cnt || 0,
        blog_analytics: analyticsCount[0]?.cnt || 0,
        platform_settings: settingsCount[0]?.cnt || 0
      }
    };
  } catch (err) {
    return {
      ...connectionState,
      isConnected: false,
      lastError: err.message
    };
  }
}

/**
 * Get the MySQL pool instance
 */
function getPool() {
  return pool;
}

/**
 * Helper to update .env with new MySQL credentials
 */
function updateEnvMySQLConfig(newConfig) {
  const envPath = path.resolve(__dirname, '../.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const updates = {
    MYSQL_HOST: newConfig.host || 'localhost',
    MYSQL_PORT: newConfig.port || '3306',
    MYSQL_USER: newConfig.user || 'root',
    MYSQL_PASSWORD: newConfig.password !== undefined ? newConfig.password : '',
    MYSQL_DATABASE: newConfig.database || 'autonomous_blogger',
    MYSQL_ENABLED: 'true'
  };

  for (const [key, val] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content += `\n${key}=${val}`;
    }
  }

  fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
}

module.exports = {
  connectMySQL,
  getPool,
  getMySQLStatus,
  createTables,
  updateEnvMySQLConfig,
  getCurrentConfig: () => ({ ...currentConfig, password: currentConfig.password ? '******' : '' })
};
