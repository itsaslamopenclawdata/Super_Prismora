'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard, Badge, Card, Button } from '@photoidentifier/ui';

interface BirdIdentification {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  family: string;
  habitat: string;
  range: string;
  diet: string;
  size: string;
  audioUrl?: string;
  method: 'photo' | 'audio';
}

export default function WingWatchResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<BirdIdentification | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('wingwatch_result');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Demo data
      setResult({
        id: 'demo-bird-1',
        name: 'American Robin',
        scientificName: 'Turdus migratorius',
        confidence: 95.2,
        description: 'A familiar songbird with a reddish-orange breast and dark gray upperparts. Known for its melodic morning song, it\'s one of North America\'s most recognizable birds.',
        family: 'Turdidae (Thrushes)',
        habitat: 'Woodlands, gardens, parks, and suburban areas',
        range: 'Throughout North America, from Alaska to Mexico',
        diet: 'Insects, worms, berries, and fruits',
        size: '9-11 inches (23-28 cm)',
        method: 'photo'
      });
    }
    setLoading(false);
  }, []);

  const handleSaveToLifeList = () => {
    if (!result) return;

    const existingList = JSON.parse(localStorage.getItem('wingwatch_lifelist') || '[]');
    const alreadyExists = existingList.some((bird: any) => bird.id === result.id);

    if (!alreadyExists) {
      existingList.push({
        ...result,
        firstSighted: new Date().toISOString(),
        sightings: 1
      });
      localStorage.setItem('wingwatch_lifelist', JSON.stringify(existingList));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert('This bird is already in your life list!');
    }
  };

  const handleIdentifyAnother = () => {
    sessionStorage.removeItem('wingwatch_result');
    router.push('/wingwatch');
  };

  const handleViewLifeList = () => {
    router.push('/wingwatch/lifelist');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-sky-100 dark:bg-sky-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <button
                onClick={handleIdentifyAnother}
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
              >
                Identify Another Bird
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-neutral-900">
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
            <h1 className="text-2xl font-bold">Bird Identification Result</h1>
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
                <Badge variant="info" size="lg" className="shrink-0">
                  {result.method === 'photo' ? '📷' : '🎤'} {result.method === 'photo' ? 'Photo' : 'Audio'} ID
                </Badge>
              </div>

              <ConfidenceCard
                confidence={result.confidence}
                label="Identification Confidence"
                size="lg"
                className="mb-6"
              />

              {result.audioUrl && (
                <div className="mb-6 bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">Recorded Call</p>
                  <audio controls src={result.audioUrl} className="w-full" />
                </div>
              )}

              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                {result.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-sky-50 dark:bg-sky-950 rounded-lg p-4">
                  <p className="text-sm text-sky-600 dark:text-sky-400 mb-1">Family</p>
                  <p className="font-semibold text-sky-900 dark:text-sky-100">{result.family}</p>
                </div>
                <div className="bg-sky-50 dark:bg-sky-950 rounded-lg p-4">
                  <p className="text-sm text-sky-600 dark:text-sky-400 mb-1">Size</p>
                  <p className="font-semibold text-sky-900 dark:text-sky-100">{result.size}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveToLifeList}
                  disabled={saved}
                  className={`
                    flex-1 px-6 py-3 rounded-lg font-medium transition-colors
                    ${saved
                      ? 'bg-success-600 text-white cursor-default'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                    }
                  `}
                >
                  {saved ? '✓ Added to Life List' : 'Add to Life List'}
                </button>
                <button
                  onClick={handleViewLifeList}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Life List
                </button>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">More Information</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Habitat</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{result.habitat}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Range</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{result.range}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Diet</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{result.diet}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleIdentifyAnother}
              className="flex-1 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200"
            >
              Identify Another Bird
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
