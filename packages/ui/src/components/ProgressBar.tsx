import React from 'react';
import { cn } from '../utils/cn';

export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-neutral-200',
  success: 'bg-success-200',
  warning: 'bg-warning-200',
  error: 'bg-error-200',
  primary: 'bg-primary-200',
  secondary: 'bg-secondary-200',
};

const fillVariantStyles = {
  default: 'bg-neutral-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showLabel) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-neutral-700">{label}</span>}
          {showLabel && (
            <span className="text-sm text-neutral-600">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          variantStyles[variant],
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            fillVariantStyles[variant],
            striped && 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]',
            animated && 'animate-[stripes_1s_linear_infinite]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
