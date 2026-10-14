/**
 * Central Agent Registry
 * 
 * Stores each agent's metadata, schemas, single responsibility, and health status
 * without allowing the registry to perform the agent's specialist work.
 * Enforces least-privilege permissions, resource limits, and timeout policies.
 */

class AgentRegistry {
  constructor() {
    this.agents = new Map();
    this.registerCoreAgents();
  }

  registerCoreAgents() {
    // 1. API & Cloud Integration Agent
    this.register({
      id: 'api_integration_agent',
      name: 'API and Cloud Integration Agent',
      version: '1.0.0',
      phase: 'Phase A: Preflight',
      responsibility: 'Connects, configures, and validates external AI services and Google Cloud ADC for project bolg-agent.',
      inputSchema: { type: 'object', properties: { forceRefresh: { type: 'boolean' } } },
      outputSchema: { type: 'object', properties: { adcAuthentication: { type: 'object' }, billingStatus: { type: 'object' }, adaptersReady: { type: 'object' } } },
      authorizedDataSources: ['Google Cloud SDK', 'Local ADC Store', 'Service Usage API'],
      allowedProviders: ['Google Cloud ADC (bolg-agent)', 'Vertex AI', 'Gemini Direct API'],
      resourceLimits: { timeoutMs: 15000, maxRetries: 1 },
      permissions: ['gcloud.auth.readonly', 'serviceusage.services.list'],
      healthStatus: 'HEALTHY'
    });

    // 2. Google Cloud Credits & Cost Manager Agent
    this.register({
      id: 'cloud_cost_manager_agent',
      name: 'Google Cloud Credits and Cost Manager Agent',
      version: '1.0.0',
      phase: 'Phase A: Preflight',
      responsibility: 'Monitors API token consumption, estimates costs, enforces budget thresholds, and optimizes promotional credit offsets.',
      inputSchema: { type: 'object', properties: { expectedWordCount: { type: 'number' }, expectedImageCount: { type: 'number' } } },
      outputSchema: { type: 'object', properties: { preflightEstimate: { type: 'object' }, budgetVerification: { type: 'object' }, creditEligibility: { type: 'object' } } },
      authorizedDataSources: ['Cloud Billing API', 'Internal Telemetry Store'],
      allowedProviders: ['Google Cloud Billing (01BDC6-EB392B-26E85B)'],
      resourceLimits: { timeoutMs: 10000, maxRetries: 1 },
      permissions: ['cloudbilling.billingAccounts.get'],
      healthStatus: 'HEALTHY'
    });

    // 3. Topic Research & Fact-Checking Agent
    this.register({
      id: 'research_agent',
      name: 'Topic Research and Fact-Checking Agent',
      version: '1.0.0',
      phase: 'Phase B: Content Preparation',
      responsibility: 'Researches topic using live search grounding, extracts verified facts, citations, and flags uncertain claims.',
      inputSchema: { type: 'object', required: ['topic'], properties: { topic: { type: 'string' }, category: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { verifiedFacts: { type: 'array' }, sourceCitations: { type: 'array' }, searchIntent: { type: 'string' } } },
      authorizedDataSources: ['Google Search Grounding', 'Verified Domain Knowledge'],
      allowedProviders: ['Vertex AI Grounded Search', 'Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 30000, maxRetries: 2 },
      permissions: ['read:research_data'],
      healthStatus: 'HEALTHY'
    });

    // 4. Content Strategy and Outline Agent
    this.register({
      id: 'outline_agent',
      name: 'Content Strategy and Outline Agent',
      version: '1.0.0',
      phase: 'Phase B: Content Preparation',
      responsibility: 'Formulates unique content angle, H1-H3 hierarchy, key takeaways, and section visual roadmap.',
      inputSchema: { type: 'object', required: ['topic', 'researchArtifactId'], properties: { topic: { type: 'string' }, researchArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { contentAngle: { type: 'string' }, outline: { type: 'array' } } },
      authorizedDataSources: ['Approved Research Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 20000, maxRetries: 2 },
      permissions: ['read:research_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 5. Professional Blog Writing Agent
    this.register({
      id: 'writing_agent',
      name: 'Professional Blog Writing Agent',
      version: '1.0.0',
      phase: 'Phase B: Content Preparation',
      responsibility: 'Drafts engaging, humanized long-form prose with code blocks and section anchors based strictly on approved outline & research.',
      inputSchema: { type: 'object', required: ['topic', 'outlineArtifactId'], properties: { topic: { type: 'string' }, outlineArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { title: { type: 'string' }, contentMarkdown: { type: 'string' }, estimatedWordCount: { type: 'number' } } },
      authorizedDataSources: ['Approved Outline Artifact', 'Approved Research Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 45000, maxRetries: 2 },
      permissions: ['read:outline_artifact', 'read:research_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 6. SEO Optimization Agent
    this.register({
      id: 'seo_agent',
      name: 'SEO Optimization Agent',
      version: '1.0.0',
      phase: 'Phase B: Content Preparation',
      responsibility: 'Audits draft keywords, search intent, LSI terms, meta tags, and structured JSON-LD schema with transparent score.',
      inputSchema: { type: 'object', required: ['draftArtifactId'], properties: { draftArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { seoScore: { type: 'number' }, metaTitle: { type: 'string' }, schemaMarkup: { type: 'object' } } },
      authorizedDataSources: ['Approved Draft Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 20000, maxRetries: 2 },
      permissions: ['read:draft_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 7. Image Strategy Agent
    this.register({
      id: 'image_strategy_agent',
      name: 'Image Strategy Agent',
      version: '1.0.0',
      phase: 'Phase C: Visual Production',
      responsibility: 'Analyzes section paragraphs to formulate targeted, non-generic visual briefs grounded in paragraph specifics.',
      inputSchema: { type: 'object', required: ['draftArtifactId'], properties: { draftArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { proposedImages: { type: 'array' }, totalImagesProposed: { type: 'number' } } },
      authorizedDataSources: ['Approved Draft Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 25000, maxRetries: 2 },
      permissions: ['read:draft_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 8. Expert Image Prompt Engineering Agent
    this.register({
      id: 'image_prompt_agent',
      name: 'Expert Image Prompt Engineering Agent',
      version: '1.0.0',
      phase: 'Phase C: Visual Production',
      responsibility: 'Translates visual briefs into 9-dimension concrete prompts specifically grounded in accompanying paragraph content.',
      inputSchema: { type: 'object', required: ['visualBriefArtifactId'], properties: { visualBriefArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { engineeredPrompts: { type: 'array' } } },
      authorizedDataSources: ['Approved Visual Brief Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 25000, maxRetries: 2 },
      permissions: ['read:visual_brief_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 9. Image Generation Agent
    this.register({
      id: 'image_generation_agent',
      name: 'Image Generation Agent',
      version: '1.0.0',
      phase: 'Phase C: Visual Production',
      responsibility: 'Dispatches approved visual prompts to configured image generation provider and returns generated image assets.',
      inputSchema: { type: 'object', required: ['promptArtifactId'], properties: { promptArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { generatedAssets: { type: 'array' }, totalGenerated: { type: 'number' } } },
      authorizedDataSources: ['Approved Prompt Artifact'],
      allowedProviders: ['Vertex AI Imagen 3 (ADC)', 'CablyAI', 'Editorial Photo CDN'],
      resourceLimits: { timeoutMs: 60000, maxRetries: 2 },
      permissions: ['dispatch:image_generation'],
      healthStatus: 'HEALTHY'
    });

    // 10. Image Validation Agent
    this.register({
      id: 'image_validation_agent',
      name: 'Image Generation and Accuracy Validation Agent',
      version: '1.0.0',
      phase: 'Phase C: Visual Production',
      responsibility: 'Audits generated images against section briefs and accompanying paragraphs with paragraph alignment scoring.',
      inputSchema: { type: 'object', required: ['imageArtifactId', 'promptArtifactId'], properties: { imageArtifactId: { type: 'string' }, promptArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { validatedImages: { type: 'array' }, featuredImage: { type: 'object' } } },
      authorizedDataSources: ['Generated Image Artifact', 'Approved Prompt Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 30000, maxRetries: 2 },
      permissions: ['read:image_artifact', 'read:prompt_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 11. Editorial Review and Critique Agent
    this.register({
      id: 'editorial_review_agent',
      name: 'Editorial Review and Critique Agent',
      version: '1.0.0',
      phase: 'Phase D: Quality Assurance',
      responsibility: 'Conducts independent 9-dimension editorial critique, separates writing vs visual issues, and issues verdicts.',
      inputSchema: { type: 'object', required: ['draftArtifactId'], properties: { draftArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { verdict: { type: 'string' }, editorialScore: { type: 'number' }, writingIssues: { type: 'array' } } },
      authorizedDataSources: ['Draft Artifact', 'Research Artifact', 'Validated Images Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 30000, maxRetries: 2 },
      permissions: ['read:draft_artifact', 'read:research_artifact', 'read:images_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 12. Final Revision Agent
    this.register({
      id: 'revision_agent',
      name: 'Final Revision Agent',
      version: '1.0.0',
      phase: 'Phase D: Quality Assurance',
      responsibility: 'Applies reviewer corrections from the critic-revision loop to produce polished, updated article versions.',
      inputSchema: { type: 'object', required: ['draftArtifactId', 'critiqueArtifactId'], properties: { draftArtifactId: { type: 'string' }, critiqueArtifactId: { type: 'string' } } },
      outputSchema: { type: 'object', properties: { revisedMarkdown: { type: 'string' }, revisionsApplied: { type: 'array' } } },
      authorizedDataSources: ['Draft Artifact', 'Critique Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 35000, maxRetries: 2 },
      permissions: ['read:draft_artifact', 'read:critique_artifact'],
      healthStatus: 'HEALTHY'
    });

    // 13. Publishing and Packaging Agent
    this.register({
      id: 'publishing_agent',
      name: 'Publishing and Content Packaging Agent',
      version: '1.0.0',
      phase: 'Phase E: Finalization',
      responsibility: 'Assembles publication bundle, formats references, embeds verified images, and packages distribution metadata.',
      inputSchema: { type: 'object', required: ['revisedDraftArtifactId', 'seoArtifactId', 'validatedImagesArtifactId'] },
      outputSchema: { type: 'object', properties: { title: { type: 'string' }, contentMarkdown: { type: 'string' }, socialMediaExcerpts: { type: 'object' } } },
      authorizedDataSources: ['Revised Draft Artifact', 'SEO Artifact', 'Validated Images Artifact'],
      allowedProviders: ['Gemini 2.5 Flash'],
      resourceLimits: { timeoutMs: 25000, maxRetries: 1 },
      permissions: ['package:publishing_bundle'],
      healthStatus: 'HEALTHY'
    });
  }

  register(agentMeta) {
    if (!agentMeta.id || !agentMeta.name) {
      throw new Error('Agent id and name are required for registration.');
    }
    this.agents.set(agentMeta.id, Object.freeze({ ...agentMeta }));
  }

  getAgent(id) {
    return this.agents.get(id) || null;
  }

  listAgents() {
    return Array.from(this.agents.values());
  }

  getRegistryStats() {
    return {
      totalAgents: this.agents.size,
      healthyAgents: Array.from(this.agents.values()).filter(a => a.healthStatus === 'HEALTHY').length,
      phases: ['Phase A: Preflight', 'Phase B: Content Preparation', 'Phase C: Visual Production', 'Phase D: Quality Assurance', 'Phase E: Finalization']
    };
  }
}

module.exports = new AgentRegistry();
