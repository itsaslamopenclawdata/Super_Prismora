import React from 'react';
import { cn } from '../utils/cn';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Identification {
  id: string;
  name: string;
  scientificName?: string;
  confidence: number;
  boundingBox?: BoundingBox;
  details?: Record<string, any>;
}

export interface IdentificationResultProps {
  identification: Identification;
  imageUrl?: string;
  showBoundingBox?: boolean;
  showDetails?: boolean;
  onDetailsClick?: () => void;
  className?: string;
  variant?: 'card' | 'list' | 'minimal';
}

export const IdentificationResult: React.FC<IdentificationResultProps> = ({
  identification,
  imageUrl,
  showBoundingBox = true,
  showDetails = true,
  onDetailsClick,
  className,
  variant = 'card',
}) => {
  const { id, name, scientificName, confidence, boundingBox, details } = identification;

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-success-500';
    if (confidence >= 75) return 'text-primary-500';
    if (confidence >= 50) return 'text-warning-500';
    return 'text-error-500';
  };

  const getConfidenceBg = (confidence: number): string => {
    if (confidence >= 90) return 'bg-success-500';
    if (confidence >= 75) return 'bg-primary-500';
    if (confidence >= 50) return 'bg-warning-500';
    return 'bg-error-500';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 90) return 'High';
    if (confidence >= 75) return 'Good';
    if (confidence >= 50) return 'Medium';
    return 'Low';
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-1">
          <div className="font-medium text-neutral-900">{name}</div>
          {scientificName && (
            <div className="text-xs text-neutral-500 italic">{scientificName}</div>
          )}
        </div>
        <div className={cn('text-lg font-bold', getConfidenceColor(confidence))}>
          {confidence.toFixed(1)}%
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div
        className={cn(
          'bg-white border rounded-lg p-4 hover:shadow-md transition-shadow',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {imageUrl && boundingBox && (
            <div className="flex-shrink-0 w-20 h-20 bg-neutral-100 rounded overflow-hidden">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">{name}</h3>
            {scientificName && (
              <p className="text-sm text-neutral-500 italic">{scientificName}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className={cn('text-lg font-bold', getConfidenceColor(confidence))}>
                {confidence.toFixed(1)}%
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  getConfidenceBg(confidence),
                  'text-white'
                )}
              >
                {getConfidenceLabel(confidence)}
              </span>
            </div>
          </div>
          {showDetails && details && (
            <button
              onClick={onDetailsClick}
              className="flex-shrink-0 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
            >
              Details
            </button>
          )}
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div
      className={cn(
        'bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      {imageUrl && (
        <div className="relative h-48 bg-neutral-100">
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          {showBoundingBox && boundingBox && (
            <div
              className="absolute border-2 border-primary-500 bg-primary-500/20"
              style={{
                left: `${(boundingBox.x / 100) * 100}%`,
                top: `${(boundingBox.y / 100) * 100}%`,
                width: `${(boundingBox.width / 100) * 100}%`,
                height: `${(boundingBox.height / 100) * 100}%`,
              }}
            />
          )}
          <div className="absolute top-2 right-2">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-bold text-white shadow',
                getConfidenceBg(confidence)
              )}
            >
              {confidence.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold text-neutral-900 mb-1">{name}</h3>
        {scientificName && (
          <p className="text-sm text-neutral-500 italic mb-3">{scientificName}</p>
        )}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', getConfidenceBg(confidence))}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className={cn('text-sm font-medium', getConfidenceColor(confidence))}>
            {getConfidenceLabel(confidence)}
          </span>
        </div>
        {showDetails && details && (
          <button
            onClick={onDetailsClick}
            className="w-full px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};
