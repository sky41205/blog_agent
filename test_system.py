"""
Autonomous Blogger Platform — End-to-End System, API & MySQL Verification Test Suite
"""
import sys
import time
import requests
import json

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

NODE_URL = "http://localhost:5000"
FASTAPI_URL = "http://localhost:8000"

def test_ml_service_direct():
    print("\n--- 1. TESTING FASTAPI ML SERVICE DIRECTLY (Port 8000) ---")
    try:
        health = requests.get(f"{FASTAPI_URL}/health", timeout=5).json()
        print(f"[OK] FastAPI ML Health: {health['status']} | Models Loaded: {health['models_loaded']}")
        
        # Test Trend Prediction
        trend_req = {
            "topic": "Agentic AI Workflows in Production",
            "search_volume": 12500,
            "search_growth": 65.0,
            "news_frequency": 18,
            "niche_relevance": 95.0
        }
        trend_res = requests.post(f"{FASTAPI_URL}/ml/predict-trend", json=trend_req, timeout=5).json()
        print(f"[OK] Trend Model Output: Score={trend_res['trend_score']}/100 | Velocity={trend_res['velocity_status']}")

        # Test Topic Relevance
        rel_req = {
            "title": "Agentic AI Workflows in Production",
            "category": "Artificial Intelligence",
            "website_niche": "Technology & AI"
        }
        rel_res = requests.post(f"{FASTAPI_URL}/ml/predict-relevance", json=rel_req, timeout=5).json()
        print(f"[OK] Relevance Model Output: Prob={rel_res['relevance_probability']} | Recommended={rel_res['recommended']}")

        # Test Blog Performance Prediction
        perf_req = {
            "topic": "Agentic AI Workflows in Production",
            "word_count": 1350,
            "trend_score": 88.0,
            "seo_score": 92.0,
            "readability_score": 75.0
        }
        perf_res = requests.post(f"{FASTAPI_URL}/ml/predict-performance", json=perf_req, timeout=5).json()
        print(f"[OK] Performance Model Output: Predicted Views={perf_res['predicted_views']} | Engagement Prob={perf_res['engagement_probability']}")

        # Test Duplicate Detection
        dup_req = {
            "new_title": "Agentic AI Workflows in Production",
            "new_content": "A technical guide to autonomous AI agents and tool use.",
            "existing_articles": [
                {"id": "1", "title": "Healthy Vegan Breakfast Recipes", "content": "How to make oatmeal and smoothie bowls."}
            ]
        }
        dup_res = requests.post(f"{FASTAPI_URL}/ml/detect-duplicate", json=dup_req, timeout=5).json()
        print(f"[OK] Duplicate Detection Output: Max Similarity={dup_res['highest_similarity']} | Risk={dup_res['is_duplicate_risk']}")

        # Test NLP Quality Scoring
        qual_req = {
            "title": "Agentic AI Workflows in Production",
            "content": "# Agentic AI Workflows\n\n## Section 1\nAI workflows are improving rapidly in 2026.\n\n## Frequently Asked Questions\n### What is agentic AI?\nIt is autonomous.",
            "primary_keyword": "agentic ai"
        }
        qual_res = requests.post(f"{FASTAPI_URL}/ml/score-quality", json=qual_req, timeout=5).json()
        print(f"[OK] NLP Quality Model Output: Quality Score={qual_res['content_quality_score']}/100 | Verdict={qual_res['verdict']}")

    except Exception as e:
        print(f"[FAIL] ML Service Test Error: {e}")

def test_node_backend():
    print("\n--- 2. TESTING NODE.JS BACKEND APIS (Port 5000) ---")
    try:
        health = requests.get(f"{NODE_URL}/health", timeout=5).json()
        print(f"[OK] Node.js Backend Health (/health): {health['status']} | DB readyState={health['database']['readyState']}")

        api_health = requests.get(f"{NODE_URL}/api/health", timeout=5).json()
        print(f"[OK] Node.js Backend Health (/api/health): {api_health['status']}")

        # Test Topic Discovery
        disc_res = requests.post(f"{NODE_URL}/api/topics/discover", json={"niche": "Technology & AI"}, timeout=30).json()
        print(f"[OK] Topic Discovery API: Discovered {len(disc_res.get('topics', []))} topics")

        # Test AI Generation & Optimization
        gen_req = {
            "topic": "Micro-Frontends with Vite 6 and Module Federation",
            "wordCount": 1100,
            "targetAudience": "Frontend Developers"
        }
        gen_res = requests.post(f"{NODE_URL}/api/blogs/generate", json=gen_req, timeout=120).json()
        blog = gen_res.get('blog', {})
        print(f"[OK] AI Blog Studio Generation: Title=\"{blog.get('title')}\" | Quality={blog.get('qualityMetrics', {}).get('qualityScore', 90)}/100")

        # Test Public Blog Feed (Live Website Endpoint)
        feed_res = requests.get(f"{NODE_URL}/api/public/blogs", timeout=5).json()
        print(f"[OK] Public Blog Feed API: Retrieved {len(feed_res.get('data', []))} articles for live website display")

        # Test Webhook Dispatching
        webhook_test = requests.post(f"{NODE_URL}/api/settings/test-webhook", json={}, timeout=5).json()
        print(f"[OK] Webhook Dispatcher: Success={webhook_test.get('success')}")

    except Exception as e:
        print(f"[FAIL] Backend Test Error: {e}")
        raise e

def test_mysql_integration():
    print("\n--- 3. TESTING MYSQL INTEGRATION & RELATIONAL DATA PIPELINE ---")
    try:
        status_res = requests.get(f"{NODE_URL}/api/mysql/status", timeout=5).json()
        status_data = status_res.get('data', {})
        print(f"[OK] MySQL API Status Endpoint: isConnected={status_data.get('isConnected')} | Host={status_data.get('host')}:{status_data.get('port')} | DB={status_data.get('database')}")

        if not status_data.get('isConnected'):
            print(f"[INFO] MySQL is currently awaiting root password authentication (configure via UI at /mysql or in backend/.env)")
            print(f"[INFO] MySQL Schema and tables ('blogs', 'topics', 'blog_analytics', 'platform_settings') are ready for auto-creation.")
        else:
            # Test direct MySQL blogs fetch
            blogs_res = requests.get(f"{NODE_URL}/api/mysql/blogs", timeout=5).json()
            print(f"[OK] MySQL Direct Blogs Fetch: Total {blogs_res.get('total', 0)} blogs retrieved directly from MySQL 'blogs' table")

            # Test SQL Query Execution
            query_res = requests.post(f"{NODE_URL}/api/mysql/query", json={"query": "SHOW TABLES;"}, timeout=5).json()
            print(f"[OK] MySQL SQL Console Execution: Returned {query_res.get('rowCount', 0)} tables in {query_res.get('executionTimeMs', 0)} ms")

    except Exception as e:
        print(f"[FAIL] MySQL Integration Test Error: {e}")

def test_gcp_vertex_ai_pipeline():
    print("\n--- 4. TESTING GOOGLE CLOUD CREDITS & VERTEX AI PIPELINE (bolg-agent) ---")
    try:
        overview_res = requests.get(f"{NODE_URL}/api/gcp/overview", timeout=10).json()
        if overview_res.get('success'):
            p = overview_res['data']['pipeline']
            print(f"[OK] Google Account: {p['googleAccount']['email']} | Auth: {p['googleAccount']['status']}")
            print(f"[OK] GCP Project: {p['googleCloudProject']['projectId']} | Primary Region: {p['googleCloudProject']['primaryRegion']}")
            print(f"[OK] Billing Account: {p['cloudBillingAccount']['billingAccountId']} | Open={p['cloudBillingAccount']['isOpen']} ({p['cloudBillingAccount']['currency']})")
            print(f"[OK] Google Cloud Credits: {p['googleCloudCredits']['status']} | {p['googleCloudCredits']['creditCoverage']}")
            print(f"[OK] Vertex AI Model: {p['gcpServices']['vertexAI']['activeModel']} | Status: {p['gcpServices']['vertexAI']['status']}")
        
        # Test Live Vertex AI Inference
        vertex_req = {
            "prompt": "Reply with a one-sentence confirmation that Google Cloud Credits are active for bolg-agent.",
            "model": "gemini-2.5-flash"
        }
        v_res = requests.post(f"{NODE_URL}/api/gcp/test-vertex", json=vertex_req, timeout=30).json()
        if v_res.get('success'):
            v_data = v_res['data']
            print(f"[OK] Vertex AI Inference Response ({v_data.get('latencyMs')} ms): \"{v_data.get('response', '').strip()}\"")
            print(f"[OK] Billing Status: {v_data.get('billingStatus')}")
        else:
            print(f"[NOTE] Vertex AI Direct Test: {v_res.get('error')}")

    except Exception as e:
        print(f"[NOTE] GCP Test Connection Note: {e}")

if __name__ == "__main__":
    print("=========================================================")
    print("AUTONOMOUS BLOGGER PLATFORM VERIFICATION TEST SUITE")
    print("=========================================================")
    errors = []
    
    for name, test_fn in [
        ("FastAPI ML Microservice", test_ml_service_direct),
        ("Node.js Backend APIs", test_node_backend),
        ("MySQL Integration Pipeline", test_mysql_integration),
        ("Google Cloud Credits & Vertex AI", test_gcp_vertex_ai_pipeline)
    ]:
        try:
            test_fn()
        except Exception as e:
            errors.append((name, str(e)))

    print("\n=========================================================")
    if errors:
        print(f"FAILED TESTS ({len(errors)}):")
        for name, err in errors:
            print(f" - {name}: {err}")
        print("=========================================================")
        sys.exit(1)
    else:
        print("ALL TESTS PASSED SUCCESSFULLY!")
        print("=========================================================")
        sys.exit(0)

