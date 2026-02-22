'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Tank {
  id: string;
  name: string;
  type: 'freshwater' | 'saltwater' | 'brackish';
  size: number; // in gallons
  temperature: number;
  ph: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  fish_count: number;
  last_water_change: string;
  status: 'healthy' | 'warning' | 'critical';
  created_at: string;
}

export default function AquaIQDashboard() {
  const router = useRouter();
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddTank, setShowAddTank] = useState(false);

  useEffect(() => {
    fetchTanks();
  }, []);

  const fetchTanks = async () => {
    try {
      const response = await fetch('/api/aquaiq/tanks');
      if (!response.ok) {
        throw new Error('Failed to fetch tanks');
      }
      const data = await response.json();
      setTanks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const handleTankClick = (tankId: string) => {
    router.push(`/aquaiq/tank/${tankId}`);
  };

  const daysSinceWaterChange = (date: string) => {
    const waterChangeDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - waterChangeDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-neutral-900 dark:to-neutral-800">
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
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  AquaIQ
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Tank Management Dashboard
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/aquaiq/livestock')}
                className="px-6 py-3 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                Livestock
              </button>
              <button
                onClick={() => setShowAddTank(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Tank
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Tanks</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{tanks.length}</p>
              </div>
              <div className="text-4xl">🐟</div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Fish</p>
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {tanks.reduce((sum, tank) => sum + tank.fish_count, 0)}
                </p>
              </div>
              <div className="text-4xl">🐠</div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Healthy Tanks</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {tanks.filter(t => t.status === 'healthy').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Need Attention</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {tanks.filter(t => t.status === 'warning' || t.status === 'critical').length}
                </p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>
        </div>

        {/* Tanks Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-error-900 dark:text-error-100 mb-2">
              Error Loading Tanks
            </h2>
            <p className="text-error-700 dark:text-error-300 mb-4">
              {error}
            </p>
            <button
              onClick={fetchTanks}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : tanks.length === 0 ? (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🐠</div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              No Tanks Yet
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Add your first tank to start tracking your aquarium!
            </p>
            <button
              onClick={() => setShowAddTank(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Your First Tank
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tanks.map((tank) => (
              <div
                key={tank.id}
                onClick={() => handleTankClick(tank.id)}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Tank Header */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{tank.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tank.status === 'healthy' ? 'bg-white/20 text-white' :
                      tank.status === 'warning' ? 'bg-yellow-400 text-yellow-900' :
                      'bg-red-400 text-red-900'
                    }`}>
                      {getStatusLabel(tank.status)}
                    </span>
                  </div>
                  <p className="text-cyan-100 text-sm mt-1">
                    {tank.type.charAt(0).toUpperCase() + tank.type.slice(1)} • {tank.size} gallons
                  </p>
                </div>

                {/* Tank Stats */}
                <div className="p-4 space-y-3">
                  {/* Water Parameters */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Temp</p>
                      <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{tank.temperature}°F</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">pH</p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{tank.ph}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Fish</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{tank.fish_count}</p>
                    </div>
                  </div>

                  {/* Nitrogen Cycle */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Ammonia</span>
                      <span className={`font-semibold ${tank.ammonia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tank.ammonia} ppm
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Nitrite</span>
                      <span className={`font-semibold ${tank.nitrite > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tank.nitrite} ppm
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Nitrate</span>
                      <span className={`font-semibold ${tank.nitrate > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {tank.nitrate} ppm
                      </span>
                    </div>
                  </div>

                  {/* Water Change Info */}
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Last water change: {daysSinceWaterChange(tank.last_water_change)} days ago
                    </span>
                    <span className={`font-semibold ${
                      daysSinceWaterChange(tank.last_water_change) > 14 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {daysSinceWaterChange(tank.last_water_change) > 14 ? 'Due' : 'OK'}
                    </span>
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
