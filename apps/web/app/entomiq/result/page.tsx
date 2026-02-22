'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard, Badge, Card } from '@photoidentifier/ui';

interface InsectIdentification {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  dangerLevel: 'safe' | 'caution' | 'dangerous' | 'venomous';
  description: string;
  dangerDetails: string;
  firstAid?: string;
  habitat: string;
  behavior: string;
}

const dangerColors = {
  safe: 'success',
  caution: 'warning',
  dangerous: 'error',
  venomous: 'error'
} as const;

const dangerLabels = {
  safe: '✓ Safe',
  caution: '⚠️ Caution',
  dangerous: '🚨 Dangerous',
  venomous: '☠️ Venomous'
};

const dangerDescriptions = {
  safe: 'This insect is generally harmless to humans',
  caution: 'This insect may bite or sting, but is not life-threatening',
  dangerous: 'This insect can cause significant harm - exercise caution',
  venomous: 'This insect is venomous and may require medical attention'
};

export default function EntomIQResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<InsectIdentification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('entomiq_result');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Demo data
      setResult({
        id: 'demo-insect-1',
        name: 'Black Widow Spider',
        scientificName: 'Latrodectus mactans',
        confidence: 94.7,
        dangerLevel: 'venomous',
        description: 'A highly venomous spider recognizable by the distinctive red hourglass pattern on its abdomen. Females are larger and more dangerous than males. Common in dark, undisturbed areas.',
        dangerDetails: 'The venom is a neurotoxin that can cause severe pain, muscle cramps, nausea, and in rare cases, death. While fatalities are extremely rare with modern medical treatment, bites require immediate medical attention.',
        firstAid: 'Clean the wound with soap and water. Apply ice to reduce swelling. Seek immediate medical attention. Capture the spider if possible for identification. Do not apply a tourniquet.',
        habitat: 'Dark, sheltered areas such as woodpiles, garages, basements, and outdoor sheds',
        behavior: 'Typically non-aggressive but will bite if disturbed or threatened. Females may kill males after mating.'
      });
    }
    setLoading(false);
  }, []);

  const handleIdentifyAnother = () => {
    sessionStorage.removeItem('entomiq_result');
    router.push('/entomiq');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <button
                onClick={handleIdentifyAnother}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
              >
                Identify Another Insect
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDangerous = result.dangerLevel === 'dangerous' || result.dangerLevel === 'venomous';

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Danger Banner */}
          {isDangerous ? (
            <div className={`mb-6 ${result.dangerLevel === 'venomous' ? 'bg-error-600' : 'bg-warning-600'} text-white rounded-xl p-6 shadow-lg`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {result.dangerLevel === 'venomous' ? '☠️ VENOMOUS - MEDICAL ATTENTION REQUIRED' : '⚠️ DANGEROUS - EXERCISE CAUTION'}
                  </h3>
                  <p className="text-white/90">
                    {result.dangerLevel === 'venomous'
                      ? 'This insect is venomous. If bitten or stung, seek immediate medical attention.'
                      : 'This insect can cause significant harm. Avoid contact and handle with extreme caution.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-success-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    ✓ Generally Safe
                  </h3>
                  <p className="text-white/90">
                    This insect is not considered dangerous to humans under normal circumstances.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            <h1 className="text-2xl font-bold">Insect Identification Result</h1>
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
                <Badge
                  variant={dangerColors[result.dangerLevel]}
                  size="lg"
                  className="shrink-0"
                >
                  {dangerLabels[result.dangerLevel]}
                </Badge>
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

              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Danger Assessment
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {dangerDescriptions[result.dangerLevel]}
                </p>
              </div>

              <button
                onClick={handleIdentifyAnother}
                className="w-full px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium transition-colors"
              >
                Identify Another Insect
              </button>
            </div>
          </Card>

          {/* Danger Details */}
          <Card className="mb-6">
            <div className={`p-6 ${isDangerous ? 'bg-warning-50 dark:bg-warning-950' : 'bg-success-50 dark:bg-success-950'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isDangerous ? 'Danger Information' : 'Safety Information'}
              </h3>
              <p className={`mb-4 ${isDangerous ? 'text-warning-800 dark:text-warning-200' : 'text-success-800 dark:text-success-200'}`}>
                {result.dangerDetails}
              </p>

              {result.firstAid && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-warning-200 dark:border-warning-800">
                  <h4 className="font-semibold mb-2 text-warning-900 dark:text-warning-100">
                    First Aid for Bites/Stings:
                  </h4>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {result.firstAid}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Information */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Behavior</p>
                    <p className="text-neutral-600 dark:text-neutral-400">{result.behavior}</p>
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
