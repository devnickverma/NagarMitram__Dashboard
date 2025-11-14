import React from 'react'

export interface Suggestion {
  id: string
  text: string
}

export interface SuggestionBubblesProps {
  suggestions: Suggestion[]
  onSuggestionClick: (suggestion: Suggestion) => void
  className?: string
  style?: React.CSSProperties
}

export const SuggestionBubbles: React.FC<SuggestionBubblesProps> = ({
  suggestions,
  onSuggestionClick,
  className = "",
  style = {}
}) => {
  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-start',
        ...style
      }}
      className={className}
    >
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSuggestionClick(suggestion)}
          style={{
            backgroundColor: '#F0F0FB',
            border: '1px solid transparent',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#000000',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border 0.2s ease',
            width: 'fit-content',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.border = '1px solid #000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.border = '1px solid transparent'
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid #000000'
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid transparent'
          }}
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  )
}