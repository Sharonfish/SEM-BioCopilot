/**
 * 代码执行 API
 */

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let tempFile: string | null = null

  try {
    const { code, language } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code cannot be empty' },
        { status: 400 }
      )
    }

    // Only support Python for now
    if (language !== 'python') {
      return NextResponse.json(
        { error: `Language ${language} is not supported. Only Python is currently supported.` },
        { status: 400 }
      )
    }

    // Detect pip install commands and handle them automatically
    const codeLines = code.trim().split('\n').map(line => line.trim())
    const pipInstallPattern = /^pip\s+install\s+(.+)/i
    
    for (const line of codeLines) {
      const pipMatch = line.match(pipInstallPattern)
      if (pipMatch) {
        // Extract package name (handle version specifiers)
        const packageSpec = pipMatch[1].trim()
        const packageMatch = packageSpec.match(/^([a-zA-Z0-9_-]+)(.*)$/)
        
        if (packageMatch) {
          const packageName = packageMatch[1]
          const versionSpec = packageMatch[2].trim()
          
          // Execute pip install
          const pythonCommand = process.env.PYTHON_COMMAND || 'python3'
          const pipCommand = `${pythonCommand} -m pip install ${packageSpec}`
          
          try {
            const { stdout, stderr } = await Promise.race([
              execAsync(pipCommand, {
                encoding: 'utf-8',
                maxBuffer: 10 * 1024 * 1024,
              }),
              new Promise<{ stdout: string; stderr: string }>((_, reject) =>
                setTimeout(() => reject(new Error('Installation timeout')), 60000)
              ),
            ]) as { stdout: string; stderr: string }

            return NextResponse.json({
              success: true,
              output: {
                stdout: `✓ Successfully installed ${packageName}\n${stdout || ''}`,
                stderr: stderr || '',
              },
              executionTime: (Date.now() - startTime) / 1000,
              message: `Package ${packageName} installed successfully`,
            })
          } catch (installError: any) {
            const errorOutput = installError.stderr || installError.message || 'Installation failed'
            return NextResponse.json(
              {
                success: false,
                error: `Failed to install ${packageName}: ${errorOutput}`,
                output: {
                  stdout: installError.stdout || '',
                  stderr: errorOutput,
                },
                executionTime: (Date.now() - startTime) / 1000,
              },
              { status: 200 }
            )
          }
        }
      }
    }

    // Create a temporary Python file
    const tempDir = tmpdir()
    tempFile = join(tempDir, `biocopilot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`)
    
    // Write code to temporary file
    await writeFile(tempFile, code, 'utf-8')

    // Execute Python code with timeout (10 seconds)
    const timeout = 10000
    const pythonCommand = process.env.PYTHON_COMMAND || 'python3'
    
    try {
      const { stdout, stderr } = await Promise.race([
        execAsync(`${pythonCommand} "${tempFile}"`, {
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        }),
        new Promise<{ stdout: string; stderr: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Execution timeout')), timeout)
        ),
      ]) as { stdout: string; stderr: string }

      const executionTime = (Date.now() - startTime) / 1000

      // Try to extract data shape from output (if pandas DataFrame is printed)
      let dataShape = undefined
      const shapeMatch = stdout.match(/\((\d+),\s*(\d+)\)/)
      if (shapeMatch) {
        dataShape = {
          rows: parseInt(shapeMatch[1]),
          cols: parseInt(shapeMatch[2]),
        }
      }

      const result = {
        success: true,
        output: {
          stdout: stdout || '',
          stderr: stderr || '',
        },
        executionTime: parseFloat(executionTime.toFixed(2)),
        dataShape,
      }

      return NextResponse.json(result)
    } catch (execError: any) {
      const executionTime = (Date.now() - startTime) / 1000
      
      // Handle execution errors
      if (execError.message === 'Execution timeout') {
        return NextResponse.json(
          {
            success: false,
            error: 'Code execution timed out (10 seconds limit)',
            executionTime: parseFloat(executionTime.toFixed(2)),
          },
          { status: 408 }
        )
      }

      // Python execution error
      let errorOutput = execError.stderr || execError.message || 'Unknown execution error'
      
      // Enhance error messages for common issues
      if (errorOutput.includes('ModuleNotFoundError') || errorOutput.includes('No module named')) {
        const moduleMatch = errorOutput.match(/No module named ['"]([^'"]+)['"]/)
        if (moduleMatch) {
          const moduleName = moduleMatch[1]
          errorOutput += `\n\n💡 Missing module detected: ${moduleName}\nYou can install it by running:\n   pip install ${moduleName}\n\nOr type "pip install ${moduleName}" in the editor and run it.`
        }
      }
      
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
        { status: 200 } // Return 200 but with success: false
      )
    }
  } catch (error) {
    console.error('Execution error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Code execution failed'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        executionTime: (Date.now() - startTime) / 1000,
      },
      { status: 500 }
    )
  } finally {
    // Clean up temporary file
    if (tempFile) {
      try {
        await unlink(tempFile)
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError)
      }
    }
  }
}

