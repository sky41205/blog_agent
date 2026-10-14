import re
import math
from typing import Dict, Any, List

def count_syllables(word: str) -> int:
    word = word.lower()
    if len(word) <= 3:
        return 1
    word = re.sub(r'(?:[^laeiouy]|ed|es|e)$', '', word)
    word = re.sub(r'^y', '', word)
    matches = re.findall(r'[aeiouy]{1,2}', word)
    return max(1, len(matches))

def calculate_readability_metrics(text: str) -> Dict[str, Any]:
    """Calculates comprehensive multi-index readability: Flesch, Gunning Fog, Coleman-Liau, ARI, SMOG."""
    if not text or len(text.strip()) == 0:
        return {
            "flesch_reading_ease": 70.0,
            "gunning_fog": 8.0,
            "coleman_liau": 9.0,
            "automated_readability_index": 8.5,
            "smog_index": 8.2,
            "reading_grade_level": "Standard / High School",
            "avg_sentence_length": 14.0,
            "avg_syllables_per_word": 1.4,
            "readability_score": 75.0,
            "total_words": 0,
            "total_sentences": 0,
            "reading_time_mins": 0.0
        }
    
    # Strip markdown symbols for clean text analysis
    clean_text = re.sub(r'#|\*|_|`|>|\[.*?\]\(.*?\)', ' ', text)
    sentences = [s.strip() for s in re.split(r'[.!?]+', clean_text) if len(s.strip()) > 0]
    words = [w.strip().lower() for w in re.findall(r'\b[A-Za-z0-9\'-]+\b', clean_text) if len(w.strip()) > 0]
    
    total_sentences = max(1, len(sentences))
    total_words = max(1, len(words))
    total_chars = sum(len(w) for w in words)
    
    syllable_counts = [count_syllables(w) for w in words]
    total_syllables = sum(syllable_counts)
    complex_words = sum(1 for c in syllable_counts if c >= 3)
    
    words_per_sentence = total_words / total_sentences
    syllables_per_word = total_syllables / total_words
    pct_complex_words = (complex_words / total_words) * 100.0
    
    # 1. Flesch Reading Ease Formula = 206.835 - (1.015 * ASL) - (84.6 * ASW)
    flesch = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    flesch = max(0.0, min(100.0, round(flesch, 1)))
    
    # 2. Gunning Fog Index = 0.4 * ( (words/sentences) + 100 * (complex_words/words) )
    gunning_fog = 0.4 * (words_per_sentence + pct_complex_words)
    gunning_fog = max(1.0, min(20.0, round(gunning_fog, 1)))
    
    # 3. Coleman-Liau Index = 0.0588 * L - 0.296 * S - 15.8
    # L = avg letters per 100 words, S = avg sentences per 100 words
    L = (total_chars / total_words) * 100.0
    S = (total_sentences / total_words) * 100.0
    coleman_liau = max(1.0, min(20.0, round(0.0588 * L - 0.296 * S - 15.8, 1)))
    
    # 4. Automated Readability Index (ARI) = 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
    ari = max(1.0, min(20.0, round(4.71 * (total_chars / total_words) + 0.5 * words_per_sentence - 21.43, 1)))
    
    # 5. SMOG Index = 1.0430 * sqrt(complex_words * (30 / sentences)) + 3.1291
    smog_raw = 1.0430 * math.sqrt(max(1, complex_words * (30.0 / total_sentences))) + 3.1291
    smog = max(1.0, min(20.0, round(smog_raw, 1)))
    
    # Reading Grade Level mapping
    if flesch >= 80:
        grade = "Easy (6th-7th Grade)"
    elif flesch >= 60:
        grade = "Standard (8th-9th Grade - Optimal for Web)"
    elif flesch >= 40:
        grade = "Fairly Difficult (College / Technical)"
    else:
        grade = "Difficult (Academic / Research Paper)"
        
    reading_time_mins = round(total_words / 225.0, 1) # Avg 225 WPM
    
    return {
        "flesch_reading_ease": flesch,
        "gunning_fog": gunning_fog,
        "coleman_liau": coleman_liau,
        "automated_readability_index": ari,
        "smog_index": smog,
        "reading_grade_level": grade,
        "avg_sentence_length": round(words_per_sentence, 1),
        "avg_syllables_per_word": round(syllables_per_word, 2),
        "readability_score": round(flesch, 1),
        "total_words": total_words,
        "total_sentences": total_sentences,
        "reading_time_mins": reading_time_mins
    }

def analyze_headings_structure(text: str) -> Dict[str, Any]:
    """Inspects H1, H2, H3 heading hierarchy in markdown content."""
    h1_matches = re.findall(r'^#\s+(.+)$', text, re.MULTILINE)
    h2_matches = re.findall(r'^##\s+(.+)$', text, re.MULTILINE)
    h3_matches = re.findall(r'^###\s+(.+)$', text, re.MULTILINE)
    
    h1_count = len(h1_matches)
    h2_count = len(h2_matches)
    h3_count = len(h3_matches)
    
    score = 100
    issues = []
    
    if h1_count == 0:
        score -= 20
        issues.append("Missing main H1 title heading.")
    elif h1_count > 1:
        score -= 10
        issues.append(f"Multiple H1 headings ({h1_count}) found; recommend exactly one primary H1.")
        
    if h2_count < 2:
        score -= 25
        issues.append(f"Only {h2_count} H2 section headings found; recommend at least 3-5 major sections.")
        
    faq_present = bool(re.search(r'##\s*(?:Frequently Asked Questions|FAQ)', text, re.IGNORECASE))
    conclusion_present = bool(re.search(r'##\s*(?:Conclusion|Key Takeaways|Final Thoughts|Summary)', text, re.IGNORECASE))
    
    if not faq_present:
        score -= 10
        issues.append("Consider adding a FAQ section for SEO rich snippets.")
    if not conclusion_present:
        score -= 10
        issues.append("Consider adding a clear Conclusion / Key Takeaways section.")
        
    return {
        "h1_count": h1_count,
        "h2_count": h2_count,
        "h3_count": h3_count,
        "faq_present": faq_present,
        "conclusion_present": conclusion_present,
        "heading_score": max(20, min(100, score)),
        "issues": issues
    }

def analyze_keyword_density(text: str, primary_keyword: str = "", secondary_keywords: List[str] = None) -> Dict[str, Any]:
    """Calculates keyword frequency, density percentage, and warns against keyword stuffing."""
    if not text:
        return {"density_score": 50, "keywords": [], "issues": [], "lexical_diversity_pct": 50.0}
        
    clean_text = re.sub(r'#|\*|_|`|>|\[.*?\]\(.*?\)', ' ', text).lower()
    words = [w.strip() for w in re.findall(r'\b[A-Za-z0-9\'-]+\b', clean_text) if len(w.strip()) > 0]
    total_words = max(1, len(words))
    
    keywords_to_check = []
    if primary_keyword:
        keywords_to_check.append({"keyword": primary_keyword.lower(), "is_primary": True})
    if secondary_keywords:
        for sk in secondary_keywords:
            if sk and sk.lower() not in [k["keyword"] for k in keywords_to_check]:
                keywords_to_check.append({"keyword": sk.lower(), "is_primary": False})
                
    keyword_stats = []
    issues = []
    score = 100
    
    for item in keywords_to_check:
        kw = item["keyword"]
        count = len(re.findall(r'\b' + re.escape(kw) + r'\b', clean_text))
        kw_word_count = len(kw.split())
        density = ((count * kw_word_count) / total_words) * 100.0
        
        status = "Optimal"
        if count == 0:
            status = "Missing"
            if item["is_primary"]:
                score -= 30
                issues.append(f"Primary keyword '{kw}' does not appear in the body.")
            else:
                score -= 10
        elif density > 3.0:
            status = "Keyword Stuffing Risk (>3.0%)"
            score -= 25
            issues.append(f"Keyword '{kw}' has high density ({density:.2f}%); risk of search engine penalty.")
        elif density < 0.5 and item["is_primary"]:
            status = "Low Density (<0.5%)"
            score -= 10
            issues.append(f"Primary keyword '{kw}' density is low ({density:.2f}%). Recommended: 1.0% - 2.5%.")
            
        keyword_stats.append({
            "keyword": kw,
            "count": count,
            "density_pct": round(density, 2),
            "is_primary": item["is_primary"],
            "status": status
        })
        
    # Vocabulary diversity (Type-Token Ratio & Shannon Entropy proxy)
    unique_words = len(set(words))
    ttr = (unique_words / total_words) if total_words > 0 else 0
    lexical_diversity = round(ttr * 100.0, 1)
    
    return {
        "density_score": max(20, min(100, score)),
        "keywords": keyword_stats,
        "lexical_diversity_pct": lexical_diversity,
        "total_words": total_words,
        "unique_words": unique_words,
        "issues": issues
    }

def analyze_sentiment_and_tone(text: str) -> Dict[str, Any]:
    """Analyzes tone, subjectivity, and technical depth."""
    technical_terms = [
        "architecture", "algorithm", "benchmark", "framework", "latency", 
        "optimization", "infrastructure", "pipeline", "scalability", "microservice",
        "api", "database", "vector", "deployment", "regression", "neural"
    ]
    positive_terms = ["effective", "best", "boost", "superior", "proven", "efficient", "breakthrough", "success", "innovative"]
    
    clean_lower = text.lower()
    tech_count = sum(1 for term in technical_terms if term in clean_lower)
    pos_count = sum(1 for term in positive_terms if term in clean_lower)
    
    if tech_count >= 5:
        tone = "Technical & Authoritative"
    elif pos_count >= 4:
        tone = "Inspiring & Practical"
    else:
        tone = "Informative & Balanced"
        
    return {
        "detected_tone": tone,
        "technical_depth_score": min(98, 50 + (tech_count * 6)),
        "engagement_index": min(95, 60 + (pos_count * 4) + (tech_count * 3))
    }
