from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

router = APIRouter(prefix="/ml", tags=["Duplicate Detection"])

class ExistingArticle(BaseModel):
    id: str
    title: str
    content: str
    slug: Optional[str] = ""

class DuplicateCheckRequest(BaseModel):
    new_title: str
    new_content: str
    existing_articles: List[ExistingArticle]
    threshold: Optional[float] = 0.85

class MatchItem(BaseModel):
    article_id: str
    title: str
    similarity_score: float
    is_duplicate: bool
    verdict: str

class DuplicateCheckResponse(BaseModel):
    highest_similarity: float
    is_duplicate_risk: bool
    status: str
    recommendation: str
    matches: List[MatchItem]

@router.post("/detect-duplicate", response_model=DuplicateCheckResponse)
def detect_duplicate(req: DuplicateCheckRequest):
    if not req.existing_articles:
        return DuplicateCheckResponse(
            highest_similarity=0.0,
            is_duplicate_risk=False,
            status="Unique (No existing articles to compare)",
            recommendation="Safe to publish.",
            matches=[]
        )
        
    new_text = f"{req.new_title} {req.new_content}"
    corpus = [new_text] + [f"{a.title} {a.content}" for a in req.existing_articles]
    
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=3000)
        tfidf_matrix = vectorizer.fit_transform(corpus)
        # Compare 0-th doc (new article) against rest
        sim_scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
    except Exception as e:
        sim_scores = np.zeros(len(req.existing_articles))

    matches = []
    max_sim = 0.0
    
    for i, article in enumerate(req.existing_articles):
        sim = round(float(sim_scores[i]), 3)
        if sim > max_sim:
            max_sim = sim
            
        is_dup = sim >= (req.threshold or 0.85)
        verdict = "Duplicate Risk (>85%)" if is_dup else ("Moderate Similarity" if sim >= 0.50 else "Distinct / Unique")
        
        matches.append(MatchItem(
            article_id=article.id,
            title=article.title,
            similarity_score=sim,
            is_duplicate=is_dup,
            verdict=verdict
        ))
        
    matches.sort(key=lambda x: x.similarity_score, reverse=True)
    
    is_risk = max_sim >= (req.threshold or 0.85)
    status = "Flagged for Review (High Similarity)" if is_risk else ("Distinct & Original" if max_sim < 0.60 else "Safe / Some Overlap")
    rec = (
        f"Flagged for human review. Similarity score is {max_sim * 100:.1f}%, exceeding the {req.threshold * 100:.0f}% threshold with '{matches[0].title if matches else 'existing article'}'."
        if is_risk
        else f"Safe to proceed. Maximum semantic similarity with existing content is {max_sim * 100:.1f}%."
    )
    
    return DuplicateCheckResponse(
        highest_similarity=max_sim,
        is_duplicate_risk=is_risk,
        status=status,
        recommendation=rec,
        matches=matches[:5] # top 5
    )
