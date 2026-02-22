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
  program_name: string;
  form_score: number;
  duration_minutes: number;
  calories_burned: number;
  muscle_groups: string[];
  difficulty_level: string;
  rep_count: number;
  sets_completed: number;
  date: string;
}

interface WorkoutProgram {
  id: number;
  program_name: string;
  program_type: string;
  target_muscle_groups: string[];
  difficulty_level: string;
  estimated_duration: number;
  weekly_goal: number;
  is_active: boolean;
  progress_percentage: number;
}

interface FitnessProgress {
  workouts_completed: number;
  total_calories_burned: number;
  total_workout_minutes: number;
  average_form_score: number;
  strength_progress: Record<string, any>;
}

export default function MuscleFitDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [progress, setProgress] = useState<FitnessProgress | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [workoutsResponse, programsResponse, progressResponse] = await Promise.all([
          fetch('/api/health/workouts?workout_type=advanced'),
          fetch('/api/health/programs?program_type=musclefit&is_active=true'),
          fetch('/api/health/fitness-progress/today'),
        ]);

        const workoutsData = await workoutsResponse.json();
        const programsData = await programsResponse.json();
        const progressData = await progressResponse.json();

        setWorkouts(workoutsData.workouts || []);
        setPrograms(programsData.programs || []);
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
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getFormScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const advancedWorkouts = workouts.filter(w => w.workout_type === 'advanced' || w.difficulty_level === 'advanced');
  const activePrograms = programs.filter(p => p.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-black dark:from-red-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-900 bg-clip-text text-transparent">
              MuscleFit Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Advanced training & program tracking
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/musclefit/programs')}
            >
              My Programs
            </Button>
            <Button
              onClick={() => router.push('/musclefit/scan')}
              className="bg-gradient-to-r from-red-600 to-gray-900 hover:from-red-700 hover:to-black text-white"
            >
              + Scan Exercise
            </Button>
          </div>
        </div>

        {/* Today's Progress */}
        {progress && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Today's Progress
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="shadow-xl border-2 border-red-200 dark:border-red-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-600 mb-1">
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

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Active Programs */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Active Programs
            </h2>

            {activePrograms.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No active programs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Create a workout program to track your progress
                  </p>
                  <Button
                    onClick={() => router.push('/musclefit/programs')}
                    variant="outline"
                  >
                    Create Program
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activePrograms.map((program) => (
                  <Card key={program.id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {program.program_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getDifficultyColor(program.difficulty_level)}>
                              {program.difficulty_level?.toUpperCase()}
                            </Badge>
                            <Badge variant="secondary">{program.weekly_goal}/week</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {program.progress_percentage.toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-gray-700 h-2 rounded-full"
                          style={{ width: `${program.progress_percentage}%` }}
                        ></div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                        {program.target_muscle_groups.slice(0, 3).map((muscle, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            {muscle}
                          </span>
                        ))}
                        {program.target_muscle_groups.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                            +{program.target_muscle_groups.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Workouts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Workouts
            </h2>

            {advancedWorkouts.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">💪</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No workouts logged yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start your advanced training by scanning an exercise
                  </p>
                  <Button onClick={() => router.push('/musclefit/scan')}>
                    Scan Exercise
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {advancedWorkouts.slice(0, 5).map((workout) => (
                  <Card key={workout.id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {workout.exercise_name}
                            </h3>
                            <Badge className={getDifficultyColor(workout.difficulty_level)} size="sm">
                              {workout.difficulty_level?.substring(0, 3)?.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                            <span>⏱️ {workout.duration_minutes} min</span>
                            <span>🔥 {workout.calories_burned} kcal</span>
                            <span>📊 {workout.sets_completed}×{workout.rep_count}</span>
                            <span>💪 Form: <span className={getFormScoreColor(workout.form_score)}>{workout.form_score?.toFixed(0)}</span></span>
                          </div>

                          {workout.muscle_groups && workout.muscle_groups.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {workout.muscle_groups.slice(0, 2).map((muscle, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {muscle}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 ml-3">
                          {new Date(workout.date).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Strength Progress */}
        {progress && progress.strength_progress && Object.keys(progress.strength_progress).length > 0 && (
          <Card className="shadow-xl mb-8 border-2 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle>📈 Strength Progress</CardTitle>
              <CardDescription>Your recent strength improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(progress.strength_progress).slice(0, 6).map(([exercise, data]: [string, any]) => (
                  <div key={exercise} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{exercise}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {data.weight || data.reps ? (
                        <span>
                          {data.weight && `${data.weight}kg `}
                          {data.reps && `×${data.reps}`}
                        </span>
                      ) : (
                        'No data'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/musclefit/scan')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">💪</span>
            <span>Scan Exercise</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/musclefit/programs')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">📋</span>
            <span>Programs</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push('/lazyfit/scan')}
            className="h-24 flex flex-col items-center justify-center gap-2"
          >
            <span className="text-2xl">🧘</span>
            <span>LazyFit</span>
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
