/**
 * Rate Limiter Configuration
 *
 * In-memory rate limiter for API routes.
 * For production, consider using Redis or a dedicated rate-limiting service.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory storage for rate limits
 * In production, replace with Redis or similar
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Default rate limit configurations
 */
export const defaultRateLimits: Record<string, RateLimitConfig> = {
  // API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },

  // Auth endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
  },

  // Upload endpoints
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
  },

  // AI identification endpoints
  identification: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 identifications per minute
  },
};

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object indicating if request is allowed and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultRateLimits.api
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const key = identifier;

  // Get existing entry or create new one
  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: entry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': defaultRateLimits.api.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Clean up expired rate limit entries
 * Run this periodically to prevent memory leaks
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(identifier: string) {
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    return {
      count: 0,
      resetTime: Date.now() + defaultRateLimits.api.windowMs,
    };
  }

  return {
    count: entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Create a rate-limited API handler wrapper
 */
export function withRateLimit(
  handler: (req: Request, context: any) => Promise<Response>,
  config: RateLimitConfig = defaultRateLimits.api
) {
  return async (req: Request, context: any) => {
    // Get identifier from IP or user ID
    const identifier = req.headers.get('x-forwarded-for') ||
                      req.headers.get('x-real-ip') ||
                      'unknown';

    // Check rate limit
    const result = checkRateLimit(identifier, config);

    // Add rate limit headers to response
    const headers = getRateLimitHeaders(result);

    // Return 429 if rate limited
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Call original handler
    const response = await handler(req, context);

    // Add rate limit headers to response
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}
