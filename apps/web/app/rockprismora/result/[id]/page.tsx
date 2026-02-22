'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard } from '@super-prismora/ui';

interface RockIdentificationData {
  id: string;
  rock_name: string;
  rock_type: string;
  scientific_name?: string;
  variety?: string;
  confidence: number;
  hardness?: number;
  specific_gravity?: number;
  luster: string;
  color: string[];
  streak?: string;
  transparency?: string;
  cleavage?: string;
  fracture?: string;
  tenacity?: string;
  chemical_formula?: string;
  mineral_content?: Record<string, number>;
  grain_size?: string;
  texture?: string;
  structure?: string;
  occurrence?: string;
  associated_rocks?: string[];
  uses?: string[];
  economic_value?: string;
  description?: string;
  similar_rocks?: string[];
  photo_url: string;
  created_at: string;
}

export default function RockResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rock, setRock] = useState<RockIdentificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRockDetails();
  }, [params.id]);

  const fetchRockDetails = async () => {
    try {
      const response = await fetch(`/api/rock/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rock details');
      }
      const data = await response.json();
      setRock(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    router.push('/rockprismora/scan');
  };

  const handleSaveToGallery = async () => {
    if (!rock) return;

    try {
      await fetch('/api/collections/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identification_id: rock.id,
          collection_name: 'Rocks',
        }),
      });
      alert('Rock saved to your collection!');
    } catch (err) {
      console.error('Error saving rock:', err);
      alert('Failed to save rock. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !rock) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-error-900 dark:text-error-100 mb-2">
              Error Loading Rock Details
            </h2>
            <p className="text-error-700 dark:text-error-300 mb-4">
              {error || 'Rock not found'}
            </p>
            <button
              onClick={handleRescan}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Scan Another Rock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleRescan}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Scan Another Rock
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Rock Identification Result
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Detailed geological information
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Image & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
              <img
                src={rock.photo_url}
                alt={rock.rock_name}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Confidence Card */}
            <ConfidenceCard
              confidence={rock.confidence}
              label="Identification Confidence"
              color="amber"
            />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleSaveToGallery}
                  className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save to Gallery
                </button>
                <button
                  onClick={() => router.push('/rockprismora/gallery')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  View My Collection
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rock Title */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {rock.rock_name}
              </h2>
              {rock.scientific_name && (
                <p className="text-xl text-neutral-600 dark:text-neutral-400 italic mb-3">
                  {rock.scientific_name}
                </p>
              )}
              {rock.variety && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-3">
                  Variety: {rock.variety}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
                  {rock.rock_type}
                </span>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {rock.luster}
                </span>
              </div>
            </div>

            {/* Physical Properties */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📏</span>
                Physical Properties
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {rock.hardness !== undefined && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Hardness (Mohs)</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.hardness}</p>
                  </div>
                )}
                {rock.specific_gravity !== undefined && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Specific Gravity</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.specific_gravity}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Luster</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{rock.luster}</p>
                </div>
                {rock.streak && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Streak</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.streak}</p>
                  </div>
                )}
                {rock.transparency && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Transparency</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.transparency}</p>
                  </div>
                )}
                {rock.cleavage && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Cleavage</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.cleavage}</p>
                  </div>
                )}
                {rock.fracture && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Fracture</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.fracture}</p>
                  </div>
                )}
                {rock.tenacity && (
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Tenacity</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">{rock.tenacity}</p>
                  </div>
                )}
              </div>
              {rock.color && rock.color.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Colors:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rock.color.map((c, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Texture & Structure */}
            {(rock.grain_size || rock.texture || rock.structure) && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔬</span>
                  Texture & Structure
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rock.grain_size && (
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Grain Size</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">{rock.grain_size}</p>
                    </div>
                  )}
                  {rock.texture && (
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Texture</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">{rock.texture}</p>
                    </div>
                  )}
                  {rock.structure && (
                    <div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Structure</p>
                      <p className="font-semibold text-neutral-900 dark:text-white">{rock.structure}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chemical Composition */}
            {(rock.chemical_formula || rock.mineral_content) && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚗️</span>
                  Chemical Composition
                </h3>
                {rock.chemical_formula && (
                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Chemical Formula</p>
                    <p className="font-mono text-lg font-semibold text-neutral-900 dark:text-white">{rock.chemical_formula}</p>
                  </div>
                )}
                {rock.mineral_content && Object.keys(rock.mineral_content).length > 0 && (
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white mb-2">Mineral Content:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(rock.mineral_content).map(([mineral, percentage]) => (
                        <div key={mineral} className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 px-3 py-2 rounded-lg">
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">{mineral}</span>
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Occurrence & Uses */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                Occurrence & Uses
              </h3>
              {rock.description && (
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  {rock.description}
                </p>
              )}
              {rock.occurrence && (
                <div className="mb-4">
                  <p className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Occurrence:
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">{rock.occurrence}</p>
                </div>
              )}
              {rock.uses && rock.uses.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Uses:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rock.uses.map((use, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {rock.economic_value && (
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Economic Value:
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">{rock.economic_value}</p>
                </div>
              )}
            </div>

            {/* Similar Rocks */}
            {rock.similar_rocks && rock.similar_rocks.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Similar Rocks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {rock.similar_rocks.map((similarRock, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                    >
                      {similarRock}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
