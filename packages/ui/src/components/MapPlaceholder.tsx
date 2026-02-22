import React from 'react';
import { cn } from '../utils/cn';

export interface MapPlaceholderProps {
  width?: number | string;
  height?: number | string;
  title?: string;
  description?: string;
  showLocation?: boolean;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  interactive?: boolean;
  onInteractiveClick?: () => void;
  className?: string;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  width = '100%',
  height = 300,
  title = 'Map View',
  description = 'Interactive map will be displayed here',
  showLocation = true,
  location,
  coordinates,
  interactive = false,
  onInteractiveClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden',
        'border border-neutral-200',
        interactive && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      style={{ width, height }}
      onClick={interactive ? onInteractiveClick : undefined}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map Placeholder Icon */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 text-center">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 text-center max-w-md mb-4">
          {description}
        </p>
        {showLocation && location && (
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span>📍</span>
            <span className="text-sm font-medium text-neutral-700">
              {location}
            </span>
          </div>
        )}
        {showLocation && coordinates && (
          <div className="mt-2 text-xs text-neutral-500">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </div>
        )}
      </div>

      {/* Interactive Overlay */}
      {interactive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-5 transition-all">
          <div className="bg-white px-4 py-2 rounded-full shadow-md transform scale-95 opacity-0 hover:scale-100 hover:opacity-100 transition-all">
            <span className="text-sm font-medium text-primary-600">
              Click to view interactive map
            </span>
          </div>
        </div>
      )}

      {/* Corner Markers */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neutral-300" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neutral-300" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neutral-300" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neutral-300" />
    </div>
  );
};
