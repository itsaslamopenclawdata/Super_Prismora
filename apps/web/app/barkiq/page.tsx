'use client';

import React, { useState } from 'react';
import { PhotoCapture } from '@photoidentifier/ui';
import { useRouter } from 'next/navigation';

export default function BarkIQPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'dog');

      const response = await fetch('/api/identify/dog', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify dog breed');
      }

      const result = await response.json();
      sessionStorage.setItem('barkiq_result', JSON.stringify(result));

      router.push('/barkiq/result');
    } catch (error) {
      console.error('Identification error:', error);
      alert('Failed to identify dog breed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-white dark:from-amber-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-200 dark:bg-amber-900 rounded-full">
            <svg className="w-8 h-8 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-700 text-transparent bg-clip-text">
            BarkIQ
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Identify dog breeds with AI
          </p>
        </div>

        {isAnalyzing ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-200 dark:bg-amber-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Dog</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Identifying breed...
                </p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-600 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
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
              <div className="w-10 h-10 bg-amber-200 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Accurate ID</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identify 190+ dog breeds
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-200 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-700 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold">Breed Info</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Learn breed traits & history
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-200 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-700 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Care Tips</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Grooming & exercise needs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
