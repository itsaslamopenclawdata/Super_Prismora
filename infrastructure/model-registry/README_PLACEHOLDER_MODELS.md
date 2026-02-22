# Placeholder Models for Testing

## Overview
This directory contains placeholder AI models for testing the PhotoIdentifier infrastructure.

## Models Created

### TensorFlow Models (SavedModel format)

1. **Image Classifier** (`image_classifier`)
   - Type: Classification
   - Input Shape: [1, 224, 224, 3]
   - Output Shape: [1, 10]
   - Classes: 10
   - Location: `placeholder_models/tensorflow/image_classifier/1/`

2. **Face Recognition** (`face_recognition`)
   - Type: Face Recognition
   - Input Shape: [1, 160, 160, 3]
   - Output Shape: [1, 128]
   - Embedding Dim: 128
   - Location: `placeholder_models/tensorflow/face_recognition/`

3. **Object Detector** (`object_detector`)
   - Type: Object Detection
   - Input Shape: [1, 640, 640, 3]
   - Output Shape: [1, 8400, 84]
   - Location: `placeholder_models/tensorflow/object_detector/`

### ONNX Models

1. **MobileNet V3** (`mobilenet_v3`)
   - Type: Classification
   - Input Shape: [1, 3, 224, 224] (NCHW format)
   - Output Shape: [1, 10]
   - Location: `placeholder_models/onnx/mobilenet_v3.onnx`

2. **YOLOv8 Nano** (`yolov8n`)
   - Type: Object Detection
   - Input Shape: [1, 3, 640, 640] (NCHW format)
   - Output Shape: [1, 8400, 84]
   - Location: `placeholder_models/onnx/yolov8n.onnx`

## Creating Placeholder Models

### Install Dependencies
```bash
pip install -r requirements-models.txt
```

### Run Model Creation Script
```bash
python create_placeholder_models.py
```

## Using Placeholder Models

### With TensorFlow Serving
```bash
# Copy models to TensorFlow Serving directory
cp -r placeholder_models/tensorflow/image_classifier/* /models/image_classifier/1/
cp -r placeholder_models/tensorflow/face_recognition/* /models/face_recognition/1/
cp -r placeholder_models/tensorflow/object_detector/* /models/object_detector/1/

# Start TensorFlow Serving
cd infrastructure/tensorflow-serving
docker-compose up -d
```

### With ONNX Runtime
```bash
# Copy models to ONNX Runtime directory
cp placeholder_models/onnx/*.onnx /models/onnx/

# Start ONNX Runtime
cd infrastructure/onnx-runtime
docker-compose up -d
```

### Testing TensorFlow Model
```python
import tensorflow as tf
import numpy as np

# Load model
model = tf.keras.models.load_model('placeholder_models/tensorflow/image_classifier/1')

# Create dummy input
input_data = np.random.rand(1, 224, 224, 3).astype(np.float32)

# Run inference
output = model.predict(input_data)
print(f"Output shape: {output.shape}")
print(f"Predictions: {output}")
```

### Testing ONNX Model
```python
import onnxruntime as ort
import numpy as np

# Load model
session = ort.InferenceSession('placeholder_models/onnx/mobilenet_v3.onnx')

# Create dummy input (NCHW format)
input_data = np.random.rand(1, 3, 224, 224).astype(np.float32)

# Get input name
input_name = session.get_inputs()[0].name

# Run inference
outputs = session.run(None, {input_name: input_data})
print(f"Output shape: {outputs[0].shape}")
print(f"Predictions: {outputs[0]}")
```

## Model Info

All model metadata is available in `models_info.json`:

```json
{
  "image_classifier": {
    "type": "classification",
    "input_shape": [1, 224, 224, 3],
    "output_shape": [1, 10],
    "format": "tensorflow_saved_model",
    "classes": 10
  }
}
```

## Note

These are **placeholder models** for testing infrastructure. They:
- Have simple architectures
- Use random weights (not trained)
- Produce random outputs
- Are for development and testing only

For production, replace with trained models with actual weights.

## Next Steps

1. Train actual models with real data
2. Export models in appropriate formats
3. Upload models to Model Registry
4. Deploy to production infrastructure
5. Monitor performance and metrics
