"""
Rate Limiter for AI Gateway
Implements rate limiting using Redis
"""
import redis
import logging
from typing import Optional
from datetime import timedelta

logger = logging.getLogger(__name__)


class RateLimiter:
    """Rate limiter using Redis sliding window"""

    def __init__(
        self,
        redis_host: str = "redis",
        redis_port: int = 6379,
        redis_db: int = 0,
        redis_password: Optional[str] = None,
        requests: int = 100,
        window: int = 60
    ):
        self.requests = requests
        self.window = window

        try:
            self.redis = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password,
                decode_responses=True
            )
            # Test connection
            self.redis.ping()
            logger.info("Rate limiter connected to Redis")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Rate limiting disabled.")
            self.redis = None

    def is_allowed(self, identifier: str) -> tuple[bool, int]:
        """
        Check if request is allowed

        Args:
            identifier: Unique identifier for client (e.g., IP, API key)

        Returns:
            Tuple of (allowed, remaining_requests)
        """
        if not self.redis:
            return True, self.requests

        key = f"rate_limit:{identifier}"

        try:
            pipe = self.redis.pipeline()
            now = int(self.redis.time()[0])
            window_start = now - self.window

            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start)

            # Count current requests
            pipe.zcard(key)

            # Add current request
            pipe.zadd(key, {str(now): now})

            # Set expiration
            pipe.expire(key, self.window)

            results = pipe.execute()
            current_count = results[1]

            remaining = max(0, self.requests - current_count)
            allowed = current_count < self.requests

            return allowed, remaining

        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            return True, self.requests

    def reset(self, identifier: str):
        """Reset rate limit for identifier"""
        if self.redis:
            key = f"rate_limit:{identifier}"
            self.redis.delete(key)
            logger.info(f"Reset rate limit for {identifier}")


# Global rate limiter instance
rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> Optional[RateLimiter]:
    """Get global rate limiter instance"""
    return rate_limiter
