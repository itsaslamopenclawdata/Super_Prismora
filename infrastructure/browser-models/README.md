# TensorFlow.js Browser Models

## Overview
TensorFlow.js models and utilities for browser-based AI inference in PhotoIdentifier.

## Features

- **In-Browser Inference**: Run AI models directly in the browser
- **Multiple Backends**: WebGL, WebGPU, WASM, CPU support
- **MobileNet Classifier**: Pre-trained image classification
- **Image Utilities**: Preprocessing, resizing, cropping
- **TypeScript Support**: Full type definitions
- **Easy Integration**: Simple API for web applications

## Installation

```bash
npm install
```

## Usage

### Basic Usage

```typescript
import PhotoIdentifierBrowser from '@photoidentifier/browser-models';

// Initialize
const browserAI = new PhotoIdentifierBrowser('webgl');
await browserAI.initialize();

// Load model
const classifier = await browserAI.loadMobileNet('/models/mobilenet/model.json');

// Preprocess image
const image = document.getElementById('myImage') as HTMLImageElement;
const tensor = browserAI.preprocessImage(image);

// Predict
const results = await classifier.predict(tensor);
console.log(results.predictions);
```

### With File Input

```typescript
import { ImageUtils } from '@photoidentifier/browser-models';

// Load image from file
const file = fileInput.files[0];
const image = await ImageUtils.loadImageFromFile(file);

// Predict
const results = await classifier.predict(
  browserAI.preprocessImage(image)
);
```

### With URL

```typescript
import { ImageUtils } from '@photoidentifier/browser-models';

// Load image from URL
const image = await ImageUtils.loadImageFromUrl('https://example.com/image.jpg');

// Predict
const results = await classifier.predict(
  browserAI.preprocessImage(image)
);
```

## Demo

Open `public/demo.html` in a browser to see a live demo of the browser models.

## Building

```bash
npm run build
```

## Development

```typescript
npm run watch
```

## Available Models

### MobileNet V2
- Type: Image Classification
- Input: 224x224 RGB image
- Output: Top-K class predictions with probabilities
- Classes: 1000 ImageNet classes

## Backends

### WebGL (Recommended)
- Best performance on most devices
- Uses GPU acceleration
- Supported on most modern browsers

### WebGPU (Experimental)
- Next-generation GPU API
- Potentially faster than WebGL
- Limited browser support

### WASM
- CPU-based
- Works on devices without WebGL support
- Slower than GPU backends

### CPU
- Fallback backend
- Slowest performance
- Maximum compatibility

## API Reference

### PhotoIdentifierBrowser

#### Constructor
```typescript
constructor(backend: ModelBackend = 'webgl')
```

#### Methods

- `initialize(): Promise<void>` - Initialize TensorFlow.js
- `loadMobileNet(modelPath: string): Promise<MobileNetClassifier>` - Load MobileNet model
- `preprocessImage(image): tf.Tensor` - Preprocess image for model input
- `getBackend(): string` - Get current backend
- `getMemoryInfo(): any` - Get memory usage
- `dispose(): void` - Dispose all models and tensors

### MobileNetClassifier

#### Methods

- `static load(modelPath: string): Promise<MobileNetClassifier>` - Load model
- `preprocess(image: tf.Tensor3D): tf.Tensor4D` - Preprocess image
- `predict(image: tf.Tensor4D, options?: InferenceOptions): Promise<PredictionResult>` - Run inference
- `getMetadata(): ModelMetadata` - Get model metadata
- `dispose(): void` - Dispose model

### InferenceOptions

```typescript
{
  topK?: number;      // Number of top predictions to return (default: 5)
  threshold?: number; // Minimum probability threshold (default: 0.0)
}
```

### PredictionResult

```typescript
{
  predictions: Prediction[];
  processingTime: number; // milliseconds
  modelUsed: string;
}
```

## Performance Tips

1. **Use WebGL backend** for best performance
2. **Preprocess images** to match model input size
3. **Dispose tensors** when no longer needed
4. **Batch predictions** if processing multiple images
5. **Use Web Workers** for heavy computations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Next Steps

- Add more models (Object Detection, Face Recognition)
- Implement model versioning
- Add quantization support
- Implement model caching
- Add Web Worker support
