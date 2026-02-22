"""
AI Gateway Service
Routes requests to appropriate AI model backends
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import logging
from typing import Dict, Any, Optional
from model_router import ModelRouter, BackendType, get_router
from rate_limiter import RateLimiter, get_rate_limiter
from config import settings
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PhotoIdentifier AI Gateway",
    description="Gateway service for AI model backends",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
gateway_requests = Counter('ai_gateway_total', 'Total gateway requests')
gateway_errors = Counter('ai_gateway_errors_total', 'Total gateway errors')


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global router, rate_limiter

    # Initialize model router
    router = ModelRouter(
        tensorflow_url=settings.TENSORFLOW_SERVING_URL,
        onnx_url=settings.ONNX_RUNTIME_URL
    )
    logger.info(f"Model router initialized with backends: {router.backends}")

    # Initialize rate limiter
    if settings.RATE_LIMIT_ENABLED:
        rate_limiter = RateLimiter(
            redis_host=settings.REDIS_HOST,
            redis_port=settings.REDIS_PORT,
            redis_db=settings.REDIS_DB,
            redis_password=settings.REDIS_PASSWORD,
            requests=settings.RATE_LIMIT_REQUESTS,
            window=settings.RATE_LIMIT_WINDOW
        )
        logger.info("Rate limiter initialized")
    else:
        logger.info("Rate limiting disabled")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    if router:
        await router.close()


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    health = {
        "status": "healthy",
        "services": {}
    }

    if router:
        health["services"]["backends"] = router.health_check()

    if rate_limiter:
        health["services"]["rate_limiter"] = "enabled"
    else:
        health["services"]["rate_limiter"] = "disabled"

    return health


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/stats")
async def get_stats():
    """Get gateway statistics"""
    gateway_requests.inc()

    stats = {
        "gateway": {
            "version": "1.0.0",
            "rate_limiting": settings.RATE_LIMIT_ENABLED
        }
    }

    if router:
        stats["backends"] = router.get_backend_stats()

    return stats


@app.get("/models")
async def list_models():
    """List all available models from all backends"""
    gateway_requests.inc()

    models = {}

    # Query TensorFlow Serving
    try:
        tfs_models = await router.route_request(
            BackendType.TENSORFLOW,
            "/v1/models"
        )
        models["tensorflow"] = tfs_models
    except Exception as e:
        logger.error(f"Failed to get TensorFlow models: {e}")
        models["tensorflow"] = {"error": str(e)}

    # Query ONNX Runtime
    try:
        onnx_models = await router.route_request(
            BackendType.ONNX,
            "/models"
        )
        models["onnx"] = onnx_models
    except Exception as e:
        logger.error(f"Failed to get ONNX models: {e}")
        models["onnx"] = {"error": str(e)}

    return models


@app.post("/predict/{model_name}")
async def predict(
    model_name: str,
    request: Request,
    file: UploadFile = File(...)
):
    """
    Route prediction request to appropriate backend

    Args:
        model_name: Name of the model
        request: FastAPI request (for client IP)
        file: Uploaded image file

    Returns:
        Model prediction
    """
    gateway_requests.inc()

    # Rate limiting
    if rate_limiter:
        client_ip = request.client.host if request.client else "unknown"
        allowed, remaining = rate_limiter.is_allowed(client_ip)

        if not allowed:
            gateway_errors.inc()
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again later.",
                headers={"X-RateLimit-Remaining": str(remaining)}
            )

    # Determine backend
    backend = router.get_backend_for_model(model_name)

    # Route request
    try:
        if backend == BackendType.ONNX:
            # Use ONNX Runtime
            result = await router.route_request(
                backend,
                f"/predict/{model_name}",
                method="POST",
                files={"file": (file.filename, await file.read(), file.content_type)}
            )
        else:
            # Use TensorFlow Serving
            # For now, return a placeholder
            result = {
                "model": model_name,
                "backend": backend.value,
                "prediction": "Placeholder - implement TensorFlow routing"
            }

        return result

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        gateway_errors.inc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reload/{model_name}")
async def reload_model(model_name: str):
    """Reload a model on the appropriate backend"""
    gateway_requests.inc()

    backend = router.get_backend_for_model(model_name)

    try:
        if backend == BackendType.ONNX:
            result = await router.route_request(
                backend,
                f"/reload/{model_name}",
                method="POST"
            )
        else:
            # TensorFlow Serving doesn't have reload endpoint via REST
            result = {
                "message": "TensorFlow Serving models are auto-reloaded"
            }

        return result

    except Exception as e:
        logger.error(f"Reload error: {e}")
        gateway_errors.inc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_gateway:app", host="0.0.0.0", port=8000, workers=2)
