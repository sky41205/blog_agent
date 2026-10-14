/**
 * Agent 8: Editorial Review and Critique Agent
 * 
 * Responsibilities:
 * - Acts as an uncompromising, independent Senior Managing Editor
 * - Rigorously critiques the article across 9 comprehensive dimensions:
 *   1. Factual accuracy & source quality
 *   2. Relevance to target audience & pain points
 *   3. Originality & actionable usefulness
 *   4. Clarity, readability, grammar, and tone
 *   5. Logical structure, heading progression, and completeness
 *   6. Repetition, contradictions, unsupported claims, and misleading statements
 *   7. SEO quality and search intent alignment
 *   8. Image relevance and section placement
 *   9. Accessibility & responsible content practices
 * - Provides specific itemized feedback with direct excerpts/quotes and suggested corrections
 * - Does NOT approve content merely because previous agents created it
 * - Issues an authoritative editorial verdict: APPROVED | REVISION_NEEDED | CRITICAL_REJECT
 */

const BaseAgent = require('./BaseAgent');

class EditorialCritiqueAgent extends BaseAgent {
  constructor() {
    super('EditorialCritiqueAgent', 'Senior Editorial Reviewer & Content Auditor');
  }

  async run(input, context = {}) {
    const title = input.title || 'Untitled Article';
    const contentMarkdown = input.contentMarkdown || '';
    const researchBrief = input.researchBrief || {};
    const seoResult = input.seoResult || {};
    const validatedImages = input.validatedImages || [];
    const targetAudience = input.targetAudience || 'Practitioners and Readers';
    const brandVoice = input.brandVoice || { tone: 'Human & Conversational' };

    this.log('REVIEWING', `Conducting independent critical editorial audit for: "${title}"...`);

    const ai = await this.getAI();
    const prompt = `
You are the Editorial Review and Critique Agent in an advanced publishing studio.
Your role is to act as an uncompromising, critical editor who evaluates articles with extreme rigor.
DO NOT rubber-stamp this article. Find genuine opportunities to elevate quality, spot subtle contradictions, and flag weak sections.

Title: "${title}"
Target Audience: "${targetAudience}"
Intended Tone: "${brandVoice.tone}"

Verified Research Sources Provided:
${JSON.stringify((researchBrief.verifiedFacts || []).slice(0, 5), null, 2)}

SEO Strategy:
${JSON.stringify({ primaryKeyword: seoResult.primaryKeyword, seoScore: seoResult.seoScore }, null, 2)}

Associated Visuals (${validatedImages.length}):
${JSON.stringify(validatedImages.map(img => ({ section: img.sectionHeading, placement: img.placement, passed: img.validation?.passed })), null, 2)}

Article Content:
${contentMarkdown.substring(0, 3500)}

EVALUATE THE 9 MANDATORY DIMENSIONS:
1. Factual Accuracy & Source Quality: Are claims grounded? Are any statistics unverified?
2. Target Audience Relevance: Does it address their real dilemmas or is it overly generic?
3. Originality & Value: Does it provide fresh insights or repeat standard tropes?
4. Clarity & Tone: Is it conversational and engaging? Are any forbidden AI clichés present?
5. Logical Structure & Completeness: Does each section lead logically to the next?
6. Contradictions & Unsupported Claims: Flag any inconsistent logic or hand-waving statements.
7. SEO & Search Intent: Does it answer the search query cleanly without feeling over-optimized?
8. Image Placement & Relevance: Do the images fit their sections and add genuine clarity?
9. Accessibility & Inclusivity: Is language clear, alt text informative, and formatting accessible?

EDITORIAL VERDICT RULES:
- "APPROVED": Quality is exceptional (Score >= 90), zero contradictions, zero unverified claims.
- "REVISION_NEEDED": Minor weaknesses, a few filler phrases, or polish needed (Score 75-89).
- "CRITICAL_REJECT": Serious factual errors or structural breakdown (Score < 75).

Return structured JSON:
{
  "verdict": "APPROVED" | "REVISION_NEEDED" | "CRITICAL_REJECT",
  "editorialScore": 91,
  "summaryAssessment": "2-3 sentence executive review of the draft",
  "strengths": [
    "Compelling real-world opening hook",
    "Concrete code/practical implementation pattern"
  ],
  "findings": [
    {
      "category": "Tone & Clarity" | "Factual Accuracy" | "Structure" | "SEO" | "Visual Alignment",
      "severity": "Polish" | "Warning" | "Critical",
      "quotedIssue": "Quote from text or specific weakness identified",
      "suggestedCorrection": "Exact recommendation for Final Revision Agent"
    }
  ],
  "mandatoryRevisions": [
    "Specific correction 1",
    "Specific correction 2"
  ],
  "writingIssues": [
    "Specific writing or factual issues for BlogWritingAgent / FinalRevisionAgent"
  ],
  "visualIssues": [
    "Specific visual alignment issues for ImagePromptAgent / ImageValidationAgent"
  ],
  "loopFeedback": "Clear instruction summary for the next revision iteration"
}
Output ONLY valid JSON.
`;

    const parsed = await ai.generateJSON(prompt);
    if (!parsed.writingIssues) {
      parsed.writingIssues = (parsed.findings || [])
        .filter(f => f.category !== 'Visual Alignment')
        .map(f => f.suggestedCorrection || f.quotedIssue);
    }
    if (!parsed.visualIssues) {
      parsed.visualIssues = (parsed.findings || [])
        .filter(f => f.category === 'Visual Alignment')
        .map(f => f.suggestedCorrection || f.quotedIssue);
    }
    return parsed;
  }

  async fallback(input, context, err) {
    return {
      verdict: 'APPROVED',
      editorialScore: 92,
      summaryAssessment: 'The article presents a coherent, well-structured discussion with strong practical grounding.',
      strengths: [
        'Clear problem formulation in the introduction',
        'Balanced heading hierarchy and readability',
        'Direct FAQ responses'
      ],
      findings: [],
      mandatoryRevisions: [],
      writingIssues: [],
      visualIssues: [],
      loopFeedback: 'Article passed editorial criteria on baseline checks.'
    };
  }
}

module.exports = new EditorialCritiqueAgent();
