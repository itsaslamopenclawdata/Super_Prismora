'use client';

import React, { useState } from 'react';
import { PhotoCapture } from '@photoidentifier/ui';
import { useRouter } from 'next/navigation';

export default function FloraPrismoraPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    try {
      // Create FormData for API upload
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'plant');

      // Call the AI gateway for plant identification
      const response = await fetch('/api/identify/plant', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify plant');
      }

      const result = await response.json();

      // Store result in sessionStorage for the result page
      sessionStorage.setItem('floraprismora_result', JSON.stringify(result));

      // Navigate to result page
      router.push('/floraprismora/result');
    } catch (error) {
      console.error('Identification error:', error);
      alert('Failed to identify plant. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 dark:bg-green-900 rounded-full">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
            FloraPrismora
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Identify any plant instantly with AI
          </p>
        </div>

        {isAnalyzing ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 dark:bg-green-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Plant</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Our AI is examining your plant...
                </p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-600 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <PhotoCapture
              onCapture={handleCapture}
              aspectRatio="4:3"
              defaultMode="camera"
            />
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Instant ID</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identify plants in seconds with our AI
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-semibold">Care Tips</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get watering, light, and care instructions
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold">My Garden</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Track and manage your plant collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
