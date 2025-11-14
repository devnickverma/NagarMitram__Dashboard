'use client'

import React from 'react'

interface Suggestion {
  id: string
  text: string
}

interface CustomMainInterfaceProps {
  questionText?: string
  suggestions?: Suggestion[]
  onSuggestionClick?: (suggestion: Suggestion) => void
}

export const CustomMainInterface: React.FC<CustomMainInterfaceProps> = ({
  questionText = "How can I help you manage your admin panel today?",
  suggestions = [],
  onSuggestionClick
}) => {
  return (
    <div 
      className="p-4 h-full flex flex-col overflow-y-auto"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Greeting Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="space-y-2">
          <p className="text-gray-900 font-medium text-sm">
            Hi There 👋
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            I'm Mitram. I'm here to help you with civic issue management, analytics, and reports.
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-gray-800 text-sm font-medium">
          {questionText}
        </p>
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="w-full text-left p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            {suggestion.text}
          </button>
        ))}
      </div>
    </div>
  )
}