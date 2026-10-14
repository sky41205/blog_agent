const Blog = require('../models/Blog');
const Setting = require('../models/Setting');
const { DEFAULT_BRAND_VOICE } = require('../config/constants');
const { AIProviderFactory } = require('./ai/aiProvider');

class BrandVoiceService {
  async getEffectiveBrandVoice() {
    try {
      const setting = await Setting.findOne({ key: 'global_config' });
      if (setting && setting.brandVoice) {
        return setting.brandVoice;
      }
    } catch (e) {
      console.warn(`[BrandVoice] Could not load stored voice: ${e.message}`);
    }
    return DEFAULT_BRAND_VOICE;
  }

  async extractBrandVoiceFromCorpus(sampleText = '') {
    try {
      let corpusText = sampleText ? sampleText.trim() : '';

      if (!corpusText) {
        const blogs = await Blog.find({ status: 'PUBLISHED' }).limit(5);
        if (blogs && blogs.length > 0) {
          corpusText = blogs.map(b => `${b.title}\n\n${(b.contentMarkdown || '').slice(0, 1500)}`).join('\n\n---\n\n');
        }
      }

      if (!corpusText || corpusText.length < 50) {
        return DEFAULT_BRAND_VOICE;
      }

      try {
        const ai = await AIProviderFactory.getProvider();
        const prompt = `
You are a World-Class Brand Voice & Editorial Persona Strategist.
Analyze the following writing sample and extract the exact brand voice profile, tone, cadence, and editorial guidelines.

Writing Sample:
"""
${corpusText.slice(0, 4000)}
"""

Extract structured JSON:
{
  "tone": "Descriptive summary of voice (e.g. 'Humanized, conversational, authoritative, and practical')",
  "formality": "conversational | medium | formal",
  "paragraphLength": "short (2-3 sentences) | medium (3-5 sentences)",
  "style": "Core stylistic approach (e.g. 'Educational + Real-World Benchmarks + Pragmatic Code Blueprints')",
  "ctaStyle": "soft and value-focused | direct call-to-action",
  "targetAudience": "Primary reader persona",
  "commonTerminology": ["key term 1", "key term 2", "key term 3", "key term 4"],
  "forbiddenWords": ["in today's digital world", "delve", "tapestry", "beacon"],
  "coreValues": ["Authenticity", "Technical Rigor", "Clarity", "Zero Fluff"]
}
Respond ONLY with valid JSON.
`;

        const extracted = await ai.generateJSON(prompt);
        if (extracted && extracted.tone) {
          const profile = {
            tone: extracted.tone,
            formality: extracted.formality || 'medium',
            paragraphLength: extracted.paragraphLength || 'short (2-3 sentences)',
            style: extracted.style || 'educational + actionable insights',
            ctaStyle: extracted.ctaStyle || 'soft and value-focused',
            targetAudience: extracted.targetAudience || 'Developers, Architects, and Tech Leaders',
            commonTerminology: extracted.commonTerminology || ['production-ready', 'benchmarks', 'architecture'],
            forbiddenWords: extracted.forbiddenWords || ['delve', 'tapestry'],
            coreValues: extracted.coreValues || ['Clarity', 'Accuracy']
          };

          await Setting.findOneAndUpdate(
            { key: 'global_config' },
            { brandVoice: profile },
            { upsert: true, new: true }
          );

          return profile;
        }
      } catch (aiErr) {
        console.warn('[BrandVoice] AI extraction fallback:', aiErr.message);
      }

      return DEFAULT_BRAND_VOICE;
    } catch (e) {
      console.warn(`[BrandVoice] Error extracting voice: ${e.message}`);
      return DEFAULT_BRAND_VOICE;
    }
  }
}

module.exports = new BrandVoiceService();
