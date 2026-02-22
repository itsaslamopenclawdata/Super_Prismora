import { createServerComponentClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@photoidentifier/types';

/**
 * Supabase client for use in Server Components
 *
 * This client is created with the Supabase server client which handles:
 * - Server-side data fetching
 * - Server actions
 * - Server components
 *
 * The server client uses cookies to persist auth state between server and client.
 *
 * Usage:
 * ```tsx
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function MyServerComponent() {
 *   const supabase = createClient();
 *   const { data } = await supabase.from('users').select('*');
 *   // ...
 * }
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createServerComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
    cookies,
  });
}
