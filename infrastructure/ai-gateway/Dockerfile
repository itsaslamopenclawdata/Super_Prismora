# AI Gateway Service
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3 \
    httpx==0.26.0 \
    pydantic-settings==2.1.0 \
    redis==5.0.1 \
    python-json-logger==2.0.7 \
    prometheus-client==0.19.0

# Set working directory
WORKDIR /app

# Copy application code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_gateway.py .
COPY model_router.py .
COPY rate_limiter.py .
COPY config.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=info

# Start service
CMD ["uvicorn", "ai_gateway:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
