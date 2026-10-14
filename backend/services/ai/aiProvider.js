const GeminiService = require('./geminiService');
const OpenAIService = require('./openaiService');
const prompts = require('./prompts');
const Setting = require('../../models/Setting');
const dynamicFactSynthesizer = require('./dynamicFactSynthesizer');

class MockAIService {
  async generate(prompt, systemInstruction = '') {
    let topicMatch = prompt.match(/topic[:\s"]+([^"\n,]+)/i) || prompt.match(/about[:\s"]+([^"\n,]+)/i) || prompt.match(/title[:\s"]+([^"\n,]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Modern Software Engineering & Scalable Systems';
    
    let category = 'Technology';
    if (prompt.toLowerCase().includes('environment')) category = 'Environment';
    if (prompt.toLowerCase().includes('education')) category = 'Education';
    if (prompt.toLowerCase().includes('social') || prompt.toLowerCase().includes('poverty')) category = 'Social Welfare';
    if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('neural')) category = 'Artificial Intelligence';

    const article = await dynamicFactSynthesizer.synthesizeArticle(topic, category);
    return article.contentMarkdown;
  }

  async generateJSON(prompt, systemInstruction = '') {
    let topicMatch = prompt.match(/topic[:\s"]+([^"\n,]+)/i) || prompt.match(/title[:\s"]+([^"\n,]+)/i);
    const topic = topicMatch ? topicMatch[1].trim() : 'Scalable Production Systems in 2026';
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (prompt.includes('Trend Intelligence Analyst') || prompt.includes('candidate topics')) {
      const liveContext = await dynamicFactSynthesizer.gatherLiveContext(topic);
      const candidates = [];

      if (liveContext.wikiExtracts.length > 0) {
        liveContext.wikiExtracts.forEach((w, idx) => {
          candidates.push({
            title: `${w.title}: Comprehensive 2026 Implementation Guide`,
            description: w.snippet,
            category: "Technology",
            keywords: [w.title.toLowerCase(), "architecture", "implementation", "benchmarks"],
            trendVelocity: idx === 0 ? "Viral Surge" : "Rising Fast",
            estimatedSearchVolume: 12500 - idx * 2000,
            seoDifficulty: 0.35,
            recommendedAngle: "Focus on real-world architecture, code implementation, and benchmarks."
          });
        });
      }

      if (candidates.length === 0) {
        candidates.push({
          title: `${topic}: Architecture and Best Practices in Production`,
          description: `Comprehensive analysis of ${topic}, covering benchmarks, error boundaries, and scalable design patterns.`,
          category: "Technology",
          keywords: [topic.toLowerCase(), "architecture", "best practices", "performance"],
          trendVelocity: "Viral Surge",
          estimatedSearchVolume: 14500,
          seoDifficulty: 0.36,
          recommendedAngle: "Provide hands-on code examples and empirical benchmark tables."
        });
      }

      return candidates;
    }

    if (prompt.includes('AI Research Analyst')) {
      const liveContext = await dynamicFactSynthesizer.gatherLiveContext(topic);
      const keyFacts = [];
      
      if (liveContext.wikiExtracts.length > 0) {
        liveContext.wikiExtracts.forEach(w => keyFacts.push(w.snippet));
      }
      if (liveContext.devToSnippets.length > 0) {
        liveContext.devToSnippets.forEach(d => keyFacts.push(d.description));
      }
      if (keyFacts.length === 0) {
        keyFacts.push(
          `Modern implementations of ${topic} improve throughput and reduce operational friction by up to 40%.`,
          `Decoupled asynchronous workflows and strict schema validation eliminate 92% of runtime errors.`
        );
      }

      return {
        summary: `Verified technical research and empirical analysis on ${topic}.`,
        keyFacts,
        architectureHighlights: [
          "Stateless perception and ingestion interface.",
          "Deterministic validation and error recovery pipeline.",
          "End-to-end telemetry and observability metrics."
        ],
        faqs: [
          {
            question: `What is the core benefit of modern ${topic} architecture?`,
            answer: `It provides ultra-low latency, decoupled horizontal scaling, and predictable fault tolerance under load.`
          },
          {
            question: `How can engineering teams benchmark ${topic}?`,
            answer: `By establishing P95 latency baseline metrics, measuring CPU/RAM footprint per worker, and tracking MTTR during failures.`
          }
        ],
        sourceCitations: [
          {
            title: `Technical Whitepaper: ${topic}`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/\s+/g, '_'))}`,
            publicationDate: "2026",
            factSnippet: keyFacts[0] || `Empirical performance benchmarks for ${topic}.`
          }
        ]
      };
    }

    if (prompt.includes('SEO Strategist')) {
      return {
        metaTitle: `${topic} — Architecture, Implementation & Best Practices (2026 Guide)`,
        metaDescription: `Master ${topic}. Learn production architecture, empirical benchmarks, and implementation strategies for high-scale teams.`,
        slug: slug,
        primaryKeyword: topic.toLowerCase().split(' ').slice(0, 3).join(' '),
        secondaryKeywords: ["architecture best practices", "scalability", "benchmarks", "production engineering"],
        longTailKeywords: [`how to build ${topic.toLowerCase()}`, `${topic.toLowerCase()} production guide 2026`],
        seoScore: 94,
        scoreBreakdown: {
          keywordCoverage: 95,
          titleOptimization: 94,
          metaDescriptionQuality: 92,
          headingStructure: 96,
          readability: 91
        },
        jsonLdSchema: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": topic,
          "description": `Comprehensive guide on ${topic}.`,
          "author": { "@type": "Person", "name": "AI Editorial Wing" }
        }
      };
    }

    if (prompt.includes('Lead Editor')) {
      return {
        qualityScore: 94,
        readabilityAssessment: "Clear, authoritative, well-structured, and optimized for engineering audiences.",
        unsupportedClaims: [],
        fluffPhrasesIdentified: [],
        strengths: ["Clean code examples", "Strong FAQ section", "Empirically verified citations"],
        actionableImprovements: ["Ensure live code samples are tested with modern runtimes"],
        approvalRecommendation: "APPROVED"
      };
    }

    if (prompt.includes('Creative Visual Director')) {
      return {
        imagePrompt: `A sleek 3D isometric representation of ${topic}, dark modern theme with ambient cyan and violet highlights, minimal design, 8k render`,
        altText: `Concept illustration representing ${topic}`,
        caption: `Architectural visualization of ${topic}.`,
        filename: `${slug}.webp`
      };
    }

    let category = 'Technology';
    const pLow = prompt.toLowerCase();
    if (pLow.includes('environment') || pLow.includes('pollution') || pLow.includes('water') || pLow.includes('tree') || pLow.includes('farm') || pLow.includes('solar')) category = 'Environment';
    else if (pLow.includes('education') || pLow.includes('skill') || pLow.includes('school') || pLow.includes('literacy') || pLow.includes('tuition')) category = 'Education';
    else if (pLow.includes('welfare') || pLow.includes('social') || pLow.includes('poverty') || pLow.includes('dog') || pLow.includes('hunger') || pLow.includes('rescue')) category = 'Social Welfare';
    else if (pLow.includes('ai') || pLow.includes('agent') || pLow.includes('llm') || pLow.includes('rag')) category = 'Artificial Intelligence';

    const synthesized = await dynamicFactSynthesizer.synthesizeArticle(topic, category);
    return {
      title: synthesized.title || topic,
      excerpt: synthesized.excerpt,
      contentMarkdown: synthesized.contentMarkdown,
      primaryKeyword: synthesized.primaryKeyword,
      secondaryKeywords: synthesized.secondaryKeywords,
      metaTitle: synthesized.metaTitle,
      metaDescription: synthesized.metaDescription,
      imagePrompt: synthesized.imagePrompt,
      suggestedSlug: synthesized.slug || slug
    };
  }
}

const VertexAIService = require('./vertexAIService');

class AIProviderFactory {
  static async getProvider() {
    let setting = null;
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        setting = await Setting.findOne({ key: 'global_config' }).maxTimeMS(2000);
      }
    } catch (e) {
      // Setting query failed or mongo not ready
    }

    const providerType = setting?.aiProvider || process.env.AI_PROVIDER || 'gemini';
    const geminiKey = setting?.geminiApiKey || process.env.GEMINI_API_KEY || '';
    const geminiModel = setting?.geminiModel || 'gemini-1.5-flash';
    const projectId = process.env.GOOGLE_PROJECT_ID || 'bolg-agent';
    const vertexApiKey = setting?.vertexAIApiKey || process.env.VERTEX_AI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || '';
    const openaiKey = setting?.openaiApiKey || process.env.OPENAI_API_KEY;

    // 1. Primary: Google Generative AI Provider
    if (providerType === 'gemini' || (!setting?.aiProvider && geminiKey)) {
      console.log('[AIProviderFactory] Using Google Generative AI Provider (Model: %s)', geminiModel);
      return new GeminiService(geminiKey, geminiModel);
    }

    if (providerType === 'openai' && openaiKey) {
      console.log('[AIProviderFactory] Using OpenAI Provider (explicitly selected)');
      return new OpenAIService(openaiKey, setting?.openaiModel || 'gpt-4o');
    }

    if (providerType === 'mock') {
      console.log('[AIProviderFactory] Using Mock AI Provider (explicitly selected)');
      return new MockAIService();
    }

    // 2. Google Cloud Vertex AI
    try {
      const vertexService = new VertexAIService(projectId, geminiModel, vertexApiKey);
      if (vertexService.apiKey) {
        console.log('[AIProviderFactory] Using Google Cloud Vertex AI API Key Provider (Project: %s, Model: %s)', projectId, vertexService.modelName);
        return vertexService;
      }
      const token = await vertexService.getAccessToken();
      if (token) {
        console.log('[AIProviderFactory] Using Google Cloud Vertex AI ADC Provider (Project: %s, Model: %s)', projectId, vertexService.modelName);
        return vertexService;
      }
    } catch (err) {
      console.warn('[AIProviderFactory] Vertex AI init note:', err.message);
    }

    // 3. Fallback to Gemini Service
    return new GeminiService(geminiKey, geminiModel);
  }
}

module.exports = { AIProviderFactory, prompts };
