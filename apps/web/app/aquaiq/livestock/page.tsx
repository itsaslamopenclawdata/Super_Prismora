'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Fish {
  id: string;
  common_name: string;
  scientific_name?: string;
  fish_type: 'freshwater' | 'saltwater' | 'brackish';
  tank_id: string;
  tank_name: string;
  added_date: string;
  quantity: number;
  notes?: string;
  photo_url?: string;
  status: 'healthy' | 'sick' | 'quarantined' | 'deceased';
}

interface DiseaseLog {
  id: string;
  fish_id: string;
  fish_name: string;
  disease_name: string;
  symptoms: string;
  treatment: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'resolved' | 'deceased';
}

export default function AquaIQLivestock() {
  const router = useRouter();
  const [fish, setFish] = useState<Fish[]>([]);
  const [diseaseLogs, setDiseaseLogs] = useState<DiseaseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'fish' | 'diseases'>('fish');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFishType, setFilterFishType] = useState<string>('all');
  const [showAddFish, setShowAddFish] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fishRes, diseasesRes] = await Promise.all([
        fetch('/api/aquaiq/livestock'),
        fetch('/api/aquaiq/diseases'),
      ]);

      if (!fishRes.ok || !diseasesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [fishData, diseasesData] = await Promise.all([
        fishRes.json(),
        diseasesRes.json(),
      ]);

      setFish(fishData);
      setDiseaseLogs(diseasesData);
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
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'quarantined':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'deceased':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
      case 'active':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'sick':
        return 'Sick';
      case 'quarantined':
        return 'Quarantined';
      case 'deceased':
        return 'Deceased';
      case 'active':
        return 'Active';
      case 'resolved':
        return 'Resolved';
      default:
        return 'Unknown';
    }
  };

  const filteredFish = fish.filter(f => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (filterFishType !== 'all' && f.fish_type !== filterFishType) return false;
    return true;
  });

  const filteredDiseases = diseaseLogs.filter(d => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/aquaiq/dashboard')}
            className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
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
                  Livestock & Disease Management
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddFish(true)}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Fish
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setActiveTab('fish')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'fish'
                  ? 'text-cyan-600 border-b-2 border-cyan-600 dark:text-cyan-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Livestock ({fish.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('diseases')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'diseases'
                  ? 'text-red-600 border-b-2 border-red-600 dark:text-red-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Disease Logs ({diseaseLogs.length})
              </span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {activeTab === 'fish' ? (
              <>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="healthy">Healthy</option>
                    <option value="sick">Sick</option>
                    <option value="quarantined">Quarantined</option>
                    <option value="deceased">Deceased</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Type
                  </label>
                  <select
                    value={filterFishType}
                    onChange={(e) => setFilterFishType(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="freshwater">Freshwater</option>
                    <option value="saltwater">Saltwater</option>
                    <option value="brackish">Brackish</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}

            <div className="px-4 py-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <p className="text-sm text-cyan-800 dark:text-cyan-200">
                Showing {activeTab === 'fish' ? filteredFish.length : filteredDiseases.length} of {activeTab === 'fish' ? fish.length : diseaseLogs.length} records
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-error-900 dark:text-error-100 mb-2">
              Error Loading Data
            </h2>
            <p className="text-error-700 dark:text-error-300 mb-4">
              {error}
            </p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : activeTab === 'fish' ? (
          /* Fish List */
          filteredFish.length === 0 ? (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🐟</div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                No Fish Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Add your first fish to start tracking!
              </p>
              <button
                onClick={() => setShowAddFish(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Your First Fish
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFish.map((fishItem) => (
                <div
                  key={fishItem.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Fish Image */}
                  {fishItem.photo_url ? (
                    <div className="aspect-video relative">
                      <img
                        src={fishItem.photo_url}
                        alt={fishItem.common_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center">
                      <span className="text-6xl">🐟</span>
                    </div>
                  )}

                  {/* Fish Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                        {fishItem.common_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(fishItem.status)}`}>
                        {getStatusLabel(fishItem.status)}
                      </span>
                    </div>

                    {fishItem.scientific_name && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 italic mb-2">
                        {fishItem.scientific_name}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 rounded text-xs font-medium">
                        {fishItem.fish_type}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                        Qty: {fishItem.quantity}
                      </span>
                    </div>

                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      <p>Tank: {fishItem.tank_name}</p>
                      <p>Added: {new Date(fishItem.added_date).toLocaleDateString()}</p>
                    </div>

                    {fishItem.notes && (
                      <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {fishItem.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Disease Logs */
          filteredDiseases.length === 0 ? (
            <div className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                No Disease Logs Found
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Disease logs will appear here when you record treatments.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 dark:bg-neutral-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Fish
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Disease
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Symptoms
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Treatment
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900 dark:text-white">
                        Start Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {filteredDiseases.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-white">
                              {log.fish_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-neutral-700 dark:text-neutral-300">{log.disease_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-neutral-700 dark:text-neutral-300 text-sm max-w-xs">
                            {log.symptoms}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-neutral-700 dark:text-neutral-300 text-sm max-w-xs">
                            {log.treatment}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                            {getStatusLabel(log.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                            {new Date(log.start_date).toLocaleDateString()}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
