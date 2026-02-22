'use client';

import { useState } from 'react';
import { PhotoCapture } from '@super_prismora/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { useRouter } from 'next/navigation';

export default function LazyFitScanPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      if (data.photo?.id) {
        router.push(`/lazyfit/results/${data.photo.id}`);
      }
    } catch (error) {
      console.error('Error analyzing exercise:', error);
      alert('Failed to analyze exercise. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4">
            <span className="text-3xl">🧘</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            LazyFit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Beginner-friendly fitness with AI form analysis
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Exercise</CardTitle>
            <CardDescription>
              Upload a photo or use your camera to identify exercises and check your form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoCapture
              onCapture={handleCapture}
              aspectRatio="16:9"
              overlay="rectangular"
              className="w-full"
            />

            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Analyzing exercise form...
                  </span>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                💡 Tips for Best Form Analysis
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Show your full body or the exercise focus area</li>
                <li>• Ensure good lighting on your body</li>
                <li>• Wear fitted clothing for better joint visibility</li>
                <li>• Stand at an angle that shows your form clearly</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Form Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get instant feedback on your exercise form
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-3">🏋️</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Beginner Friendly
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Easy exercises with clear instructions
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your fitness journey over time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
