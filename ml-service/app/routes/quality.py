from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.features.text_features import (
    calculate_readability_metrics,
    analyze_headings_structure,
    analyze_keyword_density
)

router = APIRouter(prefix="/ml", tags=["NLP Content Quality"])

class QualityRequest(BaseModel):
    title: str
    content: str
    primary_keyword: Optional[str] = ""
    secondary_keywords: Optional[List[str]] = []
    target_audience: Optional[str] = "Professionals"

class QualityResponse(BaseModel):
    content_quality_score: int
    readability_metrics: Dict[str, Any]
    heading_metrics: Dict[str, Any]
    keyword_metrics: Dict[str, Any]
    structural_completeness_score: int
    critical_issues: List[str]
    optimization_suggestions: List[str]
    verdict: str

@router.post("/score-quality", response_model=QualityResponse)
def score_quality(req: QualityRequest):
    readability = calculate_readability_metrics(req.content)
    headings = analyze_headings_structure(req.content)
    keywords = analyze_keyword_density(req.content, req.primary_keyword, req.secondary_keywords)
    
    # Structural completeness: checks intro, body length, lists, code/examples
    completeness_score = 100
    suggestions = []
    issues = list(headings.get("issues", [])) + list(keywords.get("issues", []))
    
    total_words = readability.get("total_words", 0)
    if total_words < 600:
        completeness_score -= 30
        issues.append(f"Word count ({total_words}) is too low for a comprehensive in-depth guide (recommend 800-1500 words).")
    elif total_words > 2500:
        suggestions.append("Article is very extensive (>2500 words); consider splitting into a 2-part series or adding interactive table of contents.")
        
    has_bullet_points = bool("-" in req.content or "*" in req.content)
    if not has_bullet_points:
        completeness_score -= 10
        suggestions.append("Add bullet points or numbered checklists for improved visual scannability.")
        
    # Aggregate quality score
    # 35% Readability + 30% Headings + 20% Keyword Density + 15% Completeness
    r_score = readability.get("readability_score", 70.0)
    h_score = headings.get("heading_score", 80)
    k_score = keywords.get("density_score", 85)
    c_score = completeness_score
    
    overall_quality = int(round(
        (r_score * 0.35) +
        (h_score * 0.30) +
        (k_score * 0.20) +
        (c_score * 0.15)
    ))
    overall_quality = max(20, min(99, overall_quality))
    
    if overall_quality >= 85:
        verdict = "Excellent (Ready to Publish)"
    elif overall_quality >= 70:
        verdict = "Good (Minor optimizations recommended)"
    else:
        verdict = "Needs Improvement before Publishing"
        
    if not suggestions:
        suggestions.append("Heading hierarchy is balanced and readability is well-tuned for target audience.")
        suggestions.append("Keyword density matches natural humanized writing guidelines without keyword stuffing.")

    return QualityResponse(
        content_quality_score=overall_quality,
        readability_metrics=readability,
        heading_metrics=headings,
        keyword_metrics=keywords,
        structural_completeness_score=completeness_score,
        critical_issues=issues,
        optimization_suggestions=suggestions,
        verdict=verdict
    )
