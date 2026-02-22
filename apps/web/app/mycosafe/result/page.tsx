'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard, Badge, Card } from '@photoidentifier/ui';

interface Lookalike {
  name: string;
  scientificName: string;
  toxicity: string;
}

interface MushroomIdentification {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  toxicityLevel: 'safe' | 'caution' | 'dangerous' | 'deadly';
  description: string;
  edibility: string;
  habitat: string;
  season: string;
  lookalikes: Lookalike[];
}

const toxicityColors = {
  safe: 'success',
  caution: 'warning',
  dangerous: 'error',
  deadly: 'error'
} as const;

const toxicityLabels = {
  safe: 'Generally Safe',
  caution: 'Caution Required',
  dangerous: 'Dangerous - Do Not Eat',
  deadly: 'Deadly - Fatal!'
};

export default function MycoSafeResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<MushroomIdentification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('mycosafe_result');
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    } else {
      // Demo data for testing
      setResult({
        id: 'demo-mushroom-1',
        name: 'Fly Agaric',
        scientificName: 'Amanita muscaria',
        confidence: 92.3,
        toxicityLevel: 'dangerous',
        description: 'Iconic red mushroom with white spots. Contains psychoactive compounds that can cause severe poisoning. While rarely fatal, it causes intense nausea, vomiting, and hallucinations.',
        edibility: 'Toxic - Not Edible',
        habitat: 'Coniferous and deciduous forests, often near birch and pine trees',
        season: 'Late summer to autumn',
        lookalikes: [
          {
            name: 'Caesar\'s Mushroom',
            scientificName: 'Amanita caesarea',
            toxicity: 'Edible and choice'
          },
          {
            name: 'Panther Cap',
            scientificName: 'Amanita pantherina',
            toxicity: 'Dangerous - more potent than Fly Agaric'
          },
          {
            name: 'Death Cap',
            scientificName: 'Amanita phalloides',
            toxicity: 'Deadly - responsible for most mushroom fatalities'
          }
        ]
      });
    }
    setLoading(false);
  }, []);

  const handleIdentifyAnother = () => {
    sessionStorage.removeItem('mycosafe_result');
    router.push('/mycosafe');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-amber-100 dark:bg-amber-900 rounded-full animate-pulse">
                  <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-semibold mb-4">No Results Found</h3>
              <button
                onClick={handleIdentifyAnother}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
              >
                Identify Another Mushroom
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDangerous = result.toxicityLevel === 'dangerous' || result.toxicityLevel === 'deadly';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-amber-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Critical Warning Banner */}
          {isDangerous && (
            <div className="mb-6 bg-error-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {result.toxicityLevel === 'deadly' ? '🚨 DEADLY - DO NOT CONSUME!' : '⚠️ DANGEROUS - DO NOT EAT!'}
                  </h3>
                  <p className="text-white/90">
                    This mushroom is {result.toxicityLevel === 'deadly' ? 'potentially fatal' : 'poisonous'}. Ingesting it can cause serious illness {result.toxicityLevel === 'deadly' ? 'or death' : ''}.
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
            <h1 className="text-2xl font-bold">Mushroom Identification Result</h1>
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
                  variant={toxicityColors[result.toxicityLevel]}
                  size="lg"
                  className="shrink-0"
                >
                  {result.toxicityLevel === 'deadly' ? '💀' : ''} {toxicityLabels[result.toxicityLevel]}
                </Badge>
              </div>

              <ConfidenceCard
                confidence={result.confidence}
                label="Identification Confidence"
                size="lg"
                className="mb-6"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Edibility</p>
                  <p className="font-semibold">{result.edibility}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Season</p>
                  <p className="font-semibold">{result.season}</p>
                </div>
              </div>

              <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                {result.description}
              </p>

              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Habitat</p>
                <p className="text-blue-900 dark:text-blue-100">{result.habitat}</p>
              </div>

              <button
                onClick={handleIdentifyAnother}
                className="w-full px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium transition-colors"
              >
                Identify Another Mushroom
              </button>
            </div>
          </Card>

          {/* Lookalikes Section - CRITICAL FOR SAFETY */}
          {result.lookalikes && result.lookalikes.length > 0 && (
            <Card className="mb-6">
              <div className="p-6 bg-warning-50 dark:bg-warning-950">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-warning-900 dark:text-warning-100">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Lookalikes - Important for Identification
                </h3>
                <p className="text-sm text-warning-800 dark:text-warning-200 mb-4">
                  These mushrooms may look similar. Always verify with an expert:
                </p>
                <div className="space-y-3">
                  {result.lookalikes.map((lookalike, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-warning-200 dark:border-warning-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{lookalike.name}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                            {lookalike.scientificName}
                          </p>
                        </div>
                        <Badge
                          variant={lookalike.toxicity.toLowerCase().includes('deadly') || lookalike.toxicity.toLowerCase().includes('dangerous') ? 'error' : 'success'}
                          size="sm"
                        >
                          {lookalike.toxicity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Final Safety Disclaimer */}
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
                    Final Safety Disclaimer
                  </h3>
                  <p className="text-error-800 dark:text-error-200 text-sm mb-2">
                    <strong>Never eat any mushroom based solely on this app's identification.</strong> Even experts can make mistakes, and some deadly species have very few distinguishing features.
                  </p>
                  <p className="text-error-800 dark:text-error-200 text-sm mb-2">
                    This tool is for educational purposes only. Always consult with a professional mycologist or local mycological society before consuming any wild mushroom.
                  </p>
                  <p className="text-error-800 dark:text-error-200 text-sm font-semibold">
                    When in doubt, throw it out!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
