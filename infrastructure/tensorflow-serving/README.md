# TensorFlow Serving Setup

## Overview
TensorFlow Serving setup for serving machine learning models in production with gRPC and REST APIs.

## Models

### 1. Image Classifier
- **Port**: 8501 (REST) / 8500 (gRPC)
- **Endpoint**: `/v1/models/image_classifier:predict`
- **Input**: Image tensor [1, 224, 224, 3]
- **Output**: Class probabilities [1, 1000]

### 2. Object Detector
- **Port**: 8501 (REST) / 8500 (gRPC)
- **Endpoint**: `/v1/models/object_detector:predict`
- **Input**: Image tensor [1, height, width, 3]
- **Output**: Bounding boxes, classes, scores

### 3. Face Recognition
- **Port**: 8501 (REST) / 8500 (gRPC)
- **Endpoint**: `/v1/models/face_recognition:predict`
- **Input**: Face image tensor [1, 160, 160, 3]
- **Output**: Face embeddings [1, 128]

## Running

### Start TensorFlow Serving
```bash
cd infrastructure/tensorflow-serving
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
curl http://localhost:8501/v1/models
```

### Stop TensorFlow Serving
```bash
docker-compose down
```

## API Examples

### REST API - Image Classification
```bash
curl -d '{"instances": [[...image data...]]}' \
  -X POST http://localhost:8501/v1/models/image_classifier:predict \
  -H 'Content-Type: application/json'
```

### gRPC - Image Classification
```python
from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2_grpc

# Connect to TensorFlow Serving
channel = grpc.insecure_channel('localhost:8500')
stub = prediction_service_pb2_grpc.PredictionServiceStub(channel)

# Create prediction request
request = predict_pb2.PredictRequest()
request.model_spec.name = 'image_classifier'
request.model_spec.signature_name = 'serving_default'
request.inputs['input_1'].CopyFrom(tf.make_tensor_proto(image_data))

# Get prediction
result = stub.Predict(request, 10.0)
```

## Model Management

### Add New Model Version
```bash
# Copy model files to version directory
cp -r /path/to/new_model /models/image_classifier/2/

# TensorFlow Serving will automatically detect and load the new version
```

### Update Model Config
Edit `models.config` and restart:
```bash
docker-compose restart
```

## Monitoring

### View Logs
```bash
docker-compose logs -f tensorflow-serving
```

### Health Check
```bash
curl http://localhost:8501/v1/models
```

### Model Metadata
```bash
curl http://localhost:8501/v1/models/image_classifier/metadata
```

## Configuration

### Batching
Edit `batching_parameters.txt` to configure:
- `max_batch_size`: Maximum batch size (default: 32)
- `batch_timeout_micros`: Maximum wait time for batch (default: 2ms)
- `num_batch_threads`: Number of batching threads (default: 8)

### Model Version Policy
Edit `models.config` to set version policies:
- `all`: Load all available versions
- `latest`: Load only latest N versions
- `specific`: Load specific versions

## Troubleshooting

### Model Not Loading
```bash
# Check model structure
ls -la /models/image_classifier/1/

# Should contain:
# - saved_model.pb
# - variables/
#   - variables.data-00000-of-00001
#   - variables.index
```

### GPU Not Available
```bash
# Check NVIDIA driver
nvidia-smi

# Check GPU access
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
```

## Production Deployment

For production deployment, consider:
1. Enable TLS/SSL for secure communication
2. Set up load balancing with multiple instances
3. Configure monitoring and alerting
4. Implement rate limiting
5. Set up proper logging and tracing
