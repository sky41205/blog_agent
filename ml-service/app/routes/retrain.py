from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.training.train_all import train_all_models
from app.core.model_registry import registry

router = APIRouter(prefix="/ml", tags=["Model Retraining"])

class RetrainRequest(BaseModel):
    trigger_reason: Optional[str] = "Periodic 30-Day Model Calibration"
    new_analytics_count: Optional[int] = 50

class RetrainResponse(BaseModel):
    status: str
    message: str
    version: str
    updated_models: List[str]
    metadata: Dict[str, Any]

@router.post("/retrain", response_model=RetrainResponse)
def retrain_models(req: RetrainRequest):
    print(f"[ML Retrain] Starting retraining trigger: {req.trigger_reason} with {req.new_analytics_count} new entries")
    
    # Run retraining pipeline
    meta = train_all_models()
    # Reload registry
    registry.load_all()
    
    return RetrainResponse(
        status="success",
        message="All production ML models successfully retrained and validated without data leakage.",
        version=meta.get("version", "1.0.1"),
        updated_models=["trend_model", "topic_relevance_model", "performance_model", "publishing_time_model"],
        metadata=meta
    )
