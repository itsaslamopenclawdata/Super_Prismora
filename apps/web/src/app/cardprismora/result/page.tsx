'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  ConfidenceCard,
} from '@super-prismora/ui';

interface CardIdentification {
  id: string;
  name: string;
  type: string;
  confidence: number;
  imageUrl: string;
  details: {
    player: string;
    team: string;
    year: string;
    set: string;
    cardNumber: string;
    condition: string;
    description: string;
    estimatedValue: string;
  };
  alternativeMatches?: Array<{
    name: string;
    confidence: number;
  }>;
}

export default function CardPrismoraResult() {
  const router = useRouter();
  const [identification, setIdentification] = useState<CardIdentification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('cardIdentificationResult');
    if (storedResult) {
      setIdentification(JSON.parse(storedResult));
    }
    setIsLoading(false);
  }, []);

  const handleSaveToPortfolio = async () => {
    if (!identification) return;
    try {
      const response = await fetch('/api/cardprismora/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: identification,
          dateAdded: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving to portfolio:', error);
    }
  };

  const handleRescan = () => {
    sessionStorage.removeItem('cardIdentificationResult');
    router.push('/cardprismora/scan');
  };

  const handleViewPortfolio = () => router.push('/cardprismora/portfolio');
  const handleMarketplace = () => router.push('/cardprismora/marketplace');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-violet-900/20 py-12 px-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!identification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-violet-900/20 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200 mb-4">
            No Identification Found
          </h1>
          <Button onClick={handleRescan} variant="primary">Start New Scan</Button>
        </div>
      </div>
    );
  }

  const confidenceLevel = identification.confidence >= 90 ? 'high' :
                          identification.confidence >= 75 ? 'good' :
                          identification.confidence >= 50 ? 'medium' : 'low';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-neutral-900 dark:via-blue-900/20 dark:to-violet-900/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 mb-4">
            CardPrismora
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">Identification Results</p>
        </div>

        <Card className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Identification Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <img src={identification.imageUrl} alt={identification.name} className="w-full rounded-lg shadow-lg" />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                    {identification.details.player}
                  </h2>
                  <p className="text-xl text-blue-600 dark:text-blue-400 mb-2">
                    {identification.details.year} {identification.details.set}
                  </p>
                  <ConfidenceCard value={identification.confidence} level={confidenceLevel} variant="default" size="lg" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-600 dark:text-neutral-400">Team:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{identification.details.team}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-600 dark:text-neutral-400">Card #:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">#{identification.details.cardNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-600 dark:text-neutral-400">Set:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{identification.details.set}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-600 dark:text-neutral-400">Condition:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{identification.details.condition}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-600 dark:text-neutral-400">Est. Value:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{identification.details.estimatedValue}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{identification.details.description}</p>
                </div>
              </div>
            </div>

            {identification.alternativeMatches && identification.alternativeMatches.length > 0 && (
              <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Alternative Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {identification.alternativeMatches.map((alt, idx) => (
                    <div key={idx} className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-3">
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{alt.name}</p>
                      <div className="mt-1">
                        <ConfidenceCard value={alt.confidence} level={alt.confidence >= 75 ? 'good' : 'medium'} variant="compact" size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleRescan} variant="secondary" className="flex-1 min-w-[150px]">Scan Another Card</Button>
          <Button onClick={handleSaveToPortfolio} variant={saved ? "secondary" : "primary"} disabled={saved} className="flex-1 min-w-[150px]">
            {saved ? '✓ Saved to Portfolio' : 'Save to Portfolio'}
          </Button>
          <Button onClick={handleViewPortfolio} variant="outline" className="flex-1 min-w-[150px]">View Portfolio</Button>
          <Button onClick={handleMarketplace} variant="primary" className="flex-1 min-w-[150px]">Marketplace</Button>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Disclaimer:</strong> Identification and value estimates are AI-generated and may not be 100% accurate. For high-value cards, please consult a professional card grader.
          </p>
        </div>
      </div>
    </div>
  );
}
