/**
 * API 客户端工具
 */

export interface ExecuteCodeRequest {
  code: string
  language: string
  context?: any
}

export interface ExecuteCodeResponse {
  success: boolean
  output?: {
    stdout: string
    stderr: string
  }
  error?: string
  executionTime?: number
  dataShape?: {
    rows: number
    cols: number
  }
}

export interface SuggestRequest {
  context: any
  code: string
}

export interface SuggestResponse {
  suggestions: any[]
}

class APIClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  async executeCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
    const response = await fetch(`${this.baseURL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Execution failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getSuggestions(request: SuggestRequest): Promise<SuggestResponse> {
    const response = await fetch(`${this.baseURL}/copilot/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Failed to get suggestions: ${response.statusText}`)
    }

    return response.json()
  }

  async installPackage(packageName: string, version?: string): Promise<{ success: boolean; error?: string; output?: any; message?: string }> {
    const response = await fetch(`${this.baseURL}/install-package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packageName, version }),
    })

    if (!response.ok) {
      throw new Error(`Failed to install package: ${response.statusText}`)
    }

    return response.json()
  }
}

export const apiClient = new APIClient()

