'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoCapture } from '@super-prismora/ui';

export default function RockScanPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsProcessing(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('app_type', 'rock');

      // Upload photo and get identification
      const response = await fetch('/api/identify/rock', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify rock');
      }

      const data = await response.json();

      // Redirect to result page
      router.push(`/rockprismora/result/${data.identification_id}`);
    } catch (error) {
      console.error('Error identifying rock:', error);
      alert('Failed to identify rock. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                RockPrismora
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Rock & Mineral Identification
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">
            How to Identify a Rock or Mineral
          </h2>
          <ul className="space-y-2 text-amber-800 dark:text-amber-200">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Take a clear photo showing the rock's texture and color</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Use good lighting to highlight surface features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Capture any distinctive patterns, crystals, or fractures</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">•</span>
              <span>Include multiple angles if possible for better identification</span>
            </li>
          </ul>
        </div>

        {/* Photo Capture */}
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Analyzing rock/mineral...
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              This may take a few seconds
            </p>
          </div>
        ) : (
          <PhotoCapture
            onCapture={handleCapture}
            onCancel={handleCancel}
            aspectRatio="1:1"
            overlay="circular"
            defaultMode="upload"
            className="max-w-2xl mx-auto"
          />
        )}

        {/* Tips */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🪨</div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              All Rock Types
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identify igneous, sedimentary, and metamorphic rocks
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">💎</div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Mineral Details
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get hardness, luster, and chemical composition data
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🧪</div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Geological Info
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Learn about formation and occurrence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
