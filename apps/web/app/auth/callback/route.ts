import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth Callback Route
 *
 * This route handles:
 * - OAuth provider redirects (GitHub, Google)
 * - Email confirmation redirects
 * - Password reset redirects
 * - Magic link authentication
 *
 * Supabase redirects users here after completing authentication flows.
 */

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  // If no code, redirect to login
  if (!code) {
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', 'No authorization code provided');
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createClient();

  // Exchange the code for a session
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('Error exchanging code for session:', exchangeError);
    const redirectUrl = new URL('/login', origin);
    redirectUrl.searchParams.set('error', exchangeError.message);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if this is a new user (email confirmation)
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Check if user profile exists, create if not
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'free',
        subscription_status: 'active',
        usage_count: 0,
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Continue anyway, user is authenticated
      }
    }
  }

  // Redirect to the next URL or dashboard
  return NextResponse.redirect(`${origin}${next}`);
}
