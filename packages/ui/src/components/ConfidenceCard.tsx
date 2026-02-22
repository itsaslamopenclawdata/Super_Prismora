import React from 'react';
import { cn } from '../utils/cn';

export interface ConfidenceCardProps {
  confidence: number; // 0-100
  label?: string;
  showValue?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

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

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  confidence,
  label,
  showValue = true,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const colorClass = getConfidenceColor(confidence);
  const bgClass = getConfidenceBg(confidence);
  const labelText = getConfidenceLabel(confidence);

  if (variant === 'minimal') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div className={cn('text-sm font-medium', colorClass)}>
          {confidence.toFixed(1)}%
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <div
          className={cn('h-2 rounded-full transition-all duration-500', bgClass)}
          style={{ width: `${confidence}%`, maxWidth: size === 'sm' ? '60px' : '100px' }}
        />
        {showValue && (
          <span className={cn('text-sm font-medium', colorClass)}>
            {confidence.toFixed(1)}%
          </span>
        )}
      </div>
    );
  }

  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const textStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className={cn(
        'bg-white border rounded-lg shadow-sm',
        sizeStyles[size],
        className
      )}
    >
      {label && (
        <div className={cn('text-neutral-500 mb-2', textStyles[size])}>{label}</div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={cn('text-2xl font-bold', colorClass)}>
              {confidence.toFixed(1)}%
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                bgClass,
                'text-white'
              )}
            >
              {labelText}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', bgClass)}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
