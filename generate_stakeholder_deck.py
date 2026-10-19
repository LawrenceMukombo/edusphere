# generate_stakeholder_deck.py
# Generates an ultra-premium, 14-slide executive presentation deck (.pptx)
# for the Board of Governors, Director, Ministry Inspectors, and Stakeholders of Legacy School Solwezi.

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Executive Theme Colors
    C_NAVY = RGBColor(11, 37, 69)         # #0B2545 - Deep Institutional Navy
    C_DEEP_BLUE = RGBColor(19, 64, 116)   # #134074 - Royal Accent Blue
    C_LIGHT_BG = RGBColor(248, 250, 252)  # #F8FAFC - Clean Slate Light Background
    C_GOLD = RGBColor(212, 175, 55)       # #D4AF37 - Legacy Gold
    C_EMERALD = RGBColor(16, 185, 129)    # #10B981 - Success / Sovereign Green
    C_SLATE_DARK = RGBColor(30, 41, 59)   # #1E293B - Dark Charcoal Text
    C_SLATE_MUTED = RGBColor(100, 116, 139) # #64748B - Secondary Muted Text
    C_WHITE = RGBColor(255, 255, 255)
    C_CARD_BG = RGBColor(255, 255, 255)
    C_CARD_BORDER = RGBColor(226, 232, 240)
    C_CARD_ALT_BG = RGBColor(241, 245, 249)

    def set_slide_background(slide, color=C_LIGHT_BG):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category="LEGACY SCHOOL SOLWEZI • EXECUTIVE STRATEGY & TECHNOLOGY DEPLOYMENT"):
        # Header bar
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = C_NAVY
        top_bar.line.fill.background()

        # Category
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.12), Inches(11.7), Inches(0.28))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(9)
        p_cat.font.bold = True
        p_cat.font.color.rgb = C_GOLD

        # Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.38), Inches(11.7), Inches(0.55))
        tf = t_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = C_WHITE

    def add_card(slide, left, top, width, height, title, items, subtitle=None, accent_color=C_DEEP_BLUE, bg_color=C_WHITE):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1)

        # Top accent bar
        accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.08))
        accent.fill.solid()
        accent.fill.fore_color.rgb = accent_color
        accent.line.fill.background()

        tb = slide.shapes.add_textbox(left + Inches(0.15), top + Inches(0.12), width - Inches(0.3), height - Inches(0.25))
        tf = tb.text_frame
        tf.word_wrap = True

        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(12)
        p_title.font.bold = True
        p_title.font.color.rgb = C_NAVY
        p_title.space_after = Pt(2)

        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.size = Pt(8.5)
            p_sub.font.color.rgb = C_SLATE_MUTED
            p_sub.space_after = Pt(6)

        for item in items:
            p = tf.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(9.5)
            p.font.color.rgb = C_SLATE_DARK
            p.space_after = Pt(4)

        return card

    # =========================================================================
    # SLIDE 1: COVER SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1, C_NAVY)

    accent1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.1), Inches(11.733), Inches(5.3))
    accent1.fill.solid()
    accent1.fill.fore_color.rgb = RGBColor(15, 45, 82)
    accent1.line.color.rgb = C_GOLD
    accent1.line.width = Pt(1.5)

    title_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(10.9), Inches(1.2))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "LEGACY SCHOOL SOLWEZI"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = C_GOLD

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "EduSphere SMIS: Enterprise Stakeholder Master Deck"
    p1_sub.font.size = Pt(28)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = C_WHITE

    desc_box = slide1.shapes.add_textbox(Inches(1.2), Inches(2.9), Inches(10.5), Inches(1.6))
    tf_desc = desc_box.text_frame
    tf_desc.word_wrap = True
    p_desc = tf_desc.paragraphs[0]
    p_desc.text = "Sovereign Multi-Campus School Management System • 2026 Term 3 Live Operational Session\nMushitala Day Campus & Kansanshi Boarding Campus • Solwezi, North-Western Province, Zambia"
    p_desc.font.size = Pt(13)
    p_desc.font.color.rgb = RGBColor(226, 232, 240)
    p_desc.space_after = Pt(12)

    meta_box = slide1.shapes.add_textbox(Inches(1.2), Inches(4.5), Inches(10.5), Inches(1.5))
    tf_meta = meta_box.text_frame
    tf_meta.word_wrap = True
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "Presented to: School Board, Director Mr. Emmanuel Mwansa, Ministry of Education, and Key Stakeholders"
    p_meta.font.size = Pt(11)
    p_meta.font.bold = True
    p_meta.font.color.rgb = C_GOLD

    p_meta2 = tf_meta.add_paragraph()
    p_meta2.text = "Key Pillars: Zero-Loss Financial Ledger • 5-Horizon Attendance • 360° Boarding Curfew • Native Android APK • ECZ Markbooks"
    p_meta2.font.size = Pt(10)
    p_meta2.font.color.rgb = RGBColor(148, 163, 184)

    # =========================================================================
    # SLIDE 2: INSTITUTIONAL CONTEXT & DUAL CAMPUS ARCHITECTURE
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "Dual-Campus Institutional Topology & Operational Realities")

    add_card(slide2, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Mushitala Day Campus (Solwezi Urban)",
             [
                 "Student Body: 520+ Day Scholars spanning ECE, Primary, and Junior Secondary.",
                 "Transit Dynamics: 4 bus transport routes navigating morning/afternoon traffic across Solwezi.",
                 "Operational Priorities: Rapid morning roll-call, contactless student ID bus boarding, tuition fee collection.",
                 "Community Engagement: Direct parent communication via SMS and WhatsApp-compatible gateway."
             ],
             subtitle="Day School Focus • High Density Transit • Early Childhood to Grade 9",
             accent_color=C_DEEP_BLUE)

    add_card(slide2, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Kansanshi Boarding Campus (Residential)",
             [
                 "Student Body: 280+ Full Residential Boarders & Senior Secondary Scholars.",
                 "Safeguarding Priorities: 21:00 CAT nightly curfew check, dormitory cubicle allocations, medical exeat governance.",
                 "Academic Rigor: Official ECZ Grade 12 National Examination Centre with computerized clearance locks.",
                 "Catering & Logistics: Automated meal rations linked to live resident headcounts to prevent food waste."
             ],
             subtitle="Residential Safeguarding • 24/7 Pastoral Care • Senior Secondary & ECZ Centre",
             accent_color=C_EMERALD)

    # =========================================================================
    # SLIDE 3: ENTERPRISE PLATFORM ARCHITECTURE & LOCAL SOVEREIGNTY
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "Sovereign Architecture: Security, RBAC & Zero Vendor Lock-in")

    add_card(slide3, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "1. Strict RBAC Governance",
             [
                 "10 Distinct User Roles: Director, Headteacher, Bursar, Teacher, Boarding Master, Matron, Parent, Auditor.",
                 "Zero Privilege Bleed: Teachers cannot access financial ledgers; parents only see their verified biological children.",
                 "2FA Protected Ledger: All bursary journal entries and fee adjustments require secondary authorization."
             ],
             subtitle="Role-Based Security", accent_color=C_NAVY)

    add_card(slide3, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "2. Zero Data Loss & UPSERT",
             [
                 "Strict Upsert-Only Architecture: Existing production records are never wiped or overwritten destructively.",
                 "Immutable Audit Logging: Every attendance modification, score change, and payment transaction is logged.",
                 "Disaster Recovery Engine: Automated nightly database snapshots with one-click restore validation."
             ],
             subtitle="Data Safety & Integrity", accent_color=C_DEEP_BLUE)

    add_card(slide3, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "3. Offline-First Resilience",
             [
                 "Zero-Downtime Classroom Mode: Roll-call functions smoothly when Solwezi telecom cellular towers experience drops.",
                 "Background Synchronization: Data is stored in secure local storage and syncs automatically once back online.",
                 "No Cloud Dependency Lock-in: Can run on local campus servers or dedicated VPS instances."
             ],
             subtitle="Sovereign Control", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 4: FINANCIAL ENGINEERING & AUTOMATED REVENUE RECOVERY
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "Financial Architecture: Automated Revenue Recovery & Ledger")

    add_card(slide4, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Tuition & Boarding Invoicing",
             [
                 "Termly Batch Invoicing: Automatically generates tuition, boarding levy, PTA, and computer lab invoices.",
                 "Intelligent Sibling Discounts: Automatically recognizes multi-child families to apply accurate bursary policies.",
                 "Aged Debtors Intelligence: Categorizes arrears into 30, 60, and 90+ day chronic delinquency with automated reminders."
             ],
             subtitle="Revenue Capture", accent_color=C_EMERALD)

    add_card(slide4, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Mobile Money Reconciliation",
             [
                 "Instant Airtel Money & MTN MoMo Integration: Parents settle fees directly via mobile handsets.",
                 "Automated Reference Matching: Real-time clearing of invoices without manual bank slip verification.",
                 "Tamper-Evident Digital Receipts: Instant SMS receipt dispatched to parent phone upon settlement."
             ],
             subtitle="Zambian Fintech Integration", accent_color=C_DEEP_BLUE)

    add_card(slide4, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Double-Entry General Ledger",
             [
                 "100% Reconciled Financials: Complete chart of accounts mapping income vs operational expenditures.",
                 "Expenditure Tracking: Authorizations for boarding rations, diesel fuel, teacher salaries, and facility repairs.",
                 "Auditor-Ready Statements: Formatted Income & Expenditure Statements exportable to Excel and PDF."
             ],
             subtitle="Statutory Audit Readiness", accent_color=C_NAVY)

    # =========================================================================
    # SLIDE 5: ACADEMIC ENGINE & ECZ EXAM CLEARANCE
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "Academic Engine: ECZ Markbooks & Terminal Report Cards")

    add_card(slide5, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Curriculum & Grading Automation",
             [
                 "Examinations Council of Zambia (ECZ) 8-Scale: Built-in distinction (1-2), merit (3-4), credit (5-6), pass (7-8), fail (9).",
                 "Continuous Assessment (CA): Weighting of CA1, CA2, midterm mocks, and end-of-term examinations.",
                 "ECE Developmental Rubrics: Multi-domain observation tools for nursery and kindergarten cognitive growth.",
                 "Automated Subject Ranking & Cohort Analysis: Pinpoints underperforming academic subjects for prompt intervention."
             ],
             subtitle="National Curriculum Standards", accent_color=C_NAVY)

    add_card(slide5, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Official Report Cards & Exam Clearance",
             [
                 "1-Click Batch Terminal Reports: High-resolution PDF generation with school crest, grading legend, and teacher remarks.",
                 "Digital Security Stamp: Includes anti-fraud QR code linking back to sovereign institutional verification portal.",
                 "ECZ Candidate Clearance Lock: Automatically verifies student has achieved 75% attendance and 100% fee clearance before exam issuance.",
                 "Parent Portal Publishing: Headteacher approves reports online for instant guardian download."
             ],
             subtitle="Tamper-Proof Certification", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 6: 360° BOARDING HOUSE MANAGEMENT & SAFEGUARDING
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "360° Boarding House Management: Pastoral Care & Curfews")

    add_card(slide6, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Hostel & Bed Allocation",
             [
                 "Visual Room & Bed Mapping: Tracks occupancy across boys' and girls' residential blocks at Kansanshi Campus.",
                 "Safeguarding Segregation: Junior vs. Senior dorm separation enforced by system rules.",
                 "Capacity Planning: Prevents over-enrolment beyond certified health board hostel allowances."
             ],
             subtitle="Hostel Inventory", accent_color=C_DEEP_BLUE)

    add_card(slide6, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "21:00 Curfew Roll-Call",
             [
                 "Digital Nightly Bed Check: Housemasters conduct roll-call via mobile Android phone at each bed cubicle.",
                 "Instant Absentee Escalation: Any missing pupil triggers an urgent red alert on the Director's phone.",
                 "Historical Curfew Logs: Identifies repeat violators for pastoral counselling."
             ],
             subtitle="Nightly Safeguarding", accent_color=C_EMERALD)

    add_card(slide6, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Exeat & Gate Pass Governance",
             [
                 "Tri-Party Approval: Parent phone request -> Housemaster endorsement -> Security gate clearance.",
                 "Medical vs. Weekend Exeats: Tracks medical referral to Solwezi General Hospital vs family weekend leave.",
                 "Gatehouse QR Scanning: Kansanshi main security gate scans pass on phone before barrier release."
             ],
             subtitle="Perimeter Security", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 7: MULTI-HORIZON ATTENDANCE INTELLIGENCE
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "Multi-Horizon Attendance Matrix: From Daily Roll-Call to Annual Return")

    horizons = [
        ("Daily Horizon", "Morning Roll-Call", "1-Tap 'Mark All Present' with late minute tracking and excuse categorization. Dispatches SMS alerts to guardians.", C_DEEP_BLUE),
        ("Weekly Horizon", "Instructional Progression", "Tracks attendance stability across W1 to W13 of Term 3. Visualizes cohort retention fluctuations.", C_EMERALD),
        ("Monthly Horizon", "Academic Register", "31-Day statutory sheet matching Ministry of Education classroom registers for all 12 calendar months.", C_NAVY),
        ("Termly & Annual", "Statutory Return & ECZ", "Aggregates 187 annual instructional days. Computes official DEBS statistical returns and student progression standing.", C_GOLD)
    ]

    for idx, (h_title, h_sub, h_desc, h_color) in enumerate(horizons):
        left = Inches(0.8 + idx * 2.95)
        box = slide7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.5), Inches(2.85), Inches(5.3))
        box.fill.solid()
        box.fill.fore_color.rgb = C_WHITE
        box.line.color.rgb = C_CARD_BORDER

        top_strip = slide7.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.5), Inches(2.85), Inches(0.12))
        top_strip.fill.solid()
        top_strip.fill.fore_color.rgb = h_color
        top_strip.line.fill.background()

        tb = slide7.shapes.add_textbox(left + Inches(0.15), Inches(1.7), Inches(2.55), Inches(4.8))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = h_title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_NAVY

        p_sub = tf.add_paragraph()
        p_sub.text = h_sub
        p_sub.font.size = Pt(9)
        p_sub.font.color.rgb = h_color
        p_sub.space_after = Pt(10)

        p_desc = tf.add_paragraph()
        p_desc.text = h_desc
        p_desc.font.size = Pt(10)
        p_desc.font.color.rgb = C_SLATE_DARK

    # =========================================================================
    # SLIDE 8: OFFICIAL INSTITUTIONAL DOCUMENT GENERATOR
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "Official Document Generator: Letters, Badges & Verification")

    add_card(slide8, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Suite of Standardized Institutional Letters",
             [
                 "Provisional Admission Offer Letter: Formally communicates placement terms, requirements, and fee deadlines.",
                 "Official Acceptance Letter: Confirms verified enrolment for the academic year.",
                 "Introduction & Visa Letters: Standardized correspondence for Ministry, immigration, and commercial bank sponsorship.",
                 "ECZ Examination Clearance: Formal certificate confirming student has met academic and financial benchmarks.",
                 "Boarding House Accommodation Notice: Confirms dormitory room, cubicle, and assigned housemaster."
             ],
             subtitle="Institutional Integrity • Standardized Branding", accent_color=C_NAVY)

    add_card(slide8, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Security Features & Verification Architecture",
             [
                 "High-Definition Legacy Crest: Crisp, authentic school emblem rendering on all official printouts.",
                 "Dynamic Verification QR Code: Instantly verifiable by scanning with any smartphone camera.",
                 "Authorized Signatory Metadata: Pre-configured signatures of Director Mr. Emmanuel Mwansa and Registrar.",
                 "Tamper-Evident Security Stamp: Includes official school registration numbers (MOE/NWP/SOL/SEC/2026/044)."
             ],
             subtitle="Anti-Fraud Safeguards • Digital QR Verification", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 9: MULTI-CAMPUS GIS & SMART TRANSPORT FLEET
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9, "Multi-Campus GIS & Smart Transport Telematics")

    add_card(slide9, Inches(0.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Geospatial Intelligence & Catchment Mapping",
             [
                 "Dual-Campus Mapping: Pinpoints Mushitala Day Campus (-12.184° S, 26.398° E) and Kansanshi Campus (-12.132° S, 26.415° E).",
                 "Student Demographic Heatmaps: Visualizes student residential distribution across Solwezi to plan new bus stops.",
                 "Zoning & Commute Analytics: Identifies day scholars walking excessive distances for transport support."
             ],
             subtitle="Spatial Campus Analytics", accent_color=C_DEEP_BLUE)

    add_card(slide9, Inches(6.8), Inches(1.4), Inches(5.7), Inches(5.5),
             "Contactless Smart Bus Boarding",
             [
                 "In-Bus Tablet Driver App: Drivers and bus conductors record student boarding at designated pickup points.",
                 "Automated Guardian SMS Notifications: Parents receive instant alerts when their child safely boards or alights.",
                 "Fleet Fuel & Maintenance Ledger: Logs fuel consumption and servicing intervals for all school minibuses and coasters."
             ],
             subtitle="Student Transit Safeguarding", accent_color=C_EMERALD)

    # =========================================================================
    # SLIDE 10: PARENT PORTAL & GUARDIAN ENGAGEMENT
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10)
    add_header(slide10, "Parent Portal: Modern Guardian Engagement & Transparency")

    add_card(slide10, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Unified Family Dashboard",
             [
                 "Multi-Child Single Login: Parents with siblings in ECE, Primary, and Secondary view all accounts in one view.",
                 "Real-Time Attendance Feed: Know instantly if a child is marked late or absent during morning roll-call.",
                 "Behavior & Pastoral Notes: Direct communication on commendations, sports achievements, or discipline."
             ],
             subtitle="Single-Pane Guardian View", accent_color=C_DEEP_BLUE)

    add_card(slide10, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Frictionless Fee Payments",
             [
                 "Itemized Tuition Statements: Complete breakdown of tuition, boarding, uniforms, and book charges.",
                 "1-Tap Mobile Money Checkout: Pay directly with Airtel Money or MTN MoMo from the handset.",
                 "Instant Digital Receipts: Downloadable receipts for employer bursary reimbursement."
             ],
             subtitle="Revenue Acceleration", accent_color=C_EMERALD)

    add_card(slide10, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Academic Progress & Reports",
             [
                 "Continuous Assessment Tracker: Monitor performance throughout the term rather than waiting for term end.",
                 "Terminal Report Card Download: High-resolution PDF reports accessible immediately upon headteacher release.",
                 "Teacher Meeting Scheduling: Seamless booking of parent-teacher consultation sessions."
             ],
             subtitle="Academic Transparency", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 11: ANDROID NATIVE MOBILE APP (APK)
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide11)
    add_header(slide11, "Native Android App (APK): Operational Agility in the Field")

    add_card(slide11, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "1. Mobile-First Field UX",
             [
                 "Package ID: com.legacyschool.edusphere",
                 "Persistent Mobile Bottom Bar: 1-tap navigation for Dashboard, Attendance, Boarding, Finance, and All Modules.",
                 "One-Handed Smartphone Operation: Tailored for teachers walking classroom rows and housemasters patrolling dorms."
             ],
             subtitle="Engineered for Mobility", accent_color=C_NAVY)

    add_card(slide11, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "2. Hardware Integrations",
             [
                 "Camera Barcode/QR Scanner: Scan student ID badges for instant cafeteria meal access, bus boarding, and gate exeats.",
                 "Safe Area & Touch Optimizations: Built to adhere to modern Android status and navigation bar gesture ergonomics.",
                 "Lightweight APK Footprint: Compact 4.1 MB binary that installs cleanly on entry-level Android smartphones."
             ],
             subtitle="Native Device Power", accent_color=C_EMERALD)

    add_card(slide11, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "3. Over-The-Air (OTA) Updates",
             [
                 "Live Production Bridge: Configured to sync seamlessly with https://legacyschool.lamtoninvestments.com.",
                 "Zero Maintenance Friction: Feature enhancements reflect instantly in the app without requiring manual APK reinstallation.",
                 "Direct Portal Download: Hosted on the school web server for easy distribution to staff and parents."
             ],
             subtitle="Continuous Delivery", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 12: STATUTORY COMPLIANCE & MINISTRY REPORTING
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide12)
    add_header(slide12, "Statutory Compliance: Ministry of Education & Regulatory Alignment")

    add_card(slide12, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Ministry of Education Form 12A",
             [
                 "Statutory Statistical Return: Pre-aggregates learner headcounts by gender, age, and grade cohort.",
                 "Teacher-Pupil Ratio Compliance: Generates statutory staffing returns for District Education Board Secretary (DEBS).",
                 "Infrastructure Audit: Reports classroom capacity, boarding bed density, and sanitation facilities."
             ],
             subtitle="DEBS Solwezi Compliance", accent_color=C_NAVY)

    add_card(slide12, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "ECZ National Examination Centre",
             [
                 "Candidate Eligibility Gatekeeper: Ensures candidates satisfy the mandatory 75% attendance threshold.",
                 "Financial Clearance Lock: Prevents issuance of exam numbers to delinquent accounts while honoring bursaries.",
                 "Syllabus Coverage Tracking: Confirms completion of national secondary curriculum requirements."
             ],
             subtitle="Examinations Council of Zambia", accent_color=C_DEEP_BLUE)

    add_card(slide12, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "Teaching Council Governance",
             [
                 "TCZ Registration Tracking: Logs teacher registration numbers and practising certificate validity.",
                 "Automated Expiry Warnings: Alerts administration 60 days before a teacher's practising license expires.",
                 "Staff Professional Development: Records continuous professional development (CPD) modules."
             ],
             subtitle="Teaching Council of Zambia", accent_color=C_EMERALD)

    # =========================================================================
    # SLIDE 13: 4-WEEK ROLLOUT ROADMAP & SERVICE LEVEL AGREEMENT
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide13)
    add_header(slide13, "Operational Roadmap & Enterprise Service Level Agreement (SLA)")

    phases = [
        ("Week 1: Core Setup", ["Configure staff roles & RBAC", "Import existing student biodata", "Initialize 2026 Term 3 ledgers", "Deploy Android APK to leadership"]),
        ("Week 2: Staff Training", ["Teacher roll-call workshops", "Housemaster curfew training", "Bursary mobile money testing", "Bus telematics route dry-runs"]),
        ("Week 3: Guardian Launch", ["SMS onboarding to parents", "Parent portal login release", "Airtel/MTN payment activation", "Student ID card distribution"]),
        ("Week 4: Full Cutover", ["Decommission paper registers", "Automate daily absentee SMS", "Publish mid-term markbooks", "First DEBS statutory return audit"])
    ]

    for idx, (p_title, p_steps) in enumerate(phases):
        left = Inches(0.8 + idx * 2.95)
        box = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.5), Inches(2.85), Inches(4.3))
        box.fill.solid()
        box.fill.fore_color.rgb = C_WHITE
        box.line.color.rgb = C_CARD_BORDER

        top_strip = slide13.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.5), Inches(2.85), Inches(0.1))
        top_strip.fill.solid()
        top_strip.fill.fore_color.rgb = C_DEEP_BLUE
        top_strip.line.fill.background()

        tb = slide13.shapes.add_textbox(left + Inches(0.15), Inches(1.7), Inches(2.55), Inches(3.9))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = C_NAVY
        p.space_after = Pt(10)

        for s in p_steps:
            p_step = tf.add_paragraph()
            p_step.text = f"✔ {s}"
            p_step.font.size = Pt(9.5)
            p_step.font.color.rgb = C_SLATE_DARK
            p_step.space_after = Pt(6)

    sla_box = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.733), Inches(1.0))
    sla_box.fill.solid()
    sla_box.fill.fore_color.rgb = RGBColor(240, 253, 244)
    sla_box.line.color.rgb = RGBColor(187, 247, 208)

    tb_sla = slide13.shapes.add_textbox(Inches(1.0), Inches(6.05), Inches(11.3), Inches(0.85))
    tf_sla = tb_sla.text_frame
    tf_sla.word_wrap = True
    p_sla = tf_sla.paragraphs[0]
    p_sla.text = "Enterprise Service Level Agreement (SLA): 99.9% Uptime Guarantee • Automated Nightly Encrypted Backups • Dedicated On-Site Technical Support for Solwezi Multi-Campus Operations"
    p_sla.font.size = Pt(10.5)
    p_sla.font.bold = True
    p_sla.font.color.rgb = RGBColor(22, 101, 52)

    # =========================================================================
    # SLIDE 14: EXECUTIVE RECOMMENDATIONS FOR BOARD APPROVAL
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide14, C_NAVY)

    box14 = slide14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.0), Inches(11.333), Inches(5.5))
    box14.fill.solid()
    box14.fill.fore_color.rgb = RGBColor(15, 45, 82)
    box14.line.color.rgb = C_GOLD
    box14.line.width = Pt(1.5)

    tb14 = slide14.shapes.add_textbox(Inches(1.4), Inches(1.4), Inches(10.5), Inches(4.7))
    tf14 = tb14.text_frame
    tf14.word_wrap = True

    p14_1 = tf14.paragraphs[0]
    p14_1.text = "EXECUTIVE RECOMMENDATIONS FOR STAKEHOLDER & BOARD APPROVAL"
    p14_1.font.size = Pt(15)
    p14_1.font.bold = True
    p14_1.font.color.rgb = C_GOLD
    p14_1.space_after = Pt(14)

    recs = [
        "1. Authorize Sovereign Multi-Campus SMIS Adoption: Formally approve EduSphere as the sole official operational platform across Mushitala Day and Kansanshi Boarding campuses.",
        "2. Approve Native Android APK Deployment: Authorize distribution of the com.legacyschool.edusphere mobile application to all teachers, boarding masters, and parents.",
        "3. Mandate Digital Official Letters: Adopt the automated official document generator with QR verification stamps for all acceptance, offer, and introduction correspondence.",
        "4. Institutionalize Mobile Money Invoicing: Formally activate integrated Airtel Money and MTN MoMo collection channels to accelerate fee clearance and eliminate unrecorded cash transactions.",
        "5. Commit to 4-Week Full Cutover Roadmap: Direct the Academic, Finance, and ICT leadership to complete staff onboarding for full Term 3 operational excellence."
    ]

    for r in recs:
        p_r = tf14.add_paragraph()
        p_r.text = r
        p_r.font.size = Pt(11)
        p_r.font.bold = True
        p_r.font.color.rgb = C_WHITE
        p_r.space_after = Pt(8)

    p14_sign = tf14.add_paragraph()
    p14_sign.text = "\nPrepared for Legacy School Solwezi • Office of the School Director & Principal, Mr. Emmanuel Mwansa"
    p14_sign.font.size = Pt(11)
    p14_sign.font.italic = True
    p14_sign.font.color.rgb = RGBColor(203, 213, 225)

    output_path = r"c:\edusphere\Legacy_School_EduSphere_Executive_Presentation.pptx"
    prs.save(output_path)
    print(f"Master executive presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
