"""
Model Router for AI Gateway
Routes requests to appropriate model backends
"""
import httpx
import logging
from typing import Dict, Any, Optional
from enum import Enum
import random
import time
from prometheus_client import Counter, Histogram

logger = logging.getLogger(__name__)

# Prometheus metrics
request_count = Counter('ai_gateway_requests_total', 'Total requests', ['backend', 'status'])
request_duration = Histogram('ai_gateway_request_duration_seconds', 'Request duration', ['backend'])


class BackendType(Enum):
    """Available backend types"""
    TENSORFLOW = "tensorflow"
    ONNX = "onnx"
    FALLBACK = "fallback"


class ModelRouter:
    """Routes requests to appropriate model backend"""

    def __init__(self, tensorflow_url: str, onnx_url: str):
        self.backends = {
            BackendType.TENSORFLOW: tensorflow_url,
            BackendType.ONNX: onnx_url
        }
        self.backend_stats: Dict[str, Dict[str, Any]] = {
            BackendType.TENSORFLOW.value: {
                "requests": 0,
                "errors": 0,
                "last_used": 0
            },
            BackendType.ONNX.value: {
                "requests": 0,
                "errors": 0,
                "last_used": 0
            }
        }
        self._http_client: Optional[httpx.AsyncClient] = None

    @property
    def http_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client"""
        if self._http_client is None:
            self._http_client = httpx.AsyncClient(timeout=30.0)
        return self._http_client

    async def close(self):
        """Close HTTP client"""
        if self._http_client:
            await self._http_client.aclose()
            self._http_client = None

    def get_backend_for_model(self, model_name: str, strategy: str = "round_robin") -> BackendType:
        """
        Determine which backend to use for a given model

        Args:
            model_name: Name of the model
            strategy: Routing strategy (round_robin, least_loaded, random)

        Returns:
            BackendType to use
        """
        # Simple routing based on model type
        # In production, this could be more sophisticated
        if model_name in ["mobilenet_v3", "yolov8n"]:
            return BackendType.ONNX
        else:
            return BackendType.TENSORFLOW

    async def route_request(
        self,
        backend: BackendType,
        endpoint: str,
        method: str = "GET",
        data: Optional[Dict[str, Any]] = None,
        files: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Route request to backend service

        Args:
            backend: Backend to route to
            endpoint: API endpoint
            method: HTTP method
            data: Request data
            files: Request files

        Returns:
            Response data
        """
        backend_url = self.backends.get(backend)
        if not backend_url:
            raise ValueError(f"Backend {backend} not configured")

        url = f"{backend_url}{endpoint}"

        # Update stats
        self.backend_stats[backend.value]["requests"] += 1
        self.backend_stats[backend.value]["last_used"] = time.time()

        # Record metrics
        start_time = time.time()
        status = "success"

        try:
            logger.info(f"Routing {method} request to {backend}: {endpoint}")

            if method == "GET":
                response = await self.http_client.get(url)
            elif method == "POST":
                if files:
                    response = await self.http_client.post(url, files=files)
                else:
                    response = await self.http_client.post(url, json=data)
            else:
                raise ValueError(f"Unsupported method: {method}")

            response.raise_for_status()
            result = response.json()

            logger.info(f"Request successful from {backend}: {response.status_code}")
            return result

        except httpx.HTTPError as e:
            self.backend_stats[backend.value]["errors"] += 1
            status = "error"
            logger.error(f"Request failed to {backend}: {e}")

            # Try fallback
            if backend != BackendType.FALLBACK:
                logger.info("Attempting fallback backend")
                return await self._try_fallback(endpoint, method, data, files)

            raise

        except Exception as e:
            self.backend_stats[backend.value]["errors"] += 1
            status = "error"
            logger.error(f"Unexpected error routing to {backend}: {e}")
            raise

        finally:
            duration = time.time() - start_time
            request_count.labels(backend=backend.value, status=status).inc()
            request_duration.labels(backend=backend.value).observe(duration)

    async def _try_fallback(
        self,
        endpoint: str,
        method: str,
        data: Optional[Dict[str, Any]],
        files: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Try fallback backend if primary fails"""
        # In production, implement actual fallback logic
        # For now, return a fallback response
        return {
            "error": "Backend unavailable",
            "fallback": "Fallback response would be here"
        }

    def get_backend_stats(self) -> Dict[str, Any]:
        """Get statistics for all backends"""
        return self.backend_stats

    def health_check(self) -> Dict[str, bool]:
        """Check health of all backends"""
        health = {}
        for backend in BackendType:
            if backend == BackendType.FALLBACK:
                continue

            backend_url = self.backends.get(backend)
            if not backend_url:
                health[backend.value] = False
                continue

            try:
                response = httpx.get(f"{backend_url}/health", timeout=5.0)
                health[backend.value] = response.status_code == 200
            except Exception as e:
                logger.error(f"Health check failed for {backend}: {e}")
                health[backend.value] = False

        return health


# Global router instance
router: Optional[ModelRouter] = None


def get_router() -> ModelRouter:
    """Get global router instance"""
    global router
    return router
