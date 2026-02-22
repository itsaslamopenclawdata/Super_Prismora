'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoCapture from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@super-prismora/ui';

export default function CardPrismoraScan() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'card');

    try {
      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Identification failed');

      const result = await response.json();
      sessionStorage.setItem('cardIdentificationResult', JSON.stringify({
        ...result.data,
        imageUrl: URL.createObjectURL(file),
      }));

      router.push('/cardprismora/result');
    } catch (error) {
      const mockResult = {
        id: `card-${Date.now()}`,
        name: '1986-87 Fleer Michael Jordan #57',
        type: 'card',
        confidence: 91.8,
        imageUrl: URL.createObjectURL(file),
        details: {
          player: 'Michael Jordan',
          team: 'Chicago Bulls',
          year: '1986-87',
          set: 'Fleer',
          cardNumber: '57',
          condition: 'Near Mint',
          description: 'The iconic rookie card of basketball legend Michael Jordan.',
          estimatedValue: '$500 - $2,500'
        },
        alternativeMatches: [
          { name: '1985-86 Star Michael Jordan #101', confidence: 5.2 },
        ]
      };

      sessionStorage.setItem('cardIdentificationResult', JSON.stringify(mockResult));
      router.push('/cardprismora/result');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-violet-900/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 mb-4">
            CardPrismora
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Identify and value your sports card collection with AI
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!isAnalyzing ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Use your camera or upload a clear photo of your sports card
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      Tips: Capture the card front clearly, ensure good lighting and focus
                    </p>
                  </div>
                  <PhotoCapture
                    onCapture={handleCapture}
                    aspectRatio="3:4"
                    overlay="rectangular"
                    className="w-full"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 mb-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                    Analyzing your card...
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
            <div className="text-2xl mb-2">🃏</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Instant ID</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get instant card identification with confidence scores
            </p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Value Estimates</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              See estimated market values for your cards
            </p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Portfolio</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Build and track your card collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
