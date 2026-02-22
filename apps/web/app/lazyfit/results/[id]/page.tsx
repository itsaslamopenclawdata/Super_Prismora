'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@super_prismora/ui';
import { Button } from '@super_prismora/ui';
import { Badge } from '@super_prismora/ui';
import { Alert } from '@super_prismora/ui';

interface ExerciseData {
  activity_name: string;
  activity_type: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  equipment_needed: string[];
  muscle_groups: string[];
  body_part: string;
  form_score: number;
  form_feedback: string;
  instructions: string;
  tips: string;
  common_mistakes: string;
  benefits: string[];
  calories_burned_est: number;
  safety_notes: string;
  confidence: number;
}

export default function LazyFitResultsPage() {
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

        const lazyfitResponse = await fetch(`/api/identifications/lazyfit/${params.id}`);
        const lazyfitResult = await lazyfitResponse.json();

        if (lazyfitResult.identification) {
          setExerciseData(lazyfitResult.identification);
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
          workout_type: 'beginner',
          program_name: 'LazyFit',
          exercise_name: exerciseData.activity_name,
          image_url: imageUrl,
          form_score: exerciseData.form_score,
          form_feedback: exerciseData.form_feedback,
          duration_minutes: exerciseData.duration_minutes,
          calories_burned: exerciseData.calories_burned_est,
          muscle_groups: exerciseData.muscle_groups,
          difficulty_level: exerciseData.difficulty,
        }),
      });

      router.push('/lazyfit/dashboard');
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout. Please try again.');
    }
  };

  const getFormScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFormScoreBadge = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!exerciseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Exercise Not Recognized
            </h1>
            <Button onClick={() => router.push('/lazyfit/scan')}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/lazyfit/scan')}
            className="mb-4"
          >
            ← Scan Another
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Exercise Analysis
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Exercise Image & Form Score */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{exerciseData.activity_name}</span>
                  <Badge variant={exerciseData.confidence > 0.8 ? 'success' : 'warning'}>
                    {(exerciseData.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {exerciseData.category} • {exerciseData.difficulty} level
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={exerciseData.activity_name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Form Score */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    🎯 Form Score
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <Badge variant={getFormScoreBadge(exerciseData.form_score)} size="lg">
                      {exerciseData.form_score >= 80 ? 'Good' : exerciseData.form_score >= 60 ? 'Fair' : 'Needs Work'}
                    </Badge>
                    <span className={`text-3xl font-bold ${getFormScoreColor(exerciseData.form_score)}`}>
                      {exerciseData.form_score?.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        exerciseData.form_score >= 80
                          ? 'bg-green-500'
                          : exerciseData.form_score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${exerciseData.form_score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Form Feedback */}
                {exerciseData.form_feedback && (
                  <Alert variant={exerciseData.form_score >= 60 ? 'success' : 'warning'}>
                    <p className="font-medium mb-1">Form Feedback:</p>
                    <p className="text-sm">{exerciseData.form_feedback}</p>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="font-medium">{exerciseData.duration_minutes} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                    <span className="font-medium">{exerciseData.calories_burned_est} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Body Part:</span>
                    <span className="font-medium">{exerciseData.body_part}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Muscles:</span>
                    <div className="flex flex-wrap gap-2">
                      {exerciseData.muscle_groups.map((muscle, idx) => (
                        <Badge key={idx} variant="secondary">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {exerciseData.equipment_needed && exerciseData.equipment_needed.length > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 block mb-1">Equipment:</span>
                      <div className="flex flex-wrap gap-2">
                        {exerciseData.equipment_needed.map((item, idx) => (
                          <Badge key={idx} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions & Tips */}
          <div className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>📝 Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {exerciseData.instructions}
                </p>
              </CardContent>
            </Card>

            {exerciseData.tips && (
              <Card className="shadow-xl bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                  <CardTitle>💡 Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {exerciseData.tips}
                  </p>
                </CardContent>
              </Card>
            )}

            {exerciseData.common_mistakes && (
              <Card className="shadow-xl bg-red-50 dark:bg-red-950">
                <CardHeader>
                  <CardTitle>⚠️ Common Mistakes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {exerciseData.common_mistakes}
                  </p>
                </CardContent>
              </Card>
            )}

            {exerciseData.benefits && exerciseData.benefits.length > 0 && (
              <Card className="shadow-xl bg-green-50 dark:bg-green-950">
                <CardHeader>
                  <CardTitle>✨ Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {exerciseData.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-green-600">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {exerciseData.safety_notes && (
              <Card className="shadow-xl bg-yellow-50 dark:bg-yellow-950">
                <CardHeader>
                  <CardTitle>🛡️ Safety Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    {exerciseData.safety_notes}
                  </p>
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Log This Workout
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/lazyfit/dashboard')}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
