const { getPool, getMySQLStatus, connectMySQL } = require('../config/mysql');
const Blog = require('../models/Blog');
const Topic = require('../models/Topic');
const BlogAnalytics = require('../models/BlogAnalytics');
const Setting = require('../models/Setting');

class MySQLSyncService {
  /**
   * Helper to format Date objects for MySQL DATETIME
   */
  formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Safe JSON stringify helper
   */
  safeJson(val) {
    if (val === undefined || val === null) return null;
    if (typeof val === 'string') return val;
    return JSON.stringify(val);
  }

  /**
   * Safe JSON parse helper
   */
  safeParse(val, fallback = null) {
    if (!val) return fallback;
    if (typeof val !== 'string') return val;
    try {
      return JSON.parse(val);
    } catch {
      return fallback !== null ? fallback : val;
    }
  }

  /**
   * Save or Update a single Blog in MySQL
   */
  async saveBlogToMySQL(blogDoc) {
    const pool = getPool();
    if (!pool) return null;

    try {
      const blog = blogDoc.toObject ? blogDoc.toObject() : blogDoc;
      const mongoId = blog._id ? blog._id.toString() : null;

      const sql = `
        INSERT INTO blogs (
          mongo_id, title, slug, excerpt, content_markdown, content_html,
          category, tags, topic_id, topic_title, author, status, brand_voice_used,
          featured_image_url, featured_image_alt, featured_image_prompt,
          seo_score, meta_title, meta_description, primary_keyword, secondary_keywords,
          canonical_url, schema_markup,
          quality_score, readability_score, reading_grade_level, duplicate_similarity_score, is_duplicate_risk,
          predicted_views, engagement_probability, performance_score, estimated_reading_time_mins,
          source_citations, recommended_internal_links,
          live_synced, remote_post_id, scheduled_publish_time, published_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?, ?
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          excerpt = VALUES(excerpt),
          content_markdown = VALUES(content_markdown),
          content_html = VALUES(content_html),
          category = VALUES(category),
          tags = VALUES(tags),
          topic_id = VALUES(topic_id),
          topic_title = VALUES(topic_title),
          author = VALUES(author),
          status = VALUES(status),
          brand_voice_used = VALUES(brand_voice_used),
          featured_image_url = VALUES(featured_image_url),
          featured_image_alt = VALUES(featured_image_alt),
          featured_image_prompt = VALUES(featured_image_prompt),
          seo_score = VALUES(seo_score),
          meta_title = VALUES(meta_title),
          meta_description = VALUES(meta_description),
          primary_keyword = VALUES(primary_keyword),
          secondary_keywords = VALUES(secondary_keywords),
          canonical_url = VALUES(canonical_url),
          schema_markup = VALUES(schema_markup),
          quality_score = VALUES(quality_score),
          readability_score = VALUES(readability_score),
          reading_grade_level = VALUES(reading_grade_level),
          duplicate_similarity_score = VALUES(duplicate_similarity_score),
          is_duplicate_risk = VALUES(is_duplicate_risk),
          predicted_views = VALUES(predicted_views),
          engagement_probability = VALUES(engagement_probability),
          performance_score = VALUES(performance_score),
          estimated_reading_time_mins = VALUES(estimated_reading_time_mins),
          source_citations = VALUES(source_citations),
          recommended_internal_links = VALUES(recommended_internal_links),
          live_synced = VALUES(live_synced),
          remote_post_id = VALUES(remote_post_id),
          scheduled_publish_time = VALUES(scheduled_publish_time),
          published_at = VALUES(published_at),
          updated_at = CURRENT_TIMESTAMP;
      `;

      const values = [
        mongoId,
        blog.title || 'Untitled Blog',
        blog.slug || `blog-${Date.now()}`,
        blog.excerpt || '',
        blog.contentMarkdown || '',
        blog.contentHtml || '',
        blog.category || 'Artificial Intelligence',
        this.safeJson(blog.tags || []),
        blog.topicId ? blog.topicId.toString() : null,
        blog.topicTitle || '',
        blog.author || 'AI Autonomous Editor',
        blog.status || 'DRAFT',
        blog.brandVoiceUsed || 'Humanized Educational',
        
        blog.featuredImage?.url || null,
        blog.featuredImage?.altText || null,
        blog.featuredImage?.prompt || null,
        
        blog.seo?.seoScore ?? 85,
        blog.seo?.metaTitle || blog.title || '',
        blog.seo?.metaDescription || blog.excerpt || '',
        blog.seo?.primaryKeyword || '',
        this.safeJson(blog.seo?.secondaryKeywords || []),
        blog.seo?.canonicalUrl || '',
        this.safeJson(blog.seo?.schemaMarkup || {}),
        
        blog.qualityMetrics?.qualityScore ?? 85,
        blog.qualityMetrics?.readabilityScore ?? 72,
        blog.qualityMetrics?.readingGradeLevel || 'Standard',
        blog.qualityMetrics?.duplicateSimilarityScore ?? 0.0,
        blog.qualityMetrics?.isDuplicateRisk ? 1 : 0,
        
        blog.performancePrediction?.predictedViews ?? 3500,
        blog.performancePrediction?.engagementProbability ?? 0.78,
        blog.performancePrediction?.performanceScore ?? 82,
        blog.performancePrediction?.estimatedReadingTimeMins ?? 6,
        
        this.safeJson(blog.sourceCitations || []),
        this.safeJson(blog.recommendedInternalLinks || []),
        
        blog.liveSync?.synced ? 1 : 0,
        blog.liveSync?.remotePostId || '',
        this.formatDate(blog.scheduledPublishTime),
        this.formatDate(blog.publishedAt),
        this.formatDate(blog.createdAt || new Date()),
        this.formatDate(blog.updatedAt || new Date())
      ];

      const [result] = await pool.query(sql, values);
      return { success: true, insertId: result.insertId, affectedRows: result.affectedRows };
    } catch (err) {
      console.error(`[MySQL Sync Error] Failed to save blog "${blogDoc?.title}":`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a blog from MySQL
   */
  async deleteBlogFromMySQL(idOrSlug) {
    const pool = getPool();
    if (!pool) return false;
    try {
      await pool.query('DELETE FROM blogs WHERE mongo_id = ? OR slug = ? OR id = ?', [idOrSlug, idOrSlug, idOrSlug]);
      return true;
    } catch (err) {
      console.error('[MySQL Sync Error] Failed to delete blog:', err.message);
      return false;
    }
  }

  /**
   * Save or Update a single Topic in MySQL
   */
  async saveTopicToMySQL(topicDoc) {
    const pool = getPool();
    if (!pool) return null;

    try {
      const topic = topicDoc.toObject ? topicDoc.toObject() : topicDoc;
      const mongoId = topic._id ? topic._id.toString() : null;

      const sql = `
        INSERT INTO topics (
          mongo_id, title, description, keywords, category, website_niche,
          trend_score, relevance_score, seo_opportunity, predicted_performance, topic_priority_score,
          search_volume, search_growth_pct, news_frequency, keyword_competition,
          reasoning, cluster_name, status, discovered_at, approved_at, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?
        )
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          keywords = VALUES(keywords),
          category = VALUES(category),
          website_niche = VALUES(website_niche),
          trend_score = VALUES(trend_score),
          relevance_score = VALUES(relevance_score),
          seo_opportunity = VALUES(seo_opportunity),
          predicted_performance = VALUES(predicted_performance),
          topic_priority_score = VALUES(topic_priority_score),
          search_volume = VALUES(search_volume),
          search_growth_pct = VALUES(search_growth_pct),
          news_frequency = VALUES(news_frequency),
          keyword_competition = VALUES(keyword_competition),
          reasoning = VALUES(reasoning),
          cluster_name = VALUES(cluster_name),
          status = VALUES(status),
          approved_at = VALUES(approved_at),
          updated_at = CURRENT_TIMESTAMP;
      `;

      const values = [
        mongoId,
        topic.title,
        topic.description || '',
        this.safeJson(topic.keywords || []),
        topic.category || 'Artificial Intelligence',
        topic.websiteNiche || 'Technology & AI',
        topic.trendScore ?? 75.0,
        topic.relevanceScore ?? 0.85,
        topic.seoOpportunity ?? 80.0,
        topic.predictedPerformance ?? 78.0,
        topic.topicPriorityScore ?? 82.0,
        topic.searchVolume ?? 5000,
        topic.searchGrowthPct ?? 35.0,
        topic.newsFrequency ?? 12,
        topic.keywordCompetition ?? 0.40,
        topic.reasoning || '',
        topic.clusterName || 'General Tech',
        topic.status || 'discovered',
        this.formatDate(topic.discoveredAt || new Date()),
        this.formatDate(topic.approvedAt),
        this.formatDate(topic.createdAt || new Date()),
        this.formatDate(topic.updatedAt || new Date())
      ];

      const [result] = await pool.query(sql, values);
      return { success: true, insertId: result.insertId };
    } catch (err) {
      console.error(`[MySQL Sync Error] Failed to save topic "${topicDoc?.title}":`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Save Analytics row into MySQL
   */
  async saveAnalyticsToMySQL(analyticsDoc) {
    const pool = getPool();
    if (!pool) return null;

    try {
      const a = analyticsDoc.toObject ? analyticsDoc.toObject() : analyticsDoc;
      const mongoId = a._id ? a._id.toString() : null;

      const sql = `
        INSERT INTO blog_analytics (
          mongo_id, blog_id, blog_title, views, unique_visitors,
          avg_time_on_page_secs, scroll_depth_pct, bounce_rate_pct, social_shares, ctr_pct, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          views = VALUES(views),
          unique_visitors = VALUES(unique_visitors),
          avg_time_on_page_secs = VALUES(avg_time_on_page_secs),
          scroll_depth_pct = VALUES(scroll_depth_pct),
          bounce_rate_pct = VALUES(bounce_rate_pct),
          social_shares = VALUES(social_shares),
          ctr_pct = VALUES(ctr_pct);
      `;

      const values = [
        mongoId,
        a.blogId ? a.blogId.toString() : null,
        a.blogTitle || 'Untitled Blog',
        a.views || 0,
        a.uniqueVisitors || 0,
        a.avgTimeOnPageSecs || 0,
        a.scrollDepthPct || 0.0,
        a.bounceRatePct || 0.0,
        a.socialShares || 0,
        a.ctrPct || 0.0,
        this.formatDate(a.recordedAt || new Date())
      ];

      await pool.query(sql, values);
      return { success: true };
    } catch (err) {
      console.error('[MySQL Sync Error] Failed to save analytics:', err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Directly record / update analytics event into MySQL
   */
  async syncAnalyticsEventToMySQL({ blogSlug, blogTitle, views, uniqueVisitors, avgTimeOnPageSecs, scrollDepthPct, socialShares }) {
    const pool = getPool();
    if (!pool) return null;

    try {
      const sql = `
        INSERT INTO blog_analytics (
          mongo_id, blog_id, blog_title, views, unique_visitors,
          avg_time_on_page_secs, scroll_depth_pct, social_shares, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          views = VALUES(views),
          unique_visitors = VALUES(unique_visitors),
          avg_time_on_page_secs = VALUES(avg_time_on_page_secs),
          scroll_depth_pct = VALUES(scroll_depth_pct),
          social_shares = VALUES(social_shares);
      `;
      await pool.query(sql, [
        'slug_' + blogSlug,
        blogSlug,
        blogTitle || blogSlug,
        views || 1,
        uniqueVisitors || 1,
        avgTimeOnPageSecs || 0,
        scrollDepthPct || 0,
        socialShares || 0
      ]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Save or Update Platform Setting in MySQL
   */
  async saveSettingToMySQL(key, value) {
    const pool = getPool();
    if (!pool) return null;

    try {
      const sql = `
        INSERT INTO platform_settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          setting_value = VALUES(setting_value),
          updated_at = CURRENT_TIMESTAMP;
      `;
      await pool.query(sql, [key, this.safeJson(value)]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Sync all existing data from MongoDB into MySQL
   */
  async syncAllFromMongo() {
    const pool = getPool();
    if (!pool) {
      throw new Error('MySQL connection pool is not active. Check credentials.');
    }

    const summary = {
      blogsSynced: 0,
      topicsSynced: 0,
      analyticsSynced: 0,
      settingsSynced: 0,
      errors: []
    };

    try {
      // 1. Sync Topics
      const topics = await Topic.find({});
      for (const topic of topics) {
        const res = await this.saveTopicToMySQL(topic);
        if (res?.success) summary.topicsSynced++;
        else if (res?.error) summary.errors.push(`Topic (${topic.title}): ${res.error}`);
      }

      // 2. Sync Blogs
      const blogs = await Blog.find({});
      for (const blog of blogs) {
        const res = await this.saveBlogToMySQL(blog);
        if (res?.success) summary.blogsSynced++;
        else if (res?.error) summary.errors.push(`Blog (${blog.title}): ${res.error}`);
      }

      // 3. Sync Analytics
      const analytics = await BlogAnalytics.find({});
      for (const a of analytics) {
        const res = await this.saveAnalyticsToMySQL(a);
        if (res?.success) summary.analyticsSynced++;
      }

      // 4. Sync Settings
      const settings = await Setting.find({});
      for (const s of settings) {
        await this.saveSettingToMySQL(s.key || 'general_settings', s.value || s);
        summary.settingsSynced++;
      }

      console.log(`[MySQL Sync] Completed full sync: ${summary.blogsSynced} blogs, ${summary.topicsSynced} topics, ${summary.analyticsSynced} analytics entries.`);
      return summary;
    } catch (err) {
      console.error('[MySQL Sync] Full sync failed:', err);
      throw err;
    }
  }

  /**
   * Fetch all blogs directly from MySQL database with filtering & pagination
   */
  async fetchBlogsFromMySQL(filters = {}) {
    const pool = getPool();
    if (!pool) throw new Error('MySQL is not connected');

    const { status, category, search, limit = 50, offset = 0 } = filters;
    let whereClauses = [];
    let params = [];

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (category && category !== 'All') {
      whereClauses.push('category = ?');
      params.push(category);
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR excerpt LIKE ? OR primary_keyword LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `
      SELECT * FROM blogs
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `;
    params.push(Number(limit), Number(offset));

    const countSql = `SELECT COUNT(*) as total FROM blogs ${whereSQL};`;
    const countParams = params.slice(0, -2);

    const [rows] = await pool.query(sql, params);
    const [countRows] = await pool.query(countSql, countParams);

    // Parse JSON fields
    const parsedBlogs = rows.map((row) => ({
      ...row,
      _id: row.mongo_id || row.id.toString(),
      tags: this.safeParse(row.tags, []),
      secondary_keywords: this.safeParse(row.secondary_keywords, []),
      schema_markup: this.safeParse(row.schema_markup, {}),
      source_citations: this.safeParse(row.source_citations, []),
      recommended_internal_links: this.safeParse(row.recommended_internal_links, []),
      qualityMetrics: {
        qualityScore: row.quality_score,
        readabilityScore: row.readability_score,
        readingGradeLevel: row.reading_grade_level,
        duplicateSimilarityScore: row.duplicate_similarity_score,
        isDuplicateRisk: Boolean(row.is_duplicate_risk)
      },
      performancePrediction: {
        predictedViews: row.predicted_views,
        engagementProbability: row.engagement_probability,
        performanceScore: row.performance_score,
        estimatedReadingTimeMins: row.estimated_reading_time_mins
      },
      seo: {
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        primaryKeyword: row.primary_keyword,
        secondaryKeywords: this.safeParse(row.secondary_keywords, []),
        canonicalUrl: row.canonical_url,
        seoScore: row.seo_score,
        schemaMarkup: this.safeParse(row.schema_markup, {})
      },
      featuredImage: {
        url: row.featured_image_url,
        altText: row.featured_image_alt,
        prompt: row.featured_image_prompt
      }
    }));

    return {
      total: countRows[0]?.total || 0,
      limit: Number(limit),
      offset: Number(offset),
      blogs: parsedBlogs
    };
  }

  /**
   * Fetch topics directly from MySQL
   */
  async fetchTopicsFromMySQL(filters = {}) {
    const pool = getPool();
    if (!pool) throw new Error('MySQL is not connected');

    const { status, limit = 50, offset = 0 } = filters;
    let whereClauses = [];
    let params = [];

    if (status && status !== 'All') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const sql = `
      SELECT * FROM topics
      ${whereSQL}
      ORDER BY topic_priority_score DESC, created_at DESC
      LIMIT ? OFFSET ?;
    `;
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    const parsedTopics = rows.map((t) => ({
      ...t,
      _id: t.mongo_id || t.id.toString(),
      keywords: this.safeParse(t.keywords, [])
    }));

    return parsedTopics;
  }

  /**
   * Fetch all MySQL tables and metadata
   */
  async fetchTablesSchema() {
    const pool = getPool();
    if (!pool) throw new Error('MySQL is not connected');

    const status = await getMySQLStatus();
    const tables = ['blogs', 'topics', 'blog_analytics', 'platform_settings'];
    const tableDetails = [];

    for (const tableName of tables) {
      try {
        const [columns] = await pool.query(`DESCRIBE \`${tableName}\`;`);
        const [countRow] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\`;`);
        tableDetails.push({
          tableName,
          rowCount: countRow[0]?.cnt || 0,
          columns: columns.map((col) => ({
            field: col.Field,
            type: col.Type,
            null: col.Null,
            key: col.Key,
            default: col.Default,
            extra: col.Extra
          }))
        });
      } catch (e) {
        tableDetails.push({ tableName, rowCount: 0, columns: [], error: e.message });
      }
    }

    return { status, tables: tableDetails };
  }

  /**
   * Execute safe custom query (SELECT only by default for safety)
   */
  async executeCustomQuery(sqlQuery, params = []) {
    const pool = getPool();
    if (!pool) throw new Error('MySQL is not connected');

    const trimmed = sqlQuery.trim();
    const isReadOnly = /^(SELECT|SHOW|DESCRIBE|EXPLAIN)/i.test(trimmed);

    if (!isReadOnly) {
      throw new Error('For security, only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed via the console.');
    }

    const startTime = Date.now();
    const [rows, fields] = await pool.query(trimmed, params);
    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      rowCount: Array.isArray(rows) ? rows.length : 1,
      executionTimeMs,
      columns: fields ? fields.map(f => f.name) : [],
      rows: Array.isArray(rows) ? rows : [rows]
    };
  }
}

module.exports = new MySQLSyncService();
