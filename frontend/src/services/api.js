import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
  getMe: () => api.get('/api/auth/me'),
  googleAuth: (data) => api.post('/api/auth/google', data),
  getGoogleConfig: () => api.get('/api/auth/google/config')
};

export const TopicAPI = {
  getTopics: (params) => api.get('/api/topics', { params }),
  getRealtimeRadar: (params) => api.get('/api/topics/realtime-radar', { params }),
  getGlobalTrends: (params) => api.get('/api/topics/global-trends', { params }),
  getRegions: () => api.get('/api/topics/regions'),
  discover: (data) => api.post('/api/topics/discover', data),
  analyze: (data) => api.post('/api/topics/analyze', data),
  create: (data) => api.post('/api/topics', data),
  update: (id, data) => api.put(`/api/topics/${id}`, data),
  getClusters: () => api.get('/api/topics/clusters'),
  getCategories: () => api.get('/api/topics/categories')
};

export const BlogAPI = {
  getBlogs: (params) => api.get('/api/blogs', { params }),
  getBlog: (id) => api.get(`/api/blogs/${id}`),
  research: (data) => api.post('/api/blogs/research', data),
  generate: (data) => api.post('/api/blogs/generate', data),
  optimizeSEO: (data) => api.post('/api/blogs/seo', data),
  checkQuality: (data) => api.post('/api/blogs/check-quality', data),
  predictPerformance: (data) => api.post('/api/blogs/predict-performance', data),
  rewrite: (data) => api.post('/api/blogs/rewrite', data),
  publish: (blogId, options) => api.post('/api/blogs/publish', { blogId, options }),
  submitReview: (id, data) => api.post(`/api/blogs/${id}/review`, data),
  approveAndPublish: (id, data) => api.post(`/api/blogs/${id}/approve-and-publish`, data),
  requestRevision: (id, data) => api.post(`/api/blogs/${id}/request-revision`, data),
  postToLiveWebsite: (id, data) => api.post(`/api/blogs/${id}/post-to-live`, data),
  unpublish: (id) => api.post(`/api/blogs/${id}/unpublish`),
  update: (id, data) => api.put(`/api/blogs/${id}`, data),
  delete: (id) => api.delete(`/api/blogs/${id}`),
  humanize: (data) => api.post('/api/blogs/humanize', data),
  generateImages: (data) => api.post('/api/blogs/generate-images', data),
  generateAIImage: (data) => api.post('/api/blogs/generate-ai-image', data),
  deepNLPAnalysis: (data) => api.post('/api/blogs/deep-nlp-analysis', data),
  regenerateImage: (id, data) => api.post(`/api/blogs/${id}/regenerate-image`, data),
  humanizeBlog: (id, data) => api.post(`/api/blogs/${id}/humanize`, data),
  generateTitleImagePrompt: (data) => api.post('/api/blogs/agent/image-prompt', data),
  runAutonomousCycle: () => api.post('/api/blogs/autonomous-run'),
  runMultiAgent: (data) => api.post('/api/blogs/multi-agent/run', data),
  runMultiAgentStep: (data) => api.post('/api/blogs/multi-agent/step', data),
  getMultiAgentSession: (sessionId) => api.get(`/api/blogs/multi-agent/session/${sessionId}`),
  runQualityGate: (data) => api.post('/api/blogs/multi-agent/quality-gate', data),
  approveCheckpoint: (data) => api.post('/api/blogs/multi-agent/checkpoint/approve', data),
  getAgentRegistry: () => api.get('/api/blogs/multi-agent/registry'),
  getCloudStatus: (params) => api.get('/api/blogs/multi-agent/cloud-status', { params }),
  getJobArtifacts: (jobId) => api.get(`/api/blogs/multi-agent/artifacts/${jobId}`)
};

export const MLAPI = {
  getModelsMetadata: () => api.get('/api/ml/models'),
  triggerRetraining: (data) => api.post('/api/ml/retrain', data),
  predictPublishTime: (data) => api.post('/api/ml/predict-publish-time', data),
  deepAnalysis: (data) => api.post('/api/blogs/deep-nlp-analysis', data),
  generateAIImage: (data) => api.post('/api/blogs/generate-ai-image', data)
};

export const AnalyticsAPI = {
  getDashboardData: () => api.get('/api/analytics/dashboard'),
  getBlogAnalytics: (id) => api.get(`/api/analytics/blog/${id}`),
  trackEvent: (data) => api.post('/api/analytics/track', data),
  simulateTraffic: (data) => api.post('/api/analytics/simulate-traffic', data)
};

export const PublicAPI = {
  getBlogs: (params) => api.get('/api/public/blogs', { params }),
  getBlog: (slug) => api.get(`/api/public/blogs/${slug}`),
  getCategories: () => api.get('/api/public/categories'),
  getStats: () => api.get('/api/public/stats'),
  track: (data) => api.post('/api/public/track', data),
  getLogs: () => api.get('/api/public/logs')
};

export const SettingsAPI = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (data) => api.put('/api/settings', data),
  extractBrandVoice: (data) => api.post('/api/settings/extract-brand-voice', data),
  testWebhook: () => api.post('/api/settings/test-webhook'),
  testITLCConnection: (data) => api.post('/api/settings/test-itlc-connection', data),
  testITLCIndiaConnection: (data) => api.post('/api/settings/test-itlc-india-connection', data),
  syncITLC: () => api.post('/api/settings/sync-itlc')
};

export const MySQLAPI = {
  getStatus: () => api.get('/api/mysql/status'),
  getBlogs: (params) => api.get('/api/mysql/blogs', { params }),
  getTopics: (params) => api.get('/api/mysql/topics', { params }),
  getTables: () => api.get('/api/mysql/tables'),
  getTableData: (tableName, params) => api.get(`/api/mysql/table-data/${tableName}`, { params }),
  syncAll: () => api.post('/api/mysql/sync-all'),
  testConnection: (data) => api.post('/api/mysql/test-connection', data),
  saveConfig: (data) => api.post('/api/mysql/save-config', data),
  runQuery: (query) => api.post('/api/mysql/query', { query })
};

export const GCPAPI = {
  getOverview: () => api.get('/api/gcp/overview'),
  testVertex: (data) => api.post('/api/gcp/test-vertex', data),
  getBilling: () => api.get('/api/gcp/billing')
};

export const SubscriptionAPI = {
  getOverview: () => api.get('/api/subscriptions/overview'),
  getPlans: () => api.get('/api/subscriptions/plans'),
  getKeys: (params) => api.get('/api/subscriptions/keys', { params }),
  createKey: (data) => api.post('/api/subscriptions/keys', data),
  updatePlan: (id, data) => api.patch(`/api/subscriptions/keys/${id}/plan`, data),
  simulatePayment: (id, data) => api.post(`/api/subscriptions/keys/${id}/simulate-payment`, data),
  regenerateKey: (id) => api.post(`/api/subscriptions/keys/${id}/regenerate`),
  updateStatus: (id, status) => api.patch(`/api/subscriptions/keys/${id}/status`, { status }),
  resetUsage: (id) => api.post(`/api/subscriptions/keys/${id}/reset-usage`),
  testWebhook: (id) => api.post(`/api/subscriptions/keys/${id}/test-webhook`),
  deleteKey: (id) => api.delete(`/api/subscriptions/keys/${id}`),
  testKeyV1: (key, path, method = 'GET', data = null) => api({
    method,
    url: path,
    data: data || undefined,
    headers: { 'X-API-Key': key }
  }),
  getDocs: (id) => api.get(`/api/subscriptions/keys/${id}/docs`),
  getPreviewUrl: (id) => `${api.defaults.baseURL || 'http://localhost:5000'}/api/subscriptions/keys/${id}/docs/preview`,
  getDownloadUrl: (id, format = 'markdown') => `${api.defaults.baseURL || 'http://localhost:5000'}/api/subscriptions/keys/${id}/docs/download?format=${format}`
};

export default api;
