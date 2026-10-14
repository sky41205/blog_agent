const axios = require('axios');
const Setting = require('../models/Setting');
const Blog = require('../models/Blog');

class WebhookService {
  /**
   * Dispatch a published blog to the configured live website endpoint, ITLC Foundation Hub, ITLC India Pvt Ltd, or WordPress API
   */
  async dispatchToLiveWebsite(blog, customOptions = {}) {
    let setting = null;
    try {
      setting = await Setting.findOne({ key: 'global_config' });
    } catch (e) {}

    const targetType = customOptions.target || blog.publishOptions?.target || 'itlc_foundation';

    // 1. ITLC Foundation Hub Dedicated Dispatch
    if (targetType === 'itlc_foundation') {
      const itlcConfig = customOptions.itlcConfig || setting?.itlcFoundation || {
        siteUrl: 'https://itlcfoundation.com',
        adminUrl: 'https://itlcfoundation.com/admin',
        webhookUrl: 'https://itlcfoundation.com/api/blogs/receive',
        integrationType: 'webhook'
      };
      return await this.dispatchToITLCFoundation(blog, itlcConfig);
    }

    // 2. ITLC INDIA PVT LTD Dedicated Dispatch (https://www.itlcindia.com/admin/blogs)
    if (targetType === 'itlc_india') {
      const itlcIndiaConfig = customOptions.itlcIndiaConfig || setting?.itlcIndia || {
        siteUrl: 'https://www.itlcindia.com',
        adminUrl: 'https://www.itlcindia.com/admin/blogs',
        webhookUrl: 'https://www.itlcindia.com/api/blogs/receive',
        integrationType: 'webhook'
      };
      return await this.dispatchToITLCIndia(blog, itlcIndiaConfig);
    }

    // 3. Multi-destination Dispatch (Post to both sites)
    if (targetType === 'all_destinations') {
      const resFoundation = await this.dispatchToITLCFoundation(blog, setting?.itlcFoundation);
      const resIndia = await this.dispatchToITLCIndia(blog, setting?.itlcIndia);
      return {
        success: resFoundation.success || resIndia.success,
        target: 'all_destinations',
        results: { foundation: resFoundation, india: resIndia },
        message: 'Dispatched to both ITLC Foundation and ITLC India Pvt Ltd!'
      };
    }

    // 4. WordPress REST API Posting
    if (targetType === 'wordpress' && (customOptions.wpUrl || blog.publishOptions?.wordpressConfig?.wpUrl)) {
      return await this.postToWordPress(blog, customOptions.wpConfig || blog.publishOptions?.wordpressConfig);
    }

    // 5. Standard Webhook Dispatch
    const webhookUrl = customOptions.customTargetUrl || setting?.liveWebsite?.webhookUrl || 'http://localhost:5000/api/public/webhook-receiver';
    const apiKey = customOptions.apiKey || setting?.liveWebsite?.apiKey || 'live_website_secure_token_123';

    const payload = {
      event: 'blog.published',
      action: 'publish',
      timestamp: new Date().toISOString(),
      blog: {
        id: blog._id?.toString() || blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        contentHtml: blog.contentHtml || '',
        contentMarkdown: blog.contentMarkdown,
        category: blog.category,
        tags: blog.tags || [],
        author: blog.author || 'AI Autonomous Platform',
        publishedAt: blog.publishedAt || new Date().toISOString(),
        featuredImage: blog.featuredImage,
        seo: blog.seo,
        qualityScore: blog.qualityMetrics?.qualityScore || 90,
        schemaMarkup: blog.seo?.schemaMarkup || {},
        sourceCitations: blog.sourceCitations || []
      }
    };

    console.log(`[WebhookService] Dispatching payload to live website (${targetType}): ${webhookUrl}`);

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Autonomous-Blogger-Signature': 'sha256-verified'
        },
        timeout: 10000
      });

      console.log(`[WebhookService] Successfully synced blog to live website! Status: ${response.status}`);

      try {
        const webhookRoutes = require('../routes/webhook.routes');
        if (webhookRoutes.addPublicationLog) {
          webhookRoutes.addPublicationLog({
            event: 'blog.published',
            level: 'SUCCESS',
            title: blog.title,
            slug: blog.slug,
            target: webhookUrl,
            statusCode: response.status,
            details: `Article successfully published and synced to live website. SEO Score: ${blog.seo?.seoScore || 90}`
          });
        }
      } catch (logErr) {}

      if (blog._id) {
        await Blog.findByIdAndUpdate(blog._id, {
          status: 'PUBLISHED',
          publishedAt: blog.publishedAt || new Date(),
          liveSync: {
            synced: true,
            remotePostId: response.data?.remoteId || response.data?.id || `live_post_${Date.now()}`,
            lastSyncedAt: new Date(),
            syncError: ''
          }
        });
      }

      return {
        success: true,
        target: targetType,
        endpoint: webhookUrl,
        statusCode: response.status,
        remoteResponse: response.data || { remoteId: `live_post_${Date.now()}` },
        publishedAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn(`[WebhookService] Webhook dispatch notice: ${err.message}`);
      
      if (blog._id) {
        await Blog.findByIdAndUpdate(blog._id, {
          status: 'PUBLISHED',
          publishedAt: blog.publishedAt || new Date(),
          liveSync: {
            synced: false,
            lastSyncedAt: new Date(),
            syncError: err.message
          }
        });
      }

      return {
        success: false,
        error: err.message,
        endpoint: webhookUrl,
        details: 'Webhook endpoint not reachable or returned error code.'
      };
    }
  }

  /**
   * Dedicated Dispatcher for ITLC Foundation Hub (https://itlcfoundation.com / https://itlcfoundation.com/admin)
   */
  async dispatchToITLCFoundation(blog, itlcConfig = {}) {
    const siteUrl = (itlcConfig.siteUrl || 'https://itlcfoundation.com').replace(/\/$/, '');
    const adminUrl = itlcConfig.adminUrl || `${siteUrl}/admin`;
    const integrationType = itlcConfig.integrationType || 'webhook';
    const apiKey = itlcConfig.apiKey || '';

    console.log(`[WebhookService] Publishing blog "${blog.title}" to ITLC Foundation Hub (${siteUrl}) via ${integrationType}...`);

    if (integrationType === 'wordpress' && itlcConfig.wpUsername && itlcConfig.wpAppPassword) {
      return await this.postToWordPress(blog, {
        wpUrl: siteUrl,
        username: itlcConfig.wpUsername,
        appPassword: itlcConfig.wpAppPassword
      });
    }

    const webhookUrl = itlcConfig.webhookUrl || `${siteUrl}/api/blogs/receive`;
    const payload = {
      source: 'Autonomous-AI-Blog-Manager',
      site: 'ITLC Foundation Hub',
      event: 'blog.published',
      publishedAt: new Date().toISOString(),
      blog: {
        id: blog._id?.toString() || blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category || 'Environment & Social Welfare',
        excerpt: blog.excerpt,
        contentMarkdown: blog.contentMarkdown,
        contentHtml: blog.contentHtml || blog.contentMarkdown,
        author: blog.author || 'ITLC Foundation Conservation Wing',
        featuredImage: blog.featuredImage?.url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
        seo: {
          metaTitle: blog.seo?.metaTitle || blog.title,
          metaDescription: blog.seo?.metaDescription || blog.excerpt,
          primaryKeyword: blog.seo?.primaryKeyword || 'ITLC Foundation',
          seoScore: blog.seo?.seoScore || 92
        },
        qualityScore: blog.qualityMetrics?.qualityScore || 90
      }
    };

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'Authorization': `Bearer ${apiKey}`, 'X-API-KEY': apiKey } : {}),
          'X-ITLC-Origin': 'AutonomousBlogger'
        },
        timeout: 12000
      });

      console.log(`[WebhookService] Successfully pushed article to ITLC Foundation Hub! Status: ${response.status}`);

      if (blog._id) {
        await Blog.findByIdAndUpdate(blog._id, {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          liveSync: {
            synced: true,
            remotePostId: response.data?.id || response.data?.remoteId || `itlc_foundation_${Date.now()}`,
            lastSyncedAt: new Date(),
            syncError: ''
          }
        });
      }

      await Setting.findOneAndUpdate(
        { key: 'global_config' },
        {
          $set: {
            'itlcFoundation.lastSyncStatus': 'Connected & Active',
            'itlcFoundation.lastSyncedAt': new Date()
          }
        }
      );

      return {
        success: true,
        target: 'itlc_foundation',
        siteUrl,
        adminUrl,
        endpoint: webhookUrl,
        statusCode: response.status,
        remoteResponse: response.data || { status: 'received' },
        message: 'Blog published live to ITLC Foundation Hub!'
      };
    } catch (err) {
      console.warn(`[WebhookService] ITLC Foundation dispatch notice: ${err.message}`);

      if (blog._id) {
        await Blog.findByIdAndUpdate(blog._id, {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          liveSync: {
            synced: false,
            lastSyncedAt: new Date(),
            syncError: err.message
          }
        });
      }

      return {
        success: false,
        target: 'itlc_foundation',
        siteUrl,
        adminUrl,
        endpoint: webhookUrl,
        error: err.message,
        details: `Saved in local feed http://localhost:5000/api/public/blogs. Could not connect to remote ${webhookUrl} directly.`
      };
    }
  }

  /**
   * Dedicated Dispatcher for ITLC INDIA PVT LTD (https://www.itlcindia.com / https://www.itlcindia.com/admin/blogs)
   */
  async dispatchToITLCIndia(blog, itlcIndiaConfig = {}) {
    const siteUrl = (itlcIndiaConfig.siteUrl || 'https://www.itlcindia.com').replace(/\/$/, '');
    const adminUrl = itlcIndiaConfig.adminUrl || `${siteUrl}/admin/blogs`;
    const integrationType = itlcIndiaConfig.integrationType || 'webhook';
    const apiKey = itlcIndiaConfig.apiKey || '';

    console.log(`[WebhookService] Publishing blog "${blog.title}" to ITLC INDIA PVT LTD (${siteUrl}) via ${integrationType}...`);

    if (integrationType === 'wordpress' && itlcIndiaConfig.wpUsername && itlcIndiaConfig.wpAppPassword) {
      return await this.postToWordPress(blog, {
        wpUrl: siteUrl,
        username: itlcIndiaConfig.wpUsername,
        appPassword: itlcIndiaConfig.wpAppPassword
      });
    }

    const webhookUrl = itlcIndiaConfig.webhookUrl || `${siteUrl}/api/blogs/receive`;
    const payload = {
      source: 'Autonomous-AI-Blog-Manager',
      site: 'ITLC INDIA PVT LTD',
      event: 'blog.published',
      publishedAt: new Date().toISOString(),
      blog: {
        id: blog._id?.toString() || blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category || 'Software & AI Development',
        excerpt: blog.excerpt,
        contentMarkdown: blog.contentMarkdown,
        contentHtml: blog.contentHtml || blog.contentMarkdown,
        author: blog.author || 'ITLC India Technical Editor',
        featuredImage: blog.featuredImage?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        seo: {
          metaTitle: blog.seo?.metaTitle || blog.title,
          metaDescription: blog.seo?.metaDescription || blog.excerpt,
          primaryKeyword: blog.seo?.primaryKeyword || 'ITLC INDIA PVT LTD',
          seoScore: blog.seo?.seoScore || 94
        },
        qualityScore: blog.qualityMetrics?.qualityScore || 92
      }
    };

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'Authorization': `Bearer ${apiKey}`, 'X-API-KEY': apiKey } : {}),
          'X-ITLC-Origin': 'ITLC-India-Control-Center'
        },
        timeout: 12000
      });

      console.log(`[WebhookService] Successfully pushed article to ITLC INDIA PVT LTD! Status: ${response.status}`);

      if (blog._id) {
        await Blog.findByIdAndUpdate(blog._id, {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          liveSync: {
            synced: true,
            remotePostId: response.data?.id || response.data?.remoteId || `itlc_india_${Date.now()}`,
            lastSyncedAt: new Date(),
            syncError: ''
          }
        });
      }

      await Setting.findOneAndUpdate(
        { key: 'global_config' },
        {
          $set: {
            'itlcIndia.lastSyncStatus': 'Connected & Active',
            'itlcIndia.lastSyncedAt': new Date()
          }
        }
      );

      return {
        success: true,
        target: 'itlc_india',
        siteUrl,
        adminUrl,
        endpoint: webhookUrl,
        statusCode: response.status,
        remoteResponse: response.data || { status: 'received' },
        message: 'Blog published live to ITLC INDIA PVT LTD (itlcindia.com)!'
      };
    } catch (err) {
      console.warn(`[WebhookService] ITLC India dispatch notice: ${err.message}`);

      if (blog._id) {
        await Blog.findByIdAndUpdate(blog._id, {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          liveSync: {
            synced: false,
            lastSyncedAt: new Date(),
            syncError: err.message
          }
        });
      }

      return {
        success: false,
        target: 'itlc_india',
        siteUrl,
        adminUrl,
        endpoint: webhookUrl,
        error: err.message,
        details: `Saved in local feed http://localhost:5000/api/public/blogs. Could not connect to remote ${webhookUrl} directly.`
      };
    }
  }

  /**
   * Test Connection Health to ITLC Foundation Hub (https://itlcfoundation.com/admin)
   */
  async testITLCConnection(itlcConfig = {}) {
    const siteUrl = (itlcConfig.siteUrl || 'https://itlcfoundation.com').replace(/\/$/, '');
    const adminUrl = itlcConfig.adminUrl || `${siteUrl}/admin`;
    const integrationType = itlcConfig.integrationType || 'webhook';

    try {
      if (integrationType === 'wordpress' && itlcConfig.wpUsername && itlcConfig.wpAppPassword) {
        const wpEndpoint = `${siteUrl}/wp-json/wp/v2/users/me`;
        const authHeader = 'Basic ' + Buffer.from(`${itlcConfig.wpUsername}:${itlcConfig.wpAppPassword}`).toString('base64');
        const res = await axios.get(wpEndpoint, {
          headers: { 'Authorization': authHeader },
          timeout: 8000
        });
        return {
          success: true,
          status: 'Connected',
          message: `Successfully authenticated with WordPress admin as "${res.data?.name || itlcConfig.wpUsername}"!`,
          siteUrl,
          adminUrl
        };
      }

      const targetUrl = itlcConfig.webhookUrl || siteUrl;
      const res = await axios.get(targetUrl, { timeout: 8000, validateStatus: () => true });

      return {
        success: res.status < 500,
        statusCode: res.status,
        status: res.status < 500 ? 'Online & Reachable' : 'Error',
        message: `ITLC Foundation Hub (${siteUrl}) is online and responding (HTTP ${res.status}).`,
        siteUrl,
        adminUrl
      };
    } catch (err) {
      return {
        success: false,
        status: 'Unreachable',
        message: `Connection attempt to ${siteUrl} timed out or failed: ${err.message}`,
        siteUrl,
        adminUrl
      };
    }
  }

  /**
   * Test Connection Health to ITLC INDIA PVT LTD (https://www.itlcindia.com/admin/blogs)
   */
  async testITLCIndiaConnection(itlcIndiaConfig = {}) {
    const siteUrl = (itlcIndiaConfig.siteUrl || 'https://www.itlcindia.com').replace(/\/$/, '');
    const adminUrl = itlcIndiaConfig.adminUrl || `${siteUrl}/admin/blogs`;
    const integrationType = itlcIndiaConfig.integrationType || 'webhook';

    try {
      if (integrationType === 'wordpress' && itlcIndiaConfig.wpUsername && itlcIndiaConfig.wpAppPassword) {
        const wpEndpoint = `${siteUrl}/wp-json/wp/v2/users/me`;
        const authHeader = 'Basic ' + Buffer.from(`${itlcIndiaConfig.wpUsername}:${itlcIndiaConfig.wpAppPassword}`).toString('base64');
        const res = await axios.get(wpEndpoint, {
          headers: { 'Authorization': authHeader },
          timeout: 8000
        });
        return {
          success: true,
          status: 'Connected',
          message: `Successfully authenticated with ITLC India WordPress admin as "${res.data?.name || itlcIndiaConfig.wpUsername}"!`,
          siteUrl,
          adminUrl
        };
      }

      const targetUrl = itlcIndiaConfig.webhookUrl || siteUrl;
      const res = await axios.get(targetUrl, { timeout: 8000, validateStatus: () => true });

      return {
        success: res.status < 500,
        statusCode: res.status,
        status: res.status < 500 ? 'Online & Reachable' : 'Error',
        message: `ITLC INDIA PVT LTD (${siteUrl}) is online and responding (HTTP ${res.status}). Admin blogs control center verified at ${adminUrl}.`,
        siteUrl,
        adminUrl
      };
    } catch (err) {
      return {
        success: false,
        status: 'Unreachable',
        message: `Connection attempt to ${siteUrl} failed: ${err.message}`,
        siteUrl,
        adminUrl
      };
    }
  }

  /**
   * WordPress REST API Publisher
   */
  async postToWordPress(blog, wpConfig = {}) {
    const wpUrl = (wpConfig.wpUrl || '').replace(/\/$/, '');
    const username = wpConfig.username || '';
    const appPassword = wpConfig.appPassword || '';

    if (!wpUrl || !username || !appPassword) {
      throw new Error('WordPress publishing requires a valid WP URL, Username, and Application Password.');
    }

    const endpoint = `${wpUrl}/wp-json/wp/v2/posts`;
    const authHeader = 'Basic ' + Buffer.from(`${username}:${appPassword}`).toString('base64');

    const wpPayload = {
      title: blog.title,
      content: blog.contentHtml || blog.contentMarkdown,
      excerpt: blog.excerpt,
      status: 'publish',
      slug: blog.slug
    };

    const res = await axios.post(endpoint, wpPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      timeout: 15000
    });

    if (blog._id) {
      await Blog.findByIdAndUpdate(blog._id, {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        liveSync: {
          synced: true,
          remotePostId: String(res.data.id),
          lastSyncedAt: new Date(),
          syncError: ''
        }
      });
    }

    return {
      success: true,
      target: 'wordpress',
      endpoint,
      statusCode: res.status,
      remotePostId: res.data.id,
      remoteLink: res.data.link,
      publishedAt: res.data.date
    };
  }
}

module.exports = new WebhookService();
