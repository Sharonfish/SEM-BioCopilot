/**
 * Q&A Mode - Ask questions and get AI answers
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useCopilotModeStore } from '@/store/copilotModeStore'
import { QAMessage } from '@/types/copilotMode'

export function QAMode() {
  const { qaHistory, addQAMessage, clearQAHistory, loading, setLoading } = useCopilotModeStore()
  const [question, setQuestion] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [qaHistory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || loading) return

    const userMessage: QAMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    }

    addQAMessage(userMessage)
    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch('/api/copilot/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          history: qaHistory.slice(-5), // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const data = await response.json()
      
      const assistantMessage: QAMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      }

      addQAMessage(assistantMessage)
    } catch (error) {
      console.error('Q&A error:', error)
      const errorMessage: QAMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      addQAMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          Ask Questions
        </h3>
        {qaHistory.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearQAHistory}
            className="h-7"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {qaHistory.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-2">Ask me anything about bioinformatics!</p>
            <p className="text-xs">
              Try: "How does StandardScaler work?" or "Explain PCA"
            </p>
          </div>
        ) : (
          qaHistory.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 mt-1">
                  <Bot className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-60">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 mt-1">
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-2">
            <Bot className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <Spinner size="sm" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!question.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

