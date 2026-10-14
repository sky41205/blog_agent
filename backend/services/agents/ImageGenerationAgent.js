/**
 * Agent 9: Image Generation Agent
 * 
 * Strict Responsibility:
 * Dispatches approved visual prompts to the configured generation provider
 * (Google Cloud Imagen 3 via ADC, CablyAI, or High-Resolution Curated Studio).
 * Returns generated image artifacts without performing validation checks.
 * 
 * Boundary: Receives engineered prompts from Agent 8; outputs to Agent 10 (ImageValidationAgent).
 */

const imageService = require('../imageService');

class ImageGenerationAgent {
  constructor() {
    this.id = 'image_generation_agent';
    this.name = 'Image Generation Dispatcher';
    this.version = '1.0.0';
  }

  async execute(input = {}, context = {}) {
    const engineeredPrompts = input.engineeredPrompts || [];
    const blogTitle = input.blogTitle || 'Technical Architecture';
    const category = input.category || 'Technology';
    const preferredStyle = input.preferredStyle || 'style_flux_photoreal';

    const generatedAssets = [];

    for (let i = 0; i < engineeredPrompts.length; i++) {
      const spec = engineeredPrompts[i];
      let generationResult = null;

      try {
        const seed = Date.now() + Math.floor(Math.random() * 800000) + i * 1000;
        generationResult = await imageService.generateCustomImage(
          spec.modelOptimizedPrompt || spec.prompt,
          preferredStyle,
          spec.aspectRatio || '16:9',
          seed
        );
      } catch (genErr) {
        const fallbackSeed = Date.now() + i * 1000;
        const promptText = spec.modelOptimizedPrompt || spec.prompt || blogTitle;
        generationResult = {
          url: imageService.buildFluxImageUrl(promptText, preferredStyle, spec.aspectRatio || '16:9', fallbackSeed),
          prompt: promptText,
          provider: 'Hugging Face / FLUX Live Engine'
        };
      }

      generatedAssets.push({
        id: spec.id || `img-${i}`,
        sectionId: spec.sectionId,
        sectionHeading: spec.sectionHeading,
        placement: spec.placement || (i === 0 ? 'featured_hero' : 'inline_illustration'),
        accompanyingParagraphText: spec.accompanyingParagraphText || '',
        url: generationResult?.url || imageService.buildFluxImageUrl(spec.modelOptimizedPrompt || spec.prompt || blogTitle, preferredStyle, spec.aspectRatio || '16:9', Date.now() + i),
        altText: spec.descriptiveAltText || `Editorial visual representing ${spec.sectionHeading}`,
        caption: spec.editorialCaption || `Visual overview for ${spec.sectionHeading}`,
        prompt: spec.modelOptimizedPrompt || spec.prompt,
        model: generationResult?.provider || 'Hugging Face / FLUX Engine',
        aspectRatio: spec.aspectRatio || '16:9',
        imageType: spec.imageType || 'realistic_scene'
      });
    }

    return {
      success: true,
      agentId: this.id,
      data: {
        totalGenerated: generatedAssets.length,
        generatedAssets,
        featuredImage: generatedAssets.find(img => img.placement === 'featured_hero') || generatedAssets[0]
      }
    };
  }
}

module.exports = new ImageGenerationAgent();
