import os
import random
import numpy as np
import pandas as pd
from app.core.config import DATASETS_DIR, CATEGORIES

def generate_trend_dataset(num_samples: int = 1500) -> pd.DataFrame:
    """Generates synthetic historical trend metrics dataset."""
    random.seed(42)
    np.random.seed(42)
    
    rows = []
    for i in range(num_samples):
        vol = int(np.random.exponential(scale=8000) + 500)
        growth = float(np.random.normal(loc=35.0, scale=40.0))
        news_freq = int(np.random.poisson(lam=12))
        recency_hrs = float(np.random.uniform(1.0, 72.0))
        social = int(np.random.exponential(scale=3000) + 100)
        hist_interest = float(np.random.uniform(20.0, 95.0))
        competition = float(np.random.uniform(0.15, 0.90))
        niche_rel = float(np.random.uniform(40.0, 100.0))
        
        # Ground truth formulation with some noise
        # Higher volume, higher growth, high news, low recency, high niche -> high trend score
        raw_score = (
            (np.log1p(vol) / 12.0) * 20.0 +
            (np.clip(growth, -50, 200) / 200.0) * 25.0 +
            (min(news_freq, 30) / 30.0) * 15.0 +
            (1.0 - (recency_hrs / 72.0)) * 10.0 +
            (np.log1p(social) / 10.0) * 10.0 +
            (hist_interest / 100.0) * 5.0 +
            (1.0 - competition) * 5.0 +
            (niche_rel / 100.0) * 10.0
        ) + np.random.normal(0, 2.5)
        
        trend_score = float(np.clip(raw_score, 10.0, 99.0))
        
        rows.append({
            "search_volume": vol,
            "search_growth": round(growth, 2),
            "news_frequency": news_freq,
            "recency_hours": round(recency_hrs, 1),
            "social_engagement": social,
            "historical_interest": round(hist_interest, 1),
            "keyword_competition": round(competition, 2),
            "niche_relevance": round(niche_rel, 1),
            "trend_score": round(trend_score, 1)
        })
        
    df = pd.DataFrame(rows)
    df.to_csv(DATASETS_DIR / "trend_detection_data.csv", index=False)
    print(f"[Bootstrap] Generated {len(df)} trend records -> {DATASETS_DIR / 'trend_detection_data.csv'}")
    return df

def generate_relevance_dataset(num_samples: int = 2400) -> pd.DataFrame:
    """Generates synthetic topic relevance dataset for TF-IDF + Classifier."""
    random.seed(42)
    
    tech_positive_topics = [
        ("Agentic AI Workflows and Autonomous LLM Orchestration", "Artificial Intelligence", "agents, llm, reasoning, automation, tools"),
        ("Building Production RAG Pipelines with Vector Databases", "Artificial Intelligence", "rag, vector search, embeddings, pinecone, chroma"),
        ("Deep Learning Model Optimization and Quantization with ONNX", "Machine Learning", "quantization, onnx, inference, tensorrt, latency"),
        ("Next.js 15 Server Actions and App Router Best Practices", "Web Development", "nextjs, react, server actions, webdev, performance"),
        ("Kubernetes Multi-Cluster Management and Service Mesh Strategies", "Cloud Computing", "kubernetes, k8s, istio, cloud, devops, docker"),
        ("Zero Trust Architecture and API Security in Modern Microservices", "Cybersecurity", "zero trust, oauth, jwt, api security, encryption"),
        ("Fine-Tuning Open Source LLMs with LoRA and QLoRA", "Machine Learning", "fine-tuning, lora, llama, huggingface, pytorch"),
        ("Real-Time Data Streaming with Apache Kafka and Flink", "Data Science", "kafka, flink, data streaming, pipeline, analytics"),
        ("Micro-Frontends Architecture with Module Federation in Vite", "Software Development", "micro-frontends, webpack, vite, architecture"),
        ("Graph Neural Networks for Recommendation Systems", "Machine Learning", "gnn, graph embeddings, recommender, deep learning"),
        ("Generative UI and Dynamic AI-Driven User Interfaces", "Web Development", "generative ui, react, ai frontend, design systems"),
        ("Automated CI/CD Pipeline Security with GitHub Actions and SAST", "Cloud Computing", "cicd, devops, github actions, security, docker"),
        ("Prompt Engineering vs Fine-Tuning: Cost & Performance Tradeoffs", "Artificial Intelligence", "prompt engineering, cost, performance, llm"),
        ("High-Throughput Distributed Caching with Redis Cluster", "Software Development", "redis, cache, latency, distributed systems"),
        ("PostgreSQL vs MongoDB: Choosing the Right Database in 2026", "Software Development", "postgresql, mongodb, nosql, sql, database"),
        ("Edge AI and TinyML for IoT Embedded Devices", "Artificial Intelligence", "tinyml, edge computing, iot, sensors, embedded"),
        ("Implementing Event-Driven Architecture with RabbitMQ", "Software Development", "event driven, rabbitmq, message queues, async"),
        ("WebAssembly (Wasm) in the Browser: High Performance Apps", "Web Development", "webassembly, wasm, rust, web performance"),
        ("Ethical AI, Bias Detection, and Model Governance Frameworks", "Tech Trends & Future", "ai ethics, fairness, governance, compliance"),
        ("Quantum Computing Algorithms and Practical Cloud Simulation", "Tech Trends & Future", "quantum, qiskit, quantum algorithms, computing")
    ]
    
    non_relevant_topics = [
        ("Top 10 Healthy Vegan Dinner Recipes for Quick Cooking", "Lifestyle", "recipes, vegan, food, cooking, health"),
        ("Home Gardening: How to Grow Organic Tomatoes on Balcony", "Gardening", "gardening, tomatoes, plants, soil, balcony"),
        ("Best Cardio Workouts for Weight Loss at Home", "Fitness", "cardio, workout, weight loss, gym, fitness"),
        ("Budget Travel Guide to Bali: Beaches and Resorts", "Travel", "travel, bali, vacation, beaches, hotels"),
        ("Beginner Guitar Chords and Strumming Patterns", "Music", "guitar, chords, music, songs, acoustic"),
        ("Interior Design Trends: Minimalist Living Room Decor", "Home", "interior, decor, furniture, living room, modern"),
        ("Dog Training 101: Teaching Basic Commands to Puppies", "Pets", "dogs, puppy, pet training, obedience, tricks"),
        ("DIY Car Maintenance: How to Change Engine Oil and Filters", "Automotive", "car, oil change, maintenance, engine, repair"),
        ("Winter Fashion Outfits and Outerwear Styling Ideas", "Fashion", "fashion, outfits, winter, coats, style"),
        ("Top 5 Romantic Movies to Watch This Weekend", "Entertainment", "movies, cinema, streaming, romance, reviews")
    ]
    
    rows = []
    # Generate balanced samples
    for _ in range(num_samples // 2):
        base_title, cat, kw = random.choice(tech_positive_topics)
        variations = [
            f"{base_title}: Complete 2026 Guide",
            f"Mastering {base_title} in Production",
            f"How to Implement {base_title} Step-by-Step",
            f"Why {base_title} Matters for Modern Engineering",
            f"The Ultimate Guide to {base_title}"
        ]
        chosen_title = random.choice(variations)
        rows.append({
            "title": chosen_title,
            "description": f"In-depth analysis of {chosen_title.lower()} covering architecture, performance, benchmarks, and best practices.",
            "keywords": kw,
            "category": cat,
            "historical_similarity": round(random.uniform(0.65, 0.98), 2),
            "website_niche": "Technology & AI",
            "search_trend": round(random.uniform(60.0, 99.0), 1),
            "user_engagement_hist": round(random.uniform(0.70, 0.95), 2),
            "is_relevant": 1
        })
        
    for _ in range(num_samples // 2):
        base_title, cat, kw = random.choice(non_relevant_topics)
        variations = [
            f"{base_title} for Beginners",
            f"Comprehensive Guide: {base_title}",
            f"Top Secrets for {base_title}",
            f"Everything You Need to Know About {base_title}"
        ]
        chosen_title = random.choice(variations)
        rows.append({
            "title": chosen_title,
            "description": f"Tips and tricks for {chosen_title.lower()} with practical advice for everyday lifestyle.",
            "keywords": kw,
            "category": cat,
            "historical_similarity": round(random.uniform(0.05, 0.35), 2),
            "website_niche": "Technology & AI",
            "search_trend": round(random.uniform(20.0, 70.0), 1),
            "user_engagement_hist": round(random.uniform(0.10, 0.40), 2),
            "is_relevant": 0
        })
        
    random.shuffle(rows)
    df = pd.DataFrame(rows)
    df.to_csv(DATASETS_DIR / "topic_relevance_data.csv", index=False)
    print(f"[Bootstrap] Generated {len(df)} relevance records -> {DATASETS_DIR / 'topic_relevance_data.csv'}")
    return df

def generate_performance_dataset(num_samples: int = 1800) -> pd.DataFrame:
    """Generates synthetic historical blog performance data."""
    random.seed(42)
    np.random.seed(42)
    
    rows = []
    for i in range(num_samples):
        word_count = int(np.random.normal(loc=1300, scale=350))
        word_count = max(500, min(3000, word_count))
        title_length = int(np.random.normal(loc=55, scale=12))
        title_length = max(25, min(95, title_length))
        search_vol = int(np.random.exponential(scale=6000) + 800)
        trend_score = float(np.random.uniform(30.0, 98.0))
        seo_score = float(np.random.uniform(50.0, 99.0))
        readability = float(np.random.uniform(45.0, 90.0))
        day_of_week = random.randint(0, 6) # 0=Mon ... 6=Sun
        hour = random.randint(0, 23)
        cat_hist = float(np.random.uniform(50.0, 95.0))
        kw_count = random.randint(3, 12)
        
        # Best performance correlated with optimal length (1000-1600), strong SEO, high trend score, Tuesday/Thursday afternoon
        day_boost = 1.25 if day_of_week in [1, 2, 3] else (0.85 if day_of_week in [5, 6] else 1.0)
        hour_boost = 1.30 if 14 <= hour <= 20 else (0.70 if hour < 6 else 1.0)
        length_penalty = 1.0 - min(1.0, abs(word_count - 1350) / 2000.0)
        
        base_views = (
            (np.log1p(search_vol) * 350.0) +
            (trend_score * 35.0) +
            (seo_score * 28.0) +
            (readability * 15.0) +
            (cat_hist * 20.0)
        ) * day_boost * hour_boost * (0.8 + 0.4 * length_penalty)
        
        views = int(max(200, base_views + np.random.normal(0, 300)))
        ctr = round(float(np.clip(0.02 + (seo_score / 100.0) * 0.06 + np.random.normal(0, 0.005), 0.01, 0.15)), 4)
        engagement_prob = round(float(np.clip(0.35 + (readability / 100.0) * 0.40 + (seo_score / 100.0) * 0.20 + np.random.normal(0, 0.04), 0.15, 0.98)), 3)
        reading_time_mins = round((word_count / 220.0) * float(np.clip(engagement_prob * 1.2, 0.5, 1.1)), 1)
        performance_score = int(np.clip((views / 75.0) + (engagement_prob * 40.0) + (ctr * 200.0), 15, 99))
        
        rows.append({
            "word_count": word_count,
            "title_length": title_length,
            "search_volume": search_vol,
            "trend_score": round(trend_score, 1),
            "seo_score": round(seo_score, 1),
            "readability_score": round(readability, 1),
            "day_of_week": day_of_week,
            "hour": hour,
            "category_hist_score": round(cat_hist, 1),
            "keyword_count": kw_count,
            "predicted_views": views,
            "ctr": ctr,
            "engagement_probability": engagement_prob,
            "avg_reading_time": reading_time_mins,
            "performance_score": performance_score
        })
        
    df = pd.DataFrame(rows)
    df.to_csv(DATASETS_DIR / "blog_performance_data.csv", index=False)
    print(f"[Bootstrap] Generated {len(df)} performance records -> {DATASETS_DIR / 'blog_performance_data.csv'}")
    return df

def generate_publishing_time_dataset(num_samples: int = 3600) -> pd.DataFrame:
    """Generates synthetic hourly/daily publishing performance matrix."""
    random.seed(42)
    np.random.seed(42)
    
    rows = []
    for day in range(7):
        for hr in range(24):
            for cat in CATEGORIES:
                # Tech readers peak Tue-Thu 10am-12pm and 6pm-9pm
                day_weight = 1.35 if day in [1, 2, 3] else (1.1 if day in [0, 4] else 0.75)
                if 17 <= hr <= 20:
                    hr_weight = 1.50
                elif 9 <= hr <= 12:
                    hr_weight = 1.35
                elif 13 <= hr <= 16:
                    hr_weight = 1.15
                elif 0 <= hr <= 5:
                    hr_weight = 0.35
                else:
                    hr_weight = 0.85
                    
                score = round(float(np.clip(50.0 * day_weight * hr_weight + np.random.normal(0, 4), 10.0, 99.0)), 1)
                rows.append({
                    "day_of_week": day,
                    "hour": hr,
                    "category": cat,
                    "traffic_score": score
                })
                
    df = pd.DataFrame(rows)
    df.to_csv(DATASETS_DIR / "publishing_time_data.csv", index=False)
    print(f"[Bootstrap] Generated {len(df)} publishing time records -> {DATASETS_DIR / 'publishing_time_data.csv'}")
    return df

def bootstrap_all():
    print("[Bootstrap] Generating all initial training datasets...")
    generate_trend_dataset()
    generate_relevance_dataset()
    generate_performance_dataset()
    generate_publishing_time_dataset()
    print("[Bootstrap] Datasets bootstrap complete!")

if __name__ == "__main__":
    bootstrap_all()
