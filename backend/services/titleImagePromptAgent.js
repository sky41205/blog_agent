/**
 * Specialized AI Agent: Title-Driven Image Prompt Engineer & Visual Director
 * Mission:
 * Ingest any blog title chosen by the user and formulate an exquisite, 100% relevant,
 * cinematic image prompt specifically tailored for modern Image Makers
 * (Imagen 3, Flux 1.1 Pro, Midjourney v6, DALL-E 3, Stable Diffusion XL).
 */

const axios = require('axios');
const urllib = require('querystring');
const { AIProviderFactory, prompts } = require('./ai/aiProvider');
const GeminiService = require('./ai/geminiService');
const imageService = require('./imageService');
const visualSafetyService = require('./visualSafetyService');

// Specialized sub-niche physical subject descriptors tailored for title matching
const TITLE_DOMAIN_METAPHORS = {
  // 1. Animal Welfare & Street Dogs
  dogs_rescue: {
    match: ['dog', 'puppy', 'stray', 'animal welfare', 'animal rescue', 'veterinary', 'rabies', 'feeding drive'],
    subject: "Rescued street puppy receiving compassionate veterinary care outdoors",
    scene: "Candid 35mm documentary photography of an adorable rescued street puppy receiving gentle veterinary first-aid and care from an empathetic volunteer outdoors, soft natural morning sunlight, warm earth tones, shallow depth of field, authentic emotional bond, 85mm f/1.4 lens, natural fur texture, genuine documentary realism, no cartoon",
    isometric: "3D isometric miniature diorama of a modern outdoor animal veterinary clinic, playful puppies, lush green turf, soft clay and glass textures, pastel lighting, Blender 3D render",
    vector: "Clean editorial flat vector illustration of an animal rescue shelter, volunteer caring for a dog, modern geometric shapes, warm pastel color palette, tech magazine cover style",
    cyber: "Futuristic veterinary scanning pod for animal health diagnostics, glowing soft cyan biometric HUD, warm ambient lighting, holographic status indicators, cinematic realism",
    macro: "Close-up macro detail of a rescued puppy's gentle eyes, glistening natural light reflection, high fidelity fur detail, shallow focus"
  },

  // 2. Slum Education & Child Literacy
  education_children: {
    match: ['tuition', 'classroom', 'child', 'children', 'student', 'school', 'education', 'slum', 'literacy', 'stem'],
    subject: "Inspiring outdoor community classroom for underprivileged children",
    scene: "Inspiring 35mm documentary photography of enthusiastic school children in an after-school community classroom, open notebooks, colorful pencils, warm wooden benches, sunlight streaming through open windows, joyful and determined expressions, natural depth of field, authentic Indian grassroots education setting, 50mm f/1.8 lens",
    isometric: "3D isometric educational study center, miniature wooden desks, floating digital tablets, open books, soft warm ambient lighting, clean low-poly aesthetic, Octane render",
    vector: "Modern editorial graphic of a digital classroom, students learning with tablets, vibrant gradient background, clean vector lines, educational publication aesthetic",
    cyber: "Futuristic digital academy interface, holographic educational modules floating above a student's tablet, warm ambient glow, clean dark interface",
    macro: "Macro shot of a child's hand carefully writing equations in a fresh notebook, soft afternoon sunlight, paper fiber texture, sharp focus"
  },

  // 3. Women Empowerment & Rural Enterprise
  women_empowerment: {
    match: ['women', 'female', 'self-help', 'shg', 'girl', 'rural women', 'empowerment', 'freelancing', 'micro-enterprise'],
    subject: "Empowered women collaborating in a modern vocational cooperative",
    scene: "Candid medium-format photograph of confident Indian women collaborating in a vibrant textile and digital craft workshop, bright colorful traditional fabrics, natural expressions of leadership and independence, warm golden-hour side lighting, Hasselblad H6D-100c, 85mm lens, genuine community pride",
    isometric: "3D isometric women-led cooperative studio, miniature loom, laptops, artisan crafts, soft ambient occlusion, pastel tones, 3D clay aesthetic",
    vector: "Bold editorial vector illustration celebrating female entrepreneurship, stylized figures collaborating, bright uplifting colors, modern flat design",
    cyber: "Modern digital workspace showcasing women leaders in technology, clean glass displays, subtle violet and rose ambient neon accents, elegant composition",
    macro: "Detailed close-up of skilled hands weaving intricate golden thread alongside a modern digital tablet, tangible craftsmanship and innovation"
  },

  // 4. Hunger Relief & Community Kitchens
  hunger_relief: {
    match: ['hunger', 'kitchen', 'meal', 'food', 'feeding', 'nutrition', 'poverty', 'food security'],
    subject: "Warm community kitchen serving wholesome nutritious meals",
    scene: "Heartwarming documentary photograph inside a bustling grassroots community kitchen, large gleaming stainless steel pots with steaming nutritious lentils and rice, volunteer hands serving hot meals with deep dignity and warmth, soft natural daylight, genuine smiles and gratitude, 35mm lens, realistic documentary depth",
    isometric: "3D isometric community kitchen and food pantry, miniature stainless steel counters, fresh vegetables, warm diffuse lighting, clean isometric composition",
    vector: "Flat modern editorial graphic representing grassroots hunger relief, hands sharing a bowl of food, warm yellow and green tones, clean geometric lines",
    cyber: "High-tech automated food distribution hub, sleek refrigerated storage units, subtle green freshness indicator lights, futuristic logistics interface",
    macro: "Close-up of freshly harvested golden grains and steaming nutritious food in a rustic brass bowl, shallow depth of field, tactile food texture"
  },

  // 5. Miyawaki Afforestation & Urban Trees
  miyawaki_forests: {
    match: ['miyawaki', 'forest', 'tree', 'plantation', 'sapling', 'greenery', 'biodiversity', 'reforestation', 'canopy'],
    subject: "Dense thriving Miyawaki micro-forest amidst modern urban architecture",
    scene: "Breathtaking 35mm documentary photograph of a dense multi-layered Miyawaki micro-forest flourishing beside a contemporary urban cityscape, rich green native Neem and Peepal canopy, glistening morning dew on fresh leaves, sunlight piercing through branches with volumetric god-rays, 24mm wide angle, vivid ecological restoration",
    isometric: "3D isometric lush micro-forest floating island, miniature skyscraper adjacent to dense multi-tiered woodland, morning sun, Blender 3D octane render",
    vector: "Modern ecological vector poster, stylized urban skyline transforming into rich green trees, crisp minimalist geometry, environmental journal cover style",
    cyber: "Bio-integrated futuristic city with vertical forests, holographic environmental sensors monitoring tree health, subtle emerald luminescent veins",
    macro: "Extreme macro of a fresh green sapling sprouting from rich fertile dark soil, single water droplet reflecting the morning sun, razor-sharp focus"
  },

  // 6. River Rejuvenation & Clean Water
  river_water: {
    match: ['river', 'water', 'gomti', 'ganga', 'lake', 'rainwater', 'aquifer', 'groundwater', 'clean water'],
    subject: "Restored pristine freshwater riverbank reflecting the sky",
    scene: "Serene atmospheric landscape photograph of a clean, revitalized freshwater riverbank at dawn, gentle ripples reflecting pastel dawn sky, native reeds and blooming wetland flora along the shore, soft morning mist hovering over clean flowing water, natural panoramic depth, Sony A7R V, 35mm lens, crisp environmental clarity",
    isometric: "3D isometric rainwater harvesting and urban river filtration facility, clear blue water reservoirs, filtration layers, clean architectural render",
    vector: "Minimalist editorial vector art of a winding clean river through a green landscape, harmonious blue and emerald gradients, sleek editorial style",
    cyber: "High-tech water purification telemetry center, transparent conduits of glowing purified water, blue and aquamarine LED monitors, clean futuristic facility",
    macro: "Macro capture of crystal-clear river water droplets cascading over polished riverbed pebbles, sun sparkles, pristine purity"
  },

  // 7. Urban Air Pollution & Clean Skies
  air_pollution: {
    match: ['smog', 'air pollution', 'aqi', 'clean air', 'pollution', 'particulate', 'pm2.5', 'clean sky'],
    subject: "Dramatic transition from urban smog to crisp pure atmospheric air",
    scene: "Compelling cinematic photograph capturing the contrast between a smog-veiled city skyline in the distance and a vibrant foreground of rooftop green canopies and air-purifying plants, morning sunlight breaking through haze, atmospheric realism, Hasselblad 50mm lens, thought-provoking editorial atmosphere",
    isometric: "3D isometric urban air purification tower surrounded by residential blocks, clean airflow vortex lines, pastel teal and charcoal palette, Octane render",
    vector: "Editorial vector graphic illustrating clean air solutions, stylized city silhouette with flowing clean wind currents, modern minimalist aesthetic",
    cyber: "Futuristic atmospheric filtration grid overlooking a megacity skyline, subtle azure air-flow laser grids, high-contrast dark cyberpunk ambiance",
    macro: "Macro photograph of green leaf stomata purifying moisture droplets in crisp air, pristine micro-details, natural science aesthetic"
  },

  // 8. Artificial Intelligence & Multi-Agent Systems
  ai_agents: {
    match: ['agent', 'agentic', 'multi-agent', 'orchestration', 'llm', 'autonomous', 'workflow', 'reasoning', 'gpt', 'deepseek', 'neural'],
    subject: "Next-gen autonomous multi-agent orchestration and computational intelligence",
    scene: "Sleek architectural visual of a high-performance computational serverless control center, high-density server blades with pulsing electric blue fiber-optic interconnects, subtle glass reflection displaying interconnected multi-agent graph nodes, cinematic lighting, volumetric atmosphere, 8K photorealism, professional tech magazine cover",
    isometric: "3D isometric orchestration flowchart with floating glass cubes, glowing neural nodes passing tasks, modern clay and frosted glass textures, octane render",
    vector: "Minimalist tech vector graphic representing autonomous AI agent networks, sleek cyan and purple node connections, crisp dark mode geometry",
    cyber: "Luminous dark-mode neural matrix, floating holographic nodes synchronizing autonomous agent threads, electric cyan and ultraviolet circuitry",
    macro: "Extreme macro of a precision silicon AI accelerator die, microscopic gold circuit pathways reflecting ambient indigo and amber studio light"
  },

  // 9. RAG, Vector Search & Knowledge Graphs
  rag_vector: {
    match: ['rag', 'vector', 'embedding', 'search', 'knowledge graph', 'retrieval', 'bm25', 'database'],
    subject: "High-dimensional vector search and semantic knowledge graph",
    scene: "Cinematic photograph of a high-tech data visualization display, multi-dimensional semantic clustering graph floating in dark space with glowing golden and cyan data clusters, clean modern glass desk in foreground with mechanical keyboard, 85mm f/1.8 lens, subtle background bokeh",
    isometric: "3D isometric multidimensional vector space, colorful data clusters interconnected with laser-thin lines, frosted glass pedestals, modern 3D render",
    vector: "Clean editorial vector illustration of a knowledge graph, floating nodes, interconnected data webs, elegant gradient color palette, tech magazine aesthetic",
    cyber: "High-density holographic data sphere with thousands of glowing semantic embeddings, deep violet and cyan light rays, futuristic archive feel",
    macro: "Macro capture of fiber-optic light threads carrying laser pulses into a prism, pristine chromatic dispersion, tangible optical precision"
  },

  // 10. Web Development, React, Vite & Micro-Frontends
  web_development: {
    match: ['web', 'vite', 'micro-frontend', 'react', 'next.js', 'frontend', 'javascript', 'css', 'module federation'],
    subject: "Modern high-end web engineering workspace and modular frontend code",
    scene: "Sleek ultra-clean developer workstation at dusk, curved ultra-wide monitor displaying modular code components and live interactive browser preview, mechanical keyboard with subtle backlight, ceramic coffee cup, warm amber ambient desk lamp contrasting with cool cyan monitor glow, 50mm f/1.4 lens, shallow depth of field, authentic engineering vibe",
    isometric: "3D isometric web developer desk, modular floating UI cards, miniature laptop, coffee cup, houseplant, pastel and dark slate aesthetic, Octane 3D",
    vector: "Modern editorial graphic of web application architecture, interlocking component blocks, clean flat design, sleek gradients, developer portal cover",
    cyber: "Futuristic holographic user interface floating above a dark glass desk, interactive modular widgets glowing in soft emerald and cyan",
    macro: "Macro detail of crisp code syntax on a high-DPI dark display, vibrant syntax highlighting, mechanical key switch in foreground"
  },

  // 11. Cybersecurity, Zero Trust & API Security
  cybersecurity: {
    match: ['security', 'zero trust', 'oauth', 'token', 'exploit', 'vulnerability', 'hack', 'auth', 'passkey', 'fido2', 'encryption'],
    subject: "Resilient zero-trust cryptographic defense and cyber operations",
    scene: "Atmospheric operations center display visualizing real-time threat neutralization, multi-layered glowing digital security shields, sleek dark workstations, server status monitors in background with emerald indicators, cinematic lighting, 85mm lens, intense yet disciplined cybersecurity mood",
    isometric: "3D isometric cryptographic vault with floating digital padlock and encrypted keycards, smooth frosted glass, soft ambient glow, modern 3D",
    vector: "Minimalist cyber defense vector poster, stylized geometric shield safeguarding digital pathways, bold cobalt blue and white contrast",
    cyber: "High-contrast dark cybersecurity matrix, glowing neon cyan cryptographic cipher stream, digital biometric fingerprint scanner glowing amber",
    macro: "Macro close-up of a precision hardware security key plugged into a brushed aluminum laptop port, subtle status LED glowing steady green"
  },

  // 12. Cloud Microservices, Kubernetes & OpenTelemetry
  cloud_devops: {
    match: ['cloud', 'kubernetes', 'microservice', 'docker', 'opentelemetry', 'devops', 'observability', 'kafka', 'serverless'],
    subject: "Distributed resilient cloud architecture and real-time observability",
    scene: "Awe-inspiring view down a modern datacenter corridor, endless racks of enterprise servers with rhythmic blinking status LEDs, glowing blue underfloor illumination, pristine cable routing, cool atmospheric vapor, wide angle 20mm lens, immense scale and precision engineering",
    isometric: "3D isometric distributed microservices cloud, modular server clusters communicating via pulsing data pipes, clean architectural rendering",
    vector: "Editorial vector diagram of event-driven cloud pipeline, clean geometric containers, fluid gradient arrows, modern tech journal aesthetic",
    cyber: "Futuristic cloud command hub, panoramic wall of telemetry graphs, glowing cyan and violet metrics, high-tech infrastructure visualization",
    macro: "Macro capture of gold-plated Ethernet contacts snapping into a high-speed fiber switch port, tactile electronic perfection"
  },

  // 13. General Software & IT Training
  software_general: {
    match: ['software', 'programming', 'code', 'developer', 'python', 'career', 'portfolio', 'tech', 'engineering'],
    subject: "Focused modern software engineer crafting clean architecture",
    scene: "Atmospheric evening photograph of a modern software engineer focused at a dual-monitor setup, thoughtful silhouette against warm screen glow, crisp code editor lines, modern minimalist home office with bookshelf and ambient warm light, 50mm f/1.8 lens, authentic and relatable developer life",
    isometric: "3D isometric software workstation, dual monitors, ergonomic chair, desk plant, coffee mug, soft warm lighting, Blender 3D render",
    vector: "Inspiring editorial vector art of a developer building with digital blocks, ascending stairs of code, clean modern flat illustration",
    cyber: "Dark futuristic coding interface, code lines dissolving into holographic particle streams, cinematic ambient backlight",
    macro: "Macro focus on tactile mechanical keyboard keycaps, warm LED underglow, blurred code editor in background"
  },

  // 14. Urban Rooftop Farming & Hydroponics
  urban_farming: {
    match: ['farming', 'hydroponics', 'rooftop', 'agriculture', 'aquaponics', 'vertical farm', 'greenhouse', 'urban garden', 'harvest', 'crop'],
    subject: "High-tech rooftop hydroponics farm and vibrant vertical agriculture overlooking a skyline",
    scene: "Lush modern rooftop greenhouse with glowing nutrient-film hydroponic channels of crisp emerald lettuce, basil, and ripe cherry tomatoes, overlooking an expansive sunrise city skyline, morning sun rays filtering through high-grade glass panels, water mist nozzles operating, authentic 35mm documentary photography, 28mm wide lens, vibrant food security innovation",
    isometric: "3D isometric high-tech rooftop greenhouse, vertical hydroponic towers, solar glass canopy, lush green crops against sleek urban architecture, Octane 3D render",
    vector: "Modern editorial flat vector illustration of rooftop vertical farming, crisp geometric plants growing upward, radiant morning sun and city silhouette, clean editorial styling",
    cyber: "Futuristic climate-controlled aeroponic vertical farm, automated LED grow-light arrays in magenta and cool white, nutrient delivery sensors, high-contrast dark ambiance",
    macro: "Macro close-up of crystal nutrient water droplets glistening on fresh organic hydroponic leaves, pristine micro-details, razor-sharp focus"
  },

  // 15. Clean Renewable Energy & Grid Modernization
  renewable_energy: {
    match: ['solar', 'wind energy', 'clean energy', 'battery', 'electric vehicle', 'ev', 'grid', 'hydrogen', 'photovoltaic', 'renewable', 'clean power'],
    subject: "Vast solar farm and elegant wind turbines coexisting with natural rolling hills",
    scene: "Panoramic landscape photograph of vast high-efficiency solar panel arrays catching golden-hour sunlight across rolling green hills, majestic wind turbines gracefully turning against a vibrant evening sky, clean atmospheric clarity, Hasselblad medium format, 45mm lens, majestic renewable transition",
    isometric: "3D isometric microgrid substation, solar panels, miniature battery storage units, wind turbine, pastel and clean architectural textures, modern 3D render",
    vector: "Bold minimalist vector poster celebrating clean energy, stylized wind turbines and geometric solar panels under radiant sunshine, editorial graphic style",
    cyber: "High-tech smart grid energy distribution matrix, glowing green and gold power conduit lines flowing across a digital terrain map, futuristic telemetry room",
    macro: "Extreme macro of photovoltaic silicon solar cell surface, shimmering anti-reflective blue crystal texture, microscopic busbar contacts"
  },

  // 16. Healthcare, Biotech & Digital Medicine
  healthcare_biotech: {
    match: ['health', 'medicine', 'hospital', 'biotech', 'clinical', 'patient', 'doctor', 'genomics', 'telemedicine', 'vaccine', 'medical', 'cardio'],
    subject: "Advanced compassionate clinical medical research and modern diagnostics",
    scene: "Authentic documentary photograph inside a sunlit modern clinical research laboratory, compassionate medical specialist examining high-precision diagnostic imaging on a clean glass workstation, pristine white laboratory coat, ambient natural light, Leica SL2, 50mm f/1.4 lens, warmth and human empathy in medical science",
    isometric: "3D isometric modern hospital diagnostic suite, MRI scanner, digital vitals displays, clean low-poly medical aesthetic, soft ambient lighting, Octane render",
    vector: "Sleek editorial medical graphic, stylized DNA helix transforming into digital health telemetry waves, calming cerulean blue and teal gradients, medical publication cover",
    cyber: "Futuristic molecular diagnostics interface, floating holographic DNA strands and protein folding models in glowing cyan and violet, high-tech biomedical lab",
    macro: "Macro detail of a precision glass micropipette dispensing a luminous solution onto a diagnostic microchip, pristine optical reflection and depth"
  },

  // 17. Footwear, Designer Sandals, Shoes & Fashion Apparel
  footwear_fashion: {
    match: ['sandal', 'sandals', 'shoe', 'shoes', 'footwear', 'sneaker', 'sneakers', 'boots', 'heels', 'fashion', 'apparel', 'clothing', 'runway', 'outfit', 'leather', 'slippers', 'flip-flop', 'sia'],
    subject: "Crafted contemporary leather sandals and stylish fashion footwear",
    scene: "High-fashion editorial photography of elegant contemporary leather sandals displayed on a minimalist travertine stone pedestal, soft natural diffuse lighting, warm neutral tones, subtle studio shadow, 85mm f/1.4 lens, tactile leather grain texture, luxury fashion magazine aesthetic",
    isometric: "3D isometric footwear design atelier, miniature artisan leather sandals on glass plinth, sleek studio lighting, Octane render",
    vector: "Minimalist modern editorial vector art of stylish sandals and footwear design, clean geometric silhouettes, warm terracotta and sage palette",
    cyber: "Futuristic conceptual footwear exhibit, sleek metallic aerodynamic sandals floating above illuminated dark acrylic pedestal, subtle violet and ice blue edge lighting",
    macro: "Tactile macro photograph of handcrafted leather sandal strap, intricate stitching and brushed brass buckle, rich texture, shallow depth of field"
  },

  // 18. Food, Cooking & Culinary Arts
  food_culinary: {
    match: ['cooking', 'recipe', 'culinary', 'restaurant', 'chef', 'dish', 'cuisine', 'bakery', 'coffee', 'espresso', 'tea'],
    subject: "Artisanal culinary preparation and fresh wholesome ingredients",
    scene: "Artisanal food photography of freshly prepared gourmet dishes with fresh herbs, rustic wooden table, soft morning window light, 50mm f/1.8 lens, vibrant food styling",
    isometric: "3D isometric gourmet kitchen studio, copper cookware, fresh vegetables, warm diffuse lighting, clean render",
    vector: "Modern editorial graphic of artisan gastronomy, stylized culinary ingredients, elegant color palette",
    cyber: "High-tech molecular gastronomy laboratory, precision glass conduits, subtle ambient blue glow",
    macro: "Macro close-up of fresh organic seasoning and olive oil drizzled on crisp greens, tactile food texture"
  },

  // 19. Travel, Tourism & World Exploration
  travel_destinations: {
    match: ['travel', 'tourism', 'destination', 'hotel', 'resort', 'flight', 'vacation', 'beach', 'mountain', 'backpack', 'trip', 'journey'],
    subject: "Breathtaking scenic travel destination and cultural landscape",
    scene: "Vibrant 35mm landscape photography of an awe-inspiring travel horizon, golden hour sunset, authentic cultural atmosphere, wide angle 24mm lens, rich environmental colors",
    isometric: "3D isometric tropical travel resort island, miniature bungalows, turquoise water, warm sunset lighting",
    vector: "Minimalist editorial travel poster, winding mountain trail leading into warm sunset, modern flat geometry",
    cyber: "Futuristic orbital tourism observation deck overlooking Earth, subtle cyan HUD telemetry, cinematic depth",
    macro: "Macro detail of a vintage brass compass resting on an authentic textured parchment world map, warm lighting"
  },

  // 20. Winter Fog, Climate & Cold Wave Relief Efforts
  winter_fog_relief: {
    match: ['fog', 'winter', 'cold wave', 'blanket', 'frost', 'chilly', 'snow', 'winter relief', 'relief efforts', 'delhi fog', 'morning mist'],
    subject: "North India grassroots winter relief volunteers distributing warm blankets to families in morning fog",
    scene: "Authentic 35mm documentary photography of compassionate community volunteers handing thick warm blankets and hot chai to families in dense North Indian morning fog, soft golden dawn sunlight filtering through heavy mist, genuine warmth and empathy, 50mm f/1.4 lens, natural skin tones, zero CGI, award-winning editorial capture",
    isometric: "3D isometric diorama of a winter morning community shelter, volunteers distributing warm blankets, steaming tea kettle, soft morning mist, pastel lighting, Octane render",
    vector: "Modern flat editorial vector art depicting winter fog relief, stylized volunteers distributing warm blankets under morning streetlights, deep indigo and warm amber palette",
    cyber: "Atmospheric dawn scene in winter fog, subtle warm streetlamp illumination, cinematic moody lighting",
    macro: "Close-up macro detail of coarse hand-woven wool blanket fibers with glistening condensation droplets in cold morning fog"
  },

  // 21. Social Welfare, Grassroots NGOs & Humanitarian Aid
  social_welfare_relief: {
    match: ['welfare', 'poverty', 'relief', 'grassroots', 'humanitarian', 'donation', 'ngo', 'charity', 'aid', 'outreach', 'warm meal'],
    subject: "Grassroots humanitarian volunteers organizing essential aid and care for families",
    scene: "Heartwarming 35mm documentary photograph of community outreach volunteers distributing relief parcels and hot meals, genuine human connection and dignity, natural morning light, 85mm f/1.8 lens",
    isometric: "3D isometric community care center, relief distribution boxes, volunteers, warm diffuse lighting, Octane render",
    vector: "Clean modern editorial flat vector illustration of community care, hands sharing food and blankets, warm uplifting colors",
    cyber: "High-tech humanitarian logistics coordination map, glowing relief transit corridors, subtle amber and teal telemetry",
    macro: "Macro detail of volunteer hands gently passing warm relief supplies, shallow depth of field"
  },

  // 22. Human Resources, Modern Workforce & Talent Strategy
  hr_workforce_management: {
    match: ['human resource', ' hr ', 'hr ', 'workforce', 'employee', 'recruitment', 'talent', 'workplace', 'staffing', 'personnel', 'onboarding', 'human capital'],
    subject: "Modern diverse workforce and HR leaders collaborating with digital talent analytics",
    scene: "Clean editorial photograph of diverse professionals in a sunlit modern workplace reviewing organizational talent insights on a sleek tablet, collaborative teamwork, natural window light, 85mm f/1.8 lens, professional technology aesthetic",
    isometric: "3D isometric modern corporate open-plan office, conference table, collaborative team, miniature laptops, plants, soft pastel studio lighting, Octane render",
    vector: "Minimalist modern editorial graphic of workforce collaboration, interconnected team members, subtle data charts, elegant corporate publication style",
    cyber: "Futuristic organizational talent intelligence matrix, glowing cyan nodes representing workforce skills and connectivity, dark mode interface",
    macro: "Macro focus on a digital tablet displaying employee sentiment analytics on a light oak conference desk, soft bokeh"
  },

  // 23. Business Leadership & Executive Corporate Strategy
  general_business_leadership: {
    match: ['leadership', 'executive', 'business strategy', 'corporate', 'management', 'boardroom', 'enterprise strategy'],
    subject: "Strategic executive leaders collaborating in a modern corporate boardroom",
    scene: "Contemporary editorial photograph of business leaders in discussion around a marble boardroom table, expansive city view through panoramic windows, crisp morning light, 50mm f/1.4 lens, professional corporate aesthetic",
    isometric: "3D isometric boardroom strategy session, miniature executive desks, presentation screen, sleek architectural render",
    vector: "Bold editorial business vector poster, stylized ascending graph with executive silhouettes, deep navy and warm gold tones",
    cyber: "Futuristic enterprise strategy command center, panoramic corporate analytics wall with glowing telemetry",
    macro: "Macro detail of fountain pen signing strategic contract document on textured heavy paper, warm office light"
  },

  // 24. Higher Education, Academics & Student Learning
  education_learning: {
    match: ['education', 'learning', 'student', 'school', 'university', 'study', 'academic', 'classroom', 'college'],
    subject: "Focused students and educators engaged in modern collaborative learning",
    scene: "Inspiring documentary photograph of diverse students collaborating around an open study table with books and digital devices, sunlight pouring through large library windows, 50mm f/1.8 lens, authentic academic atmosphere",
    isometric: "3D isometric modern academic library and study pod, miniature bookshelves, students, soft diffuse lighting, Octane render",
    vector: "Modern flat vector illustration representing education and knowledge, graduation cap transforming into flight of books, clean geometry",
    cyber: "Futuristic holographic learning environment, interactive educational data floating above desks",
    macro: "Extreme macro shot of fountain pen nib gliding across notebook paper, crisp paper texture, sharp focus"
  },

  // 25. Legal Integrity, Criminal Investigation & Law (Strictly Symbolic, Non-Violent)
  crime_justice_law: {
    match: ['crime', 'homicide', 'murder', 'investigat', 'forensics', 'court', 'legal', 'law', 'justice', 'detective', 'cybercrime', 'compliance'],
    subject: "Modern scales of justice and digital forensic analytics in a prestigious legal library",
    scene: "Dignified editorial photograph symbolizing legal integrity and thorough investigation: modern brass scales of justice resting on an elegant mahogany table beside a sleek tablet displaying forensic data analytics, warm morning window light, clean corporate legal atmosphere, zero violence, zero weapons",
    isometric: "3D isometric modern law office and digital forensic research center, scales of justice, law books, digital tablets, soft ambient lighting, Octane render",
    vector: "Modern minimalist editorial vector graphic of scales of justice and digital data nodes, clean cobalt blue and gold palette, legal journal aesthetic",
    cyber: "High-tech legal compliance and digital forensics operations center, holographic data verification matrices, clean dark-mode interface",
    macro: "Macro close-up of polished brass scales of justice resting on rich leather-bound legal statutes, warm library lighting"
  },

  // 26. Biomedical Research & Diagnostics (Compassionate, Non-Graphic, Scientific Progress)
  medical_biomedical_diagnostics: {
    match: ['pandemic', 'disease', 'virus', 'infection', 'cancer', 'epidemic', 'pathology', 'illness', 'treatment', 'biomedical'],
    subject: "Compassionate scientific researchers collaborating in advanced biomedical laboratory",
    scene: "Inspiring, compassionate editorial visual of cutting-edge biomedical innovation: dedicated scientists in clean white lab coats collaborating around an advanced molecular diagnostics interface in a sunlit modern laboratory, natural light, hope and scientific progress, non-graphic, fully clothed, professional medicine",
    isometric: "3D isometric biomedical laboratory, diagnostic equipment, clean white surfaces, soft pastel lighting, Octane render",
    vector: "Clean editorial graphic representing scientific health progress, stylized molecular diagnostic telemetry, serene turquoise and pearl white palette",
    cyber: "Futuristic medical telemetry interface, holographic diagnostic analytics in soft cyan and amber, clean research lab",
    macro: "Macro photograph of a sterile diagnostic microfluidic array reflecting gentle ambient laboratory illumination"
  },

  // 27. Safety Engineering & Proactive Risk Mitigation (Constructive, Non-Graphic)
  infrastructure_safety_risk: {
    match: ['accident', 'disaster', 'hazard', 'crisis', 'risk', 'mitigation', 'emergency', 'structural failure', 'incident'],
    subject: "Infrastructure safety engineering and proactive risk mitigation systems",
    scene: "A modern conceptual graphic illustrating infrastructure safety engineering and proactive risk mitigation: clean architectural blueprints, digital telemetry sensors, and protective engineering safeguards, sleek minimalist 3D composition, non-graphic, general audience friendly",
    isometric: "3D isometric structural monitoring station, miniature architectural grid with safety sensors, clean industrial 3D render",
    vector: "Minimalist editorial diagram of safety protocols and risk mitigation barriers, bold navy and safety orange accents, architectural publication style",
    cyber: "Industrial telemetry operations center monitoring structural integrity, real-time safety metrics on curved glass display",
    macro: "Macro detail of high-grade architectural structural blueprints with digital caliper resting on precise measurements"
  },

  // 28. International Diplomacy, Geopolitics & Global Peace (Symbolic, Non-Violent)
  diplomacy_global_peace: {
    match: ['war', 'conflict', 'geopolitics', 'sanctions', 'treaty', 'diplomacy', 'foreign policy', 'peace'],
    subject: "International diplomatic summit representing global cooperation and peaceful resolution",
    scene: "A thoughtful diplomatic editorial scene symbolizing international diplomacy and peace: international flags and an elegant negotiation table in a sunlit glass summit pavilion overlooking a calm reflecting pool at dawn, dignified atmosphere, non-violent, symbolic peace",
    isometric: "3D isometric international conference rotunda, flags, glass ceiling, serene dawn lighting, Octane render",
    vector: "Modern editorial graphic of diplomatic cooperation, stylized silhouettes around a circular discussion table under dove motif, serene cobalt and dawn gold",
    cyber: "Global diplomatic summit operations display, interconnected worldwide treaties on a holographic globe, tranquil deep navy ambiance",
    macro: "Macro focus on an engraved ceremonial fountain pen resting on an official diplomatic parchment agreement"
  }
};

class TitleImagePromptAgent {
  constructor() {
    this.gemini = new GeminiService(process.env.GEMINI_API_KEY);
  }

  /**
   * Analyze the blog title and determine the exact physical domain metaphor.
   * Priority: Title words carry 10x weight over broad categories so physical nouns
   * (like "sandals" or "dogs") always determine the visual subject!
   */
  analyzeTitleDomain(title = '', category = '') {
    const titleLower = String(title || '').toLowerCase();
    const categoryLower = String(category || '').toLowerCase();

    let bestDomain = null;
    let highestScore = 0;

    for (const [key, meta] of Object.entries(TITLE_DOMAIN_METAPHORS)) {
      let score = 0;
      for (const m of meta.match) {
        if (titleLower.includes(m)) {
          // Matches in the title carry 10x-20x priority weight!
          score += (m.length > 4 ? 20 : 10);
        } else if (categoryLower.includes(m)) {
          score += (m.length > 4 ? 2 : 1);
        }
      }
      if (score > highestScore) {
        highestScore = score;
        bestDomain = { domainKey: key, ...meta };
      }
    }

    if (!bestDomain || highestScore === 0) {
      const cleanSubject = title.replace(/^(the|a|an|how to|guide to|why|mastering|exploring|understanding)\s+/i, '').trim();
      return {
        domainKey: 'editorial_universal_clean',
        subject: `Authentic representation of ${cleanSubject}`,
        scene: `Award-winning 35mm documentary photography representing "${title}", authentic real-world environment, natural golden-hour lighting, cinematic atmospheric depth, rich environmental detail, 50mm f/1.4 lens, realistic textures, zero CGI`,
        isometric: `3D modern isometric miniature diorama illustrating "${title}", clean geometric composition, frosted glass and smooth clay textures, soft diffuse studio lighting, Octane 3D render`,
        vector: `Modern editorial graphic illustrating "${title}", elegant flat design, harmonious color palette, clean vector shapes, publication cover aesthetic`,
        cyber: `Atmospheric futuristic visualization of "${title}", high-contrast dark ambiance with subtle glowing ambient light, cinematic depth`,
        macro: `Cinematic macro photograph capturing authentic physical textures and fine details of "${title}", shallow depth of field, sharp focus`
      };
    }

    return bestDomain;
  }

  /**
   * Build direct instant image URL via Flux / Pollinations
   */
  buildFluxUrl(prompt, seed = 12345, aspectRatio = '16:9') {
    const safety = visualSafetyService.auditAndRewritePrompt(prompt);
    const cleanPrompt = encodeURIComponent(
      `${safety.rewrittenPrompt.slice(0, 260)}, ultra-high resolution, professional lighting, cinematic composition, award-winning, 8k render, photorealistic`
    );
    let w = 1200, h = 675;
    if (aspectRatio === '1:1') { w = 800; h = 800; }
    else if (aspectRatio === '4:3') { w = 1024; h = 768; }
    const negativeParam = encodeURIComponent(visualSafetyService.standardNegativePrompt.slice(0, 200));
    return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${w}&height=${h}&model=turbo&seed=${seed}&nologo=true&negative=${negativeParam}`;
  }

  /**
   * Generate an exquisite, title-accurate image prompt and multi-style variations
   */
  async generateImagePromptForTitle({
    title = 'Modern Technology Architecture',
    category = 'Technology',
    excerpt = '',
    preferredStyle = 'style_flux_photoreal',
    aspectRatio = '16:9',
    keywords = [],
    seed: customSeed = null
  } = {}) {
    const cleanTitle = (title || 'Modern Technology Architecture').trim();
    const cleanCategory = (category || 'Technology').trim();
    const domain = this.analyzeTitleDomain(cleanTitle, cleanCategory);

    // 1. Run dynamic visual prompt analysis with Google Gemini AI (Free Key Access)
    let aiVisual = null;
    try {
      aiVisual = await this.gemini.generateVisualPrompt({ title: cleanTitle, category: cleanCategory, keywords });
    } catch (err) {
      console.warn('[TitleImagePromptAgent] Gemini visual analysis note:', err.message);
    }

    const effectiveSubject = aiVisual?.physicalSubject || domain.subject;
    const effectiveScene = aiVisual?.scene || domain.scene;
    const effectiveOptics = aiVisual?.cameraOptics || 'Hasselblad H6D-100c medium format camera, 85mm f/1.4 prime lens, volumetric natural lighting';

    // Unique seed: deterministic from title unless explicit seed passed for regeneration
    let hash = 0;
    for (let i = 0; i < cleanTitle.length; i++) {
      hash = ((hash << 5) - hash) + cleanTitle.charCodeAt(i);
      hash |= 0;
    }
    const seed = (customSeed !== null && customSeed !== undefined) ? Number(customSeed) : (Math.abs(hash) % 800000 + 100000);
    const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Master Prompt: Combines Gemini Director + Title-specific documentary realism audited for safety
    const rawMasterPrompt = aiVisual?.masterPrompt || `${cleanTitle}. ${effectiveScene}. Subject: ${effectiveSubject}. Optical specs: ${effectiveOptics}, authentic real-world environment, high resolution editorial detail, 8k.`;
    const masterSafety = visualSafetyService.auditAndRewritePrompt(rawMasterPrompt, cleanTitle, cleanCategory);
    const masterPrompt = masterSafety.rewrittenPrompt;

    const negativePrompt = visualSafetyService.standardNegativePrompt;

    // Dynamic AI Prompt-Driven Image Generators for each style option (Zero static/hardcoded stock images)
    const genUrl0 = imageService.buildFluxImageUrl(aiVisual?.stylePrompts?.fluxPhotoreal || `${domain.scene}, representing "${cleanTitle}"`, 'style_flux_photoreal', aspectRatio, seed);
    const genUrl1 = imageService.buildFluxImageUrl(aiVisual?.stylePrompts?.isometric3D || `${domain.isometric}, "${cleanTitle}"`, 'style_isometric_3d', aspectRatio, seed + 1);
    const genUrl2 = imageService.buildFluxImageUrl(aiVisual?.stylePrompts?.editorialVector || `${domain.vector}, "${cleanTitle}"`, 'style_editorial_vector', aspectRatio, seed + 2);
    const genUrl3 = imageService.buildFluxImageUrl(aiVisual?.stylePrompts?.cyberpunkGlow || `${domain.cyber}, "${cleanTitle}"`, 'style_cyberpunk_glow', aspectRatio, seed + 3);
    const genUrl4 = imageService.buildFluxImageUrl(aiVisual?.stylePrompts?.cinematicMacro || `${domain.macro}, "${cleanTitle}"`, 'style_cinematic_macro', aspectRatio, seed + 4);

    // Build multi-style options specifically tuned for the article title
    const styles = [
      {
        id: 'style_flux_photoreal',
        styleId: 'style_flux_photoreal',
        name: '📸 35mm Documentary Photography',
        label: '📸 35mm Documentary',
        styleDesc: 'Authentic real-world photography with natural lighting, tactile depth, and zero CGI sheen',
        prompt: aiVisual?.stylePrompts?.fluxPhotoreal || `${domain.scene}, representing "${cleanTitle}", authentic real-world environment, natural depth of field, 8k resolution, award-winning editorial documentary photography`,
        aspectRatio,
        seed,
        imageUrl: genUrl0,
        previewUrl: genUrl0
      },
      {
        id: 'style_isometric_3d',
        styleId: 'style_isometric_3d',
        name: '🧊 3D Modern Isometric Architecture',
        label: '🧊 3D Isometric',
        styleDesc: 'Sophisticated 3D isometric Octane render with frosted glassmorphism and soft ambient lighting',
        prompt: aiVisual?.stylePrompts?.isometric3D || `${domain.isometric}, illustrating concept "${cleanTitle}", smooth clay and frosted glass elements, soft directional lighting, Blender 3D, Octane render`,
        aspectRatio,
        seed: seed + 1,
        imageUrl: genUrl1,
        previewUrl: genUrl1
      },
      {
        id: 'style_editorial_vector',
        styleId: 'style_editorial_vector',
        name: '🎨 Modern Editorial Graphic & Vector',
        label: '🎨 Editorial Vector',
        styleDesc: 'Sleek magazine-cover editorial graphic with crisp minimalist geometry and elegant gradients',
        prompt: aiVisual?.stylePrompts?.editorialVector || `${domain.vector}, illustrating "${cleanTitle}", sleek gradients, flat design, clean geometry, tech editorial publication cover aesthetic`,
        aspectRatio,
        seed: seed + 2,
        imageUrl: genUrl2,
        previewUrl: genUrl2
      },
      {
        id: 'style_cyberpunk_glow',
        styleId: 'style_cyberpunk_glow',
        name: '⚡ Cyberpunk Dark Mode & Neon Glow',
        label: '⚡ Cyberpunk Glow',
        styleDesc: 'High-contrast dark aesthetic with luminous cyan, violet, and electric amber data illumination',
        prompt: aiVisual?.stylePrompts?.cyberpunkGlow || `${domain.cyber}, visual metaphor for "${cleanTitle}", high-contrast dark environment, glowing neon data streams, cinematic atmosphere, 8k`,
        aspectRatio,
        seed: seed + 3,
        imageUrl: genUrl3,
        previewUrl: genUrl3
      },
      {
        id: 'style_cinematic_macro',
        styleId: 'style_cinematic_macro',
        name: '🔍 Tangible Cinematic Macro Detail',
        label: '🔍 Cinematic Macro',
        styleDesc: 'Extreme close-up macro capture emphasizing physical textures, natural reflections, and razor focus',
        prompt: aiVisual?.stylePrompts?.cinematicMacro || `${domain.macro}, representing "${cleanTitle}", extreme macro photography, razor-sharp focus, shallow depth of field, glistening natural light, high fidelity`,
        aspectRatio,
        seed: seed + 4,
        imageUrl: genUrl4,
        previewUrl: genUrl4
      }
    ];

    // Pick primary style (supporting both UI aliases and internal style keys)
    const normalizeStyleId = (id) => {
      if (!id) return null;
      if (id === 'style_3d_isometric' || id === 'style_isometric_3d') return 'style_isometric_3d';
      if (id === 'style_editorial_art' || id === 'style_editorial_vector') return 'style_editorial_vector';
      if (id === 'style_curated_photo' || id === 'style_cinematic_macro') return 'style_cinematic_macro';
      if (id === 'style_cyberpunk_glow') return 'style_cyberpunk_glow';
      if (id === 'style_flux_photoreal' || id === 'documentary_35mm') return 'style_flux_photoreal';
      if (id === 'style_wikimedia_real') return 'style_wikimedia_real';
      return id;
    };
    const targetStyleId = normalizeStyleId(preferredStyle);
    const selectedStyleObj = styles.find(s => s.id === targetStyleId || s.styleId === targetStyleId) || styles[0];

    // Audit all style prompts through visualSafetyService
    for (const style of styles) {
      if (style.prompt) {
        const audit = visualSafetyService.auditAndRewritePrompt(style.prompt, cleanTitle, cleanCategory);
        style.prompt = audit.rewrittenPrompt;
      }
    }

    // Formatted Prompts for Third-Party Image Makers (Audited and Safe)
    const formats = {
      // 1. Imagen 3 (Google Cloud Vertex AI)
      imagen3: visualSafetyService.auditAndRewritePrompt(aiVisual?.imagenPrompt || `${cleanTitle}: ${effectiveScene}. Authentic documentary realism, high fidelity, 16:9 aspect ratio, natural lighting, award-winning photography.`, cleanTitle, cleanCategory).rewrittenPrompt,
      // 2. Flux 1.1 Pro
      flux: visualSafetyService.auditAndRewritePrompt(aiVisual?.fluxPrompt || `${effectiveScene}, representing "${cleanTitle}", 8k resolution, cinematic lighting, photorealistic, masterpiece`, cleanTitle, cleanCategory).rewrittenPrompt,
      // 3. Midjourney v6.1
      midjourney: visualSafetyService.auditAndRewritePrompt(aiVisual?.midjourneyPrompt || `/imagine prompt: ${cleanTitle}, ${effectiveSubject}, ${effectiveScene} --ar 16:9 --style raw --v 6.1 --s 250`, cleanTitle, cleanCategory).rewrittenPrompt,
      // 4. DALL-E 3
      dalle3: visualSafetyService.auditAndRewritePrompt(aiVisual?.dallePrompt || `A professional, authentic photograph representing "${cleanTitle}". ${effectiveScene}. Captured with an 85mm lens, natural lighting, and true-to-life environmental realism. Avoid any cartoonish or generic stock-photo elements.`, cleanTitle, cleanCategory).rewrittenPrompt,
      // 5. Master Prompt with Optical Specs
      masterPrompt,
      // 6. Negative Prompt
      negativePrompt
    };

    const titleAnalysis = {
      domain: domain.domainKey || domain.domain || 'general_technology',
      domainKey: domain.domainKey || domain.domain || 'general_technology',
      rationale: aiVisual ? 'Synthesized by Google Gemini AI Visual Director with dynamic lens optics & scene composition' : `Selected based on high semantic alignment with "${cleanTitle}"`,
      visualSubject: effectiveSubject,
      visualMetaphor: `Visualizes "${cleanTitle}" through ${effectiveSubject.toLowerCase()} with grounded real-world fidelity.`,
      aiEnhanced: !!aiVisual
    };

    const result = {
      success: true,
      agent: "TitleImagePromptAgent",
      version: "2.1.0",
      blogTitle: cleanTitle,
      category: cleanCategory,
      titleAnalysis,
      visualSubject: effectiveSubject,
      visualMetaphor: titleAnalysis.visualMetaphor,
      masterPrompt,
      negativePrompt,
      formats,
      styles,
      primaryStyle: selectedStyleObj,
      primaryImageUrl: selectedStyleObj.imageUrl,
      seoAltText: `Editorial visual representing ${cleanTitle} in ${cleanCategory}`,
      caption: `Featured visual illustrating ${cleanTitle}.`,
      suggestedFilename: `${slug}.webp`,
      aspectRatio,
      timestamp: new Date().toISOString()
    };

    // Include data wrapper for flexibility
    result.data = { ...result };
    return result;
  }
}

module.exports = new TitleImagePromptAgent();
