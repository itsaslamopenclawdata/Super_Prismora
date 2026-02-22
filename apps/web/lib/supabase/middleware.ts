import { createMiddlewareClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '@photoidentifier/types';

/**
 * Supabase client for use in Next.js Middleware
 *
 * This client is used in middleware.ts to:
 * - Protect routes based on auth state
 * - Refresh auth tokens automatically
 * - Handle redirects for authenticated/unauthenticated users
 *
 * Usage in middleware.ts:
 * ```ts
 * import { createClient } from '@/lib/supabase/middleware';
 * import { NextResponse } from 'next/server';
 * import type { NextRequest } from 'next/server';
 *
 * export async function middleware(req: NextRequest) {
 *   const res = NextResponse.next();
 *   const supabase = createClient(req, res);
 *   const { data: { session } } = await supabase.auth.getSession();
 *
 *   // Protect routes
 *   if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
 *     return NextResponse.redirect(new URL('/login', req.url));
 *   }
 *
 *   return res;
 * }
 * ```
 */
export function createClient(req: NextRequest, res: NextResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createMiddlewareClient<Database>({
    req,
    res,
    options: {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    },
  });
}
