export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Total Photos
            </h3>
            <p className="text-4xl font-bold text-primary-600">0</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Processed
            </h3>
            <p className="text-4xl font-bold text-success-600">0</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Pending
            </h3>
            <p className="text-4xl font-bold text-warning-600">0</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Storage Used
            </h3>
            <p className="text-4xl font-bold text-secondary-600">0 MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Recent Uploads</h2>
            <p className="text-neutral-600 dark:text-neutral-400">No recent uploads</p>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Popular Tags</h2>
            <p className="text-neutral-600 dark:text-neutral-400">No tags yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
