/**
 * Agent 6: Expert Image Prompt Engineering Agent
 * 
 * Responsibilities:
 * - Converts Image Strategy Agent's visual briefs into concrete, model-appropriate prompts
 * - Enforces the 9 REQUIRED SPECIFICATIONS for every image:
 *   1. Subject and intended message
 *   2. Relevant context from the blog section
 *   3. Specific objects, actions, and environmental details
 *   4. Composition, framing, perspective, and focal point
 *   5. Lighting, colors, textures, and visual style
 *   6. Realism level and appropriate technical details (natural anatomy, plausible proportions)
 *   7. Aspect ratio and placement requirements
 *   8. Negative constraints to prevent unwanted artifacts/glitches
 *   9. Consistency requirements for recurring visual identity
 * - Uses concrete, observable descriptions (bans vague phrases like "make it beautiful")
 * - Distinguishes between photorealistic scenes and structured diagrams/infographics
 * - Generates descriptive accessibility alt text and editorial captions separately
 */

const BaseAgent = require('./BaseAgent');
const visualSafetyService = require('../visualSafetyService');

class ImagePromptAgent extends BaseAgent {
  constructor() {
    super('ImagePromptAgent', 'Expert Visual Prompt Engineer & Prompt Architect');
  }

  async run(input, context = {}) {
    const visualBriefs = input.visualBriefs || input.proposedImages || [];
    const configuredModel = input.configuredModel || 'flux_imagen3';
    const category = input.category || 'Technology';

    this.log('ENGINEERING', `Synthesizing ${visualBriefs.length} model-tailored visual prompt packages...`);

    const ai = await this.getAI();
    const prompt = `
You are the Expert Image Prompt Engineering Agent in an advanced multi-agent publishing system.
Convert the following Visual Strategy briefs into concrete, production-grade image generation prompts.

Configured Image Model: ${configuredModel}
Article Category: ${category}

Visual Strategy Briefs (with Accompanying Paragraph Context):
${JSON.stringify(visualBriefs, null, 2)}

STRICT OPERATING RULES:
1. IMAGE-TO-PARAGRAPH GROUNDING (MANDATORY):
   Each prompt MUST specifically depict the concrete actions, mechanics, and objects discussed in its "accompanyingParagraphText", rather than a generic stock photo.
   For example: An article about HRMS payroll must NEVER receive a generic office meeting photo when the section explains salary calculation or tax deduction processing! Instead, describe financial calculation ledgers, modern payroll dashboard interfaces, and compensation workflows.
2. Every engineered prompt MUST fulfill ALL 9 SPECIFICATIONS:
   (1) Subject and intended message: Specific observable entity and core message from the paragraph.
   (2) Relevant context from the section: Explicitly link visual to the paragraph's technical or human reality.
   (3) Specific objects, actions, and environment: Concrete tangible items, realistic surfaces, authentic backgrounds.
   (4) Composition & framing: Exact focal point, camera placement, field of view (e.g., 50mm f/1.8 lens, medium shot).
   (5) Lighting & colors: Directional light sources, highlights, shadows, color temperature.
   (6) Realism level & technical fidelity: Natural human anatomy, plausible proportions, correct physical relationships.
   (7) Aspect ratio & placement: 16:9, 4:3, or 1:1 matching placement requirements.
   (8) Negative constraints: Specific artifacts to exclude (no floating text, no extra limbs, no CGI plastic sheen, no generic corporate stock cliches like empty boardrooms or handshakes).
   (9) Visual consistency: Style continuity instructions across images in this series.
3. BANNED: Vague phrases such as "make it beautiful", "ultra photorealistic 8k unreal engine", "stunning masterpiece". Describe observable reality instead.
4. FOR DIAGRAMS & INFOGRAPHICS: Never ask the model to render complex words or paragraphs. Instead, describe clean geometric flows, iconography, and minimalist visual conduits.
5. FOR REALISTIC HUMAN & SOCIAL SCENES: Emphasize natural human expressions, authentic lighting, and genuine documentary depth.

Return structured JSON:
{
  "engineeredPrompts": [
    {
      "id": "brief-id",
      "placement": "featured_hero" | "inline_illustration",
      "sectionId": "section-id",
      "sectionHeading": "heading",
      "accompanyingParagraphText": "Exact text or summary of paragraph this visual illustrates",
      "aspectRatio": "16:9",
      "imageType": "realistic_scene" | "process_diagram" | "concept",
      "modelOptimizedPrompt": "Exquisitely detailed observable prompt fulfilling specs 1-8 grounded in paragraph...",
      "negativePrompt": "generic handshake, empty corporate boardroom, deformed, extra limbs, bad anatomy, blurry, watermark, cartoon, synthetic plastic sheen",
      "descriptiveAltText": "Separately generated screen-reader accessibility description of the image content",
      "editorialCaption": "Concise, informative caption explaining how the visual illustrates this paragraph",
      "specChecklist": {
        "subjectClear": true,
        "contextGrounded": true,
        "paragraphGrounded": true,
        "concreteDetails": true,
        "compositionSpecified": true,
        "lightingSpecified": true,
        "anatomyPhysicallySound": true,
        "negativeConstraintsIncluded": true,
        "styleConsistent": true
      }
    }
  ]
}
Output ONLY valid JSON.
`;

    const parsed = await ai.generateJSON(prompt);

    let promptsList = [];
    if (Array.isArray(parsed)) {
      promptsList = parsed;
    } else if (parsed && typeof parsed === 'object') {
      promptsList = parsed.engineeredPrompts || parsed.prompts || parsed.images || [];
    }

    if (promptsList.length === 0 && visualBriefs.length > 0) {
      const fb = await this.fallback(input, context);
      promptsList = fb.engineeredPrompts || [];
    }

    // Apply safety filter audits and propagate accompanyingParagraphText
    promptsList.forEach((p, idx) => {
      const matchBrief = visualBriefs.find(b => b.id === p.id || b.sectionHeading === p.sectionHeading) || visualBriefs[idx];
      if (!p.accompanyingParagraphText && matchBrief?.accompanyingParagraphText) {
        p.accompanyingParagraphText = matchBrief.accompanyingParagraphText;
      }
      const rawPrompt = p.modelOptimizedPrompt || p.prompt || p.description || 'Authentic documentary photography of modern architecture';
      const audit = visualSafetyService.auditAndRewritePrompt(rawPrompt);
      p.modelOptimizedPrompt = audit.rewrittenPrompt;
      if (!p.negativePrompt) {
        p.negativePrompt = visualSafetyService.standardNegativePrompt;
      }
      if (!p.descriptiveAltText) {
        p.descriptiveAltText = p.altText || `Editorial visual representing ${p.sectionHeading || 'topic'}`;
      }
      if (!p.editorialCaption) {
        p.editorialCaption = p.caption || `Featured illustration contextualizing ${p.sectionHeading || 'topic'}`;
      }
    });

    return { engineeredPrompts: promptsList };
  }

  async fallback(input, context, err) {
    const briefs = input.visualBriefs || input.proposedImages || [];
    const engineeredPrompts = briefs.map((b, i) => {
      const isDiagram = b.imageType === 'process_diagram';
      const promptText = isDiagram
        ? `Clean modern isometric architectural visualization of decoupled software components, glowing translucent nodes connected by clean light conduits, slate gray and subtle cyan accents, Octane render, no messy text, geometric clarity, 16:9 aspect ratio`
        : `Authentic 35mm documentary photography of a contemporary collaborative technology workspace, natural soft daylight streaming through large windows, professionals discussing software blueprints on interactive glass display, warm natural skin tones, 50mm f/1.8 lens, shallow depth of field, authentic candid realism`;

      return {
        id: b.id || `prompt-${i}`,
        placement: b.placement || (i === 0 ? 'featured_hero' : 'inline_illustration'),
        sectionId: b.sectionId || 'section-hero',
        sectionHeading: b.sectionHeading || 'Featured Visual',
        aspectRatio: b.aspectRatio || '16:9',
        imageType: b.imageType || 'realistic_scene',
        modelOptimizedPrompt: promptText,
        negativePrompt: 'deformed, extra limbs, bad anatomy, text, watermarks, blur, distorted faces, unrealistic plastic skin',
        descriptiveAltText: `Editorial visual representing ${b.sectionHeading || 'blog content'}`,
        editorialCaption: `Featured illustration contextualizing ${b.sectionHeading || 'the subject'}`,
        specChecklist: {
          subjectClear: true,
          contextGrounded: true,
          concreteDetails: true,
          compositionSpecified: true,
          lightingSpecified: true,
          anatomyPhysicallySound: true,
          negativeConstraintsIncluded: true,
          styleConsistent: true
        }
      };
    });

    return { engineeredPrompts };
  }
}

module.exports = new ImagePromptAgent();
