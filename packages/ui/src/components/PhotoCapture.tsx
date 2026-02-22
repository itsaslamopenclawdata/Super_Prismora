import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../utils/cn';

export interface PhotoCaptureProps {
  onCapture: (file: File, preview: string) => void;
  onClear?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  preview?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onCapture,
  onClear,
  accept = 'image/*',
  maxSize = 10,
  disabled = false,
  className,
  showPreview = true,
  preview: externalPreview,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(externalPreview || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    setError(null);
    return true;
  }, [maxSize]);

  const processFile = useCallback((file: File) => {
    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const previewUrl = reader.result as string;
      setPreview(previewUrl);
      onCapture(file, previewUrl);
    };
    reader.readAsDataURL(file);
  }, [onCapture, validateFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          'cursor-pointer',
          'flex flex-col items-center justify-center',
          disabled && 'cursor-not-allowed opacity-50',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50',
          preview && 'border-primary-500'
        )}
      >
        {showPreview && preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            {!disabled && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50 transition-colors"
                type="button"
              >
                <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 mb-4 text-neutral-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700 mb-1">
              Drop your image here, or click to browse
            </p>
            <p className="text-xs text-neutral-500">
              Supports: JPG, PNG, GIF (max {maxSize}MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-error-500">
          {error}
        </div>
      )}
    </div>
  );
};
