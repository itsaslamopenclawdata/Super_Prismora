# BirdNET Audio Inference Service Dockerfile
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3 \
    numpy==1.26.3 \
    librosa==0.10.1 \
    scipy==1.11.4 \
    soundfile==0.12.1 \
    python-multipart==0.0.6 \
    onnxruntime==1.17.0 \
    prometheus-client==0.19.0 \
    aiocache==0.12.2

# Set working directory
WORKDIR /app

# Copy application code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY audio_processor.py .
COPY birdnet_service.py .

# Create audio storage directory
RUN mkdir -p /audio/storage

# Expose port
EXPOSE 8004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8004/health || exit 1

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=info

# Start service
CMD ["uvicorn", "birdnet_service:app", "--host", "0.0.0.0", "--port", "8004", "--workers", "2"]
