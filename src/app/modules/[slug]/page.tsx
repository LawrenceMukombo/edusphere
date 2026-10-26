import Link from 'next/link';
import { redirect } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';
import { findNwuchasModule } from '@/lib/nwuchasModules';
import { prisma } from '@/server/db';

function ConsoleSkeleton() {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-pulse">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="h-6 w-48 rounded bg-slate-200 mb-2" />
          <div className="h-4 w-72 rounded bg-slate-100" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="h-20 rounded-xl bg-slate-100" />
        <div className="h-20 rounded-xl bg-slate-100" />
      </div>
      <div className="h-64 rounded-xl border border-slate-100 bg-slate-50" />
    </div>
  );
}

const AdmissionsConsole = nextDynamic(() => import('@/components/modules/AdmissionsConsole').then((m) => m.AdmissionsConsole), { loading: ConsoleSkeleton });
const ClinicalConsole = nextDynamic(() => import('@/components/modules/ClinicalConsole').then((m) => m.ClinicalConsole), { loading: ConsoleSkeleton });
const PayrollConsole = nextDynamic(() => import('@/components/modules/PayrollConsole').then((m) => m.PayrollConsole), { loading: ConsoleSkeleton });
const PaymentsConsole = nextDynamic(() => import('@/components/modules/PaymentsConsole').then((m) => m.PaymentsConsole), { loading: ConsoleSkeleton });
const OperationsConsole = nextDynamic(() => import('@/components/modules/OperationsConsole').then((m) => m.OperationsConsole), { loading: ConsoleSkeleton });
const AcademicsConsole = nextDynamic(() => import('@/components/modules/AcademicsConsole').then((m) => m.AcademicsConsole), { loading: ConsoleSkeleton });
const AttendanceConsole = nextDynamic(() => import('@/components/modules/AttendanceConsole').then((m) => m.AttendanceConsole), { loading: ConsoleSkeleton });
const FinanceConsole = nextDynamic(() => import('@/components/modules/FinanceConsole').then((m) => m.FinanceConsole), { loading: ConsoleSkeleton });
const AssetsConsole = nextDynamic(() => import('@/components/modules/AssetsConsole').then((m) => m.AssetsConsole), { loading: ConsoleSkeleton });
const CommunicationsConsole = nextDynamic(() => import('@/components/modules/CommunicationsConsole').then((m) => m.CommunicationsConsole), { loading: ConsoleSkeleton });
const DocumentsConsole = nextDynamic(() => import('@/components/modules/DocumentsConsole').then((m) => m.DocumentsConsole), { loading: ConsoleSkeleton });
const CalendarConsole = nextDynamic(() => import('@/components/modules/CalendarConsole').then((m) => m.CalendarConsole), { loading: ConsoleSkeleton });
const StudentPortalConsole = nextDynamic(() => import('@/components/modules/StudentPortalConsole').then((m) => m.StudentPortalConsole), { loading: ConsoleSkeleton });
const AdministrationConsole = nextDynamic(() => import('@/components/modules/AdministrationConsole').then((m) => m.AdministrationConsole), { loading: ConsoleSkeleton });
const IntegrationStatusConsole = nextDynamic(() => import('@/components/modules/IntegrationStatusConsole').then((m) => m.IntegrationStatusConsole), { loading: ConsoleSkeleton });

export const dynamic = 'force-dynamic';

export default async function ModuleWorkspace({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { tab?: string };
}) {
  if (params.slug === 'payments') {
    redirect('/modules/finance?tab=intents');
  }

  const module = findNwuchasModule(params.slug);
  if (!module) {
    return (
      <main className="p-8 text-slate-100">
        Module not found.{' '}
        <Link className="text-cyan-300" href="/">
          Return to NWUCHAS-CMIS
        </Link>
      </main>
    );
  }

  // Module-specific initial data
  const p = prisma as any;
  const applications =
    module.slug === 'admissions' && p.admissionApplication
      ? await p.admissionApplication.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            enrolledLearner: { select: { studentNumber: true } },
            statusHistory: { orderBy: { createdAt: 'desc' }, take: 3 },
          },
        })
      : [];

  const clinicalSites =
    module.slug === 'clinical-learning' && p.clinicalSite
      ? await p.clinicalSite.findMany({
          include: { supervisors: true },
        })
      : [];

  const clinicalPlacements =
    module.slug === 'clinical-learning' && p.clinicalPlacement
      ? await p.clinicalPlacement.findMany({
          include: { learner: true, clinicalSite: true },
          orderBy: { startDate: 'desc' },
        })
      : [];

  const payrollRuns =
    module.slug === 'hr' && p.payrollRun
      ? await p.payrollRun.findMany({
          include: {
            lines: {
              include: {
                staff: {
                  include: {
                    contract: true,
                  },
                },
                paySlip: true,
              },
            },
          },
          orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
        })
      : [];

  const hrStaff =
    module.slug === 'hr' && p.staff
      ? await p.staff.findMany({
          include: {
            contract: true,
          },
          orderBy: { staffNumber: 'asc' },
        })
      : [];

  const paymentsData =
    (module.slug === 'payments' || module.slug === 'finance')
      ? {
          intents: p.paymentIntent
            ? await p.paymentIntent.findMany({
                include: {
                  learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
                  invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, balance: true } },
                  transactions: { orderBy: { createdAt: 'desc' }, take: 2 },
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
              })
            : [],
          batches: p.settlementBatch
            ? await p.settlementBatch.findMany({
                include: {
                  settlementLines: true,
                },
                orderBy: { settlementDate: 'desc' },
                take: 20,
              })
            : [],
          webhooks: p.webhookInboxEvent
            ? await p.webhookInboxEvent.findMany({
                orderBy: { createdAt: 'desc' },
                take: 30,
              })
            : [],
          learners: p.learner
            ? await p.learner.findMany({
                select: { id: true, studentNumber: true, firstName: true, lastName: true },
                orderBy: { studentNumber: 'asc' },
                take: 60,
              })
            : [],
          invoices: p.invoice
            ? await p.invoice.findMany({
                where: { balance: { gt: 0 } },
                select: { id: true, invoiceNumber: true, totalAmount: true, balance: true, learnerId: true },
                orderBy: { issuedDate: 'desc' },
                take: 60,
              })
            : [],
        }
      : null;

  const operationsData =
    module.slug === 'operations'
      ? {
          hostels: p.hostelBuilding
            ? await p.hostelBuilding.findMany({
                include: {
                  rooms: {
                    include: {
                      beds: {
                        include: {
                          allocations: {
                            include: {
                              learner: {
                                select: { id: true, studentNumber: true, firstName: true, lastName: true },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              })
            : [],
          routes: p.transportRoute
            ? await p.transportRoute.findMany({
                include: {
                  TransportSubscription: {
                    include: {
                      learner: {
                        select: { id: true, studentNumber: true, firstName: true, lastName: true },
                      },
                    },
                  },
                },
              })
            : [],
          books: p.libraryBook
            ? await p.libraryBook.findMany({
                include: {
                  loans: {
                    include: {
                      learner: {
                        select: { id: true, studentNumber: true, firstName: true, lastName: true },
                      },
                    },
                  },
                },
              })
            : [],
          entitlements: p.studentEntitlement
            ? await p.studentEntitlement.findMany({
                include: {
                  learner: {
                    select: { id: true, studentNumber: true, firstName: true, lastName: true },
                  },
                },
                orderBy: { updatedAt: 'desc' },
                take: 30,
              })
            : [],
          learners: p.learner
            ? await p.learner.findMany({
                select: { id: true, studentNumber: true, firstName: true, lastName: true },
                orderBy: { studentNumber: 'asc' },
                take: 50,
              })
            : [],
        }
      : null;

  const academicData =
    module.slug === 'academics' && p.programme
      ? {
          programmes: await p.programme.findMany({
            include: { department: true, courses: true, cohorts: true },
            orderBy: { code: 'asc' },
          }),
          modules: await p.courseModule.findMany({
            include: { programme: true, osceStations: true },
            orderBy: [{ semesterNumber: 'asc' }, { code: 'asc' }],
          }),
          cohorts: await p.cohort.findMany({
            include: { programme: true },
            orderBy: [{ currentYear: 'asc' }, { name: 'asc' }],
          }),
          registrations: await p.courseRegistration.findMany({
            include: {
              learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
              courseModule: { include: { programme: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 60,
          }),
          osceStations: await p.osceStation.findMany({
            include: {
              courseModule: true,
              results: {
                include: {
                  learner: { select: { id: true, studentNumber: true, firstName: true, lastName: true } },
                },
              },
            },
            orderBy: { stationNumber: 'asc' },
          }),
          learners: await p.learner.findMany({
            select: { id: true, studentNumber: true, firstName: true, lastName: true },
            orderBy: { studentNumber: 'asc' },
            take: 40,
          }),
        }
      : null;

  const attendanceData =
    module.slug === 'attendance' && p.attendanceSession
      ? {
          sessions: await p.attendanceSession.findMany({
            include: {
              class: true,
              records: {
                include: {
                  learner: {
                    select: { id: true, studentNumber: true, firstName: true, lastName: true },
                  },
                },
              },
            },
            orderBy: { date: 'desc' },
            take: 20,
          }),
          learners: await p.learner.findMany({
            select: { id: true, studentNumber: true, firstName: true, lastName: true, currentClassId: true },
            orderBy: { studentNumber: 'asc' },
          }),
        }
      : null;

  const financeData =
    (module.slug === 'finance' || module.slug === 'payments') && p.invoice
      ? {
          invoices: await p.invoice.findMany({
            include: {
              lines: true,
              allocations: true,
              learner: true,
              term: true,
            },
            orderBy: { issuedDate: 'desc' },
            take: 50,
          }),
          ledgers: await p.ledgerEntry.findMany({
            orderBy: { postedAt: 'desc' },
            take: 50,
          }),
          learners: await p.learner.findMany({
            select: { id: true, studentNumber: true, firstName: true, lastName: true },
            orderBy: { studentNumber: 'asc' },
          }),
        }
      : null;

  const workspaceRecords =
    ['assets', 'communications', 'documents', 'calendar', 'parent-portal', 'administration'].includes(module.slug) && p.moduleWorkspaceRecord
      ? await p.moduleWorkspaceRecord.findMany({
          where: { moduleSlug: module.slug },
          orderBy: { updatedAt: 'desc' },
        })
      : [];

  const noticesList =
    module.slug === 'communications' && p.notice
      ? await p.notice.findMany({
          orderBy: { publishedAt: 'desc' },
          take: 50,
        })
      : [];

  const portalLearners =
    module.slug === 'parent-portal' && p.learner
      ? await p.learner.findMany({
          include: {
            invoices: true,
            indexingRecord: true,
            attendanceRecords: true,
            clinicalLogbookEntries: true,
          },
          orderBy: { studentNumber: 'asc' },
        })
      : [];

  const adminStaffUsers =
    module.slug === 'administration' && p.staff
      ? await p.staff.findMany({
          include: {
            campus: true,
            user: true,
            contract: true,
          },
          orderBy: { staffNumber: 'asc' },
        })
      : [];

  return (
    <main className="px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">{module.category}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">{module.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{module.description}</p>
        </header>

        {module.slug === 'admissions' && <AdmissionsConsole initial={applications} />}
        {module.slug === 'academics' && (
          <AcademicsConsole
            initialProgrammes={academicData?.programmes || []}
            initialModules={academicData?.modules || []}
            initialCohorts={academicData?.cohorts || []}
            initialRegistrations={academicData?.registrations || []}
            initialOsceStations={academicData?.osceStations || []}
            learners={academicData?.learners || []}
          />
        )}
        {module.slug === 'attendance' && (
          <AttendanceConsole
            initialSessions={attendanceData?.sessions || []}
            initialLearners={attendanceData?.learners || []}
          />
        )}
        {module.slug === 'clinical-learning' && (
          <ClinicalConsole
            initialSites={JSON.parse(JSON.stringify(clinicalSites || []))}
            initialPlacements={JSON.parse(JSON.stringify(clinicalPlacements || []))}
          />
        )}
        {module.slug === 'finance' && (
          <FinanceConsole
            initialInvoices={JSON.parse(JSON.stringify(financeData?.invoices || paymentsData?.invoices || []))}
            initialLedgers={JSON.parse(JSON.stringify(financeData?.ledgers || []))}
            learners={JSON.parse(JSON.stringify(financeData?.learners || paymentsData?.learners || []))}
            initialIntents={JSON.parse(JSON.stringify(paymentsData?.intents || []))}
            initialBatches={JSON.parse(JSON.stringify(paymentsData?.batches || []))}
            initialWebhooks={JSON.parse(JSON.stringify(paymentsData?.webhooks || []))}
            defaultTab={searchParams?.tab || 'invoices'}
          />
        )}
        {module.slug === 'hr' && (
          <PayrollConsole
            initialRuns={JSON.parse(JSON.stringify(payrollRuns))}
            initialStaff={JSON.parse(JSON.stringify(hrStaff))}
          />
        )}
        {module.slug === 'operations' && (
          <OperationsConsole
            initialHostels={JSON.parse(JSON.stringify(operationsData?.hostels || []))}
            initialRoutes={JSON.parse(JSON.stringify(operationsData?.routes || []))}
            initialBooks={JSON.parse(JSON.stringify(operationsData?.books || []))}
            initialEntitlements={JSON.parse(JSON.stringify(operationsData?.entitlements || []))}
            learners={JSON.parse(JSON.stringify(operationsData?.learners || []))}
          />
        )}
        {module.slug === 'assets' && (
          <AssetsConsole initialRecords={JSON.parse(JSON.stringify(workspaceRecords))} />
        )}
        {module.slug === 'communications' && (
          <CommunicationsConsole
            initialNotices={JSON.parse(JSON.stringify(noticesList))}
            initialRecords={JSON.parse(JSON.stringify(workspaceRecords))}
          />
        )}
        {module.slug === 'documents' && (
          <DocumentsConsole initialRecords={JSON.parse(JSON.stringify(workspaceRecords))} />
        )}
        {module.slug === 'calendar' && (
          <CalendarConsole initialRecords={JSON.parse(JSON.stringify(workspaceRecords))} />
        )}
        {module.slug === 'parent-portal' && (
          <StudentPortalConsole
            initialLearners={JSON.parse(JSON.stringify(portalLearners))}
            initialRecords={JSON.parse(JSON.stringify(workspaceRecords))}
          />
        )}
        {module.slug === 'administration' && (
          <AdministrationConsole
            initialStaff={JSON.parse(JSON.stringify(adminStaffUsers))}
            initialRecords={JSON.parse(JSON.stringify(workspaceRecords))}
          />
        )}
        {module.slug === 'integration-status' && <IntegrationStatusConsole />}
      </section>
    </main>
  );
}
