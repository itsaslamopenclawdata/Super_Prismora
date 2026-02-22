import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Stripe Webhook Handler
 *
 * This endpoint handles Stripe webhook events for subscription management.
 *
 * POST /api/stripe/webhook
 *
 * Events handled:
 * - checkout.session.completed: Subscription created
 * - customer.subscription.updated: Subscription updated
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_succeeded: Payment succeeded
 * - invoice.payment_failed: Payment failed
 */

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    // Verify webhook signature
    const event = await verifyWebhookSignature(body, signature);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session, supabase);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription, supabase);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice, supabase);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Get subscription details
  const subscription = await supabase
    .from('stripe_subscriptions')
    .select('price_id')
    .eq('subscription_id', subscriptionId)
    .single();

  // Determine subscription tier based on price
  const priceId = session.display_items?.[0]?.price?.id;
  const tier = priceId?.includes('enterprise') ? 'enterprise' : 'pro';

  // Update user profile
  await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      subscription_tier: tier,
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;

  // Get user profile by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for customer:', customerId);
    return;
  }

  // Update subscription status
  await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string;

  // Get user profile by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for customer:', customerId);
    return;
  }

  // Downgrade to free tier
  await supabase
    .from('profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
}

/**
 * Handle invoice.payment_succeeded event
 */
async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string;

  // Get user profile by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for customer:', customerId);
    return;
  }

  // Reset usage count for new billing period
  await supabase
    .from('profiles')
    .update({
      usage_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const customerId = invoice.customer as string;

  // Get user profile by customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) {
    console.error('No profile found for customer:', customerId);
    return;
  }

  // Update subscription status to past_due
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
}
