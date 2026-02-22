'use client';

import React, { useState } from 'react';
import { PhotoCapture } from '@photoidentifier/ui';
import { useRouter } from 'next/navigation';

export default function MycoSafePage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'mushroom');

      const response = await fetch('/api/identify/mushroom', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to identify mushroom');
      }

      const result = await response.json();
      sessionStorage.setItem('mycosafe_result', JSON.stringify(result));

      router.push('/mycosafe/result');
    } catch (error) {
      console.error('Identification error:', error);
      alert('Failed to identify mushroom. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 dark:bg-amber-900 rounded-full">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 text-transparent bg-clip-text">
            MycoSafe
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
            Mushroom Identification - Safety Critical
          </p>
          <div className="max-w-2xl mx-auto bg-error-50 dark:bg-error-950 border border-error-200 dark:border-error-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-error-600 dark:text-error-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-left">
                <p className="font-semibold text-error-900 dark:text-error-100 mb-1">
                  ⚠️ IMPORTANT SAFETY WARNING
                </p>
                <p className="text-sm text-error-800 dark:text-error-200">
                  Never eat any mushroom based solely on this app's identification. Some deadly mushrooms look very similar to edible ones. Always consult a professional mycologist before consuming any wild mushroom.
                </p>
              </div>
            </div>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 dark:bg-amber-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Mushroom</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Safety analysis in progress...
                </p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-600 h-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '70%' }}></div>
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

        {/* Safety Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-semibold">Safety First</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Toxicity analysis with clear safety warnings
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-warning-600 dark:text-warning-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold">Lookalikes</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Identifies similar species that may be dangerous
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-info-100 dark:bg-info-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-info-600 dark:text-info-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Expert Advice</h3>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Always verify with a professional mycologist
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
