/**
 * Agent 2: Content Strategy and Outline Agent
 * 
 * Responsibilities:
 * - Develops a unique content angle and defines the article's core purpose
 * - Creates an SEO-friendly title, introduction hook strategy, and conclusion roadmap
 * - Builds a logical, balanced outline using H1, H2, and H3 headings
 * - Identifies supporting examples, FAQs, internal links, external references, and potential visuals
 * - Identifies which specific sections genuinely warrant a visual (and why) to prevent visual clutter
 * - Avoids repetitive sections, keyword stuffing, and unnecessary filler
 */

const BaseAgent = require('./BaseAgent');
const seoService = require('../seoService');

class ContentStrategyOutlineAgent extends BaseAgent {
  constructor() {
    super('ContentStrategyOutlineAgent', 'Content Strategy & Outline Architect');
  }

  async run(input, context = {}) {
    const topic = (input.topic || input.topicTitle || 'Modern Architecture').trim();
    const researchBrief = input.researchBrief || {};
    const brandVoice = input.brandVoice || { tone: 'Human & Conversational' };
    const targetAudience = input.targetAudience || researchBrief.targetAudience?.profile || 'Practitioners & Readers';
    const contentType = input.contentType || 'Comprehensive Technical Guide';
    const targetWordCount = Math.max(1600, Number(input.targetWordCount) || 1600);

    this.log('PLANNING', `Synthesizing comprehensive, in-depth content angle and outline for: "${topic}" (${contentType}, target: ~${targetWordCount} words)...`);

    const ai = await this.getAI();
    const prompt = `
You are the Content Strategy and Outline Agent in an advanced multi-agent blog platform.
Your objective is to craft an impeccably detailed, comprehensive, practitioner-grade content blueprint.

Topic: "${topic}"
Content Type: "${contentType}"
Target Word Count: ${targetWordCount} words (minimum: 1500 words, maximum: 2400 words)
Tone: "${brandVoice.tone}"
Target Audience: "${targetAudience}"

Verified Research Brief:
${JSON.stringify({
  searchIntent: researchBrief.searchIntent,
  keyQuestions: researchBrief.keyQuestions,
  currentTrends: researchBrief.currentTrends,
  knowledgeGaps: researchBrief.knowledgeGaps,
  verifiedFacts: researchBrief.verifiedFacts?.slice(0, 5)
}, null, 2)}

DEEP CONTENT STRATEGY MANDATES:
1. Long-Form Depth: Design an exhaustive 6 to 8 section outline. Each section must have substantive subtopics (250-400 words per section) so the final article achieves a true long-form depth of at least ${targetWordCount} words.
2. Heading Hierarchy:
   - Must follow a rigorous logical progression:
     1. Introduction & Real-World Problem Space (Hook, context, stakes)
     2. Theoretical & Architectural Foundations (Core mechanisms, principles)
     3. Step-by-Step Technical Blueprint / Methodology (Hands-on walkthrough)
     4. Empirical Benchmarks & Comparative Metrics (Dedicated section for Markdown table)
     5. Production Pitfalls, Edge Cases & Failure Modes (Real risks, prevention)
     6. Field Case Study / Real-World Deployment (Measurable outcomes)
     7. Frequently Asked Questions (At least 4 deep, non-obvious practitioner questions)
     8. Actionable Engineering Checklist / Runbook (Tangible takeaway)
3. For each section, specify:
   * "id": kebab-case identifier (e.g., "architectural-foundations")
   * "heading": engaging, value-packed section title
   * "level": 2 or 3
   * "estimatedWords": 250 - 450 words
   * "keyPoints": 3-4 specific points, benchmarks, or code concepts to address
   * "proposedVisual": If this section genuinely benefits from a visual (diagram, telemetry chart, architectural model), describe the visual concept. Recommend 2-3 total visuals for the article.
4. Anti-Shallow Enforcement: Forbid 1-paragraph superficial summaries. Outline must guarantee technical depth, actionable trade-offs, and empirical rigour.

Return structured JSON:
{
  "contentAngle": "Fresh, authoritative perspective distinguishing this publication",
  "articlePurpose": "Clear, tangible transformation and actionable takeaways reader will achieve",
  "workingTitle": "Compelling, Authoritative Title (under 70 chars)",
  "suggestedSlug": "clean-url-slug",
  "introHookStrategy": "Gripping real-world scenario, production incident, or industry paradox",
  "outline": [
    {
      "id": "context-problem-space",
      "heading": "The Production Landscape: Why Traditional Approaches Fail",
      "level": 2,
      "estimatedWords": 250,
      "keyPoints": ["Industry bottlenecks", "Real-world friction", "Economic / technical stakes"],
      "proposedVisual": "Featured hero visual establishing atmospheric subject context"
    },
    {
      "id": "architectural-foundations",
      "heading": "Core Architectural Mechanics and Foundational Principles",
      "level": 2,
      "estimatedWords": 350,
      "keyPoints": ["Underlying mechanics", "Data flow & interfaces", "Core design contracts"],
      "proposedVisual": "Technical architecture diagram illustrating modular components"
    },
    {
      "id": "practical-implementation",
      "heading": "Step-by-Step Production Implementation Guide",
      "level": 2,
      "estimatedWords": 400,
      "keyPoints": ["Concrete implementation steps", "Working code / configuration blueprint", "Defensive error boundaries"],
      "proposedVisual": null
    },
    {
      "id": "benchmark-matrix",
      "heading": "Empirical Performance Benchmarks and Trade-off Analysis",
      "level": 2,
      "estimatedWords": 300,
      "keyPoints": ["Comparative latency and throughput data", "Resource utilization metrics", "Cost implications table"],
      "proposedVisual": null
    },
    {
      "id": "production-pitfalls",
      "heading": "Critical Failure Modes, Anti-Patterns, and Mitigation Runbooks",
      "level": 2,
      "estimatedWords": 350,
      "keyPoints": ["Top 3 silent failure modes", "Edge case behaviors", "Runbook recovery procedures"],
      "proposedVisual": null
    },
    {
      "id": "strategic-checklist",
      "heading": "Practitioner Checklist & Next-Generation Roadmap",
      "level": 2,
      "estimatedWords": 250,
      "keyPoints": ["Implementation audit checklist", "Future evolution", "Closing takeaways"],
      "proposedVisual": null
    }
  ],
  "faqs": [
    { "question": "What is the primary trade-off when adopting this architecture?", "guidance": "Explain latency vs consistency implications" },
    { "question": "How do you handle catastrophic failure or network partitions?", "guidance": "Provide deterministic recovery steps" },
    { "question": "What are the minimum infrastructure prerequisites?", "guidance": "Give concrete hardware/software baseline" },
    { "question": "How does this approach compare against legacy alternatives in total cost of ownership?", "guidance": "Cite empirical operational efficiency gains" }
  ],
  "potentialVisualCount": 2,
  "internalLinkSuggestions": ["Related architecture guide"],
  "externalCitationsToFeature": ["Industry RFC / ACM benchmark paper"]
}
Output ONLY valid JSON.
`;

    const parsed = await ai.generateJSON(prompt);

    if (!parsed.suggestedSlug) {
      parsed.suggestedSlug = seoService.generateSlug(parsed.workingTitle || topic);
    }

    if (Array.isArray(parsed.outline)) {
      parsed.outline = parsed.outline.map(s => {
        let proposedVisual = s.proposedVisual;
        if (typeof proposedVisual === 'object' && proposedVisual !== null) {
          proposedVisual = proposedVisual.concept || proposedVisual.value || proposedVisual.type || JSON.stringify(proposedVisual);
        }
        return {
          ...s,
          proposedVisual: proposedVisual || null,
          keyPoints: Array.isArray(s.keyPoints)
            ? s.keyPoints.map(kp => (typeof kp === 'object' && kp !== null ? (kp.text || kp.point || JSON.stringify(kp)) : String(kp)))
            : []
        };
      });
    }

    return parsed;
  }

  async fallback(input, context, err) {
    const topic = input.topic || 'Scalable Modern Engineering';
    const slug = seoService.generateSlug(topic);
    return {
      contentAngle: `A hands-on, practitioner-led deep dive into ${topic} focusing on real-world reliability and observable outcomes.`,
      articlePurpose: `Equip readers with actionable architectural knowledge and clear implementation steps for ${topic}.`,
      workingTitle: `${topic}: Complete Architectural Guide and Best Practices`,
      suggestedSlug: slug,
      introHookStrategy: `Start with a relatable operational friction point that engineering teams encounter when scaling ${topic}.`,
      outline: [
        {
          id: 'introduction-context',
          heading: `Why ${topic} Matters in 2026`,
          level: 2,
          estimatedWords: 180,
          keyPoints: ['Current industry landscape', 'The core bottleneck teams face'],
          proposedVisual: 'Featured architectural overview of modern infrastructure'
        },
        {
          id: 'core-mechanics',
          heading: `Core Mechanics and Architectural Foundations`,
          level: 2,
          estimatedWords: 350,
          keyPoints: ['Fundamental components', 'Data flow and operational guarantees'],
          proposedVisual: 'Process diagram illustrating message and request flow across nodes'
        },
        {
          id: 'production-patterns',
          heading: `Production Implementation Patterns & Code Walkthrough`,
          level: 2,
          estimatedWords: 380,
          keyPoints: ['Step-by-step implementation blueprint', 'Error boundaries and resiliency'],
          proposedVisual: null
        },
        {
          id: 'faqs',
          heading: `Frequently Asked Questions`,
          level: 2,
          estimatedWords: 200,
          keyPoints: ['Common scaling concerns', 'Performance tuning baselines'],
          proposedVisual: null
        },
        {
          id: 'conclusion-action',
          heading: `Key Takeaways and Next Steps`,
          level: 2,
          estimatedWords: 140,
          keyPoints: ['Checklist for getting started', 'Final encouraging perspective'],
          proposedVisual: null
        }
      ],
      faqs: [
        { question: `What is the primary advantage of ${topic}?`, guidance: 'Explain resilience and scalability gains' },
        { question: `How do teams avoid common pitfalls?`, guidance: 'Recommend incremental testing and monitoring' }
      ],
      potentialVisualCount: 2,
      internalLinkSuggestions: ['Modern Cloud Architecture', 'System Observability'],
      externalCitationsToFeature: ['Industry benchmarks and official specifications']
    };
  }
}

module.exports = new ContentStrategyOutlineAgent();
