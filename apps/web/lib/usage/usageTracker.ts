import { createClient } from '@/lib/supabase/server';

/**
 * Usage Tracking Configuration
 */

export interface UsageLimits {
  free: {
    requestsPerDay: number;
    requestsPerMonth: number;
  };
  pro: {
    requestsPerDay: number;
    requestsPerMonth: number;
  };
  enterprise: {
    requestsPerDay: number;
    requestsPerMonth: number;
  };
}

/**
 * Default usage limits per subscription tier
 */
export const defaultUsageLimits: UsageLimits = {
  free: {
    requestsPerDay: 100,
    requestsPerMonth: 1000,
  },
  pro: {
    requestsPerDay: 1000,
    requestsPerMonth: 30000,
  },
  enterprise: {
    requestsPerDay: -1, // Unlimited
    requestsPerMonth: -1, // Unlimited
  },
};

/**
 * Get usage limits for a subscription tier
 */
export function getUsageLimits(tier: string): UsageLimits['free' | 'pro' | 'enterprise'] {
  const lowerTier = tier.toLowerCase() as 'free' | 'pro' | 'enterprise';
  return defaultUsageLimits[lowerTier] || defaultUsageLimits.free;
}

/**
 * Check if a user can make a request based on their usage limits
 */
export async function checkUsageLimit(userId: string, tier: string): Promise<{
  canProceed: boolean;
  remainingToday: number;
  remainingMonth: number;
  message?: string;
}> {
  const supabase = createClient();
  const limits = getUsageLimits(tier);

  // Unlimited usage for enterprise
  if (limits.requestsPerDay === -1 && limits.requestsPerMonth === -1) {
    return {
      canProceed: true,
      remainingToday: -1,
      remainingMonth: -1,
    };
  }

  // Get user's current usage
  const { data: usage, error } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get today's usage
  const { count: todayCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  // Get month's usage
  const { count: monthCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const todayUsage = todayCount || 0;
  const monthUsage = monthCount || 0;

  const remainingToday = limits.requestsPerDay - todayUsage;
  const remainingMonth = limits.requestsPerMonth - monthUsage;

  let canProceed = true;
  let message: string | undefined;

  if (remainingToday <= 0) {
    canProceed = false;
    message = `Daily limit exceeded. You've used ${todayUsage} of ${limits.requestsPerDay} requests today.`;
  } else if (remainingMonth <= 0) {
    canProceed = false;
    message = `Monthly limit exceeded. You've used ${monthUsage} of ${limits.requestsPerMonth} requests this month.`;
  }

  return {
    canProceed,
    remainingToday,
    remainingMonth,
    message,
  };
}

/**
 * Log a usage event
 */
export async function logUsage(userId: string, action: string, metadata?: Record<string, any>) {
  const supabase = createClient();

  try {
    // Log the usage event
    await supabase.from('usage_logs').insert({
      user_id: userId,
      action,
      metadata,
      created_at: new Date().toISOString(),
    });

    // Update user profile usage count
    const { error: updateError } = await supabase.rpc('increment_usage_count', {
      user_id: userId,
    });

    if (updateError) {
      console.error('Error incrementing usage count:', updateError);
    }
  } catch (error) {
    console.error('Error logging usage:', error);
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUsageStats(userId: string) {
  const supabase = createClient();

  // Get today's usage
  const { count: todayCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  // Get month's usage
  const { count: monthCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  // Get recent usage (last 7 days)
  const { data: recentUsage } = await supabase
    .from('usage_logs')
    .select('action, created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

  return {
    todayUsage: todayCount || 0,
    monthUsage: monthCount || 0,
    recentUsage: recentUsage || [],
  };
}

/**
 * Reset usage for a user (admin function)
 */
export async function resetUsage(userId: string) {
  const supabase = createClient();

  try {
    // Delete all usage logs
    await supabase.from('usage_logs').delete().eq('user_id', userId);

    // Reset usage count in profile
    await supabase
      .from('profiles')
      .update({ usage_count: 0 })
      .eq('id', userId);

    return { success: true };
  } catch (error) {
    console.error('Error resetting usage:', error);
    return { success: false, error: 'Failed to reset usage' };
  }
}
