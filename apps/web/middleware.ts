import { createClient } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware Configuration
 *
 * This middleware handles authentication and authorization for protected routes.
 * It uses Supabase auth to verify user sessions and redirect appropriately.
 *
 * Protected Routes:
 * - /dashboard/* - Requires authentication
 * - /settings/* - Requires authentication
 * - /profile/* - Requires authentication
 *
 * Public Routes:
 * - /login - Redirects authenticated users to dashboard
 * - /register - Redirects authenticated users to dashboard
 * - /forgot-password - Public route
 * - /reset-password - Public route
 */

/**
 * List of paths that require authentication
 */
const protectedPaths = ['/dashboard', '/settings', '/profile'];

/**
 * List of paths that should redirect authenticated users to dashboard
 */
const authPaths = ['/login', '/register'];

/**
 * Main middleware function
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createClient(req, res);

  // Get the session from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Check if the path is an auth page (login/register)
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

/**
 * Configure middleware matcher
 *
 * Only run middleware on specific paths to avoid unnecessary overhead.
 * Exclude static files, API routes, and other Next.js internals.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)|api).*)',
  ],
};
