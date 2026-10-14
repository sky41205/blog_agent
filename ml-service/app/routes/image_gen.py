from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import random
import re
import urllib.parse
from app.features.text_features import (
    calculate_readability_metrics,
    analyze_headings_structure,
    analyze_keyword_density,
    analyze_sentiment_and_tone
)

router = APIRouter(prefix="/ml", tags=["AI Image & Deep Analysis"])

class ImagePromptRequest(BaseModel):
    topic: str
    excerpt: Optional[str] = ""
    category: Optional[str] = "Technology"
    preferred_style: Optional[str] = "flux_photoreal"

class DeepAnalysisRequest(BaseModel):
    title: str
    content: str
    primary_keyword: Optional[str] = ""
    secondary_keywords: Optional[List[str]] = []
    category: Optional[str] = "Technology"

# Prohibited patterns for gore, death, nudity, weapons in violent contexts, horror
PROHIBITED_PATTERNS = [
    re.compile(r'\b(blood|bloody|bleeding|gore|gory|mutilat\w*|wound\w*|injur\w*|bruis\w*|scars|lacerat\w*|amputat\w*)\b', re.IGNORECASE),
    re.compile(r'\b(corpse\w*|cadaver\w*|dead bod\w*|death scene|killing|murder\w*|slaughter\w*|massacre\w*|decapitat\w*|strangulat\w*|hanging|suicid\w*|fatalit\w*)\b', re.IGNORECASE),
    re.compile(r'\b(nude|nudity|naked|nsfw|porn\w*|erotic\w*|sexual\w*|intercourse|lingerie|underwear|undressed|cleavage|breasts?|genital\w*|bikini|sensual pose|provocative)\b', re.IGNORECASE),
    re.compile(r'\b(gun pointed|shooting at|stab\w*|assault rifle|knife attack|bloodied knife|firearm pointed|execution style)\b', re.IGNORECASE),
    re.compile(r'\b(horror|gruesome|grotesque|nightmar\w*|monstrous|terrifying|ghoul\w*|rotting|decaying|macabre|creepy monster|disturbing scene|zombie\w*)\b', re.IGNORECASE),
    re.compile(r'\b(tortur\w*|agony|suffering victim|screaming in pain|burning alive|choking)\b', re.IGNORECASE)
]

# Figurative title idiom replacements to prevent literal violent interpretation
FIGURATIVE_REPLACEMENTS = [
    (re.compile(r'\b(kill|killing|killer)\s+it\b', re.IGNORECASE), 'achieving breakthrough success'),
    (re.compile(r'\bkill\s+your\b', re.IGNORECASE), 'optimize your'),
    (re.compile(r'\bdeadly\s+mistakes?\b', re.IGNORECASE), 'critical missteps to avoid'),
    (re.compile(r'\bdeadly\s+toll\b', re.IGNORECASE), 'profound socioeconomic impact'),
    (re.compile(r'\bbattleground\b', re.IGNORECASE), 'competitive market space'),
    (re.compile(r'\bslaying\b', re.IGNORECASE), 'outperforming'),
    (re.compile(r'\bcrushing\s+it\b', re.IGNORECASE), 'achieving peak performance'),
    (re.compile(r'\btarget\s+audience\s+hit\b', re.IGNORECASE), 'key audience engagement'),
    (re.compile(r'\bexploding\b', re.IGNORECASE), 'rapidly expanding'),
    (re.compile(r'\bfire\s+your\b', re.IGNORECASE), 'transitioning away from')
]

STANDARD_NEGATIVE_PROMPT = (
    "gore, blood, graphic injuries, open wounds, weapons, death, corpses, dead bodies, "
    "violence, fighting, nudity, nsfw, sexual content, revealing clothing, cleavage, "
    "provocative poses, disturbing imagery, scary, horror, grotesque, macabre, traumatic, "
    "deformed people, distorted limbs, extra fingers, bad anatomy, plastic skin, text, "
    "watermarks, logos, sensationalism"
)

def contains_sensitive_content(text: str) -> bool:
    if not text:
        return False
    for pat in PROHIBITED_PATTERNS:
        if pat.search(text):
            return True
    return False

def audit_and_rewrite_prompt(raw_prompt: str, title: str = "", category: str = "") -> str:
    prompt = raw_prompt.strip()
    title_clean = title.strip()
    
    # 1. Normalize figurative idioms
    for pat, repl in FIGURATIVE_REPLACEMENTS:
        prompt = pat.sub(repl, prompt)
    
    # 2. Check for sensitive/prohibited terms
    flagged = False
    for pat in PROHIBITED_PATTERNS:
        if pat.search(prompt):
            flagged = True
            prompt = pat.sub('', prompt)
    
    # 3. If title or prompt flagged, replace with safe symbolic editorial visual
    if flagged or contains_sensitive_content(title_clean):
        t_low = f"{title_clean} {category}".lower()
        if any(k in t_low for k in ['crime', 'murder', 'investigat', 'homicide', 'court', 'legal', 'law', 'justice']):
            prompt = "Dignified editorial photograph symbolizing legal integrity: modern brass scales of justice resting on an elegant mahogany table beside a sleek tablet displaying forensic analytics, warm morning window light, corporate legal atmosphere, zero violence, zero weapons"
        elif any(k in t_low for k in ['disease', 'virus', 'pandemic', 'cancer', 'illness', 'medical', 'hospital']):
            prompt = "Inspiring, compassionate editorial visual of cutting-edge biomedical innovation: dedicated scientists in clean white lab coats collaborating around an advanced molecular diagnostics interface in a sunlit modern laboratory, natural light, hope and scientific progress, non-graphic, fully clothed"
        elif any(k in t_low for k in ['war', 'conflict', 'geopolitic', 'sanction', 'diplomacy', 'peace']):
            prompt = "Thoughtful diplomatic editorial scene symbolizing international diplomacy and peace: international flags and an elegant negotiation table in a sunlit glass summit pavilion overlooking a calm reflecting pool at dawn, dignified atmosphere, non-violent, symbolic peace"
        elif any(k in t_low for k in ['accident', 'disaster', 'hazard', 'crisis', 'risk mitigation', 'safety']):
            prompt = "Modern conceptual graphic illustrating infrastructure safety engineering and proactive risk mitigation: clean architectural blueprints, digital telemetry sensors, and protective engineering safeguards, sleek minimalist 3D composition, non-graphic, general audience friendly"
        else:
            prompt = f"An award-winning clean editorial photograph representing '{title_clean}': thoughtful professional composition, modern architectural setting, natural ambient lighting, rich authentic textures, fully clothed subjects, respectful, non-graphic, general audience friendly"

    # 4. Mandatory safety guarantees
    safety_suffix = "clean modern editorial style, fully clothed subjects, dignified setting, professional lighting, non-graphic, general audience friendly, 16:9 aspect ratio, 8k resolution"
    if "general audience" not in prompt.lower():
        prompt = f"{prompt.rstrip('.')}, {safety_suffix}."
        
    return re.sub(r'\s+', ' ', prompt).strip()

def build_flux_url(prompt: str, seed: int = None, aspect_ratio: str = "16:9") -> str:
    safe_prompt = audit_and_rewrite_prompt(prompt)
    clean = urllib.parse.quote(safe_prompt[:260])
    neg = urllib.parse.quote(STANDARD_NEGATIVE_PROMPT[:200])
    if aspect_ratio == "1:1":
        w, h = 800, 800
    elif aspect_ratio == "4:3":
        w, h = 1024, 768
    else: # 16:9
        w, h = 1200, 675
    s = seed or random.randint(100000, 999999)
    return f"https://image.pollinations.ai/prompt/{clean}?width={w}&height={h}&model=turbo&seed={s}&nologo=true&negative={neg}"

@router.post("/generate-image-prompts")
def generate_image_prompts(req: ImagePromptRequest):
    topic = req.topic.strip()
    cat = req.category or "Technology"
    base_seed = random.randint(100000, 899999)
    slug = "".join(c if c.isalnum() else "-" for c in topic.lower()).strip("-")
    
    styles = [
        {
            "id": "flux_photoreal",
            "name": "📸 35mm Documentary Photography",
            "style_desc": "Authentic real-world photography with natural lighting, tactile depth, and zero CGI sheen",
            "prompt": audit_and_rewrite_prompt(f"Hyper-realistic editorial photo of {topic}, {cat} concept, studio lighting, depth of field, 8k resolution, award-winning photography", topic, cat),
            "seed": base_seed,
            "url_16_9": build_flux_url(f"Hyper-realistic editorial photo of {topic}, {cat} concept, studio lighting, 8k resolution", base_seed, "16:9"),
            "url_1_1": build_flux_url(f"Hyper-realistic editorial photo of {topic}, {cat} concept, studio lighting, 8k resolution", base_seed, "1:1")
        },
        {
            "id": "3d_isometric",
            "name": "🧊 3D Modern Isometric",
            "style_desc": "Minimalist pastel and vibrant 3D octane render with soft diffuse ambient occlusion",
            "prompt": audit_and_rewrite_prompt(f"3D isometric clean render of {topic}, {cat} workflow, smooth clay and glassmorphism elements, pastel lighting, blender 3D, octane render", topic, cat),
            "seed": base_seed + 1,
            "url_16_9": build_flux_url(f"3D isometric clean render of {topic}, {cat} workflow, glassmorphism, pastel lighting, octane render", base_seed + 1, "16:9"),
            "url_1_1": build_flux_url(f"3D isometric clean render of {topic}, {cat} workflow, glassmorphism, pastel lighting, octane render", base_seed + 1, "1:1")
        },
        {
            "id": "editorial_vector",
            "name": "🎨 Editorial Vector & Flat Art",
            "style_desc": "Sleek tech editorial graphic with modern gradients and wireframe lines",
            "prompt": audit_and_rewrite_prompt(f"Modern editorial vector illustration of {topic}, sleek gradients, flat design, clean geometry, tech magazine cover aesthetic", topic, cat),
            "seed": base_seed + 2,
            "url_16_9": build_flux_url(f"Modern editorial vector illustration of {topic}, sleek gradients, flat design, tech aesthetic", base_seed + 2, "16:9"),
            "url_1_1": build_flux_url(f"Modern editorial vector illustration of {topic}, sleek gradients, flat design, tech aesthetic", base_seed + 2, "1:1")
        },
        {
            "id": "cyberpunk_glow",
            "name": "⚡ Cyberpunk Neon & Dark Future",
            "style_desc": "High-contrast dark mode visualization with luminous neon cyan and violet circuitry",
            "prompt": audit_and_rewrite_prompt(f"Futuristic dark interface representing {topic}, glowing neon cyan and purple data streams, digital neural net, cinematic atmosphere", topic, cat),
            "seed": base_seed + 3,
            "url_16_9": build_flux_url(f"Futuristic dark interface representing {topic}, glowing neon cyan data streams, cinematic atmosphere", base_seed + 3, "16:9"),
            "url_1_1": build_flux_url(f"Futuristic dark interface representing {topic}, glowing neon cyan data streams, cinematic atmosphere", base_seed + 3, "1:1")
        }
    ]
    
    return {
        "status": "success",
        "topic": topic,
        "category": cat,
        "suggested_filename": f"{slug}.webp",
        "alt_text": f"High-impact visual concept representing {topic}",
        "caption": f"Exploring fundamental paradigms of {topic}.",
        "style_presets": styles,
        "primary_image_url": styles[0]["url_16_9"],
        "negative_prompt": STANDARD_NEGATIVE_PROMPT
    }

class HuggingFaceImageRequest(BaseModel):
    prompt: str
    width: Optional[int] = 1024
    height: Optional[int] = 576
    seed: Optional[int] = None
    guidance_scale: Optional[float] = 3.5
    num_inference_steps: Optional[int] = 8

def generate_huggingface_image(prompt: str, seed: Optional[int] = None, width: int = 1024, height: int = 576) -> Optional[Dict[str, Any]]:
    """
    Generate an authentic high-fidelity image using Hugging Face Spaces (FLUX.1-merged / FLUX.1-schnell)
    authenticated with the user's Hugging Face token.
    """
    try:
        from gradio_client import Client
        import base64
        import os
        from app.core.config import HUGGINGFACE_TOKEN
        
        token = HUGGINGFACE_TOKEN or os.getenv("HUGGINGFACE_TOKEN", "")
        clean_prompt = audit_and_rewrite_prompt(prompt)
        eff_seed = seed if (seed is not None) else random.randint(10000, 999999)
        
        client = Client("multimodalart/FLUX.1-merged", headers={"Authorization": f"Bearer {token}"})
        result, actual_seed = client.predict(
            prompt=clean_prompt,
            seed=eff_seed,
            randomize_seed=False,
            width=width,
            height=height,
            guidance_scale=3.5,
            num_inference_steps=8,
            api_name="/infer"
        )
        
        if result and os.path.exists(result):
            with open(result, "rb") as f:
                img_bytes = f.read()
            b64 = base64.b64encode(img_bytes).decode("utf-8")
            return {
                "success": True,
                "provider": "Hugging Face (FLUX.1-merged / FLUX.1-schnell)",
                "seed": actual_seed,
                "local_temp_path": result,
                "base64_data": b64,
                "bytes_len": len(img_bytes),
                "mime_type": "image/webp",
                "dimensions": {"width": width, "height": height, "aspect_ratio": "16:9"}
            }
    except Exception as e:
        print(f"[ML-Service] Hugging Face image generation note: {e}")
        return None

@router.post("/generate-hf-image")
def api_generate_hf_image(req: HuggingFaceImageRequest):
    result = generate_huggingface_image(
        prompt=req.prompt,
        seed=req.seed,
        width=req.width or 1024,
        height=req.height or 576
    )
    if result:
        return result
    return {
        "success": False,
        "error": "Failed to generate image via Hugging Face. Fallback active."
    }

def generate_blog_image(blog_title: str, blog_content: Optional[str] = None, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Reusable Python function meeting requirement 6:
    generate_blog_image(blog_title, blog_content=None)
    """
    options = options or {}
    category = options.get("category", "Technology")
    preferred_style = options.get("preferred_style", "flux_photoreal")
    
    # Extract concepts from title and content (giving title highest priority)
    text = f"{blog_title} {blog_content or ''}".lower()
    
    # Topic domain detection
    if any(k in text for k in ['crime', 'murder', 'investigat', 'homicide', 'court', 'legal', 'law', 'justice', 'forensic']):
        subject = "Modern scales of justice and digital forensic analytics in a prestigious legal library"
        scene = "Dignified editorial photograph symbolizing legal integrity: modern brass scales of justice resting on an elegant mahogany table beside a sleek tablet displaying forensic analytics, warm morning window light, corporate legal atmosphere, zero violence, zero weapons"
    elif any(k in text for k in ['disease', 'virus', 'pandemic', 'cancer', 'illness', 'medical', 'hospital', 'patient']):
        subject = "Dedicated biomedical researchers collaborating around advanced diagnostics in a modern laboratory"
        scene = "Inspiring, compassionate editorial visual of cutting-edge biomedical innovation: dedicated scientists in clean white lab coats collaborating around an advanced molecular diagnostics interface in a sunlit modern laboratory, natural light, hope and scientific progress, non-graphic, fully clothed"
    elif any(k in text for k in ['war', 'conflict', 'geopolitic', 'sanction', 'diplomacy', 'peace']):
        subject = "International diplomatic summit representing global cooperation and peaceful resolution"
        scene = "Thoughtful diplomatic editorial scene symbolizing international diplomacy and peace: international flags and an elegant negotiation table in a sunlit glass summit pavilion overlooking a calm reflecting pool at dawn, dignified atmosphere, non-violent, symbolic peace"
    elif any(k in text for k in ['accident', 'disaster', 'hazard', 'crisis', 'risk mitigation', 'safety']):
        subject = "Infrastructure safety engineering and proactive risk mitigation systems"
        scene = "Modern conceptual graphic illustrating infrastructure safety engineering and proactive risk mitigation: clean architectural blueprints, digital telemetry sensors, and protective engineering safeguards, sleek minimalist 3D composition, non-graphic, general audience friendly"
    elif any(k in text for k in ['fog', 'winter', 'cold wave', 'blanket', 'frost', 'chilly', 'snow', 'mist']):
        subject = "North India grassroots winter relief volunteers distributing warm blankets to families in morning fog"
        scene = "Authentic 35mm documentary photography of community volunteers handing thick warm blankets and hot chai in dense morning fog, soft golden dawn sunlight, 16:9 editorial composition"
    elif any(k in text for k in ['welfare', 'poverty', 'relief', 'grassroots', 'humanitarian', 'donation', 'ngo', 'charity']):
        subject = "Grassroots humanitarian volunteers organizing essential aid and care for families"
        scene = "Heartwarming 35mm documentary photograph of community outreach volunteers distributing relief parcels, genuine human connection, natural morning light"
    elif any(k in text for k in ['human resource', 'hr', 'workforce', 'employee', 'recruitment', 'talent', 'workplace', 'staffing']):
        subject = "Modern diverse workforce and HR leaders collaborating with digital talent analytics"
        scene = "Clean editorial photograph of diverse professionals in a sunlit modern workplace reviewing organizational talent insights on a sleek tablet, collaborative teamwork, natural window light"
    elif any(k in text for k in ['sandal', 'shoe', 'footwear', 'fashion', 'leather']):
        subject = "Artisan contemporary leather footwear and design"
        scene = "High-fashion editorial photography of elegant handcrafted footwear on travertine stone, soft natural lighting"
    elif any(k in text for k in ['dog', 'puppy', 'stray', 'animal', 'pet']):
        subject = "Rescued street puppy receiving compassionate veterinary care outdoors"
        scene = "Candid 35mm documentary photograph of an adorable rescued puppy receiving gentle human care outdoors, soft natural sunlight"
    else:
        subject = f"Authentic visual representation of {blog_title}"
        scene = f"Award-winning modern editorial documentary photography illustrating {blog_title}, natural lighting, clean composition, 16:9 aspect ratio"

    raw_master_prompt = f"{blog_title}. {scene}. Subject: {subject}. 16:9 aspect ratio, 1280x720, modern editorial aesthetic, no watermarks, no distorted objects, 8k resolution"
    master_prompt = audit_and_rewrite_prompt(raw_master_prompt, blog_title, category)
    seed = options.get("seed") or random.randint(100000, 899999)
    slug = "".join(c if c.isalnum() else "-" for c in blog_title.lower()).strip("-")
    
    # Try Hugging Face FLUX generation first
    hf_res = generate_huggingface_image(master_prompt, seed, 1024, 576)
    if hf_res and hf_res.get("success"):
        return {
            "success": True,
            "title": blog_title,
            "provider": hf_res.get("provider"),
            "base64_data": hf_res.get("base64_data"),
            "local_temp_path": hf_res.get("local_temp_path"),
            "alt_text": f"Editorial visual representing {blog_title}",
            "caption": f"Featured visual illustrating {blog_title}",
            "prompt": master_prompt,
            "dimensions": {"width": 1024, "height": 576, "aspect_ratio": "16:9"},
            "style": preferred_style,
            "filename": f"{slug}.webp",
            "negative_prompt": STANDARD_NEGATIVE_PROMPT
        }
    
    image_url = build_flux_url(master_prompt, seed, "16:9")
    
    return {
        "success": True,
        "title": blog_title,
        "url": image_url,
        "alt_text": f"Editorial visual representing {blog_title}",
        "caption": f"Featured visual illustrating {blog_title}",
        "prompt": master_prompt,
        "dimensions": {"width": 1280, "height": 720, "aspect_ratio": "16:9"},
        "style": preferred_style,
        "filename": f"{slug}.webp",
        "negative_prompt": STANDARD_NEGATIVE_PROMPT
    }

@router.post("/deep-analysis")
def deep_analysis(req: DeepAnalysisRequest):
    readability = calculate_readability_metrics(req.content)
    headings = analyze_headings_structure(req.content)
    keywords = analyze_keyword_density(req.content, req.primary_keyword, req.secondary_keywords)
    sentiment = analyze_sentiment_and_tone(req.content)
    
    total_words = readability.get("total_words", 0)
    
    # Calculate Engagement & Virality Matrix
    # Higher readability + good heading structure + balanced length = higher read-through rate
    flesch = readability.get("flesch_reading_ease", 70.0)
    h_score = headings.get("heading_score", 80)
    k_score = keywords.get("density_score", 80)
    
    read_through_rate = min(92.0, max(45.0, round((flesch * 0.4) + (h_score * 0.3) + 25.0, 1)))
    projected_bounce_rate = min(68.0, max(22.0, round(100.0 - read_through_rate - 10.0, 1)))
    
    social_shares = {
        "linkedin": min(95, int(round((sentiment.get("technical_depth_score", 70) * 0.6) + 30))),
        "twitter_x": min(92, int(round((flesch * 0.5) + (k_score * 0.3) + 15))),
        "google_discover": min(96, int(round((h_score * 0.5) + (read_through_rate * 0.4) + 10))),
        "reddit_tech": min(89, int(round(sentiment.get("technical_depth_score", 70) * 0.85)))
    }
    
    overall_quality_score = int(round((flesch * 0.3) + (h_score * 0.25) + (k_score * 0.25) + (sentiment.get("engagement_index", 75) * 0.20)))
    overall_quality_score = max(30, min(99, overall_quality_score))
    
    return {
        "status": "success",
        "title": req.title,
        "quality_score": overall_quality_score,
        "readability_indices": {
            "flesch_reading_ease": readability["flesch_reading_ease"],
            "gunning_fog": readability["gunning_fog"],
            "coleman_liau": readability["coleman_liau"],
            "automated_readability_index": readability["automated_readability_index"],
            "smog_index": readability["smog_index"],
            "reading_grade_level": readability["reading_grade_level"],
            "reading_time_mins": readability["reading_time_mins"]
        },
        "lexical_analysis": {
            "total_words": readability["total_words"],
            "unique_words": keywords.get("unique_words", 0),
            "lexical_diversity_pct": keywords.get("lexical_diversity_pct", 60.0),
            "avg_sentence_length": readability["avg_sentence_length"],
            "avg_syllables_per_word": readability["avg_syllables_per_word"]
        },
        "keyword_spectrum": keywords.get("keywords", []),
        "heading_hierarchy": headings,
        "tone_and_sentiment": sentiment,
        "engagement_virality_matrix": {
            "projected_read_through_rate_pct": read_through_rate,
            "estimated_bounce_rate_pct": projected_bounce_rate,
            "social_virality_by_platform": social_shares,
            "viral_potential_rating": "High" if overall_quality_score >= 85 else ("Moderate" if overall_quality_score >= 70 else "Low")
        }
    }
