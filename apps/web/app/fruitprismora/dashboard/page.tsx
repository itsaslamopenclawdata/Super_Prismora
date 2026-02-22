'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';

interface FruitLog {
  id: number;
  fruit_name: string;
  image_url: string;
  ripeness_level: string;
  ripeness_score: number;
  calories: number;
  sugar_content: number;
  vitamin_c: number;
  fiber: number;
  origin: string;
  season: string;
  consumption_date: string;
}

export default function FruitPrismoraDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fruitLogs, setFruitLogs] = useState<FruitLog[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/health/fruits');
        const data = await response.json();
        setFruitLogs(data.fruits || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getRipenessIcon = (level: string) => {
    switch (level) {
      case 'unripe':
        return '🟢';
      case 'ripe':
        return '🟡';
      case 'overripe':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getSeasonEmoji = (season: string) => {
    const s = season?.toLowerCase();
    if (s?.includes('spring')) return '🌸';
    if (s?.includes('summer')) return '☀️';
    if (s?.includes('fall') || s?.includes('autumn')) return '🍂';
    if (s?.includes('winter')) return '❄️';
    return '🌱';
  };

  const totalCalories = fruitLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalVitaminC = fruitLogs.reduce((sum, log) => sum + log.vitamin_c, 0);
  const avgRipeness = fruitLogs.length > 0
    ? fruitLogs.reduce((sum, log) => sum + log.ripeness_score, 0) / fruitLogs.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-yellow-950 dark:via-gray-900 dark:to-red-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              FruitPrismora Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your fruit consumption and ripeness history
            </p>
          </div>
          <Button
            onClick={() => router.push('/fruitprismora/scan')}
            className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700"
          >
            + Scan Fruit
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {fruitLogs.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Fruits Logged
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {totalCalories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Calories
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {totalVitaminC}mg
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Vitamin C
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {avgRipeness.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Ripeness
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fruit Logs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your Fruit History
          </h2>

          {fruitLogs.length === 0 ? (
            <Card className="shadow-xl">
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">🍎</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No fruits logged yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by scanning your first fruit to track your consumption
                </p>
                <Button onClick={() => router.push('/fruitprismora/scan')}>
                  Scan Your First Fruit
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fruitLogs.map((log) => (
                <Card key={log.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4">
                    {log.image_url && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img
                          src={log.image_url}
                          alt={log.fruit_name}
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {log.fruit_name}
                      </h3>
                      <span className="text-xl">{getRipenessIcon(log.ripeness_level)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={log.ripeness_level === 'ripe' ? 'success' : log.ripeness_level === 'overripe' ? 'error' : 'info'}>
                        {log.ripeness_level?.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {log.ripeness_score.toFixed(0)}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div>🔥 {log.calories} kcal</div>
                      <div>🍊 {log.vitamin_c}mg VC</div>
                      <div>🥗 {log.fiber}g fiber</div>
                      <div>🍬 {log.sugar_content}g sugar</div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                      <span>{getSeasonEmoji(log.season)} {log.season}</span>
                      <span>{new Date(log.consumption_date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <Card className="shadow-xl bg-gradient-to-r from-yellow-100 to-red-100 dark:from-yellow-950 dark:to-red-950">
          <CardHeader>
            <CardTitle>💡 Daily Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Aim for 2-3 servings of fruit per day for optimal health</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Eat fruits at peak ripeness for maximum nutritional value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Choose seasonal fruits for better taste and lower cost</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600">✓</span>
                <span>Variety ensures you get a wide range of vitamins and minerals</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/fruitprismora/scan')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">🍎</span>
            <span>Scan Fruit</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>View Reports</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/settings')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
