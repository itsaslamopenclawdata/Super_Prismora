"""
AWS Secrets Manager Integration
Handles secure storage and retrieval of secrets using AWS Secrets Manager.
"""

import json
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import hashlib
from functools import lru_cache

try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    BOTO3_AVAILABLE = True
except ImportError:
    BOTO3_AVAILABLE = False

from .local_secrets import LocalSecretsManager


logger = logging.getLogger(__name__)


@dataclass
class Secret:
    """Represents a secret with metadata."""
    name: str
    value: str
    version: str
    created_date: datetime
    last_accessed: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AWSSecretsManager:
    """
    AWS Secrets Manager client with caching and fallback.

    Features:
    - Secret caching with TTL
    - Automatic rotation support
    - Fallback to local storage
    - Audit logging
    - Secret versioning
    """

    def __init__(
        self,
        region_name: str = 'us-east-1',
        cache_ttl_seconds: int = 300,
        enable_fallback: bool = True,
        audit_logging: bool = True
    ):
        """
        Initialize AWS Secrets Manager.

        Args:
            region_name: AWS region
            cache_ttl_seconds: Cache time-to-live in seconds
            enable_fallback: Enable fallback to local storage
            audit_logging: Enable audit logging
        """
        self.region_name = region_name
        self.cache_ttl = cache_ttl_seconds
        self.enable_fallback = enable_fallback
        self.audit_logging = audit_logging
        self._cache: Dict[str, tuple] = {}
        self._client = None
        self._local_manager = LocalSecretsManager() if enable_fallback else None

        if BOTO3_AVAILABLE:
            try:
                self._client = boto3.client(
                    'secretsmanager',
                    region_name=region_name
                )
                logger.info("AWS Secrets Manager client initialized")
            except (NoCredentialsError, Exception) as e:
                logger.warning(f"Failed to initialize AWS Secrets Manager: {e}")
                if not enable_fallback:
                    logger.error("Fallback disabled - secrets management unavailable")
        else:
            logger.warning("boto3 not available - using local secrets only")
            self._client = None

    def _log_access(self, secret_name: str, action: str):
        """Log secret access for audit purposes."""
        if self.audit_logging:
            logger.info(f"Secret access: {action} - {secret_name}")

    def _get_from_cache(self, secret_name: str) -> Optional[Secret]:
        """Get secret from cache if not expired."""
        if secret_name in self._cache:
            secret, timestamp = self._cache[secret_name]
            if datetime.utcnow() - timestamp < timedelta(seconds=self.cache_ttl):
                return secret
            else:
                del self._cache[secret_name]
        return None

    def _set_cache(self, secret: Secret):
        """Store secret in cache."""
        self._cache[secret.name] = (secret, datetime.utcnow())

    def get_secret(self, secret_name: str, version_stage: Optional[str] = None) -> Optional[Secret]:
        """
        Retrieve a secret from AWS Secrets Manager.

        Args:
            secret_name: Name or ARN of the secret
            version_stage: Version stage (e.g., 'AWSCURRENT', 'AWSPREVIOUS')

        Returns:
            Secret object or None if not found
        """
        # Check cache first
        cached = self._get_from_cache(secret_name)
        if cached:
            self._log_access(secret_name, "cache_hit")
            return cached

        # Try AWS Secrets Manager
        if self._client:
            try:
                params = {'SecretId': secret_name}
                if version_stage:
                    params['VersionStage'] = version_stage

                response = self._client.get_secret_value(**params)

                secret_value = response.get('SecretString')
                if not secret_value and 'SecretBinary' in response:
                    import base64
                    secret_value = base64.b64decode(response['SecretBinary']).decode('utf-8')

                secret = Secret(
                    name=secret_name,
                    value=secret_value,
                    version=response.get('VersionId', 'unknown'),
                    created_date=response.get('CreatedDate', datetime.utcnow()),
                    last_accessed=datetime.utcnow()
                )

                self._set_cache(secret)
                self._log_access(secret_name, "retrieved_aws")
                return secret

            except ClientError as e:
                if e.response['Error']['Code'] == 'ResourceNotFoundException':
                    logger.warning(f"Secret not found: {secret_name}")
                else:
                    logger.error(f"Error retrieving secret: {e}")
            except Exception as e:
                logger.error(f"Unexpected error retrieving secret: {e}")

        # Fallback to local storage
        if self.enable_fallback and self._local_manager:
            local_secret = self._local_manager.get_secret(secret_name)
            if local_secret:
                self._log_access(secret_name, "retrieved_local")
                return local_secret

        return None

    def get_secret_dict(self, secret_name: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Retrieve a secret and parse as JSON dictionary.

        Args:
            secret_name: Name or ARN of the secret
            **kwargs: Additional arguments for get_secret

        Returns:
            Dictionary or None
        """
        secret = self.get_secret(secret_name, **kwargs)
        if secret:
            try:
                return json.loads(secret.value)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse secret as JSON: {e}")
        return None

    def create_secret(
        self,
        secret_name: str,
        secret_value: str,
        description: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Create a new secret.

        Args:
            secret_name: Name for the secret
            secret_value: Secret value
            description: Optional description
            tags: Optional tags

        Returns:
            True if successful
        """
        if self._client:
            try:
                params = {
                    'Name': secret_name,
                    'SecretString': secret_value
                }
                if description:
                    params['Description'] = description
                if tags:
                    params['Tags'] = [{'Key': k, 'Value': v} for k, v in tags.items()]

                self._client.create_secret(**params)
                self._log_access(secret_name, "created")
                return True

            except ClientError as e:
                logger.error(f"Error creating secret: {e}")
                return False

        # Fallback to local storage
        if self.enable_fallback and self._local_manager:
            self._local_manager.set_secret(secret_name, secret_value)
            self._log_access(secret_name, "created_local")
            return True

        return False

    def update_secret(
        self,
        secret_name: str,
        secret_value: str,
        description: Optional[str] = None
    ) -> bool:
        """
        Update an existing secret.

        Args:
            secret_name: Name of the secret
            secret_value: New secret value
            description: Optional new description

        Returns:
            True if successful
        """
        if self._client:
            try:
                params = {'SecretId': secret_name, 'SecretString': secret_value}
                if description:
                    params['Description'] = description

                self._client.update_secret(**params)

                # Invalidate cache
                if secret_name in self._cache:
                    del self._cache[secret_name]

                self._log_access(secret_name, "updated")
                return True

            except ClientError as e:
                logger.error(f"Error updating secret: {e}")
                return False

        # Fallback to local storage
        if self.enable_fallback and self._local_manager:
            self._local_manager.set_secret(secret_name, secret_value)
            if secret_name in self._cache:
                del self._cache[secret_name]
            self._log_access(secret_name, "updated_local")
            return True

        return False

    def delete_secret(self, secret_name: str, force_delete: bool = False) -> bool:
        """
        Delete a secret.

        Args:
            secret_name: Name of the secret
            force_delete: Delete without recovery window

        Returns:
            True if successful
        """
        if self._client:
            try:
                recovery_window = 0 if force_delete else 7
                self._client.delete_secret(
                    SecretId=secret_name,
                    RecoveryWindowInDays=recovery_window,
                    ForceDeleteWithoutRecovery=force_delete
                )

                # Invalidate cache
                if secret_name in self._cache:
                    del self._cache[secret_name]

                self._log_access(secret_name, "deleted")
                return True

            except ClientError as e:
                logger.error(f"Error deleting secret: {e}")
                return False

        # Fallback to local storage
        if self.enable_fallback and self._local_manager:
            self._local_manager.delete_secret(secret_name)
            if secret_name in self._cache:
                del self._cache[secret_name]
            self._log_access(secret_name, "deleted_local")
            return True

        return False

    def rotate_secret(self, secret_name: str) -> bool:
        """
        Trigger immediate secret rotation.

        Args:
            secret_name: Name of the secret

        Returns:
            True if successful
        """
        if self._client:
            try:
                self._client.rotate_secret(SecretId=secret_name)

                # Invalidate cache
                if secret_name in self._cache:
                    del self._cache[secret_name]

                self._log_access(secret_name, "rotated")
                return True

            except ClientError as e:
                logger.error(f"Error rotating secret: {e}")
                return False

        logger.warning("Secret rotation not available with local storage")
        return False

    def list_secrets(self, filter_prefix: Optional[str] = None) -> list:
        """
        List all secrets.

        Args:
            filter_prefix: Optional prefix filter

        Returns:
            List of secret names
        """
        if self._client:
            try:
                response = self._client.list_secrets()
                secrets = [
                    s['Name'] for s in response['SecretList']
                    if filter_prefix is None or s['Name'].startswith(filter_prefix)
                ]
                return secrets

            except ClientError as e:
                logger.error(f"Error listing secrets: {e}")
                return []

        # Fallback to local storage
        if self.enable_fallback and self._local_manager:
            return self._local_manager.list_secrets()

        return []

    def clear_cache(self):
        """Clear all cached secrets."""
        self._cache.clear()
        logger.info("Secret cache cleared")

    @staticmethod
    def hash_secret(secret_value: str) -> str:
        """
        Generate hash of secret value for comparison.

        Args:
            secret_value: Secret value to hash

        Returns:
            SHA256 hash
        """
        return hashlib.sha256(secret_value.encode()).hexdigest()


@lru_cache(maxsize=1)
def get_secrets_manager(
    region_name: str = 'us-east-1',
    cache_ttl_seconds: int = 300
) -> AWSSecretsManager:
    """
    Get or create a singleton SecretsManager instance.

    Args:
        region_name: AWS region
        cache_ttl_seconds: Cache TTL

    Returns:
        Shared AWSSecretsManager instance
    """
    return AWSSecretsManager(
        region_name=region_name,
        cache_ttl_seconds=cache_ttl_seconds
    )


# Environment variable resolver using Secrets Manager
class SecretEnvironment:
    """
    Automatically resolve environment variables from AWS Secrets Manager.
    Format: AWS_SECRET:secret_name or AWS_SECRET_JSON:secret_name.key
    """

    PREFIX = "AWS_SECRET:"

    def __init__(self, secrets_manager: Optional[AWSSecretsManager] = None):
        """
        Initialize secret environment resolver.

        Args:
            secrets_manager: Optional secrets manager instance
        """
        self.secrets_manager = secrets_manager or get_secrets_manager()

    def resolve(self, env_value: str) -> str:
        """
        Resolve an environment variable value.

        Args:
            env_value: Environment variable value

        Returns:
            Resolved value
        """
        if not env_value.startswith(self.PREFIX):
            return env_value

        secret_path = env_value[len(self.PREFIX):]

        # Check if it's a JSON path (secret_name.key)
        if '.' in secret_path:
            secret_name, key = secret_path.split('.', 1)
            secret_dict = self.secrets_manager.get_secret_dict(secret_name)
            if secret_dict and key in secret_dict:
                return str(secret_dict[key])
        else:
            secret = self.secrets_manager.get_secret(secret_path)
            if secret:
                return secret.value

        logger.warning(f"Could not resolve secret: {secret_path}")
        return env_value
