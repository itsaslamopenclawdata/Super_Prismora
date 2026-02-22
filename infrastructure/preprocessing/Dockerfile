# Preprocessing Service Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3 \
    pillow==10.2.0 \
    numpy==1.26.3 \
    opencv-python==4.9.0.80 \
    python-multipart==0.0.6 \
    aiocache==0.12.2 \
    aiofiles==23.2.1

# Set working directory
WORKDIR /app

# Copy application code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY preprocessor.py .
COPY preprocessing_service.py .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=info

# Start service
CMD ["uvicorn", "preprocessing_service:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
