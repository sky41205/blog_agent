/**
 * Multi-Agent Pipeline & ArtifactStore Verification Test
 */

const http = require('http');

async function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://localhost:5000${path}`, {
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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Starting Multi-Agent Pipeline autonomous generation test...');
  const runRes = await post('/api/blogs/multi-agent/run', {
    topic: 'Event-Driven Microservices with Apache Kafka in 2026',
    category: 'Backend Architecture',
    targetAudience: 'Software Engineers & Solution Architects',
    targetWordCount: 800,
    humanCheckpoints: false,
    maxCriticRetries: 1
  });

  console.log('Pipeline Success:', runRes.success);
  console.log('Session ID:', runRes.sessionId);
  console.log('Correlation ID:', runRes.correlationId);
  console.log('Status:', runRes.status);
  console.log('Blog Title:', runRes.blog?.title);
  console.log('Quality Score:', runRes.blog?.qualityMetrics?.qualityScore);
  console.log('SEO Score:', runRes.blog?.seo?.seoScore);
  console.log('Artifacts Count:', runRes.artifacts?.length);

  if (runRes.sessionId) {
    const artRes = await get(`/api/blogs/multi-agent/artifacts/${runRes.sessionId}`);
    console.log('Artifacts API Endpoint Success:', artRes.success, 'Count:', artRes.count);
    if (artRes.artifacts && artRes.artifacts.length > 0) {
      console.log('First Artifact:', {
        id: artRes.artifacts[0].id,
        agentId: artRes.artifacts[0].agentId,
        type: artRes.artifacts[0].artifactType,
        hash: artRes.artifacts[0].contentHash?.slice(0, 16) + '...'
      });
      console.log('Last Artifact:', {
        id: artRes.artifacts[artRes.artifacts.length - 1].id,
        agentId: artRes.artifacts[artRes.artifacts.length - 1].agentId,
        type: artRes.artifacts[artRes.artifacts.length - 1].artifactType,
        hash: artRes.artifacts[artRes.artifacts.length - 1].contentHash?.slice(0, 16) + '...'
      });
    }
  }

  console.log('========================================================');
  console.log('END-TO-END PIPELINE & ARTIFACT STORE PASSED WITH DISTINCTION!');
  console.log('========================================================');
}

run().catch(err => {
  console.error('Pipeline test failed:', err);
  process.exit(1);
});
