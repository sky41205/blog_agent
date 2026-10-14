/**
 * SEO Optimization and Schema Generation Service
 */

class SEOService {
  generateSlug(title) {
    if (!title) return 'untitled-blog';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  generateSchemaMarkup(blog, websiteUrl = 'https://example.com') {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${websiteUrl}/blog/${blog.slug}`
      },
      "headline": blog.seo?.metaTitle || blog.title,
      "description": blog.seo?.metaDescription || blog.excerpt,
      "image": blog.featuredImage?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      "author": {
        "@type": "Person",
        "name": blog.author || "AI Autonomous Content Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Autonomous Blogger Platform",
        "logo": {
          "@type": "ImageObject",
          "url": `${websiteUrl}/logo.png`
        }
      },
      "datePublished": blog.publishedAt ? new Date(blog.publishedAt).toISOString() : new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "articleBody": blog.contentMarkdown ? blog.contentMarkdown.substring(0, 500) : ''
    };
  }

  calculateSEOScore(title, content, primaryKeyword, metaDescription) {
    let score = 100;
    const issues = [];
    const lowerContent = (content || '').toLowerCase();
    const lowerTitle = (title || '').toLowerCase();
    const cleanKw = (primaryKeyword || '').toLowerCase().trim();

    // Title length check (ideal 45-65 chars)
    if (title.length < 35) {
      score -= 10;
      issues.push('Title is short (<35 chars). Aim for 45-65 chars.');
    } else if (title.length > 75) {
      score -= 8;
      issues.push('Title is long (>75 chars). Search engines may truncate it.');
    }

    // Primary keyword in title
    if (cleanKw && !lowerTitle.includes(cleanKw)) {
      score -= 15;
      issues.push(`Primary keyword '${cleanKw}' is missing from the title.`);
    }

    // Meta description check
    if (!metaDescription || metaDescription.length < 100) {
      score -= 12;
      issues.push('Meta description is too short (ideal 140-160 characters).');
    } else if (metaDescription.length > 175) {
      score -= 8;
      issues.push('Meta description is too long (>175 characters).');
    }

    // Heading presence
    const h2Count = (content.match(/^##\s+/gm) || []).length;
    if (h2Count < 3) {
      score -= 15;
      issues.push(`Found only ${h2Count} H2 headings. Recommended: at least 3-5 major sections.`);
    }

    // FAQ section check
    if (!content.includes('## Frequently Asked Questions') && !content.includes('## FAQ')) {
      score -= 8;
      issues.push('Missing FAQ section for Google Rich Snippets.');
    }

    const finalScore = Math.max(30, Math.min(99, score));

    return {
      seoScore: finalScore,
      issues,
      breakdown: {
        titleOptimization: cleanKw && lowerTitle.includes(cleanKw) ? 95 : 70,
        metaDescriptionQuality: metaDescription && metaDescription.length >= 120 ? 92 : 65,
        headingStructure: h2Count >= 3 ? 90 : 60,
        keywordCoverage: cleanKw && lowerContent.includes(cleanKw) ? 92 : 60,
        schemaMarkupReady: 100
      }
    };
  }
}

module.exports = new SEOService();
