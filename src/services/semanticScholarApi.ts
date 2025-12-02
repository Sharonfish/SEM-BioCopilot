/**
 * Semantic Scholar API Service
 *
 * This service integrates with Semantic Scholar's academic graph API to search for papers,
 * get citations, and build citation networks.
 *
 * API Documentation: https://api.semanticscholar.org/
 * Rate Limit: 1 request per second (enforced by request queue)
 *
 * @module semanticScholarApi
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Represents a scholarly paper from Semantic Scholar
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
  venue?: string;
  influentialCitationCount?: number;
  referenceCount?: number;
  tldr?: string;
  fieldsOfStudy?: string[];
  externalIds?: {
    DOI?: string;
    PubMed?: string;
    ArXiv?: string;
  };
}

/**
 * Options for configuring a search
 */
export interface SearchOptions {
  maxResults?: number;
  sortBy?: 'relevance' | 'citationCount' | 'publicationDate';
  yearFrom?: number;
  yearTo?: number;
  venue?: string;
  fieldsOfStudy?: string[];
}

/**
 * Response from Semantic Scholar paper search
 */
interface SemanticScholarSearchResponse {
  total: number;
  offset: number;
  next?: number;
  data: SemanticScholarPaper[];
}

/**
 * Raw paper object from Semantic Scholar API
 */
interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  venue?: string;
  year?: number;
  citationCount?: number;
  influentialCitationCount?: number;
  referenceCount?: number;
  authors?: Array<{
    authorId: string;
    name: string;
  }>;
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
    PubMed?: string;
  };
  url?: string;
  tldr?: {
    text: string;
  };
  fieldsOfStudy?: string[];
}

/**
 * Paper details with citations
 */
interface PaperDetails extends SemanticScholarPaper {
  citations?: SemanticScholarPaper[];
  references?: SemanticScholarPaper[];
}

// ============================================================================
// Configuration
// ============================================================================

const SEMANTIC_SCHOLAR_BASE_URL = 'https://api.semanticscholar.org/graph/v1';
const RATE_LIMIT_DELAY = 1100; // 1.1 seconds (slightly over 1 req/sec for safety)
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const DEFAULT_FIELDS = 'paperId,title,abstract,venue,year,citationCount,influentialCitationCount,referenceCount,authors,externalIds,url,tldr,fieldsOfStudy';

/**
 * Gets the Semantic Scholar API key from environment variables
 * @throws {Error} If the API key is not configured
 */
function getApiKey(): string {
  let apiKey: string | undefined;

  // Try Next.js environment variable first (server-side)
  if (typeof process !== 'undefined' && process.env) {
    apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY || process.env.NEXT_PUBLIC_SEMANTIC_SCHOLAR_API_KEY;
  }

  // Fallback to client-side environment variable
  if (!apiKey && typeof window !== 'undefined') {
    apiKey = process.env.NEXT_PUBLIC_SEMANTIC_SCHOLAR_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      'Semantic Scholar API key is not configured. Please set SEMANTIC_SCHOLAR_API_KEY in your .env.local file.'
    );
  }

  return apiKey;
}

// ============================================================================
// Request Queue for Rate Limiting
// ============================================================================

class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;

  /**
   * Adds a request to the queue
   */
  async enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Processes queued requests with rate limiting
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      // Wait if we need to respect rate limit
      if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
      }

      const requestFn = this.queue.shift();
      if (requestFn) {
        this.lastRequestTime = Date.now();
        await requestFn();
      }
    }

    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Delays execution for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Makes an HTTP request with retry logic and exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<Response> {
  try {
    const response = await fetch(url, options);

    // Handle rate limiting (429)
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
      console.warn(`Server error (${response.status}). Retrying in ${retryDelay}ms...`);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);
      console.warn(`Network error. Retrying in ${retryDelay}ms...`, error);
      await delay(retryDelay);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transforms Semantic Scholar paper to our Paper format
 */
function transformToPaper(paper: SemanticScholarPaper): Paper {
  return {
    id: paper.paperId,
    title: paper.title || 'Untitled',
    authors: paper.authors?.map(a => a.name) || [],
    year: paper.year || 0,
    citationCount: paper.citationCount || 0,
    url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
    abstract: paper.abstract || paper.tldr?.text || '',
    source: 'Semantic Scholar',
    venue: paper.venue || 'Unknown',
    influentialCitationCount: paper.influentialCitationCount,
    referenceCount: paper.referenceCount,
    tldr: paper.tldr?.text,
    fieldsOfStudy: paper.fieldsOfStudy || [],
    externalIds: paper.externalIds,
  };
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Searches for papers by query string
 *
 * @param query - The search query
 * @param options - Search options
 * @returns Array of Paper objects
 *
 * @example
 * const papers = await searchPapers('CRISPR gene editing', { maxResults: 20 });
 */
export async function searchPapers(
  query: string,
  options: SearchOptions = {}
): Promise<Paper[]> {
  const { maxResults = 20, yearFrom, yearTo, venue, fieldsOfStudy } = options;

  console.log(`Searching Semantic Scholar for: "${query}"`);

  return requestQueue.enqueue(async () => {
    try {
      const apiKey = getApiKey();

      // Build query parameters
      const params = new URLSearchParams({
        query,
        limit: Math.min(maxResults, 100).toString(),
        fields: DEFAULT_FIELDS,
      });

      if (yearFrom) params.append('year', `${yearFrom}-`);
      if (yearTo) params.append('year', `-${yearTo}`);
      if (yearFrom && yearTo) params.set('year', `${yearFrom}-${yearTo}`);
      if (venue) params.append('venue', venue);
      if (fieldsOfStudy && fieldsOfStudy.length > 0) {
        params.append('fieldsOfStudy', fieldsOfStudy.join(','));
      }

      const url = `${SEMANTIC_SCHOLAR_BASE_URL}/paper/search?${params.toString()}`;

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Search failed: ${response.status} ${errorText}`);
      }

      const result: SemanticScholarSearchResponse = await response.json();

      if (!result.data || result.data.length === 0) {
        console.warn('No papers found for query:', query);
        return [];
      }

      const papers = result.data.map(transformToPaper);
      console.log(`Found ${papers.length} papers`);

      return papers;
    } catch (error) {
      console.error('Error searching papers:', error);
      throw error;
    }
  });
}

/**
 * Gets detailed information about a paper including citations
 *
 * @param paperId - The Semantic Scholar paper ID
 * @returns Paper with citation details
 *
 * @example
 * const paper = await getPaperDetails('649def34f8be52c8b66281af98ae884c09aef38b');
 */
export async function getPaperDetails(paperId: string): Promise<Paper> {
  console.log(`Fetching paper details for: ${paperId}`);

  return requestQueue.enqueue(async () => {
    try {
      const apiKey = getApiKey();
      const url = `${SEMANTIC_SCHOLAR_BASE_URL}/paper/${paperId}?fields=${DEFAULT_FIELDS}`;

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get paper details: ${response.status} ${errorText}`);
      }

      const paper: SemanticScholarPaper = await response.json();
      return transformToPaper(paper);
    } catch (error) {
      console.error('Error getting paper details:', error);
      throw error;
    }
  });
}

/**
 * Gets papers that cite the given paper (derivative works)
 *
 * @param paperId - The Semantic Scholar paper ID
 * @param limit - Maximum number of citations to retrieve
 * @returns Array of citing papers
 *
 * @example
 * const citations = await getCitations('649def34f8be52c8b66281af98ae884c09aef38b', 50);
 */
export async function getCitations(paperId: string, limit = 50): Promise<Paper[]> {
  console.log(`Fetching citations for: ${paperId}`);

  return requestQueue.enqueue(async () => {
    try {
      const apiKey = getApiKey();
      const url = `${SEMANTIC_SCHOLAR_BASE_URL}/paper/${paperId}/citations?fields=${DEFAULT_FIELDS}&limit=${Math.min(limit, 1000)}`;

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get citations: ${response.status} ${errorText}`);
      }

      const result: { data: Array<{ citingPaper: SemanticScholarPaper }> } = await response.json();

      if (!result.data || result.data.length === 0) {
        return [];
      }

      const papers = result.data.map(item => transformToPaper(item.citingPaper));
      console.log(`Found ${papers.length} citing papers`);

      return papers;
    } catch (error) {
      console.error('Error getting citations:', error);
      throw error;
    }
  });
}

/**
 * Gets papers referenced by the given paper (prior works)
 *
 * @param paperId - The Semantic Scholar paper ID
 * @param limit - Maximum number of references to retrieve
 * @returns Array of referenced papers
 *
 * @example
 * const references = await getReferences('649def34f8be52c8b66281af98ae884c09aef38b', 50);
 */
export async function getReferences(paperId: string, limit = 50): Promise<Paper[]> {
  console.log(`Fetching references for: ${paperId}`);

  return requestQueue.enqueue(async () => {
    try {
      const apiKey = getApiKey();
      const url = `${SEMANTIC_SCHOLAR_BASE_URL}/paper/${paperId}/references?fields=${DEFAULT_FIELDS}&limit=${Math.min(limit, 1000)}`;

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get references: ${response.status} ${errorText}`);
      }

      const result: { data: Array<{ citedPaper: SemanticScholarPaper }> } = await response.json();

      if (!result.data || result.data.length === 0) {
        return [];
      }

      const papers = result.data.map(item => transformToPaper(item.citedPaper));
      console.log(`Found ${papers.length} referenced papers`);

      return papers;
    } catch (error) {
      console.error('Error getting references:', error);
      throw error;
    }
  });
}

/**
 * Gets recommended papers based on a single paper
 *
 * @param paperId - The Semantic Scholar paper ID
 * @param limit - Maximum number of recommendations
 * @returns Array of recommended papers
 *
 * @example
 * const recommendations = await getRecommendations('649def34f8be52c8b66281af98ae884c09aef38b', 10);
 */
export async function getRecommendations(paperId: string, limit = 10): Promise<Paper[]> {
  console.log(`Fetching recommendations for: ${paperId}`);

  return requestQueue.enqueue(async () => {
    try {
      const apiKey = getApiKey();
      const url = `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${paperId}?fields=${DEFAULT_FIELDS}&limit=${Math.min(limit, 500)}`;

      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get recommendations: ${response.status} ${errorText}`);
      }

      const result: { recommendedPapers: SemanticScholarPaper[] } = await response.json();

      if (!result.recommendedPapers || result.recommendedPapers.length === 0) {
        return [];
      }

      const papers = result.recommendedPapers.map(transformToPaper);
      console.log(`Found ${papers.length} recommended papers`);

      return papers;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  });
}

/**
 * Builds a complete citation network for a paper
 * Fetches the paper, its citations, and references
 *
 * @param paperId - The Semantic Scholar paper ID or search query
 * @param maxCitations - Maximum number of citations to fetch
 * @param maxReferences - Maximum number of references to fetch
 * @returns Object containing origin paper, citations, and references
 *
 * @example
 * const network = await buildCitationNetwork('CRISPR gene editing', 30, 30);
 */
export async function buildCitationNetwork(
  paperIdOrQuery: string,
  maxCitations = 30,
  maxReferences = 30
): Promise<{
  originPaper: Paper;
  citations: Paper[];
  references: Paper[];
  allPapers: Paper[];
}> {
  console.log(`\n=== Building Citation Network ===`);
  console.log(`Input: "${paperIdOrQuery}"`);

  try {
    // Determine if input is a paper ID or search query
    let originPaper: Paper;

    if (paperIdOrQuery.length === 40 && /^[a-f0-9]+$/.test(paperIdOrQuery)) {
      // Looks like a paper ID
      originPaper = await getPaperDetails(paperIdOrQuery);
    } else {
      // Treat as search query - get top result
      const searchResults = await searchPapers(paperIdOrQuery, { maxResults: 1 });
      if (searchResults.length === 0) {
        throw new Error(`No papers found for query: ${paperIdOrQuery}`);
      }
      originPaper = searchResults[0];
    }

    console.log(`Origin paper: "${originPaper.title}"`);

    // Fetch citations and references in parallel
    const [citations, references] = await Promise.all([
      getCitations(originPaper.id, maxCitations),
      getReferences(originPaper.id, maxReferences),
    ]);

    const allPapers = [originPaper, ...citations, ...references];

    console.log(`=== Network Complete ===`);
    console.log(`Origin: 1 paper`);
    console.log(`Citations: ${citations.length} papers`);
    console.log(`References: ${references.length} papers`);
    console.log(`Total: ${allPapers.length} papers\n`);

    return {
      originPaper,
      citations,
      references,
      allPapers,
    };
  } catch (error) {
    console.error('=== Network Build Failed ===');
    console.error(error);
    throw error;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  searchPapers,
  getPaperDetails,
  getCitations,
  getReferences,
  getRecommendations,
  buildCitationNetwork,
};
