import { cookies } from 'next/headers';
import { verifyToken } from '@/server/auth';
import { hasPermission } from '@/server/authorization';
import { ContentCardService } from '@/server/services/content.service';
import { LandingPageContent } from '@/components/content/LandingPageContent';

/**
 * North Western University College of Health and Applied Sciences (NWUCHAS)
 * Statutorily accredited healthcare tertiary programmes:
 * - Diploma in Registered Nursing
 * - Diploma in Clinical Medicine
 * Campuses: Manyama, Lumwana, Zambia
 */

export const metadata = {
  title: 'North Western University College of Health and Applied Sciences (NWUCHAS)',
  description:
    'Official Portal of North Western University College of Health and Applied Sciences (NWUCHAS) in Manyama, Lumwana, Zambia. NMCZ & HPCZ accredited training in Registered Nursing, Clinical Medicine, and Public Health.',
};

export const dynamic = 'force-dynamic';

function checkUserCanEdit(session: any): boolean {
  if (!session) return false;
  if (session.isSuperAdmin) return true;
  const role = session.role;
  if (
    role === 'PLATFORM_SUPER_ADMIN' ||
    role === 'SCHOOL_PROPRIETOR' ||
    role === 'INSTITUTION_ADMIN' ||
    role === 'IT_ADMIN' ||
    role === 'REGISTRAR'
  ) {
    return true;
  }
  return hasPermission(session, 'content:manage');
}

export default async function PublicCollegeLandingPage() {
  const cookieStore = cookies();
  const token =
    cookieStore.get('nwuchas_cmis_session')?.value ||
    cookieStore.get('edusphere_session')?.value ||
    cookieStore.get('token')?.value;

  const session = token ? verifyToken(token) : null;
  const userCanEdit = checkUserCanEdit(session);

  const { cardDict } = await ContentCardService.getCardsForPage(
    session?.organisationId || undefined,
    'landing'
  );

  const userSummary = session
    ? {
        name: `${session.firstName} ${session.lastName}`,
        email: session.email,
        role: session.role,
        isSuperAdmin: !!session.isSuperAdmin,
      }
    : null;

  return (
    <LandingPageContent
      initialCards={cardDict}
      userCanEdit={userCanEdit}
      user={userSummary}
    />
  );
}
