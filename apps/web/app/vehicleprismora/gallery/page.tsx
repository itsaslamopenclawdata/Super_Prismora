'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VehicleIdentification {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  body_type: string;
  confidence: number;
  photo_url: string;
  created_at: string;
}

export default function VehicleGalleryPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleIdentification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'year'>('date');
  const [filterBodyType, setFilterBodyType] = useState<string>('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const data = await response.json();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedVehicles = vehicles
    .filter(v => filterBodyType === 'all' || v.body_type === filterBodyType)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      } else if (sortBy === 'year') {
        return (b.year || 0) - (a.year || 0);
      }
      return 0;
    });

  const bodyTypes = ['all', ...Array.from(new Set(vehicles.map(v => v.body_type)))];

  const handleVehicleClick = (id: string) => {
    router.push(`/vehicleprismora/result/${id}`);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Vehicle Collection
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your identified vehicles
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/vehicleprismora/scan')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Identify Vehicle
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Date Added (Newest)</option>
                <option value="confidence">Confidence (Highest)</option>
                <option value="year">Year (Newest)</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Body Type
              </label>
              <select
                value={filterBodyType}
                onChange={(e) => setFilterBodyType(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {bodyTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Showing {filteredAndSortedVehicles.length} of {vehicles.length} vehicles
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-error-900 dark:text-error-100 mb-2">
              Error Loading Collection
            </h2>
            <p className="text-error-700 dark:text-error-300 mb-4">
              {error}
            </p>
            <button
              onClick={fetchVehicles}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedVehicles.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              No Vehicles Yet
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Start identifying vehicles to build your collection!
            </p>
            <button
              onClick={() => router.push('/vehicleprismora/scan')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Identify Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle.id)}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Vehicle Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={vehicle.photo_url}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className={`text-sm font-semibold ${getConfidenceColor(vehicle.confidence)}`}>
                      {getConfidenceLabel(vehicle.confidence)}
                    </span>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                      {vehicle.trim}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                      {vehicle.body_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <span>Confidence: {(vehicle.confidence * 100).toFixed(0)}%</span>
                    <span>{new Date(vehicle.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
