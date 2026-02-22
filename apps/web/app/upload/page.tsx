'use client';

import { useState, useCallback } from 'react';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
          Upload Photos
        </h1>

        <div className="mb-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
              ${isDragging
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800'
              }
            `}
          >
            <input
              type="file"
              id="file-input"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="text-6xl mb-4">☁️</div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
                {isDragging ? 'Drop your photos here' : 'Drag & Drop Photos'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                or click to browse
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Supports: JPEG, PNG, WebP, GIF, TIFF, HEIC
              </p>
            </label>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">
              {uploadedFiles.length} {uploadedFiles.length === 1 ? 'File' : 'Files'} Selected
            </h2>
            <div className="space-y-3 mb-6">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="text-error-500 hover:text-error-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors">
                Upload All
              </button>
              <button
                onClick={() => setUploadedFiles([])}
                className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
