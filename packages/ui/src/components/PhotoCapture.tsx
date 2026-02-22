import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '../utils/cn';

export type OverlayType = 'circular' | 'rectangular' | 'freeform' | null;

export interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:4' | '9:16';
  overlay?: OverlayType;
  defaultMode?: 'camera' | 'upload';
  className?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onCapture,
  onCancel,
  aspectRatio = '4:3',
  overlay = null,
  defaultMode = 'upload',
  className,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>(defaultMode);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aspect ratio dimensions
  const aspectRatioDimensions = {
    '1:1': { width: 400, height: 400 },
    '4:3': { width: 640, height: 480 },
    '16:9': { width: 640, height: 360 },
    '3:4': { width: 360, height: 480 },
    '9:16': { width: 360, height: 640 },
  };

  const dimensions = aspectRatioDimensions[aspectRatio];

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start camera when camera mode is activated
  useEffect(() => {
    if (mode === 'camera' && !capturedImage) {
      startCamera();
    }
    return () => {
      if (mode === 'camera') {
        stopCamera();
      }
    };
  }, [mode, capturedImage, startCamera, stopCamera]);

  // Compress image to max 1024px width
  const compressImage = useCallback(
    async (file: File): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale down if width > 1024px
          if (width > 1024) {
            const scale = 1024 / width;
            width = 1024;
            height = height * scale;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              'image/jpeg',
              0.85
            );
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  // Capture photo from camera
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply flash effect if on
    if (isFlashOn) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw video frame centered and scaled
    const videoRatio = video.videoWidth / video.videoHeight;
    const targetRatio = dimensions.width / dimensions.height;
    let drawWidth, drawHeight, drawX, drawY;

    if (videoRatio > targetRatio) {
      drawHeight = dimensions.height;
      drawWidth = drawHeight * videoRatio;
      drawX = (dimensions.width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = dimensions.width;
      drawHeight = drawWidth / videoRatio;
      drawX = 0;
      drawY = (dimensions.height - drawHeight) / 2;
    }

    ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);

    // Convert to blob
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          setCapturedImage(URL.createObjectURL(blob));
          stopCamera();
        }
        setIsCapturing(false);
      },
      'image/jpeg',
      0.95
    );
  }, [dimensions, isFlashOn, stopCamera]);

  // Validate uploaded file
  const validateFile = useCallback((file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, HEIC, or WebP.');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit.');
      return false;
    }

    setError(null);
    return true;
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      try {
        const compressed = await compressImage(file);
        const processedFile = new File([compressed], file.name, {
          type: 'image/jpeg',
        });
        setCapturedImage(URL.createObjectURL(compressed));
      } catch (err) {
        setError('Failed to process image.');
        console.error('Upload error:', err);
      }
    },
    [validateFile, compressImage]
  );

  // Handle file input change
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  // Confirm captured/uploaded image
  const handleConfirm = useCallback(async () => {
    if (capturedImage) {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      onCapture(file);
    }
  }, [capturedImage, onCapture]);

  // Retake photo or clear upload
  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    if (mode === 'camera') {
      startCamera();
    }
  }, [mode, startCamera]);

  // Switch mode
  const handleModeSwitch = useCallback(
    (newMode: 'camera' | 'upload') => {
      if (mode === 'camera' && newMode === 'upload') {
        stopCamera();
      }
      setMode(newMode);
      setCapturedImage(null);
      setError(null);
    },
    [mode, stopCamera]
  );

  // Render overlay based on type
  const renderOverlay = () => {
    if (!overlay) return null;

    const overlayStyles = cn('absolute border-4 border-white pointer-events-none z-10', {
      'rounded-full': overlay === 'circular',
      'rounded-lg': overlay === 'rectangular' || overlay === 'freeform',
    });

    if (overlay === 'freeform') {
      return (
        <div
          className={overlayStyles}
          style={{
            width: dimensions.width * 0.7,
            height: dimensions.height * 0.7,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          }}
        />
      );
    }

    return (
      <div
        className={overlayStyles}
        style={{
          width: overlay === 'circular' ? dimensions.height * 0.8 : dimensions.width * 0.9,
          height: overlay === 'circular' ? dimensions.height * 0.8 : dimensions.height * 0.9,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  };

  // If captured image is ready, show preview
  if (capturedImage) {
    return (
      <div className={cn('w-full', className)}>
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-auto object-contain max-h-[500px] mx-auto"
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleRetake}
            className="flex-1 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg font-medium transition-colors"
          >
            Retake
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            Confirm
          </button>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-3 w-full px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  // Show camera mode
  if (mode === 'camera') {
    return (
      <div className={cn('w-full', className)}>
        {/* Mode toggle */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleModeSwitch('camera')}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
              mode === 'camera'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            )}
          >
            Camera
          </button>
          <button
            onClick={() => handleModeSwitch('upload')}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
              mode === 'upload'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            )}
          >
            Upload
          </button>
        </div>

        {/* Camera viewfinder */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: `${dimensions.width}/${dimensions.height}` }}>
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 mb-2 text-neutral-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-neutral-400">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Overlay */}
          {renderOverlay()}

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              {/* Flash toggle */}
              <button
                onClick={() => setIsFlashOn(!isFlashOn)}
                className={cn(
                  'p-3 rounded-full transition-colors',
                  isFlashOn ? 'bg-white text-black' : 'bg-black/50 text-white'
                )}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </button>

              {/* Capture button */}
              <button
                onClick={capturePhoto}
                disabled={!stream || isCapturing}
                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 bg-white rounded-full mx-auto mt-2" />
              </button>

              {/* Cancel button */}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-error-50 border border-error-200 text-error-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Show upload mode
  return (
    <div className={cn('w-full', className)}>
      {/* Mode toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => handleModeSwitch('camera')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
            mode === 'camera'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
          )}
        >
          Camera
        </button>
        <button
          onClick={() => handleModeSwitch('upload')}
          className={cn(
            'flex-1 px-4 py-2 rounded-lg font-medium transition-colors',
            mode === 'upload'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
          )}
        >
          Upload
        </button>
      </div>

      {/* Upload area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
          'flex flex-col items-center justify-center p-12',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
        )}
        style={{ minHeight: '300px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

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

        <p className="text-base font-medium text-neutral-700 mb-2">
          Drop your image here, or click to browse
        </p>
        <p className="text-sm text-neutral-500 mb-1">
          Supports: JPEG, PNG, HEIC, WebP
        </p>
        <p className="text-sm text-neutral-500">
          Maximum file size: 10MB
        </p>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-error-50 border border-error-200 text-error-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 w-full px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
};
