# Apify Google Scholar API Setup Guide

## Quick Start

### 1. Get Your Apify API Token

1. Go to [Apify Console](https://console.apify.com/)
2. Sign up or log in to your account
3. Navigate to **Settings** → **Integrations**
4. Copy your **API Token**

### 2. Configure Environment Variables

Edit the `.env.local` file in your project root and replace `your_apify_token_here` with your actual token:

```env
NEXT_PUBLIC_APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxx
VITE_APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxx
```

**Important:** Never commit `.env.local` to git (it's already in `.gitignore`)

### 3. Test the Integration

#### Option A: Using the Test Page (Recommended)

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/test-apify
   ```

3. Enter a search query (e.g., "machine learning") and click **Search**

4. Wait 10-30 seconds for results to appear

#### Option B: Using the Test Script

Run the standalone test script:
```bash
npx ts-node src/test/testApifyApi.ts
```

Or add a test script to `package.json`:
```json
{
  "scripts": {
    "test:apify": "ts-node src/test/testApifyApi.ts"
  }
}
```

Then run:
```bash
npm run test:apify
```

## Usage in Your Code

```typescript
import { searchPapers } from '@/services/apifyScholarApi';

// Simple search
const papers = await searchPapers('CRISPR gene editing');

// With options
const papers = await searchPapers('machine learning genomics', {
  maxResults: 20
});

// Display results
papers.forEach(paper => {
  console.log(`${paper.title} (${paper.year})`);
  console.log(`Authors: ${paper.authors.join(', ')}`);
  console.log(`Citations: ${paper.citationCount}`);
  console.log(`URL: ${paper.url}`);
});
```

## API Functions

### `searchPapers(query, options?)`
Complete search operation (recommended for most use cases)
- Starts scraping, polls for completion, returns results
- Returns: `Promise<Paper[]>`

### `startScholarSearch(query, options?)`
Starts a new scraping run
- Returns: `Promise<{ runId: string, datasetId: string }>`

### `getRunStatus(runId)`
Checks the status of a running scraper
- Returns: `Promise<string>` ("RUNNING", "SUCCEEDED", "FAILED", etc.)

### `getDatasetItems(datasetId)`
Retrieves scraped data
- Returns: `Promise<Paper[]>`

## Paper Interface

```typescript
interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citationCount: number;
  url: string;
  abstract: string;
  source: string;
}
```

## Troubleshooting

### "API token is not configured"
- Make sure `.env.local` exists in your project root
- Verify the token is set: `NEXT_PUBLIC_APIFY_API_TOKEN=your_token`
- Restart your development server after changing `.env.local`

### "Search timed out"
- The default timeout is 30 seconds
- Google Scholar scraping can take 10-30 seconds
- Try reducing `maxResults` for faster responses

### "API rate limit exceeded"
- Check your Apify account credits
- The scraper automatically retries with exponential backoff
- Consider adding delays between multiple searches

### No results returned
- Check that the search query is valid
- Some queries may return 0 results from Google Scholar
- Check browser console for detailed error messages

## Files Created

- `src/services/apifyScholarApi.ts` - Main API service
- `src/app/test-apify/page.tsx` - Visual test page
- `src/test/testApifyApi.ts` - Command-line test script
- `.env.local` - Environment configuration (git-ignored)

## Next Steps

1. Integrate `searchPapers()` into your Bio copilot UI
2. Add error handling for user-facing components
3. Consider adding loading states and progress indicators
4. Cache results to avoid redundant API calls
5. Add pagination for large result sets
