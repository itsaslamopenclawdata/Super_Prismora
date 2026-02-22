# TensorFlow Serving Docker Setup for PhotoIdentifier
FROM tensorflow/serving:2.15.0-gpu

# Set working directory
WORKDIR /models

# Copy model configuration
COPY models.config /etc/tensorflow-serving/models.config

# Create model directories
RUN mkdir -p /models/image_classifier/1 \
    /models/object_detector/1 \
    /models/face_recognition/1

# Expose TensorFlow Serving ports
# 8500 - gRPC API
# 8501 - REST API
# 8502 - gRPC API for models that use the SessionBundle format
EXPOSE 8500 8501 8502

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8501/v1/models/image_classifier || exit 1

# Set environment variables
ENV MODEL_BASE_PATH=/models
ENV MODEL_NAME=image_classifier

# Start TensorFlow Serving with model configuration
CMD ["tensorflow_model_server", \
     "--port=8500", \
     "--rest_api_port=8501", \
     "--model_config_file=/etc/tensorflow-serving/models.config", \
     "--enable_batching=true", \
     "--batching_parameters_file=/etc/tensorflow-serving/batching_parameters.txt", \
     "--enable_model_warmup=true"]
