'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';

interface FruitData {
  fruit_name: string;
  scientific_name: string;
  variety: string;
  fruit_type: string;
  family: string;
  ripeness_score: number;
  ripeness_level: string;
  serving_size: string;
  calories: number;
  vitamin_c: number;
  fiber: number;
  sugar_content: number;
  color: string[];
  flavor_profile: string;
  texture: string;
  season: string;
  origin_region: string;
  storage_tips: string;
  health_benefits: string;
  confidence: number;
}

export default function FruitPrismoraResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fruitData, setFruitData] = useState<FruitData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const photoResponse = await fetch(`/api/photos/${params.id}`);
        const photoData = await photoResponse.json();

        if (photoData.photo?.original_url) {
          setImageUrl(photoData.photo.original_url);
        }

        const fruitResponse = await fetch(`/api/identifications/fruit/${params.id}`);
        const fruitResult = await fruitResponse.json();

        if (fruitResult.identification) {
          setFruitData(fruitResult.identification);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchResults();
    }
  }, [params.id]);

  const handleLogFruit = async () => {
    if (!fruitData) return;

    try {
      await fetch('/api/health/fruits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fruit_name: fruitData.fruit_name,
          image_url: imageUrl,
          ripeness_level: fruitData.ripeness_level,
          ripeness_score: fruitData.ripeness_score,
          calories: fruitData.calories,
          sugar_content: fruitData.sugar_content,
          vitamin_c: fruitData.vitamin_c,
          fiber: fruitData.fiber,
          origin: fruitData.origin_region,
          season: fruitData.season,
          storage_recommendation: fruitData.storage_tips,
          nutritional_benefits: { health_benefits: fruitData.health_benefits },
        }),
      });

      router.push('/fruitprismora/dashboard');
    } catch (error) {
      console.error('Error logging fruit:', error);
      alert('Failed to log fruit. Please try again.');
    }
  };

  const getRipenessColor = (level: string) => {
    switch (level) {
      case 'unripe':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ripe':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overripe':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!fruitData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-yellow-950 dark:via-gray-900 dark:to-red-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Fruit Not Recognized
            </h1>
            <Button onClick={() => router.push('/fruitprismora/scan')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-yellow-950 dark:via-gray-900 dark:to-red-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/fruitprismora/scan')}
            className="mb-4"
          >
            ← Scan Another
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
            Fruit Analysis
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Fruit Image & Ripeness */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{fruitData.fruit_name}</span>
                  <Badge variant={fruitData.confidence > 0.8 ? 'success' : 'warning'}>
                    {(fruitData.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {fruitData.scientific_name} • {fruitData.family}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={fruitData.fruit_name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Ripeness Assessment */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🍊 Ripeness Assessment
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge className={getRipenessColor(fruitData.ripeness_level)} size="lg">
                      {fruitData.ripeness_level?.toUpperCase()}
                    </Badge>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {fruitData.ripeness_score?.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        fruitData.ripeness_score < 40
                          ? 'bg-green-500'
                          : fruitData.ripeness_score < 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${fruitData.ripeness_score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Characteristics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-gray-600 dark:text-gray-400">Flavor</div>
                    <div className="font-medium">{fruitData.flavor_profile}</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-gray-600 dark:text-gray-400">Texture</div>
                    <div className="font-medium">{fruitData.texture}</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-gray-600 dark:text-gray-400">Season</div>
                    <div className="font-medium">{fruitData.season}</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-gray-600 dark:text-gray-400">Origin</div>
                    <div className="font-medium">{fruitData.origin_region}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition & Storage */}
          <div className="space-y-6">
            {/* Nutrition Info */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Nutritional Value</CardTitle>
                <CardDescription>Per {fruitData.serving_size}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {fruitData.calories}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Calories</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {fruitData.sugar_content}g
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sugar</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">
                      {fruitData.vitamin_c}mg
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Vitamin C</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {fruitData.fiber}g
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Fiber</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Tips */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Storage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {fruitData.storage_tips}
                </p>
              </CardContent>
            </Card>

            {/* Health Benefits */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Health Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {fruitData.health_benefits}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            onClick={handleLogFruit}
            className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700"
          >
            Log This Fruit
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/fruitprismora/dashboard')}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
