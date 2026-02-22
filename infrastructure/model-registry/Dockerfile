# Model Registry Service Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3 \
    sqlalchemy==2.0.25 \
    alembic==1.13.1 \
    asyncpg==0.29.0 \
    redis==5.0.1 \
    python-multipart==0.0.6 \
    aiofiles==23.2.1 \
    prometheus-client==0.19.0

# Set working directory
WORKDIR /app

# Copy application code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY models.py .
COPY database.py .
COPY registry_service.py .

# Create model storage directory
RUN mkdir -p /models/storage

# Expose port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8003/health || exit 1

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=info
ENV DATABASE_URL=postgresql+asyncpg://photoidentifier:password@postgres:5432/photoidentifier

# Start service
CMD ["uvicorn", "registry_service:app", "--host", "0.0.0.0", "--port", "8003", "--workers", "2"]
