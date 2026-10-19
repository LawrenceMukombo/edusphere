# create_worldclass_executive_deck.py
# Generates an ultra-premium, 15-slide executive presentation deck (.pptx)
# featuring real high-resolution software screenshots, commercial investment tables,
# ROI calculations, native Android APK architecture, and statutory MoE compliance.

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

    # Theme Colors
    C_NAVY = RGBColor(11, 37, 69)         # #0B2545 - Deep Institutional Navy
    C_DEEP_BLUE = RGBColor(19, 64, 116)   # #134074 - Royal Accent Blue
    C_LIGHT_BG = RGBColor(248, 250, 252)  # #F8FAFC - Clean Slate Light Background
    C_GOLD = RGBColor(212, 175, 55)       # #D4AF37 - Legacy Gold
    C_EMERALD = RGBColor(16, 185, 129)    # #10B981 - Success Green
    C_SLATE_DARK = RGBColor(30, 41, 59)   # #1E293B - Dark Charcoal
    C_SLATE_MUTED = RGBColor(100, 116, 139) # #64748B - Secondary Muted
    C_WHITE = RGBColor(255, 255, 255)
    C_CARD_BORDER = RGBColor(226, 232, 240)
    C_CARD_BG = RGBColor(255, 255, 255)

    screenshots_dir = r"E:\Screenshots"

    def set_slide_background(slide, color=C_LIGHT_BG):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category="LEGACY SCHOOL SOLWEZI • EXECUTIVE STRATEGY & TECHNOLOGY DEPLOYMENT"):
        # Top banner background
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(1.1))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = C_NAVY
        top_bar.line.fill.background()

        # Category / breadcrumb
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

    def add_split_slide(slide, title_text, category, section_title, bullets, screenshot_filename, kpi_badges=None):
        set_slide_background(slide)
        add_header(slide, title_text, category)

        # Left Column: Card Container
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.35), Inches(5.1), Inches(5.85))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1)

        # Top Accent Stripe on Left Card
        stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(5.1), Inches(0.1))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = C_DEEP_BLUE
        stripe.line.fill.background()

        tb = slide.shapes.add_textbox(Inches(1.0), Inches(1.55), Inches(4.7), Inches(5.45))
        tf = tb.text_frame
        tf.word_wrap = True

        p_sec = tf.paragraphs[0]
        p_sec.text = section_title
        p_sec.font.size = Pt(13)
        p_sec.font.bold = True
        p_sec.font.color.rgb = C_NAVY
        p_sec.space_after = Pt(8)

        for b_title, b_desc in bullets:
            p_b = tf.add_paragraph()
            p_b.text = f"✔ {b_title} "
            p_b.font.size = Pt(9.5)
            p_b.font.bold = True
            p_b.font.color.rgb = C_SLATE_DARK

            p_desc_run = p_b.add_run()
            p_desc_run.text = b_desc
            p_desc_run.font.bold = False
            p_desc_run.font.color.rgb = C_SLATE_MUTED
            p_b.space_after = Pt(5)

        # Right Column: Screenshot Container
        right_left = Inches(6.1)
        right_top = Inches(1.35)
        right_width = Inches(6.433)
        right_height = Inches(5.85)

        img_path = os.path.join(screenshots_dir, screenshot_filename)
        if os.path.exists(img_path):
            # Frame card for screenshot
            frame = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_left, right_top, right_width, right_height)
            frame.fill.solid()
            frame.fill.fore_color.rgb = C_WHITE
            frame.line.color.rgb = C_CARD_BORDER
            frame.line.width = Pt(1)

            # Insert picture centered inside frame
            slide.shapes.add_picture(img_path, right_left + Inches(0.12), right_top + Inches(0.12), width=right_width - Inches(0.24))

        # Optional KPI Badges on bottom of right column if needed
        if kpi_badges:
            badge_tb = slide.shapes.add_textbox(right_left, Inches(6.8), right_width, Inches(0.4))
            badge_tf = badge_tb.text_frame
            badge_p = badge_tf.paragraphs[0]
            badge_p.text = " • ".join(kpi_badges)
            badge_p.font.size = Pt(9)
            badge_p.font.bold = True
            badge_p.font.color.rgb = C_DEEP_BLUE

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

    title_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.4), Inches(10.9), Inches(1.2))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "LEGACY SCHOOL SOLWEZI"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = C_GOLD

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "EduSphere SMIS: Enterprise Sovereign Modernization"
    p1_sub.font.size = Pt(28)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = C_WHITE

    desc_box = slide1.shapes.add_textbox(Inches(1.2), Inches(2.7), Inches(10.5), Inches(1.6))
    tf_desc = desc_box.text_frame
    tf_desc.word_wrap = True
    p_desc = tf_desc.paragraphs[0]
    p_desc.text = "Comprehensive Multi-Campus Management, Automated Revenue Recovery, ECZ Academic Markbooks, 360° Boarding Safeguarding & Native Android Mobile Operations."
    p_desc.font.size = Pt(13)
    p_desc.font.color.rgb = RGBColor(226, 232, 240)
    p_desc.space_after = Pt(8)

    p_desc2 = tf_desc.add_paragraph()
    p_desc2.text = "Presented to: School Board of Governors, Director & Principal Mr. Emmanuel Mwansa, and Ministry of Education"
    p_desc2.font.size = Pt(12)
    p_desc2.font.bold = True
    p_desc2.font.color.rgb = C_GOLD

    meta_box = slide1.shapes.add_textbox(Inches(1.2), Inches(4.7), Inches(10.5), Inches(1.4))
    tf_meta = meta_box.text_frame
    tf_meta.word_wrap = True
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "Operational Academic Session: 2026 Term 3 • Solwezi, North-Western Province, Zambia\nCampuses: Mushitala Day Campus & Kansanshi Boarding Campus"
    p_meta.font.size = Pt(11)
    p_meta.font.color.rgb = RGBColor(148, 163, 184)
    p_meta.space_after = Pt(6)

    p_meta2 = tf_meta.add_paragraph()
    p_meta2.text = "Key Assets: Native Android APK • Zero-Loss Financial Ledger • 5-Horizon Attendance • Anti-Fraud QR Official Letters"
    p_meta2.font.size = Pt(10)
    p_meta2.font.bold = True
    p_meta2.font.color.rgb = C_EMERALD

    # =========================================================================
    # SLIDE 2: DUAL-CAMPUS TOPOLOGY & EXECUTIVE SUMMARY
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "Executive Strategic Summary: Moving from Manual Risk to Automated Sovereignty")

    cards_data = [
      ("Operational Fragmentation & Risk", "Manual paper fee receipts, paper registers, and untracked boarding movements previously exposed the institution to financial leaks, reconciliatory blind spots, and pastoral anxiety across Solwezi.", RGBColor(239, 68, 68)),
      ("Unified Multi-Campus Orchestration", "EduSphere connects Mushitala Day (520 pupils, ECE to Grade 9) and Kansanshi Boarding (260 pupils, Grades 10-12) into one synchronized general ledger, single-login dashboard, and ECZ grading standard.", C_DEEP_BLUE),
      ("Measurable Revenue & Safeguarding ROI", "Recovers aged debtor balances via automated Mobile Money billing, eliminates unverified boarding, and automates real-time SMS alerts when learners tap their ID cards onto school shuttles.", C_EMERALD)
    ]

    for i, (heading, text, accent_color) in enumerate(cards_data):
        left = Inches(0.8 + i * 3.95)
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.4), Inches(3.8), Inches(4.3))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = C_CARD_BORDER

        stripe = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.4), Inches(3.8), Inches(0.12))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = accent_color
        stripe.line.fill.background()

        tb = slide2.shapes.add_textbox(left + Inches(0.25), Inches(1.7), Inches(3.3), Inches(3.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = heading
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = C_SLATE_DARK
        p.space_after = Pt(10)

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = C_SLATE_MUTED

    bot = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.9), Inches(11.733), Inches(1.1))
    bot.fill.solid()
    bot.fill.fore_color.rgb = RGBColor(238, 242, 255)
    bot.line.color.rgb = RGBColor(199, 210, 254)
    tb_bot = slide2.shapes.add_textbox(Inches(1.0), Inches(6.0), Inches(11.3), Inches(0.9))
    tf_bot = tb_bot.text_frame
    tf_bot.word_wrap = True
    p_b = tf_bot.paragraphs[0]
    p_b.text = "Institutional Scale Overview: 780 Active Learners  •  48 Professional Staff  •  16 Class Cohorts  •  4 Bus Routes  •  350 Boarding Beds • 2 Campuses"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = C_NAVY

    # =========================================================================
    # SLIDE 3: EXECUTIVE DASHBOARD & REAL-TIME COMMAND CENTER
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide3,
        "Executive Command Center: Real-Time Governance for Director Emmanuel Mwansa",
        "EXECUTIVE OVERSIGHT • LIVE MULTI-CAMPUS METRICS",
        "Single-Pane Sovereign Operations",
        [
            ("Unified Dual-Campus Switcher:", "Toggle instantly between Consolidated View, Mushitala Day Campus, and Kansanshi Boarding Campus."),
            ("Live Financial Health Metrics:", "Tracks real-time collection rates (91.2%), term fee recovery, and authorized operational vouchers."),
            ("Daily Attendance Intelligence:", "Instant monitoring of morning roll-calls across all 16 cohorts (97.4% current rate with zero paper lag)."),
            ("Cleaned Navigation & Ticking Clock:", "Ultra-slim institutional header featuring live Central Africa Time (CAT) synchronised to national time servers."),
            ("Quick Resource Downloads:", "Direct 1-tap download of the Executive PowerPoint Deck, Android APK, and Stakeholder User Guide.")
        ],
        "Screenshot 2026-10-19 154312.png",
        kpi_badges=["780 Enrolled Learners", "97.4% Attendance Rate", "ZMW 1,824,000 Collected", "Zero Variance"]
    )

    # =========================================================================
    # SLIDE 4: ADMISSIONS & STUDENT 360° DOSSIER
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide4,
        "Admissions & Learner Registry: Digital Onboarding & KYC Compliance",
        "STUDENT INFORMATION SYSTEM (SIS) • ADMISSIONS",
        "Holistic Learner Identity Management",
        [
            ("Unique Zambian MoE Numbering:", "Issues permanent registration codes (e.g., LS-2026-0042) ensuring seamless national compliance."),
            ("Cadre & Residence Assignment:", "Enforces strict segregation between Day Scholars (Mushitala) and Full Residential Boarders (Kansanshi)."),
            ("Verified Guardian Linkage:", "Captures biological and legal guardians with phone numbers (+260) for instant SMS notifications and Parent Portal access."),
            ("Medical & Dietary Profiles:", "Tracks chronic conditions, allergies, and emergency blood groups accessible to the boarding nurse."),
            ("Interactive Modal Roster:", "Instant editing of student records without background modal overlap or page reloads.")
        ],
        "Screenshot 2026-10-19 065713.png",
        kpi_badges=["100% KYC Verified", "Digital Student Folders", "Automated Sibling Links"]
    )

    # =========================================================================
    # SLIDE 5: OFFICIAL INSTITUTIONAL DOCUMENT GENERATOR
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide5,
        "Official Document Generator: Letters with Authentic School Crest & QR Verification",
        "INSTITUTIONAL INTEGRITY • STANDARDIZED CORRESPONDENCE",
        "Tamper-Proof Digital Document Suite",
        [
            ("Full Suite of Letters:", "Generates Provisional Offer Letters, Official Acceptance Letters, Introduction / Visa Letters, and ECZ Exam Clearance."),
            ("Authentic High-Definition Crest:", "Displays verified Legacy School Solwezi insignia, official motto, and Ministry registration numbers."),
            ("Dynamic Verification QR Stamp:", "Every document embeds an anti-fraud cryptographic QR code verifiable on any smartphone camera."),
            ("Authorized Signatory Blocks:", "Pre-formatted signatures and titles of Director Mr. Emmanuel Mwansa and Head of Admissions."),
            ("1-Click PDF Export:", "Produces pixel-perfect printable A4 PDF documents ready for physical dispatch or digital transmission.")
        ],
        "Screenshot 2026-10-19 065552.png",
        kpi_badges=["Anti-Fraud QR Stamp", "MOE/NWP/SOL/SEC/2026/044", "Instant PDF Generation"]
    )

    # =========================================================================
    # SLIDE 6: MULTI-HORIZON ATTENDANCE INTELLIGENCE
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide6,
        "Multi-Horizon Attendance Matrix: From Morning Roll-Call to Annual Return",
        "STATUTORY TRACKING • 5 OPERATIONAL HORIZONS",
        "Precision Retention Monitoring",
        [
            ("Daily Morning Roll-Call:", "1-tap 'Mark All Present' with instant toggle for late arrivals (with minutes) and illness excuses."),
            ("Weekly Horizon Progression:", "Monitors attendance stability across Weeks 1 to 13 of Term 3, identifying engagement dips early."),
            ("Monthly Academic Register:", "31-day matrix matching statutory Ministry of Education classroom attendance registers."),
            ("Termly & Annual Return:", "Aggregates 187 statutory instructional days, computing official DEBS statistical returns."),
            ("ECZ Examination Gatekeeper:", "Automatically flags students below the mandatory 75% attendance threshold for examination intervention.")
        ],
        "Screenshot 2026-10-19 065354.png",
        kpi_badges=["187 Annual School Days", "75% ECZ Threshold", "Automated Parent SMS Alerts"]
    )

    # =========================================================================
    # SLIDE 7: FEES MANAGEMENT & CASHBOOK RECONCILIATION
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide7,
        "Fees Management & Cashbook Control: Zero-Variance Financial Governance",
        "BURSARY & TREASURY • FINANCIAL ENGINEERING",
        "Automated Multi-Channel Revenue Collection",
        [
            ("Zero-Variance Reconciliation:", "All 780 student ledger accounts match official receipts with zero discrepancy across Zanaco, Stanbic, and Mobile Money."),
            ("Integrated Mobile Money:", "Direct push-prompt fee payment via Airtel Money and MTN MoMo with instant digital receipt dispatch."),
            ("Multi-Campus Fee Isolation:", "Independent billing schedules for Urban Day Tuition (K2,800) and Mushitala Boarding (K10,400)."),
            ("Aged Debtors Intelligence:", "Visual ledger categorizing 30, 60, and 90+ day balances to systematically recover pending fee arrears."),
            ("2FA Protected General Ledger:", "Adjustments and disbursements require secondary financial authorization to prevent fraud.")
        ],
        "Screenshot 2026-10-18 100745.png",
        kpi_badges=["ZMW 2.1M Tracked", "Airtel & MTN MoMo", "Debtors Ageing Analysis", "Auditor-Ready"]
    )

    # =========================================================================
    # SLIDE 8: TEACHER WORKSPACE & ACADEMIC MARKBOOKS
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide8,
        "Teacher Workspace: ECZ Assessment Suite & 3-Tier Supervisory Sign-Off",
        "ACADEMICS & CURRICULUM • NATIONAL GRADING STANDARDS",
        "Standardized Scholastic Markbook",
        [
            ("All 16 Cohorts Selectable:", "Seamlessly switches between Early Years, Grades 1-7, and Forms 1-5 with full 30 to 44 student rosters."),
            ("Examinations Council of Zambia (ECZ) Scale:", "Built-in distinction (1-2), merit (3-4), credit (5-6), pass (7-8), and fail (9)."),
            ("Continuous Assessment (CA) Weighting:", "Weekly Topic Tests (15%), CA (25%), Mock Exams (20%), and Term Finals (40%) = 100% total."),
            ("3-Tier Supervisory Workflow:", "Class Teacher submits -> Senior Teacher / HOD endorses -> Principal gives final approval before publication."),
            ("1-Click Batch Terminal Reports:", "High-resolution PDF report cards with school crest, grading legend, and teacher remarks.")
        ],
        "Screenshot 2026-10-18 102645.png",
        kpi_badges=["ECZ 8-Point Scale", "Continuous Assessment", "3-Tier Supervisory Sign-Off"]
    )

    # =========================================================================
    # SLIDE 9: 360° BOARDING HOUSE MANAGEMENT & SAFEGUARDING
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide9,
        "360° Boarding House Management: Pastoral Care & 21:00 Curfew Safeguarding",
        "RESIDENTIAL CARE • KANSANSHI BOARDING CAMPUS",
        "Holistic Pastoral Care & Resident Welfare",
        [
            ("Accommodation & Bed Inventory:", "Real-time room and bed allocations for 280+ boarders across Kansanshi Boys and Kalumbila Girls Halls."),
            ("21:00 Nightly Curfew Bed Check:", "Housemasters conduct digital roll-call on mobile phones; missing students trigger instant alerts to the Director."),
            ("Digital Exeat Pass Workflow:", "Approval trail for weekend exeats, medical visits to Solwezi Hospital, and sports travel with SMS verification."),
            ("Perimeter Gatehouse QR Scanner:", "Security officers at Kansanshi main gate scan mobile passes before barrier release."),
            ("Catering & Dining Hall Rations:", "Meal attendance linked to resident headcount to optimize kitchen inventory and prevent food waste.")
        ],
        "Screenshot 2026-10-18 100114.png",
        kpi_badges=["350 Certified Beds", "21:00 Digital Curfew", "QR Exeat Gate Passes"]
    )

    # =========================================================================
    # SLIDE 10: MULTI-CAMPUS GIS & SMART BUS FLEET
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide10,
        "Multi-Campus GIS & Smart Transport Telematics: Live Tracking & Safe Transit",
        "SPATIAL INTELLIGENCE • SMART BUS FLEET",
        "Sovereign GIS & Student Transit Logistics",
        [
            ("Pairwise Road Distance Matrix:", "High-resolution satellite mapping calculates 3.80 km road distance (~7 mins drive time) between campuses."),
            ("Contactless Smart ID Card Boarding:", "Learners carry smart PVC cards with NFC/QR codes tapped onto in-bus Android tablets."),
            ("Instant Parent SMS Transit Alerts:", "'[EduSphere] Bupe Mwewa boarded BUS-SOL-02 at Kansanshi Golf Estate at 06:46 AM.'"),
            ("Wrong-Bus Lockout Protection:", "Tablet sounds an audible alert if a child boards the wrong shuttle route or attempts to exit at the wrong stop."),
            ("Offline Store-and-Forward:", "Pockets along Kansanshi Road with poor cellular coverage store taps locally and auto-sync when reconnected.")
        ],
        "Screenshot 2026-10-18 102033.png",
        kpi_badges=["3.8 km Inter-Campus Road", "4 Bus Routes", "Automated Parent Transit SMS"]
    )

    # =========================================================================
    # SLIDE 11: PARENT & GUARDIAN FAMILY PORTAL
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    add_split_slide(
        slide11,
        "Parent Portal: Multi-Child Family Academic, Attendance & Fee Center",
        "GUARDIAN SELF-SERVICE • PARENT ENGAGEMENT",
        "Transparent Family Engagement",
        [
            ("Multi-Ward Family Switcher:", "Parents with multiple children across ECE, Primary, and Secondary toggle all records in one unified login."),
            ("Historical Academic Progression:", "Multi-term trend charts illustrate subject growth and cohort standing over academic sessions."),
            ("Instant Mobile Money Fee Payment:", "Direct tuition settlement via Airtel Money and MTN MoMo with instant digital receipt generation."),
            ("Live Absence & Conduct Feed:", "Guardians receive immediate alerts regarding morning roll-call attendance, conduct, and commendations."),
            ("Official Report Card Downloads:", "View and download high-resolution terminal report cards the moment they are approved by the Headteacher.")
        ],
        "Screenshot 2026-10-18 102357.png",
        kpi_badges=["Multi-Ward Single Login", "1-Tap Mobile Money", "Instant Report Card PDF"]
    )

    # =========================================================================
    # SLIDE 12: NATIVE ANDROID MOBILE APP (APK)
    # =========================================================================
    slide12 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide12)
    add_header(slide12, "Native Android Mobile App: Operational Agility in the Field")

    add_card(slide12, Inches(0.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "1. Mobile-First Field UX",
             [
                 "Package ID: com.legacyschool.edusphere",
                 "Persistent Mobile Bottom Bar: Instant 1-tap navigation for Dashboard, Attendance, Boarding, Finance, and All Modules.",
                 "One-Handed Smartphone Ergonomics: Optimized for teachers walking classroom rows and housemasters patrolling dorms.",
                 "Ultra-Lightweight Footprint: Compact 4.1 MB binary that installs cleanly on entry-level Android smartphones."
             ],
             subtitle="Engineered for Mobility", accent_color=C_NAVY)

    add_card(slide12, Inches(4.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "2. Native Hardware Power",
             [
                 "Camera Barcode/QR Scanner: Scan student ID badges for instant cafeteria meal access, bus boarding, and gate exeats.",
                 "Offline Store-and-Forward: Teachers take attendance without cellular internet; data syncs when Wi-Fi is detected.",
                 "Safe Area Insets: Native padding respecting Android status bars and gesture navigation bars.",
                 "Vibrate & Audio Feedback: Confirms successful barcode scans with tactile haptic confirmation."
             ],
             subtitle="Native Device Integration", accent_color=C_EMERALD)

    add_card(slide12, Inches(8.8), Inches(1.4), Inches(3.7), Inches(5.5),
             "3. Over-The-Air (OTA) Delivery",
             [
                 "Live Production Bridge: Connects directly with https://legacyschool.lamtoninvestments.com.",
                 "Instant Zero-Reinstall Updates: New features and fee updates reflect immediately without rebuilding the APK.",
                 "Direct Server Hosting: Staff and parents download the APK directly from the school web portal.",
                 "Play Store Ready: Android App Bundle (.aab) configured for Google Play Console submission if desired."
             ],
             subtitle="Seamless Distribution", accent_color=C_GOLD)

    # =========================================================================
    # SLIDE 13: INSTITUTIONAL SUBSCRIPTION TIERS & MODULE LICENSING
    # =========================================================================
    slide13 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide13)
    add_header(slide13, "Institutional Subscription Tiers & Licensing Architecture")

    tiers_data = [
        (
            "Starter Academic",
            "ENTRY TIER",
            "ZMW 24,000 / year",
            "$925 / year  •  ZMW 8,000 / term",
            "Quota: Up to 350 Enrolled Learners",
            "Core modules for small single-campus primary or secondary day schools:",
            [
                "Operations & Attendance Register (Daily roll-call, MoE Form 12A)",
                "School Calendar & Birthday Roster (Term dates, holiday tracking)",
                "Academics & ECZ Gradebook Reports (Assessments, report cards)"
            ],
            C_DEEP_BLUE,
            False
        ),
        (
            "Professional SMIS",
            "MOST POPULAR",
            "ZMW 42,000 / year",
            "$1,615 / year  •  ZMW 14,000 / term",
            "Quota: Up to 750 Enrolled Learners",
            "Adds Boarding, Finance Inflows, and Teacher Workspaces:",
            [
                "All Starter Academic Core Modules (Attendance, Calendar, Academics)",
                "Boarding Houses & Kansanshi Village (Bed allocations, 21:00 curfew, exeats)",
                "Fees Management & Expenditure Control (Mobile Money, cashbook, debtors ledger)",
                "Teacher Workspace & Lesson Plans (Syllabus pacing, pupil remarks)"
            ],
            C_EMERALD,
            False
        ),
        (
            "Sovereign Enterprise",
            "COMPLETE SUITE • ACTIVE TIER",
            "ZMW 65,000 / year",
            "$2,500 / year  •  ZMW 21,667 / term",
            "Quota: 1,200+ Learners (Multi-Campus)",
            "Complete institutional suite deployed for Legacy School Solwezi:",
            [
                "All Professional SMIS Modules (Attendance, Boarding, Fees, Academics)",
                "Staff HR & Teaching Council of Zambia (TCZ) Compliance Suite",
                "Solwezi GIS & Campus Fleet Tracking (Minibus GPS telematics)",
                "Admissions SIS & Official Document Generator (Letters with QR stamp)",
                "Parent Portal Family Center & Automated WhatsApp/SMS Alerts",
                "Fixed Asset Management & Inventory Ledger",
                "Native Android Mobile APK (com.legacyschool.edusphere)",
                "Dual-Campus Multi-Tenant Consolidation (Mushitala Day & Kansanshi Boarding)"
            ],
            C_GOLD,
            True
        ),
    ]

    for idx, (t_name, t_badge, t_price, t_subprice, t_quota, t_desc, t_modules, t_color, is_active) in enumerate(tiers_data):
        left = Inches(0.8 + idx * 3.95)
        card = slide13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.35), Inches(3.8), Inches(5.85))
        card.fill.solid()
        card.fill.fore_color.rgb = RGBColor(240, 249, 255) if is_active else C_WHITE
        card.line.color.rgb = C_GOLD if is_active else C_CARD_BORDER
        card.line.width = Pt(1.5 if is_active else 1)

        # Top stripe
        stripe = slide13.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.35), Inches(3.8), Inches(0.12))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = t_color
        stripe.line.fill.background()

        tb = slide13.shapes.add_textbox(left + Inches(0.2), Inches(1.55), Inches(3.4), Inches(5.5))
        tf = tb.text_frame
        tf.word_wrap = True

        p_badge = tf.paragraphs[0]
        p_badge.text = t_badge
        p_badge.font.size = Pt(9)
        p_badge.font.bold = True
        p_badge.font.color.rgb = t_color

        p_name = tf.add_paragraph()
        p_name.text = t_name
        p_name.font.size = Pt(15)
        p_name.font.bold = True
        p_name.font.color.rgb = C_NAVY
        p_name.space_after = Pt(2)

        p_price = tf.add_paragraph()
        p_price.text = t_price
        p_price.font.size = Pt(16)
        p_price.font.bold = True
        p_price.font.color.rgb = C_NAVY

        p_subprice = tf.add_paragraph()
        p_subprice.text = t_subprice
        p_subprice.font.size = Pt(9.5)
        p_subprice.font.bold = True
        p_subprice.font.color.rgb = C_EMERALD
        p_subprice.space_after = Pt(4)

        p_quota = tf.add_paragraph()
        p_quota.text = t_quota
        p_quota.font.size = Pt(10)
        p_quota.font.bold = True
        p_quota.font.color.rgb = C_DEEP_BLUE
        p_quota.space_after = Pt(6)

        p_desc = tf.add_paragraph()
        p_desc.text = t_desc
        p_desc.font.size = Pt(9)
        p_desc.font.color.rgb = C_SLATE_MUTED
        p_desc.space_after = Pt(6)

        for m in t_modules:
            p_m = tf.add_paragraph()
            p_m.text = f"✔ {m}"
            p_m.font.size = Pt(8.5)
            p_m.font.color.rgb = C_SLATE_DARK
            p_m.space_after = Pt(3)

    # =========================================================================
    # SLIDE 14: HARDWARE, IMPLEMENTATION & EXECUTIVE ROI BREAKDOWN
    # =========================================================================
    slide14 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide14)
    add_header(slide14, "Turnkey Implementation, Smart Bus Hardware & Executive ROI")

    # Table of Costings
    rows = 7
    cols = 4
    left = Inches(0.8)
    top = Inches(1.35)
    width = Inches(11.733)
    height = Inches(4.3)

    table_shape = slide14.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table

    table.columns[0].width = Inches(4.2)
    table.columns[1].width = Inches(4.0)
    table.columns[2].width = Inches(1.8)
    table.columns[3].width = Inches(1.733)

    headers = ["Investment Component / Deliverable", "Scope of Coverage & Specifications", "Year 1 (ZMW)", "USD Equiv."]
    for col_idx, h in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.text = h
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(10)
            p.font.bold = True
            p.font.color.rgb = C_GOLD

    cost_rows = [
      ("EduSphere Sovereign Enterprise Core (Active Tier)", "Full Multi-Campus License: SIS, Finance, Academics, GIS, Boarding, HR & Android APK", "K 65,000", "$ 2,500"),
      ("Implementation, Historical Seeding & Setup", "Data migration of 780 students, 48 staff profiles, database configuration, and backup setup", "K 28,000", "$ 1,075"),
      ("Smart Bus Hardware (2 In-Vehicle Tablets)", "2x Rugged 7-inch Android In-Bus Tablets, NFC RFID readers, GPS mounts, and 4G SIM integration", "K 19,500", "$ 750"),
      ("Smart Student Contactless ID Cards (800 Cards)", "800 Dual-Frequency MIFARE 13.56MHz + QR printed PVC student smart identification badges", "K 16,000", "$ 615"),
      ("Staff Onboarding & Operational Training", "Hands-on workshops for 48 staff (Bursars, HODs, Teachers, Matrons, Drivers, and Management)", "K 14,500", "$ 560"),
      ("TOTAL YEAR 1 CAPITAL & IMPLEMENTATION INVESTMENT", "Complete sovereign school digital ecosystem with full warranty, SLA support, and daily backups", "K 143,000", "$ 5,500"),
    ]

    for row_idx, r in enumerate(cost_rows):
        is_total = (row_idx == len(cost_rows) - 1)
        for col_idx, text in enumerate(r):
            cell = table.cell(row_idx + 1, col_idx)
            cell.text = text
            if is_total:
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(238, 242, 255)
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(10 if not is_total else 11)
                p.font.bold = is_total
                p.font.color.rgb = C_NAVY if is_total else C_SLATE_DARK

    # Bottom ROI Callout Box
    tb_roi = slide14.shapes.add_textbox(Inches(0.8), Inches(5.85), Inches(11.733), Inches(1.3))
    tf_roi = tb_roi.text_frame
    tf_roi.word_wrap = True
    p_roi = tf_roi.paragraphs[0]
    p_roi.text = "Return on Investment (ROI) Justification for Executive Management & Board:"
    p_roi.font.size = Pt(11)
    p_roi.font.bold = True
    p_roi.font.color.rgb = C_NAVY

    p_roi_2 = tf_roi.add_paragraph()
    p_roi_2.text = "1. Immediate Arrears Recovery: Automating parent Mobile Money prompts captures ~15% of the K279,000 pending fee balances within 30 days (+K41,850 recovered).\n2. Printing Cost Elimination: Eliminating physical carbon-copy paper receipts and printed report cards saves ~K22,000 annually.\n3. Fuel & Route Optimization: Smart GPS route stop planning saves ~10-15% on diesel transport costs across both shuttles."
    p_roi_2.font.size = Pt(9.5)
    p_roi_2.font.color.rgb = C_SLATE_MUTED

    # =========================================================================
    # SLIDE 15: IMPLEMENTATION ROADMAP & ROLLOUT SCHEDULE
    # =========================================================================
    slide15 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide15)
    add_header(slide15, "Deployment Timeline: 4-Week Fast-Track Execution Schedule")

    phases = [
      ("Week 1: Sovereign Setup", [
        "Deploy Dockerized PostgreSQL & Next.js engine",
        "Configure automated nightly off-site database backups",
        "Migrate 780 legacy learner profiles and fee balances",
        "Finalize custom theme colors & school crest branding"
      ]),
      ("Week 2: Smart Bus & Mobile", [
        "Procure and program 800 MIFARE NFC student ID cards",
        "Install 2x Android in-bus GPS telematics tablets",
        "Deploy native Android APK to staff devices",
        "Test driver route navigation and geofenced bus stops"
      ]),
      ("Week 3: Staff Training", [
        "Conduct workshops for 48 staff members across cadres",
        "Train teachers on topic test, CA, and mock exam entry",
        "Train bursar and finance staff on cashbook vouchers",
        "Conduct mock roll-call attendance on shuttle routes"
      ]),
      ("Week 4: Full Cutover & Go-Live", [
        "Dispatch parent SMS credentials and onboarding guide",
        "Open Airtel & MTN Mobile Money payment channels",
        "Publish official Term 3 digital report cards",
        "Transition to 24/7 technical monitoring & SLA support"
      ]),
    ]

    for idx, (p_title, p_steps) in enumerate(phases):
        left = Inches(0.8 + idx * 2.95)
        box = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.4), Inches(2.85), Inches(4.3))
        box.fill.solid()
        box.fill.fore_color.rgb = C_WHITE
        box.line.color.rgb = C_CARD_BORDER

        top_strip = slide15.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.4), Inches(2.85), Inches(0.1))
        top_strip.fill.solid()
        top_strip.fill.fore_color.rgb = C_DEEP_BLUE
        top_strip.line.fill.background()

        tb = slide15.shapes.add_textbox(left + Inches(0.15), Inches(1.6), Inches(2.55), Inches(3.9))
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

    sla_box = slide15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.733), Inches(1.0))
    sla_box.fill.solid()
    sla_box.fill.fore_color.rgb = RGBColor(240, 253, 244)
    sla_box.line.color.rgb = RGBColor(187, 247, 208)

    tb_sla = slide15.shapes.add_textbox(Inches(1.0), Inches(6.05), Inches(11.3), Inches(0.85))
    tf_sla = tb_sla.text_frame
    tf_sla.word_wrap = True
    p_sla = tf_sla.paragraphs[0]
    p_sla.text = "Enterprise Service Level Agreement (SLA): 99.9% Uptime Guarantee  •  Daily Encrypted Off-Site Backups  •  Dedicated On-Call Technical Support for Solwezi Operations"
    p_sla.font.size = Pt(10.5)
    p_sla.font.bold = True
    p_sla.font.color.rgb = RGBColor(22, 101, 52)

    # =========================================================================
    # SLIDE 16: CONCLUSION & ACTIONABLE RECOMMENDATION
    # =========================================================================
    slide16 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide16, C_NAVY)

    box16 = slide16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.0), Inches(11.333), Inches(5.5))
    box16.fill.solid()
    box16.fill.fore_color.rgb = RGBColor(15, 45, 82)
    box16.line.color.rgb = C_GOLD
    box16.line.width = Pt(1.5)

    tb16 = slide16.shapes.add_textbox(Inches(1.4), Inches(1.4), Inches(10.5), Inches(4.7))
    tf16 = tb16.text_frame
    tf16.word_wrap = True

    p16_1 = tf16.paragraphs[0]
    p16_1.text = "SUMMARY OF RECOMMENDATIONS FOR EXECUTIVE APPROVAL"
    p16_1.font.size = Pt(14)
    p16_1.font.bold = True
    p16_1.font.color.rgb = C_GOLD
    p16_1.space_after = Pt(12)

    recs = [
      "1. Approve Sovereign SMIS Deployment: Authorize transition from manual paper to EduSphere across Mushitala and Kansanshi campuses.",
      "2. Greenlight Smart Bus Hardware Integration: Commission in-bus Android telematics tablets and 800 NFC learner ID cards for automated boarding verification and SMS parent alerts.",
      "3. Activate Integrated Mobile Money Gateway: Formalize Airtel & MTN merchant aggregators to allow instant parent tuition settlements, reducing aged debt.",
      "4. Deploy Native Android APK to Field Staff: Authorize rollout of com.legacyschool.edusphere for classroom roll-calls, curfew bed checks, and gate passes.",
      "5. Authorize 4-Week Rollout Roadmap: Direct the ICT and Academic departments to commence staff training and data validation for full Term 3 operation."
    ]

    for r in recs:
        p_r = tf16.add_paragraph()
        p_r.text = r
        p_r.font.size = Pt(11)
        p_r.font.bold = True
        p_r.font.color.rgb = C_WHITE
        p_r.space_after = Pt(8)

    p16_sign = tf16.add_paragraph()
    p16_sign.text = "\nPrepared with dedication for Legacy School Solwezi  •  Managing Director & Principal: Mr. Emmanuel Mwansa\n'We strive for your academic and moral excellence.'"
    p16_sign.font.size = Pt(10.5)
    p16_sign.font.italic = True
    p16_sign.font.color.rgb = RGBColor(203, 213, 225)

    # Save to both root and public downloads
    output_path = r"c:\edusphere\Legacy_School_EduSphere_Executive_Presentation.pptx"
    prs.save(output_path)
    print(f"Master presentation saved to: {output_path}")

    public_path = r"c:\edusphere\public\downloads\EduSphere_Master_Stakeholder_Presentation.pptx"
    try:
        prs.save(public_path)
        print(f"Public presentation saved to: {public_path}")
    except Exception as e:
        print(f"Notice: public presentation file lock, master file updated at {output_path}: {e}")

if __name__ == "__main__":
    create_deck()
