import React from 'react'

export interface MessageBubbleProps {
  message: string
  isUser: boolean
  timestamp?: Date
  isLoading?: boolean
  className?: string
  style?: React.CSSProperties
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isUser,
  isLoading = false,
  className = "",
  style = {}
}) => {
  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '10px',
        paddingLeft: '16px',
        paddingRight: '16px',
        ...style
      }}>
      <div
        style={{
          maxWidth: '70%',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: isUser ? '#f4f4f4' : 'transparent',
          color: '#000000',
          fontSize: '14px',
          lineHeight: '1.4',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto'
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : (
          <span>{message}</span>
        )}
      </div>
    </div>
  )
}