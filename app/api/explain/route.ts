/**
 * Code Explanation API using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, language, context } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code cannot be empty' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // If no API key, return mock explanation
      console.warn('OpenAI API key not configured, returning mock explanation')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json({
        explanation: generateMockExplanation(code, language),
      })
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert bioinformatics programmer. Explain code clearly and concisely, focusing on what it does, key concepts, and its relevance in bioinformatics workflows.',
          },
          {
            role: 'user',
            content: `Explain this ${language || 'code'} snippet in detail:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n${context ? `Context: ${context}` : ''}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const explanation = data.choices[0]?.message?.content || 'No explanation available'

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('Explanation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    )
  }
}

function generateMockExplanation(code: string, language?: string): string {
  const lines = code.trim().split('\n').length
  const hasImport = code.includes('import')
  const hasFunction = code.includes('def ') || code.includes('function ')
  const hasLoop = code.includes('for ') || code.includes('while ')
  
  let explanation = `**Code Analysis:**\n\n`
  explanation += `This ${language || 'code'} snippet contains ${lines} line${lines > 1 ? 's' : ''} of code.\n\n`
  
  if (hasImport) {
    explanation += `**Imports:** The code imports necessary libraries, which are fundamental dependencies for the functionality.\n\n`
  }
  
  if (hasFunction) {
    explanation += `**Functions:** This code defines or uses functions to organize logic into reusable blocks. Functions are essential for modular programming.\n\n`
  }
  
  if (hasLoop) {
    explanation += `**Iteration:** The code uses loops to process multiple items or perform repeated operations, which is common in data processing tasks.\n\n`
  }
  
  explanation += `**Key Concepts:**\n`
  explanation += `- Code organization and structure\n`
  explanation += `- Data processing patterns\n`
  explanation += `- Computational efficiency considerations\n\n`
  
  explanation += `**In Bioinformatics Context:**\n`
  explanation += `This type of code pattern is commonly used in data analysis pipelines for processing biological datasets, such as gene expression data or sequence information.\n\n`
  
  explanation += `*Note: This is a mock explanation. Connect OpenAI API key for detailed AI-powered explanations.*`
  
  return explanation
}

