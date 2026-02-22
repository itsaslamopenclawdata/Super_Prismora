# Image Preprocessing Service

## Overview
FastAPI service for image preprocessing before AI model inference. Provides various preprocessing modes for different model types.

## Features

- **Multiple Preprocessing Modes**: Classification, Object Detection, Face Recognition, Segmentation
- **Image Enhancement**: Auto-enhance with CLAHE, brightness, contrast, saturation, sharpness
- **Resizing**: Various interpolation methods (nearest, bilinear, bicubic, lanczos)
- **Normalization**: Custom mean/std normalization
- **Aspect Ratio Handling**: Maintain or ignore aspect ratio
- **Base64 Encoding**: Return processed data as base64

## Preprocessing Modes

### Classification (ImageNet-style)
- Size: 224x224
- Normalization: Scale to [0, 1]
- Format: CHW with batch dimension

### Object Detection (YOLO-style)
- Size: 640x640
- Normalization: Scale to [0, 1]
- Format: CHW with batch dimension

### Face Recognition
- Size: 160x160
- Normalization: Scale to [0, 1]
- Format: CHW with batch dimension

### Segmentation
- Size: 512x512
- Normalization: Scale to [0, 1]
- Format: CHW with batch dimension

## Running

### Start Service
```bash
cd infrastructure/preprocessing
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
curl http://localhost:8002/health
```

### Stop Service
```bash
docker-compose down
```

## API Endpoints

### Health Check
```bash
curl http://localhost:8002/health
```

### Preprocess Image
```bash
curl -X POST http://localhost:8002/preprocess \
  -F "file=@image.jpg" \
  -F "mode=classification" \
  -F "size=224,224" \
  -F "enhance=true"
```

Parameters:
- `file`: Image file to preprocess
- `mode`: Preprocessing mode (classification, object_detection, face_recognition, segmentation)
- `size`: Target size as "width,height" (optional)
- `enhance`: Whether to auto-enhance image (default: false)

Response:
```json
{
  "status": "success",
  "mode": "classification",
  "shape": [1, 3, 224, 224],
  "dtype": "float32",
  "data": "base64_encoded_data..."
}
```

### Resize Image
```bash
curl -X POST http://localhost:8002/resize \
  -F "file=@image.jpg" \
  -F "width=224" \
  -F "height=224" \
  -F "maintain_aspect_ratio=true" \
  -F "method=bilinear"
```

Parameters:
- `file`: Image file to resize
- `width`: Target width
- `height`: Target height
- `maintain_aspect_ratio`: Whether to maintain aspect ratio (default: true)
- `method`: Resizing method (nearest, bilinear, bicubic, lanczos)

### Normalize Image
```bash
curl -X POST http://localhost:8002/normalize \
  -F "file=@image.jpg" \
  -F "mean=0.485,0.456,0.406" \
  -F "std=0.229,0.224,0.225" \
  -F "scale=255.0"
```

Parameters:
- `file`: Image file to normalize
- `mean`: Mean values per channel (comma-separated)
- `std`: Standard deviation per channel (comma-separated)
- `scale`: Scale factor (default: 255.0)

### Enhance Image
```bash
curl -X POST http://localhost:8002/enhance \
  -F "file=@image.jpg" \
  -F "brightness=1.2" \
  -F "contrast=1.1" \
  -F "saturation=1.0" \
  -F "sharpness=1.1"
```

Parameters:
- `file`: Image file to enhance
- `brightness`: Brightness factor (default: 1.0)
- `contrast`: Contrast factor (default: 1.0)
- `saturation`: Saturation factor (default: 1.0)
- `sharpness`: Sharpness factor (default: 1.0)

## Usage Examples

### Python Client
```python
import requests
import base64
import numpy as np

# Preprocess image
with open('image.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8002/preprocess',
        files={'file': f},
        data={'mode': 'classification', 'enhance': True}
    )
    result = response.json()

# Decode base64 data
processed_data = base64.b64decode(result['data'])
processed = np.frombuffer(processed_data, dtype=np.float32)
processed = processed.reshape(result['shape'])
```

### JavaScript Client
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('mode', 'classification');
formData.append('enhance', 'true');

const response = await fetch('http://localhost:8002/preprocess', {
    method: 'POST',
    body: formData
});
const result = await response.json();

// Decode base64 data
const processedData = atob(result.data);
```

## Integration with AI Gateway

The preprocessing service can be integrated with the AI Gateway:

```python
# First preprocess
preprocessed = await preprocess_image(image)

# Then send to AI Gateway
prediction = await ai_gateway.predict(model_name, preprocessed)
```

## Configuration

### Workers
Edit `docker-compose.yml` to change worker count:

```yaml
CMD ["uvicorn", "preprocessing_service:app", "--workers", "2"]
```

### Resource Limits
Adjust in `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
```

## Troubleshooting

### Image Loading Errors
```bash
# Check image format
file image.jpg

# Test with known good image
curl -X POST http://localhost:8002/preprocess \
  -F "file=@test.jpg"
```

### Memory Issues
Reduce worker count or add memory limits:

```yaml
deploy:
  resources:
    limits:
      memory: 2G
```

### OpenCV Errors
Ensure OpenCV is installed correctly:

```bash
docker exec -it photoidentifier-preprocessing python -c "import cv2; print(cv2.__version__)"
```

## Performance Optimization

1. **Use GPU**: Add GPU support for faster processing
2. **Batch Processing**: Implement batch preprocessing endpoint
3. **Caching**: Cache frequently preprocessed images
4. **Compression**: Use lossless compression for large images
5. **Async Processing**: Process images asynchronously

## Next Steps

- Add batch preprocessing endpoint
- Implement preprocessing pipeline configuration
- Add support for video frames
- Implement custom preprocessing profiles
- Add GPU acceleration support
