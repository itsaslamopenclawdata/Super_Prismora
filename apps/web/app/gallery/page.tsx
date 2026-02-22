'use client';

import { useState } from 'react';

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
            Gallery
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white dark:bg-neutral-800 rounded-lg shadow-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search photos..."
                className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select className="px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">All Formats</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-xl p-12 shadow-lg text-center">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-2xl font-bold mb-2 text-neutral-900 dark:text-white">
            No photos yet
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Upload your first photo to get started
          </p>
          <a
            href="/upload"
            className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            Upload Photos
          </a>
        </div>
      </div>
    </div>
  );
}
