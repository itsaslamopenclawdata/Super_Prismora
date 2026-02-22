'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard, Badge, Button, Card } from '@photoidentifier/ui';

interface PlantIdentification {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  careTips: {
    water: string;
    light: string;
    soil: string;
    temperature: string;
  };
  isToxic: boolean;
  imageUrl?: string;
}

export default function FloraPrismoraResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<PlantIdentification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load result from sessionStorage
    const storedResult = sessionStorage.getItem('floraprismora_result');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Use demo data if no result available
      setResult({
        id: 'demo-plant-1',
        name: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        confidence: 94.5,
        description: 'A popular tropical houseplant known for its distinctive split leaves. Native to Central American rainforests, it thrives in indirect light and humid conditions.',
        careTips: {
          water: 'Water every 1-2 weeks, allowing soil to dry between waterings',
          light: 'Bright, indirect light. Can tolerate lower light',
          soil: 'Well-draining potting mix with perlite',
          temperature: '65°F - 85°F (18°C - 29°C)'
        },
        isToxic: true
      });
    }
    setLoading(false);
  }, []);

  const handleSaveToGarden = () => {
    if (!result) return;

    // Get existing garden or initialize
    const existingGarden = JSON.parse(localStorage.getItem('floraprismora_garden') || '[]');
    existingGarden.push({
      ...result,
      addedAt: new Date().toISOString()
    });
    localStorage.setItem('floraprismora_garden', JSON.stringify(existingGarden));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleIdentifyAnother = () => {
    sessionStorage.removeItem('floraprismora_result');
    router.push('/floraprismora');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 dark:bg-green-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Loading Results...</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <button
                onClick={handleIdentifyAnother}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Identify Another Plant
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleIdentifyAnother}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold">Plant Identification Result</h1>
            <div className="w-20" />
          </div>

          {/* Main Result Card */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-1">{result.name}</h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 italic">
                    {result.scientificName}
                  </p>
                </div>
                {result.isToxic && (
                  <Badge variant="error" size="lg" className="shrink-0">
                    ⚠️ Toxic
                  </Badge>
                )}
              </div>

              <ConfidenceCard
                confidence={result.confidence}
                label="Identification Confidence"
                size="lg"
                className="mb-6"
              />

              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                {result.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveToGarden}
                  disabled={saved}
                  className={`
                    flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                    ${saved
                      ? 'bg-success-600 text-white cursor-default'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                    }
                  `}
                >
                  {saved ? '✓ Saved to Garden' : 'Save to My Garden'}
                </button>
                <button
                  onClick={handleIdentifyAnother}
                  className="flex-1 px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium transition-colors"
                >
                  Identify Another
                </button>
              </div>
            </div>
          </Card>

          {/* Care Tips */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Care Tips
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">Water</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{result.careTips.water}</p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-semibold text-yellow-900 dark:text-yellow-100">Light</span>
                  </div>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{result.careTips.light}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="font-semibold text-amber-900 dark:text-amber-100">Soil</span>
                  </div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{result.careTips.soil}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-semibold text-red-900 dark:text-red-100">Temperature</span>
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-200">{result.careTips.temperature}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Toxicity Warning */}
          {result.isToxic && (
            <Card>
              <div className="p-6 bg-error-50 dark:bg-error-950">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-error-100 dark:bg-error-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-error-900 dark:text-error-100 mb-2">
                      ⚠️ Toxic Warning
                    </h3>
                    <p className="text-error-800 dark:text-error-200">
                      This plant is toxic to humans and/or pets if ingested. Keep out of reach of children and animals. In case of ingestion, contact poison control immediately.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
