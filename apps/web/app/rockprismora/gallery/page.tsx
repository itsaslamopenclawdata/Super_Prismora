'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RockIdentification {
  id: string;
  rock_name: string;
  rock_type: string;
  confidence: number;
  photo_url: string;
  created_at: string;
}

export default function RockGalleryPage() {
  const router = useRouter();
  const [rocks, setRocks] = useState<RockIdentification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [filterRockType, setFilterRockType] = useState<string>('all');

  useEffect(() => {
    fetchRocks();
  }, []);

  const fetchRocks = async () => {
    try {
      const response = await fetch('/api/rocks');
      if (!response.ok) {
        throw new Error('Failed to fetch rocks');
      }
      const data = await response.json();
      setRocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedRocks = rocks
    .filter(r => filterRockType === 'all' || r.rock_type === filterRockType)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      }
      return 0;
    });

  const rockTypes = ['all', ...Array.from(new Set(rocks.map(r => r.rock_type)))];

  const handleRockClick = (id: string) => {
    router.push(`/rockprismora/result/${id}`);
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-neutral-900 dark:to-neutral-800">
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
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Rock Collection
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your identified rocks and minerals
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/rockprismora/scan')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Identify Rock
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
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Rock Type
              </label>
              <select
                value={filterRockType}
                onChange={(e) => setFilterRockType(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {rockTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Showing {filteredAndSortedRocks.length} of {rocks.length} rocks
              </p>
            </div>
          </div>
        </div>

        {/* Rock Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
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
              onClick={fetchRocks}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedRocks.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🪨</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              No Rocks Yet
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Start identifying rocks to build your collection!
            </p>
            <button
              onClick={() => router.push('/rockprismora/scan')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Identify Your First Rock
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedRocks.map((rock) => (
              <div
                key={rock.id}
                onClick={() => handleRockClick(rock.id)}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Rock Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={rock.photo_url}
                    alt={rock.rock_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <span className={`text-sm font-semibold ${getConfidenceColor(rock.confidence)}`}>
                      {getConfidenceLabel(rock.confidence)}
                    </span>
                  </div>
                </div>

                {/* Rock Info */}
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
                    {rock.rock_name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded text-xs font-medium">
                      {rock.rock_type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <span>Confidence: {(rock.confidence * 100).toFixed(0)}%</span>
                    <span>{new Date(rock.created_at).toLocaleDateString()}</span>
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
