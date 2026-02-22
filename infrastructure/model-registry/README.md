# Model Version Registry

## Overview
Service for managing AI model versions, including metadata, deployments, and performance tracking.

## Features

- **Model Management**: Create and manage models
- **Version Tracking**: Track multiple versions of each model
- **Metadata Storage**: Store training config, metrics, release notes
- **Deployment Tracking**: Track model deployments and rollbacks
- **File Storage**: Store model files with checksums
- **Default Version**: Mark specific versions as default
- **Performance Metrics**: Track accuracy, precision, recall, F1, mAP

## Model Types

- `classification`: Image classification models
- `object_detection`: Object detection models
- `face_recognition`: Face recognition models
- `segmentation`: Image segmentation models
- `audio`: Audio classification models

## Model Formats

- `tensorflow_saved_model`: TensorFlow SavedModel format
- `onnx`: ONNX format
- `tflite`: TensorFlow Lite format
- `pytorch`: PyTorch models

## Running

### Start Service
```bash
cd infrastructure/model-registry
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
curl http://localhost:8003/health
```

### Stop Service
```bash
docker-compose down
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8003/health
```

### List Models
```bash
curl http://localhost:8003/models
```

Query parameters:
- `model_type`: Filter by model type
- `is_active`: Filter by active status

### Get Model Details
```bash
curl http://localhost:8003/models/image_classifier
```

### Create Model
```bash
curl -X POST http://localhost:8003/models \
  -H "Content-Type: application/json" \
  -d '{
    "name": "image_classifier",
    "description": "ResNet-50 image classifier",
    "model_type": "classification"
  }'
```

### List Model Versions
```bash
curl http://localhost:8003/models/image_classifier/versions
```

Query parameters:
- `status`: Filter by status (training, testing, approved, deprecated, archived)
- `is_default`: Filter by default status

### Get Model Version
```bash
curl http://localhost:8003/models/image_classifier/versions/v1
```

### Create Model Version
```bash
curl -X POST http://localhost:8003/models/image_classifier/versions \
  -F "version=v2" \
  -F "format=tensorflow_saved_model" \
  -F "accuracy=0.95" \
  -F "input_shape=[1,3,224,224]" \
  -F "output_shape=[1,1000]" \
  -F "file=@model.zip"
```

### Deploy Model Version
```bash
curl -X POST http://localhost:8003/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "image_classifier",
    "version": "v1",
    "deployment_target": "production",
    "deployed_by": "admin"
  }'
```

### Get Default Version
```bash
curl http://localhost:8003/models/image_classifier/versions/default
```

## Usage Examples

### Python Client
```python
import requests

# Create model
response = requests.post(
    'http://localhost:8003/models',
    json={
        'name': 'mobilenet_v3',
        'description': 'MobileNet V3 for mobile devices',
        'model_type': 'classification'
    }
)
model = response.json()

# Create version
with open('model.onnx', 'rb') as f:
    response = requests.post(
        f'http://localhost:8003/models/{model["name"]}/versions',
        data={
            'version': 'v1',
            'format': 'onnx',
            'accuracy': '0.85',
            'input_shape': '[1,3,224,224]',
            'output_shape': '[1,1000]'
        },
        files={'file': f}
    )
```

### JavaScript Client
```javascript
// Create model
const response = await fetch('http://localhost:8003/models', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        name: 'mobilenet_v3',
        description: 'MobileNet V3',
        model_type: 'classification'
    })
});
const model = await response.json();

// Create version
const formData = new FormData();
formData.append('version', 'v1');
formData.append('format', 'onnx');
formData.append('accuracy', '0.85');
formData.append('input_shape', '[1,3,224,224]');
formData.append('output_shape', '[1,1000]');
formData.append('file', modelFile);

const versionResponse = await fetch(
    `http://localhost:8003/models/${model.name}/versions`,
    { method: 'POST', body: formData }
);
```

## Database Schema

### Models Table
- `id`: Primary key
- `name`: Unique model name
- `description`: Model description
- `model_type`: Model type enum
- `created_at`, `updated_at`: Timestamps
- `is_active`: Active status

### Model Versions Table
- `id`: Primary key
- `model_id`: Foreign key to models
- `version`: Version string
- `format`: Model format enum
- `status`: Version status enum
- `file_path`, `file_size`, `checksum`: Model file info
- `accuracy`, `precision`, `recall`, `f1_score`, `mAP`: Performance metrics
- `input_shape`, `output_shape`: Model shapes
- `deployed_to`, `deployment_config`: Deployment info
- `is_default`: Default version flag

### Model Deployments Table
- `id`: Primary key
- `model_version_id`: Foreign key to model versions
- `deployment_target`: Target environment
- `deployed_at`, `deployed_by`: Deployment metadata
- `deployment_status`: Deployment status
- `rollback_at`, `rollback_reason`: Rollback info

## Configuration

### Database URL
Edit `docker-compose.yml`:

```yaml
environment:
  - DATABASE_URL=postgresql+asyncpg://photoidentifier:password@postgres:5432/photoidentifier
```

### Model Storage
Model files are stored in `/models/storage` by default. Volume mount in `docker-compose.yml`:

```yaml
volumes:
  - ./models:/models/storage
```

## Monitoring

### View Logs
```bash
docker-compose logs -f model-registry
```

### Database Queries
```bash
docker exec -it photoidentifier-registry-db psql -U photoidentifier -d photoidentifier
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Test connection
docker exec -it photoidentifier-registry-db pg_isready -U photoidentifier
```

### Model File Upload Issues
```bash
# Check storage directory
docker exec -it photoidentifier-model-registry ls -la /models/storage

# Check file permissions
docker exec -it photoidentifier-model-registry chmod 755 /models/storage
```

### Version Already Exists
```bash
# List existing versions
curl http://localhost:8003/models/image_classifier/versions
```

## Best Practices

1. **Version Naming**: Use semantic versioning (v1.0.0, v1.1.0, etc.)
2. **Metrics**: Always provide performance metrics when creating versions
3. **Testing**: Test versions before deploying to production
4. **Rollback**: Keep previous versions available for rollback
5. **Documentation**: Include release notes for each version
6. **Default Version**: Always mark a default version for each model

## Next Steps

- Add model comparison endpoint
- Implement model rollback functionality
- Add metrics history tracking
- Implement model A/B testing
- Add model performance alerts
- Integrate with CI/CD pipeline
