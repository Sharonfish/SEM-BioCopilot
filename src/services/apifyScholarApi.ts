/**
 * Apify Google Scholar Scraper API Service
 *
 * This service integrates with Apify's Google Scholar scraper to search for academic papers.
 * It provides a type-safe interface for starting scraping runs, checking status, and retrieving results.
 *
 * @module apifyScholarApi
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a scholarly paper from Google Scholar
 */
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citationCount: number;
  url: string;
  abstract: string;
  source: string;
}

/**
 * Options for configuring a search
 */
export interface SearchOptions {
  maxResults?: number;
  sortBy?: 'relevance' | 'date';
}

/**
 * Response from starting an Apify Actor run
 */
export interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

/**
 * Response from checking Actor run status
 */
interface ApifyRunStatusResponse {
  data: {
    id: string;
    status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED';
    defaultDatasetId: string;
  };
}

/**
 * Raw item structure from Apify dataset (Google Scholar result)
 */
interface ApifyDatasetItem {
  title?: string;
  link?: string;
  authors?: string[];
  publicationDate?: string;
  citedBy?: string | number;
  description?: string;
  source?: string;
  [key: string]: any;
}

// ============================================================================
// Configuration
// ============================================================================

const APIFY_BASE_URL = 'https://api.apify.com/v2';
const ACTOR_ID = 'scrapestorm/google-scholar-scraper-cheap-affordable-rental';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const POLL_INTERVAL = 2000; // 2 seconds
const TIMEOUT = 30000; // 30 seconds

/**
 * Gets the Apify API token from environment variables
 * Supports both Next.js (process.env.NEXT_PUBLIC_*) and Vite (import.meta.env.VITE_*)
 * @throws {Error} If the API token is not configured
 */
function getApiToken(): string {
  let token: string | undefined;

  // Try Next.js environment variable first (client-side)
  if (typeof process !== 'undefined' && process.env) {
    token = process.env.NEXT_PUBLIC_APIFY_API_TOKEN;
  }

  // Fallback to Vite environment variable
  if (!token && typeof import.meta !== 'undefined') {
    const metaEnv = (import.meta as any).env;
    if (metaEnv) {
      token = metaEnv.VITE_APIFY_API_TOKEN;
    }
  }

  if (!token) {
    throw new Error(
      'Apify API token is not configured. Please set NEXT_PUBLIC_APIFY_API_TOKEN in your .env.local file.'
    );
  }
  return token;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Delays execution for a specified number of milliseconds
 * @param ms - Milliseconds to delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Makes an HTTP request with retry logic and exponential backoff
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retries - Number of retries remaining
 * @returns The response object
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Handle rate limiting
    if (response.status === 429) {
      if (retries > 0) {
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
        console.warn(`Rate limited. Retrying in ${retryDelay}ms... (${retries} retries left)`);
        await delay(retryDelay);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    // Handle server errors with retry
    if (response.status >= 500 && retries > 0) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`Server error (${response.status}). Retrying in ${retryDelay}ms... (${retries} retries left)`);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`Network error. Retrying in ${retryDelay}ms... (${retries} retries left)`, error);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transforms raw Apify dataset items into Paper objects
 * @param items - Raw items from Apify dataset
 * @returns Array of Paper objects
 */
function transformToPapers(items: ApifyDatasetItem[]): Paper[] {
  return items.map((item, index) => {
    // Extract year from publication date
    const year = item.publicationDate
      ? parseInt(item.publicationDate.match(/\d{4}/)?.[0] || '0')
      : 0;

    // Parse citation count
    let citationCount = 0;
    if (typeof item.citedBy === 'number') {
      citationCount = item.citedBy;
    } else if (typeof item.citedBy === 'string') {
      const match = item.citedBy.match(/\d+/);
      citationCount = match ? parseInt(match[0]) : 0;
    }

    return {
      id: item.link || `paper-${index}`,
      title: item.title || 'Untitled',
      authors: item.authors || [],
      year,
      citationCount,
      url: item.link || '',
      abstract: item.description || '',
      source: item.source || 'Google Scholar',
    };
  });
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Starts a new Google Scholar scraping run
 *
 * @param query - The search query for Google Scholar
 * @param options - Optional search configuration
 * @returns Object containing runId and datasetId
 * @throws {Error} If the API request fails
 *
 * @example
 * const { runId, datasetId } = await startScholarSearch('CRISPR gene editing', { maxResults: 20 });
 */
export async function startScholarSearch(
  query: string,
  options: SearchOptions = {}
): Promise<{ runId: string; datasetId: string }> {
  const token = getApiToken();
  const { maxResults = 10 } = options;

  console.log(`Starting Scholar search for: "${query}"`);

  const url = `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs?token=${token}`;
  const body = {
    queries: [query],
    maxResults,
  };

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to start scraping run: ${response.status} ${errorText}`);
    }

    const result: ApifyRunResponse = await response.json();

    console.log(`Run started successfully. Run ID: ${result.data.id}`);

    return {
      runId: result.data.id,
      datasetId: result.data.defaultDatasetId,
    };
  } catch (error) {
    console.error('Error starting Scholar search:', error);
    throw error;
  }
}

/**
 * Checks the status of a running Apify Actor
 *
 * @param runId - The ID of the Actor run to check
 * @returns The current status of the run
 * @throws {Error} If the API request fails
 *
 * @example
 * const status = await getRunStatus('abc123');
 * if (status === 'SUCCEEDED') {
 *   // Run completed successfully
 * }
 */
export async function getRunStatus(runId: string): Promise<string> {
  const token = getApiToken();
  const url = `${APIFY_BASE_URL}/actor-runs/${runId}?token=${token}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get run status: ${response.status} ${errorText}`);
    }

    const result: ApifyRunStatusResponse = await response.json();
    return result.data.status;
  } catch (error) {
    console.error('Error getting run status:', error);
    throw error;
  }
}

/**
 * Retrieves the scraped paper data from a completed dataset
 *
 * @param datasetId - The ID of the dataset to retrieve
 * @returns Array of Paper objects
 * @throws {Error} If the API request fails or dataset is empty
 *
 * @example
 * const papers = await getDatasetItems('dataset123');
 * console.log(`Found ${papers.length} papers`);
 */
export async function getDatasetItems(datasetId: string): Promise<Paper[]> {
  const token = getApiToken();
  const url = `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${token}`;

  console.log(`Retrieving dataset items from: ${datasetId}`);

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get dataset items: ${response.status} ${errorText}`);
    }

    const items: ApifyDatasetItem[] = await response.json();

    if (!items || items.length === 0) {
      console.warn('No items found in dataset');
      return [];
    }

    const papers = transformToPapers(items);
    console.log(`Successfully retrieved ${papers.length} papers`);

    return papers;
  } catch (error) {
    console.error('Error getting dataset items:', error);
    throw error;
  }
}

/**
 * Convenience function that performs a complete search operation
 *
 * This function:
 * 1. Starts a new scraping run
 * 2. Polls for completion (checks every 2 seconds)
 * 3. Retrieves and returns the results
 * 4. Times out after 30 seconds
 *
 * @param query - The search query for Google Scholar
 * @param options - Optional search configuration
 * @returns Array of Paper objects
 * @throws {Error} If the search fails or times out
 *
 * @example
 * const papers = await searchPapers('machine learning in genomics');
 * papers.forEach(paper => {
 *   console.log(`${paper.title} (${paper.year}) - ${paper.citationCount} citations`);
 * });
 */
export async function searchPapers(
  query: string,
  options: SearchOptions = {}
): Promise<Paper[]> {
  console.log(`\n=== Starting Paper Search ===`);
  console.log(`Query: "${query}"`);
  console.log(`Options:`, options);

  try {
    // Step 1: Start the scraping run
    const { runId, datasetId } = await startScholarSearch(query, options);

    // Step 2: Poll for completion
    const startTime = Date.now();
    let status = 'RUNNING';

    while (status === 'RUNNING' || status === 'READY') {
      // Check timeout
      if (Date.now() - startTime > TIMEOUT) {
        throw new Error(`Search timed out after ${TIMEOUT / 1000} seconds`);
      }

      // Wait before checking status
      await delay(POLL_INTERVAL);

      // Check status
      status = await getRunStatus(runId);
      console.log(`Run status: ${status}`);

      if (status === 'SUCCEEDED') {
        break;
      }

      if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Actor run ${status.toLowerCase()}`);
      }
    }

    // Step 3: Retrieve results
    const papers = await getDatasetItems(datasetId);

    console.log(`=== Search Complete ===`);
    console.log(`Found ${papers.length} papers\n`);

    return papers;
  } catch (error) {
    console.error('=== Search Failed ===');
    console.error(error);
    throw error;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  startScholarSearch,
  getRunStatus,
  getDatasetItems,
  searchPapers,
};
