'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';
import { Alert } from '@super_prismora/ui';

interface ExerciseData {
  exercise_name: string;
  muscle_name: string;
  identification_type: string;
  exercise_category: string;
  movement_pattern: string;
  force_type: string;
  difficulty_level: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  muscle_group: string;
  equipment_required: string[];
  rep_range: string;
  set_count: string;
  rest_between_sets: string;
  instructions: string;
  form_tips: string;
  common_errors: string;
  progression: string;
  muscle_action: string;
  plane_of_motion: string;
  variations: string[];
  alternatives: string[];
  form_score: number;
  form_feedback: string;
  confidence: number;
}

export default function MuscleFitResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        const photoResponse = await fetch(`/api/photos/${params.id}`);
        const photoData = await photoResponse.json();

        if (photoData.photo?.original_url) {
          setImageUrl(photoData.photo.original_url);
        }

        const musclefitResponse = await fetch(`/api/identifications/musclefit/${params.id}`);
        const musclefitResult = await musclefitResponse.json();

        if (musclefitResult.identification) {
          setExerciseData(musclefitResult.identification);
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

  const handleLogWorkout = async () => {
    if (!exerciseData) return;

    try {
      await fetch('/api/health/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workout_type: 'advanced',
          program_name: 'MuscleFit',
          exercise_name: exerciseData.exercise_name,
          image_url: imageUrl,
          form_score: exerciseData.form_score,
          form_feedback: exerciseData.form_feedback,
          muscle_groups: [...(exerciseData.primary_muscles || []), ...(exerciseData.secondary_muscles || [])],
          difficulty_level: exerciseData.difficulty_level,
        }),
      });

      router.push('/musclefit/dashboard');
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout. Please try again.');
    }
  };

  const getFormScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
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

  if (!exerciseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-black dark:from-red-950 dark:via-gray-900 dark:to-black">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Exercise Not Recognized
            </h1>
            <Button onClick={() => router.push('/musclefit/scan')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-black dark:from-red-950 dark:via-gray-900 dark:to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/musclefit/scan')}
            className="mb-4"
          >
            ← Scan Another
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-gray-900 bg-clip-text text-transparent">
            Advanced Exercise Analysis
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Image & Quick Info */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{exerciseData.exercise_name}</span>
                  <Badge variant={exerciseData.confidence > 0.8 ? 'success' : 'warning'}>
                    {(exerciseData.confidence * 100).toFixed(0)}%
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {exerciseData.exercise_category} • {exerciseData.movement_pattern}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={exerciseData.exercise_name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <Badge className={getDifficultyColor(exerciseData.difficulty_level)}>
                    {exerciseData.difficulty_level?.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{exerciseData.force_type}</Badge>
                  <Badge variant="secondary">{exerciseData.muscle_action}</Badge>
                </div>

                {/* Form Score */}
                {exerciseData.form_score && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Form Score
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getFormScoreColor(exerciseData.form_score)}`}>
                        {exerciseData.form_score.toFixed(0)}/100
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            exerciseData.form_score >= 85 ? 'bg-green-500' : exerciseData.form_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${exerciseData.form_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {exerciseData.form_feedback && (
                  <Alert variant={exerciseData.form_score >= 70 ? 'success' : 'warning'}>
                    <p className="font-medium text-sm">Form Feedback:</p>
                    <p className="text-sm">{exerciseData.form_feedback}</p>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Exercise Specs */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Exercise Specs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reps:</span>
                  <span className="font-medium">{exerciseData.rep_range || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sets:</span>
                  <span className="font-medium">{exerciseData.set_count || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rest:</span>
                  <span className="font-medium">{exerciseData.rest_between_sets || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Plane:</span>
                  <span className="font-medium">{exerciseData.plane_of_motion || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Equipment */}
            {exerciseData.equipment_required && exerciseData.equipment_required.length > 0 && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>Equipment Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.equipment_required.map((item, idx) => (
                      <Badge key={idx} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Middle Column - Muscles */}
          <div className="space-y-6">
            <Card className="shadow-xl border-2 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle>Primary Muscles</CardTitle>
                <CardDescription>Main muscle groups targeted</CardDescription>
              </CardHeader>
              <CardContent>
                {exerciseData.primary_muscles && exerciseData.primary_muscles.length > 0 ? (
                  <div className="space-y-2">
                    {exerciseData.primary_muscles.map((muscle, idx) => (
                      <div key={idx} className="p-3 bg-red-50 dark:bg-red-950 rounded-lg flex items-center gap-2">
                        <span className="text-lg">💪</span>
                        <span className="font-medium text-red-900 dark:text-red-200">{muscle}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No primary muscles identified</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Secondary Muscles</CardTitle>
                <CardDescription>Supporting muscle groups</CardDescription>
              </CardHeader>
              <CardContent>
                {exerciseData.secondary_muscles && exerciseData.secondary_muscles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {exerciseData.secondary_muscles.map((muscle, idx) => (
                      <Badge key={idx} variant="secondary">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No secondary muscles identified</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Muscle Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {exerciseData.muscle_group || 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>📋 Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                  {exerciseData.instructions}
                </p>
              </CardContent>
            </Card>

            {exerciseData.form_tips && (
              <Card className="shadow-xl bg-green-50 dark:bg-green-950">
                <CardHeader>
                  <CardTitle>✨ Form Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {exerciseData.form_tips}
                  </p>
                </CardContent>
              </Card>
            )}

            {exerciseData.common_errors && (
              <Card className="shadow-xl bg-red-50 dark:bg-red-950">
                <CardHeader>
                  <CardTitle>⚠️ Common Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
                    {exerciseData.common_errors}
                  </p>
                </CardContent>
              </Card>
            )}

            {exerciseData.progression && (
              <Card className="shadow-xl bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle>📈 Progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {exerciseData.progression}
                  </p>
                </CardContent>
              </Card>
            )}

            {exerciseData.variations && exerciseData.variations.length > 0 && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle>🔄 Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {exerciseData.variations.map((variation, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                        • {variation}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            size="lg"
            onClick={handleLogWorkout}
            className="bg-gradient-to-r from-red-600 to-gray-900 hover:from-red-700 hover:to-black text-white"
          >
            Log This Workout
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/musclefit/dashboard')}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
