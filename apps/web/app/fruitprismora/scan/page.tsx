'use client';

import { useState } from 'react';
import { PhotoCapture } from '@super_prismora/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { useRouter } from 'next/navigation';

export default function FruitPrismoraScanPage() {
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
        router.push(`/fruitprismora/results/${data.photo.id}`);
      }
    } catch (error) {
      console.error('Error analyzing fruit:', error);
      alert('Failed to analyze fruit. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-yellow-950 dark:via-gray-900 dark:to-red-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-2xl mb-4">
            <span className="text-3xl">🍎</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent mb-2">
            FruitPrismora
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Identify fruits and assess ripeness instantly
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Fruit</CardTitle>
            <CardDescription>
              Upload a photo to identify fruit type and check ripeness level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoCapture
              onCapture={handleCapture}
              aspectRatio="1:1"
              overlay="circular"
              className="w-full"
            />

            {isAnalyzing && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                    Analyzing fruit...
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
                <li>• Use natural light for accurate color assessment</li>
                <li>• Show the entire fruit for proper identification</li>
                <li>• Include any stem or calyx for better accuracy</li>
                <li>• Clean the fruit surface before scanning</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-yellow-600">500+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Fruit Varieties</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-red-600">98%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ripeness Accuracy</div>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-green-600">&lt;3s</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Analysis Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
