import { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // When the page loads, check if the backend server is running
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Cannot connect to server. Is the backend running?');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          🔍 Crime Investigation System
        </h1>
        <p className="text-gray-400 mb-6">
          AI-Powered Investigation Platform
        </p>

        {/* Divider */}
        <hr className="border-gray-700 mb-6" />

        {/* Server Status */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-300 mb-3">
            Server Status
          </h2>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <span className="animate-spin text-xl">⏳</span>
              <span>Checking server connection...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {health && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 space-y-2">
              <p className="text-green-400 text-lg font-medium">
                ✅ {health.message}
              </p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>
                  Environment:{' '}
                  <span className="text-gray-300">{health.environment}</span>
                </p>
                <p>
                  Timestamp:{' '}
                  <span className="text-gray-300">
                    {new Date(health.timestamp).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm mt-6">
          Step 1 Complete — Project Initialized ✓
        </p>
      </div>
    </div>
  );
}

export default App;
