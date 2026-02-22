import React from 'react';
import { cn } from '../utils/cn';

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  error?: Error | string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'p-4',
  md: 'p-8',
  lg: 'p-12',
};

const iconSizeStyles = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
};

const titleSizeStyles = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon = '❌',
  title = 'Something went wrong',
  description = 'An error occurred while processing your request.',
  error,
  action,
  variant = 'default',
  size = 'md',
  showDetails = false,
  className,
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
        {icon && <span className={iconSizeStyles[size]}>{icon}</span>}
        {title && <p className={cn('text-error-600', titleSizeStyles[size])}>{title}</p>}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center gap-3 text-center p-4', className)}>
        {icon && <span className={iconSizeStyles[size]}>{icon}</span>}
        {title && <p className={cn('font-medium text-error-600', titleSizeStyles[size])}>{title}</p>}
        {errorMessage && showDetails && <p className="text-xs text-neutral-500 max-w-md">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'bg-error-50 rounded-lg border border-error-200',
        sizeStyles[size],
        className
      )}
    >
      {icon && (
        <div className={iconSizeStyles[size]} mb-4 opacity-70">
          {icon}
        </div>
      )}
      {title && (
        <h3 className={cn('font-semibold text-error-900 mb-2', titleSizeStyles[size])}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-error-700 mb-2 max-w-sm">
          {description}
        </p>
      )}
      {errorMessage && showDetails && (
        <div className="bg-white rounded border border-error-200 p-3 mb-4 max-w-md">
          <p className="text-xs text-neutral-600 font-mono break-all">
            {errorMessage}
          </p>
        </div>
      )}
      {action}
    </div>
  );
};
