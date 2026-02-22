import React from 'react';
import { cn } from '../utils/cn';

export interface LocationBadgeProps {
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  onMapClick?: () => void;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  location,
  coordinates,
  onMapClick,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className,
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-neutral-600', className)}>
        {showIcon && <span>📍</span>}
        <span className={sizeStyles[size].split(' ')[0]}>{location}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={onMapClick}
        className={cn(
          'inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200',
          'rounded-full transition-colors',
          'text-neutral-700',
          sizeStyles[size],
          className
        )}
        disabled={!onMapClick}
      >
        {showIcon && <span>📍</span>}
        <span className="truncate max-w-[200px]">{location}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-lg shadow-sm',
        sizeStyles[size],
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0">📍</span>}
      <span className="flex-1 min-w-0 truncate">{location}</span>
      {coordinates && onMapClick && (
        <button
          onClick={onMapClick}
          className={cn(
            'flex-shrink-0 text-primary-600 hover:text-primary-700',
            'hover:bg-primary-50 px-2 py-0.5 rounded transition-colors',
            'text-xs font-medium'
          )}
        >
          View Map
        </button>
      )}
    </div>
  );
};
