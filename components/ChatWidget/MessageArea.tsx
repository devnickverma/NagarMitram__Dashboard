'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface MessageAreaProps {
  messages: Message[]
  className?: string
}

export const MessageArea: React.FC<MessageAreaProps> = ({ messages, className = '' }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div
      className={`message-area flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 ${className}`}
      style={{
        maxWidth: '400px',
        width: '100%'
      }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
        {messages.map((message) => (
        <div 
          key={message.id} 
          className={`flex w-full ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className="flex flex-col space-y-1 max-w-[70%] min-w-0">
            {/* Message bubble */}
            <div 
              className={`px-3 py-2 rounded-lg overflow-hidden ${
                message.sender === 'user' 
                  ? 'text-gray-900' 
                  : 'bg-gray-100 border border-gray-200 text-gray-900'
              }`}
              style={{
                backgroundColor: message.sender === 'user' ? '#b0d1c7' : undefined,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto'
              }}
            >
              {message.text === '...' ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : message.sender === 'bot' ? (
                <div className="text-sm markdown-content">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm" style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  margin: 0
                }}>{message.text}</p>
              )}
            </div>
            {/* Timestamp */}
            <span 
              className={`text-xs text-gray-500 ${
                message.sender === 'user' ? 'text-right mr-2' : 'ml-2'
              }`}
            >
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}