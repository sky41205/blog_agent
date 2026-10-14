from fastapi import FastAPI, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.security.api_key import APIKeyHeader
import uvicorn
from app.core.config import GEMINI_API_KEY, CONFIGURED_API_KEYS
from app.core.model_registry import registry
from app.training.train_all import train_all_models
from app.routes.trend import router as trend_router
from app.routes.relevance import router as relevance_router
from app.routes.performance import router as performance_router
from app.routes.publishing_time import router as pub_time_router
from app.routes.duplicate import router as duplicate_router
from app.routes.clustering import router as clustering_router
from app.routes.internal_links import router as internal_links_router
from app.routes.quality import router as quality_router
from app.routes.retrain import router as retrain_router
from app.routes.image_gen import router as image_gen_router

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

app = FastAPI(
    title="Autonomous Blogger AI & ML Microservice",
    description="""
# 🤖 Autonomous Blogger AI & ML Microservice

Production-grade Machine Learning engine for Trend Detection, Relevance Classification, Blog Performance Prediction, NLP Quality Auditing, and Smart Topic Clustering.

### 🔑 Configured API Keys:
Provide `GEMINI_API_KEY` or `HUGGINGFACE_TOKEN` via environment variables.

### ☁️ Google Cloud & OAuth 2.0:
- **Project:** `bolg-agent`

Click the **Authorize 🔓** button at the top right to authenticate in Swagger UI.
    """,
    version="1.0.0",
    swagger_ui_parameters={
        "persistAuthorization": True,
        "displayRequestDuration": True,
        "tryItOutEnabled": True
    }
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Autonomous Blogger AI & ML Microservice",
        version="1.0.0",
        description="Production-grade Machine Learning engine for Trend Detection, Relevance Classification, Blog Performance Prediction, NLP Quality Auditing, and Smart Topic Clustering.",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "ApiKeyHeader": {
            "type": "apiKey",
            "in": "header",
            "name": "X-API-Key",
            "description": "Enter your Google Gemini API Key"
        },
        "GeminiApiKey": {
            "type": "apiKey",
            "in": "header",
            "name": "x-goog-api-key",
            "description": "Google Gemini API Key"
        }
    }
    openapi_schema["security"] = [
        {"ApiKeyHeader": []},
        {"GeminiApiKey": []}
    ]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Enable CORS for Node.js backend and React dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(trend_router)
app.include_router(relevance_router)
app.include_router(performance_router)
app.include_router(pub_time_router)
app.include_router(duplicate_router)
app.include_router(clustering_router)
app.include_router(internal_links_router)
app.include_router(quality_router)
app.include_router(retrain_router)
app.include_router(image_gen_router)

@app.on_event("startup")
def startup_event():
    print("[FastAPI Startup] Initializing ML models...")
    if registry.trend_model is None or registry.performance_model is None:
        print("[FastAPI Startup] Models not found on disk. Initializing bootstrap training...")
        try:
            train_all_models()
            registry.load_all()
        except Exception as e:
            print(f"[FastAPI Startup] Training warning: {e}")
    print("[FastAPI Startup] ML microservice is online and ready!")

@app.get("/")
def root():
    return {
        "service": "Autonomous Blog ML Engine",
        "status": "online",
        "version": "1.0.0",
        "endpoints": [
            "/ml/predict-trend",
            "/ml/predict-relevance",
            "/ml/predict-performance",
            "/ml/predict-publish-time",
            "/ml/detect-duplicate",
            "/ml/cluster-topics",
            "/ml/recommend-internal-links",
            "/ml/score-quality",
            "/ml/retrain",
            "/ml/models"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "trend_model": registry.trend_model is not None,
            "topic_relevance_model": registry.relevance_pipeline is not None,
            "performance_model": registry.performance_model is not None,
            "publishing_time_model": registry.publishing_time_model is not None
        }
    }

@app.get("/ml/models")
def get_models_metadata():
    return {
        "status": "success",
        "registry": registry.metadata
    }

@app.get("/ml/api-key-status", tags=["API Key Configuration"])
def get_api_key_status():
    return {
        "status": "configured",
        "primary_api_key": GEMINI_API_KEY,
        "configured_keys_count": len(CONFIGURED_API_KEYS),
        "keys_pool": [f"{k[:6]}...{k[-4:]}" for k in CONFIGURED_API_KEYS],
        "provider": "Google Gemini",
        "google_cloud_oauth": {
            "project_id": os.getenv("GOOGLE_PROJECT_ID", "bolg-agent"),
            "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
            "console_url": "https://console.cloud.google.com/auth/clients"
        },
        "swagger_auth_header": "X-API-Key or x-goog-api-key",
        "message": "Gemini API keys and Google Cloud OAuth credentials can be configured via environment variables."
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
