# create_executive_presentation.py
# Generates a premium enterprise-grade PowerPoint presentation (.pptx) for the CEO/Director of Legacy School Solwezi
# Incorporates screenshots from E:\Screenshots with today's date (2026-10-18)

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
    C_NAVY = RGBColor(11, 37, 69)       # #0B2545
    C_DEEP_BLUE = RGBColor(19, 64, 116) # #134074
    C_LIGHT_BG = RGBColor(248, 250, 252) # #F8FAFC
    C_GOLD = RGBColor(212, 175, 55)     # #D4AF37
    C_EMERALD = RGBColor(16, 185, 129)  # #10B981
    C_SLATE_DARK = RGBColor(30, 41, 59) # #1E293B
    C_SLATE_MUTED = RGBColor(100, 116, 139) # #64748B
    C_WHITE = RGBColor(255, 255, 255)
    C_CARD_BG = RGBColor(255, 255, 255)
    C_CARD_BORDER = RGBColor(226, 232, 240)

    screenshots_dir = r"E:\Screenshots"

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

    def set_slide_background(slide, color=C_LIGHT_BG):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    # =========================================================================
    # SLIDE 1: TITLE / COVER SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1, C_NAVY)

    # Accent decorative shape
    accent = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(11.733), Inches(5.1))
    accent.fill.solid()
    accent.fill.fore_color.rgb = RGBColor(15, 45, 82)
    accent.line.color.rgb = C_GOLD
    accent.line.width = Pt(1.5)

    # Institution Title
    title_box = slide1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.9), Inches(1.0))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "LEGACY SCHOOL SOLWEZI"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = C_GOLD

    p1_sub = tf1.add_paragraph()
    p1_sub.text = "EduSphere SMIS: Enterprise Sovereign Modernization"
    p1_sub.font.size = Pt(30)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = C_WHITE

    # Subtitle & Value Proposition
    desc_box = slide1.shapes.add_textbox(Inches(1.2), Inches(2.9), Inches(10.5), Inches(1.6))
    tf_desc = desc_box.text_frame
    tf_desc.word_wrap = True
    p_desc = tf_desc.paragraphs[0]
    p_desc.text = "Comprehensive Multi-Campus Management, Automated Revenue Recovery, ECZ Academic Markbooks, 360° Boarding Safeguarding & Smart Transport Network with Contactless ID Card Boarding."
    p_desc.font.size = Pt(13)
    p_desc.font.color.rgb = RGBColor(226, 232, 240)
    p_desc.space_after = Pt(12)

    p_desc2 = tf_desc.add_paragraph()
    p_desc2.text = "Tailored for the Board of Directors, Managing Director & Principal: Mr. Emmanuel Mwansa"
    p_desc2.font.size = Pt(12)
    p_desc2.font.bold = True
    p_desc2.font.color.rgb = C_GOLD

    # Metadata Footer
    meta_box = slide1.shapes.add_textbox(Inches(1.2), Inches(5.2), Inches(10.5), Inches(0.6))
    tf_meta = meta_box.text_frame
    p_meta = tf_meta.paragraphs[0]
    p_meta.text = "Date: 18th October 2026  •  Campus Locations: Mushitala (Secondary/Boarding) & Urban (ECE/Primary Day)  •  Solwezi, Zambia"
    p_meta.font.size = Pt(11)
    p_meta.font.color.rgb = RGBColor(148, 163, 184)

    # =========================================================================
    # SLIDE 2: EXECUTIVE SUMMARY & STRATEGIC PROBLEM STATEMENT
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "Executive Strategic Summary: Moving from Manual Risk to Automated Sovereignty")

    # 3 Strategic Pillars Cards
    cards_data = [
      ("Operational Fragmentation & Leakage", "Traditional paper-based fee receipts, manual marksheets, and dispersed logbooks created administrative delays, reconciliatory blind spots, and parental anxiety across both Solwezi campuses.", RGBColor(239, 68, 68)),
      ("Unified Multi-Campus Orchestration", "EduSphere connects Mushitala Secondary (420 pupils, boarding) and Urban Primary (360 pupils, day) into one synchronized general ledger, single-login dashboard, and ECZ grading standard.", C_DEEP_BLUE),
      ("Measurable Revenue & Safeguarding ROI", "Eliminates ~K279k in aged debtor arrears via direct Mobile Money/Zanaco billing, prevents unverified boarding, and automates real-time SMS alerts when learners tap their ID cards onto school buses.", C_EMERALD)
    ]

    for i, (heading, text, accent_color) in enumerate(cards_data):
        left = Inches(0.8 + i * 3.95)
        card = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.5), Inches(3.8), Inches(4.2))
        card.fill.solid()
        card.fill.fore_color.rgb = C_WHITE
        card.line.color.rgb = C_CARD_BORDER

        # Top Accent Stripe
        stripe = slide2.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.5), Inches(3.8), Inches(0.12))
        stripe.fill.solid()
        stripe.fill.fore_color.rgb = accent_color
        stripe.line.fill.background()

        tb = slide2.shapes.add_textbox(left + Inches(0.25), Inches(1.8), Inches(3.3), Inches(3.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = heading
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = C_SLATE_DARK
        p.space_after = Pt(12)

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(11)
        p2.font.color.rgb = C_SLATE_MUTED

    # Bottom Callout Banner
    bot = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.9), Inches(11.733), Inches(1.1))
    bot.fill.solid()
    bot.fill.fore_color.rgb = RGBColor(238, 242, 255)
    bot.line.color.rgb = RGBColor(199, 210, 254)
    tb_bot = slide2.shapes.add_textbox(Inches(1.0), Inches(6.0), Inches(11.3), Inches(0.9))
    tf_bot = tb_bot.text_frame
    tf_bot.word_wrap = True
    p_b = tf_bot.paragraphs[0]
    p_b.text = "Institutional Scale Overview: 780 Active Learners  •  48 Professional Staff  •  16 Class Cohorts  •  2 Buses (62 Transport Seats)  •  350 Boarding Beds"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = C_NAVY

    # =========================================================================
    # SLIDE 3: GIS BRANCH NETWORK & DISTANCE TRANSIT MATRIX
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "Multi-Campus Spatial Network & Inter-Branch Distance Matrix")

    # Left Column: Description & KPI Callouts
    tb_s3 = slide3.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(4.5), Inches(5.4))
    tf_s3 = tb_s3.text_frame
    tf_s3.word_wrap = True
    p_s3_1 = tf_s3.paragraphs[0]
    p_s3_1.text = "Sovereign GIS & Spatial Logistics"
    p_s3_1.font.size = Pt(14)
    p_s3_1.font.bold = True
    p_s3_1.font.color.rgb = C_NAVY
    p_s3_1.space_after = Pt(8)

    p_s3_2 = tf_s3.add_paragraph()
    p_s3_2.text = "EduSphere embeds high-resolution satellite cartography to calculate exact Haversine distances, catchment feeder zones (21.0 km corridor), and transit buffer times between school centers:"
    p_s3_2.font.size = Pt(11)
    p_s3_2.font.color.rgb = C_SLATE_MUTED
    p_s3_2.space_after = Pt(10)

    bullets = [
      ("Mushitala Main Campus:", "Secondary & Boarding wing, Plot 889 Kansanshi Mine Road (Capacity: 650, Enrolled: 420)."),
      ("Urban Campus Central:", "ECE & Primary Day School, Solwezi Town Corridor (Capacity: 450, Enrolled: 360)."),
      ("Pairwise Transit Distance:", "3.80 km road distance (~7 mins drive time), facilitating seamless inter-campus shuttle connections."),
      ("Catchment Compliance:", "Auto-resolves applicant coordinates to determine nearest feeder branch during student enrollment.")
    ]
    for b_title, b_desc in bullets:
        p_b = tf_s3.add_paragraph()
        p_b.text = f"• {b_title} {b_desc}"
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_SLATE_DARK
        p_b.space_after = Pt(6)

    # Right Column: Screenshot from E:\Screenshots
    img_path = os.path.join(screenshots_dir, "Screenshot 2026-10-18 102033.png")
    if os.path.exists(img_path):
        slide3.shapes.add_picture(img_path, Inches(5.6), Inches(1.5), width=Inches(6.9))

    # =========================================================================
    # SLIDE 4: SMART BUS SHUTTLES & CONTACTLESS ID CARD BOARDING
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "Smart Transport: Live Shuttle Tracking & Contactless Learner ID Card Boarding")

    # Left Column: Advisory & Features
    tb_s4 = slide4.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(4.8), Inches(5.6))
    tf_s4 = tb_s4.text_frame
    tf_s4.word_wrap = True
    p_s4_1 = tf_s4.paragraphs[0]
    p_s4_1.text = "Learner ID Card Bus Check-in: Technical Advisory"
    p_s4_1.font.size = Pt(13)
    p_s4_1.font.bold = True
    p_s4_1.font.color.rgb = C_NAVY
    p_s4_1.space_after = Pt(6)

    adv_points = [
      ("Dual NFC / QR Student ID Cards:", "Learners carry durable PVC smart cards with embedded MIFARE 13.56MHz NFC chips and 2D QR fallback codes."),
      ("In-Bus Telematics Tablet:", "Mounted 7-inch rugged Android tablet with 4G LTE and GPS validates card taps in under 0.3 seconds."),
      ("Instant Parent SMS Alert:", "'[EduSphere] Bupe Mwewa boarded BUS-SOL-02 at Kansanshi Golf Estate at 06:46 AM. ETA School: 20 mins.'"),
      ("Wrong-Bus Lockout Protection:", "Tablet screen sounds audible warning if a learner attempts to board the wrong route or exits at the wrong stop."),
      ("Offline Store-and-Forward:", "Pockets along Kansanshi Mine Road with low cellular coverage store taps locally in SQLite and auto-sync when reconnected.")
    ]
    for b_title, b_desc in adv_points:
        p_b = tf_s4.add_paragraph()
        p_b.text = f"• {b_title} {b_desc}"
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_SLATE_DARK
        p_b.space_after = Pt(6)

    # Right Column: Screenshot from E:\Screenshots
    img_path = os.path.join(screenshots_dir, "Screenshot 2026-10-18 102033.png")
    if os.path.exists(img_path):
        slide4.shapes.add_picture(img_path, Inches(5.8), Inches(1.5), width=Inches(6.7))

    # =========================================================================
    # SLIDE 5: FEES MANAGEMENT & FINANCIAL RECONCILIATION
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "Fees Management, Inflows Ledger & Complete Cashbook Control")

    tb_s5 = slide5.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(4.7), Inches(5.6))
    tf_s5 = tb_s5.text_frame
    tf_s5.word_wrap = True
    p_s5_1 = tf_s5.paragraphs[0]
    p_s5_1.text = "Financial Governance & Multi-Channel Inflows"
    p_s5_1.font.size = Pt(13)
    p_s5_1.font.bold = True
    p_s5_1.font.color.rgb = C_NAVY
    p_s5_1.space_after = Pt(6)

    fin_points = [
      ("Zero-Variance Reconciliation:", "All 780 student ledger accounts match official receipts with zero discrepancy across Zanaco, Stanbic, and Mobile Money."),
      ("Multi-Campus Fee Isolation:", "Independent billing schedules for Urban Primary (Day Tuition K2,800) and Mushitala (Tuition + Boarding K10,400)."),
      ("Real-Time Transparent Receipts:", "2,123 reconciled institutional receipts generated with audit trails and instant PDF receipt generation."),
      ("Expenditure Control (Outflows):", "Strict authorization workflow for operational disbursements, fuel rations, food dining provisions, and payroll."),
      ("Recovery Rate Optimization:", "Visual aged debtors ledger categorizing 30, 60, and 90+ day balances to systematically close out arrears.")
    ]
    for b_title, b_desc in fin_points:
        p_b = tf_s5.add_paragraph()
        p_b.text = f"• {b_title} {b_desc}"
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_SLATE_DARK
        p_b.space_after = Pt(6)

    # Right Column: Screenshot
    img_path = os.path.join(screenshots_dir, "Screenshot 2026-10-18 100745.png")
    if os.path.exists(img_path):
        slide5.shapes.add_picture(img_path, Inches(5.7), Inches(1.5), width=Inches(6.8))

    # =========================================================================
    # SLIDE 6: TEACHER WORKSPACE & ACADEMIC MARKBOOK WORKFLOW
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "Teacher Workspace: ECZ Assessment Suite & 3-Tier Supervisory Sign-Off")

    tb_s6 = slide6.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(4.7), Inches(5.6))
    tf_s6 = tb_s6.text_frame
    tf_s6.word_wrap = True
    p_s6_1 = tf_s6.paragraphs[0]
    p_s6_1.text = "Standardized Scholastic Markbook"
    p_s6_1.font.size = Pt(13)
    p_s6_1.font.bold = True
    p_s6_1.font.color.rgb = C_NAVY
    p_s6_1.space_after = Pt(6)

    t_points = [
      ("All 16 Cohorts Selectable:", "Seamlessly switches between Early Years, Grades 1-7, and Forms 1-5 with full 30 to 44 student rosters loaded dynamically."),
      ("Full ECZ Curriculum Spectrum:", "Captures all subjects: Sciences, Mathematics, English, ICT, Social Studies, Zambian Languages, and Commerce."),
      ("4-Tier Assessment Breakdown:", "Weekly Topic Tests (15%), Continuous Assessments (25%), Mock Exams (20%), and Term Finals (40%) = 100% total."),
      ("3-Tier Supervisory Workflow:", "Class Teacher submits -> Senior Teacher / HOD endorses -> Principal gives final approval before publication."),
      ("Offline Markbook Entry:", "Teachers can grade test papers without active internet; marks store locally and auto-sync when Wi-Fi connects.")
    ]
    for b_title, b_desc in t_points:
        p_b = tf_s6.add_paragraph()
        p_b.text = f"• {b_title} {b_desc}"
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_SLATE_DARK
        p_b.space_after = Pt(6)

    # Right Column: Screenshot from E:\Screenshots
    img_path = os.path.join(screenshots_dir, "Screenshot 2026-10-18 102645.png")
    if os.path.exists(img_path):
        slide6.shapes.add_picture(img_path, Inches(5.7), Inches(1.5), width=Inches(6.8))

    # =========================================================================
    # SLIDE 7: PARENT & GUARDIAN PORTAL (FAMILY CENTER)
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "Parent Portal: Multi-Child Family Academic, Attendance & Fee Center")

    tb_s7 = slide7.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(4.7), Inches(5.6))
    tf_s7 = tb_s7.text_frame
    tf_s7.word_wrap = True
    p_s7_1 = tf_s7.paragraphs[0]
    p_s7_1.text = "Transparent Family Engagement"
    p_s7_1.font.size = Pt(13)
    p_s7_1.font.bold = True
    p_s7_1.font.color.rgb = C_NAVY
    p_s7_1.space_after = Pt(6)

    p_points = [
      ("Multi-Ward Switcher:", "Parents with multiple children (e.g. Bupe, Kondwani, Natasha, Chileshe) switch between all wards in one unified portal."),
      ("Historical Performance Graphs:", "Multi-term trend charts (2024 to 2026) illustrate grade progression and classroom rankings over time."),
      ("Complete ECZ Subject Breakdown:", "Itemized marks across all 10 to 12 subjects with personalized teacher remarks and conduct ratings."),
      ("Instant Mobile Money Settlement:", "Direct push-prompt fee payment via Airtel Money and MTN MoMo with instant receipt generation."),
      ("Official Printable Report Cards:", "Parents can download and print official Ministry-formatted report cards with digital school stamps and signatures.")
    ]
    for b_title, b_desc in p_points:
        p_b = tf_s7.add_paragraph()
        p_b.text = f"• {b_title} {b_desc}"
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_SLATE_DARK
        p_b.space_after = Pt(6)

    # Right Column: Screenshot from E:\Screenshots
    img_path = os.path.join(screenshots_dir, "Screenshot 2026-10-18 102357.png")
    if os.path.exists(img_path):
        slide7.shapes.add_picture(img_path, Inches(5.7), Inches(1.5), width=Inches(6.8))

    # =========================================================================
    # SLIDE 8: BOARDING VILLAGE & STUDENT 360° DOSSIERS
    # =========================================================================
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "Boarding Village & Student 360° Safeguarding Dossiers")

    tb_s8 = slide8.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(4.7), Inches(5.6))
    tf_s8 = tb_s8.text_frame
    tf_s8.word_wrap = True
    p_s8_1 = tf_s8.paragraphs[0]
    p_s8_1.text = "Holistic Pastoral Care & Resident Welfare"
    p_s8_1.font.size = Pt(13)
    p_s8_1.font.bold = True
    p_s8_1.font.color.rgb = C_NAVY
    p_s8_1.space_after = Pt(6)

    b_points = [
      ("Accommodation Tracking:", "Real-time bed, wing, and dorm assignments for 315 boarders across Kansanshi Boys and Kalumbila Girls Halls."),
      ("Multi-Year Residential History:", "Preserves records of dorm rooms, bed numbers, locker codes, and inspection ratings from Form 1 to Form 5."),
      ("Digital Exeat Pass Workflow:", "Automated approval trail for weekend exeats, medical clinic visits, and sports travel with SMS verification."),
      ("24/7 Sickbay Health Records:", "Resident nurse incident logging, chronic condition medication monitoring, and emergency doctor referrals."),
      ("Day Scholar Terminal Management:", "Separate locker and transit marshaling for day pupils, with one-click conversion to boarding status.")
    ]
    for b_title, b_desc in b_points:
        p_b = tf_s8.add_paragraph()
        p_b.text = f"• {b_title} {b_desc}"
        p_b.font.size = Pt(10)
        p_b.font.color.rgb = C_SLATE_DARK
        p_b.space_after = Pt(6)

    # Right Column: Screenshot from E:\Screenshots
    img_path = os.path.join(screenshots_dir, "Screenshot 2026-10-18 100114.png")
    if os.path.exists(img_path):
        slide8.shapes.add_picture(img_path, Inches(5.7), Inches(1.5), width=Inches(6.8))

    # =========================================================================
    # SLIDE 9: COMMERCIAL PRICING & INVESTMENT BREAKDOWN (COST OF APP)
    # =========================================================================
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)
    add_header(slide9, "Commercial Investment Breakdown: Turnkey Software, IoT Hardware & Support")

    # Table of Costings
    rows = 7
    cols = 4
    left = Inches(0.8)
    top = Inches(1.5)
    width = Inches(11.733)
    height = Inches(4.3)

    table_shape = slide9.shapes.add_table(rows, cols, left, top, width, height)
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
      ("EduSphere Sovereign Enterprise Platform Core", "Multi-Campus License, Finance, SIS, Academics, GIS & Parent Portal (Unlimited Admin & Teacher Users)", "K 65,000", "$ 2,500"),
      ("Implementation, Historical Seeding & Setup", "Data migration of 780 students, 48 staff profiles, database configuration, and backup server setup", "K 28,000", "$ 1,075"),
      ("Smart Bus Hardware (2 In-Vehicle Telematics Tablets)", "2x Rugged 7-inch Android In-Bus Tablets, NFC RFID readers, GPS mounts, and 4G SIM integration", "K 19,500", "$ 750"),
      ("Smart Student Contactless ID Cards (800 Cards)", "800 Dual-Frequency MIFARE 13.56MHz + QR printed PVC student smart identification badges", "K 16,000", "$ 615"),
      ("Staff Onboarding & Operational Training", "Hands-on workshops for 48 staff (Bursars, HODs, Teachers, Matrons, Drivers, and Executive Management)", "K 14,500", "$ 560"),
      ("TOTAL YEAR 1 CAPITAL & IMPLEMENTATION INVESTMENT", "Complete sovereign school digital ecosystem with full warranty, support, and backups", "K 143,000", "$ 5,500"),
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
    tb_roi = slide9.shapes.add_textbox(Inches(0.8), Inches(6.0), Inches(11.733), Inches(1.1))
    tf_roi = tb_roi.text_frame
    tf_roi.word_wrap = True
    p_roi = tf_roi.paragraphs[0]
    p_roi.text = "Return on Investment (ROI) Justification for Executive Management:"
    p_roi.font.size = Pt(11)
    p_roi.font.bold = True
    p_roi.font.color.rgb = C_NAVY

    p_roi_2 = tf_roi.add_paragraph()
    p_roi_2.text = "1. Immediate Arrears Recovery: Automating parent Mobile Money prompts captures ~15% of the K279,000 pending fee balances within 30 days (+K41,850 recovered).\n2. Printing Cost Elimination: Eliminating physical carbon-copy paper receipts and printed report cards saves ~K22,000 annually.\n3. Fuel & Route Optimization: Smart GPS route stop planning saves ~10-15% on diesel transport costs across both shuttles."
    p_roi_2.font.size = Pt(9.5)
    p_roi_2.font.color.rgb = C_SLATE_MUTED

    # =========================================================================
    # SLIDE 10: IMPLEMENTATION ROADMAP & ROLLOUT SCHEDULE
    # =========================================================================
    slide10 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide10)
    add_header(slide10, "Deployment Timeline: 4-Week Fast-Track Execution Schedule")

    phases = [
      ("Week 1: Sovereign Setup & Cloud Architecture", [
        "Deploy Dockerized PostgreSQL & Next.js engine",
        "Configure automated nightly off-site database backups",
        "Migrate 780 legacy learner profiles and fee balances",
        "Finalize custom theme colors & school crest branding"
      ]),
      ("Week 2: Smart Bus IoT & Hardware Deployment", [
        "Procure and program 800 MIFARE NFC student ID cards",
        "Install 2x Android in-bus GPS telematics tablets",
        "Set up cellular 4G SIMs and offline store-and-forward",
        "Test driver route navigation and geofenced bus stops"
      ]),
      ("Week 3: Staff Training & Academic Markbook Pilot", [
        "Conduct workshops for 48 staff members across cadres",
        "Train teachers on topic test, CA, and mock exam entry",
        "Train bursar and finance staff on cashbook vouchers",
        "Conduct mock roll-call attendance on shuttle routes"
      ]),
      ("Week 4: Parent Portal Launch & Full Go-Live", [
        "Dispatch parent SMS credentials and onboarding guide",
        "Open Airtel & MTN Mobile Money payment channels",
        "Publish official Term 1 digital report cards",
        "Transition to 24/7 technical monitoring & SLA support"
      ]),
    ]

    for idx, (p_title, p_steps) in enumerate(phases):
        left = Inches(0.8 + idx * 2.95)
        box = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, Inches(1.5), Inches(2.85), Inches(4.3))
        box.fill.solid()
        box.fill.fore_color.rgb = C_WHITE
        box.line.color.rgb = C_CARD_BORDER

        top_strip = slide10.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, Inches(1.5), Inches(2.85), Inches(0.1))
        top_strip.fill.solid()
        top_strip.fill.fore_color.rgb = C_DEEP_BLUE
        top_strip.line.fill.background()

        tb = slide10.shapes.add_textbox(left + Inches(0.15), Inches(1.7), Inches(2.55), Inches(3.9))
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

    # Bottom Quality SLA Callout
    sla_box = slide10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.733), Inches(1.0))
    sla_box.fill.solid()
    sla_box.fill.fore_color.rgb = RGBColor(240, 253, 244)
    sla_box.line.color.rgb = RGBColor(187, 247, 208)

    tb_sla = slide10.shapes.add_textbox(Inches(1.0), Inches(6.05), Inches(11.3), Inches(0.85))
    tf_sla = tb_sla.text_frame
    tf_sla.word_wrap = True
    p_sla = tf_sla.paragraphs[0]
    p_sla.text = "Enterprise Service Level Agreement (SLA): 99.9% Uptime Guarantee  •  Daily Encrypted Off-Site Backups  •  Dedicated On-Call Technical Support for Solwezi Operations"
    p_sla.font.size = Pt(10.5)
    p_sla.font.bold = True
    p_sla.font.color.rgb = RGBColor(22, 101, 52)

    # =========================================================================
    # SLIDE 11: CONCLUSION & ACTIONABLE RECOMMENDATION
    # =========================================================================
    slide11 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide11, C_NAVY)

    box11 = slide11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.0), Inches(11.333), Inches(5.5))
    box11.fill.solid()
    box11.fill.fore_color.rgb = RGBColor(15, 45, 82)
    box11.line.color.rgb = C_GOLD
    box11.line.width = Pt(1.5)

    tb11 = slide11.shapes.add_textbox(Inches(1.4), Inches(1.4), Inches(10.5), Inches(4.7))
    tf11 = tb11.text_frame
    tf11.word_wrap = True

    p11_1 = tf11.paragraphs[0]
    p11_1.text = "SUMMARY OF RECOMMENDATIONS FOR EXECUTIVE APPROVAL"
    p11_1.font.size = Pt(14)
    p11_1.font.bold = True
    p11_1.font.color.rgb = C_GOLD
    p11_1.space_after = Pt(12)

    recs = [
      "1. Approve Sovereign SMIS Deployment: Authorize transition from manual spreadsheets to EduSphere across Mushitala and Urban campuses.",
      "2. Greenlight Smart Bus Hardware Integration: Commission in-bus Android telematics tablets and 800 NFC learner ID cards for automated boarding verification and SMS parent alerts.",
      "3. Activate Integrated Mobile Money Gateway: Formalize Airtel & MTN merchant aggregators to allow instant parent tuition settlements, reducing aged debt.",
      "4. Authorize 4-Week Rollout Roadmap: Direct the ICT and Academic departments to commence staff training and data validation for full Term 1 operation."
    ]

    for r in recs:
        p_r = tf11.add_paragraph()
        p_r.text = r
        p_r.font.size = Pt(12)
        p_r.font.bold = True
        p_r.font.color.rgb = C_WHITE
        p_r.space_after = Pt(10)

    p11_sign = tf11.add_paragraph()
    p11_sign.text = "\nPrepared with dedication for Legacy School Solwezi  •  We strive for your academic and moral excellence."
    p11_sign.font.size = Pt(11)
    p11_sign.font.italic = True
    p11_sign.font.color.rgb = RGBColor(203, 213, 225)

    output_path = r"c:\edusphere\Legacy_School_EduSphere_Executive_Presentation.pptx"
    prs.save(output_path)
    print(f"Executive presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_deck()
