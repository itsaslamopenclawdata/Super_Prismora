import { createClient } from '@/lib/supabase/server';
import { checkUsageLimit, getUsageStats, getUsageLimits } from '@/lib/usage/usageTracker';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Usage Check API Route
 *
 * This endpoint checks if a user can make a request based on their usage limits.
 *
 * GET /api/usage/check
 *
 * Response:
 * - canProceed: boolean - Whether the user can proceed
 * - remainingToday: number - Remaining requests for today
 * - remainingMonth: number - Remaining requests for this month
 * - limits: object - Usage limits for the user's tier
 * - stats: object - Current usage statistics
 */

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const tier = profile.subscription_tier || 'free';

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.id, tier);

    // Get usage stats
    const stats = await getUsageStats(user.id);

    // Get limits for tier
    const limits = getUsageLimits(tier);

    return NextResponse.json({
      canProceed: usageCheck.canProceed,
      remainingToday: usageCheck.remainingToday,
      remainingMonth: usageCheck.remainingMonth,
      message: usageCheck.message,
      tier,
      limits: {
        requestsPerDay: limits.requestsPerDay,
        requestsPerMonth: limits.requestsPerMonth,
      },
      stats: {
        todayUsage: stats.todayUsage,
        monthUsage: stats.monthUsage,
      },
    });
  } catch (error) {
    console.error('Error checking usage:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}
