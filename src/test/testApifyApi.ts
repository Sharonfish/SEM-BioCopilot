/**
 * Test file for Apify Scholar API
 *
 * Run this file to test the integration with Apify's Google Scholar scraper.
 * Make sure VITE_APIFY_API_TOKEN is set in your .env file before running.
 */

import { searchPapers } from '../services/apifyScholarApi';

/**
 * Main test function
 */
async function test() {
  try {
    console.log('===========================================');
    console.log('Testing Apify Scholar API...');
    console.log('===========================================\n');

    // Test query
    const query = 'machine learning';
    console.log(`Search query: "${query}"\n`);

    // Perform search
    const papers = await searchPapers(query, { maxResults: 5 });

    // Display results
    console.log('\n===========================================');
    console.log(`✓ SUCCESS: Found ${papers.length} papers`);
    console.log('===========================================\n');

    if (papers.length > 0) {
      console.log('First paper details:');
      console.log('-------------------------------------------');
      console.log(`Title: ${papers[0].title}`);
      console.log(`Authors: ${papers[0].authors.join(', ')}`);
      console.log(`Year: ${papers[0].year}`);
      console.log(`Citations: ${papers[0].citationCount}`);
      console.log(`URL: ${papers[0].url}`);
      console.log(`Abstract: ${papers[0].abstract.substring(0, 200)}...`);
      console.log(`Source: ${papers[0].source}`);
      console.log('-------------------------------------------\n');

      console.log('All paper titles:');
      papers.forEach((paper, index) => {
        console.log(`${index + 1}. ${paper.title} (${paper.year}) - ${paper.citationCount} citations`);
      });
    }

    console.log('\n✓ Test completed successfully!\n');
  } catch (error) {
    console.error('\n===========================================');
    console.error('✗ Test failed!');
    console.error('===========================================');
    console.error('Error:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check that VITE_APIFY_API_TOKEN is set in your .env file');
    console.error('2. Verify your Apify account has credits available');
    console.error('3. Ensure you have internet connectivity');
    console.error('4. Check the Apify actor ID is correct\n');
  }
}

// Run the test
test();
