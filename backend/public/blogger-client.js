/**
 * Autonomous Blogger Commercial Client SDK & Widget
 * Enables client websites to embed full-featured, responsive, autonomous blog feeds
 * using their subscription API key.
 *
 * Usage:
 * <div id="blogger-feed"></div>
 * <script 
 *   src="http://localhost:5000/api/public/blogger-client.js"
 *   data-api-key="blg_live_..."
 *   data-container="#blogger-feed"
 *   data-limit="6">
 * </script>
 */
(function() {
  if (window.__bloggerClientInitialized) return;
  window.__bloggerClientInitialized = true;

  var currentScript = document.currentScript || document.querySelector('script[src*="blogger-client.js"]');
  if (!currentScript) return;

  var apiKey = currentScript.getAttribute('data-api-key') || '';
  var containerSelector = currentScript.getAttribute('data-container') || '#blogger-feed';
  var limit = currentScript.getAttribute('data-limit') || 6;
  var category = currentScript.getAttribute('data-category') || '';
  var scriptUrl = new URL(currentScript.src);
  var baseUrl = scriptUrl.origin;

  var container = document.querySelector(containerSelector);
  if (!container) {
    container = document.createElement('div');
    container.id = 'blogger-feed';
    currentScript.parentNode.insertBefore(container, currentScript);
  }

  // Inject Custom Stylesheet
  var style = document.createElement('style');
  style.textContent = `
    .blg-feed-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 24px 0; color: #1e293b; box-sizing: border-box; }
    .blg-feed-container * { box-sizing: border-box; }
    .blg-feed-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
    .blg-feed-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 8px; }
    .blg-feed-badge { font-size: 11px; font-weight: 700; color: #4f46e5; background: #eef2ff; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; }
    .blg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .blg-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s; display: flex; flex-direction: column; cursor: pointer; }
    .blg-card:hover { transform: translateY(-4px); box-shadow: 0 16px 24px -4px rgba(0,0,0,0.1); border-color: #cbd5e1; }
    .blg-img-wrap { width: 100%; height: 190px; overflow: hidden; position: relative; background: #f1f5f9; }
    .blg-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .blg-card:hover .blg-img { transform: scale(1.03); }
    .blg-badge { position: absolute; top: 12px; left: 12px; background: rgba(15, 23, 42, 0.85); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px); text-transform: uppercase; letter-spacing: 0.5px; }
    .blg-body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
    .blg-title { font-size: 18px; font-weight: 700; line-height: 1.4; color: #0f172a; margin: 0 0 10px 0; }
    .blg-excerpt { font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 18px 0; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .blg-footer { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: auto; }
    .blg-btn { background: #4f46e5; color: #ffffff; border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .blg-btn:hover { background: #4338ca; }
    .blg-modal { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 999999; padding: 20px; }
    .blg-modal-content { background: #ffffff; border-radius: 18px; max-width: 820px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 36px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); }
    .blg-modal-close { position: absolute; top: 20px; right: 20px; background: #f1f5f9; border: none; font-size: 20px; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #64748b; font-weight: bold; }
    .blg-modal-close:hover { background: #e2e8f0; color: #0f172a; }
    .blg-notice { padding: 24px; border-radius: 12px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; font-size: 13px; text-align: center; }
  `;
  document.head.appendChild(style);

  if (!apiKey) {
    container.innerHTML = '<div class="blg-notice"><strong>Blogger Subscription Widget:</strong> Missing <code>data-api-key</code> attribute. Get your subscription key at <a href="' + baseUrl + '/subscriptions" target="_blank" style="color:#2563eb; font-weight:bold;">Autonomous Blogger Portal</a>.</div>';
    return;
  }

  // Fetch blogs via commercial API v1
  var url = baseUrl + '/api/v1/blogs?limit=' + encodeURIComponent(limit);
  if (category) url += '&category=' + encodeURIComponent(category);

  fetch(url, {
    headers: { 'X-API-Key': apiKey }
  })
  .then(function(res) {
    if (!res.ok) {
      return res.json().then(function(j) { throw new Error(j.message || 'API call failed (HTTP ' + res.status + ')'); });
    }
    return res.json();
  })
  .then(function(data) {
    var blogs = data.data || [];
    if (blogs.length === 0) {
      container.innerHTML = '<div class="blg-notice">No published articles found for this subscription feed.</div>';
      return;
    }

    var html = '<div class="blg-feed-container">';
    html += '<div class="blg-feed-header"><h3 class="blg-feed-title">Latest Published Articles</h3><span class="blg-feed-badge">Live API Feed</span></div>';
    html += '<div class="blg-grid">';

    blogs.forEach(function(b) {
      var img = (b.featuredImage && b.featuredImage.url) ? b.featuredImage.url : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
      var pubDate = b.publishedAt ? new Date(b.publishedAt).toLocaleDateString() : 'Recent';
      var categoryName = b.category || 'Technology';

      html += '<div class="blg-card" onclick="window.__blgOpenModal(\'' + b.slug + '\')">';
      html += '<div class="blg-img-wrap">';
      html += '<img src="' + img + '" class="blg-img" alt="' + (b.title || '').replace(/"/g, '&quot;') + '" loading="lazy"/>';
      html += '<span class="blg-badge">' + categoryName + '</span>';
      html += '</div>';
      html += '<div class="blg-body">';
      html += '<h3 class="blg-title">' + (b.title || '') + '</h3>';
      html += '<p class="blg-excerpt">' + (b.excerpt || '') + '</p>';
      html += '<div class="blg-footer">';
      html += '<span>' + pubDate + '</span>';
      html += '<button class="blg-btn">Read Article &rarr;</button>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;

    // Create Modal Element
    var modal = document.createElement('div');
    modal.id = 'blg-article-modal';
    modal.className = 'blg-modal';
    modal.innerHTML = '<div class="blg-modal-content"><button class="blg-modal-close" onclick="window.__blgCloseModal()">&times;</button><div id="blg-modal-inner"></div></div>';
    document.body.appendChild(modal);

    window.__blgCloseModal = function() {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    };

    window.__blgOpenModal = function(slug) {
      var inner = document.getElementById('blg-modal-inner');
      inner.innerHTML = '<p style="text-align:center; padding:40px; color:#64748b;">Loading verified article...</p>';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      fetch(baseUrl + '/api/v1/blogs/' + slug, {
        headers: { 'X-API-Key': apiKey }
      })
      .then(function(r) { return r.json(); })
      .then(function(postRes) {
        var post = postRes.data;
        if (!post) {
          inner.innerHTML = '<p>Article details unavailable.</p>';
          return;
        }

        var md = post.contentMarkdown || '';
        var formatted = md
          .replace(/^### (.*$)/gim, '<h3 style="font-size:18px; margin-top:22px; color:#0f172a;">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 style="font-size:22px; margin-top:28px; color:#0f172a;">$1</h2>')
          .replace(/^# (.*$)/gim, '<h1 style="font-size:26px; color:#0f172a;">$1</h1>')
          .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
          .replace(/\n/gim, '<br/>');

        var citationsHtml = '';
        if (post.sourceCitations && post.sourceCitations.length > 0) {
          citationsHtml = '<div style="margin-top:28px; padding:16px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;"><strong style="font-size:13px; color:#475569;">Verified Sources & Grounded Citations:</strong><ul style="margin:8px 0 0 16px; font-size:12px; color:#64748b;">' +
            post.sourceCitations.map(function(s) {
              return '<li><a href="' + s.url + '" target="_blank" style="color:#6366f1;">' + (s.title || s.url) + '</a> (' + (s.publicationDate || '2026') + ')</li>';
            }).join('') + '</ul></div>';
        }

        var imgTag = (post.featuredImage && post.featuredImage.url) ? '<img src="' + post.featuredImage.url + '" style="width:100%; max-height:360px; object-fit:cover; border-radius:12px; margin-bottom:24px;"/>' : '';

        inner.innerHTML = 
          '<span style="display:inline-block; font-size:12px; font-weight:700; color:#4f46e5; text-transform:uppercase; margin-bottom:8px;">' + (post.category || 'Technology') + '</span>' +
          '<h1 style="font-size:28px; line-height:1.3; font-weight:800; color:#0f172a; margin:0 0 16px 0;">' + post.title + '</h1>' +
          imgTag +
          '<div style="font-size:15px; line-height:1.8; color:#334155;">' + formatted + '</div>' +
          citationsHtml;
      })
      .catch(function(err) {
        inner.innerHTML = '<p style="color:#ef4444;">Failed to load article: ' + err.message + '</p>';
      });
    };
  })
  .catch(function(err) {
    container.innerHTML = '<div class="blg-notice" style="background:#fef2f2; border-color:#fecaca; color:#b91c1c;"><strong>Blogger Subscription Error:</strong> ' + err.message + '</div>';
  });
})();
