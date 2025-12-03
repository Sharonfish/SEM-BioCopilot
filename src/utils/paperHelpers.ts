/**
 * Paper Formatting Utilities
 *
 * Helper functions for formatting paper data in the UI.
 *
 * @module utils/paperHelpers
 */

import type { Paper, Citation } from '@/types/citationNetwork';

/**
 * Format a large number with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Get the last name from a full author name
 */
export function getLastName(authorName: string): string {
  if (!authorName) return 'Unknown';
  const parts = authorName.trim().split(' ');
  return parts[parts.length - 1];
}

/**
 * Format authors list for display
 *
 * @param authors - Array of author names
 * @param maxAuthors - Maximum number of authors to show
 * @returns Formatted author string
 */
export function formatAuthors(authors: string[], maxAuthors = 3): string {
  if (authors.length === 0) return 'Unknown authors';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;

  if (authors.length <= maxAuthors) {
    const lastAuthor = authors[authors.length - 1];
    const otherAuthors = authors.slice(0, -1).join(', ');
    return `${otherAuthors}, and ${lastAuthor}`;
  }

  return `${authors.slice(0, maxAuthors).join(', ')}, et al.`;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get the number of connections for a paper in the graph
 */
export function getConnectionCount(paperId: string, citations: Citation[]): number {
  return citations.filter(
    (c) => c.sourceId === paperId || c.targetId === paperId
  ).length;
}

/**
 * Calculate citation trend (simplified - would need historical data for real implementation)
 */
export function calculateCitationTrend(
  paper: Paper
): 'up' | 'down' | 'stable' {
  // Simplified: newer papers with many citations are trending up
  const currentYear = new Date().getFullYear();
  const paperAge = currentYear - paper.year;

  if (paperAge < 3 && paper.citationCount > 100) return 'up';
  if (paperAge > 10 && paper.citationCount < 100) return 'down';
  return 'stable';
}

/**
 * Sort papers by different criteria
 */
export function sortPapers(
  papers: Paper[],
  sortBy: 'relevance' | 'citations' | 'year'
): Paper[] {
  const sorted = [...papers];

  switch (sortBy) {
    case 'citations':
      return sorted.sort((a, b) => b.citationCount - a.citationCount);
    case 'year':
      return sorted.sort((a, b) => b.year - a.year);
    case 'relevance':
    default:
      // Keep original order (assumes API returns by relevance)
      return sorted;
  }
}

/**
 * Filter papers by search query
 */
export function filterPapersBySearch(papers: Paper[], query: string): Paper[] {
  if (!query.trim()) return papers;

  const lowerQuery = query.toLowerCase();
  return papers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(lowerQuery) ||
      paper.authors.some((author) => author.toLowerCase().includes(lowerQuery)) ||
      paper.abstract.toLowerCase().includes(lowerQuery)
  );
}
