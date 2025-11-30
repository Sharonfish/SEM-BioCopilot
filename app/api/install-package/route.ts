/**
 * Package Installation API - Install Python packages via pip
 */

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { packageName, version } = await request.json()

    if (!packageName) {
      return NextResponse.json(
        { error: 'Package name is required' },
        { status: 400 }
      )
    }

    const pythonCommand = process.env.PYTHON_COMMAND || 'python3'
    const pipCommand = process.env.PIP_COMMAND || `${pythonCommand} -m pip`
    
    // Build pip install command
    const installCommand = version 
      ? `${pipCommand} install ${packageName}==${version}`
      : `${pipCommand} install ${packageName}`

    // Execute pip install with timeout (60 seconds for package installation)
    const timeout = 60000

    try {
      const { stdout, stderr } = await Promise.race([
        execAsync(installCommand, {
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        }),
        new Promise<{ stdout: string; stderr: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Installation timeout')), timeout)
        ),
      ]) as { stdout: string; stderr: string }

      const executionTime = (Date.now() - startTime) / 1000

      return NextResponse.json({
        success: true,
        packageName,
        output: {
          stdout: stdout || '',
          stderr: stderr || '',
        },
        executionTime: parseFloat(executionTime.toFixed(2)),
        message: `Successfully installed ${packageName}`,
      })
    } catch (execError: any) {
      const executionTime = (Date.now() - startTime) / 1000
      
      if (execError.message === 'Installation timeout') {
        return NextResponse.json(
          {
            success: false,
            error: 'Package installation timed out (60 seconds limit)',
            executionTime: parseFloat(executionTime.toFixed(2)),
          },
          { status: 408 }
        )
      }

      const errorOutput = execError.stderr || execError.message || 'Unknown installation error'
      
      return NextResponse.json(
        {
          success: false,
          error: errorOutput,
          output: {
            stdout: execError.stdout || '',
            stderr: errorOutput,
          },
          executionTime: parseFloat(executionTime.toFixed(2)),
        },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Package installation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Package installation failed'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        executionTime: (Date.now() - startTime) / 1000,
      },
      { status: 500 }
    )
  }
}

