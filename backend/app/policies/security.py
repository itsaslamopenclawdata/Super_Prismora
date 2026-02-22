"""
Security Policy Enforcement
Enforces security policies across all API endpoints.
"""

import logging
from typing import Optional, Dict, List, Any, Callable
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import re
import hashlib
import json
from functools import wraps


logger = logging.getLogger(__name__)


class PolicyType(Enum):
    """Types of security policies."""
    AUTHENTICATION = "authentication"
    AUTHORIZATION = "authorization"
    RATE_LIMIT = "rate_limit"
    DATA_VALIDATION = "data_validation"
    INPUT_SANITIZATION = "input_sanitization"
    ENCRYPTION = "encryption"
    AUDIT = "audit"
    CORS = "cors"
    CSP = "content_security_policy"


class PolicyAction(Enum):
    """Actions to take when policy is violated."""
    ALLOW = "allow"
    BLOCK = "block"
    WARN = "warn"
    LOG = "log"
    REQUIRE_MFA = "require_mfa"


class SecurityLevel(Enum):
    """Security levels for policy enforcement."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class PolicyResult:
    """Result of policy evaluation."""
    policy_name: str
    passed: bool
    action: PolicyAction
    reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class SecurityContext:
    """Context for security policy evaluation."""
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_path: Optional[str] = None
    request_method: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    timestamp: Optional[datetime] = None
    authentication_method: Optional[str] = None
    roles: List[str] = None
    permissions: List[str] = None


class SecurityPolicy:
    """Base class for security policies."""

    def __init__(self, name: str, policy_type: PolicyType, enabled: bool = True):
        """
        Initialize security policy.

        Args:
            name: Policy name
            policy_type: Type of policy
            enabled: Whether policy is enabled
        """
        self.name = name
        self.policy_type = policy_type
        self.enabled = enabled

    def evaluate(self, context: SecurityContext) -> PolicyResult:
        """
        Evaluate policy against context.

        Args:
            context: Security context

        Returns:
            PolicyResult
        """
        raise NotImplementedError


class AuthenticationPolicy(SecurityPolicy):
    """Enforce authentication requirements."""

    def __init__(
        self,
        require_auth: bool = True,
        allowed_methods: Optional[List[str]] = None,
        exempt_paths: Optional[List[str]] = None
    ):
        """
        Initialize authentication policy.

        Args:
            require_auth: Whether authentication is required
            allowed_methods: Allowed authentication methods
            exempt_paths: Paths exempt from authentication
        """
        super().__init__("AuthenticationPolicy", PolicyType.AUTHENTICATION)
        self.require_auth = require_auth
        self.allowed_methods = allowed_methods or ['jwt', 'session', 'oauth']
        self.exempt_paths = exempt_paths or ['/health', '/public/']

    def evaluate(self, context: SecurityContext) -> PolicyResult:
        """Evaluate authentication."""
        # Check exempt paths
        if context.request_path:
            for exempt in self.exempt_paths:
                if context.request_path.startswith(exempt):
                    return PolicyResult(self.name, True, PolicyAction.ALLOW)

        # Check authentication
        if self.require_auth:
            if not context.user_id:
                return PolicyResult(
                    self.name,
                    False,
                    PolicyAction.BLOCK,
                    "Authentication required"
                )

            if context.authentication_method not in self.allowed_methods:
                return PolicyResult(
                    self.name,
                    False,
                    PolicyAction.BLOCK,
                    f"Authentication method not allowed: {context.authentication_method}"
                )

        return PolicyResult(self.name, True, PolicyAction.ALLOW)


class AuthorizationPolicy(SecurityPolicy):
    """Enforce role and permission-based authorization."""

    def __init__(
        self,
        required_roles: Optional[List[str]] = None,
        required_permissions: Optional[List[str]] = None,
        role_hierarchies: Optional[Dict[str, List[str]]] = None
    ):
        """
        Initialize authorization policy.

        Args:
            required_roles: Required roles
            required_permissions: Required permissions
            role_hierarchies: Role inheritance
        """
        super().__init__("AuthorizationPolicy", PolicyType.AUTHORIZATION)
        self.required_roles = required_roles or []
        self.required_permissions = required_permissions or []
        self.role_hierarchies = role_hierarchies or {
            'admin': ['user', 'moderator'],
            'moderator': ['user']
        }

    def _get_effective_roles(self, roles: List[str]) -> set:
        """Get all effective roles including inherited ones."""
        effective = set(roles)
        for role in roles:
            inherited = self.role_hierarchies.get(role, [])
            effective.update(inherited)
            for inherited_role in inherited:
                effective.update(self.role_hierarchies.get(inherited_role, []))
        return effective

    def evaluate(self, context: SecurityContext) -> PolicyResult:
        """Evaluate authorization."""
        if not context.user_id:
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                "User not authenticated"
            )

        # Check roles
        if self.required_roles:
            effective_roles = self._get_effective_roles(context.roles or [])
            if not any(role in effective_roles for role in self.required_roles):
                return PolicyResult(
                    self.name,
                    False,
                    PolicyAction.BLOCK,
                    f"Insufficient roles. Required: {self.required_roles}, Have: {context.roles}"
                )

        # Check permissions
        if self.required_permissions:
            user_permissions = set(context.permissions or [])
            missing = set(self.required_permissions) - user_permissions
            if missing:
                return PolicyResult(
                    self.name,
                    False,
                    PolicyAction.BLOCK,
                    f"Missing permissions: {list(missing)}"
                )

        return PolicyResult(self.name, True, PolicyAction.ALLOW)


class RateLimitPolicy(SecurityPolicy):
    """Enforce rate limiting policies."""

    def __init__(
        self,
        requests_per_minute: int = 60,
        requests_per_hour: int = 1000,
        requests_per_day: int = 10000
    ):
        """
        Initialize rate limit policy.

        Args:
            requests_per_minute: Requests per minute limit
            requests_per_hour: Requests per hour limit
            requests_per_day: Requests per day limit
        """
        super().__init__("RateLimitPolicy", PolicyType.RATE_LIMIT)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.requests_per_day = requests_per_day
        self._request_log: Dict[str, List[datetime]] = {}

    def _get_request_count(self, identifier: str, window: timedelta) -> int:
        """Count requests in time window."""
        if identifier not in self._request_log:
            return 0

        now = datetime.utcnow()
        cutoff = now - window
        return sum(1 for ts in self._request_log[identifier] if ts > cutoff)

    def evaluate(self, context: SecurityContext) -> PolicyResult:
        """Evaluate rate limit."""
        identifier = context.user_id or context.ip_address
        if not identifier:
            return PolicyResult(self.name, True, PolicyAction.ALLOW)

        # Check per-minute limit
        if self._get_request_count(identifier, timedelta(minutes=1)) >= self.requests_per_minute:
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                f"Rate limit exceeded: {self.requests_per_minute} requests per minute"
            )

        # Check per-hour limit
        if self._get_request_count(identifier, timedelta(hours=1)) >= self.requests_per_hour:
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                f"Rate limit exceeded: {self.requests_per_hour} requests per hour"
            )

        # Check per-day limit
        if self._get_request_count(identifier, timedelta(days=1)) >= self.requests_per_day:
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                f"Rate limit exceeded: {self.requests_per_day} requests per day"
            )

        # Log this request
        if identifier not in self._request_log:
            self._request_log[identifier] = []
        self._request_log[identifier].append(datetime.utcnow())

        # Clean old logs periodically
        self._cleanup_old_logs()

        return PolicyResult(self.name, True, PolicyAction.ALLOW)

    def _cleanup_old_logs(self):
        """Clean old request logs."""
        cutoff = datetime.utcnow() - timedelta(days=1)
        for identifier in self._request_log:
            self._request_log[identifier] = [
                ts for ts in self._request_log[identifier] if ts > cutoff
            ]


class DataValidationPolicy(SecurityPolicy):
    """Validate input data."""

    def __init__(
        self,
        max_string_length: int = 10000,
        allowed_file_types: Optional[List[str]] = None,
        max_file_size_mb: int = 10
    ):
        """
        Initialize data validation policy.

        Args:
            max_string_length: Maximum string length
            allowed_file_types: Allowed file MIME types
            max_file_size_mb: Maximum file size in MB
        """
        super().__init__("DataValidationPolicy", PolicyType.DATA_VALIDATION)
        self.max_string_length = max_string_length
        self.allowed_file_types = allowed_file_types or [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/json', 'text/plain'
        ]
        self.max_file_size_mb = max_file_size_mb

    def evaluate(self, context: SecurityContext) -> PolicyResult:
        """Evaluate data validation."""
        # This would be called with actual data in implementation
        return PolicyResult(self.name, True, PolicyAction.ALLOW)


class InputSanitizationPolicy(SecurityPolicy):
    """Sanitize input to prevent injection attacks."""

    def __init__(self):
        """Initialize input sanitization policy."""
        super().__init__("InputSanitizationPolicy", PolicyType.INPUT_SANITIZATION)

    def _check_sql_injection(self, input_str: str) -> bool:
        """Check for SQL injection patterns."""
        patterns = [
            r"(\bOR\b|\bAND\b)\s+1\s*=\s*1",
            r"(\bOR\b|\bAND\b)\s*1\s*=\s*1",
            r"';\s*DROP\s+TABLE",
            r"UNION\s+SELECT",
            r"-\s*-",
            r"/\*.*\*/",
            r"<script[^>]*>.*</script>"
        ]
        for pattern in patterns:
            if re.search(pattern, input_str, re.IGNORECASE):
                return True
        return False

    def _check_xss(self, input_str: str) -> bool:
        """Check for XSS patterns."""
        patterns = [
            r"<script[^>]*>",
            r"javascript:",
            r"on\w+\s*=",
            r"fromCharCode",
            r"eval\s*\("
        ]
        for pattern in patterns:
            if re.search(pattern, input_str, re.IGNORECASE):
                return True
        return False

    def _check_path_traversal(self, input_str: str) -> bool:
        """Check for path traversal."""
        patterns = [
            r"\.\./",
            r"\.\.\\",
            r"%2e%2e",
            r"etc/passwd",
            r"windows/system32"
        ]
        for pattern in patterns:
            if re.search(pattern, input_str, re.IGNORECASE):
                return True
        return False

    def sanitize(self, input_str: str) -> str:
        """
        Sanitize input string.

        Args:
            input_str: Input string

        Returns:
            Sanitized string
        """
        # Remove or escape dangerous characters
        sanitized = re.sub(r'[<>"\'()]', '', input_str)
        return sanitized

    def evaluate(self, context: SecurityContext, input_data: str) -> PolicyResult:
        """Evaluate input sanitization."""
        if self._check_sql_injection(input_data):
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                "SQL injection detected"
            )

        if self._check_xss(input_data):
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                "XSS attack detected"
            )

        if self._check_path_traversal(input_data):
            return PolicyResult(
                self.name,
                False,
                PolicyAction.BLOCK,
                "Path traversal detected"
            )

        return PolicyResult(self.name, True, PolicyAction.ALLOW)


class SecurityPolicyEnforcer:
    """
    Main security policy enforcer.

    Features:
    - Evaluate multiple policies
    - Aggregate results
    - Take appropriate action
    - Audit logging
    """

    def __init__(self, security_level: SecurityLevel = SecurityLevel.MEDIUM):
        """
        Initialize policy enforcer.

        Args:
            security_level: Default security level
        """
        self.security_level = security_level
        self.policies: List[SecurityPolicy] = []
        self._audit_log: List[Dict[str, Any]] = []

    def add_policy(self, policy: SecurityPolicy):
        """
        Add a security policy.

        Args:
            policy: Security policy to add
        """
        self.policies.append(policy)
        logger.info(f"Added security policy: {policy.name}")

    def remove_policy(self, policy_name: str):
        """
        Remove a security policy.

        Args:
            policy_name: Name of policy to remove
        """
        self.policies = [p for p in self.policies if p.name != policy_name]
        logger.info(f"Removed security policy: {policy_name}")

    def evaluate_policies(self, context: SecurityContext) -> List[PolicyResult]:
        """
        Evaluate all enabled policies.

        Args:
            context: Security context

        Returns:
            List of PolicyResults
        """
        results = []

        for policy in self.policies:
            if not policy.enabled:
                continue

            try:
                result = policy.evaluate(context)
                results.append(result)

                # Log audit trail
                self._log_audit(policy, context, result)

            except Exception as e:
                logger.error(f"Error evaluating policy {policy.name}: {e}")
                results.append(PolicyResult(
                    policy.name,
                    False,
                    PolicyAction.LOG,
                    f"Policy evaluation error: {e}"
                ))

        return results

    def _log_audit(
        self,
        policy: SecurityPolicy,
        context: SecurityContext,
        result: PolicyResult
    ):
        """Log audit entry."""
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "policy_name": policy.name,
            "policy_type": policy.policy_type.value,
            "user_id": context.user_id,
            "ip_address": context.ip_address,
            "request_path": context.request_path,
            "passed": result.passed,
            "action": result.action.value,
            "reason": result.reason
        }
        self._audit_log.append(entry)

    def enforce(self, context: SecurityContext) -> tuple[bool, List[PolicyResult]]:
        """
        Enforce policies and determine final action.

        Args:
            context: Security context

        Returns:
            Tuple of (allowed, results)
        """
        results = self.evaluate_policies(context)

        # Determine final action
        # If any policy blocks, block the request
        blocked = any(
            r.action == PolicyAction.BLOCK and not r.passed
            for r in results
        )

        if blocked:
            logger.warning(f"Request blocked: {context.request_path} - {context.ip_address}")
            return False, results

        return True, results

    def get_audit_log(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get audit log.

        Args:
            user_id: Optional user filter

        Returns:
            Audit log entries
        """
        if user_id:
            return [e for e in self._audit_log if e['user_id'] == user_id]
        return self._audit_log

    def generate_security_headers(self) -> Dict[str, str]:
        """
        Generate security headers.

        Returns:
            Dictionary of security headers
        """
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:;"
            ),
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
        }


def create_default_enforcer(security_level: SecurityLevel = SecurityLevel.MEDIUM) -> SecurityPolicyEnforcer:
    """
    Create a default policy enforcer with standard policies.

    Args:
        security_level: Security level

    Returns:
        Configured SecurityPolicyEnforcer
    """
    enforcer = SecurityPolicyEnforcer(security_level)

    # Add default policies
    enforcer.add_policy(AuthenticationPolicy(require_auth=False))
    enforcer.add_policy(AuthorizationPolicy())

    # Configure rate limits based on security level
    if security_level == SecurityLevel.LOW:
        enforcer.add_policy(RateLimitPolicy(100, 5000, 50000))
    elif security_level == SecurityLevel.MEDIUM:
        enforcer.add_policy(RateLimitPolicy(60, 1000, 10000))
    elif security_level == SecurityLevel.HIGH:
        enforcer.add_policy(RateLimitPolicy(30, 500, 5000))
    elif security_level == SecurityLevel.CRITICAL:
        enforcer.add_policy(RateLimitPolicy(10, 100, 1000))

    enforcer.add_policy(DataValidationPolicy())
    enforcer.add_policy(InputSanitizationPolicy())

    return enforcer


# FastAPI middleware integration
def security_middleware(enforcer: SecurityPolicyEnforcer):
    """
    Create FastAPI middleware for security enforcement.

    Args:
        enforcer: Security policy enforcer

    Returns:
        Middleware function
    """
    async def middleware(request, call_next):
        """Security middleware for FastAPI."""
        # Extract context
        context = SecurityContext(
            ip_address=request.client.host if hasattr(request, 'client') else None,
            user_agent=request.headers.get('user-agent'),
            request_path=request.url.path,
            request_method=request.method,
            headers=dict(request.headers),
            timestamp=datetime.utcnow()
        )

        # Extract user info from auth headers (implementation dependent)
        auth_header = request.headers.get('authorization', '')
        if auth_header.startswith('Bearer '):
            # Extract JWT claims (implementation needed)
            # context.user_id = extract_user_id_from_jwt(auth_header)
            # context.roles = extract_roles_from_jwt(auth_header)
            pass

        # Enforce policies
        allowed, results = enforcer.enforce(context)

        if not allowed:
            from fastapi import HTTPException
            blocked_reasons = [r.reason for r in results if r.reason]
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Security policy violation",
                    "reasons": blocked_reasons
                }
            )

        # Process request
        response = await call_next(request)

        # Add security headers
        headers = enforcer.generate_security_headers()
        for header, value in headers.items():
            response.headers[header] = value

        return response

    return middleware
