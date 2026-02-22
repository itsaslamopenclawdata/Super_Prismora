import React from 'react';
import { cn } from '../utils/cn';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bar';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const colorStyles = {
  primary: 'border-primary-600',
  secondary: 'border-secondary-600',
  success: 'border-success-600',
  warning: 'border-warning-600',
  error: 'border-error-600',
};

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'default',
  color = 'primary',
  text,
  className,
}) => {
  if (variant === 'default') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-transparent border-t-current',
            sizeStyles[size],
            colorStyles[color]
          )}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <p className="text-sm text-neutral-600">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)} role="status" aria-label="Loading">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              'rounded-full bg-current animate-bounce',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-3 h-3',
              size === 'xl' && 'w-4 h-4',
              colorStyles[color].replace('border-', 'bg-'),
              'animation-delay-0'
            )}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
        {text && (
          <span className="ml-2 text-sm text-neutral-600">{text}</span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)} role="status" aria-label="Loading">
        <div
          className={cn(
            'rounded-full animate-pulse',
            sizeStyles[size],
            colorStyles[color].replace('border-', 'bg-')
          )}
        />
        {text && (
          <p className="text-sm text-neutral-600">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'bar') {
    return (
      <div className={cn('flex flex-col items-center gap-3 w-full max-w-xs', className)} role="status" aria-label="Loading">
        <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full animate-[loading_2s_ease-in-out_infinite]',
              colorStyles[color].replace('border-', 'bg-')
            )}
            style={{ width: '30%' }}
          />
        </div>
        {text && (
          <p className="text-sm text-neutral-600">{text}</p>
        )}
      </div>
    );
  }

  return null;
};
