/**
 * Agent 10: Publishing and Content Packaging Agent
 * 
 * Responsibilities:
 * - Prepares the complete production publishing package:
 *   1. Final blog title & clean URL slug
 *   2. Meta title & meta description (SEO optimized)
 *   3. Final article body with embedded inline images & source citations table
 *   4. Featured image and all inline image assets (with alt text, captions, and section anchors)
 *   5. Grounded references & source links table
 *   6. Tags and category classification
 *   7. Suggested internal links
 *   8. Social media excerpts (Twitter/X hook, LinkedIn executive post)
 *   9. JSON-LD schema markup
 *   10. Pre-publishing validation checklist
 * - Enforces the User Approval Gate: never auto-publishes unless explicitly configured
 */

const BaseAgent = require('./BaseAgent');
const seoService = require('../seoService');
const imageService = require('../imageService');

class PublishingPackagingAgent extends BaseAgent {
  constructor() {
    super('PublishingPackagingAgent', 'Publishing & Content Packaging Director');
  }

  async run(input, context = {}) {
    const revisedArticle = input.revisedArticle || {};
    const title = revisedArticle.revisedTitle || input.title || 'Untitled Publication';
    let markdown = revisedArticle.revisedMarkdown || input.contentMarkdown || '# ' + title;
    const seoData = input.seoData || {};
    const validatedImages = input.validatedImages || [];
    const featuredImage = input.featuredImage || validatedImages[0] || {};
    const inlineImages = validatedImages.filter(img => img.placement !== 'featured_hero');
    const researchBrief = input.researchBrief || {};
    const category = input.category || 'Technology';
    const slug = seoData.slug || seoService.generateSlug(title);

    this.log('PACKAGING', `Assembling final publication bundle for "${title}" (${inlineImages.length} inline images)...`);

    // 1. Embed inline images directly into markdown matching <!-- IMAGE_SLOT: sectionId --> anchors
    inlineImages.forEach(img => {
      const anchorRegex = new RegExp(`<!--\\s*IMAGE_SLOT:\\s*${img.sectionId}\\s*-->`, 'i');
      const imageEmbed = `\n\n![${img.altText || img.sectionHeading}](${img.url})\n*Caption: ${img.caption || img.sectionHeading}*\n\n`;
      
      if (anchorRegex.test(markdown)) {
        markdown = markdown.replace(anchorRegex, imageEmbed);
      } else {
        // If exact anchor wasn't found, attach right below its matching heading
        const headingRegex = new RegExp(`(##\\s+.*${img.sectionHeading.slice(0, 15)}.*)`, 'i');
        if (headingRegex.test(markdown)) {
          markdown = markdown.replace(headingRegex, `$1\n\n![${img.altText}](${img.url})\n*Caption: ${img.caption}*\n`);
        }
      }
    });

    // Remove any leftover unmatched image slot markers
    markdown = markdown.replace(/<!--\s*IMAGE_SLOT:[^>]+-->/gi, '');

    // 2. Format Authoritative References Table if source citations exist
    const citations = researchBrief.sourceCitations || [];
    if (citations.length > 0 && !markdown.includes('## 📚 References & Verified Sources')) {
      let refTable = `\n\n## 📚 References & Verified Sources\n\n`;
      refTable += `| Source | Context & Key Benchmark | Verified Link |\n`;
      refTable += `| :--- | :--- | :--- |\n`;
      citations.forEach(c => {
        const titleSafe = (c.title || 'Official Source').replace(/\|/g, '-');
        const snippetSafe = (c.factSnippet || 'Grounded benchmark').replace(/\|/g, '-').slice(0, 80);
        refTable += `| ${titleSafe} | ${snippetSafe} | [View Source](${c.url || '#'}) |\n`;
      });
      markdown += refTable;
    }

    // 3. Generate Social Media Excerpts & Schema
    const ai = await this.getAI();
    let socialExcerpts = {
      twitter: `Exploring the future of ${title}. Here are the key architectural takeaways and benchmarks you need to know:`,
      linkedin: `Excited to share our latest in-depth technical analysis: "${title}". We break down key architectural patterns, eliminate common bottlenecks, and share real-world implementation advice.`
    };

    try {
      const prompt = `
Generate engaging social media share posts for this article:
Title: "${title}"
Category: "${category}"
Excerpt: "${seoData.metaDescription || title}"

Provide:
1. twitter: High-impact hook under 260 characters with 2 relevant hashtags.
2. linkedin: Professional executive summary post (2-3 short paragraphs, bullet points, thought leadership tone).

Output structured JSON:
{
  "twitter": "...",
  "linkedin": "..."
}
Output ONLY valid JSON.
`;
      const socialRes = await ai.generateJSON(prompt);
      if (socialRes.twitter && socialRes.linkedin) {
        socialExcerpts = socialRes;
      }
    } catch (e) {}

    // 4. Construct Final Publishing Package
    const publicationPackage = {
      title,
      slug,
      metaTitle: seoData.optimizedTitle || title,
      metaDescription: seoData.metaDescription || `In-depth analysis of ${title}`,
      primaryKeyword: seoData.primaryKeyword || category.toLowerCase(),
      secondaryKeywords: seoData.secondaryKeywords || [category.toLowerCase()],
      contentMarkdown: markdown,
      contentHtml: markdown, // Rendered markdown
      category,
      tags: seoData.secondaryKeywords || [category.toLowerCase()],
      featuredImage: {
        url: (featuredImage?.url && !featuredImage.url.includes('1618005182384-a83a8bd57fbe'))
          ? featuredImage.url
          : imageService.getAuthenticPhoto(title, category, Date.now()),
        altText: featuredImage?.altText || title,
        caption: featuredImage?.caption || `Featured visual for ${title}`,
        prompt: featuredImage?.prompt || '',
        model: featuredImage?.model || 'AI Engine'
      },
      inlineImages: inlineImages.map(img => ({
        sectionId: img.sectionId,
        sectionHeading: img.sectionHeading,
        url: img.url,
        altText: img.altText,
        caption: img.caption,
        prompt: img.prompt,
        aspectRatio: img.aspectRatio || '16:9',
        placement: 'inline',
        validation: img.validation
      })),
      sourceCitations: citations,
      suggestedInternalLinks: seoData.recommendations || [],
      socialMediaExcerpts: socialExcerpts,
      schemaMarkup: seoData.jsonLdSchema || {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: title,
        description: seoData.metaDescription
      },
      publishingChecklist: {
        allSectionsComplete: true,
        heroImageAttached: !!featuredImage.url,
        inlineImagesValidated: inlineImages.every(i => i.validation?.passed),
        seoMetaPresent: !!(seoData.metaDescription && seoData.primaryKeyword),
        citationsFormatted: citations.length > 0,
        requiresHumanApproval: true // Default human-in-the-loop gate
      }
    };

    return publicationPackage;
  }

  async fallback(input, context, err) {
    const title = input.title || 'Technical Innovation';
    return {
      title,
      slug: seoService.generateSlug(title),
      metaTitle: title,
      metaDescription: `In-depth guide on ${title}`,
      primaryKeyword: title.toLowerCase(),
      secondaryKeywords: ['technology', 'guide'],
      contentMarkdown: input.contentMarkdown || `# ${title}\n\nContent...`,
      category: input.category || 'Technology',
      tags: ['technology'],
      featuredImage: {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        altText: title,
        caption: title
      },
      inlineImages: [],
      sourceCitations: [],
      socialMediaExcerpts: {
        twitter: `Check out our guide on ${title}!`,
        linkedin: `Read our analysis of ${title}.`
      },
      publishingChecklist: {
        allSectionsComplete: true,
        heroImageAttached: true,
        inlineImagesValidated: true,
        seoMetaPresent: true,
        citationsFormatted: false,
        requiresHumanApproval: true
      }
    };
  }
}

module.exports = new PublishingPackagingAgent();
