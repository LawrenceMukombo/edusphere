'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  User,
  School,
  Paperclip,
  Camera,
  Upload,
  Trash2,
  Plus,
  Eye,
  Search,
  Printer,
  Award,
  AlertCircle,
  ArrowRight,
  FileText,
  FileCheck2,
  Building2,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Smartphone,
  Building,
  Receipt,
  Copy,
  RotateCcw,
  LogIn,
  LogOut,
  UserCheck,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import {
  ALL_ZAMBIAN_PROVINCES,
  getDistrictsForProvince,
  getSchoolsForDistrict,
  calculateAge,
} from '@/lib/zambiaData';
import { ALL_ECZ_SUBJECTS, SubjectGrade, UploadedDocument } from '@/components/modules/AdmissionsConsole';
import { getUpcomingIntakes, AvailableIntake } from '@/lib/admissionsIntake';
import { ProvisionalOfferLetterModal } from '@/components/admissions/ProvisionalOfferLetterModal';
import { FinalAcceptanceLetterModal } from '@/components/admissions/FinalAcceptanceLetterModal';
import { CandidateAcceptanceModal } from '@/components/admissions/CandidateAcceptanceModal';
import { NwuchasLogo, NWUCHAS_IDENTITY } from '@/components/NwuchasLogo';

export default function CandidateApplicationPortalPage() {
  const [activeMainTab, setActiveMainTab] = useState<'apply' | 'track'>('apply');

  // Dynamic Intake Sessions based on the current month & academic calendar
  const upcomingIntakes = useMemo(() => getUpcomingIntakes(), []);

  // Prospective Student Authentication & Session State
  const [signedInStudent, setSignedInStudent] = useState<any | null>(null);
  const [showSignInModal, setShowSignInModal] = useState<boolean>(false);
  const [signInIdentifier, setSignInIdentifier] = useState<string>('');
  const [signInBusy, setSignInBusy] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>('');

  // Collapsible Steps Panels (Steps 1 to 4)
  const [collapsedSteps, setCollapsedSteps] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const toggleStep = (stepNumber: number) => {
    setCollapsedSteps((prev) => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const setAllStepsCollapsed = (collapsed: boolean) => {
    setCollapsedSteps({ 1: collapsed, 2: collapsed, 3: collapsed, 4: collapsed });
  };

  // Form State
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    nrc: '',
    email: '',
    phone: '',
    programmeChoice: 'Diploma in Registered Nursing',
    intakeLabel: getUpcomingIntakes()[0]?.label || 'January 2027 (Main Academic Intake)',
    school: '',
    examNumber: '',
    sponsor: 'Self-Sponsored / Family',
    sponsorName: '',
    sponsorPhone: '',
    residentialAddress: '',
    accommodation: '',
  });

  // Next of Kin / Emergency Contact
  const [nextOfKin, setNextOfKin] = useState({
    fullName: '',
    relationship: 'Parent / Guardian',
    phone: '',
    email: '',
    address: '',
  });

  // Application Fee & Payment State
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'ZAMTEL_KWACHA' | 'BANK_DEPOSIT' | 'PAY_AT_CASHIER'>('MTN_MOMO');
  const [paymentPhone, setPaymentPhone] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [momoPromptSent, setMomoPromptSent] = useState<boolean>(false);

  // Document Upload Category for Multi-Uploads
  const [selectedUploadCategory, setSelectedUploadCategory] = useState<string>('Certified ECZ Statement of Results');

  // Cascading Location
  const [selectedProvince, setSelectedProvince] = useState<string>('North-Western');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Kalumbila');

  // Cascading Secondary School
  const [schoolProvince, setSchoolProvince] = useState<string>('North-Western');
  const [schoolDistrict, setSchoolDistrict] = useState<string>('Kalumbila');
  const [isCustomSchool, setIsCustomSchool] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState('');

  // Passport Photo
  const [passportPhotoUrl, setPassportPhotoUrl] = useState<string>('');

  // Dynamic O-Level Subjects (Clean baseline without prefilled placeholder grades)
  const [subjects, setSubjects] = useState<SubjectGrade[]>([
    { name: 'English Language', grade: '' },
    { name: 'Mathematics', grade: '' },
    { name: 'Biology', grade: '' },
    { name: 'Science (Physics/Chemistry)', grade: '' },
    { name: 'Civic Education', grade: '' },
  ]);

  // Document Uploads (Clean baseline for applicant uploads)
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successSubmission, setSuccessSubmission] = useState<{
    applicationNumber: string;
    candidateName: string;
    programme: string;
    intakeLabel?: string;
    email?: string;
    accountProvisioned?: boolean;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentReference?: string;
  } | null>(null);

  // Tracking State
  const [trackAppNumber, setTrackAppNumber] = useState('');
  const [trackNrcOrEmail, setTrackNrcOrEmail] = useState('');
  const [trackBusy, setTrackBusy] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackedApplication, setTrackedApplication] = useState<any | null>(null);

  // Letter Modals State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showAcceptanceModal, setShowAcceptanceModal] = useState(false);
  const [showFinalLetterModal, setShowFinalLetterModal] = useState(false);

  // Step Completion Trackers
  const isStep1Complete = !!(form.firstName.trim() && form.lastName.trim() && (form.phone.trim() || form.email.trim()) && form.nrc.trim() && form.gender && form.dateOfBirth);
  const isStep2Complete = !!(form.school || customSchoolName);
  const isStep3Complete = documents.length > 0;
  const isStep4Complete = !!(form.programmeChoice && declarationAgreed);

  // Derived Values
  const liveAge = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);
  const availableDistricts = useMemo(() => getDistrictsForProvince(selectedProvince), [selectedProvince]);
  const availableSchoolDistricts = useMemo(() => getDistrictsForProvince(schoolProvince), [schoolProvince]);
  const availableSchools = useMemo(
    () => getSchoolsForDistrict(schoolProvince, schoolDistrict),
    [schoolProvince, schoolDistrict]
  );

  const creditAnalysis = useMemo(() => {
    let creditCount = 0;
    const coreFound: Record<string, boolean> = {
      English: false,
      Mathematics: false,
      Biology: false,
      Science: false,
    };

    subjects.forEach((s) => {
      if (!s.grade) return;
      const g = parseInt(String(s.grade), 10);
      if (isNaN(g)) return;
      if (g <= 6) creditCount++;
      if (s.name.includes('English') && g <= 6) coreFound.English = true;
      if (s.name.includes('Mathematics') && g <= 6) coreFound.Mathematics = true;
      if (s.name.includes('Biology') && g <= 6) coreFound.Biology = true;
      if ((s.name.includes('Science') || s.name.includes('Physics') || s.name.includes('Chemistry')) && g <= 6) {
        coreFound.Science = true;
      }
    });

    const meetsCore = coreFound.English && coreFound.Mathematics && coreFound.Biology && coreFound.Science;
    const meetsTotal = creditCount >= 5;
    return { creditCount, meetsCore, meetsTotal, qualified: meetsCore && meetsTotal, coreFound };
  }, [subjects]);

  // Handlers for dynamic subjects
  function handleAddSubject() {
    const existing = new Set(subjects.map((s) => s.name));
    const nextAvail = ALL_ECZ_SUBJECTS.find((sub) => !existing.has(sub)) || 'Agricultural Science';
    setSubjects([...subjects, { name: nextAvail, grade: '3' }]);
  }

  function handleRemoveSubject(index: number) {
    if (subjects.length <= 5) return;
    setSubjects(subjects.filter((_, idx) => idx !== index));
  }

  function handleSubjectChange(index: number, field: 'name' | 'grade', value: string) {
    const next = [...subjects];
    next[index] = { ...next[index], [field]: value };
    setSubjects(next);
  }

  // Handle Photo Upload
  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photograph must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPassportPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  // Handle Document Upload
  function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>, category: string) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: UploadedDocument[] = [];
    Array.from(files).forEach((file, idx) => {
      if (file.size > 15 * 1024 * 1024) return;
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      newDocs.push({
        id: `upload-${Date.now()}-${idx}`,
        name: file.name,
        category,
        size: sizeStr,
        rawBytes: file.size,
        type: file.type || 'application/pdf',
        uploadedAt: new Date().toISOString(),
      });
    });

    setDocuments((prev) => [...prev, ...newDocs]);
  }

  // Submit Application
  async function handleSubmitApplication(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!declarationAgreed) {
      setErrorMsg('Please read and accept the Applicant Declaration & Legal Pledge.');
      return;
    }

    if (!form.firstName || !form.lastName) {
      setErrorMsg('Please enter your full first name and surname.');
      return;
    }

    if (!form.email && !form.phone) {
      setErrorMsg('Please provide at least a mobile phone number or email address for notification.');
      return;
    }

    const resolvedSchool = isCustomSchool ? customSchoolName.trim() : (form.school || availableSchools[0]);
    if (!resolvedSchool) {
      setErrorMsg('Please specify your secondary school attended.');
      return;
    }

    const fullAddress = `${form.residentialAddress ? form.residentialAddress + ', ' : ''}${selectedDistrict} District, ${selectedProvince} Province, Zambia`;

    setBusy(true);

    try {
      const generatedFeeRef = paymentReference.trim() || `NWU-FEE-${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          middleName: form.middleName?.trim() || undefined,
          lastName: form.lastName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          programmeChoice: form.programmeChoice,
          intakeLabel: form.intakeLabel,
          dateOfBirth: form.dateOfBirth,
          nrc: form.nrc.trim() || undefined,
          gender: form.gender,
          school: resolvedSchool,
          examNumber: form.examNumber.trim() || undefined,
          sponsor: form.sponsor,
          residentialAddress: fullAddress,
          passportPhotoUrl: passportPhotoUrl || undefined,
          nextOfKin: {
            fullName: nextOfKin.fullName.trim() || undefined,
            relationship: nextOfKin.relationship || undefined,
            phone: nextOfKin.phone.trim() || undefined,
            email: nextOfKin.email.trim() || undefined,
            address: nextOfKin.address.trim() || undefined,
          },
          payment: {
            method: paymentMethod,
            mobileNumber: paymentPhone.trim() || form.phone.trim() || undefined,
            reference: generatedFeeRef,
            amount: 150,
            status: paymentMethod === 'PAY_AT_CASHIER' ? 'PENDING' : 'PAID',
          },
          subjects,
          documents,
        }),
      });

      let payload: any;
      try {
        payload = await res.json();
      } catch {
        throw new Error('Server returned an unreadable response. Please check network connection and try again.');
      }

      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'Application submission failed. Please try again.');
      }

      setSuccessSubmission({
        applicationNumber: payload.data.applicationNumber,
        candidateName: `${payload.data.firstName} ${payload.data.lastName}`,
        programme: payload.data.programmeChoice,
        intakeLabel: payload.data.intakeLabel || form.intakeLabel,
        email: form.email,
        accountProvisioned: payload.data.accountProvisioned ?? true,
        paymentStatus: payload.data.paymentStatus || (paymentMethod === 'PAY_AT_CASHIER' ? 'PENDING' : 'PAID'),
        paymentMethod,
        paymentReference: generatedFeeRef,
      });

      const sessionData = {
        ...payload.data,
        metadata: {
          nrc: form.nrc,
          phone: form.phone,
          school: resolvedSchool,
          examNumber: form.examNumber,
          subjects,
          documents,
          passportPhotoUrl,
          accommodation: form.accommodation,
          sponsor: form.sponsor,
          sponsorName: form.sponsorName,
          residentialAddress: fullAddress,
          nextOfKin,
          paymentMethod,
          paymentReference: generatedFeeRef,
        },
      };
      setSignedInStudent(sessionData);
      setTrackedApplication(sessionData);
      try {
        localStorage.setItem('nwuchas_candidate_session', JSON.stringify(sessionData));
      } catch {}

      setTrackAppNumber(payload.data.applicationNumber);
      setTrackNrcOrEmail(form.nrc || form.email || form.phone);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to the admissions server.');
    } finally {
      setBusy(false);
    }
  }

  // Restore candidate session on initial load if previously saved
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('nwuchas_candidate_session') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.applicationNumber || parsed.email || parsed.nrc || parsed.phone)) {
          setSignedInStudent(parsed);
          setTrackedApplication(parsed);
          setActiveMainTab('track');
          refreshCandidateSession(parsed.applicationNumber || parsed.email || parsed.nrc || parsed.phone);
        }
      }
    } catch {}
  }, []);

  async function refreshCandidateSession(ident: string) {
    if (!ident) return;
    try {
      const res = await fetch('/api/admissions/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nrcOrEmail: ident.trim() }),
      });
      const payload = await res.json();
      if (res.ok && payload.success && payload.data) {
        setSignedInStudent(payload.data);
        setTrackedApplication(payload.data);
        try {
          localStorage.setItem('nwuchas_candidate_session', JSON.stringify(payload.data));
        } catch {}
      }
    } catch {}
  }

  // Sign In Prospective Student using Email, Phone, NRC or Application #
  async function handleCandidateSignIn(identifierToUse?: string) {
    const ident = (identifierToUse || signInIdentifier).trim();
    if (!ident) {
      setSignInError('Please provide your Email, Phone Number, NRC or Application Number.');
      return;
    }

    setSignInBusy(true);
    setSignInError('');

    try {
      const res = await fetch('/api/admissions/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nrcOrEmail: ident }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || 'No candidate record found matching the details provided.');
      }

      setSignedInStudent(payload.data);
      setTrackedApplication(payload.data);
      try {
        localStorage.setItem('nwuchas_candidate_session', JSON.stringify(payload.data));
      } catch {}

      setShowSignInModal(false);
      setActiveMainTab('track');
    } catch (err: any) {
      setSignInError(err.message || 'Unable to sign in. Please check your credentials or register a new application.');
    } finally {
      setSignInBusy(false);
    }
  }

  function handleCandidateSignOut() {
    try {
      localStorage.removeItem('nwuchas_candidate_session');
    } catch {}
    setSignedInStudent(null);
    setTrackedApplication(null);
    setActiveMainTab('apply');
  }

  // Track Application Search
  async function handleTrackSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setTrackError('');
    setTrackedApplication(null);

    if (!trackAppNumber.trim() || !trackNrcOrEmail.trim()) {
      setTrackError('Please provide both your Application Number and NRC or registered Email.');
      return;
    }

    setTrackBusy(true);

    try {
      const res = await fetch('/api/admissions/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          applicationNumber: trackAppNumber.trim(),
          nrcOrEmail: trackNrcOrEmail.trim(),
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.message || 'No matching application found.');
      }

      setTrackedApplication(payload.data);
      setSignedInStudent(payload.data);
      try {
        localStorage.setItem('nwuchas_candidate_session', JSON.stringify(payload.data));
      } catch {}
    } catch (err: any) {
      setTrackError(err.message || 'Tracking search failed.');
    } finally {
      setTrackBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Banner / Letterhead */}
      <div className="border-b border-slate-200 bg-white px-4 py-8 sm:px-8 shadow-xs">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <NwuchasLogo variant="compact" size="lg" />
              <div className="hidden sm:block pl-3 border-l border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#007B99]/30 bg-[#007B99]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#007B99]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#007B99]" />
                    Online Candidate Portal
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#8DC63F]/40 bg-[#8DC63F]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#5c8426]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#8DC63F]" />
                    NMCZ &amp; HPCZ Accredited
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-sans">
                  <MapPin className="h-3.5 w-3.5 text-[#007B99] shrink-0" />
                  {NWUCHAS_IDENTITY.address}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {signedInStudent ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs shadow-2xs">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-700 font-bold text-white shadow-xs text-xs shrink-0">
                    {signedInStudent.firstName?.[0] || 'A'}{signedInStudent.lastName?.[0] || 'C'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-slate-900 leading-tight">
                      {signedInStudent.firstName} {signedInStudent.lastName}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-800">
                      {signedInStudent.applicationNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCandidateSignOut}
                    className="ml-1 inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs"
                    title="Sign out of candidate portal"
                  >
                    <LogOut className="h-3.5 w-3.5 text-slate-500" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSignInModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-sm"
                >
                  <LogIn className="h-4 w-4" /> Prospective Student Sign In
                </button>
              )}

              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs"
              >
                Staff Login →
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex gap-3 border-b border-slate-200 pb-0">
            <button
              onClick={() => setActiveMainTab('apply')}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeMainTab === 'apply'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="h-4 w-4" /> 1. Submit Online Application
            </button>
            <button
              onClick={() => {
                setActiveMainTab('track');
                if (!signedInStudent && !trackedApplication) {
                  setShowSignInModal(true);
                }
              }}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                activeMainTab === 'track'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="h-4 w-4" /> 2. My Profile &amp; Application Workflow
              {(signedInStudent || trackedApplication) && (
                <span className="ml-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] text-white">Active</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-8 flex-1 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: APPLY ONLINE                                                       */}
        {/* ========================================================================= */}
        {activeMainTab === 'apply' && (
          <div>
            {successSubmission ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-sm">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-700 text-white font-black text-2xl shadow-sm">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-900">Application Successfully Submitted!</h2>
                <p className="mt-2 text-xs text-slate-700 max-w-xl mx-auto leading-5">
                  Thank you, <strong className="text-slate-900">{successSubmission.candidateName}</strong>. Your application
                  for <strong className="text-slate-900">{successSubmission.programme}</strong> has been logged in the college
                  admissions registry.
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <div className="rounded-xl border border-emerald-300 bg-white px-6 py-4 shadow-xs text-left">
                    <p className="text-[11px] uppercase tracking-widest text-emerald-800 font-bold">Your Application Number</p>
                    <p className="text-2xl font-mono font-black text-slate-900 mt-1">{successSubmission.applicationNumber}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Keep this number safe for tracking &amp; matriculation.</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-xs text-left">
                    <p className="text-[11px] uppercase tracking-widest text-slate-600 font-bold">Intake Session</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{successSubmission.intakeLabel || form.intakeLabel}</p>
                    <span className="inline-block mt-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Direct Entry Intake</span>
                  </div>
                </div>

                <div className="mt-5 mx-auto max-w-lg rounded-xl border border-emerald-200 bg-white p-4 text-left shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-1">
                    <UserCheck className="h-4 w-4 text-emerald-700" />
                    Applicant &amp; System User Account Automatically Provisioned
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    You have been registered as an authorized candidate user on the NWUCHAS CMIS.
                    {successSubmission.email && <span> Registered email: <strong className="text-slate-800">{successSubmission.email}</strong>.</span>}
                    {' '}You can sign in anytime using your application number or email to view admissions committee reviews and download offer letters.
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Application Fee (ZMW 150):</span>
                    <span className={`font-bold ${successSubmission.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {successSubmission.paymentStatus === 'PAID' ? '✓ Received (Electronic MoMo/Card)' : 'Pending Verification at Cashier'}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setActiveMainTab('track');
                      setTrackAppNumber(successSubmission.applicationNumber);
                      setTrackNrcOrEmail(form.nrc || form.email);
                      handleTrackSubmit();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                  >
                    Track Application Workflow →
                  </button>
                  <button
                    onClick={() => {
                      setSuccessSubmission(null);
                      setDeclarationAgreed(false);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                {/* Notice & Intake Highlights Banner */}
                <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/60 p-5 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white shadow-xs">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-black text-slate-900">
                            Direct Online Admissions Portal
                          </h2>
                          <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            {upcomingIntakes[0]?.label || 'Active Intake'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 max-w-2xl leading-relaxed">
                          Applying automatically registers your <strong>Applicant Portal Account</strong> in the college database.
                          Fill all 4 steps below or collapse panels as needed. Application fee: <strong>ZMW 150.00</strong> (payable via MTN MoMo, Airtel, Zamtel, Zanaco Bank, or Manyama Cashier).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAllStepsCollapsed(false)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                      >
                        Expand All Steps
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllStepsCollapsed(true)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  {/* Upcoming Intakes Ribbon */}
                  <div className="mt-4 pt-4 border-t border-emerald-100 flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-emerald-700" /> Available Intake Windows:
                    </span>
                    {upcomingIntakes.map((intake, idx) => (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border text-[11px] font-semibold transition ${
                          form.intakeLabel === intake.label
                            ? 'border-emerald-500 bg-emerald-100/70 text-emerald-950 ring-1 ring-emerald-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 cursor-pointer'
                        }`}
                        onClick={() => setForm((prev) => ({ ...prev, intakeLabel: intake.label }))}
                      >
                        <span className="font-bold">{intake.label}</span>
                        <span className="text-[10px] text-slate-500">• Deadline: {intake.applicationDeadline}</span>
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          intake.status === 'OPEN' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {intake.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2 shadow-xs">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* 1. PERSONAL INFORMATION & NEXT OF KIN */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition">
                  <div
                    onClick={() => toggleStep(1)}
                    className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                        <User className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          1. Personal, Contact &amp; Next of Kin Details
                          {isStep1Complete ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <Check className="h-3 w-3" /> Done
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Incomplete
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          As appearing on your National Registration Card (NRC) or Passport + Emergency Contact
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Step 1 of 4</span>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
                      >
                        {collapsedSteps[1] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {!collapsedSteps[1] && (
                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Passport Photo Upload & Live Preview */}
                      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-xl border-2 border-dashed border-emerald-400 bg-white overflow-hidden shadow-2xs">
                          {passportPhotoUrl ? (
                            <img src={passportPhotoUrl} alt="Applicant Passport Photo" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center p-2 text-slate-400">
                              <Camera className="h-6 w-6 mx-auto mb-1 text-emerald-700" />
                              <span className="text-[10px]">Photo</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <h4 className="text-xs font-bold text-slate-900">Passport-Sized Color Photograph</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Upload a clear, white-background headshot (JPG, PNG, or WEBP, max 5MB). Required for matriculation and student ID badge.
                          </p>
                          <label className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer transition shadow-xs">
                            <Upload className="h-3.5 w-3.5" />
                            {passportPhotoUrl ? 'Change Photo' : 'Upload Passport Photo'}
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                          {passportPhotoUrl && (
                            <button
                              type="button"
                              onClick={() => setPassportPhotoUrl('')}
                              className="ml-2 text-xs font-semibold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">First Name <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={form.firstName}
                            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                            placeholder="e.g. Mapalo"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Middle Name (Optional)</label>
                          <input
                            type="text"
                            value={form.middleName}
                            onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                            placeholder="e.g. Grace"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Surname / Last Name <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={form.lastName}
                            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            placeholder="e.g. Mwanza"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Gender <span className="text-rose-500">*</span></label>
                          <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          >
                            <option value="">Select Gender</option>
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                          </select>
                        </div>

                        <div>
                          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            <span>Date of Birth <span className="text-rose-500">*</span></span>
                            <span className="text-[11px] font-bold text-emerald-800">
                              Age: {liveAge ? `${liveAge.years} yrs` : '—'}
                            </span>
                          </label>
                          <input
                            type="date"
                            required
                            value={form.dateOfBirth}
                            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">National Registration Card (NRC) / Passport <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={form.nrc}
                            onChange={(e) => setForm({ ...form, nrc: e.target.value })}
                            placeholder="e.g. 384920/11/1"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Mobile Phone Number <span className="text-rose-500">*</span></label>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="e.g. +260 977 123456"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">SMS notifications and offer letter alerts will be sent here.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Email Address</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="e.g. mapalo.mwanza@gmail.com"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">Your official offer letter PDF will be delivered here.</p>
                        </div>
                      </div>

                      {/* Cascading Zambian Geography */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                          Residential Location (Zambian Province &amp; District Cascade)
                        </span>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Province</label>
                            <select
                              value={selectedProvince}
                              onChange={(e) => {
                                const p = e.target.value;
                                setSelectedProvince(p);
                                const dists = getDistrictsForProvince(p);
                                setSelectedDistrict(dists[0] || '');
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            >
                              {ALL_ZAMBIAN_PROVINCES.map((prov) => (
                                <option key={prov} value={prov}>{prov} Province</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">District</label>
                            <select
                              value={selectedDistrict}
                              onChange={(e) => setSelectedDistrict(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            >
                              {availableDistricts.map((dist) => (
                                <option key={dist} value={dist}>{dist} District</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Physical Town / Street / Compound Address</label>
                          <input
                            type="text"
                            value={form.residentialAddress}
                            onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })}
                            placeholder="e.g. Manyama township, Lumwana road corridor, Kalumbila"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>
                      </div>

                      {/* NEXT OF KIN / EMERGENCY CONTACT DETAILS */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                              Next of Kin / Emergency Contact Details
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Statutory requirement for tertiary college matriculation, medical insurance, and emergencies.
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Next of Kin Full Name</label>
                            <input
                              type="text"
                              value={nextOfKin.fullName}
                              onChange={(e) => setNextOfKin({ ...nextOfKin, fullName: e.target.value })}
                              placeholder="e.g. John B. Mwanza"
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Relationship to Applicant</label>
                            <select
                              value={nextOfKin.relationship}
                              onChange={(e) => setNextOfKin({ ...nextOfKin, relationship: e.target.value })}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            >
                              <option value="Parent / Guardian">Parent / Guardian</option>
                              <option value="Spouse">Spouse</option>
                              <option value="Sibling">Sibling (Brother / Sister)</option>
                              <option value="Uncle / Aunt">Uncle / Aunt</option>
                              <option value="Relative">Other Family Relative</option>
                              <option value="Sponsor / Mentor">Sponsor / Mentor</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Emergency Mobile Phone</label>
                            <input
                              type="tel"
                              value={nextOfKin.phone}
                              onChange={(e) => setNextOfKin({ ...nextOfKin, phone: e.target.value })}
                              placeholder="e.g. +260 978 765432"
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Email Address (Optional)</label>
                            <input
                              type="email"
                              value={nextOfKin.email}
                              onChange={(e) => setNextOfKin({ ...nextOfKin, email: e.target.value })}
                              placeholder="e.g. parent.guardian@gmail.com"
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Residential Address</label>
                          <input
                            type="text"
                            value={nextOfKin.address}
                            onChange={(e) => setNextOfKin({ ...nextOfKin, address: e.target.value })}
                            placeholder="e.g. House No. 12, Manyama Town / Solwezi"
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Step 1 Quick Navigation Button */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setCollapsedSteps((prev) => ({ ...prev, 1: true, 2: false }))}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#007B99] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#00627a] shadow-2xs transition"
                        >
                          Proceed to Step 2: ECZ O-Levels →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. SECONDARY EDUCATION & O-LEVEL RESULTS */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition">
                  <div
                    onClick={() => toggleStep(2)}
                    className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                        <School className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          2. Secondary Education &amp; ECZ O-Levels
                          {isStep2Complete ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <Check className="h-3 w-3" /> Done
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Incomplete
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Statutory Entry Rule: 5 ECZ Credits including English, Math, Biology, and Science
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Step 2 of 4</span>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
                      >
                        {collapsedSteps[2] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {!collapsedSteps[2] && (
                    <div className="p-6 sm:p-8 space-y-6">
                      {/* Secondary School Cascade */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                          Secondary School Attended (Cascaded Selection)
                        </span>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">School Province</label>
                            <select
                              value={schoolProvince}
                              onChange={(e) => {
                                const p = e.target.value;
                                setSchoolProvince(p);
                                const dists = getDistrictsForProvince(p);
                                const firstDist = dists[0] || '';
                                setSchoolDistrict(firstDist);
                                const schools = getSchoolsForDistrict(p, firstDist);
                                setForm((prev) => ({ ...prev, school: schools[0] || '' }));
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            >
                              {ALL_ZAMBIAN_PROVINCES.map((prov) => (
                                <option key={prov} value={prov}>{prov} Province</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">School District</label>
                            <select
                              value={schoolDistrict}
                              onChange={(e) => {
                                const d = e.target.value;
                                setSchoolDistrict(d);
                                const schools = getSchoolsForDistrict(schoolProvince, d);
                                setForm((prev) => ({ ...prev, school: schools[0] || '' }));
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            >
                              {availableSchoolDistricts.map((dist) => (
                                <option key={dist} value={dist}>{dist} District</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Secondary School Name</label>
                            {!isCustomSchool ? (
                              <select
                                value={form.school || availableSchools[0]}
                                onChange={(e) => setForm({ ...form, school: e.target.value })}
                                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                              >
                                {availableSchools.map((sch) => (
                                  <option key={sch} value={sch}>{sch}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={customSchoolName}
                                onChange={(e) => setCustomSchoolName(e.target.value)}
                                placeholder="Type school name..."
                                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => setIsCustomSchool(!isCustomSchool)}
                              className="mt-1 text-[11px] font-bold text-emerald-700 hover:underline"
                            >
                              {isCustomSchool ? '← Choose from district school list' : '+ My school is not listed (Type manually)'}
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">ECZ Examination Number</label>
                            <input
                              type="text"
                              value={form.examNumber}
                              onChange={(e) => setForm({ ...form, examNumber: e.target.value })}
                              placeholder="e.g. 2024/7012/045"
                              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none transition shadow-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Credit Analyzer Banner */}
                      <div className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs ${
                        creditAnalysis.qualified
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                          : 'border-amber-200 bg-amber-50 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Award className="h-6 w-6 shrink-0 text-emerald-700" />
                          <div>
                            <span className="font-bold text-xs block">
                              ECZ Grade 12 Credit Evaluation: {creditAnalysis.creditCount} Credits Recorded
                            </span>
                            <p className="text-[11px] text-slate-600">
                              {creditAnalysis.qualified
                                ? 'Meets statutory NMCZ/HPCZ entry threshold (5 credits with English, Math, Biology & Science).'
                                : 'Ensure at least 5 credits (Grades 1-6) including English, Math, Biology, and Science.'}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          creditAnalysis.qualified ? 'bg-emerald-700 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {creditAnalysis.qualified ? 'Eligible for Direct Admission' : 'Review Criteria'}
                        </span>
                      </div>

                      {/* Dynamic Subjects List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Grade 12 Subjects &amp; Scores</span>
                          <button
                            type="button"
                            onClick={handleAddSubject}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add Another Subject
                          </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {subjects.map((sub, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 shadow-2xs"
                            >
                              <div className="flex-1">
                                <select
                                  value={sub.name}
                                  onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                                  className="w-full rounded border border-slate-300 bg-white p-1.5 text-xs text-slate-900"
                                >
                                  {ALL_ECZ_SUBJECTS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-24">
                                <select
                                  value={sub.grade}
                                  onChange={(e) => handleSubjectChange(idx, 'grade', e.target.value)}
                                  className="w-full rounded border border-slate-300 bg-white p-1.5 text-xs text-slate-900 font-bold"
                                >
                                  <option value="">Grade</option>
                                  <option value="1">1 (Dist)</option>
                                  <option value="2">2 (Dist)</option>
                                  <option value="3">3 (Merit)</option>
                                  <option value="4">4 (Merit)</option>
                                  <option value="5">5 (Credit)</option>
                                  <option value="6">6 (Credit)</option>
                                  <option value="7">7 (Pass)</option>
                                  <option value="8">8 (Pass)</option>
                                  <option value="9">9 (Fail)</option>
                                </select>
                              </div>
                              {subjects.length > 5 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubject(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600"
                                  title="Remove subject"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Step 2 Quick Navigation Button */}
                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setCollapsedSteps((prev) => ({ ...prev, 1: false, 2: true }))}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                        >
                          ← Back to Step 1
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollapsedSteps((prev) => ({ ...prev, 2: true, 3: false }))}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#007B99] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#00627a] shadow-2xs transition"
                        >
                          Proceed to Step 3: Document Uploads →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. DOCUMENT UPLOADS & MULTI-CERTIFICATES */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition">
                  <div
                    onClick={() => toggleStep(3)}
                    className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                        <Paperclip className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          3. Document Uploads &amp; Verification Scans
                          {isStep3Complete ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <Check className="h-3 w-3" /> {documents.length} File{documents.length > 1 ? 's' : ''} Attached
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              0 Attached (Optional at Submission)
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Multiple files &amp; certificates accepted (PDF, JPG, PNG, max 15MB each)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Step 3 of 4</span>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
                      >
                        {collapsedSteps[3] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {!collapsedSteps[3] && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex items-start gap-3">
                        <FileCheck2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-slate-900">Multiple Certificate Uploads Supported</strong>
                          Candidates who sat for GCE examinations in multiple sittings or hold secondary plus tertiary diplomas may select and upload multiple files at once. You can also upload additional certificates after submission via your Applicant Portal.
                        </div>
                      </div>

                      {/* 3 Upload Action Cards */}
                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* 1. ECZ Results */}
                        <div className="rounded-xl border border-dashed border-emerald-300 bg-slate-50/70 p-4 text-center flex flex-col justify-between">
                          <div>
                            <FileText className="h-7 w-7 text-emerald-700 mx-auto mb-2" />
                            <h4 className="text-xs font-bold text-slate-900">Certified ECZ Results / Certificates</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Upload Grade 12 statement of results or GCE certificates (multiple allowed)</p>
                          </div>
                          <label className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer transition shadow-xs">
                            <Upload className="h-3.5 w-3.5" /> Select Certificate(s)
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleDocumentUpload(e, 'Certified ECZ Statement of Results')}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* 2. NRC / Passport */}
                        <div className="rounded-xl border border-dashed border-emerald-300 bg-slate-50/70 p-4 text-center flex flex-col justify-between">
                          <div>
                            <ShieldCheck className="h-7 w-7 text-emerald-700 mx-auto mb-2" />
                            <h4 className="text-xs font-bold text-slate-900">National Registration Card (NRC)</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Front and back scan or photo of your NRC card or passport bio-data</p>
                          </div>
                          <label className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer transition shadow-xs">
                            <Upload className="h-3.5 w-3.5" /> Select NRC Scans
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleDocumentUpload(e, 'National Registration Card (NRC)')}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* 3. Other Academic Diplomas / Transcripts */}
                        <div className="rounded-xl border border-dashed border-emerald-300 bg-slate-50/70 p-4 text-center flex flex-col justify-between">
                          <div>
                            <Award className="h-7 w-7 text-emerald-700 mx-auto mb-2" />
                            <h4 className="text-xs font-bold text-slate-900">Transcripts &amp; Other Certificates</h4>
                            <p className="text-[11px] text-slate-500 mt-1">Prior diplomas, recommendation letters, or professional licenses</p>
                          </div>
                          <label className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 cursor-pointer transition shadow-xs">
                            <Upload className="h-3.5 w-3.5" /> Select Other Files
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleDocumentUpload(e, 'Tertiary Diploma / Academic Transcript')}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Multi-File Upload Dropzone with Category Picker */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="text-xs font-bold text-slate-700">Custom Category Upload:</label>
                          <select
                            value={selectedUploadCategory}
                            onChange={(e) => setSelectedUploadCategory(e.target.value)}
                            className="rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                          >
                            <option value="Certified ECZ Statement of Results">Certified ECZ Statement of Results</option>
                            <option value="National Registration Card (NRC)">National Registration Card (NRC)</option>
                            <option value="Tertiary Diploma / Academic Transcript">Tertiary Diploma / Academic Transcript</option>
                            <option value="School Leaving Testimonial">School Leaving Testimonial</option>
                            <option value="Medical Examination Report">Medical Examination Report</option>
                            <option value="Proof of Fee Payment">Proof of Fee Payment / Bank Slip</option>
                            <option value="Other Supporting Document">Other Supporting Document</option>
                          </select>
                        </div>

                        <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 cursor-pointer transition shadow-2xs">
                          <Plus className="h-4 w-4 text-emerald-700" /> Upload Multiple Files Under Selected Category
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleDocumentUpload(e, selectedUploadCategory)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Attached Documents List */}
                      {documents.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Attached Documents ({documents.length}):
                            </span>
                            <button
                              type="button"
                              onClick={() => setDocuments([])}
                              className="text-[11px] font-semibold text-rose-600 hover:underline"
                            >
                              Clear All Files
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {documents.map((doc, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-2xs"
                              >
                                <div className="flex items-center gap-2.5 overflow-hidden">
                                  <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                  <div className="overflow-hidden">
                                    <p className="truncate font-semibold text-slate-800">{doc.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{doc.category} • {doc.size}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                                  className="text-slate-400 hover:text-rose-600 p-1"
                                  title="Remove document"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3 Quick Navigation Button */}
                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => setCollapsedSteps((prev) => ({ ...prev, 2: false, 3: true }))}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                        >
                          ← Back to Step 2
                        </button>
                        <button
                          type="button"
                          onClick={() => setCollapsedSteps((prev) => ({ ...prev, 3: true, 4: false }))}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#007B99] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#00627a] shadow-2xs transition"
                        >
                          Proceed to Step 4: Programme &amp; Fee Checkout →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. PROGRAMME SELECTION, DYNAMIC INTAKE & FEE CHECKOUT */}
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition">
                  <div
                    onClick={() => toggleStep(4)}
                    className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                        <GraduationCap className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          4. Health Sciences Programme, Dynamic Intake &amp; Fee Checkout
                          {isStep4Complete ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              <Check className="h-3 w-3" /> Ready
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                              Pending Declaration
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Accredited by NMCZ, HPCZ, and Higher Education Authority (HEA) • ZMW 150 Application Fee
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 hidden sm:inline">Step 4 of 4</span>
                      <button
                        type="button"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition"
                      >
                        {collapsedSteps[4] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {!collapsedSteps[4] && (
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Selected Programme <span className="text-rose-500">*</span></label>
                          <select
                            value={form.programmeChoice}
                            onChange={(e) => setForm({ ...form, programmeChoice: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          >
                            <option value="Diploma in Registered Nursing">Diploma in Registered Nursing (3 Years - NMCZ)</option>
                            <option value="Diploma in Clinical Medicine">Diploma in Clinical Medicine (3 Years - HPCZ)</option>
                            <option value="Diploma in Pharmacy Technology">Diploma in Pharmacy Technology (3 Years - HPCZ)</option>
                            <option value="Diploma in Public Health">Diploma in Public Health (3 Years - HPCZ)</option>
                            <option value="Bachelor of Science in Nursing">Bachelor of Science in Nursing (4 Years Degree)</option>
                          </select>
                        </div>

                        {/* DYNAMIC INTAKE SESSIONS DROPDOWN */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                              Intake Session <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Auto-Calculated Intake Calendar
                            </span>
                          </div>
                          <select
                            value={form.intakeLabel}
                            onChange={(e) => setForm({ ...form, intakeLabel: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          >
                            {upcomingIntakes.map((intake) => (
                              <option key={intake.label} value={intake.label}>
                                {intake.label} — Commencing {intake.commencementDate} ({intake.status})
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Application deadline: {upcomingIntakes.find((i) => i.label === form.intakeLabel)?.applicationDeadline || 'Rolling Admissions'}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Accommodation Preference</label>
                          <select
                            value={form.accommodation}
                            onChange={(e) => setForm({ ...form, accommodation: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          >
                            <option value="">Select Accommodation Preference</option>
                            <option value="Florence Nightingale Residence (Female Hostel - Shilenda Road Campus)">
                              Florence Nightingale Residence (Female Hostel)
                            </option>
                            <option value="Albert Schweitzer Residence (Male Hostel - Shilenda Road Campus)">
                              Albert Schweitzer Residence (Male Hostel)
                            </option>
                            <option value="Non-Resident / Off-Campus Day Scholar in Manyama">
                              Non-Resident / Off-Campus Day Scholar in Manyama
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Fee Sponsorship</label>
                          <select
                            value={form.sponsor}
                            onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                          >
                            <option value="Self-Sponsored / Family">Self-Sponsored / Family</option>
                            <option value="Government / HELSB Student Loan">Government / HELSB Student Loan</option>
                            <option value="Employer / Corporate Sponsored">Employer / Corporate Sponsored</option>
                            <option value="Church / NGO Bursary Scheme">Church / NGO Bursary Scheme</option>
                          </select>
                        </div>
                      </div>

                      {/* APPLICATION FORM FEE CHECKOUT PANEL */}
                      <div className="rounded-xl border border-[#007B99]/30 bg-gradient-to-br from-sky-50/60 via-white to-slate-50 p-5 space-y-4 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <Receipt className="h-5 w-5 text-[#007B99]" />
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                Application Processing Fee Checkout
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Official statutory admissions evaluation &amp; ECZ verification charge
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-widest text-slate-500 block font-bold">Standard Fee</span>
                            <span className="text-xl font-black text-[#EC008C]">ZMW 150.00</span>
                          </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Select Payment Method:
                          </label>
                          <div className="grid gap-2.5 sm:grid-cols-3">
                            {/* MTN MoMo */}
                            <label className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition text-xs font-semibold ${
                              paymentMethod === 'MTN_MOMO'
                                ? 'border-[#007B99] bg-[#007B99]/10 text-slate-950 ring-1 ring-[#007B99]'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="MTN_MOMO"
                                checked={paymentMethod === 'MTN_MOMO'}
                                onChange={() => setPaymentMethod('MTN_MOMO')}
                                className="h-4 w-4 text-[#007B99]"
                              />
                              <Smartphone className="h-4 w-4 text-amber-500 shrink-0" />
                              <span>MTN Mobile Money</span>
                            </label>

                            {/* Airtel Money */}
                            <label className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition text-xs font-semibold ${
                              paymentMethod === 'AIRTEL_MONEY'
                                ? 'border-[#007B99] bg-[#007B99]/10 text-slate-950 ring-1 ring-[#007B99]'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="AIRTEL_MONEY"
                                checked={paymentMethod === 'AIRTEL_MONEY'}
                                onChange={() => setPaymentMethod('AIRTEL_MONEY')}
                                className="h-4 w-4 text-[#007B99]"
                              />
                              <Smartphone className="h-4 w-4 text-rose-500 shrink-0" />
                              <span>Airtel Money</span>
                            </label>

                            {/* Zamtel Kwacha */}
                            <label className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition text-xs font-semibold ${
                              paymentMethod === 'ZAMTEL_KWACHA'
                                ? 'border-[#007B99] bg-[#007B99]/10 text-slate-950 ring-1 ring-[#007B99]'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="ZAMTEL_KWACHA"
                                checked={paymentMethod === 'ZAMTEL_KWACHA'}
                                onChange={() => setPaymentMethod('ZAMTEL_KWACHA')}
                                className="h-4 w-4 text-[#007B99]"
                              />
                              <Smartphone className="h-4 w-4 text-[#007B99] shrink-0" />
                              <span>Zamtel Kwacha</span>
                            </label>

                            {/* Zanaco Bank Deposit */}
                            <label className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition text-xs font-semibold ${
                              paymentMethod === 'BANK_DEPOSIT'
                                ? 'border-[#007B99] bg-[#007B99]/10 text-slate-950 ring-1 ring-[#007B99]'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="BANK_DEPOSIT"
                                checked={paymentMethod === 'BANK_DEPOSIT'}
                                onChange={() => setPaymentMethod('BANK_DEPOSIT')}
                                className="h-4 w-4 text-[#007B99]"
                              />
                              <Building className="h-4 w-4 text-[#007B99] shrink-0" />
                              <span>Zanaco Bank Deposit</span>
                            </label>

                            {/* Pay at Manyama Cashier */}
                            <label className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition text-xs font-semibold sm:col-span-2 ${
                              paymentMethod === 'PAY_AT_CASHIER'
                                ? 'border-[#007B99] bg-[#007B99]/10 text-slate-950 ring-1 ring-[#007B99]'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="PAY_AT_CASHIER"
                                checked={paymentMethod === 'PAY_AT_CASHIER'}
                                onChange={() => setPaymentMethod('PAY_AT_CASHIER')}
                                className="h-4 w-4 text-[#007B99]"
                              />
                              <Building2 className="h-4 w-4 text-slate-600 shrink-0" />
                              <span>Pay at Manyama Campus Bursar / Cashier Desk (Shilenda Road)</span>
                            </label>
                          </div>
                        </div>

                        {/* Contextual Payment Form Fields */}
                        {(paymentMethod === 'MTN_MOMO' || paymentMethod === 'AIRTEL_MONEY' || paymentMethod === 'ZAMTEL_KWACHA') && (
                          <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {paymentMethod === 'MTN_MOMO' ? 'MTN MoMo Push Prompt' : paymentMethod === 'AIRTEL_MONEY' ? 'Airtel Money STK Prompt' : 'Zamtel Kwacha Mobile Prompt'}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">Immediate Electronic Receipting</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Payer Mobile Number (Prompt will be sent here)
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="tel"
                                    value={paymentPhone || form.phone}
                                    onChange={(e) => setPaymentPhone(e.target.value)}
                                    placeholder="e.g. 0977 123456"
                                    className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Transaction Reference / Receipt ID (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={paymentReference}
                                  onChange={(e) => setPaymentReference(e.target.value)}
                                  placeholder="Auto-generated if left blank"
                                  className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              A prompt for ZMW 150.00 will be initiated upon form submission. You will enter your mobile PIN on your handset to approve.
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'BANK_DEPOSIT' && (
                          <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2 text-xs">
                            <div className="font-bold text-slate-900">Official College Bank Account Details:</div>
                            <div className="grid gap-2 sm:grid-cols-3 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[11px]">
                              <div><span className="text-slate-500 block">Bank:</span> Zanaco Plc</div>
                              <div><span className="text-slate-500 block">Account Name:</span> North Western University College</div>
                              <div><span className="text-slate-500 block">Account Number:</span> 5824910293012</div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bank Deposit Slip Reference Number</label>
                              <input
                                type="text"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="e.g. ZAN-DEP-994821"
                                className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 font-mono"
                              />
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'PAY_AT_CASHIER' && (
                          <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-600 leading-relaxed">
                            <strong className="block font-bold text-slate-900 mb-1">In-Person Cashier Payment at Manyama Campus</strong>
                            You may submit your application now with status <em>Pending Cashier Verification</em>. Please visit the Bursar’s desk at Plot 511/518 Shilenda Road, Manyama, Lumwana, to settle the ZMW 150.00 and receive an official printed receipt.
                          </div>
                        )}
                      </div>

                      {/* APPLICANT PORTAL AUTOMATIC REGISTRATION NOTICE */}
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-950 flex items-start gap-3 shadow-xs">
                        <UserCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-slate-900 mb-0.5">
                            Automatic Applicant &amp; System User Account Registration
                          </strong>
                          Submitting this application automatically provisions your candidate user account in the NWUCHAS CMIS.
                          You do <em>not</em> need to fill out a separate registration form. Your registered email (<strong>{form.email || 'provided contact'}</strong>)
                          and application number grant you instant access to track ECZ verification, communicate with admissions officers, and download your official Provisional Offer Letter.
                        </div>
                      </div>

                      {/* Applicant Pledge */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                        <span className="font-bold text-amber-900 text-xs block">
                          Applicant Declaration &amp; Legal Pledge (Examinations Council of Zambia &amp; Health Regulators)
                        </span>
                        <p className="text-[11px] text-slate-700 leading-relaxed">
                          I hereby declare that all personal particulars, academic grades, and attached certificates submitted in this application are authentic, complete, and true. I understand that submitting fraudulent certificates is a criminal offence and will result in immediate disqualification and regulatory blacklisting.
                        </p>
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={declarationAgreed}
                            onChange={(e) => setDeclarationAgreed(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-0"
                          />
                          <span className="text-slate-900 font-bold text-xs">
                            I confirm and agree to the Applicant Declaration &amp; Code of Conduct.
                          </span>
                        </label>
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setCollapsedSteps((prev) => ({ ...prev, 3: false, 4: true }))}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                        >
                          ← Back to Step 3: Documents
                        </button>

                        <button
                          type="submit"
                          disabled={busy}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#8DC63F] px-8 py-3.5 text-xs font-black text-slate-950 shadow-md shadow-[#8DC63F]/25 hover:bg-[#72a330] disabled:opacity-50 transition cursor-pointer"
                        >
                          {busy ? 'Submitting & Provisioning Account...' : 'Submit Official Application & Pay ZMW 150.00 →'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRACK APPLICATION & LETTERS                                        */}
        {/* ========================================================================= */}
        {activeMainTab === 'track' && (
          <div className="space-y-8">
            {/* 1. CANDIDATE PROFILE CARD (When Prospective Student is Signed In) */}
            {signedInStudent ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    {signedInStudent.metadata?.passportPhotoUrl ? (
                      <img
                        src={signedInStudent.metadata.passportPhotoUrl}
                        alt="Passport Photo"
                        className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-700 text-white font-black text-2xl shadow-sm shrink-0">
                        {signedInStudent.firstName?.[0] || 'A'}{signedInStudent.lastName?.[0] || 'C'}
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-700" /> Prospective Student Profile
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          Primary App: {signedInStudent.applicationNumber}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mt-1">
                        {signedInStudent.firstName} {signedInStudent.middleName || ''} {signedInStudent.lastName}
                      </h2>
                      <p className="text-xs text-slate-600">
                        {signedInStudent.programmeChoice} • {signedInStudent.intakeLabel || 'January 2026 Intake'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveMainTab('apply')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Apply for Another Programme
                    </button>
                    <button
                      type="button"
                      onClick={handleCandidateSignOut}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                    >
                      <LogOut className="h-3.5 w-3.5 text-slate-500" /> Sign Out
                    </button>
                  </div>
                </div>

                {/* Candidate Profile Details Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">NRC / National Identity</span>
                    <p className="font-mono font-bold text-slate-900 mt-1">
                      {signedInStudent.metadata?.nrc || signedInStudent.nrc || '491828/11/1'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Contact Phone &amp; Email</span>
                    <p className="font-bold text-slate-900 mt-1 truncate">{signedInStudent.phone || '0977 123456'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{signedInStudent.email || 'kabaso.mwewa@gmail.com'}</p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Secondary School &amp; Exam #</span>
                    <p className="font-bold text-slate-900 mt-1 truncate">
                      {signedInStudent.metadata?.school || 'Solwezi Technical Secondary School'}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      Exam: {signedInStudent.metadata?.examNumber || '2024-04128-09'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Hostel &amp; Accommodation</span>
                    <p className="font-bold text-slate-900 mt-1 truncate">
                      {signedInStudent.metadata?.accommodation || 'Florence Nightingale Residence'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sponsor: {signedInStudent.metadata?.sponsor || 'Self-Sponsored / Family'}
                    </p>
                  </div>
                </div>

                {/* Multi-application selector if student submitted multiple */}
                {signedInStudent.allApplications && signedInStudent.allApplications.length > 1 && (
                  <div className="border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Your Submitted Applications ({signedInStudent.allApplications.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {signedInStudent.allApplications.map((app: any) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setTrackAppNumber(app.applicationNumber);
                            setTrackNrcOrEmail(signedInStudent.email || signedInStudent.phone || '');
                            handleCandidateSignIn(app.applicationNumber);
                          }}
                          className={`rounded-xl px-3.5 py-2 text-xs font-bold border transition text-left ${
                            trackedApplication?.id === app.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono text-[11px] block">{app.applicationNumber}</span>
                          <span className="text-xs">{app.programmeChoice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 2. SIGN IN & TRACKING PROMPT (When Candidate is not signed in) */
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 mb-2">
                    <LogIn className="h-3.5 w-3.5" /> Prospective Student Access
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Sign In to Access Your Candidate Profile &amp; Application Workflow
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your Application Number (e.g. <span className="font-mono text-emerald-800 font-bold">NWU-APP-2026-058545</span>), or your NRC / registered Email.
                  </p>
                </div>

                {/* Instant Demo Quick-Sign In Buttons */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                  <span className="text-xs font-bold text-emerald-950 block">
                    Quick Sign-In (Click any candidate to test your workflow immediately):
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { name: 'Kabaso Mulenga Mwewa', app: 'NWU-APP-2026-058545', id: 'kabaso.mwewa@gmail.com', prog: 'Diploma Nursing (Doc Check)' },
                      { name: 'Chisomo Sakala', app: 'NWU-APP-2026-00118', id: 'chisomo.sakala@gmail.com', prog: 'BSc Nursing (Submitted)' },
                      { name: 'Mapalo Zimba', app: 'NWU-APP-2026-00117', id: 'mapalo.zimba@gmail.com', prog: 'Diploma Nursing (Waitlist)' },
                    ].map((demo) => (
                      <button
                        key={demo.app}
                        type="button"
                        onClick={() => handleCandidateSignIn(demo.id)}
                        className="rounded-lg bg-white border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition shadow-2xs text-left"
                      >
                        <span className="block font-semibold">{demo.name}</span>
                        <span className="text-[10px] text-emerald-700 font-mono block">{demo.app} • {demo.prog}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (trackAppNumber && trackNrcOrEmail) {
                      handleTrackSubmit(e);
                    } else if (trackNrcOrEmail) {
                      handleCandidateSignIn(trackNrcOrEmail);
                    } else if (trackAppNumber) {
                      handleCandidateSignIn(trackAppNumber);
                    }
                  }}
                  className="grid gap-4 sm:grid-cols-3"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Application Number
                    </label>
                    <input
                      type="text"
                      value={trackAppNumber}
                      onChange={(e) => setTrackAppNumber(e.target.value)}
                      placeholder="NWU-APP-2026-XXXXXX"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      NRC Number, Email or Phone
                    </label>
                    <input
                      type="text"
                      value={trackNrcOrEmail}
                      onChange={(e) => setTrackNrcOrEmail(e.target.value)}
                      placeholder="e.g. 491828/11/1 or email"
                      className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={trackBusy || signInBusy}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#007B99] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#00627a] transition disabled:opacity-50 shadow-sm"
                    >
                      {trackBusy || signInBusy ? 'Signing In...' : 'Sign In & View Application →'}
                    </button>
                  </div>
                </form>

                {trackError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    {trackError}
                  </div>
                )}
              </div>
            )}

            {/* Application Result Details */}
            {trackedApplication && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-8">
                {/* Header Summary */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      {trackedApplication.applicationNumber}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {trackedApplication.firstName} {trackedApplication.lastName}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {trackedApplication.programmeChoice} • {trackedApplication.intakeLabel}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold">
                      Current Admission Stage
                    </span>
                    <span className={`inline-block mt-1 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                      trackedApplication.status === 'ENROLLED'
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : trackedApplication.status === 'ACCEPTED'
                        ? 'bg-teal-700 text-white'
                        : trackedApplication.status === 'OFFERED'
                        ? 'bg-blue-700 text-white animate-pulse'
                        : 'bg-amber-600 text-white'
                    }`}>
                      {trackedApplication.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* 6-Stage Visual Workflow Pipeline */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Statutory Multi-Stage Admission Workflow
                  </span>
                  <div className="grid gap-2 sm:grid-cols-6 pt-2">
                    {[
                      { num: 1, label: 'Submitted & Queued', key: 'SUBMITTED' },
                      { num: 2, label: 'Document & O-Level Check', key: 'DOCUMENT_CHECK' },
                      { num: 3, label: 'Council Eligibility', key: 'ELIGIBILITY_REVIEW' },
                      { num: 4, label: 'Committee Review', key: 'COMMITTEE_REVIEW' },
                      { num: 5, label: 'Provisional Offer', key: 'OFFERED' },
                      { num: 6, label: 'Acceptance & Final Enrolment', key: 'ENROLLED' },
                    ].map((stg) => {
                      const stagesOrder = ['SUBMITTED', 'DOCUMENT_CHECK', 'ELIGIBILITY_REVIEW', 'COMMITTEE_REVIEW', 'OFFERED', 'ACCEPTED', 'ENROLLED'];
                      const currentIdx = stagesOrder.indexOf(trackedApplication.status);
                      const stageIdx = stagesOrder.indexOf(stg.key);
                      const isComplete = currentIdx >= stageIdx;
                      const isCurrent = currentIdx === stageIdx || (stg.key === 'ENROLLED' && trackedApplication.status === 'ACCEPTED');

                      return (
                        <div
                          key={stg.num}
                          className={`rounded-xl p-3 border transition text-center ${
                            isCurrent
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600/30 font-bold'
                              : isComplete
                              ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                              : 'border-slate-200 bg-slate-50 text-slate-400'
                          }`}
                        >
                          <span className="text-[10px] font-bold block">Stage {stg.num}</span>
                          <p className="text-xs font-bold mt-1">{stg.label}</p>
                          <span className="text-[10px] mt-1 inline-block">
                            {isComplete ? '✓ Approved' : isCurrent ? '● Active Review' : 'Pending'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PROVISIONAL OFFER LETTER CARD */}
                {['OFFERED', 'ACCEPTED', 'ENROLLED'].includes(trackedApplication.status) && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-900">
                          <Award className="h-4 w-4" /> Official Provisional Offer Granted
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-2">
                          Provisional Admission Offer Letter Issued
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Approved by the College Admissions Committee. Includes approved semester fee schedule &amp; payment channels.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowOfferModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow-xs"
                        >
                          <FileText className="h-4 w-4" /> View / Print Offer Letter
                        </button>

                        {trackedApplication.status === 'OFFERED' && (
                          <button
                            onClick={() => setShowAcceptanceModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition shadow-xs"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Accept Offer &amp; Pay Deposit →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* OFFER ACCEPTED CONFIRMATION CARD */}
                {trackedApplication.status === 'ACCEPTED' && (
                  <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-6 space-y-2">
                    <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                      <CheckCircle2 className="h-5 w-5 text-teal-700" />
                      Offer Accepted &amp; Required Deposit Payment Lodged
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your offer acceptance and payment confirmation have been successfully recorded in the registry ledger.
                      The application is now with the <strong>Academic Registrar</strong> and <strong>College Principal</strong> for
                      digital workflow countersigning and issuance of your official <strong>Final Acceptance &amp; Matriculation Letter</strong>.
                    </p>
                  </div>
                )}

                {/* FINAL MATRICULATION LETTER CARD */}
                {trackedApplication.status === 'ENROLLED' && (
                  <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                          <CheckCircle2 className="h-4 w-4" /> Official Matriculation Confirmed
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-2">
                          Final Acceptance &amp; Matriculation Letter Ready
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Officially countersigned by Dr. George Silwamba (Academic Registrar) &amp; Prof. Hastings Chileshe (College Principal).
                        </p>
                        <p className="mt-2 text-xs font-mono font-bold text-emerald-800">
                          Matriculation Student Number: {trackedApplication.enrolledLearner?.studentNumber || 'NWU-2026-0042'}
                        </p>
                      </div>

                      <div>
                        <button
                          onClick={() => setShowFinalLetterModal(true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                        >
                          <Printer className="h-4 w-4" /> View &amp; Print Final Acceptance Letter
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status History Audit Trail */}
                {trackedApplication.statusHistory && trackedApplication.statusHistory.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Application Audit Trail &amp; Milestone Notes
                    </span>
                    <div className="space-y-2">
                      {trackedApplication.statusHistory.map((h: any) => (
                        <div key={h.id} className="border-l-2 border-emerald-700 pl-3 py-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{h.toStatus.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(h.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          {h.reason && <p className="text-[11px] text-slate-600 mt-0.5">{h.reason}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Authentic Signature Lime Green Footer Bar Matching nwuc.edu.zm - Static/Sticky Bottom Bar */}
      <footer className="sticky bottom-0 z-40 bg-[#8DC63F] text-slate-950 py-2.5 px-4 text-xs font-bold border-t border-[#7ab332] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
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

      {/* RENDER OFFER LETTER MODAL */}
      {showOfferModal && trackedApplication && (
        <ProvisionalOfferLetterModal
          application={trackedApplication}
          onClose={() => setShowOfferModal(false)}
          onAccept={() => {
            setShowOfferModal(false);
            setShowAcceptanceModal(true);
          }}
        />
      )}

      {/* RENDER CANDIDATE ACCEPTANCE MODAL */}
      {showAcceptanceModal && trackedApplication && (
        <CandidateAcceptanceModal
          application={trackedApplication}
          onClose={() => setShowAcceptanceModal(false)}
          onAccepted={(updated) => {
            setShowAcceptanceModal(false);
            setTrackedApplication(updated);
          }}
        />
      )}

      {/* RENDER FINAL ACCEPTANCE LETTER MODAL */}
      {showFinalLetterModal && trackedApplication && (
        <FinalAcceptanceLetterModal
          application={trackedApplication}
          onClose={() => setShowFinalLetterModal(false)}
        />
      )}

      {/* PROSPECTIVE STUDENT SIGN IN MODAL */}
      {showSignInModal && !signedInStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl text-slate-900">
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute right-5 top-5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-700 text-white shadow-sm shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Candidate Online Portal
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Prospective Student Sign In
                </h3>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              Welcome to North Western University College of Health and Applied Sciences.
              Sign in to view your candidate profile, verify your submitted applications, and track your admission workflow.
            </p>

            {/* Instant Demo Sign-In Buttons */}
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 block">
                Instant Demo Applicant Access:
              </span>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { name: 'Kabaso Mwewa', email: 'kabaso.mwewa@gmail.com', prog: 'Doc Check' },
                  { name: 'Chisomo Sakala', email: 'chisomo.sakala@gmail.com', prog: 'Submitted' },
                  { name: 'Mapalo Zimba', email: 'mapalo.zimba@gmail.com', prog: 'Waitlist' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleCandidateSignIn(demo.email)}
                    className="rounded-lg border border-emerald-300 bg-white p-2 text-left hover:bg-emerald-100 transition shadow-2xs"
                  >
                    <p className="font-bold text-slate-900 text-[11px] truncate">{demo.name}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold">{demo.prog}</p>
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCandidateSignIn();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email, Mobile Phone, NRC or Application Number
                </label>
                <input
                  type="text"
                  required
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="e.g. kabaso.mwewa@gmail.com or 491828/11/1 or NWU-APP-..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none transition shadow-xs"
                />
              </div>

              {signInError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  {signInError}
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={signInBusy}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007B99] py-3 text-xs font-bold text-white hover:bg-[#00627a] transition disabled:opacity-50 shadow-sm"
                >
                  {signInBusy ? 'Signing In...' : 'Sign In to Candidate Profile →'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSignInModal(false);
                    setActiveMainTab('apply');
                  }}
                  className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  First-Time Applicant? Start New Application Instead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
