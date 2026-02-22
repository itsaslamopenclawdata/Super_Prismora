import React from 'react';
import { cn } from '../utils/cn';

export interface OverlayProps {
  isOpen: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  variant?: 'default' | 'dark' | 'light' | 'blur';
  className?: string;
  closeOnClick?: boolean;
}

const variantStyles = {
  default: 'bg-black bg-opacity-50',
  dark: 'bg-black bg-opacity-75',
  light: 'bg-white bg-opacity-90',
  blur: 'bg-black bg-opacity-30 backdrop-blur-md',
};

export const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  children,
  variant = 'default',
  className,
  closeOnClick = true,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-modal-backdrop',
        variantStyles[variant],
        'transition-opacity',
        className
      )}
      onClick={closeOnClick ? onClose : undefined}
      aria-hidden="true"
    >
      {children}
    </div>
  );
};
