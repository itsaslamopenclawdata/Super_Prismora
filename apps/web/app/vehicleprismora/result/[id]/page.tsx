'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConfidenceCard } from '@super-prismora/ui';

interface VehicleIdentificationData {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  confidence: number;
  body_type: string;
  vehicle_class: string;
  drive_train: string;
  engine_type: string;
  engine_size: string;
  horsepower: number;
  torque: number;
  transmission: string;
  fuel_type: string;
  fuel_economy_city: number;
  fuel_economy_highway: number;
  fuel_economy_combined: number;
  zero_to_sixty: number;
  top_speed: number;
  exterior_colors: string[];
  description: string;
  notable_features: string;
  generation: string;
  production_years: string;
  country_of_origin: string;
  photo_url: string;
  created_at: string;
}

export default function VehicleResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleIdentificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicleDetails();
  }, [params.id]);

  const fetchVehicleDetails = async () => {
    try {
      const response = await fetch(`/api/vehicle/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle details');
      }
      const data = await response.json();
      setVehicle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    router.push('/vehicleprismora/scan');
  };

  const handleSaveToGallery = async () => {
    if (!vehicle) return;

    try {
      await fetch('/api/collections/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identification_id: vehicle.id,
          collection_name: 'Vehicles',
        }),
      });
      alert('Vehicle saved to your collection!');
    } catch (err) {
      console.error('Error saving vehicle:', err);
      alert('Failed to save vehicle. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-error-900 dark:text-error-100 mb-2">
              Error Loading Vehicle Details
            </h2>
            <p className="text-error-700 dark:text-error-300 mb-4">
              {error || 'Vehicle not found'}
            </p>
            <button
              onClick={handleRescan}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Scan Another Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-neutral-900 dark:to-neutral-800">
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
            Scan Another Vehicle
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                Vehicle Identification Result
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Detailed vehicle specifications and information
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
                src={vehicle.photo_url}
                alt={vehicle.make}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Confidence Card */}
            <ConfidenceCard
              confidence={vehicle.confidence}
              label="Identification Confidence"
              color="blue"
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
                  onClick={() => router.push('/vehicleprismora/gallery')}
                  className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  View My Collection
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Title */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h2>
              {vehicle.trim && (
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-3">
                  {vehicle.trim}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {vehicle.body_type}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  {vehicle.vehicle_class}
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                  {vehicle.drive_train}
                </span>
              </div>
            </div>

            {/* Engine & Performance */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                Engine & Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Engine</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.engine_type}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Engine Size</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.engine_size}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Horsepower</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.horsepower} hp</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Torque</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.torque} lb-ft</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Transmission</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.transmission}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Fuel Type</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.fuel_type}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">0-60 mph</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.zero_to_sixty} sec</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Top Speed</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.top_speed} mph</p>
                </div>
              </div>
            </div>

            {/* Fuel Economy */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">⛽</span>
                Fuel Economy
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {vehicle.fuel_economy_city}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">City MPG</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {vehicle.fuel_economy_highway}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Highway MPG</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {vehicle.fuel_economy_combined}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Combined MPG</p>
                </div>
              </div>
            </div>

            {/* Description & Features */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Details & Features
              </h3>
              {vehicle.description && (
                <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                  {vehicle.description}
                </p>
              )}
              {vehicle.notable_features && (
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Notable Features:
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {vehicle.notable_features}
                  </p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Generation</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.generation}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Production Years</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.production_years}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Country of Origin</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{vehicle.country_of_origin}</p>
                </div>
              </div>
              {vehicle.exterior_colors && vehicle.exterior_colors.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-neutral-900 dark:text-white mb-2">
                    Available Colors:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.exterior_colors.map((color, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
