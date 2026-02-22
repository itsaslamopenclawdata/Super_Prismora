from fastapi import FastAPI
from services.image import router as image_router
from app.config import get_settings
from app.middleware import setup_middleware
from app.database import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title="Image Service",
    version="1.0.0",
    description="Image upload and processing service",
    docs_url="/docs",
    redoc_url="/redoc",
)

setup_middleware(app)
app.include_router(image_router)


@app.on_event("startup")
async def startup():
    logger.info("Starting Image Service...")
    init_db()


@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down Image Service...")


@app.get("/")
async def root():
    return {"service": "image", "status": "healthy"}


@app.get("/health")
async def health():
    return {"service": "image", "status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
