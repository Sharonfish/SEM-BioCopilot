'use client';

import { useState } from 'react';
import { searchPapers, type Paper } from '@/services/apifyScholarApi';

/**
 * Test page for Apify Scholar API
 * Navigate to http://localhost:3000/test-apify to use this page
 */
export default function TestApifyPage() {
  const [query, setQuery] = useState('machine learning');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setPapers([]);
    setLogs([]);

    try {
      addLog(`Starting search for: "${query}"`);
      const results = await searchPapers(query, { maxResults: 5 });
      addLog(`✓ Search completed successfully!`);
      addLog(`Found ${results.length} papers`);
      setPapers(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addLog(`✗ Search failed: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Apify Scholar API Test</h1>
        <p className="text-gray-600 mb-8">
          Test the Google Scholar scraper integration
        </p>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Environment Check */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <strong>API Token Status:</strong>{' '}
            {process.env.NEXT_PUBLIC_APIFY_API_TOKEN ? (
              <span className="text-green-600">✓ Configured</span>
            ) : (
              <span className="text-red-600">✗ Not configured (check .env.local)</span>
            )}
          </div>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6 font-mono text-sm">
            <div className="font-bold mb-2">Console Logs:</div>
            {logs.map((log, i) => (
              <div key={i} className="py-1">{log}</div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-xl">✗</span>
              <div>
                <h3 className="font-bold text-red-900 mb-1">Error</h3>
                <p className="text-red-700">{error}</p>
                <div className="mt-3 text-sm text-red-600">
                  <p className="font-semibold">Troubleshooting:</p>
                  <ul className="list-disc ml-5 mt-1 space-y-1">
                    <li>Check that VITE_APIFY_API_TOKEN is set in .env.local</li>
                    <li>Verify your Apify account has credits available</li>
                    <li>Ensure you have internet connectivity</li>
                    <li>Check browser console for detailed errors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {papers.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Results ({papers.length} papers)
            </h2>
            <div className="space-y-4">
              {papers.map((paper, index) => (
                <div key={paper.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {paper.title}
                        </a>
                      </h3>

                      <div className="text-sm text-gray-600 mb-3">
                        <div className="mb-1">
                          <strong>Authors:</strong> {paper.authors.join(', ') || 'N/A'}
                        </div>
                        <div className="flex gap-4">
                          <span><strong>Year:</strong> {paper.year || 'N/A'}</span>
                          <span><strong>Citations:</strong> {paper.citationCount}</span>
                          <span><strong>Source:</strong> {paper.source}</span>
                        </div>
                      </div>

                      {paper.abstract && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {paper.abstract}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!loading && papers.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">How to test:</h3>
            <ol className="list-decimal ml-5 text-blue-800 space-y-1">
              <li>Make sure you've set up your .env.local file with VITE_APIFY_API_TOKEN</li>
              <li>Enter a search query above (default: "machine learning")</li>
              <li>Click "Search" and wait for results (may take 10-30 seconds)</li>
              <li>View the papers returned from Google Scholar</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
