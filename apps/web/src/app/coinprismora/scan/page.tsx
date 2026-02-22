'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoCapture from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@super-prismora/ui';

export default function CoinPrismoraScan() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleCapture = async (file: File) => {
    setIsAnalyzing(true);

    // Create form data with the image
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'coin');

    try {
      // Call the backend AI identification service
      const response = await fetch('/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Identification failed');
      }

      const result = await response.json();

      // Store result in sessionStorage for the result page
      sessionStorage.setItem('coinIdentificationResult', JSON.stringify({
        ...result,
        imageUrl: URL.createObjectURL(file),
      }));

      // Navigate to result page
      router.push('/coinprismora/result');
    } catch (error) {
      console.error('Identification error:', error);
      // For demo purposes, simulate a result
      const mockResult = {
        id: `coin-${Date.now()}`,
        name: '1992 Lincoln Cent',
        type: 'coin',
        confidence: 87.5,
        imageUrl: URL.createObjectURL(file),
        details: {
          year: '1992',
          mintMark: 'P',
          composition: 'Copper-plated Zinc',
          weight: '2.5g',
          diameter: '19.05mm',
          description: 'The Lincoln Cent is a one-cent coin that has been struck by the United States Mint since 1909.',
          estimatedValue: '$0.05 - $2.00'
        },
        alternativeMatches: [
          { name: '1992 Lincoln Cent (Close AM)', confidence: 8.2 },
          { name: '1992-S Proof Lincoln Cent', confidence: 3.1 },
        ]
      };

      sessionStorage.setItem('coinIdentificationResult', JSON.stringify(mockResult));
      router.push('/coinprismora/result');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-amber-400 dark:to-yellow-400 mb-4">
            CoinPrismora
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Identify and value your coin collection with AI
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Scan Your Coin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Photo Capture */}
              {!isAnalyzing ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Use your camera or upload a clear photo of your coin
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                      Tips: Ensure good lighting, focus clearly on the coin face
                    </p>
                  </div>
                  <PhotoCapture
                    onCapture={handleCapture}
                    aspectRatio="1:1"
                    overlay="circular"
                    className="w-full"
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 mb-4 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                    Analyzing your coin...
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                    This may take a few seconds
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Instant ID</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get instant coin identification with confidence scores
            </p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Value Estimates</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              See estimated market values for your coins
            </p>
          </div>
          <div className="bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-200">Portfolio</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Build and track your coin collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
