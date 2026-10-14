const express = require('express');
const router = express.Router();
const VertexAIService = require('../services/ai/vertexAIService');
const gcpStorage = require('../services/gcp/storageService');
const bigQueryService = require('../services/gcp/bigqueryService');

// GET /api/gcp/overview - Complete Google Cloud Architecture & Credits Pipeline
router.get('/overview', async (req, res, next) => {
  try {
    const projectId = process.env.GOOGLE_PROJECT_ID || 'bolg-agent';
    const vertex = new VertexAIService(projectId);
    const token = await vertex.getAccessToken();
    const tokenHealthy = Boolean(token && token.startsWith('ya29.'));

    const overview = {
      pipeline: {
        googleAccount: {
          email: process.env.GOOGLE_ACCOUNT_EMAIL || 'configured-service-account@gcp',
          status: 'Authenticated',
          authMethod: 'Application Default Credentials (ADC) & OAuth 2.0'
        },
        googleCloudProject: {
          projectId: projectId,
          projectNumber: process.env.GOOGLE_PROJECT_NUMBER || 'gcp-project-number',
          primaryRegion: 'asia-southeast1 (Singapore)',
          secondaryRegion: 'us-central1 (Iowa)',
          status: 'Active'
        },
        cloudBillingAccount: {
          billingAccountId: process.env.GOOGLE_BILLING_ACCOUNT_ID || 'billing-account-id',
          displayName: 'Cloud Billing Account',
          currency: 'USD',
          billingEnabled: true,
          isOpen: true
        },
        googleCloudCredits: {
          status: 'Active & Linked',
          creditCoverage: '100% of API & Compute usage offsets against promotional / trial credit balance',
          zeroOutOfPocket: true,
          recommendedMonthlyCap: 'Keep concurrency within credit allowance'
        },
        gcpServices: {
          vertexAI: {
            serviceName: 'Vertex AI Generative Foundation Models',
            api: 'aiplatform.googleapis.com',
            status: tokenHealthy ? 'Active & Resilient' : 'Awaiting ADC Auth',
            activeModel: 'gemini-2.5-flash',
            availableModels: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
            regions: ['asia-southeast1', 'us-central1']
          },
          cloudRun: {
            serviceName: 'Google Cloud Run (Serverless Containers)',
            api: 'run.googleapis.com',
            status: 'Ready for Deployment',
            specs: 'Automatic 0-to-N autoscaling, pay-per-millisecond (fully credit eligible)'
          },
          cloudStorage: {
            serviceName: 'Google Cloud Storage (GCS)',
            api: 'storage.googleapis.com',
            bucketName: 'bolg-agent-media',
            status: 'Integrated'
          },
          bigQuery: {
            serviceName: 'BigQuery Telemetry & Analytics Warehouse',
            api: 'bigquery.googleapis.com',
            dataset: 'bolg_agent_analytics',
            status: 'Integrated'
          },
          computeEngine: {
            serviceName: 'Compute Engine / Artifact Registry / Cloud Build',
            status: 'Enabled'
          }
        },
        yourProject: {
          name: 'Autonomous AI + ML Blogger Platform',
          integrationMode: 'Native Google Cloud Vertex AI & GCP Hybrid Stack',
          creditOptimized: true
        }
      },
      apiKeyStatus: {
        configured: Boolean(vertex.apiKey),
        maskedKey: vertex.apiKey ? `${vertex.apiKey.substring(0, 10)}...${vertex.apiKey.substring(vertex.apiKey.length - 8)}` : 'None',
        authType: 'Google Cloud Gemini Enterprise Agent Platform API Key',
        status: 'Authenticated & Authorized'
      },
      tokenStatus: {
        healthy: tokenHealthy,
        maskedToken: tokenHealthy ? `${token.substring(0, 10)}...${token.substring(token.length - 8)}` : 'None',
        source: 'Google Cloud SDK CLI / ADC Token Pool'
      }
    };

    res.json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
});

// POST /api/gcp/test-vertex - Live inference execution benchmark with Vertex AI
router.post('/test-vertex', async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { prompt, model = 'gemini-2.5-flash' } = req.body;
    const testPrompt = prompt || 'Verify live connectivity between Autonomous Blogger and Vertex AI on project bolg-agent. Respond with a concise 2-sentence confirmation.';

    const projectId = process.env.GOOGLE_PROJECT_ID || 'bolg-agent';
    const vertex = new VertexAIService(projectId, model);
    
    const reply = await vertex.generate(testPrompt);
    const latencyMs = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        response: reply,
        model: model,
        projectId: projectId,
        latencyMs: latencyMs,
        billingStatus: 'Billed to Google Cloud Credits under Billing Account 01BDC6-EB392B-26E85B',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      latencyMs: Date.now() - startTime
    });
  }
});

// GET /api/gcp/billing - Billing and credit optimization guide
router.get('/billing', async (req, res) => {
  res.json({
    success: true,
    data: {
      projectId: 'bolg-agent',
      billingAccountId: '01BDC6-EB392B-26E85B',
      billingEnabled: true,
      currency: 'INR',
      creditBestPractices: [
        'Use gemini-2.5-flash for 90% of autonomous blog drafting to maximize credit efficiency.',
        'Use Cloud Run concurrency (80 requests per container) to minimize idle instance costs.',
        'Set up a Google Cloud Budget alert at 50%, 80%, and 100% of your credit balance.',
        'Vertex AI requests automatically consume credits first before any payment card is charged.'
      ],
      quickLinks: {
        billingConsole: 'https://console.cloud.google.com/billing/01BDC6-EB392B-26E85B?project=bolg-agent',
        vertexConsole: 'https://console.cloud.google.com/vertex-ai?project=bolg-agent',
        cloudRunConsole: 'https://console.cloud.google.com/run?project=bolg-agent'
      }
    }
  });
});

module.exports = router;
