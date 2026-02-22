"""
Local Secrets Manager (Fallback)
Manages secrets locally when AWS Secrets Manager is unavailable.
WARNING: Not secure for production - only for development/testing.
"""

import json
import os
import logging
from typing import Optional, Dict
from datetime import datetime
from pathlib import Path


logger = logging.getLogger(__name__)


class LocalSecretsManager:
    """
    Local file-based secrets manager for development.

    WARNING: Do not use in production! Secrets are stored in plain text.
    """

    def __init__(self, secrets_file: Optional[str] = None):
        """
        Initialize local secrets manager.

        Args:
            secrets_file: Path to secrets file (default: .local_secrets.json)
        """
        if secrets_file:
            self.secrets_file = Path(secrets_file)
        else:
            # Try to find .local_secrets.json in current or parent directories
            self.secrets_file = Path('.local_secrets.json')
            if not self.secrets_file.exists():
                self.secrets_file = Path.home() / '.local_secrets.json'

        self._secrets: Dict[str, str] = {}
        self._load_secrets()

    def _load_secrets(self):
        """Load secrets from file."""
        try:
            if self.secrets_file.exists():
                with open(self.secrets_file, 'r') as f:
                    self._secrets = json.load(f)
                logger.info(f"Loaded {len(self._secrets)} secrets from {self.secrets_file}")
        except Exception as e:
            logger.error(f"Error loading secrets: {e}")
            self._secrets = {}

    def _save_secrets(self):
        """Save secrets to file."""
        try:
            # Create directory if it doesn't exist
            self.secrets_file.parent.mkdir(parents=True, exist_ok=True)

            with open(self.secrets_file, 'w') as f:
                json.dump(self._secrets, f, indent=2)

            # Set restrictive permissions
            os.chmod(self.secrets_file, 0o600)

            logger.info(f"Saved {len(self._secrets)} secrets to {self.secrets_file}")
        except Exception as e:
            logger.error(f"Error saving secrets: {e}")

    def get_secret(self, secret_name: str) -> Optional[str]:
        """
        Get a secret value.

        Args:
            secret_name: Name of the secret

        Returns:
            Secret value or None
        """
        return self._secrets.get(secret_name)

    def set_secret(self, secret_name: str, secret_value: str):
        """
        Set a secret value.

        Args:
            secret_name: Name of the secret
            secret_value: Secret value
        """
        self._secrets[secret_name] = secret_value
        self._save_secrets()

    def delete_secret(self, secret_name: str) -> bool:
        """
        Delete a secret.

        Args:
            secret_name: Name of the secret

        Returns:
            True if deleted
        """
        if secret_name in self._secrets:
            del self._secrets[secret_name]
            self._save_secrets()
            return True
        return False

    def list_secrets(self) -> list:
        """
        List all secret names.

        Returns:
            List of secret names
        """
        return list(self._secrets.keys())

    def export_to_env(self, prefix: str = "SECRET_"):
        """
        Export secrets to environment variables.

        Args:
            prefix: Prefix for environment variable names
        """
        for name, value in self._secrets.items():
            env_name = f"{prefix}{name.upper()}"
            os.environ[env_name] = value
            logger.debug(f"Exported secret to env: {env_name}")
