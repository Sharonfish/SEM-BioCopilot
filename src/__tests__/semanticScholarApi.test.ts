/**
 * Unit Tests for Semantic Scholar API Service
 *
 * Tests the core functionality of the Semantic Scholar API integration:
 * - Paper search
 * - Citation fetching
 * - Reference fetching
 * - Network building
 * - Rate limiting
 * - Error handling
 */

import {
  searchPapers,
  getPaperDetails,
  getCitations,
  getReferences,
  getRecommendations,
  buildCitationNetwork,
  type Paper,
  type SearchOptions,
} from '../services/semanticScholarApi';

// Mock fetch globally
global.fetch = jest.fn();

describe('Semantic Scholar API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock environment variable
    process.env.SEMANTIC_SCHOLAR_API_KEY = 'test-api-key-12345';
  });

  afterEach(() => {
    // Clean up
    delete process.env.SEMANTIC_SCHOLAR_API_KEY;
  });

  describe('searchPapers', () => {
    it('should search for papers by query', async () => {
      const mockResponse = {
        total: 2,
        offset: 0,
        data: [
          {
            paperId: '649def34f8be52c8b66281af98ae884c09aef38b',
            title: 'CRISPR Gene Editing',
            abstract: 'A revolutionary gene editing technology',
            venue: 'Nature',
            year: 2020,
            citationCount: 500,
            authors: [
              { authorId: 'author1', name: 'John Doe' },
              { authorId: 'author2', name: 'Jane Smith' },
            ],
            url: 'https://www.semanticscholar.org/paper/649def34',
          },
          {
            paperId: 'abc123xyz',
            title: 'CRISPR Applications',
            abstract: 'Applications of CRISPR technology',
            venue: 'Science',
            year: 2021,
            citationCount: 300,
            authors: [{ authorId: 'author3', name: 'Alice Johnson' }],
            url: 'https://www.semanticscholar.org/paper/abc123',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const papers = await searchPapers('CRISPR', { maxResults: 2 });

      expect(papers).toHaveLength(2);
      expect(papers[0].title).toBe('CRISPR Gene Editing');
      expect(papers[0].authors).toEqual(['John Doe', 'Jane Smith']);
      expect(papers[0].citationCount).toBe(500);
      expect(papers[1].title).toBe('CRISPR Applications');
    });

    it('should handle empty search results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, offset: 0, data: [] }),
      });

      const papers = await searchPapers('NonexistentTopic12345');

      expect(papers).toHaveLength(0);
    });

    it('should apply search options correctly', async () => {
      const mockResponse = {
        total: 1,
        offset: 0,
        data: [
          {
            paperId: 'test123',
            title: 'Test Paper',
            year: 2023,
            citationCount: 100,
            authors: [],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const options: SearchOptions = {
        maxResults: 10,
        yearFrom: 2020,
        yearTo: 2024,
        venue: 'Nature',
      };

      await searchPapers('test query', options);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0] as string;

      expect(url).toContain('query=test+query');
      expect(url).toContain('limit=10');
      expect(url).toContain('year=2020-2024');
      expect(url).toContain('venue=Nature');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(searchPapers('test')).rejects.toThrow('Search failed: 500');
    });

    it('should retry on rate limit (429)', async () => {
      // First call: rate limited
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      // Second call: success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          data: [{ paperId: 'test', title: 'Test', authors: [] }],
        }),
      });

      const papers = await searchPapers('test');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(papers).toHaveLength(1);
    }, 10000); // Extended timeout for retry delays
  });

  describe('getPaperDetails', () => {
    it('should fetch paper details by ID', async () => {
      const mockPaper = {
        paperId: '649def34f8be52c8b66281af98ae884c09aef38b',
        title: 'Detailed Paper',
        abstract: 'Full abstract text here',
        venue: 'Nature Biotechnology',
        year: 2022,
        citationCount: 750,
        influentialCitationCount: 50,
        referenceCount: 45,
        authors: [
          { authorId: 'a1', name: 'Author One' },
          { authorId: 'a2', name: 'Author Two' },
        ],
        url: 'https://www.semanticscholar.org/paper/649def34',
        tldr: { text: 'Brief summary of the paper' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaper,
      });

      const paper = await getPaperDetails('649def34f8be52c8b66281af98ae884c09aef38b');

      expect(paper.id).toBe('649def34f8be52c8b66281af98ae884c09aef38b');
      expect(paper.title).toBe('Detailed Paper');
      expect(paper.influentialCitationCount).toBe(50);
      expect(paper.referenceCount).toBe(45);
      expect(paper.tldr).toBe('Brief summary of the paper');
    });

    it('should handle paper not found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Paper not found',
      });

      await expect(getPaperDetails('invalid-id')).rejects.toThrow(
        'Failed to get paper details: 404'
      );
    });
  });

  describe('getCitations', () => {
    it('should fetch papers citing the given paper', async () => {
      const mockResponse = {
        data: [
          {
            citingPaper: {
              paperId: 'citing1',
              title: 'Citing Paper 1',
              year: 2023,
              citationCount: 10,
              authors: [{ authorId: 'a1', name: 'Citer One' }],
            },
          },
          {
            citingPaper: {
              paperId: 'citing2',
              title: 'Citing Paper 2',
              year: 2024,
              citationCount: 5,
              authors: [{ authorId: 'a2', name: 'Citer Two' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const citations = await getCitations('origin-paper-id', 50);

      expect(citations).toHaveLength(2);
      expect(citations[0].title).toBe('Citing Paper 1');
      expect(citations[1].title).toBe('Citing Paper 2');
      expect(citations[0].year).toBe(2023);
    });

    it('should handle papers with no citations', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const citations = await getCitations('paper-with-no-citations');

      expect(citations).toHaveLength(0);
    });
  });

  describe('getReferences', () => {
    it('should fetch papers referenced by the given paper', async () => {
      const mockResponse = {
        data: [
          {
            citedPaper: {
              paperId: 'ref1',
              title: 'Referenced Paper 1',
              year: 2018,
              citationCount: 100,
              authors: [{ authorId: 'r1', name: 'Reference Author' }],
            },
          },
          {
            citedPaper: {
              paperId: 'ref2',
              title: 'Referenced Paper 2',
              year: 2019,
              citationCount: 80,
              authors: [{ authorId: 'r2', name: 'Another Ref Author' }],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const references = await getReferences('paper-id', 50);

      expect(references).toHaveLength(2);
      expect(references[0].title).toBe('Referenced Paper 1');
      expect(references[1].title).toBe('Referenced Paper 2');
    });

    it('should handle papers with no references', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const references = await getReferences('paper-with-no-refs');

      expect(references).toHaveLength(0);
    });
  });

  describe('getRecommendations', () => {
    it('should fetch recommended papers based on input paper', async () => {
      const mockResponse = {
        recommendedPapers: [
          {
            paperId: 'rec1',
            title: 'Recommended Paper 1',
            year: 2022,
            citationCount: 150,
            authors: [{ authorId: 'rec1', name: 'Recommender' }],
          },
          {
            paperId: 'rec2',
            title: 'Recommended Paper 2',
            year: 2023,
            citationCount: 90,
            authors: [{ authorId: 'rec2', name: 'Another Recommender' }],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const recommendations = await getRecommendations('paper-id', 10);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].title).toBe('Recommended Paper 1');
    });
  });

  describe('buildCitationNetwork', () => {
    it('should build complete citation network from paper ID', async () => {
      // Mock paper details
      const mockPaper = {
        paperId: 'origin123',
        title: 'Origin Paper',
        year: 2021,
        citationCount: 200,
        authors: [{ authorId: 'o1', name: 'Origin Author' }],
      };

      // Mock citations
      const mockCitations = {
        data: [
          {
            citingPaper: {
              paperId: 'cit1',
              title: 'Citing Paper',
              year: 2022,
              citationCount: 50,
              authors: [],
            },
          },
        ],
      };

      // Mock references
      const mockReferences = {
        data: [
          {
            citedPaper: {
              paperId: 'ref1',
              title: 'Referenced Paper',
              year: 2020,
              citationCount: 100,
              authors: [],
            },
          },
        ],
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPaper,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCitations,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockReferences,
        });

      const network = await buildCitationNetwork('origin123', 30, 30);

      expect(network.originPaper.title).toBe('Origin Paper');
      expect(network.citations).toHaveLength(1);
      expect(network.references).toHaveLength(1);
      expect(network.allPapers).toHaveLength(3); // origin + 1 citation + 1 reference
    });

    it('should build network from search query', async () => {
      // Mock search results
      const mockSearchResponse = {
        total: 1,
        data: [
          {
            paperId: 'search-result',
            title: 'Search Result Paper',
            year: 2021,
            citationCount: 300,
            authors: [],
          },
        ],
      };

      // Mock citations (empty)
      const mockCitations = { data: [] };

      // Mock references (empty)
      const mockReferences = { data: [] };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSearchResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCitations,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockReferences,
        });

      const network = await buildCitationNetwork('CRISPR gene editing', 30, 30);

      expect(network.originPaper.title).toBe('Search Result Paper');
      expect(network.citations).toHaveLength(0);
      expect(network.references).toHaveLength(0);
      expect(network.allPapers).toHaveLength(1);
    });

    it('should throw error if search query returns no results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total: 0, data: [] }),
      });

      await expect(buildCitationNetwork('NonexistentQuery98765')).rejects.toThrow(
        'No papers found for query'
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should queue requests to respect rate limit', async () => {
      const mockResponse = {
        total: 1,
        data: [{ paperId: 'test', title: 'Test', authors: [] }],
      };

      // Mock multiple successful responses
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const startTime = Date.now();

      // Make 3 requests in rapid succession
      await Promise.all([
        searchPapers('query1'),
        searchPapers('query2'),
        searchPapers('query3'),
      ]);

      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Should take at least 2 seconds (3 requests with 1 req/sec = 2 seconds between first and last)
      expect(elapsed).toBeGreaterThanOrEqual(2000);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }, 15000); // Extended timeout
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      await expect(searchPapers('test')).rejects.toThrow('Network error');
    });

    it('should handle missing API key', async () => {
      delete process.env.SEMANTIC_SCHOLAR_API_KEY;
      delete process.env.NEXT_PUBLIC_SEMANTIC_SCHOLAR_API_KEY;

      await expect(searchPapers('test')).rejects.toThrow(
        'Semantic Scholar API key is not configured'
      );
    });

    it('should retry on server errors (500)', async () => {
      // First attempt: 500 error
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      // Second attempt: success
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total: 1,
          data: [{ paperId: 'test', title: 'Test', authors: [] }],
        }),
      });

      const papers = await searchPapers('test');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(papers).toHaveLength(1);
    }, 10000);
  });

  describe('Data Transformation', () => {
    it('should handle papers with missing optional fields', async () => {
      const incompleteSearchResponse = {
        total: 1,
        data: [
          {
            paperId: 'incomplete',
            title: 'Incomplete Paper',
            // Missing: abstract, venue, year, citationCount, authors, url
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteSearchResponse,
      });

      const papers = await searchPapers('test');

      expect(papers[0].title).toBe('Incomplete Paper');
      expect(papers[0].authors).toEqual([]);
      expect(papers[0].year).toBe(0);
      expect(papers[0].citationCount).toBe(0);
      expect(papers[0].abstract).toBe('');
    });

    it('should use TL;DR as fallback for abstract', async () => {
      const mockResponse = {
        total: 1,
        data: [
          {
            paperId: 'test',
            title: 'Test Paper',
            tldr: { text: 'This is the TL;DR summary' },
            authors: [],
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const papers = await searchPapers('test');

      expect(papers[0].abstract).toBe('This is the TL;DR summary');
      expect(papers[0].tldr).toBe('This is the TL;DR summary');
    });

    it('should generate Semantic Scholar URL if URL is missing', async () => {
      const mockResponse = {
        total: 1,
        data: [
          {
            paperId: 'abc123xyz',
            title: 'No URL Paper',
            authors: [],
            // Missing url field
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const papers = await searchPapers('test');

      expect(papers[0].url).toBe('https://www.semanticscholar.org/paper/abc123xyz');
    });
  });
});
