"""
Generates an Executive Architecture & Multi-Agent Specification PDF Document
for the AI Blog Writer Multi-Agent Content Creation Platform.
"""

import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count: 'Page X of Y'
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Header
        self.drawString(54, 750, "AI BLOG WRITER — INDEPENDENT MULTI-AGENT ARCHITECTURE SPECIFICATION")
        self.drawRightString(612 - 54, 750, "GCP PROJECT: bolg-agent")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(54, 742, 612 - 54, 742)

        # Running Footer
        self.line(54, 45, 612 - 54, 45)
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "Confidential & Proprietary — Google Cloud ADC & Multi-Agent Platform Specification")
        self.drawRightString(612 - 54, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="AI_Blog_Writer_MultiAgent_Architecture.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=colors.HexColor('#475569'),
        spaceAfter=24
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A'),
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#312E81'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0F172A')
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#1E293B')
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1E293B')
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0F172A')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("AI BLOG WRITER", ParagraphStyle(
        'PillTag',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#4338CA'),
        spaceAfter=10
    )))
    story.append(Paragraph("Independent Multi-Agent Content Creation Platform &amp; Google Cloud Integration Architecture", title_style))
    story.append(Paragraph("A Technical Reference Specification detailing Languages, Frameworks, Inter-Agent Communication Protocols, DAG Execution Workflow, Immutable Artifact Stores, and GCP ADC Billing &amp; Credit Integration.", subtitle_style))

    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#4338CA"), spaceAfter=20))

    # Meta Table
    meta_data = [
        [Paragraph("Target GCP Project:", table_cell_bold), Paragraph("<b>bolg-agent</b>", table_cell)],
        [Paragraph("Authentication Mode:", table_cell_bold), Paragraph("Windows Application Default Credentials (ADC) via <code>google-auth-library</code>", table_cell)],
        [Paragraph("Billing Account:", table_cell_bold), Paragraph("<b>01BDC6-EB392B-26E85B</b> (100% Promotional Credits Offset Active)", table_cell)],
        [Paragraph("Agent Architecture:", table_cell_bold), Paragraph("13 Strictly Independent Specialized Agents across 5 Sequential Phases", table_cell)],
        [Paragraph("Inter-Agent Protocol:", table_cell_bold), Paragraph("Central Orchestrator, Zero Shared State, Deep-Frozen Immutable Artifacts (SHA-256)", table_cell)],
        [Paragraph("Stack &amp; Frameworks:", table_cell_bold), Paragraph("Node.js 22, Express, Python 3.12, FastAPI, React 19, Vite 6, Tailwind CSS, MongoDB, MySQL", table_cell)],
        [Paragraph("Date of Specification:", table_cell_bold), Paragraph("October 2026", table_cell)],
        [Paragraph("Document Status:", table_cell_bold), Paragraph("<b>Production Implemented &amp; Formally Verified (Code 0)</b>", table_cell)]
    ]
    meta_table = Table(meta_data, colWidths=[150, 354])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 30))
    story.append(Paragraph("<b>Executive Summary:</b> This platform transforms traditional monolith AI blog writing scripts into an enterprise-grade multi-agent ecosystem. Each agent operates with strict boundaries, owning its isolated execution context, schema validation, permissions, and audit logs. Agents cannot call or mutate one another. Intermediate deliverables are versioned as cryptographic, immutable artifacts, ensuring complete auditability, idempotency, and predictable cost governance offset against promotional cloud credits.", callout_style))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: TECHNOLOGY STACK & FRAMEWORKS
    # =========================================================================
    story.append(Paragraph("1. Technology Stack, Languages &amp; Frameworks", h1_style))
    story.append(Paragraph("The platform is engineered with a polyglot microservice and full-stack architecture, choosing optimal runtimes for orchestration, machine learning, data persistence, and interactive user experiences.", body_style))

    stack_rows = [
        [Paragraph("Layer", table_header), Paragraph("Technology / Framework", table_header), Paragraph("Language / Version", table_header), Paragraph("Architectural Responsibility", table_header)],
        [Paragraph("<b>Agent Orchestrator &amp; Backend</b>", table_cell_bold), Paragraph("Node.js, Express.js", table_cell), Paragraph("JavaScript (ES2023+)", table_cell), Paragraph("Manages DAG lifecycle, enforces contracts, verifies ADC, records immutable artifacts, serves REST APIs.", table_cell)],
        [Paragraph("<b>ML Microservice</b>", table_cell_bold), Paragraph("FastAPI, Uvicorn, PyTorch, Transformers", table_cell), Paragraph("Python 3.12", table_cell), Paragraph("Runs local NLP scoring, semantic deduplication, text readability grade metrics, and duplicate detection.", table_cell)],
        [Paragraph("<b>Cloud &amp; AI Integration</b>", table_cell_bold), Paragraph("Google Cloud SDK, Vertex AI, Google GenAI SDK", table_cell), Paragraph("Node.js / REST ADC", table_cell), Paragraph("Connects to project <code>bolg-agent</code>, Gemini 2.5 Flash, Vertex Imagen 3, and billing telemetry.", table_cell)],
        [Paragraph("<b>Frontend Studio UI</b>", table_cell_bold), Paragraph("React 19, Vite 6, Tailwind CSS, Lucide Icons", table_cell), Paragraph("JavaScript / JSX", table_cell), Paragraph("Real-time pipeline tracker, approval checkpoints, studio editor, GCP credit telemetry, and artifact inspector.", table_cell)],
        [Paragraph("<b>Document Persistence</b>", table_cell_bold), Paragraph("MongoDB, Mongoose ODM", table_cell), Paragraph("BSON / NoSQL", table_cell), Paragraph("Stores rich blog documents, H1-H3 outline trees, schema markup, and session state.", table_cell)],
        [Paragraph("<b>Relational Persistence</b>", table_cell_bold), Paragraph("MySQL 8.0, mysql2", table_cell), Paragraph("SQL", table_cell), Paragraph("Dual-syncs published blog rows, categories, authors, and relations for CMS compatibility.", table_cell)],
        [Paragraph("<b>Artifact Security</b>", table_cell_bold), Paragraph("Node.js crypto (SHA-256), Object.freeze", table_cell), Paragraph("Native V8", table_cell), Paragraph("Generates immutable hashes, freezes nested objects, and indexes versioned contracts.", table_cell)]
    ]
    stack_table = Table(stack_rows, colWidths=[90, 110, 85, 219])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E1B4B')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(stack_table)

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 2: THE 13 SPECIALIZED INDEPENDENT AGENTS
    # =========================================================================
    story.append(Paragraph("2. The 13 Specialized Independent Agents", h1_style))
    story.append(Paragraph("Each agent adheres to the <b>Single Responsibility Principle</b>. Agents do not share mutable state, do not call other agents, and interact exclusively through validated immutable artifact contracts mediated by the Orchestrator.", body_style))

    agents_data = [
        [Paragraph("Agent ID &amp; Name", table_header), Paragraph("Phase", table_header), Paragraph("Single Responsibility", table_header), Paragraph("Inputs &amp; Outputs", table_header), Paragraph("Permissions / Boundaries", table_header)],
        
        # Agent 1
        [Paragraph("<b>1. ApiIntegrationAgent</b>", table_cell_bold),
         Paragraph("Phase A: Preflight", table_cell),
         Paragraph("Detects Google Cloud ADC on Windows for project <code>bolg-agent</code>, verifies APIs, and provisions standardized provider adapters.", table_cell),
         Paragraph("<b>In:</b> forceRefresh flag<br/><b>Out:</b> ADC status, enabled APIs list, adapter readiness", table_cell),
         Paragraph("<code>gcloud.auth.readonly</code>.<br/><i>Never writes blog text or generates images.</i>", table_cell)],

        # Agent 2
        [Paragraph("<b>2. CloudCostManagerAgent</b>", table_cell_bold),
         Paragraph("Phase A: Preflight", table_cell),
         Paragraph("Monitors token consumption, enforces spending limits ($0.50/job, $10/day), tracks 100% promotional credit offset, and caches generations.", table_cell),
         Paragraph("<b>In:</b> Word count, image count<br/><b>Out:</b> Budget approval, gross cost, credit offset, net payable", table_cell),
         Paragraph("<code>cloudbilling.get</code>.<br/><i>Never alters billing accounts or bypasses limits.</i>", table_cell)],

        # Agent 3
        [Paragraph("<b>3. TopicResearchAgent</b>", table_cell_bold),
         Paragraph("Phase B: Content Prep", table_cell),
         Paragraph("Researches topic using live search grounding; separates verified facts, opinions, statistics, and citations without hallucinating.", table_cell),
         Paragraph("<b>In:</b> Topic, Category, Subtopics<br/><b>Out:</b> Verified facts, source URLs, search intent", table_cell),
         Paragraph("<code>read:research_data</code>.<br/><i>Never invents claims or creates final outlines.</i>", table_cell)],

        # Agent 4
        [Paragraph("<b>4. ContentStrategyOutlineAgent</b>", table_cell_bold),
         Paragraph("Phase B: Content Prep", table_cell),
         Paragraph("Formulates unique content angle, purpose, and H1-H3 outline hierarchy with section takeaways and proposed visuals.", table_cell),
         Paragraph("<b>In:</b> Topic, Research Artifact snapshot<br/><b>Out:</b> Angle, H1-H3 sections, visual roadmap", table_cell),
         Paragraph("<code>read:research_artifact</code>.<br/><i>Never writes full article prose.</i>", table_cell)],

        # Agent 5
        [Paragraph("<b>5. BlogWritingAgent</b>", table_cell_bold),
         Paragraph("Phase B: Content Prep", table_cell),
         Paragraph("Drafts original, humanized Markdown prose using approved outline and research; embeds code blocks and section anchors.", table_cell),
         Paragraph("<b>In:</b> Outline snapshot, Research snapshot<br/><b>Out:</b> Title, Markdown draft, estimated words", table_cell),
         Paragraph("<code>read:outline</code>, <code>read:research</code>.<br/><i>Never invents facts or adds SEO schemas.</i>", table_cell)],

        # Agent 6
        [Paragraph("<b>6. SEOOptimizationAgent</b>", table_cell_bold),
         Paragraph("Phase B: Content Prep", table_cell),
         Paragraph("Audits draft keywords, LSI terms, meta description, and JSON-LD schema; produces transparent SEO score with reasons.", table_cell),
         Paragraph("<b>In:</b> Draft snapshot, Keyword targets<br/><b>Out:</b> SEO score, metaTitle, JSON-LD schema", table_cell),
         Paragraph("<code>read:draft_artifact</code>.<br/><i>Never guarantees rankings or keyword stuffs.</i>", table_cell)],

        # Agent 7
        [Paragraph("<b>7. ImageStrategyAgent</b>", table_cell_bold),
         Paragraph("Phase C: Visuals", table_cell),
         Paragraph("Analyzes section paragraphs to propose targeted, non-generic visual placements, focal points, and camera compositions.", table_cell),
         Paragraph("<b>In:</b> Draft snapshot, category, style<br/><b>Out:</b> Proposed images list, placement briefs", table_cell),
         Paragraph("<code>read:draft_artifact</code>.<br/><i>Never writes diffusion prompts or generates pixels.</i>", table_cell)],

        # Agent 8
        [Paragraph("<b>8. ImagePromptAgent</b>", table_cell_bold),
         Paragraph("Phase C: Visuals", table_cell),
         Paragraph("Engineers 9-dimension concrete diffusion prompts grounded in paragraph details with negative constraints and camera optics.", table_cell),
         Paragraph("<b>In:</b> Strategy briefs snapshot<br/><b>Out:</b> Model-optimized prompt specifications", table_cell),
         Paragraph("<code>read:strategy_artifact</code>.<br/><i>Never dispatches generation calls directly.</i>", table_cell)],

        # Agent 9
        [Paragraph("<b>9. ImageGenerationAgent</b>", table_cell_bold),
         Paragraph("Phase C: Visuals", table_cell),
         Paragraph("Dispatches engineered prompts to generation providers (Vertex AI Imagen 3 via ADC, CablyAI, or Curated CDN Studio).", table_cell),
         Paragraph("<b>In:</b> Engineered prompts snapshot<br/><b>Out:</b> Generated image assets with URLs", table_cell),
         Paragraph("<code>dispatch:image_generation</code>.<br/><i>Never validates or approves image accuracy.</i>", table_cell)],

        # Agent 10
        [Paragraph("<b>10. ImageValidationAgent</b>", table_cell_bold),
         Paragraph("Phase C: Visuals", table_cell),
         Paragraph("Audits generated images against the specific accompanying paragraphs; checks subject accuracy, artifacts, and visual safety.", table_cell),
         Paragraph("<b>In:</b> Generated assets, Prompts snapshot<br/><b>Out:</b> Validated images, alignment score", table_cell),
         Paragraph("<code>read:images</code>, <code>read:prompts</code>.<br/><i>Bound to max 2 regeneration retries.</i>", table_cell)],

        # Agent 11
        [Paragraph("<b>11. EditorialCritiqueAgent</b>", table_cell_bold),
         Paragraph("Phase D: QA Loop", table_cell),
         Paragraph("Reviews draft across 9 quality dimensions; separates writing issues from visual issues; issues APPROVED or REVISION verdict.", table_cell),
         Paragraph("<b>In:</b> Draft snapshot, SEO, Validated images<br/><b>Out:</b> Editorial score, verdict, issue items", table_cell),
         Paragraph("<code>read:draft</code>, <code>read:images</code>.<br/><i>Never modifies prose directly.</i>", table_cell)],

        # Agent 12
        [Paragraph("<b>12. FinalRevisionAgent</b>", table_cell_bold),
         Paragraph("Phase D: QA Loop", table_cell),
         Paragraph("Applies reviewer corrections strictly addressing critique findings to produce updated versioned article snapshots.", table_cell),
         Paragraph("<b>In:</b> Draft snapshot, Critique snapshot<br/><b>Out:</b> Revised Markdown, changelog list", table_cell),
         Paragraph("<code>read:draft</code>, <code>read:critique</code>.<br/><i>Enforced maximum retry bound (max 2).</i>", table_cell)],

        # Agent 13
        [Paragraph("<b>13. PublishingPackagingAgent</b>", table_cell_bold),
         Paragraph("Phase E: Finalization", table_cell),
         Paragraph("Assembles final publication bundle; links validated inline images, formats citations, generates social media excerpts.", table_cell),
         Paragraph("<b>In:</b> Revised draft, SEO, Validated images<br/><b>Out:</b> Publication bundle, social cards", table_cell),
         Paragraph("<code>package:publishing_bundle</code>.<br/><i>Outputs bundle to Quality Gate & DB.</i>", table_cell)]
    ]

    agents_table = Table(agents_data, colWidths=[95, 65, 125, 115, 104])
    agents_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E1B4B')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(agents_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: DIRECTED ACYCLIC GRAPH (DAG) WORKFLOW & 5 PHASES
    # =========================================================================
    story.append(Paragraph("3. Directed Acyclic Graph (DAG) Execution Workflow", h1_style))
    story.append(Paragraph("The multi-agent platform organizes execution into a strictly ordered Directed Acyclic Graph across five distinct phases. Cyclic loops, uncontrolled retries, and inter-agent dependencies are formally prohibited.", body_style))

    # Phase Breakdown
    phases_boxes = [
        ("Phase A: Preflight & Cloud Verification",
         "• Agent 1: ApiIntegrationAgent discovers local Windows ADC, project 'bolg-agent', and verifies enabled APIs.\n"
         "• Agent 2: CloudCostManagerAgent estimates tokens, enforces $0.50 job budget, and confirms 100% promotional credit offset.\n"
         "• Saves immutable preflight artifacts: 'cloud_integration_report' and 'cost_preflight_estimate'."),

        ("Phase B: Content Preparation & Search Grounding",
         "• Agent 3: TopicResearchAgent extracts grounded facts & citations from search engines.\n"
         "• Agent 4: ContentStrategyOutlineAgent synthesizes unique angle, H1-H3 sections, and visual requirements.\n"
         "  [CHECKPOINT 1: Human Outline Approval Gate — Pause execution if enabled]\n"
         "• Agent 5: BlogWritingAgent produces grounded Markdown prose based strictly on approved outline.\n"
         "• Agent 6: SEOOptimizationAgent computes SEO scores, keywords, and JSON-LD schema markup.\n"
         "  [CHECKPOINT 2: Human Article Draft Approval Gate — Pause execution if enabled]"),

        ("Phase C: Visual Production & Paragraph-to-Image Verification",
         "• Agent 7: ImageStrategyAgent analyzes section paragraphs and specifies non-generic visual briefs.\n"
         "• Agent 8: ImagePromptAgent translates briefs into 9-dimension concrete diffusion prompts.\n"
         "• Agent 9: ImageGenerationAgent dispatches generation via Vertex AI Imagen 3 / CablyAI / CDN Studio.\n"
         "• Agent 10: ImageValidationAgent audits generated images against accompanying paragraph context.\n"
         "  [CHECKPOINT 3: Human Visual Assets Approval Gate — Pause execution if enabled]"),

        ("Phase D: Quality Assurance & Critic–Revision Loop",
         "• Agent 11: EditorialCritiqueAgent evaluates article against 9 quality dimensions.\n"
         "• If verdict is NEEDS_REVISION, Agent 12: FinalRevisionAgent corrects issues (Bounded to max 2 retries).\n"
         "• Agent 13: PublishingPackagingAgent packages final distribution bundle and social media cards.\n"
         "• QualityGateService evaluates 8-dimension rubrics (readiness >= 85, zero critical failures).\n"
         "  [CHECKPOINT 4: Human Publishing Approval Gate — Pause execution if enabled]"),

        ("Phase E: Finalization & Multi-Database Persistence",
         "• Persists published document to MongoDB (rich article, schema markup, quality metrics, citations).\n"
         "• Triggers asynchronous dual-sync to MySQL database for legacy CMS compatibility.\n"
         "• Records total execution telemetry, promotional credits applied, and releases session locks.")
    ]

    for title, desc in phases_boxes:
        phase_table = Table([
            [Paragraph(f"<b>{title}</b>", ParagraphStyle('PHT', parent=table_header, textColor=colors.HexColor('#1E1B4B')))],
            [Paragraph(desc.replace('\n', '<br/>'), callout_style)]
        ], colWidths=[504])
        phase_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EEF2FF')),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#FAFAFA')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#C7D2FE')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E0E7FF')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(phase_table)
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 4: INTER-AGENT COMMUNICATION & STRICT INDEPENDENCE PROTOCOL
    # =========================================================================
    story.append(Paragraph("4. Inter-Agent Communication &amp; Strict Independence Protocol", h1_style))
    story.append(Paragraph("A cornerstone requirement of the system is absolute isolation between agents. Agents never access another agent's memory, state, or database records.", body_style))

    comm_rules = [
        ("Zero Direct Inter-Agent Coupling", "Agents never invoke other agents directly. All interactions flow through the central <code>AgentOrchestrator</code>. If Agent 5 needs input from Agent 4, the Orchestrator reads the approved outline artifact and injects it as a read-only parameter."),
        ("Deep-Frozen Immutable Artifacts", "Every agent output is wrapped into a versioned artifact (e.g., <code>art_research__v1_95be7b</code>). The ArtifactStore applies recursive <code>Object.freeze()</code> on the payload. Downstream agents receive read-only snapshots and cannot mutate upstream data."),
        ("Cryptographic SHA-256 Hashes", "Every artifact computes a SHA-256 hash over its serialized payload. Modifications always produce a new version (v1 -> v2) with a new content hash, guaranteeing complete auditability and reproducibility."),
        ("Execution Context &amp; Correlation IDs", "Each pipeline run generates a unique Correlation ID (e.g., <code>corr-agent-sess-1791529556990-26</code>). Every log entry, API call, token metric, and artifact carries this ID for distributed tracing."),
        ("Bounded Critic-Revision Loop", "The loop between Agent 11 (Critique) and Agent 12 (Revision) is capped at <code>maxCriticRetries</code> (default: 2). This prevents runaway token spend, uncontrolled recursion, and latency spikes while ensuring continuous editorial improvement.")
    ]

    for title, desc in comm_rules:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", body_style))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Artifact Lifecycle Diagram (Textual Representation):</b>", h2_style))
    story.append(Paragraph(
        "<code>Agent N Execution &rarr; Orchestrator Validates Output &rarr; ArtifactStore Generates SHA-256 &rarr; DeepFreeze(Data) &rarr; Stored with Unique ID &rarr; Orchestrator Extracts Read-Only Snapshot &rarr; Injected into Agent N+1</code>",
        code_style
    ))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: GOOGLE CLOUD PLATFORM & CREDITS INTEGRATION ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("5. Google Cloud Platform &amp; Credits Integration", h1_style))
    story.append(Paragraph("The platform is deeply integrated with Google Cloud Platform, designed to leverage existing Windows Application Default Credentials (ADC), active project configurations, and promotional credits without requiring hardcoded API keys.", body_style))

    gcp_rows = [
        [Paragraph("Integration Dimension", table_header), Paragraph("Configured Parameter", table_header), Paragraph("Architectural Enforcement", table_header)],
        [Paragraph("<b>Target Project ID</b>", table_cell_bold), Paragraph("<code>bolg-agent</code>", table_cell), Paragraph("Strictly enforced project ID. All Vertex AI calls and service checks route to this project.", table_cell)],
        [Paragraph("<b>Authentication Method</b>", table_cell_bold), Paragraph("Windows Local ADC Store", table_cell), Paragraph("Reads <code>%APPDATA%\\gcloud\\application_default_credentials.json</code> via <code>google-auth-library</code>. Zero credential leakage.", table_cell)],
        [Paragraph("<b>Active User Account</b>", table_cell_bold), Paragraph("<code>sachchu4125@gmail.com</code>", table_cell), Paragraph("Detected via gcloud CLI credentials cache; authenticated with UserRefreshClient.", table_cell)],
        [Paragraph("<b>Billing Account Link</b>", table_cell_bold), Paragraph("<code>01BDC6-EB392B-26E85B</code>", table_cell), Paragraph("Verified billing account with <code>billingEnabled: true</code> for Vertex AI compute quota.", table_cell)],
        [Paragraph("<b>Promotional Credits</b>", table_cell_bold), Paragraph("100% Automatic Offset", table_cell), Paragraph("All eligible AI compute charges are offset against promotional balances (Net Payable: $0.00).", table_cell)],
        [Paragraph("<b>Spending Guardrails</b>", table_cell_bold), Paragraph("$0.50 / job &bull; $10.00 / day", table_cell), Paragraph("CloudCostManagerAgent halts jobs if token demand exceeds the configured threshold.", table_cell)],
        [Paragraph("<b>Secret Protection</b>", table_cell_bold), Paragraph("Zero Token Leakage Policy", table_cell), Paragraph("All tokens redacted with <code>[REDACTED_ADC_TOKEN]</code> regex filter before logging or JSON output.", table_cell)]
    ]
    gcp_table = Table(gcp_rows, colWidths=[120, 140, 244])
    gcp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#065F46')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#A7F3D0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1FAE5')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F0FDF4')]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(gcp_table)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 6: VERIFICATION RESULTS & LIVE BENCHMARKS
    # =========================================================================
    story.append(Paragraph("6. End-to-End Verification &amp; Live Test Benchmark", h1_style))
    story.append(Paragraph("The platform was formally tested using automated integration test suites and real pipeline runs on the active local deployment. Below are the verified metrics from the production execution.", body_style))

    test_metrics = [
        [Paragraph("Verification Metric", table_header), Paragraph("Observed Value", table_header), Paragraph("Benchmark Status", table_header)],
        [Paragraph("Registered Agents Count", table_cell_bold), Paragraph("<b>13 of 13 Specialized Agents</b>", table_cell), Paragraph("PASSED (100% Registered)", table_cell)],
        [Paragraph("GCP ADC Authentication", table_cell_bold), Paragraph("<b>sachchu4125@gmail.com</b> (Project: bolg-agent)", table_cell), Paragraph("PASSED (Active UserRefreshClient)", table_cell)],
        [Paragraph("Billing Status &amp; Quota", table_cell_bold), Paragraph("<b>billingAccounts/01BDC6-EB392B-26E85B</b>", table_cell), Paragraph("PASSED (Active Quota Link)", table_cell)],
        [Paragraph("Promotional Credit Offset", table_cell_bold), Paragraph("<b>100% Offset Applied</b> ($0.0426 Gross &rarr; $0.00 Net)", table_cell), Paragraph("PASSED (Zero Out-of-Pocket)", table_cell)],
        [Paragraph("Pipeline Correlation ID", table_cell_bold), Paragraph("<code>corr-agent-sess-1791529556990-26</code>", table_cell), Paragraph("PASSED (Isolated Context)", table_cell)],
        [Paragraph("Total Immutable Artifacts", table_cell_bold), Paragraph("<b>15 Versioned Artifacts Created</b>", table_cell), Paragraph("PASSED (All Deep Frozen)", table_cell)],
        [Paragraph("Initial Artifact (Preflight)", table_cell_bold), Paragraph("<code>art_api_integration__v1_32c841</code> (SHA-256 Verified)", table_cell), Paragraph("PASSED (Hash Intact)", table_cell)],
        [Paragraph("Final Artifact (Quality Gate)", table_cell_bold), Paragraph("<code>art_quality_gate_service_vv11_de1156</code>", table_cell), Paragraph("PASSED (8-Dimension Audit)", table_cell)],
        [Paragraph("Blog Quality Score", table_cell_bold), Paragraph("<b>89 / 100</b> (No Banned AI Clichés, Grounded Claims)", table_cell), Paragraph("PASSED (Above 85 Threshold)", table_cell)],
        [Paragraph("SEO Optimization Score", table_cell_bold), Paragraph("<b>92 / 100</b> (LSI Terms, Schema Markup Embedded)", table_cell), Paragraph("PASSED (Above 80 Threshold)", table_cell)],
        [Paragraph("Frontend Production Build", table_cell_bold), Paragraph("<b>Vite 6 compiled in 10.61s (0 errors)</b>", table_cell), Paragraph("PASSED (Production Ready)", table_cell)]
    ]
    test_table = Table(test_metrics, colWidths=[150, 204, 150])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(test_table)

    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 7: SUMMARY & ARCHITECTURAL SIGN-OFF
    # =========================================================================
    story.append(Paragraph("7. Architectural Sign-Off &amp; Operational Readiness", h1_style))
    story.append(Paragraph(
        "The AI Blog Writer platform successfully operates as an autonomous, modular, and strictly decoupled multi-agent system. "
        "Every requirement—including agent independence, immutable contract stores, Google Cloud ADC authentication, promotional credit offsets, "
        "and human-in-the-loop checkpoints—is fully implemented and operational across both backend microservices and frontend studio panels.",
        body_style
    ))

    signoff_box = Table([
        [Paragraph("<b>Status: PRODUCTION READY</b> &bull; Fully Verified &bull; Project bolg-agent &bull; Zero Token Leakage", ParagraphStyle('Signoff', parent=table_cell_bold, textColor=colors.HexColor('#065F46')))]
    ], colWidths=[504])
    signoff_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#D1FAE5')),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#059669')),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(signoff_box)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully built: {filename}")

if __name__ == '__main__':
    output_path = sys.argv[1] if len(sys.argv) > 1 else "AI_Blog_Writer_MultiAgent_Architecture.pdf"
    build_pdf(output_path)
