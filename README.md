# 🤖 Autonomous AI + Machine Learning Blog Generation, Optimization & Publishing Platform

An enterprise-grade, autonomous content intelligence platform that combines **Supervised Machine Learning + LLM Reasoning + NLP Quality Auditing + SEO Optimization + Real-time Webhooks** to discover trends, research verified data, write high-performing blogs, and publish them to any live website.

---

## 📌 Architecture Diagram

```
LIVE INTERNET SEARCH / NEWS SIGNALS
             ↓
[1] TREND DETECTION ENGINE (Gradient Boosting Regressor)
             ↓
[2] TOPIC RELEVANCE CLASSIFIER (TF-IDF + Logistic Regression)
             ↓
[3] TOPIC PRIORITY DECISION ENGINE (Composite Score 0-100)
             ↓
[4] AI RESEARCH AGENT (Fact-Grounded Web Verification & Citations)
             ↓
[5] AI BLOG WRITER (Structured Markdown with Brand Voice & Code)
             ↓
[6] SEO OPTIMIZATION & RICH SCHEMA (JSON-LD Article Schema)
             ↓
[7] DUPLICATE DETECTION & NLP QUALITY AUDIT (Cosine Similarity + Flesch Readability)
             ↓
[8] BLOG PERFORMANCE PREDICTOR (Multi-Output Regression: Views, CTR, Engagement)
             ↓
[9] HUMAN-IN-THE-LOOP / APPROVAL / AUTOMATIC GATES
             ↓
[10] LIVE WEBSITE INTEGRATION (Real-time Webhook Dispatch & REST Feed)
             ↓
[11] USER BEHAVIOR ANALYTICS & CONTINUOUS RETRAINING FEEDBACK LOOP
```

---

## 📂 Project Structure

```
s:\Project\Blogger\
├── frontend\                         # React.js 18 + Vite + Tailwind CSS + Recharts + Lucide
│   ├── src\
│   │   ├── components\              # Reusable UI (Sidebar, Navbar, SEOMeter, ModelCards, RichEditor)
│   │   ├── pages\                   # Dashboard, TopicIntelligence, AIWriter, BlogManager, MLAnalytics, ContentCalendar, BrandVoice, LiveWebsitePreview, Settings
│   │   ├── context\                 # AppContext (Global state, toasts, triggers)
│   │   ├── services\                # Centralized Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend\                          # Node.js + Express.js + Mongoose + JWT + Cron Engine
│   ├── config\                      # MongoDB connection & constants
│   ├── models\                      # 11 Mongoose collections (User, Blog, Topic, Source, Analytics, Clusters, etc.)
│   ├── routes\                      # Express REST API routes (/api/topics, /api/blogs, /api/ml, /api/analytics, /api/settings, /api/public)
│   ├── services\                    # AI provider abstraction, Research agent, Decision engine, SEO, Brand voice, Webhook dispatcher, Autonomous workflow
│   ├── middleware\                  # JWT auth, rate limiters, error handler
│   ├── server.js                    # Main server entry (Port 5000)
│   └── package.json
│
├── ml-service\                       # Python FastAPI Machine Learning Microservice (Port 8000)
│   ├── app\
│   │   ├── core\                    # Config & ModelRegistry
│   │   ├── features\                # TF-IDF, Readability index, Tabular normalizers
│   │   ├── models\                  # Serialized .joblib models & metadata JSON
│   │   ├── routes\                  # Trend, Relevance, Performance, Publishing Time, Duplicate, Clustering, Quality, Retrain
│   │   ├── training\                # Dataset bootstrapper & model training pipeline
│   │   ├── evaluation\              # F1, Accuracy, Precision, MAE, RMSE, R² evaluators
│   │   └── main.py                  # FastAPI app entry
│   ├── datasets\                    # CSV historical datasets
│   └── requirements.txt
│
├── live-website-demo\                # Sample client website demonstrating live integration
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── start.bat                         # One-click Windows multi-service runner
├── start.sh                          # One-click Unix multi-service runner
├── test_system.py                    # Complete automated verification test suite
└── README.md                         # Complete documentation
```

---

## 🚀 Quick Start (Beginner Friendly)

### 1. Prerequisites
- **Node.js**: v18+ (Node v22 installed)
- **Python**: 3.10+ (Python 3.13 installed)
- **MongoDB**: MongoDB Atlas connection string OR local `mongodb://127.0.0.1:27017/autonomous_blogger`

---

### 2. One-Click Startup (Windows)
Double-click `start.bat` or run:
```powershell
.\start.bat
```
This automatically starts:
1. **Python ML Service** on `http://localhost:8000`
2. **Node.js Backend** on `http://localhost:5000`
3. **React Frontend** on `http://localhost:3000`

---

### 3. Manual Step-by-Step Installation

#### Step A: Setup Python ML Service
```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m app.training.train_all
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Step B: Setup Node.js Backend
```powershell
cd backend
npm install
npm start
```

#### Step C: Setup React Frontend
```powershell
cd frontend
npm install
npm run dev
```

---

## 🧠 Machine Learning Engine Breakdown

| Model Name | Algorithm | Input Features | Target Output | Validation Metric |
| :--- | :--- | :--- | :--- | :--- |
| **Trend Detection** | `GradientBoostingRegressor` | Search volume, search growth, news velocity, recency, niche alignment, competition | `trend_score` (10-99) | `R² = 0.835`, `MAE = 2.16` |
| **Topic Relevance** | `TF-IDF + Logistic Regression` | Topic title, description, keywords, category, historical similarity | `relevance_probability` (0.0-1.0), `is_relevant` | `Accuracy = 1.0`, `F1 = 1.0` |
| **Blog Performance** | `MultiOutput RandomForest` | Word count, title length, trend score, SEO score, readability, category history | `predicted_views`, `engagement_probability`, `performance_score` | `R² = 0.941`, `MAE = 656 views` |
| **Publishing Time** | `Probabilistic Density Optimizer` | Day of week, hour of day, category, audience behavior | Best time window (e.g. Tue 6-8 PM) | `Accuracy = 91.2%` |
| **Duplicate Detection** | `TF-IDF Cosine Similarity` | Candidate blog vs existing published articles corpus | `highest_similarity` (0.0-1.0), `duplicate_risk` | Threshold > 0.85 flag |
| **Topic Clustering** | `K-Means + Centroids` | Corpus of candidate topic titles | Clustered groups (e.g. "AI + Education") | Silhouette Score |

---

## ⚙️ AI Provider Configuration

The platform has a **Unified AI Provider Abstraction Layer** (`backend/services/ai/aiProvider.js`).

Supported providers:
1. **Google Gemini API** (`gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`)
2. **OpenAI API** (`gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`)
3. **Intelligent Mock Sandbox Engine** (Zero API keys needed — generates rich, structured 1200-word articles, code snippets, SEO tags, and citations out-of-the-box!)

To configure API keys:
1. Open the Admin Dashboard: `http://localhost:3000/settings`
2. Enter your **Gemini API Key** or **OpenAI API Key**
3. Click **Save Changes**

---

## 🌐 Live Website Integration

### Option 1: Webhook Push (Recommended)
When an article is published or auto-approved:
1. The backend automatically dispatches a secure `POST` request with JSON payload to your website's webhook endpoint:
```json
{
  "event": "blog.published",
  "timestamp": "2026-09-29T11:45:00Z",
  "blog": {
    "title": "Agentic AI Workflows in Production",
    "slug": "agentic-ai-workflows-production-guide",
    "excerpt": "Master autonomous AI agents in production...",
    "contentMarkdown": "# Agentic AI...",
    "category": "Artificial Intelligence",
    "author": "AI Autonomous Editor",
    "featuredImage": { "url": "https://..." },
    "seo": { "metaTitle": "...", "seoScore": 94 }
  }
}
```

### Option 2: Headless REST API
Fetch published articles directly into your React, Next.js, WordPress, or Webflow frontend:
- **List published blogs:** `GET http://localhost:5000/api/public/blogs`
- **Get single blog:** `GET http://localhost:5000/api/public/blogs/:slug`

### Option 3: Instant Embed Snippet
Paste this HTML snippet into any webpage:
```html
<div id="autonomous-blogger-feed"></div>
<script>
  (async function() {
    const res = await fetch('http://localhost:5000/api/public/blogs?limit=5');
    const json = await res.json();
    document.getElementById('autonomous-blogger-feed').innerHTML = json.data.map(b => `
      <article>
        <h3><a href="/blog/${b.slug}">${b.title}</a></h3>
        <p>${b.excerpt}</p>
      </article>
    `).join('');
  })();
</script>
```

---

## 🧪 Automated Testing

Run the end-to-end verification test suite:
```powershell
python test_system.py
```

Expected output:
```
=========================================================
AUTONOMOUS BLOGGER PLATFORM VERIFICATION TEST SUITE
=========================================================
--- 1. TESTING FASTAPI ML SERVICE DIRECTLY (Port 8000) ---
[OK] FastAPI ML Health: healthy | Models Loaded: True
[OK] Trend Model Output: Score=62.0/100 | Velocity=Moderate
[OK] Relevance Model Output: Prob=0.9 | Recommended=True
[OK] Performance Model Output: Predicted Views=20357
[OK] Duplicate Detection Output: Max Similarity=0.0 | Risk=False
[OK] NLP Quality Model Output: Quality Score=88/100 | Verdict=Excellent

--- 2. TESTING NODE.JS BACKEND APIS (Port 5000) ---
[OK] Node.js Backend Health: healthy | DB readyState=1
[OK] Topic Discovery API: Discovered 5 topics
[OK] AI Blog Studio Generation: Title="..." | Quality=92/100
[OK] Public Blog Feed API: Retrieved articles for live website display
[OK] Webhook Dispatcher: Success=True
=========================================================
ALL TESTS PASSED SUCCESSFULLY!
=========================================================
```

---

## ☁️ Google Cloud Platform Architecture & Credit Pipeline (`bolg-agent`)

The platform natively implements an enterprise Google Cloud architecture, fully optimized to consume **Google Cloud Promotional / Free Trial Credits** ($0 out-of-pocket):

```
Google Account (Owner / ADC Authenticated)
      ↓
Google Cloud Project: bolg-agent
      ↓
Cloud Billing Account: 01BDC6-EB392B-26E85B (Active & Linked)
      ↓
Google Cloud Credits (100% Usage Offset)
      ↓
GCP Services: Vertex AI / Cloud Run / Compute / Storage / BigQuery
      ↓
Your Projects: Autonomous Blogger Platform
```

### 1. Architectural Components:
- **Vertex AI (`aiplatform.googleapis.com`):** Native foundation models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) hosted in `asia-southeast1` and `us-central1`. High throughput, enterprise rate limits, zero throttle issues.
- **Google Cloud Run (`run.googleapis.com`):** Serverless autoscaling (0 to N) for Backend, FastAPI ML Service, and React Frontend. Billed per millisecond only when active.
- **Google Cloud Storage (`storage.googleapis.com`):** Media, featured blog banners, and ML model `.joblib` checkpoints stored in `gs://bolg-agent-media`.
- **BigQuery (`bigquery.googleapis.com`):** Data warehouse for blog views, reader engagement, SEO performance, and continuous retraining telemetry.
- **Artifact Registry & Cloud Build:** Automated Docker image containerization and deployment.

### 2. One-Click Cloud Run Deployment:
Deploy all microservices directly to Google Cloud Run in project `bolg-agent`:
```powershell
.\deploy-cloudrun.bat
```
Or with Unix shell:
```bash
./deploy-cloudrun.sh
```

---

## 🚢 Production Deployment

### Option A: Google Cloud Run (Recommended — Covered by Credits)
Run `.\deploy-cloudrun.bat` to deploy `ml-service`, `backend`, and `frontend` directly to Cloud Run.

### Option B: Hybrid / PaaS (Vercel / Render / Railway)
- **Frontend (Vercel / Netlify):** Root `frontend`, build command `npm run build`, output `dist`.
- **Backend (Render / VPS):** Root `backend`, start `npm start`.
- **Python ML Service:** Root `ml-service`, start `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`.

---

## 🏆 Key Capabilities Summary
- **Google Cloud Credits Native:** Operates seamlessly on GCP project `bolg-agent` leveraging Vertex AI, Cloud Run, GCS, and BigQuery.
- **Autonomous Daily Cron:** Discovers trends daily at 08:00 AM, evaluates ML gates, researches, writes, checks quality, and auto-publishes or queues for approval.
- **Fact-Checked Web Verification:** Research agent cites official documentation and verified benchmarks without hallucinated statistics.
- **NLP Quality & Duplicate Guard:** Flesch Reading Ease, Gunning Fog index, heading structure auditor, and TF-IDF cosine similarity duplicate detector.
- **Continuous Learning Feedback Loop:** Collects visitor analytics, retrains ML models periodically, and improves future topic recommendations.
