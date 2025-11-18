/**
 * Floating Explain Button - appears when code is selected
 */

'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ExplainButtonProps {
  onClick: () => void
  position: { top: number; left: number }
}

export function ExplainButton({ onClick, position }: ExplainButtonProps) {
  return (
    <div
      className="absolute z-40 animate-in fade-in duration-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        size="sm"
        onClick={onClick}
        className="shadow-lg"
      >
        <Sparkles className="h-3 w-3 mr-1" />
        Explain
      </Button>
    </div>
  )
}

