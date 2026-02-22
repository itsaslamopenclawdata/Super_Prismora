'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, EmptyState } from '@photoidentifier/ui';

interface GardenPlant {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  careTips: {
    water: string;
    light: string;
    soil: string;
    temperature: string;
  };
  isToxic: boolean;
  addedAt: string;
  imageUrl?: string;
}

export default function FloraPrismoraGardenPage() {
  const router = useRouter();
  const [garden, setGarden] = useState<GardenPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<GardenPlant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGarden();
  }, []);

  const loadGarden = () => {
    const storedGarden = JSON.parse(localStorage.getItem('floraprismora_garden') || '[]');
    setGarden(storedGarden);
  };

  const handleRemovePlant = (plantId: string) => {
    const updatedGarden = garden.filter(plant => plant.id !== plantId);
    setGarden(updatedGarden);
    localStorage.setItem('floraprismora_garden', JSON.stringify(updatedGarden));
    if (selectedPlant?.id === plantId) {
      setSelectedPlant(null);
    }
  };

  const filteredGarden = garden.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
                My Garden
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Manage your plant collection
              </p>
            </div>
            <button
              onClick={() => router.push('/floraprismora')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Plant
            </button>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {filteredGarden.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No plants found' : 'Your garden is empty'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Start by identifying plants and adding them to your garden'
            }
            action={
              searchQuery ? undefined : (
                <button
                  onClick={() => router.push('/floraprismora')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Identify Your First Plant
                </button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plant List */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {filteredGarden.map((plant) => (
                  <Card
                    key={plant.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlant?.id === plant.id
                        ? 'ring-2 ring-green-500'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedPlant(plant)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{plant.name}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                            {plant.scientificName}
                          </p>
                        </div>
                        {plant.isToxic && (
                          <Badge variant="error" size="sm">
                            Toxic
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">
                        Added {new Date(plant.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Plant Details */}
            <div className="lg:col-span-2">
              {selectedPlant ? (
                <Card>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{selectedPlant.name}</h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 italic">
                          {selectedPlant.scientificName}
                        </p>
                      </div>
                      {selectedPlant.isToxic && (
                        <Badge variant="error" size="lg">
                          ⚠️ Toxic
                        </Badge>
                      )}
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                      {selectedPlant.description}
                    </p>

                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Care Tips
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <span className="font-semibold text-blue-900 dark:text-blue-100">Water</span>
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{selectedPlant.careTips.water}</p>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="font-semibold text-yellow-900 dark:text-yellow-100">Light</span>
                        </div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{selectedPlant.careTips.light}</p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <span className="font-semibold text-amber-900 dark:text-amber-100">Soil</span>
                        </div>
                        <p className="text-sm text-amber-800 dark:text-amber-200">{selectedPlant.careTips.soil}</p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span className="font-semibold text-red-900 dark:text-red-100">Temperature</span>
                        </div>
                        <p className="text-sm text-red-800 dark:text-red-200">{selectedPlant.careTips.temperature}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleRemovePlant(selectedPlant.id)}
                        className="px-6 py-3 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Remove from Garden
                      </button>
                      <button
                        onClick={() => router.push('/floraprismora')}
                        className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium transition-colors"
                      >
                        Identify Another Plant
                      </button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
                      Select a Plant
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Click on a plant from the list to view its details
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
