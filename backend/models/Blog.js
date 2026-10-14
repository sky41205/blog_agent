const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, default: '' },
  contentMarkdown: { type: String, required: true },
  contentHtml: { type: String, default: '' },
  category: { type: String, default: 'Artificial Intelligence' },
  tags: [{ type: String }],
  
  // Topic linkage
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  topicTitle: { type: String, default: '' },
  
  // SEO Metadata
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    primaryKeyword: { type: String, default: '' },
    secondaryKeywords: [{ type: String }],
    canonicalUrl: { type: String, default: '' },
    seoScore: { type: Number, default: 85 },
    schemaMarkup: { type: Object, default: {} }
  },
  
  // Content Strategy & Outline
  outline: {
    title: { type: String, default: '' },
    angle: { type: String, default: '' },
    purpose: { type: String, default: '' },
    sections: [{
      id: String,
      heading: String,
      level: Number,
      keyPoints: [String],
      proposedVisual: { type: mongoose.Schema.Types.Mixed, default: '' }
    }]
  },

  // Featured Image
  featuredImage: {
    url: { type: String, default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    prompt: { type: String, default: '' },
    filename: { type: String, default: 'ai-future-blog.webp' }
  },

  // Inline Section Images from Multi-Agent Visual Studio
  inlineImages: [{
    sectionId: { type: String, default: '' },
    sectionHeading: { type: String, default: '' },
    url: { type: String, default: '' },
    altText: { type: String, default: '' },
    caption: { type: String, default: '' },
    prompt: { type: String, default: '' },
    aspectRatio: { type: String, default: '16:9' },
    placement: { type: String, default: 'inline' },
    imageType: { type: String, default: 'realistic' },
    purpose: { type: String, default: '' },
    accompanyingParagraphText: { type: String, default: '' },
    validation: {
      passed: { type: Boolean, default: true },
      accuracyScore: { type: Number, default: 90 },
      relevanceScore: { type: Number, default: 90 },
      paragraphAlignmentScore: { type: Number, default: 95 },
      paragraphAlignmentPassed: { type: Boolean, default: true },
      paragraphVerificationNote: { type: String, default: '' },
      domainValidation: { type: String, default: 'Verified' },
      checks: [{ type: String }],
      issues: [{ type: String }],
      retryCount: { type: Number, default: 0 }
    }
  }],
  
  // Quality & Performance Predictions
  qualityMetrics: {
    qualityScore: { type: Number, default: 85 },
    readabilityScore: { type: Number, default: 72 },
    readingGradeLevel: { type: String, default: 'Standard' },
    duplicateSimilarityScore: { type: Number, default: 0.12 },
    isDuplicateRisk: { type: Boolean, default: false },
    issues: [{ type: String }],
    suggestions: [{ type: String }],
    agentQualityMetrics: { type: mongoose.Schema.Types.Mixed, default: {} },
    rubricScores: {
      factualReliability: { score: Number, reason: String, passed: Boolean },
      writingQuality: { score: Number, reason: String, passed: Boolean },
      researchCitations: { score: Number, reason: String, passed: Boolean },
      seo: { score: Number, reason: String, passed: Boolean },
      imageRelevance: { score: Number, reason: String, passed: Boolean },
      imageVisualQuality: { score: Number, reason: String, passed: Boolean },
      accessibility: { score: Number, reason: String, passed: Boolean },
      overallReadiness: { score: Number, reason: String, passed: Boolean }
    },
    criticalFailures: [{ type: String }],
    requiresHumanReview: { type: Boolean, default: false }
  },

  // Multi-Agent Editorial Review
  editorialCritique: {
    verdict: { type: String, default: 'APPROVED' },
    overallScore: { type: Number, default: 92 },
    strengths: [{ type: String }],
    findings: [{
      category: String,
      issue: String,
      suggestion: String,
      severity: String
    }],
    revisionsApplied: [{ type: String }],
    criticRevisionHistory: { type: mongoose.Schema.Types.Mixed, default: [] }
  },

  // Packaging & Distribution
  publishingPackage: {
    socialExcerpts: {
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    },
    contentAngle: { type: String, default: '' },
    contentType: { type: String, default: 'Comprehensive Guide' }
  },
  
  performancePrediction: {
    predictedViews: { type: Number, default: 3500 },
    engagementProbability: { type: Number, default: 0.78 },
    performanceScore: { type: Number, default: 82 },
    estimatedReadingTimeMins: { type: Number, default: 6 }
  },
  
  // Research & Internal Links
  sourceCitations: [{
    title: String,
    url: String,
    publicationDate: String,
    factSnippet: String,
    isVerified: { type: Boolean, default: true }
  }],
  
  recommendedInternalLinks: [{
    blogId: String,
    title: String,
    slug: String,
    anchorText: String
  }],

  // Editorial Review & Quality Gate
  review: {
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'],
      default: 'PENDING_REVIEW'
    },
    reviewer: { type: String, default: 'Editorial Reviewer' },
    reviewedAt: { type: Date },
    feedback: { type: String, default: '' },
    checklist: {
      factChecked: { type: Boolean, default: true },
      seoVerified: { type: Boolean, default: true },
      originalityVerified: { type: Boolean, default: true },
      codeReviewed: { type: Boolean, default: true },
      toneApproved: { type: Boolean, default: true }
    },
    revisionNotes: { type: String, default: '' }
  },

  // Live Publishing & Posting Options
  publishOptions: {
    target: {
      type: String,
      default: 'live_demo'
    },
    customTargetUrl: { type: String, default: '' },
    wordpressConfig: {
      wpUrl: { type: String, default: '' },
      username: { type: String, default: '' },
      appPassword: { type: String, default: '' }
    },
    autoPublishOnApproval: { type: Boolean, default: false }
  },
  
  // Publishing & Live Sync Status
  status: {
    type: String,
    enum: ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'],
    default: 'IN_REVIEW'
  },
  scheduledPublishTime: { type: Date },
  publishedAt: { type: Date },
  author: { type: String, default: 'AI Autonomous Editor' },
  brandVoiceUsed: { type: String, default: 'Humanized Educational' },
  
  // Live website integration sync
  liveSync: {
    synced: { type: Boolean, default: false },
    remotePostId: { type: String, default: '' },
    lastSyncedAt: { type: Date },
    syncError: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
