/**
 * PhotoIdentifier Browser Models
 * TensorFlow.js models for browser-based AI inference
 */

import * as tf from '@tensorflow/tfjs';
import { ModelBackend } from './types';
import { MobileNetClassifier } from './models/mobilenet';
import { ImageUtils } from './utils/image';

export { ModelBackend } from './types';
export { MobileNetClassifier } from './models/mobilenet';
export { ImageUtils } from './utils/image';

export class PhotoIdentifierBrowser {
  private backend: ModelBackend;
  private imageUtils: ImageUtils;
  private models: Map<string, any>;

  constructor(backend: ModelBackend = 'webgl') {
    this.backend = backend;
    this.imageUtils = new ImageUtils();
    this.models = new Map();
  }

  /**
   * Initialize TensorFlow.js with specified backend
   */
  async initialize(): Promise<void> {
    await tf.setBackend(this.backend);
    await tf.ready();
    console.log(`TensorFlow.js initialized with backend: ${this.backend}`);
  }

  /**
   * Load MobileNet classifier model
   */
  async loadMobileNet(modelPath: string): Promise<MobileNetClassifier> {
    if (this.models.has('mobilenet')) {
      return this.models.get('mobilenet');
    }

    const model = await MobileNetClassifier.load(modelPath);
    this.models.set('mobilenet', model);
    return model;
  }

  /**
   * Preprocess image for model input
   */
  preprocessImage(image: HTMLImageElement | HTMLCanvasElement | ImageData): tf.Tensor {
    return this.imageUtils.preprocessImage(image);
  }

  /**
   * Get current backend
   */
  getBackend(): string {
    return tf.getBackend();
  }

  /**
   * Get memory info
   */
  getMemoryInfo(): any {
    return tf.memory();
  }

  /**
   * Dispose all models and tensors
   */
  dispose(): void {
    this.models.forEach(model => model.dispose());
    this.models.clear();
  }
}

export default PhotoIdentifierBrowser;
