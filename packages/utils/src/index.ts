/**
 * PhotoIdentifier Platform Utilities
 * Shared utility functions across the monorepo
 */

import type {
  Photo,
  PhotoIdentification,
  BoundingBox,
  SearchFilters,
  ApiResponse,
  DeepPartial,
} from '@photoidentifier/types';

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format a date to a localized string
 */
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a date to a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date, locale = 'en-US'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  return formatDate(date, locale);
}

/**
 * Format a confidence score to a percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================================================
// Photo Utilities
// ============================================================================

/**
 * Calculate the aspect ratio of a photo
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Determine if a photo is in landscape orientation
 */
export function isLandscape(width: number, height: number): boolean {
  return width > height;
}

/**
 * Determine if a photo is in portrait orientation
 */
export function isPortrait(width: number, height: number): boolean {
  return height > width;
}

/**
 * Get the dominant identification from a list of identifications
 */
export function getDominantIdentification(
  identifications: PhotoIdentification[]
): PhotoIdentification | null {
  if (identifications.length === 0) return null;
  return identifications.reduce((max, id) =>
    id.confidence > max.confidence ? id : max
  );
}

/**
 * Check if a bounding box overlaps with another
 */
export function boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}

/**
 * Calculate the intersection over union (IoU) of two bounding boxes
 */
export function calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
  const xOverlap = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
  const yOverlap = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
  const intersectionArea = xOverlap * yOverlap;
  const unionArea =
    box1.width * box1.height + box2.width * box2.height - intersectionArea;
  return intersectionArea / unionArea;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Chunk an array into smaller arrays of a specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from an array based on a key function
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Sort an array by a key function
 */
export function sortBy<T, K>(
  array: T[],
  keyFn: (item: T) => K,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const ka = keyFn(a);
    const kb = keyFn(b);
    if (ka < kb) return order === 'asc' ? -1 : 1;
    if (ka > kb) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<DeepPartial<T>>): T {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = deepMerge(
            target[key as keyof T] as object,
            source[key] as DeepPartial<object>
          ) as T[keyof T];
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: unknown): item is object {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Pick specific keys from an object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Omit specific keys from an object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

// ============================================================================
// Async Utilities
// ============================================================================

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(baseDelay * Math.pow(2, i));
      }
    }
  }
  throw lastError;
}

/**
 * Execute multiple promises in parallel with concurrency limit
 */
export async function parallel<T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  concurrency = 5
): Promise<void> {
  const results = [];
  const executing = new Set<Promise<unknown>>();

  for (const item of items) {
    const promise = fn(item).then(result => {
      executing.delete(promise);
      return result;
    });
    executing.add(promise);
    results.push(promise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(results);
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Generate a random ID
 */
export function generateId(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Slugify a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate a string to a specified length
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
}

// ============================================================================
// API Utilities
// ============================================================================

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    data,
    success: true,
    message,
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse<T>(
  errors: Array<{ code: string; message: string; field?: string }>
): ApiResponse<T> {
  return {
    data: {} as T,
    success: false,
    errors,
  };
}

/**
 * Build query string from filters object
 */
export function buildQueryString(filters: SearchFilters): string {
  const params = new URLSearchParams();
  
  if (filters.query) params.append('query', filters.query);
  if (filters.tags) params.append('tags', filters.tags.join(','));
  if (filters.collections) params.append('collections', filters.collections.join(','));
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom.toISOString());
  if (filters.dateTo) params.append('dateTo', filters.dateTo.toISOString());
  if (filters.minSize) params.append('minSize', filters.minSize.toString());
  if (filters.maxSize) params.append('maxSize', filters.maxSize.toString());
  if (filters.formats) params.append('formats', filters.formats.join(','));
  if (filters.hasFaces) params.append('hasFaces', 'true');
  if (filters.hasObjects) params.append('hasObjects', 'true');
  if (filters.hasText) params.append('hasText', 'true');
  if (filters.minConfidence) params.append('minConfidence', filters.minConfidence.toString());
  
  return params.toString();
}
