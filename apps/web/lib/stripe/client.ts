'use client';

import { loadStripe, type Stripe } from '@stripe/stripe-js';

/**
 * Stripe Client Configuration
 *
 * Initialize Stripe with the publishable key from environment variables.
 */

let stripePromise: Promise<Stripe | null>;

/**
 * Get or create Stripe instance
 *
 * This function returns a cached Stripe instance to avoid unnecessary initialization.
 *
 * Usage:
 * ```tsx
 * import { getStripe } from '@/lib/stripe/client';
 *
 * const stripe = await getStripe();
 * ```
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}
