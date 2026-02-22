from fastapi import FastAPI
from services.analytics import router as analytics_router
from app.config import get_settings
from app.middleware import setup_middleware
from app.database import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Analytics Service",
    version="1.0.0",
    description="Event tracking and analytics service",
    docs_url="/docs",
    redoc_url="/redoc",
)

setup_middleware(app)
app.include_router(analytics_router)


@app.on_event("startup")
async def startup():
    logger.info("Starting Analytics Service...")
    init_db()


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down Analytics Service...")


@app.get("/")
async def root():
    return {"service": "analytics", "status": "healthy"}


@app.get("/health")
async def health():
    return {"service": "analytics", "status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
