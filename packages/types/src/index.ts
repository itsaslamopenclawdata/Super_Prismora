/**
 * PhotoIdentifier Platform Type Definitions
 * Shared types across the monorepo
 */

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  processingComplete: boolean;
  weeklySummary: boolean;
}

// ============================================================================
// Photo Types
// ============================================================================

export interface Photo {
  id: string;
  userId: string;
  filename: string;
  originalUrl: string;
  thumbnailUrl: string;
  size: number;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'heic';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  metadata: PhotoMetadata;
  identifications: PhotoIdentification[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface PhotoMetadata {
  exif?: {
    cameraMake?: string;
    cameraModel?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    gps?: {
      latitude: number;
      longitude: number;
      altitude?: number;
    };
    dateTime?: Date;
  };
  colorProfile?: string;
  hasAlphaChannel: boolean;
  orientation: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

export interface PhotoIdentification {
  id: string;
  photoId: string;
  model: string;
  confidence: number;
  labels: IdentificationLabel[];
  objects: IdentifiedObject[];
  faces?: IdentifiedFace[];
  text?: ExtractedText;
  generatedAt: Date;
}

export interface IdentificationLabel {
  label: string;
  confidence: number;
  category: string;
}

export interface IdentifiedObject {
  id: string;
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  attributes?: Record<string, string>;
}

export interface IdentifiedFace {
  id: string;
  confidence: number;
  boundingBox: BoundingBox;
  emotions?: FaceEmotions;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
}

export interface FaceEmotions {
  happy: number;
  sad: number;
  angry: number;
  surprised: number;
  neutral: number;
  fearful: number;
  disgusted: number;
}

export interface ExtractedText {
  text: string;
  confidence: number;
  regions: TextRegion[];
}

export interface TextRegion {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// Collection Types
// ============================================================================

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchFilters {
  query?: string;
  tags?: string[];
  collections?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  minSize?: number;
  maxSize?: number;
  formats?: Photo['format'][];
  hasFaces?: boolean;
  hasObjects?: boolean;
  hasText?: boolean;
  minConfidence?: number;
}

export interface SearchResult {
  photos: Photo[];
  total: number;
  page: number;
  pageSize: number;
  facets: SearchFacets;
}

export interface SearchFacets {
  tags: { tag: string; count: number }[];
  formats: { format: Photo['format']; count: number }[];
  years: { year: number; count: number }[];
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Event Types
// ============================================================================

export interface PhotoUploadedEvent {
  type: 'photo.uploaded';
  photoId: string;
  userId: string;
  timestamp: Date;
}

export interface PhotoProcessedEvent {
  type: 'photo.processed';
  photoId: string;
  userId: string;
  identifications: PhotoIdentification[];
  timestamp: Date;
}

export interface PhotoErrorEvent {
  type: 'photo.error';
  photoId: string;
  userId: string;
  error: string;
  timestamp: Date;
}

export type PlatformEvent = PhotoUploadedEvent | PhotoProcessedEvent | PhotoErrorEvent;

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
