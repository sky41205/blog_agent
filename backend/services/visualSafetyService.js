/**
 * Visual Safety & Content Moderation Service
 * Guarantees that every generated blog image prompt and final visual is:
 * Professional + Relevant + Clean + Non-Graphic + General-Audience Friendly.
 * 
 * Strict Standards:
 * - 0% gore, blood, graphic injuries, explicit sexual content, nudity, violence, or disturbing imagery.
 * - Non-literal interpretation of violent or sensational words in blog titles.
 * - Sensitive topics (crime, illness, accidents, death, warfare) must be represented symbolically or editorially.
 * - People are always fully clothed, dignified, and presented naturally and respectfully.
 */

class VisualSafetyService {
  constructor() {
    // Prohibited terms that must NEVER appear in image prompts
    this.prohibitedPatterns = [
      // 1. Blood & Graphic Injury
      /\b(blood|bloody|bleeding|gore|gory|mutilat\w*|wound\w*|injur\w*|bruis\w*|scars|lacerat\w*|amputat\w*)\b/gi,
      // 2. Death & Corpses
      /\b(corpse\w*|cadaver\w*|dead bod\w*|death scene|killing|murder\w*|slaughter\w*|massacre\w*|decapitat\w*|strangulat\w*|hanging|suicid\w*|fatalit\w*)\b/gi,
      // 3. Sexual & Nudity
      /\b(nude|nudity|naked|nsfw|porn\w*|erotic\w*|sexual\w*|intercourse|lingerie|underwear|undressed|cleavage|breasts?|genital\w*|bikini|sensual pose|provocative)\b/gi,
      // 4. Weapons in violent contexts
      /\b(gun pointed|shooting at|stab\w*|assault rifle|knife attack|bloodied knife|firearm pointed|execution style)\b/gi,
      // 5. Horror & Disturbing
      /\b(horror|gruesome|grotesque|nightmar\w*|monstrous|terrifying|ghoul\w*|rotting|decaying|macabre|creepy monster|disturbing scene|zombie\w*)\b/gi,
      // 6. Torture & Graphic Suffering
      /\b(tortur\w*|agony|suffering victim|screaming in pain|burning alive|choking)\b/gi,
      // 7. Violence & Physical Conflict
      /\b(violence|violent|assault\w*|abuse|fight\w*|weapon\w*|bloodshed|injury|injuries)\b/gi
    ];

    // Figurative title terms that should be converted to clean business/editorial equivalents
    this.figurativeReplacements = [
      { pattern: /\b(kill|killing|killer)\s+it\b/gi, replacement: 'achieving breakthrough success' },
      { pattern: /\bkill\s+your\b/gi, replacement: 'optimize your' },
      { pattern: /\bdeadly\s+mistakes?\b/gi, replacement: 'critical missteps to avoid' },
      { pattern: /\bdeadly\s+toll\b/gi, replacement: 'profound socioeconomic impact' },
      { pattern: /\bbattleground\b/gi, replacement: 'competitive market space' },
      { pattern: /\bslaying\b/gi, replacement: 'outperforming' },
      { pattern: /\bcrushing\s+it\b/gi, replacement: 'achieving peak performance' },
      { pattern: /\btarget\s+audience\s+hit\b/gi, replacement: 'key audience engagement' },
      { pattern: /\bexploding\b/gi, replacement: 'rapidly expanding' },
      { pattern: /\bfire\s+your\b/gi, replacement: 'transitioning away from' }
    ];

    // Universal standard negative prompt enforced on every AI image call
    this.standardNegativePrompt = [
      'gore',
      'blood',
      'graphic injuries',
      'open wounds',
      'weapons',
      'death',
      'corpses',
      'dead bodies',
      'violence',
      'fighting',
      'nudity',
      'nsfw',
      'sexual content',
      'revealing clothing',
      'cleavage',
      'provocative poses',
      'disturbing imagery',
      'scary',
      'horror',
      'grotesque',
      'macabre',
      'traumatic',
      'deformed people',
      'distorted limbs',
      'extra fingers',
      'bad anatomy',
      'plastic skin',
      'text',
      'watermarks',
      'logos',
      'sensationalism'
    ].join(', ');
  }

  /**
   * Check if a prompt or title contains prohibited graphic/explicit/violent terms
   */
  containsSensitiveContent(text = '') {
    if (!text) return false;
    // Strip negative exclusions like --no ... to avoid false positives
    const clean = text.replace(/--no\s+.*$/i, '').toLowerCase();
    for (const pattern of this.prohibitedPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(clean)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Audits any generated prompt or title and rewrites it into a clean,
   * professional, non-graphic, general-audience friendly visual concept.
   */
  auditAndRewritePrompt(rawPrompt = '', title = '', category = '') {
    let prompt = String(rawPrompt || '').trim();
    const safeTitle = String(title || '').trim();
    const safeCat = String(category || '').trim();
    const replacements = [];

    // Strip negative prompt suffix like --no ... from positive inspection
    const noClauseMatch = prompt.match(/\s+--no\s+.*$/i);
    const noClause = noClauseMatch ? noClauseMatch[0] : '';
    if (noClause) {
      prompt = prompt.replace(/\s+--no\s+.*$/i, '').trim();
    }

    // Step 1: Normalize figurative violent/destructive idioms
    for (const { pattern, replacement } of this.figurativeReplacements) {
      pattern.lastIndex = 0;
      if (pattern.test(prompt)) {
        prompt = prompt.replace(pattern, replacement);
        replacements.push(`Figurative idiom normalized: "${replacement}"`);
      }
    }

    // Step 2: Check for prohibited sensitive patterns
    let isFlagged = false;
    for (const pattern of this.prohibitedPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(prompt)) {
        isFlagged = true;
        prompt = prompt.replace(pattern, (match) => {
          replacements.push(`Removed sensitive term: "${match}"`);
          return '';
        });
      }
    }

    // Step 3: If prompt was flagged or if the title itself contains sensitive topics,
    // construct a safe, symbolic, professional editorial replacement!
    const titleSensitive = this.containsSensitiveContent(safeTitle);
    if (isFlagged || titleSensitive) {
      console.warn(`[VisualSafetyService] Rewriting sensitive visual concept for: "${safeTitle}" (Reason: flagged content detected)`);
      prompt = this.buildSymbolicEditorialConcept(safeTitle, safeCat);
      replacements.push('Transformed into symbolic editorial concept');
    }

    // Step 4: Ensure mandatory safety suffixes are appended
    const safetyGuarantees = 'clean modern editorial style, fully clothed subjects, dignified setting, professional lighting, non-graphic, general audience friendly, 16:9 aspect ratio, 8k resolution';
    if (!prompt.toLowerCase().includes('general audience')) {
      prompt = `${prompt.replace(/\s+/g, ' ').replace(/\.+$/, '')}, ${safetyGuarantees}.`;
    }

    return {
      isSafe: !isFlagged && !titleSensitive,
      rewrittenPrompt: prompt,
      originalPrompt: rawPrompt,
      replacementsMade: replacements,
      negativePrompt: this.standardNegativePrompt
    };
  }

  /**
   * Transforms sensitive topics (violence, crime, illness, accidents, death, disasters)
   * into clean, tasteful, symbolic editorial visual concepts.
   */
  buildSymbolicEditorialConcept(title = '', category = '') {
    const text = `${title} ${category}`.toLowerCase();

    // 1. Crime, Law, Justice & Investigation
    if (text.includes('crime') || text.includes('murder') || text.includes('investigat') || text.includes('homicide') || text.includes('polic') || text.includes('court') || text.includes('legal')) {
      return `A dignified editorial photograph symbolizing legal integrity and thorough investigation: modern scales of justice resting on an elegant mahogany table beside a sleek digital tablet displaying forensic data analytics, warm morning window light, clean corporate legal atmosphere, zero violence, zero weapons`;
    }

    // 2. Illness, Disease, Medical Research & Pandemics
    if (text.includes('illness') || text.includes('disease') || text.includes('cancer') || text.includes('virus') || text.includes('pandemic') || text.includes('infection') || text.includes('patient') || text.includes('hospital')) {
      return `An inspiring, compassionate editorial visual of cutting-edge biomedical innovation: dedicated scientists in clean white lab coats collaborating around an advanced molecular diagnostics interface in a sunlit modern laboratory, natural light, hope and scientific progress, non-graphic, fully clothed, professional medicine`;
    }

    // 3. Accidents, Safety & Risk Mitigation
    if (text.includes('accident') || text.includes('crash') || text.includes('disaster') || text.includes('hazard') || text.includes('injury')) {
      return `A modern conceptual graphic illustrating infrastructure safety engineering and proactive risk mitigation: clean architectural blueprints, digital telemetry sensors, and protective engineering safeguards, sleek minimalist 3D composition, non-graphic, general audience friendly`;
    }

    // 4. Conflict, War, Warfare & Geopolitics
    if (text.includes('war') || text.includes('conflict') || text.includes('battle') || text.includes('military') || text.includes('geopolitic')) {
      return `A thoughtful diplomatic editorial scene symbolizing international diplomacy and peace: international flags and an elegant negotiation table in a sunlit glass summit pavilion overlooking a calm reflecting pool at dawn, dignified atmosphere, non-violent, symbolic peace`;
    }

    // 5. Mental Health, Grief, Loss & Trauma
    if (text.includes('trauma') || text.includes('grief') || text.includes('loss') || text.includes('mental health') || text.includes('depression') || text.includes('anxiety')) {
      return `A peaceful, uplifting editorial photograph of mental resilience and hope: an authentic person seated comfortably by a bright open window looking out at a tranquil sunrise landscape, soft warm golden light, gentle warm tea cup, peaceful contemplative serenity, respectful, non-graphic`;
    }

    // 6. Poverty, Social Hardship & Winter Relief
    if (text.includes('poverty') || text.includes('hunger') || text.includes('slum') || text.includes('homeless') || text.includes('relief') || text.includes('fog')) {
      return `A heartwarming, dignified documentary photograph of community solidarity: compassionate grassroots volunteers sharing warm hand-woven blankets and warm meals with residents in soft atmospheric morning light, genuine human warmth, dignity and resilience, natural skin tones, zero suffering, respectful`;
    }

    // 7. General Universal Clean Editorial
    return `An award-winning clean editorial photograph representing the theme "${title}": thoughtful professional composition in a modern architectural setting, natural ambient lighting, rich authentic textures, fully clothed subjects, respectful, non-graphic, general audience friendly`;
  }
}

module.exports = new VisualSafetyService();
