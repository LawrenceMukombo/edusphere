import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const legacyPathMap: Readonly<Record<string, string>> = {
  '/academics': '/modules/academics',
  '/admissions': '/modules/admissions',
  '/assets': '/modules/assets',
  '/attendance': '/modules/attendance',
  '/boarding': '/modules/operations',
  '/calendar': '/modules/calendar',
  '/documents': '/modules/documents',
  '/finance': '/modules/finance',
  '/payments': '/modules/finance',
  '/gis': '/modules/operations',
  '/hr': '/modules/hr',
  '/messages': '/modules/communications',
  '/parent': '/modules/parent-portal',
  '/students': '/modules/admissions',
  '/teacher': '/modules/academics',
  '/admin': '/modules/administration',
};

/** Public routes accessible without authentication */
const publicPaths = new Set([
  '/',
  '/apply',
  '/login',
  '/offline.html',
]);

function isPublicPath(pathname: string, method?: string): boolean {
  if (publicPaths.has(pathname)) return true;
  if (pathname.startsWith('/api/auth/login')) return true;
  if (pathname.startsWith('/api/auth/logout')) return true;
  if (pathname.startsWith('/api/admissions/track')) return true;
  if (pathname === '/api/admissions' && method === 'POST') return true;
  if (pathname.startsWith('/icons/') || pathname.startsWith('/images/')) return true;
  return false;
}

/** Lightweight Edge-safe JWT payload verification for route gating */
function extractValidSessionPayload(token: string | undefined): { role?: string; userId?: string } | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null; // Expired token
    }
    return parsed;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Legacy Route Normalization
  const legacyTarget = legacyPathMap[pathname];
  if (legacyTarget) {
    const url = request.nextUrl.clone();
    url.pathname = legacyTarget;
    url.search = search;
    return NextResponse.redirect(url);
  }

  // 2. Allow unauthenticated access to public routes
  if (isPublicPath(pathname, request.method)) {
    return NextResponse.next();
  }

  // 3. Extract Session Token from Cookies or Authorization Header
  const sessionCookie =
    request.cookies.get('nwuchas_cmis_session')?.value ||
    request.cookies.get('edusphere_session')?.value;
  
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  const token = sessionCookie || bearerToken;

  const sessionPayload = extractValidSessionPayload(token);

  // 4. Protected API Routes
  if (pathname.startsWith('/api/')) {
    if (!sessionPayload) {
      return NextResponse.json(
        {
          success: false,
          code: 'UNAUTHENTICATED',
          message: 'Access Denied: Authentication required. Please sign in to NWUCHAS CMIS.',
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 5. Protected Page Routes (/modules/*, /portal/*, /admin/*)
  const isProtectedPage =
    pathname.startsWith('/modules') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/settings');

  if (isProtectedPage && !sessionPayload) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?redirect=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

