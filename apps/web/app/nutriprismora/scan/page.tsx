'use client';

import { useState } from 'react';
import { PhotoCapture } from '@super_prismora/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { useRouter } from 'next/navigation';

export default function NutriPrismoraScanPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = async (file: File) => {
    setCapturedImage(URL.createObjectURL(file));
    setIsAnalyzing(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload and analyze the image
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();

      // Redirect to results page with the photo ID
      if (data.photo?.id) {
        router.push(`/nutriprismora/results/${data.photo.id}`);
      }
    } catch (error) {
      console.error('Error analyzing food:', error);
      alert('Failed to analyze food. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-green-950 dark:via-gray-900 dark:to-orange-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-orange-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent mb-2">
            NutriPrismora
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Snap a photo of your food and get instant nutritional information
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Food</CardTitle>
            <CardDescription>
              Upload a photo or use your camera to identify food and track nutrition
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
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Analyzing your food...
                  </span>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                💡 Tips for Best Results
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Ensure good lighting when capturing</li>
                <li>• Show the entire meal or food item</li>
                <li>• Use a plain background if possible</li>
                <li>• Include serving size reference (e.g., a standard plate)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-green-600">24k+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Foods Database</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-orange-600">95%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-blue-600">&lt;2s</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Analysis Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
