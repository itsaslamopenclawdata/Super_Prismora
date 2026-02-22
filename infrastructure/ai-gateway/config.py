"""
Configuration for AI Gateway
"""
from pydantic_settings import BaseSettings
from typing import Dict, Optional


class Settings(BaseSettings):
    """Application settings"""

    # Service settings
    SERVICE_NAME: str = "photoidentifier-ai-gateway"
    LOG_LEVEL: str = "info"
    PORT: int = 8000

    # Backend services
    TENSORFLOW_SERVING_URL: str = "http://tensorflow-serving:8501"
    ONNX_RUNTIME_URL: str = "http://onnx-runtime:8000"

    # Redis for caching
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Caching
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 300  # seconds

    # Model routing
    MODEL_ROUTING_STRATEGY: str = "round_robin"  # round_robin, least_loaded, random

    # Timeout settings
    REQUEST_TIMEOUT: int = 30  # seconds

    # Monitoring
    METRICS_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
