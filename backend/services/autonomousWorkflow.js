const cron = require('node-cron');
const Topic = require('../models/Topic');
const Blog = require('../models/Blog');
const Setting = require('../models/Setting');
const GenerationJob = require('../models/GenerationJob');
const { AIProviderFactory, prompts } = require('./ai/aiProvider');
const researchService = require('./researchService');
const mlClient = require('./mlClient');
const decisionEngine = require('./decisionEngine');
const seoService = require('./seoService');
const brandVoiceService = require('./brandVoiceService');
const webhookService = require('./webhookService');
const imageService = require('./imageService');

class AutonomousWorkflow {
  constructor() {
    this.isRunning = false;
    this.scheduledTask = null;
  }

  initScheduler() {
    // Default schedule: Every day at 08:00 AM ('0 8 * * *')
    console.log('[AutonomousWorkflow] Initializing daily autonomous scheduler (08:00 AM)...');
    
    this.scheduledTask = cron.schedule('0 8 * * *', async () => {
      console.log('[AutonomousWorkflow] 08:00 AM Cron Trigger fired!');
      await this.runDailyAutonomousCycle('Scheduled 08:00 AM Cron');
    });
  }

  async runDailyAutonomousCycle(triggerSource = 'Manual Trigger') {
    if (this.isRunning) {
      console.log('[AutonomousWorkflow] Cycle is already currently running. Skipping duplicate trigger.');
      return { status: 'already_running', message: 'Cycle in progress' };
    }

    this.isRunning = true;
    const cycleStartTime = new Date();
    console.log(`\n======================================================`);
    console.log(`[AUTONOMOUS ENGINE] Starting Daily Workflow Cycle (${triggerSource})`);
    console.log(`======================================================`);

    const executionLog = [];
    const logStep = (step, msg) => {
      console.log(`[Autonomous Cycle] Step: ${step} - ${msg}`);
      executionLog.push({ step, msg, timestamp: new Date() });
    };

    try {
      const setting = (await Setting.findOne({ key: 'global_config' })) || {};
      const automationMode = setting.automationMode || 'APPROVAL';
      const minQualityScore = setting.autoPublishMinQualityScore || 85;
      const ai = await AIProviderFactory.getProvider();

      // STEP 1: Discover & Ingest Candidate Topics
      logStep('1. Trend Discovery', 'Collecting live candidate search and industry topics...');
      const liveTrendIngestor = require('./liveTrendIngestor.service');
      const mysqlSyncService = require('./mysqlSync.service');
      let rawCandidates = [];
      try {
        const liveTrends = await liveTrendIngestor.fetchLiveTrends('Technology & AI');
        if (liveTrends && liveTrends.length > 0) {
          rawCandidates = liveTrends.map(t => ({
            topic: t.title,
            category: t.category,
            volume: t.volume || 15000,
            growth: t.growth || 65
          }));
        }
      } catch (e) {
        console.warn('[AutonomousWorkflow] Live trend fetch fallback:', e.message);
      }

      if (rawCandidates.length === 0) {
        rawCandidates = [
          { topic: 'Agentic AI Workflows and Multi-Agent Orchestration in 2026', category: 'Artificial Intelligence', volume: 18500, growth: 72 },
          { topic: 'Zero-Trust API Security and OAuth 2.1 in Modern Microservices', category: 'Cybersecurity', volume: 9400, growth: 48 },
          { topic: 'Edge AI and TinyML for Real-Time Embedded Analytics', category: 'Artificial Intelligence', volume: 12200, growth: 55 },
          { topic: 'Next.js Server Actions and React 19 Performance Benchmarks', category: 'Web Development', volume: 15600, growth: 64 },
          { topic: 'High-Throughput Vector Databases vs Graph RAG Systems', category: 'Machine Learning', volume: 14100, growth: 80 }
        ];
      }

      // STEP 2 & 3: Run ML Trend Scoring & Relevance Predictions on Candidates
      logStep('2 & 3. ML Scoring', 'Scoring trend velocity and niche relevance with ML models...');
      const evaluatedTopics = [];

      for (const cand of rawCandidates) {
        const trendRes = await mlClient.predictTrend({
          topic: cand.topic,
          search_volume: cand.volume,
          search_growth: cand.growth,
          news_frequency: 15,
          recency_hours: 12,
          niche_relevance: 90
        });

        const relRes = await mlClient.predictRelevance({
          title: cand.topic,
          keywords: "ai, agents, cloud, architecture, devops",
          category: cand.category,
          website_niche: "Technology & AI"
        });

        const priority = decisionEngine.calculateTopicPriority(
          trendRes.trend_score,
          relRes.relevance_probability,
          85,
          82
        );

        // Save or update Topic in Database
        let savedTopic = null;
        try {
          savedTopic = await Topic.findOneAndUpdate(
            { title: cand.topic },
            {
              title: cand.topic,
              category: cand.category,
              keywords: relRes.matched_keywords || ["technology", "ai"],
              trendScore: trendRes.trend_score,
              relevanceScore: relRes.relevance_probability,
              seoOpportunity: 88,
              predictedPerformance: 84,
              topicPriorityScore: priority.topicPriorityScore,
              reasoning: priority.explanation,
              status: priority.topicPriorityScore >= 80 ? 'recommended' : 'discovered'
            },
            { upsert: true, new: true }
          );
        } catch (e) {}

        evaluatedTopics.push({
          topicId: savedTopic?._id,
          title: cand.topic,
          category: cand.category,
          priorityScore: priority.topicPriorityScore,
          trendScore: trendRes.trend_score,
          relevanceProb: relRes.relevance_probability
        });
      }

      // STEP 4: Select Top High-Opportunity Topic
      evaluatedTopics.sort((a, b) => b.priorityScore - a.priorityScore);
      const topOpportunity = evaluatedTopics[0];
      logStep('4. Top Selection', `Selected highest priority opportunity: "${topOpportunity.title}" (Score: ${topOpportunity.priorityScore}/100)`);

      // Initialize Generation Job
      let job = null;
      try {
        job = await GenerationJob.create({
          topicId: topOpportunity.topicId,
          topicTitle: topOpportunity.title,
          status: 'researching',
          currentStep: 'Web Research & Fact Extraction',
          progressPct: 15,
          logs: [{ step: 'Started', message: 'Autonomous cycle initiated generation' }]
        });
      } catch (e) {}

      // STEP 5: Conduct Fact-Checked Web Research
      logStep('5. AI Research Agent', 'Extracting verified citations and data points without hallucinations...');
      const researchData = await researchService.conductResearch(topOpportunity.title, ["ai", "agents"], topOpportunity.topicId);

      // STEP 6: Get Brand Voice Profile & Internal Link Candidates
      logStep('6. Brand Voice & Internal Links', 'Loading brand voice profile and retrieving semantic internal link candidates...');
      const brandVoice = await brandVoiceService.getEffectiveBrandVoice();
      const existingPublished = await Blog.find({ status: 'PUBLISHED' }).limit(5);
      const internalLinksRes = await mlClient.recommendInternalLinks(topOpportunity.title, researchData.sources[0]?.factSnippet || '', existingPublished, 3);

      // STEP 7: Generate Full In-Depth Blog Post
      logStep('7. AI Blog Writer', 'Writing 1200-word structured blog with H2/H3s, real code, FAQs, and soft CTA...');
      if (job) await GenerationJob.findByIdAndUpdate(job._id, { status: 'generating', currentStep: 'AI Writing', progressPct: 45 });

      const writerPrompt = prompts.BLOG_WRITER_PROMPT(
        topOpportunity.title,
        researchData,
        brandVoice,
        1250,
        brandVoice.targetAudience,
        internalLinksRes.recommendations
      );
      const generatedDraft = await ai.generateJSON(writerPrompt);

      const title = generatedDraft.title || topOpportunity.title;
      const markdown = generatedDraft.contentMarkdown || '# ' + title;
      const excerpt = generatedDraft.excerpt || 'An in-depth guide on ' + title;
      const slug = generatedDraft.suggestedSlug || seoService.generateSlug(title);

      // STEP 8: SEO Intelligence & Rich Schema Generation
      logStep('8. SEO Optimization', 'Generating meta tags, long-tail keywords, and JSON-LD Article Schema...');
      if (job) await GenerationJob.findByIdAndUpdate(job._id, { status: 'optimizing_seo', currentStep: 'SEO Optimization', progressPct: 65 });

      const seoPrompt = prompts.SEO_OPTIMIZER_PROMPT(title, markdown, generatedDraft.primaryKeyword || "agentic ai");
      const seoData = await ai.generateJSON(seoPrompt);
      const seoAudit = seoService.calculateSEOScore(title, markdown, seoData.primaryKeyword, seoData.metaDescription);

      // STEP 9: NLP Quality Scoring & Duplicate Detection
      logStep('9. NLP Quality & Duplicate Check', 'Executing Flesch Readability, heading hierarchy analysis, and TF-IDF duplicate detection...');
      if (job) await GenerationJob.findByIdAndUpdate(job._id, { status: 'quality_check', currentStep: 'Quality & Duplicate Auditing', progressPct: 80 });

      const qualityRes = await mlClient.scoreQuality({
        title,
        content: markdown,
        primary_keyword: seoData.primaryKeyword,
        secondary_keywords: seoData.secondaryKeywords
      });

      const duplicateRes = await mlClient.detectDuplicate(title, markdown, existingPublished, 0.85);

      // STEP 10: Blog Performance Prediction
      logStep('10. ML Performance Prediction', 'Predicting expected views, CTR, and reader engagement probability...');
      const perfRes = await mlClient.predictPerformance({
        topic: title,
        category: topOpportunity.category,
        word_count: qualityRes.readability_metrics?.total_words || 1200,
        trend_score: topOpportunity.trendScore,
        seo_score: seoAudit.seoScore,
        readability_score: qualityRes.readability_metrics?.readability_score || 72
      });

      // STEP 11: Featured Image Generation via Gemini Visual Engine
      logStep('11. Visual Intelligence', 'Creating high-impact featured image with Gemini prompt engine...');
      const featuredImageData = await imageService.generateFeaturedImage(title, excerpt, topOpportunity.category);

      // STEP 12: Evaluate Automation Mode Decision Gate
      logStep('12. Decision Gate', `Evaluating Automation Mode (${automationMode}) against Quality Score (${qualityRes.content_quality_score}/${minQualityScore})...`);
      
      let finalStatus = 'DRAFT';
      let publishTime = null;

      if (automationMode === 'AUTOMATIC') {
        if (qualityRes.content_quality_score >= minQualityScore && !duplicateRes.is_duplicate_risk) {
          finalStatus = 'PUBLISHED';
          publishTime = new Date();
          logStep('12a. Auto-Approved', 'Thresholds passed! Blog marked as PUBLISHED.');
        } else {
          finalStatus = 'IN_REVIEW';
          logStep('12a. Flagged', 'Quality score or duplicate risk requires human review. Marked as IN_REVIEW.');
        }
      } else if (automationMode === 'APPROVAL') {
        finalStatus = 'IN_REVIEW';
        logStep('12b. Approval Mode', 'Blog saved and ready for Human Approval in Admin Dashboard.');
      } else {
        finalStatus = 'DRAFT';
      }

      // STEP 13: Save Final Blog to Database
      logStep('13. Database Persistence', 'Saving generated blog with complete ML & SEO metadata...');
      let createdBlog = null;
      try {
        createdBlog = await Blog.findOneAndUpdate(
          { slug },
          {
            title,
            slug,
            excerpt,
            contentMarkdown: markdown,
            contentHtml: markdown, // Can be rendered on the fly or transformed
            category: topOpportunity.category,
            tags: seoData.secondaryKeywords || ["AI", "Tech"],
            topicId: topOpportunity.topicId,
            topicTitle: topOpportunity.title,
            seo: {
              metaTitle: seoData.metaTitle || title,
              metaDescription: seoData.metaDescription || excerpt,
              primaryKeyword: seoData.primaryKeyword || "ai",
              secondaryKeywords: seoData.secondaryKeywords || [],
              seoScore: seoAudit.seoScore,
              schemaMarkup: seoData.jsonLdSchema || {}
            },
            featuredImage: {
              url: featuredImageData.url,
              altText: featuredImageData.altText || title,
              caption: featuredImageData.caption || '',
              prompt: featuredImageData.prompt || '',
              filename: featuredImageData.filename || `${slug}.webp`
            },
            qualityMetrics: {
              qualityScore: qualityRes.content_quality_score,
              readabilityScore: qualityRes.readability_metrics?.readability_score || 72,
              readingGradeLevel: qualityRes.readability_metrics?.reading_grade_level || 'Standard',
              duplicateSimilarityScore: duplicateRes.highest_similarity,
              isDuplicateRisk: duplicateRes.is_duplicate_risk,
              issues: qualityRes.critical_issues || [],
              suggestions: qualityRes.optimization_suggestions || []
            },
            performancePrediction: {
              predictedViews: perfRes.predicted_views,
              engagementProbability: perfRes.engagement_probability,
              performanceScore: perfRes.performance_score,
              estimatedReadingTimeMins: perfRes.estimated_reading_time_mins
            },
            sourceCitations: researchData.sources.map(s => ({
              title: s.title,
              url: s.url,
              publicationDate: s.publicationDate,
              factSnippet: s.factSnippet
            })),
            recommendedInternalLinks: internalLinksRes.recommendations,
            status: finalStatus,
            publishedAt: publishTime,
            brandVoiceUsed: brandVoice.tone
          },
          { upsert: true, new: true }
        );
        if (createdBlog) {
          try {
            await mysqlSyncService.saveBlogToMySQL(createdBlog);
          } catch (sqlErr) {}
        }
      } catch (e) {
        console.warn(`[AutonomousWorkflow] Blog save error: ${e.message}`);
      }

      // STEP 14: If Published -> Dispatch to Live Website Webhook or ITLC Foundation Hub
      if (finalStatus === 'PUBLISHED' && createdBlog) {
        logStep('14. Live Website Sync', 'Dispatching published blog to live website & ITLC Foundation Hub...');
        if (setting.itlcFoundation?.autoPublishEnabled) {
          await webhookService.dispatchToLiveWebsite(createdBlog, { target: 'itlc_foundation', itlcConfig: setting.itlcFoundation });
        }
        await webhookService.dispatchToLiveWebsite(createdBlog);
      }

      // Mark Job Completed
      if (job) {
        await GenerationJob.findByIdAndUpdate(job._id, {
          status: 'completed',
          currentStep: 'Finished',
          progressPct: 100,
          resultBlogId: createdBlog?._id,
          resultBlogSlug: slug
        });
      }

      logStep('Cycle Complete', `Autonomous run completed in ${((new Date() - cycleStartTime) / 1000).toFixed(1)}s.`);
      console.log(`======================================================\n`);

      this.isRunning = false;
      return {
        status: 'success',
        topicSelected: topOpportunity.title,
        blogTitle: title,
        blogSlug: slug,
        finalStatus,
        qualityScore: qualityRes.content_quality_score,
        predictedViews: perfRes.predicted_views,
        executionLog
      };
    } catch (error) {
      console.error(`[AutonomousWorkflow] Error during cycle:`, error);
      this.isRunning = false;
      return {
        status: 'error',
        error: error.message,
        executionLog
      };
    }
  }
}

module.exports = new AutonomousWorkflow();
