/**
 * IDE 顶部工具栏
 */

'use client'

import { Play, Square, Search, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tooltip } from '@/components/ui/Tooltip'

interface TopBarProps {
  projectName?: string
  onRun?: () => void
  onStop?: () => void
  isRunning?: boolean
}

export function TopBar({ projectName = 'BioCopilot', onRun, onStop, isRunning }: TopBarProps) {
  const router = useRouter()

  const handleCitationNetworkClick = () => {
    router.push('/citation-network')
  }

  return (
    <div className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      {/* Left - Logo and Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BC</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{projectName}</span>
        </div>
        
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
        
        {/* Run Control Buttons */}
        <div className="flex items-center gap-2">
          <Tooltip content={isRunning ? 'Stop Execution' : 'Run Code'}>
            {isRunning ? (
              <Button size="sm" variant="danger" onClick={onStop}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <Button size="sm" onClick={onRun}>
                <Play className="h-4 w-4 mr-2" />
                Run
              </Button>
            )}
          </Tooltip>
          
          {/* Citation Network Button */}
          <Tooltip content="Citation Network Visualization">
            <button
              onClick={handleCitationNetworkClick}
              className="citation-network-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <circle cx="6" cy="6" r="2" />
                <circle cx="18" cy="6" r="2" />
                <circle cx="6" cy="18" r="2" />
                <circle cx="18" cy="18" r="2" />
                <line x1="12" y1="9" x2="6" y2="8" />
                <line x1="12" y1="9" x2="18" y2="8" />
                <line x1="12" y1="15" x2="6" y2="16" />
                <line x1="12" y1="15" x2="18" y2="16" />
              </svg>
              <span>Citation Network</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Center - Search Bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files, commands..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Right - Settings and Controls */}
      <div className="flex items-center gap-2">
        <Tooltip content="Settings">
          <Button size="icon" variant="ghost">
            <Settings className="h-5 w-5" />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

