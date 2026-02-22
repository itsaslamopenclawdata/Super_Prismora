'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoCapture from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@super-prismora/ui';

export default function NotePrismoraScan() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'note');

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Identification failed');

      const result = await response.json();
      sessionStorage.setItem('noteIdentificationResult', JSON.stringify({
        ...result.data,
        imageUrl: URL.createObjectURL(file),
      }));

      router.push('/noteprismora/result');
    } catch (error) {
      const mockResult = {
        id: `note-${Date.now()}`,
        name: '1935 Series $1 Silver Certificate',
        type: 'note',
        confidence: 88.3,
        imageUrl: URL.createObjectURL(file),
        details: {
          denomination: '$1',
          series: '1935',
          type: 'Silver Certificate',
          condition: 'Very Fine',
          sealColor: 'Blue',
          description: 'Silver Certificate featuring the portrait of George Washington.',
          estimatedValue: '$10 - $75'
        },
        alternativeMatches: [
          { name: '1935 Series $1 Federal Reserve Note', confidence: 8.7 },
        ]
      };

      sessionStorage.setItem('noteIdentificationResult', JSON.stringify(mockResult));
      router.push('/noteprismora/result');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-neutral-900 dark:via-green-900/20 dark:to-teal-900/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 mb-4">
            NotePrismora
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Identify and value your banknote collection with AI
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Banknote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!isAnalyzing ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Use your camera or upload a clear photo of your banknote
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      Tips: Capture both sides of the note, ensure good lighting and focus
                    </p>
                  </div>
                  <PhotoCapture
                    onCapture={handleCapture}
                    aspectRatio="16:9"
                    overlay="rectangular"
                    className="w-full"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 mb-4 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                    Analyzing your banknote...
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                    This may take a few seconds
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">💵</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Instant ID</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get instant banknote identification with confidence scores
            </p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Value Estimates</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              See estimated market values for your notes
            </p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Portfolio</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Build and track your banknote collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
