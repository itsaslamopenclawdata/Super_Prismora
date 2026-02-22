'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';

interface Meal {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  date: string;
}

interface NutritionGoal {
  calorie_goal: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  fiber_goal: number;
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  fiber_consumed: number;
}

export default function NutriPrismoraDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [goals, setGoals] = useState<NutritionGoal | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch meals
        const mealsResponse = await fetch('/api/health/meals');
        const mealsData = await mealsResponse.json();
        setMeals(mealsData.meals || []);

        // Fetch today's nutrition goals
        const goalsResponse = await fetch('/api/health/nutrition-goals/today');
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredMeals = selectedMealType === 'all'
    ? meals
    : meals.filter(meal => meal.meal_type === selectedMealType);

  const calculatePercentage = (consumed: number, goal: number) => {
    if (!goal || goal === 0) return 0;
    return Math.min((consumed / goal) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 dark:from-green-950 dark:via-gray-900 dark:to-orange-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
              NutriPrismora Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your daily nutrition and meal history
            </p>
          </div>
          <Button
            onClick={() => router.push('/nutriprismora/scan')}
            className="bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700"
          >
            + Scan Food
          </Button>
        </div>

        {/* Nutrition Goals Summary */}
        {goals && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Today's Progress
            </h2>
            <div className="grid md:grid-cols-5 gap-4">
              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription>Calories</CardDescription>
                  <div className="text-3xl font-bold text-green-600">
                    {goals.calories_consumed}
                  </div>
                  <div className="text-sm text-gray-500">of {goals.calorie_goal}</div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(goals.calories_consumed, goals.calorie_goal)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription>Protein</CardDescription>
                  <div className="text-3xl font-bold text-blue-600">
                    {goals.protein_consumed}g
                  </div>
                  <div className="text-sm text-gray-500">of {goals.protein_goal}g</div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(goals.protein_consumed, goals.protein_goal)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription>Carbs</CardDescription>
                  <div className="text-3xl font-bold text-orange-600">
                    {goals.carbs_consumed}g
                  </div>
                  <div className="text-sm text-gray-500">of {goals.carbs_goal}g</div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-orange-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(goals.carbs_consumed, goals.carbs_goal)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription>Fats</CardDescription>
                  <div className="text-3xl font-bold text-red-600">
                    {goals.fat_consumed}g
                  </div>
                  <div className="text-sm text-gray-500">of {goals.fat_goal}g</div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-red-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(goals.fat_consumed, goals.fat_goal)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardDescription>Fiber</CardDescription>
                  <div className="text-3xl font-bold text-purple-600">
                    {goals.fiber_consumed}g
                  </div>
                  <div className="text-sm text-gray-500">of {goals.fiber_goal}g</div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(goals.fiber_consumed, goals.fiber_goal)}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Meal History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Meal History
            </h2>
            <div className="flex gap-2">
              {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMealType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedMealType === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredMeals.length === 0 ? (
            <Card className="shadow-xl">
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No meals logged yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start by scanning your first meal to track your nutrition
                </p>
                <Button onClick={() => router.push('/nutriprismora/scan')}>
                  Scan Your First Meal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMeals.map((meal) => (
                <Card key={meal.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {meal.food_name}
                          </h3>
                          <Badge variant="secondary">{meal.meal_type}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>🔥 {meal.calories} kcal</span>
                          <span>💪 {meal.protein}g protein</span>
                          <span>🍞 {meal.carbs}g carbs</span>
                          <span>🥑 {meal.fat}g fat</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(meal.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/nutriprismora/scan')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span>Scan Food</span>
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
