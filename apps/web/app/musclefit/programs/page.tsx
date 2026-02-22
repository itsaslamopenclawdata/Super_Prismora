'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';
import { Alert } from '@super_prismora/ui';

interface WorkoutProgram {
  id: number;
  program_name: string;
  program_type: string;
  description: string;
  target_muscle_groups: string[];
  difficulty_level: string;
  estimated_duration: number;
  weekly_goal: number;
  is_active: boolean;
  progress_percentage: number;
  start_date: string;
}

export default function MuscleFitProgramsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const response = await fetch('/api/health/programs?program_type=musclefit');
        const data = await response.json();
        setPrograms(data.programs || []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, []);

  const handleCreateProgram = async () => {
    const programName = prompt('Enter program name:');
    if (!programName) return;

    const targetMuscles = prompt('Enter target muscle groups (comma-separated):', 'Chest, Back, Legs');
    const muscles = targetMuscles ? targetMuscles.split(',').map(m => m.trim()) : [];

    const difficulty = prompt('Difficulty level (beginner/intermediate/advanced):', 'intermediate') || 'intermediate';
    const duration = parseInt(prompt('Estimated duration (minutes):', '60') || '60');
    const weeklyGoal = parseInt(prompt('Weekly goal (sessions):', '4') || '4');

    try {
      await fetch('/api/health/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_name: programName,
          program_type: 'musclefit',
          description: `Custom ${difficulty} muscle building program`,
          target_muscle_groups: muscles,
          difficulty_level: difficulty,
          estimated_duration: duration,
          weekly_goal: weeklyGoal,
          is_active: true,
        }),
      });

      // Refresh programs
      const response = await fetch('/api/health/programs?program_type=musclefit');
      const data = await response.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Error creating program:', error);
      alert('Failed to create program. Please try again.');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const activePrograms = programs.filter(p => p.is_active);
  const inactivePrograms = programs.filter(p => !p.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-black dark:from-red-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/musclefit/dashboard')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-900 bg-clip-text text-transparent">
              Workout Programs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your muscle building programs
            </p>
          </div>
          <Button
            onClick={handleCreateProgram}
            className="bg-gradient-to-r from-red-600 to-gray-900 hover:from-red-700 hover:to-black text-white"
          >
            + Create Program
          </Button>
        </div>

        {/* Active Programs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Active Programs
          </h2>

          {activePrograms.length === 0 ? (
            <Alert variant="info">
              <p>No active programs. Create one to start tracking your muscle building journey!</p>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activePrograms.map((program) => (
                <Card key={program.id} className="shadow-xl border-2 border-red-200 dark:border-red-800">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{program.program_name}</CardTitle>
                        <CardDescription>{program.description}</CardDescription>
                      </div>
                      <Badge className={getDifficultyColor(program.difficulty_level)}>
                        {program.difficulty_level?.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-bold text-red-600">{program.progress_percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-gray-700 h-3 rounded-full transition-all"
                          style={{ width: `${program.progress_percentage}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block">Duration</span>
                          <span className="font-medium">{program.estimated_duration} min</span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block">Weekly Goal</span>
                          <span className="font-medium">{program.weekly_goal} sessions</span>
                        </div>
                      </div>

                      {program.target_muscle_groups && program.target_muscle_groups.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Target Muscles</span>
                          <div className="flex flex-wrap gap-2">
                            {program.target_muscle_groups.map((muscle, idx) => (
                              <Badge key={idx} variant="secondary">
                                {muscle}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 pt-2">
                        Started: {new Date(program.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Programs */}
        {inactivePrograms.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Completed Programs
            </h2>
            <div className="grid md:grid-cols-2 gap-4 opacity-75">
              {inactivePrograms.map((program) => (
                <Card key={program.id} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{program.program_name}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <Badge variant="success">Completed</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${program.progress_percentage}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <Card className="mt-8 shadow-xl bg-gradient-to-r from-red-100 to-gray-100 dark:from-red-950 dark:to-gray-950">
          <CardHeader>
            <CardTitle>💪 Program Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-600">✓</span>
                <span>Set realistic goals based on your fitness level</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">✓</span>
                <span>Progressive overload is key to muscle growth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">✓</span>
                <span>Include rest days for recovery and muscle repair</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">✓</span>
                <span>Track your workouts to monitor progress over time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600">✓</span>
                <span>Adjust your program based on your progress and goals</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
