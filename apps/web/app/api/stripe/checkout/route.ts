import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Stripe Checkout API Route
 *
 * This endpoint creates a Stripe checkout session for subscription.
 *
 * POST /api/stripe/checkout
 *
 * Request body:
 * - priceId: Stripe price ID for the plan
 *
 * Response:
 * - url: Checkout session URL to redirect user to
 */

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    // Get user's Stripe customer ID or create a new one
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Create checkout session
    const checkoutUrl = await createCheckoutSession({
      userId: user.id,
      priceId,
      successUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings?subscription=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/settings?subscription=canceled`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
