/**
 * Q&A API - Answer questions using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question, history } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question cannot be empty' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Mock response
      console.warn('OpenAI API key not configured, returning mock answer')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json({
        answer: generateMockAnswer(question),
      })
    }

    // Build messages array with history
    const messages = [
      {
        role: 'system',
        content: 'You are an expert bioinformatics assistant. Answer questions clearly and concisely, focusing on practical applications in bioinformatics and computational biology. Provide code examples when relevant.',
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: question,
      },
    ]

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const answer = data.choices[0]?.message?.content || 'I could not generate an answer.'

    return NextResponse.json({ answer })
  } catch (error) {
    console.error('Q&A error:', error)
    return NextResponse.json(
      { error: 'Failed to generate answer' },
      { status: 500 }
    )
  }
}

function generateMockAnswer(question: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('standardscaler') || lowerQuestion.includes('scaling')) {
    return `StandardScaler is a preprocessing technique that standardizes features by removing the mean and scaling to unit variance.

**How it works:**
1. Calculates mean (μ) and standard deviation (σ) for each feature
2. Transforms each value: x' = (x - μ) / σ
3. Results in data with mean=0 and std=1

**Why use it in bioinformatics:**
- Gene expression values vary widely in magnitude
- Prevents features with large values from dominating ML models
- Essential for PCA, clustering, and neural networks

**Example:**
\`\`\`python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
scaled_data = scaler.fit_transform(expression_data)
\`\`\`

*Note: Connect OpenAI API key for more detailed answers.*`
  }
  
  if (lowerQuestion.includes('pca') || lowerQuestion.includes('principal component')) {
    return `Principal Component Analysis (PCA) is a dimensionality reduction technique that transforms data into a new coordinate system.

**Key Concepts:**
- Finds directions (principal components) of maximum variance
- First PC captures most variance, second PC is orthogonal and captures next most
- Reduces dimensions while preserving information

**In Bioinformatics:**
- Visualize high-dimensional gene expression data
- Identify major patterns in datasets
- Remove noise and correlated features

**When to use:**
- You have too many features (genes)
- Want to visualize complex data in 2D/3D
- Need to remove redundancy

*Note: Connect OpenAI API key for more detailed answers.*`
  }
  
  return `I understand you're asking about: "${question}"

This is a mock response since no OpenAI API key is configured. 

**To get real AI-powered answers:**
1. Get an API key from OpenAI
2. Add it to your \`.env.local\` file:
   \`OPENAI_API_KEY=sk-your-key-here\`
3. Restart the development server

In the meantime, I can still help with common bioinformatics questions! Try asking about:
- StandardScaler and data preprocessing
- PCA and dimensionality reduction
- Common Python libraries (pandas, scikit-learn)

*Note: Connect OpenAI API key for detailed answers.*`
}

