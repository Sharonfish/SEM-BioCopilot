/**
 * Code Generation API - Generate code using OpenAI
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, currentCode, language, fileName, hasSelection, selectionRange } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt cannot be empty' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      // Mock response
      console.warn('OpenAI API key not configured, returning mock code')
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return NextResponse.json({
        code: generateMockCode(prompt, currentCode, language),
      })
    }

    // Build system prompt
    const systemPrompt = `You are an expert bioinformatics programmer. Generate high-quality ${language} code based on the user's request.

**Guidelines:**
1. Generate ONLY the code, no explanations or markdown
2. Follow best practices for ${language}
3. Include proper error handling
4. Add clear comments where needed
5. Optimize for bioinformatics workflows
6. If modifying existing code, maintain the same style

${hasSelection ? 
  `The user has selected specific lines (${selectionRange.startLine}-${selectionRange.endLine}). Modify only those lines while keeping the context.` : 
  `You are working with the entire file: ${fileName}. Generate the complete modified file.`
}`

    const userPrompt = hasSelection ?
      `Current code:\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nTask: ${prompt}\n\nGenerate the modified code:` :
      `File: ${fileName}\n\nCurrent code:\n\`\`\`${language}\n${currentCode}\n\`\`\`\n\nTask: ${prompt}\n\nGenerate the complete modified file:`

    // Helper function to call OpenAI with timeout
    const tryOpenAICall = async () => {
      // Call OpenAI API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Faster and cheaper than gpt-4
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.3
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('OpenAI API error:', response.status, errorData)
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
      }

      return response
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - OpenAI API took too long to respond')
      }
      throw error
    }
    }

    const response = await tryOpenAICall()
    const data = await response.json()
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid OpenAI response:', data)
      throw new Error('Invalid response from OpenAI API')
    }
    
    let code = data.choices[0].message.content.trim()

    // Clean up code (remove markdown code blocks if present)
    code = code.replace(/```[\w]*\n/g, '').replace(/```$/g, '').trim()

    return NextResponse.json({ code })
  } catch (error: any) {
    console.error('Code generation error:', error)
    
    const errorMessage = error.message || 'Failed to generate code'
    
    // Return specific error messages
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout. Please try again with a simpler prompt.' },
        { status: 504 }
      )
    }
    
    if (error.message?.includes('API error')) {
      return NextResponse.json(
        { error: 'OpenAI API error. Please check your API key and try again.' },
        { status: 502 }
      )
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

function generateMockCode(prompt: string, currentCode: string, language: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('error') || lowerPrompt.includes('exception')) {
    return `# Modified code with error handling
try:
${currentCode.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error occurred: {e}")
    raise

# Note: Connect OpenAI API key for real code generation`
  }
  
  if (lowerPrompt.includes('comment') || lowerPrompt.includes('docstring')) {
    return `"""
${prompt}

This code has been enhanced with documentation.
"""

${currentCode}

# Note: Connect OpenAI API key for intelligent code generation`
  }
  
  if (lowerPrompt.includes('optimize') || lowerPrompt.includes('improve')) {
    return `# Optimized version
# TODO: Implement optimization based on: ${prompt}

${currentCode}

# Note: Connect OpenAI API key for real optimization suggestions`
  }
  
  return `# Modified code based on: ${prompt}

${currentCode}

# Note: This is a mock response. Connect OpenAI API key for intelligent code generation.
# The AI will analyze your code and apply the requested changes automatically.`
}

