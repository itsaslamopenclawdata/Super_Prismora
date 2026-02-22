import React from 'react';
import { cn } from '../utils/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-white border-neutral-200',
  primary: 'bg-primary-50 border-primary-200',
  success: 'bg-success-50 border-success-200',
  warning: 'bg-warning-50 border-warning-200',
  error: 'bg-error-50 border-error-200',
};

const sizeStyles = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const textSizeStyles = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const getChangeColor = () => {
    if (changeType === 'increase') return 'text-success-600';
    if (changeType === 'decrease') return 'text-error-600';
    return 'text-neutral-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'increase') return '↑';
    if (changeType === 'decrease') return '↓';
    return '→';
  };

  return (
    <div
      className={cn(
        'border rounded-lg shadow-sm',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className={cn('font-bold text-neutral-900', textSizeStyles[size])}>
            {value}
          </p>
          {change !== undefined && (
            <p className={cn('text-sm mt-1', getChangeColor())}>
              {getChangeIcon()} {Math.abs(change)}%
              <span className="text-neutral-500 ml-1">from last period</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 bg-white bg-opacity-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
