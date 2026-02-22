import React from 'react';
import { cn } from '../utils/cn';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  info: {
    container: 'bg-info-50 border-info-200',
    icon: 'text-info-500',
    title: 'text-info-800',
    description: 'text-info-700',
  },
  success: {
    container: 'bg-success-50 border-success-200',
    icon: 'text-success-500',
    title: 'text-success-800',
    description: 'text-success-700',
  },
  warning: {
    container: 'bg-warning-50 border-warning-200',
    icon: 'text-warning-500',
    title: 'text-warning-800',
    description: 'text-warning-700',
  },
  error: {
    container: 'bg-error-50 border-error-200',
    icon: 'text-error-500',
    title: 'text-error-800',
    description: 'text-error-700',
  },
};

const icons = {
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'info',
      title,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'border rounded-lg p-4',
          styles.container,
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${styles.icon}`}>{icons[variant]}</div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
            )}
            <div className={`text-sm ${title ? 'mt-1' : ''} ${styles.description}`}>
              {children}
            </div>
          </div>
          {dismissible && (
            <button
              onClick={onDismiss}
              className={`flex-shrink-0 ml-3 ${styles.icon} hover:opacity-75 transition-opacity`}
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
