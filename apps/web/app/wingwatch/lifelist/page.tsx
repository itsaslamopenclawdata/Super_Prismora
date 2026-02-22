'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, EmptyState, Button } from '@photoidentifier/ui';

interface LifeListBird {
  id: string;
  name: string;
  scientificName: string;
  confidence: number;
  description: string;
  family: string;
  habitat: string;
  range: string;
  diet: string;
  size: string;
  firstSighted: string;
  sightings: number;
  method: 'photo' | 'audio';
}

export default function WingWatchLifeListPage() {
  const router = useRouter();
  const [lifeList, setLifeList] = useState<LifeListBird[]>([]);
  const [selectedBird, setSelectedBird] = useState<LifeListBird | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLifeList();
  }, []);

  const loadLifeList = () => {
    const storedList = JSON.parse(localStorage.getItem('wingwatch_lifelist') || '[]');
    setLifeList(storedList);
  };

  const handleRemoveBird = (birdId: string) => {
    const updatedList = lifeList.filter(bird => bird.id !== birdId);
    setLifeList(updatedList);
    localStorage.setItem('wingwatch_lifelist', JSON.stringify(updatedList));
    if (selectedBird?.id === birdId) {
      setSelectedBird(null);
    }
  };

  const handleIncrementSighting = (birdId: string) => {
    const updatedList = lifeList.map(bird =>
      bird.id === birdId
        ? { ...bird, sightings: bird.sightings + 1 }
        : bird
    );
    setLifeList(updatedList);
    localStorage.setItem('wingwatch_lifelist', JSON.stringify(updatedList));
    if (selectedBird?.id === birdId) {
      setSelectedBird({ ...selectedBird, sightings: selectedBird.sightings + 1 });
    }
  };

  const filteredList = lifeList.filter(bird =>
    bird.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bird.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpecies = lifeList.length;
  const totalSightings = lifeList.reduce((sum, bird) => sum + bird.sightings, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-sky-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-sky-600 to-blue-600 text-transparent bg-clip-text">
                My Life List
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Track your bird sightings
              </p>
            </div>
            <Button
              onClick={() => router.push('/wingwatch')}
              className="bg-sky-600 hover:bg-sky-700 text-white"
            >
              Identify Bird
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSpecies}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Species</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSightings}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Sightings</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalSpecies > 0
                      ? Math.round((totalSpecies / 10000) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">of World Species</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search birds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {filteredList.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No birds found' : 'Your life list is empty'}
            description={
              searchQuery
                ? 'Try a different search term'
                : 'Start identifying birds to build your life list'
            }
            action={
              searchQuery ? undefined : (
                <Button
                  onClick={() => router.push('/wingwatch')}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  Identify Your First Bird
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bird List */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {filteredList.map((bird) => (
                  <Card
                    key={bird.id}
                    className={`cursor-pointer transition-all ${
                      selectedBird?.id === bird.id
                        ? 'ring-2 ring-sky-500'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedBird(bird)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{bird.name}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                            {bird.scientificName}
                          </p>
                        </div>
                        <Badge variant="info" size="sm">
                          {bird.sightings} {bird.sightings === 1 ? 'sighting' : 'sightings'}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-2">
                        First seen {new Date(bird.firstSighted).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant={bird.method === 'photo' ? 'primary' : 'secondary'} size="sm">
                          {bird.method === 'photo' ? '📷 Photo' : '🎤 Audio'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bird Details */}
            <div className="lg:col-span-2">
              {selectedBird ? (
                <Card>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold mb-1">{selectedBird.name}</h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 italic">
                          {selectedBird.scientificName}
                        </p>
                      </div>
                      <Badge variant="info" size="lg">
                        {selectedBird.sightings} {selectedBird.sightings === 1 ? 'sighting' : 'sightings'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-sky-50 dark:bg-sky-950 rounded-lg p-4">
                        <p className="text-sm text-sky-600 dark:text-sky-400 mb-1">First Sighted</p>
                        <p className="font-semibold text-sky-900 dark:text-sky-100">
                          {new Date(selectedBird.firstSighted).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="bg-indigo-50 dark:bg-indigo-950 rounded-lg p-4">
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Family</p>
                        <p className="font-semibold text-indigo-900 dark:text-indigo-100">{selectedBird.family}</p>
                      </div>
                    </div>

                    <p className="text-neutral-700 dark:text-neutral-300 mb-6 leading-relaxed">
                      {selectedBird.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Habitat</p>
                        <p className="text-sm font-semibold">{selectedBird.habitat}</p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Range</p>
                        <p className="text-sm font-semibold">{selectedBird.range}</p>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Diet</p>
                        <p className="text-sm font-semibold">{selectedBird.diet}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleIncrementSighting(selectedBird.id)}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Add Sighting
                      </button>
                      <button
                        onClick={() => handleRemoveBird(selectedBird.id)}
                        className="px-6 py-3 bg-error-600 hover:bg-error-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Remove
                      </button>
                      <Button
                        onClick={() => router.push('/wingwatch')}
                        className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200"
                      >
                        Identify New Bird
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-700 dark:text-neutral-300">
                      Select a Bird
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Click on a bird from the list to view its details
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
