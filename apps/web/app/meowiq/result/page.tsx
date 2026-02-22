'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard, Badge, Card } from '@photoidentifier/ui';

interface CatBreedInfo {
  id: string;
  name: string;
  confidence: number;
  description: string;
  temperament: string[];
  origin: string;
  size: string;
  weight: string;
  lifeExpectancy: string;
  groomingNeeds: string;
  healthConsiderations: string;
  activityLevel: string;
}

export default function MeowIQResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CatBreedInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('meowiq_result');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Demo data
      setResult({
        id: 'demo-cat-1',
        name: 'Maine Coon',
        confidence: 95.2,
        description: 'One of the largest domestic cat breeds, Maine Coons are known for their friendly, gentle nature and impressive physical stature. Native to the United States, these gentle giants have long, flowing coats and tufted ears.',
        temperament: ['Gentle', 'Friendly', 'Intelligent', 'Playful', 'Social', 'Independent'],
        origin: 'United States (Maine)',
        size: 'Large to Extra Large',
        weight: '9-18 lbs (4-8 kg)',
        lifeExpectancy: '12-15 years',
        groomingNeeds: 'Regular brushing needed to prevent matting, especially in long-haired areas',
        healthConsiderations: 'Prone to hip dysplasia and heart disease; regular vet check-ups recommended',
        activityLevel: 'Moderate - enjoys play but also content with quiet time'
      });
    }
    setLoading(false);
  }, []);

  const handleIdentifyAnother = () => {
    sessionStorage.removeItem('meowiq_result');
    router.push('/meowiq');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white dark:from-purple-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-purple-200 dark:bg-purple-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-purple-700 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white dark:from-purple-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <button
                onClick={handleIdentifyAnother}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Identify Another Cat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white dark:from-purple-950 dark:to-neutral-900">
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
            <h1 className="text-2xl font-bold">Cat Breed Result</h1>
            <div className="w-20" />
          </div>

          {/* Main Result Card */}
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-3xl font-bold mb-1">{result.name}</h2>

              <ConfidenceCard
                confidence={result.confidence}
                label="Identification Confidence"
                size="lg"
                className="my-6"
              />

              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                {result.description}
              </p>

              <button
                onClick={handleIdentifyAnother}
                className="w-full px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium transition-colors"
              >
                Identify Another Cat
              </button>
            </div>
          </Card>

          {/* Temperament */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Temperament
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.temperament.map((trait, index) => (
                  <Badge key={index} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Breed Characteristics */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Breed Characteristics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Origin</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{result.origin}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Size</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{result.size}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Weight</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{result.weight}</p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Life Expectancy</p>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">{result.lifeExpectancy}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Care Needs */}
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Care & Health
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Grooming</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{result.groomingNeeds}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Health Considerations</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{result.healthConsiderations}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Activity Level</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{result.activityLevel}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
