import React from 'react';

export interface AvatarProps {
  /**
   * Avatar image source
   */
  src?: string;

  /**
   * Alt text for the image
   */
  alt?: string;

  /**
   * Initials to display when no image is provided
   */
  initials?: string;

  /**
   * Avatar size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Avatar Component
 *
 * A circular avatar component that displays an image or initials.
 */
export function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  // Display initials with a gradient background
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium ${className}`}
    >
      {initials || '?'}
    </div>
  );
}
