'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoCapture } from '@super-prismora/ui';

export default function VehicleScanPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsProcessing(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('app_type', 'vehicle');

      // Upload photo and get identification
      const response = await fetch('/api/identify/vehicle', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify vehicle');
      }

      const data = await response.json();

      // Redirect to result page
      router.push(`/vehicleprismora/result/${data.identification_id}`);
    } catch (error) {
      console.error('Error identifying vehicle:', error);
      alert('Failed to identify vehicle. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                VehiclePrismora
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Vehicle Identification
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            How to Identify a Vehicle
          </h2>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Take a clear photo of the vehicle's front or side view</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Ensure good lighting and minimal glare on windows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Show the grille, headlights, and distinctive features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>For best results, capture the entire vehicle profile</span>
            </li>
          </ul>
        </div>

        {/* Photo Capture */}
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
              Analyzing vehicle...
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              This may take a few seconds
            </p>
          </div>
        ) : (
          <PhotoCapture
            onCapture={handleCapture}
            onCancel={handleCancel}
            aspectRatio="16:9"
            overlay="rectangular"
            defaultMode="upload"
            className="max-w-2xl mx-auto"
          />
        )}

        {/* Tips */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">🚗</div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Any Vehicle Type
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identify cars, trucks, SUVs, motorcycles, and more
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Detailed Specs
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get engine, performance, and fuel economy data
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Vehicle History
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Learn about production years and notable features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
