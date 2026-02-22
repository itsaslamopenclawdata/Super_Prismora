import Stripe from 'stripe';

/**
 * Stripe Server Configuration
 *
 * Initialize Stripe with the secret key from environment variables.
 * This should only be used on the server side (API routes, Server Actions).
 */

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

/**
 * Stripe instance for server-side operations
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

/**
 * Subscription plans configuration
 */
export const subscriptionPlans = {
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    price: 9.99,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Unlimited photo identifications',
      'Advanced AI models',
      'Priority processing',
      'Batch uploads',
      'Export to multiple formats',
      'Priority support',
    ],
    popular: true,
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    price: 99.99,
    currency: 'USD',
    interval: 'month' as const,
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom AI models',
      'API access',
      'Dedicated support',
      'SLA guarantee',
    ],
    popular: false,
  },
} as const;

/**
 * Create a checkout session for subscription
 *
 * @param userId - User ID
 * @param priceId - Stripe price ID
 * @param successUrl - URL to redirect to after successful payment
 * @param cancelUrl - URL to redirect to if user cancels
 * @returns Checkout session URL
 */
export async function createCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a customer portal session
 *
 * @param customerId - Stripe customer ID
 * @param returnUrl - URL to return to after portal session
 * @returns Customer portal URL
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error('Failed to create portal session');
  }
}

/**
 * Get subscription details
 *
 * @param subscriptionId - Stripe subscription ID
 * @returns Subscription object
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

/**
 * Cancel subscription
 *
 * @param subscriptionId - Stripe subscription ID
 * @returns Updated subscription object
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Verify webhook signature
 *
 * @param payload - Raw webhook payload
 * @param signature - Stripe signature header
 * @returns Parsed webhook event
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error('Invalid webhook signature');
  }
}
