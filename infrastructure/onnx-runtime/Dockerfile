# ONNX Runtime Service for Browser-Compatible Models
FROM python:3.11-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip install --no-cache-dir \
    onnxruntime==1.17.0 \
    fastapi==0.109.0 \
    uvicorn[standard]==0.27.0 \
    pydantic==2.5.3 \
    python-multipart==0.0.6 \
    pillow==10.2.0 \
    numpy==1.26.3 \
    python-json-logger==2.0.7

# Set working directory
WORKDIR /app

# Copy application code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY onnx_service.py .
COPY model_loader.py .

# Create model directories
RUN mkdir -p /models/onnx

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=info

# Start service
CMD ["uvicorn", "onnx_service:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
