import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "app" / "models"
DATASETS_DIR = BASE_DIR / "datasets"

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATASETS_DIR, exist_ok=True)

TREND_MODEL_PATH = MODELS_DIR / "trend_model.joblib"
RELEVANCE_MODEL_PATH = MODELS_DIR / "topic_relevance_model.joblib"
PERFORMANCE_MODEL_PATH = MODELS_DIR / "performance_model.joblib"
PUBLISHING_TIME_MODEL_PATH = MODELS_DIR / "publishing_time_model.joblib"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

DEFAULT_NICHE = "Technology & AI"
CATEGORIES = [
    "Artificial Intelligence",
    "Machine Learning",
    "Software Development",
    "Data Science",
    "Cloud Computing",
    "Cybersecurity",
    "Web Development",
    "Tech Trends & Future"
]

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
raw_keys = os.getenv("GEMINI_API_KEYS", GEMINI_API_KEY)
CONFIGURED_API_KEYS = [k.strip() for k in raw_keys.split(",") if k.strip()]

HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")

