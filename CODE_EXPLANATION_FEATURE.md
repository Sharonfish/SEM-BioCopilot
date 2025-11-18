# Code Explanation Feature 🤖

## Overview

BioCopilot now includes an AI-powered code explanation feature that allows you to select any portion of code in the editor and get detailed explanations powered by OpenAI's GPT-4.

## Features

### ✨ Key Capabilities

1. **Text Selection Detection**
   - Automatically detects when you select code in the editor
   - Shows a floating "Explain" button near your selection

2. **AI-Powered Explanations**
   - Connects to OpenAI GPT-4 for intelligent code analysis
   - Provides context-aware explanations specific to bioinformatics
   - Explains both the code functionality and relevant concepts

3. **Smart Presentation**
   - Displays explanation in a floating panel below the selected code
   - Supports markdown formatting (bold, bullets, etc.)
   - Copy explanation to clipboard with one click
   - Clean, easy-to-read interface

4. **Mock Mode**
   - Works without OpenAI API key (returns mock explanations)
   - Perfect for testing and development

## Usage

### How to Use

1. **Select Code**
   - Open any file in the IDE
   - Use your mouse to select any portion of code

2. **Click Explain**
   - A floating "Explain" button will appear near your selection
   - Click it to request an explanation

3. **View Explanation**
   - A panel will appear below the selected code
   - Wait for the AI to analyze and explain (usually 1-3 seconds)
   - Read the detailed explanation

4. **Actions**
   - **Copy**: Click the copy icon to copy the explanation
   - **Close**: Click the X button to dismiss the panel

### Example Workflow

```python
# 1. Select this code snippet
def preprocess_data(df):
    df = df.dropna()
    scaler = StandardScaler()
    return scaler.fit_transform(df)

# 2. Click "Explain" button
# 3. Get detailed explanation about:
#    - What the function does
#    - StandardScaler concept
#    - Importance of data preprocessing
#    - Relevance in bioinformatics
```

## Setup

### Option 1: With OpenAI API (Recommended)

1. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key

2. **Configure Environment**
   ```bash
   # Copy the example env file
   cp .env.example .env.local
   
   # Edit .env.local and add your API key
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

### Option 2: Mock Mode (No API Key Needed)

If you don't provide an OpenAI API key, the feature will work in mock mode:
- Returns a basic code analysis
- Still provides useful information about code structure
- No external API calls
- Great for development and testing

## Technical Implementation

### Architecture

```
User selects code
    ↓
Monaco Editor detects selection
    ↓
ExplainButton component appears
    ↓
User clicks Explain
    ↓
API call to /api/explain
    ↓
OpenAI GPT-4 analysis
    ↓
ExplanationPanel displays result
```

### Components Created

1. **`app/api/explain/route.ts`**
   - API endpoint for code explanation
   - Handles OpenAI integration
   - Provides mock fallback

2. **`components/ide/Editor/ExplainButton.tsx`**
   - Floating button that appears on selection
   - Positioned dynamically near selected text

3. **`components/ide/Editor/ExplanationPanel.tsx`**
   - Panel to display explanation results
   - Supports markdown formatting
   - Includes copy and close actions

4. **`components/ide/Editor/CodeEditor.tsx` (Enhanced)**
   - Selection detection via Monaco Editor events
   - Position calculation for floating UI
   - State management for explanation flow

### Key Technologies

- **Monaco Editor**: VSCode's editor for selection detection
- **OpenAI GPT-4**: AI model for code explanation
- **React State**: Managing UI state and loading
- **Next.js API Routes**: Backend endpoint
- **Tailwind CSS**: Styling for components

## API Details

### Endpoint: `POST /api/explain`

**Request Body:**
```json
{
  "code": "selected code snippet",
  "language": "python",
  "context": "From file: preprocess.py"
}
```

**Response:**
```json
{
  "explanation": "Detailed explanation text..."
}
```

**Error Response:**
```json
{
  "error": "Failed to generate explanation"
}
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for GPT-4 access |
| `NEXT_PUBLIC_API_URL` | No | API base URL (defaults to `/api`) |

### OpenAI Settings

In `app/api/explain/route.ts`, you can customize:

- **Model**: `gpt-4` (default) or `gpt-3.5-turbo`
- **Temperature**: `0.7` (creativity level)
- **Max Tokens**: `500` (response length)
- **System Prompt**: Customize for different contexts

```typescript
{
  model: 'gpt-4',           // or 'gpt-3.5-turbo'
  temperature: 0.7,         // 0.0 - 2.0
  max_tokens: 500,          // response length
}
```

## Cost Considerations

### OpenAI API Pricing (as of 2024)

- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **GPT-3.5-Turbo**: ~$0.001 per 1K tokens (much cheaper)

### Tips to Reduce Costs

1. Use GPT-3.5-Turbo for simpler explanations
2. Set reasonable max_tokens limits
3. Cache common explanations
4. Use mock mode during development

## Troubleshooting

### Issue: Button doesn't appear

**Solution:**
- Make sure you're selecting actual text (not just clicking)
- Try selecting at least one full line of code

### Issue: "Failed to generate explanation"

**Possible causes:**
1. No OpenAI API key configured → Use mock mode
2. Invalid API key → Check your `.env.local` file
3. Network issues → Check your internet connection
4. API rate limits → Wait a few minutes and try again

### Issue: Explanation is cut off

**Solution:**
- Increase `max_tokens` in `app/api/explain/route.ts`
- Default is 500, try 1000 for longer explanations

### Issue: Slow response time

**Possible causes:**
1. Using GPT-4 (slower but better) → Try GPT-3.5-Turbo
2. Network latency → Check your connection
3. Selected too much code → Select smaller snippets

## Future Enhancements

Potential improvements for this feature:

- [ ] Caching frequently explained code patterns
- [ ] Support for multiple AI providers (Claude, etc.)
- [ ] Explanation history/favorites
- [ ] Inline annotations instead of panel
- [ ] Batch explanation for multiple selections
- [ ] Context-aware explanations based on file type
- [ ] Integration with documentation lookup
- [ ] Custom prompts for different use cases

## Examples

### Example 1: Import Statement

**Selected Code:**
```python
import pandas as pd
import numpy as np
```

**Explanation:**
> This code imports two fundamental libraries for data science:
> - **pandas (pd)**: Provides DataFrame structures for tabular data manipulation
> - **numpy (np)**: Offers efficient numerical computing capabilities
> 
> In bioinformatics, these are essential for handling gene expression matrices, sequence data, and statistical analyses.

### Example 2: Data Preprocessing

**Selected Code:**
```python
scaler = StandardScaler()
df[expression_cols] = scaler.fit_transform(df[expression_cols])
```

**Explanation:**
> This code performs **feature scaling** on expression data:
> 
> 1. **StandardScaler**: Transforms data to have mean=0 and std=1
> 2. **fit_transform**: Learns statistics and applies transformation
> 
> **Why it matters**: Gene expression values vary widely in scale. Standardization ensures no single gene dominates ML models due to its magnitude alone. Critical for PCA, clustering, and neural networks.

## Support

For issues or questions:
- Check this documentation
- Review the code in `components/ide/Editor/`
- See the API implementation in `app/api/explain/`

---

**Enjoy intelligent code explanations! 🚀**

