import React from 'react'
import { SuggestionBubbles, type Suggestion } from '../molecules'

export interface MainInterfaceProps {
  questionText?: string
  suggestions?: Suggestion[]
  onSuggestionClick?: (suggestion: Suggestion) => void
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export const MainInterface: React.FC<MainInterfaceProps> = ({
  questionText = "What can I help you with today?",
  suggestions = [
    { id: '1', text: 'Top relevant suggestions' },
    { id: '2', text: 'Top Some other suggestion relevant suggestions' },
    { id: '3', text: 'Third suggestion' }
  ],
  onSuggestionClick,
  className = "",
  style = {},
  children
}) => {
  return (
    <>
      {/* Gray greeting box */}
      <div style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
        <div
          style={{
            backgroundColor: '#F4F4F4',
            borderRadius: '12px',
            padding: '12px 24px 24px 24px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'left', marginTop: '20px' }}>
            <p
              style={{
                color: '#000000',
                fontSize: '15px',
                fontWeight: 600,
                margin: 0,
                marginBottom: '12px',
              }}
            >
              Hi There,
            </p>
            <p
              style={{
                color: '#000000',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                margin: 0,
              }}
            >
              I am Chat assistant. I am here to help you with whatever you need
            </p>
          </div>
        </div>
      </div>

      {/* Question and suggestions section - positioned together */}
      <div style={{ 
        position: 'absolute', 
        bottom: '70px', 
        left: '20px', 
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'flex-start'
      }}>
        {/* Question text at top */}
        <p
          style={{
            color: '#000000',
            fontSize: '14px',
            fontWeight: 400,
            margin: 0,
          }}
        >
          {questionText}
        </p>

        {/* Suggestions right below question */}
        {suggestions && suggestions.length > 0 && onSuggestionClick && (
          <SuggestionBubbles
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </div>

      {children}
    </>
  )
}