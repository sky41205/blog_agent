/**
 * Agent 5: Image Strategy Agent
 * 
 * Responsibilities:
 * - Analyzes blog title, section headings, and surrounding paragraph context
 * - Determines which specific sections genuinely warrant an image and why
 * - Strict mandate: "Do not generate images merely because an article has a heading. Generate images only when they add genuine value."
 * - For each proposed image (featured hero + selective high-value inline visuals), defines:
 *   1. Exact purpose of the image
 *   2. Specific section where it belongs (sectionId & heading)
 *   3. Main subject and visual message
 *   4. Relevant objects, environment, people, and actions
 *   5. Desired composition, camera angle, perspective, and focal point
 *   6. Lighting, color palette, art direction, and visual style
 *   7. Aspect ratio (16:9, 4:3, 1:1) and placement (featured image, inline illustration, thumbnail)
 *   8. Image type: concept, process diagram, comparison, or realistic scene
 */

const BaseAgent = require('./BaseAgent');

function extractSectionsFromMarkdown(markdown) {
  const sections = [];
  const lines = (markdown || '').split('\n');
  let currentHeading = 'Introduction';
  let currentParagraphs = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      if (currentParagraphs.length > 0) {
        sections.push({
          heading: currentHeading,
          paragraphText: currentParagraphs.join('\n\n').trim().slice(0, 450)
        });
        currentParagraphs = [];
      }
      currentHeading = headingMatch[1].trim();
    } else if (line.trim().length > 0 && !line.startsWith('<!--') && !line.startsWith('```')) {
      currentParagraphs.push(line.trim());
    }
  }
  if (currentParagraphs.length > 0) {
    sections.push({
      heading: currentHeading,
      paragraphText: currentParagraphs.join('\n\n').trim().slice(0, 450)
    });
  }
  return sections;
}

class ImageStrategyAgent extends BaseAgent {
  constructor() {
    super('ImageStrategyAgent', 'Visual Content Strategist & Art Director');
  }

  async run(input, context = {}) {
    const title = input.title || 'Modern Architecture';
    const contentMarkdown = input.contentMarkdown || '';
    const category = input.category || 'Technology';
    const preferredStyle = input.preferredStyle || 'style_flux_photoreal';
    const maxInlineImages = Number(input.maxInlineImages) || 2;

    this.log('ANALYZING', `Evaluating paragraph-grounded visual opportunities for "${title}" (Max inline: ${maxInlineImages})...`);

    const extractedSections = extractSectionsFromMarkdown(contentMarkdown);

    const ai = await this.getAI();
    const prompt = `
You are the Image Strategy Agent in an advanced multi-agent blog platform.
Analyze the article sections and surrounding paragraphs to formulate a purposeful, selective visual strategy.

Article Title: "${title}"
Category: "${category}"
Preferred Visual Style: "${preferredStyle}"

Extracted Sections and Paragraph Context:
${JSON.stringify(extractedSections.slice(0, 8), null, 2)}

STRICT IMAGE-TO-CONTENT GROUNDING MANDATE:
Each image must be chosen and tailored to the ACTUAL PARAGRAPH it accompanies, NOT just the overall blog title.
For example, an article about HRMS payroll must NEVER receive a generic office meeting photo when the section explains salary calculation or tax deduction processing!
- Image 1 is the Featured Hero Image (16:9) establishing atmospheric context for the article.
- Propose 1 to ${maxInlineImages} Inline Visuals ONLY where a specific paragraph explains complex processes, architecture, or domain mechanics that need visual depiction.

FOR EVERY PROPOSED IMAGE, DEFINE ALL DIMENSIONS:
1. "purpose": Why is this image necessary? What does it clarify in the accompanying paragraph?
2. "sectionId": Specific anchor or heading ID
3. "sectionHeading": Exact section heading it accompanies
4. "accompanyingParagraphText": 1-2 sentences summarizing or quoting the exact paragraph this visual sits next to
5. "paragraphKeyTheme": Specific action, mechanism, data, or concept in that paragraph (e.g., "automated payroll tax calculation ledger")
6. "subjectAndMessage": Main subject and the core visual message conveying the paragraph's specific topic
7. "objectsAndEnvironment": Concrete physical objects, environment setting, people (if any), and actions taking place
8. "composition": Camera angle, framing (wide, medium, close-up, isometric), perspective, and focal point
9. "lightingAndColor": Lighting style, color palette, and mood
10. "specs":
   - "aspectRatio": "16:9" | "4:3" | "1:1"
   - "placement": "featured_hero" | "inline_illustration" | "thumbnail"
   - "imageType": "concept" | "process_diagram" | "comparison" | "realistic_scene"

Return structured JSON:
{
  "totalImagesProposed": 2,
  "visualTheme": "Cohesive overarching visual aesthetic description",
  "proposedImages": [
    {
      "id": "hero-image",
      "placement": "featured_hero",
      "sectionId": "featured-hero",
      "sectionHeading": "${title}",
      "accompanyingParagraphText": "${(extractedSections[0]?.paragraphText || title).slice(0, 250)}",
      "paragraphKeyTheme": "Overarching core subject matter",
      "purpose": "Establish immediate visual authority and narrative tone for the article",
      "subjectAndMessage": "Core visual metaphor representing the article",
      "objectsAndEnvironment": "Physical objects, architecture/setting, atmospheric elements",
      "composition": "Cinematic wide shot, slight low angle, centered focal point with depth",
      "lightingAndColor": "Volumetric soft directional lighting, modern slate and indigo palette",
      "aspectRatio": "16:9",
      "imageType": "realistic_scene"
    }
  ]
}
Output ONLY valid JSON.
`;

    const parsed = await ai.generateJSON(prompt);

    // Ensure at least the hero image exists and attach extracted paragraph text if missing
    if (!parsed.proposedImages || parsed.proposedImages.length === 0) {
      const heroSection = extractedSections[0] || { heading: title, paragraphText: title };
      parsed.proposedImages = [
        {
          id: 'hero-image',
          placement: 'featured_hero',
          sectionId: 'featured-hero',
          sectionHeading: title,
          accompanyingParagraphText: heroSection.paragraphText || title,
          paragraphKeyTheme: 'Article Introduction',
          purpose: 'Establish immediate visual engagement and authentic context',
          subjectAndMessage: `Visual representation of ${title}`,
          objectsAndEnvironment: `Modern environment representing ${category}`,
          composition: 'Cinematic 35mm wide angle, clear focal depth',
          lightingAndColor: 'Natural ambient lighting, cohesive color grading',
          aspectRatio: '16:9',
          imageType: 'realistic_scene'
        }
      ];
      parsed.totalImagesProposed = 1;
    }

    // Attach section paragraph text fallback if omitted by AI
    parsed.proposedImages = parsed.proposedImages.map((img, idx) => {
      if (!img.accompanyingParagraphText || img.accompanyingParagraphText.length < 20) {
        const match = extractedSections.find(s => s.heading.toLowerCase().includes((img.sectionHeading || '').toLowerCase()))
          || extractedSections[idx]
          || extractedSections[0];
        img.accompanyingParagraphText = match?.paragraphText || img.sectionHeading || title;
      }
      return img;
    });

    return parsed;
  }

  async fallback(input, context, err) {
    const title = input.title || 'Technical Innovation';
    const category = input.category || 'Technology';
    return {
      totalImagesProposed: 2,
      visualTheme: `High-fidelity, documentary-style authentic visual storytelling for ${category}`,
      proposedImages: [
        {
          id: 'hero-image',
          placement: 'featured_hero',
          sectionId: 'featured-hero',
          sectionHeading: title,
          purpose: 'Provide compelling cover visual that captures the central theme',
          subjectAndMessage: `Authoritative visual establishing ${title}`,
          objectsAndEnvironment: `Pristine modern workspace with architectural lines and subtle technological cues`,
          composition: 'Medium-wide cinematic shot, 35mm lens, depth of field',
          lightingAndColor: 'Soft natural daylight with cool ambient slate accents',
          aspectRatio: '16:9',
          imageType: 'realistic_scene'
        },
        {
          id: 'inline-process',
          placement: 'inline_illustration',
          sectionId: 'core-mechanics',
          sectionHeading: 'Core Mechanics & Implementation',
          purpose: 'Visually communicate the decoupled flow of information between modular components',
          subjectAndMessage: 'Structured architectural flow of components interacting smoothly',
          objectsAndEnvironment: 'Modular glass nodes with clean directional light pulses connecting them',
          composition: 'Isometric 3D perspective, Octane render aesthetic',
          lightingAndColor: 'Frosted diffuse lighting, cyan and charcoal tones',
          aspectRatio: '16:9',
          imageType: 'process_diagram'
        }
      ]
    };
  }
}

module.exports = new ImageStrategyAgent();
