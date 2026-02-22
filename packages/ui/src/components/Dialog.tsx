import React from 'react';
import { cn } from '../utils/cn';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-5xl',
};

const positionStyles = {
  center: 'items-center',
  top: 'items-start pt-16',
  bottom: 'items-end pb-8',
};

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  position = 'center',
  size = 'md',
  className,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-modal-backdrop flex p-4',
        positionStyles[position]
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative bg-white rounded-lg shadow-2xl w-full',
          sizeStyles[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className,
}) => {
  return (
    <h2 className={cn('text-lg font-semibold text-neutral-900', className)}>
      {children}
    </h2>
  );
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className,
}) => {
  return (
    <p className={cn('text-sm text-neutral-500', className)}>
      {children}
    </p>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
}) => {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
};

export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  className,
  align = 'right',
}) => {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    'space-between': 'justify-between',
  };

  return (
    <div className={cn('flex items-center p-6 pt-0', alignStyles[align], className)}>
      {children}
    </div>
  );
};
