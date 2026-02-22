import React from 'react';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
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

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title = 'No items found',
  description = 'There are no items to display at this time.',
  action,
  variant = 'default',
  size = 'md',
  className,
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
        {icon && <span className={iconSizeStyles[size]}>{icon}</span>}
        {title && <p className={cn('text-neutral-700', titleSizeStyles[size])}>{title}</p>}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center gap-3 text-center p-4', className)}>
        {icon && <span className={iconSizeStyles[size]}>{icon}</span>}
        {title && <p className={cn('font-medium text-neutral-900', titleSizeStyles[size])}>{title}</p>}
        {description && <p className="text-sm text-neutral-500">{description}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'bg-white rounded-lg',
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
        <h3 className={cn('font-semibold text-neutral-900 mb-2', titleSizeStyles[size])}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-neutral-500 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
};
