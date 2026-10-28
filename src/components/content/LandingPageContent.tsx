'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SYSTEM_VERSION } from '@/config/version';
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
import { NwuchasLogo } from '@/components/NwuchasLogo';
import { ContentCardItem } from '@/lib/contentCards';
import { EditorialBar } from './EditorialBar';
import { EditableCardWrapper } from './EditableCardWrapper';

interface LandingPageContentProps {
  initialCards: Record<string, ContentCardItem>;
  userCanEdit: boolean;
  user: {
    name: string;
    email: string;
    role: string;
    isSuperAdmin?: boolean;
  } | null;
}

export function LandingPageContent({
  initialCards,
  userCanEdit,
  user,
}: LandingPageContentProps) {
  const [cards, setCards] = useState<Record<string, ContentCardItem>>(initialCards);
  const [isEditMode, setIsEditMode] = useState(userCanEdit);

  function handleCardUpdated(updated: ContentCardItem) {
    setCards((prev) => ({
      ...prev,
      [updated.cardKey]: updated,
    }));
  }

  // Helper safe card getter
  const getCard = (key: string, fallback: Partial<ContentCardItem>): ContentCardItem => {
    return cards[key] || {
      pageKey: 'landing',
      sectionKey: 'general',
      cardKey: key,
      title: fallback.title || '',
      subtitle: fallback.subtitle,
      badge: fallback.badge,
      body: fallback.body || '',
      ctaLabel: fallback.ctaLabel,
      ctaUrl: fallback.ctaUrl,
      metadata: fallback.metadata,
      displayOrder: 0,
      isPublished: true,
    };
  };

  const heroMain = getCard('hero_main', {
    title: 'Empowering the Next Generation of Healthcare Pioneers',
    badge: '2026 Admissions Open',
    body: 'North Western University College of Health and Applied Sciences (NWUCHAS) is a premier tertiary healthcare institution situated in Manyama, Lumwana, Zambia. We deliver rigorous, hands-on clinical education in Registered Nursing, Clinical Medicine, and Public Health.',
    ctaLabel: 'Start 2026 Application',
    ctaUrl: '/apply',
  });

  const heroIntake = getCard('hero_intake', {
    title: 'Key Admission Windows',
    subtitle: '2026 Academic Calendar',
    badge: 'Active Intake',
    body: 'Enrollment is officially open for full-time tertiary diplomas and advance mid-year bridging programmes.',
  });

  const visionCard = getCard('vision', {
    title: 'Our Institutional Vision',
    body: 'To be a centre of excellence in the education, training, and development of ethical, competent, and innovative health professionals in Zambia and across the Southern African sub-region.',
  });

  const missionCard = getCard('mission', {
    title: 'Our Mission',
    body: 'To provide quality, learner-centred, and practice-driven education and research in health and applied sciences that directly responds to community healthcare needs and global standards.',
  });

  const valuesCard = getCard('values', {
    title: 'Institutional Core Values',
    body: 'Grounded in unyielding professional ethics, patient dignity, clinical precision, and community-centred service:',
    metadata: { items: ['Clinical Excellence', 'Compassion', 'Integrity', 'Community Care'] },
  });

  const progRn = getCard('prog_rn', {
    title: 'Diploma in Registered Nursing (RN)',
    subtitle: '3 Years • Full Time',
    badge: 'NMCZ Accredited',
    body: 'Prepares professional registered nurses to deliver comprehensive general, pediatric, psychiatric, and community nursing care with high clinical competencies and leadership.',
    ctaLabel: 'Apply for Registered Nursing',
    ctaUrl: '/apply?programme=nursing',
  });

  const progCoe = getCard('prog_coe', {
    title: 'Diploma in Clinical Medicine (COG)',
    subtitle: '3 Years • Full Time',
    badge: 'HPCZ Accredited',
    body: 'Trains Clinical Officers (General) to diagnose, manage medical emergencies, perform essential minor surgical and obstetric procedures, and administer primary healthcare.',
    ctaLabel: 'Apply for Clinical Medicine',
    ctaUrl: '/apply?programme=clinical',
  });

  const progPh = getCard('prog_ph', {
    title: 'Diploma in Public Health',
    subtitle: '3 Years • Full / Blended',
    badge: 'HPCZ & HEA Approved',
    body: 'Equips professionals with epidemiological surveillance, occupational health & safety in mining, environmental sanitation, infectious disease control, and health policy management.',
    ctaLabel: 'Apply for Public Health',
    ctaUrl: '/apply?programme=public-health',
  });

  const step1 = getCard('step_1', { title: 'Check Criteria', badge: '01', body: 'Ensure you meet the minimum entry requirements: 5 O-Level credits in Zambian GCE / ECZ.' });
  const step2 = getCard('step_2', { title: 'Prepare Docs', badge: '02', body: 'Have certified copies of your ECZ statement of results, NRC, and passport photograph ready.' });
  const step3 = getCard('step_3', { title: 'Apply Online', badge: '03', body: 'Complete the online form and immediately obtain your unique NWU-APP tracking number.' });
  const step4 = getCard('step_4', { title: 'Screening', badge: '04', body: 'The admissions registry verifies qualifications and communicates selection committee decisions.' });
  const step5 = getCard('step_5', { title: 'Enrollment', badge: '05', body: 'Receive your provisional admission offer letter, accept online, and complete professional indexing.' });

  const clinSolwezi = getCard('clin_solwezi', { title: 'Solwezi General Hospital', body: 'Provincial tertiary hospital providing major surgical, internal medicine, pediatric, and obstetric rotations.' });
  const clinLumwana = getCard('clin_lumwana', { title: 'Lumwana First Level Hospital', body: 'Emergency medicine, trauma management, and industrial healthcare clinical placements.' });
  const clinManyama = getCard('clin_manyama', { title: 'Manyama Rural Health Facilities', body: 'Maternal child health (MCH), immunisation outreach, and primary community healthcare.' });
  const clinAssurance = getCard('clin_assurance', { title: 'Clinical Competency Assurance', body: 'Every clinical student maintains an electronic logbook tracking ward hours, procedures observed, assisted, and performed independently in compliance with NMCZ and HPCZ logbook regulations.' });

  const facSim = getCard('fac_sim_lab', { title: 'Skills & Simulation Lab', body: 'High-fidelity adult, pediatric, and birthing simulators for pre-clinical procedural practice.' });
  const facLib = getCard('fac_library', { title: 'Digital Medical Library', body: 'Comprehensive collection of medical textbooks, quiet study zones, and online clinical journal subscriptions.' });
  const facRes = getCard('fac_residences', { title: 'Student Residences', body: 'Secure on-campus hostels including Florence Nightingale residence with 24/7 power, water, and security.' });
  const facThea = getCard('fac_theatres', { title: 'Modern Lecture Theatres', body: 'Spacious amphitheatre-style lecture halls equipped with digital multimedia projectors and sound systems.' });

  const aboutOverview = getCard('about_overview', {
    title: 'North Western University College of Health and Applied Sciences',
    body: 'Located in the Manyama Educational Corridor along Lumwana Road in Kalumbila District, NWUCHAS is an established Zambian higher education institution dedicated exclusively to health sciences.\n\nOur curriculum aligns with the national healthcare priorities articulated by the Ministry of Health (MOH) and verified by the Higher Education Authority (HEA), the Nursing and Midwifery Council of Zambia (NMCZ), and the Health Professions Council of Zambia (HPCZ).',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Editorial Bar for Authorized Staff & Super Admin */}
      <EditorialBar
        userCanEdit={userCanEdit}
        user={user}
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      />

      {/* Top Statutory & Intake Announcement Strip */}
      <div className="bg-[#0b2545] text-slate-200 text-xs py-2 px-4 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8DC63F]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#8DC63F] border border-[#8DC63F]/40">
              <Sparkles className="h-3 w-3 text-[#8DC63F]" />
              {heroMain.badge || '2026 Admissions Open'}
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
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content Card */}
            <div className="lg:col-span-7">
              <EditableCardWrapper
                card={heroMain}
                canEdit={userCanEdit}
                isEditMode={isEditMode}
                onCardUpdated={handleCardUpdated}
                className="space-y-6 text-center lg:text-left"
              >
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
                  {heroMain.title}
                </h1>

                <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  {heroMain.body}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href={heroMain.ctaUrl || '/apply'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#8DC63F] hover:bg-[#72a330] text-slate-950 font-black px-7 py-3.5 text-sm sm:text-base shadow-lg shadow-[#8DC63F]/25 transition active:scale-95 cursor-pointer"
                  >
                    <GraduationCap className="h-5 w-5" />
                    {heroMain.ctaLabel || 'Start 2026 Application'}
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
              </EditableCardWrapper>
            </div>

            {/* Right Hero Admission Windows Card */}
            <div className="lg:col-span-5">
              <EditableCardWrapper
                card={heroIntake}
                canEdit={userCanEdit}
                isEditMode={isEditMode}
                onCardUpdated={handleCardUpdated}
              >
                <div className="rounded-2xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#007B99]/30 text-sky-200 border border-[#007B99]/50">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{heroIntake.title}</h3>
                        <p className="text-xs text-blue-200">{heroIntake.subtitle}</p>
                      </div>
                    </div>
                    {heroIntake.badge && (
                      <span className="rounded-full bg-[#EC008C]/20 text-[#EC008C] text-[11px] font-black px-2.5 py-0.5 border border-[#EC008C]/40 animate-pulse">
                        {heroIntake.badge}
                      </span>
                    )}
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
              </EditableCardWrapper>
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
            <EditableCardWrapper
              card={visionCard}
              canEdit={userCanEdit}
              isEditMode={isEditMode}
              onCardUpdated={handleCardUpdated}
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-50 text-[#007B99] border border-[#007B99]/30 mb-6">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0b2545]">{visionCard.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{visionCard.body}</p>
              </div>
            </EditableCardWrapper>

            {/* Mission Card */}
            <EditableCardWrapper
              card={missionCard}
              canEdit={userCanEdit}
              isEditMode={isEditMode}
              onCardUpdated={handleCardUpdated}
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-lime-50 text-[#5c8426] border border-[#8DC63F]/40 mb-6">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0b2545]">{missionCard.title}</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{missionCard.body}</p>
              </div>
            </EditableCardWrapper>

            {/* Core Values Card */}
            <EditableCardWrapper
              card={valuesCard}
              canEdit={userCanEdit}
              isEditMode={isEditMode}
              onCardUpdated={handleCardUpdated}
              className="md:col-span-2 lg:col-span-1"
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/70 p-8 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-pink-50 text-[#EC008C] border border-[#EC008C]/30 mb-6">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0b2545]">{valuesCard.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{valuesCard.body}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {(valuesCard.metadata?.items || ['Clinical Excellence', 'Compassion', 'Integrity', 'Community Care']).map((val, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-slate-800 font-semibold shadow-2xs">
                      <CheckCircle2 className="h-4 w-4 text-[#8DC63F] shrink-0" />
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </EditableCardWrapper>
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
            <EditableCardWrapper
              card={progRn}
              canEdit={userCanEdit}
              isEditMode={isEditMode}
              onCardUpdated={handleCardUpdated}
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:border-[#8DC63F]/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {progRn.badge && (
                      <span className="rounded-md bg-[#8DC63F]/15 text-[#5c8426] border border-[#8DC63F]/40 text-xs font-bold px-2.5 py-1">
                        {progRn.badge}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500">{progRn.subtitle}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0b2545]">{progRn.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{progRn.body}</p>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                    <div className="font-bold text-slate-700">Entry Requirements:</div>
                    <p className="text-slate-600">
                      {progRn.metadata?.requirements || 'Five (5) O-Level Credits in ECZ/GCE or equivalent: English Language, Mathematics, Biology / Science, and two other subjects.'}
                    </p>
                    <div className="font-bold text-slate-700 pt-2">Professional Body:</div>
                    <p className="text-slate-600">
                      {progRn.metadata?.professionalBody || 'Nursing and Midwifery Council of Zambia (NMCZ)'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href={progRn.ctaUrl || '/apply?programme=nursing'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold py-2.5 text-xs shadow-xs transition"
                  >
                    {progRn.ctaLabel || 'Apply for Registered Nursing'} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </EditableCardWrapper>

            {/* Programme 2: Clinical Medicine */}
            <EditableCardWrapper
              card={progCoe}
              canEdit={userCanEdit}
              isEditMode={isEditMode}
              onCardUpdated={handleCardUpdated}
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:border-[#007B99]/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {progCoe.badge && (
                      <span className="rounded-md bg-[#007B99]/15 text-[#007B99] border border-[#007B99]/40 text-xs font-bold px-2.5 py-1">
                        {progCoe.badge}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500">{progCoe.subtitle}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0b2545]">{progCoe.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{progCoe.body}</p>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                    <div className="font-bold text-slate-700">Entry Requirements:</div>
                    <p className="text-slate-600">
                      {progCoe.metadata?.requirements || 'Five (5) O-Level Credits in ECZ/GCE: English Language, Mathematics, Biology, Physical Science / Chemistry / Physics, and any other subject.'}
                    </p>
                    <div className="font-bold text-slate-700 pt-2">Professional Body:</div>
                    <p className="text-slate-600">
                      {progCoe.metadata?.professionalBody || 'Health Professions Council of Zambia (HPCZ)'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href={progCoe.ctaUrl || '/apply?programme=clinical'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold py-2.5 text-xs shadow-xs transition"
                  >
                    {progCoe.ctaLabel || 'Apply for Clinical Medicine'} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </EditableCardWrapper>

            {/* Programme 3: Public Health */}
            <EditableCardWrapper
              card={progPh}
              canEdit={userCanEdit}
              isEditMode={isEditMode}
              onCardUpdated={handleCardUpdated}
              className="md:col-span-2 lg:col-span-1"
            >
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between hover:border-[#EC008C]/50">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {progPh.badge && (
                      <span className="rounded-md bg-[#EC008C]/15 text-[#c70076] border border-[#EC008C]/30 text-xs font-bold px-2.5 py-1">
                        {progPh.badge}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500">{progPh.subtitle}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#0b2545]">{progPh.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{progPh.body}</p>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-2 text-xs">
                    <div className="font-bold text-slate-700">Entry Requirements:</div>
                    <p className="text-slate-600">
                      {progPh.metadata?.requirements || 'Five (5) O-Level Credits in ECZ/GCE or equivalent including English Language, Mathematics, and a Science subject.'}
                    </p>
                    <div className="font-bold text-slate-700 pt-2">Focus Areas:</div>
                    <p className="text-slate-600">
                      {progPh.metadata?.focusAreas || 'Community Health, Mining Health & Epidemiology'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href={progPh.ctaUrl || '/apply?programme=public-health'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] hover:bg-[#00627a] text-white font-bold py-2.5 text-xs shadow-xs transition"
                  >
                    {progPh.ctaLabel || 'Apply for Public Health'} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </EditableCardWrapper>
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
            {[step1, step2, step3, step4, step5].map((step, idx) => (
              <EditableCardWrapper
                key={step.cardKey}
                card={step}
                canEdit={userCanEdit}
                isEditMode={isEditMode}
                onCardUpdated={handleCardUpdated}
              >
                <div className="h-full rounded-xl border border-slate-200 bg-slate-50 p-6 relative flex flex-col justify-between shadow-2xs hover:shadow-xs transition">
                  <div>
                    <span className="text-3xl font-black text-blue-200 font-mono">0{idx + 1}</span>
                    <h3 className="font-bold text-slate-900 mt-2 text-base">{step.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{step.body}</p>
                  </div>
                </div>
              </EditableCardWrapper>
            ))}
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
                {[clinSolwezi, clinLumwana, clinManyama].map((site) => (
                  <EditableCardWrapper
                    key={site.cardKey}
                    card={site}
                    canEdit={userCanEdit}
                    isEditMode={isEditMode}
                    onCardUpdated={handleCardUpdated}
                  >
                    <div className="flex items-start gap-3 rounded-xl p-2.5 bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/70 transition">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 mt-0.5">
                        <Hospital className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">{site.title}</h3>
                        <p className="text-xs text-slate-400 whitespace-pre-wrap">{site.body}</p>
                      </div>
                    </div>
                  </EditableCardWrapper>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <EditableCardWrapper
                card={clinAssurance}
                canEdit={userCanEdit}
                isEditMode={isEditMode}
                onCardUpdated={handleCardUpdated}
              >
                <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-8 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-cyan-400" /> {clinAssurance.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {clinAssurance.body}
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
              </EditableCardWrapper>
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
            {[
              { c: facSim, icon: Stethoscope, bg: 'bg-sky-50 text-[#007B99]' },
              { c: facLib, icon: BookOpenCheck, bg: 'bg-lime-50 text-[#5c8426]' },
              { c: facRes, icon: Bed, bg: 'bg-pink-50 text-[#EC008C]' },
              { c: facThea, icon: Building2, bg: 'bg-sky-50 text-[#007B99]' },
            ].map(({ c, icon: Icon, bg }) => (
              <EditableCardWrapper
                key={c.cardKey}
                card={c}
                canEdit={userCanEdit}
                isEditMode={isEditMode}
                onCardUpdated={handleCardUpdated}
              >
                <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg ${bg} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              </EditableCardWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* About NWUCHAS Section (#about) */}
      <section id="about" className="py-20 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <EditableCardWrapper
                card={aboutOverview}
                canEdit={userCanEdit}
                isEditMode={isEditMode}
                onCardUpdated={handleCardUpdated}
                className="space-y-4"
              >
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007B99]">
                  About Our Institution
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
                  {aboutOverview.title}
                </h2>
                <div className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {aboutOverview.body}
                </div>

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
              </EditableCardWrapper>
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
                    <span className="font-bold text-slate-800 block">Accrediting Bodies:</span>
                    NMCZ (Nursing), HPCZ (Clinical Medicine), HEA (Higher Education)
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Statutory Registration TPIN:</span>
                    1008492019
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Institutional Footer */}
      <footer id="contact" className="bg-[#0b2545] text-slate-300 py-16 border-t border-blue-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <NwuchasLogo variant="compact" size="md" />
              <p className="text-xs text-slate-400 leading-relaxed pt-2">
                Premier tertiary healthcare training institution dedicated to cultivating ethical, competent clinicians,
                nurses, and public health practitioners in Zambia.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#about" className="hover:text-white transition">About NWUCHAS</Link></li>
                <li><Link href="#programmes" className="hover:text-white transition">Academic Programmes</Link></li>
                <li><Link href="#admissions" className="hover:text-white transition">Admissions Guide</Link></li>
                <li><Link href="#clinical" className="hover:text-white transition">Clinical Attachments</Link></li>
                <li><Link href="/apply" className="text-[#8DC63F] font-bold hover:underline">Apply Online 2026</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Contact & Admissions</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>Plot 511/518 Shilenda Road, Manyama, Lumwana, Zambia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>0964240051 / 0955550051</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>info@nwuc.edu.zm</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Statutory Accreditations</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p>• Nursing & Midwifery Council of Zambia (NMCZ)</p>
                <p>• Health Professions Council of Zambia (HPCZ)</p>
                <p>• Higher Education Authority (HEA)</p>
                <p className="pt-2 text-[11px] text-slate-500 font-mono">Institutional TPIN: 1008492019</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-blue-900/40 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} North Western University College of Health and Applied Sciences. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <Link href="/login" className="text-sky-300 hover:text-white transition">Staff Sign In</Link>
              <span>•</span>
              <Link href="/apply" className="text-[#8DC63F] hover:underline">Student Admissions</Link>
              <span>•</span>
              <span
                id="footer-app-version"
                className="rounded-full border border-blue-800/60 bg-blue-950/40 px-2.5 py-0.5 font-mono text-[11px] text-slate-400"
                title={`${SYSTEM_VERSION.releaseName} — released ${SYSTEM_VERSION.releaseDate}`}
              >
                NWU-CMIS {SYSTEM_VERSION.version}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
