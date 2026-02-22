from fastapi import FastAPI
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.middleware import setup_middleware
from app.database import init_db
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

settings = get_settings()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend services for PhotoIdentifier platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Setup middleware
setup_middleware(app)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Initialize database connection
    if init_db():
        logger.info("Database connection established")
    else:
        logger.warning("Database connection failed")

    logger.info("Services initialized successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down services")


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    db_status = "healthy" if init_db() else "unhealthy"

    return {
        "status": "healthy",
        "services": {
            "database": db_status,
            "api": "healthy",
        },
        "version": settings.APP_VERSION,
    }


# Include service routers (will be added in individual service files)
# from services.image import router as image_router
# from services.notification import router as notification_router
# etc.


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
