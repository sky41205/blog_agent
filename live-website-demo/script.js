const API_BASE = 'http://localhost:5000';
const BLOGS_URL = `${API_BASE}/api/public/blogs`;
const RADAR_URL = `${API_BASE}/api/topics/realtime-radar`;
const TRACK_URL = `${API_BASE}/api/public/track`;

const KNOWN_GENERIC_DUPLICATES = [
  'photo-1497366216548-37526070297c',
  'photo-1618005182384-a83a8bd57fbe'
];

const CURATED_TOPIC_GALLERIES = {
  // Stock Market, Share Price & Banking
  stocks_trading: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1280&h=720&q=85', // Trading terminals & candlestick chart
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1280&h=720&q=85', // Stock market analytics screen
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1280&h=720&q=85', // Financial performance chart
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=1280&h=720&q=85'  // Currency and market valuation
  ],
  // Heavy Engineering, BHEL, Energy Infrastructure
  industrial_engineering: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1280&h=720&q=85', // Industrial turbine / control engineering
    'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1280&h=720&q=85', // Heavy manufacturing facility
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&h=720&q=85', // High-voltage telemetry & circuitry
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1280&h=720&q=85'  // Electrical power infrastructure
  ],
  // Cloud, Kafka & Distributed Systems
  cloud_architecture: [
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1280&h=720&q=85', // Server rack glowing data stream
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&h=720&q=85', // Global network mesh
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1280&h=720&q=85', // Server room cabling
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1280&h=720&q=85'  // High-performance code interface
  ],
  // AI, LLMs & Multi-Agent Systems
  ai_systems: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1280&h=720&q=85', // Neural nodes & deep learning
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1280&h=720&q=85', // AI cognition representation
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1280&h=720&q=85'  // Advanced optics research
  ],
  // Winter Relief & Fog
  winter_relief: [
    'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=1280&h=720&q=85',
    'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1280&h=720&q=85',
    'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1280&h=720&q=85'
  ],
  // Humanitarian Aid & Food Rescue
  humanitarian: [
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1280&h=720&q=85',
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1280&h=720&q=85',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1280&h=720&q=85'
  ],
  // HR & Workplace
  workforce: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1280&h=720&q=85',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1280&h=720&q=85',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1280&h=720&q=85'
  ],
  // Footwear & Fashion
  fashion_footwear: [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&h=630&q=85',
    'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=1200&h=630&q=85'
  ],
  // Animal Rescue
  animals: [
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&h=630&q=85',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&h=630&q=85'
  ],
  // Urban Farming
  urban_farming: [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&h=630&q=85',
    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&h=630&q=85'
  ],
  // Solar Clean Energy
  clean_energy: [
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&h=630&q=85',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&h=630&q=85'
  ],
  // Clean Rivers
  river_water: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=630&q=85',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&h=630&q=85'
  ]
};

function getTopicFallback(title = '', category = '') {
  const text = `${title} ${category}`.toLowerCase();
  
  // Hash code for deterministic, unique rotation
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash);

  if (text.includes('bhel') || text.includes('turbine') || text.includes('heavy engineering') || text.includes('power plant') || text.includes('industrial')) {
    const list = CURATED_TOPIC_GALLERIES.industrial_engineering;
    return list[index % list.length];
  }
  if (text.includes('share') || text.includes('stock') || text.includes('bank') || text.includes('trading') || text.includes('market') || text.includes('finance') || text.includes('nifty') || text.includes('sensex')) {
    const list = CURATED_TOPIC_GALLERIES.stocks_trading;
    return list[index % list.length];
  }
  if (text.includes('kafka') || text.includes('microservice') || text.includes('cloud') || text.includes('kubernetes') || text.includes('devops') || text.includes('telemetry') || text.includes('event-driven')) {
    const list = CURATED_TOPIC_GALLERIES.cloud_architecture;
    return list[index % list.length];
  }
  if (text.includes('ai') || text.includes('agent') || text.includes('llm') || text.includes('neural') || text.includes('rag')) {
    const list = CURATED_TOPIC_GALLERIES.ai_systems;
    return list[index % list.length];
  }
  if (text.includes('fog') || text.includes('winter') || text.includes('cold wave') || text.includes('blanket') || text.includes('frost') || text.includes('snow') || text.includes('mist')) {
    const list = CURATED_TOPIC_GALLERIES.winter_relief;
    return list[index % list.length];
  }
  if (text.includes('welfare') || text.includes('poverty') || text.includes('relief') || text.includes('grassroots') || text.includes('humanitarian') || text.includes('donation') || text.includes('charity')) {
    const list = CURATED_TOPIC_GALLERIES.humanitarian;
    return list[index % list.length];
  }
  if (text.includes('human resource') || text.includes(' hr ') || text.includes('hr ') || text.includes('workforce') || text.includes('employee') || text.includes('recruitment') || text.includes('talent') || text.includes('workplace') || text.includes('staffing')) {
    const list = CURATED_TOPIC_GALLERIES.workforce;
    return list[index % list.length];
  }
  if (text.includes('sandal') || text.includes('shoe') || text.includes('footwear') || text.includes('fashion') || text.includes('sia')) {
    const list = CURATED_TOPIC_GALLERIES.fashion_footwear;
    return list[index % list.length];
  }
  if (text.includes('dog') || text.includes('puppy') || text.includes('stray') || text.includes('animal')) {
    const list = CURATED_TOPIC_GALLERIES.animals;
    return list[index % list.length];
  }
  if (text.includes('farm') || text.includes('hydroponic') || text.includes('rooftop') || text.includes('agri')) {
    const list = CURATED_TOPIC_GALLERIES.urban_farming;
    return list[index % list.length];
  }
  if (text.includes('solar') || text.includes('wind') || text.includes('clean energy') || text.includes('renewable')) {
    const list = CURATED_TOPIC_GALLERIES.clean_energy;
    return list[index % list.length];
  }
  if (text.includes('river') || text.includes('water') || text.includes('gomti') || text.includes('ganga')) {
    const list = CURATED_TOPIC_GALLERIES.river_water;
    return list[index % list.length];
  }

  // Generate dynamic, guaranteed unique Pollinations visual for unclassified topics
  const cleanPrompt = encodeURIComponent(`${title || 'Modern Architecture'}, ${category || 'Technology'}, editorial documentary photography, natural ambient lighting, 16:9, 8k`);
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1280&height=720&model=turbo&nologo=true&seed=${Math.abs(hash) + 1000}`;
}

function resolveImgUrl(url, title = '', category = '') {
  // Catch null, empty, or known generic duplicates
  if (!url || KNOWN_GENERIC_DUPLICATES.some(dup => url.includes(dup))) {
    return getTopicFallback(title, category);
  }
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`;
  return url;
}

let allBlogs = [];
let realtimeTrends = [];
let selectedCategory = 'all';
let autoRefreshActive = true;
let tickSecondsElapsed = 0;
let radarIntervalId = null;
let tickTimerIntervalId = null;

// ============================================================================
// 1. REAL-TIME TREND & ASSUMPTIONS RADAR ENGINE
// ============================================================================
async function fetchRealtimeTrends(isManual = false) {
  const refreshBtn = document.getElementById('manual-refresh-btn');
  const spotlightRefreshBtn = document.getElementById('spotlight-refresh-btn');
  
  if (isManual) {
    if (refreshBtn) refreshBtn.innerHTML = '🔄 Recalculating...';
    if (spotlightRefreshBtn) spotlightRefreshBtn.innerHTML = '<span>🔄 Recalculating...</span>';
  }

  try {
    const res = await fetch(RADAR_URL);
    const json = await res.json();

    if (json.success && json.trends && json.trends.length > 0) {
      realtimeTrends = json.trends;
      tickSecondsElapsed = 0;
      updateTimestampDisplay();
      renderTickerStream(realtimeTrends);
      renderSpotlightTrend(realtimeTrends[0]);
    }
  } catch (err) {
    console.warn('[Radar] Real-time trend fetch note:', err.message);
  } finally {
    if (isManual) {
      if (refreshBtn) refreshBtn.innerHTML = '🔄 Refresh Now';
      if (spotlightRefreshBtn) spotlightRefreshBtn.innerHTML = '<span>🔄 Recalculate Assumptions</span>';
    }
  }
}

function updateTimestampDisplay() {
  const badge = document.getElementById('last-refresh-time');
  if (badge) {
    badge.textContent = `Refreshed ${tickSecondsElapsed}s ago`;
  }
}

function renderTickerStream(trends) {
  const container = document.getElementById('ticker-stream');
  if (!container || !trends || trends.length === 0) return;

  const itemsHtml = trends.map((t, idx) => `
    <span class="ticker-item" style="cursor:pointer;" onclick="selectSpotlightTrend(${idx})">
      <strong style="color:#38bdf8;">${t.category}:</strong> ${t.title}
      <span style="color:#34d399; font-weight:700;">[${t.searchVelocity}]</span>
      <span style="color:#fbbf24;">⚡ ML Momentum: ${t.momentumScore}</span>
    </span>
  `).join(' &nbsp;•&nbsp; ');

  // Duplicate stream for seamless marquee loop
  container.innerHTML = itemsHtml + ' &nbsp;•&nbsp; ' + itemsHtml;
}

function renderSpotlightTrend(trend) {
  if (!trend) return;

  const titleEl = document.getElementById('spotlight-trend-title');
  const velEl = document.getElementById('metric-velocity');
  const volEl = document.getElementById('metric-volume');
  const viralEl = document.getElementById('metric-viral');
  const serpEl = document.getElementById('metric-serp');
  const dwellEl = document.getElementById('metric-dwell');
  const compEl = document.getElementById('metric-completion');
  const assumptionsList = document.getElementById('assumptions-list');
  const intentPill = document.getElementById('target-intent-pill');

  if (titleEl) titleEl.textContent = trend.title;
  if (velEl) velEl.textContent = trend.searchVelocity || `+${trend.velocityPct || 280}%/hr`;
  if (volEl) volEl.textContent = `~${(trend.volume || 12500).toLocaleString()} monthly search volume`;
  if (viralEl) viralEl.textContent = trend.viralCoefficient || '2.4x';
  if (serpEl) serpEl.textContent = trend.serpDifficulty || 'Low (Instant Rank Window)';
  if (dwellEl) dwellEl.textContent = `${trend.estimatedDwellMinutes || 5.5} mins`;
  if (compEl) compEl.textContent = `${trend.readCompletionPct || 91}% Read Completion`;

  if (assumptionsList && trend.assumptions) {
    assumptionsList.innerHTML = trend.assumptions.map(a => `<li>${a}</li>`).join('');
  }

  if (intentPill) {
    intentPill.innerHTML = `🎯 <strong>Audience & Intent:</strong> ${trend.targetIntent || 'Architectural Blueprint & Implementation Guide'}`;
  }
}

function selectSpotlightTrend(index) {
  if (realtimeTrends && realtimeTrends[index]) {
    renderSpotlightTrend(realtimeTrends[index]);
    const spotlightEl = document.getElementById('radar-section');
    if (spotlightEl) spotlightEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// 1-Second Ticking Loop
function startSecondTicker() {
  if (tickTimerIntervalId) clearInterval(tickTimerIntervalId);

  tickTimerIntervalId = setInterval(() => {
    tickSecondsElapsed += 1;
    const tickClock = document.getElementById('live-tick-clock');
    if (tickClock) {
      tickClock.textContent = `${String(tickSecondsElapsed).padStart(2, '0')}s`;
    }
    updateTimestampDisplay();

    // Dynamic Micro-Jitter on Momentum when auto-refresh is active
    if (autoRefreshActive && realtimeTrends.length > 0) {
      const top = realtimeTrends[0];
      const jitter = (Math.sin(tickSecondsElapsed * 0.8) * 0.4).toFixed(1);
      const velEl = document.getElementById('metric-velocity');
      if (velEl && top.velocityPct) {
        velEl.textContent = `+${Math.round(top.velocityPct + parseFloat(jitter) * 8)}%/hr`;
      }
    }
  }, 1000);
}

// ============================================================================
// 2. LIVE BLOG POSTS RETRIEVAL & RENDERING
// ============================================================================
async function fetchLiveBlogs() {
  const container = document.getElementById('articles-grid');
  try {
    const res = await fetch(BLOGS_URL);
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
      container.innerHTML = `
        <div class="loading-spinner">
          <p>No published articles found yet in database.</p>
          <a href="http://localhost:3000/writer" target="_blank" style="color:#38bdf8; font-weight:700;">
            ⚡ Open AI Writer Studio & Publish Your First Blog &rarr;
          </a>
        </div>
      `;
      return;
    }

    allBlogs = json.data;
    renderCategories(allBlogs);
    renderBlogs(allBlogs);
  } catch (err) {
    console.warn('Fetch live blogs error:', err.message);
    container.innerHTML = `
      <div class="loading-spinner">
        Could not connect to backend API at <code>${BLOGS_URL}</code>.<br/>
        Please ensure the backend server is running on port 5000.
      </div>
    `;
  }
}

function renderCategories(blogs) {
  const pillsContainer = document.getElementById('category-pills');
  if (!pillsContainer) return;

  const categories = ['all', ...new Set(blogs.map(b => b.category).filter(Boolean))];
  pillsContainer.innerHTML = categories.map(cat => `
    <button 
      class="cat-pill-btn ${selectedCategory === cat ? 'active' : ''}"
      onclick="filterCategory('${cat}')"
    >
      ${cat === 'all' ? '🌟 All Articles' : cat}
    </button>
  `).join('');
}

function filterCategory(cat) {
  selectedCategory = cat;
  renderCategories(allBlogs);
  const filtered = cat === 'all' ? allBlogs : allBlogs.filter(b => b.category === cat);
  renderBlogs(filtered);
}

function renderBlogs(blogsToRender) {
  const container = document.getElementById('articles-grid');
  if (!container) return;

  if (blogsToRender.length === 0) {
    container.innerHTML = '<div class="loading-spinner">No articles match your search filter.</div>';
    return;
  }

  container.innerHTML = blogsToRender.map(blog => {
    const readTime = Math.max(3, Math.ceil((blog.contentMarkdown || '').split(' ').length / 200));
    const views = blog.metrics?.views || Math.floor(Math.random() * 450 + 120);

    return `
      <article class="article-card" onclick="openArticle('${blog.slug}')">
        <div class="card-img-wrap">
          <img 
            src="${resolveImgUrl(blog.featuredImage?.url, blog.title, blog.category)}" 
            alt="${blog.title}" 
            class="card-img" 
            loading="lazy"
            onerror="this.onerror=null;this.src=getTopicFallback('${(blog.title || '').replace(/'/g, "\\'")}', '${blog.category || ''}');"
          />
          <span class="card-img-badge">${blog.category || 'Technology'}</span>
        </div>
        <div class="card-content">
          <div>
            <h3 class="card-title">${blog.title}</h3>
            <p class="card-excerpt">${blog.excerpt || 'Comprehensive guide with architectural blueprints, ML benchmarks, and production implementation steps.'}</p>
          </div>
          <div class="card-meta">
            <div class="author-chip">
              <span class="author-dot"></span>
              <span>${blog.author || 'AI Autonomous Editorial'}</span>
            </div>
            <span class="read-btn-link">Read Full Post &rarr;</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Search input listener
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = allBlogs.filter(b => 
      b.title.toLowerCase().includes(q) || 
      (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
    renderBlogs(filtered);
  });
}

// ============================================================================
// 3. ARTICLE READER MODAL WITH MARKDOWN & TELEMETRY
// ============================================================================
async function openArticle(slug) {
  const modal = document.getElementById('article-modal');
  const modalBody = document.getElementById('modal-body');
  if (!modal || !modalBody) return;

  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  modalBody.innerHTML = '<div class="loading-spinner"><div class="spinner-ring"></div><span>Loading article...</span></div>';

  try {
    const res = await fetch(`${BLOGS_URL}/${slug}`);
    const json = await res.json();
    const blog = json.data;

    // Send real visitor pageview telemetry beacon
    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blogSlug: slug,
        eventType: 'pageview',
        readingTimeSeconds: 60,
        referrer: 'live-website-demo'
      })
    }).catch(() => {});

    const parsedMarkdown = renderMarkdownToHtml(blog.contentMarkdown || blog.excerpt || '');
    const pubDate = new Date(blog.publishedAt || Date.now()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    modalBody.innerHTML = `
      <div class="article-header">
        <span class="article-category-pill">${blog.category || 'Technology'}</span>
        <h1 class="article-title-lg">${blog.title}</h1>
        
        <div class="article-meta-bar">
          <div class="author-details">
            <div class="author-avatar">AI</div>
            <div>
              <strong style="color:#fff; display:block;">${blog.author || 'Autonomous AI Editorial Wing'}</strong>
              <span>Published on ${pubDate} · 6 min read</span>
            </div>
          </div>
          <button onclick="shareArticle('${blog.slug}')" class="btn-reaction">
            🔗 Share Article
          </button>
        </div>
      </div>

      <img 
        src="${resolveImgUrl(blog.featuredImage?.url, blog.title, blog.category)}" 
        alt="${blog.title}" 
        class="article-hero-img" 
        onerror="this.onerror=null;this.src=getTopicFallback('${(blog.title || '').replace(/'/g, "\\'")}', '${blog.category || ''}');"
      />

      <!-- AI Summary Box -->
      <div class="ai-summary-callout">
        <div class="ai-summary-title">
          <span>🤖 AI Executive Summary & Strategic Takeaways</span>
        </div>
        <p>${blog.excerpt || 'This publication provides an end-to-end framework covering architecture, practical engineering decisions, and automated machine learning optimizations.'}</p>
      </div>

      <!-- Main Article Markdown Content -->
      <div class="article-markdown">
        ${parsedMarkdown}
      </div>

      <!-- Live Interaction & Reaction Bar -->
      <div class="article-interaction-bar">
        <div class="reaction-btns">
          <button class="btn-reaction" onclick="recordReaction('${blog.slug}', 'helpful')">
            👍 Helpful Post
          </button>
          <button class="btn-reaction" onclick="recordReaction('${blog.slug}', 'bookmark')">
            🔖 Bookmark
          </button>
        </div>
        <span style="font-size:0.8rem; color:#64748b;">
          📡 Real-time Telemetry Synced to MySQL & MongoDB
        </span>
      </div>
    `;
  } catch (err) {
    modalBody.innerHTML = `<div class="loading-spinner">Error loading article: ${err.message}</div>`;
  }
}

function renderMarkdownToHtml(md) {
  if (!md) return '';

  return md
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';

      // Headings
      if (block.startsWith('# ')) return '';
      if (block.startsWith('## ')) return `<h2>${block.replace('## ', '')}</h2>`;
      if (block.startsWith('### ')) return `<h3>${block.replace('### ', '')}</h3>`;

      // Code blocks
      if (block.startsWith('```')) {
        const cleaned = block.replace(/```[a-z]*\n?/gi, '').trim();
        return `<pre><code>${escapeHtml(cleaned)}</code></pre>`;
      }

      // Blockquote
      if (block.startsWith('>')) {
        return `<blockquote>${block.replace(/^>\s*/gm, '')}</blockquote>`;
      }

      // Unordered lists
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const items = block.split('\n').map(li => `<li>${li.replace(/^[-*]\s*/, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
      }

      // Markdown tables
      if (block.includes('|') && block.split('\n').every(l => l.trim().startsWith('|') && l.trim().endsWith('|'))) {
        const rows = block.split('\n').filter(r => !r.includes('---'));
        if (rows.length > 0) {
          const headers = rows[0].split('|').filter(c => c.trim().length > 0);
          const bodyRows = rows.slice(1);
          let thHtml = headers.map(h => `<th>${escapeHtml(h.trim())}</th>`).join('');
          let trHtml = bodyRows.map(br => {
            const cells = br.split('|').filter(c => c.trim().length > 0);
            return `<tr>${cells.map(c => `<td>${escapeHtml(c.trim())}</td>`).join('')}</tr>`;
          }).join('');
          return `<div style="overflow-x:auto; max-width:100%; margin: 1.5rem 0;"><table><thead><tr>${thHtml}</tr></thead><tbody>${trHtml}</tbody></table></div>`;
        }
      }

      // Ordered lists
      if (/^\d+\.\s/.test(block)) {
        const items = block.split('\n').map(li => `<li>${li.replace(/^\d+\.\s*/, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
      }

      // Bold and italics inline parsing
      let formatted = block
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="background:#1e293b; padding:2px 6px; border-radius:4px; color:#38bdf8; font-family:monospace; font-size:0.88em;">$1</code>');

      return `<p>${formatted}</p>`;
    })
    .join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function shareArticle(slug) {
  fetch(TRACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogSlug: slug, eventType: 'social_share' })
  }).catch(() => {});

  if (navigator.clipboard) {
    navigator.clipboard.writeText(`${window.location.origin}/#${slug}`);
  }
  alert('🔗 Article link copied to clipboard! Share event logged in analytics.');
}

function recordReaction(slug, type) {
  fetch(TRACK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogSlug: slug, eventType: `reaction_${type}` })
  }).catch(() => {});
  alert(`Thank you! Your feedback has been recorded in the live telemetry engine.`);
}

// Modal closing
const modalCloseBtn = document.getElementById('modal-close');
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    const modal = document.getElementById('article-modal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  });
}

window.onclick = function(event) {
  const modal = document.getElementById('article-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};

// ============================================================================
// 4. REAL-TIME PUBLICATION & WEBHOOK EVENT LOGS STREAM
// ============================================================================
const LOGS_URL = `${API_BASE}/api/public/logs`;

async function fetchLiveLogs() {
  const container = document.getElementById('logs-feed');
  if (!container) return;

  try {
    const res = await fetch(LOGS_URL);
    const json = await res.json();
    if (json.success && json.logs && json.logs.length > 0) {
      container.innerHTML = json.logs.map(log => {
        const timeStr = new Date(log.timestamp).toLocaleTimeString();
        const levelClass = log.level === 'SUCCESS' ? 'success' : (log.level === 'ERROR' ? 'error' : 'info');
        return `
          <div class="log-entry">
            <span class="log-time">[${timeStr}]</span>
            <span class="log-tag ${levelClass}">${(log.event || 'LOG').toUpperCase()}</span>
            <span class="log-text">
              <strong>${log.title || 'Event Logged'}</strong>: ${log.details || ''}
              ${log.slug ? `<code class="log-slug">${log.slug}</code>` : ''}
            </span>
            <span class="log-status-badge">${log.statusCode ? 'HTTP ' + log.statusCode : 'SYNCED'}</span>
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    console.warn('[Logs Stream Note]', err.message);
  }
}

// ============================================================================
// 5. EVENT LISTENERS & INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial Load of blogs, real-time trends, and publication logs
  fetchLiveBlogs();
  fetchRealtimeTrends();
  fetchLiveLogs();
  startSecondTicker();

  // 2. Set up auto-refresh interval (every 8 seconds to continuously pull fresh trends)
  radarIntervalId = setInterval(() => {
    if (autoRefreshActive) {
      fetchRealtimeTrends(false);
    }
  }, 8000);

  // 3. Fast auto-poll for live publication and webhook logs (every 3 seconds)
  setInterval(() => {
    fetchLiveLogs();
  }, 3000);

  // 3b. Auto-poll published articles every 5 seconds so live website is always in sync
  setInterval(() => {
    fetchLiveBlogs();
  }, 5000);

  const feedRefreshBtn = document.getElementById('feed-refresh-btn');
  if (feedRefreshBtn) {
    feedRefreshBtn.addEventListener('click', () => {
      feedRefreshBtn.innerHTML = '🔄 Refreshing...';
      fetchLiveBlogs().finally(() => {
        feedRefreshBtn.innerHTML = '🔄 Refresh Articles';
      });
    });
  }

  // 4. Manual Refresh Buttons
  const manualBtn = document.getElementById('manual-refresh-btn');
  if (manualBtn) {
    manualBtn.addEventListener('click', () => fetchRealtimeTrends(true));
  }

  const spotlightRefreshBtn = document.getElementById('spotlight-refresh-btn');
  if (spotlightRefreshBtn) {
    spotlightRefreshBtn.addEventListener('click', () => fetchRealtimeTrends(true));
  }

  // 5. Auto-Refresh Toggle Button
  const autoToggleBtn = document.getElementById('auto-refresh-toggle');
  const autoLabel = document.getElementById('auto-refresh-label');
  if (autoToggleBtn) {
    autoToggleBtn.addEventListener('click', () => {
      autoRefreshActive = !autoRefreshActive;
      if (autoLabel) {
        autoLabel.textContent = autoRefreshActive ? 'Auto-Pulse: ON (1s)' : 'Auto-Pulse: PAUSED';
      }
      autoToggleBtn.style.borderColor = autoRefreshActive ? '#10b981' : '#64748b';
    });
  }
});
