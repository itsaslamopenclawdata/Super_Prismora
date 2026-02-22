import React from 'react';
import { cn } from '../utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centerContent?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

const paddingStyles = {
  none: '',
  sm: 'px-4 py-2',
  md: 'px-4 py-4 sm:px-6 sm:py-6',
  lg: 'px-4 py-6 sm:px-8 sm:py-8',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', centerContent = false, padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'w-full mx-auto',
          sizeStyles[size],
          paddingStyles[padding],
          centerContent && 'flex items-center justify-center',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';
