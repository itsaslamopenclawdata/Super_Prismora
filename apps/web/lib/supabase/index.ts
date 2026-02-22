/**
 * Supabase Client Exports
 *
 * This module exports all Supabase client configurations for different contexts:
 *
 * - `client.ts` - Client-side Supabase client for use in 'use client' components
 * - `server.ts` - Server-side Supabase client for Server Components
 * - `middleware.ts` - Middleware Supabase client for route protection
 *
 * Usage:
 * - Import from `@/lib/supabase/client` in Client Components
 * - Import from `@/lib/supabase/server` in Server Components
 * - Import from `@/lib/supabase/middleware` in middleware.ts
 */

export { createClient as createBrowserClient } from './client';
export { createClient as createServerClient } from './server';
export { createClient as createMiddlewareClient } from './middleware';
