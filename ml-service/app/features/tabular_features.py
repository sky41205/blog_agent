import numpy as np
import pandas as pd
from typing import Dict, Any, List

def extract_trend_features(data: Dict[str, Any]) -> np.ndarray:
    """Extracts numerical features for trend prediction."""
    # [search_volume, search_growth_pct, news_frequency, recency_hours, social_engagement, historical_interest, keyword_competition, niche_relevance]
    search_volume = float(data.get("search_volume", 5000))
    search_growth = float(data.get("search_growth", 25.0)) # percentage
    news_freq = float(data.get("news_frequency", 10))
    recency_hours = float(data.get("recency_hours", 24))
    social_engagement = float(data.get("social_engagement", 1500))
    historical_interest = float(data.get("historical_interest", 50)) # 0-100
    keyword_competition = float(data.get("keyword_competition", 0.45)) # 0.0 - 1.0
    niche_relevance = float(data.get("niche_relevance", 85.0)) # 0-100
    
    # Normalize / scale features
    norm_vol = np.log1p(search_volume) / 12.0
    norm_growth = np.clip(search_growth / 100.0, -1.0, 3.0)
    norm_news = np.log1p(news_freq) / 5.0
    norm_recency = np.clip(1.0 - (recency_hours / 168.0), 0.0, 1.0)
    norm_social = np.log1p(social_engagement) / 10.0
    norm_hist = historical_interest / 100.0
    norm_comp = 1.0 - keyword_competition # lower competition is better opportunity
    norm_niche = niche_relevance / 100.0
    
    return np.array([
        norm_vol,
        norm_growth,
        norm_news,
        norm_recency,
        norm_social,
        norm_hist,
        norm_comp,
        norm_niche
    ]).reshape(1, -1)

def extract_performance_features(data: Dict[str, Any]) -> np.ndarray:
    """Extracts features for blog performance prediction."""
    word_count = float(data.get("word_count", 1200))
    title_length = float(data.get("title_length", 55))
    search_volume = float(data.get("search_volume", 5000))
    trend_score = float(data.get("trend_score", 75.0))
    seo_score = float(data.get("seo_score", 85.0))
    readability_score = float(data.get("readability_score", 70.0))
    day_of_week = float(data.get("day_of_week", 2)) # 0=Mon, 1=Tue, ...
    hour = float(data.get("hour", 14)) # 0-23
    category_hist_score = float(data.get("category_hist_score", 75.0))
    keyword_count = float(data.get("keyword_count", 5))
    
    return np.array([
        word_count / 2000.0,
        title_length / 100.0,
        np.log1p(search_volume) / 12.0,
        trend_score / 100.0,
        seo_score / 100.0,
        readability_score / 100.0,
        day_of_week / 6.0,
        hour / 23.0,
        category_hist_score / 100.0,
        keyword_count / 15.0
    ]).reshape(1, -1)
