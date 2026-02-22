# AI Gateway Service

## Overview
The AI Gateway is a centralized service that routes requests to appropriate AI model backends (TensorFlow Serving and ONNX Runtime). It provides a unified API for all AI inference needs.

## Features

- **Smart Routing**: Automatically routes requests to the best backend
- **Rate Limiting**: Prevents abuse with Redis-based rate limiting
- **Load Balancing**: Distributes load across backends
- **Monitoring**: Prometheus metrics for observability
- **Health Checks**: Monitors backend health
- **Fallback**: Automatic fallback to backup backends
- **Unified API**: Single endpoint for all models

## Architecture

```
Client Request
     ↓
AI Gateway
     ↓
┌────────────┬────────────┐
│ TensorFlow │   ONNX     │
│  Serving   │  Runtime   │
└────────────┴────────────┘
```

## Running

### Start Gateway
```bash
cd infrastructure/ai-gateway
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
curl http://localhost:8000/health
```

### Stop Gateway
```bash
docker-compose down
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "backends": {
      "tensorflow": true,
      "onnx": true
    },
    "rate_limiter": "enabled"
  }
}
```

### List All Models
```bash
curl http://localhost:8000/models
```

Response:
```json
{
  "tensorflow": {
    "models": ["image_classifier", "object_detector", "face_recognition"]
  },
  "onnx": {
    "models": {
      "mobilenet_v3": {...},
      "yolov8n": {...}
    }
  }
}
```

### Predict
```bash
curl -X POST http://localhost:8000/predict/mobilenet_v3 \
  -F "file=@image.jpg"
```

### Get Statistics
```bash
curl http://localhost:8000/stats
```

### Prometheus Metrics
```bash
curl http://localhost:8000/metrics
```

## Configuration

### Environment Variables

Edit environment variables in `docker-compose.yml`:

```yaml
environment:
  - TENSORFLOW_SERVING_URL=http://tensorflow-serving:8501
  - ONNX_RUNTIME_URL=http://onnx-runtime:8000
  - RATE_LIMIT_ENABLED=true
  - RATE_LIMIT_REQUESTS=100
  - RATE_LIMIT_WINDOW=60
```

### Rate Limiting

Configure rate limiting:

- `RATE_LIMIT_ENABLED`: Enable/disable rate limiting
- `RATE_LIMIT_REQUESTS`: Max requests per window
- `RATE_LIMIT_WINDOW`: Time window in seconds

### Model Routing

Edit `model_router.py` to customize routing:

```python
def get_backend_for_model(self, model_name: str, strategy: str = "round_robin") -> BackendType:
    if model_name in ["mobilenet_v3", "yolov8n"]:
        return BackendType.ONNX
    else:
        return BackendType.TENSORFLOW
```

## Monitoring

### Prometheus Metrics

The gateway exposes metrics at `/metrics`:

- `ai_gateway_total`: Total gateway requests
- `ai_gateway_errors_total`: Total gateway errors
- `ai_gateway_requests_total`: Requests per backend
- `ai_gateway_request_duration_seconds`: Request duration

### Grafana Dashboard

Import the dashboard for AI Gateway metrics visualization.

## Troubleshooting

### Backend Unavailable
```bash
# Check backend health
curl http://localhost:8000/health

# Check logs
docker-compose logs ai-gateway
```

### Rate Limiting Issues
```bash
# Check Redis connection
docker exec -it photoidentifier-redis redis-cli ping

# Reset rate limit for IP
# (Need to implement admin endpoint)
```

### Routing Errors
```bash
# Check backend status
curl http://localhost:8501/v1/models  # TensorFlow
curl http://localhost:8001/models    # ONNX
```

## Production Deployment

1. **Security**
   - Enable authentication (API keys, JWT)
   - Set up TLS/SSL
   - Configure firewall rules

2. **Scalability**
   - Deploy multiple gateway instances
   - Use load balancer (NGINX, HAProxy)
   - Enable connection pooling

3. **Monitoring**
   - Set up Prometheus + Grafana
   - Configure alerting rules
   - Log aggregation (ELK stack)

4. **High Availability**
   - Multiple backend instances
   - Redis clustering
   - Health checks and auto-scaling

## Usage Examples

### Python Client
```python
import requests

# Predict
with open('image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/predict/mobilenet_v3',
        files={'file': f}
    )
    result = response.json()
```

### JavaScript Client
```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/predict/mobilenet_v3', {
    method: 'POST',
    body: formData
});
const result = await response.json();
```

## Next Steps

- Add API authentication
- Implement request/response caching
- Add more sophisticated routing strategies
- Implement circuit breaker pattern
- Add request/response logging
