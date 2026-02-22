/**
 * Type definitions for browser models
 */

export type ModelBackend = 'webgl' | 'webgpu' | 'wasm' | 'cpu';

export interface ModelMetadata {
  name: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  classes: string[];
  type: 'classification' | 'object_detection' | 'face_recognition' | 'segmentation';
}

export interface PredictionResult {
  predictions: Prediction[];
  processingTime: number;
  modelUsed: string;
}

export interface Prediction {
  className: string;
  probability: number;
  label?: string;
  boundingBox?: BoundingBox;
  embedding?: number[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ModelLoadOptions {
  backend?: ModelBackend;
  enableProfiling?: boolean;
  enableDebugMode?: boolean;
}

export interface InferenceOptions {
  topK?: number;
  threshold?: number;
  returnEmbeddings?: boolean;
}
