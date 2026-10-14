const http = require('http');

async function testNewDeepGeneration() {
  console.log('Testing new deep content generation with unique image...');
  
  const payload = JSON.stringify({
    topic: 'Next-Generation API Gateways and Zero-Trust Envoy Architecture in 2026',
    category: 'Technology & AI',
    targetAudience: 'Cloud Architects and DevOps Engineers',
    targetWordCount: 1600,
    humanCheckpoints: false,
    maxCriticRetries: 1
  });

  const req = http.request('http://localhost:5000/api/blogs/multi-agent/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Generation Success:', json.success);
        console.log('Title:', json.blog?.title);
        console.log('Featured Image URL:', json.blog?.featuredImage?.url);
        console.log('Content Length (Chars):', json.blog?.contentMarkdown?.length);
        console.log('Word Count:', (json.blog?.contentMarkdown || '').split(/\s+/).filter(Boolean).length);
        console.log('Has Markdown Table:', (json.blog?.contentMarkdown || '').includes('| --- |') || (json.blog?.contentMarkdown || '').includes('|:---'));
        console.log('Quality Score:', json.blog?.qualityMetrics?.qualityScore);
      } catch (e) {
        console.error('Parse error:', e.message, 'Raw data:', data.slice(0, 300));
      }
    });
  });

  req.on('error', (err) => console.error('Request error:', err.message));
  req.write(payload);
  req.end();
}

testNewDeepGeneration();
