"""
Bot Detection Middleware
Identifies and blocks automated bot traffic using multiple heuristics.
"""

import re
import time
from typing import Optional, Dict, Set, List
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass
class RequestFingerprint:
    """Fingerprint of a request for bot detection."""
    ip: str
    user_agent: str
    accept_language: str
    accept_encoding: str
    request_pattern: str
    timestamp: float


class BotDetector:
    """
    Detects bots using multiple heuristics:
    1. Known bot user agents (allowlisted)
    2. Suspicious patterns in user agents
    3. Request rate analysis
    4. Header analysis
    5. Path traversal detection
    """

    # Known legitimate bots (allowlist)
    KNOWN_BOTS = {
        'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
        'yandexbot', 'sogou', 'exabot', 'facebot', 'facebookexternalhit',
        'linkedinbot', 'twitterbot', 'whatsapp', 'telegrambot', 'applebot'
    }

    # Suspicious patterns in user agents
    SUSPICIOUS_PATTERNS = [
        r'bot', r'crawl', r'spider', r'scrape', r'harvest',
        r'wget', r'curl', r'python-requests', r'java/', r'go-http-client',
        r'^$', r'^[0-9]', r'bot/$', r'bot$', r'\\n', r'<script'
    ]

    # Request rate thresholds
    RATE_LIMITS = {
        'strict': {'requests': 10, 'window': 1},      # 10 req/second
        'moderate': {'requests': 60, 'window': 60},   # 60 req/minute
        'lenient': {'requests': 1000, 'window': 3600}  # 1000 req/hour
    }

    def __init__(self, mode: str = 'moderate'):
        """
        Initialize bot detector.

        Args:
            mode: Detection strictness ('strict', 'moderate', 'lenient')
        """
        self.mode = mode
        self.rate_limit = self.RATE_LIMITS[mode]
        self.request_history: Dict[str, List[float]] = defaultdict(list)
        self.blocked_ips: Set[str] = set()
        self.blocked_until: Dict[str, float] = {}

    def check_user_agent(self, user_agent: str) -> Optional[str]:
        """
        Check if user agent is a known bot or looks suspicious.

        Args:
            user_agent: User agent string

        Returns:
            'allow' if known bot, 'block' if suspicious, None otherwise
        """
        ua_lower = user_agent.lower() if user_agent else ''

        # Check for known legitimate bots
        for known_bot in self.KNOWN_BOTS:
            if known_bot in ua_lower:
                return 'allow'

        # Check for suspicious patterns
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, ua_lower, re.IGNORECASE):
                return 'block'

        return None

    def check_request_rate(self, ip: str) -> bool:
        """
        Check if IP is exceeding rate limits.

        Args:
            ip: Client IP address

        Returns:
            True if rate limit exceeded, False otherwise
        """
        now = time.time()
        window_start = now - self.rate_limit['window']

        # Clean old requests
        self.request_history[ip] = [
            ts for ts in self.request_history[ip]
            if ts > window_start
        ]

        # Check if blocked
        if ip in self.blocked_until:
            if now < self.blocked_until[ip]:
                return True
            else:
                del self.blocked_until[ip]

        # Check rate limit
        if len(self.request_history[ip]) >= self.rate_limit['requests']:
            # Block for 1 hour
            self.blocked_until[ip] = now + 3600
            return True

        # Record this request
        self.request_history[ip].append(now)
        return False

    def check_headers(self, headers: Dict[str, str]) -> Dict[str, bool]:
        """
        Analyze request headers for bot indicators.

        Args:
            headers: Request headers dictionary

        Returns:
            Dictionary with header check results
        """
        results = {}

        # Check for missing common headers
        results['missing_accept'] = 'accept' not in headers
        results['missing_accept_language'] = 'accept-language' not in headers
        results['missing_user_agent'] = 'user-agent' not in headers

        # Check for suspicious header combinations
        if 'accept' in headers:
            accept = headers['accept'].lower()
            results['suspicious_accept'] = (
                'text/html' not in accept and
                'application/json' not in accept
            )

        # Check referer
        if 'referer' not in headers:
            results['missing_referer'] = True

        return results

    def check_path_traversal(self, path: str) -> bool:
        """
        Detect path traversal attempts.

        Args:
            path: Request path

        Returns:
            True if path traversal detected
        """
        suspicious_patterns = [
            '../', '..\\', '%2e%2e', 'etc/passwd', 'windows/system32',
            'web.config', '.env', '.git'
        ]

        path_lower = path.lower()
        for pattern in suspicious_patterns:
            if pattern in path_lower:
                return True

        return False

    def is_bot(self, fingerprint: RequestFingerprint, headers: Dict[str, str]) -> Dict[str, any]:
        """
        Comprehensive bot detection check.

        Args:
            fingerprint: Request fingerprint
            headers: Request headers

        Returns:
            Dictionary with detection results
        """
        results = {
            'is_bot': False,
            'reason': None,
            'confidence': 0.0,
            'action': 'allow'
        }

        # Check user agent
        ua_result = self.check_user_agent(fingerprint.user_agent)
        if ua_result == 'block':
            results['is_bot'] = True
            results['reason'] = 'suspicious_user_agent'
            results['confidence'] = 0.8
            results['action'] = 'block'
            return results
        elif ua_result == 'allow':
            results['is_bot'] = True
            results['reason'] = 'known_bot'
            results['confidence'] = 1.0
            results['action'] = 'allow'
            return results

        # Check request rate
        if self.check_request_rate(fingerprint.ip):
            results['is_bot'] = True
            results['reason'] = 'rate_limit_exceeded'
            results['confidence'] = 0.9
            results['action'] = 'block'
            return results

        # Check headers
        header_results = self.check_headers(headers)
        suspicious_count = sum(1 for v in header_results.values() if v)

        if suspicious_count >= 3:
            results['is_bot'] = True
            results['reason'] = 'suspicious_headers'
            results['confidence'] = 0.6 + (suspicious_count * 0.1)
            results['action'] = 'rate_limit'
            return results

        # Check path traversal
        if self.check_path_traversal(fingerprint.request_pattern):
            results['is_bot'] = True
            results['reason'] = 'path_traversal_attempt'
            results['confidence'] = 1.0
            results['action'] = 'block'
            return results

        return results


# FastAPI/WSGI middleware integration functions
def create_bot_middleware(bot_detector: BotDetector):
    """
    Create middleware for web frameworks.

    Args:
        bot_detector: BotDetector instance

    Returns:
        Middleware function for framework integration
    """
    async def middleware(request, call_next):
        """Middleware for FastAPI/async frameworks."""
        # Extract request info
        ip = request.client.host if hasattr(request, 'client') else request.headers.get('x-forwarded-for', 'unknown')
        user_agent = request.headers.get('user-agent', '')
        accept_language = request.headers.get('accept-language', '')
        accept_encoding = request.headers.get('accept-encoding', '')
        path = str(request.url.path)

        fingerprint = RequestFingerprint(
            ip=ip,
            user_agent=user_agent,
            accept_language=accept_language,
            accept_encoding=accept_encoding,
            request_pattern=path,
            timestamp=time.time()
        )

        # Check for bot
        result = bot_detector.is_bot(fingerprint, dict(request.headers))

        if result['action'] == 'block':
            from fastapi import HTTPException
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        elif result['action'] == 'rate_limit':
            from fastapi import HTTPException
            raise HTTPException(status_code=429, detail="Too many requests")

        # Process request
        response = await call_next(request)

        # Add security headers
        response.headers['X-Bot-Check'] = 'passed'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'

        return response

    return middleware


def get_bot_detector() -> BotDetector:
    """
    Get or create a BotDetector instance.

    Returns:
        Shared BotDetector instance
    """
    # In production, use a singleton pattern or dependency injection
    return BotDetector(mode='moderate')
