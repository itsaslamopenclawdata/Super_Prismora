import React from 'react';
import { cn } from '../utils/cn';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

const colsStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const gapStyles = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { className, cols = 1, gap = 'md', responsive = true, children, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsStyles[cols],
          gapStyles[gap],
          responsive && 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
