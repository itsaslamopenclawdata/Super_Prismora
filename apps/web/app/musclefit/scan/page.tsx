'use client';

import { useState } from 'react';
import { PhotoCapture } from '@super_prismora/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { useRouter } from 'next/navigation';

export default function MuscleFitScanPage() {
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
        router.push(`/musclefit/results/${data.photo.id}`);
      }
    } catch (error) {
      console.error('Error analyzing exercise:', error);
      alert('Failed to analyze exercise. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-black dark:from-red-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-black rounded-2xl mb-4">
            <span className="text-3xl">💪</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-900 bg-clip-text text-transparent mb-2">
            MuscleFit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Advanced fitness for serious muscle building
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Exercise</CardTitle>
            <CardDescription>
              Upload a photo to identify exercises, analyze form, and track muscle groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoCapture
              onCapture={handleCapture}
              aspectRatio="4:3"
              overlay="rectangular"
              className="w-full"
            />

            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    Analyzing exercise & muscles...
                  </span>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                💡 Tips for Advanced Analysis
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Show the full range of motion for accurate assessment</li>
                <li>• Capture from multiple angles if possible (front, side, back)</li>
                <li>• Ensure good lighting on muscle groups being worked</li>
                <li>• Use contrast with your background for better pose detection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-red-200 dark:border-red-800">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Muscle Mapping
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify targeted muscle groups
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-red-200 dark:border-red-800">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Form Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Detailed form analysis & feedback
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-red-200 dark:border-red-800">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
              Program Tracking
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track workout programs & progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
