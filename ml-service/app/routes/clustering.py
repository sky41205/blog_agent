from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import numpy as np

router = APIRouter(prefix="/ml", tags=["Topic Clustering"])

class TopicItem(BaseModel):
    id: Optional[str] = ""
    title: str
    category: Optional[str] = "Tech"
    trend_score: Optional[float] = 70.0

class ClusterRequest(BaseModel):
    topics: List[TopicItem]
    n_clusters: Optional[int] = None

class ClusterGroup(BaseModel):
    cluster_id: int
    name: str
    keywords: List[str]
    topics_count: int
    avg_trend_score: float
    topic_titles: List[str]

class ClusterResponse(BaseModel):
    total_clusters: int
    total_topics: int
    clusters: List[ClusterGroup]

@router.post("/cluster-topics", response_model=ClusterResponse)
def cluster_topics(req: ClusterRequest):
    if not req.topics or len(req.topics) < 2:
        return ClusterResponse(
            total_clusters=1,
            total_topics=len(req.topics),
            clusters=[
                ClusterGroup(
                    cluster_id=0,
                    name="General AI & Tech",
                    keywords=["ai", "technology", "development"],
                    topics_count=len(req.topics),
                    avg_trend_score=round(float(np.mean([t.trend_score for t in req.topics]) if req.topics else 75.0), 1),
                    topic_titles=[t.title for t in req.topics]
                )
            ]
        )
        
    titles = [t.title for t in req.topics]
    k = req.n_clusters or min(5, max(2, len(titles) // 3))
    
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=1000)
        X = vectorizer.fit_transform(titles)
        
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)
        
        feature_names = vectorizer.get_feature_names_out()
        order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
        
        cluster_groups = []
        for i in range(k):
            cluster_topic_indices = [idx for idx, label in enumerate(labels) if label == i]
            if not cluster_topic_indices:
                continue
                
            cluster_topics = [req.topics[idx] for idx in cluster_topic_indices]
            cluster_titles = [t.title for t in cluster_topics]
            avg_trend = round(float(np.mean([t.trend_score or 70.0 for t in cluster_topics])), 1)
            
            # Top keywords from centroid
            top_keywords = [feature_names[ind] for ind in order_centroids[i, :4] if ind < len(feature_names)]
            cluster_name = " + ".join([kw.capitalize() for kw in top_keywords[:2]]) or f"Cluster {i+1}"
            
            cluster_groups.append(ClusterGroup(
                cluster_id=i,
                name=cluster_name,
                keywords=top_keywords,
                topics_count=len(cluster_topics),
                avg_trend_score=avg_trend,
                topic_titles=cluster_titles
            ))
            
        cluster_groups.sort(key=lambda x: x.avg_trend_score, reverse=True)
        return ClusterResponse(
            total_clusters=len(cluster_groups),
            total_topics=len(req.topics),
            clusters=cluster_groups
        )
    except Exception as e:
        # Fallback grouping
        return ClusterResponse(
            total_clusters=1,
            total_topics=len(req.topics),
            clusters=[
                ClusterGroup(
                    cluster_id=0,
                    name="AI & Engineering Intelligence",
                    keywords=["ai", "cloud", "engineering"],
                    topics_count=len(req.topics),
                    avg_trend_score=round(float(np.mean([t.trend_score or 75.0 for t in req.topics])), 1),
                    topic_titles=titles
                )
            ]
        )
