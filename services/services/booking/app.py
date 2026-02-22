from fastapi import FastAPI
from services.booking import router as booking_router
from app.config import get_settings
from app.middleware import setup_middleware
from app.database import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Booking Service",
    version="1.0.0",
    description="Telehealth appointment booking service",
    docs_url="/docs",
    redoc_url="/redoc",
)

setup_middleware(app)
app.include_router(booking_router)


@app.on_event("startup")
async def startup():
    logger.info("Starting Booking Service...")
    if not settings.TELEHEALTH_ENABLED:
        logger.warning("Telehealth is disabled. Enable with TELEHEALTH_ENABLED=true")
    init_db()


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down Booking Service...")


@app.get("/")
async def root():
    return {"service": "booking", "status": "healthy"}


@app.get("/health")
async def health():
    return {"service": "booking", "status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
