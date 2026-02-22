# ONNX Runtime Service

## Overview
FastAPI service for running ONNX models, optimized for browser-compatible models.

## Features

- Fast inference with ONNX Runtime
- Support for GPU acceleration (CUDA)
- Automatic model discovery and loading
- REST API for predictions
- Model hot-reloading
- Multiple model management

## Models

### MobileNet V3 (Image Classification)
- **Model**: `mobilenet_v3.onnx`
- **Input**: Image tensor [1, 3, 224, 224]
- **Output**: Class probabilities [1, 1000]

### YOLOv8 Nano (Object Detection)
- **Model**: `yolov8n.onnx`
- **Input**: Image tensor [1, 3, 640, 640]
- **Output**: Bounding boxes [1, 8400, 84]

## Running

### Start Service
```bash
cd infrastructure/onnx-runtime
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
curl http://localhost:8001/health
```

### Stop Service
```bash
docker-compose down
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8001/health
```

Response:
```json
{
  "status": "healthy",
  "models_loaded": 2
}
```

### List Models
```bash
curl http://localhost:8001/models
```

Response:
```json
{
  "models": {
    "mobilenet_v3": {
      "inputs": [[1, 3, 224, 224]],
      "outputs": [[1, 1000]],
      "provider": "CUDAExecutionProvider"
    }
  }
}
```

### Get Model Info
```bash
curl http://localhost:8001/models/mobilenet_v3
```

### Predict
```bash
curl -X POST http://localhost:8001/predict/mobilenet_v3 \
  -F "file=@/path/to/image.jpg"
```

Response:
```json
{
  "model": "mobilenet_v3",
  "prediction": {
    "output": [0.0001, 0.0002, ..., 0.9998]
  },
  "input_shape": [1, 3, 224, 224]
}
```

### Reload Model
```bash
curl -X POST http://localhost:8001/reload/mobilenet_v3
```

## Adding Models

1. Convert your model to ONNX format
2. Place the `.onnx` file in the `models/` directory
3. Restart the service or use the reload endpoint

### Example: Convert TensorFlow to ONNX
```python
import tf2onnx
import tensorflow as tf

# Load TensorFlow model
model = tf.keras.models.load_model('model.h5')

# Convert to ONNX
onnx_model, _ = tf2onnx.convert.from_keras(model)
with open('model.onnx', 'wb') as f:
    f.write(onnx_model.SerializeToString())
```

## Configuration

### CPU vs GPU
The service automatically uses CUDA if available, falling back to CPU:

```python
providers=['CUDAExecutionProvider', 'CPUExecutionProvider']
```

### Workers
Edit `docker-compose.yml` to change worker count:

```yaml
CMD ["uvicorn", "onnx_service:app", "--workers", "4"]
```

### Resource Limits
Adjust in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
```

## Monitoring

### View Logs
```bash
docker-compose logs -f onnx-runtime
```

### Performance Metrics
The service logs:
- Model loading times
- Inference times
- Request/response details
- Error information

## Troubleshooting

### Model Not Loading
```bash
# Check model file exists
ls -la models/

# Check logs
docker-compose logs onnx-runtime

# Test model manually
python -c "import onnxruntime; print(onnxruntime.__version__)"
```

### CUDA Not Available
```bash
# Check NVIDIA driver
nvidia-smi

# Check ONNX Runtime CUDA support
python -c "import onnxruntime as ort; print(ort.get_available_providers())"
```

### Memory Issues
Reduce resource limits or batch size:

```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

## Production Deployment

1. Enable HTTPS/TLS
2. Set up authentication
3. Configure rate limiting
4. Add monitoring and alerting
5. Set up multiple instances with load balancing
6. Implement proper error handling and logging

## Browser Integration

ONNX models served by this service can be used directly in the browser:

```javascript
import ort from 'onnxruntime-web';

// Load model
const session = await ort.InferenceSession.create('/models/mobilenet_v3.onnx');

// Run inference
const inputs = { 'input': new ort.Tensor('float32', imageData, [1, 3, 224, 224]) };
const outputs = await session.run(inputs);
```

See `infrastructure/browser-models/` for browser integration details.
