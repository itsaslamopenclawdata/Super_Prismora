'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';

interface NutritionData {
  food_name: string;
  food_category: string;
  cuisine_type: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins: Record<string, number>;
  minerals: Record<string, number>;
  description: string;
  ingredients: string[];
  allergens: string[];
  confidence: number;
}

export default function NutriPrismoraResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        // Fetch photo data
        const photoResponse = await fetch(`/api/photos/${params.id}`);
        const photoData = await photoResponse.json();

        if (photoData.photo?.original_url) {
          setImageUrl(photoData.photo.original_url);
        }

        // Fetch nutrition identification
        const caloResponse = await fetch(`/api/identifications/calo/${params.id}`);
        const caloData = await caloResponse.json();

        if (caloData.identification) {
          setNutritionData(caloData.identification);
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

  const handleLogMeal = async () => {
    if (!nutritionData) return;

    try {
      await fetch('/api/health/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: nutritionData.food_name,
          image_url: imageUrl,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          carbs: nutritionData.carbohydrates,
          fat: nutritionData.fats,
          fiber: nutritionData.fiber,
          sugar: nutritionData.sugar,
          sodium: nutritionData.sodium,
          vitamins: nutritionData.vitamins,
          meal_type: nutritionData.food_category,
          notes: nutritionData.description,
        }),
      });

      router.push('/nutriprismora/dashboard');
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Failed to log meal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!nutritionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-green-950 dark:via-gray-900 dark:to-orange-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              No Results Found
            </h1>
            <Button onClick={() => router.push('/nutriprismora/scan')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-green-950 dark:via-gray-900 dark:to-orange-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/nutriprismora/scan')}
            className="mb-4"
          >
            ← Scan Another
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
            Nutrition Analysis
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Food Image */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{nutritionData.food_name}</span>
                <Badge variant={nutritionData.confidence > 0.8 ? 'success' : 'warning'}>
                  {(nutritionData.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </CardTitle>
              <CardDescription>
                {nutritionData.cuisine_type} • {nutritionData.food_category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={nutritionData.food_name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                {nutritionData.description || 'A delicious and nutritious meal option.'}
              </p>

              {nutritionData.allergens && nutritionData.allergens.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                    ⚠️ Allergens
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nutritionData.allergens.map((allergen, idx) => (
                      <Badge key={idx} variant="error">
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Info */}
          <div className="space-y-6">
            {/* Calories Card */}
            <Card className="shadow-xl border-2 border-green-200 dark:border-green-800">
              <CardHeader className="text-center pb-4">
                <CardDescription>Serving Size</CardDescription>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {nutritionData.calories}
                </div>
                <CardDescription className="text-base">Calories</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  {nutritionData.serving_size}
                </p>
              </CardContent>
            </Card>

            {/* Macros */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Macronutrients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Protein</span>
                      <span className="text-blue-600 font-bold">{nutritionData.protein}g</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((nutritionData.protein / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Carbohydrates</span>
                      <span className="text-orange-600 font-bold">{nutritionData.carbohydrates}g</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${Math.min((nutritionData.carbohydrates / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Fats</span>
                      <span className="text-red-600 font-bold">{nutritionData.fats}g</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${Math.min((nutritionData.fats / 50) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">Fiber</span>
                      <span className="text-green-600 font-bold">{nutritionData.fiber}g</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min((nutritionData.fiber / 25) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Micronutrients */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Vitamins & Minerals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(nutritionData.vitamins || {}).map(([vitamin, value]) => (
                    <div key={vitamin} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium">{vitamin}</div>
                      <div className="text-green-600">{value}% DV</div>
                    </div>
                  ))}
                  {Object.entries(nutritionData.minerals || {}).map(([mineral, value]) => (
                    <div key={mineral} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="font-medium">{mineral}</div>
                      <div className="text-blue-600">{value}% DV</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            onClick={handleLogMeal}
            className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700"
          >
            Log This Meal
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/nutriprismora/dashboard')}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
