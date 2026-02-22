/**
 * Image utilities for browser models
 */
import * as tf from '@tensorflow/tfjs';

export class ImageUtils {
  /**
   * Preprocess image for model input
   */
  preprocessImage(
    image: HTMLImageElement | HTMLCanvasElement | ImageData,
    targetSize: [number, number] = [224, 224],
    normalize: boolean = true
  ): tf.Tensor {
    let tensor: tf.Tensor3D;

    if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
      tensor = tf.browser.fromPixels(image);
    } else {
      tensor = tf.browser.fromPixels(image);
    }

    // Resize to target size
    if (tensor.shape[0] !== targetSize[0] || tensor.shape[1] !== targetSize[1]) {
      tensor = tf.image.resizeBilinear(tensor, targetSize);
    }

    // Normalize to [0, 1]
    if (normalize) {
      tensor = tensor.div(255.0);
    }

    // Add batch dimension
    return tensor.expandDims(0);
  }

  /**
   * Load image from URL
   */
  static async loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Load image from file input
   */
  static async loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Draw image to canvas
   */
  static drawToCanvas(
    image: HTMLImageElement | HTMLCanvasElement | ImageData,
    canvas: HTMLCanvasElement
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    if (image instanceof HTMLImageElement) {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    } else if (image instanceof HTMLCanvasElement) {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    } else {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.putImageData(image, 0, 0);
    }
  }

  /**
   * Crop image from source
   */
  static cropImage(
    image: HTMLImageElement | HTMLCanvasElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return canvas;
  }

  /**
   * Resize image
   */
  static resizeImage(
    image: HTMLImageElement | HTMLCanvasElement,
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
  }

  /**
   * Convert image to base64
   */
  static toBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/jpeg', 0.95);
  }
}
