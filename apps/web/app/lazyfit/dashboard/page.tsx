'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';

interface WorkoutSession {
  id: number;
  exercise_name: string;
  workout_type: string;
  form_score: number;
  duration_minutes: number;
  calories_burned: number;
  muscle_groups: string[];
  difficulty_level: string;
  date: string;
}

interface FitnessProgress {
  workouts_completed: number;
  total_calories_burned: number;
  total_workout_minutes: number;
  average_form_score: number;
}

export default function LazyFitDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [progress, setProgress] = useState<FitnessProgress | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutsResponse, progressResponse] = await Promise.all([
          fetch('/api/health/workouts?workout_type=beginner'),
          fetch('/api/health/fitness-progress/today'),
        ]);

        const workoutsData = await workoutsResponse.json();
        const progressData = await progressResponse.json();

        setWorkouts(workoutsData.workouts || []);
        setProgress(progressData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'easy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getFormScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const beginnerWorkouts = workouts.filter(w => w.workout_type === 'beginner' || w.difficulty_level === 'beginner');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LazyFit Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your beginner fitness journey
            </p>
          </div>
          <Button
            onClick={() => router.push('/lazyfit/scan')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            + Scan Exercise
          </Button>
        </div>

        {/* Today's Progress */}
        {progress && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Today's Progress
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {progress.workouts_completed}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Workouts Completed
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {progress.total_calories_burned}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Calories Burned
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {progress.total_workout_minutes}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Minutes Active
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl">
                <CardContent className="pt-6">
                  <div className={`text-3xl font-bold mb-1 ${getFormScoreColor(progress.average_form_score || 0)}`}>
                    {progress.average_form_score?.toFixed(0) || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Form Score
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Workout History */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Workout History
          </h2>

          {beginnerWorkouts.length === 0 ? (
            <Card className="shadow-xl">
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">🧘</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No workouts logged yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start your fitness journey by scanning your first exercise
                </p>
                <Button onClick={() => router.push('/lazyfit/scan')}>
                  Scan Your First Exercise
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {beginnerWorkouts.map((workout) => (
                <Card key={workout.id} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {workout.exercise_name}
                          </h3>
                          <Badge className={getDifficultyColor(workout.difficulty_level)}>
                            {workout.difficulty_level?.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span>⏱️ {workout.duration_minutes} min</span>
                          <span>🔥 {workout.calories_burned} kcal</span>
                          <span>💪 Form: <span className={getFormScoreColor(workout.form_score)}>{workout.form_score?.toFixed(0)}/100</span></span>
                        </div>

                        {workout.muscle_groups && workout.muscle_groups.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {workout.muscle_groups.map((muscle, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 ml-4">
                        {new Date(workout.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Beginner Tips */}
        <Card className="shadow-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle>💡 Beginner Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Start with 10-15 minute sessions and gradually increase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Focus on proper form rather than speed or intensity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Stay hydrated and take breaks when needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Consistency is more important than intensity for beginners</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">✓</span>
                <span>Listen to your body and rest if you feel pain</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/lazyfit/scan')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">🧘</span>
            <span>Scan Exercise</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/musclefit/scan')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">🏋️</span>
            <span>Try Advanced</span>
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
