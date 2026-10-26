import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  BookOpenCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Clock,
  Calendar,
  FileText,
  Users,
  Compass,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Lock,
  LogIn,
  Hospital,
  Bed,
  Layers,
  Search,
} from 'lucide-react';
import { NwuchasLogo, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

export const metadata = {
  title: 'North Western University College of Health and Applied Sciences (NWUCHAS)',
  description:
    'Official Portal of North Western University College of Health and Applied Sciences (NWUCHAS) in Manyama, Lumwana, Zambia. NMCZ & HPCZ accredited training in Registered Nursing, Clinical Medicine, and Public Health.',
};

export default function PublicCollegeLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Top Statutory & Intake Announcement Strip */}
      <div className="bg-[#0b2545] text-slate-200 text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8DC63F]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#8DC63F] border border-[#8DC63F]/40">
              <Sparkles className="h-3 w-3 text-[#8DC63F]" />
              2026 Admissions Open
            </span>
            <span className="hidden sm:inline text-slate-300">
              January & Mid-Year Intakes: Diploma in Registered Nursing & Clinical Medicine.
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/apply"
              className="text-[#8DC63F] hover:text-lime-200 font-bold flex items-center gap-1 transition"
            >
              Apply Online Now <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-slate-500">|</span>
            <Link
              href="/login"
              className="text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <Lock className="h-3 w-3 text-slate-400" /> Staff & Student Portals
            </Link>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Official NWUCHAS Brandmark & Emblem */}
            <Link href="/" className="flex items-center gap-3.5 group hover:opacity-95 transition">
              <NwuchasLogo variant="compact" size="md" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
              <Link href="#about" className="hover:text-[#007B99] transition">
                About Us
              </Link>
              <Link href="#vision" className="hover:text-[#007B99] transition">
                Vision & Mission
              </Link>
              <Link href="#programmes" className="hover:text-[#007B99] transition">
                Academic Programmes
              </Link>
              <Link href="#admissions" className="hover:text-[#007B99] transition">
                Admissions
              </Link>
              <Link href="#clinical" className="hover:text-[#007B99] transition">
                Clinical Rotations
              </Link>
              <Link href="#facilities" className="hover:text-[#007B99] transition">
                Campus Facilities
              </Link>
              <Link href="#contact" className="hover:text-[#007B99] transition">
                Contact
              </Link>
            </nav>

            {/* Call to Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#007B99] hover:text-[#007B99] hover:bg-sky-50/50 transition"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </Link>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-lg bg-[#007B99] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#00627a] transition active:scale-95"
              >
                Apply Online <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b2545] via-[#0e315d] to-[#123e75] text-white pt-16 pb-24 lg:pt-20 lg:pb-32">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8DC63F]/20 border border-[#8DC63F]/40 px-3 py-1 text-xs font-bold text-[#8DC63F]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8DC63F]" />
                  HPCZ & NMCZ Verified Institution
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007B99]/20 border border-[#007B99]/40 px-3 py-1 text-xs font-bold text-sky-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#007B99]" />
                  Higher Education Authority (HEA) Registered
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                Empowering the Next Generation of{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-lime-200 to-pink-200">
                  Healthcare Pioneers
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                North Western University College of Health and Applied Sciences (NWUCHAS) is a premier
                tertiary healthcare institution situated in Manyama, Lumwana, Zambia. We deliver rigorous,
                hands-on clinical education in Registered Nursing, Clinical Medicine, and Public Health.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/apply"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#8DC63F] hover:bg-[#72a330] text-slate-950 font-black px-7 py-3.5 text-sm sm:text-base shadow-lg shadow-[#8DC63F]/25 transition active:scale-95 cursor-pointer"
                >
                  <GraduationCap className="h-5 w-5" />
                  Start 2026 Application
                </Link>

                <Link
                  href="#programmes"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold px-6 py-3.5 text-sm sm:text-base border border-[#007B99]/40 shadow-sm transition"
                >
                  <BookOpenCheck className="h-5 w-5 text-white" />
                  Explore Programmes
                </Link>

                <Link
                  href="/apply?tab=track"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-blue-200 hover:text-white px-4 py-3.5 text-sm font-semibold transition"
                >
                  <Search className="h-4 w-4" /> Track Existing Application
                </Link>
              </div>

              {/* Fast Facts Pillars */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-blue-800/40 text-left">
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-blue-200">Accredited Curricula</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Practical</div>
                  <div className="text-xs text-blue-200">Hospital Ward Rotations</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">Manyama</div>
                  <div className="text-xs text-blue-200">Kalumbila Campus</div>
                </div>
              </div>
            </div>

            {/* Right Hero Feature Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#007B99]/30 text-sky-200 border border-[#007B99]/50">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Key Admission Windows</h3>
                      <p className="text-xs text-blue-200">2026 Academic Calendar</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#EC008C]/20 text-[#EC008C] text-[11px] font-black px-2.5 py-0.5 border border-[#EC008C]/40 animate-pulse">
                    Active Intake
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 transition hover:bg-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">January 2026 Main Intake</span>
                      <span className="text-xs font-bold text-[#8DC63F]">Enrollment Open</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Full-time Diploma in Registered Nursing (RN) & Diploma in Clinical Medicine (COG).
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-blue-200">
                      <span>Requirement: 5 O-Level Credits</span>
                      <Link href="/apply" className="text-[#8DC63F] font-bold hover:underline flex items-center gap-1">
                        Apply Now →
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-4 transition hover:bg-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">July 2026 Mid-Year Intake</span>
                      <span className="text-xs font-semibold text-blue-200">Advance Registration</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Diploma in Public Health & In-Service Bridging Programmes.
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-blue-200">
                      <span>Campus: Manyama Main Campus</span>
                      <Link href="/apply" className="text-blue-300 font-bold hover:underline flex items-center gap-1">
                        Pre-register →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-900/60 border border-blue-700/50 p-4 flex items-start gap-3">
                  <Hospital className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-100 leading-relaxed">
                    <strong className="text-white">Accredited Clinical Attachment Sites:</strong> Ward rotations
                    conducted at Solwezi General Hospital, Lumwana First Level Hospital, and district health centres.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Vision, Mission & Strategic Pillars (#vision) */}
      <section id="vision" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
              Institutional Foundation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
              Vision, Mission & Core Values
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              NWUCHAS was founded to address healthcare workforce deficits in Zambia by cultivating clinicians
              and nurses with unyielding professional integrity, diagnostic proficiency, and empathetic care.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Vision Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-[#007B99] border border-[#007B99]/30 mb-6">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0b2545]">Our Institutional Vision</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                To be a centre of excellence in the education, training, and development of ethical, competent,
                and innovative health professionals in Zambia and across the Southern African sub-region.
              </p>
            </div>

            {/* Mission Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-lime-50 text-[#5c8426] border border-[#8DC63F]/40 mb-6">
                <HeartPulse className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0b2545]">Our Mission</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                To provide quality, learner-centred, and practice-driven education and research in health and applied
                sciences that directly responds to community healthcare needs and global standards.
              </p>
            </div>

            {/* Core Values Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition md:col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink-50 text-[#EC008C] border border-[#EC008C]/30 mb-6">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0b2545]">Institutional Core Values</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Grounded in unyielding professional ethics, patient dignity, clinical precision, and community-centred service:
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-800 font-semibold shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  <span>Clinical Excellence</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-800 font-semibold shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  <span>Compassion</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-800 font-semibold shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  <span>Integrity</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-800 font-semibold shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  <span>Community Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programmes Catalogue (#programmes) */}
      <section id="programmes" className="py-20 bg-slate-100/70 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
                Tertiary Health Education
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
                Academic Programmes & Curricula
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Our accredited tertiary programmes combine rigorous didactic classroom theory with simulated lab practice
                and hospital clinical attachments.
              </p>
            </div>
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#007B99] hover:text-[#00627a] transition"
            >
              View Application Requirements →
            </Link>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Programme 1: Registered Nursing */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:border-[#8DC63F]/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-md bg-[#8DC63F]/15 text-[#5c8426] border border-[#8DC63F]/40 text-xs font-bold px-2.5 py-1">
                    NMCZ Accredited
                  </span>
                  <span className="text-xs font-semibold text-slate-500">3 Years • Full Time</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b2545]">
                  Diploma in Registered Nursing (RN)
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Prepares professional registered nurses to deliver comprehensive general, pediatric, psychiatric,
                  and community nursing care with high clinical competencies and leadership.
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-700">Entry Requirements:</div>
                  <p className="text-slate-600">
                    Five (5) O-Level Credits in ECZ/GCE or equivalent: English Language, Mathematics,
                    Biology / Science, and two other subjects.
                  </p>
                  <div className="font-bold text-slate-700 pt-2">Professional Body:</div>
                  <p className="text-slate-600">Nursing and Midwifery Council of Zambia (NMCZ)</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/apply?programme=nursing"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold py-2.5 text-xs shadow-xs transition"
                >
                  Apply for Registered Nursing <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Programme 2: Clinical Medicine */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:border-[#007B99]/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-md bg-[#007B99]/15 text-[#007B99] border border-[#007B99]/40 text-xs font-bold px-2.5 py-1">
                    HPCZ Accredited
                  </span>
                  <span className="text-xs font-semibold text-slate-500">3 Years • Full Time</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b2545]">
                  Diploma in Clinical Medicine (COG)
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Trains Clinical Officers (General) to diagnose, manage medical emergencies, perform essential
                  minor surgical and obstetric procedures, and administer primary healthcare.
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-700">Entry Requirements:</div>
                  <p className="text-slate-600">
                    Five (5) O-Level Credits in ECZ/GCE: English Language, Mathematics, Biology,
                    Physical Science / Chemistry / Physics, and any other subject.
                  </p>
                  <div className="font-bold text-slate-700 pt-2">Professional Body:</div>
                  <p className="text-slate-600">Health Professions Council of Zambia (HPCZ)</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/apply?programme=clinical"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold py-2.5 text-xs shadow-xs transition"
                >
                  Apply for Clinical Medicine <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Programme 3: Public Health */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between md:col-span-2 lg:col-span-1 hover:border-[#EC008C]/50">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-md bg-[#EC008C]/15 text-[#c70076] border border-[#EC008C]/30 text-xs font-bold px-2.5 py-1">
                    HPCZ & HEA Approved
                  </span>
                  <span className="text-xs font-semibold text-slate-500">3 Years • Full / Blended</span>
                </div>
                <h3 className="text-xl font-bold text-[#0b2545]">
                  Diploma in Public Health
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Equips professionals with epidemiological surveillance, occupational health & safety in mining,
                  environmental sanitation, infectious disease control, and health policy management.
                </p>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-700">Entry Requirements:</div>
                  <p className="text-slate-600">
                    Five (5) O-Level Credits in ECZ/GCE or equivalent including English Language, Mathematics,
                    and a Science subject.
                  </p>
                  <div className="font-bold text-slate-700 pt-2">Focus Areas:</div>
                  <p className="text-slate-600">Community Health, Mining Health & Epidemiology</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/apply?programme=public-health"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold py-2.5 text-xs shadow-xs transition"
                >
                  Apply for Public Health <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Admissions Journey & How to Apply (#admissions) */}
      <section id="admissions" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
              Admissions Portal
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
              How to Apply — Step-by-Step Guide
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Applying to NWUCHAS is completely streamlined. Follow these five transparent steps to secure your place.
            </p>
          </div>

          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 relative">
              <span className="text-3xl font-black text-blue-200">01</span>
              <h3 className="font-bold text-slate-900 mt-2 text-base">Check Criteria</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Ensure you meet the minimum entry requirements: 5 O-Level credits in Zambian GCE / ECZ.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 relative">
              <span className="text-3xl font-black text-blue-200">02</span>
              <h3 className="font-bold text-slate-900 mt-2 text-base">Prepare Docs</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Have certified copies of your ECZ statement of results, NRC, and passport photograph ready.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 relative">
              <span className="text-3xl font-black text-blue-200">03</span>
              <h3 className="font-bold text-slate-900 mt-2 text-base">Apply Online</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Complete the online form and immediately obtain your unique NWU-APP tracking number.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 relative">
              <span className="text-3xl font-black text-blue-200">04</span>
              <h3 className="font-bold text-slate-900 mt-2 text-base">Screening</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                The admissions registry verifies qualifications and communicates selection committee decisions.
              </p>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 relative">
              <span className="text-3xl font-black text-blue-200">05</span>
              <h3 className="font-bold text-slate-900 mt-2 text-base">Enrollment</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Receive your provisional admission offer letter, accept online, and complete professional indexing.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-[#8DC63F] hover:bg-[#72a330] text-slate-950 font-black px-8 py-3.5 text-sm shadow-md shadow-[#8DC63F]/25 transition active:scale-95 cursor-pointer"
            >
              Start Your Online Application Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clinical Attachments & Hospital Rotations (#clinical) */}
      <section id="clinical" className="py-20 bg-slate-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
                Real Clinical Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Hospital Rotations & Hands-On Ward Attachments
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                At NWUCHAS, healthcare education goes beyond lectures. Our students complete intensive, accredited
                clinical rotations under the direct supervision of certified preceptors, medical doctors, and nurse tutors.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                    <Hospital className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Solwezi General Hospital</h3>
                    <p className="text-xs text-slate-400">
                      Provincial tertiary hospital providing major surgical, internal medicine, pediatric, and obstetric rotations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                    <Hospital className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Lumwana First Level Hospital</h3>
                    <p className="text-xs text-slate-400">
                      Emergency medicine, trauma management, and industrial healthcare clinical placements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                    <Hospital className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Manyama Rural Health Facilities</h3>
                    <p className="text-xs text-slate-400">
                      Maternal child health (MCH), immunisation outreach, and primary community healthcare.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-8 space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-cyan-400" /> Clinical Competency Assurance
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Every clinical student maintains an electronic logbook tracking ward hours, procedures observed,
                  assisted, and performed independently in compliance with NMCZ and HPCZ logbook regulations.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-700">
                    <div className="text-2xl font-black text-cyan-400">100%</div>
                    <div className="text-xs text-slate-300 mt-1">Preceptor Supervised</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/80 p-4 border border-slate-700">
                    <div className="text-2xl font-black text-cyan-400">85%</div>
                    <div className="text-xs text-slate-300 mt-1">Attendance Threshold</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Facilities (#facilities) */}
      <section id="facilities" className="py-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
              Campus Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
              World-Class Health Sciences Facilities
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Situated in Manyama, Lumwana, our purpose-built campus provides a safe, modern, and academically
              conducive environment for healthcare trainees.
            </p>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-[#007B99] mb-4">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Skills & Simulation Lab</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                High-fidelity adult, pediatric, and birthing simulators for pre-clinical procedural practice.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-lime-50 text-[#5c8426] mb-4">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Digital Medical Library</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Comprehensive collection of medical textbooks, quiet study zones, and online clinical journal subscriptions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-pink-50 text-[#EC008C] mb-4">
                <Bed className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Student Residences</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Secure on-campus hostels including Florence Nightingale residence with 24/7 power, water, and security.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-[#007B99] mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Modern Lecture Theatres</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Spacious amphitheatre-style lecture halls equipped with digital multimedia projectors and sound systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About NWUCHAS Section (#about) */}
      <section id="about" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
                About Our Institution
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
                North Western University College of Health and Applied Sciences
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Located in the Manyama Educational Corridor along Lumwana Road in Kalumbila District, NWUCHAS is an
                established Zambian higher education institution dedicated exclusively to health sciences.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Our curriculum aligns with the national healthcare priorities articulated by the Ministry of Health (MOH)
                and verified by the Higher Education Authority (HEA), the Nursing and Midwifery Council of Zambia (NMCZ),
                and the Health Professions Council of Zambia (HPCZ).
              </p>

              <div className="pt-4 grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  Registered Higher Education Institution
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  NMCZ Accredited Nursing School
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  HPCZ Verified Clinical Training
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                  Affiliated Hospital Attachments
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-4">
                <h3 className="font-bold text-slate-900 text-lg">Institutional Credentials</h3>
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 block">Institution Name:</span>
                    North Western University College of Health and Applied Sciences (NWUCHAS)
                  </div>
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 block">Campus Location:</span>
                    Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia
                  </div>
                  <div className="border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 block">Accrediting Councils:</span>
                    Nursing and Midwifery Council of Zambia (NMCZ) & Health Professions Council of Zambia (HPCZ)
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Official Website Reference:</span>
                    <a
                      href="https://nwuc.edu.zm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007B99] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      nwuc.edu.zm <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Contact & Location (#contact) */}
      <section id="contact" className="py-20 bg-slate-100/70 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
              Admissions Inquiries & Campus Contacts
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Our registry and admissions officers are available to assist prospective applicants, sponsors,
              and healthcare partners.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:border-[#007B99]/50 transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-[#007B99] mx-auto mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Campus Location</h3>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                Plot 511/518 Shilenda Road<br />
                Manyama, Lumwana, Zambia<br />
                <span className="text-[11px] text-slate-500">Kalumbila District, North-Western Province</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:border-[#8DC63F]/50 transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-lime-50 text-[#5c8426] mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Inquiries & Web</h3>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                Official: <strong className="text-[#007B99]">info@nwuc.edu.zm</strong><br />
                Admissions: <strong className="text-slate-800">admissions@nwuc.edu.zm</strong><br />
                <span className="text-[11px] text-slate-500">Website: nwuc.edu.zm</span>
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xs hover:border-[#EC008C]/50 transition">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink-50 text-[#EC008C] mx-auto mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Contact Hotlines & WhatsApp</h3>
              <div className="text-xs text-slate-700 mt-2 leading-relaxed space-y-1.5 text-center">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">For More Details Contact Us On:</p>
                <p className="font-bold text-slate-900 font-mono text-[11px] sm:text-xs">
                  0964240051 / 0955550051 / 0979000051 / 0974896096 / 0974240051
                </p>
                <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider pt-1">WhatsApp:</p>
                <p className="font-bold text-emerald-800 font-mono text-[11px] sm:text-xs">
                  0955550051 / 0964240051 / 0979000051 / 0974896096 / 0974240051
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-[#0b2545] text-slate-300 text-xs py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#007B99] text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-black text-[#8DC63F] text-sm tracking-tight uppercase block leading-none">
                    North Western
                  </span>
                  <span className="font-black text-[#007B99] text-sm tracking-tight uppercase block leading-none mt-0.5">
                    University College
                  </span>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed text-xs">
                North Western University College of Health and Applied Sciences. Registered tertiary
                institution dedicated to clinical excellence and compassionate healthcare.
              </p>
              <div className="text-[11px] text-slate-400 font-medium">
                Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia.
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white text-sm mb-3">Academic Programmes</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/apply?programme=nursing" className="hover:text-white transition">
                    Diploma in Registered Nursing
                  </Link>
                </li>
                <li>
                  <Link href="/apply?programme=clinical" className="hover:text-white transition">
                    Diploma in Clinical Medicine
                  </Link>
                </li>
                <li>
                  <Link href="/apply?programme=public-health" className="hover:text-white transition">
                    Diploma in Public Health
                  </Link>
                </li>
                <li>
                  <Link href="/apply" className="hover:text-white transition">
                    In-Service & Bridging Courses
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-sm mb-3">Admissions & Portals</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/apply" className="hover:text-white transition">
                    Apply Online (2026 Intake)
                  </Link>
                </li>
                <li>
                  <Link href="/apply?tab=track" className="hover:text-white transition">
                    Track Application Status
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Student & Sponsor Portal
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition">
                    Staff & Faculty Sign In
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-sm mb-3">Regulatory Accreditations</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                NWUCHAS programmes are recognized and regulated under the laws of Zambia:
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300 font-medium">
                <li>• Higher Education Authority (HEA)</li>
                <li>• Health Professions Council of Zambia (HPCZ)</li>
                <li>• Nursing and Midwifery Council of Zambia (NMCZ)</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              North Western University College of Health and Applied Sciences • CMIS
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-slate-400 transition">
                Portal Sign In
              </Link>
              <span>•</span>
              <a
                href="https://nwuc.edu.zm"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-400 transition inline-flex items-center gap-1"
              >
                Official Site <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentic Signature Lime Green Footer Bar Matching nwuc.edu.zm - Static/Sticky Bottom Bar */}
      <footer className="sticky bottom-0 z-40 bg-[#8DC63F] text-slate-950 py-2.5 px-4 text-xs font-bold border-t border-[#7ab332] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-center md:text-left">
            © 2026 North Western University College of Health and Applied Sciences. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-2.5 gap-y-1 text-[11px] font-semibold text-slate-900">
            <span>Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia</span>
            <span className="hidden sm:inline">•</span>
            <span>Hotlines: <strong>0964240051 / 0955550051 / 0979000051 / 0974896096 / 0974240051</strong></span>
            <span className="hidden sm:inline">•</span>
            <span>WhatsApp: <strong>0955550051 / 0964240051 / 0979000051 / 0974896096 / 0974240051</strong></span>
            <span className="hidden sm:inline">•</span>
            <a href="mailto:info@nwuc.edu.zm" className="underline hover:text-slate-950">info@nwuc.edu.zm</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
