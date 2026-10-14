/**
 * Subscription Documentation Generator Service
 * Generates comprehensive, client-tailored API documentation in JSON, Markdown, and standalone HTML
 */

const { SUBSCRIPTION_PLANS } = require('../config/subscriptionPlans');

class SubscriptionDocsService {
  /**
   * Builds complete documentation dataset for a specific subscription
   */
  generateDocsData(subscription, baseUrl = 'http://localhost:5000') {
    const planCfg = SUBSCRIPTION_PLANS[subscription.plan] || SUBSCRIPTION_PLANS.free;
    const key = subscription.key;
    const maskedKey = key.substring(0, 10) + '...' + key.slice(-4);
    const clientName = subscription.clientName;
    const websiteUrl = subscription.websiteUrl;
    const webhookSecret = subscription.webhookSecret || 'whsec_sample_secret';
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

    const quotas = {
      monthlyRequests: subscription.quotas?.monthlyRequests || planCfg.quotas.monthlyRequests,
      monthlyGenerations: subscription.quotas?.monthlyGenerations || planCfg.quotas.monthlyGenerations,
      rateLimitPerMin: subscription.quotas?.rateLimitPerMin || planCfg.quotas.rateLimitPerMin
    };

    const usage = {
      requestsUsed: subscription.usage?.requestsThisPeriod || 0,
      generationsUsed: subscription.usage?.generationsThisPeriod || 0
    };

    return {
      client: {
        id: subscription._id,
        name: clientName,
        websiteUrl: websiteUrl,
        ownerEmail: subscription.ownerEmail,
        plan: subscription.plan,
        planName: planCfg.name,
        apiKey: key,
        maskedKey,
        webhookSecret,
        webhookUrl: subscription.webhookUrl || null,
        allowedDomains: subscription.allowedDomains || [],
        customBrandVoice: subscription.customBrandVoice || 'Authoritative, engaging, industry-grade technical journalism',
        status: subscription.status,
        billingCycle: subscription.billingCycle,
        currentPeriodEnd: subscription.currentPeriodEnd,
        quotas,
        usage
      },
      baseUrl: cleanBaseUrl,
      authentication: {
        headerName: 'X-API-Key',
        sampleHeader: `X-API-Key: ${key}`,
        curlExample: `curl -H "X-API-Key: ${key}" ${cleanBaseUrl}/api/v1/account`
      },
      endpoints: [
        {
          id: 'account',
          method: 'GET',
          path: '/api/v1/account',
          title: 'Account & Quota Status',
          description: 'Verify your API authentication and retrieve live monthly quota balances (requests and generation credits).',
          params: [],
          responseExample: {
            success: true,
            client: { name: clientName, websiteUrl, apiKeyPrefix: maskedKey },
            subscription: { plan: subscription.plan, status: subscription.status },
            quotas: {
              monthlyRequestsLimit: quotas.monthlyRequests,
              requestsUsedThisMonth: usage.requestsUsed,
              monthlyGenerationsLimit: quotas.monthlyGenerations,
              generationsUsedThisMonth: usage.generationsUsed
            }
          }
        },
        {
          id: 'topics-categories',
          method: 'GET',
          path: '/api/v1/topics/categories',
          title: 'Topic Categories Taxonomy',
          description: 'List all supported topic categories (Finance, NGOs, Technology, Causes, Trends, etc.) along with their subcategories and sample search seeds.',
          params: [],
          responseExample: {
            success: true,
            totalCategories: 6,
            categories: [
              { id: 'finance', name: 'Finance & Fintech', subcategories: ['Banking & Digital Payments', 'Crypto & Web3', 'Stock Market & Algorithmic Trading', 'Personal Finance & Wealth'] },
              { id: 'ngos', name: 'NGOs & Non-Profits', subcategories: ['Philanthropy & Donors', 'Grassroots Community Action', 'Disaster Relief & Aid', 'Rural Development & Clean Water'] },
              { id: 'technology', name: 'Technology & AI', subcategories: ['Agentic AI & Multi-Agent Systems', 'Cloud Computing & DevOps', 'Cybersecurity & Zero Trust', 'Web & Mobile Dev'] },
              { id: 'causes', name: 'Causes & Social Impact', subcategories: ['Climate Action & Net-Zero', 'Environmental Protection', 'Poverty Alleviation', 'Animal Welfare', 'Women Empowerment'] }
            ]
          }
        },
        {
          id: 'topics-find',
          method: 'GET',
          path: '/api/v1/topics',
          title: 'Multi-Category Topic Finding',
          description: 'Find high-velocity trending topics scored by ML models across multiple domains including Finance, NGOs, Technology, Causes, and other trends.',
          params: [
            { name: 'category', type: 'string', required: false, default: 'All', description: 'Filter by category: Finance, NGOs, Technology, Causes, Trends, or All.' },
            { name: 'search', type: 'string', required: false, default: '', description: 'Keyword search query within topic titles and tags.' },
            { name: 'minPriority', type: 'number', required: false, default: '70', description: 'Minimum ML topic priority score (0-100).' },
            { name: 'limit', type: 'number', required: false, default: '20', description: 'Maximum number of topic candidates to return.' }
          ],
          responseExample: {
            success: true,
            count: 3,
            topics: [
              {
                title: "Decentralized Finance & Real-World Asset (RWA) Tokenization in 2026",
                category: "Finance & Fintech",
                trendScore: 92,
                topicPriorityScore: 94,
                keywords: ["defi", "rwa tokenization", "institutional crypto", "fintech"],
                reasoning: "High search momentum (+240%/hr) and low competitor saturation in corporate treasury research."
              },
              {
                title: "How Community Miyawaki Forests Combat Severe Urban Heat Islands",
                category: "Causes & Social Impact",
                trendScore: 89,
                topicPriorityScore: 91,
                keywords: ["miyawaki forest", "urban heat", "climate action", "reforestation"],
                reasoning: "Surging grassroots environmental engagement across major municipal initiatives."
              },
              {
                title: "Grassroots Hunger Eradication: Tech-Enabled Daily Food Drives for Slum Families",
                category: "NGOs & Non-Profits",
                trendScore: 86,
                topicPriorityScore: 88,
                keywords: ["hunger relief", "ngo impact", "community kitchen", "social welfare"],
                reasoning: "High civic share velocity and philanthropic donor interest."
              }
            ]
          }
        },
        {
          id: 'trends-radar',
          method: 'GET',
          path: '/api/v1/trends/radar',
          title: 'Real-Time Predictive Momentum Radar',
          description: 'Access real-time trending search velocity, viral multipliers, and organic SERP ranking capture opportunities across any vertical.',
          params: [
            { name: 'category', type: 'string', required: false, default: 'Technology & AI', description: 'Category to focus trend signals on.' },
            { name: 'region', type: 'string', required: false, default: 'GLOBAL', description: 'Country code or GLOBAL.' }
          ],
          responseExample: {
            success: true,
            category: "Finance & Fintech",
            trends: [
              {
                title: "Next-Gen Cross-Border Instant Settlement via Central Bank Digital Currencies",
                momentumScore: 94.6,
                searchVelocity: "+265%/hr",
                viralCoefficient: "2.8x",
                serpDifficulty: "Low (Instant Rank Window)"
              }
            ]
          }
        },
        {
          id: 'blogs-list',
          method: 'GET',
          path: '/api/v1/blogs',
          title: 'Headless CMS Blog Feed',
          description: 'Retrieve published, SEO-optimized articles with featured image URLs, markdown content, categories, and tags for your client website.',
          params: [
            { name: 'category', type: 'string', required: false, default: '', description: 'Filter by category (e.g. Finance, NGOs, Technology, Causes).' },
            { name: 'limit', type: 'number', required: false, default: '15', description: 'Number of articles per page (max 50).' },
            { name: 'page', type: 'number', required: false, default: '1', description: 'Pagination page number.' }
          ],
          responseExample: {
            success: true,
            meta: { total: 42, page: 1, limit: 15, totalPages: 3 },
            data: [
              {
                title: "Building Autonomous Agentic Workflows with Production Quality Gates",
                slug: "building-autonomous-agentic-workflows-quality-gates",
                category: "Technology",
                excerpt: "Deep architectural review on multi-agent collaboration...",
                featuredImage: { url: "https://images.unsplash.com/...", altText: "AI Agents Workflow" },
                publishedAt: "2026-10-09T12:00:00.000Z"
              }
            ]
          }
        },
        {
          id: 'blogs-single',
          method: 'GET',
          path: '/api/v1/blogs/:idOrSlug',
          title: 'Get Full Article by Slug or ID',
          description: 'Fetch the full markdown article body, HTML, schema.org JSON-LD markup, and verified source citations.',
          params: [
            { name: 'idOrSlug', type: 'string', required: true, description: 'Mongo ID or article URL slug.' }
          ],
          responseExample: {
            success: true,
            data: {
              title: "Autonomous Cloud AI Architecture in 2026",
              slug: "autonomous-cloud-ai-architecture-2026",
              contentMarkdown: "# Autonomous Cloud AI Architecture\n\nModern cloud systems...",
              seo: { metaTitle: "...", metaDescription: "...", primaryKeyword: "cloud ai" },
              sourceCitations: [{ title: "Google Cloud Tech Spec", url: "https://cloud.google.com" }]
            }
          }
        },
        {
          id: 'blogs-generate',
          method: 'POST',
          path: '/api/v1/blogs/generate',
          title: 'Trigger Autonomous AI Article Generation',
          description: 'Generate a complete, fact-verified, grounded 900+ word article with photoreal Hasselblad visuals and schema SEO markup on any topic in seconds.',
          params: [],
          bodyExample: {
            topic: "The Rise of Micro-Donation Crowdfunding in Indian Slum Education",
            category: "NGOs",
            targetWordCount: 1000,
            autoPublish: true
          },
          responseExample: {
            success: true,
            message: "Article generated successfully for " + clientName + "!",
            article: {
              id: "68c92a...",
              title: "The Rise of Micro-Donation Crowdfunding in Indian Slum Education",
              slug: "rise-of-micro-donation-crowdfunding-slum-education",
              category: "NGOs",
              status: "PUBLISHED"
            },
            subscriptionQuota: { generationsRemaining: Math.max(0, quotas.monthlyGenerations - usage.generationsUsed - 1) }
          }
        },
        {
          id: 'fact-audit',
          method: 'POST',
          path: '/api/v1/tools/fact-audit',
          title: 'Vertex AI Live Fact-Auditor API',
          description: 'Verify claims, statistics, and assertions in any text against live Google Search Grounding.',
          params: [],
          bodyExample: {
            title: "Global Renewable Capacity",
            content: "In 2026, global solar installations surpassed 600 GW worldwide."
          },
          responseExample: {
            success: true,
            isGrounded: true,
            credibilityScore: 98,
            verifiedSources: [{ title: "International Energy Agency Report", url: "https://iea.org" }]
          }
        }
      ],
      codeSnippets: {
        curl: `# 1. Verify your credentials & check quota
curl -X GET "${cleanBaseUrl}/api/v1/account" \\
  -H "X-API-Key: ${key}"

# 2. Discover trending topics in Finance or NGOs
curl -X GET "${cleanBaseUrl}/api/v1/topics?category=Finance&limit=5" \\
  -H "X-API-Key: ${key}"

# 3. Fetch published articles for your website
curl -X GET "${cleanBaseUrl}/api/v1/blogs?limit=10" \\
  -H "X-API-Key: ${key}"

# 4. Generate a new article on demand
curl -X POST "${cleanBaseUrl}/api/v1/blogs/generate" \\
  -H "X-API-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "topic": "Sustainable Microfinance and Women SHGs in Rural Banking",
    "category": "Finance",
    "targetWordCount": 900
  }'`,

        nodejs: `// Modern Node.js / JavaScript (Fetch or Axios)
const BLOGGER_API_URL = '${cleanBaseUrl}';
const API_KEY = '${key}';

async function bloggerClient(endpoint, options = {}) {
  const url = \`\${BLOGGER_API_URL}\${endpoint}\`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || \`HTTP error \${response.status}\`);
  }
  return response.json();
}

// Example: Fetch Finance & NGO topics
async function getTrendingTopics() {
  const data = await bloggerClient('/api/v1/topics?category=Finance&minPriority=80');
  console.log('Top Finance Topics:', data.topics);
}

// Example: Generate an article autonomously
async function generateArticle(topicName, category) {
  const result = await bloggerClient('/api/v1/blogs/generate', {
    method: 'POST',
    body: JSON.stringify({
      topic: topicName,
      category: category,
      targetWordCount: 950,
      autoPublish: true,
    }),
  });
  console.log('Published Article:', result.article.title, result.article.slug);
}

getTrendingTopics();`,

        python: `import requests
import json

BASE_URL = "${cleanBaseUrl}"
API_KEY = "${key}"

class AutonomousBloggerClient:
    def __init__(self, base_url=BASE_URL, api_key=API_KEY):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        })

    def get_account_status(self):
        """Check active quotas and subscription details."""
        res = self.session.get(f"{self.base_url}/api/v1/account")
        res.raise_for_status()
        return res.json()

    def find_topics(self, category="Finance", min_priority=75):
        """Find trending topics across Finance, NGOs, Technology, Causes, etc."""
        res = self.session.get(
            f"{self.base_url}/api/v1/topics",
            params={"category": category, "minPriority": min_priority}
        )
        res.raise_for_status()
        return res.json().get("topics", [])

    def fetch_articles(self, category=None, limit=10):
        """Retrieve published headless blog posts for your website."""
        params = {"limit": limit}
        if category:
            params["category"] = category
        res = self.session.get(f"{self.base_url}/api/v1/blogs", params=params)
        res.raise_for_status()
        return res.json().get("data", [])

    def generate_blog(self, topic: str, category: str = "Technology", word_count: int = 900):
        """Trigger autonomous AI article generation with live search grounding."""
        payload = {
            "topic": topic,
            "category": category,
            "targetWordCount": word_count,
            "autoPublish": True
        }
        res = self.session.post(f"{self.base_url}/api/v1/blogs/generate", json=payload)
        res.raise_for_status()
        return res.json()

# Usage Example:
if __name__ == "__main__":
    client = AutonomousBloggerClient()
    print("Checking Account Status:", client.get_account_status()["subscription"])
    ngo_topics = client.find_topics(category="NGOs")
    for t in ngo_topics[:3]:
        print(f"[{t['category']}] {t['title']} (Score: {t['topicPriorityScore']})")`,

        php: `<?php
/**
 * Autonomous Blogger API Client for PHP / WordPress
 */
class BloggerClient {
    private $baseUrl = '${cleanBaseUrl}';
    private $apiKey  = '${key}';

    public function request($endpoint, $method = 'GET', $data = null) {
        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $headers = [
            'X-API-Key: ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("API request failed with code: " . $httpCode . " Body: " . $response);
        }
        return json_decode($response, true);
    }

    public function getTopics($category = 'Finance') {
        return $this->request('/api/v1/topics?category=' . urlencode($category));
    }

    public function getLatestBlogs($limit = 10) {
        return $this->request('/api/v1/blogs?limit=' . intval($limit));
    }
}

// Quick Test:
$blogger = new BloggerClient();
$financeTopics = $blogger->getTopics('Finance');
print_r($financeTopics);
?>`,

        react: `// Custom React / Next.js Hook: useBloggerContent.ts
import { useState, useEffect } from 'react';

const API_BASE = '${cleanBaseUrl}';
const API_KEY = '${key}';

export function useBloggerContent(category = 'All') {
  const [blogs, setBlogs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const headers = { 'X-API-Key': API_KEY };
        
        // Parallel fetch of latest blogs and topic recommendations
        const [blogRes, topicRes] = await Promise.all([
          fetch(\`\${API_BASE}/api/v1/blogs?limit=6\${category !== 'All' ? '&category=' + category : ''}\`, { headers }),
          fetch(\`\${API_BASE}/api/v1/topics?category=\${category}&limit=5\`, { headers })
        ]);

        const blogData = await blogRes.json();
        const topicData = await topicRes.json();

        if (blogData.success) setBlogs(blogData.data || []);
        if (topicData.success) setTopics(topicData.topics || []);
      } catch (err) {
        console.error('Failed to load Blogger content:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [category]);

  return { blogs, topics, loading };
}`
      },
      webhooks: {
        description: 'Configure a webhook URL to receive instant push events whenever new articles are published or updated.',
        signatureHeader: 'X-Blogger-Signature',
        secret: webhookSecret,
        verificationExampleNode: `const crypto = require('crypto');

function verifyBloggerWebhook(reqBodyRaw, receivedSignature, secret = '${webhookSecret}') {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(reqBodyRaw)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature));
}`
      },
      widgetEmbed: {
        snippet: `<!-- Autonomous Blogger Dynamic Feed Widget -->
<div id="blogger-article-feed" data-category="All" data-theme="dark"></div>
<script 
  src="${cleanBaseUrl}/live-widget.js" 
  data-key="${key}" 
  data-container="#blogger-article-feed" 
  defer>
</script>`
      }
    };
  }

  /**
   * Generates clean, comprehensive Markdown file
   */
  generateMarkdown(docsData) {
    const { client, baseUrl, authentication, endpoints, codeSnippets, webhooks, widgetEmbed } = docsData;

    return `# 📘 Autonomous Blogger API Documentation & Integration Kit
> **Client:** ${client.name} | **Website:** ${client.websiteUrl}  
> **Subscription Tier:** ${client.planName} (${client.plan.toUpperCase()}) | **Status:** ${client.status.toUpperCase()}  
> **API Key:** \`${client.apiKey}\`  
> **Webhook Secret:** \`${client.webhookSecret}\`  
> **Base URL:** \`${baseUrl}\`  

---

## 🚀 1. Quickstart & Authentication
All API requests must include your secure API key in the HTTP request headers:

\`\`\`http
X-API-Key: ${client.apiKey}
Content-Type: application/json
\`\`\`

### Verify Connection via cURL
\`\`\`bash
${authentication.curlExample}
\`\`\`

---

## 📊 2. Active Subscription Limits & Quotas
- **Monthly Requests:** \`${client.quotas.monthlyRequests.toLocaleString()}\` requests/month (Used: \`${client.usage.requestsUsed.toLocaleString()}\`)
- **Monthly AI Generations:** \`${client.quotas.monthlyGenerations.toLocaleString()}\` articles/month (Used: \`${client.usage.generationsUsed.toLocaleString()}\`)
- **Rate Limit:** \`${client.quotas.rateLimitPerMin}\` requests/minute
- **Billing Cycle:** \`${client.billingCycle}\` (Valid until: \`${new Date(client.currentPeriodEnd).toLocaleDateString()}\`)
- **Custom Brand Voice:** *${client.customBrandVoice}*

---

## 🔍 3. Multi-Category Topic Finding
Discover viral, high-velocity topics scored by ML models across all key sectors:
- **Finance & Fintech**: Banking, Digital Payments (UPI/FedNow), Crypto/Web3, Stock Trading, Personal Wealth, Macroeconomics.
- **NGOs & Non-Profits**: Philanthropy, Grassroots Community Support, Disaster Relief, Rural Clean Water, CSR Impact.
- **Technology & AI**: Agentic Multi-Agent Workflows, Cloud Computing, Cybersecurity, Web & Mobile Dev.
- **Causes & Social Impact**: Climate Action, Miyawaki Urban Forests, Poverty Alleviation, Animal Rescue, Women Empowerment.
- **Trends in All Aspects**: Healthcare & Biotech, Modern Business, E-Commerce, Creator Media, Space Science.

### Query Topics Endpoint
\`\`\`http
GET /api/v1/topics?category=Finance&minPriority=75&limit=10
GET /api/v1/topics?category=NGOs&limit=10
GET /api/v1/topics?category=Causes&limit=10
GET /api/v1/topics?category=Technology&limit=10
GET /api/v1/topics/categories
\`\`\`

---

## 🛠️ 4. Code Examples

### cURL
\`\`\`bash
${codeSnippets.curl}
\`\`\`

### Node.js / JavaScript
\`\`\`javascript
${codeSnippets.nodejs}
\`\`\`

### Python
\`\`\`python
${codeSnippets.python}
\`\`\`

### PHP / WordPress
\`\`\`php
${codeSnippets.php}
\`\`\`

### React / Next.js Hook
\`\`\`typescript
${codeSnippets.react}
\`\`\`

---

## 📡 5. Complete Endpoints Reference

${endpoints.map(ep => `
### \`${ep.method}\` ${ep.path}
**${ep.title}**  
${ep.description}

${ep.params.length > 0 ? `
#### Parameters:
| Name | Type | Required | Default | Description |
|---|---|---|---|---|
${ep.params.map(p => `| \`${p.name}\` | \`${p.type}\` | ${p.required ? '**Yes**' : 'No'} | \`${p.default || '-'}\` | ${p.description} |`).join('\n')}
` : ''}

${ep.bodyExample ? `
#### Request Body:
\`\`\`json
${JSON.stringify(ep.bodyExample, null, 2)}
\`\`\`
` : ''}

#### Example Response:
\`\`\`json
${JSON.stringify(ep.responseExample, null, 2)}
\`\`\`
`).join('\n---\n')}

---

## ⚡ 6. Webhooks & Real-Time Push Notifications
Whenever a new article is autonomously generated or published, a push notification is sent to your webhook URL.

- **Header:** \`${webhooks.signatureHeader}\`
- **Secret:** \`${webhooks.secret}\`

### Node.js Signature Verification
\`\`\`javascript
${webhooks.verificationExampleNode}
\`\`\`

---

## 🌐 7. 1-Line Embeddable Widget
To render live published articles directly on ${client.websiteUrl} without writing backend code, embed this snippet:

\`\`\`html
${widgetEmbed.snippet}
\`\`\`

---
*Generated by Autonomous Blogger Platform for ${client.name} on ${new Date().toUTCString()}*
`;
  }

  /**
   * Generates a sleek, printable standalone HTML documentation page
   */
  generateHtml(docsData) {
    const { client, baseUrl, authentication, endpoints, codeSnippets, webhooks, widgetEmbed } = docsData;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation - ${escapeHtml(client.name)}</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --card-border: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --primary: #6366f1;
      --primary-light: #818cf8;
      --success: #10b981;
      --code-bg: #020617;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
      border: 1px solid #312e81;
      border-radius: 16px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-primary { background: #4f46e5; color: #fff; }
    .badge-success { background: #065f46; color: #34d399; }
    h1 { font-size: 2rem; font-weight: 800; margin: 0.75rem 0 0.5rem; color: #fff; }
    h2 { font-size: 1.4rem; font-weight: 700; margin: 2rem 0 1rem; border-bottom: 1px solid var(--card-border); padding-bottom: 0.5rem; color: #fff; }
    h3 { font-size: 1.1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--primary-light); }
    p { color: var(--text-muted); margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .card-title { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
    .card-val { font-size: 1.3rem; font-weight: 800; color: #fff; margin-top: 0.25rem; }
    .key-box {
      background: var(--code-bg);
      border: 1px solid #334155;
      padding: 0.85rem 1.25rem;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.95rem;
      color: #38bdf8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      word-break: break-all;
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--card-border);
      padding: 1.25rem;
      border-radius: 10px;
      overflow-x: auto;
      font-family: "JetBrains Mono", Consolas, monospace;
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-bottom: 1.5rem;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--card-border); }
    th { background: #1e293b; color: #f8fafc; font-weight: 600; }
    td { color: var(--text-muted); }
    .method {
      display: inline-block;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 800;
      margin-right: 0.5rem;
    }
    .method-get { background: #065f46; color: #34d399; }
    .method-post { background: #1e3a8a; color: #60a5fa; }
    .btn-action {
      background: #4f46e5;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      margin-right: 0.5rem;
    }
    .btn-action:hover { background: #4338ca; }
    @media print {
      body { background: #fff; color: #000; }
      .header, .card, pre, th, td { border-color: #ddd; background: #fafafa; color: #000; }
      .btn-action { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="badge badge-primary">${escapeHtml(client.planName)} Plan</span>
          <span class="badge badge-success">${escapeHtml(client.status.toUpperCase())}</span>
        </div>
        <button class="btn-action" onclick="window.print()">🖨️ Print / Save PDF</button>
      </div>
      <h1>API Integration Guide for ${escapeHtml(client.name)}</h1>
      <p>Target Website: <strong>${escapeHtml(client.websiteUrl)}</strong> • Contact: <strong>${escapeHtml(client.ownerEmail)}</strong></p>
      
      <div style="margin-top: 1.5rem;">
        <div class="card-title" style="margin-bottom:0.4rem;">Your Dedicated API Key</div>
        <div class="key-box">
          <span>${escapeHtml(client.apiKey)}</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Monthly Requests Quota</div>
        <div class="card-val">${client.quotas.monthlyRequests.toLocaleString()}</div>
        <p style="margin:0.25rem 0 0; font-size:0.75rem;">Used: ${client.usage.requestsUsed.toLocaleString()}</p>
      </div>
      <div class="card">
        <div class="card-title">AI Article Generations</div>
        <div class="card-val" style="color:#a855f7;">${client.quotas.monthlyGenerations.toLocaleString()}</div>
        <p style="margin:0.25rem 0 0; font-size:0.75rem;">Used: ${client.usage.generationsUsed.toLocaleString()}</p>
      </div>
      <div class="card">
        <div class="card-title">Speed Rate Limit</div>
        <div class="card-val">${client.quotas.rateLimitPerMin} <span style="font-size:0.8rem; font-weight:normal;">req/min</span></div>
      </div>
      <div class="card">
        <div class="card-title">Base Server URL</div>
        <div class="card-val" style="font-size:1rem; color:#38bdf8;">${escapeHtml(baseUrl)}</div>
      </div>
    </div>

    <h2>1. Authentication</h2>
    <p>Pass your API key in the <code>X-API-Key</code> request header with every call:</p>
    <pre><code>curl -H "X-API-Key: ${escapeHtml(client.apiKey)}" ${escapeHtml(baseUrl)}/api/v1/account</code></pre>

    <h2>2. Multi-Category Topic Finding</h2>
    <p>Find trending topics and viral search momentum across <strong>Finance</strong>, <strong>NGOs</strong>, <strong>Technology</strong>, <strong>Causes</strong>, and <strong>Global Trends</strong>:</p>
    <pre><code># Query Finance topics
curl -H "X-API-Key: ${escapeHtml(client.apiKey)}" "${escapeHtml(baseUrl)}/api/v1/topics?category=Finance&limit=10"

# Query NGO & Humanitarian topics
curl -H "X-API-Key: ${escapeHtml(client.apiKey)}" "${escapeHtml(baseUrl)}/api/v1/topics?category=NGOs&limit=10"

# Query Social Causes & Climate Action
curl -H "X-API-Key: ${escapeHtml(client.apiKey)}" "${escapeHtml(baseUrl)}/api/v1/topics?category=Causes&limit=10"

# Query Technology & AI topics
curl -H "X-API-Key: ${escapeHtml(client.apiKey)}" "${escapeHtml(baseUrl)}/api/v1/topics?category=Technology&limit=10"</code></pre>

    <h2>3. Code Quickstart</h2>
    <h3>Node.js / JavaScript Example</h3>
    <pre><code>${escapeHtml(codeSnippets.nodejs)}</code></pre>

    <h3>Python Example</h3>
    <pre><code>${escapeHtml(codeSnippets.python)}</code></pre>

    <h2>4. Core Endpoints Reference</h2>
    ${endpoints.map(ep => `
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex; align-items:center; margin-bottom:0.5rem;">
          <span class="method method-${ep.method.toLowerCase()}">${ep.method}</span>
          <code style="font-size:1rem; font-weight:700; color:#fff;">${ep.path}</code>
        </div>
        <p style="margin-bottom:0.75rem;"><strong>${escapeHtml(ep.title)}:</strong> ${escapeHtml(ep.description)}</p>
        ${ep.params.length > 0 ? `
          <table>
            <thead><tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              ${ep.params.map(p => `<tr><td><code>${p.name}</code></td><td>${p.type}</td><td>${p.required ? 'Yes' : 'No'}</td><td>${p.description}</td></tr>`).join('')}
            </tbody>
          </table>
        ` : ''}
        <div class="card-title">Sample Response:</div>
        <pre><code>${escapeHtml(JSON.stringify(ep.responseExample, null, 2))}</code></pre>
      </div>
    `).join('')}

    <h2>5. Webhooks & Real-Time Push</h2>
    <p>Articles generated or published autonomously are delivered directly to your endpoint with HMAC-SHA256 signature verification:</p>
    <div class="card">
      <p>Webhook Secret: <code>${escapeHtml(webhooks.secret)}</code></p>
      <div class="card-title">Node.js Signature Check:</div>
      <pre><code>${escapeHtml(webhooks.verificationExampleNode)}</code></pre>
    </div>

    <h2>6. Embeddable Widget Snippet</h2>
    <p>Embed live published content into your website with a single HTML tag:</p>
    <pre><code>${escapeHtml(widgetEmbed.snippet)}</code></pre>

    <div style="text-align:center; padding: 2rem 0; color: var(--text-muted); font-size:0.8rem;">
      Autonomous Blogger Documentation Engine • Generated for ${escapeHtml(client.name)} • ${new Date().toUTCString()}
    </div>
  </div>
</body>
</html>`;
  }
}

function escapeHtml(str = '') {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = new SubscriptionDocsService();
